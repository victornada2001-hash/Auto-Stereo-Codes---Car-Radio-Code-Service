// Phase 68: align Explore likes and Double Date invite UI with hardened backend.
function p68Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

// Explore must use the same secure server mutation as Discovery; direct writes to likes are intentionally revoked.
exploreLike=async function(userId,btn){
  if(!session||!userId)return;
  if(btn)btn.disabled=true;
  try{
    const {data,error}=await sb.rpc('create_like',{target_user:userId,p_like_type:'like'});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    if(btn){btn.textContent=row?.match_created?p68Text('✓ ¡Match!','✓ Match!'):p68Text('✓ Like enviado','✓ Like sent');}
    if(row?.match_created){
      toast(p68Text('¡Hicieron Match! Revisa tus Matches.','It’s a Match! Check your Matches.'));
      if(typeof loadMatches==='function')loadMatches().catch(()=>{});
    }else toast(p68Text('Like enviado.','Like sent.'));
    if(typeof refreshBadges==='function')refreshBadges().catch(()=>{});
  }catch(e){
    if(btn)btn.disabled=false;
    const m=String(e?.message||e||'');
    if(m.includes('daily like limit reached'))return toast(p68Text('Alcanzaste tu límite diario de Likes.','You reached your daily Like limit.'));
    if(m.includes('profile unavailable'))return toast(p68Text('Este perfil ya no está disponible.','This profile is no longer available.'));
    if(m.includes('interaction not allowed'))return toast(p68Text('No puedes interactuar con este perfil.','You cannot interact with this profile.'));
    toast(e?.message||p68Text('No se pudo enviar el Like.','Could not send the Like.'));
  }
};
exploreLike.__tjsSecure=true;

function p68FixDoubleInviteUI(){
  const input=$('doubleCode');
  if(input){
    input.maxLength=16;
    input.placeholder=p68Text('Código de 16 caracteres','16-character code');
    input.setAttribute('autocomplete','off');
    input.setAttribute('spellcheck','false');
  }
  const box=$('doubleStatusBox');
  if(box)box.querySelectorAll('.invitecode').forEach(el=>el.setAttribute('aria-label',p68Text('Código de invitación Double Date','Double Date invite code')));
}

const p68LoadDouble=typeof loadDoubleDate==='function'?loadDoubleDate:null;
if(p68LoadDouble)loadDoubleDate=async function(...args){const r=await p68LoadDouble.apply(this,args);setTimeout(p68FixDoubleInviteUI,0);return r};

const p68Go=typeof go==='function'?go:null;
if(p68Go)go=function(page){p68Go(page);if(page==='double')setTimeout(p68FixDoubleInviteUI,30)};

setTimeout(p68FixDoubleInviteUI,700);
window.addEventListener('tjsdates:language-changed',()=>setTimeout(p68FixDoubleInviteUI,0));
window.__TJSDATES_EXPLORE_DOUBLE_HARDENED=true;
