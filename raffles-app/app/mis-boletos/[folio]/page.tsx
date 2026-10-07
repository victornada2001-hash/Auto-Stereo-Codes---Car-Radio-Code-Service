"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { JuniorClassicHeader } from "../../components/junior-classic-header";
import { SiteFooter } from "../../components/site";

type Reservation = {
  id:string; raffle_id:string; folio:string; customer_name:string; customer_phone:string;
  customer_state?:string|null; amount:number; status:string; expires_at?:string|null; created_at:string; paid_at?:string|null;
};
type Ticket = { ticket_number:number; released_at?:string|null };
type Raffle = { id:string; title:string; prize?:string|null; cover_image_url?:string|null; draw_date?:string|null; status:string };
type Account = { id:string; label:string; bank_name:string; beneficiary_name:string; account_number?:string|null; clabe?:string|null };
type Receipt = { id:string; original_filename?:string|null; ai_status:string; created_at:string };
type Detail = { reservation:Reservation; tickets:Ticket[]; raffle:Raffle|null; payment_accounts:Account[]; receipts:Receipt[] };

const STATUS:Record<string,string> = {
  reserved:"No pagado", receipt_uploaded:"Pago en revisión", paid:"Pagado", unpaid:"No pagado",
  manual_review:"En revisión", cancelled:"Cancelado", ai_reviewed:"En revisión",
};

function dateTime(value?:string|null) {
  if(!value) return "—";
  return new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}
function ticketLabel(value:number,total=99999){return String(value).padStart(Math.max(5,String(total).length),"0");}

export default function MisBoletosPage(){
  const params=useParams<{folio:string}>();
  const folio=params.folio;
  const [token,setToken]=useState("");
  const [tokenReady,setTokenReady]=useState(false);
  const [detail,setDetail]=useState<Detail|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const fileRef=useRef<HTMLInputElement|null>(null);

  useEffect(()=>{
    const value=new URLSearchParams(window.location.search).get("token")||"";
    setToken(value);
    setTokenReady(true);
  },[]);

  const load=useCallback(async()=>{
    if(!tokenReady)return;
    if(!folio||!token){setError("Este enlace no contiene el acceso privado a la reserva.");return;}
    try{
      const response=await fetch(`/api/reservations/${encodeURIComponent(folio)}?token=${encodeURIComponent(token)}`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(data?.error||"No se pudo abrir la reserva.");
      setDetail(data);setError("");
    }catch(e){setError(e instanceof Error?e.message:"No se pudo abrir la reserva.");}
  },[folio,token,tokenReady]);

  useEffect(()=>{if(tokenReady)void load();},[load,tokenReady]);
  useEffect(()=>{
    if(!detail||detail.reservation.status==="paid"||detail.reservation.status==="cancelled") return;
    const timer=window.setInterval(()=>void load(),10000);
    return ()=>window.clearInterval(timer);
  },[detail,load]);

  async function uploadReceipt(file:File){
    if(!detail||!file)return;
    setBusy(true);setError("");setNotice("");
    try{
      const form=new FormData();
      form.append("reservationId",detail.reservation.id);
      form.append("folio",detail.reservation.folio);
      form.append("file",file);
      const response=await fetch("/api/receipts",{method:"POST",body:form});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No se pudo subir el comprobante.");
      setNotice("Comprobante recibido. Tu pago está en revisión.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"No se pudo subir el comprobante.");}
    finally{setBusy(false); if(fileRef.current) fileRef.current.value="";}
  }

  if(!detail)return <main className="min-h-screen bg-[#081b33] text-white"><JuniorClassicHeader whatsapp="6648118609"/><div className="mx-auto max-w-3xl px-5 py-24 text-center"><div className="text-6xl">🎟️</div><h1 className="mt-5 text-3xl font-black uppercase">Cargando tus boletos</h1>{error&&<div className="mt-5 rounded-xl bg-red-500/15 p-4 font-bold text-red-200">{error}</div>}</div></main>;

  const {reservation,raffle,tickets,payment_accounts,receipts}=detail;
  const activeTickets=tickets.filter(t=>!t.released_at);
  const paid=reservation.status==="paid";
  const hasReceipt=receipts.length>0;
  const statusLabel=STATUS[reservation.status]||reservation.status;
  const whatsappText=encodeURIComponent(`Hola Sorteos Junior. Mi folio es ${reservation.folio} y quiero consultar mis boletos.`);

  return <main className="min-h-screen bg-[#f4f7fb] text-[#101827]">
    <JuniorClassicHeader whatsapp="6648118609"/>

    <section className="mx-auto max-w-4xl px-5 py-8">
      {notice&&<div className="mb-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center font-black text-emerald-800">{notice}</div>}
      {error&&<div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-center font-black text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-3xl border-2 border-[#081b33] bg-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-[.85fr_1.15fr]">
          <div className="bg-[#081b33] text-white">
            {raffle?.cover_image_url?<img src={raffle.cover_image_url} alt={raffle.title} className="aspect-[16/10] w-full object-cover opacity-90"/>:<div className="grid aspect-[16/10] place-items-center text-7xl">🏆</div>}
            <div className="p-6"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Sorteos Junior</div><h1 className="mt-2 text-3xl font-black uppercase">{raffle?.title||"Sorteo"}</h1><div className="mt-3 font-black text-[#f2c94c]">Folio {reservation.folio}</div></div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.18em] text-slate-500">Mini ticket</div><h2 className="mt-1 text-3xl font-black uppercase text-[#081b33]">Tus boletos</h2></div><span className={`rounded-full px-4 py-2 text-xs font-black uppercase text-white ${paid?"bg-emerald-600":reservation.status==="receipt_uploaded"||reservation.status==="manual_review"||reservation.status==="ai_reviewed"?"bg-amber-500":"bg-red-600"}`}>{statusLabel}</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Nombre" value={reservation.customer_name}/><Info label="Estado / país" value={reservation.customer_state||"—"}/><Info label="Fecha de apartado" value={dateTime(reservation.created_at)}/><Info label="Estatus" value={statusLabel}/></div>
            <div className="mt-6 text-xs font-black uppercase tracking-[.18em] text-slate-500">Números</div><div className="mt-3 flex flex-wrap gap-2">{activeTickets.map(ticket=><span key={ticket.ticket_number} className={`rounded-xl px-4 py-3 font-mono font-black ${paid?"bg-emerald-100 text-emerald-800":"bg-[#fff1f0] text-red-700"}`}>{ticketLabel(ticket.ticket_number)}</span>)}</div>
            <div className="mt-6 text-right text-xl font-black text-[#081b33]">Total: ${Number(reservation.amount).toFixed(2)} MXN</div>
          </div>
        </div>
      </div>
    </section>

    {paid?<section className="mx-auto max-w-4xl px-5 pb-12"><div className="overflow-hidden rounded-3xl border-4 border-[#d4af37] bg-white shadow-2xl print:shadow-none"><div className="bg-gradient-to-r from-[#081b33] to-[#0d2747] p-7 text-center text-white"><div className="text-xs font-black uppercase tracking-[.25em] text-[#f2c94c]">Sorteos Junior</div><div className="mt-2 text-4xl font-black uppercase">Boleto confirmado</div><div className="mt-3 inline-flex rounded-full bg-emerald-500 px-5 py-2 font-black">PAGADO ✓</div></div>{raffle?.cover_image_url&&<img src={raffle.cover_image_url} alt={raffle.title} className="max-h-72 w-full object-cover"/>}<div className="p-7"><div className="grid gap-3 sm:grid-cols-3"><Info label="Cliente" value={reservation.customer_name}/><Info label="Estado / país" value={reservation.customer_state||"—"}/><Info label="Fecha de pago" value={dateTime(reservation.paid_at)}/></div><div className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Boletos pagados</div><div className="mt-3 flex flex-wrap gap-2">{activeTickets.map(ticket=><span key={ticket.ticket_number} className="rounded-xl bg-[#f2c94c] px-4 py-3 font-mono font-black text-[#081b33]">{ticketLabel(ticket.ticket_number)}</span>)}</div><div className="mt-7 flex flex-wrap gap-3 print:hidden"><button onClick={()=>window.print()} className="rounded-xl bg-[#081b33] px-5 py-3 font-black uppercase text-white">Imprimir / Guardar PDF</button><a href={`https://wa.me/526648118609?text=${whatsappText}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-5 py-3 font-black uppercase text-white">WhatsApp</a></div></div></div></section>:<section className="border-y-4 border-[#d4af37] bg-[#081b33] text-white"><div className="mx-auto max-w-5xl px-5 py-12"><div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Pago</div><h2 className="mt-2 text-4xl font-black uppercase">Realiza tu pago</h2><p className="mx-auto mt-3 max-w-2xl text-white/70">Usa una de estas cuentas. Después pulsa el botón rojo para elegir tu comprobante; se subirá automáticamente.</p></div><div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="grid gap-4 sm:grid-cols-2">{payment_accounts.length?payment_accounts.map(account=><div key={account.id} className="rounded-2xl border border-white/15 bg-white/5 p-5"><div className="text-lg font-black text-[#f2c94c]">{account.label}</div><div className="mt-3 space-y-1 text-sm"><div><b>Banco:</b> {account.bank_name}</div><div><b>Beneficiario:</b> {account.beneficiary_name}</div>{account.account_number&&<div><b>Cuenta:</b> {account.account_number}</div>}{account.clabe&&<div><b>CLABE:</b> {account.clabe}</div>}</div></div>):<div className="rounded-2xl border border-white/15 p-5 text-white/60">Cuentas pendientes de configurar.</div>}</div><div className="grid place-items-center rounded-2xl bg-white p-6 text-[#081b33]"><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(file)void uploadReceipt(file);}}/><button disabled={busy||hasReceipt} onClick={()=>fileRef.current?.click()} className={`w-full rounded-2xl px-6 py-6 text-lg font-black uppercase text-white shadow-xl transition ${hasReceipt?"bg-emerald-600":"animate-pulse bg-gradient-to-r from-[#e5483f] to-[#ff5b00]"} disabled:animate-none disabled:opacity-90`}>{busy?"Subiendo comprobante…":hasReceipt?"Comprobante recibido ✓":"Sube tu comprobante aquí"}</button>{hasReceipt&&<p className="mt-4 text-center text-sm font-bold text-emerald-700">Tu comprobante ya está registrado y el pago está en revisión.</p>}</div></div></div></section>}

    <SiteFooter settings={{whatsapp_number:"6648118609"}} />
  </main>;
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-[#f4f7fb] p-4"><div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">{label}</div><div className="mt-1 font-black text-[#081b33]">{value}</div></div>}
function Th({children}:{children:ReactNode}){return <th className="px-3 py-3 text-left text-xs font-black uppercase">{children}</th>}
function Td({children}:{children:ReactNode}){return <td className="px-3 py-3 align-top font-semibold">{children}</td>}
