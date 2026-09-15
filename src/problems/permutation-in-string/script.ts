// permutation-in-string — every approach in one file, cross-checked
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, assembled unchanged, plus a suite covering both statement examples (the \`true\`
one and the letters-present-but-not-adjacent \`false\` one), the smallest legal inputs in both
directions, \`s1\` longer than \`s2\`, equal lengths, duplicates in \`s1\` including a case with the right
letters in the wrong counts, matches pinned at the very first and very last window, and 30 randomised
stress cases over a three-letter alphabet so that matches actually occur — every case additionally
cross-checked against an independent brute-force oracle.`

export const script = `"""Does One String Hide the Other's Letters? - every approach in one file, plus tests.

Run: python permutation_in_string_all.py
"""

from __future__ import annotations

import random

# --- shared scaffolding (harness, not answer) ----------------------------------

ALPHABET = 26  # lowercase English letters; the constraint that makes a fixed array legal


def slot(ch: str) -> int:
    """Tally index for a lowercase letter."""
    return ord(ch) - ord("a")


def tally(text: str) -> list[int]:
    """One count per letter of the alphabet."""
    counts = [0] * ALPHABET
    for ch in text:
        counts[slot(ch)] += 1
    return counts


# --- 1. Sort every window and compare ------------------------------------------

def permutation_in_string_sort_every_window(s1: str, s2: str) -> bool:
    target = sorted(s1)
    k = len(s1)
    for start in range(len(s2) - k + 1):  # empty range when s1 is longer than s2
        if sorted(s2[start : start + k]) == target:
            return True
    return False


# --- 2. Slide a tally, compare all 26 counts each step -------------------------

def permutation_in_string_compare_all_counts(s1: str, s2: str) -> bool:
    if len(s1) > len(s2):
        return False
    need = tally(s1)
    have = [0] * ALPHABET
    for i, ch in enumerate(s2):
        have[slot(ch)] += 1
        if i >= len(s1):
            have[slot(s2[i - len(s1)])] -= 1  # one enters, one leaves: the width is fixed
        if have == need:
            return True
    return False


# --- 3. Carry one "how many letters currently agree" counter -------------------

def permutation_in_string_agreement_counter(s1: str, s2: str) -> bool:
    k = len(s1)
    if k > len(s2):
        return False
    need = tally(s1)
    have = tally(s2[:k])
    agree = sum(1 for i in range(ALPHABET) if need[i] == have[i])
    for right in range(k, len(s2)):
        if agree == ALPHABET:
            return True
        enter = slot(s2[right])
        have[enter] += 1
        if have[enter] == need[enter]:
            agree += 1
        elif have[enter] == need[enter] + 1:  # it was settled a moment ago; now it overshoots
            agree -= 1
        leave = slot(s2[right - k])
        have[leave] -= 1
        if have[leave] == need[leave]:
            agree += 1
        elif have[leave] == need[leave] - 1:  # it was settled a moment ago; now it undershoots
            agree -= 1
    return agree == ALPHABET  # catches a match in the final window


APPROACHES = [
    ("sort_every_window", permutation_in_string_sort_every_window),
    ("compare_all_counts", permutation_in_string_compare_all_counts),
    ("agreement_counter", permutation_in_string_agreement_counter),
]


# --- test suite ----------------------------------------------------------------

def brute_force_oracle(s1: str, s2: str) -> bool:
    """Independent check: does ANY window of s1's length hold exactly s1's letters?"""
    k = len(s1)
    return any(sorted(s2[i : i + k]) == sorted(s1) for i in range(len(s2) - k + 1))


def main() -> None:
    cases: list[tuple[str, str, str]] = [
        ("statement example", "ab", "eidbaooo"),
        ("letters present but never adjacent", "ab", "eidboaoo"),
        ("smallest legal input", "a", "a"),
        ("smallest legal input, no match", "a", "b"),
        ("s1 longer than s2", "abc", "ab"),
        ("equal lengths, exact rearrangement", "abc", "cba"),
        ("equal lengths, wrong multiset", "aab", "abb"),
        ("duplicates in s1, match at the end", "aab", "eidbaaooo"),
        ("duplicates, right letters wrong counts", "aab", "eidbabooo"),
        ("match sits at index 0", "ab", "baxyz"),
        ("match sits at the very last window", "ab", "xyzab"),
        ("one repeated letter", "aaa", "bbaaab"),
        ("one repeated letter, not enough", "aaa", "abaab"),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        s2 = "".join(rng.choice("abc") for _ in range(n))
        s1 = "".join(rng.choice("abc") for _ in range(rng.randint(1, 4)))
        cases.append((f"stress n={n}", s1, s2))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, s1, s2 in cases:
        print(f"\\n{label}: s1={s1!r} s2={s2!r}")
        results = []
        for name, fn in APPROACHES:
            got = fn(s1, s2)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        oracle = brute_force_oracle(s1, s2)
        if not agreed or results[0] != oracle:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, oracle={oracle})")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
