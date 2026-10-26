# 02-ipad · 솜결 에어 베개 (Apple iPad Air KR 컨셉) 제작 노트

파일: `index.html`, `style.css`, `main.js`, QA 산출물 `_qa_desktop.jpg`, `_qa_mobile.jpg`, `_qa_report.json`
확인 서버: demo 폴더에서 `python -m http.server 8201 --bind 127.0.0.1` → http://127.0.0.1:8201/02-ipad/index.html

## 1. 참고 사이트(iPad Air KR)에서 가져온 기법
출처: `research/소스분석.md` 2절 + 직접 curl 확인(섹션 순서 welcome → highlights → closer-look(viewer-colornav) → themes(sticky 탭 바) → values).

| iPad Air 기법 | 이 데모에서의 적용 |
|---|---|
| "슈우웅." 160px 한 단어 의성어 히어로 | "폭신." `clamp(88px, 13vw, 160px)` 800 웨이트, 자간 -0.04em, 부제 "숨쉬듯 가볍게." |
| 세로 알파 webm이 떠 있는 제품 | 알파 webp 컷아웃(p04)을 하늘색 패널 위에 띄우고 GSAP yoyo 부유 루프 + 마우스 패럴랙스(quickTo x / rotateX / rotateY, perspective 900) |
| 색상 선택 = 색상별 이미지 세트 교체(`viewer-colornav` radiogroup) | 칩 4개(role=radio) 클릭·hover·focus 시 p23/p20/p21/p22 크로스페이드(opacity+scale), 패널 배경색(`--picker-bg`)을 이미지 배경색과 동일한 값으로 전환, 색 이름·구매 패널 칩까지 한 세트로 동기화 |
| 테마 섹션 안 sticky 56px 탭 바(all-access-pass) | 핀된 가로 스크롤 섹션 안에 56px 탭 바. ScrollTrigger progress → 카드 offset 비교로 활성 탭 갱신, 탭 클릭 시 해당 카드 위치의 scrollY로 이동 |
| 흰색 / #f5f5f7 패널 교차, 큰 라운드 | 흰 페이지 + 16px 거터 안의 28px 라운드 파스텔 패널(sky / sage / blush / butter / grey) 교차 |
| 한국어 헤드라인 80px/600, 영문 최소 | 섹션 헤드라인 `clamp(48px, 7.6vw, 110px)` 800, 일부는 그라디언트 fill(`background-clip:text`), 영문은 워드마크·라벨만 |
| `backdrop-filter` 로컬 nav | sticky 52px nav, blur(20px) saturate, hover 밑줄만(이동 없음) |

## 2. 섹션 구성과 구현
1. **히어로**(sky 패널): 폭신. / 숨쉬듯 가볍게. / CTA 2개(동작 없음). 부유 애니메이션 + 패럴랙스.
2. **선언**(흰색): "가볍고, 정직하게." 그라디언트 헤드라인 + 세 가지 약속 카드.
3. **색상 선택기**(패널 색 전환): 4:5 프레임에 이미지 4장 겹쳐 두고 `.is-on` 크로스페이드. 패널 배경은 각 이미지의 실제 배경색(#AADCFB / #BECFB7 / #FAD4DD / #FDECAB)으로 맞춰 이음새가 없음.
4. **핀 가로 스크롤**: `gsap.matchMedia('(min-width:768px)')`에서 `.hscroll__pin`을 `top 52px`(nav 높이)에서 핀, `x: -(scrollWidth - innerWidth)` scrub 0.6. 카드 5장(색 4 + 전체 라인업 p05). 탭 바는 pin 요소 안 sticky.
5. **가볍다. 180 g**: `data-to` 카운트업(power3.out 1.6s) + p01 측면 이미지 슬라이드 인(back.out) + 스탯 타일 3개(5 cm / 0·2·4 mm / 20회).
6. **깨어 있는 시간을 위해**(butter 패널): p24를 하늘색 라운드 프레임에 넣어 노랑 안의 파랑 투톤. 수면 문구 없음, 뒤집기 중단 명시.
7. **세 겹의 결**: p02 분해도 위에 회색 커튼(`transform-origin:top`, scaleY .82 → .66 → .34 → 0)을 스크럽 타임라인으로 걷어 올려 아래층부터 드러냄. 각 구간 onStart/onReverseComplete로 라벨 `.is-on` 토글. 핀 길이 1400px.
8. **기능 4카드**: 메쉬 / 오목면 / 세탁 / 높이 조절, 아이콘은 인라인 SVG 도형만(text 없음).
9. **선물**(blush 패널): p10을 `mix-blend-mode:multiply`로 패널에 녹임 + 선물하기 CTA.
10. **안전 안내**(흰색, 필수): 질병관리청 권고 먼저 → 솜결 사용 원칙(검정 카드) → 두상 관리 기본(Mawji 2013) → KC 안전확인 신고번호 자리.
11. **사양 + FAQ 5개**(높이 애니메이션 아코디언, aria-expanded) + **구매 패널**(89,000원, 칩, 구매 버튼 hover만) + **푸터**(안전 문구·가상 회사 정보·데모 고지).

흰 배경 제품 사진(p01, p02, p00b, p05)은 회색·흰 패널 안에서 `mix-blend-mode:multiply`로 테두리 박스가 보이지 않게 처리.

## 3. 모바일(≤767px) 단순화
- 핀 가로 스크롤 → 핀 해제, `.hscroll__track`을 `overflow-x:auto; scroll-snap-type:x mandatory` 네이티브 스냅 행으로 전환. 탭 바는 nav 아래(top 52px) sticky로 유지, 트랙 `scroll` 이벤트로 활성 탭 갱신, 탭 클릭은 `track.scrollTo`.
- 세 겹 리빌 → 핀 없이 프레임이 70% 지점에 들어오면 한 번 재생되는 3단계 타임라인.
- 히어로 패럴랙스는 `(hover:hover) and (min-width:768px)`에서만.
- 그리드는 모두 1열, 헤드라인 clamp 하한 48px(히어로 88px), 거터 16px·라운드 22px.
- `srcset`으로 `_m`(960px) 자산 우선 선택.

## 4. 접근성·감속 모션
- `prefers-reduced-motion: reduce`: `html.no-motion` 부여, GSAP 초기화 전체 스킵(ScrollTrigger 0개), reveal·커튼·슬라이드 인 모두 정적 표시. 색상 선택·탭·FAQ는 그대로 동작.
- 칩은 `role=radio` + `aria-checked`, 탭은 `role=tab` + `aria-selected`, 색 이름은 `aria-live`.

## 5. QA 결과
- `python qa.py 02-ipad`: 데스크톱 12,320px / 모바일 10,470px, 콘솔 에러 0, 404 0.
- Playwright 추가 검증(색상 선택·핀): 칩 4색 클릭 시 패널 배경 rgb가 각 이미지 배경색과 일치, 보이는 이미지 1장만 전환, 구매 패널 칩 동기화. 핀 progress 0 / .3 / .6 / .95에서 track translateX 0 / -444 / -888 / -1406px, pin top 52px 고정, 활성 탭 아이보리→세이지→더스티 핑크→오트. 탭 클릭 시 scrollY 이동 및 활성 탭 갱신. 세 겹 커튼 scaleY .81 → .44 → 0, 라벨 1→2→3 누적. 카운트업 180 도달. 모바일 핀 0개·스냅 행 동작, 탭 클릭 scrollLeft 652. 감속 모션에서 숨겨진 reveal 0개. 본문 em/en 대시 0건.
- 2차 반복에서 고친 것: 핀 시작점이 nav 뒤에 숨던 문제(`top 52px`로), 흰 배경 사진의 박스 느낌(multiply), 세 겹 섹션 시작 시 빈 회색 박스(커튼 초기 .82), 모바일 탭 줄바꿈(nowrap).

## 6. 거친 부분 / 후속 제안
- 가로 스크롤 카드의 4:5 이미지는 `object-fit:cover`라 1440 폭에서 상하가 약간 잘린다. 실제 촬영 시 여백 있는 원본이면 `contain`으로 바꾸면 됨.
- 탭 클릭은 네이티브 `scrollTo({behavior:'smooth'})`를 쓴다(ScrollToPlugin 미사용). 스크럽 0.6 때문에 도착 직후 트랙이 0.3초쯤 따라온다.
- 히어로는 iPad Air처럼 알파 영상 1회 재생이 아니라 정지 컷아웃 부유다. `assets/frames/turntable2_alpha`가 준비되면 교체 가능.
- 통기도 수치는 자리만(`○○ cm³/cm²/s`). KC 신고번호·OEKO-TEX는 가상 표기로 명시.
