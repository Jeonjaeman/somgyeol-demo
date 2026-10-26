# 04-modoomat · 솜결 데모 (모두의매트 컨셉) 작업 노트

## 산출물
- `index.html` / `style.css` / `main.js` (순수 HTML·CSS·JS, 외부 라이브러리 없음. 폰트만 Pretendard 1.3.9 jsDelivr)
- `_qa_desktop.jpg`, `_qa_mobile.jpg`, `_qa_report.json` (`python qa.py 04-modoomat`)
- 자산은 모두 `../assets/img/web/*.webp`(모바일 `_m` 분기 `<picture>`), 히어로 영상 `../assets/video/web/v04_father_baby.mp4` + poster

## 모두의매트(modoomat.com)에서 가져온 기법
| 원본 기법 | 이 데모의 구현 |
|---|---|
| 떠 있는 알약형 헤더(블러 배경, 우측 CTA 알약) | `.header-pill` backdrop-filter 16px, 스크롤 40px 지나면 패딩 축소. 세이지 `카카오 상담` 알약 (동작 없음) |
| 풀블리드 히어로 + 얇은(100) 굵기 H1에 굵은 단어 포인트 | v04 무음 루프 영상 + poster. H1 300 굵기, `깨어 있는 시간`·`선택`만 700 |
| `[ 모두의매트 이야기 ]` 괄호 라벨 | `.label` 13px, 자간 +0.08em, 세이지 색. 모든 섹션에 괄호 라벨 |
| 63px/700 헤드라인 뒤에 같은 크기 100 굵기 회색 문장("그래도 부족했습니다.") | `.h2` + `.h2-thin`(300, mute) 조합. 신뢰 지표 섹션도 thin 헤드라인 |
| "Certified by 아빠 기준검수 Dad's QC Standard" 원형 뱃지 | `.qc-badge` 136px 원, 사진 우하단 겹침. 텍스트는 HTML(SVG text 아님) |
| 직영 .01 / 전담 .02 / 케어 .03 번호 목록 + 1px 구분선 | 국내 생산 .01 / 커버 1회 무상 교체 .02 / 시험성적서 공개 .03. 아이콘은 CSS 의사요소로 그린 타일 |
| `#layersDriver` 8,100px 핀 섹션, three.js로 8층 분해(exploded) | **CSS 3D로 대체**: 500vh 드라이버 + sticky 100svh 스테이지. 8장의 `.layer`(둥근 카드, 층별 그라디언트 질감, 소프트 섀도)를 `preserve-3d` 스택에 `translateZ((7-i)*gap)`로 쌓고, 스크롤 진행률 0~0.22 구간에서 gap 4px→최대 46px로 벌어짐. 이후 0.16~0.96 구간을 8등분해 활성 층 교체. 좌측에 196px 큰 숫자(Pretendard 600, tabular-nums) + 캡션 크로스페이드 + 진행 점. WebGL·three.js 없이 전송량 0 |
| 숫자로 보는 신뢰: 84px/300 큰 숫자 + 밑줄 + 점 라벨 | `.metric-value` 92px/300, 1px 밑줄, 세이지 점 라벨. `12`·`20회`는 카운트업, `KC`·`1:1`은 텍스트 |
| 안전·고요·디자인 3단 + 큰 한자(安 靜 築) 워터마크 | 숨 쉬는 구조 / 정직한 결 / 벗겨서 씻기 + 원 안의 한 글자 `숨 결 씻`(HTML 텍스트, 32% 세이지) |
| 소음 하강 스테이지(dB 눈금·축선) | 6컷 시퀀스 행 + 아래 `통기도 눈금 (시험 수치 자리)` 바. 가짜 숫자 없이 `○○ cm³/cm²/s` 자리 표시 |
| 실제 공간 사진 그리드 + 캡션 오버레이 | 4열 메이슨리(큰 1장 + 와이드 1장 + 정사각 2장), 하단 그라디언트 캡션, hover 1.04 스케일 |
| 어두운 배경 CTA 밴드 + 알약 버튼 2개 | `#1F1B16` 밴드, 300 굵기 헤드라인, `카카오 상담` / `전화 문의` 알약 (동작 없음) |
| 좌측 컬러 블록 + 우측 메뉴·회사 정보 푸터 | 세이지 블록 + 오트 본문, 가상 회사 정보, 안전 문구, 데모 고지, `디자인: 데모` |
| 스크롤 등장(단어 단위 스태거) | 단순화: `.reveal` fade-up(IntersectionObserver 1회), 검수 목록·시퀀스는 `data-stagger`로 0.12s 간격 순차 등장 |

## 구현 메모
- 색: `--ivory #F6F1E8` 바탕, `--oat #E8DCC8` 밴드(신뢰·사양·안전), `--ink #1F1B16`, 포인트 `--sage-deep #5E7A5B`. 모두의매트의 테라코타 대신 세이지.
- 타이포: 헤드라인 `clamp(36px, 3.9vw, 56px)` 700, 자간 -0.025em. 큰 숫자는 `font-variant-numeric: tabular-nums`.
- 사진 반경 12px, 구분선 1px `rgba(31,27,22,.12)`.
- 층 분해 JS: `scroll` passive 리스너 + rAF 스로틀. `driver.offsetParent === null`(모바일 display:none)이면 계산 생략. `stack.style.transform`으로 기울기도 58°→62° / -32°→-26° 미세 변화.
- 히어로 영상: `autoplay muted loop playsinline preload="metadata"` + poster, `play()` 실패 시 poster 유지. reduced-motion에서는 autoplay 제거.
- FAQ는 `<details>` 네이티브, 하나만 열리도록 toggle 이벤트에서 나머지 닫음.
- 내비·버튼은 `javascript:void(0)` / `type="button"`, 이동·동작 없음.
- 혜택 4행 이미지는 지시서 순서(p27, p26, p01, p00b) 대신 의미에 맞춰 p27(통기) → p01(낮고 단단함) → p26(분리 세탁) → p00b(높이)로 배치.

## 모바일·접근성 단순화
- ≤1024: 내비 숨기고 햄버거 + 드롭 메뉴. 핀 섹션 `display:none`, 대신 p02 분해도 + 8층 번호 목록(`.layers-static`).
- ≤768: 시퀀스 6컷이 가로 `scroll-snap`(68% 폭) 행으로 전환, 실제 공간 그리드는 1열, 혜택 행은 이미지 위/글 아래, 높이 단계는 3칸 → 세로 목록(≤420).
- `prefers-reduced-motion: reduce`: 리빌·카운트업·스크롤 인디케이터·핀 섹션 끔, 정적 폴백 표시.

## QA 결과
- 콘솔 에러 0, 404 0 (desktop 1440 / mobile 390). 페이지 높이 데스크톱 약 21,100px(핀 500vh 포함), 모바일 약 19,200px.
- 금지어·대시 스캔: em/en 대시 0, 두상 교정·예방·치료·SIDS·통잠·안심 표현 0, SVG text 0.
- 반복 수정: 히어로 H1 3줄→2줄(폭·크기 조정), `.belief-head` 중앙 정렬 오류 → 좌측 정렬, 실제 공간 그리드 빈 칸 → 4열 메이슨리, 핀 드라이버 620vh → 500vh, 모바일 가로 넘침(정적 폴백 그리드 `1fr` 최소폭이 4:3 이미지에 끌려 420px) → `minmax(0, 1fr)`로 해결(390/768/1024/1440 scrollWidth 일치 확인).

## 거친 부분(알려진 한계)
- 층 분해는 CSS 평면 카드라 두께감은 그림자로만 표현. 실제 three.js 분해(원본)만큼의 입체 조명은 없음. 필요하면 p02 실사 슬라이스나 사전 렌더 webp 시퀀스로 교체 가능.
- 핀 구간(500vh)이 길어 qa.py 14샷 스트립에는 핀 이후 섹션이 일부만 담김(별도 캡처로 확인함).
- 통기도 눈금과 "일반 솜 베개 ○○"는 시험성적서 수령 후 수치로 교체해야 함.
- Safari 구버전의 `100svh`·`aspect-ratio` 폴백은 미검증.
