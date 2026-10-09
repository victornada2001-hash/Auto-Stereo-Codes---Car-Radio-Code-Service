"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { JuniorClassicHeader } from "../../components/junior-classic-header";
import { SiteFooter } from "../../components/site";

type Discount = { min_qty: number; percent: number };
type Raffle = {
  id: string;
  title: string;
  description?: string | null;
  prize?: string | null;
  prize_description?: string | null;
  conditions_text?: string | null;
  price_details?: string | null;
  ticket_price: number;
  total_tickets: number;
  status: string;
  edition?: string | null;
  cover_image_url?: string | null;
  draw_date?: string | null;
  discounts?: Discount[];
};
type Settings = { brand_name?: string; whatsapp_number?: string; winner_method?: string };
type Detail = { raffle:Raffle; settings:Settings };
type MachineStage = "choose" | "spinning" | "result";

const PAGE_SIZE = 100;
const PACKAGE_OPTIONS = [1,2,5,10,15,20,50,75,100,200,300,400,500,800,1000,2000,3000];
const MEXICO_STATES = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
  "Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero",
  "Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro",
  "Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz",
  "Yucatán","Zacatecas",
];
const LOCATIONS = ["Estados Unidos","Otro país",...MEXICO_STATES];

function ticketLabel(value:number,total:number) {
  const digits = Math.max(2, String(Math.max(0,total)).length);
  return String(value).padStart(digits,"0");
}
function formatDate(value?:string|null) {
  if (!value) return "Fecha por anunciar";
  return new Intl.DateTimeFormat("es-MX", { dateStyle:"long" }).format(new Date(value));
}
function cleanMexPhone(value:string) {
  let digits = value.replace(/\D/g,"");
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  return digits.slice(0,10);
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
  const [customQty,setCustomQty] = useState("20");
  const [firstName,setFirstName] = useState("");
  const [lastName,setLastName] = useState("");
  const [phone,setPhone] = useState("");
  const [customerState,setCustomerState] = useState("");
  const [knownCustomer,setKnownCustomer] = useState(false);
  const [checkingCustomer,setCheckingCustomer] = useState(false);
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [showMachine,setShowMachine] = useState(false);
  const [machineStage,setMachineStage] = useState<MachineStage>("choose");
  const [machineTickets,setMachineTickets] = useState<number[]>([]);
  const [showCustomer,setShowCustomer] = useState(false);

  useEffect(()=>{
    fetch(`/api/raffles/${encodeURIComponent(raffleId)}`,{cache:"no-store"})
      .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data?.error||"No se pudo cargar el sorteo.");return data;})
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

  useEffect(()=>{
    const clean=cleanMexPhone(phone);
    if(clean.length!==10){setKnownCustomer(false);return;}
    setCheckingCustomer(true);
    const timer=window.setTimeout(()=>{
      fetch(`/api/customers/recognize?phone=${encodeURIComponent(clean)}`,{cache:"no-store"})
        .then(r=>r.json())
        .then(data=>{
          const known=Boolean(data?.known);
          setKnownCustomer(known);
          if(known&&data?.customer){
            setFirstName(String(data.customer.first_name||""));
            setLastName(String(data.customer.last_name||""));
            setCustomerState(String(data.customer.location||""));
          }
        })
        .catch(()=>setKnownCustomer(false))
        .finally(()=>setCheckingCustomer(false));
    },250);
    return ()=>window.clearTimeout(timer);
  },[phone]);

  const raffle=detail?.raffle;
  const discounts=Array.isArray(raffle?.discounts)?raffle!.discounts:[];
  const discountFor=(qty:number)=>discounts.filter(d=>qty>=Number(d.min_qty)).sort((a,b)=>Number(b.min_qty)-Number(a.min_qty))[0]?.percent||0;
  const totalFor=(qty:number)=>qty*Number(raffle?.ticket_price||0)*(1-discountFor(qty)/100);
  const estimatedTotal=totalFor(selected.length);
  const maxPage=Math.max(1,Math.ceil(Number(raffle?.total_tickets||1)/PAGE_SIZE));
  const pageStart=(page-1)*PAGE_SIZE+1;
  const pageEnd=Math.min(page*PAGE_SIZE,Number(raffle?.total_tickets||1));
  const pageNumbers=useMemo(()=>Array.from({length:Math.max(0,pageEnd-pageStart+1)},(_,i)=>pageStart+i),[pageStart,pageEnd]);
  const canBuy=raffle?.status==="active";
  const quantityRequested=Math.max(1,Math.min(Number(randomQty==="custom"?customQty:randomQty)||1,Math.min(10000,Number(raffle?.total_tickets||10000))));

  function toggleTicket(number:number) {
    if(!canBuy||unavailable.has(number)) return;
    setSelected(current=>current.includes(number)?current.filter(n=>n!==number):[...current,number]);
  }
  function addManual() {
    if(!raffle||!canBuy) return;
    const number=Number(manual.replace(/\D/g,""));
    if(!Number.isInteger(number)||number<1||number>raffle.total_tickets){setMessage("Ese número no pertenece a este sorteo.");return;}
    if(unavailable.has(number)){setMessage("Ese boleto ya no está disponible.");return;}
    setSelected(current=>current.includes(number)?current:[...current,number]);
    setManual("");setMessage("");
  }
  function openMachine() {
    if(!canBuy) return;
    setMessage("");
    setMachineStage("choose");
    setMachineTickets([]);
    setShowMachine(true);
  }
  async function generateRandom() {
    if(!raffle||!canBuy) return;
    const quantity=quantityRequested;
    setBusy(true);setMessage("");setMachineStage("spinning");
    try{
      const request=fetch(`/api/raffles/${encodeURIComponent(raffle.id)}/random`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({quantity})});
      const [response]=await Promise.all([request,new Promise(resolve=>setTimeout(resolve,1900))]);
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No se pudieron generar boletos.");
      const tickets=Array.isArray(data?.tickets)?data.tickets.map(Number).filter(Number.isInteger):[];
      if(!tickets.length) throw new Error("No encontramos boletos disponibles para esa cantidad.");
      setSelected(tickets);
      setMachineTickets(tickets);
      setMachineStage("result");
    }catch(error){
      setMachineStage("choose");
      setMessage(error instanceof Error?error.message:"No se pudieron generar boletos.");
    }finally{setBusy(false);}
  }
  function continueFromMachine() { setShowMachine(false);setShowCustomer(true); }

  async function reserve() {
    if(!raffle||!selected.length){setMessage("Selecciona al menos un boleto.");return;}
    const cleanPhone=cleanMexPhone(phone);
    if(!/^\d{10}$/.test(cleanPhone)){setMessage("Escribe un número de WhatsApp válido de 10 dígitos.");return;}
    if(firstName.trim().length<2||lastName.trim().length<2||customerState.length<2){
      setMessage("Completa nombre, apellido y estado o país.");return;
    }
    setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/reservations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        raffleId:raffle.id,firstName:firstName.trim(),lastName:lastName.trim(),phone:cleanPhone,customerState,tickets:selected,
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No fue posible apartar tus boletos.");
      if(!data?.folio||!data?.access_token) throw new Error("La reserva se creó, pero no recibimos el acceso a tus boletos.");
      setShowCustomer(false);
      window.location.assign(`/mis-boletos/${encodeURIComponent(data.folio)}?token=${encodeURIComponent(data.access_token)}`);
    }catch(error){setMessage(error instanceof Error?error.message:"Error al apartar.");setBusy(false);}
  }

  if(!raffle){return <main className="min-h-screen bg-[#081b33] p-8 text-white"><div className="mx-auto max-w-3xl pt-24 text-center"><div className="text-6xl">🎟️</div><h1 className="mt-5 text-3xl font-black">Cargando sorteo…</h1>{message&&<p className="mt-4 text-amber-300">{message}</p>}</div></main>}
  const whatsapp=detail?.settings?.whatsapp_number?.replace(/\D/g,"")||"6648118609";
  const promoQuantities=Array.from(new Set(discounts.map(d=>Number(d.min_qty)).filter(n=>Number.isInteger(n)&&n>0))).sort((a,b)=>a-b);

  return <main className="min-h-screen bg-white text-[#111827]">
    <JuniorClassicHeader whatsapp={whatsapp} />

    <section className="bg-[#081b33] px-5 py-7 text-center text-white">
      <div className="text-xs font-black uppercase tracking-[.25em] text-[#f2c94c]">{raffle.status==="active"?"Sorteo activo":raffle.status==="paused"?"Sorteo pausado":"Sorteo finalizado"}</div>
      <h1 className="mt-2 text-4xl font-black uppercase md:text-6xl">{raffle.title}</h1>
      <div className="mt-2 text-lg font-black uppercase text-white/80">{formatDate(raffle.draw_date)}</div>
    </section>

    <section className="mx-auto max-w-5xl px-5 py-8 text-center">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border-[3px] border-[#d4af37] bg-[#081b33] shadow-xl">
        {raffle.cover_image_url?<img src={raffle.cover_image_url} alt={raffle.title} className="aspect-[16/10] h-full w-full object-cover"/>:<div className="grid aspect-[16/10] place-items-center text-7xl">🏆</div>}
      </div>

      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border-2 border-[#d4af37] bg-[#fffaf0] p-6 text-left shadow-sm">
        <h2 className="text-2xl font-black uppercase text-[#081b33]">Información del premio</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <DetailBlock title="Descripción" text={raffle.prize_description||raffle.description||raffle.prize||"Información por publicar."}/>
          <DetailBlock title="Condiciones" text={raffle.conditions_text||"Consulta las condiciones publicadas para este sorteo."}/>
          <DetailBlock title="Precios" text={raffle.price_details||`Precio base por boleto: $${Number(raffle.ticket_price).toFixed(2)} MXN.`}/>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-[#e5483f] bg-red-50 p-5 text-center text-sm font-black uppercase leading-6 text-[#9b1c1c]">
        El comprobante debe subirse directamente en esta página antes del sorteo. Los comprobantes enviados únicamente por WhatsApp no serán válidos.
      </div>

      {promoQuantities.length>0&&<div className="mx-auto mt-5 max-w-3xl rounded-2xl bg-[#081b33] p-5 text-white"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Promociones por cantidad</div><div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">{promoQuantities.map(q=><div key={q} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3"><div className="font-black">{q.toLocaleString("es-MX")} boletos</div><div className="mt-1 text-xl font-black text-[#f2c94c]">${totalFor(q).toFixed(2)} MXN</div></div>)}</div></div>}

      <div className="mx-auto mt-5 max-w-5xl rounded-2xl border border-[#d4af37]/40 bg-[#081b33] p-5 text-white">
        <div className="text-xs font-black uppercase tracking-[.18em] text-[#f2c94c]">Tu selección</div>
        {selected.length?<div className="mt-3 flex max-h-32 flex-wrap justify-center gap-2 overflow-auto">{selected.slice().sort((a,b)=>a-b).map(n=><button key={n} onClick={()=>toggleTicket(n)} className="rounded-lg border border-[#d4af37] bg-white px-3 py-2 font-mono text-xs font-black text-[#081b33]" title="Toca para quitar">{ticketLabel(n,raffle.total_tickets)} ×</button>)}</div>:<div className="mt-2 text-sm font-semibold text-white/65">Los números que selecciones aparecerán aquí.</div>}
      </div>
    </section>

    <section className="border-y border-[#d4af37]/30 bg-[#0d2747] px-5 py-7 text-white"><div className="mx-auto max-w-4xl text-center"><h2 className="text-3xl font-black uppercase md:text-4xl">Elige tus boletos</h2><p className="mt-2 text-sm font-semibold text-white/70">Busca un número exacto o usa la Máquina de la Suerte para generar boletos disponibles.</p><div className="mx-auto mt-5 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto_auto]"><input disabled={!canBuy} value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addManual();}}} inputMode="numeric" placeholder="Buscar número" className="rounded-xl border-2 border-white/20 bg-white px-4 py-3 font-black text-black outline-none focus:border-[#d4af37]"/><button disabled={!canBuy} onClick={addManual} className="rounded-xl border border-[#d4af37] px-5 py-3 font-black uppercase text-[#f2c94c] disabled:opacity-40">Buscar</button><button disabled={!canBuy} onClick={openMachine} className="rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-3 font-black uppercase text-white shadow-lg disabled:opacity-40">Máquina de la Suerte</button></div></div></section>

    {message&&<div className="mx-auto max-w-6xl px-5 pt-6"><div className="rounded-xl border border-[#d4af37]/50 bg-[#fff8dc] p-4 text-center font-black text-[#5d4700]">{message}</div></div>}

    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase"><span><i className="mr-2 inline-block h-5 w-8 rounded border-2 border-[#081b33] bg-white align-middle"/>Disponible</span><span><i className="mr-2 inline-block h-5 w-8 rounded border-2 border-[#d4af37] bg-[#f2c94c] align-middle"/>Seleccionado</span><span><i className="mr-2 inline-block h-5 w-8 rounded bg-slate-200 align-middle"/>Ocupado</span></div><div className="text-sm font-black text-[#081b33]">Bloque {page} de {maxPage}</div></div>
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15">{pageNumbers.map(number=>{const occupied=unavailable.has(number);const chosen=selected.includes(number);return <button key={number} disabled={!canBuy||occupied} onClick={()=>toggleTicket(number)} className={`rounded border px-1 py-2 text-[10px] font-black transition sm:text-xs ${occupied?"border-slate-200 bg-slate-200 text-slate-400 line-through":chosen?"border-[#b78c12] bg-[#f2c94c] text-[#081b33] shadow":"border-[#081b33] bg-white text-[#081b33] hover:bg-[#eef4fb]"}`}>{ticketLabel(number,raffle.total_tickets)}</button>})}</div>
      <div className="mt-6 flex items-center justify-between gap-3"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border border-[#081b33] px-4 py-2 text-sm font-black disabled:opacity-30">← Anterior</button><button disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))} className="rounded-lg border border-[#081b33] px-4 py-2 text-sm font-black disabled:opacity-30">Siguiente →</button></div>
    </section>

    <section className="sticky bottom-0 z-30 border-t border-[#d4af37]/40 bg-[#081b33]/95 px-4 py-3 text-white backdrop-blur"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.15em] text-[#f2c94c]">Tu selección</div><div className="font-black">{selected.length} boleto(s) · ${estimatedTotal.toFixed(2)} MXN</div></div><button disabled={!selected.length||!canBuy} onClick={()=>setShowCustomer(true)} className="animate-pulse rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-7 py-3 font-black uppercase text-white shadow-lg disabled:animate-none disabled:opacity-40">Apartar boletos</button></div></section>

    <SiteFooter settings={{whatsapp_number:whatsapp}} />

    {showMachine&&<div data-sj-native-machine="true" className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true"><div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><button onClick={()=>setShowMachine(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#e5483f] font-black text-white">×</button><div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#b78c12]">Máquina de la Suerte</div><h2 className="mt-2 text-3xl font-black uppercase text-[#081b33]">Boletos a generar</h2></div>
      {machineStage==="choose"&&<><div className="mt-6 rounded-xl border-2 border-[#d4af37] p-4"><select value={randomQty} onChange={e=>setRandomQty(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-black text-[#081b33]"><option value="custom">Otra cantidad…</option>{PACKAGE_OPTIONS.filter(q=>q<=raffle.total_tickets).map(q=><option key={q} value={q}>{q} boleto{q===1?"":"s"} · ${totalFor(q).toFixed(2)}</option>)}</select>{randomQty==="custom"&&<input type="number" min="1" max={Math.min(10000,raffle.total_tickets)} value={customQty} onChange={e=>setCustomQty(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 font-black" placeholder="Cantidad de boletos"/>}</div><div className="mt-5 rounded-2xl border border-slate-200 bg-[#f7f8fa] p-8 text-center"><div className="text-7xl">🎰</div><div className="mt-3 text-sm font-black uppercase text-slate-500">Total: ${totalFor(quantityRequested).toFixed(2)} MXN</div></div><button disabled={busy} onClick={()=>void generateRandom()} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-4 text-lg font-black uppercase text-white">Generar boletos</button></>}
      {machineStage==="spinning"&&<div className="py-10 text-center"><div className="mx-auto flex max-w-xs justify-center gap-3 rounded-2xl border-4 border-[#d4af37] bg-[#081b33] p-6 text-5xl text-white shadow-xl"><span className="animate-bounce">7</span><span className="animate-pulse text-[#f2c94c]">★</span><span className="animate-bounce [animation-delay:150ms]">7</span></div><div className="mt-5 font-black uppercase text-[#081b33]">Buscando números disponibles…</div></div>}
      {machineStage==="result"&&<div className="mt-6"><div className="rounded-2xl border-2 border-[#d4af37] bg-[#fff8dc] p-5 text-center"><div className="text-sm font-black uppercase text-[#8a6800]">¡Listo!</div><div className="mt-1 text-2xl font-black text-[#081b33]">{machineTickets.length} boleto(s) encontrados</div><div className="mt-4 flex max-h-40 flex-wrap justify-center gap-2 overflow-auto">{machineTickets.slice().sort((a,b)=>a-b).map(n=><span key={n} className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-black text-[#081b33] shadow">{ticketLabel(n,raffle.total_tickets)}</span>)}</div><div className="mt-4 font-black text-[#081b33]">Total: ${totalFor(machineTickets.length).toFixed(2)} MXN</div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={busy} onClick={()=>void generateRandom()} className="rounded-xl border-2 border-[#081b33] bg-white px-4 py-4 font-black uppercase text-[#081b33] disabled:opacity-50">Generar otros {machineTickets.length}</button><button onClick={continueFromMachine} className="rounded-xl bg-[#081b33] px-4 py-4 font-black uppercase text-white">Continuar con estos boletos</button></div></div>}
    </div></div>}

    {showCustomer&&<div className="fixed inset-0 z-[95] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true"><div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><button onClick={()=>setShowCustomer(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#e5483f] font-black text-white">×</button><div className="text-center"><div className="text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Completa tus datos</div><h2 className="mt-2 text-2xl font-black uppercase text-[#081b33]">Datos para apartar</h2><div className="mt-3 text-lg font-black text-[#e5483f]">{selected.length} boleto(s) · ${estimatedTotal.toFixed(2)} MXN</div></div><div className="mt-6 grid gap-3"><input value={phone} onChange={e=>setPhone(cleanMexPhone(e.target.value))} inputMode="numeric" placeholder="WhatsApp obligatorio (10 dígitos)" className="rounded-lg border-2 border-[#081b33] px-4 py-3 font-bold"/>{checkingCustomer&&<div className="text-xs font-bold text-slate-500">Buscando cliente…</div>}{knownCustomer&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-800">✓ Cliente reconocido. Tus datos se llenaron automáticamente.</div>}<input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Nombre" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-bold"/><input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Apellido" className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-bold"/><select value={customerState} onChange={e=>setCustomerState(e.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-bold text-slate-700"><option value="">Selecciona estado / país</option>{LOCATIONS.map(location=><option key={location} value={location}>{location}</option>)}</select></div><button disabled={busy} onClick={()=>void reserve()} className="mt-5 w-full animate-pulse rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-4 text-lg font-black uppercase text-white shadow-lg disabled:animate-none disabled:opacity-50">{busy?"Apartando…":"Apartar boletos"}</button></div></div>}
  </main>;
}

function DetailBlock({title,text}:{title:string;text:string}) {
  return <div><div className="text-xs font-black uppercase tracking-[.18em] text-[#9a7a12]">{title}</div><p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{text}</p></div>;
}