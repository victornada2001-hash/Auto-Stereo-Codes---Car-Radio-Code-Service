// Phase 60: safe Rewind backed by server validation.
function p60Msg(err){
  const m=String(err?.message||err||'');
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  const pairs=[
    ['rewind_requires_plus',en?'Rewind requires TJ Plus or higher.':'Rewind requiere TJ Plus o superior.'],
    ['nothing_to_rewind',en?'There is no recent action to undo.':'No hay una acción reciente para deshacer.'],
    ['not_latest_decision',en?'Only your most recent decision can be undone.':'Solo puedes deshacer tu decisión más reciente.'],
    ['rewind_expired',en?'That Rewind window has expired.':'La ventana para deshacer esa acción ya expiró.'],
    ['match_already_created',en?'A Like that already created a Match cannot be undone.':'No se puede deshacer un Like que ya creó un Match.'],
    ['invalid_target',en?'That profile is no longer available.':'Ese perfil ya no está disponible.']
  ];
  for(const [k,v] of pairs)if(m.includes(k))return v;
  return err?.message||(en?'Rewind could not be completed.':'No se pudo completar Rewind.');
}

async function p60RestoreProfile(id){
  await loadDiscovery();
  const idx=(typeof candidates!=='undefined'?candidates:[]).findIndex(x=>x.id===id);
  if(idx>0){const [restored]=candidates.splice(idx,1);candidates.unshift(restored);candidateIndex=0;renderDeck();}
  else if(idx===0){candidateIndex=0;renderDeck();}
}

undoLast=async function(){
  if(typeof p59Pulse==='function')p59Pulse('rewind');
  const run=async()=>{
    if(!lastAction)return toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'There is no recent action to undo.':'No hay una acción reciente para deshacer.');
    if(lastAction.matched)return toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'A Like that already created a Match cannot be undone.':'No se puede deshacer un Like que ya creó un Match.');
    const saved={...lastAction};
    const {data,error}=await sb.rpc('undo_last_profile_decision',{target_user:saved.id,decision_type:saved.type});
    if(error)return toast(p60Msg(error));
    if(data===false)return toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Nothing changed.':'No hubo cambios.');
    lastAction=null;
    await p60RestoreProfile(saved.id);
    toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Last decision undone.':'Última acción deshecha.');
  };
  if(typeof tjs47Run==='function')return tjs47Run('profile-decision',run,{busyMessage:true});
  return run();
};
