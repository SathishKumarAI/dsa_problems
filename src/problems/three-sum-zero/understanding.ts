// three-sum-zero — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are given a list of whole numbers, which may be positive, negative, or zero, and which is in
no particular order. Find every group of three different positions whose values add up to zero.
Two groups count as the same answer if they contain the same three *values* — so if the list
contains two copies of −1 and you can build \`[-1, -1, 2]\` in more than one way, you report it once.
The output is a collection of triples, not a count and not a single triple.

**The core question is: for how many ways can three values in this list cancel each other out —
and how do you list each distinct way exactly once?** The naive approach is slow because it tries
every group of three positions, which is about n³/6 combinations; at the maximum allowed size that
is roughly 4.5 billion, far beyond what runs in time.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`3 <= nums.length <= 3000\` | n³ is about 4.5 × 10⁹ — dead. n² is 9 × 10⁶ — comfortable. This bound is the explicit signal that the target complexity is quadratic, and that spending O(n log n) to sort first is essentially free by comparison. |
| \`-10^5 <= nums[i] <= 10^5\` | Values are bounded, so sums fit in a machine integer with no overflow care in Python, Java or C++. Note what this does **not** give you: the range is wide (200,001 possible values) so counting-sort or a value-indexed array is not the trick here. Boundedness helps arithmetic safety, not the algorithm. |
| triples must be distinct **as sets of values**, not as sets of indices | This is the constraint that shapes the whole problem. It is why the ladder below is mostly about *deduplication* rather than speed, and it is what makes sorting valuable for a second, independent reason: sorting drags equal values next to each other, which turns "have I emitted this triple before?" from a set membership test into a comparison with the neighbour. |
| an element may not be reused within one triple | Three *distinct positions*. Three copies of the value 0 in the list is a legitimate \`[0, 0, 0]\`; one copy used three times is not. |

The array **does not arrive sorted** — unlike the pair-sum problem, sortedness is not handed to
you. You buy it, for O(n log n), and the reason you are willing to is that it pays twice: it makes
the inner pair search a converging-pointer walk (O(n) instead of a hash table), and it makes
deduplication two neighbour comparisons instead of a set of tuples. Sorting is destructive to the
original positions — which would be fatal if the answer were indices. It is not; the answer is
values. That is the licence to sort.
---`
