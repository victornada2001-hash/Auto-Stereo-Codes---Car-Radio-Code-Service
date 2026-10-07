"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicLoading, RaffleCard, SiteFooter, SiteHeader, normalizeWhatsApp, type Raffle, type SiteSettings } from "../components/site";

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/raffles", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "No se pudieron cargar los sorteos.");
        return data;
      })
      .then(data => {
        setRaffles(data.raffles || []);
        setSettings(data.settings || {});
      })
      .catch(e => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => raffles.filter(r => r.status === "active"), [raffles]);
  const paused = useMemo(() => raffles.filter(r => r.status === "paused"), [raffles]);
  const whatsapp = normalizeWhatsApp(settings.whatsapp_number);

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#111]">
      <SiteHeader whatsapp={whatsapp} />
      <section className="bg-[#08090b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Elige tu oportunidad</div>
          <h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-7xl">Sorteos disponibles</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Entra al sorteo que te interese, revisa el premio, selecciona tus números disponibles y genera tu folio.</p>
        </div>
      </section>

      {loading ? <PublicLoading /> : (
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
          <div className="flex items-end justify-between gap-4">
            <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#9b7900]">Participa ahora</div><h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Activos</h2></div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">{active.length} activo{active.length === 1 ? "" : "s"}</div>
          </div>
          {active.length ? <div className="mt-7 grid gap-7 md:grid-cols-2">{active.map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)}</div> : <div className="mt-7 rounded-[2rem] border border-dashed border-black/20 bg-white p-12 text-center"><div className="text-6xl">🎟️</div><div className="mt-4 text-2xl font-black uppercase">Próximo sorteo en preparación</div><p className="mt-2 text-slate-500">Cuando publiquemos el siguiente sorteo aparecerá aquí.</p></div>}

          {paused.length > 0 && <div className="mt-14"><div className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Consulta disponible</div><h2 className="mt-2 text-3xl font-black uppercase">Sorteos pausados</h2><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{paused.map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)}</div></div>}
        </section>
      )}
      <SiteFooter settings={settings} />
    </main>
  );
}
