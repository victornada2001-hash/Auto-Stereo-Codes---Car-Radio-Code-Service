let authBusy=false;

function authFriendlyError(err){
  const m=(err?.message||String(err||'')).toLowerCase();
  if(m.includes('invalid login credentials'))return'Correo o contraseña incorrectos.';
  if(m.includes('email not confirmed'))return'Confirma tu correo antes de iniciar sesión.';
  if(m.includes('user already registered'))return'Ya existe una cuenta con este correo.';
  if(m.includes('password should be'))return'La contraseña no cumple los requisitos de seguridad.';
  if(m.includes('rate limit')||m.includes('too many'))return'Demasiados intentos. Espera un momento e inténtalo otra vez.';
  if(m.includes('18+')||m.includes('adult'))return'TJSDATES es únicamente para mayores de 18 años.';
  return err?.message||'No fue posible completar la solicitud.';
}

function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}

submitAuth=async function(){
  if(authBusy)return;
  const email=($('authEmail')?.value||'').trim().toLowerCase();
  const password=$('authPass')?.value||'';
  if(!validEmail(email)||password.length<8)return setStatus('authStatus','Ingresa un correo válido y una contraseña de mínimo 8 caracteres.');
  const btn=$('authSubmit');authBusy=true;if(btn)btn.disabled=true;
  setStatus('authStatus',authMode==='signup'?'Creando cuenta...':'Iniciando sesión...',true);
  try{
    if(authMode==='signup'){
      const birth=$('authBirth')?.value||'';
      if(!birth||yearsOld(birth)<18||!$('ageCheck')?.checked)return setStatus('authStatus','TJSDATES es solo para mayores de 18 años.');
      if(!$('termsCheck')?.checked)return setStatus('authStatus','Debes aceptar Términos y Aviso de Privacidad.');
      const {data,error}=await sb.auth.signUp({
        email,password,
        options:{
          emailRedirectTo:location.origin+location.pathname,
          data:{birth_date:birth,confirmed_18_plus:true,accepted_terms:true,accepted_privacy:true,legal_document_version:'1.0'}
        }
      });
      if(error)throw error;
      if(data.session){setStatus('authStatus','Cuenta creada correctamente.',true);await boot();}
      else{
        setStatus('authStatus','Cuenta creada. Revisa tu correo y confirma tu cuenta para continuar.',true);
        injectResendConfirmation(email);
      }
    }else{
      const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
      await boot();
    }
  }catch(e){setStatus('authStatus',authFriendlyError(e));}
  finally{authBusy=false;if(btn)btn.disabled=false;}
};

function injectResendConfirmation(email){
  const host=$('authStatus')?.parentElement;if(!host)return;
  let b=$('resendConfirmBtn');
  if(!b){b=document.createElement('button');b.id='resendConfirmBtn';b.className='recoverylink';b.type='button';b.textContent='Reenviar correo de confirmación';host.appendChild(b)}
  b.classList.remove('hidden');b.onclick=()=>resendConfirmation(email,b);
}
async function resendConfirmation(email,btn){
  if(!email)return;
  btn.disabled=true;
  try{
    const {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;
    setStatus('authStatus','Correo de confirmación reenviado.',true);
  }catch(e){setStatus('authStatus',authFriendlyError(e));}
  finally{setTimeout(()=>btn.disabled=false,3000)}
}

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
