// combination-sum — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Recurse carrying the remaining target and the index from which candidates may still be chosen. At each step, loop from that index onwards: subtract the candidate, append it, recurse with the SAME index so it can be reused, then undo. Record an answer when the remainder hits exactly zero, and abandon the branch the moment it goes negative — sound only because every candidate is positive, so a remainder can never come back up. Never looking at earlier indices is what keeps [2,2,3] and [2,3,2] from both appearing."

export const whyNow = "Sorting first allows an even earlier exit — break out of the loop at the first candidate too large, rather than testing each one — and it costs a sort. The unsorted version already prunes every dead branch at the moment it dies, which is the part that matters; the sort is a constant-factor improvement worth knowing but not worth the ordering assumption by default."

export const arc = "This is where backtracking stops being enumeration and becomes search. The skeleton is the same as subsets, but two rules are added and each has a precondition worth stating aloud. Recursing on the same index permits reuse; refusing to look back at earlier indices makes every combination appear in exactly one order, which is how the uniqueness requirement is met without a set of seen answers. The pruning — abandon the branch when the remainder goes negative — is sound only because the candidates are positive, and that is the kind of assumption to check rather than absorb. Allow a negative candidate and the remainder can rise again, the prune becomes wrong, and the problem turns into something else entirely."

export const complexity = { time: "O(n^(target/min candidate))", space: "O(target/min candidate) of recursion" }

export const python = `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    out: list[list[int]] = []
    current: list[int] = []

    def explore(start: int, remaining: int) -> None:
        if remaining == 0:
            out.append(list(current))
            return
        if remaining < 0:
            # sound ONLY because every candidate is positive
            return
        for i in range(start, len(candidates)):
            current.append(candidates[i])
            # same index, not i + 1: a candidate may be reused
            explore(i, remaining - candidates[i])
            current.pop()

    explore(0, target)
    return out`

export const alternatives: Solution[] = [
  {
    name: "Build every sequence, then deduplicate",
    summary:
      "Generate all sequences that reach the target in any order, sort each one and drop the repeats with a set. It gets the right answer and spends most of its effort producing the same combination over and over in different orders.",
    complexity: { time: "exponential, with a large constant", space: "O(number of sequences)" },
    python: `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    seen: set[tuple[int, ...]] = set()

    def build(current: list[int], remaining: int) -> None:
        if remaining == 0:
            seen.add(tuple(sorted(current)))
            return
        if remaining < 0:
            return
        for c in candidates:  # every candidate every time, order included
            current.append(c)
            build(current, remaining - c)
            current.pop()

    build([], target)
    return [list(t) for t in seen]`,
  },
  {
    name: "Decide each candidate: skip it, or take one more",
    summary:
      "At each step make a binary choice — move past this candidate for good, or take one copy of it and stay. Each combination is produced once without any start-index reasoning, at the cost of a deeper recursion than the loop version.",
    complexity: { time: "O(2^(target/min candidate))", space: "O(target) of recursion" },
    whyNow:
      "Producing every order and then collapsing duplicates does factorial work to emit one answer, and the deduplication hides how much was wasted. Deciding each candidate once in a fixed order means each combination is reached by exactly one path.",
    python: `def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    out: list[list[int]] = []
    current: list[int] = []

    def explore(i: int, remaining: int) -> None:
        if remaining == 0:
            out.append(list(current))
            return
        if remaining < 0 or i == len(candidates):
            return
        explore(i + 1, remaining)          # skip this candidate for good
        current.append(candidates[i])
        explore(i, remaining - candidates[i])  # take one more of it
        current.pop()

    explore(0, target)
    return out`,
  },
]
