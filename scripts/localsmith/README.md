# localsmith — the local-model workbench

Generates the parts of this repo's content that a **local** model can produce and a
**machine** can check, so the expensive model is spent on judgement instead of typing.

Nothing here runs automatically and nothing here is trusted. Every block it produces
passes a gate before it is written, and the things a gate cannot see are listed at the
bottom of this file rather than glossed over.

## Change → file

| Change | File |
|---|---|
| Talk to a different local server or model | `client.mjs` (`ENDPOINTS`), or `--base` / `--model` |
| The Java/C++ translation task: prompt, house style, gates | `codegen.mjs` |
| How generated blocks get written into `src/data/problems/*.ts` | `apply.mjs` |
| What "well-formed" means once a block is in the repo | `src/data/problems.test.ts` |

## Running it

```bash
node scripts/localsmith/codegen.mjs --list            # what is still missing
node scripts/localsmith/codegen.mjs --id best-trade   # one problem
node scripts/localsmith/codegen.mjs --all             # everything pending
node scripts/localsmith/apply.mjs --in scripts/localsmith/out/codegen-all.json --dry
npm run check                                          # the repo's own gate
```

Defaults: LM Studio on `:1234` with `openai/gpt-oss-20b` as the author, Ollama on
`:11434` with `qwen2.5-coder:14b` as the second opinion. `--no-second` skips the
second opinion when you only want speed.

## Why this task and not the interesting one

The journeys are the product, and their content is a series of judgement calls: which
weakness earns which act, what a corner case is allowed to say before a technique has
been earned, whether a complexity claim is true. Two false teaching claims have already
been caught in this repo by tests rather than by eye, both in hand-written content. A
local model will produce more of them, and they are *plausible*, which is the dangerous
kind of wrong.

Translating Python that is already in the repo into Java and C++ is the opposite: the
algorithm is fixed, the shape is fixed, the house style can be shown in two examples,
and almost everything that matters is checkable without running the code.

## The gates, and what each one is for

Applied in `codegen.mjs` before a block is accepted, and again in
`problems.test.ts` after it lands:

| Gate | Catches |
|---|---|
| Signature regex | a class wrapper, a bare statement, an explanation instead of code |
| Brace balance | a truncated reply — the most common failure at a token limit |
| No imports / `main()` / fences / comments | output that looks like a chat answer rather than a repo block |
| **No step lost** | the translation dropping a loop or a branch |
| **Cross-model agreement** | the two models modelling the same Python differently |

**"No step lost" is the important one.** Python compresses: `Counter(nums)`, a
comprehension and `set(nums)` are all loops the C-family has to write out, so a faithful
translation usually has *more* loops than its source. It may never have fewer — that is
exactly how a deliberately naive rung would quietly become a faster algorithm than the
one the act is teaching.

## What no gate here can see

**There is no compiler on this machine.** No `javac`, no `g++`. Every Java and C++ block
in this repo — hand-written or generated — is verified by shape and by reading, never by
execution. Cross-model agreement is a proxy for a second opinion, not a substitute for a
compiler.

Disagreement is a **review flag, not a rejection**. When the two models model the same
Python differently, one of them is usually right: on `top-k-frequent/Heap` the author
expanded `heapq.nlargest` into a bounded min-heap (correct) while the second opinion
produced a sort (a different algorithm, and one that would defeat the rung). `apply.mjs`
refuses to write a flagged block, and a human adjudicates.

If a compiler ever lands on this machine, wrapping each block in a throwaway class or
translation unit and compiling it is the single biggest upgrade available here.
