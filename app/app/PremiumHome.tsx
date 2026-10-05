"use client";

import { useState } from "react";
import CheckoutRequestForm from "./CheckoutRequestForm";
import UniversalSerialFinder from "./UniversalSerialFinder";
import { languageOptions, type Language } from "./languages";

const HERO_IMAGE = "https://images.unsplash.com/photo-1738181957156-1379f9098688?auto=format&fit=crop&fm=jpg&q=82&w=2400";

const tickerBrands = [
  "HONDA","ACURA","FORD","VOLKSWAGEN","AUDI","SEAT","ŠKODA","NISSAN","RENAULT","DACIA","TOYOTA","LEXUS",
  "FIAT","ALFA ROMEO","LANCIA","PEUGEOT","CITROËN","MERCEDES-BENZ","BMW","MINI","JEEP","CHRYSLER","DODGE",
  "LAND ROVER","JAGUAR","OPEL","VAUXHALL","PORSCHE","MAZDA","MITSUBISHI","CHEVROLET"
];

const families = [
  {name:"Ford / Visteon", serials:"V123456 · M123456 · C7…", note:"Older Ford families plus Visteon/TravelPilot formats."},
  {name:"Volkswagen Group", serials:"VWZ… · AUZ… · SEZ… · SKZ…", note:"Distinct prefixes for Volkswagen, Audi, SEAT and Škoda."},
  {name:"Honda / Acura", serials:"U2154 L2135 · S/N 2602353", note:"On-screen U/L or S/N formats on many factory radios."},
  {name:"Nissan / Clarion / Blaupunkt", serials:"CL… · PN… · PP… · BP… · DW…", note:"Several radio makers and some units require extra device/date information."},
  {name:"Renault / Dacia", serials:"A123 · 2811… · 8200… · 7700…", note:"Older precode families and label/VIN-based systems."},
  {name:"FCA / Stellantis", serials:"T00AM… · A2C… · A3C… · 815CM… · BP…", note:"Shared radio families across Fiat, Alfa, Lancia, Jeep, Chrysler and Dodge."},
  {name:"Mercedes / Becker", serials:"AL… · MF… · BE…", note:"Older Alpine, Audio and Becker radio families."},
  {name:"Toyota / Lexus", serials:"16-character ERC", note:"Some Japanese-market units expose an ERC; many other units do not use a typed code."},
];

type Copy = {
  menu:string; home:string; codes:string; how:string; serial:string; help:string; faq:string; contact:string;
  strip1:string;strip2:string;strip3:string;badge:string;heroA:string;heroB:string;heroText:string;heroHelp:string;
  stat1:string;stat2:string;stat3:string;
  ticker:string; codesTitle:string; codesSub:string; formatTitle:string; formatSub:string;
  howTitle:string;howSub:string;s1:string;s1t:string;s2:string;s2t:string;s3:string;s3t:string;
  whyTitle:string;whySub:string;why1:string;why1t:string;why2:string;why2t:string;why3:string;why3t:string;why4:string;why4t:string;
  helpTitle:string;helpSub:string;help1:string;help1t:string;help2:string;help2t:string;help3:string;help3t:string;
  faqTitle:string;q1:string;a1:string;q2:string;a2:string;q3:string;a3:string;q4:string;a4:string;
  ready:string;readyText:string;order:string;footer:string;photo:string;
};

const EN: Copy = {
  menu:"Menu",home:"Home",codes:"Radio families",how:"How it works",serial:"Find serial",help:"Help centre",faq:"FAQ",contact:"Contact",
  strip1:"Universal serial-format matcher",strip2:"Secure PayPal checkout",strip3:"6 languages",
  badge:"Independent car radio code service",heroA:"Identify the radio.",heroB:"Then request the right code.",heroText:"Start with the serial number from your factory stereo. Our matcher checks known radio-family formats and, when a serial can belong to several makes, shows the possible options before you order.",heroHelp:"Don’t know your serial? Open the visual guide",
  stat1:"Serial-first ordering",stat2:"Multiple-match detection",stat3:"Manual review when ambiguous",
  ticker:"Common vehicle brands and radio families",
  codesTitle:"One search box for many radio families",codesSub:"The serial often identifies the radio manufacturer more reliably than the vehicle badge. That is why one format can produce more than one possible make.",formatTitle:"Serial-format library",formatSub:"Examples below are recognition guides, not unlock codes. The library is designed to expand as we verify more radio families.",
  howTitle:"Identify → confirm → order",howSub:"A cleaner flow modeled around the way radio codes actually work.",s1:"Enter the radio serial",s1t:"Type the serial exactly as shown on screen or on the label. Spaces and punctuation are normalized for matching.",s2:"Confirm the likely radio family",s2t:"If one serial format appears in several makes, choose the option that matches your vehicle or radio label.",s3:"Complete the secure request",s3t:"Your serial is carried into the checkout form. The paid request is created only after PayPal confirms the payment.",
  whyTitle:"What makes this different",whySub:"The goal is not to guess a code. It is to identify the radio correctly before any code is requested.",why1:"Universal front-door",why1t:"Customers do not have to choose Honda, Ford or Nissan before they know what radio they have.",why2:"Ambiguity is shown",why2t:"BP, A2C, BE, T-series and other shared families can belong to multiple vehicle brands, so we show choices instead of pretending the serial is unique.",why3:"Real payment verification",why3t:"A request and reference are created only after a completed PayPal payment is verified server-side.",why4:"Human fallback",why4t:"If the serial pattern is not distinctive enough, the customer can continue for manual identification rather than receiving a made-up result.",
  helpTitle:"Help centre",helpSub:"Give customers useful answers before they pay.",help1:"Find my serial",help1t:"Visual instructions for on-screen serials, diagnostic menus and physical labels.",help2:"ERR / SAFE / WAIT",help2t:"Explain lockout messages and why customers should stop entering random codes.",help3:"Which data do I need?",help3t:"Some radio families need more than one identifier. The service can request extra information only when the detected family needs it.",
  faqTitle:"Frequently asked questions",q1:"Can a serial number identify the exact car every time?",a1:"No. A radio manufacturer can supply the same unit to several vehicle brands. Distinct prefixes such as VWZ or AUZ are strong matches, while BP or A2C can return several possibilities.",q2:"Does a universal radio-code formula exist?",a2:"No. Some older families can be calculated from the serial, while many modern codes are stored in manufacturer or specialist databases. A universal generator would be unreliable.",q3:"Why can the same serial family show several brands?",a3:"Because suppliers such as Blaupunkt, Bosch, Continental, Clarion, Visteon and Becker manufactured radios for multiple car companies.",q4:"What happens if the matcher is unsure?",a4:"The site clearly marks the result as ambiguous and allows manual review instead of guessing.",
  ready:"Ready to request your code?",readyText:"Use the serial matcher above first, or enter the serial directly below if you already know it is correct.",order:"Go to order form",footer:"© 2026 Auto Stereo Codes. Independent radio-code service. Vehicle and radio trademarks belong to their respective owners.",photo:"Hero photo: Giorgio Trovato / Unsplash"
};

const ES: Copy = {
  menu:"Menú",home:"Inicio",codes:"Familias de radio",how:"Cómo funciona",serial:"Encontrar serie",help:"Centro de ayuda",faq:"Preguntas",contact:"Contacto",
  strip1:"Identificador universal de series",strip2:"Pago seguro con PayPal",strip3:"6 idiomas",
  badge:"Servicio independiente de códigos de radio",heroA:"Identifica el radio.",heroB:"Después solicita el código correcto.",heroText:"Empieza con la serie de tu estéreo original. Nuestro identificador compara formatos conocidos y, cuando una misma serie puede pertenecer a varias marcas, te muestra las opciones antes de comprar.",heroHelp:"¿No sabes cuál es tu serie? Abre la guía visual",
  stat1:"Pedido basado en la serie",stat2:"Detección de varias coincidencias",stat3:"Revisión manual si hay duda",
  ticker:"Marcas y familias de radio comunes",
  codesTitle:"Un solo buscador para muchas familias de radio",codesSub:"La serie suele identificar al fabricante del radio mejor que el emblema del carro. Por eso un mismo formato puede corresponder a más de una marca.",formatTitle:"Biblioteca de formatos de serie",formatSub:"Los ejemplos sirven para reconocer familias, no son códigos de desbloqueo. La biblioteca seguirá creciendo conforme verifiquemos más radios.",
  howTitle:"Identifica → confirma → solicita",howSub:"Un proceso más claro basado en cómo funcionan realmente los códigos de radio.",s1:"Escribe la serie del radio",s1t:"Introduce la serie exactamente como aparece en la pantalla o etiqueta. El sistema normaliza espacios y signos para compararla.",s2:"Confirma la familia probable",s2t:"Si el formato se utiliza en varias marcas, elige la opción que coincida con tu vehículo o con la etiqueta del radio.",s3:"Completa la solicitud segura",s3t:"La serie pasa al formulario de pago. La solicitud pagada se crea únicamente después de que PayPal confirme el cobro.",
  whyTitle:"Qué hace diferente este sistema",whySub:"La meta no es adivinar un código. Primero identificamos correctamente el radio.",why1:"Entrada universal",why1t:"El cliente no tiene que escoger Honda, Ford o Nissan antes de saber qué radio tiene.",why2:"Mostramos la ambigüedad",why2t:"BP, A2C, BE, series T y otras familias aparecen en varias marcas; mostramos opciones en lugar de fingir que una serie siempre es única.",why3:"Verificación real del pago",why3t:"El pedido y el folio se crean solo después de verificar un pago completado por PayPal en el servidor.",why4:"Revisión humana",why4t:"Si el formato no permite identificar con certeza, el cliente puede continuar a revisión manual en lugar de recibir un resultado inventado.",
  helpTitle:"Centro de ayuda",helpSub:"Respuestas útiles antes de que el cliente pague.",help1:"Encontrar mi serie",help1t:"Instrucciones visuales para series en pantalla, menús de diagnóstico y etiquetas físicas.",help2:"ERR / SAFE / WAIT",help2t:"Explicamos bloqueos temporales y por qué no conviene seguir probando códigos al azar.",help3:"¿Qué datos necesito?",help3t:"Algunas familias requieren más de un dato. Podemos pedir información adicional solo cuando la familia identificada realmente la necesite.",
  faqTitle:"Preguntas frecuentes",q1:"¿La serie identifica el carro exacto siempre?",a1:"No. Un fabricante de radios puede vender la misma unidad a varias marcas. Prefijos como VWZ o AUZ son muy distintivos, mientras BP o A2C pueden devolver varias opciones.",q2:"¿Existe una fórmula universal para sacar todos los códigos?",a2:"No. Algunas familias antiguas sí pueden calcularse por serie, pero muchos radios modernos dependen de bases de datos del fabricante o proveedores especializados. Un generador universal no sería confiable.",q3:"¿Por qué una serie puede mostrar varias marcas?",a3:"Porque fabricantes como Blaupunkt, Bosch, Continental, Clarion, Visteon y Becker suministraron radios a varias armadoras.",q4:"¿Qué pasa si el sistema no está seguro?",a4:"La página lo marca como ambiguo y permite revisión manual en vez de adivinar.",
  ready:"¿Listo para solicitar tu código?",readyText:"Usa primero el identificador de arriba o escribe directamente la serie abajo si ya sabes que es correcta.",order:"Ir al formulario",footer:"© 2026 Auto Stereo Codes. Servicio independiente. Las marcas de vehículos y radios pertenecen a sus respectivos propietarios.",photo:"Foto principal: Giorgio Trovato / Unsplash"
};

const copy: Record<Language, Copy> = {
  en: EN,
  es: ES,
  pt:{...EN,menu:"Menu",home:"Início",codes:"Famílias de rádio",how:"Como funciona",serial:"Encontrar série",help:"Central de ajuda",faq:"Perguntas",contact:"Contato",badge:"Serviço independente de códigos de rádio",heroA:"Identifique o rádio.",heroB:"Depois solicite o código correto.",heroText:"Comece pelo número de série do rádio original. Nosso identificador compara formatos conhecidos e mostra opções quando uma mesma família é usada em várias marcas.",heroHelp:"Não sabe qual é o serial? Abra o guia visual",codesTitle:"Uma busca para muitas famílias de rádio",howTitle:"Identifique → confirme → solicite",whyTitle:"Um sistema feito para identificar antes de adivinhar",helpTitle:"Central de ajuda",faqTitle:"Perguntas frequentes",ready:"Pronto para solicitar seu código?",order:"Ir para o formulário"},
  fr:{...EN,menu:"Menu",home:"Accueil",codes:"Familles radio",how:"Comment ça marche",serial:"Trouver le numéro",help:"Centre d’aide",faq:"FAQ",contact:"Contact",badge:"Service indépendant de codes autoradio",heroA:"Identifiez l’autoradio.",heroB:"Puis demandez le bon code.",heroText:"Commencez par le numéro de série de l’autoradio. Notre outil compare les formats connus et affiche plusieurs options lorsqu’une même famille équipe plusieurs marques.",heroHelp:"Vous ne connaissez pas le numéro ? Ouvrir le guide",codesTitle:"Une recherche pour plusieurs familles",howTitle:"Identifier → confirmer → commander",whyTitle:"Identifier avant de deviner",helpTitle:"Centre d’aide",faqTitle:"Questions fréquentes",ready:"Prêt à demander votre code ?",order:"Aller au formulaire"},
  de:{...EN,menu:"Menü",home:"Start",codes:"Radiofamilien",how:"So funktioniert es",serial:"Seriennummer finden",help:"Hilfe-Center",faq:"FAQ",contact:"Kontakt",badge:"Unabhängiger Radiocode-Service",heroA:"Radio identifizieren.",heroB:"Dann den richtigen Code anfordern.",heroText:"Beginne mit der Seriennummer des Originalradios. Unser System vergleicht bekannte Formate und zeigt mehrere Optionen, wenn dieselbe Familie in mehreren Marken eingesetzt wurde.",heroHelp:"Seriennummer unbekannt? Anleitung öffnen",codesTitle:"Eine Suche für viele Radiofamilien",howTitle:"Identifizieren → bestätigen → bestellen",whyTitle:"Erst identifizieren, dann anfordern",helpTitle:"Hilfe-Center",faqTitle:"Häufige Fragen",ready:"Bereit für die Code-Anfrage?",order:"Zum Formular"},
  it:{...EN,menu:"Menu",home:"Home",codes:"Famiglie radio",how:"Come funziona",serial:"Trova seriale",help:"Centro assistenza",faq:"FAQ",contact:"Contatti",badge:"Servizio indipendente codici autoradio",heroA:"Identifica l’autoradio.",heroB:"Poi richiedi il codice giusto.",heroText:"Inizia dal numero di serie dell’autoradio originale. Il sistema confronta formati noti e mostra più opzioni quando la stessa famiglia è installata su marchi diversi.",heroHelp:"Non conosci il seriale? Apri la guida",codesTitle:"Una ricerca per molte famiglie radio",howTitle:"Identifica → conferma → ordina",whyTitle:"Identificare prima di indovinare",helpTitle:"Centro assistenza",faqTitle:"Domande frequenti",ready:"Pronto a richiedere il codice?",order:"Vai al modulo"},
};

export default function PremiumHome() {
  const [language,setLanguage]=useState<Language>("es");
  const [menuOpen,setMenuOpen]=useState(false);
  const [langOpen,setLangOpen]=useState(false);
  const t=copy[language];
  const nav=[[t.home,"#top"],[t.codes,"#codes"],[t.how,"#how"],[t.serial,"#serial-help"],[t.help,"#help"],[t.faq,"#faq"],[t.contact,"#contact"]];

  return <main id="top" className="min-h-screen bg-white text-slate-950">
    <style>{`@keyframes asc-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} .asc-marquee{animation:asc-marquee 34s linear infinite}.asc-marquee:hover{animation-play-state:paused}`}</style>

    <div className="bg-slate-950 px-5 py-2 text-[11px] font-bold text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2"><span>✓ {t.strip1}</span><span>🔒 {t.strip2}</span><span>🌐 {t.strip3}</span></div>
    </div>

    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#top" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-xl font-black text-white">ASC</span><div><div className="font-black tracking-tight">AUTO STEREO CODES</div><div className="text-[9px] font-bold tracking-[.22em] text-slate-400">IDENTIFY · UNLOCK · DRIVE</div></div></a>
        <nav className="hidden items-center gap-6 xl:flex">{nav.map(([label,href])=><a key={href} href={href} className="text-sm font-semibold text-slate-600 transition hover:text-red-500">{label}</a>)}</nav>
        <div className="flex items-center gap-2">
          <div className="relative"><button onClick={()=>setLangOpen(v=>!v)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">{languageOptions.find(x=>x.code===language)?.flag} {languageOptions.find(x=>x.code===language)?.label} ▾</button>{langOpen&&<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{languageOptions.map(item=><button key={item.code} onClick={()=>{setLanguage(item.code);setLangOpen(false)}} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"><span>{item.flag}</span>{item.label}</button>)}</div>}</div>
          <button onClick={()=>setMenuOpen(v=>!v)} className="rounded-xl border border-slate-200 px-3 py-2 font-black xl:hidden">☰</button>
        </div>
      </div>
      {menuOpen&&<div className="border-t border-slate-200 bg-white px-5 py-4 xl:hidden"><div className="mx-auto grid max-w-7xl gap-2">{nav.map(([label,href])=><a key={href} href={href} onClick={()=>setMenuOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50">{label}</a>)}</div></div>}
    </header>

    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{backgroundImage:`url(${HERO_IMAGE})`}} />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35" />
      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="text-white">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-300">{t.badge}</div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[.98] tracking-tight md:text-7xl">{t.heroA}<br/><span className="text-red-400">{t.heroB}</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">{t.heroText}</p>
          <a href="#serial-help" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-red-400 decoration-2 underline-offset-4">{t.heroHelp} →</a>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">{[t.stat1,t.stat2,t.stat3].map((x,i)=><div key={x} className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur"><div className="text-xl">{["⌁","⇄","✓"][i]}</div><div className="mt-2 text-sm font-bold text-slate-100">{x}</div></div>)}</div>
        </div>
        <UniversalSerialFinder language={language}/>
      </div>
      <div className="absolute bottom-2 left-4 text-[10px] text-white/60">{t.photo}</div>
    </section>

    <section className="overflow-hidden border-b border-slate-200 bg-white py-7">
      <div className="mx-auto mb-5 max-w-7xl px-5 text-center text-xs font-black uppercase tracking-[.2em] text-slate-400">{t.ticker}</div>
      <div className="asc-marquee flex w-max gap-3">{[...tickerBrands,...tickerBrands].map((name,i)=><div key={`${name}-${i}`} className="flex h-12 min-w-36 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-black text-slate-700 shadow-sm">{name}</div>)}</div>
    </section>

    <section id="codes" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center"><div className="text-xs font-black uppercase tracking-[.2em] text-red-500">SERIAL MATCH</div><h2 className="mt-4 text-4xl font-black md:text-5xl">{t.codesTitle}</h2><p className="mt-5 text-lg leading-8 text-slate-600">{t.codesSub}</p></div>
        <div className="mt-14"><h3 className="text-2xl font-black">{t.formatTitle}</h3><p className="mt-2 max-w-3xl text-slate-600">{t.formatSub}</p></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{families.map(item=><article key={item.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-red-500">Radio family</div><h3 className="mt-3 text-xl font-black">{item.name}</h3><div className="mt-4 rounded-xl bg-slate-950 p-3 font-mono text-sm font-bold text-emerald-300">{item.serials}</div><p className="mt-4 text-sm leading-6 text-slate-600">{item.note}</p></article>)}</div>
      </div>
    </section>

    <section id="how" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="text-center"><h2 className="text-4xl font-black md:text-5xl">{t.howTitle}</h2><p className="mt-4 text-lg text-slate-600">{t.howSub}</p></div><div className="mt-14 grid gap-6 md:grid-cols-3">{[["01",t.s1,t.s1t],["02",t.s2,t.s2t],["03",t.s3,t.s3t]].map(([n,title,body])=><article key={n} className="rounded-3xl border border-slate-200 p-7"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 font-black text-white">{n}</div><h3 className="mt-6 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}</div></div>
    </section>

    <section className="bg-slate-950 py-24 text-white"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-3xl"><h2 className="text-4xl font-black md:text-5xl">{t.whyTitle}</h2><p className="mt-4 text-lg leading-8 text-slate-300">{t.whySub}</p></div><div className="mt-12 grid gap-5 md:grid-cols-2">{[[t.why1,t.why1t],[t.why2,t.why2t],[t.why3,t.why3t],[t.why4,t.why4t]].map(([a,b],i)=><article key={a} className="rounded-3xl border border-white/10 bg-white/5 p-7"><div className="text-2xl">{["⌕","⇄","🔒","👤"][i]}</div><h3 className="mt-4 text-xl font-black">{a}</h3><p className="mt-3 leading-7 text-slate-300">{b}</p></article>)}</div></div></section>

    <section id="help" className="bg-slate-50 py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="text-center"><h2 className="text-4xl font-black md:text-5xl">{t.helpTitle}</h2><p className="mt-4 text-lg text-slate-600">{t.helpSub}</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[["🔎",t.help1,t.help1t,"#serial-help"],["⚠️",t.help2,t.help2t,"#serial-help"],["🧾",t.help3,t.help3t,"#faq"]].map(([icon,a,b,href])=><a key={a} href={href} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="text-3xl">{icon}</div><h3 className="mt-5 text-xl font-black">{a}</h3><p className="mt-3 leading-7 text-slate-600">{b}</p><div className="mt-5 font-bold text-red-500">Open →</div></a>)}</div></div></section>

    <section id="faq" className="bg-white py-24"><div className="mx-auto max-w-4xl px-5"><h2 className="text-center text-4xl font-black md:text-5xl">{t.faqTitle}</h2><div className="mt-12 space-y-4">{[[t.q1,t.a1],[t.q2,t.a2],[t.q3,t.a3],[t.q4,t.a4]].map(([q,a])=><details key={q} className="group rounded-2xl border border-slate-200 bg-slate-50 p-6"><summary className="cursor-pointer list-none text-lg font-black">{q}<span className="float-right text-red-500 group-open:rotate-45">+</span></summary><p className="mt-4 leading-7 text-slate-600">{a}</p></details>)}</div></div></section>

    <section id="contact" className="bg-red-500 py-16 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between lg:px-8"><div><h2 className="text-3xl font-black md:text-4xl">{t.ready}</h2><p className="mt-2 max-w-2xl text-red-50">{t.readyText}</p></div><a href="#request-form" className="inline-flex shrink-0 rounded-xl bg-white px-6 py-4 font-black text-slate-950 shadow-lg">{t.order} →</a></div></section>

    <CheckoutRequestForm language={language}/>

    <footer className="border-t border-slate-800 bg-slate-950 px-5 py-10 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="font-black text-white">AUTO <span className="text-red-400">STEREO</span> CODES</div><div className="mt-1 text-xs">IDENTIFY · UNLOCK · DRIVE</div></div><div className="max-w-2xl text-xs leading-5">{t.footer}</div></div></footer>
  </main>;
}
