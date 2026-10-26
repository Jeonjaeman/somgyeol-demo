/* 솜결 데모 05 : 캠페인 마이크로사이트 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (reduce || !hasGsap) document.documentElement.classList.add('no-motion');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 헤더: 히어로를 벗어나면 흰 배경 ---------- */
  var header = $('#header');
  var hero = $('#hero');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var solid = y > hero.offsetHeight - 110;
    header.classList.toggle('is-solid', solid);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 오프캔버스 메뉴 ---------- */
  var menuBtn = $('#menuBtn'), side = $('#sideMenu'), backdrop = $('#sideBackdrop'), sideClose = $('#sideClose');
  function openMenu() {
    backdrop.hidden = false;
    requestAnimationFrame(function () { backdrop.classList.add('is-on'); side.classList.add('is-open'); });
    side.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    backdrop.classList.remove('is-on'); side.classList.remove('is-open');
    side.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(function () { if (!side.classList.contains('is-open')) backdrop.hidden = true; }, 380);
  }
  menuBtn.addEventListener('click', openMenu);
  sideClose.addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  /* ---------- 히어로 배지: 제품 섹션으로 스크롤 ---------- */
  $$('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function () {
      var t = $(el.getAttribute('data-scroll'));
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- 히어로 영상: 재생 실패 시 포스터 유지 ---------- */
  var hv = $('.hero-video');
  if (hv) { var p = hv.play && hv.play(); if (p && p.catch) p.catch(function () {}); }

  /* ---------- 컨셉 슬라이더 (Swiper 11) ---------- */
  var counterCur = $('#counterCur');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var conceptSwiper = null;
  if (typeof Swiper !== 'undefined') {
    conceptSwiper = new Swiper('#conceptSwiper', {
      slidesPerView: 1,
      spaceBetween: 40,
      speed: reduce ? 0 : 750,
      autoHeight: true,
      loop: false,
      grabCursor: true,
      keyboard: { enabled: true },
      navigation: { prevEl: '#conceptPrev', nextEl: '#conceptNext' },
      on: {
        slideChange: function (sw) {
          var n = sw.realIndex + 1;
          var head = $$('.slide-head', sw.slides[sw.activeIndex]);
          if (hasGsap && !reduce) {
            gsap.fromTo(counterCur, { yPercent: 100, opacity: 0 }, {
              yPercent: 0, opacity: 1, duration: .55, ease: 'power3.out',
              onStart: function () { counterCur.textContent = pad(n); }
            });
            if (head.length) {
              gsap.fromTo($$('.slide-en, .slide-ko, .slide-caption', head[0]),
                { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power3.out', delay: .1 });
            }
          } else {
            counterCur.textContent = pad(n);
          }
          if (hasGsap) ScrollTrigger.refresh();
        }
      }
    });
  }

  /* 컨셉 썸네일 -> 슬라이더 이동 */
  $$('.concept-card button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = parseInt(btn.getAttribute('data-slide'), 10) || 0;
      var target = $('#concept');
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (conceptSwiper) setTimeout(function () { conceptSwiper.slideTo(idx); }, reduce ? 0 : 450);
    });
  });

  /* ---------- 인터뷰 모달 ---------- */
  var modal = $('#videoModal'), modalVideo = $('#modalVideo'), playBtn = $('#playBtn');
  function openModal() {
    modal.hidden = false;
    document.body.classList.add('menu-open');
    modalVideo.currentTime = 0;
    var pr = modalVideo.play(); if (pr && pr.catch) pr.catch(function () {});
    if (hasGsap && !reduce) gsap.fromTo('.modal-box', { y: 30, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: 'power3.out' });
    $('#modalClose').focus();
  }
  function closeModal() {
    modalVideo.pause();
    modal.hidden = true;
    document.body.classList.remove('menu-open');
    playBtn.focus();
  }
  playBtn.addEventListener('click', openModal);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (side.classList.contains('is-open')) closeMenu();
  });

  /* ---------- 포토 콘테스트 갤러리 ---------- */
  var IMG = '../assets/img/web/';
  var pool = [
    ['p06_baby_topdown_m.webp', 'r45'], ['p28_campaign_morning_m.webp', 'r43'], ['p09_father_baby_m.webp', 'r11'],
    ['p24_baby_studio_blue_m.webp', 'r43'], ['p30_campaign_sunny_m.webp', 'r45'], ['p08_grass_m.webp', 'r11'],
    ['p29_campaign_afternoon_m.webp', 'r45'], ['p31_night_lamp_m.webp', 'r43'], ['p26_cover_unzip_m.webp', 'r11'],
    ['p07_nursery_wide_m.webp', 'r43'], ['p10_giftbox_m.webp', 'r45'], ['p00_master_3q_m.webp', 'r11']
  ];
  var titles = [
    '창가에서 터미타임 10분, 오늘도 성공', '아빠 무릎 위가 제일 좋은 자리', '소파 옆에 두고 눈 맞추는 오후',
    '첫 외출, 돗자리 위에서 까르르', '잔디밭 바람 맞으며 깨어 있는 시간', '할머니 손 잡고 노는 토요일',
    '낮잠 깨고 나서 가장 기분 좋은 얼굴', '커버 빨래하는 날, 아기는 구경 중', '창문 너머 고양이 보는 중',
    '엄마 손가락 꼭 잡고', '선물로 받은 날, 상자가 더 좋아요', '형아랑 처음 같이 놀던 날',
    '아침 햇살이 제일 예쁜 7시', '아빠 출근 전 10분 놀이', '거실 매트 위 데굴데굴',
    '이모가 찍어 준 첫 사진', '뒤집기 연습 전 몸풀기', '오늘은 세이지 커버로',
    '목욕 끝나고 보송보송', '공원 벤치 앞 돗자리', '비 오는 날 창가 놀이',
    '옹알이 한창인 4개월', '할아버지 품에서 방긋', '첫 이유식 전 기념 사진'
  ];
  var authors = ['김○○ 님 (대구, 생후 3개월)', '이○○ 님 (서울, 생후 2개월)', '박○○ 님 (부산, 생후 4개월)', '최○○ 님 (인천, 생후 3개월)',
    '정○○ 님 (광주, 생후 5개월)', '한○○ 님 (대전, 생후 2개월)', '오○○ 님 (울산, 생후 4개월)', '윤○○ 님 (수원, 생후 3개월)'];
  var counts = [123, 98, 141, 76, 112, 64, 158, 89, 101, 55, 134, 72, 119, 83, 147, 61, 95, 128, 70, 106, 88, 152, 67, 110];

  var grid = $('#galleryGrid');
  var PER = 8, PAGES = 3, page = 0;
  var heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" fill="currentColor"/></svg>';

  function cardHtml(i) {
    var a = pool[i % pool.length];
    return '<article class="gcard ' + a[1] + '">' +
      '<div class="gcard-img"><img src="' + IMG + a[0] + '" alt="" loading="lazy"></div>' +
      '<div class="gcard-body"><p class="gcard-title">' + titles[i % titles.length] + '</p>' +
      '<div class="gcard-meta"><span class="gcard-author">' + authors[i % authors.length] + '</span>' +
      '<span class="gcard-count">' + heart + '참여 ' + counts[i % counts.length] + '</span></div></div></article>';
  }
  function renderPage(n, animate) {
    page = (n + PAGES) % PAGES;
    var html = '';
    for (var i = page * PER; i < page * PER + PER; i++) html += cardHtml(i);
    var swap = function () {
      grid.innerHTML = html;
      $$('#galPager button').forEach(function (b, k) {
        b.classList.toggle('is-active', k === page);
        if (k === page) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
      if (hasGsap && !reduce && animate) {
        gsap.fromTo($$('.gcard', grid), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power2.out' });
      }
      if (hasGsap) ScrollTrigger.refresh();
    };
    if (hasGsap && !reduce && animate && grid.children.length) {
      gsap.to(grid, { opacity: 0, duration: .22, ease: 'power1.in', onComplete: function () { gsap.set(grid, { opacity: 1 }); swap(); } });
    } else swap();
  }
  renderPage(0, false);
  $('#galPrev').addEventListener('click', function () { renderPage(page - 1, true); });
  $('#galNext').addEventListener('click', function () { renderPage(page + 1, true); });
  $$('#galPager button').forEach(function (b) {
    b.addEventListener('click', function () { renderPage(parseInt(b.getAttribute('data-page'), 10), true); });
  });

  /* ---------- 스크롤 연출 (GSAP) ---------- */
  if (!hasGsap || reduce) {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  // 등장
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: function (els) {
      // 점프 스크롤 시 한 번에 수십 개가 들어오면 stagger가 길어지므로, 화면 밖 요소는 즉시 완료
      var vh = window.innerHeight, onScreen = [], offScreen = [];
      els.forEach(function (e) {
        var r = e.getBoundingClientRect();
        (r.bottom > 0 && r.top < vh ? onScreen : offScreen).push(e);
      });
      if (offScreen.length) { gsap.set(offScreen, { opacity: 1, y: 0, overwrite: true }); offScreen.forEach(function (e) { e.classList.add('is-in'); }); }
      if (onScreen.length) {
        gsap.to(onScreen, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'power3.out', overwrite: true,
          onComplete: function () { onScreen.forEach(function (e) { e.classList.add('is-in'); }); } });
      }
    },
    once: true
  });

  // 히어로 타이틀
  gsap.from('.hero-title .line, .hero-sub, .hero-eyebrow', { y: 40, opacity: 0, duration: 1.1, stagger: .12, ease: 'power3.out', delay: .2 });
  gsap.from('.hero-badge', { scale: .6, opacity: 0, duration: .8, ease: 'back.out(1.6)', delay: 1 });

  var mm = gsap.matchMedia();

  // 데스크톱: 핀 두 구간 (인트로 3x, 강조 1.5x)
  mm.add('(min-width: 769px)', function () {
    // 인트로 핀: 가로 텍스트 슬라이드 + 문장 단계 등장 + 진행 바
    var introSteps = $$('.intro-step');
    gsap.set(introSteps, { opacity: 0, y: 30 });
    var introTl = gsap.timeline({
      scrollTrigger: { trigger: '#intro', start: 'top top', end: 'bottom bottom', pin: '#introPin', pinSpacing: false, scrub: .6 }
    });
    introTl.to('#introSlide', { xPercent: -55, ease: 'none', duration: 10 }, 0)
      .to('#introBar', { scaleX: 1, ease: 'none', duration: 10 }, 0)
      .to(introSteps, { opacity: 1, y: 0, stagger: 1.1, duration: 1.6, ease: 'power2.out' }, .4);

    // 강조 핀: scale 2 -> 1, opacity 0 -> 1 (참고 사이트 c_emphasize)
    gsap.set('#emphText', { scale: 2, opacity: 0 });
    gsap.set('#emphSub, .emph-label', { opacity: 0, y: 20 });
    var emphTl = gsap.timeline({
      scrollTrigger: { trigger: '#emph', start: 'top top', end: 'bottom bottom', pin: '#emphPin', pinSpacing: false, scrub: .6 }
    });
    emphTl.to('#emphText', { scale: 1, opacity: 1, ease: 'power2.out', duration: 6 }, 0)
      .to('.emph-label', { opacity: .8, y: 0, duration: 2 }, 3)
      .to('#emphSub', { opacity: .9, y: 0, duration: 3 }, 4);

    return function () { gsap.set([introSteps, '#emphText', '#emphSub', '.emph-label', '#introSlide', '#introBar'], { clearProps: 'all' }); };
  });

  // 모바일: 핀 없이 일반 등장
  mm.add('(max-width: 768px)', function () {
    gsap.from('.intro-step', { opacity: 0, y: 24, stagger: .12, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '#intro', start: 'top 70%' } });
    gsap.from('#emphText', { scale: 1.4, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '#emph', start: 'top 70%' } });
    gsap.from('#emphSub, .emph-label', { opacity: 0, y: 16, duration: .8, delay: .2, stagger: .1,
      scrollTrigger: { trigger: '#emph', start: 'top 70%' } });
  });

  // 높이 단계 바: 세그먼트 순차 채움
  gsap.to('.seg i', { scaleX: 1, duration: .9, stagger: .35, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.seg-bar', start: 'top 85%', once: true } });

  // 숫자 카운트
  $$('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', snap: { v: 1 },
      onUpdate: function () { el.textContent = Math.round(o.v); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // 참여 총계 카운트
  var totalEl = $('#totalNum');
  if (totalEl) {
    var tot = { v: 0 };
    gsap.to(tot, { v: 1284, duration: 1.6, ease: 'power2.out',
      onUpdate: function () { totalEl.textContent = Math.round(tot.v).toLocaleString('ko-KR'); },
      scrollTrigger: { trigger: totalEl, start: 'top 85%', once: true } });
  }

  // 컨셉 카운터 최초 등장
  gsap.from(counterCur, { yPercent: 100, opacity: 0, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: '.concept-bar', start: 'top 85%', once: true } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
