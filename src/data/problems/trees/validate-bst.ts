import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "validate-bst",
  title: "Validate a Binary Search Tree",
  pattern: "trees",
  difficulty: "medium",
  leetcode: "validate-binary-search-tree",
  brief: "Is every node within the bounds its ancestors imply?",
  statement:
    "Given the root of a binary tree, decide whether it is a valid BST: every node in a left subtree is strictly less than its ancestor, every node in a right subtree strictly greater.",
  constraints: [
    "1 <= node count <= 10^4",
    "-2^31 <= node value <= 2^31 - 1",
    "every value in the left subtree must be strictly smaller than the node and every value on the right strictly larger — the bound is inherited, not local",
    "the value range reaches the integer limits, so a sentinel of -infinity/+infinity must not be a plain int",
  ],
  examples: [
    { input: "root = [5, 1, 8]", output: "true" },
    {
      input: "root = [5, 1, 8, null, null, 6, 4]",
      output: "false",
      note: "4 sits in 5's right subtree but 4 < 5.",
    },
  ],
  hints: [
    "Checking only child vs parent misses deep violations — a grandchild can break a grandparent's rule.",
    "Pass down the (low, high) interval each node must fall inside.",
    "Going left tightens the upper bound to the node's value; going right tightens the lower bound.",
  ],
  whyNow:
    "The in-order walk is correct, but it only ever compares neighbours, so the rule looks like a coincidence. Carrying an allowed interval down the tree states the real invariant: a value is bounded by every ancestor, not just by its predecessor.",
  approach:
    "Recurse with an allowed open interval, initially (-∞, +∞). A node is valid if its value lies inside its interval and both subtrees validate against tightened intervals: left gets (low, node.val), right gets (node.val, high). This encodes every ancestor constraint at once — the classic wrong answer (compare each node with its direct children only) accepts trees where a deep node violates a distant ancestor.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `def is_valid_bst(root) -> bool:
    def valid(node, low, high) -> bool:
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and \\
               valid(node.right, node.val, high)

    return valid(root, float("-inf"), float("inf"))`,
  java: `public boolean isValidBST(TreeNode root) {
    return valid(root, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
}

private boolean valid(TreeNode node, double low, double high) {
    if (node == null) return true;
    if (!(low < node.val && node.val < high)) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
}`,
  cpp: `static bool valid(const TreeNode* node, double low, double high) {
    if (node == nullptr) return true;
    if (!(low < node->val && node->val < high)) return false;
    return valid(node->left, low, node->val) && valid(node->right, node->val, high);
}

bool isValidBST(const TreeNode* root) {
    return valid(root, -numeric_limits<double>::infinity(), numeric_limits<double>::infinity());
}`,
  alternatives: [
    {
      name: "In-order traversal",
      summary:
        "A BST's in-order walk is strictly increasing. Traverse, compare each value to the previous. Same O(n); materializing the list costs memory, streaming the comparison doesn't.",
      complexity: { time: "O(n)", space: "O(h)" },
      python: `def is_valid_bst(root) -> bool:
    prev = float("-inf")

    def inorder(node) -> bool:
        nonlocal prev
        if node is None:
            return True
        if not inorder(node.left):
            return False
        if node.val <= prev:
            return False
        prev = node.val
        return inorder(node.right)

    return inorder(root)`,
      java: `public boolean isValidBST(TreeNode root) {
    long[] prev = {Long.MIN_VALUE};
    return inorder(root, prev);
}

private boolean inorder(TreeNode node, long[] prev) {
    if (node == null) return true;
    if (!inorder(node.left, prev)) return false;
    if (node.val <= prev[0]) return false;
    prev[0] = node.val;
    return inorder(node.right, prev);
}`,
      cpp: `static bool inorder(const TreeNode* node, long long& prev) {
    if (!node) return true;
    if (!inorder(node->left, prev)) return false;
    if (node->val <= prev) return false;
    prev = node->val;
    return inorder(node->right, prev);
}

bool isValidBST(const TreeNode* root) {
    long long prev = LLONG_MIN;
    return inorder(root, prev);
}`,
    },
  ],
}
