// char-replacement — approach 3 — The same window, with a most-frequent count that is never lowered
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
  rung: "window",
  title: "The same window, with a most-frequent count that is never lowered",
  idea: `*Does the most-frequent count actually have to be correct?* No. Keep it as a **high-water mark** —
raise it when an arrival beats it, never lower it when the window shrinks. Delete the \`max()\` scan
entirely and the answer is still right.

This fixes Approach 2's weakness: **it scans 26 slots after every move to re-derive a number that a
single increment could only have changed in one place.**`,
  intuition: `> **Intuition.** Stop reading \`most\` as "the most frequent letter in the window" and start reading it
> as "the best letter concentration this sweep has ever seen". The window is not trying to be valid;
> it is trying to be at least as wide as the record, and \`most\` is how it remembers what the record was
> built from. Carrying a stale \`most\`, the window is holding itself to a standard set by a better
> window it already banked — so it refuses to grow, slides sideways at record width, and waits for a
> genuine improvement. Safe for the same reason a high-jump bar is never lowered mid-competition: you
> report the best height cleared, so refusing attempts that could not beat it costs nothing.`,
  worked: `\`s = "AABABBA"\`, \`k = 1\`. The \`true max\` column is shown only so the staleness is visible; the code
never computes it.

| \`right\` | char | \`left\` | window | len | \`A\` | \`B\` | \`most\` | true max | stale? | shrank by | \`best\` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | \`A\` | 0 | \`A\` | 1 | 1 | 0 | 1 | 1 | | 0 | 1 |
| 1 | \`A\` | 0 | \`AA\` | 2 | 2 | 0 | 2 | 2 | | 0 | 2 |
| 2 | \`B\` | 0 | \`AAB\` | 3 | 2 | 1 | 2 | 2 | | 0 | 3 |
| 3 | \`A\` | 0 | \`AABA\` | 4 | 3 | 1 | 3 | 3 | | 0 | **4** |
| 4 | \`B\` | 1 | \`ABAB\` | 4 | 2 | 2 | 3 | 2 | **stale** | 1 | 4 |
| 5 | \`B\` | 2 | \`BABB\` | 4 | 1 | 3 | 3 | 3 | | 1 | 4 |
| 6 | \`A\` | 3 | \`ABBA\` | 4 | 2 | 2 | 3 | 2 | **stale** | 1 | 4 |

Set this beside Approach 2's table and the mechanism is visible. Where the honest version shrank by
**two** at \`right = 4\` and again at \`right = 6\`, dropping to width 3 both times, this version shrinks
by **one** and holds width 4 — the record. At \`right = 4\` it carries \`most = 3\` while \`ABAB\` really
holds only 2 of each letter; the window is genuinely unaffordable and the code does not care, because
a width-4 window is exactly what has already been banked. Same answer, 4.

The effect is easier to see on a longer input, \`s = "AAAABBAAAA"\`, \`k = 1\`, where \`most\` reaches 4 at
\`right = 3\` and then stays wrong for four consecutive steps:

| \`right\` | window | len | \`most\` | true max | \`best\` |
|---|---|---|---|---|---|
| 3 | \`AAAA\` | 4 | 4 | 4 | 4 |
| 4 | \`AAAAB\` | 5 | 4 | 4 | **5** |
| 5 | \`AAABB\` | 5 | 4 | 3 | 5 |
| 6 | \`AABBA\` | 5 | 4 | 3 | 5 |
| 7 | \`ABBAA\` | 5 | 4 | 3 | 5 |
| 8 | \`BBAAA\` | 5 | 4 | 3 | 5 |
| 9 | \`BAAAA\` | 5 | 4 | 4 | 5 |

For four steps the window carries a number flatly wrong about its own contents, sliding at width 5
without growing. The answer, 5, is what the honest recomputing version also produces.`,
  code: `def char_replacement_stale_max(s: str, k: int) -> int:
    counts = [0] * ALPHABET
    best = 0
    most = 0  # high-water mark only; deliberately never decreased
    left = 0
    for right in range(len(s)):
        counts[slot(s[right])] += 1
        most = max(most, counts[slot(s[right])])
        while rewrites_needed(right - left + 1, most) > k:
            counts[slot(s[left])] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
  mistake: `> **Watch out.** Believing the staleness argument a little *too* well and returning \`most + k\` instead
> of the window width. The reasoning sounds airtight — the best window holds \`most\` copies of one
> letter plus \`k\` repaints, so its length is \`most + k\` — and the misconception is treating an **upper
> bound** as an achieved value. The string may simply not have \`k\` characters left to spend it on.
> Measured: \`"ABBB"\` with \`k = 2\` returns **5** for a string of length 4; the single-character \`"A"\`
> with \`k = 1\` returns **2**. It gives the right answer, 4, on the statement's own example, which is
> exactly why it survives the first test anyone runs. The window width is the only quantity guaranteed
> to correspond to a stretch that actually exists.`,
  cost: `**Time \`O(n)\`.** \`right\` moves n times, \`left\` at most n times, and each move does one array increment
or decrement, one comparison, and at most one \`max\` of two integers. Nothing scans the tally.

**Space \`O(1)\`.** The fixed 26-slot array — constant only because the alphabet is bounded.

This is the one to write, and more importantly the one to be able to **defend**. The code is shorter
than the honest version, which makes it look like a trick; the argument above is what turns it into
reasoning. The same shape — *the answer is a maximum, so a bound that only tightens is safe to leave
stale* — reappears in fruit-baskets and in most "longest subarray with property P" problems.

---`,
  notes: [
    { title: "why the staleness is safe", body: `This is what gets probed, so it is worth being able to say precisely. Two halves.

> **Why it works.** *A stale \`most\` can never make the answer too large.* \`most\` is only ever raised to
> a count that genuinely occurred in some window. Suppose at step \`right\` the code carries a \`most\`
> exceeding the current window's true maximum, and so judges an unaffordable window affordable. That
> window's width is at most \`most + k\`. But \`most\` was set when an earlier window really did hold
> \`most\` copies of one letter, and that window was itself affordable — so \`best\` was already raised to
> at least that width. The overstated window therefore reports nothing the honest record had not
> already reported.
>
> *And it can never make the answer too small.* Because the answer is a **maximum** and \`most\` only
> grows, the window can fail to expand but can never expand wrongly. Its width is monotonically
> non-decreasing: shrinking happens only when \`length − most > k\`, and with \`most\` pinned at its
> high-water mark that first becomes true exactly one character past the record. The window behaves
> like a ruler that grows to the record, then slides at that width, widening only on a real improvement.
>
> The one-sentence version: **a stale value can only stop the window growing, never grow it wrongly —
> and since we report the widest window ever reached, refusing to grow at a moment that could not have
> beaten the record costs nothing.**

A corollary falls straight out: the window shrinks by at most one character per right-move, so the
\`while\` never iterates twice. Writing \`if\` here is therefore *also* correct — a rare case of two
visibly different loops both being right — but \`while\` is the honest habit, since it is what the
skeleton demands and it stays correct if the recompute ever comes back.` },
  ],
}
