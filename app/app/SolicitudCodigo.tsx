"use client";

import { FormEvent, useState } from "react";

const PRICE_USD = 17.99;
const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));
const HONDA_MODELS = ["Accord","Civic","CR-V","HR-V","Pilot","Odyssey","Passport","Ridgeline","Fit","Insight","Clarity","CR-Z","Element","Crosstour","S2000","Prelude","del Sol","Prologue"];
const ACURA_MODELS = ["Integra","TL","TLX","TSX","MDX","RDX","RL","RLX","ILX","RSX","CL","ZDX","NSX","Legend","Vigor","ADX"];

export default function SolicitudCodigo(){
  const [brand,setBrand]=useState<"Honda"|"Acura">("Honda");
  const [model,setModel]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const models=brand==="Honda"?HONDA_MODELS:ACURA_MODELS;

  function chooseBrand(next:"Honda"|"Acura"){
    setBrand(next);
    setModel("");
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const year=String(data.get("year")||"").trim();
    const selectedModel=String(data.get("model")||"").trim();
    const serial=String(data.get("serial")||"").trim();
    const vin=String(data.get("vin")||"").trim().toUpperCase();
    const email=String(data.get("email")||"").trim();
    const phone=String(data.get("phone")||"").trim();

    if(!year||!selectedModel||!serial){
      setMessage("Completa marca, año, modelo y serie del estéreo.");
      return;
    }
    if(!email&&!phone){
      setMessage("Deja al menos un medio de contacto: WhatsApp/teléfono o correo electrónico.");
      return;
    }

    setBusy(true); setMessage("");
    try{
      const response=await fetch("/api/checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({serial,vin,email,phone,prioritySms:false,language:"es",detectedBrand:brand,radioFamily:`${year} ${selectedModel}`}),
      });
      const result=await response.json();
      if(!response.ok||!result.url){
        const messages:Record<string,string>={
          INVALID_EMAIL:"Escribe un correo válido o déjalo vacío y usa WhatsApp.",
          EMAIL_UNDELIVERABLE:"No pudimos validar ese correo. Revisa que esté escrito correctamente o usa WhatsApp.",
          INVALID_CONTACT:"Deja al menos un WhatsApp/teléfono o un correo electrónico.",
          INVALID_INPUT:"Revisa los datos e inténtalo de nuevo.",
          UNSUPPORTED_BRAND:"Este servicio solo acepta Honda y Acura.",
          NOT_CONFIGURED:"El sistema de pago todavía no está disponible. Inténtalo más tarde.",
        };
        setMessage(messages[result?.code]||"No pudimos iniciar el pago. Revisa tus datos e inténtalo de nuevo.");
        setBusy(false); return;
      }
      window.location.assign(result.url);
    }catch{
      setMessage("No pudimos conectar con el sistema de pago. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <a href="/" className="text-xl font-black tracking-tight">AutoStereoCodes</a>
        <a href="/" className="text-sm font-bold text-slate-600">← Volver al inicio</a>
      </div>
    </header>

    <section className="px-5 py-12 md:py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <div className="text-center">
          <div className="text-xs font-black uppercase tracking-[.2em] text-[#d71920]">Solicitud de código</div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Solicita tu código Honda o Acura</h1>
          <p className="mt-3 text-slate-600">Llena los datos del radio. El VIN es opcional.</p>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <div>
            <div className="mb-2 text-sm font-black">Marca *</div>
            <div className="grid grid-cols-2 gap-3">
              {(["Honda","Acura"] as const).map(option=><button key={option} type="button" onClick={()=>chooseBrand(option)} className={`rounded-xl border-2 px-5 py-4 font-black transition ${brand===option?"border-[#d71920] bg-red-50 text-[#b4151b]":"border-slate-200 bg-white text-slate-700"}`}>{option}</button>)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-black">Año *
              <select name="year" required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-[#d71920]"><option value="">Selecciona año</option>{YEARS.map(year=><option key={year} value={year}>{year}</option>)}</select>
            </label>
            <label className="text-sm font-black">Modelo *
              <select name="model" required value={model} onChange={e=>setModel(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-[#d71920]"><option value="">Selecciona modelo</option>{models.map(item=><option key={item} value={item}>{item}</option>)}</select>
            </label>
          </div>

          <label className="text-sm font-black">Serie del estéreo *
            <input name="serial" required maxLength={100} autoCapitalize="characters" placeholder="Ej. U1234 L5678 / S/N 15517841" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]"/>
          </label>

          <label className="text-sm font-black">VIN del vehículo <span className="font-semibold text-slate-400">(opcional)</span>
            <input name="vin" maxLength={17} autoCapitalize="characters" placeholder="17 caracteres, si lo tienes disponible" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-[#d71920]"/>
          </label>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="font-black text-blue-950">Contacto: solo necesitas uno</div>
            <p className="mt-1 text-sm leading-6 text-blue-900/80">Puedes dejar WhatsApp/teléfono o correo electrónico. No es necesario llenar ambos.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-black">WhatsApp / teléfono
              <input name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="Ej. +52 664 123 4567" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]"/>
            </label>
            <label className="text-sm font-black">Correo electrónico
              <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="tu@correo.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#d71920]"/>
            </label>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-black text-slate-800">Código de radio Honda / Acura</div><div className="mt-1 text-xs font-semibold text-slate-500">Pago único por solicitud</div></div><span className="text-2xl font-black text-[#b4151b]">${PRICE_USD.toFixed(2)} USD</span></div>

          {message&&<div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-900">{message}</div>}
          <button disabled={busy} type="submit" className="rounded-xl bg-[#d71920] px-6 py-4 text-lg font-black uppercase text-white transition hover:bg-[#b4151b] disabled:opacity-60">{busy?"Abriendo pago…":"Continuar al pago"}</button>
          <p className="text-center text-xs font-medium leading-5 text-slate-500">Servicio independiente especializado en recuperación de códigos de radio Honda y Acura.</p>
        </form>
      </div>
    </section>
  </main>;
}
