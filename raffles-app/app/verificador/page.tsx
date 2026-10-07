"use client";

import { FormEvent, useState } from "react";
import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

type VerifyRow = {
  folio?: string | null;
  status: string;
  ticket_number?: number | null;
  ticket_count?: number;
  created_at?: string | null;
};
type VerifyResult = {
  mode: "ticket" | "phone";
  raffle?: { id:string; title:string; prize?:string|null } | null;
  results: VerifyRow[];
};

const labels: Record<string, string> = {
  available: "Disponible",
  reserved: "Apartado",
  receipt_uploaded: "Pago en revisión",
  paid: "Pagado",
  unpaid: "No pagado",
  manual_review: "En revisión",
  ai_reviewed: "En revisión",
  cancelled: "Cancelado",
};

function statusClass(status:string) {
  if(status==="paid") return "bg-emerald-100 text-emerald-800";
  if(status==="available") return "bg-sky-100 text-sky-800";
  if(status==="receipt_uploaded"||status==="manual_review"||status==="ai_reviewed") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export default function VerificadorPage() {
  const [mode,setMode]=useState<"ticket"|"phone">("ticket");
  const [value,setValue]=useState("");
  const [result,setResult]=useState<VerifyResult|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function verify(event:FormEvent) {
    event.preventDefault();
    setLoading(true);setError("");setResult(null);
    try{
      const response=await fetch("/api/verificar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,value})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No fue posible verificar.");
      setResult(data);
    }catch(e){setError(e instanceof Error?e.message:"No fue posible verificar.");}
    finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
    <JuniorClassicHeader whatsapp="6648118609"/>
    <section className="bg-[#081b33] px-5 py-12 text-center text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Consulta en línea</div><h1 className="mt-3 text-5xl font-black uppercase">Verificador de boletos</h1><p className="mx-auto mt-4 max-w-2xl text-white/70">Consulta el estatus usando un número de boleto o el WhatsApp utilizado al apartar.</p></section>

    <section className="mx-auto grid max-w-5xl gap-7 px-5 py-10 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={verify} className="h-fit rounded-2xl bg-white p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#eef3f8] p-1"><button type="button" onClick={()=>{setMode("ticket");setValue("");setResult(null);setError("");}} className={`rounded-lg px-3 py-3 text-xs font-black uppercase ${mode==="ticket"?"bg-[#081b33] text-white":"text-[#081b33]"}`}>Número de boleto</button><button type="button" onClick={()=>{setMode("phone");setValue("");setResult(null);setError("");}} className={`rounded-lg px-3 py-3 text-xs font-black uppercase ${mode==="phone"?"bg-[#081b33] text-white":"text-[#081b33]"}`}>WhatsApp</button></div>
        <label className="mt-5 block text-sm font-black uppercase text-[#081b33]">{mode==="ticket"?"Número de boleto":"WhatsApp de 10 dígitos"}<input value={value} onChange={e=>setValue(e.target.value.replace(/\D/g,""))} required inputMode="numeric" placeholder={mode==="ticket"?"Ej. 12345":"Ej. 6648118609"} className="mt-2 w-full rounded-xl border-2 border-[#081b33]/20 px-4 py-4 text-lg font-black outline-none focus:border-[#d4af37]"/></label>
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-4 font-black uppercase text-white disabled:opacity-50">{loading?"Consultando…":"Verificar estatus"}</button>
        {error&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      </form>

      {!result?<div className="grid min-h-[330px] place-items-center rounded-2xl border-2 border-dashed border-[#081b33]/20 bg-white p-8 text-center"><div><div className="text-6xl">🎟️</div><h2 className="mt-4 text-2xl font-black uppercase text-[#081b33]">Consulta tu estatus</h2><p className="mt-2 text-slate-500">El resultado aparecerá aquí.</p></div></div>:<div className="rounded-2xl bg-white p-6 shadow-lg"><div className="text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">{result.raffle?.title||"Sorteo activo"}</div><h2 className="mt-2 text-3xl font-black uppercase text-[#081b33]">Resultado</h2><div className="mt-5 space-y-3">{result.results.map((row,index)=><div key={`${row.folio||row.ticket_number||index}-${index}`} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div>{row.ticket_number?<div className="font-mono text-xl font-black text-[#081b33]">Boleto {row.ticket_number}</div>:<div className="font-black text-[#081b33]">{row.ticket_count||0} boleto(s)</div>}{row.folio&&<div className="mt-1 text-xs font-bold text-slate-500">Folio {row.folio}</div>}</div><span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${statusClass(row.status)}`}>{labels[row.status]||row.status}</span></div></div>)}</div></div>}
    </section>
    <SiteFooter settings={{whatsapp_number:"6648118609"}}/>
  </main>;
}
