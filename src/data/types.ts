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
  name: string // short tab label: "Brute force", "Sorting", "Hash map"
  summary: string
  complexity: { time: string; space: string }
  // The weakness in the PREVIOUS rung of the ladder that this one removes.
  // Absent on the first rung, which has nothing before it (docs/PROBLEMS.md
  // §P1). A journeyed problem gets this from the act's `insight` instead.
  whyNow?: string
}

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
