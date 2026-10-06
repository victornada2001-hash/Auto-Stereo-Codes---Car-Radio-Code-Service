"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  folio: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  amount: number;
  status: string;
  effective_status: string;
  expires_at: string;
  created_at: string;
  paid_at?: string | null;
  ticket_count: number;
  tickets: number[];
  receipts: Array<{
    id: string;
    original_filename?: string | null;
    ai_status: string;
    extracted_bank?: string | null;
    extracted_amount?: number | null;
    extracted_reference?: string | null;
    extracted_tracking_key?: string | null;
    created_at: string;
  }>;
};

type Tab = "all" | "reserved" | "receipt_uploaded" | "paid" | "unpaid" | "manual_review";

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "reserved", label: "Apartadas" },
  { key: "receipt_uploaded", label: "Comprobantes" },
  { key: "paid", label: "Pagadas" },
  { key: "unpaid", label: "No pagadas" },
  { key: "manual_review", label: "Revisión" },
];

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("raffles-admin-key") || "";
    if (saved) { setKey(saved); void load(saved); }
  }, []);

  async function load(adminKey = key) {
    if (!adminKey) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/reservations", { headers: { "x-admin-key": adminKey }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo cargar el panel.");
      setRows(data);
      sessionStorage.setItem("raffles-admin-key", adminKey);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally { setLoading(false); }
  }

  async function changeStatus(id: string, status: string) {
    setError("");
    const response = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data?.error || "No se pudo actualizar."); return; }
    await load();
  }

  const visible = useMemo(() => rows.filter(r => {
    const state = r.effective_status || r.status;
    return tab === "all" || state === tab;
  }), [rows, tab]);

  if (!rows.length && !loading) {
    return <main className="min-h-screen bg-slate-100 p-5"><div className="mx-auto mt-20 max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl"><div className="text-xs font-black uppercase tracking-widest text-violet-600">Panel privado</div><h1 className="mt-2 text-3xl font-black">Administración</h1><p className="mt-3 text-sm leading-6 text-slate-600">Escribe la clave administrativa configurada para esta plataforma.</p><input type="password" value={key} onChange={e=>setKey(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") void load()}} placeholder="Clave de administración" className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3"/><button onClick={()=>void load()} className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 font-black text-white">Entrar</button>{error&&<div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}<a href="/" className="mt-5 block text-center text-sm font-bold text-slate-500">← Volver a la página</a></div></main>;
  }

  return <main className="min-h-screen bg-slate-100 p-5 lg:p-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-widest text-violet-600">Panel privado</div><h1 className="mt-2 text-4xl font-black">Solicitudes de rifas</h1><p className="mt-2 text-slate-600">Los boletos se muestran únicamente al abrir una solicitud.</p></div><div className="flex gap-2"><button onClick={()=>void load()} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-black">Actualizar</button><a href="/" className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">← Ver página</a></div></div>

    {error&&<div className="mt-5 rounded-xl bg-rose-50 p-4 font-bold text-rose-700">{error}</div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Card label="Apartadas" value={rows.filter(r=>(r.effective_status||r.status)==="reserved").length}/><Card label="Comprobantes" value={rows.filter(r=>(r.effective_status||r.status)==="receipt_uploaded").length}/><Card label="Pagadas" value={rows.filter(r=>(r.effective_status||r.status)==="paid").length}/><Card label="No pagadas" value={rows.filter(r=>(r.effective_status||r.status)==="unpaid").length}/><Card label="Revisión" value={rows.filter(r=>(r.effective_status||r.status)==="manual_review").length}/></div>
    <div className="mt-8 flex flex-wrap gap-2">{tabs.map(t=><button key={t.key} onClick={()=>setTab(t.key)} className={`rounded-xl px-4 py-3 text-sm font-black ${tab===t.key?"bg-violet-600 text-white":"border border-slate-200 bg-white text-slate-600"}`}>{t.label}</button>)}</div>

    <div className="mt-6 space-y-3">{visible.map(r=>{const state=r.effective_status||r.status;return <div key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><button onClick={()=>setOpen(open===r.id?null:r.id)} className="grid w-full gap-3 p-5 text-left md:grid-cols-[1fr_.8fr_.55fr_.55fr_auto] md:items-center"><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Solicitud</div><div className="mt-1 text-xl font-black">{r.folio}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Cliente</div><div className="mt-1 font-bold">{r.customer_name}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Monto</div><div className="mt-1 font-black">${Number(r.amount).toFixed(2)}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Boletos</div><div className="mt-1 font-bold">{r.ticket_count}</div></div><Status status={state}/></button>{open===r.id&&<div className="border-t border-slate-100 bg-slate-50 p-5"><div className="grid gap-5 lg:grid-cols-3"><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Boletos reservados</div><div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-auto">{r.tickets.map(n=><span key={n} className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-black shadow-sm">{n}</span>)}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Contacto</div><div className="mt-2 font-bold">{r.customer_phone}</div><div className="text-sm text-slate-500">{r.customer_email||"Sin correo"}</div><div className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Comprobante</div><div className="mt-2 text-sm font-bold">{r.receipts[0]?.original_filename||"No recibido"}</div><div className="text-xs text-slate-500">IA: {r.receipts[0]?.ai_status||"—"}</div></div><div><div className="text-xs font-black uppercase tracking-widest text-slate-400">Acciones</div><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void changeStatus(r.id,"paid")} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">✓ Marcar pagados</button><button onClick={()=>void changeStatus(r.id,"unpaid")} className="rounded-xl bg-amber-500 px-4 py-3 font-black text-white">No pagada</button><button onClick={()=>void changeStatus(r.id,"manual_review")} className="rounded-xl bg-violet-600 px-4 py-3 font-black text-white">Revisión</button><button onClick={()=>void changeStatus(r.id,"reserved")} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-black">Regresar</button></div></div></div></div>}</div>})}</div>
    {!visible.length&&<div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center font-bold text-slate-500">No hay solicitudes en este apartado.</div>}
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">Después de 2 horas sin pago, la solicitud aparece aquí como “No pagada”, pero no se borra ni libera automáticamente. Tú decides qué hacer con ella.</div>
  </div></main>;
}

function Card({label,value}:{label:string;value:number}){return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-bold text-slate-500">{label}</div><div className="mt-2 text-4xl font-black">{value}</div></div>}
function Status({status}:{status:string}){const map:Record<string,[string,string]>={reserved:["Apartada","bg-sky-100 text-sky-700"],receipt_uploaded:["Comprobante","bg-violet-100 text-violet-700"],paid:["Pagada","bg-emerald-100 text-emerald-700"],unpaid:["No pagada","bg-amber-100 text-amber-800"],manual_review:["Revisión","bg-fuchsia-100 text-fuchsia-700"],cancelled:["Cancelada","bg-slate-200 text-slate-700"]};const item=map[status]||[status,"bg-slate-100 text-slate-700"];return <span className={`justify-self-start rounded-full px-3 py-2 text-xs font-black md:justify-self-end ${item[1]}`}>{item[0]}</span>}
