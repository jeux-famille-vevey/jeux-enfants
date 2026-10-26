# Jeux des enfants

Petits jeux éducatifs en français, sans publicité ni compte.

- `commun/` : moteur commun (niveaux, étoiles, explications, questions ratées reposées) et contenu de chaque jeu (`commun/jeux/`)
- Clavier : `fusees/` (étape 1), `doigts/` (étape 2)
- Français (7P) : `homophones/`, `conjugaison/`, `pluriels/`, `dictee/`
- Maths : `calcul/`, `heure/`, `sous/`
- Le monde : `cantons/` (carte : swiss-maps, licence BSD-3)
- Langues : `anglais/` (7P, 1re année), `allemand/` (orthographe suisse)
- `defi/` : défi du jour (10 questions de toutes les matières)
- `petits/` : le coin des petits (3-5 ans, tablette) : memory, couleurs, compter, lettres, ombres, course, parking. Les phrases sont enregistrées dans `petits/sons/` : après avoir changé une phrase ou une liste, lancer `outils/enregistrer-petits.py`.
- `histoires/` : livres illustrés à écouter ou lire (`livres.js` contient les histoires). Les voix sont enregistrées dans `histoires/sons/` : après avoir ajouté ou modifié une histoire, lancer `outils/enregistrer-histoires.py`.
- `dactylo/` : le Coin dactylo, dactylo avancée pour adultes avec profils (prénom, nom, mot de passe) ; résultats gardés sur l'appareil, mot de passe jamais stocké en clair
- `commun/voix.js` : voix naturelle Piper (fr_FR-siwis-medium) calculée dans le navigateur, téléchargée une fois puis gardée sur l'appareil ; sinon, meilleure voix du navigateur. `commun/piper/` : moteur (licences dans LICENCES.txt)
- `course3d/` : Super Course 3D, course de voitures et motos en 3D (Three.js, dans `course3d/lib/`). Voix du présentateur : `outils/enregistrer-course.py`.
- `foot3d/` : Super Foot 3D, match à 3 contre 3 en 3D (même Three.js, manettes via `commun/manette.js`). Voix : `outils/enregistrer-foot.py`.
- `toboggan/` : Le Toboggan des Nuages, glissade en 3D à travers 5 mondes (déblocage, trophées, musique). Voix : `outils/enregistrer-toboggan.py`.
- `avatar/` : l'atelier « Mon personnage » (style Roblox). Le moteur des personnages est dans `commun/avatar.js` (utilisé par le toboggan et le foot).
- `parler/` : « Je répète ! », jeu de parole pour les tout-petits (mots dans `parler/mots.js`, voix : `outils/enregistrer-parler.py`). Le micro sert seulement à savoir que l'enfant a parlé.
