import type { Problem } from "../../types.ts"
import { problem as sortedPairSum } from "./sorted-pair-sum.ts"
import { problem as containerWater } from "./container-water.ts"
import { problem as threeSumZero } from "./three-sum-zero.ts"
import { problem as validPalindrome } from "./valid-palindrome.ts"
import { problem as trapRainWater } from "./trap-rain-water.ts"
import { problem as sortColors } from "./sort-colors.ts"
import { problem as moveZeroes } from "./move-zeroes.ts"
import { problem as sortedSquares } from "./sorted-squares.ts"
import { problem as removeDuplicatesSorted } from "./remove-duplicates-sorted.ts"
import { problem as isSubsequence } from "./is-subsequence.ts"

export const twoPointers: Problem[] = [
  sortedPairSum,
  containerWater,
  threeSumZero,
  validPalindrome,
  trapRainWater,
  sortColors,
  moveZeroes,
  sortedSquares,
  removeDuplicatesSorted,
  isSubsequence,
]
