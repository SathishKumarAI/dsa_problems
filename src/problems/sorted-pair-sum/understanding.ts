// sorted-pair-sum — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are handed a list of numbers that is already arranged from smallest to largest, and one
number called the *target*. Find two different positions in the list whose values add up to the
target, and report those two positions. You are promised that exactly one such pair exists, and
you are asked not to allocate a helper structure that grows with the input — constant extra
space, meaning a handful of variables and nothing more.

**The core question is: for each value in the list, does its partner — the number that would
complete the target — exist somewhere else in the list?** The naive approach is slow because it
answers that question by re-reading the whole rest of the list for every single value, so a list
of 30,000 numbers costs roughly 450 million pair checks.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`2 <= numbers.length <= 3 * 10^4\` | Quadratic work is ~4.5 × 10⁸ operations — too slow, so an O(n²) answer will not survive. It also means the list always has at least two elements, so "two distinct positions" is always askable. |
| \`-1000 <= numbers[i] <= 1000\` | Values are bounded and small. This is what makes the hash-map rung cheap in practice (no collision pathology, tiny keys) — but it is *not* what makes the final answer work. |
| **\`numbers\` is sorted ascending** | This is the load-bearing one. Sortedness makes the sum of any two positions respond *monotonically* to moving either end: push the left index right and the sum can only rise; pull the right index left and the sum can only fall. That monotone response is exactly what lets two converging pointers throw away half the work without ever checking it. |
| exactly one solution; no element reused; O(1) extra space | The uniqueness promise means you may return the instant you hit a match. The space cap is what disqualifies the hash map — it is not slow, it is just memory you have been told you cannot spend. |

Where sortedness is *not* available — the plain unsorted "two sum" — the hash map is the right
answer and the converging pointers are simply unavailable. Everything below hinges on knowing
which of those two worlds you are in.
---`
