"use client";

import { useState, type FormEvent } from "react";

export default function BrandSerialStarter({ brand, examples }: { brand: string; examples: string[] }) {
  const [serial, setSerial] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = serial.trim();
    if (!value) return;
    sessionStorage.setItem("asc_serial", value);
    sessionStorage.setItem("asc_detected_brand", brand);
    sessionStorage.setItem("asc_radio_family", `${brand} - selección por guía`);
    window.location.assign("/#request-form");
  }

  return (
    <form onSubmit={submit} className="mt-7 rounded-3xl border border-white/15 bg-white p-5 text-slate-950 shadow-2xl md:p-6">
      <div className="text-sm font-black text-slate-900">¿Ya encontraste la serie?</div>
      <p className="mt-1 text-sm leading-6 text-slate-500">Escríbela exactamente como aparece y la llevaremos al formulario de solicitud.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          required
          maxLength={100}
          placeholder={examples[0] ? `Ejemplo: ${examples[0]}` : "Número de serie del estéreo"}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
        <button className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-500">Continuar →</button>
      </div>
    </form>
  );
}
