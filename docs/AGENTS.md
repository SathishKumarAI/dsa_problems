# Running subagents on this repo — the roster, the rules, and what went wrong

Written 2026-09-12, the day twenty-nine subagents wrote most of a documentation set. This file exists so the next session does not rediscover any of it.

**Read this before spawning an agent here.** The rules below are not style preferences; each one is a thing that cost real work when it was missing.

---

## How to not lose an agent

An agent is **resumable by id for as long as the session that spawned it is alive**, and a resumed
agent keeps its full context — it picks up from its own last thought rather than restarting. This
matters most when one dies mid-task, which is common: the session API limit killed **nine of
eleven** agents at once on 2026-09-12.

```
SendMessage → to: "<agentId>",  message: "Resume where you stopped — …"
```

The reply arrives as a task notification like any other. A resumed agent that has already written
half its files keeps them; tell it what changed in the repo while it was gone, because it cannot see
the tree's history.

> **An agent id does not survive the session.** This file previously said every killed agent was
> resumable and left nine ids for the next session to pick up. It was wrong. On 2026-09-13
> `ListAgents` in a new session returned peer *sessions* only — not one of the nine ids existed, and
> `SendMessage` had nothing to address. The context those agents held died with the process that
> held it.
>
> So the rule is: **an unfinished agent is unfinished work, not a resumable agent.** Before the
> session that owns it ends, either resume it or write down *what is still owed as files* — the
> queue below is that, and it is the only form that survives the night.

**Write the id down while the session lives; write the owed FILES down for anyone after it.**

### The roster, 2026-09-12

| Agent | Owned | Outcome |
|---|---|---|
| `a7356cf6bf168b048` | the 2030 visual world — shell, home, list surfaces | landed; found the card hover-lift had never run |
| `aceef427e9a13a3fc` | command palette + list filters | landed; **found a disclosure leak** — masked pattern names reachable through their LeetCode slug |
| `a9c3354496af837fb` · `a3b1ed14d2213dbb6` | the 45 missing `arc` fields | landed |
| `a4f90f48e22241857` · `aa2dda8282d062109` · `a2b96d07dcb1fe00f` | journeys: rotate-list, odd-even-list, add-two-numbers | landed; two independently found the discarded `state` panel |
| `a63184f072faaa56b` · `a76e342034e7da93d` · `a28fba07c101022a1` | deep docs wave 1 — arrays, linked list, two pointers | landed |
| `ae966abcdaa7283aa` · `af0d6054faa588da8` · `aa776ca95a9d3c504` · `a16b47eba95b1de8e` · `a0e397a3bd2018056` | deep docs wave 2 | landed (three were killed and resumed) |
| `a62e0cfd14cf79c72` · `a1621a8958ab33159` · `a191aabf0acf9f9dd` · `aebffdf242cbda7b5` · `af4c73e1790ee68c5` · `abe39b90d4b6f165a` · `a5f66da53287ec5de` | deep docs wave 3 | all killed by the rate limit, all resumed, all landed |
| `ab265f86a2251927e` | retrofitting older docs to the upgraded spec | in progress; **found four inherited false claims** |
| `a00cab354d5b81e77` | statistics: source research and curation | landed — 50 checked, 34 kept |
| `a7d0e04531ea9883a` | statistics: chapters 1–5 | in progress |
| `a6102580f2cb670eb` · `a368821d8d694ccbb` · `a74f8235ffa3655fc` · `a276a2b1dccff3659` · `a876b8cf649c97fd1` · `a6a60ac22a094a092` | deep docs wave 4 — binary search, linked list, stack | in progress |

## The work queue — what is owed, in files

Measured against the tree on **2026-09-13**, not carried over from a roster. Agent ids are gone
(see above); these are the only durable units.

**Deep documents, still unwritten.** Ten that a killed agent had been briefed on:

| Pattern | Owed |
|---|---|
| linked-list | `add-two-numbers` · `odd-even-list` · `reorder-list` · `rotate-list` |
| binary-search | `koko-bananas` · `ship-in-d-days` · `find-peak-element` · `k-closest-values` |
| stack | `calculator-basic` · `simplify-path` |

Never assigned to anyone: **trees (11) · heaps (9) · graphs (11) · dp (14)**.

Regenerate this list rather than trusting it — one line, and it cannot be stale:

```bash
for f in $(find src/data/problems -name '*.ts' ! -name 'index.ts' ! -name '*.test.ts'); do
  id=$(basename "$f" .ts)
  [ -f "docs/deep/${id}_explained.md" ] || echo "$id"
done
```

**Retrofits to the upgraded spec — fifteen, not the eleven the old roster claimed.** A document
written before the teaching-quality section landed carries none of the three required callouts, so
the count is measurable rather than remembered:

```bash
grep -L '^> \*\*Intuition\.\*\*' docs/deep/*_explained.md
```

`container-water` · `find-all-duplicates` · `first-missing-positive` · `intersection-of-arrays` ·
`isomorphic-strings` · `missing-number` · `move-zeroes` · `remove-duplicates-sorted` ·
`remove-element` · `sort-colors` · `sorted-pair-sum` · `sorted-squares` · `three-sum-zero` ·
`trap-rain-water` · `valid-palindrome`

`move-zeroes` and `sorted-squares` appear there, which is how we know the agent briefed to retrofit
exactly those two landed nothing at all. **An agent's last words are not evidence that its files
exist.** Check the disk.

**Statistics:** chapter 5, hypothesis testing. `docs/statistics/` stops at
`04-confidence-and-uncertainty.md`.

---

## The rules

### 1. One writer per file, always

Parallel agents collide on shared files and one of them silently loses its line. Give every agent an explicit, exclusive list, and say plainly: *other agents are writing DIFFERENT files in that directory — touch only yours.* They respect it.

For files that genuinely must be shared — `src/engine/index.ts`, `vectors.mjs` — **nobody hand-edits them**. Write an idempotent script instead and have every agent call it:

- `scripts/register-journey.mjs` — adds a journey's import and registry row, drops the problem's static walkthrough (B1)
- `scripts/wire-batch.mjs` — wires a whole batch of problems into the barrels and the vector table

### 2. Put the spec in the repo, not in the prompt

`docs/deep/README.md` is the house spec for a teaching document. Agents read it; prompts point at it. This is why the spec could be **upgraded mid-flight** — seven agents were writing when the teaching-quality section landed, and a one-paragraph message brought them all onto the new bar without re-briefing any of them.

A prompt is a copy. A file is the source.

### 3. Make them verify by running, and say what "verified" means

Every brief ends with the gate the work must pass, by name:

- `node scripts/verify-deep.mjs --id <problem>` — extracts the document's script, runs it, requires a clean exit *and* a line saying the approaches agreed
- `node --test src/engine/journeys.test.ts` — the journey content gate
- `npm run check` / `npm run test:ui`

An agent told "verify your work" writes a paragraph claiming it did. An agent told "run this command and paste the output" runs it.

### 4. Make them run the buggy variant

> **The most valuable rule in this file.** If a document claims a specific wrong answer — "this bug returns 40" — the agent must RUN the buggy variant and quote the real number.

What it caught, all of which would otherwise have shipped as confident fiction:

- moving the taller wall in container-water returns **8**, not 40
- three monotonic-stack and RPN bugs return the **correct** answer on their own statement example
- three sliding-window bugs **crash** rather than returning a wrong number
- `while i <= j` in reverse-string, widely warned about, **is correct** — the middle character swaps with itself
- `window-maximum`'s statement example **never exercises front expiry** at all
- four inherited claims in already-verified documents were false

**And know the gate's edge:** `verify-deep` runs the script, so it can only check that the approaches agree. It cannot read a sentence. Every claim about a variant is guarded by this rule and nothing else.

### 5. Ask for the judgment calls back

Briefs end with: *report anything you deliberately left out, and why.* That is where the real findings arrive — the test case that violated the problem's own constraints, the statement example that hides the bug, the rung that could not be verified and why.

---

## What went wrong, so it does not go wrong again

| What happened | Fix |
|---|---|
| **Rate limit killed nine agents mid-task.** Files were on disk that nobody had checked | Resume by id *while the session lives*. Then verify everything yourself — this is why `verify-deep.mjs` exists |
| **The session ended with nine ids written down and none of them resumable** | Ids are session-scoped. Convert unfinished agents into a file-level queue before the session ends |
| **`git add -A` swept an agent's half-written file into a commit** | Stage explicitly while agents run. Keep a list of which files are busy |
| Agents cannot edit `docs/**` when scoped to `src/**`, so **FEATURES rows and backlog ticks go unwritten** | The coordinator owes those. Expect it and do it at commit time |
| An agent left **scratch files in the repo root** when it was killed | Check `git status` for stray `*-tmp.mjs` before committing |
| An agent invented a callout label (`> **Why it works — and where it stops.**`) | Name the exact strings in the spec; check them after |

---

## The brief that works

1. **Read first, in order** — the spec file, then a finished peer as the reference for the bar.
2. **The spine** — where the source of truth lives, and the instruction not to invent a parallel one.
3. **Exact file ownership**, plus the sentence about other agents.
4. **What this work is really about** — the two or three ideas the subject exists to teach, so the agent writes *about* something rather than narrating code.
5. **The traps**, named specifically. Generic warnings are ignored; "three-sum's stress check needs sorted triples or it reports false disagreements" is acted on.
6. **Verification**, as commands to run and output to paste.
7. **Reply with** — paths, the numbers, the gate output, and what they deliberately left out.

Worth knowing: an agent that is told *why* a rule exists follows it further than one given the rule alone. Every "because" in a brief above was repaid.
