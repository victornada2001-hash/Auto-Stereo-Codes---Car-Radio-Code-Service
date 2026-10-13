function injectPhaseEightStyles(){
  if(document.getElementById('phase8Styles'))return;
  const s=document.createElement('style');s.id='phase8Styles';s.textContent=`
  .privacygrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.privacytoggle{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:14px;padding:12px;background:#130e1c}.privacytoggle input{width:19px;height:19px;accent-color:var(--pink);margin-top:2px}.accountDanger{border-color:#7f2f48;background:linear-gradient(180deg,#24101a,#170e15)}.ticket{border:1px solid var(--line);border-radius:14px;padding:12px;margin:8px 0}.ticket .state{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.recoverylink{border:0;background:none;color:#ff6aa3;cursor:pointer;padding:10px 0;font-weight:800}.exportbox{display:flex;gap:10px;flex-wrap:wrap}@media(max-width:700px){.privacygrid{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}

function injectPhaseEightUI(){
  injectPhaseEightStyles();
  const side=document.querySelector('aside.side'),main=document.querySelector('main.content');if(!side||!main)return;
  if(!document.querySelector('[data-page="privacy"]')){
    const profileBtn=side.querySelector('[data-page="profile"]');
    const p=document.createElement('button');p.className='navbtn';p.dataset.page='privacy';p.onclick=()=>go('privacy');p.innerHTML='🔐 Privacidad';side.insertBefore(p,profileBtn);
    const s=document.createElement('button');s.className='navbtn';s.dataset.page='support';s.onclick=()=>go('support');s.innerHTML='💁 Soporte';side.insertBefore(s,profileBtn);
  }
  if(!$('page-privacy')){
    const sec=document.createElement('section');sec.id='page-privacy';sec.className='hidden';sec.innerHTML=`
      <div class="sectionhead"><div><div class="pill">Tú decides qué mostrar</div><h2>Cuenta y privacidad</h2></div><button class="btn ghost" onclick="loadPrivacySettings()">Actualizar</button></div>
      <div class="card"><h3>Visibilidad del perfil</h3><div class="privacygrid">
        <label class="privacytoggle"><input id="pvPaused" type="checkbox"><span><b>Pausar mi perfil</b><div class="note">Oculta tu perfil del descubrimiento sin borrar tu cuenta.</div></span></label>
        <label class="privacytoggle"><input id="pvDiscoverable" type="checkbox"><span><b>Aparecer en Descubrir</b><div class="note">Permite que otras personas te encuentren.</div></span></label>
        <label class="privacytoggle"><input id="pvAge" type="checkbox"><span><b>Mostrar edad</b><div class="note">Puedes ocultar tu edad del perfil público.</div></span></label>
        <label class="privacytoggle"><input id="pvDistance" type="checkbox"><span><b>Mostrar distancia aproximada</b><div class="note">Nunca mostramos coordenadas exactas.</div></span></label>
        <label class="privacytoggle"><input id="pvGender" type="checkbox"><span><b>Mostrar género</b></span></label>
        <label class="privacytoggle"><input id="pvOrientation" type="checkbox"><span><b>Mostrar orientación</b></span></label>
        <label class="privacytoggle"><input id="pvWork" type="checkbox"><span><b>Mostrar trabajo</b></span></label>
        <label class="privacytoggle"><input id="pvSchool" type="checkbox"><span><b>Mostrar escuela</b></span></label>
        <label class="privacytoggle"><input id="pvRecent" type="checkbox"><span><b>Mostrar actividad reciente</b></span></label>
        <label class="privacytoggle"><input id="pvInvisible" type="checkbox"><span><b>Modo invisible</b><div class="note">Preparado para habilitarse según las reglas del plan al final.</div></span></label>
      </div><button class="btn primary" style="margin-top:14px" onclick="savePrivacySettings()">Guardar privacidad</button><div id="privacyStatus" class="status"></div></div>
      <div class="card" style="margin-top:14px"><h3>Tus datos</h3><p class="note">Puedes descargar una copia JSON de los datos asociados a tu cuenta.</p><div class="exportbox"><button class="btn ghost" onclick="downloadMyData()">⬇ Descargar mis datos</button><button class="btn ghost" onclick="sendPasswordRecovery()">🔑 Cambiar contraseña</button></div><div id="dataStatus" class="status"></div></div>
      <div class="card accountDanger" style="margin-top:14px"><h3>Eliminar cuenta</h3><p class="note">Al solicitar eliminación, tu perfil se pausa de inmediato y se abre un periodo de gracia de 7 días para cancelar la solicitud.</p><div id="deleteState"></div><div class="row"><button class="btn danger" onclick="requestDeletion()">Solicitar eliminación</button><button id="cancelDeleteBtn" class="btn ghost hidden" onclick="cancelDeletion()">Cancelar solicitud</button></div><div id="deleteStatus" class="status"></div></div>`;
    main.appendChild(sec);
  }
  if(!$('page-support')){
    const sec=document.createElement('section');sec.id='page-support';sec.className='hidden';sec.innerHTML=`
      <div class="sectionhead"><div><div class="pill">Estamos para ayudarte</div><h2>Soporte TJSDATES</h2></div><button class="btn ghost" onclick="loadSupportTickets()">Actualizar</button></div>
      <div class="card"><div class="grid2"><div class="field"><label>Categoría</label><select id="supportCategory"><option value="account">Cuenta</option><option value="safety">Seguridad</option><option value="verification">Verificación</option><option value="technical">Problema técnico</option><option value="billing">Pagos (cuando se habiliten)</option><option value="other">Otro</option></select></div><div class="field"><label>Asunto</label><input id="supportSubject" maxlength="120" placeholder="¿En qué podemos ayudarte?"></div></div><div class="field"><label>Mensaje</label><textarea id="supportMessage" maxlength="2000" placeholder="Describe el problema con el mayor detalle posible"></textarea></div><button class="btn primary" onclick="createSupportTicket()">Enviar solicitud</button><div id="supportStatus" class="status"></div></div>
      <div class="card" style="margin-top:14px"><h3>Mis solicitudes</h3><div id="supportList" class="stack"></div></div>`;
    main.appendChild(sec);
  }
  const authCard=document.querySelector('#auth .auth.card');
  if(authCard&&!$('forgotPasswordBtn')){
    const b=document.createElement('button');b.id='forgotPasswordBtn';b.className='recoverylink';b.type='button';b.textContent='¿Olvidaste tu contraseña?';b.onclick=sendPasswordRecovery;authCard.appendChild(b);
  }
}

async function loadPrivacySettings(){
  if(!session)return;const {data,error}=await sb.rpc('get_my_privacy_settings');if(error)return setStatus('privacyStatus',error.message);const p=data?.[0];if(!p)return;
  $('pvPaused').checked=!!p.is_paused;$('pvDiscoverable').checked=!!p.discoverable;$('pvAge').checked=!!p.show_age;$('pvDistance').checked=!!p.show_distance;$('pvGender').checked=!!p.show_gender;$('pvOrientation').checked=!!p.show_orientation;$('pvWork').checked=!!p.show_work;$('pvSchool').checked=!!p.show_school;$('pvRecent').checked=!!p.show_recent_activity;$('pvInvisible').checked=!!p.invisible_mode;loadDeletionStatus();
}
async function savePrivacySettings(){
  const args={p_is_paused:$('pvPaused').checked,p_show_age:$('pvAge').checked,p_show_distance:$('pvDistance').checked,p_show_orientation:$('pvOrientation').checked,p_show_gender:$('pvGender').checked,p_show_work:$('pvWork').checked,p_show_school:$('pvSchool').checked,p_show_recent_activity:$('pvRecent').checked,p_discoverable:$('pvDiscoverable').checked,p_invisible_mode:$('pvInvisible').checked};
  const {error}=await sb.rpc('update_my_privacy_settings',args);setStatus('privacyStatus',error?error.message:'Preferencias de privacidad guardadas.',!error);if(!error){profile={...profile,is_paused:args.p_is_paused};if(!args.p_is_paused&&args.p_discoverable)loadDiscovery()}
}

async function downloadMyData(){setStatus('dataStatus','Preparando tu archivo...',true);const {data,error}=await sb.rpc('export_my_data');if(error)return setStatus('dataStatus',error.message);const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`tjsdates-mis-datos-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('dataStatus','Copia de datos generada.',true)}

async function sendPasswordRecovery(){
  let email=session?.user?.email||$('authEmail')?.value?.trim();if(!email)email=prompt('Escribe el correo de tu cuenta:')||'';if(!email)return;
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error){if($('authStatus'))setStatus('authStatus',error.message);else toast(error.message);return}const msg='Te enviamos un enlace para cambiar tu contraseña.';if($('authStatus')&&!session)setStatus('authStatus',msg,true);else toast(msg)
}
function showRecoveryPasswordModal(){showModal(`<h2>Nueva contraseña</h2><p class="note">Elige una contraseña de al menos 8 caracteres.</p><div class="field"><input id="recoveryNewPass" type="password" minlength="8" autocomplete="new-password" placeholder="Nueva contraseña"></div><button class="btn primary" onclick="completePasswordRecovery()">Guardar contraseña</button><div id="recoveryStatus" class="status"></div>`)}
async function completePasswordRecovery(){const p=$('recoveryNewPass')?.value||'';if(p.length<8)return setStatus('recoveryStatus','Usa mínimo 8 caracteres.');const {error}=await sb.auth.updateUser({password:p});if(error)return setStatus('recoveryStatus',error.message);setStatus('recoveryStatus','Contraseña actualizada.',true);setTimeout(()=>{closeModal();boot()},800)}

async function loadDeletionStatus(){const {data,error}=await sb.rpc('get_my_account_deletion_status');if(error||!$('deleteState'))return;const d=data?.[0],box=$('deleteState'),cancel=$('cancelDeleteBtn');if(!d||d.status==='cancelled'){box.innerHTML='<p class="note">No hay una solicitud de eliminación activa.</p>';cancel?.classList.add('hidden');return}if(d.status==='pending'){box.innerHTML=`<div class="pill">Eliminación pendiente</div><p class="note">Programada para ${new Date(d.scheduled_for).toLocaleString()}. Puedes cancelarla durante el periodo de gracia.</p>`;cancel?.classList.remove('hidden')}else{box.innerHTML=`<p class="note">Estado: ${esc(d.status)}</p>`;cancel?.classList.add('hidden')}}
async function requestDeletion(){if(!confirm('Esto pausará tu perfil inmediatamente y solicitará la eliminación de tu cuenta. ¿Continuar?'))return;const reason=prompt('Motivo opcional de eliminación:')||null;const {data,error}=await sb.rpc('request_account_deletion',{p_reason:reason});if(error)return setStatus('deleteStatus',error.message);setStatus('deleteStatus','Solicitud registrada. Tu perfil quedó pausado.',true);profile={...profile,is_paused:true};loadDeletionStatus()}
async function cancelDeletion(){const {error}=await sb.rpc('cancel_account_deletion');if(error)return setStatus('deleteStatus',error.message);setStatus('deleteStatus','Solicitud cancelada y perfil reactivado.',true);profile={...profile,is_paused:false};loadDeletionStatus()}

async function createSupportTicket(){const subject=$('supportSubject').value.trim(),message=$('supportMessage').value.trim(),category=$('supportCategory').value;if(subject.length<4||message.length<10)return setStatus('supportStatus','Agrega un asunto y una descripción más completa.');const {error}=await sb.from('support_tickets').insert({user_id:session.user.id,category,subject,message,status:'open'});if(error)return setStatus('supportStatus',error.message);$('supportSubject').value='';$('supportMessage').value='';setStatus('supportStatus','Solicitud enviada a soporte.',true);loadSupportTickets()}
async function loadSupportTickets(){if(!session||!$('supportList'))return;const box=$('supportList');box.innerHTML='<div class="note">Cargando...</div>';const {data,error}=await sb.from('support_tickets').select('id,category,subject,message,status,created_at,updated_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50);if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}box.innerHTML='';for(const t of data||[]){const e=document.createElement('div');e.className='ticket';e.innerHTML=`<div class="row" style="justify-content:space-between"><b>${esc(t.subject)}</b><span class="state">${esc(t.status)}</span></div><div class="note">${esc(t.category)} · ${new Date(t.created_at).toLocaleString()}</div><p>${esc(t.message)}</p>`;box.appendChild(e)}if(!(data||[]).length)box.innerHTML='<div class="empty">No tienes solicitudes de soporte.</div>'}

const phase8PreviousGo=go;
go=function(page){phase8PreviousGo(page);if(page==='privacy')loadPrivacySettings();if(page==='support')loadSupportTickets()};

sb.auth.onAuthStateChange((event,newSession)=>{if(event==='PASSWORD_RECOVERY'){session=newSession;setTimeout(showRecoveryPasswordModal,50)}});
const p8Timer=setInterval(()=>{if(document.querySelector('main.content')){injectPhaseEightUI();clearInterval(p8Timer)}},100);
setTimeout(()=>injectPhaseEightUI(),1100);

(()=>{const s=document.createElement('script');s.src='phase9.js';s.defer=true;document.body.appendChild(s)})();
