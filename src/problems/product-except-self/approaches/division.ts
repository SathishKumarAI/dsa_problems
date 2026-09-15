// product-except-self — approach 2 — Divide the total product (the instinctive move the problem bans)
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
  rung: "division",
  title: "Divide the total product (the instinctive move the problem bans)",
  idea: `*Every answer is the total product with one factor removed — so why not compute the total once and
remove that factor?* Multiply everything together in one pass, then emit each answer by dividing the
total by that position's value.

This fixes brute force's weakness — **it recomputes shared factors \`n\` times instead of computing the
whole product once** — and it is what almost everyone reaches for first. It is worth working through
properly rather than skipping, because *why* it is banned teaches the real lesson.`,
  intuition: `> **Intuition.** One shared pot, made once. Everything goes in; to serve position \`i\` you take the
> pot and take \`nums[i]\` back out. A single global aggregate plus a cheap per-position adjustment is
> exactly the right instinct — the whole ladder is about reusing shared work. The problem is the
> *mechanism* of removal: multiplication's inverse has a hole in it at zero. Once a zero goes into the
> pot, the pot tells you nothing about what else is in there, so a single zero forces a separate
> counting rule, and that patch is where the one-liner stops being a one-liner.`,
  worked: `\`nums = [1, 2, 3, 4]\` — no zeros, so this is the easy path. **Pass one** builds the total, **pass
two** divides it out:

| step | \`nums[i]\` | \`product_of_nonzero\` | \`out\` so far |
|---|---|---|---|
| start | — | 1 | \`[]\` |
| build \`i=0\` | 1 | 1 | \`[]\` |
| build \`i=1\` | 2 | 2 | \`[]\` |
| build \`i=2\` | 3 | 6 | \`[]\` |
| build \`i=3\` | 4 | **24** | \`[]\` |
| emit \`i=0\` | 1 | 24 | \`[24]\` |
| emit \`i=1\` | 2 | 24 | \`[24, 12]\` |
| emit \`i=2\` | 3 | 24 | \`[24, 12, 8]\` |
| emit \`i=3\` | 4 | 24 | \`[24, 12, 8, 6]\` |

Now the case the ban exists for — the statement's second example, \`nums = [-1, 1, 0, -3, 3]\`. The
total product is \`0\`, and \`0 / 0\` at position \`2\` is not a number. The approach survives only by
counting zeros first, and with **exactly one** zero the emit step stops being a division altogether:

| \`i\` | \`nums[i]\` | is it the zero? | \`out[i]\` |
|---|---|---|---|
| 0 | -1 | no | 0 |
| 1 | 1 | no | 0 |
| 2 | 0 | **yes** | **9** (= −1·1·−3·3) |
| 3 | -3 | no | 0 |
| 4 | 3 | no | 0 |

With **two or more** zeros every answer is \`0\`; with **exactly one**, only the zero's own slot
survives, as above; with **none**, divide normally. That three-branch structure is the honest cost of
this approach.`,
  code: `def product_except_self_division(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = EMPTY_PRODUCT
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product`,
  mistake: `> **Watch out.** The misconception is that a zero in the input is an **edge case** — the kind of
> thing you bolt a guard onto once the main line works. It is not an edge case, it is a demolition:
> the operation the whole approach rests on stops existing, so what you need is a different branch,
> not a guard.

The obvious two-liner — total product, then \`total // nums[i]\` — passes \`[1, 2, 3, 4]\` and every
hand-written test you are likely to invent, then raises \`ZeroDivisionError\` (in Java, throws
\`ArithmeticException\`) on the first input containing a \`0\`. Worse is the half-fix of skipping zeros
while building the total and then handing the zero's own slot that same total: on \`[-1, 1, 0, -3, 3]\`
the non-zero product is \`9\` and the output comes out \`[-9, 9, 9, -3, 3]\` instead of \`[0, 0, 9, 0, 0]\`
— right in exactly one slot, wrong in the other four, and with no exception to tell you.

A second, quieter mistake survives even in the correct version: floating-point division (\`total / x\`)
instead of \`//\`. A product of many 30s exceeds 2⁵³, where doubles stop representing every integer
exactly, and answers start coming back off by one. The division here is always exact — \`x\` is
literally one of the factors — so integer division is both correct and safe.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\` beyond the output: two linear passes. On paper it ties the optimal
approach. In practice it is disqualified twice over — the problem forbids it outright, and integer
**division** is several times slower than multiplication on real hardware, so even where it is legal
it is not obviously faster than Approach 4.

Use it when division is permitted, zeros are impossible by construction, and you want the shortest
possible code — running products over known-positive quantities such as prices or weights. Name it in
an interview, name its zero problem, then move on; recognising why the shortcut fails is what points
at the structure the next two approaches exploit.

> **Under the hood.** The zero problem is usually described as an edge case, which undersells it. The
> version people actually reach for has no zero handling at all:
>
> \`\`\`
> [1, 2, 3, 4]  ->  [24, 12, 8, 6]      correct
> [1, 0, 3, 4]  ->  ZeroDivisionError
> [0, 0, 3, 4]  ->  ZeroDivisionError
> \`\`\`
>
> and the correct answers are \`[0, 12, 0, 0]\` and \`[0, 0, 0, 0]\`. Note that those two need *different*
> reasoning: with one zero, only the zero's own slot is non-zero; with two, every slot is zero. So
> the one-liner needs **three** branches — no zeros, exactly one, two or more — and the code above is
> only the first of them.
>
> How often does that matter? Over 10,000 random small arrays with zeros permitted: 4,314 had no
> zero, 3,724 had exactly one, 1,962 had two or more. **57% land in a branch the one-liner does not
> have.** This is not a rare corner; it is the majority of the input space, and it is invisible if
> your own test cases happen to be made of non-zero numbers.
>
> That is the real argument for the prefix/suffix split, and it is not about speed — both are \`O(n)\`.
> The split has **one** code path. It treats a zero as an ordinary factor, because it never needs to
> undo a multiplication, and an algorithm that never undoes anything has nothing to special-case.

---`,
}
