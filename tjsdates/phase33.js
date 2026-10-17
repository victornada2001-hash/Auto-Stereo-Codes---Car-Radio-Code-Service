// Phase 33: real Web Push registration for supported browsers/PWAs.

function base64UrlToUint8Array(value){
  const pad='='.repeat((4-value.length%4)%4);
  const base64=(value+pad).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);const out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}

function webPushSupported(){
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function injectWebPushCard(){
  const page=$('page-notifications');if(!page||$('webPushCard'))return;
  const c=document.createElement('div');c.id='webPushCard';c.className='card';c.style.marginBottom='14px';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">Avisos del dispositivo</div><h3 style="margin:7px 0 0">Notificaciones push</h3></div><span id="webPushBadge" class="pill">Comprobando</span></div>
    <p class="note">Recibe avisos de Matches y mensajes aunque TJSDATES no esté abierto. El permiso solo se solicita cuando presionas Activar.</p>
    <div class="row" style="flex-wrap:wrap"><button id="enableWebPushBtn" class="btn primary" type="button" onclick="enableWebPush()">Activar</button><button id="disableWebPushBtn" class="btn ghost hidden" type="button" onclick="disableWebPush()">Desactivar en este dispositivo</button></div>
    <div id="webPushStatus" class="status"></div>`;
  const prefs=$('notificationPrefsCard');
  if(prefs?.nextSibling)page.insertBefore(c,prefs.nextSibling);else page.appendChild(c);
  refreshWebPushState();
}

async function currentPushSubscription(){
  if(!webPushSupported())return null;
  try{const reg=await navigator.serviceWorker.ready;return await reg.pushManager.getSubscription()}catch(_e){return null}
}

async function refreshWebPushState(){
  const badge=$('webPushBadge');if(!badge)return;
  if(!webPushSupported()){
    badge.textContent='No compatible';
    setStatus('webPushStatus','Este navegador no ofrece Web Push. En iPhone, instala TJSDATES en la pantalla de inicio y ábrelo desde ahí.');
    $('enableWebPushBtn')&&( $('enableWebPushBtn').disabled=true );return;
  }
  const sub=await currentPushSubscription();
  if(sub){
    badge.textContent='Activo';
    $('enableWebPushBtn')?.classList.add('hidden');$('disableWebPushBtn')?.classList.remove('hidden');
    setStatus('webPushStatus','Avisos push activos en este dispositivo.',true);
  }else{
    badge.textContent=Notification.permission==='denied'?'Bloqueado':'Inactivo';
    $('enableWebPushBtn')?.classList.remove('hidden');$('disableWebPushBtn')?.classList.add('hidden');
    setStatus('webPushStatus',Notification.permission==='denied'?'El navegador tiene las notificaciones bloqueadas. Cámbialo en los permisos del sitio.':'');
  }
}

async function enableWebPush(){
  if(!session)return toast('Inicia sesión para activar notificaciones.');
  if(!webPushSupported())return refreshWebPushState();
  const btn=$('enableWebPushBtn');if(btn)btn.disabled=true;
  try{
    if(!navigator.onLine)throw new Error('Necesitas conexión a internet.');
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw new Error('No se concedió permiso para mostrar notificaciones.');
    const {data:key,error:keyError}=await sb.rpc('get_web_push_public_key');
    if(keyError||!key)throw keyError||new Error('No se pudo obtener la clave de notificaciones.');
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64UrlToUint8Array(key)});
    const token=JSON.stringify(sub.toJSON());
    await registerSecureDeviceToken('web',token);
    setStatus('webPushStatus','Notificaciones push activadas.',true);
    await refreshWebPushState();
  }catch(e){setStatus('webPushStatus',e.message||'No se pudieron activar las notificaciones.');}
  finally{if(btn)btn.disabled=false;}
}

async function disableWebPush(){
  const btn=$('disableWebPushBtn');if(btn)btn.disabled=true;
  try{
    const sub=await currentPushSubscription();
    if(sub){
      const token=JSON.stringify(sub.toJSON());
      if(session)await disableSecureDeviceToken(token).catch(()=>{});
      await sub.unsubscribe();
    }
    setStatus('webPushStatus','Notificaciones push desactivadas en este dispositivo.',true);
    await refreshWebPushState();
  }catch(e){setStatus('webPushStatus',e.message||'No se pudieron desactivar las notificaciones.');}
  finally{if(btn)btn.disabled=false;}
}

// Route the older browser-notification button to the complete Push flow if it is ever rendered.
requestBrowserNotifications=enableWebPush;

const p33Go=go;
go=function(page){p33Go(page);if(page==='notifications')setTimeout(()=>{injectWebPushCard();refreshWebPushState()},90)};

setTimeout(()=>{injectWebPushCard();if(session)refreshWebPushState()},1000);

if(!document.querySelector('script[data-tjs-phase34]')){
  const phase34Script=document.createElement('script');
  phase34Script.src='phase34.js?v=1';
  phase34Script.defer=true;
  phase34Script.dataset.tjsPhase34='1';
  document.body.appendChild(phase34Script);
}
