// rpn-eval — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/rpn-eval_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *stop storing structure you are only going to walk once*.
Postfix exists so that no precedence rules and no parentheses are needed — the position of each
operator already says exactly which two values it applies to — and the whole ladder is about trusting
that fact more and more completely. Take it least seriously and you get the rewriting rung: find the
leftmost operator, where the two preceding tokens are guaranteed to be plain numbers, collapse the
three into one, and start over. It works, it reduces the expression the way a person would by hand,
and it is quadratic, because every operator costs a scan from the beginning plus a splice that shifts
everything after it. Take the structure seriously instead and you reach for a tree: operators are
internal nodes, numbers are leaves, and reading the tokens from the right makes the last one the root.
That is \`O(n)\` and it is the instinctive move for anyone who has written a parser — but watch what it
does with what it builds. Every node is created once and evaluated once, in the same order, and then
the entire tree is discarded, which is the tell that materialising it was never necessary. Collapse
the two passes into one and the tree becomes a stack of finished values: push each number, and when an
operator arrives pop the two most recent results, combine them, and push the answer back in their
place. The invariant is that the stack always holds the completed subexpressions in left-to-right
order, and the guarantee that the input is valid is what removes every error path — two operands are
always waiting, and exactly one value is always left at the end. What remains after the algorithm is
settled is the part that actually costs people the submission, and neither half of it is about
control flow. **The first value popped is the right operand**, because it was pushed last, which
\`+\` and \`*\` will never reveal and \`-\` and \`/\` reveal immediately; and integer division here truncates
toward zero rather than flooring, which every non-negative test agrees with and only a negative
operand exposes. Both produce plausible wrong answers rather than crashes, which is why they survive
casual testing, and why the fix for both is to put a subtraction and a negative division in your test
data before you trust anything. Learn this loop with those two details attached and pair it with
shunting-yard, which converts infix to postfix and is also a stack, and most expression questions are
covered without ever writing a parser.

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
      "Rewrite in place",
      "`O(n²)`",
      "`O(n)`",
      "Needs no data structure and mirrors hand reduction, but restarts the scan and splices the list per operator",
      "Explaining what postfix reduction *is*, and as the oracle the fast version is stress-tested against"
    ],
    [
      "Expression tree",
      "`O(n)`",
      "`O(n)` + recursion depth `n`",
      "Makes the structure explicit and reusable, then throws it away after one traversal",
      "You need the tree for something else — printing infix, simplifying, optimising, evaluating repeatedly"
    ],
    [
      "One pass with a stack",
      "`O(n)`",
      "`O(n)`",
      "Keeps only finished values, never the structure; the cost is that operand order becomes invisible on the page",
      "Always, for evaluation — and it is how real stack machines execute arithmetic"
    ]
  ]
}
