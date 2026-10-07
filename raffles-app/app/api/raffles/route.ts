import { NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function publicImageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function GET() {
  try {
    const [rafflesResponse, settingsResponse] = await Promise.all([
      supabaseRest("/rest/v1/raffles?status=in.(active,paused,completed)&select=id,slug,title,description,prize,ticket_price,total_tickets,status,edition,cover_image_path,draw_date,discounts,started_at,paused_at,finalized_at,winner_ticket,winner_name,winner_draw_reference,winner_evidence_url,created_at&order=created_at.desc"),
      supabaseRest("/rest/v1/raffle_site_settings?id=eq.1&select=brand_name,whatsapp_number,facebook_url,instagram_url,winner_method&limit=1"),
    ]);

    if (!rafflesResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(rafflesResponse) }, { status: 500 });
    }
    if (!settingsResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(settingsResponse) }, { status: 500 });
    }

    const raffles = (await rafflesResponse.json()).map((raffle: Record<string, unknown>) => ({
      ...raffle,
      cover_image_url: publicImageUrl(raffle.cover_image_path as string | null),
    }));
    const settings = (await settingsResponse.json())?.[0] || null;

    return NextResponse.json({ raffles, settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
