/* Moteur commun des jeux éducatifs.
   Un jeu = Moteur.inscrire({ id, titre, emoji, intro, niveaux:[...] })
   Un niveau = { id, nom, desc, n, cles(): [clé…] ou cleAuHasard(), question(clé) → Q }
   Q = { cle, enonce (html), visuel (html, facultatif), choix:[…] | saisie:'texte'|'nombre',
         reponses:[bonne réponse, autres acceptées…], explication (html), parler (texte lu, facultatif),
         monter(el, repondre) (facultatif : interaction personnalisée, ex. clic sur une carte) } */
(function(){
  "use strict";
  var JEUX = {}, ORDRE = [];
  var M = window.Moteur = {};
  M.hasard = Math.random;
  M.inscrire = function(j){ JEUX[j.id] = j; ORDRE.push(j.id); };
  M.jeux = function(){ return ORDRE.map(function(id){ return JEUX[id]; }); };

  /* ---------- outils ---------- */
  M.entier = function(a, b){ return a + Math.floor(M.hasard()*(b-a+1)); };
  M.choisir = function(t){ return t[Math.floor(M.hasard()*t.length)]; };
  M.melanger = function(t){ t = t.slice(); for(var i=t.length-1;i>0;i--){ var j=Math.floor(M.hasard()*(i+1)), x=t[i]; t[i]=t[j]; t[j]=x; } return t; };
  M.echapper = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  M.choixAvec = function(bonne, autres, nb){ // bonne réponse + distracteurs uniques, mélangés
    var out = [bonne]; M.melanger(autres).forEach(function(a){ if(out.length < (nb||4) && out.indexOf(a) < 0) out.push(a); });
    return M.melanger(out);
  };
  function lire(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function ecrire(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  M.lire = lire; M.ecrire = ecrire;
  M.etoiles = function(jeu, niv){ return parseInt(lire("mot-"+jeu+"-"+niv+"-etoiles")||"0",10); };
  M.etoilesJeu = function(jeu){ var j = JEUX[jeu], s = 0; if(!j) return 0; j.niveaux.forEach(function(n){ s += M.etoiles(jeu, n.id); }); return s; };
  function rates(jeu, niv){ try{ return JSON.parse(lire("mot-"+jeu+"-"+niv+"-rates")||"[]"); }catch(e){ return []; } }
  function majRates(jeu, niv, cle, rate){
    var r = rates(jeu, niv).filter(function(c){ return c !== cle; });
    if(rate) r.unshift(cle);
    ecrire("mot-"+jeu+"-"+niv+"-rates", JSON.stringify(r.slice(0, 40)));
  }
  function normal(s){ return String(s).trim().replace(/\s+/g," ").replace(/[’`´]/g,"'").toLowerCase(); }
  function nombre(s){ var x = parseFloat(String(s).replace(/\s/g,"").replace(",", ".").replace(/^fr\.?/i,"")); return isNaN(x) ? null : Math.round(x*100)/100; }

  /* ---------- son ---------- */
  var actx = null, muet = lire("fdl-mute")==="1";
  function audio(){ if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(actx && actx.state==="suspended") actx.resume(); }
  function ton(f, d, type, v, glisse){
    if(muet || !actx) return;
    var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = type||"sine"; o.frequency.setValueAtTime(f, t); if(glisse) o.frequency.exponentialRampToValueAtTime(glisse, t+d);
    g.gain.setValueAtTime(v||.14, t); g.gain.exponentialRampToValueAtTime(.001, t+d);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+d);
  }
  M.sonBon = function(){ ton(660,.1,"triangle",.12); setTimeout(function(){ ton(990,.16,"triangle",.12); }, 90); };
  M.sonFaux = function(){ ton(220,.22,"sine",.1,150); };
  M.sonFin = function(){ [523,659,784,1046].forEach(function(f,i){ setTimeout(function(){ ton(f,.22,"triangle",.13); }, i*120); }); };

  /* ---------- voix (synthèse vocale du navigateur) ---------- */
  var voix = null, voixLangue = {};
  function trouverVoix(lang){
    if(!("speechSynthesis" in window)) return null;
    return (window.voixTriees ? window.voixTriees(lang || "fr") : speechSynthesis.getVoices().filter(function(x){ return x.lang && x.lang.toLowerCase().indexOf(lang || "fr") === 0; }))[0] || null;
  }
  M.voixPour = function(lang){ if(!voixLangue[lang]) voixLangue[lang] = trouverVoix(lang); return voixLangue[lang]; };
  M.voixPrete = function(lang){
    return new Promise(function(ok){
      voix = trouverVoix(lang); if(voix || !("speechSynthesis" in window)) return ok(!!voix);
      var fini = false;
      speechSynthesis.onvoiceschanged = function(){ if(fini) return; voix = trouverVoix(lang); voixLangue = {}; if(voix){ fini = true; ok(true); } };
      setTimeout(function(){ if(!fini){ fini = true; voix = trouverVoix(lang); ok(!!voix); } }, 1800);
    });
  };
  // vitesse de la voix (réglable) : 0 = normale, 1 = lente, 2 = très lente
  var VITESSES = [.9, .72, .55];
  M.vitesse = function(v){ if(v != null) ecrire("mot-voix-vitesse", String(v)); var x = parseInt(lire("mot-voix-vitesse") || "1", 10); return x >= 0 && x <= 2 ? x : 1; };
  M.nomVitesse = function(){ return ["normale","lente","très lente"][M.vitesse()]; };
  // texte = une phrase ou une liste de morceaux, dits l'un après l'autre avec une pause entre chacun
  var tour = 0;
  M.parler = function(texte, tresLent, lang){
    if(!("speechSynthesis" in window)) return;
    var vx = M.voixPour(lang || "fr");
    if(!vx && lang && lang !== "fr") return; // pas de voix dans cette langue : on se tait plutôt que de mal prononcer
    if(speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    var morceaux = [].concat(texte), id = ++tour, rate = tresLent ? .5 : VITESSES[M.vitesse()];
    var pause = 700 + (1 - rate) * 1200;
    (function dire(i){
      if(id !== tour || i >= morceaux.length) return;
      var u = new SpeechSynthesisUtterance(morceaux[i]); u.lang = vx ? vx.lang : "fr-FR"; if(vx) u.voice = vx; u.rate = rate;
      M._garde = (M._garde || []).concat([u]).slice(-20); // garder une référence pour ne pas perdre la fin de phrase
      var suite = false, go = function(){ if(suite) return; suite = true; setTimeout(function(){ dire(i+1); }, pause); };
      u.onend = go; u.onerror = go;
      // On attend que la voix ait vraiment fini (les ordinateurs lents mettent du temps à préparer la phrase),
      // au lieu d'un temps fixe qui faisait commencer la phrase suivante trop tôt.
      var t0 = Date.now();
      (function veille(){ if(suite || id !== tour) return; var occupe = speechSynthesis.speaking || speechSynthesis.pending;
        if((!occupe && Date.now() - t0 > 1200) || Date.now() - t0 > 60000) return go(); setTimeout(veille, 300); })();
      speechSynthesis.speak(u);
    })(0);
  };

  /* ---------- interface ---------- */
  var $ = function(id){ return document.getElementById(id); };
  function gabarit(titre){
    document.body.innerHTML =
      '<div class="app">' +
      ' <div class="bar"><a class="icon-btn" href="../" aria-label="Tous les jeux">🏠</a><div class="chip" id="mTitre"></div><div class="spacer"></div>' +
      '  <div class="chip" aria-label="Question">❓ <b id="mCompte">0</b></div><div class="chip" aria-label="Série de bonnes réponses">🔥 <b id="mSerie">0</b></div>' +
      '  <button class="icon-btn" id="mSon"></button><button class="icon-btn" id="mMenu" aria-label="Choisir un niveau">☰</button></div>' +
      ' <div class="progress"><i id="mProg"></i></div>' +
      ' <div class="card" id="mCarte"><div class="prompt" id="mEnonce"></div><div class="visual" id="mVisuel"></div><div id="mZone" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px"></div>' +
      '  <div class="feedback" id="mRetour"></div></div>' +
      '</div>' +
      '<div class="overlay" id="mDebut"><h1 id="mDTitre"></h1><p class="lead" id="mIntro"></p><div class="levels" id="mNiveaux"></div>' +
      ' <button class="btn" id="mGo">Commencer</button><p class="hint-line">Astuce : tu peux répondre avec les touches 1, 2, 3, 4 et Entrée.</p></div>' +
      '<div class="overlay" id="mFin" hidden><div class="stars" id="mEtoiles"></div><h1 id="mFTitre"></h1>' +
      ' <div class="stats"><div class="stat"><b id="mScore"></b><span>du premier coup</span></div><div class="stat"><b id="mTemps"></b><span>temps</span></div><div class="stat"><b id="mMeilleure"></b><span>meilleure série</span></div></div>' +
      ' <div class="review" id="mRevoir" hidden><h3>À revoir</h3><ul id="mListe"></ul></div>' +
      ' <div class="btn-row"><button class="btn" id="mSuivant">Niveau suivant</button><button class="btn ghost" id="mEncore">Recommencer</button><button class="btn ghost" id="mChoisir">Choisir un niveau</button></div></div>' +
      '<div class="toast" id="mToast"></div>';
    document.title = titre;
    function syncSon(){ $("mSon").textContent = muet ? "🔇" : "🔊"; $("mSon").setAttribute("aria-label", muet ? "Remettre le son" : "Couper le son"); }
    syncSon();
    $("mSon").onclick = function(){ muet = !muet; ecrire("fdl-mute", muet?"1":"0"); syncSon(); this.blur(); };
  }
  function toast(t){ var e = $("mToast"); e.textContent = t; e.classList.add("show"); setTimeout(function(){ e.classList.remove("show"); }, 900); }

  /* ---------- partie ---------- */
  var P = null; // partie en cours

  function etoilesTxt(n){ var s = ""; for(var i=0;i<3;i++) s += i<n ? "⭐" : "☆"; return s; }

  function menu(jeu, niveauChoisi){
    $("mFin").hidden = true; $("mDebut").hidden = false;
    $("mDTitre").textContent = jeu.emoji + " " + jeu.titre;
    $("mIntro").textContent = jeu.intro;
    var box = $("mNiveaux"); box.innerHTML = "";
    var conseil = -1;
    jeu.niveaux.forEach(function(n,i){ if(conseil < 0 && M.etoiles(jeu.id, n.id) < 2) conseil = i; });
    var sel = niveauChoisi != null ? niveauChoisi : parseInt(lire("mot-"+jeu.id+"-niveau") || String(Math.max(0, conseil)), 10);
    if(!(sel >= 0 && sel < jeu.niveaux.length)) sel = 0;
    jeu.niveaux.forEach(function(n, i){
      var b = document.createElement("button"); b.className = "level"; b.setAttribute("aria-pressed", i===sel ? "true" : "false");
      b.innerHTML = '<div class="badge">'+(i+1)+'</div><div><strong></strong><span class="d"></span></div><span class="st">'+etoilesTxt(M.etoiles(jeu.id, n.id))+'</span>';
      b.querySelector("strong").textContent = n.nom;
      if(i === conseil){ var t = document.createElement("span"); t.className = "tag"; t.textContent = "conseillé"; b.querySelector("strong").appendChild(t); }
      b.querySelector(".d").textContent = n.desc;
      b.onclick = function(){ sel = i; ecrire("mot-"+jeu.id+"-niveau", String(i)); menu(jeu, i); };
      b.ondblclick = function(){ commencer(jeu, i); };
      box.appendChild(b);
    });
    $("mGo").onclick = function(){ commencer(jeu, sel); };
    $("mGo").focus();
    P = { etat:"menu", go:function(){ commencer(jeu, sel); } };
  }

  function preparerCles(jeu, niv){
    var n = niv.n || 10, vus = {}, cles = [];
    rates(jeu.id, niv.id).slice(0, Math.min(4, Math.floor(n/2))).forEach(function(c){ if(!vus[c]){ vus[c] = 1; cles.push(c); } });
    if(niv.cles){
      var tout = M.melanger(niv.cles());
      for(var i=0;i<tout.length && cles.length<n;i++) if(!vus[tout[i]]){ vus[tout[i]] = 1; cles.push(tout[i]); }
    } else {
      for(var essais=0; cles.length<n && essais<500; essais++){ var c = niv.cleAuHasard(); if(!vus[c]){ vus[c] = 1; cles.push(c); } }
    }
    return M.melanger(cles);
  }

  function commencer(jeu, idx, clesImposees, qMaker, onFin){
    audio();
    var niv = jeu.niveaux[idx];
    var file = clesImposees || preparerCles(jeu, niv);
    P = { jeu:jeu, idx:idx, niv:niv, file:file.map(function(c){ return {cle:c, essai:1}; }), total:file.length, fait:0, bons:0,
          serie:0, meilleure:0, rates:[], debut:Date.now(), etat:"question", q:null, defi:!!clesImposees, qMaker:qMaker, onFin:onFin };
    $("mTitre").textContent = jeu.emoji + " " + niv.nom;
    $("mDebut").hidden = true; $("mFin").hidden = true;
    suivante();
  }
  M.commencer = commencer;

  function suivante(){
    if(!P.file.length) return finir();
    var it = P.file.shift();
    P.it = it;
    var q = P.q = (P.qMaker || P.niv.question)(it.cle);
    q.cle = it.cle;
    P.etat = "question";
    $("mCompte").textContent = Math.min(P.fait+1, P.total) + "/" + P.total;
    $("mSerie").textContent = P.serie;
    $("mProg").style.width = (P.fait/P.total*100) + "%";
    var carte = $("mCarte"); carte.className = "card";
    $("mEnonce").innerHTML = (it.essai > 1 ? '<small>On réessaie celle-ci 💪</small>' : "") + q.enonce;
    $("mVisuel").innerHTML = q.visuel || "";
    $("mRetour").className = "feedback"; $("mRetour").innerHTML = "";
    var zone = $("mZone"); zone.innerHTML = "";
    if(q.parler){
      var sb = document.createElement("button"); sb.className = "say-btn"; sb.textContent = "🔊 Réécouter";
      sb.onclick = function(){ M.parler(q.parler, false, q.langue); }; zone.appendChild(sb);
      if(q.parlerLent){ var lb = document.createElement("button"); lb.className = "say-btn"; lb.style.background = "var(--mint)"; lb.textContent = "🐢 Très lentement";
        lb.onclick = function(){ M.parler(q.parlerLent, true, q.langue); }; zone.appendChild(lb); }
      if(!q.parlerSurClic) setTimeout(function(){ M.parler(q.parler, false, q.langue); }, 250);
    }
    if(q.monter){
      q.monter($("mVisuel"), repondre);
    } else if(q.choix){
      var g = document.createElement("div"); g.className = "choices";
      q.choix.forEach(function(c, i){
        var b = document.createElement("button"); b.className = "choice";
        b.innerHTML = '<span class="n">'+(i+1)+'</span>'; b.appendChild(document.createTextNode(c)); b.dataset.v = c;
        b.onclick = function(){ repondre(c, b); };
        g.appendChild(b);
      });
      zone.appendChild(g);
    } else {
      var r = document.createElement("form"); r.className = "answer-row";
      r.innerHTML = '<input id="mInput" autocomplete="off" autocapitalize="off" spellcheck="false" '+(q.saisie==="nombre" ? 'inputmode="decimal"' : "")+' aria-label="Ta réponse"><button class="btn small" type="submit">OK</button>';
      r.querySelector("input").placeholder = q.indice || "Ta réponse";
      r.onsubmit = function(e){ e.preventDefault(); var v = r.querySelector("input").value; if(v.trim() !== "") repondre(v); };
      zone.appendChild(r);
      setTimeout(function(){ var i = $("mInput"); if(i) i.focus(); }, 30);
    }
    if(q.apres) q.apres($("mVisuel"));
  }

  function juste(q, v){
    if(q.accepter) return q.accepter(v, normal);
    if(q.saisie === "nombre"){ var x = nombre(v); return q.reponses.some(function(r){ return nombre(r) === x; }); }
    return q.reponses.some(function(r){ return normal(r) === normal(v); });
  }

  function repondre(v, bouton){
    if(P.etat !== "question") return;
    var q = P.q, ok = juste(q, v);
    P.etat = "retour";
    document.querySelectorAll(".choice").forEach(function(b){
      b.disabled = true;
      if(juste(q, b.dataset.v)) b.classList.add("right");
    });
    if(bouton && !ok) bouton.classList.add("wrong");
    var inp = $("mInput"); if(inp) inp.disabled = true;
    var carte = $("mCarte"), retour = $("mRetour");
    if(q.direApres) setTimeout(function(){ M.parler(q.direApres, false, q.langue); }, 300);
    if(ok){
      carte.className = "card ok"; M.sonBon();
      if(P.it.essai === 1){ P.bons++; P.serie++; P.meilleure = Math.max(P.meilleure, P.serie); if(!P.defi) majRates(P.jeu.id, P.niv.id, q.cle, false); }
      P.fait++;
      $("mSerie").textContent = P.serie;
      if(P.serie > 0 && P.serie % 5 === 0) toast("🔥 " + P.serie + " d'affilée !");
      if(q.bravo){ retour.className = "feedback ok show"; retour.innerHTML = q.bravo; }
      setTimeout(suivante, q.bravo ? 1500 : 750);
    } else {
      carte.className = "card ko"; M.sonFaux(); carte.classList.add("bad-shake");
      P.serie = 0; $("mSerie").textContent = 0;
      if(P.it.essai === 1){ P.rates.push(q); if(!P.defi) majRates(P.jeu.id, P.niv.id, q.cle, true);
        // on la repose plus tard dans la partie
        var pos = Math.min(P.file.length, 2 + Math.floor(M.hasard()*3)); P.file.splice(pos, 0, {cle:q.cle, essai:2}); }
      else { P.fait++; }
      retour.className = "feedback ko show";
      retour.innerHTML = '<h3>Pas tout à fait…</h3><div>La bonne réponse : <span class="good"></span></div>' +
        ((q.expliquer || q.explication) ? '<p>'+(q.expliquer ? q.expliquer(v) : q.explication)+'</p>' : "") + '<div class="row"><button class="btn small" id="mCompris">J\'ai compris</button></div>';
      retour.querySelector(".good").textContent = q.reponses[0];
      $("mCompris").onclick = suivante_;
      setTimeout(function(){ var b = $("mCompris"); if(b) b.focus(); }, 50);
      if(q.apresFaux) q.apresFaux($("mVisuel"));
    }
  }
  function suivante_(){ if(P.etat === "retour"){ P.etat = "x"; suivante(); } }

  function finir(){
    P.etat = "fin";
    $("mProg").style.width = "100%";
    var pct = P.total ? P.bons / P.total : 0;
    var et = pct >= .9 ? 3 : pct >= .75 ? 2 : pct >= .5 ? 1 : 0;
    var s = ""; for(var i=0;i<3;i++) s += i<et ? "⭐" : '<span class="off">⭐</span>';
    $("mEtoiles").innerHTML = s;
    $("mFTitre").textContent = et === 3 ? "Excellent !" : et === 2 ? "Très bien !" : et === 1 ? "Bien joué !" : "Continue, tu vas y arriver !";
    $("mScore").textContent = P.bons + "/" + P.total;
    var sec = Math.round((Date.now()-P.debut)/1000);
    $("mTemps").textContent = Math.floor(sec/60) + ":" + String(sec%60).padStart(2,"0");
    $("mMeilleure").textContent = P.meilleure;
    var liste = $("mListe"); liste.innerHTML = "";
    P.rates.forEach(function(q){ var li = document.createElement("li"); li.innerHTML = (q.resume || q.enonce.replace(/<[^>]+>/g," ")) + " → <b></b>"; li.querySelector("b").textContent = q.reponses[0]; liste.appendChild(li); });
    $("mRevoir").hidden = !P.rates.length;
    if(P.defi){
      if(P.onFin) P.onFin(P, et);
    } else {
      var cle = "mot-"+P.jeu.id+"-"+P.niv.id+"-etoiles";
      if(et > M.etoiles(P.jeu.id, P.niv.id)) ecrire(cle, String(et));
      $("mSuivant").hidden = P.idx >= P.jeu.niveaux.length - 1 || et < 2;
      var jeu = P.jeu, idx = P.idx;
      $("mSuivant").onclick = function(){ ecrire("mot-"+jeu.id+"-niveau", String(idx+1)); commencer(jeu, idx+1); };
      $("mEncore").onclick = function(){ commencer(jeu, idx); };
      $("mChoisir").onclick = function(){ menu(jeu); };
    }
    $("mFin").hidden = false; M.sonFin();
    setTimeout(function(){ ($("mSuivant").hidden ? $("mEncore") : $("mSuivant")).focus(); }, 50);
  }

  document.addEventListener("keydown", function(e){
    if(!P || e.ctrlKey || e.metaKey || e.altKey) return;
    if(P.etat === "question" && P.q && P.q.choix && /^[1-9]$/.test(e.key) && document.activeElement.tagName !== "INPUT"){
      var b = document.querySelectorAll(".choice")[parseInt(e.key,10)-1]; if(b){ e.preventDefault(); b.click(); }
    } else if(P.etat === "retour" && e.key === "Enter"){ e.preventDefault(); suivante_(); }
    else if(P.etat === "menu" && e.key === "Enter" && document.activeElement === document.body){ e.preventDefault(); P.go(); }
  });

  /* ---------- lancement d'un jeu ---------- */
  M.lancer = function(id){
    var jeu = JEUX[id];
    gabarit(jeu.titre);
    if(jeu.preparer) jeu.preparer();
    $("mMenu").onclick = function(){ this.blur(); menu(jeu); };
    menu(jeu);
  };

  /* ---------- défi du jour : 10 questions de toutes les matières ---------- */
  function graine(s){ var h = 2166136261; for(var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return function(){ h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }; }
  function jour(d){ d = d || new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  M.defi = function(){
    gabarit("Défi du jour");
    var auj = jour(), hier = jour(new Date(Date.now()-864e5));
    var serieJours = parseInt(lire("mot-defi-serie")||"0",10), dernier = lire("mot-defi-dernier");
    if(dernier !== auj && dernier !== hier) serieJours = 0;
    var dejaFait = dernier === auj;
    // niveau de chaque jeu : le premier pas encore réussi avec 2 étoiles (on progresse avec elle)
    M.jeux().forEach(function(j){ if(j.preparer) j.preparer(); });
    var vraiHasard = M.hasard; M.hasard = graine(auj);
    var items = [];
    var jeux = M.jeux().filter(function(j){ return !j.horsDefi; });
    var ordre = M.melanger(jeux);
    for(var k=0;k<10;k++){
      var j = ordre[k % ordre.length], ni = 0;
      while(ni < j.niveaux.length-1 && M.etoiles(j.id, j.niveaux[ni].id) >= 2) ni++;
      var n = j.niveaux[ni], cle = n.cles ? M.choisir(n.cles()) : n.cleAuHasard();
      items.push({jeu:j, niv:n, cle:cle});
    }
    M.hasard = vraiHasard;
    var faux = { id:"defi", titre:"Défi du jour", emoji:"🏆", niveaux:[{ id:"jour", nom:"Défi du jour", n:10 }] };
    var parCle = {}; items.forEach(function(it, i){ parCle["d"+i] = it; });
    $("mMenu").onclick = function(){ location.href = "../"; };
    $("mDebut").hidden = false;
    $("mDTitre").textContent = "🏆 Défi du jour";
    $("mIntro").textContent = dejaFait ? "Tu as déjà fait le défi d'aujourd'hui. Tu peux le refaire pour t'entraîner, ou revenir demain pour un nouveau !"
      : "10 questions de toutes les matières : français, maths, langues, l'heure, les sous et la Suisse. Un nouveau défi chaque jour !";
    $("mNiveaux").innerHTML = '<div class="stat" style="justify-self:center"><b>🔥 ' + serieJours + '</b><span>jour' + (serieJours>1?"s":"") + ' de suite</span></div>';
    $("mGo").onclick = function(){
      var fab = function(c){ var it = parCle[c], q = it.niv.question(it.cle); q.enonce = '<small>'+it.jeu.emoji+' '+it.jeu.titre+'</small>' + q.enonce; return q; };
      commencer(faux, 0, Object.keys(parCle), fab, function(p, et){
        if(lire("mot-defi-dernier") !== auj){ ecrire("mot-defi-serie", String(serieJours+1)); ecrire("mot-defi-dernier", auj); }
        $("mSuivant").hidden = true;
        $("mEncore").textContent = "Refaire le défi"; $("mEncore").onclick = function(){ location.reload(); };
        $("mChoisir").textContent = "Retour aux jeux"; $("mChoisir").onclick = function(){ location.href = "../"; };
        $("mFTitre").textContent = "Défi réussi ! 🔥 " + (parseInt(lire("mot-defi-serie")||"1",10)) + " jour(s) de suite";
      });
    };
    P = { etat:"menu", go:function(){ $("mGo").click(); } };
  };
})();
