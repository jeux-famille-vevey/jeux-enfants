/* Les sous suisses — compter, rendre la monnaie, faire les courses, argent de poche (montants en centimes) */
(function(){
  var M = Moteur;
  function fr(ct){ return (ct/100).toFixed(2) + " Fr"; }
  function frCourt(ct){ return ct % 100 === 0 ? (ct/100) + " Fr" : fr(ct); }
  var PIECES = { 5:{r:17,c:"#E8C14A",t:"5",u:"ct"}, 10:{r:19,c:"#D9DCE3",t:"10",u:"ct"}, 20:{r:21,c:"#D9DCE3",t:"20",u:"ct"}, 50:{r:18,c:"#D9DCE3",t:"½",u:"Fr"},
                 100:{r:23,c:"#D9DCE3",t:"1",u:"Fr"}, 200:{r:27,c:"#D9DCE3",t:"2",u:"Fr"}, 500:{r:31,c:"#D9DCE3",t:"5",u:"Fr"} };
  var BILLETS = { 1000:"#F2C230", 2000:"#E5484D", 5000:"#3FA34D", 10000:"#3D7BD9", 20000:"#9A6B3F" };
  function dessin(vals){
    var x = 8, items = [], H = 92;
    vals.slice().sort(function(a,b){ return b-a; }).forEach(function(v){
      if(BILLETS[v]){ items.push('<g transform="translate('+x+',14)"><rect width="96" height="58" rx="6" fill="'+BILLETS[v]+'" stroke="#1D2357" stroke-width="2"/><circle cx="74" cy="29" r="14" fill="rgba(255,255,255,.35)"/><text x="10" y="38" font-size="22" font-weight="700" fill="#1D2357" font-family="Fredoka, sans-serif">'+(v/100)+'</text><text x="10" y="52" font-size="10" fill="#1D2357" font-family="Fredoka, sans-serif">francs</text></g>'); x += 104; }
      else { var p = PIECES[v]; items.push('<g transform="translate('+(x+p.r)+',46)"><circle r="'+p.r+'" fill="'+p.c+'" stroke="#8a8f9e" stroke-width="2"/><text y="4" text-anchor="middle" font-size="'+(p.r>20?17:14)+'" font-weight="700" fill="#1D2357" font-family="Fredoka, sans-serif">'+p.t+'</text><text y="'+(p.r-6)+'" text-anchor="middle" font-size="8" fill="#1D2357" font-family="Fredoka, sans-serif">'+p.u+'</text></g>'); x += p.r*2 + 8; }
    });
    return '<svg viewBox="0 0 '+(x+4)+' '+H+'" style="max-width:100%;height:auto;width:'+(x+4)+'px" role="img" aria-label="Pièces et billets">' + items.join("") + "</svg>";
  }
  function compter(cle){
    var vals = cle.split("-").map(Number), total = vals.reduce(function(a,b){ return a+b; }, 0);
    var fr_ = vals.filter(function(v){ return v >= 100; }).reduce(function(a,b){ return a+b; }, 0), ct = total - fr_;
    var ex = (fr_ ? "Les francs : " + vals.filter(function(v){ return v >= 100; }).map(function(v){ return v/100; }).join(" + ") + " = " + (fr_/100) + " Fr. " : "") +
      (ct ? "Les centimes : " + vals.filter(function(v){ return v < 100; }).join(" + ") + " = " + ct + " ct" + (ct >= 100 ? " = " + fr(ct) : "") + ". " : "") +
      "Total : <b>" + fr(total) + "</b>." + (vals.indexOf(50) >= 0 ? " (La petite pièce « ½ » vaut 50 centimes.)" : "");
    return { enonce:"<small>Combien d'argent y a-t-il ?</small>", visuel:dessin(vals), saisie:"nombre", indice:"en francs, ex. 3.70", reponses:[fr(total)], explication:ex, resume:"Compter " + vals.length + " pièces/billets" };
  }
  function cleCompter(valeurs, nMin, nMax){ return function(){ var n = M.entier(nMin, nMax), o = []; for(var i=0;i<n;i++) o.push(M.choisir(valeurs)); return o.sort(function(a,b){ return b-a; }).join("-"); }; }
  function rendre(cle){
    var p = cle.split("|"), prix = Number(p[1]), paye = Number(p[2]), rendu = paye - prix, objet = p[3];
    var etapes = [], cur = prix;
    var versFranc = (100 - cur % 100) % 100; if(versFranc){ etapes.push(fr(cur) + " → " + fr(cur + versFranc) + " (+" + versFranc + " ct)"); cur += versFranc; }
    if(cur < paye){ etapes.push(fr(cur) + " → " + fr(paye) + " (+" + ((paye-cur)/100) + " Fr)"); }
    return { enonce:"<small>Rends la monnaie</small>" + objet + " coûte <b>" + fr(prix) + "</b>.<br>Tu paies avec <b>" + frCourt(paye) + "</b>. Combien doit-on te rendre ?",
      visuel:dessin([paye]), saisie:"nombre", indice:"en francs", reponses:[fr(rendu)],
      explication:"On compte en avançant depuis le prix, comme à la caisse :<br>" + etapes.join("<br>") + "<br>On rend en tout : <b>" + fr(rendu) + "</b>.", resume:objet + " à " + fr(prix) + " payé avec " + frCourt(paye) };
  }
  var OBJETS = ["Un croissant","Un cahier","Un livre","Un ballon","Une glace","Un jus de pomme","Une BD","Un stylo","Un puzzle","Une peluche"];
  function cleRendre(){ var paye = M.choisir([500,1000,2000,5000]), prix = M.entier(Math.max(1, paye/100*4), paye/5 - 1)*5; return "r|" + prix + "|" + paye + "|" + M.choisir(OBJETS); }
  var MAGASIN = [["croissant","croissants",140],["pain","pains",320],["brique de lait","briques de lait",165],["pomme","pommes",60],["tablette de chocolat","tablettes de chocolat",250],
                 ["jus d'orange","jus d'orange",220],["yogourt","yogourts",85],["bouteille d'eau","bouteilles d'eau",95],["paquet de pâtes","paquets de pâtes",175],["banane","bananes",45]];
  function courses(cle){
    var lignes = cle.split(",").map(function(x){ var p = x.split(":").map(Number); return { a:MAGASIN[p[0]], q:p[1] }; });
    var total = 0, details = [];
    var txt = lignes.map(function(l){ total += l.a[2]*l.q; details.push(l.q + " × " + fr(l.a[2]) + " = " + fr(l.a[2]*l.q)); return l.q + " " + (l.q > 1 ? l.a[1] : l.a[0]) + " (" + fr(l.a[2]) + (l.q > 1 ? " pièce" : "") + ")"; });
    return { enonce:"<small>Au magasin</small>Tu achètes " + txt.join(" et ") + ".<br>Combien paies-tu en tout ?", saisie:"nombre", indice:"en francs", reponses:[fr(total)],
      explication:details.join("<br>") + "<br>Total : <b>" + fr(total) + "</b>.", resume:"Les courses" };
  }
  function cleCourses(){ var n = M.entier(2, 3), idx = M.melanger([0,1,2,3,4,5,6,7,8,9]).slice(0, n); return idx.map(function(i){ return i + ":" + M.entier(1, 4); }).join(","); }
  function poche(cle){
    var p = cle.split("|"), t = p[0], a = Number(p[1]), b = Number(p[2]);
    if(t === "sem"){ var r = a*b;
      return { enonce:"<small>Argent de poche</small>Tu reçois <b>" + frCourt(a) + "</b> par semaine.<br>Combien as-tu après <b>" + b + " semaines</b> si tu ne dépenses rien ?", saisie:"nombre", indice:"en francs",
        reponses:[fr(r)], explication:frCourt(a) + " × " + b + " = <b>" + frCourt(r) + "</b>.", resume:frCourt(a) + " par semaine pendant " + b + " semaines" }; }
    var s = Math.ceil(b/a);
    return { enonce:"<small>Économiser</small>Tu veux un jeu qui coûte <b>" + frCourt(b) + "</b>. Tu économises <b>" + frCourt(a) + "</b> par semaine.<br>Combien de semaines faut-il attendre ?", saisie:"nombre", indice:"nombre de semaines",
      reponses:[String(s)], explication:"Après " + (s-1) + " semaines, tu as " + frCourt(a*(s-1)) + " : pas encore assez. Après <b>" + s + " semaines</b>, tu as " + frCourt(a*s) + " : c'est bon !", resume:"Économiser pour " + frCourt(b) };
  }
  function clePoche(){ if(M.hasard() < .5) return "sem|" + M.choisir([200,250,300,500,400]) + "|" + M.entier(3, 10); return "eco|" + M.choisir([200,300,500,400,250]) + "|" + (M.entier(3, 12)*500); }
  M.inscrire({ id:"sous", titre:"Les sous suisses", emoji:"🪙", matiere:"Maths",
    intro:"Les vraies pièces et les vrais billets suisses. Compte, rends la monnaie et fais tes courses comme une grande !",
    niveaux:[
      { id:"francs", nom:"Compter les francs", desc:"Pièces de 1, 2, 5 Fr et billets", cleAuHasard:cleCompter([100,200,500,1000,2000], 3, 6), question:compter },
      { id:"centimes", nom:"Avec les centimes", desc:"5, 10, 20, 50 ct", cleAuHasard:cleCompter([5,10,20,50,100,200,500], 4, 7), question:compter },
      { id:"rendre", nom:"Rendre la monnaie", desc:"Comme à la caisse", cleAuHasard:cleRendre, question:rendre },
      { id:"courses", nom:"Faire les courses", desc:"Additionner les prix", cleAuHasard:cleCourses, question:courses },
      { id:"poche", nom:"Mon argent de poche", desc:"Économiser pour s'acheter un jeu", cleAuHasard:clePoche, question:poche }
    ]});
})();
