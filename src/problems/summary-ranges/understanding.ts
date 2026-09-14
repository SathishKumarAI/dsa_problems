// summary-ranges — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed a list of whole numbers, already in increasing order with no repeats, and asked to
describe it as compactly as possible. Wherever the numbers run on consecutively — 0, 1, 2 — you write
that stretch as \`"0->2"\` instead of listing it. A number with no consecutive neighbour on either side
stands alone and is written bare, as \`"7"\`, never as \`"7->7"\`.

**The core question:** where does one consecutive stretch end and the next begin? The naive approach
is slow not because of the *count* of numbers — there are at most twenty — but because of how far
apart their **values** can be: walking the number line from the smallest value to the largest visits
every integer in between, and the values may be four billion apart.

That distinction is the whole difficulty of this problem, and it is the misconception worth naming
before any code.

> **Watch out.** The thought to correct is *"twenty numbers, so any approach is fast enough."* Cost
> here can be driven by the **span** rather than the length. \`[1, 1000000000]\` is two numbers and a
> billion steps for anything that walks the number line, and on the real bounds such a walk cannot
> even allocate its scratch space. Ask of every rung: does its work follow the size of the *input* or
> the size of the *numbers in it*?

Underneath all five rungs is one observation, and it is worth stating up front because four of them
are just different ways of using it.

> **Why it works.** In a sorted array of distinct integers, a **consecutive run is exactly a maximal
> block where \`nums[i] - i\` is constant.** Inside a run each step adds 1 to the value and 1 to the
> index, so the difference does not move; at a gap the value jumps by more than 1 while the index
> jumps by exactly 1, so the difference strictly increases. Grouping by that key and scanning for
> where it changes are therefore the same operation seen from two sides.

### The constraints, and what each one unlocks

The worked example used in every section below is the statement's second — chosen because it contains
three runs of length one *and* two genuine ranges, so every rung has to make the bare-versus-arrow
decision more than once:

\`\`\`
nums = [0, 2, 3, 4, 6, 8, 9]        answer: ["0", "2->4", "6", "8->9"]
\`\`\`
### Shared scaffolding

Every rung ends the same way: given a run's first and last value, print one string. That decision
appears five times, so it lives in one named helper and nowhere else.

\`\`\`python
def format_range(first: int, last: int) -> str:
    """A one-value run prints bare; anything longer prints as first->last."""
    return str(first) if first == last else f"{first}->{last}"
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= nums.length <= 20`",
    "what": "**The empty array is legal input** and must come back as an empty list, so nothing may read `nums[0]` before checking there is one. Twenty is small enough that an `O(n log n)` rung costs nothing measurable — the ladder here is about *shape*, not speed."
  },
  {
    "constraint": "`-2^31 <= nums[i] <= 2^31 - 1`",
    "what": "Values may be negative and astronomically far apart. **This is what forbids Approach 1**: a boolean per value between the smallest and largest needs over four billion slots in the worst case. It is also why the output must handle a leading `-`."
  },
  {
    "constraint": "`nums` is sorted strictly ascending",
    "what": "**The permission slip for every rung after the second.** Already ordered means values sharing a `value - index` key are already adjacent, so no map and no re-sorting are needed — a straight left-to-right scan finds the same groups. No duplicates means \"consecutive\" is exactly `+1`, with no equal-value case to skip."
  },
  {
    "constraint": "a run of length one prints bare, never as `\"x->x\"`",
    "what": "A formatting rule with teeth: it is the single decision every rung must make identically, which is why it is lifted into one helper below."
  },
  {
    "constraint": "ranges come out ascending, covering every value exactly once",
    "what": "No value may appear in two ranges, and none may be dropped. The natural failure is losing the **final** run, which has no gap after it to announce it."
  }
]
