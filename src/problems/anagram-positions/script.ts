// anagram-positions — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach above, plus a test suite covering the statement's example, the overlapping-answers
example, the pattern-longer-than-text example, the smallest legal inputs in both matching and
non-matching form, the \`"aaaa"\` / \`"aa"\` case where every window answers, a pattern with a repeated
letter, a text with no answer at all, and 30 randomised stress cases over a three-letter alphabet —
all cross-checked against the sort-every-window oracle and against every other approach.`

export const script = `"""Where Every Anagram Hides - every approach in one file, plus a self-checking test suite.

Run: python anagram_positions_all.py
"""

from __future__ import annotations

import random

# --- 1. Sort every window ------------------------------------------------------

def anagram_positions_sort_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    target = sorted(pattern)
    out: list[int] = []
    for start in range(len(text) - k + 1):
        if sorted(text[start : start + k]) == target:
            out.append(start)
    return out

# --- 2. Count every window from scratch ----------------------------------------

def anagram_positions_count_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    want = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for start in range(len(text) - k + 1):
        have = [0] * 26
        for ch in text[start : start + k]:
            have[ord(ch) - 97] += 1
        if have == want:
            out.append(start)
    return out

# --- 3. Slide the tally, compare all 26 ----------------------------------------

def anagram_positions_slide_the_tally(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for i, ch in enumerate(text):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if i >= k - 1 and have == want:
            out.append(i - k + 1)
    return out

# --- 4. Slide the tally, carry an agreement counter (optimal) ------------------

def anagram_positions_agreement_counter(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    agree = sum(1 for i in range(26) if want[i] == have[i])
    out: list[int] = []

    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        if have[letter] == want[letter]:
            agree -= 1          # it agreed before the change, so it may not after
        have[letter] += delta
        if have[letter] == want[letter]:
            agree += 1

    for i, ch in enumerate(text):
        touch(ord(ch) - 97, 1)
        if i >= k:
            touch(ord(text[i - k]) - 97, -1)
        if i >= k - 1 and agree == 26:
            out.append(i - k + 1)
    return out

APPROACHES = [
    ("sort_every_window", anagram_positions_sort_every_window),
    ("count_every_window", anagram_positions_count_every_window),
    ("slide_the_tally", anagram_positions_slide_the_tally),
    ("agreement_counter", anagram_positions_agreement_counter),
]

# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, str, str]] = [
        ("statement example", "cbaebabacd", "abc"),
        ("overlapping answers", "abab", "ab"),
        ("pattern longer than the text", "aa", "aaa"),
        ("smallest legal input, a match", "a", "a"),
        ("smallest legal input, no match", "a", "b"),
        ("every window answers", "aaaa", "aa"),
        ("no answer anywhere", "abcdefg", "hz"),
        ("pattern with duplicate letters", "baaabbaa", "aab"),
        ("whole text is the only window", "listen", "silent"),
        ("text equals pattern length but differs", "abc", "abd"),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        text = "".join(rng.choice("abc") for _ in range(n))
        pattern = "".join(rng.choice("abc") for _ in range(rng.randint(1, 4)))
        cases.append((f"stress n={n}", text, pattern))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, text, pattern in cases:
        print(f'\\n{label}: text="{text}" pattern="{pattern}"')
        results = []
        for name, fn in APPROACHES:
            got = fn(text, pattern)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )

if __name__ == "__main__":
    main()`
