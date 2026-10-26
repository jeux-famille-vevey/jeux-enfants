/* Les mots du jeu « Je répète ».
   { e: image, c: "c'est …" (avec l'article), m: le mot, s: syllabes [écrit, prononcé] pour les mots difficiles }
   La colonne « prononcé » sert seulement à la voix (pour qu'un petit morceau seul soit bien dit). */
window.MOTS = {
  facile: [
    { e:"🐱", c:"un chat", m:"chat" }, { e:"🐶", c:"un chien", m:"chien" }, { e:"🌙", c:"la lune", m:"lune" }, { e:"🍞", c:"du pain", m:"pain" },
    { e:"🥛", c:"du lait", m:"lait" }, { e:"🍎", c:"une pomme", m:"pomme" }, { e:"🚌", c:"un bus", m:"bus" }, { e:"🚂", c:"un train", m:"train" },
    { e:"🌸", c:"une fleur", m:"fleur" }, { e:"✋", c:"une main", m:"main" }, { e:"👃", c:"un nez", m:"nez" }, { e:"🐻", c:"un ours", m:"ours" },
    { e:"🐮", c:"une vache", m:"vache" }, { e:"🛏️", c:"un lit", m:"lit" }, { e:"🔑", c:"une clé", m:"clé" }, { e:"❤️", c:"un cœur", m:"cœur" },
    { e:"🍓", c:"une fraise", m:"fraise" }, { e:"⭐", c:"une étoile", m:"étoile" }, { e:"🐟", c:"un poisson", m:"poisson" }, { e:"🚗", c:"une voiture", m:"voiture" }
  ],
  moyen: [
    { e:"🎈", c:"un ballon", m:"ballon", s:[["bal","bal"],["lon","lon"]] }, { e:"🏠", c:"une maison", m:"maison", s:[["mai","mè"],["son","zon"]] },
    { e:"🍌", c:"une banane", m:"banane", s:[["ba","ba"],["nane","nane"]] }, { e:"🐰", c:"un lapin", m:"lapin", s:[["la","la"],["pin","pin"]] },
    { e:"🎂", c:"un gâteau", m:"gâteau", s:[["gâ","ga"],["teau","tô"]] }, { e:"👶", c:"un bébé", m:"bébé", s:[["bé","bé"],["bé","bé"]] },
    { e:"🦆", c:"un canard", m:"canard", s:[["ca","ka"],["nard","nar"]] }, { e:"🐑", c:"un mouton", m:"mouton", s:[["mou","mou"],["ton","ton"]] },
    { e:"🐷", c:"un cochon", m:"cochon", s:[["co","ko"],["chon","chon"]] }, { e:"🚲", c:"un vélo", m:"vélo", s:[["vé","vé"],["lo","lo"]] },
    { e:"⛵", c:"un bateau", m:"bateau", s:[["ba","ba"],["teau","tô"]] }, { e:"☀️", c:"le soleil", m:"soleil", s:[["so","so"],["leil","lèille"]] },
    { e:"🎩", c:"un chapeau", m:"chapeau", s:[["cha","cha"],["peau","pô"]] }, { e:"✈️", c:"un avion", m:"avion", s:[["a","a"],["vion","vion"]] },
    { e:"🍋", c:"un citron", m:"citron", s:[["ci","si"],["tron","tron"]] }, { e:"🥕", c:"une carotte", m:"carotte", s:[["ca","ka"],["rotte","rote"]] },
    { e:"🌲", c:"un sapin", m:"sapin", s:[["sa","sa"],["pin","pin"]] }, { e:"🍅", c:"une tomate", m:"tomate", s:[["to","tô"],["mate","mate"]] },
    { e:"🐔", c:"une poule", m:"poule" }, { e:"🧸", c:"un nounours", m:"nounours", s:[["nou","nou"],["nours","nourse"]] }
  ],
  difficile: [
    { e:"🥜", c:"une cacahouète", m:"cacahouète", s:[["ca","ka"],["ca","ka"],["houète","ouète"]] },
    { e:"🦋", c:"un papillon", m:"papillon", s:[["pa","pa"],["pi","pi"],["llon","yon"]] },
    { e:"🐊", c:"un crocodile", m:"crocodile", s:[["cro","kro"],["co","ko"],["dile","dile"]] },
    { e:"🐘", c:"un éléphant", m:"éléphant", s:[["é","et"],["lé","lé"],["phant","fan"]] },
    { e:"🚁", c:"un hélicoptère", m:"hélicoptère", s:[["hé","et"],["li","li"],["cop","kop"],["tère","tère"]] },
    { e:"🦕", c:"un dinosaure", m:"dinosaure", s:[["di","di"],["no","no"],["saure","sore"]] },
    { e:"🍫", c:"du chocolat", m:"chocolat", s:[["cho","cho"],["co","ko"],["lat","la"]] },
    { e:"🐌", c:"un escargot", m:"escargot", s:[["es","èss"],["car","kar"],["got","go"]] },
    { e:"💻", c:"un ordinateur", m:"ordinateur", s:[["or","or"],["di","di"],["na","na"],["teur","teur"]] },
    { e:"🦘", c:"un kangourou", m:"kangourou", s:[["kan","kan"],["gou","gou"],["rou","rou"]] },
    { e:"🦒", c:"une girafe", m:"girafe", s:[["gi","ji"],["rafe","rafe"]] },
    { e:"🐢", c:"une tortue", m:"tortue", s:[["tor","tor"],["tue","tu"]] },
    { e:"👖", c:"un pantalon", m:"pantalon", s:[["pan","pan"],["ta","ta"],["lon","lon"]] },
    { e:"🍍", c:"un ananas", m:"ananas", s:[["a","a"],["na","na"],["nas","nasse"]] },
    { e:"☂️", c:"un parapluie", m:"parapluie", s:[["pa","pa"],["ra","ra"],["pluie","plui"]] },
    { e:"🐞", c:"une coccinelle", m:"coccinelle", s:[["coc","kok"],["ci","si"],["nelle","nèle"]] },
    { e:"🍝", c:"des spaghettis", m:"spaghettis", s:[["spa","spa"],["ghet","guè"],["tis","ti"]] },
    { e:"🐧", c:"un pingouin", m:"pingouin", s:[["pin","pin"],["gouin","gouin"]] },
    { e:"🦛", c:"un hippopotame", m:"hippopotame", s:[["hip","ip"],["po","po"],["po","po"],["tame","tame"]] },
    { e:"📱", c:"un téléphone", m:"téléphone", s:[["té","té"],["lé","lé"],["phone","fone"]] }
  ]
};
window.PHRASES_PARLER = {
  aToi: "À toi ! Dis-le !", encore: "Encore une fois !", bravo: ["Bravo !", "Super !", "Génial !", "Très bien !", "Tu parles très bien !", "Waouh, bravo !"],
  difficile: "Ce mot est un peu difficile. On le coupe en petits morceaux !", morceau: "Répète après moi :", ensemble: "Maintenant, tout ensemble !",
  etoile: "Tu as gagné une étoile !", fin: "Bravo ! Tu as gagné un autocollant !", bonjour: "Bonjour ! On va jouer à répéter les mots. Écoute bien !",
  parfait: "Parfait !", ecoute: "Je t'écoute !"
};
