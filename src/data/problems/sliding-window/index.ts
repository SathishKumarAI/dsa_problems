import type { Problem } from "../../types.ts"
import { problem as bestTrade } from "./best-trade.ts"
import { problem as longestUniqueSubstring } from "./longest-unique-substring.ts"
import { problem as minCoverSubstring } from "./min-cover-substring.ts"
import { problem as charReplacement } from "./char-replacement.ts"
import { problem as permutationInString } from "./permutation-in-string.ts"
import { problem as windowMaximum } from "./window-maximum.ts"

export const slidingWindow: Problem[] = [
  bestTrade,
  longestUniqueSubstring,
  minCoverSubstring,
  charReplacement,
  permutationInString,
  windowMaximum,
]
