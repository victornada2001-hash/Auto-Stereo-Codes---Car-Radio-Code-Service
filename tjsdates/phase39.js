// Phase 39: remove remaining legacy browser writes and make secondary sections reachable on mobile.

function phase39FriendlyError(err){
  const m=String(err?.message||err||'');
  const map={unauthenticated:'Tu sesión terminó. Inicia sesión nuevamente.',account_restricted:'Tu cuenta tiene acceso limitado.',invalid_category:'Selecciona una categoría válida.',invalid_subject:'Revisa el asunto.',invalid_message:'Revisa el mensaje.',ticket_not_found:'No encontramos esa solicitud.',ticket_closed:'La solicitud ya está cerrada.'};
  for(const [k,v] of Object.entries(map))if(m.includes(k))return v;
  return typeof phase35FriendlyError==='function'?phase35FriendlyError(err):(err?.message||'No se pudo completar la acción.');
}

exploreLike=async function(userId,btn){
  if(!session)return toast('Tu sesión terminó.');
  if(btn)btn.disabled=true;
  try{
    const {data,error}=await sb.rpc('create_like',{target_user:userId,p_like_type:'like'});if(error)throw error;
    const r=Array.isArray(data)?data[0]:data;
    if(btn)btn.textContent=r?.is_match?'🎉 ¡Match!':'✓ Like enviado';
    toast(r?.is_match?'¡Hicieron Match! Ya pueden conversar.':'Like enviado.');
    if(typeof refreshBadges==='function')refreshBadges();
    if(typeof loadMatches==='function'&&r?.is_match)loadMatches();
  }catch(e){if(btn)btn.disabled=false;toast(phase39FriendlyError(e));}
};

sendSocialMessage=async function(){
  if(!session||!socialConversationId)return;
  const input=$('socialChatInput'),body=input?.value.trim();if(!body)return;
  if(body.length>1000)return toast('El mensaje debe tener máximo 1000 caracteres.');
  const sendBtn=input?.parentElement?.querySelector('button');if(sendBtn)sendBtn.disabled=true;
  try{
    const {error}=await sb.rpc('send_message',{cid:socialConversationId,p_body:body,p_attachment_path:null,p_reply_to:null});if(error)throw error;
    input.value='';await loadSocialMessages();
  }catch(e){toast(phase39FriendlyError(e));}
  finally{if(sendBtn)sendBtn.disabled=false;}
};

createSupportTicket=async function(){
  if(!session)return setStatus('supportStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  const subject=$('supportSubject')?.value.trim()||'',message=$('supportMessage')?.value.trim()||'',category=$('supportCategory')?.value||'other';
  if(subject.length<4||subject.length>120||message.length<10||message.length>2000)return setStatus('supportStatus','Agrega un asunto y una descripción válidos.');
  const btn=document.querySelector('#page-support button[onclick="createSupportTicket()"]');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('create_support_ticket',{p_category:category,p_subject:subject,p_message:message});if(error)throw error;
    $('supportSubject').value='';$('supportMessage').value='';setStatus('supportStatus','Solicitud enviada a soporte.',true);await loadSupportTickets();
  }catch(e){setStatus('supportStatus',phase39FriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
};

async function phase39ReplySupport(ticketId,input,replies){
  const body=input?.value.trim()||'';if(!body)return;
  if(body.length>2000)return toast('La respuesta debe tener máximo 2000 caracteres.');
  const btn=input.parentElement?.querySelector('button');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('reply_support_ticket',{ticket_uuid:ticketId,p_body:body});if(error)throw error;
    input.value='';await loadTicketReplies(ticketId,replies);toast('Respuesta enviada.');
  }catch(e){toast(phase39FriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
}

loadSupportTickets=async function(){
  if(!session||!$('supportList'))return;
  const box=$('supportList');box.innerHTML='<div class="note">Cargando...</div>';
  const {data,error}=await sb.from('support_tickets').select('id,category,subject,message,status,created_at,updated_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50);
  if(error){box.innerHTML=`<div class="empty">${esc(phase39FriendlyError(error))}</div>`;return;}
  box.innerHTML='';
  for(const t of data||[]){
    const card=document.createElement('div');card.className='ticket';
    card.innerHTML=`<div class="row" style="justify-content:space-between"><b>${esc(t.subject)}</b><span class="state">${esc(t.status)}</span></div><div class="note">${esc(t.category)} · ${new Date(t.created_at).toLocaleString()}</div><p>${esc(t.message)}</p>`;
    const replies=document.createElement('div');card.appendChild(replies);loadTicketReplies(t.id,replies);
    if(!['resolved','closed'].includes(String(t.status||'').toLowerCase())){
      const row=document.createElement('div');row.className='row';row.innerHTML='<input maxlength="2000" placeholder="Responder a soporte..."><button class="mini" type="button">Enviar</button>';
      const input=row.querySelector('input');row.querySelector('button').onclick=()=>phase39ReplySupport(t.id,input,replies);card.appendChild(row);
    }
    box.appendChild(card);
  }
  if(!(data||[]).length)box.innerHTML='<div class="empty">No tienes solicitudes de soporte.</div>';
};

function injectPhase39MobileStyles(){
  if($('phase39Styles'))return;
  const s=document.createElement('style');s.id='phase39Styles';s.textContent=`
    .moregrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.moregrid button{min-height:58px;text-align:left}.moregrid .wide{grid-column:1/-1}
    @media(min-width:901px){.phase39-mobile-only{display:none!important}}
    @media(max-width:900px){.bottom button{min-width:0}.modal .card{max-height:86vh;overflow:auto}.moregrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;document.head.appendChild(s);
}

function showMobileMore(){
  const admin=adminRole?'<button class="btn ghost wide" onclick="closeModal();go(\'admin\')">🧰 Administración</button>':'';
  showModal(`<div class="phase39-mobile-only"><div class="pill">Más opciones</div><h2 style="margin-top:8px">TJSDATES</h2><div class="moregrid">
    <button class="btn ghost" onclick="closeModal();go('explore')">✨ Explorar</button><button class="btn ghost" onclick="closeModal();go('plans')">🎉 Planes TJ &amp; SD</button>
    <button class="btn ghost" onclick="closeModal();go('double')">👥 Double Date</button><button class="btn ghost" onclick="closeModal();go('photos')">📷 Fotos</button>
    <button class="btn ghost" onclick="closeModal();go('filters')">⚙️ Filtros</button><button class="btn ghost" onclick="closeModal();go('profile')">👤 Perfil</button>
    <button class="btn ghost" onclick="closeModal();go('safety')">🛡 Seguridad</button><button class="btn ghost" onclick="closeModal();go('privacy')">🔐 Privacidad</button>
    <button class="btn ghost" onclick="closeModal();go('support')">💁 Soporte</button><button class="btn ghost" onclick="closeModal();go('premium')">✦ Premium</button>${admin}</div></div>`);
}

function injectMobileMoreNav(){
  injectPhase39MobileStyles();
  const bottom=document.querySelector('nav.bottom');if(!bottom)return;
  const profileBtn=bottom.querySelector('[data-page="profile"]');if(!profileBtn||profileBtn.dataset.phase39More==='1')return;
  profileBtn.dataset.phase39More='1';profileBtn.dataset.page='more';profileBtn.innerHTML='☰<br>Más';profileBtn.onclick=showMobileMore;
}

function normalizePhase39Labels(){
  document.querySelectorAll('[data-page="plans"]').forEach(b=>{if(b.textContent.includes('Planes TJ'))b.innerHTML='🎉 Planes TJ & SD'});
  document.querySelectorAll('[data-page="double"]').forEach(b=>{if(b.textContent.includes('Double Date'))b.innerHTML='👥 Double Date'});
  const plansTitle=document.querySelector('#page-plans h2');if(plansTitle&&plansTitle.textContent.trim()==='Planes TJ')plansTitle.textContent='Planes TJ & SD';
  const doubleTitle=document.querySelector('#page-double h2');if(doubleTitle&&doubleTitle.textContent.trim()==='Double Date TJ')doubleTitle.textContent='Double Date TJ & SD';
}

const p39Go=go;
go=function(page){
  p39Go(page);normalizePhase39Labels();
  document.querySelectorAll('nav.bottom [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
};

setTimeout(()=>{injectMobileMoreNav();normalizePhase39Labels()},250);
setTimeout(()=>{injectMobileMoreNav();normalizePhase39Labels()},1400);

if(!document.querySelector('script[data-tjs-phase40]')){
  const s=document.createElement('script');s.src='phase40.js?v=1';s.defer=true;s.dataset.tjsPhase40='1';document.body.appendChild(s);
}
