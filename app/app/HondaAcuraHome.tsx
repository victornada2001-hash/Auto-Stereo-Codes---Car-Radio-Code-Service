"use client";

import { FormEvent, useState } from "react";

const PRICE_USD = 17.99;
const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

const HONDA_MODELS = [
  "Accord","Civic","CR-V","HR-V","Pilot","Odyssey","Passport","Ridgeline","Fit","Insight","Clarity","CR-Z","Element","Crosstour","S2000","Prelude","del Sol","Prologue"
];
const ACURA_MODELS = [
  "Integra","TL","TLX","TSX","MDX","RDX","RL","RLX","ILX","RSX","CL","ZDX","NSX","Legend","Vigor","ADX"
];

function RadioButtonsIllustration(){
  return <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Radio con botones 1 y 6 y botón de encendido">
    <rect width="520" height="300" rx="26" fill="#111827"/>
    <rect x="55" y="48" width="410" height="72" rx="10" fill="#dbeafe"/>
    <text x="260" y="93" textAnchor="middle" fontSize="29" fontWeight="800" fill="#111827">S/N 15517841</text>
    <circle cx="95" cy="205" r="42" fill="#374151" stroke="#f8fafc" strokeWidth="4"/>
    <text x="95" y="198" textAnchor="middle" fontSize="15" fontWeight="800" fill="white">PWR</text>
    <text x="95" y="218" textAnchor="middle" fontSize="12" fill="#cbd5e1">VOL</text>
    {[1,2,3,4,5,6].map((n,i)=>{
      const x=175+i*52; const hot=n===1||n===6;
      return <g key={n}><rect x={x} y="180" width="40" height="50" rx="8" fill={hot?"#dc2626":"#374151"} stroke={hot?"#fecaca":"#64748b"} strokeWidth="3"/><text x={x+20} y="212" textAnchor="middle" fontSize="18" fontWeight="900" fill="white">{n}</text></g>
    })}
    <path d="M155 254 C205 275 375 275 445 250" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
    <text x="300" y="286" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fecaca">Mantén 1 + 6 y presiona encendido</text>
  </svg>;
}

function TouchscreenIllustration(){
  return <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Pantalla táctil mostrando número de serie">
    <rect width="520" height="300" rx="26" fill="#0f172a"/>
    <rect x="45" y="35" width="430" height="215" rx="18" fill="#111827" stroke="#475569" strokeWidth="4"/>
    <text x="75" y="77" fontSize="21" fontWeight="800" fill="white">System Settings</text>
    <line x1="70" x2="450" y1="92" y2="92" stroke="#334155" strokeWidth="2"/>
    <text x="82" y="135" fontSize="18" fill="#cbd5e1">Model</text>
    <text x="320" y="135" fontSize="18" fontWeight="700" fill="white">NR-0000UH</text>
    <text x="82" y="180" fontSize="18" fill="#cbd5e1">Serial No.</text>
    <rect x="300" y="152" width="135" height="43" rx="8" fill="#dc2626"/>
    <text x="368" y="180" textAnchor="middle" fontSize="20" fontWeight="900" fill="white">975GU294</text>
    <text x="260" y="278" textAnchor="middle" fontSize="15" fontWeight="800" fill="#bfdbfe">Busca Serial No. en diagnóstico / información del sistema</text>
  </svg>;
}

function NavigationIllustration(){
  return <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Sistema de navegación antiguo con menú de diagnóstico">
    <rect width="520" height="300" rx="26" fill="#e5e7eb"/>
    <rect x="72" y="34" width="376" height="220" rx="18" fill="#111827" stroke="#6b7280" strokeWidth="5"/>
    <rect x="105" y="70" width="310" height="120" rx="10" fill="#0b1220"/>
    <text x="130" y="105" fontSize="19" fontWeight="800" fill="white">NAVI ECU</text>
    <text x="130" y="145" fontSize="17" fill="#cbd5e1">Serial No.</text>
    <text x="300" y="145" fontSize="19" fontWeight="900" fill="#fca5a5">28028514</text>
    <rect x="110" y="207" width="65" height="22" rx="7" fill="#64748b"/>
    <rect x="195" y="207" width="65" height="22" rx="7" fill="#64748b"/>
    <rect x="280" y="207" width="65" height="22" rx="7" fill="#64748b"/>
    <rect x="365" y="207" width="45" height="22" rx="7" fill="#dc2626"/>
    <text x="260" y="282" textAnchor="middle" fontSize="15" fontWeight="800" fill="#334155">Unidades con navegación: entra al menú de diagnóstico</text>
  </svg>;
}

function LabelIllustration(){
  return <svg viewBox="0 0 520 300" className="h-full w-full" role="img" aria-label="Etiqueta física de radio con número de serie">
    <rect width="520" height="300" rx="26" fill="#cbd5e1"/>
    <rect x="70" y="42" width="380" height="215" rx="18" fill="#f8fafc" stroke="#94a3b8" strokeWidth="4"/>
    <text x="98" y="86" fontSize="22" fontWeight="900" fill="#111827">RADIO UNIT</text>
    <text x="98" y="118" fontSize="14" fill="#475569">MODEL 39101-S5A-E010-M1</text>
    <text x="98" y="145" fontSize="14" fill="#475569">12V NEGATIVE GROUND</text>
    <text x="98" y="177" fontSize="14" fontWeight="800" fill="#111827">SERIAL NO.</text>
    <rect x="218" y="154" width="165" height="42" rx="7" fill="#fff1f2" stroke="#dc2626" strokeWidth="3"/>
    <text x="300" y="182" textAnchor="middle" fontSize="23" fontWeight="900" fill="#991b1b">B1015167</text>
    <g fill="#111827">{Array.from({length:22},(_,i)=><rect key={i} x={105+i*11} y="211" width={i%3===0?5:3} height="24"/>)}</g>
  </svg>;
}

const GUIDES = [
  {title:"Radio con botones físicos 1 y 6", eyebrow:"MÉTODO MÁS COMÚN", body:"Con el radio apagado, mantén presionados los botones 1 y 6. Sin soltarlos, presiona el botón de encendido/volumen. La pantalla mostrará la serie completa o en dos partes: U#### y L####.", image:<RadioButtonsIllustration/>},
  {title:"Pantalla táctil / modelos recientes", eyebrow:"PANTALLA DE DIAGNÓSTICO", body:"En unidades con pantalla táctil, el número puede aparecer dentro de Información del sistema, diagnóstico o comprobación de la unidad. Busca el campo Serial No. y cópialo exactamente.", image:<TouchscreenIllustration/>},
  {title:"Navegación anterior", eyebrow:"NAVEGACIÓN / ECU", body:"En algunos sistemas de navegación antiguos debes entrar al menú de diagnóstico y abrir la información de la unidad o Navi ECU. Ahí aparecerá el número de serie del sistema.", image:<NavigationIllustration/>},
  {title:"Etiqueta física del estéreo", eyebrow:"SI NO APARECE EN PANTALLA", body:"Si tu radio no muestra la serie desde el menú, puede estar impresa en una etiqueta en la parte superior, lateral o trasera de la unidad. Busca SERIAL NO. o S/N, no el número de parte.", image:<LabelIllustration/>},
];

export default function HondaAcuraHome() {
  const [brand, setBrand] = useState<"Honda" | "Acura">("Honda");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const models = brand === "Honda" ? HONDA_MODELS : ACURA_MODELS;

  function chooseBrand(next:"Honda"|"Acura"){
    setBrand(next);
    setModel("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const year = String(data.get("year") || "").trim();
    const selectedModel = String(data.get("model") || "").trim();
    const serial = String(data.get("serial") || "").trim();
    const vin = String(data.get("vin") || "").trim().toUpperCase();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!year || !selectedModel || !serial || !vin) {
      setMessage("Completa marca, año, modelo, VIN y serie del estéreo.");
      return;
    }
    if (!email && !phone) {
      setMessage("Deja al menos un medio de contacto: WhatsApp/teléfono o correo electrónico.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial, vin, email, phone, prioritySms:false, language:"es", detectedBrand:brand, radioFamily:`${year} ${selectedModel}` }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        const messages: Record<string, string> = {
          INVALID_EMAIL: "Escribe un correo electrónico válido o déjalo vacío y usa WhatsApp.",
          EMAIL_UNDELIVERABLE: "No pudimos validar ese correo. Revisa que esté escrito correctamente o usa WhatsApp.",
          INVALID_CONTACT: "Deja al menos un WhatsApp/teléfono o un correo electrónico.",
          INVALID_INPUT: "Revisa los datos del vehículo e inténtalo de nuevo.",
          UNSUPPORTED_BRAND: "Este servicio solo acepta Honda y Acura.",
          NOT_CONFIGURED: "El sistema de pago todavía no está disponible. Inténtalo más tarde.",
        };
        setMessage(messages[result?.code] || "No pudimos iniciar el pago. Revisa tus datos e inténtalo de nuevo.");
        setBusy(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("No pudimos conectar con el sistema de pago. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="/" className="text-xl font-black tracking-tight">AutoStereoCodes</a>
        <div className="flex items-center gap-3"><a href="#como-encontrar-serie" className="hidden text-sm font-bold text-slate-600 sm:inline">Cómo sacar la serie</a><a href="#solicitar" className="rounded-xl bg-[#d71920] px-5 py-3 text-sm font-black uppercase text-white">Solicitar código</a></div>
      </div>
    </header>

    <section className="overflow-hidden bg-[#101820] px-5 py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="text-sm font-black uppercase tracking-[.22em] text-red-400">Servicio exclusivo Honda + Acura</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Recupera el código de tu radio Honda o Acura</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Identifica tu tipo de radio, encuentra la serie y envía tu solicitud en pocos minutos.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#solicitar" className="rounded-xl bg-[#d71920] px-7 py-4 font-black uppercase text-white">Solicitar código</a><a href="#como-encontrar-serie" className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-black uppercase text-white">Ver guía visual</a></div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
          <div className="overflow-hidden rounded-2xl bg-white/5"><RadioButtonsIllustration/></div>
          <div className="overflow-hidden rounded-2xl bg-white/5"><TouchscreenIllustration/></div>
          <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-center"><div className="text-xs font-black uppercase tracking-[.18em] text-red-300">Honda · Acura</div><div className="mt-2 text-xl font-black">Radios originales y sistemas de navegación</div></div>
        </div>
      </div>
    </section>

    <section id="como-encontrar-serie" className="px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center"><div className="text-xs font-black uppercase tracking-[.22em] text-[#d71920]">Guía visual</div><h2 className="mt-3 text-3xl font-black sm:text-4xl">¿Cómo obtener la serie de tu radio?</h2><p className="mt-4 leading-7 text-slate-600">Compara tu estéreo con estos ejemplos. El procedimiento cambia según el tipo de unidad.</p></div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {GUIDES.map(item=><article key={item.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="aspect-[16/9] bg-slate-100">{item.image}</div><div className="p-6"><div className="text-xs font-black uppercase tracking-[.18em] text-[#d71920]">{item.eyebrow}</div><h3 className="mt-2 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p></div></article>)}
        </div>
        <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-slate-700"><strong>Importante:</strong> copia la serie exactamente como aparece. Si se muestra en dos partes, por ejemplo <strong>U1234</strong> y <strong>L5678</strong>, guarda ambas partes.</div>
      </div>
    </section>

    <section id="solicitar" className="scroll-mt-24 border-t border-slate-200 bg-white px-5 py-14 md:py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <div className="text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-[#d71920]">Solicitud de código</div><h2 className="mt-2 text-3xl font-black">Datos de tu Honda o Acura</h2><p className="mt-3 text-slate-600">Selecciona tu marca y verás únicamente los modelos correspondientes.</p></div>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <div><div className="mb-2 text-sm font-black">Marca *</div><div className="grid grid-cols-2 gap-3">{(["Honda","Acura"] as const).map(option=><button key={option} type="button" onClick={()=>chooseBrand(option)} className={`rounded-xl border-2 px-5 py-4 font-black transition ${brand===option?"border-[#d71920] bg-red-50 text-[#b4151b]":"border-slate-200 bg-white text-slate-700"}`}>{option}</button>)}</div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-black">Año *<select name="year" required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-[#d71920]"><option value="">Selecciona año</option>{YEARS.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
            <label className="text-sm font-black">Modelo *<select name="model" required value={model} onChange={e=>setModel(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-[#d71920]"><option value="">Selecciona modelo</option>{models.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
          </div>
          <label className="text-sm font-black">Serie del estéreo *<input name="serial" required maxLength={100} autoCapitalize="characters" placeholder="Ej. U1234 L5678 / 15517841" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]"/><a href="#como-encontrar-serie" className="mt-2 inline-block text-xs font-bold text-[#d71920]">¿No sabes cuál es? Ver guía visual ↑</a></label>
          <label className="text-sm font-black">VIN del vehículo *<input name="vin" required minLength={11} maxLength={17} autoCapitalize="characters" placeholder="Número de identificación del vehículo" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-[#d71920]"/></label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="font-black">Contacto — deja por lo menos uno *</div><p className="mt-1 text-sm text-slate-500">Puedes usar WhatsApp/teléfono, correo electrónico o ambos.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-black">WhatsApp / teléfono<input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="Ej. +52 664 123 4567" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d71920]"/></label><label className="text-sm font-black">Correo electrónico<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#d71920]"/></label></div></div>
          <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-black text-slate-800">Código de radio Honda / Acura</div><div className="mt-1 text-xs font-semibold text-slate-500">Pago único por solicitud</div></div><span className="text-2xl font-black text-[#b4151b]">${PRICE_USD.toFixed(2)} USD</span></div>
          {message&&<div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-900">{message}</div>}
          <button disabled={busy} type="submit" className="rounded-xl bg-[#d71920] px-6 py-4 text-lg font-black uppercase text-white transition hover:bg-[#b4151b] disabled:opacity-60">{busy?"Abriendo pago…":"Continuar al pago"}</button>
          <p className="text-center text-xs font-medium leading-5 text-slate-500">Servicio independiente especializado en recuperación de códigos de radio. Honda y Acura son marcas de sus respectivos propietarios.</p>
        </form>
      </div>
    </section>

    <footer className="bg-[#101820] px-5 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} AutoStereoCodes · Honda & Acura Radio Codes</footer>
  </main>;
}
