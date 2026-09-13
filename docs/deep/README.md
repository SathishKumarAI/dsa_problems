# `docs/deep/` — one long-form teaching document per problem

`docs/explained/` is **generated** from the data and answers "what are the approaches, and what do they cost". These are **authored**, and they answer what a generated page cannot: *how does someone who cannot yet see the answer get there?*

One file per problem: `<problem-id>_explained.md`.

> **Who you are writing as.** A teacher who has taught this problem two hundred times, watched where every cohort stalls, and knows which sentence unsticks them. Not a solution dump, not a lecture transcript. You are allowed to be long where the difficulty is, and you are obliged to be short everywhere else.

## Change → file

| Change | File |
|---|---|
| The approaches, the code, the complexities | `src/data/problems/<pattern>/<id>.ts` — the spine. These docs follow it |
| The generated short page | `docs/explained/<id>.md` (`npm run docs:explained`) |
| The house format for a deep document | this file |
| Whether a document's script still runs | `scripts/verify-deep.mjs` |

## The spine

Read `src/data/problems/<pattern>/<id>.ts` first and build on it: `statement`, `constraints`, `examples`, `hints`, `alternatives[]` (the ladder worst → best, each with `name` / `summary` / `complexity` / `whyNow` and Python + Java + C++), the top-level `approach` / `whyNow` / `complexity`, and `arc`.

**Use those approaches and that Python.** A document that invents its own ladder drifts from what the app teaches, invisibly. Where this spec demands a rung the data lacks — usually the brute force or the instinctive-but-suboptimal step — add it and say in the document that it is an addition. **Never copy text from LeetCode.**

---

## Teaching quality — what separates a good document from a correct one

These five rules are the difference. A document can satisfy every structural heading below and still teach nothing.

**1. Intuition before formalism, always.** Never open a section with notation. Open with the situation, in objects a person can picture — a shelf, a queue at a counter, two fingers on a page — and only then name it. The moment a reader meets `dp[i][j]` before they know what the table *means*, you have lost them and the rest of the section is decoration.

**2. Motivate every step by the failure of the last one.** No approach appears because it exists. Each one arrives because the previous one hit a wall you have just made the reader feel. If you cannot state the wall in one sentence, the approach does not belong in the ladder.

**3. Name the misconception, not just the fact.** "Sorting destroys the original indices" teaches more than "remember to keep the indices", because it tells the reader what they were *about to think*. The best line in any of these documents is the one that describes the reader's own half-formed wrong idea back to them.

**4. Show the state, not the story.** A worked example is a table of what the machine holds at each step — the map, the pointers, the stack — not a paragraph saying what happens. If a reader cannot replay your trace on paper and get the same intermediate values, it is not a trace.

**5. Earn every sentence.** Elaborate where the difficulty is; cut everywhere else. A section that restates the code in English is worse than no section. Length is not the goal — *sufficiency* is.

### Formatting — use the page, do not just fill it

Markdown has enough furniture; use it deliberately so the eye can find things.

- **Callouts** for the four recurring kinds of aside, with these exact labels so they are scannable:
  - `> **Intuition.** …` — the mental model, stated plainly.
  - `> **Watch out.** …` — the trap, the off-by-one, the destroyed input.
  - `> **Why it works.** …` — the invariant or exchange argument. Every greedy and every two-pointer solution owes one.
  - `> **In an interview.** …` — what to say out loud, and what the follow-up will be.
  - `> **Under the hood.** …` — what the language or the data structure is ACTUALLY doing, when the
    cost of a line depends on it: what a dict does to find a key, why a list `pop(0)` is not free,
    what a sort actually costs. Use it where a reader would otherwise take a complexity on faith,
    and put a MEASURED number in it.
- **Tables** for anything with more than two parallel facts: constraint → what it unlocks, step → state, approach → trade-off.
- **Bold** the load-bearing noun in a paragraph — the one word a skimmer must catch. Never bold whole sentences.
- **Inline code** for every identifier, value and complexity: `left`, `nums[i]`, `O(n log n)`.
- A **horizontal rule** between approaches, so the document reads as chapters rather than a scroll.
- Keep paragraphs to three or four sentences. A wall of text is a wall.

### Code — modular, and shaped so a change is local

> **The test:** a reader who wants to change *one thing* — the comparison, the key, the direction of the sweep — should have exactly one obvious place to edit, and nothing else should move.

- **One function per approach**, named `<problem>_<approach_name>`, fully type-hinted, doing one thing.
- **Lift the decision into a named helper or a constant** when it appears more than once: a comparator, a key function, a neighbour list. `DIRECTIONS = [(0, 1), (1, 0), (0, -1), (-1, 0)]` at module scope beats four literal tuples in a loop body.
- **No approach may depend on another's internals.** Each is readable, runnable and replaceable on its own — that is what keeps the document usable a year from now when one rung changes.
- **Shared scaffolding is declared once and labelled as scaffolding**: a `ListNode`, a `build(values)`, a `to_list(head)`. Say in prose that it is harness, not answer.
- **Comments only on non-obvious lines.** A comment that restates the line is noise; a comment naming the invariant is worth three sentences of prose.
- The full script at the foot of the document is the same functions, assembled — never a second, divergent implementation.

---

## Required structure, in this order

1. **Understanding the Problem** — restate it in plain language, no jargon. One sentence naming the core question: what are we actually searching for, and what makes the naive approach slow. Then a **constraint → what it unlocks** table; a bounded alphabet, a sorted input, values promised to lie in `1..n` are permission slips, and each later optimization should point at the one that lets it exist.

2. **Reading the Calculations** — a short section for the reader who can follow the prose and then
   stalls at `j = index_of.get(target - x, -1)`. Two parts, both required:
   - **A symbol table**: every name and expression the document's code uses — `i`, `nums[i]`,
     `need`, `seen`, `lo + (hi - lo) // 2` — with *what it computes*, *why it is written that way*,
     and *what a wrong version would mean*. Read it as: the arithmetic is never decoration, each
     expression answers one question.
   - **How to trace it by hand**: the columns to draw on paper and what updates each row, so the
     reader can replay the worked examples below instead of watching them. Name the moment the
     answer is decided.

   This section is where "I do not understand the calculations" is answered. It comes BEFORE the
   approaches, because a reader who cannot decode the expressions cannot read any of them.

3. **One section per approach**, least to most optimized, each carrying **all six**:
   - **The idea** (2–3 sentences) as question-and-answer, naming **which limitation of the prior approach it fixes**.
   - **How to think about it** (3–5 sentences) — the mental model, in a `> **Intuition.**` callout. The *shape* of the reasoning, never the code restated.
   - **Worked example** — ONE input, **the same one in every approach of that document**, traced as a **table of state per step**.
   - **Code** — per the code rules above.
   - **Common mistake** — the misconception behind the bug, in a `> **Watch out.**` callout, and **why** it is wrong.
   - **Complexity and when to use this** — time and space with one sentence each on *where the cost comes from*, plus the situation that makes this the right choice anyway.

4. **Cover the progression** — brute force → restructure plus search → the instinctive suboptimal version → the optimal → any constraint-exploiting version, **stating the assumption it needs and what breaks without it**. Do not skip the instinctive step; it is usually the most educational.

5. **The Overall Arc** — ONE connected narrative paragraph tracing the single principle every optimization chases, each weakness motivating the next. Expand the data file's `arc`; do not paste it.

6. **Comparison table**: Approach | Time | Space | Core trade-off | Best used when.

7. **Interview Priority** — which 2–3 to know cold and why; why the others are for understanding rather than recall. Use a `> **In an interview.**` callout for what to actually say.

8. **How to Get Fluent** — three to six drills, in order, that turn reading into ability: what to
   write from memory, what to trace on paper, which sibling problem uses the same move, and the ONE
   sentence that should come back a month later. Not a reading list — `docs/RESOURCES.md` is the
   reading list. These are exercises, and each says what "done" looks like.

9. **Full Runnable Script** — every approach plus tests: the statement's example, an edge case, duplicates if relevant, a no-answer case if allowed, and a random stress case cross-checked against brute force. Print every approach side by side; end with one line stating whether all agreed.

---

## Verification — before the document is handed back

- **Execute the script.** Extract it from the finished markdown and run it with `python`.
- Every approach agrees on every case, including the stress test.
- Anything that errors or disagrees is **fixed and re-run**, not explained away.
- **If you claim a specific wrong answer in a "common mistake", run the buggy variant and quote the real number.** One document claimed moving the taller wall in container-water returns 40; it returns 8.
- Then run the repo's own gate: `node scripts/verify-deep.mjs --id <problem-id>`.

## Traps this format walks into

| Trap | What to do |
|---|---|
| In-place approaches mutate the input | Give every approach its **own copy**, or the cross-check compares corrupted data |
| Set-shaped answers (triples, groups, pairs) | Canonicalise — sort within, then sort the collection — before comparing |
| Problems returning a **length** | Compare only the first `k` entries; beyond it is explicitly unspecified |
| A linked list with a real cycle | Guard the read-back helper with a step limit, or the harness hangs |
| A test case that violates the problem's own promise | Replace it. A case the constraints forbid proves nothing, even passing |
| Quadratic or exponential rungs in the stress test | Run them at reduced `n`, and say the worst case is analytic, not measured |
| Windows line endings | A pattern written `"```python\n"` finds nothing in a CRLF file. Normalise before matching — this has bitten three scripts in this repo |
