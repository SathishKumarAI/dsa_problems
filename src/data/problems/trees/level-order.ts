import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "level-order",
  title: "Level Order Traversal",
  pattern: "trees",
  difficulty: "medium",
  leetcode: "binary-tree-level-order-traversal",
  brief: "Node values grouped level by level.",
  statement:
    "Given the root of a binary tree, return its node values grouped by depth, top to bottom, left to right within a level.",
  constraints: [
    "0 <= node count <= 2000",
    "-1000 <= node value <= 1000",
    "each level is returned left to right, as its own list",
  ],
  examples: [
    {
      input: "root = [3, 9, 20, null, null, 15, 7]",
      output: "[[3], [9, 20], [15, 7]]",
    },
  ],
  hints: [
    "Breadth-first search visits nodes in exactly this order.",
    "A queue holds the frontier. How do you know where one level ends?",
    "Snapshot the queue's length before the loop — that many pops is exactly one level.",
  ],
  whyNow:
    "Depth-first assembly happens to produce the right order - a fact about pre-order, not about levels, and it leaves you trusting an accident. A queue processes exactly one level per round, so the shape of the walk matches the shape of the answer.",
  arc:
    "Both rungs produce the same nested lists, and the difference is whether the grouping is a property of the walk or a lucky by-product of it. Recursing with a depth and appending each value to out[depth] works because a pre-order visit reaches the nodes of a level left to right — true, and a fact about pre-order rather than about levels, so you are left trusting an accident you would have to re-derive under pressure. A queue makes the grouping structural: record the queue's length at the top of each round and pop exactly that many nodes, and you have consumed precisely one level, because everything pushed during the round belongs to the next one. That length snapshot is the whole technique and it is worth knowing cold — it is what turns plain BFS into level BFS, and it is what the rest of the family is built on: zigzag order, the right-side view, per-level averages, bottom-up order. The memory bill flips as well, since BFS holds the widest level and DFS holds the height, and which is cheaper is a fact about the tree.",
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
  java: `public List<List<Integer>> levelOrder(TreeNode root) {
    if (root == null) return new ArrayList<>();
    List<List<Integer>> out = new ArrayList<>();
    Queue<TreeNode> queue = new LinkedList<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        int sz = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < sz; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        out.add(level);
    }
    return out;
}
`,
  cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> out;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = (int)q.size();
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        out.push_back(level);
    }
    return out;
}
`,
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
      java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> out = new ArrayList<>();
    walk(root, 0, out);
    return out;
}

private void walk(TreeNode node, int depth, List<List<Integer>> out) {
    if (node == null) return;
    if (depth == out.size()) out.add(new ArrayList<>());
    out.get(depth).add(node.val);
    walk(node.left, depth + 1, out);
    walk(node.right, depth + 1, out);
}`,
      cpp: `void walk(const TreeNode* node, int depth, vector<vector<int>>& out) {
    if (!node) return;
    if (depth == (int)out.size()) out.push_back(vector<int>());
    out[depth].push_back(node->val);
    walk(node->left, depth + 1, out);
    walk(node->right, depth + 1, out);
}

vector<vector<int>> levelOrder(const TreeNode* root) {
    vector<vector<int>> out;
    walk(root, 0, out);
    return out;
}`,
    },
  ],
}
