let authBusy=false;
let pendingConfirmation=null;
let confirmationTimer;
const confirmationDeadlines=new Map();
const defaultEmailWait=60;

function authText(es,en){
  return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es;
}

function authFriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(err?.code==='invalid_credentials'||m.includes('invalid login credentials'))return authText('Correo o contraseña incorrectos.','Incorrect email or password.');
  if(err?.code==='email_not_confirmed'||m.includes('email not confirmed'))return authText('Confirma tu correo antes de iniciar sesión.','Confirm your email before logging in.');
  if(err?.code==='user_already_exists'||m.includes('user already registered'))return authText('Ya existe una cuenta con este correo. Puedes iniciar sesión.','An account already exists for this email. You can log in.');
  if(err?.code==='weak_password'||m.includes('password should be'))return authText('La contraseña debe cumplir los requisitos de seguridad.','Use a password that meets the security requirements.');
  if(err?.code==='email_address_not_authorized')return authText('El proveedor de correo de TJSDATES rechazó esta dirección. Contacta a soporte.','TJSDATES could not send to this address. Contact support.');
  if(err?.status===429||m.includes('rate limit')||m.includes('too many')||emailWaitFromError(err))return authText('Se alcanzó el límite de solicitudes. Intenta más tarde.','The request limit was reached. Try again later.');
  if(err?.name==='AuthRetryableFetchError'||!navigator.onLine)return authText('Revisa tu conexión e inténtalo otra vez.','Check your connection and try again.');
  if(m.includes('18+')||m.includes('adult'))return'TJSDATES es únicamente para mayores de 18 años.';
  return err?.message||'No fue posible completar la solicitud.';
}

function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}

function signupEmailRedirect(){
  const nativeOrigin=window.TJSDATES_NATIVE?.publicOrigin;
  if(nativeOrigin)return nativeOrigin+'/';
  if(typeof p64RedirectUrl==='function')return p64RedirectUrl(false);
  return location.origin+location.pathname;
}

function emailWaitFromError(error){
  const match=/\bafter\s+(\d+)\s+seconds?\b/i.exec(error?.message||'');
  const seconds=Number(match?.[1]);
  return Number.isSafeInteger(seconds)&&seconds>0?seconds:0;
}

function waitForEmail(email,seconds){
  confirmationDeadlines.set(email,Date.now()+seconds*1000);
}

function emailWaitRemaining(email){
  const seconds=Math.max(0,Math.ceil(((confirmationDeadlines.get(email)||0)-Date.now())/1000));
  if(!seconds)confirmationDeadlines.delete(email);
  return seconds;
}

function updateConfirmationResend(){
  if(!pendingConfirmation)return;
  const button=$('confirmationResend');
  const seconds=emailWaitRemaining(pendingConfirmation.email);
  button.disabled=authBusy||seconds>0;
  if(!button.disabled)button.removeAttribute('aria-disabled');
  const label=authBusy?authText('Solicitando correo…','Requesting email…'):
    seconds?authText('Reenviar en '+seconds+' s','Resend in '+seconds+' s'):
    authText('Reenviar correo','Resend email');
  if(button.textContent!==label)button.textContent=label;
}

function setAuthBusy(busy){
  authBusy=busy;
  $('authSubmit').disabled=busy;
  if(!busy)$('authSubmit').removeAttribute('aria-disabled');
  updateConfirmationResend();
}

function renderConfirmationCopy(){
  if(!pendingConfirmation)return;
  $('emailConfirmationTitle').textContent=authText('Confirma tu correo','Confirm your email');
  $('emailConfirmationHelp').textContent=authText(
    'Abre el enlace de TJSDATES que llegue a tu bandeja de entrada. Revisa también el correo no deseado.',
    'Open the TJSDATES link in your inbox. Check your spam folder too.'
  );
  $('confirmationLogin').textContent=authText('Iniciar sesión','Log in');
  $('confirmationEdit').textContent=authText('Cambiar correo','Change email');
  updateConfirmationResend();
}

function hideEmailConfirmation(){
  clearInterval(confirmationTimer);
  pendingConfirmation=null;
  $('emailConfirmation')?.classList.add('hidden');
  $('authForm')?.classList.remove('hidden');
}

function showEmailConfirmation(email,waiting=false){
  hideEmailConfirmation();
  pendingConfirmation={email};
  $('emailConfirmationAddress').textContent=email;
  $('authPass').value='';
  $('authForm').classList.add('hidden');
  $('emailConfirmation').classList.remove('hidden');
  setStatus('emailConfirmationStatus',waiting?authText(
    'Si ya recibiste el enlace, puedes abrirlo ahora. El botón de reenvío se activa al terminar la espera.',
    'If you already received the link, you can open it now. Resend becomes available after the wait.'
  ):'',true);
  renderConfirmationCopy();
  $('emailConfirmationTitle').focus();
  confirmationTimer=setInterval(updateConfirmationResend,1000);
}

async function resendSignupEmail(){
  const confirmation=pendingConfirmation;
  if(!confirmation||authBusy||emailWaitRemaining(confirmation.email))return;
  setAuthBusy(true);
  setStatus('emailConfirmationStatus','');
  try{
    const {error}=await sb.auth.resend({type:'signup',email:confirmation.email,options:{emailRedirectTo:signupEmailRedirect()}});
    if(error)throw error;
    waitForEmail(confirmation.email,defaultEmailWait);
    if(pendingConfirmation===confirmation)setStatus('emailConfirmationStatus',authText(
      'Revisa tu bandeja y el correo no deseado. Si ya confirmaste tu correo, puedes iniciar sesión.',
      'Check your inbox and spam folder. If your email is already confirmed, you can log in.'
    ),true);
  }catch(error){
    const seconds=emailWaitFromError(error);
    if(seconds||error?.status===429)waitForEmail(confirmation.email,seconds||defaultEmailWait);
    if(pendingConfirmation===confirmation)setStatus('emailConfirmationStatus',seconds?authText(
      'Espera a que termine el contador para volver a pedir el correo.',
      'Wait for the countdown to finish before requesting the email again.'
    ):authFriendlyError(error),Boolean(seconds));
  }finally{setAuthBusy(false);}
}

$('confirmationResend')?.addEventListener('click',resendSignupEmail);
$('confirmationLogin')?.addEventListener('click',()=>{
  showAuth('login');
  $('authPass').focus();
});
$('confirmationEdit')?.addEventListener('click',()=>{
  showAuth('signup');
  $('authEmail').focus();
  $('authEmail').select();
});
document.addEventListener('tjsdates:language-changed',renderConfirmationCopy);

const p14ShowAuth=showAuth;
showAuth=function(mode){hideEmailConfirmation();return p14ShowAuth(mode);};
const p14ShowLanding=showLanding;
showLanding=function(){hideEmailConfirmation();return p14ShowLanding();};

submitAuth=async function(){
  if(authBusy)return;
  const email=($('authEmail')?.value||'').trim().toLowerCase();
  const password=$('authPass')?.value||'';
  const signup=authMode==='signup';
  if(!validEmail(email)||password.length<8)return setStatus('authStatus','Ingresa un correo válido y una contraseña de mínimo 8 caracteres.');
  const birth=$('authBirth')?.value||'';
  if(signup){
    if(!birth||yearsOld(birth)<18||!$('ageCheck')?.checked)return setStatus('authStatus','TJSDATES es solo para mayores de 18 años.');
    if(!$('termsCheck')?.checked)return setStatus('authStatus','Debes aceptar Términos y Aviso de Privacidad.');
    if(emailWaitRemaining(email))return showEmailConfirmation(email,true);
  }
  const formIsCurrent=()=>!$('auth').classList.contains('hidden')&&signup===(authMode==='signup')&&$('authEmail').value.trim().toLowerCase()===email;
  setAuthBusy(true);
  setStatus('authStatus',signup?authText('Creando cuenta…','Creating account…'):authText('Iniciando sesión…','Logging in…'),true);
  try{
    if(signup){
      const {data,error}=await sb.auth.signUp({
        email,password,
        options:{
          emailRedirectTo:signupEmailRedirect(),
          data:{birth_date:birth,confirmed_18_plus:true,accepted_terms:true,accepted_privacy:true,legal_document_version:'1.0'}
        }
      });
      if(error)throw error;
      if(data.session)await boot();
      else{
        waitForEmail(email,defaultEmailWait);
        if(formIsCurrent())showEmailConfirmation(email);
      }
    }else{
      const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
      await boot();
    }
  }catch(error){
    const seconds=signup?emailWaitFromError(error):0;
    if(seconds)waitForEmail(email,seconds);
    if(!formIsCurrent())return;
    if(seconds)showEmailConfirmation(email,true);
    else if(!signup&&(error?.code==='email_not_confirmed'||/email not confirmed/i.test(error?.message||'')))showEmailConfirmation(email);
    else setStatus('authStatus',authFriendlyError(error));
  }finally{setAuthBusy(false);}
};

const p14Boot=boot;
boot=async function(){
  try{
    const {data,error}=await sb.auth.getSession();if(error)throw error;
    session=data.session;
    if(!session)return showLanding();
    await p14Boot();
    if(session&&typeof enforceAccountState==='function')await enforceAccountState();
  }catch(e){console.error('TJSDATES boot error',e);toast('No se pudo cargar tu sesión. Intenta nuevamente.');showAuth('login')}
};

sb.auth.onAuthStateChange((event,s)=>{
  session=s;
  if(event==='SIGNED_OUT')showLanding();
  if(event==='USER_UPDATED'&&s)setTimeout(()=>boot(),80);
});

window.addEventListener('pageshow',()=>{if(session&&document.visibilityState==='visible')setTimeout(()=>{if(typeof enforceAccountState==='function')enforceAccountState()},100)});

if(!document.querySelector('script[data-tjs-phase15]')){
  const phase15Script=document.createElement('script');
  phase15Script.src='phase15.js?v=1';
  phase15Script.defer=true;
  phase15Script.dataset.tjsPhase15='1';
  document.body.appendChild(phase15Script);
}
