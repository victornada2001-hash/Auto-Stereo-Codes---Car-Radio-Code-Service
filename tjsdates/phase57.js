// Phase 57: multi-photo navigation directly in Discovery without breaking swipe decisions.
const p57PhotoCache=new Map(),p57Index=new Map();
async function p57Photos(id,primary){
  if(p57PhotoCache.has(id))return p57PhotoCache.get(id);
  const out=[];
  try{
    const {data}=await sb.from('profile_photos').select('storage_path,is_primary,position').eq('user_id',id).eq('moderation_status','approved').order('position');
    const rows=(data||[]).sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.position-b.position);
    for(const r of rows){const u=await signed(r.storage_path);if(u&&!out.includes(u))out.push(u)}
  }catch(_e){}
  if(primary&&!out.includes(primary))out.unshift(primary);
  p57PhotoCache.set(id,out);return out;
}
function p57Paint(card,photos,index){
  const img=card.querySelector('.heroimg img');if(!img||!photos.length)return;
  const i=(index+photos.length)%photos.length;p57Index.set(card.dataset.profileId,i);img.src=photos[i];
  card.querySelectorAll('.p57bar').forEach((b,n)=>b.classList.toggle('on',n===i));
  const count=card.querySelector('.p57count');if(count)count.textContent=`${i+1}/${photos.length}`;
}
async function p57Decorate(){
  const c=typeof candidates!=='undefined'?candidates[candidateIndex]:null,card=$('currentCard');
  if(!c||!card||card.dataset.p57==='1')return;card.dataset.p57='1';card.dataset.profileId=c.id;
  const photos=await p57Photos(c.id,c.photo);if(photos.length<2)return;
  const hero=card.querySelector('.heroimg');if(!hero)return;
  const top=document.createElement('div');top.className='p57bars';top.innerHTML=photos.map((_,i)=>`<span class="p57bar ${i===0?'on':''}"></span>`).join('');hero.appendChild(top);
  const count=document.createElement('span');count.className='p57count';count.textContent=`1/${photos.length}`;hero.appendChild(count);
  const left=document.createElement('button'),right=document.createElement('button');left.type=right.type='button';left.className='p57zone p57left';right.className='p57zone p57right';left.setAttribute('aria-label','Foto anterior');right.setAttribute('aria-label','Foto siguiente');hero.append(left,right);
  const step=d=>{const i=p57Index.get(c.id)||0;p57Paint(card,photos,i+d)};
  left.onclick=e=>{e.stopPropagation();step(-1)};right.onclick=e=>{e.stopPropagation();step(1)};
  let sx=0,sy=0,dx=0,dy=0,drag=false,startedOnHero=false;
  card.onpointerdown=e=>{if(e.target.closest('button'))return;drag=true;startedOnHero=!!e.target.closest('.heroimg');sx=e.clientX;sy=e.clientY;dx=dy=0;card.setPointerCapture?.(e.pointerId)};
  card.onpointermove=e=>{if(!drag)return;dx=e.clientX-sx;dy=e.clientY-sy;if(Math.abs(dx)>Math.abs(dy))card.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`};
  card.onpointerup=()=>{if(!drag)return;drag=false;card.style.transform='';const ax=Math.abs(dx),ay=Math.abs(dy);
    if(ax>110&&ax>ay){dx>0?likeCurrent():passCurrent();dx=dy=0;return}
    if(startedOnHero&&ax>35&&ax<=110&&ax>ay)step(dx<0?1:-1);
    dx=dy=0;startedOnHero=false;
  };
}
function p57Styles(){if($('p57styles'))return;const s=document.createElement('style');s.id='p57styles';s.textContent='.heroimg{position:relative}.p57bars{position:absolute;top:10px;left:10px;right:10px;z-index:5;display:flex;gap:4px}.p57bar{height:3px;flex:1;background:rgba(255,255,255,.35);border-radius:99px}.p57bar.on{background:#fff}.p57count{position:absolute;right:12px;top:22px;z-index:5;background:rgba(0,0,0,.45);color:#fff;border-radius:999px;padding:4px 7px;font-size:11px}.p57zone{position:absolute;top:0;bottom:0;width:32%;z-index:4;border:0;background:transparent;cursor:pointer}.p57left{left:0}.p57right{right:0}';document.head.appendChild(s)}
const p57Render=typeof renderDeck==='function'?renderDeck:null;if(p57Render)renderDeck=function(){const r=p57Render();setTimeout(p57Decorate,20);return r};
const p57Go=typeof go==='function'?go:null;if(p57Go)go=function(page){p57Go(page);if(page==='discover')setTimeout(p57Decorate,100)};
p57Styles();setTimeout(p57Decorate,800);
if(!document.querySelector('script[data-tjs-phase58]')){const s=document.createElement('script');s.src='phase58.js?v=1';s.defer=true;s.dataset.tjsPhase58='1';document.body.appendChild(s)}
