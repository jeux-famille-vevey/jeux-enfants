/* Lire l'heure — horloge à aiguilles, quarts, après-midi, durées */
(function(){
  var M = Moteur;
  var NOMS = ["minuit","une","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","midi"];
  function p2(n){ return (n < 10 ? "0" : "") + n; }
  function fmt(h, m){ return h + " h" + (m ? " " + p2(m) : ""); }
  function duree(min){ var h = Math.floor(min/60), m = min%60; return h ? h + " h" + (m ? " " + p2(m) : "") : m + " min"; }
  function horloge(h, m){
    var s = '<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Horloge">';
    s += '<circle cx="110" cy="110" r="104" fill="#FFF8E7" stroke="#FFD23F" stroke-width="8"/>';
    for(var i=0;i<60;i++){ var a = i*6*Math.PI/180, r1 = i%5 ? 92 : 86;
      s += '<line x1="'+(110+Math.sin(a)*r1).toFixed(1)+'" y1="'+(110-Math.cos(a)*r1).toFixed(1)+'" x2="'+(110+Math.sin(a)*98).toFixed(1)+'" y2="'+(110-Math.cos(a)*98).toFixed(1)+'" stroke="#1D2357" stroke-width="'+(i%5?1.5:3.5)+'"/>'; }
    for(var n=1;n<=12;n++){ var b = n*30*Math.PI/180; s += '<text x="'+(110+Math.sin(b)*70).toFixed(1)+'" y="'+(110-Math.cos(b)*70+8).toFixed(1)+'" text-anchor="middle" font-size="22" font-weight="700" fill="#1D2357" font-family="Fredoka, sans-serif">'+n+'</text>'; }
    var ah = ((h%12) + m/60) * 30 * Math.PI/180, am = m * 6 * Math.PI/180;
    s += '<line x1="110" y1="110" x2="'+(110+Math.sin(ah)*48).toFixed(1)+'" y2="'+(110-Math.cos(ah)*48).toFixed(1)+'" stroke="#FF9F1C" stroke-width="9" stroke-linecap="round"/>';
    s += '<line x1="110" y1="110" x2="'+(110+Math.sin(am)*80).toFixed(1)+'" y2="'+(110-Math.cos(am)*80).toFixed(1)+'" stroke="#2EC4B6" stroke-width="6" stroke-linecap="round"/>';
    s += '<circle cx="110" cy="110" r="7" fill="#1D2357"/></svg>';
    return s;
  }
  var LEGENDE = '<p class="hint-line"><span style="color:#FF9F1C">●</span> petite aiguille = les heures · <span style="color:#2EC4B6">●</span> grande aiguille = les minutes</p>';
  function expliquerLecture(h, m){
    var hh = h%12 === 0 ? 12 : h%12;
    return "La petite aiguille orange montre les heures : elle est " + (m === 0 ? "sur le " + hh : "après le " + hh + (m >= 30 ? " (elle avance déjà vers le " + (hh%12+1) + ")" : "")) + ", donc <b>" + hh + " h</b>.<br>" +
      "La grande aiguille verte montre les minutes : elle est sur le " + (m === 0 ? "12" : m/5) + ", et " + (m === 0 ? "sur le 12, c'est 0 minute" : m/5 + " × 5 = <b>" + m + " minutes</b>") + ".";
  }
  function mots(h, m){
    var heure = function(x){ return x === 12 ? "midi" : NOMS[x] + (x === 1 ? " heure" : " heures"); };
    if(m === 0) return heure(h);
    if(m === 15) return heure(h) + " et quart";
    if(m === 30) return heure(h) + " et demie";
    return heure(h+1) + " moins le quart";
  }
  function lecture(cle){ // h:m
    var p = cle.split(":").map(Number), h = p[0], m = p[1], bon = fmt(h, m);
    var faux = [fmt(h%12+1, m), fmt(h === 1 ? 12 : h-1, m)];
    if(m) faux.push(fmt(m/5 === 0 ? 12 : m/5, (h%12)*5)); // aiguilles inversées
    faux.push(fmt(h, (m+30)%60), fmt(h, (m+5)%60), fmt(h, (60-m)%60));
    return { enonce:"<small>Quelle heure est-il ?</small>", visuel:horloge(h, m) + LEGENDE, choix:M.choixAvec(bon, faux, 4), reponses:[bon], explication:expliquerLecture(h, m), resume:"L'horloge" };
  }
  function quarts(cle){
    var p = cle.split(":").map(Number), h = p[0], m = p[1], bon = mots(h, m);
    var faux = [0,15,30,45].filter(function(x){ return x !== m; }).map(function(x){ return mots(h, x); });
    if(m === 45) faux.push(mots(h-1, 45));
    if(m === 15) faux.push(mots(h, 45));
    var ex = expliquerLecture(h, m) + "<br>";
    ex += m === 15 ? "15 minutes, c'est un quart d'heure : on dit <b>et quart</b>." : m === 30 ? "30 minutes, c'est une demi-heure : on dit <b>et demie</b>." : m === 45 ? "À 45 minutes, il manque un quart d'heure pour arriver à " + (h+1) + " h : on dit <b>" + mots(h,45) + "</b>." : "La grande aiguille est sur le 12 : c'est l'heure pile.";
    return { enonce:"<small>Comment dit-on cette heure ?</small>", visuel:horloge(h, m) + LEGENDE, choix:M.choixAvec(bon, faux, 4), reponses:[bon], explication:ex, resume:"L'horloge" };
  }
  function apresMidi(cle){
    var p = cle.split(":").map(Number), h = p[0], m = p[1], H = h + 12, bon = fmt(H, m);
    var faux = [fmt(h, m), fmt(H+1, m), fmt(H-1, m), fmt(h+10, m), fmt(H, (m+30)%60)];
    return { enonce:"<small>C'est l'après-midi. Quelle heure est-il ?</small>", visuel:horloge(h, m), choix:M.choixAvec(bon, faux, 4), reponses:[bon],
      explication:"L'horloge montre " + fmt(h, m) + ". L'après-midi, on ajoute 12 aux heures : " + h + " + 12 = <b>" + H + "</b>, donc " + bon + ".", resume:"L'horloge (après-midi)" };
  }
  function durees(cle){
    var p = cle.split("|"), type = p[0], d = Number(p[1]), h = Number(p[2]), m = Number(p[3]);
    var debut = h*60 + m, fin = debut + d, fh = Math.floor(fin/60), fm = fin%60;
    if(type === "fin"){
      var bon = fmt(fh, fm);
      var faux = [fmt(fh, (fm+30)%60), fmt(fh+1, fm), fmt(fh-1 < 0 ? 0 : fh-1, fm), fmt(Math.floor((fin+10)/60), (fin+10)%60), fmt(Math.floor((fin-5)/60), (fin-5)%60)];
      var dh = Math.floor(d/60), dm = d%60, etape = dh ? fmt(h + dh, m) : null;
      var ex = "On ajoute d'abord les heures, puis les minutes : " + fmt(h, m) + (dh ? " + " + dh + " h = " + etape : "") + (dm ? (dh ? ", puis " + etape : "") + " + " + dm + " min = <b>" + bon + "</b>." : " → <b>" + bon + "</b>.");
      return { enonce:"<small>Calcule l'heure de fin</small>Le film commence à <b>" + fmt(h, m) + "</b> et dure <b>" + duree(d) + "</b>.<br>À quelle heure finit-il ?",
        choix:M.choixAvec(bon, faux, 4), reponses:[bon], explication:ex, resume:"Film de " + duree(d) + " à " + fmt(h, m) };
    }
    var bon2 = duree(d);
    var faux2 = [duree(d+10), duree(Math.max(5, d-10)), duree(d+60), duree(Math.abs(d-40) || 25), duree(d+5)];
    var jusqua = 60 - m, ex2;
    if(m && d > jusqua){ var reste = d - jusqua; ex2 = "De " + fmt(h, m) + " à " + fmt(h+1, 0) + ", il y a " + jusqua + " min. Ensuite, de " + fmt(h+1, 0) + " à " + fmt(fh, fm) + ", il y a " + duree(reste) + ". En tout : " + jusqua + " min + " + duree(reste) + " = <b>" + bon2 + "</b>."; }
    else ex2 = "De " + fmt(h, m) + " à " + fmt(fh, fm) + ", il y a <b>" + bon2 + "</b>.";
    return { enonce:"<small>Calcule la durée</small>Le train part à <b>" + fmt(h, m) + "</b> et arrive à <b>" + fmt(fh, fm) + "</b>.<br>Combien de temps dure le voyage ?",
      choix:M.choixAvec(bon2, faux2, 4), reponses:[bon2], explication:ex2, resume:"Train de " + fmt(h, m) + " à " + fmt(fh, fm) };
  }
  function grille(heures, minutes){ return function(){ var o = []; heures.forEach(function(h){ minutes.forEach(function(m){ o.push(h + ":" + m); }); }); return o; }; }
  var H12 = [1,2,3,4,5,6,7,8,9,10,11,12];
  M.inscrire({ id:"heure", titre:"Lire l'heure", emoji:"🕒", matiere:"Maths",
    intro:"Lis l'horloge à aiguilles. La petite aiguille orange donne les heures, la grande aiguille verte les minutes.",
    niveaux:[
      { id:"pile", nom:"Heures pile et demies", desc:"3 h, 3 h 30…", cles:grille(H12, [0,30]), question:lecture },
      { id:"quarts", nom:"Et quart, et demie, moins le quart", desc:"Comment on le dit vraiment", cles:function(){ var o = grille([1,2,3,4,5,6,7,8,9,10], [0,15,30])(); [1,2,3,4,5,6,7,8,9,10].forEach(function(h){ o.push(h+":45"); }); return o; }, question:quarts },
      { id:"cinq", nom:"Toutes les 5 minutes", desc:"3 h 25, 7 h 50…", cles:grille(H12, [5,10,20,25,35,40,50,55]), question:lecture },
      { id:"apm", nom:"L'après-midi", desc:"3 h de l'après-midi = 15 h", cles:grille([1,2,3,4,5,6,7,8,9,10,11], [0,15,30,45]), question:apresMidi },
      { id:"durees", nom:"Calculer une durée", desc:"Le film finit à quelle heure ?", cleAuHasard:function(){
          return M.choisir(["fin","duree"]) + "|" + (M.entier(3, 30)*5) + "|" + M.entier(7, 19) + "|" + (M.entier(0, 11)*5); }, question:durees }
    ]});
})();
