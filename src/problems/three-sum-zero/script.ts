// three-sum-zero — every approach in one file, cross-checked
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `Every approach in one file, checked against the statement's example, the smallest legal input (both
a solvable one and one with no answer), heavy duplicates, duplicates that must yield two distinct
triples, an all-positive input that triggers the early break, and a randomised stress test against
brute force over a narrow value range so collisions and duplicates are common.

**The comparison canonicalises**: each triple is sorted internally and the list of triples is
sorted, because the three approaches legitimately produce them in different orders. Comparing raw
output would report disagreements that are not real.`

export const script = `"""Triplets Summing to Zero — every approach in one file, cross-checked.

The answer is a SET of triples, so comparison canonicalises: each triple is sorted,
and the collection of triples is sorted. Without that, two correct runs look different.

Run: python three_sum_zero.py
"""

from __future__ import annotations

import random


def three_sum_zero_brute_force(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))  # dedup by value
    return [list(t) for t in found]


def three_sum_zero_hash_per_anchor(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # sorting only to make the anchor-skip rule possible
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # same anchor value already produced all its triples
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1:]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:  # duplicates within one anchor still slip through
                    out.append(triple)
            seen.add(x)
    return out


def three_sum_zero_two_pointers(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break  # smallest element positive => three positives can never sum to zero
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1  # skip repeated left values, else the same triple re-emits
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1
    return out


APPROACHES: list[tuple[str, object]] = [
    ("brute force", three_sum_zero_brute_force),
    ("hash per anchor", three_sum_zero_hash_per_anchor),
    ("two pointers", three_sum_zero_two_pointers),
]


def canon(triples: list[list[int]]) -> list[tuple[int, ...]]:
    """Sort inside each triple and across the list — the only fair way to compare sets."""
    return sorted(tuple(sorted(t)) for t in triples)


def run_case(label: str, nums: list[int]) -> bool:
    results = [(name, canon(fn(list(nums)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(f"{label}")
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<16} -> {[list(t) for t in r]}")
    print(f"    all agree: {agree}")
    return agree




# ------------------------------------ the arithmetic, printed rather than told
# Everything "Reading the Calculations" quotes is produced here: the anchor
# trace with its skips, the duplicate argument, and the work count.
def show_anchors(nums: list[int]) -> None:
    """One line per anchor and per inner step, skips included."""
    s = sorted(nums)
    print(f"\\n=== anchors and the pair walk, nums={nums} ===")
    print(f"  sorted: {s}")
    n = len(s)
    found: list[tuple[int, int, int]] = []
    for i in range(n - 2):
        if i > 0 and s[i] == s[i - 1]:
            print(f"  i={i} anchor {s[i]:>3}  SKIPPED: repeat of the previous anchor")
            continue
        need = -s[i]
        lo, hi = i + 1, n - 1
        print(f"  i={i} anchor {s[i]:>3}  need {need:>3} from s[{lo}..{hi}] = {s[lo:hi + 1]}")
        while lo < hi:
            total = s[lo] + s[hi]
            if total == need:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  == {need}  -> ({s[i]}, {s[lo]}, {s[hi]})")
                found.append((s[i], s[lo], s[hi]))
                lo += 1
                hi -= 1
                while lo < hi and s[lo] == s[lo - 1]:
                    print(f"      skip the repeated partner {s[lo]}")
                    lo += 1
            elif total < need:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  <  {need}  -> lo += 1")
                lo += 1
            else:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  >  {need}  -> hi -= 1")
                hi -= 1
    print(f"  answer: {found}")


def show_duplicates(nums: list[int]) -> None:
    """Why sorting pays twice: equal values become neighbours."""
    from itertools import combinations

    raw = [c for c in combinations(nums, 3) if sum(c) == 0]
    distinct = sorted({tuple(sorted(c)) for c in raw})
    print("\\n=== the same triple, reachable by two routes ===")
    print(f"  combinations that sum to zero, unsorted input: {raw}")
    print(f"  distinct as sets:                              {distinct}")
    print("  the array holds a repeated value, so one triple is reachable twice.")
    print("  sorted, those routes are ADJACENT, so one comparison removes the repeat")
    print("  instead of a set of every triple already emitted.")


def count_work() -> None:
    """Inner steps taken, against triples that exist."""
    import random

    def steps(a: list[int]) -> int:
        b = sorted(a)
        n = len(b)
        seen = 0
        for i in range(n - 2):
            if i > 0 and b[i] == b[i - 1]:
                continue
            lo, hi = i + 1, n - 1
            while lo < hi:
                seen += 1
                total = b[lo] + b[hi]
                if total == -b[i]:
                    lo += 1
                    hi -= 1
                    while lo < hi and b[lo] == b[lo - 1]:
                        lo += 1
                elif total < -b[i]:
                    lo += 1
                else:
                    hi -= 1
        return seen

    rng = random.Random(4)
    print("\\n=== inner steps, against the triples that exist ===")
    print(f"  {'n':>6} {'triples that exist':>20} {'inner steps':>13}")
    for size in (6, 50, 200, 800):
        a = rng.sample(range(-size * 2, size * 2), size)
        print(f"  {size:>6} {size * (size - 1) * (size - 2) // 6:>20,} {steps(a):>13,}")


def measure_sort_share() -> None:
    """The step that looks expensive is the cheap one."""
    import random
    import time

    def timed(fn, repeat=3):
        best = float("inf")
        for _ in range(repeat):
            start = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - start)
        return best

    rng = random.Random(11)
    print("\\n=== where the time actually goes ===")
    print(f"  {'n':>6} {'sorting':>12} {'the O(n^2) search':>20}")
    for size in (400, 1200):
        a = rng.sample(range(-size * 2, size * 2), size)
        sort_time = timed(lambda: sorted(a))

        def search() -> None:
            b = sorted(a)
            n = len(b)
            for i in range(n - 2):
                lo, hi = i + 1, n - 1
                while lo < hi:
                    total = b[lo] + b[hi]
                    if total == -b[i]:
                        lo += 1
                        hi -= 1
                    elif total < -b[i]:
                        lo += 1
                    else:
                        hi -= 1

        print(f"  {size:>6} {sort_time * 1e6:>9.0f} us {timed(search) * 1e6:>17.0f} us")
    print("  the sort is the rounding error; the search is the problem")

def main() -> None:
    ok = True

    # The statement's own example.
    ok &= run_case("example from the statement", [-1, 0, 1, 2, -1, -4])

    # Smallest legal input: exactly three elements, and they work.
    ok &= run_case("smallest legal input (n = 3)", [-1, 0, 1])

    # Smallest legal input that has no answer.
    ok &= run_case("no valid answer", [1, 2, 3])

    # Heavy duplicates: one triple, however many copies of zero there are.
    ok &= run_case("all duplicates", [0, 0, 0, 0, 0])

    # Duplicates that must produce two distinct triples, not four copies of one.
    ok &= run_case("duplicates, two triples", [-2, 0, 0, 2, 2, -2, 1, 1])

    # Every value positive — the nums[k] > 0 early break fires immediately.
    ok &= run_case("all positive", [3, 5, 7, 11])

    # Randomised stress against brute force, small range so collisions are common.
    random.seed(7)
    for _ in range(600):
        nums = [random.randint(-6, 6) for _ in range(random.randint(3, 14))]
        results = [canon(fn(list(nums))) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={nums} -> {results}")
    print("stress: 600 random arrays cross-checked, all three approaches, canonicalised triples")

    print()
    show_anchors([-1, 0, 1, 2, -1, -4])
    show_duplicates([-1, 0, 1, 2, -1, -4])
    count_work()
    measure_sort_share()

    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
example from the statement
  nums=[-1, 0, 1, 2, -1, -4]
    brute force      -> [[-1, -1, 2], [-1, 0, 1]]
    hash per anchor  -> [[-1, -1, 2], [-1, 0, 1]]
    two pointers     -> [[-1, -1, 2], [-1, 0, 1]]
    all agree: True
smallest legal input (n = 3)
  nums=[-1, 0, 1]
    brute force      -> [[-1, 0, 1]]
    hash per anchor  -> [[-1, 0, 1]]
    two pointers     -> [[-1, 0, 1]]
    all agree: True
no valid answer
  nums=[1, 2, 3]
    brute force      -> []
    hash per anchor  -> []
    two pointers     -> []
    all agree: True
all duplicates
  nums=[0, 0, 0, 0, 0]
    brute force      -> [[0, 0, 0]]
    hash per anchor  -> [[0, 0, 0]]
    two pointers     -> [[0, 0, 0]]
    all agree: True
duplicates, two triples
  nums=[-2, 0, 0, 2, 2, -2, 1, 1]
    brute force      -> [[-2, 0, 2], [-2, 1, 1]]
    hash per anchor  -> [[-2, 0, 2], [-2, 1, 1]]
    two pointers     -> [[-2, 0, 2], [-2, 1, 1]]
    all agree: True
all positive
  nums=[3, 5, 7, 11]
    brute force      -> []
    hash per anchor  -> []
    two pointers     -> []
    all agree: True
stress: 600 random arrays cross-checked, all three approaches, canonicalised triples

ALL APPROACHES AGREED ON EVERY CASE.
\`\`\``
