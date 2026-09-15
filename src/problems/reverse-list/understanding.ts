// reverse-list — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/reverse-list_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Picture a paper chain where each link is glued to the one in front of it and to nothing else. You can
see which link comes next; you cannot see which link came before. You must turn the whole chain around
so the last link is now first and every glue joint points the other way, and hand back the link that is
now at the front.

**The core question: can you flip every arrow without ever losing your grip on the part of the chain
you have not flipped yet?** The naive approach is not slow in time, it is wasteful in space — the
instinct is to copy all the values into an array and build a brand-new chain backwards, which walks the
list once but allocates a second list the same size. The problem asked you to reverse the one you were
given.

Two pieces of vocabulary, expanded once:

- **In place** means you rearrange the nodes you already have instead of creating new ones. The same
  node objects come back, wired differently.
- **Singly linked** means each node knows only its successor. There is no arrow backwards, which is
  exactly why this problem is not trivial: once you step off a node, nothing points back to it unless
  you kept a variable pointing there yourself.

### The constraints, and what each one unlocks

The worked example traced in every section below:

\`\`\`
1 → 2 → 3 → 4 → ∅        answer: 4 → 3 → 2 → 1 → ∅
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`0 <= list length <= 5000`",
    "what": "This is the constraint that **kills the recursive version.** Five thousand nodes means five thousand nested calls; Python's default recursion limit is 1000, and a JVM stack will not reliably hold 5000 frames either. The iterative loop is unlocked by nothing — it is *required* by this."
  },
  {
    "constraint": "`-5000 <= node value <= 5000`",
    "what": "Values are ordinary small integers with no **sentinel** meaning. Nothing here rules out a value-marking trick, but there is no reason to want one: reversal never needs to remember which nodes it has seen."
  },
  {
    "constraint": "`an empty list is legal input`",
    "what": "Every approach must return `None` for `None` without crashing. The three-pointer version gets this free — starting `prev` at `None` means the empty case returns `None` before the loop body ever runs."
  },
  {
    "constraint": "\"reverse it **in place**\" (from the statement)",
    "what": "This is the real reason the copy-to-array version loses. It is not slower in time; it is **disqualified by the requirement.**"
  }
]
