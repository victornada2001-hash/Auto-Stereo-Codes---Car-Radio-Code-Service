"use client";

import { useEffect, useState, type FormEvent } from "react";
import { languageOptions, type Language } from "../languages";
import { brandPhotoForName } from "../brandVisuals";

const BASE_PRICE=23.99;
const SMS_ADDON=1.75;

type CountryOption={name:string;dial:string;code:string};
const FALLBACK_COUNTRIES:CountryOption[]=[
  {name:"México",dial:"+52",code:"MX"},{name:"United States / Canada",dial:"+1",code:"US"},{name:"Argentina",dial:"+54",code:"AR"},{name:"Brazil",dial:"+55",code:"BR"},{name:"Chile",dial:"+56",code:"CL"},{name:"Colombia",dial:"+57",code:"CO"},{name:"Perú",dial:"+51",code:"PE"},{name:"Spain",dial:"+34",code:"ES"},{name:"United Kingdom",dial:"+44",code:"GB"},{name:"France",dial:"+33",code:"FR"},{name:"Germany",dial:"+49",code:"DE"},{name:"Italy",dial:"+39",code:"IT"}
];

const copy={
  es:{back:"Volver",eyebrow:"SOLICITUD DE CÓDIGO",title:"Completa tu solicitud",intro:"Confirma la serie del estéreo y dinos dónde quieres recibir el código.",serial:"Serie del estéreo",brand:"Vehículo seleccionado",family:"Familia de radio",vin:"VIN del vehículo",postal:"Código postal / ZIP",officialData:"Datos para consulta oficial",vinHonda:"Honda/Acura puede pedir VIN, ZIP, teléfono, email y serie para recuperar el código en su servicio oficial.",vinOptional:"Ayuda a identificar el vehículo y acelerar una consulta oficial cuando esté disponible.",delivery:"¿A dónde te enviamos tu código?",email:"Correo electrónico",confirmEmail:"Confirma tu correo",emailHelp:"El correo es obligatorio. Verificamos el formato y que el dominio pueda recibir correo antes de enviarte al pago.",emailMismatch:"Los dos correos no coinciden.",emailInvalid:"Ese correo no parece recibir mensajes. Revísalo antes de continuar.",sms:"SMS prioritario",smsText:"Agrega atención prioritaria y opción de entrega por mensaje de texto por +$1.75 USD (aprox. MX$30).",phone:"Número celular",country:"País / código",phoneHelp:"Selecciona el país y escribe el número. Lo guardaremos en formato internacional.",phoneInvalid:"Ese número no tiene un formato internacional válido. Revisa país, lada y número.",total:"Total",pay:"Continuar al pago seguro",opening:"Verificando datos y abriendo PayPal…",safe:"Pago seguro con PayPal",safeText:"La solicitud se crea únicamente después de que PayPal confirme el cobro.",next:"Qué pasa después",n1:"1. Validamos tus datos de contacto y confirmas tu pago.",n2:"2. Recibimos la serie y los datos requeridos por la fuente oficial.",n3:"3. Intentamos una fuente aprobada y te enviamos el código después de revisarlo.",help:"¿No estás seguro de la serie?",guides:"Abrir guías por marca",invalid:"Revisa tus datos antes de continuar.",vinMissing:"Para Honda/Acura necesitamos VIN, código postal y teléfono antes de continuar.",error:"No pudimos iniciar el pago. Inténtalo de nuevo."},
  en:{back:"Back",eyebrow:"CODE REQUEST",title:"Complete your request",intro:"Confirm the stereo serial and tell us where you want to receive the code.",serial:"Stereo serial",brand:"Selected vehicle",family:"Radio family",vin:"Vehicle VIN",postal:"ZIP / postal code",officialData:"Official lookup details",vinHonda:"Honda/Acura may require VIN, ZIP, phone, email and radio serial to retrieve a code from its official service.",vinOptional:"Helps identify the vehicle and speed up an official lookup when available.",delivery:"Where should we send your code?",email:"Email address",confirmEmail:"Confirm your email",emailHelp:"Email is required. We validate its format and whether the domain can receive email before checkout.",emailMismatch:"The two email addresses do not match.",emailInvalid:"That email does not appear able to receive messages. Please check it before continuing.",sms:"Priority SMS",smsText:"Add priority handling and text-message delivery for +$1.75 USD.",phone:"Mobile number",country:"Country / code",phoneHelp:"Select the country and enter the number. We store it in international format.",phoneInvalid:"That number does not have a valid international format. Check the country code and number.",total:"Total",pay:"Continue to secure payment",opening:"Validating details and opening PayPal…",safe:"Secure PayPal payment",safeText:"Your request is created only after PayPal confirms the payment.",next:"What happens next",n1:"1. We validate your contact details and you confirm payment.",n2:"2. We receive the serial and details required by the official source.",n3:"3. We try an approved source and send the code after review.",help:"Not sure about the serial?",guides:"Open brand guides",invalid:"Check your information before continuing.",vinMissing:"Honda/Acura requires VIN, ZIP/postal code and phone before continuing.",error:"We could not start the payment. Please try again."}
};

function buildInternationalPhone(raw:string,dial:string){
  const rawTrim=raw.trim();
  const digits=rawTrim.replace(/\D/g,"");
  const dialDigits=dial.replace(/\D/g,"");
  if(rawTrim.startsWith("+")) return `+${digits}`;
  if(digits.startsWith(dialDigits)&&digits.length>=dialDigits.length+7) return `+${digits}`;
  return `+${dialDigits}${digits.replace(/^0+/,"")}`;
}
function looksLikeInternationalPhone(value:string){
  if(!/^\+[1-9]\d{7,14}$/.test(value)) return false;
  const digits=value.replace(/\D/g,"");
  return !/^(\d)\1+$/.test(digits);
}

export default function RequestClient(){
  const [language,setLanguage]=useState<Language>("es");
  const [serial,setSerial]=useState("");
  const [brand,setBrand]=useState("");
  const [family,setFamily]=useState("");
  const [prioritySms,setPrioritySms]=useState(false);
  const [countryDial,setCountryDial]=useState("+52");
  const [countries,setCountries]=useState<CountryOption[]>(FALLBACK_COUNTRIES);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const t=language==="es"?copy.es:copy.en;
  const total=(BASE_PRICE+(prioritySms?SMS_ADDON:0)).toFixed(2);
  const requestPhoto=brandPhotoForName(brand);
  const normalizedBrand=brand.trim().toLowerCase();
  const showVin=["honda","acura","renault","dacia"].includes(normalizedBrand);
  const officialHondaLookup=["honda","acura"].includes(normalizedBrand);
  const phoneRequired=prioritySms||officialHondaLookup;

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const qSerial=params.get("serial")||"";
    const qBrand=params.get("brand")||"";
    const qFamily=params.get("family")||"";
    const savedSerial=sessionStorage.getItem("asc_serial")||"";
    const savedBrand=sessionStorage.getItem("asc_detected_brand")||"";
    const savedFamily=sessionStorage.getItem("asc_radio_family")||"";
    setSerial((qSerial||savedSerial).toUpperCase());
    setBrand(qBrand||savedBrand);
    setFamily(qFamily||savedFamily);
  },[]);

  useEffect(()=>{
    let active=true;
    fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2",{cache:"force-cache"})
      .then(r=>r.ok?r.json():Promise.reject())
      .then((data:any[])=>{
        if(!active||!Array.isArray(data)) return;
        const options:CountryOption[]=data.flatMap(country=>{
          const root=String(country?.idd?.root||"");
          const suffixes=Array.isArray(country?.idd?.suffixes)?country.idd.suffixes:[];
          const name=String(country?.name?.common||country?.cca2||"").trim();
          if(!root||!name) return [];
          const dials=suffixes.length?suffixes.map((suffix:string)=>`${root}${suffix}`):[root];
          return dials.map((dial:string)=>({name,dial,code:String(country?.cca2||"")}));
        }).filter(x=>/^\+\d+$/.test(x.dial));
        const unique=[...new Map(options.map(x=>[`${x.code}-${x.dial}`,x])).values()].sort((a,b)=>a.name.localeCompare(b.name));
        if(unique.length>100) setCountries(unique);
      }).catch(()=>{});
    return()=>{active=false};
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const email=String(data.get("email")||"").trim().toLowerCase();
    const confirmEmail=String(data.get("confirmEmail")||"").trim().toLowerCase();
    const rawPhone=String(data.get("phone")||"").trim();
    const phone=phoneRequired?buildInternationalPhone(rawPhone,countryDial):"";
    const vin=String(data.get("vin")||"").trim().toUpperCase();
    const postalCode=String(data.get("postalCode")||"").trim().toUpperCase();
    if(!serial.trim()||!email){setMessage(t.invalid);return;}
    if(email!==confirmEmail){setMessage(t.emailMismatch);return;}
    if(phoneRequired&&!looksLikeInternationalPhone(phone)){setMessage(t.phoneInvalid);return;}
    if(officialHondaLookup&&(!vin||!postalCode)){setMessage(t.vinMissing);return;}
    setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serial,vin,postalCode,email,phone,prioritySms,language,detectedBrand:brand,radioFamily:family})});
      const result=await response.json();
      if(!response.ok||!result.url){
        if(result.code==="EMAIL_UNDELIVERABLE"||result.code==="INVALID_EMAIL") setMessage(t.emailInvalid);
        else if(result.code==="INVALID_PHONE") setMessage(t.phoneInvalid);
        else if(["VIN_REQUIRED","POSTAL_CODE_REQUIRED"].includes(result.code)) setMessage(t.vinMissing);
        else setMessage(t.error);
        setBusy(false);return;
      }
      window.location.assign(result.url);
    }catch{setMessage(t.error);setBusy(false);}
  }

  return <main className="min-h-screen bg-[#fff8f1] text-slate-950">
    <header className="border-b border-orange-100 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8"><a href="/" className="flex items-center gap-3 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs text-white">ASC</span>AUTO STEREO CODES</a><div className="flex items-center gap-2"><select value={language} onChange={e=>setLanguage(e.target.value as Language)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">{languageOptions.map(x=><option key={x.code} value={x.code}>{x.flag} {x.label}</option>)}</select><a href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">← {t.back}</a></div></div></header>

    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_.65fr] lg:px-8 lg:py-16">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/60 md:p-9">
        <div className="text-xs font-black uppercase tracking-[.2em] text-orange-500">{t.eyebrow}</div><h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">{t.intro}</p>
        <form onSubmit={submit} className="mt-8 grid gap-6">
          <label className="font-bold text-slate-800">{t.serial} *<input value={serial} onChange={e=>setSerial(e.target.value.toUpperCase())} required maxLength={100} className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fffaf5] px-4 py-4 font-mono text-base font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label>
          {(brand||family)&&<div className="grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:grid-cols-2">{brand&&<div><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.brand}</div><div className="mt-1 text-lg font-black text-emerald-950">{brand}</div></div>}{family&&<div><div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t.family}</div><div className="mt-1 text-sm font-bold text-emerald-900">{family}</div></div>}</div>}
          {showVin&&<div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5"><div className="text-sm font-black uppercase tracking-wider text-sky-700">{t.officialData}</div><p className="mt-2 text-sm leading-6 text-slate-600">{officialHondaLookup?t.vinHonda:t.vinOptional}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="font-bold text-slate-800">{t.vin}{officialHondaLookup?" *":""}<input name="vin" required={officialHondaLookup} maxLength={32} autoCapitalize="characters" autoComplete="off" placeholder="1HG..." className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono uppercase outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"/></label>{officialHondaLookup&&<label className="font-bold text-slate-800">{t.postal} *<input name="postalCode" required maxLength={20} autoComplete="postal-code" placeholder="90210" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"/></label>}</div></div>}
          <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5"><div className="text-sm font-black uppercase tracking-wider text-orange-700">{t.delivery}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block font-bold">{t.email} *<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label><label className="block font-bold">{t.confirmEmail} *<input name="confirmEmail" type="email" required autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label></div><p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{t.emailHelp}</p>{phoneRequired&&<div className="mt-5"><div className="grid gap-3 sm:grid-cols-[1.05fr_1.4fr]"><label className="block font-bold">{t.country} *<select value={countryDial} onChange={e=>setCountryDial(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">{countries.map((x,i)=><option key={`${x.code}-${x.dial}-${i}`} value={x.dial}>{x.name} ({x.dial})</option>)}</select></label><label className="block font-bold">{t.phone} *<div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"><span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 font-black text-slate-600">{countryDial}</span><input name="phone" type="tel" inputMode="tel" required autoComplete="tel-national" placeholder="664 123 4567" className="min-w-0 flex-1 px-4 py-3 outline-none"/></div></label></div><p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{t.phoneHelp}</p></div>}</div>
          <label className={`cursor-pointer rounded-2xl border p-5 transition ${prioritySms?"border-orange-300 bg-orange-50":"border-slate-200 bg-white"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={prioritySms} onChange={e=>setPrioritySms(e.target.checked)} className="mt-1 h-5 w-5 accent-orange-500"/><div><div className="font-black">📱 {t.sms}</div><div className="mt-1 text-sm leading-6 text-slate-600">{t.smsText}</div></div></div></label>
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5 text-white"><span className="font-semibold text-slate-300">{t.total}</span><span className="text-3xl font-black">${total} USD</span></div>
          {message&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{message}</div>}
          <button disabled={busy} className="rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60">{busy?t.opening:`${t.pay} →`}</button>
        </form>
      </div>

      <aside className="space-y-5">
        <div className="relative min-h-64 overflow-hidden rounded-[2rem] border border-orange-100 bg-slate-900 shadow-lg"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${requestPhoto})`}}/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"/><div className="absolute bottom-0 left-0 right-0 p-6 text-white"><div className="text-xs font-black uppercase tracking-[.18em] text-orange-300">AUTO STEREO CODES</div><div className="mt-2 text-2xl font-black">{brand||"Tu radio, identificado antes del pago"}</div>{family&&<div className="mt-1 text-sm font-semibold text-white/80">{family}</div>}</div></div>
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="text-3xl">🔒</div><h2 className="mt-4 text-2xl font-black">{t.safe}</h2><p className="mt-3 leading-7 text-slate-600">{t.safeText}</p></div>
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">{t.next}</h2><div className="mt-4 space-y-3 text-sm leading-6 text-slate-600"><p>{t.n1}</p><p>{t.n2}</p><p>{t.n3}</p></div></div>
        <div className="rounded-[2rem] bg-orange-500 p-6 text-white"><div className="font-black">{t.help}</div><a href="/radio-codes" className="mt-3 inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-950">{t.guides} →</a></div>
      </aside>
    </section>
  </main>;
}
