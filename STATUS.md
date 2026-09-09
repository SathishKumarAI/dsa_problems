# STATUS — read this when you return

Last session: 2026-09-09. Journeys went **5 → 48**, the practice set's Java/C++ hole was closed,
the UI got the pass it had been owed since the set tripled in size, and the tree and list panels
finally have something rendering them.

## The spec checklist

`docs/SPEC-CHECKLIST.md` walks the Widest Container build prompt's 34-line checklist item by item
with the evidence for each. **33 ticked, one deliberately not**: removing the responsive
breakpoints, which was asked directly and answered "keep responsive", and which `test:ui` also
depends on in two checks.

## Where it stopped

`master` is clean and holds everything: #49–#62. Nothing is open. The last of them is **batch 5**
(#62) — the first five journeys for tree- and list-shaped problems.

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **405 tests** |
| The interface, in a real browser | `npm run test:ui` | **95 checks**, 0 failed |
| Every Java and C++ block compiles | `npm run verify:code` | **366 blocks**, 0 failed |
| …and agrees with the Python | `npm run verify:run` | **1452 comparisons**, 0 disagreed |
| …on cases strong enough to notice | `npm run verify:vectors` | **380 mutants, 92% caught**, 0 survived |

## What happened, in the order it happened

1. **The spike** (#49). A journey was 1075 lines hand-written, so 82 more was ~88,000 lines and
   would never be written. `engine/derive.ts` builds a journey from what a `Problem` already
   carries — ladder, code, complexities, hints, constraints — leaving only the act framing, quiz,
   corner cases and one generator per rung. Measured: **323 lines**, not the 8× saving hoped for
   but a real 2.8×.
2. **Four content batches** (#50, #51, #53, #54, #56) — 40 derived journeys, mean ~350 lines.
3. **The translation pass** (#55). `problems.test.ts` refuses a journey on a problem lacking Java
   and C++, and twelve array-shaped problems had shipped Python-only. 48 blocks written and gated.
4. **The UI pass** (#57) — three agents in parallel on disjoint files, then integration. The
   34-line spec checklist is walked item by item in `docs/SPEC-CHECKLIST.md`.
5. **The disclosure fix** (#58) — "42 more journeys" was a one-way door: expanding hid its own
   control, because the guard asked "is there more to show?" rather than "am I expanded?".
6. **The tree and list panels** (#59). `max-depth` and `reverse-list` are the first journeys to
   render `TreeView` and `ListView`; both shapes arrive as `cells: "words"` with `.` for an absent
   slot, since `Cell` has no null. The same PR moved the transport into the top bar and gave the
   stage the width the reading column was holding.

## The next action

**Batch 5 shipped five of the 31 tree/list/graph journeys.** Carry on with the same pool, in the
same shape — each journey deletes its problem's ASCII walkthrough on the way in, because
`problems.test.ts` refuses to let a journey and a hand-written walkthrough coexist.

1. **B56, the rest of batch 5's pool.** 15 problems are three-language and unblocked right now:
   top-k-frequent, min-cover-substring, balanced-brackets, generate-parens, koko-bananas,
   k-closest-points, task-cooldown, course-order, rotting-fruit, max-island-area, word-search,
   count-provinces, network-delay, longest-common-subsequence, partition-equal-subset.
   The templates: `cycle-detect` (list, back-edge), `level-order` / `validate-bst` (tree),
   `kth-largest-stream` (heap on the tree view), `merge-two-sorted` (two structures in one row).
2. **A translation pass** for the 11 that are Python-only — middle-of-list, palindrome-list,
   remove-nth-from-end, same-tree, invert-tree, balanced-tree, bst-ancestor, kth-smallest-matrix,
   surrounded-regions, unique-paths, word-break — which is what blocks a journey on each of them
   (`problems.test.ts`). Same shape as B50.
3. **B51** — six array-shaped problems still unwritten.
4. **B54 pays itself off** as those land: 26 ASCII walkthroughs left, down from 31.
5. **B52** — `stair-ways` and `counting-bits` take a single number, not a row.
6. **B53** — a hundred journeys needs 13 new problems first.

## Traps this session added to the list

- **`git add -A` while agents are running sweeps their half-written files into your commit.** Use
  explicit paths. Recovered here with `reset --soft`, but only because it was noticed immediately.
- **An agent saying "those failures are not mine, the tree was dirty" is a hypothesis, not a
  finding.** All three UI agents said it about the same three `test:ui` failures. On a clean
  integrated tree all three still failed and all three were real. Re-run the gate yourself on a
  clean tree before believing any of it.
- **"It passes in isolation" is not evidence of innocence.** The measure test passed alone and
  failed in the suite because the offending paragraph only renders once a journey has been
  *started* — state an earlier test had left behind.
- **A rule only holds where something looks.** Two blocks of sentences had been set at 12px with no
  measure cap for as long as they had existed; the UI suite could not see them because they lived
  behind a tab that was closed by default. Opening the sections is what surfaced them.
- **A failing assertion that reports only a number costs an afternoon.** `longest measure is 128ch`
  was true and useless. It names the element and its classes now.
- **The `line` on a derived frame indexes that rung's own Python block, not the file.** Two frames
  pointed past the end; the content gate caught both.
- **Windows refuses to launch a freshly built `.exe`** far more often than the 5% first measured —
  43 of 330 drivers in one full `verify:run` sweep, about 13%. It is counted apart from real
  disagreements, but it means a green summary with launch failures in it is only a partial pass.
  Re-run per problem (`--id`) to tell "not checked" from "checked and fine".

- **A control designed for a footer does not become a header control by moving it.** The transport
  is two rows with its own speed slider; dropped into a nowrap bar it wrapped the bar to 150px and
  truncated the h1 to "Widest Co…". It needed an `inline` variant, and dropping the second speed
  slider entirely — settings already owns a live one.
- **In a flex row, decide what is allowed to shrink.** Both the title and its subtitle were
  shrinkable, so the browser shrank the title. `shrink-0` on the name, `truncate` on the gloss.

- **"Delete the dead fallback" is a claim to measure, not to act on.** B54 read as a cleanup for a
  day. Counting said 31 pages would lose their only visualisation. The count took one script.
- **A negative sweep is worth writing down.** V10's "there are probably more unrendered fields" was
  false — every field of every content type traces to a render site. Recorded so nobody re-runs it.

## What is on screen

53 journeys, a practice set of 87 problems (Python everywhere; Java and C++ on 75), a
sorting/search/graph visualizer, SQL drills and stats flashcards. The shell has collapsible rails,
a settings dialog and a keyboard map. The pattern list filters and searches, difficulty is visible,
the sidebar and home lead with what is in play rather than all 53 journeys, the problem page is
stacked sections rather than tabs, and the journey page has a clickable trace, a chip row, a grid, a
tree (used by both trees and heaps) and a list (with a back-edge when it loops). The journey top bar is one row and carries the transport at its right, so play and
the scrubber are in view however far either column is scrolled.
