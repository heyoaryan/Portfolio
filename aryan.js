  // animated letter reveal for hero headline
  const reduceMotionPre = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = document.querySelectorAll('#heroTitle .line');
  let charCount = 0;
  lines.forEach((line, li) => {
    const text = line.getAttribute('data-text');
    if(reduceMotionPre){
      line.textContent = text;
      return;
    }
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = ch === ' ' ? 'char space' : 'char';
      span.textContent = ch;
      span.style.animationDelay = (0.3 + charCount * 0.018) + 's';
      line.appendChild(span);
      charCount++;
    });
    if(li < lines.length - 1) charCount += 2; // brief pause between lines
  });

  // live IST clock
  const clockEl = document.getElementById('clock');
  function updateClock(){
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset()*60000) + (5.5*3600000));
    const hh = String(ist.getHours()).padStart(2,'0');
    const mm = String(ist.getMinutes()).padStart(2,'0');
    const ss = String(ist.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}:${ss} IST`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // typing effect
  const roles = ["Full Stack Developer", "IoT Builder", "Hackathon Finalist", "React & Node Engineer"];
  const typedEl = document.getElementById('typed');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reduceMotion){
    typedEl.textContent = roles[0];
  } else {
    let ri = 0, ci = 0, deleting = false;
    function tick(){
      const word = roles[ri];
      if(!deleting){
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if(ci === word.length){ deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if(ci === 0){ deleting = false; ri = (ri+1) % roles.length; }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  const scrollCue = document.querySelector('.scroll-cue');
  if(scrollCue){
    window.addEventListener('scroll', ()=>{
      scrollCue.classList.toggle('faded', window.scrollY > 80);
    }, { passive:true });
  }

  // ---- WAVY MARQUEE (SVG path-following chips, infinite seamless loop) ----
  (function initWavyMarquee(){
    if(reduceMotion) return;

    const wrap   = document.querySelector('.marquee-wave-wrap');
    const track  = document.getElementById('marqueeWaveTrack');
    if(!wrap || !track) return;

    const chips  = Array.from(track.querySelectorAll('.mw-chip'));
    const COUNT  = chips.length / 2;   // 10 originals + 10 duplicates
    const GAP    = 148;                // px between chip centres
    const LOOP   = COUNT * GAP;        // total width of ONE full set
    // mobile gets slightly faster marquee speed
    const SPEED  = isMobile ? 0.7 : 0.5;

    let offset = 0;
    let wrapW  = wrap.offsetWidth;

    // On desktop use SVG path; on mobile use fast sine approximation
    const svgEl  = wrap.querySelector('.marquee-wave-svg');
    const pathEl = svgEl && svgEl.querySelector('#wavePath');
    const usesSVG = !isMobile && !!pathEl;
    const totalPathLen = usesSVG ? pathEl.getTotalLength() : 0;
    const wrapH  = wrap.offsetHeight;

    // Binary-search on SVG path (desktop only)
    function waveYviaSVG(screenX){
      const svgX = Math.min(Math.max(screenX, 0), wrapW) / wrapW * 1200;
      let lo = 0, hi = totalPathLen;
      for(let i = 0; i < 16; i++){
        const mid = (lo + hi) / 2;
        if(pathEl.getPointAtLength(mid).x < svgX) lo = mid; else hi = mid;
      }
      return (pathEl.getPointAtLength((lo + hi) / 2).y / 90) * wrapH;
    }

    // Fast sine wave (mobile — zero DOM queries)
    function waveYviaMath(screenX){
      const t = (screenX / wrapW) * Math.PI * 2;   // 0 → 2π across width
      // amplitude = 30% of wrap height, centred
      return wrapH / 2 + Math.sin(t) * (wrapH * 0.30);
    }

    const waveY = usesSVG ? waveYviaSVG : waveYviaMath;

    function positionChips(){
      chips.forEach((chip, idx) => {
        const setOffset = idx < COUNT ? 0 : LOOP;
        let x = setOffset + (idx % COUNT) * GAP - offset;
        if(x < -GAP) x += LOOP * 2;

        const y = waveY(x);
        chip.style.left = x + 'px';
        chip.style.top  = (y - chip.offsetHeight / 2) + 'px';
      });
    }

    let rafId;
    function tick(){
      offset += SPEED;
      if(offset >= LOOP) offset -= LOOP;
      positionChips();
      rafId = requestAnimationFrame(tick);
    }

    requestAnimationFrame(() => {
      positionChips();
      rafId = requestAnimationFrame(tick);
    });

    window.addEventListener('resize', () => {
      wrapW = wrap.offsetWidth;
    }, { passive: true });
  })();
  // ---- END WAVY MARQUEE ----

  const isMobile = window.innerWidth <= 820;

  // loader: on mobile fewer greetings for faster entry
  const loader = document.getElementById('loader');
  const loaderHello = document.getElementById('loaderHello');
  const greetings = isMobile
    ? ['नमस्ते', 'Hello', 'Bonjour', 'こんにちは', 'Hola']
    : [
        'नमस्ते', 'प्रणाम', 'নমস্কার', 'வணக்கம்', 'నమస్కారం',
        'नमस्कार', 'નમસ્તે', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'നമസ്കാരം', 'ನಮಸ್ಕಾರ',
        'Hello', '안녕하세요', 'Bonjour', 'こんにちは', 'Hola'
      ];
  // mobile: faster swap (300ms instead of 500ms)
  const GREET_INTERVAL = isMobile ? 300 : 500;
  const GREET_FADE     = isMobile ? 120 : 200;
  const total = greetings.length;
  let idx = 0;
  let done = false;
  let loaded = false;
  // set to true by the greeting loop when "Hola" appears;
  // music player picks this up once startMusic is defined
  let triggerMusicOnHola = false;
  let holaClicked = false;

  function close(){
    if(loaded && done){
      window.scrollTo(0, 0);
      setTimeout(()=>{
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 300);
    }
  }

  window.addEventListener('load', ()=>{ loaded = true; close(); });

  function next(){
    if(idx >= total){
      done = true;
      close();
      return;
    }
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
      setTimeout(next, GREET_INTERVAL);
    }, GREET_FADE);
  }
  setTimeout(next, isMobile ? 200 : 400);

  loader.addEventListener('click', ()=>{
    if(!triggerMusicOnHola || holaClicked) return;
    holaClicked = true;
    loader.classList.remove('ready');
    loader.classList.add('entering');
    done = true;
    window.dispatchEvent(new Event('hola-enter'));
    close();
  });

  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  const revealEls = document.querySelectorAll('.reveal-el, .reveal-left, .reveal-right, .reveal-scale');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold:0.1, rootMargin:'0px 0px -40px 0px' });
  revealEls.forEach(el=>io.observe(el));

  // stagger children inside grids
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

  // ambient cursor glow
  if(!reduceMotion){
    const glow = document.getElementById('glow');
    let gx = 50, gy = 20, tx = 50, ty = 20;
    window.addEventListener('mousemove', (e)=>{
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    });
    function loop(){
      gx += (tx-gx)*0.05; gy += (ty-gy)*0.05;
      glow.style.setProperty('--gx', gx+'%');
      glow.style.setProperty('--gy', gy+'%');
      requestAnimationFrame(loop);
    }
    loop();
  }

   // custom floating cursor
   const hasFinePointer = window.matchMedia('(pointer:fine)').matches;
   if(hasFinePointer && !reduceMotion){
     document.documentElement.classList.add('has-cursor');
     const dot = document.getElementById('cursorDot');
     const ring = document.getElementById('cursorRing');
     const label = document.getElementById('cursorLabel');

     let mx = -100, my = -100;      // raw pointer position
     let rx = -100, ry = -100;      // ring trailing position
     let active = false;

     window.addEventListener('mousemove', (e)=>{
       mx = e.clientX; my = e.clientY;
       dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
       label.style.transform = `translate(${mx}px, ${my + 34}px) translate(-50%,-50%)`;
       if(!active){ active = true; dot.classList.add('active'); ring.classList.add('active'); }
     });
     window.addEventListener('mouseleave', ()=>{
       active = false; dot.classList.remove('active'); ring.classList.remove('active');
     });

     function ringLoop(){
       rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
       ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
       requestAnimationFrame(ringLoop);
     }
     ringLoop();

     const hoverables = document.querySelectorAll('a, button, .project-card, .chip, .edu-card, .achv, .skill-group');
     hoverables.forEach(el=>{
       el.addEventListener('mouseenter', ()=>{
         ring.classList.add('hover');
         const isLink = el.tagName === 'A' || el.tagName === 'BUTTON';
         if(isLink){ label.textContent = el.hasAttribute('target') ? 'Open' : 'Go'; label.classList.add('show'); }
       });
       el.addEventListener('mouseleave', ()=>{
         ring.classList.remove('hover');
         label.classList.remove('show');
       });
     });
   }

   // mobile nav toggle
   const navToggle = document.getElementById('navToggle');
   const navMenu = document.querySelector('.nav-menu');
   if(navToggle && navMenu){
     navToggle.addEventListener('click', ()=>{
       const isOpen = navMenu.classList.contains('open');
       if(isOpen){
         navMenu.classList.remove('open');
         navToggle.classList.remove('active');
       } else {
         navMenu.classList.add('open');
         navToggle.classList.add('active');
       }
     });
     navMenu.querySelectorAll('a').forEach(link=>{
       link.addEventListener('click', ()=>{
         navMenu.classList.remove('open');
         navToggle.classList.remove('active');
       });
     });
   }

    // background music player - Hola Amigo (intro loop)
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const volumeControl = document.getElementById('volumeControl');
    const TARGET_VOLUME = volumeControl ? Number(volumeControl.value) : 0.4;
    let musicPlaying = false;
    let musicUnlockPending = false;
    let musicStartPending = false;
    let resumeMusicOnReturn = false;

    if(bgMusic && musicBtn){
      // volume stays at the user's slider value (0.4 default); the slider is
      // the user's to control, we never move it automatically on load.
      bgMusic.volume = TARGET_VOLUME;

      const renderVolume = ()=>{
        if(volumeControl){
          volumeControl.value = String(bgMusic.volume);
          volumeControl.style.background = `linear-gradient(to right, var(--accent) 0 ${bgMusic.volume * 100}%, rgba(255,255,255,0.1) ${bgMusic.volume * 100}% 100%)`;
        }
      };
      renderVolume();

      const setMuted = (m)=>{ bgMusic.muted = m; };

      if(volumeControl){
        volumeControl.addEventListener('input', ()=>{
          bgMusic.volume = Number(volumeControl.value);
          renderVolume();
        });
      }

      // Loop only first 30 seconds (intro part)
      bgMusic.addEventListener('timeupdate', ()=>{
        if(bgMusic.currentTime >= 30){ bgMusic.currentTime = 0; }
      });

      // Auto-play on page load without any touch.
      // Browsers always allow *muted* autoplay. We try audible autoplay first
      // (works once the page has earned media engagement); on a fresh visit we
      // fall back to muted autoplay and immediately unmute — Chrome/Firefox let
      // you toggle mute on a playing element without a gesture, so it can sound
      // with no tap at all.
      const startMusic = ()=>{
        if(musicPlaying || musicStartPending) return;
        musicStartPending = true;
        musicUnlockPending = false;
        bgMusic.currentTime = 0;
        bgMusic.volume = TARGET_VOLUME;
        setMuted(false);
        bgMusic.play().then(()=>{
          musicBtn.classList.add('playing');
          musicPlaying = true;
          resumeMusicOnReturn = true;
          musicStartPending = false;
          musicUnlockPending = false;
        }).catch(()=>{
          // Browsers may block sound until the visitor interacts with the page.
          musicStartPending = false;
          musicUnlockPending = true;
        });
      };

      window.addEventListener('hola-enter', startMusic);

      const unlockMusic = ()=>{
        if(triggerMusicOnHola && musicUnlockPending && !musicPlaying){
          startMusic();
        }
      };
      ['click', 'touchstart', 'pointerdown', 'scroll', 'wheel'].forEach(eventName=>{
        document.addEventListener(eventName, unlockMusic, { passive:true });
      });

      const pauseForInactivePage = ()=>{
        if(!musicPlaying || bgMusic.paused) return;
        resumeMusicOnReturn = true;
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        musicPlaying = false;
      };

      const resumeForActivePage = ()=>{
        if(!resumeMusicOnReturn || !triggerMusicOnHola || musicPlaying || document.visibilityState !== 'visible') return;
        bgMusic.play().then(()=>{
          musicBtn.classList.add('playing');
          musicPlaying = true;
        }).catch(()=>{
          // The browser may require an interaction before resuming audio.
        });
      };

      document.addEventListener('visibilitychange', ()=>{
        if(document.visibilityState === 'hidden') pauseForInactivePage();
        else resumeForActivePage();
      });
      window.addEventListener('blur', pauseForInactivePage);
      window.addEventListener('focus', resumeForActivePage);

      // Play / pause toggle
      musicBtn.addEventListener('click', ()=>{
        if(musicPlaying){
          bgMusic.pause();
          musicBtn.classList.remove('playing');
          musicPlaying = false;
          resumeMusicOnReturn = false;
        } else {
          bgMusic.currentTime = 0;
          bgMusic.muted = false;
          bgMusic.play();
          musicBtn.classList.add('playing');
          musicPlaying = true;
          resumeMusicOnReturn = true;
        }
      });
    }
