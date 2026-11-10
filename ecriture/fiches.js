/* Fiches d'écriture : on choisit UNE fiche, on la voit, on l'imprime (une seule page A4). Les mesures sont en millimètres. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var P = window.POLICE, svg = $("svg");
  var BLEU = "#3D7BD9", GRIS = "#9AA0AE", GRIS_CLAIR = "#C9CED8", ENCRE = "#1D2357", POINT = "#8C93A3", ROUGE = "#E5484D", JAUNE = "#FFF3C4";
  var COULEURS = ["#E5484D", "#FF9F1C", "#3FA34D", "#3D7BD9", "#8E5BC4", "#FF6F9F", "#2EC4B6"];
  var MOTS = [["A", "Avion", "2708"], ["B", "Ballon", "1f388"], ["C", "Chat", "1f431"], ["D", "Dauphin", "1f42c"], ["E", "Éléphant", "1f418"], ["F", "Fraise", "1f353"],
    ["G", "Girafe", "1f992"], ["H", "Hibou", "1f989"], ["I", "Île", "1f3dd"], ["J", "Jus", "1f9c3"], ["K", "Koala", "1f428"], ["L", "Lion", "1f981"],
    ["M", "Maison", "1f3e0"], ["N", "Nuage", "2601"], ["O", "Orange", "1f34a"], ["P", "Pomme", "1f34e"], ["Q", "Quille", "1f3b3"], ["R", "Robot", "1f916"],
    ["S", "Soleil", "2600"], ["T", "Tortue", "1f422"], ["U", "Usine", "1f3ed"], ["V", "Vélo", "1f6b2"], ["W", "Wagon", "1f683"], ["X", "Xylophone", "1f3b6"],
    ["Y", "Yoyo", "1fa80"], ["Z", "Zèbre", "1f993"]];
  var BASE_ACC = { "À": "A", "Â": "A", "Ç": "C", "É": "E", "È": "E", "Ê": "E", "Ë": "E", "Î": "I", "Ï": "I", "Ô": "O", "Ù": "U", "Û": "U", "Ü": "U",
    "à": "a", "â": "a", "ç": "c", "é": "e", "è": "e", "ê": "e", "ë": "e", "î": "i", "ï": "i", "ô": "o", "ù": "u", "û": "u", "ü": "u", "’": "'" };
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f(n){ return Math.round(n * 100) / 100; }

  /* ---------- écrire avec la police à un trait ---------- */
  function largeur(t, hcap){ var k = hcap / 21, w = 0; for(var i = 0; i < t.length; i++){ var g = P[BASE_ACC[t[i]] || t[i]] || P["?"]; w += g.w; } return w * k; }
  function ecrire(t, x, base, hcap, plein, couleur){
    var k = hcap / 21, d = "", cx = x;
    for(var i = 0; i < t.length; i++){
      var ch = t[i], b = BASE_ACC[ch] || ch, g = P[b] || P["?"];
      g.s.forEach(function(st){ st.forEach(function(p, j){ d += (j ? "L" : "M") + f(cx + p[0] * k) + " " + f(base + (p[1] - 9) * k); }); });
      if(b !== ch){ // les accents
        var mx = cx + g.w * k * .5, haut = base - (/[A-ZÀ-Ü]/.test(ch) ? 21 : 14) * k - 2.5 * k;
        if(/[Éé]/.test(ch)) d += "M" + f(mx - 2 * k) + " " + f(haut) + "L" + f(mx + 2.5 * k) + " " + f(haut - 3.5 * k);
        else if(/[Èèàù]/.test(ch)) d += "M" + f(mx + 2 * k) + " " + f(haut) + "L" + f(mx - 2.5 * k) + " " + f(haut - 3.5 * k);
        else if(/[ÂÊÎÔÛâêîôû]/.test(ch)) d += "M" + f(mx - 3 * k) + " " + f(haut) + "L" + f(mx) + " " + f(haut - 3 * k) + "L" + f(mx + 3 * k) + " " + f(haut);
        else if(/[ËÏÜëïü]/.test(ch)) d += "M" + f(mx - 2.5 * k) + " " + f(haut - 1) + "l0 .01M" + f(mx + 2.5 * k) + " " + f(haut - 1) + "l0 .01";
        else if(/[Çç]/.test(ch)) d += "M" + f(mx) + " " + f(base) + "L" + f(mx + 1.5 * k) + " " + f(base + 3 * k) + "L" + f(mx - 1.5 * k) + " " + f(base + 5 * k);
      }
      cx += g.w * k;
    }
    var ep = plein ? Math.max(.45, hcap * .042) : Math.max(.38, hcap * .035);
    var style = plein ? "" : ' stroke-dasharray="0.01 ' + f(Math.max(.95, hcap * .075)) + '"';
    return { svg: '<path d="' + d + '" fill="none" stroke="' + (couleur || (plein ? ENCRE : POINT)) + '" stroke-width="' + f(ep) + '" stroke-linecap="round" stroke-linejoin="round"' + style + "/>", x: cx };
  }
  /* ---------- les lignes d'école ---------- */
  function lignes(x0, x1, base, hcap){
    var hx = hcap * 14 / 21, hd = hcap * 7 / 21, s = "";
    s += '<rect x="' + x0 + '" y="' + f(base - hx) + '" width="' + f(x1 - x0) + '" height="' + f(hx) + '" fill="' + JAUNE + '"/>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + f(base - hcap) + '" y2="' + f(base - hcap) + '" stroke="' + GRIS_CLAIR + '" stroke-width=".25"/>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + f(base - hx) + '" y2="' + f(base - hx) + '" stroke="' + GRIS + '" stroke-width=".25" stroke-dasharray=".8 .9"/>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + f(base) + '" y2="' + f(base) + '" stroke="' + BLEU + '" stroke-width=".4"/>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + f(base + hd) + '" y2="' + f(base + hd) + '" stroke="' + GRIS_CLAIR + '" stroke-width=".25"/>';
    return s;
  }
  function image(code, x, y, t){ return '<image href="img/' + code + '.svg" x="' + f(x) + '" y="' + f(y) + '" width="' + f(t) + '" height="' + f(t) + '"/>'; }
  function texte(t, x, y, taille, couleur, gras, ancre){ return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + taille + '" font-family="Fredoka, Trebuchet MS, sans-serif" font-weight="' + (gras ? 700 : 500) + '" fill="' + (couleur || ENCRE) + '"' + (ancre ? ' text-anchor="' + ancre + '"' : "") + ">" + esc(t) + "</text>"; }
  function entete(titre, sous){ return texte(titre, 14, 24, 8, ENCRE, true) + texte(sous || "Prénom : ______________________     Date : ____________", 14, 31, 3.6, GRIS); }
  var M = 14, X1 = 196;
  /* une rangée : le modèle en rouge, puis des copies en pointillé ; vide = seulement le modèle */
  function rangee(base, hcap, modele, vide, espace){
    var s = lignes(M, X1, base, hcap), esp = espace !== undefined ? espace : Math.max(5, hcap * .5), lm = largeur(modele, hcap);
    var r = ecrire(modele, M + 4, base, hcap, true, ROUGE); s += r.svg; var x = r.x + esp;
    if(!vide) while(x + lm < X1 - 2){ r = ecrire(modele, x, base, hcap, false); s += r.svg; x = r.x + esp; }
    return s;
  }
  function tailleChoisie(){ return { petite: 10, moyenne: 14, grande: 19 }[taille]; }

  /* ---------- les fiches ---------- */
  function ficheLettre(i){
    var m = MOTS[i], L = m[0], c = COULEURS[i % COULEURS.length], s = "";
    s += '<rect x="14" y="12" width="182" height="58" rx="5" fill="' + c + '"/><rect x="18" y="16" width="92" height="50" rx="4" fill="#fff"/>';
    var r = ecrire(L, 26, 58, 34, true, c); s += r.svg; s += ecrire(L.toLowerCase(), r.x + 6, 58, 34, true, c).svg;
    s += image(m[2], 132, 18, 40) + texte(m[1], 152, 66, 6.5, "#fff", true, "middle");
    s += texte("Prénom : ______________________     Repasse les pointillés, puis écris tout seul sur la dernière ligne.", 14, 78, 3.2, ENCRE);
    var h = tailleChoisie(), pas = h * 1.75, base = 82 + h + 6, lignesDispo = Math.floor((283 - base) / pas) + 1;
    var plan = [L, L, L.toLowerCase(), L.toLowerCase(), m[1]];
    for(var k = 0; k < lignesDispo; k++){
      var dernier = k === lignesDispo - 1, modele = dernier ? L : plan[k % plan.length];
      if(!dernier && k >= plan.length) modele = k % 2 ? L.toLowerCase() : L;
      s += rangee(base, h, modele, dernier, modele.length > 1 ? 10 : undefined); base += pas;
    }
    return s;
  }
  function ficheMot(mot){
    mot = (mot || "").trim() || "Mikael";
    var h = tailleChoisie(), s = entete("J'écris : " + mot, "Repasse les pointillés, puis écris tout seul en bas.");
    while(largeur(mot, h) > 150 && h > 7) h -= 1;
    var pas = h * 1.8, base = 42 + h, n = Math.floor((283 - base) / pas) + 1;
    for(var k = 0; k < n; k++){ s += rangee(base, h, mot, k === n - 1, 12); base += pas; }
    return s;
  }
  function fichePhrase(ph){
    ph = (ph || "").trim() || "Je suis content.";
    var h = tailleChoisie(); while(largeur(ph, h) > 176 && h > 6) h -= .5;
    var s = entete("J'écris une phrase", "Repasse la phrase sur les pointillés, puis écris-la toute seule sur les lignes du bas.");
    var pas = h * 1.9, base = 42 + h, n = Math.floor((283 - base) / pas) + 1;
    for(var k = 0; k < n; k++){
      s += lignes(M, X1, base, h);
      if(k === 0) s += ecrire(ph, M + 3, base, h, true, ROUGE).svg;
      else if(k < Math.ceil(n * .6)) s += ecrire(ph, M + 3, base, h, false).svg;
      base += pas;
    }
    return s;
  }
  function ficheAlphabet(){
    var h = Math.min(tailleChoisie(), 14), s = entete("Je repasse l'alphabet", "Repasse sur les pointillés avec ton crayon, en suivant bien les lignes.");
    var groupes = [], courant = "", tout = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", min = "abcdefghijklmnopqrstuvwxyz";
    [tout, min].forEach(function(al){ courant = ""; for(var i = 0; i < al.length; i++){ var essai = courant + al[i]; if(largeur(essai, h) + essai.length * h * .3 > 176){ groupes.push(courant); courant = al[i]; } else courant = essai; } groupes.push(courant); });
    var pas = Math.min(h * 1.75, (283 - 42) / groupes.length), base = 42 + h;
    groupes.forEach(function(g){ s += lignes(M, X1, base, h); var x = M + 4; for(var i = 0; i < g.length; i++){ var r = ecrire(g[i], x, base, h, false); s += r.svg; x = r.x + h * .3; } base += pas; });
    return s;
  }
  function ficheChiffres(){
    var h = Math.min(tailleChoisie(), 13), s = entete("Les chiffres", "Repasse les chiffres, puis compte les ronds !"), base = 42 + h, pas = Math.min(h * 1.75, 24);
    for(var n = 0; n < 10; n++){
      var c = COULEURS[n % COULEURS.length];
      s += lignes(M, 150, base, h); var r = ecrire(String(n), M + 4, base, h, true, c); s += r.svg; var x = r.x + 6;
      while(x + largeur("0", h) < 148){ r = ecrire(String(n), x, base, h, false); s += r.svg; x = r.x + 6; }
      for(var k = 0; k < n; k++) s += '<circle cx="' + f(156 + (k % 5) * 8) + '" cy="' + f(base - h * .7 + Math.floor(k / 5) * 7) + '" r="3" fill="' + c + '"/>';
      base += pas;
    }
    return s;
  }
  function ficheAffiche(){
    var s = entete("L'alphabet", "Lis chaque lettre à voix haute, puis dis le mot. Tu peux colorier les images !"), cw = 45.5, rh = 35.5;
    MOTS.forEach(function(m, i){
      var col = i % 4, row = Math.floor(i / 4); if(i >= 24) col = i - 24 + 1;
      var x = 14 + col * cw, y = 38 + row * rh, c = COULEURS[i % COULEURS.length];
      s += '<rect x="' + f(x + 1) + '" y="' + f(y + 1) + '" width="' + f(cw - 2) + '" height="' + f(rh - 2) + '" rx="3.5" fill="#fff" stroke="' + c + '" stroke-width=".7"/>';
      var r = ecrire(m[0], x + 4, y + 19, 11, true, c); s += r.svg; s += ecrire(m[0].toLowerCase(), r.x + 1.5, y + 19, 11, true, c).svg;
      s += image(m[2], x + cw - 17, y + 15, 14) + texte(m[1], x + 4, y + rh - 4.5, 3.6, ENCRE, true);
    });
    return s;
  }

  /* ---------- l'écran ---------- */
  var type = "lettre", lettre = 0, taille = "moyenne";
  function dessiner(){
    var s = '<rect width="210" height="297" fill="#fff"/>';
    if(type === "lettre") s += ficheLettre(lettre);
    else if(type === "mot") s += ficheMot($("mot").value);
    else if(type === "phrase") s += fichePhrase($("phrase").value);
    else if(type === "alphabet") s += ficheAlphabet();
    else if(type === "chiffres") s += ficheChiffres();
    else if(type === "affiche") s += ficheAffiche();
    s += texte("Fiches d'écriture · jeux-famille-vevey" + (type === "lettre" || type === "affiche" ? " · images : Twemoji (CC BY 4.0)" : ""), 14, 290, 2.2, GRIS);
    svg.innerHTML = s;
    $("choixLettre").hidden = type !== "lettre"; $("choixMot").hidden = type !== "mot"; $("choixPhrase").hidden = type !== "phrase"; $("choixTaille").hidden = type === "affiche";
    document.title = "Fiche – " + ({ lettre: "lettre " + MOTS[lettre][0], mot: $("mot").value, phrase: "phrase", alphabet: "alphabet à repasser", chiffres: "chiffres", affiche: "alphabet illustré" }[type]);
  }
  document.querySelectorAll("#types button").forEach(function(b){ b.onclick = function(){ type = b.getAttribute("data-type"); document.querySelectorAll("#types button").forEach(function(x){ x.classList.toggle("on", x === b); }); dessiner(); }; });
  MOTS.forEach(function(m, i){ var b = document.createElement("button"); b.textContent = m[0]; if(i === 0) b.className = "on";
    b.onclick = function(){ lettre = i; document.querySelectorAll("#lettres button").forEach(function(x){ x.classList.toggle("on", x === b); }); dessiner(); }; $("lettres").appendChild(b); });
  document.querySelectorAll("#tailles button").forEach(function(b){ b.onclick = function(){ taille = b.getAttribute("data-t"); document.querySelectorAll("#tailles button").forEach(function(x){ x.classList.toggle("on", x === b); }); dessiner(); }; });
  $("mot").addEventListener("input", dessiner); $("phrase").addEventListener("input", dessiner);
  // les prénoms des enfants (les mêmes que dans les jeux)
  var noms = ["Aleyah", "Mikael"]; try{ (JSON.parse(localStorage.getItem("profils-ajoutes") || "[]") || []).forEach(function(p){ if(p && p.nom && noms.indexOf(p.nom) < 0) noms.push(p.nom); }); }catch(e){}
  noms.forEach(function(n){ var b = document.createElement("button"); b.textContent = n; b.onclick = function(){ $("mot").value = n; dessiner(); }; $("prenoms").appendChild(b); });
  $("imprimer").onclick = function(){ window.print(); };
  dessiner();
  window.__fiches = { dessiner: dessiner };
})();
