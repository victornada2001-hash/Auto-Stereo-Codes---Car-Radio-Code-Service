// Phase 66: transactional signup bootstrap through auth metadata + server trigger.
// Avoid direct writes to profiles/consents from the browser after signUp.
async function p66Signup(){
  const email=document.getElementById('authEmail')?.value.trim()||'';
  const password=document.getElementById('authPass')?.value||'';
  const birth=document.getElementById('authBirth')?.value||'';
  const ageAccepted=!!document.getElementById('ageCheck')?.checked;
  const termsAccepted=!!document.getElementById('termsCheck')?.checked;
  if(!email)return setStatus('authStatus','Ingresa un correo válido.');
  if(typeof p64StrongPassword==='function'&&!p64StrongPassword(password))return setStatus('authStatus','La contraseña debe tener 10+ caracteres, mayúscula, minúscula y número.');
  if(!birth||typeof yearsOld!=='function'||yearsOld(birth)<18||!ageAccepted)return setStatus('authStatus','TJSDATES es solo para mayores de 18 años.');
  if(!termsAccepted)return setStatus('authStatus','Debes aceptar los términos y el aviso de privacidad.');
  const redirect=typeof p64RedirectUrl==='function'?p64RedirectUrl(false):(location.origin+location.pathname);
  const {data,error}=await sb.auth.signUp({
    email,
    password,
    options:{
      emailRedirectTo:redirect,
      data:{
        birth_date:birth,
        confirmed_18_plus:true,
        accepted_terms:true,
        accepted_privacy:true
      }
    }
  });
  if(error)return setStatus('authStatus',error.message);
  setStatus('authStatus',data.session?'Cuenta creada.':'Revisa tu correo para confirmar tu cuenta.',true);
  if(data.session)await boot();
}

// Phase 64's submitAuth wrapper resolves p64Signup dynamically, so replacing it
// preserves login/recovery behavior while fixing only the signup path.
if(typeof p64Signup==='function')p64Signup=p66Signup;

if(!document.querySelector('script[data-tjs-phase67]')){
  const s=document.createElement('script');
  s.src='phase67.js?v=1';
  s.defer=true;
  s.dataset.tjsPhase67='1';
  document.body.appendChild(s);
}
