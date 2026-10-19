/* Voix des jeux.
   1. Choisit la meilleure voix du navigateur (Google, Microsoft, Apple… avant les voix robotiques eSpeak).
   2. Voix naturelle Piper (« siwis », voix française enregistrée en Suisse) calculée dans le navigateur :
      téléchargée une seule fois (~90 Mo), puis gardée sur l'appareil. Tant qu'elle n'est pas prête,
      ou si l'appareil ne la supporte pas, les jeux utilisent la voix du navigateur comme avant.
   Les jeux n'ont rien à changer : on intercepte speechSynthesis.speak pour le français. */
(function(){
  var BONNES = /natural|neural|online|google|premium|enhanced|siri|piper|wavenet/i;
  var CORRECTES = /am[ée]lie|thomas|audrey|aur[ée]lie|marie|daniel|denise|henri|vivienne|ariane|fabrice|microsoft|samsung/i;
  var ROBOTS = /espeak|mbrola|festival|pico/i;
  window.noteVoix = function(v, lang){
    lang = (lang || "fr").toLowerCase();
    var n = (v.name || "") + " " + (v.voiceURI || ""), l = (v.lang || "").toLowerCase().replace("_", "-");
    var s = 0;
    if(BONNES.test(n)) s += 20; else if(CORRECTES.test(n)) s += 10;
    if(ROBOTS.test(n)) s -= 20;
    if(v.localService === false) s += 2;
    var pref = { fr:["fr-ch","fr-fr"], en:["en-gb","en-us"], de:["de-ch","de-de"] }[lang] || [];
    var i = pref.indexOf(l); if(i >= 0) s += (pref.length - i) * 3;
    return s;
  };
  window.voixTriees = function(lang){
    if(!("speechSynthesis" in window)) return [];
    lang = (lang || "fr").toLowerCase();
    return speechSynthesis.getVoices()
      .filter(function(v){ return v.lang && v.lang.toLowerCase().indexOf(lang) === 0; })
      .sort(function(a, b){ return window.noteVoix(b, lang) - window.noteVoix(a, lang); });
  };

  /* ---------- Voix naturelle (Piper) ---------- */
  if(!("speechSynthesis" in window)) return;
  var VOIX_ID = "fr_FR-siwis-medium";
  var src = (document.currentScript && document.currentScript.src) || location.href;
  var BASE = new URL("piper/", src).href;
  var etat = "attente", session = null, cache = new Map(), file = [], enCours = null, audio = null, jeton = 0;
  var ok = typeof WebAssembly === "object" && !!(navigator.storage && navigator.storage.getDirectory) && typeof Blob !== "undefined";
  try{ if(localStorage.getItem("voix-naturelle") === "non") ok = false; }catch(e){}

  var badge = null;
  function montrer(t){
    if(!document.body) return;
    if(!badge){
      badge = document.createElement("div");
      badge.setAttribute("role", "status");
      badge.style.cssText = "position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:99;" +
        "background:#1D2357;color:#FFF8E7;font:600 14px/1.3 system-ui,sans-serif;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:80vw";
      document.body.appendChild(badge);
    }
    badge.textContent = t; badge.hidden = !t;
  }

  var promesse = null, pct = 0, erreur = "", abonnes = [];
  function signaler(){ abonnes.forEach(function(f){ try{ f(etat, pct, erreur); }catch(e){} }); }
  function charger(){
    if(promesse) return promesse;
    if(!ok){ etat = "erreur"; erreur = "Cet appareil ou ce navigateur ne permet pas la voix naturelle."; signaler(); return Promise.reject(new Error(erreur)); }
    etat = "chargement"; signaler();
    montrer("🔊 Préparation de la voix…");
    promesse = import(BASE + "piper.js").then(function(P){
      return P.TtsSession.create({
        voiceId: VOIX_ID,
        wasmPaths: { onnxWasm: BASE, piperData: BASE + "piper_phonemize.data", piperWasm: BASE + "piper_phonemize.wasm" },
        progress: function(p){
          if(p && p.total && /\.onnx$/.test(p.url || "")){ pct = Math.round(p.loaded / p.total * 100); montrer("🔊 Téléchargement de la voix : " + pct + " % (ne ferme pas la page)"); signaler(); }
        }
      });
    }).then(function(s){
      // petit essai pour être sûr que tout fonctionne
      return s.predict("Bonjour.").then(function(){ return s; });
    }).then(function(s){
      session = s; etat = "pret"; pct = 100; montrer("🔊 Voix naturelle prête"); signaler();
      setTimeout(function(){ montrer(""); }, 2500);
      return s;
    }).catch(function(e){
      etat = "erreur"; erreur = String(e && e.message || e); montrer(""); signaler();
      if(window.console) console.warn("Voix naturelle indisponible, voix du navigateur utilisée.", e);
      throw e;
    });
    return promesse;
  }

  function wav(texte){
    var t = texte.trim();
    if(cache.has(t)) return Promise.resolve(cache.get(t));
    return session.predict(t).then(function(b){
      var url = URL.createObjectURL(b);
      cache.set(t, url);
      if(cache.size > 300){ var k = cache.keys().next().value; URL.revokeObjectURL(cache.get(k)); cache.delete(k); }
      return url;
    });
  }

  function evt(u, nom, extra){
    var e = { type: nom, utterance: u, charIndex: 0, name: "word", elapsedTime: 0 };
    for(var k in extra) e[k] = extra[k];
    try{ if(typeof u["on" + nom] === "function") u["on" + nom](e); }catch(x){ if(window.console) console.error(x); }
  }

  function suivant(){
    if(enCours || !file.length) return;
    var u = file.shift(), id = ++jeton; enCours = u;
    wav(u.text).then(function(url){
      if(id !== jeton) return;
      audio = new Audio(url);
      var r = Math.max(.5, Math.min(2, u.rate || 1));
      audio.playbackRate = r; try{ audio.preservesPitch = true; audio.mozPreservesPitch = true; }catch(e){}
      // mots surlignés (histoires) : on répartit les mots sur la durée du son
      var minuteurs = [];
      audio.onloadedmetadata = function(){
        if(typeof u.onboundary !== "function" || !isFinite(audio.duration)) return;
        var d = audio.duration / r * 1000, re = /\S+/g, m, n = u.text.length || 1;
        while((m = re.exec(u.text))){ (function(ci){ minuteurs.push(setTimeout(function(){ if(id === jeton) evt(u, "boundary", { charIndex: ci }); }, ci / n * d * .95)); })(m.index); }
      };
      var fini = false, fin = function(nom){ if(fini) return; fini = true; minuteurs.forEach(clearTimeout); if(id === jeton){ enCours = null; audio = null; evt(u, nom); suivant(); } };
      audio.onended = function(){ fin("end"); };
      audio.onerror = function(){ fin("error"); };
      evt(u, "start");
      var p = audio.play(); if(p && p.catch) p.catch(function(){ fin("error"); });
    }).catch(function(){
      if(id !== jeton) return;
      enCours = null; origSpeak(u); suivant();
    });
  }

  var origSpeak = speechSynthesis.speak.bind(speechSynthesis);
  var origCancel = speechSynthesis.cancel.bind(speechSynthesis);
  function estFrancais(u){ var l = (u.lang || (u.voice && u.voice.lang) || "fr").toLowerCase(); return l.indexOf("fr") === 0; }
  try{
    speechSynthesis.speak = function(u){
      if(ok && estFrancais(u)){
        if(etat === "attente") charger().catch(function(){});
        if(etat === "pret"){ file.push(u); suivant(); return; }
      }
      origSpeak(u);
    };
    speechSynthesis.cancel = function(){
      jeton++; file = []; enCours = null;
      if(audio){ try{ audio.pause(); }catch(e){} audio = null; }
      origCancel();
    };
  }catch(e){ ok = false; }

  // On prépare la voix dès l'ouverture de la page : la première fois elle se télécharge (une seule fois par appareil).
  if(ok){ if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ charger().catch(function(){}); }); else charger().catch(function(){}); }

  window.voixNaturelle = {
    etat: function(){ return etat; },
    pourcent: function(){ return pct; },
    erreur: function(){ return erreur; },
    preparer: charger,
    suivre: function(f){ abonnes.push(f); f(etat, pct, erreur); },
    navigateur: function(){ return ok; },
    desactiver: function(){ try{ localStorage.setItem("voix-naturelle", "non"); }catch(e){} },
    activer: function(){ try{ localStorage.removeItem("voix-naturelle"); }catch(e){} }
  };
})();
