/* « Ma petite ville » : on promène ses personnages dans la maison, l'école, le magasin, le salon, l'hôpital et le parc.
   On prend et on pose tout, on fait manger, on habille, on s'assoit, on se couche… Tout est gardé pour chaque enfant. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var OBJ = window.OBJETS, LIEUX = window.LIEUX, PERSO = window.PERSO, SOL = 900;
  function lire(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function ecrire(k, v){ try{ if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function hasard(l){ return l[Math.floor(Math.random() * l.length)]; }

  /* ================= les sons (fabriqués, pas de fichiers) ================= */
  var ac = null, sonOn = lire("ville-son") !== "0";
  function ctx(){ try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === "suspended") ac.resume(); }catch(e){} return ac; }
  function note(f, t0, d, type, vol){ var a = ctx(); if(!a || !sonOn) return; var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol || .15, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02); }
  function glisse(f1, f2, d, type, vol){ var a = ctx(); if(!a || !sonOn) return; var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type || "sine"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol || .15, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02); }
  function bruit(d, vol, filtre){ var a = ctx(); if(!a || !sonOn) return; var n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), x = b.getChannelData(0);
    for(var i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n); var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filtre || 1200;
    s.buffer = b; g.gain.value = vol || .2; s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }
  var SONS = {
    prend: function(){ glisse(500, 820, .09); }, pose: function(){ glisse(300, 180, .08, "triangle", .12); }, pop: function(){ glisse(400, 900, .1); },
    miam: function(){ bruit(.08, .25, 2400); setTimeout(function(){ bruit(.08, .25, 2400); }, 140); setTimeout(function(){ bruit(.08, .25, 2400); }, 280); },
    rire: function(){ [0, .1, .2, .3].forEach(function(t, i){ note(700 + i * 60 + Math.random() * 80, t, .08, "triangle", .1); }); },
    habille: function(){ [523, 659, 784, 1046].forEach(function(f, i){ note(f, i * .07, .15, "sine", .12); }); },
    clic: function(){ note(1200, 0, .04, "square", .05); }, ding: function(){ note(1318, 0, .5, "sine", .15); note(1760, .12, .6, "sine", .1); },
    chasse: function(){ bruit(1.3, .22, 900); }, eau: function(){ bruit(.6, .12, 3000); },
    musique: function(){ var m = [523, 587, 659, 523, 659, 698, 784]; m.forEach(function(f, i){ note(f, i * .2, .18, "triangle", .1); }); },
    guitare: function(){ [196, 247, 294, 392, 494].forEach(function(f, i){ note(f, i * .03, .9, "triangle", .08); }); },
    chien: function(){ glisse(320, 180, .12, "square", .08); setTimeout(function(){ glisse(340, 190, .12, "square", .08); }, 180); },
    chat: function(){ glisse(600, 900, .2, "sine", .12); setTimeout(function(){ glisse(900, 500, .3, "sine", .12); }, 200); },
    canard: function(){ glisse(500, 300, .1, "sawtooth", .07); setTimeout(function(){ glisse(500, 300, .1, "sawtooth", .07); }, 150); },
    oiseau: function(){ [1800, 2200, 1900, 2400].forEach(function(f, i){ note(f, i * .08, .07, "sine", .07); }); },
    sonnerie: function(){ for(var i = 0; i < 6; i++) note(i % 2 ? 1320 : 1568, i * .1, .09, "square", .05); },
    caisse: function(){ note(1568, 0, .1, "square", .06); note(2093, .12, .5, "sine", .14); },
    klaxon: function(){ note(392, 0, .25, "square", .07); note(330, .3, .3, "square", .07); },
    sirene: function(){ glisse(700, 1000, .45, "sawtooth", .05); setTimeout(function(){ glisse(1000, 700, .45, "sawtooth", .05); }, 460); },
    souffle: function(){ bruit(.9, .14, 5000); }, boumboum: function(){ note(70, 0, .15, "sine", .4); note(70, .25, .15, "sine", .4); },
    magie: function(){ [784, 988, 1175, 1568, 1976].forEach(function(f, i){ note(f, i * .06, .2, "sine", .08); }); }
  };
  function son(n){ try{ if(SONS[n]) SONS[n](); }catch(e){} }

  /* ================= les enfants (les mêmes que dans les autres jeux du site) ================= */
  var BASE = [{ id: "aleyah", nom: "Aleyah", e: "⭐" }, { id: "mikael", nom: "Mikael", e: "⚽" }];
  function ajoutes(){ var l = []; try{ l = JSON.parse(lire("profils-ajoutes") || "[]") || []; }catch(e){} return Array.isArray(l) ? l : []; }
  function enfants(){ return BASE.concat(ajoutes(), [{ id: "invite", nom: "Invité", e: "🙂" }]); }
  function enfantDe(id){ return enfants().filter(function(x){ return x.id === id; })[0] || { id: id, nom: "Moi", e: "🙂" }; }
  var profil = null, etat = null;

  function majEnfants(){
    var box = $("enfants"); box.innerHTML = ""; var dernier = lire("ville-profil");
    enfants().forEach(function(p){
      var b = document.createElement("button"); b.className = "enfant" + (p.id === dernier ? " dernier" : "");
      b.innerHTML = '<span class="e"></span><b></b>'; b.querySelector(".e").textContent = p.e || "🙂"; b.querySelector("b").textContent = p.nom;
      b.onclick = function(){ choisirEnfant(p.id); }; box.appendChild(b);
    });
  }
  $("formAjout").onsubmit = function(e){
    e.preventDefault(); var nom = $("nomAjout").value.trim().slice(0, 14); if(!nom) return;
    var l = ajoutes(); l.push({ id: "p" + Date.now().toString(36), nom: nom, e: "🙂", numero: 3 + l.length }); ecrire("profils-ajoutes", JSON.stringify(l));
    $("nomAjout").value = ""; majEnfants();
  };

  /* ================= la sauvegarde ================= */
  var nId = 1;
  function nouvelId(){ return "o" + Date.now().toString(36) + (nId++); }
  function persoDefaut(nom, quoi){
    var c = { nom: nom, taille: "enfant", peau: "#C98E62", cheveux: "court", couleurCheveux: "#22150F", yeux: "#3A2416", haut: "tshirt", motif: "aucun", couleurHaut: "#3D7BD9", bas: "pantalon", couleurBas: "#1D2357", chaussures: "#FFFFFF", accessoire: "aucun", barbe: "aucune", levres: "", joues: "" };
    if(quoi === "fille") Object.assign(c, { cheveux: "long", haut: "robe", couleurHaut: "#FF6F9F", motif: "coeur", accessoire: "noeud" });
    if(quoi === "maman") Object.assign(c, { taille: "adulte", cheveux: "chignon", haut: "pull", couleurHaut: "#3FA34D", bas: "jupe", couleurBas: "#8E5BC4", levres: "#E5484D", chaussures: "#8A5A3B" });
    if(quoi === "papa") Object.assign(c, { taille: "adulte", cheveux: "court", haut: "chemise", couleurHaut: "#8EC5FF", bas: "pantalon", couleurBas: "#22232B", barbe: "barbe", chaussures: "#22232B" });
    if(quoi === "bebe") Object.assign(c, { taille: "bebe", cheveux: "boucle", haut: "salopette", couleurHaut: "#FFD23F", couleurBas: "#4CC9F0", chaussures: "#FF6F9F" });
    if(quoi === "papi") Object.assign(c, { taille: "ancien", peau: "#E8B98E", cheveux: "papy", couleurCheveux: "#C9CED8", haut: "veste", couleurHaut: "#8A5A3B", couleurBas: "#5A5F6E", barbe: "moustache", accessoire: "lunettes" });
    return c;
  }
  function nouvelEtat(){
    var moi = enfantDe(profil), fille = profil === "aleyah" || /a$|e$|h$/.test((moi.nom || "").toLowerCase()) && profil !== "mikael";
    var e = { v: 1, persos: [], lieux: {} };
    [[moi.nom, fille ? "fille" : "garcon"], ["Maman", "maman"], ["Papa", "papa"], ["Bébé", "bebe"], ["Papi", "papi"]].forEach(function(p){ e.persos.push({ id: "p" + nouvelId(), cfg: persoDefaut(p[0], p[1]) }); });
    return e;
  }
  function chargerEtat(){
    var t = lire("ville-v1-" + profil); etat = null;
    try{ etat = JSON.parse(t || "null"); }catch(e){}
    if(!etat || !etat.persos) etat = nouvelEtat();
    ORDRE.forEach(function(id){ if(!etat.lieux[id]) etat.lieux[id] = installerLieu(id); });
    if(!etat.place){ // la première fois : la famille est à la maison
      etat.place = true; var m = etat.lieux.maison.objets, xs = [880, 175, 515, 1030, 1150];
      etat.persos.forEach(function(p, i){ var o = { id: "P" + p.id, t: "perso", p: p.id, x: xs[i] || 900, y: 960 + (i % 2) * 15, pose: "debout" }; m.push(o); });
      lieuCourant = "maison"; m.filter(function(o){ return o.t === "perso"; }).forEach(function(o){ placer(o, true); });
      sauver();
    }
  }
  var minuteur = null;
  function sauver(){ clearTimeout(minuteur); minuteur = setTimeout(sauverMaintenant, 700); }
  function sauverMaintenant(){ clearTimeout(minuteur); if(!etat || !profil) return;
    var copie = clone(etat); Object.keys(copie.lieux).forEach(function(k){ copie.lieux[k].objets.forEach(function(o){ delete o.expr; delete o.anim; }); });
    ecrire("ville-v1-" + profil, JSON.stringify(copie)); }
  window.addEventListener("pagehide", sauverMaintenant);
  document.addEventListener("visibilitychange", function(){ if(document.hidden) sauverMaintenant(); });

  /* ================= installer un lieu (les objets de départ, posés par la gravité) ================= */
  var ORDRE = window.ORDRE_LIEUX, lieuCourant = null;
  function installerLieu(id){
    var L = LIEUX[id], objets = L.objets.map(function(d){ var op = d[3] || {}; return { id: nouvelId(), t: d[0], x: d[1], y: d[2], e: {}, d: op.d ? 1 : 0, m: op.m ? 1 : 0 }; });
    var l = { objets: objets }, garde = lieuCourant; lieuCourant = null;
    // on pose d'abord les meubles, puis les petits objets dessus
    objets.forEach(function(o){ var T = OBJ[o.t]; if(T.cat === "meuble" && !T.mural && !o.m) o.y = Math.max(o.y, SOL); });
    objets.forEach(function(o){ if(!o.m && !(OBJ[o.t].mural) && o.y < SOL) o.y = atterrissage(o, objets).y; var s = atterrissage(o, objets); if(o.y < SOL + 1 && s.sur) o.sur = s.sur; });
    lieuCourant = garde;
    return l;
  }
  function objetsIci(){ return etat.lieux[lieuCourant].objets; }
  function trouver(id, liste){ liste = liste || objetsIci(); for(var i = 0; i < liste.length; i++) if(liste[i].id === id) return liste[i]; return null; }
  function cfgDe(pid){ for(var i = 0; i < etat.persos.length; i++) if(etat.persos[i].id === pid) return etat.persos[i].cfg; return persoDefaut("?"); }
  function echelle(o){ return o.t === "perso" ? (PERSO.TAILLES[cfgDe(o.p).taille] || 1) : 1; }

  /* ================= la gravité : où un objet lâché va-t-il se poser ? ================= */
  function surfacesDe(o){ if(o.t === "perso") return []; var T = OBJ[o.t]; return (T.surf || []).map(function(s){ return [o.x + s[0], o.x + s[1], o.y + s[2]]; }); }
  function atterrissage(o, liste, exclus){
    liste = liste || objetsIci(); exclus = exclus || {};
    var fond = o.y >= SOL ? Math.min(o.y, 990) : SOL + 6 + Math.random() * 18, meilleur = fond, sur = null;
    liste.forEach(function(a){
      if(a === o || exclus[a.id] || a.tenu) return;
      surfacesDe(a).forEach(function(s){ if(o.x >= s[0] && o.x <= s[1] && s[2] >= o.y - 30 && s[2] < meilleur){ meilleur = s[2]; sur = a.id; } });
    });
    return { y: meilleur, sur: sur };
  }
  /* tout ce qui est posé sur un objet (ou tenu, ou assis dessus) bouge avec lui */
  function enfantsDe(id, liste){
    liste = liste || objetsIci(); var res = [], file = [id], vu = {}; vu[id] = 1;
    while(file.length){ var cur = file.shift(); liste.forEach(function(a){ if(!vu[a.id] && (a.sur === cur || a.tenu === cur)){ vu[a.id] = 1; res.push(a); file.push(a.id); } }); }
    return res;
  }
  function siegesLibres(o){
    var res = [], liste = objetsIci(), exclus = {}; exclus[o.id] = 1; enfantsDe(o.id).forEach(function(c){ exclus[c.id] = 1; });
    liste.forEach(function(a){
      if(exclus[a.id] || a.t === "perso") return; var T = OBJ[a.t]; if(!T.sieges) return;
      T.sieges.forEach(function(s, i){
        var pris = liste.some(function(b){ return b !== o && b.siege && b.siege.o === a.id && b.siege.i === i; });
        if(!pris) res.push({ obj: a, i: i, x: a.x + s.x, y: a.y + s.y, pose: s.pose });
      });
    });
    return res;
  }
  /* placer un personnage ou un objet lâché (instant = sans animation) */
  function placer(o, instant){
    var T = o.t === "perso" ? null : OBJ[o.t];
    o.sur = null; o.siege = null;
    if(o.t === "perso"){
      var k = echelle(o), hanche = [o.x, o.y - 90 * k], best = null, dmin = 110;
      siegesLibres(o).forEach(function(s){ var d = Math.hypot(s.x - hanche[0], s.y - hanche[1]); if(d < dmin){ dmin = d; best = s; } });
      if(best){
        o.siege = { o: best.obj.id, i: best.i }; o.sur = best.obj.id; o.pose = best.pose; o.x = best.x;
        var cible = best.pose === "couche" ? best.y + 4 * k : best.y + 44 * k;
        tomber(o, cible, instant); return;
      }
      o.pose = "debout";
    }
    if(T && (T.mural || o.m)) return;
    var exclus = {}; exclus[o.id] = 1; enfantsDe(o.id).forEach(function(c){ exclus[c.id] = 1; });
    var a = atterrissage(o, null, exclus); o.sur = a.sur;
    tomber(o, a.y, instant);
  }
  var chutes = [];
  function tomber(o, cible, instant){
    var enf = enfantsDe(o.id);
    if(instant || Math.abs(cible - o.y) < 2){ var dy = cible - o.y; o.y = cible; enf.forEach(function(c){ c.y += dy; }); return; }
    chutes.push({ o: o, enf: enf, cible: cible, v: 0, haut: cible < o.y });
    if(chutes.length === 1) requestAnimationFrame(animerChutes);
  }
  function animerChutes(){
    chutes = chutes.filter(function(c){
      var avant = c.o.y;
      if(c.haut){ c.o.y = c.cible; } else { c.v += 3.2; c.o.y = Math.min(c.cible, c.o.y + c.v); }
      var dy = c.o.y - avant; c.enf.forEach(function(e){ e.y += dy; });
      majNoeud(c.o); c.enf.forEach(majNoeud);
      if(c.o.y >= c.cible || c.haut){ if(c.v > 8) son("pose"); return false; } return true;
    });
    if(chutes.length) requestAnimationFrame(animerChutes); else sauver();
  }

  /* ================= le dessin du lieu ================= */
  var svg = $("svgLieu"), scene = $("scene"), noeuds = {};
  function couche(o){
    if(o.t === "perso") return 5;
    var T = OBJ[o.t]; if(T.devant) return 6; if(T.couche === 0) return 0; if(T.mural || o.m) return 1; if(T.cat === "meuble") return 2;
    if(T.vehicule) return 3; return 4;
  }
  function ordre(){ var l = objetsIci().filter(function(o){ return !o.tenu; }); return l.map(function(o, i){ return [o, i]; }).sort(function(a, b){ return couche(a[0]) - couche(b[0]) || a[1] - b[1]; }).map(function(x){ return x[0]; }); }
  function contenu(o){
    if(o.t === "perso"){
      var cfg = cfgDe(o.p), pose = o.pose || "debout", tient = objetsIci().filter(function(a){ return a.tenu === o.id; })[0];
      if(tient && pose === "debout") pose = "tient";
      var s = PERSO.dessiner(cfg, { pose: pose, expr: o.expr });
      if(tient){ var m = PERSO.main(cfg, pose), T = OBJ[tient.t], k = Math.min(1, 80 / Math.max(T.w, T.h));
        s += '<g transform="translate(' + m[0] + " " + (m[1] + T.h * k * .5) + ") scale(" + k + ')" data-id="' + tient.id + '">' + T.d(tient.e || {}) + "</g>"; }
      return s;
    }
    return OBJ[o.t].d(o.e || {});
  }
  function classeAnim(o){
    if(o.anim) return o.anim;
    if(o.t === "perso" && o.siege){ var s = trouver(o.siege.o); if(s && s.t === "balancoire" && s.e && s.e.on) return "balancePerso"; }
    return "";
  }
  function noeudSVG(o){ return '<g data-id="' + o.id + '" transform="translate(' + o.x.toFixed(1) + " " + o.y.toFixed(1) + ')"><g class="' + classeAnim(o) + '">' + contenu(o) + "</g></g>"; }
  function dessinerLieu(){
    var L = LIEUX[lieuCourant];
    svg.setAttribute("viewBox", "0 0 " + L.W + " 1000");
    var h = scene.clientHeight || 500; svg.style.width = (h * L.W / 1000) + "px";
    svg.innerHTML = '<g id="fondLieu">' + L.fond() + '</g><g id="calque">' + ordre().map(noeudSVG).join("") + "</g>";
    noeuds = {}; svg.querySelectorAll("#calque > g[data-id]").forEach(function(g){ noeuds[g.getAttribute("data-id")] = g; });
  }
  function redessiner(o){ var g = noeuds[o.id]; if(!g) return dessinerLieu(); var tmp = document.createElementNS("http://www.w3.org/2000/svg", "g"); tmp.innerHTML = noeudSVG(o); var n = tmp.firstChild; g.replaceWith(n); noeuds[o.id] = n; }
  function majNoeud(o){ if(o.tenu) return; var g = noeuds[o.id]; if(g) g.setAttribute("transform", "translate(" + o.x.toFixed(1) + " " + o.y.toFixed(1) + ")"); }
  window.addEventListener("resize", function(){ if(lieuCourant && $("eLieu").classList.contains("actif")){ var L = LIEUX[lieuCourant]; svg.style.width = (scene.clientHeight * L.W / 1000) + "px"; } });

  function bulle(t){ var b = $("bulle"); b.textContent = t; b.style.opacity = 1; clearTimeout(bulle.m); bulle.m = setTimeout(function(){ b.style.opacity = 0; }, 2200); }
  function animer(o, classe, duree){ o.anim = classe; redessiner(o); setTimeout(function(){ if(o.anim === classe){ o.anim = null; redessiner(o); } }, duree || 600); }
  function expression(o, expr, duree){ o.expr = expr; redessiner(o); clearTimeout(o._m); o._m = setTimeout(function(){ o.expr = null; redessiner(o); }, duree || 1400); }

  /* ================= toucher, prendre, lâcher ================= */
  function versScene(e){ var r = svg.getBoundingClientRect(), L = LIEUX[lieuCourant]; return { x: (e.clientX - r.left) * L.W / r.width, y: (e.clientY - r.top) * 1000 / r.height }; }
  var geste = null;
  scene.addEventListener("pointerdown", function(e){
    if(geste) return; ctx();
    var g = e.target.closest && e.target.closest("[data-id]"), p = versScene(e);
    if(!g){ geste = { mode: "pan", id: e.pointerId, x0: e.clientX, s0: scene.scrollLeft }; try{ scene.setPointerCapture(e.pointerId); }catch(x){} return; }
    var o = trouver(g.getAttribute("data-id")); if(!o) return;
    geste = { mode: "attente", id: e.pointerId, o: o, x0: e.clientX, y0: e.clientY, t0: Date.now(), p0: p };
    try{ scene.setPointerCapture(e.pointerId); }catch(x){}
  });
  function commencerPrise(gst, p){
    var o = gst.o;
    if(o.d){ // un distributeur : on prend une copie, l'original reste
      var c = { id: nouvelId(), t: o.t, x: o.x, y: o.y, e: {}, d: 0, m: 0 }; objetsIci().push(c); o = c;
    }
    if(o.tenu){ var porteur = trouver(o.tenu); var m = porteur ? mainMonde(porteur) : [o.x, o.y]; o.tenu = null; o.x = m[0]; o.y = m[1] + OBJ[o.t].h * .5; if(porteur) redessiner(porteur); }
    o.m = 0; o.sur = null;
    if(o.t === "perso"){ o.siege = null; o.pose = "porte"; o.expr = "surpris"; }
    var enf = enfantsDe(o.id);
    gst.mode = "prise"; gst.o = o; gst.enf = enf.map(function(c){ return [c, c.x - o.x, c.y - o.y]; }); gst.dx = o.x - p.x; gst.dy = o.y - p.y;
    // en avant de tout
    var l = objetsIci(); l.splice(l.indexOf(o), 1); l.push(o); dessinerLieu();
    var calque = svg.querySelector("#calque"); [o].concat(enf).forEach(function(c){ var n = noeuds[c.id]; if(n) calque.appendChild(n); });
    son("prend");
    gst.defile = setInterval(function(){ if(!gst.dernier) return; var r = scene.getBoundingClientRect(), x = gst.dernier.clientX;
      if(x < r.left + 70) scene.scrollLeft -= 14; else if(x > r.right - 70) scene.scrollLeft += 14; else return; deplacer(gst, gst.dernier); }, 30);
  }
  function mainMonde(porteur){ var m = PERSO.main(cfgDe(porteur.p), porteur.pose === "debout" ? "tient" : porteur.pose); return [porteur.x + m[0], porteur.y + m[1]]; }
  function deplacer(gst, e){
    var p = versScene(e), o = gst.o; o.x = p.x + gst.dx; o.y = p.y + gst.dy;
    var L = LIEUX[lieuCourant]; o.x = Math.max(20, Math.min(L.W - 20, o.x));
    majNoeud(o); gst.enf.forEach(function(c){ c[0].x = o.x + c[1]; c[0].y = o.y + c[2]; majNoeud(c[0]); });
    var t = $("tiroir").getBoundingClientRect(); $("tiroir").classList.toggle("cible", e.clientY > t.top);
  }
  scene.addEventListener("pointermove", function(e){
    if(!geste || e.pointerId !== geste.id) return;
    if(geste.mode === "pan"){ scene.scrollLeft = geste.s0 - (e.clientX - geste.x0); return; }
    if(geste.mode === "attente"){ if(Math.hypot(e.clientX - geste.x0, e.clientY - geste.y0) > 10) commencerPrise(geste, geste.p0); else return; }
    geste.dernier = e; deplacer(geste, e);
  });
  function finGeste(e){
    if(!geste || e.pointerId !== geste.id) return;
    var g = geste; geste = null; clearInterval(g.defile); $("tiroir").classList.remove("cible");
    if(g.mode === "attente"){ toucher(g.o); return; }
    if(g.mode !== "prise") return;
    var t = $("tiroir").getBoundingClientRect();
    if(e.clientY > t.top){ ranger(g.o); return; }
    lacher(g.o);
  }
  // la molette de la souris fait défiler de gauche à droite (sur l'ordinateur)
  [scene, $("tiroir")].forEach(function(el){ el.addEventListener("wheel", function(e){ if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ el.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false }); });
  scene.addEventListener("pointerup", finGeste); scene.addEventListener("pointercancel", finGeste);

  /* ranger : un personnage retourne dans le tiroir, un objet disparaît */
  function ranger(o){
    var l = objetsIci();
    enfantsDe(o.id).forEach(function(c){ c.sur = null; c.tenu = null; c.siege = null; });
    l.splice(l.indexOf(o), 1);
    var reste = l.filter(function(c){ return !c.sur && !c.tenu && c.y < SOL - 2 && !(c.t !== "perso" && (OBJ[c.t].mural || c.m)); });
    dessinerLieu(); reste.forEach(function(c){ placer(c); }); majTiroir(); son("pop"); sauver();
    bulle(o.t === "perso" ? "🎒 " + cfgDe(o.p).nom + " est rangé" + (/(a|e)$/.test(cfgDe(o.p).nom) ? "e" : "") : "👋 " + OBJ[o.t].nom + " enlevé");
  }
  function persoPres(x, y, rayon, cible){ // le personnage dont la tête (ou la main) est la plus proche
    var best = null, dmin = rayon;
    objetsIci().forEach(function(a){ if(a.t !== "perso") return; var k = echelle(a), pt;
      if(cible === "tete") pt = a.pose === "couche" ? [a.x - 80 * k, a.y - 40 * k] : [a.x, a.y - (a.pose === "assis" ? 158 : 198) * k];
      else if(cible === "main") pt = mainMonde(a);
      else pt = [a.x, a.y - 130 * k];
      var d = Math.hypot(pt[0] - x, pt[1] - y); if(d < dmin){ dmin = d; best = a; } });
    return best;
  }
  function lacher(o){
    var T = o.t === "perso" ? null : OBJ[o.t], centre = T ? [o.x, o.y - T.h / 2] : null;
    if(T && T.vet){ var p = persoPres(centre[0], centre[1], 150, "corps"); if(p){ habiller(p, o, T.vet); return; } }
    if(T && T.maquillage){ var q = persoPres(centre[0], centre[1], 90, "tete"); if(q){ var c = cfgDe(q.p); c.levres = c.levres ? "" : hasard(["#E5484D", "#FF6F9F", "#8E5BC4"]); expression(q, "rire"); son("habille"); redessiner(q); placer(o); sauver(); return; } }
    if(T && T.mange){ var m = persoPres(centre[0], centre[1], 80, "tete"); if(m){ manger(m, o); return; } }
    if(T && T.porte){ var h = persoPres(centre[0], centre[1], 85, "main");
      if(h && !objetsIci().some(function(a){ return a.tenu === h.id; })){ o.tenu = h.id; o.sur = null; dessinerLieu(); son("pop"); sauver(); return; } }
    if(o.t === "perso"){ o.expr = null; }
    placer(o);
    if(o.t === "perso"){ redessiner(o); if(o.siege) son("pose"); }
    sauver();
  }
  function manger(p, o){
    var l = objetsIci(); l.splice(l.indexOf(o), 1); dessinerLieu();
    var pp = trouver(p.id); expression(pp, "mange", 500); son("miam");
    setTimeout(function(){ expression(pp, "rire", 1000); son("rire"); }, 520); sauver();
  }
  function habiller(p, o, vet){
    var c = cfgDe(p.p);
    Object.keys(vet).forEach(function(k){
      if(k === "accessoire" && c.accessoire === vet.accessoire) c.accessoire = "aucun"; // remettre le même = l'enlever
      else if(k === "pansement") c.pansement = !c.pansement;
      else c[k] = vet[k];
      if(k === "haut" && vet.haut === "robe") c.bas = c.bas === "jupe" ? "pantalon" : c.bas;
    });
    var l = objetsIci(); l.splice(l.indexOf(o), 1); dessinerLieu();
    expression(trouver(p.id), "rire", 1200); animer(trouver(p.id), "saute", 520); son("habille"); majTiroir(); sauver();
  }

  /* ================= toucher un objet : il se passe quelque chose ================= */
  function apparait(type, x, y){ var n = { id: nouvelId(), t: type, x: x, y: y, e: {}, d: 0, m: 0 }; objetsIci().push(n); dessinerLieu(); placer(n); return n; }
  var MANGER = ["pomme", "banane", "fraise", "carotte", "fromage", "oeuf", "jus", "lait", "glace", "gateau", "raisin", "orange", "pizza", "sandwich"];
  var JOUETS = ["nounours", "ballon", "dino", "robotJouet", "poupee", "console", "guitare", "crayons", "livre"];
  var HABITS = Object.keys(OBJ).filter(function(k){ return OBJ[k].cat === "habit" && k !== "pansement"; });
  function bascule(o){ o.e = o.e || {}; o.e.on = !o.e.on; redessiner(o); return o.e.on; }
  function toucher(o){
    if(o.t === "perso"){
      var c = cfgDe(o.p);
      if(o.pose === "couche"){ o.expr = o.expr === "sourire" ? null : "sourire"; redessiner(o); son(o.expr ? "ding" : "pose"); return; }
      animer(o, "saute", 520); expression(o, "rire", 1200); son("rire");
      if(o.pose === "debout" || o.pose === "tient"){ var avant = o.pose; o.pose = "salut"; redessiner(o); setTimeout(function(){ if(o.pose === "salut"){ o.pose = "debout"; redessiner(o); } }, 1200); }
      bulle("😄 " + c.nom); return;
    }
    var T = OBJ[o.t], a = T.action;
    if(T.animal){ animer(o, "saute", 520); son(T.animal === "lapin" || T.animal === "poisson" ? "pop" : T.animal); return; }
    if(!a){ animer(o, "tremble", 900); son("clic"); return; }
    if(a === "frigo"){ if(bascule(o)){ son("pop"); apparait(hasard(MANGER), o.x + (Math.random() - .5) * 80, o.y - 160); } else son("pose"); }
    else if(a === "armoire"){ if(bascule(o)){ son("pop"); apparait(hasard(HABITS), o.x + (Math.random() - .5) * 120, o.y - 200); } else son("pose"); }
    else if(a === "cadeau"){ bascule(o); if(o.e.on){ son("magie"); apparait(hasard(JOUETS), o.x + 60, o.y - 120); } }
    else if(a === "feu" || a === "lampe" || a === "bain"){ bascule(o); son(o.e.on ? "ding" : "clic"); }
    else if(a === "eau"){ bascule(o); if(o.e.on) son("eau"); }
    else if(a === "chasse"){ o.e = { on: true }; redessiner(o); son("chasse"); setTimeout(function(){ o.e.on = false; redessiner(o); }, 1500); }
    else if(a === "tele"){ o.e = o.e || {}; if(!o.e.on){ o.e.on = true; o.e.n = 0; } else if(o.e.n >= 3) o.e.on = false; else o.e.n++; redessiner(o); son(o.e.on ? "musique" : "clic"); }
    else if(a === "tableau" || a === "tourne"){ o.e = o.e || {}; o.e.n = (o.e.n || 0) + 1; redessiner(o); son("clic"); }
    else if(a === "caisse"){ o.e = { on: true }; redessiner(o); son("caisse"); setTimeout(function(){ o.e.on = false; redessiner(o); }, 1500); }
    else if(a === "musique"){ bascule(o); if(o.e.on) son("musique"); }
    else if(a === "radio"){ bascule(o); son(o.e.on ? "magie" : "clic"); }
    else if(a === "relooking"){ var p = persoPres(o.x, o.y + 200, 320, "corps"); if(p) ouvrirCreateur(p.p, "beaute"); else bulle("💇 Assieds quelqu'un dans le fauteuil !"); }
    else if(a === "balance"){ bascule(o); dessinerLieu(); son("pop"); }
    else if(a === "souffle"){ o.e = { on: true }; redessiner(o); son("souffle"); setTimeout(function(){ o.e.on = false; redessiner(o); }, 900); }
    else if(a === "sirene"){ o.e = o.e || {}; o.e.on = !o.e.on; o.e.n = 0; redessiner(o); if(o.e.on){ son("sirene"); var compte = 0, it = setInterval(function(){ if(!o.e.on || ++compte > 8 || lieuCourant === null){ clearInterval(it); o.e.on = false; redessiner(o); return; } o.e.n++; redessiner(o); if(compte % 2) son("sirene"); }, 450); } }
    else if(a === "bulles"){ o.e = { on: true }; redessiner(o); son("pop"); setTimeout(function(){ o.e.on = false; redessiner(o); }, 1200); }
    else son(a);
    if(a !== "balance") animer(o, "tremble", 900);
    sauver();
  }

  /* ================= le tiroir des personnages ================= */
  function lieuDe(pid){ var r = null; ORDRE.forEach(function(k){ if(etat.lieux[k].objets.some(function(o){ return o.t === "perso" && o.p === pid; })) r = k; }); return r; }
  function tete(cfg){ return '<svg viewBox="-80 -290 160 150"><g>' + PERSO.dessiner(cfg, {}) + "</g></svg>"; }
  function majTiroir(){
    var t = $("tiroir"); t.innerHTML = "";
    etat.persos.forEach(function(p){
      var ou = lieuDe(p.id), b = document.createElement("button"); b.className = "carteP" + (ou === lieuCourant ? " ici" : "");
      var k = PERSO.TAILLES[p.cfg.taille] || 1;
      b.innerHTML = '<svg viewBox="' + (-80 * k) + " " + (-290 * k) + " " + (160 * k) + " " + (150 * k) + '">' + PERSO.dessiner(p.cfg, {}) + '</svg><span></span>' + (ou && ou !== lieuCourant ? '<i class="ou"></i>' : "") + '<button class="modif" aria-label="Changer">✏️</button>';
      b.querySelector("span").textContent = p.cfg.nom || "?"; if(ou && ou !== lieuCourant) b.querySelector(".ou").textContent = LIEUX[ou].e;
      b.querySelector(".modif").addEventListener("pointerdown", function(e){ e.stopPropagation(); });
      b.querySelector(".modif").onclick = function(e){ e.stopPropagation(); ouvrirCreateur(p.id, "tout"); };
      // toucher = il arrive ; glisser = on le pose où on veut
      var depart = null, pris = null;
      b.addEventListener("pointerdown", function(e){ ctx(); depart = { x: e.clientX, y: e.clientY }; pris = null; try{ b.setPointerCapture(e.pointerId); }catch(x){} });
      b.addEventListener("pointermove", function(e){
        if(!depart) return;
        if(!pris && e.clientY < $("tiroir").getBoundingClientRect().top - 10){ pris = venir(p.id, versScene(e)); if(pris){ pris.pose = "porte"; dessinerLieu(); } }
        if(pris){ var q = versScene(e); pris.x = q.x; pris.y = q.y + 140; majNoeud(pris); }
      });
      b.addEventListener("pointerup", function(e){
        if(!depart) return; depart = null;
        if(pris){ if(e.clientY > $("tiroir").getBoundingClientRect().top) ranger(pris); else lacher(pris); pris = null; majTiroir(); return; }
        if(ou === lieuCourant){ var o = objetsIci().filter(function(a){ return a.t === "perso" && a.p === p.id; })[0]; if(o){ voir(o.x); toucher(o); } return; }
        var r = scene.getBoundingClientRect(), centre = versScene({ clientX: r.left + r.width / 2, clientY: r.top + r.height * .3 });
        var n = venir(p.id, centre); if(n){ dessinerLieu(); placer(n); son("pop"); majTiroir(); }
      });
      b.addEventListener("pointercancel", function(){ depart = null; pris = null; });
      t.appendChild(b);
    });
    var nv = document.createElement("button"); nv.className = "carteP nouveau"; nv.innerHTML = "➕<span>Nouveau</span>"; nv.onclick = function(){ ouvrirCreateur(null, "tout"); }; t.appendChild(nv);
  }
  /* un personnage vient dans le lieu (il quitte l'endroit où il était) */
  function venir(pid, pos){
    ORDRE.forEach(function(k){ var l = etat.lieux[k].objets; for(var i = l.length - 1; i >= 0; i--){ if(l[i].t === "perso" && l[i].p === pid){ var id = l[i].id; l.splice(i, 1); l.forEach(function(c){ if(c.tenu === id) c.tenu = null; if(c.sur === id) c.sur = null; }); } } });
    var o = { id: "P" + pid + Date.now().toString(36), t: "perso", p: pid, x: pos.x, y: pos.y, pose: "debout" };
    objetsIci().push(o); sauver(); return o;
  }
  function voir(x){ var r = scene.clientWidth, L = LIEUX[lieuCourant], px = x / L.W * svg.clientWidth; scene.scrollTo({ left: px - r / 2, behavior: "smooth" }); }

  /* ================= créer et changer un personnage ================= */
  var creation = null;
  var ONGLETS = {
    tout: [["taille", "Taille"], ["peau", "Peau"], ["cheveux", "Cheveux"], ["couleurCheveux", "Couleur des cheveux"], ["yeux", "Yeux"], ["haut", "Haut"], ["couleurHaut", "Couleur du haut"], ["motif", "Dessin"],
      ["bas", "Bas"], ["couleurBas", "Couleur du bas"], ["chaussures", "Chaussures"], ["accessoire", "Accessoire"], ["barbe", "Barbe"], ["levres", "Rouge à lèvres"], ["joues", "Joues"]],
    beaute: [["cheveux", "Coiffure"], ["couleurCheveux", "Couleur"], ["accessoire", "Accessoire"], ["levres", "Rouge à lèvres"], ["joues", "Joues"], ["barbe", "Barbe"]]
  };
  var ongletCreer = null;
  function ouvrirCreateur(pid, mode){
    var p = pid ? etat.persos.filter(function(x){ return x.id === pid; })[0] : null;
    creation = { pid: pid, mode: mode, cfg: p ? clone(p.cfg) : Object.assign(PERSO.auHasard(), { nom: "" }) };
    $("titreCreer").textContent = mode === "beaute" ? "💇 Le salon de beauté" : pid ? "✏️ " + (p.cfg.nom || "Mon personnage") : "🧑‍🎨 Nouveau personnage";
    $("nomPerso").value = creation.cfg.nom || ""; $("nomPerso").style.display = mode === "beaute" ? "none" : "";
    $("supprPerso").style.display = pid && mode !== "beaute" ? "" : "none"; delete $("supprPerso").dataset.sur; $("supprPerso").textContent = "🗑️ Enlever";
    $("hasard").style.display = mode === "beaute" ? "none" : "";
    ongletCreer = ONGLETS[mode][0][0]; remplirOnglets(); remplirOptions(); majApercu();
    $("fCreer").classList.add("voir"); son("magie");
  }
  function remplirOnglets(){
    var box = $("ongletsCreer"); box.innerHTML = "";
    ONGLETS[creation.mode].forEach(function(o){ var b = document.createElement("button"); b.textContent = o[1]; if(o[0] === ongletCreer) b.className = "on";
      b.onclick = function(){ ongletCreer = o[0]; remplirOnglets(); remplirOptions(); }; box.appendChild(b); });
  }
  function valeurs(cle){
    var C = PERSO.CHOIX;
    if(cle === "couleurHaut" || cle === "couleurBas" || cle === "chaussures") return C.couleurs.map(function(c){ return [c]; });
    if(cle === "peau" || cle === "couleurCheveux" || cle === "yeux") return C[cle].map(function(c){ return [c]; });
    return C[cle];
  }
  function remplirOptions(){
    var box = $("optionsCreer"), cle = ongletCreer; box.innerHTML = "";
    valeurs(cle).forEach(function(v){
      var b = document.createElement("button"), val = v[0], couleur = /^#/.test(val) && v.length === 1;
      if(couleur){ b.className = "pastille"; b.style.background = val; b.setAttribute("aria-label", "Couleur " + val); }
      else {
        var essai = Object.assign({}, creation.cfg); essai[cle] = val;
        var tete = ["cheveux", "accessoire", "barbe", "levres", "joues"].indexOf(cle) >= 0;
        var k = PERSO.TAILLES[essai.taille] || 1;
        b.innerHTML = '<svg viewBox="' + (tete ? (-85 * k) + " " + (-300 * k) + " " + (170 * k) + " " + (170 * k) : (-110 * k) + " " + (-310 * k) + " " + (220 * k) + " " + (320 * k)) + '">' + PERSO.dessiner(essai, {}) + "</svg><span></span>";
        b.querySelector("span").textContent = v[v.length - 1];
      }
      if(creation.cfg[cle] === val || (!creation.cfg[cle] && val === "")) b.classList.add("on");
      b.onclick = function(){ creation.cfg[cle] = val; if(cle === "haut" && val === "robe" && creation.cfg.bas === "jupe") creation.cfg.bas = "pantalon"; son("clic"); majApercu(); remplirOptions(); };
      box.appendChild(b);
    });
  }
  function majApercu(){ var k = PERSO.TAILLES[creation.cfg.taille] || 1; $("apercu").innerHTML = '<g transform="scale(' + (.95 / k) + ')"><g class="saute">' + PERSO.dessiner(creation.cfg, { pose: "salut", expr: "rire" }) + "</g></g>"; }
  $("hasard").onclick = function(){ var nom = $("nomPerso").value; creation.cfg = Object.assign(PERSO.auHasard(), { nom: nom }); son("magie"); majApercu(); remplirOptions(); };
  $("finiCreer").onclick = function(){
    creation.cfg.nom = ($("nomPerso").value || creation.cfg.nom || "").trim().slice(0, 14) || "Ami";
    if(creation.pid){ etat.persos.forEach(function(p){ if(p.id === creation.pid) p.cfg = creation.cfg; }); }
    else { var id = "p" + nouvelId(); etat.persos.push({ id: id, cfg: creation.cfg });
      if(lieuCourant && $("eLieu").classList.contains("actif")){ var r = scene.getBoundingClientRect(), n = venir(id, versScene({ clientX: r.left + r.width / 2, clientY: r.top + r.height * .3 })); dessinerLieu(); placer(n); } }
    $("fCreer").classList.remove("voir"); son("habille"); sauver();
    if(lieuCourant && $("eLieu").classList.contains("actif")){ dessinerLieu(); majTiroir(); var o = objetsIci().filter(function(a){ return a.t === "perso" && a.p === (creation.pid); })[0]; if(o){ expression(o, "rire", 1500); animer(o, "saute"); } }
    majCarte();
  };
  $("supprPerso").onclick = function(){
    var b = $("supprPerso"); if(!b.dataset.sur){ b.dataset.sur = "1"; b.textContent = "❓ Sûr ? Touche encore"; return; }
    var pid = creation.pid; etat.persos = etat.persos.filter(function(p){ return p.id !== pid; });
    ORDRE.forEach(function(k){ etat.lieux[k].objets = etat.lieux[k].objets.filter(function(o){ return !(o.t === "perso" && o.p === pid); }); });
    $("fCreer").classList.remove("voir"); sauver(); if(lieuCourant){ dessinerLieu(); majTiroir(); } majCarte();
  };

  /* ================= ajouter des objets (le panier) ================= */
  var catObjets = "meuble";
  function remplirObjets(){
    var o = $("ongletsObjets"); o.innerHTML = "";
    window.CATALOGUE.forEach(function(c){ var b = document.createElement("button"); b.textContent = c[1] + " " + c[2]; if(c[0] === catObjets) b.className = "on"; b.onclick = function(){ catObjets = c[0]; remplirObjets(); }; o.appendChild(b); });
    var g = $("grilleObjets"); g.innerHTML = "";
    Object.keys(OBJ).forEach(function(k){
      var T = OBJ[k]; if(T.cat !== catObjets) return;
      var b = document.createElement("button"), m = Math.max(T.w, T.h) + 20;
      b.innerHTML = '<svg viewBox="' + (-m / 2) + " " + (-m + 5) + " " + m + " " + m + '">' + T.d({}) + "</svg><span></span>"; b.querySelector("span").textContent = T.nom;
      b.onclick = function(){ $("fObjets").classList.remove("voir"); var r = scene.getBoundingClientRect(), c = versScene({ clientX: r.left + r.width / 2, clientY: r.top + r.height * .25 });
        var n = { id: nouvelId(), t: k, x: c.x + (Math.random() - .5) * 200, y: T.mural ? 500 : c.y, e: {}, d: 0, m: T.mural ? 1 : 0 }; objetsIci().push(n); dessinerLieu(); placer(n); son("pop"); sauver(); };
      g.appendChild(b);
    });
  }
  $("btnObjets").onclick = function(){ remplirObjets(); $("fObjets").classList.add("voir"); };
  $("fermerObjets").onclick = function(){ $("fObjets").classList.remove("voir"); };
  $("btnSon").onclick = function(){ sonOn = !sonOn; ecrire("ville-son", sonOn ? "1" : "0"); $("btnSon").textContent = sonOn ? "🔊" : "🔇"; };
  $("btnSon").textContent = sonOn ? "🔊" : "🔇";
  $("btnReset").onclick = function(){
    var b = $("btnReset"); if(!b.dataset.sur){ b.dataset.sur = "1"; bulle("🔄 Remettre ce lieu comme au début ? Touche encore"); setTimeout(function(){ delete b.dataset.sur; }, 3000); return; }
    delete b.dataset.sur; var persos = objetsIci().filter(function(o){ return o.t === "perso"; });
    etat.lieux[lieuCourant] = installerLieu(lieuCourant);
    persos.forEach(function(p){ p.siege = null; p.sur = null; p.y = Math.min(p.y, 980); objetsIci().push(p); });
    dessinerLieu(); persos.forEach(function(p){ placer(p, true); }); dessinerLieu(); son("magie"); sauver();
  };

  /* ================= les écrans ================= */
  function aller(id){ document.querySelectorAll(".ecran").forEach(function(e){ e.classList.toggle("actif", e.id === id); }); }
  function choisirEnfant(id){
    profil = id; ecrire("ville-profil", id); chargerEtat();
    var e = enfantDe(id); $("moi").textContent = e.e + " " + e.nom; majCarte(); aller("eCarte"); son("magie");
  }
  function majCarte(){
    if(!etat) return; var box = $("lieux"); box.innerHTML = "";
    ORDRE.forEach(function(k){
      var L = LIEUX[k], noms = etat.lieux[k].objets.filter(function(o){ return o.t === "perso"; }).map(function(o){ return cfgDe(o.p).nom; });
      var b = document.createElement("button"); b.className = "lieu"; b.style.background = L.couleur;
      b.innerHTML = '<span class="e"></span><b></b><small></small>'; b.querySelector(".e").textContent = L.e; b.querySelector("b").textContent = L.nom;
      b.querySelector("small").textContent = noms.length ? "Ici : " + noms.join(", ") : "Personne pour l'instant";
      b.onclick = function(){ ouvrirLieu(k); }; box.appendChild(b);
    });
    var c = document.createElement("button"); c.className = "lieu creer"; c.innerHTML = '<span class="e">🧑‍🎨</span><b>Créer un personnage</b><small>Choisis tout : la taille, les cheveux, les habits…</small>';
    c.onclick = function(){ ouvrirCreateur(null, "tout"); }; box.appendChild(c);
  }
  function ouvrirLieu(k){
    lieuCourant = k; var L = LIEUX[k]; $("titreLieu").textContent = L.e + " " + L.nom;
    aller("eLieu"); dessinerLieu(); majTiroir();
    var p = objetsIci().filter(function(o){ return o.t === "perso"; })[0];
    scene.scrollLeft = 0; if(p) voir(p.x);
    son("pop");
  }
  $("versCarte").onclick = function(){ sauverMaintenant(); lieuCourant = null; majCarte(); aller("eCarte"); };
  $("versQui").onclick = function(){ sauverMaintenant(); majEnfants(); aller("eQui"); };
  $("moi").onclick = $("versQui").onclick;

  majEnfants();
  window.__ville = { etat: function(){ return etat; }, objetsIci: function(){ return objetsIci(); }, lacher: lacher, toucher: toucher, trouver: trouver, venir: venir, placer: placer, dessinerLieu: dessinerLieu, versScene: versScene };
})();
