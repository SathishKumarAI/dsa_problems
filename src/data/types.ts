// Shared content types. Data files import from here; components import from data/index.

export type Difficulty = "easy" | "medium" | "hard"

export interface Example {
  input: string
  output: string
  note?: string
}

// One frame of a step-by-step walkthrough. Either `cells` (array/string
// problems: values + colored index marks) or `text` (monospace diagram for
// lists/trees/graphs). `caption` narrates the step.
export type CellRole = "focus" | "compare" | "window" | "done"

export interface Frame {
  cells?: {
    values: (number | string)[]
    marks?: Record<number, CellRole>
    labels?: Record<number, string> // pointer names drawn under cells, e.g. {0: "i", 5: "j"}
  }
  text?: string
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
  complexity: { time: string; space: string }
  walkthrough?: Frame[] // stepped visualization of the approach on an example
  alternatives?: Solution[] // other ways in, worst-to-best order; optimal stays top-level
}

export interface Pattern {
  id: string
  name: string
  glyph: string // monospace signature shown in nav + headers
  blurb: string // when to reach for this pattern
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
