# Сайт ГБОУ Школа «Дмитровский» — редизайн

Этап 1: полный визуальный и UX-редизайн `schooldmitrovsky.ru` с сохранением
всего текущего наполнения и функциональности.

## Стек

| | |
|---|---|
| Next.js | 16 (App Router) |
| React | 19 |
| TypeScript | 6, `strict` |
| Стили | CSS Modules на единых токенах |
| Шрифты | Manrope и Golos Text, локально в WOFF2 с кириллицей |

## Запуск

```bash
npm install
npm run dev          # разработка
npm run build        # production build
npm run typecheck    # проверка типов
npm run lint         # ESLint
npm run check:content  # отчёт о готовности переноса контента
```

## Структура

```
src/
  app/            маршруты App Router, robots.ts, sitemap.ts
    ui-kit/       живая витрина дизайн-системы (закрыта от индексации)
  components/
    layout/       Container, Section, Grid, Prose
    ui/           Button, Card, Tag, Icon, Stats, Quote, Accordion,
                  Breadcrumbs, Pagination, EmptyState, Skeleton, Modal, CookieNotice
    cards/        News, Event, Club, Program, Person, Campus
    media/        Figure, Gallery, VideoEmbed, DocumentList
    form/         Input, Textarea, Select, Checkbox, FileInput, FormStatus
    site/         Header, MobileMenu, Footer, Hero, Logo
  content/        слой контента: типы, навигация, коллекции, редиректы
  lib/            вспомогательные функции
  styles/         tokens.css, fonts.css, globals.css
docs/             INVENTORY.md — инвентаризация и таблица соответствия
```

## Правила работы с контентом

Тексты, телефоны, адреса, даты, ссылки, документы и фотографии переносятся
с действующего сайта **без смысловых изменений**. Ничего не придумывается и не
сокращается. Весь фактический контент живёт в `src/content/` — в компонентах
не хардкодится.

Пустые коллекции и `href: null` означают «ещё не перенесено», а не «нет данных».
Текущее состояние показывает `npm run check:content`.

## Дизайн-система

Все компоненты собраны на общих токенах: цвет, типографика, spacing, radius,
shadow, breakpoints, focus, transitions — `src/styles/tokens.css`. Отдельные
стили «под страницу» не создаются.

Витрина: `/ui-kit` (в `robots.txt` закрыта от индексации).

## Доступность

`lang="ru"`, семантические `header` / `nav` / `main` / `footer`, один `h1` на
страницу, ссылка «Перейти к основному содержанию», видимый фокус, область
нажатия от 44 × 44 px, закрытие попапов по Escape с возвратом фокуса,
поддержка `prefers-reduced-motion`.

## Документы проекта

- [docs/INVENTORY.md](docs/INVENTORY.md) — инвентаризация, таблица соответствия, чек-лист приёмки
- [QUESTIONS.md](QUESTIONS.md) — спорные элементы и блокирующие вопросы
- [FUTURE_IMPROVEMENTS.md](FUTURE_IMPROVEMENTS.md) — предложения за рамками этапа 1
