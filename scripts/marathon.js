/* Оркестратор страницы марафона: рендерит участников и темы сразу
   в финальном состоянии — анимации распределения и жеребьёвки отключены. */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.TradexParticipants) await window.TradexParticipants.init();
  if (window.TradexTopics) await window.TradexTopics.init();
  if (window.TradexScroll) window.TradexScroll.init();
});

/*
// Прежняя логика с кнопками распределения / жеребьёвки — оставлена на будущее.
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
    }
  });
}
*/
