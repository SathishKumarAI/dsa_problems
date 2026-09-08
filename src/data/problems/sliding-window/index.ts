import type { Problem } from "../../types.ts"
import { problem as bestTrade } from "./best-trade.ts"
import { problem as longestUniqueSubstring } from "./longest-unique-substring.ts"
import { problem as minCoverSubstring } from "./min-cover-substring.ts"
import { problem as charReplacement } from "./char-replacement.ts"

export const slidingWindow: Problem[] = [
  bestTrade,
  longestUniqueSubstring,
  minCoverSubstring,
  charReplacement,
]
