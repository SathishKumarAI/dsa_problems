// summary-ranges — approach 4 — Collect the break points
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
  rung: "collect-the-break-points",
  title: "Collect the break points",
  idea: `*If only the first and last value of each run reach the output, why store the middles?* Record the
positions where the chain breaks, then pair consecutive break points into ranges. One number per run
instead of one per element.

This fixes Approach 3's weakness: **it copies every element into a run list when only the ends are
ever read.**`,
  intuition: `> **Intuition.** Think of the array as a ribbon and the gaps as places to cut. One pass finds the cut
> points — the indices after which the chain does not continue — and the last index is always a cut,
> because the ribbon ends there. Each piece is then described by where the previous cut left off and
> where this cut lands. Nothing about the values inside a piece matters, so nothing about them is
> stored.`,
  worked: `\`nums = [0, 2, 3, 4, 6, 8, 9]\`. First pass, looking for \`nums[i] + 1 != nums[i + 1]\`:

| \`i\` | \`nums[i]\` | \`nums[i + 1]\` | chain breaks? | \`ends\` after |
|---|---|---|---|---|
| 0 | \`0\` | \`2\` | \`1 != 2\` — yes | \`[0]\` |
| 1 | \`2\` | \`3\` | \`3 == 3\` — no | \`[0]\` |
| 2 | \`3\` | \`4\` | \`4 == 4\` — no | \`[0]\` |
| 3 | \`4\` | \`6\` | \`5 != 6\` — yes | \`[0, 3]\` |
| 4 | \`6\` | \`8\` | \`7 != 8\` — yes | \`[0, 3, 4]\` |
| 5 | \`8\` | \`9\` | \`9 == 9\` — no | \`[0, 3, 4]\` |

Then append the final index, 6, because the last run ends there with no gap to announce it:
\`ends = [0, 3, 4, 6]\`. The second pass pairs each break with the position after the previous one:

| \`b\` | \`start\` | \`nums[start]\` | \`nums[b]\` | emitted | next \`start\` |
|---|---|---|---|---|---|
| 0 | 0 | \`0\` | \`0\` | \`"0"\` | 1 |
| 3 | 1 | \`2\` | \`4\` | \`"2->4"\` | 4 |
| 4 | 4 | \`6\` | \`6\` | \`"6"\` | 5 |
| 6 | 5 | \`8\` | \`9\` | \`"8->9"\` | 7 |`,
  code: `def summary_ranges_break_points(nums: list[int]) -> list[str]:
    if not nums:
        return []
    ends = [i for i in range(len(nums) - 1) if nums[i] + 1 != nums[i + 1]]
    ends.append(len(nums) - 1)  # the last run always ends at the last index
    out: list[str] = []
    start = 0
    for b in ends:
        out.append(format_range(nums[start], nums[b]))
        start = b + 1
    return out`,
  mistake: `> **Watch out.** The misconception is that "a run ends where the chain breaks" is the complete rule.
> The **final** run does not end at a break — it ends because the array does. Nothing after it
> announces it, so it must be appended by hand.

Omitting \`ends.append(len(nums) - 1)\` gives, measured on \`[0, 2, 3, 4, 6, 8, 9]\`:

\`\`\`
['0', '2->4', '6']
\`\`\`

Three ranges instead of four: \`"8->9"\` is simply gone. Every emitted range is correct, the count is
plausible, and the values are in order — nothing about the output looks damaged, which is why this
omission survives a visual check. The habit worth taking away: whenever a loop emits on a
**transition**, ask what flushes the last group.`,
  cost: `**Time \`O(n)\`, space \`O(k)\` for \`k\` runs.** Time is two linear passes: one comparing neighbours, one
walking the break list, which is at most \`n\` long. Space is one integer per run rather than one per
element — strictly better than Approach 3, and the reason this rung exists.

Use it when the break positions themselves are the answer: "how many runs", "where does the third run
start", "split this array at its discontinuities" all fall straight out of \`ends\`. For this problem
it still makes two passes over a list that must survive the first, which is exactly what the last
rung removes.

---`,
}
