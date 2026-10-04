import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatureParts = parts.filter((part) => part.startsWith("v1="));

  if (!timestampPart || signatureParts.length === 0) return false;

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (age > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");

  return signatureParts.some((part) => {
    const actual = part.slice(3);
    const actualBuffer = Buffer.from(actual, "utf8");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

function makeReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().split("-")[0].toUpperCase();
  return `ASC-${date}-${random}`;
}

function supabaseHeaders(apiKey: string, legacyServiceRoleKey?: string) {
  const headers: Record<string, string> = {
    apikey: apiKey,
    "Content-Type": "application/json",
  };
  if (legacyServiceRoleKey) headers.Authorization = `Bearer ${legacyServiceRoleKey}`;
  return headers;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!webhookSecret || !signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object;
  if (!session?.id || session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyServiceRoleKey;

  if (!supabaseUrl || !apiKey) {
    console.error("Supabase is not configured for Stripe webhook fulfillment");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const headers = supabaseHeaders(apiKey, !secretKey ? legacyServiceRoleKey : undefined);
  const encodedSessionId = encodeURIComponent(session.id);
  const existingResponse = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/code_requests?select=id,reference&stripe_session_id=eq.${encodedSessionId}&limit=1`,
    { headers, cache: "no-store" },
  );

  if (existingResponse.ok) {
    const existing = await existingResponse.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ received: true });
    }
  }

  const metadata = session.metadata || {};
  const reference = makeReference();

  const insertResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/code_requests`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      reference,
      serial: metadata.serial || "",
      year: Number(metadata.year),
      brand: metadata.brand || "",
      model: metadata.model || "",
      phone: metadata.phone || null,
      email: metadata.email || null,
      vin: metadata.vin || null,
      language: metadata.language === "es" ? "es" : "en",
      status: "new",
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
      payment_status: "paid",
      amount_total: session.amount_total ?? null,
      currency: session.currency || null,
      paid_at: new Date().toISOString(),
    }),
    cache: "no-store",
  });

  if (!insertResponse.ok) {
    if (insertResponse.status === 409) {
      return NextResponse.json({ received: true });
    }
    console.error("Paid request insert failed", insertResponse.status, await insertResponse.text());
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
