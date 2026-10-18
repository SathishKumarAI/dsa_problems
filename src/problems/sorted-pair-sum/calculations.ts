// sorted-pair-sum — the symbol table, and how to trace it by hand
//
// Rewritten 2026-10-17 for reading. Kept: the symbol table (nowhere else on
// the page names what `lo` and `hi` MEAN), the three-outcome decision, the
// printed elimination, and the counted table. Dropped: the full trace (the
// optimal rung's worked example is the same two rows) and the complexity
// paragraph (the page's own "how that was counted" says it).

export const calculations = `Four lines of code and one decision. The decision is the whole problem.

### The symbol table

| You will see | It means | Why it is written that way |
|---|---|---|
| \`lo\` | the **cheapest** position still in play | sorted, so the far left is the smallest value left |
| \`hi\` | the **dearest** position still in play | likewise, the far right |
| \`nums[lo] + nums[hi]\` | the sum of the two **extremes** | not any pair — the extremes are what make one comparison informative |
| \`lo += 1\` | "give up on \`nums[lo]\` **for good**" | not "try the next one": the value at \`lo\` is out of every remaining pair |
| \`hi -= 1\` | "give up on \`nums[hi]\` for good" | the mirror |
| \`while lo < hi\` | "two different slots remain" | \`<\`, not \`<=\`: at \`lo == hi\` you would pair an element with itself |

### The one decision

| The sum is | What that proves | What you do |
|---|---|---|
| **too small** | even the largest partner cannot lift \`nums[lo]\` to the target | retire \`nums[lo]\`: \`lo += 1\` |
| **too big** | even the smallest partner cannot bring \`nums[hi]\` down to it | retire \`nums[hi]\`: \`hi -= 1\` |
| **equal** | done | return the pair |

What one "too small" throws away, on \`nums = [1, 3, 6, 9]\`, \`target = 12\` — the script prints it:

\`\`\`
at lo=0 hi=3 the sum is 10 < 12, so nums[0] = 1 is discarded.
What goes with it — every pair that uses it:
    1 + 3 =  4  < 12   cannot be the answer
    1 + 6 =  7  < 12   cannot be the answer
    1 + 9 = 10  < 12   cannot be the answer
\`\`\`

One comparison retired three pairs, not one. That is what sorted order buys.

### Trace it by hand

- Start \`lo\` at the far left and \`hi\` at the far right.
- Each row: add the two values, compare with the target, move **exactly one** pointer inward.
- Never move both — the pair made of the two new positions was never tested.
- Stop on a match, or when \`lo\` meets \`hi\`: then no pair exists.

### Count it, do not argue it

On \`[1 … n]\` with the answer at the far end — every row printed by the script:

| \`n\` | Pairs that exist | Brute force examines | Two pointers compare |
|---|---|---|---|
| \`4\` | \`6\` | \`6\` | \`3\` |
| \`100\` | \`4 950\` | \`4 950\` | \`99\` |
| \`1 000\` | \`499 500\` | \`499 500\` | \`999\` |
| \`10 000\` | \`49 995 000\` | \`49 995 000\` | \`9 999\` |

Ten times the input: brute force ×100, the walk ×10. That is O(n²) against O(n), in numbers you
can check.
---`
