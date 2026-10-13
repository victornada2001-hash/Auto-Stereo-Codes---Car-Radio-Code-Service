function phase19FriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(m.includes('rate_limit_exceeded'))return'Has realizado demasiadas acciones en poco tiempo. Espera un momento e inténtalo nuevamente.';
  if(m.includes('rewind requires'))return'Deshacer requiere TJ Plus o superior.';
  if(m.includes('cannot rewind matched like'))return'No puedes deshacer un Like que ya creó un Match.';
  if(m.includes('no recent action'))return'No hay una acción reciente para deshacer.';
  if(m.includes('already liked'))return'Ya habías dado Like a este perfil.';
  if(m.includes('profile unavailable'))return'Este perfil ya no está disponible.';
  if(m.includes('interaction not allowed'))return'No puedes interactuar con este perfil.';
  return err?.message||'No se pudo completar la acción.';
}

passCurrent=async function(){
  const c=candidates[candidateIndex];if(!c)return;
  try{
    const {error}=await sb.rpc('create_pass',{target_user:c.id});if(error)throw error;
    lastAction={type:'pass',id:c.id};animateOut(-1);
  }catch(e){toast(phase19FriendlyError(e));}
};

undoLast=async function(){
  try{
    const {data,error}=await sb.rpc('undo_last_swipe');if(error)throw error;
    const r=data?.[0];lastAction=null;
    await loadDiscovery();
    toast(r?.action_type==='like'?'Like deshecho.':'Perfil recuperado.');
  }catch(e){toast(phase19FriendlyError(e));}
};

confirmBlockCurrent=async function(){
  const id=currentConversation?.other?.id;if(!id)return;
  const {error}=await sb.rpc('block_user',{target_user:id});if(error)return toast(error.message);
  closeModal();
  $('chatPanel')?.classList.add('hidden');
  currentConversation=null;
  await Promise.allSettled([loadMatches(),loadDiscovery(),refreshBadges()]);
  toast('Usuario bloqueado y conversación cerrada.');
};

setTimeout(()=>{
  const undoButtons=[...document.querySelectorAll('button')].filter(b=>/deshacer|rewind/i.test(b.textContent||''));
  for(const b of undoButtons)b.title='Recupera tu última acción disponible';
},700);
