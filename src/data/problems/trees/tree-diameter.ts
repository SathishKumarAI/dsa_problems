import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "tree-diameter",
  title: "The Longest Path Between Any Two Nodes",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "diameter-of-binary-tree",
  brief: "Find the longest path in a binary tree, counted in edges. It need not touch the root.",
  statement:
    "Given the root of a binary tree, return the length of the longest path between any two nodes, measured in edges. The path may bend at any node and does not have to pass through the root.",
  constraints: [
    "1 <= number of nodes <= 10^4",
    "-100 <= node value <= 100 — values never enter the answer, only the shape does",
    "the answer is counted in EDGES, so a single node has diameter 0 and a two-node tree has diameter 1",
    "the longest path may live entirely inside one subtree and never reach the root",
    "the tree can be a chain, which makes recursion depth part of the problem",
  ],
  examples: [
    {
      input: "root = [1, 2, 3, 4, 5]",
      output: "3",
      note: "4 → 2 → 1 → 3 is three edges. The path bends at the root here, but nothing guarantees that.",
    },
    { input: "root = [1, 2]", output: "1" },
    {
      input: "root = [1, 2, null, 3, null, 4]",
      output: "3",
      note: "A chain hanging off the left. The whole path is inside the left subtree — a solution that only measures through the root gets this wrong.",
    },
  ],
  hints: [
    "Any path has a highest node — the point where it bends. Fix that node and the path is just the deepest reach left plus the deepest reach right.",
    "So the answer is the maximum, over every node, of depth(left) + depth(right).",
    "Computing depth separately per node re-walks the same subtrees over and over. One walk can return a depth AND update the best bend it has seen.",
  ],
  whyNow:
    "A map of precomputed depths is linear, but it stores a number for every node in the tree — 10^4 entries to answer with a single integer — and it needs two passes, so the code reads as two ideas instead of one. The depth a node returns is exactly what its parent needs and nothing else does: return it up the call and fold the bend into a running best on the way, and one pass with no table answers the question.",
  arc:
    "One trick, applied once: every path has exactly one highest node, so 'the best path' becomes 'the best bend', and a question about paths turns into a question about nodes. After that the ladder is only about not recomputing depth — measure it per node and you re-walk every subtree once per ancestor; cache it and you pay a table; return it from the walk that is already happening and you pay nothing. That last move — a recursion returning what the parent needs while folding a running best on the way up — is the shape of almost every 'best something in a tree' problem: maximum path sum, longest univalue path, the deepest matching subtree. Learn the shape rather than the answer, and notice that the walk returns a DEPTH while the answer is a BEND; conflating the two is the most common bug here.",
  approach:
    "One post-order walk. Each call returns the depth of its own subtree in edges, and before returning it updates a running best with left + right, which is the longest path bending at that node. Because every path bends at exactly one node, considering every node as the bend considers every path. Depth returns as 1 + max(left, right), and the best is read after the walk.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `def tree_diameter(root) -> int:
    best = 0

    def depth(node) -> int:
        nonlocal best
        if node is None:
            return 0
        left = depth(node.left)
        right = depth(node.right)
        best = max(best, left + right)   # the path that bends here
        return 1 + max(left, right)

    depth(root)
    return best`,
  java: `public int treeDiameter(TreeNode root) {
    int[] best = new int[1];
    depth(root, best);
    return best[0];
}

private int depth(TreeNode node, int[] best) {
    if (node == null) return 0;
    int left = depth(node.left, best);
    int right = depth(node.right, best);
    best[0] = Math.max(best[0], left + right);
    return 1 + Math.max(left, right);
}`,
  cpp: `int depthFolding(const TreeNode* node, int& best) {
    if (node == nullptr) return 0;
    int left = depthFolding(node->left, best);
    int right = depthFolding(node->right, best);
    best = max(best, left + right);
    return 1 + max(left, right);
}

int treeDiameter(const TreeNode* root) {
    int best = 0;
    depthFolding(root, best);
    return best;
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 3: "focus", 4: "focus" },
        labels: { 3: "leaf", 4: "leaf" },
      },
      caption:
        "Level order [1, 2, 3, 4, 5]. The walk reaches the bottom first: 4 and 5 are leaves whose absent children return 0, so each leaf reports depth 1 and bends nothing.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 1: "compare", 3: "done", 4: "done" },
        labels: { 1: "bend = 2" },
      },
      caption:
        "Both leaves return depth 1 (one node deep). At 2 the bend is left + right = 1 + 1 = 2 edges — the path 4 → 2 → 5. Best so far: 2, and 2 returns depth 1 + max(1, 1) = 2 to its parent.",
    },
    {
      cells: { values: [1, 2, 3, 4, 5], marks: { 2: "done" } },
      caption: "3 is a leaf as well: depth 1 counted from its parent, bend 0.",
    },
    {
      cells: {
        values: [1, 2, 3, 4, 5],
        marks: { 0: "compare", 1: "done", 2: "done", 3: "done", 4: "done" },
        labels: { 0: "bend = 3" },
      },
      caption:
        "At the root the left reach is 2 and the right reach is 1, so a path bending here is 3 edges: 4 → 2 → 1 → 3. Best becomes 3.",
    },
    {
      cells: {
        values: [1, 2, "·", 3, "·", 4],
        marks: { 0: "done", 1: "done", 3: "compare", 5: "done" },
      },
      caption:
        "The corner case: a chain down the left. Every bend at the root is 3 + 0, and the answer still comes from a node that is not the root in trees where the two deep sides sit in one subtree.",
    },
  ],
  alternatives: [
    {
      name: "Depth measured from every node",
      summary:
        "Take the definition literally: for each node, compute the depth of its left subtree and of its right subtree with a fresh walk, add them, and keep the maximum over all nodes.",
      complexity: { time: "O(n²)", space: "O(h)" },
      python: `def tree_diameter(root) -> int:
    def depth(node) -> int:
        if node is None:
            return 0
        return 1 + max(depth(node.left), depth(node.right))

    def best(node) -> int:
        if node is None:
            return 0
        here = depth(node.left) + depth(node.right)
        return max(here, best(node.left), best(node.right))

    return best(root)`,
      java: `public int treeDiameter(TreeNode root) {
    if (root == null) return 0;
    int here = plainDepth(root.left) + plainDepth(root.right);
    return Math.max(here, Math.max(treeDiameter(root.left), treeDiameter(root.right)));
}

private int plainDepth(TreeNode node) {
    if (node == null) return 0;
    return 1 + Math.max(plainDepth(node.left), plainDepth(node.right));
}`,
      cpp: `int plainDepth(const TreeNode* node) {
    if (node == nullptr) return 0;
    return 1 + max(plainDepth(node->left), plainDepth(node->right));
}

int treeDiameter(const TreeNode* root) {
    if (root == nullptr) return 0;
    int here = plainDepth(root->left) + plainDepth(root->right);
    return max(here, max(treeDiameter(root->left), treeDiameter(root->right)));
}`,
    },
    {
      name: "Depths cached in a map",
      summary:
        "Two passes. The first walks post-order and stores every node's depth in a map; the second visits each node once and reads both children's depths from the map instead of re-walking them.",
      complexity: { time: "O(n)", space: "O(n)" },
      whyNow:
        "The literal version re-measures the same subtree once for every ancestor it has, so a chain of 10^4 nodes walks about 10^8 nodes in total and times out. Nothing about those depths changes between measurements — they only need to be computed once and remembered.",
      python: `def tree_diameter(root) -> int:
    depth_of: dict[int, int] = {}

    def fill(node) -> int:
        if node is None:
            return 0
        d = 1 + max(fill(node.left), fill(node.right))
        depth_of[id(node)] = d
        return d

    fill(root)

    def look(node) -> int:
        return 0 if node is None else depth_of[id(node)]

    best = 0
    stack = [root] if root else []
    while stack:
        node = stack.pop()
        best = max(best, look(node.left) + look(node.right))
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return best`,
      java: `public int treeDiameter(TreeNode root) {
    Map<TreeNode, Integer> depthOf = new HashMap<>();
    fill(root, depthOf);
    int best = 0;
    Deque<TreeNode> stack = new ArrayDeque<>();
    if (root != null) stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        int left = node.left == null ? 0 : depthOf.get(node.left);
        int right = node.right == null ? 0 : depthOf.get(node.right);
        best = Math.max(best, left + right);
        if (node.left != null) stack.push(node.left);
        if (node.right != null) stack.push(node.right);
    }
    return best;
}

private int fill(TreeNode node, Map<TreeNode, Integer> depthOf) {
    if (node == null) return 0;
    int d = 1 + Math.max(fill(node.left, depthOf), fill(node.right, depthOf));
    depthOf.put(node, d);
    return d;
}`,
      cpp: `int fillDepths(TreeNode* node, unordered_map<TreeNode*, int>& depthOf) {
    if (node == nullptr) return 0;
    int d = 1 + max(fillDepths(node->left, depthOf), fillDepths(node->right, depthOf));
    depthOf[node] = d;
    return d;
}

int treeDiameter(TreeNode* root) {
    unordered_map<TreeNode*, int> depthOf;
    fillDepths(root, depthOf);
    int best = 0;
    vector<TreeNode*> stack;
    if (root != nullptr) stack.push_back(root);
    while (!stack.empty()) {
        TreeNode* node = stack.back();
        stack.pop_back();
        int left = node->left == nullptr ? 0 : depthOf[node->left];
        int right = node->right == nullptr ? 0 : depthOf[node->right];
        best = max(best, left + right);
        if (node->left != nullptr) stack.push_back(node->left);
        if (node->right != nullptr) stack.push_back(node->right);
    }
    return best;
}`,
    },
  ],
}
