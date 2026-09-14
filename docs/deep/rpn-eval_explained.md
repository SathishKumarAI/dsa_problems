# Evaluate Reverse Polish Notation — explained

## Understanding the Problem

You are given an arithmetic expression written in **reverse Polish notation** — also called postfix —
as a list of tokens. Each token is either an integer or one of `+`, `-`, `*`, `/`. Evaluate it and
return the single integer result.

Postfix means the operator comes **after** its two operands instead of between them. Ordinary infix
`2 + 1` is written `2 1 +`. Something bigger, `(2 + 1) * 3`, is written `2 1 + 3 *`: first the tokens
that compute `2 + 1`, then the `3`, then the `*` that combines them.

> **Intuition.** Postfix is what you get if you write down each operation **at the moment you are
> ready to perform it** rather than where it sits in the sentence. You cannot multiply before you
> have added, so the `+` is written first and the `*` last.

That ordering is the entire reason the notation exists. Infix needs precedence rules to know that
`2 + 1 * 3` means `2 + (1 * 3)`, and it needs parentheses to override them when you mean
`(2 + 1) * 3`. **Postfix needs neither.** The position of each operator already says precisely which
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
| **Operand order** | The first value you pop is the **right** operand, not the left | `+` and `*` are commutative, so half your tests pass regardless. Only `-` and `/` expose it |
| **Division truncation** | Integer division must truncate **toward zero**, so `-7 / 2` is `-3` | Every non-negative case agrees with flooring. Only a negative operand exposes it |

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `1 <= tokens.length <= 10^4` | **This prices out the rewriting rung.** Rewriting the list once per operator is `O(n²)`, which at `10^4` tokens is around `10^8` element moves — slow, and pure waste. The lower bound means there is always at least one token, so the smallest legal input is a single number with no operator at all, and `["42"]` must return `42`. |
| each token is an operator or an integer in `-200 … 200` | **A bounded, tiny alphabet of operators, and this is what lets a four-way dispatch stand in for a parser.** There are exactly four operations, so a single named helper covers every case with no grammar, no tokeniser, no precedence table. Note that operands may be **negative**, so `"-7"` is a number and not the operator `"-"` — any test that checks "does this token start with a minus" is already broken. |
| the expression is always valid, so an operator always has two operands waiting | **This is the permission slip for the whole approach, and it is what removes every error path.** You never check whether the stack has two values before popping, never handle a malformed expression, and never deal with more than one value left at the end. Without it, the clean six-line loop grows a validation layer. |
| division truncates toward zero, so `-7 / 2` is `-3` and not `-4` | **This is the constraint that forbids the obvious operator in most languages.** Python's `//` floors — it rounds toward negative infinity — so `-7 // 2` is `-4`, which is wrong here. The truncating behaviour has to be written deliberately. C++ and Java's `/` already truncate, so this is a place where the same algorithm needs different code per language. |

The worked example used in every section below is the statement's second example, chosen because it
contains a division and so exercises both traps:

```
tokens = ["4", "13", "5", "/", "+"]        answer: 6        (4 + (13 / 5) = 4 + 2)
```

---

## Approach 1 — Rewrite the token list in place

### The idea

*Where can I find an operator whose operands are definitely plain numbers?* At the **first** operator
in the list — everything before it must be numbers, so the two tokens immediately to its left are its
operands. Replace those three tokens with their result and repeat; each pass shortens the list by two
until a single token remains.

### How to think about it

> **Intuition.** Treat the token list as a strip of paper and keep **crossing out and rewriting**.
> Scan from the left until you meet the first operator; the two numbers just before it are its
> operands, guaranteed, because an operator any further left would have been found first. Rub out
> those three symbols, write the answer in their place, and start scanning again from the beginning.
> The strip gets shorter by two every time, so eventually one number is left, and that is the answer.

It is exactly how a person reduces the expression by hand. The waste is the restart: every pass
re-reads the prefix it has already read, and every rewrite shifts the rest of the list along.

### Worked example

`tokens = ["4", "13", "5", "/", "+"]`. There is no stack in this approach — that absence is the point
of the rung. The state carried between steps is the whole shrinking list.

| Pass | List at start of pass | First operator (index) | Operands | Result | List after |
|---|---|---|---|---|---|
| 1 | `["4", "13", "5", "/", "+"]` | `/` at 3 | left `13`, right `5` | `13 / 5 = 2` | `["4", "2", "+"]` |
| 2 | `["4", "2", "+"]` | `+` at 2 | left `4`, right `2` | `4 + 2 = 6` | `["6"]` |

One token left → answer **6**.

Look at pass 1: the operands are the tokens at indices `i-2` and `i-1`, with `i-1` being the **right**
operand — `13 / 5`, not `5 / 13`. The order trap is already here, in a form that is easier to see than
on a stack, because the tokens are still sitting in their written order. Hold on to that picture; the
stack version pops them in the opposite order, which is exactly why it is easy to get wrong there.

### Code

The operator set and the arithmetic itself are facts about the problem, not about any one approach, so
they live at module scope and every approach calls the same helper. Changing how division truncates is
then a one-line edit in one place.

```python
OPERATORS: frozenset[str] = frozenset({"+", "-", "*", "/"})


def apply_op(op: str, left: int, right: int) -> int:
    if op == "+":
        return left + right
    if op == "-":
        return left - right
    if op == "*":
        return left * right
    return int(left / right)  # truncates toward zero; `//` would floor, so -7 / 2 -> -4


def rpn_eval_rewrite_in_place(tokens: list[str]) -> int:
    items = list(tokens)  # own copy: the caller's list is not ours to destroy
    while len(items) > 1:
        i = 0
        while items[i] not in OPERATORS:  # the FIRST operator is the only one whose
            i += 1                        # two operands are guaranteed to be numbers
        value = apply_op(items[i], int(items[i - 2]), int(items[i - 1]))
        items[i - 2 : i + 1] = [str(value)]
    return int(items[0])
```

### Common mistake

Scanning for *any* operator rather than specifically the first one — most often by searching from the
right, which feels natural because the final operator is the root of the expression.

> **Watch out.** The misconception is that **every operator's two neighbours are its operands**. Only
> the leftmost operator has that guarantee. Any operator further right may have an *operator* sitting
> immediately before it, standing in for a whole subexpression that has not been reduced yet.

Running a last-operator variant on the statement's first example `["2", "1", "+", "3", "*"]` raises
`ValueError: invalid literal for int() with base 10: '+'` — it picks the `*` at index 4 and tries to
read `"+"` as one of its operands. A crash is the lucky outcome here; the same mistake in a language
that parses loosely would produce a number.

### Complexity and when to use this

**Time `O(n²)`, space `O(n)`.** The cost is the restart plus the rewrite: there are up to `n/2`
operators, and each one costs a scan from the beginning *and* a splice that shifts the remainder of
the list. Space is the working copy of the token list.

Use it to make the reduction visible when explaining postfix to someone — watching `13 5 /` collapse
into `2` is genuinely clarifying — and as the oracle the fast version is stress-tested against, which
is its job at the foot of this document. At `10^4` tokens it is about `10^8` operations; name that and
move on.

---

## Approach 2 — Build the expression tree, then evaluate it

**This rung is an addition — it is not one of the approaches in the problem data.** It is included
because it is the instinctive move for anyone who has seen a parser, and because watching what it
builds and then discards is the fastest route to understanding why the stack is the right answer.

### The idea

*The rewriting rung loses the expression's structure by flattening it as it goes — what if the
structure were made explicit first?* Every postfix expression describes a tree: operators are internal
nodes, numbers are leaves. Build that tree, then evaluate it bottom-up. This fixes the rewriting
rung's weakness — **rescanning and respliceing the list for every operator** — by reading each token
exactly once during construction.

### How to think about it

> **Intuition.** Read the tokens from the **right**. The very last token must be the outermost
> operator — the one applied last — so it is the root. Its right operand is whatever expression sits
> immediately to its left, and its left operand is whatever sits before *that*. Peel from the right
> end and each token is consumed exactly once, with the recursion keeping track of how far you have
> got.

Notice the construction order: the **right** subtree is built before the left, because the right
operand is the one adjacent to the operator. That is the operand-order trap appearing in yet another
costume, and it is the same fact that will make the first stack pop the right operand.

### Worked example

`tokens = ["4", "13", "5", "/", "+"]`, built from index 4 leftward. The state here is the **call
stack** — the same last-in-first-out structure as a data stack, wearing recursion as a disguise.

| Step | Call | Token at `i` | Action | Returns (subtree, next `i`) |
|---|---|---|---|---|
| 1 | `build(4)` | `+` | operator → build right first | *(pending)* |
| 2 | `build(3)` | `/` | operator → build right first | *(pending)* |
| 3 | `build(2)` | `5` | leaf | `(5, 1)` |
| 4 | `build(1)` | `13` | leaf — left operand of `/` | `(13, 0)` |
| 5 | *(back in step 2)* | | combine → `/(13, 5)` | `(/(13,5), 0)` |
| 6 | `build(0)` | `4` | leaf — left operand of `+` | `(4, −1)` |
| 7 | *(back in step 1)* | | combine → `+(4, /(13,5))` | `(+(4,/(13,5)), −1)` |

The tree is `+( 4, /(13, 5) )`. Evaluating bottom-up: `/` gives `13 / 5 = 2`, then `+` gives
`4 + 2 = 6`. Answer **6**.

Now compare that table with the stack trace in the next section, because the comparison is the whole
argument. The tree is built, walked once, and thrown away. **Every node is visited exactly twice —
once to create it, once to evaluate it — and nothing is ever revisited.** A structure that is written
once and read once in the same order is not a structure you need to materialise; you can evaluate as
you build. Doing so is the next approach.

### Code

The tree node is **scaffolding, not answer** — it exists only so the structure can be pointed at.

```python
@dataclass
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
    return _evaluate(root)
```

### Common mistake

Building the **left** subtree first — writing `left, after = _build(tokens, i - 1)` and then the right
from what remains.

> **Watch out.** The misconception is that "left comes first" is a rule about **construction order**.
> It is a rule about *position in the written expression*, and you are reading the expression
> backwards. The subexpression adjacent to an operator on its left is that operator's **right**
> operand, because the left operand was written earlier still.

This is the identical error to popping the operands in the wrong order, and it fails on identical
inputs: commutative expressions survive it untouched, and `["10", "3", "-"]` comes out as `-7` instead
of `7`.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is one construction pass plus one evaluation pass, each visiting
every token once. Space is the tree itself — one node per token — plus a recursion depth that reaches
`n` on a deeply left-leaning expression like `1 2 3 4 + + +`, which is a real stack-overflow risk at
the stated `10^4` tokens.

Build a tree when you need the tree **for something else**: printing the expression back in infix,
simplifying it algebraically, optimising it, or evaluating it more than once. If all you need is the
value, this allocates `n` objects and recurses `n` deep to produce a number the next approach gets
with a single list. Knowing why to *reject* it is worth more here than knowing how to write it.

---

## Approach 3 — One pass with a stack (optimal)

### The idea

*The tree is built once and walked once, in the same order — so why build it at all?* Evaluate as you
read. Push every number. When an operator arrives, the two values it needs are the two most recently
completed ones, so pop them, combine, and push the result back in their place. This fixes the tree
rung's weakness — **materialising a structure that is discarded after one traversal** — by keeping
only the finished values.

### How to think about it

> **Intuition.** A **spike for receipts** on a counter. Every number you read goes on the spike. Every
> operator takes the top two receipts off, does the arithmetic, and puts a single new receipt back.
> The spike always holds results that are completely finished and waiting to be used by something
> further right. When the tokens run out, exactly one receipt is left, and it is the answer.

The reason this works with no precedence rules is that postfix already sequenced the operators for
you. An operator's operands are always the two most recent finished values because that is what the
notation *means*; the stack is not interpreting the expression, it is just holding what the expression
has already finished.

### Worked example

`tokens = ["4", "13", "5", "/", "+"]`. The stack is shown with the **top on the right**.

| `k` | token | Action | Stack after |
|---|---|---|---|
| 0 | `"4"` | number → push | `[4]` |
| 1 | `"13"` | number → push | `[4, 13]` |
| 2 | `"5"` | number → push | `[4, 13, 5]` |
| 3 | `"/"` | pop right `5`, pop left `13`, `13 / 5 = 2`, push | `[4, 2]` |
| 4 | `"+"` | pop right `2`, pop left `4`, `4 + 2 = 6`, push | `[6]` |

One value left → answer **6**.

Step 3 is the whole problem in one row. The stack held `[4, 13, 5]`; the first pop returned `5` and
the second returned `13`; and the operation performed was `13 / 5`, not `5 / 13`. **The first value
popped is the right operand** — it has to be, because it was pushed last, and the operand written
closest to the operator is the right one. Compare this against the rewrite trace, where `13` and `5`
sat in written order and the answer looked obvious: the stack reverses them, and that reversal is the
single most common bug on this problem.

### Why it works

> **Why it works.** The loop maintains one invariant: **the stack holds the values of every completed
> subexpression so far, in left-to-right order.** Pushing a number preserves it — a lone number is a
> completed subexpression. Applying an operator preserves it too: in valid postfix, an operator's two
> operands are the two subexpressions immediately preceding it, which are by the invariant the top two
> entries, and replacing them with their combined value is exactly the subexpression the operator
> completes. The "expression is always valid" constraint guarantees those two entries exist, which is
> why no emptiness check is needed; and it guarantees exactly one entry remains at the end, which is
> the value of the whole expression.

### Code

```python
def rpn_eval_stack(tokens: list[str]) -> int:
    stack: list[int] = []  # values of completed subexpressions, left to right
    for tok in tokens:
        if tok in OPERATORS:
            right = stack.pop()  # pushed last, so it is the RIGHT operand
            left = stack.pop()
            stack.append(apply_op(tok, left, right))
        else:
            stack.append(int(tok))  # int() handles "-200": a leading minus is a sign, not an operator
    return stack[-1]
```

### Common mistake

Popping into `left` first: `left = stack.pop()` followed by `right = stack.pop()`.

> **Watch out.** The misconception is that popping reads the stack **in written order**, so the first
> thing out must be the left-hand operand. It is the reverse: a stack returns what went in *last*, and
> the operand written nearest the operator — the right one — is the one pushed most recently. Reading
> the two pops top-to-bottom on the page while the values come out bottom-to-top in meaning is exactly
> how this bug survives a code review.

It produces a plausible wrong number rather than an error. On this document's worked example it
returns **4** instead of **6**, because it computes `5 / 13 = 0` and then `4 + 0`. On
`["10", "3", "-"]` it returns **−7** instead of **7**. And it hides in plain sight: on the statement's
*first* example `["2", "1", "+", "3", "*"]` it returns **9**, the correct answer, because `+` and `*`
are commutative. Any test suite built only from commutative operators certifies this bug as correct.

The second classic is writing `left // right` for division. Python's `//` floors toward negative
infinity while the problem demands truncation toward zero, so that variant returns **−4** for
`["-7", "2", "/"]` where the answer is **−3**. It agrees with the correct code on every non-negative
input — including this document's worked example, which still returns **6** — so, once again, only a
negative operand exposes it. Write `int(left / right)` deliberately, and remember that this is the one
line of the algorithm that differs across languages: C++ and Java's `/` already truncates toward zero,
so a direct port of the Python `//` would be wrong in Python only.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is one pass with `O(1)` per token — a set membership test and
either one push or two pops and a push. Space is the stack, and the bound is tight: a right-leaning
expression like `1 2 3 4 + + +` pushes all four numbers before any operator arrives, so `n/2 + 1`
values can be resident at once.

This is the answer to ship, and it is worth knowing as more than a puzzle solution — it is how a stack
machine actually executes arithmetic, from the JVM to the CPython bytecode interpreter. The natural
follow-up is the other half of the story: converting infix to postfix, which is the **shunting-yard
algorithm**, and which is also a stack. Between the two you can evaluate ordinary arithmetic
expressions without writing a parser.

---

## The Overall Arc

The principle every step here chases is *stop storing structure you are only going to walk once*.
Postfix exists so that no precedence rules and no parentheses are needed — the position of each
operator already says exactly which two values it applies to — and the whole ladder is about trusting
that fact more and more completely. Take it least seriously and you get the rewriting rung: find the
leftmost operator, where the two preceding tokens are guaranteed to be plain numbers, collapse the
three into one, and start over. It works, it reduces the expression the way a person would by hand,
and it is quadratic, because every operator costs a scan from the beginning plus a splice that shifts
everything after it. Take the structure seriously instead and you reach for a tree: operators are
internal nodes, numbers are leaves, and reading the tokens from the right makes the last one the root.
That is `O(n)` and it is the instinctive move for anyone who has written a parser — but watch what it
does with what it builds. Every node is created once and evaluated once, in the same order, and then
the entire tree is discarded, which is the tell that materialising it was never necessary. Collapse
the two passes into one and the tree becomes a stack of finished values: push each number, and when an
operator arrives pop the two most recent results, combine them, and push the answer back in their
place. The invariant is that the stack always holds the completed subexpressions in left-to-right
order, and the guarantee that the input is valid is what removes every error path — two operands are
always waiting, and exactly one value is always left at the end. What remains after the algorithm is
settled is the part that actually costs people the submission, and neither half of it is about
control flow. **The first value popped is the right operand**, because it was pushed last, which
`+` and `*` will never reveal and `-` and `/` reveal immediately; and integer division here truncates
toward zero rather than flooring, which every non-negative test agrees with and only a negative
operand exposes. Both produce plausible wrong answers rather than crashes, which is why they survive
casual testing, and why the fix for both is to put a subtraction and a negative division in your test
data before you trust anything. Learn this loop with those two details attached and pair it with
shunting-yard, which converts infix to postfix and is also a stack, and most expression questions are
covered without ever writing a parser.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Rewrite in place | `O(n²)` | `O(n)` | Needs no data structure and mirrors hand reduction, but restarts the scan and splices the list per operator | Explaining what postfix reduction *is*, and as the oracle the fast version is stress-tested against |
| Expression tree | `O(n)` | `O(n)` + recursion depth `n` | Makes the structure explicit and reusable, then throws it away after one traversal | You need the tree for something else — printing infix, simplifying, optimising, evaluating repeatedly |
| One pass with a stack | `O(n)` | `O(n)` | Keeps only finished values, never the structure; the cost is that operand order becomes invisible on the page | Always, for evaluation — and it is how real stack machines execute arithmetic |

---

## Interview Priority

**Memorise cold: the stack version, with the operand order and the truncation both deliberate.** The
loop is eight lines and writing it is not the hard part; the hard part is that the two details most
likely to fail are invisible in a green test run built from `+` and `*`.

> **In an interview.** Say the ordering out loud as you write the pops — *"the first pop is the right
> operand, because it was pushed last"* — and say the division rule as you write it — *"truncating
> toward zero, so `int(left / right)`; Python's `//` would floor and give `-4` for `-7 / 2`."* Then
> test yourself on `["10", "3", "-"]` and `["-7", "2", "/"]` rather than on something commutative,
> because a commutative test proves nothing here. The follow-up is almost always "and how would you
> evaluate an ordinary infix expression?" — the answer is shunting-yard, converting to postfix with a
> second stack for operators.

**Memorise second: why postfix needs no parentheses.** It is one sentence — *the position of the
operator already determines its operands, so there is nothing for precedence or brackets to
disambiguate* — and it is the sentence that explains why this notation exists at all and why compilers
and calculators convert into it. It also sets up the shunting-yard follow-up, and it is the difference
between reciting an algorithm and understanding the format it operates on.

**Understand but do not drill: the rewriting rung and the expression tree.** The rewriting version is
worth thirty seconds to show the reduction concretely and to price at `O(n²)`; its one transferable
lesson is that only the *leftmost* operator has guaranteed-numeric operands. The tree is worth knowing
mainly so you can decline it for the right reason: it is `O(n)` like the stack, so the argument is not
speed but that it allocates a node per token and recurses `n` deep to build something it discards
after a single walk. If the question ever becomes "print this expression in infix" or "simplify it",
the tree stops being overkill and becomes the answer — that is the boundary to be able to state.

---

## Full Runnable Script

All three approaches in one file, cross-checked on every case. Coverage: both of the statement's
examples; the smallest legal input, a single number token with no operator, in positive and negative
form; the non-commutative operators that expose the order trap; truncation on each side of zero
including both operands negative; the constraint bounds `±200`; left- and right-leaning chains, which
differ in stack depth but not in answer; and a randomised stress test. The constraints promise the
expression is always valid, so there is no invalid-input case to test — instead the generator builds
valid expression trees and returns each expression's value alongside it, giving an **independent
oracle** that no approach computed, and it picks division only when the right operand is non-zero.

```python
"""Evaluate Reverse Polish Notation - every approach in one file, cross-checked.

Run: python rpn_eval.py
"""

from __future__ import annotations

import random
from dataclasses import dataclass

# The operator alphabet and the arithmetic itself: defined once, used by every approach.
OPERATORS: frozenset[str] = frozenset({"+", "-", "*", "/"})


def apply_op(op: str, left: int, right: int) -> int:
    if op == "+":
        return left + right
    if op == "-":
        return left - right
    if op == "*":
        return left * right
    return int(left / right)  # truncates toward zero; `//` would floor, so -7 / 2 -> -4


def rpn_eval_rewrite_in_place(tokens: list[str]) -> int:
    items = list(tokens)  # own copy: the caller's list is not ours to destroy
    while len(items) > 1:
        i = 0
        while items[i] not in OPERATORS:  # the FIRST operator is the only one whose
            i += 1                        # two operands are guaranteed to be numbers
        value = apply_op(items[i], int(items[i - 2]), int(items[i - 1]))
        items[i - 2 : i + 1] = [str(value)]
    return int(items[0])


@dataclass
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
    return _evaluate(root)


def rpn_eval_stack(tokens: list[str]) -> int:
    stack: list[int] = []  # values of completed subexpressions, left to right
    for tok in tokens:
        if tok in OPERATORS:
            right = stack.pop()  # pushed last, so it is the RIGHT operand
            left = stack.pop()
            stack.append(apply_op(tok, left, right))
        else:
            stack.append(int(tok))  # int() handles "-200": a leading minus is a sign
    return stack[-1]


APPROACHES: list[tuple[str, object]] = [
    ("rewrite in place", rpn_eval_rewrite_in_place),
    ("expression tree", rpn_eval_expression_tree),
    ("stack", rpn_eval_stack),
]


def run_case(label: str, tokens: list[str]) -> bool:
    results = [(name, fn(list(tokens))) for name, fn in APPROACHES]  # own copy each
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  tokens={tokens}")
    for name, r in results:
        print(f"    {name:<17} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def random_expression(rng: random.Random, depth: int) -> tuple[list[str], int]:
    """Build a valid postfix expression AND its value together, so the value is an
    independent oracle and division never meets a zero divisor."""
    if depth == 0 or rng.random() < 0.35:
        v = rng.randint(-20, 20)
        return [str(v)], v
    left_tokens, left_value = random_expression(rng, depth - 1)
    right_tokens, right_value = random_expression(rng, depth - 1)
    choices = ["+", "-", "*"] + (["/"] if right_value != 0 else [])
    op = rng.choice(choices)
    return left_tokens + right_tokens + [op], apply_op(op, left_value, right_value)


def main() -> None:
    ok = True

    ok &= run_case("statement example 1: (2 + 1) * 3", ["2", "1", "+", "3", "*"])
    ok &= run_case("statement example 2: 4 + (13 / 5)", ["4", "13", "5", "/", "+"])

    # Smallest legal input: a single number token, no operator at all.
    ok &= run_case("smallest legal input (one token)", ["42"])
    ok &= run_case("smallest legal input, negative", ["-200"])

    # The constraints promise the expression is always valid, so there is no invalid case
    # to test - an operator always finds two operands. These are the boundaries that DO
    # exist: operand order, and truncation on each side of zero.
    ok &= run_case("subtraction is not commutative", ["10", "3", "-"])
    ok &= run_case("division is not commutative", ["10", "3", "/"])
    ok &= run_case("negative dividend truncates toward zero", ["-7", "2", "/"])
    ok &= run_case("negative divisor truncates toward zero", ["7", "-2", "/"])
    ok &= run_case("both negative", ["-7", "-2", "/"])
    ok &= run_case("division that reaches zero", ["3", "5", "/"])

    # Constraint bounds on the token values.
    ok &= run_case("constraint bounds", ["200", "-200", "*"])

    # Left- and right-leaning shapes: the stack depth differs, the answer does not.
    ok &= run_case("left-leaning chain", ["1", "2", "+", "3", "+", "4", "+"])
    ok &= run_case("right-leaning chain", ["1", "2", "3", "4", "+", "+", "+"])

    # A deeper mixed expression: ((9 + 3) * (20 - 6)) / 2.
    ok &= run_case("deeper nesting", ["9", "3", "+", "20", "6", "-", "*", "2", "/"])

    # Stress: valid expressions built as trees, cross-checked against every approach AND
    # against the value computed while the tree was built.
    rng = random.Random(3)
    for _ in range(2000):
        tokens, expected = random_expression(rng, rng.randint(0, 4))
        results = [fn(list(tokens)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results) or results[0] != expected:
            ok = False
            print(f"  STRESS DISAGREEMENT tokens={tokens} -> {results}, expected {expected}")
    print("stress: 2000 generated postfix expressions cross-checked against an independent oracle")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()
```
