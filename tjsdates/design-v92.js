
/* TJSDATES release 92 — visual redesign and swipe interactions. */
(function(){
 const app=document.getElementById('app');
 if(!app||document.getElementById('t92-topbar'))return;
 app.classList.add('t92-app');
 const grid=app.querySelector('.appgrid'),side=app.querySelector('.side'),content=app.querySelector('.content');
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const currentName=()=>typeof profile!=='undefined'&&profile?.display_name?profile.display_name:'Mi perfil';
 const openPage=name=>{if(document.getElementById('page-'+name))go(name);else go(name==='messages'?'matches':'discover');};
 const top=document.createElement('header');top.className='t92-topbar';top.id='t92-topbar';
 top.innerHTML='<div class="t92-brand"><span class="t92-heart">♡</span><span>TJS<span>DATES</span><small>Citas en Tijuana y San Diego</small></span></div><nav class="t92-topnav" aria-label="Navegación principal"><button data-t92-page="discover" class="t92-current"><span class="t92-symbol">⌂</span>Inicio</button><button data-t92-page="explore"><span class="t92-symbol">◎</span>Explorar</button><button data-t92-page="matches"><span class="t92-symbol">♡</span>Matches</button><button data-t92-page="messages"><span class="t92-symbol">▢</span>Mensajes</button><button data-t92-page="notifications"><span class="t92-symbol">♧</span>Notificaciones</button></nav><button class="t92-user" type="button"><span class="t92-avatar">♥</span><span class="t92-user-name">Mi perfil</span>⌄</button>';
 app.prepend(top);
 top.querySelectorAll('[data-t92-page]').forEach(btn=>btn.addEventListener('click',()=>openPage(btn.dataset.t92Page)));
 top.querySelector('.t92-user').onclick=()=>go('profile');
 const self=document.createElement('div');self.className='t92-self';self.innerHTML='<div class="t92-self-head"><div class="t92-self-avatar">♥</div><div><div class="t92-self-name">Mi perfil</div><span class="t92-self-meta">Tijuana · San Diego</span></div></div>';
 side.prepend(self);
 const foot=document.createElement('div');foot.className='t92-sidefooter';foot.innerHTML='<strong>♛ TJSDATES Premium</strong><p>Descubre más beneficios y opciones de visibilidad.</p><button type="button">Hazte Premium</button>';foot.querySelector('button').onclick=()=>go('premium');const spacer=side.querySelector('.spacer');if(spacer)side.insertBefore(foot,spacer);else side.appendChild(foot);
 const heading=document.createElement('div');heading.className='t92-heading';heading.innerHTML='<h1>Descubre personas <span>cerca de ti</span></h1><p>Conecta con personas en Tijuana y San Diego</p>';content.prepend(heading);
 const rail=document.createElement('aside');rail.className='t92-right';rail.setAttribute('aria-label','Información y beneficios');
 rail.innerHTML='<div class="t92-panel t92-premium"><h3>♛ TJSDATES <span>Premium</span></h3><p>Más oportunidades de conectar, mayor visibilidad y herramientas exclusivas.</p><button type="button" data-jump="premium">Hazte Premium ›</button></div><div class="t92-panel"><h3>▥ Tu actividad</h3><div class="t92-metrics"><div class="t92-metric"><b>♡</b><small>Likes</small></div><div class="t92-metric"><b>★</b><small>Super Likes</small></div><div class="t92-metric"><b>▢</b><small>Matches</small></div></div></div><div class="t92-panel"><h3><span class="t92-check">✿</span> Verifica tu perfil</h3><p>Una identificación oficial revisada por el equipo aumenta la confianza.</p><button class="t92-link" type="button" data-jump="profile">Solicitar verificación</button></div><div class="t92-panel"><h3>♧ Consejos de seguridad</h3><ul class="t92-safety-list"><li>Conoce a las personas en lugares públicos.</li><li>No compartas información financiera.</li><li>Reporta perfiles sospechosos.</li></ul><button class="t92-link" type="button" data-jump="safety">Ver más consejos</button></div>';
 grid.appendChild(rail);rail.querySelectorAll('[data-jump]').forEach(btn=>btn.onclick=()=>go(btn.dataset.jump));
 const updateName=()=>{const n=safe(currentName());self.querySelector('.t92-self-name').textContent=n;top.querySelector('.t92-user-name').textContent=n;const tab=app.querySelector('main section:not(.hidden)');heading.style.display=tab?.id==='page-discover'?'':'none';top.querySelectorAll('[data-t92-page]').forEach(btn=>btn.classList.toggle('t92-current',btn.dataset.t92Page===(tab?.id||'').replace('page-','')));};
 const previousGo=go;go=function(){const out=previousGo.apply(this,arguments);updateName();return out};
 const oldRender=renderDeck;renderDeck=function(){
  const result=oldRender.apply(this,arguments);
  const card=document.getElementById('currentCard');
  if(card){
    card.querySelectorAll('.t92-online,.t92-photo-menu').forEach(el=>el.remove());
    const demo=Boolean(candidates?.[candidateIndex]?.is_demo);
    const tag=document.createElement('span');tag.className='t92-online';tag.textContent=demo?'Perfil de demostración':'Descubrir';card.append(tag);
    const dots=document.createElement('button');dots.type='button';dots.className='t92-photo-menu';dots.textContent='•••';dots.setAttribute('aria-label','Más información del perfil');dots.addEventListener('pointerdown',e=>e.stopPropagation());dots.onclick=e=>{e.stopPropagation();if(typeof openCurrentProfileDetails==='function')openCurrentProfileDetails();else toast('Toca la tarjeta para explorar el perfil.')};card.append(dots);
  }
  return result;
 };
 // Only animate demo cards before the existing demo no-write handlers.
 let animating=false;
 const animateDemo=(type,fn,args,ctx)=>{
   if(animating)return;
   const card=document.getElementById('currentCard');if(!card)return fn.apply(ctx,args);
   const record=candidates?.[candidateIndex];if(!record?.is_demo)return fn.apply(ctx,args);
   animating=true;card.classList.add('t92-flying');
   const w=window.innerWidth;const x=type==='right'?Math.max(520,w*.7):type==='left'?-Math.max(520,w*.7):0;
   const y=type==='up'?-Math.max(580,window.innerHeight*.75):0;
   card.style.transform='translate('+x+'px,'+y+'px) rotate('+(type==='right'?18:type==='left'?-18:0)+'deg)';
   card.style.opacity='0';
   setTimeout(()=>{try{fn.apply(ctx,args)}finally{animating=false}},350);
 };
 for(const [name,direction] of [['likeCurrent','right'],['passCurrent','left'],['superLikeCurrent','up']]){
  const original=window[name];if(typeof original!=='function')continue;
  window[name]=function(){return animateDemo(direction,original,arguments,this)};
 }
 // Live swipe: pointer drag gives tactile feedback; existing database operations still determine success.
 wireSwipe=function(card){
  let startX=0,startY=0,moving=false,locked=false;
  card.addEventListener('pointerdown',e=>{
   if(e.target.closest('button,a,input'))return;
   moving=true;locked=false;startX=e.clientX;startY=e.clientY;
  });
  card.addEventListener('pointermove',e=>{
   if(!moving)return;
   const dx=e.clientX-startX,dy=e.clientY-startY;
   if(!locked&&Math.abs(dx)<12&&Math.abs(dy)<12)return;
   locked=true;if(e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)&&dy>0){moving=false;return;}
   card.style.transition='none';
   card.style.transform='translate('+dx+'px,'+Math.min(dy,0)+'px) rotate('+(dx/28)+'deg)';
  });
  const end=e=>{
   if(!moving)return;moving=false;const dx=e.clientX-startX,dy=e.clientY-startY;
   card.style.transition='';card.style.transform='';
   if(dy< -105&&Math.abs(dy)>Math.abs(dx)*1.12){superLikeCurrent();return}
   if(dx>100){likeCurrent();return}
   if(dx< -100){passCurrent();return}
  };
  card.addEventListener('pointerup',end);card.addEventListener('pointercancel',()=>{moving=false;card.style.transition='';card.style.transform=''});
 };
 // The normal server-confirmed animation supports vertical Super Likes.
 const oldAnimate=animateOut;animateOut=function(direction){
  if(direction!=='up')return oldAnimate.apply(this,arguments);
  const card=document.getElementById('currentCard');
  if(card){card.classList.add('t92-flying');card.style.transform='translateY(-130%) scale(.9)';card.style.opacity='0'}
  setTimeout(()=>{candidateIndex++;renderDeck()},340);
 };
 updateName();
 window.addEventListener('pageshow',updateName);
})();
