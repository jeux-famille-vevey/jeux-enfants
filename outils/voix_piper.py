"""Voix Piper partagées par les scripts d'enregistrement (histoires, coin des petits)."""
import os, re, subprocess, tempfile, unicodedata, wave

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
VOIX_DIR = os.environ.get("VOIX_DIR", "/tmp/claude-0/tts")

MODELES = {
    "jessica": ("vits-piper-fr_FR-upmc-medium/fr_FR-upmc-medium", 0, 1.0),
    "pierre": ("vits-piper-fr_FR-upmc-medium/fr_FR-upmc-medium", 1, 1.0),
    "siwis": ("vits-piper-fr_FR-siwis-medium/fr_FR-siwis-medium", None, 1.0),
    "miro": ("vits-piper-fr_FR-miro-high/fr_FR-miro-high", None, 0.82),  # cette voix parle trop lentement d'origine
}

def slug(mot):
    """Même règle que dans histoires/index.html (fonction slug)."""
    s = unicodedata.normalize("NFD", mot.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


_charges = {}


def voix(nom):
    from piper import PiperVoice
    chemin = MODELES[nom][0]
    if chemin not in _charges:
        _charges[chemin] = PiperVoice.load(os.path.join(VOIX_DIR, chemin + ".onnx"))
    return _charges[chemin]


def enregistrer(texte, vx, vitesse, sortie):
    """vx : "siwis+3" = voix siwis, 3 demi-tons plus haut. vitesse : 1 = normale, plus petit = plus lent."""
    from piper import SynthesisConfig
    m = re.match(r"([a-z]+)([+-]\d+)?$", vx)
    nom, demi = m.group(1), int(m.group(2) or 0)
    _, locuteur, base = MODELES[nom]
    with tempfile.TemporaryDirectory() as tmp:
        brut = os.path.join(tmp, "brut.wav")
        with wave.open(brut, "wb") as w:
            voix(nom).synthesize_wav(texte, w, syn_config=SynthesisConfig(speaker_id=locuteur, length_scale=base / vitesse))
        filtres = []
        if demi:
            filtres.append("rubberband=pitch=%.5f" % (2 ** (demi / 12)))
        # enlever le silence au début et à la fin, puis un petit souffle avant
        filtres += ["silenceremove=start_periods=1:start_threshold=-50dB", "areverse",
                    "silenceremove=start_periods=1:start_threshold=-50dB", "areverse", "adelay=60"]
        os.makedirs(os.path.dirname(sortie), exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", brut, "-af", ",".join(filtres),
                        "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame", "-q:a", "6", sortie], check=True)


