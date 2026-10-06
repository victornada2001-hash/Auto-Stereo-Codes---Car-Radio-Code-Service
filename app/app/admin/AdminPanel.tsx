"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Row = {
  id:number; reference:string; serial:string; year:number|null; brand:string|null; model:string|null;
  phone:string|null; email:string|null; vin:string|null; language:string; status:string; priority_sms:boolean;
  payment_provider:string|null; amount_total:number|null; currency:string|null; paid_at:string|null;
  stereo_code:string|null; code_updated_at:string|null;
};

type Queue = "all"|"automatic"|"special";
type AiDecision = {queue:"automatic"|"special";confidence:"high"|"medium"|"low";reason:string;source:"ai"|"rules"};
type LookupResult = {
  status:"found"|"manual"|"unsupported"|"needs_input";
  code?:string; source?:string; sourceUrl?:string; reason:string; missing?:string[];
};

const languageNames:Record<string,string>={en:"English",es:"Español",pt:"Português",fr:"Français",de:"Deutsch",it:"Italiano"};
const automaticBrands=new Set(["honda","acura","renault","dacia"]);
const specialBrands=new Set(["mercedes-benz","mercedes","jeep","chrysler","dodge","nissan"]);

function fallbackRouting(row:Row):AiDecision{
  const brand=(row.brand||"").trim().toLowerCase();
  if(specialBrands.has(brand)) return {queue:"special",confidence:"high",reason:"Requiere proveedor o validación manual antes de entregar.",source:"rules"};
  if(automaticBrands.has(brand)) return {queue:"automatic",confidence:"medium",reason:"Prioridad para intentar una fuente oficial o aprobada antes de escalar a proveedor.",source:"rules"};
  return {queue:"special",confidence:"low",reason:"Todavía no hay una fuente automática validada para esta marca.",source:"rules"};
}

function reviewState(row:Row){
  if(row.status==="completed") return {label:"Enviado / completado",className:"bg-blue-500/15 text-blue-300"};
  if((row.stereo_code||"").trim()) return {label:"Código encontrado — revisar antes de enviar",className:"bg-emerald-500/15 text-emerald-300"};
  return {label:"Pendiente de conseguir código",className:"bg-slate-500/15 text-slate-300"};
}

function lookupStyle(status:LookupResult["status"]){
  if(status==="found") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  if(status==="needs_input") return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  return "border-slate-600 bg-slate-950/70 text-slate-300";
}

export default function AdminPanel(){
  const [auth,setAuth]=useState<boolean|null>(null);
  const [password,setPassword]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [draftCodes,setDraftCodes]=useState<Record<number,string>>({});
  const [aiById,setAiById]=useState<Record<number,AiDecision>>({});
  const [lookupById,setLookupById]=useState<Record<number,LookupResult>>({});
  const [aiConfigured,setAiConfigured]=useState<boolean|null>(null);
  const [analyzing,setAnalyzing]=useState<number|null>(null);
  const [lookingUp,setLookingUp]=useState<number|null>(null);
  const [savingCode,setSavingCode]=useState<number|null>(null);
  const [q,setQ]=useState("");
  const [queue,setQueue]=useState<Queue>("all");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);

  async function checkAiStatus(){
    try{
      const r=await fetch("/api/admin/route-ai",{method:"GET",cache:"no-store"});
      if(!r.ok) return;
      const j=await r.json();
      setAiConfigured(Boolean(j.aiConfigured));
    }catch{}
  }

  async function analyzeRoute(row:Row,silent=false){
    if(!silent){setAnalyzing(row.id);setError("");setNotice("");}
    try{
      const r=await fetch("/api/admin/route-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({brand:row.brand,model:row.model,year:row.year,serial:row.serial,radioFamily:row.model||""})});
      if(!r.ok) throw new Error("AI_ROUTE_FAILED");
      const j=await r.json();
      const d=j?.decision as AiDecision|undefined;
      setAiConfigured(Boolean(j.aiConfigured));
      if(d?.queue&&d?.reason){
        setAiById(x=>({...x,[row.id]:d}));
        if(!silent){
          if(d.source==="ai") setNotice("La IA analizó la solicitud.");
          else if(j.aiConfigured) setNotice("La IA está configurada, pero esta solicitud usó las reglas de respaldo.");
          else setNotice("Clasificación aplicada con reglas seguras; la IA aún no está configurada.");
        }
      }
    }catch{
      setAiById(x=>({...x,[row.id]:fallbackRouting(row)}));
      if(!silent)setError("No se pudo consultar la IA; se aplicaron reglas seguras.");
    }finally{if(!silent)setAnalyzing(null);}
  }

  async function lookupCode(row:Row){
    setLookingUp(row.id);setError("");setNotice("");
    try{
      const response=await fetch("/api/admin/code-lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({brand:row.brand,serial:row.serial,vin:row.vin,year:row.year,model:row.model,email:row.email,phone:row.phone})});
      if(!response.ok) throw new Error("LOOKUP_FAILED");
      const result=await response.json() as LookupResult;
      setLookupById(x=>({...x,[row.id]:result}));
      if(result.status==="found"&&result.code){
        setDraftCodes(x=>({...x,[row.id]:result.code||""}));
        setNotice("Código encontrado por una fuente conectada. Ya lo coloqué en el campo; revísalo y presiona Guardar código.");
      }else if(result.status==="needs_input"){
        setNotice("La fuente oficial necesita un dato adicional antes de hacer la consulta.");
      }else{
        setNotice("No hubo un código automático. Dejé disponible la fuente oficial para revisión manual cuando aplica.");
      }
    }catch{setError("No se pudo ejecutar la búsqueda automática. La solicitud permanece para revisión manual.");}
    finally{setLookingUp(null);}
  }

  async function load(){
    const r=await fetch("/api/admin/requests",{cache:"no-store"});
    if(r.status===401){setAuth(false);setRows([]);return;}
    if(!r.ok){setAuth(true);setError("No se pudieron cargar las solicitudes.");return;}
    const j=await r.json();
    const nextRows:Row[]=j.requests||[];
    setRows(nextRows);
    setDraftCodes(Object.fromEntries(nextRows.map(row=>[row.id,row.stereo_code||""])));
    setAuth(true);setError("");
    void checkAiStatus();
    for(const row of nextRows.slice(0,25)){void analyzeRoute(row,true);}
  }

  useEffect(()=>{load().catch(()=>setAuth(false));},[]);

  async function login(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");
    const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
    if(!r.ok){setError(r.status===503?"Configura la contraseña del panel.":"Contraseña incorrecta.");setBusy(false);return;}
    setPassword("");await load();setBusy(false);
  }
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});setAuth(false);setRows([]);}
  async function changeStatus(id:number,status:string){
    setError("");setNotice("");
    const r=await fetch("/api/admin/requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    if(!r.ok){setError("No se pudo actualizar el estado.");return;}
    setRows(x=>x.map(row=>row.id===id?{...row,status}:row));
  }
  async function saveCode(id:number){
    setSavingCode(id);setError("");setNotice("");
    const stereoCode=(draftCodes[id]||"").trim();
    const r=await fetch("/api/admin/requests",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,stereoCode})});
    if(!r.ok){setError("No se pudo guardar el código del estéreo.");setSavingCode(null);return;}
    const j=await r.json();
    setRows(x=>x.map(row=>row.id===id?{...row,stereo_code:j.stereoCode||null,code_updated_at:j.codeUpdatedAt||null}:row));
    setNotice(stereoCode?"Código guardado. Revísalo antes de enviarlo.":"Código eliminado.");setSavingCode(null);
  }

  function deliveryMessage(r:Row){const code=(r.stereo_code||"").trim();if(r.language==="es")return `Hola. Tu código de desbloqueo es: ${code}. Folio: ${r.reference}. Gracias por usar Auto Stereo Codes.`;return `Hello. Your stereo unlock code is: ${code}. Reference: ${r.reference}. Thank you for using Auto Stereo Codes.`;}
  function emailUrl(r:Row){if(!r.email||!r.stereo_code)return "";const subject=r.language==="es"?`Tu código de estéreo - ${r.reference}`:`Your stereo code - ${r.reference}`;return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(deliveryMessage(r))}`;}
  function smsUrl(r:Row){const digits=(r.phone||"").replace(/[^\d+]/g,"");if(!digits||!r.stereo_code||!r.priority_sms)return "";return `sms:${digits}?body=${encodeURIComponent(deliveryMessage(r))}`;}

  const routed=useMemo(()=>rows.map(row=>({row,routing:aiById[row.id]||fallbackRouting(row)})),[rows,aiById]);
  const filtered=useMemo(()=>{const s=q.toLowerCase().trim();return routed.filter(({row,routing})=>{if(queue!=="all"&&routing.queue!==queue)return false;if(!s)return true;return [row.reference,row.serial,row.vin||"",row.brand||"",row.model||"",row.phone||"",row.email||"",row.stereo_code||""].some(v=>String(v).toLowerCase().includes(s));});},[q,queue,routed]);
  const counts={total:rows.length,automatic:routed.filter(x=>x.routing.queue==="automatic").length,special:routed.filter(x=>x.routing.queue==="special").length,ready:rows.filter(r=>(r.stereo_code||"").trim()&&r.status!=="completed").length};

  if(auth===null)return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Cargando…</main>;
  if(!auth)return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8"><div className="text-sm font-black tracking-[.2em] text-blue-400">AUTO STEREO CODES</div><h1 className="mt-4 text-3xl font-black">Panel de administrador</h1><p className="mt-2 text-slate-400">Acceso privado a solicitudes pagadas.</p><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="mt-7 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"/>{error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-sm text-amber-100">{error}</p>}<button disabled={busy} className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500">{busy?"Entrando…":"Entrar"}</button><a href="/" className="mt-5 block text-center text-sm text-slate-400">← Volver</a></form></main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-sm font-black tracking-[.2em] text-blue-400">AUTO STEREO CODES</div><h1 className="mt-2 text-4xl font-black">Solicitudes pagadas</h1><p className="mt-2 text-sm text-slate-400">La IA decide la ruta; las fuentes conectadas buscan el código. Nada se envía sin tu revisión.</p><div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${aiConfigured===true?"bg-emerald-500/15 text-emerald-300":aiConfigured===false?"bg-amber-500/15 text-amber-300":"bg-slate-500/15 text-slate-300"}`}>{aiConfigured===true?"🤖 IA configurada":aiConfigured===false?"🛡️ Reglas activas · IA pendiente de clave/modelo":"⏳ Comprobando IA…"}</div></div><div className="flex gap-2"><button onClick={load} className="rounded-xl border border-slate-700 px-4 py-2">Actualizar</button><button onClick={logout} className="rounded-xl bg-slate-800 px-4 py-2">Cerrar sesión</button></div></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Total",counts.total],["Automáticas",counts.automatic],["Revisión especial",counts.special],["Listas para revisar",counts.ready]].map(([a,b])=><div key={String(a)} className="rounded-2xl border border-white/10 bg-slate-900 p-5"><div className="text-sm text-slate-400">{a}</div><div className="mt-1 text-3xl font-black">{b}</div></div>)}</div>
    <div className="mt-6 flex flex-wrap gap-2">{([['all','Todas'],['automatic','Automáticas'],['special','Revisión especial']] as [Queue,string][]).map(([value,label])=><button key={value} onClick={()=>setQueue(value)} className={`rounded-full px-4 py-2 text-sm font-black ${queue===value?"bg-blue-600 text-white":"border border-slate-700 bg-slate-900 text-slate-300"}`}>{label}</button>)}</div>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar folio, serial, VIN, marca, teléfono, email o código…" className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"/>
    {error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-amber-100">{error}</p>}{notice&&<p className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950 p-3 text-emerald-100">{notice}</p>}
    <div className="mt-6 space-y-4">{filtered.map(({row:r,routing})=>{const amount=r.amount_total==null?"—":new Intl.NumberFormat("en-US",{style:"currency",currency:(r.currency||"USD").toUpperCase()}).format(r.amount_total/100);const mail=emailUrl(r);const sms=smsUrl(r);const state=reviewState(r);const lookup=lookupById[r.id];return <article key={r.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="text-xs font-bold uppercase tracking-widest text-blue-400">Folio</div><div className="mt-1 text-xl font-black">{r.reference}</div><div className="mt-1 text-sm text-slate-400">{amount} · {r.payment_provider||"paypal"} · {r.paid_at?new Date(r.paid_at).toLocaleString("es-MX"):"—"}</div><div className="mt-3 flex flex-wrap gap-2"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${routing.queue==="automatic"?"bg-emerald-500/15 text-emerald-300":"bg-amber-500/15 text-amber-300"}`}>{routing.queue==="automatic"?"⚡ Automática":"🧑‍🔧 Revisión especial"}</span><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${state.className}`}>{state.label}</span><span className="inline-flex rounded-full bg-violet-500/15 px-3 py-1 text-xs font-black text-violet-300">{routing.source==="ai"?"🤖 IA":"🛡️ Reglas"} · {routing.confidence}</span></div><div className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">{routing.reason}</div>{r.priority_sms&&<div className="mt-2 inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-300">📱 SMS PRIORITARIO</div>}</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><button onClick={()=>analyzeRoute(r)} disabled={analyzing===r.id} className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-black text-violet-200 disabled:opacity-50">{analyzing===r.id?"Analizando…":"Analizar con IA"}</button>{routing.queue==="automatic"&&<button onClick={()=>lookupCode(r)} disabled={lookingUp===r.id} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-black text-emerald-200 disabled:opacity-50">{lookingUp===r.id?"Buscando…":"Buscar código automáticamente"}</button>}<select value={r.status} onChange={e=>changeStatus(r.id,e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"><option value="new">Nueva</option><option value="processing">En proceso</option><option value="completed">Completada</option></select></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Item label="Serial" value={r.serial}/><Item label="VIN" value={r.vin||"—"}/><Item label="Marca" value={r.brand||"—"}/><Item label="Email" value={r.email||"—"}/><Item label="Idioma" value={languageNames[r.language]||r.language}/></div>
      {lookup&&<div className={`mt-5 rounded-2xl border p-4 ${lookupStyle(lookup.status)}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-widest">Resultado de búsqueda · {lookup.status}</div><div className="mt-2 text-sm leading-6">{lookup.reason}</div>{lookup.source&&<div className="mt-1 text-xs opacity-75">Fuente: {lookup.source}</div>}</div>{lookup.sourceUrl&&<a href={lookup.sourceUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black hover:bg-white/15">Abrir fuente oficial ↗</a>}</div></div>}
      <div className="mt-6 rounded-2xl border border-blue-500/20 bg-slate-950/70 p-4"><div className="text-sm font-bold text-blue-300">Código de desbloqueo</div><p className="mt-1 text-xs text-slate-400">La búsqueda automática solo llena este campo. Tú revisas y guardas el resultado antes de enviarlo.</p><div className="mt-3 flex flex-col gap-3 md:flex-row"><input value={draftCodes[r.id]??""} onChange={e=>setDraftCodes(x=>({...x,[r.id]:e.target.value}))} maxLength={100} placeholder={routing.queue==="automatic"?"Código de fuente automática o revisión":"Código obtenido del proveedor/revisión"} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg outline-none focus:border-blue-500"/><button onClick={()=>saveCode(r.id)} disabled={savingCode===r.id} className="rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:opacity-50">{savingCode===r.id?"Guardando…":"Guardar código"}</button></div><div className="mt-4 flex flex-wrap gap-3">{mail?<a href={mail} className="rounded-xl bg-indigo-600 px-4 py-2.5 font-bold hover:bg-indigo-500">Revisado: enviar por correo</a>:<button disabled className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-500">Enviar por correo</button>}{sms?<a href={sms} className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold hover:bg-emerald-500">Revisado: enviar por SMS</a>:null}</div>{r.stereo_code&&<div className="mt-4 text-sm text-slate-400">Código guardado: <span className="font-mono font-bold text-white">{r.stereo_code}</span></div>}</div>
    </article>})}{filtered.length===0&&<div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">No hay solicitudes en esta cola.</div>}</div>
  </div></main>;
}

function Item({label,value}:{label:string;value:string}){return <div><div className="text-xs uppercase text-slate-500">{label}</div><div className="mt-1 break-all font-semibold">{value}</div></div>}
