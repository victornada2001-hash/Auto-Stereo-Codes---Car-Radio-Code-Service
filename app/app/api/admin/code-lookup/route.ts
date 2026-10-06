import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type LookupStatus = "found" | "manual" | "unsupported" | "needs_input";
type LookupResult = {
  status: LookupStatus;
  code?: string;
  source?: string;
  sourceUrl?: string;
  reason: string;
  missing?: string[];
};

type LookupInput = {
  brand: string;
  serial: string;
  vin: string;
  postalCode: string;
  year?: number | null;
  model?: string;
  email?: string;
  phone?: string;
};

type ConnectorConfig = {
  label: string;
  endpoint?: string;
  token?: string;
  sourceUrl: string;
};

function normalize(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function officialSourceFor(brand: string) {
  if (brand === "honda") return "https://mygarage.honda.com/s/radio-nav-code?brand=Honda";
  if (brand === "acura") return "https://mygarage.honda.com/s/radio-nav-code?brand=Acura";
  if (brand === "renault" || brand === "dacia") return "https://www.renault.co.uk/faq.html";
  return "";
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyKey;
  if (!url || !apiKey) return null;
  const headers:Record<string,string>={apikey:apiKey,"Content-Type":"application/json"};
  if(!secretKey&&legacyKey) headers.Authorization=`Bearer ${legacyKey}`;
  return {url:url.replace(/\/$/,""),headers};
}

async function loadStoredDetails(serial:string,email:string){
  const config=supabaseConfig();
  if(!config) return null;
  try{
    const endpoint=new URL(`${config.url}/rest/v1/code_requests`);
    endpoint.searchParams.set("select","vin,postal_code,phone,email");
    endpoint.searchParams.set("serial",`eq.${serial}`);
    if(email) endpoint.searchParams.set("email",`eq.${email}`);
    endpoint.searchParams.set("order","created_at.desc");
    endpoint.searchParams.set("limit","1");
    const response=await fetch(endpoint,{headers:config.headers,cache:"no-store"});
    if(!response.ok) return null;
    const rows=await response.json();
    return Array.isArray(rows)&&rows[0]?rows[0]:null;
  }catch{return null;}
}

async function callApprovedConnector(input: LookupInput, config: ConnectorConfig): Promise<LookupResult> {
  if (!config.endpoint) {
    return {
      status: "manual",
      source: config.label,
      sourceUrl: config.sourceUrl,
      reason: `La fuente ${config.label} todavía no tiene un conector autorizado configurado. Abre la fuente oficial o revisa el caso manualmente; el sistema no inventará un código.`,
    };
  }

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: JSON.stringify(input),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return {
        status: "manual",
        source: config.label,
        sourceUrl: config.sourceUrl,
        reason: `El conector ${config.label} respondió con error ${response.status}; requiere revisión manual.`,
      };
    }

    const data = await response.json();
    const code = normalize(data?.code, 100);
    if (!code) {
      const reason = normalize(data?.reason, 400) || "La fuente no devolvió un código; requiere revisión manual.";
      return {
        status: data?.status === "needs_input" ? "needs_input" : "manual",
        source: normalize(data?.source, 120) || config.label,
        sourceUrl: normalize(data?.sourceUrl, 500) || config.sourceUrl,
        reason,
        missing: Array.isArray(data?.missing) ? data.missing.map((x: unknown) => normalize(x, 50)).filter(Boolean) : undefined,
      };
    }

    return {
      status: "found",
      code,
      source: normalize(data?.source, 120) || config.label,
      sourceUrl: normalize(data?.sourceUrl, 500) || config.sourceUrl,
      reason: "Código recibido desde una fuente conectada. Revísalo antes de guardarlo o enviarlo al cliente.",
    };
  } catch {
    return {
      status: "manual",
      source: config.label,
      sourceUrl: config.sourceUrl,
      reason: `No se pudo conectar con ${config.label}; requiere revisión manual.`,
    };
  }
}

async function lookupHondaAcura(input: LookupInput): Promise<LookupResult> {
  const sourceUrl = officialSourceFor(input.brand);
  const missing:string[]=[];
  if(!input.vin) missing.push("vin");
  if(!input.postalCode) missing.push("postalCode");
  if(!input.phone) missing.push("phone");
  if(!input.email) missing.push("email");
  if(missing.length){
    return {
      status:"needs_input",
      source:"Honda/Acura official radio code service",
      sourceUrl,
      missing,
      reason:"Honda/Acura requiere VIN, ZIP/código postal, teléfono, email y serie del radio para la recuperación oficial. Completa los datos faltantes antes de buscar el código.",
    };
  }

  return callApprovedConnector(input, {
    label: "Honda/Acura",
    endpoint: process.env.HONDA_ACURA_LOOKUP_URL?.trim(),
    token: process.env.HONDA_ACURA_LOOKUP_TOKEN?.trim(),
    sourceUrl,
  });
}

async function lookupRenaultDacia(input: LookupInput): Promise<LookupResult> {
  return callApprovedConnector(input, {
    label: "Renault/Dacia",
    endpoint: process.env.RENAULT_LOOKUP_URL?.trim(),
    token: process.env.RENAULT_LOOKUP_TOKEN?.trim(),
    sourceUrl: officialSourceFor(input.brand),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 }); }

  const brand = normalize(body?.brand, 100).toLowerCase();
  const serial = normalize(body?.serial, 120);
  const email = normalize(body?.email, 254);
  const stored=await loadStoredDetails(serial,email);
  const vin = normalize(body?.vin||stored?.vin, 32).toUpperCase();
  const postalCode = normalize(body?.postalCode||stored?.postal_code, 20).toUpperCase();
  const phone = normalize(body?.phone||stored?.phone, 40);
  const effectiveEmail = email||normalize(stored?.email,254);
  const year = Number.isFinite(Number(body?.year)) ? Number(body.year) : null;
  const model = normalize(body?.model, 120);

  if (!brand || !serial) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });

  const input: LookupInput = { brand, serial, vin, postalCode, year, model, email:effectiveEmail, phone };
  if (brand === "honda" || brand === "acura") return NextResponse.json(await lookupHondaAcura(input));
  if (brand === "renault" || brand === "dacia") return NextResponse.json(await lookupRenaultDacia(input));

  return NextResponse.json({
    status: "unsupported",
    reason: "Esta marca todavía no tiene una fuente automática aprobada y debe pasar a revisión especial.",
  } satisfies LookupResult);
}
