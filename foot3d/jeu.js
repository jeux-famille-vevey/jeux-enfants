/* Super Foot 3D — un match de foot à 3 contre 3 en 3D (Three.js).
   Tout est dessiné en code : stade, joueurs, ballon. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { lireManette, vraiesManettes } from "../commun/manette.js";

const $ = (id) => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const TEST = PARAMS.has("test"), AUTO = PARAMS.has("auto");
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const hyp = Math.hypot;
function angle(a){ while(a > Math.PI) a -= 2 * Math.PI; while(a < -Math.PI) a += 2 * Math.PI; return a; }
function hasard(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ======================= réglages ======================= */
const JOUEURS = [
  { id:"mikael", nom:"Mikael", e:"⚽", niveau:"facile", numero:5, peau:"#C98E62", cheveux:"#22150F" },
  { id:"aleyah", nom:"Aleyah", e:"⭐", niveau:"normal", numero:10, peau:"#C98E62", cheveux:"#22150F", longs:true },
  { id:"invite", nom:"Invité", e:"🙂", niveau:"normal", numero:7, peau:"#E8B98E", cheveux:"#6B3E23" }
];
const NIVEAUX = {
  facile:   { nom:"Facile", e:"🐣", desc:"2 minutes", duree:120, vAdv:.76, volAdv:.35, gardienAdv:.3, monVol:3, visee:.35, tirAdv:.35, aide:true },
  normal:   { nom:"Normal", e:"⚽", desc:"2 min 30", duree:150, vAdv:.9, volAdv:.85, gardienAdv:.5, monVol:1.7, visee:.8, tirAdv:.6, aide:false },
  champion: { nom:"Champion", e:"🔥", desc:"3 minutes", duree:180, vAdv:1.0, volAdv:1.4, gardienAdv:.66, monVol:1.1, visee:1.1, tirAdv:.82, aide:false }
};
const MAILLOTS = [
  { id:"bleu", nom:"Bleu", c:"#3D7BD9", s:"#FFFFFF" }, { id:"rouge", nom:"Rouge", c:"#E5484D", s:"#FFFFFF" }, { id:"vert", nom:"Vert", c:"#3FA34D", s:"#FFFFFF" },
  { id:"jaune", nom:"Jaune", c:"#FFD23F", s:"#3D4A8F" }, { id:"rose", nom:"Rose", c:"#FF8FB8", s:"#FFFFFF" }, { id:"blanc", nom:"Blanc", c:"#F4F4F4", s:"#1D2357" }
];
const ADVERSAIRES = [
  { id:"lions", nom:"Les Lions", e:"🦁", c:"#FF9F1C", s:"#22232B" }, { id:"requins", nom:"Les Requins", e:"🦈", c:"#2BB3C0", s:"#1D2357" },
  { id:"dragons", nom:"Les Dragons", e:"🐉", c:"#8E5BC4", s:"#FFD23F" }
];
const L = 30, W = 19, BUT = 3.2, HBUT = 2.4, R = .38, PROF = 2.0;

let choix = { joueur: lire("foot-joueur", "mikael"), maillot: lire("foot-maillot", "bleu"), adv: lire("foot-adv", "lions"), niveau: null };
choix.niveau = lire("foot-niveau-" + choix.joueur, (JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[0]).niveau);

/* ======================= moteur 3D ======================= */
const canvas = $("c");
let renderer;
try{ renderer = new THREE.WebGLRenderer({ canvas, antialias: lire("foot-qualite", "haute") === "haute", powerPreference: "high-performance" }); }
catch(e){ $("chargement").hidden = true; $("erreur3d").hidden = false; throw e; }
let qualite = lire("foot-qualite", "haute");
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .5, 900);
function redimensionner(){ const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
function appliquerQualite(){
  renderer.setPixelRatio(qualite === "haute" ? Math.min(devicePixelRatio || 1, 1.5) : qualite === "moyenne" ? 1 : .7);
  renderer.shadowMap.enabled = qualite === "haute";
  redimensionner();
}
addEventListener("resize", redimensionner);
scene.add(new THREE.HemisphereLight(0xffffff, 0x4a7a3a, 1.2));
const soleil = new THREE.DirectionalLight(0xffffff, 2.0);
soleil.position.set(25, 50, -15); soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -32, right: 32, top: 40, bottom: -40, near: 1, far: 140 });
soleil.shadow.bias = -0.0008;
scene.add(soleil);

function texture(w, h, dessin, repeat){
  const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if(repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t;
}
const M = {};
function mat(c, o){ const k = c + JSON.stringify(o || {}); if(!M[k]) M[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .75, flatShading: true }, o || {})); return M[k]; }
function boite(w, h, l, c, x, y, z, o){ const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat(c, o)); m.position.set(x, y, z); m.castShadow = true; return m; }
const texOmbre = texture(64, 64, (g) => { const d = g.createRadialGradient(32, 32, 2, 32, 32, 31); d.addColorStop(0, "rgba(0,0,0,1)"); d.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = d; g.fillRect(0, 0, 64, 64); });
const ombreMat = new THREE.MeshBasicMaterial({ map: texOmbre, transparent: true, opacity: .32, depthWrite: false });

/* ======================= le stade ======================= */
scene.background = texture(4, 256, (g, w, h) => { const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, "#4FA8F0"); d.addColorStop(.6, "#D6EEFF"); d.addColorStop(1, "#D6EEFF"); g.fillStyle = d; g.fillRect(0, 0, w, h); });
scene.fog = new THREE.Fog("#D6EEFF", 160, 520);
let foule = null, fouleBase = [];
function construireStade(){
  // pelouse rayée avec les lignes
  const PX = 2 * W + 6, PZ = 2 * L + 8;
  const pel = texture(512, 820, (g, w, h) => {
    const sx = w / PX, sz = h / PZ;
    for(let i = 0; i < 14; i++){ g.fillStyle = i % 2 ? "#4FAE4A" : "#5BBB54"; g.fillRect(0, i * h / 14, w, h / 14 + 1); }
    g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 3.2;
    const X = (x) => (x + PX / 2) * sx, Z = (z) => (PZ / 2 - z) * sz;
    g.strokeRect(X(-W), Z(L), 2 * W * sx, 2 * L * sz);
    g.beginPath(); g.moveTo(X(-W), Z(0)); g.lineTo(X(W), Z(0)); g.stroke();
    g.beginPath(); g.arc(X(0), Z(0), 5 * sx, 0, 7); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X(0), Z(0), 4, 0, 7); g.fill();
    [1, -1].forEach(s => {
      g.strokeRect(X(-10), Z(s > 0 ? L : -L + 9), 20 * sx, 9 * sz);
      g.strokeRect(X(-5.5), Z(s > 0 ? L : -L + 3.5), 11 * sx, 3.5 * sz);
      g.beginPath(); g.arc(X(0), Z(s * (L - 6.5)), 4, 0, 7); g.fill();
    });
  });
  const pelouse = new THREE.Mesh(new THREE.PlaneGeometry(PX, PZ), new THREE.MeshStandardMaterial({ map: pel, roughness: 1 }));
  pelouse.rotation.x = -Math.PI / 2; pelouse.receiveShadow = true; scene.add(pelouse);
  const autour = new THREE.Mesh(new THREE.PlaneGeometry(220, 260), new THREE.MeshStandardMaterial({ color: "#3E8E3A", roughness: 1 }));
  autour.rotation.x = -Math.PI / 2; autour.position.y = -.05; scene.add(autour);
  // panneaux publicitaires autour du terrain (le ballon rebondit dessus)
  const pubs = ["SUPER FOOT 3D", "⚽ VEVEY ⚽", "ALLEZ ! ALLEZ !", "BRAVO LES ENFANTS", "★ BUT ★"];
  const coul = ["#E5484D", "#3D7BD9", "#FFD23F", "#3FA34D", "#8E5BC4"];
  let k = 0;
  function panneau(x, z, long, rot){
    const t = texture(512, 64, (g, w, h) => { g.fillStyle = coul[k % 5]; g.fillRect(0, 0, w, h); g.fillStyle = k % 5 === 2 ? "#1D2357" : "#fff"; g.font = "bold 40px Fredoka, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(pubs[k % 5], w / 2, h / 2 + 2); });
    k++;
    const m = new THREE.Mesh(new THREE.BoxGeometry(long, 1, .2), [mat("#22232B"), mat("#22232B"), mat("#22232B"), mat("#22232B"), new THREE.MeshStandardMaterial({ map: t }), new THREE.MeshStandardMaterial({ map: t })]);
    m.position.set(x, .5, z); m.rotation.y = rot; m.castShadow = true; scene.add(m);
  }
  for(let z = -L + 6; z <= L - 6; z += 12){ panneau(-W - .7, z, 12, Math.PI / 2); panneau(W + .7, z, 12, -Math.PI / 2); }
  [-1, 1].forEach(s => { panneau(-11.1, s * (L + .7), 15.8, s > 0 ? Math.PI : 0); panneau(11.1, s * (L + .7), 15.8, s > 0 ? Math.PI : 0); });
  // buts avec filets
  const filet = texture(64, 64, (g) => { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; for(let i = 0; i <= 64; i += 16){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } }, true);
  [-1, 1].forEach(s => {
    const g = new THREE.Group(), blanc = mat("#FFFFFF", { roughness: .3, flatShading: false });
    const poteau = (x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, HBUT, 10), blanc); p.position.set(x, HBUT / 2, 0); p.castShadow = true; g.add(p); };
    poteau(-BUT); poteau(BUT);
    const barre = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 2 * BUT + .26, 10), blanc); barre.rotation.z = Math.PI / 2; barre.position.y = HBUT; barre.castShadow = true; g.add(barre);
    const fm = (w, h, rep) => { const t = filet.clone(); t.needsUpdate = true; t.repeat.set(rep[0], rep[1]); return new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }); };
    const fond = new THREE.Mesh(new THREE.PlaneGeometry(2 * BUT, HBUT), fm(2 * BUT, HBUT, [10, 4])); fond.position.set(0, HBUT / 2, PROF); g.add(fond);
    const toit = new THREE.Mesh(new THREE.PlaneGeometry(2 * BUT, PROF), fm(2 * BUT, PROF, [10, 3])); toit.rotation.x = Math.PI / 2; toit.position.set(0, HBUT, PROF / 2); g.add(toit);
    [-1, 1].forEach(c => { const cote = new THREE.Mesh(new THREE.PlaneGeometry(PROF, HBUT), fm(PROF, HBUT, [3, 4])); cote.rotation.y = Math.PI / 2; cote.position.set(c * BUT, HBUT / 2, PROF / 2); g.add(cote); });
    g.position.z = s * L; if(s < 0) g.rotation.y = Math.PI; scene.add(g);
  });
  // tribunes et foule
  const places = [], r = hasard(5), couleursFoule = ["#E5484D", "#FFD23F", "#3D7BD9", "#3FA34D", "#FF8FB8", "#FFFFFF", "#FF9F1C", "#8E5BC4"];
  function tribune(cx, cz, long, rot, rangs){
    const g = new THREE.Group();
    for(let i = 0; i < rangs; i++){
      g.add(boite(long, 1, 2, i % 2 ? "#C9CED8" : "#AEB4C2", 0, .5 + i, i * 2));
      for(let x = -long / 2 + .8; x < long / 2 - .5; x += 1.15) if(r() < .88) places.push({ g, x: x + r() * .2, y: 1.6 + i, z: i * 2, c: couleursFoule[Math.floor(r() * 8)] });
    }
    g.add(boite(long, rangs + 2, .5, "#2E3580", 0, (rangs + 2) / 2, rangs * 2 + .2));
    g.position.set(cx, 0, cz); g.rotation.y = rot; scene.add(g); return g;
  }
  // les gradins montent en s'éloignant du terrain
  tribune(-W - 3, 0, 2 * L + 4, -Math.PI / 2, 7); tribune(W + 3, 0, 2 * L + 4, Math.PI / 2, 7);
  tribune(0, L + 3.5, 2 * W - 2, 0, 5); tribune(0, -L - 3.5, 2 * W - 2, Math.PI, 3);
  scene.updateMatrixWorld(true);
  foule = new THREE.InstancedMesh(new THREE.BoxGeometry(.75, 1.1, .7), new THREE.MeshStandardMaterial({ roughness: .8 }), places.length);
  const d = new THREE.Object3D(), v = new THREE.Vector3();
  places.forEach((p, i) => { v.set(p.x, p.y, p.z); p.g.localToWorld(v); fouleBase.push(v.clone()); d.position.copy(v); d.updateMatrix(); foule.setMatrixAt(i, d.matrix); foule.setColorAt(i, new THREE.Color(p.c)); });
  scene.add(foule);
  // projecteurs aux 4 coins
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const g = new THREE.Group(); g.add(boite(.8, 24, .8, "#8A90A0", 0, 12, 0));
    g.add(boite(4.5, 2.6, .5, "#FFFDE8", 0, 24.5, 0, { emissive: "#FFF7C2", emissiveIntensity: .9 }));
    g.position.set(sx * (W + 13), 0, sz * (L + 12)); g.lookAt(0, 0, 0); scene.add(g);
  });
}

/* ======================= joueurs ======================= */
function texNumero(n, fond, encre){
  return texture(128, 128, (g) => { g.fillStyle = fond; g.fillRect(0, 0, 128, 128); g.fillStyle = encre; g.font = "bold 92px Fredoka, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), 64, 70); });
}
/* visage dessiné sur la tête (le devant de la sphère est au quart de la texture) */
const visages = {};
function texVisage(peau){
  if(visages[peau]) return visages[peau];
  return visages[peau] = texture(512, 256, (g, w, h) => {
    g.fillStyle = peau; g.fillRect(0, 0, w, h);
    const cx = w * .25, cy = h * .5;
    [-1, 1].forEach(s => {
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.ellipse(cx + s * 26, cy - 6, 15, 19, 0, 0, 7); g.fill();
      g.fillStyle = "#2B2140"; g.beginPath(); g.ellipse(cx + s * 26 + 2, cy - 3, 9, 12, 0, 0, 7); g.fill();
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(cx + s * 26 + 5, cy - 8, 3.5, 0, 7); g.fill();
      g.strokeStyle = "#2B2140"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(cx + s * 14, cy - 32); g.quadraticCurveTo(cx + s * 26, cy - 40, cx + s * 38, cy - 31); g.stroke();
      g.fillStyle = "rgba(255,110,130,.45)"; g.beginPath(); g.ellipse(cx + s * 44, cy + 22, 13, 8, 0, 0, 7); g.fill();
    });
    g.strokeStyle = "#5A2A1A"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 18, cy + 30); g.quadraticCurveTo(cx, cy + 46, cx + 18, cy + 30); g.stroke();
    g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(cx, cy + 12, 5, 4, 0, 0, 7); g.fill();
  });
}
function creerJoueur(o){
  // o : { maillot, short, peau, cheveux, numero, gardien, longs }
  const g = new THREE.Group(), corps = new THREE.Group(); g.add(corps);
  const maillot = o.gardien ? (o.equipe === 0 ? "#22B573" : "#4A4E5E") : o.maillot;
  const jambes = [], bras = [];
  [-1, 1].forEach(s => {
    const j = new THREE.Group(); j.position.set(s * .2, .98, 0);
    j.add(boite(.3, .38, .32, o.short, 0, -.15, 0));
    j.add(boite(.21, .42, .22, o.peau, 0, -.52, 0));
    j.add(boite(.23, .26, .25, o.gardien ? "#22232B" : o.maillot, 0, -.78, 0));
    j.add(boite(.25, .16, .42, "#22232B", 0, -.93, .07));
    corps.add(j); jambes.push(j);
    const b = new THREE.Group(); b.position.set(s * .5, 1.66, 0);
    b.add(boite(.2, .3, .24, maillot, 0, -.12, 0));
    b.add(boite(.16, .4, .18, o.gardien ? maillot : o.peau, 0, -.45, 0));
    b.add(boite(o.gardien ? .26 : .18, .2, o.gardien ? .26 : .2, o.gardien ? "#FFD23F" : o.peau, 0, -.72, 0));
    corps.add(b); bras.push(b);
  });
  corps.add(boite(.78, .78, .44, maillot, 0, 1.38, 0));
  const tn = texNumero(o.numero, maillot, o.gardien || ["#FFD23F", "#F4F4F4"].includes(maillot) ? "#1D2357" : "#FFFFFF");
  const dos = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshStandardMaterial({ map: tn })); dos.position.set(0, 1.42, -.225); dos.rotation.y = Math.PI; corps.add(dos);
  const devant = new THREE.Mesh(new THREE.PlaneGeometry(.22, .22), new THREE.MeshStandardMaterial({ map: tn })); devant.position.set(.18, 1.55, .225); corps.add(devant);
  corps.add(boite(.2, .14, .2, o.peau, 0, 1.83, 0));
  const tete = new THREE.Mesh(new THREE.SphereGeometry(.34, 20, 14), new THREE.MeshStandardMaterial({ map: texVisage(o.peau), roughness: .7 })); tete.position.y = 2.12; tete.castShadow = true; corps.add(tete);
  const chev = new THREE.Mesh(new THREE.SphereGeometry(.365, 16, 10, 0, Math.PI * 2, 0, Math.PI * .47), mat(o.cheveux)); chev.position.y = 2.14; chev.rotation.x = -.36; corps.add(chev);
  if(o.longs){ corps.add(boite(.62, .55, .2, o.cheveux, 0, 1.92, -.2)); }
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), ombreMat); ombre.rotation.x = -Math.PI / 2; ombre.position.y = .02; g.add(ombre);
  const anneau = new THREE.Mesh(new THREE.RingGeometry(.62, .82, 28), new THREE.MeshBasicMaterial({ color: "#FFD23F", transparent: true, opacity: .9 }));
  anneau.rotation.x = -Math.PI / 2; anneau.position.y = .04; anneau.visible = false; g.add(anneau);
  const fleche = new THREE.Mesh(new THREE.ConeGeometry(.28, .5, 4), new THREE.MeshBasicMaterial({ color: "#FFD23F" }));
  fleche.rotation.x = Math.PI; fleche.position.y = 3.0; fleche.visible = false; g.add(fleche);
  g.userData = { corps, jambes, bras, anneau, fleche };
  return g;
}

/* ======================= le ballon ======================= */
const texBallon = texture(256, 128, (g, w, h) => {
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w, h); g.fillStyle = "#22232B";
  const pts = [[20, 64], [84, 30], [84, 98], [148, 64], [212, 30], [212, 98], [52, 8], [52, 120], [116, 8], [116, 120], [180, 8], [180, 120], [244, 64]];
  pts.forEach(([x, y]) => { g.beginPath(); for(let k = 0; k < 5; k++){ const a = k / 5 * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); } g.closePath(); g.fill(); });
});
const ballonMesh = new THREE.Mesh(new THREE.SphereGeometry(R, 20, 14), new THREE.MeshStandardMaterial({ map: texBallon, roughness: .45 }));
ballonMesh.castShadow = true; scene.add(ballonMesh);
const ballonOmbre = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), ombreMat); ballonOmbre.rotation.x = -Math.PI / 2; scene.add(ballonOmbre);
const B = { x: 0, y: R, z: 0, vx: 0, vy: 0, vz: 0, owner: null, dernier: null, tir: 0, tirEquipe: -1, tenteArret: false };

/* ======================= état du match ======================= */
let joueurs = [], humain = null, match = null, etat = "chargement";
const clavier = {};
let tactile = { x: 0, y: 0, tir: false, passe: false, sprint: false };
let appuiTir = false, appuiPasse = false; // appuis courts mémorisés

function creerEquipes(){
  joueurs.forEach(p => scene.remove(p.mesh)); joueurs = [];
  const J = JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[2], mai = MAILLOTS.find(m => m.id === choix.maillot) || MAILLOTS[0], adv = ADVERSAIRES.find(a => a.id === choix.adv) || ADVERSAIRES[0];
  const copains = [{ peau:"#F2C9A0", cheveux:"#E0A43A" }, { peau:"#8D5B3C", cheveux:"#1E1410" }, { peau:"#E8B98E", cheveux:"#6B3E23" }, { peau:"#C98E62", cheveux:"#22150F" }];
  const ajoute = (equipe, role, numero, look, nom) => {
    const o = Object.assign({ equipe, gardien: role === "gardien", numero, maillot: equipe === 0 ? mai.c : adv.c, short: equipe === 0 ? mai.s : adv.s }, look);
    const p = { equipe, role, numero, nom, mesh: creerJoueur(o), x: 0, z: 0, vx: 0, vz: 0, h: 0, phase: Math.random() * 6, attente: 0, tPossession: 0, cool: 0, saut: 0 };
    scene.add(p.mesh); joueurs.push(p); return p;
  };
  humain = ajoute(0, "champ", J.numero, { peau: J.peau, cheveux: J.cheveux, longs: J.longs }, J.nom);
  ajoute(0, "champ", 9, copains[0], "Léo");
  ajoute(0, "gardien", 1, copains[1], "Sam");
  ajoute(1, "champ", 10, copains[2], adv.nom);
  ajoute(1, "champ", 8, copains[3], adv.nom);
  ajoute(1, "gardien", 1, copains[0], adv.nom);
}
function engagement(equipeQuiEngage){
  const pos = { 0: [[-2, -1.2], [-8, -9], [0, -L + 1.2]], 1: [[3, 7], [-6, 9], [0, L - 1.2]] };
  [0, 1].forEach(e => {
    const eq = joueurs.filter(p => p.equipe === e);
    eq.forEach((p, i) => { const q = pos[e][i]; p.x = q[0]; p.z = q[1]; p.vx = p.vz = 0; p.h = e === 0 ? 0 : Math.PI; p.attente = 0; p.saut = 0; });
  });
  const preneur = joueurs.find(p => p.equipe === equipeQuiEngage && p.role === "champ" && (equipeQuiEngage === 1 || p === humain));
  if(equipeQuiEngage === 1){ preneur.x = 0; preneur.z = 1.2; }
  else{ preneur.x = 0; preneur.z = -1.2; }
  Object.assign(B, { x: 0, y: R, z: 0, vx: 0, vy: 0, vz: 0, owner: null, dernier: null, tenteArret: false });
  donner(preneur);
  match.gel = 1.4;
}
function donner(p){ B.owner = p; B.dernier = p; p.tPossession = 0; B.tenteArret = false; B.tirEquipe = -1; }
function demarrerMatch(){
  const niv = NIVEAUX[choix.niveau];
  creerEquipes();
  match = { niv, temps: niv.duree, score: [0, 0], gel: 0, fete: 0, fini: false, auto: AUTO };
  etat = "match";
  $("menu").hidden = true; $("hud").hidden = false; $("ecranFin").hidden = true;
  const tactileOk = "ontouchstart" in window;
  $("tactile").hidden = !tactileOk;
  const J = JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[2], mai = MAILLOTS.find(m => m.id === choix.maillot) || MAILLOTS[0], adv = ADVERSAIRES.find(a => a.id === choix.adv) || ADVERSAIRES[0];
  $("eqA").innerHTML = '<span class="pastille" style="background:' + mai.c + '"></span>'; $("eqA").appendChild(document.createTextNode(J.id === "invite" ? "Mon équipe" : "Équipe " + J.nom));
  $("eqB").innerHTML = ""; $("eqB").appendChild(document.createTextNode(adv.nom + " ")); $("eqB").insertAdjacentHTML("beforeend", '<span class="pastille" style="background:' + adv.c + '"></span>');
  $("aideJeu").innerHTML = tactileOk ? "" : "<b>Flèches</b> courir · <b>Espace</b> tirer (garde appuyé = plus fort) · <b>E</b> passe · <b>Maj</b> sprint · 🎮 ✕ tir, ○ passe, R2 sprint";
  majScore();
  engagement(0);
  sons.demarrer(); annoncer("Coup d'envoi !", 1.4); voix("Coup d'envoi !"); sons.sifflet(1);
  fps = { n: 0, t: 0, fait: qualite !== "haute" || TEST };
}

/* ======================= commandes ======================= */
addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase(); clavier[k] = true;
  if([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if(k === " ") appuiTir = true;
  if(k === "e" || k === "x") appuiPasse = true;
  if(k === "escape" || k === "p"){ if(etat === "match" || etat === "pause") basculerPause(); }
  else if(etat === "menu" && k === "enter") $("go").click();
  else if(etat === "fin" && k === "enter") $("rejouer").click();
});
addEventListener("keyup", (e) => { clavier[e.key.toLowerCase()] = false; });
// joystick et boutons de la tablette
(() => {
  const st = $("stick"), bout = st.querySelector("i");
  let id = null;
  const bouger = (e) => { const r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = hyp(dx, dy), max = r.width / 2 - 20; if(d > max){ dx *= max / d; dy *= max / d; }
    tactile.x = dx / max; tactile.y = dy / max; bout.style.transform = "translate(" + dx + "px," + dy + "px)"; };
  st.addEventListener("pointerdown", (e) => { e.preventDefault(); id = e.pointerId; st.setPointerCapture(id); bouger(e); sons.reveil(); });
  st.addEventListener("pointermove", (e) => { if(e.pointerId === id) bouger(e); });
  const fin = (e) => { if(e.pointerId !== id) return; id = null; tactile.x = tactile.y = 0; bout.style.transform = ""; };
  st.addEventListener("pointerup", fin); st.addEventListener("pointercancel", fin);
  [["bTir", "tir"], ["bPasse", "passe"], ["bSprint", "sprint"]].forEach(([b, k]) => {
    const el = $(b);
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); tactile[k] = true; el.classList.add("on"); if(k === "tir") appuiTir = true; if(k === "passe") appuiPasse = true; sons.reveil(); });
    const off = (e) => { e.preventDefault(); tactile[k] = false; el.classList.remove("on"); };
    el.addEventListener("pointerup", off); el.addEventListener("pointercancel", off); el.addEventListener("pointerleave", off);
  });
})();
let manette = null;
function lireCommandes(){
  // caméra derrière notre équipe : haut = vers le but adverse (+z), droite = -x
  let dx = 0, dz = 0;
  if(clavier["arrowleft"] || clavier["q"] || clavier["a"]) dx += 1;
  if(clavier["arrowright"] || clavier["d"]) dx -= 1;
  if(clavier["arrowup"] || clavier["z"] || clavier["w"]) dz += 1;
  if(clavier["arrowdown"] || clavier["s"]) dz -= 1;
  if(tactile.x || tactile.y){ dx = -tactile.x; dz = -tactile.y; }
  let tir = clavier[" "] || tactile.tir, passe = false, sprint = clavier["shift"] || tactile.sprint;
  if(manette){
    if(manette.x || manette.y){ dx = -manette.x; dz = -manette.y; }
    tir = tir || manette.a; sprint = sprint || manette.r2 > .3 || manette.r1;
    if(manette.nA) appuiTir = true; if(manette.nB || manette.nC) appuiPasse = true;
    if(manette.nSTART) basculerPause();
  }
  passe = appuiPasse; const nouveauTir = appuiTir; appuiTir = appuiPasse = false;
  const d = hyp(dx, dz); if(d > 1){ dx /= d; dz /= d; }
  return { dx, dz, tir, nouveauTir, passe, sprint };
}

/* ======================= actions ======================= */
const butZ = (equipe) => equipe === 0 ? L : -L;  // but que vise cette équipe
function tirer(p, puissance, visee){
  const adverse = joueurs.find(q => q.equipe !== p.equipe && q.role === "gardien");
  const gz = butZ(p.equipe), dist = Math.abs(gz - p.z);
  let cibleX;
  if(visee !== undefined && visee !== null) cibleX = clamp(visee, -BUT + .5, BUT - .5);
  else cibleX = (adverse && adverse.x > 0 ? -1 : 1) * (BUT - 1.1);
  const precision = p.equipe === 0 ? match.niv.visee : (1.4 - match.niv.tirAdv);
  cibleX += (Math.random() - .5) * precision * (1 + dist / 18);
  const tx = cibleX - p.x, tz = gz + Math.sign(gz) * .8 - p.z, td = hyp(tx, tz);
  const v = 15 + puissance * 13;
  B.owner = null; B.vx = tx / td * v; B.vz = tz / td * v; B.vy = 2.2 + puissance * 2.6 + clamp((dist - 12) * .12, 0, 2.5);
  B.dernier = p; B.tirEquipe = p.equipe; B.tenteArret = false; p.cool = .35; p.saut = .25;
  sons.frappe(puissance);
}
function passer(p, dirX, dirZ){
  const coeq = joueurs.filter(q => q.equipe === p.equipe && q !== p && q.role === "champ");
  const adverse = joueurs.filter(q => q.equipe === p.equipe && q !== p);
  let cible = null, meilleur = -Infinity;
  const fx = dirX || Math.sin(p.h), fz = dirZ || Math.cos(p.h);
  (coeq.length ? coeq : adverse).forEach(q => {
    const dx = q.x - p.x, dz = q.z - p.z, d = hyp(dx, dz) || 1;
    const score = (dx * fx + dz * fz) / d * 2 - d * .04 + (dz * (p.equipe === 0 ? 1 : -1)) * .02;
    if(score > meilleur){ meilleur = score; cible = q; }
  });
  if(!cible) return;
  const ax = cible.x + cible.vx * .45, az = cible.z + cible.vz * .45, dx = ax - p.x, dz = az - p.z, d = hyp(dx, dz) || 1;
  const v = clamp(d * 1.25 + 6, 9, 21);
  B.owner = null; B.vx = dx / d * v; B.vz = dz / d * v; B.vy = d > 14 ? 3.5 : 1; B.dernier = p; B.tirEquipe = -1; p.cool = .3;
  sons.frappe(.3);
}

/* ======================= intelligence des joueurs ======================= */
function bouger(p, tx, tz, vmax, dt){
  const dx = tx - p.x, dz = tz - p.z, d = hyp(dx, dz);
  let vx = 0, vz = 0;
  if(d > .25){ const v = Math.min(vmax, d * 3); vx = dx / d * v; vz = dz / d * v; }
  p.vx = lerp(p.vx, vx, clamp(dt * 7, 0, 1)); p.vz = lerp(p.vz, vz, clamp(dt * 7, 0, 1));
}
function plusProcheDuBallon(equipe){
  let best = null, bd = Infinity;
  joueurs.forEach(p => { if(p.equipe !== equipe || p.role !== "champ") return; const d = hyp(p.x - B.x, p.z - B.z); if(d < bd){ bd = d; best = p; } });
  return best;
}
function ia(p, dt){
  const niv = match.niv, sens = p.equipe === 0 ? 1 : -1, monBut = -sens * L;
  const vmax = 6.4 * (p.equipe === 1 ? niv.vAdv : 1);
  if(p.role === "gardien"){
    const ligne = monBut + sens * 1.1;
    let tx = clamp(B.x * .35, -BUT + .6, BUT - .6), tz = ligne;
    const vient = (B.vz * -sens) > 4 && !B.owner;
    if(vient){ const t = (ligne - B.z) / (B.vz || 1); if(t > 0 && t < 2) tx = clamp(B.x + B.vx * t, -BUT, BUT); }
    // sortir prendre le ballon s'il est tout près de son but
    const dBut = Math.abs(B.z - monBut);
    if(!B.owner && dBut < 6 && Math.abs(B.x) < 9 && hyp(B.vx, B.vz) < 9){ tx = B.x; tz = B.z; }
    bouger(p, tx, tz, 7.5, dt);
    if(B.owner === p){
      p.attente += dt;
      if(p.attente > .9){ passer(p, (Math.random() - .5), sens); p.attente = 0; }
    }
    return;
  }
  if(B.owner === p){
    // avancer vers le but adverse en zigzaguant, tirer quand on est assez près
    p.tPossession += dt;
    const gz = butZ(p.equipe), dist = Math.abs(gz - p.z);
    const tx = clamp(Math.sin(p.tPossession * 1.3 + p.numero) * 5 * (dist > 14 ? 1 : .3), -W + 2, W - 2);
    bouger(p, tx, gz, vmax * .92, dt);
    const genant = joueurs.some(q => q.equipe !== p.equipe && hyp(q.x - p.x, q.z - p.z) < 2.6 && (q.z - p.z) * sens > 0);
    if(dist < 14 && p.tPossession > .45 && Math.random() < dt * (p.equipe === 1 ? 1.4 + niv.tirAdv : 2)) tirer(p, .55 + Math.random() * .45);
    else if(genant && p.tPossession > .6 && Math.random() < dt * 1.5) passer(p, 0, sens);
    return;
  }
  const notreBallon = B.owner && B.owner.equipe === p.equipe;
  if(notreBallon){
    // se démarquer devant
    const cote = B.x > 0 ? -1 : 1;
    bouger(p, clamp(cote * 7, -W + 2, W - 2), clamp(B.z + sens * 9, -L + 4, L - 4), vmax, dt);
    return;
  }
  // défendre : le plus proche va au ballon, l'autre se place entre le ballon et le but
  const chasseur = plusProcheDuBallon(p.equipe);
  if(chasseur === p){
    bouger(p, B.x + B.vx * .25, B.z + B.vz * .25, vmax, dt);
  }else{
    bouger(p, clamp(B.x * .6, -W + 2, W - 2), clamp(lerp(B.z, monBut, .45), -L + 3, L - 3), vmax * .85, dt);
  }
}

/* ======================= physique ======================= */
let chargeTir = 0, tirEnCours = false;
function maj(dt){
  const niv = match.niv;
  manette = lireManette();
  const cmd = lireCommandes();
  if(match.fete > 0){
    match.fete -= dt;
    joueurs.forEach(p => { p.vx *= .9; p.vz *= .9; });
    if(match.fete <= 0){ engagement(match.engage); }
  }else if(match.gel > 0){
    match.gel -= dt;
  }else{
    match.temps -= dt;
    if(match.temps <= 0){ finMatch(); return; }
    if(match.temps < 10.5 && match.temps + dt >= 10.5) annoncer("Dernières secondes !", 1.2);
  }
  const jeu = match.fete <= 0 && match.gel <= 0;

  // changement automatique du joueur que l'on dirige
  if(jeu && !(B.owner && B.owner.equipe === 0)){
    const proche = plusProcheDuBallon(0);
    if(proche && proche !== humain && hyp(proche.x - B.x, proche.z - B.z) + 2 < hyp(humain.x - B.x, humain.z - B.z)) humain = proche;
    if(cmd.passe && !B.owner){ humain = joueurs.find(p => p.equipe === 0 && p.role === "champ" && p !== humain) || humain; }
  }else if(B.owner && B.owner.equipe === 0 && B.owner.role === "champ") humain = B.owner;

  // le joueur dirigé
  joueurs.forEach(p => {
    p.cool = Math.max(0, p.cool - dt);
    if(!jeu){ if(match.gel > 0) { p.vx = 0; p.vz = 0; } return; }
    if(p === humain && !AUTO){
      const vmax = (cmd.sprint ? 9.2 : 6.9) * (niv.aide ? 1.08 : 1);
      p.vx = lerp(p.vx, cmd.dx * vmax, clamp(dt * 9, 0, 1)); p.vz = lerp(p.vz, cmd.dz * vmax, clamp(dt * 9, 0, 1));
      if(B.owner === p){
        // tir : on charge en gardant appuyé, on tire en relâchant
        if(cmd.tir){ tirEnCours = true; chargeTir = Math.min(1, chargeTir + dt * 1.5); }
        else if(tirEnCours || cmd.nouveauTir){
          // viser : joystick à gauche ou à droite au moment du tir, sinon le coin loin du gardien
          const vis = Math.abs(cmd.dx) > .3 ? Math.sign(cmd.dx) * (BUT - 1) : null;
          tirer(p, .45 + .55 * Math.max(chargeTir, cmd.nouveauTir && !tirEnCours ? .55 : 0), vis);
          tirEnCours = false; chargeTir = 0;
        }
        if(cmd.passe) passer(p, cmd.dx, cmd.dz);
        // aide (facile) : près du but, un petit message
        if(niv.aide && Math.abs(L - p.z) < 14) indice("⚽ Tire !");
      }else{
        tirEnCours = false; chargeTir = 0;
        // tacle : en appuyant sur tir près d'un adversaire qui a le ballon
        if(cmd.nouveauTir && B.owner && B.owner.equipe === 1 && hyp(B.x - p.x, B.z - p.z) < 2.2 && Math.random() < .55 + (niv.aide ? .3 : 0)){ voler(p); }
      }
    }else ia(p, dt);
  });
  $("jauge").classList.toggle("on", tirEnCours); $("jauge").firstChild.style.width = Math.round(chargeTir * 100) + "%";

  // déplacement + collisions entre joueurs + limites du terrain
  joueurs.forEach(p => {
    p.x += p.vx * dt; p.z += p.vz * dt;
    const lim = p.role === "gardien" ? L - .2 : L - .6;
    p.x = clamp(p.x, -W + .6, W - .6); p.z = clamp(p.z, -lim, lim);
    const v = hyp(p.vx, p.vz);
    if(v > .4) p.h = p.h + angle(Math.atan2(p.vx, p.vz) - p.h) * clamp(dt * 12, 0, 1);
    else if(B.owner !== p) p.h = p.h + angle(Math.atan2(B.x - p.x, B.z - p.z) - p.h) * clamp(dt * 4, 0, 1);
  });
  for(let i = 0; i < joueurs.length; i++) for(let j = i + 1; j < joueurs.length; j++){
    const a = joueurs[i], b = joueurs[j], dx = b.x - a.x, dz = b.z - a.z, d = hyp(dx, dz);
    if(d < .95 && d > .001){ const k = (.95 - d) / 2; a.x -= dx / d * k; a.z -= dz / d * k; b.x += dx / d * k; b.z += dz / d * k; }
  }

  // le ballon
  if(B.owner){
    const p = B.owner; p.tPossession += dt;
    const fx = Math.sin(p.h), fz = Math.cos(p.h);
    const tx = p.x + fx * .78, tz = p.z + fz * .78;
    B.vx = (tx - B.x) / Math.max(dt, .001); B.vz = (tz - B.z) / Math.max(dt, .001); B.x = tx; B.z = tz; B.y = R; B.vy = 0;
    if(p.role === "gardien"){ B.x = p.x + fx * .35; B.z = p.z + fz * .35; B.y = 1.3; }
    // les adversaires peuvent voler le ballon
    joueurs.forEach(q => {
      if(q.equipe === p.equipe || q.role === "gardien" || q.cool > 0 || B.owner !== p || p.role === "gardien") return;
      if(hyp(q.x - B.x, q.z - B.z) < 1.15){
        const taux = q.equipe === 1 ? niv.volAdv : (q === humain ? niv.monVol : niv.monVol * .6);
        if(Math.random() < taux * dt) voler(q);
      }
    });
  }else if(jeu || match.fete > 0){
    B.vy -= 15 * dt;
    B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt;
    if(B.y < R){ B.y = R; if(B.vy < -1.5){ B.vy = -B.vy * .45; sons.rebond(); } else B.vy = 0; }
    const fr = B.y <= R + .01 ? 1.1 : .12; B.vx *= Math.max(0, 1 - fr * dt); B.vz *= Math.max(0, 1 - fr * dt);
    murs();
    if(jeu) prendreBallon();
  }
  // rotation du ballon
  const vb = hyp(B.vx, B.vz);
  if(vb > .05){ const axe = new THREE.Vector3(B.vz, 0, -B.vx).normalize(); ballonMesh.rotateOnWorldAxis(axe, vb * dt / R); }
  ballonMesh.position.set(B.x, B.y, B.z);
  ballonOmbre.position.set(B.x, .03, B.z); ballonOmbre.scale.setScalar(clamp(1.1 - B.y * .12, .4, 1.1));
}
function voler(q){
  const ancien = B.owner;
  if(ancien){ ancien.cool = .7; }
  donner(q); q.cool = .2;
  if(q === humain || (ancien && ancien === humain)) sons.tacle();
}
function prendreBallon(){
  let best = null, bd = Infinity;
  joueurs.forEach(p => {
    if(p.cool > 0) return;
    const d = hyp(p.x - B.x, p.z - B.z), portee = p.role === "gardien" ? 1.5 : 1.0, haut = p.role === "gardien" ? 2.7 : 1.1;
    if(d < portee && B.y < haut && d < bd){ bd = d; best = p; }
  });
  if(!best) return;
  const v = hyp(B.vx, B.vz);
  if(best.role === "gardien"){
    // arrêt du gardien : réussi selon la difficulté (notre gardien est fort)
    if(B.tirEquipe >= 0 && B.tirEquipe !== best.equipe){
      if(B.tenteArret) return;
      B.tenteArret = true;
      const reussite = best.equipe === 1 ? match.niv.gardienAdv : .72;
      if(Math.random() < reussite){ donner(best); best.attente = 0; annoncer("Arrêt !", .9); voix("Arrêt du gardien !"); sons.tacle(); }
      else { B.vx *= .85; B.vz *= .85; }
      return;
    }
    donner(best); best.attente = 0; return;
  }
  if(v > 19 && Math.random() < .5){ B.vx *= .4; B.vz *= .4; B.vy = 2; best.cool = .15; return; } // le ballon rebondit sur le joueur
  donner(best);
}
function murs(){
  // poteaux
  [-BUT, BUT].forEach(px => [-L, L].forEach(pz => {
    const dx = B.x - px, dz = B.z - pz, d = hyp(dx, dz);
    if(d < R + .13 && B.y < HBUT + .1){ const nx = dx / d, nz = dz / d, vn = B.vx * nx + B.vz * nz; if(vn < 0){ B.vx -= 1.7 * vn * nx; B.vz -= 1.7 * vn * nz; sons.poteau(); } B.x = px + nx * (R + .14); B.z = pz + nz * (R + .14); }
  }));
  // côtés
  if(Math.abs(B.x) > W + .5 - R){ B.x = Math.sign(B.x) * (W + .5 - R); B.vx = -B.vx * .65; sons.rebond(); }
  // fonds : but ou rebond
  if(Math.abs(B.z) > L - R + .05){
    const s = Math.sign(B.z);
    const dansLeBut = Math.abs(B.x) < BUT - .1 && B.y < HBUT - .05;
    if(dansLeBut){
      if(Math.abs(B.z) > L + .4 && match.fete <= 0) but(s > 0 ? 0 : 1);
      if(Math.abs(B.z) > L + PROF - R){ B.z = s * (L + PROF - R); B.vz = -B.vz * .2; B.vx *= .5; }
      if(Math.abs(B.x) > BUT - R - .05){ B.x = Math.sign(B.x) * (BUT - R - .05); B.vx = -B.vx * .3; }
      if(B.y > HBUT - R){ B.y = HBUT - R; B.vy = -Math.abs(B.vy) * .3; }
    }else if(Math.abs(B.z) > L + .5 - R && !(Math.abs(B.x) < BUT && Math.abs(B.z) > L)){
      B.z = s * (L + .5 - R); B.vz = -B.vz * .6; sons.rebond();
    }else if(Math.abs(B.x) < BUT + .2 && B.y >= HBUT - .05 && Math.abs(B.z) > L){ B.z = s * (L - R); B.vz = -B.vz * .5; }
  }
}
function but(equipe){
  match.score[equipe]++; majScore();
  match.fete = 3.2; match.engage = 1 - equipe;
  B.owner = null;
  const nous = equipe === 0;
  annoncer(nous ? "BUT !" : "But…", 2.6, nous ? (B.dernier && B.dernier.equipe === 0 ? B.dernier.nom + " marque !" : "") : "Les autres ont marqué. On y retourne !");
  voix(nous ? (Math.random() < .5 ? "But !" : "Quel but !") : "Dommage !");
  sons.but(nous);
  if(nous){ fete = 3; confettis(); joueurs.forEach(p => { if(p.equipe === 0) p.saut = 2.8; }); }
}
let fete = 0;

/* ======================= affichage ======================= */
function placer(dt){
  joueurs.forEach(p => {
    const u = p.mesh.userData, v = hyp(p.vx, p.vz);
    p.mesh.position.set(p.x, 0, p.z); p.mesh.rotation.y = p.h;
    p.phase += v * dt * 2.1;
    const amp = clamp(v / 6, 0, 1) * .75;
    u.jambes[0].rotation.x = Math.sin(p.phase) * amp; u.jambes[1].rotation.x = -Math.sin(p.phase) * amp;
    u.bras[0].rotation.x = -Math.sin(p.phase) * amp * .8; u.bras[1].rotation.x = Math.sin(p.phase) * amp * .8;
    if(p.saut > 0){ p.saut -= dt; u.corps.position.y = Math.abs(Math.sin(p.saut * 7)) * .6; u.bras[0].rotation.x = u.bras[1].rotation.x = -2.6; }
    else u.corps.position.y = 0;
    if(p.role === "gardien" && B.owner === p){ u.bras[0].rotation.x = u.bras[1].rotation.x = -1.2; }
    const moi = p === humain && etat !== "menu";
    u.anneau.visible = moi; u.fleche.visible = moi;
    if(moi){ u.fleche.position.y = 3.0 + Math.sin(performance.now() / 180) * .12; }
  });
}
const camPos = new THREE.Vector3(0, 16, -40), camVise = new THREE.Vector3();
function cameraMatch(dt){
  const fx = clamp(B.x, -W + 4, W - 4), fz = clamp(B.z, -L + 6, L - 4);
  const portrait = camera.aspect < 1.1;
  const voulu = new THREE.Vector3(fx * .55, portrait ? 22 : 15.5, fz - (portrait ? 21 : 17));
  const vise = new THREE.Vector3(fx * .7, 0, fz + 3.5);
  const k = clamp(dt * 3.2, 0, 1);
  camPos.lerp(voulu, k); camVise.lerp(vise, k);
  camera.position.copy(camPos); camera.lookAt(camVise);
}
let annonceT = 0;
function annoncer(txt, duree, petit){ const a = $("annonce"); a.textContent = txt; if(petit){ const s = document.createElement("small"); s.textContent = petit; a.appendChild(s); } a.classList.toggle("on", !!txt); annonceT = duree || 0; }
let indiceT = 0;
function indice(txt){ if(annonceT > 0) return; const a = $("annonce"); if(a.textContent !== txt){ a.textContent = txt; a.style.fontSize = "clamp(1.6rem,5vw,2.6rem)"; } a.classList.add("on"); indiceT = .25; }
function majScore(){ $("sA").textContent = match.score[0]; $("sB").textContent = match.score[1]; }
function majHud(){ const t = Math.max(0, match.temps), m = Math.floor(t / 60), s = Math.floor(t % 60); $("temps").textContent = m + ":" + (s < 10 ? "0" : "") + s; }

/* confettis */
const confG = new THREE.BufferGeometry(), NC = 260, confPos = new Float32Array(NC * 3), confV = [];
confG.setAttribute("position", new THREE.BufferAttribute(confPos, 3));
const confCol = new Float32Array(NC * 3); const palette = ["#E5484D", "#FFD23F", "#3D7BD9", "#3FA34D", "#FF8FB8", "#FFFFFF"].map(c => new THREE.Color(c));
for(let i = 0; i < NC; i++){ const c = palette[i % palette.length]; confCol.set([c.r, c.g, c.b], i * 3); confV.push([0, 0, 0]); }
confG.setAttribute("color", new THREE.BufferAttribute(confCol, 3));
const conf = new THREE.Points(confG, new THREE.PointsMaterial({ size: .35, vertexColors: true })); conf.visible = false; scene.add(conf);
function confettis(){
  conf.visible = true;
  for(let i = 0; i < NC; i++){ confPos.set([B.x + (Math.random() - .5) * 8, 8 + Math.random() * 6, B.z + (Math.random() - .5) * 8], i * 3); confV[i] = [(Math.random() - .5) * 4, Math.random() * 3, (Math.random() - .5) * 4]; }
  confG.attributes.position.needsUpdate = true;
}
function majConfettis(dt){
  if(!conf.visible) return;
  for(let i = 0; i < NC; i++){ confV[i][1] -= 6 * dt; confPos[i * 3] += confV[i][0] * dt; confPos[i * 3 + 1] = Math.max(0, confPos[i * 3 + 1] + Math.max(confV[i][1], -3) * dt); confPos[i * 3 + 2] += confV[i][2] * dt; }
  confG.attributes.position.needsUpdate = true;
}
function majFoule(t){
  if(!foule) return;
  const d = new THREE.Object3D(), fort = fete > 0;
  if(!fort && Math.floor(t * 3) % 2) return;
  fouleBase.forEach((b, i) => { d.position.copy(b); d.position.y += fort ? Math.abs(Math.sin(t * 9 + i)) * .6 : (Math.sin(t * 2 + i * 1.7) > .95 ? .25 : 0); d.updateMatrix(); foule.setMatrixAt(i, d.matrix); });
  foule.instanceMatrix.needsUpdate = true;
}

/* ======================= fin de match ======================= */
function finMatch(){
  etat = "fin"; sons.sifflet(3); sons.arreter();
  const [a, b] = match.score, gagne = a > b, nul = a === b;
  annoncer("Fin du match !", 2); voix("Fin du match !");
  const cle = "foot-victoires-" + choix.joueur;
  if(gagne) ecrire(cle, String((parseInt(lire(cle, "0"), 10) || 0) + 1));
  setTimeout(() => {
    $("finEmoji").textContent = gagne ? "🏆" : nul ? "🤝" : "💪";
    $("finTitre").textContent = gagne ? "Victoire !" : nul ? "Match nul !" : "Dommage !";
    $("finScore").textContent = a + " - " + b;
    const v = parseInt(lire(cle, "0"), 10) || 0;
    $("finTexte").textContent = gagne ? "Bravo, champion ! Victoires au total : " + v + " 🏆" : nul ? "Égalité ! La prochaine fois, on gagne !" : "Ce n'est pas grave, on rejoue et on gagne !";
    voix(gagne ? "Victoire !" : nul ? "Match nul !" : "Dommage ! On fera mieux la prochaine fois !");
    $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = false;
    if(gagne){ fete = 4; B.x = 0; B.z = 0; confettis(); }
  }, 1900);
}
function basculerPause(){
  if(etat === "match"){ etat = "pause"; $("ecranPause").hidden = false; sons.arreter(); }
  else if(etat === "pause"){ etat = "match"; $("ecranPause").hidden = true; sons.demarrer(); }
}
$("pause").onclick = basculerPause; $("reprendre").onclick = basculerPause;
$("abandon").onclick = () => { $("ecranPause").hidden = true; allerMenu(); };
$("rejouer").onclick = () => { sons.reveil(); demarrerMatch(); };
$("versMenu").onclick = () => allerMenu();
document.addEventListener("visibilitychange", () => { if(document.hidden && etat === "match") basculerPause(); });

/* ======================= sons ======================= */
const sons = (() => {
  let ctx = null, foule = null, gainFoule = null;
  function reveil(){ if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return; } } if(ctx.state === "suspended") ctx.resume(); }
  function bip(f, d, type, vol, f2){ if(!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol || .1, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + .02); }
  function bruit(d, vol, fr, q){ if(!ctx) return; const t = ctx.currentTime, b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * d), ctx.sampleRate), x = b.getChannelData(0); for(let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 1.5);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = "bandpass"; f.frequency.value = fr || 900; f.Q.value = q || 1; g.gain.value = vol || .2; s.buffer = b; s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t); }
  return {
    reveil,
    demarrer(){ reveil(); if(!ctx || foule) return;
      const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), x = b.getChannelData(0); for(let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1;
      foule = ctx.createBufferSource(); foule.buffer = b; foule.loop = true; const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 700; f.Q.value = .6;
      gainFoule = ctx.createGain(); gainFoule.gain.value = .045; foule.connect(f); f.connect(gainFoule); gainFoule.connect(ctx.destination); foule.start(); },
    arreter(){ if(foule){ try{ foule.stop(); }catch(e){} foule = null; } },
    frappe(p){ bip(160, .18, "sine", .25 + p * .15, 50); bruit(.06, .2, 1800, 1); },
    rebond(){ bip(120, .1, "sine", .12, 60); }, poteau(){ bip(1400, .5, "triangle", .1, 1200); bip(2100, .4, "triangle", .05); },
    tacle(){ bruit(.15, .2, 500); },
    sifflet(n){ for(let k = 0; k < n; k++) setTimeout(() => { if(!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = 2700; l.frequency.value = 38; lg.gain.value = 140; l.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(.05, t); g.gain.setValueAtTime(.05, t + (n === 3 && k === 2 ? .7 : .25)); g.gain.exponentialRampToValueAtTime(.0008, t + (n === 3 && k === 2 ? .8 : .32));
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 4000; o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); l.start(t); o.stop(t + 1); l.stop(t + 1); }, k * 380); },
    but(nous){ if(!ctx || !gainFoule) return; const t = ctx.currentTime; gainFoule.gain.cancelScheduledValues(t); gainFoule.gain.setValueAtTime(gainFoule.gain.value, t);
      gainFoule.gain.linearRampToValueAtTime(nous ? .3 : .09, t + .3); gainFoule.gain.linearRampToValueAtTime(.045, t + 3.5);
      if(nous) [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => bip(f, .3, "triangle", .1), i * 120)); }
  };
})();
const lecteurVoix = new Audio();
function slug(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function voix(t){ try{ lecteurVoix.muted = false; lecteurVoix.src = "sons/" + slug(t) + ".mp3"; const p = lecteurVoix.play(); if(p && p.catch) p.catch(() => {}); }catch(e){} }

/* ======================= menu ======================= */
let vitrine = null;
function majVitrine(){
  if(vitrine) scene.remove(vitrine);
  const J = JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[2], mai = MAILLOTS.find(m => m.id === choix.maillot) || MAILLOTS[0];
  vitrine = creerJoueur({ equipe: 0, maillot: mai.c, short: mai.s, peau: J.peau, cheveux: J.cheveux, numero: J.numero, longs: J.longs });
  scene.add(vitrine);
}
function allerMenu(){
  etat = "menu"; sons.arreter();
  joueurs.forEach(p => scene.remove(p.mesh)); joueurs = []; humain = null; match = null;
  majVitrine();
  $("menu").hidden = false; $("hud").hidden = true; $("tactile").hidden = true; $("ecranFin").hidden = true; $("ecranPause").hidden = true;
  remplirMenu();
}
function boutons(id, liste, cle, rendu, apres){
  const box = $(id); box.innerHTML = "";
  liste.forEach(([val, obj]) => {
    const b = document.createElement("button"); b.innerHTML = rendu(obj); if(choix[cle] === val) b.className = "on";
    b.onclick = () => { sons.reveil(); choix[cle] = val; ecrire("foot-" + cle + (cle === "niveau" ? "-" + choix.joueur : ""), val); if(apres) apres(); remplirMenu(); };
    box.appendChild(b);
  });
}
function remplirMenu(){
  boutons("cJoueur", JOUEURS.map(j => [j.id, j]), "joueur", (j) => '<span class="e">' + j.e + "</span>" + j.nom + " <small>n° " + j.numero + "</small>",
    () => { choix.niveau = lire("foot-niveau-" + choix.joueur, (JOUEURS.find(j => j.id === choix.joueur) || JOUEURS[0]).niveau); majVitrine(); });
  boutons("cNiveau", Object.entries(NIVEAUX), "niveau", (n) => '<span class="e">' + n.e + "</span><span>" + n.nom + "<small>" + n.desc + "</small></span>");
  boutons("cMaillot", MAILLOTS.map(m => [m.id, m]), "maillot", (m) => '<span class="pastille" style="background:' + m.c + '"></span>' + m.nom, majVitrine);
  boutons("cAdv", ADVERSAIRES.map(a => [a.id, a]), "adv", (a) => '<span class="e">' + a.e + "</span>" + a.nom);
  $("aide").innerHTML = ("ontouchstart" in window) ? "Joystick à gauche pour courir, <b>⚽ Tir</b> (garde appuyé = plus fort), <b>➡️ Passe</b>, <b>🏃 Sprint</b>." :
    "<b>Flèches</b> pour courir, <b>Espace</b> pour tirer (garde appuyé pour tirer plus fort), <b>E</b> pour passer, <b>Maj</b> pour sprinter, <b>Échap</b> pause.<br>🎮 <b>Manette</b> : joystick pour courir, <b>✕</b> tirer, <b>○</b> passer, <b>R2</b> sprinter, <b>Options</b> pause.<br>Sans le ballon, <b>✕</b> près d'un adversaire = tacle, et <b>○</b> = changer de joueur.";
}
$("go").onclick = () => {
  sons.reveil();
  try{ lecteurVoix.muted = true; lecteurVoix.src = "sons/but.mp3"; const p = lecteurVoix.play(); if(p && p.then) p.then(() => { lecteurVoix.pause(); lecteurVoix.muted = false; }).catch(() => { lecteurVoix.muted = false; }); }catch(e){}
  demarrerMatch();
};

/* ======================= boucle ======================= */
let fps = { n: 0, t: 0, fait: true }, tAvant = performance.now(), t0 = performance.now();
function boucle(now){
  requestAnimationFrame(boucle);
  let dt = Math.min(.05, (now - tAvant) / 1000); tAvant = now;
  if(TEST && window.__dtFixe) dt = window.__dtFixe;
  const t = (now - t0) / 1000;
  if(etat === "menu" || etat === "fin" || etat === "pause"){
    const m = lireManette();
    if(m && m.nA){ if(etat === "menu") $("go").click(); else if(etat === "fin") $("rejouer").click(); }
    if(m && m.nSTART && etat === "pause") basculerPause();
  }
  if(etat === "menu"){
    const el = $("etatManette"); el.textContent = vraiesManettes().length ? "🎮 Manette connectée ! Appuie sur ✕ pour jouer." : "🎮 Manette branchée ? Appuie sur un de ses boutons pour la réveiller.";
    // le joueur jongle au milieu du terrain, la caméra tourne doucement
    const large = innerWidth > 700;
    vitrine.position.set(0, 0, 0); vitrine.rotation.y = Math.sin(t * .4) * .45 - .15;
    const j = Math.abs(Math.sin(t * 3.2));
    B.x = .25; B.z = .55; B.y = R + .2 + j * 1.6; ballonMesh.position.set(B.x, B.y, B.z); ballonMesh.rotation.x += .05;
    ballonOmbre.position.set(B.x, .03, B.z);
    const u = vitrine.userData; u.jambes[1].rotation.x = j < .25 ? -.8 : 0;
    camera.position.set(Math.sin(t * .15) * 1.5 - (large ? 2.6 : 0), 2.3, 6.2); camera.lookAt(large ? -1.9 : 0, 1.35, 0);
  }else if(etat === "match"){
    maj(dt);
    placer(dt);
    cameraMatch(dt);
    majHud();
    if(annonceT > 0){ annonceT -= dt; if(annonceT <= 0){ annoncer("", 0); $("annonce").style.fontSize = ""; } }
    else if(indiceT > 0){ indiceT -= dt; if(indiceT <= 0){ $("annonce").classList.remove("on"); $("annonce").style.fontSize = ""; } }
    // qualité automatique
    if(!fps.fait){ fps.n++; fps.t += dt; if(fps.t > 4){ if(fps.n / fps.t < 28 && qualite !== "basse"){ qualite = qualite === "haute" ? "moyenne" : "basse"; ecrire("foot-qualite", qualite); appliquerQualite(); fps = { n: 0, t: 0, fait: false }; } else fps.fait = true; } }
  }else if(etat === "fin"){
    placer(dt); joueurs.forEach(p => { if(p.equipe === 0 && match && match.score[0] > match.score[1] && Math.random() < .02) p.saut = 1; });
  }
  if(fete > 0) fete -= dt; else if(conf.visible && etat !== "fin") conf.visible = false;
  majConfettis(dt); majFoule(t);
  renderer.render(scene, camera);
}

/* ======================= démarrage ======================= */
appliquerQualite();
construireStade();
majVitrine(); remplirMenu();
$("chargement").hidden = true; etat = "menu"; $("menu").hidden = false;
requestAnimationFrame(boucle);
if(TEST) window.__jeu = { get etat(){ return etat; }, get match(){ return match; }, get humain(){ return humain; }, get joueurs(){ return joueurs; }, B, choix, demarrerMatch, scene, camera };
