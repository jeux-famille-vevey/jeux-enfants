/* L'atelier « Mon personnage » : chaque enfant crée son personnage, qui le suit dans les jeux 3D. */
import * as THREE from "../course3d/lib/three.module.min.js";
import { CATALOGUE, profils, ajouterProfil, avatarDe, enregistrerAvatar, auHasard, creerAvatar, animerAvatar } from "../commun/avatar.js";

const $ = (id) => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const RETOUR = PARAMS.get("retour");
function lire(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

let profil = PARAMS.get("profil") || lire("avatar-profil", "mikael");
if(!profils().some(p => p.id === profil)) profil = "mikael";
let cfg = avatarDe(profil), onglet = "visage", mode = "repos", modeT = 0, tourne = true;

/* ---------- la scène 3D ---------- */
const zone = $("scene");
let renderer;
try{ renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
catch(e){ zone.insertAdjacentHTML("beforeend", '<p style="position:absolute;top:40%;width:100%;text-align:center;color:#1D2357;font-weight:700">Cet ordinateur ne peut pas afficher la 3D.</p>'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
zone.insertBefore(renderer.domElement, zone.firstChild);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa88, 1.5));
const sol = new THREE.DirectionalLight(0xffffff, 2); sol.position.set(3, 6, 5); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); scene.add(sol);
const socle = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, .25, 40), new THREE.MeshStandardMaterial({ color: "#FFD23F", roughness: .5 }));
socle.position.y = -.13; socle.receiveShadow = true; scene.add(socle);
const herbe = new THREE.Mesh(new THREE.CircleGeometry(12, 40), new THREE.MeshStandardMaterial({ color: "#7BC96F" })); herbe.rotation.x = -Math.PI / 2; herbe.position.y = -.26; herbe.receiveShadow = true; scene.add(herbe);
let perso = null, angle = .35;
function reconstruire(){
  if(perso) scene.remove(perso);
  const P = profils().find(p => p.id === profil) || profils()[0];
  perso = creerAvatar(cfg, { numero: P.numero }); perso.traverse(o => { if(o.isMesh) o.castShadow = true; });
  scene.add(perso);
}
function redimensionner(){
  const w = zone.clientWidth, h = zone.clientHeight; renderer.setSize(w, h); camera.aspect = w / h;
  const portrait = w / h < .9; camera.position.set(0, 1.9, portrait ? 9.5 : 7.4); camera.lookAt(0, 1.25, 0); camera.updateProjectionMatrix();
}
addEventListener("resize", redimensionner);
// tourner le personnage avec le doigt ou la souris
let glisse = null;
renderer.domElement.addEventListener("pointerdown", (e) => { glisse = { x: e.clientX, a: angle }; tourne = false; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener("pointermove", (e) => { if(glisse) angle = glisse.a + (e.clientX - glisse.x) * .012; });
renderer.domElement.addEventListener("pointerup", () => { glisse = null; });
$("tourne").onclick = () => { tourne = !tourne; };
$("danse").onclick = () => { mode = mode === "danse" ? "repos" : "danse"; modeT = 0; son(660); };

/* ---------- petits sons ---------- */
let actx = null;
function son(f){ try{ if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(f || 700, t); o.frequency.exponentialRampToValueAtTime((f || 700) * 1.5, t + .12); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .2); }catch(e){} }
let bulleT = 0;
function bulle(t){ const b = $("bulle"); b.textContent = t; b.classList.add("on"); bulleT = 1.6; }

/* ---------- les onglets ---------- */
const ONGLETS = [
  { id:"visage", e:"🙂", nom:"Visage", parts:[["visage", "Le visage", "liste"], ["yeux", "La couleur des yeux", "couleurs"]] },
  { id:"peau", e:"🎨", nom:"Peau", parts:[["peau", "La couleur de peau", "couleurs"]] },
  { id:"cheveux", e:"💇", nom:"Cheveux", parts:[["cheveux", "La coiffure", "liste"], ["couleurCheveux", "La couleur des cheveux", "couleurs"]] },
  { id:"chapeau", e:"🎩", nom:"Chapeau", parts:[["chapeau", "Sur la tête", "liste"]] },
  { id:"lunettes", e:"🕶️", nom:"Lunettes", parts:[["lunettes", "Sur les yeux", "liste"]] },
  { id:"haut", e:"👕", nom:"Haut", parts:[["haut", "Le haut", "liste"], ["couleurHaut", "La couleur", "couleursHabits"], ["motif", "Le dessin", "liste"]] },
  { id:"bas", e:"👖", nom:"Bas", parts:[["bas", "Le bas", "liste"], ["couleurBas", "La couleur", "couleursHabits"]] },
  { id:"pieds", e:"👟", nom:"Chaussures", parts:[["chaussures", "Les chaussures", "couleurs"]] },
  { id:"dos", e:"🦸", nom:"Dans le dos", parts:[["dos", "Dans le dos", "liste"]] },
  { id:"accessoire", e:"🦜", nom:"Accessoires", parts:[["accessoire", "Dans la main ou sur l'épaule", "liste"]] }
];
function remplirOnglets(){
  const box = $("onglets"); box.innerHTML = "";
  ONGLETS.forEach(o => { const b = document.createElement("button"); b.innerHTML = o.e + "<small>" + o.nom + "</small>"; if(o.id === onglet) b.className = "on";
    b.onclick = () => { onglet = o.id; son(520); remplirOnglets(); remplirChoix(); }; box.appendChild(b); });
}
function remplirChoix(){
  const box = $("choix"); box.innerHTML = "";
  const o = ONGLETS.find(x => x.id === onglet);
  o.parts.forEach(([cle, titre, type]) => {
    const h = document.createElement("h3"); h.textContent = titre; box.appendChild(h);
    if(type === "liste"){
      const g = document.createElement("div"); g.className = "grille";
      CATALOGUE[cle].forEach(it => { const b = document.createElement("button"); b.innerHTML = '<span class="e">' + it.e + "</span>"; b.appendChild(document.createTextNode(it.nom)); if(cfg[cle] === it.id) b.className = "on";
        b.onclick = () => changer(cle, it.id, it.nom); g.appendChild(b); });
      box.appendChild(g);
    }else{
      const g = document.createElement("div"); g.className = "couleurs";
      (type === "couleursHabits" ? CATALOGUE.couleurs : CATALOGUE[cle]).forEach(c => { const b = document.createElement("button"); b.style.background = c; b.setAttribute("aria-label", "Couleur"); if(cfg[cle] === c) b.className = "on";
        b.onclick = () => changer(cle, c); g.appendChild(b); });
      box.appendChild(g);
    }
  });
}
function changer(cle, val, nom){
  cfg[cle] = val; enregistrerAvatar(profil, cfg); reconstruire(); remplirChoix(); son(600 + Math.random() * 300);
  mode = "salut"; modeT = 0;
  if(nom) bulle(["Super !", "Trop bien !", "J'adore !", "Waouh !", "Stylé !"][Math.floor(Math.random() * 5)]);
}
function remplirProfils(){
  const box = $("profils"); box.innerHTML = "";
  profils().forEach(p => { const b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
    b.onclick = () => { profil = p.id; ecrire("avatar-profil", profil); cfg = avatarDe(profil); reconstruire(); remplirProfils(); remplirChoix(); son(500); bulle("Salut " + p.nom + " !"); }; box.appendChild(b); });
  const plus = document.createElement("button"); plus.textContent = "➕ Ajouter";
  plus.onclick = () => { const n = prompt("Comment s'appelle le nouveau joueur ?"); const id = ajouterProfil(n); if(id){ profil = id; ecrire("avatar-profil", id); cfg = avatarDe(id); reconstruire(); remplirProfils(); remplirChoix(); bulle("Bienvenue " + n + " !"); } };
  box.appendChild(plus);
}
$("hasard").onclick = () => { cfg = auHasard(); enregistrerAvatar(profil, cfg); reconstruire(); remplirChoix(); son(880); mode = "danse"; modeT = 0; bulle("🎲 Surprise !"); };
$("fini").onclick = () => {
  enregistrerAvatar(profil, cfg); son(1046); mode = "danse"; modeT = 0;
  const P = profils().find(p => p.id === profil);
  bulle("Bravo " + (P ? P.nom : "") + ", ton personnage est prêt !");
  if(RETOUR && /^\.\.\/[a-z0-9]+\/$/.test(RETOUR)) setTimeout(() => { location.href = RETOUR; }, 1400);
};
if(RETOUR && /^\.\.\/[a-z0-9]+\/$/.test(RETOUR)) $("fini").textContent = "✅ C'est moi ! On joue !";

/* ---------- boucle ---------- */
let t0 = performance.now(), avant = t0;
function boucle(now){
  requestAnimationFrame(boucle);
  const dt = Math.min(.05, (now - avant) / 1000); avant = now;
  const t = (now - t0) / 1000;
  if(tourne) angle += dt * .5;
  if(perso){ perso.rotation.y = angle; modeT += dt; if(mode === "salut" && modeT > 1.2) mode = "repos"; if(mode === "danse" && modeT > 4) mode = "repos"; animerAvatar(perso, t, mode); }
  if(bulleT > 0){ bulleT -= dt; if(bulleT <= 0) $("bulle").classList.remove("on"); }
  renderer.render(scene, camera);
}
reconstruire(); remplirProfils(); remplirOnglets(); remplirChoix(); redimensionner();
requestAnimationFrame(boucle);
