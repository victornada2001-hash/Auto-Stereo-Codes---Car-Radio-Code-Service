// Phase 69: force support ticket creation through the hardened RPC.
function p69Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}
function p69SupportError(err){
  const m=String(err?.message||err||'');
  if(m.includes('rate_limit_exceeded'))return p69Text('Has enviado demasiadas solicitudes. Intenta más tarde.','You have sent too many requests. Try again later.');
  if(m.includes('category_unavailable_for_restricted_account'))return p69Text('Con tu cuenta restringida solo puedes usar Cuenta, Seguridad, Técnico o Pagos.','With a restricted account you can only use Account, Safety, Technical or Billing.');
  if(m.includes('invalid_subject'))return p69Text('El asunto debe tener entre 4 y 120 caracteres.','The subject must be 4 to 120 characters.');
  if(m.includes('invalid_message'))return p69Text('El mensaje debe tener entre 10 y 2000 caracteres.','The message must be 10 to 2000 characters.');
  return err?.message||p69Text('No se pudo enviar la solicitud.','Could not send the request.');
}

createSupportTicket=async function(){
  if(!session)return;
  const subject=$('supportSubject')?.value.trim()||'';
  const message=$('supportMessage')?.value.trim()||'';
  const category=$('supportCategory')?.value||'technical';
  if(subject.length<4||message.length<10)return setStatus('supportStatus',p69Text('Agrega un asunto y una descripción más completa.','Add a subject and a more complete description.'));
  try{
    const {error}=await sb.rpc('create_support_ticket',{p_category:category,p_subject:subject,p_message:message});
    if(error)throw error;
    if($('supportSubject'))$('supportSubject').value='';
    if($('supportMessage'))$('supportMessage').value='';
    setStatus('supportStatus',p69Text('Solicitud enviada a soporte.','Support request sent.'),true);
    if(typeof loadSupportTickets==='function')await loadSupportTickets();
  }catch(e){
    setStatus('supportStatus',p69SupportError(e));
  }
};
createSupportTicket.__tjsSecure=true;
window.__TJSDATES_SUPPORT_RPC_READY=true;
