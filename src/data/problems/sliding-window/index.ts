import type { Problem } from "../../types.ts"
import { problem as bestTrade } from "../../../problems/best-trade/index.ts"
import { problem as longestUniqueSubstring } from "./longest-unique-substring.ts"
import { problem as minCoverSubstring } from "./min-cover-substring.ts"
import { problem as charReplacement } from "../../../problems/char-replacement/index.ts"
import { problem as permutationInString } from "../../../problems/permutation-in-string/index.ts"
import { problem as windowMaximum } from "../../../problems/window-maximum/index.ts"
import { problem as maxOnesAfterFlips } from "./max-ones-after-flips.ts"
import { problem as minSubarraySum } from "./min-subarray-sum.ts"
import { problem as anagramPositions } from "../../../problems/anagram-positions/index.ts"
import { problem as fruitBaskets } from "../../../problems/fruit-baskets/index.ts"

export const slidingWindow: Problem[] = [
  bestTrade,
  longestUniqueSubstring,
  minCoverSubstring,
  charReplacement,
  permutationInString,
  windowMaximum,
  maxOnesAfterFlips,
  minSubarraySum,
  anagramPositions,
  fruitBaskets,
]
