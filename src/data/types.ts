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
export interface Solution {
  name: string // short tab label: "Brute force", "Sorting", "Hash map"
  summary: string
  complexity: { time: string; space: string }
  python: string
}

export interface Problem {
  id: string
  title: string
  pattern: string // Pattern.id
  difficulty: Difficulty
  brief: string // one-liner for list rows
  statement: string
  examples: Example[]
  hints: string[] // progressive: nudge -> idea -> almost-there
  approach: string
  complexity: { time: string; space: string }
  python: string
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
