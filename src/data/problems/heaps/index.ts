import type { Problem } from "../../types.ts"
import { problem as kthLargestStream } from "./kth-largest-stream.ts"
import { problem as kClosestPoints } from "./k-closest-points.ts"
import { problem as taskCooldown } from "./task-cooldown.ts"
import { problem as lastStoneWeight } from "./last-stone-weight.ts"
import { problem as kthLargestElement } from "./kth-largest-element.ts"
import { problem as sortByFrequency } from "./sort-by-frequency.ts"
import { problem as kthSmallestMatrix } from "./kth-smallest-matrix.ts"

export const heaps: Problem[] = [
  kthLargestStream,
  kClosestPoints,
  taskCooldown,
  lastStoneWeight,
  kthLargestElement,
  sortByFrequency,
  kthSmallestMatrix,
]
