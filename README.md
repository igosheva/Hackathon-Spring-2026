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

## Деплой на GitHub Pages

1. Закоммитить файлы в репозиторий.
2. Settings → Pages → Source: ветка `main`, папка `/ (root)`.
3. Открыть `https://<username>.github.io/<repo>/`.

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
