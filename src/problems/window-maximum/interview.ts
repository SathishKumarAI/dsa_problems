// window-maximum — which rungs to know cold, and the drills
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold — the monotonic deque.** Nine lines, and you should be able to write them without pausing
over which end does what. The code is the smaller half of what is being examined.

> **In an interview.** Lead with the obstacle, not the structure: *"a sum slides because subtraction
> undoes addition; a maximum does not undo, so the question is what I keep so a departure cannot destroy
> my answer."* Then give the domination argument in one sentence — **if a later element is at least as
> large, every future window containing the earlier one also contains the later one, so the earlier one
> can never win again and is safe to discard on arrival.** Expect two follow-ups. *Why is this \`O(n)\`
> when there is a loop inside a loop?* — each index is pushed once and popped once, so the inner loop's
> total work across the run is bounded by \`n\`; it is amortised, not per-step. *Why a deque rather than a
> stack?* — arrivals are handled at the back but expiry happens at the front, and needing both ends is
> the definition of a deque. If you can also say why the comparison is \`<=\` rather than \`<\` (ties may go,
> because the newer one outlives the older and carries the same value), you have covered everything that
> normally gets asked.

**Know cold — the per-window scan.** Ten seconds to state and price, it is the oracle you cross-check
against, and — unusually for a brute force — it is genuinely the better choice when \`k\` is small. Saying
so is a point in your favour, not a concession.

**Understand, do not memorize — the heap.** Its value is diagnostic. Being able to say *"a heap gives me
the maximum but cannot forget the element that just left, so it needs lazy eviction and drifts to
\`O(n log n)\` time and \`O(n)\` space"* is what motivates the deque, and it is the honest fallback if the
question mutates into a median or a *k*-th largest, where the deque has no answer at all. Reach for it
when the required statistic stops being an extreme.

---`
