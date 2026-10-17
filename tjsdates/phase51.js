// Phase 51: safety check-in reminder controls and Web Push readiness.

function safety51Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    badge:'Safety reminders',title:'Automatic check-in reminders',
    note:'TJSDATES can remind you before your safety check-in, when it is due, and again if you have not checked in 15 minutes later. Notification text stays private and does not include your meeting place or trusted contact.',
    active:'Push active',inactive:'Push inactive',blocked:'Notifications blocked',unsupported:'Not supported',
    enable:'Enable safety reminders',prefsOff:'Safety alerts are disabled in your notification preferences.',
    enabled:'Safety reminders are enabled on this device.',deviceNeeded:'Enable push notifications on this device to receive reminders when TJSDATES is closed.',
    schedule:'Reminder schedule',pre:'30 min before',due:'At check-in time',late:'15 min overdue'
  }:{
    badge:'Recordatorios de seguridad',title:'Recordatorios automáticos de check-in',
    note:'TJSDATES puede avisarte antes de tu check-in de seguridad, cuando llegue la hora y otra vez si pasan 15 minutos sin confirmar. El aviso es privado y no incluye lugar de la cita ni datos de tu contacto de confianza.',
    active:'Push activo',inactive:'Push inactivo',blocked:'Notificaciones bloqueadas',unsupported:'No compatible',
    enable:'Activar recordatorios de seguridad',prefsOff:'Los avisos de seguridad están desactivados en tus preferencias de notificaciones.',
    enabled:'Los recordatorios de seguridad están activos en este dispositivo.',deviceNeeded:'Activa las notificaciones push en este dispositivo para recibir recordatorios aunque TJSDATES esté cerrado.',
    schedule:'Horario de recordatorios',pre:'30 min antes',due:'A la hora del check-in',late:'15 min después si sigue pendiente'
  };
}

function injectSafety51(){
  const host=$('dateSafety50');if(!host||$('safetyReminder51'))return;
  const t=safety51Copy();
  const c=document.createElement('div');c.id='safetyReminder51';c.className='safety-reminder51';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">${esc(t.badge)}</div><h3 style="margin:7px 0 0">${esc(t.title)}</h3></div><span id="safetyReminderBadge51" class="pill">…</span></div>
    <p class="note">${esc(t.note)}</p>
    <div class="safety-reminder-schedule51"><span>⏰ ${esc(t.pre)}</span><span>✓ ${esc(t.due)}</span><span>⚠️ ${esc(t.late)}</span></div>
    <button id="enableSafetyReminder51" class="btn primary" type="button" onclick="enableSafetyReminders51()">${esc(t.enable)}</button>
    <div id="safetyReminderStatus51" class="status"></div>`;
  const history=host.querySelector('h3:nth-of-type(2)');
  if(history)host.insertBefore(c,history);else host.appendChild(c);
  refreshSafetyReminders51();
}

async function safety51Preferences(){
  try{
    const {data,error}=await sb.rpc('get_my_notification_preferences');
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    return row||{new_matches:true,new_messages:true,new_likes:true,safety_alerts:true,marketing:false};
  }catch(_e){return null;}
}

async function setSafetyPreference51(on){
  const p=await safety51Preferences();if(!p)return;
  const {error}=await sb.rpc('update_my_notification_preferences',{
    p_new_matches:p.new_matches!==false,
    p_new_messages:p.new_messages!==false,
    p_new_likes:p.new_likes!==false,
    p_safety_alerts:!!on,
    p_marketing:!!p.marketing
  });
  if(error)throw error;
}

async function refreshSafetyReminders51(){
  const badge=$('safetyReminderBadge51'),status=$('safetyReminderStatus51'),btn=$('enableSafetyReminder51');
  if(!badge||!session)return;
  const t=safety51Copy();
  const prefs=await safety51Preferences();
  if(prefs&&prefs.safety_alerts===false){
    badge.textContent=t.inactive;status.textContent=t.prefsOff;if(btn)btn.classList.remove('hidden');return;
  }
  if(typeof webPushSupported!=='function'||!webPushSupported()){
    badge.textContent=t.unsupported;status.textContent=t.deviceNeeded;if(btn)btn.disabled=true;return;
  }
  if(Notification.permission==='denied'){
    badge.textContent=t.blocked;status.textContent=t.deviceNeeded;if(btn)btn.disabled=true;return;
  }
  const sub=typeof currentPushSubscription==='function'?await currentPushSubscription():null;
  if(sub){badge.textContent=t.active;status.textContent=t.enabled;status.classList.add('ok');if(btn)btn.classList.add('hidden');}
  else{badge.textContent=t.inactive;status.textContent=t.deviceNeeded;if(btn)btn.classList.remove('hidden');}
}

async function enableSafetyReminders51(){
  if(!session)return;
  const btn=$('enableSafetyReminder51');if(btn)btn.disabled=true;
  try{
    await setSafetyPreference51(true);
    if(typeof enableWebPush==='function')await enableWebPush();
    await refreshSafetyReminders51();
  }catch(e){setStatus('safetyReminderStatus51',e.message||String(e));}
  finally{if(btn)btn.disabled=false;}
}

function injectSafety51Styles(){
  if($('safety51Styles'))return;
  const s=document.createElement('style');s.id='safety51Styles';
  s.textContent='.safety-reminder51{margin:16px 0;padding:14px;border:1px solid var(--line);border-radius:14px}.safety-reminder-schedule51{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 12px}.safety-reminder-schedule51 span{font-size:12px;padding:6px 9px;border:1px solid var(--line);border-radius:999px}';
  document.head.appendChild(s);
}

const p51Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p51Apply)applyTjsLanguage=function(){p51Apply();injectSafety51();refreshSafetyReminders51();};
const p51Go=typeof go==='function'?go:null;
if(p51Go)go=function(page){p51Go(page);if(page==='safety')setTimeout(()=>{injectSafety51();refreshSafetyReminders51();},120);};

injectSafety51Styles();
setTimeout(()=>{injectSafety51();if(session)refreshSafetyReminders51();},500);
window.addEventListener('pageshow',()=>setTimeout(()=>{if(session)refreshSafetyReminders51();},150));

if(!document.querySelector('script[data-tjs-phase52]')){
  const s=document.createElement('script');s.src='phase52.js?v=1';s.defer=true;s.dataset.tjsPhase52='1';document.body.appendChild(s);
}
