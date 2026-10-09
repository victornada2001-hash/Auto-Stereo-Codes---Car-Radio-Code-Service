import { NextRequest, NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase-server";

function normalizePhone(value: string | null) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  return digits;
}

export async function GET(request: NextRequest) {
  const phone = normalizePhone(request.nextUrl.searchParams.get("phone"));
  if (!/^\d{10}$/.test(phone)) return NextResponse.json({ known: false });

  const response = await supabaseRest(
    `/rest/v1/raffle_customers?phone=eq.${encodeURIComponent(phone)}&select=id,first_name,last_name,location&limit=1`,
  );
  if (!response.ok) return NextResponse.json({ known: false });

  const customer = (await response.json())?.[0];
  if (!customer) return NextResponse.json({ known: false });

  return NextResponse.json({
    known: true,
    customer: {
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      location: customer.location || "",
    },
  });
}
