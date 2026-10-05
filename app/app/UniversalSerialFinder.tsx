"use client";

import { useMemo, useState } from "react";
import type { Language } from "./languages";

type Match = {
  brands: string[];
  family: string;
  confidence: "high" | "medium" | "possible";
  note: string;
};

type Props = { language: Language; compact?: boolean };

const text = {
  en: { title:"Identify your radio", sub:"Enter the serial exactly as it appears. We compare its format with known radio families and show the most likely options.", ph:"Try V536284, VWZ1Z1L123456 or T00AM0052T0922", button:"Identify serial", likely:"Possible match", choose:"Use this option", multiple:"This serial format is used by more than one vehicle/radio family. Confirm the radio label or vehicle before continuing.", none:"We could not identify this serial confidently from its format alone. You can still continue and we will review it manually.", continue:"Continue with manual identification", high:"Strong format match", medium:"Likely format match", possible:"Possible match", disclaimer:"Serial recognition is a guide, not a manufacturer lookup. Some radio makers supply the same unit to several car brands." },
  es: { title:"Identifica tu radio", sub:"Escribe la serie exactamente como aparece. Comparamos el formato con familias conocidas y te mostramos las opciones más probables.", ph:"Prueba V536284, VWZ1Z1L123456 o T00AM0052T0922", button:"Identificar serie", likely:"Coincidencia posible", choose:"Usar esta opción", multiple:"Este formato de serie se utiliza en más de una marca o familia de radio. Confirma la etiqueta del estéreo o el vehículo antes de continuar.", none:"No pudimos identificar esta serie con suficiente certeza solo por su formato. Puedes continuar y la revisaremos manualmente.", continue:"Continuar con identificación manual", high:"Coincidencia fuerte", medium:"Coincidencia probable", possible:"Coincidencia posible", disclaimer:"La identificación por serie es una guía, no una consulta a la base del fabricante. Algunos fabricantes de radios suministran la misma unidad a varias marcas." },
  pt: { title:"Identifique seu rádio", sub:"Digite o número de série exatamente como aparece. Comparamos o formato com famílias conhecidas e mostramos as opções mais prováveis.", ph:"Ex.: V536284, VWZ1Z1L123456 ou T00AM0052T0922", button:"Identificar série", likely:"Correspondência possível", choose:"Usar esta opção", multiple:"Este formato é usado por mais de uma marca ou família de rádio. Confirme a etiqueta ou o veículo antes de continuar.", none:"Não foi possível identificar com segurança apenas pelo formato. Você ainda pode continuar para revisão manual.", continue:"Continuar com identificação manual", high:"Correspondência forte", medium:"Correspondência provável", possible:"Correspondência possível", disclaimer:"A identificação pelo número de série é apenas um guia. O mesmo rádio pode ser fornecido a várias marcas." },
  fr: { title:"Identifiez votre autoradio", sub:"Saisissez le numéro exactement comme affiché. Nous comparons son format aux familles connues et proposons les options les plus probables.", ph:"Ex. V536284, VWZ1Z1L123456 ou T00AM0052T0922", button:"Identifier le numéro", likely:"Correspondance possible", choose:"Utiliser cette option", multiple:"Ce format est utilisé par plusieurs marques ou familles. Vérifiez l’étiquette de l’autoradio ou le véhicule avant de continuer.", none:"Impossible d’identifier ce numéro avec suffisamment de certitude à partir du format seul. Vous pouvez continuer pour une vérification manuelle.", continue:"Continuer avec vérification manuelle", high:"Correspondance forte", medium:"Correspondance probable", possible:"Correspondance possible", disclaimer:"L’identification par numéro de série est un guide, pas une recherche dans la base du constructeur. Une même unité peut équiper plusieurs marques." },
  de: { title:"Radio identifizieren", sub:"Gib die Seriennummer genau wie angezeigt ein. Wir vergleichen das Format mit bekannten Radiofamilien und zeigen wahrscheinliche Treffer.", ph:"z. B. V536284, VWZ1Z1L123456 oder T00AM0052T0922", button:"Seriennummer prüfen", likely:"Möglicher Treffer", choose:"Diese Option verwenden", multiple:"Dieses Serienformat wird von mehreren Marken oder Radiofamilien verwendet. Prüfe das Radioetikett oder Fahrzeug vor dem Fortfahren.", none:"Das Format allein reicht für eine sichere Identifizierung nicht aus. Du kannst zur manuellen Prüfung fortfahren.", continue:"Mit manueller Prüfung fortfahren", high:"Starker Formattreffer", medium:"Wahrscheinlicher Treffer", possible:"Möglicher Treffer", disclaimer:"Die Serienerkennung ist eine Orientierung und keine Herstellerdatenbank-Abfrage. Dieselbe Radioeinheit kann in mehreren Marken verbaut sein." },
  it: { title:"Identifica la tua autoradio", sub:"Inserisci il numero di serie esattamente come appare. Confrontiamo il formato con famiglie note e mostriamo le opzioni più probabili.", ph:"Es. V536284, VWZ1Z1L123456 o T00AM0052T0922", button:"Identifica seriale", likely:"Possibile corrispondenza", choose:"Usa questa opzione", multiple:"Questo formato è usato da più marchi o famiglie. Controlla l’etichetta della radio o il veicolo prima di continuare.", none:"Non possiamo identificarlo con sufficiente certezza solo dal formato. Puoi continuare per una verifica manuale.", continue:"Continua con verifica manuale", high:"Corrispondenza forte", medium:"Corrispondenza probabile", possible:"Possibile corrispondenza", disclaimer:"Il riconoscimento del seriale è una guida, non una ricerca nel database del costruttore. La stessa unità può essere montata su più marchi." },
} satisfies Record<Language, Record<string,string>>;

function normalize(value: string) {
  return value.toUpperCase().replace(/[\s\-_/.:]/g, "");
}

function identify(raw: string): Match[] {
  const s = normalize(raw);
  const out: Match[] = [];
  const add = (match: Match) => out.push(match);

  if (/^VWZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Volkswagen"],family:"VWZ / Volkswagen factory radio",confidence:"high",note:"VWZ is a distinctive Volkswagen-group radio prefix."});
  if (/^AUZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Audi"],family:"AUZ / Audi factory radio",confidence:"high",note:"AUZ is associated with Audi factory radio serials."});
  if (/^SEZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["SEAT"],family:"SEZ / SEAT factory radio",confidence:"high",note:"SEZ is a distinctive SEAT radio prefix."});
  if (/^SKZ[A-Z0-9]{8,14}$/.test(s)) add({brands:["Škoda"],family:"SKZ / Škoda factory radio",confidence:"high",note:"SKZ is a distinctive Škoda radio prefix."});

  if (/^V\d{6}$/.test(s)) add({brands:["Ford"],family:"Ford V-series",confidence:"high",note:"Older Ford units commonly use V followed by six digits."});
  if (/^M\d{6}$/.test(s)) add({brands:["Ford","Land Rover"],family:"Visteon M-series",confidence:"medium",note:"M-series Visteon units were fitted to Ford and some older Land Rover vehicles."});
  if (/^C7[A-Z0-9]{10,18}$/.test(s)) add({brands:["Ford","Nissan","Peugeot / Citroën"],family:"Blaupunkt / TravelPilot C7-series",confidence:"medium",note:"C7 radio families were supplied across more than one vehicle brand."});
  if (/^A[A-Z0-9]{5,}$/.test(s) && !s.startsWith("AUZ") && !s.startsWith("A2C") && !s.startsWith("A3C")) add({brands:["Ford"],family:"Newer Ford A-series (possible)",confidence:"possible",note:"Some newer Ford families use A-series identifiers; verify the unit label before ordering."});

  if (/^BP\d{10,14}$/.test(s)) add({brands:["Nissan","Fiat","Alfa Romeo","Peugeot / Citroën","Ford","Blaupunkt"],family:"Blaupunkt BP-series",confidence:"medium",note:"BP identifies the radio manufacturer more reliably than the vehicle brand, so several vehicle options are possible."});
  if (/^(815CM|905CM|217CM|CM)[A-Z0-9]{6,}$/.test(s)) add({brands:["Fiat","Alfa Romeo","Peugeot / Citroën","Bosch"],family:"Bosch CM-series",confidence:"medium",note:"Bosch CM-prefix units appear in several European vehicle brands."});
  if (/^A[23]C[A-Z0-9]{6,}$/.test(s)) add({brands:["Fiat","Alfa Romeo","Lancia","Peugeot / Citroën","Chrysler","Jeep","Dodge"],family:"Continental / VDO A2C-A3C",confidence:"medium",note:"A2C/A3C identifies a Continental/VDO radio family used by several manufacturers."});
  if (/^BE\d{8,14}$/.test(s)) add({brands:["Mercedes-Benz","Porsche","Chrysler","Jeep","Fiat"],family:"Becker / Continental BE-series",confidence:"medium",note:"BE serials belong to Becker-family units fitted by multiple vehicle makers."});
  if (/^(AL|MF)[A-Z0-9]{6,}$/.test(s)) add({brands:["Mercedes-Benz"],family:"Mercedes Alpine / Audio-series",confidence:"high",note:"AL and MF prefixes are commonly found on older Mercedes factory units."});

  if (/^(CL|PN|PP)[A-Z0-9]{10,16}$/.test(s)) add({brands:["Nissan","Clarion"],family:"Clarion CL / PN / PP",confidence:"high",note:"These Clarion serial families are common on Nissan factory radios."});
  if (/^DW[A-Z0-9]{6,}$/.test(s)) add({brands:["Nissan"],family:"Nissan Daewoo",confidence:"high",note:"DW-prefix radio serials are associated with Nissan/Daewoo units."});
  if (/^42[A-Z0-9]{8,}$/.test(s)) add({brands:["Nissan"],family:"Nissan Visteon (possible)",confidence:"possible",note:"Some Nissan Visteon units use long serials beginning with 42 and also require a device/part number."});

  if (/^U\d{4,6}L\d{4,6}$/.test(s) || /^SN\d{6,10}$/.test(s)) add({brands:["Honda","Acura"],family:"Honda / Acura on-screen serial",confidence:"high",note:"U/L and S/N formats are common on Honda and Acura factory radios."});
  if (/^40\d{6,10}$/.test(s)) add({brands:["Honda","Acura"],family:"Honda / Acura 40-series",confidence:"medium",note:"Some Honda/Acura serial families beginning with 40 require specialist or dealer lookup."});

  if (/^[A-Z]\d{3}$/.test(s)) add({brands:["Renault","Dacia"],family:"Renault / Dacia precode",confidence:"medium",note:"Older Renault/Dacia radios often expose a four-character precode such as A123."});
  if (/^(2811|8200|7700)[A-Z0-9]{6,}$/.test(s)) add({brands:["Renault","Dacia","Mercedes-Benz Citan"],family:"Renault-family label serial",confidence:"medium",note:"These label families are common on Renault/Dacia radios and Renault-derived units."});

  if (/^T[A-Z0-9]{8,18}$/.test(s)) add({brands:["Chrysler","Jeep","Dodge"],family:"Uconnect / FCA T-series",confidence:"medium",note:"T-series units are shared across Chrysler, Jeep and Dodge, so the serial alone may not distinguish the vehicle brand."});

  if (/^[A-Z0-9]{16}$/.test(s) && !out.length) add({brands:["Toyota","Lexus"],family:"ERC-style 16-character code (possible)",confidence:"possible",note:"Toyota/Lexus Japanese-market units can display a 16-character ERC. Confirm that the screen specifically labels it ERC."});
  if (/^\d{7}$/.test(s)) add({brands:["Nissan","Vauxhall / Opel","Bosch"],family:"7-digit screen serial (ambiguous)",confidence:"possible",note:"Seven-digit screen serials are not unique to one vehicle maker and often need device/date information too."});
  if (/^\d{8}$/.test(s)) add({brands:["Honda / Acura","Land Rover / Becker"],family:"8-digit numeric serial (ambiguous)",confidence:"possible",note:"An eight-digit number can belong to several radio families. Check the radio manufacturer and label."});

  return out;
}

function confidenceLabel(lang: Language, confidence: Match["confidence"]) {
  const t = text[lang];
  return confidence === "high" ? t.high : confidence === "medium" ? t.medium : t.possible;
}

export default function UniversalSerialFinder({ language, compact=false }: Props) {
  const t = text[language];
  const [serial, setSerial] = useState("");
  const [searched, setSearched] = useState(false);
  const matches = useMemo(() => searched ? identify(serial) : [], [serial, searched]);

  function run() {
    if (!serial.trim()) return;
    setSearched(true);
  }

  function useMatch(match?: Match) {
    const clean = serial.trim().toUpperCase();
    sessionStorage.setItem("asc_serial", clean);
    sessionStorage.setItem("asc_detected_brand", match?.brands.join(" / ") || "Manual identification");
    sessionStorage.setItem("asc_radio_family", match?.family || "Manual review");
    window.dispatchEvent(new CustomEvent("asc:serial-match", { detail: { serial: clean, brand: match?.brands.join(" / ") || "", family: match?.family || "" } }));
    document.getElementById("request-form")?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  return <div className={`rounded-[2rem] border border-white/20 bg-white text-slate-950 shadow-2xl ${compact ? "p-5 md:p-6" : "p-6 md:p-8"}`}>
    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Serial Match</div>
    <h2 className="mt-4 text-2xl font-black md:text-3xl">{t.title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t.sub}</p>
    <div className="mt-5 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
      <input value={serial} onChange={e=>{setSerial(e.target.value);setSearched(false);}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();run();}}} placeholder={t.ph} className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm font-semibold uppercase outline-none md:text-base" />
      <button onClick={run} className="shrink-0 rounded-xl bg-red-500 px-4 py-3 font-black text-white transition hover:bg-red-400" aria-label={t.button}>→</button>
    </div>

    {searched && matches.length > 0 && <div className="mt-5 space-y-3">
      {matches.length > 1 && <div className="rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">{t.multiple}</div>}
      {matches.map((match,index)=><button key={`${match.family}-${index}`} onClick={()=>useMatch(match)} className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-red-300 hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-black uppercase tracking-wider text-red-500">{confidenceLabel(language,match.confidence)}</span><span className="text-xs font-bold text-slate-400">{t.choose} →</span></div>
        <div className="mt-2 text-lg font-black text-slate-950">{match.brands.join(" · ")}</div>
        <div className="mt-1 text-sm font-bold text-slate-600">{match.family}</div>
        <p className="mt-2 text-xs leading-5 text-slate-500">{match.note}</p>
      </button>)}
    </div>}

    {searched && matches.length === 0 && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm leading-6 text-slate-600">{t.none}</p>
      <button onClick={()=>useMatch()} className="mt-3 text-sm font-black text-red-500 hover:text-red-400">{t.continue} →</button>
    </div>}
    <p className="mt-4 text-[11px] leading-5 text-slate-400">{t.disclaimer}</p>
  </div>;
}
