// non-overlapping-intervals — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Sort by end and sweep, keeping a running mark at the end of the last interval kept. Take an interval when its start is at or after that mark, and advance the mark to its end; otherwise it clashes with something already kept, so count it as removed. Sorting by end is what makes the local choice safe: among all intervals that could come next, the one finishing earliest leaves every later interval at least as much room, so an exchange argument says no optimal solution is ever lost by taking it. The answer is the number of intervals the sweep rejected."

export const whyNow = "The quadratic chain search is a correct dynamic program, and on 10^5 intervals it is 10^10 comparisons. The greedy rule reaches the same longest chain in one pass after the sort, because sorting by end makes the locally earliest finish provably part of some optimal chain — the DP is exploring choices the exchange argument has already ruled out."

export const arc = "This is the interval-scheduling theorem in disguise, and the reason to learn it is the proof rather than the code: among the intervals still available, the one that ends earliest can always be taken, because swapping it into any optimal solution in place of that solution's first interval leaves the rest of the solution still valid. That is an exchange argument, and it is the only thing separating a greedy algorithm that is correct from one that merely passes the examples. Notice too that the problem asks for a minimum to remove and the clean rule is about a maximum to keep — restating a question as its complement is often what makes the greedy choice visible. The corner case here is the convention: touching is allowed, so the test is start >= last_end and not start > last_end."

export const complexity = { time: "O(n log n)", space: "O(1) beyond the sort" }

export const python = `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    # sort by END: the interval that finishes earliest leaves the most room
    intervals = sorted(intervals, key=lambda iv: iv[1])
    kept = 0
    last_end = float("-inf")
    for start, end in intervals:
        # >= and not >: touching is not overlapping in this problem
        if start >= last_end:
            kept += 1
            last_end = end
    return len(intervals) - kept`

export const alternatives: Solution[] = [
  {
    name: "Try every subset",
    summary:
      "Enumerate all 2^n subsets of the intervals, keep the ones whose members are pairwise disjoint, and report the size of the largest. It is the definition of the answer typed out, which makes it a useful thing to have written once and a hopeless thing to run past about twenty intervals.",
    complexity: { time: "O(2^n * n^2)", space: "O(n)" },
    python: `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    n = len(intervals)
    best = 0
    for mask in range(1 << n):
        chosen = [intervals[i] for i in range(n) if mask >> i & 1]
        ok = True
        for a in range(len(chosen)):
            for b in range(a + 1, len(chosen)):
                x, y = chosen[a], chosen[b]
                if x[0] < y[1] and y[0] < x[1]:
                    ok = False
                    break
            if not ok:
                break
        if ok and len(chosen) > best:
            best = len(chosen)
    return n - best`,
  },
  {
    name: "Longest chain by dynamic programming",
    summary:
      "Sort by start, then let best[i] be the longest disjoint chain ending at interval i, computed by looking back at every earlier interval that finishes by the time i begins. It is the longest-increasing-subsequence shape and it is genuinely correct on every input.",
    complexity: { time: "O(n^2)", space: "O(n)" },
    whyNow:
      "Enumerating subsets re-checks the same pairs inside exponentially many different sets. Fixing an order and asking only for the best chain ENDING at each interval reuses those answers, which collapses the exponential into a table of n entries.",
    python: `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    intervals = sorted(intervals)
    n = len(intervals)
    best = [1] * n
    for i in range(n):
        for j in range(i):
            if intervals[j][1] <= intervals[i][0] and best[j] + 1 > best[i]:
                best[i] = best[j] + 1
    return n - max(best, default=0)`,
  },
]
