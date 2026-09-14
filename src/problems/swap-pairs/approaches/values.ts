// swap-pairs — approach 1 — Exchange the payloads
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "values",
  title: "Exchange the payloads",
  idea: `*What is the smallest thing that produces the right printout?* Walk the list in twos and swap each
pair's \`val\`. *Why is that not the answer?* Because no node moved. The structure is identical to what
you were handed, and the problem asked for a rearranged structure.`,
  intuition: `> **Intuition.** Imagine relabelling the carriages instead of shunting them. Passengers standing on
> the platform reading the numbers see the right answer. Anybody who was *inside* carriage 3 is still
> inside the same physical carriage, which now claims to be carriage 4. If nothing else in the system
> cares about physical carriages, you got away with it. The moment something does — a passenger
> manifest, a cargo pointer, a second train coupled to one specific carriage — you have corrupted it
> silently.`,
  worked: `\`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\`. Values move; nodes do not.

| \`node\` | swap | chain afterwards (labels with values) |
|---|---|---|
| start | — | \`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\` |
| \`n0\` | \`n0.val ↔ n1.val\` | \`n0(2) → n1(1) → n2(3) → n3(4) → n4(5)\` |
| \`n2\` | \`n2.val ↔ n3.val\` | \`n0(2) → n1(1) → n2(4) → n3(3) → n4(5)\` |
| \`n4\` | \`n4.next\` is \`None\`, loop ends | \`n0(2) → n1(1) → n2(4) → n3(3) → n4(5)\` |

Measured final chain: **\`n0(2) → n1(1) → n2(4) → n3(3) → n4(5)\`**. Now put that beside the correct
answer from Approach 5, measured on the same input:

| | order of nodes | printed values |
|---|---|---|
| value swap | \`n0, n1, n2, n3, n4\` — **unchanged** | \`[2, 1, 4, 3, 5]\` |
| real swap | \`n1, n0, n3, n2, n4\` | \`[2, 1, 4, 3, 5]\` |

Identical printouts, completely different structures. \`n0\` is still the head. **This is why the trace
tracks identity:** a values-only table would show the two approaches as the same algorithm.`,
  code: `def swap_pairs_swap_values(head: ListNode | None) -> ListNode | None:
    node = head
    while node is not None and node.next is not None:
        node.val, node.next.val = node.next.val, node.val
        node = node.next.next
    return head`,
  mistake: `> **Watch out.** The misconception has two layers. The shallow one is that swapping needs no
> temporary because Python's tuple assignment looks like two statements — it is not, it evaluates the
> whole right-hand side first, and unrolling it by hand destroys the first value. The deep one is
> that this rung is an *optimization* of the problem rather than a different problem.

Unrolling the tuple assignment:

\`\`\`python
        node.val = node.next.val
        node.next.val = node.val      # WRONG — the line above already clobbered it
\`\`\`

Measured on \`[1, 2, 3, 4]\` this returns **\`[2, 2, 4, 4]\`**: each pair ends up holding two copies of
its second value. It is the same discipline every rung below needs — **save what you are about to
overwrite** — showing up in its simplest possible form.

And the deep layer, measured: run the correct value swap on \`[1, 2, 3, 4, 5]\` and the identity audit
reports \`nodes did NOT move\`, on every input, at every length, forever. The values agree with all
four real answers and the structure never matches any of them. **A test that only compares printed
values cannot tell this rung from a correct one** — which is exactly why the harness at the foot of
this document audits identity separately.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. One pass, two assignments per pair, nothing allocated. It is the
cheapest rung on the ladder by a constant factor and it is the only one that is *wrong*.

Use it when — and only when — the nodes are genuinely interchangeable containers for plain data,
nothing outside holds a pointer into the list, and you have written down somewhere that node identity
is not meaningful. In an interview: name it, then disqualify it yourself in one sentence
("that swaps the data, not the nodes, so anything holding a pointer into the list still sees the old
order"). Naming and rejecting it is a much stronger signal than never mentioning it.

---`,
}
