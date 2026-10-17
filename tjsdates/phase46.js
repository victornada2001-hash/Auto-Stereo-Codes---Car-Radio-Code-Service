// Phase 46: in-app Terms, Privacy Notice and Community Guidelines (ES/EN).

const tjsLegalDocs={
  es:{
    terms:{title:'Términos de uso',version:'Versión 1.0',sections:[
      ['Elegibilidad','TJSDATES es exclusivamente para personas de 18 años o más. Debes proporcionar información auténtica y mantener una sola cuenta personal.'],
      ['Uso de la plataforma','No se permite acosar, amenazar, suplantar, estafar, solicitar dinero, publicar contenido ilegal ni utilizar TJSDATES para explotación sexual, trata o actividades que pongan a otras personas en riesgo.'],
      ['Contenido y moderación','Eres responsable del contenido que compartes. TJSDATES puede revisar, limitar o retirar contenido y cuentas cuando sea necesario para seguridad, cumplimiento de estas reglas o atención de reportes.'],
      ['Matches y comunicaciones','Un Match no implica respaldo o garantía de identidad, intención o seguridad de la otra persona. Utiliza las herramientas de bloquear y reportar cuando sea necesario.'],
      ['Servicios de pago','Los planes y compras de pago solo se habilitarán cuando se publiquen precios finales y el servidor confirme correctamente el pago. Las condiciones comerciales se mostrarán antes de cualquier cobro.'],
      ['Suspensión y cierre','TJSDATES puede suspender o cerrar cuentas por incumplimiento, riesgo de seguridad, fraude o uso abusivo. También puedes solicitar la eliminación de tu cuenta desde Privacidad.']
    ]},
    privacy:{title:'Aviso de privacidad',version:'Versión 1.0',sections:[
      ['Datos que utilizamos','Podemos procesar datos de cuenta, perfil, preferencias, intereses, fotos, verificaciones, Likes, Matches, mensajes, reportes, soporte, datos técnicos y configuración de notificaciones para operar TJSDATES.'],
      ['Ubicación','La ubicación exacta se usa únicamente para funciones de proximidad y no se muestra a otros usuarios. TJSDATES muestra distancia aproximada y actualmente limita el descubrimiento por ubicación a la región Tijuana–San Diego.'],
      ['Seguridad y moderación','Podemos utilizar reportes, evidencia enviada, actividad de cuenta y señales técnicas para prevenir fraude, abuso y riesgos de seguridad.'],
      ['Conservación y eliminación','Los datos se conservan mientras sean necesarios para prestar el servicio, seguridad, resolución de disputas y obligaciones aplicables. Puedes solicitar eliminación desde la sección Privacidad; existe un periodo de gracia antes del borrado programado.'],
      ['Tus controles','Desde TJSDATES puedes modificar perfil, filtros, visibilidad, notificaciones, bloqueos, descargar una copia de tus datos y solicitar eliminación de cuenta.'],
      ['Compartición','No vendemos perfiles de citas. Los datos pueden ser tratados por proveedores necesarios para infraestructura, autenticación, almacenamiento, notificaciones y pagos cuando esas funciones estén activas.']
    ]},
    community:{title:'Normas de la comunidad',version:'Versión 1.0',sections:[
      ['Respeto','Trata a las demás personas con respeto. No se permiten amenazas, acoso, odio, humillación, contenido sexual no solicitado ni presión para obtener contacto, imágenes o encuentros.'],
      ['Solo adultos','No publiques contenido de menores ni permitas que una persona menor de 18 años use tu cuenta. Reporta inmediatamente cualquier perfil que parezca pertenecer a un menor.'],
      ['Autenticidad','No suplantes identidades, no engañes sobre quién eres y no utilices fotografías de otra persona sin autorización.'],
      ['Fraude y dinero','No solicites transferencias, inversiones, criptomonedas, tarjetas de regalo ni pagos personales a personas que acabas de conocer en TJSDATES.'],
      ['Citas seguras','Para primeros encuentros utiliza lugares públicos, avisa a alguien de confianza, conserva tu propio transporte y abandona la situación si no te sientes seguro/a.']
    ]}
  },
  en:{
    terms:{title:'Terms of Use',version:'Version 1.0',sections:[
      ['Eligibility','TJSDATES is exclusively for people age 18 or older. You must provide authentic information and maintain one personal account.'],
      ['Platform use','Harassment, threats, impersonation, scams, money solicitation, illegal content, sexual exploitation, trafficking, or activity that puts others at risk is prohibited.'],
      ['Content and moderation','You are responsible for the content you share. TJSDATES may review, limit or remove content and accounts when needed for safety, rule enforcement or report handling.'],
      ['Matches and communication','A Match is not an endorsement or guarantee of another person’s identity, intentions or safety. Use block and report tools when needed.'],
      ['Paid services','Paid plans and purchases will only be enabled after final pricing is published and payment is confirmed by the server. Commercial terms will be shown before any charge.'],
      ['Suspension and closure','TJSDATES may suspend or close accounts for rule violations, safety risks, fraud or abusive use. You can also request account deletion from Privacy.']
    ]},
    privacy:{title:'Privacy Notice',version:'Version 1.0',sections:[
      ['Data we use','We may process account, profile, preferences, interests, photos, verification, Likes, Matches, messages, reports, support, technical data and notification settings to operate TJSDATES.'],
      ['Location','Exact location is used only for proximity features and is not shown to other users. TJSDATES shows approximate distance and currently limits location-based discovery to the Tijuana–San Diego region.'],
      ['Safety and moderation','We may use reports, submitted evidence, account activity and technical signals to prevent fraud, abuse and safety risks.'],
      ['Retention and deletion','Data is kept as needed to provide the service, maintain safety, resolve disputes and meet applicable obligations. You can request deletion from Privacy; a grace period applies before scheduled deletion.'],
      ['Your controls','TJSDATES lets you edit your profile, filters, visibility, notifications and blocks, download a copy of your data and request account deletion.'],
      ['Sharing','We do not sell dating profiles. Data may be processed by providers needed for infrastructure, authentication, storage, notifications and payments when those features are enabled.']
    ]},
    community:{title:'Community Guidelines',version:'Version 1.0',sections:[
      ['Respect','Treat other people with respect. Threats, harassment, hate, humiliation, unsolicited sexual content or pressure for contact details, images or meetings is prohibited.'],
      ['Adults only','Do not post content involving minors or allow anyone under 18 to use your account. Report any profile that appears to belong to a minor immediately.'],
      ['Authenticity','Do not impersonate others, misrepresent who you are or use another person’s photos without permission.'],
      ['Fraud and money','Do not request transfers, investments, cryptocurrency, gift cards or personal payments from people you just met on TJSDATES.'],
      ['Safer dates','For first meetings use public places, tell someone you trust, keep control of your own transportation and leave if you feel unsafe.']
    ]}
  }
};

function currentLegalDoc(kind){const lang=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en'?'en':'es';return tjsLegalDocs[lang][kind]||tjsLegalDocs[lang].terms;}
function showLegalDocument(kind){
  const d=currentLegalDoc(kind);
  const html=`<div class="legal-doc"><div class="pill">${esc(d.version)}</div><h2>${esc(d.title)}</h2>${d.sections.map(([h,p])=>`<section style="margin:16px 0"><h3 style="margin:0 0 6px">${esc(h)}</h3><p class="note" style="line-height:1.6">${esc(p)}</p></section>`).join('')}</div>`;
  showModal(html);
}

function injectLegalCenter46(){
  if(!$('legal46Styles')){const s=document.createElement('style');s.id='legal46Styles';s.textContent='.legal-links{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:20px 0}.legal-links button{background:none;border:0;color:var(--muted);text-decoration:underline;cursor:pointer;padding:5px}.legal-doc{max-width:680px}.legal-doc h2{margin-top:9px}.legal-doc .note{font-size:14px}.legal-center-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}';document.head.appendChild(s);}
  const landing=$('landing');if(landing&&!$('landingLegalLinks')){const d=document.createElement('div');d.id='landingLegalLinks';d.className='legal-links';landing.appendChild(d);}
  const auth=$('auth');if(auth&&!$('authLegalLinks')){const d=document.createElement('div');d.id='authLegalLinks';d.className='legal-links';auth.appendChild(d);}
  const privacy=$('page-privacy');if(privacy&&!$('legalCenterCard')){const c=document.createElement('div');c.id='legalCenterCard';c.className='card';c.style.marginTop='14px';c.innerHTML='<div class="pill">Legal</div><h3 id="legalCenterTitle" style="margin:8px 0 0">Documentos y normas</h3><p id="legalCenterNote" class="note"></p><div class="legal-center-actions" id="legalCenterActions"></div>';privacy.appendChild(c);}
  applyLegalLanguage46();
}

function legalButton(label,kind){return `<button type="button" onclick="showLegalDocument('${kind}')">${esc(label)}</button>`;}
function applyLegalLanguage46(){
  const en=typeof tjsUiLanguage!=='undefined'&&tjsUiLanguage==='en';
  const labels=en?{terms:'Terms',privacy:'Privacy',community:'Community Guidelines',title:'Documents & guidelines',note:'Review the current TJSDATES rules and privacy information.'}:{terms:'Términos',privacy:'Privacidad',community:'Normas de la comunidad',title:'Documentos y normas',note:'Consulta las reglas actuales y la información de privacidad de TJSDATES.'};
  ['landingLegalLinks','authLegalLinks'].forEach(id=>{const x=$(id);if(x)x.innerHTML=legalButton(labels.terms,'terms')+legalButton(labels.privacy,'privacy')+legalButton(labels.community,'community');});
  if($('legalCenterTitle'))$('legalCenterTitle').textContent=labels.title;if($('legalCenterNote'))$('legalCenterNote').textContent=labels.note;
  if($('legalCenterActions'))$('legalCenterActions').innerHTML=`<button class="btn ghost" type="button" onclick="showLegalDocument('terms')">${esc(labels.terms)}</button><button class="btn ghost" type="button" onclick="showLegalDocument('privacy')">${esc(labels.privacy)}</button><button class="btn ghost" type="button" onclick="showLegalDocument('community')">${esc(labels.community)}</button>`;
}

const p46Apply=typeof applyTjsLanguage==='function'?applyTjsLanguage:null;
if(p46Apply)applyTjsLanguage=function(){p46Apply();injectLegalCenter46();applyLegalLanguage46();};
const p46Go=typeof go==='function'?go:null;if(p46Go)go=function(page){p46Go(page);if(page==='privacy')setTimeout(injectLegalCenter46,80);};

setTimeout(injectLegalCenter46,260);
window.addEventListener('pageshow',()=>setTimeout(injectLegalCenter46,100));

if(!document.querySelector('script[data-tjs-phase47]')){
  const s=document.createElement('script');s.src='phase47.js?v=1';s.defer=true;s.dataset.tjsPhase47='1';document.body.appendChild(s);
}
