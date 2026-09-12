import type { Problem } from "../../types.ts"
import { problem as classicBinarySearch } from "./classic-binary-search.ts"
import { problem as rotatedMinimum } from "./rotated-minimum.ts"
import { problem as kokoBananas } from "./koko-bananas.ts"
import { problem as search2dMatrix } from "./search-2d-matrix.ts"
import { problem as rotatedSearch } from "./rotated-search.ts"
import { problem as firstLastPosition } from "./first-last-position.ts"
import { problem as searchInsertPosition } from "./search-insert-position.ts"
import { problem as findPeakElement } from "./find-peak-element.ts"
import { problem as singleInSorted } from "./single-in-sorted.ts"
import { problem as kClosestValues } from "./k-closest-values.ts"
import { problem as shipInDDays } from "./ship-in-d-days.ts"

export const binarySearch: Problem[] = [
  classicBinarySearch,
  rotatedMinimum,
  kokoBananas,
  search2dMatrix,
  rotatedSearch,
  firstLastPosition,
  searchInsertPosition,
  findPeakElement,
  singleInSorted,
  kClosestValues,
  shipInDDays,
]
