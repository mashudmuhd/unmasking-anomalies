function initLightParticles(){
  const canvas = document.getElementById('light-particles');
  if (!canvas) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function spawn(){
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.32 + 0.06,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.15,
      flick: Math.random() * Math.PI * 2
    };
  }
  function build(){
    resize();
    const count = window.innerWidth < 700 ? 20 : 40;
    particles = Array.from({ length: count }, spawn);
  }
  build();
  window.addEventListener('resize', build);

  function tick(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      p.flick += 0.02;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      const a = p.alpha * (0.55 + 0.45 * Math.sin(p.flick));
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grad.addColorStop(0, `rgba(230,200,105,${a})`);
      grad.addColorStop(1, 'rgba(230,200,105,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initTilt(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return; // skip touch devices
  document.querySelectorAll('.card, .pillar, .manuscript-scene').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rx = (py * -6).toFixed(2);
      const ry = (px * 8).toFixed(2);
      if (el.classList.contains('manuscript-scene')) {
        el.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      } else {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
      el.style.setProperty('--glow-x', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--glow-y', `${(py + 0.5) * 100}%`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

function initParallax(){
  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function onScroll(){
    const y = window.scrollY;
    els.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.12;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollProgress(){
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function onScroll(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initCursorLight(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.id = 'cursor-light-glow';
  document.body.appendChild(glow);

  let mouseX = -200, mouseY = -200;
  let currentX = -200, currentY = -200;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  function render(){
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('ua-theme') || 'dark';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ua-theme', theme);
  }

  // Initialize saved theme or default to dark
  setTheme(storedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLightParticles();
  initTilt();
  initParallax();
  initScrollProgress();
  initCursorLight();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
    }));
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const isMobile = window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;
  if (isMobile) {
    // Immediately show all reveal elements on mobile to prevent blank screens
    revealEls.forEach(el => el.classList.add('in'));
  } else if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02, rootMargin: '0px 0px 120px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Filter tabs (Articles / Videos pages)
  const filterBtns = document.querySelectorAll('.filters button');
  const filterCards = document.querySelectorAll('[data-category]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      filterCards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Forms: prevent real submission (no backend), show a quiet confirmation
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Sent — Jazak Allah Khair';
      btn.disabled = true;
      form.reset();
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3200);
    });
  });
});
