/* Жеребьёвка тем по командам.
   5 тем, 4 команды: по клику каждая команда получает уникальную тему
   (slot-machine эффект), одна тема остаётся «свободной для всех». */

window.TradexTopics = (function () {
  const STAGE_SELECTOR = '#topics-stage';
  const BUTTON_SELECTOR = '#topics-btn';

  let teams = [];
  let isAnimating = false;
  let played = false;

  function setBadgeTeam(badge, team) {
    badge.textContent = team.name;
    badge.style.color = '#fff';
    badge.style.background = `linear-gradient(135deg, ${team.color} 0%, rgba(255,255,255,0.12) 200%)`;
    badge.style.borderColor = team.color;
  }

  function setBadgeFree(badge) {
    badge.textContent = 'Свободная тема';
    badge.style.color = 'var(--text-secondary)';
    badge.style.background = 'rgba(99,102,241,0.08)';
    badge.style.borderColor = 'var(--border-subtle)';
  }

  // Слот-машина для одной карточки: мелькают команды, затем фиксируется финал
  function rollCard(card, finalTeam, duration) {
    return new Promise((resolve) => {
      const badge = card.querySelector('.topic-card__badge');
      card.classList.add('topic-card--rolling');

      const spin = setInterval(() => {
        const t = teams[Math.floor(Math.random() * teams.length)];
        setBadgeTeam(badge, t);
      }, 80);

      setTimeout(() => {
        clearInterval(spin);
        card.classList.remove('topic-card--rolling');
        card.classList.add('topic-card--assigned');

        if (finalTeam) {
          setBadgeTeam(badge, finalTeam);
          card.style.setProperty('--topic-accent', finalTeam.color);
        } else {
          setBadgeFree(badge);
          card.classList.add('topic-card--free');
          card.style.setProperty('--topic-accent', 'var(--accent-glow)');
        }

        if (window.gsap) {
          window.gsap.fromTo(
            badge,
            { scale: 1.4 },
            { scale: 1, duration: 0.5, ease: 'back.out(2.5)' }
          );
        }
        resolve();
      }, duration);
    });
  }

  // Фиксированное назначение: тема → команда (из teams[].topic).
  // Темы без команды считаются «свободными».
  function buildAssignment(cards) {
    const map = new Map();
    cards.forEach((card) => {
      const topicId = card.dataset.topic;
      const team = teams.find((t) => t.topic === topicId) || null;
      map.set(card, team);
    });
    return map;
  }

  // Ядро жеребьёвки: slot-machine на всех карточках с нарастающим временем.
  async function playDraw() {
    const stage = document.querySelector(STAGE_SELECTOR);
    if (!stage || isAnimating || !teams.length) return false;
    isAnimating = true;

    const cards = Array.from(stage.querySelectorAll('.topic-card'));
    const assignment = buildAssignment(cards);

    stage.setAttribute('data-state', 'rolling');
    await Promise.all(
      cards.map((card, i) => rollCard(card, assignment.get(card), 900 + i * 450))
    );
    stage.setAttribute('data-state', 'done');

    played = true;
    isAnimating = false;
    return true;
  }

  // Кнопочный режим (если на странице есть #topics-btn)
  async function runDraw(btn, label) {
    btn.disabled = true;
    btn.dataset.state = 'shuffling';
    label.textContent = played ? 'Перетасовываю…' : 'Разыгрываю…';
    const ok = await playDraw();
    if (ok) {
      btn.dataset.state = 'distributed';
      label.textContent = 'Разыграть заново';
    }
    btn.disabled = false;
  }

  // Авто-раскрытие (страница марафона) — без кнопки
  function revealAssignments() {
    return playDraw();
  }

  async function init() {
    try {
      const d = await window.TradexData.load();
      teams = d.teams || [];
    } catch (e) {
      console.error('[topics] не удалось загрузить распределение', e);
      return;
    }

    // кнопочный режим (если на странице есть кнопка) — иначе раскрытие идёт авто
    const btn = document.querySelector(BUTTON_SELECTOR);
    if (!btn) return;

    const label = btn.querySelector('.shuffle-btn__label');
    btn.addEventListener('click', () => runDraw(btn, label));
  }

  return { init, revealAssignments };
})();
