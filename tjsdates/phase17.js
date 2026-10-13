function injectAdvancedFiltersUI(){
  const sec=$('page-filters');if(!sec||$('advancedFiltersCard'))return;
  const card=document.createElement('div');card.id='advancedFiltersCard';card.className='card';card.style.marginTop='14px';
  card.innerHTML=`<h3>Filtros avanzados</h3><div class="field"><label>Objetivo de relación</label><div id="fGoals" class="chips"><button type="button" class="chip" data-v="relación seria">Relación seria</button><button type="button" class="chip" data-v="relación a largo plazo">Largo plazo</button><button type="button" class="chip" data-v="citas">Citas</button><button type="button" class="chip" data-v="algo casual">Algo casual</button><button type="button" class="chip" data-v="amistad">Amistad</button><button type="button" class="chip" data-v="conocer personas">Conocer personas</button></div></div><label class="privacytoggle"><input id="fVerifiedOnly" type="checkbox"><span><b>Solo perfiles verificados</b><div class="note">Muestra únicamente personas con verificación aprobada.</div></span></label><button class="btn primary" style="margin-top:14px" onclick="saveAdvancedFilters()">Guardar filtros avanzados</button><div id="advancedFilterStatus" class="status"></div>`;
  sec.appendChild(card);
  card.querySelectorAll('.chip').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
}

async function loadAdvancedFilters(){
  if(!session)return;injectAdvancedFiltersUI();
  const {data,error}=await sb.from('preferences').select('goals,verified_only').eq('user_id',session.user.id).maybeSingle();if(error)return setStatus('advancedFilterStatus',error.message);
  const goals=data?.goals||[];document.querySelectorAll('#fGoals .chip').forEach(b=>b.classList.toggle('on',goals.includes(b.dataset.v)));if($('fVerifiedOnly'))$('fVerifiedOnly').checked=!!data?.verified_only;
}

async function saveAdvancedFilters(){
  const goals=[...document.querySelectorAll('#fGoals .chip.on')].map(x=>x.dataset.v);
  const {error}=await sb.from('preferences').update({goals,verified_only:!!$('fVerifiedOnly')?.checked,updated_at:new Date().toISOString()}).eq('user_id',session.user.id);
  setStatus('advancedFilterStatus',error?error.message:'Filtros avanzados guardados.',!error);if(!error)loadDiscovery();
}

const p17LoadFilters=loadFilters;
loadFilters=async function(){await p17LoadFilters();await loadAdvancedFilters()};

const p17Go=go;
go=function(page){p17Go(page);if(page==='filters')setTimeout(loadAdvancedFilters,60)};

setTimeout(()=>{injectAdvancedFiltersUI();if(session)loadAdvancedFilters()},900);

if(!document.querySelector('script[data-tjs-phase18]')){
  const phase18Script=document.createElement('script');
  phase18Script.src='phase18.js?v=1';
  phase18Script.defer=true;
  phase18Script.dataset.tjsPhase18='1';
  document.body.appendChild(phase18Script);
}
