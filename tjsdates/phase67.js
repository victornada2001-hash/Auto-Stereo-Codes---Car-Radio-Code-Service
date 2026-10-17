// Phase 67: notification preferences through secure RPCs instead of direct table writes.
function p67Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{saved:'Notification preferences saved.',load:'Could not load notification preferences.',save:'Could not save notification preferences.'}:{saved:'Preferencias de notificaciones guardadas.',load:'No se pudieron cargar las preferencias de notificaciones.',save:'No se pudieron guardar las preferencias de notificaciones.'};
}

loadNotificationPreferences=async function(){
  if(!session)return;
  const {data,error}=await sb.rpc('get_my_notification_preferences');
  if(error){
    console.warn('TJSDATES notification preferences load failed',error);
    if(typeof setStatus==='function')setStatus('notifPrefStatus',p67Copy().load);
    return;
  }
  const p=Array.isArray(data)?(data[0]||{}):(data||{});
  const defaults={new_matches:true,new_messages:true,new_likes:true,safety_alerts:true,marketing:false};
  const v={...defaults,...p};
  if($('npMatches'))$('npMatches').checked=!!v.new_matches;
  if($('npMessages'))$('npMessages').checked=!!v.new_messages;
  if($('npLikes'))$('npLikes').checked=!!v.new_likes;
  if($('npSafety'))$('npSafety').checked=!!v.safety_alerts;
  if($('npMarketing'))$('npMarketing').checked=!!v.marketing;
  if(typeof setStatus==='function')setStatus('notifPrefStatus','');
};

saveNotificationPreferences=async function(){
  if(!session)return;
  const btn=document.querySelector('#notifPrefsCard button[onclick="saveNotificationPreferences()"]');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('update_my_notification_preferences',{
      p_new_matches:!!$('npMatches')?.checked,
      p_new_messages:!!$('npMessages')?.checked,
      p_new_likes:!!$('npLikes')?.checked,
      p_safety_alerts:!!$('npSafety')?.checked,
      p_marketing:!!$('npMarketing')?.checked
    });
    if(error)throw error;
    setStatus('notifPrefStatus',p67Copy().saved,true);
  }catch(e){
    setStatus('notifPrefStatus',e?.message||p67Copy().save);
  }finally{
    if(btn)btn.disabled=false;
  }
};

// Refresh the visible controls after language/page wrappers have finished rendering.
const p67Go=typeof go==='function'?go:null;
if(p67Go)go=function(page){
  const r=p67Go(page);
  if(page==='notifications')setTimeout(()=>loadNotificationPreferences(),100);
  return r;
};

setTimeout(()=>{if(session&&$('notifPrefsCard'))loadNotificationPreferences()},900);
window.__TJSDATES_NOTIFICATION_PREFS_RPC_READY=true;
