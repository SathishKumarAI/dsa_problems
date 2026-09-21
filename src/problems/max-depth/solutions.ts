// max-depth — the ladder: every way in, worst first.
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

export const approach =
  "Pure structural recursion. A missing node contributes 0; any real node contributes 1 plus the deeper of its two subtrees. The recursion visits every node once. (An iterative BFS counting levels gives the same answer if recursion depth is a concern.)"

export const whyNow =
  "Both iterative versions manage a container by hand to do what the call stack already does. The recursion is three lines and says exactly what depth means."

export const arc =
  "Depth is defined in terms of itself — a node is one more than the deeper of its two subtrees, and a missing node is zero — so the shortest correct program is that sentence typed out. The two iterative rungs earn their place by showing what the recursion is quietly using: the call stack IS the traversal, and managing a container by hand only makes the same walk explicit. Counting BFS rounds holds a whole level at once, so its memory is the widest part of the tree; an explicit stack of node-and-depth pairs holds one root-to-leaf path, which is the height. That trade is the thing to remember, because the recursion inherits the second half of it — O(h), which on a tree degenerated into a linked list is a frame per node, and the reason to reach for the iterative version at all. Know the post-order return cold: ask both children, combine, hand one value up. It is the same shape that answers balanced-tree, tree-diameter, and every question where a node's answer is a function of its subtrees' answers."

export const complexity = { time: "O(n)", space: "O(h) recursion stack" }

export const python = `def max_depth(root) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`

export const java = `public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`

export const cpp = `int maxDepth(const TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`

export const alternatives: Solution[] = [
  // B79. The document opens on this rung and the page could not name it. It
  // is the statement transcribed — build the paths the definition talks
  // about, then measure them — and it is the baseline the whole ladder is
  // arguing with: the answer never needed the paths, only their lengths.
  {
    key: "paths",
    name: "Build every path, then measure",
    costWhy:
      "O(n \u00b7 h) time and O(n \u00b7 h) space, and both factors are the same mistake: it materialises each root-to-leaf path as a list, so a tree with n/2 leaves holds n/2 paths of length up to h. The depth is a single number, and this rung computes every path to find it. Worth writing once to see that the recursion only ever needed the MAXIMUM of two numbers, never the paths themselves.",
    summary:
      "Walk to every leaf carrying the path so far, copy it out when a leaf is reached, and return the longest. It is the definition typed out, which is why it is worth seeing — and the copying is the whole problem with it: a perfect tree has n/2 leaves and paths of log n, so the copies alone are O(n log n), and a chain copies one path of length n. The rungs above it all notice the same thing, that a LENGTH is all the question ever asked for.",
    complexity: { time: "O(n · h)", space: "O(n · h)" },
    python: `def max_depth(root) -> int:
    paths = []

    def walk(node, path):
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            paths.append(list(path))  # a COPY: path is about to change
        else:
            walk(node.left, path)
            walk(node.right, path)
        path.pop()

    walk(root, [])
    return max((len(p) for p in paths), default=0)`,
    java: `public int maxDepth(TreeNode root) {
    List<List<Integer>> paths = new ArrayList<>();
    walkPaths(root, new ArrayList<>(), paths);
    int best = 0;
    for (List<Integer> p : paths) best = Math.max(best, p.size());
    return best;
}

private void walkPaths(TreeNode node, List<Integer> path, List<List<Integer>> paths) {
    if (node == null) return;
    path.add(node.val);
    if (node.left == null && node.right == null) {
        paths.add(new ArrayList<>(path));
    } else {
        walkPaths(node.left, path, paths);
        walkPaths(node.right, path, paths);
    }
    path.remove(path.size() - 1);
}`,
    cpp: `void walkPaths(const TreeNode* node, vector<int>& path, vector<vector<int>>& paths) {
    if (!node) return;
    path.push_back(node->val);
    if (!node->left && !node->right) {
        paths.push_back(path);
    } else {
        walkPaths(node->left, path, paths);
        walkPaths(node->right, path, paths);
    }
    path.pop_back();
}

int maxDepth(const TreeNode* root) {
    vector<vector<int>> paths;
    vector<int> path;
    walkPaths(root, path, paths);
    int best = 0;
    for (const auto& p : paths) best = max(best, (int)p.size());
    return best;
}`,
  },
  {
    key: "bfs",
    // The act below used to be the FIRST rung and wrote no `insight`, because
    // there was nothing under it. Promoting `paths` put something under it,
    // and `ladderOf` reads this field for exactly that case — the gate
    // "a rung needs the weakness in the one below it" failed until it existed.
    whyNow:
      "Building the paths answers a question nobody asked: the paths are copied out in full and then thrown away, and only their LENGTHS are ever read. Counting rounds of a level sweep produces the length directly, and never holds a path at all.",
    name: "Iterative BFS",
    costWhy:
      "O(n) time and O(w) space, where w is the widest level \u2014 which on a complete tree is n/2, so this rung can hold more than the recursive one. What it buys is the thing the bound does not show: no recursion — this is [[breadth-first search]] — so the 10\u2074-node chain that overflows the stack walks fine here. Counting levels rather than nodes is the whole implementation: take the queue\u2019s length before the loop and that many pops are exactly one level.",
    summary:
      "Sweep the tree level by level with a queue, draining exactly the nodes present at the start of each round and adding one to the depth per round. Same linear time with no recursion at all, so a tree degenerated into a 10,000-node chain cannot blow the stack. The price is that the memory tracks the WIDEST level rather than the height.",
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
    key: "stack",
    name: "Iterative DFS",
    costWhy:
      "O(n) time and O(n) space: an explicit stack holding (node, depth) pairs, which in the worst case holds every node of a level plus the path above it. Same walk as the recursion, with the frames moved onto the heap \u2014 which is exactly why it exists. When a tree can be 10\u2074 deep and the language caps recursion at 1000, this is the rung that is still correct.",
    whyNow:
      "Counting levels means holding a whole level in memory, which is the widest part of the tree. A stack of node-and-depth pairs carries one path at a time instead.",
    summary:
      "Push (node, depth) pairs onto an explicit stack, popping and keeping the largest depth seen. It is the recursion with the call stack written out by hand, which makes the traversal visible, and the stack holds every node whose sibling is still pending, so on a bushy tree it can carry far more than the h frames the recursion would.",
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
]

// HOW THE TARGET BOUND WAS COUNTED. Each rung carries its own.
export const costWhy =
  "Every node is visited exactly once and does a constant amount of work \u2014 two recursive calls, a maximum, an addition \u2014 so the time is O(n) and cannot be less: the depth is not knowable without seeing every node. The space is the call [[stack]], which holds one frame per level on the current path: O(h), where h is the height. That is the bound worth reading carefully, because h is log n on a balanced tree and n on a chain, and the constraints allow a 10\u2074-node chain \u2014 which is past CPython\u2019s default recursion limit of 1000. Same asymptotic class as the iterative rungs, and a crash on legal input."
