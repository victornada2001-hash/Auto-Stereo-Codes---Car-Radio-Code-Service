import { NextResponse } from "next/server";

function supabaseHeaders(apiKey: string, legacyServiceRoleKey?: string) {
  const headers: Record<string, string> = { apikey: apiKey };
  if (legacyServiceRoleKey) headers.Authorization = `Bearer ${legacyServiceRoleKey}`;
  return headers;
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyServiceRoleKey;

  if (!supabaseUrl || !apiKey) {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }

  const headers = supabaseHeaders(apiKey, !secretKey ? legacyServiceRoleKey : undefined);
  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/code_requests?select=reference,payment_status&stripe_session_id=eq.${encodeURIComponent(sessionId)}&limit=1`,
    { headers, cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json({ status: "error" }, { status: 502 });
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ status: "processing" });
  }

  return NextResponse.json({
    status: rows[0].payment_status === "paid" ? "paid" : "processing",
    reference: rows[0].reference,
  });
}
