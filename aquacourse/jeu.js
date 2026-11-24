/* La Course des Bouées : une course en bouée sur un toboggan géant en spirale, à la façon des jeux « aquapark ».
   On tourne à gauche et à droite dans le tube, on pousse les autres (KO !), on peut s'envoler par-dessus le bord
   pour retomber plus bas sur le toboggan (LONG VOL !) et on finit par un grand saut dans la piscine (vise le centre !). */
import * as THREE from "../course3d/lib/three.module.min.js";
import { profils, avatarDe, creerAvatar, animerAvatar, auHasard } from "../commun/avatar.js";
import { lireManette } from "../commun/manette.js";

const $ = (id) => document.getElementById(id);
const lire = (k, d) => { try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } };
const ecrire = (k, v) => { try{ localStorage.setItem(k, v); }catch(e){} };
const tactile = matchMedia("(pointer: coarse)").matches || new URLSearchParams(location.search).has("tactile");
const UP = new THREE.Vector3(0, 1, 0);
const R = 4.2;            // le rayon du tube du toboggan
const THMAX = 1.38;       // jusqu'où monte le bord (en radians depuis le fond)
const GV = 14; const CF = .55;   // la force qui pousse vers l'extérieur dans les virages (adoucie)
           // la gravité quand on vole
const NB_BOTS = 15;
const COUPE = [{ nom: "Manche 1", qualif: 10 }, { nom: "Manche 2", qualif: 5 }, { nom: "Finale", qualif: 1 }];
const NOMS = ["Léo", "Zoé", "Noah", "Lina", "Sami", "Inès", "Tom", "Maya", "Adam", "Jade", "Ilyas", "Rose", "Nino", "Lou", "Yanis", "Mia", "Eliott", "Sara", "Hugo", "Nour"];
const COULEURS_BOUEE = ["#FF6F9F", "#4CC9F0", "#3FCF6A", "#8E5BC4", "#FFD23F", "#E5484D", "#FFFFFF", "#2EC4B6", "#FF9F1C"];

/* ================= le menu ================= */
let profil = lire("avatar-profil", "mikael"); if(!profils().some(p => p.id === profil)) profil = profils()[0].id;
const cleP = () => "aquacourse-pieces-" + profil;
function majPieces(){ $("pieces").textContent = "🪙 " + (parseInt(lire(cleP(), "0"), 10) || 0) + " pièces"; }
function remplirProfils(){
  const box = $("profils"); box.innerHTML = "";
  profils().forEach(p => { const b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
    b.onclick = () => { profil = p.id; ecrire("avatar-profil", profil); remplirProfils(); vitrine(); majPieces(); }; box.appendChild(b); });
}
$("monPerso").onclick = () => { location.href = "../avatar/?profil=" + encodeURIComponent(profil) + "&retour=../aquacourse/"; };
$("aide").innerHTML = tactile
  ? "👆 <b>Glisse ton doigt</b> vers la gauche ou la droite pour tourner dans le toboggan. Monte tout en haut du bord dans les virages pour <b>t'envoler</b> et retomber plus bas (attention à ne pas tomber dans l'eau !). À la fin, guide-toi en l'air pour atterrir <b>au milieu de la piscine</b>."
  : "⌨️ Les <b>flèches ← →</b> (en bas à droite du clavier) pour tourner, ou glisse avec la souris. Monte tout en haut du bord dans les virages pour <b>t'envoler</b> et retomber plus bas (attention à ne pas tomber dans l'eau !). À la fin, guide-toi en l'air pour atterrir <b>au milieu de la piscine</b>.<br>🎮 Manette : le joystick gauche.";

/* ================= la scène ================= */
const canvas = $("c");
const rendu = new THREE.WebGLRenderer({ canvas, antialias: !tactile });
rendu.setPixelRatio(Math.min(devicePixelRatio || 1, tactile ? 1.5 : 1.5)); rendu.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color("#8FD6FF"); scene.fog = new THREE.Fog("#C4E9FF", 300, 1400);
const camera = new THREE.PerspectiveCamera(62, 1, .3, 5000);
scene.add(new THREE.HemisphereLight("#FFFFFF", "#9CC7D9", 1.6));
const soleil = new THREE.DirectionalLight("#FFF2D8", 1.9); soleil.position.set(-200, 300, 150); scene.add(soleil);
function taille(){ rendu.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 1 ? 74 : 62; camera.updateProjectionMatrix(); }
addEventListener("resize", taille); taille();
const mat = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
function texture(dessin, w, h){ const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function alea(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---- la mer, les nuages ---- */
const mer = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), mat("#3FB6F0")); mer.rotation.x = -Math.PI / 2; scene.add(mer);
const lagon = new THREE.Mesh(new THREE.CircleGeometry(240, 60), mat("#7FDDF5")); lagon.rotation.x = -Math.PI / 2; lagon.position.y = .05; scene.add(lagon);
(function(){ const blanc = mat("#FFFFFF", { emissive: "#BFCFE0" }), r = alea(7);
  for(let i = 0; i < 26; i++){ const g = new THREE.Group(), a = r() * Math.PI * 2, d = 600 + r() * 700;
    for(let k = 0; k < 5; k++){ const s = new THREE.Mesh(new THREE.SphereGeometry(30 + r() * 30, 10, 8), blanc); s.position.set(k * 40 - 80 + r() * 20, r() * 20, r() * 30); s.scale.y = .6; g.add(s); }
    g.position.set(Math.cos(a) * d, 90 + r() * 160, Math.sin(a) * d); g.lookAt(0, g.position.y, 0); scene.add(g); } })();
// l'île
const ile = new THREE.Mesh(new THREE.CylinderGeometry(180, 192, 4, 64), mat("#F2D9A0")); ile.position.y = -1.6; scene.add(ile);

/* ================= le toboggan (fabriqué à chaque course) ================= */
const texPiste = (() => { const t = texture((g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#2468D8"); gr.addColorStop(.2, "#3E9BEB"); gr.addColorStop(.5, "#64D6F8"); gr.addColorStop(.8, "#3E9BEB"); gr.addColorStop(1, "#2468D8");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for(let b = 0; b < 2; b++){ const y0 = b * h / 2 + 20; g.fillStyle = "rgba(25,80,200,.55)"; g.beginPath();
    for(let x = 0; x <= w; x += 4) g.lineTo(x, y0 + Math.sin(x / w * Math.PI * 2) * 14); for(let x = w; x >= 0; x -= 4) g.lineTo(x, y0 + 46 + Math.sin(x / w * Math.PI * 2 + .6) * 14); g.closePath(); g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4; g.beginPath(); for(let x = 0; x <= w; x += 4) g.lineTo(x, y0 + 70 + Math.sin(x / w * Math.PI * 4) * 6); g.stroke(); }
}, 128, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
const matPiste = new THREE.MeshLambertMaterial({ map: texPiste, side: THREE.DoubleSide });
const texCible = texture((g, w, h) => { const c = ["#3FB6F0", "#FFFFFF", "#E5484D", "#FFFFFF", "#FFD23F"]; c.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(w / 2, h / 2, w / 2 * (1 - i * .2), 0, Math.PI * 2); g.fill(); }); }, 256, 256);
let piste = null;

function construirePiste(seed){
  if(piste) scene.remove(piste.groupe);
  const rnd = alea(seed), groupe = new THREE.Group();
  const H = 60, amp = 3 + rnd() * 4, freq = 2 + Math.floor(rnd() * 3), ph = rnd() * 6, aMax = 2.35 * Math.PI * 2, sens = rnd() < .5 ? 1 : -1, ang0 = rnd() * Math.PI * 2;
  const brut = [];
  for(let a = 0; a <= aMax; a += .004){ const r = 16 + a * 4.2 + amp * Math.sin(a * freq + ph) * Math.min(1, a / 1.5), an = ang0 + a * sens;
    brut.push(new THREE.Vector3(Math.cos(an) * r, H - a * ((H - 16) / aMax) + Math.sin(a * 7) * .45 * Math.min(1, a), Math.sin(an) * r)); }
  const fin0 = brut[brut.length - 1], dirFin = fin0.clone().sub(brut[brut.length - 2]).setY(0).normalize(), yFin = fin0.y;
  for(let d = .3; d <= 45; d += .3) brut.push(fin0.clone().addScaledVector(dirFin, d).setY(yFin - (yFin - 6) * (1 - Math.cos(Math.PI * d / 45)) / 2));
  // tous les mètres
  const cum = [0]; for(let i = 1; i < brut.length; i++) cum.push(cum[i - 1] + brut[i].distanceTo(brut[i - 1]));
  const P = []; let j = 0; const n = Math.floor(cum[cum.length - 1]) + 1;
  for(let s = 0; s < n; s++){ while(j < cum.length - 2 && cum[j + 1] < s) j++; const f = (s - cum[j]) / (cum[j + 1] - cum[j]); P.push(brut[j].clone().lerp(brut[j + 1], Math.max(0, Math.min(1, f)))); }
  const T = [], S = [], U = [], K = new Float32Array(n);
  for(let i = 0; i < n; i++){ const t = P[Math.min(n - 1, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize(); T.push(t); const s = new THREE.Vector3().crossVectors(t, UP).normalize(); S.push(s); U.push(new THREE.Vector3().crossVectors(s, t).normalize()); }
  for(let i = 0; i < n; i++){ const d = T[Math.min(n - 1, i + 1)].clone().sub(T[Math.max(0, i - 1)]).multiplyScalar(.5); K[i] = d.dot(S[i]); }
  // la surface du tube
  const NT = 20, pos = new Float32Array(n * NT * 3), uv = new Float32Array(n * NT * 2), idx = [];
  for(let i = 0; i < n; i++) for(let k = 0; k < NT; k++){ const th = -THMAX - .06 + (2 * THMAX + .12) * k / (NT - 1), q = (i * NT + k);
    const p = P[i].clone().addScaledVector(U[i], R * (1 - Math.cos(th))).addScaledVector(S[i], R * Math.sin(th)); pos.set([p.x, p.y, p.z], q * 3); uv.set([k / (NT - 1), i / 9], q * 2); }
  for(let i = 0; i < n - 1; i++) for(let k = 0; k < NT - 1; k++){ const a = i * NT + k, b = a + NT; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  groupe.add(new THREE.Mesh(geo, matPiste));
  // les bords blancs
  [-1, 1].forEach(sg => { const pts = []; for(let i = 0; i < n; i += 3){ const th = sg * (THMAX + .06); pts.push(P[i].clone().addScaledVector(U[i], R * (1 - Math.cos(th))).addScaledVector(S[i], R * Math.sin(th))); }
    groupe.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.floor(n / 2), .3, 6, false), mat("#FFFFFF"))); });
  // les piliers
  const nbP = Math.floor(n / 14), piliers = new THREE.InstancedMesh(new THREE.CylinderGeometry(.45, .45, 1, 8), mat("#EAF2FF"), nbP), m4 = new THREE.Matrix4();
  for(let q = 0; q < nbP; q++){ const p = P[q * 14 + 7]; m4.compose(new THREE.Vector3(p.x, p.y / 2, p.z), new THREE.Quaternion(), new THREE.Vector3(1, Math.max(.1, p.y - .2), 1)); piliers.setMatrixAt(q, m4); }
  groupe.add(piliers);
  // la tour du départ
  const tourG = new THREE.Group(), couleurs = ["#FF6F9F", "#FFFFFF"];
  for(let y = 0; y < H; y += 6){ const c = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 6, 24), mat(couleurs[(y / 6) % 2])); c.position.y = y + 3; tourG.add(c); }
  const toit = new THREE.Mesh(new THREE.ConeGeometry(9, 8, 24), mat("#FFD23F")); toit.position.y = H + 9; tourG.add(toit);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, .8, 24), mat("#B07A4A")); plat.position.y = H - .2; tourG.add(plat);
  groupe.add(tourG);
  const pont = new THREE.Mesh(new THREE.BoxGeometry(6, .8, 1), mat("#B07A4A")); const a0 = P[0].clone().setY(0); pont.position.set(a0.x / 2, H - .2, a0.z / 2); pont.lookAt(P[0].x, H - .2, P[0].z); pont.scale.z = a0.length(); groupe.add(pont);
  // la piscine d'arrivée
  const fin = P[n - 1], dF = T[n - 1].clone().setY(0).normalize(), piscine = fin.clone().addScaledVector(dF, 33).setY(.75);
  const bord = new THREE.Mesh(new THREE.CylinderGeometry(13.2, 13.6, 1.6, 48), mat("#FFFFFF")); bord.position.set(piscine.x, 0, piscine.z); groupe.add(bord);
  const eau = new THREE.Mesh(new THREE.CircleGeometry(12, 48), new THREE.MeshLambertMaterial({ map: texCible })); eau.rotation.x = -Math.PI / 2; eau.position.copy(piscine).setY(.82); groupe.add(eau);
  const arche = new THREE.Mesh(new THREE.TorusGeometry(8, .7, 10, 30, Math.PI), mat("#FF9F1C")); arche.position.copy(fin).addScaledVector(dF, 3); arche.position.y = fin.y - 1; arche.lookAt(arche.position.clone().add(dF)); groupe.add(arche);
  // les palmiers (pas sous le toboggan)
  const tronc = mat("#9A6A43"), palme = mat("#3FA34D"), herbe = mat("#8BD36B");
  for(let q = 0; q < 70; q++){ const a = rnd() * Math.PI * 2, r = 20 + rnd() * 150, x = Math.cos(a) * r, z = Math.sin(a) * r;
    let gene = Math.hypot(x - piscine.x, z - piscine.z) < 18; for(let i = 0; i < n && !gene; i += 4) if(P[i].y < 26 && Math.hypot(P[i].x - x, P[i].z - z) < 10) gene = true; if(gene) continue;
    const g = new THREE.Group(), t = new THREE.Mesh(new THREE.CylinderGeometry(.35, .55, 10, 7), tronc); t.position.y = 5; t.rotation.z = (rnd() - .5) * .2; g.add(t);
    for(let k = 0; k < 6; k++){ const f = new THREE.Mesh(new THREE.BoxGeometry(.6, .15, 6), palme); f.position.set(Math.sin(k) * 2.4, 10, Math.cos(k) * 2.4); f.rotation.y = k; f.rotation.x = .45; g.add(f); }
    if(rnd() < .5){ const h = new THREE.Mesh(new THREE.CircleGeometry(4 + rnd() * 4, 12), herbe); h.rotation.x = -Math.PI / 2; h.position.y = .45; g.add(h); }
    g.position.set(x, .4, z); groupe.add(g); }
  scene.add(groupe);
  piste = { n, L: n - 1, P, T, S, U, K, groupe, piscine, dirFin: dF, H };
}
const F = { p: new THREE.Vector3(), T: new THREE.Vector3(), S: new THREE.Vector3(), U: new THREE.Vector3(), k: 0 };
function cadre(s){
  const i = Math.max(0, Math.min(piste.n - 2, Math.floor(s))), f = Math.max(0, Math.min(1, s - i));
  F.p.lerpVectors(piste.P[i], piste.P[i + 1], f); F.T.lerpVectors(piste.T[i], piste.T[i + 1], f).normalize(); F.S.lerpVectors(piste.S[i], piste.S[i + 1], f).normalize(); F.U.lerpVectors(piste.U[i], piste.U[i + 1], f).normalize();
  F.k = piste.K[i] + (piste.K[i + 1] - piste.K[i]) * f; return F;
}
const surface = (fr, th, out) => out.copy(fr.p).addScaledVector(fr.U, R * (1 - Math.cos(th))).addScaledVector(fr.S, R * Math.sin(th));

/* ================= les effets ================= */
const effets = [], geoBoule = new THREE.SphereGeometry(.3, 6, 5);
function particule(pos, vel, couleur, vie, taille, g){
  if(effets.length > 260) return;
  const m = new THREE.Mesh(geoBoule, new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: .9 })); m.position.copy(pos); m.scale.setScalar(taille || 1); scene.add(m);
  effets.push({ m, v: vel, vie, t: 0, g: g === undefined ? 12 : g });
}
function eclabousse(pos, nb){ for(let i = 0; i < (nb || 20); i++) particule(pos, new THREE.Vector3((Math.random() - .5) * 10, 5 + Math.random() * 9, (Math.random() - .5) * 10), Math.random() < .5 ? "#FFFFFF" : "#BFE8FF", 1, .7 + Math.random() * .7); }
function confettis(pos){ const c = ["#E5484D", "#FFD23F", "#3FA34D", "#3D7BD9", "#FF6F9F", "#8E5BC4"]; for(let i = 0; i < 80; i++) particule(pos, new THREE.Vector3((Math.random() - .5) * 22, 8 + Math.random() * 14, (Math.random() - .5) * 22), c[i % c.length], 2.4, .5 + Math.random() * .4, 9); }
function animerEffets(dt){
  for(let i = effets.length - 1; i >= 0; i--){ const e = effets[i]; e.t += dt; const k = e.t / e.vie;
    e.v.y -= e.g * dt; e.m.position.addScaledVector(e.v, dt); e.m.material.opacity = .9 * (1 - k);
    if(k >= 1){ scene.remove(e.m); e.m.material.dispose(); effets.splice(i, 1); } }
}

/* ================= les sons (fabriqués) ================= */
let ac = null, sonOn = lire("aquacourse-son") !== "0", eauSon = null;
function audio(){ try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === "suspended") ac.resume(); }catch(e){} return ac; }
function note(f, t0, d, type, v){ const a = audio(); if(!a || !sonOn) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0); o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03); }
function glisse(f1, f2, d, type, v){ const a = audio(); if(!a || !sonOn) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = type || "sine"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03); }
function bruit(d, v, f){ const a = audio(); if(!a || !sonOn) return; const n = Math.floor(a.sampleRate * d), b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); for(let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), g = a.createGain(), fi = a.createBiquadFilter(); fi.type = "lowpass"; fi.frequency.value = f || 1200; s.buffer = b; g.gain.value = v || .2; s.connect(fi); fi.connect(g); g.connect(a.destination); s.start(); }
const SON = {
  bip: () => note(660, 0, .18, "square", .07), go: () => note(1320, 0, .4, "square", .08), boing: () => glisse(520, 170, .3, "square", .06),
  envol: () => glisse(300, 1200, .5, "triangle", .1), ko: () => { [880, 660, 440].forEach((f, i) => note(f, i * .08, .15, "triangle", .1)); },
  splash: () => bruit(.8, .35, 2600), bravo: () => [523, 659, 784, 1046, 1318].forEach((f, i) => note(f, i * .1, .35, "triangle", .1)),
  piece: () => { note(1318, 0, .12); note(1760, .07, .2); }, rate: () => glisse(400, 150, .6, "sawtooth", .05)
};
function son(n){ if(sonOn) try{ SON[n](); }catch(e){} }
function sonEau(v){
  const a = audio(); if(!a) return;
  if(!eauSon){ const n = a.sampleRate * 2, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0); for(let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = b; s.loop = true; const f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 900; f.Q.value = .7; const g = a.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); eauSon = { g, f }; }
  eauSon.g.gain.setTargetAtTime(sonOn && v ? Math.min(.07, v * .0025) : 0, a.currentTime, .15); eauSon.f.frequency.setTargetAtTime(600 + (v || 0) * 25, a.currentTime, .2);
}
$("sonBtn").onclick = () => { sonOn = !sonOn; ecrire("aquacourse-son", sonOn ? "1" : "0"); $("sonBtn").textContent = sonOn ? "🔊" : "🔇"; if(!sonOn) sonEau(0); };
$("sonBtn").textContent = sonOn ? "🔊" : "🔇";

/* ================= les coureurs ================= */
function creerCoureur(cfg, numero, couleurBouee){
  const g = new THREE.Group();
  const bouee = new THREE.Mesh(new THREE.TorusGeometry(.85, .36, 10, 22), mat(couleurBouee)); bouee.rotation.x = Math.PI / 2; bouee.position.y = .4; g.add(bouee);
  const bandes = new THREE.Mesh(new THREE.TorusGeometry(.85, .37, 10, 22, Math.PI / 3), mat("#FFFFFF")); bandes.rotation.x = Math.PI / 2; bandes.position.y = .4; g.add(bandes);
  const av = creerAvatar(cfg, { numero, pose: "assis" }); av.scale.setScalar(.5); av.position.y = .5; g.add(av);
  scene.add(g);
  return { g, av, s: 0, th: 0, vth: 0, vs: 0, vt: 22, mode: "piste", pos: new THREE.Vector3(), vel: new THREE.Vector3(), tVol: 0, sDecol: 0, fini: false, ordre: 0, t: Math.random() * 10 };
}
let J = null, bots = [];
function viderCoureurs(){ if(J) scene.remove(J.g); bots.forEach(b => scene.remove(b.g)); J = null; bots = []; }
let persoVitrine = null;
function vitrine(){ if(persoVitrine) scene.remove(persoVitrine.g); const P = profils().find(p => p.id === profil); persoVitrine = creerCoureur(avatarDe(profil), P && P.numero, "#FF9F1C"); }

/* ================= les commandes ================= */
const touches = {};
addEventListener("keydown", (e) => { touches[e.code] = true; if(e.code.startsWith("Arrow")) e.preventDefault(); });
addEventListener("keyup", (e) => { touches[e.code] = false; });
addEventListener("blur", () => { for(const k in touches) touches[k] = false; });
let doigt = null, volant = 0;
canvas.addEventListener("pointerdown", (e) => { audio(); doigt = { id: e.pointerId, x0: e.clientX, x: e.clientX }; try{ canvas.setPointerCapture(e.pointerId); }catch(er){} });
canvas.addEventListener("pointermove", (e) => { if(doigt && e.pointerId === doigt.id){ doigt.x = e.clientX; if(Math.abs(doigt.x - doigt.x0) > 90) doigt.x0 = doigt.x - Math.sign(doigt.x - doigt.x0) * 90; } });
const finDoigt = (e) => { if(doigt && e.pointerId === doigt.id) doigt = null; }; canvas.addEventListener("pointerup", finDoigt); canvas.addEventListener("pointercancel", finDoigt);
let volantForce = null;
function lireVolant(){
  if(volantForce !== null) return volantForce;
  let v = 0; if(touches.ArrowLeft || touches.KeyA) v -= 1; if(touches.ArrowRight || touches.KeyD) v += 1;
  if(doigt) v += Math.max(-1, Math.min(1, (doigt.x - doigt.x0) / 60));
  const m = lireManette(); if(m) v += m.x;
  return Math.max(-1, Math.min(1, v));
}

/* ================= la course ================= */
let etat = "menu", temps = 0, mode = "coupe", manche = 0, decompte = 0, ordreArrivee = 0, gains = null, tFin = 0, kos = 0, place = 16;
function message(t, s){ const m = $("message"); m.textContent = t; m.classList.add("on"); clearTimeout(message.m); message.m = setTimeout(() => m.classList.remove("on"), (s || 1.6) * 1000); }
function gagner(n, pourquoi){ gains.total += n; gains.detail.push([pourquoi, n]); $("gain").textContent = "🪙 " + gains.total; son("piece"); }

function lancerCourse(){
  audio(); construirePiste((Math.random() * 1e9) | 0); viderCoureurs();
  if(persoVitrine){ scene.remove(persoVitrine.g); persoVitrine = null; }
  const P = profils().find(p => p.id === profil);
  J = creerCoureur(avatarDe(profil), P && P.numero, "#FF9F1C"); J.joueur = true; J.nom = P ? P.nom : "Toi"; J.s = 2; J.vt = 25;
  const noms = NOMS.slice().sort(() => Math.random() - .5);
  for(let i = 0; i < NB_BOTS; i++){ const b = creerCoureur(auHasard(), 7 + i, COULEURS_BOUEE[i % COULEURS_BOUEE.length]); b.nom = noms[i]; b.s = 7 + Math.floor(i / 3) * 5; b.th = ((i % 3) - 1) * .6;
    b.vt = 20.3 + Math.random() * 3.5 + (mode === "coupe" ? manche * .35 : 0); b.cible = b.th; b.tCible = 1 + Math.random() * 2; b.cdChoc = 0; bots.push(b); }
  [J, ...bots].forEach(r => { r.vs = 0; placer(r); });
  ordreArrivee = 0; kos = 0; gains = { total: 0, detail: [] }; $("gain").textContent = "🪙 0";
  $("manche").textContent = mode === "coupe" ? "🏆 " + COUPE[manche].nom + " · top " + COUPE[manche].qualif : "🛟 Course libre";
  if(mode === "coupe" && COUPE[manche].qualif === 1) $("manche").textContent = "🏆 Finale : finis 1er !";
  etat = "decompte"; decompte = 3.6; $("menu").hidden = true; $("fin").hidden = true; $("hud").hidden = false;
  $("astuce").textContent = tactile ? "👆 Glisse ton doigt ← → pour tourner" : "⌨️ Flèches ← → pour tourner"; $("astuce").style.opacity = 1;
  camera.position.copy(J.pos).add(new THREE.Vector3(0, 6, 0)).addScaledVector(piste.T[0], -10);
}

function placer(r){ // dessiner le coureur à sa place
  if(r.mode === "piste"){
    cadre(r.s); surface(F, r.th, r.pos);
    const nrm = F.U.clone().multiplyScalar(Math.cos(r.th)).addScaledVector(F.S, -Math.sin(r.th)), x = new THREE.Vector3().crossVectors(nrm, F.T);
    r.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, nrm, F.T)); r.g.position.copy(r.pos).addScaledVector(nrm, .05);
  } else if(r.mode === "vol" || r.mode === "ko" || r.mode === "saut"){
    r.g.position.copy(r.pos); const h = Math.hypot(r.vel.x, r.vel.z); if(h > .5) r.g.rotation.set(0, Math.atan2(r.vel.x, r.vel.z), 0);
    if(r.mode === "ko"){ r.g.rotation.z = r.t * 9; r.g.rotation.x = r.t * 5; } else r.g.rotateX(-Math.max(-.5, Math.min(.5, r.vel.y * .03)));
  } else if(r.mode === "piscine"){ r.g.position.copy(r.pos); r.g.position.y = .55 + Math.sin(r.t * 3) * .08; r.g.rotation.set(0, r.g.rotation.y + .004, 0); }
  r.g.visible = r.mode !== "cache";
}

function decoller(r){
  cadre(r.s); surface(F, r.th, r.pos);
  const eTh = F.S.clone().multiplyScalar(Math.cos(r.th)).addScaledVector(F.U, Math.sin(r.th));
  r.vel.copy(F.T).multiplyScalar(r.vs).addScaledVector(eTh, R * r.vth).addScaledVector(UP, 4);
  r.sDecol = r.s; r.tVol = 0;
  if(r.joueur){ r.mode = "vol"; son("envol"); message("🚀 Envolé !", 1); }
  else { r.mode = "ko"; if(temps - (r.pousse || -9) < 2.2){ kos++; message(kos > 1 ? "💥 KO ! ×" + kos : "💥 KO !", 1.3); son("ko"); gagner(10, "KO"); } }
}
function sautFinal(r){
  r.mode = "saut"; r.fini = true; r.ordre = ++ordreArrivee; cadre(piste.L - .01); surface(F, r.th, r.pos);
  const vy = 6, tVol = (vy + Math.sqrt(vy * vy + 2 * GV * (r.pos.y - .8))) / GV, dist = 33 * (.88 + .12 * Math.min(1.4, r.vs / 25));
  r.vel.copy(piste.dirFin).multiplyScalar(dist / tVol).addScaledVector(F.S.clone().setY(0).normalize(), Math.sin(r.th) * 6 + (r.joueur ? 0 : (Math.random() - .5) * 16)); r.vel.y = vy; if(!r.joueur) r.vel.multiplyScalar(.82 + Math.random() * .3).setY(vy);
  r.tVol = 0; if(r.joueur){ son("envol"); $("astuce").textContent = tactile ? "🎯 Glisse ← → pour viser le milieu de la piscine !" : "🎯 Flèches ← → pour viser le milieu de la piscine !"; $("astuce").style.opacity = 1; }
}

function avancerPiste(r, dt, volantA){
  cadre(r.s);
  const acc = (-9.8 * F.U.y * Math.sin(r.th) - CF * r.vs * r.vs * F.k * Math.cos(r.th) + volantA) / R - 2.2 * r.vth;
  r.vth += acc * dt; r.th += r.vth * dt;
  r.vs += ((r.vt - r.vs) * .7 - F.T.y * 9.8 * .6) * dt; r.s += r.vs * dt;
  if(r.s >= piste.L){ sautFinal(r); return; }
  if(Math.abs(r.th) > THMAX) decoller(r);
}
function trouverAtterrissage(r){
  let best = -1, bd = 1e9; const P = piste.P, U = piste.U;
  for(let i = 0; i < piste.n; i += 2){ const p = P[i], dx = r.pos.x - p.x - U[i].x * R, dy = r.pos.y - p.y - U[i].y * R, dz = r.pos.z - p.z - U[i].z * R, d = dx * dx + dy * dy + dz * dz; if(d < bd){ bd = d; best = i; } }
  if(best < 0 || bd > 64) return false;
  for(let i = Math.max(0, best - 2); i <= Math.min(piste.n - 1, best + 2); i++){ const c = P[i].clone().addScaledVector(U[i], R), d = r.pos.distanceToSquared(c); if(d <= bd){ bd = d; best = i; } }
  const c = P[best].clone().addScaledVector(U[best], R), d = r.pos.clone().sub(c), along = d.dot(piste.T[best]), lat = d.dot(piste.S[best]), vert = d.dot(U[best]);
  const rho = Math.hypot(lat, vert), th = Math.atan2(lat, -vert);
  if(Math.abs(along) < 1.5 && rho > R - 1.4 && rho < R + 1 && Math.abs(th) < THMAX - .05){
    const s = Math.max(0, best + along); if(s >= piste.L - 1) return false;
    r.mode = "piste"; r.s = s; r.th = th; r.vth = 0; r.vs = Math.max(15, Math.min(32, r.vel.dot(piste.T[best])));
    eclabousse(r.pos, 14); son("splash");
    if(r.s - r.sDecol > 25){ message("🦅 LONG VOL !", 1.4); gagner(10, "Long vol"); } else message("👍", .6);
    return true;
  }
  return false;
}
function voler(r, dt, volantA){
  r.tVol += dt; r.t += dt; r.vel.y -= GV * dt;
  if(volantA && (r.mode === "vol" || r.mode === "saut")){ const h = new THREE.Vector3(r.vel.z, 0, -r.vel.x).normalize(); r.vel.addScaledVector(h, -volantA * (r.mode === "saut" ? 1.1 : .9) * dt); }
  r.pos.addScaledVector(r.vel, dt);
  if(r.mode === "vol" && r.tVol > .3 && r.vel.y < 0 && trouverAtterrissage(r)) return;
  const surIle = Math.hypot(r.pos.x, r.pos.z) < 180, sol = r.mode === "saut" ? .8 : surIle ? .4 : 0;
  if(r.pos.y <= sol){
    if(r.mode === "saut"){ // l'arrivée dans la piscine
      const d = Math.hypot(r.pos.x - piste.piscine.x, r.pos.z - piste.piscine.z);
      r.mode = "piscine"; r.pos.y = .8; eclabousse(r.pos, 26);
      if(d > 12.5){ const v = r.pos.clone().sub(piste.piscine).setY(0).setLength(11); r.pos.set(piste.piscine.x + v.x, .8, piste.piscine.z + v.z); }
      if(r.joueur){ son("splash"); arriveeJoueur(d); }
      return;
    }
    eclabousse(r.pos.clone().setY(.3), 22); if(r.joueur || Math.random() < .5) son("splash");
    r.mode = "cache"; r.attente = r.joueur ? 1.1 : 2.5;
    if(r.joueur) message("💦 Plouf ! Tu repars", 1.3);
  }
}
function repartir(r){ r.mode = "piste"; r.s = Math.max(1, r.joueur ? r.sDecol - 6 : r.sDecol - 45); r.th = 0; r.vth = 0; r.vs = 14; }

function piloterBot(b, dt){
  b.tCible -= dt; if(b.tCible <= 0){ b.tCible = 1.5 + Math.random() * 2.5; b.cible = (Math.random() - .5) * 1.3; }
  cadre(b.s);
  const tenir = CF * b.vs * b.vs * F.k * Math.cos(b.th) + 9.8 * F.U.y * Math.sin(b.th);
  return Math.max(-14, Math.min(14, tenir + R * ((b.cible - b.th) * 5 - b.vth * 2.5)));
}
function chocs(dt){
  if(J.mode !== "piste") return;
  for(const b of bots){
    b.cdChoc -= dt; if(b.mode !== "piste" || b.cdChoc > 0) continue;
    const ds = b.s - J.s; if(Math.abs(ds) > 2.4) continue;
    const dl = (b.th - J.th) * R; if(Math.hypot(ds, dl) > 2.1) continue;
    const cote = Math.abs(dl) > .15 ? Math.sign(dl) : (Math.random() < .5 ? -1 : 1);
    b.vth += cote * (1.9 + Math.max(0, J.vs - b.vs) * .1); J.vth -= cote * .7;
    if(ds > 0 && J.vs > b.vs){ b.vs += 2; J.vs -= 2.2; } else if(ds < 0) J.vs += 1.5;
    b.pousse = temps; b.cdChoc = .45; son("boing");
    const p = J.pos.clone().lerp(b.pos, .5); for(let i = 0; i < 6; i++) particule(p, new THREE.Vector3((Math.random() - .5) * 6, 3 + Math.random() * 3, (Math.random() - .5) * 6), "#FFFFFF", .5, .5);
  }
}
const avancement = (r) => r.fini ? 1e6 - r.ordre : (r.mode === "piste" ? r.s : r.sDecol);
function calculerPlace(){ const a = avancement(J); let p = 1; for(const b of bots) if(avancement(b) > a) p++; return p; }
const ecrirePlace = (n) => n + "<sup>" + (n === 1 ? "er" : "e") + "</sup>";

function arriveeJoueur(d){
  place = J.ordre; // l'ordre d'arrivée
  if(d < 3){ message("🎯 PARFAIT ATTERRISSAGE !", 2); gagner(50, "Atterrissage parfait"); }
  else if(d < 7){ message("😎 Super atterrissage !", 2); gagner(25, "Bel atterrissage"); }
  else if(d < 12.5){ message("💦 Dans la piscine !", 2); gagner(10, "Atterrissage"); }
  else { message("😅 À côté…", 2); son("rate"); }
  gagner(Math.max(0, (NB_BOTS + 2 - place) * 5), "Place : " + place + (place === 1 ? "er" : "e"));
  confettis(J.pos.clone().setY(6)); son("bravo");
  etat = "arrivee"; tFin = 3; sonEau(0); $("astuce").style.opacity = 0;
  $("place").innerHTML = ecrirePlace(place);
}
function afficherFin(){
  etat = "fin"; const total = (parseInt(lire(cleP(), "0"), 10) || 0) + gains.total; ecrire(cleP(), String(total)); majPieces();
  $("finPlace").innerHTML = "<span>" + ecrirePlace(place) + "</span>";
  const t = $("finTitre"), suite = $("finSuite");
  if(mode === "libre"){ t.textContent = place === 1 ? "🏆 Gagné !" : "Bravo !"; t.className = "ok"; $("finTexte").textContent = "Tu es arrivé " + (place === 1 ? "1er" : place + "e") + " sur " + (NB_BOTS + 1) + "."; suite.lastElementChild.textContent = "Encore une course"; suite.dataset.action = "libre"; }
  else {
    const q = COUPE[manche].qualif;
    if(place <= q && manche === COUPE.length - 1){ t.textContent = "🏆 Champion de la Coupe !"; t.className = "ok"; $("finTexte").textContent = "Tu as gagné la finale de la Coupe de la Plage !"; suite.lastElementChild.textContent = "Rejouer la coupe"; suite.dataset.action = "coupe0"; confettis(J.pos.clone().setY(8)); son("bravo"); }
    else if(place <= q){ t.textContent = "✅ Qualifié !"; t.className = "ok"; $("finTexte").textContent = "Il fallait finir dans les " + q + " premiers. Prochaine étape : " + COUPE[manche + 1].nom + " !"; suite.lastElementChild.textContent = COUPE[manche + 1].nom + " ➜"; suite.dataset.action = "suivante"; }
    else { t.textContent = "😮 Éliminé… de peu !"; t.className = "non"; $("finTexte").textContent = q === 1 ? "En finale, il faut finir 1er. Tu peux réessayer !" : "Il fallait finir dans les " + q + " premiers. Tu peux réessayer !"; suite.lastElementChild.textContent = "Réessayer la manche"; suite.dataset.action = "meme"; }
  }
  $("finDetail").innerHTML = gains.detail.map(([a, n]) => "<span>" + a + "</span><b>+" + n + " 🪙</b>").join("") + "<span><b style='color:inherit'>Total</b></span><b>" + gains.total + " 🪙</b>";
  const tous = [J, ...bots].sort((a, b) => avancement(b) - avancement(a)), q = mode === "libre" ? 99 : COUPE[manche].qualif;
  $("classement").innerHTML = tous.map((r, i) => "<div class='" + (r === J ? "moi" : "") + (i >= q ? " dehors" : "") + "'>" + (i + 1) + ". " + (r === J ? "⭐ " + r.nom + " (toi)" : r.nom) + "</div>").join("");
  $("fin").hidden = false;
}
$("finSuite").onclick = () => { const a = $("finSuite").dataset.action; if(a === "suivante") manche++; if(a === "coupe0") manche = 0; lancerCourse(); };
$("finMenu").onclick = () => versMenu();
function versMenu(){ etat = "menu"; viderCoureurs(); sonEau(0); $("menu").hidden = false; $("hud").hidden = true; $("fin").hidden = true; vitrine(); }
$("versMenu").onclick = versMenu;
$("jouer").onclick = () => { mode = "coupe"; manche = 0; lancerCourse(); };
$("libre").onclick = () => { mode = "libre"; lancerCourse(); };

/* ================= la caméra ================= */
const camPos = new THREE.Vector3(), camVise = new THREE.Vector3(), vise = new THREE.Vector3();
function majCamera(dt){
  if(J.mode === "piste" || J.mode === "cache"){
    const s = J.mode === "piste" ? J.s : J.sDecol;
    cadre(Math.max(0, s - 7.5)); camPos.copy(F.p).addScaledVector(F.U, R * .9).addScaledVector(UP, 4.4); if(s < 7.5) camPos.addScaledVector(F.T, s - 7.5);
    const th = J.mode === "piste" ? J.th * .45 : 0; camPos.addScaledVector(F.S, Math.sin(th) * R * .8);
    cadre(Math.min(piste.L, s + 6)); camVise.copy(F.p).addScaledVector(F.U, 1.2);
  } else if(J.mode === "vol" || J.mode === "saut"){
    const h = J.vel.clone().setY(0); if(h.lengthSq() < .01) h.set(0, 0, 1); h.normalize();
    camPos.copy(J.pos).addScaledVector(h, -10).addScaledVector(UP, 6); camVise.copy(J.pos).addScaledVector(h, 6).addScaledVector(UP, -3);
  } else { camPos.copy(J.pos).add(new THREE.Vector3(0, 10, 0)).addScaledVector(piste.dirFin, -14); camVise.copy(J.pos); }
  const k = Math.min(1, dt * 6); camera.position.lerp(camPos, k); vise.lerp(camVise, k); camera.lookAt(vise);
}

/* ================= la boucle ================= */
let avantT = performance.now();
function boucle(maintenant){
  const dt = Math.min(.05, (maintenant - avantT) / 1000); avantT = maintenant;
  maj(dt); animerEffets(dt);
  rendu.render(scene, camera);
  requestAnimationFrame(boucle);
}
function maj(dt){
  temps += dt;
  if(etat === "menu"){
    if(persoVitrine){ const g = persoVitrine.g; g.position.set(300, Math.sin(temps * 2) * .1, 300); g.rotation.set(Math.sin(temps) * .05, temps * .6, 0); animerAvatar(persoVitrine.av, temps, "salut"); }
    camera.position.set(298.2, 2.2, 306.5); camera.lookAt(298.2, 1, 300);
  } else {
    const volantJ = lireVolant();
    if(etat === "decompte"){
      const avant = Math.ceil(decompte); decompte -= dt; const apres = Math.ceil(decompte);
      if(apres !== avant){ if(apres >= 1 && apres <= 3) son("bip"); else if(apres === 0) son("go"); }
      $("decompte").textContent = decompte > 3 ? "" : decompte > 0 ? String(Math.ceil(decompte)) : "GO !";
      if(decompte <= -.6){ etat = "course"; $("decompte").textContent = ""; }
      if(decompte <= 0 && etat === "decompte"){ etat = "course"; setTimeout(() => { if($("decompte").textContent === "GO !") $("decompte").textContent = ""; }, 700); }
    }
    if(etat === "course" || etat === "arrivee"){
      const tous = [J, ...bots];
      for(const r of tous){
        r.t += dt;
        const v = r.joueur ? volantJ * 9 : 0;
        if(r.mode === "piste"){ avancerPiste(r, dt, r.joueur ? v : piloterBot(r, dt)); }
        else if(r.mode === "vol" || r.mode === "ko" || r.mode === "saut") voler(r, dt, r.joueur ? volantJ * 9 : 0);
        else if(r.mode === "cache"){ r.attente -= dt; if(r.attente <= 0) repartir(r); }
        if(r.mode === "piste" && r.vs > 8 && Math.random() < (r.joueur ? .7 : .15)){ cadre(r.s); particule(r.pos.clone().addScaledVector(F.T, -1.2).addScaledVector(F.U, .3), F.T.clone().multiplyScalar(-2).add(new THREE.Vector3((Math.random() - .5) * 3, 2 + Math.random() * 2, (Math.random() - .5) * 3)), "#FFFFFF", .5, .6); }
      }
      chocs(dt);
      if(etat === "course"){ place = calculerPlace(); $("place").innerHTML = ecrirePlace(place); sonEau(J.mode === "piste" ? J.vs : 0); if(J.t > 6) $("astuce").style.opacity = J.mode === "saut" ? 1 : 0; }
      if(etat === "arrivee"){ tFin -= dt; if(tFin <= 0) afficherFin(); }
    }
    for(const r of [J, ...bots]){ placer(r);
      animerAvatar(r.av, r.t, r.mode === "piscine" ? (r.joueur ? "danse" : "salut") : r.mode === "ko" ? "danse" : "repos");
      if(r.mode !== "piscine" && r.av.userData.jambes) r.av.userData.jambes.forEach(j => j.rotation.x = -1.45); }
    majCamera(dt);
  }
}
remplirProfils(); majPieces(); vitrine(); requestAnimationFrame(boucle);
window.__aqua = { get J(){ return J; }, get bots(){ return bots; }, get piste(){ return piste; }, get etat(){ return etat; }, touches, decoller, lancerCourse, simuler(n, v){ for(let i = 0; i < n; i++){ if(v !== undefined) volantForce = v; maj(1 / 30); } volantForce = null; }, set volant(v){ volantForce = v; } };
