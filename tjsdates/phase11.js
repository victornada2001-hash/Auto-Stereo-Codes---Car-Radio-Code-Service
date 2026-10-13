let pendingReportFiles=[];

function injectPhaseElevenStyles(){
  if(document.getElementById('phase11Styles'))return;
  const s=document.createElement('style');
  s.id='phase11Styles';
  s.textContent=`
    .evidence-list{display:grid;gap:8px;margin-top:10px}.evidence-chip{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--line);border-radius:12px;background:#160f20}.admin-evidence-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.admin-evidence-grid img{width:100%;height:220px;object-fit:cover;border-radius:14px;border:1px solid var(--line)}.kbdhint{font-size:12px;color:var(--muted);margin-top:8px}.safe-share-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.skiplink{position:fixed;left:12px;top:-60px;z-index:10000;background:#fff;color:#111;padding:10px 14px;border-radius:10px}.skiplink:focus{top:12px}@media(max-width:640px){.safe-share-grid{grid-template-columns:1fr}.admin-evidence-grid{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(s);
}

function improveAccessibility(){
  injectPhaseElevenStyles();
  if(!document.getElementById('skipMain')){
    const a=document.createElement('a');a.id='skipMain';a.className='skiplink';a.href='#page-discover';a.textContent='Saltar al contenido principal';document.body.prepend(a);
  }
  const toastEl=$('toast');if(toastEl){toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite')}
  document.querySelectorAll('.status').forEach(x=>{x.setAttribute('role','status');x.setAttribute('aria-live','polite')});
  document.querySelectorAll('button:not([aria-label])').forEach(b=>{const t=(b.textContent||'').trim();if(t)b.setAttribute('aria-label',t)});
  const modal=$('modal');if(modal){modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Ventana de TJSDATES')}
  const deck=$('deck');if(deck&&!document.getElementById('swipeKeyboardHint')){const h=document.createElement('div');h.id='swipeKeyboardHint';h.className='kbdhint';h.textContent='Teclado: ← pasar · → Me gusta';deck.parentElement?.appendChild(h)}
}

const p11ShowModal=showModal;
showModal=function(html){
  p11ShowModal(html);
  setTimeout(()=>{const first=$('modal')?.querySelector('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');first?.focus()},20);
};

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('modal')?.classList.contains('hidden')){closeModal();return}
  const tag=document.activeElement?.tagName?.toLowerCase();
  if(['input','textarea','select'].includes(tag)||!$('app')||$('app').classList.contains('hidden'))return;
  if(!$('page-discover')?.classList.contains('hidden')){
    if(e.key==='ArrowLeft'){e.preventDefault();passCurrent()}
    if(e.key==='ArrowRight'){e.preventDefault();likeCurrent()}
  }
});

reportCurrentMatch=function(){
  if(!currentConversation)return;
  pendingReportFiles=[];
  showModal(`<h2>Reportar a ${esc(currentConversation.other.display_name||'usuario')}</h2>
    <p class="note">El reporte es privado. Moderación revisará la información y, si agregas evidencia, solo el equipo autorizado podrá verla.</p>
    <div class="field"><label for="reportReason">Motivo</label><select id="reportReason">
      <option value="spam">Spam</option><option value="estafa">Estafa</option><option value="acoso">Acoso</option>
      <option value="perfil falso">Perfil falso</option><option value="suplantación">Suplantación</option><option value="fotografías robadas">Fotografías robadas</option>
      <option value="contenido sexual no solicitado">Contenido sexual no solicitado</option><option value="menor de edad">Posible menor de edad</option>
      <option value="amenazas">Amenazas</option><option value="comportamiento peligroso">Comportamiento peligroso</option>
      <option value="discriminación">Discriminación</option><option value="prostitución/explotación">Prostitución / explotación</option><option value="otro">Otro</option>
    </select></div>
    <div class="field"><label for="reportComment">Detalles</label><textarea id="reportComment" maxlength="2000" placeholder="Describe qué ocurrió. Evita incluir datos personales innecesarios."></textarea></div>
    <div class="field"><label for="reportEvidenceInput">Evidencia opcional</label><input id="reportEvidenceInput" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple><div class="note">Hasta 3 archivos. Máximo 10 MB cada uno.</div><div id="reportEvidenceList" class="evidence-list"></div></div>
    <button id="submitReportBtn" class="btn danger" onclick="submitCurrentReport()">Enviar reporte</button>`);
  $('reportEvidenceInput')?.addEventListener('change',e=>{
    pendingReportFiles=[...(e.target.files||[])].slice(0,3);
    renderPendingEvidence();
  });
};

function renderPendingEvidence(){
  const box=$('reportEvidenceList');if(!box)return;box.innerHTML='';
  pendingReportFiles.forEach((f,i)=>{const d=document.createElement('div');d.className='evidence-chip';d.innerHTML=`<span>${esc(f.name)} · ${(f.size/1024/1024).toFixed(1)} MB</span><button class="mini" type="button" aria-label="Quitar archivo">✕</button>`;d.querySelector('button').onclick=()=>{pendingReportFiles.splice(i,1);renderPendingEvidence()};box.appendChild(d)});
}

async function uploadReportEvidence(reportId){
  let uploaded=0;
  for(const file of pendingReportFiles){
    if(file.size>10*1024*1024)throw new Error(`${file.name}: supera 10 MB`);
    const isPdf=file.type==='application/pdf';
    if(!isPdf&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error(`${file.name}: formato no permitido`);
    const body=isPdf?file:await compressImage(file);
    const ext=isPdf?'pdf':'webp';
    const path=`${session.user.id}/${reportId}/${crypto.randomUUID()}.${ext}`;
    const up=await sb.storage.from('report-evidence').upload(path,body,{contentType:isPdf?'application/pdf':'image/webp',upsert:false});
    if(up.error)throw up.error;
    const ins=await sb.from('report_evidence').insert({report_id:reportId,storage_path:path});
    if(ins.error){await sb.storage.from('report-evidence').remove([path]);throw ins.error}
    uploaded++;
  }
  return uploaded;
}

submitCurrentReport=async function(){
  if(!currentConversation)return;
  const btn=$('submitReportBtn');if(btn)btn.disabled=true;
  const reason=$('reportReason')?.value,comment=$('reportComment')?.value.trim();
  try{
    const {data:reportId,error}=await sb.rpc('create_report',{target_user:currentConversation.other.id,report_reason:reason,report_comment:comment||null});
    if(error)throw error;
    let evidenceError=null,uploaded=0;
    try{uploaded=await uploadReportEvidence(reportId)}catch(e){evidenceError=e}
    closeModal();
    pendingReportFiles=[];
    if(evidenceError)toast(`Reporte enviado. La evidencia no se adjuntó: ${evidenceError.message}`);
    else toast(uploaded?`Reporte enviado con ${uploaded} archivo${uploaded===1?'':'s'} de evidencia.`:'Reporte enviado a moderación.');
  }catch(e){toast(e.message||'No se pudo enviar el reporte.');if(btn)btn.disabled=false}
};

async function showReportEvidence(reportId){
  const {data,error}=await sb.from('report_evidence').select('id,storage_path,created_at').eq('report_id',reportId).order('created_at');
  if(error)return toast(error.message);
  const rows=data||[];
  if(!rows.length)return toast('Este reporte no tiene evidencia adjunta.');
  showModal('<h2>Evidencia del reporte</h2><div id="adminEvidenceGrid" class="admin-evidence-grid"><div class="note">Cargando evidencia privada...</div></div>');
  const box=$('adminEvidenceGrid');box.innerHTML='';
  for(const r of rows){
    const {data:signedData,error:signedError}=await sb.storage.from('report-evidence').createSignedUrl(r.storage_path,600);
    if(signedError)continue;
    const url=signedData?.signedUrl||'';
    const d=document.createElement('div');d.className='card';
    if(r.storage_path.toLowerCase().endsWith('.pdf'))d.innerHTML=`<p><b>Documento PDF</b></p><a class="btn ghost" target="_blank" rel="noopener" href="${esc(url)}">Abrir evidencia</a>`;
    else d.innerHTML=`<img src="${esc(url)}" alt="Evidencia privada del reporte"><div class="note">Disponible temporalmente para moderación.</div>`;
    box.appendChild(d);
  }
  if(!box.children.length)box.innerHTML='<div class="empty">No se pudo abrir la evidencia.</div>';
}

function decorateReportEvidenceButtons(){
  document.querySelectorAll('#reportQueue .queueitem').forEach(item=>{
    if(item.querySelector('.evidence-review-btn'))return;
    const resolve=[...item.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes('resolveReport('));
    const m=(resolve?.getAttribute('onclick')||'').match(/resolveReport\('([^']+)'/);if(!m)return;
    const row=resolve.parentElement||item;
    const b=document.createElement('button');b.className='mini evidence-review-btn';b.textContent='Evidencia';b.onclick=()=>showReportEvidence(m[1]);row.appendChild(b);
  });
}

const p11LoadAdmin=loadAdmin;
loadAdmin=async function(){await p11LoadAdmin();decorateReportEvidenceButtons();};

function injectSafeDateShare(){
  const safety=$('page-safety');if(!safety||$('safeDateShareCard'))return;
  const c=document.createElement('div');c.id='safeDateShareCard';c.className='card';c.style.marginTop='14px';
  c.innerHTML=`<h3>🤝 Comparte tu plan de cita</h3><p class="note">Antes de una primera cita puedes compartir con alguien de confianza el lugar público y la hora. TJSDATES no necesita guardar estos datos.</p><div class="safe-share-grid"><div class="field"><label>Lugar público</label><input id="safeDatePlace" maxlength="120" placeholder="Ej. cafetería en Zona Río"></div><div class="field"><label>Fecha y hora</label><input id="safeDateWhen" type="datetime-local"></div></div><button class="btn primary" onclick="shareSafeDatePlan()">Compartir plan</button><div id="safeDateStatus" class="status" role="status" aria-live="polite"></div>`;
  safety.appendChild(c);
}

async function shareSafeDatePlan(){
  const place=$('safeDatePlace')?.value.trim(),when=$('safeDateWhen')?.value;
  if(!place||!when)return setStatus('safeDateStatus','Agrega lugar y fecha/hora.');
  const text=`Plan de cita TJSDATES\nLugar público: ${place}\nFecha/hora: ${new Date(when).toLocaleString()}\nConsejo: mantén la primera cita en un lugar público.`;
  try{
    if(navigator.share)await navigator.share({title:'Mi plan de cita',text});
    else{await navigator.clipboard.writeText(text);toast('Plan copiado. Compártelo con alguien de confianza.')}
    setStatus('safeDateStatus','Plan listo para compartir. TJSDATES no guardó estos datos.',true);
  }catch(e){if(e.name!=='AbortError')setStatus('safeDateStatus','No se pudo compartir desde este navegador.')}
}

setTimeout(()=>{improveAccessibility();injectSafeDateShare();decorateReportEvidenceButtons()},800);
const p11Go=go;
go=function(page){p11Go(page);setTimeout(()=>{improveAccessibility();if(page==='safety')injectSafeDateShare();if(page==='admin')decorateReportEvidenceButtons()},80)};
