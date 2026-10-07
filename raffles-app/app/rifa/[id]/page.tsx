"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Discount = { min_qty: number; percent: number };
type Raffle = {
  id: string;
  title: string;
  description?: string | null;
  prize?: string | null;
  ticket_price: number;
  total_tickets: number;
  status: string;
  edition?: string | null;
  cover_image_url?: string | null;
  draw_date?: string | null;
  discounts?: Discount[];
};
type Settings = { brand_name?: string; whatsapp_number?: string; winner_method?: string };
type Account = { id:string; label:string; bank_name:string; beneficiary_name:string; account_number?:string|null; clabe?:string|null };
type Reservation = { reservation_id:string; folio:string; amount:number; discount_percent?:number; expires_at:string };

type Detail = { raffle:Raffle; settings:Settings; payment_accounts:Account[] };

const PAGE_SIZE = 100;

function ticketLabel(value:number,total:number) {
  const digits = Math.max(2, String(Math.max(0,total-1)).length);
  return String(value).padStart(digits,"0");
}

function formatDate(value?:string|null) {
  if (!value) return "Fecha por anunciar";
  return new Intl.DateTimeFormat("es-MX", { dateStyle:"long", timeStyle:"short" }).format(new Date(value));
}

export default function RafflePage() {
  const params = useParams<{id:string}>();
  const raffleId = params.id;
  const [detail,setDetail] = useState<Detail|null>(null);
  const [selected,setSelected] = useState<number[]>([]);
  const [unavailable,setUnavailable] = useState<Set<number>>(new Set());
  const [page,setPage] = useState(1);
  const [manual,setManual] = useState("");
  const [randomQty,setRandomQty] = useState("10");
  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [email,setEmail] = useState("");
  const [reservation,setReservation] = useState<Reservation|null>(null);
  const [receipt,setReceipt] = useState<File|null>(null);
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);

  useEffect(()=>{
    fetch(`/api/raffles/${encodeURIComponent(raffleId)}`,{cache:"no-store"})
      .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data?.error||"No se pudo cargar la rifa.");return data;})
      .then(setDetail)
      .catch(error=>setMessage(error instanceof Error?error.message:"Error al cargar."));
  },[raffleId]);

  useEffect(()=>{
    if(!detail?.raffle) return;
    const from=(page-1)*PAGE_SIZE+1;
    const to=Math.min(page*PAGE_SIZE,detail.raffle.total_tickets);
    fetch(`/api/raffles/${encodeURIComponent(raffleId)}/availability?from=${from}&to=${to}`,{cache:"no-store"})
      .then(r=>r.json()).then(data=>setUnavailable(new Set(data?.unavailable||[]))).catch(()=>setUnavailable(new Set()));
  },[detail?.raffle,page,raffleId]);

  const raffle=detail?.raffle;
  const discounts=Array.isArray(raffle?.discounts)?raffle!.discounts:[];
  const discountPercent=useMemo(()=>discounts.filter(d=>selected.length>=Number(d.min_qty)).sort((a,b)=>Number(b.min_qty)-Number(a.min_qty))[0]?.percent||0,[discounts,selected.length]);
  const estimatedTotal=selected.length*Number(raffle?.ticket_price||0)*(1-discountPercent/100);
  const maxPage=Math.max(1,Math.ceil(Number(raffle?.total_tickets||1)/PAGE_SIZE));
  const pageStart=(page-1)*PAGE_SIZE+1;
  const pageEnd=Math.min(page*PAGE_SIZE,Number(raffle?.total_tickets||1));
  const pageNumbers=useMemo(()=>Array.from({length:Math.max(0,pageEnd-pageStart+1)},(_,i)=>pageStart+i),[pageStart,pageEnd]);
  const canBuy=raffle?.status==="active"&&!reservation;

  function toggleTicket(number:number) {
    if(!canBuy||unavailable.has(number)) return;
    setSelected(current=>current.includes(number)?current.filter(n=>n!==number):[...current,number]);
  }

  function addManual() {
    if(!raffle||!canBuy) return;
    const number=Number(manual.replace(/\D/g,""));
    if(!Number.isInteger(number)||number<1||number>raffle.total_tickets){setMessage("Ese número está fuera de la emisión.");return;}
    if(unavailable.has(number)){setMessage("Ese boleto aparece ocupado en este bloque. Prueba otro número.");return;}
    setSelected(current=>current.includes(number)?current:[...current,number]);
    setManual("");setMessage("");
  }

  async function generateRandom() {
    if(!raffle||!canBuy) return;
    const quantity=Math.max(1,Math.min(Number(randomQty||1),10000));
    setBusy(true);setMessage("");
    try{
      const response=await fetch(`/api/raffles/${encodeURIComponent(raffle.id)}/random`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({quantity})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No se pudieron generar boletos.");
      const tickets=Array.isArray(data?.tickets)?data.tickets.map(Number):[];
      setSelected(tickets);
      setMessage(`La máquina generó ${tickets.length} boleto(s) disponibles.`);
    }catch(error){setMessage(error instanceof Error?error.message:"Error al generar.");}
    finally{setBusy(false);}
  }

  async function reserve() {
    if(!raffle||!selected.length||name.trim().length<2||phone.trim().length<8){setMessage("Escribe tu nombre, teléfono y selecciona al menos un boleto.");return;}
    setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/reservations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({raffleId:raffle.id,name,phone,email,tickets:selected})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No fue posible apartar tus boletos.");
      setReservation(data);
      setMessage(`Reserva creada. Tu folio es ${data.folio}.`);
      setTimeout(()=>document.getElementById("pago")?.scrollIntoView({behavior:"smooth"}),100);
    }catch(error){setMessage(error instanceof Error?error.message:"Error al apartar.");}
    finally{setBusy(false);}
  }

  async function uploadReceipt() {
    if(!reservation||!receipt)return;
    setBusy(true);setMessage("");
    try{
      const form=new FormData();form.append("reservationId",reservation.reservation_id);form.append("folio",reservation.folio);form.append("file",receipt);
      const response=await fetch("/api/receipts",{method:"POST",body:form});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No se pudo subir el comprobante.");
      setMessage("Comprobante recibido. Quedó guardado para verificación.");
    }catch(error){setMessage(error instanceof Error?error.message:"Error al subir comprobante.");}
    finally{setBusy(false);}
  }

  if(!raffle){return <main className="min-h-screen bg-[#0c0c0c] p-8 text-white"><div className="mx-auto max-w-3xl pt-24 text-center"><div className="text-6xl">🎟️</div><h1 className="mt-5 text-3xl font-black">Cargando sorteo…</h1>{message&&<p className="mt-4 text-rose-300">{message}</p>}</div></main>}

  const whatsappText=reservation?encodeURIComponent(`Hola. Mi folio es ${reservation.folio}. Aparté ${selected.length} boleto(s) por $${Number(reservation.amount).toFixed(2)} MXN. Envío mi comprobante.`):"";
  const whatsapp=detail?.settings?.whatsapp_number?.replace(/\D/g,"")||"";

  return <main className="min-h-screen bg-[#f4efe4] text-[#111]">
    <header className="border-b-2 border-black bg-black text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><a href="/" className="font-black uppercase tracking-[.14em]">← {detail?.settings?.brand_name||"Sorteos entre amigos"}</a><a href="/terminos" className="text-sm font-bold text-amber-300">Términos</a></div></header>

    <section className="border-b-2 border-black bg-[#151515] text-white"><div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[1.05fr_.95fr]"><div className="relative min-h-[360px] overflow-hidden bg-[#242424] lg:min-h-[560px]">{raffle.cover_image_url?<img src={raffle.cover_image_url} alt={raffle.title} className="absolute inset-0 h-full w-full object-cover"/>:<div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#3b3b3b,#121212)] text-8xl">🏆</div>}<div className="absolute left-4 top-4 rounded-full border-2 border-black bg-amber-400 px-4 py-2 text-xs font-black uppercase text-black">{raffle.status==="active"?"Sorteo activo":raffle.status==="paused"?"Temporalmente pausado":"Sorteo finalizado"}</div></div><div className="flex flex-col justify-center border-l-0 border-black p-7 lg:border-l-2 lg:p-12"><div className="text-xs font-black uppercase tracking-[.24em] text-amber-400">{raffle.edition?`Emisión ${raffle.edition}`:"Sorteo especial"}</div><h1 className="mt-4 text-4xl font-black uppercase leading-none sm:text-6xl">{raffle.title}</h1><p className="mt-5 text-lg leading-8 text-slate-300">{raffle.description||"Elige tus números y participa."}</p><div className="mt-7 grid grid-cols-2 gap-3"><HeroFact label="Premio" value={raffle.prize||"Por anunciar"}/><HeroFact label="Boleto" value={`$${Number(raffle.ticket_price).toFixed(2)} MXN`}/><HeroFact label="Emisión" value={`${raffle.total_tickets.toLocaleString()} números`}/><HeroFact label="Sorteo" value={formatDate(raffle.draw_date)}/></div></div></div></section>

    {message&&<div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8"><div className="rounded-xl border-2 border-black bg-amber-100 p-4 font-black">{message}</div></div>}

    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="grid gap-7 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111]"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Selección manual</div><h2 className="mt-1 text-3xl font-black uppercase">Elige tus boletos</h2></div><div className="text-sm font-bold text-slate-500">Bloque {page} de {maxPage}</div></div><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><input disabled={!canBuy} value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual();}}} inputMode="numeric" placeholder="Escribe un número exacto" className="min-w-0 rounded-xl border-2 border-black px-4 py-3 font-black"/><button disabled={!canBuy} onClick={addManual} className="rounded-xl bg-black px-5 py-3 font-black text-white disabled:opacity-40">Agregar</button></div>
          <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">{pageNumbers.map(number=>{const occupied=unavailable.has(number);const chosen=selected.includes(number);return <button key={number} disabled={!canBuy||occupied} onClick={()=>toggleTicket(number)} className={`aspect-square rounded-lg border-2 text-[11px] font-black sm:text-xs ${occupied?"border-slate-200 bg-slate-200 text-slate-400 line-through":chosen?"border-black bg-amber-400 text-black":"border-black bg-white hover:bg-amber-100"}`}>{ticketLabel(number,raffle.total_tickets)}</button>})}</div>
          <div className="mt-5 flex items-center justify-between gap-3"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-xl border-2 border-black bg-white px-4 py-2 font-black disabled:opacity-30">← Anterior</button><div className="text-xs font-bold text-slate-500">Gris = ocupado · Amarillo = seleccionado</div><button disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))} className="rounded-xl border-2 border-black bg-white px-4 py-2 font-black disabled:opacity-30">Siguiente →</button></div>
        </div>

        <div className="rounded-3xl border-2 border-black bg-amber-300 p-6 shadow-[5px_5px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em]">Máquina de la suerte</div><h2 className="mt-1 text-3xl font-black uppercase">Genera boletos al azar</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6">Escribe cuántos boletos quieres. La máquina buscará números disponibles y reemplazará tu selección actual.</p><div className="mt-5 flex max-w-md gap-2"><input disabled={!canBuy||busy} type="number" min="1" max="10000" value={randomQty} onChange={e=>setRandomQty(e.target.value)} className="min-w-0 flex-1 rounded-xl border-2 border-black bg-white px-4 py-3 text-lg font-black"/><button disabled={!canBuy||busy} onClick={()=>void generateRandom()} className="rounded-xl bg-black px-5 py-3 font-black text-white disabled:opacity-40">{busy?"Generando…":"Generar"}</button></div><div className="mt-3 text-xs font-bold">Máximo 10,000 números por generación.</div></div>

        <div className="rounded-3xl border-2 border-black bg-white p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black uppercase">Tus números</h2>{!reservation&&selected.length>0&&<button onClick={()=>setSelected([])} className="text-sm font-black text-rose-700">Limpiar selección</button>}</div>{selected.length===0?<p className="mt-4 text-slate-500">Todavía no has seleccionado boletos.</p>:<div className="mt-4 flex max-h-64 flex-wrap gap-2 overflow-auto">{selected.slice().sort((a,b)=>a-b).map(number=><button disabled={!!reservation} onClick={()=>setSelected(s=>s.filter(n=>n!==number))} key={number} className="rounded-lg border-2 border-black bg-[#f4efe4] px-3 py-2 font-mono text-sm font-black">{ticketLabel(number,raffle.total_tickets)} {!reservation&&"×"}</button>)}</div>}</div>
      </div>

      <aside><div className="sticky top-4 rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Resumen</div><div className="mt-4 flex items-end justify-between"><div><div className="text-sm font-bold text-slate-500">Boletos</div><div className="text-5xl font-black">{selected.length}</div></div><div className="text-right"><div className="text-sm font-bold text-slate-500">Total estimado</div><div className="text-3xl font-black">${estimatedTotal.toFixed(2)}</div></div></div>{discountPercent>0&&<div className="mt-4 rounded-xl border-2 border-black bg-emerald-200 p-3 text-sm font-black">Descuento aplicado: {discountPercent}%</div>}{discounts.length>0&&<div className="mt-4 text-xs font-bold text-slate-500">Promociones: {discounts.map(d=>`${d.min_qty}+ = ${d.percent}%`).join(" · ")}</div>}
        {!reservation&&<><div className="mt-5 grid gap-2"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre completo" className="rounded-xl border-2 border-black px-4 py-3"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="rounded-xl border-2 border-black px-4 py-3"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo (opcional)" className="rounded-xl border-2 border-black px-4 py-3"/></div><div className="mt-4 rounded-xl bg-[#f4efe4] p-3 text-xs font-semibold leading-5">Tu apartado dura 2 horas. Si no se confirma el pago, quedará como no pagado para revisión; los números no se liberan automáticamente.</div><button disabled={!canBuy||busy||selected.length===0} onClick={()=>void reserve()} className="mt-5 w-full rounded-xl bg-black px-5 py-4 text-lg font-black text-white disabled:opacity-40">{raffle.status!=="active"?"Rifa no disponible":busy?"Apartando…":"Apartar boletos"}</button></>}
        {reservation&&<div className="mt-5 rounded-2xl border-2 border-black bg-emerald-200 p-4"><div className="text-xs font-black uppercase">Reserva confirmada</div><div className="mt-1 text-2xl font-black">{reservation.folio}</div><div className="mt-2 text-sm font-bold">Total exacto: ${Number(reservation.amount).toFixed(2)} MXN</div></div>}
      </div></aside>
    </div></section>

    {reservation&&<section id="pago" className="border-y-2 border-black bg-black text-white"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-400">Siguiente paso</div><h2 className="mt-2 text-4xl font-black uppercase">Realiza tu transferencia</h2><div className="mt-7 grid gap-5 lg:grid-cols-3"><div className="rounded-2xl border border-white/20 bg-white/5 p-5"><h3 className="text-xl font-black">Cuentas disponibles</h3><div className="mt-4 space-y-4">{detail?.payment_accounts?.length?detail.payment_accounts.map(account=><div key={account.id} className="rounded-xl bg-white/10 p-4 text-sm leading-6"><div className="font-black text-amber-300">{account.label}</div><div><b>Banco:</b> {account.bank_name}</div><div><b>Beneficiario:</b> {account.beneficiary_name}</div>{account.account_number&&<div><b>Cuenta:</b> {account.account_number}</div>}{account.clabe&&<div><b>CLABE:</b> {account.clabe}</div>}</div>):<div className="text-sm text-slate-400">Cuentas pendientes de configurar.</div>}</div><div className="mt-4 font-black text-amber-300">Monto: ${Number(reservation.amount).toFixed(2)} MXN</div></div><div className="rounded-2xl border-2 border-amber-400 bg-amber-400 p-5 text-black"><h3 className="text-xl font-black">Subir comprobante</h3><p className="mt-2 text-sm font-semibold leading-6">Súbelo aquí para asociarlo directamente a tu folio y dejarlo listo para revisión.</p><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setReceipt(e.target.files?.[0]||null)} className="mt-4 block w-full text-sm"/><button disabled={!receipt||busy} onClick={()=>void uploadReceipt()} className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-black text-white disabled:opacity-40">{busy?"Subiendo…":"Enviar comprobante"}</button></div><div className="rounded-2xl border border-white/20 bg-white/5 p-5"><h3 className="text-xl font-black">Enviar por WhatsApp</h3><p className="mt-2 text-sm leading-6 text-slate-300">Si lo prefieres, envía el comprobante con tu folio. La plataforma conserva la reserva para revisión.</p>{whatsapp?<a href={`https://wa.me/${whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-emerald-500 px-4 py-3 font-black text-black">Abrir WhatsApp</a>:<div className="mt-4 text-sm text-amber-300">WhatsApp pendiente de configurar.</div>}</div></div></div></section>}

    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-3xl border-2 border-black bg-amber-300 p-6"><div className="text-xs font-black uppercase tracking-[.2em]">Transparencia</div><h2 className="mt-2 text-3xl font-black uppercase">¿Cómo se elige al ganador?</h2></div><div className="rounded-3xl border-2 border-black bg-white p-6 text-base font-semibold leading-8">{detail?.settings?.winner_method||"Cada rifa publicará previamente la referencia del sorteo oficial utilizado y la regla para determinar el boleto ganador."}<div className="mt-4"><a href="/terminos" className="font-black underline">Leer términos y condiciones completos →</a></div></div></div></section>

    <footer className="border-t-2 border-black bg-[#151515] px-5 py-10 text-center text-sm text-slate-400"><div className="font-black uppercase tracking-[.15em] text-white">{detail?.settings?.brand_name||"Sorteos entre amigos"}</div><div className="mt-3">Consulta siempre las bases, fecha y condiciones publicadas para cada sorteo.</div></footer>
  </main>;
}

function HeroFact({label,value}:{label:string;value:string}) { return <div className="rounded-2xl border border-white/15 bg-white/5 p-4"><div className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{label}</div><div className="mt-1 text-sm font-black leading-5 text-white">{value}</div></div>; }
