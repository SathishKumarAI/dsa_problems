import type { Problem } from "../../types.ts"
import { problem as stairWays } from "./stair-ways.ts"
import { problem as houseRobber } from "./house-robber.ts"
import { problem as coinChangeMin } from "./coin-change-min.ts"
import { problem as longestIncreasingRun } from "./longest-increasing-run.ts"
import { problem as maxSubarray } from "./max-subarray.ts"
import { problem as longestCommonSubsequence } from "./longest-common-subsequence.ts"
import { problem as countingBits } from "./counting-bits.ts"
import { problem as partitionEqualSubset } from "./partition-equal-subset.ts"
import { problem as uniquePaths } from "./unique-paths.ts"
import { problem as wordBreak } from "./word-break.ts"
import { problem as minCostStairs } from "./min-cost-stairs.ts"

export const dp: Problem[] = [
  stairWays,
  houseRobber,
  coinChangeMin,
  longestIncreasingRun,
  maxSubarray,
  longestCommonSubsequence,
  countingBits,
  partitionEqualSubset,
  uniquePaths,
  wordBreak,
  minCostStairs,
]
