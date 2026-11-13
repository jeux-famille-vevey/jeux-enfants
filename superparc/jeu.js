/* Super Parc 3D : la super vitesse, le super saut, le ballon géant, les Costauds à pousser, les toboggans géants et le jet-ski. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { profils, avatarDe, creerAvatar, animerAvatar, auHasard } from "../commun/avatar.js";
import { lireManette } from "../commun/manette.js";

const $ = (id) => document.getElementById(id);
const lire = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } };
const ecrire = (k, v) => { try{ localStorage.setItem(k, v); }catch(e){} };
const tactile = matchMedia("(pointer: coarse)").matches || new URLSearchParams(location.search).has("tactile");
const ECH = .62;                    // la taille de nos personnages dans ce monde (en mètres)
const G = 26;                       // la gravité
const LAC = 130;                    // le lac commence ici (vers le sud, z positif)
const R_BALLON = 3;

/* ================= le menu ================= */
let profil = lire("avatar-profil", "mikael"); if(!profils().some(p => p.id === profil)) profil = profils()[0].id;
function remplirProfils(){
  const box = $("profils"); box.innerHTML = "";
  profils().forEach(p => { const b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
    b.onclick = () => { profil = p.id; ecrire("avatar-profil", profil); remplirProfils(); vitrine(); }; box.appendChild(b); });
}
$("monPerso").onclick = () => { location.href = "../avatar/?profil=" + encodeURIComponent(profil) + "&retour=../superparc/"; };
$("aide").innerHTML = tactile
  ? "👆 Le <b>rond à gauche</b> pour bouger · <b>⚡</b> super vitesse · <b>🦘</b> sauter (reste appuyé pour un <b>super saut</b>, appuie encore en l'air pour un double saut) · <b>💥</b> frapper le ballon ou pousser un Costaud · <b>🚤</b> monter sur le jet-ski. Glisse le doigt sur l'écran pour tourner la caméra."
  : "⌨️ <b>Flèches</b> pour bouger · <b>Maj</b> (la touche ⇧ au-dessus de Ctrl) = super vitesse · <b>Espace</b> (la grande barre en bas) = sauter, reste appuyé pour un <b>super saut</b>, appuie encore en l'air pour un double saut · <b>X</b> (en bas à gauche, à côté de W) = frapper · <b>E</b> (en haut, à côté de R) = jet-ski · la <b>souris</b> tourne la caméra.<br>🎮 Manette : ✕ sauter · ○ frapper · ▢ jet-ski · R2 super vitesse.";

/* ================= la scène ================= */
const canvas = $("c");
const rendu = new THREE.WebGLRenderer({ canvas, antialias: !tactile });
rendu.setPixelRatio(Math.min(devicePixelRatio || 1, tactile ? 1.25 : 1.5)); rendu.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color("#9ED8FF"); scene.fog = new THREE.Fog("#CFEBFF", 160, 700);
const camera = new THREE.PerspectiveCamera(60, 1, .3, 4000);
scene.add(new THREE.HemisphereLight("#FFFFFF", "#6E8F55", 1.5));
const soleil = new THREE.DirectionalLight("#FFF2D8", 2); soleil.position.set(-200, 300, 120); scene.add(soleil);
function taille(){ rendu.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener("resize", taille); taille();
const mat = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));

function texture(dessin, w, h, rep){ const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if(rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } t.anisotropy = 4; return t; }

/* ---- le sol, le terrain de foot, la plage, le lac, les montagnes ---- */
const herbe = texture((g, w, h) => { g.fillStyle = "#6FBF4E"; g.fillRect(0, 0, w, h); for(let i = 0; i < 2500; i++){ g.fillStyle = Math.random() < .5 ? "#7DCB59" : "#62AE45"; g.fillRect(Math.random() * w, Math.random() * h, 2, 5); } }, 256, 256, 120);
const sol = new THREE.Mesh(new THREE.PlaneGeometry(1200, 830), mat("#FFFFFF", { map: herbe })); sol.rotation.x = -Math.PI / 2; sol.position.z = LAC - 415; scene.add(sol);
const terrain = new THREE.Mesh(new THREE.PlaneGeometry(108, 68), mat("#FFFFFF", { map: texture((g, w, h) => {
  for(let i = 0; i < 12; i++){ g.fillStyle = i % 2 ? "#5DAE3E" : "#6BBE49"; g.fillRect(i * w / 12, 0, w / 12 + 1, h); }
  g.strokeStyle = "#FFFFFF"; g.lineWidth = 6; const m = 20; g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w / 2, h - m); g.stroke();
  g.beginPath(); g.arc(w / 2, h / 2, 90, 0, Math.PI * 2); g.stroke(); g.strokeRect(m, h / 2 - 150, 160, 300); g.strokeRect(w - m - 160, h / 2 - 150, 160, 300);
}, 1024, 640) })); terrain.rotation.x = -Math.PI / 2; terrain.position.y = .02; scene.add(terrain);
const sable = new THREE.Mesh(new THREE.PlaneGeometry(1200, 26), mat("#EAD7A4")); sable.rotation.x = -Math.PI / 2; sable.position.set(0, .03, LAC - 10); scene.add(sable);
const eauGeo = new THREE.PlaneGeometry(1400, 700, 70, 35); eauGeo.rotateX(-Math.PI / 2);
const eau = new THREE.Mesh(eauGeo, mat("#3E9BD6", { transparent: true, opacity: .92 })); eau.position.set(0, -.15, LAC + 350); scene.add(eau);
const eauBase = eauGeo.attributes.position.array.slice();
function vagues(t){ const p = eauGeo.attributes.position.array; for(let i = 0; i < p.length; i += 3){ const x = eauBase[i], z = eauBase[i + 2]; p[i + 1] = Math.sin(x * .05 + t * 1.3) * .25 + Math.cos(z * .07 + t) * .2; } eauGeo.attributes.position.needsUpdate = true; eauGeo.computeVertexNormals(); }
(function(){ // les montagnes de l'autre côté du lac
  const m1 = new THREE.MeshBasicMaterial({ color: "#7D8FB8", fog: false }), m2 = new THREE.MeshBasicMaterial({ color: "#F4F7FF", fog: false });
  for(let i = 0; i < 22; i++){ const x = -2600 + i * 250 + Math.sin(i * 5) * 80, h = 260 + Math.abs(Math.sin(i * 2.1)) * 330, w = 700 + Math.abs(Math.cos(i)) * 400, z = 2600 + Math.sin(i) * 300;
    const c = new THREE.Mesh(new THREE.ConeGeometry(w / 2, h, 5), m1); c.position.set(x, h / 2 - 40, z); c.rotation.y = i; scene.add(c);
    if(h > 420){ const n = new THREE.Mesh(new THREE.ConeGeometry(w / 2 * .3, h * .3, 5), m2); n.position.set(x, h - 40 - h * .15, z); n.rotation.y = i; scene.add(n); } }
  // la ville au loin (au nord)
  for(let i = 0; i < 40; i++){ const h = 20 + Math.random() * 60, b = new THREE.Mesh(new THREE.BoxGeometry(20 + Math.random() * 20, h, 20 + Math.random() * 20), mat(["#E8E2D6", "#F2D7BC", "#DCE8F0", "#F5E3C8", "#C9CED8"][i % 5]));
    b.position.set(-500 + i * 26 + Math.random() * 10, h / 2, -330 - Math.random() * 120); scene.add(b); }
})();

/* ---- ce qu'on ne peut pas traverser (cercles) et ce sur quoi on peut monter (plateformes) ---- */
const obstacles = [];   // { x, z, r, h }
const plateformes = []; // { x, z, r, h } ronds, ou { x0, x1, z0, z1, h } rectangles
function hauteurSol(x, z, yActuel){
  let h = z > LAC ? -1.1 : 0;
  for(const p of plateformes){
    const dedans = p.r !== undefined ? Math.hypot(x - p.x, z - p.z) < p.r : (x > p.x0 && x < p.x1 && z > p.z0 && z < p.z1);
    if(dedans && p.h > h && (yActuel === undefined || yActuel >= p.h - .6)) h = p.h;
  }
  return h;
}
/* ---- les buts ---- */
function but(x, sens, couleur){
  const g = new THREE.Group(), blanc = mat("#FFFFFF"), filet = new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: .35, side: THREE.DoubleSide });
  [-7, 7].forEach(z => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 7, 10), blanc); p.position.set(0, 3.5, z); g.add(p); obstacles.push({ x, z, r: .4, h: 7, poteau: true }); });
  const barre = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 14.6, 10), blanc); barre.rotation.x = Math.PI / 2; barre.position.y = 7; g.add(barre);
  const fond = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), filet); fond.position.set(sens * 5, 3.5, 0); fond.rotation.y = Math.PI / 2; g.add(fond);
  [-7, 7].forEach(z => { const c = new THREE.Mesh(new THREE.PlaneGeometry(5, 7), filet); c.position.set(sens * 2.5, 3.5, z); g.add(c); });
  const drapeau = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshLambertMaterial({ color: couleur, side: THREE.DoubleSide })); drapeau.position.set(0, 9, 0); g.add(drapeau);
  g.position.set(x, 0, 0); scene.add(g);
}
but(54, 1, "#E5484D");   // le but où TU dois marquer (celui des Costauds, rouge)
but(-54, -1, "#3D7BD9"); // ton but (bleu)

/* ---- les arbres et les palmiers ---- */
(function(){
  const pos = [];
  for(let i = 0; i < 120; i++){ const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 300, x = Math.cos(a) * r * 1.2, z = Math.sin(a) * r * .9 - 60; if(z > LAC - 30 || (Math.abs(x) < 70 && Math.abs(z) < 50)) continue; pos.push([x, z, Math.random() < .4]); }
  const tronc = mat("#8A5A3B"), feuille = [mat("#4E9A45"), mat("#5BAA4E"), mat("#3F8A3C")], palme = mat("#3FA34D");
  for(const [x, z, palmier] of pos){
    const g = new THREE.Group();
    if(palmier){ const t = new THREE.Mesh(new THREE.CylinderGeometry(.35, .5, 11, 7), tronc); t.position.y = 5.5; t.rotation.z = .08; g.add(t);
      for(let k = 0; k < 6; k++){ const f = new THREE.Mesh(new THREE.BoxGeometry(.5, .15, 6), palme); f.position.set(Math.sin(k) * 2.4, 11, Math.cos(k) * 2.4); f.rotation.y = k; f.rotation.x = .45; g.add(f); } }
    else { const t = new THREE.Mesh(new THREE.CylinderGeometry(.45, .6, 4, 7), tronc); t.position.y = 2; g.add(t); const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3.6, 0), feuille[Math.floor(Math.random() * 3)]); c.position.y = 6.5; g.add(c); }
    g.position.set(x, 0, z); scene.add(g); obstacles.push({ x, z, r: .8, h: palmier ? 11 : 9 });
  }
})();

/* ================= les toboggans géants ================= */
const toboggans = [];
function tour(x, z, h, couleur){
  const g = new THREE.Group(), m = mat(couleur), bois = mat("#C4834F");
  for(let k = 0; k < 4; k++){ const a = k * Math.PI / 2 + Math.PI / 4, px = Math.cos(a) * 3.2, pz = Math.sin(a) * 3.2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, h, 8), m); p.position.set(px, h / 2, pz); g.add(p); obstacles.push({ x: x + px, z: z + pz, r: .5, h }); }
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, .6, 20), bois); plat.position.y = h - .3; g.add(plat);
  const toit = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.5, 20), m); toit.position.y = h + 5.5; g.add(toit);
  for(let k = 0; k < 4; k++){ const a = k * Math.PI / 2 + Math.PI / 4, c = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 3.8, 6), m); c.position.set(Math.cos(a) * 4.2, h + 1.9, Math.sin(a) * 4.2); g.add(c); }
  // l'échelle (côté nord)
  const ech = new THREE.Group(); [-.6, .6].forEach(dx => { const m2 = new THREE.Mesh(new THREE.BoxGeometry(.15, h, .15), bois); m2.position.set(dx, h / 2, 0); ech.add(m2); });
  for(let y = 1; y < h; y += 1) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.3, .12, .12), bois); b.position.set(0, y, 0); ech.add(b); }
  ech.position.set(0, 0, -4.8); g.add(ech);
  g.position.set(x, 0, z); scene.add(g);
  plateformes.push({ x, z, r: 4.6, h });
  return { echelle: { x, z: z - 4.8, h, haut: { x, z: z - 2 } } };
}
function toboggan(points, couleur, tourInfo){
  const courbe = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, "centripetal");
  const geo = new THREE.TubeGeometry(courbe, 260, 1.9, 14, false);
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: couleur, side: THREE.DoubleSide, transparent: true, opacity: .72 })); scene.add(m);
  toboggans.push({ courbe, L: courbe.getLength(), depart: courbe.getPointAt(0), tour: tourInfo });
}
// le toboggan en spirale (20 m)
const t1 = tour(-120, -55, 20, "#FF6F9F");
(function(){ const pts = [[-120, 20.2, -51]]; for(let i = 1; i <= 40; i++){ const a = Math.PI / 2 + i * .28, r = 9; pts.push([-120 + Math.cos(a) * r, 20 - i * .49, -55 + Math.sin(a) * r]); } pts.push([-120 + Math.cos(Math.PI / 2 + 41 * .28) * 16, .8, -55 + Math.sin(Math.PI / 2 + 41 * .28) * 16]); toboggan(pts, "#FFD23F", t1); })();
// le grand toboggan qui finit dans le lac (26 m)
const t2 = tour(70, 60, 26, "#3D7BD9");
toboggan([[70, 26.2, 64], [72, 24, 72], [60, 20, 84], [80, 16, 96], [62, 11, 108], [74, 7, 120], [70, 4, 134], [70, 2.2, 146]], "#4CC9F0", t2);
// un petit toboggan près du terrain (12 m)
const t3 = tour(-80, 40, 12, "#8E5BC4");
toboggan([[-80, 12.2, 44], [-80, 10, 52], [-70, 6, 60], [-62, 3, 62], [-54, .8, 64]], "#FF9F1C", t3);

/* ================= le ponton, le jet-ski et les tremplins ================= */
const ponton = { x0: 20, x1: 26, z0: LAC - 4, z1: LAC + 36, h: .9 };
plateformes.push(ponton);
(function(){ const p = new THREE.Mesh(new THREE.BoxGeometry(ponton.x1 - ponton.x0, .4, ponton.z1 - ponton.z0), mat("#B07A4A")); p.position.set((ponton.x0 + ponton.x1) / 2, ponton.h - .2, (ponton.z0 + ponton.z1) / 2); scene.add(p);
  for(let z = ponton.z0 + 2; z < ponton.z1; z += 6) [ponton.x0 + .3, ponton.x1 - .3].forEach(x => { const q = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 3, 6), mat("#8A5A3B")); q.position.set(x, -.5, z); scene.add(q); }); })();
function modeleJetski(){
  const g = new THREE.Group(), coque = mat("#FFD23F"), noir = mat("#22232B"), bleu = mat("#3D7BD9");
  const c = new THREE.Mesh(new THREE.BoxGeometry(1.4, .6, 3.4), coque); c.position.y = .3; g.add(c);
  const nez = new THREE.Mesh(new THREE.ConeGeometry(.7, 1.4, 4), coque); nez.rotation.x = Math.PI / 2; nez.rotation.y = Math.PI / 4; nez.position.set(0, .3, 2.3); nez.scale.set(1, 1, .5); g.add(nez);
  const selle = new THREE.Mesh(new THREE.BoxGeometry(.7, .35, 1.6), noir); selle.position.set(0, .75, -.4); g.add(selle);
  const guidon = new THREE.Mesh(new THREE.BoxGeometry(1.2, .1, .1), noir); guidon.position.set(0, 1.25, .8); g.add(guidon);
  const colonne = new THREE.Mesh(new THREE.BoxGeometry(.2, .6, .2), bleu); colonne.position.set(0, .95, .75); g.add(colonne);
  const bande = new THREE.Mesh(new THREE.BoxGeometry(1.45, .15, 3.3), bleu); bande.position.y = .1; g.add(bande);
  return g;
}
const jetski = { g: modeleJetski(), x: 30, z: LAC + 20, y: 0, yaw: Math.PI / 2, v: 0, vy: 0, enAir: false };
scene.add(jetski.g);
const tremplins = [[60, LAC + 90, 0], [-40, LAC + 120, Math.PI / 4], [140, LAC + 60, -Math.PI / 3], [10, LAC + 200, Math.PI]];
tremplins.forEach(([x, z, a]) => { const g = new THREE.Mesh(new THREE.BoxGeometry(6, .5, 12), mat("#FF6F9F")); g.position.set(x, 1.3, z); g.rotation.y = a; g.rotation.x = -.26; scene.add(g);
  const b = new THREE.Mesh(new THREE.BoxGeometry(6.4, .6, .6), mat("#FFFFFF")); b.position.set(x, .2, z); b.rotation.y = a; scene.add(b); });
// des bouées pour faire le tour
for(let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2, b = new THREE.Mesh(new THREE.SphereGeometry(.8, 10, 8), mat(i % 2 ? "#E5484D" : "#FFFFFF")); b.position.set(30 + Math.cos(a) * 110, .2, LAC + 130 + Math.sin(a) * 70); scene.add(b); }

/* ================= le ballon géant ================= */
function textureBallon(){
  return texture((g, w, h) => {
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h); g.fillStyle = "#22232B";
    const pts = [[90, 0]]; for(let i = 0; i < 5; i++) pts.push([26.57, i * 72]); for(let i = 0; i < 5; i++) pts.push([-26.57, i * 72 + 36]); pts.push([-90, 0]);
    for(const [lat, lon] of pts){
      const y = (90 - lat) / 180 * h, rr = h * .085;
      if(Math.abs(lat) > 80){ g.fillRect(0, lat > 0 ? 0 : h - rr * .9, w, rr * .9); continue; }
      [lon, lon + 360, lon - 360].forEach(lo => { const x = lo / 360 * w, sx = 1 / Math.cos(lat * Math.PI / 180);
        g.beginPath(); for(let k = 0; k < 5; k++){ const a = k / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * rr * sx, y + Math.sin(a) * rr); } g.closePath(); g.fill(); });
    }
  }, 1024, 512);
}
const ballon = { m: new THREE.Mesh(new THREE.SphereGeometry(R_BALLON, 32, 20), mat("#FFFFFF", { map: textureBallon() })), p: new THREE.Vector3(0, R_BALLON, 0), v: new THREE.Vector3() };
scene.add(ballon.m);
const ombreBallon = new THREE.Mesh(new THREE.CircleGeometry(R_BALLON * .9, 24), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: .25, depthWrite: false })); ombreBallon.rotation.x = -Math.PI / 2; scene.add(ombreBallon);

/* ================= les étoiles à attraper ================= */
const ETOILES = [[-120, 24, -55], [70, 30, 60], [-80, 15, 40], [0, 18, 0], [-60, 22, -20], [120, 26, -40], [40, 14, -90], [-160, 10, 20], [160, 12, 40],
  [23, 4, LAC + 34], [60, 9, LAC + 75], [-40, 9, LAC + 105], [140, 9, LAC + 48], [10, 9, LAC + 188], [30, 3, LAC + 240], [-150, 30, -120], [200, 20, -100], [70, 18, 100], [-120, 6, -42], [0, 34, -40]];
const formeEtoile = (() => { const s = new THREE.Shape(); for(let i = 0; i < 10; i++){ const r = i % 2 ? .55 : 1.3, a = i / 10 * Math.PI * 2 + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return new THREE.ExtrudeGeometry(s, { depth: .4, bevelEnabled: false }); })();
const matEtoile = new THREE.MeshLambertMaterial({ color: "#FFD23F", emissive: "#7A5A00" });
let etoiles = [];
function placerEtoiles(){ etoiles.forEach(e => scene.remove(e.m)); etoiles = ETOILES.map(p => { const m = new THREE.Mesh(formeEtoile, matEtoile); m.position.set(p[0], p[1], p[2]); scene.add(m); return { m, prise: false }; });
  $("totEtoiles").textContent = etoiles.length; $("nEtoiles").textContent = 0; }

/* ================= les effets : poussière, éclaboussures, confettis, traînée de vitesse ================= */
const effets = [];
const geoBoule = new THREE.SphereGeometry(.35, 6, 5);
function particule(pos, vel, couleur, vie, taille, gravite){
  const m = new THREE.Mesh(geoBoule, new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: .9 })); m.position.copy(pos); m.scale.setScalar(taille || 1); scene.add(m);
  effets.push({ m, v: vel, vie, t: 0, g: gravite === undefined ? G * .6 : gravite });
}
function anneau(pos, couleur){ const m = new THREE.Mesh(new THREE.RingGeometry(.8, 1.4, 32), new THREE.MeshBasicMaterial({ color: couleur || "#FFFFFF", transparent: true, opacity: .8, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.copy(pos); m.position.y += .1; scene.add(m); effets.push({ m, anneau: true, vie: .6, t: 0 }); }
function eclabousse(pos, n){ for(let i = 0; i < (n || 18); i++) particule(pos, new THREE.Vector3((Math.random() - .5) * 10, 6 + Math.random() * 8, (Math.random() - .5) * 10), Math.random() < .5 ? "#FFFFFF" : "#BFE8FF", 1, .6 + Math.random() * .6); }
function confettis(pos){ const c = ["#E5484D", "#FFD23F", "#3FA34D", "#3D7BD9", "#FF6F9F", "#8E5BC4"]; for(let i = 0; i < 70; i++) particule(pos, new THREE.Vector3((Math.random() - .5) * 26, 10 + Math.random() * 16, (Math.random() - .5) * 26), c[i % c.length], 2.2, .5 + Math.random() * .5, 12); }
function animerEffets(dt){
  for(let i = effets.length - 1; i >= 0; i--){ const e = effets[i]; e.t += dt; const k = e.t / e.vie;
    if(e.anneau){ e.m.scale.setScalar(1 + k * 9); e.m.material.opacity = .8 * (1 - k); }
    else { e.v.y -= e.g * dt; e.m.position.addScaledVector(e.v, dt); e.m.material.opacity = .9 * (1 - k); if(e.trainee) e.m.scale.setScalar((1 - k) * e.trainee); }
    if(k >= 1){ scene.remove(e.m); e.m.material.dispose(); if(e.anneau) e.m.geometry.dispose(); effets.splice(i, 1); } }
}

/* ================= les sons (fabriqués) ================= */
let ac = null, sonOn = lire("superparc-son") !== "0", moteur = null;
function audio(){ try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === "suspended") ac.resume(); }catch(e){} return ac; }
function note(f, t0, d, type, v){ const a = audio(); if(!a || !sonOn) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0); o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03); }
function glisse(f1, f2, d, type, v){ const a = audio(); if(!a || !sonOn) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = type || "sine"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03); }
function bruit(d, v, f){ const a = audio(); if(!a || !sonOn) return; const n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); for(let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), g = a.createGain(), fi = a.createBiquadFilter(); fi.type = "lowpass"; fi.frequency.value = f || 1200; s.buffer = b; g.gain.value = v || .2; s.connect(fi); fi.connect(g); g.connect(a.destination); s.start(); }
const SON = {
  saut: () => glisse(300, 700, .15, "sine", .12), superSaut: () => { glisse(200, 1400, .5, "triangle", .12); }, atterrit: () => { note(70, 0, .25, "sine", .5); bruit(.3, .2, 400); },
  frappe: () => { note(90, 0, .15, "sine", .5); bruit(.08, .25, 2000); }, boing: () => glisse(500, 180, .3, "square", .06),
  but: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * .09, .35, "triangle", .1)); bruit(1.2, .12, 3000); },
  etoile: () => { note(1318, 0, .15); note(1760, .08, .25); }, splash: () => bruit(.7, .3, 2500), toboggan: () => glisse(800, 300, 1.2, "sine", .06),
  rire: () => [0, .1, .2].forEach(t => note(600 + Math.random() * 200, t, .08, "triangle", .08)), victoire: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => note(f, i * .15, .3, "triangle", .12))
};
function son(n){ if(sonOn) try{ SON[n](); }catch(e){} }
function sonMoteur(v){
  const a = audio(); if(!a) return;
  if(!moteur){ const o = a.createOscillator(), g = a.createGain(); o.type = "sawtooth"; o.frequency.value = 60; g.gain.value = 0; const f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 600; o.connect(f); f.connect(g); g.connect(a.destination); o.start(); moteur = { o, g }; }
  moteur.o.frequency.setTargetAtTime(55 + Math.abs(v) * 5, a.currentTime, .1); moteur.g.gain.setTargetAtTime(sonOn && v !== null ? .03 + Math.min(.05, Math.abs(v) * .002) : 0, a.currentTime, .1);
}
$("sonBtn").onclick = () => { sonOn = !sonOn; ecrire("superparc-son", sonOn ? "1" : "0"); $("sonBtn").textContent = sonOn ? "🔊" : "🔇"; if(!sonOn) sonMoteur(null); };
$("sonBtn").textContent = sonOn ? "🔊" : "🔇";

/* ================= les Costauds (les adversaires) ================= */
const costauds = [];
const etoilesTete = () => { const g = new THREE.Group(); for(let i = 0; i < 4; i++){ const e = new THREE.Mesh(formeEtoile, matEtoile); e.scale.setScalar(.35); e.position.set(Math.cos(i * 1.57) * 1, 0, Math.sin(i * 1.57) * 1); g.add(e); } g.visible = false; return g; };
function creerCostauds(){
  costauds.forEach(c => scene.remove(c.g)); costauds.length = 0;
  for(let i = 0; i < 3; i++){
    const cfg = Object.assign(auHasard(), { haut: "#E5484D", bas: "#22232B" });
    const g = creerAvatar(cfg, { numero: 7 + i }); g.scale.setScalar(ECH * 1.15); scene.add(g);
    const tete = etoilesTete(); tete.position.y = 4.4; g.add(tete);
    costauds.push({ g, p: new THREE.Vector3(30 + i * 6, 0, -14 + i * 14), v: new THREE.Vector3(), etat: "joue", t: 0, assomme: 0, tete, vite: 9 + i * .8, cdBouscule: 2 + i });
  }
}

/* ================= toi ================= */
let joueur = null;
const J = { p: new THREE.Vector3(-20, 0, 0), v: new THREE.Vector3(), mode: "sol", saut2: true, charge: 0, chargeOn: false, tob: null, u: 0, vt: 0, frappe: 0, t: 0, echelle: null, cdTob: 0, sonne: 0 };
function creerJoueur(){
  if(joueur) scene.remove(joueur);
  const P = profils().find(p => p.id === profil);
  joueur = creerAvatar(avatarDe(profil), { numero: P && P.numero }); joueur.scale.setScalar(ECH); scene.add(joueur);
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(.8, 16), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: .25, depthWrite: false })); ombre.rotation.x = -Math.PI / 2; ombre.name = "ombre"; scene.add(ombre); J.ombre = ombre;
}
let persoVitrine = null;
function vitrine(){ if(persoVitrine) scene.remove(persoVitrine); const P = profils().find(p => p.id === profil); persoVitrine = creerAvatar(avatarDe(profil), { numero: P && P.numero }); persoVitrine.position.set(-8, 0, 6); scene.add(persoVitrine); }

/* ================= les commandes ================= */
const touches = {};
addEventListener("keydown", (e) => { if(e.repeat){ touches[e.code] = true; return; } touches[e.code] = true; if(etat === "jeu"){
  if(e.code === "Space"){ appuiSaut(); e.preventDefault(); } if(e.code === "KeyX" || e.code === "KeyK" || e.code === "KeyF") frapper(); if(e.code === "KeyE") jetskiAction();
  if(e.code.startsWith("Arrow")) e.preventDefault(); } });
addEventListener("keyup", (e) => { touches[e.code] = false; if(e.code === "Space" && etat === "jeu") lacheSaut(); });
addEventListener("blur", () => { for(const k in touches) touches[k] = false; });
let joy = { x: 0, y: 0, id: null }, courseT = false;
(function(){
  const j = $("joy"), bouton = j.firstElementChild;
  const bouge = (e) => { const r = j.getBoundingClientRect(); let dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(dx, dy); if(l > 1){ dx /= l; dy /= l; } joy.x = dx; joy.y = dy; bouton.style.transform = "translate(" + dx * 42 + "px," + dy * 42 + "px)"; };
  j.addEventListener("pointerdown", (e) => { joy.id = e.pointerId; try{ j.setPointerCapture(e.pointerId); }catch(er){} bouge(e); e.preventDefault(); });
  j.addEventListener("pointermove", (e) => { if(e.pointerId === joy.id) bouge(e); });
  const fin = (e) => { if(e.pointerId !== joy.id) return; joy = { x: 0, y: 0, id: null }; bouton.style.transform = ""; }; j.addEventListener("pointerup", fin); j.addEventListener("pointercancel", fin);
  $("tSaut").addEventListener("pointerdown", (e) => { appuiSaut(); e.preventDefault(); }); $("tSaut").addEventListener("pointerup", lacheSaut); $("tSaut").addEventListener("pointercancel", lacheSaut);
  $("tFrappe").addEventListener("pointerdown", (e) => { frapper(); e.preventDefault(); });
  $("tCourse").addEventListener("pointerdown", (e) => { courseT = !courseT; $("tCourse").classList.toggle("on", courseT); e.preventDefault(); });
  $("tMonter").addEventListener("pointerdown", (e) => { jetskiAction(); e.preventDefault(); });
})();
const cam = { yaw: Math.PI / 2 * -1 + Math.PI, pitch: .35, dist: 10 };
let glisseCam = null;
canvas.addEventListener("pointerdown", (e) => { if(etat === "jeu"){ glisseCam = { id: e.pointerId, x: e.clientX, y: e.clientY }; try{ canvas.setPointerCapture(e.pointerId); }catch(er){} audio(); } });
canvas.addEventListener("pointermove", (e) => { if(glisseCam && e.pointerId === glisseCam.id){ cam.yaw -= (e.clientX - glisseCam.x) * .006; cam.pitch = Math.max(.05, Math.min(1.3, cam.pitch + (e.clientY - glisseCam.y) * .004)); glisseCam.x = e.clientX; glisseCam.y = e.clientY; } });
const finCam = (e) => { if(glisseCam && e.pointerId === glisseCam.id) glisseCam = null; }; canvas.addEventListener("pointerup", finCam); canvas.addEventListener("pointercancel", finCam);
canvas.addEventListener("wheel", (e) => { if(etat === "jeu"){ cam.dist = Math.max(5, Math.min(30, cam.dist * (e.deltaY > 0 ? 1.1 : .9))); e.preventDefault(); } }, { passive: false });

/* ================= sauter (et le super saut) ================= */
function auSol(){ return J.mode === "sol" || J.mode === "nage"; }
function appuiSaut(){
  audio();
  if(J.mode === "jetski"){ if(!jetski.enAir){ jetski.vy = 9; jetski.enAir = true; son("saut"); } return; }
  if(J.mode === "echelle") return;
  if(auSol()){ J.chargeOn = true; J.charge = 0; return; }
  if(J.mode === "air" && J.saut2){ J.saut2 = false; J.v.y = 13; son("saut"); anneau(J.p, "#7FD3FF"); }
}
function lacheSaut(){
  if(!J.chargeOn) return; J.chargeOn = false; $("jauge").classList.remove("on");
  if(!auSol()) return;
  const c = Math.min(1, J.charge / 1.1);
  if(c < .15){ J.v.y = 10.5; son("saut"); } else { J.v.y = 11 + c * 24; son("superSaut"); anneau(J.p, "#FFD23F"); for(let i = 0; i < 12; i++) particule(J.p.clone(), new THREE.Vector3((Math.random() - .5) * 8, 2, (Math.random() - .5) * 8), "#E8DCC0", .6, .8, 0); }
  J.mode = "air"; J.saut2 = true; J.charge = 0;
}

/* ================= frapper : le ballon ou un Costaud ================= */
function frapper(){
  if(J.frappe > 0 || J.mode === "jetski" || J.mode === "toboggan" || J.mode === "echelle") return; J.frappe = .35; audio();
  const avant = new THREE.Vector3(Math.sin(joueur.rotation.y), 0, Math.cos(joueur.rotation.y)), vit = Math.hypot(J.v.x, J.v.z);
  // le ballon
  const vb = ballon.p.clone().sub(J.p); vb.y = 0; const d = vb.length() - R_BALLON;
  if(d < 2.4 && Math.abs(ballon.p.y - J.p.y) < R_BALLON + 3){ const dir = vb.normalize().add(avant).normalize(); ballon.v.x = dir.x * (24 + vit * .8); ballon.v.z = dir.z * (24 + vit * .8); ballon.v.y = 9 + vit * .3; son("frappe"); anneau(ballon.p.clone().setY(J.p.y), "#FFFFFF"); return; }
  // un Costaud devant nous
  for(const c of costauds){
    const v = c.p.clone().sub(J.p); v.y = 0; const dist = v.length(); if(dist > 3.4) continue; v.normalize(); if(v.dot(avant) < .2 && dist > 2.4) continue;
    c.v.set(v.x * 20, 12, v.z * 20); c.etat = "vole"; c.assomme = 3; son("boing"); setTimeout(() => son("rire"), 250);
    for(let i = 0; i < 10; i++) particule(c.p.clone().setY(c.p.y + 2), new THREE.Vector3((Math.random() - .5) * 8, Math.random() * 8, (Math.random() - .5) * 8), "#FFD23F", .5, .5);
    return;
  }
  son("saut");
}

/* ================= le jet-ski ================= */
function presDuJetski(){ return Math.hypot(J.p.x - jetski.x, J.p.z - jetski.z) < 4.5; }
function jetskiAction(){
  audio();
  if(J.mode === "jetski"){ // descendre
    J.mode = "air"; J.saut2 = true; const surPonton = jetski.x > ponton.x0 - 8 && jetski.x < ponton.x1 + 8 && jetski.z < ponton.z1 + 6;
    if(surPonton){ J.p.set((ponton.x0 + ponton.x1) / 2, ponton.h + .5, Math.min(ponton.z1 - 1, Math.max(ponton.z0 + 1, jetski.z))); } else { J.p.set(jetski.x + Math.cos(jetski.yaw) * 2, jetski.y + 2, jetski.z - Math.sin(jetski.yaw) * 2); }
    J.v.set(0, 6, 0); jetski.v = 0; sonMoteur(null); message("🚶", .8); return;
  }
  if(presDuJetski() && J.mode !== "toboggan"){ J.mode = "jetski"; jetski.v = 0; message("🚤 C'est parti !", 1.2); son("superSaut"); }
}
function surTremplin(x, z){
  for(const [tx, tz, a] of tremplins){ const dx = x - tx, dz = z - tz, lz = dx * Math.sin(a) + dz * Math.cos(a), lx = dx * Math.cos(a) - dz * Math.sin(a);
    if(Math.abs(lx) < 3.2 && Math.abs(lz) < 6.2) return { h: 1.3 + lz * .26 + .25, a, fin: lz > 4.8 }; }
  return null;
}
function majJetski(dt, ax, az, boost){
  const vmax = boost ? 34 : 22;
  jetski.v += (az * vmax - jetski.v) * Math.min(1, dt * (az ? 1.2 : .6));
  jetski.yaw += -ax * dt * (1.6 + Math.min(1, Math.abs(jetski.v) / 10)) * (jetski.v < 0 ? -1 : 1);
  let nx = jetski.x + Math.sin(jetski.yaw) * jetski.v * dt, nz = jetski.z + Math.cos(jetski.yaw) * jetski.v * dt;
  if(nz < LAC + 3 || Math.abs(nx) > 560 || nz > LAC + 600 || (nx > ponton.x0 - 1.2 && nx < ponton.x1 + 1.2 && nz < ponton.z1 + 1 && nz > ponton.z0)){ jetski.v *= -.3; nx = jetski.x; nz = jetski.z; }
  jetski.x = nx; jetski.z = nz;
  const tr = surTremplin(nx, nz), eauY = Math.sin(nx * .05 + temps * 1.3) * .25 + Math.cos(nz * .07 + temps) * .2 - .1;
  if(jetski.enAir){ jetski.vy -= G * dt; jetski.y += jetski.vy * dt; if(jetski.y <= eauY){ jetski.y = eauY; jetski.enAir = false; if(jetski.vy < -6){ eclabousse(new THREE.Vector3(nx, 0, nz), 26); son("splash"); } jetski.vy = 0; } }
  else if(tr){ jetski.y = tr.h; if(tr.fin && jetski.v > 6){ jetski.enAir = true; jetski.vy = jetski.v * .55; son("superSaut"); } }
  else jetski.y = eauY;
  // les gerbes d'eau derrière
  if(Math.abs(jetski.v) > 4 && !jetski.enAir && Math.random() < .6) particule(new THREE.Vector3(nx - Math.sin(jetski.yaw) * 2, .2, nz - Math.cos(jetski.yaw) * 2), new THREE.Vector3((Math.random() - .5) * 3, 3 + Math.random() * 3, (Math.random() - .5) * 3), "#FFFFFF", .7, .5);
  sonMoteur(jetski.v);
}

/* ================= la boucle du jeu ================= */
let etat = "menu", temps = 0, score = [0, 0], pauseBut = 0, nEtoiles = 0, tTrainee = 0;
function message(t, s){ const m = $("message"); m.textContent = t; m.classList.add("on"); clearTimeout(message.m); message.m = setTimeout(() => m.classList.remove("on"), (s || 2) * 1000); }
function astuce(t){ $("astuce").textContent = t; }
function remettreBallon(){ ballon.p.set(0, R_BALLON + 8, 0); ballon.v.set(0, 0, 0); costauds.forEach((c, i) => { c.p.set(28 + i * 5, 0, -14 + i * 14); c.v.set(0, 0, 0); c.etat = "joue"; }); }

function majJoueur(dt){
  const m = lireManette();
  let ax = 0, az = 0;
  if(touches.ArrowLeft || touches.KeyA) ax -= 1; if(touches.ArrowRight || touches.KeyD) ax += 1; if(touches.ArrowUp || touches.KeyW) az += 1; if(touches.ArrowDown || touches.KeyS) az -= 1;
  if(joy.id !== null){ ax += joy.x; az -= joy.y; }
  if(m){ ax += m.x; az -= m.y; if(m.nA) appuiSaut(); if(!m.a && J.chargeOn && J.manette) lacheSaut(); J.manette = m.a; if(m.nB) frapper(); if(m.nC) jetskiAction(); }
  const vite = touches.ShiftLeft || touches.ShiftRight || courseT || (m && (m.r2 > .5 || m.r1));
  const l = Math.min(1, Math.hypot(ax, az));
  if(J.frappe > 0) J.frappe -= dt;
  if(J.cdTob > 0) J.cdTob -= dt;
  if(J.chargeOn && auSol()){ J.charge += dt; $("jauge").classList.add("on"); $("jauge").firstElementChild.style.width = Math.min(100, J.charge / 1.1 * 100) + "%"; }

  if(J.mode === "jetski"){
    majJetski(dt, ax, az, vite);
    J.p.set(jetski.x, jetski.y + .7, jetski.z); joueur.rotation.y = jetski.yaw; joueur.position.copy(J.p); animerAvatar(joueur, temps, "repos");
    jetski.g.position.set(jetski.x, jetski.y, jetski.z); jetski.g.rotation.set(jetski.enAir ? -.25 : Math.sin(temps * 3) * .03, jetski.yaw, -ax * .25);
    return { vitesse: Math.abs(jetski.v) };
  }
  if(J.mode === "toboggan"){
    const t = J.tob, tg = t.courbe.getTangentAt(Math.min(1, J.u)), pente = -tg.y;
    J.vt = Math.min(38, Math.max(7, J.vt + G * pente * dt)); J.u += J.vt * dt / t.L;
    if(J.u >= 1){ const fin = t.courbe.getPointAt(1); J.mode = "air"; J.saut2 = true; J.v.copy(tg).multiplyScalar(J.vt); J.v.y = Math.max(J.v.y, 4); J.p.copy(fin); J.cdTob = 1.5; return { vitesse: J.vt }; }
    const p = t.courbe.getPointAt(J.u); J.p.set(p.x, p.y - 1.6, p.z); joueur.position.copy(J.p); joueur.rotation.y = Math.atan2(tg.x, tg.z);
    animerAvatar(joueur, temps, "salut"); return { vitesse: J.vt };
  }
  if(J.mode === "echelle"){
    J.p.y += 9 * dt; joueur.position.copy(J.p); animerAvatar(joueur, temps * 12, "course", 4);
    if(J.p.y >= J.echelle.h){ J.p.set(J.echelle.haut.x, J.echelle.h, J.echelle.haut.z); J.mode = "sol"; J.v.set(0, 0, 0); astuce("🛝 Va au bord du toboggan pour glisser !"); }
    return { vitesse: 0 };
  }
  // marcher, courir, nager
  const nage = J.mode === "nage", vmax = nage ? 5 : vite ? 24 : 8;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
  let dx = 0, dz = 0; if(l > .05){ const n = Math.hypot(ax, az); dx = (fx * az - fz * ax) / n * l; dz = (fz * az + fx * ax) / n * l; }
  const acc = J.mode === "air" ? 4 : 10;
  J.v.x += (dx * vmax - J.v.x) * Math.min(1, dt * acc); J.v.z += (dz * vmax - J.v.z) * Math.min(1, dt * acc);
  if(J.sonne > 0){ J.sonne -= dt; J.v.x *= .9; J.v.z *= .9; }
  // bouger en évitant les obstacles
  let nx = J.p.x + J.v.x * dt, nz = J.p.z + J.v.z * dt;
  for(const o of obstacles){ if(J.p.y > o.h) continue; const ddx = nx - o.x, ddz = nz - o.z, d = Math.hypot(ddx, ddz), min = o.r + .5; if(d < min && d > 0){ nx = o.x + ddx / d * min; nz = o.z + ddz / d * min; } }
  // le ballon : on ne passe pas dedans, on le pousse
  const bx = nx - ballon.p.x, bz = nz - ballon.p.z, bd = Math.hypot(bx, bz);
  if(bd < R_BALLON + .6 && J.p.y < ballon.p.y + R_BALLON - .5){ const k = (R_BALLON + .6) / (bd || 1); nx = ballon.p.x + bx * k; nz = ballon.p.z + bz * k;
    const pousse = Math.max(3, Math.hypot(J.v.x, J.v.z)) * 1.1; ballon.v.x -= bx / (bd || 1) * pousse * .25; ballon.v.z -= bz / (bd || 1) * pousse * .25; }
  const R = 470; if(Math.hypot(nx, nz - 60) > R){ const a = Math.atan2(nz - 60, nx); nx = Math.cos(a) * R; nz = 60 + Math.sin(a) * R; }
  J.p.x = nx; J.p.z = nz;
  // l'échelle d'une tour
  for(const t of toboggans){ const e = t.tour.echelle; if(J.mode === "sol" && Math.hypot(J.p.x - e.x, J.p.z - e.z) < 1.4 && J.p.y < 1){ J.mode = "echelle"; J.echelle = e; J.p.x = e.x; J.p.z = e.z - .6; J.v.set(0, 0, 0); astuce("🪜 Tu grimpes !"); } }
  // entrer dans un toboggan
  if(J.cdTob <= 0) for(const t of toboggans){ if(Math.hypot(J.p.x - t.depart.x, J.p.z - t.depart.z) < 2.6 && Math.abs(J.p.y - (t.depart.y - 1.6)) < 2.5){ J.mode = "toboggan"; J.tob = t; J.u = 0; J.vt = 8; son("toboggan"); message("🛝 Wiiiii !", 1.4); return { vitesse: 8 }; } }
  // la hauteur
  const hs = hauteurSol(J.p.x, J.p.z, J.p.y), dansEau = hs < -.5;
  if(J.mode === "air"){
    J.v.y -= G * dt; J.p.y += J.v.y * dt;
    if(J.p.y <= hs + (dansEau ? .3 : 0) && J.v.y <= 0){
      const choc = -J.v.y;
      if(dansEau){ J.mode = "nage"; J.p.y = -1.1; eclabousse(J.p.clone().setY(0), choc > 15 ? 34 : 16); son("splash"); }
      else { J.p.y = hs; J.mode = "sol";
        if(choc > 20){ son("atterrit"); anneau(J.p, "#FFFFFF"); // le super atterrissage pousse tout ce qui est autour
          costauds.forEach(c => { const v = c.p.clone().sub(J.p); v.y = 0; const d = v.length(); if(d < 10){ v.normalize(); c.v.set(v.x * 16, 10, v.z * 16); c.etat = "vole"; c.assomme = 2.5; } });
          const vb2 = ballon.p.clone().sub(J.p); vb2.y = 0; if(vb2.length() < 12){ vb2.normalize(); ballon.v.x += vb2.x * 14; ballon.v.z += vb2.z * 14; ballon.v.y += 10; } } }
      J.v.y = 0;
    }
  } else if(J.mode === "nage"){
    J.p.y = -1.1 + Math.sin(temps * 3) * .1; if(!dansEau){ J.mode = "sol"; J.p.y = hs; }
  } else { // au sol
    if(J.p.y > hs + .5){ J.mode = "air"; J.saut2 = true; J.v.y = 0; }   // on tombe d'une plateforme
    else { J.p.y = hs; if(dansEau){ J.mode = "nage"; son("splash"); eclabousse(J.p.clone().setY(0), 10); } }
  }
  // dessin
  const v = Math.hypot(J.v.x, J.v.z);
  if(v > .5) joueur.rotation.y = Math.atan2(J.v.x, J.v.z);
  joueur.position.copy(J.p);
  J.t += dt * (2 + v * .9);
  if(J.frappe > 0){ animerAvatar(joueur, temps, "salut"); }
  else if(J.mode === "air") animerAvatar(joueur, J.t, "course", 2);
  else if(v > .5) animerAvatar(joueur, J.t, "course", Math.min(8, v));
  else animerAvatar(joueur, temps, "repos");
  // la traînée bleue quand on va très vite
  if(v > 14 && (tTrainee -= dt) <= 0){ tTrainee = .025; const e = { t: 0 }; particule(J.p.clone().setY(J.p.y + 1), new THREE.Vector3(0, 0, 0), "#4CC9F0", .35, 1.6, 0); effets[effets.length - 1].trainee = 1.6; }
  return { vitesse: v };
}

function majBallon(dt){
  if(pauseBut > 0){ pauseBut -= dt; if(pauseBut <= 0) remettreBallon(); }
  const b = ballon; b.v.y -= G * dt; b.p.addScaledVector(b.v, dt);
  const dansEau = b.p.z > LAC, solY = dansEau ? R_BALLON * .55 : R_BALLON;
  if(b.p.y < solY){ b.p.y = solY; if(dansEau){ b.v.y = 0; b.v.z -= 2 * dt; b.v.multiplyScalar(1 - .8 * dt); } else { if(b.v.y < -4) son("atterrit"); b.v.y = -b.v.y * .55; if(Math.abs(b.v.y) < 1.5) b.v.y = 0; b.v.x *= 1 - .7 * dt; b.v.z *= 1 - .7 * dt; } }
  // les poteaux et les obstacles
  for(const o of obstacles){ if(b.p.y - R_BALLON > o.h) continue; const dx = b.p.x - o.x, dz = b.p.z - o.z, d = Math.hypot(dx, dz), min = o.r + R_BALLON;
    if(d < min && d > 0){ const nx = dx / d, nz = dz / d, vn = b.v.x * nx + b.v.z * nz; b.p.x = o.x + nx * min; b.p.z = o.z + nz * min; if(vn < 0){ b.v.x -= 1.7 * vn * nx; b.v.z -= 1.7 * vn * nz; } } }
  // le fond des buts
  [54, -54].forEach(gx => { const s = Math.sign(gx); if(Math.abs(b.p.z) < 7 && s * b.p.x > Math.abs(gx) + 5 - R_BALLON && s * b.p.x < Math.abs(gx) + 8){ b.p.x = gx + s * (5 - R_BALLON); b.v.x = -b.v.x * .3; } });
  const R = 460; if(Math.hypot(b.p.x, b.p.z - 60) > R){ const a = Math.atan2(b.p.z - 60, b.p.x); b.p.x = Math.cos(a) * R; b.p.z = 60 + Math.sin(a) * R; b.v.multiplyScalar(-.5); }
  // il roule
  const vh = Math.hypot(b.v.x, b.v.z); if(vh > .01){ const axe = new THREE.Vector3(b.v.z, 0, -b.v.x).normalize(); b.m.rotateOnWorldAxis(axe, vh * dt / R_BALLON); }
  b.m.position.copy(b.p); ombreBallon.position.set(b.p.x, dansEau ? .05 : .05, b.p.z); ombreBallon.visible = !dansEau;
  // BUT !
  if(pauseBut <= 0 && Math.abs(b.p.z) < 7 - R_BALLON * .3 && b.p.y < 7){
    if(b.p.x > 54 + R_BALLON * .6){ score[0]++; but_marque(true); }
    else if(b.p.x < -54 - R_BALLON * .6){ score[1]++; but_marque(false); }
  }
}
function but_marque(moi){
  $("sMoi").textContent = score[0]; $("sEux").textContent = score[1]; pauseBut = 2.5; son("but"); confettis(ballon.p.clone());
  if(score[0] >= 5 || score[1] >= 5){ const gagne = score[0] >= 5; message(gagne ? "🏆 TU AS GAGNÉ !" : "💪 Les Costauds gagnent !", 4); son(gagne ? "victoire" : "rire"); for(let i = 0; i < 5; i++) setTimeout(() => confettis(J.p.clone().setY(J.p.y + 10)), i * 400); score = [0, 0]; setTimeout(() => { $("sMoi").textContent = 0; $("sEux").textContent = 0; }, 3500); }
  else message(moi ? "⚽ BUUUT !" : "😮 But des Costauds", 2.2);
}

function majCostauds(dt){
  const butCible = new THREE.Vector3(-58, 0, 0);
  for(const c of costauds){
    c.t += dt;
    if(c.etat === "vole" || c.etat === "assomme"){
      c.v.y -= G * dt; c.p.addScaledVector(c.v, dt); const hs = hauteurSol(c.p.x, c.p.z, c.p.y);
      if(c.p.y <= hs){ c.p.y = hs; c.v.set(0, 0, 0); c.etat = "assomme"; }
      c.assomme -= dt; c.tete.visible = true; c.tete.rotation.y += dt * 6;
      if(c.assomme <= 0 && c.etat === "assomme"){ c.etat = "joue"; c.tete.visible = false; }
      c.g.position.copy(c.p); c.g.rotation.z = c.etat === "vole" ? c.t * 8 : 0; animerAvatar(c.g, c.t, "repos"); continue;
    }
    c.g.rotation.z = 0;
    // se placer derrière le ballon pour le pousser vers ton but
    const dir = ballon.p.clone().sub(butCible); dir.y = 0; dir.normalize();
    const cible = ballon.p.clone().addScaledVector(dir, R_BALLON + 1.4); cible.y = 0;
    const vers = cible.sub(c.p); vers.y = 0; const d = vers.length();
    let vx = 0, vz = 0;
    if(d > .5){ vers.normalize(); // contourner le ballon s'il est entre nous et la place
      const b = ballon.p.clone().sub(c.p); b.y = 0; const db = b.length(); if(db < R_BALLON + 3 && b.normalize().dot(vers) > .5){ vers.x += -b.z * 1.2; vers.z += b.x * 1.2; vers.normalize(); }
      vx = vers.x * c.vite; vz = vers.z * c.vite; }
    else { vx = -dir.x * c.vite; vz = -dir.z * c.vite; }   // pousser !
    c.v.x += (vx - c.v.x) * Math.min(1, dt * 5); c.v.z += (vz - c.v.z) * Math.min(1, dt * 5);
    let nx = c.p.x + c.v.x * dt, nz = c.p.z + c.v.z * dt;
    const bx = nx - ballon.p.x, bz = nz - ballon.p.z, bd = Math.hypot(bx, bz);
    if(bd < R_BALLON + .6 && ballon.p.y < R_BALLON + 2){ const k = (R_BALLON + .6) / (bd || 1); nx = ballon.p.x + bx * k; nz = ballon.p.z + bz * k; ballon.v.x -= bx / (bd || 1) * 2.2; ballon.v.z -= bz / (bd || 1) * 2.2; }
    for(const o of obstacles){ if(o.h < 1) continue; const ddx = nx - o.x, ddz = nz - o.z, dd = Math.hypot(ddx, ddz), min = o.r + .5; if(dd < min && dd > 0){ nx = o.x + ddx / dd * min; nz = o.z + ddz / dd * min; } }
    if(nz > LAC - 2) nz = LAC - 2;
    c.p.x = nx; c.p.z = nz; c.p.y = 0;
    // parfois, un Costaud te bouscule (pour rire)
    c.cdBouscule -= dt; const vj = J.p.clone().sub(c.p); vj.y = 0;
    if(c.cdBouscule <= 0 && auSol() && J.mode === "sol" && vj.length() < 2.2){ vj.normalize(); J.v.x = vj.x * 14; J.v.z = vj.z * 14; J.v.y = 7; J.mode = "air"; J.saut2 = true; J.sonne = .5; c.cdBouscule = 5 + Math.random() * 3; son("boing"); message("😵 Bousculé !", 1); }
    const v = Math.hypot(c.v.x, c.v.z); if(v > .3) c.g.rotation.y = Math.atan2(c.v.x, c.v.z);
    c.g.position.copy(c.p); animerAvatar(c.g, c.t * (2 + v), "course", v);
  }
}
function majEtoiles(dt){
  for(const e of etoiles){ if(e.prise) continue; e.m.rotation.y += dt * 2.5; e.m.position.y += Math.sin(temps * 2 + e.m.position.x) * dt * .5;
    if(e.m.position.distanceTo(J.p.clone().setY(J.p.y + 1.2)) < 2.6){ e.prise = true; scene.remove(e.m); nEtoiles++; $("nEtoiles").textContent = nEtoiles; son("etoile");
      for(let i = 0; i < 14; i++) particule(e.m.position.clone(), new THREE.Vector3((Math.random() - .5) * 10, Math.random() * 10, (Math.random() - .5) * 10), "#FFD23F", .7, .5, 8);
      if(nEtoiles === etoiles.length){ message("🌟 TOUTES LES ÉTOILES !", 4); son("victoire"); confettis(J.p.clone().setY(J.p.y + 8)); } else message("⭐ " + nEtoiles + " / " + etoiles.length, 1); } }
}
function majCamera(dt, vitesse){
  const loin = J.mode === "jetski" ? 14 : J.mode === "toboggan" ? 12 : cam.dist + Math.min(8, vitesse * .25);
  // la caméra se remet doucement derrière quand on va vite
  if(vitesse > 6 && !glisseCam){ const derriere = joueur.rotation.y + Math.PI; let d = derriere - cam.yaw; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2; cam.yaw += d * Math.min(1, dt * (J.mode === "jetski" ? 2.5 : 1.2)); }
  const cx = J.p.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * loin, cz = J.p.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * loin, cy = J.p.y + 1.5 + Math.sin(cam.pitch) * loin;
  camera.position.lerp(new THREE.Vector3(cx, Math.max(cy, .8), cz), Math.min(1, dt * 7)); camera.lookAt(J.p.x, J.p.y + 1.4, J.p.z);
  const fov = 60 + Math.min(16, Math.max(0, vitesse - 10) * .9); if(Math.abs(camera.fov - fov) > .1){ camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }
}
function majAstuce(){
  if(J.mode === "jetski"){ astuce(tactile ? "🚤 Rond = conduire · ⚡ = turbo · 🦘 = sauter · 🚤 = descendre" : "🚤 Flèches = conduire · Maj = turbo · Espace = sauter · E = descendre"); $("tMonter").hidden = false; return; }
  const pres = presDuJetski(); $("tMonter").hidden = !pres;
  if(pres) astuce(tactile ? "🚤 Touche 🚤 pour monter sur le jet-ski !" : "🚤 Appuie sur E pour monter sur le jet-ski !");
  else if(J.mode === "nage") astuce("🏊 Tu nages ! Retourne vers la plage, ou fais un super saut.");
  else if(Math.hypot(J.p.x - ballon.p.x, J.p.z - ballon.p.z) < 12) astuce(tactile ? "⚽ Touche 💥 pour frapper le ballon vers le but rouge !" : "⚽ Appuie sur X pour frapper le ballon vers le but rouge !");
}

let avant = performance.now(), tAstuce = 0;
function boucle(maintenant){
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant; temps += dt;
  vagues(temps);
  if(etat === "menu"){
    if(persoVitrine){ persoVitrine.rotation.y += dt * .7; animerAvatar(persoVitrine, temps, "repos"); }
    camera.position.set(-8 + Math.sin(temps * .2) * 2, 2.6, 13); camera.lookAt(-8, 1.6, 6);
    ballon.m.position.set(4, R_BALLON, 0); ballon.m.rotation.y += dt * .3;
  } else {
    const r = majJoueur(dt); majBallon(dt); majCostauds(dt); majEtoiles(dt);
    if(J.mode !== "jetski"){ jetski.g.position.set(jetski.x, Math.sin(temps * 2) * .1 - .1, jetski.z); jetski.g.rotation.set(0, jetski.yaw, Math.sin(temps * 1.5) * .04); }
    if(J.ombre){ const hs = hauteurSol(J.p.x, J.p.z, J.p.y + .1); J.ombre.position.set(J.p.x, Math.max(hs, 0) + .06, J.p.z); J.ombre.visible = hs > -.5 && J.mode !== "toboggan"; const k = Math.max(.3, 1 - (J.p.y - hs) / 30); J.ombre.scale.setScalar(k); }
    majCamera(dt, r.vitesse);
    if((tAstuce -= dt) <= 0){ tAstuce = .4; majAstuce(); }
  }
  animerEffets(dt);
  rendu.render(scene, camera);
  requestAnimationFrame(boucle);
}

/* ================= jouer ================= */
$("jouer").onclick = () => {
  audio(); if(persoVitrine){ scene.remove(persoVitrine); persoVitrine = null; }
  creerJoueur(); creerCostauds(); placerEtoiles(); nEtoiles = 0; score = [0, 0]; $("sMoi").textContent = 0; $("sEux").textContent = 0;
  J.p.set(-25, 0, 6); J.v.set(0, 0, 0); J.mode = "sol"; cam.yaw = -Math.PI / 2; remettreBallon();
  etat = "jeu"; $("menu").hidden = true; $("hud").hidden = false; $("tactile").hidden = !tactile;
  message("⚡ C'est parti !", 1.5); astuce("⚽ Pousse le ballon géant dans le but ROUGE. Attrape aussi les ⭐ !");
};
$("versMenu").onclick = () => { etat = "menu"; $("menu").hidden = false; $("hud").hidden = true; $("tactile").hidden = true; sonMoteur(null);
  if(joueur){ scene.remove(joueur); joueur = null; } if(J.ombre){ scene.remove(J.ombre); J.ombre = null; } costauds.forEach(c => scene.remove(c.g)); costauds.length = 0; J.mode = "sol"; vitrine(); };
remplirProfils(); vitrine(); requestAnimationFrame(boucle);
window.__parc = { J, ballon, costauds, jetski, toboggans, touches, cam, appuiSaut, lacheSaut, frapper, jetskiAction, get etat(){ return etat; } };
