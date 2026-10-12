"use client";

import { FormEvent, useState } from "react";

const PRICE_USD = 17.99;
const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export default function HondaAcuraHome() {
  const [brand, setBrand] = useState<"Honda" | "Acura">("Honda");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const year = String(data.get("year") || "").trim();
    const model = String(data.get("model") || "").trim();
    const serial = String(data.get("serial") || "").trim();
    const vin = String(data.get("vin") || "").trim().toUpperCase();
    const postalCode = String(data.get("postalCode") || "").trim().toUpperCase();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!year || !model || !serial || !vin || !postalCode || !email || !phone) {
      setMessage("Completa todos los datos para poder procesar tu código Honda o Acura.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial,
          vin,
          postalCode,
          email,
          phone,
          prioritySms: false,
          language: "es",
          detectedBrand: brand,
          radioFamily: `${year} ${model}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        const messages: Record<string, string> = {
          INVALID_EMAIL: "Escribe un correo electrónico válido.",
          EMAIL_UNDELIVERABLE: "No pudimos validar ese correo. Revisa que esté escrito correctamente.",
          INVALID_INPUT: "Revisa los datos del vehículo e inténtalo de nuevo.",
          UNSUPPORTED_BRAND: "Este servicio solo acepta Honda y Acura.",
          NOT_CONFIGURED: "El sistema de pago todavía no está disponible. Inténtalo más tarde.",
        };
        setMessage(messages[result?.code] || "No pudimos iniciar el pago. Revisa tus datos e inténtalo de nuevo.");
        setBusy(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("No pudimos conectar con el sistema de pago. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="text-xl font-black tracking-tight text-[#111827]">AutoStereoCodes</a>
          <a href="#solicitar" className="rounded-xl bg-[#d71920] px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-[#b4151b]">Solicitar código</a>
        </div>
      </header>

      <section className="bg-[#101820] px-5 py-16 text-center text-white md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[.22em] text-red-400">Servicio exclusivo Honda + Acura</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Recupera el código de tu radio Honda o Acura</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Una sola página, un solo servicio. Ingresa los datos del vehículo y del estéreo, realiza el pago y nosotros procesamos tu solicitud.</p>
          <a href="#solicitar" className="mt-8 inline-flex rounded-xl bg-[#d71920] px-7 py-4 font-black uppercase text-white transition hover:bg-[#b4151b]">Comenzar solicitud</a>
          <div className="mx-auto mt-8 flex max-w-md justify-center gap-3">
            <div className="min-w-32 rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-black">HONDA</div>
            <div className="min-w-32 rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-black">ACURA</div>
          </div>
        </div>
      </section>

      <section id="solicitar" className="scroll-mt-24 px-5 py-14 md:py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#d71920]">Solicitud de código</div>
            <h2 className="mt-2 text-3xl font-black">Datos de tu Honda o Acura</h2>
            <p className="mt-3 text-slate-600">Pedimos estos datos desde el inicio para evitar retrasos después del pago.</p>
          </div>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div>
              <div className="mb-2 text-sm font-black">Marca *</div>
              <div className="grid grid-cols-2 gap-3">
                {(["Honda", "Acura"] as const).map(option => (
                  <button key={option} type="button" onClick={() => setBrand(option)} className={`rounded-xl border-2 px-5 py-4 font-black transition ${brand === option ? "border-[#d71920] bg-red-50 text-[#b4151b]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-black">Año *
                <select name="year" required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-[#d71920]">
                  <option value="">Selecciona año</option>
                  {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="text-sm font-black">Modelo *
                <input name="model" required maxLength={80} placeholder={brand === "Honda" ? "Ej. Civic, Accord, CR-V" : "Ej. TL, MDX, RDX"} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              </label>
            </div>

            <label className="text-sm font-black">Serie del estéreo *
              <input name="serial" required maxLength={100} autoCapitalize="characters" placeholder="Ej. U1234 L5678 / número de serie" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
            </label>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="font-black">¿No sabes dónde encontrar la serie?</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">En muchos radios Honda y Acura la serie puede mostrarse manteniendo presionados 1 y 6 mientras enciendes el radio. El procedimiento puede variar según año y unidad.</p>
            </div>

            <label className="text-sm font-black">VIN del vehículo *
              <input name="vin" required minLength={11} maxLength={17} autoCapitalize="characters" placeholder="Número de identificación del vehículo" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-[#d71920]" />
              <span className="mt-1 block text-xs font-medium text-slate-500">Normalmente tiene 17 caracteres y aparece en el tablero, puerta del conductor o documentos del vehículo.</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-black">Código postal / ZIP *
                <input name="postalCode" required maxLength={20} autoComplete="postal-code" placeholder="Ej. 92101" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              </label>
              <label className="text-sm font-black">Teléfono / WhatsApp *
                <input name="phone" type="tel" required autoComplete="tel" maxLength={32} placeholder="Ej. +52 664 123 4567" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              </label>
            </div>

            <label className="text-sm font-black">Correo electrónico *
              <input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              <span className="mt-1 block text-xs font-medium text-slate-500">Aquí podremos identificar y dar seguimiento a tu solicitud.</span>
            </label>

            <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-black text-slate-800">Código de radio Honda / Acura</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">Pago único por solicitud</div>
              </div>
              <span className="text-2xl font-black text-[#b4151b]">${PRICE_USD.toFixed(2)} USD</span>
            </div>

            {message && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-900">{message}</div>}

            <button disabled={busy} type="submit" className="rounded-xl bg-[#d71920] px-6 py-4 text-lg font-black uppercase text-white transition hover:bg-[#b4151b] disabled:cursor-wait disabled:opacity-60">
              {busy ? "Abriendo pago…" : "Continuar al pago"}
            </button>
            <p className="text-center text-xs font-medium leading-5 text-slate-500">Servicio independiente especializado en recuperación de códigos de radio. Honda y Acura son marcas de sus respectivos propietarios.</p>
          </form>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black">Solo Honda y Acura</h2>
          <p className="mt-3 leading-7 text-slate-600">No ofrecemos códigos para Jeep, Chrysler, Nissan, Renault ni otras marcas. Todo el sistema está dedicado a radios Honda y Acura.</p>
        </div>
      </section>

      <footer className="bg-[#101820] px-5 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} AutoStereoCodes · Honda & Acura Radio Codes</footer>
    </main>
  );
}
