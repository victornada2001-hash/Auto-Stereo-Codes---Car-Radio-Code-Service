let accountRestrictionState=null;

function ensureRestrictionOverlay(){
  let o=document.getElementById('accountRestrictionOverlay');
  if(o)return o;
  o=document.createElement('div');o.id='accountRestrictionOverlay';o.className='hidden';
  o.style.cssText='position:fixed;inset:0;z-index:12000;background:linear-gradient(180deg,#130b1d,#08050d);display:flex;align-items:center;justify-content:center;padding:24px';
  o.innerHTML='<div class="card" style="max-width:620px;width:100%;text-align:center"><div style="font-size:52px">🛡️</div><div class="pill" style="display:inline-block;margin-top:8px">Cuenta restringida</div><h2 id="restrictionTitle">Revisando cuenta</h2><p id="restrictionText" class="note"></p><div id="restrictionUntil" class="note" style="margin:10px 0"></div><div class="row" style="justify-content:center;margin-top:18px"><button class="btn ghost" onclick="goRestrictionSupport()">Contactar soporte</button><button class="btn" onclick="logout()">Cerrar sesión</button></div></div>';
  document.body.appendChild(o);return o;
}

async function enforceAccountState(){
  if(!session)return true;
  const {data,error}=await sb.rpc('get_my_account_state');
  if(error){console.error('No se pudo comprobar el estado de cuenta',error);return true}
  const s=data?.[0];accountRestrictionState=s||null;
  const overlay=ensureRestrictionOverlay();
  if(!s||s.account_state==='active'){
    overlay.classList.add('hidden');overlay.style.display='none';return true;
  }
  overlay.classList.remove('hidden');overlay.style.display='flex';
  const banned=s.account_state==='banned';
  $('restrictionTitle').textContent=banned?'Cuenta suspendida permanentemente':'Cuenta temporalmente suspendida';
  $('restrictionText').textContent=s.suspension_reason||'Tu cuenta fue restringida por una decisión de moderación. Puedes comunicarte con soporte si consideras que se trata de un error.';
  $('restrictionUntil').textContent=s.suspended_until?`Restricción programada hasta: ${new Date(s.suspended_until).toLocaleString()}`:(banned?'No puedes usar TJSDATES con esta cuenta.':'La cuenta permanecerá restringida hasta que el equipo de moderación la revise.');
  try{if(realtimeChannel)sb.removeChannel(realtimeChannel);if(notificationChannel)sb.removeChannel(notificationChannel)}catch(_e){}
  return false;
}

function goRestrictionSupport(){
  ensureRestrictionOverlay().style.display='none';
  if(typeof go==='function'){go('account');setTimeout(()=>document.getElementById('supportCard')?.scrollIntoView({behavior:'smooth'}),120)}
}

const p13Boot=boot;
boot=async function(){await p13Boot();if(session)await enforceAccountState()};

function injectAdminAudit(){
  const admin=$('page-admin');if(!admin||$('adminAuditCard'))return;
  const c=document.createElement('div');c.id='adminAuditCard';c.className='card';c.style.marginTop='14px';
  c.innerHTML='<div class="sectionhead"><div><div class="pill">Trazabilidad</div><h3 style="margin:8px 0 0">Acciones recientes de moderación</h3></div><button class="btn ghost" onclick="loadAdminAudit()">Actualizar</button></div><div id="adminAuditList" class="stack"></div>';
  admin.appendChild(c);
}

async function loadAdminAudit(){
  if(!adminRole||!$('adminAuditList'))return;
  const box=$('adminAuditList');box.innerHTML='<div class="note">Cargando...</div>';
  const {data,error}=await sb.rpc('admin_recent_actions',{lim:60});
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  box.innerHTML='';
  for(const a of data||[]){
    const d=document.createElement('div');d.className='queueitem';
    const restricted=['suspended','banned'].includes(a.account_state);
    d.innerHTML=`<div><b>${esc(a.display_name||'Usuario')}</b><p class="note">${esc(a.action||'acción')} · ${new Date(a.created_at).toLocaleString()}</p>${a.reason?`<p class="note">${esc(a.reason)}</p>`:''}</div><div class="row"><span class="pill">${esc(a.account_state||'active')}</span>${restricted?'<button class="mini restore-account">Reactivar</button>':''}</div>`;
    const b=d.querySelector('.restore-account');if(b)b.onclick=()=>restoreModeratedAccount(a.target_user_id,a.display_name);
    box.appendChild(d);
  }
  if(!(data||[]).length)box.innerHTML='<div class="empty">Todavía no hay acciones de moderación.</div>';
}

async function restoreModeratedAccount(userId,name){
  if(!confirm(`¿Reactivar la cuenta de ${name||'este usuario'}?`))return;
  const reason=prompt('Motivo de reactivación (queda en auditoría):')||'Reactivación manual por moderación';
  const {error}=await sb.rpc('admin_set_account_state',{target_user:userId,new_state:'active',reason,until_at:null});
  if(error)return toast(error.message);
  toast('Cuenta reactivada.');loadAdmin();loadAdminAudit();
}

const p13LoadAdmin=loadAdmin;
loadAdmin=async function(){await p13LoadAdmin();injectAdminAudit();await loadAdminAudit()};

const p13Go=go;
go=function(page){p13Go(page);if(page==='admin')setTimeout(()=>{injectAdminAudit();loadAdminAudit()},80)};

sb.auth.onAuthStateChange(async(_event,s)=>{if(s){session=s;setTimeout(enforceAccountState,150)}});
setTimeout(()=>{ensureRestrictionOverlay();if(session)enforceAccountState();injectAdminAudit()},1000);
