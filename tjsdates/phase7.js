let activeExploreSlug=null;

function injectPhaseSevenStyles(){
  if(document.getElementById('phase7Styles'))return;
  const s=document.createElement('style');s.id='phase7Styles';s.textContent=`
  .featuregrid,.exploregrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.explorecat{cursor:pointer;transition:.18s transform,.18s border-color;min-height:130px}.explorecat:hover{transform:translateY(-2px);border-color:#ff5a9a}.explorecat .emoji{font-size:32px}.explorepeople{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.exploreperson{overflow:hidden;padding:0}.exploreperson .pic{height:230px;background:#21162e}.exploreperson .pic img{width:100%;height:100%;object-fit:cover}.exploreperson .pad{padding:13px}.planform{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:10px}.plancard{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.plancard .meta{font-size:13px;color:var(--muted);margin-top:6px}.doublebox{max-width:760px}.invitecode{font-size:28px;font-weight:900;letter-spacing:5px;padding:14px 18px;border-radius:16px;background:#120d1a;border:1px dashed #ff5a9a;text-align:center;margin:12px 0}.quickExplore{white-space:nowrap}@media(max-width:900px){.featuregrid,.exploregrid,.explorepeople{grid-template-columns:repeat(2,minmax(0,1fr))}.planform{grid-template-columns:1fr 1fr}.exploreperson .pic{height:210px}}@media(max-width:620px){.featuregrid,.exploregrid,.explorepeople{grid-template-columns:1fr 1fr;gap:9px}.explorecat{min-height:110px;padding:12px}.explorecat h3{font-size:16px}.exploreperson .pic{height:180px}.planform{grid-template-columns:1fr}.plancard{display:block}.quickExplore{width:100%;margin-top:8px}}
  `;document.head.appendChild(s);
}

function injectPhaseSevenUI(){
  injectPhaseSevenStyles();
  const main=document.querySelector('main.content');if(!main)return;
  const side=document.querySelector('aside.side');
  if(side&&!document.querySelector('[data-page="explore"]')){
    const before=side.querySelector('[data-page="premium"]');
    const a=document.createElement('button');a.className='navbtn';a.dataset.page='explore';a.onclick=()=>go('explore');a.innerHTML='✨ Explorar';side.insertBefore(a,before);
    const b=document.createElement('button');b.className='navbtn';b.dataset.page='plans';b.onclick=()=>go('plans');b.innerHTML='🎉 Planes TJ';side.insertBefore(b,before);
    const c=document.createElement('button');c.className='navbtn';c.dataset.page='double';c.onclick=()=>go('double');c.innerHTML='👥 Double Date';side.insertBefore(c,before);
  }
  const discover=$('page-discover');if(discover&&!$('quickExplore')){
    const h=discover.querySelector('.sectionhead');const btn=document.createElement('button');btn.id='quickExplore';btn.className='btn primary quickExplore';btn.textContent='✨ Explorar';btn.onclick=()=>go('explore');h?.appendChild(btn);
  }
  if(!$('page-explore')){
    const sec=document.createElement('section');sec.id='page-explore';sec.className='hidden';sec.innerHTML=`<div class="sectionhead"><div><div class="pill">Descubre por vibra</div><h2>Explorar</h2></div><button class="btn ghost" onclick="loadExploreCategories()">Actualizar</button></div><div id="exploreCategories" class="exploregrid"></div><div id="exploreResultsWrap" class="hidden" style="margin-top:18px"><div class="sectionhead"><div><div id="exploreResultPill" class="pill">Categoría</div><h2 id="exploreResultTitle">Perfiles</h2></div><button class="btn ghost" onclick="showExploreCategories()">← Categorías</button></div><div id="explorePeople" class="explorepeople"></div><div id="exploreStatus" class="status"></div></div>`;main.appendChild(sec);
  }
  if(!$('page-plans')){
    const sec=document.createElement('section');sec.id='page-plans';sec.className='hidden';sec.innerHTML=`<div class="sectionhead"><div><div class="pill">Sal de la pantalla</div><h2>Planes TJ</h2></div><button class="btn ghost" onclick="loadPlansTJ()">Actualizar</button></div><div class="card"><h3>Crear un plan</h3><p class="note">Propón una actividad pública para conocer personas. No publiques domicilios particulares.</p><div class="planform"><input id="planTitle" maxlength="100" placeholder="Ej. Café en Zona Río"><select id="planCity"><option>Tijuana</option><option>San Diego</option></select><input id="planWhen" type="datetime-local"><input id="planMax" type="number" min="2" max="30" value="8" title="Máximo de personas"></div><div class="field"><textarea id="planDesc" maxlength="500" placeholder="Describe el plan, punto público de encuentro y detalles"></textarea></div><button class="btn primary" onclick="createPlanTJ()">Crear plan</button><div id="planCreateStatus" class="status"></div></div><div id="plansList" class="stack" style="margin-top:14px"></div>`;main.appendChild(sec);
  }
  if(!$('page-double')){
    const sec=document.createElement('section');sec.id='page-double';sec.className='hidden';sec.innerHTML=`<div class="sectionhead"><div><div class="pill">Conexiones en pareja</div><h2>Double Date TJ</h2></div></div><div class="card doublebox"><h3>Forma tu pareja para Double Date</h3><p class="note">Genera un código temporal y compártelo únicamente con la persona que será tu compañero/a. El código vence automáticamente.</p><div id="doubleStatusBox"></div><div class="row"><button class="btn primary" onclick="createDoubleInvite()">Generar código</button><button class="btn ghost" onclick="loadDoubleDate()">Actualizar estado</button></div><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h3>¿Te enviaron un código?</h3><div class="row"><input id="doubleCode" maxlength="8" placeholder="Código de 8 caracteres" style="text-transform:uppercase;max-width:260px"><button class="btn primary" onclick="acceptDoubleInvite()">Unirme</button></div><div id="doubleStatus" class="status"></div></div>`;main.appendChild(sec);
  }
}

const exploreIcons={'serio':'💍','amistades':'🤝','esta-noche':'🌙','foodies':'🍜','viajeros':'✈️','gym':'🏋️','musica':'🎵','gamer':'🎮','mascotas':'🐾','universitarios':'🎓','verificados':'✓','recien-llegados':'✨','activos':'⚡'};

async function loadExploreCategories(){
  if(!session)return;const box=$('exploreCategories');if(!box)return;box.innerHTML='<div class="note">Cargando...</div>';
  const {data,error}=await sb.from('explore_categories').select('slug,name_es,description_es').eq('is_active',true).order('sort_order');
  if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  box.innerHTML='';for(const c of data||[]){const el=document.createElement('div');el.className='card explorecat';el.onclick=()=>loadExploreCategory(c.slug,c.name_es);el.innerHTML=`<div class="emoji">${exploreIcons[c.slug]||'✨'}</div><h3>${esc(c.name_es)}</h3><p class="note">${esc(c.description_es||exploreDescription(c.slug))}</p>`;box.appendChild(el)}
  $('exploreResultsWrap')?.classList.add('hidden');box.classList.remove('hidden');
}
function exploreDescription(slug){return ({'serio':'Personas buscando una relación con intención.','amistades':'Conoce gente nueva sin presión.','esta-noche':'Perfiles con intereses de vida nocturna.','foodies':'Restaurantes, café y cocina.','viajeros':'Viajes, playa y aventura.','gym':'Personas con interés en gimnasio.','musica':'Música, conciertos y baile.','gamer':'Videojuegos y tecnología.','mascotas':'Personas que aman a los animales.','universitarios':'Perfiles con escuela o universidad.','verificados':'Perfiles aprobados por moderación.','recien-llegados':'Personas nuevas en TJSDATES.','activos':'Actividad reciente.'}[slug]||'Descubre perfiles con algo en común.')}
function showExploreCategories(){$('exploreCategories')?.classList.remove('hidden');$('exploreResultsWrap')?.classList.add('hidden')}

async function loadExploreCategory(slug,name){
  activeExploreSlug=slug;$('exploreCategories')?.classList.add('hidden');$('exploreResultsWrap')?.classList.remove('hidden');$('exploreResultPill').textContent='Explorar';$('exploreResultTitle').textContent=name||'Perfiles';const box=$('explorePeople');box.innerHTML='<div class="note">Buscando perfiles...</div>';
  const {data,error}=await sb.rpc('get_explore_candidates',{category_slug:slug,candidate_limit:30});if(error){box.innerHTML='';return setStatus('exploreStatus',error.message)}
  const rows=data||[],photos=await loadCandidatePhotos(rows.map(x=>x.id));box.innerHTML='';
  for(const p of rows){const el=document.createElement('div');el.className='card exploreperson';el.innerHTML=`<div class="pic">${photos[p.id]?`<img src="${photos[p.id]}" alt="${esc(p.display_name||'Perfil')}">`:''}</div><div class="pad"><div class="row" style="justify-content:space-between"><h3>${esc(p.display_name||'Usuario')}${p.age?' · '+p.age:''}</h3>${p.is_verified?'<span class="pill">✓</span>':''}</div><p class="note">${p.approximate_distance_km?`~${p.approximate_distance_km} km · `:''}${esc(p.city||'')}</p><p>${esc((p.bio||'').slice(0,150))}</p><button class="btn primary" style="width:100%" onclick="exploreLike('${p.id}',this)">♥ Me gusta</button></div>`;box.appendChild(el)}
  if(!rows.length)box.innerHTML='<div class="empty" style="grid-column:1/-1">No encontramos perfiles en esta categoría con tus filtros actuales.</div>';setStatus('exploreStatus','')
}
async function exploreLike(userId,btn){if(btn)btn.disabled=true;const {error}=await sb.from('likes').insert({from_user_id:session.user.id,to_user_id:userId,like_type:'standard'});if(error){if(btn)btn.disabled=false;return toast(error.code==='23505'?'Ya habías indicado interés.':error.message)}toast('Like enviado. Si es recíproco aparecerá en Matches.');btn&&(btn.textContent='✓ Like enviado');refreshBadges();}

async function loadPlansTJ(){
  if(!session||!$('plansList'))return;const box=$('plansList');box.innerHTML='<div class="note">Cargando planes...</div>';
  const {data,error}=await sb.from('groups').select('*').eq('status','active').gte('starts_at',new Date().toISOString()).order('starts_at').limit(50);if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}
  const rows=data||[],ids=rows.map(x=>x.id);let members=[];if(ids.length){const r=await sb.from('group_members').select('group_id,user_id').in('group_id',ids);members=r.data||[]}
  box.innerHTML='';for(const g of rows){const mine=members.some(m=>m.group_id===g.id&&m.user_id===session.user.id),count=members.filter(m=>m.group_id===g.id).length;const d=document.createElement('div');d.className='card plancard';d.innerHTML=`<div><h3>${esc(g.title)}</h3><div class="meta">📍 ${esc(g.city)} · 🗓 ${new Date(g.starts_at).toLocaleString()} · 👥 ${count}/${g.max_members}</div><p>${esc(g.description||'')}</p></div><div>${g.owner_id===session.user.id?'<span class="pill">Tu plan</span>':mine?`<button class="btn ghost" onclick="leavePlanTJ('${g.id}')">Salir</button>`:`<button class="btn primary" onclick="joinPlanTJ('${g.id}')">Unirme</button>`}</div>`;box.appendChild(d)}if(!rows.length)box.innerHTML='<div class="empty">Todavía no hay planes próximos. Crea el primero.</div>';
}
async function createPlanTJ(){const title=$('planTitle').value.trim(),when=$('planWhen').value;if(title.length<3||!when)return setStatus('planCreateStatus','Agrega título y fecha/hora.');const dt=new Date(when);if(Number.isNaN(dt.getTime())||dt<=new Date())return setStatus('planCreateStatus','Elige una fecha futura.');const {error}=await sb.rpc('create_group_plan',{p_title:title,p_description:$('planDesc').value.trim(),p_city:$('planCity').value,p_starts_at:dt.toISOString(),p_max_members:Number($('planMax').value)||8});if(error)return setStatus('planCreateStatus',error.message);setStatus('planCreateStatus','Plan creado.',true);$('planTitle').value='';$('planDesc').value='';loadPlansTJ()}
async function joinPlanTJ(id){const {error}=await sb.rpc('join_group',{group_uuid:id});if(error)return toast(error.message);toast('Te uniste al plan.');loadPlansTJ()}
async function leavePlanTJ(id){const {error}=await sb.rpc('leave_group',{group_uuid:id});if(error)return toast(error.message);toast('Saliste del plan.');loadPlansTJ()}

async function loadDoubleDate(){
  if(!session||!$('doubleStatusBox'))return;const box=$('doubleStatusBox');box.innerHTML='<div class="note">Consultando...</div>';const {data,error}=await sb.rpc('get_my_double_date');if(error){box.innerHTML=`<div class="empty">${esc(error.message)}</div>`;return}const d=data?.[0];if(!d){box.innerHTML='<div class="empty">Aún no tienes una pareja Double Date.</div>';return}if(d.status==='active'){box.innerHTML=`<div class="card"><div class="pill">Pareja activa</div><h3>${esc(d.partner_name||'Compañero/a conectado/a')}</h3><p class="note">Ya pueden participar juntos en experiencias Double Date.</p><button class="btn danger" onclick="leaveDoubleDate()">Salir de Double Date</button></div>`}else{box.innerHTML=`<div class="note">Esperando a tu compañero/a.${d.invite_token?` Comparte este código:<div class="invitecode">${esc(d.invite_token)}</div>`:''}</div>`}}
async function createDoubleInvite(){const {data,error}=await sb.rpc('create_double_date_invite');if(error)return toast(error.message);toast('Código Double Date generado.');await loadDoubleDate();if(data&&navigator.clipboard)navigator.clipboard.writeText(data).catch(()=>{})}
async function acceptDoubleInvite(){const code=$('doubleCode').value.trim().toUpperCase();if(code.length<6)return setStatus('doubleStatus','Ingresa el código que te compartieron.');const {error}=await sb.rpc('accept_double_date_invite',{invite_token:code});if(error)return setStatus('doubleStatus',error.message);setStatus('doubleStatus','Pareja Double Date conectada.',true);$('doubleCode').value='';loadDoubleDate()}
async function leaveDoubleDate(){if(!confirm('¿Quieres salir de Double Date?'))return;const {error}=await sb.rpc('leave_double_date');if(error)return toast(error.message);toast('Double Date desactivado.');loadDoubleDate()}

const phase6Go=go;
go=function(page){phase6Go(page);if(page==='explore')loadExploreCategories();if(page==='plans')loadPlansTJ();if(page==='double')loadDoubleDate()};

const p7Timer=setInterval(()=>{if(document.querySelector('main.content')){injectPhaseSevenUI();clearInterval(p7Timer)}},100);
setTimeout(()=>injectPhaseSevenUI(),900);
