// The approach ladder: every way into a problem, worst to best, each rung
// carrying the weakness in the one before it (docs/PROBLEMS.md §P1).
//
// One builder, two sources, so the reasoning is never written twice (the B1
// rule). A problem WITH a journey draws its rungs from the journey's acts —
// `insight` is already "the weakness the previous act had" — and is capped by
// the ledger exactly as the embedded walkthrough is. A problem without one
// draws them from `alternatives` (worst → best) plus the optimal at the top.
//
// Owns the shape and the picking. Owns no markup: problem-detail.tsx renders it.

import type { AnyJourney } from "@/engine"
import type { Code, Problem } from "@/data"

export interface Rung {
  key: string
  name: string
  cost: string // "O(n) time · O(1) space"
  idea: string
  whyNow?: string // absent on the first rung, which has nothing before it
  code: Code
}

export interface Ladder {
  rungs: Rung[]
  /** a started, unfinished journey hides the rungs not yet earned */
  capped: boolean
  /** rungs the ledger is holding back */
  hidden: number
}

const costOf = (c: { time: string; space: string }) =>
  `${c.time} time · ${c.space} space`

// A journey's code tabs are arrays of lines, one per pseudocode row.
const joinTabs = (code: {
  pseudo: string[]
  python?: string[]
  java?: string[]
  cpp?: string[]
}): Code => ({
  python: (code.python ?? code.pseudo).join("\n"),
  java: code.java?.join("\n"),
  cpp: code.cpp?.join("\n"),
})

function fromJourney(journey: AnyJourney, unlocked: number): Ladder {
  // the story act has no algorithm; the challenge and the recap are not rungs
  const acts = journey.acts.filter(
    (a) => a.chart !== false && a.key !== journey.acts[0].key
  )
  const finished = unlocked >= journey.acts.length
  const earned = acts.filter((a) => journey.acts.indexOf(a) < unlocked)
  const shown = finished || earned.length === 0 ? acts : earned
  return {
    rungs: shown.map((a, i) => ({
      key: a.key,
      name: a.name,
      cost: a.complexity,
      idea: a.idea,
      // the first act's insight is the need for any algorithm at all, not a
      // weakness in a previous rung
      whyNow: i === 0 ? undefined : a.insight || undefined,
      code: joinTabs(a.code),
    })),
    capped: shown.length < acts.length,
    hidden: acts.length - shown.length,
  }
}

function fromProblem(problem: Problem): Ladder {
  const rungs: Rung[] = (problem.alternatives ?? []).map((a) => ({
    key: a.name,
    name: a.name,
    cost: costOf(a.complexity),
    idea: a.summary,
    whyNow: a.whyNow,
    code: a,
  }))
  rungs.push({
    key: "optimal",
    name: rungs.length ? "The one to remember" : "The approach",
    cost: costOf(problem.complexity),
    idea: problem.approach,
    whyNow: problem.whyNow,
    code: problem,
  })
  // whatever the data says, the first rung has nothing before it
  if (rungs[0]) rungs[0] = { ...rungs[0], whyNow: undefined }
  return { rungs, capped: false, hidden: 0 }
}

export function ladderOf(
  problem: Problem,
  journey: AnyJourney | undefined,
  unlocked: number
): Ladder {
  return journey ? fromJourney(journey, unlocked) : fromProblem(problem)
}

export const leetcodeUrl = (slug: string) =>
  `https://leetcode.com/problems/${slug}/`
