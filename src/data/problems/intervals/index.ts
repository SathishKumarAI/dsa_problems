// The intervals load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as burstBalloonsArrows } from "../../../problems/burst-balloons-arrows/index.ts"
import { problem as insertInterval } from "../../../problems/insert-interval/index.ts"
import { problem as mergeIntervals } from "../../../problems/merge-intervals/index.ts"
import { problem as nonOverlappingIntervals } from "../../../problems/non-overlapping-intervals/index.ts"
import { problem as summaryRanges } from "../../../problems/summary-ranges/index.ts"

export const intervals: Problem[] = [
  burstBalloonsArrows,
  insertInterval,
  mergeIntervals,
  nonOverlappingIntervals,
  summaryRanges,
]
