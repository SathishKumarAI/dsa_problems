import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "invert-tree",
  title: "Mirror a Binary Tree",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "invert-binary-tree",
  brief: "Swap every left and right child.",
  statement:
    "Given the root of a binary tree, swap the left and right child of every node and return the root.",
  constraints: [
    "0 <= number of nodes <= 100",
    "-100 <= node.val <= 100",
    "an empty tree inverts to an empty tree, so the base case is not an error",
    "the swap is at EVERY node, not only the root",
  ],
  examples: [
    { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
    { input: "root = []", output: "[]" },
  ],
  hints: [
    "Inverting a tree means swapping the two children of the root, and then inverting each of them.",
    "That is the whole thing — one swap plus two recursive calls.",
    "An empty node inverts to an empty node, which ends the recursion.",
  ],
  whyNow:
    "An explicit stack does the same work and is the right answer when the tree is deep enough to blow the call stack. For a bounded tree the recursion says exactly what the operation means in three lines, and the call stack is the traversal — so the iterative version is here as a fallback, not an improvement.",
  approach:
    "Swap the root's two children, then invert each subtree. An empty node returns immediately, which terminates every branch. Doing the swap before or after the recursive calls makes no difference to the result, because each call only rearranges its own subtree — a useful thing to notice, since it means there is no ordering constraint to get wrong.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def invert_tree(root: TreeNode | None) -> TreeNode | None:
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
  walkthrough: [
    {
      text: `      4
    /   \\
   2     7
  / \\   / \\
 1   3 6   9`,
      caption: "Swap the children of every node, from the root down.",
    },
    {
      text: `      4
    /   \\
   7     2`,
      caption: "The root's children swap places.",
    },
    {
      text: `      4
    /   \\
   7     2
  / \\   / \\
 9   6 3   1`,
      caption: "Each subtree is then inverted in turn.",
    },
    {
      text: `result: [4,7,2,9,6,3,1]`,
      caption: "Every node's two children ended up exchanged.",
    },
    {
      text: `empty tree → empty tree`,
      caption:
        "The base case is an answer, not an error — which is what lets the recursion terminate cleanly.",
    },
  ],
  alternatives: [
    {
      name: "Iterative with an explicit stack",
      summary:
        "Push the root onto a stack; pop a node, swap its children, push both children, and repeat until the stack empties.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def invert_tree(root: TreeNode | None) -> TreeNode | None:
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        node.left, node.right = node.right, node.left
        stack.append(node.left)
        stack.append(node.right)
    return root`,
    },
  ],
}
