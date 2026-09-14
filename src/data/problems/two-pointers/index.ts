import type { Problem } from "../../types.ts"
import { problem as sortedPairSum } from "../../../problems/sorted-pair-sum/index.ts"
import { problem as containerWater } from "./container-water.ts"
import { problem as threeSumZero } from "../../../problems/three-sum-zero/index.ts"
import { problem as validPalindrome } from "../../../problems/valid-palindrome/index.ts"
import { problem as trapRainWater } from "../../../problems/trap-rain-water/index.ts"
import { problem as sortColors } from "../../../problems/sort-colors/index.ts"
import { problem as moveZeroes } from "./move-zeroes.ts"
import { problem as sortedSquares } from "./sorted-squares.ts"
import { problem as removeDuplicatesSorted } from "../../../problems/remove-duplicates-sorted/index.ts"
import { problem as isSubsequence } from "./is-subsequence.ts"
import { problem as mergeSortedArray } from "../../../problems/merge-sorted-array/index.ts"
import { problem as removeElement } from "../../../problems/remove-element/index.ts"
import { problem as reverseString } from "../../../problems/reverse-string/index.ts"
import { problem as threeSumClosest } from "../../../problems/three-sum-closest/index.ts"
import { problem as backspaceCompare } from "./backspace-compare.ts"
import { problem as boatsToSave } from "./boats-to-save.ts"
import { problem as nextPermutation } from "../../../problems/next-permutation/index.ts"

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
  mergeSortedArray,
  removeElement,
  reverseString,
  threeSumClosest,
  backspaceCompare,
  boatsToSave,
  nextPermutation,
]
