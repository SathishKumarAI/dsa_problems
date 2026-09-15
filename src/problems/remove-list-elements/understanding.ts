// remove-list-elements — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed the first bead on a string. Each bead is knotted to the bead in front of it and to
nothing behind it. Somebody names a colour and asks you to remove **every** bead of that colour,
handing back the string that remains — which may be no string at all.

Removing a bead means untying the knot that leads *into* it and retying that knot to whatever came
after. So the operation is not performed by the bead you are deleting; it is performed by the bead
**before** it. That single fact generates both difficulties in this problem.

**The core question: how do you delete every match in one forward pass, when deletion is something a
node's predecessor does and the head has no predecessor?** Two separate traps hide in that sentence,
and each rung below is an attempt at one or both:

| Trap | Why it bites |
|---|---|
| After a removal, the node that **slid into the gap may match too** | A loop that advances after every iteration skips it. The whole correctness of the final loop is one decision: *do not advance on a removal* |
| The **head** may match, and so may its replacement, and its replacement | The head has no predecessor to retie, so it needs its own loop — or a fake predecessor |

> **Intuition.** Think of the \`prev\` pointer as a pair of scissors held *behind* the node you are
> judging. You never cut the node you are standing on; you cut the one in front of you. So the
> question "can I delete the head?" becomes "is there anywhere to stand behind the head?" — and the
> answer is no, unless you invent somewhere.

### The constraints, and what each one unlocks

The worked example traced in every section is chosen to hit all three traps at once — a matching
head, a **run** of two adjacent matches, and a matching tail — which the statement's own first
example does not:

\`\`\`
n0(7) → n1(1) → n2(7) → n3(7) → n4(2) → n5(7) → ∅        val = 7        answer: [1, 2]
\`\`\`

Node labels, not values, because \`7\` appears four times and "the node holding 7" means nothing.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= nodes <= 10^4`",
    "what": "Ten thousand nodes. This is the constraint that **kills the recursive version**: one frame per node against CPython's default limit of 1000, measured as `RecursionError: maximum recursion depth exceeded` at `n = 10^4`. It also rules out the restart-the-scan version on adversarial input, and — via the **0** — makes the empty list a legal input every approach must survive."
  },
  {
    "constraint": "node values and the target both in `0..50`",
    "what": "Values are inert small integers. Nothing here is load-bearing: there is no sentinel, no marker trick, no arithmetic. The one thing the small range does is guarantee **duplicates**, and duplicates are the point — a target value may appear anywhere, everywhere, or in long runs."
  },
  {
    "constraint": "\"**EVERY** match goes, not just the first\"",
    "what": "This is the constraint that makes it a loop rather than a search. And it is the constraint behind the don't-advance rule: matches can be adjacent."
  },
  {
    "constraint": "\"the HEAD may match, and so may the node that replaces it\"",
    "what": "Spelled out, twice over. **This is the constraint the dummy node exists for**, and the reason the front of the list can need several removals in a row."
  },
  {
    "constraint": "\"every node may match, so the answer may be the empty list\"",
    "what": "The function must be able to return nothing. A version that returns `head` after mutating around it cannot — measured below, it returns the original list unchanged."
  },
  {
    "constraint": "\"an empty list in is an empty list out\"",
    "what": "No branch needed in the last two rungs; the loop test simply never passes."
  }
]
