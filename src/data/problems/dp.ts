import type { Problem } from "../types"

export const dp: Problem[] = [
  {
    id: "stair-ways",
    title: "Ways to Climb Stairs",
    pattern: "dp",
    difficulty: "easy",
    brief: "Count paths up n steps taking 1 or 2 at a time.",
    statement:
      "You climb a staircase of n steps, moving up 1 or 2 steps at a time. Return how many distinct sequences of moves reach the top.",
    examples: [
      { input: "n = 4", output: "5", note: "1111, 112, 121, 211, 22." },
    ],
    hints: [
      "Your last move was either a 1-step or a 2-step. Where were you before it?",
      "ways(n) = ways(n-1) + ways(n-2) — the two cases are disjoint and exhaustive.",
      "Only the last two values are ever needed: two variables, no array.",
    ],
    approach:
      "The recurrence is Fibonacci: every route to step n arrives from n-1 (then +1) or from n-2 (then +2), and those sets never overlap. Naive recursion recomputes subproblems exponentially; iterating upward with two rolling variables computes each once. This is DP at its smallest: state = step index, transition = sum of the two predecessors.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def climb_ways(n: int) -> int:
    a, b = 1, 1  # ways(0), ways(1)
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
    walkthrough: [
      { cells: { values: [1, 1, "?", "?", "?"], labels: { 0: "w0", 1: "w1" } }, caption: "Base cases: one way to stand at the bottom, one way to reach step 1." },
      { cells: { values: [1, 1, 2, "?", "?"], marks: { 0: "compare", 1: "compare", 2: "focus" } }, caption: "ways(2) = ways(1) + ways(0) = 2." },
      { cells: { values: [1, 1, 2, 3, "?"], marks: { 1: "compare", 2: "compare", 3: "focus" } }, caption: "ways(3) = 2 + 1 = 3." },
      { cells: { values: [1, 1, 2, 3, 5], marks: { 2: "compare", 3: "compare", 4: "focus" } }, caption: "ways(4) = 3 + 2 = 5. Each cell computed once from its two predecessors." },
      { cells: { values: [1, 1, 2, 3, 5], marks: { 4: "done" } }, caption: "Answer 5 — matches the enumeration 1111, 112, 121, 211, 22." },
    ],
    alternatives: [
      {
        name: "Naive recursion",
        summary:
          "Direct translation of the recurrence. Exponential — ways(n) recomputes ways(n-2) all the way down. This is what memoization exists to fix.",
        complexity: { time: "O(2ⁿ)", space: "O(n) stack" },
        python: `def climb_ways(n: int) -> int:
    if n <= 1:
        return 1
    return climb_ways(n - 1) + climb_ways(n - 2)`,
      },
      {
        name: "Memoized recursion",
        summary:
          "Same recursion, each subproblem cached and computed once. Top-down DP — the systematic step between naive recursion and the iterative table.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `from functools import lru_cache

@lru_cache(maxsize=None)
def climb_ways(n: int) -> int:
    if n <= 1:
        return 1
    return climb_ways(n - 1) + climb_ways(n - 2)`,
      },
    ],
  },
  {
    id: "house-robber",
    title: "Non-Adjacent Maximum Take",
    pattern: "dp",
    difficulty: "medium",
    brief: "Max sum picking values with no two adjacent.",
    statement:
      "Given non-negative values in a row, choose a subset with no two adjacent elements so the sum is maximised. Return the sum.",
    examples: [
      { input: "nums = [2, 7, 9, 3, 1]", output: "12", note: "2 + 9 + 1." },
    ],
    hints: [
      "At each position: take it (plus best up to i-2) or skip it (best up to i-1).",
      "best(i) = max(best(i-1), nums[i] + best(i-2)).",
      "Two rolling variables again — the array version is training wheels.",
    ],
    approach:
      "State: best(i), the maximum sum using only the first i+1 elements. Transition: either element i is skipped (carry best(i-1)) or taken (nums[i] + best(i-2), since i-1 is then forbidden). Take the max. Roll two variables left to right; the final value is the answer.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def max_take(nums: list[int]) -> int:
    skip = take = 0  # best excluding / including previous element
    for x in nums:
        skip, take = max(skip, take), skip + x
    return max(skip, take)`,
    walkthrough: [
      { cells: { values: [2, 7, 9, 3, 1] }, caption: "Pick non-adjacent values, maximise the sum." },
      { cells: { values: [2, 7, 9, 3, 1], marks: { 0: "focus" } }, caption: "i=0: best = 2 (take it; nothing to conflict)." },
      { cells: { values: [2, 7, 9, 3, 1], marks: { 1: "focus" } }, caption: "i=1: max(skip → 2, take → 7) = 7." },
      { cells: { values: [2, 7, 9, 3, 1], marks: { 0: "done", 2: "focus" } }, caption: "i=2: max(7, 9 + 2) = 11 — take 9 with the earlier 2." },
      { cells: { values: [2, 7, 9, 3, 1], marks: { 0: "done", 2: "done", 3: "compare" } }, caption: "i=3: max(11, 3 + 7) = 11 — skipping 3 wins." },
      { cells: { values: [2, 7, 9, 3, 1], marks: { 0: "done", 2: "done", 4: "focus" } }, caption: "i=4: max(11, 1 + 11) = 12. Answer: 2 + 9 + 1." },
    ],
    alternatives: [
      {
        name: "Recursion + memo",
        summary: "best(i) tried top-down with caching. Same recurrence; the table version just removes the stack.",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `from functools import lru_cache

def max_take(nums: list[int]) -> int:
    @lru_cache(maxsize=None)
    def best(i: int) -> int:
        if i < 0:
            return 0
        return max(best(i - 1), nums[i] + best(i - 2))

    return best(len(nums) - 1)`,
      },
      {
        name: "Full table",
        summary:
          "Explicit dp array before the two-variable compression. Easier to debug and to extend (e.g. recovering WHICH elements were taken).",
        complexity: { time: "O(n)", space: "O(n)" },
        python: `def max_take(nums: list[int]) -> int:
    if not nums:
        return 0
    dp = [0] * (len(nums) + 2)
    for i, x in enumerate(nums):
        dp[i + 2] = max(dp[i + 1], x + dp[i])
    return dp[-1]`,
      },
    ],
  },
  {
    id: "coin-change-min",
    title: "Fewest Coins for Amount",
    pattern: "dp",
    difficulty: "medium",
    brief: "Minimum coins summing to a target, or -1.",
    statement:
      "Given coin denominations (unlimited supply) and an amount, return the fewest coins that sum exactly to it, or -1 if impossible.",
    examples: [
      { input: "coins = [1, 3, 4], amount = 6", output: "2", note: "3 + 3." },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    hints: [
      "Greedy (largest coin first) fails: 6 with [1,3,4] greedily takes 4+1+1 = 3 coins, but 3+3 = 2.",
      "best(a) = 1 + min(best(a - c)) over usable coins c.",
      "Fill a table from 0 upward; unreachable amounts stay at infinity.",
    ],
    approach:
      "Bottom-up table over amounts 0..amount. best(0) = 0; every other entry is 1 + the minimum over best(amount - coin) for each coin that fits, or infinity if none is reachable. The table order guarantees subproblems are ready when needed. Greedy fails here precisely because local largest-coin choices don't compose into a global optimum — the counterexample in hint 1 is worth memorizing.",
    complexity: { time: "O(amount × coins)", space: "O(amount)" },
    python: `def min_coins(coins: list[int], amount: int) -> int:
    INF = float("inf")
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return -1 if best[amount] == INF else best[amount]`,
    walkthrough: [
      { cells: { values: [0, "∞", "∞", "∞", "∞", "∞", "∞"], labels: { 0: "a=0", 6: "a=6" } }, caption: "Table over amounts 0–6. Coins: 1, 3, 4. best(0) = 0." },
      { cells: { values: [0, 1, 2, "?", "?", "?", "?"], marks: { 1: "done", 2: "done" } }, caption: "a=1: coin 1 → 1. a=2: 1+1 → 2." },
      { cells: { values: [0, 1, 2, 1, "?", "?", "?"], marks: { 3: "focus" } }, caption: "a=3: min(best(2)+1 = 3, best(0)+1 = 1) — single coin 3 wins." },
      { cells: { values: [0, 1, 2, 1, 1, 2, "?"], marks: { 4: "done", 5: "done" } }, caption: "a=4: coin 4 alone → 1. a=5: 4+1 → 2." },
      { cells: { values: [0, 1, 2, 1, 1, 2, 2], marks: { 3: "compare", 6: "focus" } }, caption: "a=6: min via coin 1 → 3, coin 3 → best(3)+1 = 2, coin 4 → best(2)+1 = 3. Answer 2 (3+3)." },
      { cells: { values: [0, 1, 2, 1, 1, 2, 2], marks: { 6: "done" } }, caption: "Greedy would have said 3 coins (4+1+1). The table says 2." },
    ],
    alternatives: [
      {
        name: "Greedy (broken)",
        summary:
          "Largest coin first. Included as a warning: for [1, 3, 4] and amount 6 it answers 3 (4+1+1) when 2 (3+3) exists. Greedy is only safe for canonical coin systems.",
        complexity: { time: "O(amount)", space: "O(1)" },
        python: `def min_coins_WRONG(coins: list[int], amount: int) -> int:
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1`,
      },
      {
        name: "BFS over amounts",
        summary:
          "Treat amounts as graph nodes, coins as edges; fewest coins = shortest path from amount to 0. Same complexity as the table, and a nice reveal that DP-minimization and BFS are cousins.",
        complexity: { time: "O(amount × coins)", space: "O(amount)" },
        python: `from collections import deque

def min_coins(coins: list[int], amount: int) -> int:
    if amount == 0:
        return 0
    seen = {amount}
    queue = deque([(amount, 0)])
    while queue:
        remaining, steps = queue.popleft()
        for c in coins:
            nxt = remaining - c
            if nxt == 0:
                return steps + 1
            if nxt > 0 and nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, steps + 1))
    return -1`,
      },
    ],
  },
]
