// classic-binary-search — every approach in one file, cross-checked
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, plus a test suite: both statement examples, every present value in the example
array, targets below and above the whole range, a target that falls in a gap, the smallest legal
input at length 1 both ways, and 600 randomised stress cases over sorted distinct arrays — each one
querying both a value that is present and a value that is absent, all cross-checked against the
linear scan.`

export const script = `"""Find a Target in Sorted Array - every approach in one file, plus a self-checking test suite.

Run: python classic_binary_search_all.py
"""

from __future__ import annotations

import random

# --- shared: the one place the midpoint rule lives ------------------------------


def midpoint(lo: int, hi: int) -> int:
    """Midpoint of an inclusive range, written so it cannot overflow a 32-bit int.

    In Python this is identical to (lo + hi) // 2 for every input; the form is kept
    because the Java and C++ translations of the same loop are not so lucky.
    """
    return lo + (hi - lo) // 2


# --- 1. Read every ticket ------------------------------------------------------


def classic_binary_search_linear_scan(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1


# --- 2. Halve it, recursively --------------------------------------------------


def classic_binary_search_recursive(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:  # the range is empty: the invariant now says "absent"
            return -1
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)


# --- 3. The same halving, iteratively (the data file's primary) ----------------


def classic_binary_search_iterative(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:  # inclusive range: lo == hi still holds one live candidate
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1  # everything at or left of mid is too small
        else:
            hi = mid - 1  # everything at or right of mid is too large
    return -1


# --- 4. Converge on the single survivor ---------------------------------------


def classic_binary_search_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:  # converging range: stop with exactly one candidate left
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid is provably too small, skip it
        else:
            hi = mid  # mid might BE the answer, so keep it
    return lo if nums[lo] == target else -1


APPROACHES = [
    ("linear_scan", classic_binary_search_linear_scan),
    ("recursive", classic_binary_search_recursive),
    ("iterative", classic_binary_search_iterative),
    ("converging", classic_binary_search_converging),
]

# --- test suite ----------------------------------------------------------------


def main() -> None:
    example = [-3, 0, 4, 9, 12]
    cases: list[tuple[str, list[int], int]] = [
        ("statement example, present", example, 9),
        ("statement example, absent", example, 2),
        ("first element", example, -3),
        ("last element", example, 12),
        ("middle element", example, 4),
        ("second element", example, 0),
        ("below everything", example, -10000),
        ("above everything", example, 10000),
        ("in a gap", example, 7),
        ("length 1, present", [5], 5),
        ("length 1, absent", [5], 4),
        ("length 2, both present", [1, 2], 1),
        ("length 2, second present", [1, 2], 2),
        ("length 2, absent between", [1, 3], 2),
        ("negatives only", [-9, -7, -5, -1], -5),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        pool = rng.sample(range(-60, 61), n)
        nums = sorted(pool)
        present = nums[rng.randrange(n)]
        cases.append((f"stress n={n} present", nums, present))
        absent = rng.randrange(-70, 71)
        while absent in nums:
            absent = rng.randrange(-70, 71)
        cases.append((f"stress n={n} absent", nums, absent))
        cases.append((f"stress n={n} below", nums, nums[0] - 1))
        cases.append((f"stress n={n} above", nums, nums[-1] + 1))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, target in cases:
        shown = nums if len(nums) <= 10 else nums[:10] + ["..."]
        print(f"\\n{label}: nums={shown} target={target}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
            all_agreed = False
            print("  DISAGREEMENT")
        # an index is only an answer if it actually holds the target
        if results[0] != -1 and nums[results[0]] != target:
            all_agreed = False
            print("  BAD INDEX")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
