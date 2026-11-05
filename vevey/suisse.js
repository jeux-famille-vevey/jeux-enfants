/* Le vrai Vevey en 3D avec les données officielles suisses (© swisstopo, gratuites) :
   - les bâtiments en 3D avec leurs vrais toits (swissBUILDINGS3D),
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
export async function oublierSuisse(){ const b = await base(); if(b) try{ const s = b.transaction("cache", "readwrite").objectStore("cache"); s.delete(CLE + "-relief"); s.delete(CLE + "-photo17"); s.delete(CLE + "-photo18"); s.delete(CLE + "-photo"); }catch(e){} }

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
let ZOOM = 17;   // 18 (plus net) si la carte graphique accepte les grandes images
function tuile(lat, lon, z){ const n = 2 ** z, x = (lon + 180) / 360 * n, s = Math.sin(lat * Math.PI / 180), y = (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n; return [x, y]; }
async function photo(progres){
  const c = await lire(CLE + "-photo" + ZOOM); if(c && c.blob) return c;
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
  const res = { blob, ax, ay, nx, ny }; ecrire(CLE + "-photo" + ZOOM, res); return res;
}

/* ---------- tout assembler ---------- */
export async function chargerSuisse(scene, rendu, camera, progres, options){
  options = options || {};
  ZOOM = rendu.capabilities.maxTextureSize >= 8192 && !matchMedia("(pointer: coarse)").matches ? 18 : 17;
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
  /* les façades : couleurs variées, fenêtres à chaque étage et vitrines au rez-de-chaussée, dessinées par la carte graphique
     (attribut « fac » : x = position le long du mur, y = hauteur au-dessus du bas du bâtiment, z = 0 toit, 1 mur, 2 mur avec magasins, 3 mur sans fenêtres) */
  const FACADES = ["#F3E7D3", "#EFE1C6", "#F2D7BC", "#E9E4DA", "#F7EEDD", "#DDD5C6", "#F0CDAA", "#E8DFF0", "#DCE8F0", "#F3DADA", "#FFF2D2", "#E2E8D6", "#F5E3C8", "#D9CBB5"];
  const TOITS = ["#B65A43", "#A9503C", "#C0664B", "#9C4A38", "#8E8F94", "#A3A7AE", "#7E8590"];
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec3 fac;\nvarying vec3 vFac;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvFac = fac;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vFac;\nfloat hasard(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }")
      .replace("#include <color_fragment>", `#include <color_fragment>
      if(vFac.z > .5 && vFac.z < 2.5){
        float col = floor(vFac.x / 3.3), u = fract(vFac.x / 3.3), h = vFac.y;
        vec3 vitre = mix(vec3(.30,.38,.50), vec3(.62,.72,.84), clamp((fract(h / 3.0) - .3) * 1.6, 0., 1.));
        if(vFac.z > 1.5 && h < 3.6){
          // le rez-de-chaussée avec des vitrines et un store coloré
          if(u > .07 && u < .93 && h > .25 && h < 2.55) diffuseColor.rgb = mix(vec3(.22,.27,.33), vec3(.55,.64,.74), smoothstep(.3, 2.4, h));
          else if(h > 2.65 && h < 3.25) diffuseColor.rgb = mix(vec3(.85,.25,.22), vec3(.2,.45,.75), step(.5, hasard(vec2(col, 7.))));
          else if(h < .25) diffuseColor.rgb *= .75;
        } else if(h > 1.0){
          float etage = floor((h - .6) / 3.0), f = fract((h - .6) / 3.0);
          if(u > .27 && u < .73 && f > .3 && f < .85){
            diffuseColor.rgb = vitre;
            if(hasard(vec2(col, etage)) > .86) diffuseColor.rgb = vec3(.98, .86, .55);          // une fenêtre allumée
            if(abs(u - .5) < .018 || abs(f - .58) < .02) diffuseColor.rgb *= 1.6;               // le cadre
          } else if(u > .24 && u < .76 && f > .26 && f <= .3) diffuseColor.rgb *= .82;          // le rebord
          else if(f < .04) diffuseColor.rgb *= .93;                                             // la ligne entre les étages
        }
      }`);
  };
  const versHex = (h) => new THREE.Color(h);
  const FAC = FACADES.map(versHex), TOI = TOITS.map(versHex);
  const hash = (n) => { n = Math.imul((n | 0) ^ 0x9E3779B9, 0x85EBCA6B); n ^= n >>> 13; n = Math.imul(n, 0xC2B2AE35); n ^= n >>> 16; return (n >>> 0) / 4294967296; };
  const SPECIAL = { eglise: { mur: versHex("#D6CFC0"), toit: versHex("#5E646E"), type: 3 }, gare: { mur: versHex("#EADCC0"), toit: versHex("#6E737C"), type: 2 }, ecole: { mur: versHex("#FFD9A0"), toit: versHex("#B65A43"), type: 1 },
    chateau: { mur: versHex("#F1ECE2"), toit: versHex("#5E646E"), type: 1 }, musee: { mur: versHex("#F4F1EA"), toit: versHex("#8E8F94"), type: 1 } };
  const creer = (url) => {
    const t = new TilesRenderer(U(url));
    const gl = new GLTFLoader(t.manager); gl.setDRACOLoader(draco); t.manager.addHandler(/\.(gltf|glb)$/i, gl);
    t.errorTarget = 10; t.maxDepth = 30;
    t.setCamera(camera); t.setResolutionFromRenderer(camera, rendu);
    t.group.matrixAutoUpdate = false; t.group.matrix.copy(versJeu); t.group.matrixWorldNeedsUpdate = true;
    t.addEventListener("load-model", (ev) => { try{ habiller(ev); }catch(e){ console.error("façades", e); } });
    t.addEventListener("load-error", (e) => console.error("tuile 3D :", e.error && e.error.message, e.url));
    const habiller = (ev) => {
      ev.scene.updateWorldMatrix(true, true); t.group.updateMatrixWorld(true);
      const parent = ev.scene.parent ? new THREE.Matrix4() : t.group.matrixWorld.clone(), M = new THREE.Matrix4(), m3 = new THREE.Matrix3();
      ev.scene.traverse((o) => {
        if(!o.isMesh || !o.geometry) return;
        let g = o.geometry; if(g.index){ g = g.toNonIndexed(); o.geometry.dispose(); o.geometry = g; }
        if(!g.attributes.normal) g.computeVertexNormals();
        M.multiplyMatrices(parent, o.matrixWorld); m3.getNormalMatrix(M);
        const P = g.attributes.position, N = g.attributes.normal, nb = P.count, B = g.attributes._batchid || g.attributes._feature_id_0 || g.attributes.batchid;
        const col = new Float32Array(nb * 3), fac = new Float32Array(nb * 3), v = new THREE.Vector3(), n = new THREE.Vector3();
        const ids = new Int32Array(nb), monde = new Float32Array(nb * 3), bas = new Map(), centre = new Map();
        for(let k = 0; k < nb; k++){
          v.fromBufferAttribute(P, k).applyMatrix4(M); monde[k * 3] = v.x; monde[k * 3 + 1] = v.y; monde[k * 3 + 2] = v.z;
          const id = B ? Math.round(B.getX(k)) : Math.floor(k / 3000); ids[k] = id;
          const b = bas.get(id); if(b === undefined || v.y < b) bas.set(id, v.y);
          const c = centre.get(id) || [0, 0, 0]; c[0] += v.x; c[1] += v.z; c[2]++; centre.set(id, c);
        }
        const infos = new Map();
        for(const [id, c] of centre){ const x = c[0] / c[2], z = c[1] / c[2], info = options.infoBatiment ? options.infoBatiment(x, z) : null, hb = hash(Math.round(x * 7) ^ Math.round(z * 13));
          infos.set(id, { sp: info && SPECIAL[info.genre], mur: FAC[Math.floor(hb * FAC.length)], toit: TOI[Math.floor(hash(id + 77 + Math.round(x)) * TOI.length)], magasins: hb > .45 ? 2 : 1 }); }
        for(let k = 0; k < nb; k++){
          n.fromBufferAttribute(N, k).applyMatrix3(m3).normalize();
          const inf = infos.get(ids[k]), sp = inf.sp, mur = Math.abs(n.y) < .5;
          const c = mur ? (sp ? sp.mur : inf.mur) : n.y > .97 ? (sp ? sp.toit : versHex("#A3A7AE")) : (sp ? sp.toit : inf.toit);
          col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
          if(mur){ const tx = -n.z, tz = n.x, l = Math.hypot(tx, tz) || 1; fac[k * 3] = (monde[k * 3] * tx + monde[k * 3 + 2] * tz) / l; fac[k * 3 + 1] = monde[k * 3 + 1] - bas.get(ids[k]); fac[k * 3 + 2] = sp ? sp.type : inf.magasins; }
        }
        g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.setAttribute("fac", new THREE.BufferAttribute(fac, 3));
        o.material = mat;
      });
    };
    scene.add(t.group);
    return t;
  };
  const batiments = creer(URL_BATIMENTS);
  /* poser les bâtiments sur le sol : pour chaque bâtiment chargé, on regarde son point le plus bas par rapport au terrain
     (un bâtiment touche toujours le sol quelque part) ; la valeur du milieu de tous ces écarts = la correction à faire */
  const ecarts = []; let correction = 0;
  const base = batiments.group.matrix.elements[13];
  batiments.addEventListener("load-model", (ev) => {
    ev.scene.updateWorldMatrix(true, true);
    // si le modèle n'est pas encore accroché à la ville, on ajoute nous-mêmes la position de la ville
    batiments.group.updateMatrixWorld(true);
    const parent = ev.scene.parent ? new THREE.Matrix4() : batiments.group.matrixWorld.clone(), M = new THREE.Matrix4();
    const v = new THREE.Vector3();
    ev.scene.traverse((o) => {
      if(!o.isMesh) return; const p = o.geometry.attributes.position; if(!p) return;
      M.multiplyMatrices(parent, o.matrixWorld);
      // les sommets regroupés par petits carrés de 15 m : dans chaque carré, le point le plus bas par rapport au sol
      const carres = new Map();
      for(let k = 0; k < p.count; k += 1){
        v.fromBufferAttribute(p, k).applyMatrix4(M);
        const d = v.y - hauteur(v.x, v.z), cle = Math.floor(v.x / 15) + "," + Math.floor(v.z / 15);
        const ancien = carres.get(cle); if(ancien === undefined || d < ancien) carres.set(cle, d);
      }
      for(const d of carres.values()) ecarts.push(d + correction);
    });
    if(ecarts.length >= 6){
      const tri = ecarts.slice().sort((a, b) => a - b), med = tri[Math.floor(tri.length / 2)];
      if(Math.abs(med - correction) > .3){ correction = med; batiments.group.matrix.elements[13] = base - correction; batiments.group.matrixWorldNeedsUpdate = true; }
    }
  });
  return {
    hauteur, lac, sol, tuiles: [batiments],
    diag(){ return { H0, correction, n: ecarts.length }; },
    maj(){ camera.updateMatrixWorld(); batiments.setResolutionFromRenderer(camera, rendu); batiments.update(); },
    nbModeles(){ let n = 0; batiments.group.traverse(o => { if(o.isMesh) n++; }); return n; }
  };
}
