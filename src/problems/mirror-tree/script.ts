// mirror-tree — every approach in one file, cross-checked
//
// Converted from docs/deep/mirror-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`TreeNode\`, \`build\`, \`to_values\`, \`mirror_of\` and \`random_tree\` are **scaffolding, not part of the
answer** — except \`mirror_of\`, which approach 2 genuinely uses, and which is also how the random
stress case manufactures symmetric trees to test against.

The \`_bug_*\` functions are the mistakes from each section, run: the hole-free level check that returns
\`True\` on all three statement examples, the in-order palindrome that cannot see shape, the uncrossed
pair walk that is wrong in both directions, and the in-place inversion that returns \`True\` for
everything *and* mutates the caller's tree — the run prints the tree before and after to show it.`

export const script = `"""Is the Tree Symmetric? — every approach in one file, cross-checked.

Run:  python mirror_tree.py
"""

from __future__ import annotations

import random
from collections import deque
from typing import Callable, Optional


# ---------------------------------------------------------------- scaffolding
class TreeNode:
    """The node an interviewer hands you. Scaffolding, not part of any answer."""

    __slots__ = ("val", "left", "right")

    def __init__(self, val: int = 0, left: "TreeNode | None" = None,
                 right: "TreeNode | None" = None) -> None:
        self.val = val
        self.left = left
        self.right = right


def build(values: list[Optional[int]]) -> Optional[TreeNode]:
    """Level-order list with \`None\` holes -> tree, so tests can be written as lists."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ("left", "right"):
            if i >= len(values):
                break
            v = values[i]
            i += 1
            if v is not None:
                child = TreeNode(v)
                setattr(node, side, child)
                queue.append(child)
    return root


def to_values(root: Optional[TreeNode]) -> list[Optional[int]]:
    """Tree -> level-order list, trimmed. Used to show the in-place damage."""
    if root is None:
        return []
    out: list[Optional[int]] = []
    queue: deque[Optional[TreeNode]] = deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def mirror_of(node: Optional[TreeNode]) -> Optional[TreeNode]:
    """A NEW tree, reflected. The original is untouched. Used by approach 2."""
    if node is None:
        return None
    return TreeNode(node.val, mirror_of(node.right), mirror_of(node.left))


def random_tree(n: int, rng: random.Random,
                values: tuple[int, ...] = (1, 2)) -> Optional[TreeNode]:
    """Arbitrary shape, deliberately few distinct values so shape does the deciding."""
    if n == 0:
        return None
    root = TreeNode(rng.choice(values))
    open_slots = [root]
    for _ in range(n - 1):
        parent = rng.choice(open_slots)
        node = TreeNode(rng.choice(values))
        if parent.left is None and (parent.right is not None or rng.random() < 0.5):
            parent.left = node
        else:
            parent.right = node
        if parent.left is not None and parent.right is not None:
            open_slots.remove(parent)
        open_slots.append(node)
    return root


def same_tree(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """Structural equality — used by approach 2. See same-tree_explained.md."""
    if p is None and q is None:
        return True
    if p is None or q is None or p.val != q.val:
        return False
    return same_tree(p.left, q.left) and same_tree(p.right, q.right)


# ------------------------------- approach 1: every level a palindrome, holes kept
def is_symmetric_levels(root: Optional[TreeNode]) -> bool:
    """Every level, holes included, must read the same both ways."""
    if root is None:
        return True
    level: list[Optional[TreeNode]] = [root]
    while any(node is not None for node in level):
        values = [None if node is None else node.val for node in level]
        if values != values[::-1]:
            return False
        nxt: list[Optional[TreeNode]] = []
        for node in level:
            nxt.append(node.left if node else None)
            nxt.append(node.right if node else None)
        level = nxt
    return True


# ------------------------------ approach 2: build the reflection, then compare
def is_symmetric_by_mirroring(root: Optional[TreeNode]) -> bool:
    """Symmetric means equal to its own reflection."""
    return same_tree(root, mirror_of(root))


# ------------------------------------- approach 3: one recursion over crossed pairs
def is_symmetric_pairs(root: Optional[TreeNode]) -> bool:
    """The unit is a PAIR, and the recursion crosses it."""

    def mirror(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)

    return root is None or mirror(root.left, root.right)


# --------------------------- approach 4: the same crossed pairs, in a container
def is_symmetric_iterative(root: Optional[TreeNode]) -> bool:
    """Approach 3 with the pairs in a queue instead of on the call stack."""
    if root is None:
        return True
    queue: deque[tuple[Optional[TreeNode], Optional[TreeNode]]] = deque([(root.left, root.right)])
    while queue:
        a, b = queue.popleft()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        queue.append((a.left, b.right))       # the crossing, again
        queue.append((a.right, b.left))
    return True


# --------------------------------------------------------- the buggy variants
def _bug_levels_without_holes(root: Optional[TreeNode]) -> bool:
    """Approach 1 with the empty slots dropped — rows slide together."""
    if root is None:
        return True
    level = [root]
    while level:
        values = [node.val for node in level]
        if values != values[::-1]:
            return False
        nxt = []
        for node in level:
            if node.left:
                nxt.append(node.left)
            if node.right:
                nxt.append(node.right)
        level = nxt
    return True


def _bug_inorder_palindrome(root: Optional[TreeNode]) -> bool:
    """Any values-only test: blind by construction when values repeat."""
    values: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        values.append(node.val)
        walk(node.right)

    walk(root)
    return values == values[::-1]


def _bug_uncrossed(root: Optional[TreeNode]) -> bool:
    """Approach 3 without the crossing — this is same-tree, a different question."""
    def walk(a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return walk(a.left, b.left) and walk(a.right, b.right)
    return root is None or walk(root.left, root.right)


def _bug_invert_in_place(root: Optional[TreeNode]) -> bool:
    """Approach 2, inverting the caller's tree and comparing it with itself."""
    def invert(node: Optional[TreeNode]) -> Optional[TreeNode]:
        if node is None:
            return None
        node.left, node.right = invert(node.right), invert(node.left)
        return node
    return same_tree(root, invert(root))


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], bool]]] = [
    ("levels", is_symmetric_levels),
    ("mirror-copy", is_symmetric_by_mirroring),
    ("pairs", is_symmetric_pairs),
    ("iterative", is_symmetric_iterative),
]

EXAMPLE_1: list[Optional[int]] = [1, 2, 2, 3, 4, 4, 3]
EXAMPLE_2: list[Optional[int]] = [1, 2, 2, None, 3, None, 3]
EXAMPLE_3: list[Optional[int]] = [1, 1, 1, 1, None, 1]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], bool]] = [
        ("statement example 1", EXAMPLE_1, True),
        ("statement example 2", EXAMPLE_2, False),
        ("statement example 3, all ones", EXAMPLE_3, False),
        ("empty tree", [], True),
        ("single node", [1], True),
        ("two nodes", [1, 2], False),
        ("mirrored shape, one value off", [1, 2, 2, 3, 4, 4, 5], False),
        ("deep and symmetric", [1, 2, 2, 3, 4, 4, 3, 5, 6, 7, 8, 8, 7, 6, 5], True),
        ("negative values, symmetric", [-1, -2, -2], True),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, values, expected in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        print(f"\\n{label}: {values}   (expected {expected})")
        for name, got in results.items():
            print(f"  {name:<{width}} -> {got}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT: {results}")
        elif next(iter(results.values())) is not expected:
            all_agreed = False
            print("  WRONG: unanimous, but not the expected answer")

    rng = random.Random(20260913)
    for _ in range(600):
        tree = random_tree(rng.randint(0, 12), rng)
        if rng.random() < 0.4:                      # half the cases are genuinely symmetric
            half = random_tree(rng.randint(0, 5), rng)
            tree = TreeNode(7, half, mirror_of(half))
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {to_values(tree)}: {results}")

    print("\\n=== the values-only shortcuts, on the statement's own examples ===")
    print(f"  {'input':<34} {'no holes':>9} {'in-order':>9} {'answer':>7}")
    for label, values in [("example 1", EXAMPLE_1), ("example 2", EXAMPLE_2),
                          ("example 3, all ones", EXAMPLE_3)]:
        print(f"  {label + ' ' + str(values):<34} "
              f"{_bug_levels_without_holes(build(values))!s:>9} "
              f"{_bug_inorder_palindrome(build(values))!s:>9} "
              f"{is_symmetric_pairs(build(values))!s:>7}")

    print("\\n=== the pair walk without the crossing ===")
    for label, values in [("example 1", EXAMPLE_1), ("example 2", EXAMPLE_2)]:
        print(f"  {label:<12} uncrossed {_bug_uncrossed(build(values))!s:<6} "
              f"answer {is_symmetric_pairs(build(values))}")

    print("\\n=== inverting in place: the verdict, and the caller's tree ===")
    tree = build(EXAMPLE_2)
    before = to_values(tree)
    verdict = _bug_invert_in_place(tree)
    print(f"  before  {before}")
    print(f"  verdict {verdict}   (the answer is {is_symmetric_pairs(build(EXAMPLE_2))})")
    print(f"  after   {to_values(tree)}   <- the caller's tree was rearranged")

    print(f"\\n{len(cases)} listed cases + 600 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
