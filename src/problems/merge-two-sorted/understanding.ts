// merge-two-sorted — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/merge-two-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Two queues of people are already standing in height order, each in its own line. You must combine them
into one line, also in height order — but you may not clone anybody. You move the **people you were
given**, re-pointing who stands behind whom, and hand back whoever ends up at the front.

Formally: you are given the first nodes of two chains, each already ascending. Produce a single
ascending chain containing every node from both, built by re-pointing the nodes you were handed rather
than allocating new ones, and return its first node.

**The core question: given two sequences that are each already sorted, how little work do you have to
do to interleave them?** The naive approach is slow because it throws the sortedness away — dump every
value into an array, sort it, rebuild. That is \`O((n+m) log(n+m))\` to recover an ordering you were
handed for free, and it allocates a node per value when the statement asked you to splice.

Two pieces of vocabulary, expanded once:

- **Splice** means change \`next\` pointers so existing node objects end up in a new order. The result
  contains the same node objects you were given, not copies of their values.
- **Dummy head** (also called a sentinel) is a throwaway node placed in front of the answer so that
  "attach the next node to the end of the result" is one line even when the result is still empty.
  You return \`dummy.next\` and let the dummy be garbage.

### The constraints, and what each one unlocks

The worked example traced in every section below:

\`\`\`
a = 1 → 3 → 5        b = 2 → 4        answer: 1 → 2 → 3 → 4 → 5
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`both lists are sorted ascending`",
    "what": "**This is the constraint that unlocks everything.** Because each list is sorted, the smallest remaining value overall is always one of the two front nodes — you never have to look past them. That single fact turns an `O(k log k)` sort into an `O(k)` walk. Remove this constraint and approach 1 is the only correct one left."
  },
  {
    "constraint": "`either list may be empty`",
    "what": "Forces a decision about the **base case**. The recursive version handles it with `if not a or not b: return a or b`; the iterative version handles it by falling out of the `while` immediately and running `tail.next = a or b`, which correctly attaches either the survivor or `None`. Neither needs a dedicated `if` at the top."
  },
  {
    "constraint": "`0 <= each list length <= 50`",
    "what": "Tiny. At most 100 stack frames, so the **recursive** version is *actually safe here* — which is worth saying honestly. It is the habit that is dangerous, not this instance: the same shape on merge-k-lists or on a `10^4`-node input blows the stack."
  },
  {
    "constraint": "`-100 <= node value <= 100`",
    "what": "Values repeat constantly in this range, which makes the `<=` vs `<` choice visible: `<=` keeps equal elements in `a`-before-`b` order, a **stable** merge. Both produce a correctly sorted list; only `<=` preserves the relative order of ties."
  },
  {
    "constraint": "\"splice existing nodes (no new value nodes)\"",
    "what": "This is the requirement that disqualifies approach 1 outright, **independent of its complexity**."
  }
]
