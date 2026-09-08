import type { Problem } from "../../types.ts"
import { problem as reverseList } from "./reverse-list.ts"
import { problem as cycleDetect } from "./cycle-detect.ts"
import { problem as mergeTwoSorted } from "./merge-two-sorted.ts"

export const linkedList: Problem[] = [reverseList, cycleDetect, mergeTwoSorted]
