// Vérifie que chaque coffre de l'île au trésor peut être atteint (à pied, en sautant, en nageant, ou en bateau)
import { ileAventure, N, idx, hauteurCase, PAR_ID, NIVEAU_EAU } from "/home/claude/jeux-enfants/pirates/monde.js";
const SAUT = 11.8 ** 2 / (2 * 30); // hauteur max d'un saut
const m = ileAventure();
const solide = new Set(m.objets.filter(o => PAR_ID[o.k].r >= 1).map(o => o.i + "," + o.j)); // gros objets qui bouchent une case
const vu = new Set(), file = [];
const d0 = [Math.floor(m.depart.x / 2 + N / 2), Math.floor(m.depart.z / 2 + N / 2)];
file.push(d0); vu.add(d0 + "");
const bateau = m.objets.find(o => o.k === "bateau");
let bateauAtteint = false;
while(file.length){
  const [i, j] = file.shift(), h = hauteurCase(m, i, j);
  for(const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const ni = i + a, nj = j + b; if(ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
    const k = ni + "," + nj; if(vu.has(k) || solide.has(k)) continue;
    const h2 = hauteurCase(m, ni, nj);
    let ok;
    if(h === null) ok = h2 === null || h2 - NIVEAU_EAU <= 1.75;   // nage → eau, ou sortie sur une plage basse
    else ok = h2 === null || h2 - h <= SAUT - .1;                 // à pied : on peut descendre, ou monter en sautant
    if(ok){ vu.add(k); file.push([ni, nj]); }
  }
}
// en bateau : toute l'eau reliée au bateau, et on descend sur les cases de terre ≤ 3 près de l'eau
const eauB = new Set(); if(vu.has(bateau.i + "," + bateau.j)){ bateauAtteint = true; }
console.log("saut max", SAUT.toFixed(2), "| bateau atteint à pied/nage :", bateauAtteint);
for(const o of m.objets.filter(o => o.k === "coffre")) console.log("coffre", o.i, o.j, "hauteur", hauteurCase(m, o.i, o.j), vu.has(o.i + "," + o.j) ? "ATTEIGNABLE" : "PAS ATTEIGNABLE");
// carte des hauteurs autour du sommet et de la tour
for(const [ci, cj] of [[21, 23], [10, 17]]){ console.log("autour de", ci, cj); for(let j = cj - 3; j <= cj + 3; j++){ let l = ""; for(let i = ci - 4; i <= ci + 6; i++){ const h = hauteurCase(m, i, j); l += (h === null ? "~" : h) + " "; } console.log("  " + l); } }
