/* 솜결 · 03 Daylight concept
   Lenis 1.1.14 + GSAP 3.12.5 ScrollTrigger. Vanilla JS. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = function () { return window.innerWidth > 1024; };
  var isTablet = function () { return window.innerWidth > 768; };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  if (!reduced && hasGsap && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- nav solid on scroll ---------- */
  var nav = document.getElementById('nav');
  function updateNav() {
    nav.classList.toggle('is-solid', window.scrollY > 40);
  }
  if (lenis) lenis.on('scroll', updateNav);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---------- lazy videos: keep poster until in view ---------- */
  var lazyVideos = document.querySelectorAll('video[data-src]');
  function loadVideo(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    var s = document.createElement('source');
    s.src = v.dataset.src;
    s.type = 'video/mp4';
    v.appendChild(s);
    v.load();
  }
  function tryPlay(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (v.classList.contains('nursery__video')) return; // hover-driven
        if (e.isIntersecting) {
          loadVideo(v);
          if (!reduced) tryPlay(v);
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    lazyVideos.forEach(function (v) { io.observe(v); });
  } else {
    lazyVideos.forEach(function (v) { loadVideo(v); if (!reduced) tryPlay(v); });
  }

  /* ---------- nursery hover crossfade (desktop) ---------- */
  var frame = document.getElementById('nurseryFrame');
  var nurseryVideo = frame.querySelector('.nursery__video');
  if (window.matchMedia('(hover: hover)').matches && !reduced) {
    frame.addEventListener('mouseenter', function () {
      loadVideo(nurseryVideo);
      tryPlay(nurseryVideo);
      frame.classList.add('is-playing');
    });
    frame.addEventListener('mouseleave', function () {
      frame.classList.remove('is-playing');
      setTimeout(function () { if (!frame.classList.contains('is-playing')) nurseryVideo.pause(); }, 1100);
    });
  }

  /* ---------- clip modal ---------- */
  var modal = document.getElementById('clipModal');
  var clipVideo = document.getElementById('clipVideo');
  var openBtn = document.getElementById('openClip');
  var lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    clipVideo.muted = true;
    clipVideo.load();
    tryPlay(clipVideo);
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    clipVideo.pause();
    if (lenis) lenis.start();
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  openBtn.addEventListener('click', openModal);
  modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- manifesto: pinned sentence swap ---------- */
  var manifesto = document.getElementById('manifesto');
  var lines = Array.prototype.slice.call(manifesto.querySelectorAll('.manifesto__line'));
  var dots = Array.prototype.slice.call(manifesto.querySelectorAll('.manifesto__dots li'));
  function setActiveLine(i) {
    if (manifesto.dataset.active === String(i)) return;
    manifesto.dataset.active = String(i);
    lines.forEach(function (l, k) { l.classList.toggle('is-active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
  }

  /* ---------- macro: caption thresholds ---------- */
  var macro = document.getElementById('macro');
  var caps = Array.prototype.slice.call(macro.querySelectorAll('.macro__cap'));

  /* ---------- turntable canvas (desktop only) ---------- */
  var turn = document.getElementById('turn');
  var canvas = document.getElementById('turnCanvas');
  var bar = document.getElementById('turnBar');
  var FRAME_COUNT = 121;
  var frames = [];
  var framesReady = false;
  var currentFrame = -1;
  var ctx = canvas.getContext('2d');

  function framePath(i) {
    var n = String(i + 1);
    while (n.length < 3) n = '0' + n;
    return '../assets/frames/turntable2_alpha/f_' + n + '.webp';
  }
  function sizeCanvas() {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    currentFrame = -1;
  }
  function drawFrame(i) {
    if (!framesReady || !frames[i] || !frames[i].complete || !frames[i].naturalWidth) return;
    if (i === currentFrame) return;
    currentFrame = i;
    var img = frames[i];
    var cw = canvas.width, ch = canvas.height;
    var s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * 1.28; // frames carry wide margins
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function preloadFrames(done) {
    var loaded = 0;
    for (var i = 0; i < FRAME_COUNT; i++) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = function () {
        loaded++;
        if (loaded === FRAME_COUNT) { framesReady = true; done(); }
      };
      img.src = framePath(i);
      frames.push(img);
    }
  }

  /* ---------- scroll choreography ---------- */
  if (hasGsap && !reduced) {
    var mm = gsap.matchMedia();

    /* manifesto + macro + parallax: tablet and up */
    mm.add('(min-width: 769px)', function () {
      // manifesto timeline
      gsap.set(lines, { opacity: 0, y: 40 });
      gsap.set(lines[0], { opacity: 1, y: 0 });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: manifesto,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: function (st) {
            // active = number of swap midpoints already passed
            var t = st.progress * tl.duration();
            var idx = 0;
            for (var k = 0; k < swapMid.length; k++) if (t >= swapMid[k]) idx = k + 1;
            setActiveLine(idx);
          }
        }
      });
      var swapMid = [];
      tl.to({}, { duration: 0.6 });
      for (var i = 1; i < lines.length; i++) {
        swapMid.push(tl.duration() + 0.35);
        tl.to(lines[i - 1], { opacity: 0, y: -40, duration: 0.5, ease: 'power2.in' })
          .to(lines[i], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '<0.38')
          .to({}, { duration: 0.6 });
      }

      // macro captions
      gsap.set(caps, { opacity: 0, y: 30 });
      var mt = gsap.timeline({
        scrollTrigger: {
          trigger: macro,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: function (st) {
            var idx = Math.min(caps.length - 1, Math.floor(st.progress * caps.length));
            macro.dataset.active = String(idx);
          }
        }
      });
      caps.forEach(function (c, k) {
        mt.to(c, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
          .to({}, { duration: 0.7 })
          .to(c, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, k === caps.length - 1 ? '+=0.6' : '>');
      });

      // grass parallax: image moves slower than scroll
      gsap.fromTo('.intro__img', { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: '.intro__media', start: 'top bottom', end: 'bottom top', scrub: true }
      });

      // gentle fade-up for copy blocks
      gsap.utils.toArray('.calm__copy, .care__copy, .mesh__copy, .evening__copy, .safety__inner, .specs, .order, .benefit').forEach(function (el) {
        gsap.from(el, {
          opacity: 0, y: 28, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      });

      return function () { setActiveLine(0); };
    });

    /* turntable: desktop only */
    mm.add('(min-width: 1025px)', function () {
      sizeCanvas();
      var onResize = function () { sizeCanvas(); drawFrame(Math.max(0, currentFrame)); };
      window.addEventListener('resize', onResize);
      var st = ScrollTrigger.create({
        trigger: turn,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          var i = Math.round(self.progress * (FRAME_COUNT - 1));
          drawFrame(i);
          bar.style.width = (self.progress * 100).toFixed(1) + '%';
        }
      });
      // preload when the section approaches
      var pre = ScrollTrigger.create({
        trigger: turn,
        start: 'top 150%',
        once: true,
        onEnter: function () {
          preloadFrames(function () { currentFrame = -1; drawFrame(Math.round(st.progress * (FRAME_COUNT - 1))); });
        }
      });
      return function () { window.removeEventListener('resize', onResize); pre.kill(); };
    });

    /* mobile: just mark everything active (stacked) */
    mm.add('(max-width: 768px)', function () {
      lines.forEach(function (l) { l.classList.add('is-active'); });
      manifesto.dataset.active = 'all';
      macro.dataset.active = 'all';
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    // reduced motion or no GSAP: static layout
    lines.forEach(function (l) { l.classList.add('is-active'); });
    manifesto.dataset.active = 'all';
    macro.dataset.active = 'all';
    document.documentElement.classList.add('is-static');
  }
})();
