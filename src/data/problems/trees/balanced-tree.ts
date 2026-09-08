import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "balanced-tree",
  title: "Is the Tree Height-Balanced?",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "balanced-binary-tree",
  brief: "Every node's subtrees differ in height by at most one.",
  statement:
    "Given the root of a binary tree, return true if it is height-balanced — that is, if for every node the heights of its two subtrees differ by no more than one.",
  constraints: [
    "0 <= number of nodes <= 5000",
    "-10^4 <= node.val <= 10^4",
    "the condition must hold at EVERY node, not only at the root",
    "an empty tree is balanced, with height 0",
  ],
  examples: [
    { input: "root = [3,9,20,null,null,15,7]", output: "true" },
    {
      input: "root = [1,2,2,3,3,null,null,4,4]",
      output: "false",
      note: "The left side is two levels deeper than the right.",
    },
  ],
  hints: [
    "Computing a height at every node re-walks the same subtrees over and over.",
    "One traversal can return the height AND report imbalance at the same time.",
    "Use a sentinel height — −1 — to mean 'already unbalanced below here', and propagate it upward.",
  ],
  whyNow:
    "Asking for each node's height separately re-traverses its whole subtree, once per ancestor, which is quadratic on a skewed tree. A single post-order pass computes each height once and carries the verdict up with it, because a subtree that is already unbalanced makes the answer regardless of anything above it.",
  approach:
    "Walk post-order returning a height. An empty node has height 0. If either child reports the sentinel −1, or the two child heights differ by more than one, return −1 to mean unbalanced; otherwise return one plus the taller child. The sentinel is what fuses the two questions into one traversal — the caller does not need a separate flag, because an impossible height already says everything. The tree is balanced when the root's result is not −1.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def height(node: TreeNode | None) -> int:
    if node is None:
        return 0
    left = height(node.left)
    if left == -1:
        return -1
    right = height(node.right)
    if right == -1:
        return -1
    if abs(left - right) > 1:
        return -1
    return 1 + max(left, right)


def is_balanced(root: TreeNode | None) -> bool:
    return height(root) != -1`,
  walkthrough: [
    {
      text: `      3
    /   \\
   9    20
       /  \\
     15    7`,
      caption: "Every node must have subtrees within one level of each other.",
    },
    {
      text: `height(9) = 1
height(15) = 1   height(7) = 1`,
      caption: "Post-order: the leaves report first.",
    },
    {
      text: `height(20) = 1 + max(1,1) = 2
|1 - 1| = 0  ✓`,
      caption: "Node 20 checks its own balance as it computes its height.",
    },
    {
      text: `height(3): left 1, right 2
|1 - 2| = 1  ✓  →  3`,
      caption: "The root is within one. Each height was computed exactly once.",
    },
    {
      text: `unbalanced case:
some node returns -1
→ every ancestor returns -1 immediately`,
      caption:
        "The sentinel carries the verdict up without a second traversal.",
    },
  ],
  alternatives: [
    {
      name: "Measure the height at every node",
      summary:
        "For each node, compute the height of both subtrees from scratch, check the difference, and recurse into the children.",
      complexity: { time: "O(n^2)", space: "O(h)" },
      python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def height(node: TreeNode | None) -> int:
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))


def is_balanced(root: TreeNode | None) -> bool:
    if root is None:
        return True
    if abs(height(root.left) - height(root.right)) > 1:
        return False
    return is_balanced(root.left) and is_balanced(root.right)`,
    },
  ],
}
