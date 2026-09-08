// Correctness gate for derived journeys. A hand-written journey gets a
// bespoke test (engine/journeys.test.ts); a derived one gets a row here, and
// the row says the same thing every time: every coding rung must land on the
// answer a reference implementation gives, on random inputs, not just on the
// presets an author happened to look at.
//
// `input` builds a whole data object, not just a row, because a journey may
// carry scalars beside it (a target). `reference` is handed the same object.
//
// Adding a derived journey = one row in TABLE.

import assert from "node:assert/strict"
import { test } from "node:test"
import { drain } from "../../engine/index.ts"
import type { AnyJourney, BaseFrame } from "../../engine/types.ts"
import { bestProfit, bestTrade } from "./best-trade.ts"
import { classicBinarySearch, indexOfTarget } from "./classic-binary-search.ts"
import { containsDuplicate, firstRepeat } from "./contains-duplicate.ts"
import { dailyWarmer, warmerDays } from "./daily-warmer.ts"
import { bestTake, houseRobber } from "./house-robber.ts"
import {
  longestUnique,
  longestUniqueSubstring,
} from "./longest-unique-substring.ts"
import { maxSubarray } from "./max-subarray.ts"
import { moveZeroes, zeroesLast } from "./move-zeroes.ts"
import {
  productExceptSelf,
  productsExceptSelf,
} from "./product-except-self.ts"
import { sortedSquares, squaresSorted } from "./sorted-squares.ts"

type Row = { nums: unknown[]; [k: string]: unknown }

const lastAnswer = (frames: BaseFrame[]) =>
  (frames.findLast((f) => "answer" in f && f.answer !== undefined) as
    | { answer?: unknown }
    | undefined)?.answer

const kadaneReference = (nums: number[]) => {
  let best = nums[0]
  for (let i = 0; i < nums.length; i++) {
    let total = 0
    for (let j = i; j < nums.length; j++) {
      total += nums[j]
      if (total > best) best = total
    }
  }
  return best
}

const TABLE: {
  journey: AnyJourney
  skip: string[] // acts that narrate rather than solve
  reference: (d: Row) => unknown
  // a random input to test on beyond the presets; `rand(n)` is a seeded 0..n-1
  input: (rand: (n: number) => number) => Row
}[] = [
  {
    journey: maxSubarray as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => kadaneReference(d.nums as number[]),
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(41) - 20),
    }),
  },
  {
    journey: longestUniqueSubstring as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => longestUnique(d.nums as string[]).best,
    // a four-letter alphabet on purpose: repeats have to be common enough that
    // the shrink and the stale-memory guard both fire on the random rows
    input: (rand) => ({
      nums: Array.from({ length: rand(10) }, () => "ab c"[rand(4)]),
    }),
  },
  {
    journey: containsDuplicate as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => firstRepeat(d.nums as number[]).hit,
    // a tiny value range on purpose: repeats have to be common in the random
    // rows, or every one of them tests only the false branch
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(8) }, () => rand(6)),
    }),
  },
  {
    journey: classicBinarySearch as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => indexOfTarget(d.nums as number[], d.target as number),
    // strictly ascending, as classify demands, and a target that is present
    // about half the time — the -1 path is the half that breaks
    input: (rand) => {
      const nums: number[] = []
      let v = -20
      for (let i = 0; i < 1 + rand(9); i++) nums.push((v += 1 + rand(4)))
      return {
        nums,
        target: rand(2) ? nums[rand(nums.length)] : rand(60) - 25,
      }
    },
  },
  {
    journey: bestTrade as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => bestProfit(d.nums as number[]).best,
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(15)),
    }),
  },
  {
    journey: houseRobber as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => bestTake(d.nums as number[]).best,
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(12)),
    }),
  },
  {
    journey: dailyWarmer as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => warmerDays(d.nums as number[]),
    // a narrow temperature range so equal neighbours and long cold runs both
    // turn up often in the random rows
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => 30 + rand(6)),
    }),
  },
  {
    journey: productExceptSelf as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => productsExceptSelf(d.nums as number[]),
    // zeros have to be common: they are the whole reason division is banned
    input: (rand) => ({
      nums: Array.from({ length: 2 + rand(7) }, () => rand(9) - 4),
    }),
  },
  {
    journey: sortedSquares as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => squaresSorted(d.nums as number[]),
    // non-decreasing, as classify demands, and straddling zero often enough
    // that the fold — and the equal-magnitude tie — actually happen
    input: (rand) => {
      const nums: number[] = []
      let v = -6
      for (let i = 0; i < 1 + rand(9); i++) nums.push((v += rand(4)))
      return { nums }
    },
  },
  {
    journey: moveZeroes as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => zeroesLast(d.nums as number[]),
    // a third of the values are zero on average, so runs of them — and rows
    // that already end in one — turn up without being asked for
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => (rand(3) ? rand(9) : 0)),
    }),
  },
]

for (const { journey, skip, reference, input } of TABLE)
  test(`${journey.slug}: every rung agrees with the reference, on the presets and on random input`, () => {
    let seed = 11
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed % n
    }
    const cases: Row[] = [
      ...Object.values(journey.presets).map((p) => p.make() as Row),
      ...Array.from({ length: 200 }, () => input(rand)),
    ]
    const acts = journey.acts.filter((a) => !skip.includes(a.key))
    assert.ok(acts.length >= 2, "a derived journey needs a ladder, not one rung")
    for (const d of cases) {
      // classify is the journey's own statement of what it can honestly run;
      // an input it rejects is out of scope, not a disagreement
      if (!journey.classify(d as never).ok) continue
      const want = reference(d)
      for (const a of acts)
        assert.deepEqual(
          lastAnswer(drain(a.run(d as never, {}))),
          want,
          `${a.key} on ${JSON.stringify(d)}`
        )
    }
  })
