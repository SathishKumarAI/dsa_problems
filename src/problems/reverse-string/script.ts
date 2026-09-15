// reverse-string — every approach in one file, cross-checked
//
// Converted from docs/deep/reverse-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All five approaches in one file, cross-checked against Python's own \`s[::-1]\` as the reference. Tests
cover the statement's example, the odd-length case whose middle must not move, the smallest legal
input (the empty string, on which every loop must run zero times), one character, two characters,
duplicates, a string that is already its own reverse, mixed printable ASCII, and 2000 random strings
of length 0 to 40.

Two harness notes. There is **no no-valid-answer case** — every string has exactly one reverse. And
the recursive rung is quadratic *and* stack-limited, so stress strings are capped at 40 characters;
its behaviour at \`n = 10^5\` is stated analytically above rather than measured, because measuring it
means a \`RecursionError\`.`

export const script = `"""Reverse the Characters in Place - every approach in one file, cross-checked.

Run: python reverse_string.py
"""

from __future__ import annotations

import random
import string


def reverse_string_recursion(s: str) -> str:
    if len(s) <= 1:
        return s
    return reverse_string_recursion(s[1:]) + s[0]   # s[1:] copies n-1 characters, every level


def reverse_string_grow(s: str) -> str:
    out = ""
    for c in s:
        out = c + out                                # prepending rebuilds the whole answer so far
    return out


def reverse_string_stack(s: str) -> str:
    box: list[str] = []
    for c in s:
        box.append(c)
    out: list[str] = []
    while box:
        out.append(box.pop())                        # last in, first out == reversed
    return "".join(out)


def reverse_string_backward_copy(s: str) -> str:
    out: list[str] = []
    for i in range(len(s) - 1, -1, -1):
        out.append(s[i])
    return "".join(out)


def reverse_string_two_pointers(s: str) -> str:
    chars = list(s)
    i, j = 0, len(chars) - 1
    while i < j:                                     # MEET, not cross: an odd middle is its own mirror
        chars[i], chars[j] = chars[j], chars[i]
        i += 1
        j -= 1
    return "".join(chars)


APPROACHES = [
    ("recursion", reverse_string_recursion),
    ("grow a string", reverse_string_grow),
    ("stack", reverse_string_stack),
    ("backward copy", reverse_string_backward_copy),
    ("two pointers", reverse_string_two_pointers),
]


def run_case(label: str, s: str) -> bool:
    want = s[::-1]                                   # the reference: Python's own slice
    results = [(name, fn(s)) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  s = {s!r}")
    for name, got in results:
        print(f"    {name:<14} -> {got!r}")
    print(f"    all agree with s[::-1]: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("example from the statement", "hello")
    ok &= run_case("odd length, untouched middle", "abc")
    ok &= run_case("smallest legal input (empty)", "")
    ok &= run_case("one character", "z")
    ok &= run_case("two characters", "ab")

    ok &= run_case("all duplicates", "aaaa")
    ok &= run_case("duplicates around a middle", "abcba")   # already its own reverse
    ok &= run_case("mixed printable ASCII", "A man, a plan!")

    random.seed(3)
    bad = 0
    alphabet = string.ascii_letters + string.digits + " !,."
    for _ in range(2000):
        s = "".join(random.choice(alphabet) for _ in range(random.randint(0, 40)))
        want = s[::-1]
        for name, fn in APPROACHES:
            if fn(s) != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} on {s!r}")
    print(f"stress: 2000 random strings up to 40 chars, all five approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  s = 'hello'
    recursion      -> 'olleh'
    grow a string  -> 'olleh'
    stack          -> 'olleh'
    backward copy  -> 'olleh'
    two pointers   -> 'olleh'
    all agree with s[::-1]: True
odd length, untouched middle
  s = 'abc'
    recursion      -> 'cba'
    grow a string  -> 'cba'
    stack          -> 'cba'
    backward copy  -> 'cba'
    two pointers   -> 'cba'
    all agree with s[::-1]: True
smallest legal input (empty)
  s = ''
    recursion      -> ''
    grow a string  -> ''
    stack          -> ''
    backward copy  -> ''
    two pointers   -> ''
    all agree with s[::-1]: True
one character
  s = 'z'
    recursion      -> 'z'
    grow a string  -> 'z'
    stack          -> 'z'
    backward copy  -> 'z'
    two pointers   -> 'z'
    all agree with s[::-1]: True
two characters
  s = 'ab'
    recursion      -> 'ba'
    grow a string  -> 'ba'
    stack          -> 'ba'
    backward copy  -> 'ba'
    two pointers   -> 'ba'
    all agree with s[::-1]: True
all duplicates
  s = 'aaaa'
    recursion      -> 'aaaa'
    grow a string  -> 'aaaa'
    stack          -> 'aaaa'
    backward copy  -> 'aaaa'
    two pointers   -> 'aaaa'
    all agree with s[::-1]: True
duplicates around a middle
  s = 'abcba'
    recursion      -> 'abcba'
    grow a string  -> 'abcba'
    stack          -> 'abcba'
    backward copy  -> 'abcba'
    two pointers   -> 'abcba'
    all agree with s[::-1]: True
mixed printable ASCII
  s = 'A man, a plan!'
    recursion      -> '!nalp a ,nam A'
    grow a string  -> '!nalp a ,nam A'
    stack          -> '!nalp a ,nam A'
    backward copy  -> '!nalp a ,nam A'
    two pointers   -> '!nalp a ,nam A'
    all agree with s[::-1]: True
stress: 2000 random strings up to 40 chars, all five approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
