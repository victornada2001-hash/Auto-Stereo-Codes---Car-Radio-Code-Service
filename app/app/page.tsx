"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

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


function RequestForm({ language }: { language: "en" | "es" }) {
  const es = language === "es";
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const inputStyle = "mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    setSaved(false);
    if (!phone && !email) {
      setMessage(es ? "Agrega tu WhatsApp o tu correo electrónico para poder contactarte." : "Add your WhatsApp number or email so we can contact you.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: data.get("serial"), year: data.get("year"), brand: brand === "OTHER" ? data.get("otherBrand") : brand, model: data.get("model"), phone, email, vin: data.get("vin"), language })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.code === "NOT_CONFIGURED"
          ? (es ? "Estamos preparando la recepción de solicitudes. Tus datos todavía no se han guardado; vuelve cuando el servicio esté habilitado." : "We are preparing request submissions. Your details have not been saved yet; please return when the service is ready.")
          : result.code === "INVALID_INPUT"
          ? (es ? "Revisa tus datos. Usa un teléfono válido o un correo electrónico y, si incluyes VIN, escribe sus 17 caracteres." : "Check your details. Use a valid phone number or email and, if provided, a 17-character VIN.")
          : (es ? "No pudimos guardar la solicitud. Inténtalo de nuevo." : "We could not save your request. Please try again."));
        return;
      }
      setSaved(true);
      setMessage((es ? "Solicitud guardada. Tu folio es " : "Request saved. Your reference is ") + result.reference);
      form.reset(); setBrand("");
    } catch {
      setMessage(es ? "No pudimos conectar. Tus datos no se han confirmado; inténtalo de nuevo." : "Unable to connect. Your request has not been confirmed; please try again.");
    } finally { setBusy(false); }
  }
  return (
    <section id="request-form" className="scroll-mt-24 bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-400">{es ? "Solicitud de código" : "Code request"}</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">{es ? "Cuéntanos sobre tu estéreo" : "Tell us about your stereo"}</h2>
        <p className="mt-4 text-slate-300">{es ? "Completa los datos del vehículo y deja al menos un medio de contacto. Los campos con * son obligatorios." : "Enter your vehicle details and at least one contact method. Fields marked * are required."}</p>
        <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="sm:col-span-2">{es ? "Número de serie del estéreo *" : "Stereo serial number *"}<input name="serial" required maxLength={100} autoComplete="off" className={inputStyle} /></label>
          <label>{es ? "Año del vehículo *" : "Vehicle year *"}<input name="year" type="number" required min={1900} max={new Date().getFullYear()+1} placeholder="2018" className={inputStyle} /></label>
          <label>{es ? "Marca del vehículo *" : "Vehicle make *"}<select name="brand" required value={brand} onChange={event => setBrand(event.target.value)} className={inputStyle}><option value="">{es ? "Selecciona una marca" : "Select a make"}</option>{brands.map(make => <option key={make} value={make}>{make}</option>)}<option value="OTHER">{es ? "Otra marca" : "Other make"}</option></select></label>
          {brand === "OTHER" && <label className="sm:col-span-2">{es ? "Escribe la marca *" : "Enter the make *"}<input name="otherBrand" required maxLength={80} className={inputStyle}/></label>}
          <label>{es ? "Modelo del vehículo *" : "Vehicle model *"}<input name="model" required maxLength={100} placeholder="Civic" className={inputStyle} /></label>
          <label>{es ? "VIN (opcional)" : "VIN (optional)"}<input name="vin" minLength={17} maxLength={17} pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}" autoComplete="off" className={inputStyle} /><span className="mt-1 block text-xs text-slate-400">{es ? "17 caracteres; no incluye I, O ni Q." : "17 characters; excludes I, O and Q."}</span></label>
          <label>WhatsApp<input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="+1 555 123 4567" className={inputStyle} /></label>
          <label>{es ? "Correo electrónico" : "Email address"}<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputStyle} /></label>
          <p className="text-sm text-slate-400 sm:col-span-2">{es ? "Usaremos estos datos para atender tu solicitud y contactarte sobre el código." : "We will use these details to handle your request and contact you about your code."}</p>
          {message && <p role={saved ? "status" : "alert"} className={"rounded-xl border p-4 sm:col-span-2 " + (saved ? "border-green-600 bg-green-950 text-green-100" : "border-amber-600 bg-amber-950 text-amber-100")}>{message}</p>}
          <button disabled={busy} type="submit" className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{busy ? (es ? "Enviando…" : "Submitting…") : (es ? "Enviar solicitud" : "Submit request")}</button>
        </form>
      </div>
    </section>
  );
}

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
      works: "How It Works",
      worksSub: "Get your stereo code in just 3 simple steps.",
      step1: "Submit Your Information",
      step1Text:
        "Enter your vehicle details and stereo serial number in our secure form.",
      step2: "Make the Payment",
      step2Text:
        "Complete your purchase using our secure payment system.",
      step3: "Receive Your Code",
      step3Text:
        "We’ll send your stereo code quickly via email or WhatsApp.",
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
      works: "Cómo Funciona",
      worksSub: "Obtén tu código de estéreo en solo 3 pasos.",
      step1: "Envía Tu Información",
      step1Text:
        "Ingresa los datos de tu vehículo y el número de serie del estéreo en nuestro formulario seguro.",
      step2: "Realiza el Pago",
      step2Text:
        "Completa tu compra mediante nuestro sistema de pago seguro.",
      step3: "Recibe Tu Código",
      step3Text:
        "Te enviaremos rápidamente el código por email o WhatsApp.",
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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
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
            <a href="#" className="text-sm text-white transition hover:text-blue-400">
              {t.navHome}
            </a>
            <a href="#request" className="text-sm text-white transition hover:text-blue-400">
              {t.navRequest}
            </a>
            <a href="#serial" className="text-sm text-white transition hover:text-blue-400">
              {t.navSerial}
            </a>
            <a href="#faq" className="text-sm text-white transition hover:text-blue-400">
              {t.navFaq}
            </a>
            <a href="#contact" className="text-sm text-white transition hover:text-blue-400">
              {t.navContact}
            </a>
          </nav>

          <div className="flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "en"
                  ? "bg-white text-slate-900"
                  : "text-white"
              }`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "es"
                  ? "bg-white text-slate-900"
                  : "text-white"
              }`}
            >
              🇲🇽 Español
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(37,99,235,0.25),transparent_35%)]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-6 pb-20 pt-36 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Car Radio Code Service
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
              {t.heroTitle1}
              <br />
              <span className="text-blue-400">{t.heroTitle2}</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              {t.heroText}
            </p>

            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">
                  🛡️
                </div>
                <span className="text-sm font-semibold text-white">{t.safe}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">
                  ⚡
                </div>
                <span className="text-sm font-semibold text-white">{t.fast}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-lg">
                  🎧
                </div>
                <span className="text-sm font-semibold text-white">{t.support}</span>
              </div>
            </div>

            <a
              href="#request"
              className="mt-10 inline-flex rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              {t.request}
            </a>
          </div>

          {/* STEREO IMAGE */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
            <Image
              src="/stereo-hero-v1.png"
              alt={language === "es" ? "Estéreo de automóvil con pantalla de ingreso de código" : "Car stereo with an unlock code display"}
              width={1536}
              height={1024}
              sizes="(max-width: 1023px) 100vw, 50vw"
              preload
              className="relative h-auto w-full rounded-3xl shadow-2xl shadow-blue-950/30"
            />
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-center text-xl font-bold text-slate-800">
            {t.brandsTitle}
          </h2>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-sm font-bold tracking-wide text-slate-400"
              >
                {brand}
              </span>
            ))}
            <span className="text-sm font-medium text-blue-600">{t.more}</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900">{t.works}</h2>
            <p className="mt-3 text-slate-500">{t.worksSub}</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              ["1", "📄", t.step1, t.step1Text],
              ["2", "💳", t.step2, t.step2Text],
              ["3", "✉️", t.step3, t.step3Text],
            ].map(([number, icon, title, text]) => (
              <div
                key={number}
                className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl">
                  {icon}
                </div>

                <div className="mt-5 text-xs font-black uppercase tracking-widest text-blue-600">
                  Step {number}
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-900">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELP + REQUEST */}
      <section id="contact" className="bg-slate-950 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:px-10">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 md:p-12">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Support
            </div>

            <h2 className="mt-4 text-4xl font-black text-white">{t.help}</h2>
            <p className="mt-2 text-xl text-slate-400">{t.helpSub}</p>

            <div className="mt-10 space-y-6">
              <div>
                <div className="font-bold text-white">💬 {t.whatsapp}</div>
                <p className="mt-1 text-sm text-slate-500">
                  Quick and easy support.
                </p>
              </div>

              <div>
                <div className="font-bold text-white">📞 {t.phone}</div>
                <p className="mt-1 text-sm text-slate-500">
                  We’re happy to help.
                </p>
              </div>

              <div>
                <div className="font-bold text-white">✉️ {t.email}</div>
                <p className="mt-1 text-sm text-slate-500">
                  We’ll reply as soon as possible.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {t.features.map((feature) => (
                <div key={feature} className="text-sm text-slate-300">
                  ✓ {feature}
                </div>
              ))}
            </div>
          </div>

          <div
            id="request"
            className="flex flex-col justify-center rounded-3xl bg-white p-8 md:p-12"
          >
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Start Here
            </div>

            <h2 className="mt-4 text-4xl font-black text-slate-900">
              {t.requestNow}
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              {t.requestSub}
            </p>

            <a
              href="#request-form"
              className="mt-8 inline-flex w-fit rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500"
            >
              {t.goForm}
            </a>

            <div className="mt-6 text-sm text-slate-500">
              🔒 {t.secure}
            </div>
          </div>
        </div>
      </section>

      <RequestForm language={language} />

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="text-lg font-black text-white">
              AUTO <span className="text-blue-400">STEREO</span> CODES
            </div>
            <div className="mt-1 text-[9px] tracking-[0.25em] text-slate-500">
              UNLOCK YOUR CAR STEREO
            </div>
          </div>

          <div className="text-sm text-slate-500">{t.footer}</div>

          <div className="text-sm font-semibold text-slate-400">
            {t.tagline}
          </div>
        </div>
      </footer>
    </main>
  );
}