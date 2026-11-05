/* La vraie carte de Vevey : les bâtiments, les rues, le chemin de fer, le lac, les parcs, les écoles…
   Les données viennent d'OpenStreetMap (© les contributeurs d'OpenStreetMap, licence ODbL).
   La première fois, le jeu les télécharge (Overpass), puis il les garde sur l'appareil. */

// le centre de Vevey (la gare) et la zone du jeu : environ 2,4 km × 1,7 km
export const CENTRE = { lat: 46.4627, lon: 6.8430 };
export const ZONE = { s: 46.4545, w: 6.8280, n: 46.4700, e: 6.8590 };
const CLE_CACHE = "vevey-osm-v1";
const SERVEURS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

const KX = Math.cos(CENTRE.lat * Math.PI / 180) * 111320, KZ = 110540;
export function versLocal(lat, lon){ return [(lon - CENTRE.lon) * KX, -(lat - CENTRE.lat) * KZ]; }   // x = est, z = sud (en mètres)

function requete(){
  const b = ZONE.s + "," + ZONE.w + "," + ZONE.n + "," + ZONE.e;
  return "[out:json][timeout:90];(" +
    'way["building"](' + b + ");" +
    'relation["building"](' + b + ");" +
    'way["highway"](' + b + ");" +
    'way["railway"~"^(rail|light_rail|narrow_gauge|funicular)$"](' + b + ");" +
    'way["leisure"~"^(park|garden|playground|pitch|common)$"](' + b + ");" +
    'way["landuse"~"^(grass|meadow|vineyard|forest|recreation_ground|village_green|cemetery)$"](' + b + ");" +
    'way["natural"~"^(water|wood|beach|scrub)$"](' + b + ");" +
    'relation["natural"="water"](' + b + ");" +
    'way["waterway"~"^(river|stream|canal)$"](' + b + ");" +
    'node["natural"="tree"](' + b + ");" +
    'nwr["amenity"~"^(school|kindergarten|college|place_of_worship|townhall|library|hospital|theatre|cinema|marketplace|fountain|post_office|police|fire_station)$"](' + b + ");" +
    'nwr["railway"~"^(station|halt)$"](' + b + ");" +
    'nwr["tourism"~"^(artwork|museum|attraction|viewpoint)$"](' + b + ");" +
    'nwr["place"="square"](' + b + ");" +
    'nwr["leisure"="playground"](' + b + ");" +
    ");out geom(" + b + ");";
}

/* ---------- le cache sur l'appareil (IndexedDB) ---------- */
function base(){ return new Promise((ok) => { try{ const r = indexedDB.open("vevey-3d", 1); r.onupgradeneeded = () => r.result.createObjectStore("cache"); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); }catch(e){ ok(null); } }); }
async function lireCache(){ const b = await base(); if(!b) return null; return new Promise((ok) => { try{ const r = b.transaction("cache").objectStore("cache").get(CLE_CACHE); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }catch(e){ ok(null); } }); }
async function ecrireCache(v){ const b = await base(); if(!b) return; try{ b.transaction("cache", "readwrite").objectStore("cache").put(v, CLE_CACHE); }catch(e){} }
export async function oublierCarte(){ const b = await base(); if(b) try{ b.transaction("cache", "readwrite").objectStore("cache").delete(CLE_CACHE); }catch(e){} }

/* ---------- télécharger (en essayant plusieurs serveurs) ---------- */
export async function chargerDonnees(progres){
  const c = await lireCache();
  if(c && c.elements && c.elements.length > 100){ progres && progres("📦 La carte de Vevey est déjà sur cet appareil", 1); return c; }
  let derniere = null;
  for(let i = 0; i < SERVEURS.length; i++){
    try{
      progres && progres("🌍 Je télécharge la carte de Vevey… (serveur " + (i + 1) + " sur " + SERVEURS.length + ")", .1 + i * .1);
      const ctl = new AbortController(), minuterie = setTimeout(() => ctl.abort(), 120000);
      const r = await fetch(SERVEURS[i], { method: "POST", body: "data=" + encodeURIComponent(requete()), headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: ctl.signal });
      clearTimeout(minuterie);
      if(!r.ok) throw new Error("le serveur répond " + r.status);
      progres && progres("📥 Je reçois la carte…", .5);
      const d = await r.json();
      if(!d.elements || d.elements.length < 100) throw new Error("carte vide");
      const garde = { elements: d.elements, date: Date.now() };
      ecrireCache(garde);
      return garde;
    }catch(e){ derniere = e; }
  }
  throw derniere || new Error("téléchargement impossible");
}

/* ---------- transformer les données en choses à dessiner ---------- */
const LARGEURS = { motorway: 12, trunk: 11, primary: 10, secondary: 9, tertiary: 8, unclassified: 6, residential: 6, living_street: 5, service: 4, pedestrian: 7,
  footway: 2.4, path: 2, cycleway: 2.4, steps: 2.4, track: 3, bridleway: 2 };
export function interpreter(donnees){
  const res = { batiments: [], routes: [], rails: [], verts: [], eaux: [], rivieres: [], arbres: [], lieux: [], rivage: [] };
  const geo = (g) => (g || []).filter(Boolean).map(p => versLocal(p.lat, p.lon));
  const nom = (t) => t && (t["name:fr"] || t.name);
  for(const el of donnees.elements){
    const t = el.tags || {};
    // les bâtiments
    if(t.building && t.building !== "no"){
      let anneaux = [];
      if(el.type === "way") anneaux = [geo(el.geometry)];
      else if(el.type === "relation") anneaux = (el.members || []).filter(m => m.role === "outer" && m.geometry).map(m => geo(m.geometry));
      const niv = parseFloat(t["building:levels"]), h = parseFloat(t.height);
      let hauteur = !isNaN(h) ? h : !isNaN(niv) ? niv * 3.1 + 1.5 : (["house", "detached", "garage", "garages", "shed", "hut", "kiosk", "roof"].includes(t.building) ? (t.building === "house" || t.building === "detached" ? 7 : 3.5) : 11);
      hauteur = Math.max(3, Math.min(60, hauteur));
      const genre = t.building === "church" || t.amenity === "place_of_worship" ? "eglise" : t.building === "school" || t.amenity === "school" ? "ecole" : t.building === "train_station" ? "gare" : "normal";
      for(const a of anneaux) if(a.length >= 4) res.batiments.push({ id: el.id, pts: a, h: hauteur, genre, nom: nom(t) });
    }
    // les rues et chemins
    if(t.highway && el.type === "way" && LARGEURS[t.highway] !== undefined && t.area !== "yes"){
      const pts = geo(el.geometry); if(pts.length >= 2) res.routes.push({ pts, l: LARGEURS[t.highway], type: t.highway, nom: nom(t), pont: t.bridge === "yes", tunnel: t.tunnel === "yes" });
    }
    if(t.highway === "pedestrian" && (t.area === "yes") && el.type === "way") res.verts.push({ pts: geo(el.geometry), type: "place" });
    // le chemin de fer
    if(t.railway && el.type === "way" && /^(rail|light_rail|narrow_gauge|funicular)$/.test(t.railway)){
      const pts = geo(el.geometry); if(pts.length >= 2) res.rails.push({ pts, tunnel: t.tunnel === "yes", service: !!t.service, type: t.railway });
    }
    // les parcs, l'herbe, les vignes, la forêt
    const vert = t.leisure || t.landuse || (t.natural !== "water" ? t.natural : null);
    if(vert && el.type === "way" && /^(park|garden|playground|pitch|common|grass|meadow|vineyard|forest|recreation_ground|village_green|cemetery|wood|beach|scrub)$/.test(vert)){
      const pts = geo(el.geometry); if(pts.length >= 4) res.verts.push({ pts, type: vert });
    }
    // l'eau : petits bassins (chemins) et le lac (relation)
    if(t.natural === "water" || t.water){
      if(el.type === "way"){ const pts = geo(el.geometry); if(pts.length >= 4) res.eaux.push(pts); }
      if(el.type === "relation") for(const m of el.members || []) if(m.role === "outer" && m.geometry){ const pts = geo(m.geometry); if(pts.length >= 2) res.rivage.push(pts); }
    }
    if(t.waterway && el.type === "way"){ const pts = geo(el.geometry); if(pts.length >= 2) res.rivieres.push({ pts, l: t.waterway === "river" ? 12 : 4 }); }
    if(t.natural === "tree" && el.type === "node") res.arbres.push(versLocal(el.lat, el.lon));
    // les endroits à visiter (avec un nom)
    const genre = t.amenity === "school" || t.amenity === "college" ? "ecole" : t.amenity === "kindergarten" ? "garderie" : t.railway === "station" || t.railway === "halt" ? "gare"
      : t.tourism === "museum" ? "musee" : t.tourism === "artwork" ? "oeuvre" : t.place === "square" || t.amenity === "marketplace" ? "place" : t.leisure === "playground" ? "jeux"
      : t.amenity === "place_of_worship" ? "culte" : t.amenity === "library" ? "biblio" : t.amenity === "townhall" ? "mairie" : t.amenity === "theatre" || t.amenity === "cinema" ? "spectacle"
      : t.amenity === "fountain" ? "fontaine" : t.tourism === "viewpoint" || t.tourism === "attraction" ? "vue" : t.amenity === "hospital" ? "hopital" : t.amenity === "post_office" ? "poste" : t.amenity === "fire_station" ? "pompiers" : t.amenity === "police" ? "police" : null;
    if(genre){
      let p = null;
      if(el.type === "node") p = versLocal(el.lat, el.lon);
      else if(el.geometry && el.geometry.length){ const g = geo(el.geometry); p = [g.reduce((s, q) => s + q[0], 0) / g.length, g.reduce((s, q) => s + q[1], 0) / g.length]; }
      else if(el.bounds) p = versLocal((el.bounds.minlat + el.bounds.maxlat) / 2, (el.bounds.minlon + el.bounds.maxlon) / 2);
      else if(el.members){ const g = el.members.filter(m => m.geometry).flatMap(m => geo(m.geometry)); if(g.length) p = [g.reduce((s, q) => s + q[0], 0) / g.length, g.reduce((s, q) => s + q[1], 0) / g.length]; }
      if(p && (nom(t) || ["gare", "jeux", "fontaine"].includes(genre))) res.lieux.push({ genre, nom: nom(t) || "", x: p[0], z: p[1], tags: t });
    }
  }
  // les lieux en double (un même nom tout proche) : on n'en garde qu'un
  const vus = [];
  res.lieux = res.lieux.filter(l => { if(vus.some(v => v.genre === l.genre && v.nom === l.nom && Math.hypot(v.x - l.x, v.z - l.z) < 150)) return false; vus.push(l); return true; });
  res.terre = construireTerre(res.rivage);
  return res;
}

/* la terre ferme : tout ce qui est au nord du bord du lac (le Léman est au sud de Vevey) */
function construireTerre(rivage){
  const [x0, z0] = versLocal(ZONE.n, ZONE.w), [x1, z1] = versLocal(ZONE.s, ZONE.e);
  const pts = rivage.flat();
  if(pts.length < 10) return null;
  // on suit le bord du lac d'ouest en est : pour chaque tranche de 6 m, le point le plus au nord (côté terre)
  const tranche = 6, cols = new Map();
  for(const p of pts){ const k = Math.round(p[0] / tranche); const v = cols.get(k); if(v === undefined || p[1] < v) cols.set(k, p[1]); }
  const cles = [...cols.keys()].sort((a, b) => a - b);
  if(cles.length < 5) return null;
  // lisser un peu les trous
  const bord = cles.map(k => [k * tranche, cols.get(k)]);
  const poly = [[x0 - 50, z0 - 50]];
  poly.push([x0 - 50, bord[0][1]]);
  for(const p of bord) poly.push(p);
  poly.push([x1 + 50, bord[bord.length - 1][1]]);
  poly.push([x1 + 50, z0 - 50]);
  return { poly, bord };
}
export function limites(){ const [x0, z0] = versLocal(ZONE.n, ZONE.w), [x1, z1] = versLocal(ZONE.s, ZONE.e); return { x0, z0, x1, z1 }; }
