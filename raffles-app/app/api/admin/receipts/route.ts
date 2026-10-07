import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}

function safeFilename(value?: string | null) {
  return String(value || "comprobante")
    .replace(/[\r\n"]/g, "_")
    .slice(0, 180) || "comprobante";
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const folio = String(request.nextUrl.searchParams.get("folio") || "").trim();
    if (!folio) {
      return NextResponse.json({ error: "Falta el folio de la solicitud." }, { status: 400 });
    }

    const reservationResponse = await supabaseRest(
      `/rest/v1/raffle_reservations?folio=eq.${encodeURIComponent(folio)}&select=id&limit=1`,
    );
    if (!reservationResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(reservationResponse) }, { status: 500 });
    }

    const reservations = await reservationResponse.json();
    const reservationId = reservations?.[0]?.id;
    if (!reservationId) {
      return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
    }

    const receiptResponse = await supabaseRest(
      `/rest/v1/raffle_receipts?reservation_id=eq.${encodeURIComponent(reservationId)}&select=id,storage_path,original_filename,mime_type,created_at&order=created_at.desc&limit=1`,
    );
    if (!receiptResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(receiptResponse) }, { status: 500 });
    }

    const receipts = await receiptResponse.json();
    const receipt = receipts?.[0];
    if (!receipt?.storage_path) {
      return NextResponse.json({ error: "Esta solicitud todavía no tiene comprobante." }, { status: 404 });
    }

    const encodedPath = encodeURIComponent(String(receipt.storage_path)).replace(/%2F/g, "/");
    const fileResponse = await supabaseRest(`/storage/v1/object/raffle-receipts/${encodedPath}`);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: await parseSupabaseError(fileResponse) }, { status: fileResponse.status || 500 });
    }

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}
