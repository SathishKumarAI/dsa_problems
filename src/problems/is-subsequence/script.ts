// is-subsequence — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Both approaches in one file, checked against the statement's two examples, the smallest legal
input (both strings empty), each string empty on its own, a pattern equal to the text, a pattern
longer than the text, repeated characters, a greedy trap and a right-letters-wrong-order case, plus
a randomised stress test against an independent oracle written a completely different way — one
shared iterator over the text, consumed left to right.

\`reference\`, \`run_case\` and \`APPROACHES\` are **scaffolding**, not answers. \`reference\` is an
independent oracle written a deliberately different way — one shared iterator over \`t\`, consumed
left to right — and the other two are the harness that prints and compares. This problem answers
with a boolean rather than a length, so there is no unspecified tail to be careful about, and
neither approach mutates its arguments.`

export const script = `"""Is One String Hidden in the Other? - every approach in one file, cross-checked.

Run: python is_subsequence.py

This one answers with a boolean rather than a length, so there is no unspecified
tail to be careful about - but each approach is still handed its own arguments so
no approach can be helped or hurt by another.
"""

from __future__ import annotations

import random
from typing import Callable


# ------------------------------------------- approach 1: rescan t for each char
def is_subsequence_restart_scan(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1  # the next character must come strictly after this match
    return True


# ------------------------------------------ approach 2: one pass, two pointers
def is_subsequence_two_pointers(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:  # the i < len(s) guard is what ends the walk
            i += 1
    return i == len(s)


APPROACHES: list[tuple[str, Callable[[str, str], bool]]] = [
    ("restart scan", is_subsequence_restart_scan),
    ("two pointers", is_subsequence_two_pointers),
]


def reference(s: str, t: str) -> bool:
    """Independent oracle: one shared iterator over t, consumed left to right."""
    it = iter(t)
    return all(ch in it for ch in s)


def run_case(label: str, s: str, t: str) -> bool:
    expected = reference(s, t)
    results = [(name, fn(s, t)) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  s={s!r} t={t!r}")
    for name, r in results:
        print(f"    {name:<14} -> {r}")
    print(f"    expected       -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 from the statement", "abc", "ahbgdc")
    ok &= run_case("example 2 from the statement", "axc", "ahbgdc")
    ok &= run_case("smallest legal input (both empty)", "", "")
    ok &= run_case("empty pattern, non-empty text", "", "abc")
    ok &= run_case("non-empty pattern, empty text", "a", "")
    ok &= run_case("pattern equals text", "abc", "abc")
    ok &= run_case("pattern longer than text", "abcd", "abc")
    ok &= run_case("greedy trap: the first 'a' is the wrong-looking one", "ab", "aab")
    ok &= run_case("repeats in the pattern", "aaa", "aabbaa")
    ok &= run_case("repeats in the pattern, one short", "aaaa", "aabba")
    ok &= run_case("right letters, wrong order", "ba", "ab")

    random.seed(11)
    for _ in range(5000):
        t = "".join(random.choice("abc") for _ in range(random.randint(0, 12)))
        s = "".join(random.choice("abc") for _ in range(random.randint(0, 5)))
        expected = reference(s, t)
        for name, fn in APPROACHES:
            got = fn(s, t)
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} s={s!r} t={t!r} "
                      f"-> {got} != {expected}")
    print("stress: 5000 random (s, t) pairs over a 3-letter alphabet, "
          "both approaches vs the oracle")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example 1 from the statement
  s='abc' t='ahbgdc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
example 2 from the statement
  s='axc' t='ahbgdc'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
smallest legal input (both empty)
  s='' t=''
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
empty pattern, non-empty text
  s='' t='abc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
non-empty pattern, empty text
  s='a' t=''
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
pattern equals text
  s='abc' t='abc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
pattern longer than text
  s='abcd' t='abc'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
greedy trap: the first 'a' is the wrong-looking one
  s='ab' t='aab'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
repeats in the pattern
  s='aaa' t='aabbaa'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
repeats in the pattern, one short
  s='aaaa' t='aabba'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
right letters, wrong order
  s='ba' t='ab'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
stress: 5000 random (s, t) pairs over a 3-letter alphabet, both approaches vs the oracle

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
