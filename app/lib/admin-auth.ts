import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "asc_admin_session";

function digest(value: string) {
  return createHmac("sha256", "asc-admin-compare").update(value).digest();
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function validAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !password) return false;
  return timingSafeEqual(digest(password), digest(expected));
}

export function adminSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update("autostereocodes-admin-session-v1")
    .digest("hex");
}

export function isAdminRequest(request: NextRequest) {
  const actual = request.cookies.get(ADMIN_COOKIE)?.value || "";
  const expected = adminSessionToken();
  if (!actual || !expected || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
