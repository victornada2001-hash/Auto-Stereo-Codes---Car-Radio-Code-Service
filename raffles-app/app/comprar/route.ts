import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const response = await supabaseRest(
      "/rest/v1/raffles?status=eq.active&select=id&order=created_at.desc&limit=1",
    );

    if (response.ok) {
      const rows = await response.json();
      const raffleId = rows?.[0]?.id;
      if (raffleId) {
        return NextResponse.redirect(new URL(`/rifa/${encodeURIComponent(raffleId)}`, request.url));
      }
    }
  } catch {
    // If the active raffle cannot be resolved, send the customer to the catalog as fallback.
  }

  return NextResponse.redirect(new URL("/sorteos", request.url));
}
