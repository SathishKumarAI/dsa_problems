// permutations — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Recurse carrying the arrangement built so far and a set of which elements are already used. At each level try every unused element in turn: mark it, append it, recurse, then unmark and remove it. Record an answer only when the arrangement reaches full length, because a partial ordering is not a permutation. The used-marker replaces the start index of the subsets skeleton — that single substitution is what turns combinations into permutations, since an element passed over at one depth remains available at the next."

export const whyNow = "Filtering the full product of positions checks n^n candidates to find n! valid ones, which is over 46,000 rejections for six elements. Marking an element used prunes the whole branch at the moment of the choice, so no invalid arrangement is ever built at all."

export const arc = "Put this beside subsets and the pattern becomes a template rather than two tricks. Both are choose-recurse-un-choose; they differ in exactly two places, and each place answers a question worth asking of any backtracking problem. Where do I record an answer — every node, or only at full depth? And what stays available after a choice — only what comes after it, or everything not yet used? Answer those two and the code writes itself. The swap-in-place variant is worth knowing as well, since it needs no extra marker and no copying, at the price of an order that is harder to predict. Duplicates change the problem and the fix is not more recursion: sort first, then skip an element equal to the previous one that has not been used at this level."

export const complexity = { time: "O(n * n!)", space: "O(n) of recursion beyond the output" }

export const python = `def permute(nums: list[int]) -> list[list[int]]:
    out: list[list[int]] = []
    current: list[int] = []
    used = [False] * len(nums)

    def explore() -> None:
        if len(current) == len(nums):
            # only at full depth: a partial ordering is not a permutation
            out.append(list(current))
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            current.append(x)
            explore()
            current.pop()
            used[i] = False

    explore()
    return out`

export const alternatives: Solution[] = [
  {
    name: "Generate everything, keep what is valid",
    summary:
      "Build every sequence of n positions drawn from n elements — n^n of them — and keep the ones that use each element exactly once. It reaches the right answer by filtering rather than by choosing, and rejects the overwhelming majority of what it builds.",
    complexity: { time: "O(n^n * n)", space: "O(n)" },
    python: `def permute(nums: list[int]) -> list[list[int]]:
    n = len(nums)
    out: list[list[int]] = []

    def build(seq: list[int]) -> None:
        if len(seq) == n:
            if len(set(seq)) == n:
                out.append(list(seq))
            return
        for x in nums:
            seq.append(x)
            build(seq)
            seq.pop()

    build([])
    return out`,
  },
  {
    name: "Insert each element everywhere",
    summary:
      "Take the permutations of the first k elements and produce those of k+1 by inserting the new element at every position of each. It builds the answer level by level with no marker to maintain, and copies every arrangement once per insertion point.",
    complexity: { time: "O(n * n!)", space: "O(n * n!)" },
    whyNow:
      "Generating n^n sequences and filtering spends almost all its work on candidates that repeat an element — a fact known at the moment of the choice, not at the end. Building only from valid arrangements never constructs an invalid one.",
    python: `def permute(nums: list[int]) -> list[list[int]]:
    out: list[list[int]] = [[]]
    for x in nums:
        grown: list[list[int]] = []
        for perm in out:
            for i in range(len(perm) + 1):
                grown.append(perm[:i] + [x] + perm[i:])
        out = grown
    return out`,
  },
]
