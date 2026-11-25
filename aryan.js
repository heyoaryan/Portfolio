/* =========================================================
   Aryan Singh Thakur — cinematic portfolio
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = hasGSAP && !reduce;

  if (motion) document.documentElement.classList.add('js');

  /* =========================================================
     SFX — game-menu style sounds, synthesized live (no audio files)
     ========================================================= */
  const sfx = (() => {
    let ctx = null, master = null, noiseBuf = null;
    const init = () => {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    };
    const tone = ({ type = 'sine', f1, f2 = f1, dur = 0.08, vol = 0.5, delay = 0 }) => {
      const t = ctx.currentTime + delay;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f1, t);
      o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + dur + 0.02);
    };
    const noise = ({ dur = 0.3, from = 400, to = 4000, vol = 0.4, q = 1.2, delay = 0 }) => {
      const t = ctx.currentTime + delay;
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf;
      f.type = 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(from, t);
      f.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(master);
      s.start(t); s.stop(t + dur + 0.02);
    };
    const sounds = {
      // crisp double blip — "select"
      select: () => { tone({ type: 'square', f1: 1320, f2: 1320, dur: 0.045, vol: 0.12 }); tone({ type: 'square', f1: 1760, f2: 1760, dur: 0.06, vol: 0.1, delay: 0.05 }); },
      // soft tap on empty space
      tap: () => { tone({ type: 'sine', f1: 520, f2: 260, dur: 0.07, vol: 0.25 }); },
      // menu / panel open — rising whoosh + low thump
      open: () => { noise({ dur: 0.32, from: 300, to: 3800, vol: 0.35 }); tone({ type: 'sine', f1: 120, f2: 55, dur: 0.25, vol: 0.5, delay: 0.05 }); },
      // close — falling whoosh
      close: () => { noise({ dur: 0.26, from: 3200, to: 300, vol: 0.3 }); },
      // next / prev — quick pitch step
      next: () => { tone({ type: 'triangle', f1: 660, f2: 990, dur: 0.09, vol: 0.3 }); },
      prev: () => { tone({ type: 'triangle', f1: 990, f2: 660, dur: 0.09, vol: 0.3 }); },
      // hover lock-on — tiny tick
      tick: () => { tone({ type: 'square', f1: 2400, f2: 2400, dur: 0.018, vol: 0.04 }); },
    };
    // AST landing — deep boom + air burst
    sounds.impact = () => {
      tone({ type: 'sine', f1: 90, f2: 32, dur: 0.9, vol: 0.9 });
      tone({ type: 'triangle', f1: 180, f2: 60, dur: 0.35, vol: 0.35 });
      noise({ dur: 0.45, from: 2400, to: 180, vol: 0.45, q: 0.7 });
    };
    // name reveal — rising shimmer arpeggio
    sounds.shimmer = () => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ type: 'triangle', f1: f, f2: f, dur: 0.5, vol: 0.12, delay: i * 0.06 }));
      noise({ dur: 0.6, from: 4000, to: 9000, vol: 0.08, q: 2, delay: 0.05 });
    };

    // continuous riser that follows the scroll: pitch = progress, loudness = scroll speed
    let riser = null, riserIdle = null;
    const buildRiser = () => {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      const oscGain = ctx.createGain(); oscGain.gain.value = 0.18;
      const out = ctx.createGain(); out.gain.value = 0;
      src.connect(bp).connect(out);
      osc.connect(lp).connect(oscGain).connect(out);
      out.connect(master);
      src.start(); osc.start();
      riser = { bp, osc, lp, out };
    };
    const scrub = (progress, velocity) => {
      if (!ctx || ctx.state !== 'running') return;
      if (!riser) buildRiser();
      const t = ctx.currentTime;
      const p = Math.min(Math.max(progress, 0), 1);
      riser.bp.frequency.setTargetAtTime(250 + p * 3200, t, 0.05);
      riser.osc.frequency.setTargetAtTime(45 + p * 110, t, 0.05);
      riser.lp.frequency.setTargetAtTime(300 + p * 1400, t, 0.05);
      const loud = Math.min(Math.abs(velocity) / 2500, 1) * 0.28;
      riser.out.gain.setTargetAtTime(loud, t, 0.06);
      clearTimeout(riserIdle);
      riserIdle = setTimeout(() => riser && riser.out.gain.setTargetAtTime(0, ctx.currentTime, 0.12), 120);
    };
    const hush = () => { if (riser) riser.out.gain.setTargetAtTime(0, ctx.currentTime, 0.1); };

    return {
      scrub, hush,
      unlock: init,
      play: (name) => { if (!ctx || ctx.state !== 'running') return; try { sounds[name](); } catch (_) {} },
      ready: () => !!ctx && ctx.state === 'running',
    };
  })();


  /* ---------- Always start at the top on refresh ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  const toTop = () => window.scrollTo(0, 0);
  toTop();
  window.addEventListener('beforeunload', toTop);
  window.addEventListener('pageshow', e => { if (e.persisted) toTop(); });
  if (hasGSAP) ScrollTrigger.clearScrollMemory('manual');

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.stop();
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const scrollToTarget = (hash) => {
    const el = hash === '#top' ? 0 : $(hash);
    if (el === null) return;
    if (lenis) { lenis.scrollTo(el, { duration: 1.6 }); return; }
    const behavior = reduce ? 'auto' : 'smooth';
    if (el === 0) window.scrollTo({ top: 0, behavior });
    else el.scrollIntoView({ behavior });
  };

  /* ---------- Loader ---------- */
  let loaded = false;
  const finishLoading = () => {
    if (loaded) return;
    loaded = true;
    body.classList.remove('is-loading');
    toTop();
    if (lenis) { lenis.scrollTo(0, { immediate: true, force: true }); lenis.start(); }
    if (motion) ScrollTrigger.refresh();
  };
  // keep the loader long enough for the "A" outline to finish drawing
  const loaderStart = performance.now();
  window.addEventListener('load', () => setTimeout(finishLoading, Math.max(0, 2800 - (performance.now() - loaderStart))));
  if (motion && document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  setTimeout(finishLoading, 4000);

  /* ---------- Menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));

  /* ---------- Anchor links ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      e.preventDefault();
      if (body.classList.contains('menu-open')) setMenu(false);
      closeLightbox();
      scrollToTarget(hash);
    });
  });

  /* ---------- Top bar hide / show ---------- */
  const topbar = $('#topbar');
  let lastY = 0;
  const onScroll = (y) => {
    const down = y > lastY && y > 200;
    if (!body.classList.contains('menu-open')) topbar.classList.toggle('is-hidden', down);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  /* ---------- Active nav ---------- */
  const navLinks = $$('.menu__links a');
  const setActive = (id) => navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));

  /* ---------- Quote: split into words ---------- */
  const quote = $('#quote');
  if (quote) {
    quote.innerHTML = quote.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join('');
    if (!motion) $$('.w', quote).forEach(w => (w.style.opacity = 1));
  }

  /* ---------- Gallery tiles: big background letter ---------- */
  const tiles = $$('.tile');
  tiles.forEach(t => $('.tile__art', t).setAttribute('data-big', t.dataset.name.charAt(0)));

  /* ---------- Counters ---------- */
  const runCounters = () => {
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count;
      if (!motion) { el.textContent = end; return; }
      const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
  };

  /* =========================================================
     MOTION
     ========================================================= */
  if (motion) {
    const mm = gsap.matchMedia();

    /* --- HERO sound design: riser follows scroll, boom when AST lands, shimmer on name --- */
    let lastP = 0;
    const heroSound = (self) => {
      const p = self.progress;
      sfx.scrub(p, self.getVelocity());
      const crossed = (mark) => lastP < mark && p >= mark;
      const crossedBack = (mark) => lastP > mark && p <= mark;
      if (crossed(0.55)) sfx.play('impact');
      if (crossed(0.72)) sfx.play('shimmer');
      if (crossedBack(0.55)) sfx.play('close');
      lastP = p;
    };

    /* --- HERO: logo mask zoom-out over the key art --- */
    mm.add({ small: '(max-width: 720px)', large: '(min-width: 721px)' }, (ctx) => {
      const small = ctx.conditions.small;
      const scene = $('#heroScene');
      const mask = $('#heroMask');
      const maskText = $('#maskText');
      const intro = $('#heroIntro');
      const cue = $('#heroCue');

      // sizes in px, recalculated on resize — font-size (not scale) keeps letters razor sharp
      const base = () => (small ? innerWidth * 0.6 : Math.min(innerWidth * 0.3, innerHeight * 0.46));
      const px = (n) => n + 'px';

      gsap.set(mask, { opacity: 0 });
      gsap.set(maskText, { fontSize: () => px(base() * 4.2), letterSpacing: '0.12em', y: 0 });
      gsap.set(scene, { scale: 1.28 });
      gsap.set(intro, { opacity: 0, y: 70 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '+=220%',
          scrub: 0.8,
          pin: '.hero__pin',
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => heroSound(self),
          onLeave: () => sfx.hush(),
          onLeaveBack: () => sfx.hush(),
        },
      });

      // one continuous motion — no pauses, no dead zones
      const D = 1.6;
      tl.to(cue, { opacity: 0, duration: 0.15 }, 0)
        .to(mask, { opacity: 1, duration: 0.3, ease: 'sine.out' }, 0)
        .to(maskText, { fontSize: () => px(base() * 0.62), letterSpacing: '0.02em', duration: D, ease: 'power1.out' }, 0)
        .to(maskText, { y: () => -innerHeight * (small ? 0.22 : 0.15), duration: D - 0.6, ease: 'sine.inOut' }, 0.6)
        .to(scene, { scale: 1, duration: D, ease: 'none' }, 0)
        .to(intro, { opacity: 1, y: 0, duration: D - 1, ease: 'sine.out', onStart: () => { if (!runCounters.done) { runCounters(); runCounters.done = true; } } }, 1);

      // gentle intro on load
      gsap.from(scene, { opacity: 0, duration: 1.6, ease: 'power2.out', delay: 0.4 });
    });

    /* --- Scenes: parallax zoom (key-art feel) --- */
    $$('.chapter, .finale').forEach(sec => {
      const scene = $('.scene', sec);
      const sun = $('.scene__sun', sec);
      const far = $('.scene__city--far', sec);
      const near = $('.scene__city:not(.scene__city--far)', sec);
      const st = { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo(scene, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: st });
      if (sun) gsap.fromTo(sun, { yPercent: 40 }, { yPercent: -25, ease: 'none', scrollTrigger: { ...st } });
      if (far) gsap.fromTo(far, { yPercent: 10 }, { yPercent: -4, ease: 'none', scrollTrigger: { ...st } });
      if (near) gsap.fromTo(near, { yPercent: 18 }, { yPercent: -6, ease: 'none', scrollTrigger: { ...st } });

      ScrollTrigger.create({ trigger: sec, start: 'top center', end: 'bottom center', onToggle: s => s.isActive && sec.id && setActive(sec.id) });
    });

    /* --- Reveals --- */
    gsap.set('.rv', { opacity: 0, y: 60 });
    ScrollTrigger.batch('.rv', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
    });

    /* --- Display headings: lines rise with slight skew --- */
    $$('.display, .finale__title').forEach(h => {
      gsap.fromTo(h, { letterSpacing: '0.06em' }, { letterSpacing: '0.005em', ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'top 40%', scrub: true } });
    });

    /* --- Quote words light up --- */
    if (quote) {
      gsap.to($$('.w', quote), {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: true },
      });
    }

    /* --- Finale title scale --- */
    gsap.fromTo('.finale__title', { scale: 0.82 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'center center', scrub: true } });

    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom center', onToggle: s => s.isActive && setActive('') });
  } else {
    runCounters();
  }

  // every tap/click makes a sound; specific elements pick their own
  document.addEventListener('pointerdown', e => {
    if (!sfx.unlock()) return;
    const el = e.target.closest('a, button, .tile, .postcard, .award');
    let name = el ? 'select' : 'tap';
    if (el) {
      if (el.id === 'menuBtn') name = body.classList.contains('menu-open') ? 'close' : 'open';
      else if (el.classList.contains('tile')) name = 'open';
      else if (el.id === 'lbClose') name = 'close';
      else if (el.id === 'lbNext') name = 'next';
      else if (el.id === 'lbPrev') name = 'prev';
    }
    // tiny delay lets a freshly-created AudioContext finish resuming
    setTimeout(() => sfx.play(name), sfx.ready() ? 0 : 30);
  }, { passive: true });
  ['keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => sfx.unlock(), { passive: true }));
  document.addEventListener('keydown', e => {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') sfx.play('next');
    if (e.key === 'ArrowLeft') sfx.play('prev');
    if (e.key === 'Escape') sfx.play('close');
  });

  /* ---------- Reticle cursor ---------- */
  const reticle = $('#reticle');
  if (reticle && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('has-reticle');
    const ring = $('.reticle__ring', reticle);
    const label = $('.reticle__label', reticle);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    let lockedEl = null;

    // dot follows instantly, ring trails behind for that aim-assist feel
    const lerp = reduce ? 1 : 0.2;
    const tick = () => {
      rx += (x - rx) * lerp;
      ry += (y - ry) * lerp;
      reticle.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.translate = `${rx - x}px ${ry - y}px`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      reticle.classList.add('is-visible');
    }, { passive: true });
    document.addEventListener('pointerleave', () => reticle.classList.remove('is-visible'));
    document.addEventListener('pointerdown', () => reticle.classList.add('is-down'));
    document.addEventListener('pointerup', () => reticle.classList.remove('is-down'));

    const labelFor = (el) => {
      if (el.dataset.cursor) return el.dataset.cursor;
      if (el.classList.contains('tile')) return 'View';
      if (el.id === 'menuBtn') return 'Menu';
      if (el.tagName === 'A' && el.target === '_blank') return 'Open';
      if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('mailto:')) return 'Email';
      return '';
    };
    document.addEventListener('pointerover', e => {
      const el = e.target.closest('a, button, input, .postcard, .award');
      if (el && el !== lockedEl) sfx.play('tick');
      lockedEl = el;
      reticle.classList.toggle('is-lock', !!el);
      const txt = el ? labelFor(el) : '';
      reticle.classList.toggle('has-label', !!txt);
      if (txt) label.textContent = txt;
    });
  }

  /* ---------- Postcard tilt ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('.postcard').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* =========================================================
     LIGHTBOX
     ========================================================= */
  const lb = $('#lightbox');
  const lbArt = $('#lbArt');
  let lbIndex = 0;
  let lastFocus = null;

  const fillLightbox = (i) => {
    lbIndex = (i + tiles.length) % tiles.length;
    const t = tiles[lbIndex];
    const g = [...t.classList].find(c => /^g-\d+$/.test(c));
    lbArt.className = 'lightbox__art ' + g;
    lbArt.innerHTML = `<span class="tile__art" data-big="${t.dataset.name.charAt(0)}"></span>`;
    $('#lbCat').textContent = t.dataset.cat;
    $('#lbName').textContent = t.dataset.name;
    $('#lbDesc').textContent = t.dataset.desc;
    $('#lbStack').textContent = t.dataset.stack;
    const link = $('#lbLink');
    if (t.dataset.link) {
      link.href = t.dataset.link; link.target = '_blank'; link.textContent = 'Visit live site ↗';
    } else {
      link.href = '#contact'; link.removeAttribute('target'); link.textContent = 'Ask for demo →';
    }
  };

  function openLightbox(i) {
    lastFocus = document.activeElement;
    fillLightbox(i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
    $('#lbClose').focus();
  }
  function closeLightbox() {
    if (!lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  tiles.forEach((t, i) => t.addEventListener('click', () => openLightbox(i)));
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => fillLightbox(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => fillLightbox(lbIndex + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') fillLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') fillLightbox(lbIndex + 1);
    } else if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      setMenu(false);
    }
  });
})();
