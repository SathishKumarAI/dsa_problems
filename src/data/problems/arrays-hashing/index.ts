import type { Problem } from "../../types.ts"
import { problem as pairSum } from "./pair-sum.ts"
import { problem as topKFrequent } from "./top-k-frequent.ts"
import { problem as longestConsecutiveRun } from "./longest-consecutive-run.ts"
import { problem as singleNumber } from "./single-number.ts"
import { problem as containsDuplicate } from "./contains-duplicate.ts"
import { problem as validAnagram } from "./valid-anagram.ts"
import { problem as productExceptSelf } from "../../../problems/product-except-self/index.ts"
import { problem as groupAnagrams } from "../../../problems/group-anagrams/index.ts"
import { problem as subarraySumK } from "../../../problems/subarray-sum-k/index.ts"
import { problem as majorityElement } from "./majority-element.ts"
import { problem as longestCommonPrefix } from "./longest-common-prefix.ts"
import { problem as isomorphicStrings } from "./isomorphic-strings.ts"
import { problem as findAllDuplicates } from "../../../problems/find-all-duplicates/index.ts"
import { problem as firstMissingPositive } from "../../../problems/first-missing-positive/index.ts"
import { problem as intersectionOfArrays } from "../../../problems/intersection-of-arrays/index.ts"
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
