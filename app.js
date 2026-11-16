'use strict';
// CodeUp Lesson 3-2. All server, API and encryption visuals below are educational simulations.
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const safe = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let currentTab = 'client';
let journeyStep = 0, journeyToken = 0;
let protocol = 'http', protocolToken = 0;
let apiToken = 0;
const tabIds = ['client','protocol','methods','api','quiz'];
function showTab(id){
  if(!tabIds.includes(id)) return;
  currentTab=id;
  document.querySelectorAll('.tab').forEach(btn=>{const active=btn.dataset.tab===id;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'page':'false');});
  document.querySelectorAll('.topic').forEach(section=>section.classList.toggle('active',section.id===id));
  if(window.scrollY>330) window.scrollTo({top:Math.max(0,$('main').getBoundingClientRect().top+window.scrollY-180),behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.tab)));
$('teacherToggle').addEventListener('click',()=>{const on=document.body.classList.toggle('show-teacher');$('teacherToggle').classList.toggle('on',on);$('teacherToggle').setAttribute('aria-pressed',String(on));});
$('fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch(e){alert('Fullscreen is not available in this browser. Press F11 instead.');}});
document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;if(event.key.toLowerCase()==='f'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();$('fullscreenBtn').click();}if(event.key==='ArrowRight'||event.key==='ArrowLeft'){const index=tabIds.indexOf(currentTab),direction=event.key==='ArrowRight'?1:-1;showTab(tabIds[Math.max(0,Math.min(tabIds.length-1,index+direction))]);}});

// TOPIC 1: Client/server journey
const journeyMessages=[
 q=>`1 / REQUEST: The client sends GET /search?q=${encodeURIComponent(q)} to the server.`,
 q=>`2 / PROCESSING: The server receives the request and searches for “${q}”.`,
 q=>`3 / RESPONSE: The server returns a successful response with matching video data.`,
 q=>`4 / DISPLAY: The browser displays search results for “${q}” to the student.`
];
function clearPackets(){['requestPacket','responsePacket'].forEach(id=>{$(id).classList.remove('go');$(id).style.setProperty('--distance', '200px');});}
function animatePacket(id){const el=$(id),track=el.parentElement;el.classList.remove('go');void el.offsetWidth;el.style.setProperty('--distance',Math.max(25,track.clientWidth-35)+'px');el.classList.add('go');}
function renderJourney(step){
 const q=$('searchInput').value.trim()||'Python Tutorials';
 clearPackets();
 $('journeyClient').classList.toggle('glow',step===0||step===3);
 $('journeyServer').classList.toggle('glow',step===1||step===2);
 document.querySelectorAll('#journeySteps .step').forEach((el,i)=>{el.classList.toggle('current',i===step);el.classList.toggle('done',i<step);});
 $('clientScreen').textContent=step===3?'🎬 3 matching videos':`🔎 ${q}`;
 $('serverScreen').textContent=step===0?'⏳ Waiting...':step===1?'⚙️ Searching database...':'✅ Results ready';
 $('journeyLog').textContent=journeyMessages[step](q);
 if(step===0)animatePacket('requestPacket');
 if(step===2)animatePacket('responsePacket');
}
$('nextJourney').addEventListener('click',()=>{journeyToken++;journeyStep=(journeyStep+1)%4;renderJourney(journeyStep);});
$('resetJourney').addEventListener('click',()=>{journeyToken++;journeyStep=0;renderJourney(0);$('journeyLog').textContent='Ready. The client is waiting to send a request.';});
$('runJourney').addEventListener('click',async()=>{const token=++journeyToken;$('runJourney').disabled=true;try{for(let i=0;i<4;i++){if(token!==journeyToken)break;journeyStep=i;renderJourney(i);await sleep(i===0||i===2?1500:1250);}}finally{$('runJourney').disabled=false;}});
$('searchInput').addEventListener('input',()=>{journeyToken++;journeyStep=0;renderJourney(0);});
renderJourney(0);$('journeyLog').textContent='Ready. The client is waiting to send a request.';clearPackets();

// TOPIC 2: Protocol comparison
function renderProtocol(){
 const secure=protocol==='https';
 $('httpBtn').classList.toggle('active',!secure);$('httpsBtn').classList.toggle('active',secure);
 $('httpBtn').setAttribute('aria-pressed',String(!secure));$('httpsBtn').setAttribute('aria-pressed',String(secure));
 $('dataPacket').classList.toggle('encrypted',secure);
 $('dataPacket').textContent=secure?'🔒 [TLS-encrypted data]':'password=CodeUp123';
 $('protocolExplanation').classList.toggle('secure',secure);
 $('protocolExplanation').textContent=secure?'✓ HTTPS protects the data in transit using TLS.':'⚠️ Without TLS, HTTP does not encrypt the data in transit.';
 $('protocolLog').textContent=secure?'HTTPS selected. Ready to simulate a protected connection.':'HTTP selected. Ready to simulate an unencrypted connection.';
}
$('httpBtn').addEventListener('click',()=>{protocolToken++;protocol='http';renderProtocol();});
$('httpsBtn').addEventListener('click',()=>{protocolToken++;protocol='https';renderProtocol();});
$('sendProtocol').addEventListener('click',async()=>{const token=++protocolToken;const secure=protocol==='https';const el=$('dataPacket');el.classList.remove('travel');void el.offsetWidth;el.classList.add('travel');$('sendProtocol').disabled=true;$('protocolLog').textContent=`Sending ${secure?'HTTPS':'HTTP'} request: POST /login ...`;await sleep(1200);if(token===protocolToken){$('protocolLog').textContent=secure?'Response: 200 OK. The HTTPS connection used TLS to protect the request in transit (visual simulation).':'Response: 200 OK. HTTP alone did not provide TLS encryption for the request (visual simulation).';}$('sendProtocol').disabled=false;});
$('resetProtocol').addEventListener('click',()=>{protocolToken++;protocol='http';$('dataPacket').classList.remove('travel');renderProtocol();});
renderProtocol();

// TOPIC 3: Request inspector
const scenarios={
 search:{method:'GET',path:'/api/videos?q=Python%20Tutorials',description:'Searching for videos on YouTube',body:null,result:{videos:['Python Tutorial for Beginners','Learn Python in 1 Hour']}},
 product:{method:'GET',path:'/api/products/42',description:'Viewing product details',body:null,result:{id:42,product:'Headphones',price:350}},
 login:{method:'POST',path:'/api/login',description:'Submitting a login form',body:{username:'Ahmed',password:'********'},result:{message:'Login submitted',authenticated:true}},
 signup:{method:'POST',path:'/api/signup',description:'Submitting a registration form',body:{name:'Adam',email:'adam@example.com'},result:{message:'Account created',userId:101}}
};
function buildRequest(s){return `${s.method} ${s.path} HTTP/1.1\nHost: codeup.example\nAccept: application/json${s.body?'\nContent-Type: application/json\n\n'+JSON.stringify(s.body,null,2):''}`;}
function renderRequest(){const s=scenarios[$('scenarioSelect').value];$('requestMethodBadge').textContent=s.method;$('requestMethodBadge').classList.toggle('post',s.method==='POST');$('requestPreview').textContent=buildRequest(s);$('responsePreview').textContent='// Click “Send Request” to see the response.';$('responseBadge').textContent='Waiting';$('responseBadge').className='status-badge neutral';document.querySelectorAll('.status-card').forEach(el=>el.classList.toggle('selected',el.dataset.status===$('statusSelect').value));}
$('scenarioSelect').addEventListener('change',renderRequest);
$('statusSelect').addEventListener('change',renderRequest);
document.querySelectorAll('.status-card').forEach(btn=>btn.addEventListener('click',()=>{$('statusSelect').value=btn.dataset.status;renderRequest();}));
$('sendHttp').addEventListener('click',async()=>{const s=scenarios[$('scenarioSelect').value],code=$('statusSelect').value;$('sendHttp').disabled=true;$('httpLog').textContent=`→ ${s.method} ${s.path} | Request sent to simulated server...`;await sleep(650);let response,reason,cls;if(code==='200'){response=s.result;reason='OK';cls='success';}else if(code==='404'){response={error:'Not Found',message:'The requested resource could not be found.'};reason='Not Found';cls='warning';}else{response={error:'Internal Server Error',message:'An unexpected problem occurred on the server.'};reason='Internal Server Error';cls='error';}$('responseBadge').textContent=`${code} ${reason}`;$('responseBadge').className='status-badge '+cls;$('responsePreview').textContent=`HTTP/1.1 ${code} ${reason}\nContent-Type: application/json\n\n${JSON.stringify(response,null,2)}`;$('httpLog').textContent=`← ${code} ${reason} | ${s.description}. ${code==='200'?'Request completed successfully.':code==='404'?'The resource was not found.':'The server encountered an internal error.'}`;$('sendHttp').disabled=false;});
renderRequest();

// TOPIC 4: API playground
const apiScenarios={
 weather:{client:'Weather App',service:'Weather Service',data:{city:'Cairo',temperature:28,condition:'Sunny'},html:'<div class="result-big">☀️ 28°C</div><div class="result-sub">Cairo · Sunny</div>',request:'GET /api/weather?city=Cairo'},
 school:{client:'School Results',service:'School Backend',data:{name:'Adam',grade:95,result:'Pass'},html:'<div class="result-big">🎓 95</div><div class="result-sub">Adam · Pass</div>',request:'GET /api/results/adam'}
};
function resetApi(){apiToken++;const s=apiScenarios[$('apiScenario').value];$('apiClientName').textContent=s.client;$('apiServiceName').textContent=s.service;$('apiDisplay').innerHTML='<span class="empty-icon">'+(s===apiScenarios.weather?'🌤️':'🎓')+'</span><p>Click “Call API” to get data.</p>';$('apiJson').textContent='// Waiting for API response...';$('apiLog').textContent='The app is ready to request data through an API.';document.querySelector('.api-flow').classList.remove('running');}
$('apiScenario').addEventListener('change',resetApi);$('resetApi').addEventListener('click',resetApi);
$('callApi').addEventListener('click',async()=>{const token=++apiToken,s=apiScenarios[$('apiScenario').value];$('callApi').disabled=true;document.querySelector('.api-flow').classList.add('running');$('apiLog').textContent=`1 / REQUEST: ${s.client} sends ${s.request} through the API.`;await sleep(900);if(token!==apiToken){$('callApi').disabled=false;return;}$('apiLog').textContent=`2 / PROCESSING: ${s.service} receives the API request and prepares the data.`;await sleep(850);if(token!==apiToken){$('callApi').disabled=false;return;}$('apiJson').textContent=JSON.stringify(s.data,null,2);$('apiLog').textContent='3 / RESPONSE: The service returns structured JSON data through the API.';await sleep(850);if(token!==apiToken){$('callApi').disabled=false;return;}$('apiDisplay').innerHTML=s.html;$('apiLog').textContent='4 / DISPLAY: The app reads the JSON and displays the result to the user.';document.querySelector('.api-flow').classList.remove('running');$('callApi').disabled=false;});
resetApi();
const originalJson=`{
  "name": "Adam",
  "grade": 95,
  "result": "Pass"
}`;
$('validateJson').addEventListener('click',()=>{const feedback=$('jsonFeedback');try{const value=JSON.parse($('jsonEditor').value);if(!value||typeof value!=='object'||Array.isArray(value)){feedback.innerHTML='<div class="feedback-error">⚠️ Valid JSON, but this activity expects an object with name/value pairs.</div>';return;}const keys=Object.keys(value);feedback.innerHTML='<div class="feedback-success">✓ Valid JSON! These are its names and values:</div>'+(keys.length?keys.map(key=>`<div class="key-row"><span>${safe(key)}</span><b>${safe(JSON.stringify(value[key]))}</b></div>`).join(''):'<p>This object is empty. Try adding a key and a value.</p>');}catch(err){feedback.innerHTML=`<div class="feedback-error">✕ Invalid JSON</div><p>${safe(err.message)}</p><p>Hint: Keys and text values need double quotes. Check commas and braces.</p>`;}});
$('breakJson').addEventListener('click',()=>{$('jsonEditor').value='{\n  "name": "Adam"\n  "grade": 95,\n  "result": "Pass"\n}';$('validateJson').click();});
$('fixJson').addEventListener('click',()=>{$('jsonEditor').value=originalJson;$('validateJson').click();});

// FINAL CHALLENGE
const questions=[
 {q:'Who sends a request to a server?',options:['Client','Database','Status code','JSON'],answer:0,why:'The client requests data or processing from the server.'},
 {q:'What does the server do after receiving a request?',options:['Always shuts down','Processes it and sends a response','Only changes the page colors','Deletes the client'],answer:1,why:'The server receives, processes, and responds to client requests.'},
 {q:'What is a protocol?',options:['A type of laptop','A database table','Rules for communication between systems','A video file'],answer:2,why:'A protocol defines rules that systems follow when communicating.'},
 {q:'Which protocol uses TLS encryption?',options:['HTTP','HTTPS','JSON','GET'],answer:1,why:'HTTPS uses TLS to protect data in transit.'},
 {q:'Which HTTP method is used to retrieve data?',options:['POST','500','GET','JSON'],answer:2,why:'GET retrieves information; POST commonly submits data for processing.'},
 {q:'A requested page cannot be found. Which status code fits?',options:['200','404','500','201'],answer:1,why:'404 means Not Found. 500 indicates a server-side error.'},
 {q:'What is the main purpose of an API?',options:['Connect software through a defined interface','Change a screen resolution','Replace all servers','Draw web page backgrounds'],answer:0,why:'An API defines how software systems can request and exchange information.'},
 {q:'In JSON, what is "grade" in {"grade":95}?',options:['A status code','The value','The key (name)','A protocol'],answer:2,why:'"grade" is the key (name); 95 is its numeric value.'}
];
let quizIndex=0,quizSelection=-1,quizChecked=false,quizScore=0;
function renderQuiz(){const q=questions[quizIndex];$('quizCounter').textContent=`QUESTION ${quizIndex+1} / ${questions.length}`;$('quizScore').textContent=`⭐ Score: ${quizScore}`;$('quizProgress').style.width=`${((quizIndex+1)/questions.length)*100}%`;$('quizQuestion').textContent=q.q;$('quizOptions').innerHTML=q.options.map((option,i)=>`<button class="quiz-option" data-index="${i}"><span class="letter">${'ABCD'[i]}</span>${safe(option)}</button>`).join('');$('quizExplanation').textContent='Choose an answer, then click “Check Answer”.';$('quizExplanation').className='quiz-explanation';$('quizCheck').disabled=true;$('quizNext').disabled=true;$('quizNext').textContent=quizIndex===questions.length-1?'See Results 🏆':'Next Question →';document.querySelectorAll('.quiz-option').forEach(btn=>btn.addEventListener('click',()=>{if(quizChecked)return;quizSelection=Number(btn.dataset.index);document.querySelectorAll('.quiz-option').forEach(el=>el.classList.toggle('selected',el===btn));$('quizCheck').disabled=false;}));}
function startQuiz(){quizIndex=0;quizSelection=-1;quizChecked=false;quizScore=0;renderQuiz();}
$('quizCheck').addEventListener('click',()=>{if(quizChecked||quizSelection<0)return;quizChecked=true;const q=questions[quizIndex],correct=quizSelection===q.answer;if(correct)quizScore++;$('quizScore').textContent=`⭐ Score: ${quizScore}`;document.querySelectorAll('.quiz-option').forEach(btn=>{const i=Number(btn.dataset.index);btn.classList.toggle('correct',i===q.answer);btn.classList.toggle('wrong',i===quizSelection&&!correct);});$('quizExplanation').textContent=(correct?'✓ Correct! ':'✕ Not quite. ')+q.why;$('quizExplanation').className='quiz-explanation '+(correct?'correct':'wrong');$('quizCheck').disabled=true;$('quizNext').disabled=false;});
$('quizNext').addEventListener('click',()=>{if(!quizChecked)return;if(quizIndex===questions.length-1){$('quizQuestion').textContent=`🎉 Challenge complete! ${quizScore} / ${questions.length}`;$('quizOptions').innerHTML=`<div style="grid-column:1/-1;font-size:20px;color:#27518b;padding:20px;background:#eff8ff;border-radius:12px">${quizScore===questions.length?'Perfect score! Your class understands all four topics.':'Great effort! Review the topics and try again.'}</div>`;$('quizExplanation').textContent='Use Start Over to play again, or return to any topic for another demo.';$('quizNext').disabled=true;$('quizCheck').disabled=true;return;}quizIndex++;quizSelection=-1;quizChecked=false;renderQuiz();});
$('quizRestart').addEventListener('click',startQuiz);startQuiz();
