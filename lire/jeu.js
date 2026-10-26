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
      return new Promise(function(fin){
        var fait = false, finir = function(){ if(!fait){ fait = true; fin(); } };
        lecteur.onended = finir; lecteur.onerror = function(){ setTimeout(finir, 300); };
        lecteur.muted = false; lecteur.src = "sons/" + nom + ".mp3?v=2";   // ?v=2 : nouvelles voix (sinon le navigateur garde les anciennes)
        var pr = lecteur.play(); if(pr && pr.catch) pr.catch(function(){ setTimeout(finir, 300); });
        setTimeout(finir, 8000);
      });
    }); }, Promise.resolve());
  }
  var v = function(t){ return "v-" + slug(t); };
  var fLettre = function(l){ return "l-" + slug(l) + (l === "é" ? "-e" : ""); };

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
  function afficher(vue){ ["vCarte", "vDecouverte", "vQuestion", "vFin"].forEach(function(x){ $(x).hidden = x !== vue; }); }
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
          if(et.n === 3){ c.classList.remove("colle"); setTimeout(function(){ c.classList.add("colle"); }, 900); await jouer("f-" + slug(it.s)); }
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
          choix: melanger([it].concat(autres)).map(function(x){ return { t: x.s, bon: x === it, son: ["s-" + slug(x.s)] }; }), apres: ["f-" + slug(it.s)] });
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
  $("retour1").onclick = $("retour2").onclick = $("retour3").onclick = carte;
  $("refaire").onclick = function(){ commencer(etape); };
  $("suivante").onclick = function(){ commencer(ETAPES[Math.min(ETAPES.length - 1, etape.n)]); };
  carte();
  if(/test/.test(location.search)) window.__lire = { ETAPES: ETAPES, commencer: commencer, get etape(){ return etape; } };
})();
