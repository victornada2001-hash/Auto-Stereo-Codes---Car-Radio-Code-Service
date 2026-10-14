import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

Deno.serve(async(req:Request)=>{
  if(req.method!=="POST")return new Response("Method not allowed",{status:405});
  const supplied=req.headers.get("x-tjs-cron-secret")||"";
  if(!supplied)return new Response("Unauthorized",{status:401});
  const verified=await supabase.rpc("verify_internal_cron_secret",{p_name:"send-web-push",p_secret:supplied});
  if(verified.error||verified.data!==true)return new Response("Unauthorized",{status:401});

  let body:any={};
  try{body=await req.json()}catch(_e){}
  const notificationId=String(body.notification_id||"");
  if(!notificationId)return Response.json({ok:false,error:"missing_notification_id"},{status:400});

  const cfg=await supabase.rpc("get_web_push_server_config");
  if(cfg.error||!cfg.data?.[0])return Response.json({ok:false,error:"push_config_unavailable"},{status:500});
  const c=cfg.data[0];
  webpush.setVapidDetails(c.subject,c.public_key,c.private_key);

  const n=await supabase.from("notifications").select("id,user_id,type,title,body,data").eq("id",notificationId).maybeSingle();
  if(n.error||!n.data)return Response.json({ok:false,error:"notification_not_found"},{status:404});

  const prefs=await supabase.from("notification_preferences").select("new_matches,new_messages,new_likes,safety_alerts,marketing").eq("user_id",n.data.user_id).maybeSingle();
  const p=prefs.data||{};
  const allowed=n.data.type==='match'?p.new_matches!==false:
    n.data.type==='message'?p.new_messages!==false:
    n.data.type==='like'?p.new_likes!==false:
    n.data.type==='safety'?p.safety_alerts!==false:
    n.data.type==='marketing'?p.marketing===true:true;
  if(!allowed)return Response.json({ok:true,skipped:"preference"});

  const tokens=await supabase.from("device_tokens").select("id,token").eq("user_id",n.data.user_id).eq("platform","web").eq("enabled",true);
  if(tokens.error)return Response.json({ok:false,error:"tokens_unavailable"},{status:500});

  const payload=JSON.stringify({title:n.data.title||"TJSDATES",body:n.data.body||"Tienes una nueva actividad.",type:n.data.type,data:n.data.data||{},notification_id:n.data.id});
  let sent=0,failed=0,gone=0;
  for(const t of tokens.data||[]){
    let subscription:any;
    try{subscription=JSON.parse(t.token)}catch(_e){
      failed++;
      await supabase.from("web_push_deliveries").upsert({notification_id:n.data.id,device_token_id:t.id,status:"failed",attempts:1,last_attempt_at:new Date().toISOString(),last_error:"invalid_subscription_json"});
      continue;
    }
    try{
      await webpush.sendNotification(subscription,payload,{TTL:3600,urgency:n.data.type==='message'?'high':'normal'} as any);
      sent++;
      await supabase.from("web_push_deliveries").upsert({notification_id:n.data.id,device_token_id:t.id,status:"sent",attempts:1,last_attempt_at:new Date().toISOString(),last_error:null});
    }catch(e:any){
      const status=Number(e?.statusCode||0);const isGone=status===404||status===410;
      if(isGone){gone++;await supabase.from("device_tokens").update({enabled:false,updated_at:new Date().toISOString()}).eq("id",t.id)}else failed++;
      await supabase.from("web_push_deliveries").upsert({notification_id:n.data.id,device_token_id:t.id,status:isGone?"gone":"failed",attempts:1,last_attempt_at:new Date().toISOString(),last_error:String(e?.message||e).slice(0,1000)});
    }
  }
  return Response.json({ok:true,devices:(tokens.data||[]).length,sent,failed,gone});
});
