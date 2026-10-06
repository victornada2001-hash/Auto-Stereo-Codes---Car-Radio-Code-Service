import { NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

export async function GET() {
  try {
    const response = await supabaseRest("/rest/v1/raffles?status=eq.active&select=id,title,description,prize,ticket_price,total_tickets,whatsapp_number,bank_name,beneficiary_name,bank_account,clabe&order=created_at.desc&limit=1");
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });
    const rows = await response.json();
    if (!rows?.length) return NextResponse.json({ error: "No hay una rifa activa." }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
