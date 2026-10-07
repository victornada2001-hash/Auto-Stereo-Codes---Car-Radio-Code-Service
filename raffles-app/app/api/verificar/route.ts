import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const folio = clean(body?.folio).toUpperCase();
    const phone = clean(body?.phone);

    if (folio.length < 4 || phone.length < 8) {
      return NextResponse.json({ error: "Escribe un folio y teléfono válidos." }, { status: 400 });
    }

    const reservations = await supabaseRest(
      `/rest/v1/raffle_reservations_admin?folio=eq.${encodeURIComponent(folio)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id,raffle_id,folio,amount,status,effective_status,expires_at,created_at,paid_at,ticket_count&limit=1`
    );

    if (!reservations.ok) {
      return NextResponse.json({ error: await parseSupabaseError(reservations) }, { status: 500 });
    }

    const rows = await reservations.json();
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: "No encontramos una solicitud con ese folio y teléfono." }, { status: 404 });
    }

    const ticketsResponse = await supabaseRest(
      `/rest/v1/raffle_tickets?reservation_id=eq.${encodeURIComponent(row.id)}&select=ticket_number,released_at&order=ticket_number.asc`
    );
    if (!ticketsResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(ticketsResponse) }, { status: 500 });
    }

    const raffleResponse = await supabaseRest(
      `/rest/v1/raffles?id=eq.${encodeURIComponent(row.raffle_id)}&select=id,title,status,draw_date,prize&limit=1`
    );
    const raffle = raffleResponse.ok ? (await raffleResponse.json())?.[0] || null : null;
    const ticketRows = await ticketsResponse.json();
    const activeTickets = ticketRows.filter((ticket: { released_at?: string | null }) => !ticket.released_at).map((ticket: { ticket_number: number }) => ticket.ticket_number);

    return NextResponse.json({
      folio: row.folio,
      status: row.effective_status || row.status,
      amount: row.amount,
      expires_at: row.expires_at,
      paid_at: row.paid_at,
      created_at: row.created_at,
      tickets: activeTickets,
      released_ticket_count: Math.max(0, ticketRows.length - activeTickets.length),
      raffle,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
