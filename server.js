'use strict';
/* Servidor de COMPLIANCE SHOOTER: sirve el juego y gestiona sala, rondas y ranking.
   Sin dependencias: solo Node 18+. Los datos viven en memoria (se pierden al reiniciar). */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000;
const KEY=process.env.ADMIN_KEY||crypto.randomBytes(4).toString('hex');
const PAGE=fs.readFileSync(path.join(__dirname,'public','index.html'));
let session={round:0,state:'lobby'};const players=new Map(),clients=new Set();let pending=false;
const snap=()=>JSON.stringify({now:Date.now(),session,players:Object.fromEntries(players)});
function broadcast(){ // como máximo 4 envíos por segundo
  if(pending)return;pending=true;
  setTimeout(()=>{pending=false;const d='data: '+snap()+'\n\n';for(const c of clients)c.write(d)},250);
}
const clean=s=>String(s||'').replace(/[^\p{L}\p{N} ._-]/gu,'').replace(/\s+/g,' ').trim().slice(0,20);
const num=(v,a,b)=>Math.min(b,Math.max(a,Math.trunc(+v)||0));
const isKey=k=>typeof k==='string'&&k.length===KEY.length&&crypto.timingSafeEqual(Buffer.from(k),Buffer.from(KEY));
const body=req=>new Promise(r=>{let b='';req.on('data',c=>{b+=c;if(b.length>2048)req.destroy()});req.on('end',()=>{try{r(JSON.parse(b))}catch(e){r({})}});req.on('close',()=>r({}))});
const json=(res,o,c=200)=>{res.writeHead(c,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
http.createServer(async(req,res)=>{
  const u=req.url.split('?')[0];
  if(req.method==='GET'){
    if(u==='/'||u==='/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(PAGE)}
    if(u==='/healthz')return json(res,{ok:true});
    if(u==='/api/state')return res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}),res.end(snap());
    if(u==='/api/stream'){
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store',Connection:'keep-alive','X-Accel-Buffering':'no'});
      res.write('data: '+snap()+'\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
    }
    return json(res,{error:'not_found'},404);
  }
  if(req.method==='POST'&&u==='/api/score'){
    const b=await body(req),id=String(b.id||''),name=clean(b.name);
    if(!/^[a-z0-9]{8,40}$/.test(id)||name.length<2)return json(res,{ok:false},400);
    if(!players.has(id)&&players.size>=3000)return json(res,{ok:false},503);
    players.set(id,{name,round:num(b.round,0,100000),score:num(b.score,-5000,20000),hits:num(b.hits,0,500),errors:num(b.errors,0,500),lives:num(b.lives,0,3),status:['lobby','playing','finished'].includes(b.status)?b.status:'lobby',t:Date.now()});
    broadcast();return json(res,{ok:true});
  }
  if(req.method==='POST'&&u==='/api/admin'){
    const b=await body(req);if(!isKey(b.key))return json(res,{ok:false},403);
    if(b.action==='start')session={round:session.round+1,state:'running'};
    else if(b.action==='close')session={round:session.round,state:'closed'};
    else if(b.action==='reset'){players.clear();session={round:0,state:'lobby'}}
    broadcast();return json(res,{ok:true,session});
  }
  json(res,{error:'not_found'},404);
}).listen(PORT,()=>{
  const ips=Object.values(require('os').networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
  console.log('\nCOMPLIANCE SHOOTER en marcha. No cierres esta ventana durante la actividad.\n');
  for(const ip of ips){console.log('Participantes (misma red Wi-Fi):  http://'+ip+':'+PORT);console.log('Anfitrión (solo tú):              http://'+ip+':'+PORT+'/?host='+KEY+'\n')}
  if(!ips.length)console.log('Anfitrión: http://localhost:'+PORT+'/?host='+KEY);
});
setInterval(()=>{for(const c of clients)c.write(': ping\n\n');const lim=Date.now()-2*3600e3;for(const[k,p]of players)if(p.t<lim)players.delete(k)},20000);
