# CLAUDE.md — Patternsmith

One Vite + React + TS app: practice set + learning journeys + algorithm visualizer, over a
DOM-free engine with an HTTP API. Node 24 runs `server/` and the tests unbundled.

## Where to look

| Question                                                             | File                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What to build next, and why                                          | `docs/BACKLOG.md` (top unchecked P0)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Which **problem** is next, and what "done" means for one             | `docs/PROBLEMS.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Everything about one problem, on one page**                        | `#/p/<pattern>/<id>` — there is no second route. The long explanation is a section at the foot (`#explanation`), gated by the same `capped` flag as the ladder and the arc. `#/learn/<id>` redirects. Sections: `lib/teaching-parts.ts` (data) → `components/teaching-doc.tsx` (markup)                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Everything about one problem, in one directory**                   | `src/problems/<id>/` — the record (`problem.ts`, `hints.ts`, `solutions.ts`) and the teaching document (`understanding.ts`, `traps.ts`, `approaches/<rung>.ts`, `arc.ts`, `interview.ts`, `script.ts`) side by side. Map: `src/problems/README.md`. **Two entry files on purpose**: `index.ts` is the record and is EAGER, `doc.ts` is the document and is LAZY — nothing eager may reach a doc file. 84 of 153 problems have a directory, and every one of them is whole — record and document, both split into sections, nothing over 500 lines. The rest are still `docs/deep/<id>_explained.md` spliced into the generated `docs/learn/<id>.md` (`npm run docs:learn`). The page shows the ending, so the app links it only when the ladder is not capped |
| What to read outside this repo, and how to drill a pattern           | `docs/RESOURCES.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| What exists on screen, every button, its status                      | `docs/FEATURES.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| What IS this box, who owns it, how data flows                        | `docs/ARCHITECTURE.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Change → file                                                        | `README.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| How to add a journey without spoiling it                             | `docs/AUTHORING.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| The API contract                                                     | `docs/API.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Where the last session stopped                                       | `STATUS.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Measured UI/UX findings and the fix list                             | `docs/UX-AUDIT.md` (U1–U14 chrome, V1–V10 content, P1–P4 panels)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Whether a panel still fits its biggest input                         | `test/panel-audit.test.mjs` — runs inside `npm run test:ui`, one test per panel kind, and still prints the table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Which type step / spacing / radius / width / colour role to use      | `docs/DESIGN.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **The measure** — how wide prose is, and why it is justified         | `docs/DESIGN.md` §Measure. One token, `--container-measure`, and it is the reading COLUMN: prose fills it, set with `hyphens: auto` (the `prose-set` utility). Never cap a padded box — padding-right comes out of the measure, padding-left does not                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| What the problem page owes, what shipped, and what is still open     | `docs/PROBLEM-PAGE.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **How to take one of the other 152 problems to the pilot's shape**   | `docs/PROBLEM-PAGE-PLAYBOOK.md` — the anatomy band by band, the five fields to author (`unlocks`, figures, `costWhy`, `checks`, `reading`), what good and bad look like for each with the pilot verbatim, the order to write them in, ~70 min/problem measured, the gates in run order, and a copy-paste checklist. The code is done; the content is not                                                                                                                                                                                                                                                                                                                                                                                                      |
| How the animations work, and how to build one in Python / for an LLM | `docs/VISUALIZING.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Which model wrote what, and what it cost in tokens                   | `docs/MODELS.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| How to run subagents here — the roster, the rules, how to resume one | `docs/AGENTS.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| What shipped when                                                    | `docs/WORKLOG.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Why an item exists                                                   | `docs/RESEARCH.md`, `docs/PRD.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## The pedagogy (do not regress this)

- **153 problems, 93 journeys, 19 patterns.** Every pattern owns at least one problem and a
  playbook of at least four moves — `problems.test.ts` fails on either being empty, because a
  pattern costs one line to add and the page renders a heading over white space without them.
  A problem's pattern is its own `pattern` FIELD; `src/data/problems/<pattern>/` is a load
  list, not the grouping, so re-filing one is a one-word edit.
- **153 problems, 93 journeys.** The other **60** ship a static walkthrough instead, and
  `problems.test.ts` forbids carrying both — so a journey written for one of them DELETES that
  problem's `walkthrough` in the same commit (B63).
- **Progressive disclosure is the product.** No unearned act or pattern name anywhere a learner
  can see: not in the stepper, banners, chart, hints, quiz, URL. Locked acts are one "?" node.
  `unlocked:<slug>` is written only by the reveal click in `use-journey.ts` (and restart).
- **Insight before name.** An act opens with the previous act's weakness; names arrive in the recap.
- **Corner cases are content, taught twice.** `journey.edgeCases` (technique-neutral prose, read on
  the story act) + frames tagged `corner: key` (explained in play). The test requires every case to
  be tagged on its own preset.
- **The content test is the gate.** `src/engine/journeys.test.ts` enforces schema, drain, notes,
  line-for-line code tabs and the disclosure rule. Don't weaken it; extend it.
- **Every corner case must be TAGGED by a frame on its own preset**, and every tag must name a
  declared edge. Six of the eight journeys written on 2026-09-09 failed one of those two on the
  first run; the gate caught all six.

## Working agreements

- Branch per change (`type/scope-slug`), conventional commits, check the backlog item off and
  add a `FEATURES.md` row **in the same commit**.
- `npm run check` (tsc, eslint, node tests) must exit 0, and `npm run test:ui` (real Chrome) for
  anything on screen. Touching a Java or C++ block also owes `npm run verify:code` (it compiles)
  and `npm run verify:run` (it agrees with the Python). All four are necessary, none is
  sufficient: drive the page for timing, the Worker challenge, hover and anything about colour.
- Engine stays DOM-free and JSON-safe; `.ts` extensions on relative imports in `engine/`/`api/`.
- Every localStorage key goes through `src/lib/store.ts`; palette only in `src/index.css`.
- **Reach for the role, not the size**: `text-body` for a sentence, `text-meta` for a label, never a
  raw `text-[13px]`. Prose takes `max-w-measure`, which IS the reading column — one token, never an
  `em` value (an `em` cap is per-element, so one "cap" becomes many widths) and never on a padded
  box. The six steps and the rest of the system are in `docs/DESIGN.md`.
- `legacy/visualizer/` is read-only reference (excluded from tsc/eslint/prettier). Port from it;
  never import from it. Delete it when B25 says so.

## Traps

- **A pipe replaces the exit code with the LAST command's.** `npm run verify:vectors | tail -4`
  reports `tail`'s success, so a gate that exits 1 reads as green — which is how a red gate with 22
  survivors sat unnoticed on master (G12). Read the gate's own summary line, or run it without a pipe and echo
  `$?`. Worth knowing which gates CI covers, too: `gates.yml` runs check, build, verify-deep,
  learn-gaps, docs:learn and verify:code — NOT vectors, run, fences or test:ui, so those four are
  only ever as green as the last person who ran them locally said they were.
- **A backtick inside a comment inside a template literal ends the string.** `ui-smoke.test.mjs`
  passes its page scripts as template literals; a comment I added there quoted a CSS selector in
  backticks and the whole file stopped parsing — 16 tests ran instead of 178, reported as one
  file-level failure rather than as a syntax error. `node --check <file>` names it in one line.
- **`getBoundingClientRect` on an INLINE element spans every line it wraps across.** Measuring
  vertical gaps by walking children and subtracting rects therefore reports enormous holes that do
  not exist — I "found" a 6200px gap on a 6898px page and nearly went fixing it. Measure block
  boxes, or use `getClientRects()` per line.
- **`em` is relative to the element, so one "cap" is many widths.** `max-w-[35em]` rendered 595px on
  a 17px paragraph and 525px on a 15px one; eight different sentence widths in one column is what
  reads as text nobody set. One absolute token, on the TEXT and not on a padded box, and one cap per
  FLOW rather than one per block — a per-block cap is applied after the nesting, so a callout inside
  a fold ends up wider than the column.
- **Node strips types from `.ts` and cannot load `.tsx` at all.** A rule that must fail the build
  cannot live in a component module: `watchable.ts` and `doc-sections.ts` are plain `.ts` for that
  reason, not for tidiness.
- **A `<b>` renders 700**, which is off this scale (400/500/600). Keep the element where a test
  selects on it and write `font-semibold`.
- **Hiding chrome on scroll is a FEEDBACK LOOP unless you break it.** Hiding widens the
  column, which shortens the document, which near the foot makes the browser clamp `scrollY`
  DOWNWARD — read as scrolling up, so the chrome comes back, so the page lengthens again.
  A run to the bottom ended with the chrome open and the position oscillating. Two guards:
  a settle window after each flip (the page moving is not a gesture), and a top zone that is
  ENTERED rather than occupied (the reflow can legitimately land a reader near the top).

- **`overflow-anchor` already keeps the reader's place** when content above the viewport
  changes size, and it is on by default. A hand-written version fought the user's own
  scrolling, double-corrected against the native one still running underneath, and its
  `scrollBy` re-entered the scroll listener — position jumped 6000px on a scroll that asked
  for 600. Reach for the platform feature first; the only thing it cannot do is tell your own
  code that the movement was not a gesture.

- **A component used TWICE in one file will take your edit on the wrong copy.**
  `problem-detail.tsx` renders `OrientBar` in the comparison view and again on the page
  itself. A scripted replace of the first match patched the comparison view, the page's own
  bar kept its old markup, and the browser check failed with the bar's className showing
  none of the classes just "added". Anchor on something unique, or patch every occurrence
  and check the count.

- **Two UI gates count `textarea` and mean DIFFERENT things by the number** — one proving
  the page hosts no solve editor, one proving every teaching block is the reader's to
  change. A count cannot tell those apart, so the first was written positionally ("none
  above the explanation") and broke the moment the approach ladder's Python became
  runnable — a teaching block in the one place the proxy forbade one. Mark the ROLE
  (`data-code-editor`, as `data-notes` already does) and let each gate ask its own
  question. The rewritten one is stronger: it holds over the whole page.

- **Two UI gates count `textarea` to mean "a code editor".** Any other textarea on a problem page —
  the notes field — makes them assert something they were not written to assert. Mark it
  (`data-notes`) and exclude it, rather than loosening the count.

- **A bare `#id` href is a ROUTE change, not a scroll.** This is a hash-routed app, so
  `href="#rung-brute"` sets the route to `rung-brute` and the app renders HOME — the page the
  reader was on is gone. Every in-page anchor needs `preventDefault()` + `scrollIntoView`.
  Shipped broken on the approach ladder for months; `learn-page-view.tsx` had guarded it all
  along. Gate: _"a jump to an approach scrolls, and lands clear of the sticky bar"_.
- **An anchor lands under the phone's sticky bar** unless the SCROLL CONTAINER reserves it.
  `html { scroll-padding-top }` below `md` fixes every jump at once (index.css); a `scroll-mt-*`
  on each target is the version you forget on the next one.
- **A flex item defaults to `min-width: auto`**, i.e. its content's min-content — and that floor
  propagates up until the whole document is wider than the viewport. One 16px chevron took home
  sideways at 1440. The guard is `min-w-0` on `SidebarInset` (`App.tsx`); `markdown.tsx` documents
  the same trap for its column.
- **The R6 motion audit only walks `main`.** Everything outside it — the rail, dialogs, the sheet —
  had drifted to a third duration and a second curve. Audit document-wide, not `main`-wide.
- **A clipped element still reports a bounding rect.** An overlap detector that does not intersect
  against every scrolling ancestor will call clipped text "covered" and send you fixing the wrong
  bar. Cost one wrong diagnosis on 2026-09-13.
- **`localStorage` written while a page is mounted is undone** — the store caches per key. Write it
  on another route, then navigate for real (that is what `test/ui-smoke.test.mjs` does).
- **Applying a preset restarts the act**, so a script that picks the act first measures the story act.
- **A backslash in a template literal sent to the page is consumed twice** (`/^\d\d/` arrives as
  `/^dd/`). Use a character class.
- `-x` on a zero is `-0` and fails `deepEqual`; write `0 - x` when a value can be zero (three-sum hash act).

- **A table cell may hold an escaped pipe, and `\|` is a LITERAL pipe.** `lib/markdown.ts` split
  cells on every `|`, so three-sum-closest's four worked examples — whose headers write `|s - 1|`
  for absolute value — rendered one column too wide with a bare backtick painted in each header.
  It had shipped that way for as long as the document existed, on the old learn page and the new
  one alike; the conversion is only what made someone look at the page. Seventeen cells across
  three documents. Gate: _"a table cell may hold an escaped pipe"_ in `markdown.test.ts`.

- **`## Understanding` is not one table, and its constraints part is not only a table.** The
  converter's first cut took every `|` line in the section and parsed the lot as one table, which
  is right only while there is exactly one; and lifting the whole constraints `###` part threw away
  the paragraph four documents put under that heading arguing what the bound buys. Five documents
  lost a table, then fifteen lost prose. `content-roundtrip.mjs` caught both and nothing else
  would have — run it on every conversion, and only delete the Markdown after it says ok.

- **An extra rung is not always a baseline or a variant.** `lib/ladder.ts` placed one at the foot
  or the top and nothing else, which is right for those two and wrong for a STEPPING STONE — the
  rung a document reaches its answer THROUGH. sorted-squares' "merge two runs" rendered above the
  answer, and tree-diameter's misplacement silently moved `whyNow` above a different rung. Set
  `Solution.after` to the key it follows; gate: _"a rung that names where it goes, names a rung that
  exists"_.

- **Promoting a rung can leave the rung ABOVE it without a `whyNow`.** A journey's first act writes
  no `insight` because nothing is under it — promote a baseline beneath it and that stops being
  true. `ladderOf` reads the matching alternative's `whyNow` for exactly this case, and the ladder
  gate fails until one exists.

- **A test that NAMES a problem goes stale when a batch converts it.** `max-depth` was the
  Markdown example in a UI check and this slice made it typed, so the check failed on a document
  that had graduated. Read the subject off disk — the richest still-Markdown page — the way
  `EXPLAINED` does.

- **A brace counter reads `'{'` as structure.** Two of them did: `problems.test.ts`'s well-formed
  check called a correct Java block malformed, and `localsmith/run.mjs`'s `cDefs` never closed a
  function that tests `ch == '{'`, so it reported **"no function to call"** and skipped both
  translations of a whole rung — a shrug, not a failure. Both strip character and string literals
  before counting now. The repo's own rule says it: to find code, parse it, do not count braces.

- **The explanation is on the problem page, so nothing may be said twice.** `gen-learn.mjs`
  used to emit the title, the statement, the constraints, the examples, the hints and every
  rung in three languages, because `#/learn/<id>` was a page that had to stand alone. All six
  are on the screen above it now. `scripts/gen-learn.test.mjs` fails the build if any of them
  comes back — strip fences before that check, or a Python comment reads as a heading.

- **React Compiler lint rules** (`react-hooks` v7): no sync `setState` in effects, no ref reads in
  render, no mutating frames. Use render-time adjusts (`if (x !== prev) { setPrev(x); … }`) or
  derive. `use-player.ts` and `controls.tsx` show the pattern.
- `git add` warns LF→CRLF on Windows — harmless. But a JS template literal normalises CRLF to LF
  in its VALUE, so a string imported from `src/data/**` is never found verbatim in the file on
  disk; normalise before matching.
- Windows refuses to launch a freshly compiled `.exe` about 5 % of the time (`spawnSync …
UNKNOWN`). Not a code problem — `verify:run` counts those apart from real disagreements.
- The chrome-devtools MCP profile can be held by another session; a private headless Chrome on
  `--remote-debugging-port=9333` driven over CDP works (see `docs/WORKLOG.md` 2026-09-04).
- `innerText` reflects `text-transform: uppercase` — match case-insensitively in browser checks.
- `params` passed to `DataControls` must be signature-stable; it is compared by JSON, not identity.
- Dijkstra's `Infinity` becomes `null` over JSON; `GraphView` handles both.
