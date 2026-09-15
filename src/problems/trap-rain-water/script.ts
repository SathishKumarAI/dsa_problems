// trap-rain-water — every approach in one file, cross-checked
//
// Converted from docs/deep/trap-rain-water_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All three approaches in one file, checked against both of the statement's examples, the smallest
legal input (\`n = 1\`), a two-bar map with no interior, strictly increasing and strictly decreasing
maps that must trap nothing, an all-equal map, a clean rectangular pool, and a randomised stress test
over 800 maps with small heights so that dips and pools occur constantly.`

export const script = `"""Water Held by an Elevation Map — every approach in one file, cross-checked.

Run: python trap_rain_water.py
"""

from __future__ import annotations

import random


def trap_rain_water_brute_force(height: list[int]) -> int:
    total = 0
    for i in range(len(height)):
        left = max(height[: i + 1])   # tallest bar at or before i, rescanned every time
        right = max(height[i:])       # tallest bar at or after i
        total += min(left, right) - height[i]
    return total


def trap_rain_water_prefix_suffix(height: list[int]) -> int:
    n = len(height)
    if n == 0:
        return 0
    left = [0] * n
    right = [0] * n
    left[0] = height[0]
    for i in range(1, n):
        left[i] = max(left[i - 1], height[i])
    right[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], height[i])
    return sum(min(left[i], right[i]) - height[i] for i in range(n))


def trap_rain_water_two_pointers(height: list[int]) -> int:
    i, j = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while i < j:
        if height[i] < height[j]:
            # height[j] is taller, so SOME wall at least this tall stands to the right:
            # left_max alone decides this column's water level.
            left_max = max(left_max, height[i])
            total += left_max - height[i]
            i += 1
        else:
            right_max = max(right_max, height[j])
            total += right_max - height[j]
            j -= 1
    return total


APPROACHES: list[tuple[str, object]] = [
    ("brute force", trap_rain_water_brute_force),
    ("prefix/suffix", trap_rain_water_prefix_suffix),
    ("two pointers", trap_rain_water_two_pointers),
]


def run_case(label: str, height: list[int]) -> bool:
    results = [(name, fn(list(height))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(f"{label}")
    print(f"  height={height}")
    for name, r in results:
        print(f"    {name:<14} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # The statement's first example.
    ok &= run_case("example from the statement", [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])

    # The statement's second example: one dip, min(4, 3) - 2 = 1.
    ok &= run_case("second example", [4, 2, 3])

    # Smallest legal input: a single bar traps nothing.
    ok &= run_case("smallest legal input (n = 1)", [5])

    # Two bars have no interior, so nothing is trapped either.
    ok &= run_case("two bars", [5, 9])

    # Monotone maps trap nothing however large they get.
    ok &= run_case("strictly increasing", [1, 2, 3, 4, 5])
    ok &= run_case("strictly decreasing", [5, 4, 3, 2, 1])

    # All equal — flat ground, no dips.
    ok &= run_case("all duplicates", [3, 3, 3, 3])

    # Flat floor between two tall walls: a clean rectangular pool.
    ok &= run_case("one wide pool", [5, 0, 0, 0, 5])

    # Randomised stress against brute force, small heights so pools are common.
    random.seed(21)
    for _ in range(800):
        height = [random.randint(0, 9) for _ in range(random.randint(1, 40))]
        results = [fn(list(height)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT height={height} -> {results}")
    print("stress: 800 random elevation maps cross-checked, all three approaches")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  height=[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
    brute force    -> 6
    prefix/suffix  -> 6
    two pointers   -> 6
    all agree: True
second example
  height=[4, 2, 3]
    brute force    -> 1
    prefix/suffix  -> 1
    two pointers   -> 1
    all agree: True
smallest legal input (n = 1)
  height=[5]
    brute force    -> 0
    prefix/suffix  -> 0
    two pointers   -> 0
    all agree: True
two bars
  height=[5, 9]
    brute force    -> 0
    prefix/suffix  -> 0
    two pointers   -> 0
    all agree: True
strictly increasing
  height=[1, 2, 3, 4, 5]
    brute force    -> 0
    prefix/suffix  -> 0
    two pointers   -> 0
    all agree: True
strictly decreasing
  height=[5, 4, 3, 2, 1]
    brute force    -> 0
    prefix/suffix  -> 0
    two pointers   -> 0
    all agree: True
all duplicates
  height=[3, 3, 3, 3]
    brute force    -> 0
    prefix/suffix  -> 0
    two pointers   -> 0
    all agree: True
one wide pool
  height=[5, 0, 0, 0, 5]
    brute force    -> 15
    prefix/suffix  -> 15
    two pointers   -> 15
    all agree: True
stress: 800 random elevation maps cross-checked, all three approaches

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
