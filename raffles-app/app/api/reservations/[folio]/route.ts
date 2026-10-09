import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function publicImageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function GET(request: NextRequest, context: { params: Promise<{ folio: string }> }) {
  try {
    const { folio } = await context.params;
    const token = String(request.nextUrl.searchParams.get("token") || "").trim();
    if (!folio || !token) return NextResponse.json({ error: "Falta el acceso a la reserva." }, { status: 400 });

    const reservationResponse = await supabaseRest(`/rest/v1/raffle_reservations?folio=eq.${encodeURIComponent(folio)}&access_token=eq.${encodeURIComponent(token)}&select=id,raffle_id,folio,customer_name,customer_phone,customer_state,amount,status,expires_at,created_at,paid_at&limit=1`);
    if (!reservationResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
    const reservation = (await reservationResponse.json())?.[0];
    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada o enlace inválido." }, { status: 404 });

    const [ticketsResponse, raffleResponse, accountsResponse, receiptsResponse] = await Promise.all([
      supabaseRest(`/rest/v1/raffle_tickets?reservation_id=eq.${encodeURIComponent(reservation.id)}&select=ticket_number,released_at&order=ticket_number.asc`),
      supabaseRest(`/rest/v1/raffles?id=eq.${encodeURIComponent(reservation.raffle_id)}&select=id,title,prize,cover_image_path,draw_date,status&limit=1`),
      supabaseRest("/rest/v1/raffle_payment_accounts?active=eq.true&select=id,label,bank_name,beneficiary_name,account_number,clabe,logo_url,instructions,sort_order&order=sort_order.asc,created_at.asc"),
      supabaseRest(`/rest/v1/raffle_receipts?reservation_id=eq.${encodeURIComponent(reservation.id)}&select=id,original_filename,ai_status,created_at&order=created_at.desc&limit=5`),
    ]);

    if (!ticketsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(ticketsResponse) }, { status: 500 });
    if (!raffleResponse.ok) return NextResponse.json({ error: await parseSupabaseError(raffleResponse) }, { status: 500 });
    if (!accountsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(accountsResponse) }, { status: 500 });

    const raffle = (await raffleResponse.json())?.[0] || null;
    return NextResponse.json({
      reservation,
      tickets: await ticketsResponse.json(),
      raffle: raffle ? { ...raffle, cover_image_url: publicImageUrl(raffle.cover_image_path) } : null,
      payment_accounts: await accountsResponse.json(),
      receipts: receiptsResponse.ok ? await receiptsResponse.json() : [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
