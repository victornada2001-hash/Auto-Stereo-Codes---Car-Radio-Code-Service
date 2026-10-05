"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { radioGuides } from "../radioGuideData";

const iconSlugs: Record<string,string> = {
  acura:"acura", "alfa-romeo":"alfaromeo", alpine:"alpine", audi:"audi", bmw:"bmw", bosch:"bosch", chrysler:"chrysler",
  citroen:"citroen", dacia:"dacia", dodge:"dodge", fiat:"fiat", ford:"ford", honda:"honda", iveco:"iveco", jaguar:"jaguar",
  jeep:"jeep", lancia:"lancia", "land-rover":"landrover", mercedes:"mercedesbenz", nissan:"nissan", peugeot:"peugeot",
  porsche:"porsche", renault:"renault", seat:"seat", skoda:"skoda", sony:"sony", suzuki:"suzuki", toyota:"toyota",
  vauxhall:"vauxhall", volkswagen:"volkswagen"
};

export default function RadioCodesDirectory() {
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return radioGuides;
    return radioGuides.filter(guide=>[guide.name,...guide.models,...guide.families,...guide.serialExamples].join(" ").toLowerCase().includes(q));
  },[query]);

  return <main className="min-h-screen bg-[#fff9f2] text-slate-950">
    <header className="border-b border-orange-100 bg-white px-5 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3 font-black"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs text-white">ASC</span>AUTO STEREO CODES</Link><nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex"><Link href="/">Inicio</Link><Link href="/radio-codes" className="text-orange-600">Todas las marcas</Link><Link href="/request">Solicitar código</Link></nav><Link href="/request" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600">Solicitar código</Link></div></header>

    <section className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-br from-white via-orange-50 to-[#fff0de] px-6 py-16 md:py-20"><div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"/><div className="relative mx-auto max-w-5xl"><div className="text-sm font-semibold text-slate-500"><Link href="/">Inicio</Link><span className="mx-2">›</span>Todas las marcas</div><p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-orange-500">DIRECTORIO DE GUÍAS</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Todas las marcas y familias de radio</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Busca tu marca, modelo, fabricante de radio o prefijo de serie. Cada resultado abre una pantalla independiente con instrucciones específicas.</p><div className="relative mt-9 max-w-4xl"><span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-orange-400">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar Honda, Ford, Jeep, VWZ, Becker, Clarion…" className="w-full rounded-2xl border border-orange-100 bg-white py-4 pl-14 pr-5 text-base shadow-lg shadow-orange-100/50 outline-none placeholder:text-slate-400 focus:border-orange-400"/></div></div></section>

    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">Guías de serie</p><h2 className="mt-2 text-3xl font-black">Selecciona tu vehículo o fabricante de radio</h2></div><div className="text-sm font-semibold text-slate-500">{filtered.length} resultados</div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(guide=>{const icon=iconSlugs[guide.slug];return <Link key={guide.slug} href={`/radio-codes/${guide.slug}`} className="group rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"><div className="flex items-start justify-between gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 p-3">{icon?<img src={`https://cdn.simpleicons.org/${icon}/111827`} alt={guide.name} className="h-10 w-10 object-contain"/>:<span className="text-sm font-black">{guide.monogram}</span>}</div><span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-600">→</span></div><h3 className="mt-5 text-xl font-black">{guide.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{guide.models.slice(0,4).join(" · ")}</p><div className="mt-4 flex flex-wrap gap-2">{guide.families.slice(0,2).map(f=><span key={f} className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">{f}</span>)}</div><div className="mt-5 border-t border-orange-100 pt-4 text-sm font-black text-orange-600">Cómo encontrar la serie →</div></Link>})}</div>
      {filtered.length===0&&<div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center"><div className="text-3xl">⌕</div><h3 className="mt-3 text-xl font-black">No encontramos esa marca</h3><p className="mt-2 text-slate-500">Prueba con el fabricante del radio, un modelo o un prefijo de serie.</p></div>}
    </section>
  </main>;
}
