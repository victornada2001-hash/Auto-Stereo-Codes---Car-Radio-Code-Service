"use client";

import { useEffect, useState } from "react";

const HERO_PHOTO="https://images.unsplash.com/photo-1741243632885-49efead88024?auto=format&fit=crop&fm=jpg&q=82&w=2200";

const GUIDE_CARDS=[
  {
    eyebrow:"1 + 6 EN PANTALLA",
    title:"Anota el número de serie que aparece en la pantalla",
    body:(
      <>
        <p>Se instala en radios Honda sin pantalla de navegación. Enciende el contacto y la radio; a continuación, mantén pulsados simultáneamente los botones de presintonía <strong>1 y 6</strong> (en algunas radios, mantén pulsados a la vez los botones <strong>1, 6 y el de encendido</strong>) durante unos dos segundos hasta que cambie la pantalla.</p>
        <p className="mt-3">El número de serie aparece bien como un número «U» y un número «L» (por ejemplo, U2154 L2135), bien como un único número S/N (por ejemplo, S/N 2602353). Introduce el formato que aparezca en tu pantalla.</p>
      </>
    ),
    images:[
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-serial-number-screen.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-1-6-method-serial-screen.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-1-6-method-buttons.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-u-l-serial-on-screen.webp",
    ],
  },
  {
    eyebrow:"PANTALLA TÁCTIL (2013 Y POSTERIORES)",
    title:"Busca tu número de serie en el menú de diagnóstico",
    body:(
      <>
        <p>Para ver el número de serie en pantalla, abre la pantalla de diagnóstico oculta. Mantén pulsado uno de estos botones hasta que aparezca:</p>
        <p className="mt-3">• el botón de la parte superior de la radio + Encendido + Menú<br/>• Encendido + Expulsar + Inicio<br/>• Encendido + Menú + el botón Día/Noche (unos tres segundos)</p>
        <p className="mt-3">A continuación, pulsa «Información detallada y configuración» → «Comprobación de la unidad» → «Unidad HMI» o «Unidad DA» para ver tu número de serie. Pulsa «Volver» para salir.</p>
        <p className="mt-3">¿No hay botones de diagnóstico? Pulsa «Inicio» → «Menú de información» → «Información del sistema/dispositivo» → «Información del sistema» y lee el número del dispositivo.</p>
      </>
    ),
    images:[
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-touchscreen-diagnostics-serial.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-touchscreen-serial-example.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-ecu-serial-screen.webp",
    ],
  },
  {
    eyebrow:"NAVEGACIÓN ANTERIOR (2003 A 2012)",
    title:"Busca tu número de serie en el menú de diagnóstico",
    body:(
      <>
        <p>Incorporado en las unidades de navegación de muchos modelos fabricados entre 2003 y 2012. Con el contacto puesto, mantén pulsados a la vez los botones «Map» (o «Guide»), «Menu» y «Cancel» hasta que aparezca la pantalla de diagnóstico; a continuación, selecciona «Unit Check» y «Navi ECU» para ver el número de serie.</p>
        <p className="mt-3">En algunas unidades, en su lugar, hay que mantener pulsados los botones «SEEK» o «SKIP» junto con «CH» o «DISC», y a continuación «PWR/VOL»; el número de serie aparecerá en pantalla. Anótalo tal y como se muestra.</p>
      </>
    ),
    images:[
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-navigation-navi-ecu-serial.webp",
    ],
  },
  {
    eyebrow:"ETIQUETAS Y EJEMPLOS DE PANTALLAS",
    title:"Cómo es tu número de serie",
    body:(
      <>
        <p>Estos son ejemplos reales de números de serie de Honda, tanto en la etiqueta de la radio como en la pantalla, para que puedas ver exactamente lo que estás buscando.</p>
        <p className="mt-3">Si el número de serie no aparece en la pantalla, retira la unidad con las llaves de liberación DIN o con un destornillador plano y deslízala hacia delante. El número de serie se encuentra en una etiqueta adhesiva situada en la parte superior, lateral o trasera de la carcasa, y suele tener entre 6 y 14 caracteres (por ejemplo, 954LR052 o SN500074). Introdúcelo tal y como aparece impreso.</p>
      </>
    ),
    images:[
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-serial-number-label.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-6-digit-example.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-example-1.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-example-2.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-example-3.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-example-4.webp",
      "https://www.onlineradiocodes.co.uk/storage/guide-images/honda-radio-code-label-example-5.webp",
    ],
  },
];

function MiniCarousel({images,title}:{images:string[];title:string}){
  const [index,setIndex]=useState(0);
  useEffect(()=>{
    if(images.length<2) return;
    const timer=window.setInterval(()=>setIndex(current=>(current+1)%images.length),3000);
    return ()=>window.clearInterval(timer);
  },[images.length]);

  function previous(){setIndex(current=>(current-1+images.length)%images.length);}
  function next(){setIndex(current=>(current+1)%images.length);}

  return <div className="relative overflow-hidden rounded-2xl bg-slate-950">
    <div className="relative aspect-[16/10] overflow-hidden">
      {images.map((src,i)=><img key={src} src={src} alt={`${title} · ejemplo ${i+1}`} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${i===index?"opacity-100":"pointer-events-none opacity-0"}`}/>) }
    </div>
    {images.length>1&&<>
      <button type="button" onClick={previous} aria-label="Imagen anterior" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-2xl font-black text-white backdrop-blur hover:bg-black/75">‹</button>
      <button type="button" onClick={next} aria-label="Imagen siguiente" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-2xl font-black text-white backdrop-blur hover:bg-black/75">›</button>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">{images.map((_,i)=><button key={i} type="button" onClick={()=>setIndex(i)} aria-label={`Ver imagen ${i+1}`} className={`h-2 rounded-full transition-all ${i===index?"w-6 bg-red-500":"w-2 bg-white/65"}`}/>)}</div>
    </>}
  </div>;
}

export default function HondaAcuraHome(){
  return <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="/" className="text-xl font-black tracking-tight">AutoStereoCodes</a>
        <div className="flex items-center gap-3"><a href="#serie" className="hidden text-sm font-bold text-slate-600 sm:inline">Cómo sacar la serie</a><a href="/solicitar" className="rounded-xl bg-[#d71920] px-5 py-3 text-sm font-black uppercase text-white shadow-sm transition hover:bg-[#b4151b]">Solicitar código</a></div>
      </div>
    </header>

    <section className="relative isolate overflow-hidden bg-[#0b1118] px-5 py-24 text-white md:py-32">
      <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-50" style={{backgroundImage:`url(${HERO_PHOTO})`}} aria-hidden="true"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071018] via-[#071018]/90 to-[#071018]/35" aria-hidden="true"/>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-sm font-black uppercase tracking-[.24em] text-red-400">Honda + Acura</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Recupera el código de tu radio Honda o Acura</h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">Primero identifica la serie de tu estéreo con la guía visual. Cuando la tengas, abre la solicitud en una pantalla aparte.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="/solicitar" className="rounded-xl bg-[#d71920] px-7 py-4 font-black uppercase text-white shadow-xl">Solicitar mi código</a><a href="#serie" className="rounded-xl border border-white/25 bg-white/10 px-7 py-4 font-black uppercase text-white backdrop-blur">Ver cómo sacar la serie</a></div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] text-white/45">Foto: Abhinand Venugopal / Unsplash</div>
    </section>

    <section className="px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[['1','Identifica la serie','Usa una de las cuatro guías según el tipo de radio que tengas.'],['2','Llena la solicitud','Marca, año, modelo, serie y al menos un medio de contacto.'],['3','Realiza el pago','PayPal abre aparte para que AutoStereoCodes permanezca abierto.']].map(([n,t,d])=><div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 font-black text-[#d71920]">{n}</div><h2 className="mt-4 text-xl font-black">{t}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}
      </div>
    </section>

    <section id="serie" className="border-y border-slate-200 bg-white px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.22em] text-[#d71920]">Guía visual</div><h2 className="mt-3 text-3xl font-black sm:text-4xl">Cómo encontrar el número de serie de tu Honda</h2><p className="mt-4 leading-7 text-slate-600">La siguiente guía te indicará dónde encontrar el número de serie según el tipo de radio. Las galerías cambian automáticamente cada 3 segundos y también puedes moverlas con las flechas.</p></div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          {GUIDE_CARDS.map(card=><article key={card.eyebrow} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4"><MiniCarousel images={card.images} title={card.title}/></div>
            <div className="px-6 pb-7">
              <div className="text-xs font-black uppercase tracking-[.18em] text-[#d71920]">{card.eyebrow}</div>
              <h3 className="mt-2 text-xl font-black">{card.title}</h3>
              <div className="mt-3 text-sm leading-6 text-slate-600">{card.body}</div>
            </div>
          </article>)}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Cómo es el número de serie de tu Honda</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[['Standard (U/L)','U2154 L2135'],['S/N','S/N 15517841'],['Touchscreen','975GU294'],['Navigation','HFB22016680'],['Mitsubishi','954LR052'],['Accessory','FGZ24253655JC'],['SN-Series','SN500074'],['Numeric','22081908']].map(([kind,value])=><div key={kind} className="rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="text-[10px] font-black uppercase tracking-wider text-red-500">{kind}</div><div className="mt-1 font-mono text-sm font-black text-slate-800">{value}</div></div>)}</div>
        </div>

        <div className="mt-8 text-center"><a href="/solicitar" className="inline-flex rounded-xl bg-[#d71920] px-8 py-4 font-black uppercase text-white">Ya tengo mi serie · Solicitar código</a></div>
      </div>
    </section>

    <section className="px-5 py-14 text-center"><div className="mx-auto max-w-3xl"><h2 className="text-2xl font-black">Especializado únicamente en Honda y Acura</h2><p className="mt-3 leading-7 text-slate-600">La página, el formulario y el panel están enfocados en códigos de radio para estas dos marcas.</p></div></section>
    <footer className="bg-[#101820] px-5 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} AutoStereoCodes · Honda & Acura Radio Codes</footer>
  </main>;
}
