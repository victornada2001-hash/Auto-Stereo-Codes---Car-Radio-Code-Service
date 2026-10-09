"use client";

import { useEffect, useMemo, useState } from "react";
import { JuniorClassicHeader } from "./components/junior-classic-header";
import { RaffleCard, SiteFooter, type Raffle, type SiteSettings, normalizeWhatsApp } from "./components/site";

const CONTACT_NUMBER = "6648118609";

export default function Home() {
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
  const featured = active[0] || null;
  const whatsapp = normalizeWhatsApp(settings.whatsapp_number) || CONTACT_NUMBER;
  const heroImage = featured?.cover_image_url || "";

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <JuniorClassicHeader whatsapp={whatsapp} />

      <section
        className="relative min-h-[560px] overflow-hidden bg-[#081b33] text-white md:min-h-[650px]"
        style={heroImage ? {
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        } : undefined}
      >
        {!heroImage && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,#173f6c,#081b33_58%,#020913)]" />}
        <div className="absolute inset-0 bg-[#06172d]/72" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#06172d]/45" />
        <div className="absolute inset-x-0 top-0 h-px bg-[#d4af37]/50" />

        <div className="relative mx-auto flex min-h-[560px] max-w-[1400px] items-center justify-center px-5 py-14 text-center md:min-h-[650px] lg:px-8">
          <div className="w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/55 bg-[#081b33]/75 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#f2c94c] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#f2c94c]" /> {featured ? "Sorteo activo" : "Próximo sorteo"}
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase leading-[.95] sm:text-6xl lg:text-7xl">
              {featured?.title || "Sorteos Junior"}
            </h1>
            {featured?.prize && <div className="mt-4 text-xl font-black uppercase tracking-wide text-[#f2c94c] sm:text-2xl">{featured.prize}</div>}

            <div className="mx-auto mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
              <a href="/comprar" className="rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-6 py-4 text-center text-base font-black uppercase tracking-[.12em] text-white shadow-[0_12px_34px_rgba(229,72,63,.28)] transition hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(229,72,63,.38)]">
                Boletos disponibles
              </a>
              <a href="/subir-pago" className="rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-6 py-4 text-center text-base font-black uppercase tracking-[.12em] text-white shadow-[0_12px_34px_rgba(229,72,63,.28)] transition hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(229,72,63,.38)]">
                Sube tu pago
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d4af37]/30 bg-[#081b33] text-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-5 text-center text-xs font-black uppercase tracking-[.18em] text-white/80 sm:grid-cols-3">
          <div>Compra directa al sorteo activo</div>
          <div className="text-[#f2c94c]">Sube tu comprobante en línea</div>
          <div>Consulta resultados publicados</div>
        </div>
      </section>

      <SectionTitle eyebrow="Información">Preguntas frecuentes</SectionTitle>
      <section className="mx-auto max-w-4xl px-5 py-14 text-[15px] leading-7 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <FaqBlock q="¿Cómo se elige a los ganadores?" a="Cada sorteo informa previamente qué resultado público se utilizará como referencia. El boleto que coincida con el número ganador publicado será identificado conforme a las bases y la fecha anunciadas para ese sorteo." />
          <FaqBlock q="¿Qué pasa si el número ganador no fue vendido?" a="Si las bases contemplan una nueva selección, se publicará la nueva fecha o referencia utilizada para determinar al ganador." />
          <FaqBlock q="¿Dónde se publican los ganadores?" a="Los resultados quedan disponibles en la sección de Ganadores de Sorteos Junior y permanecen visibles como historial." />
          <FaqBlock q="¿Tengo que subir mi comprobante?" a="Sí. Después de apartar tus boletos debes subir el comprobante desde el sitio para que la solicitud pueda revisarse y actualizarse." />
        </div>
        <div className="mt-8 text-center">
          <a href="/preguntas-frecuentes" className="inline-flex rounded-lg border border-[#d4af37] bg-[#081b33] px-6 py-3 font-black uppercase tracking-wide text-white transition hover:bg-[#0d2747]">Ver todas las preguntas</a>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#081b33] text-white"
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="absolute inset-0 bg-[#081b33]/88" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[.22em] text-[#f2c94c]">Sorteos Junior</div>
            <h2 className="mt-2 text-4xl font-black uppercase md:text-5xl">Compra y paga sin vueltas</h2>
          </div>
          <p className="text-base leading-8 text-white/78">Boletos disponibles abre directamente el único sorteo activo para elegir números. Si ya hiciste un apartado, Sube tu pago te lleva a tu reserva usando folio y teléfono.</p>
        </div>
      </section>

      <SectionTitle eyebrow="Atención">Contáctanos</SectionTitle>
      <section className="px-5 py-14 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#d4af37]/35 bg-[#f8fafc] p-8 shadow-sm">
          <div className="text-sm font-black uppercase tracking-[.18em] text-[#8a6f14]">WhatsApp oficial</div>
          <div className="mt-2 text-3xl font-black text-[#081b33]">664 811 8609</div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Para dudas sobre boletos, folios, comprobantes o sorteos publicados.</p>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl border-2 border-[#081b33] bg-white px-6 py-3 font-black uppercase text-[#081b33] transition hover:bg-[#081b33] hover:text-white">Abrir WhatsApp</a>
        </div>
      </section>

      <section className="border-t border-[#d4af37]/25 bg-[#f6f8fb] px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">Consulta</div><h2 className="mt-1 text-3xl font-black uppercase text-[#081b33] md:text-4xl">Sorteos activos</h2></div>
            <a href="/sorteos" className="font-black uppercase text-[#081b33] underline decoration-[#d4af37] decoration-4 underline-offset-4">Ver sección →</a>
          </div>
          {error && <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
          {!loading && active.length > 0 && <div className="mt-7 grid gap-6 md:grid-cols-2">{active.slice(0, 4).map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)}</div>}
          {!loading && active.length === 0 && <div className="mt-7 rounded-xl border-2 border-dashed border-[#081b33]/20 bg-white p-10 text-center font-bold text-slate-500">No hay sorteos activos en este momento.</div>}
        </div>
      </section>

      <SiteFooter settings={{ ...settings, whatsapp_number: whatsapp }} />
    </main>
  );
}

function SectionTitle({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return <div className="border-y border-[#d4af37]/25 bg-white px-5 py-8 text-center"><div className="text-xs font-black uppercase tracking-[.22em] text-[#9a7a12]">{eyebrow}</div><div className="mt-2 text-3xl font-black uppercase tracking-[.08em] text-[#081b33] md:text-4xl">{children}</div><div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#d4af37]" /></div>;
}

function FaqBlock({ q, a }: { q: string; a: string }) {
  return <article className="rounded-2xl border border-[#081b33]/10 bg-white p-6 shadow-[0_12px_30px_rgba(8,27,51,.06)]"><h3 className="text-lg font-black uppercase tracking-[.08em] text-[#081b33]">{q}</h3><div className="mt-3 h-1 w-12 rounded-full bg-[#d4af37]" /><p className="mt-4 text-slate-600">{a}</p></article>;
}
