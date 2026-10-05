"use client";

import { useState } from "react";
import Image from "next/image";
import CheckoutRequestForm from "./CheckoutRequestForm";

const brands = [
  { name: "HONDA", logo: "/brands/honda.svg" },
  { name: "ACURA", logo: "/brands/acura.svg" },
  { name: "TOYOTA", logo: "/brands/toyota.svg" },
  { name: "NISSAN", logo: "/brands/nissan.svg" },
  { name: "FORD", logo: "/brands/ford.svg" },
  { name: "CHEVROLET", logo: "/brands/chevrolet.svg" },
  { name: "VOLKSWAGEN", logo: "/brands/volkswagen.svg" },
  { name: "BMW", logo: "/brands/bmw.svg" },
  { name: "MERCEDES-BENZ", logo: "/brands/mercedes-benz.svg" },
  { name: "AUDI", logo: "/brands/audi.svg" },
];

export default function Home() {
  const [language, setLanguage] = useState<"en" | "es">("en");

  const content = {
    en: {
      navHome: "Home",
      navRequest: "Request Code",
      navSerial: "Find Serial Number",
      navFaq: "FAQ",
      navContact: "Contact",
      heroTitle1: "Get Your Car",
      heroTitle2: "Stereo Code",
      heroText: "We provide security codes for car radios and stereos from all major brands. Fast, secure and easy.",
      safe: "100% Safe & Secure",
      fast: "Fast Delivery",
      support: "Expert Support",
      request: "Request Your Code →",
      brandsTitle: "Compatible with All Major Brands",
      brandsSub: "We work with factory radios from many vehicle manufacturers.",
      more: "and more...",
      brandDisclaimer: "Brand names and logos belong to their respective owners and are shown only to indicate compatibility.",
      serialEyebrow: "Before You Order",
      serialTitle: "How to Find Your Stereo Serial Number",
      serialText: "The stereo serial number identifies the exact radio installed in your vehicle. It is not the same as the vehicle VIN. Use one of these two methods.",
      hondaTitle: "Honda / Acura: 1 + 6 + PWR/VOL",
      hondaText: "On many older Honda and Acura radios, including many units found in vehicles around 2015 and earlier: set the ignition to ACC or ON and leave the radio off. Press and hold preset buttons 1 and 6. While holding them, press the PWR/VOL (power/volume) knob to turn the radio on. Keep holding 1 and 6 until the serial number appears.",
      hondaNote: "Some compatible radios show the serial in two groups of four digits. Record both groups. This method does not work on every Honda or Acura audio system.",
      labelTitle: "Physical label on the stereo",
      labelText: "The serial number may be printed on a label on the top, side or rear of the radio chassis. You may need to remove the stereo from the dashboard to see it. If you are not experienced with trim panels and electrical connectors, have an installer or technician remove it for you.",
      newerNote: "If 1 + 6 + Power does not display a serial, do not keep trying random button combinations. Use the physical label or the instructions for your exact radio model.",
      vinNote: "Important: send us the stereo serial number, not only the 17-character vehicle VIN.",
      serialCta: "Have your serial? Request your code →",
      works: "How It Works",
      worksSub: "Get your stereo code in just 3 simple steps.",
      stepLabel: "Step",
      step1: "Submit Your Information",
      step1Text: "Enter your vehicle details and stereo serial number in our secure form.",
      step2: "Make the Payment",
      step2Text: "Complete your purchase using our secure payment system.",
      step3: "Receive Your Code",
      step3Text: "We’ll send your stereo code quickly via email or WhatsApp.",
      faqTitle: "Frequently Asked Questions",
      faqSub: "Quick answers before you place your order.",
      faq1q: "Is the VIN the same as the stereo serial number?",
      faq1a: "No. The VIN identifies the vehicle; the stereo serial identifies the radio unit.",
      faq2q: "Does the 1 + 6 + Power method work on every Honda or Acura?",
      faq2a: "No. It works on many older compatible audio units. If the serial does not appear, use the physical label on the radio or the instructions for your exact unit.",
      faq3q: "How will I receive my code?",
      faq3a: "We can deliver it using the email or WhatsApp contact provided with your request.",
      help: "Need Help?",
      helpSub: "We’re here for you!",
      whatsapp: "Chat with us on WhatsApp",
      phone: "Call us",
      email: "Email us",
      features: ["All major brands", "Fast delivery", "Secure payments", "Professional support", "100% reliable"],
      requestNow: "Request Your Code Now",
      requestSub: "Fill out the form and get your stereo code.",
      goForm: "Go to Request Form →",
      secure: "Your information is safe and secure.",
      footer: "© 2026 Auto Stereo Codes. All rights reserved.",
      tagline: "Fast • Secure • Reliable",
    },
    es: {
      navHome: "Inicio",
      navRequest: "Solicitar Código",
      navSerial: "Encontrar Número de Serie",
      navFaq: "Preguntas",
      navContact: "Contacto",
      heroTitle1: "Obtén el Código",
      heroTitle2: "de Tu Estéreo",
      heroText: "Proporcionamos códigos de seguridad para radios y estéreos de las principales marcas. Rápido, seguro y sencillo.",
      safe: "100% Seguro",
      fast: "Entrega Rápida",
      support: "Soporte Experto",
      request: "Solicitar Mi Código →",
      brandsTitle: "Compatible con las Principales Marcas",
      brandsSub: "Trabajamos con radios originales de muchas marcas de vehículos.",
      more: "y muchas más...",
      brandDisclaimer: "Los nombres y logotipos pertenecen a sus respectivos propietarios y se muestran únicamente para indicar compatibilidad.",
      serialEyebrow: "Antes de Solicitar",
      serialTitle: "Cómo Obtener la Serie de Tu Estéreo",
      serialText: "El número de serie identifica el radio exacto instalado en tu vehículo. No es lo mismo que el VIN del carro. Puedes obtenerlo con una de estas dos opciones.",
      hondaTitle: "Honda / Acura: 1 + 6 + PWR/VOL",
      hondaText: "En muchos radios Honda y Acura de generaciones anteriores, incluidos muchos equipos de vehículos alrededor de 2015 o anteriores: coloca el encendido del vehículo en ACC u ON y deja el radio apagado. Mantén presionados los botones 1 y 6. Sin soltarlos, presiona el botón PWR/VOL (encendido/volumen) para encender el radio. Sigue sosteniendo 1 y 6 hasta que aparezca la serie en la pantalla.",
      hondaNote: "En algunos radios compatibles aparecen dos grupos de cuatro dígitos. Anota los dos. Este método no funciona en todos los sistemas Honda o Acura.",
      labelTitle: "Etiqueta física del estéreo",
      labelText: "La serie puede venir impresa en una etiqueta en la parte superior, lateral o trasera de la carcasa del estéreo. Para verla puede ser necesario desmontar el radio del tablero. Si no tienes experiencia desmontando molduras o conectores, es mejor que lo haga un instalador o técnico para evitar daños.",
      newerNote: "Si 1 + 6 + encendido no muestra la serie, no sigas probando combinaciones al azar. Usa la etiqueta física del equipo o las instrucciones específicas de tu modelo de radio.",
      vinNote: "Importante: envíanos la serie del estéreo, no solamente el VIN de 17 caracteres del vehículo.",
      serialCta: "¿Ya tienes el serial? Solicita tu código →",
      works: "Cómo Funciona",
      worksSub: "Obtén tu código de estéreo en solo 3 pasos.",
      stepLabel: "Paso",
      step1: "Envía Tu Información",
      step1Text: "Ingresa los datos de tu vehículo y el número de serie del estéreo en nuestro formulario seguro.",
      step2: "Realiza el Pago",
      step2Text: "Completa tu compra mediante nuestro sistema de pago seguro.",
      step3: "Recibe Tu Código",
      step3Text: "Te enviaremos rápidamente el código por email o WhatsApp.",
      faqTitle: "Preguntas Frecuentes",
      faqSub: "Respuestas rápidas antes de hacer tu solicitud.",
      faq1q: "¿El VIN es lo mismo que el serial del estéreo?",
      faq1a: "No. El VIN identifica el vehículo; el serial del estéreo identifica el radio.",
      faq2q: "¿El método 1 + 6 + encendido funciona en todos los Honda o Acura?",
      faq2a: "No. Funciona en muchos equipos antiguos compatibles. Si no aparece la serie, utiliza la etiqueta física del radio o las instrucciones específicas de tu unidad.",
      faq3q: "¿Cómo recibiré mi código?",
      faq3a: "Podemos entregarlo al correo o WhatsApp que proporciones en tu solicitud.",
      help: "¿Necesitas Ayuda?",
      helpSub: "¡Estamos para ayudarte!",
      whatsapp: "Chatea con nosotros por WhatsApp",
      phone: "Llámanos",
      email: "Envíanos un email",
      features: ["Todas las principales marcas", "Entrega rápida", "Pagos seguros", "Soporte profesional", "100% confiable"],
      requestNow: "Solicita Tu Código Ahora",
      requestSub: "Completa el formulario y obtén tu código.",
      goForm: "Ir al Formulario →",
      secure: "Tu información está protegida y segura.",
      footer: "© 2026 Auto Stereo Codes. Todos los derechos reservados.",
      tagline: "Rápido • Seguro • Confiable",
    },
  };

  const t = content[language];
  const steps = [
    { number: "1", image: "/step-details.svg", title: t.step1, text: t.step1Text },
    { number: "2", image: "/step-payment.svg", title: t.step2, text: t.step2Text },
    { number: "3", image: "/step-code.svg", title: t.step3, text: t.step3Text },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="absolute left-0 top-0 z-20 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <Image src="/brand-mark.svg" alt="" width={46} height={46} className="h-11 w-11 drop-shadow-lg" />
            <div>
              <div className="text-xl font-black tracking-tight text-white">AUTO <span className="text-blue-400">STEREO</span> CODES</div>
              <div className="text-[9px] font-medium tracking-[0.28em] text-slate-400">UNLOCK YOUR CAR STEREO</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#" className="text-sm text-white transition hover:text-blue-400">{t.navHome}</a>
            <a href="#request" className="text-sm text-white transition hover:text-blue-400">{t.navRequest}</a>
            <a href="#serial" className="text-sm text-white transition hover:text-blue-400">{t.navSerial}</a>
            <a href="#faq" className="text-sm text-white transition hover:text-blue-400">{t.navFaq}</a>
            <a href="#contact" className="text-sm text-white transition hover:text-blue-400">{t.navContact}</a>
          </nav>

          <div className="flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
            <button onClick={() => setLanguage("en")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${language === "en" ? "bg-white text-slate-900" : "text-white"}`}>🇺🇸 English</button>
            <button onClick={() => setLanguage("es")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${language === "es" ? "bg-white text-slate-900" : "text-white"}`}>🇲🇽 Español</button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(37,99,235,0.25),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">Car Radio Code Service</div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">{t.heroTitle1}<br /><span className="text-blue-400">{t.heroTitle2}</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">{t.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">🛡️</div><span className="text-sm font-semibold text-white">{t.safe}</span></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">⚡</div><span className="text-sm font-semibold text-white">{t.fast}</span></div>
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">🎧</div><span className="text-sm font-semibold text-white">{t.support}</span></div>
            </div>
            <a href="#request" className="mt-10 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">{t.request}</a>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
            <Image src="/stereo-hero-v1.png" alt={language === "es" ? "Estéreo de automóvil con pantalla de ingreso de código" : "Car stereo with an unlock code display"} width={1536} height={1024} sizes="(max-width: 1023px) 100vw, 50vw" priority className="relative h-auto w-full rounded-3xl shadow-2xl shadow-blue-950/30" />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-center text-2xl font-black text-slate-900">{t.brandsTitle}</h2>
          <p className="mt-2 text-center text-slate-500">{t.brandsSub}</p>
          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand) => (
              <div key={brand.name} className="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg">
                <Image src={brand.logo} alt={`${brand.name} logo`} width={96} height={52} unoptimized className="h-11 w-auto max-w-24 object-contain opacity-75 transition group-hover:opacity-100" />
                <span className="mt-3 text-xs font-black tracking-wide text-slate-600">{brand.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center text-sm font-semibold text-blue-600">{t.more}</div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[11px] leading-5 text-slate-400">{t.brandDisclaimer}</p>
        </div>
      </section>

      <section id="serial" className="overflow-hidden bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div className="relative lg:sticky lg:top-8">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-blue-100/70 blur-2xl" />
            <Image src="/serial-guide.svg" alt={language === "es" ? "Guía visual para encontrar el número de serie del estéreo" : "Visual guide to find the stereo serial number"} width={1200} height={800} className="relative h-auto w-full rounded-3xl shadow-2xl shadow-slate-300/60" />
            <div className="relative mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-blue-700">Honda / Acura</div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {[
                  ["1", "Preset"],
                  ["+", ""],
                  ["6", "Preset"],
                  ["+", ""],
                  ["PWR/VOL", "Power"],
                ].map(([value, label], index) => value === "+" ? (
                  <span key={index} className="text-xl font-black text-blue-400">+</span>
                ) : (
                  <div key={index} className="min-w-16 rounded-xl border border-blue-200 bg-white px-4 py-3 text-center shadow-sm">
                    <div className="font-black text-slate-900">{value}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">{t.serialEyebrow}</div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.serialTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">{t.serialText}</p>

            <div className="mt-8 space-y-5">
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white">1</div>
                  <h3 className="text-xl font-black text-slate-900">{t.hondaTitle}</h3>
                </div>
                <p className="mt-5 leading-7 text-slate-700">{t.hondaText}</p>
                <p className="mt-4 rounded-xl bg-white p-4 text-sm font-semibold leading-6 text-slate-600 ring-1 ring-blue-100">{t.hondaNote}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white">2</div>
                  <h3 className="text-xl font-black text-slate-900">{t.labelTitle}</h3>
                </div>
                <p className="mt-5 leading-7 text-slate-700">{t.labelText}</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-950">⚠️ {t.newerNote}</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold leading-6 text-slate-700">VIN ≠ Serial · {t.vinNote}</div>
            </div>

            <a href="#request-form" className="mt-8 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-blue-600">{t.serialCta}</a>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center"><h2 className="text-4xl font-black text-slate-900">{t.works}</h2><p className="mt-3 text-slate-500">{t.worksSub}</p></div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="p-4 pb-0"><Image src={step.image} alt="" width={800} height={520} className="h-auto w-full rounded-2xl" /></div>
                <div className="p-8 pt-6 text-center"><div className="text-xs font-black uppercase tracking-widest text-blue-600">{t.stepLabel} {step.number}</div><h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3><p className="mt-3 leading-7 text-slate-500">{step.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="text-center"><h2 className="text-4xl font-black text-slate-900">{t.faqTitle}</h2><p className="mt-3 text-slate-500">{t.faqSub}</p></div>
          <div className="mt-12 grid gap-5">
            {[[t.faq1q, t.faq1a], [t.faq2q, t.faq2a], [t.faq3q, t.faq3a]].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h3 className="text-lg font-bold text-slate-900">{q}</h3><p className="mt-2 leading-7 text-slate-600">{a}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-950 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:px-10">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 md:p-12">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Support</div>
            <h2 className="mt-4 text-4xl font-black text-white">{t.help}</h2><p className="mt-2 text-xl text-slate-400">{t.helpSub}</p>
            <div className="mt-10 space-y-6">
              <div><div className="font-bold text-white">💬 {t.whatsapp}</div><p className="mt-1 text-sm text-slate-500">Quick and easy support.</p></div>
              <div><div className="font-bold text-white">📞 {t.phone}</div><p className="mt-1 text-sm text-slate-500">We’re happy to help.</p></div>
              <div><div className="font-bold text-white">✉️ {t.email}</div><p className="mt-1 text-sm text-slate-500">We’ll reply as soon as possible.</p></div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">{t.features.map((feature) => <div key={feature} className="text-sm text-slate-300">✓ {feature}</div>)}</div>
          </div>

          <div id="request" className="flex flex-col justify-center rounded-3xl bg-white p-8 md:p-12">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Start Here</div>
            <h2 className="mt-4 text-4xl font-black text-slate-900">{t.requestNow}</h2><p className="mt-4 text-lg leading-8 text-slate-500">{t.requestSub}</p>
            <a href="#request-form" className="mt-8 inline-flex w-fit rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500">{t.goForm}</a>
            <div className="mt-6 text-sm text-slate-500">🔒 {t.secure}</div>
          </div>
        </div>
      </section>

      <CheckoutRequestForm language={language} />

      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <Image src="/brand-mark.svg" alt="" width={38} height={38} />
            <div><div className="text-lg font-black text-white">AUTO <span className="text-blue-400">STEREO</span> CODES</div><div className="mt-1 text-[9px] tracking-[0.25em] text-slate-500">UNLOCK YOUR CAR STEREO</div></div>
          </div>
          <div className="text-sm text-slate-500">{t.footer}</div>
          <div className="text-sm font-semibold text-slate-400">{t.tagline}</div>
        </div>
      </footer>
    </main>
  );
}
