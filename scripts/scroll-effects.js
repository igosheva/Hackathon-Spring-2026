/* GSAP-анимации:
   - вход hero (split-text заголовка, fade подзаголовка, scale countdown, появление CTA);
   - reveal-секций при попадании в viewport;
   - анимация отрисовки retention-кривой;
   - tilt-эффект для prize-карточек. */

window.TradexScroll = (function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (!window.gsap) return;
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

    splitTitle();
    heroIntro();
    revealOnScroll();
    animateRetentionChart();
    initPrizeTilt();
  }

  // ── Hero: разбиваем title на буквы (только верхняя строка) ────────
  function splitTitle() {
    const title = document.querySelector('.hero__title');
    if (!title) return;

    title.querySelectorAll('br, .hero__title-accent').forEach((node) => {
      if (node.tagName === 'BR') return;
      // оборачиваем accent целиком как один "char-блок"
      node.classList.add('split-char');
      node.style.transitionDelay = '0s';
    });

    // первая строка (текст перед <br>) — разбиваем по буквам
    const firstLineNodes = [];
    for (const child of Array.from(title.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) firstLineNodes.push(child);
      else break;
    }
    firstLineNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const frag = document.createDocumentFragment();
      [...text].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = ch === ' ' ? ' ' : ch;
        frag.appendChild(span);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  // ── Hero: timeline появления ──────────────────────────────────────
  function heroIntro() {
    if (!document.querySelector('.hero__title')) return; // нет hero-таймера (напр. marathon)
    if (reducedMotion) {
      window.gsap.set('.hero__date-chip, .hero__subtitle, .countdown__caption, .countdown, .cta, .split-char', {
        opacity: 1, y: 0, scale: 1, rotateX: 0,
      });
      return;
    }

    const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero__date-chip', { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(
        '.hero__title .split-char',
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.025 },
        0.3
      )
      .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.7 }, 0.9)
      .to('.countdown__caption', { opacity: 1, y: 0, duration: 0.5 }, 1.0)
      .to('.countdown', { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' }, 1.1)
      .to('.cta', { opacity: 1, y: 0, duration: 0.6 }, 1.4);
  }

  // ── Reveal по скроллу ─────────────────────────────────────────────
  function revealOnScroll() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reducedMotion || !window.ScrollTrigger) {
      window.gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    items.forEach((el) => {
      window.gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Stagger внутри сеток с карточками
    const grids = [
      { sel: '.focus-grid > .focus-card' },
      { sel: '.users__grid > .user-card' },
      { sel: '.users__context-grid > .context-card' },
      { sel: '.topics__grid > .topic-card' },
      { sel: '.criteria__grid > .criterion-card' },
      { sel: '.checklist__grid > .checklist__item' },
      { sel: '.prizes__grid > .prize-card' },
      { sel: '.timeline__list > .timeline__item' },
      { sel: '.faq__list > .faq__item' },
    ];
    grids.forEach(({ sel }) => {
      const els = document.querySelectorAll(sel);
      if (!els.length) return;
      window.gsap.fromTo(
        els,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: els[0].parentElement,
            start: 'top 80%',
          },
        }
      );
    });
  }

  // ── Retention chart drawing ───────────────────────────────────────
  function animateRetentionChart() {
    const line   = document.querySelector('.retention-line');
    const dots   = document.querySelectorAll('.retention-dots circle');
    const area   = document.querySelector('.retention-area');
    const values = document.querySelectorAll('.retention-values text');
    const range  = document.querySelector('.retention-range');
    const rangeLabel = document.querySelector('.retention-range-label');
    if (!line) return;

    if (reducedMotion || !window.ScrollTrigger) {
      line.style.strokeDashoffset = '0';
      dots.forEach((d) => (d.style.opacity = '1'));
      values.forEach((v) => (v.style.opacity = '1'));
      if (area) area.style.opacity = '1';
      if (range) range.style.opacity = '1';
      if (rangeLabel) rangeLabel.style.opacity = '1';
      return;
    }

    const totalLength = line.getTotalLength ? line.getTotalLength() : 1000;
    line.style.strokeDasharray  = totalLength;
    line.style.strokeDashoffset = totalLength;

    const tl = window.gsap.timeline({
      scrollTrigger: {
        trigger: '.metric__chart',
        start: 'top 75%',
      },
    });

    tl.to([range, rangeLabel], { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(line, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, '-=0.3')
      .to(area, { opacity: 1, duration: 1, ease: 'power2.out' }, '-=1.8')
      .to(
        dots,
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.16 },
        '-=1.8'
      )
      .to(
        values,
        { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.12 },
        '-=1.5'
      );
  }

  // ── Prize cards — mousemove tilt ──────────────────────────────────
  function initPrizeTilt() {
    if (reducedMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const maxTilt = 6;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        window.gsap.to(card, {
          rotateY: x * maxTilt,
          rotateX: -y * maxTilt,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });
      card.addEventListener('mouseleave', () => {
        window.gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  return { init };
})();
