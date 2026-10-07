import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

const phone = "6648118609";

export default function PaymentMethodsPage() {
  return <main className="min-h-screen bg-white text-[#171717]">
    <JuniorClassicHeader whatsapp={phone} />
    <div className="bg-[#0875b9] px-5 py-5 text-center text-3xl font-black uppercase tracking-[.12em] text-white [text-shadow:2px_2px_0_rgba(0,0,0,.8)] md:text-5xl">Métodos de pago</div>
    <section className="mx-auto max-w-4xl px-5 py-14 md:py-16">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title="Transferencia bancaria" text="Cuando apartes tus boletos, el sistema mostrará las cuentas de pago activas configuradas para Sorteos Junior. Usa los datos mostrados en tu reserva." />
        <InfoCard title="Comprobante de pago" text="Después de realizar el pago, sube una foto o PDF del comprobante desde la página del sorteo. El archivo quedará asociado a tu folio para revisión." />
      </div>
      <div className="mt-8 rounded-xl border-2 border-[#0875b9] bg-[#f3f8fc] p-6">
        <h2 className="text-xl font-black uppercase text-[#0875b9]">Importante</h2>
        <p className="mt-3 leading-7">Verifica que el monto y los datos de la cuenta coincidan con los mostrados en el sitio antes de realizar cualquier pago. Conserva tu folio y tu comprobante.</p>
      </div>
      <div className="mt-10 text-center">
        <a href="/sorteos" className="inline-block rounded-md bg-[#d43e37] px-7 py-4 font-black uppercase text-white">Ver boletos disponibles</a>
      </div>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#111]"><h2 className="text-xl font-black uppercase text-[#0875b9]">{title}</h2><p className="mt-3 leading-7 text-slate-700">{text}</p></article>;
}
