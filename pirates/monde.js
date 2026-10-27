/* Le monde des pirates : une grille de cases (terrain + hauteur) et une liste d'objets.
   Une case = 2 unités de large ; un niveau de hauteur = 1 unité. L'eau est à y = NIVEAU_EAU. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { OBJETS, PAR_ID, formes, creerCoffre, creerPieces, creerBateau, creerCrabe, matV } from "./objets.js";

export const N = 48, T = 2, HMAX = 8, NIVEAU_EAU = -.3, FOND = -2.2;
export const TERRAINS = [
  { id:"eau", nom:"Eau (creuser)", e:"🌊" },
  { id:"sable", nom:"Sable", e:"🏖️", dessus:"#F2D58A", cote:"#DDBB6B" },
  { id:"herbe", nom:"Herbe", e:"🌿", dessus:"#6CC24A", cote:"#8A5A3B" },
  { id:"roche", nom:"Roche", e:"⛰️", dessus:"#9AA0AE", cote:"#7A7F8C" },
  { id:"bois", nom:"Planches", e:"🪵", dessus:"#B07A4A", cote:"#8A5A3B" },
  { id:"neige", nom:"Neige", e:"❄️", dessus:"#F4F8FF", cote:"#C9D6EA" },
  { id:"bloc", nom:"Bloc de couleur", e:"🟪" }
];
export const COULEURS = ["#E5484D", "#FF8FB8", "#FF9F1C", "#FFD23F", "#3FA34D", "#7BE495", "#2BB3C0", "#4CC9F0", "#3D7BD9", "#8E5BC4", "#FFFFFF", "#22232B"];

/* ---------- les données ---------- */
export function mondeVide(nom){
  return { nom: nom || "Mon monde", n: N, t: new Uint8Array(N * N), h: new Uint8Array(N * N), c: new Uint8Array(N * N), objets: [], depart: { x: 0, z: 0 }, prochainId: 1 };
}
export const idx = (i, j) => j * N + i;
export const dedans = (i, j) => i >= 0 && j >= 0 && i < N && j < N;
export const caseX = (x) => Math.floor(x / T + N / 2);
export const centre = (i) => (i - N / 2 + .5) * T;
export function hauteurCase(m, i, j){ if(!dedans(i, j)) return null; const k = idx(i, j); return m.t[k] === 0 ? null : m.h[k]; }
export function ajouterObjet(m, k, i, j, opts){
  const o = Object.assign({ id: m.prochainId++, k, i, j, r: 0, c: 0 }, opts || {});
  m.objets.push(o); return o;
}
export function objetSur(m, i, j){ return m.objets.find(o => o.i === i && o.j === j); }

/* enregistrement : les cases en texte (base64), les objets en tableau */
export function versTexte(m){
  const b = new Uint8Array(N * N * 3);
  for(let k = 0; k < N * N; k++){ b[k * 3] = m.t[k]; b[k * 3 + 1] = m.h[k]; b[k * 3 + 2] = m.c[k]; }
  let s = ""; for(let k = 0; k < b.length; k++) s += String.fromCharCode(b[k]);
  return JSON.stringify({ v: 1, nom: m.nom, auteur: m.auteur || "", cases: btoa(s), objets: m.objets.map(o => [o.k, o.i, o.j, o.r, o.c]), depart: m.depart, date: Date.now() });
}
export function depuisTexte(txt){
  const d = JSON.parse(txt), m = mondeVide(d.nom); m.auteur = d.auteur || "";
  const s = atob(d.cases);
  for(let k = 0; k < N * N; k++){ m.t[k] = s.charCodeAt(k * 3); m.h[k] = s.charCodeAt(k * 3 + 1); m.c[k] = s.charCodeAt(k * 3 + 2); }
  (d.objets || []).forEach(a => { if(PAR_ID[a[0]]) ajouterObjet(m, a[0], a[1], a[2], { r: a[3] || 0, c: a[4] || 0 }); });
  m.depart = d.depart || { x: 0, z: 0 };
  return m;
}

/* ---------- fabriquer des îles ---------- */
function hasard(graine){ let s = graine >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
function bruit(alea){
  const G = 12, v = []; for(let k = 0; k < (G + 1) * (G + 1); k++) v.push(alea());
  return (x, y) => { // x, y entre 0 et 1
    const fx = x * G, fy = y * G, i = Math.min(G - 1, Math.floor(fx)), j = Math.min(G - 1, Math.floor(fy)), u = fx - i, w = fy - j;
    const a = v[j * (G + 1) + i], b = v[j * (G + 1) + i + 1], c = v[(j + 1) * (G + 1) + i], d = v[(j + 1) * (G + 1) + i + 1];
    const su = u * u * (3 - 2 * u), sw = w * w * (3 - 2 * w);
    return a + (b - a) * su + (c - a) * sw + (a - b - c + d) * su * sw;
  };
}
/* une île ronde : centre (ci, cj), rayon r (en cases), hauteur max */
function ile(m, ci, cj, r, hmax, alea, nb){
  for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){
    const d = Math.hypot(i - ci, j - cj) / r + (nb(i / N, j / N) - .5) * .45;
    if(d >= 1) continue;
    const k = idx(i, j), haut = Math.max(1, Math.round(1 + (1 - d) * (1 - d) * hmax + (nb(j / N, i / N) - .5) * 1.5));
    if(m.t[k] && m.h[k] >= haut) continue;
    m.h[k] = haut; m.t[k] = d > .78 || haut <= 1 ? 1 : haut >= hmax - 0 && hmax >= 5 ? 3 : 2;
  }
}
function libre(m, i, j){ return dedans(i, j) && m.t[idx(i, j)] !== 0 && !objetSur(m, i, j); }
function semer(m, alea, k, nb, filtre){
  let n = 0;
  for(let essai = 0; essai < 900 && n < nb; essai++){
    const i = Math.floor(alea() * N), j = Math.floor(alea() * N);
    if(!libre(m, i, j) || (filtre && !filtre(i, j))) continue;
    ajouterObjet(m, k, i, j, { r: Math.floor(alea() * 4) }); n++;
  }
}
function placeEau(m, i0, j0){ // la case d'eau la plus proche (pour poser un bateau)
  for(let r = 0; r < 20; r++) for(let j = j0 - r; j <= j0 + r; j++) for(let i = i0 - r; i <= i0 + r; i++){
    if(!dedans(i, j) || m.t[idx(i, j)] !== 0) continue;
    // assez de place autour pour le bateau
    let ok = true; for(let b = -1; b <= 1 && ok; b++) for(let a = -1; a <= 1; a++) if(!dedans(i + a, j + b) || m.t[idx(i + a, j + b)] !== 0) ok = false;
    if(ok) return [i, j];
  }
  return [i0, j0];
}
export function nouvelleIle(nom){
  const m = mondeVide(nom), alea = hasard(Date.now() & 0xffff), nb = bruit(alea);
  ile(m, 24, 24, 11, 4, alea, nb);
  semer(m, alea, "palmier", 8, (i, j) => m.t[idx(i, j)] === 1 || m.t[idx(i, j)] === 2);
  semer(m, alea, "fleurs", 4, (i, j) => m.t[idx(i, j)] === 2);
  semer(m, alea, "coquillage", 3, (i, j) => m.t[idx(i, j)] === 1);
  const [bi, bj] = placeEau(m, 24, 37); ajouterObjet(m, "bateau", bi, bj, { c: 10 });
  m.depart = { x: centre(24), z: centre(30) };
  return m;
}
export function oceanVide(nom){
  const m = mondeVide(nom);
  for(let j = 22; j < 27; j++) for(let i = 22; i < 27; i++){ const k = idx(i, j); m.t[k] = 1; m.h[k] = 1; }
  m.depart = { x: centre(24), z: centre(24) };
  return m;
}

/* l'île de l'aventure : toujours la même (graine fixe), avec 6 coffres à trouver */
export function ileAventure(){
  const m = mondeVide("L'île au trésor"), alea = hasard(2026), nb = bruit(alea);
  ile(m, 21, 23, 13, 6, alea, nb);        // la grande île, avec une montagne
  ile(m, 39, 10, 5, 3, alea, nb);         // l'île du nord-est (il faut le bateau)
  ile(m, 40, 38, 4, 2, alea, nb);         // la petite île du sud-est (il faut le bateau)
  // un village sur la plage sud : planches, cabanes, ponton
  for(let i = 15; i <= 27; i++) for(let j = 32; j <= 34; j++){ const k = idx(i, j); if(m.t[k]){ m.t[k] = 4; m.h[k] = Math.min(m.h[k], 2); } }
  for(let j = 35; j <= 40; j++){ const k = idx(21, j); m.t[k] = 4; m.h[k] = 1; const k2 = idx(22, j); m.t[k2] = 4; m.h[k2] = 1; }   // le ponton
  // une tour de roche avec un escalier de pierres (il faut sauter de marche en marche ; un coffre en haut)
  for(let j = 17; j <= 18; j++) for(let i = 9; i <= 10; i++){ const k = idx(i, j); m.t[k] = 3; m.h[k] = 6; }
  [[11, 18], [12, 18], [13, 18], [14, 18], [15, 18]].forEach(([i, j], n) => { const k = idx(i, j); const h = 5 - n; if(m.h[k] < h || !m.t[k]){ m.t[k] = 3; m.h[k] = Math.max(1, h); } });
  const coffres = [[21, 23], [10, 17], [39, 10], [40, 38], [26, 31], [7, 27]];
  const hautMont = [21, 23]; // sommet
  coffres.forEach(([i, j]) => { if(!m.t[idx(i, j)]){ m.t[idx(i, j)] = 1; m.h[idx(i, j)] = 1; } ajouterObjet(m, "coffre", i, j); });
  ajouterObjet(m, "cabane", 17, 31, { c: 0 }); ajouterObjet(m, "cabane", 25, 31, { c: 8, r: 1 }); ajouterObjet(m, "tente", 13, 30, { c: 3 });
  ajouterObjet(m, "feu", 20, 30); ajouterObjet(m, "drapeau", 22, 33, { c: 11 }); ajouterObjet(m, "canon", 16, 34, { r: 2 }); ajouterObjet(m, "canon", 26, 34, { r: 2 });
  ajouterObjet(m, "tonneau", 19, 33); ajouterObjet(m, "caisse", 23, 32); ajouterObjet(m, "torche", 20, 35); ajouterObjet(m, "torche", 23, 35);
  ajouterObjet(m, "phare", 39, 8, { c: 0 });
  const [bi, bj] = placeEau(m, 24, 40); ajouterObjet(m, "bateau", bi, bj, { c: 0 });
  semer(m, alea, "palmier", 22, (i, j) => (m.t[idx(i, j)] === 1 || m.t[idx(i, j)] === 2) && Math.hypot(i - hautMont[0], j - hautMont[1]) > 2);
  semer(m, alea, "arbre", 8, (i, j) => m.t[idx(i, j)] === 2 && m.h[idx(i, j)] >= 3);
  semer(m, alea, "rocher", 6, (i, j) => m.t[idx(i, j)] !== 4);
  semer(m, alea, "fleurs", 8, (i, j) => m.t[idx(i, j)] === 2);
  semer(m, alea, "coquillage", 6, (i, j) => m.t[idx(i, j)] === 1);
  semer(m, alea, "crabe", 4, (i, j) => m.t[idx(i, j)] === 1);
  semer(m, alea, "piece", 24, (i, j) => m.t[idx(i, j)] !== 0);
  m.depart = { x: centre(21), z: centre(37) };
  return m;
}

/* ---------- le dessin du monde ---------- */
const geoBoite = new THREE.BoxGeometry(T, 1, T); geoBoite.translate(0, .5, 0);
const COUCHE = .35; // épaisseur de la couche du dessus (herbe, sable…)
export class Rendu {
  constructor(scene){
    this.scene = scene; this.groupe = new THREE.Group(); scene.add(this.groupe);
    this.formes = formes(); this.mats = {}; this.terrain = []; this.inst = []; this.speciaux = new Map();
    this.matV = matV;
    this.matTeinte = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, flatShading: true });
    this.matFlamme = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: "#FF7A00", emissiveIntensity: 1.2, roughness: 1, flatShading: true });
    // la mer : un grand plan qui ondule un peu, et le fond de sable
    const fond = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: "#E9CF8C", roughness: 1 }));
    fond.rotation.x = -Math.PI / 2; fond.position.y = FOND; fond.receiveShadow = true; scene.add(fond);
    const geoEau = new THREE.PlaneGeometry(N * T + 40, N * T + 40, 48, 48); geoEau.rotateX(-Math.PI / 2);
    this.eau = new THREE.Mesh(geoEau, new THREE.MeshStandardMaterial({ color: "#2FA6D9", transparent: true, opacity: .72, roughness: .15, metalness: .1 }));
    this.eau.position.y = NIVEAU_EAU; scene.add(this.eau);
    const loin = new THREE.Mesh(new THREE.RingGeometry(N * T / 2 + 19, 600, 32, 1), new THREE.MeshStandardMaterial({ color: "#2FA6D9", transparent: true, opacity: .8, roughness: .15 }));
    loin.rotation.x = -Math.PI / 2; loin.position.y = NIVEAU_EAU - .02; scene.add(loin);
    this.eauBase = geoEau.attributes.position.array.slice();
  }
  vider(liste){ liste.forEach(o => { this.groupe.remove(o); if(o.isInstancedMesh) o.dispose(); }); liste.length = 0; }

  /* le terrain : 2 InstancedMesh par sorte (la couche du dessus et le dessous) */
  terrainDe(m){
    this.vider(this.terrain);
    const par = {};
    for(let j = 0; j < N; j++) for(let i = 0; i < N; i++){ const k = idx(i, j), t = m.t[k]; if(!t) continue; (par[t] = par[t] || []).push(k); }
    const mat4 = new THREE.Matrix4(), col = new THREE.Color();
    for(const t in par){
      const T_ = TERRAINS[t], liste = par[t], bloc = T_.id === "bloc";
      const couches = bloc ? [["dessus", 0, 1]] : [["cote", 0, 1 - COUCHE / 1], ["dessus", 1, 1]];
      for(const [part] of couches){
        const mesh = new THREE.InstancedMesh(geoBoite, bloc ? (this.mats.bloc = this.mats.bloc || new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: .6 }))
          : (this.mats[t + part] = this.mats[t + part] || new THREE.MeshStandardMaterial({ color: T_[part], roughness: .9 })), liste.length);
        liste.forEach((k, n) => {
          const i = k % N, j = Math.floor(k / N), h = m.h[k];
          const bas = FOND - .1, haut = h;
          let y0, hh;
          if(bloc || part === "cote"){ y0 = bas; hh = (bloc ? haut : haut - COUCHE) - bas; } else { y0 = haut - COUCHE; hh = COUCHE; }
          mat4.makeScale(1, Math.max(.01, hh), 1); mat4.setPosition(centre(i), y0, centre(j)); mesh.setMatrixAt(n, mat4);
          if(bloc){ col.set(COULEURS[m.c[k] % COULEURS.length]); mesh.setColorAt(n, col); }
        });
        mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.terrain = true;
        this.groupe.add(mesh); this.terrain.push(mesh);
      }
    }
  }
  hauteurPose(m, o){ const h = hauteurCase(m, o.i, o.j); return h === null ? NIVEAU_EAU : h; }

  /* les objets : les simples en InstancedMesh, les animés un par un */
  objetsDe(m){
    this.vider(this.inst);
    for(const [, g] of this.speciaux) this.groupe.remove(g); this.speciaux.clear();
    const par = {};
    m.objets.forEach(o => { if(PAR_ID[o.k].special) return; (par[o.k] = par[o.k] || []).push(o); });
    const mat4 = new THREE.Matrix4(), q = new THREE.Quaternion(), un = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
    for(const k in par){
      const f = this.formes[k], liste = par[k];
      const parts = [[f.g, this.matV, false]]; if(f.couleur) parts.push([f.couleur, this.matTeinte, true]); if(f.flamme) parts.push([f.flamme, this.matFlamme, false]);
      for(const [geo, mat, teinte] of parts){
        const mesh = new THREE.InstancedMesh(geo, mat, liste.length);
        liste.forEach((o, n) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.r * Math.PI / 2); mat4.compose(new THREE.Vector3(centre(o.i), this.hauteurPose(m, o), centre(o.j)), q, un); mesh.setMatrixAt(n, mat4);
          if(teinte){ col.set(COULEURS[o.c % COULEURS.length]); mesh.setColorAt(n, col); } });
        if(teinte && !mesh.instanceColor){ /* rien */ }
        mesh.castShadow = mat !== this.matFlamme; mesh.receiveShadow = true; mesh.userData.flamme = mat === this.matFlamme;
        this.groupe.add(mesh); this.inst.push(mesh);
      }
    }
    m.objets.forEach(o => { if(PAR_ID[o.k].special) this.ajouterSpecial(m, o); });
  }
  ajouterSpecial(m, o){
    let g;
    if(o.k === "coffre") g = creerCoffre();
    else if(o.k === "piece") g = creerPieces();
    else if(o.k === "bateau") g = creerBateau(COULEURS[o.c % COULEURS.length]);
    else if(o.k === "crabe") g = creerCrabe();
    g.position.set(centre(o.i), o.k === "bateau" ? NIVEAU_EAU : this.hauteurPose(m, o), centre(o.j));
    g.rotation.y = o.r * Math.PI / 2;
    g.userData.objet = o; g.userData.x0 = g.position.x; g.userData.z0 = g.position.z; g.userData.y0 = g.position.y;
    this.groupe.add(g); this.speciaux.set(o.id, g);
    return g;
  }
  tout(m){ this.terrainDe(m); this.objetsDe(m); }

  /* animations : vagues, flammes, pièces, crabes */
  animer(t, dt){
    const p = this.eau.geometry.attributes.position, b = this.eauBase;
    for(let k = 0; k < p.count; k++){ const x = b[k * 3], z = b[k * 3 + 2]; p.array[k * 3 + 1] = Math.sin(x * .25 + t * 1.3) * .08 + Math.cos(z * .3 + t * 1.1) * .08; }
    p.needsUpdate = true;
    this.matFlamme.emissiveIntensity = 1.1 + Math.sin(t * 13) * .25 + Math.sin(t * 7.3) * .2;
    for(const [, g] of this.speciaux){
      const o = g.userData.objet;
      if(o.k === "piece" && g.visible){ g.rotation.y = t * 2.2; g.children.forEach((c, n) => { c.position.y = 1 + (n % 2) * .25 + Math.sin(t * 3 + n) * .12; }); }
      else if(o.k === "crabe" && !g.userData.pris){
        const ph = t * .6 + o.id; g.position.x = g.userData.x0 + Math.sin(ph) * 1.2;
        g.userData.corps.position.y = Math.abs(Math.sin(t * 9 + o.id)) * .06; g.rotation.y = o.r * Math.PI / 2 + (Math.cos(ph) > 0 ? 0 : 0);
        g.userData.pinces.forEach((pi, n) => { pi.rotation.x = Math.sin(t * 5 + n * 2) * .4; });
      }
      else if(o.k === "bateau" && !g.userData.pilote){ g.position.y = NIVEAU_EAU + Math.sin(t * 1.3 + o.id) * .08; g.rotation.z = Math.sin(t * 1.1 + o.id) * .03; }
      if(o.k === "coffre" && g.userData.ouverture !== undefined && g.userData.ouverture < 1){
        g.userData.ouverture = Math.min(1, g.userData.ouverture + dt * 1.5); g.userData.couvercle.rotation.x = -g.userData.ouverture * 1.9;
        g.userData.tresor.visible = true; g.userData.tresor.position.y = Math.sin(g.userData.ouverture * Math.PI) * .6;
      }
    }
  }
}

/* ---------- les hauteurs pour marcher dessus ---------- */
/* renvoie la hauteur du sol sous (x, z), ou null s'il n'y a que de l'eau */
export function sol(m, x, z, rendu){
  const i = caseX(x), j = caseX(z);
  let h = hauteurCase(m, i, j);
  // on peut grimper sur les caisses, tonneaux, rochers
  for(const o of m.objets){
    const P = PAR_ID[o.k]; if(!P.dessus) continue;
    if(Math.abs(centre(o.i) - x) < P.r + .1 && Math.abs(centre(o.j) - z) < P.r + .1){ const base = hauteurCase(m, o.i, o.j) || 0; h = Math.max(h === null ? -99 : h, base + P.dessus); }
  }
  return h;
}
export { OBJETS, PAR_ID };
