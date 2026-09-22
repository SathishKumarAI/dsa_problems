# STATUS — read this when you return

**The project is called Patternsmith.** _Learn the idea before you learn its name._ The GitHub repo
slug is still `dsa_problems` on purpose, so no link breaks — do not "fix" that unless you also
update every clone and reference.

## The last session, in one line

**Thirteen branches, #114 → #126: the site grew a glossary, a ledger of everything it is still
missing, the first 16 problems at the pilot's depth, and a clock on every rung of them.** Full account, with the measurement behind
each one: `docs/WORKLOG.md`, entry for 2026-09-21.

|                              |                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Problems                     | **153**, 19 patterns, 0 orphans                                                               |
| **The five playbook fields** | **16 of 153** (was 1). `unlocks` · figures · `checks` · `costWhy` page + per rung · `reading` |
| **Pages that owe nothing**   | **16 of 153** — per-problem ledger: `docs/PAGE-BACKLOG.md` (generated)                        |
| **Glossary**                 | **31 entries** at `#/g`, 27 `[[term]]` links from problem prose, 13 distinct entries reached  |
| Journeys                     | 93; the other 60 ship a static walkthrough                                                    |
| Teaching documents           | 82; **71 problems have none**                                                                 |

### Gates, as of the last run

| Gate                                    | Result                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `npm run check`                         | **875 / 0 fail**, exit 0                                                    |
| `npm run test:ui`                       | **171 / 0 fail** in `ui-smoke` (185 including the panel audit), real Chrome |
| `npm run check:links`                   | **72 URLs, 0 dead** — cached 30 days, re-run with `--fresh`                 |
| `node scripts/page-backlog.mjs --check` | current (a node test fails the build when it is stale)                      |
| `npm run verify:vectors`                | **RED — 22 survivors across 11 problems.** Real, pre-existing, filed as G12 |

**Run `verify:vectors` alone.** Beside `test:ui` it reported 92 survivors, 69 of them phantom: the
Python children were starved of CPU. The gate now says which kind of failure it hit, but a count
from a loaded machine is still not evidence.

## What changed, by surface

| Surface                         | What is new                                                                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Any figure**                  | Capped inline (`--figure-inline`), fades when cut, **full size** opens it over the page                                                                                                                               |
| **The glossary** (new)          | `#/g` index, `#/g/<slug>` per entry, sidebar row under Reference. `[[hash map]]`, `[[dict]]`, `[[big-o\|its bound]]` in prose → dotted link + hover definition. "What links here" computed from prose, never authored |
| **Foot of a problem page**      | "What this page still owes", in the reader's language, absent when it owes nothing, hidden mid-journey                                                                                                                |
| **Reading list**                | Two groups in columns — this problem's sources (2 cols), the pattern's (3 from `lg`) — each row a real link. 591 → 335px at 1440                                                                                      |
| **Below `xl`**                  | "On this page" button → bottom sheet listing the same sections the rail lists                                                                                                                                         |
| **`components/problem/`** (new) | `page-sections.ts` (what the page draws — plain `.ts`, gated), `orient-zone`, `act-zone`, `compare-view`, `closing-bands`. `problem-detail.tsx` 821 → 490 lines                                                       |

## The next action — the order the owner picked, with one item already half-built

**1. B71 — the optimal-rung audit. 16 of 153 done; the method is proven.**
`npm run time-rungs` times every rung of a problem on a bench authored at that problem's own
constraint ceiling (`scripts/benches.mjs`), best of N, and fails only on a disagreement the page is
SILENT about — the clock does not change when the prose does, so a gate that failed on the
disagreement itself could never go green.

The first pass found **five pages whose answer loses to a rung below it**, and all five now say so:
group-anagrams (sorted key 10.6 ms against the tally's 25.3), longest-unique-substring (the jump 4.4
against 7.1), valid-palindrome (clean-then-reverse 8.1 against 9.4), max-depth (BFS 1.8 against the
recursion's 2.3) and move-zeroes (0.4 against 0.5 — which refuted a sentence this repo had written
and never measured).

**What is left: benches for the other 137 problems**, and acting on whatever they say. Write the
bench when you write the five fields — the constraint ceiling is already in your head at that point,
and a bench that violates the problem's own constraints measures a different problem (it happened
here: random ±30 on `product-except-self` makes the running product thousands of digits).

Give it a quiet machine: a timing run beside a browser suite is the exact mistake #116 exists to
prevent.

**2. G12 — the 22 vector survivors** across combination-sum, connect-the-network, contiguous-array,
hamming-weight, implement-trie, insert-interval, non-overlapping-intervals, redundant-connection,
summary-ranges, zero-matrix and one more. Each is a MISSING CASE, not a bug: the vectors cannot tell
a mutated solution from the real one. `node scripts/localsmith/mutate.mjs --id <id> --suggest` will
go looking for the input that separates them.

**3. Content batch 3.** The method is proven twice now (#119, #121) and costs ~70 min per problem
that already has a teaching document. Cut the batch from `docs/PAGE-BACKLOG.md`, worst first. 76
problems have a document and none of the five fields.

## Open, and worth knowing before you pick anything up

| Item                       | State                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B104**                   | the five fields on the remaining **137** pages                                                                                                                                                                                                                                                                              |
| **B70**                    | **71** problems with no teaching document at all                                                                                                                                                                                                                                                                            |
| **B67 / B63**              | **60** problems with no journey                                                                                                                                                                                                                                                                                             |
| **keyed alternatives**     | only **13 of 153**; the playbook's step 2, and what per-rung document folding needs                                                                                                                                                                                                                                         |
| **`whyNow` on every rung** | **0 of 153** problems complete — a rung that does not say what it beats is not a climb                                                                                                                                                                                                                                      |
| **G11**                    | `top-k-frequent`'s optimal rung is the slowest real rung on its page. Filed, not fixed: Approach 4's own callout teaches `n + 1` as the correct bucket size, so a third sizing needs that rewritten rather than appended to                                                                                                 |
| **`docs/EDGE-CASES.md`**   | not started                                                                                                                                                                                                                                                                                                                 |
| **Statistics chapter 5**   | hypothesis testing, still unwritten                                                                                                                                                                                                                                                                                         |
| **The "hamburger" report** | A reader reported a hamburger top-right that does nothing. **Unreproduced**: `scripts/probe-top-right.mjs` walks every route at 390 / 820 / 1280 / 1440 and finds nothing in that corner — below `md` the right-most control is the `?` help, which opens its dialog cleanly with 0 console errors. Needs a width and a URL |

## Traps that cost real time, newest first

- **`verify:vectors` starved reads as `verify:vectors` broken.** 22 survivors read as 92 under load,
  69 of them phantom "the UNMUTATED python already errors" lines against problems whose Python runs
  clean in isolation. Give that gate the machine.
- **`prettier --write` on a DIRECTORY reformats files your branch never touched.** Two branches
  staged 133 unrelated files before this was caught. Format the files you edited, and read
  `git status` before `git add -A`.
- **A leading `{/* … */}` JSX comment in an extracted block is a second root element**, and the
  compiler names the wrong line.
- **Node has no path-alias resolver.** A module that a node test loads imports its siblings
  relatively, with `.ts` extensions — the convention `engine/` and `api/` already follow.
- **`unlocks.constraint` must match the declared constraint character for character.** One
  typographic apostrophe against a straight one fails the gate and shows in no diff.
- **A problem's `reading` may not repeat a link its PATTERN already carries.**
- **A backslash in a template literal sent to the page is consumed twice** — a browser check's
  `/\[\[/` arrives as an invalid regular expression. Use a string test.
- **U6 / U7 catch new prose immediately, and they are usually right.** A sentence at the ui step
  fills 102ch of a 96ch column; a figure caption is prose and cannot sit at 13px; a new control was
  28px against a 44px touch floor.
- Everything older is in `CLAUDE.md` under **Traps**, and none of it has expired.

## Start here

1. **`docs/PAGE-BACKLOG.md`** — what each of the 153 pages still owes, worst first. Regenerate with
   `node scripts/page-backlog.mjs`; a test fails the build when it is stale.
2. **`docs/PROBLEM-PAGE-PLAYBOOK.md`** — how to take a problem to the pilot's shape, in order, with
   the gates in run order. Two batches have now been written against it and it held.
3. **`docs/BACKLOG.md`** — the top unchecked P0.
4. **`docs/WORKLOG.md`**, entry for 2026-09-21 — what the last session decided and why.
5. **`src/glossary/README.md`** — the five rules for writing an entry, and where a `[[link]]` may go.

## One writer per branch

Unchanged, and it has already cost this repo a torn commit that did not compile. If a background
agent is committing here, turn it off before working. The rules are in `docs/AGENTS.md`.
