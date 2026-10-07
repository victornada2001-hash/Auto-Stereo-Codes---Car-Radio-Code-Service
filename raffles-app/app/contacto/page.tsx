import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

const phone = "6648118609";

export default function ContactPage() {
  return <main className="min-h-screen bg-white text-[#171717]">
    <JuniorClassicHeader whatsapp={phone} />
    <div className="bg-[#0875b9] px-5 py-5 text-center text-3xl font-black uppercase tracking-[.12em] text-white [text-shadow:2px_2px_0_rgba(0,0,0,.8)] md:text-5xl">Contáctanos</div>
    <section className="mx-auto max-w-3xl px-5 py-16 text-center">
      <p className="text-base leading-7 text-slate-600">Para dudas sobre boletos, folios, comprobantes o sorteos publicados, comunícate directamente con Sorteos Junior.</p>
      <div className="mt-8 text-2xl font-black uppercase tracking-[.12em]">WhatsApp: 664 811 8609</div>
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-7 inline-block rounded-md bg-[#25d366] px-8 py-4 text-lg font-black text-black">Abrir WhatsApp</a>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}
