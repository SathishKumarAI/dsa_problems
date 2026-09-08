# `src/data/problems/` — the practice set

One problem is **one file**: `src/data/problems/<pattern>/<id>.ts`, exporting a single
`problem: Problem`. Its directory's `index.ts` is a barrel — imports, one array, nothing else —
and `src/data/index.ts` concatenates the ten barrels into `PROBLEMS`.

## Change → file

| Change | File |
|---|---|
| A problem's statement, constraints, examples, hints, approach ladder or code | `<pattern>/<id>.ts` |
| Add a problem to an existing pattern | new `<pattern>/<id>.ts` + one import and one row in `<pattern>/index.ts` |
| Add a whole pattern | new directory + barrel, one import and one spread in `../index.ts`, a row in `../patterns.ts` |
| Reorder problems inside a pattern | the array in `<pattern>/index.ts` |
| What a `Problem` may contain | `../types.ts` |
| The rules a problem must satisfy | `../problems.test.ts` |
| The Java/C++ blocks, and how they are checked | `scripts/localsmith/` (`verify:code`, `verify:run`) |

## Rules

- **The file name is the id.** `problems.test.ts` requires ids unique; the file layout makes a
  duplicate a name collision you cannot commit by accident.
- **The barrel holds no content.** No inline object, no prose — anything else in an `index.ts`
  hides a problem from the change table above.
- A problem that also has a journey (`src/engine/journeys/`) must not carry its own walkthrough
  frames — the journey is the single source (B1, enforced by `journeys.test.ts`).
- Java and C++ blocks are gated by `npm run verify:code` (they compile) and `npm run verify:run`
  (they agree with the Python). Both walk this directory tree; neither reads `index.ts`.
