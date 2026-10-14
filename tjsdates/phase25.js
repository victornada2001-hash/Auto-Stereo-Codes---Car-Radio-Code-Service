// Phase 25: session security, complete realtime cleanup, and secure device-token helpers.

function injectSessionSecurityCard(){
  const page=$('page-privacy');
  if(!page||$('sessionSecurityCard'))return;
  const c=document.createElement('div');
  c.id='sessionSecurityCard';
  c.className='card';
  c.style.marginTop='14px';
  c.innerHTML=`<div class="sectionhead"><div><div class="pill">Seguridad de sesión</div><h3 style="margin:7px 0 0">Tu sesión</h3></div><button class="btn ghost" type="button" onclick="refreshSessionSecurityCard()">Actualizar</button></div>
    <p class="note">Puedes comprobar tu sesión actual y cerrar las demás sesiones abiertas en otros dispositivos.</p>
    <div id="sessionSecurityInfo" class="note"></div>
    <div class="row" style="margin-top:12px;flex-wrap:wrap"><button class="btn ghost" type="button" onclick="revalidateCurrentSession()">Revalidar sesión</button><button class="btn danger" type="button" onclick="closeOtherSessions()">Cerrar otras sesiones</button></div>
    <div id="sessionSecurityStatus" class="status"></div>`;
  const danger=page.querySelector('.accountDanger');
  if(danger)page.insertBefore(c,danger);else page.appendChild(c);
  refreshSessionSecurityCard();
}

function formatSessionExpiry(s){
  const ms=Number(s?.expires_at||0)*1000;
  if(!ms)return 'No disponible';
  return new Date(ms).toLocaleString();
}

async function refreshSessionSecurityCard(){
  if(!$('sessionSecurityInfo'))return;
  try{
    const {data,error}=await sb.auth.getSession();if(error)throw error;
    session=data.session||null;
    if(!session){$('sessionSecurityInfo').textContent='No hay una sesión activa.';return;}
    $('sessionSecurityInfo').textContent=`Cuenta: ${session.user?.email||'—'} · Sesión válida hasta: ${formatSessionExpiry(session)}`;
  }catch(e){setStatus('sessionSecurityStatus',e.message||'No se pudo revisar la sesión.');}
}

async function revalidateCurrentSession(){
  setStatus('sessionSecurityStatus','Revalidando...',true);
  try{
    const {data,error}=await sb.auth.refreshSession();if(error)throw error;
    session=data.session||session;
    setStatus('sessionSecurityStatus','Sesión revalidada correctamente.',true);
    refreshSessionSecurityCard();
  }catch(e){setStatus('sessionSecurityStatus',e.message||'No se pudo revalidar la sesión.');}
}

async function closeOtherSessions(){
  if(!confirm('¿Cerrar las sesiones de TJSDATES abiertas en otros dispositivos?'))return;
  setStatus('sessionSecurityStatus','Cerrando otras sesiones...',true);
  try{
    const {error}=await sb.auth.signOut({scope:'others'});if(error)throw error;
    setStatus('sessionSecurityStatus','Las otras sesiones fueron cerradas.',true);
  }catch(e){setStatus('sessionSecurityStatus',e.message||'No se pudieron cerrar las otras sesiones.');}
}

async function removeKnownRealtimeChannels(){
  const channels=[realtimeChannel,notificationChannel,typeof socialRealtimeChannel!=='undefined'?socialRealtimeChannel:null].filter(Boolean);
  await Promise.allSettled(channels.map(ch=>sb.removeChannel(ch)));
  realtimeChannel=null;
  notificationChannel=null;
  if(typeof socialRealtimeChannel!=='undefined')socialRealtimeChannel=null;
}

// Replace legacy logout so social/group realtime subscriptions are also closed.
logout=async function(){
  try{if(typeof closeMoreMenu==='function')closeMoreMenu()}catch(_e){}
  try{if(typeof closeSocialChat==='function')closeSocialChat()}catch(_e){}
  try{if(typeof closeModal==='function')closeModal()}catch(_e){}
  await removeKnownRealtimeChannels();
  try{await sb.auth.signOut({scope:'local'});}catch(e){console.error('TJSDATES logout error',e)}
  session=null;profile=null;currentConversation=null;
  if(typeof socialConversationId!=='undefined')socialConversationId=null;
  candidates=[];candidateIndex=0;lastAction=null;adminRole=null;
  showLanding();
};

// Helpers are intentionally not exposed in the UI until a real Web Push provider/VAPID setup exists.
async function registerSecureDeviceToken(platform,token){
  if(!session||!token)return null;
  const {data,error}=await sb.rpc('register_device_token',{p_platform:platform,p_token:token});
  if(error)throw error;
  return data;
}
async function disableSecureDeviceToken(token){
  if(!session||!token)return false;
  const {data,error}=await sb.rpc('disable_device_token',{p_token:token});
  if(error)throw error;
  return !!data;
}

sb.auth.onAuthStateChange((event,s)=>{
  if(event==='TOKEN_REFRESHED'&&s){session=s;setTimeout(refreshSessionSecurityCard,50)}
  if(event==='SIGNED_OUT'){
    session=null;profile=null;currentConversation=null;
    if(typeof socialConversationId!=='undefined')socialConversationId=null;
  }
});

const p25Go=go;
go=function(page){
  p25Go(page);
  if(page==='privacy')setTimeout(()=>{injectSessionSecurityCard();refreshSessionSecurityCard()},80);
};

setTimeout(()=>{injectSessionSecurityCard()},900);
