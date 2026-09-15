# `src/problems/` — one directory per problem

Everything about one problem lives in one directory: the record the app renders, and the teaching
document that explains it. Read the table, not the code.

## Change → file

| Change | File |
|---|---|
| Statement, constraints, examples, title, difficulty | `<id>/problem.ts` |
| The progressive hints | `<id>/hints.ts` |
| A rung — its code in three languages, its cost, why it beats the one below | `<id>/solutions.ts` |
| The short arc under the ladder on the **problem page** | `<id>/solutions.ts` (`arc`) |
| "Understanding the Problem", and the constraints → what-they-unlock table | `<id>/understanding.ts` |
| The numbered failure modes the approaches cite | `<id>/traps.ts` |
| One approach's idea / intuition / worked example / code / mistake / cost | `<id>/approaches/<rung>.ts` |
| The long closing arc and the comparison table on the **learn page** | `<id>/arc.ts` |
| Which rungs to know cold, and the drills | `<id>/interview.ts` |
| The runnable script `verify-deep` executes and the Run button runs | `<id>/script.ts` |
| A section the house format has no field for | `<id>/notes.ts` |
| Which parts the document is assembled from | `<id>/doc.ts` |

## The two entry files, and why there are two

| File | Reached by | Holds |
|---|---|---|
| `index.ts` | `src/data/problems/<pattern>/index.ts`, **statically** | the `Problem` record |
| `doc.ts` | `src/lib/content.ts`'s `import.meta.glob`, **lazily** | the `TeachingDoc` |

A problem record is in the first chunk because the catalogue needs it before it knows which route
it is on. A teaching document is ~30 KB of prose per problem and belongs to one route. So `index.ts`
must never import anything `doc.ts` imports, directly or otherwise — one static edge from the record
half to the prose half puts 127 documents into the first load, which is B95.

## Rules

| Rule | Why |
|---|---|
| **Nothing here is copied from anywhere else.** The record is the only home for the statement, the hints and the ladder | Two copies of a statement is two statements, and the second one is wrong within a month |
| An approach's `rung` must name a rung in `solutions.ts` | `src/content/content.test.ts` fails both ways: a document may not teach an approach with no record, and a rung may not go untaught |
| `docs/deep/<id>_explained.md` is **deleted** in the commit that converts it | Two sources for one document is the drift this directory exists to end. `scripts/content-roundtrip.mjs` proves nothing was lost before it goes |
| The prose fields are **Markdown strings**, and stay that way | The drift was never inside a paragraph — it was over which sections exist. Typing the structure removes it; typing every sentence buys nothing |
| A directory may have `doc.ts` and no `index.ts`, or the reverse | The two halves migrate independently. Thirteen documents moved here before their records did |

## Converting one

```
node scripts/md-to-content.mjs --id <problem-id>   # md -> this directory
node scripts/content-roundtrip.mjs --id <id>       # prove no line was lost
node scripts/verify-deep.mjs --id <id>             # the script runs and agrees
```

The one judgement a machine must not make is which rung each `## Approach` teaches. Record it in
`scripts/rung-bindings.json`; anything absent is emitted blank and fails `content.test.ts` until a
human decides.
