import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "inorder-walk",
  title: "Read a Tree Left, Node, Right",
  pattern: "trees",
  difficulty: "easy",
  leetcode: "binary-tree-inorder-traversal",
  brief:
    "List a binary tree's values in left-node-right order, without recursion.",
  statement:
    "Given the root of a binary tree, return its values in inorder: everything in a node's left subtree, then the node, then everything in its right subtree.",
  constraints: [
    "0 <= number of nodes <= 10^4",
    "-100 <= node value <= 100",
    "the tree is a binary tree, NOT a search tree — inorder is defined by shape (left, node, right), so the answer is only sorted when the tree happens to be a BST",
    "every node appears exactly once in the answer, so the output length is the node count",
    "an empty tree is legal and answers with an empty row",
    "the tree may be a single chain, which is what makes recursion depth a real constraint rather than a detail",
  ],
  examples: [
    {
      input: "root = [1, null, 2, 3]",
      output: "[1, 3, 2]",
      note: "1 has no left child, so it prints first; then its right subtree, whose own left child 3 comes before 2.",
    },
    { input: "root = []", output: "[]" },
    {
      input: "root = [3, 1, 5, null, 2]",
      output: "[1, 2, 3, 5]",
      note: "Sorted here only because this tree happens to be a BST — the walk did not sort anything.",
    },
  ],
  hints: [
    "Say the rule out loud: everything left of me, then me, then everything right of me. The recursion writes itself — the interesting version is the one without it.",
    "To leave recursion behind you need what recursion was storing for you: the nodes you walked past on the way down and still owe a visit.",
    "Push left children until there is no left child, pop, record that value, then step right and repeat the descent from there.",
  ],
  whyNow:
    "Threading gets space to O(1) but it REWIRES the tree while walking and repairs it afterwards, so any reader has to trust the repair — and a walk that stops early (an exception, a break, a caller that only wanted the first three values) leaves the tree wired wrong. An explicit stack holds exactly what the recursion held, keeps the tree read-only, and costs memory proportional to the height rather than the node count.",
  arc: "Every rung here is the same walk — left, node, right — and what changes is WHERE the unfinished work is kept. The first version keeps it in the values it returns, and pays for that by rebuilding a list at every node. The second keeps it in the call stack, which is what recursion is for and costs the height of the tree. The third keeps it in an explicit stack, which is the same thing with the lid off: you can see the nodes owed a visit, bound the memory, and stop early. The fourth keeps it inside the tree's own empty pointers, trading a mutation for constant space. That ladder — return value, call stack, explicit stack, the structure itself — reappears in every traversal question you will be asked. Know the explicit-stack version cold; it is the one an interviewer means by 'without recursion', and the pre-order and post-order variants are the same loop with the pushes reordered.",
  approach:
    "Keep a stack of nodes owed a visit and a cursor. Push the cursor and walk left until there is no left child; then pop, record that value, and move the cursor to the popped node's right child, which restarts the same descent one subtree over. The loop ends when both the stack and the cursor are empty. Each node is pushed once and popped once, so the walk is linear, and the stack never holds more than one node per level.",
  complexity: { time: "O(n)", space: "O(h)" },
  python: `def inorder_walk(root) -> list[int]:
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
    return out`,
  java: `public List<Integer> inorderWalk(TreeNode root) {
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
}`,
  cpp: `vector<int> inorderWalk(TreeNode* root) {
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
}`,
  walkthrough: [
    {
      cells: {
        values: [1, "·", 2, 3],
        marks: { 0: "focus" },
        labels: { 0: "root" },
      },
      caption:
        "The tree [1, null, 2, 3]: root 1 with no left child, right child 2, whose left child is 3. Inorder asks for everything left of a node before the node itself.",
    },
    {
      cells: { values: [1, "·", 2, 3], marks: { 0: "done" } },
      caption:
        "1 has no left subtree, so nothing is owed before it. Record 1 and step right into the subtree rooted at 2. Answer so far: [1].",
    },
    {
      cells: {
        values: [1, "·", 2, 3],
        marks: { 0: "done", 2: "window", 3: "focus" },
        labels: { 2: "stacked" },
      },
      caption:
        "From 2 the descent pushes 2 onto the stack and walks left to 3. 3 has no left child, so it is the next value owed.",
    },
    {
      cells: {
        values: [1, "·", 2, 3],
        marks: { 0: "done", 3: "done", 2: "focus" },
      },
      caption:
        "Record 3, step to its right child — there is none — so the loop pops the node still owed: 2. Answer so far: [1, 3].",
    },
    {
      cells: {
        values: [1, "·", 2, 3],
        marks: { 0: "done", 2: "done", 3: "done" },
      },
      caption:
        "Record 2, step right into nothing, stack empty, cursor null: the walk ends at [1, 3, 2]. Every node was pushed once and popped once.",
    },
  ],
  alternatives: [
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
  ],
}
