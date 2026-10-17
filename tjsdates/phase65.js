// Phase 65: secure profile-photo operations through RPCs and immutable Storage objects.
function p65PhotoError(err){
  const m=String(err?.message||err||'').toLowerCase();
  if(m.includes('account_restricted'))return 'Tu cuenta no puede modificar fotos en este momento.';
  if(m.includes('maximum 9'))return 'Puedes tener hasta 9 fotos.';
  if(m.includes('invalid photo mime'))return 'La imagen no tiene un formato permitido.';
  if(m.includes('invalid photo size'))return 'La imagen supera el tamaño permitido.';
  if(m.includes('invalid photo path'))return 'No se pudo validar el archivo de la foto.';
  if(m.includes('photo object not found'))return 'No se encontró el archivo subido.';
  if(m.includes('photo already registered'))return 'Esta foto ya fue registrada.';
  if(m.includes('photo not found'))return 'La foto ya no está disponible.';
  if(m.includes('row-level security')||m.includes('permission'))return 'No tienes permiso para modificar esa foto.';
  return err?.message||'No se pudo completar la acción con la foto.';
}
let p65PhotoBusy=false;

uploadPhotos=async function(files){
  if(!session||p65PhotoBusy)return;
  p65PhotoBusy=true;
  try{
    const {data:existing,error:countError}=await sb.from('profile_photos').select('id').eq('user_id',session.user.id);
    if(countError)throw countError;
    const remaining=Math.max(0,9-(existing||[]).length);
    const arr=[...(files||[])].slice(0,remaining);
    if(!arr.length)return setStatus('photoStatus','Máximo 9 fotos.');
    setStatus('photoStatus','Procesando fotos...',true);
    let uploaded=0,failedMessage='';
    for(const file of arr){
      let path='';
      try{
        if(!file||file.size>15*1024*1024)throw new Error('Archivo demasiado grande');
        if(file.type&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Formato de imagen no permitido');
        const blob=await compressImage(file);
        if(!blob||blob.size<=0||blob.size>10*1024*1024)throw new Error('La imagen procesada supera 10 MB');
        path=`${session.user.id}/${crypto.randomUUID()}.webp`;
        const up=await sb.storage.from('profile-photos').upload(path,blob,{contentType:'image/webp',upsert:false,cacheControl:'3600'});
        if(up.error)throw up.error;
        const reg=await sb.rpc('register_my_profile_photo',{p_storage_path:path});
        if(reg.error){
          await sb.storage.from('profile-photos').remove([path]).catch(()=>{});
          throw reg.error;
        }
        uploaded++;
      }catch(e){
        if(path){try{await sb.storage.from('profile-photos').remove([path])}catch(_e){}}
        failedMessage=p65PhotoError(e);
        break;
      }
    }
    if(failedMessage){
      const prefix=uploaded?`${uploaded} foto${uploaded===1?'':'s'} sí se subió${uploaded===1?'':'ron'}. `:'';
      setStatus('photoStatus',prefix+failedMessage);
    }else if(uploaded){
      setStatus('photoStatus',`${uploaded} foto${uploaded===1?'':'s'} subida${uploaded===1?'':'s'}. Queda${uploaded===1?'':'n'} pendiente${uploaded===1?'':'s'} de moderación.`,true);
    }
    await loadPhotos();
  }finally{
    p65PhotoBusy=false;
    const input=document.getElementById('photoInput');if(input)input.value='';
  }
};

setPrimary=async function(id){
  if(!session||p65PhotoBusy)return;
  p65PhotoBusy=true;
  try{
    const {error}=await sb.rpc('set_my_primary_photo',{photo_uuid:id});
    if(error)throw error;
    await loadPhotos();
  }catch(e){toast(p65PhotoError(e));}
  finally{p65PhotoBusy=false;}
};

movePhoto=async function(id,dir){
  if(!session||p65PhotoBusy||![-1,1].includes(Number(dir)))return;
  p65PhotoBusy=true;
  try{
    const {error}=await sb.rpc('move_my_profile_photo',{photo_uuid:id,direction:Number(dir)});
    if(error)throw error;
    await loadPhotos();
  }catch(e){toast(p65PhotoError(e));}
  finally{p65PhotoBusy=false;}
};

deletePhoto=async function(id,_untrustedPath){
  if(!session||p65PhotoBusy)return;
  if(!confirm('¿Eliminar esta foto?'))return;
  p65PhotoBusy=true;
  try{
    const {data:path,error}=await sb.rpc('delete_my_profile_photo',{photo_uuid:id});
    if(error)throw error;
    if(path){
      let rm=await sb.storage.from('profile-photos').remove([path]);
      if(rm.error)rm=await sb.storage.from('profile-photos').remove([path]);
      if(rm.error)toast('La foto se quitó del perfil, pero el archivo necesita limpieza automática.');
    }
    await loadPhotos();
  }catch(e){toast(p65PhotoError(e));}
  finally{p65PhotoBusy=false;}
};

setTimeout(()=>{
  const input=document.getElementById('photoInput');
  if(input)input.accept='image/jpeg,image/png,image/webp';
},300);

if(!document.querySelector('script[data-tjs-phase66]')){
  const s=document.createElement('script');
  s.src='phase66.js?v=1';
  s.defer=true;
  s.dataset.tjsPhase66='1';
  document.body.appendChild(s);
}
