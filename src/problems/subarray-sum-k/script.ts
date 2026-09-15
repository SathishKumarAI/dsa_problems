// subarray-sum-k — every approach in one file, cross-checked
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against both statement examples, the smallest legal input in both
its hit and miss forms, an all-zeros array where overlapping answers multiply, an answer that starts
at index 0 (the case the \`{0: 1}\` seed exists for), an input with no answer at all, and two randomised
stress runs — one with negatives cross-checking the three correct approaches, one non-negative where
the sliding window is allowed to join in. The window is also run on a negative input where it is
*expected* to disagree, and the script fails loudly if it ever agrees there, because that
disagreement is the lesson.

\`run_case\` and \`APPROACHES\` are **scaffolding**, not answers: they exist only to print the approaches
side by side and report whether they agreed.`

export const script = `"""How Many Subarrays Sum to k? — every approach in one file, cross-checked.

Run: python subarray_sum_k.py
"""

from __future__ import annotations

import random


def subarray_sum_k_brute_force(nums: list[int], k: int) -> int:
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total


def subarray_sum_k_prefix_pairwise(nums: list[int], k: int) -> int:
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):  # j is an END boundary, so it reaches n
            if prefix[j] - prefix[i] == k:
                total += 1
    return total


def _at_most(nums: list[int], limit: int) -> int:
    """Subarrays with sum <= limit. Only valid when every value is non-negative."""
    left = 0
    running = 0
    total = 0
    for right, x in enumerate(nums):
        running += x
        while running > limit and left <= right:
            running -= nums[left]
            left += 1
        total += right - left + 1  # every window ending at right and starting >= left
    return total


def subarray_sum_k_sliding_window(nums: list[int], k: int) -> int:
    """WRONG on inputs containing negatives — see the section on this approach."""
    return _at_most(nums, k) - _at_most(nums, k - 1)


def subarray_sum_k_prefix_count_map(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}  # the empty prefix has sum 0 and has occurred once
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)  # look up BEFORE recording, so length >= 1
        seen[running] = seen.get(running, 0) + 1
    return total


APPROACHES: list[tuple[str, object]] = [
    ("brute force", subarray_sum_k_brute_force),
    ("prefix pairwise", subarray_sum_k_prefix_pairwise),
    ("prefix + count map", subarray_sum_k_prefix_count_map),
]


def run_case(label: str, nums: list[int], k: int) -> bool:
    results = [(name, fn(list(nums), k)) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums} k={k}")
    for name, r in results:
        print(f"    {name:<19} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # Both examples from the statement.
    ok &= run_case("statement example 1 (overlapping)", [1, 1, 1], 2)
    ok &= run_case("statement example 2 (negatives)", [1, -1, 0], 0)

    # Minimal case: one element that is the answer, and one that is not.
    ok &= run_case("minimal (n = 1, hit)", [3], 3)
    ok &= run_case("minimal (n = 1, miss)", [3], 5)

    # Duplicates and zeros: every one of the six non-empty stretches sums to 0.
    ok &= run_case("duplicates / zeros", [0, 0, 0], 0)

    # A stretch that starts at index 0 — this is the one {0: 1} exists for.
    ok &= run_case("answer starts at index 0", [2, 3, -3, 4], 5)

    # No subarray reaches k at all.
    ok &= run_case("no answer", [1, 2, 3], 100)

    # The sliding window: right on non-negative input, wrong the moment a negative appears.
    print()
    print("sliding window (needs all values non-negative)")
    for nums, k in [([1, 1, 1], 2), ([0, 0, 0], 0), ([1, 2, 3], 3)]:
        got = subarray_sum_k_sliding_window(list(nums), k)
        want = subarray_sum_k_brute_force(list(nums), k)
        print(f"    nums={nums} k={k} -> window {got}, truth {want}, "
              f"{'agrees' if got == want else 'DISAGREES'}")
        ok &= got == want
    broken_nums, broken_k = [1, -1, 0], 0
    got = subarray_sum_k_sliding_window(list(broken_nums), broken_k)
    want = subarray_sum_k_brute_force(list(broken_nums), broken_k)
    print(f"    nums={broken_nums} k={broken_k} -> window {got}, truth {want}, "
          f"{'wrong as predicted' if got != want else 'UNEXPECTEDLY AGREED'}")
    ok &= got != want  # the failure is the point; if it ever agreed, the lesson is wrong

    # Randomised stress, with negatives, against brute force.
    random.seed(7)
    for _ in range(500):
        nums = [random.randint(-6, 6) for _ in range(random.randint(1, 14))]
        k = random.randint(-8, 8)
        results = [fn(list(nums), k) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={nums} k={k} -> {results}")
    print()
    print("stress: 500 random arrays with negatives, all three correct approaches cross-checked")

    # Randomised stress on non-negative input, where the window is allowed to join in.
    for _ in range(500):
        nums = [random.randint(0, 6) for _ in range(random.randint(1, 14))]
        k = random.randint(0, 10)
        truth = subarray_sum_k_brute_force(list(nums), k)
        got = subarray_sum_k_sliding_window(list(nums), k)
        if got != truth:
            ok = False
            print(f"  WINDOW DISAGREEMENT nums={nums} k={k} -> {got} vs {truth}")
    print("stress: 500 random non-negative arrays, sliding window cross-checked too")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE (and the sliding window failed exactly "
          "where predicted)." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
statement example 1 (overlapping)
  nums=[1, 1, 1] k=2
    brute force         -> 2
    prefix pairwise     -> 2
    prefix + count map  -> 2
    all agree: True
statement example 2 (negatives)
  nums=[1, -1, 0] k=0
    brute force         -> 3
    prefix pairwise     -> 3
    prefix + count map  -> 3
    all agree: True
minimal (n = 1, hit)
  nums=[3] k=3
    brute force         -> 1
    prefix pairwise     -> 1
    prefix + count map  -> 1
    all agree: True
minimal (n = 1, miss)
  nums=[3] k=5
    brute force         -> 0
    prefix pairwise     -> 0
    prefix + count map  -> 0
    all agree: True
duplicates / zeros
  nums=[0, 0, 0] k=0
    brute force         -> 6
    prefix pairwise     -> 6
    prefix + count map  -> 6
    all agree: True
answer starts at index 0
  nums=[2, 3, -3, 4] k=5
    brute force         -> 1
    prefix pairwise     -> 1
    prefix + count map  -> 1
    all agree: True
no answer
  nums=[1, 2, 3] k=100
    brute force         -> 0
    prefix pairwise     -> 0
    prefix + count map  -> 0
    all agree: True

sliding window (needs all values non-negative)
    nums=[1, 1, 1] k=2 -> window 2, truth 2, agrees
    nums=[0, 0, 0] k=0 -> window 6, truth 6, agrees
    nums=[1, 2, 3] k=3 -> window 2, truth 2, agrees
    nums=[1, -1, 0] k=0 -> window 0, truth 3, wrong as predicted

stress: 500 random arrays with negatives, all three correct approaches cross-checked
stress: 500 random non-negative arrays, sliding window cross-checked too

ALL APPROACHES AGREED ON EVERY CASE (and the sliding window failed exactly where predicted).
\`\`\``
