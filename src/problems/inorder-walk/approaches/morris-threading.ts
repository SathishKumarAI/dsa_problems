// inorder-walk — approach 4 — Morris threading.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "morris-threading",
  title: "Morris threading",
  idea: `*Even the explicit stack is \`O(h)\`.* The tree is full of null pointers going nowhere — every leaf's
two, every half-empty node's one. Borrow them: before descending left, point the rightmost node of
that left subtree back at the current node, so that when the walk falls off the bottom it lands
where it needs to be. Then put the pointer back.`,
  intuition: `> **Intuition.** Tie a string from the last room you will visit on the left back to the doorway you
> came through. Walk down. When you run out of rooms, the string carries you back to the doorway,
> and you untie it on your way past so the house is as you found it.

> **Why it works.** The predecessor of a node in inorder is the **rightmost node of its left
> subtree** — and that node's right pointer is, by definition, empty. So the thread never destroys a
> real edge, and finding a thread already in place is exactly the signal that the left subtree is
> finished.`,
  worked: `On \`[1, null, 2, 3]\` the first node has no left child, so it is recorded immediately and the walk
steps right — the threading only engages at \`2\`, whose left subtree is \`3\`. The script prints the
tree before and after and they are identical:

\`\`\`
before: (1 . (2 (3 . .) .))
after:  (1 . (2 (3 . .) .))   (restored)
result: [1, 3, 2]
\`\`\``,
  code: `def inorder_morris(root: Optional[TreeNode]) -> list[int]:
    """O(1) space, by borrowing the tree's own empty right pointers."""
    out: list[int] = []
    node = root
    while node:
        if node.left is None:
            out.append(node.val)
            node = node.right
        else:
            pred = node.left                       # the inorder predecessor:
            while pred.right and pred.right is not node:
                pred = pred.right                  # rightmost node of the left subtree
            if pred.right is None:
                pred.right = node                  # thread, then go left
                node = node.left
            else:
                pred.right = None                  # the thread is back: untie it
                out.append(node.val)
                node = node.right
    return out`,
  mistake: `> **Watch out.** \`while pred.right:\` without \`and pred.right is not node\`. Once the thread exists,
> that inner walk follows it back to \`node\` and then round again — an infinite loop, not a wrong
> answer. The test for "is this pointer mine?" is the whole difference between a thread and an edge.

> **Watch out, and this is the real cost.** Morris **mutates the tree while it runs**. It restores
> it, but only if it finishes. Break out early — an exception, a \`return\` on the k-th value, a
> caller that wanted the first three — and you hand back a tree with threads still tied in it, which
> is a cycle. Any reader also has to trust the repair. That is why the explicit stack, not this, is
> the one to reach for.`,
  cost: `- **Time — \`O(n)\`,** and each edge is walked at most twice, which is why the inner \`while\` does not
  make it quadratic.
- **Space — \`O(1)\`.** Genuinely constant: no stack, no frames.

**When it is right:** when memory is the binding constraint and the walk is guaranteed to run to
completion — embedded work, a huge tree, an interview follow-up asking for \`O(1)\`. Not when anything
can interrupt it.

---`,
}
