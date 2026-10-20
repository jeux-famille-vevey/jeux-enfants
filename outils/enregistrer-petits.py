#!/usr/bin/env python3
"""Enregistre toutes les phrases du coin des petits (petits/sons/<phrase>.mp3).

Les listes (animaux, couleurs, lettres…) sont lues directement dans petits/index.html,
les modèles de phrases ci-dessous doivent suivre ceux du jeu.
Si une phrase manque, le jeu se rabat sur la voix de l'appareil (rien ne casse).

Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-petits.py
"""
import json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

PAGE = os.path.join(RACINE, "petits", "index.html")
SONS = os.path.join(RACINE, "petits", "sons")
VOIX, VITESSE = "jessica+2", 0.88  # une voix douce, un peu plus aiguë, posée

ENUMERER = r"""
%s
var P = [];
function ajoute(t){ P.push(t); }
BRAVO.forEach(ajoute); ajoute("Essaie encore !"); ajoute("Bravo ! Tu as gagné !");
// memory
ANIMAUX.forEach(function(a){ ajoute(a[1]); }); ajoute("Retrouve les paires d'animaux !");
// couleurs et formes
Object.keys(FORMES).forEach(function(f){
  var art = FORMES[f].f ? "l'" : "le ";
  ajoute("Touche " + art + f + " !");
  COULEURS.forEach(function(c){ ajoute("Touche " + art + f + " " + (FORMES[f].f ? c[1] : c[0]) + " !"); });
});
COULEURS.forEach(function(c){ ajoute("Touche le " + c[0] + " !"); });
// compter
for(var n = 1; n <= 10; n++) ajoute(NOMBRES[n]);
OBJETS.forEach(function(o){ ajoute("Combien de " + o[1] + " ? Touche-les pour compter !"); ajoute(o[2] + " !");
  for(var n = 2; n <= 10; n++) ajoute(NOMBRES[n] + " " + o[1] + " !"); });
// lettres
LETTRES.concat(VOYELLES).forEach(function(c){ ajoute("Trouve la lettre… " + c.toLowerCase() + " !");
  LETTRES.concat(VOYELLES).forEach(function(l){ if(l !== c) ajoute("Ça, c'est le " + l.toLowerCase() + ". Trouve le " + c.toLowerCase() + " !"); }); });
// ombres
OMBRES.forEach(function(o){ ajoute("Trouve l'ombre " + deNom(o[1]) + " !"); });
// parking
COULEURS.forEach(function(c){ ajoute("La voiture " + c[1] + " veut se garer. Touche la place " + c[1] + " !"); });
ajoute("Compte les points sur la voiture, et gare-la à la bonne place !");
for(var n = 1; n <= 9; n++) ajoute("La voiture numéro " + n + " veut se garer. Touche la place " + n + " !");
// la course
VEHICULES.forEach(function(v){ ajoute("C'est parti avec " + v.nom + " !"); });
ajoute("Choisis ton véhicule !"); ajoute("Touche à gauche ou à droite pour changer de route, et ramasse les étoiles !");
for(var n = 11; n <= 80; n++) ajoute(String(n));
ajoute("Oh ! Aucune étoile cette fois. On réessaie ?"); ajoute("Bravo ! Tu as ramassé une étoile !");
for(var n = 2; n <= 80; n++) ajoute("Bravo ! Tu as ramassé " + n + " étoiles !");
process.stdout.write(JSON.stringify(P));
"""


def phrases():
    html = open(PAGE, encoding="utf-8").read()
    morceaux = []
    for nom in ["BRAVO", "ANIMAUX", "COULEURS", "FORMES", "OBJETS", "NOMBRES", "VOYELLES", "LETTRES", "OMBRES", "VEHICULES"]:
        m = re.search(r"var %s = .*?;\s*$" % nom, html, re.S | re.M)
        if not m:
            sys.exit("Liste %s introuvable dans petits/index.html" % nom)
        morceaux.append(m.group(0))
    m = re.search(r"function deNom\(n\)\{.*?\}\n", html)
    morceaux.append(m.group(0))
    code = ENUMERER % "\n".join(morceaux)
    return list(dict.fromkeys(json.loads(subprocess.run(["node", "-e", code], check=True, capture_output=True, text=True).stdout)))


def main():
    P = phrases()
    fait_path = os.path.join(SONS, "textes.json")
    deja = json.load(open(fait_path)) if os.path.exists(fait_path) else {}
    a_faire = {}
    for t in P:
        a_faire.setdefault(slug(t) + ".mp3", t)
    nouveaux = 0
    for chemin, texte in sorted(a_faire.items()):
        # les mots seuls et phrases très courtes : plus lentement, sinon ils passent trop vite pour un petit
        vitesse = 0.62 if len(texte.split()) <= 1 else 0.72 if len(texte.split()) <= 3 else VITESSE
        cle = "%s|%s|%s" % (texte, VOIX, vitesse)
        sortie = os.path.join(SONS, chemin)
        if deja.get(chemin) == cle and os.path.exists(sortie):
            continue
        # « le e », « le a » : on fait dire la lettre telle qu'on la nomme
        dit = re.sub(r"\ble ([a-z])\b", lambda m: "le " + m.group(1).upper(), texte)
        dit = re.sub(r"lettre… ([a-z]) !", lambda m: "lettre… " + m.group(1).upper() + " !", dit)
        enregistrer(dit, VOIX, vitesse, sortie)
        deja[chemin] = cle
        nouveaux += 1
    for chemin in list(deja):
        if chemin not in a_faire:
            try:
                os.remove(os.path.join(SONS, chemin))
            except OSError:
                pass
            del deja[chemin]
    json.dump(deja, open(fait_path, "w"), ensure_ascii=False, indent=0, sort_keys=True)
    print("%d nouveaux enregistrements, %d phrases au total" % (nouveaux, len(a_faire)))


if __name__ == "__main__":
    sys.exit(main())
