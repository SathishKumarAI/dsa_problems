// merge-intervals — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Sort the intervals by start, then sweep once carrying the stretch currently being built. For each interval in order, either its start is at most the current end — in which case it overlaps and the stretch simply extends to max(current end, this end) — or it starts strictly after, in which case the current stretch can never grow again and is emitted, with this interval becoming the new one. Sorting is what makes the local test sufficient: once the starts ascend, nothing later can begin before the current stretch did, so the only question is whether it begins before the current stretch ended."

export const whyNow = "Painting the line answers the question by walking the coordinate space, so its cost is the SPREAD of the numbers and not how many there are: two intervals [0, 1000000000] and [0, 1] cost a billion steps. Sorting brings overlapping intervals next to each other and the cost finally follows the input's length."

export const arc = "Every interval problem is the same trick twice: find the order in which a local test becomes a global one, and then keep exactly enough state to run that test. Here the order is by start, and the state is one open stretch — because once the starts ascend, an interval that does not touch the stretch in front of it can never touch anything behind it either. The habit worth taking away is to ask what an ordering BUYS before reaching for it: sorting is not a step in this algorithm, it is the reason the one-pass sweep is correct at all. The corner cases are the two that ordering does not fix — touching endpoints, where the comparison must be <= and not <, and full containment, where the merged end is a max and not an assignment."

export const complexity = { time: "O(n log n)", space: "O(n) for the output, O(1) beyond it" }

export const python = `def merge(intervals: list[list[int]]) -> list[list[int]]:
    out: list[list[int]] = []
    for start, end in sorted(intervals):
        # sorted by start, so anything overlapping the open stretch is next
        if out and start <= out[-1][1]:
            # max, NOT assignment: [1,10] then [2,3] still ends at 10
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out`

export const alternatives: Solution[] = [
  {
    name: "Merge any overlapping pair, repeatedly",
    summary:
      "Scan every pair looking for two intervals that overlap, replace them with their union, and start again. Stop when a full scan finds no overlapping pair. It is a direct transcription of the definition and needs no insight at all, which is exactly why it is the rung to leave behind.",
    complexity: { time: "O(n^3) worst case", space: "O(n)" },
    python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    work = [list(iv) for iv in intervals]
    changed = True
    while changed:
        changed = False
        for i in range(len(work)):
            for j in range(i + 1, len(work)):
                a, b = work[i], work[j]
                if a[0] <= b[1] and b[0] <= a[1]:
                    work[i] = [min(a[0], b[0]), max(a[1], b[1])]
                    work.pop(j)
                    changed = True
                    break
            if changed:
                break
    return sorted(work)`,
  },
  {
    name: "Paint the number line",
    summary:
      "Mark every point covered by any interval on one flat array spanning the smallest start to the largest end, then read the merged stretches straight off it. Correct, and its cost is the size of the coordinate space rather than the number of intervals.",
    complexity: { time: "O(n + range)", space: "O(range)" },
    whyNow:
      "Re-scanning after every merge means a single union can force another full pass over all the pairs, so the work compounds instead of being spent once. Painting touches each interval once and each coordinate once, which is at least linear in something rather than cubic in the input.",
    python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    lo = min(s for s, _ in intervals)
    hi = max(e for _, e in intervals)
    covered = [False] * (hi - lo + 1)
    for s, e in intervals:
        for v in range(s, e + 1):
            covered[v - lo] = True
    out: list[list[int]] = []
    v = lo
    while v <= hi:
        if not covered[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and covered[v - lo]:
            v += 1
        out.append([start, v - 1])
    return out`,
  },
  {
    name: "Sweep the endpoints",
    summary:
      "Turn each interval into two events — a start that opens one, an end that closes one — sort the events, and walk them carrying a count of how many intervals are currently open. A stretch runs from the event that lifts the count off zero to the one that returns it there. It generalises: the same sweep answers how many overlap at the busiest moment.",
    complexity: { time: "O(n log n)", space: "O(n)" },
    whyNow:
      "The painted line walks the coordinate SPACE, so a pair of intervals spanning a billion values costs a billion steps and cannot be allocated at all on real bounds. Sorting the 2n endpoints makes the cost follow the number of intervals instead of the size of the numbers inside them.",
    python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    events: list[tuple[int, int]] = []
    for s, e in intervals:
        # +1 opens, -1 closes; the -1 sorts AFTER the +1 at an equal
        # coordinate so that touching intervals fuse rather than split
        events.append((s, 1))
        events.append((e, -1))
    events.sort(key=lambda ev: (ev[0], -ev[1]))
    out: list[list[int]] = []
    open_count = 0
    start = 0
    for pos, kind in events:
        if open_count == 0:
            start = pos
        open_count += kind
        if open_count == 0:
            out.append([start, pos])
    return out`,
  },
]
