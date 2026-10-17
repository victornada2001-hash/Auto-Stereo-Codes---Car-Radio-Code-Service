// Phase 64: password recovery, reset and hardened signup confirmation flow.
const P64_PROD_ORIGIN='https://tjsdates.vercel.app';
function p64StrongPassword(v){return typeof v==='string'&&v.length>=10&&/[A-Z]/.test(v)&&/[a-z]/.test(v)&&/[0-9]/.test(v)}
function p64AppOrigin(){
  const h=location.hostname||'';
  if(h==='tjsdates.vercel.app')return P64_PROD_ORIGIN;
  return location.origin;
}
function p64RedirectUrl(recovery=false){return `${p64AppOrigin()}${location.pathname||'/'}${recovery?'?recovery=1':''}`}
function p64InjectForgot(){
  const card=document.querySelector('#auth .auth.card');
  if(!card||document.getElementById('p64Forgot'))return;
  const btn=document.createElement('button');btn.id='p64Forgot';btn.className='btn ghost';btn.type='button';btn.style.cssText='width:100%;margin-top:8px';btn.textContent='¿Olvidaste tu contraseña?';btn.onclick=p64ForgotPassword;
  const status=document.getElementById('authStatus');card.insertBefore(btn,status||null);
}
async function p64ForgotPassword(){
  const email=(document.getElementById('authEmail')?.value||'').trim();
  const status=document.getElementById('authStatus');
  if(!email){if(status){status.textContent='Escribe tu correo electrónico primero.';status.className='status err';}return;}
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:p64RedirectUrl(true)});
  if(status){status.textContent=error?error.message:'Si el correo existe, recibirás un enlace para restablecer tu contraseña.';status.className='status '+(error?'err':'ok');}
}
function p64CloseReset(){document.getElementById('p64Reset')?.remove()}
function p64ShowReset(){
  if(document.getElementById('p64Reset'))return;
  const root=document.createElement('div');root.id='p64Reset';root.innerHTML=`<style>
  #p64Reset{position:fixed;inset:0;z-index:2147483640;background:#0d0d12ee;display:grid;place-items:center;padding:20px;color:#fff;font-family:inherit}
  #p64Reset .box{width:min(460px,100%);background:#17171f;border:1px solid #30303d;border-radius:22px;padding:24px}
  #p64Reset input,#p64Reset button{width:100%;box-sizing:border-box;font:inherit;border-radius:12px;padding:12px;margin-top:10px}
  #p64Reset input{background:#22222c;color:#fff;border:1px solid #3a3a48}#p64Reset button{border:0;background:#ff4d7d;color:#fff;font-weight:800;cursor:pointer}
  #p64Reset .status{margin-top:10px;color:#c8c8d4}
  </style><div class="box"><h2>Nueva contraseña</h2><p>Usa al menos 10 caracteres, una mayúscula, una minúscula y un número.</p><input id="p64Pass1" type="password" autocomplete="new-password" minlength="10" placeholder="Nueva contraseña"><input id="p64Pass2" type="password" autocomplete="new-password" minlength="10" placeholder="Confirmar contraseña"><button onclick="p64SavePassword()">Guardar nueva contraseña</button><div id="p64Status" class="status" aria-live="polite"></div></div>`;
  document.body.appendChild(root);
}
async function p64SavePassword(){
  const a=document.getElementById('p64Pass1')?.value||'',b=document.getElementById('p64Pass2')?.value||'',st=document.getElementById('p64Status');
  if(!p64StrongPassword(a)){if(st)st.textContent='Usa 10+ caracteres con mayúscula, minúscula y número.';return;}
  if(a!==b){if(st)st.textContent='Las contraseñas no coinciden.';return;}
  const {error}=await sb.auth.updateUser({password:a});
  if(error){if(st)st.textContent=error.message;return;}
  if(st)st.textContent='Contraseña actualizada. Cerrando la sesión para que vuelvas a entrar…';
  history.replaceState({},'',location.pathname);
  setTimeout(async()=>{p64CloseReset();await sb.auth.signOut({scope:'global'});session=null;profile=null;showAuth('login');},700);
}
async function p64Signup(){
  const email=document.getElementById('authEmail')?.value.trim()||'';
  const password=document.getElementById('authPass')?.value||'';
  const birth=document.getElementById('authBirth')?.value||'';
  if(!email)return setStatus('authStatus','Ingresa un correo válido.');
  if(!p64StrongPassword(password))return setStatus('authStatus','La contraseña debe tener 10+ caracteres, mayúscula, minúscula y número.');
  if(!birth||typeof yearsOld!=='function'||yearsOld(birth)<18||!document.getElementById('ageCheck')?.checked)return setStatus('authStatus','TJSDATES es solo para mayores de 18 años.');
  if(!document.getElementById('termsCheck')?.checked)return setStatus('authStatus','Debes aceptar los términos y el aviso de privacidad.');
  const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:p64RedirectUrl(false),data:{birth_date:birth}}});
  if(error)return setStatus('authStatus',error.message);
  if(data.user&&data.session){
    const pr=await sb.from('profiles').update({birth_date:birth}).eq('id',data.user.id);
    if(pr.error)return setStatus('authStatus','La cuenta se creó, pero no se pudo completar el perfil. Cierra sesión y contacta soporte.');
    const cr=await sb.from('consents').insert([{user_id:data.user.id,consent_type:'age_18_plus',granted:true,document_version:'1.0'},{user_id:data.user.id,consent_type:'terms',granted:true,document_version:'1.0'},{user_id:data.user.id,consent_type:'privacy',granted:true,document_version:'1.0'}]);
    if(cr.error)return setStatus('authStatus','La cuenta se creó, pero no se pudieron registrar los consentimientos. Cierra sesión y contacta soporte.');
  }
  setStatus('authStatus',data.session?'Cuenta creada.':'Revisa tu correo para confirmar tu cuenta.',true);
  if(data.session)await boot();
}
const p64SubmitAuth=typeof submitAuth==='function'?submitAuth:null;if(p64SubmitAuth)submitAuth=async function(){
  if(typeof authMode!=='undefined'&&authMode==='signup')return await p64Signup();
  return await p64SubmitAuth.apply(this,arguments);
};
const p64AuthTab=typeof authTab==='function'?authTab:null;if(p64AuthTab)authTab=function(mode){const r=p64AuthTab.apply(this,arguments);setTimeout(()=>{const b=document.getElementById('p64Forgot');if(b)b.style.display=mode==='login'?'':'none'},0);return r};
function p64HandleAuthError(){
  const q=new URLSearchParams(location.search),h=new URLSearchParams((location.hash||'').replace(/^#/,''));
  const code=q.get('error_code')||h.get('error_code');
  const desc=q.get('error_description')||h.get('error_description');
  if(!code&&!desc)return;
  showAuth('login');
  setStatus('authStatus',desc?decodeURIComponent(desc.replace(/\+/g,' ')):'El enlace de autenticación no es válido o ya venció.');
  history.replaceState({},'',location.pathname);
}
if(sb?.auth?.onAuthStateChange){sb.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')p64ShowReset()});}
setTimeout(async()=>{p64InjectForgot();p64HandleAuthError();if(new URLSearchParams(location.search).get('recovery')==='1'){const {data}=await sb.auth.getSession();if(data?.session)p64ShowReset();}},350);
if(!document.querySelector('script[data-tjs-phase65]')){const s=document.createElement('script');s.src='phase65.js?v=1';s.defer=true;s.dataset.tjsPhase65='1';document.body.appendChild(s)}
