import type { Problem } from "../../types.ts"
import { problem as classicBinarySearch } from "./classic-binary-search.ts"
import { problem as rotatedMinimum } from "./rotated-minimum.ts"
import { problem as kokoBananas } from "./koko-bananas.ts"

export const binarySearch: Problem[] = [
  classicBinarySearch,
  rotatedMinimum,
  kokoBananas,
]
