#!/bin/bash
# Installation pour le vieil iMac (2009) sous Linux Mint 22.3.
# Même base que l'iMac 2013, adaptée à un ordinateur moins puissant.
# Lancement : wget -qO /tmp/i.sh https://jeux-famille-vevey.github.io/jeux-enfants/installer/imac-2009.sh && bash /tmp/i.sh

set -u
ERREURS=()
ok(){ printf '\e[32m✔ %s\e[0m\n' "$*"; }
etape(){ printf '\n\e[1;34m▶ %s\e[0m\n' "$*"; }
pb(){ printf '\e[31m✘ %s\e[0m\n' "$*"; ERREURS+=("$*"); }
FICHE="https://jeux-famille-vevey.github.io/jeux-enfants/fiches/mes-logiciels.pdf"

echo "Installation du vieil iMac. Ton mot de passe va être demandé (rien ne s'affiche quand tu le tapes, c'est normal)."
sudo -v || { echo "Mot de passe refusé : relance la commande."; exit 1; }

etape "1/6 Mises à jour du système (peut prendre longtemps)"
if sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get full-upgrade -y; then ok "Système à jour"; else pb "Mises à jour du système"; fi

etape "2/6 Pilote Wi-Fi (carte Broadcom BCM4322)"
if lspci -nn | grep -qiE "BCM4322|14e4:432b"; then
  if sudo DEBIAN_FRONTEND=noninteractive apt-get install -y broadcom-sta-dkms; then ok "Pilote Wi-Fi installé (actif après le redémarrage)"; else pb "Pilote Wi-Fi"; fi
else
  echo "Carte BCM4322 non trouvée : étape sautée."
fi

etape "3/6 Claude"
sudo apt-get install -y curl >/dev/null
if sudo curl -fsSLo /usr/share/keyrings/claude-desktop-archive-keyring.asc https://downloads.claude.ai/claude-desktop/key.asc \
  && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/claude-desktop-archive-keyring.asc] https://downloads.claude.ai/claude-desktop/apt/stable stable main" | sudo tee /etc/apt/sources.list.d/claude-desktop.list >/dev/null \
  && sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y claude-desktop; then ok "Claude installé"; else pb "Claude"; fi

etape "4/6 Imprimante et scanner HP"
if sudo DEBIAN_FRONTEND=noninteractive apt-get install -y hplip sane-airscan; then ok "Outils HP prêts"; else pb "Outils HP"; fi

etape "5/6 Logiciels (ONLYOFFICE, LocalSend, GIMP, Inkscape, Tux Paint, GCompris, Audacity)"
if flatpak install -y --noninteractive flathub org.onlyoffice.desktopeditors org.localsend.localsend_app org.gimp.GIMP org.inkscape.Inkscape org.tuxpaint.Tuxpaint org.kde.gcompris org.audacityteam.Audacity; then ok "Logiciels installés"; else pb "Logiciels (relance le script pour réessayer)"; fi

etape "6/6 Fiche « Mes logiciels » sur le bureau"
BUREAU="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Bureau")"
if wget -q -O "$BUREAU/Mes-logiciels.pdf" "$FICHE"; then ok "Fiche posée sur le bureau"; else pb "Fiche PDF"; fi

echo
if [ ${#ERREURS[@]} -eq 0 ]; then
  printf '\e[1;32mTout est installé. Redémarre l'"'"'iMac (menu, puis Redémarrer).\e[0m\n'
else
  printf '\e[1;31mProblèmes : %s\e[0m\n' "${ERREURS[*]}"
  echo "Prends une photo de cet écran et envoie-la à Claude."
fi
