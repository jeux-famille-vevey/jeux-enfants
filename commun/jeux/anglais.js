/* L'anglais — 1re année (7P) */
(function(){
  var M = Moteur;
  var THEMES = [
    { id:"hello", nom:"Hello ! Les salutations", desc:"Dire bonjour, merci, au revoir", mots:[
      ["bonjour / salut","hello","👋",["hi"]],["au revoir","goodbye","👋",["bye"]],["s'il te plaît","please","🙏"],["merci","thank you","😊",["thanks"]],
      ["oui","yes","👍"],["non","no","👎"],["bonne nuit","good night","🌙"],["pardon / désolé","sorry","😔"],["Comment vas-tu ?","How are you?","🙂",["how are you"]],
      ["Je m'appelle…","My name is…","🏷️",["my name is"]]] },
    { id:"colors", nom:"Colours : les couleurs", desc:"red, blue, green…", mots:[
      ["rouge","red","🔴"],["bleu","blue","🔵"],["vert","green","🟢"],["jaune","yellow","🟡"],["noir","black","⚫"],["blanc","white","⚪"],
      ["orange","orange","🟠"],["rose","pink","🌸"],["violet","purple","🟣"],["marron / brun","brown","🟤"],["gris","grey","🌫️",["gray"]]] },
    { id:"numbers", nom:"Numbers : les nombres", desc:"De one à twenty", mots:[
      ["1","one"],["2","two"],["3","three"],["4","four"],["5","five"],["6","six"],["7","seven"],["8","eight"],["9","nine"],["10","ten"],
      ["11","eleven"],["12","twelve"],["13","thirteen"],["14","fourteen"],["15","fifteen"],["16","sixteen"],["17","seventeen"],["18","eighteen"],["19","nineteen"],["20","twenty"]] },
    { id:"family", nom:"My family : la famille", desc:"mother, father, sister…", mots:[
      ["la mère","mother","👩",["mum","mom"]],["le père","father","👨",["dad"]],["la sœur","sister","👧"],["le frère","brother","👦"],
      ["la grand-mère","grandmother","👵",["grandma","granny"]],["le grand-père","grandfather","👴",["grandpa"]],["le bébé","baby","👶"],
      ["la famille","family","👨‍👩‍👧‍👦"],["la tante","aunt","👩"],["l'oncle","uncle","👨"],["les parents","parents","👫"]] },
    { id:"animals", nom:"Animals : les animaux", desc:"dog, cat, horse…", mots:[
      ["le chien","dog","🐶"],["le chat","cat","🐱"],["le cheval","horse","🐴"],["la vache","cow","🐮"],["le cochon","pig","🐷"],["le mouton","sheep","🐑"],
      ["l'oiseau","bird","🐦"],["le poisson","fish","🐟"],["le lapin","rabbit","🐰"],["la souris","mouse","🐭"],["le lion","lion","🦁"],["l'éléphant","elephant","🐘"],
      ["le singe","monkey","🐵"],["l'ours","bear","🐻"],["la grenouille","frog","🐸"],["le canard","duck","🦆"]] },
    { id:"school", nom:"At school : l'école", desc:"pen, book, bag…", mots:[
      ["le stylo","pen","🖊️"],["le crayon","pencil","✏️"],["le livre","book","📖"],["le sac d'école","schoolbag","🎒",["bag","school bag"]],["la règle","ruler","📏"],
      ["la gomme","rubber","🧽",["eraser"],"En anglais britannique : <b>rubber</b>. En anglais américain : <b>eraser</b>."],["les ciseaux","scissors","✂️"],
      ["l'enseignant(e)","teacher","🧑‍🏫"],["la chaise","chair","🪑"],["la classe","classroom","🏫"],["l'ordinateur","computer","💻"],["le cahier","exercise book","📓",["notebook"]]] },
    { id:"food", nom:"Food : la nourriture", desc:"apple, bread, milk…", mots:[
      ["la pomme","apple","🍎"],["le pain","bread","🍞"],["le lait","milk","🥛"],["l'eau","water","💧"],["le fromage","cheese","🧀"],["l'œuf","egg","🥚"],
      ["la banane","banana","🍌"],["le chocolat","chocolate","🍫"],["le gâteau","cake","🍰"],["le jus d'orange","orange juice","🧃"],["la carotte","carrot","🥕"],
      ["la glace","ice cream","🍦",["ice-cream"]],["le poulet","chicken","🍗"]] },
    { id:"body", nom:"My body : le corps", desc:"head, eyes, hands…", mots:[
      ["la tête","head","🙂"],["l'œil","eye","👁️"],["le nez","nose","👃"],["la bouche","mouth","👄"],["l'oreille","ear","👂"],["la main","hand","✋"],
      ["le pied","foot","🦶"],["le bras","arm","💪"],["la jambe","leg","🦵"],["les cheveux","hair","💇"],["la dent","tooth","🦷"]] },
    { id:"clothes", nom:"Clothes : les vêtements", desc:"T-shirt, shoes, dress…", mots:[
      ["le t-shirt","T-shirt","👕",["tshirt","t shirt"]],["le pantalon","trousers","👖",["pants"],"En anglais britannique : <b>trousers</b>. En américain : <b>pants</b>."],
      ["les chaussures","shoes","👟"],["la robe","dress","👗"],["le chapeau","hat","👒"],["la veste","jacket","🧥"],["la jupe","skirt","👘"],["les chaussettes","socks","🧦"],
      ["le pull","pullover","🧶",["jumper","sweater"]],["le bonnet","woolly hat","🧢",["beanie"]]] },
    { id:"days", nom:"Days and months", desc:"Les jours et les mois", mots:[
      ["lundi","Monday"],["mardi","Tuesday"],["mercredi","Wednesday"],["jeudi","Thursday"],["vendredi","Friday"],["samedi","Saturday"],["dimanche","Sunday"],
      ["janvier","January"],["février","February"],["mars","March"],["avril","April"],["mai","May"],["juin","June"],["juillet","July"],["août","August"],
      ["septembre","September"],["octobre","October"],["novembre","November"],["décembre","December"]] }
  ];
  var BE = [["I ___ ten years old.","am"],["You ___ my friend.","are"],["He ___ tall.","is"],["She ___ happy.","is"],["It ___ a dog.","is"],["We ___ at school.","are"],
            ["They ___ in the garden.","are"],["My sister ___ eight.","is"],["Tom and Ben ___ brothers.","are"],["The cat ___ black.","is"]];
  var HAVE = [["I ___ got a cat.","have"],["She ___ got blue eyes.","has"],["We ___ got a big house.","have"],["He ___ got a new bike.","has"],["They ___ got two dogs.","have"],
              ["My brother ___ got a guitar.","has"],["You ___ got a nice bag.","have"],["It ___ got four legs.","has"]];
  var VERBES = [["play","plays","She ___ tennis every Saturday."],["like","likes","He ___ pizza."],["watch","watches","My dad ___ TV in the evening."],["go","goes","She ___ to school by bus."],
                ["do","does","He ___ his homework."],["have","has","She ___ a brother."],["study","studies","My sister ___ English."],["swim","swims","The fish ___ in the water."],
                ["read","reads","Tom ___ a book."],["fly","flies","The bird ___ in the sky."],["wash","washes","She ___ her hands."],["eat","eats","The cat ___ fish."]];
  var PLURIELS = [["cat","cats"],["dog","dogs"],["box","boxes"],["bus","buses"],["watch","watches"],["baby","babies"],["toy","toys"],["child","children"],["man","men"],
                  ["woman","women"],["mouse","mice"],["tooth","teeth"],["foot","feet"],["sheep","sheep"],["fish","fish"],["knife","knives"]];
  var NOMBRES = {1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten",11:"eleven",12:"twelve",13:"thirteen",14:"fourteen",15:"fifteen",
                 16:"sixteen",17:"seventeen",18:"eighteen",19:"nineteen",20:"twenty",30:"thirty",40:"forty",50:"fifty",60:"sixty",70:"seventy",80:"eighty",90:"ninety",100:"one hundred",
                 21:"twenty-one",35:"thirty-five",48:"forty-eight",99:"ninety-nine"};
  var TAB_BE = "I <b>am</b> · you <b>are</b> · he / she / it <b>is</b> · we <b>are</b> · they <b>are</b>";
  function regle3(base){
    if(base === "have") return "« have » devient <b>has</b> avec he, she, it.";
    if(/[^aeiou]y$/.test(base)) return "Le verbe finit par consonne + y : le y devient <b>-ies</b> (study → studies).";
    if(/(ch|sh|s|x|o)$/.test(base)) return "Le verbe finit par -ch, -sh, -s, -x ou -o : on ajoute <b>-es</b> (watch → watches, go → goes).";
    return "On ajoute simplement un <b>-s</b>.";
  }
  function reglePluriel(s, p){
    if(p === s + "s") return "On ajoute simplement un <b>-s</b>.";
    if(p === s + "es") return "Après -s, -x, -ch, -sh, on ajoute <b>-es</b>.";
    if(/ies$/.test(p)) return "Consonne + y → <b>-ies</b> (baby → babies).";
    if(/ves$/.test(p)) return "Certains mots en -f / -fe font <b>-ves</b> (knife → knives).";
    if(p === s) return "Ce mot ne change pas au pluriel : one " + s + ", two " + p + ".";
    return "Pluriel irrégulier, à apprendre par cœur : one " + s + " → two <b>" + p + "</b>.";
  }
  var GRAMMAIRE = [
    { id:"tobe", nom:"Grammar : to be (être)", desc:"I am, you are, he is…", cles:function(){ return BE.map(function(_, i){ return String(i); }); },
      question:function(c){ var b = BE[+c]; return M.phraseATrou(b[0], b[1], ["am","is","are"], "Le verbe <b>to be</b> (être) : " + TAB_BE + ".", "en", true); } },
    { id:"havegot", nom:"Grammar : have got (avoir)", desc:"I have got, she has got…", cles:function(){ return HAVE.map(function(_, i){ return String(i); }); },
      question:function(c){ var h = HAVE[+c]; return M.phraseATrou(h[0], h[1], ["have","has"], "<b>have got</b> (avoir) : I / you / we / they <b>have</b> got · he / she / it <b>has</b> got.", "en", true); } },
    { id:"present", nom:"Grammar : he plays, she goes", desc:"Le -s avec he, she, it", cles:function(){ return VERBES.map(function(_, i){ return String(i); }); },
      question:function(c){ var v = VERBES[+c], faux = v[0] === "have" ? "haves" : (v[1] === v[0] + "s" ? v[0] + "es" : v[0] + "s");
        return M.phraseATrou(v[2] + " (" + v[0] + ")", v[1], [v[0], v[1], faux], "Avec <b>he, she, it</b> (une seule personne), le verbe prend un <b>s</b> au présent. " + regle3(v[0]), "en", true); } },
    { id:"plural", nom:"Grammar : les pluriels", desc:"cats, boxes, children…", cles:function(){ return PLURIELS.map(function(p){ return p[0]; }); },
      question:function(c){ var p = PLURIELS.filter(function(x){ return x[0] === c; })[0];
        return { enonce:"<small>Écris le pluriel en anglais</small><span class=\"big\">one " + p[0] + " → two ?</span>", saisie:"texte", indice:"le pluriel", reponses:[p[1], "two " + p[1]],
          explication:reglePluriel(p[0], p[1]), resume:"one " + p[0], langue:"en", direApres: M.voixPour("en") ? "one " + p[0] + ", two " + p[1] : null }; } },
    { id:"spell", nom:"Écris les nombres", desc:"13 → thirteen, 40 → forty", cles:function(){ return Object.keys(NOMBRES); },
      question:function(c){ var w = NOMBRES[c];
        return { enonce:"<small>Écris ce nombre en lettres anglaises</small><span class=\"big\">" + c + "</span>", saisie:"texte", indice:"en lettres", reponses:[w, w.replace("-", " "), w.replace("one hundred","a hundred")],
          explication:c + " s'écrit <b>" + w + "</b>." + (c === "40" ? " Attention : forty s'écrit <b>sans u</b> (alors qu'on écrit four)." : "") + (+c > 20 && +c % 10 ? " Entre les dizaines et les unités, on met un tiret : twenty-one." : ""),
          resume:c, langue:"en", direApres: M.voixPour("en") ? w : null }; } }
  ];
  M.jeuLangue({ id:"anglais", titre:"English ! L'anglais", emoji:"🇬🇧", langue:"en", nomLangue:"anglais", themes:THEMES, grammaire:GRAMMAIRE,
    intro:"Apprends tes premiers mots d'anglais avec des images, puis un peu de grammaire. Si cet appareil a une voix anglaise, tu entendras la prononciation." });
})();
