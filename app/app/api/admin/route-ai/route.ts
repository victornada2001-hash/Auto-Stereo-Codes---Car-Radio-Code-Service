import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

type Decision = {
  queue: "automatic";
  confidence: "high";
  reason: string;
  source: "rules";
};

function canonicalBrand(value: unknown): "honda" | "acura" | "" {
  const brand = String(value ?? "").trim().toLowerCase();
  if (brand === "honda") return "honda";
  if (brand === "acura") return "acura";
  return "";
}

function decision(brand: "honda" | "acura"): Decision {
  return {
    queue: "automatic",
    confidence: "high",
    reason: `${brand === "honda" ? "Honda" : "Acura"} es una marca admitida. Se intentará únicamente la fuente oficial o el conector Honda/Acura configurado; nunca se inventará un código.`,
    source: "rules",
  };
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({ aiConfigured: false, mode: "honda_acura_only" });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  const brand = canonicalBrand(body?.brand);
  if (!brand) {
    return NextResponse.json({ code: "UNSUPPORTED_BRAND", message: "Este sistema solo procesa solicitudes Honda y Acura." }, { status: 400 });
  }

  return NextResponse.json({ decision: decision(brand), aiConfigured: false, mode: "honda_acura_only" });
}
