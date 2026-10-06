import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyKey;
  if (!url || !apiKey) throw new Error("SUPABASE_NOT_CONFIGURED");
  const headers: Record<string, string> = { apikey: apiKey, "Content-Type": "application/json" };
  if (!secretKey && legacyKey) headers.Authorization = `Bearer ${legacyKey}`;
  return { url: url.replace(/\/$/, ""), headers };
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  try {
    const { url, headers } = supabaseConfig();
    const endpoint = new URL(`${url}/rest/v1/code_requests`);
    endpoint.searchParams.set("select","id,reference,serial,year,brand,model,phone,email,vin,postal_code,language,status,created_at,priority_sms,payment_status,payment_provider,amount_total,currency,paid_at,paypal_order_id,paypal_capture_id,stereo_code,code_updated_at");
    endpoint.searchParams.set("payment_status", "eq.paid");
    endpoint.searchParams.set("order", "created_at.desc");
    endpoint.searchParams.set("limit", "250");
    const response = await fetch(endpoint, { headers, cache: "no-store" });
    if (!response.ok) { console.error("Admin requests fetch failed", response.status, await response.text()); return NextResponse.json({ code: "LOAD_FAILED" }, { status: 502 }); }
    return NextResponse.json({ requests: await response.json() });
  } catch (error) {
    console.error("Admin requests error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ code: "LOAD_FAILED" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  let id:number; let status:string;
  try { const body=await request.json(); id=Number(body?.id); status=String(body?.status||""); }
  catch { return NextResponse.json({ code:"INVALID_INPUT" },{status:400}); }
  const allowed=new Set(["new","processing","completed"]);
  if(!Number.isInteger(id)||id<=0||!allowed.has(status)) return NextResponse.json({code:"INVALID_INPUT"},{status:400});
  try {
    const {url,headers}=supabaseConfig();
    const response=await fetch(`${url}/rest/v1/rpc/admin_update_code_request_status`,{method:"POST",headers,body:JSON.stringify({p_id:id,p_status:status}),cache:"no-store"});
    if(!response.ok){console.error("Admin status RPC failed",response.status,await response.text());return NextResponse.json({code:"UPDATE_FAILED"},{status:502});}
    const rows=await response.json();
    if(!Array.isArray(rows)||rows.length===0)return NextResponse.json({code:"NOT_FOUND"},{status:404});
    return NextResponse.json({ok:true,id:rows[0].id,status:rows[0].status});
  }catch(error){console.error("Admin update error",error instanceof Error?error.message:"unknown");return NextResponse.json({code:"UPDATE_FAILED"},{status:500});}
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  let id:number;let stereoCode:string;
  try{const body=await request.json();id=Number(body?.id);stereoCode=String(body?.stereoCode??"").trim();}
  catch{return NextResponse.json({code:"INVALID_INPUT"},{status:400});}
  if(!Number.isInteger(id)||id<=0||stereoCode.length>100)return NextResponse.json({code:"INVALID_INPUT"},{status:400});
  try{
    const {url,headers}=supabaseConfig();
    const response=await fetch(`${url}/rest/v1/rpc/admin_update_code_request_code`,{method:"POST",headers,body:JSON.stringify({p_id:id,p_code:stereoCode}),cache:"no-store"});
    if(!response.ok){console.error("Admin code RPC failed",response.status,await response.text());return NextResponse.json({code:"UPDATE_FAILED"},{status:502});}
    const rows=await response.json();if(!Array.isArray(rows)||rows.length===0)return NextResponse.json({code:"NOT_FOUND"},{status:404});
    return NextResponse.json({ok:true,id:rows[0].id,stereoCode:rows[0].stereo_code,codeUpdatedAt:rows[0].code_updated_at});
  }catch(error){console.error("Admin code update error",error instanceof Error?error.message:"unknown");return NextResponse.json({code:"UPDATE_FAILED"},{status:500});}
}
