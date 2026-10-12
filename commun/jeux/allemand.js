/* L'allemand — 3e année (5P→7P), orthographe suisse (ss au lieu de ß, ß aussi accepté) */
(function(){
  var M = Moteur;
  function ss(t){ return t.replace(/ss/g, "ß"); }
  // [français, allemand, emoji, autres réponses, note]
  var THEMES = [
    { id:"hallo", nom:"Hallo ! Les salutations", desc:"Guten Tag, danke, tschüss…", mots:[
      ["salut (en arrivant)","Hallo","👋"],["bonjour (le matin)","Guten Morgen","🌅"],["bonjour (la journée)","Guten Tag","☀️"],["salut (en partant)","Tschüss","👋",["tschüs"]],
      ["au revoir","Auf Wiedersehen","🙋"],["s'il te plaît","bitte","🙏"],["merci","danke","😊"],["oui","ja","👍"],["non","nein","👎"],["bonne nuit","Gute Nacht","🌙"],
      ["Comment ça va ?","Wie geht's?","🙂",["wie gehts","wie geht es dir"]],["pardon / excuse-moi","Entschuldigung","😔"]] },
    { id:"farben", nom:"Die Farben : les couleurs", desc:"rot, blau, grün…", mots:[
      ["rouge","rot","🔴"],["bleu","blau","🔵"],["vert","grün","🟢"],["jaune","gelb","🟡"],["noir","schwarz","⚫"],["blanc","weiss","⚪",["weiß"]],
      ["orange","orange","🟠"],["rose","rosa","🌸"],["violet","lila","🟣",["violett"]],["brun / marron","braun","🟤"],["gris","grau","🌫️"]] },
    { id:"zahlen", nom:"Die Zahlen : les nombres", desc:"De eins à zwanzig", mots:[
      ["1","eins"],["2","zwei"],["3","drei"],["4","vier"],["5","fünf"],["6","sechs"],["7","sieben"],["8","acht"],["9","neun"],["10","zehn"],
      ["11","elf"],["12","zwölf"],["13","dreizehn"],["14","vierzehn"],["15","fünfzehn"],["16","sechzehn"],["17","siebzehn"],["18","achtzehn"],["19","neunzehn"],["20","zwanzig"]] },
    { id:"familie", nom:"Die Familie : la famille", desc:"die Mutter, der Vater…", mots:[
      ["la mère","die Mutter","👩",["die Mama"]],["le père","der Vater","👨",["der Papa"]],["la sœur","die Schwester","👧"],["le frère","der Bruder","👦"],
      ["la grand-mère","die Grossmutter","👵",["die Großmutter","die Oma"]],["le grand-père","der Grossvater","👴",["der Großvater","der Opa"]],["le bébé","das Baby","👶"],
      ["la famille","die Familie","👨‍👩‍👧‍👦"],["la tante","die Tante","👩"],["l'oncle","der Onkel","👨"],["les parents","die Eltern","👫",[],"<b>die Eltern</b> n'existe qu'au pluriel."]] },
    { id:"tiere", nom:"Die Tiere : les animaux", desc:"der Hund, die Katze…", mots:[
      ["le chien","der Hund","🐶"],["le chat","die Katze","🐱"],["le cheval","das Pferd","🐴"],["la vache","die Kuh","🐮"],["le cochon","das Schwein","🐷"],["le mouton","das Schaf","🐑"],
      ["l'oiseau","der Vogel","🐦"],["le poisson","der Fisch","🐟"],["le lapin","das Kaninchen","🐰",["der Hase"]],["la souris","die Maus","🐭"],["le lion","der Löwe","🦁"],
      ["l'éléphant","der Elefant","🐘"],["le singe","der Affe","🐵"],["l'ours","der Bär","🐻"],["la grenouille","der Frosch","🐸"],["le canard","die Ente","🦆"]] },
    { id:"schule", nom:"Die Schule : l'école", desc:"das Buch, der Bleistift…", mots:[
      ["le stylo","der Kugelschreiber","🖊️",["der Kuli"]],["le crayon","der Bleistift","✏️"],["le livre","das Buch","📖"],["le cahier","das Heft","📓"],
      ["le sac d'école","die Schultasche","🎒",["der Schulranzen","der Schulsack","der Rucksack"]],["la règle","das Lineal","📏"],["la gomme","der Radiergummi","🧽"],
      ["les ciseaux","die Schere","✂️"],["l'enseignante","die Lehrerin","👩‍🏫"],["l'enseignant","der Lehrer","👨‍🏫"],["la table","der Tisch",""],["la chaise","der Stuhl","🪑"],
      ["l'ordinateur","der Computer","💻"]] },
    { id:"essen", nom:"Das Essen : la nourriture", desc:"der Apfel, das Brot…", mots:[
      ["la pomme","der Apfel","🍎"],["le pain","das Brot","🍞"],["le lait","die Milch","🥛"],["l'eau","das Wasser","💧"],["le fromage","der Käse","🧀"],["l'œuf","das Ei","🥚"],
      ["la banane","die Banane","🍌"],["le chocolat","die Schokolade","🍫"],["le gâteau","der Kuchen","🍰"],["le jus d'orange","der Orangensaft","🧃"],["la carotte","die Karotte","🥕",["das Rüebli"]],
      ["la glace","das Eis","🍦",["die Glace"],"En Suisse, on dit aussi <b>die Glace</b>."],["la poire","die Birne","🍐"]] },
    { id:"koerper", nom:"Der Körper : le corps", desc:"der Kopf, die Hand…", mots:[
      ["la tête","der Kopf","🙂"],["l'œil","das Auge","👁️"],["le nez","die Nase","👃"],["la bouche","der Mund","👄"],["l'oreille","das Ohr","👂"],["la main","die Hand","✋"],
      ["le pied","der Fuss","🦶",["der Fuß"]],["le bras","der Arm","💪"],["la jambe","das Bein","🦵"],["les cheveux","die Haare","💇"],["la dent","der Zahn","🦷"],["le ventre","der Bauch",""]] },
    { id:"kleider", nom:"Die Kleider : les vêtements", desc:"die Hose, das Kleid…", mots:[
      ["le t-shirt","das T-Shirt","👕",["das tshirt"]],["le pantalon","die Hose","👖"],["les chaussures","die Schuhe","👟"],["la robe","das Kleid","👗"],["le chapeau","der Hut","👒"],
      ["la veste","die Jacke","🧥"],["la jupe","der Rock","👘"],["les chaussettes","die Socken","🧦"],["le pull","der Pullover","🧶",["der Pulli"]],["le bonnet","die Mütze","🧢",["die Kappe"]]] },
    { id:"tage", nom:"Die Tage und Monate", desc:"Les jours et les mois", mots:[
      ["lundi","Montag","",["der Montag"]],["mardi","Dienstag","",["der Dienstag"]],["mercredi","Mittwoch","",["der Mittwoch"]],["jeudi","Donnerstag","",["der Donnerstag"]],
      ["vendredi","Freitag","",["der Freitag"]],["samedi","Samstag","",["der Samstag"]],["dimanche","Sonntag","",["der Sonntag"]],
      ["janvier","Januar"],["février","Februar"],["mars","März"],["avril","April"],["mai","Mai"],["juin","Juni"],["juillet","Juli"],["août","August"],
      ["septembre","September"],["octobre","Oktober"],["novembre","November"],["décembre","Dezember"]] }
  ];
  // ajoute automatiquement la forme avec ß pour les mots écrits avec ss
  // (seulement pour les mots qui s'écrivent avec ß en Allemagne — pas « Wasser » !)
  var AVEC_SZ = ["weiss","die Grossmutter","der Grossvater","der Fuss"];
  THEMES.forEach(function(t){ t.mots.forEach(function(m){ m[3] = m[3] || []; if(AVEC_SZ.indexOf(m[1]) >= 0 && m[3].indexOf(ss(m[1])) < 0) m[3].push(ss(m[1])); }); });

  var COUL = { der:"#4CC9F0", die:"#FF6F9F", das:"#6FD08C" };
  function art(m){ var a = m[1].split(" ")[0]; return COUL[a] ? a : null; }
  var NOMS = []; THEMES.forEach(function(t){ t.mots.forEach(function(m){ if(art(m) && m[1] !== "die Eltern" && m[1] !== "die Haare" && m[1] !== "die Schuhe" && m[1] !== "die Socken") NOMS.push(m); }); });
  var ASTUCE = "Astuce : apprends toujours le nom <b>avec son article</b> : <span style=\"color:" + COUL.der + "\">der</span> (masculin), <span style=\"color:" + COUL.die + "\">die</span> (féminin), <span style=\"color:" + COUL.das + "\">das</span> (neutre). Et en allemand, les noms prennent toujours une <b>majuscule</b>.";

  var SEIN = [["Ich ___ zehn Jahre alt.","bin"],["Du ___ mein Freund.","bist"],["Er ___ gross.","ist"],["Sie ___ müde. (= elle)","ist"],["Wir ___ in der Schule.","sind"],
              ["Ihr ___ nett.","seid"],["Sie ___ Geschwister. (= ils)","sind"],["Das ___ mein Hund.","ist"],["Meine Eltern ___ zu Hause.","sind"]];
  var HABEN = [["Ich ___ eine Katze.","habe"],["Du ___ einen Bruder.","hast"],["Er ___ Hunger.","hat"],["Sie ___ blaue Augen. (= elle)","hat"],["Wir ___ heute Sport.","haben"],
               ["Ihr ___ ein grosses Haus.","habt"],["Sie ___ zwei Hunde. (= ils)","haben"],["Mein Vater ___ ein Auto.","hat"]];
  var VERBES = [["spielen","jouer"],["wohnen","habiter"],["machen","faire"],["lernen","apprendre"],["kommen","venir"],["singen","chanter"],["kaufen","acheter"],
                ["trinken","boire"],["schwimmen","nager"],["hören","écouter"],["gehen","aller"],["malen","peindre"],["kochen","cuisiner"]];
  var PRON = [["ich","e"],["du","st"],["er","t"],["sie (= elle)","t"],["wir","en"],["ihr","t"],["sie (= ils)","en"]];
  var ZAHLEN = {21:"einundzwanzig",30:"dreissig",35:"fünfunddreissig",40:"vierzig",48:"achtundvierzig",50:"fünfzig",60:"sechzig",70:"siebzig",80:"achtzig",90:"neunzig",100:"hundert",
                13:"dreizehn",16:"sechzehn",17:"siebzehn",12:"zwölf",11:"elf"};
  var TAB_SEIN = "ich <b>bin</b> · du <b>bist</b> · er / sie / es <b>ist</b> · wir <b>sind</b> · ihr <b>seid</b> · sie <b>sind</b>";
  var TAB_HABEN = "ich <b>habe</b> · du <b>hast</b> · er / sie / es <b>hat</b> · wir <b>haben</b> · ihr <b>habt</b> · sie <b>haben</b>";
  var GRAMMAIRE = [
    { id:"artikel", nom:"der, die ou das ?", desc:"Le bon article pour chaque nom", n:12, cles:function(){ return NOMS.map(function(m){ return m[1]; }); },
      question:function(c){ var m = NOMS.filter(function(x){ return x[1] === c; })[0], a = art(m), nom = m[1].slice(a.length + 1);
        return { enonce:"<small>Quel est l'article ?</small>" + (m[2] ? '<span class="big">' + m[2] + "</span>" : "") + '<span class="gap">?</span> ' + M.echapper(nom) + "<br><small>(" + M.echapper(m[0]) + ")</small>",
          choix:["der","die","das"], reponses:[a], explication:"On dit <b style=\"color:" + COUL[a] + "\">" + M.echapper(m[1]) + "</b>.<br>" + ASTUCE, resume:nom, langue:"de",
          direApres: M.voixPour("de") ? m[1] : null }; } },
    { id:"sein", nom:"Grammatik : sein (être)", desc:"ich bin, du bist, er ist…", cles:function(){ return SEIN.map(function(_, i){ return String(i); }); },
      question:function(c){ var s = SEIN[+c]; return M.phraseATrou(s[0], s[1], ["bin","bist","ist","sind","seid"], "Le verbe <b>sein</b> (être) : " + TAB_SEIN + ".", "de", true); } },
    { id:"haben", nom:"Grammatik : haben (avoir)", desc:"ich habe, du hast, er hat…", cles:function(){ return HABEN.map(function(_, i){ return String(i); }); },
      question:function(c){ var h = HABEN[+c]; return M.phraseATrou(h[0], h[1], ["habe","hast","hat","haben","habt"], "Le verbe <b>haben</b> (avoir) : " + TAB_HABEN + ".", "de", true); } },
    { id:"verben", nom:"Grammatik : les verbes", desc:"ich spiele, du spielst, er spielt…", cles:function(){ var o = []; VERBES.forEach(function(v){ PRON.forEach(function(_, i){ o.push(v[0] + "|" + i); }); }); return o; },
      question:function(c){ var p = c.split("|"), v = VERBES.filter(function(x){ return x[0] === p[0]; })[0], pr = PRON[+p[1]], rad = v[0].slice(0, -2), rep = rad + pr[1];
        var tab = PRON.filter(function(_, i){ return i !== 3 && i !== 6; }).map(function(x){ return x[0].split(" ")[0] + " " + rad + x[1]; }).join(" · ").replace("er ", "er/sie/es ") + " · sie " + rad + "en";
        return { enonce:"<small>Conjugue « <b>" + v[0] + "</b> » (" + v[1] + ") au présent</small><span class=\"big\">" + M.echapper(pr[0].split(" ")[0]) + ' <span class="gap">?</span></span>' + (pr[0].indexOf("(") > 0 ? "<small>" + pr[0].slice(pr[0].indexOf("(")) + "</small>" : ""),
          saisie:"texte", indice:"le verbe conjugué", reponses:[rep, pr[0].split(" ")[0] + " " + rep], langue:"de", direApres: M.voixPour("de") ? pr[0].split(" ")[0] + " " + rep : null,
          explication:"On enlève <b>-en</b> à l'infinitif (" + v[0] + " → " + rad + "-) et on ajoute la terminaison : ich <b>-e</b>, du <b>-st</b>, er/sie/es <b>-t</b>, wir <b>-en</b>, ihr <b>-t</b>, sie <b>-en</b>.<br>" + tab,
          resume:v[0] + " (" + pr[0] + ")" }; } },
    { id:"zahlen2", nom:"Écris les nombres", desc:"17 → siebzehn, 30 → dreissig", cles:function(){ return Object.keys(ZAHLEN); },
      question:function(c){ var w = ZAHLEN[c];
        return { enonce:"<small>Écris ce nombre en lettres allemandes</small><span class=\"big\">" + c + "</span>", saisie:"texte", indice:"en lettres", reponses:[w, ss(w), w === "hundert" ? "einhundert" : w],
          explication:c + " s'écrit <b>" + w + "</b>." + (+c > 20 && +c % 10 ? " En allemand, on dit les unités d'abord : « cinq-et-trente » = fünfunddreissig." : "") + (c === "17" ? " Attention : siebzehn, sans « en »." : "") + (c === "30" ? " En Suisse on écrit dreissig, en Allemagne dreißig." : ""),
          resume:c, langue:"de", direApres: M.voixPour("de") ? w : null }; } }
  ];
  M.jeuLangue({ id:"allemand", titre:"Deutsch ! L'allemand", emoji:"🇩🇪", langue:"de", nomLangue:"allemand", themes:THEMES, grammaire:GRAMMAIRE,
    indiceEcrire:function(m){ return art(m) ? "avec l'article : der, die ou das" : "Écris le mot en allemand"; },
    astuce:function(m){ return art(m) ? "Article : <b style=\"color:" + COUL[art(m)] + "\">" + art(m) + "</b> (" + {der:"masculin",die:"féminin",das:"neutre"}[art(m)] + ")." : ""; },
    intro:"Les mots d'allemand avec des images, les articles der, die, das, et les verbes. Orthographe suisse (ss) : ß est aussi accepté." });
})();
