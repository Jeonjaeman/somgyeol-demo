/* 솜결 에어 베개 · 데모 01 (Apple AirPods Pro 스타일) */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileMQ = window.matchMedia('(max-width: 767px)');
  var isMobile = mobileMQ.matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  var lnavH = 52;

  /* ---------------------------------------------------------------
   * 1. 히어로 등장 (scale 1.06 → 1, fade)
   * ------------------------------------------------------------- */
  (function hero() {
    if (!hasGsap || reduced) return;
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__eyebrow', { y: 14, opacity: 0, duration: .8 }, 0)
      .from('.hero__title .line', { y: 28, opacity: 0, duration: 1.1, stagger: .09 }, .05)
      .from('.hero__sub', { y: 18, opacity: 0, duration: .9 }, .3)
      .from('.hero__img', { scale: 1.06, opacity: 0, duration: 1.6 }, .15)
      .from('.hero__glow', { opacity: 0, scale: .9, duration: 1.8 }, .3);
  })();

  /* ---------------------------------------------------------------
   * 2. 로컬 nav: 앵커 부드러운 스크롤 + 현재 섹션 표시
   * ------------------------------------------------------------- */
  (function localNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.lnav__anchors a'));
    if (!links.length) return;
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('data-anchor')); });

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = targets[i];
        if (!el) return;
        var top = el.id === 'overview' ? 0 : el.getBoundingClientRect().top + window.pageYOffset - lnavH;
        window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset + window.innerHeight * .55;
      var active = 0;
      targets.forEach(function (el, i) {
        if (el && el.getBoundingClientRect().top + window.pageYOffset <= y) active = i;
      });
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------------------------------------------------------------
   * 3. 하이라이트 카드 슬라이더 (Swiper) + 재생/일시정지
   * ------------------------------------------------------------- */
  (function highlights() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.card__video'));
    var playBtn = document.querySelector('.highlights__play');
    var userPaused = false;
    var inView = true;

    function syncPlayback() {
      videos.forEach(function (v) {
        if (userPaused || !inView) { v.pause(); }
        else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
    }

    if (typeof Swiper !== 'undefined') {
      new Swiper('.highlights__swiper', {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 16,
        grabCursor: true,
        speed: reduced ? 0 : 650,
        watchSlidesProgress: true,
        keyboard: { enabled: true },
        navigation: { nextEl: '.highlights__next', prevEl: '.highlights__prev' },
        pagination: { el: '.highlights__dots', clickable: true },
        breakpoints: { 768: { spaceBetween: 24 } }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        playBtn.classList.toggle('is-paused', userPaused);
        playBtn.classList.toggle('is-playing', !userPaused);
        playBtn.setAttribute('aria-pressed', String(userPaused));
        playBtn.setAttribute('aria-label', userPaused ? '영상 재생' : '영상 일시정지');
        syncPlayback();
      });
    }

    if ('IntersectionObserver' in window) {
      var sec = document.querySelector('.highlights');
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: .05 }).observe(sec);
    }
  })();

  /* ---------------------------------------------------------------
   * 4. 가까이 보기: sticky 캔버스 + 프레임 시퀀스 스크럽
   *    (Apple은 알파 영상 currentTime 스크럽, 여기선 알파 webp 121장)
   * ------------------------------------------------------------- */
  (function closer() {
    var section = document.querySelector('.closer');
    var canvas = document.querySelector('.closer__canvas');
    var stage = document.querySelector('.closer__stage');
    var progressEl = document.querySelector('.closer__progress');
    var bar = progressEl && progressEl.querySelector('i');
    var pct = progressEl && progressEl.querySelector('em');
    if (!section || !canvas) return;

    var FRAME_DIR = '../assets/frames/turntable2_alpha/';
    var TOTAL = 121;
    var step = isMobile ? 2 : 1;               // 모바일: 격번 프레임만 (61장)
    var indices = [];
    for (var i = 1; i <= TOTAL; i += step) indices.push(i);
    var n = indices.length;
    var imgs = new Array(n);
    var loadedCount = 0;
    var current = -1;
    var pending = false;
    var proxy = { frame: 0 };
    var ctx = canvas.getContext('2d');
    try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) {}
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function src(i) { return FRAME_DIR + 'f_' + ('000' + i).slice(-3) + '.webp'; }

    function fit() {
      var r = stage.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width));
      var h = Math.max(1, Math.round(r.height));
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
      }
      current = -1;
      requestRender();
    }

    function nearestLoaded(idx) {
      if (imgs[idx] && imgs[idx].complete && imgs[idx].naturalWidth) return idx;
      for (var d = 1; d < n; d++) {
        if (idx - d >= 0 && imgs[idx - d] && imgs[idx - d].naturalWidth) return idx - d;
        if (idx + d < n && imgs[idx + d] && imgs[idx + d].naturalWidth) return idx + d;
      }
      return -1;
    }

    function draw(idx) {
      var k = nearestLoaded(idx);
      if (k < 0) return;
      var img = imgs[k];
      var cw = canvas.width, ch = canvas.height;
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var portrait = ch > cw;
      // contain: 제품이 잘리지 않게. 세로 화면에서는 가로폭 기준 살짝 키움.
      // 세로 화면(모바일)에서는 프레임의 투명 여백을 잘라내고 제품을 키움
      var scale = portrait ? (cw / iw) * 1.28 : Math.min(cw / iw, ch / ih) * 0.86;
      var dw = iw * scale, dh = ih * scale;
      var dx = (cw - dw) / 2, dy = (ch - dh) / 2 - (portrait ? ch * 0.06 : 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
      current = k;
    }

    function requestRender() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var idx = Math.max(0, Math.min(n - 1, Math.round(proxy.frame)));
        if (idx !== current) draw(idx);
      });
    }

    function onLoaded() {
      loadedCount++;
      var p = Math.round(loadedCount / n * 100);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = p + '%';
      if (loadedCount === n && progressEl) progressEl.classList.add('is-done');
      if (current < 0 || loadedCount === n) { current = -1; requestRender(); }
    }

    function preload(limitTo) {
      var queue = [];
      for (var j = 0; j < (limitTo || n); j++) queue.push(j);
      // 첫 프레임을 가장 먼저 받고(즉시 표시), 나머지는 6개씩 병렬
      var concurrency = 6;
      var first = true;
      function next() {
        if (first) {
          first = false;
          var j0 = queue.shift();
          var im0 = new Image();
          im0.decoding = 'async';
          im0.onload = function () { onLoaded(); for (var c = 0; c < concurrency; c++) next(); };
          im0.onerror = function () { onLoaded(); for (var c = 0; c < concurrency; c++) next(); };
          im0.src = src(indices[j0]);
          imgs[j0] = im0;
          return;
        }
        if (!queue.length) return;
        var j = queue.shift();
        var im = new Image();
        im.decoding = 'async';
        im.onload = function () { onLoaded(); next(); };
        im.onerror = function () { onLoaded(); next(); };
        im.src = src(indices[j]);
        imgs[j] = im;
      }
      next();
    }

    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
    else window.addEventListener('resize', fit);
    fit();

    if (reduced || !hasGsap) {
      // 정적: 첫 프레임만 그리고 콜아웃은 아래에 나열
      n = 1; imgs = new Array(1);
      preload(1);
      if (progressEl) progressEl.classList.add('is-done');
      var wrap = document.createElement('div');
      wrap.className = 'callouts-static';
      Array.prototype.forEach.call(document.querySelectorAll('.callout'), function (c) { wrap.appendChild(c); });
      document.querySelector('.closer__pin').appendChild(wrap);
      return;
    }

    preload();
    window.__somgyeol = { frames: function () { return { loaded: loadedCount, total: n, current: current }; } };

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
    tl.to(proxy, { frame: n - 1, ease: 'none', duration: 1, onUpdate: requestRender }, 0);

    // 프레임 임계점마다 콜아웃 페이드 인/아웃
    var callouts = [
      { el: '.callout--1', at: 0.10, out: 0.34 },
      { el: '.callout--2', at: 0.40, out: 0.64 },
      { el: '.callout--3', at: 0.70, out: 0.96 }
    ];
    callouts.forEach(function (c) {
      tl.fromTo(c.el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .07, ease: 'power2.out' }, c.at)
        .to(c.el, { opacity: 0, y: -10, duration: .05, ease: 'power2.in' }, c.out);
    });
  })();

  /* ---------------------------------------------------------------
   * 5. 3겹 구조: 분해도 복제 3장 clip-path + translate 로 층 분리
   * ------------------------------------------------------------- */
  (function structure() {
    if (!hasGsap || reduced) return;
    var section = document.querySelector('.structure');
    if (!section) return;

    var top = '.explode__layer--top', base = '.explode__layer--base';
    var st = isMobile
      ? { trigger: '.explode', start: 'top 85%', end: 'bottom 40%', scrub: 0.6 }
      : { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true };

    var tl = gsap.timeline({ scrollTrigger: st });
    tl.fromTo(top, { yPercent: 14 }, { yPercent: 0, ease: 'none', duration: .62 }, 0)
      .fromTo(base, { yPercent: -13 }, { yPercent: 0, ease: 'none', duration: .62 }, 0);

    if (!isMobile) {
      tl.fromTo('.layer--1', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .1 }, .18)
        .fromTo('.layer--2', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .1 }, .38)
        .fromTo('.layer--3', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .1 }, .58);
    }
  })();

  /* ---------------------------------------------------------------
   * 6. 숫자 카운트업
   * ------------------------------------------------------------- */
  (function numbers() {
    var counts = Array.prototype.slice.call(document.querySelectorAll('.count'));
    if (!counts.length) return;
    function finish() { counts.forEach(function (el) { el.textContent = el.getAttribute('data-to'); }); }
    if (!hasGsap || reduced) { finish(); return; }
    ScrollTrigger.create({
      trigger: '.stats',
      start: 'top 80%',
      once: true,
      onEnter: function () {
        counts.forEach(function (el, i) {
          var to = parseFloat(el.getAttribute('data-to')) || 0;
          var o = { v: 0 };
          gsap.to(o, {
            v: to, duration: 1.4, delay: i * .08, ease: 'power3.out',
            onUpdate: function () { el.textContent = Math.round(o.v); },
            onComplete: function () { el.textContent = String(to); }
          });
        });
      }
    });
  })();

  /* ---------------------------------------------------------------
   * 7. 색 칩 hover
   * ------------------------------------------------------------- */
  (function chips() {
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var label = document.querySelector('.chips__label');
    if (!chips.length || !label) return;
    var locked = chips[0];
    function show(chip) {
      chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      label.textContent = chip.getAttribute('data-name');
    }
    chips.forEach(function (c) {
      c.addEventListener('mouseenter', function () { show(c); });
      c.addEventListener('focus', function () { show(c); });
      c.addEventListener('click', function () { locked = c; show(c); });
      c.addEventListener('mouseleave', function () { show(locked); });
      c.addEventListener('blur', function () { show(locked); });
    });
  })();

  /* ---------------------------------------------------------------
   * 8. 스크롤 리빌 (헤드라인·미디어)
   * ------------------------------------------------------------- */
  (function reveals() {
    if (!hasGsap || reduced) return;
    var els = gsap.utils.toArray('.reveal');
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 26 });
    ScrollTrigger.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: .9, ease: 'power2.out', stagger: .08, overwrite: true, clearProps: 'transform' });
      }
    });
  })();

  /* ---------------------------------------------------------------
   * 9. FAQ 아코디언 (details 높이 애니메이션)
   * ------------------------------------------------------------- */
  (function faq() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.acc__item'));
    if (!items.length || !hasGsap || reduced) return;
    items.forEach(function (d) {
      var summary = d.querySelector('summary');
      var body = d.querySelector('.acc__body');
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open) {
          gsap.to(body, { height: 0, opacity: 0, duration: .32, ease: 'power2.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'all' }); } });
        } else {
          d.open = true;
          gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .4, ease: 'power2.out', clearProps: 'height' });
        }
      });
    });
  })();

  /* 폰트·이미지 로드 후 위치 재계산 */
  window.addEventListener('load', function () { if (hasGsap) ScrollTrigger.refresh(); });
})();
