"use client";

import { useMemo, useState } from "react";
import type { Language } from "./languages";

type Match = {
  brands: string[];
  family: string;
  confidence: "high" | "medium" | "possible";
  note: string;
};

type Choice = {
  brand: string;
  route: string;
  family: string;
  confidence: Match["confidence"];
  note: string;
};

const brandRoutes: Record<string,string> = {
  "Acura":"acura","Alfa Romeo":"alfa-romeo","Audi":"audi","BMW":"bmw","Chrysler":"chrysler","Citroën":"citroen",
  "Dacia":"dacia","Dodge":"dodge","Fiat":"fiat","Ford":"ford","Honda":"honda","Jeep":"jeep","Land Rover":"land-rover",
  "Lancia":"lancia","Mercedes-Benz":"mercedes","Nissan":"nissan","Peugeot":"peugeot","Porsche":"porsche","Renault":"renault",
  "SEAT":"seat","Škoda":"skoda","Suzuki":"suzuki","Toyota":"toyota","Lexus":"toyota","Volkswagen":"volkswagen",
  "Vauxhall / Opel":"vauxhall","Jaguar":"jaguar","Iveco":"iveco"
};

const text = {
  es:{title:"Identifica tu radio",sub:"Escribe la serie y las opciones aparecerán automáticamente. No necesitas presionar ningún botón.",ph:"Ej. T00AM0052T0922",hint:"Detección automática",choose:"¿Cuál es tu vehículo?",multiple:"Esta serie puede utilizarse en más de una marca. Elige tu vehículo para abrir su guía exacta.",open:"Ver guía de",none:"Todavía no reconocemos este formato con suficiente certeza.",manual:"Buscar mi marca manualmente",strong:"Coincidencia fuerte",likely:"Coincidencia probable",possible:"Posible coincidencia"},
  en:{title:"Identify your radio",sub:"Type the serial and matching options appear automatically. No search button is needed.",ph:"e.g. T00AM0052T0922",hint:"Automatic detection",choose:"Which vehicle do you have?",multiple:"This serial can be used by more than one brand. Choose your vehicle to open its exact guide.",open:"Open guide for",none:"We cannot identify this format confidently yet.",manual:"Find my brand manually",strong:"Strong match",likely:"Likely match",possible:"Possible match"},
  pt:{title:"Identifique seu rádio",sub:"Digite o serial e as opções aparecerão automaticamente.",ph:"Ex. T00AM0052T0922",hint:"Detecção automática",choose:"Qual é o seu veículo?",multiple:"Este serial pode aparecer em mais de uma marca. Escolha o veículo para abrir o guia.",open:"Abrir guia de",none:"Ainda não reconhecemos este formato com segurança.",manual:"Procurar minha marca",strong:"Correspondência forte",likely:"Correspondência provável",possible:"Possível correspondência"},
  fr:{title:"Identifiez votre autoradio",sub:"Saisissez le numéro et les options apparaissent automatiquement.",ph:"Ex. T00AM0052T0922",hint:"Détection automatique",choose:"Quel est votre véhicule ?",multiple:"Ce numéro peut être utilisé par plusieurs marques. Choisissez votre véhicule pour ouvrir son guide.",open:"Ouvrir le guide",none:"Nous ne reconnaissons pas encore ce format avec certitude.",manual:"Trouver ma marque",strong:"Correspondance forte",likely:"Correspondance probable",possible:"Correspondance possible"},
  de:{title:"Radio identifizieren",sub:"Seriennummer eingeben – passende Optionen erscheinen automatisch.",ph:"z. B. T00AM0052T0922",hint:"Automatische Erkennung",choose:"Welches Fahrzeug hast du?",multiple:"Diese Serie kann bei mehreren Marken vorkommen. Wähle dein Fahrzeug für die passende Anleitung.",open:"Anleitung öffnen",none:"Dieses Format können wir noch nicht sicher erkennen.",manual:"Marke manuell suchen",strong:"Starker Treffer",likely:"Wahrscheinlicher Treffer",possible:"Möglicher Treffer"},
  it:{title:"Identifica la tua autoradio",sub:"Inserisci il seriale e le opzioni appariranno automaticamente.",ph:"Es. T00AM0052T0922",hint:"Rilevamento automatico",choose:"Qual è il tuo veicolo?",multiple:"Questo seriale può essere usato da più marchi. Scegli il veicolo per aprire la guida.",open:"Apri guida",none:"Non riconosciamo ancora questo formato con certezza.",manual:"Trova il marchio",strong:"Corrispondenza forte",likely:"Corrispondenza probabile",possible:"Possibile corrispondenza"}
} satisfies Record<Language,Record<string,string>>;

function normalize(value:string){return value.toUpperCase().replace(/[\s\-_/.:]/g,"");}

function identify(raw:string):Match[]{
  const s=normalize(raw); const out:Match[]=[]; const add=(m:Match)=>out.push(m);
  if(s.length<4) return out;
  if(/^VWZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Volkswagen"],family:"VWZ / Volkswagen",confidence:"high",note:"Prefijo característico de radios Volkswagen."});
  if(/^AUZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Audi"],family:"AUZ / Audi",confidence:"high",note:"Prefijo característico de radios Audi."});
  if(/^SEZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["SEAT"],family:"SEZ / SEAT",confidence:"high",note:"Prefijo característico de radios SEAT."});
  if(/^SKZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Škoda"],family:"SKZ / Škoda",confidence:"high",note:"Prefijo característico de radios Škoda."});
  if(/^V\d{6}$/.test(s)) add({brands:["Ford"],family:"Ford V-series",confidence:"high",note:"Familia V-series de Ford."});
  if(/^M\d{6}$/.test(s)) add({brands:["Ford","Land Rover","Jaguar"],family:"Visteon M-series",confidence:"medium",note:"Las radios Visteon M-series aparecen en varias marcas."});
  if(/^C7[A-Z0-9]{10,18}$/.test(s)) add({brands:["Ford","Nissan","Peugeot","Citroën"],family:"Blaupunkt / TravelPilot C7",confidence:"medium",note:"La familia C7 fue utilizada por varios fabricantes."});
  if(/^BP\d{10,14}$/.test(s)) add({brands:["Nissan","Fiat","Alfa Romeo","Peugeot","Citroën","Ford"],family:"Blaupunkt BP-series",confidence:"medium",note:"BP identifica una familia Blaupunkt presente en diferentes vehículos."});
  if(/^(815CM|905CM|217CM|CM)[A-Z0-9]{6,}$/.test(s)) add({brands:["Fiat","Alfa Romeo","Peugeot","Citroën","Iveco"],family:"Bosch CM-series",confidence:"medium",note:"Las series CM de Bosch se instalaron en varias marcas europeas."});
  if(/^A[23]C[A-Z0-9]{6,}$/.test(s)) add({brands:["Fiat","Alfa Romeo","Lancia","Peugeot","Citroën","Chrysler","Jeep","Dodge"],family:"Continental / VDO A2C-A3C",confidence:"medium",note:"A2C/A3C identifica una familia Continental/VDO compartida."});
  if(/^BE\d{8,14}$/.test(s)) add({brands:["Mercedes-Benz","Porsche","Chrysler","Jeep","Fiat"],family:"Becker BE-series",confidence:"medium",note:"Las radios Becker BE se instalaron en distintas marcas."});
  if(/^(AL|MF)[A-Z0-9]{6,}$/.test(s)) add({brands:["Mercedes-Benz"],family:"Mercedes Alpine / Audio",confidence:"high",note:"Prefijos habituales en unidades Mercedes antiguas."});
  if(/^(CL|PN|PP)[A-Z0-9]{10,16}$/.test(s)) add({brands:["Nissan","Peugeot"],family:"Clarion CL / PN / PP",confidence:"high",note:"Familias Clarion comunes en Nissan y algunas unidades Peugeot."});
  if(/^DW[A-Z0-9]{6,}$/.test(s)) add({brands:["Nissan"],family:"Nissan / Daewoo",confidence:"high",note:"Series DW asociadas a unidades Nissan/Daewoo."});
  if(/^U\d{4,6}L\d{4,6}$/.test(s)||/^SN\d{6,10}$/.test(s)) add({brands:["Honda","Acura"],family:"Honda / Acura on-screen serial",confidence:"high",note:"U/L y S/N son formatos frecuentes en Honda y Acura."});
  if(/^40\d{6,10}$/.test(s)) add({brands:["Honda","Acura"],family:"Honda / Acura 40-series",confidence:"medium",note:"Algunas radios Honda/Acura usan series que comienzan por 40."});
  if(/^[A-Z]\d{3}$/.test(s)) add({brands:["Renault","Dacia"],family:"Renault / Dacia precode",confidence:"medium",note:"Varias radios Renault/Dacia antiguas muestran un precode de 4 caracteres."});
  if(/^(2811|8200|7700)[A-Z0-9]{6,}$/.test(s)) add({brands:["Renault","Dacia","Mercedes-Benz"],family:"Renault-family label",confidence:"medium",note:"Familias de etiqueta comunes en Renault/Dacia y algunas unidades derivadas."});
  if(/^T[A-Z0-9]{8,18}$/.test(s)) add({brands:["Chrysler","Jeep","Dodge"],family:"Uconnect / FCA T-series",confidence:"medium",note:"Las T-series se comparten entre Chrysler, Jeep y Dodge."});
  if(/^[A-Z0-9]{16}$/.test(s)&&!out.length) add({brands:["Toyota","Lexus"],family:"ERC de 16 caracteres",confidence:"possible",note:"Algunas unidades Toyota/Lexus JDM muestran un ERC de 16 caracteres."});
  if(/^\d{8}$/.test(s)) add({brands:["Honda","Acura","Land Rover"],family:"Serie numérica de 8 dígitos",confidence:"possible",note:"Un número de ocho dígitos puede pertenecer a varias familias."});
  return out;
}

function label(t:typeof text["es"],c:Match["confidence"]){return c==="high"?t.strong:c==="medium"?t.likely:t.possible;}

export default function UniversalSerialFinderV2({language}:{language:Language}){
  const [serial,setSerial]=useState(""); const t=text[language];
  const matches=useMemo(()=>identify(serial),[serial]);
  const choices=useMemo(()=>{
    const map=new Map<string,Choice>();
    for(const match of matches){for(const brand of match.brands){const route=brandRoutes[brand];if(route&&!map.has(brand)) map.set(brand,{brand,route,family:match.family,confidence:match.confidence,note:match.note});}}
    return [...map.values()];
  },[matches]);
  const clean=serial.trim().toUpperCase();
  function open(choice:Choice){
    sessionStorage.setItem("asc_serial",clean); sessionStorage.setItem("asc_detected_brand",choice.brand); sessionStorage.setItem("asc_radio_family",choice.family);
    window.location.assign(`/radio-codes/${choice.route}?serial=${encodeURIComponent(clean)}&family=${encodeURIComponent(choice.family)}`);
  }
  return <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl md:p-8">
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700"><span className="h-2 w-2 rounded-full bg-emerald-500"/> {t.hint}</div>
    <h2 className="mt-4 text-2xl font-black md:text-3xl">{t.title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t.sub}</p>
    <div className="mt-5 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2 shadow-inner focus-within:border-orange-400">
      <input value={serial} onChange={e=>setSerial(e.target.value)} placeholder={t.ph} autoComplete="off" className="w-full bg-transparent py-3 font-mono text-base font-bold uppercase outline-none"/>
    </div>
    {choices.length>0&&<div className="mt-5">
      <div className="rounded-xl bg-orange-50 p-3 text-sm font-bold text-orange-950">{choices.length>1?t.multiple:t.choose}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {choices.map(choice=><button key={choice.brand} onClick={()=>open(choice)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg">
          <div className="text-[10px] font-black uppercase tracking-wider text-orange-500">{label(t,choice.confidence)}</div>
          <div className="mt-1 text-lg font-black">{choice.brand}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">{choice.family}</div>
          <div className="mt-3 text-sm font-black text-orange-600">{t.open} {choice.brand} →</div>
        </button>)}
      </div>
    </div>}
    {clean.length>=6&&choices.length===0&&<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">{t.none}</p><a href="/radio-codes" className="mt-3 inline-flex font-black text-orange-600">{t.manual} →</a></div>}
  </div>;
}
