# Tradex Hackathon Spring 2026 — лендинг

Промо-лендинг внутреннего хакатона 27–28 мая 2026.

## Стек

Статика без сборки: HTML + CSS + Vanilla JS. Анимации — [GSAP](https://gsap.com/) (ScrollTrigger + Flip), фон — Canvas 2D.

## Запуск локально

`fetch()` для `data/participants.json` не работает по `file://` — нужен любой локальный сервер.

```bash
# Python 3
python3 -m http.server 8080

# или Node (npx)
npx serve .
```

Открыть http://localhost:8080.

## Как поменять список участников

Файл [data/participants.json](data/participants.json):

```json
{
  "teams": [
    { "id": "nebula", "name": "Nebula", "label": "Группа 1", "color": "#6366f1" }
  ],
  "participants": [
    { "name": "Имя", "teamId": "nebula" }
  ]
}
```

После изменения — просто перезагрузить страницу.

## Деплой на Render (статический сайт)

В репозитории есть [`render.yaml`](render.yaml) — Render подхватит настройки автоматически.

**Через Blueprint (рекомендуется):**
1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Подключить GitHub-аккаунт и выбрать репозиторий `Hackathon-Spring-2026`.
3. Render прочитает `render.yaml` и создаст статический сайт. Нажать **Apply**.
4. Дождаться деплоя — сайт будет доступен по адресу `https://tradex-hackathon-spring-2026.onrender.com`.

**Вручную (если не использовать Blueprint):**
1. **New** → **Static Site** → выбрать репозиторий.
2. **Build Command:** оставить пустым.
3. **Publish Directory:** `.` (корень).
4. **Create Static Site**.

Каждый `git push` в `main` автоматически передеплоит сайт.

## Деплой на GitHub Pages (альтернатива)

1. Settings → Pages → Source: ветка `main`, папка `/ (root)`.
2. Открыть `https://<username>.github.io/<repo>/`.

## Структура

```
.
├── index.html
├── styles.css
├── scripts/
│   ├── main.js              # точка входа
│   ├── starfield.js         # звёздное поле + кометы
│   ├── countdown.js         # таймер до 27.05.2026 10:00
│   ├── participants.js      # рендер + FLIP-переключение видов
│   └── scroll-effects.js    # ScrollTrigger-анимации
├── data/
│   └── participants.json
├── INSTRUCTION.md           # детальная инструкция по сборке
└── README.md
```

Подробнее — в [INSTRUCTION.md](INSTRUCTION.md).
