// burst-balloons-arrows — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Sort the balloons by end and sweep, holding the position of the last arrow fired. Whenever a balloon starts strictly after that position it is still unburst and nothing already fired can reach it, so fire a new arrow at that balloon's end — the furthest right an arrow can go and still burst it, which maximises what it can also catch. Every other balloon is already covered and is skipped. The count of arrows fired is the answer, and the exchange argument is the same one interval scheduling rests on: shooting at the earliest end is never worse than shooting anywhere earlier."

export const whyNow = "Tracking the running intersection by start needs the intersection's own end kept and compared, and its correctness argument has to talk about a shrinking window. Sorting by end makes the shot position the balloon's own end, so the state is a single number and the rule is one comparison — the same algorithm with the bookkeeping removed."

export const arc = "Hold this problem next to non-overlapping-intervals and the pair teaches more than either alone: one keeps the most pairwise-disjoint intervals, the other stabs all of them with the fewest points, and both are solved by exactly the same sort-by-end sweep. That is not a coincidence — the arrows land precisely at the ends of a maximum disjoint set, so the two answers are the same number. Recognising that a covering question and a packing question are duals of each other is the transferable part, and it is why sorting by end is worth reaching for whenever a problem mentions finishing. The corner cases are the endpoint convention, which is inclusive here, and the fully disjoint input, where the answer is simply the count."

export const complexity = { time: "O(n log n)", space: "O(1) beyond the sort" }

export const python = `def find_min_arrow_shots(points: list[list[int]]) -> int:
    points = sorted(points, key=lambda p: p[1])
    arrows = 0
    shot_at = float("-inf")
    for start, end in points:
        # already burst? the last arrow is at or after this balloon's start
        if start > shot_at:
            arrows += 1
            # fire as far right as possible while still bursting this one
            shot_at = end
    return arrows`

export const alternatives: Solution[] = [
  {
    name: "One arrow each, then merge what you can",
    summary:
      "Give every balloon its own arrow, then repeatedly look for two arrows whose balloons share a point and replace them with one. It mirrors how a person would do it by hand and needs no ordering insight, at the cost of rescanning after every merge.",
    complexity: { time: "O(n^3) worst case", space: "O(n)" },
    python: `def find_min_arrow_shots(points: list[list[int]]) -> int:
    groups = [list(p) for p in points]
    changed = True
    while changed:
        changed = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                a, b = groups[i], groups[j]
                lo, hi = max(a[0], b[0]), min(a[1], b[1])
                if lo <= hi:
                    groups[i] = [lo, hi]
                    groups.pop(j)
                    changed = True
                    break
            if changed:
                break
    return len(groups)`,
  },
  {
    name: "Sort by start, shrink the intersection",
    summary:
      "Order the balloons by where they begin and carry the intersection of the group the current arrow will burst. A balloon that starts inside the intersection joins the group and narrows it; one that starts past it forces a new arrow and a fresh intersection.",
    complexity: { time: "O(n log n)", space: "O(1)" },
    whyNow:
      "Merging pairs one at a time rescans the whole list after each success, so a single arrow saved can cost another full quadratic sweep. Sorting first means each balloon is considered once and the decision is made against one running value rather than against every other balloon.",
    python: `def find_min_arrow_shots(points: list[list[int]]) -> int:
    points = sorted(points)
    arrows = 1
    cur_end = points[0][1]
    for start, end in points[1:]:
        if start <= cur_end:
            # still one group: the arrow must fall inside every member
            cur_end = min(cur_end, end)
        else:
            arrows += 1
            cur_end = end
    return arrows`,
  },
]
