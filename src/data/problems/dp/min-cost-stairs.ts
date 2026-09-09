import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "min-cost-stairs",
  title: "Cheapest Way Up the Stairs",
  pattern: "dp",
  difficulty: "easy",
  leetcode: "min-cost-climbing-stairs",
  brief: "Pay to step; one or two steps at a time.",
  statement:
    "Each index of the array is a stair with a cost to step on it. From a stair you may climb one or two steps. You may start on either the first or the second stair. Return the cheapest total cost to get past the top.",
  constraints: [
    "2 <= cost.length <= 1000",
    "0 <= cost[i] <= 999",
    "you may START on index 0 or index 1, so neither is forced",
    "the goal is PAST the last stair, so the final stair's cost need not be paid",
  ],
  examples: [
    {
      input: "cost = [10, 15, 20]",
      output: "15",
      note: "Start at 15 and step two to the top.",
    },
    { input: "cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]", output: "6" },
  ],
  hints: [
    "The cheapest way to reach a stair is its own cost plus the cheaper of the two stairs that can reach it.",
    "The two starting stairs cost only themselves — nothing had to be paid to arrive.",
    "The answer is the cheaper of the last two stairs, since either can step past the top.",
  ],
  whyNow:
    "The table version is already linear, but each entry is read only by the next two steps and never again. Two variables hold exactly that much history, so the array disappears and the memory becomes constant — the same recurrence with nothing kept that is not still needed.",
  approach:
    "Carry the cheapest cost to stand on the previous stair and on the one before that. For each new stair, the cost to stand on it is its own price plus the cheaper of those two. Shift the pair forward and continue. Both starting stairs cost only themselves, which seeds the pair. Since finishing means stepping PAST the top, the answer is the cheaper of the final two stairs rather than the last one.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    two_back = cost[0]
    one_back = cost[1]
    for i in range(2, len(cost)):
        current = cost[i] + min(one_back, two_back)
        two_back = one_back
        one_back = current
    return min(one_back, two_back)`,
  java: `public int minCostClimbingStairs(int[] cost) {
    int twoBack = cost[0];
    int oneBack = cost[1];
    for (int i = 2; i < cost.length; i++) {
        int current = cost[i] + Math.min(oneBack, twoBack);
        twoBack = oneBack;
        oneBack = current;
    }
    return Math.min(oneBack, twoBack);
}`,
  cpp: `int minCostClimbingStairs(const vector<int>& cost) {
    int twoBack = cost[0];
    int oneBack = cost[1];
    for (int i = 2; i < (int)cost.size(); i++) {
        int current = cost[i] + min(oneBack, twoBack);
        twoBack = oneBack;
        oneBack = current;
    }
    return min(oneBack, twoBack);
}`,
  walkthrough: [
    {
      cells: { values: [1, 100, 1, 1, 1, 100] },
      caption: "Cost to STAND on each stair, carried in two variables.",
    },
    {
      cells: {
        values: [1, 100, 1, 1, 1, 100],
        marks: { 0: "focus", 1: "focus" },
      },
      caption: "Both starts cost only themselves: 1 and 100.",
    },
    {
      cells: {
        values: [1, 100, 1, 1, 1, 100],
        marks: { 2: "focus", 0: "compare" },
      },
      caption:
        "Stair 2: 1 + min(100, 1) = 2. The expensive stair is simply stepped over.",
    },
    {
      cells: {
        values: [1, 100, 1, 1, 1, 100],
        marks: { 3: "focus", 1: "compare", 2: "compare" },
      },
      caption: "Stair 3: 1 + min(2, 100) = 3.",
    },
    {
      cells: { values: [1, 100, 1, 1, 1, 100], marks: { 4: "done" } },
      caption:
        "Stair 4: 1 + min(3, 2) = 3. The answer is the cheaper of the last two, since either steps past the top.",
    },
  ],
  alternatives: [
    {
      name: "A table of costs",
      summary:
        "Fill an array where entry i is the cheapest cost to stand on stair i, each built from the two entries before it.",
      complexity: { time: "O(n)", space: "O(n)" },
      python: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    best = [0] * len(cost)
    best[0] = cost[0]
    best[1] = cost[1]
    for i in range(2, len(cost)):
        best[i] = cost[i] + min(best[i - 1], best[i - 2])
    return min(best[-1], best[-2])`,
      java: `public int minCostClimbingStairs(int[] cost) {
    int[] best = new int[cost.length];
    best[0] = cost[0];
    best[1] = cost[1];
    for (int i = 2; i < cost.length; i++) {
        best[i] = cost[i] + Math.min(best[i - 1], best[i - 2]);
    }
    return Math.min(best[cost.length - 1], best[cost.length - 2]);
}`,
      cpp: `int minCostClimbingStairs(const vector<int>& cost) {
    int n = (int)cost.size();
    vector<int> best(n);
    best[0] = cost[0];
    best[1] = cost[1];
    for (int i = 2; i < n; i++) {
        best[i] = cost[i] + min(best[i - 1], best[i - 2]);
    }
    return min(best[n - 1], best[n - 2]);
}`,
    },
  ],
}
