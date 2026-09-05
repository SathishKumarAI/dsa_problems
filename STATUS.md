# STATUS — read this when you return

Last session: 2026-09-05 (the lesson-screen batch, R3–R8; everything below is merged into `master`).

## Where it stopped

`master` holds the whole product. Thirty pull requests merged over three days, from the repo merge
through to the lesson-screen batch. Nothing is in flight, no branch is open, both gates are green.

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **43 tests** |
| The interface, in a real browser | `npm run test:ui` | **37 checks**, ~90 s |

On screen: three journeys built to completion (Two Sum, Single Number, Triplets Summing to Zero), a
practice set of 31 problems, a sorting/search/graph visualizer, SQL drills and stats flashcards,
inside a shell with collapsible rails, a settings dialog and a keyboard map.

**Every original P0, all fourteen UI/UX-audit items and the lesson-screen batch (R3–R8) are
closed.** How it got here, and the reasoning behind each decision, is the first section of
[`docs/WORKLOG.md`](docs/WORKLOG.md); the lesson-screen spec that R3–R8 came from is
[`docs/superpowers/specs/2026-09-04-lesson-screen-redesign.md`](docs/superpowers/specs/2026-09-04-lesson-screen-redesign.md).

## The next action

1. **R2 then R1** — `constraints: string[]` on `Problem`, then the approach ladder. The spec is
   [`docs/PROBLEMS.md`](docs/PROBLEMS.md) §P1: statement → constraints → hints → approaches worst
   to best, each rung carrying the weakness that forces the next, Python 3 always. The learner
   writes code on LeetCode; this app explains. **Answer Q1 first.**
2. **Problem #4** in the pipeline — Pair Sum in Sorted Array. One problem per branch; the
   definition of done is in `PROBLEMS.md`.
3. Then the P1 curriculum items: the roadmap page (B9), the progress dashboard (B10), the
   two-pointers pattern page (B11).

## Waiting on you

Ten questions, each with options and a recommendation, in
[`docs/BACKLOG.md`](docs/BACKLOG.md) §Open questions. Two still block work:

- **Q1** — does the approach ladder replace the "Approach & Solution" tab, or sit beside it?
  (I would replace it.) This gates R1.
- **Q7** — `../dsa_visualizer` still exists, untouched, with an uncommitted `feat/disclosure-lint`
  branch. Its one idea shipped here as B8, so it is ready to archive. Yours to do.

**Q9 and Q10 were built to their recommendations**, since nothing blocks on a question forever: the
transport stayed the footer U1 built (no header Play, no second scrubber row), and the locked node
stayed a "?" rather than a ghosted title. Say the word and either is a small branch to reverse.

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
- With the test-case drawer **and** the reading column both open at 1440 px the stage is 428 px —
  usable, and `f` closes both rails, but it is the tightest the stage ever gets.
- SQL drills and stats flashcards have no visual identity yet and no in-page navigation; the plan
  for that track is `PROBLEMS.md` S1–S4.
- 28 of the 31 practice problems still carry Python only; Java and C++ arrive with each problem's
  own PR.
