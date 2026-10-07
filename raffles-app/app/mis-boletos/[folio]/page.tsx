"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  reserved:"Apartado", receipt_uploaded:"Pago en revisión", paid:"Pagado", unpaid:"No pagado",
  manual_review:"En revisión", cancelled:"Cancelado", ai_reviewed:"En revisión",
};
function dateTime(value?:string|null) {
  if(!value) return "—";
  return new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value));
}
function ticketLabel(value:number,total=99999){return String(value).padStart(Math.max(5,String(total).length),"0");}

export default function MisBoletosPage(){
  const params=useParams<{folio:string}>();
  const search=useSearchParams();
  const folio=params.folio;
  const token=search.get("token")||"";
  const [detail,setDetail]=useState<Detail|null>(null);
  const [receipt,setReceipt]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  const load=useCallback(async()=>{
    if(!folio||!token){setError("Este enlace no contiene el acceso privado a la reserva.");return;}
    try{
      const response=await fetch(`/api/reservations/${encodeURIComponent(folio)}?token=${encodeURIComponent(token)}`,{cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(data?.error||"No se pudo abrir la reserva.");
      setDetail(data);setError("");
    }catch(e){setError(e instanceof Error?e.message:"No se pudo abrir la reserva.");}
  },[folio,token]);

  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    if(!detail||detail.reservation.status==="paid"||detail.reservation.status==="cancelled") return;
    const timer=window.setInterval(()=>void load(),12000);
    return ()=>window.clearInterval(timer);
  },[detail?.reservation.status,load]);

  async function uploadReceipt(){
    if(!detail||!receipt)return;
    setBusy(true);setError("");setNotice("");
    try{
      const form=new FormData();
      form.append("reservationId",detail.reservation.id);form.append("folio",detail.reservation.folio);form.append("file",receipt);
      const response=await fetch("/api/receipts",{method:"POST",body:form});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"No se pudo subir el comprobante.");
      setNotice("Comprobante recibido. Tu pago quedó en revisión.");setReceipt(null);await load();
    }catch(e){setError(e instanceof Error?e.message:"No se pudo subir el comprobante.");}
    finally{setBusy(false);}
  }

  if(!detail)return <main className="min-h-screen bg-[#081b33] text-white"><JuniorClassicHeader whatsapp="6648118609"/><div className="mx-auto max-w-3xl px-5 py-24 text-center"><div className="text-6xl">🎟️</div><h1 className="mt-5 text-3xl font-black uppercase">Cargando tus boletos</h1>{error&&<div className="mt-5 rounded-xl bg-red-500/15 p-4 font-bold text-red-200">{error}</div>}</div></main>;

  const {reservation,raffle,tickets,payment_accounts,receipts}=detail;
  const activeTickets=tickets.filter(t=>!t.released_at);
  const paid=reservation.status==="paid";
  const hasReceipt=receipts.length>0;
  const whatsappText=encodeURIComponent(`Hola Sorteos Junior. Mi folio es ${reservation.folio} y quiero consultar mis boletos.`);

  return <main className="min-h-screen bg-[#f4f7fb] text-[#101827]">
    <JuniorClassicHeader whatsapp="6648118609"/>
    <section className="bg-[#081b33] px-5 py-9 text-center text-white print:bg-white print:text-black"><div className="text-xs font-black uppercase tracking-[.24em] text-[#f2c94c]">Mis boletos</div><h1 className="mt-2 text-4xl font-black uppercase md:text-6xl">{reservation.folio}</h1><div className={`mx-auto mt-4 inline-flex rounded-full px-5 py-2 text-sm font-black uppercase ${paid?"bg-emerald-500 text-white":"bg-[#f2c94c] text-[#081b33]"}`}>{STATUS[reservation.status]||reservation.status}</div></section>

    <section className="mx-auto max-w-6xl px-5 py-8">
      {notice&&<div className="mb-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center font-black text-emerald-800">{notice}</div>}
      {error&&<div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-center font-black text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-white shadow-lg">
          {raffle?.cover_image_url?<img src={raffle.cover_image_url} alt={raffle.title} className="aspect-[16/10] w-full object-cover"/>:<div className="grid aspect-[16/10] place-items-center bg-[#081b33] text-7xl">🏆</div>}
          <div className="p-6"><div className="text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Sorteo</div><h2 className="mt-1 text-2xl font-black uppercase text-[#081b33]">{raffle?.title||"Sorteos Junior"}</h2>{raffle?.prize&&<p className="mt-2 font-bold text-slate-600">Premio: {raffle.prize}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Nombre" value={reservation.customer_name}/><Info label="Estado / país" value={reservation.customer_state||"—"}/><Info label="Fecha apartado" value={dateTime(reservation.created_at)}/><Info label="Monto" value={`$${Number(reservation.amount).toFixed(2)} MXN`}/></div></div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-lg sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Detalle</div><h2 className="mt-1 text-3xl font-black uppercase text-[#081b33]">Tus boletos</h2></div><div className="font-black">{activeTickets.length} número(s)</div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[660px] border-collapse text-sm"><thead><tr className="bg-[#081b33] text-white"><Th>Número</Th><Th>Estatus</Th><Th>Nombre</Th><Th>Estado / país</Th><Th>Fecha apartado</Th></tr></thead><tbody>{tickets.map(ticket=><tr key={ticket.ticket_number} className="border-b border-slate-200"><Td><span className="font-mono font-black">{ticketLabel(ticket.ticket_number)}</span></Td><Td><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${ticket.released_at?"bg-slate-200 text-slate-600":paid?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{ticket.released_at?"Liberado":STATUS[reservation.status]||reservation.status}</span></Td><Td>{reservation.customer_name}</Td><Td>{reservation.customer_state||"—"}</Td><Td>{dateTime(reservation.created_at)}</Td></tr>)}</tbody></table></div></div>
      </div>
    </section>

    {paid?<section className="mx-auto max-w-5xl px-5 pb-12"><div className="overflow-hidden rounded-3xl border-4 border-[#d4af37] bg-white shadow-2xl print:shadow-none"><div className="bg-gradient-to-r from-[#081b33] to-[#0d2747] p-7 text-center text-white"><div className="text-xs font-black uppercase tracking-[.25em] text-[#f2c94c]">Sorteos Junior</div><div className="mt-2 text-4xl font-black uppercase">Boleto confirmado</div><div className="mt-3 inline-flex rounded-full bg-emerald-500 px-5 py-2 font-black">PAGADO ✓</div></div>{raffle?.cover_image_url&&<img src={raffle.cover_image_url} alt={raffle.title} className="max-h-72 w-full object-cover"/>}<div className="p-7"><div className="grid gap-3 sm:grid-cols-3"><Info label="Cliente" value={reservation.customer_name}/><Info label="Estado / país" value={reservation.customer_state||"—"}/><Info label="Pagado" value={dateTime(reservation.paid_at)}/></div><div className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Números confirmados</div><div className="mt-3 flex flex-wrap gap-2">{activeTickets.map(ticket=><span key={ticket.ticket_number} className="rounded-xl bg-[#f2c94c] px-4 py-3 font-mono font-black text-[#081b33]">{ticketLabel(ticket.ticket_number)}</span>)}</div><div className="mt-7 flex flex-wrap gap-3 print:hidden"><button onClick={()=>window.print()} className="rounded-xl bg-[#081b33] px-5 py-3 font-black uppercase text-white">Imprimir / Guardar PDF</button><a href={`https://wa.me/526648118609?text=${whatsappText}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-5 py-3 font-black uppercase text-white">Compartir por WhatsApp</a></div></div></div></section>:<section className="border-y-4 border-[#d4af37] bg-[#081b33] text-white"><div className="mx-auto max-w-6xl px-5 py-12"><div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#f2c94c]">Siguiente paso</div><h2 className="mt-2 text-4xl font-black uppercase">Realiza tu pago</h2><p className="mx-auto mt-3 max-w-2xl text-white/70">Usa una de estas cuentas y sube tu comprobante desde esta página. El folio y tus números ya están guardados.</p></div><div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="grid gap-4 sm:grid-cols-2">{payment_accounts.length?payment_accounts.map(account=><div key={account.id} className="rounded-2xl border border-white/15 bg-white/5 p-5"><div className="text-lg font-black text-[#f2c94c]">{account.label}</div><div className="mt-3 space-y-1 text-sm"><div><b>Banco:</b> {account.bank_name}</div><div><b>Beneficiario:</b> {account.beneficiary_name}</div>{account.account_number&&<div><b>Cuenta:</b> {account.account_number}</div>}{account.clabe&&<div><b>CLABE:</b> {account.clabe}</div>}</div></div>):<div className="rounded-2xl border border-white/15 p-5 text-white/60">Cuentas pendientes de configurar.</div>}</div><div className="rounded-2xl bg-white p-6 text-[#081b33]"><div className="text-xs font-black uppercase tracking-[.18em] text-[#b78c12]">Comprobante</div><h3 className="mt-1 text-2xl font-black uppercase">Sube tu pago aquí</h3>{hasReceipt?<div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 font-black text-amber-800">✓ Ya recibimos un comprobante. Tu pago está en revisión. Puedes subir otro si necesitas reemplazarlo.</div>:<p className="mt-2 text-sm leading-6 text-slate-600">JPG, PNG, WebP o PDF. Se asociará directamente a este folio.</p>}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setReceipt(e.target.files?.[0]||null)} className="mt-5 block w-full rounded-lg border border-slate-300 p-3 text-sm"/><button disabled={!receipt||busy} onClick={()=>void uploadReceipt()} className="mt-4 w-full animate-pulse rounded-xl bg-gradient-to-r from-[#e5483f] to-[#ff8a00] px-5 py-4 font-black uppercase text-white shadow-lg disabled:animate-none disabled:opacity-40">{busy?"Subiendo…":"Subir comprobante de pago"}</button></div></div><div className="mt-6 rounded-xl border border-[#d4af37]/40 bg-black/20 p-4 text-center text-sm font-semibold text-white/75">Tu comprobante queda <b className="text-[#f2c94c]">EN REVISIÓN</b> hasta que administración confirme el pago.</div></div></section>}

    <SiteFooter settings={{whatsapp_number:"6648118609"}} />
  </main>;
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-[#f4f7fb] p-4"><div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">{label}</div><div className="mt-1 font-black text-[#081b33]">{value}</div></div>}
function Th({children}:{children:React.ReactNode}){return <th className="px-3 py-3 text-left text-xs font-black uppercase">{children}</th>}
function Td({children}:{children:React.ReactNode}){return <td className="px-3 py-3 align-top font-semibold">{children}</td>}
