// Phase 36: secure discovery filters and profile visibility through server RPCs.

function p36FilterError(err){
  const m=String(err?.message||err||'');
  if(m.includes('invalid_age_range'))return 'Revisa el rango de edad.';
  if(m.includes('invalid_distance'))return 'Selecciona una distancia válida.';
  if(m.includes('invalid_preferences'))return 'Selecciona al menos un género válido.';
  if(m.includes('invalid_goal'))return 'Selecciona objetivos válidos.';
  if(m.includes('unauthenticated'))return 'Tu sesión terminó. Inicia sesión nuevamente.';
  return typeof phase35FriendlyError==='function'?phase35FriendlyError(err):(err?.message||'No se pudieron guardar los filtros.');
}

async function currentPreferencePayload(){
  const {data,error}=await sb.from('preferences').select('min_age,max_age,max_distance_km,genders,goals,verified_only').eq('user_id',session.user.id).maybeSingle();
  if(error)throw error;
  return data||{min_age:18,max_age:45,max_distance_km:30,genders:['woman','man'],goals:[],verified_only:false};
}

saveFilters=async function(){
  if(!session)return setStatus('filterStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  const min=Number($('fMinAge')?.value),max=Number($('fMaxAge')?.value);
  const genders=[...document.querySelectorAll('#fGenders .chip.on')].map(x=>x.dataset.v);
  if(!Number.isInteger(min)||!Number.isInteger(max)||min<18||max<min||max>100)return setStatus('filterStatus','Revisa el rango de edad.');
  if(!genders.length)return setStatus('filterStatus','Selecciona al menos una preferencia.');
  const btn=document.querySelector('#page-filters button[onclick="saveFilters()"]');if(btn)btn.disabled=true;
  try{
    const old=await currentPreferencePayload();
    const {error}=await sb.rpc('update_my_preferences',{
      p_min_age:min,p_max_age:max,p_max_distance_km:Number($('fDistance')?.value||30),p_genders:genders,
      p_goals:old.goals||[],p_verified_only:!!old.verified_only
    });
    if(error)throw error;
    setStatus('filterStatus','Filtros guardados.',true);
    await loadFilters();
    await loadDiscovery();
  }catch(e){setStatus('filterStatus',p36FilterError(e));}
  finally{if(btn)btn.disabled=false;}
};

saveAdvancedFilters=async function(){
  if(!session)return setStatus('advancedFilterStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  const goals=[...document.querySelectorAll('#fGoals .chip.on')].map(x=>x.dataset.v);
  const btn=document.querySelector('#advancedFiltersCard button[onclick="saveAdvancedFilters()"]');if(btn)btn.disabled=true;
  try{
    const old=await currentPreferencePayload();
    const {error}=await sb.rpc('update_my_preferences',{
      p_min_age:Number(old.min_age||18),p_max_age:Number(old.max_age||45),p_max_distance_km:Number(old.max_distance_km||30),
      p_genders:old.genders?.length?old.genders:['woman','man'],p_goals:goals,p_verified_only:!!$('fVerifiedOnly')?.checked
    });
    if(error)throw error;
    setStatus('advancedFilterStatus','Filtros avanzados guardados.',true);
    await loadAdvancedFilters();
    await loadDiscovery();
  }catch(e){setStatus('advancedFilterStatus',p36FilterError(e));}
  finally{if(btn)btn.disabled=false;}
};

// Generic helper for any current/future Privacy UI. Direct writes to profile_visibility
// are revoked; this keeps all changes validated and scoped to auth.uid().
async function saveMyVisibilitySettings(values={}){
  if(!session)throw new Error('unauthenticated');
  const {data,error}=await sb.from('profile_visibility').select('*').eq('user_id',session.user.id).maybeSingle();
  if(error)throw error;
  const v={show_age:true,show_distance:true,show_orientation:false,show_gender:true,show_work:true,show_school:true,show_recent_activity:true,discoverable:true,invisible_mode:false,...(data||{}),...values};
  const r=await sb.rpc('update_my_visibility',{
    p_show_age:!!v.show_age,p_show_distance:!!v.show_distance,p_show_orientation:!!v.show_orientation,p_show_gender:!!v.show_gender,
    p_show_work:!!v.show_work,p_show_school:!!v.show_school,p_show_recent_activity:!!v.show_recent_activity,p_discoverable:!!v.discoverable,p_invisible_mode:!!v.invisible_mode
  });
  if(r.error)throw r.error;
  return true;
}
