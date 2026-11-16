import assert from 'node:assert/strict';
// Run against a disposable browser profile: this clears quiz progress at APP_URL.
const appUrl = process.env.APP_URL ?? 'http://localhost:8000/';
const origin = new URL(appUrl).origin;
const debugUrl = process.env.CHROME_DEBUG_URL ?? 'http://127.0.0.1:9222';
const targets = await (await fetch(`${debugUrl}/json`)).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, {once:true}));
let serial = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id) { const item=pending.get(m.id); pending.delete(m.id); if (m.error) item.reject(m.error); else item.resolve(m.result); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text + ': ' + m.params.exceptionDetails.exception?.description);
});
function cdp(method, params={}) {return new Promise((resolve,reject)=>{const id=++serial; pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression) {
 const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
 return r.result.value;
}
async function wait(expression) {
 for(let i=0;i<150;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+expression);
}
async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); }
async function ready(){await wait(`document.querySelector('#bayernMap') && document.querySelector('#mapHost').getAttribute('aria-busy') === 'false'`);}
async function mode(value){await click(`input[name="mode"][value="${value}"]`);}
await cdp('Runtime.enable'); await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
await cdp('Storage.clearDataForOrigin',{origin,storageTypes:'service_workers,cache_storage'});
await cdp('Page.navigate',{url:appUrl}); await ready();
await evaluate('localStorage.clear()');await cdp('Page.reload');await ready();
await mode('correction');
assert.equal(await evaluate('document.querySelector("#start").disabled'),true);
assert.match(await evaluate('document.querySelector("#question").textContent'),/Keine offenen Fehler/);
// A real normal quiz answer must save immediately, without completing the round.
await mode('map'); await click('#start'); await click('#autoNext');
await evaluate(`(async()=>{ const {REGIONS}=await import('./game.js'); const name=document.querySelector('#question strong').textContent;
 const wrong=REGIONS.find(x=>x.name!==name); document.querySelector('#'+wrong.code).dispatchEvent(new MouseEvent('click',{bubbles:true})); })()`);
assert.equal(await evaluate('JSON.parse(localStorage.bayernQuizMistakes).entries.length'),1);
await cdp('Page.reload');await ready();
assert.match(await evaluate('document.querySelector("#mode-correction-best").textContent'),/1 offene/);
// Seed one target from each answer type, including both map and seat for a region.
await evaluate(`(async()=>{ const {MAP_TOPICS,REGIONS}=await import('./game.js'); const entries=Object.entries(MAP_TOPICS).map(([topic,items])=>({topic,code:items[0].code,streak:0}));entries.push({topic:'seat',code:REGIONS[0].code,streak:0}); localStorage.bayernQuizMistakes=JSON.stringify({version:1,entries}); })()`);
await cdp('Page.reload');await ready();await mode('correction');await click('#start');await click('#autoNext');
async function answerCorrect(){
 return evaluate(`(async()=>{const {MAP_TOPICS,REGIONS,TOPIC_LABELS}=await import('./game.js');const label=document.querySelector('#questionTopic').textContent;const topic=Object.keys(TOPIC_LABELS).find(k=>TOPIC_LABELS[k]===label) ?? document.querySelector('input[name=mode]:checked').value;const name=document.querySelector('#question strong').textContent;const target=(topic==='seat'?REGIONS:MAP_TOPICS[topic]).find(x=>x.name===name);
 if(topic==='seat'){ if(document.querySelector('#options').classList.contains('hidden'))throw Error('Seat options hidden'); [...document.querySelectorAll('#options button')].find(b=>b.textContent===target.seat).click(); }
 else {if(!document.querySelector('#options').classList.contains('hidden'))throw Error('Map options visible');const node=document.querySelector(topic==='map'?'#'+target.code:'.'+topic+'[data-'+topic+'="'+target.code+'"]');if(!node.getClientRects().length)throw Error('Map target hidden'); node.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));}return topic;})()`);
}
const seen=new Set();for(let i=0;i<8;i++){seen.add(await answerCorrect());assert.match(await evaluate('document.querySelector("#correctionProgress").textContent'),/1 von 2/);await click('#next');}
assert.equal(seen.size,8);
assert.equal(await evaluate('JSON.parse(localStorage.bayernQuizMistakes).entries.every(e=>e.streak===1)'),true);
assert.match(await evaluate('document.querySelector("#correctionSummary").textContent'),/8 offene/);
assert.equal(await evaluate('localStorage.getItem("bayernQuizHighscores")'),null);
// Mobile layout; the second round clears the saved questions.
await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await click('#practiceSaved');
await answerCorrect();assert.match(await evaluate('document.querySelector("#correctionProgress").textContent'),/Fehler korrigiert/);
for(let i=0;i<7;i++){await click('#next');await answerCorrect();}await click('#next');
assert.equal(await evaluate('JSON.parse(localStorage.bayernQuizMistakes).entries.length'),0);
assert.match(await evaluate('document.querySelector("#correctionSummary").textContent'),/Alle gespeicherten Fehler korrigiert/);
assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
// A normal round records only after the final Next; double answers are ignored.
await mode('map');
await evaluate(`document.querySelector('#count').value='3'; document.querySelector('#count').dispatchEvent(new Event('change')); document.querySelector('#autoNext').checked=false`);
await click('#start');
for (let i=0; i<3; i++) {
  await answerCorrect(); await answerCorrect();
  assert.equal(await evaluate('Number(document.querySelector("#score").textContent)'), i+1);
  assert.equal(await evaluate('localStorage.getItem("bayernQuizHighscores")'), null);
  await click('#next');
}
assert.notEqual(await evaluate('localStorage.getItem("bayernQuizHighscores")'), null);
await click('#resetRecords'); await click('#resetAllRecords');
await evaluate('document.querySelector("#resetRecordsForm").requestSubmit()');
assert.equal(await evaluate('localStorage.getItem("bayernQuizHighscores")'), null);
// Pending correct-answer timers must not advance a restarted or switched round.
await click('#newRound');
await evaluate('document.querySelector("#autoNext").checked=true');
await answerCorrect(); await click('#restart');
await new Promise(resolve => setTimeout(resolve, 1800));
assert.equal(await evaluate('document.querySelector("#round").textContent'), '1');
assert.equal(await evaluate('document.querySelector("#score").textContent'), '0');
await answerCorrect(); await mode('lake');
await new Promise(resolve => setTimeout(resolve, 1800));
assert.equal(await evaluate('document.querySelector("#round").textContent'), '–');
// Information image failures and close focus remain usable.
await evaluate(`document.querySelector('.lake').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
await evaluate('document.querySelector("#lakeInfoImage").dispatchEvent(new Event("error"))');
assert.equal(await evaluate('document.querySelector("#lakeInfoImage").hidden'), true);
await click('[data-close-info="lakeInfo"]');
assert.equal(await evaluate('document.activeElement.id'), 'mapHost');
// Mixed rounds exercise each layer with keyboard answers.
await mode('mix'); await click('#start');
await evaluate('document.querySelector("#autoNext").checked=false');
for (let i=0; i<10; i++) { await answerCorrect(); await click('#next'); }
assert.equal(await evaluate('document.querySelector("#finalScore").textContent'), '10');
await mode('learn');
await click('[data-learn-topic="lakes"]');
assert.equal(await evaluate('JSON.parse(localStorage.bayernQuizLearnTopics).lakes'), false);

// Check offline availability through the service worker.
await wait('navigator.serviceWorker.controller !== null');
await cdp('Network.enable');await cdp('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
await cdp('Page.reload');await ready();await mode('correction');
assert.equal(await evaluate('document.querySelector("#start").disabled'),true);
await cdp('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
assert.deepEqual(errors,[]);
console.log('PASS: normal/mixed rounds, duplicate answers, timers, reset dialog, image failure/focus, preferences;  empty state, normal-answer persistence, reload, eight-topic practice, two-round clearing, desktop/mobile, records exclusion, offline reload, no browser exceptions.');
ws.close();
