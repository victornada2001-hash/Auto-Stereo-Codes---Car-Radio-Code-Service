import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}

function safeFilename(value?: string | null) {
  return String(value || "comprobante").replace(/[\r\n"]/g, "_").slice(0, 180) || "comprobante";
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const receiptId = String(request.nextUrl.searchParams.get("receiptId") || "").trim();
    const reservationIdParam = String(request.nextUrl.searchParams.get("reservationId") || "").trim();
    const folio = String(request.nextUrl.searchParams.get("folio") || "").trim();

    let reservationId = reservationIdParam;
    if (!reservationId && folio) {
      const reservationResponse = await supabaseRest(`/rest/v1/raffle_reservations?folio=eq.${encodeURIComponent(folio)}&select=id&limit=1`);
      if (!reservationResponse.ok) return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
      reservationId = String((await reservationResponse.json())?.[0]?.id || "");
    }

    if (!receiptId && !reservationId) return NextResponse.json({ error: "Falta la referencia del comprobante." }, { status: 400 });

    const receiptQuery = receiptId
      ? `/rest/v1/raffle_receipts?id=eq.${encodeURIComponent(receiptId)}&select=id,reservation_id,storage_path,original_filename,mime_type,created_at&limit=1`
      : `/rest/v1/raffle_receipts?reservation_id=eq.${encodeURIComponent(reservationId)}&select=id,reservation_id,storage_path,original_filename,mime_type,created_at&order=created_at.desc&limit=1`;

    const receiptResponse = await supabaseRest(receiptQuery);
    if (!receiptResponse.ok) return NextResponse.json({ error: await parseSupabaseError(receiptResponse) }, { status: 500 });

    const receipt = (await receiptResponse.json())?.[0];
    if (!receipt?.storage_path) return NextResponse.json({ error: "Esta reserva todavía no tiene comprobante." }, { status: 404 });

    const encodedPath = encodeURIComponent(String(receipt.storage_path)).replace(/%2F/g, "/");
    const fileResponse = await supabaseRest(`/storage/v1/object/authenticated/raffle-receipts/${encodedPath}`);
    if (!fileResponse.ok) return NextResponse.json({ error: await parseSupabaseError(fileResponse) }, { status: fileResponse.status || 500 });

    const mimeType = String(receipt.mime_type || fileResponse.headers.get("content-type") || "application/octet-stream");
    const filename = safeFilename(receipt.original_filename);
    const bytes = await fileResponse.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
