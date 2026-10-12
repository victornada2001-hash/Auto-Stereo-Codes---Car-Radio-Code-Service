import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { canonicalHondaAcuraBrand, lookupHondaAcura } from "@/lib/honda-acura-lookup";

export const runtime = "nodejs";

function normalize(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyKey;
  if (!url || !apiKey) return null;
  const headers: Record<string, string> = { apikey: apiKey, "Content-Type": "application/json" };
  if (!secretKey && legacyKey) headers.Authorization = `Bearer ${legacyKey}`;
  return { url: url.replace(/\/$/, ""), headers };
}

async function loadStoredDetails(serial: string, email: string, brand: "honda" | "acura") {
  const config = supabaseConfig();
  if (!config) return null;
  try {
    const endpoint = new URL(`${config.url}/rest/v1/code_requests`);
    endpoint.searchParams.set("select", "vin,postal_code,phone,email");
    endpoint.searchParams.set("serial", `eq.${serial}`);
    endpoint.searchParams.set("brand", `ilike.${brand}`);
    if (email) endpoint.searchParams.set("email", `eq.${email}`);
    endpoint.searchParams.set("order", "created_at.desc");
    endpoint.searchParams.set("limit", "1");
    const response = await fetch(endpoint, { headers: config.headers, cache: "no-store" });
    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const brand = canonicalHondaAcuraBrand(body?.brand);
  const serial = normalize(body?.serial, 120);
  if (!brand) return NextResponse.json({ code: "UNSUPPORTED_BRAND", message: "Solo se aceptan Honda y Acura." }, { status: 400 });
  if (!serial) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });

  const email = normalize(body?.email, 254);
  const stored = await loadStoredDetails(serial, email, brand);
  const vin = normalize(body?.vin || stored?.vin, 32).toUpperCase();
  const postalCode = normalize(body?.postalCode || stored?.postal_code, 20).toUpperCase();
  const phone = normalize(body?.phone || stored?.phone, 40);
  const effectiveEmail = email || normalize(stored?.email, 254);
  const year = Number.isFinite(Number(body?.year)) ? Number(body?.year) : null;
  const model = normalize(body?.model, 120);

  return NextResponse.json(await lookupHondaAcura({ brand, serial, vin, postalCode, year, model, email: effectiveEmail, phone }));
}
