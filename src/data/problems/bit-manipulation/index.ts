// The bit-manipulation load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as countingBits } from "../../../problems/counting-bits/index.ts"
import { problem as hammingWeight } from "../../../problems/hamming-weight/index.ts"
import { problem as missingNumber } from "../../../problems/missing-number/index.ts"
import { problem as reverseBits } from "../../../problems/reverse-bits/index.ts"
import { problem as singleNumber } from "../../../problems/single-number/index.ts"

export const bitManipulation: Problem[] = [
  countingBits,
  hammingWeight,
  missingNumber,
  reverseBits,
  singleNumber,
]
