// Which approaches the problem page's walkthrough may OFFER, and which one it
// opens on.
//
// A `.ts` and not part of `mini-player.tsx` for two reasons, both of which this
// repo has hit before: a component module that also exports a plain function
// breaks fast refresh for the whole module (the rule `lib/ladder.ts` was split
// out for), and Node strips types from `.ts` but cannot load `.tsx` at all — so
// a rule that lives in a component cannot have a node test, and this rule is
// one the build must fail on.
//
// The rule it owns is a DISCLOSURE rule. The stepper can move between
// approaches, and an approach's name is exactly what progressive disclosure
// withholds: offering "Ask a set" as the next step to a learner still on the
// brute force hands them the answer in a button label.
import type { AnyJourney } from "@/engine"

export function watchable(journey: AnyJourney, unlocked: number) {
  // never the story act (no algorithm), never the challenge or the recap
  const shown = journey.acts.filter(
    (a) => a.chart !== false && a.key !== journey.acts[0].key
  )
  const finished = unlocked >= journey.acts.length
  const earned = shown.filter((a) => journey.acts.indexOf(a) < unlocked)
  const acts = finished || earned.length === 0 ? shown : earned
  return {
    acts,
    /**
     * The FIRST approach on offer — the foot of the ladder, not the top.
     *
     * This player used to open on the best act it was allowed to show, which was
     * right while it could only show one. Now that it steps, opening at the top
     * left `next approach` disabled on arrival and made `previous` the only
     * working control — the climb, backwards. It opens at the foot and walks up,
     * in the same order the ladder reads and for the same reason: each rung is
     * an answer to the one below it, and you cannot see that if you start at the
     * end. Mid-journey this is the first EARNED act, so the cap is untouched.
     */
    opens: acts[0],
    capped: !finished && earned.length > 0 && earned.length < shown.length,
  }
}
