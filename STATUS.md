# STATUS — read this when you return

Last session: 2026-09-09. Journeys went **5 → 87**, the practice set's Java/C++ hole was closed,
the UI got the pass it had been owed since the set tripled in size, the tree and list panels
finally have something rendering them — and the differential gate stopped being blind to 14 of the
87 problems (B30), which caught a real Java bug on its first run.

## The spec checklist

`docs/SPEC-CHECKLIST.md` walks the Widest Container build prompt's 34-line checklist item by item
with the evidence for each. **33 ticked, one deliberately not**: removing the responsive
breakpoints, which was asked directly and answered "keep responsive", and which `test:ui` also
depends on in two checks.

## Where it stopped

`master` is clean and holds everything: **#49–#68**. Nothing is open, nothing half-done. The set is
**complete**: 87 journeys for 87 problems, all three languages, no static walkthroughs left.

The last three: the panel audit (#67), the eleven translated problems and their journeys (#65, #66),
and the final eight that closed the set (#68).

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **649 tests** |
| The interface, in a real browser | `npm run test:ui` | **132 checks**, 0 failed |
| Every Java and C++ block compiles | `npm run verify:code` | **412 blocks**, 0 failed |
| …and agrees with the Python | `npm run verify:run` | **2084 comparisons**, 0 disagreed — and **one** problem it cannot marshal, `kth-largest-stream`, named in `NOT_YET_RUNNABLE` (B62) |
| …on cases strong enough to notice | `npm run verify:vectors` | **402 mutants, 92% caught**, 0 survived |

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
7. **The audit follow-ups** (#61) — V8 (the ladder framing), V9 (the phone legend) and V10 (the
   sweep that found nothing, which is the result).
8. **Batch 5** (#62, #63) — twenty journeys for the tree, list and graph problems, which spent
   what B41 proved. Every three-language problem had one by the end of it.
9. **Theme and chrome** (#64). dark/light/system had existed in `theme-provider.tsx` since the
   shell was built and nothing on screen offered it; light was the shadcn grey, which flattened the
   chart roles, so it is Catppuccin Latte now. The sidebar footer went from three rows to one.
10. **The translation pass and the last eleven** (#65, #66). 44 Java/C++ blocks, then journeys for
    the problems they unblocked — which closed **B54** by actually deleting the ASCII fallback and
    the `Frame.text` field.
11. **The panel audit** (#67). Eight panel kinds measured at their largest presets: no overlaps, no
    overflow, min cell 40px. It found four raw font sizes below the type scale inside the panels,
    fixed them, and left the densest panel pinned in `test:ui`.
12. **The last eight** (#68) — B51 and B52. **87 journeys for 87 problems**, and the milestone
    broke the V9 legend check, correctly: with every problem journeyed nothing renders the static
    player any more. That check was replaced by one that pins the new fact (B61).

## Next session — do these, in this order

**87 journeys for 87 problems.** Every problem in the set is built all the way down: a story act,
an approach ladder earned one rung at a time, corner cases taught in play, and three languages.
Zero static walkthroughs remain, and every translation but one is now RUN rather than merely
compiled. So the next work is a decision that blocks the next content batch, then the small stuff.

`docs/BACKLOG.md` P0 opens on these in the same order, so "pick the top unchecked P0" and this
list agree.

| Order | Item | Branch | Done when |
|---|---|---|---|
| 1 | **B61** — keep or delete `step-player.tsx` | `refactor/decide-static-player` (or a docs-only commit if the answer is "keep") | The backlog row is checked with the decision and its reason; if deleted, `Problem.walkthrough`, the `Frame` type and the `test:ui` pin go with it in the same commit |
| 2 | **B58** — four raw font sizes outside the panels | `fix/type-scale-outside-panels` | Each of the four re-measured at `text-meta`, no clipping in the 48px rail; `npm run test:ui` green |
| 3 | **B59** — the drawer's 288px | `feat/testcase-drawer-placement` | A design call written down, then built or dropped — measured stage width quoted either way |
| 4 | **B62** — the one problem that is not a function | `feat/localsmith-stateful-class` | `NOT_YET_RUNNABLE` is **empty**; `kth-largest-stream` driven as a script of calls |
| 5 | **B53** — thirteen new problems | `feat/problems-batch-6` | Only after B61 answers who owns a problem authored without a journey |

**B30 is done** (2026-09-09). What it bought, and what it cost, is the entry below.

Gates for any of them: `npm run check`, plus `npm run test:ui` for 1, 2 and 3, plus
`npm run verify:code` / `verify:run` / `verify:vectors` for 4 and 5.

### B30 — shipped, and what it found

**1676 → 2084 comparisons, 0 disagreed. `NOT_YET_RUNNABLE` went 14 → 1.** The one real finding:
**invert-tree's iterative Java rung threw `NullPointerException` on every case, including the empty
tree** — `ArrayDeque` refuses `null` and the Python it mirrors pushes `None` deliberately. It had
compiled cleanly since the day it was written. Fixed by `new LinkedList<>()`, which keeps the block
line-for-line with the Python. The design, for the record:

 `verify:run` executes every Java and C++ block against the repo's own
Python; it cannot marshal a linked list or a binary tree, so **14 problems are checked by a compiler
and nothing else**. They are LISTED in `NOT_YET_RUNNABLE` rather than absent, which is the
difference between a known gap and an invisible one.

**Where the code is.** `scripts/localsmith/run.mjs` marshals arguments by emitting LITERALS into a
generated driver: `lit.java` / `lit.cpp` around line 155, and `CPP_TYPE` at line 181. Between them
they know `int`, `string`, `int[]`, `int[][]`, `string[]`.

**What to add.** Two param shapes — `list` (a row of ints) and `tree` (level order with nulls) —
and the return shapes `list`, `tree`, `node`. Each of the three drivers needs a node type, a
**builder** from the literal, and a **serialiser** for the blocks that return a structure.
`scripts/localsmith/verify.mjs` already carries the Java and C++ node declarations in its `NODES`
constant; lift those rather than writing them twice. Python needs its own `ListNode`/`TreeNode` in
the driver preamble, because `has_cycle` and `max_depth` are duck-typed and declare none — the
blocks that DO declare one use the same field names, so a redefinition is harmless.

**Scope.** 13 of the 14 are reachable this way. `kth-largest-stream` is a stateful class rather
than a function and stays listed. Two need care: `cycle-detect` wants a second scalar naming the
index the tail links back to (the journey already models it exactly that way), and
`middle-of-list` returns a NODE — canonicalise it as the list from that node onward.

**Signatures, already collected:**

```
reverse-list         reverse_list(head)                     list  -> list
cycle-detect         has_cycle(head)                        list + cycle index -> bool
merge-two-sorted     merge_sorted(a, b)                     list, list -> list
middle-of-list       middle_node(head)                      list  -> node
palindrome-list      is_palindrome(head)                    list  -> bool
remove-nth-from-end  remove_nth_from_end(head, n)           list, int -> list
max-depth            max_depth(root)                        tree  -> int
validate-bst         is_valid_bst(root)                     tree  -> bool
level-order          level_order(root)                      tree  -> int[][]
same-tree            is_same_tree(p, q)                     tree, tree -> bool
invert-tree          invert_tree(root)                      tree  -> tree
balanced-tree        is_balanced(root)                      tree  -> bool
bst-ancestor         lowest_common_ancestor(root, p, q)     tree, int, int -> int
```

### B61 — decide about the static player (S)
`step-player.tsx` is unreachable: 0 of 87 problems carry a `walkthrough`. It is the fallback for a
problem authored before its journey, so deleting it means every new problem must ship with a journey
on the same branch. A `test:ui` check pins the fact and fails the moment that changes. Decide it
before B53 adds problem 88 — not after.

### B53 — thirteen new problems, for a hundred journeys (XL)
The set holds 87 and every one has a journey, so "a hundred journeys" is now exactly "thirteen more
problems". Each needs statement, constraints, hints, the ladder, the Python oracle, Java and C++,
and vectors strong enough for `verify:vectors` — roughly three times the cost of a journey. Answer
B61 first.

### B58, B59 — the panel-audit follow-ups (S each)
Four raw font sizes below the scale outside the panels, and the design call on whether the
test-case drawer should stop taking 288px from the stage.

### Also open, unchanged
B42 (trace frames out of the Python — measured and demoted), B43 (Java/C++ tabs on derived acts),
B45 (the problem page spoils the ladder), B60 (run the panel audit on a schedule), and the older
F-items.

## Traps this session added to the list

- **`ArrayDeque` refuses `null`, and a tree walk pushes nulls on purpose.** invert-tree's iterative
  Java rung mirrored its Python line for line — `stack.push(node.left)` with a null check on the way
  out — and threw `NullPointerException` on every input, including the empty tree, from the day it
  was written. It compiled cleanly for as long as it existed. `LinkedList` takes nulls; use it
  wherever a translation pushes a child that may be absent.
- **A gate that lists what it cannot see is worth ten times one that omits it.** The 14 problems
  were named in `NOT_YET_RUNNABLE`, so closing the gap was a morning's work against a known list
  rather than an audit of 87 problems looking for the ones nobody had run.

- **The store caches per key, so writing `localStorage` while a page is mounted is undone.** Every
  attempt to unlock acts from the console failed silently until the write happened on a DIFFERENT
  route, followed by a real navigation — which is exactly what `test/ui-smoke.test.mjs` has always
  done. Read the harness before fighting the app.
- **Applying a preset restarts the act.** An audit script that picked the act and then the preset
  measured the story act fourteen times and reported "0 cells" without failing.
- **A backslash in a template literal that is sent to the page is consumed twice.** `/^\d\d/`
  written in a test file arrives as `/^dd/`. Use a character class — `/^[0-9][0-9]/` — and the
  question stops being one about escaping.

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

87 journeys, a practice set of 87 problems (**all three languages on all 87**), a
sorting/search/graph visualizer, SQL drills and stats flashcards. The shell has collapsible rails,
a settings dialog and a keyboard map. The pattern list filters and searches, difficulty is visible,
the sidebar and home lead with what is in play rather than all 87 journeys, the problem page is
stacked sections rather than tabs, and the journey page has a clickable trace, a chip row, a grid, a
tree (used by both trees and heaps) and a list (with a back-edge when it loops). The journey top bar is one row and carries the transport at its right, so play and
the scrubber are in view however far either column is scrolled.
