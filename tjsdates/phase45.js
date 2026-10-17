// Phase 45: keep Premium honest until final pricing + Stripe checkout are connected.

const premiumFeatureCopy={
  es:{
    free:['25 Likes diarios','Chat con tus Matches'],
    plus:['Likes ampliados','Deshacer','Modo viaje','Privacidad avanzada'],
    gold:['Ver quién te dio Like','Boosts','Selección diaria','Likes destacados'],
    platinum:['Prioridad en Likes','Historial de Likes enviados','Prioridad en descubrimiento','Funciones premium avanzadas']
  },
  en:{
    free:['25 daily Likes','Chat with your Matches'],
    plus:['Expanded Likes','Rewind','Travel mode','Advanced privacy'],
    gold:['See who liked you','Boosts','Daily selection','Highlighted Likes'],
    platinum:['Priority Likes','Sent Like history','Discovery priority','Advanced premium features']
  }
};

function premiumPendingLabel(){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Pricing coming soon':'Precio próximamente';}
function premiumCurrentLabel(){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Current plan':'Plan actual';}
function premiumUnavailableLabel(){return typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Not available yet':'Aún no disponible';}

loadPremium=async function(){
  if(!session)return;
  await loadPlan();
  if($('currentPlan'))$('currentPlan').textContent=(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'Plan ':'Plan ')+(currentPlan.plan_name||'Gratis');
  const g=$('plansGrid');if(!g)return;
  const {data,error}=await sb.from('plans').select('id,name,rank,features,is_active').eq('is_active',true).order('rank');
  if(error){g.innerHTML=`<div class="card">${esc(error.message)}</div>`;return;}
  g.innerHTML='';
  const lang=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'en':'es';
  for(const p of data||[]){
    const d=document.createElement('div');d.className='card plancard '+(p.id===currentPlan.plan_id?'selected':'');
    const features=premiumFeatureCopy[lang][p.id]||Object.keys(p.features||{});
    const price=p.id==='free'?(lang==='en'?'Free':'Gratis'):premiumPendingLabel();
    const button=p.id===currentPlan.plan_id
      ?`<button class="btn" disabled>${premiumCurrentLabel()}</button>`
      :`<button class="btn" disabled title="${premiumUnavailableLabel()}">${premiumUnavailableLabel()}</button>`;
    d.innerHTML=`<div class="pill">${esc(p.name)}</div><div class="price">${esc(price)}</div><ul>${features.map(x=>`<li>✓ ${esc(x)}</li>`).join('')}</ul>${button}`;
    g.appendChild(d);
  }
  const extra=[...document.querySelectorAll('#page-premium .card')].find(c=>c.querySelector('h3')&&/Compras adicionales|Additional purchases/.test(c.querySelector('h3').textContent));
  if(extra){
    const p=extra.querySelector('.note');
    if(p)p.textContent=lang==='en'
      ?'Boosts, highlighted Likes and paid plans will only be enabled after final pricing is approved and Stripe confirms payments on the server.'
      :'Boosts, Likes destacados y planes de pago se habilitarán únicamente cuando definamos los precios finales y Stripe confirme los pagos en el servidor.';
  }
};

upgradePlan=function(){
  toast(typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'
    ?'Payments are not enabled yet. No charge will be made.'
    :'Los pagos todavía no están habilitados. No se realizará ningún cargo.');
};

const p45Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p45Apply)applyTjsLanguage=function(){p45Apply();if($('page-premium')&&!$('page-premium').classList.contains('hidden'))loadPremium();};

const p45Go=typeof go==='function'?go:null;
if(p45Go)go=function(page){p45Go(page);if(page==='premium')setTimeout(loadPremium,60);};

setTimeout(()=>{if($('page-premium')&&!$('page-premium').classList.contains('hidden'))loadPremium();},300);
