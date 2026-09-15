// inorder-walk — the ladder: every way in, worst first.
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

export const approach = "Keep a stack of nodes owed a visit and a cursor. Push the cursor and walk left until there is no left child; then pop, record that value, and move the cursor to the popped node's right child, which restarts the same descent one subtree over. The loop ends when both the stack and the cursor are empty. Each node is pushed once and popped once, so the walk is linear, and the stack never holds more than one node per level."

export const whyNow = "Threading gets space to O(1) but it REWIRES the tree while walking and repairs it afterwards, so any reader has to trust the repair — and a walk that stops early (an exception, a break, a caller that only wanted the first three values) leaves the tree wired wrong. An explicit stack holds exactly what the recursion held, keeps the tree read-only, and costs memory proportional to the height rather than the node count."

export const arc = "Every rung here is the same walk — left, node, right — and what changes is WHERE the unfinished work is kept. The first version keeps it in the values it returns, and pays for that by rebuilding a list at every node. The second keeps it in the call stack, which is what recursion is for and costs the height of the tree. The third keeps it in an explicit stack, which is the same thing with the lid off: you can see the nodes owed a visit, bound the memory, and stop early. The fourth keeps it inside the tree's own empty pointers, trading a mutation for constant space. That ladder — return value, call stack, explicit stack, the structure itself — reappears in every traversal question you will be asked. Know the explicit-stack version cold; it is the one an interviewer means by 'without recursion', and the pre-order and post-order variants are the same loop with the pushes reordered."

export const complexity = { time: "O(n)", space: "O(h)" }

export const python = `def inorder_walk(root) -> list[int]:
    out = []
    stack = []
    node = root
    while node is not None or stack:
        while node is not None:
            stack.append(node)      # owed a visit, after its left subtree
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right           # the same descent, one subtree over
    return out`

export const java = `public List<Integer> inorderWalk(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !stack.isEmpty()) {
        while (node != null) {
            stack.push(node);
            node = node.left;
        }
        node = stack.pop();
        out.add(node.val);
        node = node.right;
    }
    return out;
}`

export const cpp = `vector<int> inorderWalk(TreeNode* root) {
    vector<int> out;
    vector<TreeNode*> stack;
    TreeNode* node = root;
    while (node != nullptr || !stack.empty()) {
        while (node != nullptr) {
            stack.push_back(node);
            node = node->left;
        }
        node = stack.back();
        stack.pop_back();
        out.push_back(node->val);
        node = node->right;
    }
    return out;
}`

export const alternatives: Solution[] = [
  {
    name: "Rebuild the answer at every node",
    summary:
      "The definition, typed literally: the left subtree's answer, then this value, then the right subtree's answer, joined into a new list at every node on the way back up.",
    complexity: { time: "O(n²)", space: "O(n²)" },
    python: `def inorder_walk(root) -> list[int]:
    if root is None:
        return []
    return inorder_walk(root.left) + [root.val] + inorder_walk(root.right)`,
    java: `public List<Integer> inorderWalk(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;
    out.addAll(inorderWalk(root.left));
    out.add(root.val);
    out.addAll(inorderWalk(root.right));
    return out;
}`,
    cpp: `vector<int> inorderWalk(TreeNode* root) {
    vector<int> out;
    if (root == nullptr) return out;
    vector<int> left = inorderWalk(root->left);
    vector<int> right = inorderWalk(root->right);
    out.insert(out.end(), left.begin(), left.end());
    out.push_back(root->val);
    out.insert(out.end(), right.begin(), right.end());
    return out;
}`,
  },
  {
    name: "One list, handed down",
    summary:
      "Same recursion, but the output list is created once and passed into every call, so a node appends its own value instead of returning a fresh list for its parent to copy.",
    complexity: { time: "O(n)", space: "O(h)" },
    whyNow:
      "Joining lists on the way up copies every value once per ancestor: on a chain of n nodes that is n + (n-1) + … copies, so a linear walk turns quadratic and allocates a list per node. The values are already in the right order as they are produced — only the container needs to stop being rebuilt.",
    python: `def inorder_walk(root) -> list[int]:
    out: list[int] = []

    def walk(node) -> None:
        if node is None:
            return
        walk(node.left)
        out.append(node.val)
        walk(node.right)

    walk(root)
    return out`,
    java: `public List<Integer> inorderWalk(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    walk(root, out);
    return out;
}

private void walk(TreeNode node, List<Integer> out) {
    if (node == null) return;
    walk(node.left, out);
    out.add(node.val);
    walk(node.right, out);
}`,
    cpp: `void walkInorder(TreeNode* node, vector<int>& out) {
    if (node == nullptr) return;
    walkInorder(node->left, out);
    out.push_back(node->val);
    walkInorder(node->right, out);
}

vector<int> inorderWalk(TreeNode* root) {
    vector<int> out;
    walkInorder(root, out);
    return out;
}`,
  },
  {
    name: "Morris threading",
    summary:
      "No stack and no recursion: before descending left, find the left subtree's rightmost node and point its empty right pointer back at the current node. That thread is the return path; on the way back it is cut and the value recorded.",
    complexity: { time: "O(n)", space: "O(1)" },
    whyNow:
      "Recursion's memory is the call stack, and its depth is the tree's height — a 10^4-node chain is 10^4 frames, which is past Python's default recursion limit and deep enough to matter in any language. The way out is to store the return path inside the tree itself, using the empty right pointers that a binary tree is full of.",
    python: `def inorder_walk(root) -> list[int]:
    out = []
    node = root
    while node is not None:
        if node.left is None:
            out.append(node.val)
            node = node.right
            continue
        pred = node.left
        while pred.right is not None and pred.right is not node:
            pred = pred.right
        if pred.right is None:
            pred.right = node      # the thread home
            node = node.left
        else:
            pred.right = None      # second visit: cut it and take the value
            out.append(node.val)
            node = node.right
    return out`,
    java: `public List<Integer> inorderWalk(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    TreeNode node = root;
    while (node != null) {
        if (node.left == null) {
            out.add(node.val);
            node = node.right;
            continue;
        }
        TreeNode pred = node.left;
        while (pred.right != null && pred.right != node) pred = pred.right;
        if (pred.right == null) {
            pred.right = node;
            node = node.left;
        } else {
            pred.right = null;
            out.add(node.val);
            node = node.right;
        }
    }
    return out;
}`,
    cpp: `vector<int> inorderWalk(TreeNode* root) {
    vector<int> out;
    TreeNode* node = root;
    while (node != nullptr) {
        if (node->left == nullptr) {
            out.push_back(node->val);
            node = node->right;
            continue;
        }
        TreeNode* pred = node->left;
        while (pred->right != nullptr && pred->right != node) pred = pred->right;
        if (pred->right == nullptr) {
            pred->right = node;
            node = node->left;
        } else {
            pred->right = nullptr;
            out.push_back(node->val);
            node = node->right;
        }
    }
    return out;
}`,
  },
]
