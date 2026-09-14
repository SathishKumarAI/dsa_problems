// window-maximum — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Imagine a cardboard strip with a slot cut in it, laid over a row of numbers so that exactly \`k\` of them
show through. You slide the strip one place to the right at a time, and each time you write down the
largest number currently visible. When the slot reaches the end, you hand over the list you wrote.

That is the whole problem: given an array and a width \`k\`, report the maximum of every contiguous window
of that width, left to right.

**The core question:** as the slot advances by one, what is the largest number now visible? The naive
approach is slow because it answers that by looking at all \`k\` visible numbers every single time, when
\`k - 1\` of them are the same numbers it looked at a moment ago.

The difficulty is specific and worth naming up front. Sums are easy to slide — add the entering number,
subtract the leaving one — because subtraction undoes addition. **Maxima do not undo.** If the number
that just left happened to be the maximum, nothing in a running "current max" tells you what the new
maximum is; the information was thrown away when the smaller values were discarded. Every approach below
is a different answer to *what do I keep so that a departure does not destroy my answer?*

### The constraints, and what each one unlocks

Note what is **absent**: nothing says the values are distinct. Repeats are legal, and two of the three
common mistakes below only surface on repeated values.

There is also no "no answer" case for this problem. Every window of a legal width has a maximum, so the
test suite's nearest equivalents are the minimal input (\`[5]\`, \`k = 1\`) and the single-window case
(\`k = n\`).
### The worked example used in every section below

\`\`\`
nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3        answer: [3, 3, 5, 5, 6, 7]

index:   0  1   2   3  4  5  6  7
value:   1  3  -1  -3  5  3  6  7
\`\`\`

Six windows: \`[1,3,-1]\`, \`[3,-1,-3]\`, \`[-1,-3,5]\`, \`[-3,5,3]\`, \`[5,3,6]\`, \`[3,6,7]\`.

### Shared scaffolding

One decision recurs in two approaches, so it is named once. It is harness for reading the code, not part
of any answer:

\`\`\`python
def expired(index: int, right: int, k: int) -> bool:
    """Has \`index\` fallen out of the window of width k that ends at \`right\`?"""
    return index <= right - k
\`\`\`

The window ending at \`right\` covers \`right - k + 1 .. right\`, so anything at or below \`right - k\` is
outside it. Both the heap and the deque ask this question; they differ entirely in *what they can do
about the answer*.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 10^5`",
    "what": "Forbids the per-window scan in the worst case. With `n = 10⁵` and `k ≈ n/2`, `n · k` is about 2.5·10⁹ comparisons. Note that the scan is fine for *small* `k` — the constraint rules out the algorithm's worst case, not the algorithm on every input."
  },
  {
    "constraint": "`-10^4 <= nums[i] <= 10^4`",
    "what": "Honestly: this unlocks nothing algorithmic. There is no counting trick here, because the answer is a maximum *per window*, not a global statistic. It matters in **Java and C++**, where a comparator written `(a, b) -> b[0] - a[0]` is only safe because the subtraction of two values in this range cannot overflow a 32-bit `int`. It also means there is no sentinel value like `-1` you can use for \"empty\" — negatives are real data."
  },
  {
    "constraint": "`1 <= k <= nums.length`",
    "what": "The window always fits, so the output length is exactly `n - k + 1` and is never empty. No approach needs an \"impossible width\" branch."
  },
  {
    "constraint": "`k = 1` returns the array itself; `k = n` returns one value",
    "what": "The two degenerate ends, and both are real tests. `k = 1` means every value is its own window's maximum and the deque never holds more than one index; `k = n` means the front never expires and the answer is a single global maximum."
  }
]
