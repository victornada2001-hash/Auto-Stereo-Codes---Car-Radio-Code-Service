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
