import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseConfig, parseSupabaseError, supabaseRest } from "@/lib/supabase-server";

function authorized(request: NextRequest) {
  const expected = process.env.RAFFLES_ADMIN_KEY;
  const received = request.headers.get("x-admin-key");
  return Boolean(expected && received && received === expected);
}

function imageUrl(path?: string | null) {
  if (!path) return null;
  const { supabaseUrl } = assertSupabaseConfig();
  return `${supabaseUrl}/storage/v1/object/public/raffle-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function slugify(value: string) {
  const base = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "rifa";
  return `${base}-${Date.now().toString(36)}`;
}

const selectFields = "id,slug,title,description,prize,ticket_price,total_tickets,status,edition,cover_image_path,draw_date,discounts,started_at,paused_at,finalized_at,winner_ticket,winner_name,winner_draw_reference,winner_evidence_url,created_at,updated_at";

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const response = await supabaseRest(`/rest/v1/raffles?select=${selectFields}&order=created_at.desc`);
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 500 });
    const rows = await response.json();
    return NextResponse.json(rows.map((row: Record<string, unknown>) => ({ ...row, cover_image_url: imageUrl(row.cover_image_path as string | null) })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const prize = String(body?.prize || "").trim();
    const edition = String(body?.edition || "").trim();
    const ticketPrice = Number(body?.ticket_price);
    const totalTickets = Number(body?.total_tickets);
    const drawDate = body?.draw_date ? new Date(body.draw_date).toISOString() : null;
    const discounts = Array.isArray(body?.discounts) ? body.discounts : [];

    if (title.length < 3 || !Number.isFinite(ticketPrice) || ticketPrice <= 0 || !Number.isInteger(totalTickets) || totalTickets < 1 || totalTickets > 100000) {
      return NextResponse.json({ error: "Revisa título, precio y emisión (1 a 100,000 boletos)." }, { status: 400 });
    }

    const response = await supabaseRest("/rest/v1/raffles", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        slug: slugify(title),
        title,
        description: description || null,
        prize: prize || null,
        edition: edition || null,
        ticket_price: ticketPrice,
        total_tickets: totalTickets,
        draw_date: drawDate,
        discounts,
        status: "draft",
      }),
    });
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
    return NextResponse.json({ raffle: (await response.json())?.[0] || null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body?.id || "");
    const action = String(body?.action || "update");
    if (!id) return NextResponse.json({ error: "Falta la rifa." }, { status: 400 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (action === "activate") {
      patch.status = "active";
      patch.started_at = new Date().toISOString();
      patch.paused_at = null;
    } else if (action === "pause") {
      patch.status = "paused";
      patch.paused_at = new Date().toISOString();
    } else if (action === "finalize") {
      patch.status = "completed";
      patch.finalized_at = new Date().toISOString();
      if (body?.winner_ticket !== undefined && body?.winner_ticket !== null && body?.winner_ticket !== "") patch.winner_ticket = Number(body.winner_ticket);
      if (body?.winner_name !== undefined) patch.winner_name = String(body.winner_name || "").trim() || null;
      if (body?.winner_draw_reference !== undefined) patch.winner_draw_reference = String(body.winner_draw_reference || "").trim() || null;
      if (body?.winner_evidence_url !== undefined) patch.winner_evidence_url = String(body.winner_evidence_url || "").trim() || null;
    } else {
      const allowedText = ["title", "description", "prize", "edition", "winner_name", "winner_draw_reference", "winner_evidence_url"];
      for (const field of allowedText) if (body[field] !== undefined) patch[field] = String(body[field] || "").trim() || null;
      if (body.ticket_price !== undefined) {
        const price = Number(body.ticket_price);
        if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Precio inválido." }, { status: 400 });
        patch.ticket_price = price;
      }
      if (body.total_tickets !== undefined) {
        const total = Number(body.total_tickets);
        if (!Number.isInteger(total) || total < 1 || total > 100000) return NextResponse.json({ error: "Emisión inválida." }, { status: 400 });
        const maxTicketResponse = await supabaseRest(`/rest/v1/raffle_tickets?raffle_id=eq.${encodeURIComponent(id)}&select=ticket_number&order=ticket_number.desc&limit=1`);
        if (maxTicketResponse.ok) {
          const maxTicket = Number((await maxTicketResponse.json())?.[0]?.ticket_number || 0);
          if (maxTicket > total) return NextResponse.json({ error: `No puedes bajar la emisión a ${total}; ya existe historial del boleto ${maxTicket}.` }, { status: 400 });
        }
        patch.total_tickets = total;
      }
      if (body.draw_date !== undefined) patch.draw_date = body.draw_date ? new Date(body.draw_date).toISOString() : null;
      if (body.discounts !== undefined) patch.discounts = Array.isArray(body.discounts) ? body.discounts : [];
      if (body.winner_ticket !== undefined) patch.winner_ticket = body.winner_ticket === "" || body.winner_ticket === null ? null : Number(body.winner_ticket);
    }

    const response = await supabaseRest(`/rest/v1/raffles?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return NextResponse.json({ error: await parseSupabaseError(response) }, { status: 400 });
    const raffle = (await response.json())?.[0] || null;
    return NextResponse.json({ ok: true, raffle: raffle ? { ...raffle, cover_image_url: imageUrl(raffle.cover_image_path) } : null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
