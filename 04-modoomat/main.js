/* 솜결 데모 04 · 모두의매트 컨셉
   의존성 없음. IntersectionObserver 리빌, 숫자 카운트업, 핀 고정 층 분해(스크롤 진행률), 헤더 축소, 모바일 메뉴, FAQ 단일 열기. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---------- 헤더 ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  var onHeader = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onHeader();
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle.click(); });
    });
  }

  /* ---------- 리빌 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // 스태거 그룹: 부모에 data-stagger가 있으면 순서대로 지연
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
        el.style.transitionDelay = (i * 0.12) + 's';
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 카운트업 ---------- */
  var counters = document.querySelectorAll('.count');
  var runCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduced) { el.textContent = String(target); return; }
    var start = null, dur = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var p = clamp((ts - start) / dur, 0, 1);
      el.textContent = String(Math.round(target * easeOut(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- 핀 고정 층 분해 ---------- */
  var driver = document.querySelector('[data-layers]');
  var stack = document.querySelector('[data-layers-stack]');
  var numEl = document.querySelector('[data-layers-num]');
  var captions = document.querySelectorAll('[data-layers-captions] .layers-caption');
  var dots = document.querySelectorAll('.layers-dots li');
  var layers = stack ? stack.querySelectorAll('.layer') : [];
  var LAYERS = 8;
  var activeIdx = -1;
  var ticking = false;

  var setActive = function (idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;
    if (numEl) numEl.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1);
    captions.forEach(function (c, i) { c.classList.toggle('is-active', i === idx); });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === idx);
      d.classList.toggle('is-done', i < idx);
    });
    layers.forEach(function (l, i) { l.classList.toggle('is-active', i === idx); });
  };

  var updateLayers = function () {
    ticking = false;
    if (!driver || driver.offsetParent === null) return; // display:none(모바일) 이면 건너뜀
    var rect = driver.getBoundingClientRect();
    var total = driver.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var p = clamp(-rect.top / total, 0, 1);

    // 0 ~ 0.22: 닫힌 상태에서 벌어짐. 이후 층별 하이라이트가 순서대로 진행
    var explode = easeOut(clamp(p / 0.22, 0, 1));
    var maxGap = Math.max(26, Math.min(46, window.innerHeight * 0.052));
    var gap = 4 + (maxGap - 4) * explode;
    stack.style.setProperty('--gap', gap.toFixed(2) + 'px');
    stack.classList.toggle('is-exploded', p > 0.08);

    // 살짝 기울기 변화로 입체감 (58deg -> 62deg, -32deg -> -26deg)
    var rx = 58 + 4 * explode, rz = -32 + 6 * explode;
    stack.style.transform = 'translate(-50%, -50%) rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';

    var seg = clamp((p - 0.16) / 0.80, 0, 0.9999);
    setActive(Math.floor(seg * LAYERS));
  };

  var onScroll = function () {
    onHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(updateLayers); }
  };

  if (driver && stack && !reduced) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setActive(0);
    updateLayers();
  } else {
    window.addEventListener('scroll', onHeader, { passive: true });
  }

  /* ---------- FAQ: 하나만 열기 ---------- */
  var faqs = document.querySelectorAll('.faq-list details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- 히어로 영상: 재생 실패 시 포스터만 ---------- */
  var video = document.querySelector('.hero video');
  if (video) {
    if (reduced) { video.removeAttribute('autoplay'); video.pause(); }
    var p = video.play && video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* 포스터 유지 */ });
  }
})();
