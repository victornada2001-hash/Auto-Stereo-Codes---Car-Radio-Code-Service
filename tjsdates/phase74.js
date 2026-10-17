// Phase 74: moderation controls for TJ/SD group plans.
function p74Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

async function p74ReportPlan(groupId,title){
  const comment=prompt(p74Text(`Describe el problema con el plan "${title||''}" (opcional).`,`Describe the issue with plan "${title||''}" (optional).`))||'';
  const {error}=await sb.rpc('report_group_plan',{group_uuid:groupId,report_reason:'otro',report_comment:comment});
  if(error)return toast(error.message);
  toast(p74Text('Plan reportado a moderación.','Plan reported to moderation.'));
}

async function p74ReportMember(groupId,userId,name){
  const comment=prompt(p74Text(`Describe el problema con ${name||'esta persona'} (opcional).`,`Describe the issue with ${name||'this person'} (optional).`))||'';
  const {error}=await sb.rpc('create_report',{target_user:userId,report_reason:'otro',report_comment:`Plan ${groupId}${comment?`\n${comment}`:''}`});
  if(error)return toast(error.message);
  toast(p74Text('Usuario reportado.','User reported.'));
}

async function p74BlockMember(userId,name){
  if(!confirm(p74Text(`¿Bloquear a ${name||'esta persona'}? Dejarás de ver sus mensajes.`,`Block ${name||'this person'}? You will stop seeing their messages.`)))return;
  const {error}=await sb.rpc('block_user',{target_user:userId});
  if(error)return toast(error.message);
  toast(p74Text('Usuario bloqueado.','User blocked.'));
  if(typeof loadSocialMessages==='function'&&socialConversationId)await loadSocialMessages();
  if(typeof loadPlansTJ==='function')await loadPlansTJ();
}

async function p74RemoveMember(groupId,userId,name){
  if(!confirm(p74Text(`¿Expulsar a ${name||'esta persona'} del plan?`,`Remove ${name||'this person'} from the plan?`)))return;
  const {error}=await sb.rpc('remove_group_member',{group_uuid:groupId,target_user:userId});
  if(error)return toast(error.message);
  toast(p74Text('Participante expulsado.','Participant removed.'));
  await p74OpenMembers(groupId,null,true);
  if(typeof loadPlansTJ==='function')await loadPlansTJ();
}

async function p74OpenMembers(groupId,title,isOwner=false){
  const {data,error}=await sb.rpc('get_group_members',{group_uuid:groupId});
  if(error)return toast(error.message);
  const rows=data||[];
  const mine=session?.user?.id;
  const html=rows.map(m=>{
    const self=m.user_id===mine;
    const actions=[];
    if(!self){
      actions.push(`<button class="mini p74block" data-id="${esc(m.user_id)}" data-name="${esc(m.display_name||'')}">${p74Text('Bloquear','Block')}</button>`);
      actions.push(`<button class="mini p74report" data-id="${esc(m.user_id)}" data-name="${esc(m.display_name||'')}">${p74Text('Reportar','Report')}</button>`);
      if(isOwner&&!m.is_owner)actions.push(`<button class="mini p74remove" data-id="${esc(m.user_id)}" data-name="${esc(m.display_name||'')}">${p74Text('Expulsar','Remove')}</button>`);
    }
    return `<div class="card" style="margin:8px 0"><div class="row" style="justify-content:space-between;gap:10px"><div><b>${esc(m.display_name||p74Text('Participante','Participant'))}</b>${m.is_owner?` <span class="pill">${p74Text('Organizador','Host')}</span>`:''}${self?` <span class="pill">${p74Text('Tú','You')}</span>`:''}</div><div class="row" style="flex-wrap:wrap">${actions.join('')}</div></div></div>`;
  }).join('')||`<div class="empty">${p74Text('No hay participantes disponibles.','No participants available.')}</div>`;
  showModal(`<div><div class="sectionhead"><div><div class="pill">${p74Text('Seguridad del plan','Plan safety')}</div><h2>${esc(title||p74Text('Participantes','Participants'))}</h2></div></div><div id="p74members">${html}</div></div>`);
  setTimeout(()=>{
    document.querySelectorAll('.p74block').forEach(b=>b.onclick=()=>p74BlockMember(b.dataset.id,b.dataset.name));
    document.querySelectorAll('.p74report').forEach(b=>b.onclick=()=>p74ReportMember(groupId,b.dataset.id,b.dataset.name));
    document.querySelectorAll('.p74remove').forEach(b=>b.onclick=()=>p74RemoveMember(groupId,b.dataset.id,b.dataset.name));
  },0);
}

const p74LoadPlansBase=loadPlansTJ;
loadPlansTJ=async function(){
  await p74LoadPlansBase();
  const box=$('plansList');if(!box)return;
  const {data}=await sb.rpc('get_group_plans',{plan_limit:50});
  const rows=data||[];
  const cards=[...box.querySelectorAll('.plancard')];
  rows.forEach((g,i)=>{
    const card=cards[i];if(!card)return;
    const outer=card.lastElementChild;if(!outer)return;
    const controls=outer.firstElementChild?.classList?.contains('row')?outer.firstElementChild:outer;
    if(g.joined||g.is_owner){
      const members=document.createElement('button');members.className='btn ghost';members.textContent='👥 '+p74Text('Participantes','Participants');members.onclick=()=>p74OpenMembers(g.id,g.title,!!g.is_owner);controls.appendChild(members);
    }
    if(!g.is_owner){
      const report=document.createElement('button');report.className='btn ghost';report.textContent='⚑ '+p74Text('Reportar','Report');report.onclick=()=>p74ReportPlan(g.id,g.title);controls.appendChild(report);
    }
  });
};

window.__TJSDATES_GROUP_MODERATION_READY=true;
(function(){if(document.querySelector('script[data-tjs-phase="75"]'))return;const s=document.createElement('script');s.src='/phase75.js';s.defer=true;s.dataset.tjsPhase='75';document.body.appendChild(s)})();
