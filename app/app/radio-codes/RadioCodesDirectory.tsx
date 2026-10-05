"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { radioGuides } from "../radioGuideData";

export default function RadioCodesDirectory() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return radioGuides;
    return radioGuides.filter((guide) =>
      [guide.name, ...guide.models, ...guide.families, ...guide.serialExamples]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="bg-[#071a36] px-5 py-2 text-center text-xs font-bold text-blue-100 md:text-sm">
        AUTO STEREO CODES · Guías para encontrar la serie correcta antes de comprar
      </div>

      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="font-black tracking-tight text-slate-950">
            <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">ASC</span>
            AUTO STEREO CODES
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <Link href="/">Inicio</Link>
            <Link href="/radio-codes" className="text-blue-700">Todas las marcas</Link>
            <Link href="/#serial-matcher">Identificar serie</Link>
            <Link href="/#request-form">Solicitar código</Link>
          </nav>
          <Link href="/#request-form" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-500">
            Solicitar código
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b2347] px-6 py-16 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)",backgroundSize:"120px 120px"}} />
        <div className="relative mx-auto max-w-5xl">
          <div className="text-sm text-blue-200"><Link href="/" className="hover:text-white">Inicio</Link> <span className="mx-2">›</span> Todos los códigos de estéreo</div>
          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">Todas las marcas y familias de radio</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100/80">
            36 guías de vehículos y fabricantes de estéreo. Elige tu marca para ver los métodos disponibles, los formatos de serie y qué dato debes copiar exactamente.
          </p>
          <div className="relative mt-9 max-w-4xl">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-400">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar Honda, Ford, Jeep, VWZ, Becker, Clarion…"
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-14 pr-5 text-base text-white outline-none placeholder:text-blue-100/45 focus:border-blue-300 focus:bg-white/15"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Guías de serie</p>
            <h2 className="mt-2 text-3xl font-black">Selecciona tu vehículo o fabricante de radio</h2>
          </div>
          <div className="text-sm font-semibold text-slate-500">{filtered.length} resultados</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((guide) => (
            <Link
              key={guide.slug}
              href={`/radio-codes/${guide.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 min-w-14 items-center justify-center rounded-2xl bg-slate-100 px-3 text-center text-sm font-black tracking-tight text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-700">
                  {guide.monogram}
                </div>
                <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">→</span>
              </div>
              <h3 className="mt-5 text-xl font-black">{guide.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{guide.models.slice(0,4).join(" · ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.families.slice(0,2).map((family) => <span key={family} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{family}</span>)}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm font-bold text-blue-700">Cómo encontrar la serie →</div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-3xl">⌕</div>
            <h3 className="mt-3 text-xl font-black">No encontramos esa marca</h3>
            <p className="mt-2 text-slate-500">Prueba con el fabricante del radio, un modelo o un prefijo de serie.</p>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            ["01","Elige la marca","Abre una pantalla independiente con los tipos de radio y métodos disponibles."],
            ["02","Identifica tu tipo de estéreo","Compara pantalla, fabricante, prefijo y ejemplo de serie antes de desmontar nada."],
            ["03","Copia la serie exacta","Después vuelve al formulario y envía el identificador completo para procesar tu código."],
          ].map(([n,title,text]) => <div key={n} className="rounded-2xl bg-slate-50 p-6"><div className="text-sm font-black text-blue-600">{n}</div><div className="mt-2 text-lg font-black">{title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}
        </div>
      </section>
    </main>
  );
}
