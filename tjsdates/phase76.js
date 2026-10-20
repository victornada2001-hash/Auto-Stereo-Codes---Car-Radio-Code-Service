// Phase 76: romantic premium visual polish, motion and contained pricing carousel.
(function(){
  if(!document.querySelector('link[data-tjs-phase76]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='/phase76.css';l.dataset.tjsPhase76='1';document.head.appendChild(l);
  }

  function t76(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

  function p76Banner(){
    const hero=document.querySelector('#landing .hero > div');
    if(!hero||hero.querySelector('.p76-love-banner'))return;
    const b=document.createElement('div');
    b.className='p76-love-banner p76-enter';
    b.innerHTML=`<span class="red">${t76('Conecta.','Connect.')}</span><span class="white">${t76('Haz match.','Match.')}</span><span class="purple">${t76('Conoce algo real.','Meet something real.')}</span>`;
    const p=hero.querySelector('p');
    if(p)p.insertAdjacentElement('afterend',b);else hero.appendChild(b);
  }

  function p76AnimateVisible(root=document){
    root.querySelectorAll('main section:not(.hidden) .card, main section:not(.hidden) .sectionhead, #landing .hero > *, #onboarding .card').forEach((el,i)=>{
      el.classList.remove('p76-enter');
      void el.offsetWidth;
      el.style.animationDelay=Math.min(i*28,180)+'ms';
      el.classList.add('p76-enter');
    });
  }

  function p76PressFeedback(){
    if(document.documentElement.dataset.p76Press)return;
    document.documentElement.dataset.p76Press='1';
    document.addEventListener('click',e=>{
      const el=e.target.closest('button,.chip,.navbtn,.round,.plancard');
      if(!el||el.disabled)return;
      el.classList.remove('p76-press');void el.offsetWidth;el.classList.add('p76-press');
      setTimeout(()=>el.classList.remove('p76-press'),260);
    },{passive:true});
  }

  function p76DecoratePremium(){
    const page=$('page-premium'),grid=$('plansGrid');
    if(!page||!grid)return;
    let nav=page.querySelector('.p76-price-nav');
    if(!nav){
      nav=document.createElement('div');nav.className='p76-price-nav';
      nav.innerHTML=`<span class="p76-price-hint">${t76('Desliza para comparar planes','Swipe to compare plans')}</span><button class="btn ghost" type="button" data-dir="-1" aria-label="${t76('Plan anterior','Previous plan')}">‹</button><button class="btn ghost" type="button" data-dir="1" aria-label="${t76('Plan siguiente','Next plan')}">›</button>`;
      grid.insertAdjacentElement('beforebegin',nav);
      nav.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
        const card=grid.querySelector('.plancard');
        const step=(card?.getBoundingClientRect().width||290)+14;
        grid.scrollBy({left:Number(btn.dataset.dir)*step,behavior:'smooth'});
      });
    }else{
      const hint=nav.querySelector('.p76-price-hint');if(hint)hint.textContent=t76('Desliza para comparar planes','Swipe to compare plans');
    }
    [...grid.children].forEach((c,i)=>{c.style.animationDelay=(i*55)+'ms';c.classList.add('p76-enter')});
  }

  const baseGo=typeof go==='function'?go:null;
  if(baseGo&&!baseGo.__p76Wrapped){
    const wrapped=function(page){
      const r=baseGo(page);
      setTimeout(()=>{p76AnimateVisible();if(page==='premium')p76DecoratePremium();},40);
      return r;
    };
    wrapped.__p76Wrapped=true;go=wrapped;
  }

  const basePremium=typeof loadPremium==='function'?loadPremium:null;
  if(basePremium&&!basePremium.__p76Wrapped){
    const wrapped=async function(){const r=await basePremium();p76DecoratePremium();return r};
    wrapped.__p76Wrapped=true;loadPremium=wrapped;
  }

  window.addEventListener('tjsdates:language-changed',()=>{p76Banner();p76DecoratePremium();});
  window.addEventListener('pageshow',()=>{p76Banner();p76AnimateVisible();p76DecoratePremium();});
  p76PressFeedback();p76Banner();setTimeout(()=>{p76AnimateVisible();p76DecoratePremium();},120);
  window.__TJSDATES_ROMANTIC_VISUALS_READY=true;
})();


/* Phase 77: pricing by apparent country / VPN exit IP, with a live USD/MXN rate. */
(function(){
let country='MX',mxnRate=null,rateUpdated=false;
const rates=async()=>{
 try{
  const [loc,fx]=await Promise.all([
   fetch('https://ipwho.is/',{cache:'no-store'}).then(r=>r.json()),
   fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN',{cache:'no-store'}).then(r=>r.json())
  ]);
  if(loc&&loc.success&&loc.country_code)country=loc.country_code.toUpperCase();
  if(fx&&Number(fx.rates?.MXN)>0){mxnRate=Number(fx.rates.MXN);rateUpdated=true;}
 }catch(e){console.warn('Country or FX unavailable',e);}
 refreshPrices();
};
function refreshPrices(){
 const grid=document.getElementById('plansGrid');if(!grid)return;
 const cards=[...grid.querySelectorAll('.plancard')];
 cards.forEach((card,i)=>{
  const plan=String(card.querySelector('.pill')?.textContent||'').toLowerCase();
  const amount=plan.includes('platinum')?18:plan.includes('gold')?15:plan.includes('plus')?13:0;
  const price=card.querySelector('.price');if(!price)return;
  const usd=country==='US';
  const label=amount===0?(usd?'Free':'Gratis'):usd?'US$'+amount.toFixed(2):(mxnRate?'$'+(amount*mxnRate).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})+' MXN':'US$'+amount.toFixed(2));
  price.innerHTML=label+' <span>/mes</span>';
  if(!usd&&!mxnRate&&amount)price.title='No se pudo consultar el tipo de cambio; precio base en USD';
  if(!usd&&mxnRate&&amount)price.title='Conversión orientativa: 1 USD = '+mxnRate.toFixed(4)+' MXN. Cobro final confirmado al pagar.';
 });
}
const obs=new MutationObserver(()=>refreshPrices());
function attach(){
 const el=document.getElementById('plansGrid');
 if(!el||el.dataset.phase77)return;
 el.dataset.phase77='1';
 let pending=false;
 const m=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;refreshPrices()})});
 m.observe(el,{childList:true,subtree:false});
 refreshPrices();
}
document.addEventListener('DOMContentLoaded',attach);
if(document.readyState!=='loading')attach();
rates();
})();


/* Phase 78: ensure landing signup and login CTAs always have distinct labels. */
(function(){
  function fixLandingActions(){
    const landing=document.getElementById('landing');if(!landing)return;
    const signup=landing.querySelector('.hero button[onclick*="signup"]');
    const login=landing.querySelector('.hero button[onclick*="login"]');
    const english=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
    if(signup){const label=english?'Create account':'Crear cuenta';if(signup.textContent!==label)signup.textContent=label;if(signup.getAttribute('aria-label')!==label)signup.setAttribute('aria-label',label);}
    if(login){const label=english?'I have an account':'Ya tengo cuenta';if(login.textContent!==label)login.textContent=label;if(login.getAttribute('aria-label')!==label)login.setAttribute('aria-label',label);}
  }
  fixLandingActions();
  window.addEventListener('pageshow',fixLandingActions);
  window.addEventListener('tjsdates:language-changed',()=>setTimeout(fixLandingActions,0));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixLandingActions);
})();


/* Phase 79 mobile discovery navigation and simplified reaction buttons. */
(function(){
 const opts=[['↶','Regresar'],['✕','No me gusta'],['★','Super Like'],['♥','Me gusta']];
 function init(){
  document.querySelectorAll('#page-discover .actions button.round').forEach((b,i)=>{
   if(!opts[i])return;
   if(b.textContent!==opts[i][0])b.textContent=opts[i][0];
   b.setAttribute('aria-label',opts[i][1]);
   if(!b.dataset.fx){b.dataset.fx='1';b.addEventListener('click',()=>{b.classList.remove('tjs-tap');void b.offsetWidth;b.classList.add('tjs-tap')});}
  });
  const nav=document.querySelector('#app .bottom');
  if(!nav||nav.querySelector('.tjs-mobile-more'))return;
  const more=document.createElement('button');more.className='tjs-mobile-more';more.textContent='☰ Más';
  more.setAttribute('aria-expanded','false');nav.appendChild(more);
  function close(){document.querySelector('.tjs-mobile-menu')?.remove();document.querySelector('.tjs-mobile-menu-backdrop')?.remove();more.setAttribute('aria-expanded','false');}
  more.addEventListener('click',()=>{
   if(document.querySelector('.tjs-mobile-menu'))return close();
   const shade=document.createElement('div');shade.className='tjs-mobile-menu-backdrop';shade.onclick=close;document.body.appendChild(shade);
   const menu=document.createElement('div');menu.className='tjs-mobile-menu';menu.setAttribute('role','dialog');
   const title=document.createElement('div');title.className='tjs-menu-title';title.textContent='TJSDATES';menu.appendChild(title);
   const used=new Set();
   document.querySelectorAll('#app aside [data-page]').forEach(link=>{
    const page=link.dataset.page;if(!page||used.has(page))return;used.add(page);
    const item=document.createElement('button');item.textContent=link.textContent.trim();item.onclick=()=>{close();link.click();};menu.appendChild(item);
   });
   document.body.appendChild(menu);more.setAttribute('aria-expanded','true');
  });
  window.addEventListener('resize',()=>{if(innerWidth>860)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.addEventListener('pageshow',init);
})();
