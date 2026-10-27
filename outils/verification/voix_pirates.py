import sys, os, re, shutil, unicodedata
sys.path.insert(0, "/home/claude/jeux-enfants/outils"); sys.path.insert(0, "/tmp/claude-0/juge")
import voix_piper as vp
vp.MODELES.update({"tom": ("vits-piper-fr_FR-tom-medium/fr_FR-tom-medium", None, 1.0)})
from juge import transcrire
PH = {"bienvenue": "Ohé, moussaillon ! Trouve les six trésors cachés sur l'île !",
      "tresors-caches": "Des trésors sont cachés dans ce monde. Trouve-les tous !",
      "ton-monde": "Bienvenue dans ton monde, capitaine !",
      "tresor": "Un trésor !",
      "capitaine": "Tu es le capitaine du bateau !",
      "approche": "Approche-toi de la plage pour descendre.",
      "bravo": "Bravo ! Tu as trouvé tous les trésors, capitaine !"}
def norm(t):
    t = unicodedata.normalize("NFD", t.lower()); t = "".join(c for c in t if not unicodedata.combining(c))
    t = t.replace("6", "six")
    return re.sub(r"[^a-z]+", " ", t).split()
for nom, txt in PH.items():
    ok = False
    for vx, vit in [("tom", .9), ("tom", .85), ("tom", 1.0)]:
        f = "/tmp/claude-0/juge/p_%s.mp3" % nom; vp.enregistrer(txt, vx, vit, f)
        e = transcrire(f); a, b = norm(txt), norm(e)
        # mots attendus retrouvés (ordre libre), on tolère « ahoy » mal écrit
        manque = [w for w in a if w not in b ]
        print(nom, vx, vit, "→", e, "| manque :", manque, flush=True)
        if not manque: shutil.copy(f, "/home/claude/jeux-enfants/pirates/sons/%s.mp3" % nom); ok = True; break
    if not ok: print("!!! PAS VÉRIFIÉ :", nom)
