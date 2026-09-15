# STATUS — read this when you return

**The project is called Patternsmith.** *Learn the idea before you learn its name.* Renamed
2026-09-15 (#106). The GitHub repo slug is still `dsa_problems` on purpose, so no link breaks —
do not "fix" that unless you also update every clone and reference.

## Where the code is

**`master`, clean, everything merged.** This session shipped **#97 through #106**. Branch from
`master`.

| | |
|---|---|
| Problems | **153**, 19 patterns, 0 orphans |
| Journeys | 93; the other 60 ship a static walkthrough |
| Records in `src/problems/<id>/` | 84 (58 converted, 26 written fresh) |
| Playbook moves · references | 83 · 57, across 19 patterns |
| Gates | `check` **789** · `test:ui` **178** · `verify:fences` 338 clean (baseline 7) · `verify-deep` **82/82** |

### What this session was about, in one line

The app read as **two products** — "DSA journeys" and "DSA patterns" — with 93 of 127 problems
appearing twice under two headings. It is one noun now: a problem, with its journey as a mode of it.
Then the patterns went 10 → 19 and the problems 127 → 153, aimed at coverage rather than count.
Full account: `docs/WORKLOG.md`, entry for 2026-09-15.

### One noun, on every surface

Five surfaces offered a way into a problem or a pattern, and four of them
disagreed about what the noun IS. Fixed across #97, #98 and #99.

| Surface | Was | Is |
|---|---|---|
| Sidebar | a catalogue of journeys above a catalogue of patterns | Continue (in play) + one catalogue |
| Problem page | a button, a panel and a 34-screen wall | a mode bar, explanation collapsed |
| Home | 6 journey links, **0** patterns | 1 (the dock), **18** |
| Pattern list | **0** problem links — every row a `<button>` | **21** |
| Search palette | **220** rows for 127 problems | **127**, marked |
| Pattern page | name + an 80-char blurb + a list | orient / act / review, playbook and reading |

`#/resources` was the last one: a second page about a pattern, carrying its
playbook and references beside a pattern page carrying the name, the same
references and the same problems. It redirects now.

**Eight of the ten patterns had no playbook.** 47 moves now, up from 11.

**Then 18 patterns became 19, and the thin ones got problems.** Eight patterns owned one or two
problems each, which is a playbook over a list of one. 26 problems added across them, plus **trie**,
which the previous branch withheld on purpose until problems existed for it. Smallest page is now 3
rows, was 1. Every rung was RUN: 76 of them, agreeing with each other on the vectors, and 213 calls
checked against the published examples. Python only — Java and C++ are optional until a problem has
a journey.

**Then ten patterns became 18.** prefix-sums, greedy, bit-manipulation, backtracking, matrix,
intervals, union-find and design — 79 moves and 54 references across the 18, and **14 problems
re-filed** onto the pattern the repo actually teaches them with. A problem moved only when the
approach on its own ladder IS that pattern: `jump-game` went to greedy because its top rung is
the furthest-reach sweep, and `coin-change-min` stayed in DP because greedy is *wrong* there
and the playbook says so. **Trie was left out on purpose** — zero problems, so the page would
be a name over nothing, which is what the previous branch spent itself fixing.



Four surfaces offered a way into a problem and three of them disagreed about what a problem IS.
Fixed in two branches — #97 (the sidebar and the problem page) and #98 (home and the catalogue
rows).

| Surface | Was | Is |
|---|---|---|
| Sidebar | a catalogue of journeys above a catalogue of patterns | Continue (in play only) + one catalogue |
| Problem page | a primary button, a bordered panel and a 34-screen wall | a mode bar, explanation collapsed |
| Home | 6 journey links, **0** pattern links | 1 journey link (the dock), **10** patterns |
| Pattern list | **0** problem links — every row a `<button>` | **21** problem links |

That last one is a plain bug and it had been there all along: a `<button onClick>` cannot be
middle-clicked into a new tab, offers nothing on right-click, and shows the browser no destination.
The sidebar's own header states the rule — *"every entry a hash link so back/forward and
middle-click work"* — and the catalogue was the one place that broke it.

### One entry point per problem

The sidebar opened with a catalogue of JOURNEYS and carried a catalogue of patterns below it, so
**93 of the 127 problems appeared twice**, under two headings, and the app read as though
"journeys" and "patterns" were two products. The titles were not the problem — 92 of 93 agree. The
structure was.

A problem is one noun; its journey is a mode of it. The journey list is **Continue** now — started
and unfinished only, absent when there is nothing to resume — and the one catalogue is
"Problems · by pattern". The problem page opens with a mode bar: the journey (primary where one
exists, carrying `3/5`), Solve on LeetCode, Learn this problem.

**And the page I merged in #91 was 34 screens tall.** I verified "no sideways scroll" and never
measured HEIGHT. `pair-sum` was 33.8 screens, of which 29.7 was the explanation. It is collapsed
now, and not fetched until opened: **4.3 screens closed, 33.8 opened.**



Five branches, stacked in this order. Merge them in it.

| | Branch | What |
|---|---|---|
| **#90** | `refactor/problems-dir-balanced-brackets` | one directory per problem, proved on one |
| **#91** | `feat/one-page-per-problem` | the explanation stops being a second route |
| **#92** | `refactor/problems-dir-batch-1` | 25 more problems moved |
| **#93** | `refactor/split-doc-monoliths` | the last 13 finished — every directory whole |
| **#94** | `feat/promote-rungs-slice-1` | the first 10 B79 promotions, and the 10 problems they unblocked |

**49 of 127 problems** live in `src/problems/<id>/`, both halves, split into sections.
**49 of 82 documents** are typed; 33 are still Markdown. Nothing under `src/problems/` is over the
500-line ceiling.

`#/p/<pattern>/<id>` is the only route a problem has. The explanation is a section at
`#explanation`, gated by the same `capped` flag as the ladder — the SECTION, not just the door.

### What is left, and what it costs

**33 documents, 78 new rungs.** 22 need 2, 10 need 3, `isomorphic-strings` needs 4. Every one of
them teaches approaches the record has no entry for, so each owes B79 before it can convert.

The Python is never written — it is lifted from the document's own `### Code` section. The work is
the two translations, **156 blocks** across those 33 problems, and `docs/MODELS.md` is the policy:
local models draft, `verify:code` and `verify:run` decide. That is the cheaper path than writing
them by hand, and the gates are already exactly the ones it needs.

Then, separately: problems with no teaching document at all — **45 when this was written, 71 after
the 2026-09-15 batch added 26 more**. That is writing, not migration.

### Two mechanism bugs this slice found

* **The ladder could only put an extra at the foot or the top**, and five of the ten were STEPPING
  STONES. sorted-squares reaches its answer *through* "split at zero and merge two runs", and the
  rule rendered it ABOVE the answer — the one ordering the page promises it never shows (R1).
  tree-diameter has no journey at all, and its misplaced rung silently moved `whyNow` above the
  wrong one: the sentence explaining why the one-pass fold beats a cached map ended up over a rung
  about the call stack. `Solution.after` names the rung a stepping stone follows;
  `problems.test.ts` fails the build if the name resolves to nothing.
* **A UI test named `max-depth` as its Markdown example** and this slice converted it, so the check
  failed on a document that had simply graduated. It reads the richest still-Markdown problem off
  disk now — the same lesson as `EXPLAINED`, learned twice.

The `max-depth` ladder gate earned its place too: promoting `paths` to the foot meant `bfs` was no
longer the first rung and needed the sentence saying what it beats. Nothing else would have noticed.

### The recipe, now proven three times

```
node scripts/split-record.mjs --id <id>            # the RECORD -> src/problems/<id>/
node scripts/md-to-content.mjs --id <id>           # the DOCUMENT -> the same directory
node scripts/content-roundtrip.mjs --id <id>       # prove no line was lost, THEN delete the md
node scripts/verify-deep.mjs --id <id>
```

Bind the rungs in `scripts/rung-bindings.json` FIRST — it is the one judgement a machine must not
make. Rewire the pattern barrel and any journey that imports the record, delete both sources, and
run `npm run docs:learn`. A promoted rung also means the journey must name its act by KEY, not by
index, in the same commit.

**A stale disclosure is content that becomes a lie.** Three documents in this slice opened their
promoted approach with "this rung is an addition — not in the data file's ladder", which the
promotion made false. `content-roundtrip.mjs` reported them as lost content, which is how they were
found; delete them from the Markdown deliberately so the diff shows it.

Verified green on #94, not asserted:

| Gate | Result |
|---|---|
| `npm run check` | **780 tests, 0 fail** *(that slice; 789 as of 2026-09-15)* |
| `npm run test:ui` | **172 / 0 fail**, real Chrome *(178 as of 2026-09-15)* |
| `npm run verify:code` | **778 blocks compiled, 0 failed** — up from 758, the 20 new translations |
| `npm run verify:run` | **2,239 oracle runs, 4,478 translations compared, 0 disagreed**, zero launch flakes |
| `verify-deep.mjs` | **82/82** ran clean and reported agreement |
| `content-roundtrip.mjs --all` | every line of all 10 carried through |
| `learn-gaps.mjs --strict` | clean; ratchet 81 → 72 |
| `gen-manifest.mjs --check` | clean |

Each moved record was **deep-equalled against the one the catalogue carries** before its original
was deleted.

## Start here

1. **`docs/BACKLOG.md`** — the top unchecked P0. **B65** now means coverage, not count.
2. **`docs/LEARN-GAPS.md`** — per problem, exactly what is missing. Regenerate with
   `node scripts/learn-gaps.mjs`; never trust a number in prose, including the ones on this page.
3. **`docs/deep/TEMPLATE.md`** and **`docs/deep/PROMPT.md`** — the skeleton and the brief, if you
   are writing a teaching document.
4. **`CONTRIBUTING.md`** — if you are not the owner, start here.

## What "done" looks like right now

| | |
|---|---|
| Problems | **153**, 19 patterns · 0 orphans |
| Journeys | **93**; the other **60** ship a static walkthrough |
| Teaching documents | **82**; **71 problems have none** (26 of those arrived on 2026-09-15) |
| Thin rungs (summary under 160 chars) | **0** — B68, closed 2026-09-13 |
| Undisclosed approach additions | **0** |

All eight gates green: `check` **789/789** · `test:ui` **178/178** · `verify:code` · `verify:run` ·
`verify:vectors` · `verify-deep` **82/82** · `verify:fences` **338 clean, baseline 7** ·
`learn-gaps --strict`. `npm run build` clean.

## The next action — pick one of three

**1. More problems, thinnest pattern first (B65).** The nine newest patterns sit at 3–5 problems
where the mature ones are at 9–17. `trie` (3), `matrix` (4), `union-find` (4) and `design` (4) are
the thinnest. The method is proven and scripted — see the WORKLOG entry for 2026-09-15, section
*"Twenty-six problems"*: author the content, emit the directory, then verify **twice** (rungs
against each other, and rungs against the published examples). Roughly a day for 26.

**2. Teaching documents for the 71 problems without one (B70).** The highest-value single thing,
and the slowest: 2–4 hours each. Method unchanged — measure first, let the numbers decide the
prose, move the measurement into the document's own script, pin the prose to that run's output.
Lower the ratchet in `scripts/learn-gaps.test.mjs` by one in the same commit.

**3. B71 — audit every rung labelled *optimal*.** The smallest of the three, and it fixes a claim
that is currently false: timing found the designated optimal rung LOSING on the clock in 3 of 5
problems measured. Not a wrong asymptotic — an unstated claim that the top rung is the one to
reach for. Two acceptable outcomes per problem: relabel, or add the sentence naming when the lower
rung wins. Silence is the only unacceptable one.

## Traps that cost real time this session

- **A mutation test can destroy the fix it is testing.** Proving a new gate could fail, I reverted
  `ui/toggle.tsx` with `git checkout --` while the fix in it was **still uncommitted**. PR #103
  merged without it, and its own commit message quoted the gate as green. **Commit first, then
  mutate** — or stash. The gate caught it on the next branch, which is the argument for writing it.
- **A name split across a span is invisible to a search for the name.** The home headline was
  `dsa<span>.patterns</span>`, so a rename sweep for `dsa.patterns` missed the biggest instance of
  it on the site. Found by opening the page and reading the header. Read the rendered page, not the
  diff.
- **A gate's own output can be wrong for months.** `verify-deep.mjs` printed `82/33` — numerator
  counting both document sources, denominator counting one. Nothing failed, so nothing complained.
  When a gate prints a ratio, check that both halves count the same thing.
- **The learn-gaps ratchet counts PROBLEMS, not documents.** Adding 26 untaught problems moved every
  count by 26 without a single document getting worse. Raising the baseline was right; raising it
  without recording the problem count beside it would have made the ratchet quietly meaningless.


- **A `bash` heredoc cannot carry prose containing apostrophes.** The Bash tool wraps the command in
  `bash -c '…'`, so the first `'` in the payload ends the string — quoting the heredoc delimiter
  does **not** help. Write the Python helper with the Write tool, then run it. This cost two
  attempts before it was recognised.
- **Rewriting `src/data/problems/**` in bulk:** replace from the `summary:` label onward, never from
  `name:` (which eats any `whyNow` above it), and emit **one long quoted line** — adjacent quoted
  lines are Python implicit concatenation and a TypeScript syntax error.
- **`npm run docs:learn` is not optional** after touching `src/data/**` or `docs/deep/**`. The drift
  gate fails without it and the failure looks unrelated.
- **A measurement that hangs is a finding.** Timing `product-except-self` at `n = 10^5` with values
  in −30..30 never returned, because that input violates the problem's own 32-bit constraint. That
  became the document's best callout.
- **`git add -A` while another agent writes is how you get a torn commit.** Stage explicitly.

## Open, and worth knowing before you pick anything up

| Item | State |
|---|---|
| **G11** | `top-k-frequent`'s optimal rung is the slowest real rung on its page — the `n + 1` bucket wall is 5.8 of its 13.2 ms. Filed, **not** fixed: Approach 4's own Watch out currently teaches `n + 1` as the *correct* size against the `len(nums)` crash, so a third sizing needs that callout rewritten rather than appended to |
| **The sweep G11 implies** | Three of the five documents retrofitted found the designated optimal rung losing on the clock. That hit rate argues for auditing every "optimal" label, not just fixing this one |
| **B67** | **60** problems still without a journey — every one of the 26 added on 2026-09-15, plus arrays-hashing (9), two-pointers (7), trees (4) |
| **B70** | **71** problems with no teaching document — the nine newest patterns have none at all |
| **B65** | Coverage, not count: trie (3), matrix (4), union-find (4) and design (4) against 9–17 in the mature patterns |
| **`docs/EDGE-CASES.md`** | Not started. Generate it from `journey.edgeCases` joined to the `> **Watch out.**` callouts; every case must name the approach it breaks and be **run**, not asserted |
| **Statistics chapter 5** | Hypothesis testing, still unwritten |
| **Learn page contents rail** | Should collapse to approach level; pages are long now |

## The stashes are gone

An earlier version of this file described four stashes and warned to merge rather than
`git stash pop` them. **`git stash list` now returns nothing**, checked 2026-09-13 after the merge.
The problem-page redesign that was the one worth recovering shipped that day (G10, ticked).

Recording the correction rather than deleting the section, because a stale warning about
irreversible git operations is worse than no warning — and because this is the same class of defect
the content gates exist to catch: a claim that read fine and was not true when run.

## The process finding, because it cost real work

Two agents wrote this branch at once. The other one committed four times, twice before the browser
suite had run; `350d7f4` is a torn snapshot that does not compile. It also filed two already-fixed
findings into the backlog as open, and twice wrote provenance into the ledger claiming approvals
that never happened — its *code* claims measured true every time, its claims about what had been
**asked for** did not.

**One writer per branch.** If a background agent is committing this repo, turn it off before working
here. The rules are in `docs/AGENTS.md`.
