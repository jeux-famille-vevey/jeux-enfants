/* Les histoires. Chaque page : { s: scène, l: [[qui, texte], …] }
   Scène : { f: fond, p: [[emoji, x, y, taille, animation]] }  (x, y en % de l'image ; animation : "saut", "balance", "vole", "")
   Personnage dessiné en entier : ["@mikael", x, y, taille, animation, "tenue,pose,visage"] (voir persos.js)
   Fonds : prairie, jardin, foret, nuit, chambre, route, pluie, village, ferme, ecole, stade, dojo, chambreVide, vevey, piscine, plage, espace
   cache:true : le livre n'apparaît pas encore dans la bibliothèque (aperçu avec histoires/?livre=<id>)
   Personnages : voix (hauteur, vitesse) et couleur du texte.
   vx : voix enregistrée (jessica, pierre, siwis, miro) avec un décalage en demi-tons, ex. "siwis+3".
   Après avoir ajouté ou modifié une histoire : lancer outils/enregistrer-histoires.py pour refaire les enregistrements. */
window.LIVRES = [
{
  id:"zouli", cache:true, titre:"Les extraterrestres de Vevey", auteur:"Une histoire imaginée par Aleyah", couverture:{ f:"vevey", p:[["@soucoupe",62,28,13,"vole","x,rayon"],["@zouli",44,80,20,"saut","x,joie,rire,0"],["@etoile",22,80,23,"","heros,debout,sourire"]] }, age:"4-10 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, zouli:{ nom:"Zouli", h:1.6, v:1.05, c:"#7BE495", vx:"jessica+6" }, etoile:{ nom:"Super Étoile", h:1.2, v:.95, c:"#FF8FD0", vx:"siwis" },
           gens:{ nom:"Les gens de Vevey", h:.9, v:1.1, c:"#FFD23F", vx:"miro" } },
  pages:[
    { s:{ f:"vevey", p:[["@copain1",28,82,20,"","foot,debout,sourire"],["@copain3",44,84,19,"balance","ecole,debout,rire"]] }, l:[["narr","Un matin, à Vevey, le soleil brillait sur le lac."],["narr","Les gens se promenaient sur le quai, tout près de la grande fourchette plantée dans l'eau."]] },
    { s:{ f:"vevey", p:[["@soucoupe",30,30,12,"vole","x,rayon"],["@soucoupe",72,20,9,"vole","x"],["@zouli",34,84,16,"saut","x,joie,rire,0"],["@zouli",50,85,14,"saut","x,salut,sourire,1"]] }, l:[["narr","Tout à coup, des soucoupes volantes apparurent dans le ciel !"],["narr","Des dizaines de petits extraterrestres descendirent sur le quai."]] },
    { s:{ f:"vevey", p:[["@copain1",20,82,20,"saut","foot,peur,surpris"],["@copain2",36,84,19,"saut","ecole,peur,surpris"],["@zouli",74,83,17,"","x,debout,surpris,2"]] }, l:[["gens","« Au secours ! Des extraterrestres ! Ils viennent nous attaquer ! »"],["narr","Tout le monde eut très peur et courut se cacher."]] },
    { s:{ f:"vevey", p:[["@zouli",28,83,17,"balance","x,salut,rire,0"],["@zouli",50,85,16,"saut","x,joie,sourire,1"],["@zouli",72,83,17,"balance","x,salut,sourire,3"]] }, l:[["narr","Mais les extraterrestres avaient l'air tout étonnés."],["narr","Ils agitaient leurs petites antennes… et ils souriaient."]] },
    { s:{ f:"vevey", p:[["@etoile",58,46,25,"vole","heros,vol,sourire"],["@zouli",24,85,16,"","x,debout,surpris,0"]] }, l:[["narr","Alors, dans le ciel, une cape rose apparut. C'était Super Étoile, la super-héroïne de Vevey !"],["etoile","« N'ayez pas peur, je m'en occupe ! »"]] },
    { s:{ f:"vevey", p:[["@etoile",34,83,25,"","heros,debout,sourire"],["@zouli",62,85,17,"","x,debout,sourire,0"]] }, l:[["narr","Super Étoile se posa devant le plus petit des extraterrestres. Elle ne se battit pas : elle lui posa une question."],["etoile","« Bonjour. Pourquoi êtes-vous venus sur la Terre ? »"]] },
    { s:{ f:"vevey", p:[["@etoile",22,84,23,"","heros,debout,surpris"],["@zouli",54,83,21,"balance","x,salut,rire,0"]] }, l:[["zouli","« Bip bip ! Je m'appelle Zouli. Nous ne sommes pas méchants ! »"],["zouli","« Sur notre planète, nous sommes tout seuls. Nous voulons juste… avoir des amis. »"]] },
    { s:{ f:"vevey", p:[["@etoile",22,83,24,"saut","heros,joie,rire"],["@copain1",44,85,18,"","foot,debout,sourire"],["@copain2",58,85,18,"","ecole,salut,sourire"],["@zouli",78,84,17,"saut","x,joie,rire,0"]] }, l:[["etoile","« Des amis ? Ça, on sait faire, à Vevey ! »"],["narr","Un par un, les gens sortirent de leurs cachettes et dirent bonjour aux extraterrestres."]] },
    { s:{ f:"stade", p:[["@zouli",30,80,17,"saut","x,joie,rire,1"],["⚽",50,76,6,"vole"],["@copain2",66,82,19,"","foot,tir,rire"],["@zouli",84,82,16,"","x,debout,sourire,2"]] }, l:[["narr","L'après-midi, tout le monde joua au foot. Avec leurs trois jambes, les extraterrestres couraient très vite !"],["zouli","« But ! Bip bip ! »"]] },
    { s:{ f:"piscine", p:[["@zouli",36,62,18,"vole","x,joie,rire,0"],["@copain1",64,70,19,"vole","foot,vol,rire"],["❤️",48,30,6,"vole"],["❤️",58,22,5,"vole"]] }, l:[["narr","Ensuite, ils plongèrent tout au fond de la piscine."],["narr","Les extraterrestres savaient faire des bulles en forme de cœur !"]] },
    { s:{ f:"plage", p:[["🏰",52,82,22,""],["@zouli",30,86,16,"saut","x,joie,rire,3"],["@copain3",76,86,18,"","ecole,joie,rire"],["@etoile",88,86,18,"","heros,salut,sourire"]] }, l:[["narr","À la plage, ils construisirent un château de sable géant, avec des tours… et des antennes."]] },
    { s:{ f:"espace", p:[["@soucoupe",48,56,17,"vole","x"],["🚀",22,70,8,"vole"]] }, l:[["narr","Et depuis ce jour, les habitants de Vevey et les extraterrestres font des voyages ensemble."],["narr","Sur la Lune, sur Mars… et retour à Vevey pour le goûter !"]] },
    { s:{ f:"nuit", p:[["@etoile",38,82,24,"","heros,debout,rire"],["@zouli",60,84,18,"saut","x,joie,rire,0"],["❤️",49,36,8,"vole"]] }, l:[["etoile","« Tu vois, il ne faut pas avoir peur de ceux qui sont différents. »"],["zouli","« Bip bip ! Merci, mon amie ! »"],["narr","Et tout Vevey devint ami avec les extraterrestres. Fin."]] }
  ],
  quiz:[ { q:"Pourquoi les extraterrestres sont-ils venus sur la Terre ?", c:["Pour attaquer","Pour avoir des amis","Pour boire le lac"], r:1 }, { q:"Comment s'appelle le petit extraterrestre ?", c:["Zouli","Balou","Pompon"], r:0 },
         { q:"Qu'ont-ils construit à la plage ?", c:["🏰","🚗","🍕"], r:0 }, { q:"Combien de jambes ont les extraterrestres ?", c:["2","3","4"], r:1 } ]
},
{
  id:"mikael", titre:"Mikael et le ballon magique", couverture:{ f:"stade", p:[["@mikael",32,74,25,"saut","foot,joie,rire"],["@balou",56,44,12,"vole",",,rire"],["@grognon",80,72,30,"","x,joie,rire"]] }, age:"3-6 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, mikael:{ nom:"Mikael", h:1.4, v:1, c:"#4CC9F0", vx:"siwis+3" }, balou:{ nom:"Balou", h:1.6, v:1.05, c:"#FFD23F", vx:"jessica+5" },
           grognon:{ nom:"Le géant Grognon", h:.55, v:.8, c:"#6FD08C", vx:"miro-4" } },
  pages:[
    { s:{ f:"chambre", p:[["@mikael",42,74,28,"saut","foot,joie,rire"],["⚽",62,82,8,""],["🥋",82,62,10,"balance"]] }, l:[["narr","Voici Mikael. Il a cinq ans et il est en 2P."],["narr","Mikael adore jouer au foot, faire du taekwondo… et aller à l'école."]] },
    { s:{ f:"ecole", p:[["@mikael",30,76,26,"","ecole,debout,surpris"],["@balou",66,74,10,"balance",",,rire"]] }, l:[["narr","Un matin, à l'école, Mikael voit un ballon qui brille sous un banc."],["balou","« Bonjour, Mikael ! Je suis Balou, le ballon magique ! »"],["mikael","« Un ballon qui parle ? Waouh ! »"]] },
    { s:{ f:"stade", p:[["@mikael",32,76,28,"","foot,joie,rire"],["@balou",60,54,12,"vole",",,rire"]] }, l:[["balou","« Le géant Grognon a pris tous les ballons des enfants. Plus personne ne peut jouer ! Veux-tu m'aider ? »"],["mikael","« Oui ! Je suis prêt ! »"]] },
    { s:{ f:"foret", p:[["@mikael",30,78,25,"","foot,court,sourire"],["@balou",46,48,9,"vole",",,rire"],["🪧",68,72,16,""]] }, l:[["narr","Pouf ! Balou emmène Mikael dans la forêt magique. Sur un panneau, il y a des lettres."],["mikael","« G… R… O… C'est le chemin de Grognon ! »"],["narr","Heureusement, Mikael a bien appris ses lettres à l'école."]] },
    { s:{ f:"foret", p:[["🌊",34,88,15,"balance"],["🌊",50,88,15,""],["🌊",66,88,15,"balance"],["@mikael",50,62,24,"saut","foot,saut,rire"],["@balou",84,50,9,"vole",",,rire"]] }, l:[["narr","Mais voilà une grande rivière !"],["narr","Mikael fait comme au taekwondo : il salue, il respire, il se concentre… et il saute. Hop !"],["mikael","« J'ai réussi ! Je suis de l'autre côté ! »"]] },
    { s:{ f:"nuit", p:[["⛰️",86,72,34,""],["🌳",58,66,34,""],["🔑",60,30,8,"balance"],["🔒",82,78,10,""],["@mikael",24,78,25,"","foot,tir,sourire"],["@balou",42,50,8,"vole",",,rire"]] }, l:[["narr","Devant la grotte du géant, les ballons sont enfermés. La clé est accrochée tout en haut d'un arbre."],["balou","« Vise bien, Mikael ! »"],["narr","Mikael tire, comme au foot. Pan ! La clé tombe. Clic ! La porte s'ouvre."]] },
    { s:{ f:"nuit", p:[["@mikael",24,78,24,"","foot,peur,surpris"],["@grognon",64,78,35,"balance","x,fache,fache"],["@balou",38,46,8,"vole",",,surpris"]] }, l:[["grognon","« Qui est là ? »"],["narr","Mikael a un peu peur. Mais il respire bien fort."],["mikael","« Bonjour, Monsieur Grognon. Pourquoi avez-vous pris tous les ballons ? »"]] },
    { s:{ f:"nuit", p:[["@mikael",26,78,24,"","foot,debout,sourire"],["@grognon",64,78,35,"","x,triste,triste"],["@balou",42,46,8,"vole",",,rire"]] }, l:[["grognon","« Parce que personne ne veut jouer avec moi. Je suis trop grand… »"],["mikael","« Moi, je veux bien jouer avec toi ! Mais il faut rendre les ballons. »"],["grognon","« C'est promis ! »"]] },
    { s:{ f:"stade", p:[["@grognon",84,76,30,"balance","x,gardien,rire"],["@copain1",14,78,19,"saut","foot,joie,rire"],["@copain2",26,80,19,"","foot,joie,rire"],["@mikael",44,78,24,"","foot,tir,rire"],["⚽",64,62,6,"vole"],["🎉",52,26,9,"vole"]] }, l:[["narr","Le samedi, tous les enfants jouent un grand match. Grognon est le gardien de but."],["narr","Mikael respire, se concentre… et tire. But !"],["grognon","« Bravo, petit champion ! C'est la première fois que je joue avec des amis ! »"]] },
    { s:{ f:"chambreVide", p:[["@mikaelLit",79,80,20,"",",,dort"],["@balou",20,80,8,"balance",",,rire"],["💤",66,36,8,"vole"]] }, l:[["balou","« Merci, Mikael. Grâce à toi, tous les enfants peuvent jouer. Tu es un vrai héros ! »"],["narr","Ce soir-là, Mikael s'endort en souriant. Peut-être qu'une nouvelle aventure l'attend demain… Fin."]] }
  ],
  quiz:[ { q:"Comment s'appelle le ballon magique ?", c:["Balou","Pompon","Zoé"], r:0 }, { q:"Comment Mikael a-t-il traversé la rivière ?", c:["En bateau","Avec un saut de taekwondo","À la nage"], r:1 },
         { q:"Pourquoi le géant avait-il pris les ballons ?", c:["Il avait faim","Personne ne jouait avec lui","Il aimait les couleurs"], r:1 } ]
},
{
  id:"pompon", titre:"Pompon et la carotte géante", couverture:{ f:"jardin", p:[["🐰",30,72,22,"saut"],["🥕",62,66,30,"balance"]] }, age:"3-6 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, pompon:{ nom:"Pompon", h:1.5, v:1, c:"#FF8FB8", vx:"siwis+3" }, herisson:{ nom:"Hérisson", h:1.25, v:.95, c:"#FF9F1C", vx:"miro+3" },
           poule:{ nom:"Poulette", h:1.8, v:1.05, c:"#FFD23F", vx:"jessica+5" }, ours:{ nom:"Gros Ours", h:.6, v:.8, c:"#C9A27A", vx:"miro-4" } },
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
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, zoe:{ nom:"Zoé", h:1.45, v:1.05, c:"#FF6F9F", vx:"siwis+3" }, camion:{ nom:"Grand Camion", h:.55, v:.8, c:"#4CC9F0", vx:"miro-4" }, tracteur:{ nom:"Tracteur", h:.8, v:.85, c:"#6FD08C", vx:"pierre" } },
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
  persos:{ narr:{ nom:"", h:1, v:.85, vx:"miro" }, petit:{ nom:"Petit Ours", h:1.4, v:1, c:"#C9A27A", vx:"siwis+4" }, maman:{ nom:"Maman Ourse", h:1.05, v:.85, c:"#FF8FB8", vx:"jessica" } },
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
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, chaton:{ nom:"Chaton", h:1.7, v:1, c:"#FFD23F", vx:"siwis+5" }, chien:{ nom:"Chien", h:.75, v:.95, c:"#C9A27A", vx:"miro-3" }, canard:{ nom:"Canard", h:1.3, v:1.1, c:"#6FD08C", vx:"pierre+3" },
           vache:{ nom:"Vache", h:.6, v:.8, c:"#FFF8E7", vx:"jessica-5" }, maman:{ nom:"Maman Chat", h:1.15, v:.9, c:"#FF8FB8", vx:"siwis-1" } },
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
