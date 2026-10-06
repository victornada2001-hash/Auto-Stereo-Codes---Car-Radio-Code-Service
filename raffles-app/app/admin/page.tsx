"use client";

import { useMemo, useState } from "react";

type RequestStatus = "reserved" | "proof_received" | "paid" | "unpaid";
type RequestRow = {
  id:string;
  customer:string;
  phone:string;
  tickets:number[];
  amount:number;
  createdAt:number;
  status:RequestStatus;
  proof?:string;
};

const now=Date.now();
const seed:RequestRow[]=[
  {id:"RIFA-1042",customer:"Cliente ejemplo",phone:"+52 222 555 0184",tickets:[17,244,881],amount:30,createdAt:now-25*60*1000,status:"proof_received",proof:"comprobante-1042.jpg"},
  {id:"RIFA-1041",customer:"Cliente ejemplo 2",phone:"+52 664 555 0192",tickets:[51,52,53,54,55],amount:50,createdAt:now-3*60*60*1000,status:"unpaid"},
  {id:"RIFA-1040",customer:"Cliente pagado",phone:"+52 81 5555 1288",tickets:[905,1201],amount:20,createdAt:now-5*60*60*1000,status:"paid"},
];

const tabs:{key:RequestStatus|"all";label:string}[]=[
  {key:"all",label:"Todas"},{key:"reserved",label:"Apartadas"},{key:"proof_received",label:"Comprobantes"},{key:"paid",label:"Pagadas"},{key:"unpaid",label:"No pagadas"},
];

export default function AdminPage(){
  const [rows,setRows]=useState(seed);
  const [tab,setTab]=useState<RequestStatus|"all">("all");
  const [open,setOpen]=useState<string|null>(null);
  const visible=useMemo(()=>tab==="all"?rows:rows.filter(r=>r.status===tab),[rows,tab]);

  function setStatus(id:string,status:RequestStatus){setRows(current=>current.map(r=>r.id===id?{...r,status}:r));}

  return <main className="min-h-screen bg-slate-100 p-5 lg:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-widest text-violet-600">Panel privado</div><h1 className="mt-2 text-4xl font-black">Solicitudes de rifas</h1><p className="mt-2 text-slate-600">Vista por solicitud. Los boletos se muestran solo al abrir el detalle.</p></div><a href="/" className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">← Ver página</a></div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Apartadas" value={rows.filter(r=>r.status==="reserved").length}/><Card label="Comprobantes" value={rows.filter(r=>r.status==="proof_received").length}/><Card label="Pagadas" value={rows.filter(r=>r.status==="paid").length}/><Card label="No pagadas" value={rows.filter(r=>r.status==="unpaid").length}/>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">{tabs.map(t=><button key={t.key} onClick={()=>setTab(t.key)} className={`rounded-xl px-4 py-3 text-sm font-black ${tab===t.key?"bg-violet-600 text-white":"border border-slate-200 bg-white text-slate-600"}`}>{t.label}</button>)}</div>

      <div className="mt-6 space-y-3">{visible.map(r=>{
        const age=Math.max(0,Math.floor((Date.now()-r.createdAt)/60000));
        return <div key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button onClick={()=>setOpen(open===r.id?null:r.id)} className="grid w-full gap-3 p-5 text-left md:grid-cols-[1fr_.8fr_.55fr_.55fr_auto] md:items-center">
            <div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Solicitud</div><div className="mt-1 text-xl font-black">{r.id}</div></div>
            <div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Cliente</div><div className="mt-1 font-bold">{r.customer}</div></div>
            <div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Monto</div><div className="mt-1 font-black">${r.amount}</div></div>
            <div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Edad</div><div className="mt-1 font-bold">{age<60?`${age} min`:`${Math.floor(age/60)} h`}</div></div>
            <Status status={r.status}/>
          </button>
          {open===r.id&&<div className="border-t border-slate-100 bg-slate-50 p-5"><div className="grid gap-5 lg:grid-cols-3"><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Boletos reservados</div><div className="mt-3 flex flex-wrap gap-2">{r.tickets.map(n=><span key={n} className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-black shadow-sm">{n}</span>)}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Contacto</div><div className="mt-2 font-bold">{r.phone}</div><div className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Comprobante</div><div className="mt-2 font-bold">{r.proof||"No recibido"}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Acciones</div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>setStatus(r.id,"paid")} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">✓ Marcar pagados</button><button onClick={()=>setStatus(r.id,"unpaid")} className="rounded-xl bg-amber-500 px-4 py-3 font-black text-white">Mover a no pagadas</button><button onClick={()=>setStatus(r.id,"reserved")} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black">Regresar a apartadas</button></div></div></div></div>}
        </div>
      })}</div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">Regla prevista: al cumplir 2 horas sin pago verificado, la solicitud se mueve a “No pagadas”. No se borra automáticamente y tú decides después si liberas, extiendes o marcas los boletos como pagados.</div>
    </div>
  </main>;
}

function Card({label,value}:{label:string;value:number}){return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-bold text-slate-500">{label}</div><div className="mt-2 text-4xl font-black">{value}</div></div>}
function Status({status}:{status:RequestStatus}){const map={reserved:["Apartada","bg-sky-100 text-sky-700"],proof_received:["Comprobante","bg-violet-100 text-violet-700"],paid:["Pagada","bg-emerald-100 text-emerald-700"],unpaid:["No pagada","bg-amber-100 text-amber-800"]} as const;return <span className={`justify-self-start rounded-full px-3 py-2 text-xs font-black md:justify-self-end ${map[status][1]}`}>{map[status][0]}</span>}
