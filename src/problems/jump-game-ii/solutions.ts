// jump-game-ii — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Think of the indices in levels, where level k is everything reachable in exactly k jumps. Sweep left to right carrying two markers: the end of the current level and the furthest index anything scanned so far can reach. At each index, extend the furthest reach; when the scan arrives at the end of the current level, a jump has been spent and the next level ends at that furthest reach. The count of boundary crossings is the answer. It is a breadth-first search over ranges rather than nodes, which is why it costs one pass instead of a queue."

export const whyNow = "The dynamic program computes the best count for every index by looking back at every earlier index that can reach it, which does quadratic work to discover something the ranges already imply: all the indices in one level share a count. Tracking the level boundary produces the same answers with two variables."

export const arc = "It is worth seeing why the obvious greedy — always jump as far as you can — is wrong, and why the level sweep, which looks like the same idea, is right. Jumping furthest commits to a landing index; the sweep commits to nothing, and instead asks what the whole current level can reach before spending a jump. That reframing from best next POSITION to best next RANGE is exactly what breadth-first search does with layers, and recognising it here saves you from both the quadratic table and the plausible-but-wrong greedy. The corner case that catches almost everyone is the single-element array: the loop must stop before the last index, because arriving there is not a jump."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def jump(nums: list[int]) -> int:
    jumps = 0
    level_end = 0   # last index reachable with the jumps spent so far
    furthest = 0    # furthest anything in this level can reach
    # stop BEFORE the last index: arriving there is not a jump
    for i in range(len(nums) - 1):
        furthest = max(furthest, i + nums[i])
        if i == level_end:
            jumps += 1
            level_end = furthest
    return jumps`

export const alternatives: Solution[] = [
  {
    name: "Try every jump length",
    summary:
      "Recursively try every legal hop from each index and keep the shallowest path that reaches the end. It explores the same indices through every route that arrives at them, which is exponential and is the reason the table below exists.",
    complexity: { time: "O(k^n)", space: "O(n) stack" },
    python: `def jump(nums: list[int]) -> int:
    n = len(nums)

    def best_from(i: int) -> float:
        if i >= n - 1:
            return 0
        best = float("inf")
        for step in range(1, nums[i] + 1):
            best = min(best, 1 + best_from(i + step))
        return best

    return int(best_from(0))`,
  },
  {
    name: "A table of best counts",
    summary:
      "Let best[i] be the fewest jumps to reach index i, filled left to right by relaxing every index each position can reach. It is a clean shortest-path computation on a small graph and it is correct on every input, at a quadratic cost.",
    complexity: { time: "O(n^2)", space: "O(n)" },
    whyNow:
      "The recursion recomputes the answer for an index once per route that arrives at it, and there are exponentially many routes. Storing each index's best count computes it exactly once.",
    python: `def jump(nums: list[int]) -> int:
    n = len(nums)
    best = [0] + [n] * (n - 1)  # n is larger than any real answer
    for i in range(n):
        for step in range(1, nums[i] + 1):
            j = i + step
            if j < n and best[i] + 1 < best[j]:
                best[j] = best[i] + 1
    return best[n - 1]`,
  },
]
