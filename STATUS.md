# STATUS — read this when you return

Last session: 2026-09-08 (the local-model workbench and two gates that run the code;
everything below is merged into `master`).

## Where it stopped

`master` holds the whole product. Forty pull requests merged over four days, from the repo merge
through to the differential runner. Nothing is in flight, no branch is open, every gate is green.

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **61 tests** |
| The interface, in a real browser | `npm run test:ui` | **42 checks**, ~100 s |
| Every Java and C++ block compiles | `npm run verify:code` | **154 blocks**, 0 failed |
| …and agrees with the Python | `npm run verify:run` | **480 comparisons**, 0 disagreed |

The last two need a toolchain: `mise use -g java@temurin-21` and `scoop install main/gcc`, both
user-space. They skip **loudly** when it is missing rather than passing quietly.

On screen: five journeys built to completion (Two Sum, Single Number, Triplets Summing to Zero,
Pair Sum in Sorted Array, Widest Container), a practice set of 31 problems carrying Python, Java and
C++ on every approach, a sorting/search/graph visualizer, SQL drills and stats flashcards,
inside a shell with collapsible rails, a settings dialog and a keyboard map.

**Every original P0, all fourteen UI/UX-audit items, the lesson-screen batch (R3–R8) and the
reference card (R2, R1) are closed — the whole "requested, specced, not started" table is empty.**
How it got here, and the reasoning behind each decision, is the first section of
[`docs/WORKLOG.md`](docs/WORKLOG.md); the lesson-screen spec that R3–R8 came from is
[`docs/superpowers/specs/2026-09-04-lesson-screen-redesign.md`](docs/superpowers/specs/2026-09-04-lesson-screen-redesign.md).

## The next action

The machinery for bulk content now exists (`scripts/localsmith/` + three gates), so the order that
makes the rest cheap is:

1. **B34 — one problem per file.** `src/data/problems/*.ts` are ~900 lines holding prose, four
   languages and walkthrough frames in one literal. Split before adding to them, not after.
2. **B31 — one binary per block, not per case.** The runner compiles and launches once per case;
   Windows refused 28 of 508 launches. Emitting a driver that loops over every case removes the
   flake and cuts compiles about fourfold.
3. **B33 — fifty more problems**, in batches of about ten, each batch a PR. The gates make this
   verifiable in a way it was not before: `check` for the content rules, `verify:code` for the
   translations, `verify:run` against the Python.
4. **Problem #6** in the journey pipeline — Single Buy/Sell Profit, which can reuse the `bars` panel
   kind that arrived with Widest Container.

The nine P1 curriculum items (B9–B17) are untouched and each is a session of its own; B9 (roadmap
page) and B10 (progress dashboard) are the two that change what a learner sees most.

## Waiting on you

Ten questions, each with options and a recommendation, in
[`docs/BACKLOG.md`](docs/BACKLOG.md) §Open questions. Only one still blocks anything:

- **Q7** — `../dsa_visualizer` still exists, untouched, with an uncommitted `feat/disclosure-lint`
  branch. Its one idea shipped here as B8, so it is ready to archive. Yours to do.

**Q1, Q9 and Q10 were built to their recommendations**, since nothing blocks on a question forever:
the ladder replaced the "Approach & Solution" tabs, the transport stayed the footer U1 built (no
header Play, no second scrubber row), and the locked node stayed a "?" rather than a ghosted title.
Say the word and any of the three is a small branch to reverse.

## Environment traps

- Windows, Git Bash. Node 24 runs `server/`, the engine and the tests unbundled (`.ts` extensions
  on relative imports inside `engine/` and `api/`).
- `npm run dev` mounts `/api` itself; `npm run api` is only for other clients.
- `npm run test:ui` needs a system Chrome. `CHROME_PATH` overrides the search, and it **skips
  loudly** rather than passing quietly when there is none.
- **Never `--delete-branch` while another PR is stacked on that branch** — GitHub closes the
  stacked PR. Merge a stack from the tip, or retarget every base first. This cost a recovery rebase
  on 2026-09-05.
- Windows: `child.kill()` leaves the node grandchild holding the port. Kill the tree.
- Windows also refuses to launch a freshly compiled `.exe` at random (about 5 % of the time), which
  surfaces as `spawnSync … UNKNOWN`. It says nothing about the code; `verify:run` counts those
  separately from disagreements (B31 removes the cause).
- A JS template literal normalises CRLF to LF in its **value**, so a string imported from
  `src/data/**` can never be found verbatim in the file on disk with `git autocrlf` on. Normalise
  before matching — this cost an hour in `apply.mjs`.
- Two large local models on two servers (LM Studio + Ollama) fight over one GPU: 200 s a block
  instead of 30. Run second opinions as a separate sequential pass.
- A `location.reload()` inside a CDP `Runtime.evaluate` destroys the execution context, so the call
  never resolves. Set storage on one page load, navigate on the next.
- `ch` is the width of the "0" glyph, not a character — roughly 1.3× the average. Cap prose in `em`.
- `-x` on a zero is `-0` and fails `deepEqual`. Write `0 - x` when x can be zero.

## Known gaps (honest list)

- **No CI.** Both gates run locally (Q8).
- Not covered by any test, so drive them by hand: autoplay timing, the 45 s hint timer, the
  adaptive-difficulty offer, hover-peek, reduced motion, and anything about colour or spacing.
- The engine + data chunk (263 kB) still loads on content pages because the sidebar reads
  `JOURNEYS` for its rows. A slug/title/act-count registry would make it lazy (noted on F1).
- Corner-case callouts for `tiny`, `negatives` and `zero` are covered by tests, not seen by eye.
- Seven problems (linked lists, trees, one stateful class) cannot be driven by `verify:run` yet —
  they need node builders in three languages. Named in `vectors.mjs` `NOT_YET_RUNNABLE` (B30).
- No Java or C++ block is checked for STYLE, only for compiling and agreeing. A block can be ugly
  and still pass.
- With the test-case drawer **and** the reading column both open at 1440 px the stage is 428 px —
  usable, and `f` closes both rails, but it is the tightest the stage ever gets.
- SQL drills and stats flashcards have no visual identity yet and no in-page navigation; the plan
  for that track is `PROBLEMS.md` S1–S4.
- 28 of the 31 practice problems still carry Python only; Java and C++ arrive with each problem's
  own PR.
