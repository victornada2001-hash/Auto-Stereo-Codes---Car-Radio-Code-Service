// Phase 38: hardened account-deletion UX, consent history, and privacy-state consistency.

let deletionCountdownTimer=null;

function phase38PrivacyError(err){
  const m=String(err?.message||err||'');
  if(m.includes('grace_period_expired'))return 'El periodo para cancelar ya terminó. La eliminación está en proceso.';
  if(m.includes('no_pending_deletion'))return 'No hay una solicitud de eliminación pendiente.';
  if(m.includes('reason_too_long'))return 'El motivo debe tener máximo 500 caracteres.';
  if(m.includes('profile_unavailable'))return 'Tu perfil no está disponible en este momento.';
  if(m.includes('unauthenticated')||m.includes('not authenticated'))return 'Tu sesión terminó. Inicia sesión nuevamente.';
  return typeof phase35FriendlyError==='function'?phase35FriendlyError(err):(err?.message||'No se pudo completar la acción.');
}

function injectConsentHistoryCard(){
  const page=$('page-privacy');
  if(!page||$('consentHistoryCard'))return;
  const c=document.createElement('div');
  c.id='consentHistoryCard';c.className='card';c.style.marginTop='14px';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">Registro legal</div><h3 style="margin:7px 0 0">Consentimientos de tu cuenta</h3></div><button class="btn ghost" type="button" onclick="loadMyConsents()">Actualizar</button></div>
    <p class="note">Aquí puedes consultar el registro de aceptación asociado a tu cuenta. Estos registros no se editan desde el navegador.</p>
    <div id="consentHistoryList" class="stack"></div>`;
  const dataCard=page.querySelector('.exportbox')?.closest('.card');
  if(dataCard?.nextSibling)page.insertBefore(c,dataCard.nextSibling);else page.appendChild(c);
}

function consentLabel(type){
  const labels={terms:'Términos de uso',privacy:'Aviso de privacidad',age:'Confirmación 18+',age_18_plus:'Confirmación 18+',marketing:'Comunicaciones'};
  return labels[type]||String(type||'Consentimiento').replaceAll('_',' ');
}

async function loadMyConsents(){
  if(!session||!$('consentHistoryList'))return;
  const box=$('consentHistoryList');box.innerHTML='<div class="note">Cargando…</div>';
  try{
    const {data,error}=await sb.rpc('get_my_consents');if(error)throw error;
    box.innerHTML='';
    for(const row of data||[]){
      const d=document.createElement('div');d.className='queueitem';
      const version=row.document_version?` · versión ${esc(row.document_version)}`:'';
      d.innerHTML=`<div><b>${esc(consentLabel(row.consent_type))}</b><p class="note">${row.granted?'Aceptado':'No aceptado'}${version} · ${new Date(row.created_at).toLocaleString()}</p></div><span class="pill">${row.granted?'✓':'—'}</span>`;
      box.appendChild(d);
    }
    if(!(data||[]).length)box.innerHTML='<div class="empty">No hay registros de consentimiento disponibles.</div>';
  }catch(e){box.innerHTML=`<div class="empty">${esc(phase38PrivacyError(e))}</div>`;}
}

function setDeletionPrivacyLock(locked){
  const ids=['pvPaused','pvDiscoverable'];
  ids.forEach(id=>{const el=$(id);if(el)el.disabled=!!locked});
  const save=document.querySelector('#page-privacy button[onclick="savePrivacySettings()"]');
  if(save)save.dataset.deletionLocked=locked?'1':'0';
}

function formatDeletionRemaining(ms){
  if(ms<=0)return 'Periodo de gracia finalizado';
  const total=Math.floor(ms/1000),days=Math.floor(total/86400),hours=Math.floor((total%86400)/3600),minutes=Math.floor((total%3600)/60);
  if(days>0)return `${days} d ${hours} h restantes`;
  if(hours>0)return `${hours} h ${minutes} min restantes`;
  return `${Math.max(0,minutes)} min restantes`;
}

function startDeletionCountdown(scheduledFor){
  clearInterval(deletionCountdownTimer);deletionCountdownTimer=null;
  const target=new Date(scheduledFor).getTime();
  const tick=()=>{
    const el=$('deleteCountdown');if(!el)return;
    const diff=target-Date.now();el.textContent=formatDeletionRemaining(diff);
    if(diff<=0){clearInterval(deletionCountdownTimer);deletionCountdownTimer=null;const cancel=$('cancelDeleteBtn');if(cancel)cancel.disabled=true;}
  };
  tick();deletionCountdownTimer=setInterval(tick,60000);
}

loadDeletionStatus=async function(){
  if(!session||!$('deleteState'))return;
  const box=$('deleteState'),cancel=$('cancelDeleteBtn');
  try{
    const {data,error}=await sb.rpc('get_my_account_deletion_status');if(error)throw error;
    const d=data?.[0];
    clearInterval(deletionCountdownTimer);deletionCountdownTimer=null;
    if(!d||d.status==='cancelled'){
      box.innerHTML='<p class="note">No hay una solicitud de eliminación activa.</p>';
      cancel?.classList.add('hidden');if(cancel)cancel.disabled=false;setDeletionPrivacyLock(false);return;
    }
    if(d.status==='pending'){
      const target=new Date(d.scheduled_for),expired=Date.now()>=target.getTime();
      box.innerHTML=`<div class="pill">Eliminación pendiente</div><p class="note">Tu perfil permanece pausado y fuera de Descubrir. Eliminación programada para ${target.toLocaleString()}.</p><div id="deleteCountdown" class="note" style="font-weight:800;margin-bottom:10px"></div>`;
      cancel?.classList.remove('hidden');if(cancel)cancel.disabled=expired;setDeletionPrivacyLock(true);startDeletionCountdown(d.scheduled_for);return;
    }
    box.innerHTML=`<p class="note">Estado: ${esc(d.status)}</p>`;cancel?.classList.add('hidden');setDeletionPrivacyLock(true);
  }catch(e){box.innerHTML=`<p class="note">${esc(phase38PrivacyError(e))}</p>`;}
};

requestDeletion=async function(){
  if(!session)return setStatus('deleteStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  if(!confirm('Esto pausará tu perfil y lo sacará de Descubrir durante 7 días. Si no cancelas dentro del periodo de gracia, la cuenta será eliminada. ¿Continuar?'))return;
  const reason=(prompt('Motivo opcional de eliminación (máximo 500 caracteres):')||'').trim();
  if(reason.length>500)return setStatus('deleteStatus','El motivo debe tener máximo 500 caracteres.');
  const btn=document.querySelector('.accountDanger button[onclick="requestDeletion()"]');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('request_account_deletion',{p_reason:reason||null});if(error)throw error;
    profile={...profile,is_paused:true};
    setStatus('deleteStatus','Solicitud registrada. Tu perfil está pausado y oculto de Descubrir.',true);
    await loadPrivacySettings();await loadDeletionStatus();
    if(typeof loadDiscovery==='function')loadDiscovery();
  }catch(e){setStatus('deleteStatus',phase38PrivacyError(e));}
  finally{if(btn)btn.disabled=false;}
};

cancelDeletion=async function(){
  if(!session)return setStatus('deleteStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  if(!confirm('¿Cancelar la solicitud de eliminación y conservar tu cuenta?'))return;
  const btn=$('cancelDeleteBtn');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('cancel_account_deletion');if(error)throw error;
    setStatus('deleteStatus','Solicitud cancelada. Se restauró tu estado de privacidad anterior cuando fue posible.',true);
    await loadPrivacySettings();await loadDeletionStatus();
    if(typeof loadDiscovery==='function')loadDiscovery();
  }catch(e){setStatus('deleteStatus',phase38PrivacyError(e));}
  finally{if(btn)btn.disabled=false;}
};

const p38SavePrivacy=savePrivacySettings;
savePrivacySettings=async function(){
  try{await p38SavePrivacy();await loadPrivacySettings();await loadDeletionStatus();}
  catch(e){setStatus('privacyStatus',phase38PrivacyError(e));}
};

const p38Go=go;
go=function(page){
  p38Go(page);
  if(page==='privacy')setTimeout(()=>{injectConsentHistoryCard();loadMyConsents();loadDeletionStatus()},100);
};

window.addEventListener('beforeunload',()=>{clearInterval(deletionCountdownTimer)});
setTimeout(()=>{injectConsentHistoryCard();if(session){loadMyConsents();loadDeletionStatus()}},1100);
