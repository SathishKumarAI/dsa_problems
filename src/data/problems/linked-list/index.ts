import type { Problem } from "../../types.ts"
import { problem as reverseList } from "./reverse-list.ts"
import { problem as cycleDetect } from "./cycle-detect.ts"
import { problem as mergeTwoSorted } from "./merge-two-sorted.ts"
import { problem as middleOfList } from "./middle-of-list.ts"
import { problem as palindromeList } from "./palindrome-list.ts"
import { problem as removeNthFromEnd } from "./remove-nth-from-end.ts"

export const linkedList: Problem[] = [
  reverseList,
  cycleDetect,
  mergeTwoSorted,
  middleOfList,
  palindromeList,
  removeNthFromEnd,
]
