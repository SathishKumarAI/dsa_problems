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
import { asteroidCollision, survivors } from "./asteroid-collision.ts"
import { bestProfit, bestTrade } from "./best-trade.ts"
import { charReplacement, longestAfterRewrites } from "./char-replacement.ts"
import { classicBinarySearch, indexOfTarget } from "./classic-binary-search.ts"
import { coinChangeMin, fewestCoins, greedyCoins } from "./coin-change-min.ts"
import { containsDuplicate, firstRepeat } from "./contains-duplicate.ts"
import { decoded, decodeString } from "./decode-string.ts"
import { findPeakElement, isPeak, peaks } from "./find-peak-element.ts"
import { firstLastPosition, rangeOf } from "./first-last-position.ts"
import { longestConsecutiveRun, longestRun } from "./longest-consecutive-run.ts"
import { countSubarrays, subarraySumK } from "./subarray-sum-k.ts"
import { dailyWarmer, warmerDays } from "./daily-warmer.ts"
import { bestTake, houseRobber } from "./house-robber.ts"
import {
  longestUnique,
  longestUniqueSubstring,
} from "./longest-unique-substring.ts"
import { kthLargest, kthLargestElement } from "./kth-largest-element.ts"
import { biggestRectangle, largestRectangle } from "./largest-rectangle.ts"
import {
  longestIncreasing,
  longestIncreasingRun,
} from "./longest-increasing-run.ts"
import { hiddenIn, isSubsequence } from "./is-subsequence.ts"
import { islandCount, islandCountJourney } from "./island-count.ts"
import { lastStone, lastStoneWeight } from "./last-stone-weight.ts"
import { longestCommonPrefix, sharedPrefix } from "./longest-common-prefix.ts"
import { majorityElement, majorityOf } from "./majority-element.ts"
import { longestAfterFlips, maxOnesAfterFlips } from "./max-ones-after-flips.ts"
import { cycleDetect, loops } from "./cycle-detect.ts"
import { kthLargestOf, kthLargestStream } from "./kth-largest-stream.ts"
import { levelOrder, levelValues } from "./level-order.ts"
import { biggestIsland, maxIslandArea } from "./max-island-area.ts"
import { minutesToRot, rottingFruit } from "./rotting-fruit.ts"
import { canSpell, canSpellGreedy, wordSearch } from "./word-search.ts"
import { countProvinces, provinces } from "./count-provinces.ts"
import { depthOfTree, maxDepth } from "./max-depth.ts"
import { merged, mergeTwoSorted } from "./merge-two-sorted.ts"
import { isBst, validateBst } from "./validate-bst.ts"
import { maxSubarray } from "./max-subarray.ts"
import { minSubarraySum, shortestReaching } from "./min-subarray-sum.ts"
import {
  distinctInOrder,
  removeDuplicatesSorted,
} from "./remove-duplicates-sorted.ts"
import { loneValue, singleInSorted } from "./single-in-sorted.ts"
import { cheapestClimb, minCostStairs } from "./min-cost-stairs.ts"
import { removeKDigits, smallestAfterRemoving } from "./remove-k-digits.ts"
import { reversed, reverseList } from "./reverse-list.ts"
import { rotatedMin, rotatedMinimum } from "./rotated-minimum.ts"
import { holdsTarget, search2dMatrix } from "./search-2d-matrix.ts"
import { findRotated, rotatedSearch } from "./rotated-search.ts"
import { insertAt, searchInsertPosition } from "./search-insert-position.ts"
import { colorsSorted, sortColors } from "./sort-colors.ts"
import { isPalindrome, validPalindrome } from "./valid-palindrome.ts"
import { balances, validParenthesisString } from "./valid-parenthesis-string.ts"
import { trapRainWater, waterHeld } from "./trap-rain-water.ts"
import { windowMaxima, windowMaximum } from "./window-maximum.ts"
import { moveZeroes, zeroesLast } from "./move-zeroes.ts"
import { productExceptSelf, productsExceptSelf } from "./product-except-self.ts"
import { sortedSquares, squaresSorted } from "./sorted-squares.ts"

type Row = { nums: unknown[]; [k: string]: unknown }

const lastAnswer = (frames: BaseFrame[]) =>
  (
    frames.findLast((f) => "answer" in f && f.answer !== undefined) as
      { answer?: unknown } | undefined
  )?.answer

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
  // Some problems accept several correct answers (any peak). When a journey
  // is one of those, `accept` replaces equality: every rung's answer is
  // checked for legality instead of against one another's.
  accept?: (d: Row, got: unknown) => boolean
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
  {
    journey: subarraySumK as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => countSubarrays(d.nums as number[], d.k as number),
    // a small value range around zero, so the running total revisits values
    // and stretches overlap — the two things that make this problem itself
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(8) }, () => rand(5) - 2),
      k: rand(5) - 2,
    }),
  },
  {
    journey: longestConsecutiveRun as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => longestRun(d.nums as number[]).best,
    // a narrow range so runs and duplicates both actually occur
    input: (rand) => ({
      nums: Array.from({ length: rand(10) }, () => rand(9)),
    }),
  },
  {
    journey: firstLastPosition as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => rangeOf(d.nums as number[], d.target as number),
    // non-decreasing with plenty of repeats, and a target present about half
    // the time so the -1, -1 path is exercised too
    input: (rand) => {
      const nums: number[] = []
      let v = 0
      for (let i = 0; i < rand(10); i++) nums.push((v += rand(2)))
      return {
        nums,
        target: rand(2) && nums.length ? nums[rand(nums.length)] : rand(12),
      }
    },
  },
  {
    journey: rotatedMinimum as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => rotatedMin(d.nums as number[]),
    // build it the way the problem does: a sorted run of distinct values,
    // rotated by an arbitrary amount, so classify accepts every case
    input: (rand) => {
      const nums: number[] = []
      let v = -8
      for (let i = 0; i < 1 + rand(9); i++) nums.push((v += 1 + rand(3)))
      const at = rand(nums.length)
      return { nums: [...nums.slice(at), ...nums.slice(0, at)] }
    },
  },
  {
    journey: coinChangeMin as unknown as AnyJourney,
    // the greedy rung is DELIBERATELY wrong — that is the lesson, and the
    // test below pins the exact input where it fails
    skip: ["story", "greedy"],
    reference: (d) => fewestCoins(d.nums as number[], d.amount as number),
    input: (rand) => ({
      nums: [...new Set([1 + rand(6), 1 + rand(6), 1 + rand(9)])].sort(
        (a, b) => a - b
      ),
      amount: rand(14),
    }),
  },
  {
    journey: longestIncreasingRun as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => longestIncreasing(d.nums as number[]).best,
    // short rows only: the honest rung is exponential and every path is drawn
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(8) }, () => rand(9)),
    }),
  },
  {
    journey: trapRainWater as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => waterHeld(d.nums as number[]),
    // heights from a small range so dips, plateaus and zeroes all occur
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(5)),
    }),
  },
  {
    journey: largestRectangle as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => biggestRectangle(d.nums as number[]).best,
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(8) }, () => rand(6)),
    }),
  },
  {
    journey: kthLargestElement as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => kthLargest(d.nums as number[], d.k as number),
    // a tight value range so duplicates are common, and k anywhere in range
    input: (rand) => {
      const nums = Array.from({ length: 1 + rand(8) }, () => rand(7) - 3)
      return { nums, k: 1 + rand(nums.length) }
    },
  },
  {
    journey: windowMaximum as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => windowMaxima(d.nums as number[], d.k as number),
    input: (rand) => {
      const nums = Array.from({ length: 1 + rand(9) }, () => rand(9) - 4)
      return { nums, k: 1 + rand(nums.length) }
    },
  },
  {
    journey: searchInsertPosition as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => insertAt(d.nums as number[], d.target as number),
    // ascending and distinct, with the target often outside the row entirely
    // so both ends of the answer range get exercised
    input: (rand) => {
      const nums: number[] = []
      let v = -6
      for (let i = 0; i < 1 + rand(9); i++) nums.push((v += 1 + rand(3)))
      return { nums, target: rand(26) - 10 }
    },
  },
  {
    journey: findPeakElement as unknown as AnyJourney,
    skip: ["story"],
    // ANY peak is correct, so the rungs are allowed to disagree with each
    // other — each answer is checked for legality instead
    reference: (d) => peaks(d.nums as number[]),
    accept: (d, got) => isPeak(d.nums as number[], got as number),
    input: (rand) => {
      const nums: number[] = []
      while (nums.length < 1 + rand(9)) {
        const v = rand(12)
        if (!nums.length || nums[nums.length - 1] !== v) nums.push(v)
      }
      return { nums }
    },
  },
  {
    journey: sortColors as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => colorsSorted(d.nums as number[]),
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(3)),
    }),
  },
  {
    journey: asteroidCollision as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => survivors(d.nums as number[]),
    // small magnitudes so equal-size annihilations are common, and both signs
    // frequent enough that long fights actually happen
    input: (rand) => ({
      nums: Array.from(
        { length: 2 + rand(8) },
        () => (1 + rand(4)) * (rand(2) ? 1 : -1)
      ),
    }),
  },
  {
    journey: lastStoneWeight as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => lastStone(d.nums as number[]),
    // duplicates common, so equal-weight annihilation and empty piles occur
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(8) }, () => 1 + rand(6)),
    }),
  },
  {
    journey: rotatedSearch as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => findRotated(d.nums as number[], d.target as number),
    // rotate a sorted distinct run so classify accepts it, and aim the target
    // inside the row about half the time
    input: (rand) => {
      const sorted: number[] = []
      let v = -10
      for (let i = 0; i < 1 + rand(9); i++) sorted.push((v += 1 + rand(3)))
      const at = rand(sorted.length)
      const nums = [...sorted.slice(at), ...sorted.slice(0, at)]
      return {
        nums,
        target: rand(2) ? nums[rand(nums.length)] : rand(40) - 15,
      }
    },
  },
  {
    journey: validPalindrome as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => isPalindrome(d.nums as string[]),
    // a tiny alphabet with punctuation and both cases, so skipping and folding
    // both happen, and palindromes turn up by chance rather than by design
    input: (rand) => ({
      nums: Array.from({ length: rand(9) }, () => "aAb, .1"[rand(7)]),
    }),
  },
  {
    journey: validParenthesisString as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => balances(d.nums as string[]),
    // short strings only: the honest rung branches three ways per star
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(7) }, () => "()*"[rand(3)]),
    }),
  },
  {
    journey: search2dMatrix as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => holdsTarget(d.nums as number[], d.target as number),
    // build the grid as one ascending sequence, then pick a width that divides
    // it — classify demands both
    input: (rand) => {
      const cols = 1 + rand(4)
      const rows = 1 + rand(4)
      const nums: number[] = []
      let v = 0
      for (let i = 0; i < cols * rows; i++) nums.push((v += 1 + rand(4)))
      return {
        nums,
        cols,
        target: rand(2) ? nums[rand(nums.length)] : rand(60),
      }
    },
  },
  {
    journey: charReplacement as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => longestAfterRewrites(d.nums as string[], d.k as number),
    // three letters and a small budget, so the window shrinks often
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => "ABC"[rand(3)]),
      k: rand(4),
    }),
  },
  {
    journey: majorityElement as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => majorityOf(d.nums as number[]),
    // build rows that actually HAVE a majority, since classify refuses the
    // rest — a winner plus a shuffled minority
    input: (rand) => {
      const n = 1 + rand(9)
      const winner = rand(4)
      const nums: number[] = []
      const owned = Math.floor(n / 2) + 1
      for (let i = 0; i < owned; i++) nums.push(winner)
      while (nums.length < n) nums.push(4 + rand(4))
      for (let i = nums.length - 1; i > 0; i--) {
        const j = rand(i + 1)
        ;[nums[i], nums[j]] = [nums[j], nums[i]]
      }
      return { nums }
    },
  },
  {
    journey: longestCommonPrefix as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => sharedPrefix(d.nums as string[]),
    // words drawn from a two-letter alphabet so they share prefixes often,
    // and empty words turn up on their own
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(4) }, () =>
        Array.from({ length: rand(5) }, () => "ab"[rand(2)]).join("")
      ),
    }),
  },
  {
    journey: isSubsequence as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => hiddenIn(d.s as string, d.nums as string[]),
    // a three-letter alphabet and a short needle, so true and false both occur
    input: (rand) => ({
      nums: Array.from({ length: rand(10) }, () => "abc"[rand(3)]),
      s: Array.from({ length: rand(4) }, () => "abc"[rand(3)]).join(""),
    }),
  },
  {
    journey: removeDuplicatesSorted as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => distinctInOrder(d.nums as number[]),
    // sorted with heavy repetition, so runs of three or more turn up often
    input: (rand) => {
      const nums: number[] = []
      let v = -2
      for (let i = 0; i < 1 + rand(9); i++) {
        if (rand(2)) v += 1
        nums.push(v)
      }
      return { nums }
    },
  },
  {
    journey: maxOnesAfterFlips as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => longestAfterFlips(d.nums as number[], d.k as number),
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => rand(2)),
      k: rand(4),
    }),
  },
  {
    journey: minSubarraySum as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => shortestReaching(d.nums as number[], d.target as number),
    // strictly positive, as classify demands, and a target often out of reach
    input: (rand) => ({
      nums: Array.from({ length: 1 + rand(9) }, () => 1 + rand(5)),
      target: 1 + rand(20),
    }),
  },
  {
    journey: singleInSorted as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => loneValue(d.nums as number[]),
    // build the shape classify insists on: sorted pairs with exactly one
    // unpaired value dropped somewhere among them
    input: (rand) => {
      const values: number[] = []
      let v = 0
      for (let i = 0; i < 1 + rand(6); i++) values.push((v += 1 + rand(2)))
      const lone = rand(values.length)
      const nums: number[] = []
      for (let i = 0; i < values.length; i++) {
        nums.push(values[i])
        if (i !== lone) nums.push(values[i])
      }
      return { nums }
    },
  },
  {
    journey: decodeString as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => decoded(d.nums as string[]),
    // generate WELL FORMED encodings only, since the problem promises that:
    // a small grammar, nested at most twice
    input: (rand) => {
      const letters = () =>
        Array.from({ length: 1 + rand(2) }, () => "abc"[rand(3)]).join("")
      const group = (depth: number): string =>
        depth > 0 && rand(2)
          ? `${1 + rand(3)}[${letters()}${group(depth - 1)}]`
          : `${1 + rand(3)}[${letters()}]`
      return { nums: [...(letters() + group(2) + letters())] }
    },
  },
  {
    journey: removeKDigits as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => smallestAfterRemoving(d.nums as string[], d.k as number),
    // small digits so ties and exposed leading zeroes both turn up
    input: (rand) => {
      const n = 1 + rand(7)
      return {
        nums: Array.from({ length: n }, () => "0123"[rand(4)]),
        k: rand(n + 1),
      }
    },
  },
  {
    journey: minCostStairs as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => cheapestClimb(d.nums as number[]),
    input: (rand) => ({
      nums: Array.from({ length: 2 + rand(8) }, () => rand(20)),
    }),
  },
  {
    journey: islandCountJourney as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => islandCount(d.nums as number[], d.cols as number),
    // land at about half density, so grids with several islands and grids
    // with none both turn up
    input: (rand) => {
      const cols = 1 + rand(4)
      const rows = 1 + rand(4)
      return {
        nums: Array.from({ length: cols * rows }, () => rand(2)),
        cols,
      }
    },
  },
  {
    journey: cycleDetect as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => loops(d.nums as number[], d.cycle as number),
    // the tail points at a real index or nowhere; -1 is a list that ends
    input: (rand) => {
      const n = rand(7)
      return {
        nums: Array.from({ length: n }, () => rand(9) - 4),
        cycle: n && rand(2) ? rand(n) : -1,
      }
    },
  },
  {
    journey: kthLargestStream as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => kthLargestOf(d.nums as number[], d.k as number),
    // k must be legal against the stream it arrives with
    input: (rand) => {
      const n = 1 + rand(10)
      return {
        nums: Array.from({ length: n }, () => rand(15) - 5),
        k: 1 + rand(n),
      }
    },
  },
  {
    journey: levelOrder as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => levelValues(d.nums as string[]),
    input: (rand) => {
      const n = 1 + rand(15)
      const nums: string[] = []
      for (let i = 0; i < n; i++) {
        const parentAlive = i === 0 || nums[Math.floor((i - 1) / 2)] !== "."
        nums.push(parentAlive && rand(4) ? String(rand(9)) : ".")
      }
      return { nums }
    },
  },
  {
    journey: maxIslandArea as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => biggestIsland(d.nums as number[], d.cols as number),
    input: (rand) => {
      const cols = 1 + rand(4)
      const rows = 1 + rand(4)
      return {
        nums: Array.from({ length: cols * rows }, () => rand(2)),
        cols,
      }
    },
  },
  {
    journey: rottingFruit as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => minutesToRot(d.nums as number[], d.cols as number),
    input: (rand) => {
      const cols = 1 + rand(4)
      const rows = 1 + rand(4)
      return {
        nums: Array.from({ length: cols * rows }, () => rand(3)),
        cols,
      }
    },
  },
  {
    journey: wordSearch as unknown as AnyJourney,
    // the greedy rung is DELIBERATELY wrong — it never gives a failed path's
    // cells back, which is the lesson and is pinned by its own test below
    skip: ["story", "greedy"],
    reference: (d) => canSpell(d.nums as string[], d.word as string),
    input: (rand) => {
      const letters = "abc"
      const cols = 1 + rand(3)
      const rows = 1 + rand(3)
      return {
        nums: Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => letters[rand(3)]).join("")
        ),
        word: Array.from({ length: 1 + rand(4) }, () => letters[rand(3)]).join(
          ""
        ),
      }
    },
  },
  {
    journey: countProvinces as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => provinces(d.nums as number[], d.cols as number),
    // a symmetric 0/1 matrix with a 1 diagonal, which is what classify demands
    input: (rand) => {
      const n = 1 + rand(5)
      const m = Array.from({ length: n * n }, () => 0)
      for (let i = 0; i < n; i++) {
        m[i * n + i] = 1
        for (let j = i + 1; j < n; j++) {
          const v = rand(3) ? 0 : 1
          m[i * n + j] = v
          m[j * n + i] = v
        }
      }
      return { nums: m, cols: n }
    },
  },
  {
    journey: maxDepth as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => depthOfTree(d.nums as string[]),
    // level-order tokens with "." for an absent node, built so a node never
    // hangs off an absent parent — which is exactly what classify demands
    input: (rand) => {
      const n = 1 + rand(15)
      const nums: string[] = []
      for (let i = 0; i < n; i++) {
        const parentAlive = i === 0 || nums[Math.floor((i - 1) / 2)] !== "."
        nums.push(parentAlive && rand(4) ? String(rand(9)) : ".")
      }
      return { nums }
    },
  },
  {
    journey: validateBst as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => isBst(d.nums as string[]),
    // a non-empty tree, values narrow enough that random trees are sometimes
    // valid and sometimes not — a generator that never produces a BST proves
    // only that the rungs agree on rejecting
    input: (rand) => {
      const n = 1 + rand(12)
      const nums: string[] = ["" + (3 + rand(6))]
      for (let i = 1; i < n; i++) {
        const parentAlive = nums[Math.floor((i - 1) / 2)] !== "."
        nums.push(parentAlive && rand(4) ? String(rand(12)) : ".")
      }
      return { nums }
    },
  },
  {
    journey: mergeTwoSorted as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => merged(d.nums as string[]),
    // two ascending lists with a single bar between them; either may be empty
    input: (rand) => {
      const run = () => {
        const xs: string[] = []
        let v = rand(9) - 4
        for (let i = rand(5); i > 0; i--) {
          xs.push(String(v))
          v += rand(4)
        }
        return xs
      }
      return { nums: [...run(), "|", ...run()] }
    },
  },
  {
    journey: reverseList as unknown as AnyJourney,
    skip: ["story"],
    reference: (d) => reversed(d.nums as number[]),
    input: (rand) => ({
      nums: Array.from({ length: rand(8) }, () => rand(9) - 4),
    }),
  },
]

test("word-search: the rung that never restores a cell is wrong where the journey says it is", () => {
  // the board the journey ships for exactly this: a path has to be given back
  const board = ["aaa", "aba"]
  assert.equal(canSpell(board, "aaaaa"), true)
  assert.equal(canSpellGreedy(board, "aaaaa"), false)
  // and it agrees on a board where nothing has to back off, which is what
  // makes the bug survive casual testing
  assert.equal(
    canSpell(["abce", "sfcs", "adee"], "abcced"),
    canSpellGreedy(["abce", "sfcs", "adee"], "abcced")
  )
})

test("fewest-coins: the greedy rung is wrong where the journey says it is", () => {
  // the second act teaches by failing. If greedy ever starts agreeing here,
  // either the lesson or the code has drifted.
  assert.equal(greedyCoins([1, 3, 4], 6), 3)
  assert.equal(fewestCoins([1, 3, 4], 6), 2)
  // and it is right on a well-behaved set, which is why it is tempting
  assert.equal(greedyCoins([1, 5, 10], 12), fewestCoins([1, 5, 10], 12))
})

for (const { journey, skip, reference, input, accept } of TABLE)
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
    assert.ok(
      acts.length >= 2,
      "a derived journey needs a ladder, not one rung"
    )
    for (const d of cases) {
      // classify is the journey's own statement of what it can honestly run;
      // an input it rejects is out of scope, not a disagreement
      if (!journey.classify(d as never).ok) continue
      const want = reference(d)
      for (const a of acts) {
        const got = lastAnswer(drain(a.run(d as never, {})))
        if (accept)
          assert.ok(
            accept(d, got),
            `${a.key} on ${JSON.stringify(d)} answered ${JSON.stringify(got)}`
          )
        else assert.deepEqual(got, want, `${a.key} on ${JSON.stringify(d)}`)
      }
    }
  })
