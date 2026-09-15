// max-depth — approach 4 — The definition, typed out
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recurse",
  title: "The definition, typed out",
  idea: `*Every approach so far manages a container by hand — a list of paths, a queue, a stack of pairs. What
if the language already has a container that does exactly this walk?* It does: the call stack. Ask
each child how deep it goes, take the larger, add one for yourself.`,
  intuition: `> **Intuition.** Stop thinking about traversal. Ask a manager how many levels are below them; they
> ask each of their two reports the same question, wait, take the bigger answer, add one for
> themselves, and report up. An empty chair answers \`0\`. Nobody needs to know where they are in the
> company — only what came back from below.

This is the **post-order** shape: do nothing on the way down, combine on the way up. It is worth
recognising by sight, because it answers a whole family of questions — is the tree balanced, what is
its diameter, what is the largest BST inside it — and they are all "a node's answer is a function of
its subtrees' answers".`,
  worked: `The trace is the return values, unwinding:

| Call | Left returns | Right returns | Returns |
|---|---|---|---|
| \`depth(None)\` (children of \`9\`, \`15\`, \`7\`) | — | — | \`0\` |
| \`depth(9)\` | \`0\` | \`0\` | \`1\` |
| \`depth(15)\` | \`0\` | \`0\` | \`1\` |
| \`depth(7)\` | \`0\` | \`0\` | \`1\` |
| \`depth(20)\` | \`1\` (from \`15\`) | \`1\` (from \`7\`) | \`2\` |
| \`depth(3)\` | \`1\` (from \`9\`) | \`2\` (from \`20\`) | **\`3\`** |

The short branch is visible in the last row: \`9\` came back with \`1\`, \`20\` came back with \`2\`, and
\`max\` discarded the short one. No comparison of paths ever happened — the discarding is the
comparison.`,
  code: `def max_depth_recursive(root: Optional[TreeNode]) -> int:
    """depth(node) = 1 + max(depth(left), depth(right)); depth(None) = 0."""
    if root is None:
        return 0
    return 1 + max(max_depth_recursive(root.left), max_depth_recursive(root.right))`,
  mistake: `> **Watch out.** Basing the recursion on the **leaf** instead of on the **missing node**:
> \`if root.left is None and root.right is None: return 1\`. It is the more natural sentence in
> English — "a leaf is one level deep" — and it passes the statement's own example, returning
> **\`3\`**. Then it meets a node with exactly one child, recurses into the \`None\` side, and raises
> \`AttributeError: 'NoneType' object has no attribute 'left'\`. On \`[1, 2]\`. On an empty tree it fails
> on the very first line.

The misconception worth naming: *the base case belongs at the smallest **real** thing.* It does not.
It belongs at the smallest thing the recursion can actually **reach**, and what a recursive descent
reaches is \`None\` — from a leaf, and from every half-empty node on the way. A tree with one child is
not an exotic input; it is most of a real tree.

> **Watch out, again — and this one is not a beginner's error.** The constraint allows \`10 000\`
> nodes with no promise of balance, so a legal input is a spine \`10 000\` tall. CPython's default
> recursion limit is \`1 000\`. Run on such a tree, this three-line "best" solution raises
> \`RecursionError: maximum recursion depth exceeded\`, while approaches 2 and 3 both return \`10 000\`
> without complaint. The elegant answer is the one that breaks first on legal input.

> **In an interview.** Write the recursion, then say: "this is \`O(h)\` on the call stack, and with
> \`n\` up to ten thousand and no balance guarantee, a degenerate tree would exceed Python's default
> limit — the iterative version with an explicit stack is the same walk without that risk." That
> sentence is the answer to the follow-up they were about to ask.`,
  cost: `- **Time — \`O(n)\`.** One call per node, constant work in each.
- **Space — \`O(h)\` of call frames,** which is \`O(log n)\` on a balanced tree and \`O(n)\` on a spine.
  This is the same bound as approach 3, with one difference that matters: it is spent on the
  interpreter's stack, which is small and fixed, rather than on the heap, which is not.

**When it is right:** by default, and in an interview, and any time the tree's shape is known to be
sane. It is the clearest statement of what depth *means*, and clarity is the thing you are being
graded on — provided you can name its limit when asked.

---`,
}
