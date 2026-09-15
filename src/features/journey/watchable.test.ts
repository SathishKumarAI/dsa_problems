// The check for `watchable` — which approaches the problem page's walkthrough
// is allowed to OFFER.
//
// This is a disclosure test, not a layout one. The stepper added a way to move
// between approaches, and an approach's NAME is exactly what progressive
// disclosure withholds: offering "Ask a set" as the next step to a learner who
// is still on the brute force hands them the answer in a tooltip. So the list
// is asserted against the ledger for every journey in the app, at every
// position a ledger can hold.
import assert from "node:assert/strict"
import { test } from "node:test"
import { JOURNEYS } from "../../engine/index.ts"
import { watchable } from "./watchable.ts"

test("the walkthrough never offers an approach the ledger has not earned", () => {
  for (const journey of JOURNEYS) {
    const algo = journey.acts.filter(
      (a) => a.chart !== false && a.key !== journey.acts[0].key
    )
    for (let unlocked = 1; unlocked <= journey.acts.length; unlocked++) {
      const { acts, opens, capped } = watchable(journey, unlocked)
      const where = `${journey.slug} @ unlocked=${unlocked}`

      // never the story act, the challenge or the recap
      for (const a of acts)
        assert.ok(
          algo.some((x) => x.key === a.key),
          `${where}: offers "${a.key}", which is not an algorithm act`
        )

      const earned = algo.filter((a) => journey.acts.indexOf(a) < unlocked)
      const finished = unlocked >= journey.acts.length
      if (!finished && earned.length > 0) {
        // mid-journey: exactly the earned ones, and not one more
        assert.deepEqual(
          acts.map((a) => a.key),
          earned.map((a) => a.key),
          `${where}: the offered list is not the earned list`
        )
      } else {
        // finished, or never started: the whole ladder
        assert.deepEqual(
          acts.map((a) => a.key),
          algo.map((a) => a.key),
          `${where}: expected every algorithm act`
        )
      }

      // build order, and the default is the FOOT of the ladder: the player
      // steps UP from there, which is the order the rungs argue in
      assert.equal(opens.key, acts[0].key, `${where}: wrong default`)
      assert.equal(
        capped,
        !finished && earned.length > 0 && earned.length < algo.length,
        `${where}: capped disagrees with the ledger`
      )
    }
  }
})

test("a journey with one algorithm act offers exactly one, and cannot step", () => {
  const single = JOURNEYS.filter(
    (j) =>
      j.acts.filter((a) => a.chart !== false && a.key !== j.acts[0].key)
        .length === 1
  )
  for (const j of single) {
    const { acts } = watchable(j, j.acts.length)
    assert.equal(acts.length, 1, `${j.slug}: expected a single approach`)
  }
})
