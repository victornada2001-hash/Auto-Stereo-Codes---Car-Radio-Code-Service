"use client";

import { FormEvent, useEffect, useState } from "react";
import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

type VerifyRow = {
  status: string;
  ticket_number?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  customer_state?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
};
type VerifyResult = {
  mode: "ticket" | "phone";
  raffle?: { id:string; title:string; prize?:string|null; cover_image_url?:string|null } | null;
  results: VerifyRow[];
  counters?: { confirmed:number; review:number; unpaid:number };
};
type ActiveRaffle = { id:string; title:string; prize?:string|null; cover_image_url?:string|null };

const labels: Record<string, string> = {
  available: "Disponible",
  reserved: "No pagado",
  receipt_uploaded: "En revisión",
  paid: "Pagado",
  unpaid: "No pagado",
  manual_review: "En revisión",
  ai_reviewed: "En revisión",
  cancelled: "Cancelado",
};

function statusClass(status:string) {
  if(status==="paid") return "bg-emerald-600 text-white";
  if(status==="available") return "bg-sky-100 text-sky-800";
  if(status==="receipt_uploaded"||status==="manual_review"||status==="ai_reviewed") return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}
function dateTime(value?:string|null) {
  if(!value) return "Sin pago";
  return new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}

export default function VerificadorPage() {
  const [value,setValue]=useState("");
  const [result,setResult]=useState<VerifyResult|null>(null);
  const [active,setActive]=useState<ActiveRaffle|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    fetch("/api/raffles",{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>setActive((data?.raffles||[]).find((raffle: {status?:string})=>raffle.status==="active")||null))
      .catch(()=>setActive(null));
  },[]);

  async function verify(event:FormEvent) {
    event.preventDefault();
    const clean=value.replace(/\D/g,"");
    if(!clean){setError("Escribe tu boleto o celular.");return;}
    const mode=clean.length===10?"phone":"ticket";
    setLoading(true);setError("");setResult(null);
    try{
      const response=await fetch("/api/verificar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,value:clean})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No fue posible verificar.");
      setResult(data);
    }catch(e){setError(e instanceof Error?e.message:"No fue posible verificar.");}
    finally{setLoading(false);}
  }

  const raffle=result?.raffle||active;
  const counters=result?.counters||{confirmed:0,review:0,unpaid:0};

  return <main className="min-h-screen bg-white text-[#111827]">
    <JuniorClassicHeader whatsapp="6648118609"/>

    {raffle?.cover_image_url&&<section className="bg-black"><div className="mx-auto max-w-6xl"><img src={raffle.cover_image_url} alt={raffle.title||"Sorteo activo"} className="mx-auto max-h-[360px] w-full object-cover"/></div></section>}

    <section className="border-y-4 border-[#d4af37] bg-[#081b33] px-5 py-5 text-center text-white">
      <h1 className="text-3xl font-black uppercase md:text-4xl">Verificador de boletos</h1>
      <div className="mt-1 text-lg font-black text-[#f2c94c]">{raffle?.title||"Sorteo activo"}</div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="text-center">
        <h2 className="text-2xl font-black text-[#081b33]">Introduce tu BOLETO ó CELULAR y haz clic en “Verificar”</h2>
        <div className="mt-3 text-xl font-black text-[#e5483f]">Para subir tu pago buscar POR NÚMERO CELULAR</div>
      </div>

      <form onSubmit={verify} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input value={value} onChange={e=>setValue(e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="Escribe Boleto ó Celular" className="min-w-0 flex-1 rounded-lg border-2 border-[#081b33] px-4 py-3 font-black outline-none focus:border-[#d4af37]"/>
        <button disabled={loading} className="rounded-lg bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-8 py-3 font-black uppercase text-white disabled:opacity-50">{loading?"Verificando…":"Verificar"}</button>
      </form>

      {error&&<div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700">{error}</div>}

      <div className="mx-auto mt-7 max-w-sm text-center text-sm font-black text-[#081b33]">
        <div>Boletos confirmados: <span className="text-emerald-600">{counters.confirmed}</span></div>
        <div>En revisión: <span className="text-amber-600">{counters.review}</span></div>
        <div>No pagados: <span className="text-red-600">{counters.unpaid}</span></div>
      </div>

      {result&&result.mode==="phone"&&<div className="mt-6 text-center"><a href="/subir-pago" className="inline-flex rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff5b00] px-7 py-4 font-black uppercase text-white shadow-lg">Subir comprobante de pago</a></div>}

      {result&&<div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 shadow-lg"><table className="w-full min-w-[900px] border-collapse bg-white text-sm"><thead className="bg-black text-white"><tr><th className="px-3 py-3 text-left">Número</th><th className="px-3 py-3 text-left">Nombre</th><th className="px-3 py-3 text-left">Apellido</th><th className="px-3 py-3 text-left">Estado</th><th className="px-3 py-3 text-left">Fecha envío</th><th className="px-3 py-3 text-left">Fecha apartado</th><th className="px-3 py-3 text-left">Estatus</th></tr></thead><tbody>{result.results.map((row,index)=><tr key={`${row.ticket_number||index}-${index}`} className={row.status==="paid"?"bg-emerald-50":"border-t border-slate-200"}><td className="px-3 py-3 font-mono font-black">{row.ticket_number??"—"}</td><td className="px-3 py-3 font-bold">{row.first_name||"—"}</td><td className="px-3 py-3 font-bold">{row.last_name||"—"}</td><td className="px-3 py-3 font-bold">{row.customer_state||"—"}</td><td className="px-3 py-3">{dateTime(row.sent_at)}</td><td className="px-3 py-3">{dateTime(row.created_at)}</td><td className="px-3 py-3"><span className={`inline-flex rounded-lg px-3 py-2 text-xs font-black uppercase ${statusClass(row.status)}`}>{labels[row.status]||row.status}</span></td></tr>)}</tbody></table></div>}
    </section>

    <SiteFooter settings={{whatsapp_number:"6648118609"}}/>
  </main>;
}
