/* Tous les objets de « Ma petite ville ». Chaque objet est dessiné avec le point (0,0) en bas au milieu.
   w, h : taille ; surf : endroits où l'on peut poser des choses [x1, x2, y] ; sieges : places assises/couchées {x, y, pose} ;
   action : ce qui se passe quand on touche ; mange : ça se mange ; porte : on peut le tenir dans la main ;
   vet : ça s'enfile sur un personnage ; mural : reste accroché au mur ; couche : 0 tapis, 1 meuble, 2 objet. */
(function(){
  "use strict";
  function R(x, y, w, h, rx, f, ex){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function C(x, y, r, f, ex){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function E(x, y, rx, ry, f, ex){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function P(d, f, ex){ return '<path d="' + d + '" fill="' + f + '"' + (ex || "") + "/>"; }
  function L(d, s, w){ return '<path d="' + d + '" fill="none" stroke="' + s + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function T(x, y, t, s){ return '<text x="' + x + '" y="' + y + '" font-size="' + (s || 40) + '" text-anchor="middle">' + t + "</text>"; }
  var O = {};
  function add(id, def){ def.id = id; def.couche = def.couche === undefined ? (def.cat === "meuble" ? 1 : 2) : def.couche; O[id] = def; }

  /* ===================== la cuisine ===================== */
  add("frigo", { nom: "Frigo", cat: "meuble", w: 170, h: 380, surf: [[-80, 80, -380]], action: "frigo",
    d: function(e){ var s = R(-85, -380, 170, 380, 22, "#E8F4FF") + R(-85, -380, 170, 380, 22, "none", ' stroke="#B9CDE0" stroke-width="5"') + L("M-82 -250 L82 -250", "#B9CDE0", 5) + R(52, -350, 10, 70, 5, "#9AA0AE") + R(52, -230, 10, 90, 5, "#9AA0AE");
      if(e.on) s += R(-78, -244, 156, 236, 10, "#FFF9E6") + L("M-78 -170 L78 -170 M-78 -90 L78 -90", "#D9E6F2", 5) + T(-40, -180, "🧃", 44) + T(30, -182, "🧀", 40) + T(-30, -100, "🥕", 40) + T(32, -100, "🍓", 40) + T(0, -20, "🥚", 36) + R(-85, -244, 20, 236, 6, "#D0E4F5");
      s += C(-50, -320, 12, "#FF6F9F") + C(-20, -300, 10, "#FFD23F") + C(10, -322, 9, "#7BE495"); return s; } });
  add("cuisiniere", { nom: "Cuisinière", cat: "meuble", w: 170, h: 180, surf: [[-82, 82, -180]], action: "feu",
    d: function(e){ var s = R(-85, -180, 170, 180, 12, "#F4F4F8") + R(-70, -130, 140, 100, 10, "#2B2F45") + R(-58, -120, 116, 76, 8, e.on ? "#FF9F1C" : "#444A66", e.on ? ' opacity=".7"' : "") + R(-50, -150, 100, 8, 4, "#9AA0AE");
      s += R(-85, -186, 170, 10, 4, "#C9CED8") + C(-40, -170, 4, "#22232B") + C(40, -170, 4, "#22232B");
      if(e.on) s += P("M-40 -186 q-8 -14 0 -26 q8 12 0 26 Z M40 -186 q-8 -14 0 -26 q8 12 0 26 Z", "#FF6A00");
      return s; } });
  add("plan", { nom: "Plan de travail", cat: "meuble", w: 220, h: 170, surf: [[-108, 108, -170]],
    d: function(){ return R(-110, -170, 220, 170, 8, "#8EC5FF") + R(-114, -178, 228, 14, 5, "#F4F0FF") + R(-100, -150, 96, 130, 8, "#7AB4F0") + R(4, -150, 96, 130, 8, "#7AB4F0") + C(-14, -90, 5, "#F4F0FF") + C(14, -90, 5, "#F4F0FF"); } });
  add("evier", { nom: "Évier", cat: "meuble", w: 220, h: 170, surf: [[-108, -20, -170], [60, 108, -170]], action: "eau",
    d: function(e){ var s = R(-110, -170, 220, 170, 8, "#8EC5FF") + R(-114, -178, 228, 14, 5, "#F4F0FF") + R(-10, -176, 76, 12, 5, "#C9CED8") + L("M40 -176 L40 -226 Q40 -236 30 -236 L14 -236", "#9AA0AE", 9) + R(-100, -150, 200, 130, 8, "#7AB4F0");
      if(e.on) s += R(10, -232, 8, 56, 4, "#7FD3FF", ' opacity=".85"') + E(14, -178, 18, 5, "#BFE8FF");
      return s; } });
  add("table", { nom: "Table", cat: "meuble", w: 280, h: 150, surf: [[-136, 136, -150]],
    d: function(){ return R(-140, -152, 280, 18, 8, "#E0A26A") + R(-140, -138, 280, 8, 4, "#C4834F") + R(-122, -134, 18, 134, 6, "#C4834F") + R(104, -134, 18, 134, 6, "#C4834F"); } });
  add("chaise", { nom: "Chaise", cat: "meuble", w: 100, h: 220, sieges: [{ x: 0, y: -110, pose: "assis" }],
    d: function(){ return R(-44, -224, 14, 224, 6, "#C4834F") + R(-44, -224, 88, 70, 12, "#E0A26A") + R(-48, -120, 96, 16, 6, "#E0A26A") + R(30, -110, 14, 110, 6, "#C4834F") + R(-44, -110, 14, 110, 6, "#C4834F"); } });
  add("assiette", { nom: "Assiette", cat: "objet", w: 70, h: 14, porte: true, surf: [[-28, 28, -10]], d: function(){ return E(0, -7, 35, 8, "#FFFFFF", ' stroke="#C9CED8" stroke-width="3"') + E(0, -9, 20, 4, "#EEF2F8"); } });
  add("casserole", { nom: "Casserole", cat: "objet", w: 100, h: 56, porte: true, d: function(){ return R(-40, -50, 80, 50, 10, "#E5484D") + R(-44, -56, 88, 12, 6, "#C23B40") + R(40, -48, 40, 10, 5, "#22232B"); } });
  add("verre", { nom: "Verre de lait", cat: "nourriture", w: 34, h: 52, porte: true, mange: true, d: function(){ return P("M-15 -52 L15 -52 L12 0 L-12 0 Z", "#FFFFFF", ' stroke="#C9CED8" stroke-width="3"') + R(-13, -36, 26, 34, 3, "#F4F8FF"); } });

  /* ===================== à manger (dans la main ou dans la bouche) ===================== */
  var NOURRITURE = [["pomme", "Pomme", "🍎"], ["banane", "Banane", "🍌"], ["fraise", "Fraise", "🍓"], ["carotte", "Carotte", "🥕"], ["pain", "Pain", "🥖"], ["fromage", "Fromage", "🧀"],
    ["gateau", "Gâteau", "🍰"], ["pizza", "Pizza", "🍕"], ["glace", "Glace", "🍦"], ["bonbon", "Bonbon", "🍬"], ["sandwich", "Sandwich", "🥪"], ["oeuf", "Œuf", "🥚"], ["cookie", "Biscuit", "🍪"],
    ["raisin", "Raisin", "🍇"], ["pasteque", "Pastèque", "🍉"], ["jus", "Jus", "🧃"], ["lait", "Lait", "🥛"], ["croissant", "Croissant", "🥐"], ["poulet", "Poulet", "🍗"], ["brocoli", "Brocoli", "🥦"],
    ["frites", "Frites", "🍟"], ["donut", "Beignet", "🍩"], ["sucette", "Sucette", "🍭"], ["orange", "Orange", "🍊"]];
  NOURRITURE.forEach(function(n){ add(n[0], { nom: n[1], cat: "nourriture", w: 56, h: 56, porte: true, mange: true, d: function(){ return T(0, -8, n[2], 56); } }); });

  /* ===================== le salon ===================== */
  add("canape", { nom: "Canapé", cat: "meuble", w: 380, h: 200, sieges: [{ x: -90, y: -100, pose: "assis" }, { x: 0, y: -100, pose: "assis" }, { x: 90, y: -100, pose: "assis" }],
    d: function(){ return R(-170, -200, 340, 120, 40, "#8E5BC4") + R(-190, -130, 380, 110, 30, "#A06CD5") + R(-190, -150, 50, 130, 24, "#7B4BB0") + R(140, -150, 50, 130, 24, "#7B4BB0") + R(-140, -116, 280, 26, 13, "#B98AE6") + R(-170, -22, 20, 22, 4, "#5A3A7A") + R(150, -22, 20, 22, 4, "#5A3A7A"); } });
  add("fauteuil", { nom: "Fauteuil", cat: "meuble", w: 170, h: 190, sieges: [{ x: 0, y: -96, pose: "assis" }],
    d: function(){ return R(-70, -190, 140, 110, 36, "#FF9F1C") + R(-85, -124, 170, 104, 28, "#FFB347") + R(-85, -144, 34, 124, 17, "#E5861A") + R(51, -144, 34, 124, 17, "#E5861A") + R(-60, -22, 14, 22, 4, "#8A5A3B") + R(46, -22, 14, 22, 4, "#8A5A3B"); } });
  add("meubleTv", { nom: "Meuble télé", cat: "meuble", w: 240, h: 100, surf: [[-116, 116, -100]],
    d: function(){ return R(-120, -100, 240, 100, 10, "#C4834F") + R(-108, -84, 100, 70, 8, "#B07A4A") + R(8, -84, 100, 70, 8, "#B07A4A") + C(-20, -50, 5, "#F4D6B0") + C(20, -50, 5, "#F4D6B0"); } });
  add("tele", { nom: "Télé", cat: "objet", w: 200, h: 140, action: "tele",
    d: function(e){ var s = R(-14, -20, 28, 20, 4, "#22232B") + R(-50, -8, 100, 8, 4, "#22232B") + R(-100, -140, 200, 124, 12, "#22232B");
      if(e.on){ var i = (e.n || 0) % 4;
        s += R(-90, -130, 180, 104, 6, ["#7FD3FF", "#FFE08A", "#B9F0A8", "#FFC2DE"][i]);
        s += [T(0, -52, "🦄", 64), T(0, -52, "🚀", 64), T(0, -52, "🐶", 64), T(0, -52, "⚽", 64)][i] + E(-56, -40, 30, 10, "#7BE495") + E(56, -40, 26, 8, "#7BE495");
      } else s += R(-90, -130, 180, 104, 6, "#3A3F5C") + L("M-70 -116 L-40 -116", "#5A6080", 6);
      return s; } });
  add("lampe", { nom: "Lampe", cat: "meuble", w: 90, h: 300, action: "lampe",
    d: function(e){ return (e.on ? E(0, -240, 110, 90, "#FFF3A0", ' opacity=".45"') : "") + E(0, -8, 40, 10, "#5A5F6E") + R(-5, -230, 10, 224, 5, "#5A5F6E") + P("M-44 -220 L44 -220 L28 -296 L-28 -296 Z", e.on ? "#FFE27A" : "#F4E3B0"); } });
  add("tapis", { nom: "Tapis", cat: "meuble", couche: 0, w: 360, h: 40, sol: true, d: function(){ return E(0, -20, 180, 22, "#FF8FB8") + E(0, -20, 150, 16, "#FFB3C6") + E(0, -20, 100, 10, "#FF8FB8"); } });
  add("plante", { nom: "Plante", cat: "meuble", w: 120, h: 230,
    d: function(){ return P("M-40 -80 L40 -80 L30 0 L-30 0 Z", "#E07A3A") + R(-46, -90, 92, 16, 6, "#C9632A") + E(-30, -150, 28, 60, "#3FA34D", ' transform="rotate(-25 -30 -150)"') + E(30, -150, 28, 60, "#4FBF5C", ' transform="rotate(25 30 -150)"') + E(0, -180, 26, 56, "#2F8A3A"); } });
  add("etagere", { nom: "Étagère", cat: "meuble", w: 200, h: 320, surf: [[-90, 90, -14], [-90, 90, -112], [-90, 90, -210], [-96, 96, -320]],
    d: function(){ return R(-100, -320, 200, 320, 8, "#C4834F") + R(-90, -310, 180, 92, 4, "#A86E3E") + R(-90, -210, 180, 92, 4, "#A86E3E") + R(-90, -110, 180, 92, 4, "#A86E3E") +
      R(-80, -206, 14, 80, 3, "#E5484D") + R(-64, -200, 14, 74, 3, "#3D7BD9") + R(-48, -210, 14, 84, 3, "#FFD23F") + R(-32, -196, 12, 70, 3, "#3FA34D", ' transform="rotate(12 -26 -160)"'); } });
  add("radio", { nom: "Radio", cat: "objet", w: 110, h: 80, porte: true, action: "musique",
    d: function(e){ return R(-55, -70, 110, 70, 14, "#3FA34D") + C(-22, -34, 22, "#22232B") + C(-22, -34, 9, "#5A5F6E") + R(8, -56, 36, 16, 4, "#F4F0FF") + C(30, -22, 7, "#FFD23F") + L("M-40 -70 L-50 -100", "#22232B", 4) + (e.on ? T(50, -96, "🎵", 34) + T(-6, -110, "🎶", 28) : ""); } });
  add("cadre", { nom: "Tableau", cat: "objet", mural: true, w: 150, h: 120, d: function(){ return R(-75, -120, 150, 120, 6, "#C4834F") + R(-63, -108, 126, 96, 3, "#BFE8FF") + P("M-63 -12 L-20 -64 L10 -30 L30 -52 L63 -12 Z", "#7BCB6B") + C(36, -86, 12, "#FFD23F"); } });
  add("horloge", { nom: "Horloge", cat: "objet", mural: true, w: 100, h: 100, d: function(){ var d = new Date(), h = (d.getHours() % 12 + d.getMinutes() / 60) * 30, m = d.getMinutes() * 6;
    return C(0, -50, 48, "#FFFFFF", ' stroke="#E5484D" stroke-width="8"') + '<g transform="rotate(' + h + ' 0 -50)">' + L("M0 -50 L0 -76", "#22232B", 6) + "</g>" + '<g transform="rotate(' + m + ' 0 -50)">' + L("M0 -50 L0 -88", "#22232B", 4) + "</g>" + C(0, -50, 5, "#22232B"); } });

  /* ===================== la chambre ===================== */
  add("lit", { nom: "Lit", cat: "meuble", w: 330, h: 200, surf: [[-150, 150, -112]], sieges: [{ x: -20, y: -96, pose: "couche" }, { x: 0, y: -96, pose: "assis" }],
    d: function(){ return R(-165, -200, 30, 200, 10, "#8E5BC4") + R(135, -140, 30, 140, 10, "#8E5BC4") + R(-150, -110, 300, 60, 14, "#FFFFFF") + R(-150, -70, 300, 40, 8, "#7B4BB0") +
      E(-108, -116, 38, 20, "#FFF3D6") + P("M-70 -122 Q40 -136 150 -120 L150 -78 L-70 -78 Z", "#4CC9F0") + T(-10, -96, "⭐", 22) + T(60, -100, "⭐", 22) + T(110, -92, "⭐", 18); } });
  add("litBebe", { nom: "Lit de bébé", cat: "meuble", w: 200, h: 170, sieges: [{ x: -36, y: -66, pose: "couche" }],
    d: function(){ var s = R(-100, -170, 200, 16, 8, "#FFB3C6") + R(-100, -60, 200, 16, 8, "#FFB3C6") + R(-100, -170, 14, 170, 7, "#FF8FB8") + R(86, -170, 14, 170, 7, "#FF8FB8") + R(-86, -70, 172, 18, 6, "#FFF3D6");
      for(var x = -70; x < 86; x += 22) s += R(x, -156, 8, 98, 4, "#FFB3C6"); return s; } });
  add("armoire", { nom: "Armoire", cat: "meuble", w: 220, h: 400, surf: [[-104, 104, -400]], action: "armoire",
    d: function(e){ var s = R(-110, -400, 220, 400, 14, "#FFB3C6") + R(-110, -24, 220, 24, 6, "#FF8FB8");
      if(e.on) s += R(-98, -386, 196, 356, 8, "#FFF0F6") + L("M-90 -350 L90 -350", "#C4834F", 6) + P("M-70 -350 L-40 -350 L-34 -260 L-76 -260 Z", "#3D7BD9") + P("M-20 -350 L14 -350 L28 -230 L-34 -230 Z", "#FF6F9F") + P("M34 -350 L70 -350 L72 -270 L32 -270 Z", "#FFD23F") + R(-80, -120, 50, 40, 8, "#E5484D") + R(-10, -112, 60, 32, 8, "#8E5BC4");
      else s += R(-100, -390, 96, 356, 10, "#FFC7D8") + R(4, -390, 96, 356, 10, "#FFC7D8") + C(-16, -210, 7, "#C9632A") + C(16, -210, 7, "#C9632A");
      return s; } });
  add("bureau", { nom: "Bureau", cat: "meuble", w: 220, h: 150, surf: [[-106, 106, -150]],
    d: function(){ return R(-110, -152, 220, 18, 6, "#4CC9F0") + R(-104, -134, 16, 134, 6, "#2EA6CF") + R(30, -134, 74, 120, 8, "#2EA6CF") + R(36, -120, 62, 40, 6, "#7FD3FF") + R(36, -74, 62, 50, 6, "#7FD3FF"); } });
  add("lampeChevet", { nom: "Petite lampe", cat: "objet", w: 70, h: 100, action: "lampe", porte: true,
    d: function(e){ return (e.on ? C(0, -76, 60, "#FFF3A0", ' opacity=".45"') : "") + E(0, -6, 26, 7, "#8E5BC4") + R(-4, -60, 8, 56, 4, "#8E5BC4") + P("M-30 -56 L30 -56 L20 -100 L-20 -100 Z", e.on ? "#FFE27A" : "#FFD9F0"); } });
  add("ballon", { nom: "Ballon", cat: "objet", w: 70, h: 70, porte: true, roule: true, d: function(){ return T(0, -8, "⚽", 66); } });
  add("nounours", { nom: "Nounours", cat: "objet", w: 80, h: 90, porte: true, d: function(){ return T(0, -8, "🧸", 84); } });
  add("livre", { nom: "Livre", cat: "objet", w: 60, h: 50, porte: true, d: function(){ return T(0, -6, "📕", 52); } });
  add("crayons", { nom: "Crayons", cat: "objet", w: 60, h: 60, porte: true, d: function(){ return T(0, -6, "🖍️", 54); } });
  add("guitare", { nom: "Guitare", cat: "objet", w: 70, h: 120, porte: true, action: "guitare", d: function(){ return T(0, -8, "🎸", 100); } });
  add("console", { nom: "Manette", cat: "objet", w: 60, h: 46, porte: true, d: function(){ return T(0, -6, "🎮", 48); } });
  add("telephone", { nom: "Téléphone", cat: "objet", w: 40, h: 60, porte: true, action: "sonnerie", d: function(){ return T(0, -6, "📱", 50); } });
  add("cadeau", { nom: "Cadeau", cat: "objet", w: 70, h: 70, porte: true, action: "cadeau", d: function(e){ return e.on ? T(0, -8, "🎉", 62) : T(0, -8, "🎁", 66); } });
  add("poupee", { nom: "Poupée", cat: "objet", w: 50, h: 70, porte: true, d: function(){ return T(0, -8, "🪆", 60); } });
  add("robotJouet", { nom: "Robot", cat: "objet", w: 60, h: 70, porte: true, d: function(){ return T(0, -8, "🤖", 60); } });
  add("dino", { nom: "Dinosaure", cat: "objet", w: 70, h: 70, porte: true, d: function(){ return T(0, -8, "🦖", 66); } });

  /* ===================== la salle de bain ===================== */
  add("baignoire", { nom: "Baignoire", cat: "meuble", w: 320, h: 170, sieges: [{ x: 10, y: -60, pose: "assis" }], action: "bain", devant: true,
    d: function(e){ var s = R(-150, -150, 300, 130, 40, "#FFFFFF", ' stroke="#C9CED8" stroke-width="5"') + R(-130, -24, 24, 24, 6, "#FFD23F") + R(106, -24, 24, 24, 6, "#FFD23F") + L("M120 -150 L120 -196 Q120 -206 108 -206 L96 -206", "#9AA0AE", 8);
      if(e.on){ for(var i = 0; i < 9; i++) s += C(-120 + i * 30, -150 + (i % 2) * 8, 22 + (i % 3) * 4, "#E8F6FF", ' stroke="#BFE8FF" stroke-width="2"'); s += T(-60, -200, "🫧", 34) + T(70, -218, "🫧", 28); }
      return s; } });
  add("douche", { nom: "Douche", cat: "meuble", w: 160, h: 440, action: "eau", couche: 0,
    d: function(e){ var s = R(-80, -20, 160, 20, 6, "#C9CED8") + L("M60 -20 L60 -420 Q60 -436 44 -436 L0 -436", "#9AA0AE", 8) + E(0, -426, 34, 12, "#9AA0AE") + R(-80, -440, 8, 420, 4, "#BFE8FF", ' opacity=".6"');
      if(e.on) for(var i = 0; i < 7; i++) s += L("M" + (-24 + i * 8) + " -414 L" + (-40 + i * 13) + " -40", "#7FD3FF", 3);
      return s; } });
  add("toilettes", { nom: "Toilettes", cat: "meuble", w: 130, h: 230, sieges: [{ x: 0, y: -90, pose: "assis" }], action: "chasse",
    d: function(e){ return R(-56, -230, 112, 90, 14, "#FFFFFF", ' stroke="#C9CED8" stroke-width="4"') + R(20, -214, 22, 10, 4, "#C9CED8") + P("M-50 -100 L50 -100 L36 0 L-36 0 Z", "#FFFFFF", ' stroke="#C9CED8" stroke-width="4"') +
      E(0, -98, 62, 16, "#F4F4F8", ' stroke="#C9CED8" stroke-width="4"') + (e.on ? E(0, -98, 40, 8, "#7FD3FF") + T(50, -240, "💦", 34) : ""); } });
  add("lavabo", { nom: "Lavabo", cat: "meuble", w: 160, h: 380, surf: [[-74, -40, -170], [40, 74, -170]], action: "eau",
    d: function(e){ var s = R(-14, -150, 28, 150, 8, "#F4F4F8") + P("M-76 -176 L76 -176 Q70 -130 0 -130 Q-70 -130 -76 -176 Z", "#FFFFFF", ' stroke="#C9CED8" stroke-width="4"') + L("M0 -176 L0 -200 L-20 -200", "#9AA0AE", 7);
      s += R(-60, -380, 120, 160, 50, "#BFE8FF", ' stroke="#C9CED8" stroke-width="6"') + L("M-30 -350 L-10 -370 M-30 -320 L10 -360", "#FFFFFF", 6);
      if(e.on) s += R(-24, -198, 6, 26, 3, "#7FD3FF"); return s; } });
  add("brosseDents", { nom: "Brosse à dents", cat: "objet", w: 50, h: 50, porte: true, d: function(){ return T(0, -6, "🪥", 46); } });
  add("savon", { nom: "Savon", cat: "objet", w: 50, h: 40, porte: true, action: "bulles", d: function(e){ return T(0, -6, "🧼", 42) + (e.on ? T(20, -46, "🫧", 30) : ""); } });
  add("canard", { nom: "Canard de bain", cat: "objet", w: 56, h: 56, porte: true, action: "coincoin", d: function(){ return T(0, -6, "🐤", 52); } });

  /* ===================== les animaux ===================== */
  add("chien", { nom: "Chien", cat: "animal", w: 120, h: 110, porte: true, animal: "chien", d: function(){ return T(0, -8, "🐕", 110); } });
  add("chat", { nom: "Chat", cat: "animal", w: 100, h: 100, porte: true, animal: "chat", d: function(){ return T(0, -8, "🐈", 96); } });
  add("lapin", { nom: "Lapin", cat: "animal", w: 80, h: 90, porte: true, animal: "lapin", d: function(){ return T(0, -8, "🐇", 84); } });
  add("poisson", { nom: "Poisson rouge", cat: "animal", w: 90, h: 100, animal: "poisson", d: function(){ return R(-44, -96, 88, 96, 30, "#BFE8FF", ' stroke="#9AD3F0" stroke-width="4"') + T(0, -26, "🐠", 50); } });
  add("canardParc", { nom: "Canard", cat: "animal", w: 90, h: 90, porte: true, animal: "canard", d: function(){ return T(0, -8, "🦆", 84); } });
  add("perroquet", { nom: "Perroquet", cat: "animal", w: 80, h: 90, porte: true, animal: "oiseau", d: function(){ return T(0, -8, "🦜", 84); } });

  /* ===================== l'école ===================== */
  add("tableau", { nom: "Tableau noir", cat: "meuble", mural: true, w: 440, h: 250, action: "tableau",
    d: function(e){ var s = R(-220, -250, 440, 230, 10, "#C4834F") + R(-204, -236, 408, 200, 6, "#2F5D3A") + R(-120, -24, 240, 16, 6, "#A86E3E") + R(-80, -32, 30, 10, 3, "#FFFFFF") + R(-30, -32, 30, 10, 3, "#FFD23F");
      var dessins = ['<text x="0" y="-120" text-anchor="middle" font-size="64" fill="#FFFFFF" font-family="Fredoka, sans-serif">A B C</text>', '<text x="0" y="-120" text-anchor="middle" font-size="60" fill="#FFFFFF" font-family="Fredoka, sans-serif">1 + 2 = 3</text>',
        L("M-120 -80 L-60 -170 L0 -80 Z M40 -90 Q80 -190 140 -90", "#FFFFFF", 6) + C(100, -180, 20, "none", ' stroke="#FFD23F" stroke-width="6"'), '<text x="0" y="-120" text-anchor="middle" font-size="56" fill="#FFFFFF" font-family="Fredoka, sans-serif">Bonjour !</text>', ""];
      return s + dessins[(e.n || 0) % dessins.length]; } });
  add("pupitre", { nom: "Pupitre", cat: "meuble", w: 160, h: 140, surf: [[-76, 76, -140]], d: function(){ return R(-80, -142, 160, 16, 6, "#FFD23F") + R(-70, -126, 140, 40, 6, "#E0B12A") + R(-64, -90, 12, 90, 5, "#9AA0AE") + R(52, -90, 12, 90, 5, "#9AA0AE"); } });
  add("chaiseEcole", { nom: "Petite chaise", cat: "meuble", w: 90, h: 180, sieges: [{ x: 0, y: -90, pose: "assis" }], d: function(){ return R(-38, -180, 76, 54, 12, "#E5484D") + R(-42, -100, 84, 14, 6, "#E5484D") + R(-38, -90, 10, 90, 4, "#9AA0AE") + R(28, -90, 10, 90, 4, "#9AA0AE") + R(-38, -130, 10, 40, 4, "#9AA0AE"); } });
  add("globe", { nom: "Globe", cat: "objet", w: 80, h: 110, porte: true, action: "tourne", d: function(e){ return E(0, -6, 30, 7, "#8A5A3B") + R(-4, -30, 8, 26, 3, "#8A5A3B") + '<g transform="rotate(' + ((e.n || 0) * 40) + ' 0 -70)">' + T(0, -44, "🌍", 76) + "</g>"; } });
  add("cartable", { nom: "Cartable", cat: "objet", w: 80, h: 80, porte: true, d: function(){ return T(0, -8, "🎒", 74); } });
  add("ciseaux", { nom: "Ciseaux", cat: "objet", w: 50, h: 50, porte: true, d: function(){ return T(0, -6, "✂️", 46); } });
  add("panier", { nom: "Panier de basket", cat: "meuble", w: 160, h: 420, d: function(){ return R(-8, -420, 16, 420, 6, "#5A5F6E") + R(-70, -430, 140, 96, 8, "#FFFFFF", ' stroke="#E5484D" stroke-width="5"') + E(0, -326, 44, 10, "none", ' stroke="#FF6A00" stroke-width="7"') + L("M-40 -324 L-28 -270 M0 -320 L0 -266 M40 -324 L28 -270", "#FFFFFF", 3); } });
  add("ballonBasket", { nom: "Ballon de basket", cat: "objet", w: 64, h: 64, porte: true, roule: true, d: function(){ return T(0, -6, "🏀", 60); } });

  /* ===================== le magasin ===================== */
  add("rayon", { nom: "Rayon", cat: "meuble", w: 300, h: 360, surf: [[-140, 140, -20], [-140, 140, -130], [-140, 140, -240], [-150, 150, -360]],
    d: function(){ return R(-150, -360, 300, 360, 10, "#FFD9A8") + R(-150, -360, 300, 20, 8, "#FF9F1C") + R(-144, -28, 288, 12, 4, "#E5861A") + R(-144, -138, 288, 12, 4, "#E5861A") + R(-144, -248, 288, 12, 4, "#E5861A"); } });
  add("caisse", { nom: "Caisse", cat: "meuble", w: 260, h: 190, surf: [[-126, 40, -150]], action: "caisse",
    d: function(e){ return R(-130, -150, 260, 150, 10, "#3D7BD9") + R(-126, -156, 252, 12, 5, "#2B5FB0") + R(-120, -140, 160, 10, 4, "#22232B") + R(60, -230, 66, 80, 10, "#5A5F6E") + R(68, -222, 50, 28, 4, e.on ? "#7BE495" : "#A9DEFF") +
      (e.on ? '<text x="93" y="-202" font-size="18" text-anchor="middle" fill="#1D2357" font-family="sans-serif" font-weight="700">MERCI</text>' + T(40, -250, "✨", 34) : ""); } });
  add("caddie", { nom: "Chariot", cat: "objet", w: 200, h: 190, surf: [[-80, 70, -70]], roule: true, vehicule: true, sieges: [{ x: -20, y: -110, pose: "assis" }],
    d: function(){ var s = P("M-90 -170 L90 -170 L70 -70 L-70 -70 Z", "none", ' stroke="#9AA0AE" stroke-width="8" stroke-linejoin="round"');
      for(var x = -60; x <= 60; x += 30) s += L("M" + x + " -168 L" + (x * .8) + " -72", "#C9CED8", 4); s += L("M-86 -138 L84 -138 M-80 -104 L78 -104", "#C9CED8", 4);
      return s + L("M90 -170 L114 -196", "#9AA0AE", 8) + R(108, -206, 30, 14, 6, "#E5484D") + L("M-60 -70 L-60 -30 L70 -30 L70 -70", "#9AA0AE", 6) + C(-56, -14, 14, "#22232B") + C(64, -14, 14, "#22232B"); } });
  add("congelateur", { nom: "Glaces", cat: "meuble", w: 260, h: 170, surf: [[-124, 124, -170]], d: function(){ return R(-130, -170, 260, 170, 14, "#BFE8FF") + R(-118, -160, 236, 60, 10, "#E8F6FF") + T(-70, -110, "🍦", 40) + T(0, -110, "🍨", 40) + T(70, -110, "🍧", 40) + R(-130, -40, 260, 40, 10, "#9AD3F0"); } });
  add("sac", { nom: "Sac de courses", cat: "objet", w: 90, h: 100, porte: true, surf: [[-34, 34, -40]], d: function(){ return P("M-40 -80 L40 -80 L34 0 L-34 0 Z", "#F2D49A") + L("M-20 -80 Q0 -112 20 -80", "#C4834F", 6); } });

  /* ===================== le salon de beauté et la boutique ===================== */
  add("fauteuilCoiffeur", { nom: "Fauteuil de coiffeur", cat: "meuble", w: 170, h: 250, sieges: [{ x: 0, y: -126, pose: "assis" }],
    d: function(){ return R(-60, -250, 120, 110, 30, "#E5484D") + R(-76, -150, 152, 46, 18, "#FF6F9F") + R(-80, -170, 26, 70, 12, "#C23B40") + R(54, -170, 26, 70, 12, "#C23B40") + R(-8, -104, 16, 80, 6, "#9AA0AE") + E(0, -14, 60, 14, "#9AA0AE"); } });
  add("miroir", { nom: "Miroir magique", cat: "meuble", mural: true, w: 200, h: 260, action: "relooking",
    d: function(){ return E(0, -130, 100, 130, "#FFD23F") + E(0, -130, 86, 116, "#BFE8FF") + L("M-40 -200 L-10 -230 M-50 -160 L10 -224", "#FFFFFF", 8) + T(64, -228, "✨", 40) + T(-66, -50, "✨", 30); } });
  add("secheCheveux", { nom: "Sèche-cheveux", cat: "objet", w: 70, h: 70, porte: true, action: "souffle", d: function(e){ return T(0, -8, "💨", e.on ? 70 : 0) + R(-30, -60, 50, 30, 14, "#FF6F9F") + R(-24, -36, 16, 34, 6, "#E0457A") + C(22, -45, 9, "#C23B40"); } });
  add("vernis", { nom: "Vernis", cat: "objet", w: 40, h: 50, porte: true, d: function(){ return T(0, -6, "💅", 44); } });
  add("rougeLevres", { nom: "Rouge à lèvres", cat: "objet", w: 40, h: 50, porte: true, maquillage: "levres", d: function(){ return T(0, -6, "💄", 44); } });
  add("portant", { nom: "Portant d'habits", cat: "meuble", w: 360, h: 340, d: function(){ return L("M-170 0 L-170 -330 L170 -330 L170 0", "#9AA0AE", 10) + E(-170, -4, 30, 8, "#5A5F6E") + E(170, -4, 30, 8, "#5A5F6E"); } });
  // les habits : on les pose sur un personnage pour l'habiller
  var HABITS = [["habitRobeRose", "Robe rose", { haut: "robe", couleurHaut: "#FF6F9F" }, "👗"], ["habitRobeJaune", "Robe jaune", { haut: "robe", couleurHaut: "#FFD23F" }, "👗", "#FFD23F"],
    ["habitTshirtBleu", "T-shirt bleu", { haut: "tshirt", couleurHaut: "#3D7BD9" }, "👕"], ["habitTshirtRouge", "T-shirt rouge", { haut: "tshirt", couleurHaut: "#E5484D" }, "👕", "#E5484D"],
    ["habitPull", "Pull vert", { haut: "pull", couleurHaut: "#3FA34D" }, "🧥", "#3FA34D"], ["habitChemise", "Chemise", { haut: "chemise", couleurHaut: "#8EC5FF" }, "👔"],
    ["habitJean", "Pantalon", { bas: "pantalon", couleurBas: "#3D7BD9" }, "👖"], ["habitShort", "Short", { bas: "short", couleurBas: "#E5484D" }, "🩳"], ["habitJupe", "Jupe", { bas: "jupe", couleurBas: "#8E5BC4" }, ""],
    ["chapeauSoleil", "Chapeau", { accessoire: "chapeau" }, "👒"], ["casquette", "Casquette", { accessoire: "casquette" }, "🧢"], ["couronne", "Couronne", { accessoire: "couronne" }, "👑"],
    ["lunettes", "Lunettes", { accessoire: "lunettes" }, "👓"], ["solaires", "Lunettes de soleil", { accessoire: "solaires" }, "🕶️"], ["noeud", "Nœud", { accessoire: "noeud" }, "🎀"], ["bonnet", "Bonnet", { accessoire: "bonnet" }, "🧶"],
    ["pansement", "Pansement", { pansement: true }, "🩹"]];
  HABITS.forEach(function(h){ add(h[0], { nom: h[1], cat: "habit", w: 70, h: 70, porte: false, vet: h[2], mural: false,
    d: function(){ return (h[3] ? T(0, -8, h[3], 64) : '<path d="M-18 -60 L18 -60 L32 -8 Q0 0 -32 -8 Z" fill="#8E5BC4"/><path d="M-18 -60 L18 -60 L19 -50 L-19 -50 Z" fill="#6B3FA0"/>') + (h[4] ? C(26, -12, 11, h[4], ' stroke="#fff" stroke-width="3"') : ""); } }); });

  /* ===================== l'hôpital ===================== */
  add("litHopital", { nom: "Lit d'hôpital", cat: "meuble", w: 320, h: 220, sieges: [{ x: -20, y: -110, pose: "couche" }, { x: 0, y: -110, pose: "assis" }], roule: true,
    d: function(){ return R(-160, -220, 18, 200, 6, "#9AA0AE") + R(142, -170, 18, 150, 6, "#9AA0AE") + R(-150, -124, 300, 30, 10, "#FFFFFF", ' stroke="#C9CED8" stroke-width="3"') + R(-150, -96, 300, 20, 6, "#9AA0AE") +
      E(-110, -130, 34, 16, "#E8F6FF") + P("M-70 -134 Q40 -146 150 -132 L150 -100 L-70 -100 Z", "#7FD3FF") + C(-130, -10, 12, "#22232B") + C(130, -10, 12, "#22232B") + L("M-130 -20 L-130 -76 M130 -20 L130 -76", "#9AA0AE", 8); } });
  add("radiographie", { nom: "Machine à radio", cat: "meuble", w: 220, h: 400, action: "radio",
    d: function(e){ var s = R(-10, -400, 20, 400, 8, "#9AA0AE") + E(0, -6, 70, 12, "#5A5F6E") + R(-110, -390, 220, 200, 14, "#22283A") + R(-96, -376, 192, 172, 8, e.on ? "#0E1626" : "#3A4560");
      if(e.on) s += C(0, -340, 18, "#EAF2FF") + R(-5, -320, 10, 60, 4, "#EAF2FF") + L("M-26 -310 L26 -310 M-24 -296 L24 -296 M-22 -282 L22 -282", "#EAF2FF", 5) + L("M-6 -260 L-14 -214 M6 -260 L14 -214 M-30 -312 L-46 -270 M30 -312 L46 -270", "#EAF2FF", 7);
      else s += T(0, -270, "🦴", 54);
      return s; } });
  add("fauteuilRoulant", { nom: "Fauteuil roulant", cat: "objet", w: 170, h: 200, roule: true, vehicule: true, sieges: [{ x: 0, y: -100, pose: "assis" }],
    d: function(){ return R(-50, -200, 14, 120, 6, "#3D7BD9") + R(-60, -110, 120, 20, 8, "#3D7BD9") + C(-30, -56, 54, "none", ' stroke="#22232B" stroke-width="10"') + C(-30, -56, 8, "#9AA0AE") + C(58, -14, 14, "#22232B") + L("M-50 -200 L-70 -210", "#22232B", 8) + L("M40 -96 L58 -28", "#9AA0AE", 6); } });
  add("thermometre", { nom: "Thermomètre", cat: "objet", w: 40, h: 60, porte: true, d: function(){ return T(0, -6, "🌡️", 54); } });
  add("stethoscope", { nom: "Stéthoscope", cat: "objet", w: 60, h: 60, porte: true, action: "boumboum", d: function(){ return T(0, -6, "🩺", 54); } });
  add("medicament", { nom: "Sirop", cat: "nourriture", w: 40, h: 60, porte: true, mange: true, d: function(){ return T(0, -6, "🧴", 50); } });
  add("ambulance", { nom: "Ambulance", cat: "objet", w: 300, h: 190, roule: true, vehicule: true, sieges: [{ x: 70, y: -80, pose: "assis" }], action: "sirene",
    d: function(e){ return R(-150, -170, 210, 140, 12, "#FFFFFF", ' stroke="#C9CED8" stroke-width="4"') + P("M60 -130 L110 -130 L150 -80 L150 -30 L60 -30 Z", "#FFFFFF", ' stroke="#C9CED8" stroke-width="4"') + P("M70 -120 L104 -120 L134 -84 L70 -84 Z", "#BFE8FF") +
      R(-110, -140, 60, 20, 4, "#E5484D") + R(-90, -160, 20, 60, 4, "#E5484D") + R(-150, -80, 300, 14, 4, "#E5484D") + R(-30, -186, 40, 18, 6, e.on && (e.n % 2) ? "#3D7BD9" : "#E5484D") + C(-90, -26, 26, "#22232B") + C(100, -26, 26, "#22232B") + C(-90, -26, 10, "#C9CED8") + C(100, -26, 10, "#C9CED8"); } });

  /* ===================== le parc ===================== */
  add("arbre", { nom: "Arbre", cat: "meuble", w: 300, h: 460, surf: [[-110, -30, -300]], d: function(){ return P("M-26 0 L-18 -300 L18 -300 L26 0 Z", "#8A5A3B") + L("M0 -260 L-80 -300", "#8A5A3B", 18) + C(0, -360, 110, "#3FA34D") + C(-90, -320, 70, "#4FBF5C") + C(90, -320, 80, "#2F8A3A") + C(40, -420, 60, "#4FBF5C") + C(-40, -300, 8, "#E5484D") + C(60, -360, 8, "#E5484D") + C(-20, -420, 8, "#E5484D"); } });
  add("balancoire", { nom: "Balançoire", cat: "meuble", w: 300, h: 420, sieges: [{ x: 0, y: -100, pose: "assis" }], action: "balance",
    d: function(e){ return L("M-140 0 L-110 -410 L110 -410 L140 0", "#E5484D", 16) + L("M-110 -410 L-80 0 M110 -410 L80 0", "#E5484D", 10) + '<g class="' + (e.on ? "balance" : "") + '">' + L("M-40 -404 L-40 -108 M40 -404 L40 -108", "#5A5F6E", 4) + R(-56, -112, 112, 16, 6, "#FFD23F") + "</g>"; } });
  add("toboggan", { nom: "Toboggan", cat: "meuble", w: 360, h: 380, sieges: [{ x: -120, y: -320, pose: "assis" }], surf: [[-160, -80, -320]],
    d: function(){ var s = L("M-150 0 L-150 -330 M-90 0 L-90 -330", "#3D7BD9", 12); for(var y = -40; y > -320; y -= 50) s += L("M-150 " + y + " L-90 " + y, "#3D7BD9", 8);
      return s + R(-164, -334, 84, 18, 6, "#2B5FB0") + P("M-86 -330 Q0 -300 60 -120 Q90 -30 180 -20 L180 0 Q70 4 40 -100 Q-14 -280 -86 -300 Z", "#FFD23F"); } });
  add("banc", { nom: "Banc", cat: "meuble", w: 300, h: 180, sieges: [{ x: -70, y: -90, pose: "assis" }, { x: 70, y: -90, pose: "assis" }],
    d: function(){ return R(-150, -180, 300, 20, 6, "#C4834F") + R(-150, -146, 300, 20, 6, "#C4834F") + R(-150, -96, 300, 24, 8, "#E0A26A") + R(-130, -76, 16, 76, 6, "#5A5F6E") + R(114, -76, 16, 76, 6, "#5A5F6E") + R(-130, -180, 12, 90, 4, "#5A5F6E") + R(118, -180, 12, 90, 4, "#5A5F6E"); } });
  add("bacSable", { nom: "Bac à sable", cat: "meuble", couche: 0, w: 380, h: 70, surf: [[-170, 170, -40]], d: function(){ return R(-190, -70, 380, 70, 14, "#C4834F") + R(-176, -56, 352, 50, 10, "#F2D49A") + C(-80, -44, 22, "#E8C27E") + C(60, -40, 26, "#E8C27E"); } });
  add("seau", { nom: "Seau", cat: "objet", w: 60, h: 60, porte: true, d: function(){ return T(0, -6, "🪣", 56); } });
  add("pelle", { nom: "Pelle", cat: "objet", w: 50, h: 70, porte: true, d: function(){ return R(-4, -70, 8, 46, 4, "#E5484D") + P("M-16 -26 L16 -26 L10 0 L-10 0 Z", "#FF9F1C"); } });
  add("fontaine", { nom: "Fontaine", cat: "meuble", w: 280, h: 300, action: "eau", surf: [[-130, 130, -60]],
    d: function(e){ var s = E(0, -40, 140, 40, "#9AA0AE") + E(0, -50, 120, 26, "#7FD3FF") + R(-16, -230, 32, 180, 8, "#C9CED8") + E(0, -230, 60, 18, "#9AA0AE");
      if(e.on) s += P("M0 -240 Q-60 -300 -100 -60 M0 -240 Q60 -300 100 -60 M0 -240 L0 -290", "none", ' stroke="#7FD3FF" stroke-width="8" stroke-linecap="round"');
      return s; } });
  add("velo", { nom: "Vélo", cat: "objet", w: 220, h: 160, roule: true, vehicule: true, sieges: [{ x: -20, y: -100, pose: "assis" }],
    d: function(){ return C(-70, -50, 46, "none", ' stroke="#22232B" stroke-width="10"') + C(70, -50, 46, "none", ' stroke="#22232B" stroke-width="10"') + L("M-70 -50 L-20 -120 L50 -120 L70 -50 M-20 -120 L0 -50 L50 -120 M-70 -50 L0 -50", "#3FA34D", 10) +
      R(-46, -132, 52, 14, 7, "#22232B") + L("M50 -120 L44 -150 L70 -156", "#22232B", 8); } });
  add("standGlace", { nom: "Marchand de glaces", cat: "meuble", w: 300, h: 380, surf: [[-140, 140, -170]],
    d: function(){ var s = R(-150, -170, 300, 170, 12, "#FFB3C6") + R(-140, -380, 14, 210, 6, "#9AA0AE") + R(126, -380, 14, 210, 6, "#9AA0AE");
      for(var i = 0; i < 6; i++) s += P("M" + (-160 + i * 54) + " -350 L" + (-106 + i * 54) + " -350 L" + (-106 + i * 54) + " -300 Q" + (-133 + i * 54) + " -280 " + (-160 + i * 54) + " -300 Z", i % 2 ? "#FFFFFF" : "#FF6F9F");
      return s + R(-164, -380, 328, 34, 10, "#FF6F9F") + T(0, -60, "🍦", 70); } });
  add("voiture", { nom: "Voiture", cat: "objet", w: 300, h: 160, roule: true, vehicule: true, sieges: [{ x: -40, y: -70, pose: "assis" }, { x: 50, y: -70, pose: "assis" }], action: "klaxon",
    d: function(){ return P("M-150 -40 L-150 -80 Q-146 -100 -110 -100 L-70 -150 Q-60 -160 -40 -160 L60 -160 Q80 -160 90 -146 L120 -100 Q150 -96 150 -70 L150 -40 Z", "#E5484D") +
      P("M-60 -146 L-10 -146 L-10 -104 L-92 -104 Z M2 -146 L56 -146 Q66 -146 72 -138 L96 -104 L2 -104 Z", "#BFE8FF", ' opacity=".7"') + C(-90, -36, 30, "#22232B") + C(90, -36, 30, "#22232B") + C(-90, -36, 12, "#C9CED8") + C(90, -36, 12, "#C9CED8") + E(142, -80, 8, 10, "#FFE27A"); } });

  window.OBJETS = O;
  window.CATALOGUE = [["meuble", "🛋️", "Meubles"], ["nourriture", "🍎", "À manger"], ["objet", "🧸", "Objets"], ["habit", "👗", "Habits"], ["animal", "🐶", "Animaux"]];
})();
