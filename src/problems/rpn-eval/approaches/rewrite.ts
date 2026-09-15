// rpn-eval — approach 1 — Rewrite the token list in place
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
  rung: "rewrite",
  title: "Rewrite the token list in place",
  idea: `*Where can I find an operator whose operands are definitely plain numbers?* At the **first** operator
in the list — everything before it must be numbers, so the two tokens immediately to its left are its
operands. Replace those three tokens with their result and repeat; each pass shortens the list by two
until a single token remains.`,
  intuition: `> **Intuition.** Treat the token list as a strip of paper and keep **crossing out and rewriting**.
> Scan from the left until you meet the first operator; the two numbers just before it are its
> operands, guaranteed, because an operator any further left would have been found first. Rub out
> those three symbols, write the answer in their place, and start scanning again from the beginning.
> The strip gets shorter by two every time, so eventually one number is left, and that is the answer.

It is exactly how a person reduces the expression by hand. The waste is the restart: every pass
re-reads the prefix it has already read, and every rewrite shifts the rest of the list along.`,
  worked: `\`tokens = ["4", "13", "5", "/", "+"]\`. There is no stack in this approach — that absence is the point
of the rung. The state carried between steps is the whole shrinking list.

| Pass | List at start of pass | First operator (index) | Operands | Result | List after |
|---|---|---|---|---|---|
| 1 | \`["4", "13", "5", "/", "+"]\` | \`/\` at 3 | left \`13\`, right \`5\` | \`13 / 5 = 2\` | \`["4", "2", "+"]\` |
| 2 | \`["4", "2", "+"]\` | \`+\` at 2 | left \`4\`, right \`2\` | \`4 + 2 = 6\` | \`["6"]\` |

One token left → answer **6**.

Look at pass 1: the operands are the tokens at indices \`i-2\` and \`i-1\`, with \`i-1\` being the **right**
operand — \`13 / 5\`, not \`5 / 13\`. The order trap is already here, in a form that is easier to see than
on a stack, because the tokens are still sitting in their written order. Hold on to that picture; the
stack version pops them in the opposite order, which is exactly why it is easy to get wrong there.`,
  code: `OPERATORS: frozenset[str] = frozenset({"+", "-", "*", "/"})


def apply_op(op: str, left: int, right: int) -> int:
    if op == "+":
        return left + right
    if op == "-":
        return left - right
    if op == "*":
        return left * right
    return int(left / right)  # truncates toward zero; \`//\` would floor, so -7 / 2 -> -4


def rpn_eval_rewrite_in_place(tokens: list[str]) -> int:
    items = list(tokens)  # own copy: the caller's list is not ours to destroy
    while len(items) > 1:
        i = 0
        while items[i] not in OPERATORS:  # the FIRST operator is the only one whose
            i += 1                        # two operands are guaranteed to be numbers
        value = apply_op(items[i], int(items[i - 2]), int(items[i - 1]))
        items[i - 2 : i + 1] = [str(value)]
    return int(items[0])`,
  codeNote: `The operator set and the arithmetic itself are facts about the problem, not about any one approach, so
they live at module scope and every approach calls the same helper. Changing how division truncates is
then a one-line edit in one place.`,
  mistake: `Scanning for *any* operator rather than specifically the first one — most often by searching from the
right, which feels natural because the final operator is the root of the expression.

> **Watch out.** The misconception is that **every operator's two neighbours are its operands**. Only
> the leftmost operator has that guarantee. Any operator further right may have an *operator* sitting
> immediately before it, standing in for a whole subexpression that has not been reduced yet.

Running a last-operator variant on the statement's first example \`["2", "1", "+", "3", "*"]\` raises
\`ValueError: invalid literal for int() with base 10: '+'\` — it picks the \`*\` at index 4 and tries to
read \`"+"\` as one of its operands. A crash is the lucky outcome here; the same mistake in a language
that parses loosely would produce a number.`,
  cost: `**Time \`O(n²)\`, space \`O(n)\`.** The cost is the restart plus the rewrite: there are up to \`n/2\`
operators, and each one costs a scan from the beginning *and* a splice that shifts the remainder of
the list. Space is the working copy of the token list.

Use it to make the reduction visible when explaining postfix to someone — watching \`13 5 /\` collapse
into \`2\` is genuinely clarifying — and as the oracle the fast version is stress-tested against, which
is its job at the foot of this document. At \`10^4\` tokens it is about \`10^8\` operations; name that and
move on.

---`,
}
