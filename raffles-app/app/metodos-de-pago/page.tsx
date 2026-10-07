import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

const phone = "6648118609";

export default function PaymentMethodsPage() {
  return <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
    <JuniorClassicHeader whatsapp={phone} />
    <section className="border-b border-[#d4af37]/30 bg-[#081b33] px-5 py-12 text-center text-white">
      <div className="text-xs font-black uppercase tracking-[.22em] text-[#f2c94c]">Pagos</div>
      <h1 className="mt-2 text-4xl font-black uppercase tracking-[.08em] md:text-5xl">Métodos de pago</h1>
      <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#d4af37]" />
    </section>
    <section className="mx-auto max-w-4xl px-5 py-14 md:py-16">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title="Transferencia bancaria" text="Cuando apartes tus boletos, el sistema mostrará las cuentas de pago activas configuradas para Sorteos Junior. Utiliza únicamente los datos que aparecen dentro de tu reserva." />
        <InfoCard title="Comprobante de pago" text="Después de realizar el pago, sube una foto o PDF del comprobante desde la página del sorteo. El archivo quedará asociado a tu folio para revisión." />
      </div>
      <div className="mt-8 rounded-2xl border border-[#d4af37]/50 bg-white p-6 shadow-[0_12px_30px_rgba(8,27,51,.05)]">
        <div className="text-sm font-black uppercase tracking-[.18em] text-[#9a7a12]">Importante</div>
        <h2 className="mt-2 text-2xl font-black uppercase text-[#081b33]">Verifica antes de pagar</h2>
        <p className="mt-3 leading-7 text-slate-600">Confirma que el monto y los datos de la cuenta coincidan con los mostrados en el sitio. Conserva tu folio y tu comprobante hasta que tu pago sea revisado.</p>
      </div>
      <div className="mt-10 text-center">
        <a href="/sorteos" className="inline-block rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-7 py-4 font-black uppercase tracking-wide text-white shadow-lg">Ver boletos disponibles</a>
      </div>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-2xl border border-[#081b33]/10 bg-white p-6 shadow-[0_14px_34px_rgba(8,27,51,.07)]"><div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">Sorteos Junior</div><h2 className="mt-2 text-xl font-black uppercase text-[#081b33]">{title}</h2><div className="mt-3 h-1 w-14 rounded-full bg-[#d4af37]"/><p className="mt-4 leading-7 text-slate-600">{text}</p></article>;
}
