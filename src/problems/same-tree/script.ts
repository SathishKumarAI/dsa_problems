// same-tree — every approach in one file, cross-checked
//
// Converted from docs/deep/same-tree_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`TreeNode\`, \`build\`, \`clone\` and \`random_tree\` are **scaffolding, not part of the answer.** \`VISITS\`
counts nodes touched, which is how the \`1\` against \`254\` claim in approach 2 was produced.

The \`_bug_*\` functions are the mistakes from each section, executed — the marker-free serialisation
returning \`True\` on the statement's own example, and the value-first ordering raising
\`AttributeError\` — so that no wrong answer quoted above is remembered rather than measured.`

export const script = `"""Are These Two Trees Identical? — every approach in one file, cross-checked.

Run:  python same_tree.py
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


def clone(node: Optional[TreeNode]) -> Optional[TreeNode]:
    """A structurally identical copy made of different objects — the interesting True case."""
    if node is None:
        return None
    return TreeNode(node.val, clone(node.left), clone(node.right))


def random_tree(n: int, rng: random.Random,
                values: tuple[int, ...] = (0, 1)) -> Optional[TreeNode]:
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


VISITS = {"n": 0}


# ----------------------------- approach 1: serialise both trees, compare strings
def serialise(node: Optional[TreeNode], out: list[str]) -> None:
    """Pre-order, recording every empty child — the \`#\` is the shape."""
    VISITS["n"] += 1
    if node is None:
        out.append("#")
        return
    out.append(str(node.val))
    serialise(node.left, out)
    serialise(node.right, out)


def is_same_serialised(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    a: list[str] = []
    b: list[str] = []
    serialise(p, a)
    serialise(q, b)
    return ",".join(a) == ",".join(b)


# ------------------------------------- approach 2: walk both trees in lockstep
def is_same_lockstep(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """Three cases, in this order: both empty, one empty, values differ."""
    VISITS["n"] += 1
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    if p.val != q.val:
        return False
    return is_same_lockstep(p.left, q.left) and is_same_lockstep(p.right, q.right)


# ----------------------------- approach 3: the same walk, with an explicit stack
def is_same_iterative(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """The unit on the stack is a PAIR of nodes, not a node."""
    stack: list[tuple[Optional[TreeNode], Optional[TreeNode]]] = [(p, q)]
    while stack:
        a, b = stack.pop()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        stack.append((a.left, b.left))
        stack.append((a.right, b.right))
    return True


def is_same_bfs(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """The same pairs, level by level. Order cannot change the verdict: every pair must match."""
    queue: deque[tuple[Optional[TreeNode], Optional[TreeNode]]] = deque([(p, q)])
    while queue:
        a, b = queue.popleft()
        if a is None and b is None:
            continue
        if a is None or b is None or a.val != b.val:
            return False
        queue.append((a.left, b.left))
        queue.append((a.right, b.right))
    return True


# --------------------------------------------------------- the buggy variants
def _serialise_values_only(node: Optional[TreeNode], out: list[str]) -> None:
    if node is None:
        return                       # the hole is not recorded — this is the bug
    out.append(str(node.val))
    _serialise_values_only(node.left, out)
    _serialise_values_only(node.right, out)


def _bug_no_markers(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """Approach 1 without the \`#\`: a pre-order reading that cannot describe a shape."""
    a: list[str] = []
    b: list[str] = []
    _serialise_values_only(p, a)
    _serialise_values_only(q, b)
    return ",".join(a) == ",".join(b)


def _bug_values_before_structure(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    """Approach 2 with the value test moved ahead of the None tests."""
    if p.val != q.val:
        return False
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    return (_bug_values_before_structure(p.left, q.left)
            and _bug_values_before_structure(p.right, q.right))


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode], Optional[TreeNode]], bool]]] = [
    ("serialised", is_same_serialised),
    ("lockstep", is_same_lockstep),
    ("iterative", is_same_iterative),
    ("bfs-pairs", is_same_bfs),
]


def work(fn, p, q) -> int:
    """Nodes touched by one run of fn."""
    VISITS["n"] = 0
    fn(p, q)
    return VISITS["n"]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], list[Optional[int]], bool]] = [
        ("statement example 1", [1, 2, 3], [1, 2, 3], True),
        ("statement example 2, mirrored", [1, 2], [1, None, 2], False),
        ("both empty", [], [], True),
        ("one empty", [1], [], False),
        ("same shape, one value differs", [1, 2, 3], [1, 2, 4], False),
        ("one is a prefix of the other", [1, 2, 3], [1, 2], False),
        ("all ones, different shape", [1, 1, 1], [1, 1, None, 1], False),
        ("identical larger trees", [5, 3, 8, 1, 4, None, 9], [5, 3, 8, 1, 4, None, 9], True),
        ("negative values", [-4, -2], [-4, -2], True),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, pv, qv, expected in cases:
        results = {name: fn(build(pv), build(qv)) for name, fn in APPROACHES}
        print(f"\\n{label}: {pv} vs {qv}   (expected {expected})")
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
        a = random_tree(rng.randint(0, 12), rng)
        b = clone(a) if rng.random() < 0.5 else random_tree(rng.randint(0, 12), rng)
        results = {name: fn(a, b) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on a random pair: {results}")

    print("\\n=== what this document claims about wrong code, run ===")
    p, q = build([1, 2]), build([1, None, 2])
    values_p: list[str] = []
    values_q: list[str] = []
    _serialise_values_only(p, values_p)
    _serialise_values_only(q, values_q)
    marked_p: list[str] = []
    marked_q: list[str] = []
    serialise(p, marked_p)
    serialise(q, marked_q)
    print(f"  [1,2] vs [1,null,2] — values only:  {','.join(values_p)!r} vs {','.join(values_q)!r}"
          f"  -> {_bug_no_markers(p, q)} (the answer is {is_same_lockstep(p, q)})")
    print(f"  [1,2] vs [1,null,2] — with markers: {','.join(marked_p)!r} vs {','.join(marked_q)!r}"
          f"  -> {is_same_serialised(p, q)}")
    for pv, qv in [([1, 1, 1], [1, 1, None, 1]), ([1, 1, None, 1], [1, None, 1, None, 1])]:
        print(f"  all ones, {pv} vs {qv}: no markers says {_bug_no_markers(build(pv), build(qv))}, "
              f"the answer is {is_same_lockstep(build(pv), build(qv))}")
    try:
        _bug_values_before_structure(build([1, 2]), build([1]))
        print("  value test first: returned without raising (unexpected)")
    except AttributeError as exc:
        print(f"  value test first, [1,2] vs [1]: AttributeError: {exc}")

    print("\\n=== nodes touched when the two trees differ at the root ===")
    big_a = build([1] + [2] * 62)
    big_b = build([9] + [2] * 62)
    print(f"  lockstep   {work(is_same_lockstep, big_a, big_b):>4}")
    print(f"  serialised {work(is_same_serialised, big_a, big_b):>4}")

    print(f"\\n{len(cases)} listed cases + 600 random pairs, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
