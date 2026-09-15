// valid-palindrome — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/valid-palindrome_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The only thing genuinely at stake here is *how much data you are willing to copy in order to ask a
simple question*. The cleaned-then-reversed version is honest, readable and two lines long, and it
answers the question by first constructing the object the question is easiest to ask about: a
contiguous, lowercased, alphanumeric-only string, plus its mirror image. But look at what that
construction is for. The comparison it enables touches each cleaned character exactly once and then
throws the whole structure away — a 200,000-character scaffold built to support a single walk
across it. The two-pointer version notices that the scaffold was never the point: the question is
about *mirrored pairs*, and a pair can be located by two indices that skip over the noise as they
move, so the filter dissolves into the walk instead of preceding it. That one shift — from "clean,
then ask" to "ask while cleaning" — buys three things at once: constant memory instead of linear,
one pass instead of two, and an early exit the copying version structurally cannot have, because it
must finish filtering before it can compare anything. The two details that actually fail people on
this supposedly easy question are both consequences of doing the filter inline: the pointers can
cross before any comparison happens (the all-punctuation string, where the answer is \`true\` because
an empty set of checked pairs is a satisfied set of checked pairs), and each side must be
case-folded at the moment of comparison rather than once up front (\`"0P"\` is the input that proves
it, and no friendly example ever does). Get those right and the pattern generalises immediately:
any time you are about to materialise a filtered copy so that two positions line up, ask first
whether a cursor could have skipped instead.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "Clean, then reverse",
      "O(n)",
      "O(n)",
      "Two extra copies of the string buy maximum clarity and zero index arithmetic",
      "Readability matters more than memory, the cleaned form is needed anyway, or you want a trustworthy oracle to cross-check a faster version against"
    ],
    [
      "Two pointers, skipping in place",
      "O(n)",
      "O(1)",
      "Folds the filter into the walk and gains an early exit; costs careful loop guards and strict ordering",
      "Large inputs, hot paths, memory limits — and any interview, because it shows the transferable idea"
    ]
  ]
}
