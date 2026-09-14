// cycle-detect — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `\`ListNode\`, \`build\`, \`build_with_cycle\` and \`to_list\` below are **scaffolding, not part of the
answer.** An interviewer hands you a \`head\` and the node class already exists; these helpers exist
only so this file can construct cyclic and acyclic inputs and print them.

Note the guard in \`to_list\`: a cyclic list has no end, so a naive read-back loop runs forever. The
helper takes a step limit and reports the loop instead of hanging — this is the single most common way
to lose an afternoon on this problem, and it is a scaffolding bug, not an algorithm bug.`

export const script = `"""Detect a Cycle — every approach in one file, cross-checked.

Run:  python cycle_detect.py
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
    """Scaffolding: make an acyclic list. Empty list -> None."""
    head: ListNode | None = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def build_with_cycle(values: list[int], pos: int) -> ListNode | None:
    """Scaffolding: make a list whose LAST node points back at index \`pos\`.
    \`pos = -1\` means no cycle. \`pos = 0\` on a one-node list is a self-loop."""
    head = build(values)
    if head is None or pos < 0:
        return head
    entry = head
    for _ in range(pos):
        assert entry.next is not None, "pos is past the end of the list"
        entry = entry.next
    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = entry
    return head


def to_list(head: ListNode | None, limit: int = 50) -> list[int | str]:
    """Scaffolding: read a list back out, GUARDED. A cyclic list has no end,
    so an unguarded read-back loop never returns — stop at \`limit\` and say so."""
    out: list[int | str] = []
    node = head
    steps = 0
    while node is not None:
        if steps >= limit:
            # either a cycle or just a long list — either way, stop walking
            out.append(f"...(stopped after {limit} steps)")
            break
        out.append(node.val)
        node = node.next
        steps += 1
    return out


# ------------------------------------------ approach 1: O(n^2) time, O(1) space
def cycle_detect_nested_walk(head: ListNode | None) -> bool:
    node = head
    index = 0
    while node is not None:
        probe = head
        for _ in range(index):  # re-scan only the nodes strictly before this one
            if probe is node:   # \`is\`, not \`==\`: identity, not value
                return True
            probe = probe.next
        node = node.next
        index += 1
    return False


# -------------------------------------------- approach 2: O(n) time, O(n) space
def cycle_detect_visited_set(head: ListNode | None) -> bool:
    seen: set[int] = set()
    while head is not None:
        if id(head) in seen:  # id() is the object's address: identity, not value
            return True
        seen.add(id(head))
        head = head.next
    return False


# -------------------------------------------- approach 3: O(n) time, O(1) space
def cycle_detect_floyd(head: ListNode | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:  # also makes fast.next.next safe
        slow = slow.next
        fast = fast.next.next
        if slow is fast:  # checked AFTER moving — they start equal
            return True
    return False


# ------------------ approach 4: O(n) time, O(1) space, DESTROYS the list's values
MARK = 100_001  # outside the legal value range -10**5 .. 10**5, so no real node holds it


def cycle_detect_value_marking(head: ListNode | None) -> bool:
    node = head
    while node is not None:
        if node.val == MARK:  # only a node WE stamped can hold this
            return True
        node.val = MARK  # destructive: the original value is gone for good
        node = node.next
    return False


APPROACHES = [
    ("nested_walk", cycle_detect_nested_walk),
    ("visited_set", cycle_detect_visited_set),
    ("floyd", cycle_detect_floyd),
    ("value_marking", cycle_detect_value_marking),
]


def main() -> None:
    # (label, values, pos, expected)   pos = -1 means no cycle
    cases: list[tuple[str, list[int], int, bool]] = [
        ("statement example: 1->2->3->(back to 2)", [1, 2, 3], 1, True),
        ("statement example: 1->2->None", [1, 2], -1, False),
        ("empty list", [], -1, False),
        ("single node, no cycle", [7], -1, False),
        ("single node, self-loop", [7], 0, True),
        ("two nodes, loop on the pair", [1, 2], 0, True),
        ("duplicate values, NO cycle", [1, 2, 1, 2, 1], -1, False),
        ("duplicate values, cycle", [1, 2, 1, 2, 1], 2, True),
        ("worked example: 1->2->3->4->(back to 2)", [1, 2, 3, 4], 1, True),
        ("cycle is the whole list", [5, 6, 7], 0, True),
        ("cycle is the last node only", [5, 6, 7], 2, True),
    ]
    random.seed(37)
    # 2000 nodes: quadratic approach 1 stays under a second, and the linear ones
    # have to walk far enough that an off-by-one would show.
    big = [random.randint(-100_000, 100_000) for _ in range(2000)]
    cases.append(("stress: 2000 nodes, no cycle", big, -1, False))
    cases.append(("stress: 2000 nodes, cycle at 500", big, 500, True))

    all_agreed = True
    for label, values, pos, expected in cases:
        head = build_with_cycle(values, pos)
        preview = to_list(head, limit=8)
        print(f"\\n{label}\\n  shape: {preview}  (n={len(values)}, pos={pos}, expected={expected})")
        results: dict[str, bool] = {}
        for name, fn in APPROACHES:
            # value_marking destroys the data, so every run gets a fresh list
            got = fn(build_with_cycle(values, pos))
            results[name] = got
            ok = got == expected
            all_agreed &= ok
            print(f"  {name:<15} -> {str(got):<5}  {'ok' if ok else 'MISMATCH'}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree with each other")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND — see the MISMATCH lines above")


if __name__ == "__main__":
    main()`
