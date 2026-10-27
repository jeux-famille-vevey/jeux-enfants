// Construit commun/jeux/carte-monde.js : contours des pays (Natural Earth via world-atlas, domaine public) en SVG.
const fs = require("fs");
const topo = require("topojson-client");
const simp = require("topojson-simplify");
const d3 = Object.assign({}, require("d3-geo"), require("d3-geo-projection"));
const iso = require("i18n-iso-countries");
const WC = require("world-countries");

const t = JSON.parse(JSON.stringify(require("world-atlas/countries-50m.json")));
const num2a2 = {}; WC.forEach(c => { if (c.ccn3) num2a2[String(Number(c.ccn3))] = c.cca2; });
// Somaliland et Chypre du Nord : rattachés à la Somalie et à Chypre (reconnaissance internationale)
const fusion = { "Somaliland": "SO", "N. Cyprus": "CY", "Kosovo": "XK" };
const geoms = t.objects.countries.geometries;
geoms.forEach(g => { g.a2 = g.id ? num2a2[String(Number(g.id))] : fusion[g.properties.name]; });
const parA2 = {};
geoms.forEach(g => { if (g.a2) (parA2[g.a2] = parA2[g.a2] || []).push(g); });

const parCode = {}; WC.forEach(c => { parCode[c.cca2] = c; });
function continent(a2) {
  if (a2 === "XK") return "europe";
  const c = parCode[a2]; if (!c) return null;
  if (c.region === "Africa") return "afrique";
  if (c.region === "Europe") return "europe";
  if (c.region === "Asia") return "asie";
  if (c.region === "Oceania") return "oceanie";
  if (a2 === "AQ") return "antarctique";
  if (c.region === "Americas") return c.subregion === "South America" ? "ams" : "amn";
  return null;   // terres australes, Géorgie du Sud…
}
function construire(proj, w, h, filtre, tol) {
  const tt = simp.presimplify(t);
  const s = simp.simplify(tt, tol);
  const path = d3.geoPath(proj);
  const out = {};
  for (const a2 in parA2) {
    if (filtre && !filtre(a2)) continue;
    const f = topo.merge(s, parA2[a2]);
    let d = path(f);
    if (!d) continue;
    d = d.replace(/(\d+\.\d)\d+/g, "$1");
    const b = path.bounds(f), c = path.centroid(f), ar = path.area(f);
    if (b[1][0] < 0 || b[0][0] > w || b[1][1] < 0 || b[0][1] > h) continue;  // hors du cadre
    if (ar < 0.5 && !filtre) continue;
    out[a2] = { d, x: +c[0].toFixed(1), y: +c[1].toFixed(1), a: Math.round(ar), k: continent(a2) };
  }
  return out;
}

// Monde : projection Natural Earth (sans l'Antarctique pour garder de la place ; il est dessiné à part)
const W = 1000, H = 520;
const pm = d3.geoNaturalEarth1().fitExtent([[5, 5], [W - 5, H - 5]], { type: "Sphere" });
const monde = construire(pm, W, H, null, 0.06);
const sphere = d3.geoPath(pm)({ type: "Sphere" }).replace(/(\d+\.\d)\d+/g, "$1");

// Europe : projection conique, cadre de l'Islande à l'Oural
const EW = 1000, EH = 760;
// cadre : de l'Islande (24° O) à la mer Caspienne (48° E), de la Crète (34° N) au cap Nord (71,5° N)
const cadre = { type: "MultiPoint", coordinates: [[-24, 63.5], [-13, 66], [-10, 36], [24, 34.8], [42, 40], [44, 62], [26, 71.2]] };
const pe = d3.geoConicConformal().parallels([40, 65]).rotate([-12, 0]).fitExtent([[0, 0], [EW, EH]], cadre);
pe.clipExtent([[0, 0], [EW, EH]]);
const europe = construire(pe, EW, EH, () => true, 0.012);

const js = "/* Carte du monde — contours Natural Earth (domaine public) via world-atlas (ISC). Fabriqué par outils/carte-monde/build.js */\n" +
  "window.CARTE_MONDE=" + JSON.stringify({ monde: { w: W, h: H, sphere, p: monde }, europe: { w: EW, h: EH, p: europe } }) + ";\n";
fs.writeFileSync(process.argv[2], js);
console.log("monde", Object.keys(monde).length, "pays ; europe", Object.keys(europe).length, "; taille", (js.length / 1024).toFixed(0), "Ko");
