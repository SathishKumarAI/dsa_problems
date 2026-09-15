// reverse-list — every approach in one file, cross-checked
//
// Converted from docs/deep/reverse-list_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`ListNode\`, \`build\` and \`to_list\` are **scaffolding, not part of the answer.** An interviewer hands you
a \`head\` pointer and a node class that already exists; these helpers exist only so this file can
construct inputs from ordinary Python lists and read results back. None of the three solution functions
calls them, and no approach touches another's internals.

Two harness details the spec's trap table demands, both of which this problem walks into. First,
**every approach consumes or rewires its input**, so the harness rebuilds the list before each run —
cross-checking against a corrupted input proves nothing. Second, the classic missing \`head.next = None\`
leaves a real cycle behind, so \`to_list\` carries a step limit and raises instead of hanging the suite.`

export const script = `"""Reverse a Linked List — every approach in one file, cross-checked.

Run:  python reverse_list.py
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
    """Scaffolding: read a list back out. \`limit\` guards against a bug that
    leaves a cycle behind (the classic missing \`head.next = None\`)."""
    out: list[int] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node.val)
        node = node.next
    return out


# ------------------------------------------------------- approach 1: O(n) space
def reverse_list_copy_to_array(head: ListNode | None) -> ListNode | None:
    vals: list[int] = []
    while head is not None:
        vals.append(head.val)
        head = head.next
    new_head: ListNode | None = None
    for v in vals:
        new_head = ListNode(v, new_head)  # prepending in original order reverses it
    return new_head


# ------------------------------------------------ approach 2: O(n) stack, in place
def reverse_list_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # empty list, or the last node — already reversed
    new_head = reverse_list_recursive(head.next)
    head.next.next = head  # head.next is the TAIL of the reversed remainder
    head.next = None       # head becomes the new tail; without this the last two nodes loop
    return new_head        # unchanged all the way up: the deepest node


# ---------------------------------------------- approach 3: O(1) space, in place
def reverse_list_three_pointer(head: ListNode | None) -> ListNode | None:
    prev: ListNode | None = None  # also becomes the original head's new next — the terminator
    curr = head
    while curr is not None:
        nxt = curr.next   # must be saved BEFORE the next line destroys it
        curr.next = prev
        prev, curr = curr, nxt
    return prev  # curr fell off the end; prev is the last node visited = the new head


APPROACHES = [
    ("copy_to_array", reverse_list_copy_to_array),
    ("recursive", reverse_list_recursive),
    ("three_pointer", reverse_list_three_pointer),
]


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3]),
        ("empty list", []),
        ("single node", [7]),
        ("two nodes", [1, 2]),
        ("duplicate values", [2, 2, 3, 2]),
        ("negative and zero", [-5000, 0, 5000, 0]),
        ("worked example", [1, 2, 3, 4]),
    ]
    random.seed(11)
    # 500 nodes: big enough to be a real stress test, small enough that the
    # recursive approach stays inside Python's default 1000-frame limit.
    cases.append(("stress: 500 random nodes", [random.randint(-5000, 5000) for _ in range(500)]))

    all_agreed = True
    for label, values in cases:
        shown = values if len(values) <= 8 else values[:6] + ["..."]
        print(f"\\n{label}: input {shown} (n={len(values)})")
        results: dict[str, list[int]] = {}
        for name, fn in APPROACHES:
            # every approach consumes or rewires its input, so rebuild per run
            results[name] = to_list(fn(build(values)))
        expected = list(reversed(values))
        for name, _ in APPROACHES:
            got = results[name]
            out = got if len(got) <= 8 else got[:6] + ["..."]
            ok = got == expected
            all_agreed &= ok
            print(f"  {name:<16} -> {out}  {'ok' if ok else 'MISMATCH'}")
        if len({tuple(r) for r in results.values()}) != 1:
            all_agreed = False
            print("  !! approaches disagree with each other")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND — see the MISMATCH lines above")


if __name__ == "__main__":
    main()`
