// max-depth — every approach in one file, cross-checked
//
// Converted from docs/deep/max-depth_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`TreeNode\`, \`build\`, \`chain\`, \`perfect\` and \`random_tree\` are **scaffolding, not part of the
answer** — an interviewer hands you a \`root\` with the node class already defined. They are here so
this file can build inputs from ordinary Python lists, and so the claims above about memory and
recursion limits can be *measured* rather than asserted.

The \`_bug_*\` functions are the "common mistake" from each section, kept in the file and executed, so
that every specific wrong answer this document quotes — \`0\`, \`5\`, \`2\`, the two \`AttributeError\`s —
is printed by the run rather than remembered by the author.`

export const script = `"""Maximum Depth of a Binary Tree — every approach in one file, cross-checked.

Run:  python max_depth.py
"""

from __future__ import annotations

import random
import sys
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


def chain(n: int) -> Optional[TreeNode]:
    """A tree degenerated into a linked list: n nodes, each the left child of the last."""
    root = None
    for v in range(n, 0, -1):
        root = TreeNode(v, left=root)
    return root


def perfect(height: int) -> Optional[TreeNode]:
    """A perfect tree of the given height — 2**height - 1 nodes."""
    if height == 0:
        return None
    return TreeNode(height, perfect(height - 1), perfect(height - 1))


def random_tree(n: int, rng: random.Random) -> Optional[TreeNode]:
    """A tree of exactly n nodes with an arbitrary shape — the stress-test input."""
    if n == 0:
        return None
    root = TreeNode(rng.randint(-100, 100))
    open_slots = [root]
    for _ in range(n - 1):
        parent = rng.choice(open_slots)
        node = TreeNode(rng.randint(-100, 100))
        if parent.left is None and (parent.right is not None or rng.random() < 0.5):
            parent.left = node
        else:
            parent.right = node
        if parent.left is not None and parent.right is not None:
            open_slots.remove(parent)
        open_slots.append(node)
    return root


# ------------- approach 1: enumerate every root-to-leaf path, take the longest
def max_depth_paths(root: Optional[TreeNode]) -> int:
    """The statement, transcribed. Builds every path, then measures them."""
    paths: list[list[int]] = []

    def walk(node: Optional[TreeNode], path: list[int]) -> None:
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            paths.append(list(path))          # a COPY: \`path\` is about to change
        else:
            walk(node.left, path)
            walk(node.right, path)
        path.pop()

    walk(root, [])
    return max((len(p) for p in paths), default=0)


# ------------------- approach 2: BFS, one increment per completed level
def max_depth_bfs(root: Optional[TreeNode]) -> int:
    """Depth is the number of levels, so count levels — a queue drained a level at a time."""
    if root is None:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        depth += 1
        for _ in range(len(queue)):           # len() snapshot: this level only
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth


# -------------- approach 3: DFS with an explicit stack of (node, depth) pairs
def max_depth_stack(root: Optional[TreeNode]) -> int:
    """One root-to-leaf path in memory instead of one whole level."""
    best = 0
    stack: list[tuple[TreeNode, int]] = [(root, 1)] if root else []
    while stack:
        node, depth = stack.pop()
        if depth > best:
            best = depth
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    return best


# ---------------------------------------- approach 4: the definition, typed out
def max_depth_recursive(root: Optional[TreeNode]) -> int:
    """depth(node) = 1 + max(depth(left), depth(right)); depth(None) = 0."""
    if root is None:
        return 0
    return 1 + max(max_depth_recursive(root.left), max_depth_recursive(root.right))


# --------------------------------------------------------- the buggy variants
# Every "common mistake" in the document is one of these, and every number the
# document quotes for one was printed by the run below. Nothing here is an answer.
def _bug_aliased_path(root: Optional[TreeNode]) -> int:
    """Approach 1, recording the live list instead of a copy of it."""
    paths: list[list[int]] = []

    def walk(node: Optional[TreeNode], path: list[int]) -> None:
        if node is None:
            return
        path.append(node.val)
        if node.left is None and node.right is None:
            paths.append(path)                # aliased — every entry is the SAME list
        else:
            walk(node.left, path)
            walk(node.right, path)
        path.pop()

    walk(root, [])
    return max((len(p) for p in paths), default=0)


def _bug_bfs_counts_nodes(root: Optional[TreeNode]) -> int:
    """Approach 2 without the inner loop: one increment per node, not per level."""
    if root is None:
        return 0
    depth = 0
    queue = deque([root])
    while queue:
        node = queue.popleft()
        depth += 1
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return depth


def _bug_stack_from_zero(root: Optional[TreeNode]) -> int:
    """Approach 3 pushing the root at depth 0 — counting edges, not nodes."""
    best = 0
    stack: list[tuple[TreeNode, int]] = [(root, 0)] if root else []
    while stack:
        node, depth = stack.pop()
        if depth > best:
            best = depth
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    return best


def _bug_leaf_base_case(root: Optional[TreeNode]) -> int:
    """Approach 4 with the base case on a LEAF instead of on a missing node."""
    if root.left is None and root.right is None:
        return 1
    return 1 + max(_bug_leaf_base_case(root.left), _bug_leaf_base_case(root.right))


# ------------------------------------------------- measuring the memory trade
# Not answers either: the same two walks, instrumented to report how many nodes
# they ever held at once. This is the whole difference between approach 2 and 3.
def peak_queue(root: Optional[TreeNode]) -> int:
    if root is None:
        return 0
    peak = 1
    queue = deque([root])
    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
            peak = max(peak, len(queue))
    return peak


def peak_stack(root: Optional[TreeNode]) -> int:
    peak = 0
    stack: list[tuple[TreeNode, int]] = [(root, 1)] if root else []
    while stack:
        peak = max(peak, len(stack))
        node, depth = stack.pop()
        if node.left:
            stack.append((node.left, depth + 1))
        if node.right:
            stack.append((node.right, depth + 1))
    return peak


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], int]]] = [
    ("paths", max_depth_paths),
    ("bfs", max_depth_bfs),
    ("stack", max_depth_stack),
    ("recursive", max_depth_recursive),
]

EXAMPLE: list[Optional[int]] = [3, 9, 20, None, None, 15, 7]


def _try(label: str, fn: Callable[[], int]) -> None:
    """Print what a call returns, or which exception it raises. Used for the bugs."""
    try:
        print(f"  {label:<46} {fn()}")
    except Exception as exc:                  # noqa: BLE001 — the point is which one
        print(f"  {label:<46} {type(exc).__name__}: {exc}")


def main() -> None:
    cases: list[tuple[str, list[Optional[int]]]] = [
        ("statement example", EXAMPLE),
        ("empty tree", []),
        ("single node", [1]),
        ("one child only, left", [1, 2]),
        ("one child only, right", [1, None, 2]),
        ("perfect tree of 7", [1, 2, 3, 4, 5, 6, 7]),
        ("left spine of 4", [1, 2, None, 3, None, 4]),
        ("duplicate values throughout", [5, 5, 5, 5, None, None, 5]),
        ("negative values", [-1, -2, -3]),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    shown = 0

    for label, values in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        if shown < 6:
            shown += 1
            print(f"\\n{label}: {values}")
            for name, got in results.items():
                print(f"  {name:<{width}} -> {got}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: {results}")

    rng = random.Random(20260913)
    for _ in range(400):
        n = rng.randint(0, 60)
        tree = random_tree(n, rng)
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on a random tree of {n}: {results}")

    print("\\n=== what this document claims about wrong code, run ===")
    _try("aliased path list, statement example", lambda: _bug_aliased_path(build(EXAMPLE)))
    _try("BFS counting nodes, statement example", lambda: _bug_bfs_counts_nodes(build(EXAMPLE)))
    _try("stack pushed at depth 0, statement example", lambda: _bug_stack_from_zero(build(EXAMPLE)))
    _try("leaf base case, statement example", lambda: _bug_leaf_base_case(build(EXAMPLE)))
    _try("leaf base case, [1, 2]", lambda: _bug_leaf_base_case(build([1, 2])))
    _try("leaf base case, empty tree", lambda: _bug_leaf_base_case(build([])))

    print("\\n=== how many nodes each walk holds at once ===")
    shapes = [
        ("perfect tree, 1023 nodes, height 10", perfect(10)),
        ("perfect tree, 32767 nodes, height 15", perfect(15)),
        ("left spine, 1000 nodes", chain(1000)),
    ]
    print(f"  {'shape':<38} {'BFS queue':>10} {'DFS stack':>10}")
    for label, tree in shapes:
        print(f"  {label:<38} {peak_queue(tree):>10} {peak_stack(tree):>10}")

    print("\\n=== the call stack, at the constraint's own upper limit ===")
    print(f"  sys.getrecursionlimit() = {sys.getrecursionlimit()}")
    spine = chain(10_000)
    _try("recursive on a 10000-node left spine", lambda: max_depth_recursive(spine))
    _try("paths on a 10000-node left spine", lambda: max_depth_paths(spine))
    _try("stack on a 10000-node left spine", lambda: max_depth_stack(spine))
    _try("bfs on a 10000-node left spine", lambda: max_depth_bfs(spine))

    print(f"\\n{len(cases)} listed cases + 400 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
