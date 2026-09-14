// plus-one — every approach in one file, cross-checked
//
// Converted from docs/deep/plus-one_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, the shared \`all_nines_answer\` helper, and a test suite covering the statement's
example, the smallest legal input \`[0]\`, the smallest input that grows \`[9]\`, all nines, a carry that
travels and stops, repeated digits, a 100-digit input far past any fixed-width integer, and 45
randomised cases — each cross-checked against an independent oracle that does the arithmetic with
Python's unbounded integers. Every approach mutates its argument, so each is handed its own copy.`

export const script = `"""Add One to a Digit Array - every approach in one file, plus a self-checking test suite.

Run: python plus_one_all.py
"""

from __future__ import annotations

import random


def all_nines_answer(length: int) -> list[int]:
    """The answer when every digit was a 9: a leading 1 and \`length\` zeros."""
    return [1] + [0] * length


# --- 1. Build the number, add one, split it back -------------------------------

def plus_one_build_integer(digits: list[int]) -> list[int]:
    value = 0
    for d in digits:
        value = value * 10 + d
    value += 1
    out: list[int] = []
    while value > 0:
        out.append(value % 10)
        value //= 10
    out.reverse()  # peeled least-significant first, so flip it back
    return out


# --- 2. Reverse, carry, reverse back -------------------------------------------

def plus_one_reverse_carry(digits: list[int]) -> list[int]:
    rev = digits[::-1]
    carry = 1
    for i in range(len(rev)):
        total = rev[i] + carry
        rev[i] = total % 10
        carry = total // 10
    if carry:
        rev.append(carry)  # a carry still alive means the answer is one digit longer
    rev.reverse()
    return rev


# --- 3. Carry from the back ----------------------------------------------------

def plus_one_carry_back(digits: list[int]) -> list[int]:
    carry = 1
    i = len(digits) - 1
    while i >= 0 and carry:  # stop the moment the carry is spent
        total = digits[i] + carry
        digits[i] = total % 10
        carry = total // 10
        i -= 1
    if carry:
        return all_nines_answer(len(digits))
    return digits


# --- 4. Special-case all nines -------------------------------------------------

def plus_one_special_case_nines(digits: list[int]) -> list[int]:
    if all(d == 9 for d in digits):
        return all_nines_answer(len(digits))
    i = len(digits) - 1
    while digits[i] == 9:  # safe: the guard above ruled out running off the front
        digits[i] = 0
        i -= 1
    digits[i] += 1
    return digits


# --- 5. Walk from the back and return early (optimal) --------------------------

def plus_one_early_return(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits  # nothing left of a digit below 9 can change
        digits[i] = 0
    return all_nines_answer(len(digits))  # ran off the front: every digit was a 9


APPROACHES = [
    ("build_integer", plus_one_build_integer),
    ("reverse_carry", plus_one_reverse_carry),
    ("carry_back", plus_one_carry_back),
    ("special_case_nines", plus_one_special_case_nines),
    ("early_return", plus_one_early_return),
]


# --- test scaffolding, not part of any answer ----------------------------------

def plus_one_reference(digits: list[int]) -> list[int]:
    """Independent oracle: Python's unbounded integers do the arithmetic."""
    return [int(c) for c in str(int("".join(map(str, digits))) + 1)]


def random_digits(length: int, rng: random.Random) -> list[int]:
    """A legal input: no leading zero unless the whole number is one digit."""
    if length == 1:
        return [rng.randint(0, 9)]
    return [rng.randint(1, 9)] + [rng.randint(0, 9) for _ in range(length - 1)]


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3]),
        ("smallest legal input", [0]),
        ("smallest input that grows", [9]),
        ("all nines - the only shape that grows", [9, 9, 9]),
        ("carry travels then stops", [1, 9, 9]),
        ("repeated digits", [2, 2, 2]),
        ("no carry at all", [4, 3, 2, 1]),
        ("100 digits - far past any 64-bit integer", [9] * 100),
        ("100 digits, carry dies at the second digit", [1, 8] + [9] * 98),
    ]
    # Every legal input has an answer: adding one to a non-negative number always
    # produces a number, so this problem has no "no answer" case to test.

    rng = random.Random(20260912)
    for n in range(1, 40):
        cases.append((f"stress len={n}", random_digits(n, rng)))
    for n in (1, 5, 17, 19, 20, 60):
        cases.append((f"stress all nines len={n}", [9] * n))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, digits in cases:
        shown = digits if len(digits) <= 10 else digits[:10] + ["..."]
        print(f"\\n{label}: digits={shown}")
        expected = plus_one_reference(digits)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(digits))  # every approach mutates: hand each its own copy
            results.append(got)
            short = got if len(got) <= 10 else got[:10] + ["..."]
            print(f"  {name:<{width}} -> {short}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected[:10]}")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
