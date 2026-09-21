// move-zeroes — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "move-zeroes"

export const title = "Push the Zeroes to the End"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "easy"

export const leetcode = "move-zeroes"

export const brief = "Zeroes to the back, everything else keeps its order."

export const statement =
  "Given an integer array, move every 0 to the end while keeping the relative order of the non-zero values. Do it in place."

export const constraints: string[] = [
  "1 <= nums.length <= 10^4",
  "-2^31 <= nums[i] <= 2^31 - 1",
  "the non-zero values must keep their RELATIVE ORDER, which rules out swapping a zero with the last element",
  "in place: no second array to build the answer in",
]

export const examples: Example[] = [
  { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
  {
    input: "nums = [0, 0, 1]",
    output: "[1, 0, 0]",
    note: "A run of zeroes at the front is the case that catches a careless swap.",
  },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= nums.length <= 10^4",
    what: "Ten thousand elements, which is small \u2014 and this is one of the rare pages where the SIZE is not what decides anything. Every rung here is O(n). What the bound does tell you is that the naive repeated-removal version (delete a zero, shift everything left, repeat) is quadratic at 10\u2078 operations and would still be the wrong answer at a tenth of the size.",
  },
  {
    constraint: "-2^31 <= nums[i] <= 2^31 - 1",
    what: "The full 32-bit range, so there is no sentinel value you can borrow to mark a slot as empty: every possible integer is legitimate data. That closes the door on the trick people reach for \u2014 marking removed positions \u2014 and leaves the read/write pair, which never needs a sentinel because the region between the two indices is known to be garbage.",
  },
  {
    constraint:
      "the non-zero values must keep their RELATIVE ORDER, which rules out swapping a zero with the last element",
    what: "This is the constraint that makes the problem interesting, and it is the one people read past. Without it the answer is two pointers swapping from both ends and finishing in half the moves. With it, every non-zero value must be written in the order it was read, which is exactly what a forward write index guarantees.",
    figure: {
      kind: "cells",
      values: ["0", "1", "0", "3", "12"],
      caption:
        "the answer is 1, 3, 12, 0, 0. Swapping the first zero with the 12 would give 12, 1, 0, 3, 0 \u2014 the same multiset, the wrong order.",
    },
  },
  {
    constraint: "in place: no second array to build the answer in",
    what: "The O(1) space requirement, which is what the first rung spends and the second does not. In place also carries a cost the bound does not show: it DESTROYS the caller\u2019s array. That is fine here because the statement asks for it, and it is worth saying out loud, because the same code inside a larger program is a bug when the caller reads the input again afterwards.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "nums = [0, 1, 0, 3, 12]. What must the array hold when you are done?",
    options: [
      "[1, 3, 12, 0, 0]",
      "[12, 1, 3, 0, 0]",
      "[1, 3, 12] with the zeroes removed",
      "Any arrangement with the zeroes at the end",
    ],
    answer: 0,
    because:
      "The non-zero values keep their relative order, so 1, 3, 12 must appear in that order. The array also keeps its length \u2014 the zeroes move, they are not deleted.",
  },
  {
    ask: "Why can you not simply swap each zero with the last element?",
    options: [
      "It is too slow",
      "It would move a value that has already been placed",
      "It breaks the relative order of the non-zero values",
      "It needs extra space",
    ],
    answer: 2,
    because:
      "That is the classic partition trick, and it is correct only when order does not matter. Here the statement requires the surviving values to keep their order, which is precisely what swapping from the end destroys.",
  },
  {
    ask: "A read index and a write index walk the array. What is true of every position BEFORE the write index?",
    options: [
      "It is a zero",
      "It is final \u2014 a non-zero value in its answer position",
      "It has not been looked at yet",
      "It holds garbage you may overwrite",
    ],
    answer: 1,
    because:
      "That is the invariant the whole approach rests on: everything before write is finished, everything from read on is untouched, and the gap between them is the garbage you are allowed to clobber. Advancing write on a value you skipped breaks it and overwrites a survivor.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Move all zeroes to end of array \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/move-zeroes-end-array/",
    kind: "reference",
    note: "The same rungs in four languages, including the swap variant \u2014 useful for seeing exactly where the order-preserving version and the partition version diverge.",
  },
]
