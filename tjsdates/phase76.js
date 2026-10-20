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


/* Phase 80: add-on catalog, display-only until verified Stripe checkout exists. */
(function(){
 let country='MX',rate=null;
 const addons=[{title:'1 Boost',usd:5,detail:'30 minutos de visibilidad adicional'},{title:'2 Boosts',usd:7,detail:'60 minutos en total (2 × 30 minutos)'},{title:'1 Like destacado',usd:1,detail:'Un Like destacado por compra'}];
 function mount(){
  const page=document.getElementById('page-premium');if(!page)return;
  const card=[...page.querySelectorAll('.card')].find(el=>el.querySelector('h3')?.textContent.trim()==='Compras adicionales');
  if(!card)return;
  let grid=document.getElementById('tjsAddonList');
  if(!grid){
   card.querySelector('p.note')?.remove();
   grid=document.createElement('div');grid.id='tjsAddonList';card.appendChild(grid);
   const note=document.createElement('p');note.id='tjsAddonNote';note.textContent='Los pagos estarán disponibles al conectar y verificar Stripe. No se cobran ni se activan beneficios todavía.';card.appendChild(note);
  }
  const fmt=usd=>country==='US'?'US$'+usd.toFixed(2):rate?'$'+(usd*rate).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})+' MXN':'US$'+usd.toFixed(2);
  grid.innerHTML='';
  addons.forEach(item=>{
   const el=document.createElement('article');el.className='tjs-addon';
   const title=document.createElement('h4');title.textContent=item.title;
   const price=document.createElement('div');price.className='tjs-addon-price';price.textContent=fmt(item.usd);
   const detail=document.createElement('p');detail.textContent=item.detail;
   const button=document.createElement('button');button.className='btn ghost';button.type='button';button.disabled=true;button.textContent='Compra próximamente';
   el.append(title,price,detail,button);grid.appendChild(el);
  });
  const note=document.getElementById('tjsAddonNote');if(note)note.title=rate?'1 USD = '+rate.toFixed(4)+' MXN · valor orientativo':'El precio base se muestra en USD cuando no hay cotización disponible';
 }
 async function getPricing(){
  try{
   const response=await fetch('https://ipwho.is/',{cache:'no-store'});const loc=await response.json();
   if(loc.success&&loc.country_code)country=loc.country_code.toUpperCase();
  }catch(e){console.warn('Add-on country lookup unavailable',e);}
  try{
   const response=await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN',{cache:'no-store'});
   const data=await response.json();if(Number(data.rates?.MXN)>0)rate=Number(data.rates.MXN);
  }catch(e){console.warn('Add-on FX unavailable',e);}
  mount();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 getPricing();
 window.addEventListener('pageshow',mount);
})();


/* Phase 81: immersive discovery, expanded profile and integrated photo editing. */
(function(){
const byId=id=>document.getElementById(id);
let galleryIndex=0,activeProfileId=null;
function profileSheet(candidate){
 const old=byId('tjsProfileSheet');old?.remove();
 const backdrop=document.createElement('div');backdrop.id='tjsProfileSheet';backdrop.className='tjs-profile-sheet';
 const panel=document.createElement('div');panel.className='tjs-profile-details';
 const photo=candidate.photo?'<img src="'+candidate.photo+'" alt="Foto del perfil">':'<div class="tjs-photo-empty">♥</div>';
 const item=(title,value)=>'<div class="tjs-detail-item"><strong>'+title+'</strong><p>'+esc(value||'Sin especificar')+'</p></div>';
 panel.innerHTML='<button class="tjs-sheet-close" type="button">⌄ Cerrar</button><div class="tjs-sheet-hero">'+photo+'</div><h2>'+esc(candidate.display_name||'Perfil')+(candidate.age?' · '+candidate.age:'')+(candidate.is_verified?' <span class="tjs-verified">✿ ✓</span>':'')+'</h2>'+
 item('Qué busca',candidate.relationship_goal)+item('Sobre mí',candidate.bio)+item('Ciudad',candidate.city)+item('Distancia aproximada',candidate.approximate_distance_km?'A ~'+candidate.approximate_distance_km+' km':'No disponible')+
 item('Intereses',candidate.common_interests?candidate.common_interests+' intereses en común':'Sin especificar')+
 '<div class="tjs-detail-actions"><button type="button" data-act="share">Compartir perfil</button><button type="button" data-act="block">Bloquear perfil</button><button type="button" data-act="report">Denunciar perfil</button></div>';
 panel.querySelector('.tjs-sheet-close').onclick=()=>backdrop.remove();
 panel.querySelector('[data-act="share"]').onclick=()=>{const link=location.origin; if(navigator.share)navigator.share({title:'TJSDATES',url:link}).catch(()=>{});else navigator.clipboard?.writeText(link).then(()=>toast('Enlace copiado'));};
 panel.querySelector('[data-act="block"]').onclick=async()=>{if(!confirm('¿Bloquear este perfil?'))return;const {error}=await sb.rpc('block_user',{target_user:candidate.id});if(error)return toast(error.message);backdrop.remove();loadDiscovery();};
 panel.querySelector('[data-act="report"]').onclick=()=>{showModal('<h2>Denunciar perfil</h2><p>Confirma que deseas enviar un reporte a moderación.</p><button class="btn danger" id="tjsSendReport">Enviar reporte</button>');byId('tjsSendReport').onclick=async()=>{const {error}=await sb.rpc('create_report',{target_user:candidate.id,report_reason:'fake_profile',report_comment:'Reporte desde perfil ampliado'});if(error)return toast(error.message);closeModal();toast('Reporte enviado');};};
 backdrop.onclick=e=>{if(e.target===backdrop)backdrop.remove();};
 backdrop.appendChild(panel);document.body.appendChild(backdrop);
}
function enhanceDeck(){
 const candidate=typeof candidates!=='undefined'?candidates[candidateIndex]:null;
 const card=byId('currentCard');if(!card||!candidate||card.dataset.tjs81)return;
 card.dataset.tjs81='1';
 const info=card.querySelector('.info');if(!info)return;
 const title=info.querySelector('h3');if(title)title.innerHTML=esc(candidate.display_name||'Perfil')+(candidate.age?' '+candidate.age:'')+(candidate.is_verified?' <span class="tjs-verified" aria-label="Perfil verificado">✿ ✓</span>':'');
 const currentImg=card.querySelector('.heroimg');if(currentImg){
  const left=document.createElement('button'),right=document.createElement('button');left.className='tjs-gallery-side left';right.className='tjs-gallery-side right';
  left.type=right.type='button';left.setAttribute('aria-label','Foto anterior');right.setAttribute('aria-label','Foto siguiente');
  left.onclick=e=>{e.stopPropagation();e.preventDefault();rotate(-1)};right.onclick=e=>{e.stopPropagation();e.preventDefault();rotate(1)};
  currentImg.append(left,right);
 }
 let photos=[candidate.photo].filter(Boolean);let current=0;const uid=candidate.id;
 async function findPhotos(){
  const {data,error}=await sb.from('profile_photos').select('storage_path,position').eq('user_id',uid).eq('moderation_status','approved').order('position').limit(9);
  if(error||!data?.length)return;
  const urls=await Promise.all(data.map(p=>signed(p.storage_path)));photos=urls.filter(Boolean);updatePhoto();
 }
 function updatePhoto(){
  const img=currentImg?.querySelector('img');if(img&&photos[current])img.src=photos[current];
  indicator.textContent=photos.length>1?photos.map((_,i)=>i===current?'●':'·').join(' '):'';
 }
 function rotate(n){if(photos.length<2)return;current=(current+n+photos.length)%photos.length;updatePhoto();}
 const indicator=document.createElement('div');indicator.className='tjs-gallery-dots';card.appendChild(indicator);
 const expand=document.createElement('button');expand.className='tjs-expand';expand.type='button';expand.textContent='↑';expand.setAttribute('aria-label','Ver perfil completo');
 expand.onclick=e=>{e.stopPropagation();profileSheet(candidate)};card.appendChild(expand);
 findPhotos();
 const actions=document.querySelector('#page-discover .actions');
 if(actions&&!actions.querySelector('.tjs-direct-message')){
  const dm=document.createElement('button');dm.className='round tjs-direct-message';dm.type='button';dm.textContent='➤';dm.setAttribute('aria-label','Mensaje directo');
  dm.onclick=()=>showModal('<h2>Mensaje directo</h2><p>US$5 por mensaje directo. Disponible próximamente al confirmar el pago seguro con Stripe.</p>');
  actions.appendChild(dm);
 }
}
const original=typeof renderDeck==='function'?renderDeck:null;
if(original){renderDeck=function(){const out=original.apply(this,arguments);setTimeout(enhanceDeck,0);return out;};}
function movePhotosIntoProfile(){
 const profile=byId('page-profile'),photos=byId('page-photos');if(!profile||!photos||profile.dataset.tjsPhotos)return;
 profile.dataset.tjsPhotos='1';
 const section=document.createElement('section');section.className='tjs-profile-photos';
 section.innerHTML='<div class="sectionhead"><h2>Mis fotos</h2><button class="btn ghost" id="tjsPreviewProfile" type="button">Vista previa</button></div>';
 const photocard=photos.querySelector('.card');if(photocard)section.appendChild(photocard);
 profile.insertBefore(section,profile.querySelector('.card'));
 byId('tjsPreviewProfile').onclick=async()=>{
  await loadProfileForm();const imgs=[...byId('photoGrid').querySelectorAll('img')].map(x=>x.src);
  profileSheet({...profile,id:session.user.id,display_name:byId('pName')?.value,city:byId('pCity')?.value,bio:byId('pBio')?.value,photo:imgs[0]||'',height_cm:byId('pHeight')?.value,occupation:byId('pOccupation')?.value});
 };
 const photoNav=document.querySelector('#app aside [data-page="photos"]');if(photoNav)photoNav.style.display='none';
 const baseGo=go;go=function(page){if(page==='photos')page='profile';const r=baseGo(page);if(page==='profile')loadPhotos();return r;};
 let dragged=null;const grid=byId('photoGrid');
 if(grid){
  grid.addEventListener('pointerdown',e=>{const cell=e.target.closest('.photo');if(!cell)return;dragged=cell;});
  grid.addEventListener('pointerup',async e=>{const target=e.target.closest('.photo');if(!dragged||!target||target===dragged){dragged=null;return;}const all=[...grid.children];const from=all.indexOf(dragged),to=all.indexOf(target);dragged=null;if(from<0||to<0)return;await movePhoto((await sb.from('profile_photos').select('id').eq('user_id',session.user.id).order('position')).data?.[from]?.id,to>from?1:-1);});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',movePhotosIntoProfile);else movePhotosIntoProfile();
})();


/* Phase 82: photo management with accessible per-photo menu. */
(function(){
 const find=id=>document.getElementById(id);
 let replaceId=null;
 function setup(){
  const grid=find('photoGrid');if(!grid||grid.dataset.tjs82)return;grid.dataset.tjs82='1';
  const picker=document.createElement('input');picker.type='file';picker.accept='image/jpeg,image/png,image/webp';picker.hidden=true;picker.id='tjsReplacePicker';
  picker.onchange=async()=>{
   const file=picker.files?.[0];picker.value='';if(!file||!replaceId||!session)return;
   const id=replaceId;replaceId=null;
   if(file.size>10*1024*1024)return toast('Máximo 10 MB');
   try{
    const blob=await compressImage(file),path=session.user.id+'/'+crypto.randomUUID()+'.webp';
    const upload=await sb.storage.from('profile-photos').upload(path,blob,{contentType:'image/webp'});
    if(upload.error)throw upload.error;
    const {data:old,error:readError}=await sb.from('profile_photos').select('storage_path').eq('id',id).eq('user_id',session.user.id).single();
    if(readError)throw readError;
    const {error}=await sb.from('profile_photos').update({storage_path:path,moderation_status:'pending'}).eq('id',id).eq('user_id',session.user.id);
    if(error)throw error;
    if(old?.storage_path)await sb.storage.from('profile-photos').remove([old.storage_path]);
    toast('Foto reemplazada. Pendiente de moderación.');await loadPhotos();
   }catch(error){toast(error.message||'No se pudo reemplazar la foto');}
  };
  grid.appendChild(picker);
  const originalLoad=loadPhotos;
  loadPhotos=async function(){
   await originalLoad();
   const photos=[...grid.querySelectorAll('.photo')];
   const {data}=await sb.from('profile_photos').select('id,position').eq('user_id',session.user.id).order('position');
   photos.forEach((cell,index)=>{
    cell.dataset.photoId=data?.[index]?.id||'';
    cell.draggable=true;
    cell.querySelector('.tools')?.remove();
    const button=document.createElement('button');button.className='tjs-photo-dots';button.type='button';button.textContent='⋯';button.setAttribute('aria-label','Opciones de foto');
    button.onclick=e=>{
     e.stopPropagation();document.querySelectorAll('.tjs-photo-options').forEach(x=>x.remove());
     const menu=document.createElement('div');menu.className='tjs-photo-options';
     const replace=document.createElement('button');replace.textContent='Reemplazar foto';replace.onclick=()=>{replaceId=cell.dataset.photoId;picker.click();menu.remove();};
     const del=document.createElement('button');del.textContent='Eliminar foto';del.onclick=async()=>{menu.remove();if(!confirm('¿Eliminar esta foto?'))return;const {data:old}=await sb.from('profile_photos').select('storage_path').eq('id',cell.dataset.photoId).single();await deletePhoto(cell.dataset.photoId,old?.storage_path||'');};
     menu.append(replace,del);cell.appendChild(menu);
    };
    cell.appendChild(button);
   });
  };
  let source=null;
  grid.addEventListener('dragstart',e=>{source=e.target.closest('.photo');if(e.dataTransfer)e.dataTransfer.effectAllowed='move';});
  grid.addEventListener('dragover',e=>{if(e.target.closest('.photo'))e.preventDefault();});
  grid.addEventListener('drop',async e=>{
   e.preventDefault();const target=e.target.closest('.photo');if(!target||!source||target===source)return;
   const ordered=[...grid.querySelectorAll('.photo')],from=ordered.indexOf(source),to=ordered.indexOf(target);
   ordered.splice(from,1);ordered.splice(to,0,source);
   const ids=ordered.map(x=>x.dataset.photoId).filter(Boolean);
   const {error}=await sb.rpc('reorder_my_profile_photos',{ids});
   if(error)toast('No se pudo reordenar: '+error.message);else toast('Orden actualizado');
   await loadPhotos();source=null;
  });
  grid.addEventListener('dragend',()=>{source=null;});
  loadPhotos();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
