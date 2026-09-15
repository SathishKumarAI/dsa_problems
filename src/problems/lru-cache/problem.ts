// lru-cache — what the problem IS, before any answer to it.
//
// Owns no algorithm (`solutions.ts`) and no nudges (`hints.ts`).

import type { Difficulty, Example } from "../../data/types.ts"

export const id = "lru-cache"

export const title = "Evict Whoever Has Waited Longest"

export const pattern = "design"

export const difficulty: Difficulty = "medium"

export const leetcode = "lru-cache"

export const brief = "A fixed-size key-value store where a get counts as use, and the least recently used key is dropped."

export const statement = "Design a cache with a fixed capacity supporting get and put in constant time. A get on a missing key returns -1; a get on a present key returns its value AND counts as a use. A put on a new key evicts the least recently used entry when the cache is full, and a put on an existing key updates it and also counts as a use."

export const constraints: string[] = [
  "1 <= capacity <= 3000 and up to 2 * 10^5 calls, so both operations really do have to be constant",
  "0 <= key <= 10^4 and 0 <= value <= 10^5, and a miss is reported as -1 — a value the data itself never takes",
  "a successful GET counts as a use, which is the rule most first attempts drop and the reason a plain insertion-ordered map is not enough on its own",
  "a put on an existing key updates the value and refreshes its recency; it never evicts",
  "eviction happens only when a NEW key arrives at full capacity, and it removes exactly one entry",
]

export const examples: Example[] = [
  {
    input: "capacity 2: put(1,1), put(2,2), get(1), put(3,3), get(2)",
    output: "1, -1",
    note: "get(1) refreshed key 1, so key 2 was the least recently used when 3 arrived.",
  },
  {
    input: "capacity 1: put(1,1), put(2,2), get(1)",
    output: "-1",
    note: "Capacity one evicts on every new key. The smallest cache is the one that exposes an off-by-one in the eviction test.",
  },
  {
    input: "capacity 2: put(1,1), put(2,2), put(1,9), put(3,3), get(1)",
    output: "9",
    note: "Updating key 1 also refreshed it, so key 2 was evicted rather than key 1.",
  },
]
