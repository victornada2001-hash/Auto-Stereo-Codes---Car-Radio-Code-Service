// Phase 48: user photo-verification status and moderator verification queue.

function verificationCopy48(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    badge:'Trust',title:'Photo verification',note:'Request a manual verification review after uploading clear profile photos. Approval adds the verified badge to your profile.',request:'Request verification',refresh:'Refresh status',none:'Not requested yet',pending:'Verification pending review',approved:'Profile verified',rejected:'Verification was not approved. Update your photos and request another review.',admin:'Pending verifications',approve:'Approve',reject:'Reject',empty:'No pending verification requests.',requested:'Verification request submitted.'
  }:{
    badge:'Confianza',title:'Verificación por foto',note:'Solicita una revisión manual después de subir fotos claras de perfil. Al aprobarse, se agrega la insignia de verificado a tu perfil.',request:'Solicitar verificación',refresh:'Actualizar estado',none:'Aún no solicitada',pending:'Verificación pendiente de revisión',approved:'Perfil verificado',rejected:'La verificación no fue aprobada. Actualiza tus fotos y solicita otra revisión.',admin:'Verificaciones pendientes',approve:'Aprobar',reject:'Rechazar',empty:'No hay solicitudes de verificación pendientes.',requested:'Solicitud de verificación enviada.'
  };
}

function injectVerification48(){
  const page=$('page-profile');
  if(page&&!$('verificationCard48')){
    const c=document.createElement('div');c.id='verificationCard48';c.className='card';c.style.marginTop='14px';
    c.innerHTML='<div class="sectionhead"><div><div id="verifyBadge48" class="pill"></div><h3 id="verifyTitle48" style="margin:7px 0 0"></h3></div><span id="verifyState48" class="pill">—</span></div><p id="verifyNote48" class="note"></p><div class="row" style="flex-wrap:wrap"><button id="requestVerify48" class="btn primary" type="button" onclick="requestVerification48()"></button><button id="refreshVerify48" class="btn ghost" type="button" onclick="loadVerification48()"></button></div><div id="verifyStatus48" class="status"></div>';
    const referral=$('referralCard');if(referral?.parentElement)referral.parentElement.insertBefore(c,referral);else page.appendChild(c);
  }
  const admin=$('page-admin');
  if(admin&&!$('adminVerification48')){
    const c=document.createElement('div');c.id='adminVerification48';c.className='card';c.style.marginTop='14px';c.innerHTML='<h3 id="adminVerifyTitle48"></h3><div id="adminVerifyList48" class="stack"></div>';admin.appendChild(c);
  }
  applyVerificationLanguage48();
}

function applyVerificationLanguage48(){
  const t=verificationCopy48();
  if($('verifyBadge48'))$('verifyBadge48').textContent=t.badge;
  if($('verifyTitle48'))$('verifyTitle48').textContent=t.title;
  if($('verifyNote48'))$('verifyNote48').textContent=t.note;
  if($('requestVerify48'))$('requestVerify48').textContent=t.request;
  if($('refreshVerify48'))$('refreshVerify48').textContent=t.refresh;
  if($('adminVerifyTitle48'))$('adminVerifyTitle48').textContent=t.admin;
}

async function loadVerification48(){
  if(!session||!$('verifyState48'))return;
  const t=verificationCopy48();
  try{
    const {data,error}=await sb.rpc('get_my_verification_status');if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    const status=String(row?.status||row?.verification_status||'none').toLowerCase();
    const state=$('verifyState48'),btn=$('requestVerify48');
    if(profile?.is_verified||status==='approved'){state.textContent='✓ '+t.approved;if(btn)btn.disabled=true;}
    else if(status==='pending'){state.textContent='⏳ '+t.pending;if(btn)btn.disabled=true;}
    else if(status==='rejected'){state.textContent=t.rejected;if(btn)btn.disabled=false;}
    else{state.textContent=t.none;if(btn)btn.disabled=false;}
  }catch(e){setStatus('verifyStatus48',e.message||String(e));}
}

async function requestVerification48(){
  if(!session)return;
  const btn=$('requestVerify48');if(btn)btn.disabled=true;
  try{
    const {data:photos,error:photoError}=await sb.from('profile_photos').select('id').eq('user_id',session.user.id).limit(1);if(photoError)throw photoError;
    if(!photos?.length)throw new Error(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Upload at least one profile photo before requesting verification.':'Sube al menos una foto de perfil antes de solicitar verificación.');
    const {error}=await sb.rpc('request_photo_verification');if(error)throw error;
    setStatus('verifyStatus48',verificationCopy48().requested,true);await loadVerification48();
  }catch(e){setStatus('verifyStatus48',e.message||String(e));if(btn)btn.disabled=false;}
}

async function loadAdminVerification48(){
  if(!adminRole||!$('adminVerifyList48'))return;
  const box=$('adminVerifyList48'),t=verificationCopy48();box.innerHTML='<div class="note">…</div>';
  try{
    const {data,error}=await sb.rpc('admin_verification_queue',{lim:50});if(error)throw error;
    box.innerHTML='';
    for(const v of data||[]){
      const d=document.createElement('div');d.className='queueitem';
      d.innerHTML=`<div><b>${esc(v.display_name||'Usuario')}</b><div class="note">${esc(v.verification_type||'photo')} · ${new Date(v.created_at).toLocaleString()}</div></div><div class="row"><button class="mini" type="button">${esc(t.approve)}</button><button class="mini" type="button">${esc(t.reject)}</button></div>`;
      const bs=d.querySelectorAll('button');bs[0].onclick=()=>moderateVerification48(v.id,'approved');bs[1].onclick=()=>moderateVerification48(v.id,'rejected');box.appendChild(d);
    }
    if(!(data||[]).length)box.innerHTML=`<div class="empty">${esc(t.empty)}</div>`;
  }catch(e){box.innerHTML=`<div class="empty">${esc(e.message||String(e))}</div>`;}
}

async function moderateVerification48(id,decision){
  if(!adminRole)return;
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  const note=prompt(en?'Optional moderator note:':'Nota opcional de moderación:')||null;
  try{
    const {error}=await sb.rpc('admin_moderate_verification',{verification_uuid:id,decision,note});if(error)throw error;
    toast(en?'Verification updated.':'Verificación actualizada.');await loadAdminVerification48();
  }catch(e){toast(e.message||String(e));}
}

const p48Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;if(p48Apply)applyTjsLanguage=function(){p48Apply();injectVerification48();applyVerificationLanguage48();};
const p48Go=typeof go==='function'?go:null;if(p48Go)go=function(page){p48Go(page);if(page==='profile')setTimeout(()=>{injectVerification48();loadVerification48();},80);if(page==='admin')setTimeout(()=>{injectVerification48();loadAdminVerification48();},80);};
const p48LoadAdmin=typeof loadAdmin==='function'?loadAdmin:null;if(p48LoadAdmin)loadAdmin=async function(){await p48LoadAdmin();await loadAdminVerification48();};

setTimeout(()=>{injectVerification48();if(session)loadVerification48();if(adminRole)loadAdminVerification48();},350);

if(!document.querySelector('script[data-tjs-phase49]')){
  const s=document.createElement('script');s.src='phase49.js?v=1';s.defer=true;s.dataset.tjsPhase49='1';document.body.appendChild(s);
}
