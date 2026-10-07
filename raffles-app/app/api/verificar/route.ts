import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function digits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}
function normalizePhone(value: unknown) {
  let valueDigits = digits(value);
  if (valueDigits.length === 12 && valueDigits.startsWith("52")) valueDigits = valueDigits.slice(2);
  if (valueDigits.length === 13 && valueDigits.startsWith("521")) valueDigits = valueDigits.slice(3);
  return valueDigits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = String(body?.mode || "ticket");
    const value = String(body?.value || "").trim();

    const activeResponse = await supabaseRest("/rest/v1/raffles?status=eq.active&select=id,title,prize&order=started_at.desc.nullslast,created_at.desc&limit=1");
    if (!activeResponse.ok) return NextResponse.json({ error: await parseSupabaseError(activeResponse) }, { status: 500 });
    const raffle = (await activeResponse.json())?.[0] || null;
    if (!raffle) return NextResponse.json({ error: "No hay un sorteo activo en este momento." }, { status: 404 });

    if (mode === "phone") {
      const phone = normalizePhone(value);
      if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: "Escribe un WhatsApp válido de 10 dígitos." }, { status: 400 });

      const reservationsResponse = await supabaseRest(`/rest/v1/raffle_reservations_admin?raffle_id=eq.${encodeURIComponent(raffle.id)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id,status,effective_status,created_at,ticket_count&order=created_at.desc&limit=20`);
      if (!reservationsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationsResponse) }, { status: 500 });
      const rows = await reservationsResponse.json();
      if (!rows.length) return NextResponse.json({ error: "No encontramos boletos para ese WhatsApp en el sorteo activo." }, { status: 404 });

      return NextResponse.json({
        mode: "phone",
        raffle,
        results: rows.map((row: Record<string, unknown>) => ({
          status: row.effective_status || row.status,
          created_at: row.created_at,
          ticket_count: Number(row.ticket_count || 0),
        })),
      });
    }

    const ticketNumber = Number(digits(value));
    if (!Number.isInteger(ticketNumber) || ticketNumber < 1) return NextResponse.json({ error: "Escribe un número de boleto válido." }, { status: 400 });

    const ticketResponse = await supabaseRest(`/rest/v1/raffle_tickets?raffle_id=eq.${encodeURIComponent(raffle.id)}&ticket_number=eq.${ticketNumber}&released_at=is.null&select=reservation_id,ticket_number&limit=1`);
    if (!ticketResponse.ok) return NextResponse.json({ error: await parseSupabaseError(ticketResponse) }, { status: 500 });
    const ticket = (await ticketResponse.json())?.[0];
    if (!ticket) return NextResponse.json({
      mode: "ticket",
      raffle,
      results: [{ ticket_number: ticketNumber, status: "available", ticket_count: 0, created_at: null }],
    });

    const reservationResponse = await supabaseRest(`/rest/v1/raffle_reservations_admin?id=eq.${encodeURIComponent(ticket.reservation_id)}&select=status,effective_status,created_at&limit=1`);
    if (!reservationResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
    const reservation = (await reservationResponse.json())?.[0];

    return NextResponse.json({
      mode: "ticket",
      raffle,
      results: [{
        ticket_number: ticketNumber,
        status: reservation?.effective_status || reservation?.status || "reserved",
        created_at: reservation?.created_at || null,
        ticket_count: 1,
      }],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
