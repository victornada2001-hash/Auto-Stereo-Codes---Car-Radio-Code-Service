// Phase 26: password recovery, reset confirmation, and safer auth UX.

let passwordRecoveryMode=false;
let passwordRecoveryBusy=false;

function injectForgotPasswordLink(){
  const submit=$('authSubmit');
  const host=submit?.parentElement;
  if(!host)return;
  let b=$('forgotPasswordBtn');
  if(!b){
    b=document.createElement('button');
    b.id='forgotPasswordBtn';
    b.type='button';
    b.className='btn ghost';
    b.style.cssText='width:100%;margin-top:10px';
    submit.insertAdjacentElement('afterend',b);
  }
  b.textContent='¿Olvidaste tu contraseña?';
  b.onclick=requestPasswordReset;
}

async function requestPasswordReset(){
  if(passwordRecoveryBusy)return;
  const email=($('authEmail')?.value||session?.user?.email||'').trim().toLowerCase();
  if(!validEmail(email))return setStatus('authStatus','Escribe primero el correo de tu cuenta.');
  const btn=$('forgotPasswordBtn');passwordRecoveryBusy=true;if(btn)btn.disabled=true;
  try{
    const redirectTo=location.origin+location.pathname+'?recovery=1';
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});
    if(error)throw error;
    if(session)toast('Te enviamos un enlace para cambiar tu contraseña.');
    else setStatus('authStatus','Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.',true);
  }catch(e){if(session)toast(authFriendlyError(e));else setStatus('authStatus',authFriendlyError(e));}
  finally{passwordRecoveryBusy=false;if(btn)setTimeout(()=>btn.disabled=false,2500)}
}

function passwordStrengthMessage(v){
  if(v.length<10)return 'Usa al menos 10 caracteres.';
  if(!/[a-z]/.test(v)||!/[A-Z]/.test(v)||!/[0-9]/.test(v))return 'Incluye mayúscula, minúscula y número.';
  return '';
}

function showPasswordRecoveryModal(){
  if(passwordRecoveryMode&&$('newRecoveryPassword'))return;
  passwordRecoveryMode=true;
  const modal=$('modal');const body=$('modalBody');if(!modal||!body)return;
  body.innerHTML=`<div class="pill">Recuperación de cuenta</div><h2>Crea una contraseña nueva</h2>
    <p class="note">La nueva contraseña debe ser diferente y difícil de adivinar.</p>
    <div class="field"><label>Nueva contraseña</label><input id="newRecoveryPassword" type="password" autocomplete="new-password" minlength="10" placeholder="Mínimo 10 caracteres"></div>
    <div class="field"><label>Confirmar contraseña</label><input id="confirmRecoveryPassword" type="password" autocomplete="new-password" minlength="10"></div>
    <button id="saveRecoveryPasswordBtn" class="btn primary" type="button" onclick="saveRecoveredPassword()">Guardar contraseña</button>
    <div id="recoveryPasswordStatus" class="status"></div>`;
  modal.classList.remove('hidden');
  setTimeout(()=>$('newRecoveryPassword')?.focus(),60);
}

async function saveRecoveredPassword(){
  if(passwordRecoveryBusy)return;
  const p=$('newRecoveryPassword')?.value||'';
  const c=$('confirmRecoveryPassword')?.value||'';
  const weak=passwordStrengthMessage(p);
  if(weak)return setStatus('recoveryPasswordStatus',weak);
  if(p!==c)return setStatus('recoveryPasswordStatus','Las contraseñas no coinciden.');
  const btn=$('saveRecoveryPasswordBtn');passwordRecoveryBusy=true;if(btn)btn.disabled=true;
  try{
    const {error}=await sb.auth.updateUser({password:p});if(error)throw error;
    passwordRecoveryMode=false;
    history.replaceState({},document.title,location.pathname);
    setStatus('recoveryPasswordStatus','Contraseña actualizada. Tu cuenta está protegida.',true);
    setTimeout(()=>{closeModal();boot();},850);
  }catch(e){setStatus('recoveryPasswordStatus',authFriendlyError(e));}
  finally{passwordRecoveryBusy=false;if(btn)btn.disabled=false;}
}

// Replace the older phase8 recovery functions so both listeners/UI paths converge here.
sendPasswordRecovery=requestPasswordReset;
showRecoveryPasswordModal=showPasswordRecoveryModal;
completePasswordRecovery=saveRecoveredPassword;

// Prevent the generic modal close button from dismissing a recovery flow accidentally.
const p26CloseModal=closeModal;
closeModal=function(){
  if(passwordRecoveryMode){
    const ok=confirm('¿Salir sin cambiar la contraseña?');
    if(!ok)return;
    passwordRecoveryMode=false;
  }
  p26CloseModal();
};

window.addEventListener('pageshow',async()=>{
  injectForgotPasswordLink();
  if(new URLSearchParams(location.search).get('recovery')==='1'){
    try{
      const {data}=await sb.auth.getSession();
      if(data.session){session=data.session;setTimeout(showPasswordRecoveryModal,100)}
    }catch(_e){}
  }
});

// Improve browser autofill semantics depending on the active auth mode.
const p26AuthTab=authTab;
authTab=function(mode){
  p26AuthTab(mode);
  const pass=$('authPass');
  if(pass)pass.autocomplete=mode==='signup'?'new-password':'current-password';
  injectForgotPasswordLink();
  const forgot=$('forgotPasswordBtn');
  if(forgot)forgot.classList.toggle('hidden',mode!=='login');
};

setTimeout(()=>{injectForgotPasswordLink();if(typeof authMode!=='undefined')authTab(authMode)},500);
