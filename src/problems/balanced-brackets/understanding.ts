// balanced-brackets — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed a string made of nothing but the six characters \`(\`, \`)\`, \`[\`, \`]\`, \`{\`, \`}\`. Decide
whether it is *well-formed*. Well-formed means two things at once: every opening bracket eventually
gets a closing bracket **of the same kind**, and the closings happen in the right order — the
bracket you opened most recently is the one you must close first. \`([{}])\` is well-formed. \`(]\` is
not, because the \`]\` closes something that was never opened. \`([)]\` is not either, even though the
counts of each kind match perfectly, because the \`)\` tries to close a \`(\` while a \`[\` is still open
in between.

**The core question is: when a closing bracket arrives, which opening bracket is it supposed to be
closing?** The answer is always *the most recent one that is still unmatched* — and that phrase, "the
most recent one still unmatched", is the entire problem. The naive approach is slow because it finds
those pairs by repeatedly deleting adjacent matched pairs and starting the scan over from the
beginning, so a string nested n deep gets rescanned about n/2 times.

This is the canonical stack problem, and it is worth being precise about *why* it is canonical.
A stack is the data structure whose defining behaviour is **last in, first out**: the thing you can
take out is the thing you put in most recently. The rule this problem states — a closer must match
the most recent unmatched opener — is not merely *solvable with* a stack; it is a restatement of
what a stack does. Almost every other problem in this pattern is this rule with a payload attached.`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= s.length <= 10^4`",
    "what": "The string is never empty, so you never have to decide what an empty string means (both general approaches below happen to call it balanced, which is the conventional answer, but the constraint means you are never graded on it). The upper bound is what prices the first rung out: the repeated-replace approach can need one pass per nesting level, and `((((...))))` at 10⁴ characters means ~5000 passes over a ~10⁴-character string, which is around 5 × 10⁷ character operations — slow enough to notice, and pure waste."
  },
  {
    "constraint": "`s holds only the six characters ()[]{}`",
    "what": "**A bounded alphabet, and this is the permission slip for the whole approach.** Because there are exactly three kinds and nothing else can appear, \"is this character a closer?\" is a three-entry dictionary lookup, and \"otherwise it is an opener\" is safe without any validation — there is no third category to worry about, no letters, no spaces. It is also what makes the final constant-space rung expressible at all, once the alphabet is narrowed further to a single kind."
  },
  {
    "constraint": "every closer must match the most recent unclosed opener",
    "what": "**This is the constraint that unlocks the stack, and it does so by being literally the same sentence.** \"Most recent, still unmatched\" is the definition of a stack's top. Once you notice that, you have not found a clever trick — you have found that the problem statement already told you the data structure."
  }
]
