/* Рендер 16 участников плитками + кнопка-распределитель.
   Сначала показываем безымянную сетку, по клику запускаем «псевдо-рандомный»
   shuffle и плавно раскидываем по 4 командам через GSAP Flip. */

window.TradexParticipants = (function () {
  const STAGE_SELECTOR  = '#participants-stage';
  const BUTTON_SELECTOR = '#shuffle-btn';
  const DATA_URL = 'data/participants.json';

  let data = null;
  let currentView = 'all'; // 'all' | 'teams'
  let isAnimating = false;

  const AVATAR_GRADIENTS = [
    ['#6366f1', '#00d4ff'],
    ['#8b5cf6', '#f472b6'],
    ['#00d4ff', '#10d9a0'],
    ['#f472b6', '#6366f1'],
    ['#10d9a0', '#00d4ff'],
    ['#8b5cf6', '#00d4ff'],
    ['#6366f1', '#f472b6'],
    ['#00d4ff', '#8b5cf6'],
  ];

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pickGradient(name) {
    return AVATAR_GRADIENTS[hashStr(name) % AVATAR_GRADIENTS.length];
  }

  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
  }

  function avatarStyle(name) {
    const [a, b] = pickGradient(name);
    return `background: linear-gradient(135deg, ${a} 0%, ${b} 100%);`;
  }

  function teamById(id) {
    return data.teams.find((t) => t.id === id);
  }

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Card HTML ──────────────────────────────────────────────────────
  function participantCardHTML(p, opts = {}) {
    const team = teamById(p.teamId);
    const teamLabel = opts.showTeam && team ? `${team.name} · ${team.label}` : '';
    return `
      <div class="participant-card" data-id="${p.name}" data-flip-id="${p.name}" data-team="${p.teamId}">
        <div class="participant-card__avatar" style="${avatarStyle(p.name)}">${initials(p.name)}</div>
        <div class="participant-card__info">
          <span class="participant-card__name">${p.name}</span>
          ${teamLabel ? `<span class="participant-card__team">${teamLabel}</span>` : ''}
        </div>
      </div>
    `;
  }

  // ── Render: плоская сетка без указания команд ─────────────────────
  function renderAll(stage) {
    const order = shuffleArr(data.participants); // случайный порядок плиток
    stage.setAttribute('data-view', 'all');
    stage.innerHTML = order.map((p) => participantCardHTML(p, { showTeam: false })).join('');
  }

  // ── Render: участники сгруппированы по командам ──────────────────
  function renderTeams(stage) {
    stage.setAttribute('data-view', 'teams');
    stage.innerHTML = data.teams
      .map((team) => {
        const members = data.participants.filter((p) => p.teamId === team.id);
        const cards = members.map((p) => participantCardHTML(p, { showTeam: true })).join('');
        return `
          <div class="team-group" data-team="${team.id}">
            <div class="team-group__head">
              <span class="team-group__dot" style="background:${team.color}"></span>
              <span class="team-group__title">${team.name}</span>
              <span class="team-group__label">${team.label}</span>
            </div>
            ${cards}
          </div>
        `;
      })
      .join('');
  }

  // ── Один быстрый shuffle-проход (только в плиточном виде) ─────────
  function flipShuffleStep(stage) {
    return new Promise((resolve) => {
      const cards = Array.from(stage.querySelectorAll(':scope > .participant-card'));
      if (!cards.length || !window.Flip) return resolve();

      const state = window.Flip.getState(cards);
      // тасуем порядок detached children
      shuffleArr(cards).forEach((c) => stage.appendChild(c));

      window.Flip.from(state, {
        duration: 0.4,
        ease: 'power2.inOut',
        stagger: { each: 0.015, from: 'random' },
        onComplete: resolve,
      });
    });
  }

  // ── Финальный переход: плитки → команды ───────────────────────────
  function flipToTeams(stage) {
    return new Promise((resolve) => {
      if (!window.Flip) {
        renderTeams(stage);
        return resolve();
      }
      const cards = stage.querySelectorAll('.participant-card');
      const state = window.Flip.getState(cards, { props: 'opacity' });

      renderTeams(stage);

      window.Flip.from(state, {
        duration: 0.9,
        ease: 'power3.inOut',
        stagger: 0.03,
        absolute: true,
        onEnter: (els) =>
          window.gsap.fromTo(
            els,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
          ),
        onLeave: (els) => window.gsap.to(els, { opacity: 0, duration: 0.3 }),
        onComplete: resolve,
      });
    });
  }

  // ── Обратный переход: команды → плитки ────────────────────────────
  function flipToAll(stage) {
    return new Promise((resolve) => {
      if (!window.Flip) {
        renderAll(stage);
        return resolve();
      }
      const cards = stage.querySelectorAll('.participant-card');
      const state = window.Flip.getState(cards, { props: 'opacity' });

      renderAll(stage);

      window.Flip.from(state, {
        duration: 0.8,
        ease: 'power3.inOut',
        stagger: 0.025,
        absolute: true,
        onEnter: (els) =>
          window.gsap.fromTo(
            els,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5 }
          ),
        onLeave: (els) => window.gsap.to(els, { opacity: 0, duration: 0.3 }),
        onComplete: resolve,
      });
    });
  }

  // ── Сценарий «Распределить» ───────────────────────────────────────
  async function runDistribution(btn, label) {
    const stage = document.querySelector(STAGE_SELECTOR);
    if (!stage || isAnimating) return;
    isAnimating = true;
    btn.disabled = true;
    btn.dataset.state = 'shuffling';

    if (currentView === 'all') {
      label.textContent = 'Распределяю…';
      // 3 быстрых рандомных перетасовки
      for (let i = 0; i < 3; i++) {
        await flipShuffleStep(stage);
      }
      await flipToTeams(stage);
      currentView = 'teams';
      btn.dataset.state = 'distributed';
      label.textContent = 'Перетасовать заново';
    } else {
      label.textContent = 'Возвращаю…';
      await flipToAll(stage);
      currentView = 'all';
      btn.dataset.state = 'initial';
      label.textContent = 'Распределить по командам';
    }

    btn.disabled = false;
    isAnimating = false;
  }

  // ── Init ──────────────────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch(DATA_URL);
      data = await res.json();
    } catch (e) {
      console.error('[participants] не удалось загрузить data/participants.json', e);
      return;
    }

    const stage = document.querySelector(STAGE_SELECTOR);
    const btn   = document.querySelector(BUTTON_SELECTOR);
    if (!stage) return;

    renderAll(stage);

    if (btn) {
      // распределение доступно только по специальной ссылке (?host)
      const allowed = new URLSearchParams(location.search).has('host');
      if (!allowed) {
        btn.disabled = true;
        btn.title = 'Распределение запускает ведущий по специальной ссылке';
      } else {
        const label = btn.querySelector('.shuffle-btn__label');
        btn.addEventListener('click', () => runDistribution(btn, label));
      }
    }
  }

  return { init };
})();
