# Reverse a Linked List — Explained

## Understanding the Problem

You are handed the first node of a chain. Each node holds a value and a single arrow pointing at the
next node; the last node's arrow points at nothing. You must turn the whole chain around, so the node
that was last is now first and every arrow points the other way, and hand back the node that is now
first.

**The core question: can you flip every arrow without ever losing your grip on the part of the chain
you have not flipped yet?** The naive approach is slow in space, not in time — the instinct is to
copy all the values out into an array and build a brand-new chain backwards, which walks the list
once but allocates a second list of the same size, and the problem asked you to reverse the one you
were given.

Two pieces of vocabulary, expanded once:

- **In place** means you rearrange the nodes you already have instead of creating new ones. The same
  node objects come back, wired differently.
- **Singly linked** means each node knows only its successor. There is no arrow backwards, which is
  exactly why this problem is not trivial: once you step off a node, nothing points back to it unless
  you kept a variable pointing at it yourself.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `0 <= list length <= 5000` | This is the constraint that **kills the recursive version**. Five thousand nodes means five thousand nested calls; Python's default recursion limit is 1000, and a JVM stack will not reliably hold 5000 frames either. The iterative loop is unlocked by nothing — it is required by this. |
| `-5000 <= node value <= 5000` | Values are ordinary small integers with no sentinel meaning. Nothing here rules out a value-marking trick, but there is no reason to want one: reversal does not need to remember which nodes it has seen. |
| `an empty list is legal input` | Every approach must return `None` for `None` without crashing. The three-pointer version gets this for free — starting `prev` at `None` means the empty case returns `None` before the loop body ever runs. |
| "reverse it **in place**" (from the statement) | This is the real reason the copy-to-array version loses. It is not slower in time; it is disqualified by the requirement. |

---

## Approach 1: Copy to an array, rebuild

### The idea

*What is the most direct thing that could possibly work?* Read every value into a Python list, then
build a fresh chain by pushing those values onto the front of a growing list one at a time — pushing
front-to-back onto the front is itself a reversal. *Why is that not the answer?* Because it allocates
`n` brand-new nodes and returns a different list than the one you were given, which is precisely what
"in place" forbids.

### How to think about it

Think of the linked list as an awkward container and the array as a comfortable one. The shape of the
reasoning is: escape to the comfortable container, do the easy thing there, and come back. The "easy
thing" is not even `vals.reverse()` — it is the observation that a linked list built by repeatedly
prepending comes out backwards for free, because the first value you prepend ends up deepest. You are
paying `O(n)` memory to buy yourself an indexable structure, and then not even using the indexing.
That last part is the tell that this approach is wasteful: it takes a detour and then does not use
what the detour bought.

### Worked example

Input: `1 → 2 → 3 → 4 → ∅`. (This same list is traced in every approach below.)

**Pass 1 — drain the values:**

| Step | `head` points at | `vals` after |
|---|---|---|
| start | node 1 | `[]` |
| 1 | node 2 | `[1]` |
| 2 | node 3 | `[1, 2]` |
| 3 | node 4 | `[1, 2, 3]` |
| 4 | `None` | `[1, 2, 3, 4]` |

**Pass 2 — prepend each value onto a new chain:**

| Step | value `v` | new node created | `new_head` chain afterwards |
|---|---|---|---|
| start | — | — | `∅` |
| 1 | 1 | `ListNode(1, ∅)` | `1 → ∅` |
| 2 | 2 | `ListNode(2, →1)` | `2 → 1 → ∅` |
| 3 | 3 | `ListNode(3, →2)` | `3 → 2 → 1 → ∅` |
| 4 | 4 | `ListNode(4, →3)` | `4 → 3 → 2 → 1 → ∅` |

Return `new_head`, the node holding 4. Note that all four original nodes still exist, untouched and
still pointing forwards. Eight nodes now live where four did.

### Code

```python
def reverse_list_copy_to_array(head: ListNode | None) -> ListNode | None:
    vals: list[int] = []
    while head is not None:
        vals.append(head.val)
        head = head.next
    new_head: ListNode | None = None
    for v in vals:
        new_head = ListNode(v, new_head)  # prepending in original order reverses it
    return new_head
```

### Common mistake

Writing `for v in reversed(vals)` because "we want it reversed". That reverses twice and hands back a
copy of the **original** order. The reversal here lives in the prepending, not in the iteration
order — every prepend buries what came before, so walking the values forwards is correct and walking
them backwards undoes the effect. If you find yourself reaching for `reversed()`, you have not
noticed that prepending is already a reversal.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is one walk to drain plus one loop to rebuild — two linear passes.
Space is the `vals` array of `n` integers plus `n` freshly allocated nodes; nothing here is
proportional to anything but the list length.

Use it when the nodes are not yours to modify — a shared or immutable structure another part of the
program is still reading, or a list you were handed a const pointer to. Building a reversed copy is
then the only correct move, and the allocation is the price of not mutating someone else's data. For
this problem as stated, it is the honest baseline you should be able to write in thirty seconds and
then explain why you are not shipping it.

---

## Approach 2: Recursion

### The idea

*The array version allocated a whole second list — can we rewire the nodes that are already there?*
Yes: assume a helper can reverse everything after the head, then all that remains is to hook the head
onto the back of that reversed remainder. *What does it fix, and what does it still cost?* It fixes
the allocation — no new nodes are created, the original nodes are rewired in place — but it replaces
the array with a stack of `n` function calls, so the memory moved rather than disappeared.

### How to think about it

The shape is: **shrink the problem by one node, trust the smaller answer, then do one node's worth of
work.** Say the list is `head` followed by a tail `T`. Recursively reverse `T`; you now have a chain
ending at the node that used to be `T`'s head — and that node is still `head.next`, because you never
changed `head`'s arrow. So `head.next` is the *last* node of the reversed remainder, and hooking
`head` on is one assignment: `head.next.next = head`. Then `head.next = None`, because `head` is now
the tail and a tail points at nothing. The new head never changes as the recursion unwinds — it is
whatever the deepest call returned — so you pass it straight up. The trick to holding this in your
head is the double `.next`: `head.next` is the node you handed to the recursion, and after that call
it is the reversed chain's final node.

### Worked example

Input: `1 → 2 → 3 → 4 → ∅`.

**Winding down** (nothing is rewired yet; each call just goes deeper):

| Call | `head` | action |
|---|---|---|
| `reverse(1)` | node 1 | not the base case, call `reverse(2)` |
| `reverse(2)` | node 2 | not the base case, call `reverse(3)` |
| `reverse(3)` | node 3 | not the base case, call `reverse(4)` |
| `reverse(4)` | node 4 | `head.next is None` → **base case**, return node 4 |

**Unwinding** (now every frame does its one assignment):

| Returning into | `new_head` | `head.next` is | `head.next.next = head` makes | `head.next = None` leaves | chain now |
|---|---|---|---|---|---|
| `reverse(3)` | node 4 | node 4 | `4 → 3` | `3 → ∅` | `4 → 3 → ∅`, and `1 → 2 → 3` still ahead of it |
| `reverse(2)` | node 4 | node 3 | `3 → 2` | `2 → ∅` | `4 → 3 → 2 → ∅` |
| `reverse(1)` | node 4 | node 2 | `2 → 1` | `1 → ∅` | `4 → 3 → 2 → 1 → ∅` |

Final return: node 4. Four stack frames were live at the deepest point.

### Code

```python
def reverse_list_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # empty list, or the last node — already reversed
    new_head = reverse_list_recursive(head.next)
    head.next.next = head  # head.next is the TAIL of the reversed remainder
    head.next = None       # head becomes the new tail; without this the last two nodes loop
    return new_head        # unchanged all the way up: the deepest node
```

### Common mistake

Forgetting `head.next = None`. Every other line still looks right and the function still returns the
correct head, but the last two nodes now point at each other: after `head.next.next = head`, node 1
still points at node 2 *and* node 2 now points at node 1. You have built a two-node infinite loop at
the end of the list. The bug does not raise an exception — it hangs the first thing that tries to
walk the result, which is usually your test helper, and it looks like an infinite loop somewhere else
entirely. The reason the line is needed: after you hook `head` onto the back, `head` is the tail, and
a tail's `next` must be `None`.

### Complexity and when to use this

**Time `O(n)`, space `O(n)` on the call stack.** Time is one frame per node, each doing constant work.
The space is not an array you can see — it is the interpreter's stack, one frame per node, all live
at once at the deepest point. That is why the `0 <= list length <= 5000` constraint disqualifies it:
5000 frames blows Python's default 1000-frame limit outright.

Use it when the list is guaranteed short and the recursive form is genuinely clearer to the reader —
or when you are working in a language with tail-call elimination and can restructure it to exploit
that (this shape is not tail-recursive as written; the work happens after the call). In an interview,
write it to show you can, then say the sentence about stack depth before anyone asks.

---

## Approach 3: Three pointers, iterative and in place

### The idea

*Recursion's only real job was to remember the node behind the current one — can a variable do that
instead of a stack frame?* Yes, and that collapses the whole thing into a loop: hold the node behind
you (`prev`), the node you are on (`curr`), and — because you are about to destroy the forward arrow
— a saved copy of the node ahead (`nxt`). *What does it fix?* It fixes recursion's `O(n)` stack: the
same rewiring happens with exactly three variables alive at any moment, no matter how long the list.

### How to think about it

Picture yourself walking the chain with a rope you are re-tying behind you. At each node you do three
things in a fixed order: **remember where you were going, point backwards, step forward.** The order
is the whole algorithm — you must save `curr.next` *before* you overwrite it, because overwriting it
is how you point backwards, and once it is overwritten the rest of the list is unreachable.

The second insight is what `prev` starts as. It starts as `None`, and that `None` is not a placeholder
— it is the value that ends up in the original head's `next` field, which is exactly what the new
tail needs. The empty-list case falls out of the same choice: with `head` being `None`, `curr` is
`None`, the loop never runs, and `prev` (still `None`) is returned. No special case, no `if`
statement, just a well-chosen starting value. And when the loop ends, `curr` is `None` and `prev` is
sitting on the last node you visited — the original tail — which is the new head.

### Worked example

Input: `1 → 2 → 3 → 4 → ∅`. State is shown *after* each full iteration.

| Iteration | `nxt` saved | `curr.next` set to | `prev` | `curr` | reversed part so far | untouched part |
|---|---|---|---|---|---|---|
| start | — | — | `∅` | node 1 | `∅` | `1 → 2 → 3 → 4 → ∅` |
| 1 | node 2 | `∅` | node 1 | node 2 | `1 → ∅` | `2 → 3 → 4 → ∅` |
| 2 | node 3 | node 1 | node 2 | node 3 | `2 → 1 → ∅` | `3 → 4 → ∅` |
| 3 | node 4 | node 2 | node 3 | node 4 | `3 → 2 → 1 → ∅` | `4 → ∅` |
| 4 | `None` | node 3 | node 4 | `None` | `4 → 3 → 2 → 1 → ∅` | — |

The loop test `while curr` now fails. Return `prev` = node 4. Notice the invariant that held after
every single row: **everything behind `prev` is already reversed, everything from `curr` onward is
still in original order, and the two halves are not connected.** That invariant is the thing to say
out loud in an interview.

### Code

```python
def reverse_list_three_pointer(head: ListNode | None) -> ListNode | None:
    prev: ListNode | None = None  # also becomes the original head's new next — the terminator
    curr = head
    while curr is not None:
        nxt = curr.next   # must be saved BEFORE the next line destroys it
        curr.next = prev
        prev, curr = curr, nxt
    return prev  # curr fell off the end; prev is the last node visited = the new head
```

### Common mistake

Writing `curr.next = prev` before saving `nxt`:

```python
while curr is not None:
    curr.next = prev       # WRONG — the rest of the list just became unreachable
    nxt = curr.next        # this now reads prev, not the node ahead
    prev, curr = curr, nxt
```

After the first iteration `curr` becomes `prev`, which is `None`, so the loop exits immediately and
you return a one-node list holding the original head. Nodes 2, 3 and 4 still exist but nothing points
at them. The failure is silent — no exception, no crash, just a list of length 1 — which is why this
is the bug that survives a quick eyeball review. The fix is not a fix so much as a discipline: in any
pointer rewiring, save what you are about to overwrite on the line before you overwrite it.

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** Time is one visit per node doing three constant-time assignments.
Space is genuinely constant: `prev`, `curr` and `nxt` are the only extra storage, and there are three
of them whether the list has 4 nodes or 5000.

This is the one to ship. It satisfies the in-place requirement, survives the 5000-node upper bound
that the recursion cannot, and handles the empty list without a special case. There is no scenario
in this problem where another approach beats it — the others exist to explain why this one is shaped
the way it is.

---

## The Overall Arc

Every step of this ladder chases one principle: **the only thing reversal actually needs to remember
is the node you just came from, and each approach differs only in how expensively it remembers it.**
The array version remembers everything — all `n` values, all at once, in a structure it then barely
uses — and pays for that with `n` new nodes and a result that is a copy rather than the list you were
asked to reverse; its weakness is that it treats "I need the previous node" as "I need the whole
history". Recursion notices that the history is not needed, only the immediate predecessor, and lets
the call stack hold it: each frame's `head` *is* the predecessor of the sublist below it, so no new
nodes are allocated and the rewiring happens in place. But the stack is still `O(n)` memory that
happens to be invisible, one frame per node, and with 5000 nodes allowed it is memory the runtime
will refuse to give you. The last step is the observation that a stack frame storing one pointer can
be replaced by a variable storing one pointer: `prev` is the predecessor, carried forward explicitly
instead of being rebuilt by unwinding. Once you say it that way the loop writes itself — save the
successor, flip the arrow, shift both pointers — and the `None` you initialised `prev` with turns out
to do double duty as the terminator for the new tail and as the answer for the empty list. The whole
progression is one idea being sharpened: from *store the past*, to *let the runtime store the past*,
to *the past is one pointer, hold it in your hand*.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Copy to array | `O(n)` | `O(n)` | Buys an easy mental model with `n` extra nodes; returns a copy, not the original list | The input must not be mutated — shared, immutable, or const-borrowed data |
| Recursive | `O(n)` | `O(n)` stack | In-place rewiring, but memory moved from the heap to an invisible call stack | The list is provably short and the recursive form reads better to your team |
| Three pointers | `O(n)` | `O(1)` | None worth naming — three variables, one pass, no allocation | Always, for this problem |

---

## Interview Priority

**Memorize cold: the three-pointer loop.** It is five lines, it is asked directly at least as often as
any other linked-list question, and — this is the real reason — it is a *subroutine* inside half the
harder list problems. Palindrome-check reverses the second half. Reorder-list reverses the second
half. Reverse-in-k-groups reverses a window at a time. If you have to think about `prev, curr, nxt`
during one of those, you have spent your thinking budget before reaching the actual problem.

**Memorize cold: the recursive version, as a second answer.** Not because you would ship it, but
because "can you do it recursively?" is the standard follow-up, and the `head.next.next = head`
line is the kind of thing that is obvious once seen and impossible to derive under pressure. Being
able to write it *and* immediately name its `O(n)` stack cost is a stronger signal than either alone.

**Understand but do not drill: copy-to-array.** Its value is rhetorical. Opening with "the obvious
thing is to dump the values and rebuild, which is `O(n)` time but allocates a second list and is not
in place" shows you know what the requirement is *for* before you satisfy it. You will never need to
recall its code — you can derive it in seconds — so spend the memorization budget elsewhere.

---

## Full Runnable Script

`ListNode`, `build` and `to_list` below are **scaffolding, not part of the answer.** An interviewer
hands you a `head` pointer and a node class that already exists; these helpers only exist so this
file can construct inputs from ordinary Python lists and print results. None of the three solution
functions calls them.

```python
"""Reverse a Linked List — every approach in one file, cross-checked.

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
    """Scaffolding: read a list back out. `limit` guards against a bug that
    leaves a cycle behind (the classic missing `head.next = None`)."""
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
        print(f"\n{label}: input {shown} (n={len(values)})")
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
    main()
```
