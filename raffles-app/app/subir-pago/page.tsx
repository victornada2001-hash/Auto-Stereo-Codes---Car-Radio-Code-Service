"use client";

import { FormEvent, useState } from "react";
import { JuniorClassicHeader } from "../components/junior-classic-header";
import { SiteFooter } from "../components/site";

function cleanPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  return digits.slice(0, 10);
}

export default function SubirPagoPage() {
  const [folio, setFolio] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function openReservation(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reservations/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio: folio.trim().toUpperCase(), phone: cleanPhone(phone) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No pudimos abrir tu reserva.");
      window.location.assign(`/mis-boletos/${encodeURIComponent(data.folio)}?token=${encodeURIComponent(data.access_token)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos abrir tu reserva.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101827]">
      <JuniorClassicHeader />
      <section className="bg-[#081b33] px-5 py-14 text-center text-white">
        <div className="text-xs font-black uppercase tracking-[.22em] text-[#f2c94c]">Pago de boletos</div>
        <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Sube tu comprobante</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75">Ingresa el folio de tu apartado y el mismo número de WhatsApp que utilizaste. Te llevaremos directamente a tus boletos para subir el comprobante.</p>
      </section>

      <section className="mx-auto max-w-xl px-5 py-12">
        <form onSubmit={openReservation} className="rounded-3xl border border-[#d4af37]/35 bg-white p-6 shadow-[0_18px_55px_rgba(8,27,51,.12)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">Abrir mi apartado</div>
          <h2 className="mt-2 text-3xl font-black uppercase text-[#081b33]">Folio + teléfono</h2>

          <label className="mt-7 block text-sm font-black uppercase text-[#081b33]">Folio
            <input value={folio} onChange={e => setFolio(e.target.value.toUpperCase())} required placeholder="Ej. SJ-8F2A19" className="mt-2 w-full rounded-xl border-2 border-[#081b33]/15 bg-[#f8fafc] px-4 py-3 font-black uppercase outline-none focus:border-[#d4af37]" />
          </label>

          <label className="mt-4 block text-sm font-black uppercase text-[#081b33]">WhatsApp
            <input value={phone} onChange={e => setPhone(cleanPhone(e.target.value))} required inputMode="numeric" placeholder="10 dígitos" className="mt-2 w-full rounded-xl border-2 border-[#081b33]/15 bg-[#f8fafc] px-4 py-3 font-black outline-none focus:border-[#d4af37]" />
          </label>

          <button disabled={loading} className="mt-6 w-full animate-pulse rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-4 text-lg font-black uppercase text-white shadow-lg disabled:animate-none disabled:opacity-50">{loading ? "Abriendo…" : "Subir mi pago"}</button>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
          <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-500">Por seguridad se necesitan ambos datos. Al entrar verás tus números, estatus, cuentas de pago y el botón para subir el comprobante.</p>
        </form>
      </section>

      <SiteFooter settings={{ whatsapp_number: "6648118609" }} />
    </main>
  );
}
