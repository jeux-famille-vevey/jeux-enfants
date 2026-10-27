/* « J'apprends à lire » : un chemin en 6 étapes, des voyelles jusqu'aux petites phrases.
   Étapes 1 à 4 : on découvre (on touche les cartes pour entendre), puis on joue.
   Étapes 5 et 6 : on lit un mot ou une phrase (on peut toucher les morceaux pour s'aider) et on choisit l'image. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var D = window.LIRE, V = D.voix;
  function lire(k, d){ try{ var v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } }
  function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function slug(t){ return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function hasard(l){ return l[Math.floor(Math.random() * l.length)]; }
  function melanger(l){ l = l.slice(); for(var i = l.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t; } return l; }
  var attendre = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };

  /* ---------- les joueurs (les mêmes que dans « Mon personnage ») ---------- */
  function profils(){
    var base = [{ id:"mikael", nom:"Mikael", e:"⚽" }, { id:"aleyah", nom:"Aleyah", e:"⭐" }, { id:"invite", nom:"Invité", e:"🙂" }], plus = [];
    try{ plus = JSON.parse(lire("profils-ajoutes", "[]")) || []; }catch(e){}
    return base.concat(plus);
  }
  var profil = lire("lire-profil", "mikael");
  if(!profils().some(function(p){ return p.id === profil; })) profil = "mikael";

  /* ---------- la voix (fichiers enregistrés, joués les uns après les autres) ---------- */
  var lecteur = new Audio(), tour = 0;   // « tour » coupe la voix en cours
  var session = 0;                         // « session » : change seulement quand on quitte l'étape
  function jouer(noms){
    var monTour = tour; noms = [].concat(noms);
    return noms.reduce(function(p, nom){ return p.then(function(){
      if(monTour !== tour) return;
      if(nom === "~") return attendre(350);   // petite pause
      return new Promise(function(fin){
        var fait = false, finir = function(){ if(!fait){ fait = true; fin(); } };
        lecteur.onended = finir; lecteur.onerror = function(){ setTimeout(finir, 300); };
        // la voix d'un parent (enregistrée sur cet appareil) passe avant la voix du jeu
        lecteur.muted = false; lecteur.src = MAVOIX[nom] || ("sons/" + nom + ".mp3?v=4");   // ?v=4 : nouvelles voix (sinon le navigateur garde les anciennes)
        var pr = lecteur.play(); if(pr && pr.catch) pr.catch(function(){ setTimeout(finir, 300); });
        setTimeout(finir, 8000);
      });
    }); }, Promise.resolve());
  }
  var v = function(t){ return "v-" + slug(t); };

  /* ---------- « Ma voix » : un parent peut enregistrer les sons lui-même (gardés sur cet appareil) ---------- */
  var MAVOIX = {};   // nom du son -> adresse du son enregistré
  var base = null;
  function ouvrirBase(){
    if(base) return base;
    base = new Promise(function(ok, ko){
      try{ var r = indexedDB.open("lire-ma-voix", 1);
        r.onupgradeneeded = function(){ r.result.createObjectStore("sons"); };
        r.onsuccess = function(){ ok(r.result); }; r.onerror = function(){ ko(r.error); };
      }catch(e){ ko(e); }
    });
    return base;
  }
  function baseFaire(mode, f){ return ouvrirBase().then(function(db){ return new Promise(function(ok, ko){ var t = db.transaction("sons", mode), st = t.objectStore("sons"), r = f(st); t.oncomplete = function(){ ok(r && r.result); }; t.onerror = function(){ ko(t.error); }; }); }); }
  function chargerMaVoix(){
    return baseFaire("readonly", function(st){ var res = {}; var c = st.openCursor(); c.onsuccess = function(){ var k = c.result; if(k){ res[k.key] = k.value; k.continue(); } }; return { get result(){ return res; } }; })
      .then(function(res){ Object.keys(MAVOIX).forEach(function(k){ URL.revokeObjectURL(MAVOIX[k]); }); MAVOIX = {}; Object.keys(res || {}).forEach(function(k){ MAVOIX[k] = URL.createObjectURL(res[k]); }); })
      .catch(function(){});
  }
  chargerMaVoix();
  var fLettre = function(l){ return "l-" + slug(l) + (l === "é" ? "-e" : ""); };
  // « coller les sons » = le son tenu, la voyelle, puis la syllabe (rrrr… i… ri), avec de petites pauses.
  // Chaque morceau est un son vérifié (ou la voix du parent s'il l'a enregistré).
  var fusion = function(it){ return [fLettre(it.c), "~", fLettre(it.v), "~", "s-" + slug(it.s)]; };

  /* ---------- sons et fête ---------- */
  var actx = null;
  function note(f, d, t0){ try{ if(!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); var t = actx.currentTime + (t0 || 0), o = actx.createOscillator(), g = actx.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .05); }catch(e){} }
  function ding(){ note(784, .2); note(1047, .25, .09); }
  function boup(){ note(220, .25); }
  function fete(n){ var f = $("fete"), em = ["⭐", "🎉", "🌟", "🎈", "💖", "✨", "📖"]; for(var i = 0; i < (n || 20); i++){ var s = document.createElement("span"); s.textContent = hasard(em);
    s.style.left = Math.random() * 100 + "vw"; s.style.animationDuration = (1.6 + Math.random() * 1.6) + "s"; s.style.animationDelay = Math.random() * .5 + "s"; f.appendChild(s); setTimeout(function(x){ return function(){ x.remove(); }; }(s), 3800); } }

  /* ---------- les étapes ---------- */
  var ETAPES = [
    { n:1, e:"🅰️", nom:"Les voyelles", age:"dès 3 ans", intro:V.intro1 },
    { n:2, e:"🎵", nom:"Les sons qui chantent", age:"dès 3 ans", intro:V.intro2 },
    { n:3, e:"🧲", nom:"Je colle les sons", age:"dès 4 ans", intro:V.intro3 },
    { n:4, e:"🔊", nom:"Je trouve la syllabe", age:"dès 5 ans", intro:V.intro4 },
    { n:5, e:"🏍️", nom:"Mes premiers mots", age:"dès 5 ans", intro:V.intro5 },
    { n:6, e:"📜", nom:"Petites phrases", age:"dès 6 ans", intro:V.intro6 }
  ];
  var cleEtoiles = function(n){ return "lire-" + profil + "-" + n; };
  function afficher(vue){ ["vCarte", "vDecouverte", "vQuestion", "vFin", "vStudio"].forEach(function(x){ $(x).hidden = x !== vue; }); }
  function carte(){
    tour++; session++; afficher("vCarte");
    var pb = $("profils"); pb.innerHTML = "";
    profils().forEach(function(p){ var b = document.createElement("button"); b.textContent = p.e + " " + p.nom; if(p.id === profil) b.className = "on";
      b.onclick = function(){ profil = p.id; ecrire("lire-profil", profil); carte(); }; pb.appendChild(b); });
    var plus = document.createElement("button"); plus.textContent = "➕";
    plus.title = "Ajouter un enfant";
    plus.onclick = function(){ var nom = (prompt("Comment s'appelle l'enfant ?") || "").trim().slice(0, 14); if(!nom) return; var l = []; try{ l = JSON.parse(lire("profils-ajoutes", "[]")) || []; }catch(e){}
      var id = "p" + Date.now().toString(36); l.push({ id: id, nom: nom, e: "🙂", numero: 3 + l.length }); ecrire("profils-ajoutes", JSON.stringify(l)); profil = id; ecrire("lire-profil", id); carte(); };
    pb.appendChild(plus);
    var ch = $("chemin"); ch.innerHTML = "";
    ETAPES.forEach(function(et){
      var e = parseInt(lire(cleEtoiles(et.n), "0"), 10) || 0;
      var b = document.createElement("button");
      b.innerHTML = '<span class="num">' + et.n + '</span><span class="e">' + et.e + "</span>" + et.nom + "<small>" + et.age + '</small><span class="et">' + "⭐".repeat(e) + "☆".repeat(3 - e) + "</span>";
      b.onclick = function(){ note(660, .15); commencer(et); };
      ch.appendChild(b);
    });
  }

  /* ---------- découverte (étapes 1 à 3) ---------- */
  var etape = null;
  async function commencer(et){
    tour++; session++; etape = et;
    if(et.n <= 3){
      afficher("vDecouverte"); $("titreEtape").textContent = et.e + " " + et.nom;
      var box = $("cartes"); box.innerHTML = "";
      var items = et.n === 1 ? D.voyelles : et.n === 2 ? D.chantantes : D.fusions.slice(0, 8);
      items.forEach(function(it){
        var c = document.createElement("button"); c.className = "carteL";
        if(et.n === 3) c.innerHTML = '<div class="fusion"><b class="c">' + it.c + '</b><b class="v">' + it.v + "</b></div><small>" + it.s + "</small>";
        else c.innerHTML = '<span class="lettre">' + it.l + '</span><span class="img">' + it.e + "</span><small>" + it.mot + "</small>";
        c.onclick = async function(){
          tour++; document.querySelectorAll(".carteL.on").forEach(function(x){ x.classList.remove("on"); }); c.classList.add("on", "vu");
          if(et.n === 3){ c.classList.remove("colle"); setTimeout(function(){ c.classList.add("colle"); }, 1400); await jouer(fusion(it)); }
          else await jouer([fLettre(it.l), "c-" + slug(it.mot)]);
          c.classList.remove("on");
        };
        box.appendChild(c);
      });
      $("pret").onclick = function(){ quiz(et); };
      jouer(v(et.intro));
    }else{
      await jouer(v(et.intro));
      quiz(et);
    }
  }

  /* ---------- les questions ---------- */
  function fabriquerQuestions(et){
    var Q = [];
    if(et.n === 1 || et.n === 2){
      var L = et.n === 1 ? D.voyelles : D.chantantes;
      melanger(L.concat(L)).slice(0, 8).forEach(function(it){
        var autres = melanger(L.filter(function(x){ return x !== it; })).slice(0, 2);
        Q.push({ consigne: et.n === 1 ? "Où est le " + it.l + " ?" : "Quelle lettre fait ce son ?", voix: [v(V.toucheLettre), fLettre(it.l)],
          choix: melanger([it].concat(autres)).map(function(x){ return { t: x.l, bon: x === it, son: [fLettre(x.l)] }; }), apres: ["c-" + slug(it.mot)] });
      });
    }else if(et.n === 3){
      melanger(D.fusions).slice(0, 8).forEach(function(it){
        var autres = melanger(D.fusions.filter(function(x){ return x !== it; })).slice(0, 2);
        Q.push({ consigne: "Trouve :", voix: [v(V.ouEst), "s-" + slug(it.s)], modeleSon: true,
          choix: melanger([it].concat(autres)).map(function(x){ return { t: x.s, bon: x === it, son: ["s-" + slug(x.s)] }; }), apres: fusion(it) });
      });
    }else if(et.n === 4){
      melanger(D.syllabes).slice(0, 8).forEach(function(g){
        var bon = hasard(g);
        Q.push({ consigne: "Trouve :", voix: [v(V.ouEst), "s-" + slug(bon)], modeleSon: true,
          choix: melanger(g).map(function(x){ return { t: x, bon: x === bon, son: ["s-" + slug(x)] }; }), apres: [] });
      });
    }else if(et.n === 5){
      melanger(D.mots).slice(0, 8).forEach(function(w){
        var autres = melanger(D.mots.filter(function(x){ return x !== w; })).slice(0, 2);
        Q.push({ consigne: "Lis le mot :", voix: [v(V.lisMot)], morceaux: w.s.map(function(s){ return { t: s[0], son: "s-" + slug(s[1]) }; }), motSon: "m-" + slug(w.m),
          choix: melanger([w].concat(autres)).map(function(x){ return { t: x.e, img: true, bon: x === w }; }), apres: ["m-" + slug(w.m)] });
      });
    }else{
      melanger(D.phrases).slice(0, 6).forEach(function(p){
        var mots = p.p.match(/[\wÀ-ÿ']+|[.!?]/g).filter(function(m){ return /[\wÀ-ÿ]/.test(m); });
        Q.push({ consigne: "Lis la phrase :", voix: [v(V.lisPhrase)], phrase: true, morceaux: mots.map(function(m){ return { t: m, son: "w-" + slug(m) }; }), motSon: "p-" + slug(p.p),
          choix: melanger([{ t: p.e, img: true, bon: true }].concat(p.faux.map(function(f){ return { t: f, img: true, bon: false }; }))), apres: ["p-" + slug(p.p)] });
      });
    }
    return Q;
  }
  async function quiz(et){
    tour++; session++; var maSession = session, Q = fabriquerQuestions(et), erreurs = 0;
    afficher("vQuestion");
    for(var i = 0; i < Q.length; i++){
      if(maSession !== session) return;
      $("etoilesQ").textContent = "⭐".repeat(i) + "▫️".repeat(Q.length - i);
      erreurs += await poser(Q[i]);
    }
    if(maSession !== session) return;
    var e = erreurs <= 1 ? 3 : erreurs <= 4 ? 2 : 1;
    if(e > (parseInt(lire(cleEtoiles(et.n), "0"), 10) || 0)) ecrire(cleEtoiles(et.n), String(e));
    afficher("vFin"); $("finEtoiles").textContent = "⭐".repeat(e) + "☆".repeat(3 - e);
    $("finTitre").textContent = e === 3 ? "Fantastique !" : "Bravo !";
    $("suivante").hidden = et.n >= ETAPES.length;
    fete(e * 14); note(523, .2); note(659, .2, .1); note(784, .2, .2); note(1047, .3, .3);
    jouer(v(e === 3 ? V.fin3 : e === 2 ? V.fin2 : V.fin1));
  }
  var numQuestion = 0;
  function poser(q){
    return new Promise(function(fin){
      var erreurs = 0, fini = false;
      numQuestion++; if(window.__lire){ window.__lire.q = q; window.__lire.num = numQuestion; }
      $("consigne").textContent = q.consigne;
      var mod = $("modele"); mod.innerHTML = ""; mod.className = q.phrase ? "phrase" : "";
      // les morceaux du mot / de la phrase : on peut les toucher pour les entendre
      (q.morceaux || []).forEach(function(m){ var s = document.createElement("span"); s.textContent = m.t;
        s.onclick = function(){ tour++; document.querySelectorAll("#modele span.on").forEach(function(x){ x.classList.remove("on"); }); s.classList.add("on"); jouer(m.son).then(function(){ s.classList.remove("on"); }); };
        mod.appendChild(s); });
      if(q.modeleSon){ var e = document.createElement("span"); e.className = "ecouter"; e.textContent = "🔊"; e.onclick = function(){ tour++; jouer(q.voix.slice(-1)); }; mod.appendChild(e); }
      var box = $("choix"); box.innerHTML = "";
      q.choix.forEach(function(c){
        var b = document.createElement("button"); b.textContent = c.t; if(c.img) b.className = "img";
        b.onclick = async function(){
          if(fini) return;
          if(c.bon){
            fini = true; b.classList.add("bon"); ding(); fete(8); tour++;
            await jouer((q.apres || []).concat([v(hasard(V.bravo))]));
            fin(erreurs);
          }else{
            erreurs++; b.classList.remove("non"); void b.offsetWidth; b.classList.add("non"); boup(); tour++;
            // on aide : on fait entendre ce qui est écrit sur la mauvaise carte, puis la consigne
            var aide = erreurs >= 2 && q.morceaux ? q.morceaux.map(function(m){ return m.son; }) : [];
            await jouer((c.son || []).concat([v(V.essaie)]).concat(q.modeleSon ? [q.voix[q.voix.length - 1]] : []).concat(aide));
          }
        };
        box.appendChild(b);
      });
      $("reecouter").onclick = function(){ tour++; jouer(q.motSon && erreurs > 0 ? [q.motSon] : q.voix); };
      jouer(q.voix);
    });
  }
  $("retour1").onclick = $("retour2").onclick = $("retour3").onclick = $("retour4").onclick = carte;

  /* ---------- le studio des parents ---------- */
  var COMME = { pa:"papa", ba:"banane", da:"dame", to:"tomate", "tô":"tomate", do:"domino", po:"pomme", mi:"ami", ni:"nid", li:"lit", "vé":"vélo", "fé":"fée", "bé":"bébé", lu:"lune", ru:"rue", nu:"nuage",
    ja:"jaune", cha:"chat", sa:"salade", ko:"koala", go:"gorille", ti:"tigre", di:"dix", pi:"pirate", mo:"moto", no:"nounours", lo:"loto", bu:"bus", pu:"puce", du:"dur",
    ra:"radio", la:"lama", na:"nager", fo:"forêt", vo:"vole", so:"sofa", ma:"maman", ri:"riz", vi:"vite", ki:"kiwi", oui:"oui", ju:"judo", ka:"café", te:"tomate", ne:"banane",
    de:"salade", tu:"tulipe", pe:"tulipe", o:"radio", fa:"sofa", fu:"fusée", "zé":"fusée" };
  var CONSEIL = { m:"mmmmmm", l:"llllll", s:"ssssss", r:"rrrrrr", f:"ffffff", n:"nnnnnn", ch:"chchchch (comme « chut » sans le « ut »)", v:"vvvvvv" };
  function lignesStudio(){
    var L = [{ titre:"🅰️ Les voyelles" }];
    D.voyelles.forEach(function(x){ L.push({ nom: fLettre(x.l), gros: x.l, dire: "Dites « " + x.l + " » (le son, pas le nom de la lettre)." }); });
    L.push({ titre:"🎵 Les sons qui chantent" });
    D.chantantes.forEach(function(x){ L.push({ nom: "l-" + slug(x.l), gros: x.l, dire: "Faites durer le son : « " + CONSEIL[x.l] + " », environ 2 secondes, sans « e » ni « a » derrière." }); });
    L.push({ titre:"🔊 Les syllabes (étapes 3, 4 et 5)" });
    var vues = {};
    var ajoute = function(dit, ecrit){ var n = "s-" + slug(dit); if(vues[n]) return; vues[n] = 1;
      L.push({ nom: n, gros: ecrit || dit, dire: "Dites « " + dit + " »" + (COMME[dit] ? " (comme dans « " + COMME[dit] + " »)" : "") + ", une seule fois, bien clairement." }); };
    D.fusions.forEach(function(x){ ajoute(x.s); });
    D.syllabes.forEach(function(g){ g.forEach(function(x){ ajoute(x); }); });
    D.mots.forEach(function(w){ w.s.forEach(function(p){ ajoute(p[1], p[0]); }); });
    return L;
  }
  var enreg = null;   // enregistrement en cours
  function arreterEnreg(){ if(enreg){ try{ enreg.rec.stop(); }catch(e){} } }
  function studio(){
    tour++; session++; afficher("vStudio");
    var box = $("listeStudio"); box.innerHTML = "";
    if(!window.MediaRecorder || !navigator.mediaDevices){ box.innerHTML = '<p class="aide">Cet appareil ne permet pas d\'enregistrer. Essayez avec Firefox ou Chrome sur l\'ordinateur.</p>'; return; }
    lignesStudio().forEach(function(l){
      if(l.titre){ var h = document.createElement("h2"); h.textContent = l.titre; box.appendChild(h); return; }
      var r = document.createElement("div"); r.className = "ligneS";
      r.innerHTML = '<b class="lettreS">' + l.gros + '</b><span class="dire">' + l.dire + '</span><span class="btns">' +
        '<button data-a="jeu" title="Voix du jeu">🤖</button><button data-a="rec" class="rec">🎙️ Enregistrer</button>' +
        '<button data-a="moi" title="Écouter ma voix">▶️</button><button data-a="suppr" title="Effacer ma voix">🗑️</button></span>';
      var maj = function(){ var a = !!MAVOIX[l.nom]; r.classList.toggle("fait", a); r.querySelector('[data-a=moi]').disabled = !a; r.querySelector('[data-a=suppr]').disabled = !a; };
      maj();
      r.querySelector('[data-a=jeu]').onclick = function(){ tour++; lecteur.src = "sons/" + l.nom + ".mp3?v=4"; lecteur.play().catch(function(){}); };
      r.querySelector('[data-a=moi]').onclick = function(){ tour++; jouer(l.nom); };
      r.querySelector('[data-a=suppr]').onclick = function(){ baseFaire("readwrite", function(st){ return st.delete(l.nom); }).then(chargerMaVoix).then(maj); };
      var bRec = r.querySelector('[data-a=rec]');
      bRec.onclick = function(){
        if(enreg && enreg.nom === l.nom){ arreterEnreg(); return; }
        arreterEnreg(); tour++;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(flux){
          var morceaux = [], rec = new MediaRecorder(flux);
          enreg = { nom: l.nom, rec: rec }; bRec.textContent = "⏹️ Stop"; bRec.classList.add("enCours");
          rec.ondataavailable = function(e){ if(e.data && e.data.size) morceaux.push(e.data); };
          rec.onstop = function(){
            flux.getTracks().forEach(function(t){ t.stop(); });
            enreg = null; bRec.textContent = "🎙️ Enregistrer"; bRec.classList.remove("enCours");
            if(!morceaux.length) return;
            var blob = new Blob(morceaux, { type: rec.mimeType || "audio/webm" });
            baseFaire("readwrite", function(st){ return st.put(blob, l.nom); }).then(chargerMaVoix).then(function(){ maj(); jouer(l.nom); });
          };
          rec.start(); setTimeout(function(){ if(rec.state === "recording") rec.stop(); }, 6000);   // 6 secondes au plus
        }).catch(function(){ alert("Le micro n'est pas disponible. Autorisez le micro pour ce site, puis réessayez."); });
      };
      box.appendChild(r);
    });
  }
  $("ouvrirStudio").onclick = studio;
  $("refaire").onclick = function(){ commencer(etape); };
  $("suivante").onclick = function(){ commencer(ETAPES[Math.min(ETAPES.length - 1, etape.n)]); };
  carte();
  if(/test/.test(location.search)) window.__lire = { ETAPES: ETAPES, commencer: commencer, get etape(){ return etape; } };
})();
