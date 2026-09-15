// rpn-eval — approach 2 — Build the expression tree, then evaluate it
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
  rung: "tree",
  title: "Build the expression tree, then evaluate it",
  idea: `*The rewriting rung loses the expression's structure by flattening it as it goes — what if the
structure were made explicit first?* Every postfix expression describes a tree: operators are internal
nodes, numbers are leaves. Build that tree, then evaluate it bottom-up. This fixes the rewriting
rung's weakness — **rescanning and respliceing the list for every operator** — by reading each token
exactly once during construction.`,
  intuition: `> **Intuition.** Read the tokens from the **right**. The very last token must be the outermost
> operator — the one applied last — so it is the root. Its right operand is whatever expression sits
> immediately to its left, and its left operand is whatever sits before *that*. Peel from the right
> end and each token is consumed exactly once, with the recursion keeping track of how far you have
> got.

Notice the construction order: the **right** subtree is built before the left, because the right
operand is the one adjacent to the operator. That is the operand-order trap appearing in yet another
costume, and it is the same fact that will make the first stack pop the right operand.`,
  worked: `\`tokens = ["4", "13", "5", "/", "+"]\`, built from index 4 leftward. The state here is the **call
stack** — the same last-in-first-out structure as a data stack, wearing recursion as a disguise.

| Step | Call | Token at \`i\` | Action | Returns (subtree, next \`i\`) |
|---|---|---|---|---|
| 1 | \`build(4)\` | \`+\` | operator → build right first | *(pending)* |
| 2 | \`build(3)\` | \`/\` | operator → build right first | *(pending)* |
| 3 | \`build(2)\` | \`5\` | leaf | \`(5, 1)\` |
| 4 | \`build(1)\` | \`13\` | leaf — left operand of \`/\` | \`(13, 0)\` |
| 5 | *(back in step 2)* | | combine → \`/(13, 5)\` | \`(/(13,5), 0)\` |
| 6 | \`build(0)\` | \`4\` | leaf — left operand of \`+\` | \`(4, −1)\` |
| 7 | *(back in step 1)* | | combine → \`+(4, /(13,5))\` | \`(+(4,/(13,5)), −1)\` |

The tree is \`+( 4, /(13, 5) )\`. Evaluating bottom-up: \`/\` gives \`13 / 5 = 2\`, then \`+\` gives
\`4 + 2 = 6\`. Answer **6**.

Now compare that table with the stack trace in the next section, because the comparison is the whole
argument. The tree is built, walked once, and thrown away. **Every node is visited exactly twice —
once to create it, once to evaluate it — and nothing is ever revisited.** A structure that is written
once and read once in the same order is not a structure you need to materialise; you can evaluate as
you build. Doing so is the next approach.`,
  code: `@dataclass
class Node:
    """Scaffolding for the tree rung only: a leaf holds a number token, an internal node an operator."""

    token: str
    left: Node | None = None
    right: Node | None = None


def _build(tokens: list[str], i: int) -> tuple[Node, int]:
    """Build the subtree ending at index i; return it and the index just left of it."""
    tok = tokens[i]
    if tok not in OPERATORS:
        return Node(tok), i - 1
    right, after_right = _build(tokens, i - 1)  # right operand is adjacent to the operator
    left, after_left = _build(tokens, after_right)
    return Node(tok, left, right), after_left


def _evaluate(node: Node) -> int:
    if node.left is None:  # a leaf, so the token is a number
        return int(node.token)
    return apply_op(node.token, _evaluate(node.left), _evaluate(node.right))


def rpn_eval_expression_tree(tokens: list[str]) -> int:
    root, _ = _build(tokens, len(tokens) - 1)
    return _evaluate(root)`,
  codeNote: `The tree node is **scaffolding, not answer** — it exists only so the structure can be pointed at.`,
  mistake: `Building the **left** subtree first — writing \`left, after = _build(tokens, i - 1)\` and then the right
from what remains.

> **Watch out.** The misconception is that "left comes first" is a rule about **construction order**.
> It is a rule about *position in the written expression*, and you are reading the expression
> backwards. The subexpression adjacent to an operator on its left is that operator's **right**
> operand, because the left operand was written earlier still.

This is the identical error to popping the operands in the wrong order, and it fails on identical
inputs: commutative expressions survive it untouched, and \`["10", "3", "-"]\` comes out as \`-7\` instead
of \`7\`.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is one construction pass plus one evaluation pass, each visiting
every token once. Space is the tree itself — one node per token — plus a recursion depth that reaches
\`n\` on a deeply left-leaning expression like \`1 2 3 4 + + +\`, which is a real stack-overflow risk at
the stated \`10^4\` tokens.

Build a tree when you need the tree **for something else**: printing the expression back in infix,
simplifying it algebraically, optimising it, or evaluating it more than once. If all you need is the
value, this allocates \`n\` objects and recurses \`n\` deep to produce a number the next approach gets
with a single list. Knowing why to *reject* it is worth more here than knowing how to write it.

---`,
}
