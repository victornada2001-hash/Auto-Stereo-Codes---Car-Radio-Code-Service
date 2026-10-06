import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Decision = {
  queue: "automatic" | "special";
  confidence: "high" | "medium" | "low";
  reason: string;
  source: "ai" | "rules";
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function ruleDecision(brandRaw: unknown, familyRaw: unknown): Decision {
  const brand = normalize(brandRaw);
  const family = normalize(familyRaw);
  const special = new Set(["mercedes-benz", "mercedes", "jeep", "chrysler", "dodge", "nissan"]);
  const automatic = new Set(["honda", "acura", "renault", "dacia"]);

  if (special.has(brand) || /uconnect|mopar|lcn|anti.?theft/.test(family)) {
    return {
      queue: "special",
      confidence: "high",
      reason: "Esta familia suele requerir proveedor, verificación adicional o un servicio de pago.",
      source: "rules",
    };
  }
  if (automatic.has(brand)) {
    return {
      queue: "automatic",
      confidence: "medium",
      reason: "Marca priorizada para intentar una fuente oficial/gratuita antes de escalar a proveedor.",
      source: "rules",
    };
  }
  return {
    queue: "special",
    confidence: "low",
    reason: "Todavía no hay una fuente automática validada para esta marca o familia.",
    source: "rules",
  };
}

function extractText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload?.output)) return "";
  for (const item of payload.output) {
    if (!Array.isArray(item?.content)) continue;
    for (const content of item.content) {
      if (typeof content?.text === "string") return content.text;
    }
  }
  return "";
}

function parseDecision(text: string): Omit<Decision, "source"> | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < start) return null;
    const data = JSON.parse(text.slice(start, end + 1));
    const queue = data?.queue === "automatic" ? "automatic" : data?.queue === "special" ? "special" : null;
    const confidence = ["high", "medium", "low"].includes(data?.confidence) ? data.confidence : null;
    const reason = typeof data?.reason === "string" ? data.reason.trim().slice(0, 400) : "";
    if (!queue || !confidence || !reason) return null;
    return { queue, confidence, reason };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const model = process.env.OPENAI_ROUTER_MODEL || "gpt-6-luna";
  return NextResponse.json({ aiConfigured: Boolean(process.env.OPENAI_API_KEY), model });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const fallback = ruleDecision(body?.brand, body?.radioFamily);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_ROUTER_MODEL || "gpt-6-luna";

  if (!apiKey) return NextResponse.json({ decision: fallback, aiConfigured: false, model });

  const input = {
    brand: String(body?.brand ?? "").slice(0, 100),
    model: String(body?.model ?? "").slice(0, 100),
    year: body?.year ?? null,
    serial: String(body?.serial ?? "").slice(0, 120),
    radioFamily: String(body?.radioFamily ?? "").slice(0, 160),
  };

  const instructions = `You route paid car-radio unlock-code requests for an admin panel.\nReturn ONLY compact JSON with keys queue, confidence, reason.\nqueue must be automatic or special.\nautomatic means: safe to attempt an already-configured official/free or approved API source; it does NOT mean inventing a code or scraping random websites.\nspecial means: needs provider/manual review, ownership verification, paid lookup, uncertain identification, or no validated source.\nconfidence must be high, medium, or low.\nBe conservative: when uncertain choose special. Never produce or guess an unlock code.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions,
        input: JSON.stringify(input),
        max_output_tokens: 180,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("OpenAI router failed", response.status, await response.text());
      return NextResponse.json({ decision: fallback, aiConfigured: true, aiFallback: true, model });
    }

    const payload = await response.json();
    const parsed = parseDecision(extractText(payload));
    if (!parsed) return NextResponse.json({ decision: fallback, aiConfigured: true, aiFallback: true, model });

    return NextResponse.json({ decision: { ...parsed, source: "ai" }, aiConfigured: true, model });
  } catch (error) {
    console.error("OpenAI router error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ decision: fallback, aiConfigured: true, aiFallback: true, model });
  }
}
