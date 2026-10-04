import { NextResponse } from "next/server";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function makeReference() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().split("-")[0].toUpperCase();
  return `ASC-${date}-${random}`;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { code: "NOT_CONFIGURED", message: "Request storage is not configured." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Invalid request body." },
      { status: 400 },
    );
  }

  const serial = clean(body.serial, 100);
  const brand = clean(body.brand, 80);
  const model = clean(body.model, 100);
  const phone = clean(body.phone, 32);
  const email = clean(body.email, 254).toLowerCase();
  const vin = clean(body.vin, 17).toUpperCase();
  const language = clean(body.language, 2) === "es" ? "es" : "en";
  const year = Number(body.year);
  const currentYear = new Date().getFullYear();

  const validPhone = !phone || phone.replace(/\D/g, "").length >= 7;
  const validEmail = !email || EMAIL_PATTERN.test(email);
  const validVin = !vin || VIN_PATTERN.test(vin);

  if (
    !serial ||
    !brand ||
    !model ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > currentYear + 1 ||
    (!phone && !email) ||
    !validPhone ||
    !validEmail ||
    !validVin
  ) {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Please check the submitted information." },
      { status: 400 },
    );
  }

  const reference = makeReference();

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/code_requests`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      reference,
      serial,
      year,
      brand,
      model,
      phone: phone || null,
      email: email || null,
      vin: vin || null,
      language,
      status: "new",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Supabase request insert failed", response.status, await response.text());
    return NextResponse.json(
      { code: "SAVE_FAILED", message: "Unable to save request." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, reference }, { status: 201 });
}
