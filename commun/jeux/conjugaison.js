/* Conjugaison express — 7P : présent, imparfait, futur, conditionnel présent, impératif, passé composé */
(function(){
  var M = Moteur;
  var PRON = ["je","tu","il","nous","vous","ils","elle","elles"]; // 6 = elle, 7 = elles
  var RANG = [0,1,2,3,4,5,2,5];
  var FIN = { present_er:["e","es","e","ons","ez","ent"], imparfait:["ais","ais","ait","ions","iez","aient"], futur:["ai","as","a","ons","ez","ont"], conditionnel:["ais","ais","ait","ions","iez","aient"] };

  /* Verbes irréguliers (tables complètes) */
  var IRR = {
    "être":   { p:["suis","es","est","sommes","êtes","sont"], imp:"ét", fut:"ser", pp:"été", aux:"avoir", ipt:["sois","soyons","soyez"] },
    "avoir":  { p:["ai","as","a","avons","avez","ont"], imp:"av", fut:"aur", pp:"eu", aux:"avoir", ipt:["aie","ayons","ayez"] },
    "aller":  { p:["vais","vas","va","allons","allez","vont"], imp:"all", fut:"ir", pp:"allé", aux:"être", ipt:["va","allons","allez"] },
    "faire":  { p:["fais","fais","fait","faisons","faites","font"], imp:"fais", fut:"fer", pp:"fait", aux:"avoir", ipt:["fais","faisons","faites"] },
    "dire":   { p:["dis","dis","dit","disons","dites","disent"], imp:"dis", fut:"dir", pp:"dit", aux:"avoir", ipt:["dis","disons","dites"] },
    "venir":  { p:["viens","viens","vient","venons","venez","viennent"], imp:"ven", fut:"viendr", pp:"venu", aux:"être", ipt:["viens","venons","venez"] },
    "pouvoir":{ p:["peux","peux","peut","pouvons","pouvez","peuvent"], imp:"pouv", fut:"pourr", pp:"pu", aux:"avoir", ipt:null },
    "vouloir":{ p:["veux","veux","veut","voulons","voulez","veulent"], imp:"voul", fut:"voudr", pp:"voulu", aux:"avoir", ipt:null },
    "savoir": { p:["sais","sais","sait","savons","savez","savent"], imp:"sav", fut:"saur", pp:"su", aux:"avoir", ipt:["sache","sachons","sachez"] },
    "voir":   { p:["vois","vois","voit","voyons","voyez","voient"], imp:"voy", fut:"verr", pp:"vu", aux:"avoir", ipt:["vois","voyons","voyez"] },
    "prendre":{ p:["prends","prends","prend","prenons","prenez","prennent"], imp:"pren", fut:"prendr", pp:"pris", aux:"avoir", ipt:["prends","prenons","prenez"] },
    "mettre": { p:["mets","mets","met","mettons","mettez","mettent"], imp:"mett", fut:"mettr", pp:"mis", aux:"avoir", ipt:["mets","mettons","mettez"] },
    "partir": { p:["pars","pars","part","partons","partez","partent"], imp:"part", fut:"partir", pp:"parti", aux:"être", ipt:["pars","partons","partez"] },
    "sortir": { p:["sors","sors","sort","sortons","sortez","sortent"], imp:"sort", fut:"sortir", pp:"sorti", aux:"être", ipt:["sors","sortons","sortez"] }
  };
  /* Verbes en -er : type = normal | grave (acheter : è) | double (appeler : ll) | y (employer : i) */
  var ER = { chanter:"normal", jouer:"normal", parler:"normal", aimer:"normal", regarder:"normal", donner:"normal", travailler:"normal",
             manger:"normal", nager:"normal", commencer:"normal", lancer:"normal",
             acheter:"grave", peler:"grave", lever:"grave", appeler:"double", jeter:"double", payer:"y", employer:"y", nettoyer:"y" };
  var IR2 = ["finir","choisir","grandir","réussir"]; // 2e groupe

  function radical(v){ return v.slice(0, -2); }
  function fort(v){ // radical quand la terminaison est muette (je, tu, il, ils + futur)
    var r = radical(v), t = ER[v];
    if(t === "grave"){ var i = r.lastIndexOf("e"); return r.slice(0,i) + "è" + r.slice(i+1); }
    if(t === "double") return r + r.slice(-1);
    if(t === "y") return r.slice(0,-1) + "i";
    return r;
  }
  function nousEr(v){ var r = radical(v); if(/g$/.test(r)) return r + "eons"; if(/c$/.test(r)) return r.slice(0,-1) + "çons"; return r + "ons"; }

  // renvoie la liste des formes acceptées (la première est la forme « officielle »)
  function present(v, k){
    if(IRR[v]) return [IRR[v].p[k]];
    if(IR2.indexOf(v) >= 0){ var r = radical(v); return [[r+"is",r+"is",r+"it",r+"issons",r+"issez",r+"issent"][k]]; }
    if(k === 3) return [nousEr(v)];
    if(k === 4) return [radical(v) + "ez"];
    var f = [fort(v) + FIN.present_er[k]];
    if(ER[v] === "y" && v === "payer") f.push(radical(v) + FIN.present_er[k]); // je paie / je paye
    return f;
  }
  function radImp(v){
    if(IRR[v]) return IRR[v].imp;
    if(IR2.indexOf(v) >= 0) return radical(v) + "iss";
    return nousEr(v).slice(0, -3);
  }
  function imparfait(v, k){
    var r = radImp(v), e = FIN.imparfait[k];
    if(e.charAt(0) === "i"){ if(/ge$/.test(r)) r = r.slice(0,-1); else if(/ç$/.test(r)) r = r.slice(0,-1) + "c"; }
    return [r + e];
  }
  function radFut(v){
    if(IRR[v]) return [IRR[v].fut];
    if(IR2.indexOf(v) >= 0) return [v];
    var t = ER[v], out = [ (t && t !== "normal" ? fort(v) : radical(v)) + "er" ];
    if(v === "payer") out.push("payer");
    return out;
  }
  function futur(v, k){ return radFut(v).map(function(r){ return r + FIN.futur[k]; }); }
  function conditionnel(v, k){ return radFut(v).map(function(r){ return r + FIN.conditionnel[k]; }); }
  function pp(v){ if(IRR[v]) return IRR[v].pp; if(IR2.indexOf(v) >= 0) return radical(v) + "i"; return radical(v) + "é"; }
  function aux(v){ return IRR[v] ? IRR[v].aux : "avoir"; }
  function passeCompose(v, k, pi){
    var a = aux(v), ax = IRR[a].p[k], p = pp(v);
    if(a === "avoir") return [ax + " " + p];
    // accord avec être : elle → e, ils → s, elles → es ; je/tu/nous/vous : on accepte les deux genres
    var fem = pi === 6 || pi === 7, plur = k >= 3;
    var forms;
    if(pi === 2) forms = [p];
    else if(pi === 6) forms = [p+"e"];
    else if(pi === 5) forms = [p+"s"];
    else if(pi === 7) forms = [p+"es"];
    else if(k <= 1) forms = [p, p+"e"];
    else if(k === 3) forms = [p+"s", p+"es"];
    else forms = [p+"s", p+"es", p, p+"e"]; // vous (politesse)
    return forms.map(function(f){ return ax + " " + f; });
  }
  function imperatif(v, k){ // k : 1 = tu, 3 = nous, 4 = vous
    var j = {1:0, 3:1, 4:2}[k];
    if(IRR[v]) return IRR[v].ipt ? [IRR[v].ipt[j]] : null;
    if(IR2.indexOf(v) >= 0) return present(v, k);
    if(k === 1){ var f = [fort(v) + "e"]; if(v === "payer") f.push("paye"); return f; } // pas de s : mange !
    return present(v, k);
  }
  var TEMPS = {
    present:{ nom:"présent", f:present }, imparfait:{ nom:"imparfait", f:imparfait }, futur:{ nom:"futur simple", f:futur },
    conditionnel:{ nom:"conditionnel présent", f:conditionnel }, pc:{ nom:"passé composé", f:passeCompose }, imperatif:{ nom:"impératif présent", f:imperatif }
  };

  function elision(pron, forme){ return pron === "je" && /^[aeéèêiîouyh]/i.test(forme) ? "j'" : pron + " "; }
  function tableau(v, t){
    if(t === "imperatif") return [1,3,4].map(function(k){ var f = imperatif(v,k); return f ? f[0] + " !" : ""; }).join(" · ");
    return [0,1,2,3,4,5].map(function(k){ var f = TEMPS[t].f(v, k, k)[0]; return elision(PRON[k], f).replace(" ", " ") + f; }).join(" · ");
  }
  function regle(v, t){
    var r = "";
    if(t === "present"){
      if(IRR[v]) r = "« " + v + " » est un verbe irrégulier : il faut l'apprendre par cœur.";
      else if(IR2.indexOf(v) >= 0) r = "Les verbes comme finir prennent <b>-is, -is, -it, -issons, -issez, -issent</b>.";
      else r = "Les verbes en -er prennent <b>-e, -es, -e, -ons, -ez, -ent</b>.";
    }
    if(t === "imparfait") r = "Imparfait : on prend le radical de « nous » au présent, puis <b>-ais, -ais, -ait, -ions, -iez, -aient</b>." + (v === "être" ? " Attention, être fait « j'étais »." : "");
    if(t === "futur") r = "Futur : on part de l'infinitif et on ajoute <b>-ai, -as, -a, -ons, -ez, -ont</b>." + (IRR[v] ? " « " + v + " » change de radical : " + IRR[v].fut + "-." : "");
    if(t === "conditionnel") r = "Conditionnel présent : radical du futur + terminaisons de l'imparfait <b>-ais, -ais, -ait, -ions, -iez, -aient</b>. Exemple : je chanterai (futur) → je chanterais (conditionnel).";
    if(t === "pc") r = "Passé composé : auxiliaire <b>" + aux(v) + "</b> au présent + participe passé (<b>" + pp(v) + "</b>)." + (aux(v) === "être" ? " Avec être, le participe s'accorde avec le sujet : elle est " + pp(v) + "e, ils sont " + pp(v) + "s." : "");
    if(t === "imperatif") r = "Impératif : seulement tu, nous, vous, et sans pronom." + (ER[v] || v === "aller" ? " Pour les verbes en -er, pas de <b>s</b> avec tu : mange !" : "");
    var ty = ER[v];
    if(ty === "grave" && (t === "present" || t === "futur" || t === "conditionnel" || t === "imperatif")) r += " <br>« " + v + " » prend un <b>è</b> quand la syllabe suivante est muette : " + elision("je", fort(v)+"e") + fort(v) + "e, mais nous " + nousEr(v) + ".";
    if(ty === "double" && (t === "present" || t === "futur" || t === "conditionnel" || t === "imperatif")) r += " <br>« " + v + " » double sa consonne devant un e muet : " + (v==="appeler" ? "j'appelle, mais nous appelons" : "je jette, mais nous jetons") + ".";
    if(ty === "y" && (t === "present" || t === "futur" || t === "conditionnel" || t === "imperatif")) r += " <br>Le <b>y</b> devient <b>i</b> devant un e muet : " + (v==="payer" ? "je paie (on accepte aussi je paye)" : v==="employer" ? "j'emploie, mais nous employons" : "je nettoie, mais nous nettoyons") + ".";
    if((v === "manger" || v === "nager") && (t === "present" || t === "imparfait")) r += " <br>On garde le <b>e</b> devant a et o pour garder le son « je » : nous " + nousEr(v) + ".";
    if((v === "commencer" || v === "lancer") && (t === "present" || t === "imparfait")) r += " <br>On met une <b>cédille</b> devant a et o pour garder le son « s » : nous " + nousEr(v) + ".";
    return r;
  }

  function question(cle){
    var p = cle.split("|"), v = p[0], t = p[1], pi = parseInt(p[2],10), k = RANG[pi];
    var formes = TEMPS[t].f(v, k, pi);
    var pron = PRON[pi];
    var acc = [];
    formes.forEach(function(f){ acc.push(f); if(t === "imperatif"){ acc.push(f + " !"); acc.push(f + "!"); } else acc.push(elision(pron, f) + f); });
    var aff;
    if(t === "imperatif") aff = '<span class="gap">?</span> ! <small style="display:inline">(' + {1:"tu",3:"nous",4:"vous"}[k] + ")</small>";
    else aff = M.echapper(elision(pron, formes[0]).trim()) + ' <span class="gap">?</span>';
    return { enonce:"<small>Conjugue « <b>" + v + "</b> » au <b>" + TEMPS[t].nom + "</b></small><span class=\"big\">" + aff + "</span>",
      saisie:"texte", indice:"Écris le verbe", reponses:acc,
      explication: regle(v, t) + '<br><span style="color:var(--ink-soft)">Tout le tableau : ' + M.echapper(tableau(v, t)) + "</span>",
      resume: v + " au " + TEMPS[t].nom + " (" + (t === "imperatif" ? {1:"tu",3:"nous",4:"vous"}[k] : pron) + ")" };
  }
  function combinaisons(verbes, temps){
    return function(){
      var out = [];
      verbes.forEach(function(v){ temps.forEach(function(t){
        var personnes = t === "imperatif" ? [1,3,4] : [0,1,2,3,4,5,6,7];
        personnes.forEach(function(pi){ if(t === "imperatif" && !imperatif(v, pi)) return; out.push(v+"|"+t+"|"+pi); });
      }); });
      return out;
    };
  }
  var FACILES = ["chanter","jouer","parler","aimer","regarder","donner","être","avoir","aller","faire"];
  var SEPTP = ["acheter","peler","appeler","jeter","payer","employer","finir","choisir","manger","commencer"];
  var IRREG = ["être","avoir","aller","faire","dire","venir","pouvoir","vouloir","savoir","voir","prendre","mettre"];
  var TOUS = FACILES.concat(SEPTP, IRREG.slice(4), ["partir","sortir","travailler","nettoyer","grandir","réussir","lancer","nager"]);
  var uniq = function(a){ return a.filter(function(x,i){ return a.indexOf(x) === i; }); };

  M.conjuguer = function(v, t, pi){ return TEMPS[t].f(v, RANG[pi], pi); }; // utilisé pour les tests
  M.inscrire({ id:"conjugaison", titre:"Conjugaison express", emoji:"✍️", matiere:"Français",
    intro:"Écris le verbe conjugué. Tu peux écrire juste le verbe, ou avec le pronom. Si tu te trompes, tu vois la règle et tout le tableau.",
    niveaux:[
      { id:"present1", nom:"Présent : verbes faciles", desc:"Verbes en -er, être, avoir, aller, faire", cles:combinaisons(FACILES, ["present"]), question:question },
      { id:"present2", nom:"Présent : verbes de 7P", desc:"acheter, appeler, jeter, payer, employer…", cles:combinaisons(SEPTP, ["present"]), question:question },
      { id:"irreg", nom:"Présent : les irréguliers", desc:"dire, venir, pouvoir, vouloir, savoir, voir…", cles:combinaisons(IRREG, ["present"]), question:question },
      { id:"impfut", nom:"Imparfait et futur", desc:"Hier je jouais, demain je jouerai", cles:combinaisons(uniq(FACILES.concat(SEPTP)), ["imparfait","futur"]), question:question },
      { id:"cond", nom:"Conditionnel présent", desc:"Nouveau en 7P : je voudrais, nous pourrions…", cles:combinaisons(uniq(FACILES.concat(SEPTP, IRREG)), ["conditionnel"]), question:question },
      { id:"imperatif", nom:"Impératif", desc:"Donner un ordre : mange ! finissons ! soyez !", cles:combinaisons(uniq(FACILES.concat(SEPTP, IRREG)), ["imperatif"]), question:question },
      { id:"pc", nom:"Passé composé", desc:"avoir ou être + participe passé", cles:combinaisons(uniq(FACILES.concat(SEPTP, IRREG, ["partir","sortir","venir"])), ["pc"]), question:question },
      { id:"tout", nom:"Le grand mélange", desc:"Tous les temps et tous les verbes", n:15, cles:combinaisons(TOUS, ["present","imparfait","futur","conditionnel","pc","imperatif"]), question:question }
    ]});
})();
