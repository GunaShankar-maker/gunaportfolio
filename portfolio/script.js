function initPortfolio() {
  /* =========================================================
     1. SYNTHESIZED SOUND EFFECTS (Web Audio API)
     ========================================================= */
  let sfxEnabled = true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;

  function playClick(freq = 520, dur = 0.04) {
    if (!sfxEnabled || !AudioCtx) return;
    try {
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  const sfxBtn = document.getElementById('sfxBtn');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', (e) => {
      sfxEnabled = !sfxEnabled;
      e.target.textContent = `SFX: ${sfxEnabled ? 'ON' : 'OFF'}`;
      if (sfxEnabled) playClick(740, 0.06);
    });
  }

  /* =========================================================
     2. CUSTOM DIFFERENCE CURSOR
     ========================================================= */
  const cursor = document.getElementById('cursor');
  if (cursor) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  }

  document.querySelectorAll('a, button, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    el.addEventListener('click', () => playClick(600, 0.03));
  });

  /* =========================================================
     3. SCROLL ANIMATION ENGINE ("BLOCKS COME TOGETHER" + PARALLAX)
     ========================================================= */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counterBtn = document.getElementById('slideCounterBtn');
  const scrollProgress = document.getElementById('scrollProgress');
  let currentSlideIndex = 0;

  if (slides.length) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= 0.18) {
          entry.target.classList.add('in-view');
        } else if (entry.intersectionRatio === 0) {
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: [0, 0.18] });

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          currentSlideIndex = slides.indexOf(entry.target);
          if (counterBtn && entry.target.dataset.slide) {
            counterBtn.textContent = entry.target.dataset.slide;
          }
        }
      });
    }, { threshold: 0.5 });

    slides.forEach(s => {
      animObserver.observe(s);
      counterObserver.observe(s);
    });
  }

  const parallaxEls = document.querySelectorAll('[data-parallax]');
  let ticking = false;

  function updateScrollEffects() {
    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      parallaxEls.forEach(el => {
        const slide = el.closest('.slide');
        if (!slide || !slide.classList.contains('in-view')) return;
        const rect = slide.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const shift = rect.top * speed;
        el.style.marginTop = `${shift.toFixed(1)}px`;
      });
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal-overlay.open')) {
      if (e.key === 'Escape') closeAllModals();
      return;
    }
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (!slides.length) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(currentSlideIndex + 1, slides.length - 1);
      slides[next].scrollIntoView({ behavior: 'smooth' });
      playClick(460, 0.04);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(currentSlideIndex - 1, 0);
      slides[prev].scrollIntoView({ behavior: 'smooth' });
      playClick(380, 0.04);
    }
  });

  /* =========================================================
     4. TOAST HELPER & LIVE DATE
     ========================================================= */
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  function updateLiveDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    }) + ',<br>' + now.getFullYear();

    document.querySelectorAll('[data-live-date]').forEach(el => {
      el.innerHTML = formattedDate;
    });
  }
  updateLiveDate();

  /* =========================================================
     5. DRAGGABLE DEV CARD
     ========================================================= 
  const dragCard = document.getElementById('dragCard');
  const dragHandle = document.getElementById('dragHandle');
  const closeDragBtn = document.getElementById('closeDragBtn');

  if (dragCard && dragHandle) {
    let dragging = false, offX = 0, offY = 0;

    dragHandle.addEventListener('mousedown', (e) => {
      dragging = true;
      const rect = dragCard.getBoundingClientRect();
      offX = e.clientX - rect.left;
      offY = e.clientY - rect.top;
      dragCard.style.right = 'auto';
      dragCard.style.bottom = 'auto';
      dragCard.style.left = rect.left + 'px';
      dragCard.style.top = rect.top + 'px';
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      dragCard.style.left = (e.clientX - offX) + 'px';
      dragCard.style.top = (e.clientY - offY) + 'px';
    });

    window.addEventListener('mouseup', () => { dragging = false; });

    if (closeDragBtn) {
      closeDragBtn.addEventListener('click', () => {
        dragCard.style.display = 'none';
      });
    }
  }*/

  /* =========================================================
     6. MODALS (TERMINAL, RESUME, MINI-GAME)
     ========================================================= 
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    closeAllModals();
    el.classList.add('open');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  const openTermBtn = document.getElementById('openTermBtn');
  const termInput = document.getElementById('termInput');
  if (openTermBtn) {
    openTermBtn.addEventListener('click', () => {
      openModal('termModal');
      if (termInput) setTimeout(() => termInput.focus(), 60);
    });
  }

  const openResumeBtn = document.getElementById('openResumeBtn');
  const openResumeBtn2 = document.getElementById('openResumeBtn2');
  const openGameBtn = document.getElementById('openGameBtn');

  if (openResumeBtn) openResumeBtn.addEventListener('click', () => openModal('resumeModal'));
  if (openResumeBtn2) openResumeBtn2.addEventListener('click', () => openModal('resumeModal'));
  if (openGameBtn) openGameBtn.addEventListener('click', () => openModal('gameModal'));

  const termForm = document.getElementById('termForm');
  const termLog = document.getElementById('termLog');

  function printTerm(txt) {
    if (!termLog) return;
    const div = document.createElement('div');
    div.innerHTML = txt;
    termLog.appendChild(div);
    termLog.scrollTop = termLog.scrollHeight;
  }

  if (termForm && termInput) {
    termForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = termInput.value.trim();
      if (!raw) return;
      const cmd = raw.toLowerCase();
      printTerm(`<span style="opacity:0.6;">$ ${raw}</span>`);

      if (cmd === 'help') {
        printTerm('Commands: whoami, skills, links, resume, game, invert, clear');
      } else if (cmd === 'whoami') {
        printTerm('GunaShankar Polaki — CS Student learning Java, DSA & Web Development.');
      } else if (cmd === 'skills') {
        printTerm('Java, Problem Solving, HTML5, CSS3, JavaScript, Git & GitHub.');
      } else if (cmd === 'links') {
        printTerm('Email: gunapolaki143@gmail.com | GitHub: gunapolaki143-maker | LeetCode: Gunashankar');
      } else if (cmd === 'resume') {
        openModal('resumeModal');
      } else if (cmd === 'game') {
        openModal('gameModal');
      } else if (cmd === 'invert') {
        document.body.classList.toggle('inverted-mode');
        printTerm('Toggled Inverted Brutalist Mode!');
      } else if (cmd === 'clear') {
        if (termLog) termLog.innerHTML = '';
      } else {
        printTerm(`Unknown command "${raw}". Type <strong>help</strong>.`);
      }
      termInput.value = '';
    });
  }

  const arena = document.getElementById('arena');
  const bugTarget = document.getElementById('bugTarget');
  const gScoreEl = document.getElementById('gScore');
  const gTimeEl = document.getElementById('gTime');
  const startGameBtn = document.getElementById('startGameBtn');

  if (arena && bugTarget && startGameBtn) {
    let gScore = 0, gTime = 20, gTimer = null;

    function moveBug() {
      const x = Math.random() * Math.max(20, arena.clientWidth - 42);
      const y = Math.random() * Math.max(20, arena.clientHeight - 42);
      bugTarget.style.left = x + 'px';
      bugTarget.style.top = y + 'px';
    }

    bugTarget.addEventListener('click', () => {
      gScore++;
      if (gScoreEl) gScoreEl.textContent = gScore;
      playClick(880, 0.05);
      moveBug();
    });

    startGameBtn.addEventListener('click', () => {
      clearInterval(gTimer);
      gScore = 0; gTime = 20;
      if (gScoreEl) gScoreEl.textContent = 0;
      if (gTimeEl) gTimeEl.textContent = 20;
      bugTarget.style.display = 'block';
      moveBug();
      gTimer = setInterval(() => {
        gTime--;
        if (gTimeEl) gTimeEl.textContent = gTime;
        if (gTime <= 0) {
          clearInterval(gTimer);
          bugTarget.style.display = 'none';
          showToast(`Debugged ${gScore} bugs!`);
        }
      }, 1000);
    });
  }*/

  /* =========================================================
     7. CONTACT & EMAIL COPY & EASTER EGG
     ========================================================= */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('gunapolaki143@gmail.com');
      showToast('Copied: gunapolaki143@gmail.com');
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName')?.value || '';
      const email = document.getElementById('cEmail')?.value || '';
      const msg = document.getElementById('cMsg')?.value || '';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
      window.location.href = `mailto:gunapolaki143@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening your email app...');
    });
  }

  if (counterBtn) {
    let secretClicks = 0;
    counterBtn.addEventListener('click', () => {
      secretClicks++;
      if (secretClicks >= 5) {
        secretClicks = 0;
        document.body.classList.toggle('inverted-mode');
        showToast('Inverted Editorial Mode Toggled!');
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}