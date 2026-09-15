// char-replacement — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You have a row of coloured tiles and a pot of paint that will cover at most \`k\` of them. You may
repaint any tile any colour. You want the **longest unbroken stretch of one colour** you can end up
with, and you report that stretch's length — not its colour, not where it is.

Formally: a string \`s\` of uppercase letters, a budget \`k\`, and you may change up to \`k\` characters to
any letters you like.

The rephrasing that makes it tractable comes from asking what a *given* stretch costs. Pick a stretch
and decide which letter it should become. Every position already holding that letter is free; every
other position costs one rewrite. So the cheapest way to make a stretch uniform is to keep whichever
letter is already most common inside it and repaint the rest:

> A stretch is affordable exactly when **(its length) − (the count of its most frequent letter) ≤ k**.

**The core question:** what is the longest stretch whose non-majority characters fit inside the budget?
The naive approach is slow because it asks that independently for every one of the ~n²/2 stretches,
re-tallying letters it tallied a moment ago.

### The worked example used in every section below

\`\`\`
s = "AABABBA", k = 1        answer: 4

index:  0  1  2  3  4  5  6
char:   A  A  B  A  B  B  A
\`\`\`

Four is reachable more than once — \`AABA\` at 0–3 becomes \`AAAA\` by repainting one \`B\`, and \`BABB\` at
2–5 becomes \`BBBB\` by repainting one \`A\`. That the answer is reachable by *several* stretches turns out
to be the hinge of Approach 3.

### Shared scaffolding

Two decisions recur in all three approaches, so they are named once. They are harness for reading the
code, not part of any answer:

\`\`\`python
ALPHABET = 26  # uppercase English letters; the constraint that makes a fixed array legal

def slot(ch: str) -> int:
    """Tally index for an uppercase letter."""
    return ord(ch) - ord("A")

def rewrites_needed(length: int, most_frequent: int) -> int:
    """The problem's whole rule: everything in the stretch that is not the majority letter."""
    return length - most_frequent
\`\`\`

Changing the alphabet, or the affordability rule, means editing exactly one of these.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= s.length <= 10^5`",
    "what": "Forbids the quadratic version: 10⁵ characters is ~5·10⁹ stretches, each paying per-stretch tally work. Also promises the string is never empty, so the answer is always at least `1` and there is no empty-input branch."
  },
  {
    "constraint": "`s` consists of uppercase English letters",
    "what": "The **permission slip**. Twenty-six symbols, fixed and known in advance, is what makes the tally a `[0] * 26` array rather than a hash map — `ord(ch) - ord(\"A\")` is the slot. That is what makes the space `O(1)`, and what makes \"scan the whole tally for its maximum\" a *bounded* 26-step operation rather than an input-dependent cost, which is why the middle rung below is still technically linear. On Unicode both claims collapse."
  },
  {
    "constraint": "`0 <= k <= s.length`",
    "what": "The budget may exceed anything usable. When `k >= len(s) - 1` the answer is the whole string, and every approach here arrives there with no special case."
  },
  {
    "constraint": "`k = 0` means no rewrites at all",
    "what": "A real test, not a formality: the answer becomes the longest run *already present*, so `\"ABCDE\"` must give `1` and `\"AABBBCC\"` must give `3`. Any off-by-one in the affordability test surfaces here first."
  }
]
