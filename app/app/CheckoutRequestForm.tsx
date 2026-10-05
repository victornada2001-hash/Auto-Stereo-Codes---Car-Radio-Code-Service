"use client";

import { useState, type FormEvent } from "react";
import type { Language } from "./languages";
import ExpandedSerialGuide from "./ExpandedSerialGuide";
import SampleTestimonials from "./SampleTestimonials";

const BASE_PRICE = 23.99;
const SMS_ADDON = 1.75;

const copy: Record<Language, {
  eyebrow:string; title:string; intro:string; serial:string; serialHelp:string; delivery:string; email:string;
  smsTitle:string; smsText:string; phone:string; total:string; note:string; invalidPhone:string; invalid:string;
  opening:string; pay:string; paymentError:string; connectionError:string;
}> = {
  en:{eyebrow:"Code request",title:"Enter your stereo serial number",intro:"That is all we need to start. After payment is confirmed, your request and reference number will be created.",serial:"Stereo serial number *",serialHelp:"I don't know which serial number to enter",delivery:"Where should we send your code?",email:"Email address *",smsTitle:"Priority SMS alert",smsText:"Add priority handling and receive the code by text message for +$1.75 USD (about MX$30).",phone:"Mobile number for SMS *",total:"Total",note:"Your request is saved only after PayPal confirms the payment.",invalidPhone:"Enter a valid mobile number for the priority SMS option.",invalid:"Check your information before continuing.",opening:"Opening PayPal…",pay:"Continue to secure payment →",paymentError:"We could not start the payment. Please try again.",connectionError:"Unable to connect to the payment system. Please try again."},
  es:{eyebrow:"Solicitud de código",title:"Introduce la serie de tu estéreo",intro:"Eso es todo lo que necesitamos para comenzar. Después de confirmar el pago se creará tu solicitud y folio.",serial:"Serie del estéreo *",serialHelp:"No sé qué número de serie poner",delivery:"¿A dónde te enviamos tu código?",email:"Correo electrónico *",smsTitle:"Alerta prioritaria por SMS",smsText:"Agrega atención prioritaria y recibe el código por mensaje de texto por +$1.75 USD (aprox. MX$30).",phone:"Número celular para SMS *",total:"Total",note:"Tu solicitud se guarda solamente después de que PayPal confirme el pago.",invalidPhone:"Escribe un número celular válido para usar la opción de SMS prioritario.",invalid:"Revisa tus datos antes de continuar.",opening:"Abriendo PayPal…",pay:"Continuar al pago seguro →",paymentError:"No pudimos iniciar el pago. Inténtalo de nuevo.",connectionError:"No pudimos conectar con el sistema de pagos. Inténtalo de nuevo."},
  pt:{eyebrow:"Solicitação de código",title:"Digite o número de série do seu rádio",intro:"É só isso que precisamos para começar. Após a confirmação do pagamento, seu pedido e referência serão criados.",serial:"Número de série do rádio *",serialHelp:"Não sei qual número de série informar",delivery:"Onde devemos enviar seu código?",email:"E-mail *",smsTitle:"Alerta prioritário por SMS",smsText:"Adicione atendimento prioritário e receba o código por SMS por +US$1,75 (aprox. MX$30).",phone:"Celular para SMS *",total:"Total",note:"Seu pedido só é salvo depois que o PayPal confirma o pagamento.",invalidPhone:"Digite um número de celular válido para o SMS prioritário.",invalid:"Revise seus dados antes de continuar.",opening:"Abrindo o PayPal…",pay:"Continuar para pagamento seguro →",paymentError:"Não foi possível iniciar o pagamento. Tente novamente.",connectionError:"Não foi possível conectar ao sistema de pagamento. Tente novamente."},
  fr:{eyebrow:"Demande de code",title:"Saisissez le numéro de série de votre autoradio",intro:"C’est tout ce dont nous avons besoin pour commencer. Après confirmation du paiement, votre demande et votre référence seront créées.",serial:"Numéro de série de l’autoradio *",serialHelp:"Je ne sais pas quel numéro de série saisir",delivery:"Où devons-nous envoyer votre code ?",email:"Adresse e-mail *",smsTitle:"Alerte SMS prioritaire",smsText:"Ajoutez un traitement prioritaire et recevez le code par SMS pour +1,75 $US (env. MX$30).",phone:"Numéro mobile pour SMS *",total:"Total",note:"Votre demande n’est enregistrée qu’après confirmation du paiement par PayPal.",invalidPhone:"Saisissez un numéro mobile valide pour l’option SMS prioritaire.",invalid:"Vérifiez vos informations avant de continuer.",opening:"Ouverture de PayPal…",pay:"Continuer vers le paiement sécurisé →",paymentError:"Impossible de démarrer le paiement. Réessayez.",connectionError:"Impossible de se connecter au système de paiement. Réessayez."},
  de:{eyebrow:"Code-Anfrage",title:"Gib die Seriennummer deines Autoradios ein",intro:"Mehr brauchen wir zunächst nicht. Nach bestätigter Zahlung werden deine Anfrage und Referenz erstellt.",serial:"Seriennummer des Autoradios *",serialHelp:"Ich weiß nicht, welche Seriennummer ich eingeben soll",delivery:"Wohin sollen wir deinen Code senden?",email:"E-Mail-Adresse *",smsTitle:"Prioritäts-SMS",smsText:"Priorisierte Bearbeitung hinzufügen und den Code per SMS erhalten für +1,75 US$ (ca. MX$30).",phone:"Mobilnummer für SMS *",total:"Gesamt",note:"Deine Anfrage wird erst gespeichert, wenn PayPal die Zahlung bestätigt.",invalidPhone:"Gib für die Prioritäts-SMS eine gültige Mobilnummer ein.",invalid:"Bitte prüfe deine Angaben.",opening:"PayPal wird geöffnet…",pay:"Weiter zur sicheren Zahlung →",paymentError:"Die Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.",connectionError:"Keine Verbindung zum Zahlungssystem. Bitte erneut versuchen."},
  it:{eyebrow:"Richiesta codice",title:"Inserisci il numero di serie dell’autoradio",intro:"È tutto ciò che ci serve per iniziare. Dopo la conferma del pagamento verranno creati richiesta e riferimento.",serial:"Numero di serie dell’autoradio *",serialHelp:"Non so quale numero di serie inserire",delivery:"Dove dobbiamo inviare il codice?",email:"Indirizzo email *",smsTitle:"Avviso SMS prioritario",smsText:"Aggiungi gestione prioritaria e ricevi il codice via SMS per +1,75 USD (circa MX$30).",phone:"Numero di cellulare per SMS *",total:"Totale",note:"La richiesta viene salvata solo dopo la conferma del pagamento PayPal.",invalidPhone:"Inserisci un numero di cellulare valido per l’opzione SMS prioritario.",invalid:"Controlla i dati prima di continuare.",opening:"Apertura PayPal…",pay:"Continua al pagamento sicuro →",paymentError:"Impossibile avviare il pagamento. Riprova.",connectionError:"Impossibile collegarsi al sistema di pagamento. Riprova."},
};

export default function CheckoutRequestForm({ language }: { language: Language }) {
  const t = copy[language];
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [prioritySms, setPrioritySms] = useState(false);
  const total = (BASE_PRICE + (prioritySms ? SMS_ADDON : 0)).toFixed(2);
  const inputStyle = "mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") || "").trim();
    if (prioritySms && phone.replace(/\D/g, "").length < 7) {
      setMessage(t.invalidPhone);
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial: data.get("serial"),
          email: data.get("email"),
          phone,
          prioritySms,
          language,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        setMessage(result.code === "INVALID_INPUT" ? t.invalid : t.paymentError);
        setBusy(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage(t.connectionError);
      setBusy(false);
    }
  }

  return (
    <>
      <section id="request-form" className="scroll-mt-24 bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">{t.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{t.title}</h2>
          <p className="mt-4 text-slate-300">{t.intro}</p>

          <form onSubmit={submit} className="mt-8 grid gap-6">
            <label>{t.serial}
              <input name="serial" required maxLength={100} autoComplete="off" className={inputStyle} />
              <a href="#serial-help" className="mt-2 inline-flex text-sm font-semibold text-blue-400 hover:text-blue-300">↳ {t.serialHelp}</a>
            </label>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <div className="text-sm font-black uppercase tracking-wider text-blue-300">{t.delivery}</div>
              <label className="mt-4 block">{t.email}<input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputStyle} /></label>
            </div>

            <label className={`cursor-pointer rounded-2xl border p-5 transition ${prioritySms ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-slate-900"}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={prioritySms} onChange={e=>setPrioritySms(e.target.checked)} className="mt-1 h-5 w-5" />
                <div><div className="font-black">📱 {t.smsTitle}</div><div className="mt-1 text-sm leading-6 text-slate-300">{t.smsText}</div></div>
              </div>
            </label>

            {prioritySms && <label>{t.phone}<input name="phone" type="tel" required autoComplete="tel" maxLength={32} placeholder="+52 664 123 4567" className={inputStyle} /></label>}

            <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <span className="font-semibold text-slate-300">{t.total}</span><span className="text-2xl font-black">${total} USD</span>
            </div>

            <p className="text-sm text-slate-400">{t.note}</p>
            {message && <p role="alert" className="rounded-xl border border-amber-600 bg-amber-950 p-4 text-amber-100">{message}</p>}
            <button disabled={busy} type="submit" className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
              {busy ? t.opening : t.pay}
            </button>
          </form>
        </div>
      </section>
      <ExpandedSerialGuide language={language} />
      <SampleTestimonials language={language} />
    </>
  );
}
