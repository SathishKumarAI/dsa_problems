// move-zeroes — every approach in one file, cross-checked
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against both statement examples, the smallest legal input in
both its forms, all-one-value cases in both directions, duplicates among the kept values, an array
that needs no movement at all, the 32-bit bounds, and a randomised stress test weighted toward
zeroes so that the interesting cases actually occur. The oracle is the problem statement written out
directly — keep the non-zeroes in order, pad with zeroes — which is independent of all three
implementations.

**All three approaches mutate the list they are given**, so every call below is handed its own
\`list(nums)\` copy. Without that, the first approach would leave the array already compacted and the
next two would be handed a solved problem, so the cross-check would compare corrupted arrays and
pass no matter how broken the code was.`

export const script = `"""Push the Zeroes to the End — every approach in one file, cross-checked.

All three approaches MUTATE the list they are handed, so every call below gets its
own copy; sharing one list would make the cross-check compare corrupted arrays.

Run: python move_zeroes.py
"""

from __future__ import annotations

import random
from typing import Callable


def move_zeroes_filter_into_copy(nums: list[int]) -> list[int]:
    kept = [x for x in nums if x != 0]
    while len(kept) < len(nums):
        kept.append(0)
    for i in range(len(nums)):
        nums[i] = kept[i]  # copy back, because the caller owns the original list
    return nums


def move_zeroes_read_write(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
    for i in range(write, len(nums)):  # write now marks the start of the zero tail
        nums[i] = 0
    return nums


def move_zeroes_swap(nums: list[int]) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]  # the zero goes back to read
            write += 1
    return nums


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("filter into a copy", move_zeroes_filter_into_copy),
    ("reader and writer", move_zeroes_read_write),
    ("reader and writer, swapping", move_zeroes_swap),
]


def reference(nums: list[int]) -> list[int]:
    """Oracle: keep the non-zeroes in order, pad the rest with zeroes."""
    kept = [x for x in nums if x != 0]
    return kept + [0] * (len(nums) - len(kept))


def run_case(label: str, nums: list[int]) -> bool:
    expected = reference(nums)
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<28} -> {r}")
    print(f"    reference={expected}  all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("example from the statement", [0, 1, 0, 3, 12])
    ok &= run_case("second example from the statement", [0, 0, 1])
    ok &= run_case("smallest legal input (n = 1), a zero", [0])
    ok &= run_case("smallest legal input (n = 1), non-zero", [7])
    ok &= run_case("all one value, all zeroes", [0, 0, 0, 0])
    ok &= run_case("all one value, none zero", [5, 5, 5, 5])
    ok &= run_case("duplicates among the kept values", [4, 0, 4, 0, 4])
    ok &= run_case("nothing to move", [1, 2, 3, 0, 0])
    ok &= run_case("negatives and the 32-bit bounds", [-2147483648, 0, 2147483647, 0, -1])

    random.seed(11)
    mismatches = 0
    for _ in range(4000):
        nums = [random.choice([0, 0, 0, random.randint(-50, 50)])
                for _ in range(random.randint(1, 30))]
        expected = reference(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))  # fresh copy per approach
            if got != expected:
                mismatches += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} got={got} want={expected}")
    print(f"stress: 4000 zero-heavy random arrays vs the filter-and-pad oracle, "
          f"{mismatches} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[0, 1, 0, 3, 12]
    filter into a copy           -> [1, 3, 12, 0, 0]
    reader and writer            -> [1, 3, 12, 0, 0]
    reader and writer, swapping  -> [1, 3, 12, 0, 0]
    reference=[1, 3, 12, 0, 0]  all agree: True
second example from the statement
  nums=[0, 0, 1]
    filter into a copy           -> [1, 0, 0]
    reader and writer            -> [1, 0, 0]
    reader and writer, swapping  -> [1, 0, 0]
    reference=[1, 0, 0]  all agree: True
smallest legal input (n = 1), a zero
  nums=[0]
    filter into a copy           -> [0]
    reader and writer            -> [0]
    reader and writer, swapping  -> [0]
    reference=[0]  all agree: True
smallest legal input (n = 1), non-zero
  nums=[7]
    filter into a copy           -> [7]
    reader and writer            -> [7]
    reader and writer, swapping  -> [7]
    reference=[7]  all agree: True
all one value, all zeroes
  nums=[0, 0, 0, 0]
    filter into a copy           -> [0, 0, 0, 0]
    reader and writer            -> [0, 0, 0, 0]
    reader and writer, swapping  -> [0, 0, 0, 0]
    reference=[0, 0, 0, 0]  all agree: True
all one value, none zero
  nums=[5, 5, 5, 5]
    filter into a copy           -> [5, 5, 5, 5]
    reader and writer            -> [5, 5, 5, 5]
    reader and writer, swapping  -> [5, 5, 5, 5]
    reference=[5, 5, 5, 5]  all agree: True
duplicates among the kept values
  nums=[4, 0, 4, 0, 4]
    filter into a copy           -> [4, 4, 4, 0, 0]
    reader and writer            -> [4, 4, 4, 0, 0]
    reader and writer, swapping  -> [4, 4, 4, 0, 0]
    reference=[4, 4, 4, 0, 0]  all agree: True
nothing to move
  nums=[1, 2, 3, 0, 0]
    filter into a copy           -> [1, 2, 3, 0, 0]
    reader and writer            -> [1, 2, 3, 0, 0]
    reader and writer, swapping  -> [1, 2, 3, 0, 0]
    reference=[1, 2, 3, 0, 0]  all agree: True
negatives and the 32-bit bounds
  nums=[-2147483648, 0, 2147483647, 0, -1]
    filter into a copy           -> [-2147483648, 2147483647, -1, 0, 0]
    reader and writer            -> [-2147483648, 2147483647, -1, 0, 0]
    reader and writer, swapping  -> [-2147483648, 2147483647, -1, 0, 0]
    reference=[-2147483648, 2147483647, -1, 0, 0]  all agree: True
stress: 4000 zero-heavy random arrays vs the filter-and-pad oracle, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
