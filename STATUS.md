# STATUS — read this when you return

Last session: 2026-09-08. Journeys went **5 → 46**, the practice set's Java/C++ hole was closed,
and the UI got the pass it had been owed since the set tripled in size.

## Where it stopped

`master` holds six merged PRs from this session (#49–#56). One branch is open and green:
**`feat/ui-audit-and-fixes`**, seven commits, both gates passing — that is the UI work, and it is
ready to merge.

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **356 tests** |
| The interface, in a real browser | `npm run test:ui` | **83 checks**, 0 failed |
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
4. **The UI pass** (open branch) — three agents in parallel on disjoint files, then integration.

## The next action

1. **Merge `feat/ui-audit-and-fixes`.** Both gates green. Then:
2. **B41 is half done.** The grid / tree / list panels exist (`features/journey/shape-views.tsx`)
   and the grid is proved by the `count-the-islands` journey. **The tree and list views have never
   been rendered by anything** — that is stated in their commit and it is the first thing to fix.
   A tree journey (`max-depth`) and a list journey (`reverse-list`) would prove both; each needs a
   decision first about how a tree or a list arrives as `nums`, since `Cell` has no null. The grid
   solved the same problem by arriving flattened with a `cols` param, and the tree's level-order
   slots want the same treatment with a sentinel.
3. **B51** — six array-shaped problems still unwritten, all unblocked: valid-anagram,
   group-anagrams, isomorphic-strings, permutation-in-string, rpn-eval, sort-by-frequency.
4. **B52** — `stair-ways` and `counting-bits` take a single number, not a row. The stage has no
   shape for "a table being filled" yet.
5. **B53** — the set holds 87 problems, so **a hundred journeys needs 13 new problems first**.
   Roughly 3× the cost of a journey each. Only worth starting once the 87 all have one.

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

## What is on screen

46 journeys, a practice set of 87 problems (Python everywhere; Java and C++ on 75), a
sorting/search/graph visualizer, SQL drills and stats flashcards. The shell has collapsible rails,
a settings dialog and a keyboard map. As of the open branch: the pattern list filters and searches,
difficulty is visible, the sidebar and home lead with what is in play rather than all 46 journeys,
the problem page is stacked sections rather than tabs, and the journey page has a clickable trace.
