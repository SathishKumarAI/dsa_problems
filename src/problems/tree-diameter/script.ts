// tree-diameter — every approach in one file, cross-checked
//
// Converted from docs/deep/tree-diameter_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`TreeNode\`, \`build\`, \`to_values\`, \`chain\`, \`perfect\` and \`random_tree\` are **scaffolding, not part of
the answer.** \`CALLS\` counts entries into \`depth()\`, which is how the quadratic growth in approach 1
was measured rather than asserted.

The \`_bug_*\` functions are the "common mistake" from each section, executed. Every wrong number
quoted above — the \`3\` from measuring through the root, the \`4\` and \`2\` from returning a reach as the
answer, the \`4\` from counting nodes instead of edges — is printed by the run below, including the
case where the buggy version agrees with the right one, which is the reason those bugs survive.`

export const script = `"""The Longest Path Between Any Two Nodes — every approach in one file, cross-checked.

Run:  python tree_diameter.py
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


def to_values(root: Optional[TreeNode]) -> list[Optional[int]]:
    """Tree -> level-order list, trimmed. Only used to print a counterexample."""
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


# ------------------------------------------------------------ the depth helper
# Used by approach 1 and by the through-the-root bug. CALLS counts entries so the
# document can report work done rather than assert a bound.
CALLS = {"depth": 0}


def depth(node: Optional[TreeNode]) -> int:
    """Edges on the longest downward path from \`node\`; an empty child is -1."""
    CALLS["depth"] += 1
    if node is None:
        return -1
    return 1 + max(depth(node.left), depth(node.right))


# ----------------------------- approach 1: try every node as the bend, directly
def diameter_every_node(root: Optional[TreeNode]) -> int:
    """The reframing, transcribed: try every node as the bend."""
    best = 0

    def walk(node: Optional[TreeNode]) -> None:
        nonlocal best
        if node is None:
            return
        best = max(best, (depth(node.left) + 1) + (depth(node.right) + 1))
        walk(node.left)
        walk(node.right)

    walk(root)
    return best


# ------------------------- approach 2: fill a depth table, then find the bend
def diameter_cached(root: Optional[TreeNode]) -> int:
    """Fill a depth table bottom-up, then sweep it for the best bend."""
    table: dict[TreeNode, int] = {}

    def fill(node: Optional[TreeNode]) -> int:
        if node is None:
            return -1
        table[node] = 1 + max(fill(node.left), fill(node.right))
        return table[node]

    fill(root)
    best = 0
    for node in table:
        left = table[node.left] + 1 if node.left else 0
        right = table[node.right] + 1 if node.right else 0
        best = max(best, left + right)
    return best


# ------------------ approach 3: one pass — return the reach, fold the best
def diameter_one_pass(root: Optional[TreeNode]) -> int:
    """Return the reach to the parent; fold the bend into a running best on the way up."""
    best = 0

    def reach(node: Optional[TreeNode]) -> int:
        """Nodes on the longest downward path from \`node\` — 0 for an empty child."""
        nonlocal best
        if node is None:
            return 0
        left = reach(node.left)
        right = reach(node.right)
        best = max(best, left + right)        # the bend: both sides, in edges
        return 1 + max(left, right)           # to the parent: one side only

    reach(root)
    return best


# ---------------- approach 4: the same pass, with a stack instead of frames
def diameter_iterative(root: Optional[TreeNode]) -> int:
    """Approach 3 with an explicit stack — survives a tree taller than the frame limit."""
    best = 0
    reach: dict[TreeNode, int] = {}
    stack: list[tuple[TreeNode, bool]] = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = reach.pop(node.left, 0)    # popped: a reach is read once, by the parent
            right = reach.pop(node.right, 0)
            best = max(best, left + right)
            reach[node] = 1 + max(left, right)
        else:
            stack.append((node, True))        # revisit after both children
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return best


# --------------------------------------------------------- the buggy variants
def _bug_through_the_root(root: Optional[TreeNode]) -> int:
    """Only the path that bends at the root — right on both of the easy examples."""
    if root is None:
        return 0
    return (depth(root.left) + 1) + (depth(root.right) + 1)


def _bug_reach_as_answer(root: Optional[TreeNode]) -> int:
    """Returns what the recursion hands upward — the height, not the diameter."""
    def reach(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        return 1 + max(reach(node.left), reach(node.right))
    return reach(root)


def _bug_counts_nodes(root: Optional[TreeNode]) -> int:
    """Counts nodes on the path instead of edges."""
    best = 0

    def reach(node: Optional[TreeNode]) -> int:
        nonlocal best
        if node is None:
            return 0
        left = reach(node.left)
        right = reach(node.right)
        best = max(best, left + right + 1)
        return 1 + max(left, right)

    reach(root)
    return best


def work(fn: Callable[[Optional[TreeNode]], int], tree: Optional[TreeNode]) -> int:
    """depth() entries made by one run of fn."""
    CALLS["depth"] = 0
    fn(tree)
    return CALLS["depth"]


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], int]]] = [
    ("every-node", diameter_every_node),
    ("cached", diameter_cached),
    ("one-pass", diameter_one_pass),
    ("iterative", diameter_iterative),
]

EXAMPLE_1: list[Optional[int]] = [1, 2, 3, 4, 5]
EXAMPLE_2: list[Optional[int]] = [1, 2]
EXAMPLE_3: list[Optional[int]] = [1, 2, None, 3, None, 4]
OFF_ROOT: list[Optional[int]] = [1, 2, None, 3, 4, 5, 6, 7]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], int]] = [
        ("statement example 1", EXAMPLE_1, 3),
        ("statement example 2", EXAMPLE_2, 1),
        ("statement example 3, a left chain", EXAMPLE_3, 3),
        ("the diameter misses the root", OFF_ROOT, 4),
        ("single node", [1], 0),
        ("perfect tree of seven", [1, 2, 3, 4, 5, 6, 7], 4),
        ("two deep arms from the root", [1, 2, 3, 4, None, None, 5, 6, None, None, 7], 6),
        ("duplicate values throughout", [5, 5, 5, 5, None, None, 5], 4),
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
        elif next(iter(results.values())) != expected:
            all_agreed = False
            print(f"  WRONG: every approach says {next(iter(results.values()))}, expected {expected}")

    rng = random.Random(20260913)
    for _ in range(500):
        tree = random_tree(rng.randint(1, 40), rng)
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {to_values(tree)}: {results}")

    print("\\n=== what this document claims about wrong code, run ===")
    for label, fn, values in [
        ("through the root, example 1", _bug_through_the_root, EXAMPLE_1),
        ("through the root, example 3", _bug_through_the_root, EXAMPLE_3),
        ("through the root, diameter off the root", _bug_through_the_root, OFF_ROOT),
        ("reach as the answer, example 1", _bug_reach_as_answer, EXAMPLE_1),
        ("reach as the answer, example 2", _bug_reach_as_answer, EXAMPLE_2),
        ("reach as the answer, example 3", _bug_reach_as_answer, EXAMPLE_3),
        ("nodes not edges, example 1", _bug_counts_nodes, EXAMPLE_1),
        ("nodes not edges, single node", _bug_counts_nodes, [1]),
    ]:
        tree = build(values)
        truth = diameter_one_pass(build(values))
        got = fn(tree)
        flag = "  <- agrees, which is why it survives" if got == truth else ""
        print(f"  {label:<42} {got}  (the answer is {truth}){flag}")

    print("\\n=== depth() entries, which is the work approach 1 does ===")
    print(f"  {'shape':<26} {'n':>6} {'every-node':>12} {'one pass':>10}")
    for label, tree, n in [
        ("left spine", chain(50), 50),
        ("left spine", chain(100), 100),
        ("left spine", chain(200), 200),
        ("left spine", chain(400), 400),
        ("perfect tree, height 9", perfect(9), 511),
        ("perfect tree, height 11", perfect(11), 2047),
    ]:
        print(f"  {label:<26} {n:>6} {work(diameter_every_node, tree):>12} "
              f"{work(diameter_one_pass, tree):>10}")

    print("\\n=== recursion, at the constraint's own upper limit of 10^4 nodes ===")
    print(f"  sys.getrecursionlimit() = {sys.getrecursionlimit()}")
    spine = chain(10_000)
    for name, fn in APPROACHES:
        try:
            print(f"  {name:<12} -> {fn(spine)}")
        except RecursionError as exc:
            print(f"  {name:<12} -> RecursionError: {exc}")

    print(f"\\n{len(cases)} listed cases + 500 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
