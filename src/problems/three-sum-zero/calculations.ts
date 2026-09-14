// three-sum-zero — the symbol table, and how to trace it by hand
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const calculations = `This problem is the previous one wearing a hat. If you can read \`sorted-pair-sum\`, the only new
things here are **one subtraction** and **three duplicate skips** — and the skips are where almost
everyone's first attempt goes wrong.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| \`s = sorted(nums)\` | a sorted **copy** | Sorting buys two separate things, below. A copy, because the caller's array is not yours to reorder | Sorting in place silently reorders the caller's data |
| \`i\` | the **anchor** — the position of the first member of the triple | Fixing one value turns a three-way search into a two-way one | — |
| \`need = -s[i]\` | what the **other two** must add up to | If \`a + b + c == 0\` then \`b + c == -a\`. One subtraction, and the problem becomes the previous problem | \`+s[i]\` searches for a triple summing to \`2·s[i]\`, which is a different question |
| \`lo\`, \`hi\` | the converging pair, searching **only to the right of the anchor** | Starting \`lo\` at \`i + 1\` is what stops a triple being found twice in two different orders | \`lo = 0\` re-finds every earlier triple, permuted |
| \`s[i] == s[i - 1]\` | "this anchor is a repeat of the last one" | Sorted, so equal values are neighbours. Its triples were all recorded on the previous pass | Without it, \`[-1, -1, …]\` reports \`(-1, 0, 1)\` twice |
| \`s[lo] == s[lo - 1]\` after a hit | "this partner is a repeat" | Same reason, one level in | \`[-2, 0, 0, 2, 2]\` reports \`(-2, 0, 2)\` twice |

### The one subtraction

\`\`\`
   a + b + c == 0          three unknowns
   b + c == -a             fix a, and the rest is a two-sum with target -a
\`\`\`

That is the whole reframing. Fix each value in turn as the anchor, and what is left is exactly the
problem solved in \`sorted-pair-sum\`: find two values in a sorted range that hit a target, by walking
one pointer in from each end.

### Why sorting is worth it twice

Sorting costs \`O(n log n)\`, and it is easy to read that as the price of admission. It is not — it
buys **two** separate things, and the second is the one people forget:

| Sorting gives you | Which makes possible |
|---|---|
| an order | the two-pointer walk: comparing the ends tells you which end to retire |
| **equal values side by side** | duplicate skipping in \`O(1)\` — "is this the same as the one before?" |

Without the second, the natural fix for duplicates is a \`set\` of triples you have already emitted,
which costs memory and hashes every triple. With it, the check is one comparison with the neighbour.

Measured on the running example — every line printed by the script:

\`\`\`
combinations that sum to zero, unsorted input: [(-1, 0, 1), (-1, 2, -1), (0, 1, -1)]
distinct as sets:                              [(-1, -1, 2), (-1, 0, 1)]
\`\`\`

Three raw triples, two real answers. The array holds \`-1\` twice, so the same triple is reachable by
two different routes — and after sorting, those two routes become adjacent positions, which is why
one comparison removes it.

### The trace, in full

\`nums = [-1, 0, 1, 2, -1, -4]\`, sorted to \`[-4, -1, -1, 0, 1, 2]\`:

| \`i\` | anchor | \`need = -s[i]\` | The pair walk over the rest |
|---|---|---|---|
| \`0\` | \`-4\` | \`4\` | \`-1+2=1 <4\` → \`-1+2=1 <4\` → \`0+2=2 <4\` → \`1+2=3 <4\` → pointers meet, nothing |
| \`1\` | \`-1\` | \`1\` | \`-1+2=1\` **hit** → \`(-1, -1, 2)\`; then \`0+1=1\` **hit** → \`(-1, 0, 1)\` |
| \`2\` | \`-1\` | — | **skipped**: same as the previous anchor, its triples are already recorded |
| \`3\` | \`0\` | \`0\` | \`1+2=3 > 0\` → \`hi--\` → pointers meet, nothing |

Answer: \`[(-1, -1, 2), (-1, 0, 1)]\`.

Row \`2\` is the duplicate skip earning its place. Without it the anchor \`-1\` runs again and finds
\`(-1, 0, 1)\` a second time.

### How to trace it by hand

\`\`\`
  i   anchor   need   lo   hi   s[lo]+s[hi]   vs need   action
\`\`\`

1. Sort first, and write the sorted array above the table. Every index below refers to it.
2. For each anchor: skip it if it equals the one before, or you will re-find its triples.
3. Inside, run \`sorted-pair-sum\` over \`s[i+1 …]\` with target \`-s[i]\`.
4. **On a hit, move both pointers**, then skip any partner equal to the one just used. Moving only
   one pointer after a hit re-finds the same pair.
5. Stop the inner walk when the pointers meet, and move to the next anchor.

### Reading a complexity out loud

The outer loop is \`O(n)\` anchors and the inner walk is \`O(n)\`, so the search is \`O(n²)\`. The sort is
\`O(n log n)\`, which is **smaller**, so it disappears into the total — the step that looks like the
expensive one is the cheap one.

What \`O(n²)\` buys, counted rather than argued:

| \`n\` | Triples that exist | Inner steps taken |
|---|---|---|
| \`6\` | \`20\` | \`10\` |
| \`50\` | \`19 600\` | \`1 112\` |
| \`200\` | \`1 313 400\` | \`18 440\` |
| \`800\` | \`85 013 600\` | \`299 301\` |

At \`n = 800\` there are eighty-five million triples and the walk looks at under three hundred
thousand steps. That gap is the anchor-plus-two-pointers idea, in numbers.

---


---`
