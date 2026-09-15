// rpn-eval — approach 3 — One pass with a stack (optimal)
//
// Converted from docs/deep/rpn-eval_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "stack",
  title: "One pass with a stack (optimal)",
  idea: `*The tree is built once and walked once, in the same order — so why build it at all?* Evaluate as you
read. Push every number. When an operator arrives, the two values it needs are the two most recently
completed ones, so pop them, combine, and push the result back in their place. This fixes the tree
rung's weakness — **materialising a structure that is discarded after one traversal** — by keeping
only the finished values.`,
  intuition: `> **Intuition.** A **spike for receipts** on a counter. Every number you read goes on the spike. Every
> operator takes the top two receipts off, does the arithmetic, and puts a single new receipt back.
> The spike always holds results that are completely finished and waiting to be used by something
> further right. When the tokens run out, exactly one receipt is left, and it is the answer.

The reason this works with no precedence rules is that postfix already sequenced the operators for
you. An operator's operands are always the two most recent finished values because that is what the
notation *means*; the stack is not interpreting the expression, it is just holding what the expression
has already finished.`,
  worked: `\`tokens = ["4", "13", "5", "/", "+"]\`. The stack is shown with the **top on the right**.

| \`k\` | token | Action | Stack after |
|---|---|---|---|
| 0 | \`"4"\` | number → push | \`[4]\` |
| 1 | \`"13"\` | number → push | \`[4, 13]\` |
| 2 | \`"5"\` | number → push | \`[4, 13, 5]\` |
| 3 | \`"/"\` | pop right \`5\`, pop left \`13\`, \`13 / 5 = 2\`, push | \`[4, 2]\` |
| 4 | \`"+"\` | pop right \`2\`, pop left \`4\`, \`4 + 2 = 6\`, push | \`[6]\` |

One value left → answer **6**.

Step 3 is the whole problem in one row. The stack held \`[4, 13, 5]\`; the first pop returned \`5\` and
the second returned \`13\`; and the operation performed was \`13 / 5\`, not \`5 / 13\`. **The first value
popped is the right operand** — it has to be, because it was pushed last, and the operand written
closest to the operator is the right one. Compare this against the rewrite trace, where \`13\` and \`5\`
sat in written order and the answer looked obvious: the stack reverses them, and that reversal is the
single most common bug on this problem.`,
  code: `def rpn_eval_stack(tokens: list[str]) -> int:
    stack: list[int] = []  # values of completed subexpressions, left to right
    for tok in tokens:
        if tok in OPERATORS:
            right = stack.pop()  # pushed last, so it is the RIGHT operand
            left = stack.pop()
            stack.append(apply_op(tok, left, right))
        else:
            stack.append(int(tok))  # int() handles "-200": a leading minus is a sign, not an operator
    return stack[-1]`,
  mistake: `Popping into \`left\` first: \`left = stack.pop()\` followed by \`right = stack.pop()\`.

> **Watch out.** The misconception is that popping reads the stack **in written order**, so the first
> thing out must be the left-hand operand. It is the reverse: a stack returns what went in *last*, and
> the operand written nearest the operator — the right one — is the one pushed most recently. Reading
> the two pops top-to-bottom on the page while the values come out bottom-to-top in meaning is exactly
> how this bug survives a code review.

It produces a plausible wrong number rather than an error. On this document's worked example it
returns **4** instead of **6**, because it computes \`5 / 13 = 0\` and then \`4 + 0\`. On
\`["10", "3", "-"]\` it returns **−7** instead of **7**. And it hides in plain sight: on the statement's
*first* example \`["2", "1", "+", "3", "*"]\` it returns **9**, the correct answer, because \`+\` and \`*\`
are commutative. Any test suite built only from commutative operators certifies this bug as correct.

The second classic is writing \`left // right\` for division. Python's \`//\` floors toward negative
infinity while the problem demands truncation toward zero, so that variant returns **−4** for
\`["-7", "2", "/"]\` where the answer is **−3**. It agrees with the correct code on every non-negative
input — including this document's worked example, which still returns **6** — so, once again, only a
negative operand exposes it. Write \`int(left / right)\` deliberately, and remember that this is the one
line of the algorithm that differs across languages: C++ and Java's \`/\` already truncates toward zero,
so a direct port of the Python \`//\` would be wrong in Python only.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is one pass with \`O(1)\` per token — a set membership test and
either one push or two pops and a push. Space is the stack, and the bound is tight: a right-leaning
expression like \`1 2 3 4 + + +\` pushes all four numbers before any operator arrives, so \`n/2 + 1\`
values can be resident at once.

This is the answer to ship, and it is worth knowing as more than a puzzle solution — it is how a stack
machine actually executes arithmetic, from the JVM to the CPython bytecode interpreter. The natural
follow-up is the other half of the story: converting infix to postfix, which is the **shunting-yard
algorithm**, and which is also a stack. Between the two you can evaluate ordinary arithmetic
expressions without writing a parser.

---`,
  notes: [
    { title: "why it works", body: `> **Why it works.** The loop maintains one invariant: **the stack holds the values of every completed
> subexpression so far, in left-to-right order.** Pushing a number preserves it — a lone number is a
> completed subexpression. Applying an operator preserves it too: in valid postfix, an operator's two
> operands are the two subexpressions immediately preceding it, which are by the invariant the top two
> entries, and replacing them with their combined value is exactly the subexpression the operator
> completes. The "expression is always valid" constraint guarantees those two entries exist, which is
> why no emptiness check is needed; and it guarantees exactly one entry remains at the end, which is
> the value of the whole expression.` },
  ],
}
