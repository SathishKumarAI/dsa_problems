// Correctness gate for derived journeys. A hand-written journey gets a
// bespoke test (engine/journeys.test.ts); a derived one gets a row here, and
// the row says the same thing every time: every coding rung must land on the
// answer a reference implementation gives, on random rows, not just on the
// presets an author happened to look at.
//
// Adding a derived journey = one row in TABLE.

import assert from "node:assert/strict"
import { test } from "node:test"
import { drain } from "../../engine/index.ts"
import type { AnyJourney, BaseFrame } from "../../engine/types.ts"
import { longestUnique, longestUniqueSubstring } from "./longest-unique-substring.ts"
import { maxSubarray } from "./max-subarray.ts"

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
  reference: (nums: unknown[]) => unknown
  // random rows to test on beyond the presets; `rand(n)` is a seeded 0..n-1
  row: (rand: (n: number) => number) => unknown[]
}[] = [
  {
    journey: maxSubarray as unknown as AnyJourney,
    skip: ["story"],
    reference: (nums) => kadaneReference(nums as number[]),
    row: (rand) => Array.from({ length: 1 + rand(9) }, () => rand(41) - 20),
  },
  {
    journey: longestUniqueSubstring as unknown as AnyJourney,
    skip: ["story"],
    reference: (nums) => longestUnique(nums as string[]).best,
    // a four-letter alphabet on purpose: repeats have to be common enough that
    // the shrink and the stale-memory guard both fire on the random rows
    row: (rand) =>
      Array.from({ length: rand(10) }, () => "ab c"[rand(4)]),
  },
]

for (const { journey, skip, reference, row } of TABLE)
  test(`${journey.slug}: every rung agrees with the reference, on the presets and on random rows`, () => {
    let seed = 11
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed % n
    }
    const rows = [
      ...Object.values(journey.presets).map((p) => p.make().nums),
      ...Array.from({ length: 200 }, () => row(rand)),
    ]
    const acts = journey.acts.filter((a) => !skip.includes(a.key))
    assert.ok(acts.length >= 2, "a derived journey needs a ladder, not one rung")
    for (const nums of rows) {
      const want = reference(nums)
      for (const a of acts)
        assert.deepEqual(
          lastAnswer(drain(a.run({ nums } as never, {}))),
          want,
          `${a.key} on [${nums}]`
        )
    }
  })
