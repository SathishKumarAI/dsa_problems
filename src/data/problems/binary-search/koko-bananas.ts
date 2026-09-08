import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "koko-bananas",
  title: "Slowest Sufficient Eating Speed",
  pattern: "binary-search",
  difficulty: "medium",
  leetcode: "koko-eating-bananas",
  brief: "Binary search the answer, not the array.",
  statement:
    "Given piles of bananas and h hours, choose the smallest integer speed k (bananas/hour) so all piles can be finished within h hours. Each hour you eat from one pile only; a pile of p bananas takes ceil(p / k) hours.",
  constraints: [
    "1 <= piles.length <= 10^4",
    "piles.length <= h <= 10^9",
    "1 <= piles[i] <= 10^9",
    "one pile per hour at most: an hour spent on a pile smaller than the speed is still a whole hour",
  ],
  examples: [{ input: "piles = [3, 6, 7, 11], h = 8", output: "4" }],
  hints: [
    'The check "can speed k finish in h hours?" is monotonic: if k works, every faster speed works.',
    "Monotonic yes/no over a numeric range = binary search over that range.",
    'Range is [1, max(piles)]. Find the leftmost "yes".',
  ],
  whyNow:
    "Trying speeds one at a time walks a range as wide as the largest pile. Feasibility only ever flips from no to yes once, so the answer can be binary-searched over the speed rather than over positions.",
  approach:
    "Instead of searching positions, search candidate speeds. hours(k) = Σ ceil(pile/k) is non-increasing in k, so feasibility flips from no to yes exactly once. Binary search the boundary: if hours(mid) ≤ h, mid is feasible — try slower (hi = mid); otherwise lo = mid + 1. This 'search the answer space' framing generalizes to shipping capacities, split arrays, and similar minimization problems.",
  complexity: { time: "O(n log max(piles))", space: "O(1)" },
  python: `import math

def min_eating_speed(piles: list[int], h: int) -> int:
    def hours(k: int) -> int:
        return sum(math.ceil(p / k) for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
  java: `public int minEatingSpeed(int[] piles, int h) {
    int lo = 1;
    int hi = 0;
    for (int p : piles) if (p > hi) hi = p;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        long total = 0;
        for (int p : piles) total += (p + mid - 1) / mid;
        if (total <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
`,
  cpp: `int minEatingSpeed(const vector<int>& piles, int h) {
    int lo = 1;
    int hi = 0;
    for (int p : piles) if (p > hi) hi = p;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        long long total = 0;
        for (int p : piles) total += (p + mid - 1) / mid;
        if (total <= h) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
`,
  walkthrough: [
    {
      text: "piles = [3, 6, 7, 11]   h = 8\nspeed k range: 1 .. 11\n\nfeasible(k) is monotonic:\nno no no YES YES YES ...\n         ^ find this boundary",
      caption: "The answer space, not the array, is what we search.",
    },
    {
      text: "k = 6  →  ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6)\n       =  1 + 1 + 2 + 2 = 6 hours ≤ 8   ✓\n\nrange: 1 .. 6",
      caption: "mid = 6 works — try slower speeds, keep 6 in range.",
    },
    {
      text: "k = 3  →  1 + 2 + 3 + 4 = 10 hours > 8   ✗\n\nrange: 4 .. 6",
      caption: "mid = 3 too slow — go right: lo = 4.",
    },
    {
      text: "k = 5  →  1 + 2 + 2 + 3 = 8 hours ≤ 8   ✓\nrange: 4 .. 5\n\nk = 4  →  1 + 2 + 2 + 3 = 8 hours ≤ 8   ✓\nrange: 4 .. 4",
      caption: "5 works, then 4 works. Range closes.",
    },
    {
      text: "answer: k = 4\n\nno  no  no  YES YES ...\n 1   2   3   4   5\n             ^ leftmost yes",
      caption: "Smallest feasible speed found in O(log 11) checks.",
    },
  ],
  alternatives: [
    {
      name: "Try every speed",
      summary:
        "Test k = 1, 2, 3, … until one fits within h hours. The first success is the answer — correct because feasibility is monotonic, slow because the range can be huge.",
      complexity: { time: "O(n · max(piles))", space: "O(1)" },
      python: `import math

def min_eating_speed(piles: list[int], h: int) -> int:
    k = 1
    while sum(math.ceil(p / k) for p in piles) > h:
        k += 1
    return k`,
      java: `public int minEatingSpeed(int[] piles, int h) {
    int k = 1;
    while (true) {
        int total = 0;
        for (int p : piles) {
            total += (p + k - 1) / k;
        }
        if (total <= h) break;
        k++;
    }
    return k;
}`,
      cpp: `int minEatingSpeed(const vector<int>& piles, int h) {
    int k = 1;
    while (true) {
        long long total = 0;
        for (int p : piles) {
            total += (p + k - 1) / k;
        }
        if (total <= h) break;
        ++k;
    }
    return k;
}`,
    },
  ],
}
