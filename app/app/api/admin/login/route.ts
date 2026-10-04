import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  adminSessionToken,
  validAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = String(body?.password || "");
  } catch {
    return NextResponse.json({ code: "INVALID_INPUT" }, { status: 400 });
  }

  if (!validAdminPassword(password)) {
    return NextResponse.json({ code: "INVALID_LOGIN" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminSessionToken(), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
