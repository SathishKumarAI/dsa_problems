// next-permutation — every approach in one file, cross-checked
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach above, plus a test suite that runs the statement's example, the wrap case, the worked
example, the smallest legal input, duplicates both mid-sequence and at the end, an all-equal array,
and twenty-one randomised stress cases drawn from a deliberately tiny value range so that duplicates
are common. Values come back cross-checked two ways: every approach must agree, and every result must
be a rearrangement of the same multiset. **Every approach rearranges the list it is given**, so each
one is handed its own copy. The factorial rung caps the stress sizes at seven.`

export const script = `"""The Next Arrangement in Order - every approach in one file, plus a self-checking test suite.

Every approach REARRANGES ITS ARGUMENT, so each one is handed its own copy.

Run: python next_permutation_all.py
"""

from __future__ import annotations

import random


# --- the observation the last three approaches share -------------------------

def find_pivot(nums: list[int]) -> int:
    """The rightmost index whose value is below its successor, or -1 when the array is
    non-increasing and therefore the last arrangement. Everything after the pivot is
    already maximal, which is why the pivot is the only position that can change.

    >= keeps the scan going past equal neighbours, which is what makes duplicates work.
    """
    pivot = len(nums) - 2
    while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
        pivot -= 1
    return pivot


# --- 1. List every arrangement in order ----------------------------------------

def next_permutation_enumerate_all(nums: list[int]) -> list[int]:
    n = len(nums)
    base = sorted(nums)
    total = 1
    for i in range(2, n + 1):
        total *= i
    seen = set()  # a set, not a list: two identical arrangements are ONE arrangement
    for k in range(total):
        # k counted in the factorial number system picks one ordering
        pool = list(base)
        perm = []
        rest = k
        for left in range(n, 0, -1):
            f = 1
            for i in range(2, left):
                f *= i  # f is (left - 1)!, the place value of this digit
            perm.append(pool.pop(rest // f))
            rest %= f
        seen.add(tuple(perm))
    ordered = sorted(seen)
    at = ordered.index(tuple(nums))
    return list(ordered[(at + 1) % len(ordered)])  # % wraps the last arrangement to the first


# --- 2. Try every swap, then sort the tail -------------------------------------

def next_permutation_every_swap(nums: list[int]) -> list[int]:
    n = len(nums)
    best = None
    for i in range(n):
        for j in range(i + 1, n):
            cand = list(nums)
            cand[i], cand[j] = cand[j], cand[i]
            cand[i + 1:] = sorted(cand[i + 1:])  # everything after the change goes as small as it can
            if cand > nums and (best is None or cand < best):
                best = cand
    # nothing beat the input, so it was the last arrangement
    return best if best is not None else sorted(nums)


# --- 3. Find the pivot, then sort the tail -------------------------------------

def next_permutation_pivot_sort_tail(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot < 0:
        nums.sort()  # no successor: wrap to the smallest arrangement
        return nums
    nums[pivot + 1:] = sorted(nums[pivot + 1:])
    at = pivot + 1
    while nums[at] <= nums[pivot]:
        at += 1
    # the tail stays ascending: the pivot's value slots exactly where the
    # value it displaced was smallest-but-still-larger
    nums[pivot], nums[at] = nums[at], nums[pivot]
    return nums


# --- 4. Pivot, swap, rebuild the tail backwards --------------------------------

def next_permutation_pivot_rebuild_tail(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:  # from the RIGHT, so the first hit is the smallest one above
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    tail = []
    for i in range(n - 1, pivot, -1):  # stops AT pivot, exclusive - the pivot is not part of the tail
        tail.append(nums[i])
    nums[pivot + 1:] = tail
    return nums


# --- 5. Pivot, swap, reverse the tail in place (optimal) -----------------------

def next_permutation_pivot_reverse(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot >= 0:
        at = n - 1
        while nums[at] <= nums[pivot]:
            at -= 1
        nums[pivot], nums[at] = nums[at], nums[pivot]
    # pivot == -1 means no successor: the tail is the whole array, and
    # reversing it wraps to the smallest arrangement
    left, right = pivot + 1, n - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1
    return nums


APPROACHES = [
    ("enumerate_all", next_permutation_enumerate_all),
    ("every_swap", next_permutation_every_swap),
    ("pivot_sort_tail", next_permutation_pivot_sort_tail),
    ("pivot_rebuild_tail", next_permutation_pivot_rebuild_tail),
    ("pivot_reverse", next_permutation_pivot_reverse),
]


# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3]),
        ("the wrap: fully descending", [3, 2, 1]),
        ("worked example", [1, 3, 5, 4, 2]),
        ("smallest legal input", [7]),
        ("duplicates", [1, 1, 5]),
        ("duplicates, already last", [5, 1, 1]),
        ("all equal - first and last at once", [4, 4, 4]),
        ("pivot at the very front", [2, 9, 8, 7]),
    ]

    rng = random.Random(20260912)
    for n in range(1, 8):  # the enumeration is factorial: keep the stress arrays short
        for _ in range(3):
            # a tiny value range on purpose, so duplicates turn up constantly
            cases.append((f"stress n={n}", [rng.randint(0, 3) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        print(f"\\n{label}: nums={nums}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))  # each approach mutates, so each gets its own copy
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        # the answer must be a rearrangement of the input, nothing added or dropped
        valid = all(sorted(r) == sorted(nums) for r in results)
        if not agreed or not valid:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, same multiset={valid})")

    print(f"\\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()`
