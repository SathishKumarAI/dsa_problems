# Level Order Traversal — Explained

## Understanding the Problem

Return the tree's values **grouped by depth** — one list per level, top to bottom, and left to right
within each level.

```
        3               ->  [[3],
       / \
      9   20            ->   [9, 20],
         /  \
        15   7          ->   [15, 7]]
```

The output shape is the problem. Producing the values in the right *order* is easy and several
traversals do it by accident; producing them in the right **groups** is the thing you have to
actually arrange. So:

**The core question:** *how does the walk know where one level ends and the next begins?* A tree has
no level markers in it. Whatever answers that question is the technique — and the whole family of
level problems (zigzag order, the right-side view, per-level averages, bottom-up order) is built on
the same answer.

> **Intuition.** A queue holding a level is holding **exactly** that level, and nothing else, at one
> precise moment: after the previous level has been fully consumed and before this one starts being
> consumed. Catch it at that instant — by recording its length — and the boundary is free.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `0 <= node count <= 2000` | An empty tree returns `[]`, not `[[]]`. Small enough that recursion depth is not a danger — worth stating plainly rather than inventing one |
| `-1000 <= node value <= 1000` | Values are carried, never compared. Duplicates are fine and change nothing |
| each level is its own list, left to right | The two guarantees that decide every approach below: **grouping** and **within-level order** |

Throughout: `root = [3, 9, 20, null, null, 15, 7]` with answer `[[3], [9, 20], [15, 7]]`. Note that
`9` is a childless node on a level where `20` has two children — that asymmetry is what catches
solutions which assume a level is full.

---

## Approach 1: Find the height, then collect each level separately

### The idea

*If the answer is one list per level, produce one list per level.* Work out how deep the tree goes,
then for each depth `d`, walk the tree collecting every node at exactly that depth. The grouping is
correct by construction because each walk is told which group it is filling.

### How to think about it

> **Intuition.** Like photographing a building floor by floor from outside: climb to floor `d`, take
> the picture, come back down, climb to `d + 1`. Each photograph is right. The climbing is the
> problem — you re-walk the top of the tree once for every level below it.

### Worked example

| Pass | Depth wanted | Walk | Row produced |
|---|---|---|---|
| 1 | `0` | reaches `3`, returns immediately | `[3]` |
| 2 | `1` | descends through `3`, collects `9` and `20` | `[9, 20]` |
| 3 | `2` | descends through `3`, through `9` (nothing there) and `20` | `[15, 7]` |

Pass 3 visits the root and both its children again in order to reach nodes two levels down. On a tall
tree that repetition is the entire cost.

### Code

```python
def levels_per_level(root: Optional[TreeNode]) -> list[list[int]]:
    """One traversal per level: correct by construction, and it re-walks the top every time."""
    result: list[list[int]] = []
    for depth in range(height(root)):
        row: list[int] = []
        collect_at(root, depth, row)
        result.append(row)
    return result


def collect_at(node: Optional[TreeNode], depth: int, out: list[int]) -> None:
    """Append every value exactly `depth` steps below `node`, left to right."""
    if node is None:
        return
    if depth == 0:
        out.append(node.val)
        return
    collect_at(node.left, depth - 1, out)
    collect_at(node.right, depth - 1, out)
```

Left before right in `collect_at` is not cosmetic: it is the only thing that gives the row its
required left-to-right order.

### Common mistake

> **Watch out.** Believing the repeated work is small. It is `O(n · h)`, and on a spine it is
> quadratic — measured visits: **`2 601`** at `n = 50`, **`10 201`** at `100`, **`40 401`** at `200`.
> Four times the work for twice the nodes. On a *balanced* tree it is far tamer (`8 178` visits for
> `2 047` nodes) because `h` is only `11`, which is exactly why this approach feels acceptable when
> you test it on tidy examples.

### Complexity and when to use this

- **Time — `O(n · h)`**, quadratic in the worst case.
- **Space — `O(h)`** of frames plus the output.

**When it is right:** when you need **one** level and not all of them — "return the nodes at depth
`k`" is `collect_at` on its own, and it is the right tool for that job.

---

## Approach 2: One depth-first walk, carrying the depth

### The idea

*The re-walking exists only because each pass throws away everything it saw on the way down.* Walk
once, carry the current depth as an argument, and append each value into `result[depth]`. The group is
decided by a number the node was handed, not by when it is visited.

### How to think about it

> **Intuition.** Every node is labelled with its floor on arrival, and there is one bucket per floor.
> Drop each value into its bucket as you pass. The traversal order no longer has to *mean* anything —
> the label does the grouping.

The subtlety is the ordering *within* a row. A pre-order walk goes left-subtree-first everywhere, so
at any fixed depth it reaches nodes strictly left to right. That is true, and it is a fact about
pre-order rather than about levels — which is exactly why this rung, while correct, leaves you
trusting a coincidence you would have to re-derive under pressure.

### Worked example

| Visit | Node | Depth | `result` after |
|---|---|---|---|
| 1 | `3` | `0` | `[[3]]` |
| 2 | `9` | `1` | `[[3], [9]]` |
| 3 | `20` | `1` | `[[3], [9, 20]]` |
| 4 | `15` | `2` | `[[3], [9, 20], [15]]` |
| 5 | `7` | `2` | `[[3], [9, 20], [15, 7]]` |

Visit 3 lands in a row that already exists; visit 4 is the first at its depth and has to create one.

### Code

```python
def levels_dfs(root: Optional[TreeNode]) -> list[list[int]]:
    """One pre-order walk; the depth argument does the grouping."""
    result: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(result):         # first node ever seen at this depth
            result.append([])
        result[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return result
```

### Common mistake

> **Watch out.** Omitting the `if depth == len(result)` guard and writing straight into
> `result[depth]`. It raises `IndexError: list index out of range` on the first node of every new
> level — measured, immediately, on the statement's own example. The misconception is that a Python
> list grows to fit an index; it does not, and `result` has to be *told* a new level exists.

> **Watch out.** Recursing right before left. Every value still lands in the correct level, so the
> output looks structurally right and is wrong in every row: measured, `[[3], [20, 9], [7, 15]]`. The
> statement asks for left to right within a level, and in this approach that guarantee comes *only*
> from the order of the two recursive calls. Nothing else in the code enforces it.

### Complexity and when to use this

- **Time — `O(n)`,** one visit per node.
- **Space — `O(h)`** of call frames, plus the output.

**When it is right:** when the tree is deep and narrow, where `O(h)` beats `O(w)` — and when you are
already doing a depth-first walk for another reason and want the levels for free.

---

## Approach 3: Breadth-first, tagging each node with its depth

### The idea

*Use the traversal whose natural order already is level order.* A queue visits the tree level by
level; pair each node with its depth when you enqueue it, and the grouping works exactly as it did in
approach 2 — by label.

### How to think about it

> **Intuition.** A single-file queue at a door. Each person carries a badge saying which floor they
> came from. You never have to work out where a level ends, because you just read the badge.

This is the honest intermediate step: it gets the right answer from the right traversal, but it is
still grouping by a tag rather than by the structure of the walk, and it pays for a tuple per node.

### Worked example

| Step | Queue (front → back) | Dequeued | Into row | Enqueued |
|---|---|---|---|---|
| 1 | `(3,0)` | `(3,0)` | `0` | `(9,1)`, `(20,1)` |
| 2 | `(9,1), (20,1)` | `(9,1)` | `1` | — (`9` is a leaf) |
| 3 | `(20,1)` | `(20,1)` | `1` | `(15,2)`, `(7,2)` |
| 4 | `(15,2), (7,2)` | both | `2` | — |

### Code

```python
def levels_bfs_pairs(root: Optional[TreeNode]) -> list[list[int]]:
    """Breadth-first, with each node carrying the depth it was pushed at."""
    result: list[list[int]] = []
    queue: deque[tuple[TreeNode, int]] = deque([(root, 0)] if root else [])
    while queue:
        node, depth = queue.popleft()
        if depth == len(result):
            result.append([])
        result[depth].append(node.val)
        if node.left:
            queue.append((node.left, depth + 1))
        if node.right:
            queue.append((node.right, depth + 1))
    return result
```

### Common mistake

> **Watch out.** Using a **list** with `pop(0)` instead of a `deque`. Removing from the front of a
> list shifts every remaining element, so each pop is `O(n)` and the traversal quietly becomes
> `O(n²)` on a wide tree. Nothing about the output changes, which is what makes it easy to ship.

### Complexity and when to use this

- **Time — `O(n)`.**
- **Space — `O(w)`,** the widest level, plus a depth per queued node.

**When it is right:** when a node's depth is needed for something *other* than grouping — a per-level
computation, an early exit at a target depth, or a mixed traversal.

---

## Approach 4: Breadth-first, one level per round

### The idea

*The queue already knows where the level ends — it just has to be asked at the right moment.* At the
top of each round, the queue contains exactly the nodes of one level, because everything pushed during
the previous round was that level and nothing else has been added. Record its length, pop exactly that
many, and the round **is** the level. No tags, no arithmetic.

### How to think about it

> **Intuition.** Rope off the queue. "Everyone currently in this line is the third floor" — that is
> true at the instant the round begins and false one pop later. `len(queue)` is the rope, and taking
> the measurement before touching anything is the entire technique.

> **Why it works.** The invariant is: *at the top of every round, the queue holds precisely the nodes
> of one level, in left-to-right order.* It holds at the start (the queue holds the root: level zero),
> and each round consumes all `k` of them while appending only their children — which are exactly the
> next level, still left to right, because the parents were. So the invariant is preserved, and the
> grouping is structural rather than inferred.

### Worked example

| Round | `len(queue)` snapshot | Popped in this round | Row emitted | Queue after |
|---|---|---|---|---|
| 1 | `1` | `3` | `[3]` | `9, 20` |
| 2 | `2` | `9`, `20` | `[9, 20]` | `15, 7` |
| 3 | `2` | `15`, `7` | `[15, 7]` | empty |

Round 2 is where the childless `9` matters: it contributes nothing to the queue, and the round still
ends correctly because its size was fixed before any popping began.

### Code

```python
def levels_bfs_snapshot(root: Optional[TreeNode]) -> list[list[int]]:
    """The canonical answer: one round per level, bounded by the queue's length."""
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root] if root else [])
    while queue:
        row: list[int] = []
        for _ in range(len(queue)):      # the snapshot: exactly this level
            node = queue.popleft()
            row.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(row)
    return result
```

### Common mistake

> **Watch out.** Draining the queue in the inner loop — `while queue:` instead of
> `for _ in range(len(queue))`. The inner loop never ends until the *whole tree* is consumed, so
> everything lands in one row: measured, **`[[3, 9, 20, 15, 7]]`**. The misconception is that the
> queue empties at a level boundary. It never does — children are pushed as parents are popped, so
> the queue is refilled continuously and has no boundary of its own.

In languages without Python's evaluate-once `range(len(...))`, the same bug wears a different
costume: reading `queue.size()` inside the loop condition while pushing to it. Take the size into a
variable first; that variable **is** the level boundary.

### Complexity and when to use this

- **Time — `O(n)`,** each node enqueued and dequeued once.
- **Space — `O(w)`,** the widest level.

**When it is right:** as the answer, and as the template. Zigzag order is this with alternate rows
reversed; the right-side view is this keeping the last of each row; per-level averages are this with
`sum(row) / len(row)`. Learn this loop and the family follows.

---

## The Overall Arc

Every rung produces the same nested lists; what separates them is whether the grouping is *arranged*
or merely *observed*. Collecting one level at a time is grouping by construction, and it pays for it
by re-walking the top of the tree once per level below — quadratic on a spine, and deceptively cheap
on the balanced examples people test with. Walking once and carrying a depth removes the repetition
and replaces construction with a label: each value is filed by a number it was handed, which is
correct, though the left-to-right order inside a row now rests entirely on the order of two recursive
calls, and the fact that a pre-order walk reaches any fixed depth from left to right is a property of
pre-order rather than of levels — true, but a coincidence you are trusting rather than an invariant
you are enforcing. Moving to a queue gets the right traversal for the job, and tagging each node with
its depth is the same labelling idea in a better traversal. The last step is the one worth keeping:
the queue, at the top of each round, already holds exactly one level and nothing else, so recording
its length before popping makes the level boundary structural — the round *is* the level, no tag and
no arithmetic. That single snapshot is what turns plain breadth-first search into level-grouped
breadth-first search, and it is the backbone of the whole family that follows. The cost flips with
the shape of the tree rather than its size: measured on a perfect tree of `32 767` nodes the queue
holds `16 384` at its peak while the depth-first frames never exceed `15`, and on a spine of `900` it
is the exact opposite — a queue of `1` against `900` frames. Neither container is the small one; the
tree decides.

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| One walk per level | `O(n · h)` | `O(h)` | Grouping is free; the walking is not | You need a **single** level |
| DFS carrying depth | `O(n)` | `O(h)` | Row order rests on the call order | Deep narrow trees; already walking depth-first |
| BFS with depth tags | `O(n)` | `O(w)` | Right traversal, grouping still by label | The depth is needed for something else |
| BFS with a length snapshot | `O(n)` | `O(w)` | Grouping becomes structural | Default — and the template for the whole family |

## Interview Priority

**Know cold:** the length snapshot. `for _ in range(len(queue))` is one line, and being able to say
*why* it is exactly one level — because everything pushed during the round belongs to the next one —
is the difference between reciting it and owning it.

**Know well enough to write:** the DFS-with-depth version, because it is the answer to "can you do it
without a queue?" and because on a deep narrow tree it genuinely uses less memory.

**Understand, do not memorise:** the per-level version, worth one sentence as the naive starting point
and worth keeping in mind as the right tool for "give me depth `k`".

> **In an interview.** Say the memory trade-off out loud, because it is the follow-up: "BFS holds the
> widest level, DFS holds the height — which is cheaper depends on the tree's shape, not its size."
> Then expect one of the variants, all of which are this loop with one line changed: zigzag (reverse
> alternate rows), right-side view (keep `row[-1]`), bottom-up (reverse the result), per-level maximum
> or average.

## Full Runnable Script

`TreeNode`, `build`, `chain`, `perfect` and `random_tree` are **scaffolding, not part of the answer.**
`VISITS` counts node visits, which is how the quadratic growth in approach 1 was measured rather than
asserted, and `peak_queue` / `peak_frames` are instrumented walks that produce the memory table — not
solutions.

The `_bug_*` functions are the mistakes from each section, executed: the missing length snapshot that
returns everything in one row, the right-before-left recursion whose rows are all reversed, and the
missing row guard that raises `IndexError`.

```python
"""Level Order Traversal — every approach in one file, cross-checked.

Run:  python level_order.py
"""

from __future__ import annotations

import random
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


def chain(n: int) -> Optional[TreeNode]:
    """A tree degenerated into a linked list: n nodes, each the left child of the last."""
    root = None
    for v in range(n, 0, -1):
        root = TreeNode(v, left=root)
    return root


def perfect(height_: int) -> Optional[TreeNode]:
    """A perfect tree of the given height — 2**height - 1 nodes."""
    if height_ == 0:
        return None
    return TreeNode(height_, perfect(height_ - 1), perfect(height_ - 1))


def random_tree(n: int, rng: random.Random) -> Optional[TreeNode]:
    """A tree of exactly n nodes with an arbitrary shape — the stress-test input."""
    if n == 0:
        return None
    root = TreeNode(rng.randint(-1000, 1000))
    open_slots = [root]
    for _ in range(n - 1):
        parent = rng.choice(open_slots)
        node = TreeNode(rng.randint(-1000, 1000))
        if parent.left is None and (parent.right is not None or rng.random() < 0.5):
            parent.left = node
        else:
            parent.right = node
        if parent.left is not None and parent.right is not None:
            open_slots.remove(parent)
        open_slots.append(node)
    return root


VISITS = {"n": 0}


# ------------------- approach 1: find the height, then collect one level at a time
def height(node: Optional[TreeNode]) -> int:
    VISITS["n"] += 1
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))


def collect_at(node: Optional[TreeNode], depth: int, out: list[int]) -> None:
    """Append every value exactly `depth` steps below `node`, left to right."""
    VISITS["n"] += 1
    if node is None:
        return
    if depth == 0:
        out.append(node.val)
        return
    collect_at(node.left, depth - 1, out)
    collect_at(node.right, depth - 1, out)


def levels_per_level(root: Optional[TreeNode]) -> list[list[int]]:
    """One traversal per level: correct by construction, and it re-walks the top every time."""
    result: list[list[int]] = []
    for depth in range(height(root)):
        row: list[int] = []
        collect_at(root, depth, row)
        result.append(row)
    return result


# ------------------------------- approach 2: one DFS walk, carrying the depth
def levels_dfs(root: Optional[TreeNode]) -> list[list[int]]:
    """One pre-order walk; the depth argument does the grouping."""
    result: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(result):         # first node ever seen at this depth
            result.append([])
        result[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return result


# ---------------------------- approach 3: BFS, with each node tagged by depth
def levels_bfs_pairs(root: Optional[TreeNode]) -> list[list[int]]:
    """Breadth-first, with each node carrying the depth it was pushed at."""
    result: list[list[int]] = []
    queue: deque[tuple[TreeNode, int]] = deque([(root, 0)] if root else [])
    while queue:
        node, depth = queue.popleft()
        if depth == len(result):
            result.append([])
        result[depth].append(node.val)
        if node.left:
            queue.append((node.left, depth + 1))
        if node.right:
            queue.append((node.right, depth + 1))
    return result


# --------------------------------- approach 4: BFS, one level per round
def levels_bfs_snapshot(root: Optional[TreeNode]) -> list[list[int]]:
    """The canonical answer: one round per level, bounded by the queue's length."""
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root] if root else [])
    while queue:
        row: list[int] = []
        for _ in range(len(queue)):      # the snapshot: exactly this level
            node = queue.popleft()
            row.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(row)
    return result


# --------------------------------------------------------- the buggy variants
def _bug_no_snapshot(root: Optional[TreeNode]) -> list[list[int]]:
    """Inner loop drains the queue: one row, containing the whole tree."""
    result: list[list[int]] = []
    queue: deque[TreeNode] = deque([root] if root else [])
    while queue:
        row: list[int] = []
        while queue:                     # never ends at a level boundary
            node = queue.popleft()
            row.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(row)
    return result


def _bug_dfs_right_first(root: Optional[TreeNode]) -> list[list[int]]:
    """Right before left: correct levels, every row reversed."""
    result: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        if depth == len(result):
            result.append([])
        result[depth].append(node.val)
        walk(node.right, depth + 1)
        walk(node.left, depth + 1)

    walk(root, 0)
    return result


def _bug_dfs_no_row_guard(root: Optional[TreeNode]) -> list[list[int]]:
    """Writes into result[depth] without creating the row first."""
    result: list[list[int]] = []

    def walk(node: Optional[TreeNode], depth: int) -> None:
        if node is None:
            return
        result[depth].append(node.val)
        walk(node.left, depth + 1)
        walk(node.right, depth + 1)

    walk(root, 0)
    return result


# ------------------------------------------- instrumented walks, not answers
def peak_queue(root: Optional[TreeNode]) -> int:
    """The most nodes the breadth-first queue ever holds — the widest level."""
    if root is None:
        return 0
    peak = 1
    queue = deque([root])
    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
            peak = max(peak, len(queue))
    return peak


def peak_frames(root: Optional[TreeNode]) -> int:
    """The deepest the depth-first version recurses — the height."""
    if root is None:
        return 0
    return 1 + max(peak_frames(root.left), peak_frames(root.right))


def work(fn: Callable[[Optional[TreeNode]], list[list[int]]], tree: Optional[TreeNode]) -> int:
    """Node visits made by one run of fn."""
    VISITS["n"] = 0
    fn(tree)
    return VISITS["n"]


APPROACHES: list[tuple[str, Callable[[Optional[TreeNode]], list[list[int]]]]] = [
    ("per-level", levels_per_level),
    ("dfs-depth", levels_dfs),
    ("bfs-pairs", levels_bfs_pairs),
    ("bfs-snapshot", levels_bfs_snapshot),
]

EXAMPLE: list[Optional[int]] = [3, 9, 20, None, None, 15, 7]
EXPECTED: list[list[int]] = [[3], [9, 20], [15, 7]]


def main() -> None:
    cases: list[tuple[str, list[Optional[int]], list[list[int]]]] = [
        ("statement example", EXAMPLE, EXPECTED),
        ("empty tree", [], []),
        ("single node", [1], [[1]]),
        ("left spine of three", [1, 2, None, 3], [[1], [2], [3]]),
        ("right spine of three", [1, None, 2, None, 3], [[1], [2], [3]]),
        ("perfect tree of seven", [1, 2, 3, 4, 5, 6, 7], [[1], [2, 3], [4, 5, 6, 7]]),
        ("a hole on the left", [1, None, 2, 3], [[1], [2], [3]]),
        ("duplicate values", [7, 7, 7], [[7], [7, 7]]),
        ("negative values", [-1, -2, -3], [[-1], [-2, -3]]),
    ]

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, values, expected in cases:
        results = {name: fn(build(values)) for name, fn in APPROACHES}
        print(f"\n{label}: {values} -> expected {expected}")
        for name, got in results.items():
            print(f"  {name:<{width}} -> {got}")
        if len({repr(v) for v in results.values()}) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT: {results}")
        elif next(iter(results.values())) != expected:
            all_agreed = False
            print("  WRONG: unanimous, but not the expected grouping")

    rng = random.Random(20260913)
    for _ in range(400):
        tree = random_tree(rng.randint(0, 40), rng)
        results = {name: fn(tree) for name, fn in APPROACHES}
        if len({repr(v) for v in results.values()}) != 1:
            all_agreed = False
            print(f"  DISAGREEMENT on a random tree: {results}")

    print("\n=== what this document claims about wrong code, run ===")
    print(f"  no length snapshot:        {_bug_no_snapshot(build(EXAMPLE))}")
    print(f"  DFS recursing right first: {_bug_dfs_right_first(build(EXAMPLE))}")
    try:
        _bug_dfs_no_row_guard(build(EXAMPLE))
        print("  DFS without the row guard: returned without raising (unexpected)")
    except IndexError as exc:
        print(f"  DFS without the row guard: IndexError: {exc}")
    print(f"  the answer:                {EXPECTED}")

    print("\n=== visits made by approach 1, which is O(n*h) ===")
    print(f"  {'shape':<26} {'n':>6} {'visits':>10}")
    for label, tree, n in [
        ("left spine", chain(50), 50),
        ("left spine", chain(100), 100),
        ("left spine", chain(200), 200),
        ("perfect tree, height 9", perfect(9), 511),
        ("perfect tree, height 11", perfect(11), 2047),
    ]:
        print(f"  {label:<26} {n:>6} {work(levels_per_level, tree):>10}")

    print("\n=== which container is cheaper is a fact about the TREE ===")
    print(f"  {'shape':<30} {'BFS queue':>10} {'DFS frames':>11}")
    for label, tree in [
        ("perfect tree, 1023 nodes", perfect(10)),
        ("perfect tree, 32767 nodes", perfect(15)),
        ("left spine, 900 nodes", chain(900)),
    ]:
        print(f"  {label:<30} {peak_queue(tree):>10} {peak_frames(tree):>11}")

    print(f"\n{len(cases)} listed cases + 400 random trees, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
