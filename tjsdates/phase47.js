// Phase 47: client-side guardrails for duplicate taps, offline writes and stale sessions.

const tjsActionLocks=new Set();

function tjs47Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es;}
function tjs47Toast(es,en){if(typeof toast==='function')toast(tjs47Text(es,en));}

async function tjs47FreshSession(){
  if(!session)return false;
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(!data?.session){
      session=null;profile=null;
      if(typeof showLanding==='function')showLanding();
      tjs47Toast('Tu sesión terminó. Inicia sesión nuevamente.','Your session ended. Please log in again.');
      return false;
    }
    session=data.session;
    return true;
  }catch(e){
    console.warn('TJSDATES session check failed',e);
    return !!session;
  }
}

async function tjs47Run(key,fn,{requiresSession=true,requiresOnline=true,busyMessage=false}={}){
  if(tjsActionLocks.has(key)){
    if(busyMessage)tjs47Toast('Esta acción ya se está procesando.','This action is already being processed.');
    return;
  }
  if(requiresOnline&&!navigator.onLine){
    tjs47Toast('Necesitas conexión a internet para realizar esta acción.','You need an internet connection to do this.');
    return;
  }
  if(requiresSession&&!(await tjs47FreshSession()))return;
  tjsActionLocks.add(key);
  document.documentElement.dataset.tjsBusy=key;
  try{return await fn();}
  finally{
    tjsActionLocks.delete(key);
    if(document.documentElement.dataset.tjsBusy===key)delete document.documentElement.dataset.tjsBusy;
  }
}

function tjs47Wrap(name,key,options={}){
  const original=window[name];
  if(typeof original!=='function'||original.__tjs47Wrapped)return;
  const wrapped=async function(...args){
    const resolvedKey=typeof key==='function'?key(...args):key;
    return tjs47Run(resolvedKey,()=>original.apply(this,args),options);
  };
  wrapped.__tjs47Wrapped=true;
  wrapped.__tjs47Original=original;
  window[name]=wrapped;
}

function installPhase47Guards(){
  // Profile decisions share one lock so a rapid Like/Pass combination cannot create two actions.
  tjs47Wrap('createLike','profile-decision',{busyMessage:true});
  tjs47Wrap('likeCurrent','profile-decision',{busyMessage:true});
  tjs47Wrap('passCurrent','profile-decision',{busyMessage:true});
  tjs47Wrap('rewind','profile-decision');

  // Chat and forms.
  tjs47Wrap('sendMessage','chat-send',{busyMessage:true});
  tjs47Wrap('sendSocialMessage','social-chat-send',{busyMessage:true});
  tjs47Wrap('finishOnboarding','onboarding-save',{busyMessage:true});
  tjs47Wrap('saveProfile','profile-save',{busyMessage:true});
  tjs47Wrap('saveFilters','filters-save',{busyMessage:true});
  tjs47Wrap('requestLocation','location-save',{busyMessage:true});

  // Photos: serialize mutations to protect order and primary-photo state.
  tjs47Wrap('uploadPhotos','photo-upload',{busyMessage:true});
  tjs47Wrap('setPrimary','photo-mutation',{busyMessage:true});
  tjs47Wrap('deletePhoto','photo-mutation',{busyMessage:true});
  tjs47Wrap('movePhoto','photo-mutation',{busyMessage:true});

  // Community, support and safety flows.
  tjs47Wrap('createPlanTJ','plan-create',{busyMessage:true});
  tjs47Wrap('joinPlanTJ',(...args)=>'plan-join-'+String(args[0]||''),{busyMessage:true});
  tjs47Wrap('leavePlanTJ',(...args)=>'plan-leave-'+String(args[0]||''),{busyMessage:true});
  tjs47Wrap('createSupportTicket','support-create',{busyMessage:true});
  tjs47Wrap('replySupportTicket',(...args)=>'support-reply-'+String(args[0]||''),{busyMessage:true});
  tjs47Wrap('blockCurrentMatch','safety-action',{busyMessage:true});
  tjs47Wrap('reportCurrentMatch','safety-action',{busyMessage:true});
  tjs47Wrap('unmatchCurrent','safety-action',{busyMessage:true});
  tjs47Wrap('requestDeletion','account-delete',{busyMessage:true});
  tjs47Wrap('cancelDeletion','account-delete',{busyMessage:true});
}

installPhase47Guards();
setTimeout(installPhase47Guards,250);
setTimeout(installPhase47Guards,1200);
window.addEventListener('pageshow',()=>setTimeout(installPhase47Guards,80));

window.__TJSDATES_MUTATION_GUARDS_READY=true;
