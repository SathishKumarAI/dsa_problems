# Is the Tree Height-Balanced? — Explained

## Understanding the Problem

A tree is **height-balanced** when, at every single node, the two subtrees hanging off it differ in
height by at most one. Not the root — *every node*. A tree can be immaculately even at the top and
badly lopsided three levels down, and it is still unbalanced.

That word "every" is the entire difficulty, and it is easy to read straight past. Here is a tree that
passes at the root and fails anyway:

```
            1              left subtree height 3, right subtree height 2  -> differ by 1, fine
          /   \
        2       3
       /         \
      4           5         node 2: left height 2, right height 0  -> differ by 2, UNBALANCED
     /
    6
```

`root = [1, 2, 3, 4, null, null, 5, 6]`, and the answer is **false**. A solution that checks the root
and returns is not a nearly-right solution; it is a solution that answers a different question.

**The core question:** *how do you check a property at every node without re-measuring the same
subtrees once per ancestor?* Measuring a height means walking a whole subtree. Do that at every node
and you walk the deep parts of the tree over and over — the cost is not in the checking, it is in the
re-measuring.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `0 <= number of nodes <= 5000` | An empty tree is legal **and balanced**, with height `0`. That is the base case the whole recursion rests on |
| `-10^4 <= node.val <= 10^4` | Values are irrelevant. This is a pure shape question — nothing here ever reads `node.val` |
| the condition must hold at **every** node | The reason a single check at the root is wrong, and the reason a naive solution re-walks subtrees |
| an empty tree is balanced, with height `0` | Fixes the sentinel design below: `0` is a **real, legal height**, so "unbalanced" needs a value that a height can never be — hence `-1` |
| `5000` nodes, no promise of balance | A legal input is a spine `5000` tall. CPython's default frame limit is `1000`, so **every recursive rung here dies on a legal input** — measured at the foot of this document |

> **Intuition.** Every approach below computes the same two numbers at each node — the heights of its
> two subtrees. The entire ladder is about *how many times* you are willing to compute them.

One tree, used in every approach: `root = [3, 9, 20, null, null, 15, 7]`, the balanced one.

```
        3                 heights: left = 1, right = 2, differ by 1  -> balanced
       / \
      9   20              node 20: left = 1, right = 1  -> balanced
         /  \
        15   7            leaves: 0 and 0  -> balanced
```

---

## Approach 1: Judge every node, independently

### The idea

*What does the statement literally ask for?* "The condition holds at every node" — so visit every
node, measure both its subtrees, record a verdict, and require all of them. It is the transcription,
it is correct, and it is the most expensive thing in this document.

### How to think about it

> **Intuition.** Imagine inspecting a building by measuring the height of every wing from the ground
> up, once per floor you are standing on. The measurements are all correct. The absurdity is that you
> walk the same wing from the ground again each time you climb one storey — and nothing about that
> wing changed between climbs.

The waste has a precise shape. Measuring the height at a node costs the size of its subtree, so the
total is the sum of subtree sizes over all nodes — which is the sum of every node's depth. Deep nodes
are re-walked once for each ancestor above them.

### Worked example

Every node judged, on the balanced example:

| Node | Left height | Right height | Difference | Verdict |
|---|---|---|---|---|
| `3` | `1` (just `9`) | `2` (`20` over `15`/`7`) | `1` | ok |
| `9` | `0` | `0` | `0` | ok |
| `20` | `1` (`15`) | `1` (`7`) | `0` | ok |
| `15` | `0` | `0` | `0` | ok |
| `7` | `0` | `0` | `0` | ok |

All five pass, so the tree is balanced. Note the re-measurement: `15` and `7` were each measured
while judging `3`, again while judging `20`, and again as themselves.

### Code

```python
def is_balanced_every_node(root: Optional[TreeNode]) -> bool:
    """The statement transcribed: the condition must hold at EVERY node, so test every node."""
    verdicts: list[bool] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        verdicts.append(abs(height(node.left) - height(node.right)) <= 1)
        walk(node.left)
        walk(node.right)

    walk(root)
    return all(verdicts)
```

The ladder's rung spells the same thing as a plain recursion, binding the three answers to names
before combining them — `here and left and right` rather than `here and is_balanced(left) and …`,
because `and` short-circuits and skipping the children is exactly what approach 2 does. Same
measurements, same count, no list.

### Common mistake

> **Watch out.** Checking the root and stopping — `return abs(height(root.left) - height(root.right))
> <= 1`. On the tree at the top of this document it returns **`True`** where the answer is **`False`**.
> The misconception is that imbalance at a node shows up in the heights above it. It does not: two
> subtrees can be the same height as each other and each be a disaster inside.

The script at the foot searches random trees for a case where the root-only check disagrees with the
truth, and prints the one it finds. It finds one within a few thousand small trees, so this is not a
contrived worry — it is most unbalanced trees you would draw by accident.

### Complexity and when to use this

- **Time — `O(n · h)`, and that is genuinely `O(n²)` on a spine.** Measured `height()` entries on a
  left spine: `2 550` at `n = 50`, `10 100` at `n = 100`, `40 200` at `n = 200`, `160 400` at
  `n = 400`. Four times the work for twice the nodes, which is the signature of quadratic growth.
- **Space — `O(h)`** for the recursion, plus the verdict list.

**When it is right:** when you want every node's verdict, not just the tree's — "list the unbalanced
nodes" is this function with the `all()` removed.

---

## Approach 2: Stop at the first failure  *(an addition — not in the data file's ladder)*

### The idea

*The last approach collected every verdict before answering, but one `False` decides the whole thing.
Why keep measuring?* Check a node, and only descend into its children if it passed. The first failure
ends the search.

### How to think about it

> **Intuition.** The inspector now leaves the building the moment one wing is out of tolerance. Every
> measurement it makes is the same as before — it simply stops making them sooner.

This is worth separating from approach 1 because it is the version almost everyone actually writes,
and because its real cost is surprising.

### Worked example

On the balanced example nothing is saved — no node fails, so every measurement still happens, and the
`height()` entry count is identical to approach 1: **`22`** for both.

On the unbalanced tree from the top of this document:

| Step | Node | Left height | Right height | Action |
|---|---|---|---|---|
| 1 | `3`… `1` | `3` | `2` | passes, descend |
| 2 | `2` | `2` | `0` | **fails** — return `False`, nothing below is ever measured |

### Code

```python
def is_balanced_short_circuit(root: Optional[TreeNode]) -> bool:
    """Same measurements, abandoned the moment one node fails."""
    if root is None:
        return True
    if abs(height(root.left) - height(root.right)) > 1:
        return False
    return is_balanced_short_circuit(root.left) and is_balanced_short_circuit(root.right)
```

### Common mistake

> **Watch out.** Believing this rung is the quadratic one. It is the version almost everyone writes,
> and **it is not quadratic** — measured on a left spine it makes `100`, `200`, `400` and `800`
> `height()` entries for `n` of `50`, `100`, `200`, `400`. Strictly linear. Approach 1 above, with no
> short circuit, is the quadratic one: `2 550` / `10 100` / `40 200` / `160 400` on those same spines.
> That is the rung the app's ladder shows, and it is labelled `O(n²)` because it earns it.

Why: to recurse deep, every ancestor must *pass*, and a node that passes is balanced. A tree that is
balanced all the way down has height `O(log n)`, so the only trees this rung explores deeply are
shallow ones. On a spine it fails at the root and leaves. Its true worst case is a perfectly balanced
tree — `40 962` entries at `n = 2 047`, which is `O(n log n)`.

> **In an interview.** Do not claim a bound you have not thought through for the *code you wrote*.
> "This re-measures, so it is `O(n log n)` on a balanced tree, and the quadratic version is the one
> that keeps going after a failure" is a far stronger sentence than reciting `O(n²)` — and if your
> interviewer expects `O(n²)`, the difference is the short-circuit, which you can point at.

### Complexity and when to use this

- **Time — `O(n log n)` at its worst**, which happens on a balanced tree; linear on a spine, for the
  unhappy reason that it gives up immediately.
- **Space — `O(h)`.**

**When it is right:** it is a perfectly respectable answer when `n` is small, and it is the honest
first thing to write before improving it.

---

## Approach 3: Measure each subtree only once  *(an addition — not in the data file's ladder)*

### The idea

*The waste is not the checking, it is the re-measuring — so remember the measurements.* Cache each
node's height the first time it is computed. The structure of the code does not change at all; only
the second call for any given node gets cheaper.

### How to think about it

> **Intuition.** The inspector writes each wing's height on a clipboard the first time. Every later
> "how tall is that wing?" is a glance at the clipboard rather than another climb. The itinerary is
> unchanged; the walking is gone.

This is the standard reflex — repeated work, so memoise — and it *does* fix the time. It is included
because the reflex is right and the result is still not the best answer, which is the interesting
part: it buys `O(n)` time with `O(n)` extra memory, and the next approach buys the same time for
nothing.

### Worked example

| Judging node | Needs | Clipboard before | Cost |
|---|---|---|---|
| `3` | `height(9)`, `height(20)` | empty | full walk of both subtrees, all entries written |
| `9` | heights of two empty children | `{9: 1, 20: 2, 15: 1, 7: 1}` | two lookups |
| `20` | `height(15)`, `height(7)` | same | two lookups |
| `15`, `7` | empty children | same | lookups only |

After the first descent, nothing is ever walked twice.

### Code

```python
def is_balanced_memo(root: Optional[TreeNode]) -> bool:
    """The repeated measurement is the waste; remember each height instead."""
    memo: dict[TreeNode, int] = {}

    def cached_height(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        if node not in memo:
            memo[node] = 1 + max(cached_height(node.left), cached_height(node.right))
        return memo[node]

    def check(node: Optional[TreeNode]) -> bool:
        if node is None:
            return True
        if abs(cached_height(node.left) - cached_height(node.right)) > 1:
            return False
        return check(node.left) and check(node.right)

    return check(root)
```

Keying a dictionary on the node objects themselves works because the default object hash is identity
— two distinct nodes holding the same value are different keys, which is exactly what is wanted.

### Common mistake

> **Watch out.** Keying the cache on `node.val`. Values are not unique — the constraints never
> promise it, and `[5, 5, 5, 5, null, null, 5]` is a legal tree. Two different subtrees then share a
> cache entry and the second one silently inherits the first one's height. The misconception is that
> a value identifies a node; in a tree, only the node identifies the node.

### Complexity and when to use this

- **Time — `O(n)`.** Each height computed once.
- **Space — `O(n)`** for the cache, on top of `O(h)` for the recursion. That is the cost the next
  approach removes.

**When it is right:** when the heights are needed again afterwards — if the caller wants to *report*
where the imbalance is, the clipboard is the answer and throwing it away would be wasteful.

---

## Approach 4: One pass, with `-1` meaning "unbalanced"

### The idea

*The cache exists only because the height computation and the balance check are two separate walks.
What if they were one?* A post-order walk already computes a node's height from its children's
heights. Let that same return value carry the verdict: a height of `-1` means "something below here
is unbalanced" — impossible as a real height, so it cannot be confused with one.

### How to think about it

> **Intuition.** Each node reports one number upward: *how tall I am*, or the impossible value
> meaning *do not bother, it is already broken below me*. A parent that hears the impossible value
> passes it straight up without looking at anything else. No flag, no second walk, no clipboard — the
> bad news travels in the same channel as the good news.

> **Why it works.** Two facts make the fusion safe. First, `0` is a legal height (the empty tree), so
> the sentinel must be a value no height can take — `-1` qualifies, and any negative would. Second,
> imbalance is **absorbing**: once a subtree is unbalanced, the whole tree is unbalanced no matter
> what sits above it, so a parent never needs to recover the real height of a broken child. That
> second fact is what lets one number carry two meanings without loss.

### Worked example

Post-order, on the balanced example. Each row is a return.

| Call | Left returns | Right returns | `abs` difference | Returns |
|---|---|---|---|---|
| children of `9`, `15`, `7` | — | — | — | `0` (empty) |
| `measure(9)` | `0` | `0` | `0` | `1` |
| `measure(15)` | `0` | `0` | `0` | `1` |
| `measure(7)` | `0` | `0` | `0` | `1` |
| `measure(20)` | `1` | `1` | `0` | `2` |
| `measure(3)` | `1` | `2` | `1` | `3` → not `-1`, so **balanced** |

And on the unbalanced tree from the top, the sentinel's propagation is the whole story: `measure(4)`
sees left `1` and right `0`, fine, returns `2`; `measure(2)` sees left `2` and right `0`, difference
`2`, returns `-1`; `measure(1)` sees `-1` come back from its left child and returns `-1` immediately
— the right subtree is never measured at all.

### Code

```python
UNBALANCED = -1


def is_balanced_sentinel(root: Optional[TreeNode]) -> bool:
    """Height and verdict in one return value: no height is ever measured twice."""

    def measure(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        left = measure(node.left)
        if left == UNBALANCED:
            return UNBALANCED
        right = measure(node.right)
        if right == UNBALANCED:
            return UNBALANCED
        if abs(left - right) > 1:
            return UNBALANCED
        return 1 + max(left, right)

    return measure(root) != UNBALANCED
```

The sentinel is named rather than typed as a bare `-1` in four places: the whole design rests on that
one value being impossible, and a name says so.

### Common mistake

> **Watch out.** Returning `-1` for an empty node, on the theory that "nothing" should be one less
> than a leaf. The function then reads its own base case as the failure sentinel, and **every tree is
> reported unbalanced** — a single node returns `False`, the statement example returns `False`. The
> misconception is height measured in edges (where an empty tree is `-1`) colliding with a sentinel
> chosen to be an impossible height. Both conventions are defensible; they cannot both live in one
> function.

> **Watch out.** `abs(left - right) >= 1` instead of `> 1`. This demands *perfect* balance, and its
> tell is cruel: it returns **`True`** on a perfect tree of seven nodes, so a test suite full of tidy
> examples passes. On the statement's own example it returns **`False`** where the answer is `True`,
> and on a two-node tree it returns `False`. "Differ by no more than one" means a difference of `1`
> is allowed.

### Complexity and when to use this

- **Time — `O(n)`,** one visit per node, and it never calls a separate `height()` at all — measured,
  the `height()` counter stays at `0` for every input.
- **Space — `O(h)`** of call frames, and nothing else.

**When it is right:** this is the answer. It is also the shape to recognise — *combine the children's
answers into one value on the way up* — because tree-diameter, the maximum path sum and the largest
BST inside a tree are all this function with a different combining step.

---

## Approach 5: The same pass, without the call stack  *(an addition — not in the data file's ladder)*

### The idea

*The best rung is `O(h)` in call frames, and the constraint allows a tree `5 000` tall.* Python stops
at `1 000`. So do the identical post-order walk with a stack you own.

### How to think about it

> **Intuition.** Every node needs to be handled **twice**: once on the way down, to schedule its
> children, and once on the way up, when both children's heights are known. Recursion does the second
> visit for free — it is what "returning" means. Without recursion you have to schedule it yourself,
> which is what the `ready` flag is: *I have already expanded this node; both its children are done;
> now combine.*

Heights are stored in a dictionary and **popped** as they are consumed, so the map holds only the
frontier rather than the whole tree. Measured: on a perfect tree of `32 767` nodes it never holds
more than **`15`** heights at once; on a spine of `500`, never more than **`1`**.

### Worked example

Stack shown with the top on the right; `ready` pairs marked `*`.

| Step | Stack | Pops | Heights held |
|---|---|---|---|
| 1 | `[3]` | `3` → push `3*`, `9`, `20` | `{}` |
| 2 | `[3*, 9, 20]` | `20` → push `20*`, `15`, `7` | `{}` |
| 3 | `[3*, 9, 20*, 15, 7]` | `7` (leaf, ready next) | `{}` |
| 4 | … | `7*` combines `0, 0` | `{7: 1}` |
| 5 | … | `15*` combines `0, 0` | `{7: 1, 15: 1}` |
| 6 | `[3*, 9, 20*]` | `20*` pops both children out of the map | `{20: 2}` |
| 7 | `[3*, 9]` | `9*` combines `0, 0` | `{20: 2, 9: 1}` |
| 8 | `[3*]` | `3*` pops `9` and `20`, difference `1` | `{3: 3}` → **balanced** |

Row 6 is why the map stays small: a height is read exactly once, by the node's parent, and removed.

### Code

```python
def is_balanced_iterative(root: Optional[TreeNode]) -> bool:
    """Approach 4 with an explicit stack — survives a tree taller than the frame limit."""
    heights: dict[TreeNode, int] = {}
    stack: list[tuple[TreeNode, bool]] = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = heights.pop(node.left, 0)      # popped: a height is read once
            right = heights.pop(node.right, 0)
            if abs(left - right) > 1:
                return False
            heights[node] = 1 + max(left, right)
        else:
            stack.append((node, True))            # revisit after both children
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return True
```

`heights.pop(node.left, 0)` does double duty: the default `0` is the empty-child case, and the pop is
what keeps the map bounded by the height rather than the node count.

### Common mistake

> **Watch out.** Pushing the node's children *without* re-pushing the node first, then trying to
> combine on the way down. There is nothing to combine yet — a node's height is not knowable until
> both children have reported. The misconception is that an explicit stack turns post-order into
> pre-order; it does not. The `ready` flag is not bookkeeping you could optimise away, it *is* the
> post-order.

### Complexity and when to use this

- **Time — `O(n)`.** Each node is pushed twice and popped twice.
- **Space — `O(h)`** for the stack, plus a map that measurably peaks at the height.

**When it is right:** whenever the input can be deep. On a `5 000`-node spine — a legal input under
this problem's own constraints — the four recursive approaches above all raise
`RecursionError: maximum recursion depth exceeded`, and this one returns `False`.

---

## The Overall Arc

Every rung here computes the same pair of numbers at every node — the heights of its two subtrees —
and the ladder is entirely about how much of that measuring is repeated and how it is carried. The
literal transcription judges each node on its own, and because measuring a height means walking a
whole subtree, deep nodes get re-walked once per ancestor: quadratic, and measured as such, `160 400`
height entries on a spine of `400` where one pass needs `801`. Short-circuiting at the first failure
looks like the fix and is really a change of subject — it cannot be slow *and* deep, because
descending requires passing, passing means balanced, and balanced means shallow, so it quietly
becomes `O(n log n)` and is linear on exactly the skewed trees people cite as its worst case. The
honest fix for repeated work is to remember it, and memoising heights does buy `O(n)` time — but it
pays `O(n)` memory for a clipboard that exists only because measuring and checking were two separate
walks. Fusing them is the real idea: one post-order pass already computes a node's height from its
children's, so let that same return value carry the verdict, with `-1` for "already broken below
here" — legal because `0` is a real height and `-1` can never be one, and sufficient because
imbalance is absorbing, so a parent never needs the true height of a broken child. That is `O(n)`
time and `O(h)` space with no second structure at all. The last rung then gives back the one thing
recursion was silently borrowing: with `5 000` nodes permitted and no balance promised, the call
stack is the resource that runs out first, and moving the same walk onto a stack you own is the
difference between an answer and a `RecursionError`.

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Judge every node | `O(n²)` on a spine | `O(h)` | Correct, and re-walks every deep subtree once per ancestor | You want a verdict **per node**, not for the tree |
| Short-circuit | `O(n log n)` worst | `O(h)` | Still re-measures; saved only by the fact that deep trees fail early | Small inputs, or as the honest first draft |
| Memoise heights | `O(n)` | `O(n)` | Buys the time with a second structure | The heights are wanted afterwards too |
| Post-order sentinel | `O(n)` | `O(h)` | One value carries height *and* verdict | Default — this is the answer |
| Iterative post-order | `O(n)` | `O(h)` | Same walk, frames you control | The tree may be taller than the frame limit |

## Interview Priority

**Know cold:** the post-order sentinel. It is the answer, it is short, and the reasoning behind it —
*fuse the two questions into one return value, using a value the real answer can never take* — is a
transferable trick, not a fact about this problem. Be able to say why `-1` is safe (because `0` is a
legal height) and why no separate flag is needed (because imbalance is absorbing).

**Know well enough to write:** the naive version, because the interview usually starts there and the
conversation is about *what makes it slow*. Be precise: it is the re-measuring, and how bad it gets
depends on whether you stop at the first failure.

**Understand, do not memorise:** the memoised rung, which is worth mentioning in one sentence as the
obvious fix that the sentinel makes unnecessary, and the iterative version, which is worth having
ready for "what if the tree is `5 000` deep?".

> **In an interview.** Open by saying the word "every": "the condition has to hold at every node, so
> the naive version measures a height at each of them and re-walks the same subtrees." Then: "one
> post-order pass can compute the height and detect the imbalance at the same time, if I let the
> height carry a sentinel." You have named the problem and the fix before writing a line. Expect the
> follow-up about deep trees — and if asked to *report* where the imbalance is rather than whether
> there is one, say that the sentinel throws that information away and the memoised version keeps it.

## Full Runnable Script

`TreeNode`, `build`, `to_values`, `chain`, `perfect` and `random_tree` are **scaffolding, not part of
the answer** — they exist so this file can build inputs from ordinary lists and so the claims above
can be measured. `CALLS` counts entries into `height()`, which is how the work table in approach 1
and approach 2 was produced; it is instrumentation, not part of any solution.

The `_bug_*` functions are the "common mistake" from each section, executed, so that every wrong
answer quoted above — the `True` from the root-only check, the `False` from `>= 1` on the statement
example, the `False` from an empty node returning `-1` — is printed by the run rather than recalled
by the author.

```python
"""Is the Tree Height-Balanced? — every approach in one file, cross-checked.

Run:  python balanced_tree.py
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
    """Tree -> level-order list, trimmed. Used to print a found counterexample."""
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


def chain(n: int) -> Optional[TreeNode]:
    """A tree degenerated into a linked list: n nodes, each the left child of the last."""
    root = None
    for v in range(n, 0, -1):
        root = TreeNode(v, left=root)
    return root


def perfect(height_: int) -> Optional[TreeNode]:
    """A perfect tree of the given height — 2**height - 1 nodes, balanced everywhere."""
    if height_ == 0:
        return None
    return TreeNode(height_, perfect(height_ - 1), perfect(height_ - 1))


def random_tree(n: int, rng: random.Random) -> Optional[TreeNode]:
    """A tree of exactly n nodes with an arbitrary shape — the stress-test input."""
    if n == 0:
        return None
    root = TreeNode(rng.randint(-100, 100))
    open_slots = [root]
    for _ in range(n - 1):
        parent = rng.choice(open_slots)
        node = TreeNode(rng.randint(-100, 100))
        if parent.left is None and (parent.right is not None or rng.random() < 0.5):
            parent.left = node
        else:
            parent.right = node
        if parent.left is not None and parent.right is not None:
            open_slots.remove(parent)
        open_slots.append(node)
    return root


# ----------------------------------------------------------- the height helper
# Shared by the first three approaches. CALLS counts entries, so the document can
# report work actually done rather than assert a bound.
CALLS = {"height": 0}


def height(node: Optional[TreeNode]) -> int:
    """The number of nodes on the longest path below and including `node`."""
    CALLS["height"] += 1
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))


# ------------------- approach 1: judge every node, independently of the others
def is_balanced_every_node(root: Optional[TreeNode]) -> bool:
    """The statement transcribed: the condition must hold at EVERY node, so test every node."""
    verdicts: list[bool] = []

    def walk(node: Optional[TreeNode]) -> None:
        if node is None:
            return
        verdicts.append(abs(height(node.left) - height(node.right)) <= 1)
        walk(node.left)
        walk(node.right)

    walk(root)
    return all(verdicts)


# ------------------------------- approach 2: stop at the first node that fails
def is_balanced_short_circuit(root: Optional[TreeNode]) -> bool:
    """Same measurements, abandoned the moment one node fails."""
    if root is None:
        return True
    if abs(height(root.left) - height(root.right)) > 1:
        return False
    return is_balanced_short_circuit(root.left) and is_balanced_short_circuit(root.right)


# ---------------------------------- approach 3: measure each subtree only once
def is_balanced_memo(root: Optional[TreeNode]) -> bool:
    """The repeated measurement is the waste; remember each height instead."""
    memo: dict[TreeNode, int] = {}

    def cached_height(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        if node not in memo:
            memo[node] = 1 + max(cached_height(node.left), cached_height(node.right))
        return memo[node]

    def check(node: Optional[TreeNode]) -> bool:
        if node is None:
            return True
        if abs(cached_height(node.left) - cached_height(node.right)) > 1:
            return False
        return check(node.left) and check(node.right)

    return check(root)


# --------------- approach 4: one post-order pass, with -1 meaning "unbalanced"
UNBALANCED = -1


def is_balanced_sentinel(root: Optional[TreeNode]) -> bool:
    """Height and verdict in one return value: no height is ever measured twice."""

    def measure(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        left = measure(node.left)
        if left == UNBALANCED:
            return UNBALANCED
        right = measure(node.right)
        if right == UNBALANCED:
            return UNBALANCED
        if abs(left - right) > 1:
            return UNBALANCED
        return 1 + max(left, right)

    return measure(root) != UNBALANCED


# --------------- approach 5: the same post-order pass without the call stack
def is_balanced_iterative(root: Optional[TreeNode]) -> bool:
    """Approach 4 with an explicit stack — survives a tree taller than the frame limit."""
    heights: dict[TreeNode, int] = {}
    stack: list[tuple[TreeNode, bool]] = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = heights.pop(node.left, 0)      # popped: a height is read once
            right = heights.pop(node.right, 0)
            if abs(left - right) > 1:
                return False
            heights[node] = 1 + max(left, right)
        else:
            stack.append((node, True))            # revisit after both children
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return True


# --------------------------------------------------------- the buggy variants
def _bug_strict_difference(root: Optional[TreeNode]) -> bool:
    """`>= 1` instead of `> 1`: demands perfect balance, not height balance."""
    def measure(node: Optional[TreeNode]) -> int:
        if node is None:
            return 0
        left = measure(node.left)
        right = measure(node.right)
        if left == UNBALANCED or right == UNBALANCED or abs(left - right) >= 1:
            return UNBALANCED
        return 1 + max(left, right)
    return measure(root) != UNBALANCED


def _bug_root_only(root: Optional[TreeNode]) -> bool:
    """Checks the root and never recurses — misses every imbalance further down."""
    if root is None:
        return True
    return abs(height(root.left) - height(root.right)) <= 1


def _bug_empty_is_sentinel(root: Optional[TreeNode]) -> bool:
    """An empty node returns -1, which the same function already reads as 'unbalanced'."""
    def measure(node: Optional[TreeNode]) -> int:
        if node is None:
            return UNBALANCED
        left = measure(node.left)
        if left == UNBALANCED:
            return UNBALANCED
        right = measure(node.right)
        if right == UNBALANCED:
            return UNBALANCED
        if abs(left - right) > 1:
            return UNBALANCED
        return 1 + max(left, right)
    return measure(root) != UNBALANCED


# ------------------------------------------- instrumented walks, not answers
def peak_heights_held(root: Optional[TreeNode]) -> int:
    """How many heights approach 5 holds at once."""
    heights: dict[TreeNode, int] = {}
    peak = 0
    stack: list[tuple[TreeNode, bool]] = [(root, False)] if root else []
    while stack:
        node, ready = stack.pop()
        if ready:
            left = heights.pop(node.left, 0)
            right = heights.pop(node.right, 0)
            heights[node] = 1 + max(left, right)
            peak = max(peak, len(heights))
        else:
            stack.append((node, True))
            if node.left:
                stack.append((node.left, False))
            if node.right:
                stack.append((node.right, False))
    return peak


def work(fn: Callable[[Optional[TreeNode]], bool], tree: Optional[TreeNode]) -> int:
    """height() entries made by one run of fn."""
    CALLS["height"] = 0
    fn(tree)
    return CALLS["height"]


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], bool]]] = [
    ("every-node", is_balanced_every_node),
    ("short-circuit", is_balanced_short_circuit),
    ("memo", is_balanced_memo),
    ("sentinel", is_balanced_sentinel),
    ("iterative", is_balanced_iterative),
]

EXAMPLE: list[Optional[int]] = [3, 9, 20, None, None, 15, 7]
EXAMPLE_FALSE: list[Optional[int]] = [1, 2, 2, 3, 3, None, None, 4, 4]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]]]] = [
        ("statement example, balanced", EXAMPLE),
        ("statement example 2, unbalanced", EXAMPLE_FALSE),
        ("empty tree", []),
        ("single node", [1]),
        ("two nodes", [1, 2]),
        ("three nodes, perfect", [1, 2, 3]),
        ("spine of three", [1, 2, None, 3]),
        ("perfect tree of seven", [1, 2, 3, 4, 5, 6, 7]),
        ("balanced at the root, not below", [1, 2, 3, 4, None, None, 5, 6]),
        ("duplicate values throughout", [5, 5, 5, 5, None, None, 5]),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    shown = 0

    for label, values in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        if shown < 5:
            shown += 1
            print(f"\n{label}: {values}")
            for name, got in results.items():
                print(f"  {name:<{width}} -> {got}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: {results}")

    rng = random.Random(20260913)
    for _ in range(500):
        tree = random_tree(rng.randint(0, 40), rng)
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len(set(results.values())) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on {to_values(tree)}: {results}")

    print("\n=== a tree balanced at the root and unbalanced below it ===")
    handmade = build([1, 2, 3, 4, None, None, 5, 6])
    print(f"  [1, 2, 3, 4, null, null, 5, 6]  root-only says {_bug_root_only(handmade)}, "
          f"the answer is {is_balanced_sentinel(handmade)}")
    search = random.Random(7)
    for _ in range(20_000):
        candidate = random_tree(search.randint(4, 12), search)
        if _bug_root_only(candidate) and not is_balanced_every_node(candidate):
            print(f"  found by random search: {to_values(candidate)}")
            print(f"  root-only says {_bug_root_only(candidate)}, "
                  f"the answer is {is_balanced_sentinel(candidate)}")
            break

    print("\n=== height() entries, which is the work each rung actually does ===")
    print(f"  {'shape':<26} {'n':>5} {'every-node':>11} {'short-circuit':>14}")
    for label, tree, n in [
        ("left spine", chain(50), 50),
        ("left spine", chain(100), 100),
        ("left spine", chain(200), 200),
        ("left spine", chain(400), 400),
        ("perfect tree, height 9", perfect(9), 511),
        ("perfect tree, height 11", perfect(11), 2047),
    ]:
        every = work(is_balanced_every_node, tree)
        short = work(is_balanced_short_circuit, tree)
        print(f"  {label:<26} {n:>5} {every:>11} {short:>14}")
    print(f"  sentinel, on every shape above: "
          f"{work(is_balanced_sentinel, perfect(11))} height() entries")

    print("\n=== heights held at once by approach 5 ===")
    for label, tree in [
        ("perfect tree, 1023 nodes", perfect(10)),
        ("perfect tree, 32767 nodes", perfect(15)),
        ("left spine, 500 nodes", chain(500)),
    ]:
        print(f"  {label:<30} {peak_heights_held(tree):>6}")

    print("\n=== what this document claims about wrong code, run ===")
    for label, fn, values in [
        ("`>= 1`, statement example", _bug_strict_difference, EXAMPLE),
        ("`>= 1`, perfect tree of seven", _bug_strict_difference, [1, 2, 3, 4, 5, 6, 7]),
        ("`>= 1`, two nodes", _bug_strict_difference, [1, 2]),
        ("empty node returns -1, single node", _bug_empty_is_sentinel, [1]),
        ("empty node returns -1, statement example", _bug_empty_is_sentinel, EXAMPLE),
    ]:
        print(f"  {label:<44} {fn(build(values))!s:<6} "
              f"(the answer is {is_balanced_sentinel(build(values))})")

    print("\n=== recursion, at the constraint's own upper limit of 5000 nodes ===")
    print(f"  sys.getrecursionlimit() = {sys.getrecursionlimit()}")
    spine = chain(5000)
    for name, fn in APPROACHES:
        try:
            print(f"  {name:<14} -> {fn(spine)}")
        except RecursionError as exc:
            print(f"  {name:<14} -> RecursionError: {exc}")

    print(f"\n{len(cases)} listed cases + 500 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
