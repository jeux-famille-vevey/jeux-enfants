/* Jouer ensemble, chacun sur son appareil.
   Les messages passent par TROIS services de messagerie gratuits en même temps (MQTT : HiveMQ, EMQX, Mosquitto).
   Si l'un est en panne, les deux autres suffisent. Pas besoin de connexion directe entre les appareils,
   donc ça marche aussi entre un téléphone (4G) et une tablette (Wi-Fi).
   Les messages sont chiffrés avec le code de la partie (AES-GCM) : sur ces services publics, les autres ne voient que du charabia. */
import mqtt from "./lib/mqtt.esm.js";

const SERVICES = [
  "wss://broker.hivemq.com:8884/mqtt",
  "wss://broker.emqx.io:8084/mqtt",
  "wss://test.mosquitto.org:8081"
];
function services(){
  const s = new URLSearchParams(location.search).get("mqtt");   // pour les tests : ?mqtt=ws://127.0.0.1:8888
  return s ? s.split(",") : SERVICES;
}
const enc = new TextEncoder(), dec = new TextDecoder();
async function cleDe(code){
  const base = await crypto.subtle.importKey("raw", enc.encode("jeux-famille-vevey/pirates/" + code), "PBKDF2", false, ["deriveKey", "deriveBits"]);
  const cle = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode("ile-des-pirates-v1"), iterations: 20000 }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode("ile-des-pirates-salon"), iterations: 20000 }, base, 96));
  const salon = "jfv-pirates-v1/" + Array.from(bits, b => b.toString(16).padStart(2, "0")).join("");
  return { cle, salon };
}
async function chiffrer(cle, objet){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cle, enc.encode(JSON.stringify(objet))));
  const out = new Uint8Array(12 + c.length); out.set(iv); out.set(c, 12); return out;
}
async function dechiffrer(cle, octets){
  const b = new Uint8Array(octets);
  const p = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, cle, b.slice(12));
  return JSON.parse(dec.decode(p));
}

export class Partie {
  constructor(ecoute){
    this.ecoute = ecoute; this.clients = []; this.moi = "p" + Math.random().toString(36).slice(2, 10); this.seq = 0;
    this.vus = new Set(); this.vusFile = []; this.joueurs = new Map(); this.ferme = false; this.role = null; this.code = null;
    this.etatServices = {};
  }
  /* se brancher aux 3 services ; on continue dès qu'au moins un répond */
  async brancher(code){
    this.code = code;
    const { cle, salon } = await cleDe(code); this.cle = cle; this.salon = salon;
    const adieu = await chiffrer(cle, { t: "parti", de: this.moi, id: this.moi + ":adieu" });
    return new Promise((ok, ko) => {
      let premier = false, echecs = 0;
      const liste = services();
      const minuterie = setTimeout(() => { if(!premier) ko(new Error("aucun service ne répond")); }, 12000);
      liste.forEach((url) => {
        let c;
        try{ c = mqtt.connect(url, { clientId: "jfv-" + this.moi + "-" + Math.random().toString(36).slice(2, 6), keepalive: 20, reconnectPeriod: 3000, connectTimeout: 9000, clean: true,
          will: { topic: salon, payload: adieu, qos: 0, retain: false } }); }
        catch(e){ echecs++; return; }
        this.clients.push(c);
        c.on("connect", () => {
          this.etatServices[url] = true;
          c.subscribe(salon, { qos: 0 }, (err) => { if(!err && !premier){ premier = true; clearTimeout(minuterie); ok(); } });
        });
        c.on("close", () => { this.etatServices[url] = false; });
        c.on("error", () => { this.etatServices[url] = false; });
        c.on("message", (topic, payload) => { this.recu(payload); });
      });
      if(echecs === liste.length){ clearTimeout(minuterie); ko(new Error("connexion impossible")); }
    });
  }
  async recu(payload){
    let m; try{ m = await dechiffrer(this.cle, payload); }catch(e){ return; }
    if(!m || m.de === this.moi || this.ferme) return;
    if(m.id){ if(this.vus.has(m.id)) return; this.vus.add(m.id); this.vusFile.push(m.id); if(this.vusFile.length > 800) this.vus.delete(this.vusFile.shift()); }   // le même message arrive par chaque service
    if(m.a && m.a !== this.moi) return;            // message pour quelqu'un d'autre
    this.joueurs.set(m.de, performance.now());
    if(this.role === "capitaine" && m.t === "bonjour"){
      const i = this.infos;
      this.envoyer({ t: "bienvenue", a: m.de, monde: i.monde(), etat: i.etat(), joueurs: i.joueurs() });
    }
    if(this.attenteBienvenue && m.t === "bienvenue"){ const f = this.attenteBienvenue; this.attenteBienvenue = null; this.capitaine = m.de; f(m); return; }
    if(this.role === "matelot" && (m.t === "capitaineParti" || (m.t === "parti" && m.de === this.capitaine))){ this.ecoute({ t: "fin" }); return; }
    this.ecoute(m);
  }
  async envoyer(m){
    if(this.ferme || !this.cle) return;
    m.de = this.moi; m.id = this.moi + ":" + (++this.seq);
    const p = await chiffrer(this.cle, m);
    for(const c of this.clients) if(c.connected) try{ c.publish(this.salon, p, { qos: 0 }); }catch(e){}
  }
  /* le capitaine : un code au hasard */
  async creer(infos){
    this.role = "capitaine"; this.infos = infos;
    const code = String(1000 + Math.floor(Math.random() * 9000));
    await this.brancher(code);
    this.surveiller();
    return code;
  }
  /* un matelot : on dit bonjour et on attend la réponse du capitaine */
  async rejoindre(code, bonjour){
    this.role = "matelot";
    await this.brancher(code);
    return new Promise((ok, ko) => {
      this.attenteBienvenue = (m) => { clearInterval(rep); clearTimeout(fin); this.surveiller(); ok(m); };
      const dire = () => this.envoyer(Object.assign({ t: "bonjour" }, bonjour));
      dire(); const rep = setInterval(dire, 2500);       // on redit bonjour au cas où un message se perd
      const fin = setTimeout(() => { clearInterval(rep); this.attenteBienvenue = null; const e = new Error("pas de capitaine"); e.type = "peer-unavailable"; ko(e); }, 12000);
    });
  }
  /* si quelqu'un ne donne plus de nouvelles (appareil éteint, onglet fermé), on le considère parti */
  surveiller(){
    this.minuteurSurv = setInterval(() => {
      const maintenant = performance.now();
      for(const [id, t] of this.joueurs) if(maintenant - t > 12000){
        this.joueurs.delete(id);
        if(this.role === "matelot" && id === this.capitaine) this.ecoute({ t: "fin" });
        else this.ecoute({ t: "parti", de: id });
      }
    }, 2000);
  }
  nombre(){ return this.joueurs.size + 1; }
  servicesOk(){ return Object.values(this.etatServices).filter(Boolean).length; }
  fermer(){
    if(this.ferme) return;
    this.envoyer({ t: this.role === "capitaine" ? "capitaineParti" : "parti" });
    setTimeout(() => { this.ferme = true; clearInterval(this.minuteurSurv); for(const c of this.clients) try{ c.end(true); }catch(e){} }, 300);
  }
}
