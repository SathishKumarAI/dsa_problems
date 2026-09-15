# STATUS — read this when you return

## Where the code is

Three branches, stacked in this order. Merge them in it.

| | Branch | What |
|---|---|---|
| **#90** | `refactor/problems-dir-balanced-brackets` | one directory per problem, proved on one |
| **#91** | `feat/one-page-per-problem` | the explanation stops being a second route |
| **#92** | `refactor/problems-dir-batch-1` | 25 more problems moved |

### Where a problem lives now

`src/problems/<id>/` holds both halves. **39 of 82** documents converted; 43 still Markdown.
Read `src/problems/README.md` before converting the next one — it is the change → file table, the
rules, and the two-script recipe.

**Two entry files, and it is load-bearing.** `index.ts` is the `Problem` record and is imported
statically by the pattern barrel, so it is in the first chunk. `doc.ts` is the `TeachingDoc` and is
reached only by `lib/content.ts`'s glob. **Nothing eager may reach a doc file**, or 127 documents
join the first load and B95 is undone.

`#/p/<pattern>/<id>` is the only route a problem has; the explanation is a section at
`#explanation`, gated by the same `capped` flag as the ladder — the SECTION, not just the door.

### The batch, and what its round-trip caught

25 problems, chosen as every document whose approaches already matched its ladder, so the batch is
one kind of work and owes no B79 promotion. `content-roundtrip.mjs` refused the batch **twice**, and
both causes hit every remaining document:

* **`## Understanding` can hold a SECOND table.** The old strip took every `|` line in the section
  and parsed the lot as one table, which is right only while there is one. A misconception table, a
  "what 3Sum does differently" table, a false-start trace — **5 documents**, every row gone.
* **The constraints `###` part is not only a table.** Four documents argue under that heading what
  the bound actually buys, and zero-matrix's — *at most `rows + cols` bits describe a 40 000-cell
  answer* — is the reason its last rung exists. Lifting the whole part lost **15 documents**' worth.
* Then mirror-tree alone: **two tables under one heading**. Only the first contiguous run comes out.

`mirror-tree` was also the batch's one real judgement call: its document teaches the recursion
before the iterative version and the ladder has them the other way round, so its binding is not
ladder order. That is what `scripts/rung-bindings.json` is for.

### The record half has its own script and its own proof

`scripts/split-record.mjs` slices each top-level key out as TEXT — no parse, no re-serialise,
because a record is mostly template literals holding Python whose indentation is the program. It
outdents by two and skips the inside of a template literal while doing it. Every move is
**deep-equalled against the record the catalogue carries before the original is deleted**, and
`scripts/split-record.test.mjs` re-proves it on every change, plus that no code block's indentation
stopped nesting.

Verified green, not asserted:

| Gate | Result |
|---|---|
| `npm run check` | **778 tests, 0 fail** |
| `npm run test:ui` | **172 / 0 fail**, real Chrome |
| `npm run verify:code` | **758 blocks compiled, 0 failed** |
| `npm run verify:run` | see the branch's commit — run in full on the batch |
| `verify-deep.mjs` | **82/82** ran clean and reported agreement (43 from Markdown, 39 from a field) |
| `content-roundtrip.mjs --all` | **every line of all 25** carried through |
| `learn-gaps.mjs --strict` | clean; the ratchet dropped 104 → 81 |
| `gen-manifest.mjs --check` | clean |

### The next action, concretely

**Split the 11 `doc.ts` monoliths.** They are the only files in `src/problems/` over the 500-line
ceiling — 928 lines at the worst (`backspace-compare`) — because branch #90 moved the thirteen
earlier documents here *unchanged* rather than re-converting them. Their Markdown is gone, so
`md-to-content.mjs` cannot be re-run: this needs the same textual treatment `split-record.mjs` gives
a record. Their records have not moved either.

After that: **43 documents to go**, and every one of them teaches approaches the record has no entry
for, so each owes B79 promotion — a keyed alternative with Python, Java and C++ — before it can
convert. That is the expensive half, and it is all that is left.

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
