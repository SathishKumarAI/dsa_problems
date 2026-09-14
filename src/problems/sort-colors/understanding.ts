// sort-colors — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

export const understanding = `You are handed an array in which every entry is a \`0\`, a \`1\` or a \`2\` — nothing else ever appears.
Rearrange it so that all the zeroes come first, then all the ones, then all the twos. You must do
it inside the array you were given, and you must do it in a single pass: each element gets looked
at a constant number of times, not a logarithmic number.

**The core question is: for each element, which of the three regions does it belong to, and how do
I get it there without disturbing the elements already placed?** The naive approach — hand the
array to a general-purpose sort — is slow because a comparison sort has to be prepared for any
ordering relation at all, so it pays O(n log n) comparisons to discover an ordering that you were
*told in advance*: there are three values and you already know which comes first.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| \`1 <= nums.length <= 300\` | Tiny. Honestly, at n = 300 every approach on this page finishes instantly, and the problem is not really about speed — it is about the technique. It also means the array is never empty, so \`nums[0]\` always exists. |
| **\`nums[i]\` is \`0\`, \`1\` or \`2\` — three values, known in advance** | The load-bearing constraint. A fixed, tiny, *known* alphabet is what makes counting work at all (three counters, not a dictionary) and it is what makes the one-pass version work: with three values there are exactly three regions, so three boundary indices are enough to describe the entire state of the array mid-walk. |
| **The rearrangement must happen in place** | This one is a constraint on the **answer**, not on the input, and the distinction is worth making because it changes what you are allowed to do rather than what you are given. The input is an ordinary array; nothing about it forbids building a second one. What is forbidden is *delivering* the answer as a fresh array — the caller holds a reference to the original and expects to see it reordered. So an approach is disqualified not for being slow but for producing its answer in the wrong place. |
| One pass: each element examined a constant number of times | This is what separates the two approaches below. Counting reads every element twice — once to count, once to overwrite — and that is the specific thing the famous solution removes. |

That third row is the one people skim past. "In place" does not mean "you may not use an extra
variable"; it means the result must end up in the caller's own array. Counting-and-rewriting
satisfies it (it writes back into \`nums\`), so it is a legal answer — it just reads the array twice
and, as the next section shows, has a property that quietly disqualifies it for a whole class of
real uses.

---`
