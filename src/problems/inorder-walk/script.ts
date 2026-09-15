// inorder-walk — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `\`TreeNode\`, \`build\`, \`chain\`, \`random_tree\` and \`shape\` are **scaffolding, not part of the answer.**
\`ALLOCS\` counts lists built by the first rung, which is how its cost was measured rather than
asserted, and \`peak_stack\` is an instrumented copy of approach 3 — not a fifth approach.

Every approach is handed its own \`deepcopy\` in the random pass, because Morris **mutates the tree**
while it runs; without that, each rung would be walking the previous rung's leftovers and a real
disagreement would be indistinguishable from a harness bug.`

export const script = `"""Read a Tree Left, Node, Right — every approach in one file, cross-checked.

Run:  python inorder_walk.py
"""

from __future__ import annotations

import copy
import random
import sys
import time
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


def shape(node: Optional[TreeNode], depth: int = 0) -> str:
    """A printable tree, so Morris's promise to restore it can be SEEN."""
    if node is None or depth > 6:
        return "."
    return f"({node.val} {shape(node.left, depth + 1)} {shape(node.right, depth + 1)})"


ALLOCS = {"lists": 0}


# -------------------------- approach 1: the rule, verbatim, in return values
def inorder_rebuild(root: Optional[TreeNode]) -> list[int]:
    """The rule, verbatim. Every call returns a NEW list."""
    ALLOCS["lists"] += 1
    if root is None:
        return []
    return inorder_rebuild(root.left) + [root.val] + inorder_rebuild(root.right)


# ------------------------------------ approach 2: one list, the call stack
def inorder_handed_down(root: Optional[TreeNode]) -> list[int]:
    """One list, appended to once per node. The call stack holds the rest."""
    out: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        out.append(node.val)      # the ONLY line that must sit between the two walks
        walk(node.right)

    walk(root)
    return out


# ----------------------------------------- approach 3: the stack, written out
def inorder_stack(root: Optional[TreeNode]) -> list[int]:
    """Recursion with the lid off: the stack IS what the frames were holding."""
    out: list[int] = []
    stack: list[TreeNode] = []
    node = root
    while stack or node:              # something owed, OR somewhere to go
        while node:                   # inorder owes the leftmost node first
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right             # one step right, then descend left again
    return out


# ------------------------------- approach 4: borrow the tree's null pointers
def inorder_morris(root: Optional[TreeNode]) -> list[int]:
    """O(1) space, by borrowing the tree's own empty right pointers."""
    out: list[int] = []
    node = root
    while node:
        if node.left is None:
            out.append(node.val)
            node = node.right
        else:
            pred = node.left                       # the inorder predecessor:
            while pred.right and pred.right is not node:
                pred = pred.right                  # rightmost node of the left subtree
            if pred.right is None:
                pred.right = node                  # thread, then go left
                node = node.left
            else:
                pred.right = None                  # the thread is back: untie it
                out.append(node.val)
                node = node.right
    return out


# ------------------------------------------- instrumented, not an approach
def peak_stack(root: Optional[TreeNode]) -> int:
    """The most nodes approach 3 ever holds — the height, not the width."""
    peak, stack, node = 0, [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
            peak = max(peak, len(stack))
        node = stack.pop()
        node = node.right
    return peak


def count_lists(tree: Optional[TreeNode]) -> int:
    ALLOCS["lists"] = 0
    inorder_rebuild(tree)
    return ALLOCS["lists"]


def timed(fn: Callable[[Optional[TreeNode]], list[int]], tree: Optional[TreeNode]) -> float:
    best = float("inf")
    for _ in range(3):
        start = time.perf_counter()
        fn(tree)
        best = min(best, time.perf_counter() - start)
    return best


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], list[int]]]] = [
    ("rebuild", inorder_rebuild),
    ("handed-down", inorder_handed_down),
    ("stack", inorder_stack),
    ("morris", inorder_morris),
]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], list[int]]] = [
        ("statement example 1", [1, None, 2, 3], [1, 3, 2]),
        ("statement example 2, empty", [], []),
        ("statement example 3, happens to be a BST", [3, 1, 5, None, 2], [1, 2, 3, 5]),
        ("single node", [1], [1]),
        ("left spine of three", [1, 2, None, 3], [3, 2, 1]),
        ("right spine of three", [1, None, 2, None, 3], [1, 2, 3]),
        ("perfect tree of seven", [4, 2, 6, 1, 3, 5, 7], [1, 2, 3, 4, 5, 6, 7]),
        ("duplicate values", [2, 2, 2], [2, 2, 2]),
        ("negative values", [-1, -2, -3], [-2, -1, -3]),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    sys.setrecursionlimit(20_000)

    for label, values, expected in cases:
        # a fresh tree per approach: Morris rewires as it walks
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        print(f"\\n{label}: {values} -> expected {expected}")
        for name, got in results.items():
            print(f"  {name:<{width}} -> {got}")
        if len({tuple(v) for v in results.values()}) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT: {results}")
        elif list(next(iter(results.values()))) != expected:
            all_agreed = False
            print("  WRONG: unanimous, but not the expected order")

    rng = random.Random(20260913)
    for _ in range(400):
        tree = random_tree(rng.randint(0, 40), rng)
        results = {name: fn(copy.deepcopy(tree)) for name, fn in APPROACHES}
        if len({tuple(v) for v in results.values()}) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on a random tree: {results}")

    print("\\n=== the stack walk, step by step, on [1, null, 2, 3] ===")
    out: list[int] = []
    stack: list[TreeNode] = []
    node = build([1, None, 2, 3])
    step = 0
    while stack or node:
        step += 1
        if node:
            print(f"  {step:>2}. push {node.val}, go left    "
                  f"stack={[n.val for n in stack] + [node.val]}")
            stack.append(node)
            node = node.left
        else:
            popped = stack.pop()
            out.append(popped.val)
            print(f"  {step:>2}. pop {popped.val}, record it  "
                  f"stack={[n.val for n in stack]}  out={out}")
            node = popped.right
    print(f"  result {out}")

    print("\\n=== what 'rebuild at every node' allocates ===")
    print(f"  {'shape':<26} {'n':>6} {'lists built':>12}")
    for label, tree, n in [
        ("balanced-ish, 15 nodes", build(list(range(1, 16))), 15),
        ("left spine, 50", chain(50), 50),
        ("left spine, 100", chain(100), 100),
        ("left spine, 200", chain(200), 200),
    ]:
        print(f"  {label:<26} {n:>6} {count_lists(tree):>12,}")
    print("  one list per node visited — and every \`+\` COPIES both sides")

    print("\\n=== so the count understates it: time the copying ===")
    print(f"  {'n':>6} {'rebuild':>12} {'stack':>12}")
    for n in (200, 400, 800):
        tree = chain(n)
        print(f"  {n:>6} {timed(inorder_rebuild, tree) * 1e6:>9.0f} us "
              f"{timed(inorder_stack, tree) * 1e6:>9.0f} us")

    print("\\n=== the stack holds a PATH, not a level ===")
    for label, tree in [
        ("left spine, 500 nodes", chain(500)),
        ("balanced, 1023 nodes", build(list(range(1, 1024)))),
    ]:
        print(f"  {label:<24} peak stack {peak_stack(tree)}")

    print("\\n=== Morris rewires the tree, then puts it back ===")
    tree = build([1, None, 2, 3])
    print(f"  before: {shape(tree)}")
    result = inorder_morris(tree)
    print(f"  after:  {shape(tree)}   (restored)")
    print(f"  result: {result}")

    print("\\n=== recursion at the constraint's limit: a 10^4 spine ===")
    sys.setrecursionlimit(1000)
    print(f"  sys.getrecursionlimit() = {sys.getrecursionlimit()}")
    spine = chain(10_000)
    for name, fn in APPROACHES:
        try:
            print(f"  {name:<12} -> {len(fn(spine))} values")
        except RecursionError as exc:
            print(f"  {name:<12} -> RecursionError: {exc}")
    sys.setrecursionlimit(20_000)

    print(f"\\n{len(cases)} listed cases + 400 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
