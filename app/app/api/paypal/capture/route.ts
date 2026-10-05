import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { decryptCheckoutSession } from "@/lib/payment-session";
import { paypalRequest } from "@/lib/paypal";

export const runtime = "nodejs";

function makeReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = randomUUID().split("-")[0].toUpperCase();
  return `ASC-${date}-${random}`;
}

function getPublicSiteUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return request.nextUrl.origin;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyKey;
  if (!url || !apiKey) throw new Error("SUPABASE_NOT_CONFIGURED");
  const headers: Record<string, string> = { apikey: apiKey, "Content-Type": "application/json" };
  if (!secretKey && legacyKey) headers.Authorization = `Bearer ${legacyKey}`;
  return { url: url.replace(/\/$/, ""), headers };
}

async function findExistingReference(orderId: string) {
  const { url, headers } = supabaseConfig();
  const endpoint = new URL(`${url}/rest/v1/code_requests`);
  endpoint.searchParams.set("paypal_order_id", `eq.${orderId}`);
  endpoint.searchParams.set("select", "reference");
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, { headers, cache: "no-store" });
  if (!response.ok) return "";
  const rows = await response.json();
  return Array.isArray(rows) && rows[0]?.reference ? String(rows[0].reference) : "";
}

function extractCompletedCapture(order: any) {
  const captures = order?.purchase_units?.flatMap((unit: any) => unit?.payments?.captures || []) || [];
  return captures.find((capture: any) => capture?.status === "COMPLETED") || null;
}

function redirectAndClear(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, getPublicSiteUrl(request)));
  response.cookies.set("asc_paypal_checkout", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("token") || "";
  const cookie = request.cookies.get("asc_paypal_checkout")?.value || "";
  if (!orderId || !cookie) return redirectAndClear(request, "/payment-success?error=session");

  let session;
  try { session = decryptCheckoutSession(cookie); }
  catch { return redirectAndClear(request, "/payment-success?error=session"); }

  if (session.orderId !== orderId) return redirectAndClear(request, "/payment-success?error=session");

  try {
    const existingReference = await findExistingReference(orderId);
    if (existingReference) {
      return redirectAndClear(request, `/payment-success?reference=${encodeURIComponent(existingReference)}&lang=${session.language}`);
    }

    let orderData: any;
    const captureResponse = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { "PayPal-Request-Id": `cap-${orderId}`.slice(0, 25) },
      body: "{}",
    });
    orderData = await captureResponse.json();

    if (!captureResponse.ok) {
      const orderResponse = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
      if (!orderResponse.ok) return redirectAndClear(request, `/payment-success?error=payment&lang=${session.language}`);
      orderData = await orderResponse.json();
    }

    const capture = extractCompletedCapture(orderData);
    const expectedCents = Math.round(Number(session.amountUsd) * 100);
    const paidCents = Math.round(Number(capture?.amount?.value) * 100);
    const paidCurrency = String(capture?.amount?.currency_code || "").toUpperCase();

    if (orderData?.status !== "COMPLETED" || !capture?.id || paidCurrency !== "USD" || !Number.isFinite(paidCents) || paidCents !== expectedCents) {
      return redirectAndClear(request, `/payment-success?error=payment&lang=${session.language}`);
    }

    const reference = makeReference();
    const { url, headers } = supabaseConfig();
    const insertResponse = await fetch(`${url}/rest/v1/code_requests`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        reference,
        serial: session.serial,
        year: null,
        brand: null,
        model: null,
        phone: session.prioritySms ? session.phone : null,
        email: session.email,
        vin: null,
        language: session.language,
        status: "new",
        payment_status: "paid",
        payment_provider: "paypal",
        paypal_order_id: orderId,
        paypal_capture_id: String(capture.id),
        amount_total: paidCents,
        currency: "usd",
        paid_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!insertResponse.ok) {
      const duplicateReference = await findExistingReference(orderId);
      if (duplicateReference) {
        return redirectAndClear(request, `/payment-success?reference=${encodeURIComponent(duplicateReference)}&lang=${session.language}`);
      }
      console.error("Supabase PayPal insert failed", insertResponse.status, await insertResponse.text());
      return redirectAndClear(request, `/payment-success?error=save&lang=${session.language}`);
    }

    return redirectAndClear(request, `/payment-success?reference=${encodeURIComponent(reference)}&lang=${session.language}`);
  } catch (error) {
    console.error("PayPal capture flow failed", error instanceof Error ? error.message : "unknown");
    return redirectAndClear(request, `/payment-success?error=payment&lang=${session.language}`);
  }
}
