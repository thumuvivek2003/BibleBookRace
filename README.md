# Bible Book Race

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

**The Bible Map comes first.** It is the reference the drills exercise, so it
sits immediately after Home in the navigation and is featured on Home itself —
a learner who has never answered a question sees it ringed as the one place to
begin. You read the map, then you drill it.

| Level | Name | Trains |
| ----- | ---- | ------ |
| 0 | 📖 Bible Map | Where all 66 books live — browse, search, see neighbours |
| 1 | 🗺️ Bible Map drill | Testament → section → neighbourhood |
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
npm test         # 72 tests
npm run lint
npm run build
```

---

## Artwork & assets

Images live in three places, each for a reason:

| Where | What | Why |
| ----- | ---- | --- |
| `src/assets/` | `MainPage.webp`, `Icon.webp` | the original art, kept as the source of truth |
| `src/assets/generated/` | `hero.webp`, `mark.webp` | trimmed and resized copies the app imports |
| `public/` | favicons, `apple-touch-icon.png`, `social-card.jpg`, `site.webmanifest` | things browsers and crawlers ask for by a fixed name |

Screens never write an image path. They import [imgs.js](src/assets/imgs.js):

```jsx
import { IMGS } from '@/assets/imgs.js';

<img src={IMGS.main_screen} alt={t('a11y.keyArt')} />
```

Because those are ES imports, Vite fingerprints each file (`hero-a1b2c3.webp`),
caches it forever, and rewrites the URL for whatever base the build targets —
including the `/BibleBookRace/` sub-path. A hard-coded `/hero.webp` would break
the moment the site moves; a typo in `IMGS` is a build error rather than a
broken image in front of a class.

[scripts/make-images.py](scripts/make-images.py) regenerates everything derived
from the two source images:

```bash
python3 scripts/make-images.py
```

It trims the white surround off the art with a corner flood fill — a plain
whiteness threshold would punch holes in the clouds and the lettering — so the
illustration sits correctly on all five themes, and drops the hero from 470 KB
to 120 KB. The outputs are committed, so a plain checkout builds without Python.

### Sharing the link

Pasting the URL into WhatsApp, Slack, iMessage or LinkedIn shows a proper
1200×630 card, not a cropped square: the art is composited over a blurred copy
of itself, so the sides are filled with something that belongs to the picture.
Open Graph and Twitter tags live in [index.html](index.html) and must be
absolute URLs — crawlers do not run JavaScript and do not resolve relative
paths. **If the site moves to another domain, update those two `og:`/`twitter:`
image URLs and `og:url`.**

`site.webmanifest` also makes the game installable to a phone home screen with
the app icon.

---

## Deploy (GitHub Pages)

Live at **https://thumuvivek2003.github.io/BibleBookRace/**

Every push to `main` lints, tests and builds, then publishes — see
[deploy.yml](.github/workflows/deploy.yml). A failing test never reaches the
live site.

**One-time setup:** repo → *Settings* → *Pages* → *Build and deployment* →
Source: **GitHub Actions**. Nothing else; there is no `gh-pages` branch and no
extra npm dependency.

Three details make a React SPA work on Pages, all already wired up:

| Problem | Fix |
| ------- | --- |
| Site lives at `/BibleBookRace/`, not `/` | `base` in [vite.config.js](vite.config.js); the router reads it back via `import.meta.env.BASE_URL` |
| Pages has no server routing, so a refresh on `/progress` 404s | the build copies `index.html` to `404.html`, which Pages serves for unknown paths — React Router then renders the right screen |
| Jekyll skips files starting with `_` | empty `public/.nojekyll` |

Deploying somewhere else — a custom domain, Netlify, a user site — needs no code
change, just a different base:

```bash
VITE_BASE=/ npm run build
```

For a custom domain, set that variable in the workflow and add a `public/CNAME`
file containing the domain.

**Why not `HashRouter`?** It would avoid the `404.html` trick, but every URL
becomes `…/#/training`. Clean URLs are worth one copied file. The only cost of
this approach is that a deep link is served with a 404 status code before the
app takes over — invisible to users, and irrelevant for an offline-first game.

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
  [navigation.js](src/app/navigation.js), so they cannot drift apart. The bar
  swaps in a short label where five tabs would not fit; the rail also carries
  the app name, streak and Settings.
- **Home** — the Bible Map is a full-width feature card, the other three screens
  a compact row of three; the focus list shows 3 books on a phone and 5 where
  there is space.
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
  instead of crashing. They also read the app's previous key names, so a rename
  never costs anyone their progress.

---

## Testing

72 tests, aimed at the brain rather than the buttons:

- `bookRepository` — canon integrity, neighbours, edge clipping
- `questionFactory` — one correct option, no impossible questions, real neighbours
- `masteryModel` / `weakBookSelector` — thresholds and weak-book ranking
- `roundSession` — the asking → reviewing → finished state machine
- `progressModel` — immutability, streak rules, best-time rules, migration
- `questModel` — unlocks, generated quests, star rules
- `i18n` — Telugu never falls behind English
- `navigation` — the map stays ahead of the drills in the nav order
- `imgs` — every asset entry resolves to a real bundled URL
- `App.smoke` — all 12 screens mount in both languages, one full answer loop, the
  map-first ordering on Home, the key art and its localised alt text, and the
  responsive chrome (nav present on tabs, absent in a round; narrow vs wide column)

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
