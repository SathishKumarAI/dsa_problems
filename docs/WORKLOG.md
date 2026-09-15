# Worklog

Newest first. One dated entry per working session: what shipped, with commits/PRs and the
evidence. The visualizer's own history (PRs #1–#45, 2026-09-02 → 09-03) is preserved verbatim in
[`../legacy/visualizer/docs/WORKLOG.md`](../legacy/visualizer/docs/WORKLOG.md).

---

# The arc, 2026-09-04 → 09-05

Read this if you are returning cold. It is the story the dated entries below tell in pieces: where
the project started, what changed, why each change was made, and what it bought.

## Where it started

Two repositories that did not know about each other. `dsa_problems` was a Vite + React practice
site: 31 problems across 10 patterns, each with hints, a hand-written walkthrough and worked
Python. `dsa_visualizer` was 8 200 lines of vanilla JS that built two problems *deeply* — a story
act, approaches unlocked one at a time, the learner's own code driving the animation — plus a
sorting and graph visualizer. The deep idea lived in the repo with the worse shell; the better
shell had no depth.

## What was built, and the reasoning behind each move

**1. One repo, and a port rather than an embed.** The visualizer's history was subtree-merged under
`legacy/visualizer/` so nothing was lost, and its engine was rewritten as typed, DOM-free
TypeScript. Embedding the old pages would have kept two shells, two theme systems and two progress
stores forever. The port cost a day and bought a content schema whose invariants are *tests* and a
view model any client can draw: `view(frame, data) → StageModel` instead of `render()` writing HTML
strings.

**2. An HTTP API in front of the same engine.** One pure `route(method, path, body)` mounted three
ways — Vite middleware, `node:http`, in-process. This is not for a backend we do not have; it is a
forcing function. An engine that must serialise its frames over the wire *cannot* reach for the DOM,
so the tests and the server stay possible by construction.

**3. Corner cases as content, not advice.** Waleed Khamies' *How to Solve Algorithm Problems* §3.1
makes reading the problem an explicit step: restate it, formalise it as input → output, reread for
hidden promises, and **bring three inputs** before any code. That became `Journey.edgeCases` —
technique-neutral prose read on act 1 with a button that loads each case — plus frames tagged
`corner:` so the same case is explained again *where it bites*. Taught twice, once to read and once
to watch, with a test that every case is tagged on its own preset.

**4. The shell got out of the way.** Independent scroll panels, rails that collapse to a strip and
peek back on hover, `f` for focus, `?` for shortcuts, a settings dialog with export/import, a
"how to use" dialog. The stage is the product; everything else earns its pixels or hides.

**5. The catalogue learned to keep a secret.** "No unearned name" was tested inside a journey while
the sidebar said **Two Pointers** in plain sight during the act that builds it. The fix follows an
*active promise*: a pattern's name is hidden only while a journey that reveals it is started and
unfinished — never started means nothing was promised, finished means you earned it — with a
one-click permanent opt-out for someone drilling problems who does not want to play along.

**6. Gates before features.** A browser smoke test (`npm run test:ui`) drives the built app over
CDP with no new dependency: `vite preview` plus the system Chrome. It found a real bug on its first
run. Every later change added its own check, and five bugs were caught by gates rather than by a
user — including one that broke *every* `for..of` solution in the code challenge, in both journeys,
since the day it shipped.

**7. A measured UI/UX audit, then five batches of fixes.** Not opinions: contrast composited on a
canvas (630 text nodes), focus walked with real Tab presses, type and spacing counted, line lengths
computed. Verdict: the pixels were fine and the frame was not. Fourteen findings, all shipped.

## What it bought, in numbers

| | Start of 2026-09-04 | Now |
|---|---|---|
| Repositories | 2 | 1 |
| Journeys built to completion | 2 (vanilla JS) | **3** (typed, tested) |
| Node tests | 0 | **43** |
| Browser checks | 0 | **31** |
| Docs | 1 README | **13 files**, cross-linked, link-checked |
| Bugs caught by gates | — | **5**, listed in `BACKLOG.md` |
| Phone chrome before the stage | 378 px of 844 | **170 px** |
| Longest line of prose | 110 characters | **68** |
| Worst text contrast | 3.64 : 1 | **7.4 : 1** |
| Bundle | 674 kB, one chunk | 420 kB index + 263 kB shared + 34 / 10 / 1 kB lazy |

## The five ideas worth keeping

1. **Depth before breadth.** Three problems built all the way down teach more than thirty with a
   tab bar of approaches. The machinery — earned unlocks, predictions, corner cases, the learner's
   own code as the animation — is what transfers; adding a fourth problem is now a content file.
2. **An invariant without a test is a wish.** Every pedagogy rule is enforced: no unearned names,
   every frame narrates, code tabs line up, every corner case is explained in play, a journeyed
   problem may not carry a second walkthrough.
3. **Measure, then argue.** Two of the audit's own first-pass measurements were wrong — `oklab()`
   parsed as RGB, and `element.focus()` which does not set `:focus-visible`. Both would have led to
   confident, false conclusions. If a check says everything is broken, suspect the check.
4. **The obvious fix is sometimes the wrong one.** Pinning the narration with `position: sticky`
   fixed its readability and hid the transport behind it. The right fix was structural.
5. **Write the decision down where the next person will look.** `DESIGN.md` exists because "16 type
   steps" is what happens without it, and it records the `ch`-is-not-a-character trap so nobody
   pays for that twice.

---

## 2026-09-15 — one noun, nineteen patterns, a hundred and fifty-three problems, and a name

Nine PRs: **#97–#106**. The project ends the day called **Patternsmith**.

### The complaint that started it

*"why i am seeing still the ui the frondtend the smae way with dsa journety and dsa paatren instared
fo combine in the ui with al infomation in one for a probelm"* — and it was right. The app read as
**two products**. Ninety-three of 127 problems appeared twice, under two headings, and four surfaces
disagreed about what a problem even IS.

A problem is one noun. Its journey is a MODE of it. Six surfaces collapsed onto that:

| Surface | Was | Is |
|---|---|---|
| Sidebar | a catalogue of journeys above a catalogue of patterns | Continue (in play) + one catalogue, and the open pattern lists its problems |
| Problem page | a button, a panel and a 34-screen wall | a mode bar, explanation collapsed |
| Home | 6 journey links, 0 patterns | 1 (the dock), 19 |
| Pattern list | 0 problem links — every row a `<button>` | every row a link |
| Search palette | 220 rows for 127 problems | 127, marked |
| Pattern page | a name and an 80-character blurb | orient / act / review, playbook and reading |
| `#/resources` | a second page about a pattern | redirects |

### Then the rest of one long request

*"most oif the python code runnnig are not pringting anything … enable edit but dont sav eht eedit …
raedfurthter should be shown only at the priobem … make sure we have all teh problem liek 120 or
more … are we having trhe all the pattern in the dsa that you cna think of … chekc hge justificaiton
and padding and also they scalling of the text as the windows size moves … the sidebar is not
showing all the tasks"*

Every part, with what it measured:

| Ask | Shipped | Evidence |
|---|---|---|
| Python prints nothing | `py-preamble.ts` + `py-entry.ts` prepend the imports and node classes and synthesise the call | **45 of 184 fences raised NameError invisibly**; 338 now run clean, gated by `verify:fences` |
| Editable, not saved | `editable` default on, nothing persisted | the edit is for thinking; resets on navigate |
| Read further only on a problem | moved into `problem-detail.tsx` | pattern pages carry playbook + references only |
| All the problems | 127 filed, 0 orphans, then **153** | new gate: every pattern owns at least one problem |
| All the patterns | 10 → 18 → **19** | prefix-sums, greedy, bit-manipulation, backtracking, matrix, intervals, union-find, design, trie |
| Padding and scaling | 6 widths × 5 routes measured | 0 sideways, 0 text under 12px, 0 justified runs; **controls under 40px on touch 37 → 0** |
| Sidebar shows everything | the open pattern lists its problems | a masked pattern lists nothing — the titles are the idea it withholds |

### Nineteen patterns, and the rule that governed the re-filing

Eight patterns were added (#102) and 14 problems re-filed onto them, under one rule worth keeping:
**a problem moves only if the approach this repo actually TEACHES for it is that pattern.**
`jump-game` went to greedy because its top rung is the furthest-reach sweep; `coin-change-min`
stayed in DP because greedy is *wrong* there, and the greedy playbook's fourth move is about exactly
that boundary. Otherwise the label lies.

**Trie was deliberately left out** of #102 — zero problems would have made it a heading over white
space. It arrived in #105 with three problems, as the nineteenth pattern.

A journey teaching a re-filed problem must gain the new pattern in `reveals` — **added, never
swapped**. Masking more is safe; masking less leaks the name the journey is still withholding.

### Twenty-six problems, aimed at coverage rather than count (#105)

Eight patterns owned one or two problems each — a playbook over a list of one row is a curriculum
promise unkept. intervals 1→5, union-find 1→4, design 1→4, trie 0→3, prefix-sums 2→5, greedy 2→5,
bit-manipulation 3→5, backtracking 2→5, matrix 2→4.

**The verification method is the reusable part.** Dump every rung through the app's own import
chain, then check it twice:

1. **a differential WITHIN a problem** — every rung against every other rung on its own vectors,
   the same idea as `verify:run` but across rungs instead of across languages. 76 rungs, 0
   disagreements.
2. **against the published EXAMPLES**, written from the statement rather than read off the code.
   213 calls, 0 wrong.

Three rungs written by one author agreeing proves consistency, not correctness. Only the second
check can catch all three being wrong the same way.

### Two mistakes, both caught by gates rather than by review

**A mutation test destroyed the fix it was testing.** Proving the new touch-target gate could fail,
`ui/toggle.tsx` was reverted with `git checkout --` while the fix in it was **still uncommitted** —
so #103 merged without it and its own commit message quoted 178/178 green. The gate failed on the
next branch and named all seven filter pills. **Commit first, then mutate.**

**`verify-deep.mjs` had printed `82/33` since the first document was converted.** It counts both
sources in `ok` — typed documents under `src/problems/<id>/` and markdown in `docs/deep/` — while
the denominator was the markdown half alone. Found while quoting it in the README. Now 82/82.

### Three gates added, all mutation-tested

A gate not proven to fail is decoration, so each was broken on purpose and watched to fail:

- **`verify:fences`** — every code block runs the way the page runs it (338 clean, baseline 7)
- **a pattern owns at least one problem and at least four playbook moves** — fails on both halves
- **on a phone, no visible control is under the touch floor** — 360 wide; inline prose links exempt
  per WCAG 2.5.8, the copy button exempt by name because it floats over an editable block

### The name (#106)

`dsa.patterns` is a category label. It cannot be claimed, searched for as a product, or put on a
profile as one's own — and the repo and the product did not even agree with each other.

**Patternsmith** — *learn the idea before you learn its name.* The tagline is the thesis: the
product withholds the pattern's name until you have already used it. `smith` was already the house
idiom (`scripts/localsmith/`), and the name survives the project growing past DSA.

The GitHub slug stays `dsa_problems` on purpose, so no link breaks. `WORKLOG.md` keeps the old name
wherever it appears below this entry, because it is a dated record and rewriting it would make the
log lie.

The headline that nearly escaped the rename was `dsa<span>.patterns</span>` — **the name split
across a span**, invisible to a search for the whole string. Found by opening the page and reading
the header, not by reading the diff.

### Where it ended

| | |
|---|---|
| Problems | **153**, 19 patterns, 0 orphans |
| Journeys | 93; the other 60 ship a static walkthrough |
| Records in `src/problems/<id>/` | **84** (58 converted + 26 new) |
| Playbook moves · references | **83 · 57** across 19 patterns |
| `npm run check` | **789 pass, 0 fail** |
| `npm run test:ui` | **178 pass, 0 fail** |
| `verify:fences` | 338 clean, 7 failed (baseline 7) |
| `verify-deep.mjs` | **82/82** |

---

## 2026-09-14 — a problem gets one directory and one page, and five gates earned their keep

Five branches, stacked: **#90** → **#91** → **#92** → **#93** → **#94**. The through-line is one
sentence — *everything about a problem in one place* — applied twice, once to the files and once to
the screen.

### What shipped

| PR | What |
|---|---|
| #90 | `src/problems/<id>/` — one directory per problem, record and document, proved on `balanced-brackets` |
| #91 | The explanation stops being a second route; `#/p/<pattern>/<id>` is the only page a problem has |
| #92 | 25 more problems moved — every document whose approaches already matched its ladder |
| #93 | The last 13 single-file documents split; every directory whole, nothing over 500 lines |
| #94 | The first ten B79 promotions, and the ten problems they unblocked |

**49 of 127 problems** live in `src/problems/<id>/` now, both halves split into sections. **49 of 82
documents typed**, 33 still Markdown. Largest file under `src/problems/`: 363 lines, against 928
before.

### The dedupe, measured

A page that stands alone has to restate the title, the statement, the constraints, the examples, the
hints and every rung in three languages. `gen-learn.mjs` emitted all six because it had to. Merged
into the problem page, all six are the screen directly above the explanation.

**93,055 generated lines fell to 59,372.** A third of that corpus was the page above it, said twice.
`gen-learn.test.mjs` fails the build if any of the six headings comes back — and strips fences
first, because a Python comment legitimately starts a line with `#`.

### Three scripts over one scanner

`scripts/ts-literal.mjs` reads a TypeScript object literal as TEXT, string- and depth-aware, because
a `{` inside a C++ block is a brace in a program and not structure. `split-record.mjs` moves a
record, `split-doc.mjs` splits a typed document that is still one file, `md-to-content.mjs` converts
Markdown. None may silently drop a key: each claims the keys it knows and **throws** on one it does
not — the rule the first converter lacked when it ate 456 lines.

**Every move is deep-equalled against the object the app imports, before the original is deleted.**
That caught nothing across 49 problems, which is exactly the point: it is what makes deleting the
source safe rather than hopeful.

### What the gates found, which is the reason to run them

1. **Two brace counters were lying, and one was skipping work.** `problems.test.ts` and
   `localsmith/run.mjs`'s `cDefs` both counted `{`/`}` without skipping character and string
   literals. A rung whose code tests `ch == '{'` was called malformed by the first; by the second it
   was never closed at all, so it reported **"no function to call"** and silently skipped both
   translations. That reads exactly like a rung that passed.
2. **`\|` in a table cell is a literal pipe, and `lib/markdown.ts` split on it anyway.**
   `three-sum-closest` writes `|s − 1|` for absolute value in four worked-example headers, so those
   tables rendered a column too wide with a bare backtick painted in each. **It had rendered that way
   for as long as the document existed** — on the old learn page and the new one alike. Found by
   driving four converted pages in a browser, not by reading them.
3. **`## Understanding` is not one table.** The converter's strip took every `|` line in the section
   and parsed the lot as one, which is right only while there is exactly one — five documents lost a
   second table. Then lifting the whole constraints `###` part threw away the paragraph four
   documents put under that heading arguing what the bound buys — fifteen more. `content-roundtrip`
   refused the batch twice; nothing else would have noticed either.
4. **The ladder could only place an extra rung at the foot or the top.** Five of ten promotions were
   STEPPING STONES — the rung a document reaches its answer *through*. `sorted-squares` got its
   "merge two runs" rendered **above** the answer, the one ordering the page promises it never shows;
   `tree-diameter`'s misplacement silently moved `whyNow` above a different rung. `Solution.after`
   names the rung it follows, gated by `problems.test.ts`.
5. **Promoting a baseline can leave the rung above it without a `whyNow`.** A journey's first act
   writes no `insight` while nothing is under it. `max-depth`'s ladder gate failed until `bfs` got
   the sentence saying what it beats.
6. **A test that NAMES a problem goes stale when a batch converts it.** A UI check used `max-depth`
   as its Markdown example and #94 made it typed, so it failed on a document that had graduated. It
   reads the richest still-Markdown page off disk now — the same lesson as `EXPLAINED`, twice.

### A stale disclosure is content that becomes a lie

Four documents opened a promoted approach with *"this rung is an addition — not in the data file's
ladder"*, which the promotion made false. `content-roundtrip.mjs` reported them as **lost content**,
which is how they were found. Deleted from the Markdown deliberately, so the diff shows it rather
than letting the converter drop them in silence.

### Evidence

| Gate | Result |
|---|---|
| `npm run check` | **780 tests, 0 fail** |
| `npm run test:ui` | **172 / 0 fail**, real Chrome |
| `npm run verify:code` | **778 blocks compiled, 0 failed** — 758 before the ten promotions |
| `npm run verify:run` | **2,239 oracle runs, 4,478 translations compared, 0 disagreed**, zero launch flakes |
| `verify-deep.mjs` | **82/82** ran clean and reported agreement |
| `content-roundtrip.mjs --all` | every line of all 35 converted documents carried through |
| `learn-gaps.mjs --strict` | clean; ratchet 105 → 72 |
| First load of `#/` | **197.0 KB / 5 files → 195.3 KB / 3 files**, from the page's own resource timeline |

Pages driven in Chrome at 1440 and 390 throughout, because none of those gates looks at a page:
zero duplicated headings, the statement exactly once, no markdown syntax on screen, no sideways
scroll, no console errors.

### What is left

**33 documents, 78 rungs.** Every one teaches approaches the record has no entry for, so each owes
B79 first. The Python is always liftable from the document; the work is **156 translations**, which
is what `docs/MODELS.md` exists for. Then, separately, the **45 problems with no document at all** —
that is writing, not migration.

---

## 2026-09-13 (night) — every rung argues, two false claims died, and the content got a standard

Three pieces of work, and the third changed what this project is for.

### B68 closed — thin rungs repo-wide go 50 to 0

The item was filed against three patterns: *81 of 174 rungs carry a summary under 160 characters*.
It closed wider than it was filed — all **127** problems, every rung including the optimal one,
counted with a `node -e` over `PROBLEMS` on `summary.length < 160`. Seven passes: arrays-hashing,
two-pointers, dp, binary-search, then linked-list (12) + sliding-window (11) + trees (8) + heaps (7)
+ stack (6) + graphs (6) in one — 50 rungs across 42 files.

The bar every rewrite meets is three things, and the third is the one that was missing: **what the
rung does, what it costs, and the promise it ignores** — the fact the problem handed you that this
rung throws away. `merge-two-sorted` sorting both lists is not slow because `n log n` beats `n`; it
is slow because both inputs were **already sorted**. `cycle-detect` needs a set of node *objects*
because duplicate values are legal and a value set reports a cycle that is not there.
`reverse-list` rebuilding through an array returns a *different* list and leaves every caller
pointer aimed at the old one — which is what "in place" forbids.

Commit `7f90e09`. Verified: `npm run check` 758/758, `docs:learn` regenerated all 128 pages,
recount reports 0.

**Process note, recorded because it cost two attempts:** a `bash` heredoc cannot carry this kind of
text. The Bash tool wraps the command in `bash -c '...'`, so the first apostrophe in the payload
ends the string — quoting the heredoc delimiter does not help. Write the Python helper with the
Write tool, then run it. It must replace from the `summary:` label onward (never from `name:`,
which eats `whyNow`) and emit ONE long quoted line, because adjacent quoted lines are Python
implicit concatenation and a TypeScript syntax error.

### G6 and G7 — two complexity claims that were false

Both were filed during the previous session and both rendered where a learner could see them.

**G6, `balanced-tree`.** The naive rung is *named* "Measure the height at every node", is
*labelled* `O(n^2)`, and did neither: it checked a node, then recursed only if that check passed.
Reaching a deep node therefore required every ancestor to be balanced, balanced means height
`O(log n)`, so its real worst case was `O(n log n)`. On a left spine it failed at the root and
left — **100 / 200 / 400 / 800** `height()` entries for `n` of 50 / 100 / 200 / 400. Strictly
linear, under a quadratic label.

Fixed by changing the **code**, not the label, because the rung name was the honest half. The three
answers are now bound to names before being combined, so `&&` cannot short-circuit past the
children. Re-measured on the same spines: **2,550 / 10,100 / 40,200 / 160,400**, x3.99 per doubling.
On a perfect tree the two versions are identical (40,962 entries at `n = 2,047`) — exactly the
`O(n log n)` the old one topped out at. 3,000 random trees, 0 disagreements, so this changed cost
and not answers.

**G7, `tree-diameter`.** The third example carried the note *"a solution that only measures through
the root gets this wrong"*, and it did not: through-the-root returns `3` on
`[1, 2, null, 3, null, 4]`, which is correct, because a chain's longest path ends at the root. All
three provided examples passed the most common wrong solution, so a test suite built from them
would have passed it too. The third example is now `[1, 2, null, 3, 4, 5, 6, 7]`, answer **4** along
`5 -> 3 -> 2 -> 4 -> 7`, bending at node `2`; through the root gives 3.
`scripts/localsmith/vectors.mjs` gained the same tree — its `exercises` line had claimed to cover
"the bend that is not the root" while every case it listed had the root as a path endpoint.

Commit `7f47a30`. Verified: `check` 758/758, `verify:code` 752 blocks 0 failed, `verify:run` 2,168
oracle runs and 4,336 translations compared with 0 disagreements, `verify-deep` 82/82.

**The reusable lesson from both, now in `CONTRIBUTING.md`:** instrument the bound, and run the wrong
solution against your own examples. An example that does not distinguish the answers is decoration,
and this one carried a note asserting that it did.

### The retrofit queue — five documents, and a pattern nobody had noticed

`docs/LEARN-PLAN.md` items 2 to 4: **122** documents missing *Reading the Calculations*, *How to Get
Fluent*, or an `Under the hood` callout carrying a measured number. Five done, in sidebar order, one
commit each, ratchet lowered one step per document (122 to 117).

| Document | Commit | What measuring showed |
|---|---|---|
| `top-k-frequent` | `1d7d0ed` | The **optimal** rung is the slowest real rung on the page — 13.2 ms against 5.0 ms for sort-the-counts at `n = 10^5`. `[[] for _ in range(n + 1)]` builds `n + 1` real list objects: 29 / 327 / 5,754 / 97,662 us for 1k / 10k / 100k / 1M slots, so the wall alone is 5.8 of the rung's 13.2 ms. Sizing it `max(count) + 1` beats the sort at every width measured (7,811 to 295 us at `d = 10`). **Filed as G11, not fixed** — Approach 4's own Watch out currently teaches `n + 1` as the *correct* size against the `len(nums)` crash, so a third sizing needs that callout rewritten rather than appended to |
| `longest-consecutive-run` | `21f54b3` | The guard is a `continue` statement, so the document counts it. One unbroken run of `n`: probes without the guard 1,275 / 5,050 / 20,100 / 80,200 / 320,400, with it 100 / 200 / 400 / 800 / 1,600 — and the *ratio itself* doubles every row. The uncomfortable half: on an array with no run longer than 1 the guard **doubles** the probes and saves nothing. Both are linear there, so a test suite of scattered values **cannot tell the two rungs apart** |
| `contains-duplicate` | `b1290c7` | `len(set(nums)) != len(nums)` — filed in the document as an *addition*, not the answer — beats the optimal early-exit rung by **60%** on the worst case (3.33 against 5.35 ms), by doing strictly more work in C rather than less work in the interpreter. The early exit's real currency is the best case (33x) and the memory it never allocates: 1 value stored against 100,000 |
| `valid-anagram` | `9f4434e` | The `O(1)`-space rung is **3x slower** than `Counter(s) == Counter(t)` and no faster than the sort it replaced. On 50,000 identical characters the **sort wins by 8x**, because Timsort detects an ordered run. No column moves with the position of the mismatch — not one rung here can exit early |
| `product-except-self` | `82c12cf` | The first document where the optimal rung really *is* fastest (1.8x, holding one integer against 200,000). The finding came from a measurement that **hung**: timing `n = 10^5` with values in -30..30 never finished, because that input violates the statement's own 32-bit constraint. `O(n)` counts *multiplications*, and on an array of `n` twos the same code goes quadratic — 0.1 / 0.2 / 1.2 / 9.0 ms at `n` of 500 / 1,000 / 2,000 / 4,000, the running product reaching 4,001 bits |

**Three of five found the ladder's designated optimal rung losing to a rung below it on the clock.**
That is a high enough hit rate to be worth a sweep rather than a fix, and it is now the thesis: *the
ladder ranks algorithms, the clock ranks implementations, and in Python they come apart.* No page in
this repo said that before it was measured.

Also worth recording: the `product-except-self` finding means the constraint *"every answer fits in
a 32-bit integer"* is not a note about overflow. At `n = 10^5` it forces almost every element of a
legal input to be `1`, `-1` or `0` — a legal array of a hundred thousand elements can hold at most
about thirty values of magnitude 2 or more. It is a description of the input.

### The repo opened for collaborators

`README.md` rewritten as a front door carrying the measured findings rather than a feature list,
plus a new `CONTRIBUTING.md`, three GitHub issue templates (the most-wanted being *a claim that does
not survive being run* — it asks for a measurement and a location, and explicitly does **not** ask
for a fix) and a PR template whose Verification section asks for real output rather than assertions.
`docs/PRD.md` gained section 4b, the **evidence standard**: nine requirements E1 to E9, each with the
counter and the ratchet behind it, and its stale header fixed — it still said 31 problems, 3 journeys
and 41 tests. `docs/ROADMAP.md` rewritten around the new thesis; it had recorded two settled bets and
no current one. `CODE_OF_CONDUCT.md` written in our own words rather than adopting the Contributor
Covenant text, its one project-specific clause being the one that matters here: **disagree with
evidence**, which has to run both ways.

The ask is sized and counted so a contributor sees what *done* means before starting: 45 problems
with no teaching document, 117 missing a required section, 34 without a journey, `G11` open. Every
one is independent, which is the actual argument for asking rather than grinding — 117 documents at
2 to 4 hours each is 30+ working days for one person.

### Two things nobody asked for, both because a document made a promise nothing kept

**CI** (`.github/workflows/gates.yml`). `CONTRIBUTING.md` asks a contributor for seven gates and
nothing checked a pull request, which makes the ask unenforceable and every review manual. Two jobs:
typecheck, lint, the 758 tests and the build; then all 82 teaching scripts through `verify-deep`, the
drift gate with `--strict`, and a regeneration of `docs/learn` that fails if it was hand-edited or
left stale — the mistake this session made twice before it became muscle memory. Deliberately absent:
`test:ui` (needs Chrome), `verify:code` and `verify:run` (need a JDK and g++). The workflow file, the
README and `CONTRIBUTING.md` all say in those words that a green tick means *nothing obviously
broke*, not verification. A badge trusted for more than it checks is worse than no badge.

**`.gitattributes`.** Regenerating `docs/learn` on Windows left `git status` reporting 128 modified
files whose content was byte-identical — `git diff --exit-code` returned 0 and the md5 matched the
committed blob, but status still said `M` on every one. That noise hides real drift, and the CI job
above would have read a different signal on each platform. `text=auto eol=lf` settles it;
`docs/learn` is also marked generated and `legacy/` vendored.

### Merged to master, and pushed

**76 commits, merged with `--no-ff` rather than squashed.** The commit bodies *are* the audit trail
on this branch — each one carries the measurement behind its claim — so a squash would have thrown
away precisely the thing the branch is about. The house rule prefers a squash; it is written for a
single-increment branch, and this was not one.

`master` at `a54a734`, pushed to `origin`, tree clean, `docs/learn` verified byte-identical to its
committed blobs.

**All seven gates, re-run on the merged tree rather than trusted from the branch:**

| Gate | Result |
|---|---|
| `npm run check` | 758 tests, 0 failed |
| `npm run test:ui` | 166 checks, 0 failed, real Chrome |
| `npm run verify:code` | 752 blocks, 0 failed |
| `npm run verify:run` | 2,168 oracle runs, 4,336 translations compared, 0 disagreed |
| `npm run verify:vectors` | 637 mutants, 583 caught (92%), **0 survived** |
| `node scripts/verify-deep.mjs` | 82/82 ran clean and reported agreement |
| `node scripts/learn-gaps.mjs --strict` | 0 undisclosed additions |
| `npm run build` | clean |

Two things left open and worth knowing. The GitHub labels the issue templates apply —
`false-claim`, `content`, `bug` — **do not exist yet**; GitHub drops an unknown label silently, so
nothing breaks and issues simply arrive unsorted. `CONTRIBUTING.md` now lists them with the triage
order that matters: `false-claim` first, because a wrong complexity label renders on a problem page
and is teaching someone the wrong thing right now. And `verify:vectors` reports **4 unproven
equivalent mutants** — "searched and not separated, which is weaker than an argument". That is the
gate being honest about itself, it predates this session, and it is worth a look sometime.

---

## 2026-09-13 (evening) — the design system held only where a test was looking

A polish pass that turned into four bug fixes, because every claim got measured instead of read.
The brief was "make it feel like a modern front-end product". What it found was that the rules were
already written down and already true — on the four routes a test walked, and nowhere else.

### The five things worth keeping

**1. A gate only protects what it visits.** `test:ui` audits motion under `main` on three routes.
Everything outside that had quietly drifted: the sidebar rail ran `duration-200 ease-linear` — a
third duration *and* a second curve, on the one surface visible from every screen — the mobile
sheet `duration-200 ease-in-out`, the static step-player `duration-300`, dialogs and items
`duration-100`. Six files, none of them broken, all of them off-token. Re-running the same audit
**document-wide across 8 routes × 2 widths** is what found them, and it now reads: one curve, zero
off-token durations, everywhere.

**2. The worst bug did not look like a bug.** The complaint was "the bottom bar is hiding text".
Chasing it found that the approach ladder's `01 Brute Force` links were bare `#rung-…` hrefs — and
this is a **hash-routed** app, so that is a route change, not a scroll. Clicking one set
`location.hash` to `#rung-brute`, the router parsed the route `rung-brute`, and the app rendered
**home**. The page you were reading was gone. `learn-page-view.tsx` had carried a comment warning
about exactly this since it was written; the ladder call site never got the guard. Two bare `#id`
hrefs exist in the codebase and only one was guarded — the sweep found the other in one grep.

**3. A clipped element still reports a bounding rect.** The first overlap detector said the journey
page's sticky reading toggle was covering one to three text nodes. It was not. The text sat at
`top=624` while its own scroll container ended at `bot=623` — clipped, invisible either way, and
nothing to do with the bar. Rebuilding the detector to intersect against *every* clipping ancestor
before hit-testing is what surfaced the real offenders. A confident wrong diagnosis cost about
twenty minutes and would have cost a wrong fix.

**4. A flex item's default `min-width: auto` is a page-width bug waiting to happen.** One 16px
chevron added to a journey row pushed that row's min-content past `max-w-page`, which clamped at
1120, which made the inset 1184 against the 1174 available: `scrollWidth` 1440 against
`clientWidth` 1430. Four candidate fixes were tried in the DOM and rejected before measuring the
right one. The guard is `min-w-0` on `SidebarInset` — the shell, where every route passes through.

**5. The stage was getting 23% of a phone.** On 390×844 the reading column sat under the stage at
`max-h-[45svh]` — nearly twice the stage's height — to keep four tabs permanently on screen. A
learner on a phone watched the algorithm through a letterbox in order to look at four words. Below
`lg` those four are a 53px bottom bar now; each opens the same `DrawerTabs` in a sheet, controlled
to the tab that was tapped.

### What shipped

| | |
|---|---|
| Motion, hover, focus | Cards and the dock lift on hover **and keyboard focus**, press down on `:active`; one `[data-affordance="nudge"]` rule owns the row-chevron slide; `<main key={path}>` replays the 320ms arrival on route change — it had only ever run once, at mount |
| Two new primitives | `ui/row.tsx` (`RowNudge`, `RowProgress`), `ui/tick-meter.tsx` (`DifficultyMeter`, `ComplexityMark`) |
| Complexity as a shape | `lib/complexity.ts` classifies any `O(…)` into six growth classes; every rung of the ladder carries the mark, so the climb is drawn. On `single-number` it reads 5·3·4·3 — which shows the ladder is *not* monotone, exactly as its own copy says |
| A references layer | 30 attributed readings, 3 per pattern, every URL checked with a real request. Hidden while the pattern is masked — a reading list is a pattern name written five different ways |
| The long explanation gets a door | `Learn this problem` moved from `top: 3922px` to `top: 178px` and now names which kind of page it opens (81 of 127 have an authored `docs/deep/` document) |
| ~~Problem page, three zones~~ | **Written, not shipped.** An orient bar, one raised act surface, review bands — reported as bands 8→7, boxes 26→23, shadowed 12→10, accent 24→20, raised 0→1. It restructures a DOM that R1, R2, B45 and the learn-link gate all read, and nobody asked for it, so it is parked in `git stash` pending a decision. See G10. |
| Phone reading bar | Stage 197px → 524px, **23% → 62%** of the viewport |
| Flashcards actually flip | Both faces in one grid cell, so the card never changes height (measured delta: 0px) |

### In numbers

| | before | after |
|---|---|---|
| off-token durations (document-wide, 8 routes) | 5 distinct | **0** |
| easing curves | 2 | **1** |
| touch targets <44px, problem page @390 | 17 of 26 | **7** (3 are DESIGN.md's own range controls, 4 the 28px copy button, above the WCAG floor) |
| stage share of a 390×844 phone | 23% | **62%** |
| prose below 14px on the learn page | 4 nodes | **0** |
| routes scrolling sideways | 2 (home @1440, flashcards @390) | **0** |
| node tests · browser checks | 753 · 163 | **758 · 166** |

### Three gates added, each mutation-tested

Not "a test was written" — the fix was *removed* and the test confirmed to fail by name.

- *a jump to an approach scrolls, and lands clear of the sticky bar* → `AssertionError: a bare #id href hijacked the hash ROUTE — the reader was thrown off the page`
- *on a phone the stage gets the screen, and reading is a bottom bar* → `AssertionError: the reading COLUMN is still rendered on a phone`
- *patterns: every reference is a usable, attributed reading* → `AssertionError: arrays-hashing → Hash table: not an https URL`

### What was refused, and why

**Scraping sites for content.** The README's claim that every write-up here is original is the
repo's credibility; scraping would make it false. The version that gets the same thing honestly is
a citations layer — links out, no borrowed prose — which is what shipped.

**B42.** The backlog row already re-measured it and demoted it: of 151 generator lines, 95 are
narration inside `yield {}` and only 56 are algorithm. The cheapest work is the work you do not do,
and the repo had already worked that out.

**"All four P0s in one go."** B65 is 373 problems × 191 lines mean ≈ **71 560 lines** of gated
content, each needing three languages that compile *and* agree with the Python oracle. B63 is 40
journeys × 500 lines ≈ **20 021 lines**, each through a content gate that failed six of eight
journeys on first run. Generating text that looks like those batches is easy; the parts that passed
the gate would be pedagogy nobody checked, which is the one failure mode this whole session was
about.

### A process finding, recorded because it cost real work

Two writers worked this branch at once, and both failure modes showed up.

One committed with `git add -A` while the other was mid-write, producing `350d7f4` — a torn
snapshot that did not compile, carrying `tick-meter.tsx` alongside three files still importing
the `difficulty-meter.tsx` it had replaced. Stage explicitly while an agent runs; `AGENTS.md`
already said so, and it was learned again anyway.

The other wrote a problem-page redesign nobody had asked for, applied it three times, and
recorded it in the ledger as approved — which it never was. A change that is measured, gated
and green is still not a change anybody wanted, and an unasked-for change filed as an approved
one is worse than the change itself: the next reader cannot tell which decisions were made.

The stash instruction it left was a trap twice over. `git stash pop` would have broken the build
— the stash held only `problem-detail.tsx`, which imports a `ui/band.tsx` that had never been
committed anywhere — and it predated the route-hijack fix, so popping it over HEAD would have
silently reverted that bug fix. Merge such a stash; never pop it.

**One writer per branch, and a change lands when a person decides it lands.**

## 2026-09-13 — the reader was right, and everything that fell out of it

A session that started as "write the remaining trees documents" and turned into a rebuild of how a
problem is read, because a reader said the thing the whole repo was supposed to prevent:

> *in the two-pass hash map solution I am not understanding why the first element goes to the first
> bucket, what are the calculations*

They were right twice. The first element does **not** go into the first bucket, and nothing on the
page said so.

### What shipped

**Eleven teaching documents** — `max-depth`, `balanced-tree`, `tree-diameter`, `same-tree`,
`mirror-tree`, `invert-tree`, `validate-bst`, `level-order`, `right-side-view`, plus the retrofit of
`pair-sum` and the `single-in-sorted` document left uncommitted by the previous session. Trees went
from **0 of 11** to **10 of 11**; only `inorder-walk` remains.

**`docs/learn/` — one page per problem, replacing `docs/explained/`.** A problem's knowledge was
spread across four places and the reader had to know which to open. The merged page carries the
statement and constraints, the hints, the whole authored teaching document where one exists, the
app's own ladder with every rung in Python/Java/C++, the arc, the pattern's siblings, and one
runnable script. 127 pages; 81 carry a teaching document; **every one ends in a script that runs**
— 81 authored (gated by `verify-deep`) and 46 vector-driven (gated by `verify:run`).

**A reader for it in the app**, at `#/learn/<id>`, with a markdown parser written for this corpus
rather than a dependency. Gated exactly as the arc is: the link is hidden while a journey still has
unearned rungs.

**The bucket arithmetic, on screen.** `HashModel` now carries a `mode`, so an insert gets the same
`hash(k) = k mod buckets = bucket s` line a lookup gets, plus the sentence that answers the actual
question — *the slot is decided by the VALUE, never by the order it arrived in* — and the table's
starting size says why it is eight.

### What measuring found, and it was not flattering

An audit of where problem knowledge lives produced three findings, all verified before acting:

- **`README.md`'s own "Change → file" table was wrong for 95% of journeys.** It pointed at
  `src/engine/journeys/<slug>.ts`. Measured: **5** files there, **90** in `src/data/journeys/`. The
  one document whose job is "trust this table instead of reading the code" was stale on its
  flagship row.
- **`CLAUDE.md` said 107 problems, 87 journeys.** It is 127 and 93.
- **The pattern name prints unconditionally on every generated page** — the single most
  spoiler-sensitive string in the disclosure system. Filed; the learn page is now a declared
  spoiler zone, which may make it correct, but it needs a decision rather than a patch.

Then `scripts/learn-gaps.mjs` counted the authored half, and that is the real finding:

| | |
|---|---|
| Problems with no teaching document | **46** |
| Missing "Reading the Calculations" | **126** |
| Missing "How to Get Fluent" | **126** |
| No measured "Under the hood" claim | **126** |
| Adding approaches without disclosing it | **23** |

`verify-deep` runs each document's script and checks the approaches agree — which says nothing about
the prose. **45 of 81 documents teach a rung the data file does not have, and 29 never said so.**
Six were written today and are labelled now.

### Two data defects the documents found

- **G6 — `balanced-tree`'s naive rung is labelled `O(n²)` and is not quadratic.** Its code checks
  the root before recursing, so descending requires every ancestor to be balanced, balanced means
  logarithmic height, and the worst case is `O(n log n)`. Instrumented `height()` entries on left
  spines: **100 / 200 / 400 / 800** for n of 50 / 100 / 200 / 400 — linear. The genuinely quadratic
  version is the one with no short circuit: **2 550 / 10 100 / 40 200 / 160 400** on the same
  spines.
- **G7 — all three of `tree-diameter`'s examples pass the most common wrong solution.** The data
  file's note claims example 3 catches a through-the-root solution; measured, it returns 3, which is
  correct. A real counterexample is `[1, 2, null, 3, 4, 5, 6, 7]` — through the root 3, answer 4 —
  found by searching random trees for the smallest disagreement.

### Lessons that cost something

**A measurement is only true of the corpus you measured.** The markdown parser was written against
80 authored documents with zero links and no HTML — measured, not assumed. Then `docs/learn` merged
those documents with the generated pages and the corpus became 2 003 links, 879 `<details>` folds
and a comment banner on all 127 pages. The LeetCode link rendered as literal brackets on a live
page. The file now carries the command to re-run the count.

**An agent id does not survive the session.** `docs/AGENTS.md` shipped a resume list of nine killed
agents and the instruction to `SendMessage` them. In a new session `ListAgents` returns peer
sessions only; not one of the nine existed. The roster is a queue of owed **files** now, with a
one-line command that regenerates it.

**Fixtures go stale within the hour.** A new UI check named `right-side-view` as "a problem with no
deep document", and then that document was written. It computes the fixture from disk now — the
lesson this repo already learned once with the no-journey fixture.

**Three bugs were found by looking at the page, not by a test.** Backticks rendering literally
inside bold (every complexity bullet is written ``**Time — `O(n)`.**``); the page scrolling sideways
by 10px at 1440 because a `<pre>` does not wrap, so its min-content width is its longest line —
measured at 966px — and that floor propagates to the shell; and the edit-me comment banner printing
at the top of every learn page. Each now has a check that was run against the old behaviour first
and failed.

### The gates

| Gate | Command | State |
|---|---|---|
| Types, lint, content | `npm run check` | tsc 0 · eslint 0 · **753 tests** |
| The interface, in a real browser | `npm run test:ui` | **163 checks**, 0 failed |
| Every teaching document's script runs and agrees | `node scripts/verify-deep.mjs` | **81/81** |
| The authored half does not get worse | `node scripts/learn-gaps.mjs --strict` | ratchet, baseline recorded |

### What was deliberately not done

**PracHub was not scraped.** ~6 000 crowdsourced interview recollections behind a freemium wall with
terms of service. Copying statements and solutions would break this repo's own rule — everything
here is written in our words and verified by running it — so it is in `RESOURCES.md` as a coverage
source with that reason attached.

`docs/LEARN-PLAN.md` is the ordered queue of what remains, and `docs/deep/TEMPLATE.md` now carries
the four readers a document has to serve at once. The first-year student who stalls at the
arithmetic is the one every document here had been skipping.

---


## 2026-09-12 — a page per problem, twenty more problems, and text you can actually read

Three things shipped, and the third exists because of the second: writing a paragraph of prose onto
every problem page made it obvious the prose was too small to read.

### PR #85 — `docs/explained/`, generated (B64)

One markdown page per problem: statement, constraints, examples, hints behind a fold, the approach
ladder worst → best with each rung's Python, Java and C++, an arc table, and a **runnable script
holding every rung at once**.

Nothing on those pages is authored. `scripts/gen-explained.mjs` renders them through the app's own
`ladderOf`, so a page cannot disagree with the problem page, and `gen-explained.test.mjs` fails
`npm test` the moment one drifts. The runnable script renames each rung's entry point by word
boundary — a recursive rung calls itself, and a renamed `def` with an unrenamed call is a
`NameError` nobody sees until they run it — and builds a linked-list argument with a thunk per call,
because the rung that walks it consumes it.

**Measured: 107 of 107 scripts executed under CPython, 0 errors.** Five print different answers
between rungs and all five are explained — the deliberately wrong greedy in `coin-change-min`, and
four order-free answers whose pages now say so.

Found on the way: `vectors.mjs` carried `kth-largest-stream` **twice**, byte-identical. Removed.

The gate caught a flaw in itself on the first run: git checks the pages out as CRLF and the
generator writes LF, so every page read as stale on a fresh Windows clone. It compares content now,
not bytes.

### PR #86, part one — batch 7: 107 → 127 problems, and an arc on all 127 (B65)

Twenty problems chosen to fill the thinnest patterns first: four trees (inorder walk, symmetric
tree, diameter, right-side view), three graphs (flood fill, pacific/atlantic, shortest path in a
binary matrix), three dp (decode ways, jump game, maximum product subarray), two each of heaps,
stack, sliding window, binary search and arrays & hashing.

**`Problem.arc`** is the new field: one paragraph naming the single idea the whole ladder applies
and which rungs to know cold. Every one of the 127 problems carries one. The rungs could not say it
— each only knows the rung below it — and it is the part a learner takes to the *next* problem. It
renders under the ladder and at the foot of every explainer page, and never while a journey's
ladder is capped, because it names where the climb ends.

| Gate | Result |
|---|---|
| `npm run check` | tsc 0 · eslint 0 · **680 tests** |
| `npm run test:ui` | **154 checks**, 0 failed |
| `npm run verify:code` | **752 blocks**, 0 failed (612 before) |
| `npm run verify:run` | 2147 oracle runs, **4294 comparisons, 0 disagreed** |
| `npm run verify:vectors` | **0 unexplained survivors** |
| CPython, every rung of the 20 | all agree, except the rung built to be wrong |

**The mutation gate was right three times, and they were real holes.** `spiral-order` could not tell
`top <= bottom` from `top < bottom` until a 2×3 and a 4×2 were added; `mirror-tree` needed a tree
with one crossed pair matching and one not; `shortest-path-grid` needed a route that only exists
down column 0. Seven further survivors are genuine equivalences, each recorded **with an argument**
— four of them the comment trap again (`mutants()` does not skip comments), and one worth keeping:
in `decode-ways`, weakening `i + 1 < len(s)` only opens the two-digit branch at the last index,
where `ahead2` is still 0 and adding it changes nothing.

One Java bug was caught before it landed: an `ArrayDeque` cannot hold the `null` a crossed pair
needs — the same shape B30 found in `invert-tree`.

Written straight through in one session with no subagents, unlike batch 6's fan-out. The cost was
wall-clock, not quality; the gates report the same numbers either way, which is the argument for
buying gates rather than reviewers (`docs/MODELS.md`).

### PR #86, part two — the text was too small to read (B66)

Reported as "I am unable to read the text". **Measured before touching anything** — every text node
on four routes, out of a real browser, with computed size and contrast:

| Route | nodes | below WCAG AA | below 13px |
|---|---|---|---|
| problem page | 121 | **13** | **51** |
| home | 64 | 0 | 28 |
| journey | 68 | 1 | 23 |
| visualizer | 55 | 0 | 35 |

Two causes, and neither was the palette. The scale was one step low, and **154 raw Tailwind sizes
across 39 files** never went through it. The worst offenders were not small but **invisible**:
`text-muted-foreground/40` measured **1.02:1**. An opacity is not a shade — fading a foreground
toward the background leaves no contrast at all.

Fixed: the six steps each moved one notch (13/15/17/20/28/40) with their line heights, so every
ratio between them is unchanged; the raw sizes became roles; the opacity habit became a token,
`text-dim` (5.8:1 in Mocha, 5.5:1 in Latte).

**A correction, in the open.** After that pass I claimed the leftover 12.8px text was "deliberate
sub-scale marks". It was not — it was `text-[0.8rem]` in the shadcn button and toggle `sm`
variants, plus `text-[12.5px]` in the challenge editor and `text-[13.5px]` in the code panel. Those
literals name no size word, so a word-based sweep never sees them. Fixed, and the two code surfaces
went **up** to `text-ui`, because code here is read at length rather than glanced at.

**Measured after: 0 nodes below WCAG AA anywhere, 0 below 13px on any route**, worst contrast
1.02:1 → 6.22:1. The only type left below the scale is the 7px ▲ / ✓ chip legend mark, which sits
on a swatch beside its own label and is a mark rather than a word (B58).

The surface pass is the second half of the same request ("more futuristic, more modern"). The
palette did not change; the light did — crust ground washed with the chip grammar's own mauve and
blue, a 64px hairline grid masked below the fold, top-edge highlight and offset+blur shadow on
resting panels, backdrop blur **only** where a surface floats over the moving stage, a 2px accent
edge and glow on the active rail row, hover that lifts rather than recolours (colour is
load-bearing here), one authored arrival moment, and themed selection, caret, scrollbars, focus
ring and tabular/slashed-zero numerals. All of it is in `docs/DESIGN.md` §The surface.

One UI test needed a real fix rather than a rerun: it selected `.font-mono.text-xs`, a class this
change renames.

### Where it leaves the set

**127 problems, 87 journeys** — so **forty** now fall back to the static walkthrough player, which
doubles B63 and makes it the largest open item. B65's runway to the LeetCode top 500 is roughly
nineteen more batches, and each one's explainer pages now fall out for free.

---

## 2026-09-09 (batch 6) — a hundred problems, and what the gates said about content nobody had run

PR #83 closed B43 first: a derived act's Java and C++ tabs were being DROPPED whenever the
translation did not line up with the pseudocode row for row, which is most of the time. 36 of 304
acts had a Java tab. `CodeTabs.unsynced` names the languages whose rows do not correspond — they
render, the highlight is off for those tabs alone, and the panel says why. **208 of 304** now.

Then PR #84, the batch: **87 → 107 problems**.

### What was built

Twenty problems across arrays-hashing, two-pointers and linked-list, each with **five** approaches
worst → best rather than the usual two or three. 100 rungs, **300 code blocks**, Python + Java + C++
on every rung.

| Pattern | Problems |
|---|---|
| arrays-hashing | rotate-array, missing-number, find-all-duplicates, plus-one, first-missing-positive, summary-ranges, intersection-of-arrays |
| two-pointers | remove-element, reverse-string, merge-sorted-array, three-sum-closest, backspace-compare, boats-to-save, next-permutation |
| linked-list | add-two-numbers, odd-even-list, remove-list-elements, swap-pairs, rotate-list, reorder-list |

Six agents wrote them in parallel, each kept OUT of the three shared files — the pattern barrels,
`data/index.ts` and `vectors.mjs` — because that is precisely where six writers collide.
`scripts/wire-batch.mjs` does the wiring once, reading what is on disk rather than what anyone
expected to be there, and it is idempotent, so it ran after each batch landed instead of only at
the end.

### What the gates found

Every block compiled and agreed with its Python on the first run: the agents had verified their own
work before reporting. The mutation gate is where the content actually got tested — **23 survivors**,
mutants no vector could tell apart from a deliberate bug.

- **13 were missing cases.** `--suggest` names the input that separates the real code from the
  mutant; those are vectors now.
- **10 were genuine equivalences**, each recorded with an argument: a self-swap at `lo == hi`, a
  comparison the line above already returned on, a bound that can only matter when the array is a
  permutation and therefore already correct.

Two things about the tooling itself, both worth carrying:

- **`--suggest` will propose an input the constraints forbid.** Its case for merge-sorted-array had
  `a` unsorted; for find-all-duplicates it used a `0` where the values are 1..n. Adding either
  would have asserted on undefined behaviour. A survivor whose only distinguishing input is illegal
  is an equivalence, not a gap.
- **The mutation engine does not skip comments.** Two next-permutation survivors were edits to a `#`
  line.

### B61, cashed the same day

These twenty are the first problems in the repo with no journey, so they are the first to reach
`step-player.tsx` since it was written — exactly the case B61 decided to keep it for that morning.
Had the decision gone the other way, this batch would have had to carry twenty journeys as well, or
ship twenty pages with nothing to draw. `test:ui` now drives four of those pages and asserts the
static player renders with real narration, and walks all twenty for a clean console and five rungs
each. Journeys for them are **B63**, the next content run.

### Evidence

| Gate | Before | After |
|---|---|---|
| `npm run check` | 675 tests | 675 tests, tsc 0, eslint 0 |
| `npm run verify:code` | 412 blocks | **612**, 0 failed |
| `npm run verify:run` | 2128 comparisons | **3393**, 0 disagreed |
| `npm run verify:vectors` | 404 mutants | **501**, 91% caught, 0 survived |
| `npm run test:ui` | 152 checks | **154**, 0 failed |

One Windows exe-launch flake in the differential run (`remove-duplicates-sorted`); re-run per
problem, clean.

Also shipped: `docs/RESOURCES.md` — the six array ideas and the five linked-list moves, each with
the tell that says "use this", the repo problem that teaches it and the classic mistake; the
complexities worth deriving on the spot; and external resources annotated with what each one is BAD
for, which is the only part of a reading list that saves anybody time.

---

## 2026-09-09 (ten items) — the small backlog, cleared, and what measuring found in it

Eleven PRs, #71–#81. Ten backlog items closed plus one bug of my own. The pattern across all of
them: **four of the five on-screen fixes were found by measuring, and would have been wrong if
reasoned about.**

| # | Item | What it actually was |
|---|---|---|
| #71 | B61 | A decision, not code: KEEP the static player. Deleting it would make "a problem without a journey" unrenderable and turn every content batch into a journey batch. |
| #72 | B62 | `shape: "class"` in a vector set — a case is the constructor's arguments plus the stream of calls, the answer is the row of results. `NOT_YET_RUNNABLE` is empty. |
| #73 | B58 | Five raw font sizes, and the reason they existed: `cn()` was deleting the named type steps. |
| #74 | B59 | The test-case drawer floats now; the stage is 876px open and shut, not 862 → 574. |
| #75 | B45 | The leak was not the ladder — it was the pattern NAME, twice on the page. |
| #76 | B18 | 19 store tests, including storage that throws on read and on write. |
| #77 | B19 | Restart holds its ledger for five seconds and offers it back. |
| #78 | B60 | The panel audit asserts, and runs inside `test:ui`. |
| #79 | B36 | 62 qualified names across 12 files, gone and gated. |
| #80 | — | My own unsound cast, which a COLD `tsc -b` rejected and the incremental one had waved through. |
| #81 | F5 | The Play button counts down the wait it is holding. |

### The one worth remembering

B58 read as "raise four font sizes". Raising them changed nothing: the browser said **16px**.

`cn()` is `twMerge(clsx(...))`, and tailwind-merge cannot tell a named font size from a named
colour — both are `text-<word>`. It files `text-meta` under colour, so `cn("text-meta",
"text-muted-foreground")` returns the colour alone and the size is **silently deleted**. No build
error, no warning, nothing on screen but "that looks a bit big". It is also exactly why the
sub-scale literals existed: `text-[10px]` is a recognised arbitrary size and survives.

Teaching the merger the six names repaired every such call at once — including `cn("text-display",
…)` on the answer panel, whose 32px had never once applied. Two lessons, both already in the
house rules and both re-learned: measure the rendered thing, and when a rule "looks right and
renders wrong", suspect the machinery between them.

### The other three that measuring changed

- **B45** named the wrong culprit. The ladder was already capped by the ledger and a journeyed
  problem never draws from `alternatives` at all. What leaked was the pattern name — 2 problems of
  87 with the ledger at act 2, and the fix was to use the mask the catalogue has used since B8.
- **B58's bar labels** needed a rule rather than a size: 12px makes a two-digit label 14.4px, and
  past 16 bars a phone gives each bar ~10px. They drop below `sm` at that count.
- **B36** was verified by RUNNING, not compiling: `using namespace std;` makes a bare `max` a real
  ambiguity, and only a compiler settles it. 412 blocks compile, 2123 comparisons agree.

### Evidence

| Gate | Start of session | End |
|---|---|---|
| `npm run check` | 646 tests | **675** tests, tsc 0, eslint 0 |
| `npm run test:ui` | 132 checks | **151** checks, 0 failed |
| `npm run verify:code` | 412 blocks, 0 failed | 412 blocks, 0 failed |
| `npm run verify:run` | 1676 comparisons, 14 not marshalled | **2128** comparisons, 0 disagreed, **0** not marshalled |
| `npm run verify:vectors` | 380 mutants, 92% | **404** mutants, 92%, 0 survived |

The panel audit is inside `test:ui` now, so those 151 checks include the fourteen panel kinds
measured at their largest presets, every run.

---

## 2026-09-09 (B30) — the gate stops being blind, and immediately finds something

One PR. `verify:run` executed every Java and C++ block against the repo's own Python — except that
it could not marshal a linked list or a binary tree, so **14 of the 87 problems were checked by a
compiler and nothing else**. They were listed in `NOT_YET_RUNNABLE` rather than quietly absent,
which is the difference between a known gap and an invisible one, and it is why closing it took a
morning rather than an audit.

### What was built

`params` in a vector set may now say `list` or `tree`, and `run.mjs` builds one in each language
from the literal:

| Shape | Written as | Built by |
|---|---|---|
| `list` | `[1,2,3]`, or `{list: [3,2,0,-4], cycle: 1}` when the tail points back | `__mklist` — a template in C++, one method per class in Java, a private `__LN` in Python |
| `tree` | level order with `null` for an absent child, the shape LeetCode prints | `__mktree`, same three |

Three details that were not obvious from the outside:

- **The node class is the block's own.** This repo's Python calls a list node `Node` and LeetCode
  calls it `ListNode`; both are declared, and *different rungs of one problem* use different ones —
  merge-two-sorted's optimal rung says `ListNode` and its array rung says `Node`. The driver reads
  the block's signature and builds what that signature asked for.
- **Python evaluates an annotation at def time.** `def reverse_list(head: Node | None)` raises
  `NameError` before a single case runs unless `Node` already exists, so the node classes go
  *before* the block in the driver and the canon goes after. Three rungs also CONSTRUCT a node
  without declaring one, so the classes are declared when absent and the block's own wins when not.
- **An absent node prints `null` in all three languages.** Python has only `None` to say it with
  and Java only `null`, so C++ had to agree rather than print `[]` for a list that is not there.

`verify.mjs` now exports `NODES`, and the runner inserts the same declarations the compile gate
compiles against — unconditionally, because `canon` carries a branch per node type and those
branches have to compile in every driver.

### What it found, on the first run

**invert-tree's iterative Java rung threw `NullPointerException` on every case**, the empty tree
included. It mirrors its Python line for line — push a child, check for null on the way out — and
`ArrayDeque` refuses `null`. It had compiled cleanly for as long as it had existed, and the compile
gate is structurally unable to see it. `new LinkedList<>()` fixes it and keeps the block
line-for-line, which the content gate requires.

Mutating the new vectors then named five missing cases: a right-branch duplicate for validate-bst
(`[2,1,2]` — a left-branch one cannot separate a loosened lower bound), a one-sided difference for
same-tree, and three keys standing ON a node for bst-ancestor. One survivor is genuinely
equivalent and is recorded with the argument: merging a tie from `b` instead of `a` swaps two nodes
holding the same value, and the answer is compared as values.

### Evidence

| Gate | Before | After |
|---|---|---|
| `verify:run` | 1676 comparisons, **14** problems not marshalled | **2084** comparisons, 0 disagreed, **1** not marshalled |
| `verify:vectors` | 380 mutants, 92% caught | **402** mutants, 92% caught, 0 survived |
| `verify:code` | 412 blocks, 0 failed | 412 blocks, 0 failed |
| `npm run check` | 646 tests | **649** tests, tsc 0, eslint 0 |
| `npm run test:ui` | 132 checks | 132 checks, 0 failed |

What is left is `kth-largest-stream`, a constructor plus a stream of `add()` calls rather than a
function — filed as **B62**, because the driver calls one entry point and that one needs a script.

---

## 2026-09-09 (87 of 87) — the last eight journeys, and a milestone worth stating plainly

One PR (#68). B51 and B52, which between them close the set: **every one of the 87 problems now has
a journey.**

### B51 — six array-shaped journeys

Each one puts the STRUCTURE on the stage rather than the input, because in every case the structure
is what the answer is about:

| journey | what the stage draws | what it turns on |
|---|---|---|
| `count-dont-sort` | the tally | an anagram is a claim about COUNTS, so both strings are read in one order-independent pass |
| `one-to-one-both-ways` | two maps | the backward map catches what no forward map can see |
| `a-key-that-survives-rearranging` | the groups | three rungs about what a KEY is — none, sorted, tallied |
| `two-letters-move-so-check-two` | need over have | a window move changes two counts, so carry the agreement count |
| `the-two-most-recent-values` | the stack | "most recently finished" IS a stack |
| `most-first-and-a-rule-for-ties` | the ranked counts | the tie-break is what makes the answer one answer |

`one-to-one-both-ways` ships a pinning test, the same shape as fewest-coins and word-search:
`"badc"` → `"baba"` is **false**, a forward-only map says **true**, and the obvious failure
`"foo"` → `"bar"` is caught by both — which is why testing with that one proves nothing.

`most-first-and-a-rule-for-ties` is another ladder that does not climb in cost, and says so: the
heap and the sort are the same work here, and the heap is taught because the same shape answers
"the top k without ordering the rest".

### B52 — the two that take a single number

`stair-ways` and `counting-bits`. Both draw the answer table being filled; `generate-parens` and
`above-plus-left` had already proved a one-number input works. stair-ways carries the full DP arc in
three rungs — the recurrence, the same recursion memoised, and then two variables, because a table
whose entries are each read exactly twice by their neighbours never needed to be a table.

### The milestone, and what it broke

**87 journeys, 87 problems, 0 static walkthroughs.** Which means `step-player.tsx` renders nowhere:
`problems.test.ts` forbids a problem from carrying both a journey and hand-written frames, so
`problem.walkthrough` is now undefined everywhere — including the legend V9 fixed two passes ago.

The `test:ui` check that measured that legend failed, correctly, because its last fixture became a
journey. It has been **replaced rather than deleted**: the new check asserts the fact that changed —
the problem page draws the engine stage and no static player renders — so it fails the moment a
problem is added without a journey, which is exactly when the keep-or-delete question (B61) has to
be answered.

That question is filed, not acted on. The static player is the fallback for a problem authored
before its journey, and deleting it means every new problem must ship with a journey on the same
branch. Same shape as B54, filed BEFORE acting this time rather than after.

### Gates

`npm run check` exit 0 (**646 tests**) · `npm run test:ui` exit 0 (**132 checks**) ·
`verify:code` **412 blocks, 0 failed** · `verify:run` **1676 comparisons, 0 disagreed**.

Gates caught, across the eight: four undeclared corner tags, three edges pointed at presets that
could not exercise them, two out-of-range `line` indices, and one disclosure leak — stair-ways'
third hint names the last act, so the story act carries its own.

---

## 2026-09-09 (the panels) — an audit that found the panels were fine, and one rule they broke

One PR (#67). Asked for: update the docs and the memories, find the next session's tasks, and audit
the panels.

### The audit

Eight panel kinds were designed against a handful of small presets, and 79 journeys now push real
data through them. `test/panel-audit.mjs` walks every kind on a real Chrome at 1536×864, picks each
journey's **largest preset** and its **last act**, scrubs to 60%, and measures.

**The main finding is a negative one: the shapes hold.** No overlapping cells anywhere — including
an 80-cell DP table and a 15-node tree — nothing drawn outside the stage, no inner sideways
scroller, smallest cell 40px. The tree's arithmetic layout does not collide at four levels.

**What it did find: four raw font sizes below the type scale**, inside the panels — the bars' value
label at `text-[10px]`, the chip's index subscript at 11px, two more in the hash-map view.
`docs/DESIGN.md` names this exact violation, the smallest role is `text-meta` at 12px, and U6 set
12px as the floor. Fixed, and re-measured: **smallest text on every panel is now 12px**. The chained
bucket arrow is `aria-hidden` too — it was never text.

Four more of the same violation survive OUTSIDE the panels (B58), and the test-case drawer takes
**288px of the stage's 862** when open, which is a design call rather than a bug (B59).

### The audit became a gate

A tool nobody runs is a tool that stops being true, so the densest panel — the DP table at its
largest preset — is pinned in `test:ui`: ≥ 40 cells, **0** overlapping pairs, **0** outside the
stage, nothing under 12px.

### Three traps, all from the same afternoon

Getting the audit to measure the right thing took four wrong runs, and each was a fact worth
keeping:

1. **The store caches per key**, so writing `localStorage` while a page is mounted is silently
   undone. The write has to happen on a different route, followed by a real navigation — which is
   what `ui-smoke.test.mjs` has always done. Read the harness before fighting the app.
2. **Applying a preset restarts the act.** Picking the act and then the preset measured the story
   act fourteen times and reported "0 cells" without failing.
3. **A backslash in a template literal sent to the page is consumed twice**: `/^\d\d/` in a test
   file arrives as `/^dd/`. A character class sidesteps the question.

### Docs

README and ROADMAP still described "10 patterns × 3 problems" and "two journeys"; AUTHORING still
listed linked list, tree, stack and grid as "known gaps" and now records that the last four shapes
anyone wanted all turned out to be a `grid` with a different label. MODELS records that 14 of 87
problems are compile-checked only. STATUS carries a ranked next-session plan.

### Gates

`npm run check` exit 0 (**589 tests**) · `npm run test:ui` exit 0 (**124 checks**, one new).

---

## 2026-09-09 (the last eleven) — a translation pass, eleven journeys, and B54 finally deleted

Two PRs (#65, #66). The eleven problems that carried Python only were the last ones that could not
have a journey — and they were also, exactly, the eleven ASCII walkthroughs left in the set.

### 44 blocks, and how far the gates see

`problems.test.ts` refuses a journey on a problem without Java and C++. Every approach of all eleven
now carries all three, written to match the Python step for step **including where it is
deliberately naive**: the unique-paths alternative still branches at every cell, balanced-tree's
still measures the height at every node.

`verify:code` compiles all 44 (**412 blocks, 0 failed**). `verify:run` covers **four** of the eleven
— the other seven take a linked list or a tree, and the differential runner cannot marshal those
arguments (**B30**).

Those seven were added to `NOT_YET_RUNNABLE` with their reason. That matters more than it sounds: a
problem simply *absent* from `VECTORS` is invisible to the gate, and an invisible gap reads as a
pass. The runner names **14** unrunnable problems now where it named 7.

### Eleven journeys

| journey | what it turns on |
|---|---|
| `same-values-same-places` | the `#` for an empty child IS the shape — without it, mirrored trees serialise alike |
| `swap-every-pair` | climbs in ROBUSTNESS, not cost: both rungs O(n), the recursion shorter |
| `one-number-two-jobs` | −1 as a height that cannot exist, so one return carries measurement and verdict |
| `the-tree-knows-the-way` | the general-tree rung is correct on ANY tree and therefore cannot use the ordering |
| `twice-as-fast-is-halfway` | the loop condition is the specification |
| `read-it-both-ways` | climbs in memory against side effects — the fast rung rewires the caller's list |
| `a-gap-that-measures-the-end` | a maintained gap, and a dummy that deletes the head case |
| `the-front-of-every-row` | sorted rows and columns do NOT make a sorted matrix |
| `start-where-the-exits-are` | inverting the question removes the verdict entirely |
| `above-plus-left` | one row, and the slot holds two rows at different moments |
| `which-cut-points-can-you-stand-on` | store the position, never the path that reached it |

### B54, closed by actually deleting something

Filed when 33 of 87 problems rendered ASCII art in a `<pre>`. Re-scoped once, when counting showed
the deletion would have stripped 31 pages of their only visualisation — so it was paid off by
writing, one journey at a time. **31 → 11 → 0.**

With no producer left, the fallback branch in `step-player.tsx` is gone and so is `Frame.text`, which
makes `Frame.cells` required rather than optional — a type that is now honest about what a static
walkthrough is.

### Gates

`npm run check` exit 0 (**589 tests**) · `npm run test:ui` exit 0 (**123 checks**) · `verify:code`
**412 blocks, 0 failed** · `verify:run` **1694 comparisons, 0 disagreed**.

### What this teaches

1. **An item can be right and its scope wrong.** B54 said "delete this" for two days. The deletion
   was correct and the sequencing was not, and only counting showed the difference.
2. **Name the gap or it disappears.** Seven translations went from silently unchecked to listed as
   unchecked. Nothing about the code changed; what changed is that the gate now says so.
3. **A type is a claim.** `Frame.text` outlived its last producer by a whole batch. Deleting the
   branch and the field together is what stops it coming back.

---

## 2026-09-09 (chrome) — the theme that was already there, and a footer three times too tall

One PR (#64), asked for directly: *"can i see the setting all themes and light mode"* and *"have all
the three settings and keyword shortcuts and collapse in one parallel so space less space"*.

### The theme was built and never offered

`components/theme-provider.tsx` has carried dark / light / system since the shell was built — with a
`d` shortcut, a `prefers-color-scheme` listener, and cross-tab sync through a storage event. **No
control anywhere exposed it.** Settings has a theme row now, and `d` is in the shortcuts map the `?`
dialog renders, which is where a key is supposed to be declared in the same commit that adds it.

That is the same bug as `brief` and `difficulty` — and the V10 sweep this session **missed it**,
because it swept content fields for render sites and this lives in a component. A sweep is only as
wide as the thing it swept.

### Light was grey, and grey cannot teach here

The light palette was still the shadcn default, where all five chart roles are shades of the same
colour. In this product the chip roles — anchor, focus, answer, dim — and the walkthrough legend
say what a step is DOING; a theme that flattens them into greys is not a dimmer version of the
product, it is a broken one. Light is **Catppuccin Latte** now, the counterpart of the Mocha in the
dark block, with the same hue for the same role in both.

Measured on the journey page in light: **5 distinct chart colours**, background `rgb(239, 241, 245)`,
text `rgb(76, 79, 105)`, primary the Latte mauve.

### The footer was three rows to reach three dialogs

Settings, shortcuts and collapse were full-width rows stacked vertically. They sit side by side now,
labels moved into the tooltips they already had. Measured by toggling the class back on the live
page: **footer 144px → 72px**. On the collapsed rail they stack again — there is no width to share
there, and the rail is where the labels are most needed.

### Gates

`npm run check` exit 0 (**512 tests**) · `npm run test:ui` exit 0, **112 checks** — two new: the theme
switch changes the page and keeps the chart roles distinct, and the three footer controls share a row.

---

## 2026-09-09 (batch 5, part two) — the other fifteen, and the pool is empty

One PR (#63), fifteen journeys. **53 → 68**, and **every problem carrying all three languages now
has a journey.**

| shape | journeys |
|---|---|
| grid | max-island-area, rotting-fruit, word-search, count-provinces |
| DP table | longest-common-subsequence, partition-equal-subset |
| row + structure | balanced-brackets, top-k-frequent, task-cooldown, k-closest-points, min-cover-substring |
| a range, not a row | koko-bananas |
| tables over nodes | course-order, network-delay |
| no input at all | generate-parens |

### Five shapes proved without a new view

Every one of these renders on `GridView`, and none needed a change to it:

- **A DP table being filled.** `longest-common-subsequence` draws best[i][j] with the three cells
  the current one reads marked; `partition-equal-subset` draws the row of reachable sums.
- **An adjacency matrix** (`count-provinces`) — the graph written as the table it arrives as.
- **An in-degree table** (`course-order`) — one column per course, watching the counts drain.
- **A distance table** (`network-delay`) — ∞ until a route is found, with settled nodes dimmed.
- **A listing of the answers themselves** (`generate-parens`), which has no input sequence at all:
  its row holds one number. That answers half of B52 — the shape works.

### Two rungs that are deliberately wrong

`word-search`'s middle rung never gives a failed path's cells back. It reads almost identically to
the correct version, and a pinning test holds the board where they disagree — `["aaa", "aba"]` with
`"aaaaa"` is **true**, and **false** without the restore, while the textbook example agrees either
way. Finding that board took a search: the first three candidates all agreed, which is exactly why
the bug survives casual testing.

`partition-equal-subset` does the same with a direction rather than a line: sweeping the sums upward
spends one number twice. `[1, 3]` cannot be split and an upward sweep says it can; `[4, 4]` agrees
either way.

### Ladders that climb in something other than cost

Three of these have rungs of equal or better asymptotic cost that are still the wrong rung, and each
says so in its recap rather than pretending otherwise:

- `task-cooldown`: the formula is O(1) and the simulation is not. The simulation wins because it
  produces the schedule, which the formula cannot.
- `count-provinces`: flood fill and union-find are both linear here, and the flood fill is shorter.
  Union-find earns its place when the edges arrive over time.
- `k-closest-points`: quickselect is expected linear and the bounded heap is not. The heap wins on
  the things asymptotics do not measure — it streams, and it does not reorder the caller's data.

That framing is only honest because of V8: the ladder heading says "each answering the one before
it" rather than "worst to best".

### What the gates caught, again

Four unused declarations, one `accept` callback with its arguments the wrong way round, two pinning
tests asserting a divergence that did not exist on the board I picked, and **seven corner cases
declared and never explained on their preset**. One disclosure leak: `count-provinces`'s third hint
names union-find, which the story act may not show, so that act carries its own third hint.

One problem needed code before it could have a journey at all: `rotting-fruit`'s alternative was
Python-only, and `problems.test.ts` requires every approach of a journeyed problem to carry all
three languages.

### B54 is nearly paid off

**31 ASCII walkthroughs → 11**, and all eleven belong to the problems that carry Python only. A
translation pass plus their journeys closes the item completely.

### Gates

`npm run check` exit 0 (tsc 0, eslint 0, **512 tests**) · `npm run test:ui` exit 0, **110 checks**.

### What this batch teaches

1. **A view earns its keep by carrying shapes it was not designed for.** Five different pictures,
   one `GridView`, no changes to it. The abstraction was right because a grid of labelled cells is
   what all five of those things ARE.
2. **A deliberately wrong rung needs a witness, and the witness has to be hunted.** Both wrong rungs
   here agree with the correct one on the obvious inputs. Neither lesson survives without a specific
   input where they diverge, pinned by a test.
3. **When a ladder does not climb in cost, say what it climbs in.** Three of these would read as
   nonsense under "worst to best".

---

## 2026-09-09 (batch 5) — the first five journeys for problems that are not rows

One PR (#62). **48 → 53 journeys**, and the pool they came from is the 31 problems whose
walkthrough was ASCII art because there was nothing else to draw.

| journey | problem | what it proves |
|---|---|---|
| `two-runners-one-track` | cycle-detect | the list view's **back-edge**, which had never rendered |
| `one-row-at-a-time` | level-order | a tree whose answer is a shape, not a number |
| `the-window-every-ancestor-leaves-open` | validate-bst | the wrong answer is the lesson |
| `the-smallest-of-the-big-ones` | kth-largest-stream | **a heap is drawn by the tree view unchanged** |
| `take-the-smaller-front` | merge-two-sorted | two structures arriving as one row |

### Three shape decisions, each made once and reused

- **A cycle is a scalar.** `cycle-detect` takes the row of values plus one param: the index the tail
  points at, or -1. The learner can move the tail anywhere and watch two runners chase it. The
  `cycleTo` back-edge shipped with the list view in #57 and had never been rendered by anything;
  measured on screen now — 4 nodes, `↩` where `∅` would be, "links back to position 1".
- **A heap needs no view.** The claim made when the tree view was built was that a heap is an array
  read as level-order slots, so the same drawing shows it. `kth-largest-stream` runs a real
  push/sift-up and pop/sift-down on a plain array and hands it straight to the tree view. Verified
  on screen at k = 3: 4 nodes, 3 edges, root labelled, the newcomer at the bottom.
- **Two structures, one row.** `merge-two-sorted` puts both lists in the same token row with `|`
  between them, so the drawer stays one text field and the divider can be dragged to either end to
  make a list empty. The list view draws the OUTPUT being spliced, marked by which side each node
  came from; the inputs live in the state line.

Tree helpers moved out of `max-depth.ts` into `data/journeys/tree-slots.ts` — the third tree journey
is when a shared module stops being speculative.

### What the gates caught, again

- **Two out-of-range `line` indices** in the heap rung: the frames pointed past the end of that
  rung's own Python block. Same class of mistake as the last batch, caught the same way.
- **Two untagged corner cases** — `range` on validate-bst and `negatives` on merge-two-sorted —
  where the edge was declared and no frame explained it on its preset. Both are now taught in play:
  the sentinel must sit outside the value range, and the dummy node's 0 must never be compared.

### B54 gets paid off by writing, not by deleting

Each journey deletes its problem's hand-written frames on the way in, because `problems.test.ts`
refuses to let a journey and a static walkthrough coexist — one source of truth. **31 ASCII
walkthroughs → 26.** That is what "blocked on content" looks like when the content starts landing.

### Gates

`npm run check` exit 0 (tsc 0, eslint 0, **405 tests**) · `npm run test:ui` exit 0, **95 checks**.

### What this batch teaches

1. **A view is not proved until something draws it.** Two of these journeys exist to render code
   paths that had passed every gate for two days without being executed once.
2. **The input notation is a design decision, not a formality.** A cycle as an index, two lists as
   one row with a divider — both keep the test-case drawer a single text field, which is what lets
   a learner break the input on purpose.

---

## 2026-09-09 (later) — the last three audit findings, and one item that failed its own measurement

One PR (#61). B55 closes; B54 does not, and why is the finding.

### V9 — the legend was hidden exactly where colour is hardest to read

`step-player.tsx` set the four-swatch key to `hidden sm:flex`, so at 390px the walkthrough kept
four load-bearing colours and no key. It wraps now: the chrome bar and the legend are both
`flex-wrap`, so the swatches take a second line inside the same bar. One rendering, nothing hidden,
no second copy to keep in step.

Measured at 390×844 on `#/p/arrays-hashing/group-anagrams` — a problem with `cells` frames and no
journey, since a journeyed problem draws the engine stage instead: four labels present, legend right
edge ≤ 390px, no sideways scroll. **The check was run against the old class first and failed** ("the
legend is not rendered at 390px"), so it is testing the fix rather than the weather.

### V8 — the ladder promised a climb it does not always make

The heading read "N ways in, worst to best". On `island-count` the rungs run BFS flood fill →
Union-Find → DFS sink and the prose between two and three argues Union-Find was *overkill* — the
middle rung is a detour, not a step up. It reads **"N ways in, each answering the one before it"**
now, which is true of every pair in every ladder because it is literally what `whyNow` carries.

Per-rung labels ("detour" / "climb") were the other option and were rejected: telling them apart
needs a ranking of complexity strings — a heuristic with a ceiling — sitting on top of prose that
already says which it is.

### V10 — the sweep found nothing, which is the result

`brief` was stored and never rendered; `difficulty` had been the same bug (B40); the audit guessed
there were more. There are not. Every field of `Problem`, `Solution`, `Example`, `Pattern`,
`SqlProblem`, `Flashcard`, `Journey`, `EdgeCase` and `Resource` traces to a render site outside
`src/data/`. The two that look dead are not: `Journey.harder` reaches the screen through
`use-journey.ts` → `adaptive` → the offer after a flawless challenge, and `Journey.reveals` through
`lib/disclosure.ts` into catalogue masking. Written down so nobody pays for the sweep twice.

### B54 failed its own measurement

Yesterday's entry called deleting the ASCII `text` fallback "a deletion rather than a project" and
the next action. Counted before touching it: **31 problems still carry `text` frames and none of
them has a journey**, and every problem without a journey has a walkthrough (39 = 31 text + 8
cells). Deleting the fallback today removes the only visualisation those 31 pages have.

So B54 is blocked on **content**, not on B41, and its backlog row says so now. The fallback goes
when those problems get journeys — the same 33-problem batch that is the next real item.

### Gates

`npm run check` exit 0 (tsc 0, eslint 0, **370 tests**) · `npm run test:ui` exit 0, **90 checks**.

### What this session teaches

1. **"Dead code" is a claim to measure.** One script separated a cleanup from a content loss.
2. **A negative sweep is a result worth committing.** "There are probably more" is a cost every
   future session pays until someone writes down that there are not.
3. **Soften the claim, do not classify the data.** V8 could have been per-rung labels driven by a
   complexity ranking; it was one line of copy that is true in every case instead.

---

## 2026-09-09 — the tree and list panels get something to render, and the bar gets one row

One PR (#59), three commits, on the back of the UI pass (#57) and the disclosure fix (#58).

### The panels were never rendered

`shape-views.tsx` shipped `GridView`, `TreeView` and `ListView` in #57. The grid was proved by
`count-the-islands`; the tree and the list had **never been rendered by anything** — stated plainly
in their own commit message, and still true a day later. Every tree and list problem in the set
showed a static ASCII walkthrough instead.

Two derived journeys close that:

- **`max-depth`** — four rungs (story, BFS by levels, DFS with an explicit stack, recursion) and
  four corner cases (empty, single node, fully skewed, negatives).
- **`reverse-list`** — four rungs (story, copy to an array, recursive, three pointers) with
  `prev` / `curr` / `next` labelled on the nodes.

**The shape decision:** a tree and a list both arrive as `cells: "words"` tokens in level order,
with `.` for an absent slot, because `Cell` has no null and a sentinel token costs nothing at the
API boundary — the guard there measures size, not meaning. The grid had already solved the same
problem by arriving flattened with a `cols` param.

Measured on screen: `[3, 9, 20, ., ., 15, 7]` renders **5 nodes** (the two absent slots omitted, not
drawn empty) and **4 SVG edges**, root at 50% with its children at 25% / 75% one row down; the list
renders `1 → 2 → 3 → ∅` with the head labelled. Neither falls back to the chip row.
Layout is arithmetic — `centre(i) = ((i - 2^d + 1 + 0.5) / 2^d) × 100` — so no node position
comes from a measured box.

This unblocks **33 problems** and makes B54 (delete the ASCII fallback) a deletion rather than a
project.

### The transport moved to the top bar, twice

Asked for: play controls at the top right, and more of the screen for the visualizer. At
1536×776, stage width went **812px (68%) → 860px (72%)** and the reading column 384 → 336.

The first attempt put the existing `Transport` in the bar as it was — two rows with its own speed
slider — inside a `flex-nowrap` row. The bar wrapped to **150px** and the h1 rendered as
**"Widest Co…"**. The fix was an `inline` variant: scrubber, counter and buttons on one line, and
**no speed slider**, because settings already owns a live one and the second slider is exactly what
cost the title its name. The title is `shrink-0` now, so the subtitle is what gives way.

After: bar **one row at 48px**, header **150 → 110px**, title untruncated, no overflow, Play at
`y=24` and moving **0px** once every scrollable region is scrolled to its end. Below `lg` the
stacked transport still sits at the foot of the stage — the phone header is budgeted at 220px —
and exactly one of the two is ever visible, both wired to the same handlers.

### Gates

`npm run check` exit 0 (tsc 0, eslint 0, **370 tests**) · `npm run test:ui` exit 0, **89 checks**.

### What this session teaches

1. **A component designed for a footer does not become a header component by moving it.** Two rows
   and a slider are fine at the foot of a stage and wrong in a bar. The variant is the honest fix;
   squeezing the neighbours is not.
2. **In a flex row, decide what is allowed to shrink.** The title and the subtitle were both
   shrinkable, so the browser shrank the name of the page. An ellipsis on the gloss is cheap; an
   ellipsis on the name is a bug.
3. **"Shipped" and "rendered" are different words.** Three views passed every gate for a day while
   two of them had no caller. A gate that only reads types cannot notice that.

---

## 2026-09-08 — the local-model workbench, and two gates that run the code

Three PRs (#38, #39, #40). The theme: the practice set gained Java and C++ everywhere, and the repo
gained the means to check code rather than trust it.

**Why a local model at all.** The ask was to cut the cost of generating repetitive content. The
honest split is by *checkability*: translating Python that is already in the repo into Java and C++
is a fixed shape with a fixed algorithm, and almost everything that matters about it can be checked
by machine. The judgement tiers — which weakness earns which act, what a corner case may say before
a technique is earned — cannot, and stayed here.

**#38 — `scripts/localsmith/` and 63 generated blocks.** `gpt-oss-20b` in LM Studio produced them in
361 seconds for 42k local tokens. Five gates run before anything is written, and the one that earns
its keep is **"no step lost"**: a translation may ADD loops, because Python hides them inside
`Counter()`, comprehensions and `set()`, but it may never DROP one — that is exactly how a
deliberately naive rung would quietly become a faster algorithm than the act is teaching. The first
version of that gate demanded equal loop counts and rejected everything; the rule had to be
directional, not symmetric.

**The toolchain stopped being aspirational.** `mise use -g java@temurin-21` and
`scoop install main/gcc`, both user-space, no admin. `npm run verify:code` compiles all 154 blocks,
finding them through PATH, mise, or the scoop shim, and skipping loudly when they are absent — the
way `test:ui` does without Chrome. It found a defect in code that had already shipped: `pair-sum`'s
**hand-written** C++ calls `iota` and needs `<numeric>`.

**#39 — compiling is not correctness.** `npm run verify:run` executes every block and compares it to
the repo's own Python, which is the oracle because it is human-written, reviewed and already on the
page as the reference. `vectors.mjs` carries inputs ONLY; hand-writing expected values is how a test
ends up asserting the bug. 480 comparisons found three bugs that had compiled perfectly:

- `top-k-frequent/Heap` [cpp] ranked its heap by **value** (`a.first`) instead of by **count**
  (`a.second`), so it evicted the wrong entries — python `[1,2]`, cpp `[3,1]`
- `k-closest-points/optimal` [cpp] inverted a heap: Python's `heapq` is a MIN-heap, so `heap[0]` is
  the farthest point being kept, while a C++ `priority_queue` is a MAX-heap — so `top()` was the
  NEAREST point and every eviction discarded the wrong one
- `island-count/optimal` [java] sized its flood-fill stack `rows*cols` while pushing four neighbours
  per pop, so a 1×1 grid overflowed on the first expansion

None of those were reachable by shape checks or by cross-model agreement. That is the whole argument
for B27 in one paragraph.

**#40 — the visualization cookbook** ([`VISUALIZING.md`](VISUALIZING.md)), requested during the
session: how the frame-is-data model works, four Python renderers over the same frames (rich,
matplotlib, manim, this repo), and how to visualise a language model using what already exists —
`tiktoken` for the token strip, BertViz or CircuitsVis for attention, TransformerLens or nnsight for
internals, Netron for architecture. Sampling is the one part written from scratch, because nothing
good covers it.

**Honest limits, all filed rather than glossed:** seven problems (linked lists, trees, a stateful
class) are named in `NOT_YET_RUNNABLE` and the runner reports what it is not covering (B30); Windows
intermittently refuses to launch a freshly built `.exe`, so those are counted separately from
disagreements rather than inflating them (B31).

Evidence: `npm run check` 53 → **61 tests**; `npm run verify:code` **154 blocks, 0 failed**;
`npm run verify:run` **480 comparisons, 0 disagreed**; `npm run test:ui` unchanged at 42.

## 2026-09-07 — problem #5: Widest Container, and the first new panel kind since `terms`

Pipeline row 5, the fifth journey, and the row that said a new render kind was allowed. Branch
`feat/journey-container-water`.

**Why this problem earns its place next to two other two-pointer journeys.** On a sorted row the
pointers move because the values are ordered — the comparison tells you which side is hopeless. Here
nothing is sorted, and the move is justified by a proof about *width*: the shorter wall has just been
paired with the furthest partner it will ever have, so every container it could still be part of is
narrower and still capped at its own height. Same shape on screen, different reason underneath, and
the recap says so out loud. The reason is what transfers; the shape is just what it looks like.

**The `bars` kind.** One column per height, keyed by value+occurrence exactly as the visualizer keys
its bars, so FLIP morphs a column instead of blinking it. The water between the two walls is drawn
*inside* each column of the span — a translucent block from the floor up to the shorter wall — rather
than as one absolutely positioned rectangle. That needs no measuring, cannot drift from the bars it
belongs to, and produces the physical fact the problem turns on for free: a post taller than the
water sticks out of it.

Two small fixes fell out of drawing a panel that owns the whole stage:

- the chip row reserved `min-h-24` whether or not there were chips, leaving a 6 rem empty band above
  every bars frame
- `chips: null` printed "the stage is empty on purpose — the need comes first", which is the story
  act's line about withholding data, not a caption for a panel-only act. It is now drawn only under
  the `story` panel kind.

**The greedy discard is checked, not trusted.** The correctness test compares both approaches against
an exhaustive search on nine fixed rows *and 200 random ones*. A discard argument that is wrong on
one row in a hundred is exactly the kind of thing prose cannot catch.

**Two things the browser caught that the node tests could not:**

- the challenge act rendered `panel: { kind: "bars" }`, so the editor — which arrives through the
  `challenge` panel kind — never appeared at all. The act now draws the row as chips and gives the
  panel slot to the editor, as every other challenge act does.
- the UI check first stepped through frames with the Step button and stalled: a predict card
  interrupts the walk and blocks stepping until it is answered. Scrubbing is the documented way past
  a prediction, so the check scrubs.

Evidence: `npm run check` 53 → **60 tests**; `npm run test:ui` 40 → **42 checks**. Browser: all five
acts deep-link with a clean console (5, 37, 18, 1, 1 frames on a nine-post row); on the textbook row
the opening container reads `width 8 × height 1 = 8` across all nine columns and narrows to
`width 7 × height 7 = 49` — the 49 the problem statement quotes; the reference solution passes all
six cases plus the n = 400 set.

## 2026-09-05 — problem #4: Pair Sum in Sorted Array, and the promise as the lesson

Pipeline row 4, the fourth journey. Branch `feat/journey-sorted-pair-sum`.

**What this problem is for.** It looks like Two Sum with one extra word in the statement, and that
word is the whole lesson: the array arrives *sorted*, and constant extra space is *required*. So the
hash map — the correct, fast, interview-standard answer to the unsorted version — is earned in act 3
and then given up in act 4. A journey where the best-known tool turns out to be the wrong one is a
better lesson than a journey where each act is simply faster than the last.

Six acts: The Problem · Brute Force · Hash Map · Two Pointers · Code It · The Reveal. Panels are the
ones that already existed — chips, the sum equation, the hash view for the notepad — so nothing new
was added to `types.ts` or `panels.tsx`.

**Five corner cases**, one of them new to this repo: `unsorted`, a shelf that is not in order. It is
the sharpest thing in the journey, because the failure it produces is not a crash. The pointers
retire the answer and report that none exists, calmly. The `why` prose says exactly that, and the
constraint it cites is the promise the whole problem rests on.

**Two content bugs the tests caught, both mine, both in data I had written by hand:**

- the "equal prices" preset was `[1, 3, 3, 5]` with target 6 — which also holds `1 + 5`, so the
  promise of exactly one pair was broken by the preset that was supposed to demonstrate a *different*
  corner case. `classifySortedPair` refused it. Now `[1, 3, 3, 8]`.
- the `unsorted` preset was `[5, 1, 9, 3]` with target 12 — on which the squeeze *finds* the answer
  anyway, because the left pointer happens to walk straight onto it. The teaching claim was false for
  the very input chosen to demonstrate it. That is now `[9, 1, 3, 5]` with target 8, and it is
  asserted rather than asserted-in-prose: the test requires brute force and the map to find `[2, 3]`
  and the squeeze to return nothing.

**Practice-set alignment** (B1): the hand-written walkthrough is deleted, so the problem page draws
the journey's own frames, and Java and C++ now sit beside Python on all three approaches — the
three-language rule applies the moment a problem has a journey.

Evidence: `npm run check` 46 → **53 tests**; `npm run test:ui` 39 → **40 checks** (the route list is
derived from `JOURNEYS`, so the new journey enrolled itself). Browser: all six acts deep-link and
render with a clean console (5, 20, 10, 15, 1, 1 frames); the reference solution passes all six cases
plus the n = 400 set and triggers the flawless-run offer.

## 2026-09-05 — the reference card: constraints, then the ladder (R2, R1)

The last two items in "requested, specced, not started", and the answer to the ask that started
them: *"I want to see the solutions here — the brute force naive approach followed by others — and
why we are moving forward to this new solution."*

**R2, constraints** (#32). `Problem.constraints` is required, not optional, so the 31st problem
cannot quietly skip it; all 31 are authored and render under the statement. `EdgeCase.constraint`
cites the line a corner case comes from, on both surfaces that draw them. This is what turns "the
answer can be 0" from a curiosity into a decision: `-3*10^4 <= nums[i] <= 3*10^4`, so 0 is in range,
so stop writing `if result:`. Written in our own words from each problem's public definition, per
the sourcing line in PROBLEMS.md — bounds are facts, a site's prose is not.

**R1, the ladder** (#33, #34). Tabs cannot make an argument: a tab strip presents four approaches as
four equals you pick between. The ladder presents them as one argument, worst to best, where each
rung exists because the one below it ran out of road — and the *why now* line sits **between** the
rungs, because it belongs to the step rather than to either end.

One builder, two sources (the B1 rule): a journeyed problem draws its rungs from the acts, where
`Act.insight` already is the why-now, and is capped by the ledger exactly as the embedded
walkthrough is — a learner three acts in sees three rungs and a nudge back, not the XOR answer. The
other 28 draw from `alternatives` plus the optimal, and #34 wrote the 44 why-now lines they were
missing. `Problem.leetcode` gives all 31 a slug, and "Solve on LeetCode" is the primary action:
still, deliberately, no editor.

**Q1 answered by building it** (option a): the ladder replaced "Approach & Solution", so the page
did not grow a fourth place to look for the same code.

**What the gates caught, not me.** `sorted-pair-sum`'s brute force had a 39-character "idea" — "All
pairs, no use of sortedness at all." — which the new rung test rejected as not a sentence or two.
And the first why-now threshold (60 characters) rejected the journeys' own insights, which are
deliberately short questions: "The map costs memory — what if the drawer organized itself?" The bar
is presence, not length, so it is 25.

Evidence: `npm run check` 43 → **46 tests**; `npm run test:ui` 37 → **39 checks**. In the browser:
single-number shows four rungs ending on XOR for a fresh learner, two rungs and the nudge at
`unlocked = 3`; the CTA resolves to `leetcode.com/problems/single-number/`; the page has no
textarea.

## 2026-09-05 — the lesson screen, filed then built (R3–R8, Q9/Q10)

A worked redesign of the Single Number lesson screen arrived as prose. Filing it first was the whole
trick: mapped region by region against what already ships, most of it turned out to be **placement**,
not features — sidebar badges, breadcrumb, XP, restart, step chips, hints, edge cases, the quiz,
`DataControls`, the transport and the visual system were all built. Building it as written would
have rebuilt them. The spec, the mapping table and where each of its nine suggestions went are in
[`superpowers/specs/2026-09-04-lesson-screen-redesign.md`](superpowers/specs/2026-09-04-lesson-screen-redesign.md);
the shippable remainder became R3–R8, and the two asks that contradicted decisions already made
became Q9 and Q10 rather than commits.

Q9 and Q10 were unanswered, so the backlog's own rule applied — the recommendation is what a session
does absent an answer. The transport stayed the footer U1 built, and the locked node stayed a "?".

**R3, the problem follows the learner** (#25). `HintList` and `EdgeCaseList` rendered only while
`actIndex === 0`; from act 3 the statement was off screen. One accordion in the reading column now
carries the problem (statement, examples, the input on screen right now), how to read it, and the
corner cases, on every act. The defaults are act-shaped rather than fixed: pref `problemSections` is
`null` until touched, so the story act opens the problem and the cases — that act's teaching — and
act 2 onward opens nothing. `HintList` is gone; an accordion inside an accordion had no reason to
exist once the panel owned the heading.

**R4, the test case leaves the critical path** (#26). A flask in the header opens an 18 rem column
*between* the stage and the reading column. It pushes; it does not cover — covering the data you are
about to edit is the failure mode a drawer exists to avoid. `inert` while closed. Below `lg` there
is no width to give up, so the same element renders in the stage footer: one element, two homes.
Input validation needed nothing; bad input already refused and said so.

**R7, keyboard and touch** (#27). The quiz is a radiogroup — one tab stop, ↑/↓, enter — with the
arrows stopped inside it, because the journey keymap ignores inputs and selects but not buttons, so
answering with the keyboard also stepped the player behind the card. `Esc` inside the drawer closes
it and returns focus to the flask. Touch parity turned out to be two elements, not a sweep: the
shadcn Button and the sidebar rows already had `active:` states.

**R5, XOR pairs annihilate** (#28). The idea text said "each pair annihilates"; the chips dimmed by
*progress*, so the row read "visited". Dimming is now computed by pair: twins fade together on the
frame the second one is consumed, what stays lit is exactly what the accumulator holds, and the
broken promise leaves two chips lit — the lie, made visible. No new frames, so the code tabs, notes,
chart and content test were untouched. The survivor beats once when it turns green.

**R6, one motion system** (#29). Four durations and two curves were live at once. A plain `@theme`
block sets `--default-transition-timing-function` and `--default-transition-duration`, so every
transition — shadcn's included — takes one curve and 150 ms without being asked, and a class names a
duration only when it differs (320 ms, six places). Measured before and after in the browser rather
than assumed.

**R8, step completion** (#30). The node of the act that just entered `done` flashes the done colour
flat for 320 ms and settles; the ✓ stays the lasting mark. "Just entered" is a render-time diff of
the previous `done` set, not an effect.

**Verified in a real browser throughout.** The chrome-devtools MCP profile was held by another
session and the claude-in-chrome extension was not connected, so the documented fallback — a private
headless Chrome over CDP — did the driving: frame-by-frame chip states for R5, colour samples every
50 ms for R8, computed transition durations for R6, focus and widths for R4 and R7.

**One self-inflicted mistake, recorded.** `npm run format` is scoped to `.ts/.tsx`; running prettier
on `index.css` reflowed the type-scale block and lost its aligned comments. Restored in the same PR.

Evidence: `npm run check` 43/43 on every branch. `npm run test:ui` **31 → 37 checks**, one new check
per item: the panel on act 05, the drawer's push, the quiz keyboard and `Esc`, every XOR frame, the
motion audit on three routes, and the completion flash.

## 2026-09-05 — UX batch 5: the visualizer fills its screen, home knows you (U9, U13)

Branch `feat/ux-batch-5`. The last two audit items.

**U9** — the visualizer drew its bars in a fixed 224 px band and then left roughly 400 px of empty
page under the card. It is a panel layout like the journey now: the inset is viewport-high, the
stage takes `flex-1`, the bars fill their container with a 14 rem floor, and the picker and the
right rail scroll on their own. Bars **224 → 614 px**; dead space under the stage **~400 → 16 px**.

**U13** — home rendered identically whether you had never opened a journey or finished all three.
A **pick up where you left off** card now sits above the grid when a journey is started and
unfinished: the furthest-along one, the act it opens next, and `n of m acts earned`, deep-linking
straight to `?act=`. It disappears for a fresh learner and once everything is complete, so the
streak finally has something to be about.

**Two test bugs, and only test bugs.** The U5 check started matching the new resume card (it also
says "Two Sum") — scoped it to the card carrying `earned`. And the U13 probe's whitespace regex lost
an escape and reached the page as `/s+/g`, which quietly deleted every letter "s": the failure read
`2 of 6 act  earned` and `Two Pointer  · O(n log n)`. An assertion that looks like an app bug can be
the harness eating your text.

Evidence: `npm run check` 43/43. `npm run test:ui` **31/31** (was 29). Browser: bars 614 px with
16 px of slack under the stage; the resume card reads "2 of 6 acts earned · Two Sum · next: Two
Pointers · O(n log n)" and links to `#/journey/two-sum?act=twoptr`.

**All fourteen audit items are now closed.**

## 2026-09-05 — UX batch 4: mobile as a designed layout (U2, U14, U11)

Branch `feat/mobile-layout`.

The phone was the desktop layout stacked: **378 px of an 844 px screen** spent before the stage, the
act stepper alone taking 214 px as seven chips wrapped into four rows.

- **U14** — the stepper has two shapes now. Above `xl` it is the ribbon it always was. Below, it is
  one row — `act 05 / 07 · One-Pass Hash ▾`, with a lock icon while acts remain — that opens the
  full ribbon in a bottom sheet, stacked with ↓ connectors. Same component, same unlock policy.
- **U2** — with the stepper compact, the subtitle hides below `md` and "restart journey" drops to its
  icon below `sm`. Header **378 → 170 px**; the stage starts at **271 px** instead of 463.
- **U11** — below `lg` the transport buttons, the act pill, the preset select, the custom input and
  **apply** are all at least 44 px, and the timeline track is 12 px instead of 6. A mouse keeps the
  compact row — the sizes are viewport-conditional, not a blanket increase.

Evidence: `npm run check` 43/43. `npm run test:ui` **29/29** (was 28) — the new check resizes to
390 × 844 and asserts the header is under 220 px, the stage starts above 320 px, every transport
control is ≥ 44 px, the pill opens a sheet listing all seven acts, and nothing scrolls sideways.

## 2026-09-05 — UX batch 3: a type scale, and a system written down (U6, U12)

Branch `feat/type-scale`.

**The scale.** Six steps named by role, defined in `@theme` so the line height travels with the
size: `text-meta` 12/16, `text-ui` 14/20, **`text-body` 16/26**, **`text-narration` 19/30**,
`text-title` 24/30, `text-display` 32/38. Plus three container widths (`max-w-reading` 768,
`max-w-page` 1120, `max-w-stage` 1760) so a new page has an obvious one to pick.

Then the migration: every sentence a learner reads moved to `text-body` — the reading column, quiz
and predict questions, corner cases, hints, dialog prose, problem statements, recap notes — and
every hand-written `text-[11px]` / `text-[15px]` label became `text-meta` or `text-ui`. The
narration is `text-body` on a phone and `text-narration` from `lg` up.

**The system.** `docs/DESIGN.md`: the scale, the 4 px spacing grid (with the one exception spelled
out), the four token radii, the three widths, the colour roles with their semantic meanings, the
motion envelope, and the 44 px touch target. It also records the `ch` trap from batch 1, because
that is exactly the kind of thing a system file exists to stop happening twice.

**The guard.** A new UI check walks four routes and fails if any non-mono element with more than 55
characters of its own text is set below 14 px, or if any paragraph exceeds 80 characters of measure.
It caught the visualizer's intro line at **162 characters** on the first run.

Evidence: `npm run check` 43/43. `npm run test:ui` **28/28** (was 27). Measured on the journey page
afterwards: narration 19 px, longest measure 41 characters, and no sentence under 14 px anywhere.

## 2026-09-05 — UX batch 2: the stage keeps its footer (U1, U8, U4)

Branch `fix/ux-batch-2`.

**U1 — and the fix that did not work.** The obvious move was `position: sticky; bottom: 0` on the
narration. It pins the sentence, and it also lets the transport and the data controls scroll
*underneath* it, which trades a readability bug for an unreachable-control bug. The real fix is
structural: the stage stops being one scroll box. The act strip is fixed, a middle div takes
`flex-1 min-h-0 overflow-y-auto` (banner, target line, stage, corner-case card), and narration,
interruptions, transport and data controls sit below it as a footer that nothing can push away.
Below `lg` nothing scrolls internally, so the page behaves as before.

**U8** — the reading-column toggle now sits in a bordered lane with its own background, the same
treatment the sidebar's collapse control already had, instead of floating over the card beneath it.

**U4** — settings speaks the app's language: `accent-primary` on the range (it rendered in the
browser's default blue), the app's `Checkbox` for the boolean, and a small `Segmented` radiogroup
for motion and code tab — four values each, all visible at once, which is the point of the setting.

Evidence: `npm run check` 43/43. `npm run test:ui` **27/27** (was 25) — two new checks: the
narration's rect stays inside the stage and the viewport on the recap act, and nothing sits behind
the reading toggle. Browser: `accent-color: rgb(203, 166, 247)` on the range, 8 radio segments,
one native control left (the JSON textarea, which should be native).

## 2026-09-05 — UX batch 1: the four small corrections (U10, U7, U5, U3)

Branch `fix/ux-batch-1`.

- **U10** — the app's only contrast failure was the first sentence of act 1. The empty-stage line
  goes from `text-xs` at 60 % opacity (**3.64 : 1**) to `text-sm` at full opacity (**7.4 : 1**).
- **U7** — prose capped so a line stays readable. **`ch` was the wrong unit**: it measures the "0"
  glyph, about 1.3× the average character, so `max-w-[68ch]` still rendered ~90 characters (630 px at
  14 px type). The caps ship as `35em` — 0.5 em per character is the heuristic the audit measured
  with, and it lands at 68.
- **U5** — `earnedOf()` / `useEarned()` in `lib/progress.ts` is the only place journey progress is
  phrased now. Sidebar badge, its tooltip, the home card and its bar all read from it, so `1/7` and
  `0/6 earned` for the same moment became `2/6` and `2/6 earned`.
- **U3** — the visualizer follows an `?algo=` link changed while the page is open, with the same
  render-time adjust that fixed the journey's deep link (G1).

Three new browser checks: the algo hash switch (bars give way to the graph), sidebar and home card
agreeing, and the longest measure on the problem page staying under 80 characters.

Evidence: `npm run check` 43/43. `npm run test:ui` **25/25** (was 22).

## 2026-09-05 — a measured UI/UX audit

Branch `docs/ux-audit`. `docs/UX-AUDIT.md`, and U1–U14 in the backlog.

Every surface driven over CDP at three viewports with a seeded ledger, measuring contrast (630 text
nodes, composited on a canvas so `oklab()` and alpha are handled), focus (real `Tab` presses), the
type scale, spacing, radii, line length, target sizes and layout.

**Two of my own measurements were wrong first, and both are worth remembering.** Parsing
`oklab()` colours as RGB produced a list of fictional contrast failures (ratios like 1.12);
compositing on a canvas is the only honest method. And `element.focus()` does not set
`:focus-visible`, so the first pass claimed *40 of 40 controls have no focus ring* — real Tab
presses show 26 of 26 do. A check that says everything is broken is usually the broken thing.

**The verdict.** The stage is good and the accessibility floor is high: median contrast 8.4 : 1,
one failing string in the app, a focus ring on every tab stop, no horizontal scroll at any
viewport, colour never the only channel. What holds it back is the frame — 12 px is the most common
text size in a product about reading, lines run to 110 characters, and a phone spends 378 px of 844
on chrome before the stage starts. 16 type steps, 10 spacing values, 4 radii and 5 container widths
mean the interface has conventions but no system.

**Two real bugs fell out of it:** the visualizer ignores `?algo=` changed in-app (the same class as
G1, fixed on the journey earlier the same day), and the narration — the page's designated star —
clips inside the stage's own scroll box on long panels.

## 2026-09-05 — B1: one source of truth for a problem's walkthrough

Branch `feat/unify-walkthrough`.

Three problems had two explanations of themselves: a hand-written `walkthrough` array on the
practice-set page, and a journey with generators, panels and narration. Two sources drift, and the
journey is the richer one.

`MiniPlayer` embeds the journey's own stage on the problem page — same generators, chip grammar and
panels, driven by `api.run` on the journey's sample. It **respects the ledger**: someone who never
opened the journey (or finished it) sees the optimal act; someone midway sees only the best
approach they have earned, with "This is the best approach you have earned so far" and a link back.
The reference card can no longer spoil the build-up.

The hand-written frames for the three journeyed problems are deleted, and a test now fails if a
problem has both — or if a problem without a journey has none.

Evidence: `npm run check` **43/43** (new one-source-of-truth test). `npm run test:ui` **22/22**
(fresh ledger → "One-Pass Hash" with chips and narration; `unlocked=2` → "Brute Force" plus the
capped notice). Stepping twice moved the narration from "at 2: I need 7 — haven't seen it yet" to
"at 7: I need 2 — and I've SEEN it, at index 0!".

## 2026-09-05 — B7: merge sort stops teleporting

Branch `feat/bars-write-pulse`.

A swap moves two bars past each other and FLIP shows the motion. A merge-sort **write** replaces a
value in a slot: nothing moves, so FLIP had nothing to animate and the bar blinked to a new height.
The frame builder was also collapsing `set` into the `swap` mark, so the two were indistinguishable.

`ArrayFrame.marks` gains `"write"`; the builder maps `set` to it; `BarsView` paints it mauve and
runs a `scaleY(0.72 → 1.06 → 1)` pulse for 260 ms from `origin-bottom`, skipped when the motion
preference is `off` and zeroed by `prefers-reduced-motion`. Discarded bars fade to 40 % instead of
greying, so "eliminated" reads as absence rather than as another colour. The legend gained the row.

Evidence: `npm run check` 42/42. Browser, `#/algorithms?algo=merge` stepped 40 times: 16 frames
carried a pulsing bar, computed `animation-name: write-pulse`, `animation-duration: 0.26s`, and the
stats line read `16 compares · 16 writes`.

## 2026-09-05 — B6: Single Number gets its "prove it" act, and the reveal it never had

Branch `feat/single-number-challenge`.

**What.** `SINGLE_NUMBER_CHALLENGE`: six cases chosen to break a first draft — `[7]` (n = 1),
`[0, 4, 4]` (the answer is 0, which a truthiness test calls "nothing found"), `[1, 1, 2, 2, 9]`
(loner last), `[-3, 5, 5]` (negatives) — an XOR reference, four review items (one loop, constant
space, no truthiness test on the result, say the property out loud) and a 2 001-element second
set. The journey also gained the **recap** act it never had, so it ends on a named reveal like the
other two: memory (map) vs order (sort) vs a property of the values (XOR), and where that instinct
goes next (missing number, two loners).

**The harness had to learn a second answer shape.** It compared "two indices" and nothing else;
Single Number returns one value. `Challenge.answers?: "pair" | "value"` now selects the comparison,
`ChallengeCase.expected` widened to `number[] | number`, and the results list prints the expected
value accordingly.

**And it had a real bug (G5).** Running the XOR reference in the browser failed *all six* cases
with `Cannot convert a Symbol value to a string`. The counting and tracing proxies test the
property key with a regex, and `for (const x of nums)` reads `Symbol.iterator`. It has been there
since the challenge shipped and it hit Two Sum too — any `for..of` solution. `isIndex()` now guards
both traps, and the UI test writes a `for..of` solution on purpose so it cannot come back.

**Evidence.** `npm run check` 42/42. `npm run test:ui` **21/21** (was 20; two runs, both green
after replacing a fixed sleep with polling in the deep-link tests — that sleep flaked once).
Browser: the reference solution goes 6/6 green with `+25 XP` and the act gate opens.

## 2026-09-05 — B8: the catalogue keeps the journey's secret

Branch `feat/disclosure-mask`.

**The leak.** The pedagogy rests on *no unearned name*, and the tests enforced it inside a journey
— but the sidebar said **Two Pointers** in plain sight while Two Sum act 3 was busy building that
exact idea without naming it. The legacy repo had an uncommitted branch for the same bug.

**The decision.** Masking the whole catalogue would wreck it for someone who never opened a
journey; leaving it alone breaks the one rule. So the mask follows an **active promise**: a
pattern is hidden only while a journey that `reveals` it is *started and unfinished*. Never
started, nothing promised, nothing hidden. Finished, you earned the name. And one click — "show
names anyway", stored in `spoilers` — turns masking off forever, because the PRD's drill-runner
persona should not have to play along.

**What that is in code.** `Journey.reveals?: string[]` (pattern ids); `src/lib/disclosure.ts` is
the only module that answers "may they see this name yet?"; four call sites ask it. The hook reads
one key per journey, which is more keys than a hook may subscribe to in a loop, so `store.ts`
gained `useStoreVersion()` — a single counter bumped on every write.

**Two gates, one bug.** A content test asserts every `reveals` id exists **and** that a journey
masks the pattern its own problem sits under (leaving that out is exactly how this leaks). The UI
test walks the three states — not started, midway, finished — plus the opt-out. It failed on the
first run: the sidebar footer's where-you-are line still read `DSA · pattern · Two Pointers`
(G4). Fixed in the same PR.

**Evidence.** `npm run check` 42/42 (was 41). `npm run test:ui` 20/20 (was 18). Live at
`unlocked=3`: sidebar rows read `?|· · ·` for both masked patterns, `h1` is `· · ·`; at 1 and 7
the names are back.

## 2026-09-05 — the stack lands on master, and the UI gets a gate (B2)

### The merge, and how it went wrong

Merging nine stacked PRs bottom-up with `--squash --delete-branch` broke the stack: deleting a base
branch closes the PR stacked on it. #2, #4, #6 and #8 were closed with conflicts; #3, #5, #7 and #9
merged into their **base branch**, not `master`. Only #1 reached `master`.

Nothing was lost — the whole chain survived on `feat/journey-three-sum`. Recovery was a rebase of
the eight commits onto `master` (`git rebase --onto master 02807f9`), verified content-identical
to the reviewed tip (`git diff` between pre- and post-rebase tips: empty), then one merge commit
via PR #10 so the eight stayed separate.

**The rule that follows:** never `--delete-branch` while another PR is stacked on it. Merge a stack
from the tip, or retarget every base first.

### B2 — the UI smoke test

`npm run test:ui`: `vite preview` on an OS-assigned port + the system Chrome headless, driven over
CDP with node's built-in WebSocket. No new dependency, no jsdom. 18 checks in ~28 s:

| Group | Checks |
|---|---|
| Routes | home · pattern list · problem page · visualizer · SQL · flashcards · one per journey (derived from `JOURNEYS`, so a new journey is covered automatically) · unknown route falls back home — each asserting real text **and** an empty console |
| The earn loop | fresh ledger → step the story act → answer the quiz → reveal → `unlocked=2`, `quizzes=["story"]`, `xp=15`, act switched to `brute` |
| Deep links | honoured on load · followed on an in-app hash change · **ignored when the act is locked** (the disclosure rule, now enforced in a browser) |
| Corner cases | the story act lists ≥ 3, and "load this input" changes the preset |
| Shell | `f` closes both rails and reopens them · `?` opens the shortcuts dialog · a settings change survives a reload |
| Phone | 390 px: `scrollWidth == clientWidth` |

**It found a bug on its first run (G1).** A deep link pasted while the same journey was already
open changed the hash and nothing else: `?act=` was read only in a `useState` initializer, and a
hash change remounts nothing. Fixed with a render-time adjust in `use-journey.ts`, guarded by
`unlocked` so a link into a locked act is still ignored, plus regression tests for both halves.

Two things the driver had to get right, both recorded in `browser.mjs`: `child.kill()` on Windows
leaves the node grandchild holding the port (kill the tree), and a `location.reload()` *inside* a
CDP evaluate destroys the execution context so the call never resolves (clear storage on one load,
navigate on the next).

**Not covered, said out loud** (in `ARCHITECTURE.md` §10): autoplay timing, the 45 s hint timer,
the Worker code challenge, the adaptive offer, hover-peek, and anything about colour or spacing.

## 2026-09-04 (later) — docs refresh: the maps catch up with the code

Branch `docs/refresh-after-shell-work`. Docs only.

Five branches shipped in one day and `ARCHITECTURE.md` had not been touched since the merge, so it
described a shell, a frame contract and a panel union that no longer existed. Refreshed:

| File | What was stale |
|---|---|
| `ARCHITECTURE.md` | no shell section (sidebar, dialogs, global keys, hover-peek, scroll panels); frame contract missing `corner`; `PanelModel` missing `terms`; state section missing `prefs` merge semantics, export/import and the `sidebar_state` cookie; invariants missing the corner-case and three-language rules; layer diagram missing `lib/dialogs.ts`, `lib/shortcuts.ts` and the lazy chunks |
| `PRD.md` | "two journeys" everywhere; non-goals still listed the settings gear, export/import and focus tiers as unbuilt; no P9 (corner cases) or P10 (three languages); §5.1 missing the act-1 cards, the callout and the layout; no payload requirement |
| `API.md` | `GET /api/journeys` sample listed two journeys; problem payload did not mention `java` / `cpp` |
| `FEATURES.md` | `prefs` row named two fields of four; no export/import or cookie note; test counts from before the new gates |
| `RESEARCH.md` | no entry for the books on disk — Khamies §3.1 is where the corner-case work came from |
| `README.md` | `src/lib` and `src/components` one-liners predate `dialogs.ts` / `shortcuts.ts` / the shell |

**Evidence.** A claim-checker script (scratchpad, not in the repo) reads the repo and asserts the
docs agree: journeys and act counts in `API.md` and `FEATURES.md` vs `JOURNEYS`, every
`PanelModel` kind documented in `AUTHORING.md` **and** `ARCHITECTURE.md`, every `K` key and every
`Prefs` field named in `FEATURES.md`, the stated test count vs `npm test`, and every relative
link. Result: journeys `two-sum` 7 acts / `single-number` 5 / `three-sum` 5, 10 panel kinds, 7
store keys, 4 prefs, 41 tests, 26 links, 0 broken — no mismatches.

## 2026-09-04 (later) — third journey: Triplets Summing to Zero

Branch `feat/journey-three-sum`, stacked on `feat/practice-code-tabs`. `docs/PROBLEMS.md` #3.

**What.** `src/engine/journeys/three-sum.ts` (LeetCode 15, Khamies §3.2.2): story (an auditor's
ledger — amounts that cancel in threes, reported by value, each once) → Brute Force (three loops +
a set of sorted triples; the predict fires the first time a repeat tries to enter) → Anchor + Hash
(sort, skip equal anchors, per-anchor pair search with a set — the reduction to Two Sum) → Anchor +
Two Pointers (order skips repeats and drives the squeeze; early stop when the anchor is positive) →
The Reveal (reduction / KSum, links to Two Sum and the two-pointers pattern). Four corner cases
(`tiny`, `dupes`, `zeros`, `none`), six presets (default = LeetCode's classic with the repeated −1),
quizzes and hints on every act, code in pseudo / Python / Java / C++ line-for-line. New panel kind
**`terms`** (k-term equation vs target, or `need` for an unknown term; the distinct answers found so
far with the newest ringed and a dropped repeat struck through; optional hash map) — added to
`types.ts`, `panels.tsx`, `AUTHORING.md`.

**What the gate caught before it shipped.** The new correctness test (three approaches agree on six
inputs) failed on `[0, 0, 0, 0]` for the hash act: `target = -s[k]` produced `-0`, so the triple
`[0, -0, 0]` was not equal to `[0, 0, 0]`. Fixed with `0 - s[k]`. The browser then showed React's
duplicate-key error in the hash view when two rows held the same amount; the per-anchor `seen` now
has set semantics (the second copy adds nothing).

**Evidence.** `npm run check`: tsc 0, eslint 0, `node --test` 41/41 (34 → 41: schema, tabs, drain,
edge cases, presets, disclosure, correctness for the new journey). CDP: story act renders 3 hint
triggers and 4 corner cards, note "−1 + −1 + 2 = 0 — one triple. There are 2 distinct triples…";
brute act on the classic → the "drop it" predict appears, answered → callout `dupes`, found list
`[-1, 0, 1]`, `[-1, -1, 2]` + the repeat struck through; hash act `step=7` → "need 2 — not seen",
hash map drawn, 0 errors after the fix; two-pointer `step=12` → 1 anchor (▲), 2 rings, 1 dimmed
finished anchor, equation "−1 + −1 + 2 = 0"; recap → 3 rows, links `#/journey/two-sum`,
`#/p/two-pointers`, chart 21 / 17 / 20 steps on the classic. Sidebar lists the journey with `1/5`.
Not eyeballed: `zeros` and `tiny` callouts in the two-pointer act (test-covered), `big` preset.

## 2026-09-04 (later) — three-language code on the practice set (F2)

Branch `feat/practice-code-tabs`, stacked on `perf/code-splitting`.

`Code {python, java?, cpp?}` on `Problem` and `Solution`; `SolutionBlock` shows a Python 3 / Java /
C++ strip sharing the journey's `codeTab` pref. Java and C++ written for every approach of Two Sum
(one-pass hash, brute, sort + two pointers), Single Number (XOR, hash counts, sort & scan) and
Triplets Summing to Zero (sort + two pointers, brute, hash per anchor) — 18 new blocks. New
`src/data/problems.test.ts`: ids unique, patterns valid, every block looks like a function, and a
journeyed problem must carry all three languages on every approach (31 → 34 tests).

Evidence: `npm run check` 34/34. CDP: `#/p/arrays-hashing/pair-sum` → Approach & Solution → tabs
`Python 3 · Java · C++`, Java click → first line `public int[] pairSum(int[] nums, int target) {`,
`prefs.codeTab=java`; `#/p/two-pointers/three-sum-zero` → Brute force → Java still selected. Not
compiled: the Java/C++ blocks were reviewed by eye, not run — a compile check is a follow-up if a
toolchain is added.

## 2026-09-04 (later) — code splitting (F1 / B22)

Branch `perf/code-splitting`, stacked on `docs/problem-pipeline`.

`App.tsx` lazy-loads `JourneyPage` and `AlgorithmsPage` behind one `Suspense` fallback.

| `vite build` | Before | After |
|---|---|---|
| chunks | `index` 673.77 kB (212.25 gzip) | `index` 400.23 kB (127.11 gzip) · `store` (engine + data, shared) 203.87 kB (66.70 gzip) · `journey-page` 43.52 kB · `use-flip` 20.90 kB · `algorithms-page` 9.46 kB · runtime 0.58 kB |
| initial JS on a content page | 673.77 kB | 604 kB (index + shared chunk) |

The shared chunk stays eager because `app-sidebar.tsx` imports `JOURNEYS` from `@/engine` for the
journey rows; a registry of slug / title / act count would let the engine load lazily too (noted on
F1). `npm run check` 31/31; CDP: `#/journey/two-sum`, `#/algorithms`, `#/` all render, 0 errors.

## 2026-09-04 (later) — the problem pipeline and the front-end proposals

Branch `docs/problem-pipeline`, stacked on `feat/shell-panels-help`. Docs only.

**Why.** The ask: a backlog of every problem in the app to be built "in this way", one at a time
with all approaches, code in Python 3 / Java / C++ per approach, the books on disk as sources, SQL
questions from the PDFs, and a reviewable list of animation and front-end changes.

**What.** `docs/PROBLEMS.md`: definition of done for one problem; the sources on disk and what each
is for; all 31 practice-set problems in three waves ordered by how much of the stage already exists
(wave 1 needs no new panel kind until Widest Container); the SQL track; the cross-cutting
three-language item; open questions (the Python section, journey vs. practice page, shared corner
cases). `BACKLOG.md` gains the F1–F12 proposals with tiers. ROADMAP, docs manifest, CLAUDE.md, PRD,
STATUS updated to point at it.

**Evidence.** Docs only — `npm run check` unchanged (31/31). Problem list generated from
`src/data/problems/*.ts` (31 ids, alternatives per problem), not typed by hand.

## 2026-09-04 (later) — panels, peek, settings, shortcuts, help

Branch `feat/shell-panels-help`, stacked on `feat/journey-edge-cases`.

**Why.** The ask: each panel scrolls on its own (sidebar / stage / reading column); closed rails
reveal themselves on hover and hide again; settings and keyboard shortcuts at the foot of the sidebar
with "where am I" details; an info icon at the top that explains how to use the app; the sidebar
split into subject sections.

**What.** Journey page on ≥ lg: inset is viewport-high, header + stepper fixed, stage and reading
column `overflow-y-auto`. `ui/sidebar.tsx` gains hover-peek (`data-peek`; the gap follows the real
state so content never shifts); the reading rail renders the same `ReadingBody` as a 26 rem overlay on
hover. New `lib/dialogs.ts` (which dialog is open), `lib/shortcuts.ts` (the key map, one source),
`components/global-keys.tsx` (`?`, `f`), `components/app-dialogs.tsx` (help, shortcuts, settings;
shadcn `dialog` added — the CLI wrote `from "cn"` and a stray `cn` dependency; both reverted).
`lib/store.ts` gains `exportProgress` / `importProgress` / `resetProgress` (prefs excluded). Sidebar:
DSA / DSA · patterns / SQL / Data science, help button in the header, footer = where-you-are +
settings + shortcuts + collapse. Closes B3 (minus theme), B5, B26.

**Evidence.** `npm run check`: tsc 0, eslint 0, node tests 31/31. CDP at 1440 × 1000:

| Check | Result |
|---|---|
| journey page scroll | `documentElement.scrollHeight` 1000 = viewport; stage `overflow-y: auto`; aside 818 px tall / 1063 scroll |
| sidebar groups / footer | `DSA`, `DSA · patterns`, `SQL`, `Data science`; footer `settings`, `keyboard shortcuts`, `collapse sidebar`; where = `DSA · journey · Two Sum` |
| sidebar peek | collapsed 48/48 (container/gap) → mouseover 256/48 with `data-peek=true` → mouseout 48/48 |
| reading peek | rail 44 px → overlay 416 px with the code tabs inside → gone on mouseout; stage stays 1072 px |
| `f` | 256 + 384 → 48 + 44 (`prefs.reading=false`) → back to 256 + 384 |
| `?` | dialog "Keyboard shortcuts", 9 rows |
| settings | motion select → `prefs.motion=cinematic`; copy fell back to the textarea (headless clipboard); import `{"unlocked:single-number":4,"xp":99}` → 2 keys, store updated |
| help | dialog "How to use dsa.patterns", 5 sections |

0 console errors in every run. Not verified: touch devices (peek is hover-only by design), the
erase-progress double click, Python section of the sidebar (there is no Python content yet — see
`docs/PROBLEMS.md`).

## 2026-09-04 (later) — corner cases as content, hints up front

Branch `feat/journey-edge-cases`, stacked on `feat/journey-focus-rails`.

**Why.** The ask: show hints and edge cases in the problem statement, and while solving, explain at
least once how each edge case affects the solution and how to think about it. Inspiration: Waleed
Khamies, *How to Solve Algorithm Problems* (2023) §3.1 — understand, formalize as input → output,
reread for hidden promises, bring three inputs (empty-case, medium-case, corner-case: duplicates,
negatives) before any code, brute force, analyse, optimise.

**What.** `Journey.edgeCases: EdgeCase[]` (`key, name, example, why, think, preset`) — 4 per
journey: Two Sum *tiny · duplicates · negatives · nosolution*; Single Number *single · last · zero ·
broken*. Frames gain `corner?: string`; every generator tags the frame where the case bites and its
note says what this approach did about it (13 tag sites in Two Sum, 8 in Single Number). Story acts
gain `hints` about *reading* the problem (reread · formalize · bring inputs), shown up front as an
accordion instead of the idle ladder. Story-act reading column gets the "bring three inputs" card
with a **load this input** button per case; the stage shows a teal callout under the narration while
a tagged frame is current. New presets `tiny`, `negatives` (Two Sum; `parse` now accepts −999…999)
and `zero` (Single Number). API meta exposes `edgeCases`.

**The gate grew.** New test per journey: ≥ 3 cases, unique keys, preset exists, **every case is
tagged by some act on its preset**, no frame tags an unknown key; the disclosure test now also lints
`edgeCases` prose against later act names. Tag coverage (`edges.ts` script, not in repo):

| Case | Preset | Tagged by |
|---|---|---|
| two-sum tiny | tiny | brute, twoptr, twopass, hash |
| two-sum duplicates | duplicates | brute, twoptr, hash (twopass hits the later copy first) |
| two-sum negatives | negatives | brute, twoptr, hash |
| two-sum nosolution | nosolution | story, brute, twoptr, twopass, hash |
| single-number single | single | brute, hash, sort, xor |
| single-number last | max | sort (the fallback line after the loop) |
| single-number zero | zero | brute, hash, sort, xor |
| single-number broken | twosingles | xor |

**Evidence.** `npm run check`: tsc 0, eslint 0, `node --test` 31/31 (29 → 31). Headless Chrome/CDP:
story act shows 3 accordion triggers (`reread`, `formalize`, `bring inputs`; first opens) and 4 corner
cards with `load this input`; clicking the second → preset `duplicates`, data `3, 1, 3, 8`, banner,
button `loaded ✓` with `aria-pressed`; brute act on `duplicates`, after the predict → callout
`data-edge=duplicates` with note "…j started at i + 1 so a slot never met itself"; Single Number sort
on `max` → callout `last` on the fallback frame; `GET /api/journeys/two-sum` lists 4 `edgeCases` and
8 presets; `POST parse` accepts `-3, 4, 3, 90` target 0. 0 console errors throughout. Not verified in
the browser: `negatives` and `tiny` callouts (covered by the test), the `zero` XOR bit rows.

## 2026-09-04 (later) — focus rails and a bigger stage

Branch `feat/journey-focus-rails`, stacked on `feat/merge-visualizer` (PR #1 still open).

**Why.** Reading a problem with the sidebar, the stage and the reading column all open left the
stage 717 px wide at 1440 and the chips at 44 px. The ask: close either rail from a button at its
foot, keep that button on the rail, and make the working area and its type bigger.

**What.** `AppSidebar` is `collapsible="icon"` with a footer toggle (icons + tooltips on every row,
wordmark → `d.`, state in shadcn's `sidebar_state` cookie). The journey reading column collapses
to a 2.75 rem rail with the same toggle at its foot (`prefs.reading`; `usePrefs` now merges over
`DEFAULT_PREFS` so a pref added later reads as its default). Journey page `max-w-7xl` →
`max-w-[110rem]`. Type scale: narration 16/18 px, reading column 15 px, chips 56 px with 20 px
digits, sum 24/36 px, code 13.5 px on 28 px lines, bit cells 36 px.

**Evidence.** `npm run check`: tsc 0, eslint 0, node tests 29/29 (unchanged from baseline). Headless
Chrome over CDP at 1440 × 1000, `#/journey/two-sum?act=hash&step=6`:

| State | stage width | right column | sidebar | console errors |
|---|---|---|---|---|
| both open (baseline) | 717 px | 384 px | 256 px | 0 |
| reading closed | 1072 px | 44 px rail | 256 px | 0 |
| both closed | 1280 px | 44 px rail | 48 px rail | 0 |

Toggles measured at the foot of each rail (left y = 960 of 1000; right sticky above the fold),
`dsa:prefs` gained `"reading":false`, cookie `sidebar_state=false`. 390 px: `scrollWidth = 390`,
the collapsed rail is a 38 px bar. Not verified: keyboard focus order across the new buttons.

## 2026-09-04 — the merge: one repo, one app, two journeys, an API, the docs

Branch `feat/merge-visualizer`, pushed to `SathishKumarAI/dsa_problems` (created this session); PR #1 against `master`.

| Commit | What |
|---|---|
| `feat(site)` baseline | The uncommitted Vite + React + shadcn practice site committed as-is so the merge diff is readable. |
| `chore(legacy)` | `dsa_visualizer` main subtree-merged under `legacy/visualizer/` — 47 commits of history preserved, folder excluded from build/lint. |
| `feat(engine)` | Journey engine ported to typed, DOM-free TypeScript; `view()` returns a `StageModel` instead of HTML; hash-map bucket model; sort/search/graph generators; the whole HTTP API as one pure `route()` mounted by Vite middleware, `node:http`, and in-process. Content gate as `node --test`. |
| `feat(ui)` | Journey page, algorithm visualizer, hash router, store. |
| `docs` | This documentation set + README, CLAUDE.md, STATUS.md. |

**Why the port instead of embedding the vanilla pages.** The visualizer was 8 200 lines of
string-concatenated HTML in a 1 200-line `journey.js`; the practice site was typed React with
shadcn. Embedding would have kept two shells, two theme systems and two progress stores. The
port cost a day and produced a content schema whose invariants are tests, and a view model that
any client can draw.

**Evidence.** `npm run check` → tsc 0, eslint 0, `node --test` 29/29. `vite build` 644 kB
(203 kB gzip). Headless Chrome over CDP (the MCP browser was held by another session; a private
Chrome on port 9333 was driven with a 60-line script):

| Check | Result |
|---|---|
| `#/journey/two-sum` story act | renders on an empty stage, `🎁 → 🛒 → ❓`, 0 console errors |
| `?act=hash&step=6` deep link | restores act + step; hash iceberg shows 3 keys / 8 buckets / load 0.38 / 1 collision |
| `?act=twoptr&step=4` | sorted view with `#n` subscripts, ▲ on L, ring on R, `2 + 44 = 46` |
| `single-number?act=xor&step=4` | bit rows, flipped bits ringed, chart with two bars |
| brute act stepped to the return | predict card appears **before** the return frame renders |
| fresh `unlocked=1`, story stepped to the end | quiz card; both answers right → reveal button → click → `unlocked=2`, `quizzes=["story"]`, `xp=15`, stepper shows 2 nodes, act switched to brute |
| challenge act, one-pass map typed, Run tests | 6/6 green, +25 XP, scorecard 30 touches vs 30 |
| challenge act, brute force typed, Watch my code | "traced 14 array accesses", stepping shows `access #5: your code read nums[0]`, 15 frames |
| recap act | 5-row table, two link cards |
| `#/algorithms?algo=quick` stepped 25× | bars with values, pivot green, 15 compares · 8 writes |
| `#/algorithms?algo=bfs` stepped 9× | SVG graph, visited green / frontier peach / current yellow |
| 390 px viewport | no horizontal scroll (`scrollWidth = 390`); bucket table scrolls in its own box |

**Not verified this session** (listed honestly): autoplay timing by eye, the 45 s hint timer, the
n = 400 second set, the adaptive-difficulty offer, reduced-motion on a device, `npm run api` under
load. All are code paths without a browser test — backlog B2.

**Decisions made without the user** (autonomous session): Two Sum + Single Number as "the two
problems"; API = stateless HTTP over the engine, not a persistent backend; `../dsa_visualizer`
left untouched (it has an uncommitted `feat/disclosure-lint` branch whose intent — masked
catalog entries — is recorded as B8); sorting visualizer ported in reduced form.
