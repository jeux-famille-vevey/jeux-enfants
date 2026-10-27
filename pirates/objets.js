/* Les objets du monde des pirates.
   Chaque objet « simple » est fabriqué une seule fois en UNE géométrie (les couleurs sont dans les sommets),
   puis dessiné avec un InstancedMesh : 100 palmiers = 1 seul dessin pour la carte graphique (rapide sur les vieux ordinateurs).
   Les objets qui ont une partie « à colorier » (drapeau, cabane…) ont une 2e géométrie blanche, teintée par instance. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { mergeGeometries } from "../course3d/lib/BufferGeometryUtils.js";

/* ---------- petits outils de modelage ---------- */
function peindre(geo, couleur){
  geo = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(couleur), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for(let i = 0; i < n; i++){ a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
  // on ne garde que position, normal, color pour pouvoir tout fusionner
  for(const k of Object.keys(geo.attributes)) if(!["position", "normal", "color"].includes(k)) geo.deleteAttribute(k);
  return geo;
}
function place(geo, x, y, z, rx, ry, rz, sx, sy, sz){
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || sx || 1, sz || sx || 1));
  geo.applyMatrix4(m); return geo;
}
const B = (w, h, l, c, x, y, z, rx, ry, rz) => place(peindre(new THREE.BoxGeometry(w, h, l), c), x, y, z, rx, ry, rz);
const C = (r1, r2, h, c, x, y, z, seg, rx, ry, rz) => place(peindre(new THREE.CylinderGeometry(r1, r2, h, seg || 8), c), x, y, z, rx, ry, rz);
const S = (r, c, x, y, z, sx, sy, sz, seg) => place(peindre(new THREE.SphereGeometry(r, seg || 8, Math.max(4, (seg || 8) - 3)), c), x, y, z, 0, 0, 0, sx, sy, sz);
const K = (r, h, c, x, y, z, seg, rx, ry, rz) => place(peindre(new THREE.ConeGeometry(r, h, seg || 8), c), x, y, z, rx, ry, rz);
const fusion = (l) => { const g = mergeGeometries(l.filter(Boolean), false); g.computeBoundingSphere(); return g; };
const BLANC = "#FFFFFF";

/* ---------- le catalogue ----------
   r : rayon « solide » (on ne passe pas à travers) ; dessus : hauteur sur laquelle on peut grimper (0 = non) ;
   couleur : l'objet a une partie qu'on peut colorier ; special : objet animé géré à part. */
export const OBJETS = [
  { id:"palmier", nom:"Palmier", e:"🌴", r:.45 },
  { id:"arbre", nom:"Arbre", e:"🌳", r:.5 },
  { id:"fleurs", nom:"Fleurs", e:"🌺", r:0 },
  { id:"rocher", nom:"Rocher", e:"🪨", r:1, dessus:1.3 },
  { id:"caisse", nom:"Caisse", e:"📦", r:.8, dessus:1.2 },
  { id:"tonneau", nom:"Tonneau", e:"🛢️", r:.55, dessus:1.15 },
  { id:"canon", nom:"Canon", e:"💣", r:.7 },
  { id:"feu", nom:"Feu de camp", e:"🔥", r:.5 },
  { id:"torche", nom:"Torche", e:"🕯️", r:.15 },
  { id:"drapeau", nom:"Drapeau", e:"🚩", r:.15, couleur:true },
  { id:"tente", nom:"Tente", e:"⛺", r:1.2, couleur:true },
  { id:"cabane", nom:"Cabane", e:"🛖", r:1.5, couleur:true },
  { id:"phare", nom:"Phare", e:"🗼", r:1.1, couleur:true },
  { id:"coquillage", nom:"Coquillage", e:"🐚", r:0 },
  { id:"coffre", nom:"Coffre au trésor", e:"💰", r:0, special:true },
  { id:"piece", nom:"Pièces d'or", e:"🪙", r:0, special:true },
  { id:"bateau", nom:"Bateau", e:"⛵", r:0, special:true, couleur:true, eau:true },
  { id:"crabe", nom:"Crabe", e:"🦀", r:0, special:true }
];
export const PAR_ID = Object.fromEntries(OBJETS.map(o => [o.id, o]));

/* ---------- les formes (toutes posées sur y = 0, centrées sur la case) ---------- */
function palmier(){
  const l = [], tronc = "#9C6B3E";
  for(let k = 0; k < 7; k++) l.push(C(.24 - k * .015, .26 - k * .015, .8, k % 2 ? tronc : "#8A5A30", Math.sin(k * .35) * .25 * k / 6, .4 + k * .78, 0, 7));
  const hx = .38, hy = 5.6;
  for(let k = 0; k < 7; k++){ const a = k / 7 * Math.PI * 2;
    l.push(place(peindre(new THREE.BoxGeometry(.5, .07, 2.4), k % 2 ? "#3FA34D" : "#2E8B3E"), hx + Math.cos(a) * 1.05, hy - .35, Math.sin(a) * 1.05, .38, -a + Math.PI / 2, 0)); }
  l.push(S(.17, "#6B4A2A", hx + .15, hy - .25, .12)); l.push(S(.17, "#6B4A2A", hx - .15, hy - .3, -.1)); l.push(S(.17, "#6B4A2A", hx + .02, hy - .3, -.22));
  return fusion(l);
}
function arbre(){ return fusion([C(.3, .38, 2.2, "#7A4B2E", 0, 1.1, 0, 7), S(1.5, "#3FA34D", 0, 3.1, 0, 1, .9, 1, 9), S(1.1, "#4CBF5C", .6, 3.8, .3, 1, .9, 1, 8), S(1, "#2E8B3E", -.7, 3.4, -.3, 1, .9, 1, 8)]); }
function fleurs(){ const l = []; const c = ["#FF6F9F", "#FFD23F", "#FFFFFF", "#B9B3F5", "#FF9F1C"];
  for(let k = 0; k < 6; k++){ const x = Math.cos(k * 2.4) * .55, z = Math.sin(k * 2.4) * .55; l.push(C(.03, .03, .45, "#3FA34D", x, .22, z, 4)); l.push(S(.14, c[k % 5], x, .48, z, 1, .6, 1, 6)); l.push(S(.06, "#FFD23F", x, .54, z, 1, 1, 1, 4)); }
  return fusion(l); }
function rocher(){ return fusion([S(1.05, "#8A8F9C", 0, .55, 0, 1.1, .75, 1, 6), S(.6, "#9AA0AE", .55, .95, .2, 1, .8, 1, 5), S(.5, "#7A7F8C", -.5, .45, .5, 1, .8, 1, 5)]); }
function caisse(){ const b = "#B07A4A", f = "#7A4B2E"; return fusion([B(1.5, 1.2, 1.5, b, 0, .6, 0), B(1.56, .14, .14, f, 0, .1, .72), B(1.56, .14, .14, f, 0, 1.1, .72), B(1.56, .14, .14, f, 0, .1, -.72), B(1.56, .14, .14, f, 0, 1.1, -.72),
  B(.14, 1.2, .14, f, .72, .6, .72), B(.14, 1.2, .14, f, -.72, .6, .72), B(.14, 1.2, .14, f, .72, .6, -.72), B(.14, 1.2, .14, f, -.72, .6, -.72), B(1.9, .14, .1, f, 0, .6, .76, 0, 0, .65)]); }
function tonneau(){ return fusion([C(.5, .45, 1.15, "#A86B45", 0, .575, 0, 12), C(.47, .47, .06, "#7A4B2E", 0, 1.15, 0, 12), C(.53, .53, .1, "#5A5F6E", 0, .25, 0, 12), C(.53, .53, .1, "#5A5F6E", 0, .9, 0, 12)]); }
function canon(){ const n = "#2A2D38", bois = "#7A4B2E";
  return fusion([B(1.1, .45, 1.3, bois, 0, .45, 0), C(.32, .32, .12, "#5A3A22", .6, .32, .4, 10, 0, 0, Math.PI / 2), C(.32, .32, .12, "#5A3A22", -.6, .32, .4, 10, 0, 0, Math.PI / 2),
    C(.32, .32, .12, "#5A3A22", .6, .32, -.4, 10, 0, 0, Math.PI / 2), C(.32, .32, .12, "#5A3A22", -.6, .32, -.4, 10, 0, 0, Math.PI / 2),
    C(.28, .36, 1.9, n, 0, .95, .35, 10, Math.PI / 2 - .2, 0, 0), C(.32, .32, .12, n, 0, 1.12, 1.25, 10, Math.PI / 2 - .2, 0, 0), S(.3, n, 0, .95, -.55)]); }
function feu(){ const l = [];
  for(let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2; l.push(S(.2, "#7A7F8C", Math.cos(a) * .6, .12, Math.sin(a) * .6, 1, .7, 1, 5)); }
  for(let k = 0; k < 4; k++){ const a = k / 4 * Math.PI; l.push(C(.08, .08, 1, "#7A4B2E", 0, .2, 0, 5, Math.PI / 2, a, 0)); }
  return fusion(l); }
function flamme(){ return fusion([K(.35, .9, "#FF9F1C", 0, .65, 0, 7), K(.22, .7, "#FFD23F", .05, .6, .05, 6)]); }
function torche(){ return fusion([C(.06, .08, 1.8, "#7A4B2E", 0, .9, 0, 6), C(.13, .1, .25, "#5A5F6E", 0, 1.85, 0, 6)]); }
function flammeTorche(){ return fusion([K(.14, .4, "#FF9F1C", 0, 2.15, 0, 6), K(.08, .3, "#FFD23F", 0, 2.12, 0, 5)]); }
function drapeau(){ return fusion([C(.07, .09, 4, "#C9CED8", 0, 2, 0, 6), S(.13, "#FFD23F", 0, 4.05, 0)]); }
function drapeauTissu(){ return fusion([B(1.6, 1, .05, BLANC, .82, 3.4, 0)]); }
function tente(){ return fusion([B(.1, .1, 2.6, "#7A4B2E", 0, 1.9, 0), C(.06, .06, 1.95, "#7A4B2E", 0, .97, 1.25, 5), C(.06, .06, 1.95, "#7A4B2E", 0, .97, -1.25, 5)]); }
function tenteToile(){ return fusion([place(peindre(new THREE.CylinderGeometry(1.4, 1.4, 2.5, 3, 1, true), BLANC), 0, .7, 0, Math.PI / 2, 0, 0, 1, 1, .9)]); }
function cabane(){ const bois = "#A86B45", f = "#7A4B2E";
  const l = [B(2.6, 2.1, 2.4, bois, 0, 1.25, 0), B(2.7, .2, 2.5, f, 0, .1, 0), B(.8, 1.3, .06, "#5A3A22", 0, .85, 1.22), S(.06, "#FFD23F", .25, .85, 1.27),
    B(.6, .55, .06, "#BFE6FF", -.85, 1.45, 1.22), B(.7, .08, .08, f, -.85, 1.45, 1.26), B(.08, .62, .08, f, -.85, 1.45, 1.26)];
  for(const s of [-1, 1]) for(const t of [-1, 1]) l.push(B(.2, 2.3, .2, f, s * 1.25, 1.15, t * 1.15));
  return fusion(l); }
function cabaneToit(){ return fusion([place(peindre(new THREE.CylinderGeometry(.01, 2.1, 1.5, 4), BLANC), 0, 3.05, 0, 0, Math.PI / 4, 0, 1.15, 1, 1.05)]); }
function phare(){ const l = [C(1.25, 1.35, .5, "#8A8F9C", 0, .25, 0, 12)];
  for(let k = 0; k < 5; k++) l.push(C(1 - k * .1 - .05, 1 - k * .1, 1.2, k % 2 ? "#FFFFFF" : "#FFFFFF", 0, 1.1 + k * 1.2, 0, 12));
  l.push(C(.8, .8, .12, "#22232B", 0, 7.1, 0, 12)); l.push(C(.55, .55, .9, "#FFD23F", 0, 7.6, 0, 8)); l.push(K(.75, .7, "#22232B", 0, 8.4, 0, 8));
  return fusion(l); }
function phareBandes(){ const l = []; for(let k = 0; k < 5; k += 2) l.push(C(1 - k * .1 - .04, 1 - k * .1 + .01, 1.21, BLANC, 0, 1.1 + k * 1.2, 0, 12)); return fusion(l); }
function coquillage(){ const l = [];
  for(let k = 0; k < 3; k++){ const x = (k - 1) * .45, z = (k % 2) * .4 - .2; l.push(S(.2, ["#FFC9B9", "#FFE8D6", "#FFB3C7"][k], x, .08, z, 1, .45, .8, 7)); }
  l.push(K(.13, .35, "#F4E2A0", .5, .15, -.5, 6, 0, 0, 1.3)); l.push(place(peindre(new THREE.TorusGeometry(.15, .04, 4, 8), "#FF6F9F"), -.5, .05, .45, Math.PI / 2, 0, 0));
  return fusion(l); }

/* une forme par objet (+ éventuellement la partie à colorier) */
export function formes(){
  return {
    palmier: { g: palmier() }, arbre: { g: arbre() }, fleurs: { g: fleurs() }, rocher: { g: rocher() }, caisse: { g: caisse() },
    tonneau: { g: tonneau() }, canon: { g: canon() }, feu: { g: feu(), flamme: flamme() }, torche: { g: torche(), flamme: flammeTorche() },
    drapeau: { g: drapeau(), couleur: drapeauTissu() }, tente: { g: tente(), couleur: tenteToile() }, cabane: { g: cabane(), couleur: cabaneToit() },
    phare: { g: phare(), couleur: phareBandes() }, coquillage: { g: coquillage() }
  };
}

/* ---------- les objets animés (un groupe Three.js chacun) ---------- */
const matV = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75, flatShading: true });
export function creerCoffre(){
  const g = new THREE.Group(), bois = "#8A5A3B", or = "#FFD23F";
  g.add(new THREE.Mesh(fusion([B(1.3, .7, .9, bois, 0, .35, 0), B(1.34, .1, .94, or, 0, .05, 0), B(1.34, .1, .94, or, 0, .68, 0), B(.1, .72, .94, or, -.4, .36, 0), B(.1, .72, .94, or, .4, .36, 0)]), matV));
  const couv = new THREE.Group(); couv.position.set(0, .7, -.45); g.add(couv);
  couv.add(new THREE.Mesh(fusion([place(peindre(new THREE.CylinderGeometry(.45, .45, 1.3, 10, 1, false, 0, Math.PI), bois), 0, 0, .45, 0, 0, Math.PI / 2),
    B(.1, .1, .94, or, -.4, .4, .45), B(.1, .1, .94, or, .4, .4, .45), B(.22, .26, .08, or, 0, .02, .92)]), matV));
  const tresor = new THREE.Mesh(fusion([S(.5, "#FFD23F", 0, .55, 0, 1.1, .45, .75, 8), S(.12, "#E5484D", .3, .82, .1, 1, 1, 1, 6), S(.1, "#4CC9F0", -.25, .8, .05, 1, 1, 1, 6), S(.1, "#3FCF6A", 0, .85, -.15, 1, 1, 1, 6)]),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3, metalness: .4, emissive: "#664400", emissiveIntensity: .4, flatShading: true }));
  tresor.visible = false; g.add(tresor);
  g.userData = { couvercle: couv, tresor };
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; } });
  return g;
}
const geoPiece = place(new THREE.CylinderGeometry(.32, .32, .07, 16), 0, 0, 0, Math.PI / 2, 0, 0);
export const matPiece = new THREE.MeshStandardMaterial({ color: "#FFD23F", metalness: .6, roughness: .25, emissive: "#7A5A00", emissiveIntensity: .5 });
export function creerPieces(){
  const g = new THREE.Group();
  for(let k = 0; k < 3; k++){ const p = new THREE.Mesh(geoPiece, matPiece); p.position.set((k - 1) * .5, 1 + (k % 2) * .25, 0); g.add(p); }
  return g;
}
export function creerBateau(couleur){
  const g = new THREE.Group(), coque = "#8A5A3B", f = "#5A3A22";
  const c = new THREE.Mesh(fusion([
    B(2.4, .7, 5, coque, 0, .1, 0), B(2.6, .2, 5.2, f, 0, .5, 0), place(peindre(new THREE.CylinderGeometry(.01, 1.2, 1.6, 4), coque), 0, .1, 3.2, Math.PI / 2, Math.PI / 4, 0, 1, 1, .7),
    B(2, .1, 4.4, "#B07A4A", 0, .45, 0), C(.12, .14, 5.5, "#7A4B2E", 0, 3.1, .3, 6), B(.1, .1, 2.8, "#7A4B2E", 0, 1.6, -.3, 0, 0, 0),
    B(.5, .5, .5, "#A86B45", .6, .75, -1.6), C(.25, .22, .55, "#A86B45", -.6, .75, -1.6, 8), B(2.5, .25, .25, f, 0, .3, -2.5)
  ]), matV); c.castShadow = true; g.add(c);
  const voile = new THREE.Mesh(place(new THREE.PlaneGeometry(2.6, 3.4, 4, 4), 0, 3.2, .45, 0, 0, 0),
    new THREE.MeshStandardMaterial({ color: couleur || "#FFFFFF", side: THREE.DoubleSide, roughness: .8 }));
  // la voile est un peu gonflée
  const p = voile.geometry.attributes.position; for(let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i) - 3.2; p.setZ(i, .45 + (1 - (x / 1.3) ** 2) * (1 - (y / 1.7) ** 2) * .5); }
  voile.geometry.computeVertexNormals(); voile.castShadow = true; g.add(voile);
  // drapeau pirate en haut du mât
  const tete = new THREE.Mesh(new THREE.PlaneGeometry(.9, .6), new THREE.MeshBasicMaterial({ map: texDrapeauPirate(), side: THREE.DoubleSide }));
  tete.position.set(.47, 5.55, .3); tete.rotation.y = Math.PI / 2; g.add(tete);
  g.userData = { voile, tete };
  return g;
}
let texDP = null;
function texDrapeauPirate(){
  if(texDP) return texDP;
  const c = document.createElement("canvas"); c.width = 96; c.height = 64; const x = c.getContext("2d");
  x.fillStyle = "#16161C"; x.fillRect(0, 0, 96, 64); x.fillStyle = "#FFFFFF";
  x.beginPath(); x.arc(48, 26, 13, 0, 7); x.fill(); x.fillRect(40, 32, 16, 9);
  x.fillStyle = "#16161C"; x.beginPath(); x.arc(43, 25, 4, 0, 7); x.arc(53, 25, 4, 0, 7); x.fill();
  x.strokeStyle = "#FFFFFF"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(26, 44); x.lineTo(70, 58); x.moveTo(70, 44); x.lineTo(26, 58); x.stroke();
  texDP = new THREE.CanvasTexture(c); texDP.colorSpace = THREE.SRGBColorSpace; return texDP;
}
export function creerCrabe(){
  const g = new THREE.Group(), r = "#E5484D", corps = new THREE.Group(); g.add(corps);
  corps.add(new THREE.Mesh(fusion([S(.45, r, 0, .35, 0, 1, .55, .8, 8), S(.07, "#FFFFFF", -.15, .62, .3, 1, 1, 1, 5), S(.07, "#FFFFFF", .15, .62, .3, 1, 1, 1, 5),
    S(.035, "#16161C", -.15, .64, .36, 1, 1, 1, 4), S(.035, "#16161C", .15, .64, .36, 1, 1, 1, 4), C(.025, .025, .25, r, -.15, .5, .3, 4), C(.025, .025, .25, r, .15, .5, .3, 4)]), matV));
  const pinces = [];
  for(const s of [-1, 1]){ const p = new THREE.Group(); p.position.set(s * .5, .35, .25); corps.add(p);
    p.add(new THREE.Mesh(fusion([C(.05, .05, .35, r, s * .12, 0, .1, 4, Math.PI / 2, 0, 0), S(.16, r, s * .2, .02, .32, 1, .7, 1.2, 6), K(.06, .2, r, s * .27, .06, .45, 4, Math.PI / 2, 0, 0)]), matV));
    pinces.push(p);
    for(let k = 0; k < 3; k++){ g.add(new THREE.Mesh(fusion([B(.4, .05, .05, r, s * .55, .18, -.15 + k * .17, 0, 0, s * .5)]), matV)); }
  }
  g.userData = { corps, pinces };
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  return g;
}
export { matV };
