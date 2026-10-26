/* « Je répète ! » — un jeu de parole pour les tout-petits.
   La voix montre une image, dit le mot, puis l'enfant le répète (2 fois par défaut).
   Les mots difficiles sont découpés en petits morceaux (ca… ca… houète).
   Le micro sert seulement à savoir que l'enfant a parlé : rien ne quitte l'appareil.
   En option (parents), la reconnaissance vocale du navigateur ajoute un « Parfait ! ». */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  function lire(k, d){ try{ var v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
  function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function slug(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function hasard(l){ return l[Math.floor(Math.random() * l.length)]; }
  function melanger(l){ l = l.slice(); for(var i = l.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t; } return l; }
  var attendre = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
  var TEST = /test/.test(location.search);

  var NIVEAUX = [
    { id:"facile", e:"🐣", nom:"Petits mots", desc:"chat, lune, pain…" },
    { id:"moyen", e:"🐥", nom:"Mots moyens", desc:"ballon, lapin…" },
    { id:"difficile", e:"🦁", nom:"Mots difficiles", desc:"cacahouète, papillon…" }
  ];
  var AUTOCOLLANTS = ["🦄", "🐬", "🦖", "🐼", "🦊", "🐙", "🦋", "🐳", "🦁", "🐸", "🌈", "🍦", "🚀", "🎠", "🧁", "🐝", "🐧", "🦩", "🌻", "⭐"];
  var reglages = { micro: lire("parler-micro", "1") === "1", verif: lire("parler-verif", "0") === "1", rep: parseInt(lire("parler-rep", "2"), 10) || 2 };
  var niveau = lire("parler-niveau", "facile");
  var Reconnaissance = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ---------- voix enregistrées ---------- */
  var lecteur = new Audio(), tour = 0;
  var VERSION_SONS = "?v=2";   // à changer quand on réenregistre les voix (sinon le navigateur garde les anciennes)
  function dire(nom){
    var monTour = tour;
    return new Promise(function(fin){
      if(monTour !== tour) return fin();
      var fait = false, finir = function(){ if(!fait){ fait = true; fin(); } };
      lecteur.onended = finir; lecteur.onerror = function(){ setTimeout(finir, 600); };
      lecteur.muted = false; lecteur.src = "sons/" + nom + ".mp3" + VERSION_SONS;
      var p = lecteur.play(); if(p && p.catch) p.catch(function(){ setTimeout(finir, 600); });
      setTimeout(finir, 9000); // filet de sécurité
    });
  }
  function phrase(t){ return dire("p-" + slug(t)); }

  /* ---------- petits sons ---------- */
  var actx = null;
  function audio(){ if(!actx){ try{ actx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} } if(actx && actx.state === "suspended") actx.resume(); return actx; }
  function ding(n){ var c = audio(); if(!c) return; [523, 659, 784, 1047].slice(0, n || 3).forEach(function(f, i){ var t = c.currentTime + i * .09, o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .3); }); }

  /* ---------- le micro : savoir si l'enfant parle ---------- */
  var micro = null, analyseur = null, donnees = null, niveauSon = 0;
  function ouvrirMicro(){
    if(micro || !reglages.micro || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(!!micro);
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function(flux){
      var c = audio(); micro = c.createMediaStreamSource(flux); analyseur = c.createAnalyser(); analyseur.fftSize = 1024;
      donnees = new Float32Array(analyseur.fftSize); micro.connect(analyseur); return true;
    }).catch(function(){ micro = null; return false; });
  }
  function mesurer(){
    if(!analyseur) return 0;
    analyseur.getFloatTimeDomainData(donnees); var s = 0; for(var i = 0; i < donnees.length; i++) s += donnees[i] * donnees[i];
    return Math.sqrt(s / donnees.length);
  }
  (function anim(){ requestAnimationFrame(anim); niveauSon = mesurer(); var o = $("oreille").firstChild; o.style.transform = "scale(" + Math.min(1.5, .6 + niveauSon * 18) + ")"; })();
  var appuiDit = false;
  $("dit").onclick = function(){ appuiDit = true; ding(2); };
  /* écouter : se termine quand l'enfant a parlé (puis s'est arrêté), ou si un adulte appuie sur ✅, ou au bout d'un moment */
  function ecouter(motAttendu){
    var monTour = tour;
    appuiDit = false;
    $("oreille").classList.add("ecoute"); $("consigne").textContent = "À toi !";
    var reco = null, reconnu = false;
    if(reglages.verif && Reconnaissance && motAttendu){
      try{ reco = new Reconnaissance(); reco.lang = "fr-FR"; reco.interimResults = true; reco.maxAlternatives = 3;
        reco.onresult = function(ev){ for(var i = 0; i < ev.results.length; i++) for(var j = 0; j < ev.results[i].length; j++){ if(ressemble(ev.results[i][j].transcript, motAttendu)) reconnu = true; } };
        reco.onerror = function(){}; reco.start(); }catch(e){ reco = null; }
    }
    return new Promise(function(fin){
      var t0 = performance.now(), base = 0, nb = 0, parle = 0, dernierSon = 0, debut = 0;
      var duree = micro ? 7000 : 4500;
      (function boucle(){
        if(monTour !== tour) return terminer(false);
        var t = performance.now() - t0, v = niveauSon;
        if(t < 350){ base += v; nb++; return requestAnimationFrame(boucle); }   // bruit de la pièce
        var seuil = Math.max(.018, (base / Math.max(1, nb)) * 2.8);
        if(micro && v > seuil){ parle += 16; dernierSon = t; if(!debut) debut = t; }
        if(appuiDit) return terminer(true);
        if(micro && parle > 220 && (t - dernierSon > 650 || t - debut > 3500)) return terminer(true);
        if(t > duree) return terminer(!micro); // sans micro : on continue tout seul
        if(TEST && window.__simulerParole && t > 700) return terminer(true);
        requestAnimationFrame(boucle);
      })();
      function terminer(ok){
        $("oreille").classList.remove("ecoute"); $("consigne").textContent = "";
        if(reco){ try{ reco.stop(); }catch(e){} }
        setTimeout(function(){ fin({ ok: ok, parfait: reconnu }); }, reco ? 400 : 0);
      }
    });
  }
  function ressemble(dit, mot){
    var a = slug(dit).replace(/-/g, ""), b = slug(mot).replace(/-/g, "");
    if(!a) return false; if(a.indexOf(b) >= 0 || b.indexOf(a) >= 0 && a.length >= b.length * .6) return true;
    // petite distance d'édition
    var m = [], i, j; for(i = 0; i <= a.length; i++){ m[i] = [i]; } for(j = 0; j <= b.length; j++) m[0][j] = j;
    for(i = 1; i <= a.length; i++) for(j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return m[a.length][b.length] <= Math.max(1, Math.floor(b.length / 3));
  }

  /* ---------- affichage ---------- */
  function montrerMot(w, morceauActif){
    var box = $("mot"); box.innerHTML = "";
    var parts = w.s ? w.s.map(function(x){ return x[0]; }) : [w.m];
    parts.forEach(function(p, i){ var s = document.createElement("span"); s.textContent = p; if(i === morceauActif) s.className = "on"; box.appendChild(s); });
    box.classList.toggle("entier", morceauActif === -1);
    if(morceauActif === -2) Array.prototype.forEach.call(box.children, function(s){ s.classList.add("on"); });
  }
  function hop(){ var im = $("image"); im.classList.remove("hop"); void im.offsetWidth; im.classList.add("hop"); }
  function fete(n){ var f = $("fete"), em = ["⭐", "🎉", "🌟", "🎈", "💖", "✨"]; for(var i = 0; i < (n || 20); i++){ var s = document.createElement("span"); s.textContent = hasard(em);
    s.style.left = Math.random() * 100 + "vw"; s.style.animationDuration = (1.6 + Math.random() * 1.6) + "s"; s.style.animationDelay = Math.random() * .5 + "s"; f.appendChild(s); setTimeout(function(x){ return function(){ x.remove(); }; }(s), 3800); } }
  function majEtoiles(n, total){ $("etoiles").textContent = "⭐".repeat(n) + "☆".repeat(total - n); }

  /* ---------- une partie : 5 mots ---------- */
  var partie = null;
  async function jouerMot(w){
    var monTour = tour;
    var vivant = function(){ return monTour === tour; };
    $("image").textContent = w.e; montrerMot(w, -1); hop();
    await dire("c-" + slug(w.m)); if(!vivant()) return;
    var difficile = w.s && (niveau === "difficile" || w.s.length >= 3);
    // les mots difficiles : on les découpe en petits morceaux
    if(difficile){
      await phrase(PHRASES_PARLER.difficile); if(!vivant()) return;
      for(var i = 0; i < w.s.length; i++){
        montrerMot(w, i);
        if(i === 0){ await phrase(PHRASES_PARLER.morceau); if(!vivant()) return; }
        await dire("s-" + slug(w.s[i][1])); if(!vivant()) return;
        await ecouter(null); if(!vivant()) return;
        ding(2);
      }
      montrerMot(w, -2);
      await phrase(PHRASES_PARLER.ensemble); if(!vivant()) return;
    }
    // le mot entier, à répéter (2 fois par défaut)
    for(var k = 0; k < reglages.rep; k++){
      montrerMot(w, -2);
      if(k > 0){ await phrase(PHRASES_PARLER.encore); if(!vivant()) return; }
      await dire("m-" + slug(w.m)); if(!vivant()) return;
      if(k === 0 && !difficile){ await phrase(PHRASES_PARLER.aToi); if(!vivant()) return; }
      var r = await ecouter(w.m); if(!vivant()) return;
      if(!r.ok){
        // pas entendu : on aide (en découpant si possible) et on réessaie une fois, sans jamais gronder
        if(w.s && !difficile){ for(var j = 0; j < w.s.length; j++){ montrerMot(w, j); await dire("s-" + slug(w.s[j][1])); if(!vivant()) return; await attendre(250); } montrerMot(w, -2); }
        await dire("m-" + slug(w.m)); if(!vivant()) return;
        await phrase(PHRASES_PARLER.aToi); if(!vivant()) return;
        r = await ecouter(w.m); if(!vivant()) return;
      }
      hop(); ding(3);
      if(r.parfait){ fete(10); await phrase(PHRASES_PARLER.parfait); }
      else await phrase(hasard(PHRASES_PARLER.bravo));
      if(!vivant()) return;
    }
  }
  async function jouerPartie(){
    tour++; var monTour = tour;
    var liste = melanger(MOTS[niveau]).slice(0, 5);
    partie = { liste: liste, i: 0, etoiles: 0 };
    afficher("vJeu"); majEtoiles(0, liste.length);
    await ouvrirMicro();
    $("oreille").style.opacity = micro ? 1 : .35;
    if(!lire("parler-bonjour", "")){ ecrire("parler-bonjour", "1"); await phrase(PHRASES_PARLER.bonjour); }
    for(var i = 0; i < liste.length; i++){
      if(monTour !== tour) return;
      partie.i = i; partie.mot = liste[i];
      await jouerMot(liste[i]);
      if(monTour !== tour) return;
      partie.etoiles++; majEtoiles(partie.etoiles, liste.length); fete(12);
      await attendre(500);
    }
    if(monTour !== tour) return;
    // fin : un autocollant pour l'album
    var a = hasard(AUTOCOLLANTS), album = lire("parler-album", "");
    ecrire("parler-album", album + a);
    $("autocollant").textContent = a; afficher("vFin"); fete(40); ding(4);
    phrase(PHRASES_PARLER.fin);
  }
  function afficher(v){ ["vAccueil", "vJeu", "vFin"].forEach(function(x){ $(x).hidden = x !== v; }); if(v === "vAccueil") remplirAccueil(); }
  function arreter(){ tour++; try{ lecteur.pause(); }catch(e){} afficher("vAccueil"); }

  /* ---------- accueil et réglages ---------- */
  function remplirAccueil(){
    var box = $("niveaux"); box.innerHTML = "";
    NIVEAUX.forEach(function(n){ var b = document.createElement("button"); b.innerHTML = '<span class="e">' + n.e + "</span>" + n.nom + "<small>" + n.desc + "</small>"; if(n.id === niveau) b.className = "on";
      b.onclick = function(){ niveau = n.id; ecrire("parler-niveau", niveau); ding(1); remplirAccueil(); }; box.appendChild(b); });
    var album = lire("parler-album", "");
    var al = $("album"); al.innerHTML = "";
    Array.from(album).filter(function(c){ return c.trim(); }).slice(-30).forEach(function(c){ if(/\p{Extended_Pictographic}/u.test(c)){ var s = document.createElement("span"); s.textContent = c; al.appendChild(s); } });
  }
  $("jouer").onclick = function(){ audio(); lecteur.muted = true; lecteur.src = "sons/p-bravo.mp3" + VERSION_SONS; var p = lecteur.play(); if(p && p.then) p.then(function(){ if(lecteur.src.indexOf("p-bravo") >= 0) lecteur.pause(); lecteur.muted = false; }).catch(function(){ lecteur.muted = false; }); else lecteur.muted = false; jouerPartie(); };
  $("encore").onclick = function(){ jouerPartie(); };
  $("retour").onclick = arreter; $("retourFin").onclick = arreter;
  $("carte").onclick = function(){ if(partie && partie.mot){ hop(); var l = new Audio("sons/m-" + slug(partie.mot.m) + ".mp3" + VERSION_SONS); l.play().catch(function(){}); } };
  $("redire").onclick = $("carte").onclick;
  function remplirReglages(){
    $("optMicro").checked = reglages.micro; $("optVerif").checked = reglages.verif;
    $("ligneVerif").style.opacity = Reconnaissance ? 1 : .45; $("optVerif").disabled = !Reconnaissance;
    var box = $("optRep"); box.innerHTML = "";
    [1, 2, 3].forEach(function(n){ var b = document.createElement("button"); b.textContent = n + (n > 1 ? " fois" : " fois"); if(n === reglages.rep) b.className = "on";
      b.onclick = function(){ reglages.rep = n; ecrire("parler-rep", String(n)); remplirReglages(); }; box.appendChild(b); });
  }
  $("ouvrirReglages").onclick = function(){ remplirReglages(); $("reglages").hidden = false; };
  $("fermerReglages").onclick = function(){ $("reglages").hidden = true; };
  $("optMicro").onchange = function(){ reglages.micro = this.checked; ecrire("parler-micro", this.checked ? "1" : "0"); };
  $("optVerif").onchange = function(){ reglages.verif = this.checked; ecrire("parler-verif", this.checked ? "1" : "0"); };
  remplirAccueil();
  if(TEST) window.__jeu = { get partie(){ return partie; }, get micro(){ return !!micro; }, reglages: reglages, ressemble: ressemble };
})();
