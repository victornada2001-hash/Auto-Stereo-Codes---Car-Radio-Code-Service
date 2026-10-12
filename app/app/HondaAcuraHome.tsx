"use client";

import { FormEvent, useState } from "react";

const PRICE_USD = 17.99;
const YEARS = Array.from({ length: 31 }, (_, i) => String(new Date().getFullYear() - i));

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
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!year || !model || !serial || !email) {
      setMessage("Completa marca, año, modelo, serie del estéreo y correo electrónico.");
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
          email,
          phone: "",
          prioritySms: false,
          language: "es",
          detectedBrand: brand,
          radioFamily: `${year} ${model}`,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        setMessage("No pudimos iniciar el pago. Revisa tus datos e inténtalo de nuevo.");
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-xl font-black tracking-tight text-[#111827]">AutoStereoCodes</a>
          <a href="#solicitar" className="rounded-xl bg-[#d71920] px-5 py-3 text-sm font-black uppercase text-white">Solicitar código</a>
        </div>
      </header>

      <section className="bg-[#101820] px-5 py-20 text-center text-white md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[.22em] text-red-400">Solo Honda y Acura</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Códigos de radio Honda y Acura</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Solicita el código de desbloqueo para el estéreo original de tu Honda o Acura. Sin otras marcas, sin menús complicados y con un proceso directo.</p>
          <div className="mx-auto mt-8 flex max-w-md justify-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-black">HONDA</div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-black">ACURA</div>
          </div>
        </div>
      </section>

      <section id="solicitar" className="scroll-mt-8 px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#d71920]">Solicitud de código</div>
            <h2 className="mt-2 text-3xl font-black">Ingresa los datos de tu vehículo</h2>
            <p className="mt-3 text-slate-600">Atendemos únicamente radios Honda y Acura.</p>
          </div>

          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div>
              <div className="mb-2 text-sm font-black">Marca *</div>
              <div className="grid grid-cols-2 gap-3">
                {(["Honda", "Acura"] as const).map(option => (
                  <button key={option} type="button" onClick={() => setBrand(option)} className={`rounded-xl border-2 px-5 py-4 font-black transition ${brand === option ? "border-[#d71920] bg-red-50 text-[#b4151b]" : "border-slate-200 bg-white text-slate-700"}`}>
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
              <input name="serial" required maxLength={100} placeholder="Ej. U1234 L5678 / número de serie" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
            </label>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="font-black">¿No sabes dónde encontrar la serie?</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">En muchos Honda y Acura puedes obtenerla desde la pantalla del radio manteniendo presionados los botones 1 y 6 mientras enciendes el estéreo. Si tu unidad usa otro procedimiento, podremos revisarlo con los datos que envíes.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-black">Correo electrónico *
                <input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              </label>
              <label className="text-sm font-black">WhatsApp (opcional)
                <input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="664 123 4567" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]" />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-5">
              <span className="font-bold text-slate-700">Código Honda / Acura</span>
              <span className="text-2xl font-black text-[#b4151b]">${PRICE_USD.toFixed(2)} USD</span>
            </div>

            {message && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-900">{message}</div>}

            <button disabled={busy} type="submit" className="rounded-xl bg-[#d71920] px-6 py-4 text-lg font-black uppercase text-white transition hover:bg-[#b4151b] disabled:cursor-wait disabled:opacity-60">
              {busy ? "Abriendo pago…" : "Solicitar código y continuar al pago"}
            </button>
          </form>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-black">Una página dedicada únicamente a Honda y Acura</h2>
          <p className="mt-3 leading-7 text-slate-600">El sitio ya no promociona códigos para otras marcas. Todo el flujo público está enfocado en solicitudes de radio Honda y Acura.</p>
        </div>
      </section>

      <footer className="bg-[#101820] px-5 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} AutoStereoCodes · Honda & Acura Radio Codes</footer>
    </main>
  );
}
