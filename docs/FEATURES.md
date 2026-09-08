# Feature log — every panel, every button, what it does, and its status

Status values: **shipped** (verified the way a user hits it — the row says how) ·
**partial** (works, with a named gap) · **backlog** (exists in `legacy/visualizer/` or is planned;
tracked by number in `BACKLOG.md`). Every row names the file that owns it.

Verification legend: `cdp` = driven in headless Chrome over the DevTools protocol this session
(screenshots in the worklog entry), `test` = node test, `visual` = screenshot reviewed.

---

## 1. Shell

| Feature | Behaviour | File | Status |
|---|---|---|---|
| Catalogue masking | A pattern's name is replaced by `· · ·` (glyph `?`, italic) while a journey that reveals it is started and unfinished — sidebar row, home card, pattern-page heading, where-you-are line. Tooltip / card text says which journey reveals it. The rows stay clickable; the pattern page offers **show names anyway**, which stores `spoilers` and turns masking off permanently. Not started = nothing masked. | `src/lib/disclosure.ts` + the four call sites | shipped (test: masked at `unlocked=3`, shown at 1 and 7; opt-out persists) |
| Journey progress | One notation everywhere: **acts earned** (`unlocked − 1` of `acts − 1`) — sidebar badge `2/6` with the tooltip "2 of 6 acts earned", home card `2/6 earned` and its bar, `✓` / `complete` at the end. Act 1 is the start, not an achievement. | `lib/progress.ts` `earnedOf` / `useEarned` | shipped (UI test asserts sidebar and card agree) |
| Sidebar | Four groups: **DSA** (one row per journey with `earned/acts` badge, ✓ when complete; the visualizer), **DSA · patterns** (10 rows, glyph + name + `solved/total`), **SQL** (drills), **Data science** (flashcards). Header: wordmark + **?** help button. Footer: where-you-are line (`DSA · journey · Two Sum`), **settings**, **shortcuts**, **collapse**. Active row highlighted from the hash route. Every row is an `<a href="#/…">`, so back/forward and middle-click work. | `src/components/app-sidebar.tsx` **Collapse** button at the foot of the rail shrinks it to a 3 rem icon rail (icons + tooltips, badges and labels hidden, wordmark becomes `d.`); the button stays on the rail to expand again. State persists in the `sidebar_state` cookie (shadcn default). | `src/components/app-sidebar.tsx` | shipped (cdp: 256 → 48 px, toggle at y = 960 of 1000) |
| Mobile header | Below `md`, a top bar with the sidebar trigger and the wordmark; the sidebar becomes a sheet. | `src/App.tsx`, `ui/sidebar.tsx` | shipped (cdp 390 px) |
| Lazy features | Journey page and algorithm visualizer are `React.lazy` chunks behind a `Suspense` "loading…" line; content pages never download them. Engine/data chunk is still shared and eager (sidebar reads `JOURNEYS`). | `App.tsx` | shipped (build: 400 + 204 kB initial, 44 / 21 / 9 kB lazy; cdp: all three routes render, 0 errors) |
| Hash router | `#/`, `#/p/<pattern>`, `#/p/<pattern>/<problem>`, `#/journey/<slug>?act=&step=`, `#/algorithms?algo=`, `#/sql`, `#/flashcards`. Unknown routes fall back to home. `replaceQuery` mirrors state without history entries. | `src/lib/route.ts`, `App.tsx` | shipped (cdp) |
| Wide layouts | Journey page grows to `max-w-[110rem]` (fills the width both rails free up); visualizer `max-w-7xl`; content pages stay `max-w-3xl/4xl`. | `App.tsx`, `journey-page.tsx` | shipped (cdp: stage 717 → 1072 → 1280 px as the two rails close) |
| Type scale | Six role-named steps — `text-meta` 12/16, `text-ui` 14/20, `text-body` 16/26, `text-narration` 19/30, `text-title` 24/30, `text-display` 32/38 — plus three container widths. Components reach for the role, never a raw size. | `src/index.css` `@theme`, `docs/DESIGN.md` | shipped (UI test: no sentence below 14 px, no measure over 80 characters, on four routes) |
| Theme | Catppuccin Mocha, forced dark (`<html class="dark">`). Tokens in `index.css`: chart-1 mauve, chart-2 blue, chart-3 green, chart-4 peach, chart-5 red, yellow, teal. | `src/index.css` | shipped |
| Reduced motion | `prefers-reduced-motion: reduce` zeroes CSS transitions/animations; FLIP checks it too. | `index.css`, `use-flip.ts` | shipped (code; not device-tested) |
| Settings dialog | Footer **settings** → dialog: playback speed (range, `accent-primary`), motion and code tab as **segmented radiogroups** (all four values visible, `role=radiogroup` / `role=radio`), reading column as the app's `Checkbox`, reset preferences; **progress**: copy JSON (clipboard, falls back to filling the textarea), import pasted JSON, erase all progress (two clicks within 4 s). Preferences are not exported (per device). No theme toggle until B14. | `app-dialogs.tsx` `SettingsDialog`, `lib/store.ts` `exportProgress/importProgress/resetProgress` | shipped (cdp: motion → `cinematic` stored; copy fell back to textarea in headless; import of 2 keys → `xp=99`, `unlocked:single-number=4`) |
| Collapsible rails (focus) | Both rails close from a button at their foot and stay as a thin rail holding that button. Left: sidebar (above). Right: journey reading column → 2.75 rem rail, pref `reading` in `dsa:prefs`. **`f`** closes both / reopens both (`GlobalKeys`). | `app-sidebar.tsx`, `journey-page.tsx` `ReadingToggle`, `global-keys.tsx` | shipped (cdp: `f` → 256→48 px and 384→44 px, again → back) |
| Hover-peek | A closed rail opens **over** the content while the pointer is on it and closes when it leaves; the layout gap keeps the rail width so nothing shifts. Left: `ui/sidebar.tsx` `data-peek` (container 48 → 256 px, gap stays 48). Right: `journey-page.tsx` overlay `data-testid=reading-peek` (26 rem, scrolls, same `ReadingBody`). Hover only — touch devices use the buttons. | `ui/sidebar.tsx`, `journey-page.tsx` | shipped (cdp: mouseover/mouseout dispatched) |
| Independent scroll panels (journey, ≥ lg) | The inset is viewport-high; header + stepper stay put; the **reading column** scrolls on its own, and inside the stage only the **middle** scrolls — act strip above it and narration + interruptions + transport below it are always on screen (U1). Below `lg` the page scrolls normally. | `App.tsx` (`panels`), `journey-page.tsx` | shipped (UI test: the narration's rect stays inside the stage and the viewport on the recap act) |
| `?` shortcuts dialog | `?` anywhere (or footer **shortcuts**) → dialog rendering `lib/shortcuts.ts` by scope: everywhere (`?`, `f`, `Esc`), journey + visualizer (`space`, `→`, `←`, `r`), mouse (hover-peek, scrub). Keys ignored in inputs. | `app-dialogs.tsx` `ShortcutsDialog`, `lib/shortcuts.ts`, `global-keys.tsx` | shipped (cdp: 9 rows) |
| Help dialog ("how to use") | **?** icon in the sidebar header (and the mobile top bar) → dialog: the idea, reading a problem, the stage, the layout, progress; buttons to shortcuts and settings. | `app-dialogs.tsx` `HelpDialog` | shipped (cdp: 5 sections) |
| Command palette | — | — | backlog #B12 |

## 2. Home

| Feature | Behaviour | File | Status |
|---|---|---|---|
| Method statement | One paragraph: feel the weakness, earn the insight, then the name. | `home-view.tsx` | shipped |
| Resume card | Above the journey grid when a journey is started and unfinished: "pick up where you left off", the journey, `next: <act> · <cost>` and `n of m acts earned`, deep-linking to `#/journey/<slug>?act=<key>`. Picks the furthest-along journey. Absent for a fresh learner and once everything is complete. | `home-view.tsx` `ResumeCard` | shipped (UI test: absent → present → absent across the three states) |
| Streak + XP | `streakOf(activity-days)` counts consecutive days ending today or yesterday; XP from the store. | `home-view.tsx`, `lib/store.ts` | shipped (visual; streak logic not unit-tested — B18) |
| Journey cards | Title, subtitle, `earned/(acts−1)` (story act doesn't count), progress bar. "complete" when all acts earned. Click → journey. | `home-view.tsx` | shipped (visual) |
| Visualizer card | Dashed card linking to `#/algorithms`. | `home-view.tsx` | shipped |
| Practice-set progress | `solved/total` + progress bar; pattern grid with per-pattern counts; card click → pattern list. | `home-view.tsx` | shipped |
| Roadmap DAG (patterns → problems with lock/done) | — | `legacy/visualizer/problems/index.html` | backlog #B9 |
| Progress dashboard (acts done, quizzes passed, stalls) | — | legacy | backlog #B10 |

## 3. Pattern list and problem page (practice set)

| Feature | Behaviour | File | Status |
|---|---|---|---|
| Pattern header + filter | Glyph, name, blurb; text filter on title; empty state. | `problem-list.tsx` | shipped |
| Problem row | Checkbox toggles solved (strikethrough), title/brief opens the problem, difficulty badge. | `problem-list.tsx`, `lib/progress.ts` | shipped |
| Problem header | Title, difficulty, pattern glyph, time/space, solved checkbox. | `problem-detail.tsx` | shipped |
| **Journey CTA** | When `journeyForProblem(id)` exists: a mauve card "Start the learning journey ▸" with the act count. Shows on Pair With Target Sum and Single Number. | `problem-detail.tsx` | shipped (visual) |
| Statement + constraints + examples | The statement, then a **constraints** list — bounds and the promises the input makes, written in our own words, never copied — then monospace `in`/`out` rows with an optional note. All 31 problems carry at least two constraints (test), and a journey's corner cases cite the one they come from (R2). | `problem-detail.tsx`, `data/types.ts` `Problem.constraints` | shipped (UI test: the block renders with the input's bounds; every corner case on the single-number story act carries a `from` line) |
| Tabs: Hints / Walkthrough / **Approaches** | Hints are an accordion (one open at a time). Walkthrough = static `StepPlayer` or the engine. **Approaches** is the ladder (below), which replaced the old "Approach & Solution" tab pair (Q1a). | `problem-detail.tsx` | shipped |
| **Approach ladder** | Every way into the problem, **worst → best**, numbered, each with its cost, its idea and the code; the **why now** line — the weakness in the rung before it that this one removes — sits *between* rungs, in mauve, because it belongs to the step, not to either end. One builder, two sources, so nothing is written twice: a problem **with** a journey draws its rungs from the acts (`insight` is already the why-now) and is **capped by the ledger** like the embedded walkthrough — a started, unfinished journey shows only earned rungs plus "n more approaches are still ahead of you · Continue the journey ▸"; a problem without one draws them from `alternatives` (worst → best) plus the optimal. | `lib/ladder.ts`, `problem-detail.tsx` `ApproachLadder` | shipped (UI test: fresh learner sees all four single-number rungs ending on XOR; `unlocked = 3` shows two and the nudge, with XOR absent) |
| Solve on LeetCode | The page's primary action, a filled button under the title, linking to `leetcode.com/problems/<slug>` from `Problem.leetcode`. All 31 slugs are authored and unique (test). **No editor is added** — the learner writes code there, this page explains. | `problem-detail.tsx`, `lib/ladder.ts` `leetcodeUrl` | shipped (UI test: the href resolves and the page has no textarea) |
| Static walkthrough player | Frames with cells (roles focus/compare/window/done + pointer labels) or text; play (1.8 s/step), prev/next, restart, dot scrubber, ←/→ keys; terminal chrome + legend. Used by the **28 problems without a journey**. | `step-player.tsx` | shipped (pre-existing) |
| Engine walkthrough | A problem **with** a journey draws the journey's own stage instead (same generators, chips, panels, narration, transport), picking the best act the learner has earned: never opened or finished → the optimal act; midway → the last earned act plus "This is the best approach you have earned so far" and a link back. The hand-written frames for those problems are deleted (B1). | `features/journey/mini-player.tsx` | shipped (test: both states; a problem may not have a journey *and* a static walkthrough) |
| Code block | Mono `<pre>` with copy button (✓ for 1.5 s). | `code-block.tsx` | shipped |
| SQL drills, flashcards | Unchanged from baseline. | `sql-view.tsx`, `flashcards-view.tsx` | shipped (pre-existing) |

| Ladder → language strip | Python 3 / Java / C++ buttons above the code block (only languages present); choice is the shared `codeTab` pref (`pseudo` falls back to Python). Journeyed problems carry all three for every approach (test). | `problem-detail.tsx` `SolutionBlock`, `data/types.ts` `Code` | shipped (cdp: pair-sum → Java tab → `public int[] pairSum…`, pref `java`; three-sum brute force → Java stays selected) |

## 4. Journey page — the map

```
┌ header ───────────────────────────────────────────────────────────────────────┐
│ ← Problem · Pattern                                     ★ 25 XP  ↺ restart   │
│ Two Sum  LeetCode 1  subtitle                                                 │
│ [01 The Problem ✓] → [02 Brute Force] → [🔒 ? · 5 more · locked]              │  ActStepper
├ stage (left) ──────────────────────────┬ reading column (right) ──────────────┤
│ act 02 · Brute Force      O(n²) · O(1)  │ insight (mauve, bold)                │
│ ⚠ warning / ℹ preset banner            │ idea                                 │
│ target = 43                             │ WHAT THIS APPROACH IS BUILT FROM     │
│   ▲            ⭘                        │   Array only — …                     │
│ [32][48][26][31][23][ 2][40][29][17]    │ ┌ pseudocode │ Python 3 │ Java │ C++ ┐│
│  0   1   2   3   4   5   6   7   8      │ │ for i in 0..n-1:                  ││
│ ───────────── panel ─────────────────   │ │ ▌  for j in i+1..n-1:   ← lit     ││
│  32 + 48 = 80   target 43               │ └───────────────────────────────────┘│
│ › 32 + 48 = 80 — not 43, keep looking   │ WHAT TO UNDERSTAND  › … › … › …      │
│ ┌ predict / quiz / hints / reveal ────┐ │ WORK ON THIS INPUT (STEPS)           │
│ └─────────────────────────────────────┘ │  Brute Force ████████████ 23         │
│ ●──────────────────────── 6/23          │  Two Pointers ███ 9                  │
│ ▶ Play  ‹ › ↺              speed ━━●━   │ LEGEND ▲ held · ⭘ current · ✓ answer │
│ [random ▾] [⚄ new] [13, 19, 37…] target [27] [apply]  │ same problem elsewhere: … │
└─────────────────────────────────────────┴──────────────────────────────────────┘
```

### 4.1 Header

| Element | Behaviour | File | Status |
|---|---|---|---|
| Back link | `← <problem title> · <pattern>` → the problem page; falls back to home when the journey has no problem. | `journey-page.tsx` | shipped |
| XP badge | `★ n XP`, live from the store. | `journey-page.tsx`, `lib/store.ts` | shipped (cdp: 0 → 15 → 25) |
| Restart journey | Sets `unlocked:<slug>` to 1, clears `quizzes:<slug>`, clears done ticks, returns to act 1. No confirm dialog. | `use-journey.ts` `restart` | shipped (code) — B19: add an undo toast |
| Title row | Title, `LeetCode n`, subtitle. | `journey-page.tsx` | shipped |
| Act stepper | Two shapes. **≥ xl** the ribbon: one button per unlocked act (`01`/✓ + name + short), current = mauve border, clicking switches act (pauses, clears predict/quiz/hints); while anything is locked, one dashed node `🔒 ? · n more · locked` — never a name; a newly revealed act zooms in, and the node of an act that has just finished flashes the done colour flat for 320 ms before settling (R8). **< xl** one 44 px row — `act 05 / 07 · One-Pass Hash ▾` with a lock icon while acts remain — opening the same ribbon, stacked with ↓ connectors, in a bottom sheet. | `act-stepper.tsx` | shipped (cdp: 1 node → 2 after reveal; UI test: the pill opens a sheet listing 7 acts at 390 px) |

### 4.2 Stage header and banners

| Element | Behaviour | File | Status |
|---|---|---|---|
| Act strip | `act 05 · One-Pass Hash` left, complexity string right. Complexity is the *current* act's only — never a table. | `journey-page.tsx` | shipped |
| Warning banner | Red, `role=alert`, `⚠ Contract broken: …` from `journey.classify`. Shown for presets like "no solution", "two singles". | `journey-page.tsx`, `use-journey.ts` | shipped (test for classify; visual) |
| Info banner | Blue, `role=status`, the preset's `info` text (e.g. "n = 20. Watch the chart…"). Hidden when a warning is up. | same | shipped |
| Data bar | `target = 27` when the data has a `target`. | `journey-page.tsx` | shipped |

### 4.3 The stage proper

| Element | Behaviour | File | Status |
|---|---|---|---|
| Chip row | One chip per element, index below. Roles: **anchor** peach + ▲ above (held / left pointer); **focus** ring + yellow tint (current / right pointer); **answer** green + ✓; **dim** 25 % opacity (eliminated). A chip may be anchor+focus (both markers). Subscript `#n` for sorted views = original index. Empty stage shows "the stage is empty on purpose — the need comes first" during the story's `noChips` frames. | `chip-row.tsx`, `engine/chips.ts` | shipped (cdp) |
| FLIP morph | After every frame, elements with `data-k` animate from their previous box (translate) — newcomers scale-fade in. Duration `clamp(80, delay×0.4, 280) × motion`. Two scopes (array row, panel) are snapshotted separately because sorted copies reuse keys. | `use-flip.ts`, `panels.tsx` | shipped (code; motion not screenshot-able) |
| Panel: story | The `🎁 → 🛒 → ❓` scene on an empty stage. | `panels.tsx` | shipped (cdp) |
| Panel: sum | `a + b = sum  target t` — sum green on hit, red on miss. | `panels.tsx` | shipped (cdp) |
| Panel: need + hash | `need 17  43 − 26` line, then the hash map. | `panels.tsx` | shipped (cdp) |
| Panel: hash map | **Above the waterline:** pills `key @ value` (or `key ×count`), probe pill outlined, hit pill green. **Waterline:** "under the surface — what `map[x]` actually does". **Below:** one column per bucket (`8` min, doubles past load 0.75), `↓` chains, probing bucket outlined/green. **Facts:** `hash(k) = k mod B = bucket b` with hop count or miss text; `n keys in B buckets — load 0.38` with a meter that turns peach near 0.75; a rehash note when the table has doubled; collision count or "no collisions yet". Scrolls horizontally on phones. | `hash-map-view.tsx`, `engine/hashmap.ts` | shipped (cdp + 5 tests) |
| Panel: sorted view | Label + a second chip row with `#n` subscripts, L = ▲, R = ring, outside-range dim; sum equation under it. | `panels.tsx` | shipped (cdp) |
| Panel: bits | 7-bit rows `x` and `acc`; on-bits blue, bits that just flipped ringed red; `= value` at the end. | `panels.tsx` | shipped (cdp) |
| XOR: pairs annihilate | The XOR act fades chips **by pair, not by progress**: a value whose twin has been consumed dims together with its twin on that very frame, so what stays lit is exactly what the accumulator still holds, and the loner is the last one standing. On a broken promise (two singles) two chips stay lit — the lie, made visible. The survivor beats once (520 ms `answer-pulse`) when it turns green. | `engine/journeys/single-number.ts` `xor.view`, `chip-row.tsx`, `index.css` | shipped (UI test: every doubled value faded by the end, none before its twin arrived, the single stays lit and becomes the answer) |
| Panel: bars | One column per height, keyed by value+occurrence so FLIP morphs a column instead of blinking it. Chip roles reused: **anchor** peach (left wall), **focus** yellow (right wall), **answer** green (the winning pair), **dim** (retired). The water between the two walls is drawn INSIDE each column of the span — a translucent block from the floor to the shorter wall — so it needs no measuring and a taller post sticks out of it. Area label under the chart, best-so-far under that. | `panels.tsx` `Bars`, `engine/types.ts` `BarModel`/`WaterModel` | shipped (UI test on the textbook row: 9 columns, opening container `width 8 × height 1 = 8` across all nine, narrowing to eight columns and `width 7 × height 7 = 49` once the short post is retired) |
| Panel: recap | Table approach / built from (mauve) / cost / insight, the "nobody invented four algorithms" note, two link cards (pattern page, next problem). | `panels.tsx` | shipped (cdp: 5 rows) |
| Panel: challenge | See §4.6. | `challenge-editor.tsx` | shipped (cdp) |
| Narration | `› note` under the stage, `aria-live=polite`, min-height so the layout never jumps. | `journey-page.tsx` | shipped |

### 4.4 Interruptions (under the narration)

| Element | Behaviour | File | Status |
|---|---|---|---|
| Predict card | Blue card "YOU DRIVE — PREDICT THE NEXT MOVE". Appears when the *next* frame has `predict` and has not been asked on this timeline; playback pauses **before** that frame renders. Choice buttons; right = green, wrong = red + the right one green; feedback "exactly — watch:" / "not quite — watch what actually happens:"; after 0.7 s / 1.6 s the frame plays and playback resumes if it was playing. Scrubbing or ← skips the question. Asked once per direction (two pointers), once for the return (brute), once at i = 0 (hash), once at i = 1 (XOR). | `cards.tsx`, `use-journey.ts` guard | shipped (cdp brute act) |
| Quiz card | Mauve card "CHECK YOURSELF (1/2)". Appears when an act finishes and the *next* act is still locked and the act has a quiz not yet passed (`quizzes:<slug>`). Wrong → explanation text + retry, counts towards the hint ladder; right → next question after 0.5 s; all right → `+5 XP`, act key recorded, reveal button appears. The choices are a **radiogroup**: one tab stop, ↑/↓ move (stopped so they do not also step the player), enter or space picks, `aria-checked` on the pick (R7). | `cards.tsx`, `use-journey.ts` | shipped (cdp: quizzes = ["story"]; UI test: one tab stop, ↑/↓ move and return, the timeline does not move) |
| Reveal button | Green: "I understand the problem — try solving it ▸" (act 1) / "I get it — what's the weakness? ▸" / the act's `nextLabel`. Click → `unlocked = idx+2`, `+10 XP`, switch to the new act, stepper node zooms in. If the next act was already unlocked (revisit), a plain "Next: <name> ▸" instead. | `use-journey.ts` `nextButton` | shipped (cdp: unlocked 1→2, xp 15) |
| Corner-case callout | Teal card "CORNER CASE · <name>" + the example in mono, the journey's `why` and a `think` line, under the narration while the current frame carries `corner: <key>`. The frame's own note says what this approach did about it. Every corner case is tagged by at least one act on its own preset (test). Never on the story act's hint ladder — the story act shows hints up front instead. | `cards.tsx` `EdgeCaseCard`, `journey-page.tsx`, journey `edgeCases` | shipped (cdp: brute on `duplicates` → `data-edge=duplicates` after the predict; sort on `max` → `last`) |
| Hint ladder | Dashed card "STUCK? EARN IT WITH A SMALLER PUSH". Offered after **45 s** with no new frame shown, or after **2 wrong quiz answers**. "give me a nudge" → nudge; "a bigger hint" → concept; then the line to stare at. Never the answer. Resets on act change. | `cards.tsx`, `use-journey.ts` | shipped (code; timer path not screenshot-tested) |
| Adaptive difficulty | Peach card "🔥 Flawless — no wrong answers, first-try green." + the journey's `harder.label` button → applies the harder preset. Only when zero wrong quiz answers this visit **and** the challenge passed on attempt 1. | `use-journey.ts`, `journey-page.tsx` | shipped (code; not exercised in cdp) |

### 4.5 Transport and data controls

| Element | Behaviour | File | Status |
|---|---|---|---|
| Timeline | Native range 0..last; dragging pauses, clears any pending prediction, shows `pos/last`. | `controls.tsx` `Transport` | shipped (cdp) |
| Play / Pause | Toggles; at the end, Play restarts from 0. Autoplay waits `delay × hold` per frame (hold 2–3 on narrative frames). | `use-player.ts` | shipped (code) |
| ‹ back | Pauses, clears prediction, pos − 1. Disabled at 0. | `controls.tsx` | shipped |
| › forward | Pauses, then steps; a predict frame ahead opens the predict card instead. Disabled at end. | same | shipped (cdp) |
| ↺ restart act | Pauses, pos = 0, clears prediction. Disabled at 0. | same | shipped |
| Speed | 1..100 → 2.0 s … 0.1 s per step (`delayFor`); stored pref shared with the visualizer. | `use-player.ts`, `lib/store.ts` | shipped |
| Preset select | `random`, `answer at the extremes`, `equal values (3 + 3)`, `big (n = 20)`, `n = 2 (smallest legal)`, `negatives (target 0)`, `no solution`, `two valid pairs` (Two Sum); `random`, `n = 1`, `loner is the largest`, `loner is 0`, `big (n = 25)`, `two singles`, `a triple` (Single Number). Changing applies immediately and re-runs classify. | `controls.tsx` `DataControls`, journey `presets` | shipped (test: every preset drains) |
| ⚄ new | Regenerates from the current preset. | same | shipped |
| Custom input | Comma/space-separated integers (−999…999 Two Sum, 0–127 Single Number); `target` box for Two Sum; Enter or **apply** parses via the API; failure shows "couldn't read that input" and keeps the old data. New preset data overwrites the draft. | same, `api.parse` | shipped (test: parse 400) |
| Keyboard | `space` play/pause, `→` step, `←` back, `r` restart — ignored inside inputs/textarea/select. | `use-journey.ts` | shipped (code) |
| Test-case drawer (≥ lg) | A flask in the header toggles an 18 rem column between the stage and the reading column, holding the preset select, ⚄ new, the custom input and **apply**. It is a **column, not an overlay**: opening it narrows the stage rather than covering the data you are about to change. `inert` while closed so its fields leave the tab order at width 0; **Esc from inside** closes it and returns focus to the flask (the global Esc still belongs to dialogs); state is pref `drawer`. Below `lg` there is no room to push, so the same controls stay in the stage footer. At 1440 px with the reading column also open the stage is 428 px — `f` closes both rails when that is too tight. | `journey-page.tsx`, `controls.tsx` `DataControls` | shipped (UI test at 1440 px: the closed drawer measures 0, opening it takes > 100 px off the stage, the open drawer measures > 200 px, its left edge is not over the stage, and the preset select is inside it) |

### 4.6 Code challenge (Two Sum act 6, Single Number act 6)

| Element | Behaviour | File | Status |
|---|---|---|---|
| Editor | `function twoSum(nums, target) {` … `}` around a textarea seeded with the starter; Tab inserts two spaces. | `challenge-editor.tsx` | shipped |
| ▶ Run tests | Runs the body in a Blob Worker against 6 cases (3 s timeout → "timed out — infinite loop?"); each case line `✓/✗ twoSum([…], t) → got`, `want …` on failure, edge tag (`equal values`, `duplicates`, `answer at extremes`). All green → "all 6 cases pass — you wrote it", `+25 XP` once, act finishes (gate `pass`), reveal button appears. | same, `use-journey.ts` `onChallengePass` | shipped (cdp: 6/6, 25 XP) |
| 👁 Watch my code on this input | Trace mode: a Proxy records every `nums[i]` read/write (cap 400). Verdict "traced n array accesses — press Play to watch YOUR code"; the act's frames are rebuilt from the trace and the chips follow the learner's execution (read = ring, write = ▲), then the returned pair is checked and marked. New data clears the trace. | same, `two-sum.ts` challenge `run` | shipped (cdp: 14 accesses → 15 frames) |
| Scorecard | correctness `p/n`, array touches vs reference (the one-pass map, counted the same way), edge cases ✓/✗, "new best — previous was n touches" from the last 50 runs in `scorecard:<slug>`. | same | shipped (cdp) |
| Self-review | After green: 3 auto-checked items (returns [] or null on no solution; ≤ 1 loop; `.has` before `.set`) as ✓/✗ + 2 honest checkboxes. | same, `TWO_SUM_CHALLENGE.review` | shipped (visual) |
| Set 2 (n = 400) | After green: "⚡ Set 2: same code, n = 400" → one big case (6 s timeout); shows still correct / wrong, two touch bars (yours peach, reference mauve), and the ratio verdict (> 5× = "THIS gap is what O-notation was trying to tell you"). | same | shipped (code; not exercised in cdp) |

### 4.7 Reading column

| Element | Behaviour | File | Status |
|---|---|---|---|
| Insight + idea | Insight bold mauve (the weakness the previous act had), idea below. | `journey-page.tsx` | shipped |
| Problem panel (every act) | One accordion holding **the problem** (the practice-set `statement`, its examples, and the input on screen right now), **how to read this problem** (the story act's `hints`, labelled reread · formalize · bring inputs — Khamies §3.1) and **bring three inputs** (below). Open sections persist in pref `problemSections`; until the learner touches it the act decides — problem + corner cases open on the story act, everything closed from act 2 on, where this is a reference and the stage is the point. | `problem-panel.tsx`, `lib/store.ts` | shipped (UI test: on act 05 the section is closed, one click shows the statement, corner cases open on a second click) |
| Bring three inputs | Every `edgeCases` entry: name, example (mono), `why`, a **from** line citing the constraint it comes from (R2), `think`, and a **load this input** button that applies its preset (becomes **loaded ✓**, `aria-pressed`). Prose is technique-neutral so it may sit on act 0 (disclosure test covers it). Lives inside the problem panel. | `cards.tsx` `EdgeCaseList`, `use-journey.ts` `applyPreset` | shipped (cdp: click → preset `duplicates`, data `3, 1, 3, 8`, banner) |
| Built from | The act's `tools`: name bold + role. | same | shipped |
| Code panel | Tabs pseudocode / Python 3 / Java / C++ (only those present); active line lit with a mauve left bar; the tab choice is a stored pref shared by every act and the visualizer. Hidden with the column when it is collapsed — the stage is the focus. | `code-panel.tsx` | shipped (cdp) |
| Takeaways | Three `›` bullets. | `journey-page.tsx` | shipped |
| Steps chart | Horizontal bars, one per **unlocked** algorithm act (never story, challenge, recap), single hue, active act saturated, direct labels, `title` tooltip. Data from `POST chart` with `upto = unlocked`. | `steps-chart.tsx`, `api/routes.ts` | shipped (cdp + test "never includes acts past upto") |
| Legend | Four swatches with the marker channel drawn. | `chip-row.tsx` `Legend` | shipped |
| Resources | "same problem elsewhere:" external links with ↗. | `journey-page.tsx` | shipped |
| Reading toggle | Sticky button at the foot of the column (`PanelRightClose`) collapses it to a rail with the same button (`PanelRightOpen`); below `lg` the rail is a full-width bar. `aria-expanded` mirrors the state. | `journey-page.tsx` `ReadingToggle`, `lib/store.ts` `prefs.reading` | shipped (cdp: 384 → 44 px, prefs written) |
| Type scale | Reading column 15 px, narration 16 px (18 px ≥ `lg`), chips 56 px tall / 20 px digits, sum equation 24/36 px, code 13.5 px on 28 px lines, bit cells 36 px. | `journey-page.tsx`, `chip-row.tsx`, `panels.tsx`, `code-panel.tsx`, `hash-map-view.tsx` | shipped (cdp computed: narration 18px, chip 56) |

### 4.8 Journey content

| Journey | Acts | Presets | Challenge | Status |
|---|---|---|---|---|
| Two Sum (LeetCode 1) | The Problem · Brute Force · Two Pointers · Two-Pass Hash · One-Pass Hash · Code It · The Reveal | 8 + 4 corner cases (tiny, duplicates, negatives, nosolution) | 6 cases + n = 400 + 5 review items | shipped (test: 4 approaches agree on 5 inputs + 1 broken promise) |
| Single Number (LeetCode 136) | The Problem · Brute Force · Hash Map · Sort & Scan · XOR · Code It · The Reveal | 7 + 4 corner cases (single, last, zero, broken) | 6 cases (n = 1, answer 0, loner last, negatives) + n = 2001 + 5 review items | shipped (test: 4 approaches agree on 5 inputs; XOR lies on two singles; UI test runs the XOR reference through the harness) |
| Widest Container (LeetCode 11) | The Problem · Brute Force · Two Pointers · Code It · The Reveal | 7 + 4 corner cases (tiny, flat, zeros, notwidest) | 6 cases (flat row, a zero wall, an answer that is not the widest, a tall pair inside) + n = 400 + 5 review items | shipped (test: both approaches agree with an exhaustive search on 9 fixed rows **and 200 random ones** — the greedy discard is the act's whole argument, so it is checked rather than trusted) |
| Pair Sum in Sorted Array (LeetCode 167) | The Problem · Brute Force · Hash Map · Two Pointers · Code It · The Reveal | 8 + 5 corner cases (tiny, duplicates, negatives, nosolution, **unsorted**) | 6 cases (smallest legal, equal prices, negatives at target 0, answer at the extremes) + n = 400 + 5 review items | shipped (test: 3 approaches agree on 6 inputs; on a shelf that is NOT sorted the squeeze provably walks past an answer the other two find — the act's own teaching claim, asserted) |
| Triplets Summing to Zero (LeetCode 15) | The Problem · Brute Force · Anchor + Hash · Anchor + Two Pointers · The Reveal | 6 + 4 corner cases (tiny, dupes, zeros, none) | — (output is a list of triples; harness compares pairs) | shipped (test: 3 approaches agree on 6 inputs incl. all-zeros and no-answer; the test caught a real dedup bug in the hash act before it shipped) |
| Best Contiguous Run (LeetCode 53) | The Problem · Every stretch, added up · An entry per position · Two variables | 5 + 3 corner cases (all losses, one number, a loss inside the winner) | — (derived journeys have no challenge yet) | shipped **derived** (`engine/derive.ts`, 323 lines against 904 hand-written; test: every rung agrees with a brute-force reference on the 5 presets and 200 random rows). No Java/C++ tabs — B43. |
| Longest Substring Without Repeats (LeetCode 3) | The Problem · Test every stretch · Remember where each one was · Hold only what is inside | 6 + 3 corner cases (the empty string, a repeat from further back, the repeat is a space) | — (derived journeys have no challenge yet) | shipped **derived** (380 lines; the first journey whose row holds characters, not numbers — `cells: "characters"`). No Java/C++ tabs — B43. |

## 5. Algorithm visualizer

| Element | Behaviour | File | Status |
|---|---|---|---|
| Picker | Groups sorting / searching / graphs; `?algo=` mirrored in the URL **and followed when the hash changes in-app** (U3). Scrolls on its own beside a viewport-high stage (U9). | `algorithms-page.tsx` | shipped (UI test: hash switch replaces bars with the graph) |
| Bars | One column per value, value label when n ≤ 24, colour: comparing yellow, swap red, **write mauve with a 260 ms `scaleY` pulse** (a merge-sort store replaces a value in place, so FLIP has no motion to show), pivot/range peach, final green, discarded faded to 40 %, otherwise blue. The pulse is off when the motion preference is `off`, and `prefers-reduced-motion` zeroes it. Keys `v<value>#<occurrence>` so a swap FLIPs both columns. | `views.tsx` `BarsView` | shipped (cdp quick sort) |
| Graph | SVG circle layout; edges grey, active edge yellow; nodes: current yellow, visited green, frontier peach; Dijkstra shows edge weights and `dist` above nodes (∞ until relaxed). | `views.tsx` `GraphView` | shipped (cdp BFS) |
| Controls | size 4–60, shape select, target (search), nodes 4–14 (graph), new array/graph, compares · writes counter, transport + speed + keyboard. | `algorithms-page.tsx` | shipped |
| Pseudocode | Line lit per frame. | `code-panel.tsx` | shipped |

## 6. State (localStorage, prefix `dsa:`)

| Key | Written by | Read by |
|---|---|---|
| `solved` | problem rows / header checkbox | sidebar, home, lists |
| `unlocked:<slug>` | reveal click, restart | stepper, chart, sidebar, home |
| `quizzes:<slug>` | quiz pass, restart | quiz gate (skip if passed before) |
| `xp` | quiz / unlock / challenge | badges |
| `activity-days` | opening a journey | streak |
| `scorecard:<slug>` | Run tests | "your best" |
| `prefs` | speed slider, code tab / language strip, settings dialog | both players, journey layout, FLIP |

`prefs` fields: `speed` (1–100), `codeTab` (`pseudo` · `python` · `java` · `cpp`), `motion`
(`calm` · `normal` · `cinematic` · `off`), `reading` (journey reading column open). `usePrefs`
merges over `DEFAULT_PREFS`, so a field added later reads as its default. The settings dialog can
copy every key **except** `prefs` out as JSON, import it back, or erase it.

Outside `dsa:` — the sidebar's open/closed flag is shadcn's `sidebar_state` cookie.

Not yet stored: tour seen, SRS ladder, stalls, theme (all backlog).

## 7. API and engine (not on screen)

| Feature | Status |
|---|---|
| `GET /api/problems`, `/problems/:id`, `/journeys`, `/journeys/:slug` (acts, presets, `edgeCases`, challenge); `POST preset / parse / classify / run / chart`; `GET /api/algorithms`, `/:key`; `POST /:key/run` | shipped (6 API tests; `curl` against the Vite middleware returned the journey list and the corner cases) |
| Standalone server `npm run api` (port 8787, CORS `*`) | shipped (code; not load-tested) |
| Client transport: HTTP under Vite / `VITE_API_URL`, in-process otherwise | shipped |
| Content gate: schema, drain on sample, note on every frame, code tabs line-for-line, disclosure lint (acts, preset banners, corner-case prose), corner cases tagged on their preset, presets drain, JSON-safe frames | shipped (18 tests across three journeys) |
| Practice-set gate (`data/problems.test.ts`): ids unique, patterns exist, every code block is a function, journeyed problems carry Python + Java + C++ on every approach | shipped (3 tests) |
| Practice set, batch 1 (B33): **31 → 42 problems** across seven patterns — Contains Duplicate, Valid Anagram, Product of Everything Else, Valid Palindrome, Trapping Rain Water, Longest Run After k Rewrites, Evaluate RPN, Search a Sorted Matrix, Last Stone Weight, Largest Island, Longest Increasing Subsequence. Each carries statement, constraints, examples, hints, a walkthrough and an approach ladder in three languages | shipped 2026-09-08 (206 blocks compile; 262 differential comparisons on the new problems, 0 disagreed; oracle answers read by hand) |
| Practice set, batch 2 (B33): **42 → 52 problems** across eight patterns — Group Anagrams, Sort Colours, Permutation in String, Sliding Window Maximum, Generate Parentheses, Search a Rotated Array, kth Largest Element, Word Search, Maximum Subarray, Longest Common Subsequence. Word Search ships a deliberately WRONG first rung (a mark that is never unmarked) as the lesson | shipped 2026-09-08 (266 blocks compile; 1164 differential comparisons, 0 disagreed; 91% mutation kill on the vectors) |
| Practice set, batch 4 (B33): **62 → 87 problems**, Python-only, generated from a compact spec table. Adds the first linked-list and tree problems since the original set, plus union-find, Dijkstra, monotonic-stack and interval techniques | shipped 2026-09-08 (380 mutants at 92% on the vectors; every oracle answer read by hand) |
| Practice-set content layout: one problem is one file (`data/problems/<pattern>/<id>.ts`), the directory `index.ts` a barrel of imports only; `data/problems/README.md` is the change → file map | shipped 2026-09-08 (B34; `PROBLEMS` byte-identical across the split) |
| **UI smoke (`npm run test:ui`)**: `vite preview` + system Chrome over CDP, zero new dependencies. Every route renders with a clean console; unknown route falls back home; story → quiz → reveal writes `unlocked=2`, `quizzes=["story"]`, `xp=15` and switches act; deep link honoured on load, followed on an in-app hash change, ignored when the act is locked; corner-case "load this input" changes the preset; `f` closes/reopens both rails; `?` opens the shortcuts dialog; a settings change survives a reload; 390 px does not scroll sideways | shipped (18 checks, ~28 s; skips loudly when no Chrome — `CHROME_PATH` overrides) |
| **Vector strength gate (`npm run verify:vectors`)**: mutation testing on the reference Python — 174 single-character mutants, a case must notice each one. 91% caught, 0 unexplained survivors; `--suggest` finds the distinguishing input for a survivor. Every vector set names the step its cases force (`exercises:`), enforced by a test | shipped 2026-09-08 (B35; found 15 missing cases) |
| Differential-runner isolation (`scripts/localsmith/run.test.mjs`): a driver that dies mid-run keeps the lines it printed and blames the rest, a clean run is one line per case, every driver guards each case, a newline in a value cannot shift the cases after it | shipped 2026-09-08 (4 tests, B31) |
| Correctness: sorts, binary search, BFS/DFS coverage, Dijkstra vs Bellman-Ford, hash arithmetic | shipped (10 tests) |
