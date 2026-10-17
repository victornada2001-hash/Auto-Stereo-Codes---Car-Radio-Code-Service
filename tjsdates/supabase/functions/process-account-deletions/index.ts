import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function chunks<T>(items:T[], size=1000){
  const out:T[][]=[];
  for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));
  return out;
}

async function removePaths(bucket:string, paths:string[]){
  const unique=[...new Set(paths.filter(Boolean))];
  for(const batch of chunks(unique,1000)){
    const { error } = await supabase.storage.from(bucket).remove(batch);
    if(error) throw new Error(`${bucket}: ${error.message}`);
  }
}

async function cleanupUserStorage(userId:string){
  const { data: photos, error: photoErr } = await supabase
    .from("profile_photos").select("storage_path").eq("user_id",userId);
  if(photoErr) throw photoErr;

  const { data: reports, error: reportErr } = await supabase
    .from("reports").select("id").eq("reporter_id",userId);
  if(reportErr) throw reportErr;
  const reportIds=(reports||[]).map((r:any)=>r.id);
  let evidence:any[]=[];
  if(reportIds.length){
    const r=await supabase.from("report_evidence").select("storage_path").in("report_id",reportIds);
    if(r.error) throw r.error;
    evidence=r.data||[];
  }

  const { data: media, error: mediaErr } = await supabase
    .from("messages").select("attachment_path").eq("sender_id",userId).not("attachment_path","is",null);
  if(mediaErr) throw mediaErr;

  await removePaths("profile-photos",(photos||[]).map((r:any)=>r.storage_path));
  await removePaths("report-evidence",evidence.map((r:any)=>r.storage_path));
  await removePaths("chat-media",(media||[]).map((r:any)=>r.attachment_path));
}

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return new Response("Method not allowed",{status:405});
  const supplied=req.headers.get("x-tjs-cron-secret")||"";
  if(!supplied) return new Response("Unauthorized",{status:401});

  const verify=await supabase.rpc("verify_internal_cron_secret",{
    p_name:"process-account-deletions",
    p_secret:supplied
  });
  if(verify.error || verify.data!==true) return new Response("Unauthorized",{status:401});

  const now=new Date().toISOString();
  const { data: due, error } = await supabase
    .from("account_deletion_requests")
    .select("user_id,attempt_count")
    .eq("status","pending")
    .lte("scheduled_for",now)
    .order("scheduled_for",{ascending:true})
    .limit(25);
  if(error) return Response.json({ok:false,error:"queue_read_failed"},{status:500});

  let deleted=0, failed=0;
  for(const row of due||[]){
    const userId=row.user_id as string;
    try{
      await supabase.from("account_deletion_requests").update({
        attempt_count:Number(row.attempt_count||0)+1,
        last_attempt_at:new Date().toISOString(),
        last_error:null
      }).eq("user_id",userId);

      await cleanupUserStorage(userId);
      const del=await supabase.auth.admin.deleteUser(userId,false);
      if(del.error) throw del.error;
      deleted++;
    }catch(e){
      failed++;
      const message=e instanceof Error?e.message:String(e);
      await supabase.from("account_deletion_requests").update({
        attempt_count:Number(row.attempt_count||0)+1,
        last_attempt_at:new Date().toISOString(),
        last_error:message.slice(0,1000)
      }).eq("user_id",userId);
      console.error("TJSDATES account deletion failed",userId,message);
    }
  }

  return Response.json({ok:true,checked:(due||[]).length,deleted,failed});
});
