// first-missing-positive — approach 5 — Cyclic placement, in place.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Cyclic placement, in place",
  idea: `*The boolean table has n+1 slots indexed by the values 1..n. The input has n slots indexed 0..n−1.
Those are the same slots with an offset of one. Why are there two of them?* This rung deletes the
second one. Instead of writing a flag at \`seen[v]\`, move the value \`v\` itself into slot \`v-1\`.
Afterwards, "is candidate c present?" is answered by a single read: slot c−1 holds c if and only if c
was in the array. This fixes the boolean table's weakness — the fresh allocation — and drops the extra
space to O(1). The price is that the array is permuted beyond recovery.`,
  intuition: `**Every value is trying to go home, and its home is the slot with its own number on the door.** The
value 1 belongs in slot 0, the value 4 in slot 3, and anything outside 1..n is homeless and stays
wherever it lands. So you walk the array and, at each position, ask the value standing there where it
belongs. If it belongs elsewhere and that slot does not already hold a copy of it, swap the two. The
swap hands you a *new* value at the current position, which may itself belong elsewhere — so you ask
again, and keep asking, until the value at hand is homeless or already home. Only then do you step
forward.

When the walk is done, the array reads 1, 2, 3, … for as far as those values existed, and the first
slot that disagrees with its own door number names the missing value.`,
  worked: `Input: \`nums = [3, 4, -1, 1]\`, n = 4. This is the real trace of the placing pass, one line per swap.

| At | Value there | Belongs in slot | What is there | Action | Array after |
|---|---|---|---|---|---|
| i = 0 | 3 | 2 | −1, not 3 | swap slots 0 and 2 | \`[-1, 4, 3, 1]\` |
| i = 0 | −1 | — | — | homeless, step forward | \`[-1, 4, 3, 1]\` |
| i = 1 | 4 | 3 | 1, not 4 | swap slots 1 and 3 | \`[-1, 1, 3, 4]\` |
| i = 1 | 1 | 0 | −1, not 1 | swap slots 1 and 0 | \`[1, -1, 3, 4]\` |
| i = 1 | −1 | — | — | homeless, step forward | \`[1, -1, 3, 4]\` |
| i = 2 | 3 | 2 | itself | already home, step forward | \`[1, -1, 3, 4]\` |
| i = 3 | 4 | 3 | itself | already home, step forward | \`[1, -1, 3, 4]\` |

Three swaps in total for a four-element array. Now the reading pass:

| Slot | Holds | Wants | Verdict |
|---|---|---|---|
| 0 | 1 | 1 | correct, keep going |
| 1 | **−1** | 2 | 2 was never placed → **answer 2** |

The array left behind is \`[1, -1, 3, 4]\` — a permutation of the input the caller never asked for.`,
  code: `def first_missing_positive_cyclic_placement(nums: list[int]) -> int:
    """Destroys nums: every placeable value is swapped into slot value - 1."""
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is already settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
  mistake: `Writing the guard as \`nums[nums[i] - 1] != i + 1\` — checking whether the destination is "correct"
rather than whether it already holds the value being sent. That comparison is against the wrong slot's
door number and is simply incorrect. But the far more common and far nastier bug is dropping the
duplicate guard entirely and writing \`while 1 <= nums[i] <= n and nums[i] != i + 1\`. On \`[1, 1]\` that
loop swaps slot 1 with slot 0, gets \`[1, 1]\` back, finds \`nums[1] != 2\` still true, swaps again, and
**spins forever**. Duplicates are explicitly legal in this problem, so this is not a theoretical
hazard — it is a hang on a perfectly ordinary input. The guard must compare the destination's
*contents* to the value being placed, because that is what proves progress and that is what the
linearity argument above depends on.

A third, quieter bug: writing \`j = nums[i] - 1\` *after* the swap instead of before, or swapping
through a stale \`j\`. The index must be computed from the current value at \`i\`, and in Python the
tuple swap \`nums[i], nums[j] = nums[j], nums[i]\` evaluates the right-hand side first, which is why it
is safe — writing the same thing as three separate assignments with a temporary is where people
clobber the value they are about to read.`,
  cost: `**Time O(n), space O(1).** The placing pass is at most n outer steps plus at most n swaps total, by
the accounting argument above; the reading pass is one more walk of n. Space is a loop index and a
temporary — no allocation at all, and the answer is a single integer, so there is not even an output
list to count.

Use it when the constant-space follow-up is genuinely being asked, when the array is large enough that
a second n-sized allocation is a real cost, and when the caller has said the input is expendable. In
an interview this is the answer the question was written for, and the two things that earn the marks
are the n+1 bound argument and the linearity argument — not the code, which is six lines and which
plenty of people can reproduce without understanding either.

---`,
  notes: [
    { title: "why the walk is still linear, despite the inner loop", body: `This is the part that looks dangerous and is not, and it is the thing to be able to explain out loud.
There is a \`while\` loop nested inside a \`for\` loop, which usually spells O(n²) — but here the total
number of swaps across the *entire* run is at most n, so the whole placing pass is O(n).

The reason is an accounting argument. Look at what a swap does: it takes a value \`v\` that is in 1..n
and puts it in slot \`v-1\`, which is its home. The guard \`nums[nums[i] - 1] != nums[i]\` is what
guarantees this — the swap only fires when the destination does *not* already hold \`v\`, so after the
swap, slot \`v-1\` holds \`v\` for the first time. And once a slot holds its own value, nothing can ever
move it again: any future swap targeting that slot would have to pass the same guard, and the guard
now reads "the destination already holds this value", so it fails and the loop stops.

So every single swap in the entire run permanently settles one value that had never been settled
before. There are at most n values that can be settled. Therefore there are at most n swaps in total,
across every iteration of the outer loop combined. The inner \`while\` is not "up to n iterations per
outer step" — it is "some iterations, drawn from a shared budget of n for the whole run". Add the n
outer steps themselves, and the placing pass costs at most 2n operations, plus n more for the reading
pass. Linear.

The same argument is what makes the sibling approach in \`missing-number\` linear, and it is the
standard shape for *any* in-place permutation trick: find the quantity that strictly increases and
never decreases (here, "number of values sitting at home"), show every unit of inner work advances it
by one, and the bound follows.` },
    { title: "the cost of mutation — who it hurts, and can it be undone", body: `The array does not come back. Unlike the sign-flip trick in \`find-all-duplicates\`, which only changes
signs and leaves every value in place, this rung **permutes** the array: values move, and the original
ordering is destroyed.

Who gets hurt:

- **A caller that still needs the array.** The values are all still there (nothing is created or
  deleted), but they are in different positions. Anything that depended on order — a parallel array of
  labels indexed the same way, a previously computed index, a slice boundary — is now silently wrong.
  Nothing throws. The next reader just sees the data in the wrong order.
- **A concurrent reader.** This function writes to most of the array; another thread reading it
  concurrently sees a half-permuted state where a value can legitimately appear twice or not at all.
  It is a data race, and no amount of careful reading on the other side fixes it.
- **A read-only or shared buffer.** A memory-mapped read-only page faults; a copy-on-write page gets
  dirtied; a caller who passed a view into a larger array has that larger array scrambled too.

**Can it be undone?** In general, no — not without spending the memory the trick was invented to
avoid. Sign flipping is its own inverse, so \`find-all-duplicates\` can repair itself in one pass. A
permutation is invertible in principle, but you would have to have *recorded* it, and recording which
swaps you made costs O(n) memory, which defeats the entire purpose. The only honest ways to get the
original back are: copy the array before you start (O(n) space — at which point use the boolean table,
which is simpler and just as fast), or accept the loss.

The practical rule is the same as for every in-place trick, and it is a contract question rather than
an algorithm question: **if you permute the caller's input, that belongs in the function's name or its
docstring**, not in a comment three levels down. Note also that the problem statement here explicitly
permits modification — which is a deliberate signal that the intended answer mutates. When a statement
goes out of its way to tell you the input is expendable, it is telling you where to look.` },
  ],
}
