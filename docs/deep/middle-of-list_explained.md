# The Middle of a Linked List — Explained

## Understanding the Problem

You are given the first node of a chain and asked to hand back the node in the middle. If the chain
has an odd number of nodes there is exactly one middle and that is your answer. If it has an even
number there are two nodes with equal claim, and the problem tells you which one it wants: **the
second**.

**The core question: how do you find the halfway point of something you cannot measure without
walking all of it?** The naive approach is not slow in the big-O sense — nothing here beats `O(n)`,
because you must at minimum touch the end of the list to know where the end is. It is slow in
*passes*: the instinct is to walk the whole list once to learn its length, then walk half of it again,
and that second walk is the thing the good solution removes.

Two pieces of vocabulary, expanded once:

- **Return the node, not the value.** Your answer is a pointer into the original list; everything from
  that node onward is still attached to it. This matters because values repeat (they range only over
  `1 … 100`), so "the node holding 4" is not a well-defined answer while "the node at index 3" is.
- **One pass** means each node is read once, in order, with no ability to go back. It is a stronger
  requirement than `O(n)` time — approach 2 below is `O(n)` and still needs two passes. It is what
  lets an algorithm run over a stream you cannot rewind.

The one arithmetic fact that unifies every approach: with 0-based indexing, **the answer is always the
node at index `n // 2`.** For `n = 5` that is index 2 (the third node, the unique middle); for `n = 6`
it is index 3 (the fourth node, the second of the two middles). Floor division does the odd/even
distinction for you — there is no `if` anywhere in this problem.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `an EVEN length returns the SECOND middle node` | The constraint that **fixes the exact loop condition.** It is what makes the index `n // 2` rather than `(n - 1) // 2`, and it is what makes the fast pointer's test `while fast and fast.next` rather than `while fast.next and fast.next.next`. Stopping one step earlier gives the first middle — a correct algorithm, wrong answer. |
| `1 <= number of nodes` | There is no empty-list case. Every approach may assume `head` exists. (The code below tolerates `None` anyway, because a helper that crashes on an empty list is a trap waiting for the next problem.) |
| `a single node is its own middle` | Falls out of `n // 2 = 0`: walk zero steps, return the head. No special case needed in any approach — if yours needs one, the arithmetic is wrong. |
| `1 <= node.val <= 100` with up to 100 nodes | Values repeat constantly, so the answer must be identified by position, not by value. It is also why the test harness below compares **indices**, not values — a check on values would pass while returning the wrong node. |
| `1 <= number of nodes <= 100` | Small enough that every approach here finishes instantly. Be honest about this: the two-pointer version is not chosen for speed at `n = 100`. It is chosen because it is one pass and constant space, which is what generalises to a 10^7-node list or a stream. |

---

## Approach 1: Copy into an array and index it

### The idea

*The problem is only hard because linked lists cannot be indexed — so what if we make one that can?*
Walk the list once pushing every node into a Python list, then return `nodes[len(nodes) // 2]`.
*Why is that not the answer?* Because it allocates an array as large as the list to answer a question
that needs no storage at all, and the moment `n` is large enough for the answer to matter, so is the
array.

### How to think about it

The shape of the reasoning is: **escape to a container that supports the operation you want.** You
want random access; arrays have it, linked lists do not; so build an array. It is a completely
legitimate instinct and the right one in plenty of real code — it is wrong here only because the
question is specifically testing whether you can get the same answer without the array.

Note carefully what goes into the array: the **nodes**, not the values. If you collect values you can
find the middle value but you cannot return the middle *node*, and the problem asks for a node with
the rest of the list still hanging off it. That distinction is invisible on an example like
`[1,2,3,4,5]` where every value is unique, and it is the whole game on `[1,1,1,1]`.

### Worked example

Input: `1 → 2 → 3 → 4 → 5 → 6 → ∅`, expected answer: the node at index 3, holding **4**.
(This same list is traced in every approach below.)

**Pass 1 — collect the nodes:**

| Step | node visited | `nodes` length afterwards |
|---|---|---|
| 1 | `N1` (val 1) | 1 |
| 2 | `N2` (val 2) | 2 |
| 3 | `N3` (val 3) | 3 |
| 4 | `N4` (val 4) | 4 |
| 5 | `N5` (val 5) | 5 |
| 6 | `N6` (val 6) | 6 |

**Index:** `len(nodes) = 6`, so `6 // 2 = 3`, so return `nodes[3]` = `N4`, value **4**. Correct — and
six node references were held in memory to get there.

### Code

```python
def middle_of_list_copy_to_array(head: ListNode | None) -> ListNode | None:
    nodes: list[ListNode] = []  # the NODES, not their values — the answer is a node
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    if not nodes:
        return None
    return nodes[len(nodes) // 2]  # floor division picks the SECOND middle when even
```

### Common mistake

Writing `nodes[(len(nodes) - 1) // 2]`, which is the other plausible-looking way to spell "the
middle". It is right for odd lengths and wrong for even ones: on the six-node example it gives index
2, the node holding 3 — the **first** middle, when the problem asked for the second. The bug survives
every odd-length test you write, and `[1,2,3,4,5]` is the example most people try first. Derive the
index from the even case, not the odd one; the odd case will take care of itself.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is a single walk plus a constant-time index. Space is the array of
`n` node references — nothing is copied deeply, but the array itself scales with the list.

Use it when you need more than the middle: if the surrounding code wants the middle *and* the quartile
points, or wants to index the list repeatedly, materialising it once is cheaper than walking it once
per query. For a single middle-node lookup it is strictly worse than approach 2, which gets the same
answer in the same time with no memory.

---

## Approach 2: Count, then walk half

### The idea

*The array was only used to learn the length and then to index once — can we get the length without
storing anything?* Yes: walk the list counting nodes, throw the nodes away, then walk again from the
head stopping after `count // 2` steps. *What does it fix?* It removes the `O(n)` array entirely —
same answer, same linear time, constant space. What it still costs is a **second traversal**: you must
reach the end before you can begin.

### How to think about it

The shape is: **the array was doing two jobs, and only one of them was necessary.** It was recording
the length, which is a single integer, and it was providing random access, which you used exactly
once. Replace the first with a counter and the second with a walk, and the storage disappears.

The price is a dependency in time rather than space: the first pass must *finish* before the second
can *start*, because `count // 2` is unknown until the end of the list is found. That is the property
worth naming, because it is precisely what the next approach removes — and it is what makes this
version unusable on a stream you can only read once.

The indexing is the same as before: after counting, walking `count // 2` steps from the head lands you
on index `count // 2`. Six nodes, three steps: `N1 → N2 → N3 → N4`. The `range(count // 2)` loop body
runs three times and moves the pointer three times.

### Worked example

Input: `1 → 2 → 3 → 4 → 5 → 6 → ∅`.

**Pass 1 — count:**

| Step | `node` at | `count` afterwards |
|---|---|---|
| 1 | `N1` | 1 |
| 2 | `N2` | 2 |
| 3 | `N3` | 3 |
| 4 | `N4` | 4 |
| 5 | `N5` | 5 |
| 6 | `N6` | 6 |
| 7 | `None` | loop ends, `count = 6` |

`count // 2 = 3`.

**Pass 2 — walk three steps from the head:**

| Step | `node` before | `node` after |
|---|---|---|
| start | — | `N1` (index 0) |
| 1 | `N1` | `N2` (index 1) |
| 2 | `N2` | `N3` (index 2) |
| 3 | `N3` | `N4` (index 3) |

Return `N4`, value **4**. Nine node touches total (six to count, three to walk), across two separate
traversals.

### Code

```python
def middle_of_list_count_then_walk(head: ListNode | None) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    node = head  # the counting loop left `node` at None — reset before walking
    for _ in range(count // 2):
        assert node is not None  # count // 2 < count, so this can never run off the end
        node = node.next
    return node
```

### Common mistake

Forgetting `node = head` before the second loop. The counting loop exits precisely because `node`
became `None`, so the walk starts from nothing: `range(count // 2)` then either crashes with
`AttributeError: 'NoneType' object has no attribute 'next'` on the first step, or — on a one-node list,
where `count // 2 == 0` and the loop body never runs — silently returns `None`. The one-node case
returning `None` instead of the head is the nastier half, because it is the case people test last.

The underlying reason is that `node` is being used for two different purposes in the same function. If
you find this bug in your own code, the durable fix is to use two differently-named variables — a
`counter` pointer and a `walker` pointer — rather than to remember to reset.

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** Time is `n` steps to count plus `n/2` to walk — about `1.5n` node
touches, linear. Space is one integer and one pointer.

Use it when you need the length anyway. If the caller is going to ask "how long is this list?" in the
next line, counting is not wasted work and this version is the most direct thing to write. It is also
the easiest of all four to convince a reader is correct, which is worth something in code that is not
on a hot path. What rules it out is the two-pass requirement, not the complexity.

---

## Approach 3: Fast and slow pointers

### The idea

*The second pass existed only because the length was unknown until the end — can the walk discover the
halfway point without ever knowing the length?* Yes: send two pointers from the head, one moving one
node per step and one moving two. When the fast one reaches the end, it has covered the whole list, so
the slow one has covered exactly half. *What does it fix?* It removes the second traversal: one pass,
constant space, and no number is ever computed — the answer comes out of the geometry of the walk.

### How to think about it

Two walkers leave the front door together; one walks at double the other's pace. The moment the fast
walker runs out of road, the slow walker is standing at the halfway mark. Nobody measured the road.
The ratio did the arithmetic: **distance travelled is proportional to speed, so half the speed means
half the distance, whatever the total turns out to be.**

That is the whole idea, and the only thing left to get right is *exactly* where the fast pointer stops,
because that is what decides the even case. The condition is `while fast is not None and fast.next is
not None`, and it is doing two jobs at once:

- `fast.next is not None` is what lets `fast = fast.next.next` be legal — you may only step twice from
  a node that has a successor.
- Continuing while *both* exist is what pushes the slow pointer onto the **second** middle when `n` is
  even. On six nodes the loop runs three times and slow ends at index 3. Change the condition to
  `while fast.next is not None and fast.next.next is not None` and the loop runs twice, slow ends at
  index 2, and you have returned the first middle. Both versions are "correct"; only one answers the
  question that was asked.

The parity works out because of where fast lands: on an odd-length list fast ends *on* the last node
(and `fast.next` is `None`); on an even-length list fast ends *past* it, on `None`. Either way the
loop has run exactly `n // 2` times, which is exactly how many steps slow took.

### Worked example

Input: `1 → 2 → 3 → 4 → 5 → 6 → ∅`. State shown *after* each iteration.

| Iteration | `slow` (index) | `fast` (index) | loop test at the top of the next round |
|---|---|---|---|
| start | `N1` (0) | `N1` (0) | `fast=N1`, `fast.next=N2` → both exist, continue |
| 1 | `N2` (1) | `N3` (2) | `fast=N3`, `fast.next=N4` → continue |
| 2 | `N3` (2) | `N5` (4) | `fast=N5`, `fast.next=N6` → continue |
| 3 | `N4` (3) | `None` (past 5) | `fast is None` → **stop** |

Return `slow` = `N4`, value **4**. Three iterations, `slow` moved three times and `fast` six — nine
node touches, same as approach 2, but all in **one pass** with nothing stored.

For contrast, the odd-length `[1,2,3,4,5]`: iteration 1 gives `slow=N2, fast=N3`; iteration 2 gives
`slow=N3, fast=N5`; the test then sees `fast.next is None` and stops. Return `N3`, index 2 — the
unique middle. The same code, the same condition, no branch.

### Code

```python
def middle_of_list_fast_slow(head: ListNode | None) -> ListNode | None:
    slow = head
    fast = head
    # both tests matter: `fast` ends the even case, `fast.next` ends the odd case
    # AND makes fast.next.next legal. Stopping earlier would return the FIRST middle.
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow
```

### Common mistake

Writing `while fast is not None` alone. On the six-node example, the third iteration leaves
`fast = None` and stops safely — but on the five-node list, iteration 2 leaves `fast = N5`, the test
passes, and `fast = fast.next.next` evaluates `N5.next.next`, which is `None.next`, and the whole thing
dies with `AttributeError: 'NoneType' object has no attribute 'next'`. It crashes on odd lengths and
works on even ones, which is an unusually cruel failure mode to debug.

The rule underneath it: **you may dereference a pointer only after checking it, and `fast.next.next`
dereferences twice, so it needs two checks.** That is why the condition has two clauses, and why the
order of the clauses matters too — Python's `and` short-circuits, so `fast is not None` must come
first or the check itself would crash.

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** The loop runs `n // 2` times and does two pointer moves each, so about
`1.5n` dereferences — linear, in a single forward pass. Space is two pointers, regardless of `n`.

This is the one to ship. The single pass is the reason: it works on a list you can only read once (a
stream, a generator, a cursor over data too large to hold), and it never needs the length. It is also
the reusable half of harder problems — split-list-in-half for merge sort, palindrome-check, and
reorder-list all begin by finding the middle exactly this way, and cycle-detection is the same two
pointers with a comparison added.

---

## Approach 4: Walk `n // 2` when the length is already known

### The idea

*Approach 3 still touches about `1.5n` nodes because the fast pointer covers the whole list — what if
we already knew the length and never had to discover it?* Then the answer is one walk of exactly
`n // 2` steps: the fewest node touches any approach here achieves. *What does it cost?* It only works
if you are handed a trustworthy length.

**The assumption this requires, stated plainly: something outside this function maintains an accurate
node count** — a wrapper class with a `size` field, a protocol header, a database row count. The
problem as stated gives you a bare `head` pointer and no length, so this approach is **not** an answer
to the problem as posed. It is an answer to the problem as it usually appears in real systems.

### How to think about it

The shape is: **stop solving the part of the problem that someone else already solved.** All three
previous approaches spend most of their work discovering `n` — the array measures it by storing
everything, the counter measures it with a full pass, the fast pointer measures it implicitly by
racing to the end. If `n` arrives with the input, every one of those becomes pure overhead and the
task collapses to a single arithmetic step plus a half-length walk.

The failure mode is not a coding error, it is a trust error: a stale or wrong `size` gives a confidently
wrong node, or walks off the end. That is why this belongs behind an encapsulated list type that
updates `size` on every insert and delete, and not in a free function anyone can call with whatever
integer they like.

### Worked example

Input: `1 → 2 → 3 → 4 → 5 → 6 → ∅`, with `length = 6` supplied by the caller.

`6 // 2 = 3`, so walk three steps:

| Step | `node` before | `node` after |
|---|---|---|
| start | — | `N1` (index 0) |
| 1 | `N1` | `N2` (index 1) |
| 2 | `N2` | `N3` (index 2) |
| 3 | `N3` | `N4` (index 3) |

Return `N4`, value **4**. **Three node touches**, versus nine for every other approach on this input —
the list beyond `N4` is never read at all.

### Code

```python
def middle_of_list_known_length(head: ListNode | None, length: int) -> ListNode | None:
    node = head
    for _ in range(length // 2):
        if node is None:  # a stale `length` is the only way to get here
            raise ValueError("length is larger than the list")
        node = node.next
    return node
```

### Common mistake

Trusting a `length` that a mutation has invalidated. Delete a node from the list and forget to
decrement `size`, and this function returns the node one past the true middle — or, if enough deletions
pile up, walks off the end. The bug is not in this function and cannot be fixed in this function; it
is in whatever failed to keep the count honest. That is why the `if node is None` guard is here: it
converts a silent wrong answer into a loud failure at the point where the lie becomes detectable.

The second mistake is subtler: reaching for this approach in an interview because it looks fastest.
The problem hands you a `head` and nothing else, so quoting a length you were never given is answering
a different question.

### Complexity and when to use this

**Time `O(n)` with exactly `n // 2` node touches, space `O(1)`.** It is still linear — a linked list
offers no way to jump — but the constant is half of approach 2's and a third of approach 3's, and the
second half of the list is never read. Space is one pointer and one integer.

Use it inside a list type that owns its own `size` field, where the count is maintained as an
invariant rather than trusted from outside. In that setting it is strictly better than approach 3. As
an answer to this problem as stated, it is a footnote: mention that a maintained length halves the
work, then write the two-pointer version because no length was offered.

---

## The Overall Arc

Every step of this ladder chases one principle: **the middle is at index `n // 2`, so the entire
problem is the cost of learning `n` — and each approach pays for that knowledge differently.** The
array version buys `n` in the most expensive currency available: it stores every node so that
`len()` is free and indexing is free, then uses the indexing exactly once and throws the rest away,
which is `O(n)` memory spent to avoid arithmetic. Its weakness is that almost none of what it stored
was ever needed. Counting fixes precisely that — the length is one integer, so keep one integer — and
the memory collapses to nothing while the answer stays identical. But the counter has a new weakness
that the array did not have: it cannot say anything until it reaches the end, so the walk to the
middle can only begin after a complete traversal has finished, which means two passes and no hope of
running on data you can read only once. The fast-and-slow pair dissolves that dependency with a
change of framing: stop trying to *learn* `n` and instead *exploit a ratio*, because a pointer moving
at half speed is at the halfway point whenever the full-speed pointer finishes, and that is true
without anyone ever computing a number. The length is never known, never needed, and the whole thing
happens in one forward sweep with two variables — and the same loop condition that keeps
`fast.next.next` legal is what lands the slow pointer on the second middle the problem asked for, so
the odd/even distinction never becomes a branch. The final rung closes the loop by observing that if
some outer structure already maintains `n`, then all this discovery was overhead, and the task reduces
to walking `n // 2` steps and reading only half the list — the cheapest possible version, available
only to code that earned it by keeping the count honest. The progression is one question — *how
expensively are you learning the length?* — answered four times: store everything, store one number,
infer it from a ratio, or be given it.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Copy to array | `O(n)` | `O(n)` | Buys random access with memory, then indexes once | The caller wants repeated positional access, not just one middle |
| Count, then walk half | `O(n)`, ~`1.5n` touches, **two passes** | `O(1)` | Free of memory, but cannot start until the end is found | You need the length anyway, or you want the version easiest to prove correct |
| Fast and slow pointers | `O(n)`, ~`1.5n` touches, **one pass** | `O(1)` | None worth naming — two pointers, one sweep, no length ever computed | Always for this problem, and whenever the input is a stream you can read only once |
| Known length | `O(n)`, exactly `n/2` touches | `O(1)` | Fewest touches of all; requires a maintained, trustworthy count | Inside a list type that owns its `size` — never from a bare `head` |

---

## Interview Priority

**Memorize cold: the fast-and-slow loop.** Four lines, and it is far more valuable as a component than
as an answer. Splitting a list in half for merge sort, checking a list is a palindrome, reordering a
list, and removing the nth node from the end are all built from a pair of pointers moving at different
rates — this is the simplest member of that family and the one to learn first. Memorize the loop
condition as a unit, `while fast and fast.next`, and be able to say what each half is for: one keeps
`fast.next.next` legal, the other decides which of the two middles you land on.

**Memorize cold: the `n // 2` fact and the second-middle rule.** Not code — arithmetic. Knowing that
the answer is index `n // 2` for both parities, and that the alternative spelling `(n - 1) // 2` gives
the first middle, is what lets you check any of these four implementations in your head in five
seconds. Nearly every wrong answer in this problem is one of those two expressions in the wrong place.

**Understand but do not drill: count-then-walk.** Worth naming in the first thirty seconds — "the
obvious version counts and then walks half, which is two passes" — because it sets up the one-pass
improvement as an actual improvement rather than a trick. You can write it from scratch any time; it
needs no rehearsal.

**Understand but do not drill: copy-to-array, and known-length.** The array version's value is that it
forces you to say "the nodes, not the values", which is the distinction the problem is quietly testing.
The known-length version's value is showing you know where this problem lives in real code. Neither is
something you would submit, and neither is worth a flashcard.

---

## Full Runnable Script

`ListNode`, `build`, `to_list` and `index_of` below are **scaffolding, not part of the answer.** An
interviewer hands you a `head` and the node class already exists; these helpers are here only so this
file can build inputs from ordinary Python lists and check results.

`index_of` deserves a word: the tests compare the **index** of the returned node, not its value.
Values in this problem range over `1 … 100` with up to 100 nodes, so duplicates are everywhere, and a
test that checks `result.val == 1` on the list `[1, 1, 1, 1]` passes no matter which of the four nodes
came back. Comparing positions is the only check that can actually fail when the answer is wrong.

```python
"""The Middle of a Linked List — every approach in one file, cross-checked.

Run:  python middle_of_list.py
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


def to_list(head: ListNode | None) -> list[int]:
    """Scaffolding: read a list back out."""
    out: list[int] = []
    node = head
    while node is not None:
        out.append(node.val)
        node = node.next
    return out


def index_of(head: ListNode | None, target: ListNode | None) -> int:
    """Scaffolding: position of `target` within the chain starting at `head`,
    or -1 if it is not there. Tests compare POSITIONS, not values: values
    repeat, so a value check passes even when the wrong node came back."""
    i = 0
    node = head
    while node is not None:
        if node is target:  # identity, not equality
            return i
        node = node.next
        i += 1
    return -1


# ------------------------------------------- approach 1: O(n) time, O(n) space
def middle_of_list_copy_to_array(head: ListNode | None) -> ListNode | None:
    nodes: list[ListNode] = []  # the NODES, not their values — the answer is a node
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    if not nodes:
        return None
    return nodes[len(nodes) // 2]  # floor division picks the SECOND middle when even


# ------------------------------ approach 2: O(n) time, O(1) space, TWO passes
def middle_of_list_count_then_walk(head: ListNode | None) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    node = head  # the counting loop left `node` at None — reset before walking
    for _ in range(count // 2):
        assert node is not None  # count // 2 < count, so this can never run off the end
        node = node.next
    return node


# ------------------------------- approach 3: O(n) time, O(1) space, ONE pass
def middle_of_list_fast_slow(head: ListNode | None) -> ListNode | None:
    slow = head
    fast = head
    # both tests matter: `fast` ends the even case, `fast.next` ends the odd case
    # AND makes fast.next.next legal. Stopping earlier would return the FIRST middle.
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow


# ---------- approach 4: n/2 touches, O(1) space — ASSUMES a maintained length
def middle_of_list_known_length(head: ListNode | None, length: int) -> ListNode | None:
    node = head
    for _ in range(length // 2):
        if node is None:  # a stale `length` is the only way to get here
            raise ValueError("length is larger than the list")
        node = node.next
    return node


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example (odd)", [1, 2, 3, 4, 5]),
        ("statement example (even)", [1, 2, 3, 4, 5, 6]),
        ("minimal: one node", [1]),
        ("two nodes -> the second", [1, 2]),
        ("three nodes", [1, 2, 3]),
        ("all duplicate values", [1, 1, 1, 1]),
        ("duplicates, odd length", [7, 7, 7]),
        ("boundary values", [1, 100, 1, 100]),
        ("empty list (outside the constraints, must not crash)", []),
    ]
    random.seed(53)
    cases.append(("stress: 99 nodes (odd)", [random.randint(1, 100) for _ in range(99)]))
    cases.append(("stress: 100 nodes (even)", [random.randint(1, 100) for _ in range(100)]))

    all_agreed = True
    for label, values in cases:
        n = len(values)
        expected_index = n // 2 if n else -1  # -1 == "None came back"
        shown = values if n <= 8 else values[:6] + ["..."]
        print(f"\n{label}: {shown} (n={n}), expected index {expected_index}")
        indices: dict[str, int] = {}
        for name, fn in (
            ("copy_to_array", middle_of_list_copy_to_array),
            ("count_then_walk", middle_of_list_count_then_walk),
            ("fast_slow", middle_of_list_fast_slow),
        ):
            head = build(values)
            got = fn(head)
            idx = index_of(head, got)
            indices[name] = idx
            ok = idx == expected_index
            all_agreed &= ok
            val = "None" if got is None else str(got.val)
            print(f"  {name:<17} -> index {idx:<3} (val {val:<4}) {'ok' if ok else 'MISMATCH'}")
        # approach 4 takes the length as an extra argument, so it is driven separately
        head = build(values)
        got = middle_of_list_known_length(head, n)
        idx = index_of(head, got)
        indices["known_length"] = idx
        ok = idx == expected_index
        all_agreed &= ok
        val = "None" if got is None else str(got.val)
        print(f"  {'known_length':<17} -> index {idx:<3} (val {val:<4}) {'ok' if ok else 'MISMATCH'}"
              f"   [given length={n}]")

        # the returned node must still carry the rest of the original list
        if n and len(to_list(got)) != n - expected_index:
            all_agreed = False
            print("  !! the returned node does not carry the rest of the list")
        if len(set(indices.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree with each other")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND — see the MISMATCH lines above")


if __name__ == "__main__":
    main()
```
