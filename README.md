# Bible Explorer — Bible Book Race

**Find Any Book. Anywhere. Faster.**

A React + Vite + Tailwind training game that builds one specific skill: locating a
book in a *physical* Bible quickly. Built for Sunday school kids and anyone who
knows Scripture well but still fumbles to find Habakkuk.

It ships in **English and Telugu**, with **five themes**, works from a 320px
phone to a widescreen laptop, and stores everything on the device — no backend,
no accounts, no network.

---

## The learning model

```
Book  →  Neighbour  →  Location  →  Hand  →  Speed  →  Automaticity
```

| Level | Name | Trains |
| ----- | ---- | ------ |
| 1 | 🗺️ Bible Map | Testament → section → neighbourhood |
| 2 | 🧠 Brain → Neighbour | before / after / between / put in order |
| 3 | ✋ Hand Geography | Name a book, time the real search |
| — | 🚩 Quest | Mixed runs against the clock, with stars |

Difficulty is not a list of hand-made levels: each level declares *stages* with a
share of the round, and the planner walks the learner through them.

**Weak-book detection** is the heart of the app. Every answer updates a per-book
record (attempts, accuracy, average time, last practised). The next round is then
drawn with a probability proportional to how weak each book is, so slow and unseen
books come back more often and mastered ones fade — see
[weakBookSelector.js](src/domain/mastery/weakBookSelector.js).

Progression is **mastery**, not XP: `Not Yet → Learning → Familiar → Fast → Automatic`.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 63 tests
npm run lint
npm run build
```

---

## Responsive layout

One codebase, three shapes — driven entirely by Tailwind breakpoints, with no
device sniffing and no duplicate screens.

| Width | Navigation | Content |
| ----- | ---------- | ------- |
| `< 640px` phone | fixed bottom bar | single column, `max-w-lg` |
| `640–1023px` tablet | fixed bottom bar | wider gutters, 2-up grids, paired answer options |
| `≥ 1024px` desktop | persistent side rail | centred column beside the rail, 3-up grids, split views |

[AppShell](src/components/layout/AppShell.jsx) is the only place that knows any
of this. Screens declare intent, not pixels:

```jsx
<AppShell withNav width="wide">   {/* dashboards: Home, Training, Quests, Progress, Map */}
<AppShell width="narrow">         {/* focused: a question, a quest run */}
```

Focused screens stay narrow at every size on purpose — a 1200px-wide multiple
choice is harder to answer, not easier.

What changes with width:

- **Navigation** — [BottomNav](src/components/layout/BottomNav.jsx) and
  [NavRail](src/components/layout/NavRail.jsx) render from one shared list in
  [navigation.js](src/app/navigation.js), so they cannot drift apart. The rail
  also carries the app name, streak and Settings, which a phone has no room for.
- **Home** — tiles go 2-up → 4-up; the focus list shows 3 books on a phone and 5
  where there is space.
- **Training** — a stacked list becomes three cards side by side, each turning
  vertical as it narrows.
- **Quests** — 1 → 2 → 3 columns of equal-height cards.
- **Progress** — Overview/Books tabs on small screens; from `lg` both panels sit
  side by side and the tabs disappear, because a wide screen has no reason to
  hide half the answer.
- **Bible Map** — section cards flow into 2 or 3 columns.
- **Settings** — preference groups pair up from `md`; the theme picker widens
  from 2 to 3 across.
- **Questions** — short answers pair up from `sm`; book runs stay full width so
  the `→` arrows never wrap mid-sequence. Prompts, timers and celebration art
  all scale up a step.

---

## Architecture

The dependency arrow only ever points **down**:

```
        UI (components/)
             ↓
      Screens (features/)
             ↓
    Game rules (domain/)          i18n/  theme/   (presentation support)
             ↓
   Bible knowledge (data/)
             ↓
      utils/   services/storage/
```

```
src/
├── app/                    composition only — App, routes, providers, error boundary
│   └── providers/          Storage → Settings → i18n + theme → Progress
│
├── data/                   pure Bible knowledge (no React, no logic)
│   ├── bibleBooks.js       66 books, English + Telugu names, canonical order
│   ├── sections.js         the 10 neighbourhoods + both testaments
│   └── quests.js           quest definitions
│
├── domain/                 the game engine — pure functions, fully unit tested
│   ├── books/              adjacency, runs, neighbourhoods, search
│   ├── levels/             level + stage rules
│   ├── questions/          generators/ + registry + factory
│   ├── mastery/            mastery thresholds, weak-book selection
│   ├── progress/           progress reducers + selectors
│   ├── quest/              quest availability, building, scoring
│   └── session/            round state machine, answer evaluation
│
├── features/               one folder per user capability
│   ├── home/ training/ quest/ progress/ map/ settings/ onboarding/ errors/
│
├── components/             ui/ (Button, Card, ProgressBar…) · game/ · layout/
├── i18n/                   translator, locales, dictionaries, gameText bridge
├── theme/                  theme registry, provider, tone → class map, themes.css
├── hooks/                  useStopwatch, useSound, useBookPool, usePracticeClock
├── services/storage/       storage port + localStorage / in-memory adapters
└── utils/                  random (injectable rng), array, format, cn
```

### How SOLID actually shows up here

**S — Single responsibility.** `bookRepository` knows adjacency, `masteryModel`
knows thresholds, `roundSession` knows round flow, `progressModel` knows the
persisted shape, screens know layout. `App.jsx` is 15 lines.

**O — Open/closed.** A new question type is one pure generator plus one line in
[questionRegistry.js](src/domain/questions/questionRegistry.js); the round page
picks its view from an `answerMode` map, so no screen changes. A new theme is a
`[data-theme]` block plus one entry in `themes.js`. A new language is a
dictionary plus a `name.<code>` on each book.

**L — Liskov.** Every storage adapter (`localStorage`, in-memory) is substitutable
behind the same three methods; the smoke tests run the whole app on the in-memory one.

**I — Interface segregation.** The storage port is `read/write/remove` — nothing
more. Components receive the props they use, not a god-object.

**D — Dependency inversion.** Domain code never imports React, the DOM or
`localStorage`. Randomness is an injectable `rng`, so rounds are reproducible.
`createRound` takes a `selectBook` function, so the *teaching strategy* is passed
in rather than baked into the factory.

### Deliberate rules

- **Data does not know about React.** No JSX, hooks or storage under `src/data`.
- **Generators never build sentences.** They emit `{ key, params }` with ids, and
  [gameText.js](src/i18n/gameText.js) localises them. One question type works in
  every language for free.
- **No raw colours in components.** Everything goes through semantic tokens
  (`bg-surface`, `text-ink-muted`) or a `tone` prop, so all five themes work with
  zero per-component effort.
- **Nothing writes to `localStorage` directly** — only the repositories do, and
  every call is guarded, so a locked-down school device degrades to in-memory
  instead of crashing.

---

## Testing

63 tests, aimed at the brain rather than the buttons:

- `bookRepository` — canon integrity, neighbours, edge clipping
- `questionFactory` — one correct option, no impossible questions, real neighbours
- `masteryModel` / `weakBookSelector` — thresholds and weak-book ranking
- `roundSession` — the asking → reviewing → finished state machine
- `progressModel` — immutability, streak rules, best-time rules, migration
- `questModel` — unlocks, generated quests, star rules
- `i18n` — Telugu never falls behind English
- `App.smoke` — all 12 screens mount in both languages, one full answer loop, and
  the responsive chrome (nav present on tabs, absent in a round; narrow vs wide column)

---

## Languages

| | |
| --- | --- |
| English | `en` — reference dictionary |
| తెలుగు | `te` — full parity, book names from the BSI Telugu edition |

A missing key falls back to English rather than rendering blank.

## Themes

Candy (default) · Night · Sunrise · Forest · High Contrast.
First run follows the device's dark-mode preference.

## Accessibility & devices

Safe-area aware on notched phones, large touch targets, semantic roles on
tabs/switches/progress, visible focus rings, `prefers-reduced-motion` respected,
and a high-contrast theme for classroom projectors. Telugu gets extra line
height, and every book name wraps rather than truncating.

## Data & privacy

Everything lives in this browser's `localStorage`. Nothing is uploaded; there are
no accounts and no analytics. "Reset all progress" in Progress clears it.

## What is deliberately not here

No backend, auth, leaderboards, XP, coins, avatars or friends. The question worth
answering first is whether this makes someone faster at finding Habakkuk.
