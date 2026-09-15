// same-tree — the ladder: every way in, worst first.
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

export const approach = "Compare the two roots. Both empty means identical; exactly one empty means not; otherwise the values must match and both pairs of subtrees must match in turn. The recursion mirrors the structure it is checking, which is why there is nothing to write beyond the three cases. Short-circuit evaluation means a tree that differs at the root costs one comparison rather than a full traversal."

export const whyNow = "Serialising both trees and comparing the strings works only if the serialisation records the empty children too; leave those out and a mirrored pair compares equal. Comparing structurally never has that ambiguity, and it stops at the first disagreement instead of building two whole strings first."

export const arc = "Identical means identical in SHAPE as much as in values, and the ladder is really about how easily the shape gets lost. Serialising both trees and comparing the strings works only if the serialisation records the empty children too — leave those out and a tree leaning left compares equal to its mirror, a bug that passes every test built from balanced examples. It also builds two whole strings before it is allowed to disagree. Comparing structurally has no such ambiguity, because the recursion walks the two trees in lockstep and three cases are the entire program: both empty is true, exactly one empty is false, otherwise the values must match and both pairs of subtrees must match in turn. Short-circuiting means a difference at the root costs one comparison rather than a traversal. That lockstep, two-pointers-into-two-trees recursion is the piece to carry: symmetric-tree is this function with the child pairs crossed over, and subtree-of-another-tree calls it at every node."

export const complexity = { time: "O(n)", space: "O(h)" }

export const python = `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def is_same_tree(p: TreeNode | None, q: TreeNode | None) -> bool:
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`

export const java = `public boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    if (p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`

export const cpp = `bool isSameTree(TreeNode* p, TreeNode* q) {
    if (p == nullptr && q == nullptr) return true;
    if (p == nullptr || q == nullptr) return false;
    if (p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}`

export const alternatives: Solution[] = [
  {
    key: "serialise",
    name: "Serialise and compare",
    summary:
      "Turn each tree into a string that records every value AND every empty child, then compare the two strings. The null markers are the whole trick, because without them two differently shaped trees serialise identically, and it builds two full O(n) strings to answer a question that needs no storage at all.",
    complexity: { time: "O(n)", space: "O(n)" },
    python: `class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


def serialise(node: TreeNode | None) -> str:
    if node is None:
        return "#"
    return "(" + str(node.val) + serialise(node.left) + serialise(node.right) + ")"


def is_same_tree(p: TreeNode | None, q: TreeNode | None) -> bool:
    return serialise(p) == serialise(q)`,
    java: `public String serialise(TreeNode node) {
    if (node == null) return "#";
    return "(" + node.val + serialise(node.left) + serialise(node.right) + ")";
}

public boolean isSameTree(TreeNode p, TreeNode q) {
    return serialise(p).equals(serialise(q));
}`,
    cpp: `string serialise(const TreeNode* node) {
    if (node == nullptr) return "#";
    return "(" + to_string(node->val) + serialise(node->left) + serialise(node->right) + ")";
}

bool isSameTree(const TreeNode* p, const TreeNode* q) {
    return serialise(p) == serialise(q);
}`,
  },
  // B79. The document teaches the lockstep walk twice — once with the call
  // stack and once with an explicit one — and the page could only name the
  // first. The unit on the stack is what makes this rung worth a place: it is
  // a PAIR of nodes, not a node, which is the framing the symmetry question
  // next door is built on.
  {
    key: "iterative",
    name: "The same lockstep walk, iteratively",
    whyNow:
      "The recursion is the clearest statement of the rule and it spends a frame per level, so a tree degenerated into a 10,000-node chain — legal here — exhausts the stack before it can answer. An explicit stack is the same walk with the frames written out by hand.",
    summary:
      "Push the two roots as one pair and keep popping pairs: two absent nodes agree and are dropped, one absent or two different values is an immediate no, and otherwise the two left children and the two right children go on as two more pairs. Same linear bound and the same early exit as the recursion, with O(h) of heap instead of O(h) of call stack. Reach for it when the tree may be deep, or when the next question is about symmetry — which is this loop with the pairs crossed.",
    complexity: { time: "O(n)", space: "O(h)" },
    python: `def is_same_tree(p, q) -> bool:
    stack = [(p, q)]  # the unit is a PAIR of nodes, not a node
    while stack:
        a, b = stack.pop()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        stack.append((a.left, b.left))
        stack.append((a.right, b.right))
    return True`,
    java: `public boolean isSameTree(TreeNode p, TreeNode q) {
    Deque<TreeNode[]> stack = new ArrayDeque<>();
    stack.push(new TreeNode[] { p, q });
    while (!stack.isEmpty()) {
        TreeNode[] pair = stack.pop();
        TreeNode a = pair[0], b = pair[1];
        if (a == null && b == null) continue;
        if (a == null || b == null || a.val != b.val) return false;
        stack.push(new TreeNode[] { a.left, b.left });
        stack.push(new TreeNode[] { a.right, b.right });
    }
    return true;
}`,
    cpp: `bool isSameTree(const TreeNode* p, const TreeNode* q) {
    vector<pair<const TreeNode*, const TreeNode*>> stack{ { p, q } };
    while (!stack.empty()) {
        auto [a, b] = stack.back();
        stack.pop_back();
        if (!a && !b) continue;
        if (!a || !b || a->val != b->val) return false;
        stack.push_back({ a->left, b->left });
        stack.push_back({ a->right, b->right });
    }
    return true;
}`,
  },
]
