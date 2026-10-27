/* Jouer ensemble, chacun sur son appareil.
   Un appareil « capitaine » crée la partie et reçoit un code à 4 chiffres ; les autres le tapent pour rejoindre.
   Le service gratuit PeerJS sert seulement à se trouver (comme un annuaire) ; ensuite les appareils se parlent
   directement entre eux (WebRTC). Le capitaine envoie le monde et relaie les messages à tout le monde. */
const PREFIXE = "jfv-pirates-";
function options(){
  // pour les tests on peut donner un autre serveur : ?serveur=localhost:9000
  const s = new URLSearchParams(location.search).get("serveur");
  if(s){ const [host, port] = s.split(":"); return { host, port: +port || 9000, path: "/", secure: false, debug: 0 }; }
  return { debug: 0 };
}
function nouveauPeer(id){ const P = window.peerjs && window.peerjs.Peer; if(!P) throw new Error("PeerJS absent"); return id ? new P(id, options()) : new P(options()); }

export class Partie {
  constructor(ecoute){ this.ecoute = ecoute; this.conns = new Map(); this.role = null; this.peer = null; this.code = null; this.moi = null; this.ferme = false; }
  /* le capitaine : on essaie des codes jusqu'à en trouver un libre */
  creer(infos){
    this.role = "capitaine"; this.infos = infos;
    return new Promise((ok, ko) => {
      let essais = 0;
      const essayer = () => {
        const code = String(1000 + Math.floor(Math.random() * 9000));
        let p; try{ p = nouveauPeer(PREFIXE + code); }catch(e){ return ko(e); }
        const minuterie = setTimeout(() => { p.destroy(); ko(new Error("pas de réponse")); }, 15000);
        p.on("open", (id) => { clearTimeout(minuterie); this.peer = p; this.code = code; this.moi = id; this.brancherCapitaine(); ok(code); });
        p.on("error", (e) => { clearTimeout(minuterie); if(e.type === "unavailable-id" && ++essais < 6){ p.destroy(); essayer(); } else if(!this.peer){ p.destroy(); ko(e); } else this.ecoute({ t: "erreur", e: e.type }); });
      };
      essayer();
    });
  }
  brancherCapitaine(){
    this.peer.on("connection", (c) => {
      c.on("open", () => { this.conns.set(c.peer, c); });
      c.on("data", (m) => {
        if(m.t === "bonjour"){ c.send({ t: "bienvenue", id: c.peer, monde: this.infos.monde(), etat: this.infos.etat(), joueurs: this.infos.joueurs() }); }
        m.de = c.peer;
        this.relayer(m, c.peer); this.ecoute(m);
      });
      c.on("close", () => { this.conns.delete(c.peer); const m = { t: "parti", de: c.peer }; this.relayer(m, c.peer); this.ecoute(m); });
    });
    this.peer.on("disconnected", () => { if(!this.ferme) try{ this.peer.reconnect(); }catch(e){} });
  }
  relayer(m, sauf){ for(const [id, c] of this.conns) if(id !== sauf && c.open) try{ c.send(m); }catch(e){} }
  /* un matelot : rejoindre avec le code */
  rejoindre(code, bonjour){
    this.role = "matelot";
    return new Promise((ok, ko) => {
      let p; try{ p = nouveauPeer(); }catch(e){ return ko(e); }
      const minuterie = setTimeout(() => { ko(new Error("pas de réponse")); }, 12000);
      p.on("error", (e) => { clearTimeout(minuterie); if(!this.capitaine) ko(e); else this.ecoute({ t: "erreur", e: e.type }); });
      p.on("open", (id) => {
        this.peer = p; this.moi = id;
        const c = p.connect(PREFIXE + code, { reliable: true });
        c.on("open", () => { this.capitaine = c; c.send(Object.assign({ t: "bonjour" }, bonjour)); });
        c.on("data", (m) => { if(m.t === "bienvenue"){ clearTimeout(minuterie); ok(m); } else this.ecoute(m); });
        c.on("close", () => { if(!this.ferme) this.ecoute({ t: "fin" }); });
      });
    });
  }
  envoyer(m){
    m.de = this.moi;
    if(this.role === "capitaine") this.relayer(m);
    else if(this.capitaine && this.capitaine.open) try{ this.capitaine.send(m); }catch(e){}
  }
  nombre(){ return this.role === "capitaine" ? this.conns.size + 1 : null; }
  fermer(){ this.ferme = true; try{ this.peer && this.peer.destroy(); }catch(e){} }
}
