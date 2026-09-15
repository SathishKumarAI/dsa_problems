// Aggregates all content. Components import from here only.
//
// The ten arrays below are LOAD LISTS, not the grouping. A problem belongs to
// the pattern its own `pattern` field names — `problemsByPattern` filters on
// that field and nothing reads the array a record arrived in. So a record
// filed under `problems/arrays-hashing/` may well be a prefix-sums problem,
// and re-filing one is a one-word edit rather than a file move. There are 18
// patterns and ten lists, and that is not a bug.
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
