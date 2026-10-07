import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function normalizePhone(value: unknown) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const folio = String(body?.folio || "").trim().toUpperCase();
    const phone = normalizePhone(body?.phone);

    if (!folio || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Escribe tu folio y el teléfono de 10 dígitos usado al apartar." }, { status: 400 });
    }

    const response = await supabaseRest(
      `/rest/v1/raffle_reservations?folio=eq.${encodeURIComponent(folio)}&customer_phone=eq.${encodeURIComponent(phone)}&select=folio,access_token,status&limit=1`,
    );
    if (!response.ok) {
      return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });
    }

    const reservation = (await response.json())?.[0];
    if (!reservation?.folio || !reservation?.access_token) {
      return NextResponse.json({ error: "No encontramos una reserva con ese folio y teléfono." }, { status: 404 });
    }

    return NextResponse.json({
      folio: reservation.folio,
      access_token: reservation.access_token,
      status: reservation.status,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
