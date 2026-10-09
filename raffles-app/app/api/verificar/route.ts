import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function digits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}
function normalizePhone(value: unknown) {
  let valueDigits = digits(value);
  if (valueDigits.length === 12 && valueDigits.startsWith("52")) valueDigits = valueDigits.slice(2);
  if (valueDigits.length === 13 && valueDigits.startsWith("521")) valueDigits = valueDigits.slice(3);
  return valueDigits;
}
function publicImageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}
function splitName(value: unknown) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  return { first_name: parts.shift() || "", last_name: parts.join(" ") };
}
function normalizeStatus(value: unknown) {
  return String(value || "reserved");
}
function makeCounters(rows: Array<{ status: string }>) {
  return rows.reduce((acc, row) => {
    if (row.status === "paid") acc.confirmed += 1;
    else if (["receipt_uploaded", "manual_review", "ai_reviewed"].includes(row.status)) acc.review += 1;
    else acc.unpaid += 1;
    return acc;
  }, { confirmed: 0, review: 0, unpaid: 0 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mode = String(body?.mode || "ticket");
    const value = String(body?.value || "").trim();

    const activeResponse = await supabaseRest("/rest/v1/raffles?status=eq.active&select=id,title,prize,cover_image_path&order=started_at.desc.nullslast,created_at.desc&limit=1");
    if (!activeResponse.ok) return NextResponse.json({ error: await parseSupabaseError(activeResponse) }, { status: 500 });
    const raffleRaw = (await activeResponse.json())?.[0] || null;
    if (!raffleRaw) return NextResponse.json({ error: "No hay un sorteo activo en este momento." }, { status: 404 });
    const raffle = { ...raffleRaw, cover_image_url: publicImageUrl(raffleRaw.cover_image_path) };

    if (mode === "phone") {
      const phone = normalizePhone(value);
      if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: "Escribe un WhatsApp válido de 10 dígitos." }, { status: 400 });

      const reservationsResponse = await supabaseRest(`/rest/v1/raffle_reservations_admin?raffle_id=eq.${encodeURIComponent(raffle.id)}&customer_phone=eq.${encodeURIComponent(phone)}&select=id,status,effective_status,created_at,customer_name,customer_state&order=created_at.desc&limit=50`);
      if (!reservationsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationsResponse) }, { status: 500 });
      const reservations = await reservationsResponse.json();
      if (!reservations.length) return NextResponse.json({ error: "No encontramos boletos para ese WhatsApp en el sorteo activo." }, { status: 404 });

      const ids = reservations.map((row: Record<string, unknown>) => String(row.id)).filter(Boolean);
      const ticketsResponse = await supabaseRest(`/rest/v1/raffle_tickets?raffle_id=eq.${encodeURIComponent(raffle.id)}&reservation_id=in.(${ids.join(",")})&released_at=is.null&select=reservation_id,ticket_number&order=ticket_number.asc`);
      if (!ticketsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(ticketsResponse) }, { status: 500 });
      const tickets = await ticketsResponse.json();

      const receiptsResponse = await supabaseRest(`/rest/v1/raffle_receipts?reservation_id=in.(${ids.join(",")})&select=reservation_id,created_at&order=created_at.desc`);
      const receipts = receiptsResponse.ok ? await receiptsResponse.json() : [];
      const sentAt = new Map<string, string>();
      for (const receipt of receipts) if (!sentAt.has(String(receipt.reservation_id))) sentAt.set(String(receipt.reservation_id), String(receipt.created_at));
      const reservationMap = new Map(reservations.map((row: Record<string, unknown>) => [String(row.id), row]));

      const results = tickets.map((ticket: Record<string, unknown>) => {
        const reservation = reservationMap.get(String(ticket.reservation_id)) as Record<string, unknown> | undefined;
        const status = normalizeStatus(reservation?.effective_status || reservation?.status);
        const name = splitName(reservation?.customer_name);
        return {
          ticket_number: Number(ticket.ticket_number),
          first_name: name.first_name,
          last_name: name.last_name,
          customer_state: String(reservation?.customer_state || ""),
          sent_at: sentAt.get(String(ticket.reservation_id)) || null,
          created_at: reservation?.created_at || null,
          status,
        };
      });

      return NextResponse.json({ mode: "phone", raffle, results, counters: makeCounters(results) });
    }

    const ticketNumber = Number(digits(value));
    if (!Number.isInteger(ticketNumber) || ticketNumber < 1) return NextResponse.json({ error: "Escribe un número de boleto válido." }, { status: 400 });

    const ticketResponse = await supabaseRest(`/rest/v1/raffle_tickets?raffle_id=eq.${encodeURIComponent(raffle.id)}&ticket_number=eq.${ticketNumber}&released_at=is.null&select=reservation_id,ticket_number&limit=1`);
    if (!ticketResponse.ok) return NextResponse.json({ error: await parseSupabaseError(ticketResponse) }, { status: 500 });
    const ticket = (await ticketResponse.json())?.[0];
    if (!ticket) return NextResponse.json({
      mode: "ticket",
      raffle,
      results: [{ ticket_number: ticketNumber, first_name: "", last_name: "", customer_state: "", sent_at: null, created_at: null, status: "available" }],
      counters: { confirmed: 0, review: 0, unpaid: 0 },
    });

    const reservationResponse = await supabaseRest(`/rest/v1/raffle_reservations_admin?id=eq.${encodeURIComponent(ticket.reservation_id)}&select=id,status,effective_status,created_at,customer_name,customer_state&limit=1`);
    if (!reservationResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
    const reservation = (await reservationResponse.json())?.[0];
    const receiptResponse = await supabaseRest(`/rest/v1/raffle_receipts?reservation_id=eq.${encodeURIComponent(ticket.reservation_id)}&select=created_at&order=created_at.desc&limit=1`);
    const receipt = receiptResponse.ok ? (await receiptResponse.json())?.[0] : null;
    const status = normalizeStatus(reservation?.effective_status || reservation?.status || "reserved");
    const name = splitName(reservation?.customer_name);
    const results = [{
      ticket_number: ticketNumber,
      first_name: name.first_name,
      last_name: name.last_name,
      customer_state: String(reservation?.customer_state || ""),
      sent_at: receipt?.created_at || null,
      created_at: reservation?.created_at || null,
      status,
    }];

    return NextResponse.json({ mode: "ticket", raffle, results, counters: makeCounters(results) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
