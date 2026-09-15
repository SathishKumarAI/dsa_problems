// three-sum-closest — every approach in one file, cross-checked
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All five approaches in one file. Two decisions are lifted to module scope because every rung shares
them: \`seed_sum\` (the first legal triple, safe because \`3 <= n\`) and \`better\` (the tie-break). Lifting
\`better\` is not tidiness — five approaches visit triples in five different orders, and they can only be
cross-checked if they break ties identically.

Tests cover all three of the statement's examples including the tie and the target below every
reachable sum, the smallest legal input (\`n = 3\`, one triple), all-duplicate values, duplicates where a
choice exists, an input where an exact hit exists so the early-exit rung actually fires, a target above
every reachable sum, an all-negative array, and 3000 random arrays checked against an
\`itertools.combinations\` reference.

There is **no no-valid-answer case**: \`3 <= n\` guarantees a triple always exists. The cubic rung is run
at reduced \`n\` in the stress test (\`n <= 12\`); its \`n = 500\` cost is stated analytically above.`

export const script = `"""The Triple Nearest the Target - every approach in one file, cross-checked.

Tie-break: closest wins; equal distances go to the SMALLER sum. Every approach
uses the same rule, so five implementations that visit triples in five different
orders still have to produce the same number.

Run: python three_sum_closest.py
"""

from __future__ import annotations

import itertools
import random


def seed_sum(nums: list[int]) -> int:
    """The first legal triple. 3 <= n is promised, so this always exists."""
    return nums[0] + nums[1] + nums[2]


def better(candidate: int, best: int, target: int) -> int:
    """The one rule every rung shares: closest to \`target\` wins, ties go to the SMALLER sum.

    Lifted out because five approaches visit triples in five different orders,
    and they can only agree if they break ties identically.
    """
    d, bd = abs(candidate - target), abs(best - target)
    return candidate if (d < bd or (d == bd and candidate < best)) else best


def three_sum_closest_every_triple(nums: list[int], target: int) -> int:
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
    return best


def three_sum_closest_sort_then_prune(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
                if s >= target:       # sorted, so every later k only overshoots further
                    break
    return best


def three_sum_closest_binary_search(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            want = target - nums[i] - nums[j]
            lo, hi = j + 1, n
            while lo < hi:                     # first index in the tail with nums[idx] >= want
                mid = (lo + hi) // 2
                if nums[mid] < want:
                    lo = mid + 1
                else:
                    hi = mid
            for k in (lo - 1, lo):             # the two entries straddling the ideal third value
                if j < k < n:
                    s = nums[i] + nums[j] + nums[k]
                    best = better(s, best, target)
    return best


def three_sum_closest_two_pointers(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s < target:        # the sign of the miss says which end to move
                lo += 1
            else:
                hi -= 1
    return best


def three_sum_closest_early_exit(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s == target:       # distance 0 cannot be improved on
                return target
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best


def reference(nums: list[int], target: int) -> int:
    """Slow and obvious: every combination, same tie-break."""
    sums = [a + b + c for a, b, c in itertools.combinations(nums, 3)]
    return min(sums, key=lambda s: (abs(s - target), s))   # the same rule, expressed as a sort key


APPROACHES = [
    ("every triple", three_sum_closest_every_triple),
    ("sort + prune", three_sum_closest_sort_then_prune),
    ("binary search", three_sum_closest_binary_search),
    ("two pointers", three_sum_closest_two_pointers),
    ("early exit", three_sum_closest_early_exit),
]


def run_case(label: str, nums: list[int], target: int) -> bool:
    want = reference(list(nums), target)
    results = [(name, fn(list(nums), target)) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  nums={nums}, target={target}   (reference answer {want})")
    for name, got in results:
        print(f"    {name:<14} -> {got}")
    print(f"    all agree with the reference: {agree}")
    return agree


def main() -> None:
    ok = True

    # The document's worked example, and the statement's first.
    ok &= run_case("worked example / statement 1", [-1, 2, 1, -4], 1)
    # The tie: -1 and 1 are both one away from 0, so the smaller sum wins.
    ok &= run_case("statement 2 - an exact tie", [-2, 0, 1, 3], 0)
    # Target far below every reachable sum: no pointer ever brackets anything.
    ok &= run_case("statement 3 - target below every sum", [1, 1, 1, 0], -100)

    # Smallest legal input: exactly three values, exactly one triple.
    ok &= run_case("smallest legal input (n = 3)", [4, -7, 2], 0)
    # Duplicates everywhere — legal, and the only triple is the answer.
    ok &= run_case("all duplicates", [0, 0, 0], 5)
    ok &= run_case("duplicates with a choice", [1, 1, 1, 1, 5], 7)

    # There is no "no answer" case: 3 <= n guarantees a triple always exists.
    # The nearest thing is an exact hit, which the early-exit rung returns from at once.
    ok &= run_case("an exact hit exists", [-1, 2, 1, -4], 2)
    # Target above every reachable sum: the mirror of statement 3.
    ok &= run_case("target above every sum", [-5, -4, -3, -2], 1000)
    # Negative values only.
    ok &= run_case("all negative", [-8, -6, -4, -2], -13)

    random.seed(11)
    bad = 0
    for _ in range(3000):
        n = random.randint(3, 12)          # small n: "every triple" is cubic, run it reduced
        nums = [random.randint(-12, 12) for _ in range(n)]
        target = random.randint(-20, 20)
        want = reference(list(nums), target)
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} target={target}: got {got}, want {want}")
    print(f"stress: 3000 random arrays (n <= 12, values -12..12), all five approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
worked example / statement 1
  nums=[-1, 2, 1, -4], target=1   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
statement 2 - an exact tie
  nums=[-2, 0, 1, 3], target=0   (reference answer -1)
    every triple   -> -1
    sort + prune   -> -1
    binary search  -> -1
    two pointers   -> -1
    early exit     -> -1
    all agree with the reference: True
statement 3 - target below every sum
  nums=[1, 1, 1, 0], target=-100   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
smallest legal input (n = 3)
  nums=[4, -7, 2], target=0   (reference answer -1)
    every triple   -> -1
    sort + prune   -> -1
    binary search  -> -1
    two pointers   -> -1
    early exit     -> -1
    all agree with the reference: True
all duplicates
  nums=[0, 0, 0], target=5   (reference answer 0)
    every triple   -> 0
    sort + prune   -> 0
    binary search  -> 0
    two pointers   -> 0
    early exit     -> 0
    all agree with the reference: True
duplicates with a choice
  nums=[1, 1, 1, 1, 5], target=7   (reference answer 7)
    every triple   -> 7
    sort + prune   -> 7
    binary search  -> 7
    two pointers   -> 7
    early exit     -> 7
    all agree with the reference: True
an exact hit exists
  nums=[-1, 2, 1, -4], target=2   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
target above every sum
  nums=[-5, -4, -3, -2], target=1000   (reference answer -9)
    every triple   -> -9
    sort + prune   -> -9
    binary search  -> -9
    two pointers   -> -9
    early exit     -> -9
    all agree with the reference: True
all negative
  nums=[-8, -6, -4, -2], target=-13   (reference answer -14)
    every triple   -> -14
    sort + prune   -> -14
    binary search  -> -14
    two pointers   -> -14
    early exit     -> -14
    all agree with the reference: True
stress: 3000 random arrays (n <= 12, values -12..12), all five approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
