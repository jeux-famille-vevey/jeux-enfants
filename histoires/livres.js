/* Les histoires. Chaque page : { s: scène, l: [[qui, texte], …] }
   Scène : { f: fond, p: [[emoji, x, y, taille, animation]] }  (x, y en % de l'image ; animation : "saut", "balance", "vole", "")
   Personnage dessiné en entier : ["@mikael", x, y, taille, animation, "tenue,pose,visage"] (voir persos.js)
   Fonds : prairie, jardin, foret, nuit, chambre, route, pluie, village, ferme, ecole, stade, dojo, chambreVide, vevey, veveySoir, piscine, plage, espace
   cache:true : le livre n'apparaît pas encore dans la bibliothèque (aperçu avec histoires/?livre=<id>)
   Personnages : voix (hauteur, vitesse) et couleur du texte.
   vx : voix enregistrée (jessica, pierre, siwis, miro) avec un décalage en demi-tons, ex. "siwis+3".
   Après avoir ajouté ou modifié une histoire : lancer outils/enregistrer-histoires.py pour refaire les enregistrements. */
window.LIVRES = [
{
  id:"motocross", cache:true, titre:"Youssouf, champion de motocross", auteur:"Une histoire écrite en famille",
  couverture:{ f:"cross", p:[["@moto",46,76,26,"vole","#FF9F1C,5,rire,saut,1"],["🏆",82,40,11,"balance"]] }, age:"3-8 ans",
  persos:{ narr:{ nom:"", h:1, v:.92, vx:"siwis" }, youssouf:{ nom:"Youssouf", h:1.2, v:1, c:"#FF9F1C", vx:"siwis+3" } },
  pages:[
    { s:{ f:"cross", p:[["@youssouf",30,84,23,"","cross,salut,rire"],["@moto",66,82,25,"","#FF9F1C,5,rire,roule,1"]] }, l:[["narr","Voici Youssouf. Il a cinq ans, il est en 2P… et il adore la motocross !"],["narr","Aujourd'hui, il va faire une course."]] },
    { s:{ f:"cross", p:[["@youssouf",42,84,24,"","cross,peur,surpris"]] }, l:[["narr","Youssouf est stressé. Il a un petit peu peur de sa course."],["youssouf","« J'ai un peu peur… »"]] },
    { s:{ f:"cross", p:[["@youssouf",42,84,24,"","cross,debout,sourire"],["💨",62,50,8,"vole"]] }, l:[["narr","Mais il respire très fort. Il se calme, et il se concentre."],["youssouf","« Je peux le faire ! »"]] },
    { s:{ f:"depart", p:[["@moto",22,80,20,"","#E5484D,7,rire,roule,0"],["@moto",46,80,20,"","#FF9F1C,5,rire,roule,1"],["@moto",70,80,20,"","#3D7BD9,3,rire,roule,0"]] }, l:[["narr","Bip… bip… bip ! La cloche sonne, et la barrière se couche."],["narr","C'est parti !"]] },
    { s:{ f:"cross", p:[["@moto",64,76,24,"vole","#FF9F1C,5,rire,saut,1"],["@moto",30,82,20,"","#E5484D,7,rire,roule,0"],["@moto",12,84,18,"","#3D7BD9,3,rire,roule,0"]] }, l:[["narr","Youssouf part à toute vitesse !"],["narr","Il dépasse le pilote rouge. Il dépasse le pilote bleu. Il dépasse le pilote vert. Il dépasse le pilote orange."]] },
    { s:{ f:"cross", p:[["@moto",70,74,24,"vole","#FF9F1C,5,rire,saut,1"],["@moto",36,82,20,"","#FF8FD0,9,rire,roule,0"],["@moto",16,84,18,"","#8E5BC4,4,rire,roule,0"],["🏁",90,46,10,"balance"]] }, l:[["narr","Il dépasse encore la pilote rose, la pilote violette et la pilote jaune !"],["narr","Youssouf passe la ligne d'arrivée le premier. Il gagne le premier tour !"]] },
    { s:{ f:"cross", p:[["@moto",50,74,26,"vole","#FF9F1C,5,rire,saut,1"],["🏁",84,46,10,"balance"]] }, l:[["narr","Au deuxième tour, Youssouf va encore plus vite… et il gagne encore !"],["youssouf","« Youpi ! »"]] },
    { s:{ f:"cross", p:[["@podium",50,84,28,"",""],["@youssouf",53,34,18,"saut","cross,joie,rire"],["@pilote",24,53,16,"","crossB,salut,sourire,#3D7BD9"],["@pilote",82,64,16,"","crossB,salut,sourire,#E5484D"]] }, l:[["narr","Sur le podium, Youssouf est à la première place. Le pilote bleu est deuxième, et le pilote rouge est troisième."]] },
    { s:{ f:"cross", p:[["@podium",50,84,28,"",""],["@youssouf",53,34,18,"saut","cross,joie,rire"],["🏆",68,14,9,"balance"],["🥇",22,8,6,"vole"],["🥇",38,4,6,"vole"],["🥇",30,10,6,"vole"],["🥈",30,30,6,""],["🥉",90,42,6,""],["@pilote",24,53,16,"","crossB,joie,rire,#3D7BD9"],["@pilote",82,64,16,"","crossB,joie,rire,#E5484D"]] }, l:[["narr","Le pilote bleu reçoit une médaille d'argent, et le pilote rouge une médaille de bronze."],["narr","Et Youssouf gagne un trophée et trois médailles !"],["youssouf","« Je suis champion ! »"],["narr","Fin."]] }
  ],
  quiz:[ { q:"Quel sport aime Youssouf ?", c:["La natation","La motocross","Le tennis"], r:1 }, { q:"Que fait Youssouf quand il a peur ?", c:["Il pleure","Il respire et se concentre","Il rentre à la maison"], r:1 },
         { q:"Qui gagne la course ?", c:["Youssouf","Le pilote bleu","Le pilote rouge"], r:0 }, { q:"Qu'est-ce que Youssouf gagne à la fin ?", c:["Un ballon","Un trophée et trois médailles","Un gâteau"], r:1 } ]
},
{
  id:"espagne", titre:"Maman revient d'Espagne", auteur:"Une histoire imaginée par Aleyah",
  couverture:{ f:"plage", p:[["@maman",26,84,28,"","maman,joie,rire"],["🎁",48,70,9,"saut"],["@yusuf",64,86,17,"saut","tshirt,joie,rire"],["@amira",82,86,17,"saut","sorciere,joie,rire"]] }, age:"3-10 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"siwis" }, aleyah:{ nom:"Aleyah", h:1.2, v:.95, c:"#C9A8FF", vx:"siwis+2" }, maman:{ nom:"Maman", h:1, v:.92, c:"#7BE495", vx:"siwis" },
           yusuf:{ nom:"Yusuf", h:1.2, v:1, c:"#FF9F1C", vx:"pierre+4" }, amyrah:{ nom:"Amyrah", h:1.4, v:.95, c:"#FF8FD0", vx:"siwis+4" }, nonos:{ nom:"Nono et Nona", h:.9, v:.9, c:"#FFD23F", vx:"pierre" } },
  pages:[
    { s:{ f:"chambreVide", p:[["@baba",14,86,29,"","papa,debout,sourire"],["@jahyan",32,86,19,"","ecole,debout,sourire"],["@aleyah",50,86,22,"","ecole,salut,sourire"],["@yusuf",68,86,17,"balance","tshirt,debout,rire"],["@amira",84,86,16,"balance","princesse,debout,rire"]] },
      l:[["narr","Aujourd'hui, Maman revient d'Espagne !"],["narr","Nous l'attendons tous à la maison : Baba, Jahyan, Yusuf, Amyrah et moi, Aleyah."]] },
    { s:{ f:"chambreVide", p:[["@maman",34,86,29,"saut","maman,joie,rire"],["🧳",56,80,11,""],["🎁",72,74,8,"saut"],["🎁",84,80,7,"saut"]] }, l:[["narr","La porte s'ouvre. Et voici Maman ! Elle a une grosse valise pleine de cadeaux."],["maman","« Bonjour mes chéris ! J'ai des cadeaux pour tout le monde ! »"]] },
    { s:{ f:"chambreVide", p:[["@yusuf",36,86,19,"saut","tshirt,joie,rire"],["🏍️",64,78,14,"balance"]] }, l:[["narr","Pour Yusuf, Maman a apporté une moto !"],["yusuf","« Vroum vroum ! Merci Maman ! »"]] },
    { s:{ f:"chambreVide", p:[["@amira",44,86,19,"saut","sorciere,joie,rire"],["✨",62,40,8,"vole"],["⭐",30,34,6,"vole"]] }, l:[["narr","Pour Amyrah, un déguisement de sorcière, avec un grand chapeau pointu !"],["amyrah","« Regardez, je suis une sorcière ! »"]] },
    { s:{ f:"chambreVide", p:[["@aleyah",44,86,23,"","priere,salut,rire"],["💜",64,36,7,"vole"]] }, l:[["narr","Et pour moi, Maman a apporté un bel habit pour la prière."],["aleyah","« Il est magnifique ! Merci Maman ! »"]] },
    { s:{ f:"chambreVide", p:[["@baba",18,86,29,"","papa,joie,rire"],["🎁",36,78,8,"saut"],["@jahyan",54,86,19,"saut","ecole,joie,rire"],["🎁",72,78,8,"saut"],["@maman",86,86,27,"","maman,debout,rire"]] }, l:[["narr","Il y avait aussi des cadeaux pour Baba et pour Jahyan."],["narr","Tout le monde était très content ! Merci Maman !"]] },
    { s:{ f:"route", p:[["✈️",40,30,14,"vole"],["☁️",72,22,9,"vole"],["☁️",18,40,7,"vole"]] }, l:[["narr","Et puis, toute la famille est partie en Espagne !"]] },
    { s:{ f:"jardin", p:[["@nono",22,86,28,"","papy,joie,rire"],["@nona",38,86,27,"","mamy,joie,rire"],["@aleyah",60,86,21,"saut","ecole,joie,rire"],["@yusuf",76,86,16,"saut","tshirt,joie,rire"],["@amira",90,86,15,"saut","princesse,joie,rire"]] }, l:[["narr","Là-bas, Nono et Nona nous attendaient."],["nonos","« Bienvenue, nos chéris ! Nous sommes si contents de vous voir ! »"]] },
    { s:{ f:"piscine", p:[["@aleyah",28,64,19,"vole","ecole,vol,rire"],["@yusuf",50,70,16,"vole","tshirt,saut,rire"],["@amira",70,66,15,"vole","princesse,vol,rire"],["💦",40,44,8,"vole"],["💦",62,38,7,"vole"]] }, l:[["narr","Et hop ! Tout le monde a sauté dans la piscine !"],["narr","Fin."]] }
  ],
  quiz:[ { q:"D'où revient Maman ?", c:["D'Espagne","De la Lune","De l'école"], r:0 }, { q:"Quel cadeau a reçu Yusuf ?", c:["Un ballon","Une moto","Un chapeau"], r:1 },
         { q:"Quel déguisement a reçu Amyrah ?", c:["Une princesse","Une sorcière","Un pirate"], r:1 }, { q:"Qui attend la famille en Espagne ?", c:["Nono et Nona","Le chevalier","Zouli"], r:0 } ]
},
{
  id:"amira", titre:"La princesse Amira et la petite sorcière", auteur:"Une histoire imaginée par la grande sœur d'Amira",
  couverture:{ f:"ecole", p:[["@amira",30,82,22,"saut","princesse,joie,rire"],["@sorciere",62,82,22,"","sorciere,salut,sourire"],["❤️",46,30,7,"vole"]] }, age:"3-6 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"siwis" }, amira:{ nom:"Amira", h:1.3, v:.95, c:"#FF8FD0", vx:"siwis+4" }, sorciere:{ nom:"La petite sorcière", h:1.2, v:.95, c:"#C9A8FF", vx:"siwis+2" },
           chevalier:{ nom:"Chevalier", h:1, v:1, c:"#9EE6A8", vx:"pierre+3" }, parents:{ nom:"Baba et Maman", h:.9, v:.95, c:"#FFD23F", vx:"pierre" } },
  pages:[
    { s:{ f:"ecole", p:[["@amira",40,82,24,"saut","princesse,joie,rire"],["🏫",76,40,12,""]] }, l:[["narr","Voici Amira. C'est une princesse !"],["narr","Aujourd'hui, elle va à l'école pour rencontrer ses nouveaux amis."],["amira","« J'adore l'école ! »"]] },
    { s:{ f:"ecole", p:[["@amira",24,82,22,"","princesse,salut,sourire"],["@chevalier",48,82,22,"","chevalier,debout,rire"],["@copain2",72,84,19,"balance","ecole,joie,rire"]] }, l:[["narr","À l'école, Amira joue avec ses copains."],["narr","Il y a son ami Chevalier, avec son casque et son épée en bois."]] },
    { s:{ f:"ecole", p:[["@sorciere",62,82,22,"","sorciere,debout,surpris"],["@amira",22,84,20,"","princesse,debout,surpris"],["✨",74,34,7,"vole"]] }, l:[["narr","Un matin, une nouvelle fille arriva dans la classe."],["narr","C'était une petite sorcière, avec un grand chapeau pointu."],["sorciere","« Bonjour… »"]] },
    { s:{ f:"ecole", p:[["@sorciere",70,82,22,"","sorciere,triste,triste"],["@copain2",22,84,19,"","ecole,peur,surpris"],["@copine1",40,84,19,"","ecole,peur,surpris"]] }, l:[["narr","Mais personne ne voulait jouer avec elle."],["narr","Les enfants avaient un peu peur. La petite sorcière était toute triste."]] },
    { s:{ f:"ecole", p:[["@chevalier",34,82,23,"saut","chevalier,tir,fache"],["@sorciere",72,82,21,"","sorciere,peur,surpris"]] }, l:[["chevalier","« Une sorcière ! Je vais l'attaquer ! »"]] },
    { s:{ f:"ecole", p:[["@chevalier",20,82,22,"","chevalier,debout,surpris"],["@amira",46,82,23,"","princesse,salut,fache"],["@sorciere",74,82,21,"","sorciere,debout,surpris"]] }, l:[["amira","« Non, Chevalier ! Arrête ! »"],["amira","« Elle est peut-être gentille. Elle peut devenir notre amie ! »"]] },
    { s:{ f:"ecole", p:[["@amira",36,82,22,"saut","princesse,joie,rire"],["@sorciere",62,82,22,"saut","sorciere,joie,rire"],["🖍️",50,46,8,"balance"],["🎨",80,60,8,""]] }, l:[["narr","Amira prit la main de la petite sorcière."],["narr","Elles jouèrent ensemble, elles dessinèrent… et devinrent les meilleures amies du monde !"]] },
    { s:{ f:"ecole", p:[["@baba",20,84,30,"","papa,salut,sourire"],["@maman",38,84,29,"","maman,salut,sourire"],["@amira",64,84,21,"","princesse,triste,triste"],["@sorciere",84,84,20,"","sorciere,triste,triste"]] }, l:[["narr","À la fin de la journée, Baba et Maman vinrent chercher Amira."],["amira","« Je ne suis pas contente… Je veux que mon amie vienne avec moi ! »"]] },
    { s:{ f:"jardin", p:[["@baba",14,84,30,"","papa,joie,rire"],["@maman",30,84,29,"","maman,joie,rire"],["@amira",56,84,22,"saut","princesse,joie,rire"],["@sorciere",78,84,22,"saut","sorciere,joie,rire"],["❤️",66,30,7,"vole"]] }, l:[["parents","« Bien sûr ! Ton amie peut venir jouer à la maison ! »"],["narr","Et la petite sorcière vint chez Amira. Les deux amies jouèrent ensemble tout l'après-midi."],["narr","Fin."]] }
  ],
  quiz:[ { q:"Qui est la nouvelle fille à l'école ?", c:["Une petite sorcière","Une sirène","Une fée"], r:0 }, { q:"Que veut faire Chevalier ?", c:["Danser","L'attaquer","Dormir"], r:1 },
         { q:"Que dit Amira ?", c:["Elle peut devenir notre amie","Va-t'en","J'ai peur"], r:0 }, { q:"Où va la petite sorcière à la fin ?", c:["À la piscine","Chez Amira","Sur la Lune"], r:1 } ]
},
{
  id:"zouli", titre:"Les extraterrestres de Vevey", auteur:"Une histoire imaginée par Aleyah", couverture:{ f:"vevey", p:[["@soucoupe",64,26,13,"vole","x,rayon"],["@zouli",48,80,19,"saut","x,joie,rire,0"],["@aleyah",24,80,23,"","heros,joie,rire"],["@copine1",10,82,20,"","heros2,debout,sourire"]] }, age:"4-10 ans",
  persos:{ narr:{ nom:"", h:1, v:.9, vx:"jessica" }, zouli:{ nom:"Zouli", h:1.6, v:1.05, c:"#7BE495", vx:"jessica+6" }, aleyah:{ nom:"Super Aleyah", h:1.2, v:.95, c:"#FF8FD0", vx:"siwis" },
           lune:{ nom:"Super Lune", h:1.2, v:.95, c:"#7FD3FF", vx:"siwis+2" }, arc:{ nom:"Super Arc-en-ciel", h:1.2, v:.95, c:"#9BE07A", vx:"jessica+2" },
           bipbop:{ nom:"MC Bip-Bop", h:.9, v:1.05, c:"#FFD23F", vx:"pierre+3" }, gens:{ nom:"Les gens de Vevey", h:.9, v:1.1, c:"#FFD23F", vx:"miro" } },
  pages:[
    { s:{ f:"vevey", p:[["@copain1",28,82,20,"","foot,debout,sourire"],["@copain3",44,84,19,"balance","ecole,debout,rire"]] }, l:[["narr","Un matin, à Vevey, le soleil brillait sur le lac."],["narr","Les gens se promenaient sur le quai, tout près de la grande fourchette plantée dans l'eau."]] },
    { s:{ f:"vevey", p:[["@soucoupe",30,30,12,"vole","x,rayon"],["@soucoupe",72,20,9,"vole","x"],["@zouli",34,84,16,"saut","x,joie,rire,0"],["@zouli",50,85,14,"saut","x,salut,sourire,1"]] }, l:[["narr","Tout à coup, des soucoupes volantes apparurent dans le ciel !"],["narr","Des dizaines de petits extraterrestres descendirent sur le quai."]] },
    { s:{ f:"vevey", p:[["@copain1",20,82,20,"saut","foot,peur,surpris"],["@copain2",36,84,19,"saut","ecole,peur,surpris"],["@zouli",74,83,17,"","x,debout,surpris,2"]] }, l:[["gens","« Au secours ! Des extraterrestres ! Ils viennent nous attaquer ! »"],["narr","Tout le monde eut très peur et courut se cacher."]] },
    { s:{ f:"vevey", p:[["@zouli",28,83,17,"balance","x,salut,rire,0"],["@zouli",50,85,16,"saut","x,joie,sourire,1"],["@zouli",72,83,17,"balance","x,salut,sourire,3"]] }, l:[["narr","Mais les extraterrestres avaient l'air tout étonnés."],["narr","Ils agitaient leurs petites antennes… et ils souriaient."]] },
    { s:{ f:"vevey", p:[["@copine1",30,40,19,"vole","heros2,vol,sourire"],["@aleyah",52,34,23,"vole","heros,vol,sourire"],["@copine2",74,42,19,"vole","heros3,vol,rire"],["@zouli",14,86,14,"","x,debout,surpris,0"]] }, l:[["narr","Alors, dans le ciel, trois capes apparurent. C'étaient Super Aleyah et ses copines, les super-héroïnes de Vevey !"],["aleyah","« N'ayez pas peur, on s'en occupe ! »"]] },
    { s:{ f:"vevey", p:[["@copine1",14,84,21,"","heros2,debout,sourire"],["@aleyah",32,83,25,"","heros,debout,sourire"],["@copine2",50,84,21,"","heros3,debout,sourire"],["@zouli",72,85,17,"","x,debout,sourire,0"]] }, l:[["narr","Les trois amies se posèrent devant le plus petit des extraterrestres. Elles ne se battirent pas : elles lui posèrent une question."],["aleyah","« Bonjour. Pourquoi êtes-vous venus sur la Terre ? »"]] },
    { s:{ f:"vevey", p:[["@aleyah",22,84,23,"","heros,debout,surpris"],["@zouli",54,83,21,"balance","x,salut,rire,0"]] }, l:[["zouli","« Bip bip ! Je m'appelle Zouli. Nous ne sommes pas méchants ! »"],["zouli","« Sur notre planète, nous sommes tout seuls. Nous voulons juste… avoir des amis. »"]] },
    { s:{ f:"vevey", p:[["@aleyah",18,83,24,"saut","heros,joie,rire"],["@copine1",34,85,19,"","heros2,salut,rire"],["@copain1",50,85,17,"","foot,debout,sourire"],["@copain2",64,85,17,"","ecole,salut,sourire"],["@zouli",82,84,16,"saut","x,joie,rire,0"]] }, l:[["aleyah","« Des amis ? Ça, on sait faire, à Vevey ! »"],["lune","« Venez, tout le monde ! N'ayez plus peur ! »"],["narr","Un par un, les gens sortirent de leurs cachettes et dirent bonjour aux extraterrestres."]] },
    { s:{ f:"stade", p:[["@zouli",28,80,17,"saut","x,joie,rire,1"],["⚽",48,76,6,"vole"],["@aleyah",64,82,22,"","heros,tir,rire"],["@zouli",86,82,15,"","x,debout,sourire,2"]] }, l:[["narr","L'après-midi, tout le monde joua au foot. Avec leurs trois jambes, les extraterrestres couraient très vite !"],["zouli","« But ! Bip bip ! »"]] },
    { s:{ f:"piscine", p:[["@zouli",30,62,18,"vole","x,joie,rire,0"],["@copine2",62,70,19,"vole","heros3,vol,rire"],["❤️",46,30,6,"vole"],["❤️",56,22,5,"vole"]] }, l:[["narr","Ensuite, ils plongèrent tout au fond de la piscine."],["arc","« Regardez ! Ils font des bulles en forme de cœur ! »"]] },
    { s:{ f:"plage", p:[["🏰",52,82,22,""],["@zouli",30,86,15,"saut","x,joie,rire,3"],["@copine1",74,86,18,"","heros2,joie,rire"],["@aleyah",88,86,20,"","heros,salut,sourire"]] }, l:[["narr","À la plage, ils construisirent un château de sable géant, avec des tours… et des antennes."]] },
    { s:{ f:"veveySoir", p:[["@zouli",50,82,21,"saut","x,salut,rire,1,rap"],["@aleyah",22,84,21,"saut","heros,joie,rire"],["@copine2",78,84,19,"saut","heros3,joie,rire"],["🎵",36,36,8,"vole"],["🎶",66,30,8,"vole"]] }, l:[["narr","Le soir, grande fête sur le quai ! Le cousin de Zouli, MC Bip-Bop, prit le micro."],["bipbop","« Bip bip, bop bop, à Vevey on est copains ! Du lac jusqu'aux étoiles, on se tient tous la main ! »"]] },
    { s:{ f:"espace", p:[["@soucoupe",48,56,17,"vole","x"],["🚀",22,70,8,"vole"]] }, l:[["narr","Depuis ce jour, les habitants de Vevey et les extraterrestres font des voyages ensemble."],["narr","Sur la Lune, sur Mars… et retour à Vevey pour le goûter !"]] },
    { s:{ f:"nuit", p:[["@copine1",18,84,19,"","heros2,debout,sourire"],["@aleyah",38,82,24,"","heros,debout,rire"],["@zouli",60,84,18,"saut","x,joie,rire,0"],["@copine2",80,84,19,"","heros3,debout,sourire"],["❤️",49,34,8,"vole"]] }, l:[["aleyah","« Tu vois, il ne faut pas avoir peur de ceux qui sont différents. »"],["zouli","« Bip bip ! Merci, mes amies ! »"],["narr","Et tout Vevey devint ami avec les extraterrestres. Fin."]] }
  ],
  quiz:[ { q:"Pourquoi les extraterrestres sont-ils venus sur la Terre ?", c:["Pour attaquer","Pour avoir des amis","Pour boire le lac"], r:1 }, { q:"Comment s'appelle le petit extraterrestre ?", c:["Zouli","Balou","Pompon"], r:0 },
         { q:"Qui chante à la fête ?", c:["MC Bip-Bop","Super Lune","Zouli"], r:0 }, { q:"Combien de jambes ont les extraterrestres ?", c:["2","3","4"], r:1 } ]
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
