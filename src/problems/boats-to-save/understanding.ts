// boats-to-save — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `A crowd of people is waiting on a shore. Each of them has a weight. You have as many identical boats
as you like, but every boat is the same: it seats **at most two people**, and the two weights it
carries must add up to no more than a shared \`limit\`. Everybody has to get across. Return the
smallest number of boats that achieves it.

**The core question:** who should share a boat with whom? The naive approach is slow because it
treats that as a question about *groups* — it asks which of the enormously many ways to carve the
crowd into boatloads is best, and the number of ways to carve a crowd doubles every time one more
person joins it.

The one thing the constraints do *not* say: nothing promises the weights arrive sorted, and nothing
promises they are distinct. \`[2, 2, 2, 2]\` is a perfectly legal crowd, and a solution that assumes
distinct weights or an ordered input will be wrong on it.

The worked example used in every section below is the statement's second one:

\`\`\`
people = [3, 2, 2, 1], limit = 3        answer: 3
\`\`\`

Sorted, that crowd is \`[1, 2, 2, 3]\`. The 3 sails alone (nothing else fits beside it), the 1 rides
with a 2, and the remaining 2 sails alone.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= people.length <= 5 * 10^4`",
        "what": "Fifty thousand people. **This is the constraint that kills the exact search**: a table over every subset of the crowd needs 2⁵⁰⁰⁰⁰ entries, a number with fifteen thousand digits. It also rules out `O(n²)`: 2.5 × 10⁹ operations is minutes, not milliseconds. `O(n log n)` is comfortable, and `O(n)` after a sort is what you want."
    },
    {
        "constraint": "`1 <= people[i] <= limit`",
        "what": "Nobody is heavier than a boat can carry, so **a one-person boat always exists** and the answer is never \"impossible\". This is quietly load-bearing: it means the answer is always between ⌈n/2⌉ and n, and it means no approach has to handle a failure case."
    },
    {
        "constraint": "`limit <= 3 * 10^4`",
        "what": "Weights are small positive whole numbers. **This is the constraint that unlocks the bucket rung** — you can afford one counter per possible weight, which replaces comparing weights with indexing them. It is also the constraint that makes that rung a trap, because the table is sized by the *limit*, not by the crowd."
    },
    {
        "constraint": "a boat holds at most **two** people",
        "what": "**This is the constraint the entire greedy rests on.** Allow three per boat and this becomes bin packing, which is NP-hard and has no simple greedy answer. With exactly two seats, a boatload is a *pair*, and a pairing question can be settled one person at a time from the extremes."
    },
    {
        "constraint": "everyone must be carried",
        "what": "The count is over the whole crowd, not a chosen subset. There is nothing to select and nothing to skip — only to arrange."
    }
]
