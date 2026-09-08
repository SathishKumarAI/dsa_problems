import type { Problem } from "../../types.ts"
import { problem as pairSum } from "./pair-sum.ts"
import { problem as topKFrequent } from "./top-k-frequent.ts"
import { problem as longestConsecutiveRun } from "./longest-consecutive-run.ts"
import { problem as singleNumber } from "./single-number.ts"

export const arraysHashing: Problem[] = [
  pairSum,
  topKFrequent,
  longestConsecutiveRun,
  singleNumber,
]
