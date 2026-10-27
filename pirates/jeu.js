/* L'Île des Pirates : on joue avec SON personnage (fait dans « Mon personnage »),
   on cherche les trésors, on prend le bateau… et on construit son propre monde. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { profils, avatarDe, creerAvatar, animerAvatar } from "../commun/avatar.js";
import { lireManette, vraiesManettes } from "../commun/manette.js";
import { Partie } from "./reseau.js?v=4";
import { N, T, HMAX, NIVEAU_EAU, TERRAINS, COULEURS, OBJETS, PAR_ID, Rendu, sol, idx, dedans, caseX, centre, hauteurCase,
  mondeVide, nouvelleIle, oceanVide, ileAventure, versTexte, depuisTexte, ajouterObjet, objetSur } from "./monde.js";

const $ = (id) => document.getElementById(id);
const TEST = /[?&]test/.test(location.search);
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); return true; }catch(e){ return false; } }

/* ======================= la scène ======================= */
const canvas = $("c");
let renderer;
try{ renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
catch(e){ document.body.insertAdjacentHTML("beforeend", '<p style="position:fixed;top:40%;width:100%;text-align:center;font-size:1.3rem;color:#1D2357;font-weight:700">Cet ordinateur ne peut pas afficher la 3D.</p>'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25)); renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color("#8ED6FF"); scene.fog = new THREE.Fog("#8ED6FF", 70, 170);
const camera = new THREE.PerspectiveCamera(55, 1, .1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6aa36a, 1.35));
const soleil = new THREE.DirectionalLight(0xffffff, 2.2); soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 120 }); soleil.shadow.bias = -.0006;
scene.add(soleil); scene.add(soleil.target);
function suivreSoleil(x, z){ soleil.position.set(x + 25, 45, z + 18); soleil.target.position.set(x, 0, z); }
const rendu = new Rendu(scene);
function redim(){ const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", redim); redim();

/* ======================= sons ======================= */
let actx = null, sonOn = lire("pirates-son", "1") === "1";
function bip(f, d, type, vol){ if(!sonOn) return; try{ if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = type || "triangle"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.001, t + (d || .15)); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + (d || .15) + .02); }catch(e){} }
const sonPiece = () => { bip(988, .08); setTimeout(() => bip(1319, .14), 70); };
const sonTresor = () => [523, 659, 784, 1047, 1319].forEach((f, k) => setTimeout(() => bip(f, .22, "triangle", .1), k * 90));
const sonPose = () => bip(330 + Math.random() * 80, .07, "square", .04);
const sonSaut = () => bip(440, .12, "sine", .06);
const voix = new Audio();
function dire(nom){ if(!sonOn) return; try{ voix.pause(); voix.src = "sons/" + nom + ".mp3"; voix.play().catch(() => {}); }catch(e){} }
$("sonBtn").onclick = () => { sonOn = !sonOn; ecrire("pirates-son", sonOn ? "1" : "0"); $("sonBtn").textContent = sonOn ? "🔊" : "🔇"; };
$("sonBtn").textContent = sonOn ? "🔊" : "🔇";

/* ======================= les entrées (clavier, souris, doigts, manette) ======================= */
const touches = {};
addEventListener("keydown", (e) => { touches[e.code] = true; if(etat === "jeu" || etat === "constr"){ if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault(); } quandTouche(e); });
addEventListener("keyup", (e) => { touches[e.code] = false; });
addEventListener("blur", () => { for(const k in touches) touches[k] = false; });
const tactile = matchMedia("(pointer: coarse)").matches || TEST && /tactile/.test(location.search);
let joy = { x: 0, y: 0, id: null }, sautT = false, actionT = false;
(function(){
  const j = $("joy"), bouton = j.firstElementChild;
  const bouger = (e) => { const r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
    const l = Math.hypot(dx, dy); if(l > 1){ dx /= l; dy /= l; } joy.x = dx; joy.y = dy; bouton.style.transform = "translate(" + dx * 40 + "px," + dy * 40 + "px)"; };
  j.addEventListener("pointerdown", (e) => { joy.id = e.pointerId; try{ j.setPointerCapture(e.pointerId); }catch(er){} bouger(e); e.preventDefault(); });
  j.addEventListener("pointermove", (e) => { if(e.pointerId === joy.id) bouger(e); });
  const fin = (e) => { if(e.pointerId !== joy.id) return; joy = { x: 0, y: 0, id: null }; bouton.style.transform = ""; };
  j.addEventListener("pointerup", fin); j.addEventListener("pointercancel", fin);
  $("tSaut").addEventListener("pointerdown", (e) => { sautT = true; e.preventDefault(); });
  $("tAction").addEventListener("pointerdown", (e) => { actionT = true; e.preventDefault(); });
})();
/* tourner la caméra en glissant sur l'écran (jeu) */
let glisse = null;
canvas.addEventListener("pointerdown", (e) => {
  if(etat === "jeu"){ glisse = { id: e.pointerId, x: e.clientX, y: e.clientY }; try{ canvas.setPointerCapture(e.pointerId); }catch(er){} }
  else if(etat === "constr") constrDown(e);
});
canvas.addEventListener("pointermove", (e) => {
  if(etat === "jeu" && glisse && e.pointerId === glisse.id){ camJ.yaw -= (e.clientX - glisse.x) * .006; camJ.pitch = Math.max(.12, Math.min(1.25, camJ.pitch + (e.clientY - glisse.y) * .004)); glisse.x = e.clientX; glisse.y = e.clientY; }
  else if(etat === "constr") constrMove(e);
});
const finGlisse = (e) => { if(glisse && e.pointerId === glisse.id) glisse = null; if(etat === "constr") constrUp(e); };
canvas.addEventListener("pointerup", finGlisse); canvas.addEventListener("pointercancel", finGlisse);
canvas.addEventListener("wheel", (e) => { e.preventDefault(); if(etat === "jeu") camJ.dist = Math.max(5, Math.min(18, camJ.dist * (e.deltaY > 0 ? 1.1 : .9))); if(etat === "constr") camC.dist = Math.max(12, Math.min(75, camC.dist * (e.deltaY > 0 ? 1.1 : .9))); }, { passive: false });
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

/* ======================= les joueurs ======================= */
let profil = lire("avatar-profil", "mikael");
if(!profils().some(p => p.id === profil)) profil = profils()[0].id;
function remplirProfils(){
  const box = $("profils"); box.innerHTML = "";
  profils().forEach(p => { const b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
    b.onclick = () => { profil = p.id; ecrire("avatar-profil", profil); remplirProfils(); vitrine(); bip(600); }; box.appendChild(b); });
}
$("monPirate").onclick = () => { location.href = "../avatar/?profil=" + encodeURIComponent(profil) + "&retour=../pirates/"; };

/* ======================= les mondes enregistrés ======================= */
function mesMondes(){ try{ return JSON.parse(lire("pirates-mondes", "[]")) || []; }catch(e){ return []; } }
function garderMondes(l){ if(!ecrire("pirates-mondes", JSON.stringify(l))) message("⚠️ Plus de place pour enregistrer. Efface un ancien monde."); }
function remplirMondes(){
  const box = $("listeMondes"); box.innerHTML = "";
  const l = mesMondes();
  if(l.length){ const h = document.createElement("h2"); h.textContent = "Mes mondes"; box.appendChild(h); }
  l.slice().sort((a, b) => (b.date || 0) - (a.date || 0)).forEach(w => {
    const d = document.createElement("div"); d.className = "monde";
    const qui = profils().find(p => p.id === w.auteur);
    d.innerHTML = "<b></b><button data-a='jouer'>▶ Jouer</button><button data-a='ens' title='Jouer à plusieurs'>👫</button><button data-a='modif'>🛠️</button><button data-a='suppr'>🗑️</button>";
    d.querySelector("b").textContent = w.nom; const sm = document.createElement("small"); sm.textContent = (qui ? "par " + qui.nom + " · " : "") + new Date(w.date || Date.now()).toLocaleDateString("fr-CH"); d.querySelector("b").appendChild(sm);
    d.querySelector("[data-a=jouer]").onclick = () => { const m = depuisTexte(w.data); m.cle = w.id; demarrerJeu(m, "libre"); };
    d.querySelector("[data-a=ens]").onclick = () => { const m = depuisTexte(w.data); m.cle = w.id; heberger(m, "libre"); };
    d.querySelector("[data-a=modif]").onclick = () => { const m = depuisTexte(w.data); m.cle = w.id; demarrerConstr(m); };
    d.querySelector("[data-a=suppr]").onclick = () => { if(confirm("Effacer le monde « " + w.nom + " » ?")){ garderMondes(mesMondes().filter(x => x.id !== w.id)); remplirMondes(); } };
    box.appendChild(d);
  });
}
function enregistrerMonde(m){
  m.auteur = m.auteur || profil;
  const l = mesMondes(); if(!m.cle) m.cle = "w" + Date.now().toString(36);
  const data = versTexte(m), e = l.find(x => x.id === m.cle);
  if(e){ e.data = data; e.nom = m.nom; e.date = Date.now(); } else l.push({ id: m.cle, nom: m.nom, auteur: m.auteur, data, date: Date.now() });
  garderMondes(l);
}

/* ======================= le menu ======================= */
let etat = "menu", monde = null;
function aideMenu(){
  $("aideMenu").innerHTML = tactile
    ? "📱 <b>Rond à gauche</b> pour marcher, <b>🦘</b> pour sauter, <b>⚓</b> pour monter dans le bateau. Glisse le doigt sur l'écran pour tourner la caméra."
    : "⌨️ <b>Flèches</b> ou <b>W A S D</b> pour marcher, <b>Espace</b> pour sauter, <b>E</b> pour monter dans le bateau ou en descendre. Glisse avec la <b>souris</b> pour tourner la caméra, <b>molette</b> pour zoomer.<br>🎮 <b>Manette</b> : joystick pour marcher, <b>✕</b> pour sauter, <b>○</b> pour le bateau, <b>L1 / R1</b> pour tourner la caméra.";
}
function montrerMenu(){
  etat = "menu"; $("menu").hidden = false; $("hud").hidden = true; $("constr").hidden = true; scene.fog.far = 170;
  remplirProfils(); remplirMondes(); aideMenu();
  monde = ileAventure(); rendu.tout(monde); vitrine();
}
let persoVitrine = null;
function vitrine(){
  if(persoVitrine) scene.remove(persoVitrine);
  const P = profils().find(p => p.id === profil);
  persoVitrine = creerAvatar(avatarDe(profil), { numero: P && P.numero }); persoVitrine.traverse(o => { if(o.isMesh) o.castShadow = true; });
  persoVitrine.position.set(centre(21), (sol(monde, centre(21), centre(37)) || 1), centre(37)); persoVitrine.rotation.y = Math.PI * .85; scene.add(persoVitrine);
}
$("aventure").onclick = () => demarrerJeu(ileAventure(), "aventure");
$("nouvelIle").onclick = () => { const n = prompt("Comment s'appelle ton monde ?", "L'île de " + ((profils().find(p => p.id === profil) || {}).nom || "moi")); if(n === null) return; demarrerConstr(nouvelleIle(n.trim().slice(0, 30) || "Mon île")); };
$("nouvelOcean").onclick = () => { const n = prompt("Comment s'appelle ton monde ?", "Mon océan"); if(n === null) return; demarrerConstr(oceanVide(n.trim().slice(0, 30) || "Mon océan")); };

/* ======================= le jeu (marcher, nager, bateau, trésors) ======================= */
const R = .42, PAS = .55, GRAV = -30, SAUT = 11.8, VMARCHE = 7.5, VNAGE = 4, VBATEAU = 11;
let joueur = null, perso = null, camJ = { yaw: 0, pitch: .5, dist: 10 }, jeu = null;
function demarrerJeu(m, mode, ensemble){
  if(!ensemble) quitterPartie();
  etat = "jeu"; monde = m; $("menu").hidden = true; $("constr").hidden = true; $("hud").hidden = false; $("tactile").hidden = !tactile;
  if(persoVitrine){ scene.remove(persoVitrine); persoVitrine = null; }
  rendu.tout(monde);
  if(perso) scene.remove(perso);
  const P = profils().find(p => p.id === profil);
  perso = creerAvatar(avatarDe(profil), { numero: P && P.numero }); perso.traverse(o => { if(o.isMesh) o.castShadow = true; }); scene.add(perso);
  const x = monde.depart.x, z = monde.depart.z, s = sol(monde, x, z);
  joueur = { x, z, y: s === null ? NIVEAU_EAU - 1.5 : s, vy: 0, dir: Math.PI, auSol: true, nage: false, bateau: null, t: 0, v: 0 };
  camJ = { yaw: joueur.dir + Math.PI, pitch: .48, dist: 10 };
  const coffres = monde.objets.filter(o => o.k === "coffre").length;
  jeu = { mode, coffres, trouves: 0, pieces: 0, debut: performance.now(), fini: false };
  majCompte();
  $("boussole").hidden = coffres === 0; $("bouton").hidden = true;
  if(mode === "aventure"){ annonce("Ahoy !", "Trouve les " + coffres + " trésors de l'île"); dire("bienvenue"); }
  else { annonce(monde.nom, coffres ? "Trouve les " + coffres + " trésors" : "Promène-toi dans ton monde !"); dire(coffres ? "tresors-caches" : "ton-monde"); }
}
function majCompte(){
  $("compte").innerHTML = (jeu.coffres ? "<span>💰 " + jeu.trouves + " / " + jeu.coffres + "</span>" : "") + "<span>🪙 " + jeu.pieces + "</span>";
}
let msgT = 0, annT = 0;
function message(t, d){ $("message").textContent = t; $("message").classList.add("on"); msgT = d || 2.5; }
function annonce(t, s, d){ $("annonce").innerHTML = ""; $("annonce").append(t); if(s){ const sm = document.createElement("small"); sm.textContent = s; $("annonce").appendChild(sm); } $("annonce").classList.add("on"); annT = d || 2.6; }
$("quitter").onclick = () => { quitterPartie(); if(monde.retourConstr){ demarrerConstr(monde.retourConstr); return; } montrerMenu(); };
$("aideBtn").onclick = () => message(tactile ? "Rond à gauche : marcher · 🦘 sauter · ⚓ bateau · glisse pour tourner la caméra" : "Flèches / W A S D : marcher · Espace : sauter · E : bateau · souris : caméra", 5);

/* le sol le plus haut sous les pieds (on regarde le centre et 4 coins) */
function solSous(x, z, r){
  let h = null;
  for(const [a, b] of [[0, 0], [r, r], [-r, r], [r, -r], [-r, -r]]){ const s = sol(monde, x + a, z + b); if(s !== null && (h === null || s > h)) h = s; }
  return h;
}
function bloque(x, z, piedY, nage){
  for(const [a, b] of [[R, 0], [-R, 0], [0, R], [0, -R], [R * .7, R * .7], [-R * .7, R * .7], [R * .7, -R * .7], [-R * .7, -R * .7]]){
    const s = sol(monde, x + a, z + b);
    if(s === null) continue;
    if(nage){ if(s - NIVEAU_EAU > 1.75) return true; }   // on sort de l'eau seulement sur une plage basse
    else if(s > piedY + PAS) return true;
  }
  const lim = N * T / 2 + 10; if(Math.abs(x) > lim || Math.abs(z) > lim) return true;
  return false;
}
function pousserObjets(j){
  for(const o of monde.objets){
    const P = PAR_ID[o.k]; if(!P.r || P.dessus && j.y >= (hauteurCase(monde, o.i, o.j) || 0) + P.dessus - .05) continue;
    const dx = j.x - centre(o.i), dz = j.z - centre(o.j), d = Math.hypot(dx, dz), min = P.r + R;
    if(d < min && d > .001){ j.x = centre(o.i) + dx / d * min; j.z = centre(o.j) + dz / d * min; }
  }
}
function bateauProche(){
  let mieux = null, md = 4.2;
  for(const [, g] of rendu.speciaux){ if(g.userData.objet.k !== "bateau") continue; const d = Math.hypot(g.position.x - joueur.x, g.position.z - joueur.z); if(d < md){ md = d; mieux = g; } }
  return mieux;
}
function actionBateau(){
  if(!joueur.bateau){
    const b = bateauProche(); if(!b){ message("Il n'y a pas de bateau ici."); return; }
    if(b.userData.piloteDistant){ const a = autres.get(b.userData.piloteDistant); message("⛵ " + (a ? a.nom : "Un autre pirate") + " conduit déjà ce bateau !"); return; }
    joueur.bateau = b; b.userData.pilote = true; envoyer({ t: "bateau", o: b.userData.objet.id, pilote: true }); joueur.dir = b.rotation.y; message("⛵ Tu es le capitaine ! Avance et tourne avec les flèches.", 3.5); dire("capitaine"); bip(523, .2); setTimeout(() => bip(784, .25), 120);
    return;
  }
  // descendre : chercher une case de terre basse juste à côté
  const b = joueur.bateau; let mieux = null, md = 7;
  for(let j = caseX(b.position.z) - 3; j <= caseX(b.position.z) + 3; j++) for(let i = caseX(b.position.x) - 3; i <= caseX(b.position.x) + 3; i++){
    const h = hauteurCase(monde, i, j); if(h === null || h > 3) continue;
    const d = Math.hypot(centre(i) - b.position.x, centre(j) - b.position.z); if(d < md){ md = d; mieux = [i, j, h]; }
  }
  if(!mieux){ message("Approche-toi d'une plage pour descendre !"); dire("approche"); return; }
  b.userData.pilote = false; joueur.bateau = null; envoyer({ t: "bateau", o: b.userData.objet.id, pilote: false, x: b.position.x, z: b.position.z, r: b.rotation.y });
  joueur.x = centre(mieux[0]); joueur.z = centre(mieux[1]); joueur.y = mieux[2] + .05; joueur.vy = 0; bip(392, .15);
}
function majJeu(dt, t){
  const j = joueur; j.t += dt;
  // ----- ce que le joueur demande -----
  let ax = 0, az = 0, sauter = false, action = false, tourneCam = 0;
  if(touches.ArrowLeft || touches.KeyA) ax -= 1; if(touches.ArrowRight || touches.KeyD) ax += 1;
  if(touches.ArrowUp || touches.KeyW) az += 1; if(touches.ArrowDown || touches.KeyS) az -= 1;
  if(touches.Space) sauter = true;
  if(touches.KeyQ) tourneCam += 1; if(touches.KeyR) tourneCam -= 1;
  if(joy.id !== null){ ax += joy.x; az -= joy.y; }
  if(sautT){ sauter = true; sautT = false; }
  if(actionT){ action = true; actionT = false; }
  if(appuiE){ action = true; appuiE = false; }
  const m = lireManette();
  if(m){ ax += m.x; az -= m.y; if(m.a) sauter = true; if(m.nB || m.nC) action = true; if(m.l1) tourneCam += 1; if(m.r1) tourneCam -= 1; }
  camJ.yaw += tourneCam * dt * 2.2;
  const l = Math.hypot(ax, az); if(l > 1){ ax /= l; az /= l; }
  if(action) actionBateau();

  // ----- en bateau -----
  if(j.bateau){
    const b = j.bateau;
    j.dir += -ax * dt * 1.8;
    const v = az * VBATEAU, nx = b.position.x + Math.sin(j.dir) * v * dt, nz = b.position.z + Math.cos(j.dir) * v * dt;
    // le bateau ne va que sur l'eau (on teste l'avant et les côtés)
    let ok = true; for(const [a, c] of [[0, 2.8], [1.1, 1.5], [-1.1, 1.5], [0, -2.6]]){ const px = nx + Math.sin(j.dir) * c * Math.sign(v || 1) + Math.cos(j.dir) * a, pz = nz + Math.cos(j.dir) * c * Math.sign(v || 1) - Math.sin(j.dir) * a;
      if(sol(monde, px, pz) !== null){ ok = false; break; } const lim = N * T / 2 + 14; if(Math.abs(px) > lim || Math.abs(pz) > lim) ok = false; }
    if(ok){ b.position.x = nx; b.position.z = nz; }
    b.rotation.y = j.dir; b.position.y = NIVEAU_EAU + Math.sin(t * 2) * .1; b.rotation.z = -ax * .08 + Math.sin(t * 1.7) * .03;
    j.x = b.position.x - Math.sin(j.dir) * 1.4; j.z = b.position.z - Math.cos(j.dir) * 1.4; j.y = b.position.y + .55; j.v = Math.abs(v);
    b.userData.voile.scale.z = 1 + Math.abs(az) * .3;
    perso.position.set(j.x, j.y, j.z); perso.rotation.y = j.dir; animerAvatar(perso, t, "repos");
    // la caméra se replace doucement derrière le bateau
    if(Math.abs(az) > .1 && !glisse){ let d = (j.dir + Math.PI) - camJ.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); camJ.yaw += d * Math.min(1, dt * 1.5); }
  } else {
    // ----- à pied -----
    const yaw = camJ.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw);   // devant = là où regarde la caméra
    const vx = (fx * az + -fz * ax), vz = (fz * az + fx * ax);
    const vit = j.nage ? VNAGE : VMARCHE;
    if(l > .05){ const cible = Math.atan2(vx, vz); let d = cible - j.dir; d = Math.atan2(Math.sin(d), Math.cos(d)); j.dir += d * Math.min(1, dt * 12); }
    const nx = j.x + vx * vit * dt, nz = j.z + vz * vit * dt;
    if(!bloque(nx, j.z, j.y, j.nage)) j.x = nx;
    if(!bloque(j.x, nz, j.y, j.nage)) j.z = nz;
    pousserObjets(j);
    j.v = l * vit;
    const s = solSous(j.x, j.z, R * .6);
    if(s === null){
      // dans l'eau : on flotte
      if(!j.nage && j.y < NIVEAU_EAU + .2){ j.nage = true; bip(220, .2, "sine", .06); }
      if(j.nage){ j.vy = 0; j.y += ((NIVEAU_EAU - 1.55) - j.y) * Math.min(1, dt * 6); j.auSol = false; }
      else { j.y += j.vy * dt + .5 * GRAV * dt * dt; j.vy += GRAV * dt; /* exact, même si l'ordinateur est lent */ }
    } else {
      if(j.nage){ j.nage = false; j.y = Math.max(j.y, s); }
      if(sauter && j.auSol){ j.vy = SAUT; j.auSol = false; sonSaut(); }
      j.y += j.vy * dt + .5 * GRAV * dt * dt; j.vy += GRAV * dt; /* exact, même si l'ordinateur est lent */
      if(j.y <= s){ if(s - j.y < PAS + .05 || j.vy <= 0){ j.y = s; j.vy = 0; j.auSol = true; } }
      else if(j.y > s + .05) j.auSol = false;
    }
    if(j.y < -30){ j.x = monde.depart.x; j.z = monde.depart.z; j.y = (sol(monde, j.x, j.z) || 0) + 2; j.vy = 0; }
    perso.position.set(j.x, j.y, j.z); perso.rotation.y = j.dir;
    if(j.nage){ animerAvatar(perso, j.t * 6, "course", 4); perso.userData.corps.rotation.x = .5; }
    else { perso.userData.corps.rotation.x = 0; if(!j.auSol){ animerAvatar(perso, 0, "course", 0); perso.userData.bras[0].rotation.z = -.9; perso.userData.bras[1].rotation.z = .9; }
      else if(j.v > .5) animerAvatar(perso, j.t * 11, "course", j.v); else animerAvatar(perso, t, "repos"); }
  }

  // ----- trésors, pièces, crabes -----
  for(const [, g] of rendu.speciaux){
    const o = g.userData.objet, d = Math.hypot(g.position.x - j.x, g.position.z - j.z);
    if(o.k === "coffre" && g.userData.ouverture === undefined && d < 2 && Math.abs(g.position.y - j.y) < 2.2){
      ouvrirCoffre(g, null); envoyer({ t: "coffre", o: o.id });
    }
    if(o.k === "piece" && g.visible && d < 1.4 && Math.abs(g.position.y + 1 - j.y - 1) < 2){ g.visible = false; jeu.pieces++; majCompte(); sonPiece(); envoyer({ t: "piece", o: o.id }); }
    if(o.k === "crabe" && d < 1.3 && !g.userData.pris){ g.userData.pris = true; message("🦀 Pince pince !"); bip(700, .08, "square", .04); setTimeout(() => { g.userData.pris = false; }, 2500); }
  }
  // ----- les autres pirates (jouer ensemble) -----
  if(partie){ envoiT -= dt; if(envoiT <= 0){ envoiT = .12; envoyer(etatJoueur()); } }
  majAutres(dt, t);
  // ----- la boussole : vers le trésor le plus proche -----
  if(jeu.coffres){
    let cible = null, md = 1e9;
    for(const [, g] of rendu.speciaux){ if(g.userData.objet.k !== "coffre" || g.userData.ouverture !== undefined) continue; const d = Math.hypot(g.position.x - j.x, g.position.z - j.z); if(d < md){ md = d; cible = g; } }
    const fl = $("boussole").firstElementChild;
    if(cible){ const a = Math.atan2(cible.position.x - j.x, cible.position.z - j.z), rel = a - (camJ.yaw + Math.PI); fl.style.transform = "rotate(" + (-rel) + "rad)"; fl.textContent = md < 8 ? "💰" : "⬆️"; if(md < 8) fl.style.transform = ""; }
    else fl.textContent = "🎉";
  }
  // ----- la caméra suit le joueur -----
  const cx = j.x + Math.sin(camJ.yaw) * Math.cos(camJ.pitch) * camJ.dist, cz = j.z + Math.cos(camJ.yaw) * Math.cos(camJ.pitch) * camJ.dist;
  let cy = j.y + 1.6 + Math.sin(camJ.pitch) * camJ.dist;
  const sc = sol(monde, cx, cz); if(sc !== null && cy < sc + 1.2) cy = sc + 1.2; if(cy < NIVEAU_EAU + .6) cy = NIVEAU_EAU + .6;
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 10)); camera.lookAt(j.x, j.y + 1.6, j.z);
  suivreSoleil(j.x, j.z);
}
function ouvrirCoffre(g, qui){
  if(g.userData.ouverture !== undefined) return;
  g.userData.ouverture = 0; jeu.trouves++; majCompte(); sonTresor();
  if(jeu.trouves >= jeu.coffres){ if(!jeu.fini) victoire(); }
  else if(qui) annonce(qui + " a trouvé un trésor !", "Encore " + (jeu.coffres - jeu.trouves));
  else { annonce("Un trésor !", "Encore " + (jeu.coffres - jeu.trouves)); dire("tresor"); }
}

/* ======================= jouer ensemble ======================= */
let partie = null, autres = new Map(), envoiT = 0;
function monNom(){ const P = profils().find(p => p.id === profil); return P ? P.nom : "Pirate"; }
function monNumero(){ const P = profils().find(p => p.id === profil); return P && P.numero; }
function envoyer(m){ if(partie) partie.envoyer(m); }
function etatJoueur(){
  const j = joueur, b = j.bateau;
  return { t: "pos", x: +j.x.toFixed(2), y: +j.y.toFixed(2), z: +j.z.toFixed(2), d: +j.dir.toFixed(2), v: +j.v.toFixed(1), n: j.nage ? 1 : 0, s: j.auSol ? 1 : 0,
    b: b ? [b.userData.objet.id, +b.position.x.toFixed(2), +b.position.z.toFixed(2), +b.rotation.y.toFixed(2)] : null };
}
function etiquette(nom){
  const c = document.createElement("canvas"); c.width = 256; c.height = 64; const x = c.getContext("2d");
  x.font = "bold 34px Fredoka, Arial, sans-serif"; const w = Math.min(244, x.measureText(nom).width + 28);
  x.fillStyle = "rgba(29,35,87,.8)"; x.beginPath(); x.roundRect ? x.roundRect(128 - w / 2, 8, w, 48, 24) : x.rect(128 - w / 2, 8, w, 48); x.fill();
  x.fillStyle = "#FFF8E7"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(nom, 128, 33);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(2.6, .65, 1); sp.position.y = 3.3; sp.renderOrder = 10;
  return sp;
}
function ajouterAutre(id, nom, avatar, numero){
  if(!id || id === (partie && partie.moi) || autres.has(id)) return;
  const g = creerAvatar(avatar || {}, { numero }); g.traverse(o => { if(o.isMesh) o.castShadow = true; }); g.add(etiquette(nom || "Pirate"));
  g.visible = false; scene.add(g);
  autres.set(id, { g, nom: nom || "Pirate", avatar, numero, c: null, t: 0 });
  majEquipage();
}
function enleverAutre(id){
  const a = autres.get(id); if(!a) return;
  scene.remove(a.g); autres.delete(id);
  for(const [, g] of rendu.speciaux) if(g.userData.piloteDistant === id) g.userData.piloteDistant = null;
  majEquipage();
}
function majEquipage(){
  const e = $("equipage"); if(!partie){ e.hidden = true; return; }
  e.hidden = false; e.textContent = "👫 " + [monNom() + " (toi)"].concat([...autres.values()].map(a => a.nom)).join(", ") + (partie.role === "capitaine" ? " · code " + partie.code : "");
}
function majAutres(dt, t){
  for(const [, a] of autres){
    if(!a.c) continue;
    const g = a.g, k = Math.min(1, dt * 12);
    g.visible = true;
    g.position.x += (a.c.x - g.position.x) * k; g.position.y += (a.c.y - g.position.y) * k; g.position.z += (a.c.z - g.position.z) * k;
    let d = a.c.d - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * k;
    a.t += dt;
    if(a.c.n){ animerAvatar(g, a.t * 6, "course", 4); g.userData.corps.rotation.x = .5; }
    else { g.userData.corps.rotation.x = 0; if(a.c.b) animerAvatar(g, t, "repos"); else if(!a.c.s) animerAvatar(g, 0, "course", 0); else if(a.c.v > .5) animerAvatar(g, a.t * 11, "course", a.c.v); else animerAvatar(g, t, "repos"); }
    if(a.c.b){ const b = rendu.speciaux.get(a.c.b[0]); if(b){ b.position.x += (a.c.b[1] - b.position.x) * k; b.position.z += (a.c.b[2] - b.position.z) * k; b.rotation.y = a.c.b[3]; } }
  }
}
function recevoir(m){
  if(etat !== "jeu" || !jeu) return;
  if(m.t === "bonjour"){ ajouterAutre(m.de, m.nom, m.avatar, m.numero); message("🏴‍☠️ " + (m.nom || "Un pirate") + " arrive sur l'île !", 3); bip(660, .15); setTimeout(() => bip(880, .2), 120); }
  else if(m.t === "pos"){ const a = autres.get(m.de); if(a) a.c = m; }
  else if(m.t === "coffre"){ const g = rendu.speciaux.get(m.o); const a = autres.get(m.de); if(g) ouvrirCoffre(g, a ? a.nom : "Un pirate"); }
  else if(m.t === "piece"){ const g = rendu.speciaux.get(m.o); if(g && g.visible){ g.visible = false; jeu.pieces++; majCompte(); } }
  else if(m.t === "bateau"){ const g = rendu.speciaux.get(m.o); if(g){ g.userData.piloteDistant = m.pilote ? m.de : null; g.userData.pilote = !!m.pilote; if(!m.pilote && m.x !== undefined){ g.position.x = m.x; g.position.z = m.z; g.rotation.y = m.r; } } }
  else if(m.t === "parti"){ const a = autres.get(m.de); if(a){ message("👋 " + a.nom + " a quitté la partie", 3); enleverAutre(m.de); } }
  else if(m.t === "fin"){ annonce("La partie est finie", "Le capitaine a quitté la partie", 4); quitterPartie(); setTimeout(() => { if(etat === "jeu") montrerMenu(); }, 3500); }
}
function quitterPartie(){
  if(!partie) return;
  partie.fermer(); partie = null;
  for(const id of [...autres.keys()]) enleverAutre(id);
  $("equipage").hidden = true;
}
function majJournal(){ const j = $("ensJournal"); if(!partie || !j) return; j.textContent = partie.journal.slice(-14).join("\n") + "\n— reçus " + partie.compteurs.recus + " · envoyés " + partie.compteurs.envoyes + (partie.compteurs.rejetes ? " · illisibles " + partie.compteurs.rejetes : ""); }
setInterval(majJournal, 1000);
$("equipage").addEventListener("click", () => { $("ensemble").hidden = false; $("ensTitre").textContent = "Journal de connexion"; $("ensCode").hidden = !(partie && partie.code); $("ensCode").textContent = partie ? partie.code : ""; $("ensTexte").textContent = "Prends une photo de cet écran si quelque chose ne marche pas."; $("ensSaisie").hidden = true; $("ensOk").hidden = true; majJournal(); });
function fenetre(titre, code, texte, saisie){
  $("ensemble").hidden = false; $("ensTitre").textContent = titre; $("ensCode").textContent = code || ""; $("ensCode").hidden = !code; $("ensTexte").textContent = texte || "";
  $("ensSaisie").hidden = !saisie; $("ensOk").hidden = !saisie; if(saisie){ $("ensSaisie").value = ""; setTimeout(() => $("ensSaisie").focus(), 50); }
}
$("ensAnnuler").onclick = () => { $("ensemble").hidden = true; if(etat !== "jeu") quitterPartie(); };
function heberger(m, mode){
  const propre = depuisTexte(versTexte(m)); propre.cle = m.cle; propre.nom = m.nom;   // mêmes numéros d'objets chez tout le monde
  const texte = versTexte(propre);
  fenetre("Création de la partie…", "", "Un instant, on prépare le bateau ⛵");
  partie = new Partie(recevoir); partie.surNote = majJournal; partie.note("capitaine : création de la partie");
  partie.creer({
    monde: () => texte,
    etat: () => ({ mode, ouverts: [...rendu.speciaux.values()].filter(g => g.userData.ouverture !== undefined).map(g => g.userData.objet.id),
      prises: [...rendu.speciaux.values()].filter(g => g.userData.objet.k === "piece" && !g.visible).map(g => g.userData.objet.id), pieces: jeu ? jeu.pieces : 0 }),
    joueurs: () => [{ id: partie.moi, nom: monNom(), avatar: avatarDe(profil), numero: monNumero() }].concat([...autres.entries()].map(([id, a]) => ({ id, nom: a.nom, avatar: a.avatar, numero: a.numero })))
  }).then(code => {
    demarrerJeu(propre, mode, true);
    fenetre("Ta partie est prête !", code, "Sur l'autre appareil : ouvre « L'Île des Pirates », appuie sur « Rejoindre une partie » et tape ce code. Le code reste affiché en haut à gauche.");
    setTimeout(() => { if(partie && !$("ensemble").hidden) $("ensTexte").textContent += " (connexion : " + partie.servicesOk() + " service" + (partie.servicesOk() > 1 ? "s" : "") + " sur 3 répondent ✅)"; }, 4000);
    $("ensAnnuler").textContent = "▶ C'est parti !";
    $("ensAnnuler").onclick = () => { $("ensemble").hidden = true; $("ensAnnuler").textContent = "Retour"; $("ensAnnuler").onclick = () => { $("ensemble").hidden = true; if(etat !== "jeu") quitterPartie(); }; };
    majEquipage();
  }).catch(e => { quitterPartie(); fenetre("Impossible de créer la partie", "", "Aucun des 3 services de connexion ne répond. Vérifie qu'Internet marche (une page web s'ouvre-t-elle ?), puis réessaie dans un moment."); });
}
$("creerPartie").onclick = () => heberger(ileAventure(), "aventure");
$("rejoindre").onclick = () => { fenetre("Rejoindre une partie", "", "Tape le code à 4 chiffres affiché sur l'appareil du capitaine.", true); };
$("ensSaisie").addEventListener("keydown", (e) => { if(e.key === "Enter") $("ensOk").onclick(); });
$("ensOk").onclick = () => {
  const code = $("ensSaisie").value.replace(/\D/g, "");
  if(code.length !== 4){ $("ensTexte").textContent = "Le code a 4 chiffres, par exemple 4821."; return; }
  fenetre("Connexion…", code, "On cherche le bateau du capitaine ⛵");
  partie = new Partie(recevoir); partie.surNote = majJournal; partie.note("matelot : je rejoins la partie " + code);
  partie.rejoindre(code, { nom: monNom(), avatar: avatarDe(profil), numero: monNumero() }).then(b => {
    $("ensemble").hidden = true;
    const m = depuisTexte(b.monde);
    demarrerJeu(m, b.etat.mode || "libre", true);
    (b.joueurs || []).forEach(p => ajouterAutre(p.id, p.nom, p.avatar, p.numero));
    for(const id of b.etat.ouverts || []){ const g = rendu.speciaux.get(id); if(g){ g.userData.ouverture = 1; g.userData.couvercle.rotation.x = -1.9; g.userData.tresor.visible = true; jeu.trouves++; } }
    for(const id of b.etat.prises || []){ const g = rendu.speciaux.get(id); if(g) g.visible = false; }
    jeu.pieces = b.etat.pieces || 0; majCompte(); majEquipage();
    message("🏴‍☠️ Tu as rejoint la partie !", 3);
  }).catch(e => { quitterPartie(); fenetre("Impossible de rejoindre", "", (e && e.type === "peer-unavailable") ? "Aucune partie avec ce code. Vérifie le code sur l'appareil du capitaine." : "Aucune partie trouvée. Vérifie le code sur l'appareil du capitaine (la partie doit être ouverte), et qu'Internet marche. Puis réessaie."); });
};

function victoire(){
  jeu.fini = true; const s = Math.round((performance.now() - jeu.debut) / 1000);
  annonce("Bravo capitaine !", "Tous les trésors en " + Math.floor(s / 60) + " min " + (s % 60) + " s · 🪙 " + jeu.pieces, 6); dire("bravo");
  if(jeu.mode === "aventure"){ const k = "pirates-record-" + profil, r = parseInt(lire(k, "0"), 10); if(!r || s < r){ ecrire(k, String(s)); setTimeout(() => message("🏆 Nouveau record !", 4), 2500); } }
  for(let k = 0; k < 6; k++) setTimeout(sonTresor, k * 400);
  $("bouton").hidden = false; $("bouton").textContent = "🏠 Retour au menu"; $("bouton").onclick = () => { quitterPartie(); if(monde.retourConstr) demarrerConstr(monde.retourConstr); else montrerMenu(); };
}
let appuiE = false;
function quandTouche(e){
  if(etat === "jeu" && (e.code === "KeyE" || e.code === "Enter") && !e.repeat) appuiE = true;
  if(etat === "jeu" && e.code === "Space" && !e.repeat) sautT = true;   // même un appui très court compte (ordinateurs lents)
  if(etat === "jeu" && e.code === "Escape"){ quitterPartie(); if(monde.retourConstr) demarrerConstr(monde.retourConstr); else montrerMenu(); }
  if(etat === "constr") toucheConstr(e);
}

/* ======================= construire son monde ======================= */
let camC = { x: 0, z: 0, yaw: .6, pitch: .95, dist: 42 }, outil = { cat: "terrain", id: "sable" }, couleur = 0, rotation = 0, pinceau = 1;
let annuler = [], fantome = null, survol = null, appui = null, sauveT = 0;
const CATS = [
  { id:"terrain", nom:"🏝️ Terrain" }, { id:"hauteur", nom:"⛰️ Monter / Descendre" }, { id:"couleur", nom:"🎨 Blocs de couleur" },
  { id:"nature", nom:"🌴 Nature" }, { id:"pirate", nom:"🏴‍☠️ Pirates" }, { id:"tresor", nom:"💰 Trésors" }, { id:"outils", nom:"🧽 Gomme & départ" }
];
const OBJ_CAT = { nature: ["palmier", "arbre", "fleurs", "rocher", "coquillage", "crabe"], pirate: ["bateau", "cabane", "tente", "drapeau", "canon", "tonneau", "caisse", "feu", "torche", "phare"], tresor: ["coffre", "piece"] };
function demarrerConstr(m){
  etat = "constr"; monde = m; monde.retourConstr = null;
  $("menu").hidden = true; $("hud").hidden = true; $("constr").hidden = false;
  if(persoVitrine){ scene.remove(persoVitrine); persoVitrine = null; } if(perso){ scene.remove(perso); perso = null; }
  rendu.tout(monde); annuler = [];
  camC = { x: 0, z: 0, yaw: .6, pitch: .95, dist: 46 };
  if(!fantome){ fantome = new THREE.Mesh(new THREE.BoxGeometry(T, 1, T), new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: .35, depthWrite: false })); fantome.geometry.translate(0, .5, 0); scene.add(fantome); }
  fantome.visible = false;
  if(!depart3D){ depart3D = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.4, 4), new THREE.MeshBasicMaterial({ color: "#FF4FB0" })); depart3D.rotation.x = Math.PI; scene.add(depart3D); }
  depart3D.visible = true;
  $("cNom").textContent = "🏝️ " + monde.nom; remplirCats(); remplirPalette(); majInfo();
  enregistrerMonde(monde);
}
let depart3D = null;
function remplirCats(){
  const box = $("categories"); box.innerHTML = "";
  CATS.forEach(c => { const b = document.createElement("button"); b.textContent = c.nom; if(outil.cat === c.id) b.className = "on";
    b.onclick = () => { outil.cat = c.id; outil.id = c.id === "terrain" ? "sable" : c.id === "hauteur" ? "monter" : c.id === "couleur" ? "bloc" : c.id === "outils" ? "gomme" : OBJ_CAT[c.id][0]; remplirCats(); remplirPalette(); majInfo(); bip(520, .06); };
    box.appendChild(b); });
}
function bouton(e, nom, on, f){ const b = document.createElement("button"); b.innerHTML = e + "<small>" + nom + "</small>"; if(on) b.className = "on"; b.onclick = f; $("palette").appendChild(b); return b; }
function remplirPalette(){
  const box = $("palette"); box.innerHTML = "";
  const choisir = (id) => () => { outil.id = id; remplirPalette(); majInfo(); bip(600, .05); };
  if(outil.cat === "terrain") TERRAINS.filter(t => t.id !== "bloc").forEach(t => bouton(t.e, t.nom, outil.id === t.id, choisir(t.id)));
  if(outil.cat === "hauteur"){ bouton("⬆️", "Monter", outil.id === "monter", choisir("monter")); bouton("⬇️", "Descendre", outil.id === "descendre", choisir("descendre")); }
  if(outil.cat === "couleur" || (OBJ_CAT[outil.cat] && OBJ_CAT[outil.cat].some(k => PAR_ID[k].couleur))){
    if(OBJ_CAT[outil.cat]) OBJ_CAT[outil.cat].forEach(k => bouton(PAR_ID[k].e, PAR_ID[k].nom, outil.id === k, choisir(k)));
    if(outil.cat === "couleur" || PAR_ID[outil.id] && PAR_ID[outil.id].couleur) COULEURS.forEach((c, n) => { const b = document.createElement("button"); b.className = "coul" + (couleur === n ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", "Couleur");
      b.onclick = () => { couleur = n; remplirPalette(); bip(700, .05); }; box.appendChild(b); });
  } else if(OBJ_CAT[outil.cat]) OBJ_CAT[outil.cat].forEach(k => bouton(PAR_ID[k].e, PAR_ID[k].nom, outil.id === k, choisir(k)));
  if(OBJ_CAT[outil.cat]) bouton("↻", "Tourner", false, () => { rotation = (rotation + 1) % 4; bip(500, .05); message2("Les prochains objets seront tournés ↻"); });
  if(["terrain", "hauteur", "couleur"].includes(outil.cat)){ bouton(pinceau === 1 ? "▪️" : "⬛", pinceau === 1 ? "Petit pinceau" : "Gros pinceau", false, () => { pinceau = pinceau === 1 ? 3 : 1; remplirPalette(); }); }
  if(outil.cat === "outils"){ bouton("🧽", "Gomme (objets)", outil.id === "gomme", choisir("gomme")); bouton("🚩", "Point de départ", outil.id === "depart", choisir("depart"));
    bouton("✏️", "Changer le nom", false, () => { const n = prompt("Le nom de ton monde :", monde.nom); if(n){ monde.nom = n.trim().slice(0, 30); $("cNom").textContent = "🏝️ " + monde.nom; enregistrerMonde(monde); } }); }
}
function majInfo(){
  const noms = { monter: "⬆️ Touche le sol pour le monter", descendre: "⬇️ Touche le sol pour le descendre", gomme: "🧽 Touche un objet pour l'enlever", depart: "🚩 Touche l'endroit où ton pirate commence", bloc: "🎨 Touche le sol pour poser des blocs de couleur", eau: "🌊 Touche la terre pour creuser l'eau" };
  let t = noms[outil.id];
  if(!t && TERRAINS.find(x => x.id === outil.id)) t = "Touche (ou glisse) pour mettre : " + TERRAINS.find(x => x.id === outil.id).nom;
  if(!t && PAR_ID[outil.id]) t = "Touche le sol pour poser : " + PAR_ID[outil.id].nom + (PAR_ID[outil.id].eau ? " (sur l'eau)" : "");
  $("info").textContent = t || "";
}
let info2T = 0;
function message2(t){ $("info").textContent = t; info2T = 2; }

/* trouver la case visée : on avance le long du rayon jusqu'à toucher le sol ou l'eau */
const rc = new THREE.Raycaster();
function caseVisee(e){
  const r = canvas.getBoundingClientRect(), p = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  rc.setFromCamera(p, camera); const o = rc.ray.origin, d = rc.ray.direction;
  for(let s = 0; s < 400; s += .25){
    const x = o.x + d.x * s, y = o.y + d.y * s, z = o.z + d.z * s, i = caseX(x), j = caseX(z);
    if(!dedans(i, j)){ if(y < NIVEAU_EAU) return null; continue; }
    const h = hauteurCase(monde, i, j);
    if(y <= (h === null ? NIVEAU_EAU : h)) return [i, j];
  }
  return null;
}
function constrDown(e){
  if(e.button === 2){ appui = { rot: true, x: e.clientX, y: e.clientY, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); return; }
  const c = caseVisee(e); appui = { id: e.pointerId, deja: new Set(), x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
  if(c){ instantane(); appliquer(c[0], c[1], appui.deja); }
}
function constrMove(e){
  if(appui && appui.rot && e.pointerId === appui.id){ camC.yaw -= (e.clientX - appui.x) * .006; camC.pitch = Math.max(.35, Math.min(1.45, camC.pitch + (e.clientY - appui.y) * .004)); appui.x = e.clientX; appui.y = e.clientY; return; }
  const c = caseVisee(e); survol = c;
  // glisser pour peindre (terrain, hauteur, couleur) — les objets se posent un par un
  if(appui && !appui.rot && e.pointerId === appui.id && c && ["terrain", "hauteur", "couleur"].includes(outil.cat)) appliquer(c[0], c[1], appui.deja);
}
function constrUp(e){ if(appui && e.pointerId === appui.id) appui = null; }
function instantane(){ annuler.push(versTexte(monde)); if(annuler.length > 30) annuler.shift(); }
$("cAnnuler").onclick = () => { if(!annuler.length){ message2("Rien à annuler"); return; } const m = depuisTexte(annuler.pop()); m.cle = monde.cle; m.auteur = monde.auteur; monde = m; rendu.tout(monde); enregistrerMonde(monde); bip(300, .1); };
function appliquer(i0, j0, deja){
  const id = outil.id, cases = [];
  const r = ["terrain", "hauteur", "couleur"].includes(outil.cat) ? (pinceau - 1) / 2 : 0;
  for(let j = j0 - r; j <= j0 + r; j++) for(let i = i0 - r; i <= i0 + r; i++) if(dedans(i, j) && !deja.has(i + "," + j)){ cases.push([i, j]); deja.add(i + "," + j); }
  if(!cases.length) return;
  let terrainChange = false, objChange = false;
  for(const [i, j] of cases){
    const k = idx(i, j), eau = monde.t[k] === 0;
    if(outil.cat === "terrain"){
      if(id === "eau"){ if(!eau){ monde.t[k] = 0; monde.h[k] = 0; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j && !PAR_ID[o.k].eau)); terrainChange = objChange = true; } }
      else { const t = TERRAINS.findIndex(x => x.id === id); if(monde.t[k] !== t || eau){ monde.t[k] = t; if(eau){ monde.h[k] = 1; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j && PAR_ID[o.k].eau)); } terrainChange = true; } }
    } else if(outil.cat === "couleur"){
      if(monde.t[k] !== 6 || monde.c[k] !== couleur){ if(eau){ monde.h[k] = 1; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j && PAR_ID[o.k].eau)); } monde.t[k] = 6; monde.c[k] = couleur; terrainChange = true; }
    } else if(id === "monter"){
      if(eau){ monde.t[k] = 1; monde.h[k] = 1; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j && PAR_ID[o.k].eau)); }
      else if(monde.h[k] < HMAX) monde.h[k]++;
      else { message2("C'est déjà tout en haut !"); continue; }
      terrainChange = objChange = true;
    } else if(id === "descendre"){
      if(eau) continue;
      monde.h[k]--; if(monde.h[k] <= 0){ monde.t[k] = 0; monde.h[k] = 0; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j && !PAR_ID[o.k].eau)); }
      terrainChange = objChange = true;
    } else if(id === "gomme"){
      const n = monde.objets.length; monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j)); if(monde.objets.length !== n) objChange = true; else message2("Il n'y a pas d'objet ici");
    } else if(id === "depart"){
      if(eau){ message2("Le départ doit être sur la terre"); continue; }
      monde.depart = { x: centre(i), z: centre(j) }; message2("🚩 Ton pirate commencera ici !"); bip(880, .1);
    } else if(PAR_ID[id]){
      const P = PAR_ID[id];
      if(P.eau && !eau){ message2("Le bateau se pose sur l'eau !"); continue; }
      if(!P.eau && eau){ message2("Pose-le sur la terre !"); continue; }
      monde.objets = monde.objets.filter(o => !(o.i === i && o.j === j));
      if(P.eau){ // le bateau prend de la place : on enlève les autres bateaux trop près
        monde.objets = monde.objets.filter(o => !(PAR_ID[o.k].eau && Math.abs(o.i - i) < 3 && Math.abs(o.j - j) < 3));
      }
      ajouterObjet(monde, id, i, j, { r: rotation, c: couleur }); objChange = true;
    }
  }
  if(terrainChange) rendu.terrainDe(monde);
  if(objChange || terrainChange) rendu.objetsDe(monde);
  if(terrainChange || objChange){ sonPose(); sauveT = .8; }
}
document.querySelectorAll("#cam button").forEach(b => {
  let rep = null;
  const faire = () => { const c = b.dataset.c, s = 4, fx = -Math.sin(camC.yaw), fz = -Math.cos(camC.yaw);
    if(c === "av"){ camC.x += fx * s; camC.z += fz * s; } if(c === "re"){ camC.x -= fx * s; camC.z -= fz * s; }
    if(c === "ga"){ camC.x += fz * s; camC.z -= fx * s; } if(c === "dr"){ camC.x -= fz * s; camC.z += fx * s; }
    if(c === "rg") camC.yaw += .3; if(c === "rd") camC.yaw -= .3; if(c === "zp") camC.dist = Math.max(12, camC.dist * .85); if(c === "zm") camC.dist = Math.min(75, camC.dist * 1.15);
    if(c === "haut") camC.pitch = camC.pitch > 1.2 ? .95 : 1.42; };
  b.addEventListener("pointerdown", (e) => { e.preventDefault(); faire(); clearInterval(rep); rep = setInterval(faire, 140); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => clearInterval(rep)));
});
function toucheConstr(e){
  if(e.code === "KeyZ" && (e.ctrlKey || e.metaKey)){ $("cAnnuler").onclick(); e.preventDefault(); }
}
$("cMenu").onclick = () => { enregistrerMonde(monde); depart3D.visible = false; fantome.visible = false; montrerMenu(); };
$("cJouer").onclick = () => {
  enregistrerMonde(monde); depart3D.visible = false; fantome.visible = false;
  const copie = depuisTexte(versTexte(monde)); copie.cle = monde.cle; copie.retourConstr = monde;
  demarrerJeu(copie, "libre");
};
function majConstr(dt){
  // déplacer la caméra au clavier
  const s = dt * camC.dist * .9, fx = -Math.sin(camC.yaw), fz = -Math.cos(camC.yaw);
  if(touches.ArrowUp || touches.KeyW){ camC.x += fx * s; camC.z += fz * s; } if(touches.ArrowDown || touches.KeyS){ camC.x -= fx * s; camC.z -= fz * s; }
  if(touches.ArrowLeft || touches.KeyA){ camC.x += fz * s; camC.z -= fx * s; } if(touches.ArrowRight || touches.KeyD){ camC.x -= fz * s; camC.z += fx * s; }
  if(touches.KeyQ) camC.yaw += dt * 1.5; if(touches.KeyE) camC.yaw -= dt * 1.5;
  const m = lireManette(); if(m){ camC.x += (fx * -m.y - fz * m.x) * s; camC.z += (fz * -m.y + fx * m.x) * s; if(m.l1) camC.yaw += dt * 1.5; if(m.r1) camC.yaw -= dt * 1.5; }
  const lim = N * T / 2; camC.x = Math.max(-lim, Math.min(lim, camC.x)); camC.z = Math.max(-lim, Math.min(lim, camC.z));
  camera.position.set(camC.x + Math.sin(camC.yaw) * Math.cos(camC.pitch) * camC.dist, Math.sin(camC.pitch) * camC.dist, camC.z + Math.cos(camC.yaw) * Math.cos(camC.pitch) * camC.dist);
  camera.lookAt(camC.x, 0, camC.z);
  suivreSoleil(camC.x, camC.z);
  if(survol && !tactile){ const h = hauteurCase(monde, survol[0], survol[1]); fantome.visible = true; fantome.scale.set(pinceau > 1 && ["terrain", "hauteur", "couleur"].includes(outil.cat) ? 3 : 1, .3, pinceau > 1 && ["terrain", "hauteur", "couleur"].includes(outil.cat) ? 3 : 1);
    fantome.position.set(centre(survol[0]), (h === null ? NIVEAU_EAU : h) + .02, centre(survol[1])); } else fantome.visible = false;
  const dj = sol(monde, monde.depart.x, monde.depart.z); depart3D.position.set(monde.depart.x, (dj === null ? 0 : dj) + 1.6 + Math.sin(performance.now() / 300) * .2, monde.depart.z);
  if(sauveT > 0){ sauveT -= dt; if(sauveT <= 0) enregistrerMonde(monde); }
  if(info2T > 0){ info2T -= dt; if(info2T <= 0) majInfo(); }
}

/* ======================= la boucle ======================= */
let avant = performance.now(), t0 = avant, angleMenu = 0;
function boucle(now){
  requestAnimationFrame(boucle);
  const dt = Math.min(.05, (now - avant) / 1000); avant = now; const t = (now - t0) / 1000;
  rendu.animer(t, dt);
  if(etat === "menu"){
    angleMenu += dt * .08;
    const cx = centre(21), cz = centre(37), s = sol(monde, cx, cz) || 1;
    camera.position.set(cx + Math.sin(angleMenu) * 9 - 3, s + 4.2, cz + Math.cos(angleMenu) * 9); camera.lookAt(cx - 3.5, s + 1.6, cz);
    if(persoVitrine){ persoVitrine.rotation.y = Math.atan2(camera.position.x - persoVitrine.position.x, camera.position.z - persoVitrine.position.z); animerAvatar(persoVitrine, t, Math.floor(t / 4) % 3 === 0 ? "salut" : "repos"); }
    suivreSoleil(cx, cz);
    $("etatManette").textContent = vraiesManettes().length ? "🎮 Manette connectée !" : "";
  } else if(etat === "jeu") majJeu(dt, t);
  else if(etat === "constr") majConstr(dt);
  if(msgT > 0){ msgT -= dt; if(msgT <= 0) $("message").classList.remove("on"); }
  if(annT > 0){ annT -= dt; if(annT <= 0) $("annonce").classList.remove("on"); }
  renderer.render(scene, camera);
}
montrerMenu();
requestAnimationFrame(boucle);
if(TEST) window.__pirates = { get etat(){ return etat; }, get joueur(){ return joueur; }, get jeu(){ return jeu; }, get monde(){ return monde; }, rendu, renderer, camJ, camC,
  demarrerJeu, demarrerConstr, ileAventure, nouvelleIle, appliquer: (i, j) => appliquer(i, j, new Set()), outil, setOutil: (c, id) => { outil.cat = c; outil.id = id; remplirCats(); remplirPalette(); }, touches };
