let typingChannel=null,typingTimer=null,deferredInstallPrompt=null,replyingTo=null;

function injectPhaseSixUI(){
  const notif=$('page-notifications');
  if(notif&&!$('notifPrefsCard')){
    const card=document.createElement('div');card.id='notifPrefsCard';card.className='card';card.style.marginTop='14px';
    card.innerHTML=`<h3>Preferencias de notificaciones</h3><div class="togglegrid">
      <label><input id="npMatches" type="checkbox"> Nuevos Matches</label>
      <label><input id="npMessages" type="checkbox"> Nuevos mensajes</label>
      <label><input id="npLikes" type="checkbox"> Nuevos Likes</label>
      <label><input id="npSafety" type="checkbox"> Alertas de seguridad</label>
      <label><input id="npMarketing" type="checkbox"> Novedades de TJSDATES</label>
    </div><div class="row"><button class="btn primary" onclick="saveNotificationPreferences()">Guardar preferencias</button><button class="btn ghost" onclick="requestBrowserNotifications()">Activar avisos del navegador</button></div><div id="notifPrefStatus" class="status"></div>`;
    notif.appendChild(card);
  }
  const profileSection=$('page-profile');
  if(profileSection&&!$('verificationCard')){
    const v=document.createElement('div');v.id='verificationCard';v.className='card';v.style.marginTop='14px';
    v.innerHTML=`<div class="sectionhead"><div><div class="pill">Confianza</div><h3 style="margin:8px 0 0">Verificación de perfil</h3></div><div id="verificationBadge" class="pill">Sin verificar</div></div><p class="note">Solicita revisión de tu perfil. La aprobación solo puede realizarla moderación.</p><button id="verifyBtn" class="btn primary" onclick="requestVerification()">Solicitar verificación</button><div id="verificationStatus" class="status"></div>`;
    profileSection.appendChild(v);
  }
  const safety=$('page-safety');
  if(safety&&!$('installCard')){
    const i=document.createElement('div');i.id='installCard';i.className='card';i.style.marginTop='14px';
    i.innerHTML=`<h3>📱 Instalar TJSDATES</h3><p class="note">Puedes agregar TJSDATES a tu pantalla de inicio como una app.</p><button id="installBtn" class="btn primary" onclick="installPWA()" disabled>Instalar app</button>`;
    safety.appendChild(i);
  }
  const chat=$('chatPanel');
  if(chat&&!$('typingIndicator')){
    const composer=chat.querySelector('.composer');
    const reply=document.createElement('div');reply.id='replyBar';reply.className='replybar hidden';reply.innerHTML='<div><b>Respondiendo</b><div id="replyPreview" class="note"></div></div><button class="mini" onclick="clearReply()">✕</button>';
    chat.insertBefore(reply,composer);
    const t=document.createElement('div');t.id='typingIndicator';t.className='typing hidden';t.textContent='Escribiendo…';chat.insertBefore(t,composer);
    const attach=document.createElement('button');attach.className='btn ghost attachbtn';attach.type='button';attach.textContent='📷';attach.title='Enviar imagen';attach.onclick=()=>$('chatImageInput')?.click();composer.insertBefore(attach,composer.firstChild);
    const file=document.createElement('input');file.id='chatImageInput';file.type='file';file.accept='image/jpeg,image/png,image/webp,image/heic';file.hidden=true;file.onchange=()=>{if(file.files?.[0])uploadChatImage(file.files[0]);file.value=''};composer.appendChild(file);
    $('chatInput')?.addEventListener('input',broadcastTyping);
  }
  const admin=$('page-admin');
  if(admin&&!$('verificationQueueCard')){
    const c=document.createElement('div');c.id='verificationQueueCard';c.className='card';c.style.marginTop='14px';
    c.innerHTML='<h3>Verificaciones pendientes</h3><div id="verificationQueue" class="stack"></div>';
    admin.appendChild(c);
  }
}

async function loadNotificationPreferences(){if(!session)return;const {data}=await sb.from('notification_preferences').select('*').eq('user_id',session.user.id).maybeSingle();const p=data||{new_matches:true,new_messages:true,new_likes:true,safety_alerts:true,marketing:false};if($('npMatches'))$('npMatches').checked=!!p.new_matches;if($('npMessages'))$('npMessages').checked=!!p.new_messages;if($('npLikes'))$('npLikes').checked=!!p.new_likes;if($('npSafety'))$('npSafety').checked=!!p.safety_alerts;if($('npMarketing'))$('npMarketing').checked=!!p.marketing}
async function saveNotificationPreferences(){const payload={user_id:session.user.id,new_matches:$('npMatches').checked,new_messages:$('npMessages').checked,new_likes:$('npLikes').checked,safety_alerts:$('npSafety').checked,marketing:$('npMarketing').checked,updated_at:new Date().toISOString()};const {error}=await sb.from('notification_preferences').upsert(payload);setStatus('notifPrefStatus',error?error.message:'Preferencias guardadas.',!error)}
async function requestBrowserNotifications(){if(!('Notification'in window))return toast('Este navegador no soporta notificaciones.');const p=await Notification.requestPermission();toast(p==='granted'?'Notificaciones del navegador activadas.':'Permiso de notificaciones no concedido.')}

async function loadVerificationStatus(){if(!session||!$('verificationBadge'))return;const {data,error}=await sb.rpc('get_my_verification_status');if(error)return setStatus('verificationStatus',error.message);const v=data?.[0];const badge=$('verificationBadge'),btn=$('verifyBtn');if(!v){badge.textContent='Sin verificar';btn.disabled=false;btn.textContent='Solicitar verificación';return}badge.textContent=v.status==='approved'?'✓ Verificado':v.status==='pending'?'En revisión':'Rechazada';btn.disabled=v.status==='approved'||v.status==='pending';btn.textContent=v.status==='approved'?'Perfil verificado':v.status==='pending'?'Solicitud en revisión':'Volver a solicitar'}
async function requestVerification(){const {error}=await sb.rpc('request_photo_verification');if(error)return setStatus('verificationStatus',error.message);setStatus('verificationStatus','Solicitud enviada a moderación.',true);loadVerificationStatus()}

function messageReceipt(m){if(m.sender_id!==session.user.id)return'';if(m.read_at)return' · ✓✓ leído';if(m.delivered_at)return' · ✓✓ entregado';return' · ✓ enviado'}
function setReplyTo(id,preview){replyingTo={id,preview};if($('replyPreview'))$('replyPreview').textContent=preview||'Mensaje';$('replyBar')?.classList.remove('hidden');$('chatInput')?.focus()}
function clearReply(){replyingTo=null;$('replyBar')?.classList.add('hidden');if($('replyPreview'))$('replyPreview').textContent=''}
async function signedChatMedia(path){if(!path)return'';const {data}=await sb.storage.from('chat-media').createSignedUrl(path,3600);return data?.signedUrl||''}

loadMessages=async function(){
  if(!currentConversation)return;
  await sb.rpc('mark_conversation_read',{cid:currentConversation.id});
  const {data,error}=await sb.from('messages').select('*').eq('conversation_id',currentConversation.id).order('created_at');
  if(error)return toast(error.message);
  const rows=data||[],byId=Object.fromEntries(rows.map(x=>[x.id,x])),b=$('chatBox');b.innerHTML='';
  for(const m of rows){
    const e=document.createElement('div');e.className='msg '+(m.sender_id===session.user.id?'mine':'');
    const replied=m.reply_to_id?byId[m.reply_to_id]:null;
    let media='';if(m.attachment_path){const url=await signedChatMedia(m.attachment_path);if(url)media=`<img class="chatmedia" src="${url}" alt="Imagen enviada">`}
    const preview=(m.body||'Imagen').slice(0,120);
    e.innerHTML=`${replied?`<div class="replyquote">↩ ${esc((replied.body||'Imagen').slice(0,110))}</div>`:''}${media}${m.body?`<div>${esc(m.body)}</div>`:''}<div class="msgmeta"><span>${new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}${messageReceipt(m)}</span><button class="replybtn" type="button">↩</button></div>`;
    e.querySelector('.replybtn').onclick=()=>setReplyTo(m.id,preview);b.appendChild(e)
  }
  b.scrollTop=b.scrollHeight;
};

subscribeChat=function(){
  if(realtimeChannel)sb.removeChannel(realtimeChannel);if(typingChannel)sb.removeChannel(typingChannel);if(!currentConversation)return;
  realtimeChannel=sb.channel('chat-db-'+currentConversation.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${currentConversation.id}`},async p=>{await sb.rpc('mark_conversation_delivered',{cid:currentConversation.id});if(p.new?.sender_id!==session.user.id)await sb.rpc('mark_conversation_read',{cid:currentConversation.id});loadMessages()})
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages',filter:`conversation_id=eq.${currentConversation.id}`},()=>loadMessages()).subscribe();
  typingChannel=sb.channel('typing-'+currentConversation.id,{config:{broadcast:{self:false}}}).on('broadcast',{event:'typing'},payload=>{if(payload.payload?.user_id===session.user.id)return;const el=$('typingIndicator');if(!el)return;el.classList.toggle('hidden',!payload.payload?.typing);clearTimeout(typingTimer);if(payload.payload?.typing)typingTimer=setTimeout(()=>el.classList.add('hidden'),2200)}).subscribe();
};
function broadcastTyping(){if(!typingChannel||!session)return;typingChannel.send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:true}});clearTimeout(window.__tjTypingOff);window.__tjTypingOff=setTimeout(()=>typingChannel?.send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:false}}),1200)}

const baseOpenChat=openChat;
openChat=async function(match,p){clearReply();await baseOpenChat(match,p);if(currentConversation){await sb.rpc('mark_conversation_delivered',{cid:currentConversation.id});await sb.rpc('mark_conversation_read',{cid:currentConversation.id});loadMessages()}}

sendMessage=async function(){
  if(!currentConversation)return;const body=$('chatInput').value.trim();if(!body)return;
  const payload={conversation_id:currentConversation.id,sender_id:session.user.id,body};if(replyingTo?.id)payload.reply_to_id=replyingTo.id;
  const {error}=await sb.from('messages').insert(payload);if(error)return toast(error.message);$('chatInput').value='';clearReply();typingChannel?.send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:false}});loadMessages()
};

async function uploadChatImage(file){
  if(!currentConversation||!file)return;
  if(file.size>10*1024*1024)return toast('La imagen supera el límite de 10 MB.');
  toast('Preparando imagen…');
  try{
    const blob=await compressImage(file),path=`${currentConversation.id}/${session.user.id}/${crypto.randomUUID()}.webp`;
    const up=await sb.storage.from('chat-media').upload(path,blob,{contentType:'image/webp',upsert:false});if(up.error)throw up.error;
    const payload={conversation_id:currentConversation.id,sender_id:session.user.id,body:null,attachment_path:path};if(replyingTo?.id)payload.reply_to_id=replyingTo.id;
    const ins=await sb.from('messages').insert(payload);if(ins.error){await sb.storage.from('chat-media').remove([path]);throw ins.error}
    clearReply();toast('Imagen enviada.');loadMessages();
  }catch(e){toast(e.message||'No se pudo enviar la imagen.')}
}

const baseLoadNotifications=loadNotifications;
loadNotifications=async function(){await baseLoadNotifications();loadNotificationPreferences()}

async function loadAdminVerifications(){if(!adminRole||!$('verificationQueue'))return;const box=$('verificationQueue');box.innerHTML='<div class="note">Cargando...</div>';const {data,error}=await sb.rpc('admin_verification_queue',{lim:50});if(error){box.innerHTML=`<div class="note">${esc(error.message)}</div>`;return}box.innerHTML='';for(const v of data||[]){const d=document.createElement('div');d.className='queueitem';d.innerHTML=`<b>${esc(v.display_name||'Usuario')}</b><p class="note">${esc(v.verification_type||'photo')} · ${new Date(v.created_at).toLocaleString()}</p><div class="row"><button class="mini" onclick="moderateVerification('${v.id}','approved')">Aprobar</button><button class="mini" onclick="moderateVerification('${v.id}','rejected')">Rechazar</button></div>`;box.appendChild(d)}if(!(data||[]).length)box.innerHTML='<div class="empty">Sin verificaciones pendientes.</div>'}
async function moderateVerification(id,decision){const note=prompt('Nota interna opcional:')||null;const {error}=await sb.rpc('admin_moderate_verification',{verification_uuid:id,decision,note});if(error)return toast(error.message);toast(decision==='approved'?'Perfil verificado.':'Verificación rechazada.');loadAdminVerifications()}
const baseLoadAdmin=loadAdmin;
loadAdmin=async function(){await baseLoadAdmin();await loadAdminVerifications()}

const baseGo=go;
go=function(page){baseGo(page);if(page==='notifications')loadNotificationPreferences();if(page==='profile')loadVerificationStatus();if(page==='admin')loadAdminVerifications()}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;const b=$('installBtn');if(b)b.disabled=false});
async function installPWA(){if(!deferredInstallPrompt)return toast('Usa el menú de tu navegador para agregar TJSDATES a la pantalla de inicio.');deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;const b=$('installBtn');if(b)b.disabled=true}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

const phaseObserver=setInterval(()=>{if($('app')){injectPhaseSixUI();clearInterval(phaseObserver)}},100);
setTimeout(()=>{injectPhaseSixUI();if(session){loadVerificationStatus();loadNotificationPreferences()}},700);
