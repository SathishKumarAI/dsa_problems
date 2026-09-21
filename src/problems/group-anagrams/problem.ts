// group-anagrams — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example, Problem } from "../../data/types.ts"

export const id = "group-anagrams"

export const title = "Group the Anagrams Together"

export const pattern = "arrays-hashing"

export const difficulty: Difficulty = "medium"

export const leetcode = "group-anagrams"

export const brief = "Bucket words that are rearrangements of each other."

export const statement =
  "Given a list of lowercase words, group together the ones that are rearrangements of each other. Return the groups, each group sorted, and the groups themselves in sorted order so the answer is unambiguous."

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

// THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md).

export const unlocks: NonNullable<Problem["unlocks"]> = [
  {
    constraint: "1 <= words.length <= 10^4",
    what: "Ten thousand words. Comparing every word against every other is 5\u00b710\u2077 comparisons \u2014 and each one is not a single operation but a whole anagram test over two words, which is what makes the quadratic rung genuinely expensive rather than merely inelegant.",
    figure: {
      kind: "quantities",
      unit: "ops",
      items: [
        { label: "every pair, each an anagram test", value: 5e9, tone: "bad" },
        { label: "one key per word", value: 1e4, tone: "good" },
      ],
    },
  },
  {
    constraint: "0 <= words[i].length <= 100, lowercase English letters",
    what: "Two facts that decide the shape of the key. Words are SHORT \u2014 at most 100 characters \u2014 so sorting one is 100 log 100, a constant this problem can afford n times over. And the alphabet is fixed at 26, which is what makes the count-tuple key possible: a 26-slot tally is a canonical form built in O(k) instead of O(k log k).",
    figure: {
      kind: "quantities",
      items: [
        { label: "sorting one word, k = 100", value: 700, tone: "plain" },
        { label: "tallying one word, k = 100", value: 100, tone: "good" },
      ],
    },
  },
  {
    constraint:
      "the empty string is a legal word, and all empty strings belong to one group",
    what: "The base case that breaks a first draft. An empty word has an empty sorted form and an all-zero tally, both perfectly valid keys \u2014 so the correct behaviour falls out for free IF the code keys every word rather than special-casing short ones. It is here to be TESTED, not handled.",
    figure: {
      kind: "cells",
      values: ["?"],
      caption:
        "the empty word. Its key is the empty key, which is why all empty words land in one group with no special case.",
    },
  },
  {
    constraint:
      "the answer here is sorted inside each group and between groups, so there is exactly one correct output",
    what: "A promise this site makes and LeetCode does not: there, any order counts, which means a solution can be right on the judge and non-deterministic on your machine. Pinning the order makes the output comparable \u2014 a test can assert equality instead of set-equality \u2014 and costs one sort at the end, which the bound below accounts for.",
  },
]

export const checks: NonNullable<Problem["checks"]> = [
  {
    ask: "When do two words belong in the same group?",
    options: [
      "they share the same set of letters",
      "they use the same letters the same number of times",
      "they have the same length",
      "one is a rotation of the other",
    ],
    answer: 1,
    because:
      'Anagram means the same multiset of letters. "aab" and "abb" share a set and a length and are not anagrams \u2014 which is exactly the case a set-based or length-based key gets wrong.',
  },
  {
    ask: "What is a canonical KEY, in this problem?",
    options: [
      "A number that is unique to each word",
      "A value that is identical for anagrams and different for non-anagrams",
      "The first letter of the word",
      "The word itself, lowercased",
    ],
    answer: 1,
    because:
      "Grouping by a key works only when the key collapses exactly the distinction you want to ignore \u2014 order \u2014 and preserves everything else. Sorted letters and a 26-count tally both do; a length or a letter-set does not.",
  },
  {
    ask: 'words = ["", ""]. What should the answer be?',
    options: [
      "[] \u2014 empty words are skipped",
      '[[""], [""]] \u2014 each empty word is its own group',
      '[["", ""]] \u2014 one group holding both',
      "An error \u2014 the input is invalid",
    ],
    answer: 2,
    because:
      "The constraints say the empty string is legal and all empty strings belong to one group. Any keying scheme that treats the empty word like every other word gets this right without a special case, which is why it is worth running rather than reasoning about.",
  },
]

export const reading: NonNullable<Problem["reading"]> = [
  {
    title: "Anagram Groups \u2014 NeetCode",
    href: "https://neetcode.io/problems/anagram-groups",
    kind: "course",
    note: "Both keys on video \u2014 sorted string and count tuple \u2014 with the k log k against k trade said out loud.",
  },
  {
    title: "Print all anagrams together \u2014 GeeksforGeeks",
    href: "https://www.geeksforgeeks.org/dsa/given-a-sequence-of-words-print-all-anagrams-together/",
    kind: "reference",
    note: "Several more key designs for the same grouping, including the prime-product trick and why it overflows on longer words.",
  },
  {
    title: "Python: dict, and what may be a key",
    href: "https://docs.python.org/3/library/stdtypes.html#dict",
    kind: "docs",
    note: "Why the count key has to be a TUPLE rather than a list: keys must be hashable, and a list is not.",
  },
]
