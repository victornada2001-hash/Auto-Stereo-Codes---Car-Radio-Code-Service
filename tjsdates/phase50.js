// Phase 50: private date safety plans and user-controlled check-ins.

function safety50Copy(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  return en?{
    badge:'Date safety',title:'Safety check-in',note:'Create a private plan for a real-life date. Your Match cannot see this information.',
    newPlan:'Create safety plan',history:'My safety plans',match:'Match',trustedName:'Trusted contact name',trustedContact:'Phone or email',venue:'Meeting place',area:'Area / neighborhood',start:'Date start',checkin:'Check-in time',notes:'Notes (optional)',save:'Save plan',
    safe:'I’m okay',help:'I need help',cancel:'Cancel plan',share:'Share plan',empty:'You do not have safety plans yet.',planned:'Planned',safeState:'Checked in safe',helpState:'Help requested',cancelled:'Cancelled',
    emergency:'If you are in immediate danger, call emergency services now.',call911:'Call 911',shareTitle:'TJSDATES safety plan',saved:'Safety plan saved.',updated:'Safety status updated.'
  }:{
    badge:'Seguridad de cita',title:'Check-in de seguridad',note:'Crea un plan privado para una cita en persona. Tu Match no puede ver esta información.',
    newPlan:'Crear plan de seguridad',history:'Mis planes de seguridad',match:'Match',trustedName:'Nombre del contacto de confianza',trustedContact:'Teléfono o correo',venue:'Lugar de encuentro',area:'Zona / colonia',start:'Inicio de la cita',checkin:'Hora de check-in',notes:'Notas (opcional)',save:'Guardar plan',
    safe:'Estoy bien',help:'Necesito ayuda',cancel:'Cancelar plan',share:'Compartir plan',empty:'Aún no tienes planes de seguridad.',planned:'Planeado',safeState:'Check-in seguro',helpState:'Ayuda solicitada',cancelled:'Cancelado',
    emergency:'Si estás en peligro inmediato, llama a emergencias ahora.',call911:'Llamar al 911',shareTitle:'Plan de seguridad TJSDATES',saved:'Plan de seguridad guardado.',updated:'Estado de seguridad actualizado.'
  };
}

function injectSafety50(){
  const page=$('page-safety');if(!page||$('dateSafety50'))return;
  const t=safety50Copy();
  const c=document.createElement('div');c.id='dateSafety50';c.className='card';c.style.marginTop='14px';
  c.innerHTML=`<div class="pill">${esc(t.badge)}</div><h3 style="margin:8px 0 0">${esc(t.title)}</h3><p class="note">${esc(t.note)}</p>
  <button class="btn primary" type="button" onclick="openDateSafety50()">${esc(t.newPlan)}</button>
  <h3 style="margin:18px 0 8px">${esc(t.history)}</h3><div id="dateSafetyList50" class="stack"></div>`;
  page.appendChild(c);loadDateSafety50();
}

async function openDateSafety50(){
  if(!session)return;
  const t=safety50Copy();
  const {data,error}=await sb.rpc('get_my_matches');if(error)return toast(error.message||String(error));
  const matches=data||[];if(!matches.length)return toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'You need an active Match first.':'Necesitas tener un Match activo primero.');
  const now=new Date(Date.now()+60*60*1000);const pad=n=>String(n).padStart(2,'0');const local=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const check=new Date(now.getTime()+2*60*60*1000);const checkLocal=`${check.getFullYear()}-${pad(check.getMonth()+1)}-${pad(check.getDate())}T${pad(check.getHours())}:${pad(check.getMinutes())}`;
  showModal(`<div class="date-safety-form50"><div class="pill">${esc(t.badge)}</div><h2>${esc(t.newPlan)}</h2>
    <label>${esc(t.match)}<select id="ds50Match">${matches.map(m=>`<option value="${esc(m.match_id)}">${esc(m.display_name||'Match')}${m.is_verified?' ✓':''}</option>`).join('')}</select></label>
    <label>${esc(t.trustedName)}<input id="ds50TrustedName" maxlength="80"></label>
    <label>${esc(t.trustedContact)}<input id="ds50TrustedContact" maxlength="160" placeholder="WhatsApp / email"></label>
    <label>${esc(t.venue)}<input id="ds50Venue" maxlength="160"></label>
    <label>${esc(t.area)}<input id="ds50Area" maxlength="120"></label>
    <label>${esc(t.start)}<input id="ds50Start" type="datetime-local" value="${local}"></label>
    <label>${esc(t.checkin)}<input id="ds50Check" type="datetime-local" value="${checkLocal}"></label>
    <label>${esc(t.notes)}<textarea id="ds50Notes" maxlength="500"></textarea></label>
    <button class="btn primary" type="button" onclick="saveDateSafety50()">${esc(t.save)}</button><div id="ds50Status" class="status"></div></div>`);
}

async function saveDateSafety50(){
  const t=safety50Copy();
  const start=$('ds50Start')?.value,check=$('ds50Check')?.value;
  try{
    const {error}=await sb.rpc('create_date_safety_plan',{
      p_match_id:$('ds50Match')?.value,
      p_trusted_name:$('ds50TrustedName')?.value.trim()||'',
      p_trusted_contact:$('ds50TrustedContact')?.value.trim()||'',
      p_venue_name:$('ds50Venue')?.value.trim()||'',
      p_venue_area:$('ds50Area')?.value.trim()||null,
      p_starts_at:start?new Date(start).toISOString():null,
      p_checkin_at:check?new Date(check).toISOString():null,
      p_notes:$('ds50Notes')?.value.trim()||null
    });if(error)throw error;
    toast(t.saved);closeModal();await loadDateSafety50();
  }catch(e){setStatus('ds50Status',e.message||String(e));}
}

function safety50StateLabel(s){const t=safety50Copy();return s==='safe'?t.safeState:s==='help'?t.helpState:s==='cancelled'?t.cancelled:t.planned;}
function safety50ShareText(p){
  const t=safety50Copy();
  const start=new Date(p.starts_at).toLocaleString();const check=new Date(p.checkin_at).toLocaleString();
  return `${t.shareTitle}\n${p.match_name||'Match'}\n${p.venue_name}${p.venue_area?' · '+p.venue_area:''}\n${start}\nCheck-in: ${check}${p.notes?'\n'+p.notes:''}`;
}
async function shareDateSafety50(id){
  const plans=window.__tjsDateSafety50||[];const p=plans.find(x=>x.id===id);if(!p)return;
  const text=safety50ShareText(p);
  try{if(navigator.share)await navigator.share({title:safety50Copy().shareTitle,text});else{await navigator.clipboard.writeText(text);toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Plan copied.':'Plan copiado.');}}catch(_e){}
}
async function updateDateSafety50(id,status){
  const t=safety50Copy();
  if(status==='help'){
    const ok=confirm(`${t.emergency}\n\n${typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Mark this plan as needing help?':'¿Marcar este plan como que necesitas ayuda?'}`);if(!ok)return;
  }
  try{const {error}=await sb.rpc('update_date_safety_status',{p_plan_id:id,p_status:status});if(error)throw error;toast(t.updated);await loadDateSafety50();if(status==='help')showEmergency50();}catch(e){toast(e.message||String(e));}
}
function showEmergency50(){const t=safety50Copy();showModal(`<div class="card"><h2>${esc(t.help)}</h2><p>${esc(t.emergency)}</p><div class="row"><a class="btn primary" href="tel:911">${esc(t.call911)}</a><button class="btn ghost" type="button" onclick="closeModal()">OK</button></div></div>`);}

async function loadDateSafety50(){
  if(!session||!$('dateSafetyList50'))return;const box=$('dateSafetyList50'),t=safety50Copy();box.innerHTML='<div class="note">…</div>';
  try{const {data,error}=await sb.rpc('get_my_date_safety_plans',{p_limit:30});if(error)throw error;window.__tjsDateSafety50=data||[];box.innerHTML='';
    for(const p of data||[]){const d=document.createElement('div');d.className='queueitem';d.style.alignItems='stretch';d.style.flexDirection='column';
      d.innerHTML=`<div class="row" style="justify-content:space-between"><div><b>${esc(p.match_name||'Match')}</b><div class="note">${esc(p.venue_name)}${p.venue_area?' · '+esc(p.venue_area):''}</div></div><span class="pill">${esc(safety50StateLabel(p.status))}</span></div><div class="note" style="margin-top:6px">${new Date(p.starts_at).toLocaleString()} · Check-in ${new Date(p.checkin_at).toLocaleString()}</div><div class="note">${esc(p.trusted_name)} · ${esc(p.trusted_contact)}</div>`;
      const row=document.createElement('div');row.className='row';row.style.marginTop='9px';row.style.flexWrap='wrap';
      if(p.status==='planned')row.innerHTML=`<button class="mini" onclick="updateDateSafety50('${p.id}','safe')">${esc(t.safe)}</button><button class="mini" onclick="updateDateSafety50('${p.id}','help')">${esc(t.help)}</button><button class="mini" onclick="updateDateSafety50('${p.id}','cancelled')">${esc(t.cancel)}</button>`;
      row.innerHTML+=`<button class="mini" onclick="shareDateSafety50('${p.id}')">${esc(t.share)}</button>`;d.appendChild(row);box.appendChild(d);
    }
    if(!(data||[]).length)box.innerHTML=`<div class="empty">${esc(t.empty)}</div>`;
  }catch(e){box.innerHTML=`<div class="empty">${esc(e.message||String(e))}</div>`;}
}

function injectSafety50Styles(){if($('safety50Styles'))return;const s=document.createElement('style');s.id='safety50Styles';s.textContent='.date-safety-form50 label{display:block;margin:10px 0}.date-safety-form50 input,.date-safety-form50 select,.date-safety-form50 textarea{width:100%;margin-top:5px}';document.head.appendChild(s);}

const p50Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;if(p50Apply)applyTjsLanguage=function(){p50Apply();injectSafety50();};
const p50Go=typeof go==='function'?go:null;if(p50Go)go=function(page){p50Go(page);if(page==='safety')setTimeout(()=>{injectSafety50();loadDateSafety50();},80);};
injectSafety50Styles();setTimeout(()=>{injectSafety50();},400);

if(!document.querySelector('script[data-tjs-phase51]')){
  const s=document.createElement('script');s.src='phase51.js?v=1';s.defer=true;s.dataset.tjsPhase51='1';document.body.appendChild(s);
}
