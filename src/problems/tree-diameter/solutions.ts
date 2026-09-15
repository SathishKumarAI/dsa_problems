// tree-diameter — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "One post-order walk. Each call returns the depth of its own subtree in edges, and before returning it updates a running best with left + right, which is the longest path bending at that node. Because every path bends at exactly one node, considering every node as the bend considers every path. Depth returns as 1 + max(left, right), and the best is read after the walk."

export const whyNow = "A map of precomputed depths is linear, but it stores a number for every node in the tree — 10^4 entries to answer with a single integer — and it needs two passes, so the code reads as two ideas instead of one. The depth a node returns is exactly what its parent needs and nothing else does: return it up the call and fold the bend into a running best on the way, and one pass with no table answers the question."

export const arc = "One trick, applied once: every path has exactly one highest node, so 'the best path' becomes 'the best bend', and a question about paths turns into a question about nodes. After that the ladder is only about not recomputing depth — measure it per node and you re-walk every subtree once per ancestor; cache it and you pay a table; return it from the walk that is already happening and you pay nothing. That last move — a recursion returning what the parent needs while folding a running best on the way up — is the shape of almost every 'best something in a tree' problem: maximum path sum, longest univalue path, the deepest matching subtree. Learn the shape rather than the answer, and notice that the walk returns a DEPTH while the answer is a BEND; conflating the two is the most common bug here."

export const complexity = { time: "O(n)", space: "O(h)" }

export const python = `def tree_diameter(root) -> int:
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
    return best`

export const java = `public int treeDiameter(TreeNode root) {
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
}`

export const cpp = `int depthFolding(const TreeNode* node, int& best) {
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
}`

export const alternatives: Solution[] = [
  {
    key: "depth-measured-from-every-node",
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
    key: "depths-cached-in-a-map",
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
  // B79. The document teaches the one-pass fold twice — once with the call
  // stack and once with an explicit one — and the page could only name the
  // first. It earns its rung on a measurement, not on taste: on the
  // 10,000-node chain this problem's constraints allow, the three recursive
  // rungs raise `RecursionError` and this one returns 9,999.
  {
    key: "iterative",
    // taught AFTER the answer: it is not a step toward the one-pass fold, it
    // is that fold with the frames written out so a 10,000-node chain survives
    after: "optimal",
    name: "The same fold, without the call stack",
    whyNow:
      "The one-pass recursion is the shortest correct answer and it spends a frame per level. A tree degenerated into a chain is legal here and 10,000 nodes deep, which is past Python's default limit — so the rung below does not get slower on that input, it stops returning an answer at all.",
    summary:
      "Post-order with an explicit stack, using the standard two-visit trick: a node is pushed unvisited, popped and pushed back marked, and its children pushed on top — so the marked pop happens only after both children are finished. A map carries each node's reach, and the parent POPS its children's entries rather than reading them, because a reach is read exactly once and leaving it behind would grow the map to n. Same linear time, O(h) space, and it survives any depth the heap allows.",
    complexity: { time: "O(n)", space: "O(h)" },
    python: `def diameter_of_binary_tree(root) -> int:
    best = 0
    reach = {}
    stack = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = reach.pop(node.left, 0)  # popped: a reach is read once, by the parent
            right = reach.pop(node.right, 0)
            best = max(best, left + right)
            reach[node] = 1 + max(left, right)
        else:
            stack.append((node, True))  # revisit after both children
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return best`,
    java: `public int diameterOfBinaryTree(TreeNode root) {
    int best = 0;
    Map<TreeNode, Integer> reach = new HashMap<>();
    Deque<Object[]> stack = new ArrayDeque<>();
    if (root != null) stack.push(new Object[] { root, Boolean.FALSE });
    while (!stack.isEmpty()) {
        Object[] frame = stack.pop();
        TreeNode node = (TreeNode) frame[0];
        boolean ready = (Boolean) frame[1];
        if (ready) {
            int left = node.left == null ? 0 : reach.remove(node.left);
            int right = node.right == null ? 0 : reach.remove(node.right);
            best = Math.max(best, left + right);
            reach.put(node, 1 + Math.max(left, right));
        } else {
            stack.push(new Object[] { node, Boolean.TRUE });
            if (node.left != null) stack.push(new Object[] { node.left, Boolean.FALSE });
            if (node.right != null) stack.push(new Object[] { node.right, Boolean.FALSE });
        }
    }
    return best;
}`,
    cpp: `int diameterOfBinaryTree(TreeNode* root) {
    int best = 0;
    unordered_map<const TreeNode*, int> reach;
    vector<pair<TreeNode*, bool>> stack;
    if (root) stack.push_back({ root, false });
    while (!stack.empty()) {
        auto [node, ready] = stack.back();
        stack.pop_back();
        if (ready) {
            int left = 0, right = 0;
            if (node->left) { left = reach[node->left]; reach.erase(node->left); }
            if (node->right) { right = reach[node->right]; reach.erase(node->right); }
            best = max(best, left + right);
            reach[node] = 1 + max(left, right);
        } else {
            stack.push_back({ node, true });
            if (node->left) stack.push_back({ node->left, false });
            if (node->right) stack.push_back({ node->right, false });
        }
    }
    return best;
}`,
  },
]
