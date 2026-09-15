// cycle-detect — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given the first node of a chain and told to start walking, following each node's single arrow
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
  identity; every wrong answer below comes from confusing the two.`

export const unlocks: Unlock[] = [
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
]
