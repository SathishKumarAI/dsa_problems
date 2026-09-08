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
  walkthrough: [
    {
      text: `   1        1
  / \\      / \\
 2   3    2   3`,
      caption: "Compare the roots first: 1 against 1.",
    },
    {
      text: `left subtrees
 2        2`,
      caption: "Then the left pair. Same value, and both have empty children.",
    },
    {
      text: `right subtrees
 3        3`,
      caption: "Then the right pair. Every position agreed.",
    },
    {
      text: `   1        1
  /          \\
 2            2`,
      caption: "A mirrored pair: same values, different shape.",
    },
    {
      text: `p.left = 2, q.left = None
→ false`,
      caption:
        "One empty against one node → false. Structure is checked, not just values.",
    },
  ],
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
    },
  ],
}
