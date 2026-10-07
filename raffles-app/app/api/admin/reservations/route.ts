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
    const reservations = await supabaseRest("/rest/v1/raffle_reservations_admin?select=id,raffle_id,folio,customer_name,customer_phone,customer_state,customer_id,amount,status,effective_status,expires_at,created_at,paid_at,ticket_count&order=created_at.desc&limit=300");
    if (!reservations.ok) return NextResponse.json({ error: await parseSupabaseError(reservations) }, { status: 500 });
    const rows = await reservations.json();

    const ids = rows.map((r: { id: string }) => r.id);
    let tickets: Array<{ reservation_id: string; ticket_number: number; released_at: string | null }> = [];
    let receipts: Array<{ reservation_id: string; id: string; original_filename: string | null; ai_status: string; extracted_bank: string | null; extracted_amount: number | null; extracted_reference: string | null; extracted_tracking_key: string | null; created_at: string }> = [];
    if (ids.length) {
      const filter = ids.map((id: string) => `\"${id}\"`).join(",");
      const ticketResponse = await supabaseRest(`/rest/v1/raffle_tickets?reservation_id=in.(${filter})&select=reservation_id,ticket_number,released_at&order=ticket_number.asc`);
      if (ticketResponse.ok) tickets = await ticketResponse.json();
      const receiptResponse = await supabaseRest(`/rest/v1/raffle_receipts?reservation_id=in.(${filter})&select=reservation_id,id,original_filename,ai_status,extracted_bank,extracted_amount,extracted_reference,extracted_tracking_key,created_at&order=created_at.desc`);
      if (receiptResponse.ok) receipts = await receiptResponse.json();
    }

    return NextResponse.json(rows.map((row: { id: string; customer_state?: string | null }) => ({
      ...row,
      customer_email: row.customer_state || null,
      tickets: tickets.filter(t => t.reservation_id === row.id && !t.released_at).map(t => t.ticket_number),
      ticket_history: tickets.filter(t => t.reservation_id === row.id).map(t => ({ number: t.ticket_number, released_at: t.released_at })),
      receipts: receipts.filter(r => r.reservation_id === row.id),
    })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body?.id || "");
    if (!id) return NextResponse.json({ error: "Falta la solicitud." }, { status: 400 });

    if (body?.action === "release") {
      const now = new Date().toISOString();
      const ticketsResponse = await supabaseRest(`/rest/v1/raffle_tickets?reservation_id=eq.${encodeURIComponent(id)}&released_at=is.null`, {
        method: "PATCH",
        body: JSON.stringify({ released_at: now, release_reason: String(body?.reason || "Liberación manual desde administración") }),
      });
      if (!ticketsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(ticketsResponse) }, { status: 500 });

      const reservationResponse = await supabaseRest(`/rest/v1/raffle_reservations?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status: "cancelled", updated_at: now, admin_notes: String(body?.reason || "Boletos liberados manualmente") }),
      });
      if (!reservationResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
      return NextResponse.json({ ok: true, released: true });
    }

    const status = String(body?.status || "");
    const allowed = new Set(["reserved", "receipt_uploaded", "paid", "unpaid", "manual_review", "cancelled"]);
    if (!allowed.has(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });

    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    patch.paid_at = status === "paid" ? new Date().toISOString() : null;
    const response = await supabaseRest(`/rest/v1/raffle_reservations?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });
    return NextResponse.json({ ok: true, reservation: (await response.json())?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
