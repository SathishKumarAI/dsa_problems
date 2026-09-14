// largest-rectangle — every approach in one file, cross-checked
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All three approaches in one file, cross-checked on every case. Coverage: the statement's example; the
smallest legal input (\`n = 1\`); \`0\` as a legal height and an all-zero histogram, which is the
no-rectangle case the constraints allow; both monotone shapes, since a strictly ascending histogram is
what the missing-sentinel bug fails on; a plateau of equal bars, which is what the \`>=\` bug fails on;
and a randomised stress test in two regimes, one of them deliberately tie-heavy.`

export const script = `"""Largest Rectangle in Histogram - every approach in one file, cross-checked.

Run: python largest_rectangle.py
"""

from __future__ import annotations

import random
import sys

SENTINEL_HEIGHT: int = 0  # <= every legal height, so it drains the stack completely


def largest_rectangle_brute_force(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:  # >=, so equal bars do not stop the spread
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best


def largest_rectangle_divide_and_conquer(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)  # the only rectangle that may cross the minimum
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)


def largest_rectangle_monotonic_stack(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices of unfinished bars, heights non-decreasing
    for i, h in enumerate(heights + [SENTINEL_HEIGHT]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0  # the bar below is the first shorter one on the left
            best = max(best, height * (i - left))
        st.append(i)
    return best


APPROACHES: list[tuple[str, object]] = [
    ("brute force", largest_rectangle_brute_force),
    ("divide & conquer", largest_rectangle_divide_and_conquer),
    ("monotonic stack", largest_rectangle_monotonic_stack),
]


def run_case(label: str, heights: list[int]) -> bool:
    results = [(name, fn(list(heights))) for name, fn in APPROACHES]  # own copy each
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  heights={heights}")
    for name, r in results:
        print(f"    {name:<17} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("statement example", [2, 1, 5, 6, 2, 3])

    # Smallest legal input: one bar is its own rectangle.
    ok &= run_case("smallest legal input (n = 1)", [5])

    # Height 0 is legal, and a histogram of nothing but zeroes holds no rectangle at all.
    ok &= run_case("zero height is legal", [0])
    ok &= run_case("no rectangle with any area", [0, 0, 0])

    # The two monotone shapes - the ascending one is what a missing sentinel breaks.
    ok &= run_case("strictly increasing (nothing ever pops early)", [1, 2, 3, 4, 5])
    ok &= run_case("strictly decreasing", [5, 4, 3, 2, 1])

    # Equal bars: the whole span is one rectangle. This is what the \`>\` spread bug breaks.
    ok &= run_case("all equal", [3, 3, 3, 3])

    # A zero in the middle splits the histogram in two.
    ok &= run_case("split by a zero", [4, 4, 0, 5, 5])

    # Tall-narrow versus short-wide, decided by the shortest bar.
    ok &= run_case("tall spike beside a wide plateau", [1, 1, 1, 1, 9])

    # Stress against brute force. n is kept small: divide & conquer recurses once per bar
    # on sorted input and brute force is quadratic - the worst cases of both are stated
    # analytically in the document above, not measured here. The second regime uses only
    # three distinct heights so plateaus and ties are common.
    rng = random.Random(5)
    for _ in range(1500):
        heights = [rng.randint(0, 9) for _ in range(rng.randint(1, 40))]
        results = [fn(list(heights)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT heights={heights} -> {results}")
    for _ in range(300):
        heights = [rng.choice([0, 1, 2]) for _ in range(rng.randint(1, 30))]
        results = [fn(list(heights)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT heights={heights} -> {results}")
    print("stress: 1500 random + 300 tie-heavy histograms cross-checked")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    sys.setrecursionlimit(10000)  # divide & conquer recurses once per bar on sorted input
    main()`
