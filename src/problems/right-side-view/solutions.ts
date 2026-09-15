// right-side-view — the ladder: every way in, worst first.
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

export const approach = "Depth-first, right child before left, carrying the current depth. The first time the walk reaches a depth it has never seen — which is exactly when the answer's length equals that depth — the node it is standing on is the rightmost one on that level, because everything to its right on that level would have been visited earlier. Append it and keep going. One visit per node, and the only memory is the call stack."

export const whyNow = "A breadth-first walk holds a whole level in memory, and the widest level of a tree holds about half its nodes — memory that grows with the WIDTH to answer a question whose answer is one value per level. Visiting the right child first makes the first arrival at each depth the visible node, so the only state is the current depth and the call stack, which is the height."

export const arc = "Two different-looking solutions, one question: how do you know a node is the last on its level? Breadth-first answers it by construction — the level is materialised, so its last element is obvious — and pays with memory proportional to the tree's widest level. Depth-first answers it by ORDER — visit right before left, and the first arrival at a new depth is the visible one — and pays only the height. The trick worth stealing is the test itself: comparing the current depth to the length of the answer so far is how a depth-first walk knows it is seeing something for the first time, and it reappears in 'leftmost value in the last row' and 'first node at each level'. Know the BFS version for explaining, the DFS version for the follow-up about memory."

export const complexity = { time: "O(n)", space: "O(h)" }

export const python = `def right_side_view(root) -> list[int]:
    out: list[int] = []

    def walk(node, depth: int) -> None:
        if node is None:
            return
        if depth == len(out):     # first arrival at this depth
            out.append(node.val)
        walk(node.right, depth + 1)
        walk(node.left, depth + 1)

    walk(root, 0)
    return out`

export const java = `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    walk(root, 0, out);
    return out;
}

private void walk(TreeNode node, int depth, List<Integer> out) {
    if (node == null) return;
    if (depth == out.size()) out.add(node.val);
    walk(node.right, depth + 1, out);
    walk(node.left, depth + 1, out);
}`

export const cpp = `void walkRightFirst(const TreeNode* node, int depth, vector<int>& out) {
    if (node == nullptr) return;
    if (depth == (int)out.size()) out.push_back(node->val);
    walkRightFirst(node->right, depth + 1, out);
    walkRightFirst(node->left, depth + 1, out);
}

vector<int> rightSideView(const TreeNode* root) {
    vector<int> out;
    walkRightFirst(root, 0, out);
    return out;
}`

export const alternatives: Solution[] = [
  {
    name: "Collect every level, keep the last of each",
    summary:
      "Run a full level-order traversal into a list of levels, then map each level to its last element. The answer is obvious once the levels are on the page, which makes this the version to think in, and it stores every value in the tree to keep one per level, so the memory is n where the answer needs the height.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def right_side_view(root) -> list[int]:
    if root is None:
        return []
    levels: list[list[int]] = []
    frontier = [root]
    while frontier:
        levels.append([node.val for node in frontier])
        nxt = []
        for node in frontier:
            if node.left is not None:
                nxt.append(node.left)
            if node.right is not None:
                nxt.append(node.right)
        frontier = nxt
    return [level[-1] for level in levels]`,
    java: `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;
    List<List<Integer>> levels = new ArrayList<>();
    List<TreeNode> frontier = new ArrayList<>();
    frontier.add(root);
    while (!frontier.isEmpty()) {
        List<Integer> values = new ArrayList<>();
        List<TreeNode> next = new ArrayList<>();
        for (TreeNode node : frontier) {
            values.add(node.val);
            if (node.left != null) next.add(node.left);
            if (node.right != null) next.add(node.right);
        }
        levels.add(values);
        frontier = next;
    }
    for (List<Integer> level : levels) out.add(level.get(level.size() - 1));
    return out;
}`,
    cpp: `vector<int> rightSideView(TreeNode* root) {
    vector<int> out;
    if (root == nullptr) return out;
    vector<vector<int>> levels;
    vector<TreeNode*> frontier{root};
    while (!frontier.empty()) {
        vector<int> values;
        vector<TreeNode*> next;
        for (TreeNode* node : frontier) {
            values.push_back(node->val);
            if (node->left != nullptr) next.push_back(node->left);
            if (node->right != nullptr) next.push_back(node->right);
        }
        levels.push_back(values);
        frontier = next;
    }
    for (const vector<int>& level : levels) out.push_back(level.back());
    return out;
}`,
  },
  {
    name: "Level order, remembering only the last",
    summary:
      "The same breadth-first sweep, but a level's values are never stored: the loop tracks the last node it dequeued on the current level and appends that one value before moving on.",
    complexity: { time: "O(n)", space: "O(w)" },
    whyNow:
      "Storing every level keeps the whole tree in memory to read one value per row — the other values are collected and then thrown away. The last node of a level is known while the level is being walked, so nothing but that one value has to survive the level.",
    python: `def right_side_view(root) -> list[int]:
    if root is None:
        return []
    out: list[int] = []
    frontier = [root]
    while frontier:
        out.append(frontier[-1].val)      # the rightmost on this level
        nxt = []
        for node in frontier:
            if node.left is not None:
                nxt.append(node.left)
            if node.right is not None:
                nxt.append(node.right)
        frontier = nxt
    return out`,
    java: `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;
    Queue<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) out.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
    }
    return out;
}`,
    cpp: `vector<int> rightSideView(TreeNode* root) {
    vector<int> out;
    if (root == nullptr) return out;
    vector<TreeNode*> frontier{root};
    while (!frontier.empty()) {
        out.push_back(frontier.back()->val);
        vector<TreeNode*> next;
        for (TreeNode* node : frontier) {
            if (node->left != nullptr) next.push_back(node->left);
            if (node->right != nullptr) next.push_back(node->right);
        }
        frontier = next;
    }
    return out;
}`,
  },
  {
    name: "Depth-first left to right, overwriting",
    summary:
      "Walk in the natural left-then-right order and write each node's value into a slot indexed by its depth. Later nodes on the same level overwrite earlier ones, so the last writer — the rightmost node — wins.",
    complexity: { time: "O(n)", space: "O(h)" },
    whyNow:
      "A level-by-level sweep still holds a frontier, and the widest level of a full tree is half the nodes. Depth-first holds only the current path, so the memory follows the height instead — the question is how a depth-first walk can know which node on a level is the rightmost, and writing by depth answers it without any comparison.",
    python: `def right_side_view(root) -> list[int]:
    out: list[int] = []

    def walk(node, depth: int) -> None:
        if node is None:
            return
        if depth == len(out):
            out.append(node.val)
        else:
            out[depth] = node.val     # a later node on this level wins
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return out`,
    java: `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    walkOverwrite(root, 0, out);
    return out;
}

private void walkOverwrite(TreeNode node, int depth, List<Integer> out) {
    if (node == null) return;
    if (depth == out.size()) out.add(node.val);
    else out.set(depth, node.val);
    walkOverwrite(node.left, depth + 1, out);
    walkOverwrite(node.right, depth + 1, out);
}`,
    cpp: `void walkOverwrite(const TreeNode* node, int depth, vector<int>& out) {
    if (node == nullptr) return;
    if (depth == (int)out.size()) out.push_back(node->val);
    else out[depth] = node->val;
    walkOverwrite(node->left, depth + 1, out);
    walkOverwrite(node->right, depth + 1, out);
}

vector<int> rightSideView(const TreeNode* root) {
    vector<int> out;
    walkOverwrite(root, 0, out);
    return out;
}`,
  },
]
