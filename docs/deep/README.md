# `docs/deep/` — one long-form teaching document per problem

`docs/explained/` is **generated** from the data and answers "what are the approaches, and what do they cost". These are **authored**, and they answer the question a generated page cannot: *how does someone who does not yet see the answer get there?* Worked traces, mental models, the specific bug you are about to write, and what any of it is worth in an interview.

One file per problem: `<problem-id>_explained.md`.

## Change → file

| Change | File |
|---|---|
| The approaches, the code, the complexities | `src/data/problems/<pattern>/<id>.ts` — the spine. These docs follow it |
| The generated short page | `docs/explained/<id>.md` (`npm run docs:explained`) |
| The house format for a deep document | this file |

## The spine

Read `src/data/problems/<pattern>/<id>.ts` first and build the document on it: `statement`, `constraints`, `examples`, `hints`, `alternatives[]` (the ladder worst → best, each with `name` / `summary` / `complexity` / `whyNow` and Python + Java + C++), the top-level `approach` / `whyNow` / `complexity` (the optimal rung), and `arc` (the closing narrative).

**Use those approaches and that Python.** A document that invents its own ladder drifts from what the app teaches, and the drift is invisible until someone reads both. Where the spec below demands a rung the data does not carry — usually the brute force, or the instinctive-but-suboptimal step — add it and say in the document that it is an addition.

**Never copy text from LeetCode.** Statements and constraints are restated in our own words; that rule is the repo's, not a formality.

## Required structure, in this order

1. **Understanding the Problem** — restate it in plain language, no jargon. One sentence naming the core question: what are we actually searching for, and what makes the naive approach slow. Then the constraints — and for each later optimization, say explicitly **which constraint unlocks it**. A bounded alphabet, a sorted input, values promised to lie in `1..n`: these are not trivia, they are the permission slips.

2. **One section per approach**, least to most optimized, each carrying **all six** subsections:
   - **The idea** (2–3 sentences), as question-and-answer. Every approach after the first names **which limitation of the prior approach it fixes** — no optimization arrives in a vacuum.
   - **How to think about it** (3–5 sentences): a mental model a beginner can hold — two fingers walking toward each other, a filing cabinet you can jump straight into. The *shape* of the reasoning, never the code restated as prose.
   - **Worked example**: ONE concrete input, **the same input in every approach of that document**, traced step by step with real values and indices, showing the intermediate state — what is in the map, where the pointers are, what the stack holds — at each step, not just the answer.
   - **Code**: fenced Python, fully type-hinted, named `<problem>_<approach_name>`, inline comments only on non-obvious lines.
   - **Common mistake**: one specific bug someone hits implementing *this* approach, and **why** it is wrong rather than merely that it is.
   - **Complexity and when to use this**: time and space, each with one sentence on *where the cost comes from*, plus when this approach is the right choice despite not being optimal.

3. **Cover the progression**, or this problem's nearest equivalent, and **do not skip the instinctive-but-suboptimal step** — it is usually the most educational one: brute force → restructure the input (sorting, or an auxiliary structure) plus a search technique, costing the restructuring and the search separately → the instinctive single-structure version a beginner writes before tightening it → the optimal single-pass → any constraint-exploiting version that trades generality for constant-factor speed, **stating what assumption must hold and what breaks when it does not**.

4. **The Overall Arc** — ONE connected narrative paragraph, not bullets, tracing the single principle every optimization is chasing, each approach's weakness motivating the next. Expand the data file's `arc`; do not paste it.

5. **Comparison table**: Approach | Time | Space | Core trade-off | Best used when.

6. **Interview Priority** — which 2–3 are worth memorizing cold and why, and why the others are worth understanding but not recall.

7. **Full Runnable Script** — every approach in one file, with tests covering the statement's example, an edge case (empty / minimal / smallest legal), duplicates if relevant, a no-valid-answer case if the problem allows one, and a larger random stress case cross-checked against brute force. Print every approach side by side and end with one line stating clearly whether all approaches agreed.

## Verification — before the document is handed back

- **Execute the script.** Extract it from the finished markdown and run it with `python`.
- Every approach agrees on every case, including the stress test.
- Anything that errors or disagrees is **fixed and re-run**, not explained away. A document must never contain an approach nobody watched pass.
- **If you claim a specific wrong answer in a "common mistake", run the buggy variant and quote the real number.** Reasoning your way to it produces confident fiction: one document claimed moving the taller wall in container-water returns 40; it returns 8.

## Traps this format walks into

| Trap | What to do |
|---|---|
| In-place approaches mutate the input | Give every approach its **own copy** in the harness, or the cross-check compares corrupted data |
| Set-shaped answers (triples, groups, pairs) | Canonicalise — sort within, then sort the collection — before comparing, or correct approaches read as disagreeing |
| Problems returning a **length** (remove-element, remove-duplicates) | Compare only the first `k` entries; what lies beyond is explicitly unspecified |
| A linked list with a real cycle | Guard the read-back helper with a step limit, or the harness hangs |
| A test case that violates the problem's own promise | Replace it. A case the constraints forbid proves nothing, even when it passes |
| Quadratic or exponential rungs in the stress test | Run them at reduced `n`, and say the worst case is stated analytically rather than measured |
