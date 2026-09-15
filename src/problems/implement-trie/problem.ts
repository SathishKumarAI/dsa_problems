// implement-trie — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "implement-trie"

export const title = "A Tree Whose Paths Spell Words"

export const pattern = "trie"

export const difficulty: Difficulty = "medium"

export const leetcode = "implement-trie-prefix-tree"

export const brief = "insert, search and startsWith, each costing the length of the word and nothing else."

export const statement = "Implement a prefix tree supporting insert(word), search(word) — true only for a whole word that was inserted — and startsWith(prefix), true when any inserted word begins with it. The point of the structure is in the gap between those last two: telling a complete word apart from a path that merely exists is the one thing a naive tree of characters cannot do."

export const constraints: string[] = [
  "1 <= word.length <= 2000 and up to 3 * 10^4 calls, so every operation must cost the length of its own argument and not the size of the dictionary",
  "words are lowercase English letters only, which is what makes a 26-way branch reasonable",
  "inserting \"apple\" must NOT make search(\"app\") true, while startsWith(\"app\") is true — the flag on the node is the entire difference",
  "the same word may be inserted twice, and the second insert must change nothing observable",
  "searching for a word longer than anything inserted must fail at the first missing child rather than run off the end",
]

export const examples: Example[] = [
  {
    input: "insert(\"apple\"), search(\"apple\"), search(\"app\"), startsWith(\"app\")",
    output: "true, false, true",
    note: "The three answers differ for one dictionary, which is exactly the behaviour being asked for.",
  },
  {
    input: "insert(\"app\"), search(\"app\")",
    output: "true",
    note: "Once app is inserted in its own right, the node that was only a waypoint becomes a word.",
  },
  {
    input: "insert(\"a\"), startsWith(\"ab\")",
    output: "false",
    note: "The walk runs out of children partway. Nothing may assume the path exists for the whole prefix.",
  },
]
