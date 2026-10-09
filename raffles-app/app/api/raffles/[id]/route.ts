import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function publicImageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const [raffleResponse, settingsResponse, accountsResponse, imagesResponse] = await Promise.all([
      supabaseRest(`/rest/v1/raffles?id=eq.${encodeURIComponent(id)}&select=id,slug,title,description,prize,prize_description,conditions_text,price_details,ticket_price,total_tickets,status,edition,cover_image_path,draw_date,discounts,winner_ticket,winner_name,winner_draw_reference,winner_evidence_url&limit=1`),
      supabaseRest("/rest/v1/raffle_site_settings?id=eq.1&select=brand_name,whatsapp_number,facebook_url,instagram_url,winner_method&limit=1"),
      supabaseRest("/rest/v1/raffle_payment_accounts?active=eq.true&select=id,label,bank_name,beneficiary_name,account_number,clabe,logo_url,instructions,sort_order&order=sort_order.asc,created_at.asc"),
      supabaseRest(`/rest/v1/raffle_images?raffle_id=eq.${encodeURIComponent(id)}&active=eq.true&select=id,storage_path,sort_order,created_at&order=sort_order.asc,created_at.asc`),
    ]);

    if (!raffleResponse.ok) return NextResponse.json({ error: await parseSupabaseError(raffleResponse) }, { status: 500 });
    if (!settingsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(settingsResponse) }, { status: 500 });
    if (!accountsResponse.ok) return NextResponse.json({ error: await parseSupabaseError(accountsResponse) }, { status: 500 });
    if (!imagesResponse.ok) return NextResponse.json({ error: await parseSupabaseError(imagesResponse) }, { status: 500 });

    const raffle = (await raffleResponse.json())?.[0];
    if (!raffle) return NextResponse.json({ error: "Rifa no encontrada." }, { status: 404 });
    const cover = publicImageUrl(raffle.cover_image_path);
    const images = (await imagesResponse.json()).map((image: {storage_path:string})=>publicImageUrl(image.storage_path)).filter(Boolean);

    return NextResponse.json({
      raffle: { ...raffle, cover_image_url: cover, image_urls: images.length ? images : (cover ? [cover] : []) },
      settings: (await settingsResponse.json())?.[0] || null,
      payment_accounts: await accountsResponse.json(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
