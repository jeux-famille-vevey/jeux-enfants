/* La carte du monde — continents, pays, capitales, drapeaux. Nécessite carte-monde.js (même principe que les cantons). */
(function(){
  var M = Moteur, K = window.CARTE_MONDE;
  // les drapeaux sont dans monde/drapeaux/ (chemin calculé depuis ce fichier, pour marcher aussi dans le « Défi du jour »)
  var DOSSIER_DRAPEAUX = new URL("../../monde/drapeaux/", (document.currentScript && document.currentScript.src) || location.href).href;

  /* ---------- les continents ---------- */
  var CONT = {
    europe:["l'Europe","Europe"], afrique:["l'Afrique","Afrique"], asie:["l'Asie","Asie"], amn:["l'Amérique du Nord","Amérique du Nord"],
    ams:["l'Amérique du Sud","Amérique du Sud"], oceanie:["l'Océanie","Océanie"], antarctique:["l'Antarctique","Antarctique"]
  };
  var NOMS_CONT = Object.keys(CONT).map(function(k){ return CONT[k][1]; });
  var INFO_CONT = {
    europe:"L'Europe est le continent de la Suisse. Il est petit, mais il a beaucoup de pays.",
    afrique:"L'Afrique est le deuxième plus grand continent. On y trouve le Sahara, le plus grand désert chaud du monde.",
    asie:"L'Asie est le plus grand continent. C'est là qu'habitent le plus de gens, en Chine et en Inde.",
    amn:"L'Amérique du Nord va du Canada jusqu'au Panama, avec les États-Unis et le Mexique.",
    ams:"L'Amérique du Sud a la forêt amazonienne, la plus grande forêt tropicale du monde.",
    oceanie:"L'Océanie, c'est l'Australie, la Nouvelle-Zélande et beaucoup d'îles dans l'océan Pacifique.",
    antarctique:"L'Antarctique est tout au sud, couvert de glace. Personne n'y habite toute l'année, à part des scientifiques… et les manchots !"
  };

  /* ---------- les pays : [nom, capitale (ou "" si on ne la demande pas), carte où on le montre] ----------
     Capitales non demandées quand elles prêtent à confusion (plusieurs capitales, capitale contestée ou qui change). */
  var P = {
    // Europe
    FR:["la France","Paris"], DE:["l'Allemagne","Berlin"], IT:["l'Italie","Rome"], ES:["l'Espagne","Madrid"], PT:["le Portugal","Lisbonne"],
    CH:["la Suisse","Berne"], AT:["l'Autriche","Vienne"], BE:["la Belgique","Bruxelles"], NL:["les Pays-Bas","Amsterdam"], LU:["le Luxembourg","Luxembourg"],
    GB:["le Royaume-Uni","Londres"], IE:["l'Irlande","Dublin"], IS:["l'Islande","Reykjavik"], NO:["la Norvège","Oslo"], SE:["la Suède","Stockholm"],
    FI:["la Finlande","Helsinki"], DK:["le Danemark","Copenhague"], PL:["la Pologne","Varsovie"], CZ:["la Tchéquie","Prague"], SK:["la Slovaquie","Bratislava"],
    HU:["la Hongrie","Budapest"], SI:["la Slovénie","Ljubljana"], HR:["la Croatie","Zagreb"], BA:["la Bosnie-Herzégovine","Sarajevo"], RS:["la Serbie","Belgrade"],
    ME:["le Monténégro","Podgorica"], AL:["l'Albanie","Tirana"], MK:["la Macédoine du Nord","Skopje"], GR:["la Grèce","Athènes"], BG:["la Bulgarie","Sofia"],
    RO:["la Roumanie","Bucarest"], MD:["la Moldavie","Chisinau"], UA:["l'Ukraine","Kiev"], BY:["la Biélorussie","Minsk"], LT:["la Lituanie","Vilnius"],
    LV:["la Lettonie","Riga"], EE:["l'Estonie","Tallinn"], RU:["la Russie","Moscou"], LI:["le Liechtenstein","Vaduz"], MT:["Malte","La Valette"], CY:["Chypre","Nicosie"],
    // Afrique
    MA:["le Maroc","Rabat"], DZ:["l'Algérie","Alger"], TN:["la Tunisie","Tunis"], LY:["la Libye","Tripoli"], EG:["l'Égypte","Le Caire"], SD:["le Soudan",""],
    SN:["le Sénégal","Dakar"], ML:["le Mali","Bamako"], NE:["le Niger","Niamey"], TD:["le Tchad","N'Djamena"], NG:["le Nigeria","Abuja"], GH:["le Ghana","Accra"],
    CI:["la Côte d'Ivoire",""], CM:["le Cameroun","Yaoundé"], CD:["la République démocratique du Congo","Kinshasa"], AO:["l'Angola","Luanda"],
    ET:["l'Éthiopie","Addis-Abeba"], SO:["la Somalie","Mogadiscio"], DJ:["Djibouti","Djibouti"], ER:["l'Érythrée","Asmara"], KE:["le Kenya","Nairobi"],
    UG:["l'Ouganda","Kampala"], RW:["le Rwanda","Kigali"], TZ:["la Tanzanie",""], MG:["Madagascar","Antananarivo"], MZ:["le Mozambique","Maputo"],
    ZA:["l'Afrique du Sud",""], NA:["la Namibie","Windhoek"], BW:["le Botswana","Gaborone"], ZW:["le Zimbabwe","Harare"], ZM:["la Zambie","Lusaka"], MR:["la Mauritanie","Nouakchott"],
    // Asie
    CN:["la Chine","Pékin"], JP:["le Japon","Tokyo"], KR:["la Corée du Sud","Séoul"], IN:["l'Inde","New Delhi"], PK:["le Pakistan","Islamabad"],
    AF:["l'Afghanistan","Kaboul"], IR:["l'Iran","Téhéran"], IQ:["l'Irak","Bagdad"], SA:["l'Arabie saoudite","Riyad"], TR:["la Turquie","Ankara"],
    SY:["la Syrie","Damas"], LB:["le Liban","Beyrouth"], JO:["la Jordanie","Amman"], AE:["les Émirats arabes unis","Abou Dabi"], QA:["le Qatar","Doha"],
    TH:["la Thaïlande","Bangkok"], VN:["le Vietnam","Hanoï"], ID:["l'Indonésie",""], PH:["les Philippines","Manille"], MN:["la Mongolie","Oulan-Bator"],
    KZ:["le Kazakhstan","Astana"], NP:["le Népal","Katmandou"], BD:["le Bangladesh","Dacca"], MY:["la Malaisie","Kuala Lumpur"],
    // Amériques
    US:["les États-Unis","Washington"], CA:["le Canada","Ottawa"], MX:["le Mexique","Mexico"], CU:["Cuba","La Havane"], JM:["la Jamaïque","Kingston"], GL:["le Groenland",""],
    BR:["le Brésil","Brasilia"], AR:["l'Argentine","Buenos Aires"], CL:["le Chili","Santiago"], PE:["le Pérou","Lima"], CO:["la Colombie","Bogota"],
    VE:["le Venezuela","Caracas"], EC:["l'Équateur","Quito"], BO:["la Bolivie",""], UY:["l'Uruguay","Montevideo"], PY:["le Paraguay","Asuncion"],
    // Océanie
    AU:["l'Australie","Canberra"], NZ:["la Nouvelle-Zélande","Wellington"], PG:["la Papouasie-Nouvelle-Guinée","Port Moresby"]
  };
  function sans(n){ return n.replace(/^(la |le |les |l')/, ""); }   // « la France » → « France »
  function nom(a){ var n = sans(P[a][0]); return n.charAt(0).toUpperCase() + n.slice(1); }
  function cont(a){ var p = K.monde.p[a] || K.europe.p[a]; return p && p.k; }
  function enEurope(a){ return cont(a) === "europe" && !!K.europe.p[a]; }

  var TOUS = Object.keys(P).filter(function(a){ return K.monde.p[a] || K.europe.p[a]; });
  var EUROPE = TOUS.filter(enEurope);
  var EUROPE_FACILE = ["FR","DE","IT","ES","PT","CH","AT","BE","NL","GB","IE","PL","GR","NO","SE","FI","DK","UA","IS","RU"];
  var MONDE_FACILE = ["US","CA","MX","BR","AR","CL","PE","CO","CN","JP","IN","RU","AU","EG","MA","DZ","ZA","SO","ET","KE","NG","SA","TR","IR","MG","NZ","GL","ID","KZ","MN"];
  var CAPITALES = TOUS.filter(function(a){ return P[a][1]; });
  var DRAPEAUX = ["FR","DE","IT","ES","PT","CH","AT","BE","NL","GB","IE","GR","SE","NO","FI","DK","PL","UA","RU","TR","US","CA","MX","BR","AR","CL","CO",
                  "JP","CN","KR","IN","PK","SA","AE","QA","MA","DZ","TN","EG","SN","CM","NG","GH","SO","ET","KE","ZA","CD","AU","NZ","CU","JM","LB","VN","TH"];

  /* ---------- dessin ---------- */
  if(!document.getElementById("styleMonde")){
    var st = document.createElement("style"); st.id = "styleMonde";
    st.textContent = ".carteM{width:100%;max-width:820px;height:auto;max-height:52vh;display:block;margin:0 auto}" +
      ".carteM .mer{fill:#4CC9F0;opacity:.45}.carteM path.p{fill:#3A4090;stroke:#1D2357;stroke-width:.5;transition:fill .15s}" +
      ".carteM.eu path.p{stroke-width:1}.carteM path.p.hors{fill:#2A2F6E}" +
      ".carteM path.p.cible{fill:#FFD23F}.carteM.clic path.p{cursor:pointer}.carteM.clic path.p:hover{fill:#5A61B8}" +
      ".carteM path.p.ok{fill:#2EC4B6}.carteM path.p.ko{fill:#FF5D8F}.carteM .rond{fill:none;stroke:#FFD23F;stroke-width:3}" +
      ".drapeau{display:block;margin:6px auto;width:min(300px,70vw);aspect-ratio:4/3;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.25);background:#fff;object-fit:cover}";
    document.head.appendChild(st);
  }
  // quelle carte pour ce pays : l'Europe en grand pour les pays d'Europe
  function laCarte(a){ return enEurope(a) ? "europe" : "monde"; }
  function dessiner(quelle, opts){
    opts = opts || {};
    var C = K[quelle], eu = quelle === "europe";
    var s = '<svg class="carteM' + (eu ? " eu" : "") + (opts.clic ? " clic" : "") + '" viewBox="0 0 ' + C.w + " " + C.h + '" role="img" aria-label="Carte">';
    s += eu ? '<rect class="mer" width="' + C.w + '" height="' + C.h + '"/>' : '<path class="mer" d="' + K.monde.sphere + '"/>';
    Object.keys(C.p).forEach(function(a){
      var cls = "p";
      if(opts.cible === a || (opts.continent && C.p[a].k === opts.continent)) cls += " cible";
      if(eu && cont(a) !== "europe") cls += " hors";   // les voisins (Afrique, Asie) un peu plus sombres
      s += '<path class="' + cls + '" data-id="' + a + '" d="' + C.p[a].d + '"/>';
    });
    // un rond autour des petits pays pour qu'on les voie bien
    if(opts.cible && C.p[opts.cible] && C.p[opts.cible].a < (eu ? 400 : 60)){
      var p = C.p[opts.cible]; s += '<circle class="rond" cx="' + p.x + '" cy="' + p.y + '" r="' + (eu ? 22 : 12) + '"/>';
    }
    return s + "</svg>";
  }
  function marquer(el, a, cls){ el.querySelectorAll('path.p[data-id="' + a + '"]').forEach(function(p){ p.classList.remove("cible"); p.classList.add(cls); }); }
  function fiche(a){
    var t = "C'est <b>" + P[a][0] + "</b>";
    var c = cont(a); if(c && CONT[c]) t += ", en " + CONT[c][1];
    if(P[a][1]) t += ". Sa capitale est <b>" + P[a][1] + "</b>";
    return t + ".";
  }
  function noms(liste){ return liste.map(nom); }
  function drapeau(a){ return '<img class="drapeau" alt="Drapeau" src="' + DOSSIER_DRAPEAUX + a.toLowerCase() + '.svg">'; }

  /* ---------- les questions ---------- */
  function quelContinent(cle){
    return { enonce:"<small>Quel est ce continent ?</small>", visuel:dessiner("monde", { continent: cle }),
      choix:M.choixAvec(CONT[cle][1], NOMS_CONT.filter(function(x){ return x !== CONT[cle][1]; }), 4),
      reponses:[CONT[cle][1]], explication:"C'est " + CONT[cle][0] + ". " + INFO_CONT[cle], resume:"Le continent en jaune" };
  }
  function trouverContinent(cle){
    return { enonce:"<small>Touche ce continent sur la carte</small><span class=\"big\">" + CONT[cle][1] + "</span>", reponses:[CONT[cle][1]],
      explication:INFO_CONT[cle], resume:"Trouver " + CONT[cle][0],
      monter:function(el, repondre){
        el.innerHTML = dessiner("monde", { clic: true });
        var svg = el.querySelector("svg");
        svg.addEventListener("click", function(e){
          var p = e.target.closest && e.target.closest("path.p"); if(!p) return;
          var k = K.monde.p[p.getAttribute("data-id")].k; if(!k || !CONT[k]) return;
          svg.classList.remove("clic");
          Object.keys(K.monde.p).forEach(function(a){ var c = K.monde.p[a].k; if(c === cle) marquer(el, a, "ok"); else if(c === k) marquer(el, a, "ko"); });
          repondre(CONT[k][1]);
        });
      } };
  }
  function quelPays(pool){
    return function(a){
      var memeCarte = pool.filter(function(x){ return x !== a; });
      // des voisins du même continent d'abord, c'est plus juste
      var proches = memeCarte.filter(function(x){ return cont(x) === cont(a); });
      return { enonce:"<small>Quel est ce pays ?</small>", visuel:dessiner(laCarte(a), { cible: a }),
        choix:M.choixAvec(nom(a), noms(proches).concat(noms(memeCarte)), 4), reponses:[nom(a)], explication:fiche(a), resume:"Le pays en jaune (" + nom(a) + ")" };
    };
  }
  function trouverPays(a){
    var quelle = laCarte(a);
    return { enonce:"<small>Touche ce pays sur la carte</small><span class=\"big\">" + nom(a) + "</span>", reponses:[nom(a)],
      explication:fiche(a) + " Il est maintenant en vert sur la carte.", resume:"Trouver " + nom(a),
      monter:function(el, repondre){
        el.innerHTML = dessiner(quelle, { clic: true });
        var svg = el.querySelector("svg");
        svg.addEventListener("click", function(e){
          var p = e.target.closest && e.target.closest("path.p"); if(!p) return;
          var choisi = p.getAttribute("data-id");
          svg.classList.remove("clic");
          marquer(el, a, "ok"); if(choisi !== a) marquer(el, choisi, "ko");
          repondre(P[choisi] ? nom(choisi) : "un autre pays");
        });
      } };
  }
  function capitale(a){
    var autres = CAPITALES.filter(function(x){ return x !== a && P[x][1] !== P[a][1]; });
    var proches = autres.filter(function(x){ return cont(x) === cont(a); }).map(function(x){ return P[x][1]; });
    return { enonce:"<small>Quelle est la capitale de ce pays ?</small><span class=\"big\">" + nom(a) + "</span>", visuel:dessiner(laCarte(a), { cible: a }),
      choix:M.choixAvec(P[a][1], proches.concat(autres.map(function(x){ return P[x][1]; })), 4), reponses:[P[a][1]],
      explication:fiche(a) + (sans(P[a][0]) === P[a][1] ? " Ici, la capitale porte le même nom que le pays !" : ""), resume:"Capitale : " + nom(a) };
  }
  function quelDrapeau(a){
    var autres = DRAPEAUX.filter(function(x){ return x !== a; });
    return { enonce:"<small>À quel pays est ce drapeau ?</small>", visuel:drapeau(a),
      choix:M.choixAvec(nom(a), noms(autres.filter(function(x){ return cont(x) === cont(a); })).concat(noms(autres)), 4), reponses:[nom(a)],
      explication:fiche(a), resume:"Drapeau : " + nom(a) };
  }

  var liste = function(ids){ return function(){ return ids.slice(); }; };
  var assezGrand = function(a){ var q = laCarte(a), p = K[q].p[a]; return p && p.a >= (q === "europe" ? 250 : 45); };
  M.inscrire({ id:"monde", titre:"La carte du monde", emoji:"🌍", matiere:"Le monde",
    intro:"Le monde a 7 continents et presque 200 pays. Apprends à les reconnaître sur la carte, avec leurs capitales et leurs drapeaux.",
    niveaux:[
      { id:"continents", nom:"Les continents", desc:"Europe, Afrique, Asie…", n:7, cles:liste(Object.keys(CONT)), question:quelContinent },
      { id:"trouvecont", nom:"Trouve le continent", desc:"Touche le bon continent", n:7, cles:liste(Object.keys(CONT)), question:trouverContinent },
      { id:"europe", nom:"Les pays d'Europe", desc:"Les voisins de la Suisse et les autres", cles:liste(EUROPE_FACILE), question:quelPays(EUROPE) },
      { id:"monde", nom:"Les grands pays du monde", desc:"Brésil, Chine, Australie…", cles:liste(MONDE_FACILE), question:quelPays(TOUS) },
      { id:"trouver", nom:"Trouve le pays", desc:"Touche le bon pays sur la carte", cles:liste(EUROPE_FACILE.concat(MONDE_FACILE).filter(assezGrand)), question:trouverPays },
      { id:"tousEurope", nom:"Toute l'Europe", desc:"Tous les pays d'Europe", cles:liste(EUROPE), question:quelPays(EUROPE) },
      { id:"capitales", nom:"Les capitales", desc:"Paris, Berne, Tokyo…", cles:liste(CAPITALES), question:capitale },
      { id:"drapeaux", nom:"Les drapeaux", desc:"Reconnais le drapeau", cles:liste(DRAPEAUX), question:quelDrapeau }
    ]});
})();
