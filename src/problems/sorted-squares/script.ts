// sorted-squares — every approach in one file, cross-checked
//
// Converted from docs/deep/sorted-squares_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against both statement examples, the smallest legal input in two
forms, an all-non-negative array (where the merge loop never runs and the right drain does all the
work), an all-negative array (the mirror case), all-one-value arrays, equal magnitudes of opposite
sign, an array straddling zero with duplicates, the constraint bounds, and a randomised stress test
against \`sorted(x * x)\`.

None of these approaches mutates its input — the answer is a new array — but every call is still
handed its own \`list(nums)\` copy, so that adding an in-place variant later cannot silently corrupt
the cross-check.`

export const script = `"""Squares of a Sorted Array — every approach in one file, cross-checked.

Nothing here mutates its input (the answer is a new array), but every call still
gets its own copy so a future in-place variant cannot corrupt the cross-check.

Run: python sorted_squares.py
"""

from __future__ import annotations

import random
from typing import Callable


def sorted_squares_square_then_sort(nums: list[int]) -> list[int]:
    return sorted(x * x for x in nums)  # squares FIRST, then sort — the order matters


def sorted_squares_split_and_merge(nums: list[int]) -> list[int]:
    n = len(nums)
    split = 0
    while split < n and nums[split] < 0:  # first index holding a non-negative value
        split += 1
    i, j = split - 1, split  # i walks the negatives leftward, j the non-negatives rightward
    out: list[int] = []
    while i >= 0 and j < n:
        left, right = nums[i] * nums[i], nums[j] * nums[j]
        if left <= right:
            out.append(left)
            i -= 1
        else:
            out.append(right)
            j += 1
    while i >= 0:  # one run is exhausted; drain the other
        out.append(nums[i] * nums[i])
        i -= 1
    while j < n:
        out.append(nums[j] * nums[j])
        j += 1
    return out


def sorted_squares_two_pointers(nums: list[int]) -> list[int]:
    out = [0] * len(nums)
    i, j = 0, len(nums) - 1
    for at in range(len(nums) - 1, -1, -1):  # fill from the BACK: the ends hold the largest
        left = nums[i] * nums[i]
        right = nums[j] * nums[j]
        if left > right:
            out[at] = left
            i += 1
        else:
            out[at] = right
            j -= 1
    return out


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("square then sort", sorted_squares_square_then_sort),
    ("split and merge", sorted_squares_split_and_merge),
    ("two pointers", sorted_squares_two_pointers),
]


def reference(nums: list[int]) -> list[int]:
    """Oracle: square everything, hand it to the library sort."""
    return sorted(x * x for x in nums)


def run_case(label: str, nums: list[int]) -> bool:
    expected = reference(nums)
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<20} -> {r}")
    print(f"    reference={expected}  all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("example from the statement", [-4, -1, 0, 3, 10])
    ok &= run_case("second example from the statement", [-3, -2, -1])
    ok &= run_case("smallest legal input (n = 1), negative", [-5])
    ok &= run_case("smallest legal input (n = 1), zero", [0])
    ok &= run_case("all non-negative, already sorted by squaring", [0, 2, 7, 9])
    ok &= run_case("all negative, order fully reverses", [-9, -7, -2, 0])
    ok &= run_case("all one value", [4, 4, 4, 4])
    ok &= run_case("all one value, all zeroes", [0, 0, 0])
    ok &= run_case("equal magnitudes of opposite sign", [-3, -3, 3, 3])
    ok &= run_case("straddles zero with duplicates", [-2, -2, -1, 1, 1, 2])
    ok &= run_case("constraint bounds", [-10000, -1, 0, 1, 10000])

    random.seed(5)
    mismatches = 0
    for _ in range(4000):
        nums = sorted(random.randint(-30, 30) for _ in range(random.randint(1, 30)))
        expected = reference(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))  # fresh copy per approach
            if got != expected:
                mismatches += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} got={got} want={expected}")
    print(f"stress: 4000 random sorted arrays vs sorted(x*x), {mismatches} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[-4, -1, 0, 3, 10]
    square then sort     -> [0, 1, 9, 16, 100]
    split and merge      -> [0, 1, 9, 16, 100]
    two pointers         -> [0, 1, 9, 16, 100]
    reference=[0, 1, 9, 16, 100]  all agree: True
second example from the statement
  nums=[-3, -2, -1]
    square then sort     -> [1, 4, 9]
    split and merge      -> [1, 4, 9]
    two pointers         -> [1, 4, 9]
    reference=[1, 4, 9]  all agree: True
smallest legal input (n = 1), negative
  nums=[-5]
    square then sort     -> [25]
    split and merge      -> [25]
    two pointers         -> [25]
    reference=[25]  all agree: True
smallest legal input (n = 1), zero
  nums=[0]
    square then sort     -> [0]
    split and merge      -> [0]
    two pointers         -> [0]
    reference=[0]  all agree: True
all non-negative, already sorted by squaring
  nums=[0, 2, 7, 9]
    square then sort     -> [0, 4, 49, 81]
    split and merge      -> [0, 4, 49, 81]
    two pointers         -> [0, 4, 49, 81]
    reference=[0, 4, 49, 81]  all agree: True
all negative, order fully reverses
  nums=[-9, -7, -2, 0]
    square then sort     -> [0, 4, 49, 81]
    split and merge      -> [0, 4, 49, 81]
    two pointers         -> [0, 4, 49, 81]
    reference=[0, 4, 49, 81]  all agree: True
all one value
  nums=[4, 4, 4, 4]
    square then sort     -> [16, 16, 16, 16]
    split and merge      -> [16, 16, 16, 16]
    two pointers         -> [16, 16, 16, 16]
    reference=[16, 16, 16, 16]  all agree: True
all one value, all zeroes
  nums=[0, 0, 0]
    square then sort     -> [0, 0, 0]
    split and merge      -> [0, 0, 0]
    two pointers         -> [0, 0, 0]
    reference=[0, 0, 0]  all agree: True
equal magnitudes of opposite sign
  nums=[-3, -3, 3, 3]
    square then sort     -> [9, 9, 9, 9]
    split and merge      -> [9, 9, 9, 9]
    two pointers         -> [9, 9, 9, 9]
    reference=[9, 9, 9, 9]  all agree: True
straddles zero with duplicates
  nums=[-2, -2, -1, 1, 1, 2]
    square then sort     -> [1, 1, 1, 4, 4, 4]
    split and merge      -> [1, 1, 1, 4, 4, 4]
    two pointers         -> [1, 1, 1, 4, 4, 4]
    reference=[1, 1, 1, 4, 4, 4]  all agree: True
constraint bounds
  nums=[-10000, -1, 0, 1, 10000]
    square then sort     -> [0, 1, 1, 100000000, 100000000]
    split and merge      -> [0, 1, 1, 100000000, 100000000]
    two pointers         -> [0, 1, 1, 100000000, 100000000]
    reference=[0, 1, 1, 100000000, 100000000]  all agree: True
stress: 4000 random sorted arrays vs sorted(x*x), 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
