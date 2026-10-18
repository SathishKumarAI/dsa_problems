// sorted-pair-sum — approach 2 — Hash map
//
// Rewritten 2026-10-17 for reading. The measured table used to sit inside a
// blockquote, which `lib/markdown.ts` does not parse — it rendered as a line
// of literal pipes. It is a table in the flow now, with the three things to
// take from it as points. Same six parts docs/deep/README.md §3 requires;
// `rung` binds this section to the problem's own ladder (solutions.ts).

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "hash",
  title: "Hash map",
  idea: `*Brute force re-scans the tail to ask "is \`target − nums[i]\` here?" — can that cost one step
instead of n?* Yes: write down every value you walk past, keyed by value, and the question becomes
one lookup. It fixes the restarted inner scan by paying memory to keep what it learned.`,
  intuition: `- A guest list, filled in as people arrive. Each arrival asks "has my partner checked in?" — one
  glance at the list answers it.
- Miss: write the arrival down and call the next. Hit: done.
- One pass, one question per person. The cost is explicit: the list grows to the size of the crowd.
- **What it never uses:** that the queue arrived in sorted order.

**Measured, not assumed.** The map's O(n) and the walk's O(n) are not the same work — the map hashes
every key and rehashes the table as it grows, the walk adds two integers — so the walk "must" be
faster. On this machine, per element:

| \`n\` | building the dict | the two-pointer scan |
|---|---|---|
| \`10 000\` | \`34.0 ns\` | \`38.8 ns\` |
| \`100 000\` | \`39.1 ns\` | \`38.7 ns\` |

- Level — and at the small size the allocating version wins. The dict comprehension runs inside
  CPython's C; the \`while\` loop is bytecode, an add, a compare and two name lookups per step.
- The walk's real win in Python is **memory**: two integers against a table of n entries. That gap
  never closes.
- A complexity class describes **growth**, never speed at one size. "I profiled it" beats "it is
  O(n)".`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | Needs \`12 - value\` | Map contents *before* the lookup | Action |
|---|---|---|---|---|
| 1 | 0 (1) | 11 | \`{}\` | miss → store \`1 → 0\` |
| 2 | 1 (3) | 9 | \`{1: 0}\` | miss → store \`3 → 1\` |
| 3 | 2 (6) | 6 | \`{1: 0, 3: 1}\` | miss → store \`6 → 2\` |
| 4 | 3 (9) | 3 | \`{1: 0, 3: 1, 6: 2}\` | **hit**, \`3\` is at index 1 → return \`[1, 3]\` |

Four steps and a map of three entries. Against brute force's five checks the win is invisible at
n = 4 and enormous at n = 30 000.`,
  code: `def sorted_pair_sum_hash_map(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # look up BEFORE storing, or x pairs with itself
            return [seen[target - x], i]
        seen[x] = i
    return []`,
  mistake: `- **The bug:** storing the current value *before* the lookup. \`target = 8\` with a \`4\` present: the
  4 finds itself and the function returns \`[2, 2]\`.
- **The order is the fix:** look up first — that searches only the strictly earlier elements — then
  store.
- **Its cousin, when you sort an unsorted input yourself:** the indices you find are positions in
  the *sorted copy*, not in the caller's array. Carry the original index with each value before
  sorting, or the answer is silently wrong. Here the input arrives sorted, so it does not bite —
  yet.`,
  cost: `**Time O(n), space O(n).** One pass, one expected-O(1) lookup and insert per element; the map can
hold every element before the hit. The small value range keeps the constants small, but the map is
still proportional to n.

The right answer when the array is **not** sorted, may not be reordered, or the relation is something
other than a sum. Here it is one rung short: fast enough, but it spends O(n) memory on what the
ordering already encodes — and the statement forbids that memory.`,
}
