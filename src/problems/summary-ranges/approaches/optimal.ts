// summary-ranges — approach 5 — One walk with an anchor (optimal)
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "One walk with an anchor (optimal)",
  idea: `*If a range can be written down the moment its break is seen, why keep the break positions at all?*
Remember only where the current run started, advance while the next value continues the chain, and
emit the instant it stops. Nothing survives the pass except one number.

This fixes Approach 4's weakness: **a second pass over a list of break positions that grows with the
number of runs.** The output is built in the same walk that finds the runs.`,
  intuition: `> **Intuition.** Drop an **anchor** at the start of a run, then drift forward while each next value is
> exactly one more than the current one. When the drift stops you are standing on the run's last
> value — the anchor and your feet are the two numbers the output needs, so write the range and pull
> the anchor up one step further along. The inner drift never revisits an index the outer walk has
> passed, so the two loops together touch each element exactly once. A lone value is a run whose
> drift moved zero steps, which is the whole of the bare-value rule.`,
  worked: `\`nums = [0, 2, 3, 4, 6, 8, 9]\`. The anchor's value is \`start\`; \`i\` drifts to the run's end.

| outer \`i\` | \`start\` | inner drift | \`i\` lands on | \`nums[i]\` | emitted | \`out\` after |
|---|---|---|---|---|---|---|
| 0 | \`0\` | \`nums[1] = 2\`, not \`1\` — no drift | 0 | \`0\` | \`start == nums[i]\`, bare | \`["0"]\` |
| 1 | \`2\` | \`3 == 3\`, \`4 == 4\`, then \`6 != 5\` | 3 | \`4\` | \`2 != 4\`, arrow | \`["0", "2->4"]\` |
| 4 | \`6\` | \`8 != 7\` — no drift | 4 | \`6\` | bare | \`["0", "2->4", "6"]\` |
| 5 | \`8\` | \`9 == 9\`, then \`i + 1\` is past the end | 6 | \`9\` | arrow | \`["0", "2->4", "6", "8->9"]\` |

After the last emit \`i\` becomes 7, the outer condition \`i < 7\` fails, and the walk ends. Each of the
seven indices was visited once, by either the anchor or the drift — never both.`,
  code: `def summary_ranges_anchor_walk(nums: list[int]) -> list[str]:
    out: list[str] = []
    n = len(nums)
    i = 0
    while i < n:
        start = nums[i]
        # drift along the chain of +1 steps; i lands on the run's last value
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        out.append(format_range(start, nums[i]))
        i += 1
    return out`,
  codeNote: `The empty array needs no guard: \`0 < 0\` is false, so the loop never runs and \`[]\` is returned.`,
  mistake: `> **Watch out.** The misconception is that a single-value run is a degenerate range and may be printed
> as one. The problem says otherwise: \`"6->6"\` is a **wrong answer**, not an ugly one. This is the
> whole reason \`format_range\` is a named helper rather than an inline f-string repeated five times.

Formatting unconditionally as \`f"{start}->{nums[i]}"\` gives, measured on \`[0, 2, 3, 4, 6, 8, 9]\`:

\`\`\`
['0->0', '2->4', '6->6', '8->9']
\`\`\`

The run boundaries are perfect and two of the four strings are wrong. It passes cleanly on any input
whose every run has length two or more — exactly the sort of input people invent when testing by hand
— and the statement's own second example, with its three lone values, exists to catch it.`,
  cost: `**Time \`O(n)\`, space \`O(1)\` beyond the output.** Time is one pass: the inner drift advances the same
\`i\` the outer loop uses, so no index is examined twice and the nesting is not a multiplication. Space
is a single \`start\` value and an index, regardless of how many runs there are — the output list is
required by the problem and is not counted against the algorithm.

This is the rung to write. It is the shortest of the five, needing no allocation, no key, no second
pass and no empty-array guard, and its shape — **anchor, drift, emit on the break** — is the engine
behind merge-intervals, remove-duplicates-from-sorted-array and every other "collapse adjacent things
that belong together" problem.

---`,
}
