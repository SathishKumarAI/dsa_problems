// missing-number — approach 3 — Put each value at its own index
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "put-each-value-at-its-own-index",
  title: "Put each value at its own index",
  idea: `*The flag table has n+1 slots indexed by the values 0..n, and the input has n slots indexed 0..n−1.
Those are nearly the same structure. Why are there two?* This rung deletes the second one. Instead of
writing a flag at \`seen[v]\`, move the value \`v\` itself into slot \`v\`. Afterwards, "is candidate c
present?" is a single read: slot c holds c if and only if c was in the array. This fixes the flag
table's weakness — the fresh allocation — and drops extra space to O(1). The price is that the array
is permuted and does not come back.`,
  intuition: `**Every value is trying to go home, and its home is the slot with its own number on the door.** The
value 0 belongs in slot 0, the value 2 in slot 2. The one exception is the value n: the array's slots
stop at n−1, so n has no home and is left wherever it lands — which is fine, because n being present
is not what you are looking for. So you walk the array and, at each position, ask the value standing
there where it belongs. If it belongs elsewhere and that slot does not already hold it, swap the two.
The swap hands you a *new* value at the current position, which may itself belong elsewhere, so you
ask again — and only step forward when the value at hand is homeless (it is n) or already home.

When the walk is done, the array reads 0, 1, 2, … up to the hole, and the first slot that disagrees
with its own door number names the answer.`,
  worked: `Input: \`nums = [3, 0, 1]\`, n = 3. This is the real trace of the placing pass.

| At | Value there | Belongs in | What is there | Action | Array after |
|---|---|---|---|---|---|
| i = 0 | 3 | — (\`v == n\`, no slot) | — | homeless, step forward | \`[3, 0, 1]\` |
| i = 1 | 0 | slot 0 | 3, not 0 | swap slots 1 and 0 | \`[0, 3, 1]\` |
| i = 1 | 3 | — (\`v == n\`, no slot) | — | homeless, step forward | \`[0, 3, 1]\` |
| i = 2 | 1 | slot 1 | 3, not 1 | swap slots 2 and 1 | \`[0, 1, 3]\` |
| i = 2 | 3 | — (\`v == n\`, no slot) | — | homeless, step forward | \`[0, 1, 3]\` |

Two swaps for a three-element array. Now the reading pass:

| Slot | Holds | Wants | Verdict |
|---|---|---|---|
| 0 | 0 | 0 | correct |
| 1 | 1 | 1 | correct |
| 2 | **3** | 2 | 2 was never placed → **answer 2** |

The array left behind is \`[0, 1, 3]\` — sorted, as it happens, but that is a coincidence of this input,
not a guarantee, and it is certainly not the order the caller handed over.`,
  code: `def missing_number_place_at_own_index(nums: list[int]) -> int:
    """Destroys nums: every value < n is swapped into slot value."""
    n = len(nums)
    i = 0
    while i < n:
        v = nums[i]
        if v < n and nums[v] != v:  # v == n has no slot; already-home values are done
            nums[i], nums[v] = nums[v], nums[i]
        else:
            i += 1
    for i in range(n):
        if nums[i] != i:
            return i
    return n`,
  mistake: `Advancing the cursor after a swap — writing \`i += 1\` unconditionally instead of only in the \`else\`
branch. A swap hands the current position a brand-new value that has not been examined yet, and
stepping past it abandons that value wherever it happens to have landed. On \`[3, 0, 1]\` the
unconditional version swaps slot 1 into slot 0, steps to slot 2, and never notices that slot 1 now
holds a 3 that displaced the 0 it was meant to place — the final scan then reports the wrong hole. The
cursor must stay put until the value it is standing on is settled.

The second mistake is dropping the \`v < n\` guard. The value n is legal and common, and \`nums[n]\` is
one past the end — in Python that is an \`IndexError\`, and in C or Java it is an out-of-bounds write
into whatever memory follows. This is not an edge case you can hope to avoid: \`[0, 1]\` contains no n
and works, but \`[1, 2]\`, whose answer is 0, has n = 2 sitting right there in the data.`,
  cost: `**Time O(n), space O(1).** The placing pass is at most n cursor advances plus at most n swaps in total
by the accounting argument above, and the reading pass is one more walk of n. Space is one index and a
temporary.

Use it when you need constant space *and* the values are a near-permutation *and* no arithmetic
invariant is available — which happens when there are several missing values, or several duplicates,
or the values are not summable. For this exact problem it is dominated by the arithmetic rungs below,
which are constant space *and* leave the input alone. Its real value here is as practice: this is the
same machinery \`first-missing-positive\` needs, where it genuinely is the best answer.

---`,
  notes: [
    { title: "why the walk is still linear, despite the inner loop", body: `There is a loop inside a loop here — the cursor \`i\` only advances when the value at hand is settled,
so a single position can trigger several swaps before moving on. That shape usually spells O(n²). It
does not here, and the reason is an accounting argument worth knowing because it is the standard
justification for every in-place permutation trick.

Look at what a swap does: it takes a value \`v\` with \`v < n\` and puts it in slot \`v\`, its home. The
guard \`nums[v] != v\` is what makes this true — the swap only fires when the destination does *not*
already hold \`v\`, so after the swap, slot \`v\` holds \`v\` for the first time. And once a slot holds its
own value, nothing can ever move it again: any later swap aimed at that slot would have to pass the
same guard, which now reads "the destination already holds this value", and fails.

So every swap in the entire run permanently settles one value that had never been settled before.
There are at most n values that can be settled, so there are at most n swaps in total — across every
iteration of the outer loop combined, not per iteration. The inner work is not "up to n steps each
time"; it is drawn from a shared budget of n for the whole run. Add the n advances of the cursor and
the placing pass costs at most 2n operations, plus n more for the reading pass. Linear.

The quantity that makes the argument work is "number of values sitting at home": it strictly increases
with every unit of inner work and never decreases, and it is bounded by n. Find that quantity and the
bound follows; fail to find it and you have no right to claim the loop is linear.` },
    { title: "the cost of mutation — who it hurts, and can it be undone", body: `The array does not come back. This rung **permutes** it: values are moved between slots, so the
caller's ordering is destroyed even though no value is created or lost.

Who gets hurt:

- **A caller that still needs the array.** Every value is still present, but at a different position.
  Anything depending on position — a parallel array of labels indexed the same way, a previously
  computed index, a slice boundary — is now silently wrong. Nothing throws.
- **A concurrent reader.** This function writes to much of the array, and another thread reading it
  mid-run sees a state where a value can legitimately appear twice or not at all. That is a data race,
  and careful reading on the other side does not fix it.
- **A read-only or shared buffer.** A read-only memory mapping faults; a copy-on-write page is
  dirtied; a caller who passed a view into a larger array has that larger array scrambled too.

**Can it be undone?** Not for free. A permutation is invertible in principle, but only if you recorded
which swaps you made — and recording them costs O(n) memory, which defeats the entire point. Compare
the sign-flip trick in \`find-all-duplicates\`, which only changes signs and never moves anything, so
one pass of \`abs\` restores it exactly. Here there is no such inverse. The only honest ways to get the
original array back are to copy it before you start (O(n) space, at which point the flag table is
simpler and just as fast) or to accept the loss.

Which is exactly why this rung, alone among the five, is the one this problem does **not** want. It is
constant space, but so is the next one — and the next one does not touch the array at all. *An
in-place trick is only worth its cost when there is no cheaper way to get the same guarantee*, and
here there is.` },
  ],
}
