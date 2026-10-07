"use client";

import { FormEvent, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/site";

type VerifyResult = {
  folio: string;
  status: string;
  amount: number;
  expires_at?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  tickets: number[];
  released_ticket_count?: number;
  raffle?: { id: string; title: string; status: string; draw_date?: string | null; prize?: string | null } | null;
};

const labels: Record<string, string> = {
  reserved: "Apartado",
  receipt_uploaded: "Comprobante recibido",
  paid: "Pagado",
  unpaid: "Pendiente / no pagado",
  manual_review: "En revisión",
  cancelled: "Liberado / cancelado",
};

export default function VerificadorPage() {
  const [folio, setFolio] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No fue posible verificar el boleto.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible verificar el boleto.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#f4f2ec] text-[#111]">
    <SiteHeader />
    <section className="bg-[#08090b] text-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Consulta en línea</div><h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-7xl">Verificador</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Ingresa el folio y el mismo teléfono que utilizaste al apartar tus números.</p></div></section>

    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={verify} className="h-fit rounded-[1.6rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,.08)] sm:p-8">
        <div className="text-xs font-black uppercase tracking-[.18em] text-[#9b7900]">Buscar boleto</div>
        <h2 className="mt-2 text-3xl font-black uppercase">Consulta tu folio</h2>
        <label className="mt-6 block text-sm font-black uppercase">Folio<input value={folio} onChange={e=>setFolio(e.target.value.toUpperCase())} required placeholder="Ej. SJ-8F2A19" className="mt-2 w-full rounded-xl border-2 border-black/15 bg-[#faf9f6] px-4 py-3 text-base font-bold uppercase outline-none focus:border-[#f6c900]" /></label>
        <label className="mt-4 block text-sm font-black uppercase">Teléfono<input value={phone} onChange={e=>setPhone(e.target.value)} required inputMode="tel" placeholder="El teléfono usado al apartar" className="mt-2 w-full rounded-xl border-2 border-black/15 bg-[#faf9f6] px-4 py-3 text-base font-bold outline-none focus:border-[#f6c900]" /></label>
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#f6c900] px-5 py-4 font-black uppercase text-black disabled:opacity-50">{loading ? "Consultando…" : "Verificar boleto"}</button>
        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
        <p className="mt-5 text-xs leading-5 text-slate-500">Por seguridad, se requieren ambos datos. Si cambiaste de número o no recuerdas el folio, contacta a administración.</p>
      </form>

      <div>
        {!result ? <div className="flex min-h-[380px] items-center justify-center rounded-[1.6rem] border border-dashed border-black/20 bg-white p-10 text-center"><div><div className="text-6xl">🎟️</div><div className="mt-4 text-2xl font-black uppercase">Tu boleto aparecerá aquí</div><p className="mt-2 max-w-md text-slate-500">El verificador muestra el estado de tu solicitud y los números que siguen asociados al folio.</p></div></div> : <ResultCard result={result} />}
      </div>
    </section>
    <SiteFooter settings={{}} />
  </main>;
}

function ResultCard({ result }: { result: VerifyResult }) {
  const paid = result.status === "paid";
  return <div className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,.08)]">
    <div className={`${paid ? "bg-[#f6c900] text-black" : "bg-[#111] text-white"} p-6 sm:p-8`}>
      <div className="text-xs font-black uppercase tracking-[.2em] opacity-70">Resultado de verificación</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><div className="text-4xl font-black uppercase">{result.folio}</div><div className="mt-2 text-sm font-bold opacity-70">{result.raffle?.title || "Sorteo"}</div></div><div className={`${paid ? "bg-black text-white" : "bg-[#f6c900] text-black"} rounded-full px-4 py-2 text-xs font-black uppercase`}>{labels[result.status] || result.status}</div></div>
    </div>
    <div className="p-6 sm:p-8">
      <div className="grid gap-3 sm:grid-cols-2"><Info label="Estado" value={labels[result.status] || result.status}/><Info label="Monto registrado" value={`$${Number(result.amount || 0).toFixed(2)}`}/>{result.raffle?.prize && <Info label="Premio" value={result.raffle.prize}/>}<Info label="Boletos activos" value={String(result.tickets.length)}/></div>
      <div className="mt-7"><div className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Números asociados</div>{result.tickets.length ? <div className="mt-3 flex flex-wrap gap-2">{result.tickets.map(number => <span key={number} className="rounded-lg border-2 border-black bg-[#f6c900] px-3 py-2 font-mono text-sm font-black">{number}</span>)}</div> : <div className="mt-3 rounded-xl bg-slate-50 p-4 font-bold text-slate-500">Este folio no tiene números activos actualmente.</div>}</div>
      {result.released_ticket_count ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Este folio tiene {result.released_ticket_count} número(s) que fueron liberados y ya no están activos.</div> : null}
      {result.raffle?.id && <a href={`/rifa/${result.raffle.id}`} className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-black uppercase text-white">Ver sorteo →</a>}
    </div>
  </div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f4f2ec] p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">{label}</div><div className="mt-1 font-black">{value}</div></div>; }
