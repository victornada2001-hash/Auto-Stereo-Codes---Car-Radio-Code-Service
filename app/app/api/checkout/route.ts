import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { encryptCheckoutSession } from "@/lib/payment-session";
import { paypalRequest } from "@/lib/paypal";
import { normalizeLanguage, paypalLocale } from "@/app/languages";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASE_PRICE_USD = Number(process.env.STEREO_CODE_PRICE_USD || "23.99");
const PRIORITY_SMS_PRICE_USD = Number(process.env.PRIORITY_SMS_PRICE_USD || "1.75");

function clean(value: unknown, maxLength = 255) { return String(value ?? "").trim().slice(0, maxLength); }

function getPublicSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const siteUrl = getPublicSiteUrl(request);
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || !process.env.PAYPAL_SESSION_SECRET) {
    return NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 }); }

  const serial = clean(body.serial, 100);
  const vin = clean(body.vin, 32).toUpperCase();
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 32);
  const detectedBrand = clean(body.detectedBrand, 120);
  const radioFamily = clean(body.radioFamily, 160);
  const prioritySms = body.prioritySms === true;
  const language = normalizeLanguage(body.language);
  const validPhone = !prioritySms || phone.replace(/\D/g, "").length >= 7;
  const normalizedBrand = detectedBrand.toLowerCase();
  const vinRequired = normalizedBrand === "honda" || normalizedBrand === "acura";

  if (!serial || !EMAIL_PATTERN.test(email) || !validPhone || (vinRequired && !vin)) {
    return NextResponse.json({ code: vinRequired && !vin ? "VIN_REQUIRED" : "INVALID_INPUT" }, { status: 400 });
  }

  const amountUsd = (BASE_PRICE_USD + (prioritySms ? PRIORITY_SMS_PRICE_USD : 0)).toFixed(2);

  try {
    const paypalResponse = await paypalRequest("/v2/checkout/orders", {
      method: "POST",
      headers: { "PayPal-Request-Id": randomUUID().replaceAll("-", "").slice(0, 24) },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: "STEREO_CODE",
          description: prioritySms ? "Car Stereo Unlock Code + Priority SMS" : "Car Stereo Unlock Code",
          amount: { currency_code: "USD", value: amountUsd },
        }],
        payment_source: { paypal: { experience_context: {
          brand_name: "Auto Stereo Codes",
          locale: paypalLocale(language),
          landing_page: "GUEST_CHECKOUT",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${siteUrl}/api/paypal/capture`,
          cancel_url: `${siteUrl}/request`,
        }}},
      }),
    });

    const result = await paypalResponse.json();
    const approvalUrl = Array.isArray(result.links)
      ? result.links.find((link: { rel?: string; href?: string }) => link.rel === "payer-action" || link.rel === "approve")?.href
      : undefined;

    if (!paypalResponse.ok || !result.id || !approvalUrl) {
      console.error("PayPal order creation failed", paypalResponse.status, result?.name);
      return NextResponse.json({ code: "PAYMENT_ERROR" }, { status: 502 });
    }

    const session = encryptCheckoutSession({
      orderId: String(result.id), serial, vin, phone: prioritySms ? phone : "", email,
      language, prioritySms, amountUsd, detectedBrand, radioFamily,
    });

    const response = NextResponse.json({ url: approvalUrl }, { status: 201 });
    response.cookies.set("asc_paypal_checkout", session, {
      httpOnly: true, secure: siteUrl.startsWith("https://"), sameSite: "lax", path: "/", maxAge: 60 * 30,
    });
    return response;
  } catch (error) {
    console.error("Unable to create PayPal checkout", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ code: "PAYMENT_ERROR" }, { status: 502 });
  }
}
