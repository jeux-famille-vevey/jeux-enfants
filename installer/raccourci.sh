#!/bin/bash
# Pose l'icône « Jeux des enfants » sur le bureau (et dans le menu), sous Linux Mint.
# À lancer dans la session où l'on veut l'icône (pas besoin de mot de passe).
# Lancement : wget -qO /tmp/r.sh https://jeux-famille-vevey.github.io/jeux-enfants/installer/raccourci.sh && bash /tmp/r.sh

SITE="https://jeux-famille-vevey.github.io/jeux-enfants/"
BUREAU="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Bureau")"
ICONE="$HOME/.local/share/icons/jeux-enfants.png"
mkdir -p "$BUREAU" "$HOME/.local/share/icons" "$HOME/.local/share/applications"
wget -q -O "$ICONE" "${SITE}installer/jeux-enfants.png" || ICONE="applications-games"

FICHIER="$BUREAU/jeux-des-enfants.desktop"
cat > "$FICHIER" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Jeux des enfants
Comment=Les jeux éducatifs et les histoires
Exec=xdg-open $SITE
Icon=$ICONE
Terminal=false
Categories=Education;Game;
EOF
chmod +x "$FICHIER"
# dire au bureau que ce raccourci est sûr (sinon Mint demande une confirmation au premier clic)
gio set "$FICHIER" metadata::trusted true 2>/dev/null
cp "$FICHIER" "$HOME/.local/share/applications/jeux-des-enfants.desktop"

if [ -f "$FICHIER" ]; then
  printf '\e[1;32m✔ L'"'"'icône « Jeux des enfants » est sur le bureau (et dans le menu).\e[0m\n'
else
  printf '\e[1;31m✘ Le raccourci n'"'"'a pas pu être créé. Prends une photo de cet écran et envoie-la à Claude.\e[0m\n'
fi
