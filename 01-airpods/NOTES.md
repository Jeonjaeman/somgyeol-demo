# 01-airpods · 솜결 에어 베개 데모 노트

참고: Apple AirPods Pro 3 제품 페이지 (https://www.apple.com/airpods-pro/), `research/소스분석.md` 1절.
파일: `index.html`, `style.css`, `main.js` (+ `_qa_desktop.jpg`, `_qa_mobile.jpg`, `_qa_report.json`).
스택: GSAP 3.12.5 + ScrollTrigger (cdnjs), Swiper 11.1.14 (cdnjs), Pretendard 1.3.9 (jsdelivr). 그 외 의존성 없음.

## 1. 참고 사이트에서 가져온 기법과 구현 방식

| Apple 기법 (실측) | 이 데모의 구현 |
|---|---|
| 글로벌 nav 48px(스크롤하면 사라짐) + 로컬 nav 52px sticky, 반투명 `rgba(250,250,252,.8)` + blur, 제품명 좌 / Buy 버튼 우 | `.gnav` 48px 정적 + `.lnav` 52px `position:sticky; top:0`. 히어로 다음에 DOM 배치해 히어로가 지나간 뒤 등장. 앵커 5개(개요·구조·소재·안전·사양)는 JS로 52px 오프셋 smooth scroll, 현재 섹션 밑줄 표시(scroll 리스너 + rAF). 구매 버튼은 hover/press만 |
| 히어로: 작은 H1 + 64px 카피 + 자동재생 영상, 하단 재생/정지 버튼 | 아이브로우 17px → 헤드라인 `clamp(48px, 7.2vw, 80px)` 700 / -0.035em → 한 줄 서브 → 투명 컷아웃(p04) 대형 배치. 등장: scale 1.06→1 + fade(expo.out 1.6s), 뒤에 radial-gradient 글로우 div(세이지·오트 20% 이하). 900px 높이 뷰포트 안에 다 들어오도록 이미지 `max-height:min(52vh,600px)` |
| "Get the highlights." `MediaCardGallery`: 1260×680 둥근 카드(28px), 좌우 이동, 영상 PlayPauseButton | Swiper 11 `slidesPerView:'auto', centeredSlides` 카드 4장(v01, v02, v06, v05 · 16:9, 모바일 4:5). 영상은 `autoplay muted loop playsinline` + poster. 하단 좌 pagination, 우 prev/next/재생정지 원형 버튼. 섹션이 화면 밖이면 IntersectionObserver로 일시정지 |
| 제품 회전/분해 = **알파 영상 `currentTime` 스크럽** (`sticky-container` 100vh sticky, 앵커 구간 `a0t-100vh ~ a0b-168vh`에 progress 0→1), 로드 전 startframe PNG | 알파 영상이 없어 **알파 webp 121장 + 캔버스 drawImage**로 동일 연출. 구조는 Apple과 같게 CSS `section{height:320vh}` > `div{position:sticky;top:0;height:100svh}`, GSAP pin 안 씀. ScrollTrigger는 `trigger:section, start:'top top', end:'bottom bottom', scrub:0.6`로 `proxy.frame` 0→120만 트윈하고 rAF에서 중복 없이 그린다. 첫 프레임은 `<link rel=preload>` + 단독 선로드(즉시 표시), 나머지 6개 병렬 프리로드, 진행 막대 표시. DPR 2 상한. 가로 화면 contain×0.86, 세로 화면은 폭 기준 1.28배(투명 여백 잘라내고 제품 키움) |
| 스토리 섹션의 `StaggeredFadeIn` 카드 (sticky 미디어 위에 순차 등장) | 캔버스 위 콜아웃 3개(숨 쉬는 3D 메쉬 / 중앙 오목면 / 벗겨지는 커버)를 같은 스크럽 타임라인에 progress 0.10 / 0.40 / 0.70에서 fade-in, 0.34 / 0.64 / 0.96에서 fade-out |
| 분해 애니메이션(사전 렌더 영상) | p02 분해도 한 장을 3번 겹치고 `clip-path:inset()`으로 커버(0~40%)·메쉬(40~62%)·베이스(62~100%)로 잘라 `yPercent` +14 / 0 / -13에서 0으로 스크럽. 흰 배경이 아래 층을 가리지 않도록 `mix-blend-mode:multiply`. 라벨 3개는 progress 0.18 / 0.38 / 0.58에 순차 등장. 역시 CSS sticky(280vh 안 100svh) |
| 섹션 배경 `background-alt`로 흰색↔`#f5f5f7` 교차, 다크 카드 `#18181a` | 흰(히어로·하이라이트·가까이·구조) → 회색(숫자) → 흰(벤토) → 검정(소재의 과학) → 흰(색상) → 회색(안전) → 흰(사양·FAQ) → 회색(푸터) |
| 수치 타일, 벤토 그리드, compare 표 | 숫자 4타일 카운트업(gsap power3.out, 한 번만). 벤토 4열 × 3행(2×2, 2×1, 1×1, 1×1, 1×1, 3×1) 사진 타일은 상단 그라데이션 + 흰 글자, 흰 배경 제품컷은 ink 글자. 사양은 2열 표(라벨 112px) |
| 타이포 96/600, 56/600, 보조 `#6e6e73` | 브리프대로 Pretendard 700, 헤드라인 48~80px, -0.03em, 중앙 정렬. 보조 텍스트 `#6e6e73`, 포인트는 세이지 `#5E7A5B` 버튼·밑줄에만 |
| 스크롤 리빌 | `.reveal` 요소를 `ScrollTrigger.batch`로 opacity 0→1, y 26→0, stagger .08, 한 번만 |

Apple과의 차이: Apple은 2025~2026부터 캔버스 프레임 시퀀스를 쓰지 않고 VP9/HEVC 알파 영상을 `currentTime`으로 스크럽한다. 이 데모는 알파 영상 인코딩 없이 쓸 수 있는 실용적 대체로 웹p 121장을 캔버스에 그린다(동일한 sticky-in-tall-spacer 구조). 실서비스에서 알파 영상이 준비되면 `closer()` 함수의 프리로드·draw만 `<video>` + `currentTime = progress × duration`으로 바꾸면 된다.

## 2. 페이지 무게
- HTML/CSS/JS 58KB. HTML이 참조하는 이미지·영상 7.8MB + 프레임 121장 3.7MB = **약 11.5MB** (끝까지 스크롤 시, Apple 75MB 대비). 모바일은 프레임 61장(약 1.9MB).
- 아래쪽 이미지 `loading="lazy"`, 영상 `preload="metadata"`.

## 3. 모바일 단순화 (≤767px)
- 프레임 시퀀스: 홀수 번호 61장만 로드, 세로 화면용 확대 그리기, 콜아웃은 하단 한 자리에서 순차 교체. 섹션 높이 260vh.
- 3겹 구조: sticky 해제. `.explode`가 화면을 지나는 동안(85%→40%) 스크럽으로 층이 벌어지고 라벨은 항상 표시.
- 로컬 nav 앵커 숨김(제품명 + 구매 버튼만), 글로벌 메뉴 숨김.
- 하이라이트 카드 4:5, 벤토 1열, 숫자 2×2, 사양 1열, 소재 섹션은 세로 그라데이션.

## 4. prefers-reduced-motion
- 히어로 등장·리빌·카운트업·FAQ 높이 애니메이션·hover 확대 모두 끔.
- 가까이 보기: sticky 해제, 첫 프레임 1장만 로드해 정적 표시, 콜아웃 3개는 캔버스 아래 3열로 나열.
- 3겹 구조: sticky 해제, 분해도 원본 그대로, 라벨 항상 표시. `scroll-behavior:auto`.

## 5. QA 결과
- `python qa.py 01-airpods`: 콘솔 에러 0, 404 0 (desktop 14,057px / mobile 11,241px).
- Playwright로 스크럽 확인: closer progress 0 → 0.36 → 0.73 → 1 일 때 프레임 0 → 44 → 88 → 120, 콜아웃 opacity 전환 확인. structure 층 translate 78px → 38px → 0. 앵커 클릭 시 섹션 top이 52px(로컬 nav 아래)에 정확히 멈춤. 프레임 121장 로드 0.5초 이내(로컬).
- 1차 수정: 히어로가 900px 뷰포트를 넘침 → 여백·이미지 높이 축소. 모바일 글로우가 초록 얼룩처럼 보임 → 이미지 박스 기준으로 범위·농도 축소. 로컬 서버에서 프레임이 영상 뒤로 밀려 캔버스가 수 초간 비어 보임 → 첫 프레임 preload + 단독 선로드. 모바일 캔버스 제품이 작음 → 세로 화면 확대.
- 2차 수정: 측면 프레임에서 제품이 왼쪽 콜아웃과 겹침 → 제품 0.86 배, 콜아웃 폭 250px·바깥쪽으로 이동. `imageSmoothingQuality:'high'`.

## 6. 남은 거친 부분
- **알파 프레임 매트 품질**: `turntable2_alpha` 웹p의 가장자리(특히 밝은 윗면)가 계단 모양으로 거칠다(원본 매트가 블록 단위). 캔버스 코드 문제가 아니라 자산 문제라 재매팅(페더링)이 필요. jpg 원본은 배경이 밝은 회색 그라데이션(RGB 200~231)이라 흰 섹션에 그대로 쓸 수 없음.
- 통기도 수치는 `○○ cm³/cm²/s` 자리만 둠(브리프). KC 번호 `CB0000-0000` 가상.
- 분해도 clip 경계(40% / 62%)는 커버 오른쪽 끝이 1~2% 걸쳐 있어 스크럽 중간 상태에서 아주 얇은 띠가 보일 수 있음. 최종 상태는 원본과 동일.
- Safari 구버전의 `100svh` 미지원 시 `100vh` 폴백만 적용.
