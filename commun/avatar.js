/* Les personnages des enfants (style « Roblox ») : chaque enfant choisit sa peau, son visage,
   ses cheveux, son chapeau, ses lunettes, ses habits… Le personnage est ensuite utilisé dans les jeux 3D.
   creerAvatar(config, { pose: "debout" | "assis" }) renvoie un groupe Three.js :
   userData = { corps, tete, bras: [g, d], jambes: [g, d] } (bras et jambes tournent autour de l'épaule / la hanche).
   Le point (0, 0, 0) est sous les pieds ; le personnage regarde vers +z ; il mesure environ 2,5. */
import * as THREE from "../course3d/lib/three.module.min.js";

/* ======================= le catalogue ======================= */
export const CATALOGUE = {
  peau: ["#FBE3D0", "#F2C9A0", "#E8B98E", "#D9A273", "#C98E62", "#A86B45", "#8D5B3C", "#6B4127", "#4A2C1A", "#9BE07A", "#8EC5FF", "#C9A8FF"],
  visage: [
    { id:"sourire", nom:"Sourire", e:"🙂" }, { id:"rire", nom:"Grand rire", e:"😄" }, { id:"dents", nom:"Sourire dents", e:"😁" },
    { id:"clin", nom:"Clin d'œil", e:"😉" }, { id:"langue", nom:"Langue tirée", e:"😛" }, { id:"surpris", nom:"Surpris", e:"😮" },
    { id:"etoiles", nom:"Yeux étoiles", e:"🤩" }, { id:"coeurs", nom:"Yeux cœurs", e:"😍" }, { id:"cool", nom:"Cool", e:"😎" },
    { id:"timide", nom:"Timide", e:"😊" }, { id:"rousseur", nom:"Taches de rousseur", e:"🧡" }, { id:"moustache", nom:"Moustache", e:"🥸" },
    { id:"pirate", nom:"Pirate", e:"🏴‍☠️" }, { id:"chat", nom:"Petit chat", e:"🐱" }, { id:"fache", nom:"Grrr !", e:"😠" }, { id:"dort", nom:"Endormi", e:"😴" }
  ],
  yeux: ["#5A3A22", "#22150F", "#3D7BD9", "#3FA34D", "#7A8A99", "#8E5BC4", "#E5484D", "#FFB000"],
  cheveux: [
    { id:"chauve", nom:"Sans cheveux", e:"🥚" }, { id:"court", nom:"Court", e:"👦" }, { id:"boucle", nom:"Bouclé", e:"🌀" }, { id:"afro", nom:"Afro", e:"☁️" },
    { id:"frange", nom:"Frange", e:"💇" }, { id:"herisse", nom:"Hérissé", e:"⚡" }, { id:"crete", nom:"Crête", e:"🦔" }, { id:"meche", nom:"Mèche", e:"🌊" },
    { id:"bol", nom:"Coupe au bol", e:"🥣" }, { id:"long", nom:"Long", e:"👧" }, { id:"queue", nom:"Queue de cheval", e:"🐴" }, { id:"couettes", nom:"Couettes", e:"🎀" },
    { id:"chignon", nom:"Chignon", e:"🍩" }, { id:"tresses", nom:"Tresses", e:"🪢" }, { id:"locks", nom:"Dreadlocks", e:"🌿" }, { id:"punk", nom:"Rock", e:"🎸" }
  ],
  couleurCheveux: ["#22150F", "#4A2C1A", "#7A4B2E", "#B07A4A", "#E0A43A", "#F4E2A0", "#C8502E", "#FFFFFF", "#FF6FB0", "#4C9BFF", "#9B6BFF", "#3FCF6A", "#FF9F1C"],
  chapeau: [
    { id:"aucun", nom:"Rien", e:"🚫" }, { id:"casquette", nom:"Casquette", e:"🧢" }, { id:"casquetteDos", nom:"Casquette à l'envers", e:"🔄" },
    { id:"bonnet", nom:"Bonnet", e:"🎿" }, { id:"couronne", nom:"Couronne", e:"👑" }, { id:"casque", nom:"Casque", e:"⛑️" },
    { id:"chat", nom:"Oreilles de chat", e:"🐱" }, { id:"lapin", nom:"Oreilles de lapin", e:"🐰" }, { id:"noeud", nom:"Nœud", e:"🎀" },
    { id:"pirate", nom:"Chapeau de pirate", e:"🏴‍☠️" }, { id:"cowboy", nom:"Chapeau de cowboy", e:"🤠" }, { id:"magicien", nom:"Chapeau de magicien", e:"🧙" },
    { id:"ninja", nom:"Bandeau ninja", e:"🥷" }, { id:"viking", nom:"Casque viking", e:"🪖" }, { id:"antennes", nom:"Antennes", e:"👽" },
    { id:"fleurs", nom:"Couronne de fleurs", e:"🌸" }, { id:"licorne", nom:"Corne de licorne", e:"🦄" }, { id:"chef", nom:"Toque de chef", e:"👨‍🍳" }
  ],
  lunettes: [
    { id:"aucune", nom:"Rien", e:"🚫" }, { id:"rondes", nom:"Lunettes rondes", e:"👓" }, { id:"soleil", nom:"Lunettes de soleil", e:"🕶️" },
    { id:"masque", nom:"Masque de héros", e:"🦸" }, { id:"etoiles", nom:"Lunettes étoiles", e:"⭐" }, { id:"plongee", nom:"Masque de plongée", e:"🤿" }
  ],
  haut: [
    { id:"tshirt", nom:"T-shirt", e:"👕" }, { id:"maillot", nom:"Maillot de foot", e:"⚽" }, { id:"capuche", nom:"Sweat à capuche", e:"🧥" },
    { id:"pull", nom:"Pull", e:"🧶" }, { id:"chemise", nom:"Chemise", e:"👔" }, { id:"robe", nom:"Robe", e:"👗" },
    { id:"heros", nom:"Super-héros", e:"🦸" }, { id:"salopette", nom:"Salopette", e:"👖" }, { id:"veste", nom:"Veste", e:"🧑‍🚀" }, { id:"princesse", nom:"Robe de princesse", e:"👸" }
  ],
  couleurs: ["#E5484D", "#FF8FB8", "#FF9F1C", "#FFD23F", "#3FA34D", "#7BE495", "#2BB3C0", "#4CC9F0", "#3D7BD9", "#1D2357", "#8E5BC4", "#B9B3F5", "#FFFFFF", "#9AA0AE", "#22232B", "#8A5A3B"],
  motif: [
    { id:"uni", nom:"Uni", e:"⬜" }, { id:"rayures", nom:"Rayures", e:"🦓" }, { id:"etoile", nom:"Étoile", e:"⭐" }, { id:"eclair", nom:"Éclair", e:"⚡" },
    { id:"coeur", nom:"Cœur", e:"❤️" }, { id:"pois", nom:"Pois", e:"🔴" }, { id:"fleur", nom:"Fleur", e:"🌼" }, { id:"ballon", nom:"Ballon", e:"⚽" },
    { id:"dino", nom:"Dinosaure", e:"🦖" }, { id:"fusee", nom:"Fusée", e:"🚀" }, { id:"chat", nom:"Chat", e:"🐱" }, { id:"arc", nom:"Arc-en-ciel", e:"🌈" }
  ],
  bas: [ { id:"short", nom:"Short", e:"🩳" }, { id:"pantalon", nom:"Pantalon", e:"👖" }, { id:"jupe", nom:"Jupe", e:"🩰" }, { id:"jogging", nom:"Jogging", e:"🏃" } ],
  chaussures: ["#E5484D", "#FFFFFF", "#22232B", "#3D7BD9", "#FFD23F", "#FF8FB8", "#3FA34D", "#FF9F1C"],
  dos: [ { id:"aucun", nom:"Rien", e:"🚫" }, { id:"cape", nom:"Cape", e:"🦸" }, { id:"ailes", nom:"Ailes de fée", e:"🧚" }, { id:"sac", nom:"Sac à dos", e:"🎒" },
         { id:"dragon", nom:"Ailes de dragon", e:"🐉" }, { id:"fusee", nom:"Réacteur", e:"🚀" }, { id:"carapace", nom:"Carapace de tortue", e:"🐢" } ]
};

/* ======================= les profils des enfants ======================= */
const PROFILS_BASE = [
  { id:"mikael", nom:"Mikael", e:"⚽", numero:5 },
  { id:"aleyah", nom:"Aleyah", e:"⭐", numero:10 },
  { id:"invite", nom:"Invité", e:"🙂", numero:7 }
];
const DEFAUTS = {
  mikael: { peau:"#C98E62", visage:"rire", yeux:"#5A3A22", cheveux:"boucle", couleurCheveux:"#22150F", chapeau:"aucun", lunettes:"aucune", haut:"maillot", couleurHaut:"#3D7BD9", motif:"uni", bas:"short", couleurBas:"#FFFFFF", chaussures:"#E5484D", dos:"aucun" },
  aleyah: { peau:"#C98E62", visage:"sourire", yeux:"#5A3A22", cheveux:"long", couleurCheveux:"#22150F", chapeau:"noeud", lunettes:"aucune", haut:"tshirt", couleurHaut:"#FF8FB8", motif:"coeur", bas:"jupe", couleurBas:"#8E5BC4", chaussures:"#FFFFFF", dos:"aucun" },
  invite: { peau:"#E8B98E", visage:"sourire", yeux:"#3D7BD9", cheveux:"court", couleurCheveux:"#7A4B2E", chapeau:"casquette", lunettes:"aucune", haut:"tshirt", couleurHaut:"#3FA34D", motif:"etoile", bas:"pantalon", couleurBas:"#1D2357", chaussures:"#22232B", dos:"aucun" }
};
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
export function profils(){
  let ajout = []; try{ ajout = JSON.parse(lire("profils-ajoutes", "[]")) || []; }catch(e){}
  return PROFILS_BASE.concat(ajout);
}
export function ajouterProfil(nom){
  nom = String(nom || "").trim().slice(0, 14); if(!nom) return null;
  let ajout = []; try{ ajout = JSON.parse(lire("profils-ajoutes", "[]")) || []; }catch(e){}
  const id = "p" + Date.now().toString(36);
  ajout.push({ id, nom, e:"🙂", numero: 3 + ajout.length });
  ecrire("profils-ajoutes", JSON.stringify(ajout));
  ecrire("avatar-" + id, JSON.stringify(auHasard()));
  return id;
}
export function avatarDe(id){
  let c = null; try{ c = JSON.parse(lire("avatar-" + id, "null")); }catch(e){}
  return Object.assign({}, DEFAUTS[id] || DEFAUTS.invite, c || {});
}
export function enregistrerAvatar(id, cfg){ ecrire("avatar-" + id, JSON.stringify(cfg)); }
export function auHasard(){
  const p = (l) => l[Math.floor(Math.random() * l.length)];
  const id = (l) => p(l).id;
  const humain = CATALOGUE.peau.slice(0, 9);
  return { peau: Math.random() < .9 ? p(humain) : p(CATALOGUE.peau), visage: id(CATALOGUE.visage), yeux: p(CATALOGUE.yeux), cheveux: id(CATALOGUE.cheveux),
    couleurCheveux: p(CATALOGUE.couleurCheveux), chapeau: Math.random() < .5 ? "aucun" : id(CATALOGUE.chapeau), lunettes: Math.random() < .7 ? "aucune" : id(CATALOGUE.lunettes),
    haut: id(CATALOGUE.haut), couleurHaut: p(CATALOGUE.couleurs), motif: id(CATALOGUE.motif), bas: id(CATALOGUE.bas), couleurBas: p(CATALOGUE.couleurs),
    chaussures: p(CATALOGUE.chaussures), dos: Math.random() < .6 ? "aucun" : id(CATALOGUE.dos) };
}

/* ======================= dessins (textures) ======================= */
const cacheTex = {};
function tex(cle, w, h, dessin){
  if(cacheTex[cle]) return cacheTex[cle];
  const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return cacheTex[cle] = t;
}
function clair(hex){ const c = new THREE.Color(hex); return c.r * .3 + c.g * .59 + c.b * .11 > .6; }
function etoile(g, x, y, r1, r2){ g.beginPath(); for(let k = 0; k < 10; k++){ const a = k / 10 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fill(); }
function coeur(g, x, y, s){ g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.3, x, y - s * .4); g.bezierCurveTo(x + s * .6, y - s * 1.3, x + s * 1.6, y - s * .2, x, y + s * .9); g.fill(); }

function texVisage(cfg){
  return tex("v" + cfg.peau + cfg.visage + cfg.yeux, 512, 256, (g, w, h) => {
    g.fillStyle = cfg.peau; g.fillRect(0, 0, w, h);
    const cx = w * .25, cy = h * .5, v = cfg.visage, encre = "#2B2140";
    const oeil = (s) => {
      const x = cx + s * 27, y = cy - 6;
      if(v === "dort" || (v === "clin" && s > 0) || v === "timide"){ g.strokeStyle = encre; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.arc(x, y - (v === "timide" ? 4 : 0), 12, v === "timide" ? Math.PI * 1.1 : .2, v === "timide" ? Math.PI * 1.9 : Math.PI - .2, v === "timide"); g.stroke(); return; }
      if(v === "rire"){ g.strokeStyle = encre; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.arc(x, y + 4, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
      if(v === "etoiles"){ g.fillStyle = "#FFD23F"; etoile(g, x, y, 19, 8); g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x - 4, y - 5, 3, 0, 7); g.fill(); return; }
      if(v === "coeurs"){ g.fillStyle = "#E5484D"; coeur(g, x, y, 14); return; }
      if(v === "pirate" && s > 0){ g.fillStyle = "#22232B"; g.beginPath(); g.ellipse(x, y, 18, 16, 0, 0, 7); g.fill(); g.strokeStyle = "#22232B"; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 60, y - 40); g.lineTo(x + 50, y + 10); g.stroke(); return; }
      const grand = v === "surpris" ? 1.2 : 1;
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.ellipse(x, y, 15 * grand, 19 * grand, 0, 0, 7); g.fill();
      g.fillStyle = cfg.yeux; g.beginPath(); g.ellipse(x + 2, y + 2, 9, 11, 0, 0, 7); g.fill();
      g.fillStyle = "#1A1020"; g.beginPath(); g.ellipse(x + 2, y + 3, 4.5, 6, 0, 0, 7); g.fill();
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x + 6, y - 4, 3.6, 0, 7); g.fill();
      if(v === "chat"){ g.strokeStyle = encre; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 12, y - 18); g.lineTo(x - 20, y - 24); g.stroke(); }
    };
    oeil(-1); oeil(1);
    // sourcils
    g.strokeStyle = encre; g.lineWidth = 5; g.lineCap = "round";
    [-1, 1].forEach(s => { g.beginPath();
      if(v === "fache"){ g.moveTo(cx + s * 12, cy - 26); g.lineTo(cx + s * 40, cy - 36); }
      else if(v === "surpris"){ g.moveTo(cx + s * 14, cy - 40); g.quadraticCurveTo(cx + s * 27, cy - 50, cx + s * 40, cy - 40); }
      else { g.moveTo(cx + s * 14, cy - 33); g.quadraticCurveTo(cx + s * 27, cy - 41, cx + s * 40, cy - 32); }
      g.stroke(); });
    // joues
    if(v !== "cool"){ g.fillStyle = v === "timide" ? "rgba(255,90,120,.6)" : "rgba(255,110,130,.4)"; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 46, cy + 20, 13, 8, 0, 0, 7); g.fill(); }); }
    if(v === "rousseur"){ g.fillStyle = "rgba(150,80,40,.55)"; [[-44, 10], [-36, 16], [-48, 20], [44, 10], [36, 16], [48, 20], [-40, 24], [40, 24]].forEach(p => { g.beginPath(); g.arc(cx + p[0], cy + p[1], 2.6, 0, 7); g.fill(); }); }
    if(v === "cool"){ g.fillStyle = "#1A1A24"; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 27, cy - 4, 22, 15, 0, 0, 7); g.fill(); }); g.fillRect(cx - 8, cy - 10, 16, 5); }
    if(v === "chat"){ g.strokeStyle = encre; g.lineWidth = 2.5; [-1, 1].forEach(s => { for(let k = -1; k <= 1; k++){ g.beginPath(); g.moveTo(cx + s * 16, cy + 16 + k * 5); g.lineTo(cx + s * 50, cy + 12 + k * 9); g.stroke(); } }); g.fillStyle = "#FF8FA3"; g.beginPath(); g.moveTo(cx - 6, cy + 8); g.lineTo(cx + 6, cy + 8); g.lineTo(cx, cy + 15); g.fill(); }
    // nez
    else { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(cx, cy + 12, 5, 4, 0, 0, 7); g.fill(); }
    // bouche
    g.lineWidth = 6; g.strokeStyle = "#5A2A1A";
    const by = cy + 32;
    if(v === "rire" || v === "etoiles" || v === "coeurs"){ g.fillStyle = "#8A2C4A"; g.beginPath(); g.moveTo(cx - 22, by - 6); g.quadraticCurveTo(cx, by + 26, cx + 22, by - 6); g.closePath(); g.fill(); g.fillStyle = "#FF8FA3"; g.beginPath(); g.ellipse(cx, by + 6, 9, 5, 0, 0, 7); g.fill(); }
    else if(v === "dents"){ g.fillStyle = "#8A2C4A"; g.beginPath(); g.moveTo(cx - 24, by - 6); g.quadraticCurveTo(cx, by + 24, cx + 24, by - 6); g.closePath(); g.fill(); g.fillStyle = "#FFFFFF"; g.fillRect(cx - 18, by - 6, 36, 8); }
    else if(v === "langue"){ g.beginPath(); g.moveTo(cx - 18, by); g.quadraticCurveTo(cx, by + 12, cx + 18, by); g.stroke(); g.fillStyle = "#FF6F8F"; g.beginPath(); g.ellipse(cx + 4, by + 12, 9, 11, 0, 0, 7); g.fill(); }
    else if(v === "surpris"){ g.fillStyle = "#8A2C4A"; g.beginPath(); g.ellipse(cx, by + 2, 9, 12, 0, 0, 7); g.fill(); }
    else if(v === "fache"){ g.beginPath(); g.moveTo(cx - 16, by + 6); g.quadraticCurveTo(cx, by - 6, cx + 16, by + 6); g.stroke(); }
    else if(v === "dort"){ g.fillStyle = "#8A2C4A"; g.beginPath(); g.ellipse(cx, by + 2, 6, 5, 0, 0, 7); g.fill(); g.fillStyle = "#4C9BFF"; g.font = "bold 30px Arial"; g.fillText("z", cx + 46, cy - 30); }
    else if(v === "timide"){ g.beginPath(); g.moveTo(cx - 10, by); g.quadraticCurveTo(cx, by + 7, cx + 10, by); g.stroke(); }
    else if(v !== "chat"){ g.beginPath(); g.moveTo(cx - 18, by - 2); g.quadraticCurveTo(cx, by + 16, cx + 18, by - 2); g.stroke(); }
    else { g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 14, by - 6); g.quadraticCurveTo(cx - 7, by + 2, cx, by - 6); g.quadraticCurveTo(cx + 7, by + 2, cx + 14, by - 6); g.stroke(); }
    if(v === "moustache"){ g.fillStyle = cfg.couleurCheveux || "#22150F"; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 14, cy + 22, 16, 7, s * .25, 0, 7); g.fill(); }); }
  });
}
/* le devant du haut : couleur + motif (+ numéro pour le maillot) */
function dessinMotif(g, w, h, motif, couleur, x, y, t){
  const encre = clair(couleur) ? "#1D2357" : "#FFFFFF";
  g.fillStyle = encre; g.strokeStyle = encre;
  if(motif === "etoile"){ g.fillStyle = clair(couleur) ? "#FF9F1C" : "#FFD23F"; etoile(g, x, y, t, t * .45); }
  else if(motif === "eclair"){ g.fillStyle = "#FFD23F"; g.beginPath(); g.moveTo(x + t * .2, y - t); g.lineTo(x - t * .5, y + t * .1); g.lineTo(x, y + t * .1); g.lineTo(x - t * .2, y + t); g.lineTo(x + t * .55, y - t * .15); g.lineTo(x + t * .05, y - t * .15); g.closePath(); g.fill(); }
  else if(motif === "coeur"){ g.fillStyle = couleur.toUpperCase() === "#E5484D" ? "#FFFFFF" : "#E5484D"; coeur(g, x, y, t * .75); }
  else if(motif === "fleur"){ g.fillStyle = "#FFFFFF"; for(let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * t * .45, y + Math.sin(a) * t * .45, t * .32, t * .22, a, 0, 7); g.fill(); } g.fillStyle = "#FFD23F"; g.beginPath(); g.arc(x, y, t * .25, 0, 7); g.fill(); }
  else if(motif === "ballon"){ g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x, y, t * .8, 0, 7); g.fill(); g.fillStyle = "#22232B"; etoile(g, x, y, t * .32, t * .3); [[0, -1], [.95, -.3], [.6, .8], [-.6, .8], [-.95, -.3]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a * t * .72, y + b * t * .72, t * .14, 0, 7); g.fill(); }); }
  else if(motif === "dino"){ g.fillStyle = "#3FCF6A"; g.beginPath(); g.ellipse(x, y + t * .2, t * .7, t * .45, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + t * .55, y - t * .35, t * .32, t * .26, 0, 0, 7); g.fill(); g.fillRect(x + t * .35, y - t * .3, t * .2, t * .4); g.fillRect(x - t * .4, y + t * .45, t * .18, t * .35); g.fillRect(x + t * .15, y + t * .45, t * .18, t * .35); g.fillStyle = "#1D2357"; g.beginPath(); g.arc(x + t * .62, y - t * .42, t * .06, 0, 7); g.fill(); }
  else if(motif === "fusee"){ g.fillStyle = "#FFFFFF"; g.beginPath(); g.ellipse(x, y, t * .3, t * .75, 0, 0, 7); g.fill(); g.fillStyle = "#E5484D"; g.beginPath(); g.moveTo(x - t * .3, y + t * .3); g.lineTo(x - t * .55, y + t * .8); g.lineTo(x - t * .1, y + t * .6); g.fill(); g.beginPath(); g.moveTo(x + t * .3, y + t * .3); g.lineTo(x + t * .55, y + t * .8); g.lineTo(x + t * .1, y + t * .6); g.fill(); g.fillStyle = "#4CC9F0"; g.beginPath(); g.arc(x, y - t * .15, t * .14, 0, 7); g.fill(); g.fillStyle = "#FF9F1C"; g.beginPath(); g.moveTo(x - t * .15, y + t * .75); g.lineTo(x, y + t * 1.05); g.lineTo(x + t * .15, y + t * .75); g.fill(); }
  else if(motif === "chat"){ g.fillStyle = encre; g.beginPath(); g.arc(x, y + t * .1, t * .55, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - t * .5, y - t * .1); g.lineTo(x - t * .45, y - t * .75); g.lineTo(x - t * .1, y - t * .4); g.fill(); g.beginPath(); g.moveTo(x + t * .5, y - t * .1); g.lineTo(x + t * .45, y - t * .75); g.lineTo(x + t * .1, y - t * .4); g.fill(); g.fillStyle = couleur; g.beginPath(); g.arc(x - t * .2, y, t * .08, 0, 7); g.arc(x + t * .2, y, t * .08, 0, 7); g.fill(); }
  else if(motif === "arc"){ ["#E5484D", "#FF9F1C", "#FFD23F", "#3FA34D", "#3D7BD9", "#8E5BC4"].forEach((c, k) => { g.strokeStyle = c; g.lineWidth = t * .14; g.beginPath(); g.arc(x, y + t * .45, t * (.95 - k * .14), Math.PI, 0); g.stroke(); }); }
}
function texHaut(cfg, numero, face){
  const style = cfg.haut, couleur = cfg.couleurHaut, motif = style === "heros" && cfg.motif === "uni" ? "etoile" : cfg.motif;
  return tex("h" + style + couleur + motif + (numero || "") + face, 128, 128, (g, w, h) => {
    g.fillStyle = couleur; g.fillRect(0, 0, w, h);
    const encre = clair(couleur) ? "#1D2357" : "#FFFFFF";
    if(motif === "rayures"){ g.fillStyle = clair(couleur) ? "rgba(29,35,87,.35)" : "rgba(255,255,255,.55)"; for(let y = 0; y < h; y += 28) g.fillRect(0, y, w, 13); }
    if(motif === "pois"){ g.fillStyle = clair(couleur) ? "rgba(29,35,87,.45)" : "rgba(255,255,255,.75)"; for(let y = 10; y < h; y += 30) for(let x = (y / 30) % 2 ? 24 : 9; x < w; x += 30){ g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } }
    if(face === "devant"){
      if(style === "chemise"){ g.fillStyle = "#FFFFFF"; g.beginPath(); g.moveTo(34, 0); g.lineTo(64, 30); g.lineTo(94, 0); g.fill(); g.fillStyle = encre; [46, 72, 98].forEach(y => { g.beginPath(); g.arc(64, y, 4, 0, 7); g.fill(); }); }
      if(style === "salopette"){ g.fillStyle = cfg.couleurBas; g.fillRect(28, 52, 72, 76); g.fillRect(28, 0, 14, 60); g.fillRect(86, 0, 14, 60); g.fillStyle = "#FFD23F"; g.beginPath(); g.arc(35, 56, 5, 0, 7); g.arc(93, 56, 5, 0, 7); g.fill(); }
      if(style === "veste"){ g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(61, 0, 6, h); g.fillStyle = "#C9CED8"; g.fillRect(62, 0, 4, h); }
      if(style === "capuche"){ g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(30, 84, 68, 30); g.strokeStyle = "#FFFFFF"; g.lineWidth = 4; g.beginPath(); g.moveTo(52, 0); g.lineTo(50, 34); g.moveTo(76, 0); g.lineTo(78, 34); g.stroke(); }
      if(style === "princesse"){ g.fillStyle = "#FFD23F"; for(let x = 10; x < w; x += 20){ g.beginPath(); g.arc(x, 112, 5, 0, 7); g.fill(); } }
      if(style === "maillot" && numero){ g.fillStyle = encre; g.font = "bold 34px Fredoka, Arial, sans-serif"; g.textAlign = "center"; g.fillText(String(numero), 92, 44); }
      if(!["rayures", "pois", "uni"].includes(motif) && style !== "salopette") dessinMotif(g, w, h, motif, couleur, style === "maillot" ? 52 : 64, style === "maillot" ? 66 : 62, 34);
      if(style === "maillot"){ g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, 8); }
    }
    if(face === "dos" && style === "maillot" && numero){ g.fillStyle = encre; g.font = "bold 80px Fredoka, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(numero), 64, 70); }
  });
}

/* ======================= construction du personnage ======================= */
const cacheMat = {};
function mat(c, o){ const k = c + JSON.stringify(o || {}); if(!cacheMat[k]) cacheMat[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, flatShading: true }, o || {})); return cacheMat[k]; }
function boite(w, h, l, m, x, y, z){ const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), typeof m === "string" ? mat(m) : m); b.position.set(x, y, z); b.castShadow = true; return b; }
function boule(r, m, x, y, z, seg){ const b = new THREE.Mesh(new THREE.SphereGeometry(r, seg || 12, Math.max(6, (seg || 12) - 4)), typeof m === "string" ? mat(m) : m); b.position.set(x, y, z); b.castShadow = true; return b; }
function cyl(r1, r2, h, m, x, y, z, seg){ const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 10), typeof m === "string" ? mat(m) : m); c.position.set(x, y, z); c.castShadow = true; return c; }
function cone(r, h, m, x, y, z, seg){ const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 10), typeof m === "string" ? mat(m) : m); c.position.set(x, y, z); c.castShadow = true; return c; }

const TETE_Y = 2.12, TETE_R = .36;
function cheveux3D(cfg){
  const g = new THREE.Group(), c = mat(cfg.couleurCheveux), st = cfg.cheveux;
  const calotte = (theta, tilt) => { const m = new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .025, 16, 10, 0, Math.PI * 2, 0, Math.PI * theta), c); m.rotation.x = tilt; m.castShadow = true; return m; };
  if(st === "chauve") return g;
  if(st === "afro"){ g.add(boule(.52, c, 0, .16, -.2, 14)); g.add(calotte(.4, -.5)); return g; }
  if(st === "bol"){ g.add(calotte(.56, -.15)); return g; }
  g.add(calotte(st === "long" || st === "queue" || st === "couettes" || st === "tresses" || st === "chignon" || st === "locks" ? .5 : .47, -.36));
  if(st === "boucle") for(let k = 0; k < 14; k++){ const a = k / 14 * Math.PI * 2; g.add(boule(.11, c, Math.cos(a) * .3, .2 + (k % 2) * .06, Math.sin(a) * .3 - .05, 8)); }
  if(st === "frange") g.add(boite(.62, .14, .12, c, 0, .22, .3));
  if(st === "herisse") for(let k = 0; k < 7; k++){ const a = (k - 3) * .35; const m = cone(.09, .32, c, Math.sin(a) * .25, .38, Math.cos(a) * .05 - .02, 6); m.rotation.z = -a * .7; g.add(m); }
  if(st === "crete") for(let k = 0; k < 5; k++) g.add(boite(.1, .26 - Math.abs(k - 2) * .03, .14, c, 0, .4, .22 - k * .13));
  if(st === "meche"){ const m = boite(.5, .14, .32, c, .12, .3, .16); m.rotation.z = -.35; g.add(m); }
  if(st === "punk"){ for(let k = 0; k < 5; k++){ const m = cone(.08, .35, c, .25 - k * .12, .38, .1, 6); m.rotation.z = .4; g.add(m); } }
  if(st === "long"){ g.add(boite(.74, .7, .2, c, 0, -.2, -.22)); g.add(boite(.14, .55, .3, c, -.34, -.12, -.02)); g.add(boite(.14, .55, .3, c, .34, -.12, -.02)); }
  if(st === "queue"){ const q = cyl(.1, .06, .55, c, 0, -.05, -.42, 8); q.rotation.x = .5; g.add(q); g.add(boule(.08, "#FF4FB0", 0, .17, -.36, 8)); }
  if(st === "couettes") [-1, 1].forEach(s => { const q = cyl(.1, .07, .45, c, s * .42, -.02, -.08, 8); q.rotation.z = s * .7; g.add(q); g.add(boule(.07, "#FF4FB0", s * .33, .12, -.06, 8)); });
  if(st === "chignon"){ g.add(boule(.19, c, 0, .4, -.18, 10)); }
  if(st === "tresses") [-1, 1].forEach(s => { for(let k = 0; k < 5; k++) g.add(boule(.075, c, s * .3, -.12 - k * .13, -.12, 6)); });
  if(st === "locks") for(let k = 0; k < 10; k++){ const a = Math.PI * (.15 + k * .08); g.add(cyl(.05, .045, .55, c, Math.cos(a) * .34, -.12, -Math.sin(a) * .3, 6)); }
  return g;
}
function chapeau3D(cfg){
  const g = new THREE.Group(), st = cfg.chapeau, ch = cfg.couleurHaut;
  const bouffant = ["afro"].includes(cfg.cheveux) ? .14 : 0;
  if(st === "aucun") return g;
  if(st === "casquette" || st === "casquetteDos"){ const c = new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .05, 16, 8, 0, Math.PI * 2, 0, Math.PI * .45), mat(ch)); c.position.y = .04 + bouffant; c.castShadow = true; g.add(c);
    const v = boite(.42, .04, .3, ch, 0, .1 + bouffant, .38); if(st === "casquetteDos"){ v.position.z = -.38; } g.add(v); g.add(boule(.05, "#FFFFFF", 0, .42 + bouffant, 0, 6)); }
  if(st === "bonnet"){ const c = new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .06, 16, 8, 0, Math.PI * 2, 0, Math.PI * .5), mat(ch)); c.position.y = .02 + bouffant; c.scale.y = 1.15; g.add(c); g.add(cyl(TETE_R + .07, TETE_R + .07, .12, "#FFFFFF", 0, .04 + bouffant, 0, 16)); g.add(boule(.12, "#FFFFFF", 0, .48 + bouffant, 0, 8)); }
  if(st === "couronne"){ const or = mat("#FFD23F", { metalness: .5, roughness: .3 }); g.add(cyl(.27, .27, .14, or, 0, .36 + bouffant, 0, 14)); for(let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2; g.add(cone(.06, .16, or, Math.cos(a) * .25, .5 + bouffant, Math.sin(a) * .25, 5)); }
    g.add(boule(.045, "#E5484D", 0, .37 + bouffant, .27, 6)); }
  if(st === "casque"){ const c = new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .08, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55), mat(ch, { roughness: .3 })); c.position.y = .02; g.add(c); g.add(boite(.06, .3, .5, "#FFFFFF", 0, .28, 0)); }
  if(st === "chat" || st === "lapin"){ const coul = cfg.couleurCheveux; [-1, 1].forEach(s => { const o = st === "chat" ? cone(.1, .2, coul, s * .22, .38 + bouffant, 0, 4) : cyl(.06, .08, .5, coul, s * .14, .55 + bouffant, 0, 8);
    g.add(o); if(st === "lapin"){ o.rotation.z = -s * .15; g.add(cyl(.03, .04, .36, "#FF8FB8", s * .14, .56 + bouffant, .05, 6)).children; } }); }
  if(st === "noeud"){ const r = "#FF4FB0"; g.add(cone(.12, .2, r, -.12, .36 + bouffant, -.05, 4).rotateZ(Math.PI / 2)); g.add(cone(.12, .2, r, .12, .36 + bouffant, -.05, 4).rotateZ(-Math.PI / 2)); g.add(boule(.06, r, 0, .36 + bouffant, -.05, 6)); }
  if(st === "pirate"){ const n = "#22232B"; const b = cyl(.48, .48, .06, n, 0, .26 + bouffant, 0, 3); b.rotation.y = Math.PI / 6; g.add(b); g.add(cyl(.27, .3, .25, n, 0, .38 + bouffant, 0, 12)); g.add(boule(.05, "#FFFFFF", 0, .4 + bouffant, .27, 6)); }
  if(st === "cowboy"){ const m = "#A86B45"; g.add(cyl(.55, .55, .04, m, 0, .27 + bouffant, 0, 18)); g.add(cyl(.26, .3, .3, m, 0, .42 + bouffant, 0, 12)); g.add(cyl(.305, .305, .06, "#22232B", 0, .3 + bouffant, 0, 12)); }
  if(st === "magicien"){ const m = "#3D2A8F"; g.add(cyl(.5, .5, .04, m, 0, .27 + bouffant, 0, 18)); g.add(cone(.28, .75, m, 0, .66 + bouffant, 0, 12)); for(let k = 0; k < 3; k++) g.add(boule(.04, "#FFD23F", Math.cos(k * 2) * .17, .45 + k * .14 + bouffant, Math.sin(k * 2) * .17 + .08, 5)); }
  if(st === "ninja"){ g.add(cyl(TETE_R + .03, TETE_R + .03, .12, ch, 0, .12, 0, 16)); const t = boite(.08, .3, .06, ch, .1, .05, -.4); t.rotation.z = .4; g.add(t); }
  if(st === "viking"){ g.add(new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .07, 16, 8, 0, Math.PI * 2, 0, Math.PI * .5), mat("#9AA0AE", { metalness: .5, roughness: .35 }))); [-1, 1].forEach(s => { const c = cone(.08, .35, "#FFF3D6", s * .42, .25, 0, 8); c.rotation.z = -s * 1.0; g.add(c); }); }
  if(st === "antennes") [-1, 1].forEach(s => { const a = cyl(.02, .02, .4, "#3FCF6A", s * .14, .5 + bouffant, 0, 5); a.rotation.z = -s * .3; g.add(a); g.add(boule(.07, "#3FCF6A", s * .2, .7 + bouffant, 0, 8)); });
  if(st === "fleurs") for(let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2; g.add(boule(.07, ["#FF8FB8", "#FFD23F", "#FFFFFF", "#B9B3F5"][k % 4], Math.cos(a) * .33, .26 + bouffant, Math.sin(a) * .33, 6)); }
  if(st === "licorne"){ const c = cone(.07, .4, "#FFD23F", 0, .48 + bouffant, .18, 8); c.rotation.x = .45; g.add(c); }
  if(st === "chef"){ g.add(cyl(.3, .3, .26, "#FFFFFF", 0, .38 + bouffant, 0, 14)); g.add(boule(.34, "#FFFFFF", 0, .6 + bouffant, 0, 12)); }
  return g;
}
function lunettes3D(cfg){
  const g = new THREE.Group(), st = cfg.lunettes;
  if(st === "aucune") return g;
  const z = TETE_R - .02;
  if(st === "rondes" || st === "soleil" || st === "etoiles"){
    const m = mat(st === "rondes" ? "#22232B" : st === "etoiles" ? "#FF4FB0" : "#22232B");
    [-1, 1].forEach(s => { const r = new THREE.Mesh(new THREE.TorusGeometry(.1, .02, 6, 16), m); r.position.set(s * .13, 0, z + .02); g.add(r);
      if(st === "soleil"){ const v = new THREE.Mesh(new THREE.CircleGeometry(.1, 16), mat("#1A1A24", { roughness: .2 })); v.position.set(s * .13, 0, z + .025); g.add(v); }
      if(st === "etoiles"){ g.add(boite(.05, .05, .02, "#FFD23F", s * .2, .1, z + .03)); } });
    g.add(boite(.08, .02, .02, st === "etoiles" ? "#FF4FB0" : "#22232B", 0, 0, z + .03));
  }
  if(st === "masque"){ const m = new THREE.Mesh(new THREE.SphereGeometry(TETE_R + .015, 20, 6, -Math.PI * .3, Math.PI * .6, Math.PI * .4, Math.PI * .16), mat(cfg.couleurHaut)); m.rotation.y = 0; g.add(m); m.position.y = .05; }
  if(st === "plongee"){ const m = new THREE.Mesh(new THREE.BoxGeometry(.42, .2, .1), mat("#4CC9F0", { transparent: true, opacity: .75, roughness: .1 })); m.position.set(0, .02, z + .02); g.add(m);
    g.add(new THREE.Mesh(new THREE.TorusGeometry(TETE_R + .01, .025, 6, 24), mat("#22232B")).rotateX(Math.PI / 2)); }
  g.position.y = .03;
  return g;
}
function dos3D(cfg){
  const g = new THREE.Group(), st = cfg.haut === "heros" && cfg.dos === "aucun" ? "cape" : cfg.dos;
  if(st === "cape"){ const c = boite(.78, 1.3, .04, mat(cfg.haut === "heros" ? "#E5484D" : cfg.couleurHaut, { side: THREE.DoubleSide }), 0, 1.1, -.3); c.rotation.x = .18; g.add(c); g.userData.cape = c; }
  if(st === "ailes") [-1, 1].forEach(s => { const a = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 8), mat("#FFE6F5", { transparent: true, opacity: .7, roughness: .2 })); a.scale.set(1, .7, .08); a.position.set(s * .42, 1.55, -.34); a.rotation.z = s * .5; g.add(a); });
  if(st === "sac"){ g.add(boite(.56, .62, .26, "#FF9F1C", 0, 1.35, -.34)); g.add(boite(.4, .22, .06, "#E5484D", 0, 1.2, -.48)); }
  if(st === "dragon") [-1, 1].forEach(s => { const a = cone(.28, .7, "#3FA34D", s * .42, 1.6, -.32, 3); a.rotation.z = -s * 1.1; a.scale.z = .2; g.add(a); });
  if(st === "fusee"){ [-1, 1].forEach(s => { g.add(cyl(.12, .14, .6, "#C9CED8", s * .16, 1.35, -.35, 10)); g.add(cone(.1, .3, "#FF9F1C", s * .16, .9, -.35, 8).rotateX(Math.PI)); }); }
  if(st === "carapace"){ const c = new THREE.Mesh(new THREE.SphereGeometry(.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat("#3FA34D")); c.rotation.x = -Math.PI / 2; c.position.set(0, 1.35, -.24); c.scale.set(1, 1, .6); g.add(c); }
  return g;
}

export function creerAvatar(cfg, options){
  cfg = Object.assign({}, DEFAUTS.invite, cfg || {}); options = options || {};
  const numero = options.numero;
  const racine = new THREE.Group(), base = new THREE.Group(), corps = new THREE.Group(); racine.add(base); base.add(corps);
  const peau = mat(cfg.peau), robe = cfg.haut === "robe" || cfg.haut === "princesse";
  const bas = mat(cfg.couleurBas), chaus = mat(cfg.chaussures);
  const longues = ["capuche", "pull", "chemise", "veste", "heros", "princesse"].includes(cfg.haut);
  const haut = mat(cfg.couleurHaut);
  // jambes
  const jambes = [];
  [-1, 1].forEach(s => {
    const j = new THREE.Group(); j.position.set(s * .2, .98, 0);
    const pant = !robe && (cfg.bas === "pantalon" || cfg.bas === "jogging");
    j.add(boite(.3, .4, .32, robe ? peau : pant || cfg.bas === "short" ? bas : peau, 0, -.16, 0));
    j.add(boite(.24, .44, .25, pant ? bas : peau, 0, -.55, 0));
    if(cfg.bas === "jogging" && !robe) j.add(boite(.26, .08, .27, "#FFFFFF", 0, -.72, 0));
    j.add(boite(.27, .17, .42, chaus, 0, -.88, .06));
    j.add(boite(.28, .05, .43, "#FFFFFF", 0, -.96, .06));
    corps.add(j); jambes.push(j);
  });
  if(cfg.bas === "jupe" && !robe) corps.add(cyl(.42, .52, .32, bas, 0, .86, 0, 14));
  // buste (le devant porte le motif)
  const mHaut = [haut, haut, haut, haut, new THREE.MeshStandardMaterial({ map: texHaut(cfg, numero, "devant"), roughness: .7 }), new THREE.MeshStandardMaterial({ map: texHaut(cfg, numero, "dos"), roughness: .7 })];
  const buste = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, .44), mHaut); buste.position.y = 1.38; buste.castShadow = true; corps.add(buste);
  if(robe){ const jupe = cyl(.42, cfg.haut === "princesse" ? .85 : .62, cfg.haut === "princesse" ? .85 : .6, haut, 0, cfg.haut === "princesse" ? .62 : .72, 0, 16); corps.add(jupe);
    if(cfg.haut === "princesse") corps.add(cyl(.86, .86, .06, "#FFD23F", 0, .21, 0, 16)); }
  if(cfg.haut === "capuche"){ const c = new THREE.Mesh(new THREE.SphereGeometry(.34, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), haut); c.rotation.x = -1.9; c.position.set(0, 1.74, -.2); c.scale.set(1, 1, .7); corps.add(c); }
  if(cfg.haut === "chemise" || cfg.haut === "veste") corps.add(boite(.5, .1, .46, cfg.haut === "chemise" ? "#FFFFFF" : haut, 0, 1.78, 0));
  // bras
  const bras = [];
  [-1, 1].forEach(s => {
    const b = new THREE.Group(); b.position.set(s * .53, 1.68, 0);
    b.add(boite(.24, .32, .26, haut, 0, -.13, 0));
    b.add(boite(.2, .42, .22, longues ? haut : peau, 0, -.47, 0));
    b.add(boite(.21, .2, .23, cfg.haut === "heros" ? mat("#FFD23F") : peau, 0, -.76, 0));
    corps.add(b); bras.push(b);
  });
  // cou, tête, cheveux, chapeau, lunettes
  corps.add(boite(.22, .14, .22, peau, 0, 1.84, 0));
  const tete = new THREE.Group(); tete.position.y = TETE_Y; corps.add(tete);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(TETE_R, 22, 16), new THREE.MeshStandardMaterial({ map: texVisage(cfg), roughness: .7 })); sph.castShadow = true; tete.add(sph);
  [-1, 1].forEach(s => tete.add(boule(.075, peau, s * .35, -.02, 0, 8)));
  tete.add(cheveux3D(cfg)); tete.add(chapeau3D(cfg)); tete.add(lunettes3D(cfg));
  const dos = dos3D(cfg); corps.add(dos);
  if(options.pose === "assis"){
    jambes.forEach(j => { j.rotation.x = -1.45; }); base.position.y = -.5;
  }
  racine.userData = { corps, tete, bras, jambes, cape: dos.userData.cape };
  return racine;
}
/* une petite animation commune : marcher / courir (v = vitesse), danser, saluer */
export function animerAvatar(av, t, mode, v){
  const u = av.userData; if(!u || !u.bras) return;
  if(mode === "danse"){
    u.bras[0].rotation.z = -2.4 + Math.sin(t * 8) * .5; u.bras[1].rotation.z = 2.4 + Math.sin(t * 8 + 1) * .5;
    u.corps.rotation.y = Math.sin(t * 4) * .4; u.corps.position.y = Math.abs(Math.sin(t * 8)) * .15;
    u.jambes[0].rotation.x = Math.sin(t * 8) * .3; u.jambes[1].rotation.x = -Math.sin(t * 8) * .3; u.tete.rotation.z = Math.sin(t * 4) * .2;
  }else if(mode === "salut"){
    u.bras[1].rotation.z = 2.6 + Math.sin(t * 10) * .35; u.bras[0].rotation.z = 0; u.corps.rotation.y = 0; u.corps.position.y = 0; u.tete.rotation.z = .1;
  }else if(mode === "course"){
    const a = Math.min(1, (v || 0) / 6) * .75;
    u.jambes[0].rotation.x = Math.sin(t) * a; u.jambes[1].rotation.x = -Math.sin(t) * a;
    u.bras[0].rotation.x = -Math.sin(t) * a * .8; u.bras[1].rotation.x = Math.sin(t) * a * .8;
  }else{
    u.bras[0].rotation.z = -.08 - Math.sin(t * 2) * .04; u.bras[1].rotation.z = .08 + Math.sin(t * 2) * .04; u.corps.rotation.y = 0; u.corps.position.y = Math.sin(t * 2) * .02;
    u.jambes.forEach(j => j.rotation.x = 0); u.tete.rotation.z = Math.sin(t * 1.3) * .05;
  }
  if(u.cape) u.cape.rotation.x = .18 + Math.sin(t * 3) * .05 + (mode === "course" ? Math.min(1, (v || 0) / 8) * .7 : 0);
}
