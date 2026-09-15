// range-sum-immutable — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "At construction, build an array where entry i holds the sum of everything strictly before index i, with entry 0 being zero — the sum of nothing. Then the sum from left to right inclusive is prefix[right + 1] - prefix[left]: one subtraction, whatever the range's length. The +1 comes from the ends being inclusive, and seeding entry 0 with zero is what lets a range starting at index 0 use the same formula as every other, with no special case."

export const whyNow = "Caching answers to the ranges actually asked helps only when queries repeat, and the number of possible ranges is quadratic in the array's length, so the cache can grow far past the array it summarises. One prefix array is n+1 numbers and answers every possible range, asked or not."

export const arc = "This is the smallest complete example of the trade the whole pattern makes: spend O(n) memory and one pass at build time to make every later query constant. It is worth stating the condition under which that trade is right — many queries and no updates — because the moment updates enter, the prefix array is wrong after the first one and the structure you actually want is a Fenwick or segment tree. The other thing to take away is the convention. Defining prefix[i] as everything strictly BEFORE i gives the empty prefix a home at index 0, and that single decision removes every off-by-one the alternative definition creates. Choose it once and the formula for a range never has to be re-derived."

export const complexity = { time: "O(n) to build, O(1) per query", space: "O(n)" }

export const python = `class NumArray:
    def __init__(self, nums: list[int]) -> None:
        # prefix[i] is the sum of everything BEFORE i, so prefix[0] is the
        # sum of nothing and must be 0 — that is what removes the off-by-one
        self.prefix = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + x

    def sum_range(self, left: int, right: int) -> int:
        # right + 1 because both ends are inclusive
        return self.prefix[right + 1] - self.prefix[left]


def run_range_sums(nums: list[int], queries: list[list[int]]) -> list[int]:
    arr = NumArray(nums)
    return [arr.sum_range(q[0], q[1]) for q in queries]`

export const alternatives: Solution[] = [
  {
    name: "Add up the range each time",
    summary:
      "Keep the array and loop from left to right on every query. Nothing is precomputed and nothing is stored, which is genuinely the right choice when there will only ever be a handful of queries — the cost is paid per question rather than up front.",
    complexity: { time: "O(n) per query", space: "O(1)" },
    python: `class NumArray:
    def __init__(self, nums: list[int]) -> None:
        self.nums = nums

    def sum_range(self, left: int, right: int) -> int:
        total = 0
        for i in range(left, right + 1):
            total += self.nums[i]
        return total


def run_range_sums(nums: list[int], queries: list[list[int]]) -> list[int]:
    arr = NumArray(nums)
    return [arr.sum_range(q[0], q[1]) for q in queries]`,
  },
  {
    name: "Cache the ranges as they are asked",
    summary:
      "Compute a range the slow way the first time and remember it in a map keyed by the pair of endpoints. Repeated queries become instant; new ones still cost a walk, and the memory grows with the number of DISTINCT questions rather than with the array.",
    complexity: { time: "O(n) on a miss, O(1) on a hit", space: "O(distinct queries)" },
    whyNow:
      "Walking the range on every query repeats the identical addition when the same range is asked twice, which real workloads do constantly. Remembering the answer removes that repetition without needing to know anything about the array.",
    python: `class NumArray:
    def __init__(self, nums: list[int]) -> None:
        self.nums = nums
        self.seen: dict[tuple[int, int], int] = {}

    def sum_range(self, left: int, right: int) -> int:
        key = (left, right)
        if key not in self.seen:
            total = 0
            for i in range(left, right + 1):
                total += self.nums[i]
            self.seen[key] = total
        return self.seen[key]


def run_range_sums(nums: list[int], queries: list[list[int]]) -> list[int]:
    arr = NumArray(nums)
    return [arr.sum_range(q[0], q[1]) for q in queries]`,
  },
]
