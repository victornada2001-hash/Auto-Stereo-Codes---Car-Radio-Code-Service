function phase18FriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(m.includes('daily like limit'))return'Llegaste al límite diario de Likes del plan Gratis.';
  if(m.includes('highlighted like requires'))return'El Like destacado requiere TJ Gold o Platinum.';
  if(m.includes('profile unavailable'))return'Este perfil ya no está disponible.';
  if(m.includes('interaction not allowed'))return'No puedes interactuar con este perfil.';
  if(m.includes('duplicate'))return'Ya habías enviado Like a esta persona.';
  return err?.message||'No se pudo completar la acción.';
}

async function getCandidateCompatibility(userId){
  if(!userId)return null;
  const {data,error}=await sb.rpc('get_candidate_compatibility',{target_user:userId});
  if(error)return null;
  return data?.[0]||null;
}

function renderCompatibilityChips(names=[]){
  const vals=(names||[]).slice(0,5);
  if(!vals.length)return'';
  return `<div class="chips" style="margin-top:8px">${vals.map(x=>`<span class="chip on" style="cursor:default">${esc(x)}</span>`).join('')}</div>`;
}

const p18RenderDeck=renderDeck;
renderDeck=async function(){
  p18RenderDeck();
  const c=candidates[candidateIndex];if(!c)return;
  const card=$('currentCard');if(!card)return;
  const info=card.querySelector('.info');if(!info)return;
  const compat=await getCandidateCompatibility(c.id);
  if(!compat||candidates[candidateIndex]?.id!==c.id)return;
  const block=document.createElement('div');block.className='compatibility-block';
  const count=Number(compat.common_interest_count||0);
  block.innerHTML=`${count?`<p><b>${count} interés${count===1?'':'es'} en común</b></p>${renderCompatibilityChips(compat.common_interest_names)}`:`<p class="note">Exploren nuevos intereses juntos.</p>`}${(compat.target_interest_names||[]).length?`<details style="margin-top:8px"><summary>Ver intereses</summary>${renderCompatibilityChips(compat.target_interest_names)}</details>`:''}`;
  info.appendChild(block);
};

createLike=async function(type='like'){
  const c=candidates[candidateIndex];if(!c)return;
  const likeType=type==='highlighted'?'highlighted':'like';
  try{
    const {data,error}=await sb.rpc('create_like',{target_user:c.id,p_like_type:likeType});
    if(error)throw error;
    const r=data?.[0]||{};
    lastAction={type:'like',id:c.id,matched:!!r.match_created};
    if(r.match_created){
      showModal(`<div style="text-align:center"><div style="font-size:72px">💞</div><h2>¡Hicieron Match!</h2><p class="note">${esc(c.display_name||'Esta persona')} también mostró interés en ti.</p><button class="btn primary" onclick="closeModal();go('matches')">Enviar mensaje</button></div>`);
      loadMatches();
    }else if(Number.isFinite(Number(r.remaining_likes))){
      const n=Number(r.remaining_likes);if(n<=5)toast(`Te quedan ${n} Like${n===1?'':'s'} hoy.`);
    }
    animateOut(1);refreshBadges();
  }catch(e){toast(phase18FriendlyError(e));}
};
likeCurrent=()=>createLike('like');
superLikeCurrent=()=>createLike('highlighted');

likeBack=async function(id){
  try{
    const {data,error}=await sb.rpc('create_like',{target_user:id,p_like_type:'like'});if(error)throw error;
    if(data?.[0]?.match_created)toast('¡Nuevo Match!');
    else toast('Like enviado.');
    loadLikes();loadMatches();refreshBadges();
  }catch(e){toast(phase18FriendlyError(e));}
};

setTimeout(()=>{
  const style=document.createElement('style');style.id='phase18Styles';style.textContent='.compatibility-block{margin-top:10px}.compatibility-block details summary{cursor:pointer;color:var(--muted);font-weight:700}';
  if(!document.getElementById('phase18Styles'))document.head.appendChild(style);
},200);
