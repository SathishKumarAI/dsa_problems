// max-depth — which rungs to know cold, and the drills
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Know cold:** the recursion, and the BFS level count. The recursion because it is three lines and
because its post-order shape (*ask both children, combine, return upward*) is the reusable idea —
balanced-tree, tree-diameter and same-tree are the same skeleton with a different combine step. The
BFS because the level-snapshot trick (\`for _ in range(len(queue))\`) is the backbone of every
level-order question you will be asked next, and because it is your answer when someone says "now do
it without recursion".

**Understand, do not memorise:** the explicit \`(node, depth)\` stack — it is worth being able to
derive on demand, but it is the recursion in longhand, and deriving it from the recursion in the
room is more convincing than reciting it. The path-enumeration rung is not an interview answer at
all; it is there so you recognise when a *different* question actually needs it.

> **In an interview.** Say the definition before you write anything: "the depth of a node is one plus
> the max of its subtrees, and an empty tree is zero" — then the code is just that sentence, and you
> have already justified it. Expect the follow-up "what if the tree is very deep?", and have the
> explicit stack ready. If asked for **minimum** depth instead, do not just swap \`max\` for \`min\` —
> that is wrong for a node with one child, whose missing side returns \`0\` and reports a false
> shallow answer. That is the trap this problem's sibling is built on.`
