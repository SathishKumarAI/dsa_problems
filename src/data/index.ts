// Aggregates all content. Components import from here only.
import type { Problem } from "./types.ts"
import { PATTERNS } from "./patterns.ts"
import { arraysHashing } from "./problems/arrays-hashing/index.ts"
import { twoPointers } from "./problems/two-pointers/index.ts"
import { slidingWindow } from "./problems/sliding-window/index.ts"
import { stack } from "./problems/stack/index.ts"
import { binarySearch } from "./problems/binary-search/index.ts"
import { linkedList } from "./problems/linked-list/index.ts"
import { trees } from "./problems/trees/index.ts"
import { heaps } from "./problems/heaps/index.ts"
import { graphs } from "./problems/graphs/index.ts"
import { dp } from "./problems/dp/index.ts"

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
