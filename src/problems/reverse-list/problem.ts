// reverse-list — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "reverse-list"

export const title = "Reverse a Linked List"

export const pattern = "linked-list"

export const difficulty: Difficulty = "easy"

export const leetcode = "reverse-linked-list"

export const brief = "Flip all next-pointers in place."

export const statement =
  "Given the head of a singly linked list, reverse it in place and return the new head."

export const constraints: string[] = [
  "0 <= list length <= 5000",
  "-5000 <= node value <= 5000",
  "an empty list is legal input",
]

export const examples: Example[] = [
  { input: "1 → 2 → 3 → ∅", output: "3 → 2 → 1 → ∅" },
]

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md): what each bound BUYS,
// the questions to answer before solving, and where to read on.

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "0 <= list length <= 5000",
    what: "The ZERO is the constraint. An empty list is legal input, and the three-pointer walk returns the right answer for it with no special case \u2014 prev starts as null and is returned immediately. Code that begins by reading head.next crashes on exactly this input, and it is the first thing to test.",
    figure: {
      kind: "cells",
      values: ["?"],
      caption:
        "the empty list. The loop body never runs and prev \u2014 still null \u2014 is the correct answer.",
    },
  },
  {
    constraint: "-5000 <= node value <= 5000",
    what: "The values are irrelevant to this problem and the bound is here to say so: reversing is a question about POINTERS, not about data. Nothing here compares values, which is why the same code reverses a list of anything \u2014 and why the copy-to-array rung, which moves values around instead of links, is answering a slightly different question.",
  },
  {
    constraint: "an empty list is legal input",
    what: "Stated twice, in the length bound and here, because it is the case people special-case unnecessarily. Alongside it, the single-node list: prev = null, curr = head, one iteration, and the node points at null \u2014 also correct with no branch. If you wrote a branch for either, the invariant was not trusted.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "The loop ends. What does the three-pointer walk return?",
    options: [
      "curr, which is now the last node",
      "prev, which heads the reversed list \u2014 curr is null",
      "head, which never changed",
      "next, the node after the current one",
    ],
    answer: 1,
    because:
      "The loop runs until curr is null, so returning curr returns null. prev has been dragging the reversed prefix along behind it the whole way, and it is the new head. Returning the wrong one of those two is the single most common bug here.",
  },
  {
    ask: "Why must nxt = curr.next be saved BEFORE curr.next is rewired?",
    options: [
      "For speed",
      "Because the rewire overwrites the only pointer to the rest of the list, which would then be unreachable",
      "Because curr.next may be null",
      "It does not have to be \u2014 order is free",
    ],
    answer: 1,
    because:
      "A singly linked list has exactly one reference to each node. Overwrite curr.next without saving it and the entire remainder of the list is orphaned \u2014 lost, in a language with garbage collection, and leaked in one without.",
  },
  {
    ask: "What does the caller\u2019s original head variable point at after an in-place reverse?",
    options: [
      "The new head",
      "The last node of the reversed list \u2014 it is stale",
      "Null",
      "It is unchanged and still correct",
    ],
    answer: 1,
    because:
      "The node that was first is now last. The caller must use the returned pointer; a function that reverses in place and returns nothing has handed back a list the caller can no longer find the front of.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Reverse a Linked List \u2014 NeetCode",
    href: "https://neetcode.io/problems/reverse-a-linked-list",
    kind: "course",
    note: "The pointer dance drawn frame by frame, which is the one part of this problem that genuinely needs a picture.",
  },
  {
    title: "Reverse a linked list \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/reverse-a-linked-list/",
    kind: "reference",
    note: "Iterative and recursive in four languages, plus the tail-recursive variant \u2014 useful for seeing that the recursion is the same rewiring with the stack holding prev.",
  },
]
