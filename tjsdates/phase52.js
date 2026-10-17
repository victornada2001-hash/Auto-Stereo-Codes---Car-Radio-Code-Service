// Phase 52: objective trust signals without exposing private data.

function trust52Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    badge:'Trust signals',title:'Profile trust',note:'These signals are informational only. They do not guarantee identity, intentions, or safety.',
    verified:'Photo verification approved',notVerified:'Not photo verified',approvedPhoto:'Approved profile photo',noApprovedPhoto:'No approved photo yet',
    memberSince:'Member since',complete:'Profile completeness',low:'Basic',mid:'Good',high:'Strong',
    discoveryVerified:'Verified profile',discoveryPhoto:'Approved photo',accountAge:'Account age'
  }:{
    badge:'Señales de confianza',title:'Confianza del perfil',note:'Estas señales son informativas. No garantizan identidad, intenciones ni seguridad.',
    verified:'Verificación de foto aprobada',notVerified:'Sin verificación de foto',approvedPhoto:'Foto de perfil aprobada',noApprovedPhoto:'Aún sin foto aprobada',
    memberSince:'Miembro desde',complete:'Perfil completado',low:'Básico',mid:'Bueno',high:'Sólido',
    discoveryVerified:'Perfil verificado',discoveryPhoto:'Foto aprobada',accountAge:'Antigüedad de cuenta'
  };
}

function trust52MonthYear(value){
  if(!value)return null;
  const d=new Date(value);if(Number.isNaN(d.getTime()))return null;
  return d.toLocaleDateString(undefined,{month:'short',year:'numeric'});
}

function trust52AgeBucket(value){
  if(!value)return null;
  const d=new Date(value);if(Number.isNaN(d.getTime()))return null;
  const months=Math.max(0,Math.floor((Date.now()-d.getTime())/(1000*60*60*24*30.44)));
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  if(months<1)return en?'New account':'Cuenta nueva';
  if(months<3)return en?'1+ month':'1+ mes';
  if(months<6)return en?'3+ months':'3+ meses';
  if(months<12)return en?'6+ months':'6+ meses';
  if(months<24)return en?'1+ year':'1+ año';
  return en?'2+ years':'2+ años';
}

function trust52Completeness(p,hasApprovedPhoto){
  const checks=[p?.display_name,p?.city,p?.bio,p?.relationship_goal,p?.occupation||p?.school,p?.pronouns,hasApprovedPhoto];
  const score=Math.round(checks.filter(Boolean).length/checks.length*100);
  const t=trust52Copy();
  return {score,label:score>=80?t.high:score>=55?t.mid:t.low};
}

async function trust52PhotoState(){
  if(!session)return false;
  try{
    const {data,error}=await sb.from('profile_photos').select('id').eq('user_id',session.user.id).eq('moderation_status','approved').limit(1);
    if(error)throw error;
    return !!(data&&data.length);
  }catch(_e){return false;}
}

function injectTrust52Card(){
  const page=$('page-profile');if(!page||$('trust52Card'))return;
  const firstCard=page.querySelector('.card');
  const c=document.createElement('div');c.id='trust52Card';c.className='card trust52-card';
  if(firstCard?.nextSibling)page.insertBefore(c,firstCard.nextSibling);else page.appendChild(c);
  refreshTrust52Card();
}

async function refreshTrust52Card(){
  const c=$('trust52Card');if(!c||!session)return;
  const t=trust52Copy();
  const hasApproved=await trust52PhotoState();
  const complete=trust52Completeness(profile||{},hasApproved);
  const joined=trust52MonthYear(profile?.created_at);
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">${esc(t.badge)}</div><h3 style="margin:7px 0 0">${esc(t.title)}</h3></div><span class="pill">${complete.score}%</span></div>
    <p class="note">${esc(t.note)}</p>
    <div class="trust52-grid">
      <div class="trust52-item"><b>${profile?.is_verified?'✓':'○'} ${esc(profile?.is_verified?t.verified:t.notVerified)}</b></div>
      <div class="trust52-item"><b>${hasApproved?'✓':'○'} ${esc(hasApproved?t.approvedPhoto:t.noApprovedPhoto)}</b></div>
      ${joined?`<div class="trust52-item"><b>◷ ${esc(t.memberSince)} ${esc(joined)}</b></div>`:''}
      <div class="trust52-item"><b>${esc(t.complete)}: ${esc(complete.label)}</b><div class="trust52-meter"><span style="width:${complete.score}%"></span></div></div>
    </div>`;
}

function injectTrust52OnCandidate(){
  const c=typeof candidates!=='undefined'?candidates[candidateIndex]:null;
  const card=$('currentCard');if(!c||!card||card.querySelector('.trust52-discovery'))return;
  const info=card.querySelector('.info');if(!info)return;
  const t=trust52Copy();
  const chips=[];
  if(c.is_verified)chips.push(`✓ ${t.discoveryVerified}`);
  if(c.photo)chips.push(`📷 ${t.discoveryPhoto}`);
  const age=trust52AgeBucket(c.created_at);
  if(age)chips.push(`◷ ${t.accountAge}: ${age}`);
  if(!chips.length)return;
  const d=document.createElement('div');d.className='trust52-discovery';
  d.innerHTML=chips.map(x=>`<span>${esc(x)}</span>`).join('');
  info.appendChild(d);
}

function injectTrust52Styles(){
  if($('trust52Styles'))return;
  const s=document.createElement('style');s.id='trust52Styles';
  s.textContent='.trust52-card{margin-top:14px}.trust52-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px}.trust52-item{padding:11px;border:1px solid var(--line);border-radius:12px}.trust52-meter{height:6px;background:rgba(255,255,255,.08);border-radius:99px;margin-top:8px;overflow:hidden}.trust52-meter span{display:block;height:100%;background:linear-gradient(90deg,#ff4d7d,#8b5cf6);border-radius:99px}.trust52-discovery{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.trust52-discovery span{font-size:11px;padding:5px 8px;border-radius:999px;background:rgba(15,10,24,.62);border:1px solid rgba(255,255,255,.16)}';
  document.head.appendChild(s);
}

const p52RenderDeck=typeof renderDeck==='function'?renderDeck:null;
if(p52RenderDeck)renderDeck=function(){p52RenderDeck();setTimeout(injectTrust52OnCandidate,0);};
const p52Go=typeof go==='function'?go:null;
if(p52Go)go=function(page){p52Go(page);if(page==='profile')setTimeout(()=>{injectTrust52Card();refreshTrust52Card();},100);if(page==='discover')setTimeout(injectTrust52OnCandidate,80);};
const p52LoadProfileForm=typeof loadProfileForm==='function'?loadProfileForm:null;
if(p52LoadProfileForm)loadProfileForm=async function(){const r=await p52LoadProfileForm();setTimeout(()=>{injectTrust52Card();refreshTrust52Card();},50);return r;};

injectTrust52Styles();
setTimeout(()=>{injectTrust52Card();if(session)refreshTrust52Card();injectTrust52OnCandidate();},700);
