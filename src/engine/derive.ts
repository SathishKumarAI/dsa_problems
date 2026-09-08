// Builds a Journey out of a Problem. Owns the half of a journey that src/data
// already carries — title, the ladder of approaches, code, complexity, hints,
// constraints — plus the array plumbing every {nums} journey repeats
// (classify, describe, parse, presets) and one generic stage: the chip row,
// and a small state panel under it.
//
// Owns NO visuals of its own. A derived journey draws chips; a problem that
// needs its own picture (water between posts, a hash table, bit rows) gets a
// hand-written journey in ./journeys instead. See docs/AUTHORING.md.
//
// The caller supplies only what a Problem cannot: the act framing (insight,
// idea, takeaways), the quiz, the corner cases, and one generator per rung.

import type { Problem } from "../data/types.ts"
import type {
  Act,
  ChipModel,
  ChipRole,
  CodeTabs,
  EdgeCase,
  Journey,
  Quiz,
  StageModel,
  Tool,
} from "./types.ts"

export interface Data {
  nums: number[]
  [k: string]: unknown
}

// What a derived generator yields. `marks` colours the array row, `state` is
// the row of named numbers under it — that is the whole visual vocabulary.
export interface DFrame {
  note: string
  line?: number
  hold?: number
  corner?: string
  noChips?: boolean
  marks?: Record<number, ChipRole>
  state?: { label: string; value: number | string }[]
  answer?: unknown
}

// One rung of the ladder. `from` indexes problem.alternatives; omit it for the
// optimal approach, which lives at the top level of the Problem.
export interface Rung {
  key: string
  name: string
  short: string
  insight: string
  idea: string
  takeaways: string[]
  hints?: string[]
  quiz?: Quiz[]
  tools?: Tool[]
  from?: number
  pseudo?: string[] // story acts only: no Problem code to read
  complexity?: string
  run(d: Data): Generator<DFrame>
}

export interface DerivedSpec {
  slug: string
  subtitle: string
  reveals?: string[]
  sample?: number[]
  presets: Record<string, { label: string; nums: number[]; info?: string }>
  defaultPreset: string
  harder?: { preset: string; label: string }
  rungs: Rung[]
  // A corner case plus the preset that loads it. `constraint` cites the line
  // in problem.constraints by index — a case is trivia until a constraint
  // makes it a decision (R2).
  edges: (Omit<EdgeCase, "constraint"> & { constraint: number })[]
}

const chips = (nums: number[], marks: Record<number, ChipRole> = {}) =>
  nums.map<ChipModel>((value, i) => ({
    key: `c${i}`,
    value,
    roles: marks[i] ? [marks[i]] : [],
  }))

// Code tabs for one rung. The pseudocode row a frame highlights must exist in
// every tab, so a language is shown only when it splits to the same number of
// lines as the pseudocode. Python IS the pseudocode here: it is the one
// language every problem carries, and it reads as pseudocode by construction.
// ponytail: costs the Java/C++ tabs on any rung whose translations differ in
// length — relax journeys.test.ts with a per-act `sync: false` if that bites.
function tabsFor(src: { python: string; java?: string; cpp?: string }): CodeTabs {
  const pseudo = src.python.split("\n")
  const out: CodeTabs = { pseudo }
  for (const lang of ["java", "cpp"] as const) {
    const lines = src[lang]?.split("\n")
    if (lines && lines.length === pseudo.length) out[lang] = lines
  }
  return out
}

export function deriveJourney(problem: Problem, spec: DerivedSpec): Journey<Data> {
  const acts = spec.rungs.map<Act<Data, DFrame>>((r) => {
    const src = r.from === undefined ? problem : problem.alternatives![r.from]
    const solved = "python" in src && !r.pseudo
    return {
      key: r.key,
      name: r.name,
      short: r.short,
      complexity: r.complexity ?? (solved ? `${src.complexity.time} time · ${src.complexity.space} space` : "no code yet — just the shape"),
      insight: r.insight,
      idea: r.idea,
      tools: r.tools,
      takeaways: r.takeaways,
      hints: r.hints,
      quiz: r.quiz,
      code: r.pseudo ? { pseudo: r.pseudo } : tabsFor(src as { python: string; java?: string; cpp?: string }),
      run: (d) => r.run(d),
      view: (f, d): StageModel => ({
        chips: f.noChips ? null : chips(d.nums, f.marks),
        panel: f.state?.length
          ? {
              kind: "sorted",
              label: f.state.map((s) => s.label).join(" · "),
              chips: f.state.map((s) => ({
                key: s.label,
                value: s.value,
                sub: s.label,
                roles: [],
              })),
            }
          : { kind: "none" },
      }),
    }
  })

  const presets = Object.fromEntries(
    Object.entries(spec.presets).map(([k, p]) => [
      k,
      { label: p.label, info: p.info, make: () => ({ nums: [...p.nums] }) },
    ])
  )

  return {
    slug: spec.slug,
    title: problem.title,
    subtitle: spec.subtitle,
    problemId: problem.id,
    acts,
    resources: [
      { label: `${problem.title} on LeetCode`, url: `https://leetcode.com/problems/${problem.leetcode}/` },
    ],
    presets,
    defaultPreset: spec.defaultPreset,
    harder: spec.harder,
    classify: () => ({ ok: true }),
    describe: (d) => d.nums.join(", "),
    parse: (text) => {
      const nums = text
        .split(/[^-\d]+/)
        .filter(Boolean)
        .map(Number)
        .filter((v) => Number.isInteger(v))
      return nums.length ? { nums } : null
    },
    reveals: spec.reveals,
    sample: { nums: spec.sample ?? spec.presets[spec.defaultPreset].nums },
    edgeCases: spec.edges.map<EdgeCase>((e) => ({
      ...e,
      constraint: problem.constraints[e.constraint],
    })),
  }
}
