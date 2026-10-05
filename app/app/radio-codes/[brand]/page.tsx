import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandSerialStarter from "../BrandSerialStarter";
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="bg-[#071a36] px-5 py-2 text-center text-xs font-bold text-blue-100 md:text-sm">
        AUTO STEREO CODES · Identifica la serie correcta antes de solicitar tu código
      </div>

      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="font-black tracking-tight text-slate-950">
            <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs text-white">ASC</span>
            AUTO STEREO CODES
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Link href="/radio-codes" className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:border-blue-300 hover:text-blue-700">← Todas las marcas</Link>
            <Link href="/#request-form" className="hidden rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 sm:inline-flex">Solicitar código</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b2347] px-6 py-14 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{backgroundImage:"radial-gradient(circle at 85% 10%,#3b82f6 0,transparent 30%),linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",backgroundSize:"auto,120px 120px,120px 120px"}} />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="text-sm text-blue-200"><Link href="/" className="hover:text-white">Inicio</Link><span className="mx-2">›</span><Link href="/radio-codes" className="hover:text-white">Todas las marcas</Link><span className="mx-2">›</span>{guide.name}</div>
            <div className="mt-7 inline-flex h-16 min-w-16 items-center justify-center rounded-2xl bg-white/10 px-4 text-xl font-black ring-1 ring-white/15">{guide.monogram}</div>
            <p className="mt-6 text-sm font-black uppercase tracking-[.2em] text-blue-300">Guía de número de serie</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Cómo encontrar la serie de tu radio {guide.name}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100/80">{guide.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {guide.models.map((model) => <span key={model} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-100">{model}</span>)}
            </div>
          </div>
          <BrandSerialStarter brand={guide.name} examples={guide.serialExamples} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Antes de empezar</p>
            <h2 className="mt-2 text-2xl font-black">Identifica qué radio tienes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guide.note}</p>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Familias comunes</div>
              <div className="mt-3 flex flex-wrap gap-2">{guide.families.map((family) => <span key={family} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">{family}</span>)}</div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Ejemplos de serie</div>
              <div className="mt-3 space-y-2">{guide.serialExamples.map((example) => <div key={example} className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-sm font-bold text-blue-200">{example}</div>)}</div>
            </div>
          </aside>

          <div>
            <div className="mb-7">
              <p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Métodos disponibles</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">Encuentra el método que coincide con tu estéreo</h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">No todos los radios de una misma marca son iguales. Compara el tipo de unidad, el prefijo de la serie y las instrucciones antes de continuar.</p>
            </div>

            <div className="space-y-5">
              {guide.methods.map((method, index) => (
                <article key={`${method.title}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid md:grid-cols-[180px_1fr]">
                    <div className="flex min-h-44 flex-col justify-between bg-slate-950 p-6 text-white">
                      <div className="text-4xl font-black text-blue-400">{String(index + 1).padStart(2,"0")}</div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[.18em] text-blue-300">{method.kicker}</div>
                        <div className="mt-2 text-xs leading-5 text-slate-400">{method.appliesTo}</div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-black">{method.title}</h3>
                      <ol className="mt-5 space-y-3">
                        {method.steps.map((step, stepIndex) => (
                          <li key={step} className="flex gap-3 text-sm leading-6 text-slate-650">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700">{stepIndex + 1}</span>
                            <span className="text-slate-600">{step}</span>
                          </li>
                        ))}
                      </ol>
                      {method.examples && method.examples.length > 0 && (
                        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Qué puede verse la serie</div>
                          <div className="mt-3 flex flex-wrap gap-2">{method.examples.map((example) => <code key={example} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">{example}</code>)}</div>
                        </div>
                      )}
                      {method.warning && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Importante:</strong> {method.warning}</div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-7 md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <p className="text-sm font-black uppercase tracking-[.2em] text-blue-400">¿Ya tienes la serie?</p>
            <h2 className="mt-2 text-3xl font-black">Solicita tu código de desbloqueo</h2>
            <p className="mt-2 max-w-2xl text-slate-400">Copia la serie exactamente como aparece. Tu solicitud solo se crea después de confirmar el pago seguro.</p>
          </div>
          <Link href="/#request-form" className="shrink-0 rounded-xl bg-blue-600 px-6 py-4 text-center font-black hover:bg-blue-500">Ir al formulario →</Link>
        </div>
      </section>
    </main>
  );
}
