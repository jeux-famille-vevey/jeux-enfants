/* La dictée magique — l'ordinateur dit le mot, on l'écrit. Sans voix : le mot s'affiche 3 secondes puis disparaît. */
(function(){
  var M = Moteur;
  var voix = null; // null = pas encore vérifié
  // [mot, phrase d'exemple facultative (pour les mots qui se prononcent comme d'autres)]
  var LISTES = {
    in:[["lapin"],["pain","J'achète du pain à la boulangerie."],["main","Lève la main."],["matin"],["train"],["plein"],["peinture"],["timbre"],["important"],
        ["parfum"],["lundi"],["demain"],["jardin"],["dessin"],["chemin"],["ceinture"],["copain"],["sapin"]],
    ail:[["travail"],["médaille"],["paille"],["bataille"],["soleil"],["abeille"],["oreille"],["réveil"],["bouteille"],["feuille"],["fauteuil"],["écureuil"],
         ["portefeuille"],["orteil"],["sommeil"],["merveille"],["éventail"],["citrouille"]],
    acc:[["élève"],["fenêtre"],["forêt"],["château"],["hôpital"],["frère"],["mère","Ma mère est gentille."],["rivière"],["fête","C'est la fête !"],["tête","J'ai mal à la tête."],
         ["été","En été, il fait chaud."],["bébé"],["poème"],["île"],["goûter"],["théâtre"],["fidèle"],["pâte"]],
    dbl:[["pomme"],["ballon"],["terre"],["carotte"],["colle"],["nappe"],["lettre"],["assiette"],["personne"],["appareil"],["attention"],["addition"],
         ["sonnette"],["arrêt"],["village"],["grenouille"],["balle"],["trottoir"]],
    inv:[["aujourd'hui"],["beaucoup"],["toujours"],["jamais"],["souvent"],["pendant"],["maintenant"],["longtemps"],["quelquefois"],["pourtant"],
         ["ensuite"],["autrefois"],["d'abord"],["environ"],["parmi"],["sans","Un chat sans queue."],["vraiment"],["bientôt"],["déjà"],["très","C'est très bon."]],
    phr:[["Les oiseaux chantent dans les arbres."],["Mes cousins ont des chevaux."],["Ce matin, il fait très beau."],["Nous mangeons des gâteaux au chocolat."],
         ["Elle a perdu ses lunettes."],["On ira au parc demain."],["Les enfants sont dans le jardin."],["Mon frère joue au ballon."],
         ["Il fait froid et il neige."],["Les abeilles volent autour des fleurs."]]
  };
  function indice(liste, mot){
    if(liste === "in"){ var m = mot.match(/ain|ein|im|in|um|un/); return m ? "Ici, le son « in » s'écrit <b>" + m[0] + "</b>." + (/im/.test(mot) ? " Devant m, b et p, on écrit <b>im</b> au lieu de in." : "") : ""; }
    if(liste === "ail") return "Les mots <b>masculins</b> finissent par -ail, -eil, -euil (le soleil). Les mots <b>féminins</b> finissent par -aille, -eille, -euille, -ouille (une abeille).";
    if(liste === "acc"){ var a = []; if(/é/.test(mot)) a.push("é (aigu)"); if(/è/.test(mot)) a.push("è (grave)"); if(/[âêîôû]/.test(mot)) a.push("^ (circonflexe)"); return "Attention aux accents : " + a.join(", ") + "."; }
    if(liste === "dbl"){ var d = mot.match(/([a-z])\1/g) || []; return "Il y a une double consonne : <b>" + d.join(", ") + "</b>."; }
    if(liste === "inv") return "C'est un mot <b>invariable</b> : il s'écrit toujours pareil. Il faut l'apprendre par cœur.";
    return "Relis bien chaque mot : les accords (pluriel en -s ou -x), les accents et les homophones.";
  }
  function marquer(bon, faux){ // surligne la partie différente du mot correct
    var a = 0; while(a < bon.length && a < faux.length && bon[a] === faux[a]) a++;
    var b = 0; while(b < bon.length - a && b < faux.length - a && bon[bon.length-1-b] === faux[faux.length-1-b]) b++;
    return M.echapper(bon.slice(0,a)) + '<b style="color:var(--sun);text-decoration:underline">' + M.echapper(bon.slice(a, bon.length-b) || "·") + "</b>" + M.echapper(bon.slice(bon.length-b));
  }
  function fabrique(liste){
    return function(cle){
      var it = LISTES[liste].filter(function(x){ return x[0] === cle; })[0], mot = it[0];
      var phrase = liste === "phr";
      var acc = [mot]; if(phrase) acc.push(mot.replace(/[.!?]$/, ""));
      var q = { saisie:"texte", indice: phrase ? "Écris la phrase" : "Écris seulement le mot", reponses:acc, resume: phrase ? "La phrase" : "Le mot",
        // si elle écrit aussi la phrase d'exemple, on accepte quand même si le mot est bien écrit dedans
        accepter: phrase ? null : function(v, normal){
          var n = normal(v), m = normal(mot);
          if(n === m) return true;
          var morceaux = n.replace(/[.,!?;:«»"]/g, " ").split(/\s+/);
          return morceaux.indexOf(m) >= 0;
        },
        expliquer:function(v){ return "Tu as écrit : <i>" + M.echapper(v) + "</i><br>Le bon mot : " + marquer(mot, v.trim()) + "<br>" + indice(liste, mot); } };
      if(voix){
        q.enonce = "<small>Écoute bien et écris " + (phrase ? "toute la phrase" : "<b>seulement le mot</b> (pas la phrase d'exemple)") + "</small><span class=\"big\">🎧</span>";
        if(phrase){ // comme à l'école : la phrase, puis par petits groupes de mots, puis la phrase
          var mots = mot.replace(/[.!?]$/, "").split(" "), groupes = [];
          for(var g=0; g<mots.length; g+=3) groupes.push(mots.slice(g, g+3).join(" "));
          q.parler = [mot].concat(groupes, [mot]);
          q.parlerLent = groupes;
        } else {
          q.parler = it[1] ? [mot, "Comme dans la phrase : " + it[1], "Écris seulement le mot : " + mot] : [mot, "Écris : " + mot];
          q.parlerLent = [mot];
        }
      } else {
        q.enonce = "<small>Regarde bien, " + (phrase ? "la phrase" : "le mot") + " va disparaître…</small>";
        q.visuel = '<div class="big" id="dFlash" style="font-size:' + (phrase ? "1.6rem" : "2.6rem") + ';font-weight:700;color:var(--sun);min-height:1.4em">' + M.echapper(mot) + "</div>";
        q.apres = function(){ setTimeout(function(){ var f = document.getElementById("dFlash"); if(f) f.textContent = "🙈"; var i = document.getElementById("mInput"); if(i) i.focus(); }, phrase ? 5000 : 3000); };
        q.apresFaux = function(){ var f = document.getElementById("dFlash"); if(f) f.textContent = mot; };
      }
      return q;
    };
  }
  function cles(liste){ return function(){ return LISTES[liste].map(function(x){ return x[0]; }); }; }
  M.inscrire({ id:"dictee", titre:"La dictée magique", emoji:"🎧", matiere:"Français",
    intro:"Écoute le mot (bouton 🔊 pour le réentendre) et écris-le. Si tu te trompes, on te montre la lettre qui pose problème.",
    preparer:function(){
      var coupee = M.lire("mot-dictee-sansvoix") === "1";
      M.voixPrete().then(function(ok){
        voix = ok && !coupee;
        var i = document.getElementById("mIntro");
        if(!i || !/dictée/i.test(document.title)) return;
        if(!ok) i.textContent = "Cet appareil n'a pas de voix française : le mot s'affichera 3 secondes, puis il faudra l'écrire de mémoire.";
        else {
          // la voix de l'ordinateur peut être difficile à comprendre : on laisse choisir
          var b = document.createElement("button"); b.className = "btn ghost small"; b.id = "dVoix";
          var maj = function(){ b.textContent = voix ? "🔊 Avec la voix (toucher pour afficher les mots à la place)" : "👀 Les mots s'affichent (toucher pour remettre la voix)"; };
          b.onclick = function(){ voix = !voix; M.ecrire("mot-dictee-sansvoix", voix ? "0" : "1"); maj(); if(voix) M.parler("Bonjour ! Tu m'entends bien ?"); };
          maj(); i.parentNode.insertBefore(b, i.nextSibling);
          var v = document.createElement("button"); v.className = "btn ghost small"; v.id = "dVitesse";
          var majV = function(){ v.textContent = "🐢 Vitesse de la voix : " + M.nomVitesse() + " (toucher pour changer)"; };
          v.onclick = function(){ M.vitesse((M.vitesse() + 1) % 3); majV(); M.parler(["Bonjour", "Voici la nouvelle vitesse."]); };
          majV(); b.parentNode.insertBefore(v, b.nextSibling);
        }
      });
    },
    niveaux:[
      { id:"in", nom:"Le son « in »", desc:"in, ain, ein, im, un : lapin, pain, peinture…", cles:cles("in"), question:fabrique("in") },
      { id:"ail", nom:"ail, eil, euil, ouille", desc:"travail, soleil, abeille, feuille…", cles:cles("ail"), question:fabrique("ail") },
      { id:"acc", nom:"Les accents", desc:"é, è, ê, â, ô, î, û", cles:cles("acc"), question:fabrique("acc") },
      { id:"dbl", nom:"Les doubles consonnes", desc:"pomme, ballon, carotte…", cles:cles("dbl"), question:fabrique("dbl") },
      { id:"inv", nom:"Les mots invariables", desc:"aujourd'hui, beaucoup, toujours…", cles:cles("inv"), question:fabrique("inv") },
      { id:"phr", nom:"Petites phrases", desc:"Une phrase entière, avec les accords", n:6, cles:cles("phr"), question:fabrique("phr") }
    ]});
})();
