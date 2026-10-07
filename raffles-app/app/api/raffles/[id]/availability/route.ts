import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const from = Math.max(1, Number(url.searchParams.get("from") || 1));
    const to = Math.max(from, Math.min(Number(url.searchParams.get("to") || from + 99), from + 499));

    const response = await supabaseRest(`/rest/v1/raffle_tickets?raffle_id=eq.${encodeURIComponent(id)}&released_at=is.null&ticket_number=gte.${from}&ticket_number=lte.${to}&select=ticket_number`);
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });

    const rows = await response.json();
    return NextResponse.json({ unavailable: rows.map((row: { ticket_number: number }) => row.ticket_number) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
