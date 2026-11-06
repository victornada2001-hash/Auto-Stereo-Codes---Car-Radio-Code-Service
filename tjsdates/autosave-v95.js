/* TJSDATES 95: automatic saving of editable preferences, interests, profile and privacy. */
(function(){
  'use strict';
  if(window.__tjsAutoSave95)return;
  window.__tjsAutoSave95=true;
  const get=id=>document.getElementById(id);
  const isEN=()=>typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  const tr=(es,en)=>isEN()?en:es;
  const active=()=>!!(typeof session!=='undefined'&&session?.user?.id);
  const states=new Map();
  const label=(id,value,error=false)=>{
    const el=get(id);if(!el)return;
    el.setAttribute('role','status');el.setAttribute('aria-live','polite');
    el.textContent=value;el.classList.toggle('err',!!error);el.classList.toggle('ok',!error&&!!value);
  };
  const pending=id=>label(id,tr('Guardando automáticamente…','Saving automatically…'));
  const success=id=>label(id,tr('Guardado automáticamente ✓','Saved automatically ✓'));
  const failure=(id,e)=>label(id,tr('No se pudo guardar: ','Could not save: ')+(e?.message||String(e)),true);
  // Serialize each group to avoid overwriting newer preferences with an older request.
  function schedule(group,save,delay,statusId){
    let state=states.get(group);
    if(!state){state={timer:null,revision:0,work:Promise.resolve()};states.set(group,state)}
    state.revision++;
    const version=state.revision;
    clearTimeout(state.timer);
    pending(statusId);
    state.timer=setTimeout(()=>{
      state.work=state.work.catch(()=>{}).then(async()=>{
        if(version!==state.revision)return;
        if(!active()){if(version===state.revision)label(statusId,tr('Inicia sesión para guardar.','Sign in to save.'),true);return}
        try{
          await save();
          if(version===state.revision)success(statusId);
        }catch(err){
          if(version===state.revision)failure(statusId,err);
        }
      });
    },delay);
  }
  async function saveAllFilters(){
    if(typeof p72SaveAll!=='function')throw new Error(tr('Los filtros todavía están cargando.','Filters are still loading.'));
    const min=Number(get('fMinAge')?.value),max=Number(get('fMaxAge')?.value),distance=Number(get('fDistance')?.value);
    const genders=Array.from(document.querySelectorAll('#fGenders .chip.on'),x=>x.dataset.v);
    const goals=Array.from(document.querySelectorAll('#fGoals .chip.on'),x=>x.dataset.v);
    const verified=!!get('fVerifiedOnly')?.checked;
    if(!Number.isInteger(min)||!Number.isInteger(max)||min<18||max>99||max<min)throw new Error(tr('La edad debe estar entre 18 y 99 y el mínimo no debe superar el máximo.','Age must be 18 to 99, with minimum no higher than maximum.'));
    if(!genders.length)throw new Error(tr('Selecciona al menos un género.','Select at least one gender.'));
    if(!Number.isFinite(distance)||distance<1||distance>100)throw new Error(tr('Distancia no válida.','Invalid distance.'));
    await p72SaveAll({min_age:min,max_age:max,max_distance_km:distance,genders,goals,verified_only:verified});
  }
  const basicInputs=new Set(['pName','pCity','pPronouns','pOccupation','pSchool','pHeight','pBio']);
  async function saveBasicProfile(){
    const name=(get('pName')?.value||'').trim();
    if(name.length<2)throw new Error(tr('El nombre debe tener al menos 2 caracteres.','Name must contain at least 2 characters.'));
    const rawHeight=(get('pHeight')?.value||'').trim(),height=rawHeight?Number(rawHeight):null;
    if(rawHeight&&(!Number.isInteger(height)||height<100||height>250))throw new Error(tr('Altura válida: 100 a 250 cm.','Valid height: 100 to 250 cm.'));
    const data={display_name:name,city:get('pCity').value,pronouns:get('pPronouns').value.trim()||null,occupation:get('pOccupation').value.trim()||null,school:get('pSchool').value.trim()||null,height_cm:height,bio:get('pBio').value.trim(),last_active_at:new Date().toISOString()};
    const {data:rows,error}=await sb.from('profiles').update(data).eq('id',session.user.id).select('id');
    if(error)throw error;
    if(!rows?.length)throw new Error(tr('No se pudo confirmar el cambio.','Could not confirm the update.'));
    if(typeof profile!=='undefined')profile={...profile,...data};
  }
  const detailsInputs=new Set(['pGenderIdentity','pOrientation','pCompany','pZodiac','pExercise','pSmoking','pAlcohol','pPets','pChildren','pWantsChildren','pLanguages','pSleep']);
  async function saveExtraProfile(){
    const languages=(get('pLanguages')?.value||'es').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,5);
    const data={gender_identity:get('pGenderIdentity').value.trim()||null,sexual_orientation:get('pOrientation').value.trim()||null,company:get('pCompany').value.trim()||null,zodiac_sign:get('pZodiac').value||null,exercise:get('pExercise').value||null,smoking:get('pSmoking').value||null,alcohol:get('pAlcohol').value||null,pets:get('pPets').value||null,children:get('pChildren').value||null,wants_children:get('pWantsChildren').value||null,languages:languages.length?languages:['es'],sleep_habits:get('pSleep').value||null};
    const {data:rows,error}=await sb.from('profiles').update(data).eq('id',session.user.id).select('id');
    if(error)throw error;
    if(!rows?.length)throw new Error(tr('No se pudo confirmar el cambio.','Could not confirm the update.'));
    await sb.rpc('refresh_my_profile_quality').catch(()=>{});
  }
  async function saveInterests(){
    const ids=Array.from(document.querySelectorAll('#profileInterestPicker .interestpick.on'),x=>Number(x.dataset.id));
    if(ids.length<3||ids.length>10)throw new Error(tr('Elige entre 3 y 10 intereses.','Choose between 3 and 10 interests.'));
    const {error}=await sb.rpc('set_my_interests',{p_interest_ids:ids});
    if(error)throw error;
    await sb.rpc('refresh_my_profile_quality').catch(()=>{});
  }
  async function savePrivacy(){
    const args={p_is_paused:!!get('pvPaused')?.checked,p_show_age:!!get('pvAge')?.checked,p_show_distance:!!get('pvDistance')?.checked,p_show_orientation:!!get('pvOrientation')?.checked,p_show_gender:!!get('pvGender')?.checked,p_show_work:!!get('pvWork')?.checked,p_show_school:!!get('pvSchool')?.checked,p_show_recent_activity:!!get('pvRecent')?.checked,p_discoverable:!!get('pvDiscoverable')?.checked,p_invisible_mode:!!get('pvInvisible')?.checked};
    const {error}=await sb.rpc('update_my_privacy_settings',args);
    if(error)throw error;
    if(typeof profile!=='undefined')profile={...profile,is_paused:args.p_is_paused};
  }
  async function saveNotifications(){
    const {error}=await sb.rpc('update_my_notification_preferences',{
      p_new_matches:!!get('npMatches')?.checked,
      p_new_messages:!!get('npMessages')?.checked,
      p_new_likes:!!get('npLikes')?.checked,
      p_safety_alerts:!!get('npSafety')?.checked,
      p_marketing:!!get('npMarketing')?.checked
    });
    if(error)throw error;
  }
  const privacyIds=new Set(['pvPaused','pvDiscoverable','pvAge','pvDistance','pvGender','pvOrientation','pvWork','pvSchool','pvRecent','pvInvisible']);
  const notifyIds=new Set(['npMatches','npMessages','npLikes','npSafety','npMarketing']);
  const filterIds=new Set(['fMinAge','fMaxAge','fDistance','fVerifiedOnly']);
  function inputChanged(el,debounce=200){
    if(!el||!active())return;
    if(filterIds.has(el.id)){
      schedule('filters',saveAllFilters,debounce,'filterStatus');return;
    }
    if(basicInputs.has(el.id)){
      schedule('profile-basic',saveBasicProfile,debounce,'profileStatus');return;
    }
    if(detailsInputs.has(el.id)){
      schedule('profile-extra',saveExtraProfile,debounce,'profileDetailsStatus');return;
    }
    if(privacyIds.has(el.id)){schedule('privacy',savePrivacy,150,'privacyStatus');return}
    if(notifyIds.has(el.id)){schedule('notifications',saveNotifications,150,'notificationPrefsStatus');return}
  }
  document.addEventListener('input',e=>{
    const el=e.target;if(!el?.id)return;
    if((basicInputs.has(el.id)||detailsInputs.has(el.id)||el.id==='fMinAge'||el.id==='fMaxAge')&&(el.tagName==='INPUT'||el.tagName==='TEXTAREA')){
      inputChanged(el,800);
    }
  });
  document.addEventListener('change',e=>{
    const el=e.target;if(!el?.id)return;
    if(filterIds.has(el.id)||basicInputs.has(el.id)||detailsInputs.has(el.id)||privacyIds.has(el.id)||notifyIds.has(el.id))inputChanged(el,120);
  });
  document.addEventListener('click',e=>{
    const chip=e.target.closest('#fGenders .chip,#fGoals .chip,#profileInterestPicker .interestpick');
    if(!chip||!active())return;
    // Existing chip onclick first toggles the selection; debounce reads the final state.
    if(chip.closest('#profileInterestPicker')){
      schedule('interests',saveInterests,220,'profileDetailsStatus');
    }else{
      schedule('filters',saveAllFilters,220,chip.closest('#fGoals')?'advancedFilterStatus':'filterStatus');
    }
  });
  function removeSaveButtons(){
    for(const selector of [
      '#page-filters button[onclick^="saveFilters"]','#page-filters button[onclick^="saveAdvancedFilters"]',
      '#page-profile button[onclick^="saveProfile"]','#page-profile button[onclick^="saveExtendedProfile"]',
      '#page-privacy button[onclick^="savePrivacySettings"]',
      '#page-notifications button[onclick^="saveNotificationPreferences"]',
      '#saveNotificationPrefsBtn'
    ])document.querySelectorAll(selector).forEach(b=>b.remove());
    const controls=[['page-filters','filterStatus'],['page-profile','profileStatus'],['page-privacy','privacyStatus'],['page-notifications','notificationPrefsStatus']];
    for(const [page,status] of controls){
      const root=get(page),el=get(status);
      if(root&&el&&!root.querySelector('.t95-auto-note')){
        const note=document.createElement('p');note.className='note t95-auto-note';note.textContent=tr('Los cambios se guardan automáticamente.','Changes save automatically.');
        el.parentElement?.insertBefore(note,el);
      }
    }
  }
  removeSaveButtons();
  const observer=new MutationObserver(()=>removeSaveButtons());
  for(const id of ['page-filters','page-profile','page-privacy','page-notifications']){
    const root=get(id);if(root)observer.observe(root,{childList:true,subtree:true});
  }
})();