"""Pour chaque son voulu : fabrique plusieurs versions (voix, vitesse, écriture), les fait écouter par Whisper,
et garde la meilleure dont la transcription a EXACTEMENT les bons sons. Usage : python3 choisir.py taches.json sortie.json"""
import sys, os, json, re, tempfile, subprocess, unicodedata
sys.path.insert(0, "/home/claude/jeux-enfants/outils"); sys.path.insert(0, "/tmp/claude-0/juge")
import voix_piper as vp
vp.MODELES.update({"tom": ("vits-piper-fr_FR-tom-medium/fr_FR-tom-medium", None, 1.0),
                   "gilles": ("vits-piper-fr_FR-gilles-low/fr_FR-gilles-low", None, 1.0)})
from juge import transcrire
from piper import PiperVoice
_pv = PiperVoice.load("/tmp/claude-0/tts/vits-piper-fr_FR-siwis-medium/fr_FR-siwis-medium.onnx")
EQ = {"ɔ": "o", "ɛ": "e", "ɑ": "a", "ɐ": "a", "œ": "ø", "ə": "ø", "ɡ": "g", "ɜ": "ø"}
def sons(texte):
    ph = [p for ph in _pv.phonemize(texte) for p in ph]
    return "".join(EQ.get(p, p) for p in ph if p not in "ˈˌː.,!?;:-'\" ")
CHIFFRES = {"2": "deux", "1": "un", "10": "dix", "100": "cent"}
def normal(t):
    t = t.strip().lower()
    t = re.sub(r"[«»\"“”.,!?…]", " ", t).strip()
    return CHIFFRES.get(t, t)
AVANT = "/tmp/claude-0/juge/avant.mp3"
if not os.path.exists(AVANT): vp.enregistrer("Je dis :", "siwis", .95, AVANT)
def ecouter(f):
    t = normal(transcrire(f, AVANT))
    t = re.sub(r"^(jeudi|je\s*dis|j\W?dis)\s*:?\s*", "", t).strip()
    return t
def main():
    taches = json.load(open(sys.argv[1])); sortie = sys.argv[2]
    res = json.load(open(sortie)) if os.path.exists(sortie) else {}
    tmp = "/tmp/claude-0/juge/sons"; os.makedirs(tmp, exist_ok=True)
    for nom, t in taches.items():
        if nom in res: continue
        cible = t["cible"]; essais = []; trouve = False
        for vx in t.get("voix", ["siwis", "tom", "miro", "jessica"]):
            if trouve: break
            for texte in t["textes"]:
                if trouve: break
                for vit in t.get("vitesses", [.9]):
                    f = os.path.join(tmp, "%s_%s_%d_%s.mp3" % (nom, vx, t["textes"].index(texte), vit))
                    try: vp.enregistrer(texte, vx, vit, f)
                    except Exception as e: continue
                    tr = ecouter(f)
                    ok = sons(tr) == cible if tr else False
                    essais.append({"voix": vx, "texte": texte, "vitesse": vit, "entendu": tr, "ok": ok, "f": f})
                    if ok: trouve = True; break
        bons = [e for e in essais if e["ok"]]
        # préférence : siwis d'abord (même voix que le reste du jeu), puis dans l'ordre des essais
        choix = bons[0] if bons else None
        res[nom] = {"cible": cible, "choix": choix, "essais": essais}
        print(nom, cible, "→", (choix["voix"] + " « " + choix["texte"] + " » entendu « " + choix["entendu"] + " »") if choix else "AUCUN : " + " | ".join(e["entendu"] for e in essais[:8]), flush=True)
        json.dump(res, open(sortie, "w"), ensure_ascii=False, indent=1)
if __name__ == "__main__": main()
