// char-replacement — approach 2 — One window, most-frequent count recomputed each step
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recompute",
  title: "One window, most-frequent count recomputed each step",
  idea: `*Stretches sharing a start already share a tally — can stretches sharing an* end *share one too?* Yes,
with a window. Keep a left and a right edge and one tally between them. Push the right edge out; while
the window is unaffordable, pull the left edge in. Each character is added once and removed at most
once.

This fixes brute force's central weakness: **the tally is discarded whenever the start moves, so each
character is re-tallied once for every start before it.**`,
  intuition: `> **Intuition.** A caterpillar inching along the row: the head reaches forward, and when the body is
> too long to paint within budget, the tail catches up. The structural claim that makes one pass
> enough is that the tail never has to back up — if a stretch ending at \`right\` is unaffordable from
> \`left\`, it is unaffordable from anything further left too, since moving left only lengthens the
> stretch without ever lowering the bill. Both edges move forward only, so the whole sweep costs at
> most \`2n\` moves. What stays wasteful is the **verdict**: after every move it scans all 26 slots to
> re-find the most frequent letter.`,
  worked: `\`s = "AABABBA"\`, \`k = 1\`. \`max\` is the honest most-frequent count; \`bill\` is \`rewrites_needed\`:

| \`right\` | char | \`left\` | window | len | \`A\` | \`B\` | \`max\` | \`bill\` | shrank by | \`best\` |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | \`A\` | 0 | \`A\` | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| 1 | \`A\` | 0 | \`AA\` | 2 | 2 | 0 | 2 | 0 | 0 | 2 |
| 2 | \`B\` | 0 | \`AAB\` | 3 | 2 | 1 | 2 | 1 | 0 | 3 |
| 3 | \`A\` | 0 | \`AABA\` | 4 | 3 | 1 | 3 | 1 | 0 | **4** |
| 4 | \`B\` | 2 | \`BAB\` | 3 | 1 | 2 | 2 | 1 | **2** | 4 |
| 5 | \`B\` | 2 | \`BABB\` | 4 | 1 | 3 | 3 | 1 | 0 | 4 |
| 6 | \`A\` | 4 | \`BBA\` | 3 | 1 | 2 | 2 | 1 | **2** | 4 |

At \`right = 4\` the window \`AABAB\` would need 2 rewrites against a budget of 1, so the tail catches up
**twice**, all the way to \`BAB\`. Same at \`right = 6\`. Note what the record does across those two rows:
nothing. The window shrank below a width it had already banked.`,
  code: `def char_replacement_recompute_max(s: str, k: int) -> int:
    counts = [0] * ALPHABET
    best = 0
    left = 0
    for right in range(len(s)):
        counts[slot(s[right])] += 1
        while rewrites_needed(right - left + 1, max(counts)) > k:  # 26 reads per check
            counts[slot(s[left])] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
  mistake: `> **Watch out.** Writing the shrink condition as \`>= k\` instead of \`> k\`. The rule is "at most \`k\`
> rewrites", so a bill of exactly \`k\` is legal and must be *kept*; \`>= k\` discards the very windows the
> budget was meant to buy. Measured on the statement's example it returns **2** instead of 4. Worse, on
> \`"ABCDE"\` with \`k = 0\` the condition \`0 >= 0\` holds for a single-character window, so the loop
> shrinks an already-minimal window and marches \`left\` off the end: **\`IndexError: string index out of
> range\`**. Choosing a comparison operator by feel rather than reading the rule back out of the
> statement is how a \`k = 0\` test case becomes a stack trace.`,
  cost: `**Time \`O(26 · n)\`.** The window is linear — \`right\` moves n times, \`left\` at most n times — but every
one of those ≤2n moves triggers a \`max()\` over 26 slots. Bounded by the alphabet constraint, so this is
genuinely \`O(n)\` with a constant near 26, not a hidden quadratic.

**Space \`O(1)\`.** One fixed array.

Right when you want correctness to be self-evident and a 26× constant is irrelevant — at \`n = 10⁵\`
that is ~2.6 million tally reads, which is fast. It is also the honest thing to write first and then
improve out loud, because the improvement is a *claim about the problem*, not a code trick.

---`,
}
