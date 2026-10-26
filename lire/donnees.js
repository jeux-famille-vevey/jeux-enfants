/* Le contenu de « J'apprends à lire ».
   Pour la voix : « dit » = texte lu par la voix ; « ph » = sons écrits en phonèmes (pour les sons qu'on fait durer : mmm, sss…). */
window.LIRE = {
  // 1. les voyelles
  voyelles: [
    { l:"a", dit:"a", mot:"avion", e:"✈️" }, { l:"e", dit:"e", mot:"renard", e:"🦊", ou:"au milieu" },
    { l:"i", dit:"i", mot:"île", e:"🏝️" }, { l:"o", dit:"o", mot:"orange", e:"🍊" },
    { l:"u", dit:"u", mot:"lune", e:"🌙", ou:"au milieu" }, { l:"é", dit:"et", mot:"éléphant", e:"🐘" }
  ],
  // 2. les sons qui chantent (on peut les faire durer)
  chantantes: [
    { l:"m", ph:"mːːːːːː", mot:"maison", e:"🏠" }, { l:"l", ph:"lːːːːːː", mot:"lune", e:"🌙" }, { l:"s", ph:"sːːːːːː", mot:"serpent", e:"🐍" },
    { l:"r", ph:"ʁːːːːːː", mot:"renard", e:"🦊" }, { l:"f", ph:"fːːːːːː", mot:"fusée", e:"🚀" }, { l:"n", ph:"nːːːːːː", mot:"nuage", e:"☁️" },
    { l:"ch", ph:"ʃːːːːːː", mot:"chat", e:"🐱" }, { l:"v", ph:"vːːːːːː", mot:"vache", e:"🐮" }
  ],
  // 3. coller les sons : consonne + voyelle
  fusions: [
    { s:"ma", c:"m", v:"a", ph:"mːːːːː, aː, ma." }, { s:"la", c:"l", v:"a", ph:"lːːːːː, aː, la." }, { s:"so", c:"s", v:"o", ph:"sːːːːː, oː, so." },
    { s:"ri", c:"r", v:"i", ph:"ʁːːːːː, iː, ʁi." }, { s:"lu", c:"l", v:"u", ph:"lːːːːː, yː, ly." }, { s:"mi", c:"m", v:"i", ph:"mːːːːː, iː, mi." },
    { s:"fé", c:"f", v:"é", ph:"fːːːːː, eː, fe." }, { s:"no", c:"n", v:"o", ph:"nːːːːː, oː, no." }, { s:"cha", c:"ch", v:"a", ph:"ʃːːːːː, aː, ʃa." },
    { s:"vi", c:"v", v:"i", ph:"vːːːːː, iː, vi." }, { s:"sa", c:"s", v:"a", ph:"sːːːːː, aː, sa." }, { s:"lo", c:"l", v:"o", ph:"lːːːːː, oː, lo." }
  ],
  // 4. lire des syllabes (avec des sons qui se ressemblent)
  syllabes: [["pa","ba","da"],["to","do","po"],["mi","ni","li"],["vé","fé","bé"],["lu","ru","nu"],["ja","cha","sa"],["ko","go","to"],["ti","di","pi"],["mo","no","lo"],["bu","pu","du"],["ra","la","na"],["fo","vo","so"]],
  // 5. les premiers mots : [image, mot, syllabes [écrit, dit]]
  mots: [
    { e:"🏍️", m:"moto", s:[["mo","mo"],["to","tô"]] }, { e:"🚲", m:"vélo", s:[["vé","vé"],["lo","lo"]] }, { e:"🦙", m:"lama", s:[["la","la"],["ma","ma"]] },
    { e:"👨", m:"papa", s:[["pa","pa"],["pa","pa"]] }, { e:"🥝", m:"kiwi", s:[["ki","ki"],["wi","oui"]] }, { e:"🥋", m:"judo", s:[["ju","ju"],["do","do"]] },
    { e:"☕", m:"café", s:[["ca","ka"],["fé","fé"]] }, { e:"👶", m:"bébé", s:[["bé","bé"],["bé","bé"]] }, { e:"🍅", m:"tomate", s:[["to","tô"],["ma","ma"],["te","te"]] },
    { e:"🍌", m:"banane", s:[["ba","ba"],["na","na"],["ne","ne"]] }, { e:"🥗", m:"salade", s:[["sa","sa"],["la","la"],["de","de"]] }, { e:"🌷", m:"tulipe", s:[["tu","tu"],["li","li"],["pe","pe"]] },
    { e:"🏴‍☠️", m:"pirate", s:[["pi","pi"],["ra","ra"],["te","te"]] }, { e:"📻", m:"radio", s:[["ra","ra"],["di","di"],["o","o"]] }, { e:"🛋️", m:"sofa", s:[["so","so"],["fa","fa"]] },
    { e:"🌙", m:"lune", s:[["lu","lu"],["ne","ne"]] }, { e:"👵", m:"mamie", s:[["ma","ma"],["mie","mi"]] }, { e:"🚀", m:"fusée", s:[["fu","fu"],["sée","zé"]] }
  ],
  // 6. petites phrases : [phrase, bonne image, deux autres images]
  phrases: [
    { p:"Papa a une moto.", e:"👨🏍️", faux:["👵🚲", "👶🍌"] }, { p:"Le lama a vu la lune.", e:"🦙🌙", faux:["🦊☀️", "🐱🌙"] },
    { p:"Bébé a un kiwi.", e:"👶🥝", faux:["👶🍅", "👨🥝"] }, { p:"Mamie lit sur le sofa.", e:"👵📖🛋️", faux:["👵🚲", "👨🛋️"] },
    { p:"Le pirate a une banane.", e:"🏴‍☠️🍌", faux:["🏴‍☠️🍅", "👨🍌"] }, { p:"Léo fait du vélo.", e:"🧒🚲", faux:["🧒🏍️", "👵🚲"] },
    { p:"La fusée va sur la lune.", e:"🚀🌙", faux:["✈️☁️", "🚀☀️"] }, { p:"Tom fait du judo.", e:"🧒🥋", faux:["🧒⚽", "👵🥋"] },
    { p:"Le renard a une tomate.", e:"🦊🍅", faux:["🦊🍌", "🐮🍅"] }, { p:"La vache dort sur la salade.", e:"🐮💤🥗", faux:["🐮🚲", "🦙🥗"] }
  ],
  // phrases dites par la voix
  voix: {
    bravo: ["Bravo !", "Super !", "Oui, c'est ça !", "Très bien !", "Génial !", "Tu lis comme un grand !"],
    essaie: "Essaie encore !", ecoute: "Écoute bien :", pret: "Maintenant, à toi de jouer !",
    toucheLettre: "Touche la lettre qui fait :", ouEst: "Où est écrit :", lisMot: "Lis le mot, puis touche la bonne image !",
    lisPhrase: "Lis la phrase, puis touche la bonne image !", aide: "Touche les morceaux pour les entendre !",
    comme: "comme", fin3: "Bravo ! Tu as gagné trois étoiles !", fin2: "Bravo ! Tu as gagné deux étoiles !", fin1: "Bravo ! Tu as gagné une étoile !",
    intro1: "Voici les voyelles. Touche chaque lettre pour l'entendre !", intro2: "Ces lettres chantent : on peut faire durer leur son. Touche-les !",
    intro3: "On colle deux sons ensemble pour faire une syllabe. Touche chaque carte !", intro4: "Écoute bien, et trouve la bonne syllabe !",
    intro5: "Maintenant, on lit des mots !", intro6: "Et maintenant, de petites phrases !"
  }
};
