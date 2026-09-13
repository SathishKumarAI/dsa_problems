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
  CellModel,
  ChipModel,
  ChipRole,
  CodeTabs,
  EdgeCase,
  Journey,
  Quiz,
  StageModel,
  Tool,
  Verdict,
} from "./types.ts"

// `nums` is the row on screen, whatever it holds: numbers for an array
// problem, single characters for a string one. The chip row draws either.
export type Cell = number | string

export interface Data<C extends Cell = number> {
  nums: C[]
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
  // The row to draw instead of the input, for an act that reorders it (a sort
  // rung). Keys stay positional, so a sorted copy morphs rather than teleports.
  row?: Cell[]
  // A shape the chip row cannot draw. At most one per frame; when present it
  // replaces the state panel, and the chip row is hidden — a grid IS the data,
  // so a row of chips above it would be a second, contradictory picture.
  grid?: { cells: Cell[][]; marks?: Record<string, ChipRole>; label?: string }
  tree?: {
    // level-order: the node at i has children 2i+1 and 2i+2, null = absent
    slots: (Cell | null)[]
    marks?: Record<number, ChipRole>
    labels?: Record<number, string>
    label?: string
  }
  list?: {
    values: Cell[]
    marks?: Record<number, ChipRole>
    labels?: Record<number, string>
    cycleTo?: number
    label?: string
  }
  state?: { label: string; value: Cell }[]
  answer?: unknown
}

// One rung of the ladder. `from` indexes problem.alternatives; omit it for the
// optimal approach, which lives at the top level of the Problem.
export interface Rung<C extends Cell = number> {
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
  run(d: Data<C>): Generator<DFrame>
}

export interface DerivedSpec<C extends Cell = number> {
  slug: string
  subtitle: string
  reveals?: string[]
  sample?: C[]
  // `extra` carries what a problem needs beside the row — a target, a k, or a
  // second string — and every one of them must be declared in `params` so the
  // test-case drawer can offer a field for it.
  presets: Record<
    string,
    {
      label: string
      nums: C[]
      info?: string
      extra?: Record<string, number | string>
    }
  >
  defaultPreset: string
  harder?: { preset: string; label: string }
  params?: { key: string; label: string; kind?: "number" | "string" }[]
  // Rejects an input the acts cannot honestly run — a binary search on an
  // unsorted row would animate a lie. Default: everything is legal.
  classify?: (d: Data<C>) => Verdict
  rungs: Rung<C>[]
  // A corner case plus the preset that loads it. `constraint` cites the line
  // in problem.constraints by index — a case is trivia until a constraint
  // makes it a decision (R2).
  edges: (Omit<EdgeCase, "constraint"> & { constraint: number })[]
  // A row of characters reads and parses differently from a row of numbers;
  // everything else about a derived journey is the same, so this is the only
  // per-shape hook rather than a second builder.
  cells?: "numbers" | "characters" | "words"
}

const chips = (nums: Cell[], marks: Record<number, ChipRole> = {}) =>
  nums.map<ChipModel>((value, i) => ({
    key: `c${i}`,
    value,
    roles: marks[i] ? [marks[i]] : [],
  }))

// Code tabs for one rung. Python IS the pseudocode here: it is the one language
// every problem carries, and it reads as pseudocode by construction.
//
// B43. This used to DROP Java and C++ whenever they split to a different number
// of lines, which is most of the time — a faithful translation of the same rung
// is 9 Java lines against 7 of Python on max-subarray. That protected the
// highlight and cost the reference code on 82 problems. Both tabs are kept now;
// a language whose rows do not line up is listed in `unsynced`, and the
// highlight is off for that tab alone.
function tabsFor(src: {
  python: string
  java?: string
  cpp?: string
}): CodeTabs {
  const pseudo = src.python.split("\n")
  const out: CodeTabs = { pseudo }
  const unsynced: ("java" | "cpp")[] = []
  for (const lang of ["java", "cpp"] as const) {
    const lines = src[lang]?.split("\n")
    if (!lines) continue
    out[lang] = lines
    if (lines.length !== pseudo.length) unsynced.push(lang)
  }
  if (unsynced.length) out.unsynced = unsynced
  return out
}

export function deriveJourney<C extends Cell = number>(
  problem: Problem,
  spec: DerivedSpec<C>
): Journey<Data<C>> {
  const acts = spec.rungs.map<Act<Data<C>, DFrame>>((r) => {
    const src = r.from === undefined ? problem : problem.alternatives![r.from]
    const solved = "python" in src && !r.pseudo
    return {
      key: r.key,
      name: r.name,
      short: r.short,
      complexity:
        r.complexity ??
        (solved
          ? `${src.complexity.time} time · ${src.complexity.space} space`
          : "no code yet — just the shape"),
      insight: r.insight,
      idea: r.idea,
      tools: r.tools,
      takeaways: r.takeaways,
      hints: r.hints,
      quiz: r.quiz,
      code: r.pseudo
        ? { pseudo: r.pseudo }
        : tabsFor(src as { python: string; java?: string; cpp?: string }),
      run: (d) => r.run(d),
      view: (f, d): StageModel => ({
        chips:
          f.grid || f.tree || f.list
            ? null
            : f.noChips
              ? null
              : chips(f.row ?? d.nums, f.marks),
        panel: f.grid
          ? {
              kind: "grid",
              label: f.grid.label ?? "grid",
              rows: f.grid.cells.map((row, r) =>
                row.map((value, c) => ({
                  key: `g${r}-${c}`,
                  value,
                  roles: f.grid!.marks?.[`${r},${c}`]
                    ? [f.grid!.marks[`${r},${c}`]]
                    : [],
                }))
              ),
            }
          : f.tree
            ? {
                kind: "tree",
                label: f.tree.label ?? "tree",
                slots: f.tree.slots.map((value, i) =>
                  value === null
                    ? null
                    : ({
                        key: `t${i}`,
                        value,
                        roles: f.tree!.marks?.[i] ? [f.tree!.marks[i]] : [],
                        label: f.tree!.labels?.[i],
                      } as CellModel)
                ),
              }
            : f.list
              ? {
                  kind: "list",
                  // A frame may carry one SHAPE, and the list takes the panel —
                  // so a `state` written beside it used to be dropped on the
                  // floor. Measured 2026-09-12: 46 frames across five journeys
                  // were writing counters nobody could ever see, including the
                  // "nodes moved: 0" that is the entire proof of swap-pairs'
                  // value-swap rung. The state is not a second picture, it is a
                  // reading of this one, so it belongs in the caption.
                  label: [
                    f.list.label ?? "list",
                    ...(f.state ?? []).map((s) => `${s.label} ${s.value}`),
                  ].join(" · "),
                  cycleTo: f.list.cycleTo,
                  nodes: f.list.values.map((value, i) => ({
                    key: `l${i}`,
                    value,
                    roles: f.list!.marks?.[i] ? [f.list!.marks[i]] : [],
                    label: f.list!.labels?.[i],
                  })),
                }
              : f.state?.length
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
      {
        label: p.label,
        info: p.info,
        make: () => ({ nums: [...p.nums], ...p.extra }) as Data<C>,
      },
    ])
  )

  return {
    slug: spec.slug,
    title: problem.title,
    subtitle: spec.subtitle,
    problemId: problem.id,
    acts,
    resources: [
      {
        label: `${problem.title} on LeetCode`,
        url: `https://leetcode.com/problems/${problem.leetcode}/`,
      },
    ],
    presets,
    defaultPreset: spec.defaultPreset,
    harder: spec.harder,
    params: spec.params,
    classify: spec.classify ?? (() => ({ ok: true })),
    describe: (d) =>
      spec.cells === "characters"
        ? d.nums.join("")
        : spec.cells === "words"
          ? d.nums.join(" ")
          : d.nums.join(", "),
    parse: (text, params) => {
      const extra: Record<string, number | string> = {}
      for (const { key, kind } of spec.params ?? []) {
        if (kind === "string") {
          extra[key] = params[key] ?? ""
          continue
        }
        const v = Number(params[key])
        if (!Number.isInteger(v)) return null
        extra[key] = v
      }
      if (spec.cells === "characters")
        return { nums: [...text] as C[], ...extra } as Data<C>
      if (spec.cells === "words") {
        const words = text.split(/[\s,]+/).filter(Boolean)
        return words.length ? ({ nums: words, ...extra } as Data<C>) : null
      }
      const nums = text
        .split(/[^-\d]+/)
        .filter(Boolean)
        .map(Number)
        .filter((v) => Number.isInteger(v))
      return nums.length ? ({ nums, ...extra } as Data<C>) : null
    },
    reveals: spec.reveals,
    sample: {
      nums: spec.sample ?? spec.presets[spec.defaultPreset].nums,
      ...spec.presets[spec.defaultPreset].extra,
    } as Data<C>,
    edgeCases: spec.edges.map<EdgeCase>((e) => ({
      ...e,
      constraint: problem.constraints[e.constraint],
    })),
  }
}
