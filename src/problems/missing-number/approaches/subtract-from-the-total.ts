// missing-number — approach 4 — Subtract from the total
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "subtract-from-the-total",
  title: "Subtract from the total",
  idea: `*Placing values home is constant space, but it destroys the caller's array and still needs a second
scan to locate the hole. Is there a way to name the missing number without looking for it at all?*
Yes. The numbers 0 through n add up to a value you can compute from n alone: n(n+1)/2. The array
contains all of them except one. Subtract what the array actually holds from what the complete set
should hold, and what is left over is the missing number. This fixes the in-place rung's two
weaknesses at once — the mutation and the second pass.`,
  intuition: `Weigh the bag. You know what a complete set of these numbers weighs, because there is a closed-form
formula for it. You put the actual bag on the scale and it comes out light. The difference is the
weight of the one item that is not in it — and you never had to open the bag, sort it, or look for a
gap. This is a *different kind of reasoning* from every rung above: those three all searched for an
absence, and this one deduces it from a property of the whole. That switch, from searching to
deducing, is the idea this problem exists to teach.

The distinctness constraint is what makes it valid. If a value could appear twice, the sum would be
off by that value too, and the difference would no longer name a single number.`,
  worked: `Input: \`nums = [3, 0, 1]\`, n = 3.

The complete set 0+1+2+3 = 3 × 4 / 2 = **6**.

| Step | Value subtracted | Running total |
|---|---|---|
| start | — | 6 |
| 1 | 3 | 3 |
| 2 | 0 | 3 |
| 3 | 1 | **2** |

Answer 2. One pass, one integer of state, no second scan, and the array is never touched. Compare with
the in-place rung on the same input: two swaps, a permuted array, and a second walk.`,
  code: `def missing_number_subtract_from_total(nums: list[int]) -> int:
    n = len(nums)
    total = n * (n + 1) // 2  # integer division: n*(n+1) is always even
    for x in nums:
        total -= x
    return total`,
  mistake: `Computing the sum of the array first and then subtracting — \`return total - sum(nums)\` — is fine in
Python, where integers are arbitrary precision, and is a genuine bug in Java, C++, C# or Rust. With
n = 10⁵ the expected total is about 5 × 10⁹, which overflows a signed 32-bit \`int\` and produces a
negative number; the subtraction then yields garbage. Subtracting *as you go*, as the code above does,
keeps the running value bounded by n(n+1)/2 only at the start and shrinking thereafter — which helps
but does not save you, because the initial \`n * (n + 1) / 2\` itself overflows at n ≈ 65,536 in 32-bit
arithmetic. The real fixes in a fixed-width language are to use a 64-bit accumulator, or to interleave
(\`total += i - nums[i]\` for each i, which never grows past n), or to use the XOR version below, which
cannot overflow at all.

The second mistake is writing \`n * (n + 1) / 2\` in Python with a single slash. That is float division:
it returns \`6.0\`, and the function returns \`2.0\` instead of \`2\`. Comparisons against an integer answer
still pass, so this survives testing and then fails when the result is used as an index.`,
  cost: `**Time O(n), space O(1).** One pass, one subtraction per element, and one integer of state. The
closed-form total is computed in constant time, which is the whole trick — you never enumerate the
complete set, you just know what it weighs.

This is the right choice when you want the shortest correct code, the input must survive, and you are
working in a language where the intermediate value cannot overflow (or you have reached for a wide
enough accumulator deliberately). It is also the one to derive on the spot if you have forgotten
everything else, because Gauss's formula is easier to recall under pressure than any bit trick.

---`,
}
