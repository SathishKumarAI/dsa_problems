// sorted-pair-sum — approach 2 — Hash map
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "hash",
  title: "Hash map",
  idea: `*The brute force re-scans the tail to ask "does \`target - nums[i]\` exist?" — can that question be
answered in one step instead of n?* Yes: remember every value you have already walked past in a
dictionary keyed by value, and the existence check becomes a single lookup. This fixes the brute
force's exact weakness — the restarted inner scan — by paying memory to keep what it learned.`,
  intuition: `Think of a guest list you are filling in as people arrive. Each new arrival asks "has my partner
checked in yet?", you glance at the list, and if the partner is there you are done; otherwise you
write the new arrival down and call the next one. One pass, one question per person, and the
answer to each question is already sitting in the book. The trade is explicit: the book grows to
the size of the crowd. Note also what this approach does *not* use — it never once looks at the
fact that the queue arrived in sorted order.

> **Under the hood.** The hash rung's \`O(n)\` and the two-pointer rung's \`O(n)\` are not the same
> \`O(n)\` — the map allocates a table, hashes every key, and rehashes the lot each time the load
> crosses two thirds, while the pointer walk allocates nothing but two integers. So the walk must be
> faster. **It is not, and that is the lesson.** Measured on this machine, per element:
>
> | \`n\` | building the dict | the two-pointer scan |
> |---|---|---|
> | \`10 000\` | \`34.0 ns\` | \`38.8 ns\` |
> | \`100 000\` | \`39.1 ns\` | \`38.7 ns\` |
>
> Level, and at the smaller size the *allocating* version wins. The reason is that the dict
> comprehension runs entirely inside the interpreter's C, while the \`while\` loop is Python bytecode
> — an add, a compare and two name lookups per step, each costing more than the hash it is supposedly
> saving. The pointer walk's real advantage in CPython is **memory**: \`O(1)\` against \`O(n)\`, which is
> the difference between two integers and a table of \`n\` entries, and that gap does not close. In a
> compiled language the time picture flips, because there the loop is three instructions and the
> allocator is not.
>
> Two things worth taking from a table that refutes its own paragraph: a complexity class is a
> statement about **growth**, never about speed at a given size; and the constant factors in an
> interpreted language often run opposite to the algorithm's shape, which is why "I profiled it"
> beats "it is O(n)" every time.`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | Needs \`12 - value\` | Map contents *before* the lookup | Action |
|---|---|---|---|---|
| 1 | 0 (1) | 11 | \`{}\` | miss → store \`1 → 0\` |
| 2 | 1 (3) | 9 | \`{1: 0}\` | miss → store \`3 → 1\` |
| 3 | 2 (6) | 6 | \`{1: 0, 3: 1}\` | miss → store \`6 → 2\` |
| 4 | 3 (9) | 3 | \`{1: 0, 3: 1, 6: 2}\` | **hit**, \`3\` is at index 1 → return \`[1, 3]\` |

Four steps and a map that grew to three entries. Compare with the five sum checks of brute force;
the win is invisible at n = 4 and enormous at n = 30,000.`,
  code: `def sorted_pair_sum_hash_map(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # look up BEFORE storing, or x pairs with itself
            return [seen[target - x], i]
        seen[x] = i
    return []`,
  mistake: `Storing the current value in the map *before* doing the lookup. Then with \`target = 8\` and a \`4\`
in the list, the value \`4\` finds itself as its own partner and the function returns \`[2, 2]\`. The
order matters and it is not arbitrary: look up first (which searches only the strictly earlier
elements), then store. The second classic version of this bug is the one that bites when the
array had to be sorted by *you*: if you sort a copy in order to use a sorted technique and then
report the indices you found, **you are reporting positions in the sorted copy, not in the array
the caller gave you.** Sorting destroys the original indices. Here the input arrives sorted, so
the question never comes up — but the moment you sort an unsorted input and the answer is
*indices*, you must carry the original positions along (pair each value with its index before
sorting) or the answer is silently wrong.`,
  cost: `**Time O(n), space O(n).** The time is one pass with an O(1) expected lookup and insert per
element; the space is the map, which in the worst case holds every element before the answer is
found. The bounded value range (\`-1000..1000\`) keeps the constants small, but the map is still
proportional to n.

This is the right answer when the array is **not** sorted, when you are not allowed to reorder it,
or when the target is not a sum at all but some other relation that a dictionary can key on. Here
it is one rung short: it is fast enough, but it spends O(n) memory on bookkeeping that the
sortedness of the input already encodes for free, and the problem explicitly asks for O(1) space.

---`,
}
