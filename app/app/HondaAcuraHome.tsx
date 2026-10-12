const HERO_PHOTO="https://images.unsplash.com/photo-1741243632885-49efead88024?auto=format&fit=crop&fm=jpg&q=82&w=2200";

function RadioFigure(){
  return <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-950 p-5 shadow-inner">
    <div className="mx-auto mt-4 h-12 max-w-[85%] rounded-lg bg-slate-200 text-center font-mono text-lg font-black leading-[3rem] text-slate-900">U2154 L2135</div>
    <div className="mt-7 flex items-center justify-center gap-2"><div className="mr-3 grid h-14 w-14 place-items-center rounded-full border-4 border-red-400 bg-slate-800 text-xs font-black text-white">PWR</div>{[1,2,3,4,5,6].map(n=><div key={n} className={`grid h-11 w-9 place-items-center rounded-md border text-sm font-black text-white ${n===1||n===6?"border-red-300 bg-red-600":"border-slate-600 bg-slate-800"}`}>{n}</div>)}</div>
  </div>;
}

function ScreenFigure(){
  return <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-inner"><div className="h-full rounded-xl border-4 border-slate-700 bg-slate-950 p-5 text-slate-300"><div className="text-lg font-black text-white">System Settings</div><div className="mt-5 flex justify-between border-t border-slate-700 pt-4"><span>Model</span><span className="font-bold text-white">NR-0000UH</span></div><div className="mt-4 flex justify-between"><span>Serial No.</span><span className="rounded bg-red-600 px-3 py-1 font-mono font-black text-white">975GU294</span></div></div></div>;
}

function LabelFigure(){
  return <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-300 p-6 shadow-inner"><div className="h-full rotate-[-1deg] rounded-lg border-2 border-slate-400 bg-white p-5"><div className="text-xl font-black">RADIO UNIT</div><div className="mt-3 text-sm text-slate-500">MODEL 39101-S5A-E010-M1</div><div className="mt-6 text-xs font-black text-slate-700">SERIAL NO.</div><div className="mt-1 inline-block border-2 border-red-500 bg-red-50 px-4 py-2 font-mono text-xl font-black text-red-900">B1015167</div></div></div>;
}

const guides=[
  {eyebrow:"RADIO CON BOTONES",title:"Mantén 1 + 6 y enciende el radio",body:"En muchos Honda y Acura con botones físicos, mantén presionados 1 y 6 y luego presiona el botón de encendido/volumen. La pantalla puede mostrar la serie en una o dos partes.",figure:<RadioFigure/>},
  {eyebrow:"PANTALLA TÁCTIL",title:"Busca Serial No. en información del sistema",body:"En unidades con pantalla, entra a configuración, información del sistema o diagnóstico y localiza el campo Serial No. Copia exactamente lo que aparece.",figure:<ScreenFigure/>},
  {eyebrow:"ETIQUETA DEL RADIO",title:"Revisa la etiqueta física si no aparece en pantalla",body:"La serie también puede estar en una etiqueta lateral, superior o trasera del estéreo. Busca S/N o Serial No., no el número de parte.",figure:<LabelFigure/>},
];

export default function HondaAcuraHome(){
  return <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="/" className="text-xl font-black tracking-tight">AutoStereoCodes</a>
        <div className="flex items-center gap-3"><a href="#serie" className="hidden text-sm font-bold text-slate-600 sm:inline">Cómo sacar la serie</a><a href="/solicitar" className="rounded-xl bg-[#d71920] px-5 py-3 text-sm font-black uppercase text-white shadow-sm transition hover:bg-[#b4151b]">Solicitar código</a></div>
      </div>
    </header>

    <section className="relative isolate overflow-hidden bg-[#0b1118] px-5 py-24 text-white md:py-32">
      <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-55" style={{backgroundImage:`url(${HERO_PHOTO})`}} aria-hidden="true"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071018] via-[#071018]/90 to-[#071018]/35" aria-hidden="true"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071018] via-transparent to-black/20" aria-hidden="true"/>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="text-sm font-black uppercase tracking-[.24em] text-red-400">Honda + Acura</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">Código de radio sin una página saturada</h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">Aquí encuentras la guía para identificar la serie. Cuando estés listo, la solicitud se abre en una pantalla aparte y el proceso continúa desde ahí.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="/solicitar" className="rounded-xl bg-[#d71920] px-7 py-4 font-black uppercase text-white shadow-xl">Solicitar mi código</a><a href="#serie" className="rounded-xl border border-white/25 bg-white/10 px-7 py-4 font-black uppercase text-white backdrop-blur">Ver cómo sacar la serie</a></div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-slate-200"><span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Solo Honda</span><span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Solo Acura</span><span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Pago seguro</span></div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] text-white/45">Foto: Abhinand Venugopal / Unsplash</div>
    </section>

    <section className="px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[['1','Identifica la serie','Usa la guía visual según el tipo de radio que tengas.'],['2','Llena la solicitud','La solicitud abre en otra pantalla para que el inicio permanezca limpio.'],['3','Realiza el pago','Al terminar, tu solicitud queda registrada para procesar el código.']].map(([n,t,d])=><div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 font-black text-[#d71920]">{n}</div><h2 className="mt-4 text-xl font-black">{t}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}
      </div>
    </section>

    <section id="serie" className="border-y border-slate-200 bg-white px-5 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.22em] text-[#d71920]">Guía visual</div><h2 className="mt-3 text-3xl font-black sm:text-4xl">Cómo obtener la serie de tu estéreo</h2><p className="mt-4 leading-7 text-slate-600">El método cambia según el radio. Compara tu unidad con estos ejemplos y usa el procedimiento que corresponda.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">{guides.map(item=><article key={item.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-[#fafafa] shadow-sm"><div className="p-4">{item.figure}</div><div className="px-6 pb-7"><div className="text-xs font-black uppercase tracking-[.18em] text-[#d71920]">{item.eyebrow}</div><h3 className="mt-2 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p></div></article>)}</div>
        <div className="mt-8 text-center"><a href="/solicitar" className="inline-flex rounded-xl bg-[#d71920] px-8 py-4 font-black uppercase text-white">Ya tengo mi serie · Solicitar código</a></div>
      </div>
    </section>

    <section className="px-5 py-14 text-center"><div className="mx-auto max-w-3xl"><h2 className="text-2xl font-black">Especializado únicamente en Honda y Acura</h2><p className="mt-3 leading-7 text-slate-600">La página, el formulario y el panel están enfocados en códigos de radio para estas dos marcas.</p></div></section>
    <footer className="bg-[#101820] px-5 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} AutoStereoCodes · Honda & Acura Radio Codes</footer>
  </main>;
}
