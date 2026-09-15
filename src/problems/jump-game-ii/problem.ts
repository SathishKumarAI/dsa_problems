// jump-game-ii — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "jump-game-ii"

export const title = "The Fewest Hops to the End"

export const pattern = "greedy"

export const difficulty: Difficulty = "medium"

export const leetcode = "jump-game-ii"

export const brief = "Each value is a maximum hop length; reach the last index in as few jumps as possible."

export const statement = "Each entry gives the maximum distance you may jump forward from that index. Starting at index 0, return the minimum number of jumps needed to reach the last index. The input guarantees the end is reachable, so this is purely about counting hops, not about deciding whether it can be done."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4 and 0 <= nums[i] <= 1000, so an O(n^2) dynamic program is 10^8 steps and a linear sweep is 10^4",
  "the last index is always reachable, so no unreachable case has to be reported",
  "a single-element array needs ZERO jumps, which is the case an off-by-one loop bound usually breaks",
  "values are MAXIMUM jump lengths, so a shorter hop is always allowed — the problem is a choice, not a fixed sequence",
  "a zero is legal anywhere except where it would strand you, which the reachability guarantee rules out",
]

export const examples: Example[] = [
  {
    input: "nums = [2,3,1,1,4]",
    output: "2",
    note: "Hop to index 1, then straight to the end. Taking the full jump from index 0 to index 2 needs three.",
  },
  {
    input: "nums = [2,3,0,1,4]",
    output: "2",
    note: "The same count around a zero, because the jump from index 1 leaps over it.",
  },
  {
    input: "nums = [0]",
    output: "0",
    note: "Already at the end. Any loop that runs to the last index and counts a jump answers 1 here.",
  },
]
