// Phase 72: save all discovery preferences through the hardened RPC.
function p72Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}
function p72Goals(){return [...document.querySelectorAll('#fGoals .chip.on')].map(x=>x.dataset.v)}
function p72Genders(){return [...document.querySelectorAll('#fGenders .chip.on')].map(x=>x.dataset.v)}
async function p72Current(){
  const {data,error}=await sb.from('preferences').select('min_age,max_age,max_distance_km,genders,goals,verified_only').eq('user_id',session.user.id).maybeSingle();
  if(error)throw error;
  return data||{min_age:18,max_age:45,max_distance_km:30,genders:['woman','man'],goals:[],verified_only:false};
}
async function p72SaveAll(overrides={}){
  const cur=await p72Current();
  const args={
    p_min_age:Number(overrides.min_age??cur.min_age??18),
    p_max_age:Number(overrides.max_age??cur.max_age??45),
    p_max_distance_km:Number(overrides.max_distance_km??cur.max_distance_km??30),
    p_genders:overrides.genders??cur.genders??[],
    p_goals:overrides.goals??cur.goals??[],
    p_verified_only:Boolean(overrides.verified_only??cur.verified_only??false)
  };
  const {error}=await sb.rpc('update_my_preferences',args);if(error)throw error;
}

saveFilters=async function(){
  if(!session)return;
  const min=Number($('fMinAge')?.value),max=Number($('fMaxAge')?.value),distance=Number($('fDistance')?.value),genders=p72Genders();
  if(min<18||max<min||max>100)return setStatus('filterStatus',p72Text('Revisa el rango de edad.','Check the age range.'));
  if(!genders.length)return setStatus('filterStatus',p72Text('Selecciona al menos un género.','Select at least one gender.'));
  try{
    await p72SaveAll({min_age:min,max_age:max,max_distance_km:distance,genders});
    setStatus('filterStatus',p72Text('Filtros guardados.','Filters saved.'),true);
    if(typeof loadDiscovery==='function')await loadDiscovery();
  }catch(e){setStatus('filterStatus',e?.message||p72Text('No se pudieron guardar los filtros.','Could not save filters.'));}
};
saveFilters.__tjsSecure=true;

saveAdvancedFilters=async function(){
  if(!session)return;
  try{
    await p72SaveAll({goals:p72Goals(),verified_only:!!$('fVerifiedOnly')?.checked});
    setStatus('advancedFilterStatus',p72Text('Filtros avanzados guardados.','Advanced filters saved.'),true);
    if(typeof loadDiscovery==='function')await loadDiscovery();
  }catch(e){setStatus('advancedFilterStatus',e?.message||p72Text('No se pudieron guardar los filtros.','Could not save filters.'));}
};
saveAdvancedFilters.__tjsSecure=true;
window.__TJSDATES_FILTER_RPC_READY=true;

if(!document.querySelector('script[data-tjs-phase73]')){
  const s=document.createElement('script');s.src='phase73.js?v=1';s.defer=true;s.dataset.tjsPhase73='1';document.body.appendChild(s);
}
