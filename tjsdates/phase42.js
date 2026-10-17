// Phase 42: expand ES/EN coverage across onboarding, profile, filters, photos, safety and chat.

const tjsI18n42={
  es:{
    onboardingBadge:'Configuración inicial',completeProfile:'Completa tu perfil',name:'Nombre',city:'Ciudad',gender:'Género',goal:'Objetivo',bio:'Biografía',meetWho:'¿A quién quieres conocer?',women:'Mujeres',men:'Hombres',otherGenders:'Otros géneros',saveContinue:'Guardar y continuar',
    upToPhotos:'Hasta 9 fotos',yourPhotos:'Tus fotos',addPhotos:'＋ Agregar fotos',photoNote:'JPEG, PNG o WebP · máximo 10 MB por archivo. Las fotos nuevas pasan por moderación.',
    controlSee:'Controla lo que ves',minAge:'Edad mínima',maxAge:'Edad máxima',maxDistance:'Distancia máxima',showMe:'Mostrarme',saveFilters:'Guardar filtros',
    pronouns:'Pronombres',occupation:'Ocupación',school:'Escuela / universidad',height:'Altura (cm)',saveChanges:'Guardar cambios',saveApprox:'📍 Guardar ubicación aproximada',
    safetyFirst:'Tu seguridad primero',blockReport:'🛡 Bloquear y reportar',blockReportText:'Puedes bloquear o reportar desde cualquier match. Un bloqueo impide contacto y termina el match activo.',privateLocation:'📍 Ubicación privada',privateLocationText:'TJSDATES no muestra coordenadas exactas. Solo usa distancia aproximada para descubrimiento.',recommendations:'🚨 Recomendaciones',recommendationsText:'Primera cita en lugar público, avisa a alguien de confianza y nunca envíes dinero a una persona que acabas de conocer.',adultsOnly:'18+ únicamente',adultsOnlyText:'Los reportes por posible menor de edad se consideran de alta prioridad para moderación.',
    report:'Reportar',block:'Bloquear',unmatch:'Cancelar match',messagePlaceholder:'Escribe un mensaje...',send:'Enviar',refresh:'Actualizar',close:'Cerrar',
    noMore:'No hay más perfiles con tus filtros actuales.',changeFilters:'Cambiar filtros',verified:'Verificado',commonInterests:'intereses en común'
  },
  en:{
    onboardingBadge:'Initial setup',completeProfile:'Complete your profile',name:'Name',city:'City',gender:'Gender',goal:'Goal',bio:'Bio',meetWho:'Who would you like to meet?',women:'Women',men:'Men',otherGenders:'Other genders',saveContinue:'Save and continue',
    upToPhotos:'Up to 9 photos',yourPhotos:'Your photos',addPhotos:'＋ Add photos',photoNote:'JPEG, PNG or WebP · maximum 10 MB per file. New photos go through moderation.',
    controlSee:'Control what you see',minAge:'Minimum age',maxAge:'Maximum age',maxDistance:'Maximum distance',showMe:'Show me',saveFilters:'Save filters',
    pronouns:'Pronouns',occupation:'Occupation',school:'School / university',height:'Height (cm)',saveChanges:'Save changes',saveApprox:'📍 Save approximate location',
    safetyFirst:'Your safety comes first',blockReport:'🛡 Block and report',blockReportText:'You can block or report from any match. Blocking prevents contact and ends an active match.',privateLocation:'📍 Private location',privateLocationText:'TJSDATES never shows exact coordinates. It only uses approximate distance for discovery.',recommendations:'🚨 Recommendations',recommendationsText:'Meet in a public place, tell someone you trust and never send money to someone you just met.',adultsOnly:'18+ only',adultsOnlyText:'Reports involving a possible minor are treated as high priority for moderation.',
    report:'Report',block:'Block',unmatch:'Unmatch',messagePlaceholder:'Write a message...',send:'Send',refresh:'Refresh',close:'Close',
    noMore:'There are no more profiles with your current filters.',changeFilters:'Change filters',verified:'Verified',commonInterests:'interests in common'
  }
};

function tr42(key){return tjsI18n42[tjsUiLanguage]?.[key]||tjsI18n42.es[key]||key;}
function setText42(selector,text){const e=document.querySelector(selector);if(e)e.textContent=text;}
function setNthLabel42(parent,index,text){const labels=document.querySelectorAll(`${parent} .field label`);if(labels[index])labels[index].textContent=text;}

function applyCoreBilingual42(){
  // Onboarding
  setText42('#onboarding .pill',tr42('onboardingBadge'));setText42('#onboarding h2',tr42('completeProfile'));
  setNthLabel42('#onboarding',0,tr42('name'));setNthLabel42('#onboarding',1,tr42('city'));setNthLabel42('#onboarding',2,tr42('gender'));setNthLabel42('#onboarding',3,tr42('goal'));setNthLabel42('#onboarding',4,tr42('bio'));setNthLabel42('#onboarding',5,tr42('meetWho'));
  const obChips=document.querySelectorAll('#obGenders .chip');if(obChips[0])obChips[0].textContent=tr42('women');if(obChips[1])obChips[1].textContent=tr42('men');if(obChips[2])obChips[2].textContent=tr42('otherGenders');
  const obSave=document.querySelector('#onboarding button[onclick="finishOnboarding()"]');if(obSave)obSave.textContent=tr42('saveContinue');

  // Photos
  setText42('#page-photos .pill',tr42('upToPhotos'));setText42('#page-photos h2',tr42('yourPhotos'));
  const add=document.querySelector('#page-photos button[onclick*="photoInput"]');if(add)add.textContent=tr42('addPhotos');
  const pnote=document.querySelector('#page-photos .uploadbox .note');if(pnote)pnote.textContent=tr42('photoNote');

  // Filters
  setText42('#page-filters .pill',tr42('controlSee'));setText42('#page-filters h2',tjsUiLanguage==='en'?'Filters':'Filtros');
  setNthLabel42('#page-filters',0,tr42('minAge'));setNthLabel42('#page-filters',1,tr42('maxAge'));setNthLabel42('#page-filters',2,tr42('maxDistance'));setNthLabel42('#page-filters',3,tr42('showMe'));
  const fchips=document.querySelectorAll('#fGenders .chip');if(fchips[0])fchips[0].textContent=tr42('women');if(fchips[1])fchips[1].textContent=tr42('men');if(fchips[2])fchips[2].textContent=tr42('otherGenders');
  const fsave=document.querySelector('#page-filters button[onclick="saveFilters()"]');if(fsave)fsave.textContent=tr42('saveFilters');

  // Profile
  const profileLabels=document.querySelectorAll('#page-profile .field label');
  const profileTexts=[tr42('name'),tr42('city'),tr42('pronouns'),tr42('occupation'),tr42('school'),tr42('height'),tr42('bio')];profileTexts.forEach((t,i)=>{if(profileLabels[i])profileLabels[i].textContent=t});
  const profileSave=document.querySelector('#page-profile button[onclick="saveProfile()"]');if(profileSave)profileSave.textContent=tr42('saveChanges');
  const profileLoc=document.querySelector('#page-profile button[onclick="requestLocation()"]');if(profileLoc)profileLoc.textContent=tr42('saveApprox');

  // Safety cards
  setText42('#page-safety .pill',tr42('safetyFirst'));
  const cards=document.querySelectorAll('#page-safety .safetygrid .card');
  const safetyData=[[tr42('blockReport'),tr42('blockReportText')],[tr42('privateLocation'),tr42('privateLocationText')],[tr42('recommendations'),tr42('recommendationsText')],[tr42('adultsOnly'),tr42('adultsOnlyText')]];
  safetyData.forEach((x,i)=>{const c=cards[i];if(!c)return;const h=c.querySelector('h3'),p=c.querySelector('p');if(h)h.textContent=x[0];if(p)p.textContent=x[1]});

  // Chat controls
  const chatBtns=document.querySelectorAll('#chatTitle button');if(chatBtns[0])chatBtns[0].textContent=tr42('report');if(chatBtns[1])chatBtns[1].textContent=tr42('block');if(chatBtns[2])chatBtns[2].textContent=tr42('unmatch');
  const ci=$('chatInput');if(ci)ci.placeholder=tr42('messagePlaceholder');const send=ci?.parentElement?.querySelector('button');if(send)send.textContent=tr42('send');

  // Generic refresh buttons and modal close
  document.querySelectorAll('button.btn.ghost').forEach(b=>{if(['Actualizar','Refresh'].includes(b.textContent.trim()))b.textContent=tr42('refresh')});
  const modalClose=document.querySelector('#modal .row button');if(modalClose)modalClose.textContent=tr42('close');
}

// Make the empty discovery state bilingual every time the deck renders.
const p42RenderDeck=typeof renderDeck==='function'?renderDeck:null;
if(p42RenderDeck)renderDeck=function(){
  p42RenderDeck();
  const empty=document.querySelector('#deck .empty');
  if(empty&&!candidates[candidateIndex])empty.innerHTML=`${tr42('noMore')}<br><br><button class="btn" onclick="go('filters')">${tr42('changeFilters')}</button>`;
  const card=$('currentCard');if(card&&tjsUiLanguage==='en'){
    const verified=card.querySelector('.pill');if(verified&&verified.textContent.includes('Verificado'))verified.textContent='✓ '+tr42('verified');
    const paras=card.querySelectorAll('.info p');paras.forEach(p=>{p.innerHTML=p.innerHTML.replace(' intereses en común',` ${tr42('commonInterests')}`)});
  }
};

const p42Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p42Apply)applyTjsLanguage=function(){p42Apply();applyCoreBilingual42();if(typeof renderDeck==='function'&&document.querySelector('#deck'))renderDeck();};

const p42Go=typeof go==='function'?go:null;
if(p42Go)go=function(page){p42Go(page);setTimeout(applyCoreBilingual42,50);};

setTimeout(applyCoreBilingual42,180);
window.addEventListener('pageshow',()=>setTimeout(applyCoreBilingual42,80));
