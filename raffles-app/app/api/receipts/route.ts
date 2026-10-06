import { NextRequest, NextResponse } from "next/server";
import { parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const reservationId = String(form.get("reservationId") || "");
    const folio = String(form.get("folio") || "");
    const file = form.get("file");

    if (!reservationId || !folio || !(file instanceof File)) {
      return NextResponse.json({ error: "Faltan datos del comprobante." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede 10 MB." }, { status: 400 });
    }
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: "Formato no permitido." }, { status: 400 });
    }

    const verify = await supabaseRest(`/rest/v1/raffle_reservations?id=eq.${encodeURIComponent(reservationId)}&folio=eq.${encodeURIComponent(folio)}&select=id&limit=1`);
    if (!verify.ok) return NextResponse.json({ error: await parseSupabaseError(verify) }, { status: 500 });
    const rows = await verify.json();
    if (!rows?.length) return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "comprobante";
    const storagePath = `${reservationId}/${Date.now()}-${safeName}`;
    const upload = await supabaseRest(`/storage/v1/object/raffle-receipts/${encodeURIComponent(storagePath).replace(/%2F/g, "/")}`, {
      method: "POST",
      headers: { "Content-Type": file.type, "x-upsert": "false" },
      body: await file.arrayBuffer(),
    });
    if (!upload.ok) return NextResponse.json({ error: await parseSupabaseError(upload) }, { status: 500 });

    const receipt = await supabaseRest("/rest/v1/raffle_receipts", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        reservation_id: reservationId,
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type,
        ai_status: "pending",
      }),
    });
    if (!receipt.ok) return NextResponse.json({ error: await parseSupabaseError(receipt) }, { status: 500 });

    const statusUpdate = await supabaseRest(`/rest/v1/raffle_reservations?id=eq.${encodeURIComponent(reservationId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "receipt_uploaded", updated_at: new Date().toISOString() }),
    });
    if (!statusUpdate.ok) return NextResponse.json({ error: await parseSupabaseError(statusUpdate) }, { status: 500 });

    const inserted = await receipt.json();
    return NextResponse.json({ ok: true, receipt: inserted?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
