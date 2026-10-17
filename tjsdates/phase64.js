// Phase 64: password recovery and reset flow.
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
  const redirectTo=`${location.origin}${location.pathname}?recovery=1`;
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});
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
  </style><div class="box"><h2>Nueva contraseña</h2><p>Usa al menos 10 caracteres y evita reutilizar una contraseña de otro servicio.</p><input id="p64Pass1" type="password" autocomplete="new-password" minlength="10" placeholder="Nueva contraseña"><input id="p64Pass2" type="password" autocomplete="new-password" minlength="10" placeholder="Confirmar contraseña"><button onclick="p64SavePassword()">Guardar nueva contraseña</button><div id="p64Status" class="status" aria-live="polite"></div></div>`;
  document.body.appendChild(root);
}
async function p64SavePassword(){
  const a=document.getElementById('p64Pass1')?.value||'',b=document.getElementById('p64Pass2')?.value||'',st=document.getElementById('p64Status');
  if(a.length<10){if(st)st.textContent='La contraseña debe tener al menos 10 caracteres.';return;}
  if(a!==b){if(st)st.textContent='Las contraseñas no coinciden.';return;}
  if(!/[A-Za-z]/.test(a)||!/[0-9]/.test(a)){if(st)st.textContent='Incluye al menos una letra y un número.';return;}
  const {error}=await sb.auth.updateUser({password:a});
  if(error){if(st)st.textContent=error.message;return;}
  if(st)st.textContent='Contraseña actualizada. Cerrando la sesión para que vuelvas a entrar…';
  history.replaceState({},'',location.pathname);
  setTimeout(async()=>{p64CloseReset();await sb.auth.signOut({scope:'global'});session=null;profile=null;showAuth('login');},700);
}
const p64AuthTab=typeof authTab==='function'?authTab:null;if(p64AuthTab)authTab=function(mode){const r=p64AuthTab.apply(this,arguments);setTimeout(()=>{const b=document.getElementById('p64Forgot');if(b)b.style.display=mode==='login'?'':'none'},0);return r};
if(sb?.auth?.onAuthStateChange){sb.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')p64ShowReset()});}
setTimeout(async()=>{p64InjectForgot();if(new URLSearchParams(location.search).get('recovery')==='1'){const {data}=await sb.auth.getSession();if(data?.session)p64ShowReset();}},350);
