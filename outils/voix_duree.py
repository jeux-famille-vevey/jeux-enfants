"""Voix siwis avec une durée réglable pour CHAQUE son (phonème).

Pourquoi : pour apprendre à lire, il faut des sons « tenus » (sssss, mmmmm) SANS voyelle après.
Une voix normale lit « s » comme « esse » ou « sa ». Ici on modifie le modèle de la voix pour
qu'il accepte une durée par phonème : on peut alors lui demander « s » × 25 tout seul.

Le modèle modifié est fabriqué automatiquement (dans VOIX_DIR/duree/) à partir du modèle siwis.
"""
import json, os, subprocess, tempfile, wave
import numpy as np

VOIX_DIR = os.environ.get("VOIX_DIR", "/tmp/claude-0/tts")
BASE = os.path.join(VOIX_DIR, "vits-piper-fr_FR-siwis-medium", "fr_FR-siwis-medium.onnx")
MODIFIE = os.path.join(VOIX_DIR, "duree", "siwis-duree.onnx")

_sess = None
_cfg = None


def _modele():
    """Ajoute une entrée « dur_scale » qui multiplie la durée prévue de chaque phonème."""
    if os.path.exists(MODIFIE):
        return MODIFIE
    import onnx
    from onnx import helper, TensorProto
    m = onnx.load(BASE)
    g = m.graph
    ceil = [n for n in g.node if n.name == "/Ceil"][0]   # durées arrondies, juste avant l'alignement
    g.input.append(helper.make_tensor_value_info("dur_scale", TensorProto.FLOAT, [1, 1, "T"]))
    mul = helper.make_node("Mul", [ceil.input[0], "dur_scale"], ["dur_scaled"], name="dur_mul")
    ceil.input[0] = "dur_scaled"
    g.node.insert(list(g.node).index(ceil), mul)
    os.makedirs(os.path.dirname(MODIFIE), exist_ok=True)
    onnx.save(m, MODIFIE)
    return MODIFIE


def _session():
    global _sess, _cfg
    if _sess is None:
        import onnxruntime as ort
        _cfg = json.load(open(BASE + ".json"))
        _sess = ort.InferenceSession(_modele())
    return _sess, _cfg


def synth(seq, vitesse=1.0):
    """seq : liste de (phonème, facteur de durée). Renvoie (audio float, fréquence)."""
    sess, cfg = _session()
    table = cfg["phoneme_id_map"]
    ids, fac = [], []

    def ajoute(p, f):
        for i in table[p]:
            ids.append(i)
            fac.append(f)
    ajoute("^", 1)
    for p, f in seq:
        ajoute(p, f)
        ajoute("_", 1)
    ajoute("$", 1)
    # bruit faible et durées stables : le même son à chaque fois
    out = sess.run(None, {
        "input": np.array([ids], dtype=np.int64),
        "input_lengths": np.array([len(ids)], dtype=np.int64),
        "scales": np.array([0.4, 1.0 / vitesse, 0.3], dtype=np.float32),
        "dur_scale": np.array([[fac]], dtype=np.float32)})[0]
    return out.squeeze(), cfg["audio"]["sample_rate"]


def silence(sec, sr):
    return np.zeros(int(sec * sr), dtype=np.float32)


def phonemes(texte):
    """Les phonèmes que la voix utiliserait pour ce texte (sans ponctuation)."""
    from piper import PiperVoice
    global _piper
    try:
        _piper
    except NameError:
        _piper = PiperVoice.load(BASE)
    ph = [p for phrase in _piper.phonemize(texte) for p in phrase]
    return [p for p in ph if p not in ".,!?;:-' "]


def enregistrer_morceaux(morceaux, sortie):
    """morceaux : liste de seq (voir synth) ou de nombres (= silence en secondes). Écrit un MP3."""
    sr = None
    parts = []
    for m in morceaux:
        if isinstance(m, (int, float)):
            parts.append(("s", m))
        else:
            a, sr = synth(m)
            parts.append(("a", a))
    audio = np.concatenate([silence(p[1], sr) if p[0] == "s" else p[1] for p in parts])
    audio = audio / max(1e-6, np.abs(audio).max()) * 0.9
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with tempfile.TemporaryDirectory() as tmp:
        brut = os.path.join(tmp, "b.wav")
        with wave.open(brut, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(pcm.tobytes())
        os.makedirs(os.path.dirname(sortie), exist_ok=True)
        # douce montée et descente (pas de « clic »), un peu d'air avant et après
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", brut, "-af",
                        "afade=t=in:d=0.04,areverse,afade=t=in:d=0.08,areverse,adelay=150,apad=pad_dur=0.25",
                        "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame", "-q:a", "6", sortie], check=True)
