// Aggregates all content. Components import from here only.
import type { Problem } from "./types.ts"
import { PATTERNS } from "./patterns.ts"
import { arraysHashing } from "./problems/arrays-hashing.ts"
import { twoPointers } from "./problems/two-pointers.ts"
import { slidingWindow } from "./problems/sliding-window.ts"
import { stack } from "./problems/stack.ts"
import { binarySearch } from "./problems/binary-search.ts"
import { linkedList } from "./problems/linked-list.ts"
import { trees } from "./problems/trees.ts"
import { heaps } from "./problems/heaps.ts"
import { graphs } from "./problems/graphs.ts"
import { dp } from "./problems/dp.ts"

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
export * from "./types.ts"

export const problemsByPattern = (patternId: string) =>
  PROBLEMS.filter((p) => p.pattern === patternId)
