// Phase 75: Double Date moderation and safety controls.
function p75Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

async function p75ReportPerson(conversationId,userId,name){
  const comment=prompt(p75Text(`Describe el problema con ${name||'esta persona'} (opcional).`,`Describe the issue with ${name||'this person'} (optional).`))||'';
  const {error}=await sb.rpc('create_report',{target_user:userId,report_reason:'otro',report_comment:`Double Date ${conversationId}${comment?`\n${comment}`:''}`});
  if(error)return toast(error.message);
  toast(p75Text('Usuario reportado.','User reported.'));
}

async function p75BlockPerson(userId,name){
  if(!confirm(p75Text(`¿Bloquear a ${name||'esta persona'}? Esto puede cerrar el Double Date o el chat de 4.`,`Block ${name||'this person'}? This may close the Double Date or four-person chat.`)))return;
  const {error}=await sb.rpc('block_user',{target_user:userId});
  if(error)return toast(error.message);
  if(typeof closeSocialChat==='function')closeSocialChat();
  toast(p75Text('Usuario bloqueado.','User blocked.'));
  if(typeof loadDoubleDate==='function')await loadDoubleDate();
  if(typeof loadDoubleMatches==='function')await loadDoubleMatches();
}

async function p75OpenPeople(conversationId,title){
  const {data,error}=await sb.rpc('get_double_match_members',{p_conversation_id:conversationId});
  if(error)return toast(error.message);
  const rows=data||[];
  const html=rows.map(m=>{
    const self=!!m.is_me;
    const tags=[];
    if(m.is_my_couple)tags.push(`<span class="pill">${p75Text('Tu pareja','Your pair')}</span>`);
    if(self)tags.push(`<span class="pill">${p75Text('Tú','You')}</span>`);
    const actions=self?'':`<div class="row" style="flex-wrap:wrap"><button class="mini p75block" data-id="${esc(m.user_id)}" data-name="${esc(m.display_name||'')}">${p75Text('Bloquear','Block')}</button><button class="mini p75report" data-id="${esc(m.user_id)}" data-name="${esc(m.display_name||'')}">${p75Text('Reportar','Report')}</button></div>`;
    return `<div class="card" style="margin:8px 0"><div class="row" style="justify-content:space-between;gap:10px"><div><b>${esc(m.display_name||p75Text('Persona','Person'))}</b> ${tags.join(' ')}</div>${actions}</div></div>`;
  }).join('')||`<div class="empty">${p75Text('No hay personas disponibles.','No people available.')}</div>`;
  showModal(`<div><div class="sectionhead"><div><div class="pill">${p75Text('Seguridad Double Date','Double Date safety')}</div><h2>${esc(title||p75Text('Personas','People'))}</h2></div></div><div id="p75people">${html}</div><p class="note">${p75Text('Bloquear a alguien puede cerrar el chat de 4 si ya no es seguro mantener esa conexión.','Blocking someone may close the four-person chat when the connection should no longer remain active.')}</p></div>`);
  setTimeout(()=>{
    document.querySelectorAll('.p75block').forEach(b=>b.onclick=()=>p75BlockPerson(b.dataset.id,b.dataset.name));
    document.querySelectorAll('.p75report').forEach(b=>b.onclick=()=>p75ReportPerson(conversationId,b.dataset.id,b.dataset.name));
  },0);
}

const p75LoadDoubleBase=loadDoubleMatches;
loadDoubleMatches=async function(){
  await p75LoadDoubleBase();
  const box=$('doubleMatches');if(!box)return;
  const {data,error}=await sb.rpc('get_my_double_matches');
  if(error)return;
  const rows=data||[];
  const cards=[...box.querySelectorAll('.plancard')];
  rows.forEach((m,i)=>{
    const card=cards[i];if(!card)return;
    const existing=card.querySelector('.p75people');if(existing)return;
    const btn=document.createElement('button');btn.className='btn ghost p75people';btn.textContent='👥 '+p75Text('Personas','People');
    btn.onclick=()=>p75OpenPeople(m.conversation_id,`${m.member_one_name||p75Text('Pareja','Pair')} + ${m.member_two_name||''}`);
    const controls=card.querySelector('button')?.parentElement||card;
    controls.appendChild(btn);
  });
};

window.__TJSDATES_DOUBLE_DATE_MODERATION_READY=true;
