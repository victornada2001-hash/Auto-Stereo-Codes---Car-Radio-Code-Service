import type { Language } from "./languages";

type Props = { language: Language };

export default function SampleTestimonials({ language }: Props) {
  const es = language === "es";
  const reviews = es
    ? [
        { name: "Carlos M.", vehicle: "Honda Civic", text: "El proceso fue muy sencillo. Encontré la serie con la guía y pude enviar la solicitud sin complicaciones." },
        { name: "Andrea R.", vehicle: "Acura TL", text: "Me gustó que la página explica dónde buscar el número de serie antes de pagar. Todo se entiende rápido." },
        { name: "Luis G.", vehicle: "Nissan", text: "Formulario claro y pago fácil. La información del pedido quedó organizada y fue fácil dar seguimiento." },
        { name: "María P.", vehicle: "Volkswagen", text: "La guía visual me ayudó a identificar qué dato necesitaba del estéreo. La página se siente segura y profesional." },
      ]
    : [
        { name: "James T.", vehicle: "Honda Accord", text: "The process was easy to follow. The serial-number guide helped me figure out exactly what information I needed." },
        { name: "Emily R.", vehicle: "Acura MDX", text: "Clear instructions, simple request form, and an easy payment flow. Everything was straightforward." },
        { name: "Daniel K.", vehicle: "BMW", text: "I liked having the vehicle and stereo information organized in one place before checkout." },
        { name: "Sofia L.", vehicle: "Toyota", text: "The page explains the serial number clearly and makes it easy to submit the right details the first time." },
      ];

  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">
            {es ? "Vista previa de opiniones" : "Review preview"}
          </div>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            {es ? "Así puede verse la sección de comentarios" : "How the customer review section can look"}
          </h2>
          <p className="mt-5 leading-7 text-slate-300">
            {es
              ? "Estos comentarios son ejemplos ficticios creados únicamente para mostrar el diseño. Deben reemplazarse por opiniones reales antes de presentarlos como testimonios de clientes."
              : "These are fictional sample comments created only to preview the design. Replace them with real customer feedback before presenting them as customer testimonials."}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article key={review.name} className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-lg">
              <div className="text-amber-300" aria-label="5 stars">★★★★★</div>
              <div className="mt-3 inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-300">
                {es ? "Ejemplo ficticio" : "Fictional sample"}
              </div>
              <p className="mt-5 leading-7 text-slate-200">“{review.text}”</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="font-bold text-white">{review.name}</div>
                <div className="mt-1 text-sm text-slate-400">{review.vehicle}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
