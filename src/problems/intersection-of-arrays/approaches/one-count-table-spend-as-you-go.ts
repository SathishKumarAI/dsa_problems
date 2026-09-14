// intersection-of-arrays — approach 4 — One count table, spend as you go.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "one-count-table-spend-as-you-go",
  title: "One count table, spend as you go",
  idea: `*The second tally exists only to be compared against the first — and building it forces a separate
pass over the keys afterwards just to assemble the answer. What if one side were consumed on the fly
instead of counted?* Tally \`nums2\` only, then walk \`nums1\`: a value that still has stock is taken and
its stock drops by one. The minimum is then enforced by *running out* rather than by comparing two
numbers. This fixes the two-map rung's weakness — the redundant second table and the extra pass.`,
  intuition: `A shop with a stock ledger. You count what is on the shelves once, then serve customers one at a time:
each customer asks for an item, and you hand it over if there is stock, decrementing the ledger. When
the stock for an item hits zero, later customers asking for it leave empty-handed. You never compute
"how many did that customer group want in total" and compare it against the shelf count — you simply
serve until you cannot. The result is identical to \`min(demand, supply)\`, computed lazily, one unit at
a time.

Notice what this buys beyond one fewer map: the output is assembled *during* the walk over \`nums1\`,
so there is no third pass over a key set. Two passes total.`,
  worked: `Input: \`nums1 = [4, 9, 5]\`, \`nums2 = [9, 4, 9, 8, 4]\`. \`nums2\` becomes the stock ledger.

Pass 1 builds the ledger: \`{9: 2, 4: 2, 8: 1}\`.

Pass 2 walks \`nums1\`:

| Value | Stock before | Action | Stock after | Answer |
|---|---|---|---|---|
| 4 | 2 | take, decrement | \`{9: 2, 4: 1, 8: 1}\` | \`[4]\` |
| 9 | 2 | take, decrement | \`{9: 1, 4: 1, 8: 1}\` | \`[4, 9]\` |
| 5 | absent (0) | skip | unchanged | \`[4, 9]\` |

Sorted: \`[4, 9]\`. Two passes, one map. The ledger ends with unspent stock — one 9, one 4, one 8 — which
is exactly the surplus the right side held and the left side never asked for.`,
  code: `def intersection_of_arrays_one_count_table(nums1: list[int], nums2: list[int]) -> list[int]:
    stock: dict[int, int] = {}
    for x in nums2:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in nums1:
        if stock.get(x, 0) > 0:
            stock[x] -= 1  # running out IS the min(), computed lazily
            out.append(x)
    out.sort()
    return out`,
  mistake: `Testing \`if x in stock\` instead of \`if stock.get(x, 0) > 0\`. The key stays in the dictionary after its
count is decremented to zero, so \`in\` keeps saying yes long after the stock is gone — and the count
then goes negative while the answer over-reports. On \`nums1 = [1, 1, 1]\` against \`nums2 = [1, 1]\` the
buggy version returns \`[1, 1, 1]\` and leaves \`stock[1] == -1\` behind as evidence. Membership in the
map is not the same as having stock; only the count is.

(Deleting the key when it hits zero also fixes it, and is what you would do if the map's size
mattered. Testing the count is fewer lines and does not churn the map.)`,
  cost: `**Time O(n + m + k log k), space O(m)** — one map sized to the distinct values of \`nums2\`, and the
\`k log k\` is again only the canonical-order sort. Time is one pass to build and one to spend, with an
O(1) expected hash operation at each step.

This is the right choice when the two arrays are of comparable size and you want the shortest correct
solution: it is six lines, it holds one table instead of two, and it makes one fewer pass than
Approach 3. It is one rung short of best only because it always tallies \`nums2\` — whatever \`nums2\`
happens to be.

---`,
}
