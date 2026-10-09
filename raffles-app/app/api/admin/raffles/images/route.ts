import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}
function publicImageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const raffleId = String(request.nextUrl.searchParams.get("raffleId") || "");
  if (!raffleId) return NextResponse.json({ error: "Falta raffleId" }, { status: 400 });
  const response = await supabaseRest(`/rest/v1/raffle_images?raffle_id=eq.${encodeURIComponent(raffleId)}&active=eq.true&select=id,raffle_id,storage_path,sort_order,created_at&order=sort_order.asc,created_at.asc`);
  if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });
  const rows = await response.json();
  return NextResponse.json(rows.map((row: Record<string, unknown>) => ({ ...row, url: publicImageUrl(row.storage_path as string) })));
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order || 0);
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  const response = await supabaseRest(`/rest/v1/raffle_images?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) });
  if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
  return NextResponse.json({ ok: true, image: (await response.json())?.[0] || null });
}
