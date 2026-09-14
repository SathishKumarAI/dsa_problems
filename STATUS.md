# STATUS — read this when you return

## Where the code is

**Branch `refactor/problems-dir-balanced-brackets`.** It moves one problem to the shape the rest
will follow: **`src/problems/<id>/`, one directory per problem**, holding the record and the
teaching document side by side, one file per section, every file under 200 lines.

`balanced-brackets` is the worked example — 110 lines of record plus a 620-line Markdown document
became 14 files. Read **`src/problems/README.md`** before converting the next one; it is the
change → file table and the rules.

**The one thing to hold on to:** there are **two entry files** and that is load-bearing.
`index.ts` is the `Problem` record and is imported statically by the pattern barrel, so it is in
the first chunk. `doc.ts` is the `TeachingDoc` and is reached only by `lib/content.ts`'s
`import.meta.glob`, so its ~30 KB of prose is a chunk of its own. **Nothing eager may reach a doc
file**, or 127 documents join the first load and B95 is undone.

Verified green on this branch, not asserted:

| Gate | Result |
|---|---|
| `npm run check` | **774 tests, 0 fail** (tsc + eslint + node) |
| `npm run test:ui` | **171 / 0 fail**, real Chrome |
| `npm run verify:code` | **758 blocks compiled, 0 failed** (up from 756 — the promoted counter rung) |
| `npm run verify:run` | **2,186 oracle runs, 4,372 translations, 0 disagreed** (2,168 / 4,336 before — the two counter blocks that `cDefs` used to skip) |
| `node scripts/verify-deep.mjs --id balanced-brackets` | ran clean and reported agreement |
| `node scripts/content-roundtrip.mjs --id balanced-brackets` | **470 of 470** source lines carried through |
| `node scripts/learn-gaps.mjs --strict` | clean; the ratchet dropped 105 → 104 |
| The page, driven in Chrome at 1440 | the new **failure modes** section renders, 3 approaches, 3 rungs, 7 tables, 14 code blocks, no raw Markdown, no sideways scroll, no console errors |

### Two brace counters were lying, and one of them was skipping work

Both `problems.test.ts`'s well-formed check and `localsmith/run.mjs`'s `cDefs` counted `{` and `}`
as structure without skipping character and string literals. A rung whose code tests `ch == '{'`
was called malformed by the first, and by the second was never closed at all — so it reported
**"no function to call"** and silently skipped both translations. That reads exactly like a rung
that passed. Both strip literals before counting now. The repo's own rule said it already: to find
code, parse it; do not count braces.

### What is left of the migration

**68 documents to go** (B97). The converter emits the whole directory now, so the next one is:

```
node scripts/md-to-content.mjs --id <id>      # bind its rungs in scripts/rung-bindings.json first
node scripts/content-roundtrip.mjs --id <id>  # prove no line was lost, THEN delete the md
node scripts/verify-deep.mjs --id <id>
```

The thirteen documents converted before this branch moved to `<id>/doc.ts` unchanged — they are not
split into sections and their records have not moved. Split each when someone next touches it; there
is no value in a mechanical pass over prose nobody is reading.

`src/content/` now holds only `types.ts` and `content.test.ts`. Renaming it is churn on top of an
already wide diff; do it in a commit of its own or leave it.

## Start here

1. **`docs/LEARN-PLAN.md`** — the ordered queue. The current item is #2/3/4, retrofitting the
   remaining **117** documents in sidebar order.
2. **`docs/LEARN-GAPS.md`** — per problem, exactly what is missing. Regenerate with
   `node scripts/learn-gaps.mjs`; never trust the numbers in prose, including the ones below.
3. **`docs/deep/TEMPLATE.md`** and **`docs/deep/PROMPT.md`** — the skeleton and the brief. Read the
   four-readers table before writing anything.
4. **`CONTRIBUTING.md`** — new. If you are not the owner, this is your entry point.

## What "done" looks like right now

| | |
|---|---|
| Problems | **127**, 10 patterns |
| Journeys | **93**; the other 34 ship a static walkthrough |
| Teaching documents | **82**; **45** problems have none. **14 are typed** (`src/problems/<id>/doc.ts`), 68 are still Markdown |
| Documents with all three required sections | **10 of 127** |
| Thin rungs (summary under 160 chars) | **0** — B68, closed 2026-09-13 |
| Undisclosed approach additions | **0** |

All seven gates green: `check` **758/758** · `test:ui` **166/166** · `verify:code` **752 blocks, 0
failed** · `verify:run` **2,168 oracle runs, 4,336 translations, 0 disagreed** · `verify:vectors` ·
`verify-deep` **82/82 agreed** · `learn-gaps --strict` clean. `npm run build` clean.

## The next action, concretely

Retrofit **`group-anagrams`** — it is #6 in sidebar order and the next one in the queue. The method
that produced the last five, in order:

1. `grep -n "^## " docs/deep/<id>_explained.md` to see the shape.
2. Extract the document's last Python fence to a scratch file (that is what `verify-deep.mjs` runs)
   and write a **candidate measurement** against it. Do not write prose first — the measurement
   decides what the prose says. Three of five documents so far found something nobody expected.
3. Add three things to the document: `## Reading the Calculations` (symbol table, the one
   rearrangement, a hand-trace whose rows the script prints), `## How to Get Fluent` (drills with
   done-conditions), and at least one `> **Under the hood.**` callout **carrying a measured number**.
4. Move the measurement code **into the document's own script** so a reader reproduces it. Keep
   `ALL APPROACHES AGREED` as the last thing printed.
5. Re-run the script, and **pin the prose to that run's actual numbers.** Timings move between runs;
   exact counts do not.
6. `node scripts/verify-deep.mjs` · `node scripts/learn-gaps.mjs` · lower the ratchet in
   `scripts/learn-gaps.test.mjs` by one · `npm run docs:learn` (**mandatory** — the drift gate fails
   without it) · `npm run check` · commit.

Budget about 2–4 hours per document at this depth.

## Traps that cost real time this session

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
| **B67** | 34 problems still without a journey — arrays-hashing (9), two-pointers (7), trees (4) are the big slices |
| **B70** | 45 problems with no teaching document — trees, heaps, graphs, dp are thinnest |
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
