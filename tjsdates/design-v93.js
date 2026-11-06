/* TJSDATES v93: faithful reference dashboard, reliable single-action controls and synthetic demo portraits. */
(function(){
  'use strict';
  if(window.__t93Mounted) return;
  const app=document.getElementById('app'), side=app?.querySelector('.side'), rail=app?.querySelector('.t92-right'), top=app?.querySelector('.t92-topbar');
  if(!app||!side||!rail||!top)return;
  window.__t93Mounted=true;
  app.classList.add('t93-ready','t92-app');
  const $q=(s,root=document)=>root.querySelector(s);
  const iconPaths={
   heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/>',
   home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
   compass:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.9 5.5-5.5 2.9 2.9-5.5Z"/>',
   message:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z"/>',
   bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
   flame:'<path d="M12 22c4.4 0 8-3.6 8-8 0-3-1.2-5.3-4-8-.3 2.1-1.5 3.5-3 4-1-4-3.5-6-6-8 .5 4-3 6.1-3 12 0 4.4 3.6 8 8 8Z"/>',
   eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
   star:'<path d="m12 2 3.1 6.3L22 9.3l-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1Z"/>',
   pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
   shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
   crown:'<path d="m2 8 5 4 5-8 5 8 5-4-2 12H4L2 8Z"/><path d="M4 20h16"/>',
   gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06-1.96 1.96-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.48V20h-2.78v-.11a1.6 1.6 0 0 0-1-1.48 1.6 1.6 0 0 0-1.77.32l-.06.06-1.96-1.96.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.48-1H4v-2.78h.11a1.6 1.6 0 0 0 1.48-1 1.6 1.6 0 0 0-.32-1.77l-.06-.06L7.17 6.4l.06.06a1.6 1.6 0 0 0 1.77.32 1.6 1.6 0 0 0 1-1.48V5h2.78v.11a1.6 1.6 0 0 0 1 1.48 1.6 1.6 0 0 0 1.77-.32l.06-.06 1.96 1.96-.06.06a1.6 1.6 0 0 0-.32 1.77 1.6 1.6 0 0 0 1.48 1H20v2.78h-.11a1.6 1.6 0 0 0-1.49 1Z"/>',
   arrowBack:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>',
   x:'<path d="M5 5 19 19M19 5 5 19"/>',
   bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
   logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
   mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
   plus:'<path d="M12 5v14M5 12h14"/>',
   calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
   check:'<path d="m5 12 4 4L19 6"/>'
  };
  function ico(key,extra=''){return '<svg class="t93-icon '+extra+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[key]||'')+'</svg>'}
  const titleBrand='<span class="t93-logo">'+ico('heart')+'</span><span class="t93-wordmark"><strong>TJS<span>DATES</span></strong><small>Citas en Tijuana y San Diego</small></span>';
  top.querySelector('.t92-brand').innerHTML=titleBrand;
  top.querySelector('.t92-topnav').innerHTML=[
    ['discover','home','Inicio'],['explore','compass','Explorar'],['matches','heart','Matches'],['messages','message','Mensajes'],['notifications','bell','Notificaciones']
  ].map(([p,i,n])=>'<button data-t92-page="'+p+'" type="button">'+ico(i)+n+'</button>').join('');
  top.querySelectorAll('[data-t92-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.t92Page==='messages'?'matches':b.dataset.t92Page)));
  const user=$q('.t92-user',top);user.innerHTML='<span class="t92-avatar">♥</span><span class="t92-user-name">Mi perfil</span><span class="t93-chevron">⌄</span>';
  user.onclick=()=>go('profile');
  const self=$q('.t92-self',side);
  self.innerHTML='<div class="t92-self-head"><div class="t92-self-avatar">♥</div><div><div class="t92-self-name">Mi perfil</div><p class="t93-profile-link">Ver mi perfil</p></div></div><div class="t93-completion"><span>Perfil <b id="t93-completion-n">—</b> completo</span><div class="t93-progress"><span id="t93-completion-bar"></span></div></div>';
  self.querySelector('.t92-self-head').onclick=()=>go('profile');
  const menu=document.createElement('nav');menu.className='t93-sidemenu';menu.setAttribute('aria-label','Secciones de TJSDATES');
  const menuItems=[
   ['discover','flame','Descubrir'],['matches','heart','Matches'],['messages','message','Mensajes'],['visits','eye','Visitas'],['likes','heart','Me gustas'],['superlikes','star','Super Likes'],['nearby','pin','Personas cerca'],
   ['verification','shield','Verificación'],['premium','crown','Membresía Premium'],['settings','gear','Configuración']
  ];
  menu.innerHTML=menuItems.map(([p,i,label],idx)=>'<button type="button" class="t93-navbtn'+(idx===0?' selected':'')+'" data-t93-page="'+p+'">'+ico(i)+'<span>'+label+'</span></button>').join('')+
    '<div class="t93-region"><div>'+ico('pin')+' <b>Tijuana, MX</b><span>⌄</span></div><small>🇺🇸 Cambiando a San Diego, CA</small></div>';
  menu.insertAdjacentHTML('beforeend','<button type="button" class="t93-navbtn t93-logout" aria-label="Cerrar sesión">'+ico('logout')+'<span>Cerrar sesión</span></button>');
  side.insertBefore(menu,side.querySelector('.spacer')||null);
  menu.querySelectorAll('[data-t93-page]').forEach(btn=>btn.onclick=()=>{
    const p=btn.dataset.t93Page;
    const route=({messages:'matches',visits:'likes',superlikes:'premium',nearby:'discover',verification:'profile',settings:'profile'})[p]||p;
    if(p!==route)toast(({visits:'Las visitas estarán disponibles al activarse el seguimiento.',superlikes:'Revisa tus beneficios de Super Likes en Premium.',nearby:'Los perfiles cercanos aparecen en Descubrir.',verification:'Busca Verificar perfil dentro de Mi perfil.',settings:'La configuración está dentro de tu perfil.'})[p]||'');
    go(route);
  });
  menu.querySelector('.t93-region').onclick=()=>go('filters');
  menu.querySelector('.t93-logout').onclick=()=>logout();
  const sideFooter=$q('.t92-sidefooter',side);sideFooter?.remove();
  const footer=document.createElement('div');footer.className='t93-sidebar-premium';footer.innerHTML='<div>'+ico('crown')+' <b>¡Haz más con Premium!</b></div><p>Likes, filtros y mayor visibilidad</p><button type="button">Actualizar a Premium</button>';footer.querySelector('button').onclick=()=>go('premium');side.appendChild(footer);
  const head=$q('.t92-heading');
  if(head)head.innerHTML='<h1>Descubre personas <span>cerca de ti</span></h1><p>Conecta con personas reales en Tijuana y San Diego</p>';
  rail.innerHTML='<section class="t92-panel t92-premium t93-premium"><div class="t93-premium-crown">'+ico('crown')+'</div><h3>'+ico('crown')+' TJSDATES <em>Premium</em></h3><p>Más matches, más visibilidad y acceso a funciones exclusivas.</p><button type="button" data-route="premium">Hazte Premium '+ico('plus')+'</button></section>'+
    '<section class="t92-panel t93-activity"><h3>▥ Tu actividad</h3><div class="t93-stats"><div>'+ico('eye')+'<b id="t93-visits">—</b><small>Visitas</small></div><div>'+ico('heart')+'<b id="t93-likes">—</b><small>Me gustas</small></div><div>'+ico('star')+'<b id="t93-superlikes">—</b><small>Super Likes</small></div></div></section>'+
    '<section class="t92-panel t93-verified"><h3><span class="t93-blue-check">'+ico('check')+'</span> Personas verificadas</h3><p>Conecta con usuarios reales y verificados.</p><p class="t93-verified-empty">Los perfiles verificados aparecerán aquí cuando estén disponibles.</p><button type="button" data-route="profile">Verifica tu perfil</button></section>'+
    '<section class="t92-panel t93-events"><h3>'+ico('calendar')+' Eventos en la zona</h3><p>Conoce gente en eventos y lugares populares de Tijuana y San Diego.</p><button type="button" data-route="plans">Explorar planes '+ico('plus')+'</button></section>';
  rail.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));
  const actions=$q('#page-discover .actions');
  if(actions){
    const actionDefs=[['undo','arrowBack','Volver al perfil anterior'],['pass','x','No me gusta'],['star','star','Super Like'],['like','heart','Me gusta'],['boost','bolt','Boost Premium'],['voice','mic','Ir a mensajes']];
    actions.replaceChildren();
    actionDefs.forEach(([cls,key,label])=>{
      const b=document.createElement('button');b.type='button';b.className='round t93-action t93-'+cls;b.setAttribute('aria-label',label);b.title=label;b.innerHTML=ico(key);
      b.addEventListener('click',()=>{
        if(cls==='undo')undoLast();
        else if(cls==='pass')passCurrent();
        else if(cls==='star')superLikeCurrent();
        else if(cls==='like')likeCurrent();
        else if(cls==='boost')go('premium');
        else if(cls==='voice'){go('matches');toast('Abre un match para conversar. El envío de notas de voz aún no está activado.')}
      });
      actions.appendChild(b);
    });
  }
  // Keep just the six intended controls even if a legacy enhancement injects extras.
  if(actions&&typeof MutationObserver!=='undefined'){
    const controls=new MutationObserver(()=>{
      for(const child of Array.from(actions.children)){
        if(!child.classList.contains('t93-action'))child.remove();
      }
    });
    controls.observe(actions,{childList:true});
  }
  // Guard against accidental double actions (click and swipe in the same gesture).
  let actionBusy=false;
  for(const name of ['likeCurrent','passCurrent','superLikeCurrent']){
    const handler=window[name];
    if(typeof handler!=='function')continue;
    window[name]=function(){
      if(actionBusy)return;
      actionBusy=true;
      const args=arguments,ctx=this;
      try{
        const value=handler.apply(ctx,args);
        Promise.resolve(value).finally(()=>setTimeout(()=>{actionBusy=false},400));
        return value;
      }catch(e){actionBusy=false;throw e;}
    };
  }
  // Synthetic face collage: independent AI-generated identity in each tile.
  // SFHQ-T2I, MIT license, source: github.com/SelfishGene/SFHQ-T2I-dataset.
  const base='https://raw.githubusercontent.com/SelfishGene/SFHQ-T2I-dataset/main/figures/';
  const sources=[
   {url:base+'textual_search_2_Hair Style x Sex_top_10_matches.jpg',rows:6,cols:10,count:60},
   {url:base+'textual_search_2_Makeup_top_9_matches.jpg',rows:5,cols:9,count:45},
   {url:base+'textual_search_2_Facial Hair_top_10_matches.jpg',rows:6,cols:10,count:60}
  ];
  const femaleIndices=Array.from({length:60},(_,i)=>[0,i]).concat(Array.from({length:20},(_,i)=>[1,i]));
  const maleIndices=Array.from({length:20},(_,i)=>[2,i]);
  // Preview circle portraits are clearly labelled as synthetic examples, not verified members.
  const miniHost=$q('.t93-verified-empty',rail);
  if(miniHost){
    miniHost.textContent='Muestras con IA · no son perfiles verificados';
    const mini=document.createElement('div');mini.className='t93-mini-portraits';
    [1,3,7,9].forEach(col=>{
      const b=document.createElement('span');b.className='t93-mini-portrait';
      b.style.backgroundImage='url("'+encodeURI(sources[0].url)+'")';
      b.style.backgroundSize=(sources[0].cols*100)+'% '+(sources[0].rows*100)+'%';
      b.style.backgroundPosition=(100*col/(sources[0].cols-1))+'% 0%';
      b.title='Retrato sintético de demostración';mini.appendChild(b);
    });
    const add=document.createElement('button');add.type='button';add.className='t93-mini-add';add.title='Ver 100 perfiles de demostración';add.innerHTML=ico('plus');add.onclick=()=>window.tjsOpenDemoProfiles?.();mini.appendChild(add);
    miniHost.before(mini);
  }
  const demos=window.TJSDATES_DEMO_PROFILES;
  if(Array.isArray(demos))demos.forEach((d,i)=>{
    const [group,cell]=(i<80?femaleIndices[i]:maleIndices[i-80]);
    const src=sources[group],row=Math.floor(cell/src.cols),col=cell%src.cols;
    d.photo='';d.ai_generated=true;d.is_demo=true;d.is_verified=false;
    d.syntheticSprite={url:src.url,rows:src.rows,cols:src.cols,row,col};
    d.image_source='SFHQ-T2I';d.is_online=false;
  });
  const rawRender=renderDeck;
  let openingDemo=false;
  renderDeck=function(){
    if(session&&candidates.length===0&&!openingDemo&&window.TJSDATES_DEMO_PROFILES?.length){
      openingDemo=true;
      try{window.tjsOpenDemoProfiles?.()}finally{openingDemo=false}
      return;
    }
    const result=rawRender.apply(this,arguments);
    const d=candidates?.[candidateIndex],card=$q('#currentCard');if(!d||!card)return result;
    const wrap=$q('.heroimg',card);
    if(d.is_demo&&wrap){
      card.classList.add('t93-demo-card');
      wrap.querySelectorAll('img,.t93-portrait').forEach(n=>n.remove());
      const sprite=d.syntheticSprite;
      if(sprite){
        const portrait=document.createElement('div');portrait.className='t93-portrait';
        portrait.style.backgroundImage='url("'+encodeURI(sprite.url)+'")';
        portrait.style.backgroundSize=(sprite.cols*100)+'% '+(sprite.rows*100)+'%';
        portrait.style.backgroundPosition=(sprite.cols===1?'50':100*sprite.col/(sprite.cols-1))+'% '+(sprite.rows===1?'50':100*sprite.row/(sprite.rows-1))+'%';
        wrap.prepend(portrait);
      }
      const info=$q('.info',card);if(info&&!$q('.t93-disclosure',info)){const p=document.createElement('small');p.className='t93-disclosure';p.textContent='Perfil ficticio · Imagen generada con IA';info.append(p)}
      $q('.t92-online',card)?.replaceChildren(document.createTextNode('Demostración'));
      $q('.tjs-small-demo',card)?.remove();
    }
    const dots=$q('.t92-photo-menu',card);if(dots){dots.textContent='•••';dots.setAttribute('aria-label','Más opciones de perfil')}
    if(!d.is_demo&&wrap&&!wrap.querySelector('img'))wrap.classList.add('t93-photo-fallback');
    return result;
  };
  const baseLoad=loadDiscovery;
  loadDiscovery=async function(){
    try{const out=await baseLoad.apply(this,arguments);
      if(session&&(!candidates?.length)&&window.TJSDATES_DEMO_PROFILES?.length)window.tjsOpenDemoProfiles?.();
      return out;
    }catch(err){console.error('Discovery failed',err);if(session&&window.TJSDATES_DEMO_PROFILES?.length)window.tjsOpenDemoProfiles?.()}
  };
  async function loadOwnAvatar(){
    if(!session?.user?.id||typeof signed!=='function')return;
    try{
      const {data,error}=await sb.from('profile_photos').select('storage_path').eq('user_id',session.user.id).eq('moderation_status','approved').order('is_primary',{ascending:false}).limit(1);
      if(error||!data?.length)return;
      const url=await signed(data[0].storage_path);if(!url)return;
      for(const el of [$q('.t92-self-avatar',self),$q('.t92-avatar',top)]){
        if(el){el.style.backgroundImage='url("'+url+'")';el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.textContent='';}
      }
    }catch(e){console.warn('Avatar unavailable',e)}
  }
  const updateIdentity=()=>{
    const name=profile?.display_name||'Mi perfil';
    $q('.t92-self-name',self).textContent=name;
    $q('.t92-user-name',top).textContent=name;
    const fields=[profile?.display_name,profile?.bio,profile?.city,profile?.occupation,profile?.height_cm,profile?.gender];
    const percentage=Math.round(100*fields.filter(Boolean).length/fields.length);
    const c=$q('#t93-completion-n'),bar=$q('#t93-completion-bar');
    if(c)c.textContent=percentage+'%';if(bar)bar.style.width=percentage+'%';
    const current=$q('main.content section:not(.hidden)')?.id||'page-discover';
    const page=current.replace('page-','');
    menu.querySelectorAll('[data-t93-page]').forEach(b=>b.classList.toggle('selected',b.dataset.t93Page===page));
    top.querySelectorAll('[data-t92-page]').forEach(b=>b.classList.toggle('t92-current',b.dataset.t92Page===page));
  };
  const nextGo=go;
  go=function(){const r=nextGo.apply(this,arguments);updateIdentity();return r};
  async function updateActivity(){
    if(!session?.user?.id)return;
    const id=session.user.id;
    const readCount=async(table,column,extra)=>{try{let q=sb.from(table).select('id',{count:'exact',head:true}).eq(column,id);if(extra)q=extra(q);const {count,error}=await q;return error?null:count}catch{return null}};
    const [likes,superlikes]=await Promise.all([readCount('likes','to_user_id'),readCount('likes','to_user_id',q=>q.eq('like_type','highlighted'))]);
    const show=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=Number.isInteger(v)?String(v):'—'};
    show('t93-likes',likes);show('t93-superlikes',superlikes);show('t93-visits',null);
  }
  // Avoid a flash of the previous layout: the main application remains hidden until this script completes.
  updateIdentity();
  setTimeout(()=>{if(session&&window.TJSDATES_DEMO_PROFILES?.length){if(!candidates.length)window.tjsOpenDemoProfiles?.();else if(candidates[candidateIndex]?.is_demo)renderDeck();}updateActivity();loadOwnAvatar()},250);
  window.addEventListener('pageshow',()=>{updateIdentity();updateActivity();if(typeof releaseStartupGate==='function')releaseStartupGate()});
  if(typeof releaseStartupGate==='function')releaseStartupGate();
})();