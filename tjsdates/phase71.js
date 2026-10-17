// Phase 71: secure report evidence registration through server RPC.
function p71Text(es,en){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?en:es}

uploadReportEvidence=async function(reportId){
  let uploaded=0;
  for(const file of pendingReportFiles||[]){
    if(file.size>10*1024*1024)throw new Error(`${file.name}: ${p71Text('supera 10 MB','exceeds 10 MB')}`);
    const isPdf=file.type==='application/pdf';
    if(!isPdf&&!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error(`${file.name}: ${p71Text('formato no permitido','unsupported format')}`);
    const body=isPdf?file:await compressImage(file);
    const ext=isPdf?'pdf':'webp';
    const path=`${session.user.id}/${reportId}/${crypto.randomUUID()}.${ext}`;
    const up=await sb.storage.from('report-evidence').upload(path,body,{contentType:isPdf?'application/pdf':'image/webp',upsert:false});
    if(up.error)throw up.error;
    try{
      const {error}=await sb.rpc('register_report_evidence',{report_uuid:reportId,p_storage_path:path});
      if(error)throw error;
      uploaded++;
    }catch(e){
      await sb.storage.from('report-evidence').remove([path]).catch(()=>{});
      throw e;
    }
  }
  return uploaded;
};
uploadReportEvidence.__tjsSecure=true;
window.__TJSDATES_REPORT_EVIDENCE_RPC_READY=true;
