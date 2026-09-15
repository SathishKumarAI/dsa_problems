// cycle-detect — approach 2 — A set of visited nodes.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "set",
  title: "A set of visited nodes",
  idea: `*The nested walk re-derived "have I seen this node?" from scratch every single step — can we just
remember the answer?* Yes: keep a set of every node visited, and the first time you are about to visit
one already in the set, you have found a cycle. *What does it fix?* It collapses the quadratic
re-scanning to one constant-time lookup per node, turning \`O(n²)\` into \`O(n)\`. What it costs is
\`O(n)\` memory — the exact thing the problem says not to spend.`,
  intuition: `> **Intuition.** The same corridor, but now you carry a pot of chalk and mark each door as you pass
> through it. "Have I been here?" stops being a search and becomes a glance. You have swapped the
> **crude** resource for the **cheap** one — the nested walk spent time to avoid memory, the set
> spends memory to avoid time — which is the most common move in algorithm design and almost always
> the right first improvement to say out loud.

The one thing to be careful about is *what* goes in the set. It must identify the node **object**,
not its contents — either the node itself (in Python, Java and C++, default hashing of an object or
pointer is identity-based) or its address, which Python exposes as \`id(node)\`. Put values in the set
and you have written a duplicate-value detector wearing a cycle detector's clothes.

Termination is also worth a thought: on a cyclic list this loop stops the first time it comes back
round to any previously visited node, which is at most \`n\` steps. It does not run forever.`,
  worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`.

| Step | \`head\` at | \`id(head)\` in \`seen\`? | \`seen\` afterwards | result |
|---|---|---|---|---|
| 1 | \`N1\` | no | \`{N1}\` | continue |
| 2 | \`N2\` | no | \`{N1, N2}\` | continue |
| 3 | \`N3\` | no | \`{N1, N2, N3}\` | continue |
| 4 | \`N4\` | no | \`{N1, N2, N3, N4}\` | continue |
| 5 | \`N2\` | **yes** | — | **return True** |

Five steps, one lookup each, and a set that grew to four entries — for a four-node list, the set is
the same size as the list.`,
  code: `def cycle_detect_visited_set(head: ListNode | None) -> bool:
    seen: set[int] = set()
    while head is not None:
        if id(head) in seen:  # id() is the object's address: identity, not value
            return True
        seen.add(id(head))
        head = head.next
    return False`,
  mistake: `> **Watch out.** The misconception is that the set's job is to hold something **hashable** — and an
> \`int\` obviously is, while "can I even put a node in a set?" makes you hesitate. The set's job is to
> hold something **identifying**. Hashability is a precondition, not the requirement.

\`seen.add(head.val)\` instead of the node's identity, the same bug as approach 1's and made easier by
that hesitation. On \`1 → 2 → 1 → ∅\` the buggy version returns **\`True\`** — run, not assumed.

A second, subtler trap specific to the \`id()\` spelling: \`id()\` is only a valid identity as long as the
object is alive. It is safe here because every node stays reachable from \`head\` for the whole call —
but if you ever write this pattern over a sequence of temporary objects, addresses get reused and the
set silently lies to you. Storing the node objects themselves (\`seen: set[ListNode]\`) sidesteps that
entirely, and works as long as the class does not define its own \`__eq__\`/\`__hash__\`. If it does, an
identity set is the only safe choice.`,
  cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Time is one visit and one hash lookup per node, each constant on
average. Space is the set, which reaches \`n\` entries on an acyclic list.

Use it when you need more than a yes/no. The set can be upgraded to a dict of node → index, which
gives you the cycle's entry point and its length for free, in code anyone can read at a glance —
whereas getting the entry point out of the fast solution requires a second, separate argument about
distances. Also use it when the "nodes" are not really nodes: if you are detecting a cycle in
something you cannot traverse twice cheaply, or in a graph where each node has several successors, the
two-pointer trick does not apply at all and a visited set is the actual algorithm.

---`,
}
