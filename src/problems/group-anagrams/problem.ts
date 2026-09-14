// group-anagrams — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "group-anagrams"

export const title = "Group the Anagrams Together"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "group-anagrams"

export const brief = "Bucket words that are rearrangements of each other."

export const statement = "Given a list of lowercase words, group together the ones that are rearrangements of each other. Return the groups, each group sorted, and the groups themselves in sorted order so the answer is unambiguous."

export const constraints: string[] = [
  "1 <= words.length <= 10^4",
  "0 <= words[i].length <= 100, lowercase English letters",
  "the empty string is a legal word, and all empty strings belong to one group",
  "the answer here is sorted inside each group and between groups, so there is exactly one correct output",
]

export const examples: Example[] = [
  {
    input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
    output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]',
  },
  {
    input: 'words = [""]',
    output: '[[""]]',
    note: "The empty string groups with itself.",
  },
]
