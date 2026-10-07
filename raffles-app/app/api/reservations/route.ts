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
    const phone = normalizeMexPhone(body?.phone);
    const tickets = Array.isArray(body?.tickets) ? body.tickets.map((n: unknown) => Number(n)).filter(Number.isInteger) : [];
    let firstName = String(body?.firstName || "").trim();
    let lastName = String(body?.lastName || "").trim();
    let customerState = String(body?.customerState || "").trim();

    if (!raffleId || !tickets.length) {
      return NextResponse.json({ error: "Selecciona boletos antes de apartar." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "El WhatsApp debe tener 10 dígitos válidos." }, { status: 400 });
    }

    if (firstName.length < 2 || lastName.length < 2 || customerState.length < 2) {
      const customerResponse = await supabaseRest(`/rest/v1/raffle_customers?phone=eq.${encodeURIComponent(phone)}&select=first_name,last_name,location&limit=1`);
      if (customerResponse.ok) {
        const existing = (await customerResponse.json())?.[0];
        if (existing) {
          if (firstName.length < 2) firstName = String(existing.first_name || "").trim();
          if (lastName.length < 2) lastName = String(existing.last_name || "").trim();
          if (customerState.length < 2) customerState = String(existing.location || "").trim();
        }
      }
    }

    if (firstName.length < 2 || lastName.length < 2 || customerState.length < 2) {
      return NextResponse.json({ error: "Completa nombre, apellidos y estado o país." }, { status: 400 });
    }

    const response = await supabaseRest("/rest/v1/rpc/reserve_raffle_tickets_v2", {
      method: "POST",
      body: JSON.stringify({
        p_raffle_id: raffleId,
        p_first_name: firstName,
        p_last_name: lastName,
        p_customer_phone: phone,
        p_customer_state: customerState,
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
