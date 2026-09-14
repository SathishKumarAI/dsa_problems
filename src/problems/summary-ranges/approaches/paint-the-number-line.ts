// summary-ranges — approach 1 — Paint the number line
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
  rung: "paint-the-number-line",
  title: "Paint the number line",
  idea: `*How do I find stretches of consecutive numbers?* Lay out the whole number line from the smallest
value to the largest, mark which numbers are present, then read the line from end to end — a
consecutive run is simply an unbroken stretch of marks. No cleverness at all, because the structure
is now visible rather than inferred.`,
  intuition: `> **Intuition.** A row of light bulbs, one per integer between the smallest and largest value. Switch
> on the bulbs for the numbers you were given, then walk the row from left to right: each unbroken
> stretch of lit bulbs is one range, and each gap of dark bulbs separates two ranges. The method
> refuses to reason about the data at all — it makes the answer physically visible and then reads it
> off. That refusal is exactly what it pays for, because the row has one bulb per **value**, not per
> number you were given.`,
  worked: `\`nums = [0, 2, 3, 4, 6, 8, 9]\`, so \`lo = 0\`, \`hi = 9\` and the line has ten slots.

| value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| \`present\` | on | off | on | on | on | off | on | off | on | on |

Now walk \`v\` from 0 to 9:

| \`v\` | lit? | action | \`out\` after |
|---|---|---|---|
| 0 | on | run starts at 0; 1 is dark, so it ends at 0 | \`["0"]\` |
| 1 | off | skip | \`["0"]\` |
| 2 | on | run starts at 2; walks through 3 and 4; 5 is dark | \`["0", "2->4"]\` |
| 5 | off | skip | \`["0", "2->4"]\` |
| 6 | on | run starts at 6; 7 is dark, so it ends at 6 | \`["0", "2->4", "6"]\` |
| 7 | off | skip | \`["0", "2->4", "6"]\` |
| 8 | on | run starts at 8; walks through 9; the line ends | \`["0", "2->4", "6", "8->9"]\` |

Ten slots examined to describe seven numbers. On this input the overhead is trivial. On
\`[1, 1000000000]\` the same walk examines a billion.`,
  code: `def summary_ranges_paint_line(nums: list[int], span_limit: int = 1 << 20) -> list[str]:
    if not nums:
        return []
    lo, hi = nums[0], nums[-1]
    if hi - lo + 1 > span_limit:  # the small-span assumption fails; fall back
        return summary_ranges_anchor_walk(nums)
    present = [False] * (hi - lo + 1)  # one slot per VALUE in the span, not per element
    for x in nums:
        present[x - lo] = True
    out: list[str] = []
    v = lo
    while v <= hi:
        if not present[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and present[v - lo]:
            v += 1
        out.append(format_range(start, v - 1))  # v overshot by one past the run
    return out`,
  codeNote: `**The assumption this rung needs, and what breaks without it.** It assumes \`hi - lo + 1\` is small
enough to allocate. This problem's constraints say it is not: with values spanning ±2³¹ the array
would need over four billion booleans. The version above measures the span and falls back to the
final rung when the assumption fails — honest engineering, and it means that on the problem as
literally stated this rung is the anchor walk in disguise. It is here because the *shape* recurs
constantly: the moment a problem bounds its values to a small range, painting the line is the
simplest correct thing you can write.`,
  mistake: `> **Watch out.** The misconception is that a span from \`lo\` to \`hi\` contains \`hi - lo\` values. It
> contains \`hi - lo + 1\` — both endpoints are included. This fencepost error is invisible until the
> largest value is written.

Allocating \`[False] * (hi - lo)\` on \`[0, 2, 3, 4, 6, 8, 9]\` gives, measured:

\`\`\`
IndexError: list assignment index out of range
\`\`\`

It fails on the marking pass, at \`x = 9\`, because index \`9 - 0\` needs a tenth slot in a nine-slot
array. In C++ the same array would not raise — it would write one past the end of the buffer.`,
  cost: `**Time \`O(hi - lo)\`, space \`O(hi - lo)\`.** Both costs follow the **span**, not the input length: the
marking pass is \`O(n)\` but the allocation and the reading walk both visit every value between the
extremes, whether or not it is present. That is the cost model to notice — it is the only rung whose
price is set by the numbers rather than by how many there are.

Use it when the values are genuinely dense and bounded — day-of-year numbers, port numbers, small ids
— where the line is short and the code is the simplest thing that can work. Reject it here on the
\`±2^31\` constraint, and say so out loud: naming a technique and correctly ruling it out on a
constraint is a stronger answer than not knowing it.

---`,
}
