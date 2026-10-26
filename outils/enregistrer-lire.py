#!/usr/bin/env python3
"""Enregistre les voix de « J'apprends à lire » (lire/sons/).
Les sons qu'on fait durer (mmm, sss…) sont fabriqués directement à partir des phonèmes.
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-lire.py"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer, voix  # noqa: E402
from piper import SynthesisConfig  # noqa: E402

SONS = os.path.join(RACINE, "lire", "sons")
VOIX = "siwis"  # la voix la plus claire (jessica mangeait le début des mots)

def depuis_phonemes(ph, sortie, lent=1.6):
    v = voix(VOIX)
    ids = v.phonemes_to_ids(list(ph))
    a = np.asarray(v.phoneme_ids_to_audio(ids, SynthesisConfig(speaker_id=None, length_scale=lent))).flatten()
    if a.dtype != np.int16: a = (np.clip(a, -1, 1) * 32767).astype(np.int16)
    with tempfile.TemporaryDirectory() as tmp:
        brut = os.path.join(tmp, "b.wav")
        with wave.open(brut, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(v.config.sample_rate); w.writeframes(a.tobytes())
        # un peu plus fort, avec un peu d'air avant et après
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", brut, "-af", "volume=1.6,adelay=150,apad=pad_dur=0.25",
                        "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame", "-q:a", "6", sortie], check=True)

def main():
    code = "global.window={};require(%s);process.stdout.write(JSON.stringify(window.LIRE))" % json.dumps(os.path.join(RACINE, "lire", "donnees.js"))
    D = json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, text=True).stdout)
    textes, phon = {}, {}
    def t(nom, texte, vit=.8): textes[nom] = (texte, vit)
    for k, v in D["voix"].items():
        for x in (v if isinstance(v, list) else [v]): t("v-" + slug(x), x, .9)
    for x in D["voyelles"]:
        t("l-" + slug(x["l"]) + ("-e" if x["l"] == "é" else ""), x["dit"] + ".", .75)
        t("c-" + slug(x["mot"]), "comme " + x["mot"] + " !", .85)
    for x in D["chantantes"]:
        phon["l-" + slug(x["l"])] = x["ph"]
        t("c-" + slug(x["mot"]), "comme " + x["mot"] + " !", .85)
    for x in D["fusions"]:
        phon["f-" + slug(x["s"])] = x["ph"]
        t("s-" + slug(x["s"]), x["s"] + ".", .75)
    for g in D["syllabes"]:
        for s in g: t("s-" + slug(s), s + ".", .75)
    for w in D["mots"]:
        t("m-" + slug(w["m"]), w["m"] + ".", .8)
        for (e, d) in w["s"]: t("s-" + slug(d), d + ".", .75)
    for p in D["phrases"]:
        t("p-" + slug(p["p"]), p["p"], .85)
        for mot in re.findall(r"[\wÀ-ÿ']+", p["p"]): t("w-" + slug(mot), mot + ".", .8)
    n = 0
    for nom, (texte, vit) in sorted(textes.items()):
        s = os.path.join(SONS, nom + ".mp3")
        if not os.path.exists(s): enregistrer(texte, VOIX, vit, s); n += 1
    for nom, ph in sorted(phon.items()):
        s = os.path.join(SONS, nom + ".mp3")
        if not os.path.exists(s): depuis_phonemes(ph, s); n += 1
    print("%d nouveaux enregistrements, %d au total" % (n, len(textes) + len(phon)))

if __name__ == "__main__":
    main()
