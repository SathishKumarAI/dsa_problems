# Is This a Valid BST? — Explained

## Understanding the Problem

A binary search tree is not a rule about a node and its children. It is a rule about a node and
**every ancestor above it**: everything in a left subtree is strictly smaller than the node it hangs
from, everything in a right subtree strictly larger — no matter how far down it sits.

Almost everyone writes the local version first:

```
        5
       / \
      1   8
         / \
        4   9        4 < 8, so the local check is happy
                     but 4 is in 5's RIGHT subtree, and 4 < 5.  INVALID.
```

`root = [5, 1, 8, null, null, 4, 9]`. Every parent-child pair is individually fine. The tree is not.
Measured, the parent-child check returns **`True`** here where the answer is `False`.

**The core question:** *how does a node learn about constraints imposed by ancestors it cannot see?*
There are exactly two answers, and the whole ladder is those two answers and their costs:

1. **Use a consequence.** A BST read in order is strictly increasing. Check the ordering instead of
   the rule.
2. **State the invariant.** Carry the allowed interval down the recursion, tightening it at every
   step, so a node is checked against all of its ancestors at once.

> **Intuition.** The BST rule is inherited. When you step **left**, every value below must be smaller
> than the node you just left — a new ceiling. When you step **right**, a new floor. A node is legal
> when it sits inside the window that all of its ancestors have narrowed for it.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `1 <= node count <= 10^4` | The tree is never empty — but it can be a **spine of 10 000**, which is a legal *and valid* BST, and which every recursive rung below fails on |
| `-2^31 <= node.val <= 2^31 - 1` | The values reach the 32-bit limits, so `-2^31` is a **real value**, not a safe sentinel. This single line is why the bounds approach must open with true infinities |
| left subtree strictly less, right strictly greater | **Strictly.** Duplicates are invalid, and `<=` anywhere in your comparison quietly accepts them |
| the bound is inherited, not local | The whole problem, stated in the constraints |

Two trees run through this document: `[5, 1, 8]`, valid, and `[5, 1, 8, null, null, 4, 9]`, the deep
violation above.

---

## Approach 1: Read the tree in order, then check it is sorted

### The idea

*The rule is hard to check directly, but it has a consequence that is easy to check.* An in-order
traversal of a valid BST — left subtree, node, right subtree — visits the values in strictly
increasing order. So flatten the tree in order and test the list.

### How to think about it

> **Intuition.** In-order is the traversal that reads a BST the way it was meant to be read: from the
> smallest thing to the largest. Once the tree is a list, "is this a BST?" becomes "is this list
> sorted?", which nobody gets wrong.

Be clear-eyed about what has happened: this is correct, but it verifies a *symptom*. If you cannot
say why in-order order implies the BST property, you are trusting a coincidence.

### Worked example

On the deep violation:

| Traversal step | Node | Values so far |
|---|---|---|
| left subtree of `5` | `1` | `[1]` |
| the root | `5` | `[1, 5]` |
| into `8`, first its left | `4` | `[1, 5, 4]` ← **already broken** |
| the node | `8` | `[1, 5, 4, 8]` |
| its right | `9` | `[1, 5, 4, 8, 9]` |

`5` followed by `4` is the violation, and notice *where* it appears: the two values are not parent and
child, nor even close in the tree. They are in-order neighbours, which is precisely the relationship
the naive parent-child check cannot see.

### Code

```python
def is_valid_inorder_list(root: Optional[TreeNode]) -> bool:
    """A BST read in order is strictly increasing. Collect, then check."""
    values: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        values.append(node.val)
        walk(node.right)

    walk(root)
    return all(values[i] < values[i + 1] for i in range(len(values) - 1))
```

### Common mistake

> **Watch out.** `<=` instead of `<`. The statement says *strictly* smaller and *strictly* larger, so
> duplicates are invalid — and the `<=` version accepts all three shapes of duplicate: measured,
> `[2, 2]`, `[2, 1, 2]` and `[2, null, 2]` all return **`True`** where the answer is `False`. The
> misconception is importing a convention from elsewhere; some BST definitions do allow duplicates on
> one side. This one does not, and the constraint says so.

> **Watch out.** Checking a **pre-order** or **level-order** reading for sortedness. Only in-order has
> this property, and only in-order is a consequence of the rule rather than an accident of layout.

### Complexity and when to use this

- **Time — `O(n)`.**
- **Space — `O(n)`** for the list, plus `O(h)` of frames. The list is built in full before the first
  comparison, so an invalid tree costs as much as a valid one.

**When it is right:** when the sorted sequence is useful for something else — finding the `k`-th
smallest, recovering a swapped pair, printing the values in order.

---

## Approach 2: The same walk, keeping only the previous value  *(an addition — not in the data file's ladder)*

### The idea

*Nothing in the check needs the whole list — only each value and the one before it.* Keep a single
`prev` and compare as you go. The list disappears.

### How to think about it

> **Intuition.** Reading the values off a conveyor belt. To know whether the sequence is increasing
> you never need more than the last item you saw. Everything earlier has already been judged.

### Worked example

On the deep violation:

| Visit order | `prev` before | `node.val` | Test | Outcome |
|---|---|---|---|---|
| `1` | `None` | `1` | first value | `prev = 1` |
| `5` | `1` | `5` | `1 < 5` | `prev = 5` |
| `4` | `5` | `4` | `5 >= 4` | **`False`** — stop |

Three nodes visited instead of five, and no list built.

### Code

```python
def is_valid_inorder_streaming(root: Optional[TreeNode]) -> bool:
    """Only the previous value matters, so keep only the previous value."""
    prev: Optional[int] = None
    ok = True

    def walk(node: Optional[TreeNode]) -> None:
        nonlocal prev, ok
        if node is None or not ok:
            return
        walk(node.left)
        if prev is not None and prev >= node.val:
            ok = False
            return
        prev = node.val
        walk(node.right)

    walk(root)
    return ok
```

### Common mistake

> **Watch out.** Initialising `prev` to `float("-inf")` is fine; initialising it to `0`, or to
> `-2**31`, is not. Values reach the 32-bit minimum, so a tree whose smallest value *is* `-2^31`
> compares `-2**31 >= -2**31` and is rejected. `None` for "nothing seen yet" sidesteps the question
> entirely, which is why this version uses it.

> **Watch out.** Making `prev` a plain local inside the recursive helper instead of a `nonlocal`.
> Each call then gets its own copy, the comparison is always against a fresh value, and the function
> happily returns `True` for trees it should reject. The state must survive the whole traversal, not
> one frame of it.

### Complexity and when to use this

- **Time — `O(n)`,** and it stops at the first violation.
- **Space — `O(h)`.** No list.

**When it is right:** whenever you were going to use in-order anyway. It is strictly better than
approach 1 unless the sorted values are wanted.

---

## Approach 3: Carry the allowed interval down the tree

### The idea

*Both approaches above verify a consequence of the rule. This one enforces the rule.* Every node
arrives with an open interval `(low, high)` it must fall inside. Going left tightens the ceiling to
the node's value; going right raises the floor to it. By the time a node is checked, every ancestor
constraint is already folded into its two numbers.

### How to think about it

> **Intuition.** Each step down narrows a window. Start at `(-∞, +∞)` — anything goes. Step left from
> `5` and the window becomes `(-∞, 5)`: everything down here must be below `5`, forever, however deep.
> Step right from `8` inside that and it becomes `(8, ...)`. A node is valid exactly when it lies
> inside its window, and the window *is* the list of every ancestor's demand, compressed into two
> numbers.

> **Why it works.** The BST property says a node must be less than every ancestor it is left of, and
> greater than every ancestor it is right of. Only the **tightest** of those bounds can ever bind —
> the largest lower bound and the smallest upper bound — and tightening the interval on the way down
> maintains exactly that pair. So checking `low < val < high` at each node checks all of its ancestors
> at once, which is why this is the version that states the invariant rather than a symptom of it.

### Worked example

On the deep violation. Intervals shown as they arrive:

| Node | Interval on arrival | Test | Result |
|---|---|---|---|
| `5` | `(-∞, +∞)` | inside | descend |
| `1` | `(-∞, 5)` | inside | descend |
| `8` | `(5, +∞)` | inside | descend |
| `4` | `(5, 8)` | `5 < 4` is false | **`False`** |

Row 4 is the whole point: the interval `(5, 8)` remembers the root, three levels up, which the
parent-child check had already forgotten.

### Code

```python
def is_valid_bounds(root: Optional[TreeNode]) -> bool:
    """A node must sit inside the window its ancestors have narrowed."""

    def valid(node: Optional[TreeNode], low: float, high: float) -> bool:
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)

    return valid(root, float("-inf"), float("inf"))
```

The chained comparison `low < node.val < high` is one expression in Python and reads exactly like the
invariant — worth preferring over two `and`ed comparisons for that reason alone.

### Common mistake

> **Watch out.** Opening with integer sentinels — `valid(root, -2**31, 2**31 - 1)`. The constraints
> allow a node to *hold* those values, so the sentinel collides with real data. Measured: a tree whose
> only node is `-2^31` returns **`False`**, and so does one whose only node is `2^31 - 1`, and so does
> `[0, -2^31, 2^31 - 1]`. All three are valid BSTs. The misconception is that a sentinel needs to be
> big; it needs to be **impossible**, and `float("-inf")` is.

In Java or C++ this is why the bounds are taken as `double`/`long` rather than `int` — the same trap
in a different costume.

> **Watch out.** Passing `node.val` down on the wrong side: giving the left child `(low, high)`
> unchanged, or giving the right child `(low, node.val)`. It degenerates into a weaker check that
> accepts some invalid trees, and it is silent. The rule is that the side you descend **replaces the
> bound you crossed**.

### Complexity and when to use this

- **Time — `O(n)`,** short-circuiting at the first out-of-window node.
- **Space — `O(h)`.**

**When it is right:** as the answer, and especially in an interview, because it is the version that
demonstrates you understand the property rather than a side effect of it.

---

## Approach 4: In-order without the call stack  *(an addition — not in the data file's ladder)*

### The idea

*The tree may be a spine of `10 000` — a legal, valid BST.* CPython stops at `1 000` frames, so every
recursive rung above raises `RecursionError` on an input this problem explicitly permits. The
iterative in-order walk is the same algorithm with a stack you own.

### How to think about it

> **Intuition.** The classic in-order loop has two moves. *Go left as far as you can*, stacking every
> node you pass, because in-order owes the leftmost node first. Then *pop* — that node is next in
> order — and turn right once, repeating. The stack holds exactly the ancestors you still owe a visit.

### Worked example

On `[5, 1, 8]`:

| Step | Stack | `node` | Action | `prev` |
|---|---|---|---|---|
| 1 | `[]` | `5` | push `5`, go left | — |
| 2 | `[5]` | `1` | push `1`, go left | — |
| 3 | `[5, 1]` | `None` | pop `1`, visit | `1` |
| 4 | `[5]` | `1.right = None` | pop `5`, visit — `1 < 5` ok | `5` |
| 5 | `[]` | `8` | push `8`, go left, pop, visit — `5 < 8` ok | `8` |

### Code

```python
def is_valid_iterative(root: Optional[TreeNode]) -> bool:
    """In-order with an explicit stack: survives a tree taller than the frame limit."""
    prev: Optional[int] = None
    stack: list[TreeNode] = []
    node = root
    while stack or node:
        while node:                      # in-order owes the leftmost node first
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev is not None and prev >= node.val:
            return False
        prev = node.val
        node = node.right                # one step right, then go left again
    return True
```

### Common mistake

> **Watch out.** Writing the loop condition as `while stack:` alone. At the start the stack is empty
> and `node` is the root, so the loop body never runs and every tree is reported valid. Both parts of
> `while stack or node` are load-bearing: `node` carries the "there is somewhere still to descend"
> state that the stack does not hold.

### Complexity and when to use this

- **Time — `O(n)`.** **Space — `O(h)`.**
- On a valid BST shaped like a spine of `10 000` nodes: the three recursive approaches raise
  `RecursionError: maximum recursion depth exceeded`; this one returns **`True`**.

**When it is right:** whenever the input can be deep — which, under this problem's own constraints, is
whenever the input is real.

---

## The Overall Arc

Everything here follows from one fact about the BST rule: it is **inherited, not local**. A node is
bounded by every ancestor above it, so the check people write first — each node against its two
children — is not a rough approximation but a different property altogether, and it accepts
`[5, 1, 8, null, null, 4, 9]`, where a `4` buried under the root's right child breaks a rule set three
levels up. From there, two honest routes. The first uses a consequence: a BST read in order is
strictly increasing, so flatten and check sortedness — correct, and a little unsatisfying, because it
verifies a symptom and leaves the rule looking like a coincidence you are trusting. It also keeps a
list it never needs, since testing an increasing sequence requires only the previous value, and
dropping the list costs nothing and buys an early exit. The second route states the invariant
directly: hand every node the open interval its ancestors have narrowed, tighten the ceiling when you
go left and the floor when you go right, and a single `low < val < high` enforces every ancestor at
once — which is the same information travelling **down** the recursion that a post-order return
carries **up**, and between those two directions most tree questions are covered. The sting is in the
constraints rather than the algorithm: values reach the 32-bit limits, so the opening bounds must be
true infinities or the sentinel collides with real data and rejects a one-node tree; and `10^4` nodes
with no balance promised means the elegant recursion dies on a valid input, leaving the iterative
in-order walk — the same algorithm, on a stack that does not run out — as the only rung that answers
every legal question.

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| In-order into a list | `O(n)` | `O(n)` | Verifies a consequence; keeps values it does not need | The sorted values are wanted too |
| In-order streaming | `O(n)`, early exit | `O(h)` | Same idea, one variable | You were going to walk in order anyway |
| Bounds passed down | `O(n)`, early exit | `O(h)` | States the invariant itself | Default — and the best interview answer |
| Iterative in-order | `O(n)` | `O(h)` | Frames you control | The tree may be deeper than the frame limit |

## Interview Priority

**Know cold:** the bounds version. It is the one that shows you understand what a BST *is*, and the
one-sentence justification — "each node must sit inside the window its ancestors narrowed; left
tightens the ceiling, right raises the floor" — is the answer to the question behind the question.

**Know cold, too:** in-order streaming, because the follow-ups live there. *Find the `k`-th smallest*
is this walk with a counter; *two nodes were swapped, fix the tree* is this walk remembering where the
order broke.

**Understand, do not memorise:** the list version (say it, then improve it) and the iterative walk
(have it ready for "what if the tree is a chain of ten thousand?").

> **In an interview.** Volunteer the counterexample before you are asked for it: "comparing each node
> with its children is not enough — `[5, 1, 8, null, null, 4, 9]` passes that check and is not a BST."
> Then mention the sentinel: "I will open with negative and positive infinity rather than the integer
> limits, because the values reach those limits." Two sentences, and you have pre-empted both traps
> the problem is made of.

## Full Runnable Script

`TreeNode`, `build`, `to_values`, `bst_chain`, `random_tree` and `random_bst` are **scaffolding, not
part of the answer.** `random_bst` inserts distinct values the ordinary way, so it produces trees that
are valid *by construction* — without it the random half of the stress test would be almost entirely
invalid trees and would never exercise the `True` path.

The `_bug_*` functions are the mistakes from each section, executed: the parent-child check that
accepts the deep violation, the integer sentinels that reject three valid trees, and the `<=`
comparison that accepts all three shapes of duplicate.

```python
"""Is This a Valid BST? — every approach in one file, cross-checked.

Run:  python validate_bst.py
"""

from __future__ import annotations

import random
import sys
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
    """Level-order list with `None` holes -> tree, so tests can be written as lists."""
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


def to_values(root: Optional[TreeNode]) -> list[Optional[int]]:
    """Tree -> level-order list, trimmed. Only used to print a disagreement."""
    if root is None:
        return []
    out: list[Optional[int]] = []
    queue: deque[Optional[TreeNode]] = deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def bst_chain(n: int) -> TreeNode:
    """A VALID BST shaped like a spine — the legal input every recursive rung fails on."""
    root = TreeNode(0)
    node = root
    for v in range(1, n):
        node.right = TreeNode(v)
        node = node.right
    return root


def random_tree(n: int, rng: random.Random,
                values: tuple[int, ...] = (1, 2, 3, 4, 5)) -> Optional[TreeNode]:
    """Arbitrary shape and repeated values — almost always an invalid BST."""
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


def random_bst(n: int, rng: random.Random) -> Optional[TreeNode]:
    """Insert distinct values the usual way: valid by construction, so True is exercised."""
    root: Optional[TreeNode] = None
    for v in rng.sample(range(-500, 500), n):
        node = TreeNode(v)
        if root is None:
            root = node
            continue
        cur = root
        while True:
            if v < cur.val:
                if cur.left is None:
                    cur.left = node
                    break
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = node
                    break
                cur = cur.right
    return root


# ------------------------------- approach 1: read in order, then check sorted
def is_valid_inorder_list(root: Optional[TreeNode]) -> bool:
    """A BST read in order is strictly increasing. Collect, then check."""
    values: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        values.append(node.val)
        walk(node.right)

    walk(root)
    return all(values[i] < values[i + 1] for i in range(len(values) - 1))


# ----------------------- approach 2: the same walk, keeping only the previous
def is_valid_inorder_streaming(root: Optional[TreeNode]) -> bool:
    """Only the previous value matters, so keep only the previous value."""
    prev: Optional[int] = None
    ok = True

    def walk(node: Optional[TreeNode]) -> None:
        nonlocal prev, ok
        if node is None or not ok:
            return
        walk(node.left)
        if prev is not None and prev >= node.val:
            ok = False
            return
        prev = node.val
        walk(node.right)

    walk(root)
    return ok


# ------------------------------ approach 3: carry the interval down the tree
def is_valid_bounds(root: Optional[TreeNode]) -> bool:
    """A node must sit inside the window its ancestors have narrowed."""

    def valid(node: Optional[TreeNode], low: float, high: float) -> bool:
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)

    return valid(root, float("-inf"), float("inf"))


# ------------------------------------ approach 4: in-order without the frames
def is_valid_iterative(root: Optional[TreeNode]) -> bool:
    """In-order with an explicit stack: survives a tree taller than the frame limit."""
    prev: Optional[int] = None
    stack: list[TreeNode] = []
    node = root
    while stack or node:
        while node:                      # in-order owes the leftmost node first
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev is not None and prev >= node.val:
            return False
        prev = node.val
        node = node.right                # one step right, then go left again
    return True


# --------------------------------------------------------- the buggy variants
def _bug_parent_child_only(root: Optional[TreeNode]) -> bool:
    """The classic: each node against its two children, forgetting every ancestor."""
    if root is None:
        return True
    if root.left and root.left.val >= root.val:
        return False
    if root.right and root.right.val <= root.val:
        return False
    return _bug_parent_child_only(root.left) and _bug_parent_child_only(root.right)


def _bug_int_sentinels(root: Optional[TreeNode]) -> bool:
    """Bounds opened with the 32-bit limits, which are legal VALUES here."""

    def valid(node: Optional[TreeNode], low: int, high: int) -> bool:
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)

    return valid(root, -2**31, 2**31 - 1)


def _bug_allows_duplicates(root: Optional[TreeNode]) -> bool:
    """In-order with <= instead of <: accepts duplicates the statement forbids."""
    values: list[int] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        walk(node.left)
        values.append(node.val)
        walk(node.right)

    walk(root)
    return all(values[i] <= values[i + 1] for i in range(len(values) - 1))


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], bool]]] = [
    ("inorder-list", is_valid_inorder_list),
    ("inorder-stream", is_valid_inorder_streaming),
    ("bounds", is_valid_bounds),
    ("iterative", is_valid_iterative),
]

INT_MIN = -2**31
INT_MAX = 2**31 - 1
EXAMPLE_1: list[Optional[int]] = [5, 1, 8]
EXAMPLE_2: list[Optional[int]] = [5, 1, 8, None, None, 6, 4]
DEEP_VIOLATION: list[Optional[int]] = [5, 1, 8, None, None, 4, 9]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], bool]] = [
        ("statement example 1", EXAMPLE_1, True),
        ("statement example 2", EXAMPLE_2, False),
        ("deep violation", DEEP_VIOLATION, False),
        ("single node", [1], True),
        ("duplicate on the left", [2, 2], False),
        ("duplicate on the right", [2, None, 2], False),
        ("valid larger tree", [8, 3, 10, 1, 6, None, 14, None, None, 4, 7], True),
        ("two leaves swapped", [8, 3, 10, 1, 6, None, 14, None, None, 7, 4], False),
        ("INT_MIN as the only node", [INT_MIN], True),
        ("both 32-bit limits present", [0, INT_MIN, INT_MAX], True),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, values, expected in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        print(f"\n{label}: {values}   (expected {expected})")
        for name, got in results.items():
            print(f"  {name:<{width}} -> {got}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT: {results}")
        elif next(iter(results.values())) is not expected:
            all_agreed = False
            print("  WRONG: unanimous, but not the expected answer")

    rng = random.Random(20260913)
    for _ in range(400):
        tree = (random_bst(rng.randint(1, 25), rng) if rng.random() < 0.5
                else random_tree(rng.randint(1, 12), rng))
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {to_values(tree)}: {results}")

    print("\n=== the parent-child check, on the same three trees ===")
    for label, values in [("example 1", EXAMPLE_1), ("example 2", EXAMPLE_2),
                          ("deep violation", DEEP_VIOLATION)]:
        got = _bug_parent_child_only(build(values))
        truth = is_valid_bounds(build(values))
        flag = "" if got == truth else "   <- WRONG"
        print(f"  {label:<16} {str(values):<32} says {got!s:<6} answer {truth}{flag}")

    print("\n=== integer sentinels, where the limits are legal values ===")
    for label, values in [("only node is INT_MIN", [INT_MIN]),
                          ("only node is INT_MAX", [INT_MAX]),
                          ("both limits present", [0, INT_MIN, INT_MAX])]:
        print(f"  {label:<22} int sentinels {_bug_int_sentinels(build(values))!s:<6} "
              f"answer {is_valid_bounds(build(values))}")

    print("\n=== <= instead of < ===")
    for values in ([2, 2], [2, 1, 2], [2, None, 2]):
        print(f"  {str(values):<16} accepts {_bug_allows_duplicates(build(values))!s:<6} "
              f"answer {is_valid_bounds(build(values))}")

    print("\n=== a VALID BST shaped like a spine of 10^4 nodes ===")
    print(f"  sys.getrecursionlimit() = {sys.getrecursionlimit()}")
    spine = bst_chain(10_000)
    for name, fn in APPROACHES:
        try:
            print(f"  {name:<16} -> {fn(spine)}")
        except RecursionError as exc:
            print(f"  {name:<16} -> RecursionError: {exc}")

    print(f"\n{len(cases)} listed cases + 400 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
