// The approach ladder: every way into a problem, in build order, each rung
// carrying the weakness in the one before it (docs/PROBLEMS.md §P1).
//
// One builder, two sources, so the reasoning is never written twice (the B1
// rule). A problem WITH a journey draws its rungs from the journey's acts —
// `insight` is already "the weakness the previous act had" — and is capped by
// the ledger exactly as the embedded walkthrough is. A problem without one
// draws them from `alternatives` (in build order) plus the optimal at the top.
// NOT necessarily a monotone climb — a rung is sometimes a generalisation the
// next one argues against. The page says "each answering the one before it"
// rather than "worst to best" for that reason (V8).
//
// Owns the shape and the picking. Owns no markup: problem-detail.tsx renders it.

import type { AnyJourney } from "@/engine"
import type { Code, Problem, Solution } from "@/data"

export interface Rung {
  key: string
  name: string
  cost: string // "O(n) time · O(1) space"
  /** how that cost was COUNTED — `Solution.costWhy` / `Problem.costWhy`. A
   *  bound a reader cannot reproduce is a label, not a skill. */
  costWhy?: string
  idea: string
  whyNow?: string // absent on the first rung, which has nothing before it
  code: Code
  /**
   * This rung is taught by the teaching document but has no act in the journey
   * — a baseline the animation skips, or a variant it argues against. The page
   * marks it, because a learner should know which rungs the journey walked them
   * through and which ones are being handed over as reading (B79).
   */
  aside?: boolean
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

/** a rung's key, falling back to a slug of its name (see Solution.key) */
export const rungKey = (a: { key?: string; name: string }) =>
  a.key ??
  a.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const asRung = (a: Solution): Rung => ({
  key: rungKey(a),
  name: a.name,
  cost: costOf(a.complexity),
  costWhy: a.costWhy,
  idea: a.summary,
  whyNow: a.whyNow,
  code: a,
  aside: true,
})

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

/**
 * Move a rung that says where it goes.
 *
 * `alternatives` is worst -> best, and so are a journey's acts, but the two
 * lists interleave and neither one alone can say how. Both builders below place
 * extras by a rule that has exactly two outcomes — the foot, or the top — and
 * both are right for what they were written for: a baseline, and a variant
 * argued against the optimal. A rung the document teaches BETWEEN two others is
 * neither.
 *
 * Two of them found this. sorted-squares reaches its answer through "split at
 * zero and merge two runs", which the rule rendered ABOVE the answer — the one
 * ordering the page promises it never shows (R1). tree-diameter has no journey
 * at all, and its explicit-stack rung landed under the optimal, which silently
 * repointed `whyNow`: the sentence explaining why the one-pass fold beats a
 * cached map was suddenly sitting above a rung about the call stack.
 *
 * Only a rung already on the ladder can be named, so a typo relocates nothing
 * rather than dropping a rung — and `problems.test.ts` fails the build on one.
 */
function place(rungs: Rung[], alts: Solution[]): Rung[] {
  for (const alt of alts) {
    if (!alt.after) continue
    const from = rungs.findIndex((r) => r.key === rungKey(alt))
    const anchor = rungs.findIndex((r) => r.key === alt.after)
    if (from === -1 || anchor === -1 || from === anchor + 1) continue
    const [moved] = rungs.splice(from, 1)
    rungs.splice(rungs.findIndex((r) => r.key === alt.after) + 1, 0, moved)
  }
  return rungs
}

function fromJourney(
  problem: Problem,
  journey: AnyJourney,
  unlocked: number
): Ladder {
  // the story act has no algorithm; the challenge and the recap are not rungs
  const acts = journey.acts.filter(
    (a) => a.chart !== false && a.key !== journey.acts[0].key
  )
  const finished = unlocked >= journey.acts.length
  const earned = acts.filter((a) => journey.acts.indexOf(a) < unlocked)
  const shown = finished || earned.length === 0 ? acts : earned
  const capped = shown.length < acts.length

  // An act and a keyed alternative with the SAME key are one rung: the act
  // carries the animation and the taught prose, the alternative carries the
  // ladder metadata an act has no field for. The first algorithm act writes no
  // `insight` — it is the need for any algorithm at all, not a weakness in a
  // rung below — but once a promoted baseline sits underneath it, it HAS a rung
  // below, and the alternative's `whyNow` is the sentence for it.
  const byKey = new Map(
    (problem.alternatives ?? [])
      .filter((a) => a.key)
      .map((a) => [rungKey(a), a] as const)
  )
  const taught: Rung[] = shown.map((a, i) => ({
    key: a.key,
    name: a.name,
    cost: a.complexity,
    // an act carries no counting argument of its own; the matching
    // alternative is where it is written, exactly as `whyNow` is
    costWhy: byKey.get(a.key)?.costWhy,
    idea: a.idea,
    whyNow:
      (i === 0 ? undefined : a.insight || undefined) ??
      byKey.get(a.key)?.whyNow,
    code: joinTabs(a.code),
  }))

  // The record's own `complexity` describes the TOP rung, so its `costWhy` is
  // that rung's counting argument and there is no alternative to hang it on —
  // the optimal is the problem itself (see `fromProblem`, where it becomes the
  // rung named "The one to remember"). Only when the ladder is whole: on a
  // capped one the last rung shown is a step on the way, not the destination,
  // and giving it the optimal's count would be a lie about a rung the learner
  // has not earned.
  if (!capped && taught.length) {
    const top = taught[taught.length - 1]
    if (!top.costWhy) top.costWhy = problem.costWhy
  }

  // B79. A journeyed problem's ladder used to be the acts and nothing else, so
  // an approach the teaching document taught but the animation skipped was
  // unreachable from the page — measured on 45 of 82 problems. Those rungs live
  // in `alternatives` now, keyed; an alternative whose key matches an act is the
  // SAME rung and the act wins (it carries the animation and the taught prose).
  //
  // Position, not append: `alternatives` is worst → best, so an extra sitting
  // BEFORE the first act-matching alternative is a baseline and belongs at the
  // foot of the ladder, while one after it is a variant argued against the
  // optimal and belongs at the top. Appending everything would have put an
  // O(n²) brute force above Floyd's, which is the one ordering the page
  // promises it never shows.
  //
  // Nothing extra while the ladder is CAPPED: a started, unfinished journey has
  // not earned these either, and leaking one is the same failure as leaking an
  // act (`disclosure.ts`, and the arc's cap on problem-detail.tsx).
  // EXPLICIT keys only. The first cut of this merged every alternative, with a
  // slug of the name as the key, and `pair-sum` failed the gate immediately:
  // its act is `brute` and its alternative is "Brute Force", which slugs to
  // `brute-force`, so the merge read one rung as two and stacked a duplicate
  // brute force under the ladder. A name is not an id. So an alternative joins
  // a journeyed ladder only once someone has written `key:` on it — which is
  // also what makes this a migration a problem opts into rather than one that
  // happens to 93 problems at once.
  const alts = (problem.alternatives ?? []).filter((a) => a.key)
  const actKeys = new Set(acts.map((a) => a.key))
  const pivot = alts.findIndex((a) => actKeys.has(rungKey(a)))
  const extras = capped
    ? { before: [] as Rung[], after: [] as Rung[] }
    : pivot === -1
      ? { before: alts.map(asRung), after: [] as Rung[] }
      : {
          before: alts.slice(0, pivot).map(asRung),
          after: alts
            .slice(pivot + 1)
            .filter((a) => !actKeys.has(rungKey(a)))
            .map(asRung),
        }

  const rungs = place([...extras.before, ...taught, ...extras.after], alts)
  return { rungs, capped, hidden: acts.length - shown.length }
}

function fromProblem(problem: Problem): Ladder {
  const rungs: Rung[] = (problem.alternatives ?? []).map((a) => ({
    ...asRung(a),
    // nothing is an aside here: with no journey, `alternatives` IS the ladder
    aside: false,
  }))
  rungs.push({
    key: "optimal",
    name: rungs.length ? "The one to remember" : "The approach",
    cost: costOf(problem.complexity),
    costWhy: problem.costWhy,
    idea: problem.approach,
    whyNow: problem.whyNow,
    code: problem,
  })
  // a rung that says where it goes is moved there, `optimal` included as an
  // anchor — tree-diameter teaches its explicit-stack version AFTER the answer
  const placed = place(rungs, problem.alternatives ?? [])
  // whatever the data says, the first rung has nothing before it
  if (placed[0]) placed[0] = { ...placed[0], whyNow: undefined }
  return { rungs: placed, capped: false, hidden: 0 }
}

export function ladderOf(
  problem: Problem,
  journey: AnyJourney | undefined,
  unlocked: number
): Ladder {
  return journey
    ? fromJourney(problem, journey, unlocked)
    : fromProblem(problem)
}

export const leetcodeUrl = (slug: string) =>
  `https://leetcode.com/problems/${slug}/`

// ── the comparator's two keys, which live in the URL ────────────────────────
//
// Here rather than in `approach-compare.tsx` because they are ladder logic, not
// markup — and because a component file that also exports a plain function
// breaks fast refresh for the whole module (eslint react-refresh, measured).

/** the pair a `?compare=` value names, or undefined when it names neither */
export function parseCompare(
  raw: string | null,
  rungs: Rung[]
): [Rung, Rung] | undefined {
  if (!raw) return undefined
  const [a, b] = raw.split(",").map((s) => s.trim())
  const left = rungs.find((r) => r.key === a)
  const right = rungs.find((r) => r.key === b)
  return left && right && left !== right ? [left, right] : undefined
}

export const compareHref = (a: Rung, b: Rung) => `${a.key},${b.key}`
