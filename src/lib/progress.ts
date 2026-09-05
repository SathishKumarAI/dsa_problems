// Solved-problem tracking ("solved", a JSON array of ids) and the ONE way the
// app expresses journey progress. Two notations for the same number is how a
// learner ends up unsure whether they mean the same thing (UX audit U5).
import { useMemo } from "react"
import { K, updateStored, useStored } from "./store"

export function toggleSolved(id: string) {
  updateStored<string[]>(K.solved, [], (ids) =>
    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  )
}

export function useSolved(): Set<string> {
  const ids = useStored<string[]>(K.solved, [])
  return useMemo(() => new Set(ids), [ids])
}

// ---------- journey progress, said once ----------

export interface Earned {
  earned: number // acts left behind — act 1 is the start, not an achievement
  total: number // acts that can be earned
  done: boolean
  /** "0/6" — the badge form */
  short: string
  /** "0 of 6 acts earned" — the spoken form, for tooltips and labels */
  long: string
  pct: number
}

export function earnedOf(unlocked: number, acts: number): Earned {
  const total = Math.max(1, acts - 1)
  const earned = Math.min(Math.max(unlocked - 1, 0), total)
  const done = earned >= total
  return {
    earned,
    total,
    done,
    short: `${earned}/${total}`,
    long: done
      ? `all ${total} acts earned`
      : `${earned} of ${total} acts earned`,
    pct: (earned / total) * 100,
  }
}

export function useEarned(slug: string, acts: number): Earned {
  return earnedOf(useStored<number>(K.unlocked(slug), 1), acts)
}
