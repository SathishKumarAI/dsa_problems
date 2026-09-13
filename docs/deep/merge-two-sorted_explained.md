# Merge Two Sorted Lists — Explained

## Understanding the Problem

You are given the first nodes of two chains. Each chain is already in ascending order on its own.
Produce a single chain containing every node from both, also in ascending order — and build it by
**re-pointing the nodes you were given**, not by making new ones. Return the first node of the result.

**The core question: given two sequences that are each already sorted, how little work do you have to
do to interleave them?** The naive approach is slow because it throws the sortedness away: dump every
value into an array, sort it, rebuild. That is `O((n+m) log(n+m))` to recover an ordering you were
already handed for free, and it allocates a new node for every value when the problem explicitly asked
you to splice the existing ones.

Two pieces of vocabulary, expanded once:

- **Splice** means change `next` pointers so existing node objects end up in a new order. The result
  contains the same node objects you were given, not copies of their values.
- **Dummy head** (also called a sentinel node) is a throwaway node you put in front of the answer so
  that "attach the next node to the end of the result" is one line of code even when the result is
  still empty. You return `dummy.next` and let the dummy be garbage.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `both lists are sorted ascending` | **This is the constraint that unlocks everything.** Because each list is sorted, the smallest remaining value overall is always one of the two front nodes — you never have to look past them. That single fact turns an `O(k log k)` sort into an `O(k)` walk. Remove this constraint and approach 1 is the only correct one left. |
| `either list may be empty` | Forces a decision about the base case. The recursive version handles it with `if not a or not b: return a or b`; the iterative version handles it by falling out of the `while` immediately and running `tail.next = a or b`, which correctly attaches either the survivor or `None`. Neither needs a dedicated `if` at the top. |
| `0 <= each list length <= 50` | Tiny. At most 100 stack frames, so the recursive version is *actually safe here* — which is worth saying honestly. It is the habit that is dangerous, not this instance: the same shape on merge-k-lists or on a 10^4-node input blows the stack. |
| `-100 <= node value <= 100` | Values repeat constantly in this range, which makes the `<=` vs `<` choice in the comparison visible: `<=` keeps equal elements in `a`-before-`b` order (a *stable* merge). Both produce a correctly sorted list; only `<=` preserves the relative order of ties. |
| "splice existing nodes (no new value nodes)" (statement) | This is the requirement that disqualifies approach 1 outright, independent of its complexity. |

---

## Approach 1: Collect everything and sort

### The idea

*What is the most direct thing that could possibly work?* Walk both lists pushing every value into one
array, sort the array, and build a fresh chain from it. *Why is that not the answer?* Because it
solves a harder problem than the one you were given — it sorts arbitrary data, when your data was
already sorted — and it pays `log(n+m)` per element plus `n+m` new node allocations for the privilege.

### How to think about it

The shape of the reasoning is: *forget that the inputs have structure, and use a general tool.* That
is exactly what makes it the honest baseline and exactly what makes it wrong. A sort is a machine for
creating order out of nothing; you were handed two-thirds of the order already and are asking the
machine to rediscover it. The useful thing to notice while writing it is where the wasted work is: a
comparison sort on `n+m` elements does about `(n+m)log(n+m)` comparisons, while the structure of the
input means only `n+m` comparisons are actually necessary — one per element, each between the two
current fronts. The gap between those two numbers is the whole rest of this document.

To rebuild, use the same trick as any list construction: repeatedly prepend. Since prepending
reverses, feed the values in **descending** order so the finished chain comes out ascending.

### Worked example

Input: `a = 1 → 3 → 5`, `b = 2 → 4`. (This same pair is traced in every approach below.)

**Drain both lists:**

| Step | reading from | value appended | `vals` |
|---|---|---|---|
| 1–3 | `a` | 1, then 3, then 5 | `[1, 3, 5]` |
| 4–5 | `b` | 2, then 4 | `[1, 3, 5, 2, 4]` |

**Sort descending:** `[5, 4, 3, 2, 1]`.

**Prepend each, in that order:**

| Step | value | new node | chain afterwards |
|---|---|---|---|
| start | — | — | `∅` |
| 1 | 5 | `ListNode(5, ∅)` | `5 → ∅` |
| 2 | 4 | `ListNode(4, →5)` | `4 → 5 → ∅` |
| 3 | 3 | `ListNode(3, →4)` | `3 → 4 → 5 → ∅` |
| 4 | 2 | `ListNode(2, →3)` | `2 → 3 → 4 → 5 → ∅` |
| 5 | 1 | `ListNode(1, →2)` | `1 → 2 → 3 → 4 → 5 → ∅` |

Correct output, five brand-new nodes, and the five original nodes still sitting in their two original
chains untouched.

### Code

```python
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
```

### Common mistake

Sorting ascending and then prepending: `for v in sorted(vals): out = ListNode(v, out)`. You get a
perfectly valid linked list in **descending** order, and because the list is built correctly and the
sort is correct, nothing anywhere raises an error — the only symptom is a backwards answer. The rule
worth internalising: *prepending builds backwards, so feed it backwards.* If you find that confusing
to reason about, build with a tail pointer instead of prepending and feed values ascending; just do
not mix the two mental models mid-function.

### Complexity and when to use this

**Time `O((n+m) log(n+m))`, space `O(n+m)`.** The time is dominated by the sort — the two drains and
the rebuild are linear, and the `log` factor is the sort's comparisons. Space is the `vals` array plus
`n+m` newly allocated nodes.

Use it when the inputs are **not** actually sorted, or when you cannot trust that they are and
validating is as expensive as sorting. It also generalises for free to merging *k* lists, or to
merging on a key that is not the natural ordering of the nodes. For this problem it is the baseline
you name in one sentence and discard: "we could concatenate and sort, but that's `n log n` on data
that's already ordered, and it allocates."

---

## Approach 2: Recursion

### The idea

*Sorting rediscovered an order we were already given — how do we use it instead?* Compare only the two
front nodes: the smaller one is definitively the first node of the answer, because everything behind
it in its own list is larger and everything in the other list is at least as large as that list's
front. *What does this fix?* It fixes the wasted `log` factor and the allocation both at once —
every node keeps its identity and is simply re-pointed. What it still costs is one stack frame per
node.

### How to think about it

The shape is: **the winner of one comparison is the head; the merge of what remains is its tail.**
Once you believe that sentence, the function is three lines. If `a.val <= b.val`, then `a` is the
answer's head, and the rest of the answer is the merge of `a.next` with the whole of `b` — so set
`a.next` to that merge and return `a`. Otherwise the mirror image with `b`.

The base case is where the sortedness pays off a second time: if either list is empty, the *entire*
other list is already the answer, in one assignment, because it is already sorted. You do not walk
it, you do not copy it, you just return it. `return a or b` says "return whichever one is non-empty,
or `None` if both are" — Python's `or` gives back the first truthy operand, and since a real node is
always truthy that reads correctly.

### Worked example

Input: `a = 1 → 3 → 5`, `b = 2 → 4`.

**Winding down** — each row is one call; the comparison decides who owns the frame:

| Call | `a` front | `b` front | comparison | owner of this position | recurses on |
|---|---|---|---|---|---|
| 1 | 1 | 2 | `1 <= 2` | node 1 (from `a`) | `merge(3→5, 2→4)` |
| 2 | 3 | 2 | `3 > 2` | node 2 (from `b`) | `merge(3→5, 4)` |
| 3 | 3 | 4 | `3 <= 4` | node 3 (from `a`) | `merge(5, 4)` |
| 4 | 5 | 4 | `5 > 4` | node 4 (from `b`) | `merge(5, ∅)` |
| 5 | 5 | — | `b` is empty | **base case** | returns node 5 |

**Unwinding** — each frame now assigns its owner's `next` and returns its owner:

| Returning into | assignment made | returns | chain built so far |
|---|---|---|---|
| call 4 | `node4.next = node5` | node 4 | `4 → 5` |
| call 3 | `node3.next = node4` | node 3 | `3 → 4 → 5` |
| call 2 | `node2.next = node3` | node 2 | `2 → 3 → 4 → 5` |
| call 1 | `node1.next = node2` | node 1 | `1 → 2 → 3 → 4 → 5` |

Final return: node 1. Five frames live at the deepest point; zero nodes allocated — every node in
the result is one of the five originals.

### Code

```python
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
```

### Common mistake

Returning the recursive call instead of the node that won the comparison:

```python
if a.val <= b.val:
    return merge_two_sorted_recursive(a.next, b)  # WRONG — node `a` vanished
```

The `a.next = ...` assignment is what splices `a` into the chain, and the `return a` is what tells the
caller *which node now sits at this position*. Drop either and you return the merge of everything
*after* the winner, so the smallest element of each frame is silently discarded. On the example you
would get `5` back instead of `1 → 2 → 3 → 4 → 5`. The mental check: this function's contract is
"return the head of the merged result", and the head of the merged result is the node that just won
the comparison — never the thing the recursion handed you.

### Complexity and when to use this

**Time `O(n + m)`, space `O(n + m)` on the call stack.** Each call consumes exactly one node from one
of the two lists and does constant work, so there is one call per node. The space is the stack: every
frame stays live until the deepest one returns, so the peak depth equals the number of nodes merged.

Use it when the lists are short — and at `length <= 50` per list, they provably are here, so this is
a legitimate submission rather than a demo. Use it also as the explanatory version: it makes the
"winner owns the position" idea visible in a way the loop does not. Do not reach for this shape when
the same logic scales up (merging a 10^5-node list, or merge-sorting a big list), because the stack
depth grows with the data and there is no runtime that will tell you politely.

---

## Approach 3: Dummy head and a tail pointer

### The idea

*The recursion's only job per node was "attach the winner at the current end" — can a pointer track
that end instead of a stack frame?* Yes: keep a `tail` pointer at the last node of the answer so far,
and attach each winner there. *What does it fix?* It removes the `O(n+m)` stack entirely — same
comparisons, same splices, same linear time, but with two local pointers instead of a hundred frames.

### How to think about it

The shape is a zipper. Two sorted chains lie side by side; you repeatedly pull whichever front tooth
is smaller into the finished zip and advance that side. Because both sides are sorted, the smaller of
the two fronts is the smallest thing remaining anywhere — so a purely local comparison makes a
globally correct decision, every time. That is the property worth naming out loud: **the merge never
needs to look past the two front nodes.**

The dummy head exists to kill one specific annoyance. Without it, the first attachment is special:
there is no tail yet, so you would need `if result is None: result = winner else: tail.next = winner`
on every iteration, a branch that is true exactly once. Allocating one throwaway node and pointing
`tail` at it makes `tail.next = winner` correct from the very first iteration, and `dummy.next` is
the real head at the end. It costs one node and buys the removal of a special case from the hot path.

The loop ends when either list is exhausted, and then `tail.next = a or b` finishes the job in one
assignment — not a loop. Whatever remains is a sorted chain whose every value is `>=` everything
already placed, so it can be attached wholesale. If both are exhausted, `a or b` is `None`, which
correctly terminates the result.

### Worked example

Input: `a = 1 → 3 → 5`, `b = 2 → 4`. State shown *after* each iteration. `D` is the dummy.

| Iter | `a` front | `b` front | comparison | attached | `tail` now at | result chain (after D) | `a` remaining | `b` remaining |
|---|---|---|---|---|---|---|---|---|
| start | 1 | 2 | — | — | `D` | *(empty)* | `1→3→5` | `2→4` |
| 1 | 1 | 2 | `1 <= 2` | node 1 | node 1 | `1` | `3→5` | `2→4` |
| 2 | 3 | 2 | `3 > 2` | node 2 | node 2 | `1→2` | `3→5` | `4` |
| 3 | 3 | 4 | `3 <= 4` | node 3 | node 3 | `1→2→3` | `5` | `4` |
| 4 | 5 | 4 | `5 > 4` | node 4 | node 4 | `1→2→3→4` | `5` | `∅` |

`b` is now `None`, so the loop exits. `tail.next = a or b` attaches the remaining `5 → ∅` in one
assignment: `1 → 2 → 3 → 4 → 5`. Return `dummy.next` = node 1. Two pointers were live throughout,
regardless of list length.

### Code

```python
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
```

### Common mistake

Forgetting `tail = tail.next`. The loop still runs the right number of times and picks the right
winners, but every winner is attached to the *same* node — the dummy — so each one overwrites the
last. At the end `dummy.next` points at the final winner, and then `tail.next = a or b` overwrites
even that. On the worked example you would get `5` back: a single-element list, no exception, no
warning. The reason it is wrong is that `tail` is supposed to mean "the last node of the answer so
far", and an assignment to `tail.next` changes the answer without changing what `tail` means unless
you advance it.

A close relative: exiting the loop and forgetting `tail.next = a or b` entirely. That truncates the
answer at the point where the shorter list ran out — here you would get `1 → 2 → 3 → 4` and silently
lose the 5. Worse, if `tail.next` still holds a stale pointer from the input list, you can end up with
a result that is correct by accident on some inputs and wrong on others.

### Complexity and when to use this

**Time `O(n + m)`, space `O(1)`.** Every iteration permanently places exactly one node into the
result and advances past it, so the loop runs at most `n + m` times with constant work each; the
final remainder attach is one assignment regardless of how long the remainder is. Space is the dummy
node plus two pointers — constant, and the dummy is freed the moment you return.

This is the one to ship. It meets the splice requirement (every node in the output is an input node),
it is optimal in both time and space, and it is the exact subroutine that merge-sort on linked lists
and merge-k-sorted-lists are built out of. There is no input size at which another approach here is
preferable.

---

## The Overall Arc

Every step of this ladder chases one principle: **when both inputs are already sorted, the next
element of the answer is always one of the two front nodes — so the only question is how expensively
you find it and where you put it.** The collect-and-sort version answers that question by not asking
it: it pours both lists into one bucket and runs a general-purpose sort, spending `log(n+m)`
comparisons per element to reconstruct an order it was handed intact, and allocating a fresh node per
value in violation of the splice requirement. Its weakness is that it discards the single most
valuable fact about the input. Recursion is the first approach to use that fact: compare the two
fronts, and the smaller one is provably the head of the answer, because everything behind it is
larger and everything in the other list is at least as large as that list's front — so a purely local
comparison makes a globally correct choice, and the rest of the answer is the same problem on a
shorter pair. That collapses `n log n` to `n` and reuses the original nodes. But recursion keeps one
stack frame alive per node just to remember where to attach the next winner, which is `O(n+m)` memory
spent on a single piece of information: the current end of the result. The last step names that
information and stores it in a variable — `tail` — and once the end of the result is a pointer you
can hold, the recursion flattens into a loop. The dummy head then removes the only remaining wrinkle,
the "is this the first node?" branch, by making sure there is always an end to attach to; and the
same sortedness that justified the local comparison in the first place pays off once more at the end,
where the surviving list is attached whole in a single assignment instead of being walked. The
progression is one fact — *sorted inputs make the front nodes sufficient* — being trusted further at
each rung: first ignored, then used for the comparison, then used again to make the remainder free.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Collect and sort | `O((n+m) log(n+m))` | `O(n+m)` | Ignores sortedness for a general tool; allocates new nodes | The inputs are not actually sorted, or you are merging on a key the list order does not reflect |
| Recursive | `O(n+m)` | `O(n+m)` stack | Optimal comparisons and splices in place, but one frame per node | Lists are provably short (they are here, at 50 each) and you want the clearest possible code |
| Dummy head + tail | `O(n+m)` | `O(1)` | The dummy costs one throwaway node and removes every special case | Always, for this problem — and as the subroutine inside merge-sort and merge-k-lists |

---

## Interview Priority

**Memorize cold: the dummy-head loop.** Six lines, and it is a building block rather than a
destination — merge-sort a linked list, merge k sorted lists (pairwise or with a heap), and
"flatten these sorted streams" all bottom out in exactly this loop. The two details that are easy to
drop under pressure and expensive to debug are `tail = tail.next` and the final `tail.next = a or b`;
drill until both are reflex.

**Memorize cold: the dummy-head pattern itself, separately from this problem.** The sentinel node that
removes the "first element is special" branch shows up in remove-nth-from-end, remove-list-elements,
partition-list, and every list problem where the head itself might be deleted or replaced. Knowing
*why* you reach for it — "so that a pointer to the end always exists" — is worth more than knowing
this one function.

**Understand but do not drill: the recursive merge.** It is genuinely worth being able to write, both
as an answer to "can you do it recursively?" and because it is the clearest statement of the key
insight. But it is short enough to derive on the spot once you can say "the smaller head owns the
position, the recursion owns the rest", so memorize the sentence, not the code.

**Understand but do not drill: collect-and-sort.** One sentence in the interview, zero flashcards. Its
only job is to let you say what the sortedness is buying you before you spend it.

---

## Full Runnable Script

`ListNode`, `build` and `to_list` below are **scaffolding, not part of the answer.** In an interview
the node class and the two `head` pointers already exist; these helpers are here only so this file
can build inputs from ordinary Python lists and print results. None of the three solution functions
calls them.

```python
"""Merge Two Sorted Lists — every approach in one file, cross-checked.

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
    """Scaffolding: read a list back out. `limit` guards against a merge bug
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
        print(f"\n{label}: a={sa} (n={len(va)}), b={sb} (m={len(vb)})")
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
    main()
```
