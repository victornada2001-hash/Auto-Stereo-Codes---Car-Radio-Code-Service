"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type ValidationState = "empty" | "short" | "valid" | "invalid";

function normalize(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugForBrand(brand: string) {
  const map: Record<string,string> = {
    "Alfa Romeo":"alfa-romeo",
    "Land Rover":"land-rover",
    "Mercedes-Benz":"mercedes",
    "Vauxhall / Opel":"vauxhall",
    "Citroën":"citroen",
    "Škoda":"skoda",
  };
  return map[brand] || brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function patternFromExample(example: string): RegExp | null {
  const raw = example.trim().toUpperCase();
  if (!raw) return null;

  if (raw.includes("VIN")) {
    return /^[A-HJ-NPR-Z0-9]{17}$/;
  }

  const cleanedLabel = raw
    .replace(/^S\/?N\s*/i, "SN")
    .replace(/^SERIAL\s*/i, "")
    .replace(/^DEVICE\s*/i, "");

  if (cleanedLabel.includes("…") || cleanedLabel.includes("...")) {
    const prefix = normalize(cleanedLabel.split(/…|\.\.\./)[0]);
    if (!prefix || prefix.length > 10) return null;
    return new RegExp(`^${escapeRegex(prefix)}[A-Z0-9]{2,22}$`);
  }

  const sample = normalize(cleanedLabel);
  if (sample.length < 4 || sample.length > 28) return null;

  let prefixEnd = 0;
  while (prefixEnd < sample.length && /[A-Z]/.test(sample[prefixEnd])) prefixEnd += 1;
  const prefix = sample.slice(0, prefixEnd);
  const body = sample.slice(prefixEnd);

  let shape = "";
  let index = 0;
  while (index < body.length) {
    const isDigit = /\d/.test(body[index]);
    let end = index + 1;
    while (end < body.length && /\d/.test(body[end]) === isDigit) end += 1;
    const count = end - index;
    shape += isDigit ? `\\d{${count}}` : `[A-Z]{${count}}`;
    index = end;
  }

  return new RegExp(`^${escapeRegex(prefix)}${shape}$`);
}

function knownBrandPatterns(slug: string): RegExp[] {
  const rules: Record<string, RegExp[]> = {
    honda: [
      /^U\d{4,6}L\d{4,6}$/,
      /^SN\d{6,10}$/,
      /^\d{7,10}$/,
      /^\d{3}[A-Z]{2}\d{3}$/,
      /^[A-Z]{3}\d{7,9}$/,
      /^40\d{6,10}$/,
    ],
    acura: [
      /^U\d{4,6}L\d{4,6}$/,
      /^SN\d{6,10}$/,
      /^\d{7,10}$/,
      /^\d{3}[A-Z]{2}\d{3}$/,
      /^[A-Z]{3}\d{7,9}$/,
      /^40\d{6,10}$/,
    ],
    volkswagen: [/^VWZ[A-Z0-9]{8,16}$/],
    audi: [/^AUZ[A-Z0-9]{8,16}$/],
    seat: [/^SEZ[A-Z0-9]{8,16}$/],
    skoda: [/^SKZ[A-Z0-9]{8,16}$/],
    ford: [/^V\d{6}$/, /^M\d{6}$/, /^C7[A-Z0-9]{8,20}$/, /^BP[A-Z0-9]{8,20}$/],
    chrysler: [/^T[A-Z0-9]{8,20}$/, /^A[23]C[A-Z0-9]{6,22}$/, /^BE[A-Z0-9]{6,20}$/],
    jeep: [/^T[A-Z0-9]{8,20}$/, /^A[23]C[A-Z0-9]{6,22}$/, /^BE[A-Z0-9]{6,20}$/],
    dodge: [/^T[A-Z0-9]{8,20}$/, /^A[23]C[A-Z0-9]{6,22}$/],
    nissan: [/^(CL|PP|PN|DW)[A-Z0-9]{6,20}$/, /^BP[A-Z0-9]{8,20}$/, /^C7[A-Z0-9]{8,20}$/],
    renault: [/^[A-Z]\d{3}$/, /^(2811|8200|7700)[A-Z0-9]{4,20}$/],
    dacia: [/^[A-Z]\d{3}$/, /^(2811|8200|7700)[A-Z0-9]{4,20}$/, /^[A-HJ-NPR-Z0-9]{17}$/],
    mercedes: [/^(AL|MF|BE)[A-Z0-9]{5,22}$/],
    bmw: [/^(BP|BE|AL)[A-Z0-9]{5,22}$/],
    porsche: [/^(BE|BP)[A-Z0-9]{5,22}$/],
    fiat: [/^(BP|815CM|905CM|217CM|CM|A2C|A3C)[A-Z0-9]{4,22}$/],
    "alfa-romeo": [/^(BP|815CM|905CM|217CM|CM|A2C|A3C)[A-Z0-9]{4,22}$/],
    lancia: [/^(BP|815CM|905CM|217CM|CM|A2C|A3C)[A-Z0-9]{4,22}$/],
    peugeot: [/^(BP|815CM|905CM|217CM|CM|A2C|A3C|BE|C7)[A-Z0-9]{4,22}$/],
    citroen: [/^(BP|815CM|905CM|217CM|CM|A2C|A3C|BE|C7)[A-Z0-9]{4,22}$/],
    jaguar: [/^JA[A-Z0-9]{4,22}$/, /^M\d{6}$/],
    "land-rover": [/^M\d{6}$/, /^C7[A-Z0-9]{8,20}$/],
    alpine: [/^(AL|MF|TQ|TC|TD|TH|JA)[A-Z0-9]{3,22}$/],
    becker: [/^BE[A-Z0-9]{6,22}$/],
    blaupunkt: [/^(BP|C7|VWZ|AUZ|SKZ|SEZ)[A-Z0-9]{4,22}$/],
    bosch: [/^(815CM|905CM|217CM|CM)[A-Z0-9]{4,22}$/, /^\d{7,10}$/],
    clarion: [/^(CL|PP|PN)[A-Z0-9]{5,22}$/],
    daewoo: [/^(DW|DS|HP|HY|HG)[A-Z0-9]{4,22}$/],
  };
  return rules[slug] || [];
}

function validateSerial(slug: string, value: string, examples: string[]): ValidationState {
  const serial = normalize(value);
  if (!serial) return "empty";
  if (serial.length < 4) return "short";

  const patterns = [
    ...knownBrandPatterns(slug),
    ...examples.map(patternFromExample).filter((pattern): pattern is RegExp => Boolean(pattern)),
  ];

  if (!patterns.length) {
    return /^[A-Z0-9]{4,28}$/.test(serial) ? "valid" : "invalid";
  }

  return patterns.some((pattern) => pattern.test(serial)) ? "valid" : "invalid";
}

export default function BrandSerialStarter({ brand, slug, examples }: { brand: string; slug?: string; examples: string[] }) {
  const [serial, setSerial] = useState("");
  const resolvedSlug = slug || slugForBrand(brand);
  const validation = useMemo(() => validateSerial(resolvedSlug, serial, examples), [resolvedSlug, serial, examples]);
  const canContinue = validation === "valid";

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const fromUrl=params.get("serial")||"";
    const saved=sessionStorage.getItem("asc_serial")||"";
    setSerial((fromUrl||saved).toUpperCase());
  },[]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = serial.trim().toUpperCase();
    if (!value || !canContinue) return;
    sessionStorage.setItem("asc_serial", value);
    sessionStorage.setItem("asc_detected_brand", brand);
    const params=new URLSearchParams(window.location.search);
    const family=params.get("family")||`${brand} - selección por guía`;
    sessionStorage.setItem("asc_radio_family", family);
    window.location.assign(`/request?serial=${encodeURIComponent(value)}&brand=${encodeURIComponent(brand)}&family=${encodeURIComponent(family)}`);
  }

  const inputState = validation === "valid"
    ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
    : validation === "invalid"
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100";

  return (
    <form onSubmit={submit} className="rounded-3xl border border-orange-100 bg-white p-5 text-slate-950 shadow-xl shadow-orange-100/60 md:p-6">
      <div className="text-sm font-black text-slate-900">¿Ya tienes la serie?</div>
      <p className="mt-1 text-sm leading-6 text-slate-500">Confírmala aquí. Antes de continuar verificamos que el formato corresponda a una serie conocida de {brand}.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
          required
          maxLength={100}
          placeholder={examples[0] ? `Ejemplo: ${examples[0]}` : "Número de serie del estéreo"}
          className={`min-w-0 flex-1 rounded-xl border bg-[#fffaf5] px-4 py-3 font-mono font-bold outline-none focus:ring-4 ${inputState}`}
        />
        <button disabled={!canContinue} className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">Continuar →</button>
      </div>

      {validation === "valid" && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          ✓ El formato coincide con una serie conocida de {brand}. Puedes continuar.
        </div>
      )}

      {validation === "invalid" && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
          <strong>Esta serie probablemente no corresponde a un estéreo {brand}.</strong> Revisa que estés introduciendo la serie del radio y no el VIN, número de parte o código de barras. Compara tu dato con los ejemplos e instrucciones de esta página antes de continuar.
        </div>
      )}

      {validation === "short" && (
        <div className="mt-3 text-xs font-semibold text-slate-500">Sigue escribiendo la serie completa para poder validarla.</div>
      )}
    </form>
  );
}
