// rotate-array — approach 1 — One step at a time
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "one-step-at-a-time",
  title: "One step at a time",
  idea: `*What does "rotate by \`k\`" mean if you only know how to rotate by one?* Rotating by one is easy: take
the last value out, slide everything right by a single slot, drop the saved value into the front. Do
that \`k\` times. No index arithmetic, no wraparound formula, nothing to get backwards.`,
  intuition: `> **Intuition.** A line of people passing a parcel. Each round, the person at the end steps out
> holding their value, everyone else shuffles one place right, and the one who stepped out rejoins at
> the front. One round is an obviously-correct rotation by one, and \`k\` rounds is a rotation by \`k\`
> because rotations **compose**. That composition argument is the whole method, which is why it needs
> no insight — and it is also why it is slow: the value destined for slot 6 is dragged through slots
> 0 to 5 on the way there.`,
  worked: `\`nums = [1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\`, so \`k % n = 3\` and there are three rounds.

| round | value saved from the end | array after the shift and the drop |
|---|---|---|
| start | — | \`[1, 2, 3, 4, 5, 6, 7]\` |
| 1 | \`7\` | \`[7, 1, 2, 3, 4, 5, 6]\` |
| 2 | \`6\` | \`[6, 7, 1, 2, 3, 4, 5]\` |
| 3 | \`5\` | \`[5, 6, 7, 1, 2, 3, 4]\` |

Three rounds × seven slots = **21 writes** to move seven values. Watch the value \`1\`: it was written
at index 1, index 2 and index 3, and only the last was its destination.`,
  code: `def rotate_array_one_step(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    for _ in range(k % n):  # k % n first, or a huge k repeats whole turns for nothing
        last = nums[n - 1]
        for i in range(n - 1, 0, -1):  # backwards: read every slot before overwriting it
            nums[i] = nums[i - 1]
        nums[0] = last
    return nums`,
  mistake: `> **Watch out.** The misconception is that "copy each value from its left neighbour" describes the
> shift regardless of which way you walk. It does not. Walking **forwards** overwrites \`nums[i]\`
> before the next iteration reads it as \`nums[i - 1]\`, so the first value is smeared across the whole
> array. The rule: when shifting in place, walk **against** the direction of the shift.

Running the inner loop as \`for i in range(1, n)\` on \`[1, 2, 3, 4, 5, 6, 7]\` with \`k = 3\` gives,
measured:

\`\`\`
[7, 1, 1, 1, 1, 1, 1]
\`\`\`

A single round already destroys six of the seven values.

The second mistake on this rung is dropping \`% n\` from \`range(k % n)\`. It corrupts nothing — it just
performs \`k // n\` complete turns that do nothing, which at \`k = 10^5\` and \`n = 2\` is 50,000 wasted
full sweeps.`,
  cost: `**Time \`O(n · k)\`, space \`O(1)\`.** The time comes from the nesting: \`k % n\` rounds of \`n\` writes, so
the worst case is \`n · (n − 1)\` ≈ 10¹⁰ writes at the stated limits. That figure is analytic — the
stress harness runs this rung only at small \`n\`. Space is constant: one saved value and two counters.

Use it when \`k\` is known to be 1 or 2 and clarity beats everything. Otherwise it is the thirty-second
opening of an interview answer: state it, name its cost, then observe that a value's destination
never depended on the steps in between. That observation is the next rung.

---`,
}
