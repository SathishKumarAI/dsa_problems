// mirror-tree — the ladder: every way in, worst first.
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

export const approach = "Ask the question about a pair rather than about a node. Two subtrees mirror each other when both are empty, or when both exist, hold the same value, and their children match CROSSED: a's left against b's right, and a's right against b's left. Start with (root.left, root.right) and recurse. The first mismatch short-circuits, so a tree that fails at the top costs almost nothing, and a symmetric tree visits every node once."

export const whyNow = "A queue of pairs holds a whole level at once, and the widest level of a 1000-node tree is ~500 pairs, while the property being checked is local: one pair at a time, crossed. Recursing on the pair keeps only the ancestors of the pair being examined — the height, not the width — and the crossing that defines the whole problem becomes the two arguments of one call."

export const arc = "The lesson is smaller than the problem: ask the question about the right THING. Symmetry is not a property of a node, so every attempt that walks one cursor — collect the values, compare a list to its reverse — ends up testing a shadow of the real question and getting the shape wrong. The moment the unit of comparison becomes a PAIR, crossed, the recursion writes itself and the corner case (one child present, one absent) stops being a special case and becomes the base case. Carry two things from this: when a check keeps needing exceptions, the unit is probably wrong; and a values-only test can never see structure, which is why [1,1,1,1,null,1] is worth remembering as the counterexample that kills the tempting shortcut."

export const complexity = { time: "O(n)", space: "O(h)" }

export const python = `def is_symmetric(root) -> bool:
    def mirror(a, b) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)

    return root is None or mirror(root.left, root.right)`

export const java = `public boolean isSymmetric(TreeNode root) {
    return root == null || mirror(root.left, root.right);
}

private boolean mirror(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
}`

export const cpp = `bool mirrorPair(const TreeNode* a, const TreeNode* b) {
    if (a == nullptr && b == nullptr) return true;
    if (a == nullptr || b == nullptr || a->val != b->val) return false;
    return mirrorPair(a->left, b->right) && mirrorPair(a->right, b->left);
}

bool isSymmetric(const TreeNode* root) {
    return root == nullptr || mirrorPair(root->left, root->right);
}`

export const alternatives: Solution[] = [
  {
    name: "Palindrome of the values (broken)",
    summary:
      "Walk the tree inorder into a row of values and check whether the row reads the same backwards. Cheap, intuitive, and wrong: it tests the values and says nothing about the shape.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `def is_symmetric_WRONG(root) -> bool:
    values = []

    def walk(node) -> None:
        if node is None:
            return
        walk(node.left)
        values.append(node.val)
        walk(node.right)

    walk(root)
    # [1, 1, 1, 1, null, 1] reads as a palindrome and is NOT symmetric
    return values == values[::-1]`,
    java: `public boolean isSymmetricWRONG(TreeNode root) {
    List<Integer> values = new ArrayList<>();
    walk(root, values);
    for (int i = 0, j = values.size() - 1; i < j; i++, j--)
        if (!values.get(i).equals(values.get(j))) return false;
    return true;
}

private void walk(TreeNode node, List<Integer> values) {
    if (node == null) return;
    walk(node.left, values);
    values.add(node.val);
    walk(node.right, values);
}`,
    cpp: `void collectInorder(const TreeNode* node, vector<int>& values) {
    if (node == nullptr) return;
    collectInorder(node->left, values);
    values.push_back(node->val);
    collectInorder(node->right, values);
}

bool isSymmetricWRONG(const TreeNode* root) {
    vector<int> values;
    collectInorder(root, values);
    for (int i = 0, j = (int)values.size() - 1; i < j; i++, j--)
        if (values[i] != values[j]) return false;
    return true;
}`,
  },
  {
    name: "Build the mirror, then compare",
    summary:
      "Construct a flipped copy of the tree — every node's children swapped — and compare it against the original node by node. Honest, and it makes the definition literal.",
    complexity: { time: "O(n)", space: "O(n)" },
    whyNow:
      "The palindrome answers a question about a multiset of values, not about a tree: a row of equal values reads the same backwards no matter how the nodes hang. Shape has to enter the comparison, and the bluntest way to make it enter is to build the mirrored tree and compare structures, where an absent child can only match another absent child.",
    python: `def is_symmetric(root) -> bool:
    def flip(node):
        if node is None:
            return None
        copy_node = type(node)(node.val)
        copy_node.left = flip(node.right)
        copy_node.right = flip(node.left)
        return copy_node

    def same(a, b) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return same(a.left, b.left) and same(a.right, b.right)

    return same(root, flip(root))`,
    java: `public boolean isSymmetric(TreeNode root) {
    return same(root, flip(root));
}

private TreeNode flip(TreeNode node) {
    if (node == null) return null;
    TreeNode copy = new TreeNode(node.val);
    copy.left = flip(node.right);
    copy.right = flip(node.left);
    return copy;
}

private boolean same(TreeNode a, TreeNode b) {
    if (a == null && b == null) return true;
    if (a == null || b == null || a.val != b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
}`,
    cpp: `TreeNode* flipTree(const TreeNode* node) {
    if (node == nullptr) return nullptr;
    TreeNode* copy = new TreeNode(node->val);
    copy->left = flipTree(node->right);
    copy->right = flipTree(node->left);
    return copy;
}

bool sameTreeShape(const TreeNode* a, const TreeNode* b) {
    if (a == nullptr && b == nullptr) return true;
    if (a == nullptr || b == nullptr || a->val != b->val) return false;
    return sameTreeShape(a->left, b->left) && sameTreeShape(a->right, b->right);
}

bool isSymmetric(const TreeNode* root) {
    return sameTreeShape(root, flipTree(root));
}`,
  },
  {
    name: "A queue of crossed pairs",
    summary:
      "Level order over PAIRS: enqueue the two children crossed, and on each dequeue compare the pair and enqueue their four children in mirrored order. No recursion anywhere.",
    complexity: { time: "O(n)", space: "O(n)" },
    whyNow:
      "Building the mirror allocates a second tree of the same size just to throw it away, and the comparison walks both — twice the memory and twice the nodes touched for an answer that is usually decided near the top. Comparing pairs directly needs no copy at all, and the first mismatch can stop the walk.",
    python: `def is_symmetric(root) -> bool:
    if root is None:
        return True
    queue = [(root.left, root.right)]
    while queue:
        a, b = queue.pop()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        queue.append((a.left, b.right))
        queue.append((a.right, b.left))
    return True`,
    java: `public boolean isSymmetric(TreeNode root) {
    if (root == null) return true;
    // LinkedList, not ArrayDeque: an absent child is a null in this queue and
    // ArrayDeque throws on one (the bug B30 found in invert-tree)
    Queue<TreeNode> queue = new LinkedList<>();
    queue.add(root.left);
    queue.add(root.right);
    while (!queue.isEmpty()) {
        TreeNode a = queue.poll();
        TreeNode b = queue.poll();
        if (a == null && b == null) continue;
        if (a == null || b == null || a.val != b.val) return false;
        queue.add(a.left);
        queue.add(b.right);
        queue.add(a.right);
        queue.add(b.left);
    }
    return true;
}`,
    cpp: `bool isSymmetric(TreeNode* root) {
    if (root == nullptr) return true;
    vector<TreeNode*> queue;
    queue.push_back(root->left);
    queue.push_back(root->right);
    size_t i = 0;
    while (i < queue.size()) {
        TreeNode* a = queue[i++];
        TreeNode* b = queue[i++];
        if (a == nullptr && b == nullptr) continue;
        if (a == nullptr || b == nullptr || a->val != b->val) return false;
        queue.push_back(a->left);
        queue.push_back(b->right);
        queue.push_back(a->right);
        queue.push_back(b->left);
    }
    return true;
}`,
  },
]
