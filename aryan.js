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
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
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

  // loader
  const loader = document.getElementById('loader');
  const loaderPercent = document.getElementById('loaderPercent');
  let progress = 0;
  const loaderInterval = setInterval(()=>{
    progress += Math.random() * 15 + 5;
    if(progress > 100) progress = 100;
    loaderPercent.textContent = Math.floor(progress) + '%';
    if(progress >= 100) clearInterval(loaderInterval);
  }, 150);

  window.addEventListener('load', ()=>{
    clearInterval(loaderInterval);
    loaderPercent.textContent = '100%';
    setTimeout(()=>{
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 800);
  });
  document.body.style.overflow = 'hidden';

  // scroll reveal with stagger
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
         document.body.style.overflow = '';
       } else {
         navMenu.classList.add('open');
         navToggle.classList.add('active');
         document.body.style.overflow = 'hidden';
       }
     });
      navMenu.querySelectorAll('a').forEach(link=>{
        link.addEventListener('click', ()=>{
          navMenu.classList.remove('open');
          navToggle.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // background music player - Hola Amigo (first 30s intro loop)
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const volumeControl = document.getElementById('volumeControl');
    let musicPlaying = false;

    if(bgMusic && musicBtn){
      // Set volume
      bgMusic.volume = volumeControl ? Number(volumeControl.value) : 0.4;

      if(volumeControl){
        volumeControl.addEventListener('input', ()=>{
          bgMusic.volume = Number(volumeControl.value);
          volumeControl.style.background = `linear-gradient(to right, var(--accent) 0 ${bgMusic.volume * 100}%, rgba(255,255,255,0.1) ${bgMusic.volume * 100}% 100%)`;
        });
      }

      // Loop only first 30 seconds (intro part)
      bgMusic.addEventListener('timeupdate', ()=>{
        if(bgMusic.currentTime >= 30){
          bgMusic.currentTime = 0;
        }
      });

      // Auto-play on page load (browsers may block)
      const startMusic = ()=>{
        bgMusic.currentTime = 0;
        const playPromise = bgMusic.play();
        if(playPromise !== undefined){
          playPromise.then(()=>{
            musicBtn.classList.add('playing');
            musicPlaying = true;
          }).catch(()=>{
            // Try muted autoplay first; Safari may allow this even when audible autoplay is blocked.
            bgMusic.muted = true;
            const mutedPlayPromise = bgMusic.play();
            if(mutedPlayPromise !== undefined){
              mutedPlayPromise.then(()=>{
                bgMusic.muted = false;
                musicBtn.classList.add('playing');
                musicPlaying = true;
              }).catch(()=>{
                document.body.addEventListener('click', ()=>{
                  if(!musicPlaying){
                    bgMusic.muted = false;
                    bgMusic.play();
                    musicBtn.classList.add('playing');
                    musicPlaying = true;
                  }
                }, { once: true });
              });
            }
          });
        }
      };

      // Start when the loader begins fading out, so the intro stays behind the loading screen.
      window.addEventListener('load', ()=>{
        setTimeout(()=>{
          if(!musicPlaying) startMusic();
        }, 800);
      });

      // Manual toggle
      musicBtn.addEventListener('click', ()=>{
        if(musicPlaying){
          bgMusic.pause();
          musicBtn.classList.remove('playing');
          musicPlaying = false;
        } else {
          bgMusic.currentTime = 0;
          bgMusic.play();
          musicBtn.classList.add('playing');
          musicPlaying = true;
        }
      });
    }
