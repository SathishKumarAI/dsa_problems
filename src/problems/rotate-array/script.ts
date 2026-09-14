// rotate-array — every approach in one file, cross-checked
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, the shared \`reverse_span\` helper, and a test suite covering the statement's
examples, negatives, \`k\` larger than the array, the smallest legal input, \`k = 0\`, \`k = n\`, duplicate
values, two inputs where \`n\` and \`k\` share a factor so the cyclic rung must restart its chain, and 40
randomised stress cases with \`k\` deliberately often larger than \`n\` — each cross-checked against an
independent oracle that reads every destination from its source. Every approach rotates in place, so
each is handed its own copy.`

export const script = `"""Rotate the Array by k - every approach in one file, plus a self-checking test suite.

Run: python rotate_array_all.py
"""

from __future__ import annotations

import random


def reverse_span(nums: list[int], lo: int, hi: int) -> None:
    """Reverse nums[lo..hi] in place. Empty or single-element spans do nothing."""
    while lo < hi:
        nums[lo], nums[hi] = nums[hi], nums[lo]
        lo += 1
        hi -= 1


# --- 1. One step at a time -----------------------------------------------------

def rotate_array_one_step(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    for _ in range(k % n):  # k % n first, or a huge k repeats whole turns for nothing
        last = nums[n - 1]
        for i in range(n - 1, 0, -1):  # backwards: read every slot before overwriting it
            nums[i] = nums[i - 1]
        nums[0] = last
    return nums


# --- 2. Copy into a second array -----------------------------------------------

def rotate_array_second_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    moved = [0] * n
    for i in range(n):
        moved[(i + k) % n] = nums[i]  # the computed index is a DESTINATION, so it goes left
    for i in range(n):
        nums[i] = moved[i]
    return nums


# --- 3. Cut and rejoin ---------------------------------------------------------

def rotate_array_cut_and_rejoin(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    nums[:] = nums[n - k:] + nums[: n - k]  # slice-assign so the caller's list changes
    return nums


# --- 4. Cyclic replacements ----------------------------------------------------

def rotate_array_cyclic(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    moved = 0
    start = 0
    while moved < n:  # the counter restarts the walk for each of gcd(n, k) chains
        i = start
        carry = nums[start]
        while True:
            j = (i + k) % n
            nums[j], carry = carry, nums[j]
            i = j
            moved += 1
            if i == start:
                break
        start += 1
    return nums


# --- 5. Three reversals (optimal) ----------------------------------------------

def rotate_array_three_reversals(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    reverse_span(nums, 0, n - 1)  # blocks now on the correct sides, each backwards
    reverse_span(nums, 0, k - 1)  # repair the block that used to be the tail
    reverse_span(nums, k, n - 1)  # repair the block that used to be the head
    return nums


APPROACHES = [
    ("one_step", rotate_array_one_step),
    ("second_array", rotate_array_second_array),
    ("cut_and_rejoin", rotate_array_cut_and_rejoin),
    ("cyclic", rotate_array_cyclic),
    ("three_reversals", rotate_array_three_reversals),
]


# --- test scaffolding, not part of any answer ----------------------------------

def rotate_reference(nums: list[int], k: int) -> list[int]:
    """Independent oracle: the value landing at j came from j - k, wrapped."""
    n = len(nums)
    return [nums[(i - k) % n] for i in range(n)]


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 2, 3, 4, 5, 6, 7], 3),
        ("negatives", [-1, -100, 3, 99], 2),
        ("k larger than the array", [1, 2], 5),
        ("smallest legal input", [7], 0),
        ("smallest legal input, k > n", [7], 3),
        ("k = 0, nothing moves", [1, 2, 3, 4], 0),
        ("k = n, a full turn", [1, 2, 3, 4], 4),
        ("k = n - 1", [1, 2, 3, 4], 3),
        ("duplicates", [1, 1, 2, 2, 1, 1], 3),
        ("gcd(n, k) = 2 - two cycles", [1, 2, 3, 4, 5, 6], 2),
        ("gcd(n, k) = 4 - four cycles", [1, 2, 3, 4, 5, 6, 7, 8], 4),
        ("all equal", [5, 5, 5, 5], 2),
    ]
    # Every input has an answer: a rotation is always defined, so this problem has
    # no "no answer" case to test. The O(n * k) rung is kept to small n here; its
    # 10^10-write worst case at the stated limits is analytic, not measured.

    rng = random.Random(20260912)
    for _ in range(40):
        n = rng.randint(1, 30)
        nums = [rng.randint(-50, 50) for _ in range(n)]
        k = rng.randint(0, 120)  # deliberately often larger than n
        cases.append((f"stress n={n} k={k}", nums, k))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, k in cases:
        shown = nums if len(nums) <= 8 else nums[:8] + ["..."]
        print(f"\\n{label}: nums={shown} k={k}")
        expected = rotate_reference(nums, k)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), k)  # every approach mutates in place: give each a copy
            results.append(got)
            short = got if len(got) <= 8 else got[:8] + ["..."]
            print(f"  {name:<{width}} -> {short}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected[:8]}")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
