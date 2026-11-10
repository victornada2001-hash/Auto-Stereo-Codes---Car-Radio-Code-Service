/* TJSDATES v94: strip research-chart captions from synthetic demo portraits and eliminate legacy swipe controls. */
(function(){
  'use strict';
  if(window.__t94Ready)return;
  window.__t94Ready=true;
  const app=document.getElementById('app');
  if(!app)return;
  const cache=new Map();
  const images=new Map();
  function loadSource(url){
    if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{
      const image=new Image();
      image.crossOrigin='anonymous';
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('No se pudo cargar la lámina de retratos sintéticos'));
      image.src=url;
    }));
    return images.get(url);
  }
  /* Source montage layout follows the SFHQ-T2I plotting script:
     x: left=.003,right=.997,wspace=.04; y: top=.91,bottom=.01,hspace=.16.
     Cropping the axes themselves omits the global headings and each axes title. */
  async function singlePortrait(sprite){
    if(!sprite?.url)return null;
    const key=[sprite.url,sprite.row,sprite.col].join('|');
    if(cache.has(key))return cache.get(key);
    const promise=(async()=>{
      const source=await loadSource(sprite.url);
      const W=source.naturalWidth,H=source.naturalHeight;
      const cols=Math.max(1,Number(sprite.cols)||1),rows=Math.max(1,Number(sprite.rows)||1);
      const cw=W*.994/(cols+(cols-1)*.04),ch=H*.90/(rows+(rows-1)*.16);
      let sx=W*.003+Number(sprite.col)*cw*1.04;
      let sy=H*.09+Number(sprite.row)*ch*1.16;
      // 6% safety trim from the top of the photo panel prevents residual plot labels.
      sy+=ch*.06;
      let sw=cw,sh=ch*.91;
      // Slight edge inset removes separator lines between plots.
      sx+=sw*.025;sw*=.95;
      const canvas=document.createElement('canvas');
      canvas.width=384;canvas.height=500;
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx)throw new Error('Canvas unavailable');
      const ratio=canvas.width/canvas.height;
      const actual=sw/sh;
      if(actual>ratio){const reduced=sh*ratio;sx+=(sw-reduced)/2;sw=reduced}
      else{const reduced=sw/ratio;sy+=(sh-reduced)/2;sh=reduced}
      ctx.drawImage(source,Math.max(0,sx),Math.max(0,sy),Math.min(sw,W-sx),Math.min(sh,H-sy),0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/webp',.88);
    })().catch(e=>{console.warn('Synthetic portrait could not be cropped:',e);return null});
    cache.set(key,promise);
    return promise;
  }
  function cleanupActions(){
    const actions=document.querySelector('#page-discover .actions');
    if(!actions)return;
    actions.classList.add('t94-actions');
    for(const btn of Array.from(actions.querySelectorAll('button'))){
      if(!btn.classList.contains('t93-action')){btn.remove();continue}
      btn.classList.remove('p59action','p59-rewind','p59-pass','p59-super' ,'p59-like');
      btn.querySelectorAll('.p59icon,.p59label').forEach(x=>x.remove());
      if(!btn.querySelector('svg.t93-icon'))console.warn('Missing SVG in reaction button:',btn.className);
    }
    // Ensure the buttons are in the correct order and no old action nodes remain.
    for(const c of [...actions.children])if(!c.classList.contains('t93-action'))c.remove();
    const preferred=['undo','pass','star','like','boost','voice'];
    preferred.forEach((name,i)=>{const b=actions.querySelector('.t93-'+name);if(b&&actions.children[i]!==b)actions.insertBefore(b,actions.children[i]||null)});
  }
  let cleaning=false;
  const actions=document.querySelector('#page-discover .actions');
  if(actions){
    cleanupActions();
    const observer=new MutationObserver(()=>{
      if(cleaning)return;cleaning=true;
      try{cleanupActions()}finally{cleaning=false}
    });
    observer.observe(actions,{childList:true,subtree:true});
  }
  function cleanupHint(){
    const area=document.querySelector('#page-discover .discoverWrap');
    if(!area)return;
    for(const node of area.querySelectorAll('div,p,small,span')){
      if(node.id==='discoverStatus'||node.closest('.profilecard,.actions'))continue;
      const txt=node.textContent.trim();
      if(txt.length>0&&txt.length<100&&(/^(Teclado:|Keyboard:)/i.test(txt)))node.remove();
    }
    const status=document.getElementById('discoverStatus');
    if(status&&status.parentElement&&actions&&status.previousElementSibling!==actions){
      actions.insertAdjacentElement('afterend',status);
    }
  }
  const olderRender=renderDeck;
  renderDeck=function(){
    const profile=candidates?.[candidateIndex];
    if(profile&&typeof window.renderDiscoverProfile==='function'){
      window.renderDiscoverProfile(profile,singlePortrait);
      cleanupHint();cleanupActions();
      if(typeof p61SyncRewind==='function')p61SyncRewind();
      return;
    }
    const result=olderRender.apply(this,arguments);
    const current=candidates?.[candidateIndex],card=document.getElementById('currentCard');
    cleanupHint();cleanupActions();
    if(!current?.is_demo||!card)return result;
    const hero=card.querySelector('.heroimg');
    if(!hero)return result;
    const portrait=hero.querySelector('.t93-portrait');
    if(portrait){portrait.style.backgroundImage='none';portrait.style.backgroundColor='#2d1e3a'}
    const legacyImg=hero.querySelector('img');if(legacyImg)legacyImg.remove();
    card.classList.add('t94-loading-image');
    const id=current.id;
    singlePortrait(current.syntheticSprite).then(photo=>{
      if(!card.isConnected||candidates?.[candidateIndex]?.id!==id)return;
      card.classList.remove('t94-loading-image');
      if(!photo){
        if(portrait)portrait.style.backgroundImage='none';
        card.classList.add('t94-image-unavailable');
        return;
      }
      card.classList.remove('t94-image-unavailable');
      // A clean, independently cropped image, without chart titles, filenames or row labels.
      const img=document.createElement('img');
      img.className='t94-profile-photo';
      img.src=photo;img.alt='Retrato sintético del perfil de demostración';
      hero.prepend(img);
      if(portrait)portrait.remove();
      current.cleanPortrait=photo;
    });
    return result;
  };
  // Replace preview snippets from the labelled source collage with clean cropped faces.
  const previews=[...document.querySelectorAll('.t93-mini-portrait')];
  const demos=window.TJSDATES_DEMO_PROFILES||[];
  previews.forEach((el,i)=>{
    el.style.backgroundImage='none';
    singlePortrait(demos[[1,3,7,9][i]]?.syntheticSprite).then(photo=>{
      if(photo){el.style.backgroundImage='url("'+photo+'")';el.style.backgroundSize='cover';el.style.backgroundPosition='center'}
    });
  });
  // If the deck already rendered before this script arrived, repaint it with clean photos.
  if(typeof session!=='undefined'&&session&&typeof candidates!=='undefined'&&candidates[candidateIndex]){
    renderDeck();
  }
  cleanupHint();
  app.classList.add('t94-ready');
  if(typeof releaseStartupGate==='function')releaseStartupGate();
})();
