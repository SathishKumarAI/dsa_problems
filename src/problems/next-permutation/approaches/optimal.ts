// next-permutation — approach 5 — Pivot, swap, reverse the tail in place (optimal)
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Pivot, swap, reverse the tail in place (optimal)",
  idea: `*If the tail is being copied backwards onto itself, why copy at all?* Two indices walking toward each
other from the ends of the tail, swapping as they pass, turn a descending run into an ascending one
where it already lies. No scratch list, no allocation — and the same loop handles the wrap case for
free, because an input with no pivot is a tail that happens to be the whole array.

This fixes the previous rung's last weakness — **it allocates an array whose only purpose is to be
poured straight back into the one it came from.**`,
  intuition: `> **Intuition.** Four observations, in order, and the algorithm is just their consequence. One: a descending run is
> already the largest arrangement of its values, so no successor hides inside it — which is what makes
> the rightmost ascent the pivot. Two: the pivot must grow, and by as little as possible, so its
> replacement is the smallest tail value that still exceeds it. Three: after that swap the tail must
> become the *smallest* arrangement of what it now holds, because the front has already grown and
> everything after it should give away as little as it can. Four: the tail is still descending, so
> "smallest arrangement" is not a sort — it is a reversal. That fourth observation is where the linear
> time comes from, and it is the one most people pay \`O(n log n)\` to skip.

> **Why it works.** The load-bearing claim is an **invariant on the tail: it is non-increasing, and it
> stays non-increasing across the swap.** It holds when the pivot is found, by the definition of the
> pivot. It survives the swap because \`at\` is the *rightmost* position holding a value above
> \`nums[pivot]\` — so everything to its right is \`<= nums[pivot]\`, and everything to its left within the
> tail is \`>= nums[at]\`; dropping \`nums[pivot]\` into position \`at\` therefore lands a value that is no
> larger than its new left neighbour and no smaller than its new right neighbour. A non-increasing run
> reversed is non-decreasing, which is the smallest arrangement of those values — so the two converging
> indices are a sort that costs \`O(n)\` because the order was known in advance. Minimality follows:
> nothing left of the pivot changed, the pivot grew by the least it could, and the tail is as small as
> those values can be arranged, so no arrangement lies strictly between the input and the output. And
> when no pivot exists, \`pivot = -1\` makes the tail the whole array, so the same reversal delivers the
> globally smallest arrangement — the wrap, with no extra code.`,
  worked: `\`nums = [1, 3, 5, 4, 2]\`.

**Step 1 — the pivot.** Scanning in from the right: \`4 >= 2\` yes, \`5 >= 4\` yes, \`3 >= 5\` no. Pivot is
index 1, value 3. The tail \`[5, 4, 2]\` at indices 2…4 is descending, hence already maximal.

\`\`\`
[1, 3, 5, 4, 2]
    ^  ~~~~~~~
  pivot   tail (descending — nothing here can grow)
\`\`\`

**Step 2 — the replacement.** Walk in from the right end for the last value still above 3: index 4
holds 2 (\`2 <= 3\`, step left), index 3 holds 4 (\`4 > 3\`, stop). Because the tail descends, the
rightmost value above the pivot is also the *smallest* value above it.

**Step 3 — swap indices 1 and 3.**

\`\`\`
[1, 4, 5, 3, 2]
    ^  ~~~~~~~
  grown   still descending: 3 landed exactly where 4 was
\`\`\`

**Step 4 — reverse the tail in place**, \`left = 2\`, \`right = 4\`:

| step | \`left\` | \`right\` | array |
|---|---|---|---|
| swap | 2 | 4 | \`[1, 4, 2, 3, 5]\` |
| — | 3 | 3 | \`left\` is not less than \`right\`; stop |

Answer: **\`[1, 4, 2, 3, 5]\`**. Two index moves and one swap did what a sort was doing a rung ago.

**The wrap, on \`[3, 2, 1]\`:** the pivot scan runs off the left end and \`pivot\` finishes at −1. Nothing
is swapped. Then \`left = pivot + 1 = 0\` and \`right = 2\`, so the reversal covers the *entire array* and
produces \`[1, 2, 3]\` — the smallest arrangement. The wrap needs no special case at all; it is the same
line of code with \`pivot = -1\`.`,
  code: `def next_permutation_pivot_reverse(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    # pivot == -1 means no successor: the tail is the whole array, and
    # reversing it wraps to the smallest arrangement
    left, right = pivot + 1, n - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1
    return nums`,
  codeNote: `\`find_pivot\` is the shared scan introduced in Approach 3 — the observation all three
pivot-based rungs are built on.`,
  mistake: `> **Watch out.** Handling the no-pivot case with an early exit — \`if pivot < 0: return nums\` — because "there is no
> successor, so there is nothing to do". There *is* something to do: the problem says the sequence
> wraps, and the last arrangement is followed by the first. The buggy version returns **\`[3, 2, 1]\`**
> unchanged where the answer is **\`[1, 2, 3]\`**. What makes this worth more than the usual off-by-one
> warning is that the fix is not an extra branch — it is *deleting* one. Leave \`pivot\` at −1, let
> \`left\` start at 0, and the reversal you already wrote reverses the whole array and produces the
> smallest arrangement. The wrap is not a special case bolted onto the algorithm; it is what the
> algorithm already does when the tail is everything.`,
  cost: `**Time \`O(n)\`, space \`O(1)\`.** Three passes that each touch each element at most once — the pivot scan
walks in from the right, the replacement scan walks in from the right, the reversal walks in from
both ends — and none of them nests inside another. The space is four integers (\`n\`, \`pivot\`, \`at\`,
and the \`left\`/\`right\` pair), regardless of how long the array is, because every value that moves
moves by being swapped with another value already in the array.

**This is the one to memorise**, and it is what \`std::next_permutation\` in the C++ standard library
does. It is about ten lines, it needs no auxiliary structure, it handles duplicates without a special
case (that is the \`>=\` in the pivot scan and the \`<=\` in the replacement scan), and it handles the
wrap by doing nothing special at all. There is no faster approach: any correct method must at minimum
look at the suffix to know whether a pivot exists.

---`,
}
