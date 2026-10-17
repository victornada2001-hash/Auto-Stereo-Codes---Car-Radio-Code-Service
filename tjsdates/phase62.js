// Phase 62: restore the user's latest Rewind state from the server after reloads.
let p62RefreshTimer=null;
async function p62RefreshRewindState(){
  if(!session)return;
  clearTimeout(p62RefreshTimer);
  try{
    const {data,error}=await sb.rpc('get_my_rewind_state');
    if(error)throw error;
    const s=data||{};
    if(s.target_user&&s.decision_type){
      lastAction={type:s.decision_type,id:s.target_user,matched:s.reason==='match_created',rewind_reason:s.reason||'ready',decided_at:s.decided_at||null,server:true};
    }else{
      lastAction=null;
    }
    if(currentPlan&&Number.isFinite(Number(s.plan_rank)))currentPlan.plan_rank=Number(s.plan_rank);
    if(typeof p61SyncRewind==='function')p61SyncRewind();
  }catch(_e){
    if(typeof p61SyncRewind==='function')p61SyncRewind();
  }
}
function p62Schedule(ms=120){clearTimeout(p62RefreshTimer);p62RefreshTimer=setTimeout(()=>p62RefreshRewindState(),ms)}
const p62Boot=typeof boot==='function'?boot:null;if(p62Boot)boot=async function(...args){const r=await p62Boot.apply(this,args);p62Schedule(160);return r};
const p62Go=typeof go==='function'?go:null;if(p62Go)go=function(page){p62Go(page);if(page==='discover')p62Schedule(80)};
const p62Undo=typeof undoLast==='function'?undoLast:null;if(p62Undo)undoLast=async function(...args){const r=await p62Undo.apply(this,args);p62Schedule(80);return r};
const p62Like=typeof likeCurrent==='function'?likeCurrent:null;if(p62Like)likeCurrent=async function(...args){const r=await p62Like.apply(this,args);p62Schedule(250);return r};
const p62Pass=typeof passCurrent==='function'?passCurrent:null;if(p62Pass)passCurrent=async function(...args){const r=await p62Pass.apply(this,args);p62Schedule(250);return r};
const p62Super=typeof superLikeCurrent==='function'?superLikeCurrent:null;if(p62Super)superLikeCurrent=async function(...args){const r=await p62Super.apply(this,args);p62Schedule(250);return r};
setTimeout(()=>{if(session)p62RefreshRewindState()},900);
(()=>{if(!document.querySelector('script[data-tjs-phase63]')){const s=document.createElement('script');s.src='/phase63.js?v=1';s.dataset.tjsPhase63='1';document.body.appendChild(s)}})();
