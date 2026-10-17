// Phase 53: richer Match/chat context with privacy-preserving activity labels.

function chat53Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    verified:'Verified',city:'City',goal:'Looking for',work:'Work / school',about:'About',
    activeNow:'Active recently',activeHour:'Active within the last hour',activeToday:'Active today',activeWeek:'Active this week',activeOlder:'Activity not recent',activityUnknown:'Activity unavailable',
    safety:'Keep conversations in TJSDATES until you feel comfortable. Never send money to someone you just met.'
  }:{
    verified:'Verificado',city:'Ciudad',goal:'Busca',work:'Trabajo / escuela',about:'Acerca de',
    activeNow:'Activo recientemente',activeHour:'Activo en la última hora',activeToday:'Activo hoy',activeWeek:'Activo esta semana',activeOlder:'Sin actividad reciente',activityUnknown:'Actividad no disponible',
    safety:'Mantén la conversación dentro de TJSDATES hasta sentir confianza. Nunca envíes dinero a alguien que acabas de conocer.'
  };
}

function chat53ActivityLabel(value){
  const t=chat53Copy();
  if(!value)return t.activityUnknown;
  const d=new Date(value);if(Number.isNaN(d.getTime()))return t.activityUnknown;
  const mins=Math.max(0,(Date.now()-d.getTime())/60000);
  if(mins<15)return t.activeNow;
  if(mins<60)return t.activeHour;
  if(mins<1440)return t.activeToday;
  if(mins<10080)return t.activeWeek;
  return t.activeOlder;
}

async function chat53FetchOtherProfile(){
  const id=currentConversation?.other?.id;if(!id)return null;
  try{
    const {data,error}=await sb.from('profiles')
      .select('id,display_name,city,is_verified,bio,occupation,school,relationship_goal,last_active_at,created_at')
      .eq('id',id).maybeSingle();
    if(error)throw error;
    return data||null;
  }catch(_e){return null;}
}

function chat53EnsureHeader(){
  const title=$('chatTitle');if(!title)return null;
  let host=$('chatContext53');
  if(host)return host;
  host=document.createElement('div');host.id='chatContext53';host.className='chat-context53';
  title.insertAdjacentElement('afterend',host);
  return host;
}

async function refreshChatContext53(){
  if(!currentConversation)return;
  const host=chat53EnsureHeader();if(!host)return;
  const t=chat53Copy();
  const p=await chat53FetchOtherProfile();
  const base=p||currentConversation.other||{};
  const work=[base.occupation,base.school].filter(Boolean).join(' · ');
  const activity=chat53ActivityLabel(base.last_active_at);
  const chips=[];
  if(base.is_verified)chips.push(`✓ ${t.verified}`);
  if(base.city)chips.push(`📍 ${base.city}`);
  chips.push(`◷ ${activity}`);
  if(base.relationship_goal)chips.push(`♡ ${base.relationship_goal}`);
  host.innerHTML=`<div class="chat53-chips">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    ${work?`<div class="chat53-row"><b>${esc(t.work)}:</b> ${esc(work)}</div>`:''}
    ${base.bio?`<div class="chat53-bio"><b>${esc(t.about)}:</b> ${esc(base.bio)}</div>`:''}
    <div class="chat53-safety">🛡 ${esc(t.safety)}</div>`;
}

function chat53DecorateReceipts(){
  const box=$('chatBox');if(!box)return;
  box.querySelectorAll('.msg.mine .msgmeta span').forEach(el=>{
    el.setAttribute('aria-label',el.textContent||'Message status');
  });
  const typing=$('typingIndicator');if(typing){typing.setAttribute('role','status');typing.setAttribute('aria-live','polite');}
}

function chat53Styles(){
  if($('chat53Styles'))return;
  const s=document.createElement('style');s.id='chat53Styles';
  s.textContent='.chat-context53{margin:0 0 12px;padding:12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025)}.chat53-chips{display:flex;gap:6px;flex-wrap:wrap}.chat53-chips span{font-size:11px;padding:5px 8px;border-radius:999px;border:1px solid var(--line)}.chat53-row,.chat53-bio{font-size:13px;margin-top:8px;line-height:1.45}.chat53-safety{font-size:12px;color:var(--muted);margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}';
  document.head.appendChild(s);
}

const p53OpenChat=typeof openChat==='function'?openChat:null;
if(p53OpenChat)openChat=async function(match,p){
  const r=await p53OpenChat(match,p);
  setTimeout(()=>{refreshChatContext53();chat53DecorateReceipts();},60);
  return r;
};

const p53LoadMessages=typeof loadMessages==='function'?loadMessages:null;
if(p53LoadMessages)loadMessages=async function(){
  const r=await p53LoadMessages();
  setTimeout(chat53DecorateReceipts,0);
  return r;
};

const p53Go=typeof go==='function'?go:null;
if(p53Go)go=function(page){
  p53Go(page);
  if(page==='matches'&&currentConversation)setTimeout(()=>{refreshChatContext53();chat53DecorateReceipts();},100);
};

chat53Styles();
setTimeout(()=>{if(currentConversation){refreshChatContext53();chat53DecorateReceipts();}},700);

if(!document.querySelector('script[data-tjs-phase54]')){
  const s=document.createElement('script');s.src='phase54.js?v=1';s.defer=true;s.dataset.tjsPhase54='1';document.body.appendChild(s);
}
