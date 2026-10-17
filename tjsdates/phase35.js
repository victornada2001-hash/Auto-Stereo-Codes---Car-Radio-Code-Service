// Phase 35: secure profile editing/onboarding through server RPCs.

function phase35FriendlyError(err){
  const m=String(err?.message||err||'');
  const map={
    invalid_display_name:'Escribe un nombre válido de 2 a 40 caracteres.',
    invalid_city:'Selecciona Tijuana o San Diego.',
    invalid_height:'La altura debe estar entre 100 y 250 cm.',
    field_too_long:'Uno de los campos supera el tamaño permitido.',
    invalid_interest_count:'Selecciona entre 3 y 10 intereses.',
    invalid_preferences:'Selecciona al menos una preferencia válida.',
    invalid_goal:'Selecciona un objetivo válido.',
    invalid_gender:'Selecciona un género válido.',
    profile_unavailable:'Tu perfil no está disponible para editarse en este momento.',
    unauthenticated:'Tu sesión terminó. Inicia sesión nuevamente.'
  };
  for(const [k,v] of Object.entries(map))if(m.includes(k))return v;
  return typeof phase21FriendlyError==='function'?phase21FriendlyError(err):(err?.message||'No se pudo guardar la información.');
}

saveProfile=async function(){
  if(!session)return toast('Inicia sesión nuevamente.');
  const name=$('pName')?.value.trim()||'';
  const city=$('pCity')?.value||'';
  const heightRaw=$('pHeight')?.value||'';
  const height=heightRaw===''?null:Number(heightRaw);
  const btn=document.querySelector('#page-profile button[onclick="saveProfile()"]');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('update_my_profile_basic',{
      p_display_name:name,
      p_city:city,
      p_pronouns:$('pPronouns')?.value.trim()||null,
      p_occupation:$('pOccupation')?.value.trim()||null,
      p_school:$('pSchool')?.value.trim()||null,
      p_height_cm:Number.isFinite(height)?height:null,
      p_bio:$('pBio')?.value.trim()||null
    });
    if(error)throw error;
    setStatus('profileStatus','Perfil guardado.',true);
    await loadProfileForm();
    if(typeof loadDiscovery==='function')loadDiscovery();
  }catch(e){setStatus('profileStatus',phase35FriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
};

saveExtendedProfile=async function(){
  if(!session)return;
  const ids=selectedInterestIds('profileInterestPicker');
  if(ids.length<3||ids.length>10)return setStatus('profileDetailsStatus','Selecciona entre 3 y 10 intereses.');
  const langs=($('pLanguages')?.value||'es').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,5);
  const btn=document.querySelector('#profileDetailsCard button[onclick="saveExtendedProfile()"]');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('update_my_profile_details',{
      p_gender_identity:$('pGenderIdentity')?.value.trim()||null,
      p_sexual_orientation:$('pOrientation')?.value.trim()||null,
      p_company:$('pCompany')?.value.trim()||null,
      p_zodiac_sign:$('pZodiac')?.value||null,
      p_exercise:$('pExercise')?.value||null,
      p_smoking:$('pSmoking')?.value||null,
      p_alcohol:$('pAlcohol')?.value||null,
      p_pets:$('pPets')?.value||null,
      p_children:$('pChildren')?.value||null,
      p_wants_children:$('pWantsChildren')?.value||null,
      p_languages:langs.length?langs:['es'],
      p_sleep_habits:$('pSleep')?.value||null,
      p_interest_ids:ids
    });
    if(error)throw error;
    setStatus('profileDetailsStatus','Detalles e intereses guardados.',true);
    await loadExtendedProfile();
    if(typeof loadDiscovery==='function')loadDiscovery();
  }catch(e){setStatus('profileDetailsStatus',phase35FriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
};

finishOnboarding=async function(){
  if(!session)return setStatus('obStatus','Tu sesión terminó. Inicia sesión nuevamente.');
  try{await loadInterestCatalog();injectOnboardingInterests();}catch(e){return setStatus('obStatus',phase35FriendlyError(e));}
  const ids=selectedInterestIds('obInterestPicker');
  const name=$('obName')?.value.trim()||'';
  const genders=[...document.querySelectorAll('#obGenders .chip.on')].map(x=>x.dataset.v);
  if(ids.length<3||ids.length>10)return setStatus('obStatus','Selecciona entre 3 y 10 intereses.');
  if(name.length<2||name.length>40)return setStatus('obStatus','Escribe un nombre válido.');
  if(!genders.length)return setStatus('obStatus','Selecciona al menos una preferencia.');
  const btn=document.querySelector('#onboarding button[onclick="finishOnboarding()"]');
  if(btn)btn.disabled=true;
  try{
    const {error}=await sb.rpc('complete_my_onboarding',{
      p_display_name:name,
      p_city:$('obCity')?.value||'Tijuana',
      p_gender:$('obGender')?.value||'other',
      p_relationship_goal:$('obGoal')?.value||'conocer personas',
      p_bio:$('obBio')?.value.trim()||null,
      p_genders:genders,
      p_interest_ids:ids
    });
    if(error)throw error;
    setStatus('obStatus','Perfil inicial guardado.',true);
    await boot();
  }catch(e){setStatus('obStatus',phase35FriendlyError(e));}
  finally{if(btn)btn.disabled=false;}
};

function syncAuthFieldRules(){
  const pass=$('authPass');
  if(pass){
    const signup=typeof authMode!=='undefined'&&authMode==='signup';
    pass.minLength=signup?10:8;
    pass.placeholder=signup?'10+ caracteres, mayúscula, minúscula y número':'Tu contraseña';
  }
  const birth=$('authBirth');
  if(birth){
    const now=new Date();
    const max=new Date(now.getFullYear()-18,now.getMonth(),now.getDate());
    birth.max=max.toISOString().slice(0,10);
  }
}

const p35AuthTab=authTab;
authTab=function(mode){p35AuthTab(mode);syncAuthFieldRules();};
window.addEventListener('pageshow',syncAuthFieldRules);
setTimeout(syncAuthFieldRules,500);
