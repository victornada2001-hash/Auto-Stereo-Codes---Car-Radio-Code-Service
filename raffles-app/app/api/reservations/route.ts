import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function normalizeMexPhone(value: unknown) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raffleId = String(body?.raffleId || "");
    const name = String(body?.name || "").trim();
    const phone = normalizeMexPhone(body?.phone);
    const email = String(body?.email || "").trim();
    const tickets = Array.isArray(body?.tickets) ? body.tickets.map((n: unknown) => Number(n)).filter(Number.isInteger) : [];

    if (!raffleId || name.length < 2 || !tickets.length) {
      return NextResponse.json({ error: "Completa nombre, teléfono y boletos." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "El WhatsApp debe tener 10 dígitos válidos." }, { status: 400 });
    }

    const response = await supabaseRest("/rest/v1/rpc/reserve_raffle_tickets", {
      method: "POST",
      body: JSON.stringify({
        p_raffle_id: raffleId,
        p_customer_name: name,
        p_customer_phone: phone,
        p_customer_email: email || null,
        p_ticket_numbers: tickets,
      }),
    });

    if (!response.ok) {
      const error = await parseSupabaseError(response);
      const conflict = /apartados|unique|duplicate/i.test(error);
      return NextResponse.json({ error }, { status: conflict ? 409 : 400 });
    }

    return NextResponse.json(await response.json(), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
