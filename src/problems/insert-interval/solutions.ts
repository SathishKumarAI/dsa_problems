// insert-interval — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Walk the list once in three phases. Copy every interval that ends strictly before the newcomer starts — sortedness means none of them will ever be touched. Then, while the current interval starts at or before the newcomer's end, absorb it by widening the newcomer to min of the starts and max of the ends; when that run stops, append the widened interval. Finally copy the rest unchanged. Each interval is examined once and the phases never backtrack, so the whole insert costs one pass and no sort — the input's existing order is the thing being spent."

export const whyNow = "The binary search finds where the newcomer belongs in log n, but the merge that follows still walks forward over everything it touches, so the search saves nothing asymptotically and costs a second index to keep straight. The three-phase scan does the same work with one pointer and no boundary arithmetic to get wrong."

export const arc = "The lesson of this problem is that a guarantee on the input is a resource you can spend exactly once, and spending it well is the whole algorithm. The list arrives sorted and disjoint; the naive answer throws both away by appending and re-sorting, and pays n log n to rebuild what it was handed for free. Keep them, and the list splits into three runs where only the middle one changes — which is a shape that recurs far beyond intervals, in every problem where an update is local to a sorted structure. The corner cases are all about the empty middle run: a newcomer before everything, after everything, or fitting in a gap touches nothing, and each phase must therefore be allowed to consume zero intervals."

export const complexity = { time: "O(n)", space: "O(n) for the output" }

export const python = `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    out: list[list[int]] = []
    start, end = new_interval
    i, n = 0, len(intervals)
    # 1. everything that finishes before the newcomer begins
    while i < n and intervals[i][1] < start:
        out.append(intervals[i])
        i += 1
    # 2. everything it touches, folded into one interval
    while i < n and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    # 3. the untouched tail
    while i < n:
        out.append(intervals[i])
        i += 1
    return out`

export const alternatives: Solution[] = [
  {
    name: "Append, then merge from scratch",
    summary:
      "Push the new interval onto the list, sort the whole thing by start, and run the standard merge sweep. It reuses an algorithm you already have and is the right first answer in an interview — but it re-establishes an order the input already guaranteed.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    python: `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    out: list[list[int]] = []
    for start, end in sorted(intervals + [new_interval]):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out`,
  },
  {
    name: "Binary search the slot, then merge forward",
    summary:
      "The list is sorted, so the newcomer's position can be found in logarithmic time rather than by scanning. Copy the prefix, then merge forward from that position while the intervals keep touching. The search is exact; what follows is the same linear merge.",
    complexity: { time: "O(n) — the search is log n, the copy is not", space: "O(n)" },
    whyNow:
      "Sorting a list that arrives sorted is paying n log n for a promise already in hand. Using the order instead of rebuilding it drops the dominant cost, and the merge that remains is linear.",
    python: `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    start, end = new_interval
    lo, hi = 0, len(intervals)
    # first index whose END reaches the newcomer's start: everything before
    # it is finished and can be copied untouched
    while lo < hi:
        mid = (lo + hi) // 2
        if intervals[mid][1] < start:
            lo = mid + 1
        else:
            hi = mid
    out = list(intervals[:lo])
    i = lo
    while i < len(intervals) and intervals[i][0] <= end:
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    out.extend(intervals[i:])
    return out`,
  },
]
