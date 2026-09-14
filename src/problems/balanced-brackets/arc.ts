// balanced-brackets — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle this problem chases is *find the structure the rule is already describing, and then
store exactly that and nothing more*. The rule says a closer must match the most recent unmatched
opener, and "most recent, still unmatched" is not a hint toward a stack — it is the definition of
one, which is why this is the problem every stack chapter opens with. Start by not seeing that, and
you get the repeated-replace rung: find an innermost pair, delete it, start over, repeat until
nothing changes. It works, and it is quadratic, and the interesting thing about it is that it is
*already doing last-in-first-out* — the pairs dissolve strictly inside-out — it is merely paying a
full rescan and a full string rebuild for each pop. Name that, and the stack version is not an
invention but a transcription: keep the unmatched openers in a list, push on an opener, and on a
closer check the top and discard it. One pass, O(1) per character, and the three ways a string can be
broken map onto three lines of that loop — an empty stack when a closer arrives, a top that is the
wrong kind, and a stack that is not empty when the string runs out. Those three are the entire test
suite, and the two that get forgotten are the two that are about the stack's *size* rather than a
comparison, because neither can fire on a well-formed input. Then push once more and ask what the
stack is really for: if every opener were interchangeable, you would not need to know which one is on
top, only how many are open, and the whole structure collapses into a single integer walking a depth
gauge that must never go negative and must finish at zero. That last rung is worth the detour not
because you will often use it but because of what it costs: the moment the alphabet has three kinds,
the counter silently accepts \`(]\` and \`([)]\`, which proves that the stack's O(n) space was never
overhead — it was precisely the storage in which "wrong kind of closer" is a detectable event. Every
nesting problem after this one is the same loop with a richer payload on the stack: a repeat count
and a partial string in \`decode-string\`, a running total and a pending sign in the basic calculator,
a path segment in \`simplify-path\`. Get the three failure modes reflexive here, and those problems
become questions about what to store rather than questions about control flow.

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
      "Repeated replace",
      "O(n²)",
      "O(n)",
      "Needs no data structure and barely any thought, but rebuilds the whole string once per nesting level",
      "Explaining the inside-out pairing out loud, and as the oracle the fast version is stress-tested against"
    ],
    [
      "One pass with a stack",
      "O(n)",
      "O(n)",
      "Stores every unmatched opener, and that storage is exactly what makes all three failure modes detectable",
      "Always, for the real three-kind problem — and as the template for every later nesting problem"
    ],
    [
      "Single counter",
      "O(n)",
      "O(1)",
      "Drops identity to keep only depth: constant space, but failure mode 2 becomes undetectable",
      "Only when the alphabet is a single bracket kind — parser depth counting, `(`/`)`-only variants"
    ]
  ]
}
