# STATUS — read this when you return

Last session: 2026-09-05 (autonomous Claude session, working on `master` through PRs).

## Where it stopped

Everything is **merged into `master`** (PRs #1–#10). Master has three journeys (Two Sum, Single
Number, Triplets Summing to Zero), the shell (collapsible rails with hover-peek, independent
scroll panels, settings / shortcuts / help dialogs), corner cases as content, Python + Java + C++
on the journeyed problems, code splitting, the full docs set, and a browser-driven UI smoke test.

`npm run check` → tsc 0 · eslint 0 · 41 node tests. `npm run test:ui` → 18 browser checks.

## The next action

1. UX-audit **batch 5**: U9 (the visualizer ends at ~600 px of a 1000 px viewport) and U13 (home
   looks identical whether you have finished nothing or everything).
2. Then **P1** in `docs/PROBLEMS.md`: the reference-card rebuild (constraints, hints, approaches
   worst→best in three languages). The learner codes on LeetCode; this app explains.
   Batches 1–4 shipped 2026-09-05; `docs/DESIGN.md` holds the tokens.
2. Then the next problem in `docs/PROBLEMS.md` — #4 Pair Sum in Sorted Array is marked next.
   One problem per branch; the definition of done is in that file.
3. Decide the two open questions: a **Python** sidebar section (no Python-only content exists yet)
   and whether a journeyed problem still needs its own hand-written walkthrough (B1).
4. Archive the old folder — your call, nothing was touched: `../dsa_visualizer` still has an
   **uncommitted** `feat/disclosure-lint` branch. Its intent is backlog **B8**; commit or discard
   it there, then move the folder to `~/coding/archive/` per the workspace rules.

## Environment traps

- Windows, Git Bash. Node 24 (`node --test` with type stripping). `npm run check` is the gate;
  `npm run test:ui` is the gate for anything on screen (needs a system Chrome; `CHROME_PATH`
  overrides the search, and it skips loudly rather than passing quietly).
- `npm run dev` mounts `/api` itself; `npm run api` is only for other clients.
- **Never `--delete-branch` while another PR is stacked on that branch** — it closes the stacked
  PR. Merge a stack from the tip, or retarget every base first. (This cost a recovery rebase on
  2026-09-05; the worklog has the shape of it.)
- Windows: `child.kill()` leaves the node grandchild holding the port. Kill the tree.
- A `location.reload()` inside a CDP `Runtime.evaluate` destroys the execution context, so the
  call never resolves. Set storage on one page load, navigate on the next.

## Known gaps (honest list)

- Not covered by any test, so drive them by hand: autoplay timing, the 45 s hint timer, the Worker
  code challenge (Set 2 at n = 400), the adaptive-difficulty offer, hover-peek, reduced motion,
  and anything about colour or spacing.
- Corner-case callouts for `tiny`, `negatives`, `zero` are covered by tests, not seen by eye.
- The engine/data chunk (204 kB) still loads on content pages because the sidebar reads
  `JOURNEYS` (noted on F1).
- No CI. Both gates are run locally.
