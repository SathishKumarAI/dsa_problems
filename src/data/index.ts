// Aggregates all content. Components import from here only.
//
// The arrays below are LOAD LISTS, not the grouping. A problem belongs to the
// pattern its own `pattern` field names — `problemsByPattern` filters on that
// field and nothing reads the array a record arrived in, so moving a record
// between lists changes nothing a reader sees and re-filing one is a one-word
// edit rather than a file move.
//
// There is a list per pattern again all the same. Eight patterns spent a while
// with no list of their own, and "the mismatch is harmless" quietly became
// "there is nowhere obvious to put the next file" — which is how a prefix-sums
// problem ends up registered under arrays-hashing by nobody's decision.
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
import { backtracking } from "./problems/backtracking/index.ts"
import { bitManipulation } from "./problems/bit-manipulation/index.ts"
import { design } from "./problems/design/index.ts"
import { greedy } from "./problems/greedy/index.ts"
import { intervals } from "./problems/intervals/index.ts"
import { matrix } from "./problems/matrix/index.ts"
import { prefixSums } from "./problems/prefix-sums/index.ts"
import { trie } from "./problems/trie/index.ts"
import { unionFind } from "./problems/union-find/index.ts"

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
  ...backtracking,
  ...bitManipulation,
  ...design,
  ...greedy,
  ...intervals,
  ...matrix,
  ...prefixSums,
  ...trie,
  ...unionFind,
]

export { PATTERNS }
export * from "./types.ts"

export const problemsByPattern = (patternId: string) =>
  PROBLEMS.filter((p) => p.pattern === patternId)
