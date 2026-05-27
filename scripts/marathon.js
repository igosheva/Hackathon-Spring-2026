/* Оркестратор страницы марафона: рендерит участников и темы,
   раскрытие зафиксированного результата запускается по клику на кнопки. */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.TradexParticipants) await window.TradexParticipants.init();
  if (window.TradexTopics) await window.TradexTopics.init();
  if (window.TradexScroll) window.TradexScroll.init();

  setupButton(
    'marathon-teams-btn',
    () => window.TradexParticipants && window.TradexParticipants.revealTeams(),
    { progress: 'Распределяю…', done: 'Команды собраны' }
  );

  setupButton(
    'marathon-topics-btn',
    () => window.TradexTopics && window.TradexTopics.revealAssignments(),
    { progress: 'Разыгрываю…', done: 'Темы разыграны' }
  );
});

function setupButton(id, action, labels) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const label = btn.querySelector('.shuffle-btn__label');

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.dataset.state = 'shuffling';
    if (label) label.textContent = labels.progress;

    try {
      await action();
    } finally {
      btn.dataset.state = 'distributed';
      if (label) label.textContent = labels.done;
      // результат зафиксирован — повторять не нужно, кнопка остаётся неактивной
    }
  });
}
