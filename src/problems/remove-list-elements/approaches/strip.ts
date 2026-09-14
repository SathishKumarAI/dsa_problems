// remove-list-elements — approach 4 — Strip the leading matches, then walk with `prev`
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
  rung: "strip",
  title: "Strip the leading matches, then walk with `prev`",
  idea: `*Recursion holds a frame per node for a job that needs one pointer — so use one pointer.* Advance
\`head\` past every leading match, then walk with a cursor unlinking \`node.next\` whenever it matches.
*What does it fix?* The \`O(n)\` stack becomes constant space, in one pass, keeping the caller's nodes
— everything the problem asks for. *What does it still cost?* **The same test is written twice**, once
in the head loop and once in the walk, and the head loop is the one people forget.`,
  intuition: `> **Intuition.** Two jobs that are really one job. First trim the front — you cannot untie a knot
> behind the first bead, so the only way to remove it is to *redefine* which bead is first, and to
> keep redefining while the new first bead also matches. Then, with a first bead that is safe, walk
> forward with the scissors behind you.

And now the decision that is the whole correctness of this loop:

> **Why it works.** The invariant is *everything from \`head\` up to and including \`node\` is final, and
> \`node.next\` has not yet been judged.* Unlinking \`node.next\` keeps \`node\` final and puts a **new,
> unjudged** node at \`node.next\` — so you must not advance. Advancing is only correct when \`node.next\`
> was judged and kept. That is why the removal branch and the keep branch differ in exactly one way:
> one moves the cursor and the other does not.`,
  worked: `\`n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7)\`, \`val = 7\`.

**Head strip:**

| step | \`head\` was | matches? | \`head\` becomes |
|---|---|---|---|
| 1 | \`n0\` (7) | yes | \`n1\` |
| 2 | \`n1\` (1) | no | stop |

**Then the walk, measured:**

| Iteration | \`node\` | \`node.next\` | verdict | action | list afterwards |
|---|---|---|---|---|---|
| 1 | \`n1\` (1) | \`n2\` (7) | match | unlink, **stay** | \`n1(1) → n3(7) → n4(2) → n5(7)\` |
| 2 | \`n1\` (1) | \`n3\` (7) | match | unlink, **stay** | \`n1(1) → n4(2) → n5(7)\` |
| 3 | \`n1\` (1) | \`n4\` (2) | keep | advance to \`n4\` | \`n1(1) → n4(2) → n5(7)\` |
| 4 | \`n4\` (2) | \`n5\` (7) | match | unlink, **stay** | \`n1(1) → n4(2)\` |

\`node.next\` is now \`None\` → loop ends. Result \`[1, 2]\`. Four iterations for six nodes, no re-walking
— compare Approach 1's four full passes. Iterations 1 and 2 are the don't-advance rule earning its
keep: \`n3\` slid into the gap left by \`n2\` and matched as well.`,
  code: `def remove_list_elements_strip_head(head: ListNode | None, val: int) -> ListNode | None:
    while head is not None and head.val == val:  # the same test, written twice
        head = head.next
    node = head
    while node is not None and node.next is not None:
        if node.next.val == val:
            node.next = node.next.next  # do NOT advance
        else:
            node = node.next
    return head`,
  codeNote: `Two loops, two copies of \`== val\`, and a loop guard that must test both \`node\` and \`node.next\` because
\`head\` may be \`None\` after the strip.`,
  mistake: `> **Watch out.** The misconception is that a loop advances at the end of every iteration — that is
> what loops *do*. Here it is conditional, and the reason is precise: after unlinking, \`node.next\`
> holds a node **nobody has judged yet**. Advancing past it says "I checked that one" about a node
> you did not check.

\`\`\`python
    while node is not None and node.next is not None:
        if node.next.val == val:
            node.next = node.next.next
        node = node.next          # WRONG — advances even after a removal
\`\`\`

Measured on the worked example this returns **\`[1, 7, 2]\`**. Trace the failure: iteration 1 unlinks
\`n2\`, then advances onto \`n3\` — which matches, and is now the cursor, so it can never be examined as
somebody's \`next\` again. It survives. The bug produces a list that is *mostly* right, which is the
worst kind: it only shows up where two matches are adjacent, and a test suite of \`[1,2,6,3,4,5,6]\`
never has two adjacent matches.

> **In an interview.** If you take one sentence from this problem, take this one: **"after a removal
> I do not advance, because the node that slid into the gap has not been checked."** Say it as you
> write the \`else\`. It is the line interviewers are listening for, and it generalises directly to
> \`remove-duplicates-sorted\`, to in-place array filters, and to every iterator-invalidation bug in
> every language with erase-while-iterating.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Time is one pass: each node is judged exactly once, either by the
head loop or as somebody's \`next\`, and neither loop ever revisits. Space is one pointer.

This is a correct, shippable answer, and its only flaw is duplication: the predicate \`== val\` appears
twice, so a change to the matching rule has **two** places to edit, and the head loop is the copy
people forget to change. That is exactly the modularity failure the next rung fixes — the last rung
is not faster, it is *smaller in the number of places a bug can live.*

---`,
}
