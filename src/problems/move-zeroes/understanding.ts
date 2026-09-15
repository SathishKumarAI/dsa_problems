// move-zeroes — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are given an array of integers. Move every \`0\` to the back, and leave everything else in the
order it was already in. \`[0, 1, 0, 3, 12]\` becomes \`[1, 3, 12, 0, 0]\` — the \`1\`, the \`3\` and the
\`12\` still appear in that order, and the two zeroes have been pushed to the end. The rearrangement
must happen inside the array you were handed.

**The core question is: where does each value you are keeping belong once the zeroes before it have
been removed?** The naive approach answers that by building the answer somewhere else — collect the
non-zero values into a fresh list, pad it with zeroes to the original length, then copy the whole
thing back. It is not slow in the big-O sense; it is O(n) time like everything else here. What it
wastes is an entire second array, allocated to hold values that are immediately copied back into
the array they came from. Every kept value gets written twice, and the peak memory is double what
the problem needs.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`1 <= nums.length <= 10^4\` | Small enough that any linear approach is instant, and large enough that a quadratic "delete and shift" version (repeatedly removing a zero and sliding everything left) would do 10⁸ moves in the worst case. It also guarantees the array is never empty. |
| \`-2^31 <= nums[i] <= 2^31 - 1\` | Values are arbitrary signed 32-bit integers. This matters more than it looks: **it rules out any scheme that uses a sentinel value to mark a slot**, because every possible integer is a legal value, so there is no number you could write that would unambiguously mean "empty". The only usable marker is a *position* — an index — which is what pushes you toward pointers. |
| **The non-zero values must keep their RELATIVE ORDER** | The load-bearing constraint on the method. It is what rules out the obvious two-pointer trick of swapping each zero with the last element: that would produce an array with the zeroes at the back, but the kept values would be scrambled. Order-preservation is what forces the walk to be *sequential and forward*, which is exactly what a reader/writer pair provides. |
| **In place: no second array to build the answer in** | This is a constraint on the **answer**, not on the input, and the distinction is worth making. Nothing about the input forbids allocating another list — Python will happily give you one. What is forbidden is *delivering* the result as a separate array, because the caller holds a reference to the original and expects to find it reordered. That is why approach 1 below, which does allocate a helper list, still has to copy everything back at the end: it is a legal answer only because of that final copy-back, and the copy-back is exactly the waste the optimal version removes. |

Those last two constraints pull in different directions, and noticing that is most of the insight.
"In place" tempts you toward swapping, because swapping is the classic way to rearrange without
allocating. "Keep the relative order" then tells you *which* swaps are allowed — only ones that move
a value backward past zeroes, never a swap that jumps a value across other kept values. The
solution is the one walk that satisfies both.

---`
