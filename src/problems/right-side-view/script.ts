// right-side-view — every approach in one file, cross-checked
//
// Converted from docs/deep/right-side-view_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`TreeNode\`, \`build\`, \`chain\`, \`perfect\` and \`random_tree\` are **scaffolding, not part of the
answer.** \`WRITES\` counts assignments into the answer, which is how the \`4 095\`-against-\`12\` claim in
approach 4 was produced rather than argued.

The \`_bug_*\` functions are the mistakes from each section, executed — including the one that matters
most here, walking down \`root.right\`, which is **correct on the statement's first example** and wrong
on its second. The run prints both, because a bug that passes the first example is the reason the
second example exists.`

export const script = `"""The Right Side View — every approach in one file, cross-checked.

Run:  python right_side_view.py
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


def chain(n: int, side: str = "left") -> Optional[TreeNode]:
    """A tree degenerated into a linked list, leaning whichever way is asked."""
    root = None
    for v in range(n, 0, -1):
        root = TreeNode(v, **{side: root})
    return root


def perfect(height_: int) -> Optional[TreeNode]:
    """A perfect tree of the given height — 2**height - 1 nodes."""
    if height_ == 0:
        return None
    return TreeNode(height_, perfect(height_ - 1), perfect(height_ - 1))


def random_tree(n: int, rng: random.Random) -> Optional[TreeNode]:
    """A tree of exactly n nodes with an arbitrary shape — the stress-test input."""
    if n == 0:
        return None
    root = TreeNode(rng.randint(-100, 100))
    slots = [root]
    for _ in range(n - 1):
        parent = rng.choice(slots)
        node = TreeNode(rng.randint(-100, 100))
        if parent.left is None and (parent.right is not None or rng.random() < 0.5):
            parent.left = node
        else:
            parent.right = node
        if parent.left is not None and parent.right is not None:
            slots.remove(parent)
        slots.append(node)
    return root


WRITES = {"n": 0}


# --------------------- approach 1: build every level, keep the last of each
def view_all_levels(root: Optional[TreeNode]) -> list[int]:
    """Build every level, then crop each to its last element."""
    levels: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(levels):
            levels.append([])
        levels[depth].append(node.val)
        walk(node.left, depth + 1)       # left first: the row must be in order
        walk(node.right, depth + 1)

    walk(root, 0)
    return [row[-1] for row in levels]


# ------------------------ approach 2: level order, remembering only the last
def view_bfs_last(root: Optional[TreeNode]) -> list[int]:
    """One round per level; the last node of the round is the visible one."""
    out: list[int] = []
    queue: deque[TreeNode] = deque([root] if root else [])
    while queue:
        last = None
        for _ in range(len(queue)):      # the snapshot: exactly this level
            node = queue.popleft()
            last = node.val
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(last)
    return out


# --------------------------- approach 3: depth-first, left to right, painting
def view_dfs_overwrite(root: Optional[TreeNode]) -> list[int]:
    """One slot per level, overwritten; the last writer on a level wins."""
    out: list[int] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        WRITES["n"] += 1
        if depth == len(out):
            out.append(node.val)
        else:
            out[depth] = node.val        # a later node on this level wins
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return out


# ------------------------------- approach 4: depth-first, right child first
def view_dfs_right_first(root: Optional[TreeNode]) -> list[int]:
    """Right before left: the FIRST arrival at a new depth is the visible node."""
    out: list[int] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(out):            # never been this deep before
            WRITES["n"] += 1
            out.append(node.val)
        walk(node.right, depth + 1)      # the order IS the algorithm
        walk(node.left, depth + 1)

    walk(root, 0)
    return out


# --------------------------------------------------------- the buggy variants
def _bug_follow_right_child(root: Optional[TreeNode]) -> list[int]:
    """The solution everyone writes first: walk down root.right until it ends."""
    out: list[int] = []
    node = root
    while node:
        out.append(node.val)
        node = node.right
    return out


def _bug_first_of_each_level(root: Optional[TreeNode]) -> list[int]:
    """Approach 1 with row[0]: the LEFT side view."""
    levels: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(levels):
            levels.append([])
        levels[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return [row[0] for row in levels]


def _bug_right_first_but_overwriting(root: Optional[TreeNode]) -> list[int]:
    """Right-first order kept, but every node writes — so the LAST writer wins."""
    out: list[int] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(out):
            out.append(node.val)
        else:
            out[depth] = node.val
        walk(node.right, depth + 1)
        walk(node.left, depth + 1)

    walk(root, 0)
    return out


# ------------------------------------------- instrumented walks, not answers
def peak_queue(root: Optional[TreeNode]) -> int:
    """The most nodes approach 2 holds at once — the widest level."""
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


def height(node: Optional[TreeNode]) -> int:
    """The deepest the depth-first versions recurse."""
    return 0 if node is None else 1 + max(height(node.left), height(node.right))


def writes(fn: Callable[[Optional[TreeNode]], list[int]], tree: Optional[TreeNode]) -> int:
    """Assignments into the answer made by one run of fn."""
    WRITES["n"] = 0
    fn(tree)
    return WRITES["n"]


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], list[int]]]] = [
    ("all-levels", view_all_levels),
    ("bfs-last", view_bfs_last),
    ("dfs-overwrite", view_dfs_overwrite),
    ("dfs-right-first", view_dfs_right_first),
]

EXAMPLE_1: list[Optional[int]] = [1, 2, 3, None, 5, None, 4]
EXAMPLE_2: list[Optional[int]] = [1, 2, 3, 4]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], list[int]]] = [
        ("statement example 1", EXAMPLE_1, [1, 3, 4]),
        ("statement example 2, the trap", EXAMPLE_2, [1, 3, 4]),
        ("empty tree", [], []),
        ("single node", [1], [1]),
        ("left spine of three", [1, 2, None, 3], [1, 2, 3]),
        ("right spine of three", [1, None, 2, None, 3], [1, 2, 3]),
        ("perfect tree of seven", [1, 2, 3, 4, 5, 6, 7], [1, 3, 7]),
        ("deep only on the left", [1, 2, 3, 4, None, None, None, 8], [1, 3, 4, 8]),
        ("duplicate values", [7, 7, 7], [7, 7]),
        ("negative values", [-1, -2, -3], [-1, -3]),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, values, expected in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        print(f"\\n{label}: {values} -> expected {expected}")
        for name, got in results.items():
            print(f"  {name:<{width}} -> {got}")
        unique = {tuple(v) for v in results.values()}
        if len(unique) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT: {results}")
        elif list(next(iter(unique))) != expected:
            all_agreed = False
            print("  WRONG: unanimous, but not the expected view")

    rng = random.Random(20260913)
    for _ in range(500):
        tree = random_tree(rng.randint(0, 40), rng)
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len({tuple(v) for v in results.values()}) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on a random tree: {results}")
        # the answer holds exactly one value per level, always
        if len(results["bfs-last"]) != height(tree):
            all_agreed = False
            print("  the view is not one value per level")

    print("\\n=== what this document claims about wrong code, run ===")
    for label, fn, values in [
        ("walk down root.right, example 1", _bug_follow_right_child, EXAMPLE_1),
        ("walk down root.right, example 2", _bug_follow_right_child, EXAMPLE_2),
        ("row[0], the left view, example 1", _bug_first_of_each_level, EXAMPLE_1),
        ("right-first but overwriting, example 1", _bug_right_first_but_overwriting, EXAMPLE_1),
        ("right-first but overwriting, example 2", _bug_right_first_but_overwriting, EXAMPLE_2),
    ]:
        got = fn(build(values))
        truth = view_bfs_last(build(values))
        flag = "   <- agrees, which is why example 2 exists" if got == truth else ""
        print(f"  {label:<42} {str(got):<12} (the answer is {truth}){flag}")

    print("\\n=== writes into the answer: painting over vs arriving first ===")
    print(f"  {'shape':<28} {'n':>6} {'overwrite':>10} {'right-first':>12}")
    for label, tree, n in [
        ("perfect tree, height 10", perfect(10), 1023),
        ("perfect tree, height 12", perfect(12), 4095),
        ("left spine, 500 nodes", chain(500), 500),
    ]:
        print(f"  {label:<28} {n:>6} {writes(view_dfs_overwrite, tree):>10} "
              f"{writes(view_dfs_right_first, tree):>12}")

    print("\\n=== memory: the widest level against the height ===")
    print(f"  {'shape':<28} {'BFS queue':>10} {'DFS frames':>11}")
    for label, tree in [
        ("perfect tree, 32767 nodes", perfect(15)),
        ("left spine, 500 nodes", chain(500)),
    ]:
        print(f"  {label:<28} {peak_queue(tree):>10} {height(tree):>11}")

    print(f"\\n{len(cases)} listed cases + 500 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
