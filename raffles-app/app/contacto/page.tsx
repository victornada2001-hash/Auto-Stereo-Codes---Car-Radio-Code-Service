import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

const phone = "6648118609";

export default function ContactPage() {
  return <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
    <JuniorClassicHeader whatsapp={phone} />
    <section className="border-b border-[#d4af37]/30 bg-[#081b33] px-5 py-12 text-center text-white">
      <div className="text-xs font-black uppercase tracking-[.22em] text-[#f2c94c]">Atención</div>
      <h1 className="mt-2 text-4xl font-black uppercase tracking-[.08em] md:text-5xl">Contáctanos</h1>
      <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#d4af37]" />
    </section>
    <section className="mx-auto max-w-3xl px-5 py-16 text-center">
      <div className="rounded-3xl border border-[#d4af37]/35 bg-white p-8 shadow-[0_18px_50px_rgba(8,27,51,.08)] md:p-12">
        <div className="text-sm font-black uppercase tracking-[.18em] text-[#9a7a12]">WhatsApp oficial</div>
        <div className="mt-3 text-4xl font-black text-[#081b33]">664 811 8609</div>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">Para dudas sobre boletos, folios, comprobantes o sorteos publicados, comunícate directamente con Sorteos Junior.</p>
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-7 inline-block rounded-xl border-2 border-[#081b33] bg-white px-8 py-4 text-lg font-black uppercase text-[#081b33] transition hover:bg-[#081b33] hover:text-white">Abrir WhatsApp</a>
      </div>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}
