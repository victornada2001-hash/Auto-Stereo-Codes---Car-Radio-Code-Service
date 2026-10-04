"use client";

import { useState, type FormEvent } from "react";

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

export default function CheckoutRequestForm({ language }: { language: "en" | "es" }) {
  const es = language === "es";
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inputStyle = "mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();

    if (!phone && !email) {
      setMessage(es ? "Agrega tu WhatsApp o tu correo electrónico para poder contactarte." : "Add your WhatsApp number or email so we can contact you.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial: data.get("serial"),
          year: data.get("year"),
          brand: brand === "OTHER" ? data.get("otherBrand") : brand,
          model: data.get("model"),
          phone,
          email,
          vin: data.get("vin"),
          language,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        setMessage(
          result.code === "INVALID_INPUT"
            ? es
              ? "Revisa tus datos antes de continuar al pago."
              : "Check your details before continuing to payment."
            : result.code === "NOT_CONFIGURED"
              ? es
                ? "El sistema de pagos todavía no está configurado."
                : "The payment system is not configured yet."
              : es
                ? "No pudimos iniciar el pago. Inténtalo de nuevo."
                : "We could not start the payment. Please try again.",
        );
        setBusy(false);
        return;
      }

      window.location.assign(result.url);
    } catch {
      setMessage(es ? "No pudimos conectar con el sistema de pagos. Inténtalo de nuevo." : "Unable to connect to the payment system. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section id="request-form" className="scroll-mt-24 bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-400">{es ? "Solicitud de código" : "Code request"}</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">{es ? "Cuéntanos sobre tu estéreo" : "Tell us about your stereo"}</h2>
        <p className="mt-4 text-slate-300">{es ? "Completa tus datos. Al continuar irás a PayPal para realizar el pago seguro de $23.99 USD; tu solicitud y folio se crearán solamente después de que el pago sea confirmado." : "Enter your details. You will continue to PayPal for the secure $23.99 USD payment; your request and reference will be created only after payment is confirmed."}</p>

        <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="sm:col-span-2">{es ? "Número de serie del estéreo *" : "Stereo serial number *"}<input name="serial" required maxLength={100} autoComplete="off" className={inputStyle} /></label>
          <label>{es ? "Año del vehículo *" : "Vehicle year *"}<input name="year" type="number" required min={1900} max={new Date().getFullYear() + 1} placeholder="2018" className={inputStyle} /></label>
          <label>{es ? "Marca del vehículo *" : "Vehicle make *"}<select name="brand" required value={brand} onChange={(event) => setBrand(event.target.value)} className={inputStyle}><option value="">{es ? "Selecciona una marca" : "Select a make"}</option>{brands.map((make) => <option key={make} value={make}>{make}</option>)}<option value="OTHER">{es ? "Otra marca" : "Other make"}</option></select></label>
          {brand === "OTHER" && <label className="sm:col-span-2">{es ? "Escribe la marca *" : "Enter the make *"}<input name="otherBrand" required maxLength={80} className={inputStyle} /></label>}
          <label>{es ? "Modelo del vehículo *" : "Vehicle model *"}<input name="model" required maxLength={100} placeholder="Civic" className={inputStyle} /></label>
          <label>{es ? "VIN (opcional)" : "VIN (optional)"}<input name="vin" minLength={17} maxLength={17} pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}" autoComplete="off" className={inputStyle} /><span className="mt-1 block text-xs text-slate-400">{es ? "17 caracteres; no incluye I, O ni Q." : "17 characters; excludes I, O and Q."}</span></label>
          <label>WhatsApp<input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="+1 555 123 4567" className={inputStyle} /></label>
          <label>{es ? "Correo electrónico" : "Email address"}<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputStyle} /></label>

          <p className="text-sm text-slate-400 sm:col-span-2">{es ? "No generaremos un folio ni guardaremos una solicitud en nuestra base hasta que PayPal confirme el pago." : "We will not generate a reference or save a request in our database until PayPal confirms payment."}</p>

          {message && <p role="alert" className="rounded-xl border border-amber-600 bg-amber-950 p-4 text-amber-100 sm:col-span-2">{message}</p>}

          <button disabled={busy} type="submit" className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
            {busy ? (es ? "Abriendo PayPal…" : "Opening PayPal…") : (es ? "Continuar a PayPal →" : "Continue to PayPal →")}
          </button>
        </form>
      </div>
    </section>
  );
}
