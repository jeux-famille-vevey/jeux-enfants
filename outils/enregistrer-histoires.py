#!/usr/bin/env python3
"""Enregistre la voix des histoires en fichiers MP3 (histoires/sons/).

Ainsi l'ordinateur ou la tablette n'a plus besoin de fabriquer la voix lui-même :
il joue simplement les enregistrements (rapide, même sur un vieil iMac).

Besoins : pip install piper-tts ; ffmpeg ; les voix Piper (dossier VOIX_DIR) :
  vits-piper-fr_FR-upmc-medium  (jessica, pierre)   CC BY-SA 4.0
  vits-piper-fr_FR-siwis-medium (siwis)             CC BY 4.0
  vits-piper-fr_FR-miro-high    (miro)              CC BY-NC-SA 4.0
  téléchargées depuis https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models

Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-histoires.py
Seuls les textes nouveaux ou modifiés sont réenregistrés (voir histoires/sons/textes.json).
"""
import json, os, re, subprocess, sys, tempfile, unicodedata, wave

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

SONS = os.path.join(RACINE, "histoires", "sons")

PHRASES = {  # phrases fixes du lecteur (mêmes clés que dans histoires/index.html)
    "ecoute": "J'écoute l'histoire.",
    "lis": "Je lis tout seul. Touche un mot pour l'entendre.",
    "bravo": "Bravo !",
    "encore": "Essaie encore !",
    "bravo-fin": "Bravo ! Tu as bien écouté l'histoire !",
}


def propre(texte):
    """Le texte tel qu'il est lu (sans les guillemets « »)."""
    return re.sub(r"\s+", " ", texte.replace("«", "").replace("»", "")).strip()


def mot_parle(m):
    return re.sub(r"[«»!?.,…:;\"]", "", m)


def charger_livres():
    code = "global.window={};require(%s);process.stdout.write(JSON.stringify(window.LIVRES))" % json.dumps(os.path.join(RACINE, "histoires", "livres.js"))
    return json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, text=True).stdout)


def main():
    livres = charger_livres()
    fait_path = os.path.join(SONS, "textes.json")
    deja = json.load(open(fait_path)) if os.path.exists(fait_path) else {}
    a_faire = {}  # chemin relatif -> (texte, voix, vitesse)

    for k, t in PHRASES.items():
        a_faire["commun/%s.mp3" % k] = (t, "jessica", 0.9)
    mots = {}
    for L in livres:
        narr = L["persos"]["narr"]
        a_faire["%s/titre.mp3" % L["id"]] = (L["titre"], narr["vx"], narr["v"])
        for p, page in enumerate(L["pages"]):
            for i, (qui, texte) in enumerate(page["l"]):
                perso = L["persos"].get(qui, narr)
                a_faire["%s/p%d-%d.mp3" % (L["id"], p, i)] = (propre(texte), perso["vx"], perso["v"])
                for m in texte.split():
                    w = mot_parle(m)
                    if slug(w):
                        mots.setdefault(slug(w), w)
        for q, Q in enumerate(L["quiz"]):
            a_faire["%s/q%d.mp3" % (L["id"], q)] = (Q["q"], narr["vx"], narr["v"])
    for s, w in mots.items():
        a_faire["mots/%s.mp3" % s] = (w, "jessica", 0.62)  # un mot seul : lentement

    nouveaux = 0
    for chemin, (texte, vx, vitesse) in sorted(a_faire.items()):
        cle = "%s|%s|%s" % (texte, vx, vitesse)
        sortie = os.path.join(SONS, chemin)
        if deja.get(chemin) == cle and os.path.exists(sortie):
            continue
        enregistrer(texte, vx, vitesse, sortie)
        deja[chemin] = cle
        nouveaux += 1
        print("enregistré", chemin, "←", texte[:50])
    # enlever les enregistrements qui ne servent plus
    for chemin in list(deja):
        if chemin not in a_faire:
            try:
                os.remove(os.path.join(SONS, chemin))
            except OSError:
                pass
            del deja[chemin]
    json.dump(deja, open(fait_path, "w"), ensure_ascii=False, indent=0, sort_keys=True)
    print("%d nouveaux enregistrements, %d au total" % (nouveaux, len(a_faire)))


if __name__ == "__main__":
    sys.exit(main())
