#!/usr/bin/env python3
"""Enregistre les voix de « J'apprends à lire » (lire/sons/).
Les sons qu'on fait durer (mmm, sss…) sont fabriqués directement à partir des phonèmes.
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-lire.py"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402
from voix_duree import enregistrer_morceaux, phonemes  # noqa: E402

SONS = os.path.join(RACINE, "lire", "sons")
VOIX = "siwis"  # la voix la plus claire (jessica mangeait le début des mots)

# Les sons qu'on fait durer (mmmm, ssss), les voyelles seules et les syllabes sont fabriqués son par son
# avec voix_duree : une voix normale lit « s » comme « sa » et un « i » tout seul comme « aïe ».
V_PH = {"a": "a", "e": "ə", "i": "i", "o": "o", "u": "y", "é": "e"}
C_PH = {"m": "m", "l": "l", "s": "s", "r": "ʁ", "f": "f", "n": "n", "ch": "ʃ", "v": "v"}

VOYELLES = "aeiouyəɛɔøœɑɐ"
# Les syllabes sont écrites son par son à partir de l'orthographe (la voix lisait « to » comme « tou »).
CONS = {"ch": "ʃ", "p": "p", "b": "b", "d": "d", "t": "t", "m": "m", "n": "n", "l": "l", "v": "v", "f": "f", "r": "ʁ",
        "s": "s", "j": "ʒ", "k": "k", "c": "k", "g": "ɡ", "z": "z"}
VOY = {"oui": ["w", "i"], "ou": ["u"], "a": ["a"], "e": ["ə"], "é": ["e"], "è": ["ɛ"], "i": ["i"], "o": ["o"], "ô": ["o"], "u": ["y"]}

def voyelle(v, duree):
    # une voyelle tenue longtemps glisse vers « eu » : on la tient avec « ː » (allongement) au lieu de l'étirer
    return [("ˈ", 1), (v, min(duree, 2.5))] + ([("ː", duree - 2.5)] if duree > 2.5 else [])

def syllabe_ecrite(texte, duree=1.6):
    seq, i = [], 0
    while i < len(texte):
        for g in sorted(list(CONS) + list(VOY), key=len, reverse=True):
            if texte.startswith(g, i):
                if g in CONS: seq.append((CONS[g], 1))
                else:
                    ph = VOY[g]
                    seq += [(p, 1) for p in ph[:-1]] + voyelle(ph[-1], duree)
                i += len(g); break
        else:
            raise ValueError("syllabe inconnue : " + texte)
    return seq

def syllabe(texte, voyelle_longue=1.5):
    """Pour les petits mots (a, un, va…) : les sons donnés par la voix, l'accent juste devant la voyelle
    (devant une consonne, la voix ajouterait un « e » : « esss »)."""
    seq, accent = [], False
    for p in phonemes(texte):
        if p == "ˈ": continue
        if p in VOYELLES and not accent: seq.append(("ˈ", 1)); accent = True
        seq.append((p, voyelle_longue if p in VOYELLES else 1))
    return seq

def main():
    code = "global.window={};require(%s);process.stdout.write(JSON.stringify(window.LIRE))" % json.dumps(os.path.join(RACINE, "lire", "donnees.js"))
    D = json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, text=True).stdout)
    textes, phon = {}, {}   # phon : nom -> liste de morceaux pour voix_duree
    def t(nom, texte, vit=.8): textes[nom] = (texte, vit)
    for k, v in D["voix"].items():
        for x in (v if isinstance(v, list) else [v]): t("v-" + slug(x), x, .9)
    for x in D["voyelles"]:
        phon["l-" + slug(x["l"]) + ("-e" if x["l"] == "é" else "")] = [voyelle(V_PH[x["l"]], 8)]
        t("c-" + slug(x["mot"]), "comme " + x["mot"] + " !", .85)
    for x in D["chantantes"]:
        phon["l-" + slug(x["l"])] = [[(C_PH[x["l"]], 25)]]
        t("c-" + slug(x["mot"]), "comme " + x["mot"] + " !", .85)
    for x in D["fusions"]:
        c, v = C_PH[x["c"]], V_PH[x["v"]]
        # (le jeu colle lui-même : son tenu + voyelle + syllabe ; plus de fichier f-)
        phon["s-" + slug(x["s"])] = [syllabe_ecrite(x["s"])]
    for g in D["syllabes"]:
        for s in g: phon["s-" + slug(s)] = [syllabe_ecrite(s)]
    for w in D["mots"]:
        t("m-" + slug(w["m"]), w["m"] + ".", .8)
        for (e, d) in w["s"]: phon["s-" + slug(d)] = [syllabe_ecrite(d)]
    for p in D["phrases"]:
        t("p-" + slug(p["p"]), p["p"], .85)
        for mot in re.findall(r"[\wÀ-ÿ']+", p["p"]):
            # les tout petits mots (a, un, va…) : son par son, sinon la voix les déforme
            if len(phonemes(mot)) <= 3: phon["w-" + slug(mot)] = [syllabe(mot, 1.3)]
            else: t("w-" + slug(mot), mot + ".", .8)
    n = 0
    for nom, (texte, vit) in sorted(textes.items()):
        s = os.path.join(SONS, nom + ".mp3")
        if not os.path.exists(s): enregistrer(texte, VOIX, vit, s); n += 1
    for nom, ph in sorted(phon.items()):
        s = os.path.join(SONS, nom + ".mp3")
        if not os.path.exists(s): enregistrer_morceaux(ph, s); n += 1
    print("%d nouveaux enregistrements, %d au total" % (n, len(textes) + len(phon)))

if __name__ == "__main__":
    main()
