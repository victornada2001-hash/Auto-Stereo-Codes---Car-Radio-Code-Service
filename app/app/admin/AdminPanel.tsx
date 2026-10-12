"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Row = {
  id:number;
  reference:string;
  serial:string;
  year:number|null;
  brand:string|null;
  model:string|null;
  phone:string|null;
  email:string|null;
  vin:string|null;
  postal_code:string|null;
  language:string;
  status:string;
  priority_sms:boolean;
  payment_provider:string|null;
  amount_total:number|null;
  currency:string|null;
  paid_at:string|null;
  stereo_code:string|null;
  code_updated_at:string|null;
};

type Tab = "pending"|"ready"|"completed";

const ALLOWED_BRANDS = new Set(["honda","acura"]);

function isHondaAcura(row:Row){
  return ALLOWED_BRANDS.has(String(row.brand||"").trim().toLowerCase());
}

function officialLookupUrl(row:Row){
  return String(row.brand||"").trim().toLowerCase()==="acura"
    ? "https://mygarage.honda.com/s/radio-nav-code?brand=Acura"
    : "https://mygarage.honda.com/s/radio-nav-code?brand=Honda";
}

function officialLookupLabel(row:Row){
  return String(row.brand||"").trim().toLowerCase()==="acura"?"Buscar en Acura":"Buscar en Honda";
}

function amountLabel(row:Row){
  if(row.amount_total==null) return "—";
  return new Intl.NumberFormat("en-US",{
    style:"currency",
    currency:(row.currency||"USD").toUpperCase(),
  }).format(row.amount_total/100);
}

function dateLabel(value:string|null){
  if(!value) return "—";
  return new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}

function deliveryMessage(row:Row,code:string){
  const brand=row.brand||"Honda/Acura";
  if(row.language==="es") return `Hola. Tu código de desbloqueo para ${brand} es: ${code}. Folio: ${row.reference}. Gracias por usar Auto Stereo Codes.`;
  return `Hello. Your ${brand} stereo unlock code is: ${code}. Reference: ${row.reference}. Thank you for using Auto Stereo Codes.`;
}

function emailUrl(row:Row,code:string){
  if(!row.email||!code.trim()) return "";
  const subject=row.language==="es"?`Tu código Honda/Acura - ${row.reference}`:`Your Honda/Acura code - ${row.reference}`;
  return `mailto:${row.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(deliveryMessage(row,code.trim()))}`;
}

function smsUrl(row:Row,code:string){
  const phone=(row.phone||"").replace(/[^\d+]/g,"");
  if(!phone||!code.trim()||!row.priority_sms) return "";
  return `sms:${phone}?body=${encodeURIComponent(deliveryMessage(row,code.trim()))}`;
}

export default function AdminPanel(){
  const [auth,setAuth]=useState<boolean|null>(null);
  const [password,setPassword]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [codes,setCodes]=useState<Record<number,string>>({});
  const [tab,setTab]=useState<Tab>("pending");
  const [q,setQ]=useState("");
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [saving,setSaving]=useState<number|null>(null);

  async function load(){
    const response=await fetch("/api/admin/requests",{cache:"no-store"});
    if(response.status===401){setAuth(false);setRows([]);return;}
    if(!response.ok){setAuth(true);setError("No se pudieron cargar las solicitudes.");return;}
    const data=await response.json();
    const all:Row[]=Array.isArray(data.requests)?data.requests:[];
    const onlyHondaAcura=all.filter(isHondaAcura);
    setRows(onlyHondaAcura);
    setCodes(Object.fromEntries(onlyHondaAcura.map(row=>[row.id,row.stereo_code||""])));
    setAuth(true);
    setError("");
  }

  useEffect(()=>{load().catch(()=>setAuth(false));},[]);

  async function login(event:FormEvent){
    event.preventDefault();
    setBusy(true);setError("");
    const response=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
    if(!response.ok){setError(response.status===503?"Configura la contraseña del panel.":"Contraseña incorrecta.");setBusy(false);return;}
    setPassword("");
    await load();
    setBusy(false);
  }

  async function logout(){
    await fetch("/api/admin/logout",{method:"POST"});
    setAuth(false);setRows([]);
  }

  async function copyValue(label:string,value:string|null){
    if(!value){setNotice(`${label}: sin dato.`);return;}
    try{
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copiado.`);
      setError("");
    }catch{
      setError(`No se pudo copiar ${label.toLowerCase()}.`);
    }
  }

  async function copyLookupData(row:Row){
    const text=[
      `Marca: ${row.brand||""}`,
      `Año: ${row.year||""}`,
      `Modelo: ${row.model||""}`,
      `Serie: ${row.serial||""}`,
      `VIN: ${row.vin||""}`,
      `ZIP/Código postal: ${row.postal_code||""}`,
      `Teléfono: ${row.phone||""}`,
      `Email: ${row.email||""}`,
    ].join("\n");
    try{
      await navigator.clipboard.writeText(text);
      setNotice("Datos para Honda/Acura copiados.");
      setError("");
    }catch{
      setError("No se pudieron copiar los datos.");
    }
  }

  async function saveCode(row:Row){
    setSaving(row.id);setError("");setNotice("");
    const stereoCode=(codes[row.id]||"").trim();
    const response=await fetch("/api/admin/requests",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id,stereoCode})});
    if(!response.ok){setError("No se pudo guardar el código.");setSaving(null);return;}
    const data=await response.json();
    setRows(current=>current.map(item=>item.id===row.id?{...item,stereo_code:data.stereoCode||null,code_updated_at:data.codeUpdatedAt||null}:item));
    setNotice(stereoCode?"Código Honda/Acura guardado.":"Código eliminado.");
    setSaving(null);
  }

  async function markCompleted(row:Row){
    setError("");setNotice("");
    const response=await fetch("/api/admin/requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id,status:"completed"})});
    if(!response.ok){setError("No se pudo marcar como completada.");return;}
    setRows(current=>current.map(item=>item.id===row.id?{...item,status:"completed"}:item));
    setNotice("Solicitud archivada como completada.");
  }

  const counts=useMemo(()=>({
    pending:rows.filter(r=>r.status!=="completed"&&!String(r.stereo_code||"").trim()).length,
    ready:rows.filter(r=>r.status!=="completed"&&String(r.stereo_code||"").trim()).length,
    completed:rows.filter(r=>r.status==="completed").length,
  }),[rows]);

  const filtered=useMemo(()=>{
    const search=q.toLowerCase().trim();
    return rows.filter(row=>{
      const hasCode=Boolean(String(row.stereo_code||"").trim());
      if(tab==="completed"&&row.status!=="completed") return false;
      if(tab==="pending"&&(row.status==="completed"||hasCode)) return false;
      if(tab==="ready"&&(row.status==="completed"||!hasCode)) return false;
      if(!search) return true;
      return [row.reference,row.serial,row.brand||"",row.model||"",row.email||"",row.phone||"",row.vin||"",row.postal_code||"",row.stereo_code||"",row.year||""].some(value=>String(value).toLowerCase().includes(search));
    });
  },[rows,tab,q]);

  if(auth===null) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Cargando…</main>;

  if(!auth) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
    <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
      <div className="text-sm font-black tracking-[.2em] text-red-400">HONDA · ACURA</div>
      <h1 className="mt-4 text-3xl font-black">Panel de códigos</h1>
      <p className="mt-2 text-slate-400">Solo solicitudes pagadas de Honda y Acura.</p>
      <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="mt-7 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-500"/>
      {error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-sm text-amber-100">{error}</p>}
      <button disabled={busy} className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500 disabled:opacity-60">{busy?"Entrando…":"Entrar"}</button>
    </form>
  </main>;

  return <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-black tracking-[.2em] text-red-400">AUTO STEREO CODES · HONDA / ACURA</div>
          <h1 className="mt-2 text-4xl font-black">Solicitudes Honda y Acura</h1>
          <p className="mt-2 text-sm text-slate-400">Cada solicitud incluye acceso directo a la fuente oficial Honda o Acura y los datos listos para copiar.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>void load()} className="rounded-xl border border-slate-700 px-4 py-2 font-bold">Actualizar</button>
          <button onClick={()=>void logout()} className="rounded-xl bg-slate-800 px-4 py-2 font-bold">Cerrar sesión</button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Metric label="Pendientes" value={counts.pending}/>
        <Metric label="Código listo" value={counts.ready}/>
        <Metric label="Completadas" value={counts.completed}/>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <TabButton active={tab==="pending"} onClick={()=>setTab("pending")}>Pendientes ({counts.pending})</TabButton>
        <TabButton active={tab==="ready"} onClick={()=>setTab("ready")}>Código listo ({counts.ready})</TabButton>
        <TabButton active={tab==="completed"} onClick={()=>setTab("completed")}>Completadas ({counts.completed})</TabButton>
      </div>

      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar folio, serie, VIN, ZIP, Honda/Acura, modelo, email, teléfono o código…" className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-red-500"/>

      {error&&<p className="mt-4 rounded-xl border border-amber-700 bg-amber-950 p-3 text-amber-100">{error}</p>}
      {notice&&<p className="mt-4 rounded-xl border border-emerald-700 bg-emerald-950 p-3 text-emerald-100">{notice}</p>}

      <div className="mt-6 space-y-4">
        {filtered.map(row=>{
          const code=(codes[row.id]??row.stereo_code??"").trim();
          const mail=emailUrl(row,code);
          const sms=smsUrl(row,code);
          const completed=row.status==="completed";
          return <article key={row.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_.9fr_.9fr_auto] md:items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Folio</div>
                <div className="mt-1 text-xl font-black">{row.reference}</div>
                <div className="mt-2 inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-300">{row.brand||"Honda/Acura"}</div>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Vehículo</div>
                <div className="mt-1 font-bold">{row.year||"—"} {row.model||"Modelo no indicado"}</div>
                <div className="mt-1 text-sm text-slate-400">Serie: <span className="font-mono text-slate-200">{row.serial}</span></div>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Cliente</div>
                <div className="mt-1 text-sm font-bold">{row.email||"Sin email"}</div>
                <div className="mt-1 text-sm text-slate-400">{row.phone||"Sin teléfono"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Pago</div>
                <div className="mt-1 text-lg font-black text-emerald-300">{amountLabel(row)}</div>
                <div className="mt-1 text-xs text-slate-500">{dateLabel(row.paid_at)}</div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/35 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Consulta oficial</div>
                  <p className="mt-1 text-sm text-slate-500">Abre la página oficial correspondiente y usa los datos de esta solicitud.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={officialLookupUrl(row)} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950">{officialLookupLabel(row)} ↗</a>
                  <button onClick={()=>void copyLookupData(row)} className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-black">Copiar todos los datos</button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <DataBox label="VIN" value={row.vin} onCopy={()=>void copyValue("VIN",row.vin)}/>
                <DataBox label="Serie del radio" value={row.serial} onCopy={()=>void copyValue("Serie",row.serial)}/>
                <DataBox label="ZIP / Código postal" value={row.postal_code} onCopy={()=>void copyValue("ZIP/Código postal",row.postal_code)}/>
                <DataBox label="Teléfono" value={row.phone} onCopy={()=>void copyValue("Teléfono",row.phone)}/>
                <DataBox label="Email" value={row.email} onCopy={()=>void copyValue("Email",row.email)}/>
                <DataBox label="Año" value={row.year?String(row.year):null} onCopy={()=>void copyValue("Año",row.year?String(row.year):null)}/>
                <DataBox label="Modelo" value={row.model} onCopy={()=>void copyValue("Modelo",row.model)}/>
                <DataBox label="Marca" value={row.brand} onCopy={()=>void copyValue("Marca",row.brand)}/>
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/55 p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Código de desbloqueo Honda / Acura</span>
                  <input value={codes[row.id]??row.stereo_code??""} onChange={e=>setCodes(current=>({...current,[row.id]:e.target.value.toUpperCase()}))} disabled={completed} placeholder="Escribe el código" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-lg font-black tracking-wider outline-none focus:border-red-500 disabled:opacity-60"/>
                </label>
                {!completed&&<button onClick={()=>void saveCode(row)} disabled={saving===row.id} className="rounded-xl bg-red-600 px-5 py-3 font-black hover:bg-red-500 disabled:opacity-60">{saving===row.id?"Guardando…":"Guardar código"}</button>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {mail&&<a href={mail} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black">Enviar por correo</a>}
                {sms&&<a href={sms} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black">Enviar por SMS</a>}
                {!completed&&code&&<button onClick={()=>void markCompleted(row)} className="rounded-xl border border-emerald-500 px-4 py-2 text-sm font-black text-emerald-300">✓ Marcar completada</button>}
                {completed&&<span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-black text-emerald-300">Completada</span>}
              </div>
            </div>
          </article>;
        })}
      </div>

      {!filtered.length&&<div className="mt-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 p-10 text-center font-bold text-slate-500">No hay solicitudes Honda/Acura en esta sección.</div>}
    </div>
  </main>;
}

function Metric({label,value}:{label:string;value:number}){
  return <div className="rounded-2xl border border-white/10 bg-slate-900 p-5"><div className="text-sm text-slate-400">{label}</div><div className="mt-1 text-3xl font-black">{value}</div></div>;
}

function TabButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black ${active?"bg-red-600 text-white":"border border-slate-700 bg-slate-900 text-slate-300"}`}>{children}</button>;
}

function DataBox({label,value,onCopy}:{label:string;value:string|null;onCopy:()=>void}){
  return <button type="button" onClick={onCopy} className="rounded-xl border border-white/10 bg-slate-900 p-3 text-left transition hover:border-slate-500">
    <div className="text-[11px] font-black uppercase tracking-[.14em] text-slate-500">{label}</div>
    <div className="mt-1 break-all font-mono text-sm font-bold text-slate-200">{value||"—"}</div>
    <div className="mt-2 text-[11px] font-bold text-slate-600">Toca para copiar</div>
  </button>;
}
