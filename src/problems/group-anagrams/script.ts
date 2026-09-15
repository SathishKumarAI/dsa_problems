// group-anagrams — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Three approaches, the two key helpers and the ordering helper each defined exactly once, plus a test
suite. \`_in_required_order\` does double duty: it produces this statement's required output order, and
because the general problem leaves group order arbitrary, it is also what the harness compares
through. Everything under "test suite" is **scaffolding**, not answer.`

export const script = `"""Group Anagrams - every approach in one file, cross-checked.

Run:  python group_anagrams.py
"""

from __future__ import annotations

import random

A = ord("a")
ALPHABET_SIZE = 26


# ------------------------------------------------------ the shared decisions
def _sorted_key(word: str) -> str:
    """The letters in order: anagrams sort identically, non-anagrams cannot."""
    return "".join(sorted(word))


def _count_key(word: str) -> str:
    """The same multiset as a tally. The comma is load-bearing: without it the
    counts 1,11 and 11,1 both render as "111"."""
    counts = [0] * ALPHABET_SIZE
    for ch in word:
        counts[ord(ch) - A] += 1
    return ",".join(str(c) for c in counts)


def _in_required_order(groups: list[list[str]]) -> list[list[str]]:
    """Sort inside each group, then between groups. Required by this statement;
    in the general version, where group order is arbitrary, it is the
    canonicaliser the harness compares through."""
    return sorted(sorted(g) for g in groups)


# ------------------------------------------- approach 1: compare every pair
def group_anagrams_pairwise(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        key = _sorted_key(w)
        for g in groups:
            if _sorted_key(g[0]) == key:  # re-derives the representative's key every time
                g.append(w)
                break
        else:
            groups.append([w])
    return _in_required_order(groups)


# ------------------------------------- approach 2: sorted letters as the key
def group_anagrams_sorted_key(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_sorted_key(w), []).append(w)
    return _in_required_order(list(groups.values()))


# ------------------------------------ approach 3: the letter tally as the key
def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_count_key(w), []).append(w)
    return _in_required_order(list(groups.values()))


APPROACHES = [
    ("pairwise", group_anagrams_pairwise),
    ("sorted_key", group_anagrams_sorted_key),
    ("count_key", group_anagrams),
]


# ------------------------------------------------- test suite (scaffolding)
def main() -> None:
    cases: list[tuple[str, list[str]]] = [
        ("statement example",
         ["eat", "tea", "tan", "ate", "nat", "bat"]),
        ("the empty string", [""]),
        ("minimal: one word", ["abc"]),
        ("empty strings group together", ["", "", "a"]),
        ("no two words are anagrams", ["ab", "cd", "ef"]),
        ("the same word repeated", ["xy", "xy", "yx"]),
        ("counts matter, not letters", ["aab", "abb", "aba"]),
    ]
    rng = random.Random(13)
    cases.append(("stress: 60 random words",
                  ["".join(rng.choice("abc") for _ in range(rng.randint(0, 4)))
                   for _ in range(60)]))

    all_agreed = True
    for label, words in cases:
        shown = words if len(words) <= 8 else words[:6] + ["..."]
        print(f"\\n{label}: n={len(words)} {shown}")
        results: dict[str, list[list[str]]] = {}
        for name, fn in APPROACHES:
            out = _in_required_order(fn(list(words)))
            results[name] = out
            text = str(out) if len(str(out)) <= 70 else str(out)[:67] + "..."
            print(f"  {name:<12} -> {len(out)} groups {text}")
        if len({repr(r) for r in results.values()}) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()`
