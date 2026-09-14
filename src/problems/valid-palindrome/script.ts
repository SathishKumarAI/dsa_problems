// valid-palindrome — every approach in one file, cross-checked
//
// Converted from docs/deep/valid-palindrome_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against the statement's example, the smallest legal input in
both its forms, an input with no alphanumeric characters at all, an all-one-character case, the
\`"0P"\` case-folding trap, and a randomised stress test that mixes purely random strings with
deliberately mirrored ones so that real palindromes actually occur. Neither approach mutates its
input — the answer is a boolean — but the oracle is built independently of both, so agreement means
something.`

export const script = `"""Palindrome, Ignoring the Noise — every approach in one file, cross-checked.

Run: python valid_palindrome.py
"""

from __future__ import annotations

import random
import string
from typing import Callable


def valid_palindrome_clean_then_reverse(s: str) -> bool:
    cleaned: list[str] = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]  # [::-1] builds a second list of the same size


def valid_palindrome_two_pointers(s: str) -> bool:
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():  # the i < j guard stops i overrunning j
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():  # fold case on BOTH sides, not one
            return False
        i += 1
        j -= 1
    return True


APPROACHES: list[tuple[str, Callable[[str], bool]]] = [
    ("clean then reverse", valid_palindrome_clean_then_reverse),
    ("two pointers", valid_palindrome_two_pointers),
]


def reference(s: str) -> bool:
    """Deliberately dumb oracle: build the filtered string, compare it to its reverse."""
    kept = "".join(c.lower() for c in s if c.isalnum())
    return kept == kept[::-1]


def run_case(label: str, s: str) -> bool:
    results = [(name, fn(s)) for name, fn in APPROACHES]
    expected = reference(s)
    agree = all(r == expected for _, r in results)
    print(label)
    print(f"  s={s!r}")
    for name, r in results:
        print(f"    {name:<20} -> {r}")
    print(f"    reference={expected}  all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("example from the statement", "A man, a plan, a canal: Panama")
    ok &= run_case("worked example used in the prose", "Ab, ba!")
    ok &= run_case("not a palindrome", "race a car")
    ok &= run_case("smallest legal input (n = 1)", "a")
    ok &= run_case("smallest legal input, non-alphanumeric", " ")
    ok &= run_case("no alphanumerics at all", ".,;:!?-")
    ok &= run_case("all one character", "aaaaaa")
    ok &= run_case("case folding trap", "0P")
    ok &= run_case("digits and letters mixed", "1a2b2a1")

    random.seed(7)
    alphabet = string.ascii_letters + string.digits + " .,:;!?-_"
    mismatches = 0
    for _ in range(3000):
        n = random.randint(1, 24)
        s = "".join(random.choice(alphabet) for _ in range(n))
        if random.random() < 0.4:  # half-and-mirror, so real palindromes actually occur
            half = "".join(random.choice(alphabet) for _ in range(n // 2))
            s = half + random.choice(alphabet) + half[::-1]
        expected = reference(s)
        for name, fn in APPROACHES:
            if fn(s) != expected:
                mismatches += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} s={s!r} expected={expected}")
    print(f"stress: 3000 random strings (plain and mirrored), {mismatches} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  s='A man, a plan, a canal: Panama'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
worked example used in the prose
  s='Ab, ba!'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
not a palindrome
  s='race a car'
    clean then reverse   -> False
    two pointers         -> False
    reference=False  all agree: True
smallest legal input (n = 1)
  s='a'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
smallest legal input, non-alphanumeric
  s=' '
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
no alphanumerics at all
  s='.,;:!?-'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
all one character
  s='aaaaaa'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
case folding trap
  s='0P'
    clean then reverse   -> False
    two pointers         -> False
    reference=False  all agree: True
digits and letters mixed
  s='1a2b2a1'
    clean then reverse   -> True
    two pointers         -> True
    reference=True  all agree: True
stress: 3000 random strings (plain and mirrored), 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
