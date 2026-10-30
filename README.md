# 중랑브리핑 · JUNGNANG BRIEFING (시범판)

중랑구청 보도자료를 원료로, 읽는 사람이 **무엇이 달라지나 · 언제 · 어디서 · 누구에게 물어보나**를 3분 안에 알게 하는 1차 기록 매체입니다. 중랑정책미디어(https://jungnang-media.vercel.app)가 밖을 보는 망원경(밖 → 안)이라면, 중랑브리핑은 중랑의 오늘을 비추는 창문(안 → 밖)입니다.

- 사이트: https://jungnang-briefing.vercel.app (검색 노출 막음, 비공식 시범판)
- 시범판 원료: 2026-10-26 ~ 10-30 중랑구청 보도자료 10건
- 설계: GPT 외부고문 · Claude 편집국에 같은 질문을 던지고 Aside 통합 데스크가 합침(2026-10-30). 사이트 '설계도'·'두 시선' 메뉴에 전문.
- 공개 범위·모토·승인 줄·발행 시각은 발행인 결정 전입니다.

## 구조

| 파일 | 내용 |
|-|-|
| `index.html` | 화면 틀, 설계도·두 시선 템플릿 |
| `app.js` | 해시 라우팅(오늘 판·지난 판·기사·약속 달력), 상태 자동 갱신, **원문 자동 대조** |
| `style.css` | 정책미디어와 같은 신문 문법, 청록 강조색 |
| `data/brief.js` | 판(editions)·기사(articles: 변환문 + 원문 전문)·두 엔진 견본 |
| `img/` | 원문 첨부 사진 웹용(webp). 실제로 쓰는 사진만 둔다 |

## 기사 데이터 한 건

`id`(구청 게시물 번호) · `date` · `lead` · `sec` · `vision`(7대 비전 번호) · `status[{s,t,until}]` · `title` · `dek` · `lede` · `nums[[값,설명]]` · `act[[항목,내용]]` · `blocks[[소제목,[문단]]]` · `said` · `photos[[파일,설명]]` · `photoNote` · `next[{d,t,until}]` · `src{title,url,dept,tel,reg,body}`

새 판을 올릴 때: 기사 객체를 `articles`에, 판을 `editions` 맨 앞에 넣는다. 화면의 원문 대조 배지가 '통과'가 아니면 진열하지 않는다.

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
