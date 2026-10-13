function injectPhaseTwelveUI(){
  const safety=$('page-safety');if(!safety)return;
  if(!$('blockedUsersCard')){
    const c=document.createElement('div');c.id='blockedUsersCard';c.className='card';c.style.marginTop='14px';
    c.innerHTML='<div class="sectionhead"><div><div class="pill">Control de contacto</div><h3 style="margin:8px 0 0">Usuarios bloqueados</h3></div><button class="btn ghost" onclick="loadBlockedUsers()">Actualizar</button></div><p class="note">Puedes desbloquear a alguien desde aquí. Desbloquear no restaura matches anteriores automáticamente.</p><div id="blockedUsersList" class="stack"></div>';
    safety.appendChild(c);
  }
  if(!$('myReportsCard')){
    const c=document.createElement('div');c.id='myReportsCard';c.className='card';c.style.marginTop='14px';
    c.innerHTML='<div class="sectionhead"><div><div class="pill">Seguimiento</div><h3 style="margin:8px 0 0">Mis reportes</h3></div><button class="btn ghost" onclick="loadMyReports()">Actualizar</button></div><p class="note">Aquí puedes revisar si un reporte sigue pendiente o ya fue atendido. Las notas internas de moderación no se muestran.</p><div id="myReportsList" class="stack"></div>';
    safety.appendChild(c);
  }
}

async function loadBlockedUsers(){
  if(!session||!$('blockedUsersList'))return;
  const box=$('blockedUsersList');box.innerHTML='<div class="note">Cargando...</div>';
  const {data,error}=await sb.rpc('get_my_blocks');
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  box.innerHTML='';
  for(const row of data||[]){
    const d=document.createElement('div');d.className='queueitem';
    d.innerHTML=`<div><b>${esc(row.display_name||'Usuario')}</b><p class="note">Bloqueado ${new Date(row.blocked_at).toLocaleString()}</p></div><button class="mini" type="button">Desbloquear</button>`;
    d.querySelector('button').onclick=()=>unblockUserFromSafety(row.blocked_user_id,row.display_name);box.appendChild(d);
  }
  if(!(data||[]).length)box.innerHTML='<div class="empty">No tienes usuarios bloqueados.</div>';
}

async function unblockUserFromSafety(id,name){
  if(!confirm(`¿Desbloquear a ${name||'este usuario'}?`))return;
  const {data,error}=await sb.rpc('unblock_user',{target_user:id});
  if(error)return toast(error.message);
  toast(data?'Usuario desbloqueado.':'Ese usuario ya no estaba bloqueado.');
  loadBlockedUsers();loadDiscovery();
}

async function loadMyReports(){
  if(!session||!$('myReportsList'))return;
  const box=$('myReportsList');box.innerHTML='<div class="note">Cargando...</div>';
  const {data,error}=await sb.rpc('get_my_reports');
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  box.innerHTML='';
  const labels={pending:'Pendiente',reviewing:'En revisión',resolved:'Resuelto',dismissed:'Cerrado'};
  for(const r of data||[]){
    const d=document.createElement('div');d.className='queueitem';
    const status=labels[r.status]||r.status;
    d.innerHTML=`<div><b>${esc(r.display_name||'Usuario')}</b><p class="note">${esc(r.reason)} · ${new Date(r.created_at).toLocaleString()}</p></div><span class="pill">${esc(status)}</span>`;
    box.appendChild(d);
  }
  if(!(data||[]).length)box.innerHTML='<div class="empty">No has enviado reportes.</div>';
}

setTimeout(()=>{injectPhaseTwelveUI();if(session){loadBlockedUsers();loadMyReports()}},900);
const p12Go=go;
go=function(page){p12Go(page);if(page==='safety'){setTimeout(()=>{injectPhaseTwelveUI();loadBlockedUsers();loadMyReports()},80)}};
