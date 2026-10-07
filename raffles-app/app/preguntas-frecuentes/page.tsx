import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

const phone = "6648118609";

const questions = [
  ["¿Cómo se elige a los ganadores?", "Cada sorteo informa con anticipación qué resultado público se utilizará como referencia. El boleto que coincida con el número ganador publicado será identificado como ganador conforme a las bases y fecha de ese sorteo."],
  ["¿Qué sucede si el número ganador corresponde a un boleto no vendido?", "Cuando las bases contemplen una nueva selección, Sorteos Junior publicará la nueva fecha o referencia que se utilizará para determinar al ganador."],
  ["¿Dónde se publican los ganadores?", "Los sorteos finalizados y sus resultados se conservan en la sección Ganadores. También podrán comunicarse por las redes oficiales que estén configuradas en el sitio."],
  ["¿Es obligatorio subir el comprobante de pago?", "Sí. El comprobante debe subirse desde el sitio después de generar la reserva. Esto permite que la solicitud pase a revisión y posteriormente pueda marcarse como pagada."],
  ["¿Cómo confirmo que mis boletos están registrados?", "Usa el verificador con tu folio y los datos solicitados. Ahí podrás revisar los números asociados y el estado de la solicitud."],
  ["¿Puedo escoger mis propios números?", "Sí. Puedes seleccionar números disponibles de forma manual o utilizar la Máquina de la Suerte para recibir una selección aleatoria de números disponibles."],
  ["¿Qué pasa si aparto boletos y no realizo el pago?", "La solicitud puede quedar marcada como no pagada. La administración determina cuándo liberar nuevamente esos números, conservando el historial de la solicitud."],
  ["¿Dónde veo la fecha y condiciones de cada sorteo?", "La página individual de cada sorteo muestra su fecha, premio, precio del boleto, emisión y la información publicada para esa edición."],
];

export default function FrequentlyAskedQuestionsPage() {
  return <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
    <JuniorClassicHeader whatsapp={phone} />
    <section className="border-b border-[#d4af37]/30 bg-[#081b33] px-5 py-12 text-center text-white">
      <div className="text-xs font-black uppercase tracking-[.22em] text-[#f2c94c]">Información</div>
      <h1 className="mt-2 text-4xl font-black uppercase tracking-[.08em] md:text-5xl">Preguntas frecuentes</h1>
      <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#d4af37]" />
    </section>
    <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <div className="grid gap-5">
        {questions.map(([q,a]) => <article key={q} className="rounded-2xl border border-[#081b33]/10 bg-white p-6 shadow-[0_12px_30px_rgba(8,27,51,.06)]"><h2 className="text-xl font-black uppercase tracking-[.08em] text-[#081b33] md:text-2xl">{q}</h2><div className="mt-3 h-1 w-14 rounded-full bg-[#d4af37]"/><p className="mt-4 text-[15px] leading-7 text-slate-600">{a}</p></article>)}
      </div>
      <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-white p-8 text-center">
        <div className="text-sm font-black uppercase tracking-[.18em] text-[#9a7a12]">¿Tienes otra pregunta?</div>
        <div className="mt-2 text-2xl font-black text-[#081b33]">664 811 8609</div>
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-xl border-2 border-[#081b33] px-6 py-3 font-black uppercase text-[#081b33] transition hover:bg-[#081b33] hover:text-white">Abrir WhatsApp</a>
      </div>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}
