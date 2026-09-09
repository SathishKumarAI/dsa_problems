// Engine contracts. Owns: the frame/act/journey shapes and the stage view
// model every journey renders into. Owns nothing about React or the DOM —
// this file (and everything under src/engine) runs in node for tests and on
// the API server. Journeys import from here; features import from here.

// ---------- frames: what a generator yields, one per step ----------

export interface Predict {
  q: string
  choices: string[]
  answer: number
}

// The engine reads only these fields. Anything else on a frame is the act's
// private state, interpreted by that act's own view().
export interface BaseFrame {
  note: string // required — narration for this step
  line?: number // pseudocode row to highlight, -1 = none
  hold?: number // multiply the step delay (narrative frames need reading time)
  predict?: Predict // playback pauses BEFORE this frame renders and asks
  noChips?: boolean // story frames that open on an empty stage
  corner?: string // key into journey.edgeCases — this step is where that corner case bites
  predictDone?: boolean // engine bookkeeping: asked once per build
}

export type Frame<Extra = Record<string, unknown>> = BaseFrame & Extra

// ---------- stage view model: what a frame looks like on screen ----------

export type ChipRole = "anchor" | "focus" | "answer" | "dim"

export interface ChipModel {
  key: string // stable identity across frames so the UI can morph, not teleport
  value: number | string
  sub?: string // tiny subscript, e.g. original index after a sort
  roles: ChipRole[]
}

// One column of a bar chart. Same role vocabulary as a chip, so the grammar a
// learner reads on the array row is the grammar they read on the bars.
export interface BarModel {
  key: string // stable identity across frames, as with ChipModel
  value: number
  roles: ChipRole[]
}

// The water held between two bars: the span is inclusive, and `height` is the
// level it fills to — the shorter of the two walls, which is what caps the area.
export interface WaterModel {
  from: number
  to: number
  height: number
  label: string // "width 7 x height 7 = 49"
  best: boolean // this is the largest area measured so far
}

export interface HashEntry {
  key: number
  value: number
}

// A hash map drawn as a hash map: the bucket table under the "seen" pills.
export interface HashModel {
  entries: HashEntry[]
  buckets: number
  chains: HashEntry[][]
  probe: number | null // key being looked up right now (null = inserting)
  slot: number // bucket the probe hashes to, -1 when no probe
  present: boolean // probe physically found in its chain
  hit: boolean // the ALGORITHM's verdict (may differ from present)
  hops: number // chain hops walked for the probe
  load: number // entries / buckets
  resized: boolean // table grew past the minimum size
  collisions: number // buckets holding more than one key
  label: string
  fmt: "at" | "times" // "7 @ 1" (value @ index) or "7 ×2" (value × count)
}

// One cell of a grid, node of a tree, or link of a list. Deliberately the same
// role vocabulary as ChipModel: the grammar a learner reads on the array row
// is the grammar they read everywhere else.
export interface CellModel {
  key: string
  value: number | string
  roles: ChipRole[]
  label?: string // a pointer name drawn beside it
}

export interface SumModel {
  a: number
  b: number
  sum: number
  target: number
}

export interface BitRowModel {
  tag: string
  value: number
  flip: number // mask of bits that just flipped
  bits: number
}

export interface RecapRow {
  name: string
  built: string
  cost: string
  insight: string
}

export interface RecapLink {
  label: string
  detail: string
  href: string
}

export type PanelModel =
  | { kind: "none" }
  | { kind: "story"; glyph: string }
  | { kind: "sum"; eq: SumModel }
  | {
      kind: "need"
      need: number
      hit: boolean
      target: number
      x: number
      map: HashModel
    }
  | { kind: "hash"; map: HashModel }
  | { kind: "sorted"; label: string; chips: ChipModel[]; eq?: SumModel }
  | { kind: "bits"; rows: BitRowModel[] }
  | {
      // heights as columns, with the water between two of them drawn to the
      // height of the shorter wall (the container problems)
      kind: "bars"
      bars: BarModel[]
      water?: WaterModel
      best?: string // the best area found so far, as a line under the chart
    }
  | {
      // k-term equation against a target + the distinct answers so far:
      // terms [a, b, c] → "a + b + c = sum"; with `need`, "a + b + ? — need n"
      kind: "terms"
      terms: number[]
      target: number
      need?: number
      hit?: boolean
      dup?: boolean // the newest hit was a repeat and was dropped
      found: number[][]
      map?: HashModel
    }
  | {
      kind: "recap"
      caption: string
      rows: RecapRow[]
      note: string
      links: RecapLink[]
    }
  | { kind: "grid"; rows: CellModel[][]; label: string }
  | {
      // Level-order slots: the node at i has children 2i+1 and 2i+2, and null
      // is an absent node. One shape covers binary trees and binary heaps,
      // which is why the heap problems can use this view unchanged.
      kind: "tree"
      slots: (CellModel | null)[]
      label: string
    }
  | {
      kind: "list"
      nodes: CellModel[]
      cycleTo?: number // the last node links back to this index
      label: string
    }
  | { kind: "challenge" }

export interface StageModel {
  chips: ChipModel[] | null // null = empty stage (need before data)
  panel: PanelModel
}

// ---------- acts and journeys ----------

export interface Quiz {
  q: string
  choices: string[]
  answer: number
  explain: string
}

export interface Tool {
  name: string
  role: string
}

// Every language is written line-for-line against the pseudocode so a
// frame's `line` highlights the right row in any tab.
export interface CodeTabs {
  pseudo: string[]
  python?: string[]
  java?: string[]
  cpp?: string[]
}

export interface TraceEvent {
  op: "get" | "set"
  i: number
  v: number
}

export interface Trace {
  events: TraceEvent[]
  result: unknown
  error: string | null
}

export interface RunContext {
  trace?: Trace | null // the learner's own execution, for "your code is the animation"
}

export interface Act<D, F extends BaseFrame = BaseFrame> {
  key: string
  name: string
  short: string // ribbon subtitle: "O(n²)", "start here"
  complexity: string
  insight: string // the weakness the previous act had — never a name
  idea: string
  tools?: Tool[]
  code: CodeTabs
  takeaways: string[]
  hints?: string[] // nudge → concept → line to stare at
  quiz?: Quiz[]
  gate?: "pass" // unlock on green tests instead of last frame
  chart?: false // exclude from the steps chart (challenge, recap)
  nextLabel?: string
  // method syntax on purpose: bivariant parameters let Act<D, SpecificFrame>
  // sit in a Journey's Act<D, BaseFrame>[] without a cast
  run(data: D, ctx: RunContext): Generator<F, void, unknown>
  view(frame: F, data: D): StageModel
}

export interface Preset<D> {
  label: string
  make: () => D
  info?: string
}

export interface Verdict {
  ok: boolean
  warning?: string
}

export interface ChallengeCase {
  nums: number[]
  target?: number
  // "pair" challenges expect two indices; "value" challenges expect one
  // number (Single Number returns the loner, not where it sits)
  expected: number[] | number
  tag?: string
  anyPair?: boolean
}

export interface ReviewItem {
  q: string
  check?: (code: string) => boolean | undefined
}

export interface Challenge {
  fname: string
  // how a result is judged: two indices (default) or one value
  answers?: "pair" | "value"
  signature: string
  starter: string
  cases: ChallengeCase[]
  reference: string
  review: ReviewItem[]
  big?: { n: number; make: () => ChallengeCase }
}

export interface Resource {
  label: string
  url: string
}

// A corner case the learner should bring before writing code (Khamies, "How
// to Solve Algorithm Problems" §3.1.4: empty-case, medium-case, corner-case
// inputs). Shown in the story act's reading column; a frame tagged
// `corner: key` explains it in play. Prose is visible from act 0, so it may
// not name any technique — describe what breaks, not what fixes it.
export interface EdgeCase {
  key: string
  name: string // "two equal values"
  example: string // "[3, 1, 3, 8], target 6 → [0, 2]"
  why: string // how it bites: what a naive solution gets wrong here
  think: string // the question to ask yourself before coding
  preset: string // the preset that loads this input
  // The line in the problem's `constraints` this case comes from. A corner
  // case is trivia until a constraint makes it a decision (R2).
  constraint?: string
}

export interface Journey<D = { nums: number[] }> {
  slug: string
  title: string
  subtitle: string
  problemId: string // data/problems id this journey deepens
  leetcode?: number
  acts: Act<D>[] // learning order; first is the story act
  resources: Resource[]
  presets: Record<string, Preset<D>>
  defaultPreset: string
  harder?: { preset: string; label: string }
  params?: { key: string; label: string }[] // extra scalar inputs, e.g. target
  classify: (d: D) => Verdict
  describe: (d: D) => string
  parse: (text: string, params: Record<string, string>) => D | null
  challenge?: Challenge
  // Pattern ids (data/patterns.ts) whose NAME this journey withholds until its
  // recap. While the journey is started and unfinished, the catalogue masks
  // them — see src/lib/disclosure.ts. Ids are checked by data/problems.test.ts.
  reveals?: string[]
  sample: D
  edgeCases: EdgeCase[] // every one must be tagged by some frame on its preset (journeys.test.ts)
}

// The row a journey animates is integers for an array problem and single
// characters for a string one (engine/derive.ts, api/routes.ts isRow).
export type AnyJourney = Journey<{
  nums: (number | string)[]
  [k: string]: unknown
}>
