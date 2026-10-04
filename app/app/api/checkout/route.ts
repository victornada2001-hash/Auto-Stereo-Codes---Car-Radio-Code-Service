import { NextResponse } from "next/server";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceCents = Number(process.env.STEREO_CODE_PRICE_CENTS);
  const currency = clean(process.env.STEREO_CODE_CURRENCY || "usd", 3).toLowerCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!stripeSecretKey || !Number.isInteger(priceCents) || priceCents <= 0) {
    return NextResponse.json(
      { code: "NOT_CONFIGURED", message: "Payment is not configured." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
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
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  params.set("success_url", `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl}/#request-form`);
  params.set("line_items[0][price_data][currency]", currency);
  params.set("line_items[0][price_data][product_data][name]", "Car Stereo Unlock Code");
  params.set("line_items[0][price_data][unit_amount]", String(priceCents));
  params.set("line_items[0][quantity]", "1");
  params.set("locale", language === "es" ? "es-419" : "en");

  if (email) params.set("customer_email", email);

  const metadata: Record<string, string> = {
    serial,
    year: String(year),
    brand,
    model,
    phone,
    email,
    vin,
    language,
  };

  for (const [key, value] of Object.entries(metadata)) {
    params.set(`metadata[${key}]`, value);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  const result = await stripeResponse.json();

  if (!stripeResponse.ok || !result.url) {
    console.error("Stripe checkout creation failed", stripeResponse.status, result?.error?.type);
    return NextResponse.json({ code: "PAYMENT_ERROR" }, { status: 502 });
  }

  return NextResponse.json({ url: result.url }, { status: 201 });
}
