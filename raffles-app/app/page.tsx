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
  const raffleLink = featured ? `/rifa/${featured.id}` : "/sorteos";
  const paymentLink = featured ? `/rifa/${featured.id}#pago` : "/sorteos";

  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <JuniorClassicHeader whatsapp={whatsapp} />

      <section
        className="relative min-h-[490px] overflow-hidden bg-[#d8d8d8] md:min-h-[560px]"
        style={heroImage ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        } : undefined}
      >
        {!heroImage && <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9d9d9,#f7f7f7_45%,#c9c9c9)]" />}
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative mx-auto flex min-h-[490px] max-w-[1366px] flex-col items-center justify-start px-5 pt-16 md:min-h-[560px] md:pt-16">
          <div className="w-full max-w-[520px] space-y-4">
            <a href={raffleLink} className="block rounded-xl border-[3px] border-white bg-[#d43e37] px-5 py-3 text-center text-xl font-black uppercase tracking-[.14em] text-white shadow-lg transition hover:brightness-105 md:text-2xl">
              Boletos disponibles
            </a>
            <a href={paymentLink} className="block rounded-xl border-[3px] border-[#d43e37] bg-white/95 px-5 py-3 text-center text-xl font-black uppercase tracking-[.14em] text-[#d43e37] shadow-lg transition hover:bg-white md:text-2xl">
              Sube tu pago
            </a>
          </div>
          {featured && <div className="mt-auto mb-6 rounded-full bg-black/65 px-5 py-2 text-center text-sm font-black uppercase tracking-[.12em] text-white backdrop-blur">{featured.title}</div>}
        </div>
      </section>

      <SectionTitle>Preguntas frecuentes</SectionTitle>
      <section className="mx-auto max-w-3xl px-5 py-12 text-[15px] leading-7 md:py-14">
        <FaqBlock
          q="¿Cómo se elige a los ganadores?"
          a="Cada sorteo indica previamente el resultado público que se utilizará como referencia. El boleto que coincida con el número ganador publicado será identificado como ganador, de acuerdo con las bases y fecha anunciadas para ese sorteo."
        />
        <FaqBlock
          q="¿Qué sucede si el número ganador corresponde a un boleto no vendido?"
          a="Si las bases del sorteo contemplan una nueva selección, se publicará la fecha o referencia que se utilizará para determinar al ganador. La actualización quedará visible en Sorteos Junior."
        />
        <FaqBlock
          q="¿Dónde se publican los ganadores?"
          a="Los resultados quedan disponibles en la sección de Ganadores de Sorteos Junior. Cuando existan redes sociales oficiales configuradas, también podrán utilizarse para comunicar resultados y avisos."
        />
        <FaqBlock
          q="¿Tengo que subir mi comprobante de pago?"
          a="Sí. Después de apartar tus boletos debes subir el comprobante desde el sitio para que tu solicitud pueda revisarse y actualizarse."
        />
        <div className="mt-9 text-center">
          <a href="/preguntas-frecuentes" className="inline-block border-b-2 border-[#0875b9] font-black uppercase text-[#0875b9]">Ver todas las preguntas frecuentes</a>
        </div>
      </section>

      <section
        className="relative min-h-[300px] bg-[#222] bg-cover bg-center bg-fixed text-white"
        style={heroImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.58)), url(${heroImage})` } : undefined}
      >
        <SectionTitle>Acerca de Sorteos Junior</SectionTitle>
        <div className="mx-auto flex max-w-4xl items-center justify-center px-5 py-16 text-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[.22em] md:text-base">Sorteos administrados en línea</p>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/90 md:text-base">En esta página puedes consultar sorteos disponibles, seleccionar boletos, generar un folio, subir tu comprobante y revisar resultados publicados.</p>
          </div>
        </div>
      </section>

      <SectionTitle>Contáctanos</SectionTitle>
      <section className="px-5 py-12 text-center md:py-14">
        <div className="text-lg font-black uppercase tracking-[.12em]">WhatsApp: 664 811 8609</div>
        <div className="mt-6 flex justify-center gap-4">
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="grid h-14 w-14 place-items-center rounded-full border-2 border-black text-2xl font-black transition hover:bg-[#25d366]" aria-label="WhatsApp">W</a>
          {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="grid h-14 w-14 place-items-center rounded-full border-2 border-black text-2xl font-black" aria-label="Facebook">f</a>}
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#f3f3f3] px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#0875b9]">Disponibles</div><h2 className="mt-1 text-3xl font-black uppercase md:text-4xl">Sorteos activos</h2></div>
            <a href="/sorteos" className="font-black uppercase text-[#0875b9]">Ver todos →</a>
          </div>
          {error && <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
          {!loading && active.length > 0 && <div className="mt-7 grid gap-6 md:grid-cols-2">{active.slice(0, 4).map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)}</div>}
          {!loading && active.length === 0 && <div className="mt-7 rounded-xl border-2 border-dashed border-black/20 bg-white p-10 text-center font-bold text-slate-500">No hay sorteos activos en este momento.</div>}
        </div>
      </section>

      <SiteFooter settings={{ ...settings, whatsapp_number: whatsapp }} />
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#0875b9] px-5 py-3 text-center text-3xl font-black uppercase tracking-[.12em] text-white [text-shadow:2px_2px_0_rgba(0,0,0,.8)] md:text-4xl">{children}</div>;
}

function FaqBlock({ q, a }: { q: string; a: string }) {
  return <div className="mb-9"><h3 className="text-center text-xl font-black uppercase tracking-[.14em] text-[#0875b9] md:text-2xl">{q}</h3><p className="mt-3 text-[#222]">{a}</p></div>;
}
