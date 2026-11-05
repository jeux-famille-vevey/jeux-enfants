/* Le vrai Vevey en 3D avec les données officielles suisses (© swisstopo, gratuites) :
   - les bâtiments en 3D avec leurs vrais toits (swissBUILDINGS3D) et les arbres (végétation 3D),
   - la photo aérienne (SWISSIMAGE) posée sur le vrai relief (les altitudes du modèle de terrain).
   Si quelque chose ne marche pas (pas d'Internet…), le jeu garde la ville simple d'OpenStreetMap. */
import * as THREE from "three";
import { TilesRenderer, WGS84_ELLIPSOID } from "./lib/3d-tiles/index.three.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { CENTRE, ZONE, versLocal } from "./carte.js";

const URL_BATIMENTS = "https://3d.geo.admin.ch/ch.swisstopo.swissbuildings3d.3d/v1/tileset.json";
const URL_ARBRES = "https://3d.geo.admin.ch/ch.swisstopo.vegetation.3d/v1/tileset.json";
const URL_PROFIL = "https://api3.geo.admin.ch/rest/services/profile.json";
const URL_PHOTO = (z, x, y) => "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/" + z + "/" + x + "/" + y + ".jpeg";
const GEOIDE = 49.6;            // à Vevey, l'altitude « GPS » est ~49,6 m plus haute que l'altitude sur les cartes suisses
const LAC = 372.0;              // le niveau du Léman (m)
const CLE = "vevey-suisse-v1";
const essai = new URLSearchParams(location.search).get("suisse");   // pour les tests : une autre adresse pour les données
const U = (u) => essai ? u.replace(/^https:\/\/[^/]+/, essai) : u;

/* ---------- de WGS84 aux coordonnées suisses LV95 (formules approchées de swisstopo, précision ~1 m) ---------- */
function versLV95(lat, lon){
  const p = (lat * 3600 - 169028.66) / 10000, l = (lon * 3600 - 26782.5) / 10000;
  const E = 2600072.37 + 211455.93 * l - 10938.51 * l * p - .36 * l * p * p - 44.54 * l * l * l;
  const N = 1200147.07 + 308807.95 * p + 3745.25 * l * l + 76.63 * p * p - 194.56 * l * l * p + 119.79 * p * p * p;
  return [E, N];
}
function versLatLon(x, z){ const KX = Math.cos(CENTRE.lat * Math.PI / 180) * 111320, KZ = 110540; return [CENTRE.lat - z / KZ, CENTRE.lon + x / KX]; }

/* ---------- le cache sur l'appareil ---------- */
function base(){ return new Promise((ok) => { try{ const r = indexedDB.open("vevey-3d", 1); r.onupgradeneeded = () => r.result.createObjectStore("cache"); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); }catch(e){ ok(null); } }); }
async function lire(k){ const b = await base(); if(!b) return null; return new Promise((ok) => { try{ const r = b.transaction("cache").objectStore("cache").get(k); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }catch(e){ ok(null); } }); }
async function ecrire(k, v){ const b = await base(); if(!b) return; try{ b.transaction("cache", "readwrite").objectStore("cache").put(v, k); }catch(e){} }
export async function oublierSuisse(){ const b = await base(); if(b) try{ const s = b.transaction("cache", "readwrite").objectStore("cache"); s.delete(CLE + "-relief"); s.delete(CLE + "-photo"); }catch(e){} }

/* ---------- le relief : une grille d'altitudes (le service « profil » de geo.admin.ch, une ligne à la fois) ---------- */
const COLS = 97, LIGNES = 45;
async function relief(progres){
  const c = await lire(CLE + "-relief"); if(c && c.h && c.h.length === COLS * LIGNES) return c;
  const [x0, z0] = versLocal(ZONE.n, ZONE.w), [x1, z1] = versLocal(ZONE.s, ZONE.e);
  const h = new Float32Array(COLS * LIGNES);
  let fait = 0;
  const ligne = async (j) => {
    const z = z0 + (z1 - z0) * j / (LIGNES - 1);
    const a = versLV95(...versLatLon(x0, z)), b = versLV95(...versLatLon(x1, z));
    const geom = JSON.stringify({ type: "LineString", coordinates: [a, b] });
    const url = U(URL_PROFIL) + "?sr=2056&nb_points=" + COLS + "&distinct_points=true&geom=" + encodeURIComponent(geom);
    let d = null;
    for(let essai = 0; essai < 3 && !d; essai++){ try{ const r = await fetch(url); if(r.ok) d = await r.json(); }catch(e){} if(!d) await new Promise(r => setTimeout(r, 800)); }
    if(!d || !d.length) throw new Error("relief");
    const longueur = d[d.length - 1].dist || 1;
    const alt = (p) => { const v = p.alts || {}; return v.COMB ?? v.DTM2 ?? v.DTM25 ?? Object.values(v)[0]; };
    for(let i = 0; i < COLS; i++){ // on reprend le point le plus proche à la bonne distance
      const cible = longueur * i / (COLS - 1); let k = 0; while(k < d.length - 1 && d[k + 1].dist <= cible) k++;
      const p0 = d[k], p1 = d[Math.min(d.length - 1, k + 1)], t = p1.dist > p0.dist ? (cible - p0.dist) / (p1.dist - p0.dist) : 0;
      h[j * COLS + i] = alt(p0) + (alt(p1) - alt(p0)) * Math.max(0, Math.min(1, t));
    }
    fait++; progres && progres("⛰️ Je mesure les collines de Vevey… " + Math.round(fait / LIGNES * 100) + " %", .55 + fait / LIGNES * .15);
  };
  for(let j = 0; j < LIGNES; j += 5) await Promise.all([0, 1, 2, 3, 4].filter(k => j + k < LIGNES).map(k => ligne(j + k)));
  const res = { h, x0, z0, x1, z1 }; ecrire(CLE + "-relief", res); return res;
}

/* ---------- la photo aérienne : les tuiles SWISSIMAGE collées dans une grande image ---------- */
const ZOOM = 17;
function tuile(lat, lon, z){ const n = 2 ** z, x = (lon + 180) / 360 * n, s = Math.sin(lat * Math.PI / 180), y = (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n; return [x, y]; }
async function photo(progres){
  const c = await lire(CLE + "-photo"); if(c && c.blob) return c;
  const [tx0, ty0] = tuile(ZONE.n, ZONE.w, ZOOM), [tx1, ty1] = tuile(ZONE.s, ZONE.e, ZOOM);
  const ax = Math.floor(tx0), ay = Math.floor(ty0), bx = Math.floor(tx1), by = Math.floor(ty1), nx = bx - ax + 1, ny = by - ay + 1;
  const cv = document.createElement("canvas"); cv.width = nx * 256; cv.height = ny * 256; const g = cv.getContext("2d"); g.fillStyle = "#8FAF7A"; g.fillRect(0, 0, cv.width, cv.height);
  let fait = 0, rate = 0; const total = nx * ny;
  const une = (x, y) => new Promise((ok) => { const im = new Image(); im.crossOrigin = "anonymous";
    im.onload = () => { g.drawImage(im, (x - ax) * 256, (y - ay) * 256); fait++; progres && progres("🛰️ Je télécharge les photos du ciel… " + Math.round(fait / total * 100) + " %", .7 + fait / total * .15); ok(); };
    im.onerror = () => { rate++; fait++; ok(); }; im.src = U(URL_PHOTO(ZOOM, x, y)); });
  const liste = []; for(let y = ay; y <= by; y++) for(let x = ax; x <= bx; x++) liste.push([x, y]);
  for(let i = 0; i < liste.length; i += 8) await Promise.all(liste.slice(i, i + 8).map(p => une(...p)));
  if(rate > total / 2) throw new Error("photos");
  const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", .88));
  const res = { blob, ax, ay, nx, ny }; ecrire(CLE + "-photo", res); return res;
}

/* ---------- tout assembler ---------- */
export async function chargerSuisse(scene, rendu, camera, progres){
  const R = await relief(progres);
  const P = await photo(progres);
  // l'altitude au centre (la gare) : y = 0 là-bas
  const hauteurBrute = (x, z) => {
    const fx = (x - R.x0) / (R.x1 - R.x0) * (COLS - 1), fz = (z - R.z0) / (R.z1 - R.z0) * (LIGNES - 1);
    const i = Math.max(0, Math.min(COLS - 2, Math.floor(fx))), j = Math.max(0, Math.min(LIGNES - 2, Math.floor(fz))), u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fz - j));
    const h = R.h, a = h[j * COLS + i], b = h[j * COLS + i + 1], c = h[(j + 1) * COLS + i], d = h[(j + 1) * COLS + i + 1];
    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
  };
  const H0 = hauteurBrute(0, 0);
  const lac = LAC - H0;
  const hauteur = (x, z) => Math.max(lac, hauteurBrute(x, z) - H0);

  // le sol : la grille d'altitudes avec la photo aérienne dessus
  const geo = new THREE.BufferGeometry(), pos = [], uv = [], idx = [];
  const img = await createImageBitmap(P.blob);
  for(let j = 0; j < LIGNES; j++) for(let i = 0; i < COLS; i++){
    const x = R.x0 + (R.x1 - R.x0) * i / (COLS - 1), z = R.z0 + (R.z1 - R.z0) * j / (LIGNES - 1);
    pos.push(x, Math.max(lac - .05, R.h[j * COLS + i] - H0), z);
    const [lat, lon] = versLatLon(x, z), [tx, ty] = tuile(lat, lon, ZOOM);
    uv.push((tx - P.ax) / P.nx, 1 - (ty - P.ay) / P.ny);
    if(i < COLS - 1 && j < LIGNES - 1){ const a = j * COLS + i; idx.push(a, a + COLS, a + 1, a + 1, a + COLS, a + COLS + 1); }
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const tex = new THREE.Texture(img); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = rendu.capabilities.getMaxAnisotropy(); tex.flipY = false; tex.needsUpdate = true;
  // (createImageBitmap ne retourne pas l'image : on inverse les v)
  const uvA = geo.attributes.uv; for(let k = 0; k < uvA.count; k++) uvA.setY(k, 1 - uvA.getY(k));
  const sol = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex })); sol.name = "solSuisse";
  scene.add(sol);

  // les bâtiments et les arbres en 3D (ils se chargent petit à petit, selon où l'on regarde)
  const draco = new DRACOLoader(); draco.setDecoderPath(new URL("./lib/draco/", import.meta.url).href);
  const cadre = new THREE.Matrix4();
  WGS84_ELLIPSOID.getEastNorthUpFrame(CENTRE.lat * Math.PI / 180, CENTRE.lon * Math.PI / 180, H0 + GEOIDE, cadre);
  const versJeu = new THREE.Matrix4().makeRotationX(-Math.PI / 2).multiply(cadre.clone().invert());
  const MURS = new THREE.Color("#EFE6D6"), TUILES = new THREE.Color("#B65A43"), PLAT = new THREE.Color("#A3A7AE"), FEUILLES = new THREE.Color("#4E8F43");
  const creer = (url, genre) => {
    const t = new TilesRenderer(U(url));
    const gl = new GLTFLoader(t.manager); gl.setDRACOLoader(draco); t.manager.addHandler(/\.(gltf|glb)$/i, gl);
    t.errorTarget = genre === "arbres" ? 20 : 10; t.maxDepth = 30;
    t.setCamera(camera); t.setResolutionFromRenderer(camera, rendu);
    t.group.matrixAutoUpdate = false; t.group.matrix.copy(versJeu); t.group.matrixWorldNeedsUpdate = true;
    t.addEventListener("load-model", (ev) => {
      ev.scene.traverse((o) => {
        if(!o.isMesh || !o.geometry) return;
        const g = o.geometry; if(!g.attributes.normal) g.computeVertexNormals();
        // les couleurs : les murs crème, les toits en tuiles (ou gris s'ils sont plats), les arbres verts
        const n = g.attributes.normal, nb = g.attributes.position.count, col = new Float32Array(nb * 3), m3 = new THREE.Matrix3(), v = new THREE.Vector3();
        o.updateWorldMatrix(true, false); m3.getNormalMatrix(o.matrixWorld);
        for(let k = 0; k < nb; k++){
          v.fromBufferAttribute(n, k).applyMatrix3(m3).normalize();
          const c = genre === "arbres" ? FEUILLES : v.y > .97 ? PLAT : v.y > .35 ? TUILES : MURS;
          col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
        }
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        o.material = new THREE.MeshLambertMaterial({ vertexColors: true });
      });
    });
    scene.add(t.group);
    return t;
  };
  const batiments = creer(URL_BATIMENTS, "batiments"), arbres = creer(URL_ARBRES, "arbres");
  return {
    hauteur, lac, sol, tuiles: [batiments, arbres],
    maj(){ camera.updateMatrixWorld(); for(const t of [batiments, arbres]){ t.setResolutionFromRenderer(camera, rendu); t.update(); } },
    nbModeles(){ let n = 0; batiments.group.traverse(o => { if(o.isMesh) n++; }); return n; }
  };
}
