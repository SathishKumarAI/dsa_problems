// rpn-eval — every approach in one file, cross-checked
//
// Converted from docs/deep/rpn-eval_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All three approaches in one file, cross-checked on every case. Coverage: both of the statement's
examples; the smallest legal input, a single number token with no operator, in positive and negative
form; the non-commutative operators that expose the order trap; truncation on each side of zero
including both operands negative; the constraint bounds \`±200\`; left- and right-leaning chains, which
differ in stack depth but not in answer; and a randomised stress test. The constraints promise the
expression is always valid, so there is no invalid-input case to test — instead the generator builds
valid expression trees and returns each expression's value alongside it, giving an **independent
oracle** that no approach computed, and it picks division only when the right operand is non-zero.`

export const script = `"""Evaluate Reverse Polish Notation - every approach in one file, cross-checked.

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
    return int(left / right)  # truncates toward zero; \`//\` would floor, so -7 / 2 -> -4


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
    main()`
