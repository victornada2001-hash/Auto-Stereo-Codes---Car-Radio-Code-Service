import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandMark from "../../BrandMark";
import BrandSerialStarter from "../BrandSerialStarter";
import { brandPhotoForSlug } from "../../brandVisuals";
import { getRadioGuide, radioGuides } from "../../radioGuideData";

export function generateStaticParams() {
  return radioGuides.map((guide) => ({ brand: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const guide = getRadioGuide(brand);
  if (!guide) return { title: "Guía de serie | Auto Stereo Codes" };
  return {
    title: `Cómo encontrar la serie de ${guide.name} | Auto Stereo Codes`,
    description: `Guía para localizar el número de serie de radios ${guide.name}: familias, ejemplos y métodos por tipo de estéreo.`,
  };
}

export default async function BrandRadioGuidePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const guide = getRadioGuide(brand);
  if (!guide) notFound();
  const photo=brandPhotoForSlug(guide.slug);

  return (
    <main className="min-h-screen bg-[#fff9f2] text-slate-950">
      <header className="border-b border-orange-100 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-slate-950">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs text-white">ASC</span>
            AUTO STEREO CODES
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link href="/radio-codes" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-600 hover:border-orange-300 hover:text-orange-700">← Todas las marcas</Link>
            <Link href="/request" className="hidden rounded-full bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 sm:inline-flex">Solicitar código</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-orange-100 px-6 py-14 md:py-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${photo})`}}/>
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-[#fff8ef]/93 to-orange-50/73"/>
        <div className="absolute inset-y-0 right-0 w-[46%] bg-gradient-to-l from-orange-100/22 to-transparent"/>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold text-slate-600"><Link href="/" className="hover:text-orange-600">Inicio</Link><span className="mx-2">›</span><Link href="/radio-codes" className="hover:text-orange-600">Todas las marcas</Link><span className="mx-2">›</span>{guide.name}</div>
            <div className="mt-7 flex items-center gap-4">
              <div className="rounded-3xl bg-white/92 p-2 shadow-xl backdrop-blur"><BrandMark slug={guide.slug} name={guide.name} hero/></div>
              <div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-500">Guía de número de serie</p><div className="mt-1 text-sm font-bold text-slate-600">{guide.families.slice(0,3).join(" · ")}</div></div>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Cómo encontrar la serie de tu radio <span className="text-orange-500">{guide.name}</span></h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{guide.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{guide.models.map((model) => <span key={model} className="rounded-full border border-orange-100 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">{model}</span>)}</div>
          </div>
          <div className="rounded-[2rem] bg-white/78 p-2 shadow-2xl shadow-orange-200/40 backdrop-blur-sm"><BrandSerialStarter brand={guide.name} examples={guide.serialExamples} /></div>
        </div>
        <div className="absolute bottom-3 right-4 rounded-full bg-white/75 px-3 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur">Imagen de referencia: Unsplash</div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="h-fit overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="relative h-44 overflow-hidden"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${photo})`}}/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent"/><div className="absolute bottom-4 left-4 rounded-2xl bg-white/92 p-2 shadow-lg backdrop-blur"><BrandMark slug={guide.slug} name={guide.name} compact/></div></div>
            <div className="p-6">
              <div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-500">Antes de empezar</p><h2 className="mt-1 text-xl font-black">Identifica qué radio tienes</h2></div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{guide.note}</p>
              <div className="mt-6 border-t border-orange-100 pt-5"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Familias comunes</div><div className="mt-3 flex flex-wrap gap-2">{guide.families.map((family) => <span key={family} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800">{family}</span>)}</div></div>
              <div className="mt-6 border-t border-orange-100 pt-5"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Ejemplos de serie</div><div className="mt-3 space-y-2">{guide.serialExamples.map((example) => <div key={example} className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-sm font-bold text-orange-200">{example}</div>)}</div></div>
            </div>
          </aside>

          <div>
            <div className="mb-7"><p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">Métodos disponibles</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Elige el método que coincide con tu estéreo</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Una misma marca puede utilizar radios distintos según modelo y año. Compara el tipo de unidad, el prefijo y los ejemplos antes de continuar.</p></div>
            <div className="space-y-5">
              {guide.methods.map((method,index)=><article key={`${method.title}-${index}`} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
                <div className="grid md:grid-cols-[180px_1fr]">
                  <div className="relative flex min-h-44 flex-col justify-between overflow-hidden p-6 text-white"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${photo})`}}/><div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 to-orange-600/80"/><div className="relative text-5xl font-black text-white/95">{String(index+1).padStart(2,"0")}</div><div className="relative"><div className="text-[10px] font-black uppercase tracking-[.18em] text-orange-100">{method.kicker}</div><div className="mt-2 text-xs leading-5 text-orange-50">{method.appliesTo}</div></div></div>
                  <div className="p-6 md:p-8"><h3 className="text-2xl font-black">{method.title}</h3><ol className="mt-5 space-y-3">{method.steps.map((step,stepIndex)=><li key={step} className="flex gap-3 text-sm leading-6"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-black text-orange-700">{stepIndex+1}</span><span className="text-slate-600">{step}</span></li>)}</ol>{method.examples&&method.examples.length>0&&<div className="mt-6 rounded-2xl bg-[#fff9f2] p-4"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Cómo puede verse la serie</div><div className="mt-3 flex flex-wrap gap-2">{method.examples.map(example=><code key={example} className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-bold text-slate-800">{example}</code>)}</div></div>}{method.warning&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Importante:</strong> {method.warning}</div>}</div>
                </div>
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-orange-100 bg-white px-6 py-14"><div className="relative mx-auto flex max-w-6xl flex-col gap-6 overflow-hidden rounded-3xl p-7 text-white md:flex-row md:items-center md:justify-between md:p-9"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${photo})`}}/><div className="absolute inset-0 bg-gradient-to-r from-orange-600/95 via-orange-500/92 to-slate-950/72"/><div className="relative"><p className="text-sm font-black uppercase tracking-[.2em] text-orange-100">¿Ya confirmaste la serie?</p><h2 className="mt-2 text-3xl font-black">Completa tu solicitud en una pantalla separada</h2><p className="mt-2 max-w-2xl text-orange-50">El formulario de pago se abre en una pantalla limpia e independiente.</p></div><Link href="/request" className="relative shrink-0 rounded-xl bg-white px-6 py-4 text-center font-black text-slate-950 shadow-lg">Solicitar código →</Link></div></section>
    </main>
  );
}
