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
  return <main className="min-h-screen bg-white text-[#171717]">
    <JuniorClassicHeader whatsapp={phone} />
    <div className="bg-[#0875b9] px-5 py-5 text-center text-3xl font-black uppercase tracking-[.12em] text-white [text-shadow:2px_2px_0_rgba(0,0,0,.8)] md:text-5xl">Preguntas frecuentes</div>
    <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <div className="space-y-10">
        {questions.map(([q,a]) => <article key={q}><h2 className="text-center text-xl font-black uppercase tracking-[.12em] text-[#0875b9] md:text-2xl">{q}</h2><p className="mt-3 text-[15px] leading-7 text-[#222]">{a}</p></article>)}
      </div>
      <div className="mt-14 border-t-2 border-[#0875b9] pt-8 text-center">
        <div className="font-black uppercase">¿Tienes otra pregunta?</div>
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-md bg-[#25d366] px-6 py-3 font-black text-black">WhatsApp · 664 811 8609</a>
      </div>
    </section>
    <SiteFooter settings={{ whatsapp_number: phone }} />
  </main>;
}
