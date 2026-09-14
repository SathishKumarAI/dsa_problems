// missing-number — every approach in one file, cross-checked
//
// Converted from docs/deep/missing-number_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against all three examples from the statement, both smallest legal
inputs (\`[0]\`, missing n, and \`[1]\`, missing 0), and a case where the gap is at the very bottom, plus a
randomised stress test that builds each array by deleting a known value from 0..n and shuffling — so
every approach is checked against the answer the generator knows, not merely against each other. Each
approach is handed **its own copy of the data**, because the placing rung rearranges the array it is
given and the next approach would otherwise read corrupted input.

There is no "no answer" case and no duplicates case: the statement promises exactly one missing value
and promises the values are distinct, so neither situation is a legal input.`

export const script = `"""The Number That Is Not There — every approach in one file, cross-checked.

Run: python missing_number.py
"""

from __future__ import annotations

import random
from typing import Callable


def missing_number_sort_and_scan(nums: list[int]) -> int:
    ordered = sorted(nums)
    for i, x in enumerate(ordered):
        if x != i:
            return i
    return len(ordered)  # every slot matched, so the gap is n itself


def missing_number_table_of_flags(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        seen[x] = True
    for i in range(n + 1):
        if not seen[i]:
            return i
    return -1  # unreachable: n + 1 candidates and only n values


def missing_number_place_at_own_index(nums: list[int]) -> int:
    """Destroys nums: every value < n is swapped into slot value."""
    n = len(nums)
    i = 0
    while i < n:
        v = nums[i]
        if v < n and nums[v] != v:  # v == n has no slot; already-home values are done
            nums[i], nums[v] = nums[v], nums[i]
        else:
            i += 1
    for i in range(n):
        if nums[i] != i:
            return i
    return n


def missing_number_subtract_from_total(nums: list[int]) -> int:
    n = len(nums)
    total = n * (n + 1) // 2
    for x in nums:
        total -= x
    return total


def missing_number_xor(nums: list[int]) -> int:
    acc = len(nums)  # index n is in the range 0..n but the loop never visits it
    for i, x in enumerate(nums):
        acc ^= i ^ x
    return acc


APPROACHES: list[tuple[str, Callable[[list[int]], int]]] = [
    ("sort and scan", missing_number_sort_and_scan),
    ("table of flags", missing_number_table_of_flags),
    ("place at own index", missing_number_place_at_own_index),
    ("subtract from total", missing_number_subtract_from_total),
    ("xor", missing_number_xor),
]


def run_case(label: str, nums: list[int]) -> bool:
    # Each approach gets its OWN copy: the placing rung rearranges what it is handed.
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<20} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example from the statement", [3, 0, 1])
    ok &= run_case("the gap is past the end", [0, 1])
    ok &= run_case("a longer array", [9, 6, 4, 2, 3, 5, 7, 0, 1])
    ok &= run_case("smallest legal input, missing n", [0])
    ok &= run_case("smallest legal input, missing 0", [1])
    ok &= run_case("the gap is 0", [2, 1])
    # There is no 'no answer' case here: exactly one of 0..n is always absent.
    # Duplicates are impossible too — the statement promises distinct values.

    random.seed(3)
    checked = 0
    for _ in range(500):
        n = random.randint(1, 40)
        pool = list(range(n + 1))
        gap = random.choice(pool)
        nums = [x for x in pool if x != gap]
        random.shuffle(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))
            if got != gap:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} {got} != {gap}")
        checked += 1
    print(f"stress: {checked} random shuffles of 0..n with one value removed, all five "
          f"approaches checked against the known gap")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[3, 0, 1]
    sort and scan        -> 2
    table of flags       -> 2
    place at own index   -> 2
    subtract from total  -> 2
    xor                  -> 2
    all agree: True
the gap is past the end
  nums=[0, 1]
    sort and scan        -> 2
    table of flags       -> 2
    place at own index   -> 2
    subtract from total  -> 2
    xor                  -> 2
    all agree: True
a longer array
  nums=[9, 6, 4, 2, 3, 5, 7, 0, 1]
    sort and scan        -> 8
    table of flags       -> 8
    place at own index   -> 8
    subtract from total  -> 8
    xor                  -> 8
    all agree: True
smallest legal input, missing n
  nums=[0]
    sort and scan        -> 1
    table of flags       -> 1
    place at own index   -> 1
    subtract from total  -> 1
    xor                  -> 1
    all agree: True
smallest legal input, missing 0
  nums=[1]
    sort and scan        -> 0
    table of flags       -> 0
    place at own index   -> 0
    subtract from total  -> 0
    xor                  -> 0
    all agree: True
the gap is 0
  nums=[2, 1]
    sort and scan        -> 0
    table of flags       -> 0
    place at own index   -> 0
    subtract from total  -> 0
    xor                  -> 0
    all agree: True
stress: 500 random shuffles of 0..n with one value removed, all five approaches checked against the known gap

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
