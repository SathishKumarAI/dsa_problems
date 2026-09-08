import type { Problem } from "../../types.ts"
import { problem as stairWays } from "./stair-ways.ts"
import { problem as houseRobber } from "./house-robber.ts"
import { problem as coinChangeMin } from "./coin-change-min.ts"
import { problem as longestIncreasingRun } from "./longest-increasing-run.ts"
import { problem as maxSubarray } from "./max-subarray.ts"
import { problem as longestCommonSubsequence } from "./longest-common-subsequence.ts"

export const dp: Problem[] = [
  stairWays,
  houseRobber,
  coinChangeMin,
  longestIncreasingRun,
  maxSubarray,
  longestCommonSubsequence,
]
