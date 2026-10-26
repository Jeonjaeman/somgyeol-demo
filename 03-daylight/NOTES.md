# 03 Daylight 컨셉 · 제작 노트

솜결 에어 베개 데모 메인페이지. 참고: daylightcomputer.com (분석은 `research/소스분석.md` 3절).

## 1. 참고 사이트에서 가져온 기법
| Daylight | 이 데모에서의 구현 |
|---|---|
| fixed 헤더, 섹션 색에 따라 톤 전환 | `.nav` fixed, 스크롤 40px 넘으면 `.is-solid`(아이보리 반투명 + blur)로 전환. 우측 pill 메뉴 + 앰버 CTA → 테라코타 `주문하기` pill |
| 히어로: 캔버스 프레임 시퀀스 + 영상 재생 썸네일 버튼 + 우하단 카드 | 히어로는 21:9 영상(v01) 풀블리드로 대체. 좌하단 영상 썸네일 카드(v03, 재생 아이콘) → 인라인 모달 플레이어(무음). 우하단 `재고 있음 · 2~3일 내 출고` 카드 + 주문 버튼 |
| `#introduction-section` 500vh sticky 문장 교체 | `.manifesto` 340vh, 안쪽 `position: sticky` 100vh. GSAP 타임라인 scrub 0.6으로 문장 4개 opacity/y 교차. 각 문장 마지막 단어 `<em>` 테라코타. 진행 점 4개, `data-active`로 현재 문장 노출(QA용) |
| 170프레임 webp 캔버스 스크롤(데스크톱 전용, 모바일은 정지 이미지) | `.turn` 220vh sticky, `assets/frames/turntable2_alpha/f_001~121.webp`(1200×900 알파, 합계 3.8MB)를 `drawImage`. 섹션이 150% 지점에 접근하면 선로드, DPR ≤2, 프레임 여백이 넓어 1.28배 확대 그리기. 1025px 이상에서만 동작, 이하·reduced-motion은 p00 정지 이미지 |
| `fixed inset-0 mix-blend-multiply` 영상 그레인 | SVG feTurbulence 노이즈를 data URI 배경으로 한 fixed 레이어, opacity .06, multiply, `steps(6)` 애니메이션으로 필름 그레인 흉내(영상 없이 0 바이트) |
| 밤(#18190f) ↔ 크림(#faf5f2) 배경 교차 | 아이보리 `#F6F1E8` / 오트 `#E8DCC8` ↔ 따뜻한 밤색 `#241F1A`, `#2E2824`. 순서: 히어로(영상, 어두움) → 선언문·턴테이블(아이보리/오트) → 잔디 → 사용 장면(아이보리) → 스토리(오트) → 매크로 영상·메쉬 밴드·저녁(밤색) → 안전·사양(아이보리) → 뉴스레터(오트) → 푸터(밤색) |
| Lenis + ScrollTrigger 연동 | Lenis 1.1.14 `lerp .09`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `lagSmoothing(0)`. 핀은 ScrollTrigger pin 대신 CSS sticky를 써서 pinSpacer 없이 Lenis와 충돌 없음 |
| 긴 핀 스토리 위 텍스트 교체 | `.macro` 280vh sticky 영상(v06) 위에 캡션 3개(퀼팅 커버 / 3D 에어메쉬 / 라벨)가 진행률 구간마다 등장·퇴장 |
| 세리프 300 거대 헤드라인 | 한국어라 Pretendard 600, 44~72px, line-height 1.18~1.3, 자간 -0.025em로 치환. 영문은 작은 라벨만 |
| 미디어 비네트 | 히어로·잔디·매크로·저녁 모두 좌측/하단 리니어 + 라디얼 비네트로 글자 가독성 확보 |

## 2. 구현 요약
- 파일: `index.html`, `style.css`, `main.js`. 라이브러리: GSAP 3.12.5 + ScrollTrigger(cdnjs), Lenis 1.1.14(jsdelivr), Pretendard 1.3.9.
- 영상 6개 모두 `muted loop playsinline` + poster. 히어로만 `preload="auto"`, 나머지는 `preload="none"` + `data-src`로 두고 IntersectionObserver(여유 200px)가 뷰포트에 들어올 때 `<source>`를 붙이고 재생, 벗어나면 일시정지.
- 아기방(p07) 카드: 데스크톱 hover 시 v05 영상이 1.1s 크로스페이드로 올라오고 재생. `(hover: hover)` 매체에서만.
- 잔디(p08) 패럴랙스: 이미지 높이 116%, `yPercent -6 → 6` scrub으로 스크롤보다 느리게 이동.
- 모달: `#clipModal`, ESC/배경/닫기 버튼으로 닫힘, 열려 있는 동안 `lenis.stop()` + body overflow hidden, 포커스 복귀.
- 안전 섹션: 질병관리청 권고 → 3개 규칙 카드 → KC 신고번호 자리 → 텍스트 배지 3개(KC / OEKO-TEX Class I / 공인기관 시험성적서). 의료 효능 표현 없음.
- 사양표 + 주문 패널(제품명, 89,000원, 색상 라디오 칩 4개 시각만, 주문 pill, 배송 안내), 뉴스레터 입력(disabled), 푸터 데모 고지.
- 내비·버튼은 전부 `javascript:void(0)`, 이동 없음.

## 3. 모바일 단순화 (≤768)
- 선언문: sticky 해제, 문장 4개를 좌측 정렬로 쌓아 보여 줌(30px).
- 턴테이블: 캔버스·진행바 숨기고 p00 정지 이미지(≤1024 포함).
- 매크로: sticky 해제, 4:5 영상 아래 캡션 3개를 쌓음.
- 저녁: 4:5 이미지 아래로 텍스트 내려 밤색 배경에 이어 붙임.
- 히어로: 영상 카드와 재고 카드를 좌우 가득 차게 세로 배치, 메뉴 pill 숨김(워드마크 + 주문하기만).
- 혜택 3개: 아이콘 좌측 + 텍스트 2열 리스트. `<picture>`로 768 이하에서 `_m`(960폭) 이미지 사용.
- 모바일 페이지 높이 11,322px, 데스크톱 15,854px.

## 4. reduced-motion
- Lenis·GSAP 타임라인·패럴랙스 전부 생성하지 않음. CSS에서 선언문/턴테이블/매크로 sticky 해제 후 정적 배치, 그레인 애니메이션 정지, 호버 영상 숨김. 확인: `reduced_motion="reduce"`로 열었을 때 `.manifesto__pin` position static, 높이 10,930px, 콘솔 에러 0.

## 5. QA 결과
- `python qa.py 03-daylight`: 데스크톱·모바일 콘솔 에러 0, HTTP 4xx 0.
- Playwright 검증: 선언문 진행률 0 / .22 / .35 / .62 / .9 / 1.0에서 `data-active` 0 → 1 → 1 → 2 → 3 → 3, 보이는 문장도 일치. 매크로 캡션 0.1/0.5/0.9에서 각각 하나만 opacity 1. 캔버스는 세 구간 모두 비어 있지 않음(알파 샘플 849~942). 모달 열림/재생/ESC 닫힘, 내비 solid 전환, 지연 영상 재생 확인.
- 1024·768 폭 추가 캡처로 히어로·턴테이블·사양 확인.

## 6. 거친 부분 / 다음에 손볼 것
- QA 스트립은 점프 후 700ms에 찍어 Lenis가 아직 감속 중인 프레임이 섞일 수 있음(선언문 교차 구간이 두 문장 겹쳐 보이거나 잔상). 직접 캡처에서는 문제 없음.
- 잔디 섹션은 p08 원본이 베개 클로즈업이라 1440에서 베개가 화면을 가득 채움. 더 넓은 잔디 컷이 생기면 교체 권장.
- 턴테이블 프레임은 흰 배경 제거본이라 그림자 없음. 바닥 그림자 레이어를 CSS로 깔면 더 붙어 보임.
- 통기도 수치 `○○ cm³/cm²/s`, KC 번호 `CB0000-0000`는 자리만 둠.
- 영상 자동 재생은 브라우저 정책상 무음일 때만 보장. 사파리 저전력 모드에서는 poster만 보일 수 있음.
