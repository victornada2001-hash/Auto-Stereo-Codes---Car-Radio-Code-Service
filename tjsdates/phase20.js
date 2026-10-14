function phase20FriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(m.includes('rate_limit_exceeded'))return'Has enviado demasiados mensajes en poco tiempo. Espera un momento.';
  if(m.includes('forbidden'))return'Esta conversación ya no está disponible.';
  if(m.includes('invalid reply'))return'El mensaje al que respondes ya no está disponible.';
  if(m.includes('invalid attachment'))return'No se pudo validar la imagen adjunta.';
  if(m.includes('empty message'))return'Escribe un mensaje o adjunta una imagen.';
  return err?.message||'No se pudo completar la acción.';
}

sendMessage=async function(){
  if(!currentConversation)return;
  const input=$('chatInput'),body=input?.value.trim()||'';
  if(!body)return;
  try{
    const {error}=await sb.rpc('send_message',{cid:currentConversation.id,p_body:body,p_attachment_path:null,p_reply_to:replyingTo?.id||null});
    if(error)throw error;
    if(input)input.value='';
    clearReply();
    typingChannel?.send({type:'broadcast',event:'typing',payload:{user_id:session.user.id,typing:false}});
    await loadMessages();
  }catch(e){toast(phase20FriendlyError(e));}
};

uploadChatImage=async function(file){
  if(!currentConversation||!file)return;
  if(file.size>10*1024*1024)return toast('La imagen supera el límite de 10 MB.');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return toast('Usa JPEG, PNG o WebP.');
  toast('Preparando imagen…');
  let path=null;
  try{
    const blob=await compressImage(file);
    path=`${currentConversation.id}/${session.user.id}/${crypto.randomUUID()}.webp`;
    const up=await sb.storage.from('chat-media').upload(path,blob,{contentType:'image/webp',upsert:false});
    if(up.error)throw up.error;
    const {error}=await sb.rpc('send_message',{cid:currentConversation.id,p_body:null,p_attachment_path:path,p_reply_to:replyingTo?.id||null});
    if(error)throw error;
    clearReply();toast('Imagen enviada.');await loadMessages();
  }catch(e){
    if(path)await sb.storage.from('chat-media').remove([path]).catch(()=>{});
    toast(phase20FriendlyError(e));
  }
};

unmatchCurrent=async function(){
  const matchId=currentConversation?.match?.id;
  if(!matchId)return toast('No se encontró el Match.');
  const other=currentConversation?.other?.display_name||'esta persona';
  if(!confirm(`¿Cancelar tu Match con ${other}? El chat se cerrará para ambos.`))return;
  try{
    const {data,error}=await sb.rpc('unmatch',{match_uuid:matchId});
    if(error)throw error;
    if(!data)return toast('Este Match ya no estaba activo.');
    if(realtimeChannel){sb.removeChannel(realtimeChannel);realtimeChannel=null;}
    if(typingChannel){sb.removeChannel(typingChannel);typingChannel=null;}
    $('chatPanel')?.classList.add('hidden');
    currentConversation=null;
    await Promise.allSettled([loadMatches(),loadDiscovery(),refreshBadges()]);
    toast('Match cancelado.');
  }catch(e){toast(phase20FriendlyError(e));}
};

async function loadMatchHistory(){
  if(!session)return;
  let box=$('matchHistory');
  if(!box){
    const sec=$('page-matches');if(!sec)return;
    const card=document.createElement('div');card.className='card';card.style.marginTop='14px';
    card.innerHTML='<h3>Historial reciente</h3><p class="note">Aquí aparecen Matches terminados o cancelados. No se reabre el chat desde este historial.</p><div id="matchHistory" class="stack"></div>';
    sec.appendChild(card);box=$('matchHistory');
  }
  const {data,error}=await sb.rpc('get_my_match_history',{lim:30});
  if(error){box.innerHTML=`<div class="note">${esc(error.message)}</div>`;return;}
  box.innerHTML='';
  for(const r of data||[]){
    const d=document.createElement('div');d.className='queueitem';
    const label=r.match_status==='unmatched'?'Match cancelado':'Match terminado';
    d.innerHTML=`<b>${esc(r.display_name||'Usuario')}</b><p class="note">${esc(r.city||'')} · ${label}${r.ended_at?' · '+new Date(r.ended_at).toLocaleDateString():''}</p>`;
    box.appendChild(d);
  }
  if(!(data||[]).length)box.innerHTML='<div class="empty">Aún no tienes Matches terminados.</div>';
}

const p20LoadMatches=loadMatches;
loadMatches=async function(){await p20LoadMatches();await loadMatchHistory();};

const p20Go=go;
go=function(page){p20Go(page);if(page==='matches')setTimeout(loadMatchHistory,60);};

setTimeout(()=>{
  const input=$('chatImageInput');if(input)input.accept='image/jpeg,image/png,image/webp';
  if(session)loadMatchHistory();
},900);

if(!document.querySelector('script[data-tjs-phase21]')){
  const phase21Script=document.createElement('script');
  phase21Script.src='phase21.js?v=1';
  phase21Script.defer=true;
  phase21Script.dataset.tjsPhase21='1';
  document.body.appendChild(phase21Script);
}
