// subarray-sum-k — approach 4 — Prefix sums in a counting map (optimal)
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "counts",
  title: "Prefix sums in a counting map (optimal)",
  idea: `*The pairwise rung found every answer by looking for two boundaries with the same reading — can that
search be replaced by a lookup?* Yes. Walk the array once carrying the running total; at each
boundary the question "how many earlier boundaries read \`running - k\`?" is answered instantly by a
map from reading to *how many times it has occurred*.

This fixes the pairwise rung's remaining n²: the inner scan over earlier boundaries becomes one
dictionary lookup. And it works with negatives because nothing in it assumes any direction of
movement.`,
  intuition: `> **Intuition.** Carry a tally book. Every time you pass a boundary you write down the running
> total you are standing on, and if that total has appeared before you add a tick beside it rather
> than a new line — several boundaries really can carry the same reading, and each one starts a
> different valid subarray. Before writing today's total down, you look up one number in the book:
> \`running - k\`. However many ticks sit beside it is how many answers end right here. You are no
> longer hunting for subarrays at all; you are asking a membership question about numbers you have
> already written.

Two details make it correct. The book starts with **\`{0: 1}\`** — the empty prefix, before any
element, has total zero and has occurred once. And you look up *before* recording the current total,
so the subarray you count always holds at least one element.

> **Why it works.** The invariant is that \`seen\` holds, for each value \`v\`, how many boundaries
> **strictly before the current index** had running total \`v\`. A subarray ending here sums to \`k\`
> exactly when its starting boundary read \`running - k\`, so the tally beside that key is exactly
> the number of subarrays ending here — no more, no less. Recording after the lookup is what keeps
> "strictly before" true, which is what forbids the zero-length subarray. Notice that no step in
> this argument mentions growing, shrinking, or the sign of anything, which is why negatives cost
> it nothing.`,
  worked: `\`nums = [1, -1, 0]\`, \`k = 0\`.

| Step | value | \`running\` | looking for \`running - k\` | \`seen\` *before* the lookup | found | \`total\` | \`seen\` *after* recording |
|---|---|---|---|---|---|---|---|
| 0 | — | 0 | — | \`{0: 1}\` | — | 0 | \`{0: 1}\` (the seed) |
| 1 | 1 | 1 | 1 − 0 = 1 | \`{0: 1}\` | 0 times | 0 | \`{0: 1, 1: 1}\` |
| 2 | −1 | 0 | 0 | \`{0: 1, 1: 1}\` | **1 time** | 1 | \`{0: 2, 1: 1}\` |
| 3 | 0 | 0 | 0 | \`{0: 2, 1: 1}\` | **2 times** | **3** | \`{0: 3, 1: 1}\` |

Three steps, three lookups, answer 3. Step 3 is the one to stare at: a single lookup contributed
**two** answers at once, because two earlier boundaries — the phantom one before the array, and the
one after \`[1, -1]\` — both read 0. The brute force needed two separate walks to find those same two
subarrays. That is where the quadratic went.`,
  code: `def subarray_sum_k_prefix_count_map(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}  # the empty prefix has sum 0 and has occurred once
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)  # look up BEFORE recording, so length >= 1
        seen[running] = seen.get(running, 0) + 1
    return total`,
  mistake: `> **Watch out.** The misconception is that \`seen = {}\` is the neutral starting point and \`{0: 1}\`
> is a special case bolted on for an edge condition. It is the opposite: the map is a tally of
> *prefix sums that have occurred*, the **empty prefix** is a prefix, its sum is zero, and it has
> occurred exactly once before the loop begins. Seeding it is not a patch, it is the definition.

Start the map empty and every subarray beginning at index 0 goes missing, because the boundary
*before* the first element was never written down and can never be found. On this example the count
drops from 3 to **1** — both answers starting at index 0 vanish and only \`[0]\` survives. On
\`nums = [2, 3, -3, 4]\`, \`k = 5\` it is starker: the only answer is \`[2, 3]\`, it starts at index 0, and
the unseeded version returns **0** for an array that plainly has one.

A close cousin is recording the current total *before* the lookup, which lets a boundary match itself
and counts a zero-length subarray whenever \`k = 0\` — on \`[0, 0, 0]\`, \`k = 0\` that inflates 6 to **9**.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. One pass, with a constant-expected-time lookup and insert per
element. The space is the map, which in the worst case holds a distinct reading for every boundary —
an array of all-distinct running totals, such as any array of positive numbers, is exactly that case.

This is the answer to ship. It is the only rung here that is both linear and correct in the presence
of negatives, and the constraints point at it from three directions at once: twenty thousand
elements, values that may be negative, a count rather than a list as the output.

The pattern generalises widely. Swap the counting map for a map of *first index* and you get
"longest subarray summing to \`k\`"; take the running total modulo \`m\` and you count subarrays
divisible by \`m\`; replace the sum with a running XOR and you count subarrays with a given XOR. The
shape is always the same — turn a question about ranges into a question about how often a running
value has been seen.

---`,
}
