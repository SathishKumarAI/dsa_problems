// The prefix-sums load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as contiguousArray } from "../../../problems/contiguous-array/index.ts"
import { problem as findPivotIndex } from "../../../problems/find-pivot-index/index.ts"
import { problem as productExceptSelf } from "../../../problems/product-except-self/index.ts"
import { problem as rangeSumImmutable } from "../../../problems/range-sum-immutable/index.ts"
import { problem as subarraySumK } from "../../../problems/subarray-sum-k/index.ts"

export const prefixSums: Problem[] = [
  contiguousArray,
  findPivotIndex,
  productExceptSelf,
  rangeSumImmutable,
  subarraySumK,
]
