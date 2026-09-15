// product-except-self — approach 1 — Brute force: multiply the others, once per position
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force: multiply the others, once per position",
  idea: `*How do I get the product of everything except one element?* Loop over the whole array and multiply
in every element whose position is not the excluded one. Do that once for each of the \`n\` positions
and the whole answer is built, with no cleverness and no risk of being wrong.`,
  intuition: `> **Intuition.** A shopping receipt, and the question "what would the total be without item 3?".
> With no memory of anything you re-add every other line from scratch. Then someone asks the same
> about item 4, and you re-add every other line again — the same lines you just added, minus a
> different one. That is the shape here with multiplication instead of addition: \`n\` independent
> traversals, each rebuilding an almost-identical product. The reasoning has no notion that the
> answers are related to one another, and that missing relationship is the entire inefficiency.`,
  worked: `\`nums = [1, 2, 3, 4]\`.

| excluded \`i\` | inner walk (\`j\`, skipping \`j == i\`) | \`product\` after each step | \`out\` so far |
|---|---|---|---|
| 0 | \`j=1\` ×2, \`j=2\` ×3, \`j=3\` ×4 | 1 → 2 → 6 → **24** | \`[24]\` |
| 1 | \`j=0\` ×1, \`j=2\` ×3, \`j=3\` ×4 | 1 → 1 → 3 → **12** | \`[24, 12]\` |
| 2 | \`j=0\` ×1, \`j=1\` ×2, \`j=3\` ×4 | 1 → 1 → 2 → **8** | \`[24, 12, 8]\` |
| 3 | \`j=0\` ×1, \`j=1\` ×2, \`j=2\` ×3 | 1 → 1 → 2 → **6** | \`[24, 12, 8, 6]\` |

Sixteen index visits, twelve multiplications, for four answers. Rows \`0\` and \`1\` both multiply by 3
and by 4; rows \`2\` and \`3\` both multiply by 1 and by 2. Every shared factor is computed twice or
more, and that redundancy is what the rest of this document removes.`,
  code: `def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = EMPTY_PRODUCT
        for j in range(len(nums)):
            if j != i:  # the only position skipped
                product *= nums[j]
        out.append(product)
    return out`,
  mistake: `> **Watch out.** The misconception is that \`product = 1\` is **setup** — the kind of line that belongs
> at the top of a function next to the other declarations. It is not setup, it is part of the inner
> calculation: each position's product is a complete, self-contained computation that must start from
> a clean slate.

Hoisting it outside the outer loop carries the previous position's product into the next one, and
every answer after the first is garbage — on \`[1, 2, 3, 4]\` you get \`[24, 288, 2304, …]\`, growing
without bound. Initialising to \`0\` instead of \`1\` is the other half of the same misconception and
makes every answer \`0\`; the multiplicative identity is \`EMPTY_PRODUCT\`, not zero.`,
  cost: `**Time** \`O(n²)\`, **space** \`O(1)\` beyond the output. The cost comes from nesting: \`n\` positions,
each doing a full \`n\`-element walk, giving \`n²\` index visits. The only storage is the single
\`product\` accumulator; the output array is not counted because the problem demands it.

Use it when \`n\` is a handful of elements, and — more usefully — as the **oracle** the fast versions
are tested against. That is exactly its job in the test suite below: it is so plainly a transcription
of the statement that if a linear version ever disagrees with it, the linear version is what is
broken.

---`,
}
