import type { Problem } from "../../types.ts"
import { problem as kthLargestStream } from "./kth-largest-stream.ts"
import { problem as kClosestPoints } from "./k-closest-points.ts"
import { problem as taskCooldown } from "./task-cooldown.ts"
import { problem as lastStoneWeight } from "./last-stone-weight.ts"

export const heaps: Problem[] = [
  kthLargestStream,
  kClosestPoints,
  taskCooldown,
  lastStoneWeight,
]
