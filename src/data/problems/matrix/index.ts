// The matrix load list.
//
// GENERATED in spirit, hand-owned in fact: add a problem by adding two lines.
// A load list is not the grouping — `problemsByPattern` filters the record's
// own `pattern` field — so moving a record between lists changes nothing a
// reader sees. The lists exist so there is one obvious place to register a new
// file, which is exactly what eight patterns went without.

import type { Problem } from "../../types.ts"
import { problem as rotateImage } from "../../../problems/rotate-image/index.ts"
import { problem as spiralMatrixIi } from "../../../problems/spiral-matrix-ii/index.ts"
import { problem as spiralOrder } from "../../../problems/spiral-order/index.ts"
import { problem as zeroMatrix } from "../../../problems/zero-matrix/index.ts"

export const matrix: Problem[] = [
  rotateImage,
  spiralMatrixIi,
  spiralOrder,
  zeroMatrix,
]
