// sorted-squares — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are handed an array that is already arranged from smallest to largest. Square every value and
return the squares, also arranged from smallest to largest. \`[-4, -1, 0, 3, 10]\` becomes
\`[0, 1, 9, 16, 100]\`.

If every value were non-negative this would not be a problem at all — squaring preserves the order
of non-negative numbers, so you would square in place and be done. The entire difficulty is the
negatives: \`-4\` is *smaller* than \`-1\` in the input but \`16\` is *larger* than \`1\` in the output.
Squaring throws away the ordering you were given.

**The core question is: in what order should the squares be emitted, given that squaring reverses
the ordering of the negative part and preserves it for the rest?** The naive approach answers that
by simply not caring — square everything, hand the result to a general-purpose sort, and pay
O(n log n) to rediscover an ordering that the input had already told you almost everything about.
That is what makes it slow: it is not doing unnecessary work per element, it is throwing away
structure and then paying to rebuild it.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`1 <= nums.length <= 10^4\` | Small enough that \`sorted()\` is genuinely fine in practice; large enough that the log factor is measurable. It also guarantees the array is never empty, so \`nums[0]\` and \`nums[-1]\` always exist and the two pointers always start on real elements. |
| \`-10^4 <= nums[i] <= 10^4\` | Squares reach 10⁸, which fits comfortably in a 32-bit integer, so no overflow handling is needed — worth checking rather than assuming, because a bound of 10⁵ would have made \`int\` overflow in C++ or Java a real concern. |
| **Sorted non-decreasing** | The load-bearing constraint, and the one every optimisation below is unlocking. It means the array splits at zero into two runs: a stretch of negatives whose magnitudes *decrease* left to right, followed by a stretch of non-negatives whose magnitudes *increase*. Squaring turns that into two already-sorted sequences facing each other — and merging two sorted sequences is linear, while sorting from scratch is not. |
| Duplicates are allowed, and equal magnitudes of opposite sign square to the same value | \`[-3, 3]\` produces \`[9, 9]\`. Any comparison in the merge must handle ties without dropping or double-counting an element — which is why the tie-break direction in the code below is a correctness matter, not a style choice. |
| Negatives are what make this interesting | Stated outright in the problem's own constraints, and it is the hint: if you cannot see why an all-positive input is trivial, you have not found the shape of the problem yet. |

The structural fact worth writing down before any code, because all three approaches are different
ways of exploiting or ignoring it: **squaring folds the array around zero.** Magnitude decreases
toward the middle and increases toward both ends. So the *largest* square is always at one end or
the other — never in the middle — and the *smallest* square is always somewhere in the middle,
never at an end. Which of those two facts you build on determines which approach you get.

---`
