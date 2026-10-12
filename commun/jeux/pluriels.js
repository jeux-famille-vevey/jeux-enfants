/* Les pluriels pièges — 7P : -al, -ail, -ou, -eu, -eau, -au, mots invariables, pluriels spéciaux */
(function(){
  var M = Moteur;
  // [singulier, pluriel, famille]
  var MOTS = [
    ["cheval","chevaux","al"],["journal","journaux","al"],["animal","animaux","al"],["hôpital","hôpitaux","al"],["métal","métaux","al"],["signal","signaux","al"],
    ["canal","canaux","al"],["général","généraux","al"],["cristal","cristaux","al"],
    ["bal","bals","al-x"],["carnaval","carnavals","al-x"],["festival","festivals","al-x"],["chacal","chacals","al-x"],["récital","récitals","al-x"],["régal","régals","al-x"],
    ["rail","rails","ail"],["détail","détails","ail"],["éventail","éventails","ail"],["portail","portails","ail"],["épouvantail","épouvantails","ail"],
    ["travail","travaux","ail-x"],["vitrail","vitraux","ail-x"],["corail","coraux","ail-x"],["émail","émaux","ail-x"],["soupirail","soupiraux","ail-x"],
    ["clou","clous","ou"],["trou","trous","ou"],["cou","cous","ou"],["kangourou","kangourous","ou"],["verrou","verrous","ou"],["sou","sous","ou"],
    ["bijou","bijoux","ou-x"],["caillou","cailloux","ou-x"],["chou","choux","ou-x"],["genou","genoux","ou-x"],["hibou","hiboux","ou-x"],["joujou","joujoux","ou-x"],["pou","poux","ou-x"],
    ["bateau","bateaux","eau"],["chapeau","chapeaux","eau"],["oiseau","oiseaux","eau"],["gâteau","gâteaux","eau"],["cadeau","cadeaux","eau"],["château","châteaux","eau"],
    ["tuyau","tuyaux","au"],["noyau","noyaux","au"],["landau","landaus","au-x"],
    ["cheveu","cheveux","eu"],["jeu","jeux","eu"],["feu","feux","eu"],["neveu","neveux","eu"],["pneu","pneus","eu-x"],["bleu","bleus","eu-x"],
    ["nez","nez","inv"],["prix","prix","inv"],["souris","souris","inv"],["bras","bras","inv"],["choix","choix","inv"],["voix","voix","inv"],["noix","noix","inv"],["repas","repas","inv"],
    ["œil","yeux","spe"],["ciel","cieux","spe"],["monsieur","messieurs","spe"],["madame","mesdames","spe"]
  ];
  var REGLE = {
    "al":"Les mots en <b>-al</b> font leur pluriel en <b>-aux</b> : un cheval → des chevaux.",
    "al-x":"Les mots en -al font en général -aux, <b>sauf</b> bal, carnaval, chacal, festival, récital et régal, qui prennent un <b>s</b>.",
    "ail":"Les mots en <b>-ail</b> prennent simplement un <b>s</b> : un rail → des rails.",
    "ail-x":"Les mots en -ail prennent un s, <b>sauf</b> bail, corail, émail, soupirail, travail, vantail et vitrail, qui font <b>-aux</b>.",
    "ou":"Les mots en <b>-ou</b> prennent un <b>s</b> : un clou → des clous.",
    "ou-x":"Les mots en -ou prennent un s, <b>sauf</b> 7 mots qui prennent un <b>x</b> : bijou, caillou, chou, genou, hibou, joujou, pou. (« Viens mon chou, mon bijou, sur mes genoux, et jette des cailloux à ce hibou plein de poux ! »)",
    "eau":"Les mots en <b>-eau</b> prennent un <b>x</b> : un bateau → des bateaux.",
    "au":"Les mots en <b>-au</b> prennent un <b>x</b> : un tuyau → des tuyaux.",
    "au-x":"Les mots en -au prennent un x, <b>sauf</b> landau et sarrau, qui prennent un <b>s</b>.",
    "eu":"Les mots en <b>-eu</b> prennent un <b>x</b> : un jeu → des jeux.",
    "eu-x":"Les mots en -eu prennent un x, <b>sauf</b> pneu, bleu et émeu, qui prennent un <b>s</b>.",
    "inv":"Les mots qui finissent déjà par <b>s, x ou z</b> ne changent pas au pluriel : un nez → des nez.",
    "spe":"C'est un pluriel spécial, à apprendre par cœur : un œil → des yeux, un ciel → des cieux, monsieur → messieurs, madame → mesdames."
  };
  function faux(s, p){
    var t = [s+"s", s+"x"];
    if(/al$/.test(s)) t.push(s.slice(0,-2)+"aux", s+"s");
    if(/ail$/.test(s)) t.push(s.slice(0,-3)+"aux", s+"s");
    if(/s$|x$|z$/.test(s)) t.push(s+"es", s+"s", s+"x");
    if(s === "œil") t = ["œils","œilx","yeux","yeuxs"];
    if(s === "ciel") t = ["ciels","cieux","cieus"];
    if(s === "monsieur") t = ["monsieurs","messieurs","messieur"];
    if(s === "madame") t = ["madames","mesdames","mesdame"];
    return t.filter(function(x, i){ return x !== p && t.indexOf(x) === i; });
  }
  function fabrique(ecrire){
    return function(cle){
      var m = MOTS.filter(function(x){ return x[0] === cle; })[0];
      var art = m[0] === "monsieur" || m[0] === "madame" ? "" : (["souris","voix","noix"].indexOf(m[0]) >= 0 ? "une " : "un ");
      var q = { enonce:"<small>Écris le pluriel</small><span class=\"big\">" + M.echapper(art + m[0]) + " → " + (art ? "des " : "") + '<span class="gap">?</span></span>',
        reponses:[m[1], (art ? "des " : "") + m[1]], explication:REGLE[m[2]], resume:art + m[0] };
      if(ecrire){ q.saisie = "texte"; q.indice = "Écris le mot au pluriel"; }
      else q.choix = M.choixAvec(m[1], faux(m[0], m[1]), 3);
      return q;
    };
  }
  function famille(f){ return function(){ return MOTS.filter(function(m){ return f.indexOf(m[2]) >= 0; }).map(function(m){ return m[0]; }); }; }
  M.inscrire({ id:"pluriels", titre:"Les pluriels pièges", emoji:"🦔", matiere:"Français",
    intro:"Un cheval, des chevaux… mais un festival, des festivals ! Apprends les règles et leurs exceptions.",
    niveaux:[
      { id:"al-ail", nom:"Les mots en -al et -ail", desc:"chevaux, festivals, travaux, rails…", cles:famille(["al","al-x","ail","ail-x"]), question:fabrique(false) },
      { id:"ou-eu", nom:"Les mots en -ou, -eu, -eau, -au", desc:"bijoux, clous, bateaux, pneus…", cles:famille(["ou","ou-x","eau","au","au-x","eu","eu-x"]), question:fabrique(false) },
      { id:"inv", nom:"Les invariables et les spéciaux", desc:"un nez, des nez · un œil, des yeux", cles:famille(["inv","spe"]), question:fabrique(false) },
      { id:"ecrire", nom:"Écris le pluriel toi-même", desc:"Tous les mots, sans aide", n:12, cles:famille(Object.keys(REGLE)), question:fabrique(true) }
    ]});
})();
