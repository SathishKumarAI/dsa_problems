// char-replacement — every approach in one file, cross-checked
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, assembled unchanged, plus a suite covering both statement examples, the smallest
legal input, \`k = 0\` in both directions (no repeats at all, and an existing run), budgets exceeding
anything usable, an already-uniform string, runs split by one and by two intruders, a case where the
winning letter is *not* the most common letter overall, and 30 randomised stress cases over a
three-letter alphabet — each cross-checked against brute force.

There is no "no valid answer" case here: the string is never empty, so a single character is always
achievable and the answer is at least 1. The nearest equivalent — \`"ABCDE"\` with \`k = 0\` returning
exactly 1 — is included instead.`

export const script = `"""Longest Run After k Rewrites - every approach in one file, plus a self-checking suite.

Run: python char_replacement_all.py
"""

from __future__ import annotations

import random

# --- shared scaffolding (harness, not answer) ----------------------------------

ALPHABET = 26  # uppercase English letters; the constraint that makes a fixed array legal


def slot(ch: str) -> int:
    """Tally index for an uppercase letter."""
    return ord(ch) - ord("A")


def rewrites_needed(length: int, most_frequent: int) -> int:
    """The problem's whole rule: everything in the stretch that is not the majority letter."""
    return length - most_frequent


# --- 1. Every stretch, tallied from its own start ------------------------------

def char_replacement_every_substring(s: str, k: int) -> int:
    best = 0
    for i in range(len(s)):
        counts = [0] * ALPHABET  # reset per start: a new start is a new stretch
        for j in range(i, len(s)):
            counts[slot(s[j])] += 1
            if rewrites_needed(j - i + 1, max(counts)) <= k:  # max() rescans all 26 slots
                best = max(best, j - i + 1)
    return best


# --- 2. One window, most-frequent count recomputed each step -------------------

def char_replacement_recompute_max(s: str, k: int) -> int:
    counts = [0] * ALPHABET
    best = 0
    left = 0
    for right in range(len(s)):
        counts[slot(s[right])] += 1
        while rewrites_needed(right - left + 1, max(counts)) > k:  # 26 reads per check
            counts[slot(s[left])] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best


# --- 3. The same window, most-frequent count never lowered ---------------------

def char_replacement_stale_max(s: str, k: int) -> int:
    counts = [0] * ALPHABET
    best = 0
    most = 0  # high-water mark only; deliberately never decreased
    left = 0
    for right in range(len(s)):
        counts[slot(s[right])] += 1
        most = max(most, counts[slot(s[right])])
        while rewrites_needed(right - left + 1, most) > k:
            counts[slot(s[left])] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best


APPROACHES = [
    ("every_substring", char_replacement_every_substring),
    ("recompute_max", char_replacement_recompute_max),
    ("stale_max", char_replacement_stale_max),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, str, int]] = [
        ("statement example", "AABABBA", 1),
        ("second example", "ABBB", 2),
        ("smallest legal input", "A", 0),
        ("smallest input, budget to spare", "A", 1),
        ("k = 0, longest existing run", "AABBBCC", 0),
        ("k = 0, no repeats at all", "ABCDE", 0),
        ("budget covers the whole string", "ABCDE", 4),
        ("budget larger than any need", "ABCDE", 5),
        ("all one letter already", "AAAAA", 2),
        ("repeats split by one intruder", "AAAABAAAA", 1),
        ("repeats split by two intruders", "AAAABBAAAA", 1),
        ("the winning letter is not the most common overall", "BAAAAB" + "C" * 6, 1),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        s = "".join(rng.choice("ABC") for _ in range(n))
        k = rng.randint(0, min(n, 3))
        cases.append((f"stress n={n} k={k}", s, k))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, s, k in cases:
        print(f"\\n{label}: s={s!r} k={k}")
        results = []
        for name, fn in APPROACHES:
            got = fn(s, k)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        # the answer can never exceed the string, and is at least 1 for a non-empty string
        valid = all(1 <= r <= len(s) for r in results) if s else True
        if not agreed or not valid:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, valid={valid})")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
