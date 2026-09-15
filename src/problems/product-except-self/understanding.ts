// product-except-self — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Imagine four price tags on a table and someone asking, of each one in turn, "what do the *other*
three multiply to?" That is the whole problem: hand back a list of the same length where slot \`i\`
holds the product of everything in the original list except the number sitting in slot \`i\`. Two rules
make it interesting — you may not divide, and the whole thing must run in time proportional to the
list's length rather than its square.

**The core question:** for every position, what is the product of the whole list *minus one element*?
The naive approach is slow because it treats each of the \`n\` positions as an unrelated problem and
rebuilds an almost-identical product from scratch — when the answer for position 5 and the answer for
position 6 share all but two of their factors.

The **no-division** rule looks arbitrary and is not. Division would let you compute the total once
and divide it out per position — one line, finished — except that it dies the moment a zero appears.
Banning it forces you to find the *structure*: everything except position \`i\` splits cleanly into
**everything to the left of \`i\`** and **everything to the right of \`i\`**, two questions that never
overlap.

### The constraints, and what each one unlocks

One rung of the usual ladder has no analogue here, and it is worth saying why. There is no "sort the
input and search it" step, because the answer is *indexed by position* — slot \`i\` of the output is
about slot \`i\` of the input — and sorting destroys precisely that correspondence. This ladder is
instead about how much **partial work** you keep around and reuse.

The worked example used in every section below is the statement's own:

\`\`\`
nums = [1, 2, 3, 4]        answer: [24, 12, 8, 6]
\`\`\`

Check it by hand once: position \`0\` gets 2·3·4 = 24, position \`1\` gets 1·3·4 = 12, position \`2\` gets
1·2·4 = 8, position \`3\` gets 1·2·3 = 6.

One value recurs in every approach below and is worth naming rather than typing four times — the
**empty product**, the thing a running product starts from before any factor has joined it:

\`\`\`python
EMPTY_PRODUCT = 1  # the product of no numbers at all; every accumulator below starts here
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`2 <= nums.length <= 10^5`",
    "what": "A hundred thousand elements makes the `O(n²)` version about 10¹⁰ multiplications — hopeless. **This is what rules brute force out.** The lower bound of `2` also means the product of everything else is never an empty product, so there is no argument to have about a single-element list."
  },
  {
    "constraint": "`-30 <= nums[i] <= 30`",
    "what": "Values are small and may be negative or zero. The negatives are a reminder that **signs** matter: an even number of negative factors flips back to positive. This bound does **not** unlock direct indexing, because the values here are never used as lookup keys — nothing is being searched for."
  },
  {
    "constraint": "every answer fits in a 32-bit integer",
    "what": "**This unlocks fixed-width arithmetic**: in Java or C++ every running product can live in a plain `int`. One subtlety, covered in Approach 4 — the running variable's *final* update in each pass can exceed 32 bits, but that value is never read."
  },
  {
    "constraint": "division is off the table, and the array may contain zeros",
    "what": "**This is what forces the prefix/suffix structure.** With a zero present, division needs a separate counting-of-zeros special case to be correct at all, while a prefix/suffix sweep treats a zero exactly like any other number."
  }
]
