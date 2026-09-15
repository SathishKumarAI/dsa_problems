// replace-words — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "replace-words"

export const title = "Swap Each Word for Its Shortest Root"

export const pattern = "trie"

export const difficulty: Difficulty = "medium"

export const leetcode = "replace-words"

export const brief = "Given a list of roots, replace every word in a sentence by the shortest root that starts it."

export const statement = "You are given a dictionary of roots and a sentence of space-separated words. Replace every word that has a root as a prefix with that root — and when several roots apply, with the SHORTEST one. Words with no matching root are left alone. The shortest-root rule is what makes a trie the natural answer: walking from the root, the first flagged node you reach is by construction the shortest match."

export const constraints: string[] = [
  "1 <= dictionary.length <= 1000 and the sentence holds up to 1000 words, so comparing every root against every word is a million string comparisons",
  "roots and words are lowercase letters only, 1 to 100 characters each",
  "when several roots are prefixes of one word the SHORTEST wins, which a hash-set solution has to enforce by trying lengths in order",
  "a word that is exactly a root is replaced by itself, so equality counts as a prefix match",
  "the output keeps the original word order and single spaces — this is a transformation of the sentence, not a set of replacements",
]

export const examples: Example[] = [
  {
    input: "dictionary = [\"cat\",\"bat\",\"rat\"], sentence = \"the cattle was rattled by the battery\"",
    output: "\"the cat was rat by the bat\"",
    note: "Three words match roots; the others pass through untouched.",
  },
  {
    input: "dictionary = [\"a\",\"aa\",\"aaa\"], sentence = \"a aa aaa aaaa\"",
    output: "\"a a a a\"",
    note: "Every word has three applicable roots and the shortest must win each time.",
  },
  {
    input: "dictionary = [\"cat\"], sentence = \"dog cow\"",
    output: "\"dog cow\"",
    note: "No match means the word survives whole — the walk has to distinguish falling off the trie from arriving at a root.",
  },
]
