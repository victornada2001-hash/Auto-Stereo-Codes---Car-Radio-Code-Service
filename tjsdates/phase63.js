// Phase 63: restricted-account gate for old/still-valid sessions.
let p63RestrictedState=null;
function p63Esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function p63Remove(){document.getElementById('p63Restricted')?.remove()}
function p63StateRow(data){return Array.isArray(data)?(data[0]||null):data}
async function p63GetState(){
  if(!session)return null;
  const {data,error}=await sb.rpc('get_my_account_state');
  if(error)throw error;
  return p63StateRow(data);
}
async function p63Export(){
  try{
    const {data,error}=await sb.rpc('export_my_data');
    if(error)throw error;
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`tjsdates-export-${new Date().toISOString().slice(0,10)}.json`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){alert(e?.message||'No se pudo exportar tus datos.');}
}
async function p63Delete(){
  if(!confirm('¿Solicitar eliminación de tu cuenta? Tendrás 7 días para cancelar antes del borrado definitivo.'))return;
  try{
    const {data,error}=await sb.rpc('request_account_deletion',{p_reason:'Solicitud desde cuenta restringida'});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    alert(row?.scheduled_for?`Eliminación programada para ${new Date(row.scheduled_for).toLocaleString()}.`:'Solicitud de eliminación registrada.');
  }catch(e){alert(e?.message||'No se pudo solicitar la eliminación.');}
}
async function p63Support(){
  const box=document.getElementById('p63SupportBox');if(!box)return;
  box.hidden=!box.hidden;
}
async function p63SendSupport(){
  const cat=document.getElementById('p63Cat')?.value||'account';
  const subject=(document.getElementById('p63Subject')?.value||'').trim();
  const message=(document.getElementById('p63Message')?.value||'').trim();
  const status=document.getElementById('p63SupportStatus');
  if(subject.length<4||message.length<10){if(status)status.textContent='Escribe un asunto y mensaje con más detalle.';return;}
  try{
    const {error}=await sb.rpc('create_support_ticket',{p_category:cat,p_subject:subject,p_message:message});
    if(error)throw error;
    if(status)status.textContent='Solicitud enviada correctamente.';
  }catch(e){if(status)status.textContent=e?.message||'No se pudo enviar la solicitud.';}
}
function p63Render(s){
  p63RestrictedState=s;p63Remove();
  const root=document.createElement('div');root.id='p63Restricted';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.innerHTML=`<style>
  #p63Restricted{position:fixed;inset:0;z-index:2147483600;background:#0d0d12;color:#fff;display:grid;place-items:center;padding:20px;font-family:inherit}
  #p63Restricted .p63card{width:min(620px,100%);background:#17171f;border:1px solid #2b2b38;border-radius:24px;padding:24px;box-shadow:0 24px 80px #0008}
  #p63Restricted h1{margin:0 0 8px;font-size:28px}#p63Restricted p{color:#c8c8d4;line-height:1.5}
  #p63Restricted .p63reason{background:#22222c;border-radius:14px;padding:12px;margin:14px 0}
  #p63Restricted .p63actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
  #p63Restricted button,#p63Restricted select,#p63Restricted input,#p63Restricted textarea{font:inherit;border-radius:12px;border:1px solid #3a3a48;background:#22222c;color:#fff;padding:12px}
  #p63Restricted button{cursor:pointer;font-weight:700}#p63Restricted .primary{background:#ff4d7d;border-color:#ff4d7d}
  #p63Restricted textarea{min-height:120px;resize:vertical}#p63SupportBox{display:grid;gap:10px;margin-top:16px}
  @media(max-width:520px){#p63Restricted .p63actions{grid-template-columns:1fr}}
  </style><div class="p63card"><h1>Cuenta restringida</h1><p>Tu sesión sigue siendo válida, pero TJSDATES bloqueó las funciones sociales de esta cuenta.</p>
  <div class="p63reason"><strong>Estado:</strong> ${p63Esc(s.account_state||'restringida')}<br>${s.suspension_reason?`<strong>Motivo:</strong> ${p63Esc(s.suspension_reason)}<br>`:''}${s.suspended_until?`<strong>Hasta:</strong> ${p63Esc(new Date(s.suspended_until).toLocaleString())}`:''}</div>
  <p>Aún puedes contactar soporte, descargar tus datos, solicitar la eliminación de tu cuenta o cerrar sesión.</p>
  <div class="p63actions"><button class="primary" onclick="p63Support()">Contactar soporte</button><button onclick="p63Export()">Descargar mis datos</button><button onclick="p63Delete()">Eliminar mi cuenta</button><button onclick="logout()">Cerrar sesión</button></div>
  <div id="p63SupportBox" hidden><select id="p63Cat"><option value="account">Cuenta / apelación</option><option value="safety">Seguridad</option><option value="technical">Problema técnico</option><option value="billing">Facturación</option></select><input id="p63Subject" maxlength="120" placeholder="Asunto"><textarea id="p63Message" maxlength="2000" placeholder="Cuéntanos qué ocurrió"></textarea><button class="primary" onclick="p63SendSupport()">Enviar solicitud</button><div id="p63SupportStatus" aria-live="polite"></div></div></div>`;
  document.body.appendChild(root);
}
async function p63Check(){
  if(!session){p63Remove();return false;}
  try{
    const s=await p63GetState();
    const restricted=!!s&&((s.account_state&&s.account_state!=='active')||s.is_active===false);
    if(restricted){p63Render(s);return true;}
    p63Remove();p63RestrictedState=null;return false;
  }catch(_e){return false;}
}
const p63Boot=typeof boot==='function'?boot:null;if(p63Boot)boot=async function(...args){const r=await p63Boot.apply(this,args);await p63Check();return r};
const p63Logout=typeof logout==='function'?logout:null;if(p63Logout)logout=async function(...args){p63Remove();return await p63Logout.apply(this,args)};
setTimeout(()=>p63Check(),700);
