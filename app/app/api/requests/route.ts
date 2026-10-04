import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      code: "PAYMENT_REQUIRED",
      message: "Requests are created only after a successful payment.",
    },
    { status: 410 },
  );
}
