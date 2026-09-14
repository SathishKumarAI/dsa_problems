import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "same-tree",
  title: "Are Two Trees Identical?",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "same-tree",
  brief: "Same shape and same values, everywhere.",
  statement:
    "Given the roots of two binary trees, return true if they have identical structure and identical values at every position.",
  constraints: [
    "0 <= number of nodes in each tree <= 100",
    "-10^4 <= node.val <= 10^4",
    "STRUCTURE counts as much as values — the same values in a different shape are not the same tree",
    "two empty trees are identical; one empty and one not are not",
  ],
  examples: [
    { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
    {
      input: "p = [1,2], q = [1,null,2]",
      output: "false",
      note: "Same values, mirrored shape.",
    },
  ],
  hints: [
    "Two trees are the same when their roots match AND their left subtrees match AND their right subtrees match.",
    "That sentence is the whole algorithm — it is already recursive.",
    "The base cases are the pair of empties (true) and one empty against one node (false).",
  ],
  whyNow:
    "Serialising both trees and comparing the strings works only if the serialisation records the empty children too; leave those out and a mirrored pair compares equal. Comparing structurally never has that ambiguity, and it stops at the first disagreement instead of building two whole strings first.",
  arc: "Identical means identical in SHAPE as much as in values, and the ladder is really about how easily the shape gets lost. Serialising both trees and comparing the strings works only if the serialisation records the empty children too — leave those out and a tree leaning left compares equal to its mirror, a bug that passes every test built from balanced examples. It also builds two whole strings before it is allowed to disagree. Comparing structurally has no such ambiguity, because the recursion walks the two trees in lockstep and three cases are the entire program: both empty is true, exactly one empty is false, otherwise the values must match and both pairs of subtrees must match in turn. Short-circuiting means a difference at the root costs one comparison rather than a traversal. That lockstep, two-pointers-into-two-trees recursion is the piece to carry: symmetric-tree is this function with the child pairs crossed over, and subtree-of-another-tree calls it at every node.",
  approach:
    "Compare the two roots. Both empty means identical; exactly one empty means not; otherwise the values must match and both pairs of subtrees must match in turn. The recursion mirrors the structure it is checking, which is why there is nothing to write beyond the three cases. Short-circuit evaluation means a tree that differs at the root costs one comparison rather than a full traversal.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def is_same_tree(p: TreeNode | None, q: TreeNode | None) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
  java: `public boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    if (p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
  cpp: `bool isSameTree(TreeNode* p, TreeNode* q) {
    if (p == nullptr && q == nullptr) return true;
    if (p == nullptr || q == nullptr) return false;
    if (p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}`,
  alternatives: [
    {
      name: "Serialise and compare",
      summary:
        "Turn each tree into a string that records every value and every empty child, then compare the two strings.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def serialise(node: TreeNode | None) -> str:
    if node is None:
        return "#"
    return "(" + str(node.val) + serialise(node.left) + serialise(node.right) + ")"


def is_same_tree(p: TreeNode | None, q: TreeNode | None) -> bool:
    return serialise(p) == serialise(q)`,
      java: `public String serialise(TreeNode node) {
    if (node == null) return "#";
    return "(" + node.val + serialise(node.left) + serialise(node.right) + ")";
}

public boolean isSameTree(TreeNode p, TreeNode q) {
    return serialise(p).equals(serialise(q));
}`,
      cpp: `string serialise(const TreeNode* node) {
    if (node == nullptr) return "#";
    return "(" + to_string(node->val) + serialise(node->left) + serialise(node->right) + ")";
}

bool isSameTree(const TreeNode* p, const TreeNode* q) {
    return serialise(p) == serialise(q);
}`,
    },
  ],
}
