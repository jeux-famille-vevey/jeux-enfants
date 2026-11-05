/* Balade à Vevey en 3D : la vraie ville (OpenStreetMap), ton personnage, les gens qui se promènent, le train et le bateau. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { mergeGeometries } from "../course3d/lib/BufferGeometryUtils.js";
import { profils, avatarDe, creerAvatar, animerAvatar, auHasard } from "../commun/avatar.js";
import { chargerDonnees, interpreter, oublierCarte, limites } from "./carte.js";

const $ = (id) => document.getElementById(id);
const lire = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } };
const ecrire = (k, v) => { try{ localStorage.setItem(k, v); }catch(e){} };
const PARAMS = new URLSearchParams(location.search);
const tactile = matchMedia("(pointer: coarse)").matches || PARAMS.has("tactile");
const ECHELLE = .68;            // nos personnages mesurent ~2,5 ; une personne ~1,7 m

/* ================= le menu : qui se promène ? ================= */
let profil = lire("avatar-profil", "mikael");
if(!profils().some(p => p.id === profil)) profil = profils()[0].id;
function remplirProfils(){
  const box = $("profils"); box.innerHTML = "";
  profils().forEach(p => { const b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
    b.onclick = () => { profil = p.id; ecrire("avatar-profil", profil); remplirProfils(); vitrine(); }; box.appendChild(b); });
}
$("monPerso").onclick = () => { location.href = "../avatar/?profil=" + encodeURIComponent(profil) + "&retour=../vevey/"; };
$("aideMenu").innerHTML = tactile
  ? "👆 Le <b>rond à gauche</b> pour marcher, <b>🏃</b> pour courir, <b>🦘</b> pour sauter. Glisse le doigt sur l'écran pour tourner la caméra."
  : "⌨️ <b>Flèches</b> ou <b>W A S D</b> pour marcher, <b>Maj</b> (la touche ⇧ au-dessus de Ctrl) pour courir, <b>Espace</b> pour sauter. Glisse avec la <b>souris</b> pour tourner la caméra, <b>molette</b> pour zoomer.";

/* ================= la scène 3D ================= */
const canvas = $("c");
const rendu = new THREE.WebGLRenderer({ canvas, antialias: !tactile, powerPreference: "high-performance" });
rendu.setPixelRatio(Math.min(devicePixelRatio || 1, tactile ? 1.25 : 1.5));
rendu.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const CIEL = new THREE.Color("#A8DBFF");
scene.background = CIEL; scene.fog = new THREE.Fog("#CFE9FF", 140, 620);
const camera = new THREE.PerspectiveCamera(55, 1, .3, 4000);
scene.add(new THREE.HemisphereLight("#FFFFFF", "#7A8F6A", 1.6));
const soleil = new THREE.DirectionalLight("#FFF4DE", 2.1); soleil.position.set(-300, 500, 200); scene.add(soleil);
function taille(){ const w = innerWidth, h = innerHeight; rendu.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", taille); taille();

/* la vitrine du menu : le personnage tourne devant le lac */
let persoVitrine = null;
function vitrine(){
  if(persoVitrine){ scene.remove(persoVitrine); persoVitrine = null; }
  const P = profils().find(p => p.id === profil);
  persoVitrine = creerAvatar(avatarDe(profil), { numero: P && P.numero }); persoVitrine.position.set(0, 0, 0); scene.add(persoVitrine);
}
const decorMenu = new THREE.Group(); scene.add(decorMenu);
(function(){ // un petit bout de quai et le lac pour le menu
  const lac = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: "#3E9BD6" })); lac.rotation.x = -Math.PI / 2; lac.position.y = -.4; decorMenu.add(lac);
  const quai = new THREE.Mesh(new THREE.BoxGeometry(14, .6, 6), new THREE.MeshLambertMaterial({ color: "#D9CFBF" })); quai.position.set(0, -.3, 0); decorMenu.add(quai);
})();

/* ================= les montagnes de l'autre côté du lac ================= */
function montagnes(){
  const g = new THREE.Group(), m1 = new THREE.MeshBasicMaterial({ color: "#7D8FB8", fog: false }), m2 = new THREE.MeshBasicMaterial({ color: "#F4F7FF", fog: false });
  for(let i = 0; i < 26; i++){
    const x = -4200 + i * 340 + Math.sin(i * 7.3) * 90, h = 280 + Math.abs(Math.sin(i * 2.1)) * 380, w = 900 + Math.abs(Math.cos(i * 1.7)) * 600;
    const c = new THREE.Mesh(new THREE.ConeGeometry(w / 2, h, 5), m1); c.position.set(x, h / 2 - 60, 5200 + Math.sin(i) * 400); c.rotation.y = i; g.add(c);
    if(h > 480){ const n = new THREE.Mesh(new THREE.ConeGeometry(w / 2 * .28, h * .28, 5), m2); n.position.set(x, h - 60 - h * .14 + 2, 5200 + Math.sin(i) * 400); n.rotation.y = i; g.add(n); }
  }
  return g;
}

/* ================= construire Vevey ================= */
let carte = null, monde = new THREE.Group(); scene.add(monde);
const GRILLE = 30, grilleBat = new Map();     // pour savoir vite quels bâtiments sont près de nous
function cleG(x, z){ return Math.floor(x / GRILLE) + "," + Math.floor(z / GRILLE); }
function dansPoly(x, z, pts){ let d = false; for(let i = 0, j = pts.length - 1; i < pts.length; j = i++){ const a = pts[i], b = pts[j]; if(((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1] + 1e-9) + a[0])) d = !d; } return d; }
function hash(n){ n = Math.imul((n | 0) ^ 0x9E3779B9, 0x85EBCA6B); n ^= n >>> 13; n = Math.imul(n, 0xC2B2AE35); n ^= n >>> 16; return (n >>> 0) / 4294967296; }

/* un ruban (rue, rail, rivière) le long d'une ligne, en triangles */
function ruban(pts, largeur, y, couleur, pos, col){
  const c = new THREE.Color(couleur), w = largeur / 2;
  for(let i = 0; i < pts.length - 1; i++){
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); if(l < .01) continue;
    const nx = -dz / l * w, nz = dx / l * w;
    const q = [[a[0] + nx, a[1] + nz], [a[0] - nx, a[1] - nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz]];
    [[0, 1, 2], [2, 1, 3]].forEach(t => t.forEach(k => { pos.push(q[k][0], y, q[k][1]); col.push(c.r, c.g, c.b); }));
    // un petit rond aux coins pour que les virages soient jolis
    if(i > 0){ for(let s = 0; s < 6; s++){ const t0 = s / 6 * Math.PI * 2, t1 = (s + 1) / 6 * Math.PI * 2;
      pos.push(a[0], y, a[1], a[0] + Math.cos(t1) * w, y, a[1] + Math.sin(t1) * w, a[0] + Math.cos(t0) * w, y, a[1] + Math.sin(t0) * w); for(let k = 0; k < 3; k++) col.push(c.r, c.g, c.b); } }
  }
}
function meshCouleurs(pos, col, opts){
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide }, opts || {}))); return m;
}
function forme(pts){ const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], -p[1]) : s.moveTo(p[0], -p[1])); return s; }
function surfacePlate(pts, y, couleur, pos, col){
  const c = new THREE.Color(couleur), contour = pts.map(p => new THREE.Vector2(p[0], -p[1]));
  if(contour.length > 2 && contour[0].equals(contour[contour.length - 1])) contour.pop();
  if(contour.length < 3) return;
  const tri = THREE.ShapeUtils.triangulateShape(contour, []);
  for(const t of tri) for(const k of t){ pos.push(contour[k].x, y, -contour[k].y); col.push(c.r, c.g, c.b); }
}
function texFenetres(){
  const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d");
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#8EA3C2"; g.fillRect(22, 18, 20, 26); g.fillStyle = "#BFD0E6"; g.fillRect(24, 20, 16, 10); g.fillStyle = "#F4F0E8"; g.fillRect(20, 44, 24, 3);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / 3.4, 1 / 3.1); t.anisotropy = 4; return t;
}
const FACADES = ["#F4E3C1", "#EED9B8", "#F2D0B4", "#E8E2D6", "#F6EAD7", "#DCD3C4", "#F1C9A5", "#E9DDF2", "#D8E8F2", "#F5D5D5", "#FFF1D0", "#E4E9D8"];
const COULEURS_VERTS = { park: "#8CCB72", garden: "#93CF79", playground: "#B5DB7E", pitch: "#6FBF5C", common: "#9CD07F", grass: "#9CD07F", meadow: "#A6D483", vineyard: "#9BC46A",
  forest: "#5E9F4E", wood: "#5E9F4E", recreation_ground: "#94CC76", village_green: "#94CC76", cemetery: "#A9C79A", beach: "#EADBB0", scrub: "#86B865", place: "#E2D6C0" };
const COULEURS_ROUTES = { motorway: "#5E636E", trunk: "#5E636E", primary: "#646975", secondary: "#686D79", tertiary: "#6C717C", unclassified: "#737884", residential: "#737884", living_street: "#8A8F99", service: "#7E838D",
  pedestrian: "#DCCFB6", footway: "#E6D9BE", path: "#D9C9A3", cycleway: "#C98E8E", steps: "#C9BFAE", track: "#C2AF88", bridleway: "#C2AF88" };

function construire(c){
  monde.clear(); grilleBat.clear();
  const L = limites(), cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2, W = L.x1 - L.x0 + 4000, H = L.z1 - L.z0 + 4000;
  // le lac partout, puis la terre par-dessus
  const lac = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshLambertMaterial({ color: "#3E9BD6" })); lac.rotation.x = -Math.PI / 2; lac.position.set(cx, -.5, cz + 2000); monde.add(lac);
  const pos = [], col = [];
  if(c.terre) surfacePlate(c.terre.poly, 0, "#D6D0C2", pos, col);
  else { const p = [[L.x0 - 300, L.z0 - 300], [L.x1 + 300, L.z0 - 300], [L.x1 + 300, L.z1 + 300], [L.x0 - 300, L.z1 + 300]]; surfacePlate(p, 0, "#D6D0C2", pos, col); }
  // un peu de terre autour de la zone (au nord) pour ne pas voir le bord
  surfacePlate([[L.x0 - 3000, L.z0 - 3000], [L.x1 + 3000, L.z0 - 3000], [L.x1 + 3000, L.z0 - 40], [L.x0 - 3000, L.z0 - 40]], -.02, "#A9C98E", pos, col);
  for(const v of c.verts) surfacePlate(v.pts, .03, COULEURS_VERTS[v.type] || "#9CD07F", pos, col);
  for(const e of c.eaux) surfacePlate(e, .05, "#4FA8DD", pos, col);
  for(const r of c.rivieres) ruban(r.pts, r.l, .045, "#4FA8DD", pos, col);
  monde.add(meshCouleurs(pos, col));
  // les rues (les grandes d'abord, les chemins par-dessus)
  const rp = [], rc = [];
  const ordre = c.routes.slice().sort((a, b) => b.l - a.l);
  for(const r of ordre) if(!r.tunnel) ruban(r.pts, r.l, r.l >= 4 ? .07 : .09, COULEURS_ROUTES[r.type] || "#737884", rp, rc);
  monde.add(meshCouleurs(rp, rc));
  // le chemin de fer
  const fp = [], fc = [];
  for(const r of c.rails) if(!r.tunnel){ ruban(r.pts, 3.6, .1, "#8E8170", fp, fc); }
  for(const r of c.rails) if(!r.tunnel){ [-.75, .75].forEach(d => ruban(decaler(r.pts, d), .16, .16, "#D4D8E0", fp, fc)); }
  monde.add(meshCouleurs(fp, fc));
  // les bâtiments : les murs (avec des fenêtres) et les toits
  const murs = [], toits = [];
  for(const b of c.batiments){
    let pts = b.pts.slice(); if(pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if(pts.length < 3) continue;
    let g; try{ g = new THREE.ExtrudeGeometry(forme(pts), { depth: b.h, bevelEnabled: false }); }catch(e){ continue; }
    g.rotateX(-Math.PI / 2);
    const nonIdx = g.index ? g.toNonIndexed() : g; if(nonIdx !== g) g.dispose();
    const facade = new THREE.Color(b.genre === "ecole" ? "#FFD9A0" : b.genre === "eglise" ? "#ECE6DA" : b.genre === "gare" ? "#F2E6CF" : FACADES[Math.floor(hash(b.id) * FACADES.length)]);
    const toit = new THREE.Color(b.h > 16 ? "#9A9EA6" : hash(b.id + 7) < .7 ? "#B9583F" : "#8E8F94");
    const P = nonIdx.attributes.position, UV = nonIdx.attributes.uv, groupes = nonIdx.groups;
    const partie = (debut, nb, couleur, avecUV) => {
      const ge = new THREE.BufferGeometry(), p = new Float32Array(nb * 3), cc = new Float32Array(nb * 3), uv = new Float32Array(nb * 2);
      for(let i = 0; i < nb; i++){ p[i * 3] = P.getX(debut + i); p[i * 3 + 1] = P.getY(debut + i); p[i * 3 + 2] = P.getZ(debut + i); cc[i * 3] = couleur.r; cc[i * 3 + 1] = couleur.g; cc[i * 3 + 2] = couleur.b;
        if(avecUV && UV){ uv[i * 2] = UV.getX(debut + i); uv[i * 2 + 1] = UV.getY(debut + i); } }
      ge.setAttribute("position", new THREE.BufferAttribute(p, 3)); ge.setAttribute("color", new THREE.BufferAttribute(cc, 3)); ge.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return ge;
    };
    for(const gr of groupes){ if(gr.materialIndex === 0) toits.push(partie(gr.start, gr.count, toit, false)); else murs.push(partie(gr.start, gr.count, facade, true)); }
    nonIdx.dispose();
    // pour ne pas traverser les murs
    const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]), boite = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
    const rec = { pts, boite, h: b.h };
    for(let gx = Math.floor(boite[0] / GRILLE); gx <= Math.floor(boite[2] / GRILLE); gx++) for(let gz = Math.floor(boite[1] / GRILLE); gz <= Math.floor(boite[3] / GRILLE); gz++){
      const k = gx + "," + gz; if(!grilleBat.has(k)) grilleBat.set(k, []); grilleBat.get(k).push(rec); }
  }
  const lot = (liste, mat) => { for(let i = 0; i < liste.length; i += 1500){ const g = mergeGeometries(liste.slice(i, i + 1500)); if(!g) continue; g.computeVertexNormals(); monde.add(new THREE.Mesh(g, mat)); } };
  lot(murs, new THREE.MeshLambertMaterial({ vertexColors: true, map: texFenetres() }));
  lot(toits, new THREE.MeshLambertMaterial({ vertexColors: true }));
  murs.forEach(g => g.dispose()); toits.forEach(g => g.dispose());
  // les arbres
  arbres(c);
  // les endroits à visiter (des panneaux)
  panneaux(c);
  // la fourchette dans le lac
  const f = c.lieux.find(l => /fourchette/i.test(l.nom)); if(f) fourchette(f.x, f.z);
  monde.add(montagnes());
  preparerTrain(c); preparerBateau(c); preparerGens(c); minicarte(c);
}
function decaler(pts, d){ return pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [p[0] - dz / l * d, p[1] + dx / l * d]; }); }

function arbres(c){
  const pos = c.arbres.slice();
  // quelques arbres en plus dans les parcs et les forêts
  for(const v of c.verts){ if(!/^(park|garden|forest|wood|common|recreation_ground|cemetery)$/.test(v.type)) continue;
    const xs = v.pts.map(p => p[0]), zs = v.pts.map(p => p[1]), b = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], aire = (b[2] - b[0]) * (b[3] - b[1]);
    const n = Math.min(40, Math.floor(aire / (v.type === "forest" || v.type === "wood" ? 120 : 500)));
    let mis = 0; for(let i = 0; i < n * 3 && mis < n; i++){ const x = b[0] + hash(i * 31 + v.pts.length) * (b[2] - b[0]), z = b[1] + hash(i * 17 + 3 + v.pts.length) * (b[3] - b[1]); if(dansPoly(x, z, v.pts)){ pos.push([x, z]); mis++; } }
  }
  const N = Math.min(pos.length, 2500); if(!N) return;
  const tronc = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .3, 3, 6), new THREE.MeshLambertMaterial({ color: "#8A5A3B" }), N);
  const tete = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 0), new THREE.MeshLambertMaterial({ color: "#4E9A45" }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), coul = new THREE.Color();
  for(let i = 0; i < N; i++){ const k = .8 + hash(i) * .6, p = pos[i];
    m.compose(v.set(p[0], 1.5 * k, p[1]), q, s.set(k, k, k)); tronc.setMatrixAt(i, m);
    m.compose(v.set(p[0], 4.2 * k, p[1]), q.setFromAxisAngle(v.set(0, 1, 0).normalize(), hash(i + 9) * 6), s.set(k, k * 1.15, k)); tete.setMatrixAt(i, m); q.identity();
    tete.setColorAt(i, coul.set(["#4E9A45", "#5BAA4E", "#3F8A3C", "#6BB55A"][Math.floor(hash(i + 3) * 4)])); }
  monde.add(tronc); monde.add(tete);
}
/* les panneaux qui flottent au-dessus des endroits connus */
const EMOJI = { ecole: "🏫", garderie: "🧸", gare: "🚉", musee: "🏛️", oeuvre: "🎨", place: "⛲", jeux: "🛝", culte: "⛪", biblio: "📚", mairie: "🏛️", spectacle: "🎭", fontaine: "⛲", vue: "👀", hopital: "🏥", poste: "📮", pompiers: "🚒", police: "👮" };
const panneauxListe = [];
function etiquette(texte, fond){
  const c = document.createElement("canvas"), g = c.getContext("2d"); g.font = "700 44px Fredoka, Trebuchet MS, sans-serif";
  const w = Math.min(1000, Math.ceil(g.measureText(texte).width) + 50); c.width = w; c.height = 72; g.font = "700 44px Fredoka, Trebuchet MS, sans-serif";
  g.fillStyle = fond || "rgba(29,35,87,.88)"; const r = 30; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, 72, r); g.arcTo(w, 72, 0, 72, r); g.arcTo(0, 72, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
  g.fillStyle = "#FFF8E7"; g.textBaseline = "middle"; g.fillText(texte, 25, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w / 72 * 2.2, 2.2, 1); s.renderOrder = 10; return s;
}
function panneaux(c){
  panneauxListe.length = 0;
  for(const l of c.lieux){
    if(l.genre === "fontaine" || (l.genre === "oeuvre" && !l.nom)) continue;
    const s = etiquette((EMOJI[l.genre] || "📍") + " " + (l.nom || (l.genre === "gare" ? "La gare" : "Place de jeux")));
    s.position.set(l.x, l.genre === "gare" ? 22 : 16, l.z); s.visible = false; monde.add(s); panneauxListe.push(s);
  }
}
function fourchette(x, z){
  const g = new THREE.Group(), metal = new THREE.MeshLambertMaterial({ color: "#D9DEE6" });
  const manche = new THREE.Mesh(new THREE.BoxGeometry(.9, 6, .35), metal); manche.position.y = 3; g.add(manche);
  const tete = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, .35), metal); tete.position.y = 6.6; g.add(tete);
  for(let i = 0; i < 4; i++){ const d = new THREE.Mesh(new THREE.BoxGeometry(.32, 2.8, .3), metal); d.position.set(-.95 + i * .63, 8.6, 0); g.add(d); }
  g.position.set(x, -.5, z); monde.add(g);
}

/* ================= le train qui passe ================= */
let train = null;
function chaineRails(rails){
  const morceaux = rails.filter(r => !r.service && r.type === "rail" && !r.tunnel).map(r => r.pts.slice());
  if(!morceaux.length) return null;
  const long = (p) => p.reduce((s, q, i) => i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0, 0);
  morceaux.sort((a, b) => long(b) - long(a));
  let ch = morceaux.shift(); const proche = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 3;
  for(let essais = 0; essais < 200; essais++){
    let ajoute = false;
    for(let i = 0; i < morceaux.length; i++){ const m = morceaux[i], fin = ch[ch.length - 1], deb = ch[0];
      if(proche(fin, m[0])){ ch = ch.concat(m.slice(1)); } else if(proche(fin, m[m.length - 1])){ ch = ch.concat(m.slice(0, -1).reverse()); }
      else if(proche(deb, m[m.length - 1])){ ch = m.slice(0, -1).concat(ch); } else if(proche(deb, m[0])){ ch = m.slice(1).reverse().concat(ch); } else continue;
      morceaux.splice(i, 1); ajoute = true; break; }
    if(!ajoute) break;
  }
  return ch;
}
function chemin(pts){ const d = [0]; for(let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, d, L: d[d.length - 1] }; }
function pointSur(ch, s){
  s = Math.max(0, Math.min(ch.L, s)); let i = 1; while(i < ch.d.length - 1 && ch.d[i] < s) i++;
  const a = ch.pts[i - 1], b = ch.pts[i], t = (s - ch.d[i - 1]) / ((ch.d[i] - ch.d[i - 1]) || 1);
  return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, ang: Math.atan2(b[0] - a[0], b[1] - a[1]) };
}
function wagon(locomotive){
  const g = new THREE.Group(), rouge = new THREE.MeshLambertMaterial({ color: "#D8322F" }), blanc = new THREE.MeshLambertMaterial({ color: "#F4F4F4" }), vitre = new THREE.MeshLambertMaterial({ color: "#2B3A55" }), gris = new THREE.MeshLambertMaterial({ color: "#5A5F6E" });
  const corps = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.6, 24), rouge); corps.position.y = 2.2; g.add(corps);
  const bande = new THREE.Mesh(new THREE.BoxGeometry(2.95, .9, 23.6), blanc); bande.position.y = 2.7; g.add(bande);
  const fen = new THREE.Mesh(new THREE.BoxGeometry(3, .7, 21), vitre); fen.position.y = 2.75; g.add(fen);
  const toit = new THREE.Mesh(new THREE.BoxGeometry(2.6, .4, 23.4), gris); toit.position.y = 3.65; g.add(toit);
  const bas = new THREE.Mesh(new THREE.BoxGeometry(2.4, .7, 22), gris); bas.position.y = .6; g.add(bas);
  if(locomotive){ const nez = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.6, 2), rouge); nez.position.set(0, 1.9, 12.6); g.add(nez); const pare = new THREE.Mesh(new THREE.BoxGeometry(2.4, .9, .2), vitre); pare.position.set(0, 3, 12.1); g.add(pare);
    const ph = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, .1), new THREE.MeshBasicMaterial({ color: "#FFF6B0" })); [-.9, .9].forEach(x => { const p = ph.clone(); p.position.set(x, 1.6, 13.62); g.add(p); }); }
  return g;
}
function preparerTrain(c){
  const pts = chaineRails(c.rails); if(!pts || pts.length < 2){ train = null; return; }
  const ch = chemin(pts); if(ch.L < 200){ train = null; return; }
  const wagons = [wagon(true), wagon(false), wagon(false), wagon(false)]; wagons.forEach(w => monde.add(w));
  train = { ch, wagons, s: -120, sens: 1, pause: 4, vitesse: 16, klaxon: false };
}
function animerTrain(dt){
  if(!train) return;
  const t = train;
  if(t.pause > 0){ t.pause -= dt; } else { t.s += t.sens * t.vitesse * dt; }
  if(t.s > t.ch.L + 140 && t.sens > 0){ t.sens = -1; t.pause = 6 + Math.random() * 8; t.klaxon = false; }
  if(t.s < -140 && t.sens < 0){ t.sens = 1; t.pause = 6 + Math.random() * 8; t.klaxon = false; }
  t.wagons.forEach((w, i) => {
    const s = t.s - t.sens * i * 25, p = pointSur(t.ch, s), visible = s > -30 && s < t.ch.L + 30;
    w.visible = visible; w.position.set(p.x, 0, p.z); w.rotation.y = p.ang + (t.sens < 0 ? Math.PI : 0);
  });
  // le train klaxonne quand il approche de nous
  const tete = pointSur(t.ch, t.s); if(!t.klaxon && t.pause <= 0 && joueur && Math.hypot(tete.x - joueur.position.x, tete.z - joueur.position.z) < 160){ t.klaxon = true; son("klaxon"); }
}

/* ================= le bateau sur le lac ================= */
let bateau = null;
function preparerBateau(c){
  if(!c.terre){ bateau = null; return; }
  const bord = c.terre.bord, pts = [];
  for(let i = 0; i < bord.length; i += 10) pts.push([bord[i][0], bord[i][1] + 260]);
  if(pts.length < 3) return;
  const g = new THREE.Group(), blanc = new THREE.MeshLambertMaterial({ color: "#FAFAF5" }), bleu = new THREE.MeshLambertMaterial({ color: "#2E5D9F" }), jaune = new THREE.MeshLambertMaterial({ color: "#F2C14E" });
  const coque = new THREE.Mesh(new THREE.BoxGeometry(9, 2.4, 60), blanc); coque.position.y = .8; g.add(coque);
  const bande = new THREE.Mesh(new THREE.BoxGeometry(9.1, .6, 60.2), bleu); bande.position.y = .1; g.add(bande);
  const pont = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 36), blanc); pont.position.y = 3.3; g.add(pont);
  const fen = new THREE.Mesh(new THREE.BoxGeometry(7.1, .9, 33), new THREE.MeshLambertMaterial({ color: "#3A4A66" })); fen.position.y = 3.6; g.add(fen);
  [-6, 6].forEach(z => { const ch = new THREE.Mesh(new THREE.CylinderGeometry(.8, .9, 5, 12), jaune); ch.position.set(0, 7, z); g.add(ch); });
  [-1, 1].forEach(s => { const r = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1.4, 16), bleu); r.rotation.z = Math.PI / 2; r.position.set(s * 5, 1.6, 0); g.add(r); });
  const drap = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.2, 1.8), new THREE.MeshLambertMaterial({ color: "#E5484D" })); drap.position.set(0, 10, -26); g.add(drap);
  monde.add(g);
  bateau = { g, ch: chemin(pts), s: 0, sens: 1 };
}
function animerBateau(dt, t){
  if(!bateau) return; const b = bateau; b.s += b.sens * 6 * dt;
  if(b.s > b.ch.L){ b.sens = -1; } if(b.s < 0){ b.sens = 1; }
  const p = pointSur(b.ch, b.s); b.g.position.set(p.x, -.3 + Math.sin(t * 1.2) * .15, p.z); b.g.rotation.y = p.ang + (b.sens < 0 ? Math.PI : 0); b.g.rotation.z = Math.sin(t * .9) * .02;
}

/* ================= les gens qui se promènent ================= */
const PHRASES = ["Bonjour !", "Salut !", "Il fait beau à Vevey !", "Tu vas où ?", "Bonne promenade !", "J'adore le lac !", "Tu as vu le train ?", "Coucou !", "Bonne journée !", "On se voit au marché ?"];
let gens = [];
function preparerGens(c){
  gens.forEach(p => monde.remove(p.g)); gens = [];
  const chemins = c.routes.filter(r => /^(footway|pedestrian|path|living_street|residential)$/.test(r.type) && r.pts.length >= 2).map(r => chemin(r.pts)).filter(ch => ch.L > 25);
  if(!chemins.length) return;
  const N = tactile ? 18 : 30;
  for(let i = 0; i < N; i++){
    const ch = chemins[Math.floor(hash(i * 13 + 5) * chemins.length)];
    const cfg = auHasard(), g = creerAvatar(cfg, {}); g.scale.setScalar(ECHELLE * (.85 + hash(i) * .25)); monde.add(g);
    gens.push({ g, ch, s: hash(i + 1) * ch.L, sens: hash(i + 2) < .5 ? 1 : -1, v: 1.1 + hash(i + 3) * .7, t: hash(i) * 10, bulle: null, bulleT: 0 });
  }
}
function animerGens(dt){
  if(!joueur) return;
  const jx = joueur.position.x, jz = joueur.position.z;
  for(const p of gens){
    const d = Math.hypot(p.g.position.x - jx, p.g.position.z - jz);
    p.g.visible = d < 230; if(!p.g.visible && p.g.position.lengthSq() > 0) continue;
    const proche = d < 3.2;
    if(proche){ // il s'arrête, se tourne vers nous et nous dit bonjour
      p.g.rotation.y = Math.atan2(jx - p.g.position.x, jz - p.g.position.z);
      animerAvatar(p.g, (p.t += dt), "salut");
      if(!p.bulle){ p.bulle = etiquette("💬 " + PHRASES[Math.floor(Math.random() * PHRASES.length)], "rgba(255,111,159,.92)"); p.bulle.position.y = 2.45 / p.g.scale.y; p.bulle.scale.multiplyScalar(.6 / 2.2 / p.g.scale.y); p.g.add(p.bulle); son("bonjour"); }
      p.bulleT = 3; continue;
    }
    if(p.bulle && (p.bulleT -= dt) <= 0){ p.g.remove(p.bulle); p.bulle = null; }
    p.s += p.sens * p.v * dt; if(p.s > p.ch.L){ p.s = p.ch.L; p.sens = -1; } if(p.s < 0){ p.s = 0; p.sens = 1; }
    const q = pointSur(p.ch, p.s); p.g.position.set(q.x + 0, 0, q.z); p.g.rotation.y = q.ang + (p.sens < 0 ? Math.PI : 0);
    animerAvatar(p.g, (p.t += dt * 7 * p.v / 1.4), "course", 3);
  }
}

/* ================= toi ================= */
let joueur = null, vy = 0, sol = true, cam = { yaw: Math.PI, pitch: .42, dist: 9 };
function creerJoueur(){
  if(joueur) scene.remove(joueur);
  const P = profils().find(p => p.id === profil);
  joueur = creerAvatar(avatarDe(profil), { numero: P && P.numero }); joueur.scale.setScalar(ECHELLE); scene.add(joueur);
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(.7, 16), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: .22, depthWrite: false })); ombre.rotation.x = -Math.PI / 2; ombre.position.y = .2 / ECHELLE; joueur.add(ombre);
}
function bloque(x, z){
  // pas dans les bâtiments
  for(const [dx, dz] of [[0, 0], [.35, 0], [-.35, 0], [0, .35], [0, -.35]]){
    const l = grilleBat.get(cleG(x + dx, z + dz)); if(!l) continue;
    for(const b of l){ if(x + dx < b.boite[0] || x + dx > b.boite[2] || z + dz < b.boite[1] || z + dz > b.boite[3]) continue; if(dansPoly(x + dx, z + dz, b.pts)) return true; }
  }
  // pas dans le lac
  if(carte && carte.terre){ const bord = carte.terre.bord, k = Math.round(x / 6); let lo = 0, hi = bord.length - 1;
    while(lo < hi){ const m = (lo + hi) >> 1; if(bord[m][0] / 6 < k) lo = m + 1; else hi = m; }
    const b = bord[lo]; if(b && Math.abs(b[0] - x) < 30 && z > b[1] + .5) return true; }
  const L = limites(); if(x < L.x0 - 100 || x > L.x1 + 100 || z < L.z0 - 100 || z > L.z1 + 100) return true;
  return false;
}
function placerA(x, z){
  // on cherche un endroit libre tout près (pas dans une maison)
  for(let r = 0; r < 60; r += 2) for(let a = 0; a < 12; a++){ const px = x + Math.cos(a / 12 * Math.PI * 2) * r, pz = z + Math.sin(a / 12 * Math.PI * 2) * r; if(!bloque(px, pz)){ joueur.position.set(px, 0, pz); return; } if(r === 0) break; }
  joueur.position.set(x, 0, z);
}

/* ================= les commandes ================= */
const touches = {};
addEventListener("keydown", (e) => { touches[e.code] = true; if(etat === "jeu" && ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault(); });
addEventListener("keyup", (e) => { touches[e.code] = false; });
addEventListener("blur", () => { for(const k in touches) touches[k] = false; });
let joy = { x: 0, y: 0, id: null }, sautT = false, courseT = false;
(function(){
  const j = $("joy"), bouton = j.firstElementChild;
  const bouger = (e) => { const r = j.getBoundingClientRect(); let dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(dx, dy); if(l > 1){ dx /= l; dy /= l; } joy.x = dx; joy.y = dy; bouton.style.transform = "translate(" + dx * 40 + "px," + dy * 40 + "px)"; };
  j.addEventListener("pointerdown", (e) => { joy.id = e.pointerId; try{ j.setPointerCapture(e.pointerId); }catch(er){} bouger(e); e.preventDefault(); });
  j.addEventListener("pointermove", (e) => { if(e.pointerId === joy.id) bouger(e); });
  const fin = (e) => { if(e.pointerId !== joy.id) return; joy = { x: 0, y: 0, id: null }; bouton.style.transform = ""; };
  j.addEventListener("pointerup", fin); j.addEventListener("pointercancel", fin);
  $("tSaut").addEventListener("pointerdown", (e) => { sautT = true; e.preventDefault(); });
  $("tCourse").addEventListener("pointerdown", (e) => { courseT = !courseT; $("tCourse").classList.toggle("on", courseT); e.preventDefault(); });
})();
let glisse = null;
canvas.addEventListener("pointerdown", (e) => { if(etat === "jeu"){ glisse = { id: e.pointerId, x: e.clientX, y: e.clientY }; try{ canvas.setPointerCapture(e.pointerId); }catch(er){} } });
canvas.addEventListener("pointermove", (e) => { if(glisse && e.pointerId === glisse.id){ cam.yaw -= (e.clientX - glisse.x) * .006; cam.pitch = Math.max(.08, Math.min(1.3, cam.pitch + (e.clientY - glisse.y) * .004)); glisse.x = e.clientX; glisse.y = e.clientY; } });
const finGlisse = (e) => { if(glisse && e.pointerId === glisse.id) glisse = null; };
canvas.addEventListener("pointerup", finGlisse); canvas.addEventListener("pointercancel", finGlisse);
canvas.addEventListener("wheel", (e) => { if(etat === "jeu"){ cam.dist = Math.max(3.5, Math.min(40, cam.dist * (e.deltaY > 0 ? 1.1 : .9))); e.preventDefault(); } }, { passive: false });

/* ================= les sons ================= */
let ac = null, sonOn = lire("vevey-son") !== "0";
function son(n){
  if(!sonOn) return;
  try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === "suspended") ac.resume();
    const note = (f, t0, d, type, v) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0; o.type = type || "sine"; o.frequency.value = f; g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .05); };
    if(n === "klaxon"){ note(440, 0, .7, "sawtooth", .05); note(554, 0, .7, "sawtooth", .04); note(440, .8, .9, "sawtooth", .05); note(370, .8, .9, "sawtooth", .04); }
    if(n === "bonjour"){ note(660, 0, .12, "triangle", .08); note(880, .12, .18, "triangle", .08); }
    if(n === "saut"){ note(400, 0, .12, "sine", .1); note(700, .05, .12, "sine", .08); }
    if(n === "ding"){ note(1046, 0, .3); note(1318, .1, .4); }
  }catch(e){}
}
$("sonBtn").onclick = () => { sonOn = !sonOn; ecrire("vevey-son", sonOn ? "1" : "0"); $("sonBtn").textContent = sonOn ? "🔊" : "🔇"; };
$("sonBtn").textContent = sonOn ? "🔊" : "🔇";

/* ================= la mini-carte ================= */
let fondCarte = null, echCarte = 1;
function minicarte(c){
  const L = limites(), W = 600, H = Math.round(600 * (L.z1 - L.z0) / (L.x1 - L.x0)); echCarte = W / (L.x1 - L.x0);
  const can = document.createElement("canvas"); can.width = W; can.height = H; const g = can.getContext("2d");
  g.fillStyle = "#3E9BD6"; g.fillRect(0, 0, W, H);
  const px = (p) => [(p[0] - L.x0) * echCarte, (p[1] - L.z0) * echCarte];
  const poly = (pts, f) => { g.beginPath(); pts.forEach((p, i) => { const q = px(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = f; g.fill(); };
  if(c.terre) poly(c.terre.poly, "#E8E2D2"); else { g.fillStyle = "#E8E2D2"; g.fillRect(0, 0, W, H); }
  c.verts.forEach(v => poly(v.pts, "#A9D88F"));
  c.routes.forEach(r => { g.beginPath(); r.pts.forEach((p, i) => { const q = px(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.strokeStyle = r.l >= 4 ? "#FFFFFF" : "#E9D9B4"; g.lineWidth = Math.max(1, r.l * echCarte); g.stroke(); });
  c.rails.forEach(r => { g.beginPath(); r.pts.forEach((p, i) => { const q = px(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.strokeStyle = "#8E8170"; g.lineWidth = 2; g.stroke(); });
  c.batiments.forEach(b => poly(b.pts, "#C9B9A6"));
  fondCarte = can; $("carte").width = 220; $("carte").height = Math.round(220 * H / W);
}
function dessinerMinicarte(){
  if(!fondCarte || !joueur) return;
  const cv = $("carte"), g = cv.getContext("2d"), L = limites(), k = cv.width / fondCarte.width;
  g.drawImage(fondCarte, 0, 0, cv.width, cv.height);
  if(train){ const p = pointSur(train.ch, train.s); g.fillStyle = "#D8322F"; g.fillRect((p.x - L.x0) * echCarte * k - 3, (p.z - L.z0) * echCarte * k - 3, 6, 6); }
  const x = (joueur.position.x - L.x0) * echCarte * k, y = (joueur.position.z - L.z0) * echCarte * k;
  g.save(); g.translate(x, y); g.rotate(-joueur.rotation.y + Math.PI); g.fillStyle = "#FF2E63"; g.strokeStyle = "#fff"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 6); g.lineTo(0, 3); g.lineTo(-6, 6); g.closePath(); g.fill(); g.stroke(); g.restore();
}

/* ================= aller à un endroit ================= */
const NOMS_GENRES = { gare: "La gare", place: "Les places", ecole: "Les écoles", garderie: "Les garderies", musee: "Les musées", oeuvre: "Les œuvres d'art", jeux: "Les places de jeux", culte: "Les églises", biblio: "Les bibliothèques", mairie: "La mairie", spectacle: "Théâtre et cinéma", vue: "À voir", hopital: "L'hôpital", poste: "La poste", pompiers: "Les pompiers", police: "La police" };
function remplirEndroits(){
  const box = $("listeEndroits"); box.innerHTML = "";
  const ordre = ["gare", "place", "ecole", "garderie", "jeux", "musee", "oeuvre", "vue", "biblio", "mairie", "spectacle", "culte", "poste", "pompiers", "police", "hopital"];
  ordre.forEach(gn => {
    const l = carte.lieux.filter(x => x.genre === gn && (x.nom || gn === "gare" || gn === "jeux")); if(!l.length) return;
    const h = document.createElement("h3"); h.textContent = (EMOJI[gn] || "📍") + " " + (NOMS_GENRES[gn] || gn); box.appendChild(h);
    const d = document.createElement("div"); d.className = "puces"; box.appendChild(d);
    l.slice(0, 30).forEach((x, i) => { const b = document.createElement("button"); b.textContent = x.nom || (gn === "jeux" ? "Place de jeux " + (i + 1) : "La gare");
      b.onclick = () => { $("endroits").hidden = true; placerA(x.x, x.z + 8); cam.yaw = Math.PI; son("ding"); message("📍 " + b.textContent); }; d.appendChild(b); });
  });
  if(carte.terre){ const h = document.createElement("h3"); h.textContent = "🌊 Le bord du lac"; box.appendChild(h); const d = document.createElement("div"); d.className = "puces"; box.appendChild(d);
    const b = document.createElement("button"); b.textContent = "Le quai"; b.onclick = () => { $("endroits").hidden = true; const bord = carte.terre.bord, p = bord[Math.floor(bord.length / 2)]; placerA(p[0], p[1] - 6); cam.yaw = 0; son("ding"); message("🌊 Le bord du lac"); }; d.appendChild(b); }
}
$("btnEndroits").onclick = () => { $("endroits").hidden = !$("endroits").hidden; };
$("fermerEndroits").onclick = () => { $("endroits").hidden = true; };
function message(t, s){ const m = $("message"); m.textContent = t; m.classList.add("on"); clearTimeout(message.m); message.m = setTimeout(() => m.classList.remove("on"), (s || 2.5) * 1000); }
/* le nom de la rue où l'on est */
function rueIci(){
  if(!carte) return ""; const x = joueur.position.x, z = joueur.position.z; let best = null, dmin = 18;
  for(const r of carte.routes){ if(!r.nom) continue; const p = r.pts;
    for(let i = 1; i < p.length; i++){ const a = p[i - 1], b = p[i], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1; const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
      const d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z); if(d < dmin){ dmin = d; best = r.nom; } } }
  return best;
}

/* ================= démarrer ================= */
let etat = "menu";
async function demarrer(){
  $("menu").hidden = true; $("chargement").hidden = false; $("erreur").hidden = true;
  try{
    if(!carte){
      const d = await chargerDonnees((t, p) => { $("chargeTexte").textContent = t; $("barre").style.width = Math.round(p * 100) + "%"; });
      $("chargeTexte").textContent = "🏗️ Je construis Vevey…"; $("barre").style.width = "70%";
      await new Promise(r => setTimeout(r, 30));
      carte = interpreter(d); window.__carte = carte;
      construire(carte); remplirEndroits();
    }
    $("barre").style.width = "100%";
    if(persoVitrine){ scene.remove(persoVitrine); persoVitrine = null; } decorMenu.visible = false;
    creerJoueur();
    const gare = carte.lieux.find(l => l.genre === "gare" && /^vevey$/i.test(l.nom)) || carte.lieux.find(l => l.genre === "gare");
    placerA(gare ? gare.x : 0, gare ? gare.z + 12 : 0);
    etat = "jeu"; $("chargement").hidden = true; $("hud").hidden = false; $("tactile").hidden = !tactile;
    message("👋 Bienvenue à Vevey ! " + (tactile ? "Le rond à gauche pour marcher." : "Les flèches pour marcher."), 4);
  }catch(e){
    $("chargement").hidden = true; $("erreur").hidden = false;
    $("erreurTexte").textContent = "Je n'arrive pas à télécharger la carte de Vevey (" + (e && e.message || e) + "). Vérifie qu'Internet marche, puis réessaie dans une minute.";
  }
}
$("jouer").onclick = demarrer;
$("reessayer").onclick = demarrer;
$("retourMenu").onclick = () => { $("erreur").hidden = true; $("menu").hidden = false; };
$("versMenu").onclick = () => { etat = "menu"; $("hud").hidden = true; $("tactile").hidden = true; $("menu").hidden = false; if(joueur){ scene.remove(joueur); joueur = null; } monde.visible = false; decorMenu.visible = true; vitrine(); };
$("rafraichir").onclick = async () => { await oublierCarte(); carte = null; message("La carte sera téléchargée à nouveau."); $("rafraichir").textContent = "✅ Elle sera re-téléchargée"; };

/* ================= la boucle ================= */
let avant = performance.now(), temps = 0, tPas = 0, tRue = 0;
function boucle(maintenant){
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant; temps += dt;
  if(etat === "menu"){
    monde.visible = false;
    if(persoVitrine){ persoVitrine.rotation.y += dt * .6; animerAvatar(persoVitrine, temps, "repos"); }
    camera.position.set(Math.sin(temps * .1) * 1.2, 2.2, 6.5); camera.lookAt(0, 1.4, 0);
  } else if(etat === "jeu" && joueur){
    monde.visible = true;
    // se déplacer par rapport à la caméra
    let ax = 0, az = 0;
    if(touches.ArrowLeft || touches.KeyA) ax -= 1; if(touches.ArrowRight || touches.KeyD) ax += 1;
    if(touches.ArrowUp || touches.KeyW) az += 1; if(touches.ArrowDown || touches.KeyS) az -= 1;
    if(joy.id !== null){ ax += joy.x; az -= joy.y; }
    const court = touches.ShiftLeft || touches.ShiftRight || courseT, vit = court ? 9 : 4.2, l = Math.min(1, Math.hypot(ax, az));
    if(l > .05){
      const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
      let dx = (fx * az + rx * ax) / (Math.hypot(ax, az) || 1), dz = (fz * az + rz * ax) / (Math.hypot(ax, az) || 1);
      const pas = vit * l * dt, nx = joueur.position.x + dx * pas, nz = joueur.position.z + dz * pas;
      if(!bloque(nx, nz)){ joueur.position.x = nx; joueur.position.z = nz; }
      else if(!bloque(nx, joueur.position.z)) joueur.position.x = nx;
      else if(!bloque(joueur.position.x, nz)) joueur.position.z = nz;
      const cible = Math.atan2(dx, dz); let d = cible - joueur.rotation.y; while(d > Math.PI) d -= Math.PI * 2; while(d < -Math.PI) d += Math.PI * 2; joueur.rotation.y += d * Math.min(1, dt * 12);
      tPas += dt * (court ? 13 : 8.5); animerAvatar(joueur, tPas, "course", court ? 7 : 3.5);
    } else animerAvatar(joueur, temps, "repos");
    if((touches.Space || sautT) && sol){ vy = 6; sol = false; son("saut"); } sautT = false;
    if(!sol){ vy -= 18 * dt; joueur.position.y += vy * dt; if(joueur.position.y <= 0){ joueur.position.y = 0; sol = true; vy = 0; } }
    // la caméra suit, derrière
    const cx = joueur.position.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist, cz = joueur.position.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist, cy = 1.4 + Math.sin(cam.pitch) * cam.dist;
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 8)); camera.lookAt(joueur.position.x, joueur.position.y + 1.3, joueur.position.z);
    animerTrain(dt); animerBateau(dt, temps); animerGens(dt);
    for(const s of panneauxListe){ const d = Math.hypot(s.position.x - joueur.position.x, s.position.z - joueur.position.z); s.visible = d < 260; }
    if((tRue -= dt) <= 0){ tRue = .5; const r = rueIci(); $("rue").textContent = r ? "📍 " + r : "📍 Vevey"; dessinerMinicarte(); }
  }
  rendu.render(scene, camera);
  requestAnimationFrame(boucle);
}
remplirProfils(); vitrine(); requestAnimationFrame(boucle);
if(PARAMS.has("jouer")) demarrer();
window.__vevey = { get joueur(){ return joueur; }, get carte(){ return carte; }, get train(){ return train; }, get gens(){ return gens; }, touches, cam, placerA, bloque };
