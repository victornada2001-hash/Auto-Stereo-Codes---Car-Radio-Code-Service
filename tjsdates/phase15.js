async function getPhotoState(){
  const {data,error}=await sb.from('profile_photos').select('id,position,is_primary,storage_path').eq('user_id',session.user.id).order('position');
  if(error)throw error;return data||[];
}

setPrimary=async function(id){
  const {error}=await sb.rpc('set_my_primary_photo',{photo_uuid:id});
  if(error)return toast(error.message);
  toast('Foto principal actualizada.');loadPhotos();
};

movePhoto=async function(id,dir){
  const {error}=await sb.rpc('move_my_profile_photo',{photo_uuid:id,direction:Number(dir)});
  if(error)return toast(error.message);
  loadPhotos();
};

deletePhoto=async function(id,_path){
  if(!confirm('¿Eliminar esta foto?'))return;
  const {data:path,error}=await sb.rpc('delete_my_profile_photo',{photo_uuid:id});
  if(error)return toast(error.message);
  if(path){const rm=await sb.storage.from('profile-photos').remove([path]);if(rm.error)console.warn('No se pudo limpiar el archivo de Storage',rm.error)}
  toast('Foto eliminada.');loadPhotos();
};

uploadPhotos=async function(files){
  if(!session||!files?.length)return;
  let current;
  try{current=await getPhotoState()}catch(e){return setStatus('photoStatus',e.message)}
  const remaining=Math.max(0,9-current.length),arr=[...files].slice(0,remaining);
  if(!arr.length)return setStatus('photoStatus','Máximo 9 fotos.');
  setStatus('photoStatus','Procesando fotos...',true);
  let uploaded=0;
  for(const f of arr){
    let path=null;
    try{
      if(f.size>10*1024*1024)throw new Error(`${f.name}: máximo 10 MB`);
      if(!['image/jpeg','image/png','image/webp'].includes(f.type))throw new Error(`${f.name}: formato no compatible`);
      const blob=await compressImage(f);
      path=`${session.user.id}/${crypto.randomUUID()}.webp`;
      const up=await sb.storage.from('profile-photos').upload(path,blob,{contentType:'image/webp',upsert:false});if(up.error)throw up.error;
      const reg=await sb.rpc('register_my_profile_photo',{p_storage_path:path});
      if(reg.error)throw reg.error;
      uploaded++;
    }catch(e){
      if(path)await sb.storage.from('profile-photos').remove([path]).catch(()=>{});
      setStatus('photoStatus',e.message);break;
    }
  }
  if(uploaded)setStatus('photoStatus',`${uploaded} foto${uploaded===1?'':'s'} subida${uploaded===1?'':'s'}. Pendiente${uploaded===1?'':'s'} de moderación.`,true);
  loadPhotos();
};

setTimeout(()=>{
  const note=document.querySelector('#page-photos .uploadbox .note');
  if(note)note.textContent='JPEG, PNG o WebP · máximo 10 MB por archivo. Las fotos nuevas pasan por moderación.';
},700);

if(!document.querySelector('script[data-tjs-phase16]')){
  const phase16Script=document.createElement('script');
  phase16Script.src='phase16.js?v=1';
  phase16Script.defer=true;
  phase16Script.dataset.tjsPhase16='1';
  document.body.appendChild(phase16Script);
}
