import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type LookupResult = {
  status: "found" | "manual" | "unsupported";
  code?: string;
  source?: string;
  reason: string;
};

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

async function lookupHondaAcura(input: { brand: string; serial: string; vin: string }) : Promise<LookupResult> {
  const endpoint = process.env.HONDA_ACURA_LOOKUP_URL?.trim();
  const token = process.env.HONDA_ACURA_LOOKUP_TOKEN?.trim();

  if (!endpoint) {
    return {
      status: "manual",
      reason: "La fuente Honda/Acura aún no está conectada. Revisa el caso manualmente; el sistema no inventará un código.",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "manual", reason: `La fuente Honda/Acura respondió con error ${response.status}.` };
    }

    const data = await response.json();
    const code = normalize(data?.code);
    if (!code || code.length > 100) {
      return { status: "manual", reason: "La fuente no devolvió un código válido; requiere revisión." };
    }

    return {
      status: "found",
      code,
      source: normalize(data?.source) || "Honda/Acura connected source",
      reason: "Código recibido desde la fuente conectada. Revísalo antes de enviarlo al cliente.",
    };
  } catch {
    return { status: "manual", reason: "No se pudo conectar con la fuente Honda/Acura; requiere revisión." };
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const brand = normalize(body?.brand).toLowerCase();
  const serial = normalize(body?.serial);
  const vin = normalize(body?.vin);

  if (!serial) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });

  if (brand === "honda" || brand === "acura") {
    const result = await lookupHondaAcura({ brand, serial, vin });
    return NextResponse.json(result);
  }

  return NextResponse.json({
    status: "unsupported",
    reason: "Esta marca todavía no tiene una fuente automática conectada y debe ir a revisión especial.",
  } satisfies LookupResult);
}
