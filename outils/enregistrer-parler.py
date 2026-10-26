#!/usr/bin/env python3
"""Enregistre les voix du jeu « Je répète » (parler/sons/).
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-parler.py"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

SONS = os.path.join(RACINE, "parler", "sons")
VOIX = "jessica+2"

def charger():
    code = "global.window={};require(%s);process.stdout.write(JSON.stringify({m:window.MOTS,p:window.PHRASES_PARLER}))" % json.dumps(os.path.join(RACINE, "parler", "mots.js"))
    return json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, text=True).stdout)

def main():
    d = charger(); a_faire = {}
    for k, v in d["p"].items():
        for t in (v if isinstance(v, list) else [v]):
            a_faire["p-" + slug(t)] = (t, .85)
    for niv, liste in d["m"].items():
        for w in liste:
            a_faire["c-" + slug(w["m"])] = ("Regarde ! C'est " + w["c"] + " !", .82)
            a_faire["m-" + slug(w["m"])] = (w["m"] + ".", .6)
            for (ecrit, dit) in w.get("s") or []:
                a_faire["s-" + slug(dit)] = (dit + ".", .55)
    n = 0
    for nom, (texte, v) in sorted(a_faire.items()):
        sortie = os.path.join(SONS, nom + ".mp3")
        if os.path.exists(sortie): continue
        enregistrer(texte, VOIX, v, sortie); n += 1
    print("%d nouveaux enregistrements, %d au total" % (n, len(a_faire)))

if __name__ == "__main__":
    main()
