"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function BrandSerialStarter({ brand, examples }: { brand: string; examples: string[] }) {
  const [serial, setSerial] = useState("");

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const fromUrl=params.get("serial")||"";
    const saved=sessionStorage.getItem("asc_serial")||"";
    setSerial((fromUrl||saved).toUpperCase());
  },[]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = serial.trim().toUpperCase();
    if (!value) return;
    sessionStorage.setItem("asc_serial", value);
    sessionStorage.setItem("asc_detected_brand", brand);
    const params=new URLSearchParams(window.location.search);
    const family=params.get("family")||`${brand} - selección por guía`;
    sessionStorage.setItem("asc_radio_family", family);
    window.location.assign(`/request?serial=${encodeURIComponent(value)}&brand=${encodeURIComponent(brand)}&family=${encodeURIComponent(family)}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-orange-100 bg-white p-5 text-slate-950 shadow-xl shadow-orange-100/60 md:p-6">
      <div className="text-sm font-black text-slate-900">¿Ya tienes la serie?</div>
      <p className="mt-1 text-sm leading-6 text-slate-500">Confírmala aquí. Abajo encontrarás instrucciones específicas para cada tipo de estéreo {brand}.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
          required
          maxLength={100}
          placeholder={examples[0] ? `Ejemplo: ${examples[0]}` : "Número de serie del estéreo"}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#fffaf5] px-4 py-3 font-mono font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
        <button className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white shadow-sm hover:bg-orange-600">Continuar →</button>
      </div>
    </form>
  );
}
