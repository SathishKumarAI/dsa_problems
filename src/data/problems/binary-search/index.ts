import type { Problem } from "../../types.ts"
import { problem as classicBinarySearch } from "./classic-binary-search.ts"
import { problem as rotatedMinimum } from "./rotated-minimum.ts"
import { problem as kokoBananas } from "./koko-bananas.ts"
import { problem as search2dMatrix } from "./search-2d-matrix.ts"
import { problem as rotatedSearch } from "./rotated-search.ts"
import { problem as firstLastPosition } from "./first-last-position.ts"

export const binarySearch: Problem[] = [
  classicBinarySearch,
  rotatedMinimum,
  kokoBananas,
  search2dMatrix,
  rotatedSearch,
  firstLastPosition,
]
