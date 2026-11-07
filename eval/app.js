// 미래에셋 바이브코딩 캠프 평가 시스템 — 공통 + 화면별 동작
// 데이터: Firebase Realtime DB (REST). ?demo 이면 이 브라우저 안(localStorage)에서만 저장.
// classes/EVX-{평가id}  평가 본문
// classes/EVC-{코드}    코드 → {ev, role:'expert'|'team', team}
// classes/EV-LIST       {평가id:{title,created}}
// classes/EV-CURRENT    {ev}
const FB_URL='https://geang-invest-default-rtdb.firebaseio.com';
const ADMIN_KEY='hot2026';
let DEMO=new URLSearchParams(location.search).has('demo');
const P={ev:id=>`classes/EVX-${id}`,code:c=>`classes/EVC-${c}`,list:'classes/EV-LIST',cur:'classes/EV-CURRENT'};

// ───── 저장소 ─────
const demoKey='evx_demo_tree';
function dTree(){try{return JSON.parse(localStorage.getItem(demoKey)||'{}')}catch(e){return {}}}
function dSave(t){try{localStorage.setItem(demoKey,JSON.stringify(t))}catch(e){}}
function dWalk(t,p,create){const ks=p.split('/').filter(Boolean);let o=t;for(let i=0;i<ks.length-1;i++){if(o[ks[i]]==null||typeof o[ks[i]]!=='object'){if(!create)return [null,null];o[ks[i]]={};}o=o[ks[i]];}return [o,ks[ks.length-1]];}
async function req(p,method,d){try{const r=await fetch(`${FB_URL}/${p}.json`,method?{method,body:JSON.stringify(d)}:undefined);if(!r.ok)throw 0;$('net-bar')&&($('net-bar').style.display='none');return method?null:await r.json()}catch(e){netFail();throw e}}
const db={
  async get(p){if(!DEMO)return req(p);const [o,k]=dWalk(dTree(),p,false);return o?JSON.parse(JSON.stringify(o[k]??null)):null},
  async set(p,d){if(!DEMO)return req(p,'PUT',d);const t=dTree();const [o,k]=dWalk(t,p,true);if(d==null)delete o[k];else o[k]=JSON.parse(JSON.stringify(d));dSave(t)},
  async update(p,d){if(!DEMO)return req(p,'PATCH',d);const t=dTree();const [o,k]=dWalk(t,p,true);o[k]=Object.assign(o[k]||{},JSON.parse(JSON.stringify(d)));Object.keys(d).forEach(x=>{if(d[x]==null)delete o[k][x]});dSave(t)},
  async del(p){if(!DEMO)return req(p,'DELETE');const t=dTree();const [o,k]=dWalk(t,p,false);if(o)delete o[k];dSave(t)}
};
let _nf=0;
function netFail(){if(Date.now()-_nf<5000)return;_nf=Date.now();const b=$('net-bar');if(b)b.style.display='block'}

// ───── 공통 도구 ─────
const $=id=>document.getElementById(id);
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),2400)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function key(s){return String(s).trim().replace(/[.#$\[\]\/\s]/g,'_')}
function man(n){return Math.round(n).toLocaleString('ko-KR')+'만 원'}
function f1(n){return n==null||isNaN(n)?'—':(Math.round(n*10)/10).toFixed(1)}
function rid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function num4(){return String(Math.floor(1000+Math.random()*9000))}
function ss(k,v){try{if(v===undefined)return JSON.parse(sessionStorage.getItem('evx_'+k+(DEMO?'_d':''))||'null');if(v===null)sessionStorage.removeItem('evx_'+k+(DEMO?'_d':''));else sessionStorage.setItem('evx_'+k+(DEMO?'_d':''),JSON.stringify(v))}catch(e){return null}}
// 같은 평가 시스템 안의 다른 화면 주소 (eval/ 기준)
function evalBase(){const u=new URL(location.href);u.search='';u.hash='';const path=u.pathname;const i=path.lastIndexOf('/eval/');u.pathname=path.slice(0,i+6);return u}
function link(page,params){const u=evalBase();u.pathname+=page?page+'/':'';Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,v));if(DEMO)u.searchParams.set('demo','');return u.toString().replace(/demo=(&|$)/,'demo$1')}
function drawQR(el,text,size){el.innerHTML='';if(window.QRCode){new QRCode(el,{text,width:size,height:size,correctLevel:QRCode.CorrectLevel.M})}else{el.innerHTML=`<div class="tiny" style="width:${size}px">QR을 불러오지 못함<br>주소를 알려 주세요</div>`}}
function wireDemoLinks(){if(!DEMO)return;document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(h.startsWith('http')||h.startsWith('#'))return;a.setAttribute('href',h+(h.includes('?')?'&':'?')+'demo')});const n=$('demo-note');if(n)n.textContent='체험 모드: 이 브라우저 안에서만 저장됨 (다른 기기와 연결되지 않음)'}

// ───── 평가 기준 ─────
const CRIT=[
  {id:'c1',name:'문제정의',max:15,desc:'거래 자산의 매력도 · 문제 정의'},
  {id:'c2',name:'금융투자 반영',max:25,desc:'금융 원칙과 원리 반영'},
  {id:'c3',name:'앱 완성도',max:20,desc:'핵심 기능이 모두 작동하는가'},
  {id:'c4',name:'창의성·독창성',max:20,desc:'다른 팀과 구별되는 우리만의 색깔'},
  {id:'c5',name:'발표력',max:20,desc:'전달력 · 시간 준수 · 팀워크'}
];
const MAXP=10; // 상호평가: 기준마다 팀별 1~10점
const PCRIT_DEFAULT=[
  {id:'k1',name:'팀워크',desc:'역할을 나눠 서로 도우며 함께 만들었는가'},
  {id:'k2',name:'현실 활용 가능성',desc:'만든 서비스를 실제로 쓸 수 있는가'},
  {id:'k3',name:'성실함',desc:'이틀 동안 얼마나 성실하게 참여했는가'}
];
function pcrit(E){const c=E&&E.pcrit;const a=Array.isArray(c)?c:(c?Object.values(c):[]);const f=a.filter(Boolean);return f.length?f:PCRIT_DEFAULT}
function teams(E){return (E&&E.teams)?Object.entries(E.teams).map(([id,t])=>({id,...t})).sort((a,b)=>a.order-b.order):[]}
function tName(E,id){return (E.teams&&E.teams[id]&&E.teams[id].name)||id}

function compute(E){
  const T=teams(E),wE=(E.wE??60)/100,PC=pcrit(E),ex=E.experts||{},pe=E.peers||{};
  const rows=T.map(t=>{
    const sums=Object.values(ex).map(e=>e.scores&&e.scores[t.id]).filter(Boolean).map(s=>CRIT.reduce((a,c)=>a+(+s[c.id]||0),0));
    const expert=sums.length?sums.reduce((a,b)=>a+b,0)/sums.length:null;
    const voters=Object.values(pe).filter(v=>v.team!==t.id&&v.scores&&v.at);
    const by={};PC.forEach(k=>{const l=voters.map(v=>+((v.scores[k.id]||{})[t.id])).filter(x=>x>0);const avg=l.length?l.reduce((a,b)=>a+b,0)/l.length:null;by[k.id]={avg,score:avg==null?null:avg/MAXP*100}});
    return {id:t.id,name:t.name,expert,nExp:sums.length,nVoters:voters.length,by};
  });
  const top={};PC.forEach(k=>{const t=[...rows].filter(r=>r.by[k.id].avg!=null).sort((a,b)=>b.by[k.id].avg-a.by[k.id].avg)[0];top[k.id]=t?t.id:null});
  rows.forEach(r=>{const sc=PC.map(k=>r.by[k.id].score).filter(x=>x!=null);r.peer=sc.length?sc.reduce((a,b)=>a+b,0)/sc.length:null;
    r.final=(r.expert!=null&&r.peer!=null)?r.expert*wE+r.peer*(1-wE):null;r.badges=PC.filter(k=>top[k.id]===r.id).map(k=>k.name+' 1위')});
  return {rows,ranked:[...rows].sort((a,b)=>(b.final??-1)-(a.final??-1)),PC,wE};
}

// ───── 실시간(2초 폴링) ─────
let pollIv=null,lastSig='',E=null,EVID=null;
function watch(evId,render){EVID=evId;clearInterval(pollIv);lastSig='';const tick=async()=>{let e;try{e=await db.get(P.ev(evId))}catch(x){return}if(!e){render(null);return}E=e;const sig=JSON.stringify(e);if(sig===lastSig)return;lastSig=sig;render(e)};tick();pollIv=setInterval(tick,DEMO?800:2000);watch.now=()=>{lastSig='';tick()}}
async function lookup(code){code=String(code||'').trim();if(!/^\d{4}$/.test(code))return null;try{return await db.get(P.code(code))}catch(e){return null}}

// ═════════ 전문가 ═════════
function pageExpert(){
  let me=null,cur=null,draft={};
  const s=ss('expert');if(s&&s.ev){me=s.me;enter(s.ev)}
  const qc=new URLSearchParams(location.search).get('c');if(qc)$('in-code').value=qc;
  $('btn-in').onclick=async()=>{
    const c=$('in-code').value.trim(),nm=$('in-name').value.trim();
    if(nm.length<2)return toast('이름은 2글자 이상');
    const r=await lookup(c);if(!r||r.role!=='expert')return toast('전문가 코드가 맞지 않음');
    const ev=await db.get(P.ev(r.ev));if(!ev)return toast('평가를 찾을 수 없음');
    me=key(nm);if(!(ev.experts&&ev.experts[me]))await db.set(`${P.ev(r.ev)}/experts/${me}`,{name:nm,joined:Date.now(),scores:{}});
    ss('expert',{ev:r.ev,me});enter(r.ev);
  };
  $('btn-out').onclick=()=>{ss('expert',null);location.reload()};
  function enter(ev){$('entry').classList.add('hidden');$('main').classList.remove('hidden');$('btn-out').classList.remove('hidden');watch(ev,render)}
  function render(e){
    if(!e){ss('expert',null);toast('평가가 삭제되었음');return}
    const mine=(e.experts&&e.experts[me])||{scores:{}},T=teams(e),sc=mine.scores||{};
    $('who').textContent=`${e.title||'IR Day'} · ${mine.name||me} 님`;
    $('closed').classList.toggle('hidden',!!e.expertOpen);$('body').classList.toggle('hidden',!e.expertOpen);
    if(!cur||!e.teams[cur])cur=(T.find(t=>!sc[t.id])||T[0]).id;
    $('tabs').innerHTML=T.map(t=>`<button class="tab ${t.id===cur?'active':''} ${sc[t.id]?'done':''}" data-t="${t.id}">${esc(t.name)}</button>`).join('');
    $('tabs').querySelectorAll('.tab').forEach(b=>b.onclick=()=>{cur=b.dataset.t;draft={};watch.now()});
    const saved=sc[cur];const st=$('state');st.className='pill '+(saved?'on':'or');st.textContent=saved?'저장됨 · 고치면 다시 저장':'아직 저장 안 함';
    const ae=document.activeElement;
    if(draft._t===cur&&$('crits').children.length&&ae&&$('body').contains(ae)&&ae.tagName!=='BUTTON')return;
    if(draft._t!==cur){draft={_t:cur};CRIT.forEach(c=>draft[c.id]=saved?+saved[c.id]:Math.round(c.max*0.7));draft.memo=saved?saved.memo||'':''}
    $('tname').textContent=tName(e,cur);
    $('crits').innerHTML=CRIT.map(c=>`<div class="crit"><div class="between"><div><b>${c.name}</b><div class="tiny">${c.desc}</div></div><div class="val"><span id="v-${c.id}">${draft[c.id]}</span><small> / ${c.max}</small></div></div><input type="range" min="0" max="${c.max}" step="1" value="${draft[c.id]}" data-c="${c.id}"></div>`).join('');
    $('crits').querySelectorAll('input[type=range]').forEach(r=>r.oninput=()=>{draft[r.dataset.c]=+r.value;$('v-'+r.dataset.c).textContent=r.value;total()});
    $('memo').value=draft.memo;$('memo').oninput=x=>draft.memo=x.target.value;total();
  }
  function total(){$('total').textContent=CRIT.reduce((a,c)=>a+(+draft[c.id]||0),0)}
  $('btn-save').onclick=async()=>{
    if(!E.expertOpen)return toast('전문가 평가가 닫혀 있음');
    const s={at:Date.now(),memo:(draft.memo||'').slice(0,200)};CRIT.forEach(c=>s[c.id]=+draft[c.id]||0);
    await db.set(`${P.ev(EVID)}/experts/${me}/scores/${cur}`,s);
    toast(`${tName(E,cur)} 저장 (${CRIT.reduce((a,c)=>a+s[c.id],0)}점)`);
    const sc=Object.assign({},(E.experts[me]||{}).scores,{[cur]:s});const nx=teams(E).find(t=>!sc[t.id]);if(nx){cur=nx.id;draft={}}
    window.scrollTo(0,0);watch.now();
  };
}

// ═════════ 팀 상호평가 ═════════
function pageTeam(){
  let me=null,myTeam=null,pk=null,pd=null,dirty=false;
  const s=ss('team');if(s&&s.ev){me=s.me;myTeam=s.team;enter(s.ev)}
  const qc=new URLSearchParams(location.search).get('c');if(qc){$('in-code').value=qc;peek()}
  $('in-code').oninput=peek;
  async function peek(){const r=await lookup($('in-code').value);const el=$('peek');if(!r||r.role!=='team'){el.textContent='';return}const ev=await db.get(P.ev(r.ev));el.innerHTML=ev?`우리 팀: <b>${esc(tName(ev,r.team))}</b>`:''}
  $('btn-in').onclick=async()=>{
    const nk=$('in-nick').value.trim();if(!nk)return toast('별명을 입력');
    const r=await lookup($('in-code').value);if(!r||r.role!=='team')return toast('팀 코드가 맞지 않음');
    const ev=await db.get(P.ev(r.ev));if(!ev)return toast('평가를 찾을 수 없음');
    if(!confirm(`우리 팀이 「${tName(ev,r.team)}」 맞나요?\n\n우리 팀은 평가할 수 없어요.`))return;
    me=key(r.team+'_'+nk);myTeam=r.team;
    if(!(ev.peers&&ev.peers[me]))await db.set(`${P.ev(r.ev)}/peers/${me}`,{team:r.team,nick:nk,joined:Date.now()});
    ss('team',{ev:r.ev,me,team:r.team});enter(r.ev);
  };
  $('btn-out').onclick=()=>{ss('team',null);location.reload()};
  function enter(ev){$('entry').classList.add('hidden');$('main').classList.remove('hidden');$('btn-out').classList.remove('hidden');watch(ev,render)}
  function render(e){
    if(!e){ss('team',null);toast('평가가 삭제되었음');return}
    const mine=(e.peers&&e.peers[me])||{},T=teams(e).filter(t=>t.id!==myTeam),PC=pcrit(e);
    $('who').textContent=`${e.title||'IR Day'} · ${tName(e,myTeam)} · ${mine.nick||''}`;
    const open=!!e.peerOpen;$('wait').classList.toggle('hidden',open);$('body').classList.toggle('hidden',!open);
    if(!open){
      $('wait-t').textContent=mine.at?'평가 완료! 고마워요':'아직 평가 시간이 아님';
      $('wait-s').textContent=mine.at?'평가가 닫혔음 · 결과는 큰 화면에서 함께 봐요':'발표가 모두 끝나면 열려요 · 이 화면을 켜 두면 자동으로 바뀜';return;
    }
    if(!pd){pd={sc:{},praise:{}};PC.forEach(k=>{pd.sc[k.id]={};T.forEach(t=>pd.sc[k.id][t.id]=mine.at?+(((mine.scores||{})[k.id]||{})[t.id])||0:0)});T.forEach(t=>pd.praise[t.id]=(mine.praise||{})[t.id]||'')}
    if(!pk||!(PC.some(k=>k.id===pk)||pk==='praise'))pk=PC[0].id;
    if(dirty&&$('teams').children.length&&$('teams').dataset.k===pk)return sum();
    $('myteam').innerHTML=`우리 팀 <b>${esc(tName(e,myTeam))}</b>은 목록에 없음 · 우리 팀은 평가할 수 없어요`;
    const done=k=>T.every(t=>(pd.sc[k]||{})[t.id]>0);
    $('ptabs').innerHTML=PC.map((k,i)=>`<button class="tab ${pk===k.id?'active':''} ${done(k.id)?'done':''}" data-k="${k.id}">${i+1}. ${esc(k.name)}</button>`).join('')+`<button class="tab ${pk==='praise'?'active':''}" data-k="praise">칭찬 한 줄</button>`;
    $('ptabs').querySelectorAll('.tab').forEach(b=>b.onclick=()=>{pk=b.dataset.k;$('teams').innerHTML='';watch.now()});
    $('teams').dataset.k=pk;const isP=pk==='praise',K=PC.find(k=>k.id===pk),ix=PC.findIndex(k=>k.id===pk);
    $('cdesc').innerHTML=isP?'<b>칭찬 한 줄 (선택)</b><div class="sub" style="margin-top:4px">팀마다 좋았던 점을 짧게 남겨요</div>':`<b>${esc(K.name)}</b><div class="sub" style="margin-top:4px">${esc(K.desc||'')}</div><div class="tiny" style="margin-top:6px">팀마다 1~10점을 눌러 주세요 · 10점이 가장 좋음</div>`;
    $('rlabel').style.visibility=isP?'hidden':'visible';$('btn-next').classList.toggle('hidden',isP);$('btn-next').textContent=ix<PC.length-1?'다음 기준':'칭찬 쓰기';
    if(isP){
      $('teams').innerHTML=T.map(t=>`<div class="team-card"><h2 style="margin:0 0 8px">${esc(t.name)}</h2><input id="pr-${t.id}" maxlength="60" placeholder="칭찬 한 줄 (선택)" value="${esc(pd.praise[t.id])}" style="margin:0"></div>`).join('');
      $('teams').querySelectorAll('input[id^=pr-]').forEach(i=>i.oninput=()=>{pd.praise[i.id.slice(3)]=i.value;dirty=true});
    }else{
      const A=pd.sc[pk];
      $('teams').innerHTML=T.map(t=>`<div class="team-card ${A[t.id]>0?'full':''}" id="tc-${t.id}"><div class="between"><h2 style="margin:0">${esc(t.name)}</h2><span class="pscore" id="ps-${t.id}">${A[t.id]>0?A[t.id]+'점':'—'}</span></div><div class="nums" data-t="${t.id}">${Array.from({length:MAXP},(_,i)=>`<button class="num ${A[t.id]===i+1?'on':''}" data-n="${i+1}">${i+1}</button>`).join('')}</div></div>`).join('');
      $('teams').querySelectorAll('.nums').forEach(g=>g.querySelectorAll('.num').forEach(b=>b.onclick=()=>{const t=g.dataset.t;A[t]=+b.dataset.n;g.querySelectorAll('.num').forEach(x=>x.classList.toggle('on',x===b));$('ps-'+t).textContent=A[t]+'점';$('tc-'+t).classList.add('full');dirty=true;sum()}));
    }
    $('saved').textContent=mine.at?'이미 제출했음 · 평가가 열려 있는 동안 고쳐서 다시 제출할 수 있음':'';sum();
  }
  function sum(){if(pk==='praise')return;const A=pd.sc[pk]||{},ids=Object.keys(A),n=ids.filter(t=>A[t]>0).length,el=$('remain');
    el.textContent=`${n} / ${ids.length}팀`;el.className='remain '+(n===ids.length?'zero':'');const tb=$('ptabs').querySelector(`[data-k="${pk}"]`);if(tb)tb.classList.toggle('done',n===ids.length)}
  $('btn-next').onclick=()=>{const PC=pcrit(E),ix=PC.findIndex(k=>k.id===pk);pk=ix<PC.length-1?PC[ix+1].id:'praise';$('teams').innerHTML='';window.scrollTo(0,0);watch.now()};
  $('btn-save').onclick=async()=>{
    if(!E.peerOpen)return toast('평가가 닫혀 있음');
    const PC=pcrit(E),T=teams(E).filter(t=>t.id!==myTeam).map(t=>t.id);
    for(const k of PC){const A=pd.sc[k.id]||{},miss=T.filter(t=>!(A[t]>=1&&A[t]<=MAXP));
      if(miss.length){pk=k.id;$('teams').innerHTML='';watch.now();return toast(`「${k.name}」 ${miss.map(t=>tName(E,t)).join(', ')} 점수를 눌러 주세요`)}}
    const scores={};PC.forEach(k=>{scores[k.id]={};T.forEach(t=>scores[k.id][t]=+pd.sc[k.id][t])});
    const praise={};Object.entries(pd.praise).forEach(([t,v])=>{if(t!==myTeam&&v&&v.trim())praise[t]=v.trim().slice(0,60)});
    await db.update(`${P.ev(EVID)}/peers/${me}`,{scores,praise,alloc:null,at:Date.now()});dirty=false;toast('평가 제출!');watch.now();
  };
}

// ═════════ 결과 큰 화면 ═════════
async function pageResults(){
  const q=new URLSearchParams(location.search);let ev=q.get('e');
  if(!ev&&q.get('c')){const r=await lookup(q.get('c'));if(r)ev=r.ev}
  if(!ev){const c=await db.get(P.cur).catch(()=>null);if(c&&c.ev)ev=c.ev}
  if(!ev){$('b-title').textContent='아직 진행 중인 평가가 없음';$('b-sub').textContent='관리자 화면에서 평가를 만들어 주세요';return}
  let qrDone='';
  watch(ev,e=>{
    if(!e){$('b-title').textContent='평가를 찾을 수 없음';return}
    const R=compute(e),T=teams(e),rv=e.reveal||'hidden',pe=Object.values(e.peers||{}),ex=Object.values(e.experts||{});
    $('b-title').textContent=(e.title||'IR Day')+' · 평가';
    $('live').classList.toggle('hidden',rv!=='hidden');$('rank').classList.toggle('hidden',rv==='hidden');
    if(rv==='hidden'){
      $('b-sub').textContent=e.peerOpen?`팀 상호평가 · ${R.PC.map(k=>k.name).join(' · ')} · 제출 ${pe.filter(p=>p.at).length}명`:`전문가 평가 진행 중 · 전문가 ${ex.length}명`;
      $('bteams').innerHTML=T.map(t=>{const d=pe.filter(p=>p.team===t.id&&p.at).length,a=pe.filter(p=>p.team===t.id).length,es=ex.filter(x=>x.scores&&x.scores[t.id]).length;
        return `<div class="bteam"><b>${esc(t.name)}</b>${e.peerOpen?`<div class="bn">제출 ${d} / ${a}명</div><div class="bar"><i style="width:${a?d/a*100:0}%"></i></div>`:`<div class="bn">전문가 채점 ${es} / ${ex.length}명</div><div class="bar"><i style="width:${ex.length?es/ex.length*100:0}%"></i></div>`}</div>`}).join('');
      $('bqr').classList.toggle('hidden',!e.peerOpen);
      const l=link('team');if(qrDone!==l){drawQR($('qr'),l,Math.min(280,Math.round(innerHeight*.36)));qrDone=l}
      $('qrt').innerHTML=`팀 상호평가<br>책상 위 <b>팀 코드</b>로 입장`;return;
    }
    $('b-sub').textContent=`전문가 ${Math.round(R.wE*100)}% + 다른 팀 ${Math.round(100-R.wE*100)}%`;
    const list=R.ranked.filter(r=>r.final!=null).slice(0,rv==='top3'?3:99);
    $('rank').innerHTML=list.length?list.map((r,i)=>`<div class="rank" style="animation-delay:${i*.12}s"><div class="no">${i+1}</div><div><div class="nm">${esc(r.name)}${r.badges.map(b=>`<span class="award">${esc(b)}</span>`).join('')}</div><div class="dt">전문가 ${f1(r.expert)} · 다른 팀 ${f1(r.peer)} · ${R.PC.map(k=>esc(k.name)+' '+f1(r.by[k.id].avg)+'점').join(' · ')}</div></div><div class="sc">${f1(r.final)}</div></div>`).join(''):'<p class="bs">아직 계산할 점수가 없음</p>';
  });
}

// ═════════ 관리자 ═════════
function pageAdmin(){
  if(ss('admin')){showList()}
  $('btn-auth').onclick=()=>{if($('in-key').value.trim()!==ADMIN_KEY)return toast('인증코드가 맞지 않음');ss('admin',true);showList()};
  $('btn-out').onclick=()=>{ss('admin',null);ss('adminEv',null);location.reload()};
  async function uniqueCode(taken){for(let i=0;i<30;i++){const c=num4();if(taken.has(c))continue;if(!(await db.get(P.code(c))))return c}throw new Error('코드 생성 실패')}
  async function showList(){
    clearInterval(pollIv);$('auth').classList.add('hidden');$('manage').classList.add('hidden');$('list').classList.remove('hidden');$('btn-out').classList.remove('hidden');
    $('hero-sub').textContent='관리자';
    const [L,C]=await Promise.all([db.get(P.list).catch(()=>null),db.get(P.cur).catch(()=>null)]);
    const arr=Object.entries(L||{}).map(([id,v])=>({id,...v})).sort((a,b)=>b.created-a.created);
    $('evlist').innerHTML=arr.length?`<table>${arr.map(v=>`<tr><td class="l"><b>${esc(v.title)}</b> ${C&&C.ev===v.id?'<span class="pill nv">현재 평가</span>':''}<div class="tiny">${new Date(v.created).toLocaleString('ko-KR')}</div></td><td style="width:220px"><div class="row" style="justify-content:flex-end">${C&&C.ev===v.id?'':`<button class="btn btn-s sm" data-cur="${v.id}">현재로 지정</button>`}<button class="btn btn-p sm" data-open="${v.id}">관리</button></div></td></tr>`).join('')}</table>`:'<p class="sub">아직 만든 평가가 없음</p>';
    $('evlist').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openEv(b.dataset.open));
    $('evlist').querySelectorAll('[data-cur]').forEach(b=>b.onclick=async()=>{await db.set(P.cur,{ev:b.dataset.cur});toast('현재 평가로 지정');showList()});
    const last=ss('adminEv');if(last&&arr.some(v=>v.id===last))openEv(last);
  }
  $('btn-create').onclick=async()=>{
    const title=$('in-title').value.trim()||'IR Day';const names=$('in-teams').value.split('\n').map(x=>x.trim()).filter(Boolean);
    if(names.length<2)return toast('팀은 2개 이상');
    $('btn-create').disabled=true;
    try{
      const id=rid(),taken=new Set(),T={};const ec=await uniqueCode(taken);taken.add(ec);
      for(let i=0;i<names.length;i++){const c=await uniqueCode(taken);taken.add(c);T['t'+(i+1)]={name:names[i],order:i,code:c}}
      await db.set(P.ev(id),{id,title,created:Date.now(),teams:T,expertCode:ec,expertOpen:true,peerOpen:false,reveal:'hidden',wE:60,pcrit:PCRIT_DEFAULT});
      await db.set(P.code(ec),{ev:id,role:'expert'});
      for(const [tid,t] of Object.entries(T))await db.set(P.code(t.code),{ev:id,role:'team',team:tid});
      await db.update(P.list,{[id]:{title,created:Date.now()}});
      const C=await db.get(P.cur);if(!C||!C.ev)await db.set(P.cur,{ev:id});
      toast('평가를 만들었음');openEv(id);
    }catch(e){toast('만들지 못함. 인터넷 연결을 확인해 주세요')}
    $('btn-create').disabled=false;
  };
  function openEv(id){ss('adminEv',id);$('list').classList.add('hidden');$('manage').classList.remove('hidden');window.scrollTo(0,0);watch(id,render)}
  $('btn-back').onclick=()=>{ss('adminEv',null);showList()};
  document.querySelectorAll('#mtabs .tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('#mtabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.querySelectorAll('#manage .pane').forEach(p=>p.classList.remove('active'));$(t.dataset.p).classList.add('active')});
  const U=patch=>db.update(P.ev(EVID),patch).then(()=>watch.now());
  $('tg-expert').onclick=()=>U({expertOpen:!E.expertOpen});
  $('tg-peer').onclick=()=>U({peerOpen:!E.peerOpen});
  document.querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>U({reveal:b.dataset.rv}));
  $('btn-results').onclick=()=>window.open(link('results',{e:EVID}),'_blank');
  $('btn-print').onclick=()=>{window.print()};
  $('btn-sw').onclick=()=>{U({wE:Math.max(0,Math.min(100,+$('s-we').value||0))});toast('비율 저장')};
  $('btn-steams').onclick=()=>{const T={};teams(E).forEach(t=>T[t.id]={name:$('sn-'+t.id).value.trim()||t.name,order:t.order,code:t.code});U({teams:T});toast('팀 이름 저장')};
  $('btn-spcrit').onclick=()=>{const L=$('s-pcrit').value.split('\n').map(x=>x.trim()).filter(Boolean).map((x,i)=>{const [n,...d]=x.split('|');return {id:'k'+(i+1),name:n.trim(),desc:d.join('|').trim()}}).filter(x=>x.name);
    if(L.length<2||L.length>5)return toast('기준은 2~5개');if(Object.values(E.peers||{}).some(p=>p.at)&&!confirm('이미 제출한 학생이 있어요. 기준을 바꾸면 다시 제출해야 할 수 있어요. 바꿀까요?'))return;U({pcrit:L});toast('기준 저장')};
  $('btn-del-ev').onclick=async()=>{if(!confirm(`「${E.title}」 평가와 모든 점수를 지울까요? 되돌릴 수 없어요.`))return;if(prompt('지우려면 "삭제"라고 입력')!=='삭제')return;
    clearInterval(pollIv);await db.del(P.code(E.expertCode));for(const t of teams(E))if(t.code)await db.del(P.code(t.code));await db.del(`${P.list}/${EVID}`);const C=await db.get(P.cur);if(C&&C.ev===EVID)await db.del(P.cur);await db.del(P.ev(EVID));ss('adminEv',null);toast('지웠음');showList()};
  window.delItem=async(p,label)=>{if(!confirm(label+' 제출을 지울까요?'))return;await db.del(`${P.ev(EVID)}/${p}`);toast('지움');watch.now()};
  window.csv=kind=>{const R=compute(E),rows=[];
    if(kind==='final'){rows.push(['순위','팀','전문가 평균','전문가 수','투자한 학생 수',...R.PC.map(k=>k.name+' 평균(10점)'),'상호평가','최종','기준별 1위']);R.ranked.forEach((r,i)=>rows.push([r.final!=null?i+1:'',r.name,f1(r.expert),r.nExp,r.nVoters,...R.PC.map(k=>f1(r.by[k.id].avg)),f1(r.peer),f1(r.final),r.badges.join(' · ')]))}
    if(kind==='expert'){rows.push(['전문가','팀',...CRIT.map(c=>`${c.name}(${c.max})`),'합계','의견']);Object.values(E.experts||{}).forEach(x=>teams(E).forEach(t=>{const s=x.scores&&x.scores[t.id];if(s)rows.push([x.name,t.name,...CRIT.map(c=>s[c.id]),CRIT.reduce((a,c)=>a+(+s[c.id]||0),0),s.memo||''])}))}
    if(kind==='peer'){rows.push(['평가한 학생 팀','별명','평가받은 팀',...R.PC.map(k=>k.name+'(10점)'),'칭찬']);Object.values(E.peers||{}).filter(p=>p.at).forEach(p=>teams(E).filter(t=>t.id!==p.team).forEach(t=>rows.push([tName(E,p.team),p.nick,t.name,...R.PC.map(k=>((p.scores||{})[k.id]||{})[t.id]||''),(p.praise||{})[t.id]||''])))}
    const body='﻿'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'text/csv'}));a.download=`평가_${{final:'최종',expert:'전문가',peer:'상호평가'}[kind]}_${E.title}.csv`;a.click()};
  let printSig='';
  function render(e){
    if(!e){ss('adminEv',null);showList();return}
    const T=teams(e),R=compute(e),ex=Object.entries(e.experts||{}),pe=Object.entries(e.peers||{});
    $('hero-sub').textContent=e.title;$('m-title').textContent=e.title;$('m-ecode').textContent=e.expertCode;
    const pill=(id,on)=>{$(id).className='pill '+(on?'on':'off');$(id).textContent=on?'열림':'닫힘'};
    pill('st-expert',e.expertOpen);pill('st-peer',e.peerOpen);$('tg-expert').textContent=e.expertOpen?'닫기':'열기';$('tg-peer').textContent=e.peerOpen?'닫기':'열기';
    $('st-reveal').className='pill '+((e.reveal||'hidden')==='hidden'?'':'or');$('st-reveal').textContent={hidden:'숨김',top3:'1~3위 공개',all:'전체 공개'}[e.reveal||'hidden'];
    $('codes').innerHTML=`<table><tr><th class="l">구분</th><th>코드</th><th class="l">입장 주소</th></tr><tr><td class="l"><b>전문가</b> (모두 같은 코드)</td><td><span class="codebig">${e.expertCode}</span></td><td class="l tiny">${esc(link('expert'))}</td></tr>${T.map(t=>`<tr><td class="l"><b>${esc(t.name)}</b></td><td><span class="codebig">${t.code}</span></td><td class="l tiny">${esc(link('team',{c:t.code}))}</td></tr>`).join('')}</table>`;
    const ps=JSON.stringify(T.map(t=>[t.name,t.code]))+e.expertCode;
    if(ps!==printSig){printSig=ps;$('print-area').innerHTML=T.map(t=>`<div class="pcard"><div class="pn">${esc(t.name)}</div><div class="tiny" style="font-size:18px;margin-top:8px">팀 상호평가 · 팀 코드</div><div class="pc">${t.code}</div><div class="pq" id="pq-${t.id}"></div><div class="pu">${esc(link('team',{c:t.code}))}</div></div>`).join('')+`<div class="pcard"><div class="pn">전문가 평가</div><div class="tiny" style="font-size:18px;margin-top:8px">전문가 코드</div><div class="pc">${e.expertCode}</div><div class="pq" id="pq-ex"></div><div class="pu">${esc(link('expert'))}</div></div>`;
      T.forEach(t=>drawQR($('pq-'+t.id),link('team',{c:t.code}),200));drawQR($('pq-ex'),link('expert',{c:e.expertCode}),200)}
    $('ematrix').innerHTML=ex.length?`<div style="overflow-x:auto"><table><tr><th class="l">전문가</th>${T.map(t=>`<th>${esc(t.name)}</th>`).join('')}</tr>${ex.map(([k,x])=>`<tr><td class="l">${esc(x.name)}</td>${T.map(t=>{const s=x.scores&&x.scores[t.id];return `<td>${s?'<b>'+CRIT.reduce((a,c)=>a+(+s[c.id]||0),0)+'</b>':'<span class="tiny">—</span>'}</td>`}).join('')}</tr>`).join('')}</table></div>`:`<p class="sub">아직 들어온 전문가가 없음 · 전문가 코드 <b>${e.expertCode}</b></p>`;
    const P2=pe.map(([k,p])=>({k,...p}));
    $('pstat').innerHTML=`<table><tr><th class="l">팀</th><th>입장</th><th>제출 완료</th><th class="l">별명</th></tr>${T.map(t=>{const a=P2.filter(p=>p.team===t.id),d=a.filter(p=>p.at);return `<tr><td class="l"><b>${esc(t.name)}</b></td><td>${a.length}</td><td>${d.length}</td><td class="l"><div class="chips">${a.map(p=>`<span class="chip ${p.at?'ok':''}">${esc(p.nick)}</span>`).join('')}</div></td></tr>`}).join('')}</table><p class="tiny" style="margin-top:8px">전체 ${P2.filter(p=>p.at).length} / ${P2.length}명 완료</p>`;
    $('result').innerHTML=`<table><tr><th>순위</th><th class="l">팀</th><th>전문가 평균<br><span class="tiny">(채점 인원)</span></th>${R.PC.map(k=>`<th>${esc(k.name)}<br><span class="tiny">평균 (10점)</span></th>`).join('')}<th>상호평가</th><th>최종</th></tr>${R.ranked.map((r,i)=>`<tr><td><b>${r.final!=null?i+1:'—'}</b></td><td class="l"><b>${esc(r.name)}</b>${r.badges.map(b=>` <span class="pill or">${esc(b)}</span>`).join('')}</td><td>${f1(r.expert)} <span class="tiny">(${r.nExp})</span></td>${R.PC.map(k=>`<td>${f1(r.by[k.id].avg)}</td>`).join('')}<td>${f1(r.peer)} <span class="tiny">(${r.nVoters}명)</span></td><td><b>${f1(r.final)}</b></td></tr>`).join('')}</table>`;
    $('formula').textContent=`최종 = 전문가 평균 × ${Math.round(R.wE*100)}% + 상호평가 × ${Math.round(100-R.wE*100)}% · 상호평가 = 다른 팀 학생들이 준 기준별 점수(1~10점) 평균 ÷ 10 × 100, 기준 여러 개는 평균 · 학생은 우리 팀을 평가하지 못함 · 전문가 점수나 상호평가가 없으면 최종 점수를 내지 않음`;
    const pr=[];P2.forEach(p=>Object.entries(p.praise||{}).forEach(([t,v])=>pr.push({t,v,from:tName(e,p.team)})));
    $('praise').innerHTML=pr.length?T.map(t=>{const l=pr.filter(x=>x.t===t.id);return l.length?`<h3 style="margin-top:8px">${esc(t.name)}</h3><ul style="margin:0 0 8px 18px">${l.map(x=>`<li class="sub">${esc(x.v)} <span class="tiny">· ${esc(x.from)}</span></li>`).join('')}</ul>`:''}).join(''):'<p class="sub">아직 없음</p>';
    if(document.activeElement!==$('s-we'))$('s-we').value=e.wE??60;
    if(document.activeElement!==$('s-pcrit'))$('s-pcrit').value=pcrit(e).map(k=>k.name+(k.desc?' | '+k.desc:'')).join('\n');
    if(!$('s-teams').contains(document.activeElement))$('s-teams').innerHTML=T.map(t=>`<div class="row" style="flex-wrap:nowrap"><input id="sn-${t.id}" value="${esc(t.name)}"><span class="tiny" style="white-space:nowrap;margin-bottom:10px">코드 ${t.code}</span></div>`).join('');
    $('s-del').innerHTML=`<h3>전문가</h3>${ex.map(([k,x])=>`<div class="between" style="padding:6px 0;border-bottom:1px solid #e9eef5"><span>${esc(x.name)}</span><button class="btn btn-s sm" onclick="delItem('experts/${k}','${esc(x.name).replace(/'/g,'')}')">지우기</button></div>`).join('')||'<p class="tiny">없음</p>'}<h3 style="margin-top:14px">학생</h3>${P2.map(p=>`<div class="between" style="padding:6px 0;border-bottom:1px solid #e9eef5"><span>${esc(tName(e,p.team))} · ${esc(p.nick)} ${p.at?'<span class="pill on">완료</span>':''}</span><button class="btn btn-s sm" onclick="delItem('peers/${p.k}','${esc(p.nick).replace(/'/g,'')}')">지우기</button></div>`).join('')||'<p class="tiny">없음</p>'}`;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  wireDemoLinks();
  const pg=document.body.dataset.page;
  ({expert:pageExpert,team:pageTeam,results:pageResults,admin:pageAdmin}[pg]||(()=>{}))();
});
