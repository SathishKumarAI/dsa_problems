// intersection-of-arrays — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach in one file, checked against both examples from the statement, the smallest legal
inputs in both flavours (one element each with no overlap, and one element each that match), the
lopsided-counts case that kills every set-based solution, an extremely lopsided pair that exercises
the smaller-side choice, and a randomised stress test with heavy duplication cross-checked against
brute force. Each approach is handed **its own copy of the data**, because the sorting rung rearranges
what it is given in several languages and any cross-check downstream would then be comparing corrupted
arrays. Every answer is **sorted before comparison**, because the judge accepts any order.`

export const script = `"""What Both Arrays Hold — every approach in one file, cross-checked.

Run: python intersection_of_arrays.py
"""

from __future__ import annotations

import random
from typing import Callable


def intersection_of_arrays_cross_off_with_flags(nums1: list[int], nums2: list[int]) -> list[int]:
    used = [False] * len(nums2)  # without this, one right-hand copy answers for many left ones
    out: list[int] = []
    for x in nums1:
        for j in range(len(nums2)):
            if not used[j] and nums2[j] == x:
                used[j] = True
                out.append(x)
                break
    out.sort()
    return out


def intersection_of_arrays_sort_two_cursors(nums1: list[int], nums2: list[int]) -> list[int]:
    a = sorted(nums1)
    b = sorted(nums2)
    i = j = 0
    out: list[int] = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            out.append(a[i])
            i += 1
            j += 1
    return out  # already ascending, because both inputs were


def intersection_of_arrays_count_both_take_min(nums1: list[int], nums2: list[int]) -> list[int]:
    c1: dict[int, int] = {}
    c2: dict[int, int] = {}
    for x in nums1:
        c1[x] = c1.get(x, 0) + 1
    for x in nums2:
        c2[x] = c2.get(x, 0) + 1
    out: list[int] = []
    for x, n in c1.items():
        take = min(n, c2.get(x, 0))
        out.extend([x] * take)
    out.sort()
    return out


def intersection_of_arrays_one_count_table(nums1: list[int], nums2: list[int]) -> list[int]:
    stock: dict[int, int] = {}
    for x in nums2:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in nums1:
        if stock.get(x, 0) > 0:
            stock[x] -= 1  # running out IS the min(), computed lazily
            out.append(x)
    out.sort()
    return out


def intersection_of_arrays_count_the_smaller_side(nums1: list[int], nums2: list[int]) -> list[int]:
    small, large = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    stock: dict[int, int] = {}
    for x in small:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in large:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out


APPROACHES: list[tuple[str, Callable[[list[int], list[int]], list[int]]]] = [
    ("cross off with flags", intersection_of_arrays_cross_off_with_flags),
    ("sort, two cursors", intersection_of_arrays_sort_two_cursors),
    ("count both, take min", intersection_of_arrays_count_both_take_min),
    ("one count table", intersection_of_arrays_one_count_table),
    ("count the smaller side", intersection_of_arrays_count_the_smaller_side),
]


def run_case(label: str, nums1: list[int], nums2: list[int]) -> bool:
    # Each approach gets its OWN copies: the cursor rung sorts what it is handed in some
    # languages, and sorting either input would corrupt a later cross-check.
    results = [(name, sorted(fn(list(nums1), list(nums2)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums1={nums1} nums2={nums2}")
    for name, r in results:
        print(f"    {name:<22} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example from the statement", [1, 2, 2, 1], [2, 2])
    ok &= run_case("multiplicity is the minimum", [4, 9, 5], [9, 4, 9, 8, 4])
    ok &= run_case("smallest legal input, no overlap", [1], [2])
    ok &= run_case("smallest legal input, full overlap", [1], [1])
    ok &= run_case("more copies on the left than the right", [1, 1, 1], [1, 1])
    ok &= run_case("lopsided sizes", [7], [7, 7, 7, 7, 7, 7, 7, 7])

    random.seed(5)
    checked = 0
    for _ in range(500):
        nums1 = [random.randint(0, 12) for _ in range(random.randint(1, 20))]
        nums2 = [random.randint(0, 12) for _ in range(random.randint(1, 20))]
        expected = sorted(intersection_of_arrays_cross_off_with_flags(list(nums1), list(nums2)))
        for name, fn in APPROACHES:
            got = sorted(fn(list(nums1), list(nums2)))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} {nums1} {nums2} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random array pairs with heavy duplication, all five "
          f"approaches cross-checked against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums1=[1, 2, 2, 1] nums2=[2, 2]
    cross off with flags   -> [2, 2]
    sort, two cursors      -> [2, 2]
    count both, take min   -> [2, 2]
    one count table        -> [2, 2]
    count the smaller side -> [2, 2]
    all agree: True
multiplicity is the minimum
  nums1=[4, 9, 5] nums2=[9, 4, 9, 8, 4]
    cross off with flags   -> [4, 9]
    sort, two cursors      -> [4, 9]
    count both, take min   -> [4, 9]
    one count table        -> [4, 9]
    count the smaller side -> [4, 9]
    all agree: True
smallest legal input, no overlap
  nums1=[1] nums2=[2]
    cross off with flags   -> []
    sort, two cursors      -> []
    count both, take min   -> []
    one count table        -> []
    count the smaller side -> []
    all agree: True
smallest legal input, full overlap
  nums1=[1] nums2=[1]
    cross off with flags   -> [1]
    sort, two cursors      -> [1]
    count both, take min   -> [1]
    one count table        -> [1]
    count the smaller side -> [1]
    all agree: True
more copies on the left than the right
  nums1=[1, 1, 1] nums2=[1, 1]
    cross off with flags   -> [1, 1]
    sort, two cursors      -> [1, 1]
    count both, take min   -> [1, 1]
    one count table        -> [1, 1]
    count the smaller side -> [1, 1]
    all agree: True
lopsided sizes
  nums1=[7] nums2=[7, 7, 7, 7, 7, 7, 7, 7]
    cross off with flags   -> [7]
    sort, two cursors      -> [7]
    count both, take min   -> [7]
    one count table        -> [7]
    count the smaller side -> [7]
    all agree: True
stress: 500 random array pairs with heavy duplication, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
