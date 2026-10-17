// Phase 43: bilingual secondary flows + accessibility labels for mobile/desktop.

const tjsI18n43={
  es:{
    exploreVibe:'Descubre por vibra',category:'Categoría',profiles:'Perfiles',categories:'← Categorías',searching:'Buscando perfiles...',noExplore:'No encontramos perfiles en esta categoría con tus filtros actuales.',like:'♥ Me gusta',likeSent:'✓ Like enviado',
    leaveScreen:'Sal de la pantalla',createPlan:'Crear un plan',planHelp:'Propón una actividad pública para conocer personas. No publiques domicilios particulares.',planTitle:'Ej. Café en Zona Río',planDescription:'Describe el plan, punto público de encuentro y detalles',create:'Crear plan',join:'Unirme',leave:'Salir',yourPlan:'Tu plan',groupChat:'Chat grupal',groupConversation:'Conversación del plan',writeGroup:'Escribe al grupo...',
    pairConnections:'Conexiones en pareja',formDouble:'Forma tu pareja para Double Date',doubleHelp:'Genera un código temporal y compártelo únicamente con la persona que será tu compañero/a. El código vence automáticamente.',generateCode:'Generar código',refreshState:'Actualizar estado',receivedCode:'¿Te enviaron un código?',codePlaceholder:'Código de 8 caracteres',discoverCouples:'Descubrir parejas',fourConnections:'Conexiones de 4',doubleMatches:'Matches Double Date',
    supportRequest:'Nueva solicitud',subject:'Asunto',description:'Descripción',sendRequest:'Enviar solicitud',myRequests:'Mis solicitudes',replySupport:'Responder a soporte...',
    privacy:'Privacidad',securitySession:'Seguridad de sesión',downloadData:'Descargar mis datos',deleteAccount:'Eliminar cuenta',cancelDelete:'Cancelar eliminación',
    premiumControl:'Más control y visibilidad',freePlan:'Plan Gratis',extraPurchases:'Compras adicionales',
    skipContent:'Saltar al contenido',mainNav:'Navegación principal',mobileNav:'Navegación móvil'
  },
  en:{
    exploreVibe:'Discover by vibe',category:'Category',profiles:'Profiles',categories:'← Categories',searching:'Finding profiles...',noExplore:'We could not find profiles in this category with your current filters.',like:'♥ Like',likeSent:'✓ Like sent',
    leaveScreen:'Get off the screen',createPlan:'Create a plan',planHelp:'Suggest a public activity to meet people. Do not post private home addresses.',planTitle:'Example: Coffee in Zona Río',planDescription:'Describe the plan, public meeting point and details',create:'Create plan',join:'Join',leave:'Leave',yourPlan:'Your plan',groupChat:'Group chat',groupConversation:'Plan conversation',writeGroup:'Write to the group...',
    pairConnections:'Paired connections',formDouble:'Create your Double Date pair',doubleHelp:'Generate a temporary code and share it only with the person who will be your partner. The code expires automatically.',generateCode:'Generate code',refreshState:'Refresh status',receivedCode:'Did someone send you a code?',codePlaceholder:'8-character code',discoverCouples:'Discover couples',fourConnections:'Connections of 4',doubleMatches:'Double Date matches',
    supportRequest:'New request',subject:'Subject',description:'Description',sendRequest:'Send request',myRequests:'My requests',replySupport:'Reply to support...',
    privacy:'Privacy',securitySession:'Session security',downloadData:'Download my data',deleteAccount:'Delete account',cancelDelete:'Cancel deletion',
    premiumControl:'More control and visibility',freePlan:'Free plan',extraPurchases:'Additional purchases',
    skipContent:'Skip to content',mainNav:'Main navigation',mobileNav:'Mobile navigation'
  }
};
function tr43(k){return tjsI18n43[tjsUiLanguage]?.[k]||tjsI18n43.es[k]||k;}

function applySecondaryBilingual43(){
  // Explore
  const explore=$('page-explore');if(explore){const pill=explore.querySelector('.sectionhead .pill');if(pill)pill.textContent=tr43('exploreVibe');const back=$('exploreResultsWrap')?.querySelector('.sectionhead button');if(back)back.textContent=tr43('categories');if($('exploreResultPill'))$('exploreResultPill').textContent=tr43('category');}
  document.querySelectorAll('#explorePeople .exploreperson button').forEach(b=>{if(!/✓|Match/.test(b.textContent))b.textContent=tr43('like')});

  // Plans
  const plans=$('page-plans');if(plans){const pill=plans.querySelector('.sectionhead .pill');if(pill)pill.textContent=tr43('leaveScreen');const creator=plans.querySelector('.card');if(creator){const h=creator.querySelector('h3');if(h)h.textContent=tr43('createPlan');const note=creator.querySelector('.note');if(note)note.textContent=tr43('planHelp');const title=$('planTitle');if(title)title.placeholder=tr43('planTitle');const desc=$('planDesc');if(desc)desc.placeholder=tr43('planDescription');const btn=creator.querySelector('button[onclick="createPlanTJ()"]');if(btn)btn.textContent=tr43('create');}}
  document.querySelectorAll('#plansList button').forEach(b=>{const t=b.textContent.trim();if(['Unirme','Join'].includes(t))b.textContent=tr43('join');if(['Salir','Leave'].includes(t))b.textContent=tr43('leave')});
  document.querySelectorAll('#plansList .pill').forEach(p=>{if(['Tu plan','Your plan'].includes(p.textContent.trim()))p.textContent=tr43('yourPlan')});
  if($('planChatCard')){const p=$('planChatCard').querySelector('.pill');if(p)p.textContent=tr43('groupChat');if($('planChatTitle')&&['Conversación del plan','Plan conversation'].includes($('planChatTitle').textContent.trim()))$('planChatTitle').textContent=tr43('groupConversation');if($('socialChatInput'))$('socialChatInput').placeholder=tr43('writeGroup');}

  // Double Date
  const dbl=$('page-double');if(dbl){const firstPill=dbl.querySelector('.sectionhead .pill');if(firstPill)firstPill.textContent=tr43('pairConnections');const base=dbl.querySelector('.card.doublebox');if(base){const hs=base.querySelectorAll('h3');if(hs[0])hs[0].textContent=tr43('formDouble');if(hs[1])hs[1].textContent=tr43('receivedCode');const note=base.querySelector('.note');if(note)note.textContent=tr43('doubleHelp');const code=$('doubleCode');if(code)code.placeholder=tr43('codePlaceholder');const buttons=base.querySelectorAll('button');buttons.forEach(b=>{const t=b.textContent.trim();if(['Generar código','Generate code'].includes(t))b.textContent=tr43('generateCode');if(['Actualizar estado','Refresh status'].includes(t))b.textContent=tr43('refreshState');if(['Unirme','Join'].includes(t))b.textContent=tr43('join');});}}
  const dd=$('doubleDiscovery');if(dd){const heads=dd.querySelectorAll('.sectionhead');if(heads[0]){const p=heads[0].querySelector('.pill'),h=heads[0].querySelector('h2');if(p)p.textContent=tr43('discoverCouples');if(h)h.textContent=tr43('double');}if(heads[1]){const p=heads[1].querySelector('.pill'),h=heads[1].querySelector('h2');if(p)p.textContent=tr43('fourConnections');if(h)h.textContent=tr43('doubleMatches');}}

  // Support
  const support=$('page-support');if(support){const labels=support.querySelectorAll('.field label');if(labels[0])labels[0].textContent=tr43('subject');if(labels[1])labels[1].textContent=tr43('description');const send=support.querySelector('button[onclick="createSupportTicket()"]');if(send)send.textContent=tr43('sendRequest');}
  document.querySelectorAll('#supportList input').forEach(i=>i.placeholder=tr43('replySupport'));

  // Privacy / premium headings created by later phases
  const privacy=$('page-privacy');if(privacy){const h=privacy.querySelector('h2');if(h)h.textContent=tjsUiLanguage==='en'?'Account & privacy':'Cuenta y privacidad';}
  if($('sessionSecurityCard')){const h=$('sessionSecurityCard').querySelector('h3');if(h)h.textContent=tr43('securitySession');}
  const exportBtn=document.querySelector('[onclick="exportMyData()"], [onclick="downloadMyData()"]');if(exportBtn)exportBtn.textContent=tr43('downloadData');
  const deleteBtn=document.querySelector('.accountDanger button[onclick="requestDeletion()"]');if(deleteBtn)deleteBtn.textContent=tr43('deleteAccount');if($('cancelDeleteBtn'))$('cancelDeleteBtn').textContent=tr43('cancelDelete');
  const premium=$('page-premium');if(premium){const p=premium.querySelector('.sectionhead .pill');if(p)p.textContent=tr43('premiumControl');if($('currentPlan')&&/Plan Gratis|Free plan/.test($('currentPlan').textContent))$('currentPlan').textContent=tr43('freePlan');const extra=[...premium.querySelectorAll('.card h3')].find(x=>/Compras adicionales|Additional purchases/.test(x.textContent));if(extra)extra.textContent=tr43('extraPurchases');}

  // A11y
  const side=document.querySelector('aside.side');if(side){side.setAttribute('role','navigation');side.setAttribute('aria-label',tr43('mainNav'));}
  const bottom=document.querySelector('nav.bottom');if(bottom){bottom.setAttribute('aria-label',tr43('mobileNav'));bottom.querySelectorAll('button').forEach(b=>b.setAttribute('aria-label',b.textContent.replace(/\s+/g,' ').trim()));}
  document.querySelectorAll('button.round').forEach(b=>{if(b.classList.contains('pass'))b.setAttribute('aria-label',tjsUiLanguage==='en'?'Pass profile':'Descartar perfil');else if(b.classList.contains('like'))b.setAttribute('aria-label',tjsUiLanguage==='en'?'Like profile':'Me gusta');else if(b.classList.contains('star'))b.setAttribute('aria-label',tjsUiLanguage==='en'?'Highlighted like':'Like destacado');else b.setAttribute('aria-label',tjsUiLanguage==='en'?'Undo last action':'Deshacer última acción');});
}

const p43Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p43Apply)applyTjsLanguage=function(){p43Apply();applySecondaryBilingual43();};
const p43Go=typeof go==='function'?go:null;if(p43Go)go=function(page){p43Go(page);setTimeout(applySecondaryBilingual43,80);};

const p43Explore=typeof loadExploreCategory==='function'?loadExploreCategory:null;if(p43Explore)loadExploreCategory=async function(slug,name){await p43Explore(slug,name);applySecondaryBilingual43();};
const p43Plans=typeof loadPlansTJ==='function'?loadPlansTJ:null;if(p43Plans)loadPlansTJ=async function(){await p43Plans();applySecondaryBilingual43();};
const p43Support=typeof loadSupportTickets==='function'?loadSupportTickets:null;if(p43Support)loadSupportTickets=async function(){await p43Support();applySecondaryBilingual43();};

setTimeout(applySecondaryBilingual43,250);window.addEventListener('pageshow',()=>setTimeout(applySecondaryBilingual43,120));
