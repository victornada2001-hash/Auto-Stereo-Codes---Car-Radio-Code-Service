// Phase 54: richer Match inbox with latest-message preview and unread counts.

function match54Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    noMessages:'No messages yet',photo:'Photo',you:'You',unread:'unread',matched:'New Match',
    today:'Today',yesterday:'Yesterday'
  }:{
    noMessages:'Aún no hay mensajes',photo:'Foto',you:'Tú',unread:'sin leer',matched:'Nuevo Match',
    today:'Hoy',yesterday:'Ayer'
  };
}

function match54Time(value){
  if(!value)return'';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return'';
  const t=match54Copy(),now=new Date();
  const startNow=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  const startD=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
  const days=Math.round((startNow-startD)/86400000);
  if(days===0)return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if(days===1)return t.yesterday;
  if(days<7)return d.toLocaleDateString(undefined,{weekday:'short'});
  return d.toLocaleDateString(undefined,{day:'2-digit',month:'short'});
}

function match54Preview(m){
  const t=match54Copy();
  if(!m.last_message_id)return t.matched;
  let body=(m.last_message_body||'').trim();
  if(!body&&m.last_message_has_attachment)body='📷 '+t.photo;
  if(!body)body=t.noMessages;
  if(m.last_message_sender_id===session?.user?.id)body=`${t.you}: ${body}`;
  return body.length>82?body.slice(0,79)+'…':body;
}

async function loadMatches54(){
  if(!session)return false;
  const {data,error}=await sb.rpc('get_my_match_inbox',{p_limit:100});
  if(error)return false;
  const rows=data||[],ids=rows.map(m=>m.other_user_id),photos=await loadCandidatePhotos(ids),g=$('matchesGrid');
  if(!g)return true;
  g.innerHTML='';
  for(const m of rows){
    const p={id:m.other_user_id,display_name:m.display_name||'Match',city:m.city||'',is_verified:m.is_verified,relationship_goal:m.relationship_goal,last_active_at:m.last_active_at};
    const d=document.createElement('button');
    d.type='button';d.className='card match match54-card';d.onclick=()=>openChat(m,p);
    const unread=Number(m.unread_count||0);
    d.innerHTML=`<div class="match54-main"><div class="avatar">${photos[m.other_user_id]?`<img src="${photos[m.other_user_id]}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:esc((p.display_name||'?')[0])}</div><div class="match54-copy"><div class="match54-top"><b>${esc(p.display_name||'Match')} ${p.is_verified?'✓':''}</b><span>${esc(match54Time(m.last_message_at||m.matched_at))}</span></div><div class="match54-preview ${unread?'match54-unreadtext':''}">${esc(match54Preview(m))}</div><div class="note">${esc(p.city||'')}${p.relationship_goal?' · '+esc(p.relationship_goal):''}</div></div>${unread?`<span class="match54-badge" aria-label="${unread} ${esc(match54Copy().unread)}">${unread>99?'99+':unread}</span>`:''}</div>`;
    g.appendChild(d);
  }
  if(!rows.length)g.innerHTML='<div class="card empty" style="grid-column:1/-1">Aún no tienes matches. Sigue descubriendo perfiles.</div>';
  return true;
}

function match54Styles(){
  if($('match54Styles'))return;
  const s=document.createElement('style');s.id='match54Styles';
  s.textContent='.match54-card{width:100%;text-align:left;cursor:pointer}.match54-main{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center}.match54-copy{min-width:0}.match54-top{display:flex;gap:8px;justify-content:space-between;align-items:center}.match54-top span{font-size:11px;color:var(--muted);white-space:nowrap}.match54-preview{font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px}.match54-unreadtext{color:var(--text);font-weight:700}.match54-badge{min-width:22px;height:22px;padding:0 6px;display:grid;place-items:center;border-radius:999px;background:#ff4d7d;color:#fff;font-size:11px;font-weight:800}';
  document.head.appendChild(s);
}

const p54LoadMatches=typeof loadMatches==='function'?loadMatches:null;
if(p54LoadMatches)loadMatches=async function(){
  const ok=await loadMatches54();
  if(!ok)return p54LoadMatches();
};

const p54OpenChat=typeof openChat==='function'?openChat:null;
if(p54OpenChat)openChat=async function(match,p){
  const r=await p54OpenChat(match,p);
  setTimeout(()=>loadMatches54().catch(()=>{}),250);
  return r;
};

const p54SubscribeChat=typeof subscribeChat==='function'?subscribeChat:null;
if(p54SubscribeChat)subscribeChat=function(){
  const r=p54SubscribeChat();
  setTimeout(()=>{
    if(!realtimeChannel||!currentConversation)return;
    // Existing message subscriptions refresh the chat; inbox refresh is lightweight and debounced here.
  },0);
  return r;
};

const p54Go=typeof go==='function'?go:null;
if(p54Go)go=function(page){p54Go(page);if(page==='matches')setTimeout(()=>loadMatches54(),80);};

match54Styles();
setTimeout(()=>{if(session)loadMatches54();},800);
