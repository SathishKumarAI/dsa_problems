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
  arc: "The condition has to hold at EVERY node, so the naive reading asks each node for its two subtree heights and then recurses — and measuring a height means walking that whole subtree, which happens again for every ancestor above it. On a skewed tree that is quadratic: the same nodes measured over and over. The fix is noticing that the second measurement has nothing new to learn. One post-order walk already visits each node once, and a node can hand its height up to its parent, so every height is computed exactly once on the way out. The second half of the trick is fusing both questions into that one return value: a sentinel of −1 means unbalanced, and because an unbalanced subtree makes the whole tree unbalanced no matter what sits above it, the sentinel propagates upward on its own and no separate flag is needed. Know the post-order return cold — it is the same move as max-depth, tree-diameter and the maximum path sum — and note that here it also short-circuits, since once −1 appears every caller above simply passes it on.",
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
  java: `public int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left);
    if (left == -1) return -1;
    int right = height(node.right);
    if (right == -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
}

public boolean isBalanced(TreeNode root) {
    return height(root) != -1;
}`,
  cpp: `int height(const TreeNode* node) {
    if (node == nullptr) return 0;
    int left = height(node->left);
    if (left == -1) return -1;
    int right = height(node->right);
    if (right == -1) return -1;
    if (abs(left - right) > 1) return -1;
    return 1 + max(left, right);
}

bool isBalanced(const TreeNode* root) {
    return height(root) != -1;
}`,
  alternatives: [
    {
      name: "Measure the height at every node",
      summary:
        "For each node, measure both subtree heights from scratch and check they differ by at most one, judging every node independently — the children are measured even when this node has already failed. That missing early exit is exactly what makes it quadratic: on a left spine it makes 2,550 height() entries at n = 50 and 160,400 at n = 400, four times the work for twice the nodes. Put the short circuit back and it is O(n log n) instead, because reaching a deep node would then need every ancestor to be balanced.",
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
    here = abs(height(root.left) - height(root.right)) <= 1
    # Bound before combining, so every node is judged even once one has failed.
    # The missing early exit is what makes this quadratic rather than O(n log n):
    # with it, reaching a deep node would require every ancestor to be balanced,
    # and a tree balanced all the way down is only O(log n) tall.
    left = is_balanced(root.left)
    right = is_balanced(root.right)
    return here and left and right`,
      java: `public int height(TreeNode node) {
    if (node == null) return 0;
    return 1 + Math.max(height(node.left), height(node.right));
}

public boolean isBalanced(TreeNode root) {
    if (root == null) return true;
    boolean here = Math.abs(height(root.left) - height(root.right)) <= 1;
    // Bound before combining: && would short-circuit and skip the children,
    // which turns this into O(n log n). Judging every node is the whole point.
    boolean left = isBalanced(root.left);
    boolean right = isBalanced(root.right);
    return here && left && right;
}`,
      cpp: `int height(const TreeNode* node) {
    if (node == nullptr) return 0;
    return 1 + max(height(node->left), height(node->right));
}

bool isBalanced(const TreeNode* root) {
    if (root == nullptr) return true;
    bool here = abs(height(root->left) - height(root->right)) <= 1;
    // Bound before combining: && would short-circuit and skip the children,
    // which turns this into O(n log n). Judging every node is the whole point.
    bool left = isBalanced(root->left);
    bool right = isBalanced(root->right);
    return here && left && right;
}`,
    },
  ],
}
