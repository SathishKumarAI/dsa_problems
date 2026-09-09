# MODELS — which model does what, and what it costs

Four models touch this repo. They are not interchangeable, and the division between them is the
whole point: **a model is trusted only as far as a machine can check its output.** This file records
which model does what, why, and the measured token cost of each — so "we used AI" is a number rather
than a feeling.

Instrumentation lives in `scripts/localsmith/client.mjs` (per-call usage) and `codegen.mjs` (the
run total). Before 2026-09-08 only `completion_tokens` was recorded, so every earlier figure in
`WORKLOG.md` is **output-only and understates the true cost by roughly 3×** — see the measurement
below.

## The four, and what each is trusted with

| Model | Where it runs | Job | Trusted because |
|---|---|---|---|
| **openai/gpt-oss-20b** | LM Studio, `localhost:1234` | **Primary author** of Java and C++ translations of Python that already exists in the repo | The algorithm is fixed; the compiler and the differential runner check the result |
| **qwen2.5-coder:14b** | Ollama, `localhost:11434` | **Second opinion** on the same translation — a control-flow fingerprint compared against the primary's | Two models of a different family rarely make the *same* mistake |
| **Claude Opus 5** (main session) | Anthropic API | Authoring new problems (statement, constraints, hints, the approach ladder, the Python oracle), all judgement calls, all tool and gate work | Nothing — which is why the Python it writes is read against known answers by hand |
| **Claude Opus 5** (review subagents) | Anthropic API | Adversarial re-review of generated blocks for faithfulness, compilation and house style | Nothing — its findings are re-confirmed by the repo's own gates before being acted on |

## The decision, 2026-09-08: Claude authors, the local model backfills

Measured in one session, on one task, both ways — batch 1 of B33:

| | Claude, writing inline | Local model |
|---|---|---|
| Blocks landed | **42** (9 problems) | ~10 (5 problems) |
| Failed to compile | 0 | 1 (self-referencing lambda, 2 `javac` errors) |
| Semantically wrong | 0 | 1 — in **both** languages (the rotting-fruit BFS) |
| Never produced at all | 0 | 1 (truncates at the token limit, 3 tries) |
| Escalated to a human | 0 | 3 (held by the cross-model check) |
| Rework | none | roughly 4 of 10 landed clean |

**Why it loses at authoring, precisely.** The local model spends **1650 input tokens against 558
output** — 3 : 1 — and that input is the house style plus two worked examples, re-sent every call,
*because it has no context*. Claude writing a problem's Java has just written its Python and is
already holding the algorithm. **The local model pays a context tax that has already been paid.**
Its own tokens are free; what is not free is the orchestration, diagnosis and repair around it.

**The sharpest number.** 187 027 tokens of review-agent time found one bug. One extra test vector
found the same bug, costs nothing, and keeps finding it on every future block. Buy gates, not
reviewers — that is what B35 is.

So:

| Work | Who | Why |
|---|---|---|
| A **new** problem — Python, prose, ladder, **and** its Java and C++ | Claude, inline | 42 blocks, zero rework. The languages are nearly free while the algorithm is already in context |
| **Backfill** — translating problems that already exist and are not otherwise being edited | Local model, batched, in the background | The context tax amortises: the alternative is loading dozens of problems into context to do nothing but translate |
| Reviewing generated blocks | The gates, not an agent | Run the agents against the **vectors** once, not against every block every batch |

This replaces "use the local model wherever it is checkable". It is still checkable — it is just not
cheaper, at this scale, when the author is already in the file.

## The second translation pass, 2026-09-08: Claude, not the local model

Twelve array-shaped problems shipped Python-only in the batch-4 content drop, and a problem may not
have a journey until it carries all three languages (`problems.test.ts`). That made them the exact
job the local model exists for — an algorithm already fixed, a compiler and a differential runner
standing by. They were written by **Claude inline** anyway, and the reason is scheduling rather than
capability: the twelve were a blocking dependency for the next content batch, and the decision above
already measured the local-model path at roughly a quarter of the throughput with two defects in ten
blocks. The backfill route stays the right one for work nobody is waiting on.

| | This pass |
|---|---|
| Problems | 12 |
| Blocks written | **48** (2 rungs x 2 languages x 12) |
| `verify:code` | 366 blocks compiled, **0 failed** (318 before) |
| `verify:run` | **20 comparisons per problem, 0 disagreed**, every problem confirmed individually |
| Semantically wrong | 0 |
| Failed to compile | 0 |

Every one of the twelve needed at least one re-run to get a clean sheet: the Windows launch flake
(see `WORKLOG.md` 2026-09-08) refused a freshly built `.exe` on 43 of 330 drivers in the full sweep,
about 13% — higher than the 5% first measured, and still counted apart from real disagreements
rather than hidden in them. `sort-by-frequency` took three attempts before all four of its blocks
launched. None of those refusals was ever a compile error; `verify:code` had already built all 366.

## The tier boundary — the rule that decides who writes what

> **A local model gets the work where a machine can prove it wrong. Everything else is judgement.**

| Tier | Who writes it | The check that makes it safe |
|---|---|---|
| Java / C++ translation of existing Python | Local model | `verify:code` compiles it · `verify:run` executes it against the Python oracle |
| New problem's **Python** | Claude, read by a human/oracle pass | **No gate exists.** The runner compares translations *to* the Python — if the Python is wrong, everything agrees on the wrong answer |
| Statement, constraints, hints, why-now lines | Claude | Shape tests only (length, presence, disclosure lint). Nothing checks whether a teaching claim is *true* |
| Corner-case prose, quiz distractors | Nobody yet (B29) | Pending — the gates are only just strong enough |

The danger this rule exists to avoid: a local model's wrong teaching claim is *plausible*, and
plausible-wrong is the expensive kind. Two false teaching claims in this repo were caught by tests
rather than by eye, both in hand-written content.

## Measured cost

### Local models — exact, from the provider's own `usage` block

One block means one rung of one problem, translated to **both** Java and C++, by **both** models
(primary + second opinion).

| Measurement | Blocks | Wall clock | Input | Output | Total |
|---|---|---|---|---|---|
| `--id validate-bst`, 2026-09-08 (first run with both halves recorded) | 1 | 25 s | **1 650** | **558** | **2 208** |

**Input is roughly 3× output on this task**, because the prompt carries the house style and two
worked examples while the reply is one function. Counting only what comes back — as this repo did
until 2026-09-08 — hides three quarters of the cost.

Earlier runs, output-only, kept for the record:

| Run | Blocks | Wall clock | Output tokens | Output per block |
|---|---|---|---|---|
| Batch-1 backfill (`--all`) | 9 | 308 s | 9 595 | 1 066 |
| Re-draft, product-except-self | 1 | 28 s | 859 | 859 |
| Re-draft, longest-increasing-run | 2 | 48 s | 1 788 | 894 |

Money cost: **zero**. Both servers are local; the cost is electricity and ~25 s of GPU per block.
Running both large models at once makes them fight over one GPU (200 s a block instead of 30), so a
second opinion is a separate sequential pass, not a parallel one.

### Claude — what is and is not measurable here

| Source | Tokens | How it was obtained |
|---|---|---|
| Review subagent, Java blocks | **89 047** | Reported by the harness on completion |
| Review subagent, C++ blocks | **97 980** | Reported by the harness on completion |
| Main session | **not self-measurable** | Run `/cost` in Claude Code for the live session total and dollar figure |

A session cannot count its own tokens honestly — the number would be stale the moment it was
written. `/cost` is the source of truth; this table records only what the harness hands back.

### What the two review subagents bought, for 187 027 tokens

Both, independently, found the same defect the machine gates had passed:

- `rotting-fruit`, **Java and C++**: the BFS level loop re-read `queue.size()` while the body both
  popped and pushed, so a minute bled into the next level. `[[1,1,1],[1,2,1],[1,1,1]]` returned 1
  where the Python returns 2.
- `verify:run` was green on it. Every test vector was a *chain-shaped* grid where the frontier never
  widens, so the bug could not fire. A widening-frontier case was added, the gate went red, the fix
  turned it green again.
- Also: a self-referencing lambda on a non-effectively-final local (2 `javac` errors), a dead fill
  loop, and fully-qualified names the driver already imports.

The lesson worth keeping: **cross-model agreement is a smell, not a verdict.** Both local models
agreed on the broken BFS. Execution against the oracle is the real gate — and it is only as good as
its vectors.

## Reproducing any of this

```bash
node scripts/localsmith/codegen.mjs --list          # what is still missing
node scripts/localsmith/codegen.mjs --id <problem>  # draft it; prints in + out tokens
node scripts/localsmith/apply.mjs --in scripts/localsmith/out/codegen.json --dry
npm run check && npm run verify:code && npm run verify:run
```

`--accept-disagreed` on `apply.mjs` writes blocks the two models modelled differently and hands the
decision to `verify:code` and `verify:run`, which are strictly stronger checks. Use it knowingly.

## Change → file

| Change | File |
|---|---|
| Which local model authors, or which gives the second opinion | `scripts/localsmith/codegen.mjs` (`PRIMARY`, `SECOND`) |
| Which server, or a different port | `scripts/localsmith/client.mjs` (`ENDPOINTS`), or `--base` / `--base2` |
| How tokens are counted | `scripts/localsmith/client.mjs` (`complete`, `completeJson`) |
| The translation prompt and its house style | `scripts/localsmith/codegen.mjs` |
| What a generated block must satisfy before it lands | `src/data/problems.test.ts`, `verify.mjs`, `run.mjs` |
