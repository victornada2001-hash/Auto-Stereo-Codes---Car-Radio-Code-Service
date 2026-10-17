// Phase 73: complete TJ/SD plan lifecycle controls.
function p73Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

async function closePlanTJ(id,title){
  if(!id)return;
  const label=title||p73Text('este plan','this plan');
  if(!confirm(p73Text(`¿Cerrar ${label}? Todos los participantes perderán acceso al chat del plan.`,`Close ${label}? All participants will lose access to this plan chat.`)))return;
  const {error}=await sb.rpc('close_group_plan',{group_uuid:id});
  if(error)return toast(error.message);
  if(typeof closeSocialChat==='function')closeSocialChat();
  toast(p73Text('Plan cerrado.','Plan closed.'));
  await loadPlansTJ();
}

loadPlansTJ=async function(){
  if(!session||!$('plansList'))return;
  const box=$('plansList');box.innerHTML=`<div class="note">${p73Text('Cargando planes...','Loading plans...')}</div>`;
  const {data,error}=await sb.rpc('get_group_plans',{plan_limit:50});
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  const rows=data||[];box.innerHTML='';
  for(const g of rows){
    const d=document.createElement('div');d.className='card plancard';
    const started=new Date(g.starts_at).getTime()<Date.now();
    let controls='';
    if(g.is_owner){
      controls=`<div class="row" style="justify-content:flex-end;flex-wrap:wrap"><span class="pill">${p73Text('Tu plan','Your plan')}</span><button class="btn ghost p73chat">💬 ${p73Text('Chat','Chat')}</button><button class="btn danger p73close">${p73Text('Cerrar plan','Close plan')}</button></div>`;
    }else if(g.joined){
      controls=`<div class="row" style="justify-content:flex-end;flex-wrap:wrap"><button class="btn ghost p73chat">💬 ${p73Text('Chat','Chat')}</button><button class="btn ghost p73leave">${p73Text('Salir','Leave')}</button></div>`;
    }else{
      controls=`<button class="btn primary p73join">${p73Text('Unirme','Join')}</button>`;
    }
    d.innerHTML=`<div><h3>${esc(g.title)}</h3><div class="meta">📍 ${esc(g.city)} · 🗓 ${new Date(g.starts_at).toLocaleString()} · 👥 ${g.member_count}/${g.max_members}</div>${started?`<div class="pill" style="margin-top:8px">${p73Text('Ya inició · solo visible para miembros','Started · visible to members only')}</div>`:''}<p>${esc(g.description||'')}</p></div><div>${controls}</div>`;
    d.querySelector('.p73chat')?.addEventListener('click',()=>openPlanChat(g.id,g.title));
    d.querySelector('.p73close')?.addEventListener('click',()=>closePlanTJ(g.id,g.title));
    d.querySelector('.p73leave')?.addEventListener('click',()=>leavePlanTJ(g.id));
    d.querySelector('.p73join')?.addEventListener('click',()=>joinPlanTJ(g.id));
    box.appendChild(d);
  }
  if(!rows.length)box.innerHTML=`<div class="empty">${p73Text('Todavía no hay planes próximos. Crea el primero.','There are no upcoming plans yet. Create the first one.')}</div>`;
};

window.__TJSDATES_PLAN_LIFECYCLE_READY=true;
if(!document.querySelector('script[data-tjs-phase74]')){const s=document.createElement('script');s.src='phase74.js?v=1';s.defer=true;s.dataset.tjsPhase74='1';document.body.appendChild(s)}
