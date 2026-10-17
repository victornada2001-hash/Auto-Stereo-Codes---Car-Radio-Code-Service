// Phase 58: swipe feedback overlays and safe decision motion in Discovery.
function p58Copy(){const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';return en?{like:'LIKE',pass:'PASS'}:{like:'ME GUSTA',pass:'PASAR'}}
function p58Ensure(card){if(!card||card.querySelector('.p58feedback'))return;const t=p58Copy();const like=document.createElement('div'),pass=document.createElement('div');like.className='p58feedback p58like';pass.className='p58feedback p58pass';like.textContent=t.like;pass.textContent=t.pass;card.append(like,pass)}
function p58Paint(card,dx){p58Ensure(card);const mag=Math.min(1,Math.abs(dx)/110),like=card.querySelector('.p58like'),pass=card.querySelector('.p58pass');if(like){like.style.opacity=dx>0?String(mag):'0';like.style.transform=`rotate(-12deg) scale(${.9+.1*mag})`}if(pass){pass.style.opacity=dx<0?String(mag):'0';pass.style.transform=`rotate(12deg) scale(${.9+.1*mag})`}}
function p58Reset(card){if(!card)return;card.style.transition='transform .18s ease';card.style.transform='';card.style.opacity='';p58Paint(card,0);setTimeout(()=>{if(card&&card.isConnected)card.style.transition=''},190)}
const p58DecorateBase=typeof p57Decorate==='function'?p57Decorate:null;
if(p58DecorateBase)p57Decorate=async function(){await p58DecorateBase();const card=$('currentCard');if(!card||card.dataset.p58==='1')return;card.dataset.p58='1';p58Ensure(card);
  let sx=0,sy=0,dx=0,dy=0,drag=false,startedOnHero=false,pending=false;
  card.onpointerdown=e=>{if(pending||e.target.closest('button'))return;drag=true;startedOnHero=!!e.target.closest('.heroimg');sx=e.clientX;sy=e.clientY;dx=dy=0;card.style.transition='';card.setPointerCapture?.(e.pointerId)};
  card.onpointermove=e=>{if(!drag||pending)return;dx=e.clientX-sx;dy=e.clientY-sy;if(Math.abs(dx)>Math.abs(dy)){card.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`;p58Paint(card,dx)}};
  card.onpointerup=()=>{if(!drag||pending)return;drag=false;const ax=Math.abs(dx),ay=Math.abs(dy);if(ax>110&&ax>ay){
      const dir=dx>0?1:-1;pending=true;card.dataset.p58Pending='1';p58Reset(card);dx=dy=0;startedOnHero=false;
      const action=dir>0?likeCurrent():passCurrent();
      Promise.resolve(action).finally(()=>{pending=false;if(card.isConnected){delete card.dataset.p58Pending;p58Reset(card)}});
      return;
    }
    if(startedOnHero&&ax>35&&ax<=110&&ax>ay){const c=typeof candidates!=='undefined'?candidates[candidateIndex]:null;if(c){const photos=p57PhotoCache.get(c.id)||[];if(photos.length){const i=p57Index.get(c.id)||0;p57Paint(card,photos,i+(dx<0?1:-1))}}}
    p58Reset(card);dx=dy=0;startedOnHero=false};
  card.onpointercancel=()=>{drag=false;if(!pending)p58Reset(card)};
};
(function(){const s=document.createElement('style');s.id='p58styles';s.textContent='.profilecard{overflow:hidden}.p58feedback{position:absolute;top:72px;z-index:12;padding:8px 12px;border:4px solid currentColor;border-radius:10px;font-size:30px;font-weight:900;letter-spacing:2px;opacity:0;pointer-events:none;text-shadow:0 2px 12px rgba(0,0,0,.35)}.p58like{left:18px;color:#42f59e}.p58pass{right:18px;color:#ff6078}.profilecard{will-change:transform,opacity}.profilecard[data-p58-pending="1"]{pointer-events:none}';document.head.appendChild(s)})();
const p58Render=typeof renderDeck==='function'?renderDeck:null;if(p58Render)renderDeck=function(){const r=p58Render();setTimeout(()=>p57Decorate?.(),25);return r};
setTimeout(()=>p57Decorate?.(),850);
if(!document.querySelector('script[data-tjs-phase59]')){const s=document.createElement('script');s.src='phase59.js?v=1';s.defer=true;s.dataset.tjsPhase59='1';document.body.appendChild(s)}
