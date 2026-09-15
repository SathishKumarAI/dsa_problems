// remove-list-elements — every approach in one file, cross-checked
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`ListNode\`, \`build\`, \`to_list\` and \`to_nodes\` are **scaffolding, not part of the answer** — an
interviewer hands you a \`head\` and a node class that already exists; these only let this file build
inputs from ordinary Python lists and read results back. Both read-back helpers carry a step limit,
because a mis-written unlink can leave a cycle and a harness that hangs teaches nothing. \`to_nodes\`
earns its place on this problem specifically: four of the five approaches promise to hand back the
**caller's own nodes**, and the suite checks that by object identity — the \`rebuild\` rung is the only
one allowed to return nodes nobody supplied.

The suite covers all three statement examples, the worked example (matching head, a run of two
adjacent matches, matching tail), a list with no matches at all, a single node both ways, a matching
head only, a matching tail only, a run in the middle, the value range's ends, 150 randomised cases at
lengths up to 60 drawn from only three distinct values — so long runs of adjacent matches are
frequent, which is the shape that separates the rungs — and one 900-node list of nothing but matches
to exercise the recursion depth. Randomised lengths are capped at 60 because of the quadratic rung:
its worst case is stated analytically above and measured at reduced \`n\`, not at the constraint's
ceiling. \`sys.setrecursionlimit(3000)\` is raised for the recursive rung on the 900-node case; at the
problem's real ceiling of \`10^4\` no limit raise saves it, which is the point of that rung's section.`

export const script = `"""Delete Every Node Holding a Value — every approach in one file, cross-checked.

Run:  python remove_list_elements.py
"""

from __future__ import annotations

import random
import sys


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


def to_list(head: ListNode | None, limit: int = 200_000) -> list[int]:
    """Scaffolding: read a list back out. \`limit\` guards against a bug that
    left a cycle behind, so a broken answer raises instead of hanging."""
    out: list[int] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node.val)
        node = node.next
    return out


def to_nodes(head: ListNode | None, limit: int = 200_000) -> list[ListNode]:
    """Scaffolding: the node OBJECTS in order, so a test can see whether an
    approach kept the caller's nodes or handed back fresh copies of them."""
    out: list[ListNode] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node)
        node = node.next
    return out


# ----------------------------------- approach 1: restart the scan after every removal
def remove_list_elements_restart_scan(head: ListNode | None, val: int) -> ListNode | None:
    while head is not None and head.val == val:  # the head needs its own loop
        head = head.next
    changed = True
    while changed:
        changed = False
        node = head
        while node is not None and node.next is not None:
            if node.next.val == val:
                node.next = node.next.next
                changed = True
                break  # start the whole scan again
            node = node.next
    return head


# ------------------------------------------- approach 2: rebuild from the survivors
def remove_list_elements_rebuild(head: ListNode | None, val: int) -> ListNode | None:
    kept: list[int] = []
    node = head
    while node is not None:
        if node.val != val:
            kept.append(node.val)
        node = node.next
    new_head: ListNode | None = None
    for v in reversed(kept):  # build backwards so the order comes out forwards
        new_head = ListNode(v, new_head)
    return new_head


# ------------------------------------- approach 3: let each node decide its own fate
def remove_list_elements_recursive(head: ListNode | None, val: int) -> ListNode | None:
    if head is None:
        return None
    head.next = remove_list_elements_recursive(head.next, val)
    return head.next if head.val == val else head


# ------------------------- approach 4: strip the leading matches, then walk with prev
def remove_list_elements_strip_head(head: ListNode | None, val: int) -> ListNode | None:
    while head is not None and head.val == val:  # the same test, written twice
        head = head.next
    node = head
    while node is not None and node.next is not None:
        if node.next.val == val:
            node.next = node.next.next  # do NOT advance
        else:
            node = node.next
    return head


# -------------------------------- approach 5: a dummy makes the head an ordinary node
def remove_list_elements_dummy(head: ListNode | None, val: int) -> ListNode | None:
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None:
        if prev.next.val == val:
            prev.next = prev.next.next  # do NOT advance: the node that slid in may match
        else:
            prev = prev.next
    return dummy.next


APPROACHES = [
    ("restart_scan", remove_list_elements_restart_scan),
    ("rebuild", remove_list_elements_rebuild),
    ("recursive", remove_list_elements_recursive),
    ("strip_head", remove_list_elements_strip_head),
    ("dummy", remove_list_elements_dummy),
]

# Only \`rebuild\` hands back nodes the caller never supplied.
KEEPS_ORIGINAL_NODES = {"restart_scan", "recursive", "strip_head", "dummy"}


def main() -> None:
    sys.setrecursionlimit(3000)  # the recursive rung needs one frame per NODE

    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 2, 6, 3, 4, 5, 6], 6),
        ("statement example, everything matches", [7, 7, 7, 7], 7),
        ("statement example, empty list", [], 1),
        ("worked example", [7, 1, 7, 7, 2, 7], 7),
        ("nothing matches", [1, 2, 3], 9),
        ("single node, matches", [5], 5),
        ("single node, does not match", [5], 4),
        ("only the head matches", [4, 1, 2], 4),
        ("only the tail matches", [1, 2, 4], 4),
        ("a run of matches in the middle", [1, 8, 8, 8, 2], 8),
        ("the ends of the value range", [0, 50, 0, 50], 0),
    ]

    rng = random.Random(20260912)
    # 3 distinct values keeps long runs of matches frequent, which is the case
    # that separates the rungs. The quadratic rung caps how long these can be:
    # its worst case (survivors first, matches at the end) is analytic, not measured.
    for _ in range(150):
        n = rng.randint(0, 60)
        cases.append((f"stress n={n}", [rng.randint(0, 2) for _ in range(n)], rng.randint(0, 2)))
    # one long list for the linear rungs only, to exercise the recursion depth
    cases.append(("stress n=900, all matches", [3] * 900, 3))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    identity_ok = True

    for label, values, val in cases:
        loud = not label.startswith("stress") and len(values) <= 10
        if loud:
            print(f"\\n{label}: {values}, val={val}")
        results = []
        for name, fn in APPROACHES:
            head = build(values)  # every approach rewires its input, so rebuild per run
            before = {id(nd): nd.val for nd in to_nodes(head)}
            got_head = fn(head, val)
            results.append(to_list(got_head))
            survivors = to_nodes(got_head)
            if name in KEEPS_ORIGINAL_NODES and any(id(nd) not in before for nd in survivors):
                identity_ok = False
                print(f"  !! {name} returned a node the caller never handed in")
            if loud:
                print(f"  {name:<{width}} -> {to_list(got_head)}")
        want = [v for v in values if v != val]
        if any(r != results[0] for r in results) or results[0] != want:
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: {results}, expected {want}")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "identity: only \`rebuild\` handed back nodes the caller never supplied."
        if identity_ok
        else "IDENTITY FAILURE: an approach replaced the caller's nodes unexpectedly."
    )
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed and identity_ok
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
