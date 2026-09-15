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

/** A `###` part the six named ones do not cover, kept in document order. */
export interface Note {
  title: string
  body: string
}

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
  /** prose in the `### Code` part that is not the fence — the line under
   *  inorder-walk's traversal that says moving one line up gives you preorder
   *  and down gives you postorder, which is the thing to remember from that
   *  rung. Seven of twelve documents in the first batch had one. */
  codeNote?: string
  /** the misconception behind the bug, and why it is wrong */
  mistake: string
  /** time and space, where the cost comes from, and when to reach for it */
  cost: string
  /**
   * Every OTHER `###` part of the approach, in order. The format asks for six;
   * it also demands a `> **Why it works.**` argument on every greedy and every
   * two-pointer solution, and that lands here — along with "Why the walk is
   * still linear, despite the inner loop", "The cost of mutation — who it hurts,
   * and can it be undone", and "The exchange argument — why skipping is safe".
   *
   * The first converter read exactly six parts by regex and threw the rest away.
   * That is 27 lines of the argument for container-water's whole approach, gone
   * silently. Nothing is dropped now: the converter fails if a part has nowhere
   * to go.
   */
  notes?: Note[]
}

/**
 * One way the problem goes wrong, named so the rest of the document can refer
 * to it by number instead of re-describing it.
 *
 * Typed rather than left as prose because the numbering is load-bearing:
 * balanced-brackets' three failure modes are cited by every approach's
 * `mistake`, by its worked example and by its interview note, and a document
 * that renumbers them in one place and not the others reads as correct.
 *
 * NOT the journey's `edges`. Those are four preset-bound cases that cite a line
 * of `constraints` and load an animation; these are the document's own list,
 * three of them, with the line of code that catches each. Same subject, two
 * different artifacts — merging them would drop the presets on one side and the
 * `check` column on the other.
 */
export interface Trap {
  /** the failure, in the words the document uses when it cites it */
  name: string
  /** the shortest inputs that trigger it */
  example: string
  /** what the code must test for, in one clause */
  check: string
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
  /** plain language, no jargon; names the core question — the WHOLE section
   *  apart from the unlocks table, including its `###` subsections. The first
   *  converter kept only the text before the first `###`, which in eight of
   *  twelve documents cut off the declaration of the worked-example input every
   *  later section refers to. */
  understanding: string
  /** constraint → what it unlocks (§1). Absent on the thinnest documents. */
  unlocks?: Unlock[]
  /**
   * §1 — the ways a solution to THIS problem fails, numbered. `intro` says why
   * the list is the whole test suite; `outro` is the paragraph on which of them
   * get forgotten and why.
   */
  traps?: { intro: string; rows: Trap[]; outro?: string }
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
  /**
   * `### Output when run` — what the script prints, so a reader who cannot run
   * it still sees the agreement. 291 of the 456 lines the first converter lost
   * across twelve documents were this one section: it kept only the prose
   * BEFORE the first fence and discarded everything after it.
   */
  scriptOutput?: string
  /**
   * Any `##` section with no field of its own, in order — is-subsequence's
   * "The reader/writer family", which names the sibling problems using the same
   * move. The converter used to eat these without a word.
   */
  notes?: Note[]
}
