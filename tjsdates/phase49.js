// Phase 49: safer, reviewable photo-verification workflow.

function verification49Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    approvedRequired:'At least one approved profile photo is required before requesting verification.',
    alreadyVerified:'Your profile is already verified.',
    profileUnavailable:'Your profile is not available for verification right now.',
    reason:'Reason',photos:'Approved profile photos',noPhotos:'No approved photos available.',
    rejectPrompt:'Reason for rejection (required):',approveConfirm:'Approve this profile verification?',
    rejected:'Verification rejected',approved:'Verification approved'
  }:{
    approvedRequired:'Necesitas al menos una foto de perfil aprobada antes de solicitar la verificación.',
    alreadyVerified:'Tu perfil ya está verificado.',
    profileUnavailable:'Tu perfil no está disponible para verificación en este momento.',
    reason:'Motivo',photos:'Fotos de perfil aprobadas',noPhotos:'No hay fotos aprobadas disponibles.',
    rejectPrompt:'Motivo del rechazo (obligatorio):',approveConfirm:'¿Aprobar esta verificación de perfil?',
    rejected:'Verificación rechazada',approved:'Verificación aprobada'
  };
}

function verification49FriendlyError(err){
  const m=String(err?.message||err||'');
  const t=verification49Copy();
  if(m.includes('approved_photo_required'))return t.approvedRequired;
  if(m.includes('already_verified'))return t.alreadyVerified;
  if(m.includes('profile_unavailable'))return t.profileUnavailable;
  if(m.includes('verification_already_reviewed'))return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'This request was already reviewed.':'Esta solicitud ya fue revisada.';
  return m||'Error';
}

if(typeof requestVerification48==='function'){
  requestVerification48=async function(){
    if(!session)return;
    const btn=$('requestVerify48');if(btn)btn.disabled=true;
    try{
      const {error}=await sb.rpc('request_photo_verification');if(error)throw error;
      setStatus('verifyStatus48',verificationCopy48().requested,true);await loadVerification48();
    }catch(e){setStatus('verifyStatus48',verification49FriendlyError(e));if(btn)btn.disabled=false;}
  };
}

if(typeof loadVerification48==='function'){
  loadVerification48=async function(){
    if(!session||!$('verifyState48'))return;
    const t=verificationCopy48();
    try{
      const {data,error}=await sb.rpc('get_my_verification_status');if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;
      const status=String(row?.status||'none').toLowerCase();
      const state=$('verifyState48'),btn=$('requestVerify48');
      let msg='';
      if(profile?.is_verified||status==='approved'){state.textContent='✓ '+t.approved;if(btn)btn.disabled=true;}
      else if(status==='pending'){state.textContent='⏳ '+t.pending;if(btn)btn.disabled=true;}
      else if(status==='rejected'){
        state.textContent=t.rejected;if(btn)btn.disabled=false;
        if(row?.review_note)msg=`${verification49Copy().reason}: ${row.review_note}`;
      } else {state.textContent=t.none;if(btn)btn.disabled=false;}
      if($('verifyStatus48'))$('verifyStatus48').textContent=msg;
    }catch(e){setStatus('verifyStatus48',verification49FriendlyError(e));}
  };
}

async function verification49SignedPhotos(paths){
  const out=[];
  for(const path of paths||[]){
    const {data,error}=await sb.storage.from('profile-photos').createSignedUrl(path,300);
    if(!error&&data?.signedUrl)out.push({path,url:data.signedUrl});
  }
  return out;
}

if(typeof loadAdminVerification48==='function'){
  loadAdminVerification48=async function(){
    if(!adminRole||!$('adminVerifyList48'))return;
    const box=$('adminVerifyList48'),t=verificationCopy48(),x=verification49Copy();
    box.innerHTML='<div class="note">…</div>';
    try{
      const {data,error}=await sb.rpc('admin_verification_queue',{lim:50});if(error)throw error;
      box.innerHTML='';
      for(const v of data||[]){
        const d=document.createElement('div');d.className='queueitem';d.style.alignItems='stretch';d.style.flexDirection='column';
        const head=document.createElement('div');head.className='row';head.style.justifyContent='space-between';
        head.innerHTML=`<div><b>${esc(v.display_name||'Usuario')}</b><div class="note">${esc(v.verification_type||'photo')} · ${new Date(v.created_at).toLocaleString()}</div></div><span class="pill">${Number(v.photo_count||0)} 📷</span>`;
        d.appendChild(head);
        const title=document.createElement('div');title.className='note';title.style.marginTop='8px';title.textContent=x.photos;d.appendChild(title);
        const gallery=document.createElement('div');gallery.className='verification-gallery49';gallery.innerHTML='<div class="note">…</div>';d.appendChild(gallery);
        const actions=document.createElement('div');actions.className='row';actions.style.marginTop='10px';
        actions.innerHTML=`<button class="mini" type="button">${esc(t.approve)}</button><button class="mini" type="button">${esc(t.reject)}</button>`;
        const bs=actions.querySelectorAll('button');bs[0].onclick=()=>moderateVerification49(v.id,'approved');bs[1].onclick=()=>moderateVerification49(v.id,'rejected');d.appendChild(actions);box.appendChild(d);
        verification49SignedPhotos(v.photo_paths||[]).then(items=>{
          gallery.innerHTML='';
          if(!items.length){gallery.innerHTML=`<div class="empty">${esc(x.noPhotos)}</div>`;return;}
          for(const item of items){const img=document.createElement('img');img.src=item.url;img.alt='Profile verification photo';img.loading='lazy';gallery.appendChild(img);}
        });
      }
      if(!(data||[]).length)box.innerHTML=`<div class="empty">${esc(t.empty)}</div>`;
    }catch(e){box.innerHTML=`<div class="empty">${esc(verification49FriendlyError(e))}</div>`;}
  };
}

async function moderateVerification49(id,decision){
  if(!adminRole)return;
  const x=verification49Copy();
  let note=null;
  if(decision==='rejected'){
    note=(prompt(x.rejectPrompt)||'').trim();
    if(!note)return;
  }else if(!confirm(x.approveConfirm))return;
  try{
    const {error}=await sb.rpc('admin_moderate_verification',{verification_uuid:id,decision,note});if(error)throw error;
    toast(decision==='approved'?x.approved:x.rejected);await loadAdminVerification48();
  }catch(e){toast(verification49FriendlyError(e));}
}

function injectVerification49Styles(){
  if($('verification49Styles'))return;
  const s=document.createElement('style');s.id='verification49Styles';
  s.textContent='.verification-gallery49{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:6px}.verification-gallery49 img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;border:1px solid var(--line)}';
  document.head.appendChild(s);
}

injectVerification49Styles();
setTimeout(()=>{injectVerification49Styles();if(session&&$('verifyState48'))loadVerification48();if(adminRole&&$('adminVerifyList48'))loadAdminVerification48();},400);
