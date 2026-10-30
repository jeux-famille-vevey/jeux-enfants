/* Le coin coloriage : colorier des dessins tout prêts, fabriquer son propre dessin avec des images, tout garder. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var W = 1000, N = W * W;
  var AUTO = window.AUTOCOLLANTS, PAGES = window.COLORIAGES;
  function lire(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function ecrire(k, v){ try{ if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  /* ---------- les enfants (les mêmes joueurs que dans les autres jeux du site) ---------- */
  var BASE = [{ id: "aleyah", nom: "Aleyah", e: "⭐" }, { id: "mikael", nom: "Mikael", e: "⚽" }];
  function ajoutes(){ var l = []; try{ l = JSON.parse(lire("profils-ajoutes") || "[]") || []; }catch(e){} return Array.isArray(l) ? l : []; }
  (function(){ // on enlève les comptes en trop (demandé par Papa) : Amira et Youssouf ajoutés par erreur, et « pirate yusuf »
    var l = ajoutes(), garde = l.filter(function(p){ return p.id !== "amira" && p.id !== "youssouf" && !/^\s*pirate\s*yusuf\s*$/i.test(p.nom || ""); });
    if(garde.length !== l.length) ecrire("profils-ajoutes", JSON.stringify(garde));
  })();
  var gerer = false;
  function enfants(){ return BASE.concat(ajoutes(), [{ id: "invite", nom: "Invité", e: "🙂" }]); }
  var profil = null;
  function nomDe(id){ var p = enfants().filter(function(x){ return x.id === id; })[0]; return p ? p : { id: id, nom: "?", e: "🙂" }; }
  function majEnfants(){
    var box = $("enfants"); box.innerHTML = ""; var dernier = lire("coloriage-profil");
    tousDeTous().then(function(l){
      enfants().forEach(function(p){
        var n = l.filter(function(r){ return r.profil === p.id; }).length;
        var b = document.createElement("button"); b.className = "enfant" + (p.id === dernier ? " dernier" : "");
        b.innerHTML = '<span class="e"></span><b></b><small></small>';
        b.querySelector(".e").textContent = p.e || "🙂"; b.querySelector("b").textContent = p.nom;
        b.querySelector("small").textContent = n ? n + " dessin" + (n > 1 ? "s" : "") : "pas encore de dessin";
        var effacable = p.id !== "invite" && !BASE.some(function(x){ return x.id === p.id; });
        if(gerer && effacable){
          b.classList.add("gerer"); b.querySelector("small").textContent = "🗑️ Touche pour enlever" + (n ? " (avec ses " + n + " dessin" + (n > 1 ? "s" : "") + ")" : "");
          b.onclick = function(){
            if(!b.dataset.sur){ b.dataset.sur = "1"; b.querySelector("small").textContent = "❓ Sûr ? Touche encore"; setTimeout(function(){ if(b.dataset.sur) majEnfants(); }, 3000); return; }
            ecrire("profils-ajoutes", JSON.stringify(ajoutes().filter(function(x){ return x.id !== p.id; })));
            l.filter(function(r){ return r.profil === p.id; }).forEach(function(r){ enlever(r.id); });
            ecrire("coloriage-brouillon-" + p.id, null); if(lire("coloriage-profil") === p.id) ecrire("coloriage-profil", null);
            majEnfants();
          };
        } else if(gerer){ b.disabled = true; b.style.opacity = .45; }
        else b.onclick = function(){ choisirEnfant(p.id); };
        box.appendChild(b);
      });
    });
  }
  function choisirEnfant(id){
    profil = id; ecrire("coloriage-profil", id);
    var p = nomDe(id); $("moi").textContent = p.e + " " + p.nom;
    // les dessins faits avant qu'il y ait des prénoms vont au premier enfant choisi
    tousDeTous().then(function(l){ l.filter(function(r){ return !r.profil; }).forEach(function(r){ r.profil = id; garder(r); }); aller("eAccueil"); });
    bip(600, 900, .1);
  }
  $("gerer").onclick = function(){ gerer = !gerer; $("gerer").textContent = gerer ? "✅ J'ai fini" : "⚙️ Enlever un enfant"; majEnfants(); };
  $("formAjout").onsubmit = function(e){
    e.preventDefault(); var nom = $("nomAjout").value.trim().slice(0, 14); if(!nom) return;
    var l = ajoutes(), id = "p" + Date.now().toString(36); l.push({ id: id, nom: nom, e: "🙂", numero: 3 + l.length }); ecrire("profils-ajoutes", JSON.stringify(l));
    $("nomAjout").value = ""; majEnfants();
  };

  /* ---------- changer d'écran ---------- */
  var ecranActuel = "eQui";
  function aller(id){
    document.querySelectorAll(".ecran").forEach(function(e){ e.classList.toggle("actif", e.id === id); });
    ecranActuel = id; window.scrollTo(0, 0);
    if(id === "eAccueil") majAccueil();
    if(id === "eMes") majMesDessins();
    if(id === "eQui") majEnfants();
  }
  document.querySelectorAll("[data-aller]").forEach(function(b){
    b.addEventListener("click", function(){ var c = b.getAttribute("data-aller"); if(c === "eCreer") nouveauCreer(); aller(c); });
  });

  /* ---------- un petit son (on peut le couper) ---------- */
  var audio = null, sonOn = lire("coloriage-son") !== "0";
  $("son").textContent = sonOn ? "🔊" : "🔇";
  $("son").onclick = function(){ sonOn = !sonOn; ecrire("coloriage-son", sonOn ? "1" : "0"); $("son").textContent = sonOn ? "🔊" : "🔇"; };
  function bip(f1, f2, duree){
    if(!sonOn) return;
    try{
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      o.type = "sine"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + duree);
      g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + duree);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + duree + .02);
    }catch(e){}
  }

  /* ---------- confirmer en touchant deux fois (pas de fenêtre qui bloque) ---------- */
  function confirmer(btn, action){
    if(btn.dataset.sur){ delete btn.dataset.sur; btn.innerHTML = btn.dataset.html; action(); return; }
    btn.dataset.sur = "1"; btn.dataset.html = btn.innerHTML; btn.innerHTML = "<span>❓</span>Sûr ? Touche encore";
    setTimeout(function(){ if(btn.dataset.sur){ delete btn.dataset.sur; btn.innerHTML = btn.dataset.html; } }, 3000);
  }

  /* ---------- le dessin en SVG ---------- */
  var STYLE = "*{fill:#fff;stroke:#1a1a1a;stroke-width:5;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}.o{fill:none}.n{fill:#1a1a1a}.b{fill:#fff;stroke:none}.f{stroke-width:3}.hit{stroke:transparent;fill:none;stroke-width:30}";
  function dimensions(o){ if(o.s){ var A = AUTO[o.s]; return [A.w, A.h]; } return [o.w, o.h]; }
  function objetSVG(o, avecId){
    var d = dimensions(o), w = d[0], h = d[1], k = o.t / Math.max(w, h);
    var dedans = o.s ? AUTO[o.s].svg : '<path class="hit" d="' + o.d + '"/><path class="o" d="' + o.d + '"/>';
    return '<g' + (avecId ? ' data-id="' + o.id + '"' : "") + ' transform="translate(' + o.x.toFixed(1) + " " + o.y.toFixed(1) + ") rotate(" + (o.r || 0).toFixed(1) + ") scale(" + (o.m ? -k : k).toFixed(4) + " " + k.toFixed(4) + ')">' +
      '<g transform="translate(' + (-w / 2) + " " + (-h / 2) + ')">' + dedans + "</g></g>";
  }
  function versObjets(page){ return page.el.map(function(e){ return { s: e[0], x: e[1], y: e[2], t: e[3], r: e[4] || 0, m: !!e[5] }; }); }
  function contenuPage(page){ return page.svg || versObjets(page).map(function(o){ return objetSVG(o); }).join(""); }
  function svgComplet(contenu){ return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000"><style>' + STYLE + "</style>" + contenu + "</svg>"; }

  /* ---------- la mémoire : tous les dessins sont gardés (IndexedDB, sinon en mémoire) ---------- */
  var base = null, memoire = {};
  var pretBase = new Promise(function(ok){
    try{
      var r = indexedDB.open("coin-coloriage", 1);
      r.onupgradeneeded = function(){ r.result.createObjectStore("dessins", { keyPath: "id" }); };
      r.onsuccess = function(){ base = r.result; ok(); };
      r.onerror = function(){ ok(); };
    }catch(e){ ok(); }
  });
  function garder(rec){
    return pretBase.then(function(){
      if(!base){ memoire[rec.id] = rec; return; }
      return new Promise(function(ok){ var t = base.transaction("dessins", "readwrite"); t.objectStore("dessins").put(rec); t.oncomplete = ok; t.onerror = function(){ memoire[rec.id] = rec; ok(); }; });
    });
  }
  function tous(){ return tousDeTous().then(function(l){ return l.filter(function(r){ return !r.profil || r.profil === profil; }); }); }
  function tousDeTous(){
    return pretBase.then(function(){
      if(!base) return Object.values(memoire);
      return new Promise(function(ok){ var r = base.transaction("dessins").objectStore("dessins").getAll(); r.onsuccess = function(){ ok(r.result.concat(Object.values(memoire))); }; r.onerror = function(){ ok(Object.values(memoire)); }; });
    }).then(function(l){ return l.sort(function(a, b){ return b.date - a.date; }); });
  }
  function enlever(id){
    delete memoire[id];
    return pretBase.then(function(){ if(base) return new Promise(function(ok){ var t = base.transaction("dessins", "readwrite"); t.objectStore("dessins").delete(id); t.oncomplete = ok; t.onerror = ok; }); });
  }

  /* ---------- l'accueil ---------- */
  function majAccueil(){
    tous().then(function(l){
      $("nbMes").textContent = l.length ? "Tu as " + l.length + " dessin" + (l.length > 1 ? "s" : "") + ". Ils sont gardés tout seuls." : "Tous tes dessins sont gardés tout seuls.";
      var b = $("reprendre"); b.style.display = l.length ? "block" : "none";
      b.onclick = function(){ ouvrirGarde(l[0], "eAccueil"); };
    });
  }

  /* ---------- la galerie des coloriages ---------- */
  PAGES.forEach(function(p){
    var b = document.createElement("button"); b.className = "carte";
    b.innerHTML = '<svg class="dz mini" viewBox="0 0 1000 1000">' + contenuPage(p) + "</svg>" + '<span class="nom"></span>' + (p.age ? '<span class="age">Pour les grands</span>' : "");
    b.querySelector(".nom").textContent = p.nom;
    b.onclick = function(){ ouvrirPeindre({ nom: p.nom, source: { type: "pret", id: p.id }, svg: svgComplet(contenuPage(p)), retour: "eChoix" }); };
    $("galerie").appendChild(b);
  });

  /* ---------- mes dessins ---------- */
  function majMesDessins(){
    var box = $("mesDessins"), p = nomDe(profil); $("titreMes").textContent = "🖼️ Les dessins de " + p.nom;
    tous().then(function(l){
      box.innerHTML = "";
      if(!l.length){ box.innerHTML = '<p class="vide">Pas encore de dessin. Va colorier, et ton dessin apparaîtra ici tout seul ! 🖍️</p>'; return; }
      l.forEach(function(r){
        var c = document.createElement("div"); c.className = "carte"; c.style.cursor = "pointer";
        c.innerHTML = '<img alt=""><span class="nom"></span><button class="suppr" aria-label="Jeter ce dessin">🗑️</button>';
        c.querySelector("img").src = r.apercu || ""; c.querySelector(".nom").textContent = r.nom + " · " + new Date(r.date).toLocaleDateString("fr-CH");
        c.onclick = function(){ ouvrirGarde(r, "eMes"); };
        var s = c.querySelector(".suppr");
        s.onclick = function(e){
          e.stopPropagation();
          if(s.classList.contains("sur")){ enlever(r.id).then(majMesDessins); return; }
          s.classList.add("sur"); s.textContent = "Jeter ?";
          setTimeout(function(){ s.classList.remove("sur"); s.textContent = "🗑️"; }, 3000);
        };
        box.appendChild(c);
      });
    });
  }

  /* =====================================================================
     COLORIER
     ===================================================================== */
  var cC = $("cCouleur"), cT = $("cTraits");
  var xC = cC.getContext("2d", { willReadFrequently: true }), xT = cT.getContext("2d", { willReadFrequently: true });
  var barriere = new Uint8Array(N), vu = new Uint8Array(N);
  var dessin = null;            // { id, nom, source, date } du dessin en cours
  var pile = [];                // pour « Annuler »
  var outil = "seau", motif = "uni", taille = 24, couleur = "#FF6F9F";

  var PALETTE = ["#E5484D","#FF6F9F","#FFB3C6","#C2185B","#FF9F1C","#FFD23F","#FFF3A0","#8BC34A","#3FA34D","#1B5E20","#2EC4B6","#4CC9F0",
    "#A9DEFF","#3D7BD9","#1D2357","#8E5BC4","#C9A8FF","#7A4B2E","#B07A4A","#E8B98E","#F2C9A0","#8D5B3C","#9AA0AE","#22232B"];
  PALETTE.forEach(function(c, i){
    var b = document.createElement("button"); b.style.background = c; b.setAttribute("aria-label", "Couleur " + (i + 1));
    if(c === couleur) b.className = "on";
    b.onclick = function(){ choisirCouleur(c, b); };
    $("couleurs").appendChild(b);
  });
  var lab = document.createElement("label"); lab.title = "Une autre couleur"; lab.innerHTML = '<input type="color" value="#FF6F9F" aria-label="Une autre couleur">';
  lab.querySelector("input").addEventListener("input", function(e){ choisirCouleur(e.target.value, null); });
  $("couleurs").appendChild(lab);
  function choisirCouleur(c, b){
    couleur = c; document.querySelectorAll("#couleurs button").forEach(function(x){ x.classList.toggle("on", x === b); });
    if(outil === "gomme") choisirOutil("seau");
    bip(500, 700, .08);
  }
  function choisirOutil(o){
    outil = o; document.querySelectorAll("[data-outil]").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-outil") === o); });
    $("motifs").style.display = o === "seau" ? "" : "none"; $("tailles").style.display = o === "seau" ? "none" : "";
  }
  document.querySelectorAll("[data-outil]").forEach(function(b){ b.onclick = function(){ choisirOutil(b.getAttribute("data-outil")); }; });
  document.querySelectorAll("[data-motif]").forEach(function(b){ b.onclick = function(){ motif = b.getAttribute("data-motif"); document.querySelectorAll("[data-motif]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });
  document.querySelectorAll("[data-taille]").forEach(function(b){ b.onclick = function(){ taille = +b.getAttribute("data-taille"); document.querySelectorAll("[data-taille]").forEach(function(x){ x.classList.toggle("on", x === b); }); }; });

  /* « grossir » un masque de r pixels (pour boucher les petits trous des traits) */
  function grossir(src, r){
    var tmp = new Uint8Array(N), out = new Uint8Array(N), x, y, i;
    for(y = 0; y < W; y++){ i = y * W; var n = 0;
      for(x = -r; x < W; x++){ var aj = x + r; if(aj < W && src[i + aj]) n++; var en = x - r - 1; if(en >= 0 && src[i + en]) n--; if(x >= 0 && n > 0) tmp[i + x] = 1; } }
    for(x = 0; x < W; x++){ var m = 0;
      for(y = -r; y < W; y++){ var a = y + r; if(a < W && tmp[a * W + x]) m++; var e = y - r - 1; if(e >= 0 && tmp[e * W + x]) m--; if(y >= 0 && m > 0) out[y * W + x] = 1; } }
    return out;
  }
  function preparerMasques(){
    var d = xT.getImageData(0, 0, W, W).data, l = new Uint8Array(N);
    for(var i = 0; i < N; i++) l[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    barriere = grossir(l, 1);
  }
  /* les traits : on dessine le SVG sur du blanc, puis on garde seulement le noir (transparent ailleurs) */
  function traitsDepuisSVG(svg){
    return new Promise(function(ok, ko){
      var img = new Image();
      img.onload = function(){
        var off = document.createElement("canvas"); off.width = off.height = W; var o = off.getContext("2d");
        o.fillStyle = "#fff"; o.fillRect(0, 0, W, W); o.drawImage(img, 0, 0, W, W);
        var src = o.getImageData(0, 0, W, W), s = src.data, dst = xT.createImageData(W, W), d = dst.data;
        for(var i = 0; i < N; i++){ var L = (s[i * 4] + s[i * 4 + 1] + s[i * 4 + 2]) / 3, a = 255 - L; if(a < 24) a = 0; d[i * 4] = 26; d[i * 4 + 1] = 26; d[i * 4 + 2] = 26; d[i * 4 + 3] = a; }
        xT.clearRect(0, 0, W, W); xT.putImageData(dst, 0, 0); preparerMasques(); ok();
      };
      img.onerror = ko;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  function imageDepuisBlob(blob){
    return new Promise(function(ok, ko){ var u = URL.createObjectURL(blob), i = new Image(); i.onload = function(){ ok(i); setTimeout(function(){ URL.revokeObjectURL(u); }, 1000); }; i.onerror = ko; i.src = u; });
  }

  /* ouvrir un dessin à colorier (tout prêt ou fabriqué) */
  var retourVers = "eChoix";
  function ouvrirPeindre(o){
    retourVers = o.retour || "eChoix";
    var garderCouleurs = o.garderCouleurs && dessin;
    if(!garderCouleurs){ dessin = { id: null, nom: o.nom, source: o.source, profil: profil }; xC.fillStyle = "#fff"; xC.fillRect(0, 0, W, W); choisirOutil("seau"); document.querySelector('[data-motif="uni"]').click(); }
    else { dessin.source = o.source; }
    pile = []; majBoutons();
    $("titrePeindre").textContent = "🎨 " + o.nom;
    $("modifier").style.display = o.source.type === "creation" ? "" : "none";
    astuce($("astucePeindre"), "👉 Choisis une couleur et touche le dessin");
    xT.clearRect(0, 0, W, W);
    aller("ePeindre");
    traitsDepuisSVG(o.svg).then(function(){ if(garderCouleurs) sauverBientot(); });
  }
  function ouvrirGarde(r, retour){
    retourVers = retour; dessin = { id: r.id, nom: r.nom, source: r.source, date: r.date, profil: r.profil || profil };
    pile = []; majBoutons();
    $("titrePeindre").textContent = "🎨 " + r.nom; $("modifier").style.display = r.source && r.source.type === "creation" ? "" : "none";
    xC.fillStyle = "#fff"; xC.fillRect(0, 0, W, W); xT.clearRect(0, 0, W, W);
    aller("ePeindre");
    Promise.all([imageDepuisBlob(r.couleurs), imageDepuisBlob(r.traits)]).then(function(im){
      xC.drawImage(im[0], 0, 0, W, W); xT.drawImage(im[1], 0, 0, W, W); preparerMasques();
    }).catch(function(){ astuce($("astucePeindre"), "😕 Ce dessin n'a pas pu s'ouvrir"); });
  }
  $("retourPeindre").onclick = function(){ sauverMaintenant(); aller(retourVers); };

  /* annuler */
  function memoriser(){ pile.push(xC.getImageData(0, 0, W, W)); if(pile.length > 12) pile.shift(); majBoutons(); }
  function majBoutons(){ $("annulerP").disabled = !pile.length; }
  $("annulerP").onclick = function(){ if(!pile.length) return; xC.putImageData(pile.pop(), 0, 0); majBoutons(); sauverBientot(); bip(400, 250, .1); };
  $("viderP").onclick = function(){ confirmer($("viderP"), function(){ memoriser(); xC.fillStyle = "#fff"; xC.fillRect(0, 0, W, W); sauverBientot(); }); };

  /* les motifs du seau */
  function rgb(c){ var n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function clair(c){ return [Math.round(c[0] + (255 - c[0]) * .62), Math.round(c[1] + (255 - c[1]) * .62), Math.round(c[2] + (255 - c[2]) * .62)]; }
  function teinte(h){ // couleur de l'arc-en-ciel (h de 0 à 1)
    var r = Math.abs(h * 6 - 3) - 1, g = 2 - Math.abs(h * 6 - 2), b = 2 - Math.abs(h * 6 - 4);
    function c(v){ v = Math.max(0, Math.min(1, v)); return Math.round(255 * (.18 + v * .78)); }
    return [c(r), c(g), c(b)];
  }
  /* le seau : remplit la zone touchée jusqu'aux traits noirs */
  function remplir(px, py){
    var i = py * W + px;
    if(barriere[i]){ // on a touché un trait : on cherche la zone la plus proche
      var trouve = -1;
      for(var r = 1; r <= 10 && trouve < 0; r++) for(var dy = -r; dy <= r && trouve < 0; dy++) for(var dx = -r; dx <= r; dx++){
        var x = px + dx, y = py + dy; if(x < 0 || y < 0 || x >= W || y >= W) continue; if(!barriere[y * W + x]){ trouve = y * W + x; break; } }
      if(trouve < 0) return false; i = trouve; px = i % W; py = (i / W) | 0;
    }
    vu.fill(0);
    var pileXY = [px, py], nb = 0;
    while(pileXY.length){
      var yy = pileXY.pop(), xx = pileXY.pop(), j = yy * W + xx;
      while(xx >= 0 && !barriere[j] && !vu[j]){ xx--; j--; }
      xx++; j++; var haut = false, bas = false;
      while(xx < W && !barriere[j] && !vu[j]){
        vu[j] = 1; nb++;
        if(yy > 0){ var h = j - W; if(!barriere[h] && !vu[h]){ if(!haut){ pileXY.push(xx, yy - 1); haut = true; } } else haut = false; }
        if(yy < W - 1){ var b = j + W; if(!barriere[b] && !vu[b]){ if(!bas){ pileXY.push(xx, yy + 1); bas = true; } } else bas = false; }
        xx++; j++;
      }
    }
    if(!nb) return false;
    var zone = grossir(vu, 2);
    var img = xC.getImageData(0, 0, W, W), d = img.data, c1 = rgb(couleur), c2 = clair(c1), base0 = Math.random();
    for(var k = 0; k < N; k++){
      if(!zone[k]) continue;
      var x = k % W, y = (k / W) | 0, c = c1;
      if(motif === "pois"){ var u = x % 26 - 13, v = y % 26 - 13; if(u * u + v * v < 42) c = [255, 255, 255]; }
      else if(motif === "rayures"){ if((x + y) % 30 < 13) c = c2; }
      else if(motif === "carreaux"){ if(((x / 22 | 0) + (y / 22 | 0)) % 2) c = c2; }
      else if(motif === "arcenciel"){ c = teinte(((x + y) / 900 + base0) % 1); }
      d[k * 4] = c[0]; d[k * 4 + 1] = c[1]; d[k * 4 + 2] = c[2]; d[k * 4 + 3] = 255;
    }
    xC.putImageData(img, 0, 0);
    return true;
  }

  /* toucher la feuille */
  var feuilleP = $("feuillePeindre"), trace = null, teinteArc = 0;
  function posPage(e){ var r = feuilleP.getBoundingClientRect(); return [Math.max(0, Math.min(W - 1, Math.round((e.clientX - r.left) / r.width * W))), Math.max(0, Math.min(W - 1, Math.round((e.clientY - r.top) / r.height * W)))]; }
  function peindreSegment(a, b){
    var t = taille;
    if(outil === "paillettes"){
      var n = Math.max(3, Math.hypot(b[0] - a[0], b[1] - a[1]) / 3) | 0, c1 = rgb(couleur);
      for(var i = 0; i < n; i++){
        var f = Math.random(), x = a[0] + (b[0] - a[0]) * f + (Math.random() - .5) * t * 1.6, y = a[1] + (b[1] - a[1]) * f + (Math.random() - .5) * t * 1.6, r = 1.5 + Math.random() * t * .12;
        var m = Math.random(); xC.fillStyle = m < .15 ? "#FFFFFF" : m < .3 ? "#FFD23F" : "rgb(" + c1.map(function(v){ return Math.max(0, Math.min(255, v + (Math.random() - .5) * 90)) | 0; }).join(",") + ")";
        xC.beginPath(); xC.arc(x, y, r, 0, Math.PI * 2); xC.fill();
      }
      return;
    }
    xC.lineCap = xC.lineJoin = "round"; xC.lineWidth = t * (outil === "gomme" ? 1.4 : 1);
    if(outil === "arcenciel"){ teinteArc = (teinteArc + .012) % 1; var c = teinte(teinteArc); xC.strokeStyle = "rgb(" + c.join(",") + ")"; }
    else xC.strokeStyle = outil === "gomme" ? "#FFFFFF" : couleur;
    xC.beginPath(); xC.moveTo(a[0], a[1]); xC.lineTo(b[0] + .01, b[1]); xC.stroke();
  }
  feuilleP.addEventListener("pointerdown", function(e){
    if(trace || !dessin) return;
    e.preventDefault(); cacherAstuce($("astucePeindre"));
    var p = posPage(e);
    if(outil === "seau"){
      memoriser();
      if(remplir(p[0], p[1])){ bip(520, 980, .12); sauverBientot(); } else { pile.pop(); majBoutons(); }
      return;
    }
    memoriser(); trace = { id: e.pointerId, der: p }; feuilleP.setPointerCapture(e.pointerId); peindreSegment(p, p);
  });
  feuilleP.addEventListener("pointermove", function(e){
    if(!trace || e.pointerId !== trace.id) return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if(!evs.length) evs = [e];
    evs.forEach(function(ev){ var p = posPage(ev); peindreSegment(trace.der, p); trace.der = p; });
  });
  function finTrace(e){ if(trace && e.pointerId === trace.id){ trace = null; sauverBientot(); } }
  feuilleP.addEventListener("pointerup", finTrace); feuilleP.addEventListener("pointercancel", finTrace);

  /* garder le dessin tout seul (un peu après chaque changement) */
  var minuterie = null;
  function sauverBientot(){ clearTimeout(minuterie); minuterie = setTimeout(sauverMaintenant, 1200); }
  function versBlob(canvas, type, q){ return new Promise(function(ok){ canvas.toBlob(ok, type || "image/png", q); }); }
  function composer(avecCouleurs, cote){
    var c = document.createElement("canvas"); c.width = c.height = cote || W; var x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
    if(avecCouleurs) x.drawImage(cC, 0, 0, c.width, c.height);
    x.drawImage(cT, 0, 0, c.width, c.height); return c;
  }
  function sauverMaintenant(){
    if(!minuterie || !dessin) return; clearTimeout(minuterie); minuterie = null;
    if(!dessin.id){ dessin.id = "d" + Date.now(); }
    dessin.date = Date.now();
    var d = dessin, apercu = composer(true, 300).toDataURL("image/jpeg", .8);
    Promise.all([versBlob(cC), versBlob(cT)]).then(function(b){
      return garder({ id: d.id, profil: d.profil || profil, nom: d.nom, date: d.date, source: d.source, couleurs: b[0], traits: b[1], apercu: apercu });
    });
  }
  window.addEventListener("pagehide", sauverMaintenant);
  document.addEventListener("visibilitychange", function(){ if(document.hidden) sauverMaintenant(); });

  /* enregistrer l'image, imprimer */
  $("telecharger").onclick = function(){
    composer(true).toBlob(function(b){
      var a = document.createElement("a"), u = URL.createObjectURL(b);
      a.href = u; a.download = (dessin ? dessin.nom : "coloriage").replace(/[^\wÀ-ÿ' -]/g, "").trim().replace(/\s+/g, "-") + ".png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
    });
  };
  function imprimer(avecCouleurs){
    var img = $("impression"); img.onload = function(){ img.onload = null; setTimeout(function(){ window.print(); }, 50); };
    img.src = composer(avecCouleurs).toDataURL("image/png");
  }
  $("imprimerBlanc").onclick = function(){ imprimer(false); };
  $("imprimerCouleur").onclick = function(){ imprimer(true); };
  $("modifier").onclick = function(){
    if(!dessin || !dessin.source || dessin.source.type !== "creation") return;
    sauverMaintenant();
    ed.lien = true; ed.objs = clone(dessin.source.objets); ed.objs.forEach(function(o){ o.id = ++ed.n; }); ed.sel = null; ed.pile = [];
    rendre(); aller("eCreer");
  };

  /* les petits messages d'aide */
  function astuce(el, t){ el.textContent = t; el.style.opacity = 1; }
  function cacherAstuce(el){ el.style.opacity = 0; }

  /* =====================================================================
     CRÉER SON DESSIN
     ===================================================================== */
  var svg = $("svgCreer"), gObj = $("objets"), gSel = $("selection");
  var ed = { objs: [], sel: null, pile: [], crayon: false, lien: false, n: 0 };

  function nouveauCreer(){
    ed.lien = false; ed.sel = null; ed.pile = [];
    var b = null; try{ b = JSON.parse(lire("coloriage-brouillon-" + profil) || "null"); }catch(e){}
    ed.objs = Array.isArray(b) ? b : []; ed.objs.forEach(function(o){ o.id = ++ed.n; });
    rendre();
    astuce($("astuceCreer"), ed.objs.length ? "👉 Continue ton dessin !" : "👉 Touche ou glisse une image sur la feuille");
  }
  function brouillon(){ if(!ed.lien) ecrire("coloriage-brouillon-" + profil, JSON.stringify(ed.objs.map(function(o){ var c = clone(o); delete c.id; return c; }))); }
  function rendre(){ gObj.innerHTML = ed.objs.map(function(o){ return objetSVG(o, true); }).join(""); dessinerSel(); }
  function trouver(id){ for(var i = 0; i < ed.objs.length; i++) if(ed.objs[i].id === id) return ed.objs[i]; return null; }
  function majObjet(o){ var g = gObj.querySelector('[data-id="' + o.id + '"]'); if(g) g.outerHTML = objetSVG(o, true); dessinerSel(); }
  function dessinerSel(){
    var o = ed.sel && trouver(ed.sel);
    $("outilsSel").classList.toggle("voir", !!o);
    if(!o){ gSel.innerHTML = ""; return; }
    var d = dimensions(o), k = o.t / Math.max(d[0], d[1]), hw = d[0] * k / 2 + 10, hh = d[1] * k / 2 + 10;
    gSel.innerHTML = '<g transform="translate(' + o.x + " " + o.y + ") rotate(" + (o.r || 0) + ')">' +
      '<rect class="cadreSel" x="' + (-hw) + '" y="' + (-hh) + '" width="' + hw * 2 + '" height="' + hh * 2 + '" rx="12"/>' +
      '<line class="cadreSel" x1="0" y1="' + (-hh) + '" x2="0" y2="' + (-hh - 46) + '"/>' +
      '<circle class="poignee" data-poignee="tourne" cx="0" cy="' + (-hh - 62) + '" r="30"/><text class="icone" x="0" y="' + (-hh - 51) + '" text-anchor="middle">⟳</text>' +
      '<circle class="poignee" data-poignee="taille" cx="' + hw + '" cy="' + hh + '" r="30"/><text class="icone" x="' + hw + '" y="' + (hh + 11) + '" text-anchor="middle">⤡</text></g>';
  }
  function memoriserEd(){ ed.pile.push(JSON.stringify(ed.objs)); if(ed.pile.length > 40) ed.pile.shift(); }
  function point(e){ var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }

  /* ajouter une image */
  function ajouter(id, x, y){
    var A = AUTO[id], deco = A.cat === "decors", o = { id: ++ed.n, s: id, t: deco ? 1000 : 260, r: 0, m: false };
    if(x === undefined){
      if(deco){ o.x = 500; o.y = 1000 - A.h * (1000 / A.w) / 2; }
      else { o.x = 500 + (Math.random() - .5) * 240; o.y = 470 + (Math.random() - .5) * 240; }
    } else { o.x = x; o.y = y; }
    memoriserEd(); ed.objs.push(o); ed.sel = o.id; rendre(); brouillon(); cacherAstuce($("astuceCreer")); bip(700, 1000, .08);
    return o;
  }

  /* le bac des images, par catégories */
  var catActive = "animaux";
  window.CATEGORIES.forEach(function(c){
    var b = document.createElement("button"); b.textContent = c[1]; b.title = c[2]; b.setAttribute("aria-label", c[2]);
    if(c[0] === catActive) b.className = "on";
    b.onclick = function(){ catActive = c[0]; document.querySelectorAll("#onglets button").forEach(function(x){ x.classList.toggle("on", x === b); }); remplirBac(); };
    $("onglets").appendChild(b);
  });
  function remplirBac(){
    var bac = $("bac"); bac.innerHTML = "";
    Object.keys(AUTO).forEach(function(id){
      var A = AUTO[id]; if(A.cat !== catActive) return;
      var b = document.createElement("button"); b.title = A.nom; b.setAttribute("aria-label", A.nom);
      b.innerHTML = '<svg class="dz mini" viewBox="0 0 ' + A.w + " " + A.h + '">' + A.svg + "</svg>";
      var depart = null, cree = null;
      b.addEventListener("pointerdown", function(e){ depart = [e.clientX, e.clientY]; cree = null; try{ b.setPointerCapture(e.pointerId); }catch(x){} });
      b.addEventListener("pointermove", function(e){
        if(!depart) return;
        if(!cree && Math.hypot(e.clientX - depart[0], e.clientY - depart[1]) > 12){ var p = point(e); cree = ajouter(id, p.x, p.y); }
        else if(cree){ var q = point(e); cree.x = q.x; cree.y = q.y; majObjet(cree); }
      });
      b.addEventListener("pointerup", function(e){
        if(!depart) return; depart = null;
        if(!cree){ ajouter(id); return; }
        if(cree.x < 0 || cree.x > 1000 || cree.y < 0 || cree.y > 1000){ ed.objs = ed.objs.filter(function(o){ return o !== cree; }); ed.sel = null; ed.pile.pop(); rendre(); }
        brouillon(); cree = null;
      });
      b.addEventListener("pointercancel", function(){ depart = null; cree = null; });
      bac.appendChild(b);
    });
  }
  remplirBac();

  /* bouger, agrandir, tourner (et pincer à deux doigts sur tablette) */
  var doigts = {}, geste = null, crayonTrace = null;
  svg.addEventListener("pointerdown", function(e){
    e.preventDefault(); cacherAstuce($("astuceCreer"));
    var p = point(e); doigts[e.pointerId] = p; try{ svg.setPointerCapture(e.pointerId); }catch(x){}
    var ids = Object.keys(doigts), o = ed.sel && trouver(ed.sel);
    if(ids.length === 2 && o){ // deux doigts : pincer
      var a = doigts[ids[0]], b = doigts[ids[1]];
      geste = { mode: "pince", d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), t0: o.t, r0: o.r || 0, avant: JSON.stringify(ed.objs) };
      crayonTrace = null; return;
    }
    if(ids.length > 1) return;
    var poignee = e.target.getAttribute && e.target.getAttribute("data-poignee");
    if(poignee && o){
      geste = { mode: poignee, o: o, d0: Math.hypot(p.x - o.x, p.y - o.y) || 1, a0: Math.atan2(p.y - o.y, p.x - o.x), t0: o.t, r0: o.r || 0, avant: JSON.stringify(ed.objs) };
      return;
    }
    var g = e.target.closest && e.target.closest("[data-id]");
    if(g){
      var obj = trouver(+g.getAttribute("data-id")); ed.sel = obj.id; dessinerSel();
      geste = { mode: "bouge", o: obj, dx: obj.x - p.x, dy: obj.y - p.y, avant: JSON.stringify(ed.objs) };
      return;
    }
    ed.sel = null; dessinerSel();
    if(ed.crayon){ crayonTrace = { pts: [p] }; gSel.innerHTML = '<path class="o" id="traitEnCours" d="M' + p.x + " " + p.y + '"/>'; }
  });
  svg.addEventListener("pointermove", function(e){
    if(!doigts[e.pointerId]) return;
    var p = point(e); doigts[e.pointerId] = p;
    if(crayonTrace){ crayonTrace.pts.push(p); var t = $("traitEnCours"); if(t) t.setAttribute("d", lisse(crayonTrace.pts)); return; }
    if(!geste) return;
    var o = geste.o || trouver(ed.sel); if(!o) return;
    if(geste.mode === "bouge"){ o.x = p.x + geste.dx; o.y = p.y + geste.dy; }
    else if(geste.mode === "taille"){ o.t = Math.max(40, Math.min(1600, geste.t0 * Math.hypot(p.x - o.x, p.y - o.y) / geste.d0)); }
    else if(geste.mode === "tourne"){ o.r = geste.r0 + (Math.atan2(p.y - o.y, p.x - o.x) - geste.a0) * 180 / Math.PI; }
    else if(geste.mode === "pince"){
      var ids = Object.keys(doigts); if(ids.length < 2) return; var a = doigts[ids[0]], b = doigts[ids[1]];
      o.t = Math.max(40, Math.min(1600, geste.t0 * Math.hypot(b.x - a.x, b.y - a.y) / geste.d0));
      o.r = geste.r0 + (Math.atan2(b.y - a.y, b.x - a.x) - geste.a0) * 180 / Math.PI;
    }
    majObjet(o);
  });
  function finGeste(e){
    delete doigts[e.pointerId];
    if(crayonTrace){
      var pts = crayonTrace.pts; crayonTrace = null;
      if(pts.length > 2){
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        pts.forEach(function(q){ x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
        var w = Math.max(12, x1 - x0), h = Math.max(12, y1 - y0);
        var rel = pts.map(function(q){ return { x: q.x - x0 + (w - (x1 - x0)) / 2, y: q.y - y0 + (h - (y1 - y0)) / 2 }; });
        memoriserEd(); ed.objs.push({ id: ++ed.n, d: lisse(rel), w: w, h: h, x: x0 + (x1 - x0) / 2, y: y0 + (y1 - y0) / 2, t: Math.max(w, h), r: 0, m: false });
        rendre(); brouillon();
      } else dessinerSel();
      return;
    }
    if(geste && Object.keys(doigts).length === 0){ if(JSON.stringify(ed.objs) !== geste.avant){ ed.pile.push(geste.avant); brouillon(); } geste = null; }
  }
  svg.addEventListener("pointerup", finGeste); svg.addEventListener("pointercancel", finGeste);
  function lisse(pts){
    if(pts.length < 3) return "M" + pts.map(function(q){ return q.x.toFixed(1) + " " + q.y.toFixed(1); }).join(" L");
    var d = "M" + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for(var i = 1; i < pts.length - 1; i++){ var mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; d += " Q" + pts[i].x.toFixed(1) + " " + pts[i].y.toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1); }
    var z = pts[pts.length - 1]; return d + " L" + z.x.toFixed(1) + " " + z.y.toFixed(1);
  }

  /* les boutons de l'image choisie */
  document.querySelectorAll("[data-sel]").forEach(function(b){
    b.onclick = function(){
      var o = ed.sel && trouver(ed.sel); if(!o) return; var a = b.getAttribute("data-sel"); memoriserEd();
      var i = ed.objs.indexOf(o);
      if(a === "miroir") o.m = !o.m;
      else if(a === "copier"){ var c = clone(o); c.id = ++ed.n; c.x += 40; c.y += 40; ed.objs.push(c); ed.sel = c.id; }
      else if(a === "devant"){ ed.objs.splice(i, 1); ed.objs.push(o); }
      else if(a === "derriere"){ ed.objs.splice(i, 1); ed.objs.unshift(o); }
      else if(a === "plus") o.t = Math.min(1600, o.t * 1.2);
      else if(a === "moins") o.t = Math.max(40, o.t / 1.2);
      else if(a === "suppr"){ ed.objs.splice(i, 1); ed.sel = null; }
      rendre(); brouillon(); bip(600, 800, .06);
    };
  });
  $("crayon").onclick = function(){ ed.crayon = !ed.crayon; $("crayon").style.background = ed.crayon ? "#FFD23F" : ""; $("crayon").style.color = ed.crayon ? "#1D2357" : "";
    astuce($("astuceCreer"), ed.crayon ? "✏️ Dessine avec ton doigt sur la feuille" : "👉 Touche une image pour la bouger"); };
  $("annulerC").onclick = function(){ if(!ed.pile.length) return; ed.objs = JSON.parse(ed.pile.pop()); ed.sel = null; rendre(); brouillon(); };
  $("viderC").onclick = function(){ confirmer($("viderC"), function(){ memoriserEd(); ed.objs = []; ed.sel = null; rendre(); brouillon(); }); };
  $("versPeindre").onclick = function(){
    if(!ed.objs.length){ astuce($("astuceCreer"), "👉 Ajoute d'abord des images sur la feuille"); return; }
    var objets = ed.objs.map(function(o){ var c = clone(o); delete c.id; return c; });
    var garder = ed.lien; ed.sel = null; dessinerSel();
    if(!ed.lien) ecrire("coloriage-brouillon-" + profil, null);
    ouvrirPeindre({ nom: garder && dessin ? dessin.nom : "Mon dessin", source: { type: "creation", objets: objets }, svg: svgComplet(objets.map(function(o){ return objetSVG(o); }).join("")), retour: "eAccueil", garderCouleurs: garder });
  };

  /* ---------- copier les dessins d'un enfant sur un autre appareil (un fichier) ---------- */
  function enTexte(blob){ return new Promise(function(ok){ var f = new FileReader(); f.onload = function(){ ok(f.result); }; f.readAsDataURL(blob); }); }
  function enBlob(url){ return fetch(url).then(function(r){ return r.blob(); }); }
  function message(t){ var m = $("msgTransfert"); m.textContent = t; m.style.display = t ? "block" : "none"; }
  $("exporter").onclick = function(){
    var p = nomDe(profil);
    tous().then(function(l){
      if(!l.length){ message("Il n'y a pas encore de dessin à copier."); return; }
      return Promise.all(l.map(function(r){ return Promise.all([enTexte(r.couleurs), enTexte(r.traits)]).then(function(t){ return { id: r.id, nom: r.nom, date: r.date, source: r.source, apercu: r.apercu, couleurs: t[0], traits: t[1] }; }); }))
        .then(function(liste){
          var b = new Blob([JSON.stringify({ type: "coin-coloriage", version: 1, enfant: p.nom, dessins: liste })], { type: "application/json" });
          var a = document.createElement("a"), u = URL.createObjectURL(b); a.href = u; a.download = "dessins-" + p.nom.replace(/[^\wÀ-ÿ-]/g, "") + ".json"; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
          message("📤 Le fichier « dessins-" + p.nom + ".json » est prêt. Ouvre ce coin coloriage sur l'autre appareil, choisis " + p.nom + ", puis « Récupérer des dessins ».");
        });
    });
  };
  $("importer").onchange = function(e){
    var f = e.target.files && e.target.files[0]; if(!f) return; e.target.value = "";
    f.text().then(function(t){
      var d = JSON.parse(t); if(!d || d.type !== "coin-coloriage" || !Array.isArray(d.dessins)) throw new Error("format");
      return Promise.all(d.dessins.map(function(r){ return Promise.all([enBlob(r.couleurs), enBlob(r.traits)]).then(function(b){
        return garder({ id: r.id, profil: profil, nom: r.nom, date: r.date, source: r.source, apercu: r.apercu, couleurs: b[0], traits: b[1] }); }); }))
        .then(function(){ message("📥 " + d.dessins.length + " dessin" + (d.dessins.length > 1 ? "s" : "") + " récupéré" + (d.dessins.length > 1 ? "s" : "") + " !"); majMesDessins(); });
    }).catch(function(){ message("😕 Ce fichier n'est pas un fichier de dessins du coin coloriage."); });
  };

  majEnfants();
  window.__coloriage = { remplir: function(x, y){ return remplir(x, y); }, xC: xC, ed: ed, ajouter: ajouter, dessin: function(){ return dessin; }, tous: tous };
})();
