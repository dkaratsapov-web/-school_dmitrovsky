# Установка плагинов и skills

Что нужно поставить в новом чате, чтобы продолжить работу над проектом.
Состав снят с рабочего окружения, версии — те, на которых сделаны
`docs/A11Y_AUDIT.md` и `docs/SEO_AUDIT.md`.

## Команды

Четыре маркетплейса, шесть плагинов. Порядок важен: плагин ставится
только после того, как добавлен его маркетплейс.

### Через CLI — так это может сделать сам ассистент

Слэш-команды `/plugin …` набирает пользователь в строке ввода, ассистент
их вызвать не может. Но у `claude` есть подкоманда `plugin` — обычная
команда оболочки, и её ассистент запускает через Bash. Именно так плагины
поставлены в этом окружении.

```bash
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills

claude plugin marketplace add obra/superpowers
claude plugin install superpowers@superpowers-dev

claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill

claude plugin marketplace add alirezarezvani/claude-skills
claude plugin install marketing-skills@claude-code-skills
claude plugin install product-skills@claude-code-skills
claude plugin install a11y-audit@claude-code-skills
```

Скиллы становятся доступны со следующей сессии: описания подмешиваются
в системный промпт при старте. Файлы скриптов (например сканер
доступности) читаются с диска и работают сразу.

Нужен доступ к Bash и бинарник `claude` в `PATH`. Если их нет —
остаётся ручной вариант ниже.

### Слэш-командами — вручную в строке ввода

```
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills

/plugin marketplace add obra/superpowers
/plugin install superpowers@superpowers-dev

/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

/plugin marketplace add alirezarezvani/claude-skills
/plugin install marketing-skills@claude-code-skills
/plugin install product-skills@claude-code-skills
/plugin install a11y-audit@claude-code-skills
```

Проверка: `claude plugin list` или `/plugin` — все шесть должны быть
в списке включённых.

## Что откуда берётся

| Плагин | Маркетплейс | Репозиторий | Версия | Скиллов |
|---|---|---|---|---:|
| `example-skills` | `anthropic-agent-skills` | `anthropics/skills` | `34040c9c5685` | 20 |
| `superpowers` | `superpowers-dev` | `obra/superpowers` | 6.3.0 | 14 |
| `ui-ux-pro-max` | `ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` | 2.13.0 | 13 |
| `marketing-skills` | `claude-code-skills` | `alirezarezvani/claude-skills` | 2.9.0 | 49 |
| `product-skills` | `claude-code-skills` | `alirezarezvani/claude-skills` | 2.11.1 | 17 |
| `a11y-audit` | `claude-code-skills` | `alirezarezvani/claude-skills` | 2.9.0 | 1 |

Маркетплейс `claude-code-skills` один на три плагина — добавлять повторно
не нужно.

## Какой скилл для какой задачи проекта

| Задача | Скилл | Плагин |
|---|---|---|
| Доступность, WCAG, контраст | `a11y-audit` | `a11y-audit` |
| SEO: title, description, заголовки | `seo-audit` | `marketing-skills` |
| Микроразметка JSON-LD | `schema-markup` | `marketing-skills` |
| Конверсия страниц | `page-cro` | `marketing-skills` |
| Визуальная концепция, типографика | `frontend-design` | `example-skills` |
| Проверка интерфейса в браузере | `webapp-testing` | `example-skills` |
| Дизайн-токены и темы | `theme-factory`, `brand-guidelines` | `example-skills` |
| UI-система, палитры, шрифтовые пары | `ui-ux-pro-max` | `ui-ux-pro-max` |
| Разбор ошибок | `systematic-debugging` | `superpowers` |
| Проверка перед сдачей | `verification-before-completion` | `superpowers` |

`product-skills` в этом проекте не использовался: он про продуктовую
дискавери, OKR и роадмапы. Ставить не обязательно.

## Цена в контексте

Описания скиллов грузятся в системный промпт каждой сессии. Цифры не
на глаз — их печатает сам Claude Code:

```bash
claude plugin details marketing-skills@claude-code-skills
```

| Плагин | Всегда в контексте |
|---|---:|
| `marketing-skills` | ~8 695 |
| `product-skills` | ~2 533 |
| `example-skills` | ~1 221 |
| `ui-ux-pro-max` | ~1 065 |
| `superpowers` | ~688 |
| `a11y-audit` | ~146 |
| **Итого** | **~14 348** |

Больше половины съедает `marketing-skills` — в нём 48 скиллов, а проекту
нужны три: `seo-audit`, `schema-markup`, `page-cro`. Если задача не про
SEO и конверсию, плагин лучше выключить:

```bash
claude plugin disable marketing-skills@claude-code-skills
claude plugin enable marketing-skills@claude-code-skills   # включить обратно
```

То же для `product-skills`: 2 533 токена в каждой сессии, а в этом
проекте он не пригодился ни разу.

`claude plugin details` показывает и разбивку по скиллам: сколько стоит
описание («always-on») и сколько — сам скилл при вызове («on-invoke»).

## Важно: путь к сканеру доступности

`docs/A11Y_AUDIT.md` ссылается на скрипт с номером версии в пути:

```
~/.claude/plugins/cache/claude-code-skills/a11y-audit/2.9.0/skills/a11y-audit/scripts/a11y_scanner.py
```

Если в новом чате встанет другая версия, путь изменится. Найти актуальный:

```bash
find ~/.claude/plugins/cache -name a11y_scanner.py
```

Рядом лежит `contrast_checker.py` — им считается контраст пар цветов.

## Чем проверять результат

Это уже в проекте, плагины для них не нужны:

```bash
npm run build:preview
npm run check:layout   # 22 страницы × 4 ширины
npm run check:text     # все строки выгрузки на месте
```
