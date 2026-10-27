"""Fait écouter par Whisper tous les sons « avec des mots » des jeux lire/ et parler/ et compare aux mots attendus."""
import sys, os, json, re, subprocess
sys.path.insert(0,"/tmp/claude-0/juge"); sys.path.insert(0,"/home/claude/jeux-enfants/outils")
from choisir import ecouter, sons
from juge import transcrire
from voix_piper import slug
R="/home/claude/jeux-enfants/"
def js(f,expr): return json.loads(subprocess.run(["node","-e","global.window={};require('%s');process.stdout.write(JSON.stringify(%s))"%(R+f,expr)],capture_output=True,text=True).stdout)
L=js("lire/donnees.js","window.LIRE"); P=js("parler/mots.js","{m:window.MOTS,p:window.PHRASES_PARLER}")
att={}
for k,v in L["voix"].items():
    for x in (v if isinstance(v,list) else [v]): att["lire/v-"+slug(x)]=x
for x in L["voyelles"]+L["chantantes"]: att["lire/c-"+slug(x["mot"])]="comme "+x["mot"]
for w in L["mots"]: att["lire/m-"+slug(w["m"])]=w["m"]
for p in L["phrases"]:
    att["lire/p-"+slug(p["p"])]=p["p"]
    for m in re.findall(r"[\wÀ-ÿ']+",p["p"]): att["lire/w-"+slug(m)]=m
for k,v in P["p"].items():
    for x in (v if isinstance(v,list) else [v]): att["parler/p-"+slug(x)]=x
for niv,l in P["m"].items():
    for w in l: att["parler/c-"+slug(w["m"])]="Regarde, c'est "+w["c"]; att["parler/m-"+slug(w["m"])]=w["m"]
def dist(a,b):
    m=[[i+j if i*j==0 else 0 for j in range(len(b)+1)] for i in range(len(a)+1)]
    for i in range(1,len(a)+1):
        for j in range(1,len(b)+1): m[i][j]=min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]!=b[j-1]))
    return m[-1][-1]
sortie="/tmp/claude-0/juge/audit.json"; res=json.load(open(sortie)) if os.path.exists(sortie) else {}
for k,t in sorted(att.items()):
    if k in res: continue
    f=R+k.replace("/","/sons/",1)+".mp3"
    if not os.path.exists(f): res[k]={"manque":True}; continue
    court=len(t.split())<=2
    e=ecouter(f) if court else transcrire(f).lower()
    a,b=sons(t),sons(e) if e else ""
    d=dist(a,b); ok=d<=max(0,len(a)//6)
    res[k]={"attendu":t,"entendu":e,"ok":ok,"ecart":d}
    print("OK " if ok else "?? ",k,"|",t,"→",e,flush=True)
    json.dump(res,open(sortie,"w"),ensure_ascii=False,indent=1)
