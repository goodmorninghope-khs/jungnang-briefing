/* 중랑브리핑 시범판 · 정적 단일 페이지 (해시 라우팅) */
(function(){
const B = window.BRIEF, $ = s => document.querySelector(s), app = $('#app');
const VIS = {1:'① 희망찬 미래 교육도시',2:'② 경제·도시개발',3:'③ 동북권 교통거점',4:'④ 주거환경 개선',5:'⑤ 함께 즐기는 문화',6:'⑥ 더불어 따뜻한 복지',7:'⑦ 걷기 좋은 도시'};
const MEDIA = 'https://jungnang-media.vercel.app/';
const DOW = ['일','월','화','수','목','금','토'];
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kst = () => { const d = new Date(Date.now() + 9*3600e3); return d.toISOString().slice(0,10); };
const TODAY = kst();
const fmt = d => { const [y,m,dd] = d.split('-').map(Number); const w = new Date(Date.UTC(y,m-1,dd)).getUTCDay(); return `${y}.${String(m).padStart(2,'0')}.${String(dd).padStart(2,'0')} (${DOW[w]})`; };
const circ = n => '①②③④⑤⑥⑦⑧⑨⑩'[n-1] || n;
const byId = id => B.articles.find(a => a.id === id);
const arts = d => B.articles.filter(a => a.date === d).sort((a,b) => (b.lead?1:0)-(a.lead?1:0));
/* 상태는 오늘 날짜로 다시 계산: 기한이 지나면 마감·종료로 바뀐다 */
const live = s => { if (!s.until || s.until >= TODAY) return s.s; return s.s === '모집' ? '마감' : (s.s === '진행' || s.s === '예정') ? '종료' : s.s; };
const stBadges = a => a.status.map(s => `<span class="st ${live(s)}">${live(s)}</span>`).filter((v,i,arr)=>arr.indexOf(v)===i).join('');
const visTags = a => a.vision.map(v => `<a class="vis" href="${MEDIA}#/pledge" target="_blank" rel="noopener" title="중랑정책미디어 공약 서가">${VIS[v]}</a>`).join('') + (a.ax ? '<span class="vis">AX 공통 실행수단</span>' : '');

/* 원문 대조: 기사 속 숫자·따옴표 고유명사가 원문(제목·본문·등록일)에 있는지 확인 */
function check(a){
  const n = s => s.replace(/,/g,''), sp = s => s.replace(/\s+/g,'');
  const corpus = a.src.title + ' ' + a.src.body + ' ' + a.src.reg;
  const all = [a.title,a.dek,a.lede,...a.nums.flat(),...a.blocks.flatMap(b=>b[1]),a.said,...(a.act||[]).flat(),...a.status.map(s=>s.t)].join(' ');
  const nums = [...new Set(n(all).match(/\d+(?:\.\d+)?/g) || [])];
  const nMiss = nums.filter(x => !n(corpus).includes(x));
  const qs = [...new Set([...all.matchAll(/[‘“「]([^’”」]+)[’”」]/g)].map(m=>m[1]))];
  const qMiss = qs.filter(q => !sp(corpus).includes(sp(q)));
  return {nums, nMiss, qs, qMiss};
}

function nav(){
  const h = location.hash || '#/';
  document.querySelectorAll('.nav a[data-r]').forEach(a => a.classList.toggle('on', h === a.getAttribute('href') || (a.dataset.r==='today' && (h==='#/'||h.startsWith('#/e/')||h.startsWith('#/a/')))));
}

function edition(d){
  const eds = B.editions, i = eds.findIndex(e => e.date === d), ed = eds[i];
  if (!ed) return `<p>해당 날짜 판이 없습니다.</p>`;
  const list = arts(d), lead = list[0], rest = list.slice(1);
  const ph = lead.photos[0];
  const upcoming = upcomingItems().slice(0,5);
  return `
  <div class="edbar">
    <a class="btn" ${eds[i+1]?`href="#/e/${eds[i+1].date}"`:'aria-disabled="true" style="opacity:.35;pointer-events:none"'}>← 이전 판</a>
    <span class="t">시범판 ${circ(ed.no)} · ${fmt(d)} 판 · 보도자료 ${list.length}건</span>
    <a class="btn" ${i>0?`href="#/e/${eds[i-1].date}"`:'aria-disabled="true" style="opacity:.35;pointer-events:none"'}>다음 판 →</a>
  </div>
  <div class="front">
    <article class="leadArt">
      ${ph?`<a class="ph" href="#/a/${lead.id}"><img src="img/${ph[0]}" alt="${esc(ph[1])}"></a>`:''}
      <div class="in">
        <div class="eyebrow">머리기사 · ${esc(lead.sec)}</div>
        <h1><a href="#/a/${lead.id}">${esc(lead.title)}</a></h1>
        <p class="dek">${esc(lead.dek)}</p>
        <div>${stBadges(lead)} ${visTags(lead)}</div>
        ${lead.nums.length?`<div class="nums">${lead.nums.map(x=>`<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}
        <p>${esc(lead.lede)}</p>
        <a class="btn" href="#/a/${lead.id}">기사 전문과 원문 대조 보기</a>
      </div>
    </article>
    <aside class="side">
      <div class="box"><h3>오늘의 숫자</h3><div class="bignum">${esc(ed.num[0])}</div><p class="muted" style="margin:4px 0 0;font-size:14px">${esc(ed.num[1])} · <a href="#/a/${ed.ref}">기사</a></p></div>
      <div class="box"><h3>다가오는 일정 · 약속 달력</h3>${upcoming.length?`<ul class="cal">${upcoming.map(u=>`<li><span class="d">${esc(u.label)}</span>${esc(u.t)} <a href="#/a/${u.id}">›</a></li>`).join('')}</ul>`:'<p class="muted">등록된 일정이 없습니다.</p>'}<p style="margin:6px 0 0"><a href="#/next">전체 달력 →</a></p></div>
      <div class="box"><h3>이 판을 읽는 법</h3><p style="margin:0;font-size:14px" class="muted">원문 보도자료의 사실만 다시 엮었습니다. 숫자와 이름은 원문과 자동으로 대조하고, 해석·평가는 넣지 않습니다. 상태 표시(완료·진행·예정·모집)는 오늘 날짜 기준으로 바뀝니다.</p></div>
    </aside>
  </div>
  ${rest.length?`<h2 class="sec">단신 <span class="en">BRIEFS</span></h2><div class="briefs">${rest.map(card).join('')}</div>`:''}
  <div class="srcList"><b>이 판의 원료 · 중랑구청 보도자료 원문</b><ul>${list.map(a=>`<li><a href="${a.src.url}" target="_blank" rel="noopener">${esc(a.src.title)}</a> <span class="muted">· ${esc(a.src.dept)} · ${esc(a.src.reg.slice(11,16))} 등록</span></li>`).join('')}</ul></div>`;
}

function card(a){
  const ph = a.photos[0];
  return `<article class="card">${ph?`<a class="ph" href="#/a/${a.id}"><img src="img/${ph[0]}" alt="${esc(ph[1])}" loading="lazy"></a>`:''}
  <div class="in"><div class="eyebrow">${esc(a.sec)} · ${fmt(a.date)}</div><h3><a href="#/a/${a.id}">${esc(a.title)}</a></h3><div>${stBadges(a)}</div><p>${esc(a.dek)}</p></div></article>`;
}

function article(id){
  const a = byId(id); if (!a) return '<p>기사를 찾을 수 없습니다.</p>';
  const c = check(a), ok = !c.nMiss.length && !c.qMiss.length;
  const ed = B.editions.find(e => e.date === a.date);
  return `<div class="art"><div>
    <div class="eyebrow">${esc(a.sec)} · 시범판 ${circ(ed.no)} ${fmt(a.date)}</div>
    <h1>${esc(a.title)}</h1>
    <p class="dek">${esc(a.dek)}</p>
    <div class="meta">${stBadges(a)} ${visTags(a)}<br>원료 보도자료 등록 ${esc(a.src.reg)} · 변환 시범판(Aside) · 사실 출처는 모두 아래 원문</div>
    ${a.photos[0]?`<figure><img src="img/${a.photos[0][0]}" alt="${esc(a.photos[0][1])}"><figcaption>${esc(a.photos[0][1])} · 사진 중랑구 제공(공공누리 제1유형)</figcaption></figure>`:''}
    <p class="lede">${esc(a.lede)}</p>
    ${a.nums.length?`<div class="nums">${a.nums.map(x=>`<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')}</div>`:''}
    ${a.act?`<div class="act"><h4>주민이 알아 둘 것</h4><dl>${a.act.map(x=>`<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></div>`:''}
    ${a.blocks.map(b=>`<h4>${esc(b[0])}</h4>${b[1].map(p=>`<p>${esc(p)}</p>`).join('')}`).join('')}
    <h4>진행 상태</h4><ul class="track">${a.status.map(s=>`<li><span class="st ${live(s)}">${live(s)}</span>${esc(s.t)}</li>`).join('')}</ul>
    ${a.photos.slice(1).map(p=>`<figure><img src="img/${p[0]}" alt="${esc(p[1])}" loading="lazy"><figcaption>${esc(p[1])} · 사진 중랑구 제공(공공누리 제1유형)</figcaption></figure>`).join('')}
    ${a.photoNote?`<p class="muted" style="font-size:13px">사진 메모: ${esc(a.photoNote)}</p>`:''}
    <p class="said"><b>구의 설명</b>${esc(a.said)}</p>
    <details class="orig"><summary>보도자료 원문 전문 보기 (원문 대조용)</summary><pre>${hl(a, c)}</pre></details>
  </div>
  <aside>
    <div class="check">${ok?`<div class="ok">원문 대조 통과</div>`:`<div class="bad">원문 대조 확인 필요</div>`}
      <small>숫자 ${c.nums.length}개 중 ${c.nums.length-c.nMiss.length}개, 따옴표 속 이름·문구 ${c.qs.length}개 중 ${c.qs.length-c.qMiss.length}개가 원문(제목·본문·등록일)에 있습니다.${c.nMiss.length?` 원문에 없는 숫자: ${esc(c.nMiss.join(', '))}`:''}${c.qMiss.length?` 원문에 없는 문구: ${esc(c.qMiss.join(', '))}`:''}<br>이 대조는 페이지가 열릴 때마다 자동으로 다시 계산됩니다. 문장의 뜻까지는 사람이 봅니다.</small></div>
    <div class="srcBox"><b>원문과 문의</b><dl><dt>원문</dt><dd><a href="${a.src.url}" target="_blank" rel="noopener">${esc(a.src.title)}</a></dd><dt>담당</dt><dd>${esc(a.src.dept)}</dd><dt>전화</dt><dd>${esc(a.src.tel)}</dd><dt>등록</dt><dd>${esc(a.src.reg)}</dd><dt>저작권</dt><dd>공공누리 제1유형(출처표시) · 출처 중랑구청</dd></dl></div>
    <div class="twin"><h3>쌍둥이 고리</h3>이 기사가 닿는 공약 비전: ${a.vision.map(v=>VIS[v]).join(', ')}${a.ax?', AX':''} (편집 추정 꼬리표).<br>같은 비전의 바깥 사례는 <a href="${MEDIA}#/pledge" target="_blank" rel="noopener">중랑정책미디어 공약 서가 ↗</a>에서 봅니다. 브리핑 본문에는 해석을 섞지 않습니다.${a.next?`<br>후속 일정 ${a.next.length}건이 <a href="#/next">약속 달력</a>에 올라 있습니다.`:''}</div>
    <p class="muted" style="font-size:13px;margin-top:14px">정정 이력: 없음 · 사실이 다르면 담당부서 또는 편집국에 알려 주세요. 정정은 이전 문장을 지우지 않고 함께 남깁니다.</p>
  </aside></div>`;
}

/* 원문에서 기사에 쓴 숫자를 표시 */
function hl(a, c){
  let t = esc(a.src.body);
  const toks = c.nums.filter(x => x.length >= 2).sort((x,y)=>y.length-x.length);
  toks.forEach(x => { const re = new RegExp('(?<![\\d,.])(' + x.replace(/\B(?=(\d{3})+(?!\d))/g, ',?').replace('.', '\\.') + ')(?![\\d])', 'g'); t = t.replace(re, '<mark class="hit">$1</mark>'); });
  return t;
}

function upcomingItems(){
  const out = [];
  B.articles.forEach(a => (a.next||[]).forEach(n => { if (n.until >= TODAY) out.push({...n, id:a.id, key: n.d.length===10 ? n.d : n.until, label: n.d.length===10 ? n.d.slice(5).replace('-','.') : n.d.length===7 ? Number(n.d.slice(5))+'월' : n.d+'년'}); }));
  return out.sort((x,y) => x.key.localeCompare(y.key));
}

function nextPage(){
  const items = upcomingItems();
  const past = []; B.articles.forEach(a => (a.next||[]).forEach(n => { if (n.until < TODAY) past.push({...n,id:a.id}); }));
  return `<h2 class="sec">약속 달력 <span class="en">WHAT'S NEXT</span></h2>
  <p class="secDesc">보도자료에 적힌 '언제까지·언제부터'를 모아 둔 곳입니다. 기사가 지나가도 약속은 남습니다. 날짜가 지나면 아래 '지난 일정'으로 내려가고, 후속 보도자료가 오면 같은 줄에 결과를 잇습니다. 중랑정책미디어가 공약 이행을 읽을 때 쓰는 원료이기도 합니다.</p>
  <table class="t"><thead><tr><th style="width:110px">언제</th><th>무엇</th><th style="width:150px">출처 기사</th></tr></thead><tbody>
  ${items.map(u=>`<tr><td><b>${esc(u.label)}</b></td><td>${esc(u.t)}</td><td><a href="#/a/${u.id}">${esc(byId(u.id).sec)} 기사</a></td></tr>`).join('')}
  </tbody></table>
  ${past.length?`<h2 class="sec" style="font-size:20px">지난 일정</h2><ul>${past.map(p=>`<li class="muted">${esc(p.d)} · ${esc(p.t)} · <a href="#/a/${p.id}">기사</a> · 결과 보도 대기</li>`).join('')}</ul>`:''}`;
}

function archive(){
  return `<h2 class="sec">지난 판 <span class="en">ARCHIVE</span></h2><p class="secDesc">시범판은 2026년 10월 26일~30일 중랑구청 보도자료 10건으로 만들었습니다. 판은 보도자료 등록일 기준입니다.</p>
  ${B.editions.map(e=>`<h3 style="font-family:var(--serif);color:var(--navy);margin:22px 0 6px"><a href="#/e/${e.date}">시범판 ${circ(e.no)} · ${fmt(e.date)}</a></h3><div class="briefs" style="margin-top:6px">${arts(e.date).map(card).join('')}</div>`).join('')}`;
}

function render(){
  const h = location.hash || '#/'; let html;
  if (h === '#/' ) html = edition(B.editions[0].date);
  else if (h.startsWith('#/e/')) html = edition(h.slice(4));
  else if (h.startsWith('#/a/')) html = article(h.slice(4));
  else if (h === '#/next') html = nextPage();
  else if (h === '#/archive') html = archive();
  else if (h === '#/design') html = document.getElementById('tpl-design').innerHTML;
  else if (h === '#/views') html = document.getElementById('tpl-views').innerHTML.replace('<!--SAMPLES-->', samples());
  else html = edition(B.editions[0].date);
  app.innerHTML = html; nav(); if (!h.startsWith('#/a/')) window.scrollTo(0,0); else window.scrollTo(0,0);
}

function samples(){
  const s = (x, who, cls, note) => `<div class="sample"><span class="who ${cls}">${who}</span><h3>${esc(x.title)}</h3><p><b>${esc(x.dek)}</b></p>${x.body.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="muted" style="border-top:1px dashed var(--line);padding-top:6px;font-size:13px">Aside 메모: ${note}</p></div>`;
  return `<div class="two">${s(B.samples.gpt,'GPT 견본','g','숫자는 모두 원문과 맞습니다. 다만 사진을 다른 언론사(twig24) 기사에서 가져왔습니다. 그래서 \'원문 첨부 사진만 쓴다\'를 규칙 8로 넣었습니다. \'기반이 마련됐다\'는 원문에 없는 해석에 가깝습니다.')}${s(B.samples.claude,'Claude 견본','c','숫자와 순서는 원문과 맞습니다. 다만 사실을 원문 게시판이 아니라 그 보도자료를 받아 쓴 언론 기사에서 확인했습니다. 그래서 \'1차 출처는 구청 원문 하나\'를 규칙 1에 넣었습니다. \'전봇대 25개\'는 원문의 \'전주 25본\'을 바꿔 쓴 것입니다.')}</div>
  <p class="muted" style="font-size:14px">이 사이트의 <a href="#/a/168260">망우로 기사</a>는 두 견본을 합쳤습니다. 제목은 Claude처럼 장소와 숫자로 열고, 상태 표시는 GPT 제안을 따랐습니다. 단위는 원문대로 '본'을 썼습니다.</p>`;
}

window.addEventListener('hashchange', render);
$('#today').textContent = fmt(TODAY) + ' · 원료 갱신 ' + B.updated.slice(0,10).replace(/-/g,'.');
render();
})();
