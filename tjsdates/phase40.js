// Phase 40: bilingual ES/EN UI foundation without changing stored user content.

let tjsUiLanguage=(localStorage.getItem('tjsdates_ui_language')||navigator.language||'es').toLowerCase().startsWith('en')?'en':'es';

const tjsI18n={
  es:{
    login:'Iniciar sesión',signup:'Crear cuenta',back:'← Volver',discover:'Descubrir',likes:'Likes',matches:'Matches',alerts:'Alertas',more:'Más',
    explore:'Explorar',plans:'Planes TJ & SD',double:'Double Date',photos:'Fotos',filters:'Filtros',profile:'Perfil',safety:'Seguridad',privacy:'Privacidad',support:'Soporte',premium:'Premium',admin:'Administración',logout:'Salir',
    forYou:'Para ti',localDiscovery:'Descubrimiento local',updateLocation:'📍 Actualizar ubicación',receivedInterest:'Interés recibido',likesYou:'Les gustas',activity:'Actividad',notifications:'Notificaciones',markRead:'Marcar todo leído',
    identity:'Tu identidad',accountPrivacy:'Cuenta y privacidad',supportTitle:'Soporte TJSDATES',securityCenter:'Centro de seguridad',moreOptions:'Más opciones',
    heroBadge:'📍 Tijuana + San Diego · 18+',heroTitle:'Conoce personas cerca de ti.',heroText:'Una experiencia de citas local, segura y moderna. Descubre perfiles, haz match y conversa sin revelar tu ubicación exacta.',
    already:'Ya tengo cuenta',email:'Correo electrónico',password:'Contraseña',birth:'Fecha de nacimiento',enter:'Entrar',language:'Idioma'
  },
  en:{
    login:'Log in',signup:'Create account',back:'← Back',discover:'Discover',likes:'Likes',matches:'Matches',alerts:'Alerts',more:'More',
    explore:'Explore',plans:'TJ & SD Plans',double:'Double Date',photos:'Photos',filters:'Filters',profile:'Profile',safety:'Safety',privacy:'Privacy',support:'Support',premium:'Premium',admin:'Administration',logout:'Log out',
    forYou:'For you',localDiscovery:'Local discovery',updateLocation:'📍 Update location',receivedInterest:'Received interest',likesYou:'Likes you',activity:'Activity',notifications:'Notifications',markRead:'Mark all read',
    identity:'Your identity',accountPrivacy:'Account & privacy',supportTitle:'TJSDATES Support',securityCenter:'Safety center',moreOptions:'More options',
    heroBadge:'📍 Tijuana + San Diego · 18+',heroTitle:'Meet people near you.',heroText:'A local, safe and modern dating experience. Discover profiles, match and chat without revealing your exact location.',
    already:'I already have an account',email:'Email address',password:'Password',birth:'Date of birth',enter:'Log in',language:'Language'
  }
};

function tr(key){return tjsI18n[tjsUiLanguage]?.[key]||tjsI18n.es[key]||key;}

function setNodeText(selector,text){const n=document.querySelector(selector);if(n)n.textContent=text;}
function setButtonHtml(selector,html){const n=document.querySelector(selector);if(n)n.innerHTML=html;}

function applyTjsLanguage(){
  document.documentElement.lang=tjsUiLanguage;
  localStorage.setItem('tjsdates_ui_language',tjsUiLanguage);

  setNodeText('#landing .hero .pill',tr('heroBadge'));
  const hero=document.querySelector('#landing .hero h1');if(hero)hero.textContent=tr('heroTitle');
  setNodeText('#landing .hero p',tr('heroText'));
  const landingBtns=document.querySelectorAll('#landing button');
  if(landingBtns[0])landingBtns[0].textContent=tr('login');if(landingBtns[1])landingBtns[1].textContent=tr('signup');
  if(landingBtns[2])landingBtns[2].textContent=tr('signup');if(landingBtns[3])landingBtns[3].textContent=tr('already');

  setNodeText('#auth .top button',tr('back'));
  setNodeText('#loginTab',tr('enter'));setNodeText('#signupTab',tr('signup'));
  const authLabels=document.querySelectorAll('#auth .field label');
  if(authLabels[0])authLabels[0].textContent=tr('email');if(authLabels[1])authLabels[1].textContent=tr('password');if(authLabels[2])authLabels[2].textContent=tr('birth');
  if($('authSubmit'))$('authSubmit').textContent=(typeof authMode!=='undefined'&&authMode==='signup')?tr('signup'):tr('login');

  const sideMap={discover:['♥ ',tr('discover')],likes:['💗 ',tjsUiLanguage==='en'?'Likes you':'Les gustas'],matches:['💬 ',tr('matches')],notifications:['🔔 ',tr('notifications')],photos:['📷 ',tr('photos')],filters:['⚙️ ',tr('filters')],premium:['✦ ',tr('premium')],safety:['🛡 ',tr('safety')],profile:['👤 ',tr('profile')],explore:['✨ ',tr('explore')],plans:['🎉 ',tr('plans')],double:['👥 ',tr('double')],privacy:['🔐 ',tr('privacy')],support:['💁 ',tr('support')],admin:['🧰 ',tr('admin')]};
  Object.entries(sideMap).forEach(([page,[icon,label]])=>{
    document.querySelectorAll(`aside.side [data-page="${page}"]`).forEach(b=>{
      const badge=b.querySelector('.badge');b.textContent=icon+label;if(badge)b.appendChild(badge);
    });
  });
  const logoutBtn=[...document.querySelectorAll('aside.side .navbtn')].find(b=>!b.dataset.page&&/Salir|Log out/.test(b.textContent));if(logoutBtn)logoutBtn.textContent=tr('logout');

  const bottom=document.querySelector('nav.bottom');if(bottom){
    const labels={discover:['♥',tr('discover')],likes:['💗',tr('likes')],matches:['💬',tr('matches')],notifications:['🔔',tr('alerts')],more:['☰',tr('more')],profile:['👤',tr('profile')]};
    bottom.querySelectorAll('[data-page]').forEach(b=>{const x=labels[b.dataset.page];if(x)b.innerHTML=`${x[0]}<br>${x[1]}`;});
  }

  setNodeText('#page-discover .pill',tr('localDiscovery'));setNodeText('#page-discover h2',tr('forYou'));
  const locBtn=document.querySelector('#page-discover .sectionhead .btn.ghost');if(locBtn)locBtn.textContent=tr('updateLocation');
  setNodeText('#page-likes .pill',tr('receivedInterest'));setNodeText('#page-likes h2',tr('likesYou'));
  setNodeText('#page-notifications .pill',tr('activity'));setNodeText('#page-notifications h2',tr('notifications'));
  const markBtn=document.querySelector('#page-notifications .sectionhead .btn.ghost');if(markBtn)markBtn.textContent=tr('markRead');
  setNodeText('#page-profile .pill',tr('identity'));setNodeText('#page-profile h2',tr('profile'));
  setNodeText('#page-safety h2',tr('securityCenter'));
  setNodeText('#page-privacy h2',tr('accountPrivacy'));
  setNodeText('#page-support h2',tr('supportTitle'));
  setNodeText('#page-explore h2',tr('explore'));
  setNodeText('#page-plans h2',tr('plans'));

  document.querySelectorAll('.tjs-language-btn').forEach(b=>{b.textContent=tjsUiLanguage==='es'?'EN':'ES';b.title=tjsUiLanguage==='es'?'Switch to English':'Cambiar a español';});
}

function toggleTjsLanguage(){tjsUiLanguage=tjsUiLanguage==='es'?'en':'es';applyTjsLanguage();if(typeof normalizePhase39Labels==='function')normalizePhase39Labels();}

function injectLanguageControls(){
  if(!document.querySelector('.tjs-language-btn')){
    document.querySelectorAll('#landing .top .row,#auth .top').forEach(host=>{
      const b=document.createElement('button');b.type='button';b.className='btn ghost tjs-language-btn';b.onclick=toggleTjsLanguage;host.appendChild(b);
    });
  }
  const side=document.querySelector('aside.side');
  if(side&&!side.querySelector('.tjs-language-btn')){
    const b=document.createElement('button');b.type='button';b.className='navbtn tjs-language-btn';b.onclick=toggleTjsLanguage;b.textContent=tjsUiLanguage==='es'?'EN':'ES';
    const spacer=side.querySelector('.spacer');side.insertBefore(b,spacer||null);
  }
  applyTjsLanguage();
}

function bilingualMobileMore(){
  if(typeof showModal!=='function')return;
  const admin=adminRole?`<button class="btn ghost wide" onclick="closeModal();go('admin')">🧰 ${tr('admin')}</button>`:'';
  showModal(`<div class="phase39-mobile-only"><div class="pill">${tr('moreOptions')}</div><h2 style="margin-top:8px">TJSDATES</h2><div class="moregrid">
    <button class="btn ghost" onclick="closeModal();go('explore')">✨ ${tr('explore')}</button><button class="btn ghost" onclick="closeModal();go('plans')">🎉 ${tr('plans')}</button>
    <button class="btn ghost" onclick="closeModal();go('double')">👥 ${tr('double')}</button><button class="btn ghost" onclick="closeModal();go('photos')">📷 ${tr('photos')}</button>
    <button class="btn ghost" onclick="closeModal();go('filters')">⚙️ ${tr('filters')}</button><button class="btn ghost" onclick="closeModal();go('profile')">👤 ${tr('profile')}</button>
    <button class="btn ghost" onclick="closeModal();go('safety')">🛡 ${tr('safety')}</button><button class="btn ghost" onclick="closeModal();go('privacy')">🔐 ${tr('privacy')}</button>
    <button class="btn ghost" onclick="closeModal();go('support')">💁 ${tr('support')}</button><button class="btn ghost" onclick="closeModal();go('premium')">✦ ${tr('premium')}</button>${admin}</div></div>`);
}

const p40Go=typeof go==='function'?go:null;
if(p40Go)go=function(page){p40Go(page);setTimeout(applyTjsLanguage,40);};

const p40AuthTab=typeof authTab==='function'?authTab:null;
if(p40AuthTab)authTab=function(mode){p40AuthTab(mode);setTimeout(applyTjsLanguage,0);};

const p40Timer=setInterval(()=>{
  injectLanguageControls();
  if(typeof showMobileMore==='function'){showMobileMore=bilingualMobileMore;clearInterval(p40Timer);}
},180);
setTimeout(()=>{injectLanguageControls();if(typeof showMobileMore==='function')showMobileMore=bilingualMobileMore;},1600);

if(!document.querySelector('script[data-tjs-phase41]')){
  const s=document.createElement('script');s.src='phase41.js?v=1';s.defer=true;s.dataset.tjsPhase41='1';document.body.appendChild(s);
}
