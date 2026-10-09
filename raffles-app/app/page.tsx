"use client";

import { useEffect, useMemo, useState } from "react";
import { JuniorClassicHeader } from "./components/junior-classic-header";
import { RaffleCard, SiteFooter, type Raffle, type SiteSettings, normalizeWhatsApp } from "./components/site";

const CONTACT_NUMBER = "6648118609";
const PACKAGE_OPTIONS = [1,2,5,10,15,20,50,75,100,200,300,400,500,800,1000,2000,3000];

export default function Home() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

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
  const heroImages = useMemo(() => {
    if (!featured) return [] as string[];
    const images = Array.isArray(featured.image_urls) ? featured.image_urls.filter(Boolean) : [];
    if (!images.length && featured.cover_image_url) images.push(featured.cover_image_url);
    return Array.from(new Set(images));
  }, [featured]);

  useEffect(() => {
    setHeroIndex(0);
    if (heroImages.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex(index => (index + 1) % heroImages.length), 3000);
    return () => window.clearInterval(timer);
  }, [heroImages]);

  const discountFor = (qty:number) => {
    const discounts = Array.isArray(featured?.discounts) ? featured!.discounts! : [];
    return discounts.filter(d => qty >= Number(d.min_qty)).sort((a,b)=>Number(b.min_qty)-Number(a.min_qty))[0]?.percent || 0;
  };
  const totalFor = (qty:number) => qty * Number(featured?.ticket_price || 0) * (1 - discountFor(qty) / 100);

  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <JuniorClassicHeader whatsapp={whatsapp} />

      {featured ? <>
        <section className="border-b-4 border-[#d4af37] bg-[#081b33] px-5 py-7 text-center text-white">
          <div className="text-xs font-black uppercase tracking-[.24em] text-[#f2c94c]">Sorteo activo</div>
          <h1 className="mt-2 text-4xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">{featured.title}</h1>
          {featured.prize&&<div className="mt-3 text-xl font-black uppercase text-white/90 sm:text-2xl">{featured.prize}</div>}
        </section>

        <section className="px-4 py-7 sm:px-5">
          <div className="mx-auto max-w-5xl">
            <div className="relative mx-auto overflow-hidden rounded-2xl border-[3px] border-[#d4af37] bg-[#081b33] shadow-2xl">
              {heroImages.length ? <>
                <div className="relative aspect-[16/9] max-h-[600px] w-full">
                  {heroImages.map((src,index)=><img key={src} src={src} alt={`${featured.title} ${index+1}`} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index===heroIndex?"opacity-100":"opacity-0"}`}/>)}
                </div>
                {heroImages.length>1&&<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">{heroImages.map((_,index)=><button key={index} onClick={()=>setHeroIndex(index)} aria-label={`Imagen ${index+1}`} className={`h-2.5 rounded-full transition-all ${index===heroIndex?"w-8 bg-[#f2c94c]":"w-2.5 bg-white/70"}`}/>)}</div>}
              </>:<div className="grid aspect-[16/9] place-items-center text-8xl">🏆</div>}
            </div>
          </div>
        </section>

        <section className="bg-[#161616] px-5 py-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Precios del sorteo</div>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-sm font-black sm:grid-cols-3 md:text-base">
              {PACKAGE_OPTIONS.filter(q=>q<=featured.total_tickets).map(q=><div key={q}>{q.toLocaleString("es-MX")} boleto{q===1?"":"s"} por <span className="text-[#f2c94c]">${totalFor(q).toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-10 text-center">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#9a7a12]">Con tu boleto participas por</div>
          <h2 className="mt-2 text-3xl font-black uppercase text-[#081b33]">{featured.prize || featured.title}</h2>
          {(featured.prize_description||featured.description)&&<p className="mx-auto mt-6 whitespace-pre-line text-base font-semibold leading-7 text-slate-700">{featured.prize_description||featured.description}</p>}
          {featured.conditions_text&&<div className="mx-auto mt-7 rounded-2xl border border-[#d4af37]/45 bg-[#fffaf0] p-6 text-left"><div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">Condiciones y premios</div><p className="mt-3 whitespace-pre-line font-semibold leading-7 text-slate-700">{featured.conditions_text}</p></div>}

          <div className="mt-7 rounded-2xl border-2 border-[#e5483f] bg-red-50 p-6 font-black uppercase leading-7 text-[#a61b1b]">
            Atención: los comprobantes deben subirse directamente a esta página antes del sorteo. Los comprobantes enviados únicamente por WhatsApp no serán válidos.
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            <a href={`/rifa/${featured.id}`} className="rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-6 py-4 text-base font-black uppercase tracking-[.1em] text-white shadow-lg">Boletos disponibles</a>
            <a href="/subir-pago" className="rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-6 py-4 text-base font-black uppercase tracking-[.1em] text-white shadow-lg">Sube tu pago</a>
          </div>
        </section>

        <section className="border-y-4 border-[#d4af37] bg-[#081b33] px-5 py-8 text-center text-white">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Números de la suerte</div>
          <h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Elige tus boletos</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-white/75">Abre el sorteo para ver la lista de números, seleccionar tus favoritos o usar la Máquina de la Suerte.</p>
          <a href={`/rifa/${featured.id}`} className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-8 py-4 font-black uppercase text-white shadow-lg">Ir a la lista de boletos ↓</a>
        </section>
      </> : <section className="bg-[#081b33] px-5 py-24 text-center text-white"><div className="text-6xl">🎟️</div><h1 className="mt-5 text-4xl font-black uppercase">Sorteos Junior</h1><p className="mt-3 text-white/70">Próximo sorteo por anunciar.</p></section>}

      {error&&<div className="mx-auto my-8 max-w-4xl rounded-xl border border-red-300 bg-red-50 p-4 text-center font-bold text-red-700">{error}</div>}

      <section className="border-t border-[#d4af37]/25 bg-[#f6f8fb] px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">Consulta</div><h2 className="mt-1 text-3xl font-black uppercase text-[#081b33] md:text-4xl">Sorteos activos</h2></div>
            <a href="/sorteos" className="font-black uppercase text-[#081b33] underline decoration-[#d4af37] decoration-4 underline-offset-4">Ver todos →</a>
          </div>
          {!loading&&active.length>0&&<div className="mt-7 grid gap-6 md:grid-cols-2">{active.slice(0,4).map(raffle=><RaffleCard key={raffle.id} raffle={raffle}/>)}</div>}
          {!loading&&active.length===0&&<div className="mt-7 rounded-xl border-2 border-dashed border-[#081b33]/20 bg-white p-10 text-center font-bold text-slate-500">No hay sorteos activos en este momento.</div>}
        </div>
      </section>

      <SiteFooter settings={{...settings,whatsapp_number:whatsapp}}/>
    </main>
  );
}
