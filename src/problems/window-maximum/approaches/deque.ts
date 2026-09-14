// window-maximum — approach 3 — A monotonic deque of indices
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
  rung: "deque",
  title: "A monotonic deque of indices",
  idea: `*The heap keeps corpses because it cannot delete from the middle — what if nothing worth deleting ever
got in?* Before adding a value, throw away every stored value it beats. What remains is a sequence of
candidates in decreasing order, and the front of it is the current maximum.

This fixes the heap's weakness: **it cannot remove the element that just left the window, so it
accumulates stale entries and must re-check the top before trusting it.**`,
  intuition: `> **Intuition.** A queue of hopefuls waiting to be the answer, oldest at the front. When a new number
> arrives it walks up the back of the queue and dismisses everyone it is at least as large as — they
> cannot beat it, and it will still be here after they have gone, so they have no future — then joins
> the back itself. What survives is a line whose values fall from front to back, so the front is
> whoever wins right now. The queue loses people at both ends and for different reasons: from the back
> because they were **beaten**, from the front because they got **old**.`,
  worked: `\`nums = [1, 3, -1, -3, 5, 3, 6, 7]\`, \`k = 3\`. The deque holds indices; values are shown alongside:

| \`i\` | value | popped from back | expired from front | deque (indices) | values | emits |
|---|---|---|---|---|---|---|
| 0 | 1 | — | — | \`[0]\` | \`[1]\` | — |
| 1 | 3 | \`(1, idx 0)\` | — | \`[1]\` | \`[3]\` | — |
| 2 | −1 | — | — | \`[1, 2]\` | \`[3, -1]\` | **3** |
| 3 | −3 | — | — | \`[1, 2, 3]\` | \`[3, -1, -3]\` | **3** |
| 4 | 5 | \`(-3, idx 3)\`, \`(-1, idx 2)\`, \`(3, idx 1)\` | — | \`[4]\` | \`[5]\` | **5** |
| 5 | 3 | — | — | \`[4, 5]\` | \`[5, 3]\` | **5** |
| 6 | 6 | \`(3, idx 5)\`, \`(5, idx 4)\` | — | \`[6]\` | \`[6]\` | **6** |
| 7 | 7 | \`(6, idx 6)\` | — | \`[7]\` | \`[7]\` | **7** |

Measured: **8 pushes and 7 pops** for an array of 8 — against the scan's 18 reads and the heap's
8-entry pile.

Now look at the "expired from front" column: it is empty on every row. **This input never exercises
front expiry**, because every maximum is beaten by a newer arrival before it ages out. A trace that only
uses the statement's example would leave the deque's defining feature untested, so here is
\`nums = [9, 1, 1, 1, 2], k = 3\`, where the 9 must age out on its own:

| \`i\` | value | popped from back | expired from front | deque | values | emits |
|---|---|---|---|---|---|---|
| 0 | 9 | — | — | \`[0]\` | \`[9]\` | — |
| 1 | 1 | — | — | \`[0, 1]\` | \`[9, 1]\` | — |
| 2 | 1 | \`(1, idx 1)\` | — | \`[0, 2]\` | \`[9, 1]\` | **9** |
| 3 | 1 | \`(1, idx 2)\` | **\`(9, idx 0)\`** | \`[3]\` | \`[1]\` | **1** |
| 4 | 2 | \`(1, idx 3)\` | — | \`[4]\` | \`[2]\` | **2** |

At \`i = 3\` the 9 is still the largest value the deque holds and it is still at the front — nothing beat
it. It leaves purely because index 0 has fallen outside the window \`1..3\`. That single line is what a
stack could not do.`,
  code: `def window_maximum_monotonic_deque(nums: list[int], k: int) -> list[int]:
    best: deque[int] = deque()  # indices, their values strictly decreasing front to back
    out: list[int] = []
    for i, x in enumerate(nums):
        while best and nums[best[-1]] <= x:
            best.pop()  # dominated forever: x is at least as large AND outlives them
        best.append(i)
        if expired(best[0], i, k):
            best.popleft()  # the front is what ages out — this is what a stack cannot do
        if i >= k - 1:
            out.append(nums[best[0]])
    return out`,
  mistake: `> **Watch out.** Storing **values** in the deque rather than **indices**, because the values are what you
> are going to report and the indices feel like bookkeeping. They are not bookkeeping — they are the only
> thing that knows *when* an entry expires. With values alone the front-expiry test degrades to a guess
> like "pop the front if it equals the value that just left the window", which is wrong whenever that
> value appears more than once. Measured: on the statement's example it returns \`[3, 3, 5, 5, 6, 7]\`,
> perfectly correct, because no value repeats. On \`nums = [7, 7, 1, 7, 7, 1], k = 3\` and on
> \`nums = [2, 2, 2, 2], k = 2\` it does not return a wrong answer — it **crashes**:
> \`IndexError: deque index out of range\`, having popped a front that was never really expired until the
> deque was empty. The index is what makes expiry decidable; the value cannot answer the question.
>
> The neighbouring bug is expiring from the **back** instead of the front. Measured, that returns
> \`[9, 9, 9]\` on \`nums = [9, 1, 1, 1, 2], k = 3\` where the answer is \`[9, 1, 2]\`, and \`[5, 5, 5, 5]\` on
> \`nums = [5, 4, 3, 2, 1], k = 2\` where the answer is \`[5, 4, 3, 2]\` — the stale front is never removed
> at all. It too is silently correct on the statement's example.`,
  cost: `**Time \`O(n)\`.** Each index is appended exactly once and removed at most once, so the nested \`while\`
contributes at most \`n\` pops in total across the whole run — 8 pushes and 7 pops on our example. The
bound is amortised, not per-step: one arrival can pop three entries, as index 4 does above, but only
because three earlier arrivals paid for them.

**Space \`O(k)\`.** The deque never holds two indices that are both inside the window unless their values
are strictly decreasing, and it never holds an expired index for more than the one step before it is
checked — so its size is bounded by the window width, not the array length. That is the concrete
improvement over the heap's \`O(n)\` pile of corpses.

This is the one to write. It is optimal in both time and space, and its two habits generalise:
**discard eagerly what can never win**, and **make sure the structure can expire from the front**.
Between them they solve the sliding-window minimum, the "shortest subarray with sum at least \`k\`"
problem, and a family of dynamic-programming optimisations where a monotonic deque replaces an inner
loop.

---`,
  notes: [
    { title: "why a beaten value can be discarded forever", body: `> **Why it works.** Take two positions \`i < j\` with \`nums[i] <= nums[j]\`, and ask when \`i\` could ever be
> reported as a maximum again. Windows are **contiguous**, so any window that contains \`i\` and ends at
> or after \`j\` must also contain \`j\` — there is no way to include \`i\` and skip \`j\` while reaching past
> it. In every such window \`nums[j]\` is at least \`nums[i]\`, so \`i\` is never the answer there; \`j\` wins
> or ties, and since we report the *value*, a tie is as good as a win. Windows that end before \`j\` have
> already been emitted by the time \`j\` arrives. So at the moment \`j\` arrives, position \`i\` has no future
> in which it can matter: it is **dominated**, permanently, and deleting it loses nothing.
>
> That is why the pop-from-the-back loop is safe, and it is why the comparison is \`<=\` rather than \`<\`:
> ties may be discarded because \`j\` outlives \`i\` and carries the same value. Using \`<\` is also correct —
> it just keeps entries that can never be needed.

Two consequences follow. First, the deque's values are always **strictly decreasing** from front to
back, which is what "monotonic" means and why the front is the maximum. Second, each index is appended
exactly once and removed at most once, so the total work across the whole run is at most \`2n\` deque
operations even though the code contains a nested \`while\`.` },
    { title: "what the deque adds over a stack", body: `Popping dominated values from the back is a *stack* operation. But the front of the structure also has
to go — when the maximum itself slides out of the window, it must be removed from the **front**, the
opposite end from where arrivals are processed. Needing to remove at both ends is exactly the
requirement a stack cannot meet and a double-ended queue exists to satisfy. Say it as a rule:

| Operation | End | Why |
|---|---|---|
| Discard values the arrival dominates | **back** | The arrival is newer and at least as large; those entries have no future |
| Append the arriving index | back | It is the newest, and therefore the smallest of the surviving candidates |
| Expire the index that left the window | **front** | The front is the oldest surviving candidate, so it is the one that ages out first |
| Read the window's maximum | front | The values decrease from front to back |` },
  ],
}
