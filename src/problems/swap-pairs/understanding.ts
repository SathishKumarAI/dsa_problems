// swap-pairs — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Picture a row of numbered railway carriages coupled front to back. Somebody asks you to swap the
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

If a node holds nothing but an \`int\`, swapping values and swapping nodes print identically, and it is
fair to ask why anybody cares. Three reasons, each of which has broken real code:

| Situation | What a value swap does |
|---|---|
| A node carries a payload — an object, a key *and* a value, a buffer, a mutex | You must copy every field, and you silently copy the ones you forgot about too. A node identity that other code keys on is now attached to the wrong data |
| Something else holds a pointer to a node — an index, an LRU entry, a cursor, another list threaded through the same nodes | The pointer is still valid and now refers to a node whose contents changed under it. Nothing crashes; the other structure is simply wrong |
| The node is immutable, or \`val\` is \`const\`, or the list is a value type | It does not compile |

So the statement's requirement is not pedantry. It is the difference between an algorithm that
rearranges a structure and one that shuffles data through a fixed structure. The document's own test
harness therefore checks **node identity**, not just values — and that is the only check that can
tell the two apart.

### The constraints, and what each one unlocks

The worked example traced in every section is five nodes, because an odd length is where the guard
earns its keep and two pairs is the minimum that shows \`prev\` moving:

\`\`\`
n0(1) → n1(2) → n2(3) → n3(4) → n4(5) → ∅        answer: n1(2) → n0(1) → n3(4) → n2(3) → n4(5) → ∅
\`\`\`

**Every trace below tracks node labels, not values.** That is not decoration — it is the only way the
first approach's failure is visible at all.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= nodes <= 100`",
    "what": "A hundred nodes, so nothing here is about speed — an `O(n)` array or 50 stack frames both pass comfortably. This is the constraint that makes the problem purely about **shape**. But note the **0**: an empty list is legal input, so every approach must return `None` for `None`, and `nodes[0]` is a crash waiting for the array rung."
  },
  {
    "constraint": "values in `0..100`",
    "what": "Values are inert and **not unique**, so you can never identify a node by its value. Everything positional, everything by pointer. Also why a value swap is undetectable by printing."
  },
  {
    "constraint": "\"the swap has to be done by **relinking**\"",
    "what": "The actual requirement. This is the constraint that puts a rung at the bottom of the ladder which is fast, constant-space, two lines long, and disqualified."
  },
  {
    "constraint": "\"an **odd** number of nodes leaves the last one where it is\"",
    "what": "This is the constraint that dictates the loop guard: you must test both the node **and the node after it**, because a lone tail has no partner. Testing only the first walks off the end."
  },
  {
    "constraint": "\"0 and 1 nodes return unchanged\"",
    "what": "Spelled out so the guard is not an afterthought. The same two-part test handles both."
  },
  {
    "constraint": "\"the first pair changes the head\"",
    "what": "**This is the constraint the dummy node exists for.** Whatever you return is not the head you were given — unless there was no pair at all, which is the case that makes a naive \"remember `head.next`\" version need its own branch."
  }
]
