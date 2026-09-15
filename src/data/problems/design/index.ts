// The design load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as kthLargestStream } from "../../../problems/kth-largest-stream/index.ts"
import { problem as lruCache } from "../../../problems/lru-cache/index.ts"
import { problem as minStack } from "../../../problems/min-stack/index.ts"
import { problem as queueFromStacks } from "../../../problems/queue-from-stacks/index.ts"

export const design: Problem[] = [
  kthLargestStream,
  lruCache,
  minStack,
  queueFromStacks,
]
