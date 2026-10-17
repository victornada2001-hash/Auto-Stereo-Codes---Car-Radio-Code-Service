// Phase 34: stronger signup passwords and reliable password-recovery completion.

function tjsStrongPasswordMessage(value){
  const v=String(value||'');
  if(v.length<10)return 'Usa una contraseña de al menos 10 caracteres.';
  if(!/[a-z]/.test(v)||!/[A-Z]/.test(v)||!/[0-9]/.test(v))return 'La contraseña debe incluir mayúscula, minúscula y número.';
  return '';
}

const p34SubmitAuth=submitAuth;
submitAuth=async function(){
  if(typeof authMode!=='undefined'&&authMode==='signup'){
    const problem=tjsStrongPasswordMessage($('authPass')?.value||'');
    if(problem)return setStatus('authStatus',problem);
  }
  return p34SubmitAuth();
};

// Supabase emits PASSWORD_RECOVERY after exchanging the recovery link. Listening
// for that event avoids races where pageshow fires before the recovery session exists.
sb.auth.onAuthStateChange((event,s)=>{
  if(event==='PASSWORD_RECOVERY'){
    session=s||session;
    setTimeout(()=>{if(typeof showPasswordRecoveryModal==='function')showPasswordRecoveryModal()},80);
  }
});

async function resumePasswordRecoveryFromUrl(){
  const params=new URLSearchParams(location.search);
  if(params.get('recovery')!=='1')return;
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(data.session){
      session=data.session;
      setTimeout(()=>showPasswordRecoveryModal(),80);
    }
  }catch(e){
    console.warn('TJSDATES recovery resume failed',e);
  }
}

function injectChangePasswordButton(){
  const card=$('sessionSecurityCard');
  if(!card||$('changePasswordEmailBtn'))return;
  const row=card.querySelector('.row');if(!row)return;
  const b=document.createElement('button');
  b.id='changePasswordEmailBtn';
  b.className='btn ghost';
  b.type='button';
  b.textContent='Cambiar contraseña';
  b.onclick=async()=>{
    if(!session?.user?.email)return setStatus('sessionSecurityStatus','No se encontró el correo de tu sesión.');
    b.disabled=true;
    try{
      const {error}=await sb.auth.resetPasswordForEmail(session.user.email,{redirectTo:location.origin+location.pathname+'?recovery=1'});
      if(error)throw error;
      setStatus('sessionSecurityStatus','Te enviamos un enlace seguro para cambiar tu contraseña.',true);
    }catch(e){setStatus('sessionSecurityStatus',typeof authFriendlyError==='function'?authFriendlyError(e):(e.message||'No se pudo enviar el enlace.'));}
    finally{setTimeout(()=>b.disabled=false,2500)}
  };
  row.appendChild(b);
}

const p34Go=go;
go=function(page){
  p34Go(page);
  if(page==='privacy')setTimeout(injectChangePasswordButton,120);
};

window.addEventListener('pageshow',()=>{
  resumePasswordRecoveryFromUrl();
  setTimeout(injectChangePasswordButton,120);
});
setTimeout(()=>{resumePasswordRecoveryFromUrl();injectChangePasswordButton()},900);

if(!document.querySelector('script[data-tjs-phase35]')){
  const phase35Script=document.createElement('script');
  phase35Script.src='phase35.js?v=1';
  phase35Script.defer=true;
  phase35Script.dataset.tjsPhase35='1';
  document.body.appendChild(phase35Script);
}
