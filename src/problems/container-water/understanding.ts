// container-water — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Imagine a row of vertical sticks standing on a flat line, one at each position, each with its own
height. Pick any two of them and pour water into the gap between them. The water forms a rectangle:
as wide as the distance between the two sticks, and as tall as the *shorter* of the two — because
water poured above the shorter stick simply runs out over it. Your job is to choose the two sticks
that hold the most water, and report that amount. The sticks in between are ignored entirely; they
are treated as infinitely thin lines, not walls.

**The core question is: which pair of positions maximises \`distance × shorter height\`?** The naive
approach is slow because it computes that product for every pair, and with up to 100,000 sticks
that is about 5 billion products — hours of work for one number.

The constraints, and what each one buys:

**The array is not sorted, and nothing says it can be.** This is worth stating loudly, because the
converging-pointer technique is usually introduced on sorted arrays, and a learner reasonably
concludes that sortedness is its precondition. It is not. What converging pointers actually require
is a **monotone response to moving each end** — a guarantee that moving one particular pointer can
never improve the answer — and here that guarantee comes from *geometry*, not from ordering: width
only ever shrinks as the pointers converge, and the shorter wall caps the height. You could not sort
this input even if you wanted to, because sorting would destroy the distances, and the distances are
half the objective. This is the clearest example in the family of a two-pointer solution that owes
nothing to sorted order.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`2 <= height.length <= 10^5`",
        "what": "n² is 10¹⁰ — completely out of reach, so the quadratic answer is not merely inelegant, it fails. The bound is the signal that a single linear sweep is the intended shape. At least two sticks always exist, so an answer always exists (possibly 0)."
    },
    {
        "constraint": "`0 <= height[i] <= 10^4`",
        "what": "Heights are bounded and non-negative. A height of 0 is legal, which is why the answer can legitimately be 0 and why you must not assume the best container is non-empty. The bound also guarantees `width × height` stays inside a 32-bit integer (10⁵ × 10⁴ = 10⁹), which matters in Java and C++."
    },
    {
        "constraint": "the container is capped by the shorter line and widened by the distance",
        "what": "This is the whole problem in one sentence, and it is the source of the monotonicity the fast answer exploits: the area is `min(a, b) × (j − i)`, so the *shorter* wall alone decides the height, and the taller one contributes nothing beyond being at least as tall."
    },
    {
        "constraint": "the lines are vertical; nothing between them affects the area",
        "what": "This is what separates this problem from trapping rain water, where the bars in between are solid and do matter. Here the middle is empty space."
    }
]
