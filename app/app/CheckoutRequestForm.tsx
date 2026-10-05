"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Language } from "./languages";
import ExpandedSerialGuide from "./ExpandedSerialGuide";
import SampleTestimonials from "./SampleTestimonials";

const BASE_PRICE = 23.99;
const SMS_ADDON = 1.75;

type Copy = {
  eyebrow:string;title:string;intro:string;serial:string;serialHelp:string;identified:string;delivery:string;email:string;
  smsTitle:string;smsText:string;phone:string;total:string;note:string;invalidPhone:string;invalid:string;opening:string;pay:string;paymentError:string;connectionError:string;
};

const EN: Copy = {
  eyebrow:"Code request",title:"Complete your request",intro:"Enter the stereo serial and the email where you want to receive the code. If you used the serial matcher above, the detected radio family is carried here automatically.",serial:"Stereo serial number *",serialHelp:"I don't know which serial number to enter",identified:"Detected radio family",delivery:"Where should we send your code?",email:"Email address *",smsTitle:"Priority SMS option",smsText:"Add priority handling and a text-message delivery option for +$1.75 USD (about MX$30).",phone:"Mobile number for SMS *",total:"Total",note:"Your paid request is created only after PayPal confirms the payment.",invalidPhone:"Enter a valid mobile number for the priority SMS option.",invalid:"Check your information before continuing.",opening:"Opening PayPal…",pay:"Continue to secure payment →",paymentError:"We could not start the payment. Please try again.",connectionError:"Unable to connect to the payment system. Please try again."
};
const ES: Copy = {
  eyebrow:"Solicitud de código",title:"Completa tu solicitud",intro:"Introduce la serie del estéreo y el correo donde quieres recibir el código. Si usaste el identificador de arriba, la familia detectada pasa automáticamente a este formulario.",serial:"Serie del estéreo *",serialHelp:"No sé qué número de serie poner",identified:"Familia de radio identificada",delivery:"¿A dónde te enviamos tu código?",email:"Correo electrónico *",smsTitle:"Opción SMS prioritario",smsText:"Agrega atención prioritaria y la opción de recibir el código por mensaje de texto por +$1.75 USD (aprox. MX$30).",phone:"Número celular para SMS *",total:"Total",note:"Tu solicitud pagada se crea únicamente después de que PayPal confirme el pago.",invalidPhone:"Escribe un número celular válido para usar SMS prioritario.",invalid:"Revisa tus datos antes de continuar.",opening:"Abriendo PayPal…",pay:"Continuar al pago seguro →",paymentError:"No pudimos iniciar el pago. Inténtalo de nuevo.",connectionError:"No pudimos conectar con el sistema de pagos. Inténtalo de nuevo."
};
const copy: Record<Language,Copy> = {
  en:EN,es:ES,
  pt:{...EN,eyebrow:"Solicitação de código",title:"Conclua sua solicitação",serial:"Número de série do rádio *",serialHelp:"Não sei qual número de série informar",identified:"Família de rádio identificada",delivery:"Onde devemos enviar seu código?",email:"E-mail *",smsTitle:"Opção SMS prioritário",phone:"Celular para SMS *",total:"Total",opening:"Abrindo PayPal…",pay:"Continuar para pagamento seguro →"},
  fr:{...EN,eyebrow:"Demande de code",title:"Finalisez votre demande",serial:"Numéro de série de l’autoradio *",serialHelp:"Je ne sais pas quel numéro saisir",identified:"Famille d’autoradio détectée",delivery:"Où devons-nous envoyer votre code ?",email:"Adresse e-mail *",smsTitle:"Option SMS prioritaire",phone:"Numéro mobile pour SMS *",total:"Total",opening:"Ouverture de PayPal…",pay:"Continuer vers le paiement sécurisé →"},
  de:{...EN,eyebrow:"Code-Anfrage",title:"Anfrage abschließen",serial:"Seriennummer des Autoradios *",serialHelp:"Ich weiß nicht, welche Seriennummer ich eingeben soll",identified:"Erkannte Radiofamilie",delivery:"Wohin sollen wir deinen Code senden?",email:"E-Mail-Adresse *",smsTitle:"Prioritäts-SMS",phone:"Mobilnummer für SMS *",total:"Gesamt",opening:"PayPal wird geöffnet…",pay:"Weiter zur sicheren Zahlung →"},
  it:{...EN,eyebrow:"Richiesta codice",title:"Completa la richiesta",serial:"Numero di serie dell’autoradio *",serialHelp:"Non so quale numero inserire",identified:"Famiglia autoradio identificata",delivery:"Dove dobbiamo inviare il codice?",email:"Indirizzo email *",smsTitle:"SMS prioritario",phone:"Numero di cellulare per SMS *",total:"Totale",opening:"Apertura PayPal…",pay:"Continua al pagamento sicuro →"},
};

export default function CheckoutRequestForm({language}:{language:Language}) {
  const t=copy[language];
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [prioritySms,setPrioritySms]=useState(false);
  const [serial,setSerial]=useState("");
  const [detectedBrand,setDetectedBrand]=useState("");
  const [radioFamily,setRadioFamily]=useState("");
  const total=(BASE_PRICE+(prioritySms?SMS_ADDON:0)).toFixed(2);
  const inputStyle="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20";

  useEffect(()=>{
    const load=()=>{
      setSerial(sessionStorage.getItem("asc_serial")||"");
      setDetectedBrand(sessionStorage.getItem("asc_detected_brand")||"");
      setRadioFamily(sessionStorage.getItem("asc_radio_family")||"");
    };
    load();
    const handler=(event:Event)=>{
      const detail=(event as CustomEvent<{serial?:string;brand?:string;family?:string}>).detail||{};
      setSerial(detail.serial||"");
      setDetectedBrand(detail.brand||"");
      setRadioFamily(detail.family||"");
    };
    window.addEventListener("asc:serial-match",handler);
    return()=>window.removeEventListener("asc:serial-match",handler);
  },[]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const phone=String(data.get("phone")||"").trim();
    if(prioritySms&&phone.replace(/\D/g,"").length<7){setMessage(t.invalidPhone);return;}
    setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        serial,email:data.get("email"),phone,prioritySms,language,detectedBrand,radioFamily
      })});
      const result=await response.json();
      if(!response.ok||!result.url){setMessage(result.code==="INVALID_INPUT"?t.invalid:t.paymentError);setBusy(false);return;}
      window.location.assign(result.url);
    }catch{setMessage(t.connectionError);setBusy(false);}
  }

  function editSerial(value:string){
    setSerial(value);
    setDetectedBrand("");
    setRadioFamily("");
    sessionStorage.removeItem("asc_detected_brand");
    sessionStorage.removeItem("asc_radio_family");
  }

  return <>
    <section id="request-form" className="scroll-mt-28 bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-black uppercase tracking-widest text-red-400">{t.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">{t.title}</h2>
        <p className="mt-4 leading-7 text-slate-300">{t.intro}</p>
        <form onSubmit={submit} className="mt-8 grid gap-6">
          <label>{t.serial}<input name="serial" value={serial} onChange={e=>editSerial(e.target.value)} required maxLength={100} autoComplete="off" className={inputStyle}/><a href="#serial-help" className="mt-2 inline-flex text-sm font-bold text-red-400 hover:text-red-300">↳ {t.serialHelp}</a></label>
          {(detectedBrand||radioFamily)&&<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5"><div className="text-xs font-black uppercase tracking-widest text-emerald-300">{t.identified}</div>{detectedBrand&&<div className="mt-2 text-lg font-black">{detectedBrand}</div>}{radioFamily&&<div className="mt-1 text-sm text-emerald-100/80">{radioFamily}</div>}</div>}
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5"><div className="text-sm font-black uppercase tracking-wider text-red-300">{t.delivery}</div><label className="mt-4 block">{t.email}<input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputStyle}/></label></div>
          <label className={`cursor-pointer rounded-2xl border p-5 transition ${prioritySms?"border-red-400 bg-red-500/10":"border-white/10 bg-slate-900"}`}><div className="flex items-start gap-3"><input type="checkbox" checked={prioritySms} onChange={e=>setPrioritySms(e.target.checked)} className="mt-1 h-5 w-5"/><div><div className="font-black">📱 {t.smsTitle}</div><div className="mt-1 text-sm leading-6 text-slate-300">{t.smsText}</div></div></div></label>
          {prioritySms&&<label>{t.phone}<input name="phone" type="tel" required autoComplete="tel" maxLength={32} placeholder="+52 664 123 4567" className={inputStyle}/></label>}
          <div className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 p-5"><span className="font-semibold text-slate-300">{t.total}</span><span className="text-2xl font-black">${total} USD</span></div>
          <p className="text-sm text-slate-400">{t.note}</p>
          {message&&<p role="alert" className="rounded-xl border border-amber-600 bg-amber-950 p-4 text-amber-100">{message}</p>}
          <button disabled={busy} type="submit" className="rounded-xl bg-red-500 px-6 py-4 font-black text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-60">{busy?t.opening:t.pay}</button>
        </form>
      </div>
    </section>
    <ExpandedSerialGuide language={language}/>
    <SampleTestimonials language={language}/>
  </>;
}
