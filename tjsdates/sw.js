const CACHE='tjsdates-v10';
const CORE=['/','/index.html','/styles.css','/app.js','/enhancements.js','/enhancements.css','/manifest.webmanifest','/icon.svg','/phase7.js','/phase8.js','/phase9.js','/phase10.js','/phase11.js','/phase12.js','/phase13.js','/phase14.js','/phase15.js','/phase16.js','/phase17.js','/phase18.js','/phase19.js','/phase20.js','/phase21.js','/phase22.js','/phase23.js','/phase24.js','/phase25.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))))});
