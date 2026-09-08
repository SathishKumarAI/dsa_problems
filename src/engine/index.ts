// Journey registry. Owns the list of journeys and lookups by slug/problem id.
// Adding a journey = one file in ./journeys + one line here.

import { containerWater } from "./journeys/container-water.ts"
import { singleNumber } from "./journeys/single-number.ts"
import { sortedPairSum } from "./journeys/sorted-pair-sum.ts"
import { threeSum } from "./journeys/three-sum.ts"
import { twoSum } from "./journeys/two-sum.ts"
import { bestTrade } from "../data/journeys/best-trade.ts"
import { classicBinarySearch } from "../data/journeys/classic-binary-search.ts"
import { containsDuplicate } from "../data/journeys/contains-duplicate.ts"
import { dailyWarmer } from "../data/journeys/daily-warmer.ts"
import { houseRobber } from "../data/journeys/house-robber.ts"
import { longestUniqueSubstring } from "../data/journeys/longest-unique-substring.ts"
import { sortedSquares } from "../data/journeys/sorted-squares.ts"
import { moveZeroes } from "../data/journeys/move-zeroes.ts"
import { productExceptSelf } from "../data/journeys/product-except-self.ts"
import { maxSubarray } from "../data/journeys/max-subarray.ts"
import type { AnyJourney } from "./types.ts"

export const JOURNEYS: AnyJourney[] = [
  twoSum as unknown as AnyJourney,
  singleNumber as unknown as AnyJourney,
  threeSum as unknown as AnyJourney,
  sortedPairSum as unknown as AnyJourney,
  containerWater as unknown as AnyJourney,
  maxSubarray as unknown as AnyJourney,
  longestUniqueSubstring as unknown as AnyJourney,
  containsDuplicate as unknown as AnyJourney,
  classicBinarySearch as unknown as AnyJourney,
  bestTrade as unknown as AnyJourney,
  houseRobber as unknown as AnyJourney,
  dailyWarmer as unknown as AnyJourney,
  productExceptSelf as unknown as AnyJourney,
  sortedSquares as unknown as AnyJourney,
  moveZeroes as unknown as AnyJourney,
]

export const journeyBySlug = (slug: string) =>
  JOURNEYS.find((j) => j.slug === slug)
export const journeyForProblem = (problemId: string) =>
  JOURNEYS.find((j) => j.problemId === problemId)

// Frames are drained up front: step-back and scrubbing become array indexing.
export function drain<T>(gen: Generator<T, void, unknown>, cap = 10000): T[] {
  const out: T[] = []
  for (const f of gen) {
    out.push(f)
    if (out.length >= cap) throw new Error(`generator exceeded ${cap} frames`)
  }
  return out
}

export * from "./types.ts"
