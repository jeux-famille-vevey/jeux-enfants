/* Lecture des manettes (PlayStation, Xbox…) pour les jeux 3D.
   Sous Linux une manette PS4/PS5 apparaît en plusieurs morceaux (manette, capteurs de mouvement,
   pavé tactile) : on ne garde que la vraie. Les boutons ne sont pas toujours rangés dans l'ordre
   « standard » : on accepte plusieurs façons de faire chaque action.
   Renvoie null s'il n'y a pas de manette, sinon :
   { x, y (joystick gauche, -1..1, y négatif = vers le haut), a (✕), b (○), c (▢), d (△),
     l1, r1, l2, r2 (0..1), start, et nX… = appui nouveau depuis la dernière lecture } */
const vues = {};
let avant = {};
export function vraiesManettes(){
  return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(g => g && g.connected && g.buttons.length >= 6 && !/motion|touchpad|accel|gyro|sensor/i.test(g.id));
}
export function lireManette(){
  const pads = vraiesManettes();
  if(!pads.length) return null;
  const m = { x: 0, y: 0, a: false, b: false, c: false, d: false, l1: false, r1: false, l2: 0, r2: 0, start: false, nom: pads[0].id };
  pads.forEach(gp => {
    const std = gp.mapping === "standard";
    const bt = (i) => gp.buttons[i] ? (gp.buttons[i].value || (gp.buttons[i].pressed ? 1 : 0)) : 0;
    const ax = (i) => gp.axes[i] || 0;
    const gach = (i) => { const v = ax(i), k = gp.index + ":" + i; if(v < -.9) vues[k] = true; return vues[k] ? Math.max(0, Math.min(1, (v + 1) / 2)) : 0; };
    let x = ax(0), y = ax(1);
    if(Math.hypot(x, y) < .2){ x = 0; y = 0; }
    if(std){ if(bt(14)) x = -1; if(bt(15)) x = 1; if(bt(12)) y = -1; if(bt(13)) y = 1; }
    else if(gp.axes.length > 7){ if(Math.abs(ax(6)) > .5) x = Math.sign(ax(6)); if(Math.abs(ax(7)) > .5) y = Math.sign(ax(7)); }
    if(Math.hypot(x, y) > Math.hypot(m.x, m.y)){ m.x = x; m.y = y; }
    m.a = m.a || bt(0) > .5; m.b = m.b || bt(1) > .5; m.c = m.c || bt(std ? 2 : 3) > .5; m.d = m.d || bt(std ? 3 : 2) > .5;
    m.l1 = m.l1 || bt(4) > .5; m.r1 = m.r1 || bt(5) > .5;
    m.l2 = Math.max(m.l2, bt(6), !std && gp.axes.length > 5 ? gach(2) : 0);
    m.r2 = Math.max(m.r2, bt(7), !std && gp.axes.length > 5 ? gach(5) : 0);
    m.start = m.start || bt(9) > .5;
  });
  ["a", "b", "c", "d", "l1", "r1", "start"].forEach(k => { m["n" + k.toUpperCase()] = m[k] && !avant[k]; });
  avant = { a: m.a, b: m.b, c: m.c, d: m.d, l1: m.l1, r1: m.r1, start: m.start };
  return m;
}
