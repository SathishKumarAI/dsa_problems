// container-water — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Both approaches in one file, checked against the statement's example, the smallest legal input, an
all-duplicates input, an all-zero input where no water is possible, strictly increasing and strictly
decreasing maps, an input whose best pair is interior rather than at the ends, and a randomised
stress test comparing the greedy sweep against brute force on 800 random height maps.`

export const script = `"""Widest Container — every approach in one file, cross-checked.

Run: python container_water.py
"""

from __future__ import annotations

import random


def container_water_brute_force(heights: list[int]) -> int:
    best = 0
    for i in range(len(heights)):
        for j in range(i + 1, len(heights)):
            best = max(best, (j - i) * min(heights[i], heights[j]))
    return best


def container_water_two_pointers(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1  # the short wall caps every pair it is in; retire it, never the tall one
        else:
            j -= 1
    return best


APPROACHES: list[tuple[str, object]] = [
    ("brute force", container_water_brute_force),
    ("two pointers", container_water_two_pointers),
]


def run_case(label: str, heights: list[int]) -> bool:
    results = [(name, fn(list(heights))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(f"{label}")
    print(f"  heights={heights}")
    for name, r in results:
        print(f"    {name:<14} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # The statement's own example: lines of height 8 and 7, seven apart.
    ok &= run_case("example from the statement", [1, 8, 6, 2, 5, 4, 8, 3, 7])

    # Smallest legal input: exactly two lines.
    ok &= run_case("smallest legal input (n = 2)", [1, 1])

    # Every line the same height — the answer is always the full width.
    ok &= run_case("all duplicates", [5, 5, 5, 5])

    # Zero-height lines: legal input, and the best container holds nothing.
    ok &= run_case("no water possible", [0, 0, 0])

    # Monotone increasing: the widest pair is also the answer, but only just.
    ok &= run_case("strictly increasing", [1, 2, 3, 4, 5])

    # Monotone decreasing: mirror of the above.
    ok &= run_case("strictly decreasing", [5, 4, 3, 2, 1])

    # A tall pair buried in the middle, so the answer is not at either end.
    ok &= run_case("best pair is interior", [1, 9, 2, 2, 9, 1])

    # Randomised stress against brute force.
    random.seed(3)
    for _ in range(800):
        heights = [random.randint(0, 30) for _ in range(random.randint(2, 40))]
        results = [fn(list(heights)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT heights={heights} -> {results}")
    print("stress: 800 random height maps cross-checked, two pointers against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  heights=[1, 8, 6, 2, 5, 4, 8, 3, 7]
    brute force    -> 49
    two pointers   -> 49
    all agree: True
smallest legal input (n = 2)
  heights=[1, 1]
    brute force    -> 1
    two pointers   -> 1
    all agree: True
all duplicates
  heights=[5, 5, 5, 5]
    brute force    -> 15
    two pointers   -> 15
    all agree: True
no water possible
  heights=[0, 0, 0]
    brute force    -> 0
    two pointers   -> 0
    all agree: True
strictly increasing
  heights=[1, 2, 3, 4, 5]
    brute force    -> 6
    two pointers   -> 6
    all agree: True
strictly decreasing
  heights=[5, 4, 3, 2, 1]
    brute force    -> 6
    two pointers   -> 6
    all agree: True
best pair is interior
  heights=[1, 9, 2, 2, 9, 1]
    brute force    -> 27
    two pointers   -> 27
    all agree: True
stress: 800 random height maps cross-checked, two pointers against brute force

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
