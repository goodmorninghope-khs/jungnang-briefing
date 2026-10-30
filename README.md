# 중랑브리핑 · JUNGNANG BRIEFING

나의 자랑 우리 중랑. 중랑구청 보도자료를 원료로, 읽는 사람이 **무엇이 달라지나 · 언제 · 어디서 · 누구에게 물어보나**를 알게 하는 1차 기록 매체입니다. 기사는 **민선9기 7대 공약 비전**별로 묶어 봅니다. 쌍둥이 매체 중랑정책미디어(https://jungnang-media.vercel.app)가 밖을 보는 망원경이라면, 중랑브리핑은 중랑의 오늘을 비추는 창문입니다.

- 사이트: https://jungnang-briefing.vercel.app (검색 노출 막음)
- 시범운영: 2026-11-01 ~ 11-30, 매일 10:30·18:30 자동 게시(원문 자동 대조 통과분만). 운영 홍보담당관(인계 예정), 설계·자동화 정책실.
- 처음 채운 자료: 2026년 10월 보도자료 46건
- 웹 게시만 합니다(카카오톡·문자·SNS 발송, 인쇄 배부 없음).
- 색: 구 슬로건 지정색 초록 #006939 · 자주 #A81B8F · 파랑 #0055B8

## 구조

| 파일 | 내용 |
|-|-|
| `index.html` | 화면 틀, 설계도·두 시선 템플릿 |
| `app.js` | 해시 라우팅(첫 화면·공약 섹션·기사·약속 달력·날짜별), 상태 자동 갱신, **원문 자동 대조** |
| `style.css` | 신문 문법, 슬로건 지정색 |
| `data/brief.js` | `window.BRIEF = {updated, pilot, articles, samples}`. 기사 = 변환문 + 원문 전문 |
| `img/` | 원문 첨부 사진 웹용(webp). 실제로 쓰는 사진만 둔다 |

## 기사 데이터 한 건

`id`(구청 게시물 번호) · `date` · `weight`(1~3) · `sec` · `vision`(7대 비전 번호, 첫 번째가 주 섹션, 0 = 구정·안전) · `ax` · `status[{s,t,until}]` · `title` · `dek` · `lede` · `nums[[값,설명]]` · `act[[항목,내용]]` · `blocks[[소제목,[문단]]]` · `said` · `photos[[파일,설명]]` · `photoNote` · `next[{d,t,until}]` · `src{title,url,dept,tel,reg,body}`

새 기사를 올릴 때: 기사 객체를 `articles` 앞에 넣고 `updated`를 바꾼다. 원문 대조(숫자는 다른 숫자의 일부 인정 안 함, 따옴표 문구 포함)가 통과하지 않으면 올리지 않는다. 절차: policy-media-desk/references/briefing-twin.md '자동 운영 절차'.

## 변환 규칙 요약

1차 출처는 구청 원문 하나 · 원문에 없는 사실·평가 금지 · 자평 수식어 삭제 · 제목은 장소·대상·숫자로 · 완료/예정 구분 · 주민이 할 일은 상자로 · 단체장 발언은 끝에 한 문장 · 사진은 원문 첨부만(단독 단체장·아동 근접·로고·청사 제외) · 기탁 기사는 기업 소개 최소 · 정정은 남긴다.
전문: [policy-media-desk/references/briefing-twin.md](https://github.com/goodmorninghope-khs/policy-media-desk/blob/main/references/briefing-twin.md)

## 저작권

본문과 사진의 출처는 중랑구청이며 공공누리 제1유형(출처표시)에 따라 이용합니다. 사진 속 인물의 초상권은 별도로 살핍니다.

## 연계 (밸류체인)

| 고리 | 받는 것 | 넘기는 것 | 상태 |
|-|-|-|-|
| ① 원료 | 중랑구청 보도자료 원문·사진 | | 시범 |
| ③ 진열 (쌍둥이) | | 정책미디어에 '중랑 2' 원료·공약 이행 기록·약속 달력 후속 일정 | 제안 |
| ④ 정책화 | 정책미디어 공약 서가(기사 끝 링크만) | | 제안 |
| ⑥ 기록 | | 운영 노하우 → [policy-media-desk](https://github.com/goodmorninghope-khs/policy-media-desk) | 연계 |
