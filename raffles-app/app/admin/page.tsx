"use client";

import { useEffect, useMemo, useState } from "react";

type RequestRow = {
  id: string;
  raffle_id: string;
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
  ticket_history?: Array<{ number: number; released_at?: string | null }>;
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

type Discount = { min_qty: number; percent: number };

type RaffleRow = {
  id: string;
  slug?: string | null;
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
  winner_ticket?: number | null;
  winner_name?: string | null;
  winner_draw_reference?: string | null;
  winner_evidence_url?: string | null;
  created_at: string;
};

type Account = {
  id?: string;
  label: string;
  bank_name: string;
  beneficiary_name: string;
  account_number: string;
  clabe: string;
  active: boolean;
  sort_order: number;
};

type Settings = {
  brand_name: string;
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  winner_method: string;
};

type RequestTab = "all" | "reserved" | "receipt_uploaded" | "paid" | "unpaid" | "manual_review" | "cancelled";
type Section = "requests" | "raffles" | "settings";

const requestTabs: { key: RequestTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "reserved", label: "Apartadas" },
  { key: "receipt_uploaded", label: "Comprobantes" },
  { key: "paid", label: "Pagadas" },
  { key: "unpaid", label: "No pagadas" },
  { key: "manual_review", label: "Revisión" },
  { key: "cancelled", label: "Liberadas" },
];

const emptySettings: Settings = {
  brand_name: "Rifas entre amigos",
  whatsapp_number: "",
  facebook_url: "",
  instagram_url: "",
  winner_method: "",
};

const emptyAccount: Account = {
  label: "Cuenta principal",
  bank_name: "",
  beneficiary_name: "",
  account_number: "",
  clabe: "",
  active: true,
  sort_order: 0,
};

const emptyRaffleForm = {
  title: "",
  description: "",
  prize: "",
  edition: "",
  ticket_price: "",
  total_tickets: "10000",
  draw_date: "",
  discounts: [] as Discount[],
};

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState<Section>("requests");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [raffles, setRaffles] = useState<RaffleRow[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState<Account>(emptyAccount);
  const [requestTab, setRequestTab] = useState<RequestTab>("all");
  const [openRequest, setOpenRequest] = useState<string | null>(null);
  const [raffleForm, setRaffleForm] = useState(emptyRaffleForm);
  const [editingRaffleId, setEditingRaffleId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("raffles-admin-key") || "";
    if (saved) {
      setAdminKey(saved);
      void loadAll(saved);
    }
  }, []);

  async function api(path: string, init: RequestInit = {}, key = adminKey) {
    const headers = new Headers(init.headers);
    headers.set("x-admin-key", key);
    return fetch(path, { ...init, headers, cache: "no-store" });
  }

  async function loadAll(key = adminKey) {
    if (!key) return;
    setLoading(true);
    setError("");
    try {
      const [requestResponse, raffleResponse, settingsResponse] = await Promise.all([
        api("/api/admin/reservations", {}, key),
        api("/api/admin/raffles", {}, key),
        api("/api/admin/settings", {}, key),
      ]);
      const requestData = await requestResponse.json();
      const raffleData = await raffleResponse.json();
      const settingsData = await settingsResponse.json();
      if (!requestResponse.ok) throw new Error(requestData?.error || "No se pudo abrir solicitudes.");
      if (!raffleResponse.ok) throw new Error(raffleData?.error || "No se pudieron cargar rifas.");
      if (!settingsResponse.ok) throw new Error(settingsData?.error || "No se pudo cargar configuración.");

      setRequests(requestData);
      setRaffles(raffleData);
      setSettings({ ...emptySettings, ...(settingsData.settings || {}) });
      setAccounts(settingsData.accounts || []);
      setAuthenticated(true);
      sessionStorage.setItem("raffles-admin-key", key);
    } catch (e) {
      setAuthenticated(false);
      setError(e instanceof Error ? e.message : "Error al abrir el panel.");
    } finally {
      setLoading(false);
    }
  }

  async function changeRequestStatus(id: string, status: string) {
    setError(""); setNotice("");
    const response = await api("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo actualizar la solicitud.");
    setNotice("Solicitud actualizada.");
    await loadAll();
  }

  async function releaseTickets(id: string) {
    if (!window.confirm("¿Liberar estos números para que puedan volver a venderse? La solicitud y su historial NO se borrarán.")) return;
    const response = await api("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "release", reason: "Liberación manual desde panel" }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudieron liberar los boletos.");
    setNotice("Boletos liberados; el historial quedó conservado.");
    await loadAll();
  }

  function editRaffle(raffle: RaffleRow) {
    setEditingRaffleId(raffle.id);
    setRaffleForm({
      title: raffle.title || "",
      description: raffle.description || "",
      prize: raffle.prize || "",
      edition: raffle.edition || "",
      ticket_price: String(raffle.ticket_price || ""),
      total_tickets: String(raffle.total_tickets || 10000),
      draw_date: toLocalInput(raffle.draw_date),
      discounts: Array.isArray(raffle.discounts) ? raffle.discounts : [],
    });
    setCoverFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetRaffleForm() {
    setEditingRaffleId(null);
    setRaffleForm(emptyRaffleForm);
    setCoverFile(null);
  }

  async function saveRaffle() {
    setError(""); setNotice("");
    const payload = {
      ...raffleForm,
      ticket_price: Number(raffleForm.ticket_price),
      total_tickets: Number(raffleForm.total_tickets),
      draw_date: raffleForm.draw_date || null,
    };
    const response = await api("/api/admin/raffles", {
      method: editingRaffleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingRaffleId ? { id: editingRaffleId, action: "update", ...payload } : payload),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo guardar la rifa.");
    const raffleId = editingRaffleId || data?.raffle?.id;

    if (coverFile && raffleId) {
      const form = new FormData();
      form.append("raffleId", raffleId);
      form.append("file", coverFile);
      const imageResponse = await api("/api/admin/raffles/image", { method: "POST", body: form });
      const imageData = await imageResponse.json();
      if (!imageResponse.ok) return setError(imageData?.error || "La rifa se guardó, pero no la imagen.");
    }

    setNotice(editingRaffleId ? "Rifa actualizada." : "Rifa creada como borrador.");
    resetRaffleForm();
    await loadAll();
  }

  async function raffleAction(id: string, action: "activate" | "pause" | "finalize") {
    setError(""); setNotice("");
    const payload: Record<string, unknown> = { id, action };
    if (action === "finalize") {
      const ticket = window.prompt("Número del boleto ganador (puedes dejarlo vacío si aún no lo publicarás):", "");
      if (ticket === null) return;
      const name = window.prompt("Nombre del ganador (opcional):", "") ?? "";
      const reference = window.prompt("Referencia del sorteo de Lotería Nacional / fecha (opcional):", "") ?? "";
      payload.winner_ticket = ticket;
      payload.winner_name = name;
      payload.winner_draw_reference = reference;
    }
    const response = await api("/api/admin/raffles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo cambiar el estado.");
    setNotice(action === "activate" ? "Rifa iniciada." : action === "pause" ? "Rifa pausada." : "Rifa finalizada y conservada en el historial.");
    await loadAll();
  }

  function addDiscount() {
    setRaffleForm(current => ({ ...current, discounts: [...current.discounts, { min_qty: 10, percent: 5 }] }));
  }

  function updateDiscount(index: number, field: keyof Discount, value: number) {
    setRaffleForm(current => ({ ...current, discounts: current.discounts.map((d, i) => i === index ? { ...d, [field]: value } : d) }));
  }

  async function saveSettings() {
    setError(""); setNotice("");
    const response = await api("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo guardar configuración.");
    setNotice("Configuración general guardada.");
    await loadAll();
  }

  async function saveAccount(account: Account) {
    setError(""); setNotice("");
    const response = await api("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo guardar la cuenta.");
    setNotice(account.id ? "Cuenta actualizada." : "Cuenta agregada.");
    if (!account.id) setNewAccount(emptyAccount);
    await loadAll();
  }

  async function toggleAccount(account: Account) {
    if (!account.id) return;
    const response = await api("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleAccountId: account.id, active: !account.active }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data?.error || "No se pudo cambiar la cuenta.");
    setNotice(!account.active ? "Cuenta activada." : "Cuenta retirada de la página sin borrar historial.");
    await loadAll();
  }

  const visibleRequests = useMemo(() => requests.filter(row => {
    const state = row.effective_status || row.status;
    return requestTab === "all" || state === requestTab;
  }), [requests, requestTab]);

  if (!authenticated) {
    return <main className="min-h-screen bg-[#0b0d10] p-5 text-white">
      <div className="mx-auto mt-20 max-w-md rounded-[2rem] border border-white/10 bg-[#14181d] p-8 shadow-2xl">
        <div className="text-xs font-black uppercase tracking-[.22em] text-amber-400">Panel privado</div>
        <h1 className="mt-3 text-4xl font-black">Control de sorteos</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Administra rifas, solicitudes, cuentas de pago y configuración general.</p>
        <input type="password" value={adminKey} onChange={e=>setAdminKey(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") void loadAll()}} placeholder="Clave de administración" className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-400"/>
        <button onClick={()=>void loadAll()} disabled={loading} className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 font-black text-black disabled:opacity-50">{loading?"Entrando…":"Entrar"}</button>
        {error&&<div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm font-bold text-rose-300">{error}</div>}
        <a href="/" className="mt-5 block text-center text-sm font-bold text-slate-500">← Volver a la página</a>
      </div>
    </main>;
  }

  return <main className="min-h-screen bg-[#f3efe6] text-[#121212]">
    <header className="border-b-4 border-black bg-amber-400">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
        <div><div className="text-xs font-black uppercase tracking-[.2em]">Panel privado</div><h1 className="text-3xl font-black uppercase">Centro de control</h1></div>
        <div className="flex gap-2"><button onClick={()=>void loadAll()} className="rounded-xl border-2 border-black bg-white px-4 py-3 font-black">Actualizar</button><a href="/" className="rounded-xl bg-black px-4 py-3 font-black text-white">Ver página</a></div>
      </div>
    </header>

    <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
      <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-black bg-white p-2">
        {(["requests","raffles","settings"] as Section[]).map(item => <button key={item} onClick={()=>setSection(item)} className={`rounded-xl px-5 py-3 text-sm font-black uppercase ${section===item?"bg-black text-white":"hover:bg-slate-100"}`}>{item==="requests"?"Solicitudes":item==="raffles"?"Rifas":"Configuración"}</button>)}
      </div>
      {error&&<div className="mt-5 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 font-bold text-rose-700">{error}</div>}
      {notice&&<div className="mt-5 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 font-bold text-emerald-800">{notice}</div>}

      {section === "requests" && <RequestsSection rows={requests} visible={visibleRequests} tab={requestTab} setTab={setRequestTab} open={openRequest} setOpen={setOpenRequest} onStatus={changeRequestStatus} onRelease={releaseTickets}/>} 
      {section === "raffles" && <RafflesSection raffles={raffles} form={raffleForm} setForm={setRaffleForm} editingId={editingRaffleId} coverFile={coverFile} setCoverFile={setCoverFile} onSave={saveRaffle} onReset={resetRaffleForm} onEdit={editRaffle} onAction={raffleAction} onAddDiscount={addDiscount} onUpdateDiscount={updateDiscount}/>} 
      {section === "settings" && <SettingsSection settings={settings} setSettings={setSettings} accounts={accounts} setAccounts={setAccounts} newAccount={newAccount} setNewAccount={setNewAccount} onSaveSettings={saveSettings} onSaveAccount={saveAccount} onToggleAccount={toggleAccount}/>} 
    </div>
  </main>;
}

function RequestsSection({rows,visible,tab,setTab,open,setOpen,onStatus,onRelease}:{rows:RequestRow[];visible:RequestRow[];tab:RequestTab;setTab:(t:RequestTab)=>void;open:string|null;setOpen:(id:string|null)=>void;onStatus:(id:string,status:string)=>Promise<void>;onRelease:(id:string)=>Promise<void>}) {
  return <section className="mt-7">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <Metric label="Apartadas" value={rows.filter(r=>(r.effective_status||r.status)==="reserved").length}/><Metric label="Comprobantes" value={rows.filter(r=>(r.effective_status||r.status)==="receipt_uploaded").length}/><Metric label="Pagadas" value={rows.filter(r=>(r.effective_status||r.status)==="paid").length}/><Metric label="No pagadas" value={rows.filter(r=>(r.effective_status||r.status)==="unpaid").length}/><Metric label="Revisión" value={rows.filter(r=>(r.effective_status||r.status)==="manual_review").length}/><Metric label="Liberadas" value={rows.filter(r=>(r.effective_status||r.status)==="cancelled").length}/>
    </div>
    <div className="mt-6 flex flex-wrap gap-2">{requestTabs.map(item=><button key={item.key} onClick={()=>setTab(item.key)} className={`rounded-xl border-2 border-black px-4 py-2 text-sm font-black ${tab===item.key?"bg-black text-white":"bg-white"}`}>{item.label}</button>)}</div>
    <div className="mt-5 space-y-3">{visible.map(row=>{const state=row.effective_status||row.status;return <div key={row.id} className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#111]"><button onClick={()=>setOpen(open===row.id?null:row.id)} className="grid w-full gap-3 p-5 text-left md:grid-cols-[1fr_.8fr_.55fr_.55fr_auto] md:items-center"><div><Mini>Solicitud</Mini><div className="mt-1 text-xl font-black">{row.folio}</div></div><div><Mini>Cliente</Mini><div className="mt-1 font-bold">{row.customer_name}</div></div><div><Mini>Monto</Mini><div className="mt-1 font-black">${Number(row.amount).toFixed(2)}</div></div><div><Mini>Boletos</Mini><div className="mt-1 font-bold">{row.tickets.length || row.ticket_count}</div></div><Status status={state}/></button>{open===row.id&&<div className="border-t-2 border-black bg-[#faf7ef] p-5"><div className="grid gap-6 lg:grid-cols-3"><div><Mini>Boletos actualmente bloqueados</Mini><div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-auto">{row.tickets.length?row.tickets.map(n=><span key={n} className="rounded-lg border border-black bg-white px-3 py-2 font-mono text-sm font-black">{n}</span>):<span className="text-sm font-bold text-slate-500">Ya fueron liberados.</span>}</div></div><div><Mini>Contacto</Mini><div className="mt-2 font-bold">{row.customer_phone}</div><div className="text-sm text-slate-500">{row.customer_email||"Sin correo"}</div><div className="mt-4"><Mini>Comprobante</Mini><div className="mt-2 text-sm font-bold">{row.receipts[0]?.original_filename||"No recibido"}</div><div className="text-xs text-slate-500">IA: {row.receipts[0]?.ai_status||"—"}</div></div></div><div><Mini>Acciones</Mini><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void onStatus(row.id,"paid")} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">✓ Pagados</button><button onClick={()=>void onStatus(row.id,"unpaid")} className="rounded-xl bg-amber-500 px-4 py-3 font-black">No pagada</button><button onClick={()=>void onStatus(row.id,"manual_review")} className="rounded-xl bg-violet-600 px-4 py-3 font-black text-white">Revisión</button>{row.tickets.length>0&&<button onClick={()=>void onRelease(row.id)} className="rounded-xl border-2 border-rose-600 bg-white px-4 py-3 font-black text-rose-700">Liberar números</button>}</div></div></div></div>}</div>})}</div>
    {!visible.length&&<div className="mt-5 rounded-2xl border-2 border-dashed border-black/30 bg-white p-10 text-center font-bold text-slate-500">No hay solicitudes en este apartado.</div>}
    <div className="mt-7 rounded-2xl border-2 border-black bg-amber-100 p-5 text-sm font-semibold leading-6">Al pasar 2 horas sin pago, la solicitud se muestra como “No pagada”. Los números no se liberan solos. Tú decides cuándo liberarlos y el historial de la solicitud se conserva.</div>
  </section>;
}

function RafflesSection({raffles,form,setForm,editingId,coverFile,setCoverFile,onSave,onReset,onEdit,onAction,onAddDiscount,onUpdateDiscount}:{raffles:RaffleRow[];form:typeof emptyRaffleForm;setForm:React.Dispatch<React.SetStateAction<typeof emptyRaffleForm>>;editingId:string|null;coverFile:File|null;setCoverFile:(f:File|null)=>void;onSave:()=>Promise<void>;onReset:()=>void;onEdit:(r:RaffleRow)=>void;onAction:(id:string,action:"activate"|"pause"|"finalize")=>Promise<void>;onAddDiscount:()=>void;onUpdateDiscount:(index:number,field:keyof Discount,value:number)=>void}) {
  return <section className="mt-7 grid gap-7 xl:grid-cols-[.9fr_1.1fr]">
    <div className="h-fit rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111] xl:sticky xl:top-5">
      <div className="text-xs font-black uppercase tracking-[.2em] text-amber-600">{editingId?"Editar rifa":"Nueva rifa"}</div><h2 className="mt-2 text-3xl font-black uppercase">{editingId?"Actualizar publicación":"Crear sorteo"}</h2>
      <div className="mt-5 grid gap-3"><Field value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título de la rifa"/><Field value={form.prize} onChange={v=>setForm(f=>({...f,prize:v}))} placeholder="Premio principal"/><Field value={form.edition} onChange={v=>setForm(f=>({...f,edition:v}))} placeholder="Emisión / edición (ej. 025)"/><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Descripción de la rifa" className="min-h-28 rounded-xl border-2 border-black px-4 py-3"/><div className="grid gap-3 sm:grid-cols-2"><Field type="number" value={form.ticket_price} onChange={v=>setForm(f=>({...f,ticket_price:v}))} placeholder="Precio por boleto"/><Field type="number" value={form.total_tickets} onChange={v=>setForm(f=>({...f,total_tickets:v}))} placeholder="Emisión total"/></div><label className="text-sm font-black">Fecha del sorteo<input type="datetime-local" value={form.draw_date} onChange={e=>setForm(f=>({...f,draw_date:e.target.value}))} className="mt-1 w-full rounded-xl border-2 border-black px-4 py-3 font-normal"/></label><label className="text-sm font-black">Foto de portada<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCoverFile(e.target.files?.[0]||null)} className="mt-1 block w-full rounded-xl border-2 border-black bg-[#faf7ef] p-3 font-normal"/></label>{coverFile&&<div className="text-xs font-bold text-emerald-700">Imagen lista: {coverFile.name}</div>}</div>
      <div className="mt-6 flex items-center justify-between"><div><div className="text-sm font-black">Descuentos por cantidad</div><div className="text-xs text-slate-500">Ejemplo: desde 10 boletos, 5%.</div></div><button onClick={onAddDiscount} className="rounded-lg border-2 border-black bg-amber-300 px-3 py-2 text-sm font-black">+ Agregar</button></div>
      <div className="mt-3 space-y-2">{form.discounts.map((discount,index)=><div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input type="number" min="1" value={discount.min_qty} onChange={e=>onUpdateDiscount(index,"min_qty",Number(e.target.value))} className="min-w-0 rounded-lg border-2 border-black px-3 py-2" placeholder="Cantidad"/><input type="number" min="0" max="100" value={discount.percent} onChange={e=>onUpdateDiscount(index,"percent",Number(e.target.value))} className="min-w-0 rounded-lg border-2 border-black px-3 py-2" placeholder="%"/><button onClick={()=>setForm(f=>({...f,discounts:f.discounts.filter((_,i)=>i!==index)}))} className="rounded-lg border-2 border-black px-3 font-black">×</button></div>)}</div>
      <div className="mt-6 flex gap-2"><button onClick={()=>void onSave()} className="flex-1 rounded-xl bg-black px-5 py-4 font-black text-white">{editingId?"Guardar cambios":"Crear borrador"}</button>{editingId&&<button onClick={onReset} className="rounded-xl border-2 border-black px-4 py-3 font-black">Cancelar</button>}</div>
    </div>

    <div><div className="mb-4 flex items-end justify-between"><div><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Historial permanente</div><h2 className="mt-1 text-3xl font-black uppercase">Todas las rifas</h2></div><div className="text-sm font-bold">{raffles.length} registradas</div></div><div className="space-y-4">{raffles.map(raffle=><article key={raffle.id} className="overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[5px_5px_0_#111]"><div className="grid md:grid-cols-[220px_1fr]"><div className="min-h-48 bg-[#171717]">{raffle.cover_image_url?<img src={raffle.cover_image_url} alt={raffle.title} className="h-full w-full object-cover"/>:<div className="flex h-full min-h-48 items-center justify-center p-6 text-center text-5xl">🎟️</div>}</div><div className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.18em] text-slate-500">{raffle.edition?`Emisión ${raffle.edition}`:"Sin edición"}</div><h3 className="mt-1 text-2xl font-black uppercase">{raffle.title}</h3><div className="mt-1 text-sm font-bold text-slate-600">{raffle.total_tickets.toLocaleString()} boletos · ${Number(raffle.ticket_price).toFixed(2)} c/u</div></div><RaffleStatus status={raffle.status}/></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{raffle.description||"Sin descripción."}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>onEdit(raffle)} className="rounded-xl border-2 border-black px-4 py-2 font-black">Editar</button>{raffle.status!=="active"&&raffle.status!=="completed"&&<button onClick={()=>void onAction(raffle.id,"activate")} className="rounded-xl bg-emerald-600 px-4 py-2 font-black text-white">Iniciar</button>}{raffle.status==="active"&&<button onClick={()=>void onAction(raffle.id,"pause")} className="rounded-xl bg-amber-400 px-4 py-2 font-black">Pausar</button>}{raffle.status!=="completed"&&<button onClick={()=>void onAction(raffle.id,"finalize")} className="rounded-xl bg-black px-4 py-2 font-black text-white">Finalizar</button>}<a href={`/rifa/${raffle.id}`} target="_blank" className="rounded-xl border-2 border-black bg-[#f3efe6] px-4 py-2 font-black">Vista pública</a></div>{raffle.status==="completed"&&<div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm"><b>Ganador:</b> {raffle.winner_ticket?`Boleto ${raffle.winner_ticket}`:"Pendiente de publicar"}{raffle.winner_name?` · ${raffle.winner_name}`:""}</div>}</div></div></article>)}</div>{!raffles.length&&<div className="rounded-2xl border-2 border-dashed border-black/30 bg-white p-10 text-center font-bold text-slate-500">Todavía no hay rifas creadas.</div>}</div>
  </section>;
}

function SettingsSection({settings,setSettings,accounts,setAccounts,newAccount,setNewAccount,onSaveSettings,onSaveAccount,onToggleAccount}:{settings:Settings;setSettings:React.Dispatch<React.SetStateAction<Settings>>;accounts:Account[];setAccounts:React.Dispatch<React.SetStateAction<Account[]>>;newAccount:Account;setNewAccount:React.Dispatch<React.SetStateAction<Account>>;onSaveSettings:()=>Promise<void>;onSaveAccount:(a:Account)=>Promise<void>;onToggleAccount:(a:Account)=>Promise<void>}) {
  return <section className="mt-7 grid gap-7 xl:grid-cols-2"><div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Datos fijos</div><h2 className="mt-2 text-3xl font-black uppercase">Página y contacto</h2><div className="mt-5 grid gap-3"><Field value={settings.brand_name||""} onChange={v=>setSettings(s=>({...s,brand_name:v}))} placeholder="Nombre de la página"/><Field value={settings.whatsapp_number||""} onChange={v=>setSettings(s=>({...s,whatsapp_number:v}))} placeholder="WhatsApp con lada de país"/><Field value={settings.facebook_url||""} onChange={v=>setSettings(s=>({...s,facebook_url:v}))} placeholder="Facebook"/><Field value={settings.instagram_url||""} onChange={v=>setSettings(s=>({...s,instagram_url:v}))} placeholder="Instagram"/><label className="text-sm font-black">Cómo se elige al ganador<textarea value={settings.winner_method||""} onChange={e=>setSettings(s=>({...s,winner_method:e.target.value}))} className="mt-1 min-h-40 w-full rounded-xl border-2 border-black px-4 py-3 font-normal"/></label></div><button onClick={()=>void onSaveSettings()} className="mt-5 w-full rounded-xl bg-black px-5 py-4 font-black text-white">Guardar configuración</button></div>
    <div><div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111]"><div className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Cobros</div><h2 className="mt-2 text-3xl font-black uppercase">Cuentas de pago</h2><p className="mt-2 text-sm leading-6 text-slate-600">Puedes agregar, actualizar o retirar cuentas. Retirar una cuenta solo la oculta al público; no borra el historial.</p><div className="mt-5 space-y-4">{accounts.map((account,index)=><div key={account.id} className={`rounded-2xl border-2 border-black p-4 ${account.active?"bg-[#faf7ef]":"bg-slate-100 opacity-70"}`}><div className="grid gap-2 sm:grid-cols-2"><Field value={account.label} onChange={v=>setAccounts(a=>a.map((x,i)=>i===index?{...x,label:v}:x))} placeholder="Etiqueta"/><Field value={account.bank_name} onChange={v=>setAccounts(a=>a.map((x,i)=>i===index?{...x,bank_name:v}:x))} placeholder="Banco"/><Field value={account.beneficiary_name} onChange={v=>setAccounts(a=>a.map((x,i)=>i===index?{...x,beneficiary_name:v}:x))} placeholder="Beneficiario"/><Field value={account.account_number||""} onChange={v=>setAccounts(a=>a.map((x,i)=>i===index?{...x,account_number:v}:x))} placeholder="Cuenta"/><Field value={account.clabe||""} onChange={v=>setAccounts(a=>a.map((x,i)=>i===index?{...x,clabe:v}:x))} placeholder="CLABE"/></div><div className="mt-3 flex gap-2"><button onClick={()=>void onSaveAccount(account)} className="rounded-xl bg-black px-4 py-2 font-black text-white">Guardar</button><button onClick={()=>void onToggleAccount(account)} className="rounded-xl border-2 border-black px-4 py-2 font-black">{account.active?"Quitar de la página":"Volver a mostrar"}</button></div></div>)}</div></div>
      <div className="mt-5 rounded-3xl border-2 border-black bg-amber-100 p-6"><h3 className="text-xl font-black uppercase">Agregar otra cuenta</h3><div className="mt-4 grid gap-2 sm:grid-cols-2"><Field value={newAccount.label} onChange={v=>setNewAccount(a=>({...a,label:v}))} placeholder="Etiqueta"/><Field value={newAccount.bank_name} onChange={v=>setNewAccount(a=>({...a,bank_name:v}))} placeholder="Banco"/><Field value={newAccount.beneficiary_name} onChange={v=>setNewAccount(a=>({...a,beneficiary_name:v}))} placeholder="Beneficiario"/><Field value={newAccount.account_number} onChange={v=>setNewAccount(a=>({...a,account_number:v}))} placeholder="Cuenta"/><Field value={newAccount.clabe} onChange={v=>setNewAccount(a=>({...a,clabe:v}))} placeholder="CLABE"/></div><button onClick={()=>void onSaveAccount(newAccount)} className="mt-4 rounded-xl bg-black px-5 py-3 font-black text-white">+ Agregar cuenta</button></div>
    </div>
  </section>;
}

function Field({value,onChange,placeholder,type="text"}:{value:string;onChange:(value:string)=>void;placeholder:string;type?:string}) { return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border-2 border-black px-4 py-3 outline-none focus:bg-amber-50"/>; }
function Mini({children}:{children:React.ReactNode}) { return <div className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">{children}</div>; }
function Metric({label,value}:{label:string;value:number}) { return <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0_#111]"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-4xl font-black">{value}</div></div>; }
function Status({status}:{status:string}) { const map:Record<string,[string,string]>={reserved:["Apartada","bg-sky-100"],receipt_uploaded:["Comprobante","bg-violet-100"],paid:["Pagada","bg-emerald-100"],unpaid:["No pagada","bg-amber-100"],manual_review:["Revisión","bg-fuchsia-100"],cancelled:["Liberada","bg-slate-200"]};const item=map[status]||[status,"bg-slate-100"];return <span className={`justify-self-start rounded-full border border-black px-3 py-2 text-xs font-black md:justify-self-end ${item[1]}`}>{item[0]}</span>; }
function RaffleStatus({status}:{status:string}) { const map:Record<string,string>={draft:"Borrador",active:"Activa",paused:"Pausada",closed:"Pausada",completed:"Finalizada"}; return <span className={`rounded-full border-2 border-black px-3 py-2 text-xs font-black uppercase ${status==="active"?"bg-emerald-300":status==="completed"?"bg-slate-200":status==="paused"||status==="closed"?"bg-amber-300":"bg-white"}`}>{map[status]||status}</span>; }
