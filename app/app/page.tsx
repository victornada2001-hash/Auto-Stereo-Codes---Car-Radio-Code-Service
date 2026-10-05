"use client";

import { useState } from "react";
import Image from "next/image";
import CheckoutRequestForm from "./CheckoutRequestForm";

const brands = [
  "HONDA",
  "ACURA",
  "TOYOTA",
  "NISSAN",
  "FORD",
  "CHEVROLET",
  "VOLKSWAGEN",
  "BMW",
  "MERCEDES-BENZ",
  "AUDI",
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
      heroText:
        "We provide security codes for your car radio and stereo from all major brands. Fast, secure and easy.",
      safe: "100% Safe & Secure",
      fast: "Fast Delivery",
      support: "Expert Support",
      request: "Request Your Code →",
      brandsTitle: "Compatible with All Major Brands",
      more: "and more...",
      serialEyebrow: "Before You Order",
      serialTitle: "Find Your Stereo Serial Number",
      serialText:
        "Your stereo serial number identifies the exact radio installed in your vehicle. It is different from the vehicle VIN and helps us provide the correct unlock code.",
      serial1: "Check the radio display or settings menu.",
      serial2: "Some stereos show it on a label on the radio body.",
      serial3: "If you are unsure, send us a photo and we can help.",
      serialCta: "Have your serial? Request your code →",
      works: "How It Works",
      worksSub: "Get your stereo code in just 3 simple steps.",
      stepLabel: "Step",
      step1: "Submit Your Information",
      step1Text:
        "Enter your vehicle details and stereo serial number in our secure form.",
      step2: "Make the Payment",
      step2Text:
        "Complete your purchase using our secure payment system.",
      step3: "Receive Your Code",
      step3Text:
        "We’ll send your stereo code quickly via email or WhatsApp.",
      faqTitle: "Frequently Asked Questions",
      faqSub: "Quick answers before you place your order.",
      faq1q: "Is the VIN the same as the stereo serial number?",
      faq1a: "No. The VIN identifies the vehicle; the stereo serial identifies the radio unit.",
      faq2q: "Do I pay before the request is created?",
      faq2a: "Yes. Your request and folio are generated only after payment is confirmed.",
      faq3q: "How will I receive my code?",
      faq3a: "We can deliver it using the email or WhatsApp contact provided with your request.",
      help: "Need Help?",
      helpSub: "We’re here for you!",
      whatsapp: "Chat with us on WhatsApp",
      phone: "Call us",
      email: "Email us",
      features: [
        "All major brands",
        "Fast delivery",
        "Secure payments",
        "Professional support",
        "100% reliable",
      ],
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
      heroText:
        "Proporcionamos códigos de seguridad para radios y estéreos de las principales marcas. Rápido, seguro y sencillo.",
      safe: "100% Seguro",
      fast: "Entrega Rápida",
      support: "Soporte Experto",
      request: "Solicitar Mi Código →",
      brandsTitle: "Compatible con las Principales Marcas",
      more: "y muchas más...",
      serialEyebrow: "Antes de Solicitar",
      serialTitle: "Encuentra el Número de Serie del Estéreo",
      serialText:
        "El número de serie identifica el radio exacto instalado en tu vehículo. Es diferente al VIN del vehículo y nos ayuda a proporcionar el código correcto.",
      serial1: "Revisa la pantalla o el menú de ajustes del radio.",
      serial2: "Algunos estéreos lo muestran en una etiqueta del equipo.",
      serial3: "Si no estás seguro, envíanos una foto y te ayudamos.",
      serialCta: "¿Ya tienes el serial? Solicita tu código →",
      works: "Cómo Funciona",
      worksSub: "Obtén tu código de estéreo en solo 3 pasos.",
      stepLabel: "Paso",
      step1: "Envía Tu Información",
      step1Text:
        "Ingresa los datos de tu vehículo y el número de serie del estéreo en nuestro formulario seguro.",
      step2: "Realiza el Pago",
      step2Text:
        "Completa tu compra mediante nuestro sistema de pago seguro.",
      step3: "Recibe Tu Código",
      step3Text:
        "Te enviaremos rápidamente el código por email o WhatsApp.",
      faqTitle: "Preguntas Frecuentes",
      faqSub: "Respuestas rápidas antes de hacer tu solicitud.",
      faq1q: "¿El VIN es lo mismo que el serial del estéreo?",
      faq1a: "No. El VIN identifica el vehículo; el serial del estéreo identifica el radio.",
      faq2q: "¿Pago antes de que se cree la solicitud?",
      faq2a: "Sí. La solicitud y el folio se generan únicamente después de confirmar el pago.",
      faq3q: "¿Cómo recibiré mi código?",
      faq3a: "Podemos entregarlo al correo o WhatsApp que proporciones en tu solicitud.",
      help: "¿Necesitas Ayuda?",
      helpSub: "¡Estamos para ayudarte!",
      whatsapp: "Chatea con nosotros por WhatsApp",
      phone: "Llámanos",
      email: "Envíanos un email",
      features: [
        "Todas las principales marcas",
        "Entrega rápida",
        "Pagos seguros",
        "Soporte profesional",
        "100% confiable",
      ],
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
          <div>
            <div className="text-xl font-black tracking-tight text-white">
              AUTO <span className="text-blue-400">STEREO</span> CODES
            </div>
            <div className="text-[9px] font-medium tracking-[0.28em] text-slate-400">
              UNLOCK YOUR CAR STEREO
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
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${language === "en" ? "bg-white text-slate-900" : "text-white"}`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${language === "es" ? "bg-white text-slate-900" : "text-white"}`}
            >
              🇲🇽 Español
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(37,99,235,0.25),transparent_35%)]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Car Radio Code Service
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
              {t.heroTitle1}<br /><span className="text-blue-400">{t.heroTitle2}</span>
            </h1>
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
            <Image
              src="/stereo-hero-v1.png"
              alt={language === "es" ? "Estéreo de automóvil con pantalla de ingreso de código" : "Car stereo with an unlock code display"}
              width={1536}
              height={1024}
              sizes="(max-width: 1023px) 100vw, 50vw"
              priority
              className="relative h-auto w-full rounded-3xl shadow-2xl shadow-blue-950/30"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-center text-xl font-bold text-slate-800">{t.brandsTitle}</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            {brands.map((brand) => <span key={brand} className="text-sm font-bold tracking-wide text-slate-400">{brand}</span>)}
            <span className="text-sm font-medium text-blue-600">{t.more}</span>
          </div>
        </div>
      </section>

      <section id="serial" className="overflow-hidden bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-blue-100/70 blur-2xl" />
            <Image
              src="/serial-guide.svg"
              alt={language === "es" ? "Guía visual para encontrar el número de serie del estéreo" : "Visual guide to find the stereo serial number"}
              width={1200}
              height={800}
              className="relative h-auto w-full rounded-3xl shadow-2xl shadow-slate-300/60"
            />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">{t.serialEyebrow}</div>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{t.serialTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">{t.serialText}</p>
            <div className="mt-8 space-y-4">
              {[t.serial1, t.serial2, t.serial3].map((item) => (
                <div key={item} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">✓</div>
                  <div className="font-semibold leading-7 text-slate-700">{item}</div>
                </div>
              ))}
            </div>
            <a href="#request-form" className="mt-8 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-blue-600">{t.serialCta}</a>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900">{t.works}</h2>
            <p className="mt-3 text-slate-500">{t.worksSub}</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="p-4 pb-0">
                  <Image src={step.image} alt="" width={800} height={520} className="h-auto w-full rounded-2xl" />
                </div>
                <div className="p-8 pt-6 text-center">
                  <div className="text-xs font-black uppercase tracking-widest text-blue-600">{t.stepLabel} {step.number}</div>
                  <h3 className="mt-3 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-500">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900">{t.faqTitle}</h2>
            <p className="mt-3 text-slate-500">{t.faqSub}</p>
          </div>
          <div className="mt-12 grid gap-5">
            {[[t.faq1q, t.faq1a], [t.faq2q, t.faq2a], [t.faq3q, t.faq3a]].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-bold text-slate-900">{q}</h3>
                <p className="mt-2 leading-7 text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-950 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:px-10">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 md:p-12">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Support</div>
            <h2 className="mt-4 text-4xl font-black text-white">{t.help}</h2>
            <p className="mt-2 text-xl text-slate-400">{t.helpSub}</p>
            <div className="mt-10 space-y-6">
              <div><div className="font-bold text-white">💬 {t.whatsapp}</div><p className="mt-1 text-sm text-slate-500">Quick and easy support.</p></div>
              <div><div className="font-bold text-white">📞 {t.phone}</div><p className="mt-1 text-sm text-slate-500">We’re happy to help.</p></div>
              <div><div className="font-bold text-white">✉️ {t.email}</div><p className="mt-1 text-sm text-slate-500">We’ll reply as soon as possible.</p></div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {t.features.map((feature) => <div key={feature} className="text-sm text-slate-300">✓ {feature}</div>)}
            </div>
          </div>

          <div id="request" className="flex flex-col justify-center rounded-3xl bg-white p-8 md:p-12">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Start Here</div>
            <h2 className="mt-4 text-4xl font-black text-slate-900">{t.requestNow}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-500">{t.requestSub}</p>
            <a href="#request-form" className="mt-8 inline-flex w-fit rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500">{t.goForm}</a>
            <div className="mt-6 text-sm text-slate-500">🔒 {t.secure}</div>
          </div>
        </div>
      </section>

      <CheckoutRequestForm language={language} />

      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="text-lg font-black text-white">AUTO <span className="text-blue-400">STEREO</span> CODES</div>
            <div className="mt-1 text-[9px] tracking-[0.25em] text-slate-500">UNLOCK YOUR CAR STEREO</div>
          </div>
          <div className="text-sm text-slate-500">{t.footer}</div>
          <div className="text-sm font-semibold text-slate-400">{t.tagline}</div>
        </div>
      </footer>
    </main>
  );
}
