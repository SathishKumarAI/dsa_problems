// swap-pairs — approach 3 — Let the tail swap itself
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
  rung: "recurse",
  title: "Let the tail swap itself",
  idea: `*The array existed only so the code could name the node after the pair — and \`second.next\` already
is that node.* So: swap the first two nodes, and hand everything after them to a recursive call that
returns the already-swapped rest. *What does it fix?* The \`O(n)\` array becomes nothing at all, and
the code becomes four lines. *What does it still cost?* One stack frame per pair.`,
  intuition: `> **Intuition.** You are standing at the front of the train with your partner. You say to the rest of
> the train: "swap yourselves up and tell me who ends up at your front." While they do that, you and
> your partner switch places. When they hand you back a name, you couple *your* back carriage to it,
> and the answer to the whole question is your partner — who is now at the very front. One pair's
> worth of work, done \`n/2\` times by delegation.

The ordering of the three lines is the entire correctness argument, and it is the same discipline as
\`reverse-list\`: **\`second.next\` is read before it is written.** \`head.next = swap(second.next)\` uses
the old value; only afterwards does \`second.next = head\` overwrite it. Reverse those two lines and
\`second.next\` is \`head\` by the time you read it.

> **Why it works.** The base case covers both 0 and 1 nodes with one test, so an odd tail is returned
> untouched and becomes the \`next\` of the last swapped pair. Everything else is a two-node local
> rewiring plus a trusted answer for a strictly shorter list, so induction on length gives
> correctness with nothing to check about parity.`,
  worked: `\`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)\`. Descending first — nothing is rewired on the way in:

| Depth | \`head\` | \`second\` | recurses on |
|---|---|---|---|
| 0 | \`n0\` (1) | \`n1\` (2) | \`n2\` |
| 1 | \`n2\` (3) | \`n3\` (4) | \`n4\` |
| 2 | \`n4\` (5) | — | **base case**: \`head.next is None\` → return \`n4\` |

Unwinding, each frame doing its two assignments:

| Returning into depth | \`head.next\` set to | \`second.next\` set to | frame returns | chain from the return value |
|---|---|---|---|---|
| 1 | \`n2.next = n4\` | \`n3.next = n2\` | \`n3\` | \`n3(4) → n2(3) → n4(5)\` |
| 0 | \`n0.next = n3\` | \`n1.next = n0\` | \`n1\` | \`n1(2) → n0(1) → n3(4) → n2(3) → n4(5)\` |

Final answer \`n1\`. Three frames were live at the deepest point — \`⌈n/2⌉\` rounded for the base case.`,
  code: `def swap_pairs_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # 0 or 1 nodes: nothing to pair with
    second = head.next
    head.next = swap_pairs_recursive(second.next)  # BEFORE second.next is overwritten
    second.next = head
    return second`,
  mistake: `> **Watch out.** The misconception is that the two assignments are independent, so their order is a
> matter of taste. They are not independent: one of them **reads** \`second.next\` and the other
> **writes** it. Doing the write first means the recursive call is handed \`head\` — the node you are
> standing on — so the recursion never gets shorter.

\`\`\`python
    second = head.next
    second.next = head                             # WRONG — destroys the pointer below
    head.next = swap_pairs_recursive(second.next)  # now recurses on \`head\` itself
\`\`\`

Measured on \`[1, 2, 3, 4, 5]\` this raises **\`RecursionError: maximum recursion depth exceeded\`** — the
recursion runs forever on a five-node list, because \`second.next\` is \`head\` and every frame re-asks
the same question. The stack overflow is the *lucky* outcome: in a language with tail-call
optimisation or a larger stack the same mistake becomes an infinite loop with no error at all. The
rule to carry: in any pointer rewiring, read before you write, and if you cannot, save it in a local
first.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n/2)\` on the call stack. Time is one frame per pair, three assignments
each. The space is invisible — it is the interpreter's stack, \`⌈n/2⌉ + 1\` frames live at the deepest
point. At the stated ceiling of 100 nodes that is about 51 frames, comfortably inside CPython's
default limit of 1000, so **unlike most list recursions this one is actually safe under the given
constraints** — worth saying, because it is unusual and because it means the honest reason to prefer
the loop is style rather than a crash.

Use it when the code will be read more than it is run — it is the clearest statement of the idea on
this page, and "swap the first two, trust the rest" is a sentence a reviewer can check. Write it in an
interview as your second answer, after the loop, and name the \`n/2\` frames before anyone asks.

---`,
}
