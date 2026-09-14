// remove-element — every approach in one file, cross-checked
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All five approaches in one file, checked against the statement's three examples, the smallest legal
input (the empty array), single-element arrays in both directions, the all-elements-removed case,
the nothing-removed case, removals at the very front and the very back, duplicates of a value that
stays, and a randomised stress test against an independent oracle. The stress test draws \`val\` from
a range one wider than the values, so a meaningful slice of the random cases are "nothing to remove"
— the input that separates the last two rungs.

Two things the harness does on purpose. It hands **each approach its own copy** of the input, because
four of the five scribble on what they are given and the fifth does not, so sharing an array would
let one approach's leftovers decide another's answer. And it compares **only the returned prefix**,
never the array's tail: the problem says nothing about what lives past position \`k\`, and the tails
here genuinely differ between approaches — the filtered copy leaves the original untouched while the
in-place versions leave rubbish behind — so a test that compared whole arrays would fail five
correct implementations against each other for disagreeing about something the problem never
promised.`

export const script = `"""Strip Out Every Copy of a Value - every approach in one file, cross-checked.

Run: python remove_element.py

Every approach returns the SURVIVING PREFIX. What the array holds beyond that
prefix is unspecified by the problem - "filter into a copy" leaves the original
untouched while the in-place ones scribble on it - so the harness compares the
returned prefixes and nothing else.
"""

from __future__ import annotations

import random
from typing import Callable


# ------------------------------------------- approach 1: delete and shift, O(n^2)
def remove_element_delete_and_shift(nums: list[int], val: int) -> list[int]:
    n = len(nums)  # the LIVE length, which shrinks with every removal
    i = 0
    while i < n:
        if nums[i] == val:
            for j in range(i, n - 1):
                nums[j] = nums[j + 1]
            n -= 1  # note i does NOT advance: a new value slid into this slot
        else:
            i += 1
    return nums[:n]


# ------------------------------------------- approach 2: filter into a copy, O(n)
def remove_element_filter_copy(nums: list[int], val: int) -> list[int]:
    kept: list[int] = []
    for x in nums:
        if x != val:
            kept.append(x)
    return kept


# ----------------------------------------- approach 3: count, then compact, O(n)
def remove_element_count_then_compact(nums: list[int], val: int) -> list[int]:
    keep = 0
    for x in nums:
        if x != val:
            keep += 1
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:keep]


# --------------------------------------------- approach 4: reader and writer, O(n)
def remove_element_reader_writer(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return nums[:write]  # the writer's final position IS the answer's length


# ----------------------------- approach 5: reader and writer, self-writes skipped
def remove_element_skip_self_write(nums: list[int], val: int) -> list[int]:
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            if read != write:  # the pointers have not parted yet: nothing to move
                nums[write] = nums[read]
            write += 1
    return nums[:write]


Remove = Callable[[list[int], int], list[int]]

APPROACHES: list[tuple[str, Remove]] = [
    ("delete and shift", remove_element_delete_and_shift),
    ("filter into a copy", remove_element_filter_copy),
    ("count then compact", remove_element_count_then_compact),
    ("reader and writer", remove_element_reader_writer),
    ("skip self-writes", remove_element_skip_self_write),
]


def reference(nums: list[int], val: int) -> list[int]:
    """Independent, obviously-correct oracle for the stress test."""
    return [x for x in nums if x != val]


def run_case(label: str, nums: list[int], val: int) -> bool:
    expected = reference(nums, val)
    # Own copy per approach: four of the five mutate what they are handed.
    results = [(name, fn(list(nums), val)) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  nums={nums} val={val}")
    for name, r in results:
        print(f"    {name:<20} -> k={len(r)} prefix={r}")
    print(f"    expected prefix      -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 from the statement", [3, 2, 2, 3], 3)
    ok &= run_case("example 2 / the doc's worked example",
                   [0, 1, 2, 2, 3, 0, 4, 2], 2)
    ok &= run_case("example 3 - every element is removed", [2, 2, 2], 2)
    ok &= run_case("smallest legal input - empty array", [], 0)
    ok &= run_case("single element, removed", [4], 4)
    ok &= run_case("single element, kept", [4], 9)
    ok &= run_case("val never appears - nothing is removed", [1, 2, 3], 50)
    ok &= run_case("only the first element goes", [7, 1, 2], 7)
    ok &= run_case("only the last element goes", [1, 2, 7], 7)
    ok &= run_case("duplicates of a value that stays", [5, 5, 9, 5, 9], 9)

    random.seed(5)
    for _ in range(3000):
        nums = [random.randint(0, 4) for _ in range(random.randint(0, 12))]
        val = random.randint(0, 5)  # 5 never appears, so "nothing removed" is covered
        expected = reference(nums, val)
        for name, fn in APPROACHES:
            got = fn(list(nums), val)
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} val={val} "
                      f"-> {got} != {expected}")
    print("stress: 3000 random arrays, all five approaches vs the oracle - "
          "prefixes only")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example 1 from the statement
  nums=[3, 2, 2, 3] val=3
    delete and shift     -> k=2 prefix=[2, 2]
    filter into a copy   -> k=2 prefix=[2, 2]
    count then compact   -> k=2 prefix=[2, 2]
    reader and writer    -> k=2 prefix=[2, 2]
    skip self-writes     -> k=2 prefix=[2, 2]
    expected prefix      -> [2, 2]
    all agree: True
example 2 / the doc's worked example
  nums=[0, 1, 2, 2, 3, 0, 4, 2] val=2
    delete and shift     -> k=5 prefix=[0, 1, 3, 0, 4]
    filter into a copy   -> k=5 prefix=[0, 1, 3, 0, 4]
    count then compact   -> k=5 prefix=[0, 1, 3, 0, 4]
    reader and writer    -> k=5 prefix=[0, 1, 3, 0, 4]
    skip self-writes     -> k=5 prefix=[0, 1, 3, 0, 4]
    expected prefix      -> [0, 1, 3, 0, 4]
    all agree: True
example 3 - every element is removed
  nums=[2, 2, 2] val=2
    delete and shift     -> k=0 prefix=[]
    filter into a copy   -> k=0 prefix=[]
    count then compact   -> k=0 prefix=[]
    reader and writer    -> k=0 prefix=[]
    skip self-writes     -> k=0 prefix=[]
    expected prefix      -> []
    all agree: True
smallest legal input - empty array
  nums=[] val=0
    delete and shift     -> k=0 prefix=[]
    filter into a copy   -> k=0 prefix=[]
    count then compact   -> k=0 prefix=[]
    reader and writer    -> k=0 prefix=[]
    skip self-writes     -> k=0 prefix=[]
    expected prefix      -> []
    all agree: True
single element, removed
  nums=[4] val=4
    delete and shift     -> k=0 prefix=[]
    filter into a copy   -> k=0 prefix=[]
    count then compact   -> k=0 prefix=[]
    reader and writer    -> k=0 prefix=[]
    skip self-writes     -> k=0 prefix=[]
    expected prefix      -> []
    all agree: True
single element, kept
  nums=[4] val=9
    delete and shift     -> k=1 prefix=[4]
    filter into a copy   -> k=1 prefix=[4]
    count then compact   -> k=1 prefix=[4]
    reader and writer    -> k=1 prefix=[4]
    skip self-writes     -> k=1 prefix=[4]
    expected prefix      -> [4]
    all agree: True
val never appears - nothing is removed
  nums=[1, 2, 3] val=50
    delete and shift     -> k=3 prefix=[1, 2, 3]
    filter into a copy   -> k=3 prefix=[1, 2, 3]
    count then compact   -> k=3 prefix=[1, 2, 3]
    reader and writer    -> k=3 prefix=[1, 2, 3]
    skip self-writes     -> k=3 prefix=[1, 2, 3]
    expected prefix      -> [1, 2, 3]
    all agree: True
only the first element goes
  nums=[7, 1, 2] val=7
    delete and shift     -> k=2 prefix=[1, 2]
    filter into a copy   -> k=2 prefix=[1, 2]
    count then compact   -> k=2 prefix=[1, 2]
    reader and writer    -> k=2 prefix=[1, 2]
    skip self-writes     -> k=2 prefix=[1, 2]
    expected prefix      -> [1, 2]
    all agree: True
only the last element goes
  nums=[1, 2, 7] val=7
    delete and shift     -> k=2 prefix=[1, 2]
    filter into a copy   -> k=2 prefix=[1, 2]
    count then compact   -> k=2 prefix=[1, 2]
    reader and writer    -> k=2 prefix=[1, 2]
    skip self-writes     -> k=2 prefix=[1, 2]
    expected prefix      -> [1, 2]
    all agree: True
duplicates of a value that stays
  nums=[5, 5, 9, 5, 9] val=9
    delete and shift     -> k=3 prefix=[5, 5, 5]
    filter into a copy   -> k=3 prefix=[5, 5, 5]
    count then compact   -> k=3 prefix=[5, 5, 5]
    reader and writer    -> k=3 prefix=[5, 5, 5]
    skip self-writes     -> k=3 prefix=[5, 5, 5]
    expected prefix      -> [5, 5, 5]
    all agree: True
stress: 3000 random arrays, all five approaches vs the oracle - prefixes only

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
