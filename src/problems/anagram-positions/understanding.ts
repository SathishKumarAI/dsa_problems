// anagram-positions — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given a long piece of text and a short pattern, both lowercase letters. Slide a frame of
exactly the pattern's width along the text. At each position, ask: does the chunk inside the frame
use **exactly the same letters, the same number of times**, as the pattern — in any order? Every
position where the answer is yes goes into a list of start indices, and that list is the answer.

The single substitution that unlocks everything: **an anagram is not about order, it is about
counts**. "cba" and "bac" are anagrams of "abc" because all three contain one \`a\`, one \`b\` and one
\`c\`. So a window is an answer exactly when its 26-slot letter tally equals the pattern's 26-slot
letter tally. Order never enters the question, which means any solution that computes an ordering —
sorting, say — is answering a harder question than the one asked.

**The core question:** at each of the text's positions, does the window starting there have the same
letter counts as the pattern? The naive approach is slow because it rebuilds those counts from
scratch at every position, re-reading \`k\` characters per window when two neighbouring windows differ
by exactly two letters.

Two properties of this problem shape every rung below, and both are unusual enough to be worth
naming before any code:

- **The window is a fixed width.** Unlike most window problems, there is no growing and no
  shrinking: the frame is \`len(pattern)\` wide always, and "slide by one" means exactly *one letter
  enters and one letter leaves*. Two updates per step, forever.
- **Answers overlap, and that is normal.** The frame advances by one after a hit, never by \`k\`.
  \`"aaaa"\` with pattern \`"aa"\` answers at 0, 1 **and** 2 — three overlapping windows, all correct. A
  solution that jumps past a match to avoid "reusing" letters is not being careful, it is wrong.

The worked example used in every section below is the statement's own:

\`\`\`Python
text = "cbaebabacd", pattern = "abc"        answer: [0, 6]
\`\`\`

\`"cba"\` sits at index 0 and \`"bac"\` at index 6; both hold one \`a\`, one \`b\` and one \`c\`. The pattern
is \`k = 3\` wide, and the text has ten characters, so there are \`10 − 3 + 1 = 8\` windows to judge.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "text and pattern up to`3 · 10^4`, **lowercase letters only**",
        "what": "**This is the constraint that unlocks the fixed 26-slot array** in place of a hash map, and it is why every approach below is `O(1)` space rather than `O(k)`: the alphabet is bounded and known, so a plain array indexed by `ord(ch) - 97` replaces a dictionary and the comparison of two tallies is a fixed 26 steps regardless of the input. It is also the constraint whose *absence* would change the answer — Unicode text would need a map and the \"compare 26\" step would become \"compare however many distinct letters exist\"."
    },
    {
        "constraint": "every candidate has the pattern's length",
        "what": "**This is the constraint that makes it a fixed-width window.** There are at most `len(text) − len(pattern) + 1` candidates, all the same size, so nothing ever grows or shrinks — the only move is \"slide by one\", which changes exactly two letters."
    },
    {
        "constraint": "an anagram is about**counts**, not order",
        "what": "**This is the constraint that kills sorting.** Sorting produces an order nobody asked for, at `k log k` per window, and throws it away immediately. Two tallies answer the same question in a fixed 26 comparisons."
    },
    {
        "constraint": "windows overlap;`\"aaaa\"` with `\"aa\"` answers three times",
        "what": "Do not advance past a match. The step is always one."
    },
    {
        "constraint": "a pattern longer than the text has no windows at all",
        "what": "The answer is an empty list, and the two sliding approaches need an explicit guard for it — otherwise they compare a tally that was never filled. The two per-window approaches get it for free from an empty loop range."
    }
]
