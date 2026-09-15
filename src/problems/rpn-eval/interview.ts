// rpn-eval — which rungs to know cold, and the drills
//
// Converted from docs/deep/rpn-eval_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.

export const interview = `**Memorise cold: the stack version, with the operand order and the truncation both deliberate.** The
loop is eight lines and writing it is not the hard part; the hard part is that the two details most
likely to fail are invisible in a green test run built from \`+\` and \`*\`.

> **In an interview.** Say the ordering out loud as you write the pops — *"the first pop is the right
> operand, because it was pushed last"* — and say the division rule as you write it — *"truncating
> toward zero, so \`int(left / right)\`; Python's \`//\` would floor and give \`-4\` for \`-7 / 2\`."* Then
> test yourself on \`["10", "3", "-"]\` and \`["-7", "2", "/"]\` rather than on something commutative,
> because a commutative test proves nothing here. The follow-up is almost always "and how would you
> evaluate an ordinary infix expression?" — the answer is shunting-yard, converting to postfix with a
> second stack for operators.

**Memorise second: why postfix needs no parentheses.** It is one sentence — *the position of the
operator already determines its operands, so there is nothing for precedence or brackets to
disambiguate* — and it is the sentence that explains why this notation exists at all and why compilers
and calculators convert into it. It also sets up the shunting-yard follow-up, and it is the difference
between reciting an algorithm and understanding the format it operates on.

**Understand but do not drill: the rewriting rung and the expression tree.** The rewriting version is
worth thirty seconds to show the reduction concretely and to price at \`O(n²)\`; its one transferable
lesson is that only the *leftmost* operator has guaranteed-numeric operands. The tree is worth knowing
mainly so you can decline it for the right reason: it is \`O(n)\` like the stack, so the argument is not
speed but that it allocates a node per token and recurses \`n\` deep to build something it discards
after a single walk. If the question ever becomes "print this expression in infix" or "simplify it",
the tree stops being overkill and becomes the answer — that is the boundary to be able to state.

---`
