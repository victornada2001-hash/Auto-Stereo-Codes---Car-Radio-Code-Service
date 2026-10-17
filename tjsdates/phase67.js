// Phase 67: private, membership-authorized typing broadcasts with minimal payloads.
let p67Sending=false;

subscribeChat=function(){
  if(realtimeChannel)sb.removeChannel(realtimeChannel);
  if(typingChannel)sb.removeChannel(typingChannel);
  if(!currentConversation)return;

  realtimeChannel=sb.channel('chat-db-'+currentConversation.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${currentConversation.id}`},async p=>{
      await sb.rpc('mark_conversation_delivered',{cid:currentConversation.id});
      if(p.new?.sender_id!==session.user.id)await sb.rpc('mark_conversation_read',{cid:currentConversation.id});
      loadMessages();
    })
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages',filter:`conversation_id=eq.${currentConversation.id}`},()=>loadMessages())
    .subscribe();

  typingChannel=sb.channel('typing-'+currentConversation.id,{config:{private:true,broadcast:{self:false}}})
    .on('broadcast',{event:'typing'},payload=>{
      const el=$('typingIndicator');if(!el)return;
      const active=!!payload.payload?.typing;
      el.classList.toggle('hidden',!active);
      clearTimeout(typingTimer);
      if(active)typingTimer=setTimeout(()=>el.classList.add('hidden'),2200);
    })
    .subscribe(status=>{
      if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')$('typingIndicator')?.classList.add('hidden');
    });
};

broadcastTyping=function(){
  if(!typingChannel||!session||!currentConversation)return;
  typingChannel.send({type:'broadcast',event:'typing',payload:{typing:true}});
  clearTimeout(window.__tjTypingOff);
  window.__tjTypingOff=setTimeout(()=>typingChannel?.send({type:'broadcast',event:'typing',payload:{typing:false}}),1200);
};

sendMessage=async function(){
  if(p67Sending||!currentConversation)return;
  const input=$('chatInput'),body=input?.value.trim()||'';
  if(!body)return;
  p67Sending=true;
  try{
    const {error}=await sb.rpc('send_message',{cid:currentConversation.id,p_body:body,p_attachment_path:null,p_reply_to:replyingTo?.id||null});
    if(error)throw error;
    if(input)input.value='';
    clearReply();
    typingChannel?.send({type:'broadcast',event:'typing',payload:{typing:false}});
    await loadMessages();
  }catch(e){
    toast(typeof phase20FriendlyError==='function'?phase20FriendlyError(e):(e?.message||'No se pudo completar la acción.'));
  }finally{
    p67Sending=false;
  }
};
// Prevent Phase 47's delayed installer from wrapping this function with the same logical lock again.
sendMessage.__tjs47Wrapped=true;

window.__TJSDATES_PRIVATE_TYPING_READY=true;
