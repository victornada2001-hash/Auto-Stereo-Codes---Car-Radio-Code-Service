function phase21FriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(m.includes('rate_limit_exceeded'))return'Has realizado demasiadas acciones en poco tiempo. Espera un momento.';
  if(m.includes('daily like limit'))return'Llegaste al límite diario de Likes de tu plan.';
  if(m.includes('profile unavailable'))return'Este perfil ya no está disponible.';
  if(m.includes('interaction not allowed'))return'No puedes interactuar con este perfil.';
  if(m.includes('forbidden'))return'Esta conversación ya no está disponible.';
  return err?.message||'No se pudo completar la acción.';
}

// Explore used a legacy direct INSERT with like_type="standard". Route it through
// the same protected RPC used by the main discovery deck.
exploreLike=async function(userId,btn){
  if(!session||!userId)return;
  if(btn)btn.disabled=true;
  try{
    const {data,error}=await sb.rpc('create_like',{target_user:userId,p_like_type:'like'});
    if(error)throw error;
    const r=data?.[0]||{};
    if(btn)btn.textContent=r.match_created?'🎉 ¡Match!':'✓ Like enviado';
    toast(r.match_created?'¡Nuevo Match! Ya pueden conversar.':'Like enviado. Si es recíproco aparecerá en Matches.');
    await Promise.allSettled([loadMatches(),refreshBadges()]);
  }catch(e){
    if(btn)btn.disabled=false;
    toast(phase21FriendlyError(e));
  }
};

// Group/Double-Date chat used a direct messages INSERT, which is intentionally
// revoked. Send through the validated server RPC instead.
sendSocialMessage=async function(){
  if(!socialConversationId||!session)return;
  const input=$('socialChatInput');
  const body=input?.value.trim();
  if(!body)return;
  const btn=input?.parentElement?.querySelector('button');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('send_message',{cid:socialConversationId,p_body:body,p_attachment_path:null,p_reply_to:null});
    if(error)throw error;
    input.value='';
    await loadSocialMessages();
  }catch(e){toast(phase21FriendlyError(e));}
  finally{if(btn)btn.disabled=false;input?.focus();}
};

function polishRegionalLabels(){
  document.querySelectorAll('[data-page="plans"]').forEach(b=>{if(/Planes TJ/.test(b.textContent||''))b.innerHTML='🎉 Planes TJ & SD'});
  const planTitle=document.querySelector('#page-plans h2');if(planTitle&&planTitle.textContent.trim()==='Planes TJ')planTitle.textContent='Planes TJ & SD';
  const doubleTitle=document.querySelector('#page-double h2');if(doubleTitle&&doubleTitle.textContent.trim()==='Double Date TJ')doubleTitle.textContent='Double Date TJ & SD';
}

setTimeout(polishRegionalLabels,400);
const p21Go=go;
go=function(page){p21Go(page);if(page==='plans'||page==='double')setTimeout(polishRegionalLabels,40)};
