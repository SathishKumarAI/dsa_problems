// merge-two-sorted — every approach in one file, cross-checked
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`ListNode\`, \`build\`, \`to_list\` and \`node_ids\` are **scaffolding, not part of the answer.** In an
interview the node class and the two \`head\` pointers already exist; these helpers are here only so the
file can build inputs from ordinary Python lists, read results back, and check that the splicing rungs
really did reuse the input nodes. None of the three solution functions calls any of them, and no
approach touches another's internals.

Two harness details that the spec's trap table demands and that this problem walks straight into.
First, **every approach rewires its inputs**, so the harness rebuilds a fresh pair of lists before each
run — cross-checking against a corrupted input proves nothing. Second, a merge bug can point a node
back into a chain it is already in, so \`to_list\` carries a step limit and raises rather than hanging.`

export const script = `"""Merge Two Sorted Lists — every approach in one file, cross-checked.

Run:  python merge_two_sorted.py
"""

from __future__ import annotations

import random


# ---------------------------------------------------------------- scaffolding
class ListNode:
    """A singly linked list node. Scaffolding: assume it already exists."""

    def __init__(self, val: int = 0, nxt: "ListNode | None" = None) -> None:
        self.val = val
        self.next = nxt


def build(values: list[int]) -> ListNode | None:
    """Scaffolding: make a list from a Python list. Empty list -> None."""
    head: ListNode | None = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def to_list(head: ListNode | None, limit: int = 100_000) -> list[int]:
    """Scaffolding: read a list back out. \`limit\` guards against a merge bug
    that accidentally points a node back into a chain it is already in."""
    out: list[int] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node.val)
        node = node.next
    return out


def node_ids(head: ListNode | None) -> set[int]:
    """Scaffolding: identity of every node in a chain, to check splicing."""
    out: set[int] = set()
    node = head
    while node is not None:
        out.add(id(node))
        node = node.next
    return out


# ------------------------------------- approach 1: O(k log k) time, O(k) space
def merge_two_sorted_collect_and_sort(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    vals: list[int] = []
    for head in (a, b):
        while head is not None:
            vals.append(head.val)
            head = head.next
    out: ListNode | None = None
    for v in sorted(vals, reverse=True):  # descending, because prepending reverses
        out = ListNode(v, out)
    return out


# ----------------------------------- approach 2: O(k) time, O(k) stack, splices
def merge_two_sorted_recursive(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    if a is None or b is None:
        return a or b  # the survivor is already sorted — attach it whole
    if a.val <= b.val:  # <= keeps equal values in a-before-b order (stable)
        a.next = merge_two_sorted_recursive(a.next, b)
        return a
    b.next = merge_two_sorted_recursive(a, b.next)
    return b


# ----------------------------------- approach 3: O(k) time, O(1) space, splices
def merge_two_sorted_dummy_head(
    a: ListNode | None, b: ListNode | None
) -> ListNode | None:
    dummy = tail = ListNode(0)  # throwaway node: makes the first attach need no special case
    while a is not None and b is not None:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next  # forgetting this line overwrites the result every iteration
    tail.next = a or b  # whatever survives is sorted and all larger — attach it whole
    return dummy.next   # the dummy itself is discarded


APPROACHES = [
    ("collect_and_sort", merge_two_sorted_collect_and_sort),
    ("recursive", merge_two_sorted_recursive),
    ("dummy_head", merge_two_sorted_dummy_head),
]
SPLICING = {"recursive", "dummy_head"}  # these must reuse the input nodes


def main() -> None:
    cases: list[tuple[str, list[int], list[int]]] = [
        ("statement example", [1, 3, 5], [2, 4]),
        ("both empty", [], []),
        ("first empty", [], [1, 2, 3]),
        ("second empty", [-100, 0, 100], []),
        ("single vs single", [2], [1]),
        ("duplicates across both", [1, 2, 2, 5], [2, 2, 3]),
        ("all of a before all of b", [-5, -4], [10, 11]),
        ("interleaved equal values", [1, 1, 1], [1, 1]),
    ]
    random.seed(23)
    # 200 + 200 nodes: a real stress test, and 400 frames stays inside
    # Python's default 1000-frame recursion limit.
    big_a = sorted(random.randint(-100, 100) for _ in range(200))
    big_b = sorted(random.randint(-100, 100) for _ in range(200))
    cases.append(("stress: 200 + 200 random sorted", big_a, big_b))

    all_agreed = True
    for label, va, vb in cases:
        sa = va if len(va) <= 6 else va[:5] + ["..."]
        sb = vb if len(vb) <= 6 else vb[:5] + ["..."]
        print(f"\\n{label}: a={sa} (n={len(va)}), b={sb} (m={len(vb)})")
        expected = sorted(va + vb)
        results: dict[str, list[int]] = {}
        for name, fn in APPROACHES:
            # every approach consumes or rewires its inputs, so rebuild per run
            a, b = build(va), build(vb)
            originals = node_ids(a) | node_ids(b)
            merged = fn(a, b)
            results[name] = to_list(merged)
            got = results[name]
            ok = got == expected
            spliced = node_ids(merged) <= originals
            if name in SPLICING and not spliced:
                ok = False
            all_agreed &= ok
            shown = got if len(got) <= 8 else got[:6] + ["..."]
            note = "" if name not in SPLICING else (" spliced" if spliced else " ALLOCATED!")
            print(f"  {name:<18} -> {shown}  {'ok' if ok else 'MISMATCH'}{note}")
        if len({tuple(r) for r in results.values()}) != 1:
            all_agreed = False
            print("  !! approaches disagree with each other")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND — see the MISMATCH lines above")


if __name__ == "__main__":
    main()`
