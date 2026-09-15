// subsets — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The top-level block is
// the rung the page recommends; `alternatives` is worst -> best beneath it.
//
// Python only for now. Java and C++ are optional until a problem has a journey
// (`problems.test.ts` holds that line), and `scripts/localsmith` backfills
// them — a translation nobody has run is not content, it is a claim.

import type { Solution } from "../../data/types.ts"

export const approach = "Walk the elements with a recursive function carrying the subset built so far, and record that subset the moment the function is entered — every node of the decision tree is an answer, not merely the leaves. Then for each remaining element, choose it, recurse on what follows it, and un-choose it before trying the next; starting the inner loop at the current index is what prevents the same subset being produced in a different order. The undo after the recursion is the backtracking step, and it is what lets one shared list serve every branch instead of a copy per call."

export const whyNow = "Building from bit masks is genuinely elegant and it is capped at the word size, so it stops working past about 30 elements and has nowhere to put a constraint. The recursion carries a partial answer, which means a rule like 'stop when the sum exceeds the target' has somewhere to live — and that is what every harder problem in this pattern needs."

export const arc = "Subsets is the backtracking skeleton with nothing else attached, so it is the one to know cold: choose, recurse, un-choose. Two details generalise past this problem. The first is where you record an answer — at every node for subsets, at the leaves only for permutations — and getting that wrong is the most common bug in the whole pattern. The second is the start index in the loop, which is what distinguishes a combination, where order does not matter, from a permutation, where it does; the same code with a start index of zero and a used-marker produces permutations instead. Once the skeleton is automatic, harder problems differ only in the pruning rule you add to it, which is exactly what combination sum and word search are."

export const complexity = { time: "O(n * 2^n)", space: "O(n) of recursion beyond the output" }

export const python = `def subsets(nums: list[int]) -> list[list[int]]:
    out: list[list[int]] = []
    current: list[int] = []

    def explore(start: int) -> None:
        # record at EVERY node: each partial subset is itself an answer
        out.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])       # choose
            explore(i + 1)                # recurse on what follows
            current.pop()                 # un-choose

    explore(0)
    return out`

export const alternatives: Solution[] = [
  {
    name: "Grow the answer element by element",
    summary:
      "Start with the empty subset and, for each element, add a copy of every subset so far with that element appended. The list doubles each round, which makes the exponential growth impossible to miss — and it never says which element is being decided.",
    complexity: { time: "O(n * 2^n)", space: "O(n * 2^n)" },
    python: `def subsets(nums: list[int]) -> list[list[int]]:
    out: list[list[int]] = [[]]
    for x in nums:
        out = out + [subset + [x] for subset in out]
    return out`,
  },
  {
    name: "Count in binary",
    summary:
      "Every subset corresponds to an n-bit number, where bit i means element i is in. Counting from 0 to 2^n - 1 and reading the bits enumerates all of them exactly once, with no recursion and no intermediate lists.",
    complexity: { time: "O(n * 2^n)", space: "O(1) beyond the output" },
    whyNow:
      "Doubling the list rebuilds and copies every subset produced so far on each round, so the intermediate lists cost as much as the answer does. Counting produces each subset once, directly, and holds nothing between them.",
    python: `def subsets(nums: list[int]) -> list[list[int]]:
    n = len(nums)
    out: list[list[int]] = []
    for mask in range(1 << n):
        # bit i set means element i is in this subset
        out.append([nums[i] for i in range(n) if mask >> i & 1])
    return out`,
  },
]
