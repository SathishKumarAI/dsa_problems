import type { Problem } from "../../types.ts"
import { problem as kClosestPoints } from "./k-closest-points.ts"
import { problem as taskCooldown } from "./task-cooldown.ts"
import { problem as lastStoneWeight } from "./last-stone-weight.ts"
import { problem as kthLargestElement } from "./kth-largest-element.ts"
import { problem as sortByFrequency } from "./sort-by-frequency.ts"
import { problem as kthSmallestMatrix } from "./kth-smallest-matrix.ts"
import { problem as topKFrequentWords } from "./top-k-frequent-words.ts"
import { problem as uglyNumber } from "./ugly-number.ts"

export const heaps: Problem[] = [
  kClosestPoints,
  taskCooldown,
  lastStoneWeight,
  kthLargestElement,
  sortByFrequency,
  kthSmallestMatrix,
  topKFrequentWords,
  uglyNumber,
]
