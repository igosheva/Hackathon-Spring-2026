/* Разворачивает «сид» раунда в распределение людей по группам и тем по командам.
   Привязки не хранятся в открытом виде — они закодированы в seed и вычисляются
   здесь детерминированно, как результат жеребьёвки фиксированного раунда. */

window.TradexData = (function () {
  const URL = 'data/participants.json';
  const KEY = 'tradex2026';
  let cache = null;

  function unpack(seed) {
    const bin = atob(seed);
    let out = '';
    for (let i = 0; i < bin.length; i++) {
      out += String.fromCharCode(bin.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
    }
    return JSON.parse(out); // { r:[teamIdx per person], k:[topicIdx per team], f:freeTopicIdx }
  }

  async function load() {
    if (cache) return cache;

    const res = await fetch(URL, { cache: 'no-cache' });
    const raw = await res.json();
    const cfg = unpack(raw.seed);

    const teams = raw.teams.map((t, i) => ({
      ...t,
      topic: raw.topics[cfg.k[i]],
    }));

    const participants = raw.roster.map((name, i) => ({
      name,
      teamId: raw.teams[cfg.r[i]].id,
    }));

    cache = { teams, participants, freeTopic: raw.topics[cfg.f] };
    return cache;
  }

  return { load };
})();
