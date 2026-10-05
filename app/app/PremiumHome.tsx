"use client";

import { useState } from "react";
import Image from "next/image";
import CheckoutRequestForm from "./CheckoutRequestForm";
import { languageOptions, type Language } from "./languages";

const HERO_IMAGE = "https://images.unsplash.com/photo-1738181957156-1379f9098688?auto=format&fit=crop&fm=jpg&q=82&w=2400";

const brands = [
  { name: "HONDA", logo: "/brands/honda.svg" },
  { name: "ACURA", logo: "/brands/acura.svg" },
  { name: "TOYOTA", logo: "/brands/toyota.svg" },
  { name: "NISSAN", logo: "/brands/nissan.svg" },
  { name: "FORD", logo: "/brands/ford.svg" },
  { name: "CHEVROLET", logo: "/brands/chevrolet.svg" },
  { name: "VOLKSWAGEN", logo: "/brands/volkswagen.svg" },
  { name: "BMW", logo: "/brands/bmw.svg" },
  { name: "MERCEDES-BENZ", logo: "/brands/mercedes-benz.svg" },
  { name: "AUDI", logo: "/brands/audi.svg" },
];

type Copy = {
  home:string; codes:string; how:string; serial:string; help:string; faq:string; contact:string;
  top1:string; top2:string; top3:string; badge:string; h1a:string; h1b:string; hero:string; primary:string; secondary:string;
  priceLabel:string; priceText:string; secure:string; delivery:string; multilingual:string;
  brandTitle:string; brandSub:string; howTitle:string; howSub:string; s1:string; s1t:string; s2:string; s2t:string; s3:string; s3t:string;
  helpTitle:string; helpSub:string; hCard1:string; hCard1t:string; hCard2:string; hCard2t:string; hCard3:string; hCard3t:string;
  whyTitle:string; why1:string; why1t:string; why2:string; why2t:string; why3:string; why3t:string; why4:string; why4t:string;
  faqTitle:string; q1:string; a1:string; q2:string; a2:string; q3:string; a3:string; q4:string; a4:string;
  supportTitle:string; supportText:string; supportButton:string; formTitle:string; formText:string;
  footer:string; photo:string;
};

const en: Copy = {
  home:"Home",codes:"All radio codes",how:"How it works",serial:"Find your serial",help:"Help centre",faq:"FAQ",contact:"Contact",
  top1:"Secure PayPal checkout",top2:"6 languages",top3:"Email delivery + optional priority SMS",badge:"Car radio unlock code service",
  h1a:"Unlock your car radio.",h1b:"Simple, secure, guided.",hero:"Enter the serial number from your factory stereo, complete secure payment and receive your unlock code at the email address you choose.",primary:"Get my radio code",secondary:"I don't know my serial number",
  priceLabel:"Service price",priceText:"$23.99 USD",secure:"Secure checkout",delivery:"Delivered to your email",multilingual:"Multilingual guidance",
  brandTitle:"Radio codes for major vehicle brands",brandSub:"One streamlined service for factory stereos across popular manufacturers.",
  howTitle:"How it works",howSub:"A simpler order flow with the information that actually matters.",s1:"Find the stereo serial",s1t:"Use our detailed visual guide to locate the serial on screen or on the radio label.",s2:"Enter your serial and email",s2t:"No VIN, year or vehicle details are required in the new streamlined form.",s3:"Pay and receive your code",s3t:"Pay securely with PayPal. We create the request only after payment is confirmed.",
  helpTitle:"Help before you pay",helpSub:"Use these resources to make sure you submit the correct serial number.",hCard1:"Honda / Acura serial guide",hCard1t:"1 + 6 + PWR/VOL, touchscreen diagnostics, older navigation units and label examples.",hCard2:"Serial number examples",hCard2t:"See common U/L, S/N, touchscreen, navigation and printed-label formats.",hCard3:"Radio shows ERR / WAIT",hCard3t:"Learn what a temporary radio lockout means before trying more codes.",
  whyTitle:"Built around a clear order experience",why1:"One simple form",why1t:"Stereo serial + email. Add a mobile number only if you choose priority SMS.",why2:"Secure payment",why2t:"Payment is handled through PayPal; card details are not stored by Auto Stereo Codes.",why3:"Six languages",why3t:"English, Spanish, Portuguese, French, German and Italian are available from the same site.",why4:"Private order panel",why4t:"Paid requests are organized in a private administrator panel for processing and delivery.",
  faqTitle:"Frequently asked questions",q1:"Is the VIN the same as the stereo serial?",a1:"No. The VIN identifies the vehicle. The stereo serial identifies the radio itself.",q2:"What if I cannot find my serial?",a2:"Open the detailed serial guide below. It includes several Honda / Acura methods plus physical-label guidance.",q3:"How do I receive my code?",a3:"We send it to the email address entered during checkout. Priority SMS is available as an optional add-on.",q4:"When is my order created?",a4:"Only after PayPal confirms a completed payment. At that point a reference number is generated.",
  supportTitle:"Need help before ordering?",supportText:"Start with the serial-number guide. If your radio does not match the examples, contact support before submitting the order.",supportButton:"Open serial guide",
  formTitle:"Ready to order?",formText:"Enter your stereo serial and the email where you want to receive your code.",footer:"© 2026 Auto Stereo Codes. Independent radio-code service.",photo:"Hero photo: Giorgio Trovato / Unsplash"
};

const copy: Record<Language, Copy> = {
  en,
  es:{...en,home:"Inicio",codes:"Todos los códigos",how:"Cómo funciona",serial:"Encontrar serie",help:"Centro de ayuda",faq:"Preguntas",contact:"Contacto",top1:"Pago seguro con PayPal",top2:"6 idiomas",top3:"Entrega por email + SMS prioritario opcional",badge:"Servicio de códigos para autorradios",h1a:"Desbloquea el radio de tu auto.",h1b:"Simple, seguro y guiado.",hero:"Introduce la serie de tu estéreo original, completa el pago seguro y recibe el código de desbloqueo en el correo que elijas.",primary:"Obtener mi código",secondary:"No sé qué serie poner",priceLabel:"Precio del servicio",secure:"Pago seguro",delivery:"Entrega a tu correo",multilingual:"Guía en varios idiomas",brandTitle:"Códigos para las principales marcas",brandSub:"Un solo servicio para estéreos originales de fabricantes populares.",howTitle:"Cómo funciona",howSub:"Un proceso de compra más sencillo con los datos que realmente necesitamos.",s1:"Encuentra la serie del estéreo",s1t:"Usa nuestra guía visual para localizar la serie en la pantalla o en la etiqueta del radio.",s2:"Introduce serie y correo",s2t:"El nuevo formulario ya no requiere VIN, año ni datos del vehículo.",s3:"Paga y recibe tu código",s3t:"Paga de forma segura con PayPal. La solicitud se crea únicamente después de confirmar el pago.",helpTitle:"Ayuda antes de pagar",helpSub:"Usa estos recursos para asegurarte de enviar la serie correcta.",hCard1:"Guía Honda / Acura",hCard1t:"1 + 6 + PWR/VOL, diagnóstico de pantalla táctil, navegación anterior y etiquetas.",hCard2:"Ejemplos de series",hCard2t:"Consulta formatos U/L, S/N, pantalla táctil, navegación y etiquetas impresas.",hCard3:"El radio muestra ERR / WAIT",hCard3t:"Consulta qué significa un bloqueo temporal antes de seguir intentando códigos.",whyTitle:"Una experiencia de compra más clara",why1:"Un formulario sencillo",why1t:"Serie del estéreo + correo. Solo pedimos celular si eliges SMS prioritario.",why2:"Pago seguro",why2t:"PayPal procesa el pago; Auto Stereo Codes no almacena los datos de tu tarjeta.",why3:"Seis idiomas",why3t:"Inglés, español, portugués, francés, alemán e italiano desde el mismo sitio.",why4:"Panel privado de pedidos",why4t:"Las solicitudes pagadas se organizan en un panel privado para procesarlas y entregar el código.",faqTitle:"Preguntas frecuentes",q1:"¿El VIN es lo mismo que la serie del estéreo?",a1:"No. El VIN identifica al vehículo; la serie identifica al radio.",q2:"¿Qué hago si no encuentro la serie?",a2:"Abre la guía detallada de abajo. Incluye varios métodos Honda / Acura y cómo localizar la etiqueta física.",q3:"¿Cómo recibo mi código?",a3:"Lo enviamos al correo indicado al pagar. El SMS prioritario está disponible como opción adicional.",q4:"¿Cuándo se crea mi pedido?",a4:"Solamente después de que PayPal confirme el pago. En ese momento se genera tu folio.",supportTitle:"¿Necesitas ayuda antes de comprar?",supportText:"Empieza por la guía de número de serie. Si tu radio no coincide con los ejemplos, consulta antes de enviar tu pedido.",supportButton:"Abrir guía de series",formTitle:"¿Listo para solicitarlo?",formText:"Introduce la serie del estéreo y el correo donde quieres recibir tu código.",footer:"© 2026 Auto Stereo Codes. Servicio independiente de códigos de radio.",photo:"Foto principal: Giorgio Trovato / Unsplash"},
  pt:{...en,home:"Início",codes:"Todos os códigos",how:"Como funciona",serial:"Encontrar série",help:"Central de ajuda",faq:"Perguntas",contact:"Contato",top1:"Pagamento seguro via PayPal",top2:"6 idiomas",top3:"Entrega por e-mail + SMS prioritário opcional",badge:"Serviço de código para rádio automotivo",h1a:"Desbloqueie o rádio do seu carro.",h1b:"Simples, seguro e guiado.",hero:"Digite o número de série do rádio original, conclua o pagamento seguro e receba o código no e-mail escolhido.",primary:"Obter meu código",secondary:"Não sei qual série informar",brandTitle:"Códigos para as principais marcas",brandSub:"Um serviço simples para rádios originais de fabricantes populares.",howTitle:"Como funciona",howSub:"Um processo mais simples com apenas os dados necessários.",helpTitle:"Ajuda antes de pagar",helpSub:"Confira os recursos para enviar o número de série correto.",whyTitle:"Uma experiência de compra mais clara",faqTitle:"Perguntas frequentes",supportTitle:"Precisa de ajuda antes de comprar?",supportButton:"Abrir guia de séries",formTitle:"Pronto para pedir?",formText:"Digite o número de série e o e-mail onde deseja receber o código.",footer:"© 2026 Auto Stereo Codes. Serviço independente de códigos de rádio."},
  fr:{...en,home:"Accueil",codes:"Tous les codes",how:"Comment ça marche",serial:"Trouver le numéro",help:"Centre d’aide",faq:"FAQ",contact:"Contact",top1:"Paiement sécurisé PayPal",top2:"6 langues",top3:"Livraison par e-mail + SMS prioritaire en option",badge:"Service de codes d’autoradio",h1a:"Déverrouillez votre autoradio.",h1b:"Simple, sécurisé et guidé.",hero:"Saisissez le numéro de série de l’autoradio d’origine, payez en toute sécurité et recevez le code par e-mail.",primary:"Obtenir mon code",secondary:"Je ne connais pas mon numéro de série",brandTitle:"Codes pour les grandes marques",brandSub:"Un service simple pour les autoradios d’origine de nombreux constructeurs.",howTitle:"Comment ça marche",howSub:"Un parcours de commande simplifié avec uniquement les informations nécessaires.",helpTitle:"Aide avant de payer",helpSub:"Utilisez ces ressources pour envoyer le bon numéro de série.",whyTitle:"Une commande plus claire",faqTitle:"Questions fréquentes",supportTitle:"Besoin d’aide avant de commander ?",supportButton:"Ouvrir le guide",formTitle:"Prêt à commander ?",formText:"Saisissez le numéro de série et l’adresse e-mail de livraison.",footer:"© 2026 Auto Stereo Codes. Service indépendant de codes radio."},
  de:{...en,home:"Start",codes:"Alle Radiocodes",how:"So funktioniert es",serial:"Seriennummer finden",help:"Hilfe-Center",faq:"FAQ",contact:"Kontakt",top1:"Sichere PayPal-Zahlung",top2:"6 Sprachen",top3:"E-Mail-Zustellung + optionale Prioritäts-SMS",badge:"Autoradio-Code-Service",h1a:"Entsperre dein Autoradio.",h1b:"Einfach, sicher und geführt.",hero:"Gib die Seriennummer des Originalradios ein, bezahle sicher und erhalte den Entsperrcode per E-Mail.",primary:"Meinen Code erhalten",secondary:"Ich kenne meine Seriennummer nicht",brandTitle:"Codes für wichtige Automarken",brandSub:"Ein einfacher Service für Originalradios vieler Hersteller.",howTitle:"So funktioniert es",howSub:"Ein vereinfachter Bestellvorgang mit nur den nötigen Angaben.",helpTitle:"Hilfe vor der Zahlung",helpSub:"Nutze diese Informationen, um die richtige Seriennummer zu senden.",whyTitle:"Ein klarerer Bestellvorgang",faqTitle:"Häufige Fragen",supportTitle:"Brauchst du Hilfe vor der Bestellung?",supportButton:"Seriennummer-Anleitung öffnen",formTitle:"Bereit zu bestellen?",formText:"Gib Seriennummer und E-Mail-Adresse für die Zustellung ein.",footer:"© 2026 Auto Stereo Codes. Unabhängiger Radiocode-Service."},
  it:{...en,home:"Home",codes:"Tutti i codici",how:"Come funziona",serial:"Trova seriale",help:"Centro assistenza",faq:"FAQ",contact:"Contatti",top1:"Pagamento sicuro PayPal",top2:"6 lingue",top3:"Consegna email + SMS prioritario opzionale",badge:"Servizio codici autoradio",h1a:"Sblocca l’autoradio della tua auto.",h1b:"Semplice, sicuro e guidato.",hero:"Inserisci il numero di serie dell’autoradio originale, completa il pagamento sicuro e ricevi il codice via email.",primary:"Ottieni il mio codice",secondary:"Non conosco il numero di serie",brandTitle:"Codici per le principali marche",brandSub:"Un unico servizio per autoradio originali di molti produttori.",howTitle:"Come funziona",howSub:"Un processo d’ordine più semplice con solo i dati necessari.",helpTitle:"Aiuto prima del pagamento",helpSub:"Usa queste risorse per inviare il numero di serie corretto.",whyTitle:"Un’esperienza d’ordine più chiara",faqTitle:"Domande frequenti",supportTitle:"Serve aiuto prima dell’ordine?",supportButton:"Apri la guida seriale",formTitle:"Pronto per ordinare?",formText:"Inserisci il numero di serie e l’email dove vuoi ricevere il codice.",footer:"© 2026 Auto Stereo Codes. Servizio indipendente di codici radio."},
};

export default function PremiumHome() {
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[language];

  const nav = [
    [t.home, "#top"], [t.codes, "#codes"], [t.how, "#how"], [t.serial, "#serial-help"], [t.help, "#help"], [t.faq, "#faq"], [t.contact, "#contact"],
  ];

  return (
    <main id="top" className="min-h-screen bg-white text-slate-950">
      <div className="bg-emerald-400 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-950 sm:text-xs">
        <span className="mx-2">✓ {t.top1}</span><span className="mx-2">✓ {t.top2}</span><span className="mx-2 hidden md:inline">✓ {t.top3}</span>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <Image src="/brand-mark.svg" alt="Auto Stereo Codes" width={44} height={44} className="h-10 w-10 shrink-0" />
            <div className="min-w-0"><div className="truncate text-lg font-black tracking-tight">AUTO <span className="text-cyan-400">STEREO</span> CODES</div><div className="hidden text-[8px] font-semibold tracking-[0.24em] text-slate-500 sm:block">UNLOCK YOUR CAR STEREO</div></div>
          </a>

          <nav className="hidden items-center gap-5 xl:flex">
            {nav.map(([label, href]) => <a key={href} href={href} className="text-xs font-semibold text-slate-300 transition hover:text-cyan-300">{label}</a>)}
          </nav>

          <div className="flex items-center gap-2">
            <select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as Language)} className="max-w-36 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none">
              {languageOptions.map(x=><option key={x.code} value={x.code}>{x.flag} {x.label}</option>)}
            </select>
            <button onClick={()=>setMenuOpen(x=>!x)} className="rounded-xl border border-white/15 px-3 py-2 text-lg xl:hidden" aria-label="Menu">☰</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-white/10 bg-slate-950 px-5 py-4 xl:hidden"><div className="mx-auto grid max-w-7xl gap-1">{nav.map(([label,href])=><a key={href} href={href} onClick={()=>setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">{label}</a>)}</div></div>}
      </header>

      <section className="relative isolate min-h-[720px] overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${HERO_IMAGE})`}} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{t.badge}</div>
            <h1 className="mt-6 text-5xl font-black leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">{t.h1a}<br/><span className="text-cyan-300">{t.h1b}</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{t.hero}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#request-form" className="rounded-xl bg-emerald-400 px-7 py-4 text-center font-black text-slate-950 shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-300">{t.primary} →</a>
              <a href="#serial-help" className="rounded-xl border border-white/20 bg-white/10 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/15">{t.secondary}</a>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[ [t.priceLabel,t.priceText], [t.secure,"PayPal"], [t.delivery,"Email"] ].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{a}</div><div className="mt-1 font-black text-white">{b}</div></div>)}
            </div>
            <a href="https://unsplash.com/photos/a-close-up-of-a-car-dashboard-with-a-radio-vCeTniSobtg" target="_blank" rel="noreferrer" className="mt-5 inline-block text-[10px] text-slate-500 hover:text-slate-300">{t.photo}</a>
          </div>
        </div>
      </section>

      <section id="codes" className="border-b border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="mx-auto max-w-3xl text-center"><h2 className="text-4xl font-black tracking-tight">{t.brandTitle}</h2><p className="mt-4 text-lg text-slate-500">{t.brandSub}</p></div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{brands.map(b=><div key={b.name} className="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"><Image src={b.logo} alt={`${b.name} logo`} width={104} height={55} unoptimized className="h-12 w-auto max-w-28 object-contain opacity-75 transition group-hover:opacity-100"/><div className="mt-3 text-xs font-black tracking-wider text-slate-600">{b.name}</div></div>)}</div>
        </div>
      </section>

      <section id="how" className="bg-slate-950 py-24 text-white"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">01 — 03</div><h2 className="mt-4 text-4xl font-black md:text-5xl">{t.howTitle}</h2><p className="mt-4 text-lg text-slate-400">{t.howSub}</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[["01",t.s1,t.s1t,"⌕"],["02",t.s2,t.s2t,"✎"],["03",t.s3,t.s3t,"✓"]].map(([n,title,text,icon])=><article key={n} className="rounded-3xl border border-white/10 bg-slate-900 p-7"><div className="flex items-center justify-between"><span className="text-xs font-black tracking-widest text-cyan-300">STEP {n}</span><span className="text-2xl">{icon}</span></div><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-400">{text}</p></article>)}</div></div></section>

      <section id="help" className="bg-slate-50 py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="mx-auto max-w-3xl text-center"><div className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">Help centre</div><h2 className="mt-4 text-4xl font-black md:text-5xl">{t.helpTitle}</h2><p className="mt-4 text-lg text-slate-500">{t.helpSub}</p></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{[["1 + 6",t.hCard1,t.hCard1t],["S/N",t.hCard2,t.hCard2t],["ERR",t.hCard3,t.hCard3t]].map(([icon,title,text])=><a href="#serial-help" key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 font-black text-cyan-700">{icon}</div><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-500">{text}</p><div className="mt-5 text-sm font-black text-cyan-700">Open guide →</div></a>)}</div></div></section>

      <section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6 lg:px-8"><h2 className="max-w-3xl text-4xl font-black md:text-5xl">{t.whyTitle}</h2><div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">{[["01",t.why1,t.why1t],["02",t.why2,t.why2t],["03",t.why3,t.why3t],["04",t.why4,t.why4t]].map(([n,title,text])=><div key={n} className="border-t border-slate-200 pt-6"><div className="text-xs font-black tracking-widest text-emerald-600">{n}</div><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-500">{text}</p></div>)}</div></div></section>

      <section id="faq" className="bg-slate-50 py-24"><div className="mx-auto max-w-5xl px-6 lg:px-8"><h2 className="text-center text-4xl font-black md:text-5xl">{t.faqTitle}</h2><div className="mt-12 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6 md:px-8">{[[t.q1,t.a1],[t.q2,t.a2],[t.q3,t.a3],[t.q4,t.a4]].map(([q,a])=><details key={q} className="group py-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-black"><span>{q}</span><span className="text-cyan-600 transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl leading-7 text-slate-500">{a}</p></details>)}</div></div></section>

      <section id="contact" className="bg-gradient-to-br from-cyan-700 to-slate-950 py-20 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div className="max-w-2xl"><h2 className="text-3xl font-black md:text-4xl">{t.supportTitle}</h2><p className="mt-4 text-lg leading-8 text-cyan-50/80">{t.supportText}</p></div><a href="#serial-help" className="shrink-0 rounded-xl bg-white px-7 py-4 text-center font-black text-slate-950 hover:bg-cyan-50">{t.supportButton} →</a></div></section>

      <section className="bg-slate-950 px-6 pt-20 text-white"><div className="mx-auto max-w-3xl text-center"><div className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">$23.99 USD</div><h2 className="mt-4 text-4xl font-black md:text-5xl">{t.formTitle}</h2><p className="mt-4 text-lg text-slate-400">{t.formText}</p></div></section>

      <CheckoutRequestForm language={language} />

      <footer className="border-t border-white/10 bg-slate-950 py-10 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8"><div className="flex items-center gap-3"><Image src="/brand-mark.svg" alt="" width={36} height={36}/><span className="font-black text-slate-300">AUTO STEREO CODES</span></div><div>{t.footer}</div><div>PayPal · SSL · 6 languages</div></div></footer>
    </main>
  );
}
