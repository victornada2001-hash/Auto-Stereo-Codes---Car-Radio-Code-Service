// Phase 23: secure support and report evidence browser flows.

createSupportTicket=async function(){
  if(!session)return;
  const subject=$('supportSubject')?.value.trim()||'';
  const message=$('supportMessage')?.value.trim()||'';
  const category=$('supportCategory')?.value||'other';
  if(subject.length<4||message.length<10)return setStatus('supportStatus','Agrega un asunto y una descripción más completa.');
  const btn=document.querySelector('#page-support button[onclick="createSupportTicket()"]');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('create_support_ticket',{p_category:category,p_subject:subject,p_message:message});
    if(error)throw error;
    $('supportSubject').value='';$('supportMessage').value='';
    setStatus('supportStatus','Solicitud enviada a soporte.',true);
    await loadSupportTickets();
  }catch(e){setStatus('supportStatus',e.message||'No se pudo enviar la solicitud.');}
  finally{if(btn)btn.disabled=false;}
};

async function sendSecureSupportReply(ticketId,row,replies){
  const input=row?.querySelector('input');
  const body=input?.value.trim()||'';
  if(!body)return;
  const btn=row?.querySelector('button');if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('reply_support_ticket',{ticket_uuid:ticketId,p_body:body});
    if(error)throw error;
    input.value='';
    await loadTicketReplies(ticketId,replies);
  }catch(e){toast(e.message||'No se pudo enviar la respuesta.');}
  finally{if(btn)btn.disabled=false;input?.focus();}
}

const p23LoadSupportTickets=loadSupportTickets;
loadSupportTickets=async function(){
  await p23LoadSupportTickets();
  const box=$('supportList');if(!box||!session)return;
  const cards=box.querySelectorAll('.ticket');
  const {data,error}=await sb.from('support_tickets').select('id,status').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50);
  if(error)return;
  (data||[]).forEach((t,i)=>{
    const card=cards[i];if(!card)return;
    // phase9 may already have appended the reply UI. Replace its send handler with the secure RPC.
    const replies=[...card.children].find(x=>x.querySelector?.('.supportreply'))||card.querySelector('.support-replies-host');
    let host=replies;
    if(!host){host=document.createElement('div');host.className='support-replies-host';card.appendChild(host);loadTicketReplies(t.id,host)}
    const existingRows=[...card.querySelectorAll('.row')].filter(r=>r.querySelector('input[placeholder="Responder a soporte..."]'));
    for(const row of existingRows){
      const b=row.querySelector('button');if(b)b.onclick=()=>sendSecureSupportReply(t.id,row,host);
    }
  });
};

uploadReportEvidence=async function(reportId){
  let uploaded=0;
  for(const file of pendingReportFiles){
    if(file.size>10*1024*1024)throw new Error(`${file.name}: supera 10 MB`);
    const isPdf=file.type==='application/pdf';
    if(!isPdf&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error(`${file.name}: formato no permitido`);
    const body=isPdf?file:await compressImage(file);
    const ext=isPdf?'pdf':'webp';
    const path=`${session.user.id}/${reportId}/${crypto.randomUUID()}.${ext}`;
    const up=await sb.storage.from('report-evidence').upload(path,body,{contentType:isPdf?'application/pdf':'image/webp',upsert:false});
    if(up.error)throw up.error;
    const reg=await sb.rpc('register_report_evidence',{report_uuid:reportId,p_storage_path:path});
    if(reg.error){await sb.storage.from('report-evidence').remove([path]);throw reg.error}
    uploaded++;
  }
  return uploaded;
};

setTimeout(()=>{
  if(session&&$('page-support')&&!$('page-support').classList.contains('hidden'))loadSupportTickets();
},700);

if(!document.querySelector('script[data-tjs-phase24]')){
  const phase24Script=document.createElement('script');
  phase24Script.src='phase24.js?v=1';
  phase24Script.defer=true;
  phase24Script.dataset.tjsPhase24='1';
  document.body.appendChild(phase24Script);
}
