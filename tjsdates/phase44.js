// Phase 44: final startup readiness, session sanity checks, and runtime resilience.

let tjsRuntimeNoticeAt=0;

function tjsRuntimeMessage(){
  return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'
    ?'Something went wrong. Please try again.'
    :'Ocurrió un problema. Intenta nuevamente.';
}

function notifyRuntimeProblem(){
  const now=Date.now();
  if(now-tjsRuntimeNoticeAt<8000)return;
  tjsRuntimeNoticeAt=now;
  if(typeof toast==='function'&&document.visibilityState==='visible')toast(tjsRuntimeMessage());
}

window.addEventListener('unhandledrejection',event=>{
  console.error('TJSDATES async error',event.reason);
  notifyRuntimeProblem();
});
window.addEventListener('error',event=>{
  console.error('TJSDATES runtime error',event.error||event.message);
  notifyRuntimeProblem();
});

function hardenInteractiveAccessibility(){
  document.querySelectorAll('.status').forEach(el=>{if(!el.hasAttribute('role'))el.setAttribute('role','status');el.setAttribute('aria-live','polite');});
  const modal=$('modal');if(modal){modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'TJSDATES dialog':'Diálogo de TJSDATES');}
  document.querySelectorAll('img').forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async';});
  document.querySelectorAll('input,textarea,select,button').forEach(el=>{if(el.disabled)el.setAttribute('aria-disabled','true');else el.removeAttribute('aria-disabled');});
}

async function verifyVisibleSession44(){
  if(!session||document.visibilityState!=='visible')return;
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(!data?.session){
      session=null;profile=null;
      if(typeof showLanding==='function')showLanding();
      if(typeof toast==='function')toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Your session ended. Please log in again.':'Tu sesión terminó. Inicia sesión nuevamente.');
      return;
    }
    session=data.session;
  }catch(e){
    if(navigator.onLine)console.warn('TJSDATES session verification failed',e);
  }
}

document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){verifyVisibleSession44();setTimeout(hardenInteractiveAccessibility,80);}});
window.addEventListener('online',()=>verifyVisibleSession44());

const p44Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p44Apply)applyTjsLanguage=function(){p44Apply();hardenInteractiveAccessibility();};

const p44Go=typeof go==='function'?go:null;
if(p44Go)go=function(page){p44Go(page);setTimeout(hardenInteractiveAccessibility,80);};

window.__TJSDATES_FULL_READY=true;
hardenInteractiveAccessibility();
if(typeof applyTjsLanguage==='function')applyTjsLanguage();
if(typeof releaseStartupGate==='function')releaseStartupGate();
setTimeout(()=>{hardenInteractiveAccessibility();if(typeof releaseStartupGate==='function')releaseStartupGate();},120);
