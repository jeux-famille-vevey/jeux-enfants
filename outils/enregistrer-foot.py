#!/usr/bin/env python3
"""Enregistre la voix du commentateur de Super Foot 3D (foot3d/sons/).
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-foot.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

SONS = os.path.join(RACINE, "foot3d", "sons")
PHRASES = ["Coup d'envoi !", "But !", "Quel but !", "Dommage !", "Arrêt du gardien !", "Fin du match !",
           "Victoire !", "Match nul !", "Dommage ! On fera mieux la prochaine fois !"]
for t in PHRASES:
    sortie = os.path.join(SONS, slug(t) + ".mp3")
    if not os.path.exists(sortie):
        enregistrer(t, "miro", 1.1 if len(t.split()) > 2 else .85, sortie)
        print("enregistré", t)
