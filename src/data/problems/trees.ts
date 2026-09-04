import type { Problem } from "../types"

export const trees: Problem[] = [
  {
    id: "max-depth",
    title: "Maximum Depth of Binary Tree",
    pattern: "trees",
    difficulty: "easy",
    brief: "How many levels deep does the tree go?",
    statement:
      "Given the root of a binary tree, return its maximum depth — the number of nodes on the longest root-to-leaf path. An empty tree has depth 0.",
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" },
    ],
    hints: [
      "Express the answer for a node in terms of its children's answers.",
      "depth(node) = 1 + max(depth(left), depth(right)).",
      "The base case — depth(None) = 0 — is the entire termination logic.",
    ],
    approach:
      "Pure structural recursion. A missing node contributes 0; any real node contributes 1 plus the deeper of its two subtrees. The recursion visits every node once. (An iterative BFS counting levels gives the same answer if recursion depth is a concern.)",
    complexity: { time: "O(n)", space: "O(h) recursion stack" },
    python: `def max_depth(root) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
    walkthrough: [
      { text: "        3\n       / \\\n      9   20\n         /  \\\n        15   7", caption: "The example tree. Ask each node: how deep is your subtree?" },
      { text: "depth(9)  = 1 + max(0, 0) = 1\ndepth(15) = 1 + max(0, 0) = 1\ndepth(7)  = 1 + max(0, 0) = 1", caption: "Leaves: both children are None (depth 0)." },
      { text: "depth(20) = 1 + max(depth(15), depth(7))\n          = 1 + max(1, 1) = 2", caption: "Internal node combines its children's answers." },
      { text: "depth(3) = 1 + max(depth(9), depth(20))\n         = 1 + max(1, 2) = 3", caption: "Root: answer is 3. Every node computed exactly once." },
    ],
    alternatives: [
      {
        name: "Iterative BFS",
        summary:
          "Count levels with a queue — one increment per BFS round. Same O(n), no recursion-depth risk on degenerate (linked-list-shaped) trees.",
        complexity: { time: "O(n)", space: "O(w) widest level" },
        python: `from collections import deque

def max_depth(root) -> int:
    if root is None:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        depth += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth`,
      },
      {
        name: "Iterative DFS",
        summary: "Explicit stack of (node, depth) pairs — recursion without the call stack.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def max_depth(root) -> int:
    best = 0
    stack = [(root, 1)] if root else []
    while stack:
        node, d = stack.pop()
        best = max(best, d)
        if node.left:
            stack.append((node.left, d + 1))
        if node.right:
            stack.append((node.right, d + 1))
    return best`,
      },
    ],
  },
  {
    id: "validate-bst",
    title: "Validate a Binary Search Tree",
    pattern: "trees",
    difficulty: "medium",
    brief: "Is every node within the bounds its ancestors imply?",
    statement:
      "Given the root of a binary tree, decide whether it is a valid BST: every node in a left subtree is strictly less than its ancestor, every node in a right subtree strictly greater.",
    examples: [
      { input: "root = [5, 1, 8]", output: "true" },
      { input: "root = [5, 1, 8, null, null, 6, 4]", output: "false", note: "4 sits in 5's right subtree but 4 < 5." },
    ],
    hints: [
      "Checking only child vs parent misses deep violations — a grandchild can break a grandparent's rule.",
      "Pass down the (low, high) interval each node must fall inside.",
      "Going left tightens the upper bound to the node's value; going right tightens the lower bound.",
    ],
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
    walkthrough: [
      { text: "        5 (-∞, +∞)\n       / \\\n      1   8\n         / \\\n        6   4", caption: "Each node must fall inside an interval inherited from its ancestors." },
      { text: "1: interval (-∞, 5)   ✓\n8: interval (5, +∞)   ✓", caption: "Children of 5: left tightens the upper bound, right the lower." },
      { text: "6: interval (5, 8)    ✓\n4: interval (5, 8)    ✗   4 ≤ 5", caption: "4 satisfies its parent 8, but violates ancestor 5 — intervals catch it." },
      { text: "parent-only check:  4 < 8  ✓  (wrong: accepts)\ninterval check:     4 ∉ (5, 8)  ✗  (correct: rejects)", caption: "Why bounds beat local comparisons." },
    ],
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
      },
    ],
  },
  {
    id: "level-order",
    title: "Level Order Traversal",
    pattern: "trees",
    difficulty: "medium",
    brief: "Node values grouped level by level.",
    statement:
      "Given the root of a binary tree, return its node values grouped by depth, top to bottom, left to right within a level.",
    examples: [
      { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [9, 20], [15, 7]]" },
    ],
    hints: [
      "Breadth-first search visits nodes in exactly this order.",
      "A queue holds the frontier. How do you know where one level ends?",
      "Snapshot the queue's length before the loop — that many pops is exactly one level.",
    ],
    approach:
      "BFS with a queue seeded with the root. Each round, record the current queue length k, pop exactly k nodes (that's one full level), collect their values, and push their children — which form the next level. The length snapshot is what turns plain BFS into level-grouped BFS.",
    complexity: { time: "O(n)", space: "O(w) — widest level" },
    python: `from collections import deque

def level_order(root) -> list[list[int]]:
    if root is None:
        return []
    out: list[list[int]] = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level)
    return out`,
    walkthrough: [
      { text: "        3\n       / \\\n      9   20\n         /  \\\n        15   7\n\nqueue: [3]", caption: "Seed the queue with the root." },
      { text: "len(queue) = 1 — pop 1 node\n\nvisit 3, push 9, 20\nout: [[3]]\nqueue: [9, 20]", caption: "Round 1: the snapshot (1) bounds the level." },
      { text: "len(queue) = 2 — pop 2 nodes\n\nvisit 9 (no children), visit 20, push 15, 7\nout: [[3], [9, 20]]\nqueue: [15, 7]", caption: "Round 2: children pushed now belong to the NEXT round." },
      { text: "len(queue) = 2 — pop 2 nodes\n\nvisit 15, visit 7\nout: [[3], [9, 20], [15, 7]]\nqueue: []", caption: "Round 3: queue drains — done." },
    ],
    alternatives: [
      {
        name: "DFS with depth",
        summary:
          "Recurse carrying the depth; append each value to out[depth]. Surprising but valid — pre-order visits keep left-to-right order within each level.",
        complexity: { time: "O(n)", space: "O(h)" },
        python: `def level_order(root) -> list[list[int]]:
    out: list[list[int]] = []

    def walk(node, depth: int) -> None:
        if node is None:
            return
        if depth == len(out):
            out.append([])
        out[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return out`,
      },
    ],
  },
]
