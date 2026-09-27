# Skills для работы с сайтами: что стоит и как поставить в другом чате

Файл-памятка. Внизу — готовый текст, который можно вставить в новый чат
Claude Code, чтобы он сам всё поставил и проверил.

## Что уже стоит в этом проекте

Четыре источника (marketplace) и шесть наборов (plugin):

| Набор | Источник на GitHub | Версия здесь |
|---|---|---|
| `example-skills@anthropic-agent-skills` | `anthropics/skills` | 34040c9c5685 |
| `superpowers@superpowers-dev` | `obra/superpowers` | 6.3.0 |
| `ui-ux-pro-max@ui-ux-pro-max-skill` | `nextlevelbuilder/ui-ux-pro-max-skill` | 2.13.0 |
| `marketing-skills@claude-code-skills` | `alirezarezvani/claude-skills` | 2.9.0 |
| `product-skills@claude-code-skills` | `alirezarezvani/claude-skills` | 2.11.1 |
| `a11y-audit@claude-code-skills` | `alirezarezvani/claude-skills` | 2.9.0 |

## Установка из терминала

Одним блоком — можно вставить целиком. Сначала четыре источника, потом
шесть наборов. Проверено на Claude Code 2.1.283.

```bash
claude plugin marketplace add anthropics/skills
claude plugin marketplace add obra/superpowers
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin marketplace add alirezarezvani/claude-skills

claude plugin install example-skills@anthropic-agent-skills -y
claude plugin install superpowers@superpowers-dev -y
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill -y
claude plugin install marketing-skills@claude-code-skills -y
claude plugin install product-skills@claude-code-skills -y
claude plugin install a11y-audit@claude-code-skills -y
```

Проверка:

```bash
claude plugin marketplace list
claude plugin list
```

Должны быть четыре источника и шесть наборов со статусом enabled.
Наборы подхватываются со следующего запуска Claude Code.

Обновить всё позже:

```bash
claude plugin marketplace update
claude plugin update example-skills@anthropic-agent-skills
```

### Те же команды из окна Claude Code

Если удобнее не выходить в терминал — то же самое slash-командами:

```
/plugin marketplace add anthropics/skills
/plugin marketplace add obra/superpowers
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin marketplace add alirezarezvani/claude-skills

/plugin install example-skills@anthropic-agent-skills
/plugin install superpowers@superpowers-dev
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
/plugin install marketing-skills@claude-code-skills
/plugin install product-skills@claude-code-skills
/plugin install a11y-audit@claude-code-skills
```

## Что из этого чем пользоваться

| Задача | Skill |
|---|---|
| Визуальная концепция, вёрстка блока, типографика | `example-skills:frontend-design` |
| Подбор стиля, палитры, шрифтов, UX-правила, GSAP-пресеты | `ui-ux-pro-max:ui-ux-pro-max` |
| Дизайн-токены и система | `example-skills:brand-guidelines`, `ui-ux-pro-max:design-system` |
| Сложные интерактивные страницы | `example-skills:web-artifacts-builder` |
| Лендинг | `product-skills:landing-page-generator` + `marketing-skills:copywriting` + `marketing-skills:page-cro` |
| SEO | `marketing-skills:seo-audit`, массовые страницы — `marketing-skills:programmatic-seo` |
| Цели, события, формы, воронки | `marketing-skills:analytics-tracking` |
| Доступность | `a11y-audit:a11y-audit` |
| Проверка интерфейса в браузере | `example-skills:webapp-testing` |
| Разбор ошибок | `superpowers:systematic-debugging` |
| Проверка перед сдачей | `superpowers:verification-before-completion` |

Правило: не включать всё сразу — брать минимальный набор под текущую
задачу.

## Готовый текст для нового чата

Скопировать целиком и отправить первым сообщением.

---

Ты работаешь в Claude Code. Настрой окружение для работы с сайтами:
разработка и редизайн, лендинги, интерфейсы, дизайн-системы, адаптивная
вёрстка, тестирование, SEO, CRO, аналитика и тексты.

Правила:

1. Не трогай исходный код текущего проекта во время установки.
2. Не удаляй уже установленные наборы.
3. Не переписывай существующий `CLAUDE.md` — дополни его после проверки.
4. Без `sudo`. Токены, пароли и другие секреты не запрашивай.
5. Если команды из сессии выполнить нельзя — не делай вид, что установка
   прошла. Покажи команды одним блоком и попроси выполнить их
   самостоятельно, затем продолжи с проверки.

Сначала посмотри, что уже стоит, и не ставь повторно:

```bash
claude plugin marketplace list
claude plugin list
```

Недостающее поставь из терминала:

```bash
claude plugin marketplace add anthropics/skills
claude plugin marketplace add obra/superpowers
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin marketplace add alirezarezvani/claude-skills

claude plugin install example-skills@anthropic-agent-skills -y
claude plugin install superpowers@superpowers-dev -y
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill -y
claude plugin install marketing-skills@claude-code-skills -y
claude plugin install product-skills@claude-code-skills -y
claude plugin install a11y-audit@claude-code-skills -y
```

После установки:

1. Покажи список подключённых наборов и их версии.
2. Проверь, что вызываются `example-skills:frontend-design`,
   `ui-ux-pro-max:ui-ux-pro-max`, `example-skills:webapp-testing`,
   `a11y-audit:a11y-audit`, `superpowers:verification-before-completion`.
3. Одной таблицей перечисли, какой skill под какую задачу брать.
4. Допиши в `CLAUDE.md` раздел с этой таблицей и правилом «не включать
   все skills сразу, брать минимальный набор под задачу».

---
