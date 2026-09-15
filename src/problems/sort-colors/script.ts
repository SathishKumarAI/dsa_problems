// sort-colors — every approach in one file, cross-checked
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against both statement examples, the smallest legal input,
all-one-value cases, an array with no ones at all, an already-sorted array, an exactly-reversed
array, and a randomised stress test cross-checked against Python's \`sorted()\` — which is a valid
oracle here precisely because the values are plain integers.

**Both approaches mutate the list they are given**, so every call below is handed its own \`list(nums)\`
copy. Without that, the first approach would sort the array and the second would be handed an
already-sorted array, so the cross-check would be comparing corrupted inputs and would pass no
matter how broken the code was.`

export const script = `"""Sort Three Colours In Place — every approach in one file, cross-checked.

Both approaches MUTATE the list they are handed, so every call below gets its own
copy; sharing one list would make the cross-check compare already-corrupted arrays.

Run: python sort_colors.py
"""

from __future__ import annotations

import random
from typing import Callable


def sort_colors_count_then_rewrite(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value  # writes a fresh value, does not move the original element
            at += 1
    return nums


def sort_colors_dutch_flag(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1  # mid does NOT advance: the value swapped in is unexamined
        else:
            mid += 1
    return nums


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("count then rewrite", sort_colors_count_then_rewrite),
    ("dutch flag", sort_colors_dutch_flag),
]


def run_case(label: str, nums: list[int]) -> bool:
    expected = sorted(nums)  # the oracle: three values, so a plain sort is the answer
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

    ok &= run_case("example from the statement", [2, 0, 2, 1, 1, 0])
    ok &= run_case("second example from the statement", [2, 0, 1])
    ok &= run_case("smallest legal input (n = 1)", [1])
    ok &= run_case("smallest legal input, a lone 2", [2])
    ok &= run_case("all one value", [1, 1, 1, 1, 1])
    ok &= run_case("all one value, all twos", [2, 2, 2])
    ok &= run_case("heavy duplicates, no ones at all", [2, 0, 0, 2, 2, 0])
    ok &= run_case("already sorted", [0, 0, 1, 1, 2, 2])
    ok &= run_case("exactly reversed", [2, 2, 1, 1, 0, 0])

    random.seed(3)
    mismatches = 0
    for _ in range(4000):
        nums = [random.randint(0, 2) for _ in range(random.randint(1, 30))]
        expected = sorted(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))  # fresh copy per approach
            if got != expected:
                mismatches += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} got={got} want={expected}")
    print(f"stress: 4000 random arrays of 0/1/2 vs sorted(), {mismatches} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[2, 0, 2, 1, 1, 0]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
second example from the statement
  nums=[2, 0, 1]
    count then rewrite   -> [0, 1, 2]
    dutch flag           -> [0, 1, 2]
    reference=[0, 1, 2]  all agree: True
smallest legal input (n = 1)
  nums=[1]
    count then rewrite   -> [1]
    dutch flag           -> [1]
    reference=[1]  all agree: True
smallest legal input, a lone 2
  nums=[2]
    count then rewrite   -> [2]
    dutch flag           -> [2]
    reference=[2]  all agree: True
all one value
  nums=[1, 1, 1, 1, 1]
    count then rewrite   -> [1, 1, 1, 1, 1]
    dutch flag           -> [1, 1, 1, 1, 1]
    reference=[1, 1, 1, 1, 1]  all agree: True
all one value, all twos
  nums=[2, 2, 2]
    count then rewrite   -> [2, 2, 2]
    dutch flag           -> [2, 2, 2]
    reference=[2, 2, 2]  all agree: True
heavy duplicates, no ones at all
  nums=[2, 0, 0, 2, 2, 0]
    count then rewrite   -> [0, 0, 0, 2, 2, 2]
    dutch flag           -> [0, 0, 0, 2, 2, 2]
    reference=[0, 0, 0, 2, 2, 2]  all agree: True
already sorted
  nums=[0, 0, 1, 1, 2, 2]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
exactly reversed
  nums=[2, 2, 1, 1, 0, 0]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
stress: 4000 random arrays of 0/1/2 vs sorted(), 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
