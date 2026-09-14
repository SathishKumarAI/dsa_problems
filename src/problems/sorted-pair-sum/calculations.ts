// sorted-pair-sum — the symbol table, and how to trace it by hand
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const calculations = `The optimal solution here is four lines and one decision. The decision is the whole problem, and it
is the kind that looks arbitrary until you see what it throws away.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| \`lo\` | a **position**, starting at the smallest value | The array is sorted, so \`lo\` is the cheapest element still in play | — |
| \`hi\` | a **position**, starting at the largest | Likewise, the most expensive one still in play | — |
| \`nums[lo] + nums[hi]\` | the sum of the **cheapest and dearest** pair still available | Not any pair — the two extremes, which is what makes the comparison informative | Comparing two arbitrary elements tells you nothing about the others |
| \`lo += 1\` | "give up on \`nums[lo]\` **entirely**" | Not "try the next one" — the value at \`lo\` is gone for good, and the next section says why that is safe | Moving both pointers at once skips pairs that were never tested |
| \`hi -= 1\` | "give up on \`nums[hi]\` entirely" | | |
| \`while lo < hi\` | "there are still at least two different slots" | \`<\`, not \`<=\`: at \`lo == hi\` you would be pairing one element with itself | \`<=\` returns a pair of identical indices, which the statement forbids |

### The one decision, and what it eliminates

Everything rests on one comparison and three outcomes:

| The sum is | What that means | What you do |
|---|---|---|
| **too small** | even the largest partner cannot lift \`nums[lo]\` to the target | discard \`nums[lo]\`: \`lo += 1\` |
| **too big** | even the smallest partner cannot bring \`nums[hi]\` down to the target | discard \`nums[hi]\`: \`hi -= 1\` |
| **equal** | done | return the pair |

> **Why it works.** The move looks like a guess and is a proof. Suppose \`nums[lo] + nums[hi] <
> target\`. \`nums[hi]\` is the **largest value still available**, so it is the best partner \`nums[lo]\`
> could ever have — and it is not enough. Every other partner is smaller, so every remaining pair
> containing \`nums[lo]\` is smaller still, and none of them can reach the target. One comparison
> therefore eliminates **n − 1 pairs**, not one.

On the running example, \`nums = [1, 3, 6, 9]\`, \`target = 12\` — the script prints this:

\`\`\`
at lo=0 hi=3 the sum is 10 < 12, so nums[0] = 1 is discarded.
What goes with it — every pair that uses it:
    1 + 3 =  4  < 12   cannot be the answer
    1 + 6 =  7  < 12   cannot be the answer
    1 + 9 = 10  < 12   cannot be the answer
\`\`\`

That is the entire idea. The sortedness is not a convenience; it is what makes one comparison speak
for a whole row of the table.

### The trace, in full

| Step | \`lo\` | \`hi\` | \`nums[lo] + nums[hi]\` | vs \`12\` | Action |
|---|---|---|---|---|---|
| 1 | \`0\` | \`3\` | \`1 + 9 = 10\` | too small | \`lo += 1\` |
| 2 | \`1\` | \`3\` | \`3 + 9 = 12\` | **equal** | return \`[1, 3]\` |

Two comparisons on a four-element array where six pairs exist.

### How to trace it by hand

\`\`\`
  lo   hi   nums[lo]   nums[hi]   sum   vs target   move
\`\`\`

1. Start \`lo\` at the far left, \`hi\` at the far right.
2. Each row: add the two values, compare to the target, and move **exactly one** pointer inward.
3. Never move both. Moving both skips the pair made of the two new positions, which you have not
   tested.
4. Stop when the sums match, or when \`lo\` and \`hi\` meet — at which point no pair exists.

### Reading a complexity out loud

Each step retires one position and no step ever revisits one, so the loop runs at most \`n − 1\`
times: \`O(n)\`, with \`O(1)\` extra memory — two integers.

Counted rather than argued, on \`[1 … n]\` with the answer at the far end — every row printed by the
script:

| \`n\` | Pairs that exist | Brute force examines | Two pointers compare |
|---|---|---|---|
| \`4\` | \`6\` | \`6\` | \`3\` |
| \`100\` | \`4 950\` | \`4 950\` | \`99\` |
| \`1 000\` | \`499 500\` | \`499 500\` | \`999\` |
| \`10 000\` | \`49 995 000\` | \`49 995 000\` | \`9 999\` |

Ten times the input multiplies the brute force by a hundred and the two-pointer walk by ten. That is
\`O(n²)\` against \`O(n)\`, in numbers you can check.

---


---`
