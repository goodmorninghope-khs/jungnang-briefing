/* 중랑브리핑 · 매체형 정적 사이트 (해시 라우팅) */
(function(){
const B = window.BRIEF, $ = s => document.querySelector(s), app = $('#app');
const SECS = [
 {v:1, name:'교육', full:'희망찬 미래 교육도시 중랑', c:'#0055B8'},
 {v:2, name:'경제·도시', full:'성장동력을 키우는 경제 및 도시개발', c:'#006939'},
 {v:3, name:'교통', full:'서울 동북권 교통거점 도시 중랑', c:'#2a7ab8'},
 {v:4, name:'주거', full:'신속하고 확실한 주거환경 개선', c:'#5b7a1c'},
 {v:5, name:'문화', full:'모두가 함께 즐기는 문화중랑', c:'#A81B8F'},
 {v:6, name:'복지', full:'더불어 따뜻한 복지중랑', c:'#d4570f'},
 {v:7, name:'걷기·환경', full:'전국최고 걷기 좋은 도시 중랑', c:'#1f8a57'},
 {v:0, name:'구정·안전', full:'함께 만드는 구정(안전·소통·AX)', c:'#5f6878'}
];
const SEC = v => SECS.find(s => s.v === v) || SECS[7];
const MEDIA = 'https://jungnang-media.vercel.app/';
const DOW = ['일','월','화','수','목','금','토'];
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TODAY = new Date(Date.now() + 9*3600e3).toISOString().slice(0,10);
const fmt = d => { const [y,m,dd] = d.split('-').map(Number); const w = new Date(Date.UTC(y,m-1,dd)).getUTCDay(); return `${m}.${dd}(${DOW[w]})`; };
const fmtY = d => { const [y,m,dd] = d.split('-').map(Number); const w = new Date(Date.UTC(y,m-1,dd)).getUTCDay(); return `${y}.${String(m).padStart(2,'0')}.${String(dd).padStart(2,'0')} (${DOW[w]})`; };
const ALL = B.articles.slice().sort((a,b) => b.date.localeCompare(a.date) || (b.weight||1)-(a.weight||1) || b.id.localeCompare(a.id));
const byId = id => ALL.find(a => a.id === id);
const prim = a => (a.vision && a.vision.length) ? a.vision[0] : 0;
const inSec = v => ALL.filter(a => prim(a) === v);
const live = s => { if (!s.until || s.until >= TODAY) return s.s; return s.s === '모집' ? '마감' : (s.s === '진행' || s.s === '예정') ? '종료' : s.s; };
const stB = a => [...new Set(a.status.map(live))].map(s => `<span class="st ${s}">${s}</span>`).join('');
const vtag = v => { const s = SEC(v); return `<a class="vtag" style="background:${s.c}" href="#/s/${s.v}">${s.name}</a>`; };
const tags = a => (a.vision||[0]).map(vtag).join('') + (a.ax ? '<span class="vtag" style="background:#1b2430">AX</span>' : '');
const ph = (a, cls) => a.photos && a.photos[0] ? `<a class="ph ${cls||''}" href="#/a/${a.id}"><img src="img/${a.photos[0][0]}" alt="${esc(a.photos[0][1])}" loading="lazy"></a>` : '';

/* 원문 대조: 기사 속 숫자(쉼표 제거, 다른 숫자 속 일부는 인정 안 함)와 따옴표 문구가 원문(제목·본문·등록일)에 있는지 */
function check(a){
  const n = s => s.replace(/(\d),(?=\d{3})/g,'$1'), sp = s => s.replace(/\s+/g,'');
  const corpus = n(a.src.title + ' ' + a.src.body + ' ' + a.src.reg);
  const all = n([a.title,a.dek,a.lede,...(a.nums||[]).flat(),...a.blocks.flatMap(b=>b[1]),a.said||'',...(a.act||[]).flat(),...a.status.map(s=>s.t)].join(' '));
  const nums = [...new Set(all.match(/\d+(?:\.\d+)?/g) || [])];
  const has = x => new RegExp('(?<![\\d.])' + x.replace('.', '\\.') + '(?![\\d]|\\.\\d)').test(corpus);
  const nMiss = nums.filter(x => !has(x));
  const raw = [a.title,a.dek,a.lede,...a.blocks.flatMap(b=>b[1]),...(a.act||[]).flat()].join(' ');
  const qs = [...new Set([...raw.matchAll(/[‘“「]([^’”」]+)[’”」]/g)].map(m=>m[1]))];
  const qMiss = qs.filter(q => !sp(a.src.title + a.src.body).includes(sp(q)));
  return {nums, nMiss, qs, qMiss};
}

function upcoming(){
  const out = [];
  ALL.forEach(a => (a.next||[]).forEach(x => { if (x.until >= TODAY) out.push({...x, id:a.id, key: x.d.length===10 ? x.d : x.until, label: x.d.length===10 ? fmt(x.d) : x.d.length===7 ? Number(x.d.slice(5))+'월' : x.d+'년'}); }));
  return out.sort((x,y) => x.key.localeCompare(y.key));
}

function front(){
  const withPh = ALL.filter(a => a.photos && a.photos.length);
  const latestDate = ALL[0].date;
  const recent = ALL.filter(a => a.date >= addDays(latestDate, -3));
  const lead = recent.filter(a => a.photos && a.photos.length).sort((a,b) => (b.weight||1)-(a.weight||1) || b.date.localeCompare(a.date))[0] || ALL[0];
  const subs = ALL.filter(a => a !== lead).sort((a,b) => b.date.localeCompare(a.date) || (b.weight||1)-(a.weight||1)).filter(a => a.photos && a.photos.length).slice(0,4);
  const numSrc = ALL.find(a => a !== lead && (a.weight||1) >= 3 && a.nums && a.nums.length) || ALL.find(a => a !== lead && a.nums && a.nums.length);
  const tick = ALL.filter(a => a !== lead && !subs.includes(a)).slice(0,10);
  const used = new Set([lead, ...subs].map(a => a.id));
  const up = upcoming().slice(0,6);
  const gal = withPh.filter(a => !used.has(a.id)).slice(0,8);
  return `
  <div class="top">
    <article class="hero">${ph(lead)}
      <div class="in"><div class="eyebrow" style="color:${SEC(prim(lead)).c}">머리기사 · ${SEC(prim(lead)).name} · ${fmt(lead.date)}</div>
      <h1><a href="#/a/${lead.id}">${esc(lead.title)}</a></h1><p class="dek">${esc(lead.dek)}</p><div>${stB(lead)}${tags(lead)}</div></div>
    </article>
    <div class="subs">
      ${numSrc ? `<div class="numbox"><div class="l">오늘의 숫자</div><b>${esc(numSrc.nums[0][0])}</b><p>${esc(numSrc.nums[0][1])} · <a href="#/a/${numSrc.id}">${esc(numSrc.sec)}</a></p></div>` : ''}
      ${subs.map(a => `<article>${ph(a)}<div><div class="eyebrow" style="color:${SEC(prim(a)).c}">${SEC(prim(a)).name} · ${fmt(a.date)}</div><h3><a href="#/a/${a.id}">${esc(a.title)}</a></h3></div></article>`).join('')}
    </div>
  </div>
  <div class="tick"><div class="hd">최신 기사</div>${tick.map(a => `<li><span class="d">${fmt(a.date)}</span><a href="#/a/${a.id}">${esc(a.title)}</a></li>`).join('')}</div>
  <div class="body2">
    <div>
      <h2 class="sec" style="margin-top:14px">7대 공약으로 보는 중랑 <span class="en">BY PLEDGE</span></h2>
      <div class="blocks">${SECS.map(block).join('')}</div>
    </div>
    <aside class="side">
      <div class="box"><h3>약속 달력 · 다가오는 일정</h3>${up.length ? `<ul class="cal">${up.map(u => `<li><span class="d">${esc(u.label)}</span>${esc(u.t)} <a href="#/a/${u.id}">›</a></li>`).join('')}</ul>` : '<p class="muted">등록된 일정이 없습니다.</p>'}<p style="margin:6px 0 0"><a href="#/next">전체 달력 →</a></p></div>
      <div class="box"><h3>공약별 기사</h3><ul class="vlist">${SECS.map(s => `<li><a href="#/s/${s.v}" style="color:${s.c}">${s.v ? s.v + '. ' : ''}${esc(s.name)}</a><span class="muted">${inSec(s.v).length}건</span></li>`).join('')}</ul></div>
      <div class="twinbox"><h3 style="margin:0 0 6px;font-size:13px;letter-spacing:2px">쌍둥이 매체</h3>밖의 사례로 "우리라면?"을 묻는 <a href="${MEDIA}" target="_blank" rel="noopener">중랑정책미디어 ↗</a>. 같은 7대 공약 꼬리표로 이어집니다.</div>
      <div class="box" style="margin-top:14px"><h3>이 매체를 읽는 법</h3><p style="margin:0;font-size:13.5px" class="muted">구청 보도자료의 사실만 다시 엮었습니다. 기사마다 숫자·이름을 원문과 자동 대조하고, 해석·평가는 넣지 않습니다. 완료·예정·모집 표시는 오늘 날짜 기준으로 바뀝니다.</p></div>
    </aside>
  </div>
  ${gal.length ? `<h2 class="sec">사진으로 보는 중랑 <span class="en">PHOTO</span></h2><div class="gallery">${gal.map(a => `<a href="#/a/${a.id}"><img src="img/${a.photos[0][0]}" alt="" loading="lazy"><span>${esc(a.title)}</span></a>`).join('')}</div><p class="muted" style="font-size:12.5px">사진 중랑구 제공(공공누리 제1유형)</p>` : ''}`;
}
function addDays(d, n){ const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate()+n); return t.toISOString().slice(0,10); }

function block(s){
  const list = inSec(s.v);
  if (!list.length) return `<section class="blk" style="--c:${s.c}"><header><a class="t" href="#/s/${s.v}">${s.v ? s.v + '. ' : ''}${esc(s.name)}</a><small>${esc(s.full)}</small></header><div class="empty">이번 기간에 들어온 보도자료가 없습니다. 쌍둥이 매체 <a href="${MEDIA}#/pledge" target="_blank" rel="noopener">공약 서가</a>에서 밖의 사례를 볼 수 있습니다.</div></section>`;
  const f = list.find(a => a.photos && a.photos.length) || list[0];
  const rest = list.filter(a => a !== f).slice(0,3);
  return `<section class="blk" style="--c:${s.c}"><header><a class="t" href="#/s/${s.v}">${s.v ? s.v + '. ' : ''}${esc(s.name)} · ${list.length}건 →</a><small>${esc(s.full)}</small></header>
  <div class="feat">${ph(f) || '<span></span>'}<div><h3><a href="#/a/${f.id}">${esc(f.title)}</a></h3><p>${stB(f)}${fmt(f.date)}</p></div></div>
  ${rest.length ? `<ul>${rest.map(a => `<li><a href="#/a/${a.id}">${esc(a.title)}</a> <span class="muted" style="font-size:12px">${fmt(a.date)}</span></li>`).join('')}</ul>` : ''}</section>`;
}

function card(a){
  return `<article class="card">${ph(a)}<div class="in"><div class="eyebrow" style="color:${SEC(prim(a)).c}">${SEC(prim(a)).name} · ${fmt(a.date)}</div><h3><a href="#/a/${a.id}">${esc(a.title)}</a></h3><div>${stB(a)}</div><p>${esc(a.dek)}</p></div></article>`;
}

let TWIN = []; // 쌍둥이 매체 중랑정책미디어(밖에서 본 길)
const VN = ['', '교육', '경제', '교통', '주거', '문화', '복지', '걷기'];
async function loadTwin(){
  try {
    const [pm, ed] = await Promise.all(['/twin/pledge-map.json', '/twin/editions.json'].map(u => fetch(u, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null)));
    const out = new Map();
    for (const m of ((pm && pm.items) || [])) { const v = (m.pledges || []).map(p => '①②③④⑤⑥⑦'.indexOf(p) + 1).filter(n => n > 0); if (v.length) out.set(m.id, { id: m.id, title: m.title, date: (m.date || '').replace(/\./g, '-'), series: m.series, v }); }
    for (const e of (Array.isArray(ed) ? ed : [])) { const ps = [...(e.pledges || []), ...((e.signals || []).map(s => s.pledge || ''))].join(' '); const v = VN.map((n, i) => i && ps.includes(n) ? i : 0).filter(Boolean); if (v.length) out.set(e.id, { id: e.id, title: e.title, date: (e.date || '').replace(/\./g, '-'), series: e.series, v }); }
    TWIN = [...out.values()].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (e) { }
}
const twinIn = v => TWIN.filter(x => x.v.includes(v));
const twinBox = (v, n) => { const l = twinIn(v).slice(0, n); return l.length ? `<div class="twin"><b>밖에서 본 같은 길 · 중랑정책미디어</b><p class="muted" style="font-size:13px;margin:2px 0 6px">같은 공약 비전을 다른 곳은 어떻게 풀었는지, 국내외 사례로 읽습니다.</p><ul>${l.map(x => `<li><a href="${MEDIA}#/read/${encodeURIComponent(x.id)}" target="_blank" rel="noopener">${esc(x.title)}</a> <span class="muted" style="font-size:12px">${esc(x.series || '')} · ${fmt(x.date)}</span></li>`).join('')}</ul></div>` : ''; };

function section(v){
  const s = SEC(v), list = inSec(v);
  return `<div class="sechead" style="--c:${s.c}"><div class="eyebrow" style="color:${s.c}">${v ? '민선9기 7대 공약 비전 ' + v : '공통 실행'}</div><h1>${esc(s.full)}</h1><p class="muted" style="margin:4px 0 0">${list.length}건 · 보도자료의 주 분야로 묶었습니다(편집 분류). 같은 비전의 밖의 사례는 <a href="${MEDIA}#/pledge" target="_blank" rel="noopener">중랑정책미디어 공약 서가 ↗</a></p></div>
  ${v ? twinBox(v, 4) : ''}
  ${list.length ? `<div class="cards">${list.map(card).join('')}</div>` : '<p class="muted">아직 기사가 없습니다.</p>'}`;
}

function article(id){
  const a = byId(id); if (!a) return '<p>기사를 찾을 수 없습니다.</p>';
  const c = check(a), ok = !c.nMiss.length && !c.qMiss.length, s = SEC(prim(a));
  const rel = inSec(prim(a)).filter(x => x !== a).slice(0,5);
  return `<div class="art"><div>
    <div class="eyebrow" style="color:${s.c}">${esc(s.name)} · ${esc(a.sec)} · ${fmtY(a.date)}</div>
    <h1>${esc(a.title)}</h1><p class="dek">${esc(a.dek)}</p>
    <div class="meta">${stB(a)} ${tags(a)}<br>원료 보도자료 등록 ${esc(a.src.reg)} · AI 변환, 원문 자동 대조 · 사실 출처는 모두 아래 원문</div>
    ${a.photos && a.photos[0] ? `<figure><img src="img/${a.photos[0][0]}" alt="${esc(a.photos[0][1])}"><figcaption>${esc(a.photos[0][1])} · 사진 중랑구 제공(공공누리 제1유형)</figcaption></figure>` : ''}
    <p class="lede">${esc(a.lede)}</p>
    ${a.nums && a.nums.length ? `<div class="nums">${a.nums.map(x => `<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')}</div>` : ''}
    ${a.act && a.act.length ? `<div class="act"><h4>주민이 알아 둘 것</h4><dl>${a.act.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></div>` : ''}
    ${a.blocks.map(b => `<h4>${esc(b[0])}</h4>${b[1].map(p => `<p>${esc(p)}</p>`).join('')}`).join('')}
    <h4>진행 상태</h4><ul class="track">${a.status.map(x => `<li><span class="st ${live(x)}">${live(x)}</span>${esc(x.t)}</li>`).join('')}</ul>
    ${(a.photos||[]).slice(1).map(p => `<figure><img src="img/${p[0]}" alt="${esc(p[1])}" loading="lazy"><figcaption>${esc(p[1])} · 사진 중랑구 제공(공공누리 제1유형)</figcaption></figure>`).join('')}
    ${a.photoNote ? `<p class="muted" style="font-size:13px">사진 메모: ${esc(a.photoNote)}</p>` : ''}
    ${a.said ? `<p class="said"><b>구의 설명</b>${esc(a.said)}</p>` : ''}
    <details class="orig"><summary>보도자료 원문 전문 보기 (원문 대조용)</summary><pre>${hl(a, c)}</pre></details>
    ${twinBox(prim(a), 3)}
    ${rel.length ? `<div class="related"><b style="color:${s.c}">같은 공약(${esc(s.name)})의 다른 기사</b><ul>${rel.map(x => `<li><a href="#/a/${x.id}">${esc(x.title)}</a> <span class="muted" style="font-size:12px">${fmt(x.date)}</span></li>`).join('')}</ul></div>` : ''}
  </div>
  <aside>
    <div class="check">${ok ? '<div class="ok">원문 대조 통과</div>' : '<div class="bad">원문 대조 확인 필요</div>'}
      <small>숫자 ${c.nums.length}개 중 ${c.nums.length - c.nMiss.length}개, 따옴표 속 문구 ${c.qs.length}개 중 ${c.qs.length - c.qMiss.length}개가 원문(제목·본문·등록일)에 있습니다.${c.nMiss.length ? ' 원문에 없는 숫자: ' + esc(c.nMiss.join(', ')) : ''}${c.qMiss.length ? ' 원문에 없는 문구: ' + esc(c.qMiss.join(', ')) : ''}<br>페이지가 열릴 때마다 다시 계산합니다. 문장의 뜻은 담당자가 봅니다.</small></div>
    <div class="srcBox"><b>원문과 문의</b><dl><dt>원문</dt><dd><a href="${a.src.url}" target="_blank" rel="noopener">${esc(a.src.title)}</a></dd><dt>담당</dt><dd>${esc(a.src.dept)}</dd><dt>전화</dt><dd>${esc(a.src.tel)}</dd><dt>등록</dt><dd>${esc(a.src.reg)}</dd><dt>저작권</dt><dd>공공누리 제1유형(출처표시) · 출처 중랑구청</dd></dl></div>
    <div class="twinbox"><h3 style="margin:0 0 6px;font-size:13px;letter-spacing:2px">쌍둥이 고리</h3>이 기사의 공약 분류: ${(a.vision||[0]).map(v => SEC(v).full).join(', ')}${a.ax ? ', AX' : ''}(편집 분류).<br>같은 비전의 밖의 사례는 <a href="${MEDIA}#/pledge" target="_blank" rel="noopener">중랑정책미디어 공약 서가 ↗</a>에서 봅니다.${a.next && a.next.length ? `<br>후속 일정 ${a.next.length}건이 <a href="#/next">약속 달력</a>에 있습니다.` : ''}</div>
    <p class="muted" style="font-size:13px;margin-top:14px">정정 이력: 없음 · 사실이 다르면 담당부서나 홍보담당관에 알려 주세요. 정정은 이전 문장을 지우지 않고 함께 남깁니다.</p>
  </aside></div>`;
}
function hl(a, c){
  let t = esc(a.src.body);
  c.nums.filter(x => x.length >= 2).sort((x,y) => y.length - x.length).forEach(x => {
    const pat = x.replace('.', '\\.').replace(/^(\d+)/, m => m.replace(/\B(?=(\d{3})+(?!\d))/g, ',?'));
    t = t.replace(new RegExp('(?<![\\d,.])(' + pat + ')(?![\\d])', 'g'), '<mark class="hit">$1</mark>');
  });
  return t;
}

function nextPage(){
  const items = upcoming(); const past = [];
  ALL.forEach(a => (a.next||[]).forEach(x => { if (x.until < TODAY) past.push({...x, id:a.id}); }));
  return `<h2 class="sec">약속 달력 <span class="en">WHAT'S NEXT</span></h2>
  <p class="secDesc">보도자료에 적힌 '언제까지·언제부터'를 모았습니다. 기사가 지나가도 약속은 남습니다. 날짜가 지나면 '지난 일정'으로 내려가고, 결과 보도자료가 오면 같은 공약 섹션에 이어 실립니다.</p>
  <table class="t"><thead><tr><th style="width:90px">언제</th><th>무엇</th><th style="width:120px">공약</th></tr></thead><tbody>
  ${items.map(u => `<tr><td><b>${esc(u.label)}</b></td><td><a href="#/a/${u.id}">${esc(u.t)}</a></td><td>${vtag(prim(byId(u.id)))}</td></tr>`).join('')}</tbody></table>
  ${past.length ? `<h2 class="sec" style="font-size:20px">지난 일정</h2><ul>${past.map(p => `<li class="muted">${esc(p.d)} · <a href="#/a/${p.id}">${esc(p.t)}</a></li>`).join('')}</ul>` : ''}`;
}

function archive(){
  const dates = [...new Set(ALL.map(a => a.date))];
  return `<h2 class="sec">날짜별 기사 <span class="en">ARCHIVE</span></h2><p class="secDesc">구청 보도자료 등록일 기준입니다. 모두 ${ALL.length}건.</p>
  ${dates.map(d => `<h3 style="font-family:var(--serif);margin:20px 0 6px">${fmtY(d)}</h3><ul style="margin:0;padding-left:18px">${ALL.filter(a => a.date === d).map(a => `<li>${vtag(prim(a))}<a href="#/a/${a.id}">${esc(a.title)}</a></li>`).join('')}</ul>`).join('')}`;
}

function samples(){
  const s = (x, who, cls, note) => `<div class="sample"><span class="who ${cls}">${who}</span><h3>${esc(x.title)}</h3><p><b>${esc(x.dek)}</b></p>${x.body.map(p => `<p>${esc(p)}</p>`).join('')}<p class="muted" style="border-top:1px dashed var(--line);padding-top:6px;font-size:13px">Aside 메모: ${note}</p></div>`;
  return `<div class="two">${s(B.samples.gpt,'GPT 견본','g','숫자는 원문과 맞습니다. 사진을 다른 언론사(twig24) 기사에서 가져와 \'원문 첨부 사진만\' 규칙의 근거가 됐습니다.')}${s(B.samples.claude,'Claude 견본','c','숫자와 순서는 원문과 맞습니다. 사실을 원문이 아니라 받아 쓴 언론 기사에서 확인해 \'1차 출처는 원문 하나\' 규칙의 근거가 됐습니다.')}</div>`;
}

function nav(){
  const h = location.hash || '#/';
  document.querySelectorAll('.nav a[href^="#"]').forEach(a => { const on = a.getAttribute('href') === h || (h.startsWith('#/a/') && false); a.classList.toggle('on', on); });
}
function render(){
  const h = location.hash || '#/'; let html;
  if (h === '#/') html = front();
  else if (h.startsWith('#/s/')) html = section(Number(h.slice(4)));
  else if (h.startsWith('#/a/')) html = article(h.slice(4));
  else if (h === '#/next') html = nextPage();
  else if (h === '#/archive') html = archive();
  else if (h === '#/design') html = $('#tpl-design').innerHTML;
  else if (h === '#/ops') html = $('#tpl-ops').innerHTML;
  else if (h === '#/views') html = $('#tpl-views').innerHTML.replace('<!--SAMPLES-->', samples());
  else html = front();
  app.innerHTML = html; nav(); window.scrollTo(0,0);
}
$('#secnav').innerHTML = SECS.map(s => `<a class="sub" href="#/s/${s.v}" style="color:${s.c}">${esc(s.name)}</a>`).join('');
$('#today').textContent = fmtY(TODAY) + ' · 기사 ' + ALL.length + '건 · 갱신 ' + (B.updated||'').slice(0,16).replace('T',' ');
window.addEventListener('hashchange', render);
render();
loadTwin().then(() => { if (TWIN.length) render(); });
})();
