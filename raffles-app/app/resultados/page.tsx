"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicLoading, SiteFooter, SiteHeader, formatDate, normalizeWhatsApp, type Raffle, type SiteSettings } from "../components/site";

export default function ResultadosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/raffles", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "No se pudieron cargar los resultados.");
        return data;
      })
      .then(data => { setRaffles(data.raffles || []); setSettings(data.settings || {}); })
      .catch(e => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const completed = useMemo(() => raffles.filter(r => r.status === "completed"), [raffles]);
  const whatsapp = normalizeWhatsApp(settings.whatsapp_number);

  return <main className="min-h-screen bg-[#f4f2ec] text-[#111]">
    <SiteHeader whatsapp={whatsapp} />
    <section className="bg-[#08090b] text-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Historial público</div><h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-7xl">Ganadores</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Aquí conservamos los sorteos finalizados y la información pública del resultado.</p></div></section>
    {loading ? <PublicLoading /> : <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
      {completed.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{completed.map(raffle => <article key={raffle.id} className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,.08)]"><div className="relative aspect-[16/10] bg-[#111]">{raffle.cover_image_url ? <img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-7xl">🏆</div>}<div className="absolute left-4 top-4 rounded-full bg-[#f6c900] px-4 py-2 text-xs font-black uppercase">Finalizado</div></div><div className="p-6"><div className="text-xs font-black uppercase tracking-[.16em] text-[#9b7900]">{formatDate(raffle.draw_date)}</div><h2 className="mt-2 text-2xl font-black uppercase">{raffle.title}</h2><div className="mt-5 rounded-2xl bg-[#f4f2ec] p-4"><div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">Número ganador</div><div className="mt-1 text-4xl font-black">{raffle.winner_ticket ? `#${raffle.winner_ticket}` : "Pendiente"}</div>{raffle.winner_name && <div className="mt-3 text-sm"><b>Ganador:</b> {raffle.winner_name}</div>}{raffle.winner_draw_reference && <div className="mt-1 text-sm text-slate-600"><b>Referencia:</b> {raffle.winner_draw_reference}</div>}</div><a href={`/rifa/${raffle.id}`} className="mt-5 flex justify-center rounded-xl bg-black px-5 py-4 text-sm font-black uppercase text-white">Ver registro completo →</a></div></article>)}</div> : <div className="rounded-[2rem] border border-dashed border-black/20 bg-white p-12 text-center"><div className="text-6xl">🏆</div><div className="mt-4 text-2xl font-black uppercase">Aún no hay sorteos finalizados</div><p className="mt-2 text-slate-500">Cuando finalicemos un sorteo, su resultado permanecerá publicado aquí.</p></div>}
    </section>}
    <SiteFooter settings={settings} />
  </main>;
}
