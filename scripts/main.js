/* Точка входа: дожидаемся DOM, рендерим участников и запускаем GSAP-анимации.
   Порядок важен: сначала участники в DOM, потом регистрация ScrollTrigger. */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.TradexParticipants) {
    await window.TradexParticipants.init();
  }

  if (window.TradexTopics) {
    await window.TradexTopics.init();
  }

  if (window.TradexScroll) {
    window.TradexScroll.init();
  }

  initNav();
  initMarathonGate();

  // smooth scroll для якорей (на случай браузеров без CSS smooth)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

// Навигация: появляется со второй секции + подсветка активного раздела (scrollspy)
function initNav() {
  const nav  = document.getElementById('topnav');
  const hero = document.getElementById('hero');
  if (!nav || !hero) return;

  // hero занимает ровно первый экран — как только он полностью ушёл,
  // мы оказались на второй секции, и навигация появляется
  new IntersectionObserver(
    ([entry]) => nav.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(hero);

  // scrollspy
  const links = Array.from(nav.querySelectorAll('.topnav__link'));
  const sectionToLink = new Map();
  links.forEach((link) => {
    const section = document.getElementById(link.getAttribute('href').slice(1));
    if (section) sectionToLink.set(section, link);
  });

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        const active = sectionToLink.get(entry.target);
        if (active) active.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sectionToLink.forEach((_, section) => spy.observe(section));
}

// Кнопка «Старт марафона»: активна с момента старта (или по ?host для ведущего).
function initMarathonGate() {
  const btn  = document.getElementById('marathon-btn');
  const hint = document.getElementById('marathon-hint');
  if (!btn) return;

  const START = new Date('2026-05-27T12:00:00+03:00');
  const hostOverride = new URLSearchParams(location.search).has('host');

  function unlock() {
    btn.dataset.state = 'ready';
    btn.removeAttribute('aria-disabled');
    if (hint) hint.textContent = 'Арена открыта — поехали 🚀';
  }

  function lock() {
    btn.dataset.state = 'locked';
    btn.setAttribute('aria-disabled', 'true');
    // не даём перейти, пока заблокировано
    btn.addEventListener('click', blockClick);
  }

  function blockClick(e) {
    if (btn.dataset.state === 'locked') e.preventDefault();
  }

  function check() {
    if (hostOverride || Date.now() >= START.getTime()) {
      unlock();
      return true;
    }
    return false;
  }

  lock();
  if (!check()) {
    // ждём момента старта, обновляя подсказку
    const tick = setInterval(() => {
      if (check()) clearInterval(tick);
    }, 1000);
  }
}
