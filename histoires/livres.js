/* Les histoires. Chaque page : { s: scène, l: [[qui, texte], …] }
   Scène : { f: fond, p: [[emoji, x, y, taille, animation]] }  (x, y en % de l'image ; animation : "saut", "balance", "vole", "")
   Fonds : prairie, jardin, foret, nuit, chambre, route, pluie, village, ferme
   Personnages : voix (hauteur, vitesse) et couleur du texte. */
window.LIVRES = [
{
  id:"pompon", titre:"Pompon et la carotte géante", couverture:{ f:"jardin", p:[["🐰",30,72,22,"saut"],["🥕",62,66,30,"balance"]] }, age:"3-6 ans",
  persos:{ narr:{ nom:"", h:1, v:.9 }, pompon:{ nom:"Pompon", h:1.5, v:1, c:"#FF8FB8" }, herisson:{ nom:"Hérisson", h:1.25, v:.95, c:"#FF9F1C" },
           poule:{ nom:"Poulette", h:1.8, v:1.05, c:"#FFD23F" }, ours:{ nom:"Gros Ours", h:.6, v:.8, c:"#C9A27A" } },
  pages:[
    { s:{ f:"prairie", p:[["🐰",45,72,20,"saut"]] }, l:[["narr","Il était une fois un petit lapin qui s'appelait Pompon."],["narr","Pompon adorait les carottes."]] },
    { s:{ f:"jardin", p:[["🐰",28,74,18,""],["🥕",62,66,30,"balance"]] }, l:[["narr","Un matin, dans son jardin, Pompon trouva une carotte géante !"],["pompon","« Oh ! Qu'elle est grosse ! Je vais la tirer ! »"]] },
    { s:{ f:"jardin", p:[["🐰",48,72,18,"balance"],["🥕",62,66,30,""]] }, l:[["narr","Pompon tira, tira, tira… Mais la carotte ne bougea pas."],["pompon","« Je suis trop petit. J'ai besoin d'aide ! »"]] },
    { s:{ f:"jardin", p:[["🦔",22,76,15,"saut"],["🐰",44,74,18,""],["🥕",64,66,30,""]] }, l:[["narr","Hérisson passait par là."],["herisson","« Je vais t'aider, Pompon ! »"],["narr","Ils tirèrent à deux. Un, deux… La carotte ne bougea pas."]] },
    { s:{ f:"jardin", p:[["🐔",16,76,15,"saut"],["🦔",32,77,14,""],["🐰",48,74,17,""],["🥕",66,66,30,""]] }, l:[["narr","Poulette arriva en battant des ailes."],["poule","« Cot cot ! Moi aussi, je veux aider ! »"],["narr","Ils tirèrent à trois. Un, deux, trois… La carotte ne bougea toujours pas."]] },
    { s:{ f:"jardin", p:[["🐻",16,70,26,"saut"],["🐔",34,77,13,""],["🦔",46,78,12,""],["🐰",56,75,15,""],["🥕",74,66,28,""]] }, l:[["narr","Alors Gros Ours arriva, tout doucement."],["ours","« Hmmm… Une carotte géante ? Je vais vous aider, les amis. »"]] },
    { s:{ f:"jardin", p:[["🐻",18,70,24,"balance"],["🐔",34,76,13,"balance"],["🦔",45,77,12,"balance"],["🐰",56,74,15,"balance"],["🥕",76,58,30,"saut"]] }, l:[["narr","Ils tirèrent à quatre. Un, deux, trois, quatre… et…"],["narr","Pop ! La carotte géante sortit de la terre !"]] },
    { s:{ f:"prairie", p:[["🐻",20,70,22,""],["🐔",38,76,13,"saut"],["🍲",52,74,20,""],["🦔",66,77,12,"saut"],["🐰",80,74,15,"saut"]] }, l:[["narr","Avec la carotte géante, ils firent une grande soupe."],["pompon","« Merci, les amis ! Tout seul, je n'aurais pas réussi. »"],["narr","Et ils mangèrent tous ensemble. Fin."]] }
  ],
  quiz:[ { q:"Qu'est-ce que Pompon a trouvé dans son jardin ?", c:["🥕","🍎","🍌"], r:0 }, { q:"Qui est venu aider en dernier ?", c:["🐔","🐻","🦔"], r:1 }, { q:"Combien d'amis ont tiré la carotte ensemble ?", c:["2","3","4"], r:2 } ]
},
{
  id:"zoe", titre:"Zoé, la petite voiture rouge", couverture:{ f:"route", p:[["🚗",40,72,24,"saut"],["🚦",78,58,22,""]] }, age:"3-6 ans",
  persos:{ narr:{ nom:"", h:1, v:.9 }, zoe:{ nom:"Zoé", h:1.45, v:1.05, c:"#FF6F9F" }, camion:{ nom:"Grand Camion", h:.55, v:.8, c:"#4CC9F0" }, tracteur:{ nom:"Tracteur", h:.8, v:.85, c:"#6FD08C" } },
  pages:[
    { s:{ f:"route", p:[["🚗",40,74,20,"saut"]] }, l:[["narr","Zoé est une petite voiture rouge."],["zoe","« Vroum vroum ! J'adore rouler ! »"]] },
    { s:{ f:"route", p:[["🚗",22,76,16,""],["🚚",64,70,30,""]] }, l:[["narr","Sur la route, Zoé rencontre Grand Camion."],["camion","« Tu es bien petite pour rouler toute seule ! »"],["zoe","« Petite, mais rapide ! »"]] },
    { s:{ f:"route", p:[["🚗",36,76,18,""],["🚦",72,56,26,""]] }, l:[["narr","Voici un feu. Il est rouge."],["zoe","« Rouge, je m'arrête ! »"],["narr","Zoé attend bien sagement."]] },
    { s:{ f:"route", p:[["🚗",52,76,18,"saut"],["🚦",80,56,26,""]] }, l:[["narr","Le feu devient vert."],["zoe","« Vert, je peux rouler ! »"],["narr","Et Zoé repart. Vroum !"]] },
    { s:{ f:"pluie", p:[["🚗",40,76,18,"balance"]] }, l:[["narr","Tout à coup, il se met à pleuvoir."],["narr","Zoé allume ses phares et roule doucement."],["zoe","« Quand il pleut, je fais attention. »"]] },
    { s:{ f:"ferme", p:[["🚜",56,72,26,"balance"],["🚗",22,76,16,""]] }, l:[["narr","Près de la ferme, Tracteur est coincé dans la boue."],["tracteur","« Au secours ! Je n'arrive plus à avancer ! »"]] },
    { s:{ f:"ferme", p:[["🚗",30,76,16,""],["🚚",62,70,28,"saut"],["🚜",84,72,20,""]] }, l:[["narr","Zoé est trop petite pour tirer Tracteur."],["narr","Alors elle fonce chercher Grand Camion."],["zoe","« Grand Camion, viens vite, Tracteur a besoin d'aide ! »"]] },
    { s:{ f:"ferme", p:[["🚚",34,70,26,"balance"],["🚜",64,72,22,"saut"],["🚗",86,76,14,"saut"]] }, l:[["narr","Grand Camion tire, et hop ! Tracteur est sorti de la boue."],["tracteur","« Merci, Zoé ! Tu m'as sauvé ! »"]] },
    { s:{ f:"route", p:[["🚚",30,70,26,""],["🚗",64,76,18,"saut"]] }, l:[["camion","« Tu es petite, Zoé, mais tu as un grand cœur ! »"],["narr","Et depuis ce jour, Zoé et Grand Camion sont les meilleurs amis. Fin."]] }
  ],
  quiz:[ { q:"De quelle couleur est Zoé ?", c:["🔴","🔵","🟢"], r:0 }, { q:"Quand le feu est rouge, que fait Zoé ?", c:["Elle roule","Elle s'arrête","Elle klaxonne"], r:1 }, { q:"Qui était coincé dans la boue ?", c:["🚚","🚜","🚗"], r:1 } ]
},
{
  id:"ours", titre:"Petit Ours ne veut pas dormir", couverture:{ f:"nuit", p:[["🐻",44,72,22,"balance"],["🌙",80,22,16,""]] }, age:"2-5 ans",
  persos:{ narr:{ nom:"", h:1, v:.85 }, petit:{ nom:"Petit Ours", h:1.4, v:1, c:"#C9A27A" }, maman:{ nom:"Maman Ourse", h:1.05, v:.85, c:"#FF8FB8" } },
  pages:[
    { s:{ f:"nuit", p:[["🐻",44,74,20,"saut"]] }, l:[["narr","C'est le soir. Le soleil est parti se coucher."],["petit","« Moi, je ne veux pas dormir ! Je veux jouer ! »"]] },
    { s:{ f:"chambre", p:[["🐻",30,72,18,""],["🛁",62,74,22,""]] }, l:[["maman","« D'abord, un bon bain tout chaud. »"],["narr","Plouf ! Petit Ours fait des bulles."],["petit","« Mais je ne veux toujours pas dormir ! »"]] },
    { s:{ f:"chambre", p:[["🐻",36,72,18,"balance"],["👕",64,62,14,"vole"]] }, l:[["maman","« Maintenant, le pyjama. »"],["narr","Un bras, puis l'autre bras. Une jambe, puis l'autre jambe."]] },
    { s:{ f:"chambre", p:[["🐻",40,72,18,""],["🪥",60,60,14,"balance"]] }, l:[["maman","« Et on se brosse les dents. »"],["narr","En haut, en bas, et on rince. Brillantes !"]] },
    { s:{ f:"chambre", p:[["🐻",34,72,16,""],["📖",56,66,16,""],["🐻",74,70,22,""]] }, l:[["narr","Maman Ourse lit une histoire."],["petit","« Encore une ! Encore une ! »"],["maman","« Une seule, mon petit ours. »"]] },
    { s:{ f:"nuit", p:[["🐻",40,74,18,""],["⭐",20,20,8,"vole"],["⭐",50,14,7,"vole"],["⭐",76,26,8,"vole"]] }, l:[["narr","Par la fenêtre, Petit Ours regarde les étoiles."],["narr","Il les compte : une, deux, trois…"],["petit","« Quatre… cinq… mmm… »"]] },
    { s:{ f:"chambre", p:[["🐻",44,72,18,""],["💤",62,56,12,"vole"]] }, l:[["maman","« Bonne nuit, mon petit ours. Je t'aime. »"],["narr","Mais Petit Ours ne répond pas…"],["narr","Il dort déjà. Chut ! Fin."]] }
  ],
  quiz:[ { q:"Que fait Petit Ours en premier ?", c:["🛁","📖","🪥"], r:0 }, { q:"Que regarde Petit Ours par la fenêtre ?", c:["☀️","⭐","🌧️"], r:1 } ]
},
{
  id:"chaton", titre:"Le chaton qui cherchait sa maman", couverture:{ f:"village", p:[["🐱",44,74,20,"saut"],["🐶",74,74,16,""]] }, age:"2-5 ans",
  persos:{ narr:{ nom:"", h:1, v:.9 }, chaton:{ nom:"Chaton", h:1.7, v:1, c:"#FFD23F" }, chien:{ nom:"Chien", h:.75, v:.95, c:"#C9A27A" }, canard:{ nom:"Canard", h:1.3, v:1.1, c:"#6FD08C" },
           vache:{ nom:"Vache", h:.6, v:.8, c:"#FFF8E7" }, maman:{ nom:"Maman Chat", h:1.15, v:.9, c:"#FF8FB8" } },
  pages:[
    { s:{ f:"village", p:[["🐱",46,76,18,"balance"]] }, l:[["narr","Un petit chaton s'est perdu dans le village."],["chaton","« Miaou… Où est ma maman ? »"]] },
    { s:{ f:"village", p:[["🐱",28,76,16,""],["🐶",62,74,22,"saut"]] }, l:[["chaton","« Bonjour. Es-tu ma maman ? »"],["chien","« Ouaf ouaf ! Non, je suis un chien. Ta maman ne fait pas ouaf. »"]] },
    { s:{ f:"ferme", p:[["🐱",26,76,16,""],["🦆",62,76,20,"saut"]] }, l:[["chaton","« Bonjour. Es-tu ma maman ? »"],["canard","« Coin coin ! Non, je suis un canard. Ta maman ne fait pas coin coin. »"]] },
    { s:{ f:"ferme", p:[["🐱",24,77,15,""],["🐮",62,70,30,"balance"]] }, l:[["chaton","« Bonjour. Es-tu ma maman ? »"],["vache","« Meuh ! Non, je suis une vache. Ta maman ne fait pas meuh. »"]] },
    { s:{ f:"prairie", p:[["🐱",44,76,16,"balance"]] }, l:[["narr","Le petit chaton est triste."],["chaton","« Qui fait miaou comme moi ? »"]] },
    { s:{ f:"village", p:[["🐱",30,76,15,"saut"],["🐈",64,72,26,"saut"]] }, l:[["narr","Tout à coup, il entend : « Miaou ! Miaou ! »"],["maman","« Mon petit chaton ! Je te cherchais partout ! »"]] },
    { s:{ f:"chambre", p:[["🐈",44,72,24,""],["🐱",60,76,14,"balance"],["❤️",52,52,10,"vole"]] }, l:[["chaton","« Maman ! Tu fais miaou, comme moi ! »"],["narr","Et le petit chaton se blottit tout contre sa maman. Fin."]] }
  ],
  quiz:[ { q:"Que dit le chien ?", c:["Meuh","Ouaf ouaf","Coin coin"], r:1 }, { q:"Qui fait « meuh » ?", c:["🦆","🐮","🐶"], r:1 }, { q:"Qui est la maman du chaton ?", c:["🐈","🐶","🦆"], r:0 } ]
}
];
