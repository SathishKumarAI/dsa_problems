# Remove the nth Node From the End — Explained

## Understanding the Problem

You are handed the first carriage of a train. Each carriage is coupled to the one in front of it and
knows nothing about what is behind it. Somebody asks you to remove the **second carriage from the
back**. You can walk forward along the train as much as you like, but you cannot see how long it is
from where you stand, and you cannot address a carriage by counting from an end you have not reached.

**The core question: how do you convert a position measured from the end into a position measured
from the front, when only the front is addressable?** Every approach below is a different conversion.
And the naive thing is not slow — it is `O(n)` too — it just cannot start until it has measured the
whole train.

There is a second question hiding behind the first, and it is the one that actually breaks code.
Unlinking a node means telling its **predecessor** to point past it, so you never stop *on* the
target — you stop one node short. That is fine everywhere except at the head, which has no
predecessor at all.

> **Intuition.** The head is the only node in a linked list with nothing in front of it. So every
> operation that might touch the head needs either a special case or a **fake node** standing in
> front of it. This problem is the cleanest place to learn that, because the fake node removes a
> branch you can watch yourself write.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `1 <= number of nodes <= 30` | Thirty nodes. This is a constraint that **unlocks laziness**: two passes, three passes, an array of node pointers — nothing here is measurably slower than anything else, and an `O(n²)` scan would pass too. So the problem is not about speed at all; it is about the *shape* of the one-pass solution, which is why "can you do it in one pass?" is the real question being asked. It also means the list is **never empty**. |
| `1 <= n <= number of nodes` | `n` is promised to be in range, so there is no "n is too large" branch to write — a target always exists. This is the constraint that lets the leader's walk be an unguarded `for _ in range(n)`. Take it away and every rung needs a bounds check. |
| `0 <= node.val <= 100` | Values are inert. No sentinel, no marker trick, and — importantly — **values are not unique**, so you can never identify the target by its value. Everything here is positional. |
| "`n` counts from the END" | Stated because it is the difficulty. A forward-only list has no way to address it, so the whole problem is a change of coordinates. |
| "removing the HEAD is legal" | The constraints spell this out, which is a gift: `n = length` is a legal input, and it is the case that turns three of the four rungs below into two-branch functions. **This is the constraint the dummy node exists for.** |

The worked example traced in every section below is the statement's own, with node labels so that
"the node holding 4" is never ambiguous:

```
n0(1) → n1(2) → n2(3) → n3(4) → n4(5) → ∅        n = 2        answer: [1, 2, 3, 5]
```

`n = 2` counts `n4` as first-from-the-end and `n3` as second, so `n3` is the target and `n2` is the
node that must be rewired. The head case is traced separately in Approach 4, where it matters.

---

## Approach 1: Put the nodes in an array

### The idea

*Why is "nth from the end" hard? Because the list is not indexable.* So make it indexable: walk once
collecting the **node objects** into a Python list, and now `nth from the end` is the ordinary index
`len - n`. *Why is that not the answer?* It allocates an array of `n` pointers to learn one number —
the length — that a counter would have given for free.

### How to think about it

> **Intuition.** You are being asked for a position relative to an end you cannot see, so the first
> instinct is to lay the whole train out on the platform where you can see both ends at once. Once
> it is laid out, the question is trivial arithmetic and you stop thinking. The tell that this is
> wasteful is that you use the array for exactly one thing — its `len` — and then do the relinking
> back on the list itself.

Note what this rung does **not** do: it does not copy values or build new nodes. `nodes[i]` is the
real node, so the relinking is still in place and the caller's nodes are the ones that come back.
That distinction matters here — a version that rebuilt the list from values would be a different
(and worse) answer.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`, `n = 2`.

| Step | array after |
|---|---|
| 1 | `[n0]` |
| 2 | `[n0, n1]` |
| 3 | `[n0, n1, n2]` |
| 4 | `[n0, n1, n2, n3]` |
| 5 | `[n0, n1, n2, n3, n4]` |

| Then | value |
|---|---|
| `len(nodes)` | 5 |
| `target = len - n` | `5 - 2 = 3` → `nodes[3]` is `n3`, the node to remove |
| `target == 0`? | no, so there is a predecessor |
| relink | `nodes[2].next = nodes[3].next`, i.e. `n2 → n4` |

Result `[1, 2, 3, 5]`. The whole array was built to produce the number `3`.

### Code

```python
def remove_nth_from_end_node_array(head: ListNode | None, n: int) -> ListNode | None:
    nodes: list[ListNode] = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    target = len(nodes) - n  # nth from the end is index len - n from the front
    if target == 0:
        return head.next  # the head itself is the target and has no predecessor
    nodes[target - 1].next = nodes[target].next
    return head
```

### Common mistake

> **Watch out.** The misconception is that `target - 1` is safe because `target` is in range. It is —
> but `target` can be **0**, and in Python `nodes[-1]` is not an error, it is the **last** node.
> Where another language hands you an index-out-of-bounds, Python hands you a plausible node at the
> wrong end of the list, and the relink builds a cycle.

Dropping the `if target == 0` guard:

```python
    target = len(nodes) - n
    nodes[target - 1].next = nodes[target].next   # WRONG when target == 0
    return head
```

Measured on `[1, 2, 3, 4, 5]` with `n = 5` — removing the head, a legal input — this sets
`n4.next = n0.next = n1`, so the list runs `1, 2, 3, 4, 5, 2, 3, 4, 5, 2, …` forever. The harness's
read-back helper reports **`RuntimeError: cycle detected while reading the list back`**; without that
step limit it would simply hang. With `n = 2` the same buggy code returns the correct `[1, 2, 3, 5]`,
so the bug is invisible on every input except the one the constraints went out of their way to tell
you about.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Time is one walk to fill the array plus constant-time arithmetic.
Space is `n` pointers — not `n` nodes, which is why it is cheaper than it looks, but still linear in
a problem whose answer is constant.

Use it when you need random access to the list for *several* different reasons — if the task were
"remove the nth from the end, then report the kth from the front, then splice", the array pays for
itself. For this task alone it is the baseline: say it, cost it, and note that the array is doing one
integer's worth of work.

---

## Approach 2: Count, then walk forward

### The idea

*The array was built to learn the length — so just learn the length.* Walk once with a counter, then
walk again to index `len - n - 1`, one node **before** the target, and relink past it. *What does it
fix?* It drops the `O(n)` array for a single integer, making the space constant. *What does it still
cost?* Two passes, and it cannot take its first useful step until the whole list has been measured.

### How to think about it

> **Intuition.** Walk the train once with a tally counter, then walk it again knowing how long it is.
> The arithmetic is where every off-by-one lives, so do it out loud: the target is at index
> `len - n` counting from zero, so its predecessor is at `len - n - 1`, so you take exactly
> `len - n - 1` steps from the head. Say "minus one because I must stop *before* the node I am
> deleting" every time you write it.

The head case now becomes visible as a branch. If `len == n` the target is index 0 and there is no
predecessor to walk to, so the function returns `head.next` and never enters the loop. **That `if`
is the thing the dummy node will delete in Approach 4** — watch for it.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`, `n = 2`.

**Pass 1 — count:**

| Step | node | `count` after |
|---|---|---|
| 1 | `n0` | 1 |
| 2 | `n1` | 2 |
| 3 | `n2` | 3 |
| 4 | `n3` | 4 |
| 5 | `n4` | 5 |

`count = 5`, and `count == n`? No (5 ≠ 2), so the head is safe.

**Pass 2 — walk `count - n - 1 = 2` steps from the head:**

| Step | `node` |
|---|---|
| start | `n0` (1) |
| 1 | `n1` (2) |
| 2 | `n2` (3) ← the predecessor |

Relink `n2.next = n2.next.next`, i.e. `n2 → n4`. Result `[1, 2, 3, 5]`.

### Code

```python
def remove_nth_from_end_count_then_walk(head: ListNode | None, n: int) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    if count == n:
        return head.next  # the head is the target: the branch the dummy will delete
    node = head
    for _ in range(count - n - 1):  # stop one node BEFORE the target
        node = node.next
    node.next = node.next.next
    return head
```

### Common mistake

> **Watch out.** The misconception is that you walk to the target. You walk to the target's
> **predecessor**, because unlinking is something a node's predecessor does to it. Every wrong
> version of this loop is that one sentence not yet internalised.

Writing `range(count - n)` instead of `range(count - n - 1)`:

```python
    for _ in range(count - n):   # WRONG — lands ON the target
        node = node.next
    node.next = node.next.next
```

Measured on `[1, 2, 3, 4, 5]` with `n = 2`, this returns **`[1, 2, 3, 4]`** instead of `[1, 2, 3, 5]`
— it lands on `n3`, the target, and dutifully unlinks the node *after* it. Nothing raises; the list
is still valid and still one node shorter, so a test that only checks the length passes. And when
`n = 1` the same bug walks to the last node and dereferences `node.next.next` on `None`, so
sometimes it crashes and sometimes it lies. The fix is to say what the loop is for: `-1` because you
stop before.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. Time is two full passes — `2n` node visits, the same asymptotic
class as one. Space is one integer and one pointer.

Use it when you genuinely need the length for something else, or when the list is being streamed
twice anyway. It is also the right answer to give if you are asked to write this with no cleverness
at all: it is obviously correct, easy to read, and constant space. In an interview, write it only as
a stepping stone, because the interviewer's actual question is the one-pass version — the two-pass
solution is what they are hoping you will improve on.

---

## Approach 3: One pass, a gap of `n`, head special-cased *(an addition — not in the data file)*

### The idea

*Both rungs so far need the length before they can act — could the length measure itself while you
walk?* Yes. Send a **leader** `n` nodes ahead of a **follower** and then move both in step. When the
leader reaches the last node, the follower is standing exactly `n` nodes from the end, because the
gap between them never changed. *What does it fix?* Two passes become one, with two pointers instead
of a counter.

### How to think about it

> **Intuition.** Hold a stick of length `n` with one hand at each end and slide it along the train.
> You do not need to know how long the train is — you need to know when the front hand runs out of
> train, and at that instant the back hand is `n` carriages from the end by construction. The stick
> *is* the arithmetic. This is the whole idea of the problem and it is worth over-learning, because
> "convert a distance from the end into a distance from the front" is the same move in
> *middle-of-list*, in *cycle-detect*, and in every rotate-by-`k` problem.

> **Why it works.** The invariant is a single sentence: **after the gap is opened, the leader is
> always exactly `n` nodes ahead of the follower**, because every iteration advances both by one. The
> loop ends when `leader.next is None`, i.e. the leader is on the last node — position `len - 1`
> counting from zero. So the follower is at `len - 1 - n`, which is one before `len - n`, which is
> the target. The `-1` in the arithmetic of Approach 2 has become the choice of `leader.next` rather
> than `leader` in the loop condition.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`, `n = 2`.

| Stage | `leader` | `follower` | gap |
|---|---|---|---|
| start | `n0` (1) | `n0` (1) | 0 |
| open gap, step 1 | `n1` (2) | `n0` (1) | 1 |
| open gap, step 2 | `n2` (3) | `n0` (1) | 2 |
| `leader` is not `None`, so the head is safe | | | |
| walk 1 | `n3` (4) | `n1` (2) | 2 |
| walk 2 | `n4` (5) | `n2` (3) | 2 |

`leader.next` is `None`, so the loop stops with `follower` on `n2`. Relink `n2.next = n4`. Result
`[1, 2, 3, 5]`.

Now the case this rung has to branch for — the same list with `n = 5`:

| Stage | `leader` | `follower` |
|---|---|---|
| start | `n0` | `n0` |
| after 5 gap steps | `None` | `n0` |

The leader fell off the end **while opening the gap**, which is exactly the signal "the head is the
target" — and the function must return `head.next` before touching `leader.next`.

### Code

```python
def remove_nth_from_end_gap_no_dummy(head: ListNode | None, n: int) -> ListNode | None:
    leader = head
    for _ in range(n):
        leader = leader.next
    if leader is None:
        return head.next  # the gap swallowed the whole list, so the head is the target
    follower = head
    while leader.next is not None:
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return head
```

### Common mistake

> **Watch out.** The misconception is that the `if leader is None` check is defensive
> programming — a guard against bad input. It is not: `n = length` is a **promised legal input**, and
> that branch is the *entire* head case. Delete it and you have not removed a safety net, you have
> removed a feature.

```python
    leader = head
    for _ in range(n):
        leader = leader.next
    follower = head
    while leader.next is not None:   # WRONG — leader may already be None
```

Measured on `[1, 2, 3, 4, 5]` with `n = 5`, the buggy version raises **`AttributeError: 'NoneType'
object has no attribute 'next'`**. With `n = 2` it returns the correct `[1, 2, 3, 5]`. So it is
correct on 4 of the 5 legal values of `n` for this input, and the constraints told you about the
fifth in advance.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. Time is one pass: the leader visits every node exactly once and
the follower visits `len - n` of them, so at most `2n` pointer moves and only one traversal of the
structure. Space is two pointers.

Use it when the list is a **stream** you can only read once — that is the situation where one pass is
not an optimization but a requirement, and this shape is the reason the technique exists. For this
problem, though, it still carries a branch that the next rung deletes, and that branch is where bugs
live.

---

## Approach 4: One pass, a gap of `n`, and a dummy in front of the head

### The idea

*The head keeps needing a special case because it has no predecessor — so give it one.* Allocate one
throwaway node whose `next` is the head, start **both** pointers there, and every node in the list
— head included — now has a predecessor the loop can reach. *What does it fix?* It deletes the head
branch from Approach 3, and it does so without a single conditional: the answer is whatever
`dummy.next` holds at the end, which is correct whether the head survived or not.

### How to think about it

> **Intuition.** The train has no coupling at the front, so bolt on an empty locomotive. Now every
> carriage including the first is "the carriage after something", and the uncomfortable question
> "what if the thing I want to delete is the first thing?" stops existing. At the end you do not ask
> whether the head changed — you ask the locomotive what it is now pulling. That is the entire trick,
> and it is the single most reusable idea in linked lists: *whenever an operation can affect the
> head, put a fake node in front and return its `next`.*

> **Why it works.** Starting both pointers at `dummy` shifts the whole coordinate system back by
> one. The leader now stops on the real last node with the follower `n` behind it — which, counting
> `dummy` as position `-1`, puts the follower at the target's predecessor for **every** `n` in
> `1..len`, including `n = len` where that predecessor *is* the dummy. The head case did not get
> handled; it stopped being a case.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`, `n = 2`. `dummy → n0` is prepended first, and both pointers
start on `dummy`.

| Stage | `leader` | `follower` | `leader.next` |
|---|---|---|---|
| start | `dummy` | `dummy` | `n0` |
| open gap, step 1 | `n0` (1) | `dummy` | `n1` |
| open gap, step 2 | `n1` (2) | `dummy` | `n2` |
| walk 1 | `n2` (3) | `n0` (1) | `n3` |
| walk 2 | `n3` (4) | `n1` (2) | `n4` |
| walk 3 | `n4` (5) | `n2` (3) | `None` → stop |

Relink `n2.next = n4`, return `dummy.next` = `n0`. Result `[1, 2, 3, 5]`.

And the head case, same list with `n = 5`, where the gap alone reaches the end:

| Stage | `leader` | `follower` | `leader.next` |
|---|---|---|---|
| start | `dummy` | `dummy` | `n0` |
| after 5 gap steps | `n4` (5) | `dummy` | `None` → the walk loop never runs |

Relink `dummy.next = n1`, return `dummy.next` = `n1`. Result `[2, 3, 4, 5]` — **with no branch
anywhere in the function.** Compare that with Approach 3's table for the same input, where the leader
became `None` and an `if` had to catch it. One extra node bought one deleted branch, and the branch
was the one that broke.

### Code

```python
def remove_nth_from_end_dummy_gap(head: ListNode | None, n: int) -> ListNode | None:
    dummy = ListNode(0, head)
    leader = dummy
    follower = dummy
    for _ in range(n):
        leader = leader.next
    while leader.next is not None:  # leader.next, not leader: stop ONE short of the end
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return dummy.next  # not `head` — the head may be the node that just left
```

### Common mistake

> **Watch out.** Two misconceptions share this rung, and they are the same misconception twice:
> **`head` is a variable, not the list.** Returning `head` after unlinking the head hands back a
> node that is no longer in the list but still points into it — so the deleted node resurrects
> itself. And walking `while leader is not None` instead of `while leader.next is not None` takes the
> follower one step too far, landing it on the target.

```python
    while leader.next is not None:
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return head            # WRONG — say dummy.next
```

Measured on `[1, 2, 3, 4, 5]` with `n = 5`: `dummy.next` is correctly set to `n1`, but `n0.next` was
never changed, so returning `head` yields **`[1, 2, 3, 4, 5]`** — the original list, entirely
unchanged, with the "removal" invisible. With `n = 2` the same code returns the correct
`[1, 2, 3, 5]`, because there the head is not involved. A function that silently does nothing on one
input is worse than one that crashes.

And the loop-condition variant:

```python
    while leader is not None:      # WRONG — one step too far
        leader = leader.next
        follower = follower.next
```

Measured: `n = 2` gives **`[1, 2, 3, 4]`** (removes `n4` instead of `n3`), and `n = 5` gives
**`[1, 3, 4, 5]`** (removes `n1` instead of `n0`). Both off by exactly one position, both silent. The
memorable version of the rule: **the leader stops on the last node, not past it, because the
follower's job is to stop before the target.**

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. Time is one traversal: `n` pointer moves to open the gap and
`len - n` iterations moving two pointers, so `2·len` pointer writes and one pass over the structure.
Space is one extra node plus two pointers — and the node is `O(1)`, allocated once regardless of
length.

**This is the one to write.** It is one pass, constant space, and — the part that matters more than
either — it has **no conditional branches at all**, which is why it is the version that is correct
the first time. In C++ the dummy is usually a stack local (`ListNode dummy(0, head);`) so it costs
nothing to allocate and nothing to free, which is exactly how the data file's C++ spells it.

---

## The Overall Arc

Every rung here performs the same change of coordinates — **turn a distance from the end into a
distance from the front** — and the ladder is the story of that conversion getting cheaper, followed
by a twist that has nothing to do with cost. The array version does the conversion by making the
list indexable: lay every node pointer out in a row, and `nth from the end` becomes `len - n`, plain
arithmetic. Its weakness is that the entire array exists to produce one integer, the length, so the
next rung throws the array away and counts: one pass to measure, one pass to walk to `len - n - 1`,
constant space, obviously correct — and unable to take a single useful step until it has seen the
last node, which is fatal if the list is a stream you may only read once. That is what the two-pointer
gap fixes, and it fixes it by replacing arithmetic with **geometry**: hold two pointers exactly `n`
apart and slide them together, and when the leader runs out of list the follower is standing `n` from
the end because the gap never changed — the length measured itself along the way, and one pass is
enough. But now the twist, and it is the actual subject of the problem: none of that is where the
bugs are. The bugs are all at the **head**, because unlinking a node is something its predecessor
does, the head has no predecessor, and removing the head is a legal input the constraints
deliberately spell out. Three of the four rungs carry an explicit branch for it — `if target == 0`,
`if count == n`, `if leader is None` — and each of those branches is the one place their authors
tested least. The last rung deletes all of them with one throwaway node in front of the head: now
every node has a predecessor, the gap arithmetic works unchanged for every legal `n` including
`n = len`, and the answer is read off `dummy.next` rather than asked about. That is the habit to
carry away, and it is bigger than this problem — **whenever an operation can affect the head, invent
a node in front of it and return that node's `next`** — because it is the same move that turns
*remove-list-elements* into a single loop, turns *swap-pairs* into a single loop, and makes
*merge-two-sorted* stop caring which list was shorter.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Node array | `O(n)` | `O(n)` | Buys random access to learn one integer; `nodes[-1]` silently means the wrong end | You need indexed access for several operations, not just this one |
| Count, then walk | `O(n)` | `O(1)` | Two passes, and no action possible until the whole list is measured | The length is wanted anyway; you want the plainest possible code |
| Gap, head special-cased | `O(n)` | `O(1)` | One pass, at the price of an explicit head branch that is easy to omit | A read-once stream, in a language where the extra node is awkward |
| **Gap + dummy node** | **`O(n)`** | **`O(1)`** | **One extra node buys away every conditional in the function** | **Always, for this problem** |

---

## Interview Priority

> **In an interview.** Name the conversion before writing anything: *"a forward-only list cannot
> address the end, so I need to turn a distance from the back into a distance from the front."* Offer
> count-then-walk in one sentence, then say *"but I can do it in one pass with a gap of `n`"* and
> write Approach 4 — **with the dummy from the start**, not bolted on after the interviewer asks
> "what if `n` is the length?" Then say the two sentences that show you understand your own code:
> `leader.next is not None` stops the leader on the last node so the follower stops before the
> target, and `return dummy.next` is what makes the head case disappear.

**Memorize cold — the dummy node pattern.** Not this problem: the *pattern*. `dummy = ListNode(0,
head)`, do the work from `dummy`, `return dummy.next`. It is three tokens of code and it deletes an
entire class of bug from every list problem that can touch the head. If you learn one thing from this
problem, learn this, because it is the thing being tested.

**Memorize cold — the two-pointer gap.** Open a gap of `n`, then move both until the leader falls
off; the follower is `n` from the end. The reason to have it as a reflex rather than a derivation is
that the derivation is where the off-by-one lives — `leader` versus `leader.next` in the loop
condition — and under pressure people re-derive it wrong. Measured, getting it wrong returns a list
of the right *length* with the wrong node missing, which no casual check catches.

**Worth understanding, not memorizing — count, then walk.** Say it to establish the baseline, and be
able to write `count - n - 1` while explaining the `-1` out loud. Its real value is rhetorical: it
gives you something to improve on, and "can you do it in one pass?" is a follow-up you should be
inviting rather than receiving.

**Not worth memorizing — the node array.** Name it, cost it at `O(n)` space, and move on. The one
thing worth keeping from it is the Python-specific trap: `nodes[target - 1]` with `target == 0`
silently reaches the *last* node and builds a cycle, where a stricter language would have thrown.

---

## Full Runnable Script

`ListNode`, `build`, `to_list` and `to_nodes` are **scaffolding, not part of the answer** — an
interviewer hands you a `head` and a node class that already exists; these only let this file build
inputs from ordinary Python lists and read results back. `to_list` and `to_nodes` both carry a step
limit, because the off-by-one in Approach 1's "common mistake" really does build a cycle, and a
harness that hangs teaches nothing. `to_nodes` exists for a second reason: every approach here
promises to **relink the caller's nodes** rather than rebuild the list, and the suite checks that node
by node, not just by value.

The suite covers both statement examples, the worked example, removing the head of a long list,
removing the tail, both nodes of a two-node list, a list where every value is identical (so the
answer cannot be found by value), the value range's ends, the longest list the constraints allow, and
120 randomised cases at every length up to the stated ceiling of 30 with a random legal `n`. Every
case is cross-checked against every other approach and against the ground truth computed by slicing.

```python
"""Remove the nth Node From the End — every approach in one file, cross-checked.

Run:  python remove_nth_from_end.py
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


def to_list(head: ListNode | None, limit: int = 200_000) -> list[int]:
    """Scaffolding: read a list back out. `limit` guards against a bug that
    left a cycle behind — the off-by-one below really does build one."""
    out: list[int] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node.val)
        node = node.next
    return out


def to_nodes(head: ListNode | None, limit: int = 200_000) -> list[ListNode]:
    """Scaffolding: the node OBJECTS in order, so a test can check that the
    surviving nodes are the ones handed in rather than copies of them."""
    out: list[ListNode] = []
    node = head
    while node is not None:
        if len(out) > limit:
            raise RuntimeError("cycle detected while reading the list back")
        out.append(node)
        node = node.next
    return out


# ------------------------------------------- approach 1: put the nodes in an array
def remove_nth_from_end_node_array(head: ListNode | None, n: int) -> ListNode | None:
    nodes: list[ListNode] = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    target = len(nodes) - n  # nth from the end is index len - n from the front
    if target == 0:
        return head.next  # the head itself is the target and has no predecessor
    nodes[target - 1].next = nodes[target].next
    return head


# --------------------------------------- approach 2: count, then walk to len - n - 1
def remove_nth_from_end_count_then_walk(head: ListNode | None, n: int) -> ListNode | None:
    count = 0
    node = head
    while node is not None:
        count += 1
        node = node.next
    if count == n:
        return head.next  # the head is the target: the branch the dummy will delete
    node = head
    for _ in range(count - n - 1):  # stop one node BEFORE the target
        node = node.next
    node.next = node.next.next
    return head


# ------------------------------- approach 3: one pass, a gap of n, head special-cased
def remove_nth_from_end_gap_no_dummy(head: ListNode | None, n: int) -> ListNode | None:
    leader = head
    for _ in range(n):
        leader = leader.next
    if leader is None:
        return head.next  # the gap swallowed the whole list, so the head is the target
    follower = head
    while leader.next is not None:
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return head


# -------------------------------- approach 4: one pass, a gap of n, dummy in front
def remove_nth_from_end_dummy_gap(head: ListNode | None, n: int) -> ListNode | None:
    dummy = ListNode(0, head)
    leader = dummy
    follower = dummy
    for _ in range(n):
        leader = leader.next
    while leader.next is not None:  # leader.next, not leader: stop ONE short of the end
        leader = leader.next
        follower = follower.next
    follower.next = follower.next.next
    return dummy.next  # not `head` — the head may be the node that just left


APPROACHES = [
    ("node_array", remove_nth_from_end_node_array),
    ("count_then_walk", remove_nth_from_end_count_then_walk),
    ("gap_no_dummy", remove_nth_from_end_gap_no_dummy),
    ("dummy_gap", remove_nth_from_end_dummy_gap),
]


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 2, 3, 4, 5], 2),
        ("statement example, the only node", [1], 1),
        ("worked example", [1, 2, 3, 4, 5], 2),
        ("remove the head of a long list", [1, 2, 3, 4, 5], 5),
        ("remove the tail", [1, 2, 3, 4, 5], 1),
        ("two nodes, remove the first", [1, 2], 2),
        ("two nodes, remove the second", [1, 2], 1),
        ("duplicate values", [7, 7, 7, 7], 3),
        ("upper end of the value range", [0, 100, 0], 2),
        ("the longest list the constraints allow", list(range(30)), 17),
    ]

    rng = random.Random(20260912)
    for _ in range(120):
        n_nodes = rng.randint(1, 30)  # the constraint's ceiling
        values = [rng.randint(0, 100) for _ in range(n_nodes)]
        n = rng.randint(1, n_nodes)
        cases.append((f"stress len={n_nodes} n={n}", values, n))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    identity_ok = True

    for label, values, n in cases:
        loud = len(values) <= 10 and not label.startswith("stress")
        if loud:
            print(f"\n{label}: {values}, n={n}")
        results = []
        for name, fn in APPROACHES:
            head = build(values)  # every approach rewires its input, so rebuild per run
            before = to_nodes(head)
            got_head = fn(head, n)
            got = to_list(got_head)
            results.append(got)
            # the surviving nodes must be the ORIGINAL objects minus one, in order
            expected_nodes = before[: len(values) - n] + before[len(values) - n + 1 :]
            if to_nodes(got_head) != expected_nodes:
                identity_ok = False
                print(f"  !! {name} did not return the original node objects")
            if loud:
                print(f"  {name:<{width}} -> {got}")
        expected = values[: len(values) - n] + values[len(values) - n + 1 :]
        if any(r != results[0] for r in results) or results[0] != expected:
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: {results}, expected {expected}")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "every approach relinked the original nodes rather than rebuilding the list."
        if identity_ok
        else "IDENTITY FAILURE: an approach returned nodes the caller never handed in."
    )
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed and identity_ok
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
