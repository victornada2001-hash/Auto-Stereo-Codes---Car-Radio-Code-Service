"use client";

import { useEffect, useState } from "react";
import { languageOptions, type Language } from "./languages";

function supported(value:string|null|undefined):Language|""{
  const code=String(value||"").toLowerCase().split("-")[0];
  return languageOptions.some(item=>item.code===code)?code as Language:"";
}

export function useSiteLanguage(){
  const [language,setLanguageState]=useState<Language>("es");

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const fromQuery=supported(params.get("lang"));
    const fromStorage=supported(window.localStorage.getItem("asc_language"));
    const fromBrowser=supported(window.navigator.language);
    const initial=fromQuery||fromStorage||fromBrowser||"es";
    setLanguageState(initial);
    window.localStorage.setItem("asc_language",initial);
  },[]);

  function setLanguage(next:Language){
    setLanguageState(next);
    window.localStorage.setItem("asc_language",next);
    const url=new URL(window.location.href);
    url.searchParams.set("lang",next);
    window.history.replaceState({},"",`${url.pathname}${url.search}${url.hash}`);
  }

  function href(path:string){
    const separator=path.includes("?")?"&":"?";
    return `${path}${separator}lang=${language}`;
  }

  return {language,setLanguage,href};
}

export function LanguagePicker({language,onChange}:{language:Language;onChange:(language:Language)=>void}){
  return <label className="relative inline-flex items-center">
    <span className="sr-only">Language</span>
    <select value={language} onChange={event=>onChange(event.target.value as Language)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-red-400">
      {languageOptions.map(item=><option key={item.code} value={item.code}>{item.flag} {item.label}</option>)}
    </select>
  </label>;
}
