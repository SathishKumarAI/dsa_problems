import type { Problem } from "../../types.ts"
import { problem as sortedPairSum } from "./sorted-pair-sum.ts"
import { problem as containerWater } from "./container-water.ts"
import { problem as threeSumZero } from "./three-sum-zero.ts"

export const twoPointers: Problem[] = [
  sortedPairSum,
  containerWater,
  threeSumZero,
]
