"use client";

import { useEffect, useMemo, useState } from "react";

const quickPickOptions = [1, 5, 10, 20, 50, 100];

type Raffle = {
  id: string;
  title: string;
  description?: string | null;
  prize?: string | null;
  ticket_price: number;
  total_tickets: number;
  whatsapp_number?: string | null;
  bank_name?: string | null;
  beneficiary_name?: string | null;
  bank_account?: string | null;
  clabe?: string | null;
};

type Reservation = {
  reservation_id: string;
  folio: string;
  amount: number;
  expires_at: string;
};

function formatTicket(n: number, total: number) {
  return String(n).padStart(String(total).length, "0");
}

export default function Home() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [manual, setManual] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/raffles/active", { cache: "no-store" })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "No pudimos cargar la rifa.");
        return data;
      })
      .then(setRaffle)
      .catch(e => setMessage(e instanceof Error ? e.message : "Error al cargar la rifa."));
  }, []);

  const ticketPreview = useMemo(() => selected.slice().sort((a,b)=>a-b), [selected]);
  const totalTickets = raffle?.total_tickets || 10000;
  const ticketPrice = Number(raffle?.ticket_price || 0);
  const total = selected.length * ticketPrice;

  function addTicket(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > totalTickets || reservation) return;
    setSelected(current => current.includes(value) ? current : [...current, value]);
  }

  function addManual() {
    const value = Number(manual.replace(/\D/g, ""));
    addTicket(value);
    setManual("");
  }

  function randomPick(quantity: number) {
    if (reservation) return;
    const used = new Set(selected);
    const target = Math.min(quantity, totalTickets - used.size);
    while (used.size < selected.length + target) used.add(Math.floor(Math.random() * totalTickets) + 1);
    setSelected(Array.from(used));
  }

  async function reserve() {
    if (!raffle || !selected.length || name.trim().length < 2 || phone.trim().length < 8) {
      setMessage("Escribe tu nombre, teléfono y selecciona al menos un boleto.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId: raffle.id, name, phone, email, tickets: selected }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No fue posible apartar los boletos.");
      setReservation(data);
      setMessage(`Reserva creada. Tu folio es ${data.folio}.`);
      setTimeout(() => document.getElementById("pago")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al apartar.");
    } finally { setBusy(false); }
  }

  async function uploadReceipt() {
    if (!reservation || !receipt) return;
    setBusy(true); setMessage("");
    try {
      const form = new FormData();
      form.append("reservationId", reservation.reservation_id);
      form.append("folio", reservation.folio);
      form.append("file", receipt);
      const response = await fetch("/api/receipts", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo subir el comprobante.");
      setMessage("Comprobante recibido. Quedó pendiente de verificación.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error al subir comprobante.");
    } finally { setBusy(false); }
  }

  const whatsappText = reservation ? encodeURIComponent(`Hola. Mi folio es ${reservation.folio}. Aparté ${selected.length} boleto(s) por $${Number(reservation.amount).toFixed(2)} MXN. Envío mi comprobante.`) : "";
  const whatsappHref = raffle?.whatsapp_number && reservation ? `https://wa.me/${raffle.whatsapp_number.replace(/\D/g, "")}?text=${whatsappText}` : "#";

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#inicio" className="text-xl font-black tracking-tight"><span className="text-violet-600">RIFAS</span> ENTRE AMIGOS</a>
          <nav className="hidden gap-6 text-sm font-bold text-slate-600 md:flex"><a href="#rifa">Rifa activa</a><a href="#pago">Pago</a><a href="/admin">Administración</a></nav>
        </div>
      </header>

      <section id="inicio" className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div><div className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-violet-300">Rifa activa</div><h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">{raffle?.title || "Rifas entre amigos"}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{raffle?.description || "Elige tus números, apártalos y envía tu comprobante."}</p><a href="#rifa" className="mt-8 inline-flex rounded-2xl bg-violet-600 px-6 py-4 text-lg font-black">Elegir boletos →</a></div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-500 p-8"><div className="text-sm font-black uppercase tracking-[.18em] text-white/75">Premio</div><div className="mt-3 text-4xl font-black">{raffle?.prize || "Premio principal"}</div><div className="mt-10 rounded-3xl bg-white/15 p-6"><div className="text-sm font-bold text-white/70">Precio por boleto</div><div className="mt-1 text-5xl font-black">${ticketPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div><div className="mt-4 text-sm text-white/85">{totalTickets.toLocaleString()} números disponibles en esta rifa.</div></div></div>
        </div>
      </section>

      <section id="rifa" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        {message && <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-4 font-bold text-violet-900">{message}</div>}
        <div className="grid gap-8 lg:grid-cols-[1fr_.72fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"><h2 className="text-2xl font-black">Selecciona tu número</h2><p className="mt-2 text-sm text-slate-500">Del 1 al {totalTickets.toLocaleString()}.</p><div className="mt-5 flex gap-3"><input disabled={!!reservation} value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual()}}} inputMode="numeric" placeholder={`Ej. ${formatTicket(247,totalTickets)}`} className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-4 text-lg font-black"/><button disabled={!!reservation} onClick={addManual} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-40">Agregar</button></div></div>
            <div className="rounded-[2rem] border border-violet-100 bg-violet-50 p-6 md:p-8"><div className="text-xs font-black uppercase tracking-widest text-violet-600">Máquina de la suerte</div><h2 className="mt-2 text-2xl font-black">Boletos al azar</h2><div className="mt-5 flex flex-wrap gap-3">{quickPickOptions.map(q=><button disabled={!!reservation} key={q} onClick={()=>randomPick(q)} className="rounded-xl border border-violet-200 bg-white px-4 py-3 font-black text-violet-700 disabled:opacity-40">+ {q}</button>)}</div></div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Tus boletos</h2>{!reservation&&<button onClick={()=>setSelected([])} className="text-sm font-black text-rose-600">Limpiar</button>}</div>{ticketPreview.length===0?<p className="mt-4 text-slate-500">Todavía no has seleccionado boletos.</p>:<div className="mt-5 flex max-h-56 flex-wrap gap-2 overflow-auto">{ticketPreview.map(n=><button disabled={!!reservation} key={n} onClick={()=>setSelected(s=>s.filter(x=>x!==n))} className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm font-black">{formatTicket(n,totalTickets)} {!reservation&&"×"}</button>)}</div>}</div>
          </div>

          <aside><div className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl md:p-8"><div className="text-xs font-black uppercase tracking-widest text-slate-400">Resumen</div><div className="mt-5 flex items-end justify-between"><div><div className="text-sm font-bold text-slate-500">Boletos</div><div className="text-4xl font-black">{selected.length}</div></div><div className="text-right"><div className="text-sm font-bold text-slate-500">Total</div><div className="text-4xl font-black text-violet-600">${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div></div></div>
            {!reservation && <><div className="mt-6 grid gap-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre completo" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo (opcional)" className="rounded-xl border border-slate-200 px-4 py-3"/></div><div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">La reserva vence en 2 horas. Si no se confirma, permanecerá registrada como no pagada para revisión administrativa.</div><button disabled={busy||!selected.length} onClick={reserve} className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 text-lg font-black text-white disabled:opacity-40">{busy?"Apartando…":"Apartar boletos →"}</button></>}
            {reservation && <div className="mt-6 rounded-2xl bg-emerald-50 p-5"><div className="text-sm font-bold text-emerald-700">Reserva creada</div><div className="mt-1 text-2xl font-black">{reservation.folio}</div><div className="mt-2 text-sm text-emerald-900">Conserva este folio para identificar tu pago.</div></div>}
          </div></aside>
        </div>
      </section>

      {reservation && <section id="pago" className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><h2 className="mb-7 text-3xl font-black">Completa tu pago</h2><div className="grid gap-7 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 p-6"><div className="text-3xl">🏦</div><h3 className="mt-4 text-xl font-black">Transferencia bancaria</h3><div className="mt-4 space-y-2 text-sm text-slate-700"><p><b>Banco:</b> {raffle?.bank_name || "Por configurar"}</p><p><b>Beneficiario:</b> {raffle?.beneficiary_name || "Por configurar"}</p><p><b>Cuenta:</b> {raffle?.bank_account || "Por configurar"}</p><p><b>CLABE:</b> {raffle?.clabe || "Por configurar"}</p><p><b>Monto exacto:</b> ${Number(reservation.amount).toFixed(2)} MXN</p><p><b>Folio:</b> {reservation.folio}</p></div></div>
        <div className="rounded-[2rem] border border-violet-200 bg-violet-50 p-6"><div className="text-3xl">📄</div><h3 className="mt-4 text-xl font-black">Subir comprobante</h3><p className="mt-2 text-sm leading-6 text-slate-600">Se guarda de forma privada y queda listo para la revisión automática y manual.</p><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setReceipt(e.target.files?.[0]||null)} className="mt-4 block w-full text-sm"/><button disabled={!receipt||busy} onClick={uploadReceipt} className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 font-black text-white disabled:opacity-40">{busy?"Subiendo…":"Enviar comprobante"}</button></div>
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6"><div className="text-3xl">💬</div><h3 className="mt-4 text-xl font-black">WhatsApp</h3><p className="mt-2 text-sm leading-6 text-slate-600">También puedes enviar el comprobante junto con tu folio por WhatsApp.</p>{raffle?.whatsapp_number?<a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">Abrir WhatsApp</a>:<div className="mt-4 text-sm font-bold text-amber-800">Número de WhatsApp pendiente de configurar.</div>}</div>
      </div></div></section>}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-5 md:grid-cols-4">{[["1","Elige números"],["2","Reserva por 2 horas"],["3","Transfiere y sube comprobante"],["4","Pago verificado = boletos pagados"]].map(([n,t])=><div key={n} className="rounded-[2rem] border border-slate-200 bg-white p-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-black text-white">{n}</div><div className="mt-4 font-black">{t}</div></div>)}</div></section>
      <footer className="bg-slate-950 px-5 py-10 text-center text-sm text-slate-400">Plataforma en construcción · Las rifas deben operar conforme a la regulación aplicable.</footer>
    </main>
  );
}
