function injectPhaseTwentyTwoStyles(){
  if(document.getElementById('phase22Styles'))return;
  const s=document.createElement('style');s.id='phase22Styles';s.textContent=`
  .more-sheet{position:fixed;inset:0;z-index:11500;background:#0008;display:flex;align-items:flex-end;justify-content:center;padding:14px}.more-sheet.hidden{display:none}.more-panel{width:min(680px,100%);max-height:82vh;overflow:auto;background:#120d1a;border:1px solid var(--line);border-radius:22px 22px 14px 14px;padding:16px;box-shadow:0 -18px 60px #0009}.more-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.more-action{min-height:76px;border:1px solid var(--line);border-radius:14px;background:#1a1224;color:var(--text);font-weight:800;cursor:pointer;padding:10px}.more-action span{display:block;font-size:22px;margin-bottom:4px}.more-action:hover,.more-action:focus{border-color:#ff5a9a;outline:none}.bottom .phase22-more{display:none}@media(max-width:900px){.bottom [data-page="profile"]{display:none}.bottom .phase22-more{display:block}.more-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:430px){.more-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.more-panel{padding:13px}}
  `;document.head.appendChild(s);
}

function closeMoreMenu(){document.getElementById('moreSheet')?.classList.add('hidden')}
function moreGo(page){closeMoreMenu();go(page)}

function injectMobileMoreMenu(){
  injectPhaseTwentyTwoStyles();
  const bottom=document.querySelector('nav.bottom');
  if(bottom&&!bottom.querySelector('.phase22-more')){
    const b=document.createElement('button');b.type='button';b.className='phase22-more';b.innerHTML='⋯<br>Más';b.onclick=openMoreMenu;bottom.appendChild(b);
  }
  if(document.getElementById('moreSheet'))return;
  const sheet=document.createElement('div');sheet.id='moreSheet';sheet.className='more-sheet hidden';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label','Más opciones');
  sheet.innerHTML=`<div class="more-panel"><div class="sectionhead"><div><div class="pill">Navegación</div><h3 style="margin:7px 0 0">Más opciones</h3></div><button class="btn ghost" type="button" onclick="closeMoreMenu()">Cerrar</button></div><div id="moreGrid" class="more-grid"></div></div>`;
  sheet.addEventListener('click',e=>{if(e.target===sheet)closeMoreMenu()});
  document.body.appendChild(sheet);
  renderMoreMenu();
}

function renderMoreMenu(){
  const grid=document.getElementById('moreGrid');if(!grid)return;
  const items=[
    ['profile','👤','Perfil'],['explore','✨','Explorar'],['plans','🎉','Planes TJ & SD'],['double','👥','Double Date'],
    ['photos','📷','Fotos'],['filters','⚙️','Filtros'],['safety','🛡️','Seguridad'],['privacy','🔐','Privacidad'],
    ['support','💁','Soporte'],['premium','✦','Premium'],['notifications','🔔','Notificaciones']
  ];
  if(adminRole)items.push(['admin','🧰','Admin']);
  grid.innerHTML='';
  for(const [page,icon,label] of items){const b=document.createElement('button');b.type='button';b.className='more-action';b.innerHTML=`<span>${icon}</span>${esc(label)}`;b.onclick=()=>moreGo(page);grid.appendChild(b)}
  const out=document.createElement('button');out.type='button';out.className='more-action';out.innerHTML='<span>↪</span>Salir';out.onclick=()=>{closeMoreMenu();logout()};grid.appendChild(out);
}

function openMoreMenu(){injectMobileMoreMenu();renderMoreMenu();const s=document.getElementById('moreSheet');s?.classList.remove('hidden');setTimeout(()=>s?.querySelector('button')?.focus(),10)}

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('moreSheet')?.classList.contains('hidden'))closeMoreMenu()});

// Prevent stale social chat state when moving between Planes and Double Date.
const p22CloseSocial=typeof closeSocialChat==='function'?closeSocialChat:null;
const p22Go=go;
go=function(page){
  if(socialConversationId&&page!=='plans'&&page!=='double'&&typeof p22CloseSocial==='function')p22CloseSocial();
  p22Go(page);
  setTimeout(()=>{injectMobileMoreMenu();renderMoreMenu()},40);
};

// If a realtime subscription dies, keep the UI usable by allowing manual reloads instead of leaving stale indicators.
window.addEventListener('offline',()=>{
  try{document.getElementById('typingIndicator')?.classList.add('hidden')}catch(_e){}
});

setTimeout(()=>{injectMobileMoreMenu();renderMoreMenu()},600);
