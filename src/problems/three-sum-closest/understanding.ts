// three-sum-closest — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You have a list of whole numbers and one more number, the **target**. Pick three of the list's
entries — three different positions, though the values at them may be equal — and add them. Out of
every triple you could have picked, return the sum that lands **nearest** the target. You return the
sum, not the three numbers.

**The core question: which triple's sum is closest to the target?** The naive approach is slow because
it answers that by forming every triple there is — \`n(n−1)(n−2)/6\` of them — and each one is only
three additions, so the work grows with the cube of the list's length.

### The misconception: "this is 3Sum"

It looks like 3Sum and the same two-pointer engine drives it, so the reflex is to reuse 3Sum's code.
Two things are different, and both of them bite.

| | 3Sum | **3Sum Closest** |
|---|---|---|
| What you are looking for | every triple summing to **exactly** 0 | the **single best** sum, exact or not |
| When a sum equals the target | record it, then skip past duplicates to avoid repeating the triple | nothing can beat distance \`0\` — **return immediately** |
| How the pointers move | \`s < 0\` → \`lo++\`, \`s > 0\` → \`hi--\`, \`s == 0\` → *both* move and duplicates are skipped | move by the **sign of the difference** only; there is no exact hit to step past |
| Duplicate values | must be skipped, or the answer contains the same triple twice | cost nothing but time — you return one number, not a set |
| What the loop carries | the output list | a separate **\`best\`**, updated on every single sum |

> **Watch out.** The thing you were about to think is *"I'll just adapt 3Sum's skip-the-duplicates
> loop."* Do not. Those skips exist to stop a *set-shaped answer* repeating itself, and this answer is
> a single integer. Porting them in adds code that can only introduce bugs — and porting in 3Sum's
> \`while lo < hi and nums[lo] == nums[lo+1]: lo += 1\` can skip past the very pair that was closest.

The second difference is the structural one: because there is no exact hit to anchor on, **the best
answer has to be tracked separately** in a variable that survives the whole scan. Every rung below
shares that variable and shares one rule for updating it.

### The tie-break, and why the document pins it down

When two triples are equally close, this document (and every rung in it) returns **the smaller sum**.
LeetCode promises the input has a unique answer, so on the judge the rule never fires. It is pinned
here for a concrete reason: five implementations visit triples in five different orders, and they can
only be cross-checked against each other if they break ties identically. The rule is lifted into one
helper, \`better\`, used by all five.

\`\`\`python
def better(candidate: int, best: int, target: int) -> int:
    """Closest to target wins; ties go to the SMALLER sum."""
    d, bd = abs(candidate - target), abs(best - target)
    return candidate if (d < bd or (d == bd and candidate < best)) else best
\`\`\`

The statement's second example is exactly this case: \`nums = [-2, 0, 1, 3]\`, \`target = 0\`. The sums
\`-1\` and \`1\` are both one away, and the answer is \`-1\`.

### The worked example, used in every section below

\`\`\`
nums = [-1, 2, 1, -4],  target = 1        answer: 2
sorted:  [-4, -1, 1, 2]
\`\`\`

Only four triples exist, so every rung can be traced to the last step:

| triple | sum | distance from 1 |
|---|---|---|
| \`(-1, 2, 1)\` | **2** | **1** ← the answer |
| \`(-1, 2, -4)\` | −3 | 4 |
| \`(-1, 1, -4)\` | −4 | 5 |
| \`(2, 1, -4)\` | −1 | 2 |

Note the first rung works on the array **unsorted** and every later rung sorts it. They still agree,
because \`better\` does not care what order candidates arrive in.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`3 <= nums.length <= 500`",
    "what": "A triple always exists, so **there is no no-answer case** and `best` can be seeded with the first legal triple rather than an infinity sentinel. `500³/6` is about `2 × 10^7` — the cubic rung is slow but survivable, which is why it makes a usable reference."
  },
  {
    "constraint": "`-1000 <= nums[i] <= 1000`, `-10^4 <= target <= 10^4`",
    "what": "A triple sum lies in `[-3000, 3000]` and fits a 32-bit `int` with room to spare, so **no overflow handling is needed** even in Java or C++."
  },
  {
    "constraint": "the three **positions** must be distinct; **values may repeat**",
    "what": "`[0, 0, 0]` is legal input and its only triple is the answer. This is the permission slip for *not* writing duplicate-skipping code — and the trap for anyone who ports it from 3Sum."
  },
  {
    "constraint": "nothing says the array is **sorted**",
    "what": "**The permission slip for every rung after the first.** Sorting is not given; it is bought, for `O(n log n)`. What it buys is a *direction*: in a sorted array, \"the sum is too small\" has an unambiguous fix. Every optimisation below descends from that one fact."
  },
  {
    "constraint": "ties are broken toward the smaller sum",
    "what": "Makes five differently-ordered scans comparable. On the judge, the promised-unique answer means it never fires."
  }
]
