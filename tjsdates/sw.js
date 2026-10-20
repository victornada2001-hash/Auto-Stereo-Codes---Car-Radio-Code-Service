const CACHE='tjsdates-v67';
const CORE=['/','/index.html','/styles.css','/app.js','/enhancements.js','/enhancements.css','/manifest.webmanifest','/icon.svg','/phase7.js','/phase8.js','/phase9.js','/phase10.js','/phase11.js','/phase12.js','/phase13.js','/phase14.js','/phase15.js','/phase16.js','/phase17.js','/phase18.js','/phase19.js','/phase20.js','/phase21.js','/phase22.js','/phase23.js','/phase24.js','/phase25.js','/phase26.js','/phase30.js','/phase33.js','/phase34.js','/phase35.js','/phase36.js','/phase37.js','/phase38.js','/phase39.js','/phase40.js','/phase41.js','/phase42.js','/phase43.js','/phase44.js','/phase45.js','/phase46.js','/phase47.js','/phase48.js','/phase49.js','/phase50.js','/phase51.js','/phase52.js','/phase53.js','/phase54.js','/phase55.js','/phase56.js','/phase57.js','/phase58.js','/phase59.js','/phase60.js','/phase61.js','/phase62.js','/phase63.js','/phase64.js','/phase65.js','/phase66.js','/phase67.js','/phase68.js','/phase69.js','/phase70.js','/phase71.js','/phase72.js','/phase73.js','/phase74.js','/phase75.js','/phase76.js','/phase76.css'];
const CORE_PATHS=new Set(CORE.map(x=>new URL(x,self.location.origin).pathname));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))) });
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('push',e=>{
  let p={title:'TJSDATES',body:'Tienes una nueva actividad.',data:{}};
  try{if(e.data)p={...p,...e.data.json()}}catch(_e){}
  e.waitUntil(self.registration.showNotification(p.title||'TJSDATES',{
    body:p.body||'Tienes una nueva actividad.',
    icon:'/icon.svg',
    badge:'/icon.svg',
    data:{...(p.data||{}),notification_id:p.notification_id||null,type:p.type||null,url:'/'},
    tag:p.notification_id||undefined,
    renotify:false
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const target=e.notification.data?.url||'/';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){if('focus' in client){client.navigate?.(target);return client.focus()}}
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){e.respondWith(fetch(req).catch(()=>caches.match('/index.html')));return;}
  if(!CORE_PATHS.has(url.pathname))return;
  e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(url.pathname,copy));}return r;}).catch(()=>caches.match(url.pathname)));
});
