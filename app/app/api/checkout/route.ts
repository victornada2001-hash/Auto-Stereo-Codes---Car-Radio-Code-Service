import { randomUUID } from "crypto";
import { resolve4, resolve6, resolveMx } from "dns/promises";
import { NextResponse } from "next/server";
import { encryptCheckoutSession } from "@/lib/payment-session";
import { paypalRequest } from "@/lib/paypal";
import { normalizeLanguage, paypalLocale } from "@/app/languages";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const BASE_PRICE_USD = 17.99;
const PRIORITY_SMS_PRICE_USD = Number(process.env.PRIORITY_SMS_PRICE_USD || "1.75");
const BLOCKED_EMAIL_DOMAINS = new Set(["example.com","example.org","example.net","test.com","invalid.com","localhost","mailinator.com"]);

function clean(value: unknown, maxLength = 255) { return String(value ?? "").trim().slice(0, maxLength); }

function getPublicSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

function validInternationalPhone(phone: string) {
  if (!E164_PATTERN.test(phone)) return false;
  const digits = phone.replace(/\D/g, "");
  if (/^(\d)\1+$/.test(digits)) return false;
  if (/^(0123456789|1234567890|9876543210)+$/.test(digits)) return false;
  return true;
}

async function emailDomainCanReceiveMail(email: string) {
  if (!EMAIL_PATTERN.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (!domain || BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
  try {
    const mx = await resolveMx(domain);
    if (mx.some(record => record.exchange)) return true;
  } catch {}
  try {
    const a = await resolve4(domain);
    if (a.length) return true;
  } catch {}
  try {
    const aaaa = await resolve6(domain);
    if (aaaa.length) return true;
  } catch {}
  return false;
}

export async function POST(request: Request) {
  const siteUrl = getPublicSiteUrl(request);
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || !process.env.PAYPAL_SESSION_SECRET) {
    return NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 }); }

  const serial = clean(body.serial, 100);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 32);
  const detectedBrand = clean(body.detectedBrand, 120);
  const radioFamily = clean(body.radioFamily, 160);
  const prioritySms = body.prioritySms === true;
  const language = normalizeLanguage(body.language);

  if (!serial) return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ code: "INVALID_EMAIL" }, { status: 400 });
  if (!(await emailDomainCanReceiveMail(email))) return NextResponse.json({ code: "EMAIL_UNDELIVERABLE" }, { status: 400 });
  if (prioritySms && !validInternationalPhone(phone)) return NextResponse.json({ code: "INVALID_PHONE" }, { status: 400 });

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
      orderId: String(result.id), serial, vin: "", postalCode: "", phone: prioritySms ? phone : "", email,
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
