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
      kind: "recap"
      caption: string
      rows: RecapRow[]
      note: string
      links: RecapLink[]
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
  expected: number[]
  tag?: string
  anyPair?: boolean
}

export interface ReviewItem {
  q: string
  check?: (code: string) => boolean | undefined
}

export interface Challenge {
  fname: string
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
  sample: D
  edgeCases: EdgeCase[] // every one must be tagged by some frame on its preset (journeys.test.ts)
}

export type AnyJourney = Journey<{ nums: number[]; [k: string]: unknown }>
