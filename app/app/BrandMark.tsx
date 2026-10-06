"use client";

import { useState } from "react";

const brandDomains: Record<string,string> = {
  acura:"acura.com",
  "alfa-romeo":"alfaromeo.com",
  alpine:"alpine-usa.com",
  audi:"audi.com",
  blaupunkt:"blaupunkt.com",
  bmw:"bmw.com",
  bosch:"bosch.com",
  chrysler:"chrysler.com",
  citroen:"citroen.com",
  clarion:"clarion.com",
  dacia:"dacia.com",
  daiichi:"daiichi.com",
  dodge:"dodge.com",
  fiat:"fiat.com",
  ford:"ford.com",
  grundig:"grundig.com",
  honda:"honda.com",
  iveco:"iveco.com",
  jaguar:"jaguar.com",
  jeep:"jeep.com",
  lancia:"lancia.com",
  "land-rover":"landrover.com",
  mercedes:"mercedes-benz.com",
  nissan:"nissan-global.com",
  peugeot:"peugeot.com",
  porsche:"porsche.com",
  renault:"renault.com",
  seat:"seat.com",
  skoda:"skoda-auto.com",
  sony:"sony.com",
  suzuki:"globalsuzuki.com",
  toyota:"toyota.com",
  vauxhall:"vauxhall.co.uk",
  volkswagen:"volkswagen.com"
};

const cleanWordmarkSlugs = new Set([
  "alpine",
  "becker",
  "blaupunkt",
  "bmw",
  "bosch",
  "clarion",
  "daiichi",
  "grundig",
  "sony",
]);

const preferredLogo: Record<string,string> = {
  suzuki:"https://cdn.simpleicons.org/suzuki/E30613",
};

type Props = {
  slug: string;
  name: string;
  compact?: boolean;
  hero?: boolean;
};

export default function BrandMark({slug,name,compact=false,hero=false}:Props){
  const [sourceIndex,setSourceIndex]=useState(0);
  const [failed,setFailed]=useState(false);
  const domain=brandDomains[slug];
  const favicon=domain ? `https://www.google.com/s2/favicons?domain_url=https://${domain}&sz=256` : "";
  const sources=[preferredLogo[slug],favicon].filter(Boolean);
  const src=sources[sourceIndex]||"";
  const size=hero ? "h-24 w-24" : compact ? "h-12 w-12" : "h-16 w-16";
  const imageSize=hero ? "h-16 w-16" : compact ? "h-8 w-8" : "h-11 w-11";
  const wordmark=cleanWordmarkSlugs.has(slug);

  function handleError(){
    if(sourceIndex<sources.length-1){setSourceIndex(sourceIndex+1);return;}
    setFailed(true);
  }

  const markClass = slug==="bmw"
    ? "bg-gradient-to-br from-white via-sky-50 to-slate-100 text-slate-950 ring-1 ring-sky-100"
    : slug==="sony"
      ? "bg-gradient-to-br from-slate-950 to-slate-800 text-white"
      : "bg-gradient-to-br from-slate-950 to-slate-800 text-white";

  const markTextClass = slug==="bmw"
    ? "text-[11px] tracking-[.12em]"
    : slug==="sony"
      ? "text-[10px] tracking-[.14em]"
      : "text-[9px] tracking-wide";

  return <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-sm`}>
    {wordmark ? (
      <div className={`flex h-full w-full items-center justify-center rounded-xl px-1 text-center font-black uppercase leading-tight ${markClass} ${markTextClass}`}>
        {name}
      </div>
    ) : src&&!failed ? (
      <img src={src} alt={`Logo ${name}`} onError={handleError} className={`${imageSize} object-contain`} />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-white px-1 text-center text-[10px] font-black leading-tight text-slate-800">
        {name}
      </div>
    )}
  </div>;
}
