import { SiteFooter, SiteHeader } from "../components/site";

export default function ComoParticiparPage() {
  return <main className="min-h-screen bg-[#f4f2ec] text-[#111]">
    <SiteHeader />
    <section className="bg-[#08090b] text-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f6c900]">Paso a paso</div><h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-7xl">Cómo participar</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Participar en Sorteos Junior es sencillo. Todo el proceso queda ligado a un folio para que puedas darle seguimiento.</p></div></section>
    <section className="mx-auto max-w-5xl px-5 py-12">
      <div className="grid gap-5 md:grid-cols-2">
        <Step n="01" title="Entra a Sorteos" text="Revisa los sorteos activos y abre el que tenga el premio que te interesa." />
        <Step n="02" title="Selecciona tus números" text="Elige entre los números disponibles. Si la opción está habilitada, también puedes dejar que el sistema elija números al azar." />
        <Step n="03" title="Registra tus datos" text="Captura tu nombre y teléfono correctamente. Ese teléfono se usa para identificar y verificar tu solicitud." />
        <Step n="04" title="Guarda tu folio" text="Al apartar tus números recibirás un folio. Consérvalo porque sirve para consultar el estado de tus boletos." />
        <Step n="05" title="Realiza el pago" text="Sigue las instrucciones de pago indicadas en la página y carga tu comprobante cuando corresponda." />
        <Step n="06" title="Verifica tu boleto" text="Entra al Verificador con tu folio y teléfono para revisar tus números y su estado." />
      </div>
      <div className="mt-10 rounded-[2rem] bg-[#f6c900] p-7 sm:p-9"><div className="text-xs font-black uppercase tracking-[.2em]">Importante</div><h2 className="mt-2 text-3xl font-black uppercase">Revisa las condiciones de cada sorteo</h2><p className="mt-4 max-w-3xl font-semibold leading-7">La fecha, el premio, el precio del boleto, la cantidad de números y el método para determinar al ganador se muestran en cada sorteo. Antes de participar revisa también los términos y condiciones.</p><div className="mt-6 flex flex-wrap gap-3"><a href="/sorteos" className="rounded-xl bg-black px-5 py-3 font-black uppercase text-white">Ver sorteos</a><a href="/terminos" className="rounded-xl border-2 border-black bg-white px-5 py-3 font-black uppercase">Términos</a></div></div>
    </section>
    <SiteFooter settings={{}} />
  </main>;
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <article className="rounded-[1.6rem] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,.06)]"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#08090b] text-sm font-black text-[#f6c900]">{n}</div><h2 className="mt-5 text-2xl font-black uppercase">{title}</h2><p className="mt-3 leading-7 text-slate-600">{text}</p></article>;
}
