import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "coin-change-min",
  title: "Fewest Coins for Amount",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "coin-change",
  brief: "Minimum coins summing to a target, or -1.",
  statement:
    "Given coin denominations (unlimited supply) and an amount, return the fewest coins that sum exactly to it, or -1 if impossible.",
  constraints: [
    "1 <= coins.length <= 12",
    "1 <= coins[i] <= 2^31 - 1",
    "0 <= amount <= 10^4",
    "each coin may be used any number of times; return -1 when no combination reaches the amount",
  ],
  examples: [
    { input: "coins = [1, 3, 4], amount = 6", output: "2", note: "3 + 3." },
    { input: "coins = [2], amount = 3", output: "-1" },
  ],
  hints: [
    "Greedy (largest coin first) fails: 6 with [1,3,4] greedily takes 4+1+1 = 3 coins, but 3+3 = 2.",
    "best(a) = 1 + min(best(a - c)) over usable coins c.",
    "Fill a table from 0 upward; unreachable amounts stay at infinity.",
  ],
  whyNow:
    "BFS is correct but carries a frontier and a visited set. The same shortest path written as a table over amounts is the standard bottom-up form, and it leaves the answer readable for every amount, not only the one asked for.",
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
  java: `public int minCoins(int[] coins, int amount) {
    final int INF = Integer.MAX_VALUE/2;
    int[] best = new int[amount + 1];
    Arrays.fill(best, INF);
    best[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && best[a - c] + 1 < best[a]) {
                best[a] = best[a - c] + 1;
            }
        }
    }
    return best[amount] == INF ? -1 : best[amount];
}`,
  cpp: `int minCoins(const vector<int>& coins, int amount) {
    const int INF = INT_MAX/2;
    vector<int> best(amount + 1, INF);
    best[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && best[a - c] + 1 < best[a]) {
                best[a] = best[a - c] + 1;
            }
        }
    }
    return best[amount] == INF ? -1 : best[amount];
}`,
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
      java: `public int minCoinsWrong(int[] coins, int amount) {
    Arrays.sort(coins);
    int count = 0;
    for (int i = coins.length - 1; i >= 0; i--) {
        int c = coins[i];
        count += amount / c;
        amount %= c;
    }
    return amount == 0 ? count : -1;
}`,
      cpp: `int minCoinsWrong(const vector<int>& coins, int amount) {
    vector<int> sorted = coins;
    sort(sorted.begin(), sorted.end(), greater<int>());
    int count = 0;
    for (int c : sorted) {
        count += amount / c;
        amount %= c;
    }
    return amount == 0 ? count : -1;
}`,
    },
    {
      name: "BFS over amounts",
      whyNow:
        "Greedy is not merely slow here, it is wrong: largest-coin-first spends three coins on amount 6 with coins [1, 3, 4] (4 + 1 + 1) when two suffice (3 + 3). Treating amounts as nodes explores by number of coins, so the first time 0 is reached is the true minimum.",
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
      java: `public int minCoins(int[] coins, int amount) {
    if (amount == 0) return 0;
    Set<Integer> seen = new HashSet<>();
    Queue<int[]> queue = new LinkedList<>();
    seen.add(amount);
    queue.offer(new int[]{amount, 0});
    while (!queue.isEmpty()) {
        int[] cur = queue.poll();
        int remaining = cur[0];
        int steps = cur[1];
        for (int c : coins) {
            int nxt = remaining - c;
            if (nxt == 0) return steps + 1;
            if (nxt > 0 && !seen.contains(nxt)) {
                seen.add(nxt);
                queue.offer(new int[]{nxt, steps + 1});
            }
        }
    }
    return -1;
}
`,
      cpp: `int minCoins(const vector<int>& coins, int amount) {
    if (amount == 0) return 0;
    unordered_set<int> seen;
    queue<pair<int,int>> q;
    seen.insert(amount);
    q.push({amount, 0});
    while (!q.empty()) {
        auto cur = q.front(); q.pop();
        int remaining = cur.first;
        int steps = cur.second;
        for (int c : coins) {
            int nxt = remaining - c;
            if (nxt == 0) return steps + 1;
            if (nxt > 0 && seen.find(nxt) == seen.end()) {
                seen.insert(nxt);
                q.push({nxt, steps + 1});
            }
        }
    }
    return -1;
}
`,
    },
  ],
}
