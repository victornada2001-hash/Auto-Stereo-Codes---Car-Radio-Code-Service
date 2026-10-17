// Phase 37: secure referral codes and invite flow.

function referralFriendlyError(err){
  const m=String(err?.message||err||'');
  if(m.includes('invalid_referral_code'))return 'El código de invitación no es válido.';
  if(m.includes('referral_already_used'))return 'Tu cuenta ya utilizó un código de invitación.';
  if(m.includes('self_referral_not_allowed'))return 'No puedes usar tu propio código.';
  if(m.includes('referral_unavailable'))return 'Ese código ya no está disponible.';
  if(m.includes('unauthenticated'))return 'Tu sesión terminó. Inicia sesión nuevamente.';
  return typeof phase35FriendlyError==='function'?phase35FriendlyError(err):(err?.message||'No se pudo completar la invitación.');
}

function injectReferralCard(){
  const page=$('page-profile');if(!page||$('referralCard'))return;
  const c=document.createElement('div');c.id='referralCard';c.className='card';c.style.marginTop='14px';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">Invita a tus amigos</div><h3 style="margin:7px 0 0">Código de invitación</h3></div></div>
    <p class="note">Comparte tu código con una persona. Cada cuenta solo puede usar un código de invitación y no puedes usar el tuyo.</p>
    <div class="row" style="align-items:center;flex-wrap:wrap"><div id="myReferralCode" class="invitecode" style="margin:0;min-width:210px">Cargando…</div><button class="btn ghost" type="button" onclick="copyReferralCode()">Copiar</button><button class="btn primary" type="button" onclick="shareReferralCode()">Compartir</button></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
    <div class="field"><label>¿Te invitaron?</label><div class="row" style="flex-wrap:wrap"><input id="referralInput" maxlength="32" placeholder="Escribe el código" style="text-transform:uppercase;max-width:260px"><button id="applyReferralBtn" class="btn primary" type="button" onclick="applyReferralCode()">Aplicar código</button></div></div>
    <div id="referralStatus" class="status"></div>`;
  page.appendChild(c);
  loadReferralCode();
}

async function loadReferralCode(){
  if(!session||!$('myReferralCode'))return;
  try{
    const {data,error}=await sb.rpc('get_or_create_my_referral_code');
    if(error)throw error;
    $('myReferralCode').textContent=data||'—';
  }catch(e){$('myReferralCode').textContent='—';setStatus('referralStatus',referralFriendlyError(e));}
}

function currentReferralCode(){
  const v=($('myReferralCode')?.textContent||'').trim();
  return v&&v!=='—'&&v!=='Cargando…'?v:'';
}

async function copyReferralCode(){
  const code=currentReferralCode();if(!code)return toast('Todavía no hay un código disponible.');
  try{await navigator.clipboard.writeText(code);toast('Código copiado.');}
  catch(_e){toast(`Tu código es ${code}`)}
}

async function shareReferralCode(){
  const code=currentReferralCode();if(!code)return toast('Todavía no hay un código disponible.');
  const text=`Únete a TJSDATES. Mi código de invitación es ${code}`;
  try{
    if(navigator.share)await navigator.share({title:'TJSDATES',text,url:location.origin});
    else{await navigator.clipboard.writeText(`${text} ${location.origin}`);toast('Invitación copiada.');}
  }catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir la invitación.');}
}

async function applyReferralCode(){
  if(!session)return setStatus('referralStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  const code=($('referralInput')?.value||'').trim().toUpperCase();
  if(code.length<6)return setStatus('referralStatus','Escribe un código válido.');
  const btn=$('applyReferralBtn');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('apply_referral_code',{p_code:code});
    if(error)throw error;
    setStatus('referralStatus','Código aplicado correctamente.',true);
    if($('referralInput'))$('referralInput').value='';
  }catch(e){setStatus('referralStatus',referralFriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
}

const p37Go=go;
go=function(page){p37Go(page);if(page==='profile')setTimeout(()=>{injectReferralCard();loadReferralCode()},90)};
setTimeout(()=>{injectReferralCard();if(session)loadReferralCode()},1000);

if(!document.querySelector('script[data-tjs-phase38]')){
  const s=document.createElement('script');s.src='phase38.js?v=1';s.defer=true;s.dataset.tjsPhase38='1';document.body.appendChild(s);
}
