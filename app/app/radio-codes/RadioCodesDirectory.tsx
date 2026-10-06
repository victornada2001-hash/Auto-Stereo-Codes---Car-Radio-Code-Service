"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BrandMark from "../BrandMark";
import { HOME_CAR_PHOTO, brandPhotoForSlug } from "../brandVisuals";
import { radioGuides } from "../radioGuideData";

const launchExcludedSlugs = new Set(["mercedes","chrysler","dodge","jeep","nissan"]);
const launchGuides = radioGuides.filter((guide)=>!launchExcludedSlugs.has(guide.slug));

export default function RadioCodesDirectory() {
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return launchGuides;
    return launchGuides.filter(guide=>[guide.name,...guide.models,...guide.families,...guide.serialExamples].join(" ").toLowerCase().includes(q));
  },[query]);

  useEffect(()=>{
    const items=Array.from(document.querySelectorAll<HTMLElement>(".asc-directory-reveal"));
    if(!("IntersectionObserver" in window)){items.forEach(item=>item.classList.add("asc-directory-visible"));return;}
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add("asc-directory-visible");observer.unobserve(entry.target);}
      });
    },{threshold:.1,rootMargin:"0px 0px -35px 0px"});
    items.forEach(item=>observer.observe(item));
    return()=>observer.disconnect();
  },[filtered.length]);

  return <main className="min-h-screen bg-[#fff9f2] text-slate-950">
    <style>{`
      @keyframes asc-directory-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      .asc-directory-hero{animation:asc-directory-rise .75s cubic-bezier(.2,.7,.2,1) both}
      .asc-directory-reveal{opacity:0;transform:translateY(28px);filter:blur(4px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1),filter .7s ease}
      .asc-directory-reveal.asc-directory-visible{opacity:1;transform:translateY(0);filter:blur(0)}
      @media (prefers-reduced-motion:reduce){.asc-directory-hero,.asc-directory-reveal{opacity:1!important;transform:none!important;filter:none!important;animation:none!important;transition:none!important}}
    `}</style>
    <header className="border-b border-orange-100 bg-white px-5 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3 font-black"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs text-white">ASC</span>AUTO STEREO CODES</Link><nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex"><Link href="/">Inicio</Link><Link href="/radio-codes" className="text-orange-600">Todas las marcas</Link><Link href="/request">Solicitar código</Link></nav><Link href="/request" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600">Solicitar código</Link></div></header>

    <section className="relative overflow-hidden border-b border-orange-100 px-6 py-16 md:py-20"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${HOME_CAR_PHOTO})`}}/><div className="absolute inset-0 bg-gradient-to-r from-white/96 via-[#fff8ef]/92 to-orange-50/72"/><div className="asc-directory-hero relative mx-auto max-w-5xl"><div className="text-sm font-semibold text-slate-500"><Link href="/">Inicio</Link><span className="mx-2">›</span>Todas las marcas</div><p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-orange-500">DIRECTORIO DE GUÍAS</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Todas las marcas y familias de radio</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Busca tu marca, modelo, fabricante de radio o prefijo de serie. Cada resultado abre una pantalla independiente con instrucciones específicas.</p><div className="relative mt-9 max-w-4xl"><span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-orange-400">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar Honda, Ford, VWZ, Becker, Clarion…" className="w-full rounded-2xl border border-orange-100 bg-white/95 py-4 pl-14 pr-5 text-base shadow-xl shadow-orange-100/60 outline-none placeholder:text-slate-400 focus:border-orange-400"/></div></div></section>

    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16"><div className="asc-directory-reveal mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">Guías de serie</p><h2 className="mt-2 text-3xl font-black">Selecciona tu vehículo o fabricante de radio</h2></div><div className="text-sm font-semibold text-slate-500">{filtered.length} resultados</div></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((guide,index)=>{const photo=brandPhotoForSlug(guide.slug);return <Link key={guide.slug} href={`/radio-codes/${guide.slug}`} className="asc-directory-reveal group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl" style={{transitionDelay:`${Math.min(index%8,7)*55}ms`}}><div className="relative h-36 overflow-hidden bg-slate-100"><div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{backgroundImage:`url(${photo})`}}/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent"/><div className="absolute bottom-4 left-4 rounded-2xl bg-white/92 p-2.5 shadow-lg backdrop-blur"><BrandMark slug={guide.slug} name={guide.name} compact/></div><span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-orange-600 shadow-lg backdrop-blur transition group-hover:translate-x-1">→</span></div><div className="p-6"><h3 className="text-xl font-black">{guide.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{guide.models.slice(0,4).join(" · ")}</p><div className="mt-4 flex flex-wrap gap-2">{guide.families.slice(0,2).map(f=><span key={f} className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">{f}</span>)}</div><div className="mt-5 border-t border-orange-100 pt-4 text-sm font-black text-orange-600">Cómo encontrar la serie →</div></div></Link>})}</div>
      {filtered.length===0&&<div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center"><div className="text-3xl">⌕</div><h3 className="mt-3 text-xl font-black">No encontramos esa marca</h3><p className="mt-2 text-slate-500">Prueba con el fabricante del radio, un modelo o un prefijo de serie.</p></div>}
    </section>
  </main>;
}
