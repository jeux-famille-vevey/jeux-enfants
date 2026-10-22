#!/usr/bin/env python3
"""Enregistre la voix du présentateur de Super Course 3D (course3d/sons/).
Usage : VOIX_DIR=/chemin/vers/voix python3 outils/enregistrer-course.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from voix_piper import RACINE, slug, enregistrer  # noqa: E402

SONS = os.path.join(RACINE, "course3d", "sons")
PHRASES = ["Trois", "Deux", "Un", "Partez !", "Dernier tour !", "Turbo !", "Bravo ! Tu as gagné !",
           "Bien joué ! Tu es sur le podium !", "Course terminée ! Bravo !"]
for t in PHRASES:
    sortie = os.path.join(SONS, slug(t) + ".mp3")
    if not os.path.exists(sortie):
        enregistrer(t + ("." if t[-1] not in "!." else ""), "miro", 1.05 if len(t.split()) > 1 else .8, sortie)
        print("enregistré", t)
