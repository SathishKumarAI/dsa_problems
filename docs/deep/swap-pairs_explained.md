# Swap Every Adjacent Pair — Explained

## Understanding the Problem

Picture a row of numbered railway carriages coupled front to back. Somebody asks you to swap the
first two carriages, then the next two, then the next two, all the way down — and to hand back the
carriage that ends up at the front. If the row has an odd number, the last one has nobody to swap
with and stays exactly where it is.

Now the sentence that makes this problem what it is: **you must move the carriages, not repaint their
numbers.** Repainting is two lines and produces a row that *reads* the same as the correct answer.
It is still the wrong answer.

**The core question: how do you exchange two nodes' positions when a node's position is defined
entirely by who points at it?** Three links change per swap, not two — and the third one belongs to
the node *before* the pair, which is why the first pair is different from every other pair, and why
this problem ends at a dummy node.

> **Intuition.** In a linked list a node has no coordinates. "Where it is" is nothing but the set of
> arrows aimed at it. So "move a node" means "rewrite arrows", and to rewrite the arrows around a
> pair you need a grip on **four** things: the node before the pair, the two nodes in it, and the
> node after it. Lose your grip on any of them mid-swap and the rest of the list is unreachable.

### Why a value swap is the wrong answer, concretely

If a node holds nothing but an `int`, swapping values and swapping nodes print identically, and it is
fair to ask why anybody cares. Three reasons, each of which has broken real code:

| Situation | What a value swap does |
|---|---|
| A node carries a payload — an object, a key *and* a value, a buffer, a mutex | You must copy every field, and you silently copy the ones you forgot about too. A node identity that other code keys on is now attached to the wrong data |
| Something else holds a pointer to a node — an index, an LRU entry, a cursor, another list threaded through the same nodes | The pointer is still valid and now refers to a node whose contents changed under it. Nothing crashes; the other structure is simply wrong |
| The node is immutable, or `val` is `const`, or the list is a value type | It does not compile |

So the statement's requirement is not pedantry. It is the difference between an algorithm that
rearranges a structure and one that shuffles data through a fixed structure. The document's own test
harness therefore checks **node identity**, not just values — and that is the only check that can
tell the two apart.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `0 <= nodes <= 100` | A hundred nodes, so nothing here is about speed — an `O(n)` array or 50 stack frames both pass comfortably. This is the constraint that makes the problem purely about **shape**. But note the **0**: an empty list is legal input, so every approach must return `None` for `None`, and `nodes[0]` is a crash waiting for the array rung. |
| values in `0..100` | Values are inert and **not unique**, so you can never identify a node by its value. Everything positional, everything by pointer. Also why a value swap is undetectable by printing. |
| "the swap has to be done by **relinking**" | The actual requirement. This is the constraint that puts a rung at the bottom of the ladder which is fast, constant-space, two lines long, and disqualified. |
| "an **odd** number of nodes leaves the last one where it is" | This is the constraint that dictates the loop guard: you must test both the node **and the node after it**, because a lone tail has no partner. Testing only the first walks off the end. |
| "0 and 1 nodes return unchanged" | Spelled out so the guard is not an afterthought. The same two-part test handles both. |
| "the first pair changes the head" | **This is the constraint the dummy node exists for.** Whatever you return is not the head you were given — unless there was no pair at all, which is the case that makes a naive "remember `head.next`" version need its own branch. |

The worked example traced in every section is five nodes, because an odd length is where the guard
earns its keep and two pairs is the minimum that shows `prev` moving:

```
n0(1) → n1(2) → n2(3) → n3(4) → n4(5) → ∅        answer: n1(2) → n0(1) → n3(4) → n2(3) → n4(5) → ∅
```

**Every trace below tracks node labels, not values.** That is not decoration — it is the only way the
first approach's failure is visible at all.

---

## Approach 1: Exchange the payloads *(the rung that is fast, tiny, and not the answer)*

### The idea

*What is the smallest thing that produces the right printout?* Walk the list in twos and swap each
pair's `val`. *Why is that not the answer?* Because no node moved. The structure is identical to what
you were handed, and the problem asked for a rearranged structure.

### How to think about it

> **Intuition.** Imagine relabelling the carriages instead of shunting them. Passengers standing on
> the platform reading the numbers see the right answer. Anybody who was *inside* carriage 3 is still
> inside the same physical carriage, which now claims to be carriage 4. If nothing else in the system
> cares about physical carriages, you got away with it. The moment something does — a passenger
> manifest, a cargo pointer, a second train coupled to one specific carriage — you have corrupted it
> silently.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`. Values move; nodes do not.

| `node` | swap | chain afterwards (labels with values) |
|---|---|---|
| start | — | `n0(1) → n1(2) → n2(3) → n3(4) → n4(5)` |
| `n0` | `n0.val ↔ n1.val` | `n0(2) → n1(1) → n2(3) → n3(4) → n4(5)` |
| `n2` | `n2.val ↔ n3.val` | `n0(2) → n1(1) → n2(4) → n3(3) → n4(5)` |
| `n4` | `n4.next` is `None`, loop ends | `n0(2) → n1(1) → n2(4) → n3(3) → n4(5)` |

Measured final chain: **`n0(2) → n1(1) → n2(4) → n3(3) → n4(5)`**. Now put that beside the correct
answer from Approach 5, measured on the same input:

| | order of nodes | printed values |
|---|---|---|
| value swap | `n0, n1, n2, n3, n4` — **unchanged** | `[2, 1, 4, 3, 5]` |
| real swap | `n1, n0, n3, n2, n4` | `[2, 1, 4, 3, 5]` |

Identical printouts, completely different structures. `n0` is still the head. **This is why the trace
tracks identity:** a values-only table would show the two approaches as the same algorithm.

### Code

```python
def swap_pairs_swap_values(head: ListNode | None) -> ListNode | None:
    node = head
    while node is not None and node.next is not None:
        node.val, node.next.val = node.next.val, node.val
        node = node.next.next
    return head
```

### Common mistake

> **Watch out.** The misconception has two layers. The shallow one is that swapping needs no
> temporary because Python's tuple assignment looks like two statements — it is not, it evaluates the
> whole right-hand side first, and unrolling it by hand destroys the first value. The deep one is
> that this rung is an *optimization* of the problem rather than a different problem.

Unrolling the tuple assignment:

```python
        node.val = node.next.val
        node.next.val = node.val      # WRONG — the line above already clobbered it
```

Measured on `[1, 2, 3, 4]` this returns **`[2, 2, 4, 4]`**: each pair ends up holding two copies of
its second value. It is the same discipline every rung below needs — **save what you are about to
overwrite** — showing up in its simplest possible form.

And the deep layer, measured: run the correct value swap on `[1, 2, 3, 4, 5]` and the identity audit
reports `nodes did NOT move`, on every input, at every length, forever. The values agree with all
four real answers and the structure never matches any of them. **A test that only compares printed
values cannot tell this rung from a correct one** — which is exactly why the harness at the foot of
this document audits identity separately.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. One pass, two assignments per pair, nothing allocated. It is the
cheapest rung on the ladder by a constant factor and it is the only one that is *wrong*.

Use it when — and only when — the nodes are genuinely interchangeable containers for plain data,
nothing outside holds a pointer into the list, and you have written down somewhere that node identity
is not meaningful. In an interview: name it, then disqualify it yourself in one sentence
("that swaps the data, not the nodes, so anything holding a pointer into the list still sees the old
order"). Naming and rejecting it is a much stronger signal than never mentioning it.

---

## Approach 2: Collect the nodes in an array, swap, relink

### The idea

*Fine — move the actual nodes. What makes that hard?* Only one thing: to rewire a pair you need to
name the node **after** it, and by the time you have rewritten a link you may have lost it. *So?*
Lay every node pointer out in an array, where every neighbour is addressable by index, swap them
pairwise there, then walk the array writing `next` from the new order. *What does it fix?* It really
relinks — the caller's nodes come back in a new order — and it needs `O(n)` memory to do it.

### How to think about it

> **Intuition.** Shunt the carriages onto a siding where you can see the whole train at once and
> reach any carriage directly, do the swaps on the siding, then re-couple the whole train front to
> back in the new order. The reason this is wasteful is worth stating precisely: the array exists so
> the code can *name the node after the pair* — and the pair **already points at it**. You bought a
> second copy of the list's structure to look one step ahead, which the list does in one dereference.

Two details in the loop bounds carry the corner cases. `range(0, len - 1, 2)` stops before a lone
final node, so an odd tail is left alone with no `if`. And the second loop writes **every** node's
`next`, including setting the last one to `None` — which matters more than it looks.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`.

**Step 1 — collect:**

| Step | array |
|---|---|
| after the walk | `[n0, n1, n2, n3, n4]` |

**Step 2 — swap pairwise, `i = 0, 2` (`range(0, 4, 2)`):**

| `i` | swap | array afterwards |
|---|---|---|
| 0 | `n0 ↔ n1` | `[n1, n0, n2, n3, n4]` |
| 2 | `n2 ↔ n3` | `[n1, n0, n3, n2, n4]` |

`i = 4` is not reached — `range` stops at `len - 1 = 4` — so `n4` keeps its slot.

**Step 3 — rewrite every `next` from the array order:**

| `i` | node | `next` set to |
|---|---|---|
| 0 | `n1` | `n0` |
| 1 | `n0` | `n3` |
| 2 | `n3` | `n2` |
| 3 | `n2` | `n4` |
| 4 | `n4` | `None` ← the one that is easy to forget |

Return `nodes[0]` = `n1`. Chain: `n1(2) → n0(1) → n3(4) → n2(3) → n4(5)`. Correct, and the nodes are
the caller's own — identity audit: `nodes moved`.

### Code

```python
def swap_pairs_node_array(head: ListNode | None) -> ListNode | None:
    nodes: list[ListNode] = []
    node = head
    while node is not None:
        nodes.append(node)
        node = node.next
    for i in range(0, len(nodes) - 1, 2):  # `- 1` leaves an odd tail alone
        nodes[i], nodes[i + 1] = nodes[i + 1], nodes[i]
    for i, nd in enumerate(nodes):
        nd.next = nodes[i + 1] if i + 1 < len(nodes) else None
    return nodes[0] if nodes else None
```

The `if nodes else None` is not defensive noise — `nodes` is empty for the legal input `head = None`,
and `nodes[0]` would raise `IndexError`.

### Common mistake

> **Watch out.** The misconception is that "relink the array in order" means "point each node at the
> next one", so a loop over `range(len - 1)` looks complete. It is not: the **last** node's `next`
> still holds whatever it pointed at before the swap, and after an even-length swap that is a node
> now sitting *earlier* in the list. You have built a cycle.

```python
    for i in range(len(nodes) - 1):   # WRONG — never clears the last node's next
        nodes[i].next = nodes[i + 1]
```

Measured on `[1, 2, 3, 4]`: the read-back helper reports **`RuntimeError: cycle detected while
reading the list back`**. `n2` ends up last in the array, its old `next` was `n3`, and `n3` now sits
at index 2 pointing at `n2` — a two-node loop at the end of the list. Without the harness's step
limit the program hangs.

Now the part that makes it dangerous: measured on the **odd** worked example `[1, 2, 3, 4, 5]`, the
same buggy code returns the fully correct **`[2, 1, 4, 3, 5]`**. On an odd length the last array slot
holds the untouched tail, whose `next` was already `None`. So the bug is invisible on odd inputs and
hangs on even ones — the signature of a terminator assumption that holds for one parity.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Time is three passes: collect, swap, rewrite. Space is `n`
pointers — real memory, though cheaper than `n` nodes.

Use it when the permutation you want is **not** a local one. This shape generalises immediately to
"reverse every k", "rotate by k", "interleave two halves" — anything where you want random access to
positions — and for those it is a genuinely reasonable answer. For swapping *adjacent* pairs it is
overkill, because adjacency means the node you need is one dereference away.

---

## Approach 3: Let the tail swap itself

### The idea

*The array existed only so the code could name the node after the pair — and `second.next` already
is that node.* So: swap the first two nodes, and hand everything after them to a recursive call that
returns the already-swapped rest. *What does it fix?* The `O(n)` array becomes nothing at all, and
the code becomes four lines. *What does it still cost?* One stack frame per pair.

### How to think about it

> **Intuition.** You are standing at the front of the train with your partner. You say to the rest of
> the train: "swap yourselves up and tell me who ends up at your front." While they do that, you and
> your partner switch places. When they hand you back a name, you couple *your* back carriage to it,
> and the answer to the whole question is your partner — who is now at the very front. One pair's
> worth of work, done `n/2` times by delegation.

The ordering of the three lines is the entire correctness argument, and it is the same discipline as
`reverse-list`: **`second.next` is read before it is written.** `head.next = swap(second.next)` uses
the old value; only afterwards does `second.next = head` overwrite it. Reverse those two lines and
`second.next` is `head` by the time you read it.

> **Why it works.** The base case covers both 0 and 1 nodes with one test, so an odd tail is returned
> untouched and becomes the `next` of the last swapped pair. Everything else is a two-node local
> rewiring plus a trusted answer for a strictly shorter list, so induction on length gives
> correctness with nothing to check about parity.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`. Descending first — nothing is rewired on the way in:

| Depth | `head` | `second` | recurses on |
|---|---|---|---|
| 0 | `n0` (1) | `n1` (2) | `n2` |
| 1 | `n2` (3) | `n3` (4) | `n4` |
| 2 | `n4` (5) | — | **base case**: `head.next is None` → return `n4` |

Unwinding, each frame doing its two assignments:

| Returning into depth | `head.next` set to | `second.next` set to | frame returns | chain from the return value |
|---|---|---|---|---|
| 1 | `n2.next = n4` | `n3.next = n2` | `n3` | `n3(4) → n2(3) → n4(5)` |
| 0 | `n0.next = n3` | `n1.next = n0` | `n1` | `n1(2) → n0(1) → n3(4) → n2(3) → n4(5)` |

Final answer `n1`. Three frames were live at the deepest point — `⌈n/2⌉` rounded for the base case.

### Code

```python
def swap_pairs_recursive(head: ListNode | None) -> ListNode | None:
    if head is None or head.next is None:
        return head  # 0 or 1 nodes: nothing to pair with
    second = head.next
    head.next = swap_pairs_recursive(second.next)  # BEFORE second.next is overwritten
    second.next = head
    return second
```

### Common mistake

> **Watch out.** The misconception is that the two assignments are independent, so their order is a
> matter of taste. They are not independent: one of them **reads** `second.next` and the other
> **writes** it. Doing the write first means the recursive call is handed `head` — the node you are
> standing on — so the recursion never gets shorter.

```python
    second = head.next
    second.next = head                             # WRONG — destroys the pointer below
    head.next = swap_pairs_recursive(second.next)  # now recurses on `head` itself
```

Measured on `[1, 2, 3, 4, 5]` this raises **`RecursionError: maximum recursion depth exceeded`** — the
recursion runs forever on a five-node list, because `second.next` is `head` and every frame re-asks
the same question. The stack overflow is the *lucky* outcome: in a language with tail-call
optimisation or a larger stack the same mistake becomes an infinite loop with no error at all. The
rule to carry: in any pointer rewiring, read before you write, and if you cannot, save it in a local
first.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n/2)` on the call stack. Time is one frame per pair, three assignments
each. The space is invisible — it is the interpreter's stack, `⌈n/2⌉ + 1` frames live at the deepest
point. At the stated ceiling of 100 nodes that is about 51 frames, comfortably inside CPython's
default limit of 1000, so **unlike most list recursions this one is actually safe under the given
constraints** — worth saying, because it is unusual and because it means the honest reason to prefer
the loop is style rather than a crash.

Use it when the code will be read more than it is run — it is the clearest statement of the idea on
this page, and "swap the first two, trust the rest" is a sentence a reviewer can check. Write it in an
interview as your second answer, after the loop, and name the `n/2` frames before anyone asks.

---

## Approach 4: A loop with a `prev` pointer, head special-cased

### The idea

*Recursion opens a stack frame per pair to remember one thing — the node before the pair — so hold
that in a variable instead.* Walk with `prev` trailing the pair; after each swap, `prev` is the node
that is now at the *back* of the swapped pair. *What does it fix?* The `O(n/2)` stack becomes two
pointers. *What does it still cost?* Two branches, both caused by the head: you must capture the
answer before the first swap destroys it, and you must skip the `prev` relink on the first pair
because there is nothing behind it.

### How to think about it

> **Intuition.** Three links change per swap: the pair's two, and one belonging to the node *in front
> of* the pair — it must be told that the pair's order changed. Every pair has such a node except the
> first, so the loop is uniform for pairs two onwards and lopsided for pair one. Notice too that
> `new_head` has to be grabbed on the way in: after the first swap, `head` is no longer the head and
> `head.next` no longer points where it did, so the answer is unrecoverable a line later.

The `prev = node` line is the one people stare at. After the swap, `node` — which was `first` — sits
**behind** `second`, so it is the node in front of the *next* pair. Then `node = node.next` steps
onto the next pair's first node. Both of those read strangely and both are right; walk them on the
table below rather than trusting the prose.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`. `new_head = head.next = n1` is captured first, before
anything moves.

| Iteration | `node` | `second` | `node.next ←` | `second.next ←` | `prev` relink | `prev` after | `node` after | chain from `new_head` |
|---|---|---|---|---|---|---|---|---|
| 1 | `n0` | `n1` | `n2` | `n0` | **skipped**, `prev` is `None` | `n0` | `n2` | `n1(2) → n0(1) → n2(3) → n3(4) → n4(5)` |
| 2 | `n2` | `n3` | `n4` | `n2` | `n0.next = n3` | `n2` | `n4` | `n1(2) → n0(1) → n3(4) → n2(3) → n4(5)` |

The guard `node is not None and node.next is not None` now fails: `node` is `n4` and `n4.next` is
`None`. Return `new_head` = `n1`. Measured chain matches the answer exactly, and the odd tail `n4`
was never touched.

Read the "`prev` relink" column: it is skipped exactly once, on the first pair, forever. That single
skipped assignment plus the captured `new_head` are the two branches Approach 5 deletes.

### Code

```python
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
```

Three conditionals in nine lines — the `if` guard at the top, the `if prev is not None` inside, and
the two-part loop test — and **two of the three exist only because the head has no predecessor.**

### Common mistake

> **Watch out.** The misconception is that `head` still means "the front of the list" after the loop
> runs. It does not. `head` is a local variable pointing at a particular node, and that node has just
> been demoted to second place. Returning it hands back a list that is missing its first element and
> — worse — is missing a different element depending on parity.

```python
    while node is not None and node.next is not None:
        ...
    return head        # WRONG — head is now the SECOND node
```

Measured on the worked example `[1, 2, 3, 4, 5]` this returns **`[1, 4, 3, 5]`** — one node short and
scrambled, because the walk starts from `n0`, which now points at `n3`. On the even input
`[1, 2, 3, 4]` it returns **`[1, 4, 3]`**. Neither raises. The reason `new_head` has to be captured
before the loop rather than derived after it is that there is no expression for "the second node I
was originally given" once the first swap has run.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. Time is one pass, three pointer writes per pair. Space is
`prev`, `node`, `second` — three variables regardless of length.

Use it when you cannot allocate the extra node at all: a `no_std` embedded context, an arena with no
spare slot, a language where the fake node is genuinely awkward to construct. It is the correct
answer in that world, and it is why the rung exists rather than being skipped. Everywhere else,
prefer the next one — the two branches this version carries are both bug sites, and the next rung
buys them away for one throwaway node.

---

## Approach 5: A dummy node makes every pair an ordinary pair

### The idea

*Both of Approach 4's branches trace to the same fact: the head has nothing in front of it. So put
something in front of it.* Allocate one throwaway node pointing at the head, keep `prev` on it, and
the first pair now has a predecessor exactly like every other pair. *What does it fix?* It deletes
the `if prev is not None`, deletes the captured `new_head`, deletes the up-front `if head is None or
head.next is None` — and the answer is whatever `dummy.next` happens to be at the end, which is
correct for the empty list, the one-node list and every list with pairs, all without a branch.

### How to think about it

> **Intuition.** The train has no coupling at the front, so bolt on an empty locomotive. Now *every*
> pair is "the two carriages after something", the swap is the same three assignments every single
> time, and at the end you do not ask whether the front changed — you ask the locomotive what it is
> pulling. This is the same move that makes *remove-nth-from-end* and *remove-list-elements*
> single-branch loops, and it is the punchline all three problems share: **the head is the only node
> with nothing in front of it, so invent something.**

> **Why it works.** The loop test `prev.next is not None and prev.next.next is not None` asks
> exactly the right question — *are there two nodes ahead of `prev`?* — and asks it about `prev`,
> which is always a real node, never `None`. So it covers the empty list (`dummy.next` is `None`), the
> one-node list (`dummy.next.next` is `None`), and the odd tail, all with the same expression. The
> three assignments maintain one invariant: **everything before `prev` is finished and correctly
> linked, everything from `prev.next` onward is untouched original list.** `prev = first` re-establishes
> it, because `first` is the node now sitting at the back of the completed pair.

### Worked example

`n0(1) → n1(2) → n2(3) → n3(4) → n4(5)`, with `dummy → n0` prepended and `prev = dummy`. Each
iteration's three assignments in order, measured:

| Iteration | `prev` | `first` | `second` | third (`second.next`) | `first.next ←` | `second.next ←` | `prev.next ←` | `prev` after | chain from `dummy` |
|---|---|---|---|---|---|---|---|---|---|
| start | `dummy` | — | — | — | — | — | — | `dummy` | `dummy → n0(1) → n1(2) → n2(3) → n3(4) → n4(5)` |
| 1 | `dummy` | `n0` | `n1` | `n2` | `n2` | `n0` | `n1` | `n0` | `dummy → n1(2) → n0(1) → n2(3) → n3(4) → n4(5)` |
| 2 | `n0` | `n2` | `n3` | `n4` | `n4` | `n2` | `n3` | `n2` | `dummy → n1(2) → n0(1) → n3(4) → n2(3) → n4(5)` |

The test now fails: `prev` is `n2`, `prev.next` is `n4`, and `prev.next.next` is `None`. Return
`dummy.next` = `n1`.

Final measured chain: **`n1(2) → n0(1) → n3(4) → n2(3) → n4(5) → ∅`**. Compare the identity column
with Approach 1's: there the order stayed `n0, n1, n2, n3, n4` and only the values moved. Here the
nodes themselves are in a new order — the same order, node for node, that the array and the recursion
produced. That agreement across three structurally different implementations is what the harness
checks.

Note also what iteration 1 did *not* need: no `if`. `prev.next = second` ran on the first pair exactly
as it ran on the second, because `prev` was a real node holding a real link. That one assignment
is the whole justification for the extra node.

### Code

```python
def swap_pairs_dummy(head: ListNode | None) -> ListNode | None:
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next is not None and prev.next.next is not None:
        first = prev.next
        second = first.next
        first.next = second.next  # save the rest of the list before overwriting
        second.next = first
        prev.next = second
        prev = first  # `first` is now the BACK of the swapped pair
    return dummy.next
```

Zero conditionals. Compare with Approach 4's three.

### Common mistake

> **Watch out.** Two misconceptions live here, and both are about *reading a pointer you have already
> overwritten*. The assignments look like three independent facts to record; they are a sequence in
> which `second.next` is read once and written once, and the read must come first. Separately, the
> loop guard must ask about **two** nodes ahead, not one — a guard that tests only `prev.next`
> dereferences `None` the moment it meets an odd tail.

Getting the assignment order wrong:

```python
        second.next = first       # WRONG — second.next was the third node; now it is `first`
        first.next = second.next  # so this reads `first`, making first point at ITSELF
        prev.next = second
```

Measured on `[1, 2, 3, 4, 5]`: `first.next` becomes `first`, so `n0` points at itself. The function
**never terminates** — `prev` becomes `n0`, `prev.next` is `n0` and `prev.next.next` is `n0` forever,
so the `while` spins without a single further change. Capped at 20 iterations to observe it, the
chain reads `n1(2) → n0(1) → n0(1) → …` with `n0.next is n0` confirmed `True`. Not a crash, not a
wrong answer — a hang, which is the hardest failure to diagnose from a bug report.

And the guard:

```python
    while prev.next is not None:   # WRONG — needs prev.next.next too
```

Measured: on `[1, 2, 3, 4]` it returns the fully correct **`[2, 1, 4, 3]`**, and on `[1, 2, 3, 4, 5]`
it raises **`AttributeError: 'NoneType' object has no attribute 'next'`** — `second` is `None` at the
lone tail and `second.next` explodes. Right on every even input, crashing on every odd one. The
statement's second example exists to catch precisely this, which is why it carries a note about it.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. Time is one pass with three pointer writes per pair — `⌊n/2⌋`
iterations, so about `1.5n` writes. Space is one extra node plus three pointers; the node is
allocated once and does not grow with `n`. In C++ make it a stack local (`ListNode dummy(0, head);`)
and it costs nothing to allocate and nothing to free.

**This is the one to write.** It satisfies the relinking requirement, handles 0, 1 and odd lengths
with one loop test, needs no captured answer, and — the reason that matters most under interview
pressure — it contains **no conditionals**, so there is no branch to get wrong. Every other rung on
this ladder is either the wrong answer, linear in space, or carries a head branch; this one is none
of those.

---

## The Overall Arc

Every rung above the first is chasing one thing — **a grip on the node in front of the pair** — and
the first rung is here to establish that the problem is about structure at all. Swapping the payloads
is two lines, constant space, and produces a printout indistinguishable from the right answer while
leaving every node exactly where it was; it fails the moment a node carries more than an `int` or
anything outside holds a pointer in, which is why the trace tracks `n0, n1, n2` rather than `1, 2, 3`
and why the harness audits identity separately from values. Once you commit to moving nodes, the
difficulty is immediate and specific: a swap rewrites **three** links, and the third belongs to the
node before the pair, so the code must be able to name four nodes at once and must not overwrite any
of them before reading it. The array rung buys that ability wholesale — lay every node pointer out
where all neighbours are indexable, swap in the array, rewrite every `next` — which genuinely
relinks, at the price of a second copy of the list's structure to look **one** node ahead that the
pair already points at. Recursion deletes the array by noticing that the rest of the list can be
asked to swap itself and hand back its own new front, which is the clearest statement of the idea on
the page and costs a stack frame per pair; unusually for a list recursion the stated hundred-node
ceiling makes that safe, so the honest objection is style, not overflow. The loop with a `prev`
pointer replaces the frame with a variable, and in doing so exposes what was hiding behind both
earlier rungs: the first pair has nothing behind it, so the answer must be captured before the first
swap destroys it and the third assignment must be skipped exactly once — two branches, three
conditionals, and every one of them a bug site, measured as `[1, 4, 3, 5]` when the return is wrong.
The last rung deletes all of it with one throwaway node in front of the head. Now every pair is an
ordinary pair, the three assignments run unconditionally, the loop test `prev.next and prev.next.next`
covers the empty list, the single node and the odd tail with one expression, and the new head is not
computed but *read off* `dummy.next`. Repaint, shunt via a siding, delegate, carry a `prev`, invent a
predecessor: the principle being sharpened is that **the head is the only node with nothing in front
of it, and a fake node in front of it turns a special case into no case** — which is the same
sentence that ends *remove-nth-from-end* and *remove-list-elements*, and the reason those three
problems are really one lesson.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Swap the values | `O(n)` | `O(1)` | Cheapest and **wrong**: no node moves, so every outside pointer is now stale | Nodes are interchangeable data holders and nothing holds a pointer in — and you have written that down |
| Node array, then relink | `O(n)` | `O(n)` | Buys a second copy of the structure to see one node ahead | The permutation is non-local — reverse-every-k, rotate, interleave |
| Recursive | `O(n)` | `O(n/2)` stack | Clearest statement of the idea; safe at n ≤ 100, not in general | Readability matters most, or as the second interview answer |
| `prev` pointer, head special-cased | `O(n)` | `O(1)` | Constant space with three conditionals, two of them purely the head's fault | You cannot allocate the extra node at all |
| **`prev` pointer + dummy node** | **`O(n)`** | **`O(1)`** | **One throwaway node buys away every branch in the function** | **Always, for this problem** |

---

## Interview Priority

> **In an interview.** Say the requirement back before writing anything: *"the nodes have to move —
> swapping values would print the same and be the wrong answer, because anything holding a pointer
> into the list would still see the old order."* Then say the structural fact: *"a swap rewrites three
> links, and the third belongs to the node before the pair — and the first pair has no such node, so
> I'll put a dummy in front of the head."* Write Approach 5. The two follow-ups are always the same:
> **"what about an odd length?"** — the guard tests `prev.next` *and* `prev.next.next`, so a lone tail
> ends the loop untouched — and **"can you do it recursively?"** — yes, four lines, `n/2` frames, and
> `head.next = swap(second.next)` must come before `second.next = head`.

**Memorize cold — the dummy node pattern.** `dummy = ListNode(0, head)`, work from `dummy`, `return
dummy.next`. Three tokens that delete a whole class of bug from every list problem which can touch the
head. This problem, *remove-nth-from-end* and *remove-list-elements* are three drills on the same
reflex; get it once and all three become single loops.

**Memorize cold — the four-name grip and the assignment order.** `prev`, `first`, `second`, and the
node after the pair. `first.next = second.next` **first**, then `second.next = first`, then
`prev.next = second`, then `prev = first`. Reversing the first two makes `first` point at itself and
the function **hangs** — measured, on a five-node list. The transferable discipline is the one from
`reverse-list`: read a pointer before you overwrite it, or save it in a local.

**Memorize cold enough to say out loud — why the value swap is disqualified.** One sentence, the
one in the callout above. It costs ten seconds, it proves you read the requirement rather than
pattern-matched the title, and it is the single most common way candidates get this problem marked
wrong while producing the right printout.

**Worth understanding, not memorizing — the recursion.** Have it as your second answer. Its value is
that "swap the first two and trust the rest" is checkable by a reader in a way the loop is not, and
being able to name its `n/2` frames unprompted is a stronger signal than the code alone.

**Not worth memorizing — the node array.** Name it, cost it at `O(n)` space, and say why it is
wasteful in one clause: it buys a copy of the structure to look one node ahead, and the pair already
points there. Keep the trap, though — forgetting to set the **last** node's `next` builds a cycle on
even lengths and is invisible on odd ones.

---

## Full Runnable Script

`ListNode`, `build`, `to_list` and `to_nodes` are **scaffolding, not part of the answer** — an
interviewer hands you a `head` and a node class that already exists; these only let this file build
inputs from ordinary Python lists and read results back. `to_list` and `to_nodes` both carry a step
limit, because two of the mistakes documented above leave a cycle behind and a harness that hangs
teaches nothing.

`to_nodes` is the important one, and it is the reason this script differs from every other document's
in this directory. **Values cannot distinguish a real swap from a value swap** — measured, they are
identical on every input — so the suite runs two checks. The first cross-checks all five approaches
against each other and against ground truth **by value**, and all five agree. The second is an
**identity audit**: it records the node objects before the call and after it, and requires that
`swap_values` moved nothing while the other four moved something, on every case with at least two
nodes. An approach that failed to behave as predicted would be reported by name.

Cases: both statement examples plus the empty list, the odd worked example, a single node, exactly
one pair, a list whose values are all identical (where a value swap is *completely* undetectable by
printing), the value range's ends, the hundred-node ceiling, and 120 randomised cases at lengths from
0 to 100. `sys.setrecursionlimit(3000)` is raised only for the recursive rung's benefit on the
longest cases; at the problem's own ceiling of 100 nodes the default limit of 1000 would suffice.

```python
"""Swap Every Adjacent Pair — every approach in one file, cross-checked by VALUE
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
    """Scaffolding: read a list back out. `limit` guards against a bug that
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
    a real swap from a value swap; `to_list` cannot, and that is the whole point."""
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
    for i in range(0, len(nodes) - 1, 2):  # `- 1` leaves an odd tail alone
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
        prev = first  # `first` is now the BACK of the swapped pair
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
            print(f"\n{label}: {values}")
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

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
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
    main()
```
