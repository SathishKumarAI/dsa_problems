// permutation-in-string — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You have a short word on a scrap of paper and a long sentence. Somewhere in that sentence, is there a
run of consecutive letters that uses **exactly** the letters of your word — the same letters, the same
number of each, in any order? You do not have to say where; you answer yes or no.

Formally: given lowercase strings \`s1\` and \`s2\`, does \`s2\` contain a contiguous substring that is a
rearrangement of \`s1\`?

The observation that reframes the problem is small and decisive. A rearrangement of \`s1\` has exactly
\`s1\`'s letters, so it has exactly \`s1\`'s **length**. You are not searching for a substring of unknown
size — you know the width before you start, and the only question is which of the \`len(s2) - len(s1) + 1\`
positions works.

**The core question:** does some window of known width hold exactly \`s1\`'s letter counts? The naive
approach is slow because it answers that by rebuilding each window from its own characters — sorting
them, or counting them from scratch — when consecutive windows differ by only two characters.

### Two shapes of window, and this is the easier one

| Shape | Rule | Example |
|---|---|---|
| **Fixed width** | The width is known in advance. One character enters, one leaves, then test. | this problem |
| Variable width | Grow the right edge until valid, then shrink the left edge *while it stays valid*. | min-cover-substring |

Knowing the width collapses the bookkeeping. There is no shrink loop, no validity-driven left edge, no
amortised argument to make — just \`right\` advancing and \`left\` following at a fixed distance behind it.
Everything interesting in this problem is therefore about the **test**, not the skeleton, and the ladder
below is three different tests over the same two edges.

### The worked example used in every section below

\`\`\`
s1 = "ab", s2 = "eidbaooo"        answer: true   ("ba" sits at index 3)

index:  0  1  2  3  4  5  6  7
char:   e  i  d  b  a  o  o  o
\`\`\`

The window width is \`len(s1) = 2\` throughout, and there are \`8 - 2 + 1 = 7\` positions to consider.

### Shared scaffolding

Two decisions recur across the approaches, so they are named once. They are harness for reading the
code, not part of any answer:

\`\`\`python
ALPHABET = 26  # lowercase English letters; the constraint that makes a fixed array legal

def slot(ch: str) -> int:
    """Tally index for a lowercase letter."""
    return ord(ch) - ord("a")

def tally(text: str) -> list[int]:
    """One count per letter of the alphabet."""
    counts = [0] * ALPHABET
    for ch in text:
        counts[slot(ch)] += 1
    return counts
\`\`\`

Changing the alphabet means editing exactly one of these.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= s1.length, s2.length <= 10^4`",
    "what": "Rules out re-deriving each window from scratch. With both at 10⁴ there are ~10⁴ windows of width ~10⁴; sorting each is ~10⁴ · 10⁴ · log(10⁴) elementary steps, which does not finish."
  },
  {
    "constraint": "both strings are lowercase English letters",
    "what": "The **permission slip**, doing most of the work here. Twenty-six symbols, fixed and known, is what makes the tally a `[0] * 26` array rather than a hash map — `ord(ch) - ord(\"a\")` is the slot. It is also what makes `have == need` a bounded 26-slot comparison instead of an input-dependent cost, and above all what makes the final rung *expressible at all*: \"how many letters currently agree\" is only a meaningful summary because the number of letters is finite, known, and small enough that `agree == 26` is a terminal condition you can test in one comparison."
  },
  {
    "constraint": "the match must be **contiguous**",
    "what": "This is what makes it a window problem rather than a counting problem. Scattered letters in the right numbers do not count — `\"eidboaoo\"` contains an `a` and a `b` and is still a `false`."
  },
  {
    "constraint": "`s1` longer than `s2` means no window can exist",
    "what": "A free early exit, and a real one: without it the window logic has to cope with a width larger than the string it slides along."
  }
]
