// window-maximum — approach 1 — Scan each window from scratch
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "scan",
  title: "Scan each window from scratch",
  idea: `*What is the largest number in this window?* Look at all \`k\` of them and keep the biggest. Do that once
per window position. No state carries over, so there is nothing that can go stale.`,
  intuition: `> **Intuition.** You are reading the numbers through the slot with a finger, left to right, remembering
> the biggest you have seen. Then you slide the strip one place, put your finger back at the left edge,
> and read all \`k\` of them again — including the \`k - 1\` you read a second ago and whose values have not
> changed. The method has no memory at all, and that is simultaneously why it is trivially correct and
> why it is slow.`,
  worked: `\`nums = [1, 3, -1, -3, 5, 3, 6, 7]\`, \`k = 3\`. State per window position:

| \`start\` | window | values read | maximum | output so far |
|---|---|---|---|---|
| 0 | \`0..2\` | \`1, 3, -1\` | **3** | \`[3]\` |
| 1 | \`1..3\` | \`3, -1, -3\` | **3** | \`[3, 3]\` |
| 2 | \`2..4\` | \`-1, -3, 5\` | **5** | \`[3, 3, 5]\` |
| 3 | \`3..5\` | \`-3, 5, 3\` | **5** | \`[3, 3, 5, 5]\` |
| 4 | \`4..6\` | \`5, 3, 6\` | **6** | \`[3, 3, 5, 5, 6]\` |
| 5 | \`5..7\` | \`3, 6, 7\` | **7** | \`[3, 3, 5, 5, 6, 7]\` |

Measured: **18 element reads** for an array of 8 — six windows at three reads each. The value \`5\` is
read three times, at window starts 2, 3 and 4.`,
  code: `def window_maximum_scan_each_window(nums: list[int], k: int) -> list[int]:
    out: list[int] = []
    for start in range(len(nums) - k + 1):
        best = nums[start]
        for i in range(start, start + k):  # re-reads k - 1 values it saw last step
            if nums[i] > best:
                best = nums[i]
        out.append(best)
    return out`,
  mistake: `> **Watch out.** Writing the outer loop as \`range(len(nums) - k)\` instead of \`range(len(nums) - k + 1)\`.
> The misconception is counting *gaps* when the question counts **positions**: a window of width \`k\` in
> an array of length \`n\` has \`n - k + 1\` placements, not \`n - k\`, because both the first and the last
> placement are real. Measured on the statement's example it returns \`[3, 3, 5, 5, 6]\` — five values
> where six are required, silently dropping the final window. The degenerate cases make it obvious:
> \`nums = [4, 2, 1], k = 3\` returns \`[]\` instead of \`[4]\`, and \`nums = [5], k = 1\` returns \`[]\` instead
> of \`[5]\`. If your output is one short, this is why.`,
  cost: `**Time \`O(n · k)\`.** One scan of \`k\` values for each of the \`n - k + 1\` positions; the cost is entirely
the re-reading, since \`k - 1\` of each scan's values were in the previous window too.

**Space \`O(1)\`.** Nothing is stored but the running maximum and the output.

Genuinely the right choice when \`k\` is small and fixed — at \`k = 3\` this is three comparisons per output
with no allocation, and it will beat a deque on real hardware. It is also the oracle in the test suite
below. State it and price it in an interview, then say which part of it you intend to remove.

---`,
}
