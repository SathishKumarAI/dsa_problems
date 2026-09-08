import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "stair-ways",
  title: "Ways to Climb Stairs",
  pattern: "dp",
  difficulty: "easy",
  leetcode: "climbing-stairs",
  brief: "Count paths up n steps taking 1 or 2 at a time.",
  statement:
    "You climb a staircase of n steps, moving up 1 or 2 steps at a time. Return how many distinct sequences of moves reach the top.",
  constraints: [
    "1 <= n <= 45",
    "steps of 1 or 2 only",
    "n = 45 is the largest answer that fits in a 32-bit signed integer",
  ],
  examples: [{ input: "n = 4", output: "5", note: "1111, 112, 121, 211, 22." }],
  hints: [
    "Your last move was either a 1-step or a 2-step. Where were you before it?",
    "ways(n) = ways(n-1) + ways(n-2) — the two cases are disjoint and exhaustive.",
    "Only the last two values are ever needed: two variables, no array.",
  ],
  whyNow:
    "The cache holds n entries and a stack n deep for a recurrence that only ever looks back two steps. Two variables carry the same state.",
  approach:
    "The recurrence is Fibonacci: every route to step n arrives from n-1 (then +1) or from n-2 (then +2), and those sets never overlap. Naive recursion recomputes subproblems exponentially; iterating upward with two rolling variables computes each once. This is DP at its smallest: state = step index, transition = sum of the two predecessors.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def climb_ways(n: int) -> int:
    a, b = 1, 1  # ways(0), ways(1)
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
  java: `public int climbWays(int n) {
    int a = 1, b = 1;
    for (int i = 0; i < n - 1; i++) {
        int temp = b;
        b = a + b;
        a = temp;
    }
    return b;
}
`,
  cpp: `int climbWays(int n) {
    int a = 1, b = 1;
    for (int i = 0; i < n - 1; ++i) {
        int temp = b;
        b = a + b;
        a = temp;
    }
    return b;
}
`,
  walkthrough: [
    {
      cells: { values: [1, 1, "?", "?", "?"], labels: { 0: "w0", 1: "w1" } },
      caption:
        "Base cases: one way to stand at the bottom, one way to reach step 1.",
    },
    {
      cells: {
        values: [1, 1, 2, "?", "?"],
        marks: { 0: "compare", 1: "compare", 2: "focus" },
      },
      caption: "ways(2) = ways(1) + ways(0) = 2.",
    },
    {
      cells: {
        values: [1, 1, 2, 3, "?"],
        marks: { 1: "compare", 2: "compare", 3: "focus" },
      },
      caption: "ways(3) = 2 + 1 = 3.",
    },
    {
      cells: {
        values: [1, 1, 2, 3, 5],
        marks: { 2: "compare", 3: "compare", 4: "focus" },
      },
      caption:
        "ways(4) = 3 + 2 = 5. Each cell computed once from its two predecessors.",
    },
    {
      cells: { values: [1, 1, 2, 3, 5], marks: { 4: "done" } },
      caption: "Answer 5 — matches the enumeration 1111, 112, 121, 211, 22.",
    },
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
      java: `public int climbWays(int n) {
    if (n <= 1) return 1;
    return climbWays(n - 1) + climbWays(n - 2);
}`,
      cpp: `int climbWays(int n) {
    if (n <= 1) return 1;
    return climbWays(n - 1) + climbWays(n - 2);
}`,
    },
    {
      name: "Memoized recursion",
      whyNow:
        "The plain recursion recomputes the same step counts exponentially often. Caching each one makes every subproblem happen exactly once.",
      summary:
        "Same recursion, each subproblem cached and computed once. Top-down DP — the systematic step between naive recursion and the iterative table.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `from functools import lru_cache

@lru_cache(maxsize=None)
def climb_ways(n: int) -> int:
    if n <= 1:
        return 1
    return climb_ways(n - 1) + climb_ways(n - 2)`,
      java: `public int climbWays(int n) {
    java.util.Map<Integer,Integer> cache = new java.util.HashMap<>();
    return climbWaysRec(n, cache);
}
private static int climbWaysRec(int n, java.util.Map<Integer,Integer> cache) {
    if (cache.containsKey(n)) return cache.get(n);
    int result;
    if (n <= 1) {
        result = 1;
    } else {
        result = climbWaysRec(n - 1, cache) + climbWaysRec(n - 2, cache);
    }
    cache.put(n, result);
    return result;
}
`,
      cpp: `int climbWaysRec(int n, std::unordered_map<int,int>& memo) {
    auto it = memo.find(n);
    if (it != memo.end()) return it->second;
    int result;
    if (n <= 1) {
        result = 1;
    } else {
        result = climbWaysRec(n - 1, memo) + climbWaysRec(n - 2, memo);
    }
    memo[n] = result;
    return result;
}

int climbWays(int n) {
    std::unordered_map<int,int> memo;
    return climbWaysRec(n, memo);
}`,
    },
  ],
}
