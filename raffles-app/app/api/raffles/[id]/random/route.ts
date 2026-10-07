import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const quantity = Math.max(1, Math.min(Number(body?.quantity || 1), 10000));

    const response = await supabaseRest("/rest/v1/rpc/random_available_raffle_tickets", {
      method: "POST",
      body: JSON.stringify({ p_raffle_id: id, p_quantity: quantity }),
    });
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });

    return NextResponse.json({ tickets: await response.json() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
