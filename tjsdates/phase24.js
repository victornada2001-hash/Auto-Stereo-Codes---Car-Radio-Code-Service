// Phase 24: notification controls, individual read state, and session freshness.

function injectNotificationPreferencesUI(){
  const page=$('page-notifications');
  if(!page||$('notificationPrefsCard'))return;
  const c=document.createElement('div');
  c.id='notificationPrefsCard';
  c.className='card';
  c.style.marginBottom='14px';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">Preferencias</div><h3 style="margin:7px 0 0">Qué quieres recibir</h3></div><button class="btn ghost" type="button" onclick="loadNotificationPreferences()">Actualizar</button></div>
    <div class="privacygrid">
      <label class="privacytoggle"><input id="npMatches" type="checkbox"><span><b>Nuevos Matches</b><div class="note">Avísame cuando haya un Match nuevo.</div></span></label>
      <label class="privacytoggle"><input id="npMessages" type="checkbox"><span><b>Mensajes nuevos</b><div class="note">Avísame cuando llegue un mensaje.</div></span></label>
      <label class="privacytoggle"><input id="npLikes" type="checkbox"><span><b>Nuevos Likes</b><div class="note">Avísame cuando alguien muestre interés.</div></span></label>
      <label class="privacytoggle"><input id="npSafety" type="checkbox"><span><b>Alertas de seguridad</b><div class="note">Recomendado para mantener tu cuenta segura.</div></span></label>
      <label class="privacytoggle"><input id="npMarketing" type="checkbox"><span><b>Novedades de TJSDATES</b><div class="note">Promociones y novedades opcionales.</div></span></label>
    </div>
    <button id="saveNotificationPrefsBtn" class="btn primary" style="margin-top:14px" type="button" onclick="saveNotificationPreferences()">Guardar preferencias</button><div id="notificationPrefsStatus" class="status"></div>`;
  const head=page.querySelector('.sectionhead');
  if(head?.nextSibling)page.insertBefore(c,head.nextSibling);else page.prepend(c);
}

async function loadNotificationPreferences(){
  if(!session)return;
  injectNotificationPreferencesUI();
  const {data,error}=await sb.rpc('get_my_notification_preferences');
  if(error)return setStatus('notificationPrefsStatus',error.message);
  const p=data?.[0]||{};
  if($('npMatches'))$('npMatches').checked=p.new_matches!==false;
  if($('npMessages'))$('npMessages').checked=p.new_messages!==false;
  if($('npLikes'))$('npLikes').checked=p.new_likes!==false;
  if($('npSafety'))$('npSafety').checked=p.safety_alerts!==false;
  if($('npMarketing'))$('npMarketing').checked=!!p.marketing;
  setStatus('notificationPrefsStatus','');
}

async function saveNotificationPreferences(){
  if(!session)return;
  const btn=$('saveNotificationPrefsBtn');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('update_my_notification_preferences',{
      p_new_matches:!!$('npMatches')?.checked,
      p_new_messages:!!$('npMessages')?.checked,
      p_new_likes:!!$('npLikes')?.checked,
      p_safety_alerts:!!$('npSafety')?.checked,
      p_marketing:!!$('npMarketing')?.checked
    });
    if(error)throw error;
    setStatus('notificationPrefsStatus','Preferencias guardadas.',true);
  }catch(e){setStatus('notificationPrefsStatus',e.message||'No se pudieron guardar las preferencias.');}
  finally{if(btn)btn.disabled=false;}
}

async function markOneNotificationRead(id,card){
  if(!id||!session)return;
  const {data,error}=await sb.rpc('mark_notification_read',{notification_uuid:id});
  if(error)return toast(error.message);
  if(data!==false){card?.classList.remove('unread');await refreshBadges();}
}

const p24LoadNotifications=loadNotifications;
loadNotifications=async function(){
  injectNotificationPreferencesUI();
  await p24LoadNotifications();
  const box=$('notificationsList');if(!box||!session)return;
  const {data,error}=await sb.from('notifications').select('id,read_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(100);
  if(!error){
    const cards=[...box.querySelectorAll('.notification')];
    (data||[]).forEach((n,i)=>{
      const card=cards[i];if(!card)return;
      card.tabIndex=0;
      card.setAttribute('role','button');
      card.setAttribute('aria-label',n.read_at?'Notificación leída':'Marcar notificación como leída');
      const run=()=>{if(!n.read_at&&card.classList.contains('unread'))markOneNotificationRead(n.id,card)};
      card.onclick=run;
      card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}};
    });
  }
  await loadNotificationPreferences();
};

let tjSessionRefreshBusy=false;
async function ensureFreshSession(){
  if(tjSessionRefreshBusy)return true;
  tjSessionRefreshBusy=true;
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(!data.session){session=null;showLanding();return false;}
    session=data.session;
    const expiresAt=Number(session.expires_at||0)*1000;
    if(expiresAt&&expiresAt-Date.now()<5*60*1000){
      const r=await sb.auth.refreshSession();
      if(r.error)throw r.error;
      session=r.data.session||session;
    }
    return true;
  }catch(e){
    console.error('TJSDATES session refresh error',e);
    if(navigator.onLine)toast('Tu sesión necesita volver a validarse.');
    return false;
  }finally{tjSessionRefreshBusy=false;}
}

window.addEventListener('online',()=>{if(session)setTimeout(ensureFreshSession,150)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&session)setTimeout(ensureFreshSession,100)});

const p24Go=go;
go=function(page){
  p24Go(page);
  if(page==='notifications')setTimeout(()=>{injectNotificationPreferencesUI();loadNotificationPreferences();},70);
};

setTimeout(()=>{injectNotificationPreferencesUI();if(session&&!$('page-notifications')?.classList.contains('hidden'))loadNotificationPreferences();},700);
