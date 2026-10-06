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
  if (brand === "honda") return "https://radio-navicode.honda.com/";
  if (brand === "acura") return "https://radio-navicode.acura.com/";
  if (brand === "renault" || brand === "dacia") return "https://www.renault.co.uk/faq.html";
  return "";
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
  if (!input.vin) {
    return {
      status: "needs_input",
      source: "Honda/Acura official radio code service",
      sourceUrl,
      missing: ["vin"],
      reason: "Honda/Acura requiere el VIN junto con la serie del radio para una consulta oficial. Pide o agrega el VIN antes de buscar el código.",
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
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const brand = normalize(body?.brand, 100).toLowerCase();
  const serial = normalize(body?.serial, 120);
  const vin = normalize(body?.vin, 32).toUpperCase();
  const year = Number.isFinite(Number(body?.year)) ? Number(body.year) : null;
  const model = normalize(body?.model, 120);
  const email = normalize(body?.email, 254);
  const phone = normalize(body?.phone, 40);

  if (!brand || !serial) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });

  const input: LookupInput = { brand, serial, vin, year, model, email, phone };

  if (brand === "honda" || brand === "acura") return NextResponse.json(await lookupHondaAcura(input));
  if (brand === "renault" || brand === "dacia") return NextResponse.json(await lookupRenaultDacia(input));

  return NextResponse.json({
    status: "unsupported",
    reason: "Esta marca todavía no tiene una fuente automática aprobada y debe pasar a revisión especial.",
  } satisfies LookupResult);
}
