// right-side-view — approach 1 — Collect every level, then keep the last of each
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "collect-every-level-keep-the-last-of-each",
  title: "Collect every level, then keep the last of each",
  idea: `*The answer is one value per level, so produce the levels and take the last of each.* It reuses
level-order traversal exactly as it is, and postpones every decision to a one-line list comprehension
at the end.`,
  intuition: `> **Intuition.** Photograph each row of the tree, then crop every photograph down to its right-hand
> edge. Nothing about "visible" needs defining — the last element of a row **is** the visible one,
> because the row was built left to right.`,
  worked: `On \`[1, 2, 3, null, 5, null, 4]\`:

| Level | Row collected | Last |
|---|---|---|
| 1 | \`[1]\` | \`1\` |
| 2 | \`[2, 3]\` | \`3\` |
| 3 | \`[5, 4]\` | \`4\` |

\`5\` is on level 3 and is discarded — not because it is a left child, but because \`4\` comes after it.`,
  code: `def view_all_levels(root: Optional[TreeNode]) -> list[int]:
    """Build every level, then crop each to its last element."""
    levels: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(levels):
            levels.append([])
        levels[depth].append(node.val)
        walk(node.left, depth + 1)       # left first: the row must be in order
        walk(node.right, depth + 1)

    walk(root, 0)
    return [row[-1] for row in levels]`,
  mistake: `> **Watch out.** Taking \`row[0]\` instead of \`row[-1]\` — the *left* side view, which returns
> **\`[1, 2, 5]\`** on example 1. It is a one-character error and produces a plausible-looking list of
> the right length, which is why it survives a glance at the output.

> **Watch out.** Recursing right-before-left here. Each row is then built backwards, so \`row[-1]\`
> silently becomes the leftmost node. The order of the two recursive calls is load-bearing in this
> approach and in the opposite direction in approach 4 — which is exactly the kind of detail to state
> out loud rather than remember.`,
  cost: `- **Time — \`O(n)\`.**
- **Space — \`O(n)\`.** Every value is stored to return one per level. That is the waste the rest of the
  ladder removes.

**When it is right:** when you want the levels for something else too — the answer is then one line
on top of a traversal you already needed.

---`,
}
