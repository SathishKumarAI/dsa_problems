// same-tree — approach 1 — Serialise both trees and compare the strings
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "serialise",
  title: "Serialise both trees and compare the strings",
  idea: `*Comparing two shapes is awkward; comparing two strings is trivial.* Turn each tree into a string and
test the strings for equality. The entire difficulty moves into one question — **what must the string
record?** — and that question has exactly one right answer.`,
  intuition: `> **Intuition.** Think of dictating a tree over the phone. If you read only the values in pre-order,
> the listener cannot reconstruct the tree — they do not know where the branches stopped. You have to
> say "and nothing there" out loud. That \`#\` is not padding; it is the shape.`,
  worked: `The mirrored pair, dictated both ways:

| Tree | Values only | With empty children recorded |
|---|---|---|
| \`p = [1, 2]\` | \`1,2\` | \`1,2,#,#,#\` |
| \`q = [1, null, 2]\` | \`1,2\` | \`1,#,2,#,#\` |
| Compare | **equal** — wrong | **differ at position 2** — right |

Both strings were printed by the script at the foot of this document, not typed from memory.`,
  code: `def serialise(node: Optional[TreeNode], out: list[str]) -> None:
    """Pre-order, recording every empty child — the \`#\` is the shape."""
    if node is None:
        out.append("#")
        return
    out.append(str(node.val))
    serialise(node.left, out)
    serialise(node.right, out)


def is_same_serialised(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    a: list[str] = []
    b: list[str] = []
    serialise(p, a)
    serialise(q, b)
    return ",".join(a) == ",".join(b)`,
  codeNote: `The comma is load-bearing too: without it, values \`1, 23\` and \`12, 3\` both dictate as \`123\`.`,
  mistake: `> **Watch out.** Leaving the empty children out — the version that appends nothing for \`None\`. On the
> statement's own second example it returns **\`True\`** where the answer is \`False\`, because both trees
> dictate as \`'1,2'\`. The misconception is that a traversal *is* a tree. It is not: a pre-order
> reading without hole markers is ambiguous, and the number of trees sharing one reading grows fast.

The worst case is a tree whose values carry no information at all. On \`[1, 1, 1]\` against
\`[1, 1, null, 1]\`, the marker-free version says **\`True\`** and the answer is \`False\` — three ones
either way. A test suite of trees with distinct values will never catch this.`,
  cost: `- **Time — \`O(n)\`,** but with a constant no other approach pays: it walks **both** trees to the end
  before it may disagree.
- **Space — \`O(n)\`** for two strings, plus \`O(h)\` recursion.

**When it is right:** when the serialisation is wanted anyway — caching a tree, hashing one, storing
it, or checking one tree against *many* others, where each tree is serialised once and compared
cheaply thereafter.

---`,
}
