// Phase 30: network resilience, safer global error handling, location UX, and PWA update flow.

function injectPhaseThirtyStyles(){
  if(document.getElementById('phase30Styles'))return;
  const s=document.createElement('style');
  s.id='phase30Styles';
  s.textContent=`
    .network-banner{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);z-index:14000;max-width:calc(100vw - 24px);padding:9px 14px;border-radius:999px;background:#2a1720;border:1px solid #7f2f48;color:#fff;font-size:13px;font-weight:800;box-shadow:0 8px 30px #0008}.network-banner.hidden{display:none}.update-banner{position:fixed;left:12px;right:12px;bottom:max(78px,calc(12px + env(safe-area-inset-bottom)));z-index:13000;margin:auto;max-width:680px;background:#171020;border:1px solid var(--line);border-radius:16px;padding:12px;box-shadow:0 14px 50px #0009}.update-banner.hidden{display:none}.update-banner .row{justify-content:space-between;gap:10px}.offline-disabled{opacity:.6;pointer-events:none}@media(min-width:901px){.update-banner{bottom:18px}}
  `;
  document.head.appendChild(s);
}

function ensureNetworkBanner(){
  injectPhaseThirtyStyles();
  let b=$('networkBanner');
  if(!b){b=document.createElement('div');b.id='networkBanner';b.className='network-banner hidden';b.setAttribute('role','status');b.setAttribute('aria-live','polite');document.body.appendChild(b)}
  return b;
}

function setNetworkState(){
  const b=ensureNetworkBanner();
  const online=navigator.onLine;
  b.textContent=online?'Conexión restaurada.':'Sin conexión. Algunas acciones estarán disponibles cuando vuelva internet.';
  b.classList.toggle('hidden',online);
  document.documentElement.dataset.online=online?'1':'0';
  document.querySelectorAll('button[data-needs-network="1"]').forEach(x=>x.classList.toggle('offline-disabled',!online));
  if(online&&session){setTimeout(()=>{if(typeof ensureFreshSession==='function')ensureFreshSession()},150)}
}

function requireOnline(message='Necesitas conexión a internet para realizar esta acción.'){
  if(navigator.onLine)return true;
  toast(message);return false;
}

function friendlyLocationError(err){
  if(!err)return 'No fue posible obtener tu ubicación.';
  if(err.code===1)return 'Permiso de ubicación denegado. Puedes habilitarlo en los permisos del navegador.';
  if(err.code===2)return 'Tu ubicación no está disponible en este momento.';
  if(err.code===3)return 'La ubicación tardó demasiado. Intenta nuevamente.';
  return 'No fue posible obtener tu ubicación.';
}

// Replace the original geolocation handler with clearer permission/network states.
requestLocation=function(){
  if(!requireOnline())return;
  if(!navigator.geolocation)return toast('Este navegador no ofrece geolocalización.');
  const buttons=[...document.querySelectorAll('button[onclick="requestLocation()"]')];
  buttons.forEach(b=>{b.disabled=true;b.dataset.oldText=b.textContent;b.textContent='Obteniendo ubicación…'});
  navigator.geolocation.getCurrentPosition(async p=>{
    try{
      const city=profile?.city||$('pCity')?.value||'Tijuana';
      const {error}=await sb.rpc('set_my_location',{lat:p.coords.latitude,lon:p.coords.longitude,p_city:city,p_zone:null});
      if(error)throw error;
      toast('Ubicación aproximada actualizada de forma privada.');
      if(session)loadDiscovery();
    }catch(e){toast(phase21FriendlyError?.(e)||e.message||'No se pudo guardar la ubicación.');}
    finally{buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.oldText||'📍 Actualizar ubicación'})}
  },err=>{
    toast(friendlyLocationError(err));
    buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.oldText||'📍 Actualizar ubicación'});
  },{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
};

function ensureUpdateBanner(){
  injectPhaseThirtyStyles();
  let b=$('updateBanner');
  if(b)return b;
  b=document.createElement('div');b.id='updateBanner';b.className='update-banner hidden';
  b.innerHTML=`<div class="row"><div><b>Nueva versión disponible</b><div class="note">Actualiza para usar las últimas correcciones de TJSDATES.</div></div><button class="btn primary" type="button" id="applyAppUpdateBtn">Actualizar</button></div>`;
  document.body.appendChild(b);return b;
}

async function setupServiceWorkerUpdateFlow(){
  if(!('serviceWorker' in navigator))return;
  try{
    const reg=await navigator.serviceWorker.getRegistration();
    if(!reg)return;
    const show=worker=>{
      if(!worker)return;
      const banner=ensureUpdateBanner();banner.classList.remove('hidden');
      const btn=$('applyAppUpdateBtn');if(btn)btn.onclick=()=>{worker.postMessage({type:'SKIP_WAITING'});btn.disabled=true;btn.textContent='Actualizando…'};
    };
    if(reg.waiting)show(reg.waiting);
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;if(!worker)return;
      worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)show(worker)});
    });
    let reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
    reg.update().catch(()=>{});
  }catch(e){console.warn('TJSDATES SW update check failed',e)}
}

// Avoid exposing raw backend/browser details to users while still retaining diagnostics in console.
window.addEventListener('unhandledrejection',event=>{
  console.error('TJSDATES unhandled promise rejection',event.reason);
  const m=String(event.reason?.message||event.reason||'');
  if(/AbortError|ResizeObserver/i.test(m))return;
  if(document.visibilityState==='visible')toast(navigator.onLine?'No se pudo completar una operación. Intenta nuevamente.':'Sin conexión. La operación no se completó.');
});
window.addEventListener('error',event=>{
  console.error('TJSDATES browser error',event.error||event.message);
});

window.addEventListener('online',setNetworkState);
window.addEventListener('offline',setNetworkState);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setNetworkState()});

setTimeout(()=>{setNetworkState();setupServiceWorkerUpdateFlow()},700);
