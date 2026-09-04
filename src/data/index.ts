// Aggregates all content. Components import from here only.
import type { Problem } from "./types"
import { PATTERNS } from "./patterns"
import { arraysHashing } from "./problems/arrays-hashing"
import { twoPointers } from "./problems/two-pointers"
import { slidingWindow } from "./problems/sliding-window"
import { stack } from "./problems/stack"
import { binarySearch } from "./problems/binary-search"
import { linkedList } from "./problems/linked-list"
import { trees } from "./problems/trees"
import { heaps } from "./problems/heaps"
import { graphs } from "./problems/graphs"
import { dp } from "./problems/dp"

export const PROBLEMS: Problem[] = [
  ...arraysHashing,
  ...twoPointers,
  ...slidingWindow,
  ...stack,
  ...binarySearch,
  ...linkedList,
  ...trees,
  ...heaps,
  ...graphs,
  ...dp,
]

export { PATTERNS }
export * from "./types"

export const problemsByPattern = (patternId: string) =>
  PROBLEMS.filter((p) => p.pattern === patternId)
