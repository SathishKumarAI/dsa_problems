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
