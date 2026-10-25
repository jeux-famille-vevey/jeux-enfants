#!/usr/bin/env python3
"""Enregistre les voix du Toboggan des Nuages (toboggan/sons/).
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-toboggan.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

SONS = os.path.join(RACINE, "toboggan", "sons")
PHRASES = ["Trois", "Deux", "Un", "C'est parti !", "La forêt enchantée !", "Le royaume des glaces !", "Le pays des bonbons !",
           "Le volcan de feu !", "Le voyage dans les étoiles !", "Waouh !", "Super !", "Bravo !", "Aïe !", "Monde terminé !",
           "Nouveau monde débloqué !", "Tu as fini tous les mondes ! Tu es un champion !"]
for t in PHRASES:
    sortie = os.path.join(SONS, slug(t) + ".mp3")
    if not os.path.exists(sortie):
        enregistrer(t, "jessica+2", .95 if len(t.split()) > 2 else .75, sortie)
        print("enregistré", t)
