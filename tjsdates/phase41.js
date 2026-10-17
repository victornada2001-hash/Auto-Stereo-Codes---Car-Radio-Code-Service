// Phase 41: secure service-area location UX and startup interaction gate.

function phase41LocationError(err){
  const m=String(err?.message||err||'');
  if(m.includes('outside_service_area'))return tjsUiLanguage==='en'?'TJSDATES currently serves the Tijuana–San Diego region.':'TJSDATES actualmente funciona en la región Tijuana–San Diego.';
  if(m.includes('not authenticated'))return tjsUiLanguage==='en'?'Your session ended. Please log in again.':'Tu sesión terminó. Inicia sesión nuevamente.';
  if(m.includes('invalid coordinates'))return tjsUiLanguage==='en'?'We could not validate your location.':'No pudimos validar tu ubicación.';
  return err?.message||String(err||'');
}

requestLocation=async function(){
  if(!session)return toast(tjsUiLanguage==='en'?'Log in again to update your location.':'Inicia sesión nuevamente para actualizar tu ubicación.');
  if(!navigator.geolocation)return toast(tjsUiLanguage==='en'?'Location is not available in this browser.':'Tu navegador no permite geolocalización.');
  if(!navigator.onLine)return toast(tjsUiLanguage==='en'?'You need an internet connection to update location.':'Necesitas conexión a internet para actualizar tu ubicación.');
  const buttons=[...document.querySelectorAll('button')].filter(b=>/Actualizar ubicación|Guardar ubicación|Update location|Save.*location/i.test(b.textContent));
  buttons.forEach(b=>b.disabled=true);
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const {error}=await sb.rpc('set_my_location',{lat:pos.coords.latitude,lon:pos.coords.longitude,p_city:profile?.city||'Tijuana',p_zone:null});
      if(error)throw error;
      toast(tjsUiLanguage==='en'?'Location saved privately.':'Ubicación guardada de forma privada.');
      if(typeof loadDiscovery==='function')await loadDiscovery();
    }catch(e){toast(phase41LocationError(e));}
    finally{buttons.forEach(b=>b.disabled=false);}
  },e=>{
    const msg=e.code===1?(tjsUiLanguage==='en'?'Location permission was denied. You can enable it in the browser site settings.':'El permiso de ubicación está bloqueado. Puedes activarlo en los permisos del sitio.'):
      e.code===3?(tjsUiLanguage==='en'?'Location request timed out. Try again.':'La ubicación tardó demasiado. Intenta de nuevo.'):
      (tjsUiLanguage==='en'?'We could not get your location.':'No fue posible obtener tu ubicación.');
    toast(msg);buttons.forEach(b=>b.disabled=false);
  },{enableHighAccuracy:false,timeout:12000,maximumAge:300000});
};

function injectServiceAreaNote(){
  const safety=$('page-safety');if(!safety||$('serviceAreaSafetyCard'))return;
  const grid=safety.querySelector('.safetygrid');if(!grid)return;
  const c=document.createElement('div');c.id='serviceAreaSafetyCard';c.className='card';
  c.innerHTML=`<h3>🌎 ${tjsUiLanguage==='en'?'Service area':'Área de servicio'}</h3><p class="note">${tjsUiLanguage==='en'?'TJSDATES currently limits location-based discovery to the Tijuana–San Diego region. Exact coordinates are never shown to other users.':'TJSDATES actualmente limita el descubrimiento por ubicación a la región Tijuana–San Diego. Tus coordenadas exactas nunca se muestran a otros usuarios.'}</p>`;
  grid.appendChild(c);
}

function syncPhase41Connectivity(){
  const existing=$('networkBanner');
  if(existing){
    if(navigator.onLine){existing.classList.add('hidden');}
    else{existing.textContent=tjsUiLanguage==='en'?'Offline. Some actions will be available when your connection returns.':'Sin conexión. Algunas acciones estarán disponibles cuando vuelva internet.';existing.classList.remove('hidden');}
    return;
  }
  let b=$('connectivityBanner');
  if(!b){b=document.createElement('div');b.id='connectivityBanner';b.setAttribute('role','status');b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:max(10px,env(safe-area-inset-top));z-index:9998;padding:8px 14px;border-radius:999px;background:#2d2238;border:1px solid var(--line);box-shadow:0 8px 30px #0005;font-size:13px;font-weight:800;display:none';document.body.appendChild(b);}
  if(navigator.onLine)b.style.display='none';else{b.textContent=tjsUiLanguage==='en'?'Offline · some actions are unavailable':'Sin conexión · algunas acciones no están disponibles';b.style.display='block';}
}

function injectConnectivityBanner(){
  syncPhase41Connectivity();
  window.addEventListener('online',async()=>{syncPhase41Connectivity();try{if(session&&typeof ensureFreshSession==='function')await ensureFreshSession()}catch(_e){}});
  window.addEventListener('offline',syncPhase41Connectivity);
}

function releaseStartupGate(){
  if(!window.__TJSDATES_FULL_READY)return false;
  const gate=$('startupGate');
  if(!gate){document.documentElement.dataset.tjsReady='1';return true;}
  gate.setAttribute('aria-hidden','true');
  gate.style.opacity='0';
  gate.style.pointerEvents='none';
  setTimeout(()=>gate.remove(),220);
  document.documentElement.dataset.tjsReady='1';
  return true;
}

const p41ApplyLanguage=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p41ApplyLanguage)applyTjsLanguage=function(){p41ApplyLanguage();injectServiceAreaNote();const c=$('serviceAreaSafetyCard');if(c){c.querySelector('h3').textContent='🌎 '+(tjsUiLanguage==='en'?'Service area':'Área de servicio');c.querySelector('p').textContent=tjsUiLanguage==='en'?'TJSDATES currently limits location-based discovery to the Tijuana–San Diego region. Exact coordinates are never shown to other users.':'TJSDATES actualmente limita el descubrimiento por ubicación a la región Tijuana–San Diego. Tus coordenadas exactas nunca se muestran a otros usuarios.';}syncPhase41Connectivity();};

injectConnectivityBanner();injectServiceAreaNote();
setTimeout(()=>{injectServiceAreaNote();if(typeof applyTjsLanguage==='function')applyTjsLanguage();releaseStartupGate();},120);
window.addEventListener('pageshow',()=>setTimeout(()=>{injectServiceAreaNote();releaseStartupGate();syncPhase41Connectivity();},80));

if(!document.querySelector('script[data-tjs-phase42]')){
  const s=document.createElement('script');s.src='phase42.js?v=1';s.defer=true;s.dataset.tjsPhase42='1';document.body.appendChild(s);
}
