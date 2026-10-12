/* Le duel des homophones — 7P */
(function(){
  var M = Moteur;
  // test : mot qu'on peut mettre à la place (si ça marche, c'est la bonne forme)
  var PAIRES = {
    a: { mots:["a","à"], test:{ "a":"avait" },
      regle:{ "a":"<b>a</b> sans accent, c'est le verbe avoir (il a, elle a).", "à":"<b>à</b> avec accent est un petit mot qui indique un lieu, un moment ou un but (aller à l'école, à midi)." },
      phrases:[["Léa ___ un chat noir.","a"],["Nous allons ___ la piscine.","à"],["Il ___ mangé toute la tarte.","a"],["Je pense ___ toi.","à"],
        ["Mon frère ___ dix ans.","a"],["Elle habite ___ Vevey.","à"],["Tom ___ perdu sa clé.","a"],["C'est l'heure d'aller ___ l'école.","à"],
        ["Papa ___ acheté du pain.","a"],["J'ai une machine ___ laver.","à"],["Le chien ___ faim.","a"],["Ils partent ___ midi.","à"]] },
    et: { mots:["et","est"], test:{ "est":"était" },
      regle:{ "est":"<b>est</b>, c'est le verbe être (il est, elle est).", "et":"<b>et</b> sert à relier deux mots ou deux idées : on peut dire « et puis »." },
      phrases:[["Le ciel ___ bleu.","est"],["J'aime les pommes ___ les poires.","et"],["Mon chat ___ très gentil.","est"],["Lucas ___ Emma jouent au foot.","et"],
        ["Elle ___ partie à l'école.","est"],["Il fait froid ___ il neige.","et"],["Ce livre ___ passionnant.","est"],["Prends ton sac ___ ta veste.","et"],
        ["La soupe ___ chaude.","est"],["Le lac Léman ___ immense.","est"],["Je lis ___ je dessine.","et"]] },
    son: { mots:["son","sont"], test:{ "sont":"étaient" },
      regle:{ "sont":"<b>sont</b>, c'est le verbe être au pluriel (ils sont, elles sont).", "son":"<b>son</b> veut dire « le sien, la sienne » : on peut le remplacer par « mon » (son chien → mon chien)." },
      phrases:[["Les enfants ___ dans le jardin.","sont"],["Paul range ___ cartable.","son"],["Mes amies ___ gentilles.","sont"],["Elle promène ___ chien.","son"],
        ["Les fleurs ___ jolies au printemps.","sont"],["Chaque élève prend ___ cahier.","son"],["Ils ___ partis en vacances.","sont"],["Le chat dort dans ___ panier.","son"],
        ["Où ___ mes chaussures ?","sont"],["Il a oublié ___ parapluie.","son"]] },
    on: { mots:["on","ont"], test:{ "ont":"avaient" },
      regle:{ "ont":"<b>ont</b>, c'est le verbe avoir au pluriel (ils ont, elles ont).", "on":"<b>on</b> est un pronom, comme « il » : on peut le remplacer par « il » (on joue → il joue)." },
      phrases:[["___ va au parc cet après-midi ?","on"],["Mes cousins ___ un grand chien.","ont"],["Les oiseaux ___ construit un nid.","ont"],["Le soir, ___ regarde un film.","on"],
        ["Ils ___ gagné le match.","ont"],["___ dit que l'hiver sera froid.","on"],["Les élèves ___ fini leurs devoirs.","ont"],["Quand ___ a faim, on mange.","on"],
        ["Mes parents ___ acheté une tablette.","ont"],["Demain, ___ partira tôt.","on"]] },
    ces: { mots:["ces","ses"],
      regle:{ "ses":"<b>ses</b> veut dire « les siens, les siennes » (à lui ou à elle) : on peut dire « mes » (ses jouets → mes jouets).",
              "ces":"<b>ces</b> sert à montrer des choses : on peut ajouter « -là » (ces montagnes-là)." },
      phrases:[["Il range ___ jouets dans sa chambre.","ses"],["Regarde ___ montagnes, elles sont belles !","ces"],["Elle a perdu ___ lunettes.","ses"],["___ gâteaux ont l'air délicieux.","ces"],
        ["Le roi parle à ___ soldats.","ses"],["Je n'aime pas ___ chaussures-là.","ces"],["Marie invite ___ amies.","ses"],["Tu vois ___ nuages gris ?","ces"],
        ["Le chat lèche ___ pattes.","ses"],["Qui a dessiné ___ images au tableau ?","ces"]] },
    ou: { mots:["ou","où"], test:{ "ou":"ou bien" },
      regle:{ "ou":"<b>ou</b> sans accent sert à choisir : on peut dire « ou bien ».", "où":"<b>où</b> avec accent parle d'un lieu ou d'un moment (Où vas-tu ? le jour où…)." },
      phrases:[["Tu veux du jus ___ de l'eau ?","ou"],["___ habites-tu ?","où"],["La maison ___ j'habite est grande.","où"],["Rouge ___ bleu, choisis !","ou"],
        ["Je ne sais pas ___ est mon stylo.","où"],["On ira au cinéma ___ à la piscine.","ou"],["Le jour ___ il a neigé, nous avons fait un bonhomme.","où"],
        ["Tu viens ce soir ___ demain ?","ou"],["___ vas-tu en vacances ?","où"],["Tu préfères un chat ___ un chien ?","ou"]] },
    la: { mots:["la","là","l'a"], test:{ "l'a":"l'avait", "là":"ici" },
      regle:{ "là":"<b>là</b> avec accent indique un lieu : on peut dire « ici ».", "l'a":"<b>l'a</b>, c'est « le » ou « la » + le verbe avoir : on peut dire « l'avait ».",
              "la":"<b>la</b> sans accent est devant un nom féminin (la table) ou remplace un nom féminin (cette histoire, je la connais)." },
      phrases:[["Pose ton sac ___, près de la porte.","là"],["Mon ballon ? Paul ___ lancé dans le jardin.","l'a"],["___ maîtresse explique la leçon.","la"],["Cette histoire, je ___ connais par cœur.","la"],
        ["Reste ___ et attends-moi.","là"],["Le gâteau ? Maman ___ coupé en huit.","l'a"],["Je mets ___ table pour le repas.","la"],["Le chat ? Mon frère ___ nourri ce matin.","l'a"],
        ["Il ouvre ___ fenêtre.","la"],["Mes clés sont ___, sur la table.","là"]] },
    ce: { mots:["ce","se"],
      regle:{ "se":"<b>se</b> est devant un verbe : on peut le remplacer par « me » (il se lave → je me lave).", "ce":"<b>ce</b> est devant un nom ou sert à montrer : on peut dire « ce …-là » (ce chien-là)." },
      phrases:[["Il ___ lave les mains.","se"],["___ chien aboie fort.","ce"],["Elle ___ promène au bord du lac.","se"],["J'aime ___ jeu.","ce"],
        ["Les enfants ___ cachent derrière l'arbre.","se"],["___ matin, il fait beau.","ce"],["Mon chat ___ couche sur le canapé.","se"],["Tu vois ___ bateau ?","ce"],
        ["Ils ___ disputent souvent.","se"],["Range ___ cahier, s'il te plaît.","ce"]] },
    leur: { mots:["leur","leurs"],
      regle:{ "leur":"Devant un verbe, <b>leur</b> ne prend jamais de s (c'est le pluriel de « lui »). Devant un nom au singulier, on écrit aussi <b>leur</b>.",
              "leurs":"Devant un nom au pluriel, on écrit <b>leurs</b> (leurs affaires, leurs clés)." },
      phrases:[["Les élèves rangent ___ affaires.","leurs"],["Je ___ donne un bonbon.","leur"],["Mes voisins promènent ___ chien.","leur"],["Les oiseaux nourrissent ___ petits.","leurs"],
        ["La maîtresse ___ explique la règle.","leur"],["Ils ont oublié ___ clés.","leurs"],["Mes cousins ont vendu ___ maison.","leur"],["Je ___ ai écrit une lettre.","leur"],
        ["Les joueurs saluent ___ supporters.","leurs"],["Nous ___ parlons souvent.","leur"]] }
  };

  function remplir(phrase, mot){
    var debut = phrase.indexOf("___") === 0;
    var m = debut ? mot.charAt(0).toUpperCase() + mot.slice(1) : mot;
    return M.echapper(phrase).replace("___", "<b>" + M.echapper(m) + "</b>");
  }
  function question(cle){
    var p = cle.split(":"), paire = PAIRES[p[0]], ph = paire.phrases[parseInt(p[1],10)];
    var phrase = ph[0], rep = ph[1];
    var aff = M.echapper(phrase).replace("___", '<span class="gap">?</span>');
    var expl = "";
    var testMot = Object.keys(paire.test || {});
    if(testMot.length){
      // on essaie la forme « test » qui correspond à la bonne réponse, sinon celle d'une autre forme
      var t = paire.test[rep];
      if(t) expl += "Essaie de dire : « " + remplir(phrase, t) + " ». Ça marche, donc on écrit <b>" + M.echapper(rep) + "</b>.<br>";
      else { var autre = testMot[0]; expl += "Essaie de dire : « " + remplir(phrase, paire.test[autre]) + " ». Ça ne marche pas, donc ce n'est pas « " + M.echapper(autre) + " ».<br>"; }
    }
    expl += paire.regle[rep];
    return { enonce:"<small>Choisis le bon mot</small>" + aff, choix:paire.mots.slice(), reponses:[rep], explication:expl,
             resume: M.echapper(phrase) };
  }
  function cles(ids){ return function(){ var out = []; ids.forEach(function(id){ PAIRES[id].phrases.forEach(function(_, i){ out.push(id + ":" + i); }); }); return out; }; }
  M.inscrire({ id:"homophones", titre:"Le duel des homophones", emoji:"⚔️", matiere:"Français",
    intro:"Des mots qui se prononcent pareil mais ne s'écrivent pas pareil. Choisis le bon ! Si tu te trompes, on t'explique l'astuce.",
    niveaux:[
      { id:"a-et", nom:"a / à et et / est", desc:"L'astuce : remplacer par « avait » ou « était »", cles:cles(["a","et"]), question:question },
      { id:"son-on", nom:"son / sont et on / ont", desc:"L'astuce : « étaient », « avaient », « il »", cles:cles(["son","on"]), question:question },
      { id:"ces-ou", nom:"ces / ses et ou / où", desc:"Montrer ou posséder ? Choisir ou un lieu ?", cles:cles(["ces","ou"]), question:question },
      { id:"la-ce", nom:"la / là / l'a et ce / se", desc:"Ici, l'avait, me…", cles:cles(["la","ce"]), question:question },
      { id:"leur", nom:"leur / leurs", desc:"Avec ou sans s ?", cles:cles(["leur"]), question:question },
      { id:"tout", nom:"Le grand mélange", desc:"Tous les homophones ensemble", n:15, cles:cles(Object.keys(PAIRES)), question:question }
    ]});
})();
