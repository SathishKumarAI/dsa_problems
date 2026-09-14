// cycle-detect — the teaching document, as data.
//
// Converted from docs/deep/cycle-detect_explained.md by
// scripts/md-to-content.mjs. Every byte of prose carried through unchanged;
// what changed is that the STRUCTURE is now a type (src/content/types.ts)
// rather than a heading convention a script had to grep for.
//
// Reached only through `lib/content.ts`'s glob — never import this file.

import type { TeachingDoc } from "../../content/types.ts"

export const doc: TeachingDoc = {
  problemId: "cycle-detect",
  understanding: `You are given the first node of a chain and told to start walking, following each node's single arrow
to the next one. One of two things will happen: you fall off the end into nothing, or you arrive
somewhere you have already been and keep going round forever. Report which. Return \`True\` if the walk
loops, \`False\` if it terminates.

**The core question: how do you notice that you are repeating yourself, without writing down
everywhere you have been?** The naive approach is slow because "have I been here before?" sounds like
a question that requires a record of every node visited — and once you keep that record, you have
spent \`O(n)\` memory on a problem whose stated point is constant space.

Two pieces of vocabulary, expanded once:

- **Cycle** here means some node's \`next\` points back at a node that already appeared earlier in the
  walk. Because each node has exactly one arrow out, a cycle is not a general tangle — the shape is
  always a straight tail leading into a single closed loop, like the Greek letter ρ (rho). That shape
  is what makes the fast solution provable.
- **Identity versus equality.** Two nodes are *the same node* if they are the same object in memory.
  They are merely *equal* if they happen to hold the same value. This problem is entirely about
  identity; every wrong answer below comes from confusing the two.`,
  unlocks: [
      {
          "constraint": "`the cycle, if any, is entered from some node's next pointer`",
          "what": "This guarantees the ρ shape: at most one loop, entered once, never branching. It is the constraint that makes Floyd's argument valid — once both pointers are inside the loop, the faster one closes the gap by exactly one node per step and therefore *cannot* jump over the slower one."
      },
      {
          "constraint": "`O(1) extra space is the point`",
          "what": "The constraint that **disqualifies the visited set.** The set is correct, linear-time, and four lines long; it is ruled out by the requirement, not by being slow."
      },
      {
          "constraint": "`0 <= list length <= 10^4`",
          "what": "The constraint that **disqualifies the nested walk.** Ten thousand nodes means up to 10^8 pointer comparisons — seconds in Python, and far past any interviewer's patience."
      },
      {
          "constraint": "`-10^5 <= node value <= 10^5`",
          "what": "The constraint that **unlocks value-marking** (approach 4): `100001` is a value no legal node can hold, so it can be used as a \"visited\" stamp written into the nodes themselves. It buys `O(1)` space at the price of destroying the list's data."
      },
      {
          "constraint": "`0 <= list length` (empty is legal)",
          "what": "Every approach must return `False` for `None` without touching an attribute. Floyd gets this free: `while fast and fast.next` fails immediately."
      }
  ],
  approaches: [
  {
    rung: "brute",
    title: "Nested walk — re-scan from the head at every step",
    idea: `*If I cannot store where I have been, can I just look it up again each time?* Yes: when you reach the
node at position \`i\`, walk a second pointer from the head through positions \`0 … i-1\` and check
whether any of them is that same node. *Why is that not the answer?* Because you re-walk the prefix
once per node, which is a quadratic number of comparisons — correct, constant-space, and far too slow
at 10^4 nodes.`,
    intuition: `> **Intuition.** Walking a corridor of numbered doors with no pen and no paper. At every door you
> ask "have I been here before?", and with nothing written down the only way to answer is to run back
> to the entrance and re-walk every door you have already opened, checking each one against the door
> you are standing at. You are trading **memory** for **recomputation** — and it is worth seeing
> precisely because the optimal solution makes exactly the same trade, paying with one extra pointer
> instead of one extra full traversal per door.

The subtle part is why this terminates at all when there *is* a cycle. The outer pointer never stops
on its own — it goes round the loop forever. But the moment it lands on a node it has already
occupied, that node also sits at some earlier index, so the inner scan finds it and the function
returns. The outer loop therefore runs at most \`tail + loop + 1\` times, never forever.`,
    worked: `Input: \`1 → 2 → 3 → 4 → (back to node 2)\`. Call the nodes \`N1 N2 N3 N4\`; \`N4.next\` is \`N2\`.
(This same list is traced in every approach below.)

| \`index\` | outer \`node\` | inner scan visits | found a match? |
|---|---|---|---|
| 0 | \`N1\` | *(nothing — range(0) is empty)* | no |
| 1 | \`N2\` | \`N1\` | no |
| 2 | \`N3\` | \`N1\`, \`N2\` | no |
| 3 | \`N4\` | \`N1\`, \`N2\`, \`N3\` | no |
| 4 | \`N2\` *(the loop closed)* | \`N1\`, then \`N2\` — **match** | **yes → return True** |

Total inner comparisons: 0 + 1 + 2 + 3 + 2 = 8, for a 4-node list. On a list of 10^4 nodes the same
sum is about 5 × 10^7.`,
    code: `def cycle_detect_nested_walk(head: ListNode | None) -> bool:
    node = head
    index = 0
    while node is not None:
        probe = head
        for _ in range(index):  # re-scan only the nodes strictly before this one
            if probe is node:   # \`is\`, not \`==\`: identity, not value
                return True
            probe = probe.next
        node = node.next
        index += 1
    return False`,
    mistake: `> **Watch out.** The misconception is that two nodes "being the same" is a question about their
> **contents**. It is a question about their **address**. A cycle says you are standing on a node you
> already stood on, not on a node that happens to read the same.

Writing \`if probe.val == node.val\` instead of \`if probe is node\`. The function now reports a cycle
for any list holding a duplicate value: on \`1 → 2 → 1 → ∅\`, a list that plainly ends, the buggy
version returns **\`True\`** — run, not assumed. Nothing in the problem forbids repeated values, and
the \`-10^5 <= val <= 10^5\` range with up to 10^4 nodes makes duplicates likely rather than exotic.

In Python the distinction is \`is\` versus \`==\`; in Java it is \`==\` versus \`.equals\`; in C++ it is
comparing pointers versus comparing what they point at. Every language has this trap in a slightly
different spelling.`,
    cost: `**Time** \`O(n²)\`, **space** \`O(1)\`. The time comes from the inner scan running once per outer node
with an ever-growing prefix — the sum \`0 + 1 + 2 + … + n\` is \`n²/2\`. Space is two pointers and an
integer.

Use it essentially never for this problem. It earns its place in one situation: you are debugging a
data structure by hand, you need an obviously-correct oracle to check a clever implementation against,
and \`n\` is tiny. It is the version you trust when you do not yet trust anything else.

---`,
  },
  {
    rung: "set",
    title: "A set of visited nodes",
    idea: `*The nested walk re-derived "have I seen this node?" from scratch every single step — can we just
remember the answer?* Yes: keep a set of every node visited, and the first time you are about to visit
one already in the set, you have found a cycle. *What does it fix?* It collapses the quadratic
re-scanning to one constant-time lookup per node, turning \`O(n²)\` into \`O(n)\`. What it costs is
\`O(n)\` memory — the exact thing the problem says not to spend.`,
    intuition: `> **Intuition.** The same corridor, but now you carry a pot of chalk and mark each door as you pass
> through it. "Have I been here?" stops being a search and becomes a glance. You have swapped the
> **crude** resource for the **cheap** one — the nested walk spent time to avoid memory, the set
> spends memory to avoid time — which is the most common move in algorithm design and almost always
> the right first improvement to say out loud.

The one thing to be careful about is *what* goes in the set. It must identify the node **object**,
not its contents — either the node itself (in Python, Java and C++, default hashing of an object or
pointer is identity-based) or its address, which Python exposes as \`id(node)\`. Put values in the set
and you have written a duplicate-value detector wearing a cycle detector's clothes.

Termination is also worth a thought: on a cyclic list this loop stops the first time it comes back
round to any previously visited node, which is at most \`n\` steps. It does not run forever.`,
    worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`.

| Step | \`head\` at | \`id(head)\` in \`seen\`? | \`seen\` afterwards | result |
|---|---|---|---|---|
| 1 | \`N1\` | no | \`{N1}\` | continue |
| 2 | \`N2\` | no | \`{N1, N2}\` | continue |
| 3 | \`N3\` | no | \`{N1, N2, N3}\` | continue |
| 4 | \`N4\` | no | \`{N1, N2, N3, N4}\` | continue |
| 5 | \`N2\` | **yes** | — | **return True** |

Five steps, one lookup each, and a set that grew to four entries — for a four-node list, the set is
the same size as the list.`,
    code: `def cycle_detect_visited_set(head: ListNode | None) -> bool:
    seen: set[int] = set()
    while head is not None:
        if id(head) in seen:  # id() is the object's address: identity, not value
            return True
        seen.add(id(head))
        head = head.next
    return False`,
    mistake: `> **Watch out.** The misconception is that the set's job is to hold something **hashable** — and an
> \`int\` obviously is, while "can I even put a node in a set?" makes you hesitate. The set's job is to
> hold something **identifying**. Hashability is a precondition, not the requirement.

\`seen.add(head.val)\` instead of the node's identity, the same bug as approach 1's and made easier by
that hesitation. On \`1 → 2 → 1 → ∅\` the buggy version returns **\`True\`** — run, not assumed.

A second, subtler trap specific to the \`id()\` spelling: \`id()\` is only a valid identity as long as the
object is alive. It is safe here because every node stays reachable from \`head\` for the whole call —
but if you ever write this pattern over a sequence of temporary objects, addresses get reused and the
set silently lies to you. Storing the node objects themselves (\`seen: set[ListNode]\`) sidesteps that
entirely, and works as long as the class does not define its own \`__eq__\`/\`__hash__\`. If it does, an
identity set is the only safe choice.`,
    cost: `**Time** \`O(n)\`, **space** \`O(n)\`. Time is one visit and one hash lookup per node, each constant on
average. Space is the set, which reaches \`n\` entries on an acyclic list.

Use it when you need more than a yes/no. The set can be upgraded to a dict of node → index, which
gives you the cycle's entry point and its length for free, in code anyone can read at a glance —
whereas getting the entry point out of the fast solution requires a second, separate argument about
distances. Also use it when the "nodes" are not really nodes: if you are detecting a cycle in
something you cannot traverse twice cheaply, or in a graph where each node has several successors, the
two-pointer trick does not apply at all and a visited set is the actual algorithm.

---`,
  },
  {
    rung: "floyd",
    title: "Floyd's tortoise and hare",
    idea: `*The set only ever needed to answer "am I somewhere I have been?" — is there a way to be in two places
at once instead?* Yes: send two pointers from the head, one stepping one node at a time and one
stepping two. If the list ends, the fast one falls off. If it loops, both end up inside the loop and
the fast one catches the slow one from behind. *What does it fix?* It removes the set entirely: \`O(1)\`
space, same \`O(n)\` time, and nothing is remembered between steps except two positions.`,
    intuition: `> **Intuition.** Two runners set off together round a track. If the track is a straight road the
> faster one reaches the end and the race is over. If the track has a loop in it, both eventually
> enter the loop and never leave — and from that moment the faster one is gaining, lap after lap,
> until he is running alongside the slower one. Nobody wrote anything down: the **evidence** of a
> repeat is simply that the two runners are in the same place.

> **Why it works.** Once both pointers are inside the loop, the gap between them — measured forward
> from \`fast\` to \`slow\` around the loop — shrinks by **exactly one** node per step, because \`slow\`
> advances 1 and \`fast\` advances 2. A quantity that decreases by exactly one can never step *over*
> zero; it has to land on it. That is why they are guaranteed to meet rather than merely pass, and it
> is why the step sizes are 1 and 2 rather than 1 and 3: a gap closing by two per step could skip
> zero, leaving you to argue about the parity of the loop length. The 1-and-2 version needs no such
> argument.

The loop condition \`while fast is not None and fast.next is not None\` is doing two jobs. It is the
no-cycle exit — an acyclic list eventually gives \`fast\` a \`None\` to stand on or to step from — and it
is the safety check that makes \`fast.next.next\` legal, since you may only dereference a node you have
just confirmed is not \`None\`.

One last detail that trips everyone: the check \`if slow is fast\` must happen **after** both have
moved. They both start at the head, so a check before the first move fires immediately on every input.`,
    worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`. The loop is \`N2 → N3 → N4 → N2\`, length 3.

| Step | \`slow\` (+1) | \`fast\` (+2) | met? | note |
|---|---|---|---|---|
| start | \`N1\` | \`N1\` | — | not checked yet — they always start equal |
| 1 | \`N2\` | \`N3\` | no | fast entered the loop |
| 2 | \`N3\` | \`N2\` (\`N4 → N2\`) | no | slow is now in the loop too; gap is 2 going forward |
| 3 | \`N4\` | \`N4\` (\`N2 → N3 → N4\`) | **yes** | **return True** |

Watch the gap, measured as the forward distance from \`fast\` to \`slow\` around the 3-cycle: after step 1
it is 2, after step 2 it is 1, after step 3 it is 0. Exactly one less each step, as promised — it
could not have jumped past zero.

For contrast, the same algorithm on the acyclic \`1 → 2 → ∅\`: step 1 sets \`slow = N2\` and
\`fast = None\`; the condition \`fast is not None\` now fails and the function returns \`False\`, having
touched three pointers and allocated nothing.`,
    code: `def cycle_detect_floyd(head: ListNode | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:  # also makes fast.next.next safe
        slow = slow.next
        fast = fast.next.next
        if slow is fast:  # checked AFTER moving — they start equal
            return True
    return False`,
    mistake: `> **Watch out.** The misconception is that \`slow is fast\` *means* "a cycle exists", so where you
> test it is a matter of taste. It means no such thing. It is evidence of a cycle only once the two
> pointers have travelled **different distances**, and at the top of the first iteration they have
> travelled the same distance: none.

Checking \`if slow is fast\` at the top of the loop, before either pointer moves:

\`\`\`python
while fast is not None and fast.next is not None:
    if slow is fast:      # WRONG — true on the very first iteration, always
        return True
    slow = slow.next
    fast = fast.next.next
\`\`\`

Both pointers start at \`head\`, so this returns **\`True\`** for every list with at least two nodes,
cycle or not — measured on the acyclic \`1 → 2 → ∅\` and on a five-node straight list, both of which
the buggy version calls cyclic. The empty list and the one-node list escape only because the loop
condition rejects them before the check is ever reached, which is exactly the sort of accidental
survival that hides a bug from a test suite.

The usual attempted fix — starting \`fast = head.next\` — works, but then you must handle \`head is None\`
separately before touching \`head.next\`, and the meeting point no longer has the clean distance
property that the find-the-entry-point follow-up depends on. Moving first and checking second is the
version to memorize.`,
    cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The time bound is not obvious and is worth being able to defend:
\`slow\` takes at most \`tail + loop\` steps to enter the loop and at most \`loop\` more before \`fast\`
catches it, so the total is under \`2n\` steps. Space is two pointers, regardless of list length.

This is the one to ship. It is the only approach here that satisfies the \`O(1)\`-space requirement
while staying linear, it never touches the list's data, and it extends: the same two pointers, after
meeting, locate the cycle's entry node (reset one to the head, advance both by one, they meet at the
entry) and measure the cycle's length (keep one still, walk the other round). It is also the engine
behind find-the-duplicate-number and several cycle-finding tricks in number theory.

---`,
  },
  {
    rung: "mark",
    title: "Value-marking — trading the list's data for speed",
    idea: `*Floyd is already optimal, so what would it take to detect a cycle in a single pass with no
comparisons at all?* Stamp each node as you leave it with a value no legal node could hold; arriving
at a stamped node means you have been there. *What does it fix, and what does it cost?* It fixes
nothing about complexity — it is \`O(n)\` time and \`O(1)\` space, the same as Floyd — but it stops after
one pass over each node instead of Floyd's up-to-two, at the price of **destroying every value in the
list.**

**The assumption this requires, stated plainly: the value range is bounded (\`-10^5 … 10^5\`), so
\`100001\` is impossible legitimate data; and you are permitted to mutate the nodes you were handed.**
If either half of that fails — an unbounded value type, or a list someone else is still reading — this
approach is not merely suboptimal, it is incorrect.`,
    intuition: `> **Intuition.** Back to the corridor and the chalk — except now the mark goes on the **door**
> rather than in a notebook you carry. The information is identical, one mark per door, and the
> notebook disappears because the doors were already there. That is why the space drops to \`O(1)\`:
> the storage was allocated before you arrived, and you are only overwriting what was painted on it.

This is a real technique with a real name (in-place marking), and it appears constantly in array
problems where the values happen to be usable as indices or the sign bit is free. The reason it is the
last rung and not the first is that it is the only approach here that leaves the input worse than it
found it, and that is usually disqualifying.`,
    worked: `Input: \`1 → 2 → 3 → 4 → (back to N2)\`. Sentinel \`MARK = 100001\`.

| Step | at node | its \`val\` on arrival | already marked? | \`val\` after stamping | list contents now |
|---|---|---|---|---|---|
| 1 | \`N1\` | 1 | no | \`100001\` | \`[M, 2, 3, 4]\` |
| 2 | \`N2\` | 2 | no | \`100001\` | \`[M, M, 3, 4]\` |
| 3 | \`N3\` | 3 | no | \`100001\` | \`[M, M, M, 4]\` |
| 4 | \`N4\` | 4 | no | \`100001\` | \`[M, M, M, M]\` |
| 5 | \`N2\` | \`100001\` | **yes** | — | **return True** |

Five node visits, one per node plus the repeat — fewer pointer moves than Floyd's three-and-six on the
same input. And the list now holds \`[100001, 100001, 100001, 100001]\`: the answer is right and the
data is gone.`,
    code: `MARK = 100_001  # outside the legal value range -10**5 .. 10**5, so no real node holds it


def cycle_detect_value_marking(head: ListNode | None) -> bool:
    node = head
    while node is not None:
        if node.val == MARK:  # only a node WE stamped can hold this
            return True
        node.val = MARK  # destructive: the original value is gone for good
        node = node.next
    return False`,
    mistake: `> **Watch out.** The misconception is that a sentinel needs to be **unlikely**. It needs to be
> **impossible**, and that is not a difference of degree: an unlikely sentinel is a bug lying in wait
> for the one input that happens to contain it.

Picking a sentinel inside the legal range — \`0\`, or \`-1\`, or \`100000\`. The instant a real node holds
that value the function reports a cycle on a perfectly straight list, and it will do so for exactly
one input in your test set, on a Tuesday. The sentinel has to be *derived* from the stated constraint
(\`|val| <= 10^5\`, so \`100001\` is free), never guessed at.

The second mistake is shipping this at all without saying it mutates. A function named \`has_cycle\`
that silently erases the list is the kind of thing that passes review and then corrupts data in
production, because nothing in the signature warns anyone.`,
    cost: `**Time** \`O(n)\`, **space** \`O(1)\`. Each node is visited at most twice — once to stamp, once to
detect — and the only extra storage is one pointer. Same asymptotics as Floyd with a smaller
constant: roughly \`n + 1\` node visits against Floyd's up-to-\`3n\` pointer dereferences.

Use it when the list is genuinely yours to destroy and the constant factor matters — a one-shot
validity check on a structure you are about to free anyway, or an embedded context where you are
counting dereferences. In an interview, mention it as an aside to show you noticed the value range,
then immediately note that Floyd gets the same bounds without touching the data, which is why Floyd
is the answer.

---`,
  },
  ],
  arc: `Every step of this ladder chases one principle: **detecting a repeat means comparing your present
position against your past, and each approach differs only in where it keeps the past.** The nested
walk keeps no past at all and reconstructs it on demand, re-walking the prefix from the head at every
single node — correct and constant-space, but it pays a full traversal per node, and at the stated
10^4-node limit that quadratic bill is unpayable. The visited set fixes precisely that weakness by
writing the past down once instead of re-deriving it: one hash insert per node turns the re-scan into
a lookup and the running time collapses to linear. But now the past is \`O(n)\` of real memory, on a
problem whose stated point is constant space — the set traded the wrong resource. Floyd's insight is
that you do not need the past at all if you can be in two places at once: run a second pointer at
double speed, and the question "have I been here?" becomes the question "has the fast one caught the
slow one?", which needs no storage because the evidence is the two positions themselves. The
guarantee that makes it work is a consequence of the ρ shape the constraints promise — inside the
loop the gap closes by exactly one per step, so it must hit zero rather than stepping over it — and
that same geometry is what later hands you the cycle's entry point for free. The last rung goes the
other way and asks what could be cheaper than remembering nothing: writing the memory into the nodes
themselves, one impossible sentinel value per node, using the bounded value range the constraints
gave you. It matches Floyd's bounds with a smaller constant and loses the one thing Floyd never
risked — the list's contents. So the arc runs from *recompute the past*, to *store the past*, to
*replace the past with a second present*, to *store the past in the data and burn the data* — and the
winner is the only one that needs neither extra memory nor permission to destroy anything.

---`,
  comparison: {
      "head": [
          "Approach",
          "Time",
          "Space",
          "Core trade-off",
          "Best used when"
      ],
      "rows": [
          [
              "Nested walk",
              "`O(n²)`",
              "`O(1)`",
              "Recomputes the entire prefix instead of storing it",
              "You need a dead-simple oracle to test a clever version against, and `n` is tiny"
          ],
          [
              "Visited set",
              "`O(n)`",
              "`O(n)`",
              "Buys linear time with linear memory — the resource the problem forbids",
              "You need the cycle's entry or length in readable code, or the structure branches (a real graph) where two pointers do not apply"
          ],
          [
              "Floyd (tortoise/hare)",
              "`O(n)`",
              "`O(1)`",
              "None worth naming — two pointers, no allocation, input untouched",
              "Always, for this problem"
          ],
          [
              "Value-marking",
              "`O(n)`",
              "`O(1)`",
              "Fewest node visits, but the list's values are destroyed; needs a bounded value range",
              "The list is yours to destroy and you are counting dereferences"
          ]
      ]
  },
  interview: `> **In an interview.** Open by naming the visited set and killing it in the same breath — *"a hash
> set of node identities is \`O(n)\` time and \`O(n)\` space, and the space is the whole point of this
> question, so let me get that to \`O(1)\`"* — then write Floyd. The follow-up is one of two, reliably:
> **"why must they meet rather than pass each other?"** (the gap shrinks by exactly one per step, so
> it cannot skip zero) or **"now give me the node where the cycle starts"** (reset one pointer to the
> head, advance both by one, they meet at the entry). Have the first as a sentence and the second as
> four lines.

**Memorize cold: Floyd's tortoise and hare.** Five lines, and the two details that decide whether it
works — the loop condition \`while fast and fast.next\`, and checking \`slow is fast\` *after* both move —
are exactly the two things people get wrong under pressure. More importantly it is not one answer but
a family: the same pointers find the cycle's entry node (the standard follow-up), measure the cycle's
length, find the duplicate in an array of \`n+1\` numbers in \`1…n\`, and turn up in
happy-number and several other disguises. Learn the proof sentence too — "the gap shrinks by exactly
one per step, so it cannot skip zero" — because "why must they meet?" is the follow-up that separates
recall from understanding.

**Memorize cold: the visited set.** Not as the answer, but as the opening move. Naming it in one
sentence — "a hash set of node identities is \`O(n)\` time and \`O(n)\` space, so let me get that to
\`O(1)\`" — is how you show you understand what the space requirement is *for*, and it is the version
you actually want when the follow-up asks for the cycle's entry point in code a reviewer can read.
It is four lines; there is no excuse for fumbling it.

**Understand but do not drill: the nested walk.** Its only job is to establish the baseline and the
identity-versus-value distinction. You can derive it on the spot; it needs no flashcard.

**Understand but do not drill: value-marking.** Mention it only if the interviewer pushes on constant
factors or you want to show you read the value range. It is a good instinct to demonstrate and a bad
solution to submit, and saying both in the same breath is the whole point.

---`,
  scriptNote: `\`ListNode\`, \`build\`, \`build_with_cycle\` and \`to_list\` below are **scaffolding, not part of the
answer.** An interviewer hands you a \`head\` and the node class already exists; these helpers exist
only so this file can construct cyclic and acyclic inputs and print them.

Note the guard in \`to_list\`: a cyclic list has no end, so a naive read-back loop runs forever. The
helper takes a step limit and reports the loop instead of hanging — this is the single most common way
to lose an afternoon on this problem, and it is a scaffolding bug, not an algorithm bug.`,
  script: `"""Detect a Cycle — every approach in one file, cross-checked.

Run:  python cycle_detect.py
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
    """Scaffolding: make an acyclic list. Empty list -> None."""
    head: ListNode | None = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def build_with_cycle(values: list[int], pos: int) -> ListNode | None:
    """Scaffolding: make a list whose LAST node points back at index \`pos\`.
    \`pos = -1\` means no cycle. \`pos = 0\` on a one-node list is a self-loop."""
    head = build(values)
    if head is None or pos < 0:
        return head
    entry = head
    for _ in range(pos):
        assert entry.next is not None, "pos is past the end of the list"
        entry = entry.next
    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = entry
    return head


def to_list(head: ListNode | None, limit: int = 50) -> list[int | str]:
    """Scaffolding: read a list back out, GUARDED. A cyclic list has no end,
    so an unguarded read-back loop never returns — stop at \`limit\` and say so."""
    out: list[int | str] = []
    node = head
    steps = 0
    while node is not None:
        if steps >= limit:
            # either a cycle or just a long list — either way, stop walking
            out.append(f"...(stopped after {limit} steps)")
            break
        out.append(node.val)
        node = node.next
        steps += 1
    return out


# ------------------------------------------ approach 1: O(n^2) time, O(1) space
def cycle_detect_nested_walk(head: ListNode | None) -> bool:
    node = head
    index = 0
    while node is not None:
        probe = head
        for _ in range(index):  # re-scan only the nodes strictly before this one
            if probe is node:   # \`is\`, not \`==\`: identity, not value
                return True
            probe = probe.next
        node = node.next
        index += 1
    return False


# -------------------------------------------- approach 2: O(n) time, O(n) space
def cycle_detect_visited_set(head: ListNode | None) -> bool:
    seen: set[int] = set()
    while head is not None:
        if id(head) in seen:  # id() is the object's address: identity, not value
            return True
        seen.add(id(head))
        head = head.next
    return False


# -------------------------------------------- approach 3: O(n) time, O(1) space
def cycle_detect_floyd(head: ListNode | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:  # also makes fast.next.next safe
        slow = slow.next
        fast = fast.next.next
        if slow is fast:  # checked AFTER moving — they start equal
            return True
    return False


# ------------------ approach 4: O(n) time, O(1) space, DESTROYS the list's values
MARK = 100_001  # outside the legal value range -10**5 .. 10**5, so no real node holds it


def cycle_detect_value_marking(head: ListNode | None) -> bool:
    node = head
    while node is not None:
        if node.val == MARK:  # only a node WE stamped can hold this
            return True
        node.val = MARK  # destructive: the original value is gone for good
        node = node.next
    return False


APPROACHES = [
    ("nested_walk", cycle_detect_nested_walk),
    ("visited_set", cycle_detect_visited_set),
    ("floyd", cycle_detect_floyd),
    ("value_marking", cycle_detect_value_marking),
]


def main() -> None:
    # (label, values, pos, expected)   pos = -1 means no cycle
    cases: list[tuple[str, list[int], int, bool]] = [
        ("statement example: 1->2->3->(back to 2)", [1, 2, 3], 1, True),
        ("statement example: 1->2->None", [1, 2], -1, False),
        ("empty list", [], -1, False),
        ("single node, no cycle", [7], -1, False),
        ("single node, self-loop", [7], 0, True),
        ("two nodes, loop on the pair", [1, 2], 0, True),
        ("duplicate values, NO cycle", [1, 2, 1, 2, 1], -1, False),
        ("duplicate values, cycle", [1, 2, 1, 2, 1], 2, True),
        ("worked example: 1->2->3->4->(back to 2)", [1, 2, 3, 4], 1, True),
        ("cycle is the whole list", [5, 6, 7], 0, True),
        ("cycle is the last node only", [5, 6, 7], 2, True),
    ]
    random.seed(37)
    # 2000 nodes: quadratic approach 1 stays under a second, and the linear ones
    # have to walk far enough that an off-by-one would show.
    big = [random.randint(-100_000, 100_000) for _ in range(2000)]
    cases.append(("stress: 2000 nodes, no cycle", big, -1, False))
    cases.append(("stress: 2000 nodes, cycle at 500", big, 500, True))

    all_agreed = True
    for label, values, pos, expected in cases:
        head = build_with_cycle(values, pos)
        preview = to_list(head, limit=8)
        print(f"\\n{label}\\n  shape: {preview}  (n={len(values)}, pos={pos}, expected={expected})")
        results: dict[str, bool] = {}
        for name, fn in APPROACHES:
            # value_marking destroys the data, so every run gets a fresh list
            got = fn(build_with_cycle(values, pos))
            results[name] = got
            ok = got == expected
            all_agreed &= ok
            print(f"  {name:<15} -> {str(got):<5}  {'ok' if ok else 'MISMATCH'}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree with each other")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND — see the MISMATCH lines above")


if __name__ == "__main__":
    main()`,
}

export default doc
