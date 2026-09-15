// fruit-baskets — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach above, plus a test suite covering all three statement examples, the smallest legal
input, a row of a single kind, a row where every tree differs, the deep-shrink case
\`[1, 1, 1, 2, 3]\` that separates \`if\` from \`while\`, the \`[1, 2, 1, 3, 3, 3]\` case that separates
counts from presence, and 80 randomised stress cases over three- and five-kind alphabets — all
cross-checked against the every-start oracle and against each other. There is no "no valid answer"
case: every row has at least one tree, so the answer is never below \`1\`.`

export const script = `"""The Longest Run of Two Kinds - every approach in one file, plus a self-checking test suite.

Run: python fruit_baskets_all.py
"""

from __future__ import annotations

import random


# --- 1. Try every starting tree ------------------------------------------------

def fruit_baskets_every_start(fruits: list[int]) -> int:
    best = 0
    for start in range(len(fruits)):
        kinds: set[int] = set()
        end = start
        while end < len(fruits):
            kinds.add(fruits[end])
            if len(kinds) > 2:
                break
            end += 1
        best = max(best, end - start)
    return best


# --- 2. A window that shrinks until it is legal --------------------------------

def fruit_baskets_shrinking_window(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    best = 0
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        while len(counts) > 2:
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]  # a kind leaves only when its COUNT hits zero
            left += 1
        best = max(best, right - left + 1)
    return best


# --- 3. A window that never shrinks, only slides (optimal) --------------------

def fruit_baskets_non_shrinking(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        if len(counts) > 2:
            # one step only: the window slides rather than shrinking
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]
            left += 1
    return len(fruits) - left


APPROACHES = [
    ("every_start", fruit_baskets_every_start),
    ("shrinking_window", fruit_baskets_shrinking_window),
    ("non_shrinking", fruit_baskets_non_shrinking),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    # every row of trees has at least one pickable fruit, so there is no
    # "no valid answer" case for this problem — the smallest answer is 1
    cases: list[tuple[str, list[int]]] = [
        ("statement example, the deep-shrink corner", [1, 2, 3, 2, 2]),
        ("two kinds, the whole row", [1, 2, 1]),
        ("the start matters", [0, 1, 2, 2]),
        ("smallest legal input", [7]),
        ("one kind only", [3, 3, 3, 3]),
        ("every tree a different kind", [1, 2, 3, 4, 5]),
        ("a long first kind then a third", [1, 1, 1, 2, 3]),
        ("the third kind never returns", [1, 2, 1, 3, 3, 3]),
        ("answer is the whole row", [5, 5, 9, 9, 5, 9]),
    ]

    rng = random.Random(20260912)
    for n in range(1, 41):
        cases.append((f"stress n={n} 3 kinds", [rng.randint(0, 2) for _ in range(n)]))
        cases.append((f"stress n={n} 5 kinds", [rng.randint(0, 4) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, fruits in cases:
        shown = fruits if len(fruits) <= 12 else fruits[:12] + ["..."]
        print(f"\\n{label}: fruits={shown}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(fruits))  # its own copy, so no approach can corrupt the next
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
