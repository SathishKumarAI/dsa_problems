// sorted-pair-sum — every approach in one file, cross-checked
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against the statement's example, the smallest legal input,
duplicates, a case with no valid answer, negative values, and a randomised stress test where each
generated target is chosen to have exactly one solution — so all three approaches must return
*identical indices*, not merely valid ones.`

export const script = `"""Pair Sum in Sorted Array — every approach in one file, cross-checked.

Run: python sorted_pair_sum.py
"""

from __future__ import annotations

import random


def sorted_pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []


def sorted_pair_sum_hash_map(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # partner was stored on an earlier index
            return [seen[target - x], i]
        seen[x] = i
    return []


def sorted_pair_sum_two_pointers(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1  # every pair (i, k<j) is smaller still, so i can never be the answer
        else:
            j -= 1
    return []


APPROACHES: list[tuple[str, object]] = [
    ("brute force", sorted_pair_sum_brute_force),
    ("hash map", sorted_pair_sum_hash_map),
    ("two pointers", sorted_pair_sum_two_pointers),
]


def _unique_target(nums: list[int]) -> int | None:
    """A target hit by exactly one pair, so all approaches must return the same indices."""
    counts: dict[int, int] = {}
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            s = nums[i] + nums[j]
            counts[s] = counts.get(s, 0) + 1
    unique = [s for s, c in counts.items() if c == 1]
    return random.choice(unique) if unique else None


def run_case(label: str, nums: list[int], target: int) -> bool:
    results = [(name, fn(list(nums), target)) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(f"{label}")
    print(f"  nums={nums} target={target}")
    for name, r in results:
        print(f"    {name:<14} -> {r}")
    print(f"    all agree: {agree}")
    return agree




# ------------------------------------ the arithmetic, printed rather than told
# Every number "Reading the Calculations" and the under-the-hood callout quote
# is produced here. None of this is an approach.
def show_decisions(nums: list[int], target: int) -> None:
    """One row per comparison: the two ends, their sum, and which end is retired."""
    print(f"\\n=== the decision at every step, nums={nums}, target={target} ===")
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        total = nums[lo] + nums[hi]
        if total == target:
            verdict = "EQUAL -> answer"
        elif total < target:
            verdict = "too small -> lo += 1"
        else:
            verdict = "too big   -> hi -= 1"
        print(
            f"  lo={lo} hi={hi}  {nums[lo]:>3} + {nums[hi]:>3} = {total:>4}  vs {target}  {verdict}"
        )
        if total == target:
            return
        if total < target:
            lo += 1
        else:
            hi -= 1
    print("  the pointers met: no pair sums to the target")


def show_elimination(nums: list[int], target: int) -> None:
    """What moving a pointer actually throws away — every pair, listed."""
    lo, hi = 0, len(nums) - 1
    total = nums[lo] + nums[hi]
    print(f"\\n=== why discarding is safe, not a guess ===")
    print(f"  at lo={lo} hi={hi} the sum is {total} < {target}, so nums[{lo}] = {nums[lo]} is discarded.")
    print("  What goes with it, every pair that uses it:")
    for j in range(1, len(nums)):
        pair = nums[0] + nums[j]
        mark = "cannot be the answer" if pair != target else "<- WOULD HAVE BEEN"
        print(f"    {nums[0]:>3} + {nums[j]:>3} = {pair:>4}  {'<' if pair < target else '>='} {target}   {mark}")
    print(f"  nums[{hi}] = {nums[hi]} was the LARGEST partner available. If it is not enough,")
    print(f"  nothing smaller is. One comparison, {len(nums) - 1} pairs gone.")


def count_work() -> None:
    """Comparisons made, against pairs that exist."""
    def two_pointer(a: list[int], t: int) -> int:
        lo, hi, seen = 0, len(a) - 1, 0
        while lo < hi:
            seen += 1
            total = a[lo] + a[hi]
            if total == t:
                return seen
            if total < t:
                lo += 1
            else:
                hi -= 1
        return seen

    def brute(a: list[int], t: int) -> int:
        seen = 0
        for i in range(len(a)):
            for j in range(i + 1, len(a)):
                seen += 1
                if a[i] + a[j] == t:
                    return seen
        return seen

    print("\\n=== comparisons made, with the answer at the far end ===")
    print(f"  {'n':>7} {'pairs that exist':>18} {'brute force':>14} {'two pointers':>14}")
    for size in (4, 100, 1000, 10000):
        a = list(range(1, size + 1))
        t = a[-2] + a[-1]
        print(
            f"  {size:>7} {size * (size - 1) // 2:>18,} {brute(a, t):>14,} {two_pointer(a, t):>14,}"
        )


def measure_allocation() -> None:
    """Both rungs are O(n). Only one of them allocates."""
    import time

    def timed(fn, repeat=5):
        best = float("inf")
        for _ in range(repeat):
            start = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - start)
        return best

    print("\\n=== the same O(n), with and without an allocator in the loop ===")
    print(f"  {'n':>8} {'build a dict':>16} {'two-pointer scan':>18}")
    for size in (10_000, 100_000):
        a = list(range(1, size + 1))
        build = timed(lambda: {v: i for i, v in enumerate(a)}, repeat=3)

        def scan() -> None:
            lo, hi = 0, len(a) - 1
            target = -1  # never found: forces the full walk
            while lo < hi:
                total = a[lo] + a[hi]
                if total == target:
                    return
                if total < target:
                    lo += 1
                else:
                    hi -= 1

        walk = timed(scan, repeat=3)
        print(
            f"  {size:>8} {build / size * 1e9:>13.1f} ns {walk / size * 1e9:>15.1f} ns"
            f"   (per element)"
        )

def main() -> None:
    ok = True

    # The statement's own example.
    ok &= run_case("example from the statement", [1, 3, 6, 9], 12)

    # Smallest legal input: two elements.
    ok &= run_case("smallest legal input (n = 2)", [4, 8], 12)

    # Duplicates: the only pair uses both copies of 2.
    ok &= run_case("duplicates", [2, 2, 3], 4)

    # No pair reaches the target — every approach returns the empty list.
    ok &= run_case("no valid answer", [1, 2, 3], 100)

    # Negative values, which the constraints allow.
    ok &= run_case("negatives", [-1000, -3, 0, 7, 1000], -1003)

    # Randomised stress: sorted arrays, targets chosen so exactly one pair works.
    random.seed(12)
    checked = 0
    for _ in range(400):
        nums = sorted(random.randint(-40, 40) for _ in range(random.randint(2, 30)))
        target = _unique_target(nums)
        if target is None:
            continue
        checked += 1
        results = [fn(list(nums), target) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={nums} target={target} -> {results}")
    print(f"stress: {checked} random sorted arrays with a unique answer, "
          f"all three approaches cross-checked")

    print()
    show_decisions([1, 3, 6, 9], 12)
    show_elimination([1, 3, 6, 9], 12)
    count_work()
    measure_allocation()

    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[1, 3, 6, 9] target=12
    brute force    -> [1, 3]
    hash map       -> [1, 3]
    two pointers   -> [1, 3]
    all agree: True
smallest legal input (n = 2)
  nums=[4, 8] target=12
    brute force    -> [0, 1]
    hash map       -> [0, 1]
    two pointers   -> [0, 1]
    all agree: True
duplicates
  nums=[2, 2, 3] target=4
    brute force    -> [0, 1]
    hash map       -> [0, 1]
    two pointers   -> [0, 1]
    all agree: True
no valid answer
  nums=[1, 2, 3] target=100
    brute force    -> []
    hash map       -> []
    two pointers   -> []
    all agree: True
negatives
  nums=[-1000, -3, 0, 7, 1000] target=-1003
    brute force    -> [0, 1]
    hash map       -> [0, 1]
    two pointers   -> [0, 1]
    all agree: True
stress: 400 random sorted arrays with a unique answer, all three approaches cross-checked

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
