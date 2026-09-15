// merge-two-sorted — approach 1 — Collect everything and sort
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "collect",
  title: "Collect everything and sort",
  idea: `*What is the most direct thing that could possibly work?* Walk both lists pushing every value into one
array, sort the array, and build a fresh chain from it. *Why is that not the answer?* Because it solves
a harder problem than the one you were given — it sorts arbitrary data, when your data was already
sorted — and it pays \`log(n+m)\` per element plus \`n+m\` allocations for the privilege.`,
  intuition: `> **Intuition.** Two decks of cards, each already in order, and you tip them both into a hat, shake it,
> and hand the hat to a machine that sorts anything. The machine works. It also spends its whole
> effort rediscovering something you destroyed on purpose two seconds earlier by tipping the decks
> into the hat. A sort is a device for creating order out of nothing, and you were handed
> two-thirds of the order already.

The number worth holding onto is the gap: a comparison sort on \`n+m\` elements does about
\`(n+m) log(n+m)\` comparisons, while the structure of the input means only \`n+m\` are necessary — one
per element, each between the two current fronts. That gap is the rest of this document.

To rebuild, use the standard list-construction trick: repeatedly **prepend**. Since prepending
reverses, feed the values in descending order so the finished chain comes out ascending.`,
  worked: `\`a = 1 → 3 → 5\`, \`b = 2 → 4\`.

**Drain both lists:**

| Step | reading from | value appended | \`vals\` |
|---|---|---|---|
| 1–3 | \`a\` | 1, then 3, then 5 | \`[1, 3, 5]\` |
| 4–5 | \`b\` | 2, then 4 | \`[1, 3, 5, 2, 4]\` |

**Sort descending:** \`[5, 4, 3, 2, 1]\`.

**Prepend each, in that order:**

| Step | value | new node | chain afterwards |
|---|---|---|---|
| start | — | — | \`∅\` |
| 1 | 5 | \`ListNode(5, ∅)\` | \`5 → ∅\` |
| 2 | 4 | \`ListNode(4, →5)\` | \`4 → 5 → ∅\` |
| 3 | 3 | \`ListNode(3, →4)\` | \`3 → 4 → 5 → ∅\` |
| 4 | 2 | \`ListNode(2, →3)\` | \`2 → 3 → 4 → 5 → ∅\` |
| 5 | 1 | \`ListNode(1, →2)\` | \`1 → 2 → 3 → 4 → 5 → ∅\` |

Correct output, five brand-new nodes, and the five original nodes still sitting in their two original
chains untouched.`,
  code: `def merge_two_sorted_collect_and_sort(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    vals: list[int] = []
    for head in (a, b):
        while head is not None:
            vals.append(head.val)
            head = head.next
    out: ListNode | None = None
    for v in sorted(vals, reverse=True):  # descending, because prepending reverses
        out = ListNode(v, out)
    return out`,
  mistake: `> **Watch out.** The misconception is that the **reversal** lives in the iteration order, so "I want
> the result ascending, therefore iterate ascending." The reversal lives in the *prepending* — every
> prepend buries what came before — so the iteration must run the other way to cancel it.

Sorting ascending and then prepending, \`for v in sorted(vals): out = ListNode(v, out)\`, returns
\`[5, 4, 3, 2, 1]\` on the worked example: a perfectly valid linked list in **descending** order. The
list is built correctly and the sort is correct, so nothing raises — the only symptom is a backwards
answer. If the double negative is hard to hold, build with a \`tail\` pointer and feed ascending
instead; just do not mix the two mental models inside one function.`,
  cost: `**Time** \`O((n+m) log(n+m))\`, **space** \`O(n+m)\`. The time is dominated by the **sort** — the two
drains and the rebuild are linear, and the \`log\` factor is the sort's comparisons. Space is the \`vals\`
array plus \`n+m\` newly allocated nodes.

Use it when the inputs are **not** actually sorted, or when you cannot trust that they are and
validating costs as much as sorting. It also generalises for free to merging *k* lists, or to merging
on a key the list order does not reflect. For this problem it is the baseline you name in one sentence
and discard: "we could concatenate and sort, but that's \`n log n\` on data that's already ordered, and
it allocates."

---`,
}
