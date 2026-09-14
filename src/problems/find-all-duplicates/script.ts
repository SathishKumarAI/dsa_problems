// find-all-duplicates — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach in one file, checked against the statement's example, the smallest legal input
(\`[1]\`), an array that is nothing but a duplicate, an array with no duplicates at all, an array where
every value is doubled, and a randomised stress test. Each approach is handed **its own copy of the
data**, because the sign-flip rung wrecks the array it is given and the next approach would otherwise
read corrupted input. Every answer is **sorted before comparison**, because the order of the answer
is not part of the answer.`

export const script = `"""Every Value That Appears Twice — every approach in one file, cross-checked.

Run: python find_all_duplicates.py
"""

from __future__ import annotations

import random
from typing import Callable


def find_all_duplicates_compare_every_pair(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                out.append(nums[i])
    return out


def find_all_duplicates_sort_then_neighbours(nums: list[int]) -> list[int]:
    ordered = sorted(nums)
    out: list[int] = []
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            out.append(ordered[i])
    return out


def find_all_duplicates_count_in_hash_map(nums: list[int]) -> list[int]:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    out: list[int] = []
    for v in range(1, len(nums) + 1):
        if counts.get(v, 0) == 2:
            out.append(v)
    return out


def find_all_duplicates_flag_per_value(nums: list[int]) -> list[int]:
    seen = [False] * (len(nums) + 1)  # index by the value itself, so slot 0 goes unused
    out: list[int] = []
    for x in nums:
        if seen[x]:
            out.append(x)
        else:
            seen[x] = True
    return out


def find_all_duplicates_sign_flip(nums: list[int]) -> list[int]:
    """Destroys nums: every visited slot is negated."""
    out: list[int] = []
    for x in nums:
        at = abs(x) - 1  # the magnitude survives the marking, so read it back with abs
        if nums[at] < 0:
            out.append(abs(x))
        else:
            nums[at] = -nums[at]
    return out


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("compare every pair", find_all_duplicates_compare_every_pair),
    ("sort, read neighbours", find_all_duplicates_sort_then_neighbours),
    ("count in hash map", find_all_duplicates_count_in_hash_map),
    ("a flag per value", find_all_duplicates_flag_per_value),
    ("sign flip in place", find_all_duplicates_sign_flip),
]


def run_case(label: str, nums: list[int]) -> bool:
    # Each approach gets its OWN copy: the sign-flip rung wrecks the array it is handed.
    results = [(name, sorted(fn(list(nums)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<22} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def _random_valid(n: int) -> list[int]:
    """Length n, values in 1..n, each value present once or twice."""
    k = random.randint(0, n // 2)              # how many values appear twice
    present = random.sample(range(1, n + 1), n - k)
    doubled = random.sample(present, k)
    bag = present + doubled
    random.shuffle(bag)
    return bag


def main() -> None:
    ok = True
    ok &= run_case("example from the statement", [4, 3, 2, 7, 8, 2, 3, 1])
    ok &= run_case("smallest legal input (n = 1)", [1])
    ok &= run_case("nothing but a duplicate", [2, 2])
    ok &= run_case("no duplicates at all", [1, 2, 3])
    ok &= run_case("every value doubled", [3, 1, 3, 1])

    random.seed(7)
    checked = 0
    for _ in range(500):
        nums = _random_valid(random.randint(1, 40))
        expected = sorted(find_all_duplicates_compare_every_pair(list(nums)))
        for name, fn in APPROACHES:
            got = sorted(fn(list(nums)))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random legal arrays, all five approaches cross-checked "
          f"against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[4, 3, 2, 7, 8, 2, 3, 1]
    compare every pair     -> [2, 3]
    sort, read neighbours  -> [2, 3]
    count in hash map      -> [2, 3]
    a flag per value       -> [2, 3]
    sign flip in place     -> [2, 3]
    all agree: True
smallest legal input (n = 1)
  nums=[1]
    compare every pair     -> []
    sort, read neighbours  -> []
    count in hash map      -> []
    a flag per value       -> []
    sign flip in place     -> []
    all agree: True
nothing but a duplicate
  nums=[2, 2]
    compare every pair     -> [2]
    sort, read neighbours  -> [2]
    count in hash map      -> [2]
    a flag per value       -> [2]
    sign flip in place     -> [2]
    all agree: True
no duplicates at all
  nums=[1, 2, 3]
    compare every pair     -> []
    sort, read neighbours  -> []
    count in hash map      -> []
    a flag per value       -> []
    sign flip in place     -> []
    all agree: True
every value doubled
  nums=[3, 1, 3, 1]
    compare every pair     -> [1, 3]
    sort, read neighbours  -> [1, 3]
    count in hash map      -> [1, 3]
    a flag per value       -> [1, 3]
    sign flip in place     -> [1, 3]
    all agree: True
stress: 500 random legal arrays, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
