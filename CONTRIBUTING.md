# Contributing to dsa.patterns

**Collaborators welcome, and there is a specific shape of help this project needs.** Read the two
paragraphs under *"The one rule"* before anything else — they are what makes a contribution here
different from a contribution to a normal docs site.

---

## The one rule

**Nothing goes in this repository that has not been run.**

Not "reviewed", not "looks right" — *run*. A complexity claim owes a measurement. A worked example
owes a script that prints it. A corner case owes a test that fails without the fix. This is not
ceremony; it is the only reason the content can be trusted, and it has caught real defects in work
that read perfectly:

- A rung labelled `O(n²)` that measured **strictly linear** on every input, because the code
  short-circuited before it could be quadratic. The label was on the problem page, so it was the
  claim a learner read. (`G6`)
- A worked example carrying the note *"a solution that only measures through the root gets this
  wrong"* — which that solution got **right**. All three provided examples passed the most common
  wrong answer, so a test suite built from them would have passed it too. (`G7`)
- A rung the ladder calls **optimal** that is the **slowest** real rung on its page at the
  constraint's own ceiling, because one line allocates `n + 1` list objects most of which are never
  touched. (`G11`)

Every one of those survived reading and died on a measurement. If you take one thing from this file:
**instrument the bound, do not quote it, and run the wrong solution against your own examples.**

The second rule follows from the first: **never copy text from LeetCode or any other site.** Problem
statements, constraints and examples here are written in our own words from the problem's public
definition. Solutions are original write-ups of classic, public-knowledge material. A pull request
containing copied text will be closed regardless of its quality.

---

## Good first contributions

Ranked by how self-contained they are. Each links to where the work is counted, so you can pick one
and see exactly what "done" means.

| # | What | Size | Where it is counted |
|---|---|---|---|
| 1 | **Write a teaching document** for one of the **45 problems that have none** | ~half a day | `docs/LEARN-GAPS.md`, "no document" |
| 2 | **Retrofit the three required sections** onto one of the **117 documents missing them** — *Reading the Calculations*, *How to Get Fluent*, and an `Under the hood` callout carrying a measured number | ~2–4 hours | `docs/LEARN-GAPS.md` |
| 3 | **Write a journey** for one of the **34 problems that still ship a static walkthrough** | ~1 day | `docs/AUTHORING.md` |
| 4 | **Fix `G11`** — size `top-k-frequent`'s bucket wall to `max(count) + 1` instead of `n + 1`, and rewrite the Approach 4 "Watch out" that currently teaches `n + 1` as the correct size | ~2 hours | `docs/BACKLOG.md`, G11 |
| 5 | **Add a problem** — statement, constraints, an approach ladder in Python, Java and C++, an arc | ~half a day | `docs/PROBLEMS.md` |
| 6 | **Report a false claim.** Find a complexity label, worked example or corner case in this repo that does not survive being run. This is the most valuable issue you can file | minutes to hours | `docs/BACKLOG.md`, the `G` table |

**Start with 6 if you want to understand the project fast.** Pick any document, run its script,
change the input, and see whether the page still tells the truth. Two of the three defects listed
above were found exactly that way — while *writing about* the code, not while reading it.

---

## Setup

Node 24 (it runs `server/` and the tests with no build step). Chrome for the browser suite.

```bash
git clone https://github.com/SathishKumarAI/dsa_problems.git
cd dsa_problems
npm i
npm run dev          # UI + API on one port → http://localhost:5173
```

---

## The gates

Seven, and they check different things. **None of them is sufficient on its own**, which is the
point of having seven.

| Command | What it proves | When you owe it |
|---|---|---|
| `npm run check` | `tsc -b`, `eslint`, and the Node test suite | **Every commit, no exceptions** |
| `npm run test:ui` | Real Chrome: routes, the earn loop, rails, deep links, panel sizes | Anything that renders |
| `npm run verify:code` | Every Java and C++ block **compiles** | Touching a Java or C++ block |
| `npm run verify:run` | Those blocks **agree with the Python** on shared vectors | Touching any solution code |
| `npm run verify:vectors` | The vectors are strong enough to catch a mutation | Adding or changing test vectors |
| `node scripts/verify-deep.mjs` | Every teaching document's script runs and its approaches agree | Touching `docs/deep/**` |
| `node scripts/learn-gaps.mjs --strict` | No document adds approaches without disclosing it | Touching `docs/deep/**` |

Compiling is not correctness — that is why `verify:code` and `verify:run` are separate gates. A
green diff is not verification either.

**CI runs the fast subset** on every pull request ([`.github/workflows/gates.yml`](.github/workflows/gates.yml)):
typecheck, lint, the 758 tests, the build, all 82 teaching scripts, the drift gate, and a check that
`docs/learn/**` was regenerated. It deliberately does **not** run the browser suite or the Java/C++
toolchain — those need Chrome and a JDK/g++, and they are slow. Run them locally; the PR template
asks for their output. A green tick means *nothing obviously broke*, which is not the same as
verified.

### The ratchet

`scripts/learn-gaps.test.mjs` holds a baseline of how many documents are missing each required
section. It **fails when a number grows**, and separately asserts the baseline is not set *above*
the tree — because a ratchet with slack passes while the content rots. When you finish a document,
lower the baseline in the same commit. The suite will tell you the number.

---

## Writing a teaching document

`docs/deep/<id>_explained.md`. Two files are the whole brief:

- **`docs/deep/TEMPLATE.md`** — the skeleton, and the four-readers table. Read that table first.
- **`docs/deep/PROMPT.md`** — the reusable brief, with a retrofit variant for existing documents.

### The four readers

Every document owes all four. The fourth column is the sentence that fails each one:

| Reader | Needs from this page | The sentence that fails them |
|---|---|---|
| First-year student | what every symbol means | *"clearly, the complement is `target - x`"* |
| Working engineer | which rung to reach for | *"this is the optimal solution"*, with no when-not-to |
| Interview candidate | what to say out loud | a solution with no failure mode named |
| Systems / ML architect | what the structure really costs | `O(1)` with no measured number behind it |

The first reader is the one every document had been skipping, and it is why *Reading the
Calculations* exists as a required section.

### The three required sections

1. **Reading the Calculations** — a symbol table (*what you will see · what it computes · why it is
   written that way · what happens if it is wrong*), the one rearrangement, and a hand-trace recipe
   whose rows are **printed by the document's own script**.
2. **How to Get Fluent** — three to six drills, each with a **done-condition** you can check rather
   than feel, ending in the one sentence that should survive a month.
3. **`> **Under the hood.**`** — at least one, and it **must carry a measured number**. A table of
   big-O next to a table of milliseconds is the difference between knowing the bound and knowing the
   cost.

### The script at the foot

Every document ends in one runnable Python script containing every approach, a test suite, and the
measurements the prose quotes. `scripts/verify-deep.mjs` extracts the **last** Python fence, runs
it, and requires it to print `ALL APPROACHES AGREED`.

Two conventions that keep the numbers honest:

- **Exact counts** (probes, comparisons, allocations) reproduce anywhere — quote them freely.
- **Timings** are one machine's. Say so in the document, and name the **shape** of the column as the
  claim rather than the absolute number.

---

## House rules

- **Branch per change**, named `type/scope-slug`. Never commit to `master` directly.
- **Conventional commits**: `type(scope): what changed`, imperative, under ~72 characters. Types:
  `feat` `fix` `refactor` `perf` `docs` `test` `build` `chore`.
- The commit **body says why, and what was measured.** It is the only documentation that ships
  attached to the code — write what someone will need at 3am, not a restatement of the diff.
- **Update the ledger in the same commit** as the work: tick the `docs/BACKLOG.md` item, add the
  `docs/FEATURES.md` row, lower the ratchet.
- **A found bug outside your task's scope gets fixed or filed, never silently left.** Say which.
- **Never delete or remove without asking.**
- Palette lives only in `src/index.css`; every `localStorage` key goes through `src/lib/store.ts`.
- Reach for the **role**, not the size: `text-body` for a sentence, `text-meta` for a label, never a
  raw `text-[13px]`. The scale is in `docs/DESIGN.md`.
- `legacy/visualizer/` is read-only reference. Port from it; never import from it.

---

## Progressive disclosure — do not regress this

This is the pedagogy, and it is enforced by a test rather than by good intentions.

**No unearned act or pattern name anywhere a learner can see** — not in the stepper, banners,
chart, hints, quiz, or URL. Locked acts render as a single `?` node. An act opens with the
*previous* act's weakness; names arrive in the recap.

`src/engine/journeys.test.ts` is the gate. Do not weaken it; extend it. When eight journeys were
written in one day, it caught six of them breaking one of those rules on the first run.

---

## Filing an issue

Templates are in `.github/ISSUE_TEMPLATE/`. The one we most want is **"a claim that does not
survive being run"** — it takes a measurement, and it is how the three defects at the top of this
file were found.

---

## Where to look

| Question | File |
|---|---|
| Everything about one problem, on one page | `docs/learn/<id>.md` (generated: `npm run docs:learn`) |
| What is missing, per problem, counted | `docs/LEARN-GAPS.md` |
| The ordered queue of content work | `docs/LEARN-PLAN.md` |
| What to build next, and why | `docs/BACKLOG.md` |
| Where the project is going | `docs/ROADMAP.md` |
| What the product is for, and for whom | `docs/PRD.md` |
| How to add a journey without spoiling it | `docs/AUTHORING.md` |
| What IS this box, and how data flows | `docs/ARCHITECTURE.md` |
| Where the last session stopped | `STATUS.md` |

---

## Code of conduct

[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). The short version: be decent, assume good faith, and
**disagree with evidence** — which is the same standard the content is held to. If someone measures
your work and it does not hold up, that is the process working, not an attack.

## Licence

MIT. By contributing you agree your work is licensed the same way, and that it is your own
original writing.
