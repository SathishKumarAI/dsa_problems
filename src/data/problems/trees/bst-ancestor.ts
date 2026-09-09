import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "bst-ancestor",
  title: "Lowest Common Ancestor in a BST",
  pattern: "trees",
  difficulty: "medium",
  leetcode: "lowest-common-ancestor-of-a-binary-search-tree",
  brief: "The deepest node with both targets below it.",
  statement:
    "Given a binary search tree and two nodes in it, return their lowest common ancestor — the deepest node having both as descendants, where a node counts as a descendant of itself.",
  constraints: [
    "2 <= number of nodes <= 10^5, all values unique",
    "both targets are guaranteed to exist in the tree",
    "it is a SEARCH tree, so every left subtree is smaller and every right subtree larger — that ordering is the whole shortcut",
    "a node is a descendant of itself, so the ancestor may be one of the two targets",
  ],
  examples: [
    { input: "root = [6,2,8,0,4,7,9], p = 2, q = 8", output: "6" },
    {
      input: "root = [6,2,8,0,4,7,9], p = 2, q = 4",
      output: "2",
      note: "A node is its own descendant.",
    },
  ],
  hints: [
    "Walk down from the root. If both targets are smaller than the current node, where must the answer be?",
    "If both are larger, go right. If they straddle the current value, you have arrived.",
    "Straddling includes the case where the current node IS one of the targets.",
  ],
  whyNow:
    "The general-tree version searches both subtrees at every node because it has no idea where the targets are. A search tree tells you: comparing the two values against the current node names the direction, so the walk is a single path down and never explores a subtree it will not use.",
  approach:
    "From the root, compare both target values against the current node. If both are smaller, the answer lies entirely in the left subtree; if both are larger, in the right. Otherwise they straddle the current node — one on each side, or one of them IS the current node — and that is the lowest common ancestor. The walk is a single root-to-node path, so the depth of the tree bounds the work and no backtracking is needed.",
  complexity: { time: "O(h)", space: "O(1)" },
  python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def lowest_common_ancestor(root: TreeNode | None, p: int, q: int) -> int:
    node = root
    while node is not None:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node.val
    return -1`,
  java: `public int lowestCommonAncestor(TreeNode root, int p, int q) {
    TreeNode node = root;
    while (node != null) {
        if (p < node.val && q < node.val) node = node.left;
        else if (p > node.val && q > node.val) node = node.right;
        else return node.val;
    }
    return -1;
}`,
  cpp: `int lowestCommonAncestor(const TreeNode* root, int p, int q) {
    const TreeNode* node = root;
    while (node != nullptr) {
        if (p < node->val && q < node->val) node = node->left;
        else if (p > node->val && q > node->val) node = node->right;
        else return node->val;
    }
    return -1;
}`,
  alternatives: [
    {
      name: "Search both sides, ignoring the ordering",
      summary:
        "Recurse into both subtrees looking for either target; a node is the answer when the two targets are found on different sides, or when it is itself one of them.",
      complexity: { time: "O(n)", space: "O(h)" },
      python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def walk(node: TreeNode | None, p: int, q: int) -> TreeNode | None:
    if node is None:
        return None
    if node.val == p or node.val == q:
        return node
    left = walk(node.left, p, q)
    right = walk(node.right, p, q)
    if left is not None and right is not None:
        return node
    return left if left is not None else right


def lowest_common_ancestor(root: TreeNode | None, p: int, q: int) -> int:
    found = walk(root, p, q)
    return found.val if found is not None else -1`,
      java: `public TreeNode walk(TreeNode node, int p, int q) {
    if (node == null) return null;
    if (node.val == p || node.val == q) return node;
    TreeNode left = walk(node.left, p, q);
    TreeNode right = walk(node.right, p, q);
    if (left != null && right != null) return node;
    return left != null ? left : right;
}

public int lowestCommonAncestor(TreeNode root, int p, int q) {
    TreeNode found = walk(root, p, q);
    return found != null ? found.val : -1;
}`,
      cpp: `const TreeNode* walk(const TreeNode* node, int p, int q) {
    if (node == nullptr) return nullptr;
    if (node->val == p || node->val == q) return node;
    const TreeNode* left = walk(node->left, p, q);
    const TreeNode* right = walk(node->right, p, q);
    if (left != nullptr && right != nullptr) return node;
    return left != nullptr ? left : right;
}

int lowestCommonAncestor(const TreeNode* root, int p, int q) {
    const TreeNode* found = walk(root, p, q);
    return found != nullptr ? found->val : -1;
}`,
    },
  ],
}
