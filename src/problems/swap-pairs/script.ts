// swap-pairs — every approach in one file, cross-checked
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `\`ListNode\`, \`build\`, \`to_list\` and \`to_nodes\` are **scaffolding, not part of the answer** — an
interviewer hands you a \`head\` and a node class that already exists; these only let this file build
inputs from ordinary Python lists and read results back. \`to_list\` and \`to_nodes\` both carry a step
limit, because two of the mistakes documented above leave a cycle behind and a harness that hangs
teaches nothing.

\`to_nodes\` is the important one, and it is the reason this script differs from every other document's
in this directory. **Values cannot distinguish a real swap from a value swap** — measured, they are
identical on every input — so the suite runs two checks. The first cross-checks all five approaches
against each other and against ground truth **by value**, and all five agree. The second is an
**identity audit**: it records the node objects before the call and after it, and requires that
\`swap_values\` moved nothing while the other four moved something, on every case with at least two
nodes. An approach that failed to behave as predicted would be reported by name.

Cases: both statement examples plus the empty list, the odd worked example, a single node, exactly
one pair, a list whose values are all identical (where a value swap is *completely* undetectable by
printing), the value range's ends, the hundred-node ceiling, and 120 randomised cases at lengths from
0 to 100. \`sys.setrecursionlimit(3000)\` is raised only for the recursive rung's benefit on the
longest cases; at the problem's own ceiling of 100 nodes the default limit of 1000 would suffice.`

export const script = `"""Swap Every Adjacent Pair — every approach in one file, cross-checked by VALUE
and audited by node IDENTITY, because identity is what the problem is about.

Run:  python swap_pairs.py
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
    left a cycle behind — assigning the two links in the wrong order makes one."""
    out: list[int] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node.val)
        node = node.next
    return out


def to_nodes(head: ListNode | None, limit: int = 200_000) -> list[ListNode]:
    """Scaffolding: the node OBJECTS in order. This is the helper that can tell
    a real swap from a value swap; \`to_list\` cannot, and that is the whole point."""
    out: list[ListNode] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node)
        node = node.next
    return out


# --------------------------------- approach 1: exchange the payloads (NOT the answer)
def swap_pairs_swap_values(head: ListNode | None) -> ListNode | None:
    node = head
    while node is not None and node.next is not None:
        node.val, node.next.val = node.next.val, node.val
        node = node.next.next
    return head


# ------------------------------------ approach 2: collect the nodes, swap, relink
def swap_pairs_node_array(head: ListNode | None) -> ListNode | None:
    nodes: list[ListNode] = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    for i in range(0, len(nodes) - 1, 2):  # \`- 1\` leaves an odd tail alone
        nodes[i], nodes[i + 1] = nodes[i + 1], nodes[i]
    for i, nd in enumerate(nodes):
        nd.next = nodes[i + 1] if i + 1 < len(nodes) else None
    return nodes[0] if nodes else None


# -------------------------------------- approach 3: let the tail swap itself
def swap_pairs_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # 0 or 1 nodes: nothing to pair with
    second = head.next
    head.next = swap_pairs_recursive(second.next)  # BEFORE second.next is overwritten
    second.next = head
    return second


# ----------------------------- approach 4: a loop with prev, head special-cased
def swap_pairs_prev_pointer(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head
    new_head = head.next  # must be captured before the first swap destroys the link
    prev: ListNode | None = None
    node: ListNode | None = head
    while node is not None and node.next is not None:
        second = node.next
        node.next = second.next
        second.next = node
        if prev is not None:  # the first pair has nothing behind it
            prev.next = second
        prev = node
        node = node.next
    return new_head


# --------------------------------- approach 5: a dummy makes every pair ordinary
def swap_pairs_dummy(head: ListNode | None) -> ListNode | None:
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None and prev.next.next is not None:
        first = prev.next
        second = first.next
        first.next = second.next  # save the rest of the list before overwriting
        second.next = first
        prev.next = second
        prev = first  # \`first\` is now the BACK of the swapped pair
    return dummy.next


APPROACHES = [
    ("swap_values", swap_pairs_swap_values),
    ("node_array", swap_pairs_node_array),
    ("recursive", swap_pairs_recursive),
    ("prev_pointer", swap_pairs_prev_pointer),
    ("dummy", swap_pairs_dummy),
]

# Only the first rung leaves the nodes where they were. Everything else moves them.
MOVES_NODES = {"node_array", "recursive", "prev_pointer", "dummy"}


def expected_values(values: list[int]) -> list[int]:
    out = list(values)
    for i in range(0, len(out) - 1, 2):
        out[i], out[i + 1] = out[i + 1], out[i]
    return out


def main() -> None:
    sys.setrecursionlimit(3000)  # the recursive rung needs one frame per PAIR

    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3, 4]),
        ("statement example, odd tail", [1, 2, 3]),
        ("statement example, empty", []),
        ("worked example", [1, 2, 3, 4, 5]),
        ("single node", [9]),
        ("exactly one pair", [1, 2]),
        ("duplicate values, where a value swap is invisible", [5, 5, 5, 5]),
        ("the value range's ends", [0, 100, 100, 0, 42]),
        ("the longest list the constraints allow", list(range(100))),
    ]

    rng = random.Random(20260912)
    for _ in range(120):
        n = rng.randint(0, 100)  # the constraint's ceiling, empty list included
        cases.append((f"stress n={n}", [rng.randint(0, 100) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    identity_as_predicted = True

    for label, values in cases:
        loud = not label.startswith("stress") and len(values) <= 10
        if loud:
            print(f"\\n{label}: {values}")
        results = []
        for name, fn in APPROACHES:
            head = build(values)  # every approach rewires its input, so rebuild per run
            before = to_nodes(head)
            got_head = fn(head)
            results.append(to_list(got_head))
            after = to_nodes(got_head)
            moved = after != before
            should_move = name in MOVES_NODES and len(values) >= 2
            if moved != should_move:
                identity_as_predicted = False
                print(f"  !! {name}: nodes moved = {moved}, predicted {should_move}")
            if loud:
                tag = "nodes moved" if moved else "nodes did NOT move"
                print(f"  {name:<{width}} -> {to_list(got_head)}   ({tag})")
        want = expected_values(values)
        if any(r != results[0] for r in results) or results[0] != want:
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: {results}, expected {want}")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "identity audit: swap_values never moved a node; the other four always did."
        if identity_as_predicted
        else "IDENTITY AUDIT FAILED: an approach did not behave as predicted."
    )
    print(
        "ALL APPROACHES AGREED ON EVERY CASE BY VALUE, AND THE IDENTITY AUDIT MATCHED."
        if all_agreed and identity_as_predicted
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
