/* Le Toboggan des Nuages — un toboggan géant dans le ciel, à travers 5 mondes (Three.js).
   Tout est dessiné en code : toboggan, îles volantes, personnage, décors. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { lireManette, vraiesManettes } from "../commun/manette.js";
import { mergeGeometries } from "../course3d/lib/BufferGeometryUtils.js";
import { profils, avatarDe, creerAvatar } from "../commun/avatar.js";

const $ = (id) => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const TEST = PARAMS.has("test"), AUTO = PARAMS.has("auto");
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function hasard(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ======================= réglages ======================= */
// les joueurs et leur personnage viennent de l'atelier « Mon personnage » (commun/avatar.js)
const JOUEURS = profils().map(p => Object.assign({}, p, { niveau: p.id === "mikael" ? "tranquille" : "normal" }));
const NIVEAUX = {
  tranquille: { nom:"Tranquille", e:"🐢", desc:"doucement", v:14.5, obstacles:8, perte:0 },
  normal:     { nom:"Normal", e:"🛷", desc:"plus vite", v:19, obstacles:14, perte:3 },
  rapide:     { nom:"Super rapide", e:"🚀", desc:"attention !", v:24, obstacles:20, perte:5 }
};
const BOUEES = ["#FF6F9F", "#FFD23F", "#4CC9F0", "#7BE495", "#FF9F1C", "#B9B3F5"];
const MONDES = [
  { id:"foret", nom:"La forêt enchantée", e:"🌳", carte:"#9BE07A", ciel:["#6EC1FF", "#E2F5FF"], brume:"#D2EEFF", piste:["#8FD16F", "#6DBA55"], bord:"#9A6A42",
    ile:"#6CC04A", roche:"#8A6A4F", particules:"feuilles", musique:{ base:60, gamme:[0, 2, 4, 7, 9], tempo:112 } },
  { id:"glace", nom:"Le royaume des glaces", e:"❄️", carte:"#BFE6FF", ciel:["#86C5F5", "#F2FAFF"], brume:"#E8F5FF", piste:["#D9F1FF", "#A9D8F5"], bord:"#FFFFFF",
    ile:"#F4FAFF", roche:"#9FB7D0", particules:"neige", musique:{ base:67, gamme:[0, 2, 4, 7, 11], tempo:98 } },
  { id:"bonbons", nom:"Le pays des bonbons", e:"🍭", carte:"#FFB8DC", ciel:["#FF9FD0", "#FFF1F8"], brume:"#FFE3F1", piste:["#FF8FC8", "#FFD6EA"], bord:"#FFFFFF",
    ile:"#FFF0F6", roche:"#C98B5E", particules:"paillettes", musique:{ base:64, gamme:[0, 2, 4, 5, 7, 9, 11], tempo:126 } },
  { id:"volcan", nom:"Le volcan de feu", e:"🌋", carte:"#FF9A6B", ciel:["#2E1630", "#FF7A3C"], brume:"#6E3030", piste:["#7A5050", "#9A6060"], bord:"#FFB347",
    ile:"#5A4040", roche:"#3E2A2A", particules:"braises", musique:{ base:57, gamme:[0, 3, 5, 7, 10], tempo:134 } },
  { id:"espace", nom:"Le voyage dans les étoiles", e:"🚀", carte:"#B9A8FF", ciel:["#070A2A", "#3A2A7A"], brume:"#1A1A4A", piste:["#6A5ACD", "#9585FF"], bord:"#FFD23F",
    ile:"#8A86B0", roche:"#5A5680", particules:"etoiles", musique:{ base:62, gamme:[0, 2, 5, 7, 9], tempo:102 } }
];
const RP = 4.2, THMAX = 1.25; // rayon du demi-tube, angle maximum (radians)

let choix = { joueur: lire("tobo-joueur", "mikael"), bouee: lire("tobo-bouee", BOUEES[0]), monde: 0, niveau: null };
choix.niveau = lire("tobo-niveau-" + choix.joueur, (JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[0]).niveau);
const debloque = () => parseInt(lire("tobo-debloque-" + choix.joueur, "0"), 10) || 0;
choix.monde = Math.min(parseInt(lire("tobo-monde-" + choix.joueur, "0"), 10) || 0, debloque());
let musiqueOn = lire("tobo-musique", "1") === "1";

/* ======================= moteur 3D ======================= */
const canvas = $("c");
let renderer;
try{ renderer = new THREE.WebGLRenderer({ canvas, antialias: lire("tobo-qualite", "haute") === "haute", powerPreference: "high-performance" }); }
catch(e){ $("chargement").hidden = true; $("erreur3d").hidden = false; throw e; }
let qualite = lire("tobo-qualite", "haute");
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(66, 1, .3, 1800);
function redimensionner(){ renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
function appliquerQualite(){
  renderer.setPixelRatio(qualite === "haute" ? Math.min(devicePixelRatio || 1, 1.25) : qualite === "moyenne" ? .9 : .65);
  camera.far = qualite === "basse" ? 700 : 1800; camera.updateProjectionMatrix();
  redimensionner();
}
addEventListener("resize", redimensionner);
const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.4); scene.add(hemi);
const soleil = new THREE.DirectionalLight(0xffffff, 1.9); soleil.position.set(40, 100, -30); scene.add(soleil);

function texture(w, h, dessin, repeat){
  const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if(repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t;
}
const M = {};
function mat(c, o){ const k = c + JSON.stringify(o || {}); if(!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, flatShading: true }, o || {})); return M[k]; }
function maille(geo, c, o){ return new THREE.Mesh(geo, mat(c, o)); }

/* ======================= le personnage sur sa bouée ======================= */
function creerGlisseur(J, couleurBouee){
  const g = new THREE.Group();
  // bouée rayée
  const tb = texture(256, 32, (c, w, h) => { for(let i = 0; i < 8; i++){ c.fillStyle = i % 2 ? "#FFFFFF" : couleurBouee; c.fillRect(i * w / 8, 0, w / 8 + 1, h); } }, true);
  const bouee = new THREE.Mesh(new THREE.TorusGeometry(.78, .32, 12, 28), new THREE.MeshStandardMaterial({ map: tb, roughness: .35 }));
  bouee.rotation.x = Math.PI / 2; bouee.position.y = .32; g.add(bouee);
  // le personnage de l'enfant, assis
  const av = creerAvatar(avatarDe(J.id), { pose: "assis", numero: J.numero });
  av.scale.setScalar(.82); av.position.set(0, .12, -.05); g.add(av);
  av.userData.bras.forEach((b, k) => { b.rotation.z = (k ? 1 : -1) * .55; });
  // ombre douce
  const om = new THREE.Mesh(new THREE.CircleGeometry(.95, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false }));
  om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  g.userData = { corps: av.userData.corps, bras: av.userData.bras, bouee, ombre: om };
  return g;
}

/* ======================= construction d'un monde ======================= */
const niveau3D = new THREE.Group(); scene.add(niveau3D);
let piste = null;
function texPiste(c1, c2){
  return texture(128, 256, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h);
    g.fillStyle = c2; for(let i = 0; i < 8; i++) if(i % 2) g.fillRect(i * w / 8, 0, w / 8, h);
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, 0, w, 6);
  }, true);
}
function texFleches(){ return texture(128, 160, (g) => { g.fillStyle = "rgba(255,80,40,.9)"; g.fillRect(6, 6, 116, 148); g.fillStyle = "#FFE45C"; for(let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(64, 14 + k * 48); g.lineTo(112, 56 + k * 48); g.lineTo(88, 56 + k * 48); g.lineTo(64, 34 + k * 48); g.lineTo(40, 56 + k * 48); g.lineTo(16, 56 + k * 48); g.closePath(); g.fill(); } }); }
function etoileGeo(){
  const s = new THREE.Shape(); for(let k = 0; k < 10; k++){ const a = k / 10 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? .45 : 1; const x = Math.cos(a) * r, y = -Math.sin(a) * r; k ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: .3, bevelEnabled: true, bevelThickness: .1, bevelSize: .08, bevelSegments: 1 }); g.center(); g.scale(.55, .55, .55); return g;
}
const GEO_ETOILE = etoileGeo();

function construireMonde(idx){
  while(niveau3D.children.length) niveau3D.remove(niveau3D.children[0]);
  const W = MONDES[idx], r = hasard(idx * 131 + 7), niv = NIVEAUX[choix.niveau];
  scene.background = texture(4, 256, (g, w, h) => { const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, W.ciel[0]); d.addColorStop(.7, W.ciel[1]); d.addColorStop(1, W.ciel[1]); g.fillStyle = d; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(W.brume, 120, 620);
  hemi.color.set(idx === 4 ? "#C9C0FF" : idx === 3 ? "#FFD0B0" : "#FFFFFF");
  // points de passage : ça descend en zigzag
  const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 20)];
  let x = 0, y = -1, z = 20, cote = r() < .5 ? 1 : -1;
  const n = 30, ampl = 10 + idx * 3;
  for(let k = 0; k < n; k++){
    z += 34 + r() * 10;
    if(r() < .7) cote = -cote;
    x = cote * (ampl * .5 + r() * ampl) + x * .25;
    y -= 5.5 + r() * 5 + (k % 7 === 3 ? 8 : 0);
    pts.push(new THREE.Vector3(x, y, z));
  }
  pts.push(new THREE.Vector3(x * .5, y - 2, z + 30), new THREE.Vector3(x * .5, y - 2.5, z + 46));
  const courbe = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const longueur = courbe.getLength(), DS = 1.5, NS = Math.floor(longueur / DS);
  const P = courbe.getSpacedPoints(NS), T = [], D = [], H = [];
  const up = new THREE.Vector3(0, 1, 0);
  for(let i = 0; i <= NS; i++){
    const a = P[Math.max(0, i - 1)], b = P[Math.min(NS, i + 1)];
    const t = new THREE.Vector3().subVectors(b, a).normalize();
    const d = new THREE.Vector3().crossVectors(t, up).normalize();  // à droite
    const h = new THREE.Vector3().crossVectors(d, t).normalize();   // vers le haut de la piste
    T.push(t); D.push(d); H.push(h);
  }
  // virages : de quel côté ça tourne (pour la force qui pousse vers l'extérieur)
  const virage = [];
  for(let i = 0; i <= NS; i++){ const a = T[Math.max(0, i - 3)], b = T[Math.min(NS, i + 3)]; virage.push(new THREE.Vector3().subVectors(b, a).dot(D[i]) / (6 * DS)); }
  // trous à sauter (sur les parties droites, pas au début ni à la fin)
  const trous = [];
  const nbTrous = [1, 2, 2, 3, 3][idx];
  for(let k = 0, essais = 0; k < nbTrous && essais < 200; essais++){
    const i = Math.floor(NS * (.18 + r() * .65));
    if(Math.abs(virage[i]) > .012 || trous.some(t => Math.abs(t[0] / DS - i) < 120)) continue;
    trous.push([i * DS, i * DS + 13]); k++;
  }
  const dansTrou = (s) => trous.some(t => s > t[0] && s < t[1]);
  piste = { idx, W, P, T, D, H, virage, NS, DS, longueur: NS * DS, trous, dansTrou, etoiles: [], obstacles: [], boosts: [], total: 0 };

  // le demi-tube
  const M_ = 18, pos = [], uv = [], idxs = [], bord = [];
  for(let i = 0; i <= NS; i++){
    for(let j = 0; j <= M_; j++){
      const th = -THMAX - .12 + (2 * THMAX + .24) * j / M_;
      const p = surface(i, th, 0);
      pos.push(p.x, p.y, p.z); uv.push(j / M_, i * DS / 9);
    }
  }
  for(let i = 0; i < NS; i++){
    if(dansTrou(i * DS + DS / 2)) continue;
    for(let j = 0; j < M_; j++){ const a = i * (M_ + 1) + j, b = a + M_ + 1; idxs.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idxs); geo.computeVertexNormals();
  niveau3D.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texPiste(W.piste[0], W.piste[1]), roughness: .45, side: THREE.DoubleSide })));
  // bords arrondis du toboggan
  [-1, 1].forEach(s => {
    const pb = [];
    for(let i = 0; i <= NS; i++) pb.push(surface(i, s * (THMAX + .12), 0));
    // un tube par morceau (on coupe aux trous)
    let morceau = [];
    const finir = () => { if(morceau.length > 3){ const c = new THREE.CatmullRomCurve3(morceau); niveau3D.add(new THREE.Mesh(new THREE.TubeGeometry(c, morceau.length, .28, 6, false), mat(W.bord, { roughness: .4 }))); } morceau = []; };
    for(let i = 0; i <= NS; i++){ if(dansTrou(i * DS)) finir(); else morceau.push(pb[i]); }
    finir();
  });
  // piliers en arc-en-ciel sous le toboggan de temps en temps
  for(let i = 30; i < NS; i += 55){
    if(dansTrou(i * DS)) continue;
    const p = P[i], haut = 30;
    const pil = maille(new THREE.CylinderGeometry(.5, .9, haut, 8), W.bord); pil.position.set(p.x, p.y - haut / 2 - .4, p.z); niveau3D.add(pil);
  }

  // étoiles : en lignes au milieu, en arcs dans les virages, en l'air au-dessus des trous ; quelques diamants
  const ajouterEtoile = (s, th, h, gemme) => {
    if(s > piste.longueur - 2) return;
    piste.etoiles.push({ s, th, h: h + .9, pos: surfaceS(s, th, h + .9), pris: false, valeur: gemme ? 5 : 1 }); piste.total += gemme ? 5 : 1;
  };
  for(let s = 40; s < piste.longueur - 60; s += 26 + r() * 20){
    if(dansTrou(s) || dansTrou(s + 12)) continue;
    const i = Math.round(s / DS), v = virage[i];
    if(Math.abs(v) > .01){ // arc sur le côté extérieur du virage
      for(let k = 0; k < 6; k++) ajouterEtoile(s + k * 2.2, -Math.sign(v) * (.25 + k * .14), 0);
    }else{
      const th = (r() - .5) * 1.4; for(let k = 0; k < 5; k++) ajouterEtoile(s + k * 2.4, th, 0);
    }
  }
  trous.forEach(t => { for(let k = 0; k < 5; k++){ const u = (k + .5) / 5; ajouterEtoile(t[0] + u * (t[1] - t[0]), 0, Math.sin(u * Math.PI) * 3.2); } });
  for(let k = 0; k < 5; k++){ const s = piste.longueur * (.15 + k * .17) + r() * 20; if(!dansTrou(s)) ajouterEtoile(s, (r() < .5 ? -1 : 1) * 1.0, 0, true); }
  // toutes les étoiles (et tous les diamants) en un seul objet chacun : beaucoup plus rapide à dessiner
  const etoilesN = piste.etoiles.filter(e => e.valeur === 1), gemmesN = piste.etoiles.filter(e => e.valeur > 1);
  piste.imEtoiles = new THREE.InstancedMesh(GEO_ETOILE, mat("#FFD23F", { emissive: "#FFB000", emissiveIntensity: .55, roughness: .3, flatShading: false }), Math.max(1, etoilesN.length));
  piste.imGemmes = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.55), mat("#FF4FB0", { emissive: "#FF2F90", emissiveIntensity: .5, roughness: .2 }), Math.max(1, gemmesN.length));
  etoilesN.forEach((e, k) => { e.im = piste.imEtoiles; e.k = k; }); gemmesN.forEach((e, k) => { e.im = piste.imGemmes; e.k = k; });
  piste.etoiles.forEach(e => majEtoile(e, 0));
  [piste.imEtoiles, piste.imGemmes].forEach(im => { im.userData.dynamique = true; im.frustumCulled = false; niveau3D.add(im); });

  // obstacles (on peut les éviter ou sauter par-dessus)
  const nbObs = niv.obstacles + idx * 2;
  for(let k = 0, essais = 0; k < nbObs && essais < 400; essais++){
    const s = 70 + r() * (piste.longueur - 140), th = (r() - .5) * 1.5;
    if(dansTrou(s) || trous.some(t => Math.abs(t[0] - s) < 18 || Math.abs(t[1] - s) < 8) || piste.obstacles.some(o => Math.abs(o.s - s) < 22)) continue;
    if(piste.etoiles.some(e => Math.abs(e.s - s) < 3 && Math.abs(e.th - th) < .4)) continue;
    const m = obstacle3D(W.id, r); m.position.copy(surfaceS(s, th, 0)); orienter(m, s, th); niveau3D.add(m);
    piste.obstacles.push({ s, th, m }); k++;
  }
  // accélérateurs
  const tf = texFleches();
  for(let k = 0; k < 7; k++){
    const s = piste.longueur * (.1 + k * .12) + r() * 10, th = (r() - .5) * .9;
    if(dansTrou(s) || piste.obstacles.some(o => Math.abs(o.s - s) < 10)) continue;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3), new THREE.MeshBasicMaterial({ map: tf, transparent: true, side: THREE.DoubleSide }));
    m.position.copy(surfaceS(s, th, .04)); orienter(m, s, th); m.rotateX(-Math.PI / 2); niveau3D.add(m);
    piste.boosts.push({ s, th });
  }

  // îles volantes avec le décor du monde, nuages, grandes formes au loin
  for(let i = 20; i < NS; i += Math.floor(22 + r() * 16)){
    const p = P[i], d = D[i], cote = r() < .5 ? 1 : -1, dist = 16 + r() * 34;
    const c = new THREE.Vector3().copy(p).addScaledVector(d, cote * dist); c.y += -12 + r() * 14;
    niveau3D.add(ile(W, r, c, 4 + r() * 5));
  }
  // île de départ et île d'arrivée avec le portail
  const dirDebut = new THREE.Vector3(T[0].x, 0, T[0].z).normalize(), dirFin = new THREE.Vector3(T[NS].x, 0, T[NS].z).normalize();
  const depart = ile(W, r, new THREE.Vector3(P[0].x, P[0].y - 1.2, P[0].z).addScaledVector(dirDebut, -8), 10, true, true); niveau3D.add(depart);
  const fin = P[NS], arr = ile(W, r, new THREE.Vector3(fin.x, fin.y - 1.4, fin.z).addScaledVector(dirFin, 11), 12, true, true); niveau3D.add(arr);
  piste.directionFin = dirFin;
  const portail = new THREE.Mesh(new THREE.TorusGeometry(5, .6, 12, 40), mat("#FFD23F", { emissive: "#FFB000", emissiveIntensity: .8 }));
  portail.position.copy(fin).addScaledVector(dirFin, 5); portail.position.y += 3.6; portail.lookAt(portail.position.clone().add(dirFin)); niveau3D.add(portail);
  const voile = new THREE.Mesh(new THREE.CircleGeometry(4.6, 40), new THREE.MeshBasicMaterial({ color: MONDES[(idx + 1) % 5].carte, transparent: true, opacity: .55, side: THREE.DoubleSide }));
  voile.position.copy(portail.position); voile.quaternion.copy(portail.quaternion); voile.material.opacity = .35; niveau3D.add(voile);
  piste.portail = portail; piste.voile = voile; portail.userData.dynamique = voile.userData.dynamique = true;
  const nuages = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: idx >= 3 ? (idx === 3 ? "#7A4A4A" : "#4A4A8A") : "#FFFFFF", transparent: true, opacity: .9 }), 160);
  const dm = new THREE.Object3D();
  for(let k = 0; k < 160; k++){
    const i = Math.floor(r() * NS), p = P[i], dd = D[i];
    dm.position.copy(p).addScaledVector(dd, (r() - .5) * 220); dm.position.y += -35 - r() * 40;
    dm.scale.set(10 + r() * 14, 4 + r() * 4, 8 + r() * 10); dm.updateMatrix(); nuages.setMatrixAt(k, dm.matrix);
  }
  niveau3D.add(nuages);
  decorLointain(W, r);
  particules(W);
  fusionnerDecor();
}
/* Le décor ne bouge pas : on regroupe tous les objets de même matière en un seul,
   pour que l'ordinateur n'ait que quelques dizaines de choses à dessiner au lieu de centaines. */
function fusionnerDecor(){
  niveau3D.updateMatrixWorld(true);
  const groupes = new Map(), aEnlever = [];
  niveau3D.traverse(o => {
    if(!o.isMesh || o.isInstancedMesh || o.userData.dynamique) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for(const nom of Object.keys(g.attributes)) if(!["position", "normal", "uv"].includes(nom)) g.deleteAttribute(nom);
    if(!g.attributes.normal) g.computeVertexNormals();
    if(!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(o.matrixWorld);
    const k = o.material.uuid; if(!groupes.has(k)) groupes.set(k, { m: o.material, g: [] });
    groupes.get(k).g.push(g); aEnlever.push(o);
  });
  aEnlever.forEach(o => o.parent.remove(o));
  groupes.forEach(({ m, g }) => { const fus = mergeGeometries(g, false); if(fus){ fus.computeBoundingSphere(); niveau3D.add(new THREE.Mesh(fus, m)); } g.forEach(x => x.dispose()); });
  // les groupes vides restants
  for(let i = niveau3D.children.length - 1; i >= 0; i--){ const c = niveau3D.children[i]; if(c.isGroup && !c.children.length) niveau3D.remove(c); }
}
const _o = new THREE.Object3D();
function majEtoile(e, t){
  if(e.pris){ _o.scale.setScalar(0); }
  else { _o.position.copy(e.pos); _o.rotation.set(0, t * 2.5 + e.s, 0); _o.scale.setScalar(1); }
  _o.updateMatrix(); e.im.setMatrixAt(e.k, _o.matrix); e.im.instanceMatrix.needsUpdate = true;
}
/* point sur la surface du toboggan : indice i (ou distance s), angle th, hauteur h au-dessus de la surface */
function surface(i, th, h){
  const p = piste.P[i], d = piste.D[i], hh = piste.H[i];
  const r = RP - h;
  return new THREE.Vector3().copy(p).addScaledVector(d, r * Math.sin(th)).addScaledVector(hh, RP - r * Math.cos(th));
}
function surfaceS(s, th, h){
  const f = clamp(s / piste.DS, 0, piste.NS), i = Math.min(piste.NS - 1, Math.floor(f)), u = f - i;
  return surface(i, th, h).lerp(surface(i + 1, th, h), u);
}
function repere(s){
  const f = clamp(s / piste.DS, 0, piste.NS), i = Math.min(piste.NS - 1, Math.floor(f)), u = f - i;
  return { t: piste.T[i].clone().lerp(piste.T[i + 1], u).normalize(), d: piste.D[i].clone().lerp(piste.D[i + 1], u).normalize(), h: piste.H[i].clone().lerp(piste.H[i + 1], u).normalize(), i };
}
/* tourner un objet pour qu'il soit posé sur la surface (debout vers le centre du tube, face à la descente) */
const _m = new THREE.Matrix4();
function orienter(obj, s, th){
  const R = repere(s);
  const n = new THREE.Vector3().addScaledVector(R.d, -Math.sin(th)).addScaledVector(R.h, Math.cos(th)).normalize();
  const z = R.t.clone().addScaledVector(n, -R.t.dot(n)).normalize(), x = new THREE.Vector3().crossVectors(n, z);
  _m.makeBasis(x, n, z); obj.quaternion.setFromRotationMatrix(_m);
  return n;
}
function obstacle3D(id, r){
  const g = new THREE.Group();
  if(id === "foret"){ // champignon géant
    const pied = maille(new THREE.CylinderGeometry(.35, .45, 1.0, 10), "#FFF3D6"); pied.position.y = .5; g.add(pied);
    const chap = maille(new THREE.SphereGeometry(.95, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), "#E5484D"); chap.position.y = .95; g.add(chap);
    for(let k = 0; k < 5; k++){ const p = maille(new THREE.SphereGeometry(.14, 8, 6), "#FFFFFF"); const a = k * 1.3; p.position.set(Math.cos(a) * .55, 1.45 - (k % 2) * .2, Math.sin(a) * .55); g.add(p); }
  }else if(id === "glace"){ // bloc de glace
    const b = maille(new THREE.BoxGeometry(1.5, 1.3, 1.2), "#A8E4FF", { roughness: .1, metalness: .1, transparent: true, opacity: .8 }); b.position.y = .65; b.rotation.y = r() * .6; g.add(b);
    const pingouin = maille(new THREE.SphereGeometry(.35, 10, 8), "#22232B"); pingouin.position.set(0, 1.6, 0); pingouin.scale.y = 1.3; g.add(pingouin);
    const ventre = maille(new THREE.SphereGeometry(.26, 10, 8), "#FFFFFF"); ventre.position.set(0, 1.55, .16); ventre.scale.y = 1.2; g.add(ventre);
    const bec = maille(new THREE.ConeGeometry(.08, .2, 6), "#FF9F1C"); bec.rotation.x = Math.PI / 2; bec.position.set(0, 1.78, .36); g.add(bec);
  }else if(id === "bonbons"){ // grosse boule de chewing-gum sur un bâton
    const c = ["#FF4FB0", "#4CC9F0", "#FFD23F", "#7BE495"][Math.floor(r() * 4)];
    const b = maille(new THREE.SphereGeometry(.85, 16, 12), c, { flatShading: false, roughness: .25 }); b.position.y = .85; g.add(b);
    const spi = maille(new THREE.TorusGeometry(.55, .12, 6, 20), "#FFFFFF"); spi.position.set(0, .85, .62); g.add(spi);
  }else if(id === "volcan"){ // rocher de lave
    const b = maille(new THREE.DodecahedronGeometry(.95, 0), "#3E2A2A"); b.position.y = .75; g.add(b);
    const lave = maille(new THREE.DodecahedronGeometry(.7, 0), "#FF6A1A", { emissive: "#FF4A00", emissiveIntensity: .9 }); lave.position.set(.25, .95, .25); g.add(lave);
  }else{ // astéroïde
    const b = maille(new THREE.DodecahedronGeometry(1.0, 1), "#8A86A0"); b.position.y = .9; g.add(b);
    [[.4, 1.3, .7], [-.5, .8, .75], [.1, .5, .9]].forEach(p => { const c = maille(new THREE.SphereGeometry(.22, 8, 6), "#5A5670"); c.position.set(p[0], p[1], p[2] * .9); g.add(c); });
  }
  return g;
}
function ile(W, r, c, taille, grande, passage){
  const g = new THREE.Group();
  const dessus = maille(new THREE.CylinderGeometry(taille, taille * .92, 1.4, 12), W.ile); g.add(dessus);
  const dessous = maille(new THREE.ConeGeometry(taille * .9, taille * 1.6, 10), W.roche); dessous.rotation.x = Math.PI; dessous.position.y = -taille * .8 - .7; g.add(dessous);
  const nb = grande ? 6 : 1 + Math.floor(r() * 3);
  for(let k = 0; k < nb; k++){
    const a = r() * Math.PI * 2, d = passage ? taille * (.62 + r() * .25) : r() * taille * .6, o = objetDecor(W.id, r);
    o.position.set(Math.cos(a) * d, .7, Math.sin(a) * d); o.rotation.y = r() * 6; g.add(o);
  }
  g.position.copy(c); return g;
}
function objetDecor(id, r){
  const g = new THREE.Group(), k = r();
  if(id === "foret"){
    if(k < .55){ const t = maille(new THREE.CylinderGeometry(.35, .45, 2.4, 7), "#7A4B2E"); t.position.y = 1.2; g.add(t);
      const f = maille(new THREE.IcosahedronGeometry(1.9, 0), ["#3FA34D", "#4FB85A", "#2F8E45"][Math.floor(r() * 3)]); f.position.y = 3.4; g.add(f); }
    else if(k < .8){ const p = maille(new THREE.CylinderGeometry(.25, .3, .8, 8), "#FFF3D6"); p.position.y = .4; g.add(p); const ch = maille(new THREE.SphereGeometry(.7, 12, 8, 0, 7, 0, Math.PI / 2), "#E5484D"); ch.position.y = .75; g.add(ch); }
    else { const f = maille(new THREE.ConeGeometry(1.2, 3.4, 7), "#2F7D4A"); f.position.y = 2; g.add(f); }
  }else if(id === "glace"){
    if(k < .5){ const s = maille(new THREE.ConeGeometry(1.1, 3.2, 7), "#3E7D5A"); s.position.y = 1.8; g.add(s); const n = maille(new THREE.ConeGeometry(.75, 1.4, 7), "#FFFFFF"); n.position.y = 3.2; g.add(n); }
    else if(k < .8){ [[0, .7, .8], [0, 1.8, .55], [0, 2.6, .38]].forEach(b => { const s = maille(new THREE.SphereGeometry(b[2], 12, 10), "#FFFFFF", { flatShading: false }); s.position.y = b[1]; g.add(s); });
      const nez = maille(new THREE.ConeGeometry(.08, .4, 6), "#FF8C1A"); nez.rotation.x = Math.PI / 2; nez.position.set(0, 2.6, .45); g.add(nez); }
    else { const c = maille(new THREE.OctahedronGeometry(1.2), "#A8E4FF", { roughness: .1, transparent: true, opacity: .85 }); c.position.y = 1.4; c.scale.y = 1.7; g.add(c); }
  }else if(id === "bonbons"){
    if(k < .5){ const b = maille(new THREE.CylinderGeometry(.08, .08, 3, 6), "#FFFFFF"); b.position.y = 1.5; g.add(b);
      if(!M.sucette) M.sucette = new THREE.MeshStandardMaterial({ map: texture(128, 128, (c) => { const cl = ["#FF4FB0", "#FFFFFF", "#4CC9F0", "#FFFFFF"]; for(let i = 0; i < 8; i++){ c.fillStyle = cl[i % 4]; c.beginPath(); c.moveTo(64, 64); c.arc(64, 64, 64, i * Math.PI / 4, (i + 1) * Math.PI / 4); c.fill(); } }), roughness: .3 });
      const sucette = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .3, 20), M.sucette);
      sucette.rotation.x = Math.PI / 2; sucette.position.y = 3.2; g.add(sucette); }
    else if(k < .8){ const d = maille(new THREE.TorusGeometry(.8, .4, 10, 20), "#E8B07A", { flatShading: false }); d.rotation.x = Math.PI / 2; d.position.y = .4; g.add(d); const gl = maille(new THREE.TorusGeometry(.8, .3, 10, 20), "#FF8FC8", { flatShading: false }); gl.rotation.x = Math.PI / 2; gl.position.y = .6; g.add(gl); }
    else { const c = maille(new THREE.ConeGeometry(.8, 2.2, 12), "#E8B07A"); c.rotation.x = Math.PI; c.position.y = 1.1; g.add(c); const bo = maille(new THREE.SphereGeometry(.85, 12, 10), "#FFF0F6", { flatShading: false }); bo.position.y = 2.3; g.add(bo); }
  }else if(id === "volcan"){
    if(k < .5){ const v = maille(new THREE.ConeGeometry(2, 3.4, 9), "#4A3030"); v.position.y = 1.7; g.add(v); const l = maille(new THREE.SphereGeometry(.7, 10, 8), "#FF6A1A", { emissive: "#FF4A00", emissiveIntensity: 1 }); l.position.y = 3.3; g.add(l); }
    else { const c = maille(new THREE.OctahedronGeometry(.9), "#FF8A3C", { emissive: "#FF5A00", emissiveIntensity: .7 }); c.position.y = 1; c.scale.y = 1.8; g.add(c); }
  }else{
    if(k < .5){ const c = maille(new THREE.OctahedronGeometry(.9), ["#FFD23F", "#4CC9F0", "#FF8FB8"][Math.floor(r() * 3)], { emissive: "#FFFFFF", emissiveIntensity: .25 }); c.position.y = 1.2; c.scale.y = 1.6; g.add(c); }
    else { const fusee = new THREE.Group(); const corps = maille(new THREE.CylinderGeometry(.5, .5, 2, 12), "#FFFFFF"); corps.position.y = 1.4; fusee.add(corps);
      const nez = maille(new THREE.ConeGeometry(.5, .9, 12), "#E5484D"); nez.position.y = 2.85; fusee.add(nez);
      const hublot = maille(new THREE.CircleGeometry(.22, 12), "#4CC9F0"); hublot.position.set(0, 1.8, .51); fusee.add(hublot); g.add(fusee); }
  }
  return g;
}
function decorLointain(W, r){
  const c = piste.P[Math.floor(piste.NS / 2)];
  // le décor lointain est placé bien au-delà du toboggan entier (sinon une montagne peut barrer la fin)
  let loin = 0; piste.P.forEach(p => { loin = Math.max(loin, Math.hypot(p.x - c.x, p.z - c.z)); });
  const R0 = loin + 420;
  if(W.id === "espace"){
    [["#FF9F6B", 60, -.9, 60], ["#7BC8FF", 35, 1.1, 120], ["#C9A8FF", 90, 2.6, -40]].forEach(([col, rr, a, h], k) => {
      const pl = maille(new THREE.SphereGeometry(rr, 24, 16), col, { flatShading: false, fog: false }); pl.position.set(c.x + Math.cos(a) * (R0 + 200), c.y + h, c.z + Math.sin(a) * (R0 + 200)); niveau3D.add(pl);
      if(k === 2){ const anneau = maille(new THREE.TorusGeometry(130, 8, 4, 60), "#E8D8FF", { fog: false }); anneau.position.copy(pl.position); anneau.rotation.x = 1.2; niveau3D.add(anneau); }
    });
    const etoilesG = new THREE.BufferGeometry(), ep = [];
    for(let k = 0; k < 1500; k++){ const a = r() * Math.PI * 2, b = r() * Math.PI - Math.PI / 2, d = R0 + 400; ep.push(c.x + Math.cos(a) * Math.cos(b) * d, c.y + Math.sin(b) * d, c.z + Math.sin(a) * Math.cos(b) * d); }
    etoilesG.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
    niveau3D.add(new THREE.Points(etoilesG, new THREE.PointsMaterial({ color: "#FFFFFF", size: 2.2, sizeAttenuation: false, fog: false })));
    return;
  }
  // montagnes / volcans au loin
  for(let k = 0; k < 18; k++){
    const a = k / 18 * Math.PI * 2, d = R0 + 120;
    const h = 220 + r() * 180, m = maille(new THREE.ConeGeometry(160 + r() * 80, h, 7), W.id === "volcan" ? "#3A2424" : W.id === "bonbons" ? "#FFC4E1" : "#8C9BB5", { fog: false });
    m.position.set(c.x + Math.cos(a) * d, c.y - 150 + h / 2, c.z + Math.sin(a) * d); niveau3D.add(m);
    if(W.id !== "volcan"){ const cap = maille(new THREE.ConeGeometry(60, 80, 7), W.id === "bonbons" ? "#FFFFFF" : "#FFFFFF", { fog: false }); cap.position.set(m.position.x, c.y - 150 + h - 40, m.position.z); niveau3D.add(cap); }
    else { const l = maille(new THREE.SphereGeometry(30, 10, 8), "#FF6A1A", { emissive: "#FF4A00", emissiveIntensity: 1, fog: false }); l.position.set(m.position.x, c.y - 150 + h, m.position.z); niveau3D.add(l); }
  }
}
/* particules qui volent autour de la caméra : feuilles, neige, paillettes, braises, étoiles */
let part = null, partV = [];
function particules(W){
  const N = qualite === "basse" ? 160 : 380, g = new THREE.BufferGeometry(), p = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const couleurs = { feuilles: ["#7BC96F", "#FFD23F", "#FF9F1C"], neige: ["#FFFFFF"], paillettes: ["#FF4FB0", "#FFD23F", "#4CC9F0", "#FFFFFF"], braises: ["#FF6A1A", "#FFB347"], etoiles: ["#FFFFFF", "#FFD23F"] }[W.particules];
  partV = [];
  for(let k = 0; k < N; k++){ p.set([(Math.random() - .5) * 60, (Math.random() - .5) * 40, (Math.random() - .5) * 60], k * 3); const c = new THREE.Color(couleurs[k % couleurs.length]); col.set([c.r, c.g, c.b], k * 3);
    partV.push([(Math.random() - .5) * 1.5, W.particules === "braises" ? 1 + Math.random() * 2 : -(0.6 + Math.random() * 1.6), (Math.random() - .5) * 1.5]); }
  g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const rond = texture(32, 32, (c) => { const d = c.createRadialGradient(16, 16, 1, 16, 16, 15); d.addColorStop(0, "rgba(255,255,255,1)"); d.addColorStop(.6, "rgba(255,255,255,.9)"); d.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = d; c.fillRect(0, 0, 32, 32); });
  part = new THREE.Points(g, new THREE.PointsMaterial({ size: W.particules === "neige" ? .45 : .34, vertexColors: true, transparent: true, opacity: .95, map: rond, depthWrite: false }));
  niveau3D.add(part);
}
function majParticules(dt){
  if(!part) return;
  const p = part.geometry.attributes.position, a = p.array, c = camera.position;
  for(let k = 0; k < partV.length; k++){
    a[k * 3] += partV[k][0] * dt; a[k * 3 + 1] += partV[k][1] * dt; a[k * 3 + 2] += partV[k][2] * dt;
    for(let j = 0; j < 3; j++){ const d = a[k * 3 + j] - c.getComponent(j), lim = j === 1 ? 20 : 30; if(d > lim) a[k * 3 + j] -= 2 * lim; else if(d < -lim) a[k * 3 + j] += 2 * lim; }
  }
  p.needsUpdate = true;
}

/* ======================= la glissade ======================= */
let etat = "chargement", jeu = null, glisseur = null;
const clavier = {}; let tactile = { g: false, d: false }, appuiSaut = false;
addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase(); clavier[k] = true;
  if([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if(k === " " || k === "arrowup" || k === "w" || k === "z") appuiSaut = true;
  if(k === "escape" || k === "p"){ if(etat === "jeu" || etat === "pause") basculerPause(); }
  else if(etat === "menu" && k === "enter") $("go").click();
  else if(etat === "fin" && k === "enter") ($("suivant").hidden ? $("rejouer") : $("suivant")).click();
});
addEventListener("keyup", (e) => { clavier[e.key.toLowerCase()] = false; });
[["tg", "g"], ["td", "d"], ["ts", "s"]].forEach(([id, k]) => {
  const b = $(id);
  b.addEventListener("pointerdown", (e) => { e.preventDefault(); if(k === "s") appuiSaut = true; else tactile[k] = true; b.classList.add("on"); son.reveil(); });
  const off = (e) => { e.preventDefault(); if(k !== "s") tactile[k] = false; b.classList.remove("on"); };
  b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off);
});

function demarrer(idx){
  choix.monde = idx; ecrire("tobo-monde-" + choix.joueur, String(idx));
  construireMonde(idx);
  if(glisseur) scene.remove(glisseur);
  const J = JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[2];
  glisseur = creerGlisseur(J, choix.bouee); scene.add(glisseur);
  jeu = { s: 3, th: 0, vth: 0, h: 0, vh: 0, v: 0, t: -3.4, etoiles: 0, combo: 0, comboT: 0, boost: 0, choc: 0, fini: false, finT: 0, enTrou: false, parcours: 0 };
  etat = "jeu";
  $("menu").hidden = true; $("hud").hidden = false; $("ecranFin").hidden = true;
  $("tactile").hidden = !("ontouchstart" in window);
  $("nomMonde").textContent = MONDES[idx].e + " " + MONDES[idx].nom;
  $("aideJeu").innerHTML = "<b>← →</b> pour glisser à gauche et à droite · <b>Espace</b> ou <b>↑</b> pour sauter · 🎮 joystick et <b>✕</b>";
  $("aideJeu").hidden = "ontouchstart" in window;
  majEtoiles();
  annoncer(MONDES[idx].nom, 2.0, "Monde " + (idx + 1));
  voix(MONDES[idx].nom + " !");
  son.demarrer(MONDES[idx].musique);
  fps = { n: 0, t: 0, fait: qualite !== "haute" || TEST };
}
function commandes(){
  let dir = 0;
  if(clavier["arrowleft"] || clavier["q"] || clavier["a"] || tactile.g) dir -= 1;
  if(clavier["arrowright"] || clavier["d"] || tactile.d) dir += 1;
  const m = lireManette();
  if(m){ if(Math.abs(m.x) > .2) dir = m.x; if(m.nA || m.nB) appuiSaut = true; if(m.nSTART) basculerPause(); }
  const saut = appuiSaut; appuiSaut = false;
  return { dir, saut };
}
function pilotageAuto(){
  // pour les tests : évite les obstacles et va chercher les étoiles
  const devant = piste.obstacles.find(o => o.s > jeu.s && o.s - jeu.s < 14);
  const etoile = piste.etoiles.find(e => !e.pris && e.s > jeu.s + 2 && e.s - jeu.s < 20 && e.h < 1.5);
  let cible = etoile ? etoile.th : 0;
  if(devant && Math.abs(devant.th - cible) < .5) cible = devant.th > 0 ? devant.th - .7 : devant.th + .7;
  return { dir: clamp((cible - jeu.th) * 3, -1, 1), saut: !!(devant && devant.s - jeu.s < 3 && Math.abs(devant.th - jeu.th) < .35) };
}
function maj(dt){
  const niv = NIVEAUX[choix.niveau], J = jeu;
  J.t += dt;
  const avant = J.t - dt;
  [[-2.4, "3", "Trois"], [-1.6, "2", "Deux"], [-.8, "1", "Un"], [0, "C'est parti !", "C'est parti !"]].forEach(([s, txt, v]) => {
    if(avant < s && J.t >= s){ annoncer(txt, s === 0 ? 1 : .7); voix(v); son.bip(s === 0 ? 880 : 520, .25); }
  });
  const cmd = AUTO ? pilotageAuto() : commandes();
  if(J.t < 0 && !AUTO) { cmd.dir = 0; cmd.saut = false; }
  if(!J.fini && J.t >= 0){
    const R = repere(J.s);
    // vitesse : plus ça descend, plus ça va vite
    const pente = -R.t.y;
    let cible = niv.v * (1 + pente * 1.4) + (J.boost > 0 ? 10 : 0);
    if(J.choc > 0) cible *= .45;
    J.v = lerp(J.v, cible, clamp(dt * (J.v < cible ? 1.4 : 2.2), 0, 1));
    J.s += J.v * dt; J.parcours = J.s;
    J.boost = Math.max(0, J.boost - dt);
    // gauche / droite : le joueur dirige, la pesanteur ramène au fond, les virages poussent vers l'extérieur
    const v = piste.virage[R.i] || 0;
    const force = cmd.dir * 4.2 - Math.sin(J.th) * 3.2 - v * J.v * J.v * .028;
    J.vth = lerp(J.vth, force, clamp(dt * 5, 0, 1));
    J.th += J.vth * dt * .55;
    if(Math.abs(J.th) > THMAX * .93){ J.th = Math.sign(J.th) * THMAX * .93; J.vth *= -.3; }
    // saut
    if(cmd.saut && J.h <= 0.001){ J.vh = 8.5; son.saut(); }
    // trou : on s'envole automatiquement
    const trou = piste.trous.find(t => J.s > t[0] - 1.5 && J.s < t[1]);
    if(trou && !J.enTrou){ J.enTrou = true; const duree = (trou[1] - J.s) / Math.max(J.v, 10) + .25; J.vh = Math.max(J.vh, 11 * duree); son.saut(); voix(Math.random() < .5 ? "Waouh !" : "Super !"); }
    if(J.h > 0 || J.vh > 0){ J.vh -= 22 * dt; J.h += J.vh * dt; if(J.h <= 0){ J.h = 0; J.vh = 0; if(J.enTrou && !piste.dansTrou(J.s)) J.enTrou = false; } }
    if(piste.dansTrou(J.s) && J.h < .5){ J.h = .5; J.vh = Math.max(J.vh, 2); }
    if(!piste.dansTrou(J.s)) J.enTrou = J.enTrou && J.h > 0;
    // étoiles
    piste.etoiles.forEach(e => {
      if(e.pris || Math.abs(e.s - J.s) > 1.4) return;
      if(Math.abs(e.th - J.th) * RP < 1.2 && Math.abs(e.h - (J.h + .9)) < 1.4){
        e.pris = true; majEtoile(e, 0); J.etoiles += e.valeur;
        J.combo = J.comboT > 0 ? J.combo + 1 : 1; J.comboT = 1.2; son.etoile(J.combo, e.valeur > 1); majEtoiles();
        if(e.valeur > 1) bonus("💎 +5 !"); else if(J.combo === 5) bonus("✨ Super série !");
      }
    });
    J.comboT -= dt;
    // obstacles
    J.choc = Math.max(0, J.choc - dt);
    piste.obstacles.forEach(o => {
      if(J.choc > 0 || Math.abs(o.s - J.s) > 1.2 || o.touche) return;
      if(Math.abs(o.th - J.th) * RP < 1.25 && J.h < 1.1){
        o.touche = true; J.choc = 1.0; son.choc(); voix("Aïe !");
        if(niv.perte){ const perdu = Math.min(niv.perte, J.etoiles); J.etoiles -= perdu; majEtoiles(); if(perdu) bonus("−" + perdu + " ⭐"); }
        J.vth += (J.th >= o.th ? 1 : -1) * 6;
      }
    });
    // accélérateurs
    piste.boosts.forEach(b => { if(!b.pris && Math.abs(b.s - J.s) < 1.5 && Math.abs(b.th - J.th) * RP < 1.3 && J.h < .5){ b.pris = true; J.boost = 1.6; son.boost(); bonus("🔥 Turbo !"); setTimeout(() => { b.pris = false; }, 3000); } });
    // arrivée
    if(J.s >= piste.longueur - 1){ J.fini = true; J.finT = 0; arrivee(); }
  }else if(J.fini){
    J.finT += dt; J.v = lerp(J.v, 0, clamp(dt * 1.5, 0, 1));
  }
}
function majEtoiles(){ $("etoiles").innerHTML = "⭐ " + jeu.etoiles + "<small> / " + piste.total + "</small>"; }
let bonusT = 0;
function bonus(t){ const b = $("bonus"); b.textContent = t; b.classList.add("on"); bonusT = 1.1; }
let annonceT = 0;
function annoncer(txt, d, petit){ const a = $("annonce"); a.textContent = txt; if(petit){ const s = document.createElement("small"); s.textContent = petit; a.insertBefore(s, a.firstChild); } a.classList.toggle("on", !!txt); annonceT = d || 0; }

/* placer le glisseur et la caméra */
const camPos = new THREE.Vector3(), camVise = new THREE.Vector3(), camHaut = new THREE.Vector3(0, 1, 0);
let premiereImage = true;
function placer(dt){
  const J = jeu;
  if(!J.fini){
    const s = clamp(J.s, 0, piste.longueur);
    const pos = surfaceS(s, J.th, J.h);
    glisseur.position.copy(pos);
    const n = orienter(glisseur, s, J.th);
    const u = glisseur.userData;
    u.corps.rotation.z = lerp(u.corps.rotation.z, -J.vth * .08, .2);
    u.bras.forEach((b, k) => { b.rotation.z = (k ? 1 : -1) * (J.h > .3 ? 2.6 : .55); });
    if(J.choc > 0) glisseur.rotateOnAxis(new THREE.Vector3(0, 1, 0), (1 - J.choc) * Math.PI * 2);
    u.ombre.position.y = .02 - J.h; u.ombre.visible = !piste.dansTrou(s);
    // caméra derrière, un peu au-dessus, dans le tube
    const sc = Math.max(0, s - 8.5), Rc = repere(sc);
    const voulu = new THREE.Vector3().copy(piste.P[Rc.i]).addScaledVector(Rc.h, RP + 1.7 + J.h * .4).addScaledVector(Rc.d, RP * Math.sin(J.th) * .5);
    const vise = pos.clone().addScaledVector(repere(Math.min(piste.longueur, s + 6)).t, 5).addScaledVector(n, .8);
    const k = premiereImage ? 1 : 1 - Math.exp(-dt * 9);
    camPos.lerp(voulu, k); camVise.lerp(vise, k); camHaut.lerp(Rc.h, k * .6).normalize();
    premiereImage = false;
  }else{
    // arrivée : on glisse sur l'île et la caméra tourne autour
    const fin = piste.P[piste.NS], t = piste.directionFin || piste.T[piste.NS];
    const p = new THREE.Vector3().copy(fin).addScaledVector(t, Math.min(8, J.finT * J.v * .6 + J.finT * 3));
    glisseur.position.lerp(new THREE.Vector3(p.x, fin.y - .7, p.z), .1);
    const versCam = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(camPos.x - glisseur.position.x, camPos.z - glisseur.position.z));
    glisseur.quaternion.slerp(versCam, .08);
    glisseur.userData.bras.forEach((b, k) => { b.rotation.z = (k ? 1 : -1) * 2.7 + Math.sin(J.finT * 8) * .2; });
    glisseur.userData.corps.position.y = Math.abs(Math.sin(J.finT * 6)) * .3;
    // la caméra reste devant, au-dessus de l'île (jamais dans le toboggan), et balance doucement
    const a = Math.sin(J.finT * .5) * .9, df = piste.directionFin || t;
    const dirCam = new THREE.Vector3(df.x * Math.cos(a) - df.z * Math.sin(a), 0, df.x * Math.sin(a) + df.z * Math.cos(a));
    camPos.lerp(new THREE.Vector3(glisseur.position.x, glisseur.position.y + 3.2, glisseur.position.z).addScaledVector(dirCam, 8), .06);
    camVise.lerp(glisseur.position.clone().add(new THREE.Vector3(0, 1.2, 0)), .1); camHaut.lerp(new THREE.Vector3(0, 1, 0), .1);
  }
  camera.position.copy(camPos); camera.up.copy(camHaut); camera.lookAt(camVise);
  camera.fov = lerp(camera.fov, 64 + clamp(jeu.v / 30, 0, 1) * 12 + (jeu.boost > 0 ? 6 : 0), clamp(dt * 3, 0, 1)); camera.updateProjectionMatrix();
  // étoiles qui tournent, portail qui brille
  const t = performance.now() / 1000;
  piste.etoiles.forEach(e => { if(!e.pris && Math.abs(e.s - jeu.s) < 110) majEtoile(e, t); });
  if(piste.portail){ piste.portail.rotateZ(.01); piste.voile.material.opacity = .3 + Math.sin(t * 3) * .1; }
}

/* ======================= arrivée et résultats ======================= */
function trophees(etoiles, total){ const r = etoiles / Math.max(1, total); return r >= .85 ? 3 : r >= .55 ? 2 : r >= .2 ? 1 : 0; }
function arrivee(){
  const idx = choix.monde, J = jeu, tr = trophees(J.etoiles, piste.total);
  son.fanfare(); annoncer("Bravo !", 2.2); voix("Monde terminé !");
  const cle = "tobo-" + choix.joueur + "-" + MONDES[idx].id;
  const avant = parseInt(lire(cle, "0"), 10) || 0;
  if(J.etoiles > avant) ecrire(cle, String(J.etoiles));
  ecrire(cle + "-total", String(piste.total));
  let nouveau = false;
  if(idx + 1 < MONDES.length && debloque() < idx + 1){ ecrire("tobo-debloque-" + choix.joueur, String(idx + 1)); nouveau = true; }
  setTimeout(() => {
    if(etat !== "jeu") return;
    etat = "fin";
    $("finTitre").textContent = tr === 3 ? "Fantastique !" : tr === 2 ? "Super !" : "Bravo !";
    $("finTrophees").textContent = "🏆".repeat(tr) + "▫️".repeat(3 - tr);
    $("finEtoiles").textContent = "⭐ " + J.etoiles + " étoiles sur " + piste.total + (J.etoiles > avant && avant ? "  — record !" : "");
    const dernier = idx === MONDES.length - 1;
    $("finTexte").textContent = dernier ? "Tu as traversé les 5 mondes ! Tu es un vrai champion du toboggan ! 🎉" : nouveau ? "Nouveau monde débloqué : " + MONDES[idx + 1].e + " " + MONDES[idx + 1].nom + " !" : "Prochain monde : " + MONDES[idx + 1].e + " " + MONDES[idx + 1].nom;
    $("suivant").hidden = dernier;
    voix(dernier ? "Tu as fini tous les mondes ! Tu es un champion !" : nouveau ? "Nouveau monde débloqué !" : "Bravo !");
    $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = false;
  }, 3200);
}
function basculerPause(){
  if(etat === "jeu"){ etat = "pause"; $("ecranPause").hidden = false; son.couper(true); }
  else if(etat === "pause"){ etat = "jeu"; $("ecranPause").hidden = true; son.couper(false); }
}
$("pause").onclick = basculerPause; $("reprendre").onclick = basculerPause;
$("abandon").onclick = () => { $("ecranPause").hidden = true; allerMenu(); };
$("rejouer").onclick = () => { son.reveil(); demarrer(choix.monde); };
$("suivant").onclick = () => { son.reveil(); demarrer(Math.min(MONDES.length - 1, choix.monde + 1)); };
$("versMenu").onclick = () => allerMenu();
document.addEventListener("visibilitychange", () => { if(document.hidden && etat === "jeu") basculerPause(); });

/* ======================= sons et musique ======================= */
const son = (() => {
  let ctx = null, maitre = null, minuteur = null, pas = 0, prochain = 0, musique = null, coupe = false, vent = null, gainVent = null;
  function reveil(){ if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); maitre = ctx.createGain(); maitre.gain.value = 1; maitre.connect(ctx.destination); }catch(e){ return; } } if(ctx.state === "suspended") ctx.resume(); }
  function note(f, t, d, type, vol, sortie){ const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); g.connect(sortie || maitre); o.start(t); o.stop(t + d + .05); }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function bip(f, d, type, vol, f2){ if(!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol || .1, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); g.connect(maitre); o.start(t); o.stop(t + d + .02); }
  function bruit(d, vol, fr){ if(!ctx) return; const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * d), ctx.sampleRate), x = b.getChannelData(0); for(let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "bandpass"; f.frequency.value = fr; g.gain.value = vol; s.buffer = b; s.connect(f); f.connect(g); g.connect(maitre); s.start(); }
  // petite musique qui tourne en boucle, différente pour chaque monde
  function boucle(){
    if(!ctx || !musique) return;
    const pasDuree = 60 / musique.tempo / 2, gm = musique.gamme, base = musique.base;
    while(prochain < ctx.currentTime + .25){
      if(musiqueOn && !coupe){
        const motif = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 5, 4, 2, 3];
        const k = motif[pas % 16] + Math.floor(pas / 32) % 2 * 2, deg = gm[k % gm.length] + 12 * Math.floor(k / gm.length);
        if(pas % 16 !== 7 && pas % 16 !== 15) note(hz(base + deg), prochain, pasDuree * 1.6, "triangle", .045);
        if(pas % 4 === 0) note(hz(base - 24 + gm[[0, 0, 3, 4][Math.floor(pas / 16) % 4] % gm.length]), prochain, pasDuree * 3.2, "sine", .09);
        if(pas % 2 === 1) note(hz(base + 24), prochain, .03, "square", .008);
      }
      prochain += pasDuree; pas++;
    }
  }
  return {
    reveil, bip,
    demarrer(m){ reveil(); if(!ctx) return; musique = m; pas = 0; prochain = ctx.currentTime + .1; coupe = false;
      if(!minuteur) minuteur = setInterval(boucle, 60);
      if(!vent){ const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), x = b.getChannelData(0); for(let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1;
        vent = ctx.createBufferSource(); vent.buffer = b; vent.loop = true; const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 500; gainVent = ctx.createGain(); gainVent.gain.value = 0;
        vent.connect(f); f.connect(gainVent); gainVent.connect(maitre); vent.start(); } },
    vent(v){ if(gainVent) gainVent.gain.setTargetAtTime(coupe ? 0 : clamp(v / 30, 0, 1) * .05, ctx.currentTime, .2); },
    couper(c){ coupe = c; if(gainVent && c) gainVent.gain.value = 0; },
    arreter(){ coupe = true; if(gainVent) gainVent.gain.value = 0; },
    etoile(combo, gemme){ if(!ctx) return; const f = gemme ? 1568 : 880 * Math.pow(2, Math.min(combo, 8) / 12); bip(f, .12, "triangle", .08); setTimeout(() => bip(f * 1.5, .15, "triangle", .06), 60); },
    saut(){ bip(330, .35, "sine", .1, 880); }, choc(){ bruit(.25, .3, 400); bip(180, .3, "square", .05, 90); },
    boost(){ bruit(.6, .25, 1400); bip(400, .5, "sawtooth", .04, 1200); },
    fanfare(){ if(!ctx) return; [0, 4, 7, 12, 7, 12].forEach((n, i) => setTimeout(() => bip(hz(72 + n), .3, "triangle", .1), i * 130)); }
  };
})();
const lecteurVoix = new Audio();
function slug(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function voix(t){ try{ lecteurVoix.muted = false; lecteurVoix.src = "sons/" + slug(t) + ".mp3"; const p = lecteurVoix.play(); if(p && p.catch) p.catch(() => {}); }catch(e){} }

/* ======================= menu : la carte des mondes ======================= */
let survol = 0;
function allerMenu(){
  etat = "menu"; son.arreter();
  if(glisseur){ scene.remove(glisseur); glisseur = null; }
  construireMonde(choix.monde); survol = 20;
  $("menu").hidden = false; $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = true; $("ecranPause").hidden = true;
  remplirMenu();
}
function boutons(id, liste, cle, rendu, apres){
  const box = $(id); box.innerHTML = "";
  liste.forEach(([val, obj]) => {
    const b = document.createElement("button"); b.innerHTML = rendu(obj, val); if(choix[cle] === val) b.className = "on";
    b.onclick = () => { son.reveil(); choix[cle] = val; ecrire("tobo-" + cle + (cle === "niveau" ? "-" + choix.joueur : ""), val); if(apres) apres(); remplirMenu(); };
    box.appendChild(b);
  });
}
function remplirMenu(){
  const box = $("mondes"); box.innerHTML = "";
  const ouvert = debloque();
  MONDES.forEach((W, i) => {
    const b = document.createElement("button"); b.style.background = W.carte;
    const best = parseInt(lire("tobo-" + choix.joueur + "-" + W.id, "0"), 10) || 0, tot = parseInt(lire("tobo-" + choix.joueur + "-" + W.id + "-total", "0"), 10) || 0;
    const tr = tot ? trophees(best, tot) : 0;
    b.innerHTML = '<span class="e">' + (i > ouvert ? "🔒" : W.e) + "</span><span>" + (i + 1) + ". " + W.nom + "<small>" + (i > ouvert ? "Termine le monde d'avant pour l'ouvrir" : best ? "⭐ record : " + best : "Pas encore glissé ici") + "</small></span>" +
      '<span class="tro">' + (tot ? "🏆".repeat(tr) + "▫️".repeat(3 - tr) : "") + "</span>";
    if(i > ouvert) b.className = "ferme"; else if(i === choix.monde) b.className = "on";
    b.onclick = () => { if(i > ouvert){ son.bip(200, .2); return; } son.reveil(); choix.monde = i; ecrire("tobo-monde-" + choix.joueur, String(i)); construireMonde(i); survol = 20; remplirMenu(); };
    box.appendChild(b);
  });
  boutons("cJoueur", JOUEURS.map(j => [j.id, j]), "joueur", (j) => '<span class="e">' + j.e + "</span>" + j.nom, () => {
    choix.niveau = lire("tobo-niveau-" + choix.joueur, (JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[0]).niveau);
    choix.monde = Math.min(parseInt(lire("tobo-monde-" + choix.joueur, "0"), 10) || 0, debloque()); construireMonde(choix.monde); });
  const perso = document.createElement("button"); perso.innerHTML = '<span class="e">✏️</span>Mon personnage';
  perso.onclick = () => { location.href = "../avatar/?profil=" + encodeURIComponent(choix.joueur) + "&retour=../toboggan/"; };
  $("cJoueur").appendChild(perso);
  const bb = $("cBouee"); bb.innerHTML = "";
  BOUEES.forEach(c => { const b = document.createElement("button"); b.innerHTML = '<span class="pastille" style="background:' + c + '"></span>'; if(c === choix.bouee) b.className = "on";
    b.onclick = () => { choix.bouee = c; ecrire("tobo-bouee", c); remplirMenu(); }; bb.appendChild(b); });
  boutons("cNiveau", Object.entries(NIVEAUX), "niveau", (n) => '<span class="e">' + n.e + "</span><span>" + n.nom + "<small>" + n.desc + "</small></span>");
  $("son").textContent = musiqueOn ? "🔊 Musique" : "🔇 Musique";
  $("aide").innerHTML = ("ontouchstart" in window) ? "<b>◀ ▶</b> pour glisser à gauche et à droite, <b>⤴️</b> pour sauter." :
    "<b>← →</b> pour glisser à gauche et à droite, <b>Espace</b> ou <b>↑</b> pour sauter, <b>Échap</b> pause.<br>🎮 <b>Manette</b> : joystick pour glisser, <b>✕</b> pour sauter.<br>Ramasse les ⭐ et les 💎, saute par-dessus les obstacles, passe sur les flèches orange pour aller plus vite !";
}
$("son").onclick = () => { musiqueOn = !musiqueOn; ecrire("tobo-musique", musiqueOn ? "1" : "0"); remplirMenu(); };
$("go").onclick = () => {
  son.reveil();
  try{ lecteurVoix.muted = true; lecteurVoix.src = "sons/trois.mp3"; const p = lecteurVoix.play(); if(p && p.then) p.then(() => { lecteurVoix.pause(); lecteurVoix.muted = false; }).catch(() => { lecteurVoix.muted = false; }); }catch(e){}
  demarrer(choix.monde);
};

/* ======================= boucle ======================= */
let fps = { n: 0, t: 0, fait: true }, tAvant = performance.now();
function boucleImages(now){
  requestAnimationFrame(boucleImages);
  let dt = Math.min(.05, (now - tAvant) / 1000); tAvant = now;
  if(TEST && window.__dtFixe) dt = window.__dtFixe;
  if(etat === "menu" || etat === "fin" || etat === "pause"){
    const m = lireManette();
    if(m && m.nA){ if(etat === "menu") $("go").click(); else if(etat === "fin") ($("suivant").hidden ? $("rejouer") : $("suivant")).click(); }
    if(m && m.nSTART && etat === "pause") basculerPause();
  }
  if(etat === "menu"){
    $("etatManette").textContent = vraiesManettes().length ? "🎮 Manette connectée ! Appuie sur ✕ pour glisser." : "🎮 Manette branchée ? Appuie sur un de ses boutons pour la réveiller.";
    // la caméra survole le toboggan du monde choisi
    survol = (survol + dt * 14) % (piste.longueur - 30);
    const R = repere(survol), large = innerWidth > 700;
    const p = new THREE.Vector3().copy(piste.P[R.i]).addScaledVector(R.h, RP + 6).addScaledVector(R.d, large ? -7 : 0).addScaledVector(R.t, -10);
    camera.position.lerp(p, .08); camera.up.set(0, 1, 0);
    camera.lookAt(surfaceS(Math.min(piste.longueur, survol + 18), 0, 0)); camera.fov = 66; camera.updateProjectionMatrix();
  }else if(etat === "jeu"){
    maj(dt); placer(dt);
    son.vent(jeu.v);
    $("progres").firstChild.style.width = Math.round(clamp(jeu.s / piste.longueur, 0, 1) * 100) + "%";
    if(annonceT > 0){ annonceT -= dt; if(annonceT <= 0) annoncer("", 0); }
    if(bonusT > 0){ bonusT -= dt; if(bonusT <= 0) $("bonus").classList.remove("on"); }
    if(!fps.fait){ fps.n++; fps.t += dt; if(fps.t > 2.5){ if(fps.n / fps.t < 40 && qualite !== "basse"){ qualite = qualite === "haute" ? "moyenne" : "basse"; ecrire("tobo-qualite", qualite); appliquerQualite(); fps = { n: 0, t: 0, fait: false }; } else fps.fait = true; } }
  }else if(etat === "fin"){
    jeu.finT += dt; placer(dt);
  }
  majParticules(dt);
  renderer.render(scene, camera);
}

/* ======================= démarrage ======================= */
appliquerQualite();
construireMonde(choix.monde);
remplirMenu();
$("chargement").hidden = true; etat = "menu"; $("menu").hidden = false;
requestAnimationFrame(boucleImages);
if(TEST) window.__jeu = { renderer, get etat(){ return etat; }, get jeu(){ return jeu; }, get piste(){ return piste; }, choix, demarrer, scene, camera, MONDES };
