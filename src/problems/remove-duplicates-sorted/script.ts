// remove-duplicates-sorted — every approach in one file, cross-checked
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Both approaches in one file, checked against the statement's two examples, the smallest legal
input, the empty array, an input where everything is a duplicate, an input where nothing is, and a
randomised stress test against an independent oracle.

Two things the harness does on purpose: it hands **each approach its own copy** of the input,
because the in-place version scribbles on what it is given; and it compares **only the returned
prefix**, never the array's tail, because the problem says nothing about what lives past position
\`k\` and a test that checked the tail would be asserting a promise that was never made.`

export const script = `"""Squeeze Out the Duplicates - every approach in one file, cross-checked.

Run: python remove_duplicates_sorted.py

Both approaches return the SURVIVING PREFIX only. What sits in the array beyond
that prefix is unspecified by the problem, so the harness never looks at it.
"""

from __future__ import annotations

import random
from typing import Callable


# ------------------------------------------------- approach 1: O(n) extra space
def remove_duplicates_sorted_distinct_copy(nums: list[int]) -> list[int]:
    out: list[int] = []
    for x in nums:
        if not out or out[-1] != x:  # compare against the last value KEPT
            out.append(x)
    return out


# ------------------------------------------------ approach 2: in place, O(1) space
def remove_duplicates_sorted_reader_writer(nums: list[int]) -> list[int]:
    if not nums:
        return []
    write = 1  # index 0 is always a survivor, so the first free slot is 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:  # differs from the last survivor WRITTEN
            nums[write] = nums[read]
            write += 1
    return nums[:write]


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("distinct copy", remove_duplicates_sorted_distinct_copy),
    ("reader/writer", remove_duplicates_sorted_reader_writer),
]


def reference(nums: list[int]) -> list[int]:
    """Independent, obviously-correct oracle for the stress test."""
    return [x for i, x in enumerate(nums) if i == 0 or nums[i - 1] != x]


def run_case(label: str, nums: list[int]) -> bool:
    expected = reference(nums)
    # Each approach gets its OWN copy: two of them mutate what they are handed.
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<16} -> k={len(r)} prefix={r}")
    print(f"    expected prefix  -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 from the statement", [1, 1, 2])
    ok &= run_case("example 2 from the statement", [0, 0, 1, 1, 1, 2, 2, 3, 3, 4])
    ok &= run_case("worked example used in the doc", [1, 1, 2, 2, 3])
    ok &= run_case("smallest legal input (n = 1)", [7])
    ok &= run_case("empty array (guard path)", [])
    ok &= run_case("everything is a duplicate - only one survives", [5, 5, 5, 5, 5])
    ok &= run_case("nothing is a duplicate - nothing is removed", [-100, -1, 0, 4, 100])
    ok &= run_case("duplicates only at the very end", [1, 2, 3, 3])
    ok &= run_case("duplicates only at the very start", [1, 1, 2, 3])

    random.seed(7)
    for _ in range(2000):
        nums = sorted(random.randint(-4, 4) for _ in range(random.randint(0, 14)))
        expected = reference(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} -> {got} != {expected}")
    print("stress: 2000 random sorted arrays, both approaches vs the oracle - "
          "prefixes only")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example 1 from the statement
  nums=[1, 1, 2]
    distinct copy    -> k=2 prefix=[1, 2]
    reader/writer    -> k=2 prefix=[1, 2]
    expected prefix  -> [1, 2]
    all agree: True
example 2 from the statement
  nums=[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
    distinct copy    -> k=5 prefix=[0, 1, 2, 3, 4]
    reader/writer    -> k=5 prefix=[0, 1, 2, 3, 4]
    expected prefix  -> [0, 1, 2, 3, 4]
    all agree: True
worked example used in the doc
  nums=[1, 1, 2, 2, 3]
    distinct copy    -> k=3 prefix=[1, 2, 3]
    reader/writer    -> k=3 prefix=[1, 2, 3]
    expected prefix  -> [1, 2, 3]
    all agree: True
smallest legal input (n = 1)
  nums=[7]
    distinct copy    -> k=1 prefix=[7]
    reader/writer    -> k=1 prefix=[7]
    expected prefix  -> [7]
    all agree: True
empty array (guard path)
  nums=[]
    distinct copy    -> k=0 prefix=[]
    reader/writer    -> k=0 prefix=[]
    expected prefix  -> []
    all agree: True
everything is a duplicate - only one survives
  nums=[5, 5, 5, 5, 5]
    distinct copy    -> k=1 prefix=[5]
    reader/writer    -> k=1 prefix=[5]
    expected prefix  -> [5]
    all agree: True
nothing is a duplicate - nothing is removed
  nums=[-100, -1, 0, 4, 100]
    distinct copy    -> k=5 prefix=[-100, -1, 0, 4, 100]
    reader/writer    -> k=5 prefix=[-100, -1, 0, 4, 100]
    expected prefix  -> [-100, -1, 0, 4, 100]
    all agree: True
duplicates only at the very end
  nums=[1, 2, 3, 3]
    distinct copy    -> k=3 prefix=[1, 2, 3]
    reader/writer    -> k=3 prefix=[1, 2, 3]
    expected prefix  -> [1, 2, 3]
    all agree: True
duplicates only at the very start
  nums=[1, 1, 2, 3]
    distinct copy    -> k=3 prefix=[1, 2, 3]
    reader/writer    -> k=3 prefix=[1, 2, 3]
    expected prefix  -> [1, 2, 3]
    all agree: True
stress: 2000 random sorted arrays, both approaches vs the oracle - prefixes only

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
