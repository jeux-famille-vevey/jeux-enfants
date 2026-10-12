/* Les cantons suisses — carte, noms, abréviations, chefs-lieux, langues. Nécessite carte-suisse.js */
(function(){
  var M = Moteur;
  var C = { // numéro OFS : [abréviation, nom, chef-lieu, langue(s)]
    1:["ZH","Zurich","Zurich","allemand"], 2:["BE","Berne","Berne","allemand et français"], 3:["LU","Lucerne","Lucerne","allemand"], 4:["UR","Uri","Altdorf","allemand"],
    5:["SZ","Schwytz","Schwytz","allemand"], 6:["OW","Obwald","Sarnen","allemand"], 7:["NW","Nidwald","Stans","allemand"], 8:["GL","Glaris","Glaris","allemand"],
    9:["ZG","Zoug","Zoug","allemand"], 10:["FR","Fribourg","Fribourg","français et allemand"], 11:["SO","Soleure","Soleure","allemand"], 12:["BS","Bâle-Ville","Bâle","allemand"],
    13:["BL","Bâle-Campagne","Liestal","allemand"], 14:["SH","Schaffhouse","Schaffhouse","allemand"], 15:["AR","Appenzell Rhodes-Extérieures","Herisau","allemand"],
    16:["AI","Appenzell Rhodes-Intérieures","Appenzell","allemand"], 17:["SG","Saint-Gall","Saint-Gall","allemand"], 18:["GR","Grisons","Coire","allemand, romanche et italien"],
    19:["AG","Argovie","Aarau","allemand"], 20:["TG","Thurgovie","Frauenfeld","allemand"], 21:["TI","Tessin","Bellinzone","italien"], 22:["VD","Vaud","Lausanne","français"],
    23:["VS","Valais","Sion","français et allemand"], 24:["NE","Neuchâtel","Neuchâtel","français"], 25:["GE","Genève","Genève","français"], 26:["JU","Jura","Delémont","français"]
  };
  var TOUS = Object.keys(C).map(Number);
  var ROMANDIE = [22,25,23,24,10,26,2];
  var PETITS = [12,16,7,6,9]; // trop petits pour cliquer facilement

  if(!document.getElementById("styleCarte")){
    var st = document.createElement("style"); st.id = "styleCarte";
    st.textContent = ".carte{width:100%;max-width:640px;height:auto;max-height:46vh}.carte path.c{fill:#3A4090;stroke:#1D2357;stroke-width:1.4;transition:fill .15s}" +
      ".carte path.c.cible{fill:#FFD23F}.carte.clic path.c{cursor:pointer}.carte.clic path.c:hover{fill:#5A61B8}.carte path.c.ok{fill:#2EC4B6}.carte path.c.ko{fill:#FF5D8F}" +
      ".carte .lac{fill:#4CC9F0;opacity:.55;pointer-events:none}.carte text{pointer-events:none}";
    document.head.appendChild(st);
  }
  function carte(cible, clic){
    var K = window.CARTE_SUISSE, s = '<svg class="carte' + (clic ? " clic" : "") + '" viewBox="0 0 ' + K.w + " " + K.h + '" role="img" aria-label="Carte des cantons suisses">';
    TOUS.forEach(function(id){ s += '<path class="c' + (id === cible ? " cible" : "") + '" data-id="' + id + '" d="' + K.c[id].d + '"/>'; });
    K.lakes.forEach(function(d){ s += '<path class="lac" d="' + d + '"/>'; });
    if(cible && !clic){ var p = K.c[cible]; s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="9" fill="#1D2357" stroke="#FFF8E7" stroke-width="3"/>'; }
    return s + "</svg>";
  }
  function surligner(el, id, cls){ var p = el.querySelector('path.c[data-id="' + id + '"]'); if(p){ p.classList.remove("cible"); p.classList.add(cls); } }
  function fiche(id){ var c = C[id]; return "C'est le canton de <b>" + c[1] + "</b> (" + c[0] + "). Chef-lieu : " + c[2] + ". On y parle " + c[3] + "."; }
  function noms(ids){ return ids.map(function(i){ return C[i][1]; }); }

  function quelCanton(pool){
    return function(cle){ var id = Number(cle);
      return { enonce:"<small>Quel est ce canton ?</small>", visuel:carte(id), choix:M.choixAvec(C[id][1], noms(pool.filter(function(x){ return x !== id; })), 4),
        reponses:[C[id][1]], explication:fiche(id), resume:"Le canton en jaune (" + C[id][0] + ")" };
    };
  }
  function trouver(cle){
    var id = Number(cle);
    return { enonce:"<small>Touche le canton sur la carte</small><span class=\"big\">" + C[id][1] + "</span>", reponses:[C[id][1]], explication:fiche(id) + " Il est maintenant en vert sur la carte.",
      resume:"Trouver " + C[id][1],
      monter:function(el, repondre){
        el.innerHTML = carte(null, true);
        el.querySelector("svg").addEventListener("click", function(e){
          var p = e.target.closest && e.target.closest("path.c"); if(!p) return;
          var choisi = Number(p.getAttribute("data-id"));
          el.querySelector("svg").classList.remove("clic");
          surligner(el, id, "ok"); if(choisi !== id) surligner(el, choisi, "ko");
          repondre(C[choisi][1]);
        });
      } };
  }
  function abreviation(cle){
    var id = Number(cle);
    return { enonce:"<small>Quel canton a cette abréviation ?</small><span class=\"big\">" + C[id][0] + "</span>", visuel:carte(null),
      choix:M.choixAvec(C[id][1], noms(TOUS.filter(function(x){ return x !== id && C[x][0].charAt(0) === C[id][0].charAt(0); })).concat(noms(TOUS.filter(function(x){ return x !== id; }))), 4),
      reponses:[C[id][1]], explication:fiche(id) + " Il est maintenant en vert sur la carte.", resume:C[id][0],
      apresFaux:function(el){ surligner(el, id, "ok"); } };
  }
  function cheflieu(cle){
    var id = Number(cle), autres = TOUS.filter(function(x){ return x !== id && C[x][2] !== C[id][2]; }).map(function(x){ return C[x][2]; });
    return { enonce:"<small>Quel est le chef-lieu de ce canton ?</small><span class=\"big\">" + C[id][1] + " (" + C[id][0] + ")</span>", visuel:carte(id),
      choix:M.choixAvec(C[id][2], autres, 4), reponses:[C[id][2]], explication:fiche(id) + (C[id][1] === C[id][2] ? " Ici, le chef-lieu porte le même nom que le canton !" : ""), resume:"Chef-lieu de " + C[id][1] };
  }
  function ens(t){ return t.replace(/,| et /g," ").split(/\s+/).filter(Boolean).sort().join(" "); }
  function langue(cle){
    var id = Number(cle), toutes = ["allemand","français","italien","allemand et français","français et allemand","allemand, romanche et italien"];
    return { enonce:"<small>Quelle langue parle-t-on dans ce canton ?</small><span class=\"big\">" + C[id][1] + "</span>", visuel:carte(id),
      choix:M.choixAvec(C[id][3], toutes.filter(function(x){ return ens(x) !== ens(C[id][3]); }), 4), reponses:[C[id][3]],
      explication:fiche(id) + " La Suisse a quatre langues nationales : l'allemand, le français, l'italien et le romanche.", resume:"Langue de " + C[id][1] };
  }
  var liste = function(ids){ return function(){ return ids.map(String); }; };
  M.inscrire({ id:"cantons", titre:"Les cantons suisses", emoji:"🇨🇭", matiere:"Le monde",
    intro:"La Suisse a 26 cantons. Apprends à les reconnaître sur la carte, avec leurs abréviations, leurs chefs-lieux et leurs langues.",
    niveaux:[
      { id:"romandie", nom:"La Suisse romande", desc:"Vaud, Genève, Valais et les voisins", n:8, cles:liste(ROMANDIE), question:quelCanton(ROMANDIE) },
      { id:"tous", nom:"Toute la Suisse", desc:"Les 26 cantons", cles:liste(TOUS), question:quelCanton(TOUS) },
      { id:"trouver", nom:"Trouve sur la carte", desc:"Touche le bon canton", cles:liste(TOUS.filter(function(x){ return PETITS.indexOf(x) < 0; })), question:trouver },
      { id:"abrev", nom:"Les abréviations", desc:"VD, GE, TI… comme sur les plaques", cles:liste(TOUS), question:abreviation },
      { id:"chefs", nom:"Les chefs-lieux", desc:"Lausanne, Sion, Bellinzone…", cles:liste(TOUS), question:cheflieu },
      { id:"langues", nom:"Les langues", desc:"Allemand, français, italien, romanche", cles:liste(TOUS), question:langue }
    ]});
})();
