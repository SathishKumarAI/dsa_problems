// The shape of one problem's teaching document, as a type instead of a heading
// convention.
//
// `docs/deep/README.md` has always specified the sections — Understanding, one
// block per approach carrying all six parts, the Arc, the Comparison table,
// Interview Priority, the Full Runnable Script. Nothing enforced it: the
// document was Markdown, so `scripts/learn-gaps.mjs` had to GREP for headings
// and report a table of what 127 documents were missing. A missing section was
// a row in a report.
//
// Here it is a compile error, and the drift class that produced three bugs in
// one day is gone with it:
//
//   * an approach names the RUNG it teaches (`rung: "floyd"`), so a document
//     cannot teach an approach the problem has no record for. That was the
//     45-of-82 gap, and the "*(an addition — not in the data file's ladder)*"
//     convention that disclosed it.
//   * the runnable script is a field, not "the last ```python fence", so
//     `verify-deep.mjs` reads a string instead of parsing prose for one.
//   * there is ONE file per problem, so there is nothing to keep in step.
//
// PROSE STAYS MARKDOWN, deliberately. The drift was never inside a paragraph —
// it was over which approaches exist and which sections are present. Typing the
// STRUCTURE removes it; typing every sentence would buy nothing and cost 82
// re-markups of 650 lines each. The strings below go through the same parser
// `docs/learn` already used (`lib/markdown.ts`), which is 383 tested lines and
// not debt.
//
// LAZY, and this is load-bearing. These modules are ~40 KB of prose each and
// there will be 127 of them. Nothing may import one statically: they are
// reached through `import.meta.glob` in `lib/content.ts`, exactly as
// `docs/learn/*.md` was. A static import would put 3 MB of prose into the first
// chunk, which is already 738 KB gzipped (B95).

/** One approach, with all six parts `docs/deep/README.md` §3 requires. */
export interface ApproachDoc {
  /**
   * The `Solution.key` this section teaches — `brute`, `set`, `floyd`, `mark`.
   * A test binds it to the problem's rungs in both directions: a document may
   * not teach an approach with no record, and a rung may not go untaught.
   */
  rung: string
  /** the heading, without the "Approach N:" prefix a renderer can compute */
  title: string
  /** 2–3 sentences, question-and-answer, naming which limitation it fixes */
  idea: string
  /** the mental model — the SHAPE of the reasoning, never the code restated */
  intuition: string
  /** one input, the same one in every approach, traced as a table of state */
  worked: string
  /** Python. The ladder's own `Code` record holds Java and C++ as well. */
  code: string
  /** the misconception behind the bug, and why it is wrong */
  mistake: string
  /** time and space, where the cost comes from, and when to reach for it */
  cost: string
}

/** A constraint, and the approach it is a permission slip for. */
export interface Unlock {
  constraint: string
  what: string
}

export interface Comparison {
  head: string[]
  rows: string[][]
}

export interface TeachingDoc {
  /** the `Problem.id` this document teaches — checked against the catalogue */
  problemId: string
  /** plain language, no jargon; names the core question */
  understanding: string
  /** constraint → what it unlocks (§1). Absent on the thinnest documents. */
  unlocks?: Unlock[]
  /** §2 — the symbol table and how to trace it by hand. 10 of 127 have it. */
  calculations?: string
  /** least to most optimized */
  approaches: ApproachDoc[]
  /** ONE connected narrative; expands `Problem.arc` rather than pasting it */
  arc: string
  comparison: Comparison
  /** which 2–3 to know cold, and why the others are for understanding */
  interview: string
  /** §8 — drills, in order. 10 of 127 have it. */
  fluent?: string
  /** the prose introducing the script — which helpers are scaffolding rather
   *  than part of the answer, and the guards the harness needs. Discarded by
   *  the first conversion, which took the fence and threw away everything
   *  around it; `content-roundtrip.mjs` caught it. */
  scriptNote?: string
  /** §9 — every approach plus tests, ending in one line saying they agreed.
   *  `scripts/verify-deep.mjs` runs THIS, on every pull request. */
  script: string
}
