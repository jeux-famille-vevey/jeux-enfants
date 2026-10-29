/* Personnages dessinés en entier (SVG), pour les histoires.
   Dans une scène : ["@mikael", x, y, taille, animation, "tenue,pose,visage"]
   Le point (0,0) est sous les pieds ; un personnage mesure 200 unités de haut avant mise à l'échelle.
   Poses : debout, joie, tir, saut, coup, triste, peur, salut, court
   Visages : sourire, rire, triste, surpris, dort, fache */
(function(){
  "use strict";

  /* ---------- outils ---------- */
  function ligne(x1, y1, x2, y2, coul, ep){ return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + coul + '" stroke-width="' + ep + '" stroke-linecap="round"/>'; }
  function chemin(d, coul, ep){ return '<path d="' + d + '" fill="none" stroke="' + coul + '" stroke-width="' + ep + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function rond(x, y, r, coul, extra){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + coul + '"' + (extra || "") + '/>'; }
  function ovale(x, y, rx, ry, coul, extra){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + coul + '"' + (extra || "") + '/>'; }
  var TRAIT = "#2B2140";

  /* une jambe : hanche -> genou -> cheville, avec la chaussure au bout */
  function jambe(h, g, c, coulPant, coulPeau, ep, chaussure, sens){
    var s = chemin("M" + h[0] + " " + h[1] + " L" + g[0] + " " + g[1] + " L" + c[0] + " " + c[1], coulPant, ep);
    if(chaussure === "pieds") s += ovale(c[0] + 4 * sens, c[1] + 3, 10, 6, coulPeau);
    else if(chaussure === "chaussons") s += ovale(c[0] + 5 * sens, c[1] + 3, 12, 7, "#FF8FB8");
    else s += ovale(c[0] + 6 * sens, c[1] + 3, 14, 8, chaussure) + ovale(c[0] + 6 * sens, c[1] + 8, 14, 3, "#FFFFFF");
    return s;
  }
  function bras(e, c, m, coulManche, coulPeau, longue){
    // e : épaule, c : coude, m : main
    var s = chemin("M" + e[0] + " " + e[1] + " L" + c[0] + " " + c[1] + " L" + m[0] + " " + m[1], longue ? coulManche : coulPeau, 12);
    if(!longue) s += chemin("M" + e[0] + " " + e[1] + " L" + (e[0] + (c[0] - e[0]) * .45) + " " + (e[1] + (c[1] - e[1]) * .45), coulManche, 15);
    return s + rond(m[0], m[1], 7.5, coulPeau);
  }

  /* ---------- Mikael (et les copains, avec d'autres couleurs) ---------- */
  var POSES = {
    //        bras gauche [épaule, coude, main]      bras droit                         jambe gauche [hanche, genou, cheville]   jambe droite
    debout: { bg:[[-27,-112],[-34,-92],[-36,-72]], bd:[[27,-112],[34,-92],[36,-72]], jg:[[-11,-62],[-12,-36],[-12,-10]], jd:[[11,-62],[12,-36],[12,-10]] },
    joie:   { bg:[[-27,-112],[-42,-130],[-46,-152]], bd:[[27,-112],[42,-130],[46,-152]], jg:[[-11,-62],[-14,-36],[-16,-10]], jd:[[11,-62],[14,-36],[16,-10]] },
    saut:   { bg:[[-27,-112],[-44,-126],[-50,-146]], bd:[[27,-112],[44,-126],[50,-146]], jg:[[-11,-62],[-24,-44],[-14,-24]], jd:[[11,-62],[24,-44],[14,-24]] },
    tir:    { bg:[[-27,-112],[-46,-106],[-58,-96]], bd:[[27,-112],[36,-94],[30,-76]], jg:[[-11,-62],[-14,-36],[-18,-10]], jd:[[11,-62],[34,-50],[56,-40]] },
    court:  { bg:[[-27,-112],[-40,-98],[-30,-82]], bd:[[27,-112],[38,-120],[50,-108]], jg:[[-11,-62],[-26,-40],[-34,-18]], jd:[[11,-62],[18,-36],[8,-10]] },
    coup:   { bg:[[-27,-112],[-30,-96],[-14,-100]], bd:[[27,-112],[22,-98],[8,-106]], jg:[[-11,-62],[-16,-36],[-18,-10]], jd:[[11,-62],[42,-76],[74,-86]] },
    triste: { bg:[[-27,-110],[-30,-90],[-24,-70]], bd:[[27,-110],[30,-90],[24,-70]], jg:[[-11,-62],[-10,-36],[-10,-10]], jd:[[11,-62],[10,-36],[10,-10]] },
    peur:   { bg:[[-27,-112],[-36,-120],[-20,-134]], bd:[[27,-112],[36,-120],[20,-134]], jg:[[-11,-62],[-16,-36],[-20,-10]], jd:[[11,-62],[16,-36],[20,-10]] },
    salut:  { bg:[[-27,-112],[-26,-94],[-4,-102]], bd:[[27,-112],[26,-94],[4,-102]], jg:[[-11,-62],[-11,-36],[-11,-10]], jd:[[11,-62],[11,-36],[11,-10]] },
    vol:    { bg:[[-27,-112],[-36,-138],[-34,-166]], bd:[[27,-112],[34,-138],[30,-168]], jg:[[-11,-62],[-20,-40],[-30,-22]], jd:[[11,-62],[6,-38],[2,-16]] }
  };
  var TENUES = {
    foot:    { haut:"#3D7BD9", bas:"#1D2357", jambe:"peau", chaussure:"#E5484D", manche:"courte", numero:"5" },
    kimono:  { haut:"#FAFAF5", bas:"#FAFAF5", jambe:"pant", chaussure:"pieds", manche:"longue", ceinture:"#FFD23F" },
    pyjama:  { haut:"#8EC5FF", bas:"#8EC5FF", jambe:"pant", chaussure:"chaussons", manche:"longue", etoiles:true },
    ecole:   { haut:"#FF9F1C", bas:"#3D4A8F", jambe:"pant", chaussure:"#2B2140", manche:"courte", sac:true },
    heros:   { haut:"#8E5BC4", bas:"#5A3A9A", jambe:"pant", chaussure:"#FFD23F", manche:"longue", cape:"#FF4FB0", logo:true },
    heros2:  { haut:"#3D7BD9", bas:"#1D2357", jambe:"pant", chaussure:"#FFFFFF", manche:"longue", cape:"#4CC9F0", logo:true },
    heros3:  { haut:"#3FA34D", bas:"#2F7D4A", jambe:"pant", chaussure:"#FF8FB8", manche:"longue", cape:"#FFD23F", logo:true },
    princesse: { haut:"#FF8FD0", bas:"#FF8FD0", jambe:"peau", chaussure:"#FFD23F", manche:"courte", robe:"#FF6FB0", bord:"#FFD23F", chapeau:"couronne" },
    sorciere:  { haut:"#6B3FA0", bas:"#6B3FA0", jambe:"peau", chaussure:"#22232B", manche:"longue", robe:"#4A2C7A", etoilesRobe:true, chapeau:"sorciere", main:"baguette", chaussettes:"#FF9F1C" },
    chevalier: { haut:"#C9CED8", bas:"#9AA0AE", jambe:"pant", chaussure:"#5A5F6E", manche:"longue", chapeau:"casque", main:"epee", bouclier:"#3D7BD9", armure:true },
    papa:      { haut:"#3D7BD9", bas:"#3D4A5A", jambe:"pant", chaussure:"#2B2140", manche:"longue", col:true },
    maman:     { haut:"#3FA34D", bas:"#3FA34D", jambe:"peau", chaussure:"#8A5A3B", manche:"longue", robe:"#2F7D4A", robeLongue:true },
    priere:    { haut:"#F4F0FF", bas:"#F4F0FF", jambe:"peau", chaussure:"#C9A8FF", manche:"longue", robe:"#EDE6FF", robeLongue:true, voile:"#C9A8FF", motifRobe:"#B9A3F0" },
    cross:     { haut:"#FF9F1C", bas:"#F4F4F4", jambe:"pant", chaussure:"#22232B", manche:"longue", numero:"5" },
    crossB:    { haut:"#3D7BD9", bas:"#F4F4F4", jambe:"pant", chaussure:"#22232B", manche:"longue" },
    tshirt:    { haut:"#FF9F1C", bas:"#1D2357", jambe:"peau", chaussure:"#3D7BD9", manche:"courte" },
    papy:      { haut:"#8A5A3B", bas:"#4A4F5E", jambe:"pant", chaussure:"#2B2140", manche:"longue", col:true },
    mamy:      { haut:"#E5484D", bas:"#E5484D", jambe:"peau", chaussure:"#22232B", manche:"longue", robe:"#C23B40", robeLongue:true }
  };

  function visage(cx, cy, expr, peau){
    var s = "";
    // yeux
    if(expr === "dort"){ s += chemin("M" + (cx-17) + " " + (cy-1) + " q5 5 10 0", TRAIT, 2.6) + chemin("M" + (cx+7) + " " + (cy-1) + " q5 5 10 0", TRAIT, 2.6); }
    else {
      var ry = expr === "surpris" ? 8.5 : 7.5;
      [-12, 12].forEach(function(dx){ s += ovale(cx + dx, cy - 1, 6.2, ry, "#FFFFFF") + rond(cx + dx + 1, cy, 4.2, "#2B2140") + rond(cx + dx + 2.5, cy - 2, 1.5, "#FFFFFF"); });
    }
    // sourcils
    if(expr === "triste") s += chemin("M" + (cx-18) + " " + (cy-12) + " l9 -4", TRAIT, 2.4) + chemin("M" + (cx+18) + " " + (cy-12) + " l-9 -4", TRAIT, 2.4);
    else if(expr === "fache") s += chemin("M" + (cx-18) + " " + (cy-15) + " l10 4", TRAIT, 3) + chemin("M" + (cx+18) + " " + (cy-15) + " l-10 4", TRAIT, 3);
    else if(expr === "surpris") s += chemin("M" + (cx-18) + " " + (cy-15) + " q6 -4 11 0", TRAIT, 2.2) + chemin("M" + (cx+7) + " " + (cy-15) + " q6 -4 11 0", TRAIT, 2.2);
    else s += chemin("M" + (cx-17) + " " + (cy-12) + " q5 -3 10 0", TRAIT, 2.2) + chemin("M" + (cx+7) + " " + (cy-12) + " q5 -3 10 0", TRAIT, 2.2);
    // joues et nez
    s += ovale(cx - 20, cy + 9, 6, 3.6, "#FF7A8A", ' opacity=".45"') + ovale(cx + 20, cy + 9, 6, 3.6, "#FF7A8A", ' opacity=".45"');
    s += chemin("M" + (cx-1) + " " + (cy+4) + " q3 3 0 5", "rgba(0,0,0,.35)", 2);
    // bouche
    var by = cy + 15;
    if(expr === "rire") s += '<path d="M' + (cx-11) + ' ' + (by-2) + ' Q' + cx + ' ' + (by+14) + ' ' + (cx+11) + ' ' + (by-2) + 'Z" fill="#8A2C4A"/>' + ovale(cx, by + 6, 5, 3, "#FF8FA3");
    else if(expr === "triste") s += chemin("M" + (cx-8) + " " + (by+4) + " q8 -7 16 0", TRAIT, 2.6);
    else if(expr === "surpris") s += ovale(cx, by + 2, 5, 6, "#8A2C4A");
    else if(expr === "dort") s += ovale(cx, by + 1, 3.5, 2.5, "#8A2C4A");
    else if(expr === "fache") s += chemin("M" + (cx-8) + " " + (by+2) + " l16 0", TRAIT, 2.6);
    else s += chemin("M" + (cx-9) + " " + by + " q9 8 18 0", TRAIT, 2.6);
    return s;
  }

  function enfant(opts, couleurs){
    var o = (opts || "").split(","), tenue = TENUES[o[0]] || TENUES.foot, pose = POSES[o[1]] || POSES.debout, expr = o[2] || "sourire";
    var peau = couleurs.peau, chev = couleurs.cheveux, haut = couleurs.haut || tenue.haut, bas = couleurs.bas || tenue.bas;
    var pant = tenue.jambe === "pant", longue = tenue.manche === "longue", s = "";
    // cape de super-héros (derrière)
    if(tenue.cape) s += '<path d="M-24 -120 Q-46 -70 -44 -24 Q-22 -32 0 -22 Q22 -32 46 -26 Q46 -70 24 -120Z" fill="' + tenue.cape + '" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>';
    // cheveux longs (derrière la tête)
    if(couleurs.longs) s += '<path d="M-36 -160 Q-40 -110 -30 -100 L30 -100 Q40 -110 36 -160Z" fill="' + couleurs.cheveux + '"/>';
    // sac d'école (derrière)
    if(tenue.sac) s += '<rect x="-34" y="-118" width="26" height="40" rx="8" fill="#E5484D" stroke="' + TRAIT + '" stroke-width="2"/>';
    // jambes
    s += jambe(pose.jg[0], pose.jg[1], pose.jg[2], pant ? bas : peau, peau, pant ? 15 : 12, tenue.chaussure, -1);
    s += jambe(pose.jd[0], pose.jd[1], pose.jd[2], pant ? bas : peau, peau, pant ? 15 : 12, tenue.chaussure, 1);
    if(!pant){ // chaussettes
      [pose.jg, pose.jd].forEach(function(j){ var c = j[2], g = j[1]; s += chemin("M" + (c[0] + (g[0]-c[0])*.35) + " " + (c[1] + (g[1]-c[1])*.35) + " L" + c[0] + " " + c[1], tenue.chaussettes || "#FFFFFF", 13); });
    }
    if(tenue.robe){ // une robe (jusqu'aux genoux, ou longue pour Maman)
      var bas_ = tenue.robeLongue ? -8 : -34, large = tenue.robeLongue ? 40 : 46;
      s += '<path d="M-28 -78 L28 -78 L' + large + ' ' + bas_ + ' Q0 ' + (bas_ + 8) + ' -' + large + ' ' + bas_ + 'Z" fill="' + tenue.robe + '" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>';
      if(tenue.bord) s += chemin("M-" + (large - 2) + " " + (bas_ - 3) + " Q0 " + (bas_ + 5) + " " + (large - 2) + " " + (bas_ - 3), tenue.bord, 5);
      if(tenue.motifRobe) [[-16,-52],[10,-40],[22,-60],[-6,-24],[18,-20],[-22,-30]].forEach(function(p){ s += rond(p[0], p[1], 3, tenue.motifRobe); });
      if(tenue.etoilesRobe) [[-18,-50],[14,-60],[24,-42],[-4,-40]].forEach(function(p){ s += '<text x="' + p[0] + '" y="' + p[1] + '" font-size="13" text-anchor="middle" fill="#FFD23F">★</text>'; });
    } else {
      // short / bas du kimono
      s += '<path d="M-27 -72 L27 -72 L29 -50 L4 -50 L0 -58 L-4 -50 L-29 -50Z" fill="' + bas + '" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>';
    }
    // corps
    s += '<path d="M-26 -120 Q0 -128 26 -120 L30 -70 Q0 -64 -30 -70Z" fill="' + haut + '" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>';
    if(tenue.numero) s += '<text x="0" y="-84" text-anchor="middle" font-size="26" font-weight="700" fill="#FFFFFF" font-family="Fredoka, Arial, sans-serif">' + tenue.numero + '</text>' +
      '<path d="M-26 -120 Q0 -128 26 -120 L27 -114 Q0 -121 -27 -114Z" fill="#FFFFFF"/>';
    if(o[0] === "kimono") s += chemin("M-14 -122 L4 -86", "#D9D9D0", 3) + chemin("M14 -122 L-4 -96", "#D9D9D0", 3) + '<rect x="-30" y="-78" width="60" height="9" rx="3" fill="' + tenue.ceinture + '"/>' +
      chemin("M4 -72 l6 16", tenue.ceinture, 5) + chemin("M-2 -72 l-5 15", tenue.ceinture, 5);
    if(tenue.armure) s += chemin("M-22 -112 Q0 -104 22 -112", "#9AA0AE", 3) + chemin("M-24 -96 Q0 -88 24 -96", "#9AA0AE", 3) + '<path d="M-8 -118 L8 -118 L6 -100 L0 -94 L-6 -100Z" fill="#E5484D"/>';
    if(tenue.col) s += '<path d="M-10 -124 L0 -112 L10 -124Z" fill="#FFFFFF" stroke="' + TRAIT + '" stroke-width="1.5"/>' + rond(0, -104, 2, "#FFFFFF") + rond(0, -92, 2, "#FFFFFF") + rond(0, -80, 2, "#FFFFFF");
    if(tenue.logo) s += '<path d="M0 -116 L5 -104 L18 -104 L8 -96 L12 -84 L0 -91 L-12 -84 L-8 -96 L-18 -104 L-5 -104Z" fill="#FFD23F" stroke="' + TRAIT + '" stroke-width="1.5"/>';
    if(tenue.etoiles) [[-12,-104],[12,-92],[-6,-82],[16,-112]].forEach(function(p){ s += '<text x="' + p[0] + '" y="' + p[1] + '" font-size="11" text-anchor="middle" fill="#FFD23F">★</text>'; });
    // bras (et ce qu'on tient dans la main droite / le bouclier sur le bras gauche)
    s += bras(pose.bg[0], pose.bg[1], pose.bg[2], haut, peau, longue);
    if(tenue.bouclier){ var b = pose.bg[2]; s += '<path d="M' + (b[0]-16) + ' ' + (b[1]-22) + ' L' + (b[0]+16) + ' ' + (b[1]-22) + ' L' + (b[0]+16) + ' ' + (b[1]+4) + ' Q' + b[0] + ' ' + (b[1]+26) + ' ' + (b[0]-16) + ' ' + (b[1]+4) + 'Z" fill="' + tenue.bouclier + '" stroke="' + TRAIT + '" stroke-width="2.5"/>' +
      '<path d="M' + b[0] + ' ' + (b[1]-16) + ' L' + b[0] + ' ' + (b[1]+14) + ' M' + (b[0]-11) + ' ' + (b[1]-4) + ' L' + (b[0]+11) + ' ' + (b[1]-4) + '" stroke="#FFD23F" stroke-width="4"/>'; }
    s += bras(pose.bd[0], pose.bd[1], pose.bd[2], haut, peau, longue);
    if(tenue.main === "baguette"){ var m = pose.bd[2]; s += ligne(m[0], m[1], m[0] + 14, m[1] - 34, "#3A2A1A", 4) + '<text x="' + (m[0] + 15) + '" y="' + (m[1] - 30) + '" font-size="22" text-anchor="middle" fill="#FFD23F">★</text>'; }
    if(tenue.main === "epee"){ var m2 = pose.bd[2]; s += ligne(m2[0] - 8, m2[1] + 2, m2[0] + 8, m2[1] - 2, "#8A5A3B", 5) + ligne(m2[0], m2[1], m2[0] + 18, m2[1] - 46, "#C9CED8", 6) + ligne(m2[0], m2[1], m2[0] + 18, m2[1] - 46, "#8A5A3B", 1); }
    // cou et tête
    var penche = o[1] === "triste" ? 8 : o[1] === "salut" ? 10 : 0;
    s += '<rect x="-7" y="-128" width="14" height="12" fill="' + peau + '"/>';
    if(tenue.voile) s += '<g transform="rotate(' + penche + ' 0 -126)">' + teteVoile(peau, tenue.voile, expr) + "</g>";
    else s += '<g transform="rotate(' + penche + ' 0 -126)">' + tete(peau, chev, expr) + chapeau(couleurs.casque ? "casqueCross:" + couleurs.casque : tenue.chapeau) + "</g>";
    return s;
  }
  /* la tête avec un foulard (habit de prière) : le tissu entoure le visage et tombe sur les épaules */
  function teteVoile(peau, coul, expr){
    var s = '<path d="M-44 -150 Q-46 -196 0 -198 Q46 -196 44 -150 Q46 -118 30 -104 L-30 -104 Q-46 -118 -44 -150Z" fill="' + coul + '" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += rond(0, -150, 31, peau);
    s += '<path d="M-33 -150 Q-34 -186 0 -187 Q34 -186 33 -150 Q30 -176 0 -177 Q-30 -176 -33 -150Z" fill="' + coul + '"/>';
    s += chemin("M-31 -150 Q-34 -188 0 -188 Q34 -188 31 -150 Q30 -122 0 -118 Q-30 -122 -31 -150", "rgba(0,0,0,.18)", 2);
    return s + visage(0, -148, expr, peau);
  }
  /* couronne de princesse, chapeau de sorcière, casque de chevalier (posés sur la tête : centre 0,-152, rayon 33) */
  function chapeau(c){
    if(c === "couronne") return '<path d="M-24 -182 L-24 -202 L-12 -190 L0 -208 L12 -190 L24 -202 L24 -182Z" fill="#FFD23F" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>' + rond(0, -192, 3.5, "#E5484D") + rond(-16, -188, 2.5, "#4CC9F0") + rond(16, -188, 2.5, "#4CC9F0");
    if(c === "sorciere") return ovale(0, -180, 50, 9, "#2E1A4F", ' stroke="' + TRAIT + '" stroke-width="2"') + '<path d="M-28 -182 Q-10 -228 22 -252 Q8 -224 28 -182Z" fill="#4A2C7A" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M-27 -190 Q0 -196 27 -190 L28 -182 Q0 -188 -28 -182Z" fill="#FF9F1C"/>' + '<text x="4" y="-205" font-size="14" text-anchor="middle" fill="#FFD23F">★</text>';
    if(c && c.indexOf("casqueCross") === 0){ var col = c.split(":")[1] || "#3D7BD9";
      return rond(0, -154, 40, col, ' stroke="' + TRAIT + '" stroke-width="2.5"') + '<path d="M-30 -166 Q0 -176 30 -166 L28 -142 Q0 -134 -28 -142Z" fill="#2B2B3A"/>' +
        '<path d="M-22 -160 Q-4 -166 10 -160" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".6"/>' + '<path d="M-20 -194 Q0 -210 30 -196 L34 -186 Q4 -196 -20 -186Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>'; }
    if(c === "casque") return '<path d="M-36 -150 Q-38 -194 0 -196 Q38 -194 36 -150 L26 -150 L26 -164 L-26 -164 L-26 -150Z" fill="#C9CED8" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M0 -196 Q10 -214 26 -214 Q16 -204 4 -194Z" fill="#E5484D"/>' + chemin("M-30 -170 L30 -170", "#9AA0AE", 3);
    return "";
  }
  function tete(peau, chev, expr){
    var s = rond(-32, -150, 7.5, peau) + rond(32, -150, 7.5, peau);
    s += rond(0, -152, 33, peau, ' stroke="' + TRAIT + '" stroke-width="2"');
    // cheveux courts et bouclés
    s += '<path d="M-34 -150 Q-36 -190 0 -190 Q36 -190 34 -150 Q30 -168 14 -172 Q0 -164 -14 -172 Q-30 -168 -34 -150Z" fill="' + chev + '"/>';
    for(var i = 0; i < 9; i++){ var a = Math.PI * (1.05 + i * .1), r = 31; s += rond(Math.cos(a) * r, -156 + Math.sin(a) * r, 8.5, chev); }
    return s + visage(0, -148, expr, peau);
  }
  /* l'enfant couché dans son lit (pour la fin des histoires) */
  function lit(opts, couleurs){
    var expr = (opts || "").split(",")[2] || "dort", s = "";
    s += '<rect x="-150" y="-150" width="22" height="150" rx="8" fill="#8A5A3B"/><rect x="134" y="-96" width="18" height="96" rx="8" fill="#8A5A3B"/>';
    s += '<rect x="-136" y="-70" width="280" height="30" rx="8" fill="#A9744A"/>';
    s += '<rect x="-130" y="-98" width="268" height="32" rx="12" fill="#FFFFFF" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += ovale(-88, -110, 42, 18, "#FFF3D6", ' stroke="' + TRAIT + '" stroke-width="2"');
    s += '<g transform="translate(-84 26) rotate(-72 0 -150)">' + tete(couleurs.peau, couleurs.cheveux, expr) + '</g>';
    s += '<path d="M-56 -88 Q-56 -136 0 -136 L134 -136 Q146 -136 146 -122 L146 -78 Q40 -64 -56 -78Z" fill="#8EC5FF" stroke="' + TRAIT + '" stroke-width="2"/>';
    [[-20,-112],[30,-100],[80,-118],[110,-92],[0,-90]].forEach(function(p){ s += '<text x="' + p[0] + '" y="' + p[1] + '" font-size="16" text-anchor="middle" fill="#FFD23F">★</text>'; });
    s += chemin("M-56 -124 L146 -124", "#6FA8E8", 4);
    return s;
  }

  /* ---------- Balou, le ballon magique ---------- */
  function balou(opts){
    var expr = (opts || "").split(",")[2] || "rire", s = "";
    s += rond(0, -100, 94, "#FFD23F", ' opacity=".22"') + rond(0, -100, 80, "#FFE27A", ' opacity=".25"');
    s += rond(0, -100, 70, "#FFFFFF", ' stroke="' + TRAIT + '" stroke-width="4"');
    // pentagones du ballon (dans le haut et sur les côtés, le visage reste dégagé)
    s += '<polygon points="0,-168 16,-157 10,-140 -10,-140 -16,-157" fill="#2B2140"/>';
    s += '<polygon points="-66,-118 -50,-124 -44,-106 -56,-92 -68,-98" fill="#2B2140"/>';
    s += '<polygon points="66,-118 50,-124 44,-106 56,-92 68,-98" fill="#2B2140"/>';
    s += '<polygon points="-30,-38 -14,-34 -14,-31 -40,-38" fill="#2B2140"/><polygon points="30,-38 14,-34 14,-31 40,-38" fill="#2B2140"/>';
    s += chemin("M0 -140 L0 -128 M-16 -157 L-40 -150 M16 -157 L40 -150 M-44 -106 L-28 -96 M44 -106 L28 -96", "#2B2140", 2.5);
    // visage
    [-22, 22].forEach(function(dx){ s += ovale(dx, -100, 12, 15, "#FFFFFF", ' stroke="' + TRAIT + '" stroke-width="2.5"') + rond(dx + 2, -97, 8, "#2B2140") + rond(dx + 5, -101, 3, "#FFFFFF"); });
    s += ovale(-36, -76, 9, 5, "#FF7A8A", ' opacity=".55"') + ovale(36, -76, 9, 5, "#FF7A8A", ' opacity=".55"');
    if(expr === "surpris") s += ovale(0, -66, 8, 10, "#8A2C4A");
    else s += '<path d="M-18 -76 Q0 -50 18 -76Z" fill="#8A2C4A"/>' + ovale(0, -62, 7, 4, "#FF8FA3");
    // petites étincelles
    [[-84,-164],[86,-150],[-90,-50],[80,-40]].forEach(function(p, i){ s += '<path d="M' + p[0] + ' ' + (p[1]-12) + ' L' + (p[0]+4) + ' ' + (p[1]-4) + ' L' + (p[0]+12) + ' ' + p[1] + ' L' + (p[0]+4) + ' ' + (p[1]+4) + ' L' + p[0] + ' ' + (p[1]+12) + ' L' + (p[0]-4) + ' ' + (p[1]+4) + ' L' + (p[0]-12) + ' ' + p[1] + ' L' + (p[0]-4) + ' ' + (p[1]-4) + 'Z" fill="#FFD23F"/>'; });
    return s;
  }

  /* ---------- le géant Grognon ---------- */
  function grognon(opts){
    var o = (opts || "").split(","), pose = o[1] || "debout", expr = o[2] || "sourire", s = "";
    var peau = "#9CCB7A", tunique = "#B86B3A", pant = "#5B4A8F", botte = "#5A3A22", gants = pose === "gardien";
    // jambes
    s += '<rect x="-46" y="-70" width="34" height="56" rx="12" fill="' + pant + '"/><rect x="12" y="-70" width="34" height="56" rx="12" fill="' + pant + '"/>';
    s += ovale(-32, -10, 26, 12, botte) + ovale(32, -10, 26, 12, botte);
    // bras (derrière le ventre quand ils pendent)
    var bras2 = { debout:[[-58,-140],[-74,-100],[-70,-66]], joie:[[-58,-140],[-86,-170],[-92,-206]], gardien:[[-58,-140],[-96,-150],[-120,-170]], triste:[[-58,-136],[-62,-100],[-40,-80]], fache:[[-58,-140],[-80,-110],[-56,-96]] }[pose] || [[-58,-140],[-74,-100],[-70,-66]];
    [-1, 1].forEach(function(sens){
      var p = bras2.map(function(q){ return [q[0] * sens, q[1]]; });
      s += chemin("M" + p[0][0] + " " + p[0][1] + " L" + p[1][0] + " " + p[1][1] + " L" + p[2][0] + " " + p[2][1], peau, 24);
      s += chemin("M" + p[0][0] + " " + p[0][1] + " L" + (p[0][0] + (p[1][0]-p[0][0])*.5) + " " + (p[0][1] + (p[1][1]-p[0][1])*.5), tunique, 28);
      s += rond(p[2][0], p[2][1], gants ? 19 : 16, gants ? "#FFD23F" : peau, gants ? ' stroke="' + TRAIT + '" stroke-width="3"' : "");
    });
    // ventre et tunique
    s += '<path d="M-60 -150 Q0 -170 60 -150 Q80 -100 62 -62 Q0 -48 -62 -62 Q-80 -100 -60 -150Z" fill="' + tunique + '" stroke="' + TRAIT + '" stroke-width="3"/>';
    s += '<rect x="-66" y="-92" width="132" height="14" rx="6" fill="#5A3A22"/><rect x="-12" y="-95" width="24" height="20" rx="4" fill="#FFD23F"/>';
    s += chemin("M-30 -140 l6 24 M30 -140 l-6 24", "#8E4E26", 3);
    // tête
    s += rond(-46, -196, 13, peau, ' stroke="' + TRAIT + '" stroke-width="2.5"') + rond(46, -196, 13, peau, ' stroke="' + TRAIT + '" stroke-width="2.5"');
    s += rond(0, -196, 46, peau, ' stroke="' + TRAIT + '" stroke-width="3"');
    s += '<path d="M-30 -236 Q-20 -256 -6 -238 Q4 -260 14 -238 Q28 -254 32 -232 Q0 -246 -30 -236Z" fill="#7A4B2E"/>';
    // barbe
    s += '<path d="M-40 -186 Q-44 -146 0 -140 Q44 -146 40 -186 Q30 -166 0 -166 Q-30 -166 -40 -186Z" fill="#7A4B2E"/>';
    // yeux
    if(expr === "dort"){ s += chemin("M-26 -204 q8 6 16 0 M10 -204 q8 6 16 0", TRAIT, 3); }
    else [-17, 17].forEach(function(dx){ s += ovale(dx, -204, 9, 10, "#FFFFFF") + rond(dx + (expr === "triste" ? 0 : 1), -202, 5.5, "#2B2140") + rond(dx + 3, -205, 2, "#FFFFFF"); });
    // gros sourcils
    if(expr === "fache") s += chemin("M-32 -224 L-8 -214 M32 -224 L8 -214", "#5A3A22", 7);
    else if(expr === "triste") s += chemin("M-30 -214 L-8 -222 M30 -214 L8 -222", "#5A3A22", 7);
    else s += chemin("M-30 -220 Q-18 -228 -6 -220 M30 -220 Q18 -228 6 -220", "#5A3A22", 7);
    // nez et bouche
    s += ovale(0, -186, 10, 8, "#86B866", ' stroke="' + TRAIT + '" stroke-width="2"');
    if(expr === "triste") s += chemin("M-12 -164 q12 -9 24 0", "#4A2A1A", 3.5) + '<path d="M-26 -194 q-4 8 0 12 q4 -4 0 -12Z" fill="#7FD3FF"/>';
    else if(expr === "fache") s += chemin("M-14 -166 l28 0", "#4A2A1A", 4);
    else if(expr === "rire") s += '<path d="M-16 -172 Q0 -150 16 -172Z" fill="#8A2C4A"/>';
    else s += chemin("M-14 -170 q14 10 28 0", "#4A2A1A", 3.5);
    return s;
  }

  /* ---------- Zouli et les extraterrestres ---------- */
  var COUL_ALIEN = ["#7BE495", "#7FD3FF", "#FF9FD0", "#FFD23F"];
  function alien(opts){
    var o = (opts || "").split(","), pose = o[1] || "debout", expr = o[2] || "sourire", c = COUL_ALIEN[(+o[3] || 0) % 4], s = "";
    var fonce = "rgba(0,0,0,.18)";
    // trois petites jambes
    [-18, 0, 18].forEach(function(x){ s += chemin("M" + x + " -30 L" + (x * 1.2) + " -6", c, 11) + ovale(x * 1.2, -4, 9, 5, "#5A3A9A"); });
    // bras
    var b = { debout:[[-26,-62],[-40,-40]], joie:[[-26,-66],[-44,-100]], salut:[[-26,-62],[-40,-40]], surpris:[[-26,-66],[-40,-86]] }[pose] || [[-26,-62],[-40,-40]];
    var bd = pose === "salut" || pose === "joie" ? [[26,-66],[44,-100]] : pose === "surpris" ? [[26,-66],[40,-86]] : [[26,-62],[40,-40]];
    s += chemin("M" + b[0][0] + " " + b[0][1] + " L" + b[1][0] + " " + b[1][1], c, 9) + rond(b[1][0], b[1][1], 6, c);
    s += chemin("M" + bd[0][0] + " " + bd[0][1] + " L" + bd[1][0] + " " + bd[1][1], c, 9) + rond(bd[1][0], bd[1][1], 6, c);
    // corps en forme de poire, avec un petit ventre
    s += ovale(0, -54, 30, 30, c, ' stroke="' + TRAIT + '" stroke-width="2.5"') + ovale(0, -48, 18, 16, "rgba(255,255,255,.35)");
    // antennes
    [-1, 1].forEach(function(k){ s += chemin("M" + (k * 12) + " -146 Q" + (k * 22) + " -170 " + (k * 26) + " -184", TRAIT, 2.5) + rond(k * 26, -186, 7, "#FFD23F", ' stroke="' + TRAIT + '" stroke-width="2"'); });
    // grosse tête
    s += ovale(0, -112, 40, 36, c, ' stroke="' + TRAIT + '" stroke-width="2.5"');
    // grands yeux
    [-16, 16].forEach(function(x){ s += ovale(x, -116, 12, expr === "surpris" ? 16 : 14, "#FFFFFF", ' stroke="' + TRAIT + '" stroke-width="2"') + rond(x + 1, -113, 7.5, "#2B2140") + rond(x + 4, -117, 2.6, "#FFFFFF"); });
    s += ovale(-28, -98, 6, 3.5, "#FF7A8A", ' opacity=".5"') + ovale(28, -98, 6, 3.5, "#FF7A8A", ' opacity=".5"');
    if(expr === "rire") s += '<path d="M-12 -96 Q0 -80 12 -96Z" fill="#8A2C4A"/>';
    else if(expr === "surpris") s += ovale(0, -92, 5, 6, "#8A2C4A");
    else s += chemin("M-10 -96 q10 8 20 0", TRAIT, 2.6);
    if(o[4] === "rap"){
      s += '<path d="M-38 -128 Q-30 -152 0 -152 Q30 -152 38 -128Z" fill="#E5484D" stroke="' + TRAIT + '" stroke-width="2"/><path d="M28 -134 L58 -128 L56 -122 L30 -126Z" fill="#E5484D" stroke="' + TRAIT + '" stroke-width="2"/>';
      s += '<rect x="-30" y="-124" width="24" height="15" rx="6" fill="#1A1A24"/><rect x="6" y="-124" width="24" height="15" rx="6" fill="#1A1A24"/><rect x="-6" y="-120" width="12" height="3" fill="#1A1A24"/>';
      s += '<path d="M-16 -82 Q0 -66 16 -82" fill="none" stroke="#FFD23F" stroke-width="4"/>' + rond(0, -70, 6, "#FFD23F", ' stroke="' + TRAIT + '" stroke-width="1.5"');
      var m = bd[1]; s += '<rect x="' + (m[0] - 4) + '" y="' + (m[1] - 4) + '" width="8" height="22" rx="3" fill="#22232B"/>' + rond(m[0], m[1] - 8, 8, "#8A90A0", ' stroke="' + TRAIT + '" stroke-width="1.5"');
    }
    void fonce;
    return s;
  }
  /* ---------- la soucoupe volante ---------- */
  function soucoupe(opts){
    var o = (opts || "").split(","), s = "";
    if(o[1] === "rayon") s += '<path d="M-30 -40 L30 -40 L80 120 L-80 120Z" fill="#FFF3A0" opacity=".45"/>';
    s += ovale(0, -68, 44, 40, "#BFEFFF", ' stroke="' + TRAIT + '" stroke-width="3" opacity=".9"') + ovale(-14, -82, 12, 8, "#FFFFFF", ' opacity=".7"');
    s += rond(0, -60, 14, "#7BE495", ' stroke="' + TRAIT + '" stroke-width="2"') + rond(-5, -63, 3, "#2B2140") + rond(5, -63, 3, "#2B2140");
    s += ovale(0, -40, 100, 26, "#C9CED8", ' stroke="' + TRAIT + '" stroke-width="3"') + ovale(0, -46, 96, 12, "#E8ECF2");
    ["#FF4FB0", "#FFD23F", "#4CC9F0", "#7BE495", "#FF9F1C"].forEach(function(c, k){ s += rond(-64 + k * 32, -34, 7, c, ' stroke="' + TRAIT + '" stroke-width="1.5"'); });
    return s;
  }

  /* ---------- un pilote sur sa moto de cross ----------
     options : "couleur,numero,visage,pose,visible"  pose : roule | saut ; visible = 1 : on voit le visage (Youssouf) */
  function motoCross(opts){
    var o = (opts || "").split(","), col = o[0] || "#E5484D", num = o[1] || "", expr = o[2] || "rire", pose = o[3] || "roule", visible = o[4] === "1", peau = o[5] || "#C98E62";
    var s = "";
    if(pose === "saut") s += '<g transform="translate(0 -40) rotate(-14 0 -60)">';
    // lignes de vitesse
    [[-150,-120,-110],[-160,-90,-120],[-145,-60,-105]].forEach(function(l){ s += ligne(l[0], l[1], l[2], l[1], "rgba(255,255,255,.75)", 4); });
    // roues
    [[-72,-36],[74,-36]].forEach(function(w){ s += rond(w[0], w[1], 36, "#22232B") + rond(w[0], w[1], 36, "none", ' stroke="#55586A" stroke-width="6" stroke-dasharray="7 6"') + rond(w[0], w[1], 15, "#C9CED8") + rond(w[0], w[1], 5, "#55586A"); });
    // cadre, fourche, garde-boue, plaque
    s += chemin("M-72 -36 L-20 -70 L30 -70", "#9AA0AE", 8) + chemin("M74 -36 L50 -118", "#C9CED8", 9);
    s += '<path d="M-110 -86 Q-80 -110 -40 -100 L-30 -82 Q-70 -86 -110 -86Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += '<path d="M-44 -102 L30 -104 Q40 -96 34 -84 L-34 -80Z" fill="#22232B"/>';
    s += '<path d="M-30 -80 L32 -84 L44 -64 L-14 -52Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += '<path d="M56 -78 Q90 -84 110 -64 Q86 -66 60 -66Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += ovale(58, -110, 18, 14, "#FFFFFF", ' stroke="' + TRAIT + '" stroke-width="2"') + '<text x="58" y="-104" text-anchor="middle" font-size="16" font-weight="700" fill="' + TRAIT + '" font-family="Fredoka, Arial, sans-serif">' + num + "</text>";
    s += chemin("M36 -128 L62 -134", "#22232B", 6);
    // le pilote
    s += chemin("M-6 -100 L22 -82 L4 -56", "#F4F4F4", 15) + ovale(10, -52, 16, 8, "#22232B");   // jambe + botte
    s += '<path d="M-22 -104 Q-12 -160 22 -158 L30 -150 Q8 -132 6 -100Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2" stroke-linejoin="round"/>'; // dos
    s += '<text x="0" y="-122" text-anchor="middle" font-size="16" font-weight="700" fill="#FFFFFF" font-family="Fredoka, Arial, sans-serif">' + num + "</text>";
    s += chemin("M18 -150 L40 -132 L56 -132", col, 12) + rond(57, -132, 6.5, "#22232B");          // bras + gant
    // casque (avec le visage visible pour Youssouf)
    s += rond(30, -182, 27, col, ' stroke="' + TRAIT + '" stroke-width="2.5"');
    if(visible){ s += '<path d="M36 -192 Q58 -190 56 -170 Q48 -162 34 -166Z" fill="' + peau + '"/>' +
      '<rect x="36" y="-196" width="22" height="10" rx="5" fill="#4CC9F0" stroke="' + TRAIT + '" stroke-width="2"/>' +
      (expr === "peur" || expr === "surpris" ? ovale(49, -172, 3, 3.5, "#8A2C4A") : chemin("M42 -174 q7 6 13 0", TRAIT, 2.2)); }
    else s += '<path d="M34 -196 Q60 -194 56 -170 Q46 -164 34 -168Z" fill="#2B2B3A"/>';
    s += '<path d="M8 -204 Q30 -218 56 -200 L58 -192 Q32 -206 8 -196Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>';
    s += '<path d="M44 -170 L66 -164 L58 -156 L40 -160Z" fill="' + col + '" stroke="' + TRAIT + '" stroke-width="2"/>';   // mentonnière
    if(pose === "saut") s += "</g>";
    return s;
  }
  /* le podium (1er au milieu, 2e à gauche, 3e à droite) */
  function podium(){
    return '<rect x="-140" y="-70" width="100" height="70" fill="#C9CED8" stroke="' + TRAIT + '" stroke-width="3"/><text x="-90" y="-22" text-anchor="middle" font-size="40" font-weight="700" fill="' + TRAIT + '" font-family="Fredoka, Arial">2</text>' +
      '<rect x="-40" y="-110" width="100" height="110" fill="#FFD23F" stroke="' + TRAIT + '" stroke-width="3"/><text x="10" y="-50" text-anchor="middle" font-size="46" font-weight="700" fill="' + TRAIT + '" font-family="Fredoka, Arial">1</text>' +
      '<rect x="60" y="-46" width="100" height="46" fill="#E09A5A" stroke="' + TRAIT + '" stroke-width="3"/><text x="110" y="-12" text-anchor="middle" font-size="34" font-weight="700" fill="' + TRAIT + '" font-family="Fredoka, Arial">3</text>';
  }

  var MIKAEL = { peau:"#C98E62", cheveux:"#22150F" }; // couleurs de Mikael : faciles à changer ici
  var COPAINS = [
    { peau:"#F2C9A0", cheveux:"#E0A43A", haut:"#E5484D" },
    { peau:"#8D5B3C", cheveux:"#1E1410", haut:"#3FA34D" },
    { peau:"#E8B98E", cheveux:"#6B3E23", haut:"#8E5BC4" }
  ];
  window.DESSINS = {
    // couleurs de Mikael : faciles à changer ici
    mikael: function(opts){ return enfant(opts, MIKAEL); },
    mikaelLit: function(opts){ return lit(opts, MIKAEL); },
    copain1: function(opts){ return enfant(opts, COPAINS[0]); },
    copain2: function(opts){ return enfant(opts, COPAINS[1]); },
    copain3: function(opts){ return enfant(opts, COPAINS[2]); },
    balou: balou,
    grognon: grognon,
    zouli: alien,
    soucoupe: soucoupe,
    etoile: function(opts){ return enfant(opts, { peau:"#E8B98E", cheveux:"#4A2C1A", longs:true }); },
    aleyah: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F", longs:true }); },
    copine1: function(opts){ return enfant(opts, { peau:"#F2C9A0", cheveux:"#E0A43A", longs:true }); },
    copine2: function(opts){ return enfant(opts, { peau:"#8D5B3C", cheveux:"#1E1410", longs:true }); },
    // l'histoire « La princesse Amira et la petite sorcière »
    amira: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F", longs:true }); },
    sorciere: function(opts){ return enfant(opts, { peau:"#F2C9A0", cheveux:"#C8502E", longs:true }); },
    chevalier: function(opts){ return enfant(opts, { peau:"#E8B98E", cheveux:"#6B3E23" }); },
    baba: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F" }); },
    maman: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#4A2C1A", longs:true }); },
    // l'histoire « Maman revient d'Espagne »
    yusuf: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F", haut:"#FF9F1C" }); },
    jahyan: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F", haut:"#2BB3C0" }); },
    nono: function(opts){ return enfant(opts, { peau:"#E8B98E", cheveux:"#C9CED8" }); },
    nona: function(opts){ return enfant(opts, { peau:"#E8B98E", cheveux:"#D9DDE5", longs:true }); },
    // l'histoire de motocross
    youssouf: function(opts){ return enfant(opts, { peau:"#C98E62", cheveux:"#22150F" }); },
    moto: motoCross,
    podium: podium,
    pilote: function(opts){ var o = (opts || "").split(","), c = o[3] || "#3D7BD9"; return enfant(o.slice(0, 3).join(","), { peau:"#E8B98E", cheveux:"#22150F", haut:c, casque:c }); }
  };
  // hauteur dessinée (unités) de chaque personnage, pour la mise à l'échelle
  window.DESSINS_HAUTEUR = { balou:200, grognon:250, mikaelLit:200, zouli:190, soucoupe:110, moto:230, podium:120 };
})();
