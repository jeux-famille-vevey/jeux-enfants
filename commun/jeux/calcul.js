/* Tables et calcul mental */
(function(){
  var M = Moteur;
  function f(n){ return String(n); }
  function astuceMult(a, b){
    var r = a*b, t = [];
    if(a === 10 || b === 10){ var v = a === 10 ? b : a; t.push("× 10 : on ajoute un zéro, " + v + " devient " + r + "."); }
    else if(a === 1 || b === 1){ t.push("× 1 : le nombre ne change pas."); }
    else if(a === 9 || b === 9){ var x = a === 9 ? b : a; t.push("Astuce du 9 : " + x + " × 10 − " + x + " = " + (x*10) + " − " + x + " = " + r + "."); }
    else if(a === 5 || b === 5){ var y = a === 5 ? b : a; t.push("Astuce du 5 : c'est la moitié de " + y + " × 10 = " + (y*10) + " : 2 = " + r + "."); }
    else if(a === 2 || b === 2){ var z = a === 2 ? b : a; t.push("× 2, c'est le double : " + z + " + " + z + " = " + r + "."); }
    else if(a === 4 || b === 4){ var w = a === 4 ? b : a; t.push("× 4, c'est le double du double : " + w + " × 2 = " + (w*2) + ", puis " + (w*2) + " × 2 = " + r + "."); }
    else if(b > 5){ t.push("Découpe : " + a + " × " + b + " = " + a + " × 5 + " + a + " × " + (b-5) + " = " + (a*5) + " + " + (a*(b-5)) + " = " + r + "."); }
    else if(a > 5){ t.push("Découpe : " + a + " × " + b + " = 5 × " + b + " + " + (a-5) + " × " + b + " = " + (5*b) + " + " + ((a-5)*b) + " = " + r + "."); }
    else t.push(a + " × " + b + " = " + r + ".");
    if(a !== b) t.push("Et n'oublie pas : " + b + " × " + a + " = " + a + " × " + b + ", c'est le même résultat !");
    return t.join("<br>");
  }
  function mult(cle){
    var p = cle.split("x").map(Number), a = p[0], b = p[1];
    return { enonce:'<span class="big">' + a + " × " + b + " = ?</span>", saisie:"nombre", indice:"Ton résultat", reponses:[f(a*b)], explication:astuceMult(a,b), resume:a+" × "+b };
  }
  function div(cle){
    var p = cle.split("x").map(Number), a = p[0], b = p[1];
    return { enonce:'<span class="big">' + (a*b) + " : " + a + " = ?</span>", saisie:"nombre", reponses:[f(b)],
      explication:"La division, c'est la table à l'envers : " + a + " × <b>" + b + "</b> = " + (a*b) + ", donc " + (a*b) + " : " + a + " = <b>" + b + "</b>.", resume:(a*b)+" : "+a };
  }
  function tables(min, max){ return function(){ var o = []; for(var a=min;a<=max;a++) for(var b=1;b<=10;b++) o.push(a+"x"+b); return o; }; }
  function toutes(){ var o = []; for(var a=2;a<=10;a++) for(var b=2;b<=10;b++) o.push(a+"x"+b); return o; }

  // calcul mental : les clés contiennent l'opération
  function mental(cle){
    var p = cle.split("|"), op = p[0], a = Number(p[1]), b = Number(p[2]), r, e, ex;
    if(op === "x10"){ r = a*b; e = a + " × " + b; ex = "Multiplier par " + b + " : chaque chiffre avance de " + (b===10?"1 rang":b===100?"2 rangs":"3 rangs") + " vers la gauche, on ajoute " + (b===10?"un zéro":b===100?"deux zéros":"trois zéros") + "."; }
    if(op === "d10"){ r = a/b; e = a + " : " + b; ex = "Diviser par " + b + " : chaque chiffre recule de " + (b===10?"1 rang":"2 rangs") + " (on enlève " + (b===10?"un zéro":"deux zéros") + ")."; }
    if(op === "dbl"){ r = a*2; e = "Le double de " + a; var d = a - a%10; ex = "Double de " + d + " = " + (d*2) + ", double de " + (a%10) + " = " + (a%10*2) + ", donc " + (d*2) + " + " + (a%10*2) + " = " + r + "."; }
    if(op === "moi"){ r = a/2; e = "La moitié de " + a; var c = a - a%20; ex = "Moitié de " + c + " = " + (c/2) + ", moitié de " + (a%20) + " = " + (a%20/2) + ", donc " + (c/2) + " + " + (a%20/2) + " = " + r + "."; }
    if(op === "add"){ r = a+b; e = a + " + " + b; var u = b%10, dz = b-u; ex = "Ajoute d'abord les dizaines : " + a + " + " + dz + " = " + (a+dz) + ", puis les unités : " + (a+dz) + " + " + u + " = " + r + "."; }
    if(op === "sub"){ r = a-b; e = a + " − " + b; var u2 = b%10, dz2 = b-u2; ex = "Enlève d'abord les dizaines : " + a + " − " + dz2 + " = " + (a-dz2) + ", puis les unités : " + (a-dz2) + " − " + u2 + " = " + r + "."; }
    return { enonce:'<span class="big">' + e + " = ?</span>", saisie:"nombre", reponses:[f(r)], explication:ex, resume:e };
  }
  function cleMental(ops){
    return function(){
      var op = M.choisir(ops);
      if(op === "x10") return "x10|" + M.entier(2, 99) + "|" + M.choisir([10,100,1000]);
      if(op === "d10"){ var b = M.choisir([10,100]); return "d10|" + (M.entier(2, 99)*b) + "|" + b; }
      if(op === "dbl") return "dbl|" + M.entier(12, 99) + "|0";
      if(op === "moi") return "moi|" + (M.entier(6, 99)*2) + "|0";
      if(op === "add") return "add|" + M.entier(15, 89) + "|" + M.entier(11, 79);
      var a = M.entier(40, 150); return "sub|" + a + "|" + M.entier(11, Math.min(79, a-5));
    };
  }
  function melange(cle){ return cle.indexOf("|") >= 0 ? mental(cle) : (cle.charAt(0) === "d" ? div(cle.slice(1)) : mult(cle)); }
  M.inscrire({ id:"calcul", titre:"Tables et calcul mental", emoji:"🧮", matiere:"Maths",
    intro:"Réponds le plus juste possible. Les calculs ratés reviennent plus souvent, jusqu'à ce que tu les saches !",
    niveaux:[
      { id:"t2-5", nom:"Tables de 2 à 5", desc:"Pour s'échauffer", cles:tables(2,5), question:mult },
      { id:"t6-9", nom:"Tables de 6 à 9", desc:"Les plus difficiles", cles:tables(6,9), question:mult },
      { id:"toutes", nom:"Toutes les tables", desc:"Mélangées, comme au test", n:15, cles:toutes, question:mult },
      { id:"div", nom:"Les divisions", desc:"Les tables à l'envers : 56 : 7", n:12, cles:toutes, question:div },
      { id:"x10", nom:"× 10, × 100, : 10", desc:"Avancer et reculer les chiffres", cleAuHasard:cleMental(["x10","d10"]), question:mental },
      { id:"dbl", nom:"Doubles et moitiés", desc:"Le double de 36, la moitié de 84", cleAuHasard:cleMental(["dbl","moi"]), question:mental },
      { id:"addsub", nom:"Additions et soustractions", desc:"De tête, avec les dizaines", cleAuHasard:cleMental(["add","sub"]), question:mental },
      { id:"defi", nom:"Super défi", desc:"Un peu de tout, 20 calculs", n:20, cleAuHasard:function(){
          var t = M.hasard(); if(t < .4) return M.choisir(toutes()); if(t < .6) return "d" + M.choisir(toutes()); return cleMental(["x10","d10","dbl","moi","add","sub"])(); }, question:melange }
    ]});
})();
