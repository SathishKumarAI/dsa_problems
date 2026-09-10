import type { Problem } from "../../types.ts"
import { problem as reverseList } from "./reverse-list.ts"
import { problem as cycleDetect } from "./cycle-detect.ts"
import { problem as mergeTwoSorted } from "./merge-two-sorted.ts"
import { problem as middleOfList } from "./middle-of-list.ts"
import { problem as palindromeList } from "./palindrome-list.ts"
import { problem as removeNthFromEnd } from "./remove-nth-from-end.ts"
import { problem as addTwoNumbers } from "./add-two-numbers.ts"
import { problem as oddEvenList } from "./odd-even-list.ts"
import { problem as removeListElements } from "./remove-list-elements.ts"
import { problem as reorderList } from "./reorder-list.ts"
import { problem as rotateList } from "./rotate-list.ts"
import { problem as swapPairs } from "./swap-pairs.ts"

export const linkedList: Problem[] = [
  reverseList,
  cycleDetect,
  mergeTwoSorted,
  middleOfList,
  palindromeList,
  removeNthFromEnd,
  addTwoNumbers,
  oddEvenList,
  removeListElements,
  reorderList,
  rotateList,
  swapPairs,
]
