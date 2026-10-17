// Phase 70: secure group chat sends and support replies through server RPCs.
function p70Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}
function p70Friendly(err){
  const m=String(err?.message||err||'');
  if(m.includes('rate_limit_exceeded'))return p70Text('Has realizado demasiadas acciones. Intenta más tarde.','You have made too many requests. Try again later.');
  if(m.includes('forbidden'))return p70Text('Esta conversación ya no está disponible.','This conversation is no longer available.');
  if(m.includes('ticket_closed'))return p70Text('Este ticket ya está cerrado.','This ticket is already closed.');
  if(m.includes('ticket_not_found'))return p70Text('No se encontró este ticket.','This ticket was not found.');
  if(m.includes('invalid_message'))return p70Text('Revisa el contenido del mensaje.','Check the message content.');
  return err?.message||p70Text('No se pudo completar la acción.','Could not complete the action.');
}

sendSocialMessage=async function(){
  if(!socialConversationId)return;
  const input=$('socialChatInput'),body=input?.value.trim()||'';
  if(!body)return;
  try{
    const {error}=await sb.rpc('send_message',{cid:socialConversationId,p_body:body,p_attachment_path:null,p_reply_to:null});
    if(error)throw error;
    if(input)input.value='';
    await loadSocialMessages();
  }catch(e){toast(p70Friendly(e));}
};
sendSocialMessage.__tjs47Wrapped=true;

async function p70ReplySupport(ticketId,input,replies){
  const body=input?.value.trim()||'';if(!body)return;
  try{
    const {error}=await sb.rpc('reply_support_ticket',{ticket_uuid:ticketId,p_body:body});
    if(error)throw error;
    input.value='';
    await loadTicketReplies(ticketId,replies);
  }catch(e){toast(p70Friendly(e));}
}

const p70Support=typeof loadSupportTickets==='function'?loadSupportTickets:null;
if(p70Support)loadSupportTickets=async function(...args){
  const r=await p70Support.apply(this,args);
  const box=$('supportList');if(!box||!session)return r;
  const {data}=await sb.from('support_tickets').select('id,status').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50);
  const cards=[...box.querySelectorAll('.ticket')];
  (data||[]).forEach((t,i)=>{
    const card=cards[i];if(!card)return;
    const rows=[...card.querySelectorAll('.row')];
    for(const row of rows){
      const input=row.querySelector('input[placeholder="Responder a soporte..."]');
      const btn=input&&row.querySelector('button');
      if(input&&btn){
        const replies=row.previousElementSibling;
        if(replies)btn.onclick=()=>p70ReplySupport(t.id,input,replies);
      }
    }
  });
  return r;
};

window.__TJSDATES_SOCIAL_SUPPORT_RPC_READY=true;

if(!document.querySelector('script[data-tjs-phase71]')){
  const s=document.createElement('script');s.src='phase71.js?v=1';s.defer=true;s.dataset.tjsPhase71='1';document.body.appendChild(s);
}
