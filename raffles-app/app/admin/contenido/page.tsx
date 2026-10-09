"use client";

import { useEffect, useState } from "react";

type Raffle = { id:string; title:string; status:string; cover_image_url?:string|null };
type GalleryImage = { id:string; url:string; sort_order:number; created_at:string };
type Account = { id?:string; label:string; bank_name:string; beneficiary_name:string; account_number?:string|null; clabe?:string|null; logo_url?:string|null; instructions?:string|null; active:boolean; sort_order:number };

const emptyAccount:Account={label:"Cuenta principal",bank_name:"",beneficiary_name:"",account_number:"",clabe:"",logo_url:"",instructions:"",active:true,sort_order:0};

export default function ContentAdminPage(){
  const [key,setKey]=useState("");
  const [ready,setReady]=useState(false);
  const [raffles,setRaffles]=useState<Raffle[]>([]);
  const [raffleId,setRaffleId]=useState("");
  const [images,setImages]=useState<GalleryImage[]>([]);
  const [files,setFiles]=useState<File[]>([]);
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [newAccount,setNewAccount]=useState<Account>(emptyAccount);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{const saved=sessionStorage.getItem("raffles-admin-key")||"";if(saved){setKey(saved);void load(saved);}},[]);

  async function api(path:string,init:RequestInit={},override=key){const headers=new Headers(init.headers);headers.set("x-admin-key",override);return fetch(path,{...init,headers,cache:"no-store"});}
  async function load(override=key){
    if(!override)return;
    setBusy(true);setError("");
    try{
      const [rRes,sRes]=await Promise.all([api("/api/admin/raffles",{},override),api("/api/admin/settings",{},override)]);
      const r=await rRes.json();const s=await sRes.json();
      if(!rRes.ok)throw new Error(r?.error||"No autorizado");
      if(!sRes.ok)throw new Error(s?.error||"No se pudo cargar cuentas");
      setRaffles(r||[]);setAccounts(s.accounts||[]);setReady(true);sessionStorage.setItem("raffles-admin-key",override);
      const selected=raffleId||(r||[]).find((x:Raffle)=>x.status==="active")?.id||(r||[])[0]?.id||"";
      setRaffleId(selected);if(selected)await loadImages(selected,override);
    }catch(e){setReady(false);setError(e instanceof Error?e.message:"Error");}finally{setBusy(false);}
  }
  async function loadImages(id=raffleId,override=key){if(!id)return;const res=await api(`/api/admin/raffles/images?raffleId=${encodeURIComponent(id)}`,{},override);const data=await res.json();if(res.ok)setImages(data);else setError(data?.error||"No se pudieron cargar imágenes");}
  async function upload(){
    if(!raffleId||!files.length)return;
    setBusy(true);setError("");setMessage("");
    try{
      for(let i=0;i<files.length;i++){
        const form=new FormData();form.append("raffleId",raffleId);form.append("file",files[i]);form.append("makeCover",i===0?"true":"false");
        const res=await api("/api/admin/raffles/image",{method:"POST",body:form});const data=await res.json();if(!res.ok)throw new Error(data?.error||`No se pudo subir ${files[i].name}`);
      }
      setFiles([]);setMessage(`${files.length} imagen(es) agregadas. La primera quedó como portada.`);await loadImages();
    }catch(e){setError(e instanceof Error?e.message:"Error al subir");}finally{setBusy(false);}
  }
  async function hideImage(id:string){const res=await api("/api/admin/raffles/images",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,active:false})});const data=await res.json();if(!res.ok)return setError(data?.error||"No se pudo quitar");await loadImages();}
  async function saveAccount(account:Account){const res=await api("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({account})});const data=await res.json();if(!res.ok)return setError(data?.error||"No se pudo guardar");setMessage(account.id?"Cuenta actualizada":"Cuenta agregada");if(!account.id)setNewAccount(emptyAccount);await load();}

  if(!ready)return <main className="min-h-screen bg-[#0b0d10] p-5 text-white"><div className="mx-auto mt-20 max-w-md rounded-3xl border border-white/10 bg-[#14181d] p-8"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-400">Sorteos Junior</div><h1 className="mt-2 text-3xl font-black uppercase">Contenido del sorteo</h1><input type="password" value={key} onChange={e=>setKey(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void load();}} placeholder="Clave de administración" className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3"/><button disabled={busy} onClick={()=>void load()} className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 font-black text-black">Entrar</button>{error&&<div className="mt-4 text-red-300">{error}</div>}<a href="/admin" className="mt-5 block text-center text-sm font-bold text-slate-400">← Panel principal</a></div></main>;

  return <main className="min-h-screen bg-[#f3efe6] text-[#111]">
    <header className="border-b-4 border-black bg-amber-400"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5"><div><div className="text-xs font-black uppercase tracking-[.2em]">Panel privado</div><h1 className="text-3xl font-black uppercase">Imágenes y pagos</h1></div><a href="/admin" className="rounded-xl bg-black px-4 py-3 font-black text-white">Panel principal</a></div></header>
    <div className="mx-auto max-w-6xl px-5 py-8">
      {message&&<div className="mb-5 rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4 font-bold text-emerald-800">{message}</div>}{error&&<div className="mb-5 rounded-xl border-2 border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}

      <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Carrusel de portada</div><h2 className="mt-2 text-3xl font-black uppercase">Imágenes del sorteo</h2><p className="mt-2 text-sm font-semibold text-slate-600">Sube varias fotos. En la portada se cambiarán automáticamente cada 3 segundos.</p>
        <select value={raffleId} onChange={e=>{setRaffleId(e.target.value);void loadImages(e.target.value);}} className="mt-5 w-full rounded-xl border-2 border-black px-4 py-3 font-black"><option value="">Selecciona sorteo</option>{raffles.map(r=><option key={r.id} value={r.id}>{r.title} · {r.status}</option>)}</select>
        <label className="mt-4 block text-sm font-black">Agregar imágenes<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setFiles(Array.from(e.target.files||[]))} className="mt-2 block w-full rounded-xl border-2 border-black bg-[#faf7ef] p-3 font-normal"/></label>{files.length>0&&<div className="mt-2 text-sm font-bold text-emerald-700">{files.length} archivo(s) listos.</div>}<button disabled={busy||!raffleId||!files.length} onClick={()=>void upload()} className="mt-4 rounded-xl bg-black px-6 py-3 font-black text-white disabled:opacity-40">Subir imágenes</button>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((image,index)=><div key={image.id} className="overflow-hidden rounded-2xl border-2 border-black bg-[#faf7ef]"><img src={image.url} alt={`Imagen ${index+1}`} className="aspect-[16/10] w-full object-cover"/><div className="flex items-center justify-between gap-2 p-3"><span className="text-xs font-black">Imagen {index+1}</span><button onClick={()=>void hideImage(image.id)} className="rounded-lg border-2 border-red-600 px-3 py-2 text-xs font-black text-red-700">Quitar</button></div></div>)}</div>
      </section>

      <section className="mt-8 rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Métodos de pago</div><h2 className="mt-2 text-3xl font-black uppercase">Cuentas, logo e instrucciones</h2><div className="mt-6 space-y-5">{accounts.map((account,index)=><AccountEditor key={account.id||index} account={account} onChange={next=>setAccounts(current=>current.map((a,i)=>i===index?next:a))} onSave={()=>void saveAccount(account)}/>)}</div>
        <div className="mt-7 rounded-2xl border-2 border-black bg-amber-100 p-5"><h3 className="text-xl font-black uppercase">Agregar cuenta</h3><AccountEditor account={newAccount} onChange={setNewAccount} onSave={()=>void saveAccount(newAccount)}/></div>
      </section>
    </div>
  </main>;
}

function AccountEditor({account,onChange,onSave}:{account:Account;onChange:(account:Account)=>void;onSave:()=>void}){
  return <div className="rounded-2xl border-2 border-black bg-[#faf7ef] p-4"><div className="grid gap-3 sm:grid-cols-2"><Input value={account.label} onChange={v=>onChange({...account,label:v})} placeholder="Etiqueta"/><Input value={account.bank_name} onChange={v=>onChange({...account,bank_name:v})} placeholder="Banco"/><Input value={account.beneficiary_name} onChange={v=>onChange({...account,beneficiary_name:v})} placeholder="Beneficiario"/><Input value={account.account_number||""} onChange={v=>onChange({...account,account_number:v})} placeholder="Cuenta / tarjeta"/><Input value={account.clabe||""} onChange={v=>onChange({...account,clabe:v})} placeholder="CLABE"/><Input value={account.logo_url||""} onChange={v=>onChange({...account,logo_url:v})} placeholder="URL del logo del banco"/></div><textarea value={account.instructions||""} onChange={e=>onChange({...account,instructions:e.target.value})} placeholder="Instrucciones de pago (ej. poner nombre en concepto)" className="mt-3 min-h-24 w-full rounded-xl border-2 border-black px-4 py-3"/><div className="mt-3 flex items-center gap-3"><label className="flex items-center gap-2 text-sm font-black"><input type="checkbox" checked={account.active} onChange={e=>onChange({...account,active:e.target.checked})}/> Mostrar en página</label><button onClick={onSave} className="ml-auto rounded-xl bg-black px-5 py-3 font-black text-white">Guardar</button></div></div>;
}
function Input({value,onChange,placeholder}:{value:string;onChange:(value:string)=>void;placeholder:string}){return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border-2 border-black px-4 py-3"/>;}
