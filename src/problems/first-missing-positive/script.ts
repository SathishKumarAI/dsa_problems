// first-missing-positive — every approach in one file, cross-checked.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

export const scriptNote = `Every approach in one file, checked against all three examples from the statement, both smallest legal
inputs (the one whose answer is past the end and the one whose answer is 1), a duplicate case, an
all-noise case, and a randomised stress test seeded with negatives, zeroes, duplicates and
out-of-range values. Each approach is handed **its own copy of the data**, because two of the five
rearrange the array they are given and the next approach would otherwise read corrupted input.

There is no "no answer" case, and that is not an oversight: the bound argument guarantees an answer in
1..n+1 always exists, so every legal input has one.`

export const script = `"""The Smallest Positive That Is Missing — every approach in one file, cross-checked.

Run: python first_missing_positive.py
"""

from __future__ import annotations

import random
from typing import Callable


def first_missing_positive_try_each_candidate(nums: list[int]) -> int:
    for c in range(1, len(nums) + 2):  # n + 1 candidates is always enough
        found = False
        for x in nums:
            if x == c:
                found = True
                break
        if not found:
            return c
    return len(nums) + 1


def first_missing_positive_sort_then_walk(nums: list[int]) -> int:
    """Destroys nums: sorts it in place."""
    nums.sort()
    want = 1
    for x in nums:
        if x == want:
            want += 1
        elif x > want:  # the run of wanted values has been overshot, so want is missing
            break
    return want


def first_missing_positive_hash_set(nums: list[int]) -> int:
    seen = set(nums)
    want = 1
    while want in seen:
        want += 1
    return want


def first_missing_positive_boolean_table(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        if 1 <= x <= n:  # anything outside 1..n can neither be nor block the answer
            seen[x] = True
    for c in range(1, n + 1):
        if not seen[c]:
            return c
    return n + 1


def first_missing_positive_cyclic_placement(nums: list[int]) -> int:
    """Destroys nums: every placeable value is swapped into slot value - 1."""
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is already settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1


APPROACHES: list[tuple[str, Callable[[list[int]], int]]] = [
    ("try each candidate", first_missing_positive_try_each_candidate),
    ("sort, then walk", first_missing_positive_sort_then_walk),
    ("hash set", first_missing_positive_hash_set),
    ("boolean table", first_missing_positive_boolean_table),
    ("cyclic placement", first_missing_positive_cyclic_placement),
]


def run_case(label: str, nums: list[int]) -> bool:
    # Each approach gets its OWN copy: two of the five rearrange what they are handed.
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
    ok &= run_case("example from the statement", [1, 2, 0])
    ok &= run_case("the hole is in the middle", [3, 4, -1, 1])
    ok &= run_case("nothing in 1..n is present", [7, 8, 9, 11, 12])
    ok &= run_case("smallest legal input, answer past the end", [1])
    ok &= run_case("smallest legal input, answer is 1", [2])
    ok &= run_case("duplicates", [1, 1])
    ok &= run_case("all noise", [-5, 0, -1, 2 ** 31 - 1])
    # There is no 'no answer' case here: an answer in 1..n+1 always exists.

    random.seed(11)
    checked = 0
    for _ in range(500):
        n = random.randint(1, 30)
        # mix of noise (negatives, zero, oversized) and in-range values, with duplicates
        nums = [random.choice([random.randint(-20, 0), random.randint(1, n + 5)])
                for _ in range(n)]
        expected = first_missing_positive_try_each_candidate(list(nums))
        for name, fn in APPROACHES:
            got = fn(list(nums))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random arrays of noise and in-range values, all five "
          f"approaches cross-checked against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[1, 2, 0]
    try each candidate   -> 3
    sort, then walk      -> 3
    hash set             -> 3
    boolean table        -> 3
    cyclic placement     -> 3
    all agree: True
the hole is in the middle
  nums=[3, 4, -1, 1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
nothing in 1..n is present
  nums=[7, 8, 9, 11, 12]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
smallest legal input, answer past the end
  nums=[1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
smallest legal input, answer is 1
  nums=[2]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
duplicates
  nums=[1, 1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
all noise
  nums=[-5, 0, -1, 2147483647]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
stress: 500 random arrays of noise and in-range values, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
