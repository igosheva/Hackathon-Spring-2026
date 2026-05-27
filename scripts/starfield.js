/* Hero canvas: звёзды + летящие частицы + редкие кометы.
   Респектит prefers-reduced-motion и приостанавливается при скрытой вкладке. */

(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;

  const STAR_COUNT     = 220;
  const PARTICLE_COUNT = 40;
  const MAX_COMETS     = 2;

  let stars = [];
  let particles = [];
  let comets = [];
  let rafId = null;
  let lastT = performance.now();

  const COLORS = {
    starWhite:  'rgba(241, 245, 255, ',
    starViolet: 'rgba(139, 92, 246, ',
    starCyan:   'rgba(0, 212, 255, ',
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width  = rect.width;
    height = rect.height;
    canvas.width  = Math.floor(width  * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.002 + 0.0005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: pickStarColor(),
      });
    }
  }

  function pickStarColor() {
    const r = Math.random();
    if (r < 0.7) return COLORS.starWhite;
    if (r < 0.88) return COLORS.starViolet;
    return COLORS.starCyan;
  }

  function spawnParticle(initial) {
    const cx = width / 2;
    const cy = height / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.4 + 0.15;
    const dist = initial ? Math.random() * Math.max(width, height) * 0.5 : 0;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 1.2 + 0.5,
      alpha: Math.random() * 0.5 + 0.3,
      color: Math.random() < 0.5 ? COLORS.starViolet : COLORS.starCyan,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawnParticle(true));
  }

  function spawnComet() {
    const fromLeft = Math.random() < 0.5;
    const y = Math.random() * height * 0.5;
    return {
      x: fromLeft ? -100 : width + 100,
      y,
      vx: (fromLeft ? 1 : -1) * (Math.random() * 1.5 + 1.8),
      vy: Math.random() * 0.4 + 0.3,
      life: 0,
      maxLife: 280,
      length: 80 + Math.random() * 40,
    };
  }

  function update(dt) {
    // stars: just twinkle
    for (const s of stars) s.twinklePhase += s.twinkleSpeed * dt;

    // particles
    const cx = width / 2;
    const cy = height / 2;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
        particles[i] = spawnParticle(false);
        // reset to center
        particles[i].x = cx;
        particles[i].y = cy;
      }
    }

    // comets
    if (comets.length < MAX_COMETS && Math.random() < 0.0025) comets.push(spawnComet());
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += c.vx * dt * 0.5;
      c.y += c.vy * dt * 0.5;
      c.life += dt;
      if (c.life > c.maxLife || c.x < -200 || c.x > width + 200) comets.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // stars
    for (const s of stars) {
      const a = s.baseAlpha + Math.sin(s.twinklePhase) * 0.3;
      ctx.fillStyle = s.color + Math.max(0, Math.min(1, a)) + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // particles
    for (const p of particles) {
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // comets
    for (const c of comets) {
      const gradient = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * c.length, c.y - c.vy * c.length);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * c.length, c.y - c.vy * c.length);
      ctx.stroke();

      ctx.fillStyle = 'rgba(241, 245, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) {
    const dt = Math.min(t - lastT, 50);
    lastT = t;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId !== null) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // init
  function init() {
    resize();
    initStars();
    initParticles();
    start();
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initStars();
      initParticles();
    }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  init();
})();
