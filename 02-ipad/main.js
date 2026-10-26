/* 솜결 데모 02 · iPad Air KR 컨셉 · vanilla JS + GSAP 3.12.5 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduce;
  var isMobile = function () { return window.matchMedia('(max-width: 767px)').matches; };

  if (!motion) document.documentElement.classList.add('no-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- nav shadow ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- color state (image-set swap) ---------- */
  var COLORS = {
    ivory: { name: '아이보리', bg: '#AADCFB' },
    sage:  { name: '세이지', bg: '#BECFB7' },
    pink:  { name: '더스티 핑크', bg: '#FAD4DD' },
    oat:   { name: '오트', bg: '#FDECAB' }
  };
  var picker = $('#picker');
  var pickerImgs = $$('.picker__img');
  var pickerName = $('#pickerName');
  var buyName = $('#buyColorName');
  var allChips = $$('.chip');
  var current = 'ivory';

  function setColor(key) {
    if (!COLORS[key] || key === current) return;
    current = key;
    picker.style.setProperty('--picker-bg', COLORS[key].bg);
    pickerImgs.forEach(function (im) { im.classList.toggle('is-on', im.dataset.color === key); });
    pickerName.textContent = COLORS[key].name;
    buyName.textContent = COLORS[key].name;
    allChips.forEach(function (c) {
      var on = c.dataset.color === key;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (motion) {
      gsap.fromTo(pickerName, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'back.out(1.6)', overwrite: true });
    }
  }
  allChips.forEach(function (c) {
    c.addEventListener('click', function () { setColor(c.dataset.color); });
    c.addEventListener('focus', function () { setColor(c.dataset.color); });
  });
  // hover preview only on the big picker (desktop pointer)
  if (window.matchMedia('(hover: hover)').matches) {
    $$('#chips .chip').forEach(function (c) {
      c.addEventListener('mouseenter', function () { setColor(c.dataset.color); });
    });
  }
  window.somgyeolSetColor = setColor; // for QA

  /* ---------- FAQ ---------- */
  $$('.faq__item').forEach(function (item) {
    var q = $('.faq__q', item), a = $('.faq__a', item);
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      $$('.faq__item').forEach(function (o) {
        if (o !== item) { $('.faq__q', o).setAttribute('aria-expanded', 'false'); $('.faq__a', o).style.height = '0px'; }
      });
      q.setAttribute('aria-expanded', open ? 'false' : 'true');
      a.style.height = open ? '0px' : a.scrollHeight + 'px';
    });
  });

  /* ---------- horizontal section: tabs ---------- */
  var hsec = $('#hscroll'), track = $('#hTrack'), tabs = $$('#tabbar .tab'), cards = $$('.ccard', track);
  function setTab(i) {
    tabs.forEach(function (t, k) {
      var on = k === i; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  var hST = null; // ScrollTrigger instance on desktop
  function cardOffset(i) { return cards[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft); }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var i = +t.dataset.i;
      if (hST) {
        var max = track.scrollWidth - window.innerWidth;
        var p = Math.min(1, Math.max(0, cardOffset(i) / max));
        var y = hST.start + p * (hST.end - hST.start);
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      } else {
        track.scrollTo({ left: cardOffset(i), behavior: reduce ? 'auto' : 'smooth' });
      }
      setTab(i);
    });
  });
  // mobile / no-motion: native scroll drives tabs
  track.addEventListener('scroll', function () {
    if (hST) return;
    var x = track.scrollLeft + track.clientWidth * 0.35, best = 0;
    cards.forEach(function (c, i) { if (c.offsetLeft <= x) best = i; });
    setTab(best);
  }, { passive: true });

  if (!motion) {
    // static fallbacks
    return;
  }

  /* ---------- GSAP: reveals ---------- */
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: function (els) {
      gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'back.out(1.25)', stagger: .09, overwrite: true,
        onComplete: function () { els.forEach(function (e) { e.classList.add('is-in'); e.style.transform = ''; }); } });
    }
  });
  // in case something is above the fold already
  $$('.reveal').forEach(function (e) {
    if (e.getBoundingClientRect().top < window.innerHeight * 0.88) {
      gsap.to(e, { opacity: 1, y: 0, duration: .9, ease: 'back.out(1.25)', delay: .1 });
    }
  });

  /* ---------- hero float + parallax ---------- */
  var floatEl = $('#heroFloat'), stage = $('#heroStage'), heroImg = $('#heroImg');
  gsap.fromTo(heroImg, { y: 40, opacity: 0, rotate: -4, scale: .96 }, { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.4, ease: 'back.out(1.4)', delay: .15 });
  gsap.to(floatEl, { y: -18, rotate: 1.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
  if (window.matchMedia('(hover: hover) and (min-width: 768px)').matches) {
    var qx = gsap.quickTo(floatEl, 'x', { duration: .8, ease: 'power3.out' });
    var qy = gsap.quickTo(floatEl, 'rotateY', { duration: .8, ease: 'power3.out' });
    var qr = gsap.quickTo(floatEl, 'rotateX', { duration: .8, ease: 'power3.out' });
    gsap.set(floatEl, { transformPerspective: 900 });
    var hero = $('#hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      qx(nx * 26); qy(nx * 10); qr(-ny * 8);
    });
    hero.addEventListener('mouseleave', function () { qx(0); qy(0); qr(0); });
  }

  /* ---------- count-up ---------- */
  var cu = $('#countUp');
  ScrollTrigger.create({
    trigger: cu, start: 'top 85%', once: true,
    onEnter: function () {
      var o = { v: 0 };
      gsap.to(o, { v: +cu.dataset.to, duration: 1.6, ease: 'power3.out', onUpdate: function () { cu.textContent = Math.round(o.v); } });
    }
  });
  gsap.to('#sideImg', { x: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.3)', scrollTrigger: { trigger: '#sideWrap', start: 'top 80%', once: true } });

  /* ---------- responsive GSAP ---------- */
  var mm = gsap.matchMedia();
  var NAV_H = 52;

  mm.add('(min-width: 768px)', function () {
    // pinned horizontal
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: hsec, pin: '.hscroll__pin', scrub: 0.6, anticipatePin: 1,
        start: 'top ' + NAV_H + 'px', end: function () { return '+=' + dist(); },
        invalidateOnRefresh: true,
        onUpdate: function (st) {
          var x = st.progress * dist() + window.innerWidth * 0.35, best = 0;
          cards.forEach(function (c, i) { if (c.offsetLeft <= x) best = i; });
          setTab(best);
        }
      }
    });
    hST = tween.scrollTrigger;

    // layers: pinned three-step reveal
    var curtain = $('#layersCurtain'), steps = $$('.lstep');
    var byStep = function (n) { return steps.filter(function (s) { return +s.dataset.step === n; })[0]; };
    var tl = gsap.timeline({
      scrollTrigger: { trigger: '.layers', pin: '.layers__pin', scrub: 0.5, start: 'top ' + NAV_H + 'px', end: '+=1400', anticipatePin: 1,
        onLeaveBack: function () { steps.forEach(function (s) { s.classList.remove('is-on'); }); } }
    });
    tl.fromTo(curtain, { scaleY: .82 }, { scaleY: .66, duration: 1, ease: 'none', onStart: function () { byStep(1).classList.add('is-on'); }, onReverseComplete: function () { byStep(1).classList.remove('is-on'); } })
      .to(curtain, { scaleY: .34, duration: 1, ease: 'none', onStart: function () { byStep(2).classList.add('is-on'); }, onReverseComplete: function () { byStep(2).classList.remove('is-on'); } })
      .to(curtain, { scaleY: 0, duration: 1, ease: 'none', onStart: function () { byStep(3).classList.add('is-on'); }, onReverseComplete: function () { byStep(3).classList.remove('is-on'); } })
      .to({}, { duration: .4 });

    return function () { hST = null; gsap.set(track, { clearProps: 'transform' }); gsap.set(curtain, { clearProps: 'transform' }); };
  });

  mm.add('(max-width: 767px)', function () {
    // layers: one-shot stepped reveal, no pin
    var curtain = $('#layersCurtain'), steps = $$('.lstep');
    var byStep = function (n) { return steps.filter(function (s) { return +s.dataset.step === n; })[0]; };
    var tl = gsap.timeline({ paused: true, scrollTrigger: { trigger: '#layersFrame', start: 'top 70%', once: true } });
    tl.fromTo(curtain, { scaleY: .82 }, { scaleY: .66, duration: .7, ease: 'power2.inOut', onStart: function () { byStep(1).classList.add('is-on'); } })
      .to(curtain, { scaleY: .34, duration: .7, ease: 'power2.inOut', onStart: function () { byStep(2).classList.add('is-on'); } }, '+=.25')
      .to(curtain, { scaleY: 0, duration: .7, ease: 'power2.inOut', onStart: function () { byStep(3).classList.add('is-on'); } }, '+=.25');
    return function () { steps.forEach(function (s) { s.classList.remove('is-on'); }); };
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
