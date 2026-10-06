import { NextRequest, NextResponse } from "next/server";

const blockedLaunchBrands = new Set(["mercedes", "chrysler", "dodge", "jeep", "nissan"]);

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/radio-codes\/([^/]+)(?:\/|$)/);
  if (match && blockedLaunchBrands.has(match[1])) {
    return NextResponse.redirect(new URL("/radio-codes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/radio-codes/:path*"],
};
