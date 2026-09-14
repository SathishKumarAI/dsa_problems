// remove-list-elements — approach 3 — Let each node decide its own fate
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recurse",
  title: "Let each node decide its own fate",
  idea: `*Rebuilding replaces every survivor with a copy — can one pass keep the real nodes?* Yes, by
recursion: clean everything after this node first, then this node either returns itself (it survives)
or returns its already-cleaned tail (it is deleted). *What does it fix?* No allocation, no \`prev\`
pointer, no head case — the nodes that come back are the nodes handed in. *What does it cost?* One
stack frame per **node**, which at \`10^4\` is fatal.`,
  intuition: `> **Intuition.** Ask each bead one question: *"assuming everything in front of you is already
> correct, who should the bead behind you be tied to — you, or whatever you are holding?"* A
> surviving bead answers "me". A matching bead answers "whatever I'm holding", and thereby deletes
> itself by simply not mentioning itself. Nobody needs a predecessor, because nobody is doing the
> retying — each node just *reports* what its predecessor should point at, and the predecessor's own
> frame performs the assignment.

That reframing is why the head stops being special: the head's "predecessor" is the caller, and the
caller performs the assignment by using the return value. The recursion also makes the don't-advance
problem disappear, because there is no cursor to advance — a run of adjacent matches is just a chain
of frames each passing the same tail upward.

> **Why it works.** Induction on length. \`head.next = remove(head.next, val)\` makes the tail
> correct by hypothesis; then the node's own verdict is a single expression. Nothing in the function
> depends on where in the list \`head\` sits, which is precisely why there is no head case.`,
  worked: `\`n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\`, \`val = 7\`. Descending first — nothing is decided on
the way in:

| Depth | at | action |
|---|---|---|
| 0 | \`n0\` (7) | clean the tail first |
| 1 | \`n1\` (1) | clean the tail first |
| 2 | \`n2\` (7) | clean the tail first |
| 3 | \`n3\` (7) | clean the tail first |
| 4 | \`n4\` (2) | clean the tail first |
| 5 | \`n5\` (7) | clean the tail first |
| 6 | \`None\` | base case → return \`None\` |

Unwinding, each frame giving its verdict:

| Returning into depth | node | verdict | returns |
|---|---|---|---|
| 5 | \`n5\` (7) | match → hand back my cleaned tail | \`None\` |
| 4 | \`n4\` (2) | keep → hand back myself | \`n4\` |
| 3 | \`n3\` (7) | match → hand back my cleaned tail | \`n4\` |
| 2 | \`n2\` (7) | match → hand back my cleaned tail | \`n4\` |
| 1 | \`n1\` (1) | keep → hand back myself | \`n1\` |
| 0 | \`n0\` (7) | match → hand back my cleaned tail | \`n1\` |

The caller receives \`n1\`, whose \`next\` is \`n4\`. Result \`[1, 2]\`, built from the caller's own nodes.
Watch depths 3 and 2: two **adjacent** matches, each simply forwarding the same \`n4\` upward. No
cursor, no don't-advance rule, no branch — the hardest trap in the problem never arises.`,
  code: `def remove_list_elements_recursive(head: ListNode | None, val: int) -> ListNode | None:
    if head is None:
        return None
    head.next = remove_list_elements_recursive(head.next, val)
    return head.next if head.val == val else head`,
  codeNote: `Three lines, no \`prev\`, no dummy, no special case. It is the clearest statement of the idea on this
page and it is unshippable at the stated scale.`,
  mistake: `> **Watch out.** The mistake here is not a typo, it is **choosing this rung at all** at the stated
> size. Ten thousand nodes is ten thousand live frames, and the depth is not visible anywhere in the
> three lines — there is no array to point at, no obvious \`O(n)\`. "Constant space" is a very easy
> thing to claim about code with no data structures in it.

Measured: \`remove_list_elements_recursive(build([3] * 10_000), 3)\` raises **\`RecursionError: maximum
recursion depth exceeded\`** against CPython's default limit of 1000. Note that the recursion depth is
per **node**, not per removal — even a list with no matches at all blows up, so the failure does not
depend on the data being adversarial, only on it being long.

And one honest non-bug, because it looks like a mistake and is not. Deciding before recursing:

\`\`\`python
    if head.val == val:
        return remove_list_elements_recursive(head.next, val)
    head.next = remove_list_elements_recursive(head.next, val)
    return head
\`\`\`

This is **correct** — arguably clearer, and it avoids writing \`head.next\` on a node about to be
discarded. It has exactly the same depth, so it fixes nothing that matters. Verified against the
whole suite; the version in the script is kept only because it is shorter.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\` on the call stack. Time is one frame per node doing constant work.
The space is the interpreter's stack, \`n + 1\` frames live at the deepest point — invisible memory,
and the reason the \`10^4\` constraint disqualifies it.

Use it when the list is provably short, when you are in a language with a stack you control, or when
the code will be read far more often than run. In an interview, write it after the loop and name the
frame-per-node cost in the same breath; the three lines are a genuinely good signal, and claiming
\`O(1)\` space for them is a genuinely bad one.

---`,
}
