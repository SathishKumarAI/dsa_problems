// The one place that answers: "may the learner see this pattern's name yet?"
//
// The rule the product rests on is *no unearned name*, and the practice-set
// catalogue is the place it leaks: "Two Pointers" sits in the sidebar while
// Two Sum is midway through teaching that exact idea without naming it.
//
// Masking everything would ruin the catalogue for someone who never opened a
// journey, so the mask is tied to an **active promise**: a pattern is hidden
// only while a journey that reveals it has been started and not finished. Not
// started = nothing was promised. Finished = you earned the name. And one
// click ("show me anyway", stored in `spoilers`) turns the whole thing off
// forever, because a senior drilling problems should not have to play along.

// The MANIFEST, not the registry, and this one import was worth 568 KB.
//
// The mask needs three things per journey — its slug, how many acts it has, and
// which patterns it reveals — and it needs them for ALL 93 before the app knows
// which route it is on. Reading them off `JOURNEYS` pulled every act, every
// frame generator, every preset and every line of journey prose into the first
// chunk to learn a number. `JOURNEY_CARDS` carries the number.
import { JOURNEY_CARDS } from "@/engine/manifest"
import { K, getStored, setStored, useStoreVersion } from "@/lib/store"

export interface Mask {
  /** pattern ids the learner has not earned the name of yet */
  hidden: Set<string>
  /** pattern id → the journey title that will reveal it */
  by: Map<string, string>
  /** true when the learner has opted out of masking entirely */
  off: boolean
}

export const MASKED_NAME = "· · ·"
export const MASKED_GLYPH = "?"

function compute(off: boolean, unlocked: (slug: string) => number): Mask {
  const hidden = new Set<string>()
  const by = new Map<string, string>()
  if (off) return { hidden, by, off }
  for (const j of JOURNEY_CARDS) {
    const seen = unlocked(j.slug)
    const started = seen > 1
    const finished = seen >= j.acts.length
    if (!started || finished) continue
    for (const p of j.reveals) {
      hidden.add(p)
      if (!by.has(p)) by.set(p, j.title)
    }
  }
  return { hidden, by, off }
}

/** React binding: recomputes on any store write (the mask depends on one key
 *  per journey plus the opt-out, which is more keys than a hook may subscribe
 *  to in a loop) */
export function usePatternMask(): Mask {
  useStoreVersion()
  return patternMask()
}

/** non-React callers (tests, one-off checks) */
export const patternMask = (): Mask =>
  compute(getStored<boolean>(K.spoilers, false), (slug) =>
    getStored<number>(K.unlocked(slug), 1)
  )

export const showSpoilers = () => setStored(K.spoilers, true)
