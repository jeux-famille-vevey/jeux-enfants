/* Les lieux de « Ma petite ville » : le décor (qui ne bouge pas) et les objets de départ.
   Le sol est à y = 900. Objets de départ : [type, x, y, options] ; un y au-dessus du sol = l'objet tombe et se pose (sur une table, une étagère…).
   options : d = distributeur (on en prend autant qu'on veut), m = accroché au mur. */
(function(){
  "use strict";
  function R(x, y, w, h, f, ex){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function C(x, y, r, f, ex){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function T(x, y, t, s, f){ return '<text x="' + x + '" y="' + y + '" font-size="' + (s || 40) + '" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="' + (f || "#1D2357") + '">' + t + "</text>"; }
  function piece(x, w, mur, sol, motif){
    var s = R(x, 0, w, 900, mur) + R(x, 900, w, 100, sol) + R(x, 880, w, 20, "#FFFFFF", ' opacity=".55"');
    if(motif === "carreaux") for(var i = x; i < x + w; i += 60) for(var j = 0; j < 2; j++) s += R(i + (j % 2) * 30, 900 + j * 50, 30, 50, "#FFFFFF", ' opacity=".18"');
    if(motif === "parquet") for(var k = x; k < x + w; k += 90) s += R(k, 900, 3, 100, "#000000", ' opacity=".08"');
    if(motif === "rayures") for(var m = x; m < x + w; m += 60) s += R(m, 60, 30, 820, "#FFFFFF", ' opacity=".22"');
    if(motif === "pois") for(var a = x + 30; a < x + w; a += 80) for(var b = 120; b < 860; b += 80) s += C(a + ((b / 80) % 2) * 40, b, 7, "#FFFFFF", ' opacity=".35"');
    return s;
  }
  function fenetre(x, y, w, h, ciel){ return R(x - 10, y - 10, w + 20, h + 20, "#FFFFFF") + R(x, y, w, h, ciel || "#9DDCFF") + C(x + w * .75, y + h * .3, Math.min(w, h) * .14, "#FFE27A") + R(x + w / 2 - 4, y, 8, h, "#FFFFFF") + R(x, y + h / 2 - 4, w, 8, "#FFFFFF"); }
  function mur(x){ return R(x - 14, 0, 28, 900, "#FFFFFF", ' opacity=".9"') + R(x - 14, 0, 28, 900, "#000000", ' opacity=".05"'); }
  function plafond(W, coul){ return R(0, 0, W, 60, coul || "#5A3A2E"); }
  function dehors(x, w, sol){
    var s = '<defs><linearGradient id="cielG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC8FF"/><stop offset="1" stop-color="#D7F0FF"/></linearGradient></defs>' + R(x, 0, w, 900, "url(#cielG)");
    for(var i = x + 120; i < x + w; i += 520) s += '<g opacity=".95">' + C(i, 130, 40, "#fff") + C(i + 46, 116, 52, "#fff") + C(i + 100, 134, 38, "#fff") + R(i - 10, 130, 130, 40, "#fff") + "</g>";
    s += '<path d="M' + x + ' 760 Q' + (x + w * .25) + ' 640 ' + (x + w * .5) + ' 740 T' + (x + w) + ' 720 L' + (x + w) + ' 900 L' + x + ' 900 Z" fill="#9ED98C"/>';
    return s + R(x, 880, w, 120, sol || "#7BCB6B") + R(x, 900, w, 100, "#000000", ' opacity=".06"');
  }
  function enseigne(x, y, texte, f){ return R(x - 200, y - 50, 400, 74, f || "#FF6F9F", ' rx="22"') + T(x, y + 4, texte, 46, "#FFFFFF"); }

  window.LIEUX = {
    maison: { nom: "La maison", e: "🏠", W: 2700, couleur: "linear-gradient(135deg,#FFD23F,#FF9F1C)",
      fond: function(){ return piece(0, 650, "#FFF1D6", "#E8CFA8", "carreaux") + piece(650, 750, "#E3ECFF", "#C7A27C", "parquet") + piece(1400, 600, "#FFE3EE", "#D9A66B", "pois") + piece(2000, 700, "#D7F2EE", "#BFD8E8", "carreaux") +
        plafond(2700) + fenetre(160, 230, 200, 160) + fenetre(900, 200, 300, 220) + fenetre(1620, 230, 200, 170, "#1D2357") + T(1650, 360, "✦", 24, "#FFF3A0") + T(1780, 270, "✦", 20, "#FFF3A0") +
        fenetre(2280, 200, 150, 140) + mur(650) + mur(1400) + mur(2000) +
        R(2010, 520, 680, 8, "#9AD3F0") + R(0, 520, 650, 6, "#E8CFA8"); },
      objets: [["frigo", 100, 900], ["plan", 300, 900], ["cuisiniere", 500, 900], ["casserole", 480, 600], ["jus", 250, 600], ["pain", 340, 600], ["horloge", 360, 180, { m: 1 }],
        ["table", 340, 975], ["chaise", 170, 978], ["chaise", 510, 978], ["assiette", 300, 700], ["pomme", 390, 700], ["gateau", 250, 700],
        ["tapis", 1010, 970], ["canape", 1000, 900], ["lampe", 760, 900], ["meubleTv", 1260, 900], ["tele", 1210, 700], ["radio", 1345, 700], ["cadre", 1000, 620, { m: 1 }], ["chat", 1120, 985], ["plante", 690, 985],
        ["lit", 1570, 900], ["armoire", 1880, 900], ["nounours", 1650, 600], ["ballon", 1760, 985], ["dino", 1460, 990], ["chien", 1600, 990], ["litBebe", 1800, 985],
        ["baignoire", 2170, 900], ["canard", 2200, 980], ["toilettes", 2420, 900], ["lavabo", 2600, 900], ["brosseDents", 2560, 600], ["savon", 2640, 600]] },
    ecole: { nom: "L'école", e: "🏫", W: 2300, couleur: "linear-gradient(135deg,#7BE495,#2EC4B6)",
      fond: function(){ return piece(0, 1500, "#FFF4D6", "#C7A27C", "parquet") + plafond(1500, "#E0A26A") + fenetre(1100, 200, 260, 200) + R(60, 160, 260, 120, "#FFFFFF", ' rx="14"') + T(190, 236, "A b c d", 46, "#E5484D") +
        dehors(1500, 800) + R(1500, 600, 800, 16, "#C4834F") + (function(){ var s = ""; for(var x = 1510; x < 2300; x += 40) s += R(x, 560, 14, 340, "#E0A26A", ' rx="6"'); return s; })() + mur(1500); },
      objets: [["tableau", 640, 560, { m: 1 }], ["horloge", 1000, 170, { m: 1 }], ["etagere", 110, 900], ["livre", 80, 500], ["livre", 130, 500], ["globe", 110, 400],
        ["chaiseEcole", 230, 935], ["pupitre", 340, 930], ["chaiseEcole", 540, 935], ["pupitre", 650, 930], ["chaiseEcole", 850, 935], ["pupitre", 960, 930],
        ["crayons", 340, 700], ["livre", 650, 700], ["ciseaux", 960, 700], ["bureau", 1300, 900], ["chaise", 1180, 905], ["cartable", 1400, 985], ["poisson", 1320, 600],
        ["arbre", 1660, 900], ["banc", 1900, 900], ["panier", 2200, 900], ["ballonBasket", 2050, 985], ["ballon", 1800, 990]] },
    magasin: { nom: "Le magasin", e: "🛒", W: 2200, couleur: "linear-gradient(135deg,#FF9FC4,#FF6F9F)",
      fond: function(){ return piece(0, 2200, "#FFF1E6", "#DDE6F5", "carreaux") + plafond(2200, "#E5484D") + (function(){ var s = ""; for(var x = 0; x < 2200; x += 110) s += '<path d="M' + x + ' 60 L' + (x + 110) + ' 60 L' + (x + 110) + ' 110 Q' + (x + 55) + ' 140 ' + x + ' 110 Z" fill="' + ((x / 110) % 2 ? "#FFFFFF" : "#E5484D") + '"/>'; return s; })() +
        enseigne(700, 240, "🛒 LE MAGASIN", "#3D7BD9") + fenetre(1650, 220, 360, 240); },
      objets: [["rayon", 250, 900], ["rayon", 600, 900], ["rayon", 950, 900], ["congelateur", 1320, 900], ["caisse", 1760, 900], ["caddie", 1500, 975], ["sac", 1700, 600],
        ["pomme", 150, 600, { d: 1 }], ["banane", 250, 600, { d: 1 }], ["orange", 350, 600, { d: 1 }], ["fraise", 150, 700, { d: 1 }], ["raisin", 250, 700, { d: 1 }], ["pasteque", 350, 700, { d: 1 }], ["carotte", 150, 830, { d: 1 }], ["brocoli", 250, 830, { d: 1 }], ["oeuf", 350, 830, { d: 1 }],
        ["pain", 500, 600, { d: 1 }], ["croissant", 600, 600, { d: 1 }], ["fromage", 700, 600, { d: 1 }], ["lait", 500, 700, { d: 1 }], ["jus", 600, 700, { d: 1 }], ["sandwich", 700, 700, { d: 1 }], ["poulet", 500, 830, { d: 1 }], ["pizza", 600, 830, { d: 1 }], ["frites", 700, 830, { d: 1 }],
        ["bonbon", 850, 600, { d: 1 }], ["sucette", 950, 600, { d: 1 }], ["donut", 1050, 600, { d: 1 }], ["cookie", 850, 700, { d: 1 }], ["gateau", 950, 700, { d: 1 }], ["cadeau", 1050, 700, { d: 1 }], ["ballon", 850, 830, { d: 1 }], ["nounours", 950, 830, { d: 1 }], ["robotJouet", 1050, 830, { d: 1 }],
        ["glace", 1240, 700, { d: 1 }], ["glace", 1320, 700, { d: 1 }], ["glace", 1400, 700, { d: 1 }]] },
    beaute: { nom: "Salon et boutique", e: "💇", W: 2100, couleur: "linear-gradient(135deg,#C9A8FF,#8E5BC4)",
      fond: function(){ return piece(0, 1150, "#FFE3F1", "#F4F0FF", "rayures") + piece(1150, 950, "#E8F0FF", "#E8D5F5", "pois") + plafond(2100, "#8E5BC4") + enseigne(560, 200, "💇 LE SALON", "#FF6F9F") + enseigne(1620, 200, "👗 LA BOUTIQUE", "#8E5BC4") + mur(1150) +
        '<path d="M1300 570 L1660 570" stroke="#9AA0AE" stroke-width="10"/><path d="M1300 710 L1660 710" stroke="#9AA0AE" stroke-width="10"/>'; },
      objets: [["miroir", 280, 630, { m: 1 }], ["fauteuilCoiffeur", 280, 900], ["miroir", 720, 630, { m: 1 }], ["fauteuilCoiffeur", 720, 900], ["plan", 1010, 900], ["secheCheveux", 960, 600], ["vernis", 1030, 600], ["rougeLevres", 1080, 600],
        ["portant", 1480, 900], ["habitRobeRose", 1330, 650, { m: 1, d: 1 }], ["habitRobeJaune", 1390, 650, { m: 1, d: 1 }], ["habitTshirtBleu", 1450, 650, { m: 1, d: 1 }], ["habitTshirtRouge", 1510, 650, { m: 1, d: 1 }], ["habitPull", 1570, 650, { m: 1, d: 1 }], ["habitChemise", 1630, 650, { m: 1, d: 1 }],
        ["habitJean", 1360, 790, { m: 1, d: 1 }], ["habitShort", 1450, 790, { m: 1, d: 1 }], ["habitJupe", 1540, 790, { m: 1, d: 1 }],
        ["rayon", 1900, 900], ["chapeauSoleil", 1800, 600, { d: 1 }], ["casquette", 1880, 600, { d: 1 }], ["couronne", 1960, 600, { d: 1 }], ["lunettes", 1820, 700, { d: 1 }], ["solaires", 1900, 700, { d: 1 }], ["noeud", 1980, 700, { d: 1 }], ["bonnet", 1840, 830, { d: 1 }], ["habitRobeRose", 1950, 830, { d: 1 }],
        ["fauteuil", 1180, 980]] },
    hopital: { nom: "L'hôpital", e: "🏥", W: 2200, couleur: "linear-gradient(135deg,#8EC5FF,#3D7BD9)",
      fond: function(){ return piece(0, 1600, "#E8F6F2", "#CFE3EE", "carreaux") + plafond(1600, "#3D7BD9") + R(560, 140, 120, 40, "#E5484D") + R(600, 100, 40, 120, "#E5484D") + fenetre(1080, 200, 260, 200) + dehors(1600, 600, "#9AA0AE") + mur(1600) +
        R(1640, 260, 520, 640, "#FFFFFF", ' rx="10"') + R(1700, 380, 400, 520, "#C9CED8") + T(1900, 330, "URGENCES", 44, "#E5484D"); },
      objets: [["litHopital", 330, 900], ["radiographie", 780, 900], ["plan", 1150, 900], ["thermometre", 1090, 600], ["stethoscope", 1150, 600], ["medicament", 1210, 600], ["pansement", 1240, 600, { d: 1 }],
        ["fauteuilRoulant", 1420, 970], ["chaise", 1000, 980], ["plante", 1530, 900], ["ambulance", 1900, 960]] },
    parc: { nom: "Le parc", e: "🌳", W: 3200, couleur: "linear-gradient(135deg,#B9F0A8,#3FA34D)",
      fond: function(){ return dehors(0, 3200) + C(2560, 120, 60, "#FFE27A") + '<path d="M0 960 Q800 920 1600 960 T3200 950" stroke="#E8D5B9" stroke-width="44" fill="none"/>'; },
      objets: [["arbre", 230, 900], ["balancoire", 640, 900], ["toboggan", 1100, 900], ["bacSable", 1560, 970], ["seau", 1500, 900], ["pelle", 1620, 900], ["banc", 1980, 900], ["velo", 1780, 985],
        ["fontaine", 2350, 900], ["standGlace", 2700, 900], ["glace", 2620, 600, { d: 1 }], ["sucette", 2700, 600, { d: 1 }], ["donut", 2780, 600, { d: 1 }], ["canardParc", 2250, 990], ["chien", 900, 990], ["ballon", 400, 990], ["voiture", 3030, 990]] }
  };
  window.ORDRE_LIEUX = ["maison", "ecole", "magasin", "beaute", "hopital", "parc"];
})();
