/* Fabrique commune pour les jeux de langues (anglais, allemand).
   Thème : { id, nom, desc, mots:[[français, mot étranger, emoji, [autres réponses acceptées], note]] }
   Chaque thème donne un niveau : traduire vers la langue (choix) et depuis la langue (choix).
   À la fin : les niveaux de grammaire fournis, puis « Écris tous les mots ». */
(function(){
  var M = Moteur;
  M.jeuLangue = function(cfg){
    var L = cfg.langue, NOM = cfg.nomLangue; // ex. "en", "anglais"
    var parId = {}; // "theme:i" -> {t, m}
    cfg.themes.forEach(function(t){ t.mots.forEach(function(m, i){ parId[t.id + ":" + i] = { t:t, m:m }; }); });
    function voixOk(){ return !!M.voixPour(L); }
    function emo(m){ return m[2] ? '<span class="big">' + m[2] + "</span>" : ""; }
    function expl(m){ return "« " + M.echapper(m[0]) + " » se dit <b>" + M.echapper(m[1]) + "</b> en " + NOM + "." + (m[4] ? "<br>" + m[4] : "") + (cfg.astuce ? "<br>" + cfg.astuce(m) : ""); }

    function question(cle){
      var p = cle.split("|"), mode = p[1], it = parId[p[0]], m = it.m, t = it.t;
      var autres = t.mots.filter(function(x){ return x !== m; });
      var q = { langue:L, resume: m[0] + " ↔ " + m[1], explication:expl(m) };
      if(voixOk()) q.direApres = m[1];
      if(mode === "vers"){
        q.enonce = "<small>Comment dit-on en " + NOM + " ?</small>" + emo(m) + M.echapper(m[0]);
        q.choix = M.choixAvec(m[1], autres.map(function(x){ return x[1]; }), 4); q.reponses = [m[1]];
      } else if(mode === "depuis"){
        q.enonce = "<small>Que veut dire ce mot ?</small><span class=\"big\">" + M.echapper(m[1]) + "</span>";
        q.choix = M.choixAvec(m[0], autres.map(function(x){ return x[0]; }), 4); q.reponses = [m[0]];
        if(voixOk()){ q.parler = m[1]; q.direApres = null; }
      } else { // écrire
        q.enonce = "<small>Écris en " + NOM + "</small>" + emo(m) + M.echapper(m[0]);
        q.saisie = "texte"; q.indice = cfg.indiceEcrire ? cfg.indiceEcrire(m) : "Écris le mot en " + NOM;
        q.reponses = [m[1]].concat(m[3] || []);
      }
      return q;
    }
    var niveaux = cfg.themes.map(function(t){
      return { id:t.id, nom:t.nom, desc:t.desc, question:question,
        cles:function(){ var o = []; t.mots.forEach(function(_, i){ o.push(t.id + ":" + i + "|vers"); o.push(t.id + ":" + i + "|depuis"); }); return o; } };
    });
    niveaux = niveaux.concat(cfg.grammaire || []);
    niveaux.push({ id:"ecrire", nom:"Écris tous les mots", desc:"Sans aide, avec la bonne orthographe", n:15, question:question,
      cles:function(){ return Object.keys(parId).map(function(k){ return k + "|ecrire"; }); } });
    M.inscrire({ id:cfg.id, titre:cfg.titre, emoji:cfg.emoji, matiere:"Langues", intro:cfg.intro, niveaux:niveaux,
      preparer:function(){ M.voixPrete("fr").then(function(){
        var i = document.getElementById("mIntro");
        if(i && document.title === cfg.titre && !voixOk()) i.textContent = cfg.intro + " (Pas de voix en " + NOM + " sur cet appareil : les mots ne seront pas prononcés.)";
      }); } });
  };

  /* petit outil pour les phrases à trou de grammaire */
  M.phraseATrou = function(phrase, rep, choix, expl, langue, dire){
    var aff = M.echapper(phrase).replace("___", '<span class="gap">?</span>');
    var q = { enonce:"<small>Complète la phrase</small>" + aff, choix:M.choixAvec(rep, choix.filter(function(c){ return c !== rep; }), 4), reponses:[rep],
      explication:expl, resume:phrase, langue:langue };
    if(dire && M.voixPour(langue)) q.direApres = phrase.replace("___", rep).replace(/\s*\(.*?\)\s*/g, " ");
    return q;
  };
})();
