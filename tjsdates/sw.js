const CACHE='tjsdates-v13';
const CORE=['/','/index.html','/styles.css','/app.js','/enhancements.js','/enhancements.css','/manifest.webmanifest','/icon.svg','/phase7.js','/phase8.js','/phase9.js','/phase10.js','/phase11.js','/phase12.js','/phase13.js','/phase14.js','/phase15.js','/phase16.js','/phase17.js','/phase18.js','/phase19.js','/phase20.js','/phase21.js','/phase22.js','/phase23.js','/phase24.js','/phase25.js','/phase26.js','/phase30.js','/phase33.js'];
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
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))))});
