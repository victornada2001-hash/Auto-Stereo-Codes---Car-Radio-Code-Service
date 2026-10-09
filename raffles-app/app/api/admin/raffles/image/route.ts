import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}

function publicImageUrl(path: string) {
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await request.formData();
    const raffleId = String(form.get("raffleId") || "");
    const file = form.get("file");
    const makeCover = String(form.get("makeCover") || "true") !== "false";
    if (!raffleId || !(file instanceof File)) return NextResponse.json({ error: "Falta la imagen o la rifa." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "La imagen excede 10 MB." }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Usa JPG, PNG o WebP." }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${raffleId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const upload = await supabaseRest(`/storage/v1/object/raffle-images/${path}`, {
      method: "POST",
      headers: { "Content-Type": file.type, "x-upsert": "false" },
      body: await file.arrayBuffer(),
    });
    if (!upload.ok) return NextResponse.json({ error: await parseSupabaseError(upload) }, { status: 500 });

    const gallery = await supabaseRest("/rest/v1/raffle_images", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ raffle_id: raffleId, storage_path: path, active: true }),
    });
    if (!gallery.ok) return NextResponse.json({ error: await parseSupabaseError(gallery) }, { status: 500 });

    if (makeCover) {
      const update = await supabaseRest(`/rest/v1/raffles?id=eq.${encodeURIComponent(raffleId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ cover_image_path: path, updated_at: new Date().toISOString() }),
      });
      if (!update.ok) return NextResponse.json({ error: await parseSupabaseError(update) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, path, url: publicImageUrl(path), image: (await gallery.json())?.[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
