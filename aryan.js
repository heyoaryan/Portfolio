
  // ---- GLOBALS (declared first, used everywhere) ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile     = window.innerWidth <= 820;

  // ---- HERO HEADLINE char-by-char reveal ----
  const lines = document.querySelectorAll('#heroTitle .line');
  let charCount = 0;
  lines.forEach((line, li) => {
    const text = line.getAttribute('data-text');
    if(reduceMotion){ line.textContent = text; return; }
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = ch === ' ' ? 'char space' : 'char';
      span.textContent = ch;
      span.style.animationDelay = (0.3 + charCount * 0.018) + 's';
      line.appendChild(span);
      charCount++;
    });
    if(li < lines.length - 1) charCount += 2;
  });

  // ---- LIVE IST CLOCK ----
  const clockEl = document.getElementById('clock');
  function updateClock(){
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset()*60000) + (5.5*3600000));
    clockEl.textContent =
      String(ist.getHours()).padStart(2,'0') + ':' +
      String(ist.getMinutes()).padStart(2,'0') + ':' +
      String(ist.getSeconds()).padStart(2,'0') + ' IST';
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ---- TYPING EFFECT ----
  const roles = ["Full Stack Developer", "IoT Builder", "Hackathon Finalist", "React & Node Engineer"];
  const typedEl = document.getElementById('typed');
  if(reduceMotion){
    typedEl.textContent = roles[0];
  } else {
    let ri = 0, ci = 0, deleting = false;
    function typeTick(){
      const word = roles[ri];
      if(!deleting){
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if(ci === word.length){ deleting = true; setTimeout(typeTick, 1400); return; }
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if(ci === 0){ deleting = false; ri = (ri+1) % roles.length; }
      }
      setTimeout(typeTick, deleting ? 35 : 65);
    }
    typeTick();
  }

  // ---- SCROLL CUE ----
  const scrollCue = document.querySelector('.scroll-cue');
  if(scrollCue){
    window.addEventListener('scroll', ()=>{
      scrollCue.classList.toggle('faded', window.scrollY > 80);
    }, { passive:true });
  }

  // ---- LOADER ----
  const loader     = document.getElementById('loader');
  const loaderHello = document.getElementById('loaderHello');

  const greetings = [
    'नमस्ते', 'प्रणाम', 'নমস্কার', 'வணக்கம்', 'నమస్కారం',
    'नमस्कार', 'નમસ્તે', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'നമസ്കാരം', 'ನಮಸ್ಕಾರ',
    'Hello', '안녕하세요', 'Bonjour', 'こんにちは', 'Hola'
  ];

  const GREET_INTERVAL = 500;
  const GREET_FADE     = 200;
  const total = greetings.length;
  let idx  = 0;
  let done = false;
  let loaded = false;
  let triggerMusicOnHola = false;
  let holaClicked = false;

  function closeLoader(){
    if(loaded && done){
      window.scrollTo(0, 0);
      setTimeout(()=>{
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 300);
    }
  }

  window.addEventListener('load', ()=>{ loaded = true; closeLoader(); });

  function nextGreeting(){
    if(idx >= total){ done = true; closeLoader(); return; }
    loaderHello.style.opacity = '0';
    setTimeout(()=>{
      const word = greetings[idx++];
      loaderHello.textContent = word;
      loaderHello.style.opacity = '1';
      if(word === 'Hola'){
        triggerMusicOnHola = true;
        loader.classList.add('ready');
        return;
      }
      setTimeout(nextGreeting, GREET_INTERVAL);
    }, GREET_FADE);
  }
  setTimeout(nextGreeting, 400);

  loader.addEventListener('click', ()=>{
    if(!triggerMusicOnHola || holaClicked) return;
    holaClicked = true;
    loader.classList.remove('ready');
    loader.classList.add('entering');
    done = true;
    window.dispatchEvent(new Event('hola-enter'));
    // Hola zooms out (0.75s) + loader bg fades (0.35s delay + 0.4s) = ~0.8s total
    setTimeout(()=>{
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }, 800);
  });

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // ---- INTERSECTION OBSERVER — reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal-el, .reveal-left, .reveal-right, .reveal-scale');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold:0.1, rootMargin:'0px 0px -40px 0px' });
  revealEls.forEach(el=>io.observe(el));

  // stagger children
  const staggerContainers = document.querySelectorAll('.skills-grid, .project-grid, .achv-grid, .about-grid');
  staggerContainers.forEach(container=>{
    const children = container.querySelectorAll('.skill-group, .project-card, .achv, .edu-card');
    children.forEach((child, i)=>{
      child.classList.add('stagger-child');
      child.style.transitionDelay = `${i * 0.08}s`;
    });
    const sio = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.querySelectorAll('.stagger-child').forEach(c=>c.classList.add('visible'));
          sio.unobserve(e.target);
        }
      });
    }, { threshold:0.05, rootMargin:'0px 0px -30px 0px' });
    sio.observe(container);
  });

  // ---- AMBIENT CURSOR GLOW ----
  if(!reduceMotion){
    const glow = document.getElementById('glow');
    let gx = 50, gy = 20, tx = 50, ty = 20;
    window.addEventListener('mousemove', (e)=>{
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    });
    function glowLoop(){
      gx += (tx-gx)*0.05; gy += (ty-gy)*0.05;
      glow.style.setProperty('--gx', gx+'%');
      glow.style.setProperty('--gy', gy+'%');
      requestAnimationFrame(glowLoop);
    }
    glowLoop();
  }

  // ---- CUSTOM CURSOR (desktop only) ----
  const hasFinePointer = window.matchMedia('(pointer:fine)').matches;
  if(hasFinePointer && !reduceMotion){
    document.documentElement.classList.add('has-cursor');
    const dot   = document.getElementById('cursorDot');
    const ring  = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    let mx = -100, my = -100, rx = -100, ry = -100, active = false;

    window.addEventListener('mousemove', (e)=>{
      mx = e.clientX; my = e.clientY;
      dot.style.transform   = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      label.style.transform = `translate(${mx}px,${my+34}px) translate(-50%,-50%)`;
      if(!active){ active=true; dot.classList.add('active'); ring.classList.add('active'); }
    });
    window.addEventListener('mouseleave', ()=>{
      active=false; dot.classList.remove('active'); ring.classList.remove('active');
    });
    function ringLoop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.querySelectorAll('a, button, .project-card, .chip, .edu-card, .achv, .skill-group')
      .forEach(el=>{
        el.addEventListener('mouseenter', ()=>{
          ring.classList.add('hover');
          const isLink = el.tagName==='A' || el.tagName==='BUTTON';
          if(isLink){ label.textContent = el.hasAttribute('target') ? 'Open' : 'Go'; label.classList.add('show'); }
        });
        el.addEventListener('mouseleave', ()=>{ ring.classList.remove('hover'); label.classList.remove('show'); });
      });
  }

  // ---- CONTACT CANVAS ANIMATION ----
  (function initContactCanvas(){
    const canvas = document.getElementById('contactCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const ACCENT      = '124,140,255';
    const WARM        = '255,184,107';
    const PARTICLE_COUNT = isMobile ? 28 : 55;
    const CONNECT_DIST   = isMobile ? 90 : 130;
    const RING_COUNT     = 3;

    let W, H, cx, cy;

    function resize(){
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
      cx = W / 2; cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize, { passive:true });

    // ---- Particles ----
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      warm: i % 5 === 0,   // every 5th dot is warm-coloured
    }));

    // ---- Orbiting rings ----
    const rings = Array.from({ length: RING_COUNT }, (_, i) => ({
      radius:  80 + i * 55,
      speed:   (i % 2 === 0 ? 1 : -1) * (0.0003 + i * 0.00012),
      angle:   (Math.PI * 2 / RING_COUNT) * i,
      dotCount: 4 + i * 2,
    }));

    // ---- Pulse rings (radiate outward from centre) ----
    const pulses = [];
    let pulseTimer = 0;

    function spawnPulse(){
      pulses.push({ r: 0, max: Math.min(W, H) * 0.48, alpha: 0.5 });
    }
    spawnPulse();

    function draw(ts){
      ctx.clearRect(0, 0, W, H);

      // — centre radial glow —
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W,H)*0.45);
      grd.addColorStop(0,   `rgba(${ACCENT},0.10)`);
      grd.addColorStop(0.5, `rgba(${ACCENT},0.04)`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // — pulse rings —
      pulseTimer += 16;
      if(pulseTimer > 2200){ pulseTimer = 0; spawnPulse(); }
      for(let i = pulses.length - 1; i >= 0; i--){
        const p = pulses[i];
        p.r     += 0.6;
        p.alpha -= 0.6 / (p.max / 0.6);
        if(p.alpha <= 0){ pulses.splice(i,1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ACCENT},${p.alpha.toFixed(3)})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // — orbiting rings + dots —
      rings.forEach((ring, ri) => {
        ring.angle += ring.speed;

        // ring circle (dashed)
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.setLineDash([4, 10]);
        ctx.strokeStyle = `rgba(${ri === 1 ? WARM : ACCENT},0.10)`;
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // orbiting dots
        for(let d = 0; d < ring.dotCount; d++){
          const a  = ring.angle + (Math.PI * 2 / ring.dotCount) * d;
          const dx = cx + Math.cos(a) * ring.radius;
          const dy = cy + Math.sin(a) * ring.radius;
          const col = (d % 3 === 0) ? WARM : ACCENT;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},0.70)`;
          ctx.fill();
          // glow
          const gd = ctx.createRadialGradient(dx,dy,0,dx,dy,7);
          gd.addColorStop(0, `rgba(${col},0.25)`);
          gd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gd;
          ctx.beginPath();
          ctx.arc(dx, dy, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // — particles move + connect —
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;
      });

      // connection lines
      for(let i = 0; i < particles.length; i++){
        for(let j = i + 1; j < particles.length; j++){
          const dx  = particles[i].x - particles[j].x;
          const dy  = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < CONNECT_DIST){
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${ACCENT},${alpha.toFixed(3)})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      // draw dots
      particles.forEach(p => {
        const col = p.warm ? WARM : ACCENT;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.55)`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    // Only run when section is visible (IntersectionObserver)
    let rafRunning = false;
    const section = document.getElementById('contact');
    const visObs = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting && !rafRunning){
        rafRunning = true;
        requestAnimationFrame(draw);
      }
    }, { threshold: 0.05 });
    visObs.observe(section);
  })();
  // ---- END CONTACT CANVAS ----
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.querySelector('.nav-menu');
  if(navToggle && navMenu){
    navToggle.addEventListener('click', ()=>{
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open', !isOpen);
      navToggle.classList.toggle('active', !isOpen);
    });
    navMenu.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', ()=>{
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // ---- BACKGROUND MUSIC ----
  const bgMusic      = document.getElementById('bgMusic');
  const musicBtn     = document.getElementById('musicBtn');
  const volumeControl = document.getElementById('volumeControl');
  const TARGET_VOLUME = volumeControl ? Number(volumeControl.value) : 0.4;
  let musicPlaying = false, musicUnlockPending = false, musicStartPending = false, resumeMusicOnReturn = false;

  if(bgMusic && musicBtn){
    bgMusic.volume = TARGET_VOLUME;

    const renderVolume = ()=>{
      if(volumeControl){
        volumeControl.value = String(bgMusic.volume);
        volumeControl.style.background = `linear-gradient(to right,var(--accent) 0 ${bgMusic.volume*100}%,rgba(255,255,255,0.1) ${bgMusic.volume*100}% 100%)`;
      }
    };
    renderVolume();

    if(volumeControl){
      volumeControl.addEventListener('input', ()=>{ bgMusic.volume=Number(volumeControl.value); renderVolume(); });
    }

    bgMusic.addEventListener('timeupdate', ()=>{ if(bgMusic.currentTime>=30) bgMusic.currentTime=0; });

    const startMusic = ()=>{
      if(musicPlaying||musicStartPending) return;
      musicStartPending=true; musicUnlockPending=false;
      bgMusic.currentTime=0; bgMusic.volume=TARGET_VOLUME; bgMusic.muted=false;
      bgMusic.play().then(()=>{
        musicBtn.classList.add('playing');
        musicPlaying=true; resumeMusicOnReturn=true; musicStartPending=false; musicUnlockPending=false;
      }).catch(()=>{ musicStartPending=false; musicUnlockPending=true; });
    };

    window.addEventListener('hola-enter', startMusic);

    const unlockMusic = ()=>{ if(triggerMusicOnHola&&musicUnlockPending&&!musicPlaying) startMusic(); };
    ['click','touchstart','pointerdown','scroll','wheel'].forEach(ev=>{
      document.addEventListener(ev, unlockMusic, { passive:true });
    });

    const pauseForInactivePage = ()=>{
      if(!musicPlaying||bgMusic.paused) return;
      resumeMusicOnReturn=true; bgMusic.pause(); musicBtn.classList.remove('playing'); musicPlaying=false;
    };
    const resumeForActivePage = ()=>{
      if(!resumeMusicOnReturn||!triggerMusicOnHola||musicPlaying||document.visibilityState!=='visible') return;
      bgMusic.play().then(()=>{ musicBtn.classList.add('playing'); musicPlaying=true; }).catch(()=>{});
    };

    document.addEventListener('visibilitychange', ()=>{
      document.visibilityState==='hidden' ? pauseForInactivePage() : resumeForActivePage();
    });
    window.addEventListener('blur',  pauseForInactivePage);
    window.addEventListener('focus', resumeForActivePage);

    musicBtn.addEventListener('click', ()=>{
      if(musicPlaying){
        bgMusic.pause(); musicBtn.classList.remove('playing'); musicPlaying=false; resumeMusicOnReturn=false;
      } else {
        bgMusic.currentTime=0; bgMusic.muted=false; bgMusic.play();
        musicBtn.classList.add('playing'); musicPlaying=true; resumeMusicOnReturn=true;
      }
    });
  }
