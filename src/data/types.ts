// Shared content types. Data files import from here; components import from data/index.

export type Difficulty = "easy" | "medium" | "hard"

export interface Example {
  input: string
  output: string
  note?: string
}

// One frame of a step-by-step walkthrough: values plus coloured index marks,
// with `caption` narrating the step.
//
// There used to be a second shape here — `text`, a monospace diagram — for the
// lists, trees and graphs the chip row could not draw. Every one of those
// problems has a journey now, with a real tree, list or grid on the stage, so
// the fallback and the field are gone (B54 / V7).
export type CellRole = "focus" | "compare" | "window" | "done"

export interface Frame {
  cells: {
    values: (number | string)[]
    marks?: Record<number, CellRole>
    labels?: Record<number, string> // pointer names drawn under cells, e.g. {0: "i", 5: "j"}
  }
  caption: string
}

// An alternative way to solve a problem (brute force, sorting-based, …).
// The problem's top-level approach/python is always the recommended one.
// Code in three languages. `python` is required; `java` / `cpp` arrive per
// problem as the pipeline reaches it (docs/PROBLEMS.md) and are required
// once the problem has a journey (data/problems.test.ts).
export interface Code {
  python: string
  java?: string
  cpp?: string
}

export interface Solution extends Code {
  // A stable id for this rung, in the same vocabulary a journey uses for
  // `Act.key` — `brute`, `set`, `floyd`, `mark`. Three things need a rung to be
  // ADDRESSABLE rather than merely present: the comparator's `?compare=a,b`
  // route, the `{#key}` anchor that binds a heading in `docs/deep/` to this
  // record (B78), and the merge in `lib/ladder.ts` that decides whether an
  // alternative is the same rung as a journey act or a different one.
  //
  // Optional, and it falls back to a slug of `name`, because 249 alternatives
  // did not need renaming to make three problems addressable. Write it
  // explicitly when the key is load-bearing: a compare link, a doc anchor, or
  // a rung that must line up with an act.
  key?: string
  /**
   * The key of the rung this one sits immediately ABOVE on the ladder.
   *
   * `alternatives` is worst -> best and so are a journey's acts, but the two
   * lists interleave and the array alone cannot say how. `lib/ladder.ts` used
   * to infer it from one pivot: everything before the first act-matching
   * alternative was a baseline and went to the foot, everything after it was a
   * variant argued against the optimal and went on top. That is right for a
   * baseline and for a variant, and WRONG for a stepping stone — sorted-squares
   * teaches "merge two runs" between the sort and the two-pointer answer, and
   * the pivot rule rendered it above the answer, which is the one ordering the
   * page promises it never shows.
   *
   * So a stepping stone says where it goes. Absent, the pivot rule still
   * applies, which is why 249 alternatives did not need touching.
   */
  after?: string
  name: string // short tab label: "Brute force", "Sorting", "Hash map"
  summary: string
  complexity: { time: string; space: string }
  /** how this rung's bound was counted — see `Problem.costWhy` */
  costWhy?: string
  // The weakness in the PREVIOUS rung of the ladder that this one removes.
  // Absent on the first rung, which has nothing before it (docs/PROBLEMS.md
  // §P1). A journeyed problem gets this from the act's `insight` instead.
  whyNow?: string
}

/**
 * One question asked BEFORE the approaches, about the statement alone.
 *
 * Not a quiz on the solution — a reader who can pick the right answer here has
 * understood what is being asked, which is the step the page used to skip. The
 * ladder starts at "brute force compares every pair", and a reader who has not
 * yet noticed that the question is *whether* a repeat exists rather than
 * *which* value repeats reads all three rungs without that landing.
 *
 * `because` is the whole value: it is shown once answered, right or wrong, and
 * says what the statement or the constraints already told you.
 */
export interface Check {
  ask: string
  /** two or more; the reader picks one */
  options: string[]
  /** index into `options` */
  answer: number
  /** why that is the answer, in one or two sentences, citing the statement */
  because: string
}

/**
 * A bound, drawn — see `components/figure/constraint-figure.tsx`.
 *
 * AUTHORED, never inferred. A number that appears in a constraint string is not
 * a number a chart may assume it understands: `10^5` is a length, `10^9` is a
 * value, and a figure that guessed which would eventually draw a confident lie.
 * Three kinds, each a shape the corpus's constraints actually take.
 */
export type ConstraintFigure =
  /** amounts that must be COMPARED — the work at the input's ceiling, or what
   *  you could hold against what you will. Drawn on a log scale. */
  | {
      kind: "quantities"
      items: { label: string; value: number; tone?: "bad" | "good" | "plain" }[]
      /** these quantities are OPERATIONS, so the figure may say what they feel
       *  like in seconds. Absent, they are counts of something else — "two
       *  billion values" is not two seconds of anything — and no time is
       *  shown. See `feelsLike` in `lib/figure-scale.ts`. */
      unit?: "ops"
    }
  /** a range with the values you will actually see marked on it: the picture of
   *  sparsity, which is the argument against indexing by value. `marks` are
   *  percentages along the span. */
  | { kind: "span"; from: string; to: string; marks: number[]; note?: string }
  /** a literal array, small enough to count — the base cases */
  | { kind: "cells"; values: string[]; caption?: string }

export interface Problem extends Code {
  id: string
  title: string
  pattern: string // Pattern.id
  difficulty: Difficulty
  brief: string // one-liner for list rows
  leetcode: string // slug on leetcode.com — the page's primary action links out
  statement: string
  // What the input promises: bounds, and the guarantees that turn a corner
  // case from trivia into a decision (docs/PROBLEMS.md §P1). Written in our
  // own words from the problem's public definition, never copied.
  constraints: string[]
  examples: Example[]
  hints: string[] // progressive: nudge -> idea -> almost-there
  approach: string
  whyNow?: string // why the optimal rung beats the last alternative (see Solution)
  // The closing narrative: the ONE idea the whole ladder applies, said in prose,
  // and which rungs are worth knowing cold. A rung says why it beats the rung
  // below it; `arc` says what all of them have in common — the part a learner
  // carries to the next problem. Rendered after the ladder, and only when the
  // ladder is complete: on a journeyed problem mid-flight it would name an
  // approach the ledger has not handed over yet.
  arc?: string
  complexity: { time: string; space: string }
  // How that bound was COUNTED, not just what it is. A reader who cannot
  // reproduce the count cannot transfer it: `O(n)` on this page is one pass
  // over n values with a constant-time membership test inside it, and saying
  // so is the difference between a label and a skill. Rendered under the
  // target in the orient zone, and per rung on the ladder (`Solution.costWhy`).
  costWhy?: string

  // What each bound BUYS — the constraint line, and the decision it permits or
  // forbids. Same shape as a teaching document's `unlocks` table, because it is
  // the same content: a corner case is trivia until a constraint makes it a
  // decision (R2), and a bound is noise until it rules something out.
  // `constraint` must match one of `constraints` exactly (problems.test.ts).
  unlocks?: { constraint: string; what: string; figure?: ConstraintFigure }[]
  // Read-before-you-solve. See `Check` — comprehension of the statement, asked
  // before the first approach and never about the solution.
  checks?: Check[]
  // Sources for THIS problem, beside the pattern's own reading list: the
  // editorial, a second site's write-up of the same problem, a video. The
  // pattern owns the sources about the TECHNIQUE (see `Reference`); this owns
  // the ones that are about this instance and would be wrong on any other
  // problem in the pattern.
  reading?: Reference[]
  walkthrough?: Frame[] // stepped visualization of the approach on an example
  alternatives?: Solution[] // other ways in, worst-to-best order; optimal stays top-level
}

// Somewhere outside this repo that teaches the same idea properly.
//
// Why references are attached to a PATTERN and not to a problem: the good
// sources are about the technique, not about one instance of it. There is an
// authoritative page on hash tables; there is no authoritative page on
// "Pair With Target Sum". Attaching them per problem would have meant 127
// rows of mostly the same three links.
//
// Every one of these is a link OUT. Nothing in this repo copies text from
// them — the README's claim that all the material here is an original
// write-up is load-bearing, and a references list is how you honour a source
// without borrowing from it. `data/problems.test.ts` holds the shape to that:
// https only, no dead-obvious placeholders, and a note on every row saying
// what the source is FOR, because a bare link is a chore and not a reading.
export interface Reference {
  title: string
  href: string
  /** picks the mark beside the row — a text, an official manual, or a course */
  kind: "reference" | "docs" | "course"
  /** one line: why THIS source, and what it answers that the app does not */
  note: string
}

// One move of a pattern's playbook: the technique, how to recognise it from the
// statement alone, and the mistake people actually make writing it.
//
// Why this is a RECORD and not the Markdown it came from. `docs/RESOURCES.md`
// held the best writing in the repository — the six array ideas and the five
// list moves — in tables that nothing in `src/` could read, so it reached no
// screen at all. As data it is a query: `#/resources` renders it, a pattern's
// problems inherit it, and extending it to the other eight patterns is filling
// a table rather than writing a document.
//
// `learnOn` is problem IDs, checked by `data/problems.test.ts`, so a row cannot
// point at a problem that was renamed or never existed.
export interface Move {
  /** the technique, named — "Dummy head", "Prefix sums" */
  name: string
  /** what it IS, in one sentence: the mechanism, not the motivation */
  idea: string
  /** the tell: what in the STATEMENT says to reach for this */
  tell: string
  /** what must stay true while the loop runs. Absent where a move has no
   *  single invariant worth naming — the array ideas mostly do not */
  invariant?: string
  /** problem ids in this repo, so a row is a set of routes and not a citation */
  learnOn: string[]
  /** the mistake people actually make, with the input that exposes it */
  mistake: string
}

export interface Pattern {
  id: string
  name: string
  glyph: string // monospace signature shown in nav + headers
  blurb: string // when to reach for this pattern
  // Checked with a real HTTP request when they were added (2026-09-13); three
  // candidates were dropped for 404 and one — the Wikipedia "sliding window
  // protocol" — for being the NETWORKING thing of the same name.
  references?: Reference[]
  /** how to recognise and write this pattern — rendered on `#/resources` */
  playbook?: Move[]
}

export interface SqlProblem {
  id: string
  title: string
  difficulty: Difficulty
  schema: string
  question: string
  hints: string[]
  solution: string
  explanation: string
}

export interface Flashcard {
  tag: string
  q: string
  a: string
}
