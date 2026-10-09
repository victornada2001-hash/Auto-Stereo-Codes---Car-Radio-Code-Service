import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const [settingsResponse, accountsResponse] = await Promise.all([
      supabaseRest("/rest/v1/raffle_site_settings?id=eq.1&select=*&limit=1"),
      supabaseRest("/rest/v1/raffle_payment_accounts?select=*&order=sort_order.asc,created_at.asc"),
    ]);
    if (!settingsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(settingsResponse) }, { status: 500 });
    if (!accountsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(accountsResponse) }, { status: 500 });
    return NextResponse.json({ settings: (await settingsResponse.json())?.[0] || null, accounts: await accountsResponse.json() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    if (body?.settings) {
      const source = body.settings as Record<string, unknown>;
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const field of ["brand_name", "whatsapp_number", "facebook_url", "instagram_url", "winner_method"]) {
        if (source[field] !== undefined) patch[field] = String(source[field] || "").trim() || null;
      }
      const response = await supabaseRest("/rest/v1/raffle_site_settings?id=eq.1", {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
      return NextResponse.json({ ok: true, settings: (await response.json())?.[0] || null });
    }

    if (body?.account) {
      const account = body.account as Record<string, unknown>;
      const id = String(account.id || "");
      const payload = {
        label: String(account.label || "Cuenta").trim(),
        bank_name: String(account.bank_name || "").trim(),
        beneficiary_name: String(account.beneficiary_name || "").trim(),
        account_number: String(account.account_number || "").trim() || null,
        clabe: String(account.clabe || "").trim() || null,
        logo_url: String(account.logo_url || "").trim() || null,
        instructions: String(account.instructions || "").trim() || null,
        active: account.active !== false,
        sort_order: Number(account.sort_order || 0),
        updated_at: new Date().toISOString(),
      };
      if (!payload.bank_name || !payload.beneficiary_name) return NextResponse.json({ error: "Banco y beneficiario son obligatorios." }, { status: 400 });
      const response = await supabaseRest(id ? `/rest/v1/raffle_payment_accounts?id=eq.${encodeURIComponent(id)}` : "/rest/v1/raffle_payment_accounts", {
        method: id ? "PATCH" : "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
      return NextResponse.json({ ok: true, account: (await response.json())?.[0] || null });
    }

    if (body?.toggleAccountId) {
      const id = String(body.toggleAccountId);
      const active = Boolean(body.active);
      const response = await supabaseRest(`/rest/v1/raffle_payment_accounts?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ active, updated_at: new Date().toISOString() }),
      });
      if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
