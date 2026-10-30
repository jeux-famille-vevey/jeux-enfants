/* Les personnages de « Ma petite ville » : dessinés en SVG, les pieds à (0,0).
   dessinerPerso(cfg, { pose, expr, salut }) -> texte SVG.
   Poses : debout, assis, couche, porte (quand on le tient), salut. */
(function(){
  "use strict";
  var TRAIT = "#2B2140";
  var TAILLES = { bebe: .6, enfant: 1, ado: 1.14, adulte: 1.28, ancien: 1.22 };
  function c(x, y, r, f, extra){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (extra || "") + '/>'; }
  function e(x, y, rx, ry, f, extra){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (extra || "") + '/>'; }
  function p(d, f, extra){ return '<path d="' + d + '" fill="' + f + '"' + (extra || "") + '/>'; }
  function l(d, s, w){ return '<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function fonce(hex, k){ var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; k = k || .78;
    return "#" + [r, g, b].map(function(v){ return Math.round(v * k).toString(16).padStart(2, "0"); }).join(""); }

  var POSES = {
    //          bras gauche [épaule, coude, main]        bras droit                        jambes : hanche y, pieds
    debout: { bg: [[-28, -142], [-38, -116], [-40, -92]], bd: [[28, -142], [38, -116], [40, -92]], assis: false },
    salut:  { bg: [[-28, -142], [-38, -116], [-40, -92]], bd: [[28, -142], [52, -160], [58, -196]], assis: false },
    porte:  { bg: [[-28, -142], [-48, -164], [-54, -192]], bd: [[28, -142], [48, -164], [54, -192]], assis: false, balance: true },
    assis:  { bg: [[-28, -142], [-40, -118], [-34, -98]], bd: [[28, -142], [40, -118], [34, -98]], assis: true },
    tient:  { bg: [[-28, -142], [-38, -116], [-40, -92]], bd: [[28, -142], [46, -122], [44, -104]], assis: false }
  };
  /* où se trouve la main droite (pour tenir un objet), pour chaque pose */
  function main(cfg, pose){
    var s = TAILLES[cfg.taille] || 1, P = POSES[pose === "couche" ? "debout" : pose] || POSES.debout, m = P.bd[2], dy = P.assis ? 40 : 0;
    if(pose === "couche") return [ (120 - 92) * s, -32 * s - 40 * s ];
    return [m[0] * s, (m[1] + dy) * s];
  }

  function cheveuxDerriere(cfg){
    var h = cfg.couleurCheveux, st = cfg.cheveux;
    if(st === "long") return p("M-54 -200 Q-60 -132 -44 -118 L44 -118 Q60 -132 54 -200 Z", h);
    if(st === "afro") return c(0, -206, 70, h);
    if(st === "queue") return p("M40 -214 Q86 -206 74 -150 Q70 -128 56 -122 Q66 -160 46 -186 Z", h);
    if(st === "couettes") return c(-58, -186, 22, h) + c(58, -186, 22, h);
    if(st === "chignon") return c(0, -252, 22, h);
    return "";
  }
  function cheveuxDevant(cfg){
    var h = cfg.couleurCheveux, st = cfg.cheveux, s = "";
    if(st === "chauve") return "";
    if(st === "papy") return p("M-50 -186 Q-54 -204 -44 -214 Q-40 -196 -38 -184 Z", h) + p("M50 -186 Q54 -204 44 -214 Q40 -196 38 -184 Z", h);
    if(st === "boucle" || st === "afro"){ s += p("M-48 -196 Q-50 -244 0 -246 Q50 -244 48 -196 Q30 -214 0 -212 Q-30 -214 -48 -196 Z", h);
      for(var i = 0; i < 9; i++){ var a = Math.PI * (1.05 + i * .1); s += c((Math.cos(a) * 44).toFixed(1), (-200 + Math.sin(a) * 44).toFixed(1), 13, h); } return s; }
    if(st === "court") return p("M-50 -192 Q-52 -246 0 -246 Q52 -246 50 -192 Q44 -214 24 -218 Q12 -206 -4 -214 Q-30 -222 -50 -192 Z", h);
    // long, queue, couettes, chignon : une frange
    return p("M-50 -186 Q-54 -246 0 -246 Q54 -246 50 -186 Q46 -222 20 -226 Q4 -210 -14 -222 Q-40 -222 -50 -186 Z", h);
  }
  function visage(cfg, expr){
    var s = "", yeux = cfg.yeux || "#3A2416";
    // les yeux (ils clignent tout seuls)
    if(expr === "dort" || expr === "rire") s += l("M-26 -196 q8 7 16 0 M10 -196 q8 7 16 0", TRAIT, 4);
    else s += '<g class="yeux">' + e(-18, -196, 8, expr === "surpris" ? 11 : 9.5, "#fff") + e(18, -196, 8, expr === "surpris" ? 11 : 9.5, "#fff") +
      e(-17, -194, 5.5, 7, yeux) + e(19, -194, 5.5, 7, yeux) + c(-15, -197, 2.2, "#fff") + c(21, -197, 2.2, "#fff") + "</g>";
    // sourcils
    s += expr === "triste" ? l("M-27 -212 l12 -4 M27 -212 l-12 -4", TRAIT, 3) : l("M-26 -212 q8 -4 15 0 M11 -212 q8 -4 15 0", TRAIT, 3);
    // joues
    var joues = cfg.joues || "#FF7A8A"; s += e(-30, -178, 8, 5, joues, ' opacity="' + (cfg.joues ? .7 : .4) + '"') + e(30, -178, 8, 5, joues, ' opacity="' + (cfg.joues ? .7 : .4) + '"');
    // bouche
    var levres = cfg.levres || "#8A2C4A";
    if(expr === "rire") s += p("M-13 -176 Q0 -156 13 -176 Z", levres) + e(0, -168, 6, 3, "#FF8FA3");
    else if(expr === "surpris") s += e(0, -170, 6, 8, levres);
    else if(expr === "triste") s += l("M-9 -164 q9 -8 18 0", cfg.levres || TRAIT, 4);
    else if(expr === "dort") s += e(0, -170, 4, 3, levres);
    else if(expr === "mange") s += e(0, -170, 9, 7, levres) + e(-4, -172, 3, 2, "#fff");
    else s += cfg.levres ? p("M-11 -174 Q0 -162 11 -174 Q0 -170 -11 -174 Z", levres) : l("M-11 -174 q11 10 22 0", TRAIT, 3.5);
    // barbe, moustache
    if(cfg.barbe === "moustache") s += p("M-18 -178 Q-9 -188 0 -180 Q9 -188 18 -178 Q10 -174 0 -178 Q-10 -174 -18 -178 Z", cfg.couleurCheveux);
    if(cfg.barbe === "barbe") s += p("M-44 -196 Q-46 -150 0 -144 Q46 -150 44 -196 Q36 -170 20 -164 Q10 -176 0 -174 Q-10 -176 -20 -164 Q-36 -170 -44 -196 Z", cfg.couleurCheveux);
    if(expr === "dort") s += '<text x="40" y="-240" font-size="26" font-weight="700" fill="#5A61B8" font-family="sans-serif">z</text><text x="56" y="-262" font-size="20" font-weight="700" fill="#5A61B8" font-family="sans-serif">z</text>';
    return s;
  }
  function accessoire(a){
    if(a === "lunettes") return c(-18, -196, 13, "none", ' stroke="#22232B" stroke-width="4"') + c(18, -196, 13, "none", ' stroke="#22232B" stroke-width="4"') + l("M-5 -197 L5 -197", "#22232B", 4);
    if(a === "solaires") return p("M-34 -206 L-4 -206 Q-4 -184 -19 -184 Q-34 -184 -34 -206 Z M4 -206 L34 -206 Q34 -184 19 -184 Q4 -184 4 -206 Z", "#22232B") + l("M-4 -204 L4 -204", "#22232B", 4);
    if(a === "couronne") return p("M-30 -238 L-32 -270 L-16 -252 L0 -276 L16 -252 L32 -270 L30 -238 Z", "#FFD23F", ' stroke="#E0A43A" stroke-width="3"') + c(0, -256, 5, "#E5484D") + c(-18, -246, 3.5, "#4CC9F0") + c(18, -246, 3.5, "#4CC9F0");
    if(a === "noeud") return p("M34 -236 L58 -252 L58 -218 Z M34 -236 L12 -254 L12 -220 Z", "#FF5D8F") + c(34, -236, 8, "#E0457A");
    if(a === "casquette") return p("M-50 -214 Q-50 -258 0 -258 Q50 -258 50 -214 Z", "#E5484D") + p("M10 -216 L84 -212 Q86 -202 76 -200 L8 -206 Z", "#C23B40") + c(0, -258, 6, "#C23B40");
    if(a === "chapeau") return e(0, -228, 76, 14, "#F2D49A") + p("M-40 -230 Q-40 -282 0 -282 Q40 -282 40 -230 Z", "#F2D49A") + p("M-40 -244 Q0 -236 40 -244 L40 -232 Q0 -224 -40 -232 Z", "#FF6F9F");
    if(a === "bandeau") return p("M-50 -220 Q0 -252 50 -220 L48 -210 Q0 -240 -48 -210 Z", "#7BE495");
    if(a === "bonnet") return p("M-52 -206 Q-54 -262 0 -264 Q54 -262 52 -206 Z", "#3D7BD9") + p("M-54 -214 L54 -214 L54 -200 L-54 -200 Z", "#2B5FB0") + c(0, -266, 14, "#FFFFFF");
    if(a === "fleur") return [0, 72, 144, 216, 288].map(function(d){ var r = d * Math.PI / 180; return c((40 + Math.cos(r) * 10).toFixed(1), (-236 + Math.sin(r) * 10).toFixed(1), 8, "#FF8FD0"); }).join("") + c(40, -236, 6, "#FFD23F");
    return "";
  }
  function bras(P, cote, manche, peau, longue){
    var b = P[cote], d = "M" + b[0][0] + " " + b[0][1] + " L" + b[1][0] + " " + b[1][1] + " L" + b[2][0] + " " + b[2][1];
    var s = l(d, longue ? manche : peau, 16);
    if(!longue) s += l("M" + b[0][0] + " " + b[0][1] + " L" + (b[0][0] + (b[1][0] - b[0][0]) * .5) + " " + (b[0][1] + (b[1][1] - b[0][1]) * .5), manche, 19);
    return s + c(b[2][0], b[2][1], 10, peau);
  }

  /* le personnage entier */
  function dessinerPerso(cfg, o){
    o = o || {}; var pose = o.pose || "debout", expr = o.expr || cfg.expr || "sourire";
    if(pose === "couche"){
      return '<g transform="translate(' + (120 * (TAILLES[cfg.taille] || 1)) + " " + (-34 * (TAILLES[cfg.taille] || 1)) + ') rotate(-90)">' + dessinerPerso(cfg, { pose: "debout", expr: o.expr || "dort" }) + "</g>";
    }
    var P = POSES[pose] || POSES.debout, s = "", peau = cfg.peau, haut = cfg.couleurHaut, bas = cfg.couleurBas, ch = cfg.chaussures || "#22232B";
    var assis = P.assis, robe = cfg.haut === "robe", longue = cfg.haut === "pull" || cfg.haut === "chemise" || cfg.haut === "veste";
    // le corps entier descend de 40 quand on est assis (les jambes viennent vers nous)
    var dy = assis ? 40 : 0;
    s += '<g transform="translate(0 ' + dy + ')">' + cheveuxDerriere(cfg) + "</g>";
    // les jambes
    var bj = !robe && (cfg.bas === "pantalon" || cfg.haut === "salopette") ? bas : peau, cj = cfg.bas === "short" ? bas : null;
    if(assis){
      s += '<rect x="-30" y="-48" width="26" height="22" rx="10" fill="' + (cfg.bas === "jupe" || robe ? peau : bj) + '"/><rect x="4" y="-48" width="26" height="22" rx="10" fill="' + (cfg.bas === "jupe" || robe ? peau : bj) + '"/>';
      s += '<rect x="-27" y="-34" width="20" height="30" rx="9" fill="' + bj + '"/><rect x="7" y="-34" width="20" height="30" rx="9" fill="' + bj + '"/>';
      s += e(-17, -3, 15, 8, ch) + e(17, -3, 15, 8, ch);
    } else {
      var swing = P.balance ? 8 : 0;
      s += l("M-12 -84 L" + (-14 - swing) + " -10", bj, 19) + l("M12 -84 L" + (14 + swing) + " -10", bj, 19);
      if(cj) s += l("M-12 -84 L-13 -62 M12 -84 L13 -62", cj, 21);
      s += e(-16 - swing, -6, 16, 9, ch) + e(16 + swing, -6, 16, 9, ch) + e(-16 - swing, -3, 15, 3, "#FFFFFF", ' opacity=".5"') + e(16 + swing, -3, 15, 3, "#FFFFFF", ' opacity=".5"');
    }
    s += '<g transform="translate(0 ' + dy + ')">';
    // le bas : jupe, short, robe
    if(robe) s += p("M-30 -120 L30 -120 L46 " + (assis ? -66 : -52) + " Q0 " + (assis ? -58 : -44) + " -46 " + (assis ? -66 : -52) + " Z", haut);
    else if(cfg.bas === "jupe") s += p("M-30 -92 L30 -92 L44 -58 Q0 -50 -44 -58 Z", bas);
    else s += p("M-30 -96 L30 -96 L31 -78 L-31 -78 Z", cfg.bas === "jupe" ? bas : (cfg.haut === "salopette" ? bas : bas));
    // le haut
    var torse = "M-30 -148 Q0 -156 30 -148 L32 -88 Q0 -82 -32 -88 Z";
    if(cfg.haut === "salopette"){
      s += p(torse, haut) + p("M-22 -126 L22 -126 L26 -88 Q0 -82 -26 -88 Z", bas) + l("M-18 -126 L-22 -150 M18 -126 L22 -150", bas, 7) + c(-14, -120, 3.5, "#FFD23F") + c(14, -120, 3.5, "#FFD23F");
    } else {
      s += p(torse, haut);
      if(cfg.haut === "chemise") s += p("M-12 -152 L0 -136 L12 -152 Z", "#FFFFFF") + c(0, -126, 2.6, fonce(haut, .6)) + c(0, -112, 2.6, fonce(haut, .6)) + c(0, -98, 2.6, fonce(haut, .6));
      if(cfg.haut === "veste") s += l("M0 -152 L0 -86", fonce(haut, .7), 3) + p("M-12 -152 L0 -132 L12 -152 Z", "#FFFFFF");
      if(cfg.haut === "tshirt" && cfg.motif !== "aucun") s += cfg.motif === "coeur" ? p("M0 -104 C-14 -114 -14 -128 -4 -128 Q0 -128 0 -122 Q0 -128 4 -128 C14 -128 14 -114 0 -104 Z", "#FFFFFF", ' opacity=".9"')
        : cfg.motif === "etoile" ? p("M0 -132 L5 -121 L17 -120 L8 -112 L11 -100 L0 -106 L-11 -100 L-8 -112 L-17 -120 L-5 -121 Z", "#FFFFFF", ' opacity=".9"') : "";
      if(robe) s += p("M-30 -100 Q0 -94 30 -100 L30 -94 Q0 -88 -30 -94 Z", fonce(haut, .8));
    }
    // les bras (le droit peut tenir quelque chose)
    s += bras(P, "bg", haut, peau, longue) + bras(P, "bd", haut, peau, longue);
    if(cfg.pansement) s += '<rect x="' + (P.bg[1][0] - 9) + '" y="' + (P.bg[1][1] - 5) + '" width="18" height="10" rx="3" fill="#F6D3A8" stroke="#D9A86A" stroke-width="1.5"/>';
    // la tête
    s += '<rect x="-9" y="-160" width="18" height="16" fill="' + peau + '"/>';
    s += c(-48, -192, 9, peau) + c(48, -192, 9, peau) + c(0, -198, 48, peau);
    s += cheveuxDevant(cfg) + visage(cfg, expr) + accessoire(cfg.accessoire);
    s += "</g>";
    var k = TAILLES[cfg.taille] || 1;
    return '<g transform="scale(' + k + ')">' + s + "</g>";
  }
  function hauteur(cfg){ return 290 * (TAILLES[cfg.taille] || 1); }

  var CHOIX = {
    taille: [["bebe", "👶", "Bébé"], ["enfant", "🧒", "Enfant"], ["ado", "🧑", "Grand"], ["adulte", "🧔", "Adulte"], ["ancien", "👵", "Papi Mamie"]],
    peau: ["#FDE3CF", "#F2C9A0", "#E8B98E", "#D9A06B", "#C98E62", "#A86E45", "#8D5B3C", "#5E3A24", "#9FD8FF", "#B9F0A8", "#E8C6FF"],
    cheveux: [["court", "Court"], ["boucle", "Bouclés"], ["long", "Longs"], ["queue", "Queue"], ["couettes", "Couettes"], ["chignon", "Chignon"], ["afro", "Afro"], ["papy", "Papi"], ["chauve", "Sans"]],
    couleurCheveux: ["#22150F", "#4A2C1A", "#7A4B2E", "#C8502E", "#E0A43A", "#F4E3B0", "#C9CED8", "#FF6F9F", "#8E5BC4", "#3D7BD9", "#3FA34D"],
    yeux: ["#3A2416", "#6B4423", "#3D7BD9", "#3FA34D", "#8E5BC4", "#22232B"],
    haut: [["tshirt", "T-shirt"], ["robe", "Robe"], ["pull", "Pull"], ["chemise", "Chemise"], ["veste", "Veste"], ["salopette", "Salopette"]],
    motif: [["aucun", "Uni"], ["coeur", "Cœur"], ["etoile", "Étoile"]],
    bas: [["pantalon", "Pantalon"], ["short", "Short"], ["jupe", "Jupe"]],
    couleurs: ["#E5484D", "#FF6F9F", "#FFB3C6", "#FF9F1C", "#FFD23F", "#7BE495", "#3FA34D", "#2EC4B6", "#4CC9F0", "#3D7BD9", "#1D2357", "#8E5BC4", "#C9A8FF", "#FFFFFF", "#9AA0AE", "#22232B", "#8A5A3B"],
    accessoire: [["aucun", "Rien"], ["lunettes", "Lunettes"], ["solaires", "Lunettes de soleil"], ["couronne", "Couronne"], ["noeud", "Nœud"], ["casquette", "Casquette"], ["chapeau", "Chapeau"], ["bandeau", "Bandeau"], ["bonnet", "Bonnet"], ["fleur", "Fleur"]],
    barbe: [["aucune", "Rien"], ["moustache", "Moustache"], ["barbe", "Barbe"]],
    levres: [["", "Rien"], ["#E5484D", "Rouge"], ["#FF6F9F", "Rose"], ["#8E5BC4", "Violet"]],
    joues: [["", "Rien"], ["#FF6F9F", "Rose"], ["#FF9F1C", "Orange"]]
  };
  function auHasard(){
    function un(l){ return l[Math.floor(Math.random() * l.length)]; }
    function id(l){ return un(l)[0]; }
    return { nom: "", taille: id(CHOIX.taille.slice(0, 4)), peau: un(CHOIX.peau.slice(0, 8)), cheveux: id(CHOIX.cheveux.slice(0, 7)), couleurCheveux: un(CHOIX.couleurCheveux),
      yeux: un(CHOIX.yeux), haut: id(CHOIX.haut), motif: id(CHOIX.motif), couleurHaut: un(CHOIX.couleurs), bas: id(CHOIX.bas), couleurBas: un(CHOIX.couleurs),
      chaussures: un(CHOIX.couleurs), accessoire: Math.random() < .5 ? "aucun" : id(CHOIX.accessoire), barbe: "aucune", levres: "", joues: "" };
  }
  window.PERSO = { dessiner: dessinerPerso, main: main, hauteur: hauteur, CHOIX: CHOIX, auHasard: auHasard, TAILLES: TAILLES };
})();
