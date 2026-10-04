"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Row = {
  id:number; reference:string; serial:string; year:number; brand:string; model:string;
  phone:string|null; email:string|null; vin:string|null; language:string; status:string;
  payment_provider:string|null; amount_total:number|null; currency:string|null; paid_at:string|null;
  stereo_code:string|null; code_updated_at:string|null;
};

export default function AdminPanel(){
  const [auth,setAuth]=useState<boolean|null>(null);
  const [password,setPassword]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [draftCodes,setDraftCodes]=useState<Record<number,string>>({});
  const [savingCode,setSavingCode]=useState<number|null>(null);
  const [q,setQ]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);

  async function load(){
    const r=await fetch("/api/admin/requests",{cache:"no-store"});
    if(r.status===401){setAuth(false);setRows([]);return;}
    if(!r.ok){setAuth(true);setError("No se pudieron cargar las solicitudes.");return;}
    const j=await r.json();
    const nextRows:Row[]=j.requests||[];
    setRows(nextRows);
    setDraftCodes(Object.fromEntries(nextRows.map(row=>[row.id,row.stereo_code||""])));
    setAuth(true);
    setError("");
  }

  useEffect(()=>{load().catch(()=>setAuth(false));},[]);

  async function login(e:FormEvent){
    e.preventDefault(); setBusy(true); setError("");
    const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
    if(!r.ok){setError(r.status===503?"Configura la contraseña del panel.":"Contraseña incorrecta.");setBusy(false);return;}
    setPassword(""); await load(); setBusy(false);
  }

  async function logout(){await fetch("/api/admin/logout",{method:"POST"});setAuth(false);setRows([]);}

  async function changeStatus(id:number,status:string){
    setError(""); setNotice("");
    const r=await fetch("/api/admin/requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    if(!r.ok){setError("No se pudo actualizar el estado.");return;}
    setRows(x=>x.map(row=>row.id===id?{...row,status}:row));
  }

  async function saveCode(id:number){
    setSavingCode(id); setError(""); setNotice("");
    const stereoCode=(draftCodes[id]||"").trim();
    const r=await fetch("/api/admin/requests",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,stereoCode})});
    if(!r.ok){setError("No se pudo guardar el código del estéreo.");setSavingCode(null);return;}
    const j=await r.json();
    setRows(x=>x.map(row=>row.id===id?{...row,stereo_code:j.stereoCode||null,code_updated_at:j.codeUpdatedAt||null}:row));
    setNotice(stereoCode?"Código guardado correctamente.":"Código eliminado.");
    setSavingCode(null);
  }

  function deliveryMessage(r:Row){
    const code=(r.stereo_code||"").trim();
    if(r.language==="es"){
      return `Hola. Tu código de desbloqueo para ${r.year} ${r.brand} ${r.model} es: ${code}. Folio: ${r.reference}. Gracias por usar Auto Stereo Codes.`;
    }
    return `Hello. Your unlock code for your ${r.year} ${r.brand} ${r.model} is: ${code}. Reference: ${r.reference}. Thank you for using Auto Stereo Codes.`;
  }

  function whatsappUrl(r:Row){
    const digits=(r.phone||"").replace(/\D/g,"");
    if(!digits||!r.stereo_code)return "";
    return `https://wa.me/${digits}?text=${encodeURIComponent(deliveryMessage(r))}`;
  }

  function emailUrl(r:Row){
    if(!r.email||!r.stereo_code)return "";
    const subject=r.language==="es"?`Tu código de estéreo - ${r.reference}`:`Your stereo code - ${r.reference}`;
    return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(deliveryMessage(r))}`;
  }

  const filtered=useMemo(()=>{
    const s=q.toLowerCase().trim(); if(!s)return rows;
    return rows.filter(r=>[r.reference,r.serial,r.brand,r.model,r.phone||"",r.email||"",r.vin||"",r.stereo_code||""].some(v=>String(v).toLowerCase().includes(s)));
  },[q,rows]);

  const counts={
    total:rows.length,
    new:rows.filter(r=>r.status==="new").length,
    processing:rows.filter(r=>r.status==="processing").length,
    completed:rows.filter(r=>r.status==="completed").length,
  };

  if(auth===null)return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Cargando…</main>;

  if(!auth)return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
    <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
      <div className="text-sm font-black tracking-[.2em] text-blue-400">AUTO STEREO CODES</div>
      <h1 className="mt-4 text-3xl font-black">Panel de administrador</h1>
      <p className="mt-2 text-slate-400">Acceso privado a solicitudes pagadas.</p>
      <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="mt-7 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"/>
      {error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-sm text-amber-100">{error}</p>}
      <button disabled={busy} className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500">{busy?"Entrando…":"Entrar"}</button>
      <a href="/" className="mt-5 block text-center text-sm text-slate-400">← Volver</a>
    </form>
  </main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><div className="text-sm font-black tracking-[.2em] text-blue-400">AUTO STEREO CODES</div><h1 className="mt-2 text-4xl font-black">Solicitudes pagadas</h1></div>
        <div className="flex gap-2"><button onClick={load} className="rounded-xl border border-slate-700 px-4 py-2">Actualizar</button><button onClick={logout} className="rounded-xl bg-slate-800 px-4 py-2">Cerrar sesión</button></div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Total",counts.total],["Nuevas",counts.new],["En proceso",counts.processing],["Completadas",counts.completed]].map(([a,b])=><div key={String(a)} className="rounded-2xl border border-white/10 bg-slate-900 p-5"><div className="text-sm text-slate-400">{a}</div><div className="mt-1 text-3xl font-black">{b}</div></div>)}
      </div>

      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar folio, serial, vehículo, WhatsApp, email, VIN o código…" className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"/>
      {error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-amber-100">{error}</p>}
      {notice&&<p className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950 p-3 text-emerald-100">{notice}</p>}

      <div className="mt-6 space-y-4">
        {filtered.map(r=>{
          const amount=r.amount_total==null?"—":new Intl.NumberFormat("en-US",{style:"currency",currency:(r.currency||"USD").toUpperCase()}).format(r.amount_total/100);
          const wa=whatsappUrl(r);
          const mail=emailUrl(r);
          return <article key={r.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div><div className="text-xs font-bold uppercase tracking-widest text-blue-400">Folio</div><div className="mt-1 text-xl font-black">{r.reference}</div><div className="mt-1 text-sm text-slate-400">{amount} · {r.payment_provider||"paypal"} · {r.paid_at?new Date(r.paid_at).toLocaleString("es-MX"):"—"}</div></div>
              <select value={r.status} onChange={e=>changeStatus(r.id,e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"><option value="new">Nueva</option><option value="processing">En proceso</option><option value="completed">Completada</option></select>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Item label="Vehículo" value={`${r.year} ${r.brand} ${r.model}`}/><Item label="Serial" value={r.serial}/><Item label="WhatsApp" value={r.phone||"—"}/><Item label="Email" value={r.email||"—"}/><Item label="VIN" value={r.vin||"—"}/><Item label="Idioma" value={r.language==="es"?"Español":"English"}/>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-slate-950/70 p-4">
              <div className="text-sm font-bold text-blue-300">Código de desbloqueo</div>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  value={draftCodes[r.id]??""}
                  onChange={e=>setDraftCodes(x=>({...x,[r.id]:e.target.value}))}
                  maxLength={100}
                  placeholder="Escribe aquí el código del estéreo"
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-lg outline-none focus:border-blue-500"
                />
                <button onClick={()=>saveCode(r.id)} disabled={savingCode===r.id} className="rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:opacity-50">
                  {savingCode===r.id?"Guardando…":"Guardar código"}
                </button>
              </div>
              <div className="mt-3 text-xs text-slate-500">Guarda el código antes de enviarlo al cliente.</div>

              <div className="mt-4 flex flex-wrap gap-3">
                {wa?<a href={wa} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 font-bold hover:bg-emerald-500">Enviar por WhatsApp</a>:<button disabled className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-500">Enviar por WhatsApp</button>}
                {mail?<a href={mail} className="rounded-xl bg-indigo-600 px-4 py-2.5 font-bold hover:bg-indigo-500">Enviar por correo</a>:<button disabled className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-500">Enviar por correo</button>}
              </div>

              {r.stereo_code&&<div className="mt-4 text-sm text-slate-400">Código guardado: <span className="font-mono font-bold text-white">{r.stereo_code}</span>{r.code_updated_at?` · ${new Date(r.code_updated_at).toLocaleString("es-MX")}`:""}</div>}
            </div>
          </article>;
        })}
        {filtered.length===0&&<div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">No hay solicitudes.</div>}
      </div>
    </div>
  </main>;
}

function Item({label,value}:{label:string;value:string}){return <div><div className="text-xs uppercase text-slate-500">{label}</div><div className="mt-1 break-all font-semibold">{value}</div></div>}
