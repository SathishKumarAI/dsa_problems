// rpn-eval — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/rpn-eval_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are given an arithmetic expression written in **reverse Polish notation** — also called postfix —
as a list of tokens. Each token is either an integer or one of \`+\`, \`-\`, \`*\`, \`/\`. Evaluate it and
return the single integer result.

Postfix means the operator comes **after** its two operands instead of between them. Ordinary infix
\`2 + 1\` is written \`2 1 +\`. Something bigger, \`(2 + 1) * 3\`, is written \`2 1 + 3 *\`: first the tokens
that compute \`2 + 1\`, then the \`3\`, then the \`*\` that combines them.

> **Intuition.** Postfix is what you get if you write down each operation **at the moment you are
> ready to perform it** rather than where it sits in the sentence. You cannot multiply before you
> have added, so the \`+\` is written first and the \`*\` last.

That ordering is the entire reason the notation exists. Infix needs precedence rules to know that
\`2 + 1 * 3\` means \`2 + (1 * 3)\`, and it needs parentheses to override them when you mean
\`(2 + 1) * 3\`. **Postfix needs neither.** The position of each operator already says precisely which
two values it applies to, so there is no ambiguity to resolve, no precedence table, and no bracket
anywhere in the input — which is why compilers and calculators convert to it before evaluating.

**The core question is: when an operator appears, which two values does it combine?** The answer is
always *the two most recently completed values*, which is what makes this a stack problem. The naive
approach is slow because it locates those two values by scanning the token list from the start every
time and physically rewriting the list in place, so a long expression is rescanned once per operator.

The two traps in this problem are not about the algorithm at all, and both produce **plausible wrong
answers rather than crashes**, which is what makes them dangerous:

| Trap | What goes wrong | Why it hides |
|---|---|---|
| **Operand order** | The first value you pop is the **right** operand, not the left | \`+\` and \`*\` are commutative, so half your tests pass regardless. Only \`-\` and \`/\` expose it |
| **Division truncation** | Integer division must truncate **toward zero**, so \`-7 / 2\` is \`-3\` | Every non-negative case agrees with flooring. Only a negative operand exposes it |

### The constraints, and what each one unlocks

The worked example used in every section below is the statement's second example, chosen because it
contains a division and so exercises both traps:

\`\`\`
tokens = ["4", "13", "5", "/", "+"]        answer: 6        (4 + (13 / 5) = 4 + 2)
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= tokens.length <= 10^4`",
    "what": "**This prices out the rewriting rung.** Rewriting the list once per operator is `O(n²)`, which at `10^4` tokens is around `10^8` element moves — slow, and pure waste. The lower bound means there is always at least one token, so the smallest legal input is a single number with no operator at all, and `[\"42\"]` must return `42`."
  },
  {
    "constraint": "each token is an operator or an integer in `-200 … 200`",
    "what": "**A bounded, tiny alphabet of operators, and this is what lets a four-way dispatch stand in for a parser.** There are exactly four operations, so a single named helper covers every case with no grammar, no tokeniser, no precedence table. Note that operands may be **negative**, so `\"-7\"` is a number and not the operator `\"-\"` — any test that checks \"does this token start with a minus\" is already broken."
  },
  {
    "constraint": "the expression is always valid, so an operator always has two operands waiting",
    "what": "**This is the permission slip for the whole approach, and it is what removes every error path.** You never check whether the stack has two values before popping, never handle a malformed expression, and never deal with more than one value left at the end. Without it, the clean six-line loop grows a validation layer."
  },
  {
    "constraint": "division truncates toward zero, so `-7 / 2` is `-3` and not `-4`",
    "what": "**This is the constraint that forbids the obvious operator in most languages.** Python's `//` floors — it rounds toward negative infinity — so `-7 // 2` is `-4`, which is wrong here. The truncating behaviour has to be written deliberately. C++ and Java's `/` already truncate, so this is a place where the same algorithm needs different code per language."
  }
]
