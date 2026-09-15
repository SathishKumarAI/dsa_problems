// max-depth — approach 1 — Build every root-to-leaf path, then measure them
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
  rung: "paths",
  title: "Build every root-to-leaf path, then measure them",
  idea: `*What is the most direct translation of "the number of nodes on the longest root-to-leaf path"?*
Produce all the root-to-leaf paths, take the length of the longest. It fixes nothing — it is the
starting point — but it is honest about what the statement asks, and every later approach is a
subtraction from it.`,
  intuition: `> **Intuition.** Walk the tree carrying a breadcrumb list. Step into a node, drop a breadcrumb;
> when you reach a leaf, photograph the trail; when you back out of a node, pick your breadcrumb
> back up. The photographs are the paths, and the answer is the size of the biggest photograph.

The picking-up is the part that matters, and it is the part that looks like magic to someone new.
There is one trail, not many — you *reuse* it, mutating it as you descend and ascend. That is
cheaper than building a fresh list at every node, and it is the source of this approach's one
famous bug.`,
  worked: `\`path\` is the live trail, \`paths\` the photographs taken so far.

| Step | At node | \`path\` after entering | Leaf? | \`paths\` |
|---|---|---|---|---|
| 1 | \`3\` | \`[3]\` | no | \`[]\` |
| 2 | \`9\` | \`[3, 9]\` | **yes** | \`[[3, 9]]\` |
| 3 | back out of \`9\` | \`[3]\` | — | \`[[3, 9]]\` |
| 4 | \`20\` | \`[3, 20]\` | no | \`[[3, 9]]\` |
| 5 | \`15\` | \`[3, 20, 15]\` | **yes** | \`[[3, 9], [3, 20, 15]]\` |
| 6 | back out of \`15\` | \`[3, 20]\` | — | — |
| 7 | \`7\` | \`[3, 20, 7]\` | **yes** | \`[[3, 9], [3, 20, 15], [3, 20, 7]]\` |
| 8 | back out to the top | \`[]\` | — | three paths, longest is \`3\` |

Read row 8 with the bug in mind: **at the end, \`path\` is empty again.** Anything still pointing at
it is pointing at an empty list.`,
  code: `def max_depth_paths(root: Optional[TreeNode]) -> int:
    """The statement, transcribed. Builds every path, then measures them."""
    paths: list[list[int]] = []

    def walk(node: Optional[TreeNode], path: list[int]) -> None:
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            paths.append(list(path))          # a COPY: \`path\` is about to change
        else:
            walk(node.left, path)
            walk(node.right, path)
        path.pop()

    walk(root, [])
    return max((len(p) for p in paths), default=0)`,
  codeNote: `\`default=0\` earns its place: an empty tree produces no paths at all, and \`max()\` of nothing raises
rather than returning zero.`,
  mistake: `> **Watch out.** \`paths.append(path)\` instead of \`paths.append(list(path))\`. It looks like it stores
> the path. It stores a **reference to the single trail**, which is about to be unwound by every
> \`path.pop()\` on the way home. The misconception is "appending a list to a list copies it" — it
> does not, in any language with references.

The failure has a cruel signature: it does not crash, and it does not return something obviously
wrong-shaped. Run on the example, the aliased version returns **\`0\`** — three entries in \`paths\`,
all of them the same now-empty list. Every recorded path evaporates between recording and reading.

> **In an interview.** If you write the mutate-and-backtrack walk, say "copy on record" out loud as
> you type \`list(path)\`. It is the single line an interviewer is watching for, and naming it
> pre-empts the question.`,
  cost: `- **Time — \`O(n · h)\`.** Every node is visited once, which is \`O(n)\`, but each leaf copies a path of
  up to \`h\` values. A perfect tree has \`n/2\` leaves and \`h = log n\`, so the copying alone is
  \`O(n log n)\`; a degenerate tree has one leaf and one path of \`n\`.
- **Space — \`O(n · h)\`.** Every path is kept, and they are kept simultaneously. This is the only
  approach here whose memory grows with the number of *leaves*, and it is why it is the worst rung.

**When it is still right:** when the paths *are* the answer — "print every root-to-leaf path", "find
the path that sums to \`k\`", "return the deepest path, not its length". Then this is not the naive
approach; it is the correct one, and the ones below cannot be adapted to it. Recognise which
question you were actually asked.

---`,
}
