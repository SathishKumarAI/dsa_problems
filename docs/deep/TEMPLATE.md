# Template — copy this to `docs/deep/<id>_explained.md` and fill it in

Delete every instruction line as you replace it. The spec and the reasoning are in
[`README.md`](README.md); this file is the skeleton, so nothing is forgotten.

Before writing a word: **read `src/data/problems/<pattern>/<id>.ts`.** It is the spine. Use its
approaches and its Python. Where you add a rung it does not have, label the heading
`*(an addition — not in the data file's ladder)*` — `node scripts/learn-gaps.mjs` fails you otherwise.

---

## Who you are writing for — all four, in this order

A document that only serves one of these is not finished. Each row must find something it needed.

| Reader | Arrives able to | Needs from this page | The sentence that fails them |
|---|---|---|---|
| **First-year student** | write a loop, read a function | what every symbol means, what the arithmetic computes, how to trace it on paper | "clearly, the complement is `target - x`" |
| **Working engineer** | code it, but not choose it | which rung to reach for, what it costs, what breaks it | "this is the optimal solution" with no when-not-to |
| **Interview candidate** | recite the answer | what to say out loud, the follow-up, the counterexample to volunteer | a solution with no failure mode named |
| **Systems / ML architect** | reason about scale | what the data structure really does, where the average hides a worst case, when the constant matters | `O(1)` with no measured number behind it |

The first row is the one most documents skip. Write the symbol table for them and the other three
still read it in ten seconds.

---

# <Problem title> — Explained

## Understanding the Problem

<Restate it in plain language. No jargon, no technique names. One short paragraph.>

<An ASCII picture of the smallest input that shows the difficulty. Trees, lists and grids all
deserve one.>

**The core question:** *<what are we actually searching for, in one italic question?>* <Then one
sentence on why the naive answer is slow — the cost, not the name.>

> **Intuition.** <The mental model in objects a person can picture. Never notation.>

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `<bound>` | <what it permits or forbids — a permission slip, not a restatement> |

<Every later optimisation should point back at a row here. If a constraint unlocks nothing, say so
— "values are irrelevant; this is pure shape" is a useful row.>

<Name the ONE example traced in every section below, and show it.>

---

## Reading the Calculations

<REQUIRED. This is where "I cannot follow the calculations" is answered. Delete nothing here.>

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `i` | <a position? a value? say which> | | |
| `<expression>` | | | |

### The one piece of arithmetic, spelled out

<Take the single rearrangement or invariant the problem turns on and derive it in two lines. Then
run it over the worked example, one row per step, and say which rows are the same fact seen twice.>

### How to trace it by hand

<The columns to draw on paper. Then the rules — three or four, numbered. Then the filled-in table.
End by naming the row where the answer is decided, and say that everything after it never runs.>

### Reading a complexity out loud

<`O(n)` is a shape, not a speed. Give the growth sentence, then a measured table of counted work at
three sizes so the reader can check it.>

---

## Approach 1 — <name> <*(an addition — not in the data file's ladder)* if it is one>

### The idea

*<The question this rung answers, in italics.>* <Two or three sentences, naming which limitation of
the previous rung it removes.>

### How to think about it

> **Intuition.** <The shape of the reasoning. Never the code in English.>

> **Why it works.** <Required for anything greedy, two-pointer, or invariant-driven. The exchange
> argument or the invariant, stated so a sceptic is satisfied.>

> **Under the hood.** <Required where the cost depends on what the language is doing — a dict
> lookup, a list `pop(0)`, a sort, a string concatenation. MUST carry a measured number, printed by
> the script at the foot of this document.>

### Worked example

<The same input as every other approach. A table of STATE PER STEP — the map, the pointers, the
stack — not a paragraph of narration. A reader must be able to replay it on paper and match it.>

### Code

```python
<One function, named `<problem>_<approach>`, fully type-hinted. Comments only where a line is not
obvious, and then naming the invariant rather than restating the line.>
```

### Common mistake

> **Watch out.** <The misconception, described back to the reader as a thought they were about to
> have — not the rule they should follow. Then the measured consequence: what the buggy version
> RETURNS, run, not imagined. If it is right on the statement's own example, say so — that is why
> the bug survives.>

### Complexity and when to use this

- **Time — `O(?)`.** <Where the cost comes from, in one sentence. Measured if it is countable.>
- **Space — `O(?)`.** <Same.>

**When it is right:** <the situation that makes this rung the correct choice anyway. Every rung has
one, even the worst — if you cannot find it, the rung does not belong in the ladder.>

---

<Repeat per approach, least to most optimised. Cover: brute force → restructure-and-search → the
instinctive-but-suboptimal → the optimal → any constraint-exploiting version, stating the assumption
it needs and what breaks without it.>

---

## The Overall Arc

<ONE connected paragraph. Each weakness motivating the next rung, ending on the single principle the
whole ladder chases. Expand the data file's `arc`; never paste it.>

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|

## Interview Priority

**Know cold:** <which two or three, and why — the transferable idea, not the problem.>

**Understand, do not memorise:** <the rest, and what each is for.>

> **In an interview.** <What to say out loud, in quotes. The counterexample to volunteer. The
> follow-up that is coming, and its one-line answer.>

## How to Get Fluent

<REQUIRED. Three to six drills, in order, each saying what "done" looks like. Not a reading list —
`docs/RESOURCES.md` is the reading list. End with the single sentence that should come back a month
later.>

1. **<Say it before writing it.>** … **Done when** …
2. **<Hand-trace this exact input.>** … **Done when** …
3. **<Write it from memory, then break it on purpose.>** … **Done when** …
4. **<Count, do not time.>** … **Done when** …
5. **<The siblings.>** <Name two or three problems that are this one in disguise, and say what
   changed.> **Done when** …
6. **A month later, the one sentence that should come back:** *<it>*

## Full Runnable Script

<The scaffolding named as scaffolding. The `_bug_*` functions named as the document's own claims.
Then the fence.>

```python
"""<Title> — every approach in one file, cross-checked.

Run:  python <name>.py
"""
```

<The script MUST: run every approach over the statement's examples, the edge cases, and a random
stress case cross-checked against a reference; print every measured number the prose quotes; run
every buggy variant the prose describes; and end with one line saying whether the approaches agreed.
`scripts/verify-deep.mjs` requires that line.>

---

## Before you hand it back

- [ ] `python` the script. Every approach agrees; every quoted number came from this run.
- [ ] Every "common mistake" was RUN. No invented wrong answers.
- [ ] `node scripts/verify-deep.mjs --id <id>` — clean exit and the agreement line.
- [ ] `node scripts/learn-gaps.mjs --strict` — no undisclosed added rungs.
- [ ] `npm run docs:learn` — the merged page picks the document up.
- [ ] Read it once as the first-year student. If the arithmetic is unexplained anywhere, go back.
