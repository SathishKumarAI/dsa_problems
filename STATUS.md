# STATUS — read this when you return

Last session: **2026-09-12**, three things in one sitting — `docs/explained/` (B64), **batch 7**
(107 → 127 problems, B65) with an **arc** on every one of the 127, and the readability pass the
arcs exposed (B66). Before that: 2026-09-09. Journeys went **5 → 87**, the practice set's Java/C++ hole was closed,
the UI got the pass it had been owed since the set tripled in size, the tree and list panels
finally have something rendering them — and then eleven PRs (#71–#81) closed **ten backlog items**:
the differential gate went from blind on 14 problems to blind on none, and four of the five things
it fixed on screen were found by MEASURING rather than by reading.

## The spec checklist

`docs/SPEC-CHECKLIST.md` walks the Widest Container build prompt's 34-line checklist item by item
with the evidence for each. **33 ticked, one deliberately not**: removing the responsive
breakpoints, which was asked directly and answered "keep responsive", and which `test:ui` also
depends on in two checks.

## Where it stopped

`master` holds everything through **#85** (B64). `feat/problems-batch-7` adds batch 7, the arcs and
the readability pass on top, open as **PR #86** and not yet merged.

**Batch 7 (B65).** Twenty problems filling the thinnest patterns first — four trees, three graphs,
three dp, two each of heaps, stack, sliding-window, binary-search and arrays-hashing. **127
problems, 87 journeys**, so forty now fall back to the static walkthrough player (B63, whose
count this doubled). The mutation gate found three REAL holes in the new vectors and was right
about all three; seven further survivors are argued equivalences, four of them the comment trap.

**The arc (B65).** `Problem.arc` — one paragraph naming the idea the whole ladder applies and the
rungs to know cold. All 127 carry one. It renders under the ladder and at the foot of every
explainer page, and never while a journey's ladder is capped.

**Readability and the surface (B66).** Measured before touching anything: 13 nodes below WCAG AA
on the problem page (worst **1.02:1** — an opacity is not a shade) and 51 below 13px. The scale
was one step low and **154 raw Tailwind sizes across 39 files** bypassed it. After: **0 below AA,
0 below 13px on any route**, and the only sub-scale type left is the 7px legend mark. The palette
did not change; the light in the room did (`docs/DESIGN.md` §The surface).

**The explainer pages (B64).** `npm run docs:explained` writes `docs/explained/<id>.md` for all 107
problems from `src/data/problems/**`, through the app's own `ladderOf` — so a page cannot disagree
with the problem page, and `scripts/gen-explained.test.mjs` fails the build the moment one drifts.
Journey acts are deliberately not read (the ledger gates them; a file on disk cannot). The runnable
script at the foot of each page renames each rung's entry point and drives them all from the
`vectors.mjs` cases: **107 of 107 ran clean under CPython**. Next: B65, the road from 107 problems
to 500, twenty per branch — the pages fall out of each batch for free.

**107 problems, 87 journeys.** The set passed a hundred on 2026-09-09 (B53): twenty new problems in
arrays-hashing, two-pointers and linked-list, each with **five** approaches rather than the usual
two or three — 100 rungs, 300 code blocks, all three languages on every rung. Those twenty are the
only problems without journeys, which makes them the first in the repo to render the static
walkthrough player since it was written. That is exactly the case B61 decided to keep it for, hours
before the batch landed.

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **680 tests** |
| The interface, in a real browser | `npm run test:ui` | **154 checks**, 0 failed (re-run after the type scale moved) — including the panel audit, which asserts now (B60) |
| Every Java and C++ block compiles | `npm run verify:code` | **752 blocks**, 0 failed |
| …and agrees with the Python | `npm run verify:run` | **4294 comparisons**, 0 disagreed (2026-09-12, batch 7 included) — and **nothing** it cannot marshal: `NOT_YET_RUNNABLE` is empty (B30, B62) |
| …on cases strong enough to notice | `npm run verify:vectors` | **501 mutants, 91% caught**, 0 survived — 38 allowed as equivalent, each with an argument |

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
Zero static walkthroughs remain, **every** translation is now RUN rather than merely compiled, and
the UI backlog is empty of small items. What is left is content and new surfaces.

`docs/BACKLOG.md` P0 opens on these in the same order, so "pick the top unchecked P0" and this
list agree.

| Order | Item | Branch | Done when |
|---|---|---|---|
| 1 | **B63** — journeys for the twenty new problems | `feat/journeys-batch-7` | 107 journeys for 107 problems. Each one DELETES that problem's `walkthrough` in the same commit — `problems.test.ts` forbids carrying both |
| 2 | **B12** — command palette | `feat/command-palette` | Ctrl/⌘K reaches any page, act, pattern or problem, and the disclosure rule holds inside it |
| 3 | **B10** — progress dashboard | `feat/progress-dashboard` | Acts done, quizzes passed, streak, XP — the data is already in the store, and `store.test.ts` now covers the reads |
| 4 | **B9** — roadmap page | `feat/roadmap` | The DAG replaces the flat home grid for the journey track |
| 5 | **B16** — stall analytics | `feat/stall-analytics` | Seconds per act and quits, local only; it is what makes B10 say something an author can act on |

**Start with B63.** Twenty problems currently teach through a static walkthrough, which is the
weaker half of this product — no earned ladder, no corner cases in play, no quiz gate. The set is
also unusually well set up for it right now: those twenty carry FIVE rungs each, so the derived
journey has more to work with than any previous batch, and every rung is already run against the
Python in three languages.

Gates: `npm run check` always; `npm run test:ui` for anything on screen (1, 3, 4, 5);
`verify:code` / `verify:run` / `verify:vectors` for anything touching a code block (1, 2).

**Eleven items closed on 2026-09-09** — B30, B61, B62, B58, B59, B45, B18, B19, B60, B36 and F5,
across PRs #70–#81. What each one cost and what it found is in `docs/WORKLOG.md`; the four findings worth
carrying are in the traps below.

### What the ten items found (2026-09-09)

### B30 — the structural gate

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

### B61 — decided: KEEP the static player
`step-player.tsx` is unreachable today — 0 of 87 problems carry a `walkthrough` — and it stays.
Deleting it would make "a problem without a journey" unrenderable, which turns every future content
batch into a journey batch too. One unreachable component is cheaper than a rule about how work may
be sliced. The `test:ui` pin stays and fails the moment problem 88 makes it reachable, which is when
this is worth re-reading.

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

- **`mutate.mjs --suggest` will propose an input the problem's own constraints forbid.** Its case
  for merge-sorted-array had `a` unsorted; for find-all-duplicates it used a `0` where the values are
  1..n. Adding either would assert on undefined behaviour and pin a bug in place. A survivor whose
  only distinguishing input is illegal is an EQUIVALENCE — write the argument in
  `KNOWN_EQUIVALENT` instead.
- **The mutation engine does not skip comments.** Two next-permutation survivors were edits to a `#`
  line, which cannot change what runs. Check the line before hunting for a case.
- **Six writers and one shared file is a guaranteed collision.** The agents that wrote batch 6 were
  kept out of the barrels, `data/index.ts` and `vectors.mjs` on purpose; `scripts/wire-batch.mjs`
  does that part once, from what is on disk. It is idempotent, so it can run after each batch lands
  rather than only at the end.
- **`prettier --write` on a glob reformats files nobody touched.** It pulled ten unrelated
  localsmith and test files into the batch-6 diff. Read `git diff --cached --stat` before
  committing and restore the ones that are pure formatting churn.
- **A background command that itself backgrounds with `&` does not survive.** The differential
  re-run wrote an empty file and reported success. The output file having zero lines is what caught
  it — a gate that reports nothing is not a gate that passed.

- **`cn()` deletes a named type step when a colour follows it.** `cn("text-display", "text-chart-3")`
  returned the colour alone: tailwind-merge cannot tell `text-meta` from `text-muted-foreground`,
  because both are `text-<word>`, so it files the size under colour and keeps the last. That is why
  the sub-scale `text-[10px]` literals existed — an arbitrary size is recognised and survives.
  `lib/utils.ts` teaches the merger the six names; `lib/utils.test.ts` pins it. **Anything that
  LOOKS applied and renders wrong is a merge, not a typo.**
- **`tsc -b` is incremental, so a green `npm run check` right after an edit is not proof.** A cast
  that a cold `tsc` rejects rode into master behind a build-info file that was never rechecked. If a
  change touches types, look at whether tsc actually recompiled the file.
- **Measure the built app, not the source.** `vite preview` serves `dist/`, so a UI measurement
  taken without `npm run build` first is measuring the previous change. Two of this session's
  measurements were wrong for exactly that reason before anything else was.
- **A bash heredoc eats one level of backslashes.** A patch script written that way turned a JS
  regex escape into a literal control character inside a template literal, so `paramTypes` silently
  stopped matching — every C++ block then got the wrong node type and would not build. Use the
  editing tools for anything carrying a regex, or read the file back before trusting it. This very
  trap had to be written twice, for the same reason.

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

87 journeys, a practice set of **107 problems** (all three languages on all 107; the twenty newest
carry five approaches each and a static walkthrough until B63 gives them journeys), a
sorting/search/graph visualizer, SQL drills and stats flashcards. The shell has collapsible rails,
a settings dialog and a keyboard map. The pattern list filters and searches, difficulty is visible,
the sidebar and home lead with what is in play rather than all 87 journeys, the problem page is
stacked sections rather than tabs, and the journey page has a clickable trace, a chip row, a grid, a
tree (used by both trees and heaps) and a list (with a back-edge when it loops). The journey top bar is one row and carries the transport at its right, so play and
the scrubber are in view however far either column is scrolled.
