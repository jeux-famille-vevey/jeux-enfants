#!/bin/bash
# Installation pour le MacBook d'Aleyah (Linux Mint 22.3).
# À lancer depuis la session d'Aleyah : le mot de passe de papa (administrateur) sera demandé dans une fenêtre.
# Lancement : wget -qO /tmp/i.sh https://jeux-famille-vevey.github.io/jeux-enfants/installer/aleyah.sh && bash /tmp/i.sh

set -u
ERREURS=()
ok(){ printf '\e[32m✔ %s\e[0m\n' "$*"; }
etape(){ printf '\n\e[1;34m▶ %s\e[0m\n' "$*"; }
pb(){ printf '\e[31m✘ %s\e[0m\n' "$*"; ERREURS+=("$*"); }
FICHE="https://jeux-famille-vevey.github.io/jeux-enfants/fiches/mes-logiciels.pdf"

echo "Installation pour Aleyah. Une fenêtre va demander le mot de passe de papa."

etape "1/2 Logiciels (GCompris, Tux Paint, Krita, GIMP, Inkscape, Audacity, LocalSend)"
if flatpak install -y flathub org.kde.gcompris org.tuxpaint.Tuxpaint org.kde.krita org.gimp.GIMP org.inkscape.Inkscape org.audacityteam.Audacity org.localsend.localsend_app; then ok "Logiciels installés"; else pb "Logiciels (relance le script pour réessayer)"; fi

etape "2/2 Fiche « Mes logiciels » sur le bureau"
BUREAU="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Bureau")"
if wget -q -O "$BUREAU/Mes-logiciels.pdf" "$FICHE"; then ok "Fiche posée sur le bureau"; else pb "Fiche PDF"; fi

echo
if [ ${#ERREURS[@]} -eq 0 ]; then
  printf '\e[1;32mTout est installé. Les programmes sont dans le menu (rond en bas à gauche).\e[0m\n'
else
  printf '\e[1;31mProblèmes : %s\e[0m\n' "${ERREURS[*]}"
  echo "Prends une photo de cet écran et envoie-la à Claude."
fi
