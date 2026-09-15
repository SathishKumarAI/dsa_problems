import type { Problem } from "../../types.ts"
import { problem as bestTrade } from "./best-trade.ts"
import { problem as longestUniqueSubstring } from "./longest-unique-substring.ts"
import { problem as minCoverSubstring } from "./min-cover-substring.ts"
import { problem as charReplacement } from "./char-replacement.ts"
import { problem as permutationInString } from "../../../problems/permutation-in-string/index.ts"
import { problem as windowMaximum } from "../../../problems/window-maximum/index.ts"
import { problem as maxOnesAfterFlips } from "./max-ones-after-flips.ts"
import { problem as minSubarraySum } from "./min-subarray-sum.ts"
import { problem as anagramPositions } from "./anagram-positions.ts"
import { problem as fruitBaskets } from "./fruit-baskets.ts"

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
