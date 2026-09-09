import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "max-depth",
  title: "Maximum Depth of Binary Tree",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "maximum-depth-of-binary-tree",
  brief: "How many levels deep does the tree go?",
  statement:
    "Given the root of a binary tree, return its maximum depth — the number of nodes on the longest root-to-leaf path. An empty tree has depth 0.",
  constraints: [
    "0 <= node count <= 10^4",
    "-100 <= node value <= 100",
    "an empty tree has depth 0",
  ],
  examples: [{ input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" }],
  hints: [
    "Express the answer for a node in terms of its children's answers.",
    "depth(node) = 1 + max(depth(left), depth(right)).",
    "The base case — depth(None) = 0 — is the entire termination logic.",
  ],
  whyNow:
    "Both iterative versions manage a container by hand to do what the call stack already does. The recursion is three lines and says exactly what depth means.",
  approach:
    "Pure structural recursion. A missing node contributes 0; any real node contributes 1 plus the deeper of its two subtrees. The recursion visits every node once. (An iterative BFS counting levels gives the same answer if recursion depth is a concern.)",
  complexity: { time: "O(n)", space: "O(h) recursion stack" },
  python: `def max_depth(root) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
  java: `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
  cpp: `int maxDepth(const TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
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
      java: `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    int depth = 0;
    Queue<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        depth++;
        int sz = queue.size();
        for (int i = 0; i < sz; i++) {
            TreeNode node = queue.poll();
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
    }
    return depth;
}
`,
      cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    int depth = 0;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        depth++;
        int sz = (int)q.size();
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return depth;
}
`,
    },
    {
      name: "Iterative DFS",
      whyNow:
        "Counting levels means holding a whole level in memory, which is the widest part of the tree. A stack of node-and-depth pairs carries one path at a time instead.",
      summary:
        "Explicit stack of (node, depth) pairs — recursion without the call stack.",
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
      java: `public int maxDepth(TreeNode root) {
    int best = 0;
    Deque<AbstractMap.SimpleEntry<TreeNode,Integer>> stack = new ArrayDeque<>();
    if (root != null) stack.push(new AbstractMap.SimpleEntry<>(root,1));
    while (!stack.isEmpty()) {
        AbstractMap.SimpleEntry<TreeNode,Integer> entry = stack.pop();
        TreeNode node = entry.getKey();
        int d = entry.getValue();
        best = Math.max(best,d);
        if (node.left != null) stack.push(new AbstractMap.SimpleEntry<>(node.left,d+1));
        if (node.right != null) stack.push(new AbstractMap.SimpleEntry<>(node.right,d+1));
    }
    return best;
}
`,
      cpp: `int maxDepth(const TreeNode* root) {
    int best = 0;
    vector<pair<const TreeNode*,int>> stack;
    if (root) stack.push_back({root,1});
    while (!stack.empty()) {
        auto [node,d] = stack.back();
        stack.pop_back();
        best = max(best,d);
        if (node->left) stack.push_back({node->left,d+1});
        if (node->right) stack.push_back({node->right,d+1});
    }
    return best;
}
`,
    },
  ],
}
