let tjOnlineBanner=null;

function ensureOnlineBanner(){
  if(tjOnlineBanner)return tjOnlineBanner;
  tjOnlineBanner=document.createElement('div');
  tjOnlineBanner.id='onlineBanner';
  tjOnlineBanner.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9999;padding:10px 16px;border-radius:999px;background:#2b1320;border:1px solid #7a2d4c;color:#fff;font-weight:800;box-shadow:0 10px 30px #0006;display:none';
  tjOnlineBanner.textContent='Sin conexión. Algunas funciones estarán disponibles al volver internet.';
  document.body.appendChild(tjOnlineBanner);
  return tjOnlineBanner;
}
function refreshConnectivity(){const b=ensureOnlineBanner();b.style.display=navigator.onLine?'none':'block'}
window.addEventListener('online',()=>{refreshConnectivity();if(typeof toast==='function')toast('Conexión restablecida.');});
window.addEventListener('offline',refreshConnectivity);
window.addEventListener('error',e=>{console.error('TJSDATES UI error',e.error||e.message);});
window.addEventListener('unhandledrejection',e=>{console.error('TJSDATES async error',e.reason);});
setTimeout(refreshConnectivity,300);

function ensureSocialChatHost(pageId){
  let card=$('planChatCard');
  const host=$(pageId);
  if(card&&host&&!host.contains(card))host.appendChild(card);
  return card;
}

openPlanChat=async function(groupId,title){
  const {data,error}=await sb.rpc('get_group_conversation',{group_uuid:groupId});
  if(error)return toast(error.message);
  if(!data)return toast('Únete al plan para abrir el chat.');
  const card=ensureSocialChatHost('page-plans');
  socialConversationId=data;
  card?.classList.remove('hidden');
  if($('planChatTitle'))$('planChatTitle').textContent=title||'Conversación del plan';
  await loadSocialMessages();
  subscribeSocialChat();
  card?.scrollIntoView({behavior:'smooth',block:'start'});
};

openDoubleChat=async function(cid,title){
  socialConversationId=cid;
  go('double');
  const card=ensureSocialChatHost('page-double');
  card?.classList.remove('hidden');
  if($('planChatTitle'))$('planChatTitle').textContent=title||'Double Date';
  await loadSocialMessages();
  subscribeSocialChat();
  card?.scrollIntoView({behavior:'smooth',block:'start'});
};

async function closePlanTJ(id){
  if(!confirm('¿Cerrar este plan? Ya no aceptará participantes nuevos.'))return;
  const {error}=await sb.rpc('close_group_plan',{group_uuid:id});
  if(error)return toast(error.message);
  if(socialConversationId)closeSocialChat();
  toast('Plan cerrado.');
  loadPlansTJ();
}

loadPlansTJ=async function(){
  if(!session||!$('plansList'))return;
  const box=$('plansList');
  box.innerHTML='<div class="note">Cargando planes...</div>';
  const {data,error}=await sb.rpc('get_group_plans',{plan_limit:50});
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  const rows=data||[];
  box.innerHTML='';
  for(const g of rows){
    const d=document.createElement('div');
    d.className='card plancard';
    const joined=!!g.joined||!!g.is_owner;
    const actions=document.createElement('div');
    actions.className='row';
    actions.style.justifyContent='flex-end';
    actions.style.flexWrap='wrap';
    if(g.is_owner){
      const own=document.createElement('span');own.className='pill';own.textContent='Tu plan';actions.appendChild(own);
      const close=document.createElement('button');close.className='btn danger';close.textContent='Cerrar plan';close.onclick=()=>closePlanTJ(g.id);actions.appendChild(close);
    }else if(g.joined){
      const leave=document.createElement('button');leave.className='btn ghost';leave.textContent='Salir';leave.onclick=()=>leavePlanTJ(g.id);actions.appendChild(leave);
    }else{
      const join=document.createElement('button');join.className='btn primary';join.textContent='Unirme';join.onclick=()=>joinPlanTJ(g.id);actions.appendChild(join);
    }
    if(joined&&g.conversation_id){
      const chat=document.createElement('button');chat.className='btn ghost';chat.textContent='💬 Chat';chat.onclick=()=>openPlanChat(g.id,g.title);actions.appendChild(chat);
    }
    const info=document.createElement('div');
    info.innerHTML=`<h3>${esc(g.title)}</h3><div class="meta">📍 ${esc(g.city)} · 🗓 ${new Date(g.starts_at).toLocaleString()} · 👥 ${g.member_count}/${g.max_members}</div><p>${esc(g.description||'')}</p>`;
    d.appendChild(info);d.appendChild(actions);box.appendChild(d);
  }
  if(!rows.length)box.innerHTML='<div class="empty">Todavía no hay planes próximos. Crea el primero.</div>';
};

const p10SendSocial=sendSocialMessage;
sendSocialMessage=async function(){
  const input=$('socialChatInput');
  const body=input?.value.trim();
  if(!body||!socialConversationId)return;
  const btn=input?.parentElement?.querySelector('button');
  if(btn)btn.disabled=true;
  try{await p10SendSocial();}finally{if(btn)btn.disabled=false;input?.focus();}
};

const p10CreatePlan=createPlanTJ;
createPlanTJ=async function(){
  const btn=document.querySelector('#page-plans button[onclick="createPlanTJ()"]');
  if(btn)btn.disabled=true;
  try{await p10CreatePlan();}finally{if(btn)btn.disabled=false;}
};

const p10PrevGo=go;
go=function(page){
  p10PrevGo(page);
  if(page==='plans')setTimeout(()=>{ensureSocialChatHost('page-plans');loadPlansTJ();},70);
  if(page==='double')setTimeout(()=>ensureSocialChatHost('page-double'),70);
};

setTimeout(()=>{
  if(typeof injectPhaseNineUI==='function')injectPhaseNineUI();
  refreshConnectivity();
},1500);

if(!document.querySelector('script[data-tjs-phase11]')){
  const phase11Script=document.createElement('script');
  phase11Script.src='phase11.js?v=1';
  phase11Script.defer=true;
  phase11Script.dataset.tjsPhase11='1';
  document.body.appendChild(phase11Script);
}
if(!document.querySelector('script[data-tjs-phase12]')){
  const phase12Script=document.createElement('script');
  phase12Script.src='phase12.js?v=1';
  phase12Script.defer=true;
  phase12Script.dataset.tjsPhase12='1';
  document.body.appendChild(phase12Script);
}
