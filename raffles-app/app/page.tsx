"use client";

import { useMemo, useState } from "react";

const ticketCapOptions = [1000, 5000, 10000, 30000, 50000, 100000];
const quickPickOptions = [1, 5, 10, 20, 50, 100];

function formatTicket(n: number, total: number) {
  return String(n).padStart(String(total).length, "0");
}

export default function Home() {
  const [totalTickets, setTotalTickets] = useState(10000);
  const [selected, setSelected] = useState<number[]>([]);
  const [manual, setManual] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [reserved, setReserved] = useState(false);
  const ticketPrice = 10;
  const total = selected.length * ticketPrice;

  const ticketPreview = useMemo(() => selected.slice().sort((a,b)=>a-b), [selected]);

  function addTicket(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > totalTickets) return;
    setSelected((current) => current.includes(value) ? current : [...current, value]);
  }

  function addManual() {
    const value = Number(manual.replace(/\D/g, ""));
    addTicket(value);
    setManual("");
  }

  function randomPick(quantity: number) {
    const used = new Set(selected);
    const available = totalTickets - used.size;
    const target = Math.min(quantity, available);
    while (used.size < selected.length + target) {
      used.add(Math.floor(Math.random() * totalTickets) + 1);
    }
    setSelected(Array.from(used));
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="#inicio" className="text-xl font-black tracking-tight"><span className="text-violet-600">RIFAS</span> ENTRE AMIGOS</a>
          <nav className="hidden gap-6 text-sm font-bold text-slate-600 md:flex">
            <a href="#rifa">Rifa activa</a><a href="#como">Cómo funciona</a><a href="#pago">Pago</a><a href="/admin">Administración</a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-violet-300">Plataforma de rifas moderna</div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">Aparta tus números en segundos.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Selección manual, máquina de la suerte, reserva por 2 horas, comprobante en la plataforma o por WhatsApp y panel administrativo para revisar cada solicitud.</p>
            <a href="#rifa" className="mt-8 inline-flex rounded-2xl bg-violet-600 px-6 py-4 text-lg font-black shadow-lg shadow-violet-950/40 hover:bg-violet-500">Elegir boletos →</a>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-500 p-8 shadow-2xl">
            <div className="text-sm font-black uppercase tracking-[.18em] text-white/75">Rifa destacada</div>
            <div className="mt-3 text-4xl font-black">Premio principal</div>
            <div className="mt-10 rounded-3xl bg-white/15 p-6 backdrop-blur">
              <div className="text-sm font-bold text-white/70">Precio por boleto</div><div className="mt-1 text-5xl font-black">${ticketPrice}</div>
              <div className="mt-5 text-sm leading-6 text-white/85">La cantidad total de números puede configurarse desde 1,000 hasta 100,000 para cada rifa.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="rifa" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_.72fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-widest text-violet-600">Configuración de demostración</div><h2 className="mt-2 text-3xl font-black">Cantidad de boletos de la rifa</h2></div><select value={totalTickets} onChange={e=>{setTotalTickets(Number(e.target.value));setSelected([])}} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-black">{ticketCapOptions.map(x=><option key={x} value={x}>{x.toLocaleString()} boletos</option>)}</select></div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black">Selecciona tu número</h2><p className="mt-2 text-sm leading-6 text-slate-500">Escribe un número entre 1 y {totalTickets.toLocaleString()}.</p>
              <div className="mt-5 flex gap-3"><input value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual()}}} inputMode="numeric" placeholder={`Ej. ${formatTicket(247,totalTickets)}`} className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-4 text-lg font-black outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/><button onClick={addManual} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white">Agregar</button></div>
            </div>

            <div className="rounded-[2rem] border border-violet-100 bg-violet-50 p-6 md:p-8">
              <div className="text-xs font-black uppercase tracking-widest text-violet-600">Máquina de la suerte</div><h2 className="mt-2 text-2xl font-black">Generar boletos al azar</h2><p className="mt-2 text-sm leading-6 text-slate-600">El sistema evita repetir números que ya hayas seleccionado.</p>
              <div className="mt-5 flex flex-wrap gap-3">{quickPickOptions.map(q=><button key={q} onClick={()=>randomPick(q)} className="rounded-xl border border-violet-200 bg-white px-4 py-3 font-black text-violet-700 hover:border-violet-400">+ {q}</button>)}</div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">Tus boletos</h2><button onClick={()=>setSelected([])} className="text-sm font-black text-rose-600">Limpiar</button></div>
              {ticketPreview.length===0?<p className="mt-4 text-slate-500">Todavía no has seleccionado boletos.</p>:<div className="mt-5 flex max-h-56 flex-wrap gap-2 overflow-auto">{ticketPreview.map(n=><button key={n} onClick={()=>setSelected(s=>s.filter(x=>x!==n))} className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm font-black hover:bg-rose-50 hover:text-rose-600">{formatTicket(n,totalTickets)} ×</button>)}</div>}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl md:p-8">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Resumen de reserva</div><div className="mt-5 flex items-end justify-between"><div><div className="text-sm font-bold text-slate-500">Boletos</div><div className="text-4xl font-black">{selected.length}</div></div><div className="text-right"><div className="text-sm font-bold text-slate-500">Total</div><div className="text-4xl font-black text-violet-600">${total.toLocaleString()}</div></div></div>
              <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">Al confirmar, los números quedan apartados durante 2 horas. Si no se verifica el pago, la solicitud pasa al apartado “No pagadas” del panel; no se elimina automáticamente.</div>
              <button disabled={!selected.length} onClick={()=>setReserved(true)} className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 text-lg font-black text-white disabled:opacity-40">Apartar boletos →</button>
            </div>
          </aside>
        </div>
      </section>

      {reserved&&<section id="pago" className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="grid gap-7 lg:grid-cols-3"><div className="rounded-[2rem] border border-slate-200 p-6"><div className="text-3xl">🏦</div><h3 className="mt-4 text-xl font-black">Transferencia bancaria</h3><p className="mt-2 text-sm leading-6 text-slate-600">Muestra cuenta, banco, beneficiario, monto exacto y folio para identificar la reserva.</p></div><div className="rounded-[2rem] border border-violet-200 bg-violet-50 p-6"><div className="text-3xl">📄</div><h3 className="mt-4 text-xl font-black">Subir comprobante aquí</h3><p className="mt-2 text-sm leading-6 text-slate-600">La IA extraerá banco, monto, fecha, referencia y clave de rastreo. El pago no se marca como verificado solo por la imagen.</p><label className="mt-4 block cursor-pointer rounded-xl border border-dashed border-violet-300 bg-white p-4 text-center font-black text-violet-700"><input type="file" accept="image/*,.pdf" className="hidden" onChange={e=>setReceiptName(e.target.files?.[0]?.name||"")}/>{receiptName?`✓ ${receiptName}`:"Seleccionar comprobante"}</label></div><div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6"><div className="text-3xl">💬</div><h3 className="mt-4 text-xl font-black">Enviar por WhatsApp</h3><p className="mt-2 text-sm leading-6 text-slate-600">Envía el folio y el comprobante directamente al número de atención.</p><button className="mt-4 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">Abrir WhatsApp</button></div></div></div></section>}

      <section id="como" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="text-center"><div className="text-xs font-black uppercase tracking-widest text-violet-600">Flujo de compra</div><h2 className="mt-3 text-4xl font-black">Simple para el cliente, controlado para ti</h2></div><div className="mt-10 grid gap-5 md:grid-cols-4">{[["1","Elige números"],["2","Reserva 2 horas"],["3","Paga y sube comprobante"],["4","Pago verificado = boletos pagados"]].map(([n,t])=><div key={n} className="rounded-[2rem] border border-slate-200 bg-white p-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-black text-white">{n}</div><div className="mt-4 font-black">{t}</div></div>)}</div></section>

      <footer className="bg-slate-950 px-5 py-10 text-center text-sm text-slate-400">Plataforma en construcción · Marca provisional · Las rifas deben operar conforme a la regulación aplicable.</footer>
    </main>
  );
}
