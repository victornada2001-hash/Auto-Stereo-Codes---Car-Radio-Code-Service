import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('tjsdates');
const files=fs.readdirSync(root);
const phaseFiles=files.filter(f=>/^phase\d+\.js$/.test(f)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const allSources=new Map([['index.html',html]]);
for(const f of phaseFiles)allSources.set(f,fs.readFileSync(path.join(root,f),'utf8'));

function refs(src){return [...src.matchAll(/phase\d+\.js/g)].map(m=>m[0]);}
const queue=[...refs(html)],seen=new Set();
while(queue.length){const f=queue.shift();if(seen.has(f))continue;seen.add(f);const src=allSources.get(f);if(!src)continue;for(const r of refs(src))if(!seen.has(r))queue.push(r)}

const missingReachability=phaseFiles.filter(f=>!seen.has(f));
if(missingReachability.length){console.error('Unreachable phase files:',missingReachability.join(', '));process.exitCode=1}

const missingCache=phaseFiles.filter(f=>!sw.includes(`/${f}`));
if(missingCache.length){console.error('Phases missing from PWA cache:',missingCache.join(', '));process.exitCode=1}

for(const f of seen){if(!allSources.has(f)){console.error('Referenced phase does not exist:',f);process.exitCode=1}}

for(const jsonFile of ['manifest.webmanifest','vercel.json']){
  try{JSON.parse(fs.readFileSync(path.join(root,jsonFile),'utf8'))}catch(e){console.error(`${jsonFile} invalid JSON:`,e.message);process.exitCode=1}
}

if(!sw.includes("notificationclick")) {console.error('Service worker missing notification click handler');process.exitCode=1}
if(!sw.includes("push")) {console.error('Service worker missing push handler');process.exitCode=1}
if(!html.includes('app.js')||!html.includes('phase7.js')) {console.error('index.html missing base application scripts');process.exitCode=1}

console.log(`Phase files discovered: ${phaseFiles.length}`);
console.log(`Phase files reachable from index.html: ${seen.size}`);
console.log(`PWA cache includes all ${phaseFiles.length} phases.`);
if(!process.exitCode)console.log('TJSDATES static health check PASSED.');
