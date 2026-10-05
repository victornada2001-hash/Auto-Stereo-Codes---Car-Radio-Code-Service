import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandSerialStarter from "../BrandSerialStarter";
import { getRadioGuide, radioGuides } from "../../radioGuideData";

const iconSlugs: Record<string,string> = {
  acura:"acura", "alfa-romeo":"alfaromeo", alpine:"alpine", audi:"audi", bmw:"bmw", bosch:"bosch", chrysler:"chrysler",
  citroen:"citroen", dacia:"dacia", dodge:"dodge", fiat:"fiat", ford:"ford", honda:"honda", iveco:"iveco", jaguar:"jaguar",
  jeep:"jeep", lancia:"lancia", "land-rover":"landrover", mercedes:"mercedesbenz", nissan:"nissan", peugeot:"peugeot",
  porsche:"porsche", renault:"renault", seat:"seat", skoda:"skoda", sony:"sony", suzuki:"suzuki", toyota:"toyota",
  vauxhall:"vauxhall", volkswagen:"volkswagen"
};

function brandIcon(slug:string){
  const icon=iconSlugs[slug];
  return icon ? `https://cdn.simpleicons.org/${icon}/111827` : null;
}

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
  const icon=brandIcon(guide.slug);

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

      <section className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-br from-white via-orange-50 to-[#fff1df] px-6 py-14 md:py-20">
        <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-orange-200/35 blur-3xl"/>
        {icon && <img src={icon} alt={`Logo ${guide.name}`} className="pointer-events-none absolute right-[4%] top-1/2 hidden h-72 w-72 -translate-y-1/2 object-contain opacity-[0.07] lg:block"/>}
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold text-slate-500"><Link href="/" className="hover:text-orange-600">Inicio</Link><span className="mx-2">›</span><Link href="/radio-codes" className="hover:text-orange-600">Todas las marcas</Link><span className="mx-2">›</span>{guide.name}</div>
            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-100 bg-white shadow-lg shadow-orange-100/70">
                {icon ? <img src={icon} alt={guide.name} className="h-12 w-12 object-contain"/> : <span className="text-xl font-black">{guide.monogram}</span>}
              </div>
              <div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-500">Guía de número de serie</p><div className="mt-1 text-sm font-bold text-slate-500">{guide.families.slice(0,3).join(" · ")}</div></div>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Cómo encontrar la serie de tu radio <span className="text-orange-500">{guide.name}</span></h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{guide.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{guide.models.map((model) => <span key={model} className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">{model}</span>)}</div>
          </div>
          <BrandSerialStarter brand={guide.name} examples={guide.serialExamples} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="h-fit rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">{icon?<img src={icon} alt="" className="h-8 w-8 object-contain"/>:<span className="font-black">{guide.monogram}</span>}</div>
              <div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-500">Antes de empezar</p><h2 className="mt-1 text-xl font-black">Identifica qué radio tienes</h2></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{guide.note}</p>
            <div className="mt-6 border-t border-orange-100 pt-5"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Familias comunes</div><div className="mt-3 flex flex-wrap gap-2">{guide.families.map((family) => <span key={family} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800">{family}</span>)}</div></div>
            <div className="mt-6 border-t border-orange-100 pt-5"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Ejemplos de serie</div><div className="mt-3 space-y-2">{guide.serialExamples.map((example) => <div key={example} className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-sm font-bold text-orange-200">{example}</div>)}</div></div>
          </aside>

          <div>
            <div className="mb-7"><p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">Métodos disponibles</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Elige el método que coincide con tu estéreo</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Una misma marca puede utilizar radios distintos según modelo y año. Compara el tipo de unidad, el prefijo y los ejemplos antes de continuar.</p></div>
            <div className="space-y-5">
              {guide.methods.map((method,index)=><article key={`${method.title}-${index}`} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
                <div className="grid md:grid-cols-[180px_1fr]">
                  <div className="flex min-h-44 flex-col justify-between bg-orange-500 p-6 text-white"><div className="text-5xl font-black text-white/95">{String(index+1).padStart(2,"0")}</div><div><div className="text-[10px] font-black uppercase tracking-[.18em] text-orange-100">{method.kicker}</div><div className="mt-2 text-xs leading-5 text-orange-50">{method.appliesTo}</div></div></div>
                  <div className="p-6 md:p-8"><h3 className="text-2xl font-black">{method.title}</h3><ol className="mt-5 space-y-3">{method.steps.map((step,stepIndex)=><li key={step} className="flex gap-3 text-sm leading-6"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-black text-orange-700">{stepIndex+1}</span><span className="text-slate-600">{step}</span></li>)}</ol>{method.examples&&method.examples.length>0&&<div className="mt-6 rounded-2xl bg-[#fff9f2] p-4"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Cómo puede verse la serie</div><div className="mt-3 flex flex-wrap gap-2">{method.examples.map(example=><code key={example} className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-bold text-slate-800">{example}</code>)}</div></div>}{method.warning&&<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Importante:</strong> {method.warning}</div>}</div>
                </div>
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-orange-100 bg-white px-6 py-14"><div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl bg-orange-500 p-7 text-white md:flex-row md:items-center md:justify-between md:p-9"><div><p className="text-sm font-black uppercase tracking-[.2em] text-orange-100">¿Ya confirmaste la serie?</p><h2 className="mt-2 text-3xl font-black">Completa tu solicitud en una pantalla separada</h2><p className="mt-2 max-w-2xl text-orange-50">El formulario de pago ya no está al final de la página. Se abre en una pantalla limpia e independiente.</p></div><Link href="/request" className="shrink-0 rounded-xl bg-white px-6 py-4 text-center font-black text-slate-950 shadow-lg">Solicitar código →</Link></div></section>
    </main>
  );
}
