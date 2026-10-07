"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicLoading, RaffleCard, SiteFooter, SiteHeader, type Raffle, type SiteSettings, normalizeWhatsApp } from "./components/site";

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
  const completed = useMemo(() => raffles.filter(r => r.status === "completed").slice(0, 3), [raffles]);
  const whatsapp = normalizeWhatsApp(settings.whatsapp_number);

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#111]">
      <SiteHeader whatsapp={whatsapp} />

      <section className="relative overflow-hidden bg-[#08090b] text-white">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(246,201,0,.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,.08),transparent_22%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-[#f6c900]/40 bg-[#f6c900]/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Bienvenido a Sorteos Junior</div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black uppercase leading-[.9] sm:text-7xl lg:text-8xl">
              Arriesga poco.<br/><span className="text-[#f6c900]">Sueña en grande.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Elige tus números, aparta tus boletos y revisa su estado desde una plataforma clara y fácil de usar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/sorteos" className="rounded-xl bg-[#f6c900] px-6 py-4 font-black uppercase text-black shadow-[0_8px_30px_rgba(246,201,0,.25)]">Ver sorteos</a>
              <a href="/verificador" className="rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-black uppercase text-white">Verificar boleto</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-black uppercase tracking-[.14em] text-white/50">
              <span>✓ Boletos digitales</span><span>✓ Historial público</span><span>✓ Atención por WhatsApp</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-full bg-[#f6c900]/15 blur-3xl" />
            <div className="relative rotate-1 rounded-[2rem] border border-white/10 bg-[#15171b] p-4 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#f6c900] p-5 text-black">
                <div className="flex items-center justify-between gap-4 border-b-2 border-black/15 pb-4">
                  <div><div className="text-xs font-black uppercase tracking-[.2em]">Boleto digital</div><div className="mt-1 text-2xl font-black uppercase">Sorteos Junior</div></div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-xl font-black text-[#f6c900]">J</div>
                </div>
                <div className="py-7 text-center">
                  <div className="text-xs font-black uppercase tracking-[.2em]">Número</div>
                  <div className="mt-2 text-7xl font-black tracking-tight">02741</div>
                  <div className="mt-3 inline-flex rounded-full bg-black px-4 py-2 text-xs font-black uppercase text-white">Pagado ✓</div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t-2 border-dashed border-black/25 pt-4 text-xs">
                  <div><div className="font-black uppercase">Folio</div><div className="mt-1 font-mono">SJ-8F2A19</div></div>
                  <div><div className="font-black uppercase">Estado</div><div className="mt-1">Verificable en línea</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-black/10 px-5 md:grid-cols-4 lg:px-8">
          <QuickLink href="/sorteos" icon="🎟️" title="Sorteos" text="Elige tus números" />
          <QuickLink href="/verificador" icon="✓" title="Verificador" text="Consulta tu boleto" />
          <QuickLink href="/resultados" icon="🏆" title="Ganadores" text="Resultados anteriores" />
          <QuickLink href="/como-participar" icon="?" title="Ayuda" text="Cómo participar" />
        </div>
      </section>

      {loading ? <PublicLoading /> : (
        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#9b7900]">Participa ahora</div><h2 className="mt-2 text-4xl font-black uppercase sm:text-5xl">Sorteos activos</h2></div>
            <a href="/sorteos" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black uppercase">Ver todos →</a>
          </div>
          {error && <div className="mt-7 rounded-xl border border-red-300 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
          {active.length ? <div className="mt-8 grid gap-7 md:grid-cols-2">{active.slice(0, 4).map(raffle => <RaffleCard key={raffle.id} raffle={raffle} />)}</div> : <EmptyState />}
        </section>
      )}

      <section className="bg-[#f6c900] text-black">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div><div className="text-xs font-black uppercase tracking-[.2em]">Fácil y rápido</div><h2 className="mt-2 text-4xl font-black uppercase sm:text-5xl">¿Cómo participo?</h2><p className="mt-4 max-w-md font-semibold leading-7">Todo el proceso se hace desde tu teléfono. Eliges números, registras tus datos y recibes un folio para dar seguimiento.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Step n="01" title="Elige un sorteo" text="Entra al sorteo que te interesa y revisa premio, precio y fecha." />
              <Step n="02" title="Selecciona números" text="Escoge números disponibles o deja que la máquina te sugiera algunos." />
              <Step n="03" title="Aparta tus boletos" text="Registra tu nombre y teléfono para generar tu folio." />
              <Step n="04" title="Realiza tu pago" text="Sube tu comprobante y consulta el estado de tus boletos." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-black uppercase tracking-[.2em] text-[#9b7900]">Transparencia</div><h2 className="mt-2 text-4xl font-black uppercase sm:text-5xl">Últimos resultados</h2></div><a href="/resultados" className="font-black uppercase underline decoration-[#f6c900] decoration-4 underline-offset-4">Ver historial completo</a></div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {completed.length ? completed.map(r => <ResultMini key={r.id} raffle={r} />) : <div className="col-span-full rounded-2xl border border-dashed border-black/20 bg-white p-10 text-center font-bold text-slate-500">Los ganadores aparecerán aquí cuando finalicemos los primeros sorteos.</div>}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#9b7900]">Preguntas frecuentes</div><h2 className="mt-2 text-4xl font-black uppercase">Antes de participar</h2></div>
          <div className="mt-8 space-y-3">
            <Faq q="¿Cómo sé si mi boleto quedó registrado?" a="Con tu folio y teléfono puedes consultar el verificador. Ahí verás el estado de la solicitud y los números asociados." />
            <Faq q="¿Puedo elegir mis números?" a="Sí. Cada sorteo permite seleccionar números disponibles y también puede incluir una opción automática para elegir al azar." />
            <Faq q="¿Dónde se publican los ganadores?" a="Los sorteos finalizados permanecen en la sección Ganadores para que puedas consultar el número ganador y la referencia publicada." />
          </div>
          {whatsapp && <div className="mt-8 text-center"><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#25d366] px-6 py-3 font-black text-black">¿Tienes otra duda? Escríbenos</a></div>}
        </div>
      </section>

      <SiteFooter settings={settings} />
    </main>
  );
}

function QuickLink({ href, icon, title, text }: { href: string; icon: string; title: string; text: string }) {
  return <a href={href} className="group px-3 py-6 text-center transition hover:bg-[#f6c900]/10 md:px-6"><div className="text-2xl font-black">{icon}</div><div className="mt-2 text-sm font-black uppercase">{title}</div><div className="mt-1 hidden text-xs text-slate-500 sm:block">{text}</div></a>;
}
function Step({ n, title, text }: { n: string; title: string; text: string }) { return <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]"><div className="text-xs font-black">{n}</div><div className="mt-2 text-xl font-black uppercase">{title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>; }
function Faq({ q, a }: { q: string; a: string }) { return <details className="group rounded-2xl border border-black/10 bg-[#f4f2ec] p-5"><summary className="cursor-pointer list-none font-black uppercase">{q}<span className="float-right text-[#9b7900] group-open:rotate-45">+</span></summary><p className="mt-3 leading-7 text-slate-600">{a}</p></details>; }
function EmptyState() { return <div className="mt-8 rounded-[2rem] border border-dashed border-black/20 bg-white p-12 text-center"><div className="text-6xl">🎟️</div><div className="mt-4 text-2xl font-black uppercase">Próximo sorteo en preparación</div><p className="mt-2 text-slate-500">Cuando publiques un sorteo desde el panel aparecerá aquí automáticamente.</p></div>; }
function ResultMini({ raffle }: { raffle: Raffle }) { return <a href={`/rifa/${raffle.id}`} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1"><div className="aspect-[16/9] bg-[#111]">{raffle.cover_image_url ? <img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-5xl">🏆</div>}</div><div className="p-5"><div className="text-xs font-black uppercase tracking-[.16em] text-[#9b7900]">Finalizado</div><div className="mt-1 text-xl font-black uppercase">{raffle.title}</div><div className="mt-3 text-sm text-slate-600">Ganador: <b>{raffle.winner_ticket ? `#${raffle.winner_ticket}` : "por publicar"}</b></div></div></a>; }
