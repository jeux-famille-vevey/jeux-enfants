/* Choix de la meilleure voix disponible sur l'appareil.
   Les voix « naturelles » (Google, Microsoft Online, Apple Siri/Amélie, Piper…) passent avant les voix robotiques (eSpeak). */
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
})();
