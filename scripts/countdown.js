/* Countdown до 27 мая 2026 10:00 МСК.
   Если время уже прошло — показывает нули и подпись «идёт сейчас». */

(function () {
  const TARGET_ISO = '2026-05-28T18:00:00+03:00';
  const target = new Date(TARGET_ISO);

  const root = document.getElementById('countdown');
  if (!root) return;

  const elDays    = root.querySelector('[data-unit="days"]');
  const elHours   = root.querySelector('[data-unit="hours"]');
  const elMinutes = root.querySelector('[data-unit="minutes"]');
  const elSeconds = root.querySelector('[data-unit="seconds"]');

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const now = new Date();
    let diff = Math.max(0, target.getTime() - now.getTime());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);

    elDays.textContent    = pad(days);
    elHours.textContent   = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
