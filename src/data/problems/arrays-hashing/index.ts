import type { Problem } from "../../types.ts"
import { problem as pairSum } from "./pair-sum.ts"
import { problem as topKFrequent } from "./top-k-frequent.ts"
import { problem as longestConsecutiveRun } from "./longest-consecutive-run.ts"
import { problem as singleNumber } from "./single-number.ts"
import { problem as containsDuplicate } from "./contains-duplicate.ts"
import { problem as validAnagram } from "./valid-anagram.ts"
import { problem as productExceptSelf } from "./product-except-self.ts"
import { problem as groupAnagrams } from "./group-anagrams.ts"
import { problem as subarraySumK } from "./subarray-sum-k.ts"
import { problem as majorityElement } from "./majority-element.ts"
import { problem as longestCommonPrefix } from "./longest-common-prefix.ts"
import { problem as isomorphicStrings } from "./isomorphic-strings.ts"
import { problem as findAllDuplicates } from "./find-all-duplicates.ts"
import { problem as firstMissingPositive } from "./first-missing-positive.ts"
import { problem as intersectionOfArrays } from "./intersection-of-arrays.ts"
import { problem as missingNumber } from "../../../problems/missing-number/index.ts"
import { problem as plusOne } from "../../../problems/plus-one/index.ts"
import { problem as rotateArray } from "../../../problems/rotate-array/index.ts"
import { problem as summaryRanges } from "../../../problems/summary-ranges/index.ts"
import { problem as spiralOrder } from "./spiral-order.ts"
import { problem as zeroMatrix } from "../../../problems/zero-matrix/index.ts"

export const arraysHashing: Problem[] = [
  pairSum,
  topKFrequent,
  longestConsecutiveRun,
  singleNumber,
  containsDuplicate,
  validAnagram,
  productExceptSelf,
  groupAnagrams,
  subarraySumK,
  majorityElement,
  longestCommonPrefix,
  isomorphicStrings,
  findAllDuplicates,
  firstMissingPositive,
  intersectionOfArrays,
  missingNumber,
  plusOne,
  rotateArray,
  summaryRanges,
  spiralOrder,
  zeroMatrix,
]
