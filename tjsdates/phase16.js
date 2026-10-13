let tjInterestCatalog=[];

function injectPhaseSixteenStyles(){
  if(document.getElementById('phase16Styles'))return;
  const s=document.createElement('style');s.id='phase16Styles';s.textContent=`
  .interestpicker{display:flex;flex-wrap:wrap;gap:8px}.interestpick{border:1px solid var(--line);background:#160f20;color:var(--text);border-radius:999px;padding:9px 12px;cursor:pointer}.interestpick.on{border-color:#ff5a9a;background:#321427}.profilequality{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.qualitybar{flex:1;min-width:180px;height:10px;border-radius:999px;background:#23182f;overflow:hidden}.qualitybar>span{display:block;height:100%;background:linear-gradient(90deg,#ff5a9a,#8b5cf6);width:0}.detailgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}@media(max-width:700px){.detailgrid{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}

async function loadInterestCatalog(){
  if(tjInterestCatalog.length)return tjInterestCatalog;
  const {data,error}=await sb.from('interests').select('id,slug,name_es,name_en').eq('is_active',true).order('sort_order').order('id');
  if(error)throw error;tjInterestCatalog=data||[];return tjInterestCatalog;
}

function renderInterestPicker(host,selectedIds=[]){
  if(!host)return;const selected=new Set((selectedIds||[]).map(Number));host.innerHTML='';
  for(const i of tjInterestCatalog){const b=document.createElement('button');b.type='button';b.className='interestpick'+(selected.has(Number(i.id))?' on':'');b.dataset.id=i.id;b.textContent=i.name_es;b.onclick=()=>{const active=host.querySelectorAll('.interestpick.on').length;if(!b.classList.contains('on')&&active>=10)return toast('Puedes elegir hasta 10 intereses.');b.classList.toggle('on')};host.appendChild(b)}
}
function selectedInterestIds(hostId){return [...document.querySelectorAll(`#${hostId} .interestpick.on`)].map(x=>Number(x.dataset.id))}

function injectProfileDetailsUI(){
  injectPhaseSixteenStyles();
  const sec=$('page-profile');if(!sec||$('profileDetailsCard'))return;
  const card=document.createElement('div');card.id='profileDetailsCard';card.className='card';card.style.marginTop='14px';
  card.innerHTML=`<div class="sectionhead"><div><div class="pill">Haz que te conozcan mejor</div><h3 style="margin:8px 0 0">Más sobre ti</h3></div></div>
  <div class="detailgrid">
    <div class="field"><label>Identidad de género</label><input id="pGenderIdentity" maxlength="80" placeholder="Opcional"></div>
    <div class="field"><label>Orientación sexual</label><input id="pOrientation" maxlength="80" placeholder="Opcional"></div>
    <div class="field"><label>Empresa</label><input id="pCompany" maxlength="120"></div>
    <div class="field"><label>Signo zodiacal</label><select id="pZodiac"><option value="">Prefiero no decir</option><option>Aries</option><option>Tauro</option><option>Géminis</option><option>Cáncer</option><option>Leo</option><option>Virgo</option><option>Libra</option><option>Escorpio</option><option>Sagitario</option><option>Capricornio</option><option>Acuario</option><option>Piscis</option></select></div>
    <div class="field"><label>Ejercicio</label><select id="pExercise"><option value="">Prefiero no decir</option><option value="frequent">Frecuente</option><option value="sometimes">A veces</option><option value="rarely">Rara vez</option></select></div>
    <div class="field"><label>Fumas</label><select id="pSmoking"><option value="">Prefiero no decir</option><option value="no">No</option><option value="sometimes">A veces</option><option value="yes">Sí</option></select></div>
    <div class="field"><label>Alcohol</label><select id="pAlcohol"><option value="">Prefiero no decir</option><option value="no">No</option><option value="social">Socialmente</option><option value="sometimes">A veces</option></select></div>
    <div class="field"><label>Mascotas</label><select id="pPets"><option value="">Prefiero no decir</option><option value="dog">Perro</option><option value="cat">Gato</option><option value="both">Perro y gato</option><option value="other">Otras</option><option value="none">No tengo</option></select></div>
    <div class="field"><label>Hijos</label><select id="pChildren"><option value="">Prefiero no decir</option><option value="yes">Tengo hijos</option><option value="no">No tengo hijos</option></select></div>
    <div class="field"><label>¿Quieres hijos?</label><select id="pWantsChildren"><option value="">Prefiero no decir</option><option value="yes">Sí</option><option value="no">No</option><option value="maybe">Tal vez</option></select></div>
    <div class="field"><label>Idiomas</label><input id="pLanguages" maxlength="100" placeholder="es, en"></div>
    <div class="field"><label>Hábitos de sueño</label><select id="pSleep"><option value="">Prefiero no decir</option><option value="early">Madrugador/a</option><option value="night">Nocturno/a</option><option value="flexible">Flexible</option></select></div>
  </div>
  <h3 style="margin-top:18px">Tus intereses</h3><p class="note">Elige entre 3 y 10. Se usan para mostrar compatibilidad, sin revelar información sensible.</p><div id="profileInterestPicker" class="interestpicker"></div>
  <div class="profilequality" style="margin-top:18px"><b>Calidad del perfil: <span id="profileQualityText">0%</span></b><div class="qualitybar"><span id="profileQualityBar"></span></div></div>
  <button class="btn primary" style="margin-top:14px" onclick="saveExtendedProfile()">Guardar detalles</button><div id="profileDetailsStatus" class="status"></div>`;
  sec.appendChild(card);
}

function injectOnboardingInterests(){
  const card=document.querySelector('#onboarding .card');if(!card||$('obInterestPicker'))return;
  const wrap=document.createElement('div');wrap.className='field';wrap.innerHTML='<label>Intereses</label><p class="note">Elige al menos 3 intereses para ayudarte a encontrar personas compatibles.</p><div id="obInterestPicker" class="interestpicker"></div>';
  const btn=card.querySelector('button[onclick="finishOnboarding()"]');card.insertBefore(wrap,btn);
}

async function loadExtendedProfile(){
  if(!session)return;
  try{
    await loadInterestCatalog();injectProfileDetailsUI();injectOnboardingInterests();
    const {data,error}=await sb.rpc('get_my_profile_editor');if(error)throw error;const p=data?.[0];if(!p)return;
    if($('pGenderIdentity'))$('pGenderIdentity').value=p.gender_identity||'';
    if($('pOrientation'))$('pOrientation').value=p.sexual_orientation||'';
    if($('pCompany'))$('pCompany').value=p.company||'';
    if($('pZodiac'))$('pZodiac').value=p.zodiac_sign||'';
    if($('pExercise'))$('pExercise').value=p.exercise||'';
    if($('pSmoking'))$('pSmoking').value=p.smoking||'';
    if($('pAlcohol'))$('pAlcohol').value=p.alcohol||'';
    if($('pPets'))$('pPets').value=p.pets||'';
    if($('pChildren'))$('pChildren').value=p.children||'';
    if($('pWantsChildren'))$('pWantsChildren').value=p.wants_children||'';
    if($('pLanguages'))$('pLanguages').value=(p.languages||['es']).join(', ');
    if($('pSleep'))$('pSleep').value=p.sleep_habits||'';
    renderInterestPicker($('profileInterestPicker'),p.interest_ids||[]);
    if($('obInterestPicker'))renderInterestPicker($('obInterestPicker'),p.interest_ids||[]);
    const q=Number(p.profile_quality_score||0);if($('profileQualityText'))$('profileQualityText').textContent=q+'%';if($('profileQualityBar'))$('profileQualityBar').style.width=q+'%';
  }catch(e){if($('profileDetailsStatus'))setStatus('profileDetailsStatus',e.message)}
}

async function saveExtendedProfile(){
  const ids=selectedInterestIds('profileInterestPicker');if(ids.length<3)return setStatus('profileDetailsStatus','Elige al menos 3 intereses.');
  const langs=($('pLanguages')?.value||'es').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,5);
  const upd={gender_identity:$('pGenderIdentity').value.trim()||null,sexual_orientation:$('pOrientation').value.trim()||null,company:$('pCompany').value.trim()||null,zodiac_sign:$('pZodiac').value||null,exercise:$('pExercise').value||null,smoking:$('pSmoking').value||null,alcohol:$('pAlcohol').value||null,pets:$('pPets').value||null,children:$('pChildren').value||null,wants_children:$('pWantsChildren').value||null,languages:langs.length?langs:['es'],sleep_habits:$('pSleep').value||null};
  const a=await sb.from('profiles').update(upd).eq('id',session.user.id);if(a.error)return setStatus('profileDetailsStatus',a.error.message);
  const b=await sb.rpc('set_my_interests',{p_interest_ids:ids});if(b.error)return setStatus('profileDetailsStatus',b.error.message);
  await sb.rpc('refresh_my_profile_quality');setStatus('profileDetailsStatus','Detalles e intereses guardados.',true);await loadExtendedProfile();loadDiscovery();
}

const p16LoadProfileForm=loadProfileForm;
loadProfileForm=async function(){await p16LoadProfileForm();await loadExtendedProfile()};

const p16FinishOnboarding=finishOnboarding;
finishOnboarding=async function(){
  await loadInterestCatalog();injectOnboardingInterests();
  const ids=selectedInterestIds('obInterestPicker');
  if(ids.length<3)return setStatus('obStatus','Selecciona al menos 3 intereses.');
  const name=$('obName').value.trim();if(name.length<2)return setStatus('obStatus','Escribe tu nombre.');
  const genders=[...document.querySelectorAll('#obGenders .chip.on')].map(x=>x.dataset.v);if(!genders.length)return setStatus('obStatus','Selecciona al menos una preferencia.');
  const upd={display_name:name,city:$('obCity').value,gender:$('obGender').value,relationship_goal:$('obGoal').value,bio:$('obBio').value.trim(),onboarding_complete:true,last_active_at:new Date().toISOString()};
  const {error}=await sb.from('profiles').update(upd).eq('id',session.user.id);if(error)return setStatus('obStatus',error.message);
  const p=await sb.from('preferences').upsert({user_id:session.user.id,genders,min_age:18,max_age:45,max_distance_km:30});if(p.error)return setStatus('obStatus',p.error.message);
  const i=await sb.rpc('set_my_interests',{p_interest_ids:ids});if(i.error)return setStatus('obStatus',i.error.message);
  await sb.from('profile_visibility').upsert({user_id:session.user.id});await sb.rpc('refresh_my_profile_quality');boot();
};

setTimeout(async()=>{try{await loadInterestCatalog();injectProfileDetailsUI();injectOnboardingInterests();if(session)await loadExtendedProfile()}catch(e){console.error(e)}},900);

if(!document.querySelector('script[data-tjs-phase17]')){
  const phase17Script=document.createElement('script');
  phase17Script.src='phase17.js?v=1';
  phase17Script.defer=true;
  phase17Script.dataset.tjsPhase17='1';
  document.body.appendChild(phase17Script);
}
