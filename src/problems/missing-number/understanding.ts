// missing-number — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are handed an array of n distinct integers, every one of them drawn from the range 0 to n
inclusive. That range holds n+1 numbers and the array has only n slots, so exactly one number from the
range never shows up. Name it. The follow-up asks for linear time and constant extra memory.

**The core question is: which of the n+1 candidates 0, 1, …, n is absent?** The naive instinct is
slow because it answers that by searching the whole array once per candidate — and notice that no
single element of the array can answer the question on its own. The answer is a property of the
*whole set*, not of any one value in it.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`n == nums.length\`, \`1 <= n <= 10^4\` | Small enough that even a quadratic scan finishes, so the interest here is not survival but elegance. Every rung below is O(n log n) or better. |
| **\`0 <= nums[i] <= n\`** | The load-bearing one. Every value is a legal index of a table of n+1 slots, and every value except n is a legal index of the array itself. That is what lets the flag table index directly and what lets the in-place rung use the array as its own table. |
| **every value is distinct** | This is what makes it a *near-permutation*: the array is the set 0..n with one element deleted and the rest shuffled. No counting is ever needed, only presence — and it is what makes both arithmetic rungs work, because each present value contributes exactly once to the sum or the XOR. |
| **exactly one number is missing** | You are not searching, you are *deducing*. Any invariant of the complete set 0..n, compared against the same invariant computed over the array, differs by precisely the missing number. |
| the answer may be 0 or n itself | A scan that only looks between the smallest and largest value present is wrong. \`[1]\` is missing 0 and \`[0]\` is missing 1 — both ends have to work, and a solution that only finds interior gaps fails both. |
| \`n\` may be 1 | The two smallest legal inputs, \`[0]\` and \`[1]\`, are exactly the two end cases above. They are cheap to test and they catch most off-by-ones. |

The whole arc of this problem is one sentence: **the values are promised to lie in 0..n, so the array
itself can become the lookup table — and because they are also promised to be distinct, you do not
even need a table, because arithmetic over the whole set can name the hole without ever looking for
it.** This problem is the one place in this family where the arithmetic route beats the indexing
route outright.

---`
