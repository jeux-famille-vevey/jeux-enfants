/* Super Course 3D — course de voitures et de motos en 3D (Three.js).
   Tout est dessiné en code : circuit, décors, véhicules. Aucun fichier d'image externe. */
import * as THREE from "./lib/three.module.min.js";

const $ = (id) => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const TEST = PARAMS.has("test"), AUTO = PARAMS.has("auto");
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function angle(a){ while(a > Math.PI) a -= 2 * Math.PI; while(a < -Math.PI) a += 2 * Math.PI; return a; }
function hasard(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ======================= réglages ======================= */
const PILOTES = [
  { id:"mikael", nom:"Mikael", e:"⚽", niveau:"facile" },
  { id:"aleyah", nom:"Aleyah", e:"⭐", niveau:"normal" },
  { id:"invite", nom:"Invité", e:"🙂", niveau:"normal" }
];
const NIVEAUX = {
  facile:   { nom:"Facile", e:"🐣", desc:"avance tout seul", ia:.90, tours:2, auto:true, aide:true, mur:3 },
  normal:   { nom:"Normal", e:"🏎️", desc:"3 tours", ia:.94, tours:3, auto:false, aide:false, mur:12 },
  champion: { nom:"Champion", e:"🔥", desc:"très rapide", ia:1.02, tours:3, auto:false, aide:false, mur:12 }
};
const VEHICULES = {
  voiture:  { nom:"Voiture de course", e:"🏎️", vmax:44, acc:19, virage:1.85, herbe:.45 },
  moto:     { nom:"Moto", e:"🏍️", vmax:45, acc:23, virage:2.0, herbe:.42 },
  pompiers: { nom:"Camion de pompiers", e:"🚒", vmax:40, acc:15, virage:1.65, herbe:.5 },
  tracteur: { nom:"Tracteur", e:"🚜", vmax:37, acc:17, virage:1.75, herbe:.95 }
};
const COULEURS = ["#E5484D", "#3D7BD9", "#FFD23F", "#3FA34D", "#FF8FB8", "#8E5BC4", "#FF9F1C", "#F4F4F4"];
const ADVERSAIRES = [
  { nom:"Balou", couleur:"#FFFFFF", v:"voiture" }, { nom:"Grognon", couleur:"#6FA84A", v:"tracteur" },
  { nom:"Pompon", couleur:"#FF8FB8", v:"moto" }, { nom:"Zoé", couleur:"#E5484D", v:"voiture" }, { nom:"Tornade", couleur:"#4CC9F0", v:"moto" }
];
const ECHELLE = 1.3, LARGEUR = 16, N = 900;
const CIRCUITS = {
  lac: { nom:"Le lac", e:"🏞️", pts:[[0,0],[130,0],[230,40],[260,130],[200,210],[90,200],[30,140],[-40,170],[-140,140],[-180,50],[-120,-40]],
    ciel:["#5FB4F5", "#DDF1FF"], sol:"#62B548", sol2:"#57A83F", brouillard:"#CFE9FF", deco:"lac" },
  desert: { nom:"Le désert", e:"🌵", pts:[[0,0],[160,-10],[250,60],[230,160],[130,130],[60,200],[-70,190],[-150,100],[-100,20]],
    ciel:["#F7924A", "#FFE4B0"], sol:"#E3B96C", sol2:"#D9AC5C", brouillard:"#FFD9A0", deco:"desert" },
  neige: { nom:"La montagne", e:"🏔️", pts:[[0,0],[110,30],[200,0],[270,80],[200,170],[80,130],[-10,200],[-140,160],[-170,60],[-90,-20]],
    ciel:["#8DBDEB", "#F2F8FF"], sol:"#F2F6FC", sol2:"#E4ECF7", brouillard:"#E8F1FB", deco:"neige" }
};

let choix = {
  pilote: lire("course-pilote", "mikael"), vehicule: lire("course-vehicule", "voiture"), couleur: lire("course-couleur", COULEURS[1]),
  circuit: lire("course-circuit", "lac"), niveau: null
};
choix.niveau = lire("course-niveau-" + choix.pilote, (PILOTES.find(p => p.id === choix.pilote) || PILOTES[0]).niveau);

/* ======================= moteur 3D ======================= */
const canvas = $("c");
let renderer;
try{
  renderer = new THREE.WebGLRenderer({ canvas, antialias: lire("course-qualite", "haute") === "haute", powerPreference: "high-performance" });
}catch(e){
  $("chargement").hidden = true; $("erreur3d").hidden = false; throw e;
}
// qualité : se règle toute seule selon la vitesse de l'ordinateur
let qualite = lire("course-qualite", "haute");
function appliquerQualite(){
  const pr = qualite === "haute" ? Math.min(window.devicePixelRatio || 1, 1.5) : qualite === "moyenne" ? 1 : .7;
  renderer.setPixelRatio(pr);
  renderer.shadowMap.enabled = qualite === "haute";
  redimensionner();
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, .5, 2600);
function redimensionner(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", redimensionner);

const hemi = new THREE.HemisphereLight(0xffffff, 0x557744, 1.25);
scene.add(hemi);
const soleil = new THREE.DirectionalLight(0xffffff, 2.1);
soleil.position.set(60, 120, 40);
soleil.castShadow = true;
soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 300 });
soleil.shadow.bias = -0.0008;
scene.add(soleil, soleil.target);

/* ---------- textures dessinées ---------- */
function texture(w, h, dessin, repeat){
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if(repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
const texRoute = texture(256, 256, (g, w, h) => {
  g.fillStyle = "#4A4E5E"; g.fillRect(0, 0, w, h);
  const r = hasard(7); for(let i = 0; i < 2600; i++){ g.fillStyle = `rgba(${r() < .5 ? "255,255,255" : "0,0,0"},${r() * .07})`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.fillStyle = "#F4F1E6"; g.fillRect(w / 2 - 5, 20, 10, 100);           // ligne du milieu
  g.fillRect(6, 0, 8, h); g.fillRect(w - 14, 0, 8, h);                   // lignes de bord
}, true);
const texBordure = texture(64, 64, (g) => { g.fillStyle = "#E5484D"; g.fillRect(0, 0, 64, 32); g.fillStyle = "#FFFFFF"; g.fillRect(0, 32, 64, 32); }, true);
const texDamier = texture(128, 32, (g) => { for(let x = 0; x < 16; x++) for(let y = 0; y < 4; y++){ g.fillStyle = (x + y) % 2 ? "#111" : "#fff"; g.fillRect(x * 8, y * 8, 8, 8); } }, true);
function texSol(c1, c2){
  return texture(256, 256, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h);
    const r = hasard(3); for(let i = 0; i < 900; i++){ g.fillStyle = c2; g.globalAlpha = .5 * r(); const s = 2 + r() * 6; g.fillRect(r() * w, r() * h, s, s); }
    g.globalAlpha = 1;
  }, true);
}
function texCiel(c1, c2){
  return texture(4, 256, (g, w, h) => { const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, c1); d.addColorStop(.62, c2); d.addColorStop(1, c2); g.fillStyle = d; g.fillRect(0, 0, w, h); });
}
function texBanniere(texte, fond, encre){
  return texture(512, 96, (g, w, h) => {
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    for(let x = 0; x < w; x += 24){ g.fillStyle = (x / 24) % 2 ? "#111" : "#fff"; g.fillRect(x, 0, 24, 12); g.fillStyle = (x / 24) % 2 ? "#fff" : "#111"; g.fillRect(x, h - 12, 24, 12); }
    g.fillStyle = encre; g.font = "bold 50px Fredoka, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(texte, w / 2, h / 2 + 2);
  });
}

/* ---------- matériaux réutilisés ---------- */
const M = {};
function mat(couleur, opts){
  const k = couleur + JSON.stringify(opts || {});
  if(!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: couleur, roughness: .75, metalness: 0, flatShading: true }, opts || {}));
  return M[k];
}
const ombreMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false });
const texOmbre = texture(64, 64, (g) => { const d = g.createRadialGradient(32, 32, 2, 32, 32, 31); d.addColorStop(0, "rgba(0,0,0,1)"); d.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = d; g.fillRect(0, 0, 64, 64); });
ombreMat.map = texOmbre;

/* ======================= véhicules ======================= */
function boite(w, h, l, couleur, x, y, z, opts){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat(couleur, opts));
  m.position.set(x, y, z); m.castShadow = true; return m;
}
function roue(r, ep, x, y, z){
  const g = new THREE.Group();
  const pneu = new THREE.Mesh(new THREE.CylinderGeometry(r, r, ep, 16), mat("#22232B", { roughness: .9 }));
  pneu.rotation.z = Math.PI / 2; pneu.castShadow = true;
  const jante = new THREE.Mesh(new THREE.CylinderGeometry(r * .55, r * .55, ep + .02, 8), mat("#C9CED8", { metalness: .4, roughness: .4 }));
  jante.rotation.z = Math.PI / 2;
  const rayon = new THREE.Mesh(new THREE.BoxGeometry(ep + .04, r * 1.1, .12), mat("#8A90A0"));
  g.add(pneu, jante, rayon); g.position.set(x, y, z);
  return g;
}
function pilote(couleurCasque){
  const g = new THREE.Group();
  g.add(boite(.7, .8, .5, "#2E3580", 0, .4, 0));
  const casque = new THREE.Mesh(new THREE.SphereGeometry(.36, 14, 10), mat(couleurCasque, { roughness: .35 }));
  casque.position.y = 1.08; casque.castShadow = true;
  const visiere = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 8, 0, Math.PI * 2, Math.PI * .3, Math.PI * .3), mat("#1A1D2E", { roughness: .2, metalness: .3 }));
  visiere.position.set(0, 1.08, .1); visiere.rotation.x = -Math.PI / 2 + .9;
  g.add(casque, visiere);
  return g;
}
function creerVehicule(type, couleur){
  const g = new THREE.Group(), corps = new THREE.Group(), roues = [], avant = [];
  g.add(corps);
  const noir = "#22232B", verre = "#20314F";
  if(type === "voiture"){
    corps.add(boite(2.1, .55, 4.2, couleur, 0, .62, 0, { roughness: .35, metalness: .15 }));
    corps.add(boite(1.5, .5, 1.7, verre, 0, 1.1, -.2, { roughness: .15, metalness: .4 }));
    corps.add(boite(1.62, .14, 1.85, couleur, 0, 1.38, -.2, { roughness: .35 }));
    corps.add(boite(2.3, .1, .5, couleur, 0, 1.25, -2.0, { roughness: .35 }));          // aileron
    corps.add(boite(.12, .45, .12, noir, -.8, 1.0, -2.0)); corps.add(boite(.12, .45, .12, noir, .8, 1.0, -2.0));
    corps.add(boite(2.15, .2, .6, "#FFFFFF", 0, .72, 1.6));                               // bande
    corps.add(boite(.42, .16, .06, "#FFF6C7", -.65, .7, 2.12, { emissive: "#FFF2A0", emissiveIntensity: .6 }));
    corps.add(boite(.42, .16, .06, "#FFF6C7", .65, .7, 2.12, { emissive: "#FFF2A0", emissiveIntensity: .6 }));
    corps.add(boite(.5, .14, .06, "#FF3B3B", -.65, .74, -2.12, { emissive: "#FF2020", emissiveIntensity: .5 }));
    corps.add(boite(.5, .14, .06, "#FF3B3B", .65, .74, -2.12, { emissive: "#FF2020", emissiveIntensity: .5 }));
    [[-1.12, 1.35], [1.12, 1.35], [-1.12, -1.35], [1.12, -1.35]].forEach((p, i) => { const r = roue(.46, .42, p[0], .46, p[1]); g.add(r); roues.push(r); if(i < 2) avant.push(r); });
  }else if(type === "moto"){
    corps.add(boite(.5, .55, 1.9, couleur, 0, .95, .05, { roughness: .35, metalness: .15 }));
    corps.add(boite(.56, .35, .8, couleur, 0, 1.25, .55, { roughness: .35 }));            // réservoir
    corps.add(boite(.5, .2, .9, noir, 0, 1.25, -.35));                                     // selle
    corps.add(boite(.9, .08, .08, "#C9CED8", 0, 1.55, 1.05, { metalness: .5 }));          // guidon
    corps.add(boite(.08, .6, .08, "#C9CED8", 0, 1.25, 1.1, { metalness: .5 }));
    corps.add(boite(.3, .22, .1, "#FFF6C7", 0, 1.3, 1.22, { emissive: "#FFF2A0", emissiveIntensity: .7 }));
    corps.add(boite(.18, .18, .7, "#9AA0AE", .32, .7, -.6, { metalness: .6, roughness: .3 })); // pot d'échappement
    const p = pilote(couleur === "#F4F4F4" ? "#E5484D" : "#FFFFFF"); p.position.set(0, 1.25, -.25); p.rotation.x = .35; corps.add(p);
    const ra = roue(.55, .3, 0, .55, 1.15), rr = roue(.55, .36, 0, .55, -1.05);
    g.add(ra, rr); roues.push(ra, rr); avant.push(ra);
  }else if(type === "pompiers"){
    corps.add(boite(2.3, 1.3, 2.0, couleur, 0, 1.15, 1.6, { roughness: .4 }));          // cabine
    corps.add(boite(2.0, .6, .1, verre, 0, 1.5, 2.61, { roughness: .15, metalness: .4 }));
    corps.add(boite(2.3, 1.1, 3.0, couleur, 0, 1.05, -.9, { roughness: .4 }));
    corps.add(boite(2.32, .2, 3.02, "#FFFFFF", 0, 1.0, -.9));
    corps.add(boite(.3, .2, 3.6, "#C9CED8", -.4, 1.75, -.7, { metalness: .5 }));          // échelle
    corps.add(boite(.3, .2, 3.6, "#C9CED8", .4, 1.75, -.7, { metalness: .5 }));
    for(let z = -2.2; z < 1; z += .6) corps.add(boite(.8, .1, .1, "#C9CED8", 0, 1.75, z));
    corps.add(boite(.5, .25, .4, "#3D7BD9", -.5, 1.92, 1.6, { emissive: "#3D7BD9", emissiveIntensity: .9 }));
    corps.add(boite(.5, .25, .4, "#E5484D", .5, 1.92, 1.6, { emissive: "#FF2020", emissiveIntensity: .9 }));
    [[-1.15, 1.6], [1.15, 1.6], [-1.15, -1.6], [1.15, -1.6]].forEach((p, i) => { const r = roue(.55, .45, p[0], .55, p[1]); g.add(r); roues.push(r); if(i < 2) avant.push(r); });
  }else{ // tracteur
    corps.add(boite(1.4, 1.0, 2.0, couleur, 0, 1.25, .9, { roughness: .5 }));           // capot
    corps.add(boite(1.7, 1.5, 1.5, couleur, 0, 1.75, -.7, { roughness: .5 }));          // cabine
    corps.add(boite(1.5, .9, 1.3, verre, 0, 2.05, -.7, { roughness: .15, metalness: .4 }));
    corps.add(boite(1.9, .14, 1.8, "#F4F4F4", 0, 2.58, -.7));
    corps.add(boite(.18, .9, .18, "#33343C", .45, 2.1, 1.4));                              // cheminée
    corps.add(boite(.3, .2, .06, "#FFF6C7", -.4, 1.3, 1.92, { emissive: "#FFF2A0", emissiveIntensity: .6 }));
    corps.add(boite(.3, .2, .06, "#FFF6C7", .4, 1.3, 1.92, { emissive: "#FFF2A0", emissiveIntensity: .6 }));
    const r1 = roue(.55, .4, -.95, .55, 1.25), r2 = roue(.55, .4, .95, .55, 1.25), r3 = roue(1.0, .6, -1.15, 1.0, -.8), r4 = roue(1.0, .6, 1.15, 1.0, -.8);
    g.add(r1, r2, r3, r4); roues.push(r1, r2, r3, r4); avant.push(r1, r2);
  }
  // ombre douce sous le véhicule (toujours, même sans ombres calculées)
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(type === "moto" ? 1.6 : 3.2, type === "pompiers" ? 6 : 5), ombreMat);
  ombre.rotation.x = -Math.PI / 2; ombre.position.y = .03; g.add(ombre);
  // flamme du turbo
  const flamme = new THREE.Mesh(new THREE.ConeGeometry(.35, 1.6, 10), new THREE.MeshBasicMaterial({ color: 0xFFA030, transparent: true, opacity: .9 }));
  flamme.rotation.x = -Math.PI / 2; flamme.position.set(0, type === "moto" ? .75 : .7, type === "pompiers" ? -2.9 : -2.6); flamme.visible = false;
  g.add(flamme);
  g.userData = { corps, roues, avant, ombre, flamme, type };
  return g;
}

/* ======================= le circuit ======================= */
let piste = null; // { P, T, Nrm, long, courbure[], objets }
const decor = new THREE.Group(); scene.add(decor);

function construireCircuit(id){
  while(decor.children.length) decor.remove(decor.children[0]);
  const C = CIRCUITS[id];
  scene.background = texCiel(C.ciel[0], C.ciel[1]);
  scene.fog = new THREE.Fog(C.brouillard, 260, 1100);
  hemi.groundColor.set(id === "neige" ? "#B8C8DD" : id === "desert" ? "#B88A50" : "#557744");
  const courbe = new THREE.CatmullRomCurve3(C.pts.map(p => new THREE.Vector3(p[0] * ECHELLE, 0, p[1] * ECHELLE)), true, "centripetal");
  const pts = courbe.getSpacedPoints(N); pts.pop();
  const P = pts, T = [], Nrm = [], dist = [0];
  for(let i = 0; i < N; i++){
    const a = P[(i - 1 + N) % N], b = P[(i + 1) % N];
    const t = new THREE.Vector3().subVectors(b, a).setY(0).normalize();
    T.push(t); Nrm.push(new THREE.Vector3(t.z, 0, -t.x)); // à gauche de la marche
    if(i) dist.push(dist[i - 1] + P[i].distanceTo(P[i - 1]));
  }
  const long = dist[N - 1] + P[0].distanceTo(P[N - 1]);
  const courbure = [];
  for(let i = 0; i < N; i++){ const a = Math.atan2(T[i].x, T[i].z), b = Math.atan2(T[(i + 25) % N].x, T[(i + 25) % N].z); courbure.push(Math.abs(angle(b - a))); }
  piste = { id, P, T, Nrm, dist, long, courbure, rampes: [], turbos: [], etoiles: [] };

  // sol
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: texSol(C.sol, C.sol2), roughness: 1 }));
  sol.material.map.repeat.set(140, 140); sol.rotation.x = -Math.PI / 2; sol.position.y = -.35; sol.receiveShadow = true; decor.add(sol); // un peu plus bas que la route : évite qu'ils se mélangent au loin

  // ruban de route et bordures
  function ruban(d1, d2, y, matiere, vScale){
    const pos = [], uv = [], idx = [];
    for(let i = 0; i <= N; i++){
      const k = i % N, p = P[k], n = Nrm[k], v = (i === N ? long : dist[k]) / vScale;
      pos.push(p.x + n.x * d1, y, p.z + n.z * d1, p.x + n.x * d2, y, p.z + n.z * d2);
      uv.push(0, v, 1, v);
      if(i < N){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, matiere); m.receiveShadow = true; decor.add(m); return m;
  }
  const W = LARGEUR / 2;
  ruban(W, -W, .05, new THREE.MeshStandardMaterial({ map: texRoute, roughness: .9, side: THREE.DoubleSide }), 14);
  ruban(W + 1.5, W, .07, new THREE.MeshStandardMaterial({ map: texBordure, roughness: .8, side: THREE.DoubleSide }), 3);
  ruban(-W, -W - 1.5, .07, new THREE.MeshStandardMaterial({ map: texBordure, roughness: .8, side: THREE.DoubleSide }), 3);

  // ligne d'arrivée et arche
  const ligne = new THREE.Mesh(new THREE.PlaneGeometry(LARGEUR, 3), new THREE.MeshStandardMaterial({ map: texDamier, roughness: .8 }));
  texDamier.repeat.set(2, 1);
  ligne.rotation.x = -Math.PI / 2; ligne.rotation.z = Math.atan2(T[0].x, T[0].z); ligne.position.copy(P[0]).setY(.09); decor.add(ligne);
  const arche = new THREE.Group();
  arche.add(boite(1.2, 9, 1.2, "#2E3580", -W - 2.5, 4.5, 0), boite(1.2, 9, 1.2, "#2E3580", W + 2.5, 4.5, 0));
  const ban = new THREE.Mesh(new THREE.BoxGeometry(LARGEUR + 6, 2.6, .6), [mat("#2E3580"), mat("#2E3580"), mat("#2E3580"), mat("#2E3580"),
    new THREE.MeshStandardMaterial({ map: texBanniere("★ SUPER COURSE ★", "#FFD23F", "#1D2357") }), new THREE.MeshStandardMaterial({ map: texBanniere("★ ARRIVÉE ★", "#FFD23F", "#1D2357") })]);
  ban.position.y = 9.4; arche.add(ban);
  arche.position.copy(P[0]); arche.rotation.y = Math.atan2(T[0].x, T[0].z); decor.add(arche);

  // tribune près du départ (à droite de la ligne)
  const iT = N - 30, tribune = new THREE.Group(), pT = P[iT], nT = Nrm[iT];
  for(let r = 0; r < 4; r++) tribune.add(boite(40, 1.2, 3, r % 2 ? "#C9CED8" : "#AEB4C2", 0, .6 + r * 1.2, r * 3));
  const foule = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, 1.3, .9), new THREE.MeshStandardMaterial({ roughness: .8 }), 4 * 30);
  const rf = hasard(11), dummy = new THREE.Object3D(), coulFoule = ["#E5484D", "#FFD23F", "#3D7BD9", "#3FA34D", "#FF8FB8", "#FFFFFF", "#FF9F1C"];
  let nf = 0;
  for(let r = 0; r < 4; r++) for(let k = 0; k < 30; k++){ dummy.position.set(-19 + k * 1.3 + rf() * .3, 1.9 + r * 1.2, r * 3); dummy.updateMatrix(); foule.setMatrixAt(nf, dummy.matrix); foule.setColorAt(nf, new THREE.Color(coulFoule[Math.floor(rf() * coulFoule.length)])); nf++; }
  tribune.add(foule);
  tribune.position.set(pT.x - nT.x * (W + 9), 0, pT.z - nT.z * (W + 9));
  tribune.rotation.y = Math.atan2(T[iT].x, T[iT].z) - Math.PI / 2;
  decor.add(tribune);
  piste.tribune = foule;

  // rampes de saut, plaques turbo, étoiles
  const r = hasard(id.length * 97 + 5);
  const droits = []; for(let i = 60; i < N - 40; i++) if(courbure[i] < .12 && courbure[(i + 20) % N] < .12) droits.push(i);
  const rampeGeo = (() => { const g = new THREE.BufferGeometry(); const L = 9, H = 1.7, w = 3.2;
    const v = [-w, 0, 0, w, 0, 0, -w, 0, L, w, 0, L, -w, H, L, w, H, L];
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setIndex([0, 2, 4, 1, 5, 3, 0, 1, 4, 1, 5, 4, 2, 3, 4, 3, 5, 4, 0, 1, 3, 0, 3, 2]); g.computeVertexNormals(); return g; })();
  let derniere = -999;
  for(const i of droits){
    if(piste.rampes.length >= 2) break;
    if(i - derniere < N / 3) continue;
    const lat = (r() - .5) * 6;
    const m = new THREE.Mesh(rampeGeo, mat("#FF9F1C", { roughness: .6 }));
    m.position.copy(P[i]).addScaledVector(Nrm[i], lat); m.rotation.y = Math.atan2(T[i].x, T[i].z); m.castShadow = m.receiveShadow = true;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 7), new THREE.MeshBasicMaterial({ map: texFleches(), transparent: true }));
    fl.rotation.x = -Math.PI / 2 + Math.atan2(1.7, 9); fl.position.set(0, .9, 4.5); m.add(fl);
    decor.add(m); piste.rampes.push({ i, lat, long: Math.ceil(9 / (long / N)) }); derniere = i;
  }
  for(let k = 0; k < 5; k++){
    const i = Math.floor((k + .5) * N / 5 + r() * 40) % N, lat = (r() - .5) * (LARGEUR - 6);
    if(piste.rampes.some(rp => Math.abs(rp.i - i) < 30)) continue;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 6), new THREE.MeshBasicMaterial({ map: texTurbo(), transparent: true }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(T[i].x, T[i].z); m.position.copy(P[i]).addScaledVector(Nrm[i], lat).setY(.1);
    decor.add(m); piste.turbos.push({ i, lat, m });
  }
  const etoileGeo = etoile3D();
  for(let k = 0; k < 14; k++){
    const i = Math.floor((k + r() * .6) * N / 14) % N, lat = (r() - .5) * (LARGEUR - 5);
    const m = new THREE.Mesh(etoileGeo, mat("#FFD23F", { emissive: "#FFB000", emissiveIntensity: .5, roughness: .3, flatShading: false }));
    m.position.copy(P[i]).addScaledVector(Nrm[i], lat).setY(1.6); m.castShadow = true;
    decor.add(m); piste.etoiles.push({ i, lat, m, cache: 0 });
  }

  construireDecor(C.deco, r);
}
function texFleches(){ return texture(128, 160, (g) => { g.fillStyle = "#FFD23F"; for(let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(64, 10 + k * 50); g.lineTo(118, 50 + k * 50); g.lineTo(96, 50 + k * 50); g.lineTo(64, 28 + k * 50); g.lineTo(32, 50 + k * 50); g.lineTo(10, 50 + k * 50); g.closePath(); g.fill(); } }); }
function texTurbo(){
  return texture(128, 170, (g) => {
    g.fillStyle = "rgba(255,90,40,.85)"; if(g.roundRect){ g.beginPath(); g.roundRect(4, 4, 120, 162, 18); g.fill(); } else g.fillRect(4, 4, 120, 162);
    g.fillStyle = "#FFE45C"; for(let k = 0; k < 3; k++){ g.beginPath(); g.moveTo(64, 14 + k * 50); g.lineTo(112, 58 + k * 50); g.lineTo(88, 58 + k * 50); g.lineTo(64, 36 + k * 50); g.lineTo(40, 58 + k * 50); g.lineTo(16, 58 + k * 50); g.closePath(); g.fill(); }
  });
}
function etoile3D(){
  const s = new THREE.Shape(); for(let k = 0; k < 10; k++){ const a = k / 10 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? .42 : 1; const x = Math.cos(a) * r, y = -Math.sin(a) * r; k ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: .35, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 1 }); g.center(); return g;
}

/* est-ce que ce point est loin de la route ? (pour poser le décor) */
function loinDeLaRoute(x, z, marge){
  for(let i = 0; i < N; i += 6){ const p = piste.P[i]; const dx = p.x - x, dz = p.z - z; if(dx * dx + dz * dz < marge * marge) return false; }
  return true;
}
function poserInstances(geo, matiere, places, castShadow){
  const im = new THREE.InstancedMesh(geo, matiere, places.length), d = new THREE.Object3D();
  places.forEach((p, k) => { d.position.set(p[0], p[1] || 0, p[2]); d.rotation.set(0, p[3] || 0, 0); d.scale.setScalar(p[4] || 1); d.updateMatrix(); im.setMatrixAt(k, d.matrix); });
  im.castShadow = !!castShadow; decor.add(im); return im;
}
function construireDecor(type, r){
  const W = LARGEUR / 2, places = [];
  // près de la route : des endroits libres de chaque côté
  for(let k = 0; k < 700 && places.length < 260; k++){
    const i = Math.floor(r() * N), cote = r() < .5 ? 1 : -1, d = W + 10 + r() * 70;
    const p = piste.P[i], n = piste.Nrm[i], x = p.x + n.x * d * cote, z = p.z + n.z * d * cote;
    if(loinDeLaRoute(x, z, W + 8)) places.push([x, 0, z, r() * 6.3, .8 + r() * .7]);
  }
  const loin = []; // montagnes / mesas tout autour
  for(let k = 0; k < 26; k++){ const a = k / 26 * Math.PI * 2 + r() * .2, d = 760 + r() * 180; loin.push([Math.cos(a) * d + 40, 0, Math.sin(a) * d + 120, r() * 6, 1 + r() * .8]); }

  if(type === "lac" || type === "neige"){
    const neige = type === "neige";
    const sapins = places.filter((p, k) => neige || k % 2 === 0), feuillus = neige ? [] : places.filter((p, k) => k % 2 === 1);
    const cone = new THREE.ConeGeometry(3, 8, 7); cone.translate(0, 6, 0);
    const cone2 = new THREE.ConeGeometry(2.2, 6, 7); cone2.translate(0, 10, 0);
    const tronc = new THREE.CylinderGeometry(.5, .6, 3, 6); tronc.translate(0, 1.5, 0);
    poserInstances(tronc, mat("#7A4B2E"), places, false);
    poserInstances(cone, mat(neige ? "#3E7D5A" : "#2F7D4A"), sapins, true);
    poserInstances(cone2, mat(neige ? "#F4F8FF" : "#3A8E55"), sapins, false);
    if(feuillus.length){ const boule = new THREE.IcosahedronGeometry(3.4, 0); boule.translate(0, 5.4, 0); poserInstances(boule, mat("#4FA84E"), feuillus, true); }
    // montagnes enneigées
    const mont = new THREE.ConeGeometry(120, 210, 7); mont.translate(0, 105, 0);
    const cap = new THREE.ConeGeometry(52, 92, 7); cap.translate(0, 164, 0);
    poserInstances(mont, mat(neige ? "#8C9BB5" : "#7F8FA8"), loin, false);
    poserInstances(cap, mat("#FFFFFF"), loin, false);
    if(!neige){
      // le lac, du côté sud du circuit, avec des petits voiliers
      const lac = new THREE.Mesh(new THREE.CircleGeometry(420, 48), new THREE.MeshStandardMaterial({ color: "#3C8FD9", roughness: .25, metalness: .2 }));
      lac.rotation.x = -Math.PI / 2; lac.position.set(60, .02, -500); lac.scale.set(1.8, 1, 1); decor.add(lac);
      for(let k = 0; k < 6; k++){
        const b = new THREE.Group(); b.add(boite(4, .8, 1.6, "#FFFFFF", 0, .4, 0));
        const voile = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 3), mat(["#E5484D", "#FFD23F", "#FFFFFF"][k % 3])); voile.position.y = 3.8; b.add(voile);
        b.position.set(-300 + k * 120 + r() * 40, 0, -260 - r() * 200); decor.add(b);
      }
    }else{
      // bonshommes de neige
      const bon = places.filter((p, k) => k % 9 === 0).slice(0, 10);
      bon.forEach(p => { const g = new THREE.Group();
        [[0, 1.4, 1.5], [0, 3.5, 1.05], [0, 5.0, .75]].forEach(b => { const s = new THREE.Mesh(new THREE.SphereGeometry(b[2], 12, 10), mat("#FFFFFF", { flatShading: false })); s.position.y = b[1]; s.castShadow = true; g.add(s); });
        const nez = new THREE.Mesh(new THREE.ConeGeometry(.15, .8, 6), mat("#FF8C1A")); nez.rotation.x = Math.PI / 2; nez.position.set(0, 5, .9); g.add(nez);
        g.add(boite(1.1, .7, 1.1, "#22232B", 0, 5.9, 0)); g.position.set(p[0] + 6, 0, p[2] + 6); decor.add(g); });
    }
  }else{ // désert
    const cact = places.filter((p, k) => k % 2 === 0), rochers = places.filter((p, k) => k % 2 === 1);
    const tige = new THREE.CylinderGeometry(.8, .9, 7, 8); tige.translate(0, 3.5, 0);
    const bras1 = new THREE.CylinderGeometry(.55, .55, 3, 8); bras1.translate(1.6, 4.2, 0);
    const bras1b = new THREE.CylinderGeometry(.55, .55, 1.8, 8); bras1b.rotateZ(Math.PI / 2); bras1b.translate(.9, 2.9, 0);
    const vert = mat("#4C9A50");
    poserInstances(tige, vert, cact, true); poserInstances(bras1, vert, cact, false); poserInstances(bras1b, vert, cact, false);
    const roc = new THREE.DodecahedronGeometry(2.6, 0); roc.translate(0, 1.2, 0);
    poserInstances(roc, mat("#B5774A"), rochers, true);
    const mesa = new THREE.CylinderGeometry(90, 120, 110, 7); mesa.translate(0, 55, 0);
    poserInstances(mesa, mat("#C46A3E"), loin, false);
  }
  // pneus empilés à l'extérieur des virages
  const pneus = [];
  for(let i = 0; i < N; i += 12){
    if(piste.courbure[i] < .35) continue;
    const a = Math.atan2(piste.T[i].x, piste.T[i].z), b = Math.atan2(piste.T[(i + 25) % N].x, piste.T[(i + 25) % N].z);
    const cote = angle(b - a) > 0 ? -1 : 1, d = W + 4, p = piste.P[i], n = piste.Nrm[i];
    const x = p.x + n.x * d * cote, z = p.z + n.z * d * cote;
    if(loinDeLaRoute(x, z, W + 2.5)) for(let h = 0; h < 3; h++) pneus.push([x, .35 + h * .7, z]);
  }
  if(pneus.length){ const tore = new THREE.TorusGeometry(.75, .35, 6, 12); tore.rotateX(Math.PI / 2); poserInstances(tore, mat("#22232B"), pneus, false); }
  // nuages
  const nuages = [];
  for(let k = 0; k < 30; k++){ const a = r() * Math.PI * 2, d = 350 + r() * 600; nuages.push([Math.cos(a) * d, 150 + r() * 90, Math.sin(a) * d, r() * 6, 1 + r() * 1.5]); }
  if(type !== "desert"){ const nu = new THREE.IcosahedronGeometry(14, 1); nu.scale(2.2, .8, 1.4); poserInstances(nu, new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: .92, fog: false }), nuages, false); }
}

/* ======================= course ======================= */
let coureurs = [], joueur = null, course = null, etat = "chargement";
const touches = {};
let turboDemande = false; // un appui même très court sur Espace / 🔥 / ○ compte
let tactile = { g: false, d: false, t: false, f: false };

function idxProche(c){
  // cherche la portion de route la plus proche autour de la dernière connue
  let best = c.idx, bd = Infinity;
  for(let k = -40; k <= 40; k++){
    const i = (c.idx + k + N) % N, p = piste.P[i];
    const d = (p.x - c.x) ** 2 + (p.z - c.z) ** 2;
    if(d < bd){ bd = d; best = i; }
  }
  return best;
}
function creerCoureur(nom, type, couleur, estJoueur, place){
  const v = VEHICULES[type], mesh = creerVehicule(type, couleur);
  scene.add(mesh);
  // grille de départ : 2 colonnes, derrière la ligne
  const ligneD = Math.floor(place / 2), col = place % 2 ? -1 : 1;
  const i0 = (N - 6 - ligneD * 5 + N) % N, p = piste.P[i0], n = piste.Nrm[i0];
  return { nom, type, couleur, v, mesh, joueur: estJoueur,
    x: p.x + n.x * col * 3.6, z: p.z + n.z * col * 3.6, y: 0, vy: 0, h: Math.atan2(piste.T[i0].x, piste.T[i0].z),
    vitesse: 0, idx: i0, tour: 0, prog: 0, fini: false, temps: 0, boost: 0, turbo: 0, enAir: false,
    decal: (Math.random() - .5) * 8, decalCible: 0, skill: 1, braquage: 0, passeMoitie: false, roue: 0, rot: 0 };
}

function demarrerCourse(){
  const niv = NIVEAUX[choix.niveau];
  construireCircuit(choix.circuit);
  coureurs.forEach(c => scene.remove(c.mesh));
  coureurs = [];
  const advs = ADVERSAIRES.slice();
  const pil = PILOTES.find(p => p.id === choix.pilote) || PILOTES[2];
  // le joueur part en milieu de grille
  const placeJoueur = choix.niveau === "facile" ? 2 : 4;
  let a = 0;
  for(let place = 0; place < 6; place++){
    if(place === placeJoueur){ joueur = creerCoureur(pil.nom, choix.vehicule, choix.couleur, true, place); coureurs.push(joueur); }
    else{ const ad = advs[a++]; const c = creerCoureur(ad.nom, ad.v, ad.couleur, false, place); c.skill = niv.ia * (.94 + Math.random() * .1); coureurs.push(c); }
  }
  course = { t: -4.2, tours: TEST && PARAMS.get("tours") ? +PARAMS.get("tours") : niv.tours, niv, fin: false, annonce: "", dernierTour: false, tFin: 0, intro: 2.2 };
  etat = "course";
  $("menu").hidden = true; $("hud").hidden = false; $("ecranFin").hidden = true;
  $("tactile").hidden = !("ontouchstart" in window);
  document.body.classList.toggle("tactile", "ontouchstart" in window);
  sons.demarrer();
  annoncer("", 0);
  fpsMesure = { n: 0, t: 0, fait: qualite !== "haute" && lire("course-qualite-fixe", "") };
}

/* ---------- commandes ---------- */
window.addEventListener("keydown", (e) => {
  touches[e.key.toLowerCase()] = true;
  if(e.key === " " || e.key === "Shift") turboDemande = true;
  if([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if(etat === "course" && (e.key === "Escape" || e.key.toLowerCase() === "p")) basculerPause();
  else if(etat === "pause" && (e.key === "Escape" || e.key.toLowerCase() === "p")) basculerPause();
  else if(etat === "menu" && e.key === "Enter") $("go").click();
  else if(etat === "fin" && e.key === "Enter") $("rejouer").click();
});
window.addEventListener("keyup", (e) => { touches[e.key.toLowerCase()] = false; });
[["tg", "g"], ["td", "d"], ["tt", "t"], ["tf", "f"]].forEach(([id, k]) => {
  const b = $(id);
  const on = (e) => { e.preventDefault(); tactile[k] = true; if(k === "t") turboDemande = true; b.classList.add("on"); sons.reveil(); };
  const off = (e) => { e.preventDefault(); tactile[k] = false; b.classList.remove("on"); };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off);
});
let manetteAvant = {};
/* Manette : on lit toutes les manettes branchées et on garde les vraies.
   Sous Linux, une manette PS4 apparaît en 3 morceaux (manette, capteurs de mouvement, pavé tactile) :
   on ignore les deux derniers. Firefox ne range pas toujours les boutons dans l'ordre « standard » :
   on accepte donc plusieurs façons d'accélérer (R2, ✕, joystick vers le haut, flèche haut). */
const gachettesVues = {};
function vraiesManettes(){
  return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(g => g && g.connected && g.buttons.length >= 6 && !/motion|touchpad|accel|gyro|sensor/i.test(g.id));
}
function lireManette(){
  const pads = vraiesManettes();
  if(!pads.length) return null;
  const m = { dir: 0, gaz: 0, frein: 0, turbo: false, start: false, croix: false, nom: pads[0].id };
  pads.forEach(gp => {
    const std = gp.mapping === "standard";
    const b = (i) => gp.buttons[i] ? (gp.buttons[i].value || (gp.buttons[i].pressed ? 1 : 0)) : 0;
    const ax = (i) => gp.axes[i] || 0;
    // gâchettes analogiques (manette non « standard ») : au repos à -1 ; on ne s'y fie qu'une fois vues au repos
    const gach = (i) => { const v = ax(i); const k = gp.index + ":" + i; if(v < -.9) gachettesVues[k] = true; return gachettesVues[k] ? clamp((v + 1) / 2, 0, 1) : 0; };
    let dir = ax(0); if(Math.abs(dir) < .18) dir = 0;
    let gaz = Math.max(b(7), b(0), ax(1) < -.55 ? 1 : 0), frein = Math.max(b(6), ax(1) > .7 ? 1 : 0);
    if(std){ if(b(14)) dir = -1; if(b(15)) dir = 1; if(b(12)) gaz = 1; if(b(13)) frein = 1; }
    else{
      if(gp.axes.length > 6){ if(Math.abs(ax(6)) > .5) dir = Math.sign(ax(6)); if(ax(7) < -.5) gaz = 1; if(ax(7) > .5) frein = 1; }
      if(gp.axes.length > 5){ gaz = Math.max(gaz, gach(5) > .3 ? gach(5) : 0); frein = Math.max(frein, gach(2) > .3 ? 1 : 0); }
    }
    if(Math.abs(dir) > Math.abs(m.dir)) m.dir = -dir;
    m.gaz = Math.max(m.gaz, gaz); m.frein = Math.max(m.frein, frein);
    m.turbo = m.turbo || b(1) > .5 || b(2) > .5 || b(3) > .5 || b(5) > .5;
    m.start = m.start || b(9) > .5;
    m.croix = m.croix || b(0) > .5 || b(1) > .5;
  });
  // appuis « nouveaux » (pour les menus)
  const nouv = (k) => m[k] && !manetteAvant[k];
  m.nStart = nouv("start"); m.nCroix = nouv("croix");
  manetteAvant = { start: m.start, croix: m.croix };
  return m;
}
// petite fenêtre de diagnostic : course3d/?manette
let diagManette = null;
function majDiagManette(){
  if(!diagManette){ diagManette = document.createElement("pre"); diagManette.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:50;margin:0;padding:10px;max-width:96vw;white-space:pre-wrap;background:rgba(0,0,0,.85);color:#9f9;font:14px monospace;border-radius:10px;pointer-events:none"; document.body.appendChild(diagManette); }
  const tous = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean);
  let t = "Manettes vues par le navigateur : " + tous.length + (tous.length ? "" : "\n→ Appuie sur un bouton de la manette.");
  tous.forEach(g => { t += "\n\n#" + g.index + " " + g.id + "\n   rangement : " + (g.mapping || "non standard") + (vraiesManettes().includes(g) ? "  (utilisée)" : "  (ignorée)") +
    "\n   boutons appuyés : " + (g.buttons.map((x, i) => (x.pressed || x.value > .1) ? i : null).filter(x => x !== null).join(", ") || "aucun") +
    "\n   axes : " + Array.from(g.axes).map(a => a.toFixed(2)).join("  "); });
  const m = lireManette();
  if(m) t += "\n\nLe jeu comprend : tourner " + m.dir.toFixed(2) + "  accélérer " + m.gaz.toFixed(2) + "  freiner " + m.frein.toFixed(2) + "  turbo " + (m.turbo ? "oui" : "non");
  diagManette.textContent = t;
}
function commandesJoueur(c){
  const niv = course.niv, gp = lireManette();
  let dir = 0, gaz = 0, frein = 0, turbo = false;
  if(touches["arrowleft"] || touches["q"] || touches["a"] || tactile.g) dir += 1;
  if(touches["arrowright"] || touches["d"] || tactile.d) dir -= 1;
  if(touches["arrowup"] || touches["w"] || touches["z"]) gaz = 1;
  if(touches["arrowdown"] || touches["s"] || tactile.f) frein = 1;
  if(touches[" "] || touches["shift"] || tactile.t || turboDemande) turbo = true;
  turboDemande = false;
  if(gp){ if(gp.dir) dir = gp.dir; gaz = Math.max(gaz, gp.gaz); frein = Math.max(frein, gp.frein); turbo = turbo || gp.turbo; if(gp.nStart) basculerPause(); }
  if(niv.auto || tactile.g || tactile.d || ("ontouchstart" in window && !gp)) gaz = Math.max(gaz, frein ? 0 : 1);
  if(AUTO){ const ia = commandesIA(c); return ia; }
  // aide au pilotage (facile) : ramène doucement vers la route
  if(niv.aide){
    const ia = commandesIA(c, true);
    dir = clamp(dir + ia.dir * (dir ? .35 : .8), -1, 1);
  }
  return { dir, gaz, frein, turbo };
}
function commandesIA(c, pourAide){
  const look = clamp(Math.round(10 + c.vitesse * .45), 10, 32), i = (c.idx + look) % N;
  if(!pourAide){ c.decalCible += (Math.random() - .5) * .3; c.decalCible = clamp(c.decalCible, -4.5, 4.5); c.decal = lerp(c.decal, c.decalCible, .01); }
  const off = pourAide ? 0 : c.decal;
  const cx = piste.P[i].x + piste.Nrm[i].x * off, cz = piste.P[i].z + piste.Nrm[i].z * off;
  const voulu = Math.atan2(cx - c.x, cz - c.z), diff = angle(voulu - c.h);
  const dir = clamp(diff * 2.6, -1, 1);
  // ralentir avant les virages serrés
  const k = Math.max(piste.courbure[c.idx], piste.courbure[(c.idx + 15) % N]);
  const vSure = c.v.vmax * clamp(1.12 - k * .7, .62, 1);
  let cible = vSure * (c.joueur ? 1 : c.skill);
  if(!c.joueur && joueur){
    // élastique : les adversaires attendent un peu si le joueur est loin derrière, et l'inverse
    const ecart = (c.prog - joueur.prog) / N;
    cible *= clamp(1 - ecart * (course.niv.auto ? 1.2 : .5), .82, course.niv.auto ? 1.3 : 1.1);
  }
  const gaz = c.vitesse < cible ? 1 : 0, frein = c.vitesse > cible + 4 ? 1 : 0;
  const turbo = !c.joueur && c.turbo >= 1 && Math.random() < .01;
  return { dir, gaz, frein, turbo };
}

/* ---------- physique (simple et amusante) ---------- */
function avancer(c, cmd, dt){
  const v = c.v, niv = course.niv;
  const W = LARGEUR / 2;
  const i = c.idx, p = piste.P[i], n = piste.Nrm[i];
  const lat = (c.x - p.x) * n.x + (c.z - p.z) * n.z;
  const herbe = Math.abs(lat) > W + 1.5 && !c.enAir;
  let vmax = v.vmax * (herbe ? v.herbe : 1);
  if(c.boost > 0){ vmax *= 1.4; c.boost -= dt; }
  // gaz / frein
  if(cmd.gaz > 0 && c.vitesse < vmax) c.vitesse += v.acc * cmd.gaz * dt * (c.boost > 0 ? 2 : 1);
  else if(c.vitesse > vmax) c.vitesse = Math.max(vmax, c.vitesse - (herbe ? 40 : 18) * dt);
  if(cmd.frein) c.vitesse -= (c.vitesse > 0 ? 32 : 10) * dt;
  if(!cmd.gaz && !cmd.frein) c.vitesse -= 6 * dt * Math.sign(c.vitesse);
  c.vitesse = clamp(c.vitesse, -10, v.vmax * 1.6);
  // direction : on tourne moins vite à grande vitesse, et pas du tout à l'arrêt
  c.braquage = lerp(c.braquage, cmd.dir, clamp(dt * 8, 0, 1));
  const fact = clamp(Math.abs(c.vitesse) / 9, 0, 1) * (1 - .32 * clamp(c.vitesse / v.vmax, 0, 1));
  c.h += c.braquage * v.virage * fact * dt * (c.enAir ? .3 : 1) * Math.sign(c.vitesse || 1);
  // turbo
  if(cmd.turbo && c.turbo >= 1){ c.turbo = 0; c.boost = 2.2; if(c.joueur){ sons.turbo(); voix("Turbo !"); } }
  if(!c.enAir) c.turbo = Math.min(1, c.turbo + dt / 22);
  // déplacement
  c.x += Math.sin(c.h) * c.vitesse * dt; c.z += Math.cos(c.h) * c.vitesse * dt;
  // sauts
  if(c.enAir){ c.vy -= 28 * dt; c.y += c.vy * dt; if(c.y <= 0){ c.y = 0; c.enAir = false; c.vy = 0; if(c.joueur) sons.atterrir(); } }
  // murs invisibles : on ne sort pas trop loin
  c.idx = idxProche(c);
  const j = c.idx, pj = piste.P[j], nj = piste.Nrm[j];
  const lat2 = (c.x - pj.x) * nj.x + (c.z - pj.z) * nj.z, lim = W + 1.5 + niv.mur;
  if(Math.abs(lat2) > lim){
    const d = Math.abs(lat2) - lim; c.x -= nj.x * Math.sign(lat2) * d; c.z -= nj.z * Math.sign(lat2) * d;
    const hRoute = Math.atan2(piste.T[j].x, piste.T[j].z); c.h = lerp(c.h, c.h + angle(hRoute - c.h), .2); c.vitesse *= .97;
  }
  // rampes, plaques turbo, étoiles
  for(const r of piste.rampes){
    const di = (c.idx - r.i + N) % N;
    if(!c.enAir && di >= 0 && di <= r.long && Math.abs(lat2 - r.lat) < 3.2 && c.vitesse > 12){
      if(di >= r.long - 1){ c.enAir = true; c.vy = 6 + c.vitesse * .2; c.y = 1.7; if(c.joueur){ sons.saut(); } }
      else c.y = 1.7 * di / r.long;
    }
  }
  if(!c.enAir && c.y > 0 && !piste.rampes.some(r => { const di = (c.idx - r.i + N) % N; return di <= r.long && Math.abs(lat2 - r.lat) < 3.2; })) c.y = Math.max(0, c.y - dt * 6);
  for(const t of piste.turbos){
    const di = Math.abs(((c.idx - t.i + N + N / 2) % N) - N / 2);
    if(di < 4 && Math.abs(lat2 - t.lat) < 2.6 && c.boost < 1.2 && !c.enAir){ c.boost = 1.5; if(c.joueur) sons.turbo(); }
  }
  if(c.joueur) for(const e of piste.etoiles){
    if(e.cache > 0) continue;
    const di = Math.abs(((c.idx - e.i + N + N / 2) % N) - N / 2);
    if(di < 4 && Math.abs(lat2 - e.lat) < 2.4){ e.cache = 9; e.m.visible = false; c.turbo = Math.min(1, c.turbo + .34); sons.etoile(); }
  }
  // tours
  const avant = c.prog;
  if(c.idx > N * .45 && c.idx < N * .55) c.passeMoitie = true;
  if(c.passeMoitie && c.idxAvant > N * .85 && c.idx < N * .15){ c.tour++; c.passeMoitie = false; quandTour(c); }
  c.idxAvant = c.idx;
  c.prog = c.tour * N + c.idx;
  void avant;
}
function quandTour(c){
  if(c.tour >= course.tours && !c.fini){ c.fini = true; c.temps = course.t; if(c.joueur) finCourse(); }
  else if(c.joueur && c.tour === course.tours - 1){ annoncer("Dernier tour !", 1.6); voix("Dernier tour !"); sons.cloche(); }
}
function collisions(){
  for(let a = 0; a < coureurs.length; a++) for(let b = a + 1; b < coureurs.length; b++){
    const A = coureurs[a], B = coureurs[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
    if(d < 2.6 && d > .01 && Math.abs(A.y - B.y) < 1.5){
      const push = (2.6 - d) / 2, nx = dx / d, nz = dz / d;
      A.x -= nx * push; A.z -= nz * push; B.x += nx * push; B.z += nz * push;
      const m = (A.vitesse + B.vitesse) / 2; A.vitesse = lerp(A.vitesse, m, .3); B.vitesse = lerp(B.vitesse, m, .3);
      if(A.joueur || B.joueur) sons.choc();
    }
  }
}
function placer(c, dt){
  const g = c.mesh, u = g.userData;
  g.position.set(c.x, c.y, c.z); g.rotation.y = c.h;
  // inclinaison : la moto se penche dans les virages, les voitures roulent un peu
  const pench = -c.braquage * clamp(c.vitesse / c.v.vmax, 0, 1) * (c.type === "moto" ? .45 : .06);
  u.corps.rotation.z = lerp(u.corps.rotation.z, pench, clamp(dt * 6, 0, 1));
  u.corps.rotation.x = c.enAir ? lerp(u.corps.rotation.x, -clamp(c.vy * .03, -.4, .4), .2) : lerp(u.corps.rotation.x, 0, .2);
  c.roue += c.vitesse * dt / .5;
  u.roues.forEach(r => { r.children.forEach(m => { m.rotation.x = c.roue; }); });
  u.avant.forEach(r => { r.rotation.y = c.braquage * .45; });
  u.flamme.visible = c.boost > 0; if(c.boost > 0) u.flamme.scale.setScalar(.8 + Math.random() * .5);
  u.ombre.position.y = .03 - c.y; u.ombre.material.opacity = .28;
}

/* ---------- caméra ---------- */
const camPos = new THREE.Vector3(), camVise = new THREE.Vector3();
let camH = 0, camY = 0;
function camera_(dt, force){
  const c = joueur; if(!c) return;
  // la caméra suit le véhicule sans retard ; seuls ses virages et ses sauts sont adoucis
  if(force) { camH = c.h; camY = c.y; }
  camH += angle(c.h - camH) * clamp(dt * 6, 0, 1); camY = lerp(camY, c.y, clamp(dt * 4, 0, 1));
  const f = new THREE.Vector3(Math.sin(camH), 0, Math.cos(camH));
  const CAM = { voiture:[8.5, 3.6], moto:[6.2, 3.0], pompiers:[12.5, 6.2], tracteur:[10.5, 5.6] }[c.type];
  const voulu = new THREE.Vector3(c.x, camY, c.z).addScaledVector(f, -CAM[0]).add(new THREE.Vector3(0, CAM[1], 0));
  const vise = new THREE.Vector3(c.x, camY + 1.1, c.z).addScaledVector(f, 10);
  camPos.copy(voulu); camVise.copy(vise);
  camera.position.copy(camPos); camera.lookAt(camVise);
  camera.fov = lerp(camera.fov, 60 + clamp(c.vitesse / c.v.vmax, 0, 1.4) * 12 + (c.boost > 0 ? 6 : 0), clamp(dt * 3, 0, 1));
  camera.updateProjectionMatrix();
  soleil.position.set(c.x + 40, 90, c.z + 30); soleil.target.position.set(c.x, 0, c.z);
}

/* ---------- interface pendant la course ---------- */
let annonceT = 0;
function annoncer(txt, duree){ const a = $("annonce"); a.textContent = txt; a.classList.toggle("on", !!txt); annonceT = duree || 0; }
function ordinal(n){ return n === 1 ? "er" : "e"; }
function classement(){
  return coureurs.slice().sort((a, b) => {
    if(a.fini && b.fini) return a.temps - b.temps;
    if(a.fini) return -1; if(b.fini) return 1;
    return b.prog - a.prog;
  });
}
const carte = $("carte"), cg = carte.getContext("2d");
let carteBase = null;
function dessinerCarte(){
  const xs = piste.P.map(p => p.x), zs = piste.P.map(p => p.z);
  const minx = Math.min(...xs), maxx = Math.max(...xs), minz = Math.min(...zs), maxz = Math.max(...zs);
  const s = 250 / Math.max(maxx - minx, maxz - minz), ox = 150 - (minx + maxx) / 2 * s, oz = 150 + (minz + maxz) / 2 * s;
  carteBase = { s, ox, oz };
}
function point(x, z){ return [carteBase.ox + x * carteBase.s, carteBase.oz - z * carteBase.s]; }
function majCarte(){
  if(!carteBase) dessinerCarte();
  cg.clearRect(0, 0, 300, 300);
  cg.lineJoin = "round"; cg.lineWidth = 16; cg.strokeStyle = "rgba(255,255,255,.85)"; cg.beginPath();
  piste.P.forEach((p, i) => { const q = point(p.x, p.z); i ? cg.lineTo(q[0], q[1]) : cg.moveTo(q[0], q[1]); }); cg.closePath(); cg.stroke();
  cg.lineWidth = 8; cg.strokeStyle = "#4A4E5E"; cg.stroke();
  const d = point(piste.P[0].x, piste.P[0].z); cg.fillStyle = "#fff"; cg.fillRect(d[0] - 7, d[1] - 7, 14, 14);
  coureurs.forEach(c => { if(c === joueur) return; const q = point(c.x, c.z); cg.fillStyle = c.couleur; cg.beginPath(); cg.arc(q[0], q[1], 9, 0, 7); cg.fill(); cg.lineWidth = 3; cg.strokeStyle = "#1D2357"; cg.stroke(); });
  const q = point(joueur.x, joueur.z); cg.fillStyle = "#FFD23F"; cg.beginPath(); cg.arc(q[0], q[1], 13, 0, 7); cg.fill(); cg.lineWidth = 4; cg.strokeStyle = "#fff"; cg.stroke();
}
function temps(t){ t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1); }
let hudT = 0;
function majHud(dt){
  hudT += dt; if(hudT < .1) return; hudT = 0;
  const cl = classement(), rang = cl.indexOf(joueur) + 1;
  $("pos").innerHTML = rang + "<small>" + ordinal(rang) + " / " + coureurs.length + "</small>";
  $("tour").textContent = "Tour " + Math.min(course.tours, joueur.tour + 1) + " / " + course.tours;
  $("chrono").textContent = temps(course.t);
  $("vitesse").querySelector("b").textContent = Math.round(Math.abs(joueur.vitesse) * 4.2);
  $("turbo").querySelector("i").style.width = Math.round(joueur.turbo * 100) + "%";
  $("turbo").classList.toggle("plein", joueur.turbo >= 1);
  $("turboTxt").textContent = joueur.turbo >= 1 ? ("🔥 Turbo prêt ! " + ("ontouchstart" in window ? "Touche 🔥" : "Espace")) : "🔥 Turbo";
  majCarte();
}

/* ---------- fin de course ---------- */
function finCourse(){
  course.fin = true; course.tFin = 0;
  const cl = classement(), rang = cl.indexOf(joueur) + 1;
  annoncer(rang === 1 ? "Victoire !" : "Arrivée !", 2.5);
  sons.cloche();
  voix(rang === 1 ? "Bravo ! Tu as gagné !" : rang <= 3 ? "Bien joué ! Tu es sur le podium !" : "Course terminée ! Bravo !");
  const cle = "course-record-" + choix.circuit + "-" + choix.pilote + "-" + choix.niveau;
  const rec = parseFloat(lire(cle, "0")) || 0, nouveau = !rec || joueur.temps < rec;
  if(nouveau) ecrire(cle, String(joueur.temps));
  setTimeout(() => {
    if(etat !== "course") return;
    etat = "fin";
    // les adversaires pas encore arrivés : temps estimé
    coureurs.forEach(c => { if(!c.fini){ const fait = Math.max(1, c.prog) / N * piste.long, reste = (course.tours * N - c.prog) / N * piste.long;
      c.temps = course.t + reste / Math.max(15, fait / Math.max(1, course.t)); c.fini = true; } });
    const cl2 = classement(), r2 = cl2.indexOf(joueur) + 1;
    $("finEmoji").textContent = ["🏆", "🥈", "🥉"][r2 - 1] || "🏁";
    $("finTitre").textContent = r2 === 1 ? "Victoire !" : r2 <= 3 ? "Sur le podium !" : "Bravo, course finie !";
    $("finTexte").textContent = "Ton temps : " + temps(joueur.temps) + (nouveau ? " — nouveau record ! ⭐" : " (record : " + temps(rec) + ")");
    const ol = $("podium"); ol.innerHTML = "";
    cl2.forEach((c, k) => { const li = document.createElement("li"); if(c === joueur) li.className = "moi";
      li.innerHTML = "<span>" + (k + 1) + ". " + VEHICULES[c.type].e + " </span><span>" + temps(c.temps) + "</span>";
      li.firstChild.appendChild(document.createTextNode(c.nom)); ol.appendChild(li); });
    $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = false;
    sons.arreter();
  }, 3200);
}

/* ---------- pause ---------- */
function basculerPause(){
  if(etat === "course"){ etat = "pause"; $("ecranPause").hidden = false; sons.arreter(); }
  else if(etat === "pause"){ etat = "course"; $("ecranPause").hidden = true; sons.demarrer(); }
}
$("pause").onclick = basculerPause;
$("reprendre").onclick = basculerPause;
$("abandon").onclick = () => { $("ecranPause").hidden = true; allerMenu(); };
$("rejouer").onclick = () => { sons.reveil(); demarrerCourse(); };
$("versMenu").onclick = () => allerMenu();
document.addEventListener("visibilitychange", () => { if(document.hidden && etat === "course") basculerPause(); });

/* ======================= sons ======================= */
const sons = (() => {
  let ctx = null, moteur = null, gainM = null, filtre = null, osc2 = null;
  function reveil(){
    if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return; } }
    if(ctx.state === "suspended") ctx.resume();
  }
  function bip(f, d, type, vol, glisse){
    if(!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + d);
    g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + .02);
  }
  function bruit(d, vol, fr){
    if(!ctx) return; const t = ctx.currentTime, b = ctx.createBuffer(1, ctx.sampleRate * d, ctx.sampleRate), x = b.getChannelData(0);
    for(let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "bandpass"; f.frequency.value = fr || 900;
    g.gain.value = vol || .2; s.buffer = b; s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t);
  }
  return {
    reveil,
    demarrer(){
      reveil(); if(!ctx || moteur) return;
      moteur = ctx.createOscillator(); osc2 = ctx.createOscillator(); filtre = ctx.createBiquadFilter(); gainM = ctx.createGain();
      moteur.type = "sawtooth"; osc2.type = "square"; filtre.type = "lowpass"; filtre.frequency.value = 600; gainM.gain.value = 0;
      moteur.connect(filtre); osc2.connect(filtre); filtre.connect(gainM); gainM.connect(ctx.destination); moteur.start(); osc2.start();
    },
    arreter(){ if(moteur){ try{ moteur.stop(); osc2.stop(); }catch(e){} moteur = null; } },
    moteur(v, vmax, boost){
      if(!moteur) return; const r = clamp(Math.abs(v) / vmax, 0, 1.5), t = ctx.currentTime;
      moteur.frequency.setTargetAtTime(48 + r * 110 + (boost ? 25 : 0), t, .05); osc2.frequency.setTargetAtTime(24 + r * 55, t, .05);
      filtre.frequency.setTargetAtTime(380 + r * 1300, t, .1); gainM.gain.setTargetAtTime(.035 + r * .03, t, .1);
    },
    compte(){ bip(440, .25, "square", .08); }, partez(){ bip(880, .6, "square", .1); },
    turbo(){ bruit(.6, .25, 1200); bip(300, .5, "sawtooth", .05, 900); },
    etoile(){ [988, 1319].forEach((f, i) => setTimeout(() => bip(f, .15, "triangle", .08), i * 70)); },
    saut(){ bip(300, .35, "triangle", .07, 700); }, atterrir(){ bruit(.2, .25, 300); },
    choc(){ bruit(.15, .18, 500); }, cloche(){ [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => bip(f, .25, "triangle", .09), i * 110)); }
  };
})();
/* voix enregistrées (dossier sons/) ; rien ne casse si un fichier manque */
const lecteurVoix = new Audio();
function slug(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function voix(t){ try{ lecteurVoix.muted = false; lecteurVoix.src = "sons/" + slug(t) + ".mp3"; const p = lecteurVoix.play(); if(p && p.catch) p.catch(() => {}); }catch(e){} }

/* ======================= menu et garage ======================= */
let vitrine = null;
function majVitrine(){
  if(vitrine) scene.remove(vitrine);
  vitrine = creerVehicule(choix.vehicule, choix.couleur);
  scene.add(vitrine);
}
function allerMenu(){
  etat = "menu"; sons.arreter();
  coureurs.forEach(c => scene.remove(c.mesh)); coureurs = []; joueur = null;
  construireCircuit(choix.circuit);
  majVitrine();
  $("menu").hidden = false; $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = true; $("ecranPause").hidden = true;
  remplirMenu();
}
function boutons(id, liste, cle, rendu, apres){
  const box = $(id); box.innerHTML = "";
  liste.forEach(([val, obj]) => {
    const b = document.createElement("button"); b.innerHTML = rendu(obj, val); if(choix[cle] === val) b.className = "on";
    b.onclick = () => { sons.reveil(); choix[cle] = val; ecrire("course-" + cle + (cle === "niveau" ? "-" + choix.pilote : ""), val); if(apres) apres(); remplirMenu(); };
    box.appendChild(b);
  });
}
function remplirMenu(){
  boutons("cPilote", PILOTES.map(p => [p.id, p]), "pilote", (p) => '<span class="e">' + p.e + "</span>" + p.nom,
    () => { choix.niveau = lire("course-niveau-" + choix.pilote, (PILOTES.find(p => p.id === choix.pilote) || PILOTES[0]).niveau); });
  boutons("cNiveau", Object.entries(NIVEAUX), "niveau", (n) => '<span class="e">' + n.e + "</span><span>" + n.nom + "<small>" + n.desc + "</small></span>");
  boutons("cVehicule", Object.entries(VEHICULES), "vehicule", (v) => '<span class="e">' + v.e + "</span>" + v.nom, majVitrine);
  const box = $("cCouleur"); box.innerHTML = "";
  COULEURS.forEach(c => { const b = document.createElement("button"); b.style.background = c; b.setAttribute("aria-label", "Couleur"); if(c === choix.couleur) b.className = "on";
    b.onclick = () => { choix.couleur = c; ecrire("course-couleur", c); majVitrine(); remplirMenu(); }; box.appendChild(b); });
  boutons("cCircuit", Object.entries(CIRCUITS), "circuit", (c) => '<span class="e">' + c.e + "</span>" + c.nom, () => { construireCircuit(choix.circuit); majVitrine(); });
  const rec = parseFloat(lire("course-record-" + choix.circuit + "-" + choix.pilote + "-" + choix.niveau, "0"));
  $("record").textContent = rec ? "⭐ Ton record ici : " + temps(rec) : "";
  const tactileOk = "ontouchstart" in window;
  $("aide").innerHTML = tactileOk ? "<b>◀ ▶</b> pour tourner, <b>🔥</b> pour le turbo, <b>🛑</b> pour freiner." :
    "<b>Flèches</b> pour conduire (↑ accélérer, ← → tourner, ↓ freiner), <b>Espace</b> pour le turbo, <b>Échap</b> pour la pause.<br>🎮 <b>Manette</b> : joystick pour tourner, <b>R2</b> ou <b>✕</b> pour accélérer, <b>L2</b> freiner, <b>○</b> turbo.<br>Ramasse les ⭐ pour remplir le turbo, passe sur les flèches orange pour aller plus vite !";
}
$("go").onclick = () => {
  sons.reveil();
  // débloquer le lecteur de voix pendant le clic (les tablettes l'exigent), sans rien faire entendre
  try{ lecteurVoix.muted = true; lecteurVoix.src = "sons/un.mp3"; const p = lecteurVoix.play(); if(p && p.then) p.then(() => { lecteurVoix.pause(); lecteurVoix.muted = false; }).catch(() => { lecteurVoix.muted = false; }); else lecteurVoix.muted = false; }catch(e){}
  demarrerCourse();
};

/* ======================= boucle ======================= */
let fpsMesure = { n: 0, t: 0, fait: true };
let tAvant = performance.now(), angleVitrine = 0;
function boucle(maintenant){
  requestAnimationFrame(boucle);
  let dt = Math.min(.05, (maintenant - tAvant) / 1000); tAvant = maintenant;
  if(TEST && window.__dtFixe) dt = window.__dtFixe;
  if(etat === "menu" || etat === "fin" || etat === "pause"){
    // manette : ✕ pour lancer / rejouer, Options pour reprendre
    const gp = lireManette();
    if(gp && gp.nCroix){ if(etat === "menu") $("go").click(); else if(etat === "fin") $("rejouer").click(); }
    if(gp && gp.nStart && etat === "pause") basculerPause();
  }
  if(PARAMS.has("manette")) majDiagManette();
  if(etat === "menu"){
    const nb = vraiesManettes().length, el = $("etatManette");
    if(el) el.textContent = nb ? "🎮 Manette connectée ! Appuie sur ✕ pour lancer la course." : "🎮 Manette branchée ? Appuie sur un de ses boutons pour la réveiller.";
    angleVitrine += dt * .5;
    const p = piste.P[0], n = piste.Nrm[0], t = piste.T[0];
    const base = new THREE.Vector3(p.x, 0, p.z).addScaledVector(t, 14);
    vitrine.position.copy(base); vitrine.rotation.y = angleVitrine;
    const large = window.innerWidth > 700;
    camera.position.set(base.x + Math.sin(.6) * 9 - (large ? n.x * 3 : 0), 3.6, base.z + Math.cos(.6) * 9 - (large ? n.z * 3 : 0));
    camera.lookAt(base.x - (large ? n.x * 3.2 : 0), 1.2, base.z - (large ? n.z * 3.2 : 0));
    camera.fov = 50; camera.updateProjectionMatrix();
    soleil.position.set(base.x + 40, 90, base.z + 30); soleil.target.position.copy(base);
  }else if(etat === "course" && course){
    course.t += dt;
    // compte à rebours
    const avantT = course.t - dt;
    [[-3, "3", "Trois"], [-2, "2", "Deux"], [-1, "1", "Un"], [0, "Partez !", "Partez !"]].forEach(([s, txt, v]) => {
      if(avantT < s && course.t >= s){ annoncer(txt, s === 0 ? 1.2 : .9); if(s === 0) sons.partez(); else sons.compte(); voix(v); }
    });
    if(annonceT > 0){ annonceT -= dt; if(annonceT <= 0) annoncer("", 0); }
    if(course.t >= 0){
      for(const c of coureurs){
        const cmd = c.joueur ? (course.fin ? { dir: commandesIA(c).dir, gaz: 0, frein: 0, turbo: false } : commandesJoueur(c)) : commandesIA(c);
        avancer(c, cmd, dt);
      }
      collisions();
    }
    coureurs.forEach(c => placer(c, dt));
    piste.etoiles.forEach(e => { e.m.rotation.y += dt * 2.5; if(e.cache > 0){ e.cache -= dt; if(e.cache <= 0) e.m.visible = true; } });
    if(piste.tribune && Math.floor(course.t * 6) % 2 === 0) piste.tribune.position.y = Math.random() * .15;
    // petit tour de caméra avant le départ
    if(course.t < -1.8){
      const k = (course.t + 4.2) / 2.4, c = joueur, f = new THREE.Vector3(Math.sin(c.h), 0, Math.cos(c.h));
      const a = lerp(2.6, 0, k), cx = c.x + Math.sin(c.h + Math.PI + a) * lerp(26, 10, k), cz = c.z + Math.cos(c.h + Math.PI + a) * lerp(26, 10, k);
      camPos.set(cx, lerp(14, 4.4, k), cz); camVise.set(c.x, 1.5, c.z).addScaledVector(f, lerp(0, 6, k));
      camera.position.copy(camPos); camera.lookAt(camVise);
      soleil.position.set(c.x + 40, 90, c.z + 30); soleil.target.position.set(c.x, 0, c.z);
    }else camera_(dt, !course.camOk && (course.camOk = true));
    sons.moteur(joueur.vitesse, joueur.v.vmax, joueur.boost > 0);
    majHud(dt);
    // qualité automatique : si l'ordinateur rame pendant la course, on baisse
    if(!fpsMesure.fait && course.t > 1){
      fpsMesure.n++; fpsMesure.t += (maintenant - (fpsMesure.dernier || maintenant)) / 1000; fpsMesure.dernier = maintenant;
      if(fpsMesure.t > 3){
        const fps = fpsMesure.n / fpsMesure.t;
        if(fps < 28 && qualite !== "basse"){ qualite = qualite === "haute" ? "moyenne" : "basse"; ecrire("course-qualite", qualite); appliquerQualite(); fpsMesure = { n: 0, t: 0, fait: false }; }
        else fpsMesure.fait = true;
        if(TEST) window.__fps = fps;
      }
    }
  }
  renderer.render(scene, camera);
}

/* ======================= démarrage ======================= */
appliquerQualite();
construireCircuit(choix.circuit);
majVitrine();
remplirMenu();
$("chargement").hidden = true;
etat = "menu"; $("menu").hidden = false;
requestAnimationFrame(boucle);
if(TEST) window.__jeu = { scene, camera, THREE, get etat(){ return etat; }, get joueur(){ return joueur; }, get course(){ return course; }, get coureurs(){ return coureurs; }, choix, demarrerCourse, classement, piste: () => piste };
