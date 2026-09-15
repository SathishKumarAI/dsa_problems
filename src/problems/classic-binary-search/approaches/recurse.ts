// classic-binary-search — approach 2 — Halve it, recursively
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recurse",
  title: "Halve it, recursively",
  idea: `*The scan learns one element per comparison — can one comparison rule out many?* Yes, and sortedness
is what makes it legal. Compare the target against the middle element: if the middle is too small,
everything from the middle leftwards is also too small and can be deleted in one stroke. Then solve
the same problem on what is left, which is what recursion is for.

This fixes the scan's central weakness — **it spends a comparison to eliminate one candidate when
the ordering entitles it to eliminate half of them.**`,
  intuition: `> **Intuition.** Guess-the-number, played properly. Someone is thinking of a number between 1 and
> 1000 and answers "higher" or "lower". You do not start at 1. You say 500, and whichever answer you
> get, 500 numbers just died. The array is the same game with the answers written down in advance:
> \`nums[mid]\` versus the target *is* the "higher or lower", and the half it condemns never needs to
> be read. Recursion is just the honest spelling of "now play the same game on what is left" — the
> subproblem is literally the same problem on a smaller range.

> **Why it works.** The invariant is: **if the target is present at all, its index is in
> \`[lo, hi]\`.** It starts true because the range is the whole array. Each step preserves it. If
> \`nums[mid] < target\`, then for every index \`i <= mid\` sortedness gives \`nums[i] <= nums[mid] <
> target\`, so **no index at or left of \`mid\` can hold the target** — discarding \`[lo, mid]\` cannot
> discard the answer. The mirror argument covers \`nums[mid] > target\`. When \`lo > hi\` the range is
> empty, the invariant says the target's index is in an empty set, and therefore the target is
> absent.`,
  worked: `\`nums = [-3, 0, 4, 9, 12]\`. Each row is one call; the range shown is what that call was handed.

| target | call | \`lo\` | \`hi\` | \`mid\` | \`nums[mid]\` | verdict | next call |
|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | 2 | \`4\` | \`4 < 9\` — left half dies | \`go(3, 4)\` |
| | 2 | 3 | 4 | 3 | \`9\` | **hit** | **return 3** |
| **2** | 1 | 0 | 4 | 2 | \`4\` | \`4 > 2\` — right half dies | \`go(0, 1)\` |
| | 2 | 0 | 1 | 0 | \`-3\` | \`-3 < 2\` — left half dies | \`go(1, 1)\` |
| | 3 | 1 | 1 | 1 | \`0\` | \`0 < 2\` — left half dies | \`go(2, 1)\` |
| | 4 | 2 | 1 | — | — | \`lo > hi\`, range empty | **return −1** |

Two calls for the hit, four for the miss. Row 4 is the important one and the one people forget
exists: a call whose range is **empty**, \`lo\` one past \`hi\`. That is not an error state, it is the
answer.`,
  code: `def classic_binary_search_recursive(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:  # the range is empty: the invariant now says "absent"
            return -1
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)`,
  codeNote: `\`midpoint\` is the shared helper declared once at the top of the full script:

That helper is the "one obvious place to edit" for the midpoint rule, and every approach in this
document calls it. **Contract used: inclusive \`[lo, hi]\`, \`while\`-equivalent test \`lo > hi\` as the
base case, both moves \`mid ± 1\`.**`,
  mistake: `> **Watch out.** The misconception is that \`lo >= hi\` is "the range has run out" — it reads like it
> in English. It is not: \`lo == hi\` is a range holding **exactly one candidate**, and that candidate
> is very often the answer. Empty is \`lo > hi\`, and only \`lo > hi\`.

\`\`\`python
    def go(lo: int, hi: int) -> int:
        if lo >= hi:      # WRONG — throws away every one-element range unexamined
            return -1
\`\`\`

The reason this bug survives so long is that it is **right about the worked example**. Run it on
\`nums = [-3, 0, 4, 9, 12]\` with target \`9\` and it returns \`3\`, correct, because that search never
narrows to a single index. Run the same code on the same array with every target in turn:

| target | correct | with \`lo >= hi\` |
|---|---|---|
| \`-3\` | 0 | 0 |
| \`0\` | 1 | **−1** |
| \`4\` | 2 | 2 |
| \`9\` | 3 | 3 |
| \`12\` | 4 | **−1** |
| \`2\` (absent) | −1 | −1 |

Two of the five present values are reported missing. The three it gets right are the ones whose
search happens to land on them while the range still holds two or more indices. A test suite with
one example passes; the submission fails. **That is the argument for the stress test at the bottom
of this document**, and it is why the trace above spends four rows on the miss.`,
  cost: `**Time** \`O(log n)\`, **space** \`O(log n)\`. The time is the number of halvings it takes to reduce \`n\`
to zero, which is \`log₂n\` — for \`n = 10⁴\`, fourteen probes rather than ten thousand. The space is the
part people forget: **each call is a stack frame**, and there are \`log n\` live at the deepest point.
Fourteen frames is nothing, but the space is not \`O(1)\` and claiming it is will be corrected.

Use it when the recursion genuinely clarifies — on a tree, or when the "smaller subproblem" is not a
contiguous index range and carrying it in two variables would be awkward. For a flat array it buys
readability some people like and costs stack frames everyone pays. The next rung is the same
algorithm with the frames removed.

---`,
}
