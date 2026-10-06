import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raffleId = String(body?.raffleId || "");
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = String(body?.email || "").trim();
    const tickets = Array.isArray(body?.tickets) ? body.tickets.map((n: unknown) => Number(n)).filter(Number.isInteger) : [];

    if (!raffleId || name.length < 2 || phone.length < 8 || !tickets.length) {
      return NextResponse.json({ error: "Completa nombre, teléfono y boletos." }, { status: 400 });
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
