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
import { asteroidCollision } from "../data/journeys/asteroid-collision.ts"
import { lastStoneWeight } from "../data/journeys/last-stone-weight.ts"
import { rotatedSearch } from "../data/journeys/rotated-search.ts"
import { charReplacement } from "../data/journeys/char-replacement.ts"
import { search2dMatrix } from "../data/journeys/search-2d-matrix.ts"
import { validPalindrome } from "../data/journeys/valid-palindrome.ts"
import { validParenthesisString } from "../data/journeys/valid-parenthesis-string.ts"
import { coinChangeMin } from "../data/journeys/coin-change-min.ts"
import { kthLargestElement } from "../data/journeys/kth-largest-element.ts"
import { islandCountJourney } from "../data/journeys/island-count.ts"
import { isSubsequence } from "../data/journeys/is-subsequence.ts"
import { longestCommonPrefix } from "../data/journeys/longest-common-prefix.ts"
import { majorityElement } from "../data/journeys/majority-element.ts"
import { largestRectangle } from "../data/journeys/largest-rectangle.ts"
import { trapRainWater } from "../data/journeys/trap-rain-water.ts"
import { windowMaximum } from "../data/journeys/window-maximum.ts"
import { longestIncreasingRun } from "../data/journeys/longest-increasing-run.ts"
import { rotatedMinimum } from "../data/journeys/rotated-minimum.ts"
import { findPeakElement } from "../data/journeys/find-peak-element.ts"
import { searchInsertPosition } from "../data/journeys/search-insert-position.ts"
import { sortColors } from "../data/journeys/sort-colors.ts"
import { decodeString } from "../data/journeys/decode-string.ts"
import { minCostStairs } from "../data/journeys/min-cost-stairs.ts"
import { removeKDigits } from "../data/journeys/remove-k-digits.ts"
import { reverseList } from "../data/journeys/reverse-list.ts"
import { firstLastPosition } from "../data/journeys/first-last-position.ts"
import { longestConsecutiveRun } from "../data/journeys/longest-consecutive-run.ts"
import { subarraySumK } from "../data/journeys/subarray-sum-k.ts"
import { houseRobber } from "../data/journeys/house-robber.ts"
import { longestUniqueSubstring } from "../data/journeys/longest-unique-substring.ts"
import { sortedSquares } from "../data/journeys/sorted-squares.ts"
import { moveZeroes } from "../data/journeys/move-zeroes.ts"
import { productExceptSelf } from "../data/journeys/product-except-self.ts"
import { maxOnesAfterFlips } from "../data/journeys/max-ones-after-flips.ts"
import { minSubarraySum } from "../data/journeys/min-subarray-sum.ts"
import { removeDuplicatesSorted } from "../data/journeys/remove-duplicates-sorted.ts"
import { singleInSorted } from "../data/journeys/single-in-sorted.ts"
import { cycleDetect } from "../data/journeys/cycle-detect.ts"
import { kthLargestStream } from "../data/journeys/kth-largest-stream.ts"
import { levelOrder } from "../data/journeys/level-order.ts"
import { maxIslandArea } from "../data/journeys/max-island-area.ts"
import { rottingFruit } from "../data/journeys/rotting-fruit.ts"
import { wordSearch } from "../data/journeys/word-search.ts"
import { countProvinces } from "../data/journeys/count-provinces.ts"
import { longestCommonSubsequence } from "../data/journeys/longest-common-subsequence.ts"
import { partitionEqualSubset } from "../data/journeys/partition-equal-subset.ts"
import { balancedBrackets } from "../data/journeys/balanced-brackets.ts"
import { kokoBananas } from "../data/journeys/koko-bananas.ts"
import { topKFrequent } from "../data/journeys/top-k-frequent.ts"
import { taskCooldown } from "../data/journeys/task-cooldown.ts"
import { courseOrderJourney } from "../data/journeys/course-order.ts"
import { networkDelayJourney } from "../data/journeys/network-delay.ts"
import { kClosestPoints } from "../data/journeys/k-closest-points.ts"
import { generateParens } from "../data/journeys/generate-parens.ts"
import { minCoverSubstring } from "../data/journeys/min-cover-substring.ts"
import { maxDepth } from "../data/journeys/max-depth.ts"
import { mergeTwoSorted } from "../data/journeys/merge-two-sorted.ts"
import { validateBst } from "../data/journeys/validate-bst.ts"
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
  subarraySumK as unknown as AnyJourney,
  longestConsecutiveRun as unknown as AnyJourney,
  firstLastPosition as unknown as AnyJourney,
  rotatedMinimum as unknown as AnyJourney,
  coinChangeMin as unknown as AnyJourney,
  longestIncreasingRun as unknown as AnyJourney,
  trapRainWater as unknown as AnyJourney,
  largestRectangle as unknown as AnyJourney,
  kthLargestElement as unknown as AnyJourney,
  windowMaximum as unknown as AnyJourney,
  searchInsertPosition as unknown as AnyJourney,
  findPeakElement as unknown as AnyJourney,
  sortColors as unknown as AnyJourney,
  asteroidCollision as unknown as AnyJourney,
  lastStoneWeight as unknown as AnyJourney,
  rotatedSearch as unknown as AnyJourney,
  validPalindrome as unknown as AnyJourney,
  validParenthesisString as unknown as AnyJourney,
  search2dMatrix as unknown as AnyJourney,
  charReplacement as unknown as AnyJourney,
  majorityElement as unknown as AnyJourney,
  longestCommonPrefix as unknown as AnyJourney,
  isSubsequence as unknown as AnyJourney,
  removeDuplicatesSorted as unknown as AnyJourney,
  maxOnesAfterFlips as unknown as AnyJourney,
  minSubarraySum as unknown as AnyJourney,
  singleInSorted as unknown as AnyJourney,
  decodeString as unknown as AnyJourney,
  removeKDigits as unknown as AnyJourney,
  minCostStairs as unknown as AnyJourney,
  islandCountJourney as unknown as AnyJourney,
  cycleDetect as unknown as AnyJourney,
  kthLargestStream as unknown as AnyJourney,
  levelOrder as unknown as AnyJourney,
  maxIslandArea as unknown as AnyJourney,
  rottingFruit as unknown as AnyJourney,
  wordSearch as unknown as AnyJourney,
  countProvinces as unknown as AnyJourney,
  longestCommonSubsequence as unknown as AnyJourney,
  partitionEqualSubset as unknown as AnyJourney,
  balancedBrackets as unknown as AnyJourney,
  kokoBananas as unknown as AnyJourney,
  topKFrequent as unknown as AnyJourney,
  taskCooldown as unknown as AnyJourney,
  courseOrderJourney as unknown as AnyJourney,
  networkDelayJourney as unknown as AnyJourney,
  kClosestPoints as unknown as AnyJourney,
  generateParens as unknown as AnyJourney,
  minCoverSubstring as unknown as AnyJourney,
  maxDepth as unknown as AnyJourney,
  mergeTwoSorted as unknown as AnyJourney,
  validateBst as unknown as AnyJourney,
  reverseList as unknown as AnyJourney,
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
