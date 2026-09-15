// boats-to-save — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`), no nudges (`hints.ts`) and no teaching
// prose (`doc.ts` and its parts).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "boats-to-save"

export const title = "Fewest Boats for Everyone"

export const pattern = "two-pointers"

export const difficulty: Difficulty = "medium"

export const leetcode = "boats-to-save-people"

export const brief = "Every boat seats two and has a weight limit. How few boats carry everyone?"

export const statement = "Each person has a weight, and every boat carries at most two people whose weights together do not exceed a shared limit. Return the smallest number of boats that gets everybody across."

export const constraints: string[] = [
  "1 <= people.length <= 5 * 10^4",
  "1 <= people[i] <= limit <= 3 * 10^4 — nobody is heavier than a boat can carry, so a one-person boat always exists and the answer is never impossible",
  "a boat holds at most TWO people, which is what makes this a pairing question rather than a bin-packing one",
  "everyone must be carried, so the count is over all the people, not a chosen subset",
  "the heaviest person's boat is the decision that matters: either somebody rides with them or a seat sails empty",
]

export const examples: Example[] = [
  { input: "people = [1, 2], limit = 3", output: "1" },
  {
    input: "people = [3, 2, 2, 1], limit = 3",
    output: "3",
    note: "The 3 sails alone, 1 rides with a 2, and the other 2 sails alone. Pairing greedily from the light end instead would strand the 3 and cost the same or more.",
  },
  {
    input: "people = [3, 5, 3, 4], limit = 5",
    output: "4",
    note: "The trap: nobody can share with anybody, so every seat but one sails empty. A solution that assumes pairs are usually available still has to count these correctly.",
  },
]
